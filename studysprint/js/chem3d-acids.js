(function () {
  // 3D scenes for chemistry/acids: addTutorialScenes3D('chemistry', 'acids', [...8 scenes...]).
  const T = THREE;

  // ---------------------------------------------------------------- shared helpers
  // Universal-indicator style colour for a pH value (0 red ... 7 green ... 14 purple) - same as the flat scene.
  const PH_STOPS = [
    [0, [229, 50, 45]], [3, [242, 140, 40]], [5, [245, 208, 32]],
    [7, [63, 185, 80]], [10, [59, 130, 246]], [14, [124, 58, 237]]
  ];
  function phRGB(ph) {
    const p = Math.max(0, Math.min(14, ph));
    for (let i = 1; i < PH_STOPS.length; i++) {
      if (p <= PH_STOPS[i][0]) {
        const a = PH_STOPS[i - 1], b = PH_STOPS[i], f = (p - a[0]) / (b[0] - a[0]);
        return a[1].map((v, k) => v + (b[1][k] - v) * f);
      }
    }
    return PH_STOPS[PH_STOPS.length - 1][1].slice();
  }
  const rgbStr = c => 'rgb(' + c.map(v => Math.round(Math.max(0, Math.min(255, v)))).join(',') + ')';
  const phColor = ph => rgbStr(phRGB(ph));
  const lerpArr = (a, b, f) => a.map((v, k) => v + (b[k] - v) * f);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  // Ion kinds: [label, colour, radius]
  const ION = {
    H: ['H⁺', '#e5322d', 0.3],
    Cl: ['Cl⁻', '#94a3b8', 0.42],
    Na: ['Na⁺', '#64748b', 0.44],
    OH: ['OH⁻', '#2563eb', 0.38]
  };

  // A labelled ion sphere (label is a child sprite, so it follows the sphere).
  function makeIon(view, kind, pos) {
    const c = ION[kind];
    const m = view.sphere(c[2], c[1], { shininess: 60 });
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    const s = view.label(c[0], [0, 0, 0], { size: 0.62, color: '#ffffff', bold: true, fontSize: 60 });
    m.add(s); s.scale.multiplyScalar(1 / m.scale.x);
    m.userData.kind = kind; m.userData.r = c[2];
    return m;
  }

  // Free-moving particles inside a cylinder (world coords): bounce off the glass and off each other.
  function makeGas(region) {
    const parts = [];
    function place(p) {
      const R = region.R - p.r;
      for (let k = 0; k < 20; k++) {
        const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * R;
        p.m.position.set(region.cx + Math.cos(a) * d, rand(region.y0 + p.r, region.y1 - p.r), region.cz + Math.sin(a) * d);
        if (parts.every(q => q === p || !q.on || q.m.position.distanceTo(p.m.position) > (q.r + p.r) * 1.1)) break;
      }
    }
    function add(m, speed) {
      const p = { m, r: m.userData.r || 0.3, on: true, v: new T.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(speed || 0.6), sp: speed || 0.6 };
      parts.push(p);
      place(p);
      return p;
    }
    const tmp = new T.Vector3();
    function step(dt) {
      dt = Math.min(dt, 0.05);
      parts.forEach(p => {
        if (!p.on || p.hold) return;
        const pos = p.m.position;
        pos.addScaledVector(p.v, dt);
        // jitter so it never settles
        p.v.x += rand(-1, 1) * dt * 2; p.v.y += rand(-1, 1) * dt * 2; p.v.z += rand(-1, 1) * dt * 2;
        p.v.setLength(p.sp * (0.8 + 0.4 * Math.random()));
        const R = region.R - p.r, dx = pos.x - region.cx, dz = pos.z - region.cz, d = Math.hypot(dx, dz);
        if (d > R) {
          const nx = dx / d, nz = dz / d, dot = p.v.x * nx + p.v.z * nz;
          if (dot > 0) { p.v.x -= 2 * dot * nx; p.v.z -= 2 * dot * nz; }
          pos.x = region.cx + nx * R; pos.z = region.cz + nz * R;
        }
        if (pos.y < region.y0 + p.r) { pos.y = region.y0 + p.r; p.v.y = Math.abs(p.v.y); }
        if (pos.y > region.y1 - p.r) { pos.y = region.y1 - p.r; p.v.y = -Math.abs(p.v.y); }
      });
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i]; if (!a.on || a.hold) continue;
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j]; if (!b.on || b.hold) continue;
          tmp.copy(a.m.position).sub(b.m.position);
          const d = tmp.length(), min = (a.r + b.r) * 1.08;
          if (d < min && d > 1e-4) {
            tmp.multiplyScalar((min - d) / d / 2);
            a.m.position.add(tmp); b.m.position.sub(tmp);
            const t2 = tmp.clone().normalize();
            const va = a.v.dot(t2), vb = b.v.dot(t2);
            if (va - vb < 0) { a.v.addScaledVector(t2, vb - va); b.v.addScaledVector(t2, va - vb); }
          }
        }
      }
    }
    return { parts, add, step, place };
  }

  // Tabletop slab for the apparatus to stand on.
  function table(view, w, d, y) {
    const t = view.box(w, 0.16, d, '#e2e8f0', { shininess: 30 });
    t.position.set(0, (y || 0) - 0.08, 0);
    return t;
  }

  // A rainbow bar (vertex-coloured box). colorAt(f) gets 0..1 along the bar and returns a CSS colour string.
  function gradBar(view, x0, x1, y, z, h, d, colorAt) {
    const w = x1 - x0;
    const g = new T.BoxGeometry(w, h, d, 56, 1, 1);
    const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      c.set(colorAt((pos.getX(i) / w) + 0.5));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new T.BufferAttribute(col, 3));
    const m = new T.Mesh(g, new T.MeshPhongMaterial({ vertexColors: true, shininess: 50, specular: new T.Color('#666666') }));
    m.position.set((x0 + x1) / 2, y, z);
    view.scene.add(m);
    return m;
  }

  // A downward-pointing marker cone whose tip sits at (x, y, z).
  function pointerCone(view, col) {
    const m = new T.Mesh(new T.ConeGeometry(0.32, 0.75, 20), view.mat(col || '#0f172a', { shininess: 40 }));
    m.rotation.x = Math.PI;      // tip down
    view.scene.add(m);
    m.userData.setTip = (x, y, z) => m.position.set(x, y + 0.375 * m.scale.y, z);
    return m;
  }

  // Gentle side-to-side sway of the camera instead of a full turn (keeps front-facing panels readable). Adds to user drags.
  function makeSway(view, amp, speed) {
    let prev = 0;
    view.autoRotate = 0;
    return t => { const s = amp * Math.sin(t * speed); view.cam.yaw += s - prev; prev = s; };
  }


  // A turntable: objects added with TT.add() turn about a vertical axis through x = cx (slowly by themselves, and when the
  // user drags), while the camera yaw stays fixed - so a readout panel next to the apparatus never gets in its way.
  function makeTurntable(view, cx, speed) {
    const pivot = new T.Group(); pivot.position.set(cx, 0, 0);
    const inner = new T.Group(); inner.position.set(-cx, 0, 0);
    pivot.add(inner); view.scene.add(pivot);
    const base = view.cam.yaw;
    let spin = 0, idleUntil = 0;
    view.autoRotate = 0;
    view.canvas.addEventListener('dblclick', () => { spin = 0; pivot.rotation.y = 0; });
    return {
      inner,
      add(o) { inner.add(o); return o; },
      update(dt) {
        const d = view.cam.yaw - base;
        if (d) { spin -= d; view.cam.yaw = base; idleUntil = performance.now() + 2500; }
        else if (performance.now() > idleUntil) spin += (speed != null ? speed : 0.25) * dt;
        pivot.rotation.y = spin;
      }
    };
  }

  // Wide text label (1024 px canvas) for long strings; always faces the camera. sprite.userData.setText(str) updates it.
  function wideLabel(view, text, pos, o) {
    o = o || {};
    const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
    const ctx = c.getContext('2d');
    const tex = new T.CanvasTexture(c);
    const mat = new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
    const sprite = new T.Sprite(mat);
    sprite.renderOrder = 999;
    const size = o.size || 0.9;
    sprite.scale.set(size * 8, size, 1);
    function draw(t) {
      ctx.clearRect(0, 0, 1024, 128);
      ctx.font = '800 ' + (o.fontSize || 64) + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (o.bg) { const w = Math.min(1000, ctx.measureText(t).width + 40); ctx.fillStyle = o.bg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(512 - w / 2, 22, w, 84, 24) : ctx.rect(512 - w / 2, 22, w, 84); ctx.fill(); }
      else { ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = o.outline || 'rgba(255,255,255,0.92)'; ctx.strokeText(t, 512, 66); }
      ctx.fillStyle = o.color || '#1f2937'; ctx.fillText(t, 512, 66);
      tex.needsUpdate = true;
    }
    draw(String(text));
    sprite.userData.setText = t => draw(String(t));
    if (pos) sprite.position.set(pos[0], pos[1], pos[2]);
    view.scene.add(sprite);
    return sprite;
  }

  // A pale glass beaker with a tinted liquid at x (returns the kit's beaker object).
  function makeBeaker(view, x, r, h, level, liquidCol, opacity) {
    return view.beaker(r, h, { pos: [x, 0, 0], level, liquidColor: liquidCol, liquidOpacity: opacity != null ? opacity : 0.4 });
  }

  // ---------------------------------------------------------------- scene 1: acid and base in water
  const scene1 = Chem3D.define({ distance: 11.4, pitch: 0.3, yaw: 0.45, target: [0, 2.3, 0], autoRotate: 0.22 }, (view) => {
    table(view, 9.6, 4.2, 0);
    const R = 1.7, H = 3.6, LV = 0.72;
    const left = makeBeaker(view, -2.65, R, H, LV, '#fdd9c8', 0.34);
    const right = makeBeaker(view, 2.65, R, H, LV, '#cfe0fb', 0.34);
    const top = H * 0.96 * LV - 0.15;
    const gasL = makeGas({ cx: -2.65, cz: 0, R: R * 0.95, y0: 0.12, y1: top });
    const gasR = makeGas({ cx: 2.65, cz: 0, R: R * 0.95, y0: 0.12, y1: top });
    ['H', 'H', 'H', 'H', 'Cl', 'Cl'].forEach(k => gasL.add(makeIon(view, k), 0.7));
    ['OH', 'OH', 'OH', 'OH', 'Na', 'Na'].forEach(k => gasR.add(makeIon(view, k), 0.7));
    view.label('Acid', [-2.65, 4.95, 0], { size: 1.0, color: '#dc2626', fontSize: 68 });
    view.label('Base', [2.65, 4.95, 0], { size: 1.0, color: '#2563eb', fontSize: 68 });
    view.label('HCl gives H⁺', [-2.65, 4.15, 0], { size: 0.8, color: '#1f2937', fontSize: 56 });
    view.label('NaOH gives OH⁻', [2.65, 4.15, 0], { size: 0.8, color: '#1f2937', fontSize: 56 });
    view.run((t, dt) => { gasL.step(dt); gasR.step(dt); });
  });

  // ---------------------------------------------------------------- scene 2: the pH scale
  const scene2 = Chem3D.define({ fov: 30, distance: 14.2, pitch: 0.3, yaw: 0.0, target: [0, -0.1, 0] }, (view) => {
    const X0 = -4.5, X1 = 4.5, W = X1 - X0, xs = ph => X0 + (ph / 14) * W;
    // dark base slab + the rainbow bar
    const slab = view.box(W + 0.5, 0.25, 1.5, '#1e293b', { shininess: 30 });
    slab.position.set(0, -0.5, 0);
    gradBar(view, X0, X1, 0, 0, 0.75, 1.1, f => phColor(f * 14));
    for (let i = 0; i <= 14; i++) {
      const tick = view.box(0.05, 0.14, 1.1, '#0f172a', { shininess: 10 });
      tick.position.set(xs(i), 0.42, 0);
      view.label(String(i), [xs(i), -1.0, 0.2], { size: 0.8, fontSize: 80, color: '#0f172a' });
    }
    view.label('ACIDIC', [xs(3), -1.85, 0], { size: 0.95, color: '#dc2626', fontSize: 64 });
    view.label('NEUTRAL', [xs(7), -1.85, 0], { size: 0.95, color: '#16a34a', fontSize: 64 });
    view.label('BASIC', [xs(11), -1.85, 0], { size: 0.95, color: '#2563eb', fontSize: 64 });
    wideLabel(view, 'Each step down = 10× more acidic', [0, -2.75, 0], { size: 0.95, color: '#4f46e5', fontSize: 60 });
    const ptr = pointerCone(view, '#0f172a');
    const stem = view.cylinder([0, 0, 0], [0, 1, 0], 0.05, '#0f172a');
    const nameL = view.label('Stomach acid', [0, 2.35, 0], { size: 1.0, color: '#ffffff', bg: '#0f172a', fontSize: 58 });
    const valL = view.label('pH 1.5 (acid)', [0, 1.5, 0], { size: 0.85, color: '#0f172a', fontSize: 56 });
    const items = [['Stomach acid', 1.5], ['Lemon juice', 2], ['Vinegar', 2.8], ['Coffee', 5], ['Milk', 6.5],
      ['Pure water', 7], ['Baking soda', 9], ['Soap', 10], ['Ammonia', 11], ['Bleach', 12.5]];
    let cur = xs(1.5), last = -1, bob = 0;
    const sway = makeSway(view, 0.3, 0.4);
    view.run((t, dt) => {
      sway(t);
      const i = Math.floor(t / 2.2) % items.length;
      if (i !== last) {
        last = i;
        const p = items[i][1];
        nameL.userData.setText(items[i][0]);
        valL.userData.setText('pH ' + p + (p < 7 ? ' (acid)' : p > 7 ? ' (base)' : ' (neutral)'));
      }
      cur += (xs(items[i][1]) - cur) * Math.min(1, dt * 4);
      bob = 0.12 * Math.sin(t * 3);
      const bx = clamp(cur, -3.1, 3.1);
      ptr.userData.setTip(cur, 0.6 + bob, 0);
      view.placeCylinder(stem, [cur, 1.3 + bob, 0], [cur, 1.65 + bob, 0], 0.05);
      nameL.position.set(bx, 2.55, 0); valL.position.set(bx, 1.75, 0);
    });
  });

  // Piecewise-linear keyframes: kts ascending 0..1, vals numbers.
  function keyf(u, kts, vals) {
    for (let i = 1; i < kts.length; i++) {
      if (u <= kts[i]) { const f = kts[i] === kts[i - 1] ? 1 : (u - kts[i - 1]) / (kts[i] - kts[i - 1]); return vals[i - 1] + (vals[i] - vals[i - 1]) * f; }
    }
    return vals[vals.length - 1];
  }

  // ---------------------------------------------------------------- scene 3: indicators (litmus paper)
  const scene3 = Chem3D.define({ distance: 10.8, pitch: 0.2, yaw: 0, target: [0, 1.5, 0] }, (view) => {
    const sway = makeSway(view, 0.4, 0.35);
    table(view, 8.4, 3.2, 0);
    const R = 1.3, H = 2.6, LV = 0.6, X = 2.15;
    makeBeaker(view, -X, R, H, LV, '#fde047', 0.5);
    makeBeaker(view, X, R, H, LV, '#bfdbfe', 0.45);
    const surf = 0.01 + H * 0.96 * LV;
    const RED = '#e5322d', BLUE = '#3b6fe0';
    // floating lemon slice in the acid, soap bubbles in the base
    const slice = new T.Group();
    const rind = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.09, 32), view.mat('#facc15', { shininess: 30 }));
    const pulp = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.1, 32), view.mat('#fef9c3', { shininess: 30 }));
    slice.add(rind, pulp);
    for (let i = 0; i < 6; i++) {
      const seg = view.box(0.03, 0.11, 0.3, '#fde68a', {}); seg.position.set(Math.sin(i * 1.047) * 0.17, 0, Math.cos(i * 1.047) * 0.17); seg.rotation.y = i * 1.047; slice.add(seg);
    }
    slice.position.set(-X + 0.35, surf + 0.03, 0.25); view.scene.add(slice);
    const bubbles = [];
    for (let i = 0; i < 6; i++) {
      const b = view.sphere(0.13 + 0.05 * (i % 3), '#ffffff', { opacity: 0.55 });
      b.position.set(X + Math.cos(i * 1.9) * 0.7, surf + 0.05, Math.sin(i * 1.9) * 0.7); bubbles.push(b);
    }
    // litmus strips: paper + wet tip + clip + wire, origin at the tip (bottom)
    function strip(x, from, to) {
      const g = new T.Group();
      const paper = new T.Mesh(new T.BoxGeometry(0.4, 1.7, 0.05), view.mat(from, { shininess: 15 }));
      paper.position.y = 0.85;
      const tip = new T.Mesh(new T.BoxGeometry(0.41, 0.75, 0.055), view.mat(from, { shininess: 15 }));
      tip.position.y = 0.375;
      const clip = new T.Mesh(new T.BoxGeometry(0.5, 0.35, 0.16), view.mat('#64748b', { shininess: 40 }));
      clip.position.y = 1.65;
      const wire = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.75, 10), view.mat('#64748b', { shininess: 40 }));
      wire.position.y = 2.1;
      g.add(paper, tip, clip, wire);
      g.position.set(x, 2.1, 0);
      view.scene.add(g);
      return { g, tip, from: new T.Color(from), to: new T.Color(to) };
    }
    const sA = strip(-X, BLUE, RED), sB = strip(X, RED, BLUE);
    const rA = view.label('Blue → RED', [-X, 4.75, 0], { size: 1.0, color: RED, fontSize: 58 });
    const rB = view.label('Red → BLUE', [X, 4.75, 0], { size: 1.0, color: BLUE, fontSize: 58 });
    view.label('lemon juice (acid)', [-X, -0.55, 0.4], { size: 0.95, color: '#1f2937', fontSize: 48 });
    view.label('soapy water (base)', [X, -0.55, 0.4], { size: 0.95, color: '#1f2937', fontSize: 48 });
    view.label('blue litmus', [-X, -1.05, 0.4], { size: 0.85, color: '#475569', fontSize: 56 });
    view.label('red litmus', [X, -1.05, 0.4], { size: 0.85, color: '#475569', fontSize: 56 });
    const tmpC = new T.Color();
    view.run((t) => {
      sway(t);
      const u = (t % 8) / 8;
      const dy = keyf(u, [0, 0.1, 0.3, 0.6, 0.8, 1], [0, 0, -1.2, -1.2, 0, 0]);
      const fc = keyf(u, [0, 0.3, 0.42, 0.85, 0.92, 1], [0, 0, 1, 1, 1, 0]);
      const op = keyf(u, [0, 0.4, 0.48, 0.85, 0.92, 1], [0, 0, 1, 1, 0, 0]);
      [sA, sB].forEach(s => { s.g.position.y = 2.1 + dy; tmpC.copy(s.from).lerp(s.to, fc); s.tip.material.color.copy(tmpC); });
      rA.material.opacity = op; rB.material.opacity = op;
      slice.position.y = surf + 0.03 + 0.03 * Math.sin(t * 1.7); slice.rotation.y = t * 0.3; slice.rotation.z = 0.05 * Math.sin(t * 1.3);
      bubbles.forEach((b, i) => { b.position.y = surf + 0.05 + 0.04 * Math.sin(t * 2 + i); });
    });
  });

  // How many H+ / OH- balls to show at a given pH (same rule as the flat scene).
  function ionCounts(ph, MAXP) {
    const strong = Math.abs(7 - ph) / 7;
    const major = Math.round(1 + strong * (MAXP - 1));
    const minor = Math.max(0, Math.round(1 - Math.abs(7 - ph) / 2));
    return ph < 7 ? [major, minor] : ph > 7 ? [minor, major] : [1, 1];
  }
  const LIKE = ['battery acid', 'stomach acid', 'lemon juice', 'vinegar', 'tomato juice', 'coffee', 'milk', 'pure water',
    'sea water', 'baking soda', 'soap', 'ammonia cleaner', 'limewater', 'bleach', 'drain cleaner'];

  // ---------------------------------------------------------------- scene 4: try it - slide the pH
  const scene4 = Chem3D.define({ fov: 30, distance: 10.6, pitch: 0.24, yaw: 0.05, target: [0.65, 1.55, 0] }, (view, ctx) => {
    const TT = makeTurntable(view, -2.4);
    table(view, 9.0, 3.4, 0);
    const R = 1.55, H = 3.4, BX = -2.4, MAXP = 9;
    const bk = makeBeaker(view, BX, R, H, 0.7, phColor(2), 0.68);
    TT.add(bk.group);
    const gas = makeGas({ cx: BX, cz: 0, R: R * 0.96, y0: 0.12, y1: H * 0.96 * 0.7 - 0.1 });
    const hs = [], os = [];
    for (let i = 0; i < MAXP; i++) { hs.push(gas.add(TT.add(makeIon(view, 'H')), 0.8)); os.push(gas.add(TT.add(makeIon(view, 'OH')), 0.8)); }
    // right-hand readout panel
    const PX0 = 1.3, PX1 = 4.3, xs = ph => PX0 + ph / 14 * (PX1 - PX0);
    const phL = view.label('pH 2', [2.8, 3.7, 0], { size: 1.5, color: '#0f172a', fontSize: 84 });
    const catL = { Acidic: view.label('Acidic', [2.8, 2.75, 0], { size: 1.0, color: '#dc2626', fontSize: 68 }), Neutral: view.label('Neutral', [2.8, 2.75, 0], { size: 1.0, color: '#16a34a', fontSize: 68 }), Basic: view.label('Basic', [2.8, 2.75, 0], { size: 1.0, color: '#2563eb', fontSize: 68 }) };
    const showCat = nm => Object.keys(catL).forEach(k => { catL[k].visible = k === nm; });
    gradBar(view, PX0, PX1, 1.6, 0, 0.36, 0.5, f => phColor(f * 14));
    const mk = pointerCone(view, '#0f172a'); mk.scale.setScalar(0.65);
    view.label('0', [PX0, 1.0, 0], { size: 0.65, color: '#64748b', fontSize: 64 });
    view.label('7', [(PX0 + PX1) / 2, 1.0, 0], { size: 0.65, color: '#64748b', fontSize: 64 });
    view.label('14', [PX1, 1.0, 0], { size: 0.65, color: '#64748b', fontSize: 64 });
    const likeL = wideLabel(view, 'like lemon juice', [2.8, 0.4, 0], { size: 0.85, color: '#0f172a', fontSize: 58 });
    const tenL = wideLabel(view, '10× more H⁺ than pH 3', [2.8, -0.2, 0], { size: 0.85, color: '#4f46e5', fontSize: 58 });
    const row = ctx.controls('<div class="scene-slider-row"><span>pH</span><input type="range" min="0" max="14" step="1" value="2" aria-label="pH value"><span class="ph-val" style="min-width:2ch">2</span></div>');
    const slider = row.querySelector('input'), valEl = row.querySelector('.ph-val');
    let target = phRGB(2), cur = phRGB(2), ph = 2, mkX = xs(2), pcount = [0, 0];
    function update() {
      ph = +slider.value;
      valEl.textContent = ph;
      phL.userData.setText('pH ' + ph);
      showCat(ph < 7 ? 'Acidic' : ph > 7 ? 'Basic' : 'Neutral');
      target = phRGB(ph);
      likeL.userData.setText('like ' + LIKE[ph]);
      tenL.userData.setText(ph < 7 ? '10× more H⁺ than pH ' + (ph + 1) : ph > 7 ? '10× more OH⁻ than pH ' + (ph - 1) : 'H⁺ and OH⁻ are balanced');
      pcount = ionCounts(ph, MAXP);
      hs.forEach((p, i) => { p.on = p.m.visible = i < pcount[0]; });
      os.forEach((p, i) => { p.on = p.m.visible = i < pcount[1]; });
    }
    slider.addEventListener('input', update);
    update();
    view.run((t, dt) => {
      TT.update(dt);
      gas.step(dt);
      cur = lerpArr(cur, target, Math.min(1, dt * 4));
      bk.liquidMesh.material.color.set(rgbStr(cur));
      bk.setLevel(0.7 + 0.01 * Math.sin(t * 2.1));
      mkX += (xs(ph) - mkX) * Math.min(1, dt * 8);
      mk.userData.setTip(mkX, 1.85, 0);
    });
  });

  // A small 3D water molecule (bent, 104.5 degrees) with an H2O tag; radius ~0.42 for collisions.
  function makeWater(view) {
    const g = new T.Group();
    const o = view.sphere(0.27, '#ef4444', { shininess: 70 });
    const h1 = view.sphere(0.16, '#e2e8f0', { shininess: 70 }), h2 = view.sphere(0.16, '#e2e8f0', { shininess: 70 });
    const a = 52.25 * Math.PI / 180;
    h1.position.set(Math.sin(a) * 0.4, -Math.cos(a) * 0.4, 0);
    h2.position.set(-Math.sin(a) * 0.4, -Math.cos(a) * 0.4, 0);
    const tag = view.label('H₂O', [0, 0.6, 0], { size: 0.62, color: '#075985', fontSize: 60 });
    g.add(o, h1, h2, tag);
    view.scene.add(g);
    g.userData.r = 0.45;
    return g;
  }

  // ---------------------------------------------------------------- scene 5: neutralization
  const scene5 = Chem3D.define({ fov: 30, distance: 9.8, pitch: 0.24, yaw: 0.05, target: [0.65, 1.6, 0] }, (view, ctx) => {
    const TT = makeTurntable(view, -2.4);
    const mkIon = k => TT.add(makeIon(view, k));
    table(view, 9.0, 3.4, 0);
    const R = 1.55, H = 3.4, BX = -2.4, LV = 0.7;
    const bk = makeBeaker(view, BX, R, H, LV, phColor(1), 0.68);
    TT.add(bk.group);
    const gas = makeGas({ cx: BX, cz: 0, R: R * 0.96, y0: 0.12, y1: H * 0.96 * LV - 0.1 });
    const SURF = H * 0.96 * LV;
    // readout panel (right)
    const phL = view.label('pH 1', [2.8, 3.3, 0], { size: 1.5, color: '#0f172a', fontSize: 84 });
    const catL = { Acidic: view.label('Acidic', [2.8, 2.4, 0], { size: 1.0, color: '#dc2626', fontSize: 68 }), Neutral: view.label('Neutral', [2.8, 2.4, 0], { size: 1.0, color: '#16a34a', fontSize: 68 }), Basic: view.label('Basic', [2.8, 2.4, 0], { size: 1.0, color: '#2563eb', fontSize: 68 }) };
    wideLabel(view, 'HCl + NaOH → NaCl + H₂O', [2.8, 1.55, 0], { size: 0.8, color: '#4f46e5', fontSize: 46 });
    const m1 = wideLabel(view, ' ', [2.8, 0.85, 0], { size: 0.8, color: '#334155', fontSize: 56 });
    const m2 = wideLabel(view, ' ', [2.8, 0.2, 0], { size: 0.8, color: '#334155', fontSize: 56 });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center"><button class="scene-btn a5-drop" type="button">Drop base (NaOH)</button><button class="scene-btn a5-reset" type="button">Reset</button></div>');
    const dropB = row.querySelector('.a5-drop'), resetB = row.querySelector('.a5-reset');

    let items, acid, extra, drops, claimedAcid, target, cur, shownPh;
    const falling = [], merges = [], waters = [];
    function killItem(p) {
      if (p.m.parent) p.m.parent.remove(p.m);
      const i = gas.parts.indexOf(p); if (i >= 0) gas.parts.splice(i, 1);
    }
    function readout() {
      const PH = { 3: 1, 2: 2, 1: 3.5 };
      let ph, cat, a, b;
      if (acid > 0) { ph = PH[acid]; cat = 'Acidic'; a = 'Still H⁺ left over,'; b = 'so add more base.'; }
      else if (extra === 0) { ph = 7; cat = 'Neutral'; a = 'No H⁺ or OH⁻ left over.'; b = 'Salt + water!'; }
      else { ph = extra === 1 ? 10 : 12; cat = 'Basic'; a = 'Too much base:'; b = 'OH⁻ is left over.'; }
      phL.userData.setText('pH ' + ph);
      Object.keys(catL).forEach(k => { catL[k].visible = k === cat; });
      m1.userData.setText(a); m2.userData.setText(b);
      target = phRGB(ph);
      dropB.disabled = drops >= 5;
    }
    function reset() {
      [...gas.parts].forEach(killItem);
      falling.length = 0; merges.length = 0; waters.length = 0;
      acid = 3; extra = 0; drops = 0; claimedAcid = 3;
      for (let i = 0; i < 3; i++) gas.add(mkIon('H'), 0.7);
      for (let i = 0; i < 3; i++) gas.add(mkIon('Cl'), 0.7);
      target = phRGB(1); cur = target.slice();
      readout();
    }
    function drop() {
      if (drops >= 5) return;
      drops++;
      const x = BX + rand(-0.6, 0.6), z = rand(-0.5, 0.5);
      const na = gas.add(mkIon('Na'), 0.7), oh = gas.add(mkIon('OH'), 0.7);
      na.hold = oh.hold = true;
      na.m.position.set(x - 0.42, 3.9, z); oh.m.position.set(x + 0.42, 3.9, z);
      falling.push({ na, oh });
      readout();
    }
    function land(f) {
      [f.na, f.oh].forEach(p => { p.hold = false; p.v.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).setLength(0.7); });
      // find an unclaimed H+ to react with
      const hs = gas.parts.filter(p => p.m.userData.kind === 'H' && !p.claimed);
      if (!hs.length) { extra++; readout(); return; }
      hs.sort((a, b) => a.m.position.distanceTo(f.oh.m.position) - b.m.position.distanceTo(f.oh.m.position));
      const h = hs[0];
      h.claimed = true; h.hold = true; f.oh.hold = true;
      merges.push({ oh: f.oh, h, t: 0, from: f.oh.m.position.clone() });
    }
    dropB.addEventListener('click', drop);
    resetB.addEventListener('click', reset);
    reset();
    view.run((t, dt) => {
      TT.update(dt);
      dt = Math.min(dt, 0.05);
      for (let i = falling.length - 1; i >= 0; i--) {
        const f = falling[i];
        f.na.m.position.y -= 3.2 * dt; f.oh.m.position.y -= 3.2 * dt;
        if (f.oh.m.position.y <= SURF - 0.3) { falling.splice(i, 1); land(f); }
      }
      for (let i = merges.length - 1; i >= 0; i--) {
        const mg = merges[i];
        mg.t += dt;
        const k = Math.min(1, mg.t / 0.6), e = k * k * (3 - 2 * k);
        mg.oh.m.position.lerpVectors(mg.from, mg.h.m.position, e);
        if (k >= 1) {
          const pos = mg.h.m.position.clone();
          killItem(mg.oh); killItem(mg.h);
          const w = TT.add(makeWater(view));
          const wp = gas.add(w, 0.5);
          w.position.copy(pos);
          waters.push(w);
          acid--;
          merges.splice(i, 1);
          readout();
        }
      }
      waters.forEach(w => { w.rotation.y += dt * 0.8; w.rotation.z = 0.25 * Math.sin(t * 2 + w.id); });
      gas.step(dt);
      cur = lerpArr(cur, target, Math.min(1, dt * 3));
      bk.liquidMesh.material.color.set(rgbStr(cur));
      bk.setLevel(LV + 0.01 * Math.sin(t * 2.1));
    });
  });

  // A small expanding ripple ring on a liquid surface.
  function makeRipple(view, x, y, z) {
    const m = new T.Mesh(new T.TorusGeometry(1, 0.03, 8, 40), view.mat('#ffffff', { opacity: 0.8, shininess: 10 }));
    m.rotation.x = Math.PI / 2; m.position.set(x, y, z); m.visible = false;
    view.scene.add(m);
    return m;
  }

  // ---------------------------------------------------------------- scene 6: real life - red cabbage juice
  const CAB_STOPS = [[0, [225, 29, 72]], [3, [244, 114, 182]], [5, [192, 132, 252]], [7, [139, 92, 246]], [8, [59, 130, 246]], [10, [20, 184, 166]], [12, [34, 197, 94]], [14, [234, 179, 8]]];
  function cabRGB(ph) {
    for (let i = 1; i < CAB_STOPS.length; i++) {
      if (ph <= CAB_STOPS[i][0]) { const a = CAB_STOPS[i - 1], b = CAB_STOPS[i]; return lerpArr(a[1], b[1], (ph - a[0]) / (b[0] - a[0])); }
    }
    return CAB_STOPS[CAB_STOPS.length - 1][1].slice();
  }
  const scene6 = Chem3D.define({ fov: 30, distance: 11.4, pitch: 0.24, yaw: 0.05, target: [0.6, 1.75, 0] }, (view, ctx) => {
    const TT = makeTurntable(view, -2.4);
    table(view, 9.0, 3.4, 0);
    const R = 1.55, H = 3.4, BX = -2.4, LV = 0.6;
    const bk = makeBeaker(view, BX, R, H, LV, rgbStr(cabRGB(7)), 0.62);
    TT.add(bk.group);
    const SURF = 0.01 + H * 0.96 * LV;
    view.label('cabbage juice', [BX, -0.7, 0.4], { size: 0.9, color: '#1f2937', fontSize: 56 });
    // bubbles rising in the juice
    const bubbles = [];
    for (let i = 0; i < 6; i++) { const b = view.sphere(0.09 + 0.03 * (i % 3), '#ffffff', { opacity: 0.6 }); TT.add(b); bubbles.push({ m: b, a: i * 1.1, r: 0.3 + 0.9 * ((i * 37) % 10) / 10, s: 0.35 + 0.08 * i, ph: i * 0.4 }); }
    // the falling drop and its ripple
    const drop = view.sphere(0.16, '#e0f2fe', { shininess: 90 }); drop.visible = false; TT.add(drop);
    const rip = TT.add(makeRipple(view, BX, SURF, 0));
    // right-hand panel: name, kind, marker, rainbow bar
    const PX0 = 1.3, PX1 = 4.3, xs = ph => PX0 + ph / 14 * (PX1 - PX0);
    const nameL = wideLabel(view, 'Pick a liquid', [2.8, 3.55, 0], { size: 0.95, color: '#0f172a', fontSize: 56 });
    gradBar(view, PX0, PX1, 1.35, 0, 0.36, 0.5, f => rgbStr(cabRGB(f * 14)));
    const mk = pointerCone(view, '#0f172a'); mk.scale.setScalar(0.7);
    const phL = view.label('pH 7', [2.8, 2.65, 0], { size: 0.85, color: '#0f172a', fontSize: 64 });
    view.label('Acid', [PX0 + 0.2, 0.75, 0], { size: 0.8, color: '#dc2626', fontSize: 64 });
    view.label('Neutral', [(PX0 + PX1) / 2, 0.75, 0], { size: 0.8, color: '#7c3aed', fontSize: 64 });
    view.label('Base', [PX1 - 0.2, 0.75, 0], { size: 0.8, color: '#2563eb', fontSize: 64 });
    wideLabel(view, 'The juice color shows the pH!', [2.8, -0.05, 0], { size: 0.75, color: '#475569', fontSize: 56 });

    const ITEMS = [
      { id: 'lemon', label: 'Lemon', name: 'Lemon juice', short: 'Lemon juice', ph: 2, kind: 'acid' },
      { id: 'water', label: 'Water', name: 'Plain water', short: 'Plain water', ph: 7, kind: 'neutral' },
      { id: 'soda', label: 'Baking soda', name: 'Baking soda solution', short: 'Baking soda', ph: 8, kind: 'weak base' },
      { id: 'soap', label: 'Soap', name: 'Soapy water', short: 'Soapy water', ph: 10, kind: 'base' }
    ];
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;gap:4px 4px">' +
      ITEMS.map(it => '<button type="button" class="scene-btn" style="padding:5px 6px;font-size:11px" data-i="' + it.id + '">' + it.label + '</button>').join('') + '</div>');
    let cur = cabRGB(7), target = cabRGB(7), ph = 7, shownPh = 7, dropT = -1, shownTxt = 7, mkX = xs(7);
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const it = ITEMS.find(x => x.id === b.dataset.i);
      ph = it.ph; target = cabRGB(ph);
      nameL.userData.setText(it.short + ' (' + it.kind + ')');
      dropT = 0;
      drop.material.color.set(it.id === 'lemon' ? '#fef08a' : '#e0f2fe');
      row.querySelectorAll('button').forEach(o => { o.style.borderColor = o === b ? 'var(--primary)' : ''; o.style.color = o === b ? 'var(--primary)' : ''; });
    }));
    view.run((t, dt) => {
      TT.update(dt);
      dt = Math.min(dt, 0.05);
      if (dropT >= 0) {
        dropT += dt;
        drop.visible = dropT < 0.6;
        drop.position.set(BX, 4.6 - Math.min(1, dropT / 0.6) * (4.6 - SURF), 0);
        if (dropT >= 0.6) { rip.visible = true; rip.userData.t = dropT - 0.6; }
        if (dropT > 1.5) { dropT = -1; rip.visible = false; }
      }
      if (dropT >= 0 && rip.visible) {
        const k = Math.min(1, (dropT - 0.6) / 0.9);
        rip.scale.setScalar(0.2 + k * 1.3); rip.material.opacity = 0.8 * (1 - k);
      }
      const wait = dropT >= 0 && dropT < 0.6;
      if (!wait) {
        const f = Math.min(1, dt * 2.2);
        cur = lerpArr(cur, target, f);
        shownPh += (ph - shownPh) * f;
      }
      bk.liquidMesh.material.color.set(rgbStr(cur));
      bk.setLevel(LV + 0.012 * Math.sin(t * 2.6));
      mkX = xs(shownPh);
      mk.userData.setTip(mkX, 1.6, 0);
      phL.position.x = mkX;
      const rp = Math.round(shownPh);
      if (rp !== shownTxt) { shownTxt = rp; phL.userData.setText('pH ' + rp); }
      bubbles.forEach(b => {
        const y = 0.25 + ((t * b.s + b.ph) % 1) * (SURF - 0.4);
        b.m.position.set(BX + Math.cos(b.a + t * 0.5) * b.r, y, Math.sin(b.a + t * 0.5) * b.r);
      });
    });
  });

  // ---------------------------------------------------------------- scene 7: real life - sugar, acid and teeth
  const scene7 = Chem3D.define({ fov: 30, distance: 13.6, pitch: 0.2, yaw: 0.05, target: [0.4, 1.35, 0] }, (view) => {
    const TT = makeTurntable(view, -2.5);
    table(view, 10.6, 3.4, 0);
    const TX = -2.5, D = 12;
    // tooth: gum, crown (union of spheres), cusps
    const sphereGeo = new T.SphereGeometry(1, 40, 28);
    const tooth = new T.Group(); tooth.position.set(TX, 0, 0); tooth.scale.setScalar(1.05); TT.add(tooth);
    const enamel = view.mat('#f8fafc', { shininess: 110, specular: '#888888' });
    const gum = new T.Mesh(sphereGeo, view.mat('#f472b6', { shininess: 40 })); gum.scale.set(1.6, 0.55, 1.35); gum.position.set(0, 1.0, 0);
    tooth.add(gum);
    const crown = new T.Mesh(sphereGeo, enamel); crown.scale.set(1.15, 1.2, 1.0); crown.position.set(0, 2.5, 0); tooth.add(crown);
    [[-0.5, 3.4, -0.4], [0.5, 3.4, -0.4], [-0.5, 3.4, 0.4], [0.5, 3.4, 0.4]].forEach(c => {
      const cu = new T.Mesh(sphereGeo, enamel); cu.scale.setScalar(0.5); cu.position.set(c[0], c[1], c[2]); tooth.add(cu);
    });
    function geoSphere() { return sphereGeo; }
    // brown damage spots on the enamel
    const spotMat = view.mat('#78350f', { shininess: 20 });
    const spots = [0, 2.1, 4.2].map(a => {
      const m = new T.Mesh(sphereGeo, spotMat);
      const e = 0.35;
      m.position.set(Math.sin(a) * 1.15 * Math.cos(e), 2.5 + Math.sin(e) * 1.2, Math.cos(a) * 1.0 * Math.cos(e));
      m.scale.setScalar(0.001); tooth.add(m); return m;
    });
    view.label('tooth enamel', [TX, -0.55, 0.4], { size: 0.9, color: '#475569', fontSize: 56 });
    // bacteria: green capsules wandering around the tooth
    const capG = new T.CapsuleGeometry(0.14, 0.26, 6, 12);
    const bactMat = view.mat('#16a34a', { shininess: 60 });
    const bacts = [0, 1, 2, 3].map(i => { const m = new T.Mesh(capG, bactMat); TT.add(m); return m; });
    const bTag = view.label('bacteria', [0, 0.6, 0], { size: 0.7, color: '#166534', fontSize: 60 });
    bacts[0].add(bTag); bTag.scale.multiplyScalar(1);
    // sugar cube
    const sugar = new T.Mesh(new T.BoxGeometry(0.55, 0.55, 0.55), view.mat('#ffffff', { shininess: 80 }));
    TT.add(sugar); sugar.visible = false;
    const sTag = view.label('sugar', [0, 0.65, 0], { size: 0.7, color: '#64748b', fontSize: 60 }); sugar.add(sTag);
    // acid: H+ ions gather at the tooth
    const hs = [0, 1, 2, 3].map(i => { const m = TT.add(makeIon(view, 'H')); m.visible = false; return m; });
    const hSpec = [[-1.9, 1.6], [1.9, 1.5], [-1.1, 2.0], [0.9, 2.3]];   // angle-ish placement (x, y) around the tooth
    // toothbrush
    const brush = new T.Group(); TT.add(brush); brush.visible = false;
    const handle = new T.Mesh(new T.BoxGeometry(0.28, 0.24, 2.6), view.mat('#14b8a6', { shininess: 60 })); handle.position.set(0.9, 0, 0.3); handle.rotation.y = 0.0;
    handle.rotation.set(0, Math.PI / 2, 0); handle.position.set(1.7, 0, 0);
    const head = new T.Mesh(new T.BoxGeometry(0.2, 0.9, 0.7), view.mat('#ffffff', { shininess: 60 })); head.position.set(0.32, 0, 0);
    brush.add(handle, head);
    const bristleG = new T.CylinderGeometry(0.035, 0.035, 0.32, 6), bristleM = view.mat('#3b82f6', { shininess: 30 });
    for (let iy = 0; iy < 4; iy++) for (let iz = 0; iz < 3; iz++) {
      const b = new T.Mesh(bristleG, bristleM); b.rotation.z = Math.PI / 2; b.position.set(0.06, -0.33 + iy * 0.22, -0.22 + iz * 0.22); brush.add(b);
    }
    // meter (right)
    const MX0 = 1.6, MX1 = 4.7, xs = ph => MX0 + (ph - 4) / 4 * (MX1 - MX0);
    view.label('Mouth pH', [3.15, 3.7, 0], { size: 1.0, color: '#0f172a', fontSize: 68 });
    gradBar(view, MX0, MX1, 1.3, 0, 0.4, 0.5, f => f < 0.5 ? rgbStr(lerpArr([225, 29, 72], [139, 92, 246], f * 2)) : rgbStr(lerpArr([139, 92, 246], [59, 130, 246], (f - 0.5) * 2)));
    for (let i = 0; i < 3; i++) { const d = view.box(0.07, 0.16, 0.6, '#0f172a', { shininess: 10 }); d.position.set(xs(5.5), 0.85 + i * 0.5, 0); d.scale.y = 1; }
    const mk = pointerCone(view, '#0f172a');
    const phL = view.label('pH 7', [3.15, 2.95, 0], { size: 0.9, color: '#0f172a', fontSize: 64 });
    view.label('acid', [MX0 + 0.3, 0.55, 0], { size: 0.8, color: '#dc2626', fontSize: 64 });
    view.label('base', [MX1 - 0.3, 0.55, 0], { size: 0.8, color: '#2563eb', fontSize: 64 });
    wideLabel(view, 'dashed line: pH 5.5', [3.15, 0.05, 0], { size: 0.7, color: '#475569', fontSize: 56 });
    wideLabel(view, 'below it, enamel suffers', [3.15, -0.55, 0], { size: 0.7, color: '#475569', fontSize: 56 });
    const phases = [
      wideLabel(view, '1. Sugar feeds the bacteria', [0.4, -1.4, 0], { size: 0.85, color: '#0f172a', fontSize: 64 }),
      wideLabel(view, '2. Bacteria make acid', [0.4, -1.4, 0], { size: 0.85, color: '#dc2626', fontSize: 64 }),
      wideLabel(view, '3. Toothpaste (a base) neutralizes acid', [0.4, -1.4, 0], { size: 0.85, color: '#0f766e', fontSize: 44 })
    ];
    let shownTxt = 7;
    const sm = (e0, e1, x) => { const k = clamp((x - e0) / (e1 - e0), 0, 1); return k * k * (3 - 2 * k); };
    view.run((t, dt) => {
      TT.update(dt);
      const u = (t % D) / D;
      // bacteria wander
      bacts.forEach((b, i) => {
        const a = t * (0.35 + 0.1 * i) + i * 1.6, r = 1.75 + 0.2 * Math.sin(t * 0.9 + i);
        b.position.set(TX + Math.cos(a) * r, 1.6 + 0.9 * i * 0.6 + 0.3 * Math.sin(t * 1.3 + i), Math.sin(a) * r * 0.8);
        b.rotation.set(t * 0.8 + i, t * 0.6, t * 0.9 + i * 2);
      });
      // sugar cube drops in
      const sv = u > 0.03 && u < 0.21;
      sugar.visible = sv;
      if (sv) {
        const k = sm(0.03, 0.2, u);
        sugar.position.set(TX + 1.5, 5.0 - k * 3.1, 0.3);
        sugar.rotation.set(k * 3, k * 2, 0);
        sugar.scale.setScalar(1 - sm(0.16, 0.21, u) * 0.9);
      }
      // acid ions
      const env = keyf(u, [0, 0.28, 0.34, 0.56, 0.62, 1], [0, 0, 1, 1, 0, 0]);
      hs.forEach((h, i) => {
        h.visible = env > 0.02;
        if (!h.visible) return;
        const f = (((t - i * 0.4) / 1.6) % 1 + 1) % 1;
        const tx = TX + hSpec[i][0] * 0.55, ty = hSpec[i][1] + 0.4, tz = (i % 2 ? -1 : 1) * 0.9;
        const k = f * f * (3 - 2 * f);
        h.position.set(tx + (hSpec[i][0] > 0 ? 1 : -1) * (1 - k) * 1.3, ty + (1 - k) * 0.5, tz * (1 - 0.4 * k));
        h.scale.setScalar(ION.H[2] * env);
      });
      // damage spots grow during the acid phase, fade after brushing
      const sr = keyf(u, [0, 0.3, 0.6, 0.6, 0.75, 1], [0, 0, 0.3, 0.3, 0, 0]);
      spots.forEach(sp => { sp.scale.setScalar(Math.max(0.001, sr)); });
      // toothbrush sweeps in phase 3
      const bv = keyf(u, [0, 0.62, 0.64, 0.88, 0.9, 1], [0, 0, 1, 1, 0, 0]);
      brush.visible = bv > 0.02;
      if (brush.visible) {
        const sweep = keyf(u, [0.62, 0.68, 0.74, 0.8, 0.86, 1], [0, 1, 0, 1, 0, 0]);
        brush.position.set(TX + 1.45 + 0.6 * (1 - bv) - 0.1 * sweep, 2.0 + 0.7 * sweep, 0.1);
        brush.scale.setScalar(bv);
      }
      // meter
      const ph = keyf(u, [0, 0.08, 0.4, 0.62, 0.85, 1], [7, 7, 5, 5, 7, 7]);
      mk.userData.setTip(xs(ph), 1.55, 0);
      phL.position.x = xs(ph);
      const rp = Math.round(ph);
      if (rp !== shownTxt) { shownTxt = rp; phL.userData.setText('pH ' + rp); }
      phases[0].visible = u >= 0.02 && u <= 0.26;
      phases[1].visible = u >= 0.3 && u <= 0.56;
      phases[2].visible = u >= 0.62 && u <= 0.94;
    });
  });

  // ---------------------------------------------------------------- scene 8: real life - garden soil pH (hydrangea)
  const HYD_STOPS = [[4, [59, 130, 246]], [5.5, [99, 102, 241]], [6, [168, 85, 247]], [6.8, [236, 72, 153]], [8, [244, 114, 182]]];
  function hydRGB(ph) {
    for (let i = 1; i < HYD_STOPS.length; i++) {
      if (ph <= HYD_STOPS[i][0]) { const a = HYD_STOPS[i - 1], b = HYD_STOPS[i]; return lerpArr(a[1], b[1], (ph - a[0]) / (b[0] - a[0])); }
    }
    return HYD_STOPS[HYD_STOPS.length - 1][1].slice();
  }
  const scene8 = Chem3D.define({ fov: 30, distance: 12.6, pitch: 0.2, yaw: 0.05, target: [0.65, 2.15, 0] }, (view, ctx) => {
    const TT = makeTurntable(view, -2.4);
    table(view, 9.0, 3.4, 0);
    const PXC = -2.4;
    // pot, rim, soil, stem, leaves
    const pot = new T.Mesh(new T.CylinderGeometry(1.15, 0.85, 1.4, 40), view.mat('#c2410c', { shininess: 30 })); pot.position.set(PXC, 0.7, 0); TT.add(pot);
    const rim = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, 0.25, 40), view.mat('#b45309', { shininess: 30 })); rim.position.set(PXC, 1.4, 0); TT.add(rim);
    const soil = new T.Mesh(new T.CylinderGeometry(1.08, 1.08, 0.06, 40), view.mat('#78350f', { shininess: 5 })); soil.position.set(PXC, 1.5, 0); TT.add(soil);
    view.label('soil', [PXC, 1.55, 1.3], { size: 0.7, color: '#ffffff', bg: 'rgba(120,53,15,0.85)', fontSize: 60 });
    TT.add(view.cylinder([PXC, 1.5, 0], [PXC, 3.0, 0], 0.09, '#15803d'));
    const leaves = [];
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + 0.3, lf = view.sphere(1, i % 2 ? '#16a34a' : '#15803d', { shininess: 40 });
      lf.scale.set(0.85, 0.09, 0.4);
      lf.position.set(PXC + Math.cos(a) * 0.75, 1.9 + (i % 3) * 0.25, Math.sin(a) * 0.75);
      lf.rotation.y = -a; lf.rotation.z = 0.35;
      leaves.push(TT.add(lf));
    }
    // the bloom: a ball of florets (fibonacci sphere) that changes colour with soil pH
    const bloom = new T.Group(); bloom.position.set(PXC, 3.75, 0); TT.add(bloom);
    const florets = [];
    const N = 40, ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const yy = 1 - (i / (N - 1)) * 1.55;               // upper ~3/4 of the sphere
      const rr = Math.sqrt(Math.max(0, 1 - yy * yy)), th = i * ga;
      const f = view.sphere(0.3 + 0.04 * (i % 3), '#3b82f6', { shininess: 50 });
      f.position.set(Math.cos(th) * rr * 1.0, yy * 0.95, Math.sin(th) * rr * 1.0);
      bloom.add(f); florets.push({ m: f, base: f.scale.x, l: 1 + (i % 3 - 1) * 0.07 });
    }
    // right-hand panel
    const PX0 = 1.3, PX1 = 4.3, xs = ph => PX0 + (ph - 4) / 4 * (PX1 - PX0);
    const phL = view.label('pH 5.0', [2.8, 4.65, 0], { size: 1.3, color: '#0f172a', fontSize: 76 });
    const catL = { a: view.label('Acidic soil', [2.8, 3.8, 0], { size: 0.95, color: '#dc2626', fontSize: 62 }), n: view.label('Nearly neutral soil', [2.8, 3.65, 0], { size: 0.95, color: '#7c3aed', fontSize: 46 }), b: view.label('Basic soil', [2.8, 3.65, 0], { size: 0.95, color: '#0284c7', fontSize: 62 }) };
    const colL = { b: view.label('Blue flowers', [2.8, 2.95, 0], { size: 0.95, color: '#2563eb', fontSize: 62 }), p: view.label('Purple flowers', [2.8, 2.8, 0], { size: 0.95, color: '#9333ea', fontSize: 58 }), k: view.label('Pink flowers', [2.8, 2.8, 0], { size: 0.95, color: '#db2777', fontSize: 62 }) };
    gradBar(view, PX0, PX1, 1.5, 0, 0.36, 0.5, f => rgbStr(hydRGB(4 + f * 4)));
    const mk = pointerCone(view, '#0f172a');
    view.label('pH 4', [PX0 + 0.1, 1.0, 0], { size: 0.8, color: '#2563eb', fontSize: 64 });
    view.label('pH 8', [PX1 - 0.1, 1.0, 0], { size: 0.8, color: '#db2777', fontSize: 64 });
    wideLabel(view, 'lime (a base) raises pH', [2.8, 0.4, 0], { size: 0.75, color: '#475569', fontSize: 58 });
    const row = ctx.controls('<div class="scene-slider-row"><span>Soil pH</span><input type="range" min="4" max="8" step="0.1" value="5" aria-label="Soil pH"><span class="sv" style="min-width:3ch">5.0</span></div>');
    const sl = row.querySelector('input'), sv = row.querySelector('.sv');
    let shown = +sl.value;
    function upd() {
      const ph = +sl.value;
      sv.textContent = ph.toFixed(1);
      phL.userData.setText('pH ' + ph.toFixed(1));
      const c = ph < 6.5 ? 'a' : ph <= 7.5 ? 'n' : 'b';
      Object.keys(catL).forEach(k => { catL[k].visible = k === c; });
      const f = ph < 5.5 ? 'b' : ph < 6.5 ? 'p' : 'k';
      Object.keys(colL).forEach(k => { colL[k].visible = k === f; });
    }
    sl.addEventListener('input', upd);
    upd();
    view.run((t, dt) => {
      TT.update(dt);
      dt = Math.min(dt, 0.05);
      shown += (+sl.value - shown) * Math.min(1, dt * 3);
      const c = hydRGB(shown);
      florets.forEach((f, i) => {
        f.m.material.color.set(rgbStr(c.map(v => v * f.l)));
        f.m.scale.setScalar(f.base * (1 + Math.sin(t * 1.6 + i) * 0.06));
      });
      bloom.rotation.z = Math.sin(t * 1.1) * 0.05; bloom.rotation.y = t * 0.15;
      leaves.forEach((l, i) => { l.rotation.z = 0.35 + 0.06 * Math.sin(t * 1.4 + i); });
      mk.userData.setTip(xs(shown), 1.75, 0);
    });
  });

  // ---------------------------------------------------------------- explain / say overrides for the 3D pictures
  addTutorialExplanations('chemistry', 'acids', [
    // 1
    {
      explain: '<p>Two 3D <b>beakers</b> of water stand on a table. The left <b>acid</b> beaker (hydrochloric acid) holds red <b>H<sup>+</sup></b> balls, the <b>hydrogen ions</b>, and a few gray Cl<sup>−</sup> balls. The right <b>base</b> beaker (sodium hydroxide) holds blue <b>OH<sup>−</sup></b> balls, the <b>hydroxide ions</b>, and gray Na<sup>+</sup> balls. All the ions bounce about freely.</p><p>Notice: acid means red H<sup>+</sup>, base means blue OH<sup>−</sup>.</p>',
      say: 'Look at the two beakers. This picture is three dimensional, so you can drag it to turn it around. The left beaker holds an acid dissolved in water. It is hydrochloric acid. The red balls are hydrogen ions, and they are what make something an acid. The gray balls are chloride ions that came along with them. The right beaker holds a base called sodium hydroxide. The blue balls are hydroxide ions, and the gray balls are sodium ions. All the ions bounce around freely. An acid releases hydrogen ions in water. A base releases hydroxide ions. Lemon juice is an acid, and soap is a base.'
    },
    // 2 (the pH scale is a chart: kept flat, original text)
    null,
    null,
    // 4
    {
      explain: '<p>Drag the <b>pH slider</b>. In the 3D beaker, red <b>H<sup>+</sup></b> balls and blue <b>OH<sup>−</sup></b> balls bounce around, and the liquid color follows the rainbow bar. Low pH shows many red balls, high pH many blue ones, and pH 7 one of each. On the right, a readout names the pH, acidic, neutral or basic, a matching everyday liquid, and the tenfold rule.</p>',
      say: 'Now it is your turn. Drag the slider under the picture. Inside the beaker, the red balls are hydrogen ions, and the blue balls are hydroxide ions. They bounce around, and the liquid changes color to match the scale. At a low P H, you see lots of red hydrogen ions. That is an acid. Slide up to seven, and there is one of each, so the water is neutral. Keep going, and the blue hydroxide ions take over. That is a base. On the right, the readout names the P H and a matching everyday liquid. Remember, this picture is simplified, with far fewer ions than a real solution.'
    },
    // 5
    {
      explain: '<p>The beaker starts as acid: three red <b>H<sup>+</sup></b> and three gray <b>Cl<sup>−</sup></b> balls, and the readout says pH 1. Press <b>Drop base</b> and a dark Na<sup>+</sup> and a blue OH<sup>−</sup> fall in. The OH<sup>−</sup> swoops to a red H<sup>+</sup> and they join into a small <b>H<sub>2</sub>O</b> molecule, so the pH climbs. <b>Reset</b> starts over.</p><p>Notice: three drops give neutral, more give base.</p>',
      say: 'We start with an acid. The beaker holds three red hydrogen ions and three gray chloride ions, and the reading says P H one. Press drop base and watch. A pair falls in from the top. The blue one is a hydroxide ion, and the darker one is a sodium ion. The hydroxide ion swoops toward a hydrogen ion, and together they join into a water molecule. The P H climbs. After three drops, no hydrogen ions or hydroxide ions are left. The liquid is green and neutral. What remains is salt and water. A fourth drop adds too much base, and the P H jumps up.'
    },
    null,
    // 7
    {
      explain: '<p>A white 3D <b>tooth</b> stands in pink gum, with green bacteria drifting around it. A sugar cube drops in, then red <b>H<sup>+</sup></b> acid balls gather and brown spots grow on the tooth. On the right, the <b>Mouth pH</b> pointer slides from 7 down to 5, past the dashed 5.5 line. Later a <b>toothbrush</b> sweeps the tooth and the pointer returns to 7.</p>',
      say: 'Look at the tooth on the left, with the little green bacteria drifting around it. Stage one, a sugar cube drops in. The bacteria feed on the sugar. Stage two, red hydrogen ions gather around the tooth. The bacteria are making acid, and brown spots grow on the tooth to show the damage. On the meter, the pointer slides down from seven to five. It crosses the dashed line at five point five, and below that line, acid can start to wear away tooth enamel. Stage three, a toothbrush sweeps across. Toothpaste is a mild base, so it neutralizes the acid, and the pointer moves back up to seven.'
    },
    null
  ]);

  addTutorialScenes3D('chemistry', 'acids', [scene1, null, scene3, scene4, scene5, scene6, scene7, scene8]);
})();
