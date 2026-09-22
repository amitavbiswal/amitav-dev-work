// =====================================================================
// Chem3D — a small toolkit on top of three.js (js/vendor/three.min.js, global THREE)
// for the 3D chemistry tutorial scenes.
//
// A scene function is `(el, api) => cleanup`, exactly like a 2D `mount` scene, and is
// attached to an existing tutorial step (by index) with:
//
//   addTutorialScenes3D('chemistry', 'atoms', [ scene0, scene1, ... ]);   // null/undefined = keep 2D
//
// Build a scene with Chem3D.define(options, build):
//
//   Chem3D.define({ distance: 9, pitch: 0.35, yaw: 0.6, autoRotate: 0.25 }, (view, ctx) => {
//     const o = view.atom('O', [0, 0, 0]);
//     const h1 = view.atom('H', [0.9, -0.6, 0]), h2 = view.atom('H', [-0.9, -0.6, 0]);
//     view.bond(o, h1); view.bond(o, h2);
//     view.label('Water', [0, 1.2, 0]);
//     const row = ctx.controls('<button class="scene-btn">Go</button>');   // optional DOM controls under the canvas
//     view.run((t, dt) => { h1.position.y = -0.6 + 0.05 * Math.sin(t * 3); view.updateBonds(); });
//     return () => { /* optional extra cleanup */ };
//   })
//
// `view.run(fn)` calls fn(t, dt) every frame while the tutorial is NOT paused (and once
// immediately so a paused / reduced-motion scene still shows a picture), then renders.
// The user can always drag to rotate (double-click resets), even while paused.
// If WebGL is unavailable or a 3D scene throws, the player silently falls back to the
// original flat scene of that step.
// =====================================================================

