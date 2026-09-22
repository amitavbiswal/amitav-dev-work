(function () {
  'use strict';
  // more-chem-molecules: 5 extra real-life example steps for Chemistry > Molecules & Bonding.
  // Each step has a flat (svg / mount) scene used as the fallback, and a true-3D scene (Chem3D).
  // All ids / classes in this file start with "mmol-".

  const SVGNS = 'http://www.w3.org/2000/svg';
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mix = (a, b, t) => a + (b - a) * t;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const CARBON = '#4b5563';

  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function svgText(parent, x, y, size, weight, fill, text, anchor) {
    const t = svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, parent);
    if (anchor) t.setAttribute('text-anchor', anchor);
    if (text != null) t.textContent = text;
    return t;
  }
  // Text that stays readable over busy drawings: a stage-coloured outline behind the letters.
  function haloText(t) { t.style.cssText += ';paint-order:stroke;stroke:var(--surface,#fff);stroke-width:3.5px;stroke-linejoin:round'; return t; }
  // Flat scene shell: an svg (viewBox 400 x 190) plus an optional controls row underneath.
  function flatShell(el, controlsHtml) {
    el.innerHTML =
      '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' +
      (controlsHtml || '');
    return el.querySelector('svg');
  }
  function setBtnOn(row, id) {
    row.querySelectorAll('button').forEach(b => {
      const on = b.id === id;
      b.style.borderColor = on ? 'var(--primary)' : '';
      b.style.color = on ? 'var(--primary)' : '';
    });
  }
  // Seeded random numbers so scenes look the same every time they open.
  function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  // ---- 3D helpers ----
  function cache(view, key, make) {
    view.__mmol = view.__mmol || {};
    return view.__mmol[key] || (view.__mmol[key] = make());
  }
  const matOf = (view, col, o) => cache(view, 'm' + col + JSON.stringify(o || {}), () => view.mat(col, o));
  const cylGeo = view => cache(view, 'cyl', () => new THREE.CylinderGeometry(1, 1, 1, 14));
  const sphGeo = view => cache(view, 'sph', () => new THREE.SphereGeometry(1, 24, 16));
  const UP = V3(0, 1, 0);
  const _sd = V3(0, 0, 0);
  function placeStick(m, A, B, r) {
    _sd.copy(B).sub(A);
    const len = Math.max(_sd.length(), 1e-4);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.scale.set(r, len, r);
    m.quaternion.setFromUnitVectors(UP, _sd.multiplyScalar(1 / len));
  }
  function stick(view, parent, A, B, r, mat) {
    const m = new THREE.Mesh(cylGeo(view), mat);
    placeStick(m, A, B, r);
    parent.add(m);
    return m;
  }
  function ball(view, parent, pos, r, mat) {
    const m = new THREE.Mesh(sphGeo(view), mat);
    m.position.copy(pos); m.scale.setScalar(r);
    parent.add(m);
    return m;
  }
  const narrow = view => view.wrap.clientWidth < 430;   // phone-sized canvas: keep the overlay text short
  // Crisp DOM text laid over the canvas (theme aware halo so it reads in light and dark).
  function overlay(view, html, style) {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;pointer-events:none;font-size:0.74rem;font-weight:700;line-height:1.25;color:var(--t-ink,#1f2937);' +
      'text-shadow:0 0 3px var(--surface,#fff),0 0 3px var(--surface,#fff),0 0 6px var(--surface,#fff);' + (style || '');
    d.innerHTML = html;
    view.wrap.appendChild(d);
    return d;
  }

  // ====================================================================
  // 1. DIAMOND vs GRAPHITE (interactive: pick the form)
  // ====================================================================
  // Shared geometry: a chunk of the diamond lattice and a 3-sheet stack of graphite (lengths in "bond lengths").
  const DIA_BOND = 1.2;
  const diamond = (() => {
    const fcc = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]], pts = [];
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) fcc.forEach(f => {
      const b = [i + f[0], j + f[1], k + f[2]];
      pts.push(b, [b[0] + 0.25, b[1] + 0.25, b[2] + 0.25]);
    });
    const c = [0.125, 0.125, 0.125], s = DIA_BOND / (Math.sqrt(3) / 4);
    const atoms = pts.filter(p => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) < 0.9)
      .map(p => [(p[0] - c[0]) * s, (p[1] - c[1]) * s, (p[2] - c[2]) * s]);
    const bonds = [];
    for (let a = 0; a < atoms.length; a++) for (let b = a + 1; b < atoms.length; b++) {
      if (Math.abs(Math.hypot(atoms[a][0] - atoms[b][0], atoms[a][1] - atoms[b][1], atoms[a][2] - atoms[b][2]) - DIA_BOND) < 0.01) bonds.push([a, b]);
    }
    return { atoms, bonds };
  })();
  const GRA_BOND = 1.1, GRA_GAP = GRA_BOND * 2.36;   // real ratio: 0.335 nm sheet spacing / 0.142 nm bond
  const graphite = (() => {
    const b = GRA_BOND, atoms = [], bonds = [];
    const centres = [[0, 0]];
    for (let k = 0; k < 6; k++) centres.push([Math.sqrt(3) * b * Math.cos(k * Math.PI / 3), Math.sqrt(3) * b * Math.sin(k * Math.PI / 3)]);
    centres.forEach(([cx, cz]) => {
      for (let k = 0; k < 6; k++) {
        const x = cx + b * Math.cos(Math.PI / 6 + k * Math.PI / 3), z = cz + b * Math.sin(Math.PI / 6 + k * Math.PI / 3);
        if (!atoms.some(a => Math.hypot(a[0] - x, a[1] - z) < 0.05)) atoms.push([x, z]);
      }
    });
    for (let i = 0; i < atoms.length; i++) for (let j = i + 1; j < atoms.length; j++) {
      if (Math.abs(Math.hypot(atoms[i][0] - atoms[j][0], atoms[i][1] - atoms[j][1]) - b) < 0.02) bonds.push([i, j]);
    }
    // three sheets, stacked A B A (every second sheet shifted by one bond length)
    const shift = [[0, 0], [b * Math.cos(5 * Math.PI / 6), b * Math.sin(5 * Math.PI / 6)], [0, 0]];
    return { atoms, bonds, shift, ySheets: [-GRA_GAP, 0, GRA_GAP] };
  })();
  const DG_INFO = {
    diamond: ['Diamond', '4 strong bonds on every carbon', 'Rigid in all directions: the hardest natural material.'],
    graphite: ['Graphite (pencil lead)', '3 bonds each, in flat sheets', 'Weak forces between sheets, so they slip apart.']
  };

  const dgFlat = (el, api) => {
    const row = '<div class="scene-slider-row" style="justify-content:center;gap:8px;padding:2px 6px"><button type="button" class="scene-btn" id="mmol-dg-diamond">Diamond</button><button type="button" class="scene-btn" id="mmol-dg-graphite">Graphite</button></div>';
    const svg = flatShell(el, row);
    const ctl = el.querySelector('.scene-slider-row');
    // one pool of projected atoms / bonds per form
    const forms = {};
    const build = (kind, atoms3, bonds, layerOf) => {
      const g = svgEl('g', {}, svg);
      const lines = bonds.map(([a, b]) => svgEl('line', { stroke: 'var(--t-muted)', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g));
      const circles = atoms3.map(() => svgEl('circle', { r: 6, fill: CARBON, stroke: 'var(--t-soft)', 'stroke-width': 1 }, g));
      forms[kind] = { g, lines, circles, atoms3, bonds, layerOf };
    };
    build('diamond', diamond.atoms.map(a => a.slice()), diamond.bonds);
    const gAtoms = [], gBonds = [], gLayer = [];
    for (let L = 0; L < 3; L++) {
      const off = gAtoms.length;
      graphite.atoms.forEach(a => { gAtoms.push([a[0] + graphite.shift[L][0], graphite.ySheets[L], a[1] + graphite.shift[L][1]]); gLayer.push(L); });
      graphite.bonds.forEach(([a, b]) => gBonds.push([a + off, b + off]));
    }
    build('graphite', gAtoms, gBonds, gLayer);
    const gInfo = svgEl('g', {}, svg);
    const tName = svgText(gInfo, 200, 18, 16, 700, 'var(--primary)', '', 'middle');
    const tSub = svgText(gInfo, 200, 36, 13, 700, 'var(--t-ink)', '', 'middle');
    const tWhy = svgText(svg, 200, 184, 12, 600, 'var(--t-muted)', '', 'middle');
    let mode = 'diamond';
    const pick = m => { mode = m; setBtnOn(ctl, 'mmol-dg-' + m); tName.textContent = DG_INFO[m][0]; tSub.textContent = DG_INFO[m][1]; tWhy.textContent = DG_INFO[m][2]; };
    ['diamond', 'graphite'].forEach(m => el.querySelector('#mmol-dg-' + m).addEventListener('click', () => pick(m)));
    pick('diamond');
    const proj = [];
    api.loop((t, dt) => {
      const yaw = t * 0.5, pit = 0.38, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
      Object.keys(forms).forEach(k => { forms[k].g.style.display = k === mode ? '' : 'none'; });
      const f = forms[mode], scale = mode === 'diamond' ? 21 : 14.5, slip = mode === 'graphite' ? 1.25 * Math.sin(t * 1.3) : 0;
      proj.length = 0;
      f.atoms3.forEach((a, i) => {
        let x = a[0] + (mode === 'graphite' && f.layerOf[i] === 2 ? slip : 0), y = a[1], z = a[2];
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        proj[i] = { x: 200 + x1 * scale, y: 108 - y2 * scale, z: z2 };
      });
      f.circles.forEach((c, i) => {
        const p = proj[i], d = 1 + p.z * 0.03;
        c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('r', (6.2 * d).toFixed(1));
        c.setAttribute('opacity', (0.75 + 0.25 * clamp01(0.5 + p.z * 0.12)).toFixed(2));
      });
      f.lines.forEach((l, i) => {
        const a = proj[f.bonds[i][0]], b = proj[f.bonds[i][1]];
        l.setAttribute('x1', a.x.toFixed(1)); l.setAttribute('y1', a.y.toFixed(1)); l.setAttribute('x2', b.x.toFixed(1)); l.setAttribute('y2', b.y.toFixed(1));
      });
    });
  };

  const dgScene3d = Chem3D.define({ distance: 12.5, pitch: 0.3, yaw: 0.5, autoRotate: 0.2, target: [0, 0, 0] }, (view, ctx) => {
    const bondMat = matOf(view, '#cbd5e1', { shininess: 40 }), atomMat = matOf(view, CARBON, { shininess: 60 });
    const weakMat = matOf(view, '#38bdf8', { opacity: 0.55, shininess: 20 });
    // diamond
    const dGroup = new THREE.Group(); view.scene.add(dGroup);
    const dA = diamond.atoms.map(a => V3(a[0], a[1], a[2]));
    dA.forEach(p => ball(view, dGroup, p, 0.34, atomMat));
    diamond.bonds.forEach(([a, b]) => stick(view, dGroup, dA[a], dA[b], 0.1, bondMat));
    // graphite: three sheets, the top one slides
    const gGroup = new THREE.Group(); view.scene.add(gGroup);
    const sheets = [0, 1, 2].map(L => {
      const g = new THREE.Group();
      g.position.y = graphite.ySheets[L];
      const pts = graphite.atoms.map(a => V3(a[0] + graphite.shift[L][0], 0, a[1] + graphite.shift[L][1]));
      pts.forEach(p => ball(view, g, p, 0.3, atomMat));
      graphite.bonds.forEach(([a, b]) => stick(view, g, pts[a], pts[b], 0.09, bondMat));
      if (L > 0) {   // faint rods: the weak forces that hold this sheet to the one below
        [0, 3, 6, 9, 12, 15, 18, 21].forEach(i => stick(view, g, pts[i], V3(pts[i].x, -GRA_GAP, pts[i].z), 0.028, weakMat));
      }
      gGroup.add(g);
      return g;
    });
    const weakLbl = view.label('weak forces', [3.9, -GRA_GAP / 2, 0], { size: 0.95, color: '#0369a1' });
    gGroup.add(weakLbl);
    gGroup.scale.setScalar(0.72); gGroup.position.y = -0.5; dGroup.scale.setScalar(1.12);
    const panel = overlay(view, '', 'left:8px;top:5px;max-width:42%;');
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;gap:8px;padding:2px 6px"><button type="button" class="scene-btn" id="mmol3-dg-diamond">Diamond</button><button type="button" class="scene-btn" id="mmol3-dg-graphite">Graphite</button></div>');
    let mode = 'diamond';
    function pick(m) {
      mode = m; setBtnOn(row, 'mmol3-dg-' + m);
      dGroup.visible = m === 'diamond'; gGroup.visible = m === 'graphite';
    }
    ['diamond', 'graphite'].forEach(m => row.querySelector('#mmol3-dg-' + m).addEventListener('click', () => pick(m)));
    pick('diamond');
    let lastHtml = '';
    view.run((t, dt) => {
      const i = DG_INFO[mode], html = `<div style="font-size:1.05rem;color:var(--primary)">${i[0]}</div><div>${i[1]}</div>` + (narrow(view) ? '' : `<div style="color:var(--t-orange,#c2410c)">${i[2]}</div>`);
      if (html !== lastHtml) { panel.innerHTML = html; lastHtml = html; }
      dGroup.rotation.y = t * 0.45; dGroup.rotation.x = 0.15 * Math.sin(t * 0.6);
      sheets[2].position.x = 1.25 * Math.sin(t * 1.3);
      gGroup.rotation.y = 0.3 * Math.sin(t * 0.4);
    });
  });

  const STEPS = [];
  STEPS.push(
    {
      kind: 'example',
      title: 'Real life: Diamond vs pencil lead',
      text: '<p>A diamond and the graphite in a pencil are both <b>pure carbon</b>! In diamond every atom bonds to <b>4</b> neighbours in all directions. In graphite each atom bonds to <b>3</b>, in flat sheets that slide. Pick one, and drag the picture to turn it.</p>',
      explain: '<p>Press <b>Diamond</b> or <b>Graphite</b>. Dark grey balls are carbon atoms and grey sticks are bonds. Diamond is a rigid 3D framework where each atom has four bonds. Graphite is three flat sheets of hexagons. The top sheet keeps sliding sideways because only weak forces, the thin <b>blue</b> rods, hold the sheets together.</p>',
      say: 'Look at the dark balls. Each one is a carbon atom, and the grey sticks are the bonds between them. This is diamond. Every carbon atom is joined to four neighbours, in all directions, like a strong three dimensional cage. That is why diamond is the hardest natural material. Now press Graphite. It is the same element, but the atoms now form flat sheets of hexagons. Each atom has only three strong bonds. Watch the top sheet slide sideways. Only weak forces hold the sheets together. When you write with a pencil, thin layers of graphite slide off onto the paper. Same atoms, different bonding, completely different material. You can drag the picture to turn it around.',
      mount: dgFlat,
      scene3d: dgScene3d
    }
  );


  // ====================================================================
  // 2. SALT CRYSTALS CRACK (interactive slider; also runs a demo by itself)
  // ====================================================================
  const SALT_LINES = [
    'Opposite charges face each other, so they attract and hold the crystal together.',
    'Sliding: like charges begin to line up above each other.',
    'Like charges now face each other and repel. The crystal cracks!'
  ];
  const SALT_SHORT = ['Ions attract', 'Sliding...', 'Like charges repel!'];
  const saltText = s => (s < 0.12 ? 0 : s < 0.85 ? 1 : 2);
  // Automatic demo: rest, push the top layers by one ion, stay cracked, reset.
  const saltAuto = t => { const c = t % 8; return c < 1 ? 0 : c < 4 ? ease((c - 1) / 3) : c < 7 ? 1 : 1 - ease(c - 7); };
  const SALT_ROW = pre => `<div class="scene-slider-row" style="padding:2px 10px"><span>Push</span><input type="range" id="${pre}-sl" min="0" max="100" step="1" value="0" aria-label="Push the top layers sideways"><button type="button" class="scene-btn" id="${pre}-auto" style="padding:2px 9px">Auto</button></div>`;

  const saltFlat = (el, api) => {
    const svg = flatShell(el, SALT_ROW('mmol-salt'));
    const SP = 36, X0 = 100, Y0 = 46, RC = 15, RN = 10;
    const bottom = svgEl('g', {}, svg), top = svgEl('g', {}, svg);
    const ions = [];
    for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) {
      const cl = (i + j) % 2 === 1, g = svgEl('g', {}, j < 2 ? top : bottom);
      const c = svgEl('circle', { r: cl ? RC : RN, fill: cl ? '#22c55e' : '#8b5cf6', stroke: 'var(--t-ink)', 'stroke-width': 1 }, g);
      svgText(g, 0, 5, 15, 800, '#fff', cl ? '−' : '+', 'middle');
      g.setAttribute('transform', `translate(${X0 + i * SP} ${Y0 + j * SP})`);
      ions.push({ g, c, cl, i, j, edge: j === 1 || j === 2 });
    }
    svgEl('line', { x1: 70, y1: Y0 + 1.5 * SP, x2: 330, y2: Y0 + 1.5 * SP, stroke: 'var(--t-muted)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, svg);
    svgText(svg, 200, 17, 14, 700, 'var(--t-ink)', 'Side view of a salt crystal', 'middle');
    svgText(svg, 350, 60, 12, 700, 'var(--t-muted)', 'top', 'middle');
    svgText(svg, 350, 148, 12, 700, 'var(--t-muted)', 'bottom', 'middle');
    const tSt = svgText(svg, 200, 186, 12.5, 700, 'var(--t-ink)', '', 'middle');
    const tBoom = svgText(svg, 350, Y0 + 1.5 * SP + 5, 15, 800, 'var(--t-red)', 'CRACK!', 'middle');
    const slider = el.querySelector('#mmol-salt-sl'), autoBtn = el.querySelector('#mmol-salt-auto');
    let auto = true, t0 = 0, lastT = 0;
    slider.addEventListener('input', () => { auto = false; setBtnOn(el.querySelector('.scene-slider-row'), ''); });
    autoBtn.addEventListener('click', () => { auto = true; t0 = lastT; });
    api.loop((t) => {
      lastT = t;
      if (auto) slider.value = Math.round(saltAuto(t - t0) * 100);
      const s = +slider.value / 100, lift = ease((s - 0.85) / 0.15), rep = ease((s - 0.55) / 0.3);
      top.setAttribute('transform', `translate(${(s * SP).toFixed(1)} ${(-9 * lift).toFixed(1)}) rotate(${(-2.5 * lift).toFixed(1)} 200 100)`);
      ions.forEach(n => {
        n.c.setAttribute('fill', n.edge && rep > 0.45 ? '#ef4444' : n.cl ? '#22c55e' : '#8b5cf6');
        const jx = 0.9 * Math.sin(t * 7 + n.i * 1.7 + n.j * 2.3), jy = 0.9 * Math.cos(t * 6 + n.i * 2.1 + n.j);
        n.g.setAttribute('transform', `translate(${(X0 + n.i * SP + jx).toFixed(1)} ${(Y0 + n.j * SP + jy).toFixed(1)})`);
      });
      tBoom.setAttribute('opacity', lift > 0.5 ? 1 : 0);
      tSt.textContent = SALT_LINES[saltText(s)];
      tSt.setAttribute('font-size', saltText(s) === 2 ? 12 : 12.5);
    });
  };

  const saltScene3d = Chem3D.define({ distance: 12.5, pitch: 0.38, yaw: 0.55, autoRotate: 0.15, target: [0, 0, 0] }, (view, ctx) => {
    const SP = 1.1, N = 4;
    const bottom = new THREE.Group(), top = new THREE.Group();
    view.scene.add(bottom, top);
    const normal = { na: matOf(view, view.color('Na')), cl: matOf(view, view.color('Cl')) };
    const hot = { na: matOf(view, '#f87171', { emissive: '#b91c1c' }), cl: matOf(view, '#ef4444', { emissive: '#991b1b' }) };
    const ions = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
      const cl = (i + j + k) % 2 === 1;
      const m = new THREE.Mesh(sphGeo(view), cl ? normal.cl : normal.na);
      const home = V3((i - 1.5) * SP, (j - 1.5) * SP, (k - 1.5) * SP);
      m.position.copy(home); m.scale.setScalar(cl ? 0.44 : 0.3);
      (j < 2 ? bottom : top).add(m);
      ions.push({ m, home, cl, edge: j === 1 || j === 2, ph: i * 1.3 + j * 2.1 + k * 0.7 });
    }
    // outline of each half of the crystal
    const box = new THREE.BoxGeometry(N * SP, 2 * SP, N * SP);
    const edgeMat = new THREE.LineBasicMaterial({ color: '#94a3b8', transparent: true, opacity: 0.8 });
    [bottom, top].forEach((g, idx) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(box), edgeMat); e.position.y = (idx ? 1 : -1) * SP; g.add(e); });
    const boom = view.label('CRACK!', [0, 0, 0], { size: 0.9, color: '#dc2626' });
    boom.position.set(0, 0.0, 3.2);
    const panel = overlay(view, '', 'left:8px;top:5px;max-width:38%;');
    const key = '<div style="font-size:0.68rem;font-weight:600"><i style="background:#8b5cf6"></i>Na⁺ <i style="background:#22c55e"></i>Cl⁻ <i style="background:#ef4444"></i>repelling</div>';
    const row = ctx.controls(SALT_ROW('mmol3-salt'));
    const slider = row.querySelector('#mmol3-salt-sl');
    let auto = true, t0 = 0, lastT = 0, lastHtml = '';
    slider.addEventListener('input', () => { auto = false; });
    row.querySelector('#mmol3-salt-auto').addEventListener('click', () => { auto = true; t0 = lastT; });
    view.run((t, dt) => {
      lastT = t;
      if (auto) slider.value = Math.round(saltAuto(t - t0) * 100);
      const s = +slider.value / 100, lift = ease((s - 0.85) / 0.15), rep = ease((s - 0.55) / 0.3);
      top.position.set(s * SP, 0.5 * lift, 0);
      top.rotation.z = -0.05 * lift;
      boom.visible = lift > 0.5;
      ions.forEach(n => {
        n.m.position.set(n.home.x + 0.02 * Math.sin(t * 7 + n.ph), n.home.y + 0.02 * Math.cos(t * 6 + n.ph), n.home.z + 0.02 * Math.sin(t * 5 + n.ph * 1.3));
        n.m.material = n.edge && rep > 0.45 ? (n.cl ? hot.cl : hot.na) : (n.cl ? normal.cl : normal.na);
      });
      const html = narrow(view) ? `<div style="font-size:0.95rem;color:var(--primary)">${SALT_SHORT[saltText(s)]}</div>` : `<div style="font-size:0.95rem;color:var(--primary)">Push the top layers</div><div>${SALT_LINES[saltText(s)]}</div>` + key;
      if (html !== lastHtml) { panel.innerHTML = html; lastHtml = html; panel.querySelectorAll('i').forEach(e => { e.style.cssText += ';display:inline-block;width:9px;height:9px;border-radius:50%;margin:0 3px 0 5px;vertical-align:middle;border:1px solid #475569'; }); }
    });
  });

  STEPS.push({
    kind: 'example',
    title: 'Real life: Why salt crystals crack',
    text: '<p>Tap a salt grain with a spoon and it <b>shatters</b> instead of bending. Salt is a lattice of Na<sup>+</sup> and Cl<sup>−</sup> ions. Slide a layer by one ion and <b>like charges</b> meet. Drag the slider!</p>',
    explain: '<p>Small <b>purple</b> Na<sup>+</sup> and larger <b>green</b> Cl<sup>−</sup> ions alternate like a 3D chessboard. Push the slider and the top two layers slide sideways. When the touching ions turn <b>red</b>, like charges face each other and repel, and the top half lifts away. <b>Auto</b> replays it.</p>',
    say: 'Look at the crystal. The small purple balls are sodium ions with a positive charge, and the bigger green balls are chloride ions with a negative charge. They alternate in every direction, like a three dimensional chessboard. Opposite charges attract, so the crystal is strong. Now drag the slider to push the top two layers sideways. After one ion of movement, the same charges sit right next to each other. Watch the touching ions turn red. Like charges repel, so the crystal splits apart. That is why a salt grain shatters when you tap it, instead of bending like a metal spoon.',
    mount: saltFlat,
    scene3d: saltScene3d
  });

  // ====================================================================
  // 3. THE OZONE LAYER (runs by itself): UV light splits O3, then it re-forms
  // ====================================================================
  const OZ_T = 6;                                    // seconds per cycle
  const OZ_HALF = 58.5 * Math.PI / 180;              // O3 bond angle is about 117 degrees
  // Pose of one ozone molecule (bond-length units, y up) at cycle phase ph (0..1).
  function ozonePose(ph) {
    const s = ph < 0.3 ? 0 : ph < 0.48 ? ease((ph - 0.3) / 0.18) : ph < 0.6 ? 1 : ph < 0.85 ? 1 - ease((ph - 0.6) / 0.25) : 0;
    let lx = -Math.sin(OZ_HALF), ly = -Math.cos(OZ_HALF);
    lx = mix(lx, -1, s); ly = mix(ly, 0, s);
    const ll = Math.hypot(lx, ly);
    return {
      s,
      L: [lx / ll, ly / ll],
      R: [Math.sin(OZ_HALF) + s * 1.5, -Math.cos(OZ_HALF) + s * 1.2],
      photon: ph < 0.3 ? ph / 0.3 : -1,
      flash: ph >= 0.3 && ph < 0.42 ? 1 - (ph - 0.3) / 0.12 : 0,
      heat: ph >= 0.3 && ph < 0.85 ? Math.sin(Math.PI * (ph - 0.3) / 0.55) : 0,
      bondR: clamp01(1 - s * 2.2),
      secL: 0.45 + 0.55 * s,
      secR: 0.45 * clamp01(1 - s * 2.2)
    };
  }
  const OZ_LINES = ['UV light hits ozone (O₃)', 'It splits into O₂ and a loose O atom, and the energy becomes heat', 'The O atom joins an O₂ again: ozone is back!'];
  const ozText = ph => (ph < 0.3 ? 0 : ph < 0.6 ? 1 : ph < 0.85 ? 2 : 0);
  const OZ_SITES = [{ x: -4.3, y: 0.3, z: 0.5, off: 0 }, { x: -0.7, y: -0.1, z: -0.6, off: 0.33 }, { x: 3.0, y: 0.3, z: 0.5, off: 0.66 }];

  const ozoneFlat = (el, api) => {
    const svg = flatShell(el);
    svgEl('rect', { x: 0, y: 66, width: 400, height: 52, fill: 'var(--t-blue)', opacity: 0.2 }, svg);
    svgEl('line', { x1: 0, y1: 66, x2: 400, y2: 66, stroke: 'var(--t-blue)', 'stroke-width': 1.5, opacity: 0.7 }, svg);
    svgEl('line', { x1: 0, y1: 118, x2: 400, y2: 118, stroke: 'var(--t-blue)', 'stroke-width': 1.5, opacity: 0.7 }, svg);
    svgText(svg, 6, 132, 12, 700, 'var(--t-blue)', 'Ozone layer', 'start');
    svgEl('rect', { x: 0, y: 160, width: 400, height: 30, fill: 'var(--t-green)', opacity: 0.55 }, svg);
    svgText(svg, 200, 180, 13, 700, 'var(--t-ink)', 'Earth: life is protected', 'middle');
    svgEl('circle', { cx: 368, cy: 24, r: 15, fill: 'var(--t-yellow)' }, svg);
    svgText(svg, 368, 52, 12, 700, 'var(--t-ink)', 'Sun', 'middle');
    const tCap = svgText(svg, 200, 152, 12, 700, 'var(--t-ink)', '', 'middle');
    svgText(svg, 60, 20, 12, 700, '#7c3aed', 'UV light', 'middle');
    const K = 15, sites = OZ_SITES.map((st, i) => {
      const cx = 200 + st.x * 30, cy = 96 + (-st.y) * 6;
      const g = svgEl('g', {}, svg);
      const halo = svgEl('circle', { cx: 0, cy: 0, r: 22, fill: 'var(--t-orange)', opacity: 0 }, g);
      const mk = () => svgEl('line', { stroke: 'var(--t-muted)', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      const bL = mk(), bR = mk(), b2L = mk(), b2R = mk();
      const atom = () => svgEl('circle', { r: 7.5, fill: '#dc2626', stroke: '#fff', 'stroke-width': 0.6 }, g);
      const aC = atom(), aL = atom(), aR = atom();
      const flash = svgEl('circle', { cx, cy, r: 8, fill: 'none', stroke: 'var(--t-yellow)', 'stroke-width': 3, opacity: 0 }, svg);
      const ph = svgEl('circle', { r: 5, fill: '#a855f7', stroke: '#fff', 'stroke-width': 1 }, svg);
      const tail = svgEl('line', { stroke: '#a855f7', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.6 }, svg);
      return { st, cx, cy, g, halo, bL, bR, b2L, b2R, aC, aL, aR, flash, ph, tail };
    });
    const ln = (l, x1, y1, x2, y2, op) => { l.setAttribute('x1', x1.toFixed(1)); l.setAttribute('y1', y1.toFixed(1)); l.setAttribute('x2', x2.toFixed(1)); l.setAttribute('y2', y2.toFixed(1)); l.setAttribute('opacity', op.toFixed(2)); };
    api.loop(t => {
      sites.forEach(S => {
        const ph = ((t / OZ_T) + S.st.off) % 1, P = ozonePose(ph);
        const ax = S.cx, ay = S.cy - 6;
        const lx = ax + P.L[0] * K, ly = ay - P.L[1] * K, rx = ax + P.R[0] * K, ry = ay - P.R[1] * K;
        S.aC.setAttribute('cx', ax); S.aC.setAttribute('cy', ay);
        S.aL.setAttribute('cx', lx.toFixed(1)); S.aL.setAttribute('cy', ly.toFixed(1));
        S.aR.setAttribute('cx', rx.toFixed(1)); S.aR.setAttribute('cy', ry.toFixed(1));
        ln(S.bL, ax, ay, lx, ly, 1); ln(S.bR, ax, ay, rx, ry, P.bondR);
        ln(S.b2L, ax, ay + 4, lx, ly + 4, P.secL); ln(S.b2R, ax, ay + 4, rx, ry + 4, P.secR);
        S.halo.setAttribute('cx', ax); S.halo.setAttribute('cy', ay); S.halo.setAttribute('opacity', (0.5 * P.heat).toFixed(2));
        if (P.photon >= 0) {
          const q = P.photon, sx = 368, sy = 30, px = mix(sx, S.cx, q), py = mix(sy, ay, q);
          S.ph.setAttribute('cx', px.toFixed(1)); S.ph.setAttribute('cy', py.toFixed(1)); S.ph.setAttribute('opacity', 1);
          ln(S.tail, px, py, mix(sx, S.cx, Math.max(0, q - 0.12)), mix(sy, ay, Math.max(0, q - 0.12)), 0.6);
        } else { S.ph.setAttribute('opacity', 0); S.tail.setAttribute('opacity', 0); }
        S.flash.setAttribute('cy', ay); S.flash.setAttribute('r', (8 + 22 * (1 - P.flash)).toFixed(1)); S.flash.setAttribute('opacity', P.flash.toFixed(2));
      });
      tCap.textContent = OZ_LINES[ozText(((t / OZ_T) + OZ_SITES[0].off) % 1)];
    });
  };

  const ozoneScene3d = Chem3D.define({ distance: 13.8, pitch: 0.14, yaw: 0.3, autoRotate: 0.0, target: [0, 0.1, 0] }, (view, ctx) => {
    const K = 1.15, slab = view.box(13.6, 2.6, 4.2, '#60a5fa', { opacity: 0.16, shininess: 20 });
    slab.position.y = 0;
    const slabEdges = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.7 }));
    slab.add(slabEdges);
    view.label('Ozone layer', [-4.8, -1.75, 2.3], { size: 0.95, color: '#0369a1' });
    const ground = view.box(13.6, 0.3, 3, '#22c55e', { shininess: 10 }); ground.position.y = -3.6;
    view.label('Earth', [0, -3.0, 2.4], { size: 0.95, color: '#15803d' });
    const sun = view.sphere(0.85, '#facc15', { emissive: '#f59e0b' }); sun.position.set(5.4, 3.4, -0.5);
    view.label('Sun', [5.4, 2.3, -0.5], { size: 0.9, color: '#92400e' });
    view.label('UV light', [1.4, 3.5, 1], { size: 0.95, color: '#7c3aed' });
    const oMat = () => view.mat(view.color('O'), { shininess: 70 }), stMat = () => view.mat('#cbd5e1', { shininess: 40 });
    const sites = OZ_SITES.map(st => {
      const g = new THREE.Group(); g.position.set(st.x, st.y, st.z); g.rotation.y = 0.2; view.scene.add(g);
      const at = () => { const m = new THREE.Mesh(sphGeo(view), oMat()); m.scale.setScalar(0.42); g.add(m); return m; };
      const sticks = ['bL', 'bR', 'b2L', 'b2R'].map(() => { const m = new THREE.Mesh(cylGeo(view), view.mat('#cbd5e1', { opacity: 0.999, shininess: 40 })); g.add(m); return m; });
      const halo = new THREE.Mesh(sphGeo(view), view.mat('#fb923c', { opacity: 0.3, shininess: 10 })); halo.scale.setScalar(1.15); g.add(halo);
      const ph = new THREE.Mesh(sphGeo(view), view.mat('#a855f7', { emissive: '#7e22ce' })); ph.scale.setScalar(0.24); view.scene.add(ph);
      const tail = new THREE.Mesh(sphGeo(view), view.mat('#c084fc', { opacity: 0.6, emissive: '#7e22ce' })); tail.scale.setScalar(0.15); view.scene.add(tail);
      const flash = new THREE.Mesh(sphGeo(view), view.mat('#fde047', { opacity: 0.5, emissive: '#facc15' })); view.scene.add(flash);
      return { st, g, aC: at(), aL: at(), aR: at(), sticks, halo, ph, tail, flash };
    });
    const panel = overlay(view, '', 'left:8px;top:5px;max-width:40%;');
    let lastTxt = '';
    const A = V3(0, 0, 0), B = V3(0, 0, 0);
    const setStick = (m, a, b, dz, op) => { A.set(a[0], a[1], dz); B.set(b[0], b[1], dz); placeStick(m, A, B, 0.075); m.material.opacity = Math.max(0.001, op); m.visible = op > 0.02; };
    view.run(t => {
      sites.forEach(S => {
        const ph = ((t / OZ_T) + S.st.off) % 1, P = ozonePose(ph);
        const c = [0, 0], l = [P.L[0] * K, P.L[1] * K], r = [P.R[0] * K, P.R[1] * K];
        S.aC.position.set(0, 0, 0); S.aL.position.set(l[0], l[1], 0); S.aR.position.set(r[0], r[1], 0);
        setStick(S.sticks[0], c, l, -0.1, 1); setStick(S.sticks[1], c, r, -0.1, P.bondR);
        setStick(S.sticks[2], c, l, 0.1, P.secL); setStick(S.sticks[3], c, r, 0.1, P.secR);
        S.halo.visible = P.heat > 0.03; S.halo.material.opacity = 0.32 * P.heat;
        S.halo.position.set(l[0] / 2, l[1] / 2, 0);
        S.aC.material.emissive.setRGB(0.5 * P.heat, 0.2 * P.heat, 0); S.aL.material.emissive.setRGB(0.5 * P.heat, 0.2 * P.heat, 0);
        if (P.photon >= 0) {
          const q = P.photon, sx = 5.4, sy = 3.4;
          S.ph.visible = true; S.tail.visible = true;
          S.ph.position.set(mix(sx, S.st.x, q), mix(sy, S.st.y, q), S.st.z);
          const q2 = Math.max(0, q - 0.1);
          S.tail.position.set(mix(sx, S.st.x, q2), mix(sy, S.st.y, q2), S.st.z);
        } else { S.ph.visible = false; S.tail.visible = false; }
        S.flash.visible = P.flash > 0.02; S.flash.position.set(S.st.x, S.st.y, S.st.z);
        S.flash.scale.setScalar(0.6 + 1.6 * (1 - P.flash)); S.flash.material.opacity = 0.5 * P.flash;
      });
      const txt = OZ_LINES[ozText(((t / OZ_T) + OZ_SITES[0].off) % 1)];
      const nw = narrow(view), key = txt + nw;
      if (key !== lastTxt) { lastTxt = key; panel.innerHTML = `<div style="font-size:0.95rem;color:var(--primary)">Ozone shield</div>` + (nw ? '' : `<div>${txt}</div>`); }
    });
  });

  STEPS.push({
    kind: 'example',
    title: 'Real life: The ozone layer',
    text: '<p>High above us, a thin layer of <b>ozone</b> (O<sub>3</sub>, three oxygen atoms) absorbs harmful UV light from the Sun. UV splits ozone, then the pieces join up again, so the shield keeps working.</p>',
    explain: '<p>Three <b>red</b> ozone molecules, bent groups of three atoms, sit inside the blue <b>ozone layer</b>. A <b>violet</b> UV light particle streams down from the Sun and hits one. It splits into O<sub>2</sub> and a loose O atom, glowing orange with <b>heat</b>, then the atom rejoins and the bent molecule re-forms.</p>',
    say: 'Look at the blue band. This is the ozone layer, high in the sky. Each bent molecule in it is ozone, made of three oxygen atoms. Now watch a violet particle of ultraviolet light come down from the Sun. When it hits ozone, the light energy is absorbed. The ozone splits into an ordinary oxygen molecule and one loose oxygen atom. The energy ends up as a little heat, shown by the orange glow. Then the loose atom joins the oxygen molecule again, and ozone is back, ready to absorb more. This cycle keeps most harmful ultraviolet light away from the ground. Some still gets through, which is why we wear sunscreen.',
    mount: ozoneFlat,
    scene3d: ozoneScene3d
  });

  // ====================================================================
  // 4. FIZZY DRINK (interactive: open the cap, change the temperature)
  // ====================================================================
  const FZ = { RB: 1.3, LEVEL: 3.0, TOP: 3.7, NECK: 5.6, N: 17, ND: 14 };
  // Shared simulation. Each dissolved CO2 molecule (D) may become a bubble (B) that rises, then either stays as gas
  // in the space under the cap (G) or, with the cap off, escapes (X). Positions are in bottle units, y up.
  function fizzCreate() {
    const rnd = seeded(5), ms = [];
    for (let i = 0; i < FZ.N; i++) ms.push({ st: 'D', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, k: 1, ph: i * 1.7, sp: 0.6 + rnd() * 1.2 });
    const sim = { ms, open: false, T: 5, acc: 0.5, capOpen: 0 };
    const put = (m, lo, hi, rad) => {
      const a = rnd() * 6.283, r = Math.sqrt(rnd()) * rad;
      m.x = r * Math.cos(a); m.z = r * Math.sin(a); m.y = lo + rnd() * (hi - lo);
      m.vx = (rnd() - 0.5) * 0.6; m.vy = (rnd() - 0.5) * 0.6; m.vz = (rnd() - 0.5) * 0.6;
    };
    const inLiq = m => put(m, 0.3, FZ.LEVEL - 0.3, FZ.RB - 0.4), inGas = m => put(m, FZ.LEVEL + 0.25, FZ.TOP - 0.2, FZ.RB - 0.4);
    const wander = (m, dt, sp, lo, hi, rad) => {
      m.vx += (rnd() - 0.5) * 9 * dt; m.vy += (rnd() - 0.5) * 9 * dt; m.vz += (rnd() - 0.5) * 9 * dt;
      const v = Math.hypot(m.vx, m.vy, m.vz); if (v > sp) { m.vx *= sp / v; m.vy *= sp / v; m.vz *= sp / v; }
      m.x += m.vx * dt; m.y += m.vy * dt; m.z += m.vz * dt;
      const rr = Math.hypot(m.x, m.z);
      if (rr > rad) { const nx = m.x / rr, nz = m.z / rr, vr = m.vx * nx + m.vz * nz; m.x = nx * rad; m.z = nz * rad; if (vr > 0) { m.vx -= 2 * vr * nx; m.vz -= 2 * vr * nz; } }
      if (m.y < lo) { m.y = lo; m.vy = Math.abs(m.vy); } else if (m.y > hi) { m.y = hi; m.vy = -Math.abs(m.vy); }
    };
    sim.reset = () => {
      ms.forEach((m, i) => { m.st = i < FZ.ND ? 'D' : 'G'; m.k = 1; (m.st === 'D' ? inLiq : inGas)(m); });
      sim.open = false; sim.capOpen = 0; sim.acc = 0.5;
    };
    sim.setOpen = v => { sim.open = v; if (v) ms.forEach(m => { if (m.st === 'G') { m.st = 'X'; m.vy = 0.6 + rnd(); } }); };
    sim.left = () => Math.round(100 * ms.filter(m => m.st !== 'X' && m.st !== 'gone').length / FZ.N);
    const count = st => ms.filter(m => m.st === st).length, pick = st => { const a = ms.filter(m => m.st === st); return a.length ? a[Math.floor(rnd() * a.length)] : null; };
    sim.step = dt => {
      dt = Math.min(dt, 0.05);
      const warm = clamp01((sim.T - 4) / 26), rate = sim.open ? 0.1 + 0.34 * warm : 0, gT = sim.open ? 0 : 2 + Math.round(3 * warm);
      sim.capOpen += ((sim.open ? 1 : 0) - sim.capOpen) * Math.min(1, dt * 5);
      sim.acc -= dt;
      if (!sim.open && sim.acc <= 0) {          // capped: CO2 keeps swapping between the drink and the gas above it
        sim.acc = 1.1;
        const g = count('G');
        if (g < gT) { const m = pick('D'); if (m) { m.st = 'B'; m.vy = 1.2; } }
        else if (g > gT) { const m = pick('G'); if (m) m.st = 'S'; }
      }
      ms.forEach(m => {
        const tk = m.st === 'S' || m.st === 'gone' || (m.st === 'X' && m.y > FZ.NECK + 0.3) ? 0 : 1;
        m.k += (tk - m.k) * Math.min(1, dt * 6);
        if (m.st === 'D') {
          wander(m, dt, 0.7, 0.3, FZ.LEVEL - 0.3, FZ.RB - 0.4);
          if (rate && rnd() < rate * dt) { m.st = 'B'; m.vy = 1.0 + 1.0 * warm; }
        } else if (m.st === 'B') {
          m.vy = 1.0 + 1.0 * warm; m.y += m.vy * dt;
          m.x += 0.35 * Math.sin(m.ph + m.y * 3) * dt; m.z += 0.35 * Math.cos(m.ph + m.y * 2) * dt;
          if (m.y > FZ.LEVEL - 0.1) {
            if (sim.open) { m.st = 'X'; m.vy = 1.4; } else { m.st = 'G'; m.y = FZ.LEVEL + 0.3; m.vx = (rnd() - 0.5) * 0.6; m.vz = (rnd() - 0.5) * 0.6; m.vy = 0.3; }
          }
        } else if (m.st === 'G') {
          wander(m, dt, 1.6, FZ.LEVEL + 0.25, FZ.TOP - 0.2, FZ.RB - 0.4);
        } else if (m.st === 'X') {
          m.vy = 1.3; m.y += m.vy * dt;
          if (m.y > FZ.TOP - 0.3) { const f = Math.min(1, dt * 4); m.x -= m.x * f; m.z -= m.z * f; }
          if (m.y > FZ.NECK + 1.0) { m.st = 'gone'; m.k = 0; }
        } else if (m.st === 'S') {
          if (m.k < 0.05) { m.st = 'D'; inLiq(m); m.k = 0.05; }
        }
      });
    };
    sim.reset();
    return sim;
  }
  const FZ_HEAD = [['Cap on: CO₂ is squeezed', 'into the drink.'], ['Cap off: pressure drops', 'and CO₂ escapes.']];
  const fzTemp = T => (T < 12 ? 'Cold: keeps its fizz longer.' : T < 22 ? 'Cool: fizz fades steadily.' : 'Warm: goes flat fast!');
  const FZ_ROW = pre => `<div class="scene-slider-row" style="padding:2px 8px;gap:6px"><button type="button" class="scene-btn" id="${pre}-cap" style="padding:3px 8px">Open cap</button><button type="button" class="scene-btn" id="${pre}-reset" style="padding:3px 8px" aria-label="Restart">↻</button><span>Temp</span><input type="range" id="${pre}-t" min="4" max="30" step="1" value="5" aria-label="Drink temperature"><span id="${pre}-tv" style="min-width:40px;text-align:right">5 °C</span></div>`;
  function fizzControls(row, pre, sim) {
    const capBtn = row.querySelector('#' + pre + '-cap'), sl = row.querySelector('#' + pre + '-t'), tv = row.querySelector('#' + pre + '-tv');
    capBtn.addEventListener('click', () => { sim.setOpen(!sim.open); capBtn.textContent = sim.open ? 'Close cap' : 'Open cap'; });
    row.querySelector('#' + pre + '-reset').addEventListener('click', () => { sim.reset(); capBtn.textContent = 'Open cap'; });
    const upd = () => { sim.T = +sl.value; tv.textContent = sl.value + ' °C'; };
    sl.addEventListener('input', upd); upd();
  }

  const fizzFlat = (el, api) => {
    const svg = flatShell(el, FZ_ROW('mmol-fz'));
    const sim = fizzCreate(), CX = 292, BY = 176, K = 26;
    const px = x => CX + x * K, py = y => BY - y * K;
    const prof = [[1.35, 0], [1.35, 3.7], [0.95, 4.2], [0.5, 4.9], [0.5, 5.6]];
    const side = sg => prof.map((p, i) => (i ? 'L' : 'M') + px(sg * p[0]).toFixed(1) + ' ' + py(p[1]).toFixed(1)).join(' ');
    svgEl('rect', { x: px(-1.31), y: py(FZ.LEVEL), width: 2.62 * K, height: FZ.LEVEL * K, fill: '#f59e0b', opacity: 0.3 }, svg);
    svgEl('line', { x1: px(-1.31), y1: py(FZ.LEVEL), x2: px(1.31), y2: py(FZ.LEVEL), stroke: '#f59e0b', 'stroke-width': 2 }, svg);
    svgEl('path', { d: side(-1) + ' M' + px(-1.35) + ' ' + py(0) + ' L' + px(1.35) + ' ' + py(0) + ' ' + side(1), fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, svg);
    const cap = svgEl('rect', { x: px(-0.62), y: py(5.85), width: 1.24 * K, height: 0.3 * K, rx: 2, fill: 'var(--t-red)' }, svg);
    const mols = sim.ms.map(m => {
      const g = svgEl('g', {}, svg);
      const bub = svgEl('circle', { r: 10, fill: 'none', stroke: 'var(--t-blue)', 'stroke-width': 1.5, opacity: 0 }, g);
      [-1, 1].forEach(sg => { svgEl('line', { x1: 0, y1: 0, x2: sg * 9, y2: 0, stroke: 'var(--t-muted)', 'stroke-width': 2.5 }, g); svgEl('circle', { cx: sg * 9, r: 4.4, fill: '#dc2626' }, g); });
      svgEl('circle', { r: 4.8, fill: CARBON, stroke: '#e5e7eb', 'stroke-width': 0.6 }, g);
      return { g, bub };
    });
    svgText(svg, 12, 20, 15, 700, 'var(--primary)', 'Fizzy drink', 'start');
    const tCap = svgText(svg, 12, 42, 12, 700, 'var(--t-ink)', '', 'start'), tCap2 = svgText(svg, 12, 58, 12, 700, 'var(--t-ink)', '', 'start');
    const tLeft = svgText(svg, 12, 92, 22, 800, 'var(--t-orange)', '', 'start');
    svgText(svg, 12, 108, 12, 700, 'var(--t-muted)', 'CO₂ still in the bottle', 'start');
    const tTemp = svgText(svg, 12, 132, 12, 700, 'var(--t-ink)', '', 'start');
    svgText(svg, 12, 164, 12, 700, 'var(--t-muted)', 'CO₂ = grey carbon between', 'start');
    svgText(svg, 12, 179, 12, 700, 'var(--t-muted)', 'two red oxygen atoms', 'start');
    fizzControls(el.querySelector('.scene-slider-row'), 'mmol-fz', sim);
    api.loop((t, dt) => {
      sim.step(dt);
      const o = sim.capOpen;
      cap.setAttribute('transform', `translate(${(o * 14).toFixed(1)} ${(-o * 12).toFixed(1)}) rotate(${(o * 35).toFixed(0)} ${px(0)} ${py(5.7)})`);
      sim.ms.forEach((m, i) => {
        const M = mols[i], vis = m.k > 0.03;
        M.g.style.display = vis ? '' : 'none';
        if (!vis) return;
        M.g.setAttribute('transform', `translate(${px(m.x).toFixed(1)} ${py(m.y).toFixed(1)}) rotate(${((t * m.sp + m.ph) * 57.3 % 360).toFixed(0)}) scale(${(0.9 * m.k).toFixed(2)})`);
        M.bub.setAttribute('opacity', m.st === 'B' ? 0.9 : 0);
      });
      const hd = FZ_HEAD[sim.open ? 1 : 0];
      tCap.textContent = hd[0]; tCap2.textContent = hd[1];
      tLeft.textContent = 'Fizz left: ' + sim.left() + '%';
      tTemp.textContent = sim.T + ' °C. ' + fzTemp(sim.T);
    });
  };

  const fizzScene3d = Chem3D.define({ distance: 12.5, pitch: 0.16, yaw: 0.4, autoRotate: 0.12, target: [0, 3.2, 0] }, (view, ctx) => {
    const sim = fizzCreate();
    const pts = [[0.001, 0], [1.35, 0], [1.35, 3.7], [0.95, 4.2], [0.5, 4.9], [0.5, 5.6]].map(p => V3(p[0], p[1], 0));
    const glassGeo = new THREE.LatheGeometry(pts, 40);
    const glass = new THREE.Mesh(glassGeo, view.mat('#dbeafe', { opacity: 0.2, doubleSide: true, shininess: 120, specular: '#ffffff' }));
    view.scene.add(glass);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(FZ.RB, FZ.RB, FZ.LEVEL, 32), view.mat('#f59e0b', { opacity: 0.36, shininess: 80 }));
    liq.position.y = FZ.LEVEL / 2 + 0.01; view.scene.add(liq);
    const capG = new THREE.Group(); view.scene.add(capG);
    const capM = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.32, 24), view.mat('#dc2626', { shininess: 60 }));
    capG.add(capM);
    const carb = matOf(view, view.color('C')), oxy = matOf(view, view.color('O')), stMat = matOf(view, '#cbd5e1', { shininess: 40 });
    const bubMat = matOf(view, '#e0f2fe', { opacity: 0.35, shininess: 100 });
    const mols = sim.ms.map(() => {
      const g = new THREE.Group(); view.scene.add(g);
      ball(view, g, V3(0, 0, 0), 0.34, carb); ball(view, g, V3(-0.95, 0, 0), 0.3, oxy); ball(view, g, V3(0.95, 0, 0), 0.3, oxy);
      [-1, 1].forEach(sg => [-0.07, 0.07].forEach(dy => stick(view, g, V3(0, dy, 0), V3(sg * 0.95, dy, 0), 0.055, stMat)));
      const bub = new THREE.Mesh(sphGeo(view), bubMat); bub.scale.setScalar(1.25); g.add(bub);
      return { g, bub };
    });
    const panel = overlay(view, '', 'left:8px;top:5px;max-width:40%;');
    const row = ctx.controls(FZ_ROW('mmol3-fz'));
    fizzControls(row, 'mmol3-fz', sim);
    let lastHtml = '';
    view.run((t, dt) => {
      sim.step(dt);
      const o = sim.capOpen;
      capG.position.set(o * 0.9, 5.75 + o * 0.5, 0); capG.rotation.z = -o * 0.6;
      sim.ms.forEach((m, i) => {
        const M = mols[i], vis = m.k > 0.03;
        M.g.visible = vis;
        if (!vis) return;
        M.g.position.set(m.x, m.y, m.z);
        M.g.rotation.set(t * m.sp + m.ph, t * m.sp * 0.7, m.ph);
        M.g.scale.setScalar(0.5 * m.k);
        M.bub.visible = m.st === 'B';
      });
      const nw = narrow(view), html = `<div style="font-size:0.95rem;color:var(--primary)">Fizzy drink</div><div>${nw ? (sim.open ? 'Cap off' : 'Cap on') : FZ_HEAD[sim.open ? 1 : 0].join(' ')}</div>` +
        `<div style="font-size:1.05rem;color:var(--t-orange,#c2410c)">Fizz left: ${sim.left()}%</div>` + (nw ? '' : `<div style="font-weight:600">${sim.T} °C. ${fzTemp(sim.T)}</div>`);
      if (html !== lastHtml) { panel.innerHTML = html; lastHtml = html; }
    });
  });

  STEPS.push({
    kind: 'example',
    title: 'Real life: Fizz in a drink',
    text: '<p>Fizzy drinks hold <b>carbon dioxide</b> (CO<sub>2</sub>), a straight molecule, squeezed in under pressure. Open the cap and the gas comes out as bubbles. <b>Warm</b> drinks lose it faster. Try it!</p>',
    explain: '<p>A glass bottle holds an amber drink. Each small <b>CO<sub>2</sub></b> molecule is a grey carbon between two red oxygens. Press <b>Open cap</b>: bubbles rise and molecules escape upward, and <b>Fizz left</b> drops. Slide <b>Temp</b> to make it faster or slower. The arrow button restarts.</p>',
    say: 'Look inside the bottle. Each small molecule is carbon dioxide, a straight line with a grey carbon atom between two red oxygen atoms. While the cap is on, the gas is squeezed into the drink, and a few molecules drift in the space above. Now press Open cap. The pressure drops, and carbon dioxide leaves the drink as bubbles that rise and escape through the neck. Watch the fizz left number fall. Now slide the temperature up and open the cap again. In a warm drink, the gas escapes faster, so the drink goes flat sooner. That is why cold soda tastes fizzier. Press the arrow button to start again.',
    mount: fizzFlat,
    scene3d: fizzScene3d
  });

  // ====================================================================
  // 5. SOAP AND SURFACE TENSION (interactive slider; also runs a demo by itself)
  // ====================================================================
  const soapAuto = t => { const c = t % 12; return c < 3 ? 0 : c < 6 ? ease((c - 3) / 3) : c < 10 ? 1 : 0; };
  const soapPull = q => Math.round(100 * (1 - 0.62 * q));   // relative surface pull (soapy water is roughly 40% of pure water)
  function soapCreate() {
    const st = { sink: 0, pop: 1, sinkT: 0, dimple: 1, pull: 100 };
    st.update = (q, dt) => {
      dt = Math.min(dt, 0.05);
      if (q > 0.6) st.sinkT = 1;
      if (q < 0.05) { if (st.sink > 0.02) { st.sink = 0; st.pop = 0; } st.sinkT = 0; }
      st.sink += (st.sinkT - st.sink) * Math.min(1, dt * 1.6);
      st.pop = Math.min(1, st.pop + dt * 2.5);
      st.dimple = (1 - 0.6 * q) * (1 - clamp01(st.sink * 3));
      st.pull = soapPull(q);
      return st;
    };
    return st;
  }
  const soapNote = (q, st) => (q < 0.05 ? 'Surface molecules are pulled sideways and inward, like a stretchy skin.'
    : st.sink > 0.5 ? 'The skin is too weak to hold the clip. It sinks!' : 'Soap molecules crowd the surface and weaken the pull.');
  const SOAP_ROW = pre => `<div class="scene-slider-row" style="padding:2px 8px;gap:6px"><span>Soap</span><input type="range" id="${pre}-sl" min="0" max="100" step="1" value="0" aria-label="Amount of soap"><span id="${pre}-v" style="min-width:34px;text-align:right">0%</span><button type="button" class="scene-btn" id="${pre}-auto" style="padding:2px 9px">Auto</button></div>`;
  function soapControls(row, pre) {
    const sl = row.querySelector('#' + pre + '-sl'), v = row.querySelector('#' + pre + '-v');
    const ctl = { auto: true, t0: 0, last: 0, q: 0 };
    sl.addEventListener('input', () => { ctl.auto = false; });
    row.querySelector('#' + pre + '-auto').addEventListener('click', () => { ctl.auto = true; ctl.t0 = ctl.last; });
    ctl.tick = t => { ctl.last = t; if (ctl.auto) sl.value = Math.round(soapAuto(t - ctl.t0) * 100); ctl.q = +sl.value / 100; v.textContent = sl.value + '%'; return ctl.q; };
    return ctl;
  }

  const soapFlat = (el, api) => {
    const svg = flatShell(el, SOAP_ROW('mmol-sp'));
    const X0 = 22, X1 = 246, TOP = 66, BOT = 176, CX = 134;
    svgEl('defs', {}, svg).innerHTML = TutorialKit.arrowMarker('mmol-sp-ar', '#0d9488') + TutorialKit.arrowMarker('mmol-sp-net', '#f97316');
    svgEl('rect', { x: X0, y: TOP, width: X1 - X0, height: BOT - TOP, fill: 'var(--t-blue)', opacity: 0.22 }, svg);
    // water molecules on a jiggling grid
    const homes = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) homes.push({ x: X0 + 16 + c * 25 + (r % 2 ? 12 : 0), y: TOP + 14 + r * 22 });
    const mols = homes.map((h, i) => {
      const g = svgEl('g', {}, svg);
      [-1, 1].forEach(sg => svgEl('circle', { cx: sg * 6, cy: 4.5, r: 3.4, fill: '#e2e8f0', stroke: 'var(--t-muted)', 'stroke-width': 0.6 }, g));
      svgEl('circle', { r: 5.4, fill: '#dc2626' }, g);
      return { g, h, ph: i * 1.9 };
    });
    // highlighted molecules: one deep (balanced pulls) and one at the surface (net pull inward)
    const bulk = homes[2 * 9 + 2 + 0], surf = homes[6];
    const arrow = (x, y, dx, dy, mk, col) => svgEl('line', { x1: x, y1: y, x2: x + dx, y2: y + dy, stroke: col, 'stroke-width': 2, 'marker-end': `url(#${mk})` }, svg);
    svgEl('circle', { cx: bulk.x, cy: bulk.y, r: 12, fill: 'none', stroke: 'var(--t-yellow)', 'stroke-width': 2 }, svg);
    svgEl('circle', { cx: surf.x, cy: surf.y, r: 12, fill: 'none', stroke: 'var(--t-yellow)', 'stroke-width': 2 }, svg);
    [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, -0.7]].forEach(d => arrow(bulk.x + d[0] * 13, bulk.y + d[1] * 13, d[0] * 12, d[1] * 12, 'mmol-sp-ar', '#0d9488'));
    [[1, 0], [-1, 0], [0, 1], [0.7, 0.7], [-0.7, 0.7]].forEach(d => arrow(surf.x + d[0] * 13, surf.y + d[1] * 13, d[0] * 12, d[1] * 12, 'mmol-sp-ar', '#0d9488'));
    arrow(surf.x + 30, surf.y - 2, 0, 22, 'mmol-sp-net', '#f97316');
    haloText(svgText(svg, bulk.x, bulk.y + 34, 12, 700, 'var(--t-ink)', 'balanced', 'middle'));
    haloText(svgText(svg, surf.x + 30, surf.y + 38, 12, 700, 'var(--t-orange)', 'net pull', 'middle'));
    // surface line with a dimple, and the paper clip (cross-section: three wires)
    const surfLine = svgEl('path', { fill: 'none', stroke: 'var(--t-blue)', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
    const clip = svgEl('g', {}, svg);
    [-15, 0, 15].forEach(x => svgEl('circle', { cx: x, cy: 0, r: 3.6, fill: '#cbd5e1', stroke: 'var(--t-ink)', 'stroke-width': 1.2 }, clip));
    svgEl('path', { d: 'M22 ' + (TOP - 12) + ' L22 ' + (BOT + 6) + ' L246 ' + (BOT + 6) + ' L246 ' + (TOP - 12), fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
    svgText(svg, CX, TOP - 20, 12, 700, 'var(--t-ink)', 'paper clip', 'middle');
    // soap molecules: orange head in the water, tail sticking up
    const soap = [40, 66, 96, 176, 204, 228, 52, 216].map((x, i) => {
      const g = svgEl('g', {}, svg);
      svgEl('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: 'var(--t-muted)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
      svgEl('circle', { cx: 0, cy: 3, r: 4.3, fill: '#f97316' }, g);
      return { g, x, i };
    });
    svgText(svg, 262, 30, 12, 700, 'var(--t-muted)', 'Surface pull', 'start');
    const tPull = svgText(svg, 262, 56, 24, 800, 'var(--primary)', '', 'start');
    const lines = [0, 1, 2, 3, 4].map(i => svgText(svg, 262, 82 + i * 16, 12, 600, 'var(--t-ink)', '', 'start'));
    svgText(svg, 262, 178, 12, 700, 'var(--t-orange)', '● soap head', 'start');
    const ctl = soapControls(el.querySelector('.scene-slider-row'), 'mmol-sp'), sim = soapCreate();
    const WRAP = ['Water pulls on', 'itself. At the top', 'the pull is only', 'sideways and in:', 'a stretchy skin.'], WRAP2 = ['Soap crowds the', 'surface and cuts', 'the pull. The skin', 'cannot hold the', 'clip: it sinks.'];
    api.loop((t, dt) => {
      const q = ctl.tick(t), st = sim.update(q, dt), dep = 6 * st.dimple;
      mols.forEach(m => m.g.setAttribute('transform', `translate(${(m.h.x + 2.5 * Math.sin(t * 2.3 + m.ph)).toFixed(1)} ${(m.h.y + 2.5 * Math.cos(t * 2.0 + m.ph * 1.3)).toFixed(1)}) rotate(${(20 * Math.sin(t * 1.2 + m.ph)).toFixed(0)})`));
      let d = '';
      for (let x = X0; x <= X1; x += 4) d += (x === X0 ? 'M' : 'L') + x + ' ' + (TOP + dep * Math.exp(-Math.pow((x - CX) / 26, 2))).toFixed(1) + ' ';
      surfLine.setAttribute('d', d);
      const cyf = TOP + dep - 5 + (BOT - 8 - (TOP + dep - 5)) * (st.sink * st.sink);
      clip.setAttribute('transform', `translate(${(CX + 6 * st.sink * Math.sin(t * 3)).toFixed(1)} ${cyf.toFixed(1)}) scale(${st.pop.toFixed(2)})`);
      const n = Math.ceil(q * 8 - 0.001);
      soap.forEach(sp => { const on = sp.i < n; sp.g.style.display = on ? '' : 'none'; sp.g.setAttribute('transform', `translate(${sp.x} ${TOP + 1 + 1.5 * Math.sin(t * 2 + sp.i)})`); });
      tPull.textContent = st.pull + '%';
      const w = q < 0.05 ? WRAP : WRAP2;
      lines.forEach((l, i) => { l.textContent = w[i]; });
    });
  };

  const soapScene3d = Chem3D.define({ distance: 9.6, pitch: 0.55, yaw: 0.35, autoRotate: 0.1, target: [0, 2.5, 0] }, (view, ctx) => {
    const BR = 2.3, BH = 4.4, LEVEL = 0.85, RL = 1.95, NW = 18, top = BH * 0.96 * LEVEL;
    view.beaker(BR, BH, { level: LEVEL, liquidColor: '#93c5fd', liquidOpacity: 0.22 });
    const rnd = seeded(23);
    const mO = matOf(view, view.color('O')), mH = matOf(view, '#f1f5f9');
    const hA = V3(Math.sin(52.25 * Math.PI / 180), -Math.cos(52.25 * Math.PI / 180), 0), hB = V3(-hA.x, hA.y, 0);
    const water = k => {
      const g = new THREE.Group(); view.scene.add(g);
      ball(view, g, V3(0, 0, 0), 0.27 * k, mO); ball(view, g, hA.clone().multiplyScalar(0.4 * k), 0.16 * k, mH); ball(view, g, hB.clone().multiplyScalar(0.4 * k), 0.16 * k, mH);
      return g;
    };
    const waters = [];
    for (let i = 0; i < NW; i++) {
      const g = water(1);
      const pos = V3((rnd() - 0.5) * 4, 0.4 + rnd() * (top - 1.2), (rnd() - 0.5) * 4);
      waters.push({ g, pos, vel: V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.2), spin: 1 + rnd() * 2, ax: rnd() * 6, ay: rnd() * 6 });
    }
    // surface skin: a disc whose middle is pressed down by the clip
    const skinGeo = new THREE.RingGeometry(0.0001, RL * 1.12, 48, 14);
    const skin = new THREE.Mesh(skinGeo, view.mat('#38bdf8', { opacity: 0.42, doubleSide: true, shininess: 80 }));
    skin.rotation.x = -Math.PI / 2; skin.position.y = top + 0.01; view.scene.add(skin);
    const pa = skinGeo.attributes.position, base = Array.from({ length: pa.count }, (_, i) => Math.hypot(pa.getX(i), pa.getY(i)));
    let lastDip = -1;
    // two highlighted molecules with pull arrows
    const teal = '#0d9488';
    const mkArrows = (P, dirs) => dirs.forEach(d => { const dv = V3(d[0], d[1], d[2]).normalize(); const a = view.arrow(P.clone().addScaledVector(dv, 0.4).toArray(), P.clone().addScaledVector(dv, 1.0).toArray(), teal, { width: 0.05, head: 0.22 }); });
    const P1 = V3(-1.5, top - 1.9, 0.5), P2 = V3(1.4, top - 0.15, 0.3);
    [P1, P2].forEach(P => { const g = water(1.6); g.position.copy(P); ball(view, g, V3(0, 0, 0), 0.72, matOf(view, '#fde047', { opacity: 0.28, shininess: 10 })); });
    mkArrows(P1, [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]);
    mkArrows(P2, [[1, 0, 0], [-1, 0, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]);
    view.arrow([P2.x + 1.2, P2.y + 0.1, P2.z], [P2.x + 1.2, P2.y - 1.1, P2.z], '#f97316', { width: 0.08, head: 0.35 });
    view.label('balanced', [P1.x, P1.y - 1.4, P1.z], { size: 0.8, color: '#0f766e' });
    view.label('net pull', [P2.x + 2.6, P2.y - 0.5, P2.z], { size: 0.8, color: '#c2410c' });
    // paper clip lying flat: a wire bent into two loops
    const clipPath = new THREE.CatmullRomCurve3([[-0.55, 0.1], [0.62, 0.1], [0.92, -0.06], [0.62, -0.24], [-0.78, -0.24], [-1.02, 0.0], [-0.78, 0.24], [0.35, 0.24], [0.52, 0.06], [0.1, -0.08]].map(p => V3(p[0], 0, p[1])), false, 'centripetal');
    const clipMesh = new THREE.Mesh(new THREE.TubeGeometry(clipPath, 64, 0.055, 8, false), view.mat('#94a3b8', { shininess: 120, specular: '#ffffff', emissive: '#1e293b' }));
    const clip = new THREE.Group(); clip.add(clipMesh); clip.rotation.y = 0.5; clip.scale.setScalar(1.7); view.scene.add(clip);
    // soap molecules: orange head under the surface, tail sticking up
    const soap = [];
    for (let i = 0; i < 10; i++) {
      const a = i * 2.4 + 0.5, r = 1.35 + (i % 3) * 0.28, g = new THREE.Group();
      ball(view, g, V3(0, -0.05, 0), 0.14, matOf(view, '#f97316')); stick(view, g, V3(0, 0, 0), V3(0, 0.5, 0), 0.04, matOf(view, '#94a3b8'));
      g.position.set(r * Math.cos(a), top + 0.02, r * Math.sin(a)); g.rotation.set(0.25 * Math.sin(i), 0, 0.25 * Math.cos(i * 2));
      view.scene.add(g); soap.push(g);
    }
    const panel = overlay(view, '', 'left:8px;top:5px;max-width:36%;');
    const row = ctx.controls(SOAP_ROW('mmol3-sp'));
    const ctl = soapControls(row, 'mmol3-sp'), sim = soapCreate();
    const d = V3(0, 0, 0), dq = V3(0, 0, 0);
    let lastHtml = '';
    view.run((t, dt) => {
      dt = Math.min(dt, 0.05);
      const q = ctl.tick(t), st = sim.update(q, dt), dep = 0.24 * st.dimple;
      const key = Math.round(dep * 1000);
      if (key !== lastDip) {
        lastDip = key;
        for (let i = 0; i < pa.count; i++) pa.setZ(i, -dep * Math.exp(-Math.pow(base[i] / 1.25, 2)));
        pa.needsUpdate = true;
      }
      const yS = top + 0.05 - dep, yB = 0.3;
      clip.position.set(0.05 * Math.sin(t * 0.9) * (1 - st.sink), mix(yS, yB, st.sink * st.sink), 0.05 * Math.cos(t * 0.7) * (1 - st.sink));
      clip.rotation.z = 0.5 * st.sink * Math.sin(t * 1.5); clip.scale.setScalar(1.7 * Math.max(0.001, st.pop));
      const n = Math.ceil(q * 10 - 0.001);
      soap.forEach((g, i) => { g.visible = i < n; g.position.y = top + 0.02 + 0.015 * Math.sin(t * 2 + i); });
      waters.forEach(w => {
        w.vel.x += (rnd() - 0.5) * 8 * dt; w.vel.y += (rnd() - 0.5) * 8 * dt; w.vel.z += (rnd() - 0.5) * 8 * dt;
        const sp = w.vel.length(); if (sp > 1.3) w.vel.multiplyScalar(1.3 / sp);
        w.pos.addScaledVector(w.vel, dt);
        const rr = Math.hypot(w.pos.x, w.pos.z);
        if (rr > RL) { const nx = w.pos.x / rr, nz = w.pos.z / rr, vr = w.vel.x * nx + w.vel.z * nz; w.pos.x = nx * RL; w.pos.z = nz * RL; if (vr > 0) { w.vel.x -= 2 * vr * nx; w.vel.z -= 2 * vr * nz; } }
        if (w.pos.y < 0.4) { w.pos.y = 0.4; w.vel.y = Math.abs(w.vel.y); } else if (w.pos.y > top - 0.55) { w.pos.y = top - 0.55; w.vel.y = -Math.abs(w.vel.y); }
        w.g.position.copy(w.pos);
        w.ax += w.spin * dt; w.g.rotation.set(w.ax, w.ax * 0.7 + w.ay, w.ay);
      });
      const html = `<div style="font-size:0.95rem;color:var(--primary)">Surface tension</div>` + (narrow(view) ? '' : `<div>${soapNote(q, st)}</div>`) + `<div style="font-size:1.05rem;color:var(--t-orange,#c2410c)">Surface pull: ${st.pull}%</div>`;
      if (html !== lastHtml) { panel.innerHTML = html; lastHtml = html; }
    });
  });

  STEPS.push({
    kind: 'example',
    title: 'Real life: Soap and a floating paper clip',
    text: '<p>A steel paper clip is denser than water, yet it can <b>float</b>. Water molecules pull on each other, and at the surface that pull makes a stretchy <b>skin</b> called surface tension. Soap weakens it. Slide the soap!</p>',
    explain: '<p>A silver <b>paper clip</b> rests on the water and dents the surface. Small red-and-white <b>water molecules</b> tumble below. The <b>teal</b> arrows show pulls from neighbours: balanced deep down, but only sideways and inward at the surface. Slide <b>Soap</b>: orange-headed soap molecules crowd the surface, the pull drops and the clip sinks.</p>',
    say: 'Look at the paper clip resting on the water. Steel is denser than water, yet the clip does not sink, because of surface tension. Every water molecule pulls on its neighbours. Deep in the water, these pulls balance out on all sides. Now look at the molecule at the top. There is no water above it, so it is pulled only sideways and inward. That makes the surface act like a thin, stretchy skin. Now slide the soap. Soap molecules, with orange heads, crowd into the surface and get between the water molecules. The pull gets weaker, the skin can no longer hold the clip, and the clip sinks.',
    mount: soapFlat,
    scene3d: soapScene3d
  });

  // @@MORE

  addTutorialSteps('chemistry', 'molecules', STEPS, [
    { term: 'Allotropes', definition: 'Different forms of the same element, such as diamond and graphite, where the atoms are bonded in different patterns.' },
    { term: 'Ionic lattice', definition: 'A regular 3D pattern of alternating positive and negative ions, like the one in a salt crystal.' },
    { term: 'Surface tension', definition: 'The pull between water molecules that makes the surface act like a thin, stretchy skin.' }
  ]);
})();
