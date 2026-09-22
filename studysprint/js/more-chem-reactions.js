(function () {
  'use strict';
  // more-chem-reactions: 5 extra real-life examples for Chemistry > Chemical Reactions (steps 9-13).
  // Each has a flat (SVG + mount) fallback AND a three.js scene (scene3d). Ids/keyframes are prefixed mcr-.

  const has3D = typeof Chem3D !== 'undefined' && typeof THREE !== 'undefined';
  const T = has3D ? THREE : null;
  const def3d = (o, fn) => (has3D ? Chem3D.define(o, fn) : undefined);
  const ss = (x, a, b) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---------- molecule shapes at a visual (not true) scale: [atoms [sym,x,y,z], bonds [i,j,order]] ----------
  const RAD = { H: 0.27, O: 0.42, C: 0.42, Na: 0.5, Fe: 0.5 };
  const MOL = {
    H2: [[['H', -0.36, 0, 0], ['H', 0.36, 0, 0]], [[0, 1, 1]]],
    O2: [[['O', -0.5, 0, 0], ['O', 0.5, 0, 0]], [[0, 1, 2]]],
    H2O: [[['O', 0, 0.2, 0], ['H', -0.6, -0.22, 0], ['H', 0.6, -0.22, 0]], [[0, 1, 1], [0, 2, 1]]],
    CO2: [[['C', 0, 0, 0], ['O', -0.95, 0, 0], ['O', 0.95, 0, 0]], [[0, 1, 2], [0, 2, 2]]]
  };
  // Glucose C6H12O6 as a ring model: ring O + 5 ring C, one CH2OH group, four OH groups, and H atoms (24 atoms).
  (function () {
    const atoms = [], bonds = [];
    const add = (s, x, y, z) => { atoms.push([s, x, y, z]); return atoms.length - 1; };
    const R = 0.95, ring = [];
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      ring.push(add(k === 0 ? 'O' : 'C', R * Math.cos(a), 0, R * Math.sin(a)));
    }
    for (let k = 0; k < 6; k++) bonds.push([ring[k], ring[(k + 1) % 6], 1]);
    // substituent directions: radial outwards, up or down
    const out = (k, r, y) => { const a = k * Math.PI / 3; return [(R + r) * Math.cos(a), y, (R + r) * Math.sin(a)]; };
    const OH = (k, y) => {                       // C-OH on ring carbon k, pointing up (+) or down (-)
      const o = add('O', ...out(k, 0.5, y * 0.75));
      const h = add('H', ...out(k, 0.95, y * 0.75 + y * 0.35));
      bonds.push([ring[k], o, 1], [o, h, 1]);
    };
    const H = (k, y) => { const h = add('H', ...out(k, 0.35, -y * 0.78)); bonds.push([ring[k], h, 1]); };
    OH(1, -1); H(1, -1);   // C1: OH down, H up
    OH(2, 1); H(2, 1);
    OH(3, -1); H(3, -1);
    OH(4, 1); H(4, 1);
    // C5 (ring[5]): H down, CH2OH up
    H(5, -1);
    const c6 = add('C', ...out(5, 0.35, 0.95));
    bonds.push([ring[5], c6, 1]);
    const h61 = add('H', ...out(5, 0.6, 1.3)), h62 = add('H', ...out(5, 0.05, 1.5));
    const o6 = add('O', ...out(5, 1.05, 1.15)), h6o = add('H', ...out(5, 1.6, 1.4));
    bonds.push([c6, h61, 1], [c6, h62, 1], [c6, o6, 1], [o6, h6o, 1]);
    MOL.GLU = [atoms, bonds];
  })();

  function helpers(view) {
    const sphereG = new T.SphereGeometry(1, 24, 16);
    const cylG = new T.CylinderGeometry(1, 1, 1, 14);
    const mats = {};
    const mat = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = view.mat(c, o)); };
    const UP = new T.Vector3(0, 1, 0);
    function cyl(parent, a, b, r, m) {
      const mesh = new T.Mesh(cylG, m);
      const A = new T.Vector3(...a), B = new T.Vector3(...b), d = B.clone().sub(A);
      mesh.position.copy(A).add(B).multiplyScalar(0.5);
      mesh.scale.set(r, Math.max(d.length(), 1e-3), r);
      mesh.quaternion.setFromUnitVectors(UP, d.normalize());
      parent.add(mesh);
      return mesh;
    }
    // ball-and-stick molecule in a Group (scale it with group.scale)
    function molecule(name, o) {
      o = o || {};
      const [atoms, bonds] = MOL[name];
      const g = new T.Group();
      atoms.forEach(a => {
        const m = new T.Mesh(sphereG, mat(Chem3D.color(a[0])));
        m.scale.setScalar(RAD[a[0]] || 0.4);
        m.position.set(a[1], a[2], a[3]);
        g.add(m);
      });
      bonds.forEach(b => {
        const A = atoms[b[0]], B = atoms[b[1]];
        const d = new T.Vector3(B[1] - A[1], B[2] - A[2], B[3] - A[3]).normalize();
        let side = new T.Vector3(0, 0, 1).cross(d);
        if (side.lengthSq() < 1e-3) side = new T.Vector3(1, 0, 0).cross(d);
        side.normalize();
        for (let i = 0; i < b[2]; i++) {
          const off = side.clone().multiplyScalar((i - (b[2] - 1) / 2) * 0.17);
          cyl(g, [A[1] + off.x, A[2] + off.y, A[3] + off.z], [B[1] + off.x, B[2] + off.y, B[3] + off.z], b[2] > 1 ? 0.06 : 0.085, mat('#cbd5e1', { shininess: 40 }));
        }
      });
      view.scene.add(g);
      return g;
    }
    // crisp DOM text laid over the canvas
    function overlay(css, html) {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;pointer-events:none;font-weight:700;line-height:1.2;' + css;
      d.innerHTML = html || '';
      view.wrap.appendChild(d);
      return d;
    }
    return { sphereG, cylG, mat, cyl, molecule, overlay, narrow: view.wrap.clientWidth < 400 };
  }
  const PANEL = 'color:#1f2937;background:rgba(255,255,255,.78);border-radius:8px;padding:3px 7px;';
  const setActive = (btns, on) => btns.forEach(b => { const a = on(b); b.style.borderColor = a ? 'var(--primary)' : ''; b.style.color = a ? 'var(--primary)' : ''; });

  // Flat scene scaffold: an svg (viewBox) that fills the stage plus a controls block underneath.
  function flat(el, viewBox, inner, controls) {
    el.innerHTML = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%">${inner}</svg>${controls || ''}`;
    return id => el.querySelector('#' + id);
  }

  const steps = [];

  // =====================================================================
  // EX1: fizz in a flask (baking soda + vinegar; conservation of mass, balloon vs open)
  //   NaHCO3 + CH3COOH -> CH3COONa + H2O + CO2   (Na1 H5 C3 O5 on both sides)
  //   4.2 g baking soda = 0.05 mol -> 2.2 g CO2
  // =====================================================================
  const FZ_CYCLE = 14;
  function fizzAt(c, closed) {
    const p = ss(c, 1.2, 6.2), g = 1 - ss(c, 12.6, 13.6);
    return { p, g, rate: (c > 1.2 && c < 6.2) ? Math.max(0.15, 4 * p * (1 - p)) : 0, mass: 250 - (closed ? 0 : 2.2 * p) };
  }
  const fzStatus = (c, closed, mass) => c < 1.2 ? 'Ready: soda + vinegar' : c < 6.2 ? 'Fizzing! CO₂ is made' : (closed ? 'Gas trapped: mass same' : 'Gas escaped: ' + (mass - 250).toFixed(1) + ' g');
  const FZ_CTRL = '<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 6px">' +
    '<button type="button" class="scene-btn" style="padding:2px 8px;font-size:.78rem" data-m="closed">Balloon on</button><button type="button" class="scene-btn" style="padding:2px 8px;font-size:.78rem" data-m="open">Open flask</button><button type="button" class="scene-btn" style="padding:2px 8px;font-size:.78rem" data-m="again">Mix again</button></div>';

  function fizzFlat(el, api) {
    const co2 = () => `<g opacity="0"><circle cx="-8" r="3.6" fill="var(--t-red)"/><circle cx="8" r="3.6" fill="var(--t-red)"/><circle r="4.4" fill="#475569"/></g>`;
    let mol = '', bub = '';
    for (let i = 0; i < 6; i++) mol += co2().replace('<g ', `<g id="mcr-fz-in${i}" `);
    for (let i = 0; i < 5; i++) mol += co2().replace('<g ', `<g id="mcr-fz-out${i}" `);
    for (let i = 0; i < 12; i++) bub += `<circle id="mcr-fz-b${i}" r="3" fill="#fff" stroke="var(--t-blue)" stroke-width="1.2" opacity="0"/>`;
    const $ = flat(el, '0 0 400 190',
      `<rect x="82" y="168" width="156" height="14" rx="4" fill="#cbd5e1" stroke="var(--t-ink)" stroke-width="2"/>` +
      `<text x="160" y="179" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t-ink)">balance</text>` +
      `<path d="M121.8 132 L198.2 132 L216 162 Q218 167 212 167 L108 167 Q102 167 104 162 Z" fill="var(--t-blue)" opacity="0.32"/>` +
      `<ellipse id="mcr-fz-pile" cx="160" cy="163" rx="24" ry="5" fill="#fff" stroke="var(--t-muted)" stroke-width="1.2"/>` +
      bub +
      `<path d="M146 62 L146 92 L104 160 Q100 167 108 167 L212 167 Q220 167 216 160 L174 92 L174 62" fill="none" stroke="var(--t-ink)" stroke-width="3" stroke-linejoin="round"/>` +
      `<ellipse id="mcr-fz-balloon" cx="160" cy="58" rx="4" ry="4" fill="#f472b6" opacity="0.75" stroke="var(--t-ink)" stroke-width="1.5"/>` +
      mol +
      `<text x="392" y="20" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-muted)">Total mass</text>` +
      `<text id="mcr-fz-mass" x="392" y="48" text-anchor="end" font-size="27" font-weight="800" fill="var(--t-ink)">250.0 g</text>` +
      `<text id="mcr-fz-stat" x="392" y="72" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-blue)">Ready</text>` +
      `<text x="392" y="112" text-anchor="end" font-size="13" fill="var(--t-ink)">baking soda + vinegar</text>` +
      `<text x="392" y="130" text-anchor="end" font-size="13" fill="var(--t-ink)">→ salt + water + CO₂</text>` +
      `<text x="392" y="154" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-green)">Same atoms after</text>` +
      `<text x="20" y="34" font-size="13" fill="var(--t-muted)">vinegar</text><text x="20" y="152" font-size="13" fill="var(--t-muted)">soda</text>`,
      FZ_CTRL);
    let closed = true, t0 = 0, lastT = 0;
    const btns = [...el.querySelectorAll('button')];
    const paintBtns = () => setActive(btns, b => b.dataset.m === (closed ? 'closed' : 'open'));
    btns.forEach(b => b.addEventListener('click', () => {
      if (b.dataset.m === 'again') { t0 = lastT; return; }
      closed = b.dataset.m === 'closed'; t0 = lastT; paintBtns();
    }));
    paintBtns();
    const bl = $('mcr-fz-balloon'), pile = $('mcr-fz-pile');
    const ins = [], outs = [], bs = [];
    for (let i = 0; i < 6; i++) ins.push($('mcr-fz-in' + i));
    for (let i = 0; i < 5; i++) outs.push($('mcr-fz-out' + i));
    for (let i = 0; i < 12; i++) bs.push($('mcr-fz-b' + i));
    api.loop((t) => {
      lastT = t;
      const c = (t - t0) % FZ_CYCLE, s = fizzAt(c, closed);
      const rb = closed ? 4 + 22 * Math.cbrt(s.p * s.g) : 0, ry = rb * 1.12;
      bl.setAttribute('rx', rb); bl.setAttribute('ry', ry); bl.setAttribute('cy', 62 - ry); bl.setAttribute('opacity', closed ? 0.75 : 0);
      pile.setAttribute('rx', 24 * (1 - s.p) + 0.1); pile.setAttribute('ry', 5 * (1 - s.p) + 0.1);
      ins.forEach((m, i) => {
        const on = closed && rb > 9 && s.p * 6 > i;
        m.setAttribute('opacity', on ? 1 : 0);
        if (on) m.setAttribute('transform', `translate(${160 + rb * 0.5 * Math.sin(t * 1.3 + i * 2.1)} ${62 - ry + ry * 0.45 * Math.sin(t * 1.7 + i * 1.3)})`);
      });
      outs.forEach((m, i) => {
        const f = (t * 0.45 + i / 5) % 1, on = !closed && s.rate > 0.05;
        m.setAttribute('opacity', on ? Math.sin(Math.PI * f) : 0);
        if (on) m.setAttribute('transform', `translate(${160 + 14 * Math.sin(t * 2 + i * 1.9) + (i - 2) * 6} ${60 - f * 50})`);
      });
      bs.forEach((b, i) => {
        const f = (t * (0.6 + 0.07 * (i % 4)) + i / 12) % 1;
        b.setAttribute('opacity', s.rate > 0.05 ? 1 : 0);
        b.setAttribute('cx', 160 + Math.sin(i * 2.3) * 24 * (1 - f * 0.4) + Math.sin(t * 4 + i) * 1.5);
        b.setAttribute('cy', 160 - f * 27);
        b.setAttribute('r', 2 + (i % 3) * 0.9);
      });
      $('mcr-fz-mass').textContent = s.mass.toFixed(1) + ' g';
      $('mcr-fz-stat').textContent = fzStatus(c, closed, s.mass);
    });
  }

  function fizz3D() {
    return def3d({ distance: 10.6, pitch: 0.22, yaw: 0.35, autoRotate: 0.1, target: [0, 2.3, 0] }, (view, ctx) => {
      const h = helpers(view);
      view.floor(-0.31, 11, '#c7d2fe');
      // balance
      view.scene.add(new T.Mesh(new T.CylinderGeometry(1.65, 1.75, 0.3, 40), h.mat('#94a3b8', { shininess: 80 })).translateY(-0.15));
      view.label('balance', [0, -0.75, 1.6], { size: 0.6, color: '#475569', fontSize: 46 });
      // conical flask (open at the top), with liquid and a pile of baking soda
      const prof = [new T.Vector2(0.01, 0), new T.Vector2(1.3, 0), new T.Vector2(0.45, 1.9), new T.Vector2(0.45, 2.75)];
      const flask = new T.Mesh(new T.LatheGeometry(prof, 48), view.mat('#dbeafe', { opacity: 0.42, doubleSide: true, shininess: 120, specular: '#ffffff' }));
      view.scene.add(flask);
      const rim = new T.Mesh(new T.TorusGeometry(0.45, 0.035, 8, 40), view.mat('#e0f2fe', { opacity: 0.9 }));
      rim.rotation.x = Math.PI / 2; rim.position.y = 2.75; view.scene.add(rim);
      const liq = new T.Mesh(new T.CylinderGeometry(0.85, 1.25, 0.95, 40), view.mat('#3b82f6', { opacity: 0.6, shininess: 90 }));
      liq.position.y = 0.49; view.scene.add(liq);
      const pile = new T.Mesh(h.sphereG, h.mat('#ffffff', { shininess: 20 })); pile.position.y = 0.1; view.scene.add(pile);
      // balloon: a stretched sphere on the neck
      const balMat = view.mat('#f472b6', { opacity: 0.68, shininess: 90 });
      const bal = new T.Mesh(h.sphereG, balMat); view.scene.add(bal);
      const neck = new T.Mesh(h.cylG, balMat); neck.scale.set(0.5, 0.3, 0.5); neck.position.y = 2.82; view.scene.add(neck);
      // bubbles rising in the liquid
      const bubMat = view.mat('#ffffff', { opacity: 0.85, shininess: 110, specular: '#ffffff' });
      const bubs = [];
      for (let i = 0; i < 16; i++) { const m = new T.Mesh(h.sphereG, bubMat); view.scene.add(m); bubs.push({ m, a: i * 2.4, rr: 0.15 + 0.6 * ((i * 5) % 7) / 7, r: 0.05 + 0.03 * (i % 3), sp: 0.6 + 0.07 * (i % 4) }); }
      // CO2 molecules (inside the balloon when closed, floating off when open)
      const mols = [];
      for (let i = 0; i < 8; i++) { const g = h.molecule('CO2'); g.scale.setScalar(0.5); mols.push({ g, a: i * 1.7 }); }
      // readouts
      h.overlay('top:4px;left:6px;font-size:' + (h.narrow ? 10 : 11) + 'px;max-width:' + (h.narrow ? 92 : 98) + 'px;' + PANEL, h.narrow ? 'soda + vinegar → salt + water + CO₂' : 'baking soda + vinegar<br>→ salt + water + CO₂<div style="color:#15803d;margin-top:2px">Same atoms after</div>');
      const rd = h.overlay('top:4px;right:6px;font-size:' + (h.narrow ? 10 : 11) + 'px;text-align:right;min-width:' + (h.narrow ? 0 : 94) + 'px;' + PANEL,
        '<div style="color:#64748b">Total mass</div><div class="mcr-fzm" style="font-size:18px;font-weight:800">250.0 g</div><div class="mcr-fzs" style="color:#2563eb">Ready</div>');
      const mEl = rd.querySelector('.mcr-fzm'), sEl = rd.querySelector('.mcr-fzs');
      const row = ctx.controls(FZ_CTRL);
      let closed = true, t0 = 0, lastT = 0;
      const btns = [...row.querySelectorAll('button')];
      const paintBtns = () => setActive(btns, b => b.dataset.m === (closed ? 'closed' : 'open'));
      btns.forEach(b => b.addEventListener('click', () => {
        if (b.dataset.m === 'again') { t0 = lastT; return; }
        closed = b.dataset.m === 'closed'; t0 = lastT; paintBtns();
      }));
      paintBtns();
      let lastM = '', lastS = '';
      view.run((t) => {
        lastT = t;
        const c = (t - t0) % FZ_CYCLE, s = fizzAt(c, closed);
        const rb = closed ? 0.1 + 1.1 * Math.cbrt(s.p * s.g) : 0;
        bal.visible = neck.visible = closed;
        bal.scale.set(rb, rb * 1.1, rb); bal.position.y = 2.8 + rb * 1.05;
        pile.scale.set(0.65 * (1 - s.p) + 0.001, 0.2 * (1 - s.p) + 0.001, 0.65 * (1 - s.p) + 0.001);
        bubs.forEach((b, i) => {
          const f = (t * b.sp * 0.55 + i / 16) % 1;
          b.m.position.set(Math.cos(b.a) * b.rr * (1 - 0.3 * f) + 0.04 * Math.sin(t * 5 + i), 0.15 + f * 0.8, Math.sin(b.a) * b.rr * (1 - 0.3 * f));
          b.m.scale.setScalar(b.r * Math.min(1, s.rate * 3) + 0.0001);
        });
        mols.forEach((m, i) => {
          if (closed) {
            const on = rb > 0.4 && s.p * 8 > i;
            m.g.visible = on;
            m.g.position.set(0.55 * rb * Math.sin(t * 1.3 + m.a), 2.8 + rb * 1.05 + 0.45 * rb * Math.sin(t * 1.7 + m.a * 1.3), 0.55 * rb * Math.cos(t * 1.1 + m.a));
            m.g.scale.setScalar(0.5);
          } else {
            const f = (t * 0.32 + i / 8) % 1, on = s.rate > 0.05;
            m.g.visible = on;
            m.g.position.set(0.45 * Math.sin(t * 1.4 + m.a) + (i - 3.5) * 0.12, 2.9 + f * 2.2, 0.45 * Math.cos(t * 1.2 + m.a));
            m.g.scale.setScalar(0.5 * Math.sin(Math.PI * f) + 0.001);
          }
          m.g.rotation.set(t * 0.6 + m.a, t * 0.8, 0);
        });
        const ms = s.mass.toFixed(1) + ' g', st = fzStatus(c, closed, s.mass);
        if (ms !== lastM) { lastM = ms; mEl.textContent = ms; }
        if (st !== lastS) { lastS = st; sEl.textContent = st; }
      });
    });
  }

  steps.push({
    kind: 'example',
    title: 'Real life: Fizz in a flask',
    text: '<p>Baking soda meets vinegar in a flask and they react, making <b>carbon dioxide</b> gas. Trap the gas in a balloon and the total mass stays the same. Let it escape and the balance reading drops. <b>Atoms are never lost.</b></p>',
    explain: '<p>Drag the 3D picture to turn it. A <b>flask</b> on a <b>balance</b> holds vinegar and a white pile of baking soda. Rising bubbles are <b>carbon dioxide</b>. With <b>Balloon on</b> the pink balloon inflates and the mass stays 250.0 g. Press <b>Open flask</b> and the gas floats away, so the mass drops. (Simplified: a real balance also feels a tiny push from the balloon.)</p>',
    say: 'Here is a flask sitting on a balance. Inside are vinegar and a little white baking soda. When they meet, they react and make a new gas called carbon dioxide. Watch the bubbles rise. With the balloon on, the gas is trapped, so the balloon inflates. Now look at the balance. The total mass stays at two hundred fifty grams. Nothing was lost. Now press open flask. The gas floats away into the air, so the balance reading drops by about two grams. But those atoms did not vanish. They are just floating in the room. The atoms before and after are the same. You can drag the picture to turn it around.',
    mount: fizzFlat,
    scene3d: fizz3D()
  });

  // =====================================================================
  // EX2: photosynthesis in a leaf   6CO2 + 6H2O -> C6H12O6 + 6O2   (6 C, 12 H, 18 O on each side)
  // One batch per cycle: 6 CO2 + 6 H2O arrive, 1 glucose forms, 6 O2 leave. Light sets the speed.
  // =====================================================================
  const PH_SECONDS = 7;
  const phRate = L => (1 - Math.exp(-3 * L)) / (1 - Math.exp(-3));     // more light = faster, with diminishing returns
  const phIn = (c, i) => clamp((c - i * 0.012) / 0.44, 0, 1);            // progress of input molecule i (0..1)
  const phOut = (c, i) => clamp((c - 0.54 - i * 0.02) / 0.4, 0, 1);      // progress of output molecule i
  const phInVis = c => ss(c, 0, 0.05) * (1 - ss(c, 0.44, 0.54));
  const phOutVis = c => ss(c, 0.54, 0.6) * (1 - ss(c, 0.93, 0.99));
  const phGluVis = c => ss(c, 0.5, 0.6) * (1 - ss(c, 0.9, 0.98));
  const PH_CTRL = '<div class="scene-slider-row" style="padding:2px 12px 4px"><span>Light</span><input type="range" min="0" max="100" step="1" value="70" aria-label="Light brightness"><span class="mcr-phv" style="min-width:40px;text-align:right">70 %</span></div>';

  function photoFlat(el, api) {
    const icon = (kind, id) => {
      const cir = (x, y, r, f, st) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${st ? ' stroke="var(--t-ink)" stroke-width="0.8"' : ''}/>`;
      const body = kind === 'co2' ? cir(-8, 0, 3.6, 'var(--t-red)') + cir(8, 0, 3.6, 'var(--t-red)') + cir(0, 0, 4.4, '#475569')
        : kind === 'h2o' ? cir(0, -1, 4.6, 'var(--t-red)') + cir(-5.5, 3.5, 3, '#f1f5f9', 1) + cir(5.5, 3.5, 3, '#f1f5f9', 1)
        : cir(-4.5, 0, 4.2, 'var(--t-red)') + cir(4.5, 0, 4.2, 'var(--t-red)');
      return `<g id="${id}" opacity="0">${body}</g>`;
    };
    let mols = '';
    for (let i = 0; i < 6; i++) mols += icon('co2', 'mcr-ph-c' + i) + icon('h2o', 'mcr-ph-w' + i) + icon('o2', 'mcr-ph-o' + i);
    let ph = '';
    for (let i = 0; i < 8; i++) ph += `<circle id="mcr-ph-p${i}" r="3.2" fill="var(--t-yellow)" opacity="0"/>`;
    const $ = flat(el, '0 0 400 190',
      `<circle id="mcr-ph-sun" cx="200" cy="24" r="14" fill="var(--t-yellow)"/><text x="228" y="30" font-size="13" font-weight="700" fill="var(--t-ink)">Light</text>` +
      `<path d="M84 100 Q84 82 108 82 L292 82 Q316 82 316 100 Q316 118 292 118 L108 118 Q84 118 84 100Z" fill="#4ade80" opacity="0.8" stroke="var(--t-green)" stroke-width="2"/>` +
      `<path d="M92 122 Q70 130 56 160" fill="none" stroke="var(--t-green)" stroke-width="7" stroke-linecap="round"/>` +
      `<ellipse cx="255" cy="118" rx="8" ry="2.5" fill="#166534"/><ellipse cx="145" cy="118" rx="8" ry="2.5" fill="#166534"/>` +
      ph + mols +
      `<g id="mcr-ph-glu" opacity="0"><rect x="-31" y="-11" width="62" height="22" rx="9" fill="#fde68a" stroke="var(--t-ink)" stroke-width="1.5"/><text y="4.5" text-anchor="middle" font-size="12" font-weight="800" fill="#1f2937">C₆H₁₂O₆</text></g>` +
      `<text x="392" y="20" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-ink)" id="mcr-ph-lt">Light 70 %</text>` +
      `<text x="392" y="40" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-green)" id="mcr-ph-n">Glucose made: 0</text>` +
      `<text x="8" y="20" font-size="13" font-weight="700" fill="var(--t-ink)">6CO₂ + 6H₂O</text><text x="8" y="38" font-size="13" font-weight="700" fill="var(--t-ink)">→ C₆H₁₂O₆ + 6O₂</text>` +
      `<text x="392" y="180" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-muted)">CO₂ in</text>` +
      `<text x="8" y="180" font-size="13" font-weight="700" fill="var(--t-blue)">Water in</text>` +
      `<text x="180" y="178" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-red)">O₂ out</text>` +
      `<text x="200" y="150" text-anchor="middle" font-size="12" fill="var(--t-muted)" id="mcr-ph-msg"> </text>`,
      PH_CTRL);
    const slider = el.querySelector('input'), lv = el.querySelector('.mcr-phv');
    slider.addEventListener('input', () => { lv.textContent = slider.value + ' %'; });
    const G = i => $('mcr-ph-' + i), cs = [], ws = [], os = [], ps = [];
    for (let i = 0; i < 6; i++) { cs.push(G('c' + i)); ws.push(G('w' + i)); os.push(G('o' + i)); }
    for (let i = 0; i < 8; i++) ps.push(G('p' + i));
    const glu = G('glu'), sun = G('sun');
    let phi = 0;
    const pos = (P, f, sp) => { const k = f < sp ? f / sp : (f - sp) / (1 - sp), A = f < sp ? P[0] : P[1], B = f < sp ? P[1] : P[2]; return [lerp(A[0], B[0], k), lerp(A[1], B[1], k)]; };
    api.loop((t, dt) => {
      const L = slider.value / 100, r = phRate(L);
      phi += r * dt / PH_SECONDS;
      const c = phi % 1;
      sun.setAttribute('opacity', 0.25 + 0.75 * L); sun.setAttribute('r', 11 + 5 * L);
      ps.forEach((p, i) => {
        const f = (t * 0.6 + i / 8) % 1;
        p.setAttribute('opacity', L > 0.02 && i < Math.ceil(L * 8) ? 0.9 : 0);
        p.setAttribute('cx', 130 + i * 20 + 6 * Math.sin(t + i)); p.setAttribute('cy', 44 + f * 40);
      });
      const vi = phInVis(c), vo = phOutVis(c);
      for (let i = 0; i < 6; i++) {
        const ty = 92 + (i > 2 ? 16 : 0), txc = 215 + (i % 3) * 22, txw = 120 + (i % 3) * 22, txo = 170 + (i % 3) * 22;
        const pc = pos([[350 - i * 3, 160], [255, 120], [txc, ty]], phIn(c, i), 0.6), pw = pos([[44, 156], [102, 102], [txw, ty]], phIn(c, i), 0.6);
        const po = pos([[txo, ty], [145, 120], [60 + i * 8, 168]], phOut(c, i), 0.4);
        cs[i].setAttribute('transform', `translate(${pc[0]} ${pc[1]}) scale(${1.3 * vi + 0.001})`); cs[i].setAttribute('opacity', vi > 0.02 ? 1 : 0);
        ws[i].setAttribute('transform', `translate(${pw[0]} ${pw[1]}) scale(${1.3 * vi + 0.001})`); ws[i].setAttribute('opacity', vi > 0.02 ? 1 : 0);
        os[i].setAttribute('transform', `translate(${po[0]} ${po[1]}) scale(${1.3 * vo + 0.001})`); os[i].setAttribute('opacity', vo > 0.02 ? 1 : 0);
      }
      const gv = phGluVis(c);
      glu.setAttribute('opacity', gv > 0.02 ? 1 : 0);
      glu.setAttribute('transform', `translate(${200 + 60 * ss(c, 0.86, 0.98)} 66) scale(${gv + 0.001})`);
      $('mcr-ph-lt').textContent = L === 0 ? 'Light off' : 'Light ' + slider.value + ' %';
      $('mcr-ph-n').textContent = 'Glucose made: ' + Math.floor(phi);
      $('mcr-ph-msg').textContent = L === 0 ? 'No light, no sugar' : ' ';
    });
  }

  function photo3D() {
    return def3d({ distance: 10.4, pitch: 0.24, yaw: 0.3, autoRotate: 0.09, target: [0, -0.15, 0] }, (view, ctx) => {
      const h = helpers(view);
      // the leaf: a translucent slab in cross-section, with a stem, and two stomata (tiny holes) underneath
      const leafMat = view.mat('#4ade80', { opacity: 0.5, shininess: 60 });
      const leaf = new T.Mesh(new T.BoxGeometry(6, 0.7, 2.6), leafMat); view.scene.add(leaf);
      const top = new T.Mesh(new T.BoxGeometry(6.02, 0.1, 2.62), view.mat('#16a34a', { opacity: 0.85 })); top.position.y = 0.3; view.scene.add(top);
      const stem = h.cyl(view.scene, [-3.0, -0.05, 0], [-4.4, -1.2, 0], 0.16, h.mat('#15803d'));
      [1.4, -1.4].forEach(x => { const d = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.06, 20), h.mat('#14532d')); d.position.set(x, -0.36, 0); view.scene.add(d); });
      // sunlight: photons drifting down, more of them when the light is brighter
      const sun = new T.Mesh(h.sphereG, view.mat('#fde047', { emissive: '#facc15', shininess: 10 })); sun.position.set(0.6, 2.7, 0); view.scene.add(sun);
      const phMat = view.mat('#fde047', { emissive: '#fde047', opacity: 0.9, shininess: 10 });
      const photons = [];
      for (let i = 0; i < 10; i++) { const m = new T.Mesh(h.sphereG, phMat); view.scene.add(m); photons.push(m); }
      // molecules: 6 CO2 + 6 H2O in, 1 glucose, 6 O2 out
      const mk = (name, sc) => { const g = h.molecule(name); g.scale.setScalar(sc); return g; };
      const co = [], wa = [], ox = [];
      for (let i = 0; i < 6; i++) {
        const z = (i - 2.5) * 0.36, tx = (i % 3) * 0.3;
        co.push({ g: mk('CO2', 0.5), P: [[4.3 - i * 0.1, -1.6, z], [1.4, -0.45, z], [0.6 + tx, 0.02, z * 0.6]] });
        wa.push({ g: mk('H2O', 0.55), P: [[-4.5, -1.3, z], [-3.1, -0.05, z], [-0.7 - tx, 0.02, z * 0.6]] });
        ox.push({ g: mk('O2', 0.5), P: [[0.6 + tx, 0.02, z * 0.6], [-1.4, -0.45, z], [-2.6 - i * 0.12, -1.7, z]] });
      }
      const glu = mk('GLU', 0.42);
      const gLab = view.label('glucose (sugar)', [0, 1.75, 0], { size: 0.62, color: '#1f2937', fontSize: 46 });
      view.label('CO₂ in', [3.7, -2.15, 0.2], { size: 0.95, color: '#475569', fontSize: 56 });
      view.label('Water in', [-4.1, -1.85, 0.2], { size: 0.95, color: '#0284c7', fontSize: 52 });
      view.label('O₂ out', [-2.1, -2.2, 0.2], { size: 0.95, color: '#dc2626', fontSize: 56 });
      h.overlay('top:4px;left:6px;font-size:11px;max-width:134px;' + PANEL, '6CO₂ + 6H₂O<br>→ C₆H₁₂O₆ + 6O₂<div style="color:#15803d;margin-top:2px">6C · 12H · 18O both sides</div>');
      const rd = h.overlay('top:4px;right:6px;font-size:11px;text-align:right;min-width:92px;' + PANEL, '<div class="mcr-l">Light 70 %</div><div class="mcr-n" style="color:#15803d">Glucose made: 0</div>');
      const lEl = rd.querySelector('.mcr-l'), nEl = rd.querySelector('.mcr-n');
      const row = ctx.controls(PH_CTRL);
      const slider = row.querySelector('input'), lv = row.querySelector('.mcr-phv');
      slider.addEventListener('input', () => { lv.textContent = slider.value + ' %'; });
      const place = (o, f, sp) => {
        const k = f < sp ? f / sp : (f - sp) / (1 - sp), A = f < sp ? o.P[0] : o.P[1], B = f < sp ? o.P[1] : o.P[2];
        o.g.position.set(lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k));
      };
      let phi = 0, lastL = '', lastN = -1;
      view.run((t, dt) => {
        const L = slider.value / 100, r = phRate(L);
        phi += r * (dt || 0) / PH_SECONDS;
        const c = phi % 1, vi = phInVis(c), vo = phOutVis(c), gv = phGluVis(c);
        sun.scale.setScalar(0.3 + 0.28 * L); sun.material.emissiveIntensity = 0.3 + 0.7 * L;
        photons.forEach((m, i) => {
          const f = (t * 0.55 + i / 10) % 1;
          m.position.set(-2.5 + i * 0.62 + 0.3 * Math.sin(t + i), lerp(2.3, 0.55, f), 0.4 * Math.sin(i * 2.3));
          m.scale.setScalar(i < Math.ceil(L * 10) && L > 0.01 ? 0.11 : 0.0001);
        });
        for (let i = 0; i < 6; i++) {
          place(co[i], phIn(c, i), 0.6); place(wa[i], phIn(c, i), 0.6); place(ox[i], phOut(c, i), 0.4);
          co[i].g.scale.setScalar(0.5 * vi + 0.001); wa[i].g.scale.setScalar(0.55 * vi + 0.001); ox[i].g.scale.setScalar(0.5 * vo + 0.001);
          co[i].g.visible = wa[i].g.visible = vi > 0.02; ox[i].g.visible = vo > 0.02;
          co[i].g.rotation.set(t * 0.7 + i, t * 0.9, 0); wa[i].g.rotation.set(0, t * 0.8 + i, t * 0.5); ox[i].g.rotation.set(t * 0.6 + i, t, 0);
        }
        const sx = 2.6 * ss(c, 0.86, 0.98);
        glu.visible = gv > 0.02; glu.scale.setScalar(0.42 * gv + 0.001);
        glu.position.set(sx, 1.05, 0); glu.rotation.y = t * 0.6;
        gLab.visible = gv > 0.4; gLab.position.set(sx, 1.85, 0);
        leafMat.emissive.setRGB(0, 0.22 * L * (0.6 + 0.4 * Math.sin(t * 2)), 0.04 * L);
        const lt = L === 0 ? 'Light off: no sugar' : 'Light ' + slider.value + ' %';
        if (lt !== lastL) { lastL = lt; lEl.textContent = lt; }
        const n = Math.floor(phi);
        if (n !== lastN) { lastN = n; nEl.textContent = 'Glucose made: ' + n; }
      });
    });
  }

  steps.push({
    kind: 'example',
    title: 'Real life: Photosynthesis in a leaf',
    text: '<p>A leaf is a tiny sugar factory. Using light energy it turns <b>carbon dioxide</b> and <b>water</b> into <b>glucose</b> and <b>oxygen</b>. Every atom is kept: 6 C, 12 H and 18 O on each side of the equation.</p>',
    explain: '<p>A green <b>leaf</b> cut open, with the sun above. Grey-and-red <b>carbon dioxide</b> enters through a hole underneath on the right, and <b>water</b> comes up the stem on the left. A batch of six of each turns into one ring-shaped <b>glucose</b> molecule and six red <b>oxygen</b> molecules leave. The <b>Light</b> slider sets the speed; at zero nothing is made.</p>',
    say: 'This leaf is cut open so you can see inside. Sunlight shines down from above. Carbon dioxide from the air drifts in through tiny holes under the leaf. Water travels up the stem from the roots. Watch a batch of six carbon dioxide molecules and six water molecules arrive. Then they vanish, and one glucose molecule appears. That is a sugar, the plant food. At the same time, six oxygen molecules leave through the holes. Count the atoms, six carbon, twelve hydrogen, and eighteen oxygen, on both sides. Now slide the light down. Less light means slower sugar making. Turn it off completely, and the leaf makes nothing at all.',
    mount: photoFlat,
    scene3d: photo3D()
  });

  // =====================================================================
  // EX3: hand warmer (iron powder rusting quickly; exothermic)   4Fe + 3O2 -> 2Fe2O3 + heat   (4 Fe, 6 O each side)
  // Packet temperature follows: heating = 2.8 * rate, cooling = 0.08 * (T - 20)  ->  about 55 C at full rate.
  // =====================================================================
  function makeHw() { return { rust: 0, T: 20, open: true, r: 0 }; }
  function hwStep(s, dt) {
    s.r = s.open ? Math.sqrt(Math.max(0, 1 - s.rust)) : 0;
    s.rust = Math.min(1, s.rust + 0.03 * s.r * dt);
    s.T += (2.8 * s.r - 0.08 * (s.T - 20)) * dt;
  }
  const HW_CTRL = '<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 6px">' +
    '<button type="button" class="scene-btn" style="padding:2px 8px;font-size:.78rem" data-m="open">Open packet</button><button type="button" class="scene-btn" style="padding:2px 8px;font-size:.78rem" data-m="seal">Seal it</button><button type="button" class="scene-btn" style="padding:2px 8px;font-size:.78rem" data-m="new">New packet</button></div>';
  function hwWire(row, s) {
    const btns = [...row.querySelectorAll('button')];
    const paint = () => setActive(btns, b => b.dataset.m === (s.open ? 'open' : 'seal'));
    btns.forEach(b => b.addEventListener('click', () => {
      if (b.dataset.m === 'new') { s.rust = 0; s.T = 20; s.open = true; }
      else s.open = b.dataset.m === 'open';
      paint();
    }));
    paint();
  }
  const hwText = s => ({ t: 'Packet ' + Math.round(s.T) + ' °C', i: 'Iron left ' + Math.round((1 - s.rust) * 100) + ' %', m: s.open ? (s.rust > 0.98 ? 'All iron used up' : 'Air in: it warms') : 'Sealed: no reaction' });

  function warmerFlat(el, api) {
    let grains = '', o2 = '', heat = '';
    for (let i = 0; i < 30; i++) grains += `<circle id="mcr-hw-g${i}" cx="${64 + (i % 10) * 15.5 + (Math.floor(i / 10) % 2) * 6}" cy="${140 + Math.floor(i / 10) * 8.5}" r="4.6" fill="#94a3b8" stroke="var(--t-ink)" stroke-width="0.6"/>`;
    for (let i = 0; i < 4; i++) o2 += `<g id="mcr-hw-o${i}" opacity="0"><circle cx="-4.5" r="4.2" fill="var(--t-red)"/><circle cx="4.5" r="4.2" fill="var(--t-red)"/></g>`;
    for (let i = 0; i < 5; i++) heat += `<circle id="mcr-hw-h${i}" r="4" fill="var(--t-orange)" opacity="0"/>`;
    const $ = flat(el, '0 0 400 190',
      `<rect x="40" y="128" width="190" height="40" rx="5" fill="var(--t-soft)" stroke="var(--t-ink)" stroke-width="2.5"/>` + grains +
      `<rect id="mcr-hw-lid" x="36" y="112" width="198" height="14" rx="4" fill="var(--t-blue)" opacity="0.5" stroke="var(--t-ink)" stroke-width="1.5"/>` +
      `<text x="135" y="184" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t-muted)">iron powder</text>` +
      o2 + heat +
      `<rect x="244" y="34" width="16" height="118" rx="8" fill="var(--t-soft)" stroke="var(--t-ink)" stroke-width="2"/>` +
      `<circle cx="252" cy="158" r="12" fill="var(--t-red)"/><rect id="mcr-hw-hg" x="248.5" y="120" width="7" height="34" fill="var(--t-red)"/>` +
      `<text x="8" y="20" font-size="13" font-weight="700" fill="var(--t-ink)">4Fe + 3O₂ → 2Fe₂O₃</text>` +
      `<text x="8" y="38" font-size="12" fill="var(--t-muted)">iron + oxygen → rust + heat</text>` +
      `<text id="mcr-hw-t" x="392" y="64" text-anchor="end" font-size="17" font-weight="800" fill="var(--t-orange)">Packet 20 °C</text>` +
      `<text id="mcr-hw-i" x="392" y="88" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-ink)">Iron left 100 %</text>` +
      `<text id="mcr-hw-m" x="392" y="112" text-anchor="end" font-size="12" font-weight="700" fill="var(--t-blue)"> </text>`,
      HW_CTRL);
    const s = makeHw();
    hwWire(el.querySelector('.scene-slider-row'), s);
    const gs = [], os = [], hs = [], order = [];
    for (let i = 0; i < 30; i++) { gs.push($('mcr-hw-g' + i)); order.push((i * 11) % 30 / 30); }
    for (let i = 0; i < 4; i++) os.push($('mcr-hw-o' + i));
    for (let i = 0; i < 5; i++) hs.push($('mcr-hw-h' + i));
    const lid = $('mcr-hw-lid'), hg = $('mcr-hw-hg');
    let lidK = 0;
    api.loop((t, dt) => {
      hwStep(s, dt);
      lidK += ((s.open ? 1 : 0) - lidK) * Math.min(1, dt * 5);
      lid.setAttribute('transform', `translate(0 ${-lidK * 22})`); lid.setAttribute('opacity', 0.5 * (1 - lidK) + 0.001);
      gs.forEach((g, i) => g.setAttribute('fill', s.rust > order[i] ? '#b45309' : '#94a3b8'));
      os.forEach((o, i) => {
        const f = (t * 0.5 + i / 4) % 1, on = s.r > 0.05;
        o.setAttribute('opacity', on ? Math.sin(Math.PI * f) : 0);
        o.setAttribute('transform', `translate(${70 + i * 45 + 5 * Math.sin(t * 2 + i)} ${50 + f * 80})`);
      });
      hs.forEach((h, i) => {
        const f = (t * 0.6 + i / 5) % 1;
        h.setAttribute('opacity', s.r * Math.sin(Math.PI * f) * 0.9);
        h.setAttribute('cx', 60 + i * 38 + 6 * Math.sin(t * 3 + i)); h.setAttribute('cy', 118 - f * 40);
      });
      const fr = clamp((s.T - 15) / 50, 0.05, 1);
      hg.setAttribute('height', 6 + fr * 100); hg.setAttribute('y', 154 - (6 + fr * 100));
      const x = hwText(s);
      $('mcr-hw-t').textContent = x.t; $('mcr-hw-i').textContent = x.i; $('mcr-hw-m').textContent = x.m;
    });
  }

  function warmer3D() {
    return def3d({ distance: 7.8, pitch: 0.3, yaw: 0.3, autoRotate: 0.1, target: [0.8, 1.25, 0] }, (view, ctx) => {
      const h = helpers(view);
      view.floor(0, 11, '#c7d2fe');
      // open packet: a shallow tray of iron powder grains
      const trayM = h.mat('#a8a29e', { shininess: 30 });
      const tray = [[3.4, 0.16, 2.2, 0, 0.08, 0], [3.4, 0.4, 0.08, 0, 0.2, 1.06], [3.4, 0.4, 0.08, 0, 0.2, -1.06], [0.08, 0.4, 2.2, 1.66, 0.2, 0], [0.08, 0.4, 2.2, -1.66, 0.2, 0]];
      tray.forEach(b => { const m = new T.Mesh(new T.BoxGeometry(b[0], b[1], b[2]), trayM); m.position.set(b[3], b[4], b[5]); view.scene.add(m); });
      const ironM = h.mat('#94a3b8', { shininess: 110, specular: '#ffffff' }), rustM = h.mat('#b45309', { shininess: 15 });
      const grains = [];
      for (let i = 0; i < 54; i++) {
        const m = new T.Mesh(h.sphereG, ironM);
        const gx = -1.35 + (i % 9) * 0.34 + rnd(-0.06, 0.06), gz = -0.75 + Math.floor(i / 9) * 0.3 + rnd(-0.06, 0.06);
        m.position.set(gx, 0.24 + rnd(0, 0.05), gz); m.scale.setScalar(0.12 + rnd(0, 0.03));
        view.scene.add(m); grains.push({ m, o: (i * 17 % 54) / 54 });
      }
      const lidM = view.mat('#7dd3fc', { opacity: 0.4, shininess: 100 });
      const lid = new T.Mesh(new T.BoxGeometry(3.5, 0.05, 2.3), lidM); view.scene.add(lid);
      view.label('iron powder', [0, -0.35, 1.5], { size: 0.68, color: '#475569', fontSize: 50 });
      // oxygen from the air falls in when the packet is open; heat rises off it
      const o2 = [];
      for (let i = 0; i < 5; i++) { const g = h.molecule('O2'); g.scale.setScalar(0.5); o2.push({ g, x: -1.3 + i * 0.65, z: (i % 2 ? 0.5 : -0.5), dl: i / 5 }); }
      const heatM = view.mat('#fb923c', { emissive: '#ea580c', opacity: 0.85, shininess: 20 });
      const heat = [];
      for (let i = 0; i < 8; i++) { const m = new T.Mesh(h.sphereG, heatM); view.scene.add(m); heat.push({ m, x: -1.3 + i * 0.37, z: (i % 3 - 1) * 0.5 }); }
      // thermometer
      const tube = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 2.8, 20, 1, true), view.mat('#dbeafe', { opacity: 0.35, doubleSide: true, shininess: 120, specular: '#ffffff' }));
      tube.position.set(3.4, 1.7, 0); view.scene.add(tube);
      const bulbM = view.mat('#ef4444', { shininess: 80 });
      const bulb = new T.Mesh(h.sphereG, bulbM); bulb.scale.setScalar(0.36); bulb.position.set(3.4, 0.3, 0); view.scene.add(bulb);
      const merc = new T.Mesh(h.cylG, bulbM); view.scene.add(merc);
      h.overlay('top:4px;left:6px;font-size:11px;max-width:132px;' + PANEL, '4Fe + 3O₂ → 2Fe₂O₃' + (h.narrow ? '' : '<br><span style="color:#64748b">iron + oxygen → rust + heat</span>') + '<div style="color:#15803d;margin-top:2px">4 Fe · 6 O each side</div>');
      const rd = h.overlay('top:4px;right:6px;font-size:11px;text-align:right;min-width:100px;' + PANEL, '<div class="mcr-t" style="font-size:15px;font-weight:800;color:#ea580c">Packet 20 °C</div><div class="mcr-i">Iron left 100 %</div><div class="mcr-m" style="color:#2563eb"> </div>');
      const tE = rd.querySelector('.mcr-t'), iE = rd.querySelector('.mcr-i'), mE = rd.querySelector('.mcr-m');
      const s = makeHw();
      hwWire(ctx.controls(HW_CTRL), s);
      let lidK = 0, l1 = '', l2 = '', l3 = '';
      view.run((t, dt) => {
        dt = dt || 0;
        hwStep(s, dt);
        lidK += ((s.open ? 1 : 0) - lidK) * Math.min(1, dt * 5 || 1);
        lid.position.set(0, 0.55 + lidK * 0.6, 0); lidM.opacity = 0.4 * (1 - lidK); lid.visible = lidK < 0.98;
        grains.forEach(g => { g.m.material = s.rust > g.o ? rustM : ironM; });
        o2.forEach(o => {
          const f = (t * 0.4 + o.dl) % 1, on = s.r > 0.05;
          o.g.visible = on;
          o.g.position.set(o.x + 0.1 * Math.sin(t * 1.5 + o.dl * 6), lerp(2.6, 0.5, f), o.z);
          o.g.scale.setScalar(0.5 * Math.min(1, s.r * 1.5) * ss(f, 0, 0.12) * (1 - ss(f, 0.85, 1)) + 0.001);
          o.g.rotation.set(t + o.dl * 5, t * 0.7, 0);
        });
        heat.forEach((q, i) => {
          const f = (t * 0.5 + i / 8) % 1;
          q.m.position.set(q.x + 0.1 * Math.sin(t * 3 + i), 0.75 + f * 1.4, q.z);
          q.m.scale.setScalar(0.13 * s.r * Math.sin(Math.PI * f) + 0.0001);
        });
        const mh = 0.2 + clamp((s.T - 15) / 50, 0.03, 1) * 2.2;
        merc.scale.set(0.09, mh, 0.09); merc.position.set(3.4, 0.3 + mh / 2, 0);
        const x = hwText(s);
        if (x.t !== l1) { l1 = x.t; tE.textContent = x.t; } if (x.i !== l2) { l2 = x.i; iE.textContent = x.i; } if (x.m !== l3) { l3 = x.m; mE.textContent = x.m; }
      });
    });
  }

  steps.push({
    kind: 'example',
    title: 'Real life: A hand warmer',
    text: '<p>A hand warmer is <b>rusting made fast</b>. Fine iron powder, salt and water meet oxygen from the air and give out heat. The reaction is <b>exothermic</b>, so the packet warms up. Keep it sealed and nothing happens.</p>',
    explain: '<p>A tray of grey <b>iron powder</b> grains sits under a glass-blue <b>lid</b> that lifts away and fades when you press <b>Open packet</b>. Red <b>oxygen</b> pairs fall in, grains turn brown-orange as they rust, orange dots of <b>heat</b> rise, and the thermometer climbs. <b>Seal it</b> and the warming stops; <b>New packet</b> starts again.</p>',
    say: 'A hand warmer is really rusting, but made fast. Inside the packet is a fine iron powder. Tiny grains have lots of surface, so the reaction speeds up. Watch the lid lift away. Oxygen from the air falls in, and the grey iron grains slowly turn brown as they rust. This reaction gives out heat, so the thermometer climbs to about fifty five degrees Celsius. That is an exothermic reaction. Now press seal it. With no fresh oxygen, the reaction stops, and the packet cools down. Press new packet to try again. An instant cold pack does the opposite. It takes in heat and feels cold. Four iron atoms and six oxygen atoms are on both sides.',
    mount: warmerFlat,
    scene3d: warmer3D()
  });

  // =====================================================================
  // EX4: splitting water with electricity (electrolysis)   2H2O -> 2H2 + O2   (4 H, 2 O each side)
  // Hydrogen forms at the negative electrode, oxygen at the positive one, always 2 : 1 by volume.
  // =====================================================================
  const EL_MAX = 10;            // mL of hydrogen that fills a tube
  function makeEl() { return { vH: 0, hold: 0 }; }
  function elStep(s, dt, I) {
    if (s.vH >= EL_MAX) { s.hold += dt; if (s.hold > 2.2) { s.vH = 0; s.hold = 0; } return; }
    s.vH = Math.min(EL_MAX, s.vH + 1.4 * I * dt);
  }
  const EL_CTRL = '<div class="scene-slider-row" style="padding:2px 12px 4px"><span>Current</span><input type="range" min="0" max="100" step="1" value="60" aria-label="Electric current"><span class="mcr-elv" style="min-width:40px;text-align:right">60 %</span></div>';

  function electroFlat(el, api) {
    let bh = '', bo = '';
    for (let i = 0; i < 8; i++) bh += `<circle id="mcr-el-bh${i}" r="2.6" fill="#fff" stroke="var(--t-blue)" stroke-width="1" opacity="0"/>`;
    for (let i = 0; i < 4; i++) bo += `<circle id="mcr-el-bo${i}" r="2.6" fill="#fff" stroke="var(--t-red)" stroke-width="1" opacity="0"/>`;
    const $ = flat(el, '0 0 400 190',
      `<rect x="62" y="100" width="190" height="72" fill="var(--t-blue)" opacity="0.3"/>` +
      `<rect id="mcr-el-wh" x="102" y="42" width="38" height="86" fill="var(--t-blue)" opacity="0.32"/><rect id="mcr-el-wo" x="174" y="42" width="38" height="86" fill="var(--t-blue)" opacity="0.32"/>` +
      `<rect id="mcr-el-gh" x="102" y="42" width="38" height="0" fill="#fff" opacity="0.85"/><rect id="mcr-el-go" x="174" y="42" width="38" height="0" fill="#fff" opacity="0.85"/>` +
      `<path d="M62 76 L62 168 Q62 172 66 172 L248 172 Q252 172 252 168 L252 76" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
      `<path d="M101 42 L101 128 M141 42 L141 128 M173 42 L173 128 M213 42 L213 128" stroke="var(--t-ink)" stroke-width="2.5"/>` +
      `<path d="M101 42 L141 42 M173 42 L213 42" stroke="var(--t-ink)" stroke-width="2.5"/>` +
      `<rect x="119" y="140" width="4" height="34" fill="var(--t-muted)"/><rect x="191" y="140" width="4" height="34" fill="var(--t-muted)"/>` +
      bh + bo +
      `<path d="M121 172 L121 184 L262 184 L262 124 M193 172 L193 178 L348 178 L348 124" fill="none" stroke="var(--t-ink)" stroke-width="2"/>` +
      `<rect x="262" y="108" width="86" height="28" rx="4" fill="#fde68a" stroke="var(--t-ink)" stroke-width="2"/>` +
      `<text x="272" y="127" font-size="16" font-weight="800" fill="#1d4ed8">−</text><text x="332" y="127" font-size="16" font-weight="800" fill="#b91c1c">+</text>` +
      `<text x="121" y="36" text-anchor="middle" font-size="13" font-weight="800" fill="var(--t-blue)">H₂</text><text x="193" y="36" text-anchor="middle" font-size="13" font-weight="800" fill="var(--t-red)">O₂</text>` +
      `<text x="392" y="20" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-ink)">2H₂O → 2H₂ + O₂</text>` +
      `<text x="392" y="37" text-anchor="end" font-size="12" fill="var(--t-muted)">4 H · 2 O each side</text>` +
      `<text id="mcr-el-h" x="392" y="62" text-anchor="end" font-size="14" font-weight="800" fill="var(--t-blue)">H₂ 0.0 mL</text>` +
      `<text id="mcr-el-o" x="392" y="80" text-anchor="end" font-size="14" font-weight="800" fill="var(--t-red)">O₂ 0.0 mL</text>` +
      `<text id="mcr-el-r" x="392" y="98" text-anchor="end" font-size="12" font-weight="700" fill="var(--t-muted)">ratio 2 : 1</text>`,
      EL_CTRL);
    const slider = el.querySelector('input'), lv = el.querySelector('.mcr-elv');
    slider.addEventListener('input', () => { lv.textContent = slider.value + ' %'; });
    const s = makeEl(), bH = [], bO = [];
    for (let i = 0; i < 8; i++) bH.push($('mcr-el-bh' + i));
    for (let i = 0; i < 4; i++) bO.push($('mcr-el-bo' + i));
    api.loop((t, dt) => {
      const I = slider.value / 100;
      elStep(s, dt, I);
      const gh = s.vH / EL_MAX * 76, go = s.vH / 2 / EL_MAX * 76;
      $('mcr-el-gh').setAttribute('height', gh); $('mcr-el-go').setAttribute('height', go);
      $('mcr-el-wh').setAttribute('y', 42 + gh); $('mcr-el-wh').setAttribute('height', 86 - gh);
      $('mcr-el-wo').setAttribute('y', 42 + go); $('mcr-el-wo').setAttribute('height', 86 - go);
      const on = I > 0.02 && s.vH < EL_MAX;
      bH.forEach((b, i) => { const f = (t * (0.5 + I) + i / 8) % 1, top = 42 + gh; b.setAttribute('opacity', on ? 1 : 0); b.setAttribute('cx', 121 + 5 * Math.sin(t * 4 + i * 2)); b.setAttribute('cy', 140 - f * (140 - top)); });
      bO.forEach((b, i) => { const f = (t * (0.5 + I) + i / 4) % 1, top = 42 + go; b.setAttribute('opacity', on ? 1 : 0); b.setAttribute('cx', 193 + 5 * Math.sin(t * 4 + i * 2)); b.setAttribute('cy', 140 - f * (140 - top)); });
      $('mcr-el-h').textContent = 'H₂ ' + s.vH.toFixed(1) + ' mL';
      $('mcr-el-o').textContent = 'O₂ ' + (s.vH / 2).toFixed(1) + ' mL';
      $('mcr-el-r').textContent = I === 0 ? 'Power off' : (s.vH >= EL_MAX ? 'Tube full: refilling' : 'ratio 2 : 1');
    });
  }

  function electro3D() {
    return def3d({ distance: 10.8, pitch: 0.24, yaw: 0.3, autoRotate: 0.09, target: [0, 1.4, 0.8] }, (view, ctx) => {
      const h = helpers(view);
      view.floor(-0.42, 11, '#c7d2fe');
      const plate = new T.Mesh(new T.CylinderGeometry(2.6, 2.7, 0.3, 40), h.mat('#64748b', { shininess: 60 })); plate.position.y = -0.15; view.scene.add(plate);
      const bk = view.beaker(2.3, 3.0, { base: 0, liquidColor: '#93c5fd', level: 0.7, liquidOpacity: 0.42 });
      const XH = -0.95, XO = 0.95, TB = 0.9, TT = 3.9, TR = 0.5, GMAX = 2.5;
      const tubeM = view.mat('#dbeafe', { opacity: 0.22, doubleSide: true, shininess: 120, specular: '#ffffff' });
      [XH, XO].forEach(x => {
        const tb = new T.Mesh(new T.CylinderGeometry(TR, TR, TT - TB, 32, 1, true), tubeM); tb.position.set(x, (TT + TB) / 2, 0); view.scene.add(tb);
        const cap = new T.Mesh(new T.SphereGeometry(TR, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), tubeM); cap.position.set(x, TT, 0); view.scene.add(cap);
        const rod = h.cyl(view.scene, [x, -0.2, 0], [x, 1.9, 0], 0.07, h.mat('#475569', { shininess: 90 })); rod.visible = true;
      });
      const wMat = view.mat('#3b82f6', { opacity: 0.55, shininess: 90 }), gMat = view.mat('#ffffff', { opacity: 0.5, shininess: 60 });
      const mkCol = (x) => { const w = new T.Mesh(h.cylG, wMat), g = new T.Mesh(h.cylG, gMat); view.scene.add(w, g); return { w, g, x }; };
      const cH = mkCol(XH), cO = mkCol(XO);
      // battery in front, wires from the electrodes; minus on the left (hydrogen side), plus on the right
      const wireM = h.mat('#1f2937', { shininess: 30 });
      [XH, XO].forEach(x => h.cyl(view.scene, [x, -0.15, 0], [x, -0.15, 2.7], 0.05, wireM));
      view.box(2.6, 0.6, 0.7, '#facc15', { pos: [0, -0.1, 2.95], shininess: 50 });
      view.label('−', [XH - 0.55, 0.5, 2.95], { size: 0.9, color: '#2563eb', fontSize: 80 });
      view.label('+', [XO + 0.55, 0.5, 2.95], { size: 0.9, color: '#dc2626', fontSize: 80 });
      view.label('H₂ gas', [XH, 4.5, 0], { size: 0.8, color: '#2563eb', fontSize: 56 });
      view.label('O₂ gas', [XO, 4.5, 0], { size: 0.8, color: '#dc2626', fontSize: 56 });
      // bubbles + a few gas molecules collected at the top
      const bubM = view.mat('#ffffff', { opacity: 0.9, shininess: 110, specular: '#ffffff' });
      const bH = [], bO = [];
      for (let i = 0; i < 12; i++) { const m = new T.Mesh(h.sphereG, bubM); view.scene.add(m); bH.push(m); }
      for (let i = 0; i < 6; i++) { const m = new T.Mesh(h.sphereG, bubM); view.scene.add(m); bO.push(m); }
      const mH = [], mO = [];
      for (let i = 0; i < 6; i++) { const g = h.molecule('H2'); g.scale.setScalar(0.4); mH.push(g); }
      for (let i = 0; i < 3; i++) { const g = h.molecule('O2'); g.scale.setScalar(0.4); mO.push(g); }
      h.overlay('top:4px;left:6px;font-size:11px;max-width:112px;' + PANEL, '2H₂O → 2H₂ + O₂<div style="color:#15803d;margin-top:2px">4 H · 2 O each side</div>');
      const rd = h.overlay('top:4px;right:6px;font-size:11px;text-align:right;min-width:88px;' + PANEL, '<div class="mcr-h" style="font-size:14px;font-weight:800;color:#2563eb">H₂ 0.0 mL</div><div class="mcr-o" style="font-size:14px;font-weight:800;color:#dc2626">O₂ 0.0 mL</div><div class="mcr-r" style="color:#64748b">ratio 2 : 1</div>');
      const hE = rd.querySelector('.mcr-h'), oE = rd.querySelector('.mcr-o'), rE = rd.querySelector('.mcr-r');
      const row = ctx.controls(EL_CTRL);
      const slider = row.querySelector('input'), lv = row.querySelector('.mcr-elv');
      slider.addEventListener('input', () => { lv.textContent = slider.value + ' %'; });
      const s = makeEl();
      let l1 = '', l2 = '', l3 = '';
      const setCol = (c, gas) => {
        const wTop = TT - gas, wh = Math.max(0.001, wTop - TB), gh = Math.max(0.001, gas);
        c.w.scale.set(TR * 0.94, wh, TR * 0.94); c.w.position.set(c.x, TB + wh / 2, 0);
        c.g.scale.set(TR * 0.94, gh, TR * 0.94); c.g.position.set(c.x, TT - gh / 2, 0); c.g.visible = gas > 0.02;
        return wTop;
      };
      view.run((t, dt) => {
        dt = dt || 0;
        const I = slider.value / 100;
        elStep(s, dt, I);
        const gH = s.vH / EL_MAX * GMAX, gO = s.vH / 2 / EL_MAX * GMAX;
        const tH = setCol(cH, gH), tO = setCol(cO, gO);
        const on = I > 0.02 && s.vH < EL_MAX;
        bH.forEach((m, i) => { const f = (t * (0.45 + 0.8 * I) + i / 12) % 1, top = Math.max(2.0, tH); m.position.set(XH + 0.16 * Math.sin(t * 5 + i * 2), lerp(1.95, top, f), 0.16 * Math.cos(t * 4 + i)); m.scale.setScalar(on ? 0.07 + 0.02 * (i % 3) : 0.0001); });
        bO.forEach((m, i) => { const f = (t * (0.45 + 0.8 * I) + i / 6) % 1, top = Math.max(2.0, tO); m.position.set(XO + 0.16 * Math.sin(t * 5 + i * 2), lerp(1.95, top, f), 0.16 * Math.cos(t * 4 + i)); m.scale.setScalar(on ? 0.07 + 0.02 * (i % 3) : 0.0001); });
        mH.forEach((g, i) => { g.visible = gH > 0.25 + i * 0.3; g.position.set(XH + 0.2 * Math.sin(t * 1.7 + i * 2), TT - 0.3 - (i % 3) * 0.3 * Math.min(1, gH / 1.5) - (i > 2 ? 0.15 : 0), 0.2 * Math.cos(t * 1.4 + i * 3)); g.rotation.set(t + i, t * 0.7, 0); });
        mO.forEach((g, i) => { g.visible = gO > 0.25 + i * 0.25; g.position.set(XO + 0.2 * Math.sin(t * 1.7 + i * 2), TT - 0.3 - i * 0.3 * Math.min(1, gO / 1.2), 0.2 * Math.cos(t * 1.4 + i * 3)); g.rotation.set(t + i, t * 0.7, 0); });
        const a = 'H₂ ' + s.vH.toFixed(1) + ' mL', b = 'O₂ ' + (s.vH / 2).toFixed(1) + ' mL', c = I === 0 ? 'Power off' : (s.vH >= EL_MAX ? 'Tube full: refilling' : 'ratio 2 : 1');
        if (a !== l1) { l1 = a; hE.textContent = a; } if (b !== l2) { l2 = b; oE.textContent = b; } if (c !== l3) { l3 = c; rE.textContent = c; }
      });
    });
  }

  steps.push({
    kind: 'example',
    title: 'Real life: Splitting water with electricity',
    text: '<p>Electricity can split water into its elements. This is <b>electrolysis</b>, a decomposition reaction: <b>2H<sub>2</sub>O → 2H<sub>2</sub> + O<sub>2</sub></b>. Hydrogen gathers at the negative electrode and oxygen at the positive one, twice as much hydrogen by volume.</p>',
    explain: '<p>A beaker of water with two upside-down <b>test tubes</b> over two rods wired to a yellow <b>battery</b>. White bubbles rise from each rod and push the water down. The left tube (<b>H₂</b>, negative side) fills with twice as much gas as the right tube (<b>O₂</b>, positive side). The <b>Current</b> slider sets the speed.</p>',
    say: 'This beaker of water has two rods connected to a battery. Above each rod is an upside down test tube full of water. Now watch. Bubbles of gas rise from both rods. The gas collects at the top and pushes the water down. Look at the negative side on the left. That gas is hydrogen, and there is twice as much of it. On the positive side, the gas is oxygen. Two water molecules split into two hydrogen molecules and one oxygen molecule. That is why the volume ratio is two to one. Four hydrogen atoms and two oxygen atoms are on both sides. Slide the current down, and the gas comes more slowly. Turn it off, and everything stops.',
    mount: electroFlat,
    scene3d: electro3D()
  });

  // =====================================================================
  // EX5: a cake rises (thermal decomposition of baking soda)   2NaHCO3 -> Na2CO3 + H2O + CO2
  // (2 Na, 2 H, 2 C, 6 O on each side). Nothing much happens below about 80 C.
  // =====================================================================
  function makeCake() { return { rise: 0, hold: 0, k: 0 }; }
  function cakeStep(s, dt, temp) {
    s.k = Math.max(0, temp - 80) / 140;
    if (s.rise >= 1) { s.hold += dt; if (s.hold > 3) { s.rise = 0; s.hold = 0; } return; }
    s.rise = Math.min(1, s.rise + 0.09 * s.k * dt);
  }
  const cakeMsg = (s, temp) => temp <= 80 ? 'Too cool: no gas made' : (s.rise >= 1 ? 'Baked! All soda used' : 'Heat splits the soda');
  const CK_CTRL = '<div class="scene-slider-row" style="padding:2px 12px 4px"><span>Oven</span><input type="range" min="60" max="220" step="5" value="175" aria-label="Oven temperature"><span class="mcr-ckv" style="min-width:52px;text-align:right">175 °C</span></div>';

  function cakeFlat(el, api) {
    let bub = '', gas = '';
    for (let i = 0; i < 12; i++) bub += `<circle id="mcr-ck-b${i}" r="2" fill="#fff8e1" stroke="#b45309" stroke-width="0.8"/>`;
    for (let i = 0; i < 4; i++) gas += `<g id="mcr-ck-g${i}" opacity="0"><circle cx="-8" r="3.6" fill="var(--t-red)"/><circle cx="8" r="3.6" fill="var(--t-red)"/><circle r="4.4" fill="#475569"/></g>`;
    const $ = flat(el, '0 0 400 190',
      `<rect x="60" y="14" width="190" height="158" rx="6" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
      `<line id="mcr-ck-e1" x1="76" y1="28" x2="234" y2="28" stroke="var(--t-muted)" stroke-width="5" stroke-linecap="round"/>` +
      `<line id="mcr-ck-e2" x1="76" y1="160" x2="234" y2="160" stroke="var(--t-muted)" stroke-width="5" stroke-linecap="round"/>` +
      `<rect id="mcr-ck-batter" x="112" y="120" width="86" height="30" fill="#fde68a"/><ellipse id="mcr-ck-dome" cx="155" cy="120" rx="43" ry="1" fill="#fde68a"/>` +
      bub +
      `<path d="M108 100 L112 150 L198 150 L202 100" fill="none" stroke="#475569" stroke-width="4" stroke-linejoin="round"/>` + gas +
      `<text x="155" y="184" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t-muted)">cake tin</text>` +
      `<text id="mcr-ck-t" x="392" y="24" text-anchor="end" font-size="20" font-weight="800" fill="var(--t-orange)">Oven 175 °C</text>` +
      `<text id="mcr-ck-r" x="392" y="46" text-anchor="end" font-size="14" font-weight="700" fill="var(--t-ink)">Rise 0 %</text>` +
      `<text id="mcr-ck-m" x="392" y="66" text-anchor="end" font-size="12" font-weight="700" fill="var(--t-blue)"> </text>` +
      `<text x="392" y="104" text-anchor="end" font-size="12" font-weight="700" fill="var(--t-ink)">2NaHCO₃ →</text>` +
      `<text x="392" y="121" text-anchor="end" font-size="12" font-weight="700" fill="var(--t-ink)">Na₂CO₃ + H₂O + CO₂</text>` +
      `<text x="392" y="140" text-anchor="end" font-size="12" fill="var(--t-muted)">2 Na · 2 H · 2 C · 6 O</text>` +
      `<text x="392" y="156" text-anchor="end" font-size="12" fill="var(--t-muted)">each side</text>`,
      CK_CTRL);
    const slider = el.querySelector('input'), lv = el.querySelector('.mcr-ckv');
    slider.addEventListener('input', () => { lv.textContent = slider.value + ' °C'; });
    const s = makeCake(), bs = [], gs = [];
    for (let i = 0; i < 12; i++) bs.push($('mcr-ck-b' + i));
    for (let i = 0; i < 4; i++) gs.push($('mcr-ck-g' + i));
    const batter = $('mcr-ck-batter'), dome = $('mcr-ck-dome');
    const bx = [], by = [];
    for (let i = 0; i < 12; i++) { bx.push((((i * 37) % 11) / 11 - 0.5) * 0.85); by.push(((i * 53) % 13) / 13); }
    api.loop((t, dt) => {
      const temp = +slider.value;
      cakeStep(s, dt, temp);
      const glow = clamp((temp - 60) / 160, 0, 1), col = `rgb(${Math.round(100 + 139 * glow)},${Math.round(116 - 60 * glow)},${Math.round(139 - 90 * glow)})`;
      $('mcr-ck-e1').setAttribute('stroke', col); $('mcr-ck-e2').setAttribute('stroke', col);
      const hgt = 30 + 30 * s.rise, top = 150 - hgt, brown = `rgb(${Math.round(253 - 40 * s.rise)},${Math.round(230 - 80 * s.rise)},${Math.round(138 - 70 * s.rise)})`;
      batter.setAttribute('y', top); batter.setAttribute('height', hgt); batter.setAttribute('fill', brown);
      dome.setAttribute('cy', top); dome.setAttribute('ry', 1 + 14 * s.rise); dome.setAttribute('fill', brown);
      bs.forEach((b, i) => {
        b.setAttribute('cx', 155 + bx[i] * 86 * 0.9 + 1.2 * Math.sin(t * 3 + i)); b.setAttribute('cy', top + 6 + by[i] * (hgt - 12));
        b.setAttribute('r', 1.6 + 3 * s.rise); b.setAttribute('opacity', s.rise > 0.02 || s.k > 0.05 ? 1 : 0);
      });
      gs.forEach((g, i) => {
        const f = (t * 0.4 + i / 4) % 1, on = s.k > 0.02 && s.rise < 1;
        g.setAttribute('opacity', on ? Math.sin(Math.PI * f) : 0);
        g.setAttribute('transform', `translate(${125 + i * 20 + 6 * Math.sin(t * 2 + i)} ${top - 6 - f * 46})`);
      });
      $('mcr-ck-t').textContent = 'Oven ' + temp + ' °C'; $('mcr-ck-r').textContent = 'Rise ' + Math.round(s.rise * 100) + ' %'; $('mcr-ck-m').textContent = cakeMsg(s, temp);
    });
  }

  function cake3D() {
    return def3d({ distance: 8.4, pitch: 0.38, yaw: 0.3, autoRotate: 0.1, target: [0, 1.0, 0] }, (view, ctx) => {
      const h = helpers(view);
      view.floor(-0.62, 11, '#c7d2fe');
      // oven rack, cake tin, batter with a domed top, heating bars above and below
      view.box(4.6, 0.08, 3.2, '#94a3b8', { pos: [0, -0.04, 0], shininess: 80 });
      const tinM = view.mat('#64748b', { opacity: 0.9, doubleSide: true, shininess: 90 });
      const tin = new T.Mesh(new T.CylinderGeometry(1.55, 1.45, 0.85, 40, 1, true), tinM); tin.position.y = 0.425; view.scene.add(tin);
      const tinBase = new T.Mesh(new T.CircleGeometry(1.45, 40), tinM); tinBase.rotation.x = -Math.PI / 2; tinBase.position.y = 0.02; view.scene.add(tinBase);
      const rim = new T.Mesh(new T.TorusGeometry(1.55, 0.04, 8, 48), view.mat('#cbd5e1')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.85; view.scene.add(rim);
      const batM = view.mat('#fde68a', { opacity: 0.72, shininess: 40 });
      const batter = new T.Mesh(h.cylG, batM); view.scene.add(batter);
      const dome = new T.Mesh(h.sphereG, batM); view.scene.add(dome);
      const bars = [];
      [[2.5, -0.7], [2.5, 0.7], [-0.5, -0.7], [-0.5, 0.7]].forEach(b => {
        const m = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 5.0, 12), view.mat('#64748b', { emissive: '#000000', shininess: 60 }));
        m.rotation.z = Math.PI / 2; m.position.set(0, b[0], b[1]); view.scene.add(m); bars.push(m);
      });
      const bubM = view.mat('#fff8e1', { opacity: 0.9, shininess: 90 });
      const bubs = [];
      for (let i = 0; i < 16; i++) { const m = new T.Mesh(h.sphereG, bubM); view.scene.add(m); bubs.push({ m, a: i * 2.4, rr: ((i * 5) % 7) / 7 * 1.05, fy: ((i * 3) % 11) / 11 }); }
      const gas = [], stm = [];
      for (let i = 0; i < 3; i++) { const g = h.molecule('CO2'); g.scale.setScalar(0.45); gas.push({ g, a: i * 2.1 }); }
      for (let i = 0; i < 3; i++) { const g = h.molecule('H2O'); g.scale.setScalar(0.5); stm.push({ g, a: i * 2.1 + 1 }); }
      h.overlay('top:4px;left:6px;font-size:11px;max-width:126px;' + PANEL, '2NaHCO₃ →<br>Na₂CO₃ + H₂O + CO₂<div style="color:#15803d;margin-top:2px">2 Na · 2 H · 2 C · 6 O each side</div>');
      const rd = h.overlay('top:4px;right:6px;font-size:11px;text-align:right;min-width:96px;' + PANEL, '<div class="mcr-t" style="font-size:15px;font-weight:800;color:#ea580c">Oven 175 °C</div><div class="mcr-r">Rise 0 %</div><div class="mcr-m" style="color:#2563eb"> </div>');
      const tE = rd.querySelector('.mcr-t'), rE = rd.querySelector('.mcr-r'), mE = rd.querySelector('.mcr-m');
      const row = ctx.controls(CK_CTRL);
      const slider = row.querySelector('input'), lv = row.querySelector('.mcr-ckv');
      slider.addEventListener('input', () => { lv.textContent = slider.value + ' °C'; });
      const s = makeCake(), colA = new T.Color('#fde68a'), colB = new T.Color('#d97706'), colH = new T.Color('#64748b'), colR = new T.Color('#ef4444'), tmpC = new T.Color();
      let l1 = '', l2 = '', l3 = '';
      view.run((t, dt) => {
        dt = dt || 0;
        const temp = +slider.value;
        cakeStep(s, dt, temp);
        const glow = clamp((temp - 60) / 160, 0, 1);
        bars.forEach(b => { tmpC.copy(colH).lerp(colR, glow); b.material.color.copy(tmpC); b.material.emissive.setRGB(0.55 * glow, 0.08 * glow, 0); });
        const H = 0.4 + 0.5 * s.rise, dh = 0.03 + 0.6 * s.rise;
        batter.scale.set(1.42, H, 1.42); batter.position.y = 0.04 + H / 2;
        dome.scale.set(1.42, dh, 1.42); dome.position.y = 0.04 + H;
        batM.color.copy(colA).lerp(colB, s.rise * 0.9);
        bubs.forEach((b, i) => {
          b.m.position.set(Math.cos(b.a + 0.2 * Math.sin(t * 0.7 + i)) * b.rr, 0.2 + b.fy * (H - 0.3), Math.sin(b.a) * b.rr);
          b.m.scale.setScalar((0.04 + 0.11 * s.rise) * (s.k > 0.02 || s.rise > 0.02 ? 1 : 0.0001) * (1 + 0.15 * Math.sin(t * 4 + i)));
        });
        const on = s.k > 0.02 && s.rise < 1;
        [gas, stm].forEach((list, li) => list.forEach((o, i) => {
          const f = (t * 0.35 + i / 3 + li * 0.17) % 1;
          o.g.visible = on;
          o.g.position.set((li ? 0.6 : -0.6) + 0.35 * Math.sin(t * 1.3 + o.a) + (i - 1) * 0.5, 0.04 + H + dh + 0.3 + f * 1.4, 0.4 * Math.cos(t * 1.1 + o.a));
          o.g.scale.setScalar((li ? 0.5 : 0.45) * Math.sin(Math.PI * f) + 0.001);
          o.g.rotation.set(t * 0.6 + o.a, t * 0.8, 0);
        }));
        const a = 'Oven ' + temp + ' °C', b = 'Rise ' + Math.round(s.rise * 100) + ' %', c = cakeMsg(s, temp);
        if (a !== l1) { l1 = a; tE.textContent = a; } if (b !== l2) { l2 = b; rE.textContent = b; } if (c !== l3) { l3 = c; mE.textContent = c; }
      });
    });
  }

  steps.push({
    kind: 'example',
    title: 'Real life: A cake rises',
    text: '<p>Heat can start a reaction. In a hot oven <b>baking soda</b> breaks down: <b>2NaHCO<sub>3</sub> → Na<sub>2</sub>CO<sub>3</sub> + H<sub>2</sub>O + CO<sub>2</sub></b>. The <b>carbon dioxide</b> gas bubbles swell inside the batter and make the cake rise. Below about 80 °C almost nothing happens.</p>',
    explain: '<p>A <b>cake tin</b> sits between glowing <b>heating bars</b> in an oven. Slide <b>Oven</b> to set the temperature. Small <b>gas bubbles</b> swell inside the batter and the golden cake rises. <b>Carbon dioxide</b> and <b>water</b> molecules float up and out while sodium carbonate stays in the cake. Cool the oven below about 80 °C and the rise stops.</p>',
    say: 'Here a cake bakes in an oven. Inside the batter is baking soda. When it gets hot enough, the baking soda breaks apart. This is a decomposition reaction, where one substance splits into three. Sodium carbonate stays in the cake. Water vapor and carbon dioxide gas are released. Watch the little bubbles swell, and the cake rises. Some gas floats out of the top. Now use the oven slider. Turn the heat down below about eighty degrees Celsius, and almost nothing happens. Turn it up, and the cake rises faster. Count the atoms. Two sodium, two hydrogen, two carbon, and six oxygen on both sides. Heat was needed to make the reaction go.',
    mount: cakeFlat,
    scene3d: cake3D()
  });

  addTutorialSteps('chemistry', 'reactions', steps, [
    { term: 'Photosynthesis', definition: 'The reaction in leaves that uses light to turn carbon dioxide and water into glucose and oxygen.' },
    { term: 'Electrolysis', definition: 'Using electricity to split a compound into simpler substances, such as water into hydrogen and oxygen.' },
    { term: 'Conservation of mass', definition: 'Atoms are never created or destroyed in a reaction, so the total mass stays the same.' }
  ]);
})();