const Chem3D = (() => {
  let webglOk = null;

  function supported() {
    if (webglOk !== null) return webglOk;
    try {
      if (typeof THREE === 'undefined') { webglOk = false; return false; }
      const c = document.createElement('canvas');
      webglOk = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { webglOk = false; }
    return webglOk;
  }

  // Element colours (CPK-like) and visual radii (not to scale — chosen to look good).
  const COLORS = {
    H: '#e2e8f0', He: '#d9ffff', Li: '#cc80ff', Be: '#c2ff00', B: '#ffb5b5', C: '#4b5563', N: '#3b82f6', O: '#ef4444',
    F: '#90e050', Ne: '#b3e3f5', Na: '#8b5cf6', Mg: '#22c55e', Al: '#bfa6a6', Si: '#f0c8a0', P: '#f97316', S: '#eab308',
    Cl: '#22c55e', Ar: '#80d1e3', K: '#a855f7', Ca: '#3dff00', Fe: '#b45309', Cu: '#c2410c', Au: '#eab308', Br: '#a62929'
  };
  const RADII = { H: 0.34, He: 0.4, C: 0.52, N: 0.5, O: 0.5, F: 0.46, Ne: 0.5, Na: 0.72, Mg: 0.66, Cl: 0.68, S: 0.62, P: 0.6, K: 0.85, Ca: 0.78, Si: 0.6, Al: 0.62, Li: 0.6 };
  const color = sym => COLORS[sym] || '#94a3b8';
  const radius = sym => RADII[sym] || 0.55;

  function create(el, api, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'c3d-wrap';
    const hint = document.createElement('div');
    hint.className = 'c3d-hint';
    hint.textContent = '3D · drag to rotate · double-click to reset';
    el.innerHTML = '';
    el.appendChild(wrap);
    wrap.appendChild(hint);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = renderer.domElement;
    wrap.insertBefore(canvas, hint);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(opts.fov || 40, 5 / 3, 0.1, 200);
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(4, 7, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbfd4ff, 0.9);
    fill.position.set(-5, -2, -4);
    scene.add(fill);

    const cam = {
      yaw: opts.yaw != null ? opts.yaw : 0.5,
      pitch: opts.pitch != null ? opts.pitch : 0.3,
      distance: opts.distance || 9,
      target: new THREE.Vector3(...(opts.target || [0, 0, 0]))
    };
    const camHome = { yaw: cam.yaw, pitch: cam.pitch, distance: cam.distance };
    let autoRotate = opts.autoRotate != null ? opts.autoRotate : 0.3;   // radians per second; 0 = off
    let idleUntil = 0;                                                  // pause auto-rotate briefly after a drag

    const geoCache = new Map();
    const geo = (key2, make) => { if (!geoCache.has(key2)) geoCache.set(key2, make()); return geoCache.get(key2); };
    const disposables = [];
    const frameFns = [];
    const bonds = [];
    let disposed = false;

    function applyCamera() {
      const cp = Math.cos(cam.pitch);
      camera.position.set(
        cam.target.x + cam.distance * cp * Math.sin(cam.yaw),
        cam.target.y + cam.distance * Math.sin(cam.pitch),
        cam.target.z + cam.distance * cp * Math.cos(cam.yaw)
      );
      camera.lookAt(cam.target);
    }

    function render() {
      if (disposed) return;
      applyCamera();
      renderer.render(scene, camera);
    }

    function resize() {
      if (disposed) return;
      const r = wrap.getBoundingClientRect();
      const w = Math.max(60, Math.floor(r.width)), h = Math.max(60, Math.floor(r.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    }
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(resize); ro.observe(wrap); }
    else window.addEventListener('resize', resize);

    // ---- pointer controls: drag = rotate, pinch = zoom, double-click = reset ----
    const pointers = new Map();
    let lastPinch = 0;
    canvas.addEventListener('pointerdown', ev => {
      canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
      pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      canvas.style.cursor = 'grabbing';
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; lastPinch = Math.hypot(a.x - b.x, a.y - b.y); }
    });
    canvas.addEventListener('pointermove', ev => {
      const p = pointers.get(ev.pointerId);
      if (!p) return;
      if (pointers.size === 1) {
        cam.yaw -= (ev.clientX - p.x) * 0.012;
        cam.pitch = Math.max(-1.35, Math.min(1.35, cam.pitch + (ev.clientY - p.y) * 0.01));
        idleUntil = performance.now() + 2500;
      }
      p.x = ev.clientX; p.y = ev.clientY;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch) cam.distance = Math.max(2.5, Math.min(40, cam.distance * (lastPinch / d)));
        lastPinch = d;
      }
      render();
    });
    const endPointer = ev => { pointers.delete(ev.pointerId); if (!pointers.size) canvas.style.cursor = 'grab'; lastPinch = 0; };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('dblclick', () => { cam.yaw = camHome.yaw; cam.pitch = camHome.pitch; cam.distance = camHome.distance; render(); });
    canvas.style.cursor = 'grab';

    const view = {
      THREE, scene, camera, renderer, canvas, wrap, cam,
      COLORS, color, radius,
      render, resize,
      set autoRotate(v) { autoRotate = v; },
      get autoRotate() { return autoRotate; },
      setCamera(o) { Object.assign(cam, o); if (o.target) cam.target = new THREE.Vector3(...o.target); Object.assign(camHome, { yaw: cam.yaw, pitch: cam.pitch, distance: cam.distance }); render(); },

      // ---- materials / primitives ----
      mat(col, o) {
        o = o || {};
        const m = new THREE.MeshPhongMaterial({
          color: new THREE.Color(col), shininess: o.shininess != null ? o.shininess : 70, specular: new THREE.Color(o.specular || '#555555'),
          transparent: o.opacity != null && o.opacity < 1, opacity: o.opacity != null ? o.opacity : 1,
          side: o.doubleSide ? THREE.DoubleSide : THREE.FrontSide, depthWrite: o.depthWrite !== false && !(o.opacity != null && o.opacity < 0.6)
        });
        if (o.emissive) m.emissive = new THREE.Color(o.emissive);
        disposables.push(m);
        return m;
      },
      sphere(r, col, o) {
        const mesh = new THREE.Mesh(geo('sphere', () => new THREE.SphereGeometry(1, 36, 24)), view.mat(col, o));
        mesh.scale.setScalar(r);
        if (o && o.pos) mesh.position.set(...o.pos);
        scene.add(mesh);
        return mesh;
      },
      atom(sym, pos, o) {
        o = o || {};
        const mesh = view.sphere(o.radius || radius(sym), o.color || color(sym), o);
        if (pos) mesh.position.set(...pos);
        mesh.userData.symbol = sym;
        if (o.label) {
          const s = view.label(o.label === true ? sym : o.label, [0, 0, 0], { size: o.labelSize || 0.7, color: o.labelColor || '#ffffff', bold: true });
          mesh.add(s); s.scale.multiplyScalar(1 / mesh.scale.x);
          mesh.userData.labelSprite = s;
        }
        return mesh;
      },
      cylinder(a, b, r, col, o) {
        const m = new THREE.Mesh(geo('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 20)), view.mat(col, o));
        scene.add(m);
        view.placeCylinder(m, a, b, r);
        return m;
      },
      placeCylinder(m, a, b, r) {
        const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
        const dir = B.clone().sub(A), len = Math.max(dir.length(), 1e-4);
        m.position.copy(A).add(B).multiplyScalar(0.5);
        m.scale.set(r, len, r);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      },
      // Bond between two atom meshes (order 1, 2 or 3); follows the atoms when you call updateBonds().
      bond(a, b, o) {
        o = o || {};
        const order = o.order || 1, rad = o.radius || 0.09, col = o.color || '#cbd5e1';
        const parts = [];
        for (let i = 0; i < order; i++) {
          const m = new THREE.Mesh(geo('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 20)), view.mat(col, { shininess: 40 }));
          scene.add(m); parts.push(m);
        }
        const bond = { a, b, order, rad, parts, spread: o.spread || 0.16, lengthTrim: o.trim != null ? o.trim : 0.0 };
        bonds.push(bond);
        view.updateBond(bond);
        return bond;
      },
      updateBond(bd) {
        const A = bd.a.position, B = bd.b.position;
        const dir = B.clone().sub(A);
        const len = dir.length();
        if (len < 1e-4) return;
        const d = dir.clone().normalize();
        let side = new THREE.Vector3(0, 0, 1).cross(d);
        if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0).cross(d);
        side.normalize();
        bd.parts.forEach((m, i) => {
          const off = (i - (bd.order - 1) / 2) * bd.spread;
          const o = side.clone().multiplyScalar(off);
          m.position.copy(A).add(B).multiplyScalar(0.5).add(o);
          m.scale.set(bd.rad, len, bd.rad);
          m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
        });
      },
      updateBonds() { bonds.forEach(view.updateBond); },
      arrow(from, to, col, o) {
        o = o || {};
        const g = new THREE.Group();
        const A = new THREE.Vector3(...from), B = new THREE.Vector3(...to);
        const dir = B.clone().sub(A), len = dir.length(), head = Math.min(o.head || 0.5, len * 0.5);
        const shaft = new THREE.Mesh(geo('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 16)), view.mat(col, { shininess: 30 }));
        const cone = new THREE.Mesh(geo('cone', () => new THREE.ConeGeometry(1, 1, 20)), view.mat(col, { shininess: 30 }));
        const d = dir.clone().normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
        shaft.scale.set(o.width || 0.06, len - head, o.width || 0.06);
        shaft.position.copy(A).add(d.clone().multiplyScalar((len - head) / 2));
        shaft.quaternion.copy(q);
        cone.scale.set((o.width || 0.06) * 2.6, head, (o.width || 0.06) * 2.6);
        cone.position.copy(A).add(d.clone().multiplyScalar(len - head / 2));
        cone.quaternion.copy(q);
        g.add(shaft, cone);
        scene.add(g);
        return g;
      },
      ring(r, col, o) {           // thin torus: electron shells / orbits. o.axis: 'y' (flat, default) | 'x' | 'z'; o.tilt radians
        o = o || {};
        const m = new THREE.Mesh(new THREE.TorusGeometry(r, o.tube || 0.018, 10, 96), view.mat(col || '#94a3b8', { opacity: o.opacity != null ? o.opacity : 0.85, shininess: 20 }));
        disposables.push(m.geometry);
        if (!o.axis || o.axis === 'y') m.rotation.x = Math.PI / 2;
        else if (o.axis === 'x') m.rotation.y = Math.PI / 2;
        if (o.tilt) m.rotation.z += o.tilt;
        if (o.pos) m.position.set(...o.pos);
        scene.add(m);
        return m;
      },
      box(w, h, d, col, o) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), view.mat(col, o));
        disposables.push(m.geometry);
        if (o && o.pos) m.position.set(...o.pos);
        scene.add(m);
        return m;
      },
      // Glass beaker (open cylinder, transparent) sitting on y = base. Returns { group, liquid(level), setLevel(0..1), setColor(c) }.
      beaker(r, h, o) {
        o = o || {};
        const base = o.base != null ? o.base : 0;
        const g = new THREE.Group();
        const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 56, 1, true), view.mat('#dbeafe', { opacity: 0.22, doubleSide: true, shininess: 120, specular: '#ffffff' }));
        wall.position.y = base + h / 2;
        const bottom = new THREE.Mesh(new THREE.CircleGeometry(r, 56), view.mat('#dbeafe', { opacity: 0.35, doubleSide: true }));
        bottom.rotation.x = -Math.PI / 2; bottom.position.y = base + 0.005;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 8, 64), view.mat('#e0f2fe', { opacity: 0.9 }));
        rim.rotation.x = Math.PI / 2; rim.position.y = base + h;
        g.add(wall, bottom, rim);
        [wall.geometry, bottom.geometry, rim.geometry].forEach(x => disposables.push(x));
        const liq = new THREE.Mesh(geo('cyl48', () => new THREE.CylinderGeometry(1, 1, 1, 48)), view.mat(o.liquidColor || '#93c5fd', { opacity: o.liquidOpacity != null ? o.liquidOpacity : 0.55, shininess: 90 }));
        g.add(liq);
        const api2 = {
          group: g, liquidMesh: liq,
          setLevel(level) { const hh = Math.max(0.001, h * 0.96 * level); liq.scale.set(r * 0.97, hh, r * 0.97); liq.position.y = base + 0.01 + hh / 2; liq.visible = level > 0.001; },
          setColor(c) { liq.material.color = new THREE.Color(c); }
        };
        api2.setLevel(o.level != null ? o.level : 0.6);
        if (o.pos) g.position.set(...o.pos);
        scene.add(g);
        return api2;
      },
      floor(y, size, col) {
        const grid = new THREE.GridHelper(size || 14, (size || 14), new THREE.Color(col || '#c7d2fe'), new THREE.Color('#e0e7ff'));
        grid.position.y = y || 0;
        grid.material.transparent = true; grid.material.opacity = 0.55;
        disposables.push(grid.geometry, grid.material);
        scene.add(grid);
        return grid;
      },
      // Text label (always faces the camera, drawn on top). Returns a THREE.Sprite; sprite.userData.setText(str) updates it.
      label(text, pos, o) {
        o = o || {};
        const c = document.createElement('canvas'); c.width = 512; c.height = 128;
        const ctx = c.getContext('2d');
        const tex = new THREE.CanvasTexture(c);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
        const sprite = new THREE.Sprite(mat);
        sprite.renderOrder = 999;
        const size = o.size || 0.9;
        sprite.scale.set(size * 4, size, 1);
        disposables.push(mat, tex);
        function draw(t) {
          ctx.clearRect(0, 0, 512, 128);
          ctx.font = `${o.bold === false ? '600' : '800'} ${o.fontSize || 64}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const w = Math.min(500, ctx.measureText(t).width + 28);
          if (o.bg) { ctx.fillStyle = o.bg; const x = 256 - w / 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, 24, w, 80, 22) : ctx.rect(x, 24, w, 80); ctx.fill(); }
          const dark = document.documentElement.getAttribute('data-theme') === 'dark';
          let fg = o.color || '#1f2937';
          const hex = fg.replace('#', '');
          let lum = hex.length === 6 ? (0.299 * parseInt(hex.slice(0, 2), 16) + 0.587 * parseInt(hex.slice(2, 4), 16) + 0.114 * parseInt(hex.slice(4, 6), 16)) : 60;
          // Dark theme: labels sitting straight on the stage (no box behind them) must be light.
          if (dark && !o.bg && lum < 125) { fg = '#e8ecf6'; lum = 235; }
          ctx.lineWidth = 9; ctx.lineJoin = 'round';
          ctx.strokeStyle = o.outline || (lum > 140 ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.92)');   // halo contrasts with the text colour
          if (o.outline !== false && !o.bg) ctx.strokeText(t, 256, 66);
          ctx.fillStyle = fg; ctx.fillText(t, 256, 66);
          tex.needsUpdate = true;
        }
        draw(String(text));
        sprite.userData.setText = t => draw(String(t));
        if (pos) sprite.position.set(...pos);
        scene.add(sprite);
        return sprite;
      },
      // Click picking: returns the first object from `objects` under the client point, or null.
      pick(clientX, clientY, objects) {
        const r = canvas.getBoundingClientRect();
        const ndc = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
        const rc = new THREE.Raycaster(); rc.setFromCamera(ndc, camera);
        const hit = rc.intersectObjects(objects, true)[0];
        return hit ? hit.object : null;
      },
      // Per-frame callback while not paused. Runs once right away so a static picture always shows.
      run(fn) {
        frameFns.push(fn);
        fn(0, 0);
        render();
      },
      // Testing aid: coverage (share of non-transparent pixels) and a coarse hash of the current frame.
      frameStats() {
        render();
        const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
        const buf = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        let lit = 0, hash = 0;
        for (let i = 0; i < buf.length; i += 16) { if (buf[i + 3] > 8) lit++; hash = (hash * 31 + buf[i] + 3 * buf[i + 1] + 7 * buf[i + 2]) | 0; }
        return { coverage: +(lit / (buf.length / 16)).toFixed(3), hash, size: [w, h] };
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
        scene.traverse(o => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }
        });
        geoCache.forEach(g => g.dispose());
        disposables.forEach(d => d.dispose && d.dispose());
        renderer.dispose();
        try { renderer.forceContextLoss(); } catch (e) { /* ignore */ }
        canvas.remove();
      }
    };

    canvas.__c3d = view;   // handy for automated checks: document.querySelector('#tutorial-scene canvas').__c3d.frameStats()

    // Frame driver: registered with the player's loop so Pause freezes it.
    let lastYawTime = 0;
    api.loop((t, dt) => {
      if (disposed) return;
      frameFns.forEach(fn => fn(t, dt));
      if (autoRotate && performance.now() > idleUntil) cam.yaw += autoRotate * dt;
      lastYawTime = t;
      render();
    });
    resize();
    return view;
  }

  // Convenience wrapper: define a full scene function.
  function define(opts, build) {
    return function scene3d(el, api) {
      const view = create(el, api, opts);
      const ctx = {
        el, api,
        // Append a row of DOM controls (sliders/buttons) under the canvas; returns the row element.
        controls(html) {
          const row = document.createElement('div');
          row.className = 'c3d-controls';
          row.innerHTML = html;
          el.appendChild(row);
          view.resize();
          return row;
        }
      };
      let extra = null;
      try { extra = build(view, ctx); } catch (err) { view.dispose(); throw err; }
      return () => { try { if (typeof extra === 'function') extra(); } finally { view.dispose(); } };
    };
  }

  return { supported, create, define, COLORS, color, radius };
})();

// Attach 3D scenes to already-registered tutorial steps, aligned by step index
// (entries may be null/undefined to keep the flat scene for that step).
function addTutorialScenes3D(subjectId, topicId, list) {
  const t = TUTORIALS[subjectId] && TUTORIALS[subjectId][topicId];
  if (!t) return;
  list.forEach((fn, i) => { if (fn && t.steps[i]) t.steps[i].scene3d = fn; });
}
