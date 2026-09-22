(function () {
  // 3D scenes for chemistry/mixtures: addTutorialScenes3D('chemistry', 'mixtures', [...8 scenes...]).
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ORANGE = '#f97316', BLUE = '#0ea5e9', GREEN = '#16a34a', INK = '#1f2937', MUTED = '#64748b';
  const SAND = '#a16207', SUGAR = '#f5b301', WATER = '#5bb4f0';

  // Wireframe + faint glass box (a "container" for particles).
  function glassBox(view, w, h, d, pos, col) {
    const g = new THREE.Group();
    const faces = view.box(w, h, d, '#dbeafe', { opacity: 0.12, doubleSide: true, shininess: 100 });
    const eg = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
    const lines = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: col || '#475569' }));
    g.add(faces, lines);
    g.position.set(...pos);
    view.scene.add(g);
    return g;
  }

  // DOM overlay on top of the canvas (readouts / legends). pointer-events off so dragging still rotates.
  function overlay(view, css) {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;pointer-events:none;font-weight:700;color:' + INK + ';' + (css || '');
    view.wrap.appendChild(d);
    return d;
  }

  // Slide the picture sideways inside the canvas (fraction of width; + moves it left) without moving the orbit centre.
  function shiftView(view, f) {
    const a = view.camera.aspect;
    view.camera.setViewOffset(a * 100, 100, f * a * 100, 0, a * 100, 100);
  }

  // Random point inside a cylinder (radius r, y in [y0,y1]) — for particles in a beaker.
  function inCylinder(r, y0, y1) {
    const a = rnd(0, TAU), rr = r * Math.sqrt(Math.random());
    return new THREE.Vector3(Math.cos(a) * rr, rnd(y0, y1), Math.sin(a) * rr);
  }

  // Keep a particle inside a cylinder (radius r around the y axis, y in [y0,y1]); reflects the velocity.
  function keepInCylinder(p, v, r, y0, y1) {
    const rad = Math.hypot(p.x, p.z);
    if (rad > r) {
      const nx = p.x / rad, nz = p.z / rad;
      p.x = nx * r; p.z = nz * r;
      const vn = v.x * nx + v.z * nz;
      if (vn > 0) { v.x -= 2 * vn * nx; v.z -= 2 * vn * nz; }
    }
    if (p.y < y0) { p.y = y0; v.y = Math.abs(v.y); }
    if (p.y > y1) { p.y = y1; v.y = -Math.abs(v.y); }
  }

  // Random-walk velocity nudge (thermal motion) with a speed target.
  function jitter(v, speed, dt, k) {
    v.x += (Math.random() - 0.5) * k * dt; v.y += (Math.random() - 0.5) * k * dt; v.z += (Math.random() - 0.5) * k * dt;
    const s = v.length() || 1e-4;
    v.multiplyScalar(1 + (speed / s - 1) * Math.min(1, dt * 2));
  }

  // Gentle left-right sway of the camera instead of a full auto-rotate (keeps side-by-side labels apart). Drag still works.
  function sway(view, amp, speed) {
    view.autoRotate = 0;
    let prev = 0;
    view.run((t) => { const s = amp * Math.sin(t * speed); view.cam.yaw += s - prev; prev = s; });
  }

  const scenes = [];

  // ------------------------------------------------------------------
  // Step 1: mixture vs compound (two glass boxes of particles)
  // ------------------------------------------------------------------
  scenes.push(Chem3D.define({ distance: 13.2, pitch: 0.28, yaw: 0.25, autoRotate: 0, target: [0, -0.1, 0] }, (view) => {
    sway(view, 0.4, 0.5);
    const BW = 4.2, BH = 3.2, BD = 3.2, CX = 2.9;
    glassBox(view, BW, BH, BD, [-CX, 0, 0]);
    glassBox(view, BW, BH, BD, [CX, 0, 0]);
    view.label('Mixture', [-CX, 2.55, 0], { size: 0.85 });
    view.label('Compound', [CX, 2.55, 0], { size: 0.85 });
    view.label('Separate, any amounts', [-CX, -2.55, 0], { size: 0.9, fontSize: 42, color: '#334155', bg: 'rgba(255,255,255,0.85)' });
    view.label('Bonded, fixed ratio', [CX, -2.55, 0], { size: 0.9, fontSize: 42, color: '#334155', bg: 'rgba(255,255,255,0.85)' });

    // Mixture: 5 big orange + 3 small blue particles drifting on their own.
    const loose = [];
    const addLoose = (r, col) => {
      const m = view.sphere(r, col);
      const home = -CX;
      m.position.set(home + rnd(-1.5, 1.5), rnd(-1.1, 1.1), rnd(-1.1, 1.1));
      const v = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(0.8);
      loose.push({ m, v, r, home });
    };
    for (let i = 0; i < 5; i++) addLoose(0.4, ORANGE);
    for (let i = 0; i < 3; i++) addLoose(0.28, BLUE);

    // Compound: 6 orange-blue pairs joined by a bond; each pair moves and tumbles as one unit.
    const pairs = [];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group();
      const a = view.sphere(0.4, ORANGE), b = view.sphere(0.28, BLUE);
      a.position.set(-0.42, 0, 0); b.position.set(0.5, 0, 0);
      const bond = view.cylinder([-0.42, 0, 0], [0.5, 0, 0], 0.11, '#111827');
      g.add(a, b, bond);
      g.position.set(CX + rnd(-1.3, 1.3), rnd(-0.9, 0.9), rnd(-0.9, 0.9));
      g.quaternion.setFromEuler(new THREE.Euler(rnd(0, TAU), rnd(0, TAU), rnd(0, TAU)));
      view.scene.add(g);
      pairs.push({ g, v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(0.55), axis: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(), spin: rnd(0.5, 1.2) });
    }
    const inner = { x: BW / 2, y: BH / 2, z: BD / 2 };
    const bounce = (p, v, m, home) => {
      const lim = { x: inner.x - m, y: inner.y - m, z: inner.z - m };
      ['x', 'y', 'z'].forEach(ax => {
        const rel = p[ax] - (ax === 'x' ? home : 0);
        if (rel > lim[ax]) { p[ax] = (ax === 'x' ? home : 0) + lim[ax]; v[ax] = -Math.abs(v[ax]); }
        if (rel < -lim[ax]) { p[ax] = (ax === 'x' ? home : 0) - lim[ax]; v[ax] = Math.abs(v[ax]); }
      });
    };
    view.run((t, dt) => {
      loose.forEach(o => { jitter(o.v, 0.85, dt, 3); o.m.position.addScaledVector(o.v, dt); bounce(o.m.position, o.v, o.r + 0.05, o.home); });
      pairs.forEach(o => {
        jitter(o.v, 0.55, dt, 2);
        o.g.position.addScaledVector(o.v, dt);
        o.g.rotateOnWorldAxis(o.axis, o.spin * dt);
        bounce(o.g.position, o.v, 0.95, CX);
      });
    });
  }));

  // ------------------------------------------------------------------
  // Step 2: sugar dissolving in a 3D beaker (Temp slider, Stir, Reset)
  // ------------------------------------------------------------------
  scenes.push(Chem3D.define({ distance: 8.8, pitch: 0.3, yaw: 0.5, autoRotate: 0.22, target: [0, 2.0, 0] }, (view, ctx) => {
    const R = 1.7, H = 3.6, N = 24, NW = 34, LEVEL = 0.72;
    const bk = view.beaker(R, H, { level: LEVEL, liquidColor: '#8fc9f5', liquidOpacity: 0.42 });
    const top = 0.01 + H * 0.96 * LEVEL;                       // water surface height
    const surface = view.ring(R * 0.97, '#e0f2fe', { opacity: 0.9, tube: 0.02, pos: [0, top, 0] });
    const gWater = new THREE.SphereGeometry(1, 14, 10), mWater = view.mat('#0284c7', { shininess: 40 });
    const gSugar = new THREE.BoxGeometry(1, 1, 1), mSugar = view.mat(SUGAR, { shininess: 90, specular: '#ffffff', emissive: '#6b4a00' });

    const water = [];
    for (let i = 0; i < NW; i++) {
      const m = new THREE.Mesh(gWater, mWater); m.scale.setScalar(0.1);
      m.position.copy(inCylinder(R - 0.15, 0.15, top - 0.15));
      view.scene.add(m);
      water.push({ m, v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(0.5) });
    }
    const sugar = [];
    for (let i = 0; i < N; i++) {
      const m = new THREE.Mesh(gSugar, mSugar); m.scale.setScalar(0.3);
      view.scene.add(m);
      const layer = Math.floor(i / 8), k = i % 8;
      sugar.push({ m, pile: new THREE.Vector3(((k % 4) - 1.5) * 0.36 + (layer % 2) * 0.12, 0.17 + layer * 0.31, (Math.floor(k / 4) - 0.5) * 0.36 + (layer % 2) * 0.1), free: false, falling: true, v: new THREE.Vector3(), size: 0.3 });
    }
    function reset() {
      sugar.forEach((p, i) => {
        p.free = false; p.falling = true; p.size = 0.3; p.v.set(0, -0.5, 0);
        p.m.position.set(p.pile.x + rnd(-0.05, 0.05), top + 0.8 + i * 0.28, p.pile.z + rnd(-0.05, 0.05));
        p.m.rotation.set(rnd(0, 1), rnd(0, 1), rnd(0, 1));
      });
    }
    reset();
    // start with the cubes already at rest in a pile, then drop a fresh batch a moment after the scene opens
    let stir = 0, autoDrop = true;
    const rod = view.cylinder([0, 0.5, 0], [0.8, 4, 0], 0.07, '#94a3b8');
    rod.visible = false;

    const row = ctx.controls(
      '<div class="scene-slider-row" style="padding:2px 8px;gap:6px"><span>Temp</span><input type="range" id="mixd-temp" min="10" max="80" value="25" aria-label="Water temperature"><span id="mixd-tv" style="min-width:38px;text-align:right">25°C</span>' +
      '<button type="button" class="scene-btn" id="mixd-stir" style="padding:3px 9px">Stir</button><button type="button" class="scene-btn" id="mixd-reset" style="padding:3px 9px">Reset</button></div>');
    const $ = id => row.querySelector('#' + id);
    const tSlider = $('mixd-temp');
    tSlider.addEventListener('input', () => { $('mixd-tv').textContent = tSlider.value + '°C'; });
    $('mixd-stir').addEventListener('click', () => { stir = 3; });
    $('mixd-reset').addEventListener('click', () => { reset(); stir = 0; });

    const ov = overlay(view, 'left:0;right:0;top:4px;text-align:center;font-size:12px;line-height:1.35;text-shadow:0 0 4px #fff,0 0 4px #fff');
    ov.innerHTML = '<div>Dissolved: <b id="mixd-n">0</b> &nbsp;·&nbsp; Still solid: <b id="mixd-s">24</b> &nbsp;·&nbsp; Total sugar: ' + N + '</div><div id="mixd-msg" style="color:' + GREEN + '">(none is lost!)</div>';
    const elN = ov.querySelector('#mixd-n'), elS = ov.querySelector('#mixd-s'), elMsg = ov.querySelector('#mixd-msg');
    let lastMsg = '';

    const move = (p, v, speed, dt, swirl, y0) => {
      jitter(v, speed, dt, 5);
      if (swirl) { v.x += -p.z * swirl * dt; v.z += p.x * swirl * dt; }
      p.addScaledVector(v, dt);
      keepInCylinder(p, v, R - 0.14, y0, top - 0.12);
    };

    view.run((t, dt) => {
      const temp = +tSlider.value;
      const cap = Math.round(14 + (temp - 10) / 70 * 10);
      const speed = (0.3 + temp * 0.012) * (stir > 0 ? 2.4 : 1);
      const rate = (0.04 + (temp - 10) * 0.012) * (stir > 0 ? 4 : 1);
      if (stir > 0) stir -= dt;
      const swirl = stir > 0 ? 2.2 : 0;
      surface.scale.setScalar(1 + 0.012 * Math.sin(t * 2.2));
      surface.position.y = top + 0.018 * Math.sin(t * 1.7);
      // stirring rod
      rod.visible = stir > 0;
      if (stir > 0) {
        const a = t * 7;
        view.placeCylinder(rod, [Math.cos(a) * 0.7, 0.5, Math.sin(a) * 0.7], [Math.cos(a) * 0.95, 4.0, Math.sin(a) * 0.95], 0.07);
      }
      // falling cubes
      sugar.forEach(p => {
        if (!p.falling) return;
        const inWater = p.m.position.y < top;
        p.v.y += (inWater ? -1.2 : -7) * dt;
        if (inWater) p.v.y = Math.max(p.v.y, -1.6);
        p.m.position.y += p.v.y * dt;
        p.m.rotation.x += 1.5 * dt; p.m.rotation.z += 1.1 * dt;
        if (p.m.position.y <= p.pile.y) { p.m.position.copy(p.pile); p.m.rotation.set(0, (p.pile.x * 7) % 0.6, 0); p.falling = false; }
      });
      // dissolving
      let dissolved = 0;
      sugar.forEach(p => { if (p.free) dissolved++; });
      const solids = sugar.filter(p => !p.free && !p.falling).sort((a, b) => b.pile.y - a.pile.y);
      for (let k = 0; k < Math.min(8, solids.length); k++) {
        if (dissolved < cap && Math.random() < rate * dt) { solids[k].free = true; solids[k].v.set(rnd(-1, 1), rnd(-0.2, 1), rnd(-1, 1)).setLength(speed); dissolved++; }
      }
      const falling = sugar.some(p => p.falling);
      sugar.forEach(p => {
        if (!p.free) return;
        move(p.m.position, p.v, speed, dt, swirl, 0.15);
        p.size += (0.17 - p.size) * Math.min(1, dt * 1.6);
        p.m.scale.setScalar(p.size);
        p.m.rotation.x += 0.8 * dt; p.m.rotation.y += 0.6 * dt;
      });
      water.forEach(p => move(p.m.position, p.v, speed * 0.85, dt, swirl, 0.12));
      // counters count only cubes that are in the beaker; while the batch is still falling they show 0 dissolved
      const solid = N - dissolved;
      elN.textContent = dissolved; elS.textContent = solid;
      const full = dissolved >= cap && dissolved < N && !falling;
      const msg = full ? 'Saturated! Heat it for more.' : '(none is lost!)';
      if (msg !== lastMsg) { elMsg.textContent = msg; elMsg.style.color = full ? ORANGE : GREEN; lastMsg = msg; }
    });
  }));

  // ------------------------------------------------------------------
  // Step 3: homogeneous (salt water) vs heterogeneous (sand settling), two beakers
  // ------------------------------------------------------------------
  scenes.push(Chem3D.define({ distance: 9.8, pitch: 0.28, yaw: 0.2, autoRotate: 0, target: [0, 1.1, 0] }, (view) => {
    sway(view, 0.4, 0.5);
    const R = 1.5, H = 3.0, LEVEL = 0.75, CX = 2.5;
    const top = 0.01 + H * 0.96 * LEVEL;
    view.beaker(R, H, { level: LEVEL, liquidColor: '#8fc9f5', liquidOpacity: 0.4, pos: [-CX, 0, 0] });
    view.beaker(R, H, { level: LEVEL, liquidColor: '#8fc9f5', liquidOpacity: 0.4, pos: [CX, 0, 0] });
    view.label('Salt water', [-CX, 3.75, 0], { size: 0.85 });
    view.label('Sand and water', [CX, 3.75, 0], { size: 0.85 });
    view.label('Homogeneous', [-CX, -1.0, 0], { size: 0.85, color: GREEN });
    view.label('Heterogeneous', [CX, -1.0, 0], { size: 0.85, color: ORANGE });
    view.label('same everywhere', [-CX, -1.75, 0], { size: 0.8, fontSize: 40, color: '#334155', bg: 'rgba(255,255,255,0.85)' });
    view.label('sand settles at the bottom', [CX, -1.75, 0], { size: 0.8, fontSize: 36, color: '#334155', bg: 'rgba(255,255,255,0.85)' });

    const gp = new THREE.SphereGeometry(1, 14, 10);
    const mA = view.mat('#3b82f6', { shininess: 60 }), mB = view.mat('#94a3b8', { shininess: 60 });
    const salt = [];
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(gp, i % 2 ? mA : mB); m.scale.setScalar(0.12);
      m.position.copy(inCylinder(R - 0.15, 0.15, top - 0.15)); m.position.x -= CX;
      view.scene.add(m);
      salt.push({ m, v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(0.5) });
    }
    const mS = view.mat(SAND, { shininess: 30 });
    const CYC = 8;
    const grains = [];
    for (let i = 0; i < 20; i++) {
      const m = new THREE.Mesh(gp, mS); m.scale.setScalar(0.15);
      view.scene.add(m);
      const a = rnd(0, TAU), rr = 1.15 * Math.sqrt(Math.random());
      grains.push({
        m, start: inCylinder(R - 0.2, 0.9, top - 0.2), end: new THREE.Vector3(Math.cos(a) * rr, 0.15 + Math.random() * 0.12, Math.sin(a) * rr),
        dur: rnd(2.6, 4.2), ph: rnd(0, TAU)
      });
    }
    view.run((t, dt) => {
      salt.forEach(p => {
        jitter(p.v, 0.55, dt, 5);
        const q = p.m.position; q.x += CX; q.addScaledVector(p.v, dt); keepInCylinder(q, p.v, R - 0.14, 0.14, top - 0.12); q.x -= CX;
      });
      const c = t % CYC;
      grains.forEach(g => {
        const pr = clamp((c - 0.8) / g.dur, 0, 1), e = pr * pr * (3 - 2 * pr);
        const wob = (1 - e) * 0.05;
        g.m.position.set(CX + g.start.x + (g.end.x - g.start.x) * e + Math.sin(t * 2 + g.ph) * wob, g.start.y + (g.end.y - g.start.y) * e, g.start.z + (g.end.z - g.start.z) * e + Math.cos(t * 1.7 + g.ph) * wob);
        g.m.scale.setScalar(0.15 * clamp(c / 0.4, 0, 1) * clamp((CYC - c) / 0.4, 0, 1));
      });
    });
  }));

  // ------------------------------------------------------------------
  // Step 4: separating mixtures — filtration / evaporation / magnet / distillation apparatus in 3D
  // ------------------------------------------------------------------
  scenes.push(Chem3D.define({ distance: 10.5, pitch: 0.25, yaw: 0.35, autoRotate: 0, target: [0, 0.1, 0] }, (view, ctx) => {
    sway(view, 0.45, 0.45);
    view.renderer.localClippingEnabled = true;
    const glass = () => view.mat('#dbeafe', { opacity: 0.25, doubleSide: true, shininess: 120, specular: '#ffffff' });
    const metal = '#64748b';
    const gSph = new THREE.SphereGeometry(1, 16, 12), gBox = new THREE.BoxGeometry(1, 1, 1);
    const put = (g, mesh, x, y, z) => { mesh.position.set(x, y, z); g.add(mesh); return mesh; };
    const cyl = (g, rt, rb, h, mat, x, y, z, open) => put(g, new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 36, 1, !!open), mat), x, y, z);
    const rod = (g, a, b, r, col) => { const m = view.cylinder(a, b, r, col || metal); g.add(m); return m; };
    const lab = (g, text, pos, o) => { const l = view.label(text, pos, Object.assign({ size: 1.15, fontSize: 40, bg: 'rgba(255,255,255,0.85)', color: '#334155' }, o)); g.add(l); return l; };
    const flameOf = (g, x, yb, r, h) => {
      const outer = new THREE.Mesh(new THREE.ConeGeometry(r, h, 20), view.mat('#f97316', { opacity: 0.85, shininess: 10, emissive: '#c2410c' }));
      const inner = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, h * 0.65, 20), view.mat('#fde047', { opacity: 0.95, shininess: 10, emissive: '#facc15' }));
      outer.position.set(x, yb + h / 2, 0); inner.position.set(x, yb + h * 0.33, 0);
      g.add(outer, inner);
      return (t) => { const f = 1 + 0.12 * Math.sin(t * 17) + 0.08 * Math.sin(t * 29 + 1); outer.scale.set(1 + 0.05 * Math.sin(t * 23), f, 1); inner.scale.set(1, 1 + 0.1 * Math.sin(t * 31), 1); };
    };
    // bench
    const bench = view.box(8.6, 0.2, 3.8, '#cbd5e1', { pos: [-0.3, -3.1, 0] });
    const methods = {};

    // ---------- Filtration ----------
    (function () {
      const g = new THREE.Group(); view.scene.add(g);
      rod(g, [0, -3, -1.8], [0, 2.4, -1.8], 0.07);
      rod(g, [0, 1.5, -1.8], [0, 1.5, -0.8], 0.06);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 8, 40), view.mat(metal)); ring.rotation.x = Math.PI / 2; put(g, ring, 0, 1.5, 0);
      cyl(g, 1.5, 0.12, 1.7, glass(), 0, 1.55, 0, true);                       // funnel (glass cone)
      cyl(g, 0.12, 0.12, 0.6, glass(), 0, 0.4, 0, true);                       // stem
      cyl(g, 1.38, 0.1, 1.55, view.mat('#ffffff', { doubleSide: true, opacity: 0.5, shininess: 5 }), 0, 1.55, 0, true);   // filter paper
      cyl(g, 0.84, 0.1, 0.95, view.mat('#a3865a', { opacity: 0.45 }), 0, 1.25, 0);   // muddy water in the paper
      const grains = [];
      for (let i = 0; i < 16; i++) {
        const m = new THREE.Mesh(gSph, view.mat(SAND, { shininess: 20 })); m.scale.setScalar(0.12);
        const y = 0.86 + Math.random() * 0.25, rmax = Math.max(0.05, 0.1 + (y - 0.75) * 0.75 - 0.15), a = rnd(0, TAU), rr = rmax * Math.sqrt(Math.random());
        put(g, m, Math.cos(a) * rr, y, Math.sin(a) * rr); grains.push({ m, y, ph: rnd(0, TAU) });
      }
      const bk = view.beaker(1.15, 1.9, { base: -2.95, level: 0.1, liquidColor: '#8fc9f5', liquidOpacity: 0.5 }); g.add(bk.group);
      const drops = [];
      for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(gSph, view.mat('#0284c7')); m.scale.setScalar(0.08); g.add(m); drops.push(m); }
      lab(g, 'Filtration', [0, 3.3, 0], { size: 1.1, fontSize: 64, bg: null, color: INK });
      lab(g, 'Sand is caught', [2.9, 2.0, 0], { size: 1.15, color: SAND });
      lab(g, 'Water passes through', [3.1, -0.2, 0], { fontSize: 40, color: '#0369a1' });
      const CYC = 7;
      methods.filtration = { g, cam: { distance: 12.4, target: [0.3, -0.05, 0] }, update(t, c) {
        grains.forEach(o => { o.m.position.y = o.y + 0.012 * Math.sin(t * 3 + o.ph); });
        const lvl = 0.06 + 0.55 * clamp(c / (CYC - 0.8), 0, 1);
        bk.setLevel(lvl);
        const top = -2.95 + 0.01 + 1.9 * 0.96 * lvl;
        drops.forEach((m, i) => { const u = ((c * 1.1 + i / 4) % 1); m.position.set(0, 0.25 + (top - 0.25) * u * u, 0); m.visible = c < CYC - 0.6; });
      }, cycle: CYC };
    })();

    // ---------- Evaporation ----------
    (function () {
      const g = new THREE.Group(); view.scene.add(g);
      const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.2);
      // tripod + gauze
      const legs = [];
      for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + i * TAU / 3; rod(g, [Math.cos(a) * 1.3, -0.62, Math.sin(a) * 1.3], [Math.cos(a) * 1.9, -3.0, Math.sin(a) * 1.9], 0.05); }
      const gz = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.05, 36), view.mat('#94a3b8', { opacity: 0.8 })); put(g, gz, 0, -0.6, 0);
      // dish: half a sphere squashed
      const bowlGeo = new THREE.SphereGeometry(1.6, 44, 16, 0, TAU, Math.PI / 2, Math.PI / 2);
      const bowl = new THREE.Mesh(bowlGeo, view.mat('#e0f2fe', { opacity: 0.45, doubleSide: true, shininess: 100, specular: '#ffffff' })); bowl.scale.y = 0.45; put(g, bowl, 0, 0.2, 0);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 8, 56), view.mat('#e0f2fe', { opacity: 0.9 })); rim.rotation.x = Math.PI / 2; put(g, rim, 0, 0.2, 0);
      // water: same squashed bowl, clipped by a plane that sinks as it evaporates
      const wm = view.mat('#4aa8f0', { opacity: 0.55, doubleSide: true }); wm.clippingPlanes = [plane];
      const water = new THREE.Mesh(new THREE.SphereGeometry(1.56, 40, 16, 0, TAU, Math.PI / 2, Math.PI / 2), wm); water.scale.y = 0.45; put(g, water, 0, 0.2, 0);
      const surf = new THREE.Mesh(new THREE.CircleGeometry(1, 40), view.mat('#7cc4f7', { opacity: 0.6, doubleSide: true })); surf.rotation.x = -Math.PI / 2; g.add(surf);
      // salt crystals appear at the bottom
      const crystals = [];
      for (let i = 0; i < 14; i++) {
        const m = new THREE.Mesh(gBox, view.mat('#ffffff', { shininess: 100, specular: '#ffffff' })); const a = rnd(0, TAU), rr = 0.8 * Math.sqrt(Math.random());
        const y = 0.2 - 0.72 * (1 - Math.sqrt(Math.max(0, 1 - (rr / 1.6) * (rr / 1.6)))) * 0 - 0.72 * Math.sqrt(Math.max(0, 1 - (rr / 1.6) * (rr / 1.6)));
        put(g, m, Math.cos(a) * rr, y + 0.1, Math.sin(a) * rr); m.rotation.set(rnd(0, 1), rnd(0, 1), rnd(0, 1)); crystals.push({ m, s: rnd(0.22, 0.32) });
      }
      // steam
      const steam = [];
      for (let i = 0; i < 9; i++) {
        const m = new THREE.Mesh(gSph, view.mat('#e2e8f0', { opacity: 0.5, shininess: 5 })); g.add(m);
        steam.push({ m, ph: i / 9, x: rnd(-0.9, 0.9), z: rnd(-0.9, 0.9), dx: rnd(-0.3, 0.3) });
      }
      // burner + flame
      cyl(g, 0.22, 0.28, 0.5, view.mat('#64748b'), 0, -2.75, 0);
      const flick = flameOf(g, 0, -2.5, 0.4, 1.4);
      lab(g, 'Evaporation', [0, 3.3, 0], { size: 1.1, fontSize: 64, bg: null, color: INK });
      lab(g, 'Water leaves as vapor', [3.1, 1.9, 0], { fontSize: 40, color: '#475569' });
      lab(g, 'Salt is left behind', [3.1, -0.35, 0], { fontSize: 40, color: INK });
      const CYC = 9;
      methods.evaporation = { g, cam: { distance: 11.6, target: [0.3, -0.15, 0] }, cycle: CYC, update(t, c) {
        flick(t);
        const level = 1 - clamp((c - 0.6) / 6.2, 0, 1);
        const yw = 0.2 - 0.72 + 0.68 * level;
        plane.constant = yw;
        const rw = 1.6 * Math.sqrt(Math.max(0, 1 - ((yw - 0.2) / 0.72) * ((yw - 0.2) / 0.72))) * 0.97;
        surf.position.set(0, yw, 0); surf.scale.setScalar(Math.max(0.001, rw)); surf.visible = level > 0.02;
        water.visible = level > 0.02;
        const grow = clamp((c - 5.4) / 1.6, 0, 1) * clamp((CYC - c) / 0.7, 0, 1);
        crystals.forEach(o => o.m.scale.setScalar(o.s * grow));
        steam.forEach(o => {
          const u = (t * 0.28 + o.ph) % 1, on = level > 0.03 ? 1 : 0;
          o.m.position.set(o.x + o.dx * u * 2 + Math.sin(t + o.ph * 9) * 0.1, 0.5 + u * 2.4, o.z);
          o.m.scale.setScalar((0.16 + u * 0.28) * on);
          o.m.material.opacity = 0.35 * (1 - u) * Math.min(1, u * 6);
        });
      } };
    })();


    // ---------- Magnet ----------
    (function () {
      const g = new THREE.Group(); view.scene.add(g);
      // tray with sand and iron filings
      cyl(g, 2.2, 2.2, 0.12, view.mat('#94a3b8'), 0, -2.93, 0);
      const trim = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.06, 8, 56), view.mat('#64748b')); trim.rotation.x = Math.PI / 2; put(g, trim, 0, -2.85, 0);
      const sandM = view.mat(SAND, { shininess: 20 }), ironM = view.mat('#374151', { shininess: 80, specular: '#9ca3af' });
      const rest = () => { const a = rnd(0, TAU), rr = 1.8 * Math.sqrt(Math.random()); return new THREE.Vector3(Math.cos(a) * rr, -2.74 + Math.random() * 0.06, Math.sin(a) * rr); };
      for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(gSph, sandM); m.scale.setScalar(0.13); const p = rest(); put(g, m, p.x, p.y + 0.01, p.z); }
      // horseshoe magnet (opening down), hovering above the tray
      const mag = new THREE.Group(); g.add(mag);
      const redM = view.mat('#dc2626', { shininess: 90 }), silM = view.mat('#e2e8f0', { shininess: 120, specular: '#ffffff' });
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.19, 16, 40, Math.PI), redM); put(mag, arc, 0, 1.3, 0);
      [-0.8, 0.8].forEach(x => { cyl(mag, 0.19, 0.19, 1.0, redM, x, 0.8, 0); cyl(mag, 0.2, 0.2, 0.4, silM, x, 0.1, 0); });
      mag.rotation.y = 0.5;
      const iron = [];
      const NF = 12, CYC = 8;
      for (let i = 0; i < NF; i++) {
        const m = new THREE.Mesh(gBox, ironM); m.scale.set(0.3, 0.07, 0.07);
        const p0 = rest(), side = i % 2 ? 1 : -1;
        const tip = new THREE.Vector3(side * 0.8 * Math.cos(0.5), -0.28 - Math.floor(i / 2) * 0.09, -side * 0.8 * Math.sin(0.5)).add(new THREE.Vector3(rnd(-0.12, 0.12), 0, rnd(-0.12, 0.12)));
        put(g, m, p0.x, p0.y, p0.z);
        iron.push({ m, p0, tip, r0: rnd(0, Math.PI), d: rnd(1.6, 2.6), st: rnd(0.7, 1.4), ph: rnd(0, TAU) });
      }
      lab(g, 'Magnetic separation', [0, 3.2, 0], { size: 1.1, fontSize: 46, bg: null, color: INK });
      lab(g, 'Iron filings jump up', [2.9, 1.1, 0], { size: 1.15, color: '#334155' });
      lab(g, 'Sand stays behind', [2.9, -2.6, 0], { size: 1.15, color: SAND });
      methods.magnet = { g, cam: { distance: 12, target: [0.3, -0.5, 0] }, cycle: CYC, update(t, c) {
        mag.position.y = 0.06 * Math.sin(t * 1.6);
        iron.forEach(o => {
          const up = clamp((c - o.st) / o.d, 0, 1), down = clamp((c - 6.4 - o.st * 0.3) / 1.0, 0, 1);
          const e = up * up * (3 - 2 * up) * (1 - down * down * (3 - 2 * down));
          o.m.position.lerpVectors(o.p0, o.tip, e); o.m.position.y += Math.sin(e * Math.PI) * 0.5;
          o.m.position.x += Math.sin(t * 20 + o.ph) * 0.01 * (1 - Math.abs(2 * e - 1));
          o.m.rotation.z = o.r0 * (1 - e) + e * Math.PI / 2;
        });
      } };
    })();

    // ---------- Distillation ----------
    (function () {
      const g = new THREE.Group(); view.scene.add(g);
      const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), -0.4);
      const FX = -3.3, FY = -1.0, FR = 1.0;
      const flask = new THREE.Mesh(gSph, view.mat('#dbeafe', { opacity: 0.22, doubleSide: true, shininess: 120, specular: '#ffffff' })); flask.scale.setScalar(FR); put(g, flask, FX, FY, 0);
      cyl(g, 0.3, 0.3, 1.6, glass(), FX, 0.55 - 0.05, 0, true);
      const lm = view.mat('#4aa8f0', { opacity: 0.55, doubleSide: true }); lm.clippingPlanes = [plane];
      const liq = new THREE.Mesh(gSph, lm); liq.scale.setScalar(FR * 0.92); put(g, liq, FX, FY, 0);
      const surf = new THREE.Mesh(new THREE.CircleGeometry(1, 32), view.mat('#7cc4f7', { opacity: 0.6, doubleSide: true })); surf.rotation.x = -Math.PI / 2; g.add(surf);
      const saltM = view.mat('#e5e7eb', { shininess: 80 });
      for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(gSph, saltM); m.scale.setScalar(0.09); const a = rnd(0, TAU), rr = rnd(0, 0.5); put(g, m, FX + Math.cos(a) * rr, FY - 0.86 + rr * rr * 0.3, Math.sin(a) * rr); }
      cyl(g, 0.22, 0.28, 0.5, view.mat('#64748b'), FX, -2.75, 0);
      const flick = flameOf(g, FX, -2.5, 0.4, 0.75);
      rod(g, [-4.7, -3, 0], [-4.7, 1.0, 0], 0.07); rod(g, [-4.7, 0.9, 0], [FX - 0.3, 0.9, 0], 0.06);
      // delivery tube + condenser
      const A = new THREE.Vector3(FX, 1.35, 0), B = new THREE.Vector3(FX, 1.9, 0), C = new THREE.Vector3(-2.0, 1.9, 0), D = new THREE.Vector3(1.7, -0.9, 0);
      const tubeM = view.mat('#cbd5e1', { opacity: 0.55, shininess: 100 });
      [[A, B], [B, C], [C, D]].forEach(([p, q]) => { const m = view.cylinder(p.toArray(), q.toArray(), 0.14, '#cbd5e1', { opacity: 0.6 }); g.add(m); });
      const dir = D.clone().sub(C), P1 = C.clone().addScaledVector(dir, 0.18), P2 = C.clone().addScaledVector(dir, 0.84);
      const jacket = view.cylinder(P1.toArray(), P2.toArray(), 0.5, '#7dd3fc', { opacity: 0.32, doubleSide: true }); g.add(jacket);
      rod(g, [0.2, -3, -0.6], [0.2, 0.25, -0.6], 0.06); rod(g, [0.2, 0.25, -0.6], [0.2, 0.25, -0.1], 0.05);
      // receiver
      const RX = 1.8, RB = -2.95;
      const rec = view.beaker(1.0, 1.7, { base: RB, level: 0.05, liquidColor: '#8fc9f5', liquidOpacity: 0.5, pos: [RX, 0, 0] }); g.add(rec.group);
      // vapour puffs travelling along the tube, and drops falling into the receiver
      const path = [A, B, C, D], seg = [], total = path.slice(1).reduce((s2, p, i) => { const l = p.distanceTo(path[i]); seg.push(l); return s2 + l; }, 0);
      const gasM = view.mat('#94a3b8', { opacity: 0.8 }), liqM = view.mat('#38bdf8', { opacity: 0.9 });
      const puffs = [];
      for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(gSph, gasM); g.add(m); puffs.push({ m, ph: i / 6 }); }
      const drops = [];
      for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(gSph, view.mat('#0284c7')); m.scale.setScalar(0.08); g.add(m); drops.push(m); }
      lab(g, 'Distillation', [-0.7, 3.3, 0], { size: 1.1, fontSize: 64, bg: null, color: INK });
      lab(g, 'Condenser: vapor to liquid', [1.0, 2.55, 0], { fontSize: 34, size: 1.2, color: '#0369a1' });
      lab(g, 'Pure water', [RX, -3.65, 0], { fontSize: 40, color: '#0369a1' });
      lab(g, 'Salt stays', [FX, -3.65, 0], { fontSize: 40, color: MUTED });
      const CYC = 8;
      methods.distillation = { g, cam: { distance: 12.6, target: [-0.6, -0.5, 0] }, cycle: CYC, update(t, c) {
        flick(t);
        const prog = clamp(c / 7, 0, 1);
        const yw = FY + 0.05 - 0.3 * prog;
        plane.constant = yw;
        const off = yw - FY, rw = FR * 0.92 * Math.sqrt(Math.max(0.001, 1 - (off / (FR * 0.92)) * (off / (FR * 0.92))));
        surf.position.set(FX, yw, 0); surf.scale.setScalar(rw);
        rec.setLevel(0.05 + 0.5 * prog);
        const top = RB + 0.01 + 1.7 * 0.96 * (0.05 + 0.5 * prog);
        puffs.forEach(o => {
          const u = (t * 0.22 + o.ph) % 1; let d = u * total, k = 0;
          while (k < 2 && d > seg[k]) { d -= seg[k]; k++; }
          o.m.position.lerpVectors(path[k], path[k + 1], d / seg[k]);
          o.m.material = (u > 0.6) ? liqM : gasM;
          o.m.scale.setScalar(u > 0.6 ? 0.1 : 0.14 + 0.03 * Math.sin(t * 6 + o.ph * 9));
          o.m.visible = c < CYC - 0.5;
        });
        drops.forEach((m, i) => { const u = (c * 1.0 + i / 3) % 1; m.position.set(D.x + 0.05, D.y - 0.1 - (D.y - 0.1 - top) * u * u, 0); m.visible = c < CYC - 0.5; });
      } };
    })();

    // ---------- method switcher ----------
    const keys = [['filtration', 'Filtration'], ['evaporation', 'Evaporation'], ['magnet', 'Magnet'], ['distillation', 'Distillation']];
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;gap:3px;padding:2px 4px">' +
      keys.map(k => '<button type="button" class="scene-btn" data-k="' + k[0] + '" style="padding:2px 5px;font-size:11px">' + k[1] + '</button>').join('') + '</div>');
    let cur = null, base = 0, now = 0;
    function show(k) {
      cur = methods[k]; base = now;
      Object.keys(methods).forEach(n => { methods[n].g.visible = (n === k); });
      row.querySelectorAll('button').forEach(b => { const on = b.dataset.k === k; b.style.borderColor = on ? 'var(--primary)' : ''; b.style.color = on ? 'var(--primary)' : ''; });
      view.setCamera(cur.cam);
    }
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => show(b.dataset.k)));
    view.run((t) => { now = t; if (cur) { const c = (t - base) % cur.cycle; cur.update(t, c); } });
    show('filtration');
  }));

  // ------------------------------------------------------------------
  // Step 5: concentration (Solute + Volume sliders)
  // ------------------------------------------------------------------
  scenes.push(Chem3D.define({ distance: 7.6, pitch: 0.28, yaw: 0.5, autoRotate: 0.25, target: [0, 1.7, 0] }, (view, ctx) => {
    const R = 1.6, H = 3.6, PRIMARY = '#4f46e5';
    const levelOf = v => 0.25 + (v - 50) / 450 * 0.65;
    const bk = view.beaker(R, H, { level: 0.5, liquidColor: '#38a8ee', liquidOpacity: 0.4 });
    const topOf = v => 0.01 + H * 0.96 * levelOf(v);
    [100, 200, 300, 400, 500].forEach(v => view.ring(R + 0.01, '#64748b', { opacity: 0.45, tube: 0.012, pos: [0, topOf(v), 0] }));
    const gp = new THREE.SphereGeometry(1, 16, 12), mDot = view.mat(ORANGE, { shininess: 90 });
    const dots = [];
    for (let i = 0; i < 25; i++) {
      const m = new THREE.Mesh(gp, mDot); m.scale.setScalar(0.14); m.visible = false; view.scene.add(m);
      dots.push({ m, v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(0.5), placed: false });
    }
    const row = ctx.controls(
      '<div class="scene-slider-row" style="padding:2px 12px"><span style="min-width:48px">Solute</span><input type="range" id="mixc-g" min="5" max="50" step="5" value="20" aria-label="Mass of solute in grams"><span id="mixc-gv" style="min-width:48px;text-align:right">20 g</span></div>' +
      '<div class="scene-slider-row" style="padding:2px 12px"><span style="min-width:48px">Volume</span><input type="range" id="mixc-v" min="50" max="500" step="50" value="200" aria-label="Volume of solution in mL"><span id="mixc-vv" style="min-width:48px;text-align:right">200 mL</span></div>');
    const $ = id => row.querySelector('#' + id), gs = $('mixc-g'), vs = $('mixc-v');
    const ov = overlay(view, 'left:0;right:0;top:4px;text-align:center;font-size:14px;text-shadow:0 0 4px #fff,0 0 4px #fff');
    let top = topOf(200);
    function update() {
      const g = +gs.value, v = +vs.value, conc = g / v;
      $('mixc-gv').textContent = g + ' g'; $('mixc-vv').textContent = v + ' mL';
      ov.innerHTML = 'Solute ' + g + ' g ÷ Solution ' + v + ' mL = <span style="color:' + PRIMARY + ';font-size:17px">' + (Math.round(conc * 100) / 100).toFixed(2) + ' g/mL</span>';
      bk.setLevel(levelOf(v)); top = topOf(v);
      bk.liquidMesh.material.opacity = 0.12 + Math.min(1, Math.sqrt(conc) * 0.9) * 0.55;
      const n = Math.round(g / 2);
      dots.forEach((d, i) => {
        d.m.visible = i < n;
        if (i < n && !d.placed) { d.m.position.copy(inCylinder(R - 0.2, 0.2, top - 0.2)); d.placed = true; }
        if (i >= n) d.placed = false;
      });
    }
    gs.addEventListener('input', update); vs.addEventListener('input', update);
    update();
    view.run((t, dt) => {
      dots.forEach(d => {
        if (!d.m.visible) return;
        jitter(d.v, 0.55, dt, 5); d.m.position.addScaledVector(d.v, dt);
        keepInCylinder(d.m.position, d.v, R - 0.16, 0.16, top - 0.14);
      });
    });
  }));

  // ------------------------------------------------------------------
  // Step 6: oil and water in a jar (Shake button)
  // ------------------------------------------------------------------
  scenes.push(Chem3D.define({ distance: 8.2, pitch: 0.25, yaw: 0.5, autoRotate: 0.2, target: [0, 1.6, 0] }, (view, ctx) => {
    const R = 1.5, H = 3.4, LEVEL = 0.85, N = 20, OIL_H = 0.75;
    const jar = new THREE.Group(); view.scene.add(jar);
    const bk = view.beaker(R, H, { level: 0 }); jar.add(bk.group);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.28, 40), view.mat('#64748b')); lid.position.y = H + 0.16; jar.add(lid);
    const fill = H * 0.96 * LEVEL, top = 0.01 + fill;
    const wat = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 40), view.mat('#38a8ee', { opacity: 0.5, shininess: 90 })); wat.scale.x = wat.scale.z = R * 0.96; jar.add(wat);
    const oil = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 40), view.mat('#facc15', { opacity: 0.72, shininess: 90 })); oil.scale.x = oil.scale.z = R * 0.96; jar.add(oil);
    const gp = new THREE.SphereGeometry(1, 18, 14), mD = view.mat('#facc15', { opacity: 0.92, shininess: 120, specular: '#ffffff', emissive: '#a16207' });
    const drops = []; let totV = 0;
    for (let i = 0; i < N; i++) {
      const r = 0.13 + (i * 7 % 5) * 0.03, m = new THREE.Mesh(gp, mD); m.scale.setScalar(r); jar.add(m);
      drops.push({ m, r, v: new THREE.Vector3(), merged: true }); totV += r * r * r;
    }
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;padding:2px 8px"><button type="button" class="scene-btn" id="mixo-shake">Shake the jar!</button></div>');
    const ov = overlay(view, 'left:0;right:0;top:4px;text-align:center;font-size:12px;line-height:1.35;text-shadow:0 0 4px #fff,0 0 4px #fff');
    ov.innerHTML = '<div style="color:#ea580c;font-size:13px">Oil + water: immiscible</div><div id="mixo-d"></div>';
    const elD = ov.querySelector('#mixo-d'); let lastD = '';
    let E = 0, auto = true;
    const shake = () => {
      E = 1;
      drops.forEach(d => { d.merged = false; d.m.position.copy(inCylinder(R - 0.25, 0.25, top - 0.3)); d.v.set(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(1.2); });
    };
    row.querySelector('#mixo-shake').addEventListener('click', () => { auto = false; shake(); });
    view.run((t, dt) => {
      if (auto && t > 0.4) { auto = false; shake(); }
      E = Math.max(0, E - dt * 0.32);
      const shaking = E > 0.25;
      jar.position.x = shaking ? Math.sin(t * 45) * 0.14 * E : 0;
      jar.rotation.z = shaking ? Math.sin(t * 38) * 0.05 * E : 0;
      let mv = 0, loose = 0;
      drops.forEach(d => { if (d.merged) mv += d.r * d.r * d.r; else loose++; });
      const Hh = OIL_H * mv / totV;
      oil.scale.y = Math.max(0.001, Hh); oil.position.y = top - Hh / 2; oil.visible = Hh > 0.005;
      const wh = fill - Hh; wat.scale.y = wh; wat.position.y = 0.01 + wh / 2;
      const under = top - Hh;
      drops.forEach(d => {
        if (d.merged) { d.m.visible = false; return; }
        d.m.visible = true;
        const p = d.m.position, v = d.v;
        if (shaking) {
          v.x += (Math.random() - 0.5) * 16 * E * dt * 10; v.y += (Math.random() - 0.5) * 16 * E * dt * 10; v.z += (Math.random() - 0.5) * 16 * E * dt * 10;
          const lim = 0.9 + 2.0 * E, sp = v.length(); if (sp > lim) v.multiplyScalar(lim / sp);
        } else {
          v.x *= 1 - Math.min(1, dt * 3); v.z *= 1 - Math.min(1, dt * 3);
          v.y += ((0.45 + d.r * 1.3) - v.y) * Math.min(1, dt * 3);
        }
        p.addScaledVector(v, dt);
        keepInCylinder(p, v, R * 0.96 - d.r, 0.02 + d.r, top - d.r);
        if (!shaking && p.y + d.r >= under - 0.01) d.merged = true;
      });
      const msg = shaking ? 'Shaking breaks the oil into tiny droplets.' : loose > 0 ? 'Oil is less dense, so the droplets rise and join together.' : 'Two layers again: oil floats on water.';
      if (msg !== lastD) { elD.textContent = msg; lastD = msg; }
    });
  }));

  // ------------------------------------------------------------------
  // Step 7: paper chromatography — water climbs a paper strip and the ink dot splits into dyes
  // ------------------------------------------------------------------
  scenes.push(Chem3D.define({ distance: 9, pitch: 0.2, yaw: 0.45, autoRotate: 0.22, target: [-0.3, 2.4, 0] }, (view) => {
    const put = (mesh, x, y, z) => { mesh.position.set(x, y, z); view.scene.add(mesh); return mesh; };
    const D = 10, YS = 1.3, YMAX = 4.3;
    // beaker with a little water, ring stand + clip holding the strip
    view.beaker(1.5, 1.7, { level: 0.4, liquidColor: '#8fc9f5', liquidOpacity: 0.5 });
    const wTop = 0.01 + 1.7 * 0.96 * 0.4;
    put(new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.15, 2.4), view.mat('#cbd5e1')), -0.8, -0.09, 0);
    view.cylinder([-2.3, -0.02, 0], [-2.3, 5.5, 0], 0.07, '#64748b');
    view.cylinder([-2.3, 5.3, 0], [0, 5.3, 0], 0.06, '#64748b');
    put(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 0.22), view.mat('#475569')), 0, 5.1, 0);
    // the strip (thin box) and the wet part
    const stripTop = 5.0, stripBot = 0.4, SW = 0.9;
    put(new THREE.Mesh(new THREE.BoxGeometry(SW, stripTop - stripBot, 0.04), view.mat('#fffef5', { shininess: 5 })), 0, (stripTop + stripBot) / 2, 0);
    const wet = put(new THREE.Mesh(new THREE.BoxGeometry(SW + 0.02, 1, 0.07), view.mat('#38bdf8', { opacity: 0.32, shininess: 40 })), 0, 1, 0);
    for (let i = 0; i < 6; i++) put(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.055), view.mat('#6b7280')), -0.34 + i * 0.136, YS, 0);
    const dot = put(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), view.mat('#111827', { shininess: 30 })), 0, YS, 0); dot.scale.set(0.17, 0.17, 0.08);
    const dyes = [['Yellow', '#eab308', 0.78], ['Red', '#dc2626', 0.58], ['Blue', '#2563eb', 0.36]].map(([name, col, k]) => {
      const m = put(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), view.mat(col, { shininess: 40 })), 0, YS, 0);
      const lab = view.label(name, [1.75, YS, 0], { size: 0.8, fontSize: 56, color: col }); lab.visible = false;
      return { name, m, k, lab };
    });
    const startLab = view.label('Start', [-1.6, YS, 0], { size: 0.75, fontSize: 52, color: '#334155', bg: 'rgba(255,255,255,0.8)' });
    shiftView(view, 0.17);
    const ov = overlay(view, 'right:6px;top:6px;width:38%;font-size:11px;line-height:1.35;text-shadow:0 0 4px #fff,0 0 4px #fff;font-weight:600');
    ov.innerHTML = '<div style="font-size:12px;font-weight:800;color:#4f46e5">Chromatography</div>Water climbs up the paper, carrying the dyes with it. Dyes that dissolve best travel the farthest.';
    view.run((t, dt) => {
      shiftView(view, 0.17);
      const f = (t % D) / D, on = f < 0.97;
      const front = wTop + (YMAX - wTop) * clamp((f - 0.02) / 0.78, 0, 1);
      wet.visible = on; wet.scale.y = Math.max(0.01, front - stripBot); wet.position.y = stripBot + (front - stripBot) / 2;
      const ds = on ? 1 - clamp((f - 0.17) / 0.12, 0, 1) : 1;
      dot.scale.set(0.17 * ds, 0.17 * ds, 0.08 * ds); dot.visible = ds > 0.02;
      dyes.forEach(d => {
        const y = YS + d.k * Math.max(0, front - YS), grow = on ? clamp((front - YS) / 0.6, 0, 1) * clamp((f - 0.14) / 0.06, 0, 1) : 0;
        d.m.position.y = y;
        d.m.scale.set(0.2 * grow, (0.06 + 0.09 * (y - YS) / 2.5) * grow, 0.08 * grow); d.m.visible = grow > 0.01;
        d.lab.position.y = y; d.lab.visible = on && f > 0.72;
      });
    });
  }));

  // ------------------------------------------------------------------
  // Step 8: air is a mixture of gases (All / Nitrogen / Oxygen / Other)
  // ------------------------------------------------------------------
  scenes.push(Chem3D.define({ distance: 8, pitch: 0.25, yaw: 0.5, autoRotate: 0.25, target: [0, 0, 0] }, (view, ctx) => {
    const BW = 4.2, BH = 3.4, BD = 3.2;
    glassBox(view, BW, BH, BD, [0, 0, 0]);
    const gS = new THREE.SphereGeometry(1, 14, 10), gC = new THREE.CylinderGeometry(1, 1, 1, 8);
    const kinds = {
      N: { col: Chem3D.color('N'), n: 39, bonds: 3, r: 0.19 },
      O: { col: Chem3D.color('O'), n: 10, bonds: 2, r: 0.2 },
      X: { col: GREEN, n: 1, bonds: 0, r: 0.3 }
    };
    Object.keys(kinds).forEach(k => {
      const o = kinds[k];
      o.mat = view.mat(o.col, { shininess: 80 }); o.mat.transparent = true;
      o.bmat = view.mat('#e2e8f0', { shininess: 30 }); o.bmat.transparent = true;
      o.op = 1; o.target = 1;
    });
    const all = [];
    Object.keys(kinds).forEach(k => {
      const o = kinds[k];
      for (let i = 0; i < o.n; i++) {
        const g = new THREE.Group();
        if (k === 'X') {
          const a = new THREE.Mesh(gS, o.mat); a.scale.setScalar(o.r); g.add(a);
        } else {
          [-0.26, 0.26].forEach(x => { const a = new THREE.Mesh(gS, o.mat); a.scale.setScalar(o.r); a.position.x = x; g.add(a); });
          for (let b = 0; b < o.bonds; b++) {
            const c = new THREE.Mesh(gC, o.bmat), off = (b - (o.bonds - 1) / 2) * 0.1;
            c.scale.set(0.035, 0.52, 0.035); c.rotation.z = Math.PI / 2; c.position.set(0, off, 0); g.add(c);
          }
        }
        g.position.set(rnd(-1.5, 1.5), rnd(-1.2, 1.2), rnd(-1.1, 1.1));
        g.quaternion.setFromEuler(new THREE.Euler(rnd(0, TAU), rnd(0, TAU), rnd(0, TAU)));
        view.scene.add(g);
        all.push({ k, g, v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(rnd(0.7, 1.3)), axis: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(), spin: rnd(0.6, 1.8), m: k === 'X' ? 0.4 : 0.55 });
      }
    });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;gap:6px;padding:2px 8px">' +
      [['all', 'All'], ['N', 'Nitrogen'], ['O', 'Oxygen'], ['X', 'Other']].map(k => '<button type="button" class="scene-btn" data-k="' + k[0] + '" style="padding:3px 9px">' + k[1] + '</button>').join('') + '</div>');
    shiftView(view, 0.2);
    const ov = overlay(view, 'right:8px;top:8px;width:36%;font-size:11px;line-height:1.3;font-weight:600');
    const rows = [['N', 'Nitrogen (N₂)', 'about 78%', kinds.N.col], ['O', 'Oxygen (O₂)', 'about 21%', kinds.O.col], ['X', 'Other gases', 'about 1%', kinds.X.col]];
    ov.innerHTML = rows.map(r => '<div data-r="' + r[0] + '" style="margin-bottom:8px;transition:opacity .25s"><div style="display:flex;align-items:center;gap:5px;font-weight:800;font-size:12px"><span style="width:10px;height:10px;border-radius:50%;background:' + r[3] + ';display:inline-block"></span>' + r[1] + '</div><div style="margin-left:15px;color:#475569;font-size:13px;font-weight:800">' + r[2] + '</div></div>').join('');
    let mode = 'all';
    const paint = () => {
      row.querySelectorAll('button').forEach(b => { const on = b.dataset.k === mode; b.style.borderColor = on ? 'var(--primary)' : ''; b.style.color = on ? 'var(--primary)' : ''; });
      ov.querySelectorAll('[data-r]').forEach(d => { d.style.opacity = mode === 'all' || mode === d.dataset.r ? 1 : 0.3; });
      Object.keys(kinds).forEach(k => { kinds[k].target = mode === 'all' || mode === k ? 1 : 0.13; });
    };
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.k; paint(); }));
    paint();
    const inner = { x: BW / 2, y: BH / 2, z: BD / 2 };
    view.run((t, dt) => {
      shiftView(view, 0.2);
      Object.keys(kinds).forEach(k => {
        const o = kinds[k]; o.op += (o.target - o.op) * Math.min(1, dt * 6);
        o.mat.opacity = o.op; o.bmat.opacity = o.op;
        const solid = o.op > 0.9; o.mat.depthWrite = solid; o.bmat.depthWrite = solid;
      });
      all.forEach(p => {
        jitter(p.v, 1.0, dt, 3);
        p.g.position.addScaledVector(p.v, dt);
        p.g.rotateOnWorldAxis(p.axis, p.spin * dt);
        const q = p.g.position, v = p.v;
        ['x', 'y', 'z'].forEach(ax => { const lim = inner[ax] - p.m; if (q[ax] > lim) { q[ax] = lim; v[ax] = -Math.abs(v[ax]); } if (q[ax] < -lim) { q[ax] = -lim; v[ax] = Math.abs(v[ax]); } });
      });
    });
  }));

  // @@NEXT-STEP

  // Explanations / narration re-written for the 3D pictures (overrides the flat-scene texts).
  addTutorialExplanations('chemistry', 'mixtures', [
    {
      explain: '<p>The left glass box holds a <b>mixture</b>: 5 big <b>orange</b> and 3 small <b>blue</b> particles drifting on their own, in uneven amounts. In the right box, the <b>compound</b>, each orange particle is joined to a blue one by a black <b>bond</b> stick. There are 6 pairs, and each pair tumbles as one unit.</p><p>Notice that only the compound has bonds.</p>',
      say: 'Look at the two glass boxes. This picture is in three dimensions, so you can drag it to turn it around. The left box is a mixture. It has five big orange particles and three small blue ones, all drifting around on their own. Nothing is joined together, and the amounts do not have to match. The right box is a compound. Here every big orange particle is joined to a small blue one by a black stick, which stands for a chemical bond, and each pair moves as one unit. The ratio is fixed. In a mixture, the substances are only physically combined. In a compound, the atoms are chemically bonded.'
    },
    {
      explain: '<p>Small <b>blue dots</b> are water; <b>gold cubes</b> are sugar, dropping in and piling up on the bottom. As cubes dissolve they shrink and wander through the water. The counters at the top track <b>Dissolved</b> and <b>Still solid</b> (total always 24). <b>Stir</b> swings a rod, and <b>Temp</b> sets the speed and how much can dissolve.</p>',
      say: 'Look at the beaker of water. The small blue dots are water particles, and the gold cubes are sugar. Watch them drop in and pile up at the bottom. Little by little, sugar particles break away and wander between the water particles all through the beaker. That is dissolving. The counters at the top show how many are dissolved and how many are still solid, and the total stays at twenty four. No sugar is lost, because dissolving is a physical change. Now press the stir button and watch the rod swing. It speeds things up. Then drag the temperature slider higher. Hot water dissolves sugar faster and can hold more. If you see the word saturated, heat it up.'
    },
    {
      explain: '<p>In the <b>Salt water</b> beaker, small blue and grey dots are spread evenly through the whole volume: <b>homogeneous</b>. In <b>Sand and water</b>, brown grains sink and pile up on the floor of the beaker, then the scene repeats: <b>heterogeneous</b>.</p><p>Notice that in a solution you cannot pick out separate parts.</p>',
      say: 'Compare the two beakers. One holds salt water. The blue and grey dots are the dissolved salt, and they are spread evenly through the whole beaker, top to bottom, jiggling around. It looks the same everywhere, so you cannot see separate parts. That is called homogeneous. The other beaker holds sand and water. Watch the brown sand grains. They sink and pile up on the bottom, and then after a few seconds the animation repeats. Here you can clearly see two different parts, so this is called heterogeneous. Notice that a solution is even all the way through, but sand in water is uneven.'
    },
    {
      explain: '<p>Press a button to build each apparatus. <b>Filtration</b>: sand is caught by the paper in the funnel, water drips into the beaker. <b>Evaporation</b>: a burner heats a dish, steam rises and white salt crystals remain. <b>Magnet</b>: dark iron filings jump to a horseshoe magnet, sand stays. <b>Distillation</b>: vapor cools in the condenser tube and drips out as pure water.</p>',
      say: 'This scene shows four ways to pull a mixture apart. It starts with filtration. Look at the funnel. The brown sand grains are caught by the filter paper, but the water passes through and drips into the beaker below. Now press evaporation. A burner heats a dish of salt water. The water leaves as vapor, and white salt crystals are left behind. Try the magnet next. Iron filings jump up to the magnet, while the sand stays put. Finally, press distillation. The water vapor travels along the tube, cools back into a liquid in the condenser, and drips into the beaker as pure water. Each method uses a physical difference between the parts.'
    },
    {
      explain: '<p>The beaker\'s <b>blue liquid</b> is the solution and each <b>orange ball</b> is 2 g of solute floating in it. The <b>Solute</b> slider adds balls and deepens the blue; the <b>Volume</b> slider changes the water level against the ring marks. The line at the top divides <b>mass ÷ volume</b> to give the concentration in g/mL.</p><p>Notice that more solute raises it and more water lowers it.</p>',
      say: 'Look at the beaker. The blue liquid is the solution, and each orange ball is a bit of solute, one ball for every two grams. At the top, the scene divides the mass of the solute by the volume of the solution. Right now that is twenty grams divided by two hundred milliliters, which gives zero point one grams per milliliter. That number is the concentration. Now drag the solute slider up. More balls appear, the blue gets deeper, and the concentration rises. Next, drag the volume slider up instead. The same solute is spread through more liquid, so the number falls. Notice that concentration depends on both amounts.'
    },
    {
      explain: '<p>A jar holds <b>blue water</b> with <b>yellow oil</b> on top. It shakes by itself at the start, and <b>Shake the jar!</b> shakes it again. The oil breaks into round <b>droplets</b> that scatter through the water, then rise and merge into a <b>yellow layer on top</b>. The text above the jar changes at each stage.</p><p>Notice that the oil never truly mixes.</p>',
      say: null
    },
    {
      explain: '<p>A paper strip hangs from a stand into a beaker with a little water. A <b>black ink dot</b> sits on the dashed <b>Start</b> line. Pale blue water climbs the strip, the dot fades, and it splits into <b>yellow</b>, <b>red</b> and <b>blue</b> spots. Yellow travels farthest and blue the least. Then it repeats.</p><p>Notice that the black ink was a mixture of dyes.</p>',
      say: null
    },
    {
      explain: '<p>The glass box is a tiny sample of air. <b>Blue pairs</b> are nitrogen, <b>red pairs</b> are oxygen, and the single <b>green ball</b> stands for other gases. They all tumble and bounce freely in 3D. The key beside the box gives about <b>78%</b>, <b>21%</b> and <b>1%</b>. The buttons fade all but one gas.</p><p>Notice that the gases are mixed, not bonded to each other.</p>',
      say: 'Look inside the glass box. It is a tiny sample of air. The blue pairs are nitrogen molecules, and there are lots of them. The red pairs are oxygen molecules, and there are fewer. The single green ball stands for the other gases, such as argon. They all tumble around in three dimensions and mix together, but they are not joined to one another. Read the key beside the box. Air is about seventy eight percent nitrogen, twenty one percent oxygen, and one percent other gases. Now press one of the buttons, like oxygen. The other gases fade out, so you can follow just that one. Notice that air is a mixture, so each gas keeps its own properties.'
    }
  ]);

  addTutorialScenes3D('chemistry', 'mixtures', scenes);
})();
