(function () {
  // 3D scenes for chemistry/reactions: addTutorialScenes3D('chemistry', 'reactions', [...8 scenes...]).
  const T = THREE;
  const scenes = [];

  // ---------- shared helpers (all local: the kit is not edited) ----------
  const RAD = { H: 0.27, O: 0.42, C: 0.42, N: 0.4, Fe: 0.5, A: 0.42, B: 0.42 };
  const ss = (x, a, b) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // Molecule geometry: [atoms [sym, x, y, z], bonds [i, j, order]] at visual (not true) scale
  const TET = 0.72 / Math.sqrt(3);
  const MOL = {
    H2: [[['H', -0.36, 0, 0], ['H', 0.36, 0, 0]], [[0, 1, 1]]],
    O2: [[['O', -0.5, 0, 0], ['O', 0.5, 0, 0]], [[0, 1, 2]]],
    N2: [[['N', -0.5, 0, 0], ['N', 0.5, 0, 0]], [[0, 1, 3]]],
    H2O: [[['O', 0, 0.2, 0], ['H', -0.6, -0.22, 0], ['H', 0.6, -0.22, 0]], [[0, 1, 1], [0, 2, 1]]],
    CO2: [[['C', 0, 0, 0], ['O', -0.95, 0, 0], ['O', 0.95, 0, 0]], [[0, 1, 2], [0, 2, 2]]],
    CH4: [[['C', 0, 0, 0], ['H', TET, TET, TET], ['H', -TET, -TET, TET], ['H', -TET, TET, -TET], ['H', TET, -TET, -TET]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]],
    NH3: [[['N', 0, 0.2, 0], ['H', 0.62, -0.1, 0], ['H', -0.31, -0.1, 0.54], ['H', -0.31, -0.1, -0.54]], [[0, 1, 1], [0, 2, 1], [0, 3, 1]]]
  };

  function helpers(view) {
    const sphereG = new T.SphereGeometry(1, 26, 18);
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
    // A ball-and-stick molecule in a THREE.Group: group.userData.atoms = meshes.
    function molecule(name, o) {
      o = o || {};
      const [atoms, bonds] = MOL[name];
      const g = new T.Group();
      const ms = atoms.map(a => {
        const m = new T.Mesh(sphereG, mat(o.color && o.color[a[0]] || Chem3D.color(a[0])));
        m.scale.setScalar(RAD[a[0]] || 0.4);
        m.position.set(a[1], a[2], a[3]);
        g.add(m);
        return m;
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
      g.userData.atoms = ms;
      view.scene.add(g);
      return g;
    }
    // a DOM overlay inside the canvas area (crisp text)
    function overlay(css, html) {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;pointer-events:none;font-weight:700;line-height:1.2;' + css;
      d.innerHTML = html || '';
      view.wrap.appendChild(d);
      return d;
    }
    // a wider (1024 px) text sprite for longer labels; same look as view.label
    function wlabel(text, pos, o) {
      o = o || {};
      const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
      const g = c.getContext('2d');
      g.font = (o.bold === false ? '600 ' : '800 ') + (o.fontSize || 60) + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 9; g.lineJoin = 'round';
      g.strokeStyle = 'rgba(255,255,255,0.92)'; g.strokeText(text, 512, 66);
      g.fillStyle = o.color || '#1f2937'; g.fillText(text, 512, 66);
      const tex = new T.CanvasTexture(c);
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
      sp.renderOrder = 999; const size = o.size || 0.8; sp.scale.set(size * 8, size, 1);
      if (pos) sp.position.set(...pos);
      view.scene.add(sp);
      return sp;
    }
    return { sphereG, cylG, mat, cyl, molecule, overlay, wlabel };
  }

  // Set a kit bond's opacity (0 hides it) and thickness.
  function fadeBond(bd, op, rad) {
    bd.parts.forEach(m => { m.material.transparent = true; m.material.opacity = op; m.visible = op > 0.03; });
    if (rad != null) bd.rad = rad;
  }

  // ---- Step 1: atoms change partners  2H2 + O2 -> 2H2O
  scenes.push(Chem3D.define({ distance: 11.8, pitch: 0.28, yaw: 0.4, autoRotate: 0.14, target: [0, 0.1, 0] }, (view) => {
    const h = helpers(view);
    // from = reactant spot, to = product spot, arc = sideways swing while travelling
    const A = [
      { s: 'H', f: [-3.95, 1.4, 0.6], t: [2.9, 0.5, 0.5], arc: [0, 0.6, 1.2] },
      { s: 'H', f: [-3.25, 1.4, 0.6], t: [2.9, -0.8, -0.5], arc: [0, 0.8, 1.4] },
      { s: 'O', f: [-4.0, 0, 0], t: [3.5, 0.95, 0.5], arc: [0, 0, 0.9] },
      { s: 'O', f: [-3.05, 0, 0], t: [3.5, -1.25, -0.5], arc: [0, 0, -0.9] },
      { s: 'H', f: [-3.95, -1.4, -0.6], t: [4.1, 0.5, 0.5], arc: [0, -0.6, -1.2] },
      { s: 'H', f: [-3.25, -1.4, -0.6], t: [4.1, -0.8, -0.5], arc: [0, -0.8, -1.4] }
    ];
    // water 1 opens downward, water 2 is flipped so the two products differ in 3D
    const atoms = A.map(a => view.atom(a.s, a.f, { radius: RAD[a.s] }));
    const bondR = [[0, 1, 1], [4, 5, 1], [2, 3, 2]].map(b => view.bond(atoms[b[0]], atoms[b[1]], { order: b[2] }));
    const bondP = [[2, 0], [2, 4], [3, 1], [3, 5]].map(b => view.bond(atoms[b[0]], atoms[b[1]], { order: 1 }));
    view.label('Reactants', [-3.6, 3.0, 0], { size: 1.05, color: '#1f2937' });
    view.label('4 H + 2 O atoms', [-3.6, 2.2, 0], { size: 0.8, color: '#64748b', bold: false, fontSize: 46 });
    view.label('Products', [3.6, 3.0, 0], { size: 1.05, color: '#1f2937' });
    view.label('4 H + 2 O atoms', [3.6, 2.2, 0], { size: 0.8, color: '#64748b', bold: false, fontSize: 46 });
    const msg = view.label(' ', [0, 2.9, 0], { size: 0.95, color: '#4f46e5', fontSize: 50 });
    view.label('2H₂ + O₂ → 2H₂O', [0, -3.0, 0], { size: 1.05, color: '#1f2937', fontSize: 56 });
    const arrow = view.arrow([-1.5, 0, 0], [1.5, 0, 0], '#94a3b8', { width: 0.07, head: 0.55 });
    let lastMsg = ' ';
    view.run((t) => {
      const c = t % 10;
      const p = ss(c, 2, 5.2);
      const sc = ss(c, 0, 0.6) * (1 - ss(c, 9.3, 10));
      A.forEach((a, i) => {
        const at = atoms[i];
        const arcK = Math.sin(Math.PI * p);
        const vib = (p === 0 || p === 1) ? 0.03 : 0.012;
        at.position.set(
          lerp(a.f[0], a.t[0], p) + a.arc[0] * arcK + vib * Math.sin(t * 9 + i * 1.7),
          lerp(a.f[1], a.t[1], p) + a.arc[1] * arcK + vib * Math.sin(t * 8 + i),
          lerp(a.f[2], a.t[2], p) + a.arc[2] * arcK + vib * Math.cos(t * 10 + i)
        );
        at.scale.setScalar(Math.max(0.001, RAD[a.s] * sc));
      });
      const rb = 1 - ss(p, 0, 0.3), pb = ss(p, 0.7, 1);
      bondR.forEach(b => fadeBond(b, rb * sc, 0.09 * sc + 0.001));
      bondP.forEach(b => fadeBond(b, pb * sc, 0.09 * sc + 0.001));
      view.updateBonds();
      const m = c < 2 ? ' ' : (p < 0.5 ? 'Bonds break...' : (p < 1 ? 'New bonds form!' : (c < 8.6 ? 'Same atoms, new pairs' : ' ')));
      if (m !== lastMsg) { msg.userData.setText(m); lastMsg = m; }
      arrow.scale.x = 1 + 0.06 * Math.sin(t * 3);
      arrow.position.x = 0.15 * Math.sin(t * 3);
    });
  }));

  // ---- Step 2: equation balancer (coefficient +/- buttons, live atom counter, 3D molecules multiply)
  scenes.push(Chem3D.define({ distance: 11.2, pitch: 0.4, yaw: 0.3, autoRotate: 0.1, target: [0, 0.2, 0] }, (view, ctx) => {
    const h = helpers(view);
    const RX = [
      { name: 'Water', sp: [['H₂', 'H2', { H: 2 }, 0], ['O₂', 'O2', { O: 2 }, 0], ['H₂O', 'H2O', { H: 2, O: 1 }, 1]] },
      { name: 'Methane', sp: [['CH₄', 'CH4', { C: 1, H: 4 }, 0], ['O₂', 'O2', { O: 2 }, 0], ['CO₂', 'CO2', { C: 1, O: 2 }, 1], ['H₂O', 'H2O', { H: 2, O: 1 }, 1]] },
      { name: 'Ammonia', sp: [['N₂', 'N2', { N: 2 }, 0], ['H₂', 'H2', { H: 2 }, 0], ['NH₃', 'NH3', { N: 1, H: 3 }, 1]] }
    ];
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const SP = 1.25;
    // floor plates: turn green only when the equation is TRULY balanced
    const plateMat = view.mat('#f87171', { opacity: 0.22, shininess: 10 });
    const plates = [-3.4, 3.4].map(x => {
      const m = new T.Mesh(new T.PlaneGeometry(5.8, 4.4), plateMat);
      m.rotation.x = -Math.PI / 2; m.position.set(x, -2.35, 0); view.scene.add(m); return m;
    });
    view.arrow([-0.95, 0, 0], [0.95, 0, 0], '#94a3b8', { width: 0.07, head: 0.5 });
    view.label('Reactants', [-3.4, -2.5, 2.4], { size: 0.85, color: '#475569', fontSize: 56 });
    view.label('Products', [3.4, -2.5, 2.4], { size: 0.85, color: '#475569', fontSize: 56 });

    const eqRow = ctx.controls('<div class="scene-slider-row" style="justify-content:center;padding:1px 4px 3px;gap:2px;flex-wrap:wrap"></div>').firstChild;
    const selRow = h.overlay('top:4px;left:4px;display:flex;flex-direction:column;gap:3px;pointer-events:auto', '');
    const chips = h.overlay('top:4px;left:78px;right:4px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;white-space:nowrap', '');
    let cur = 0, coef = [], pool = [], species = [], sprites = [];

    RX.forEach((r, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'scene-btn'; b.textContent = r.name; b.style.cssText = 'padding:1px 7px;font-size:.72rem';
      b.addEventListener('click', () => load(i));
      selRow.appendChild(b);
    });

    function slot(i, n) {
      const cols = n <= 4 ? n : 3, rows = Math.ceil(n / cols);
      return [((i % cols) - (cols - 1) / 2) * SP, 0, (Math.floor(i / cols) - (rows - 1) / 2) * SP];
    }
    function rowY(k) {
      const r = RX[cur].sp, side = r[k][3], same = r.filter(s => s[3] === side), idx = same.indexOf(r[k]);
      return same.length === 1 ? 0.2 : (idx === 0 ? 1.35 : -1.2);
    }
    function load(i) {
      cur = i;
      const r = RX[i];
      pool.forEach(list => list.forEach(m => view.scene.remove(m)));
      sprites.forEach(s => view.scene.remove(s));
      pool = []; sprites = [];
      coef = r.sp.map(() => 1);
      [...selRow.children].forEach((b, k) => { b.style.borderColor = k === i ? 'var(--primary)' : ''; b.style.color = k === i ? 'var(--primary)' : ''; });
      eqRow.innerHTML = '';
      r.sp.forEach((s, k) => {
        if (k > 0) {
          const sep = document.createElement('span');
          sep.style.cssText = 'font-size:.9rem;color:var(--t-muted)';
          sep.textContent = s[3] !== r.sp[k - 1][3] ? '→' : '+';
          eqRow.appendChild(sep);
        }
        const c = document.createElement('span');
        c.style.cssText = 'display:inline-flex;align-items:center;gap:1px';
        c.innerHTML = '<button type="button" class="scene-btn" style="padding:0 5px;font-size:.85rem;border-width:1.5px" aria-label="Decrease coefficient of ' + s[0] + '">−</button><b class="cn" style="min-width:10px;text-align:center;font-size:.95rem;color:var(--primary)">1</b><button type="button" class="scene-btn" style="padding:0 5px;font-size:.85rem;border-width:1.5px" aria-label="Increase coefficient of ' + s[0] + '">+</button><span style="color:var(--t-ink);font-size:.85rem;margin-left:1px">' + s[0] + '</span>';
        const bs = c.querySelectorAll('button');
        bs[0].addEventListener('click', () => { coef[k] = Math.max(1, coef[k] - 1); update(); });
        bs[1].addEventListener('click', () => { coef[k] = Math.min(9, coef[k] + 1); update(); });
        eqRow.appendChild(c);
      });
      species = r.sp.map((s, k) => {
        const list = [];
        for (let n = 0; n < 9; n++) {
          const g = h.molecule(s[1]);
          const p = slot(n, 9);
          g.userData.cur = { s: 0, x: p[0], z: p[2] };
          g.scale.setScalar(0.001);
          list.push(g);
        }
        pool.push(list);
        const lab = view.label('1 ' + s[0], [0, 0, 0], { size: 0.95, color: '#1f2937', fontSize: 54 });
        sprites.push(lab);
        return { list, lab, cx: s[3] ? 3.4 : -3.4, y: rowY(k) };
      });
      update();
    }
    function update() {
      const r = RX[cur];
      [...eqRow.querySelectorAll('.cn')].forEach((n, k) => { n.textContent = coef[k]; });
      const tot = {};
      r.sp.forEach((s, k) => { Object.keys(s[2]).forEach(e => { tot[e] = tot[e] || [0, 0]; tot[e][s[3]] += s[2][e] * coef[k]; }); });
      let all = true, html = '<div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center">';
      Object.keys(tot).forEach(e => {
        const L = tot[e][0], R = tot[e][1], ok = L === R;
        if (!ok) all = false;
        const col = ok ? '#15803d' : '#dc2626';
        html += '<span style="background:rgba(255,255,255,.85);border:2px solid ' + col + ';color:' + col + ';border-radius:8px;padding:0 5px;display:inline-flex;align-items:center;gap:3px"><i style="width:10px;height:10px;border-radius:50%;background:' + Chem3D.color(e) + ';border:1px solid #475569;display:inline-block"></i>' + e + ' ' + L + ' ' + (ok ? '=' : '≠') + ' ' + R + '</span>';
      });
      html += '</div>';
      const g = coef.reduce(gcd);
      const msg = !all ? 'Not balanced yet' : (g > 1 ? 'Balanced! Try smaller numbers?' : 'Balanced! Atoms in = atoms out');
      html += '<div style="font-size:11.5px;color:' + (all ? '#15803d' : '#dc2626') + ';background:rgba(255,255,255,.75);border-radius:6px;padding:0 6px">' + msg + '</div>';
      chips.innerHTML = html;
      plateMat.color.set(all ? '#22c55e' : '#f87171');
      species.forEach((sp, k) => {
        sp.n = coef[k];
        sp.lab.userData.setText(coef[k] + ' ' + r.sp[k][0]);
      });
    }
    view.run((t, dt) => {
      const k = Math.min(1, dt * 8);
      species.forEach((sp, si) => {
        sp.list.forEach((g, i) => {
          const c = g.userData.cur, on = i < sp.n;
          const p = slot(i, Math.max(sp.n, 1));
          c.x += ((on ? p[0] : c.x) - c.x) * k; c.z += ((on ? p[2] : c.z) - c.z) * k;
          c.s += ((on ? 1 : 0) - c.s) * Math.min(1, dt * 7);
          g.position.set(sp.cx + c.x, sp.y + 0.07 * Math.sin(t * 1.6 + i * 1.3 + si), c.z);
          g.rotation.y = t * (0.5 + 0.1 * si) * (i % 2 ? 1 : -1) + i;
          g.rotation.z = 0.25 * Math.sin(t * 1.1 + i);
          g.scale.setScalar(Math.max(0.001, 0.92 * c.s));
          g.visible = c.s > 0.02;
        });
        const rows = Math.ceil(Math.max(sp.n, 1) / (sp.n <= 4 ? sp.n : 3));
        sp.lab.position.set(sp.cx, sp.y - 0.95 - (rows - 1) * SP * 0.5 + 0.0, (rows - 1) * SP * 0.5 + 0.2);
      });
    });
    load(0);
  }));

  // ---- Step 3: signs of a reaction (gas, colour change, precipitate, heat + light) in four 3D beakers
  scenes.push(Chem3D.define({ distance: 10.2, pitch: 0.2, yaw: 0.25, autoRotate: 0.1, target: [0, 0.85, 0] }, (view) => {
    const h = helpers(view);
    const X = [-3.6, -1.2, 1.2, 3.6], R = 0.95, HH = 2.3, TOP = 1.32;
    const bk = [
      view.beaker(R, HH, { pos: [X[0], 0, 0], liquidColor: '#60a5fa', level: 0.6, liquidOpacity: 0.5 }),
      view.beaker(R, HH, { pos: [X[1], 0, 0], liquidColor: '#93c5fd', level: 0.6, liquidOpacity: 0.55 }),
      view.beaker(R, HH, { pos: [X[2], 0, 0], liquidColor: '#93c5fd', level: 0.6, liquidOpacity: 0.4 }),
      view.beaker(R, HH, { pos: [X[3], 0, 0], liquidColor: '#fdba74', level: 0.6, liquidOpacity: 0.65 })
    ];
    view.floor(0, 11, '#c7d2fe');
    const T1 = [['Gas bubbles', 'fizzing'], ['Color change', 'new color'], ['Precipitate', 'new solid'], ['Heat, light', 'energy out']];
    T1.forEach((t, i) => {
      view.label(t[0], [X[i], -0.6, 0.9], { size: 0.78, color: '#1f2937', fontSize: 50 });
      view.label(t[1], [X[i], -1.15, 0.9], { size: 0.62, color: '#64748b', bold: false, fontSize: 46 });
    });
    h.overlay('top:4px;left:6px;right:6px;text-align:center;font-size:11.5px;color:#334155;background:rgba(255,255,255,.7);border-radius:8px;padding:1px 6px',
      '<span style="color:#4f46e5">Chemical change: a NEW substance forms.</span><br>Melting or dissolving is only physical.');

    // 1. gas bubbles rising from a fizzing block
    const tablet = new T.Mesh(new T.BoxGeometry(0.6, 0.18, 0.6), h.mat('#e2e8f0'));
    tablet.position.set(X[0], 0.12, 0); view.scene.add(tablet);
    const bubbleMat = view.mat('#ffffff', { opacity: 0.8, shininess: 100 });
    const bubbles = [];
    for (let i = 0; i < 16; i++) {
      const m = new T.Mesh(h.sphereG, bubbleMat);
      view.scene.add(m);
      bubbles.push({ m, ph: i / 16, r: 0.07 + 0.06 * ((i * 7) % 3) / 2, a: i * 2.1, sp: 0.55 + 0.08 * (i % 4) });
    }
    // 2. colour change: drop falls in, liquid blue -> yellow -> blue
    const drop = new T.Mesh(h.sphereG, h.mat('#f59e0b')); drop.scale.setScalar(0.14); view.scene.add(drop);
    const cBlue = new T.Color('#93c5fd'), cYel = new T.Color('#fbbf24'), tmp = new T.Color();
    // 3. precipitate: specks appear, sink, and pile up
    const specMat = h.mat('#f8fafc');
    const specks = [];
    for (let i = 0; i < 12; i++) {
      const m = new T.Mesh(h.sphereG, specMat); view.scene.add(m);
      specks.push({ m, a: i * 2.4, rr: 0.15 + 0.6 * ((i * 5) % 7) / 7, y0: 0.7 + 0.5 * ((i * 3) % 5) / 5, r: 0.06 + 0.03 * (i % 3) });
    }
    const pile = new T.Mesh(h.cylG, h.mat('#f1f5f9')); view.scene.add(pile);
    // 4. heat and light
    const glow = new T.Mesh(h.sphereG, view.mat('#fde047', { emissive: '#fbbf24', shininess: 10 }));
    glow.position.set(X[3], 0.8, 0); view.scene.add(glow);
    const halo = new T.Mesh(h.sphereG, view.mat('#fef08a', { opacity: 0.28, emissive: '#facc15', shininess: 5 }));
    halo.position.copy(glow.position); view.scene.add(halo);
    const pts = []; for (let k = 0; k <= 12; k++) pts.push(new T.Vector3(0.1 * Math.sin(k * 0.9), k * 0.06, 0));
    const waveGeo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 24, 0.028, 6);
    const waves = [-0.45, 0, 0.45].map((dx, i) => {
      const m = new T.Mesh(waveGeo, view.mat('#f97316', { opacity: 0.9, shininess: 10 })); view.scene.add(m);
      return { m, dx, i };
    });
    const sparks = [];
    for (let i = 0; i < 8; i++) {
      const m = new T.Mesh(h.sphereG, view.mat('#fef08a', { emissive: '#fde047', shininess: 10 })); m.scale.setScalar(0.05); view.scene.add(m);
      sparks.push({ m, a: i * 0.785, ph: i / 8 });
    }
    let lastCyc = -1;
    view.run((t) => {
      // beaker 1
      bubbles.forEach(b => {
        const f = (t * b.sp * 0.5 + b.ph) % 1;
        const y = 0.3 + f * (TOP - 0.35);
        b.m.position.set(X[0] + 0.28 * Math.cos(b.a) * (0.4 + f * 0.5) + 0.05 * Math.sin(t * 5 + b.a), y, 0.28 * Math.sin(b.a) * (0.4 + f * 0.5));
        b.m.scale.setScalar(b.r * (0.7 + 0.5 * f) * (f > 0.93 ? 0.4 : 1));
      });
      // beaker 2 (6 s cycle)
      const c = (t % 6) / 6;
      const k = ss(c, 0.2, 0.5) * (1 - ss(c, 0.85, 1));
      tmp.copy(cBlue).lerp(cYel, k); bk[1].liquidMesh.material.color.copy(tmp);
      const ty = c < 0.15 ? lerp(2.3, TOP, c / 0.15) : TOP;
      drop.position.set(X[1], ty, 0); drop.visible = c < 0.15;
      // beaker 3 (6 s cycle)
      const cyc = Math.floor(t / 6);
      if (cyc !== lastCyc) { lastCyc = cyc; specks.forEach(s => { s.a = Math.random() * 6.28; s.rr = 0.1 + Math.random() * 0.6; s.y0 = 0.7 + Math.random() * 0.5; }); }
      const app = ss(c, 0.12, 0.2), fall = ss(c, 0.2, 0.7), out = 1 - ss(c, 0.93, 1);
      specks.forEach((s, i) => {
        const ly = lerp(s.y0, 0.16 + 0.03 * (i % 3), fall);
        s.m.position.set(X[2] + s.rr * Math.cos(s.a), ly - 0.04 * Math.sin(t * 3 + i) * (1 - fall), s.rr * Math.sin(s.a));
        s.m.scale.setScalar(s.r * app * out + 0.0001);
      });
      const ph = 0.02 + 0.12 * ss(c, 0.5, 0.75);
      pile.scale.set(R * 0.9, ph * out + 0.001, R * 0.9); pile.position.set(X[2], 0.01 + ph * out / 2, 0);
      // beaker 4
      const pu = 0.5 + 0.5 * Math.sin(t * 6.28);
      glow.scale.setScalar(0.28 + 0.2 * pu); halo.scale.setScalar(0.6 + 0.45 * pu); halo.material.opacity = 0.34 - 0.18 * pu;
      waves.forEach(w => {
        const f = ((t + w.i * 0.6) / 1.8) % 1;
        w.m.position.set(X[3] + w.dx, 2.45 + 0.7 * f, 0); w.m.material.opacity = Math.sin(Math.PI * f) * 0.95; w.m.visible = w.m.material.opacity > 0.03;
      });
      sparks.forEach(s => {
        const f = (t * 0.9 + s.ph) % 1, rr = 0.3 + f * 1.1;
        s.m.position.set(X[3] + rr * Math.cos(s.a + t * 0.3), 0.8 + rr * Math.sin(s.a * 1.7) * 0.5, rr * Math.sin(s.a + t * 0.3) * 0.7);
        s.m.scale.setScalar(0.06 * (1 - f) + 0.005);
      });
    });
  }));

  // ---- Step 4: exothermic vs endothermic (3D energy bars, heat flow, thermometer)
  scenes.push(Chem3D.define({ distance: 9.2, pitch: 0.2, yaw: 0.3, autoRotate: 0.1, target: [0.3, 2.35, 0] }, (view, ctx) => {
    const h = helpers(view);
    const HI = 3.1, LO = 1.6, BX = -1.7, PX = 0.9, TX = 4.2;
    let exo = true;
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;padding:2px 12px 4px"><button type="button" class="scene-btn" data-m="exo">Exothermic</button><button type="button" class="scene-btn" data-m="endo">Endothermic</button></div>');
    const title = h.overlay('top:4px;left:8px;font-size:13px', '');
    view.floor(0, 12, '#c7d2fe');
    // energy axis
    view.arrow([-3.4, 0, 0], [-3.4, 4.1, 0], '#64748b', { width: 0.05, head: 0.4 });
    view.label('Energy', [-4.0, 2.1, 0], { size: 0.75, color: '#475569', fontSize: 52 });
    // bars
    const bar = (x, col) => { const m = new T.Mesh(new T.BoxGeometry(1, 1, 1), view.mat(col, { shininess: 60 })); m.position.x = x; view.scene.add(m); return m; };
    const rBar = bar(BX, '#60a5fa'), pBar = bar(PX, '#fb923c');
    const rLab = view.label('Reactants', [BX, 3.7, 0.9], { size: 0.8, color: '#1f2937', fontSize: 52 });
    const pLab = view.label('Products', [PX, 2.2, 0.9], { size: 0.8, color: '#1f2937', fontSize: 52 });
    // dashed level line from the reactants bar top across to the products bar
    const dashes = [];
    for (let i = 0; i < 6; i++) { const d = new T.Mesh(new T.BoxGeometry(0.22, 0.04, 0.04), view.mat('#64748b')); view.scene.add(d); dashes.push(d); }
    // energy-change arrow between the bars
    const shaft = new T.Mesh(h.cylG, h.mat('#1f2937')), cone = new T.Mesh(new T.ConeGeometry(1, 1, 18), h.mat('#1f2937'));
    view.scene.add(shaft, cone);
    // thermometer
    const tube = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 3.0, 20, 1, true), view.mat('#dbeafe', { opacity: 0.35, doubleSide: true, shininess: 120, specular: '#ffffff' }));
    tube.position.set(TX, 1.95, 0); view.scene.add(tube);
    const bulbMat = view.mat('#ef4444', { shininess: 80 });
    const bulb = new T.Mesh(h.sphereG, bulbMat); bulb.scale.setScalar(0.38); bulb.position.set(TX, 0.45, 0); view.scene.add(bulb);
    const merc = new T.Mesh(h.cylG, bulbMat); view.scene.add(merc);
    view.label('Surroundings', [TX, 4.95, 0], { size: 0.72, color: '#64748b', bold: false, fontSize: 46 });
    const tlabE = view.label('gets warmer', [TX, 4.3, 0], { size: 0.75, color: '#ea580c', fontSize: 46 });
    const tlabN = view.label('gets colder', [TX, 4.3, 0], { size: 0.75, color: '#2563eb', fontSize: 46 });
    const flowE = view.label('Heat out', [2.6, 2.9, 0], { size: 0.75, color: '#ea580c', fontSize: 52 });
    const flowN = view.label('Heat in', [2.6, 2.9, 0], { size: 0.75, color: '#2563eb', fontSize: 52 });
    // heat particles
    const dotMat = view.mat('#f97316', { emissive: '#7c2d12', shininess: 40 });
    const dots = [];
    for (let i = 0; i < 6; i++) { const d = new T.Mesh(h.sphereG, dotMat); view.scene.add(d); dots.push({ d, i, z: (i % 3 - 1) * 0.35, dy: (i % 2) * 0.4 }); }
    let rTop = HI, pTop = LO, arrY1 = HI - 0.1, arrY2 = LO + 0.1;
    function setMode(m) {
      exo = m === 'exo';
      row.querySelectorAll('button').forEach(b => { const on = b.dataset.m === m; b.style.borderColor = on ? 'var(--primary)' : ''; b.style.color = on ? 'var(--primary)' : ''; });
      const c = exo ? '#ea580c' : '#2563eb';
      title.style.color = c; title.innerHTML = exo ? 'Exothermic: releases heat' : 'Endothermic: absorbs heat';
      dotMat.color.set(exo ? '#f97316' : '#3b82f6'); dotMat.emissive.set(exo ? '#7c2d12' : '#1e3a8a');
      bulbMat.color.set(exo ? '#ef4444' : '#3b82f6');
      tlabE.visible = flowE.visible = exo; tlabN.visible = flowN.visible = !exo;
    }
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
    setMode('exo');
    let t0 = 0;
    view.run((t, dt) => {
      const k = Math.min(1, dt * 5) || 1;
      const tr = exo ? HI : LO, tp = exo ? LO : HI;
      rTop += (tr - rTop) * k; pTop += (tp - pTop) * k;
      rBar.scale.set(1.5, rTop, 1.5); rBar.position.y = rTop / 2;
      pBar.scale.set(1.5, pTop, 1.5); pBar.position.y = pTop / 2;
      dashes.forEach((d, i) => d.position.set(BX + 0.9 + i * 0.32, rTop, 0));
      rLab.position.y = rTop + 0.55; pLab.position.y = pTop + 0.55;
      const a1 = exo ? rTop - 0.1 : rTop + 0.1, a2 = exo ? pTop + 0.1 : pTop - 0.1;
      arrY1 += (a1 - arrY1) * k; arrY2 += (a2 - arrY2) * k;
      const bob = 0.1 * Math.sin(t * 6.28) * (exo ? -1 : 1);
      const dir = Math.sign(arrY2 - arrY1) || -1, len = Math.max(0.3, Math.abs(arrY2 - arrY1) - 0.15), head = 0.4;
      const ay = arrY1 + bob;
      shaft.scale.set(0.05, Math.max(0.05, len - head), 0.05); shaft.position.set((BX + PX) / 2, ay + dir * (len - head) / 2, 0);
      cone.scale.set(0.16, head, 0.16); cone.position.set((BX + PX) / 2, ay + dir * (len - head / 2), 0); cone.rotation.z = dir > 0 ? 0 : Math.PI;
      // thermometer cycle (4 s)
      const c = (t % 4) / 4;
      const m = exo ? lerp(0.4, 0.88, ss(c, 0, 0.45) * (1 - ss(c, 0.85, 1))) : lerp(0.4, 0.1, ss(c, 0, 0.45) * (1 - ss(c, 0.85, 1)));
      const mh = 0.2 + m * 2.5;
      merc.scale.set(0.1, mh, 0.1); merc.position.set(TX, 0.45 + mh / 2, 0);
      dots.forEach(o => {
        const f = ((t * 0.5 + o.i / 6) % 1);
        const x = exo ? lerp(1.9, 3.6, f) : lerp(3.6, 1.9, f);
        o.d.position.set(x, 1.7 + o.dy + 0.12 * Math.sin(t * 4 + o.i), o.z);
        o.d.scale.setScalar(0.16 * Math.sin(Math.PI * f) + 0.001);
      });
    });
  }));

  // ---- Step 5: two reaction types (synthesis and decomposition, generic A and B atoms)
  scenes.push(Chem3D.define({ distance: 8.8, pitch: 0.28, yaw: 0.3, autoRotate: 0.12, target: [0, 0, 0] }, (view) => {
    const h = helpers(view);
    const LANE = [1.4, -1.6], COL_A = '#f97316', COL_B = '#3b82f6';
    LANE.forEach(y => {
      const p = view.box(8.4, 0.08, 2.4, '#e0e7ff', { pos: [0, y - 0.62, 0], shininess: 20 });
    });
    h.wlabel('Synthesis: many → one', [0, LANE[0] + 1.0, 0], { size: 0.8, color: '#4f46e5', fontSize: 60 });
    h.wlabel('A + B → AB     e.g. 2H₂ + O₂ → 2H₂O', [0, LANE[0] - 0.85, 1.0], { size: 0.8, color: '#475569', fontSize: 52 });
    h.wlabel('Decomposition: one → many', [0, LANE[1] + 1.0, 0], { size: 0.8, color: '#ea580c', fontSize: 58 });
    h.wlabel('AB → A + B     e.g. 2H₂O → 2H₂ + O₂', [0, LANE[1] - 0.85, 1.0], { size: 0.8, color: '#475569', fontSize: 52 });
    const mk = (y) => ({
      a: view.atom('A', [0, y, 0], { color: COL_A, radius: 0.44, label: 'A', labelSize: 0.85 }),
      b: view.atom('B', [0, y, 0], { color: COL_B, radius: 0.44, label: 'B', labelSize: 0.85 })
    });
    const S = mk(LANE[0]), D = mk(LANE[1]);
    const bS = view.bond(S.a, S.b, { color: '#334155', radius: 0.1 }), bD = view.bond(D.a, D.b, { color: '#334155', radius: 0.1 });
    view.run((t) => {
      const f = (t % 6) / 6;
      const vis = ss(f, 0, 0.05) * (1 - ss(f, 0.92, 1));
      const p = ss(f, 0.15, 0.5), arc = Math.sin(Math.PI * p) * 0.7;
      const wob = (i) => 0.025 * Math.sin(t * 9 + i);
      // synthesis: apart -> bonded
      const xs = lerp(2.4, 0.46, p);
      S.a.position.set(-xs + wob(1), LANE[0] + wob(2), arc); S.b.position.set(xs + wob(3), LANE[0] + wob(4), -arc);
      // decomposition: bonded -> apart
      const xd = lerp(0.46, 2.4, p);
      D.a.position.set(-xd + wob(5), LANE[1] + wob(6), -arc); D.b.position.set(xd + wob(7), LANE[1] + wob(8), arc);
      [S.a, S.b, D.a, D.b].forEach(m => m.scale.setScalar(0.44 * vis + 0.0001));
      fadeBond(bS, ss(f, 0.5, 0.6) * (1 - ss(f, 0.92, 1)), 0.1 * vis);
      fadeBond(bD, (1 - ss(f, 0.15, 0.3)) * vis, 0.1 * vis);
      view.updateBonds();
    });
  }));

  // ---- Step 6 (example): a nail rusts (slow reaction, time-lapse)
  scenes.push(Chem3D.define({ distance: 7.6, pitch: 0.25, yaw: 0.35, autoRotate: 0.12, target: [0.2, 0.75, 0] }, (view) => {
    const h = helpers(view);
    view.floor(-0.9, 11, '#c7d2fe');
    // the nail (along x): shaft, head, tip
    const iron = h.mat('#94a3b8', { shininess: 110, specular: '#ffffff' });
    const nail = new T.Group(); nail.position.set(0.2, 0.3, 0); view.scene.add(nail);
    const shaft = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 4.6, 24), iron); shaft.rotation.z = Math.PI / 2; shaft.position.x = 0.1;
    const head = new T.Mesh(new T.CylinderGeometry(0.46, 0.46, 0.2, 28), iron); head.rotation.z = Math.PI / 2; head.position.x = -2.3;
    const tip = new T.Mesh(new T.ConeGeometry(0.17, 0.6, 24), iron); tip.rotation.z = -Math.PI / 2; tip.position.x = 2.7;
    nail.add(shaft, head, tip);
    // rust patches: flattened blobs wrapped around the shaft at all angles, appearing one by one
    const rustA = h.mat('#b45309', { shininess: 15, specular: '#000000' }), rustB = h.mat('#c2410c', { shininess: 15, specular: '#000000' });
    const patches = [];
    for (let i = 0; i < 18; i++) {
      const g = new T.Group();
      g.rotation.x = (i * 2.4) % 6.283;
      const m = new T.Mesh(h.sphereG, i % 2 ? rustA : rustB);
      m.position.set(-2.0 + 4.4 * ((i * 7) % 18) / 18, 0.17, 0);
      g.add(m); nail.add(g);
      patches.push({ m, s: 0.04 + 0.78 * i / 17, w: 0.28 + 0.16 * (i % 3), hh: 0.07 + 0.02 * (i % 2) });
    }
    // falling oxygen molecules and water drops
    const O = [], W = [];
    const dropMat = view.mat('#3b82f6', { opacity: 0.85, shininess: 90 });
    for (let i = 0; i < 4; i++) {
      const g = h.molecule('O2'); g.scale.setScalar(0.85);
      O.push({ g, x: -1.6 + i * 1.15 + (i % 2) * 0.25, z: (i % 2 ? 0.9 : -0.9), per: 2.4, dl: i * 0.7 });
      const d = new T.Group();
      const b = new T.Mesh(h.sphereG, dropMat); b.scale.setScalar(0.19);
      const c = new T.Mesh(new T.ConeGeometry(0.155, 0.36, 16), dropMat); c.position.y = 0.27;
      d.add(b, c); view.scene.add(d);
      W.push({ g: d, x: -1.0 + i * 1.2 - (i % 2) * 0.2, z: (i % 2 ? -0.7 : 0.8), per: 2.0, dl: i * 0.9 + 0.3 });
    }
    view.label('iron nail (Fe)', [0.2, -0.35, 0.8], { size: 0.72, color: '#475569', fontSize: 48 });
    const phase = h.overlay('top:5px;right:8px;font-size:16px;color:#ea580c;background:rgba(255,255,255,.75);border-radius:8px;padding:0 8px', 'Day 1');
    h.overlay('top:5px;left:8px;font-size:11px;color:#334155;background:rgba(255,255,255,.75);border-radius:8px;padding:2px 7px',
      '<div><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ef4444"></i><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ef4444;margin-right:4px"></i>oxygen (O₂) &nbsp;<i style="display:inline-block;width:8px;height:10px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#3b82f6;margin-right:3px"></i>water</div>' +
      '<div style="font-size:12.5px;color:#1f2937;margin-top:1px">4Fe + 3O₂ → 2Fe₂O₃</div><div style="font-weight:600;color:#64748b">iron + oxygen → iron oxide (rust)</div>');
    let lastPh = 'Day 1';
    const fall = (o, t, spin) => {
      const f = ((t + o.dl) / o.per) % 1;
      o.g.position.set(o.x + 0.12 * Math.sin(t * 1.3 + o.dl), lerp(2.55, 0.62, f), o.z * (1 - 0.45 * f));
      o.g.scale.setScalar((spin ? 0.85 : 1) * Math.max(0.001, ss(f, 0, 0.15) * (1 - ss(f, 0.8, 1))));
      if (spin) { o.g.rotation.y = t * 0.8 + o.dl; o.g.rotation.z = t * 1.2 + o.dl; }
    };
    view.run((t) => {
      const c = (t % 12) / 12;
      patches.forEach(p => {
        const grow = ss(c, p.s, p.s + 0.1) * (1 - ss(c, 0.93, 1));
        p.m.scale.set(p.w * grow + 0.0001, p.hh * grow + 0.0001, p.w * 0.8 * grow + 0.0001);
      });
      O.forEach(o => fall(o, t, true)); W.forEach(o => fall(o, t, false));
      const ph = c < 0.28 ? 'Day 1' : (c < 0.6 ? 'Week 2' : 'Month 3');
      if (ph !== lastPh) { lastPh = ph; phase.textContent = ph; }
    });
  }));

  // ---- Step 7 (example): a fizzy tablet (temperature slider, Crush it, Drop tablet)
  scenes.push(Chem3D.define({ distance: 7.6, pitch: 0.4, yaw: 0.3, autoRotate: 0.12, target: [0, 1.3, 0] }, (view, ctx) => {
    const h = helpers(view);
    const R = 1.15, HH = 2.9, LEVEL = 0.78, TOPY = 0.01 + HH * 0.96 * LEVEL;
    view.beaker(R, HH, { liquidColor: '#93c5fd', level: LEVEL, liquidOpacity: 0.5 });
    view.floor(0, 9, '#c7d2fe');
    const row = ctx.controls('<div class="scene-slider-row" style="padding:2px 12px 4px"><span>Water</span><input type="range" min="5" max="50" step="1" value="20"><span style="min-width:44px;text-align:right">20 °C</span></div>');
    const slider = row.querySelector('input'), tv = row.querySelectorAll('span')[1];
    const right = h.overlay('top:4px;right:6px;width:104px;text-align:center;font-size:11.5px;color:#1f2937;background:rgba(255,255,255,.72);border-radius:8px;padding:3px 4px;pointer-events:auto',
      '<div class="ft-info" style="font-size:12.5px">Water 20 °C</div><div class="ft-form" style="color:#64748b;font-weight:600">whole tablet</div>' +
      '<div style="margin-top:2px">Reaction speed</div><div style="height:9px;border-radius:5px;background:#e5e7eb;overflow:hidden;margin:1px 0"><div class="ft-spd" style="height:100%;width:6%;background:#f97316;border-radius:5px"></div></div>' +
      '<div class="ft-time" style="color:#2563eb;min-height:1.2em">Fizzing... 0.0 s</div>' +
      '<div style="display:flex;flex-direction:column;gap:2px;margin-top:2px"><button type="button" class="scene-btn ft-crush" style="padding:1px 4px;font-size:.75rem">Crush it</button><button type="button" class="scene-btn ft-drop" style="padding:1px 4px;font-size:.75rem">Drop tablet</button></div>');
    h.overlay('top:4px;left:6px;width:88px;font-size:10.5px;color:#334155;background:rgba(255,255,255,.72);border-radius:8px;padding:3px 5px',
      'acid + baking soda<br>→ salt + water + CO₂');
    const $ = s => right.querySelector(s);
    const tabMat = h.mat('#f8fafc', { shininess: 30 });
    const whole = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 28), tabMat); view.scene.add(whole);
    const PCS = [];
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4 + 0.5, r = 0.15 + 0.5 * ((i * 3) % 7) / 7;
      const m = new T.Mesh(new T.BoxGeometry(1, 1, 1), tabMat); view.scene.add(m);
      PCS.push({ m, x: Math.cos(a) * r, z: Math.sin(a) * r, ry: i * 1.3 });
    }
    const bubMat = view.mat('#ffffff', { opacity: 0.78, shininess: 110, specular: '#ffffff' });
    const NB = 48, bs = [];
    for (let i = 0; i < NB; i++) { const m = new T.Mesh(h.sphereG, bubMat); m.visible = false; view.scene.add(m); bs.push({ m, on: false, x: 0, y: 0, z: 0, vy: 0, r: 0.08, ph: 0 }); }
    let crushed = false, left = 0, active = false, elapsed = 0, acc = 0, dropT = 0, speed = 0;
    const rate = () => 0.05 * Math.pow(1.6, (+slider.value - 20) / 10) * (crushed ? 4 : 1);
    function drop() { active = true; left = 1; elapsed = 0; dropT = 0; $('.ft-time').textContent = 'Fizzing... 0.0 s'; }
    function refresh() {
      tv.textContent = slider.value + ' °C';
      $('.ft-info').textContent = 'Water ' + slider.value + ' °C';
      $('.ft-form').textContent = crushed ? 'crushed tablet' : 'whole tablet';
      const cb = $('.ft-crush');
      cb.textContent = crushed ? 'Use whole' : 'Crush it';
      cb.style.borderColor = crushed ? 'var(--primary)' : ''; cb.style.color = crushed ? 'var(--primary)' : '';
    }
    slider.addEventListener('input', refresh);
    $('.ft-crush').addEventListener('click', () => { crushed = !crushed; refresh(); drop(); });
    $('.ft-drop').addEventListener('click', drop);
    refresh(); drop();
    view.run((t, dt) => {
      dt = dt || 0;
      const k = active && left > 0 ? rate() : 0;
      if (active && left > 0) {
        elapsed += dt; dropT += dt;
        left = Math.max(0, left - k * dt);
        if (left === 0) { $('.ft-time').textContent = 'Done in ' + elapsed.toFixed(1) + ' s'; }
        else $('.ft-time').textContent = 'Fizzing... ' + elapsed.toFixed(1) + ' s';
      }
      speed += (k - speed) * Math.min(1, dt * 6);
      $('.ft-spd').style.width = Math.max(6, Math.min(100, 100 * speed / 0.6)) + '%';
      // tablet(s): fall in, then shrink as they are used up
      const sq = Math.sqrt(left), fy = dropT < 0.5 ? lerp(TOPY + 0.6, 0, ss(dropT, 0, 0.5)) : 0;
      const showWhole = active && left > 0.01 && !crushed, showPcs = active && left > 0.01 && crushed;
      whole.visible = showWhole;
      whole.scale.set(0.62 * sq, 0.2 * sq, 0.62 * sq); whole.position.set(0, 0.03 + 0.1 * sq + fy, 0); whole.rotation.y = t * 0.3;
      PCS.forEach(p => {
        p.m.visible = showPcs;
        p.m.scale.set(0.3 * sq, 0.2 * sq, 0.26 * sq); p.m.position.set(p.x, 0.03 + 0.1 * sq + fy, p.z); p.m.rotation.y = p.ry + t * 0.2;
      });
      // bubbles of carbon dioxide
      acc += k * 60 * dt;
      while (acc >= 1) {
        acc -= 1;
        const b = bs.find(q => !q.on); if (!b) { acc = 0; break; }
        b.on = true; b.r = 0.06 + Math.random() * 0.07; b.vy = 0.9 + Math.random() * 0.7; b.ph = Math.random() * 6.28;
        if (crushed) { const p = PCS[Math.floor(Math.random() * 7)]; b.x = p.x + rnd(-0.1, 0.1); b.z = p.z + rnd(-0.1, 0.1); }
        else { const a = Math.random() * 6.28, r = Math.random() * 0.5 * sq; b.x = Math.cos(a) * r; b.z = Math.sin(a) * r; }
        b.y = 0.2;
      }
      bs.forEach(b => {
        if (!b.on) { b.m.visible = false; return; }
        b.y += b.vy * dt; b.x += 0.15 * Math.sin(b.y * 5 + b.ph) * dt; b.z += 0.15 * Math.cos(b.y * 4 + b.ph) * dt;
        const rr = Math.hypot(b.x, b.z); if (rr > R - 0.15) { b.x *= (R - 0.15) / rr; b.z *= (R - 0.15) / rr; }
        if (b.y > TOPY - 0.05) { b.on = false; b.m.visible = false; return; }
        b.m.visible = true; b.m.position.set(b.x, b.y, b.z); b.m.scale.setScalar(b.r * (0.8 + 0.4 * b.y / TOPY));
      });
    });
  }));

  // ---- Step 8 (example): a burning candle (combustion, exothermic)
  scenes.push(Chem3D.define({ distance: 10.4, pitch: 0.16, yaw: 0.3, autoRotate: 0.12, target: [0, 2.15, 0] }, (view) => {
    const h = helpers(view);
    view.floor(-0.02, 11, '#c7d2fe');
    const plate = new T.Mesh(new T.CylinderGeometry(1.1, 1.2, 0.1, 36), h.mat('#475569', { shininess: 80 })); plate.position.y = 0.05; view.scene.add(plate);
    const H0 = 2.3;
    const body = new T.Mesh(h.cylG, h.mat('#fef3c7', { shininess: 25 })); view.scene.add(body);
    const pool = new T.Mesh(h.cylG, h.mat('#fde68a', { shininess: 90 })); view.scene.add(pool);
    const wick = new T.Mesh(h.cylG, h.mat('#1f2937')); view.scene.add(wick);
    const drips = [0, 2.1, 4.2].map((a, i) => { const m = new T.Mesh(h.sphereG, h.mat('#fef3c7', { shininess: 25 })); view.scene.add(m); return { m, a, i }; });
    const flameOut = new T.Mesh(h.sphereG, view.mat('#fb923c', { emissive: '#ea580c', opacity: 0.92, shininess: 10 })); view.scene.add(flameOut);
    const flameIn = new T.Mesh(h.sphereG, view.mat('#fde047', { emissive: '#facc15', shininess: 10 })); view.scene.add(flameIn);
    const halo = new T.Mesh(h.sphereG, view.mat('#fef08a', { opacity: 0.2, emissive: '#facc15', shininess: 5 })); view.scene.add(halo);
    const rays = [];
    const rayGeo = new T.CylinderGeometry(0.03, 0.03, 0.55, 6);
    for (let i = 0; i < 10; i++) {
      const m = new T.Mesh(rayGeo, view.mat('#fde047', { opacity: 0.9, emissive: '#fde047', shininess: 5 }));
      const th = i * 2.399, ph = Math.acos(1 - 2 * (i + 0.5) / 10);
      const dir = new T.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph) * 0.5, Math.sin(ph) * Math.sin(th)).normalize();
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir); view.scene.add(m);
      rays.push({ m, dir, i });
    }
    // molecules
    const drift = (name, sc, x0, y0, x1, y1, z, per, dl) => { const g = h.molecule(name); g.scale.setScalar(sc); return { g, x0, y0, x1, y1, z, per, dl, sc }; };
    const O2s = [drift('O2', 0.8, -4.3, 1.0, -0.7, 0, -0.6, 3, 0), drift('O2', 0.8, -4.3, 1.9, -0.7, 0, 0.8, 3, 1.5), drift('O2', 0.8, 4.3, 1.0, 0.7, 0, 0.7, 3, 0.8), drift('O2', 0.8, 4.3, 1.9, 0.7, 0, -0.8, 3, 2.3)];
    const outs = [drift('CO2', 0.85, 0.2, 0, 2.9, 2.0, 0.5, 3.4, 0.3), drift('CO2', 0.85, -0.2, 0, -2.9, 2.0, -0.5, 3.4, 1.9),
      drift('H2O', 0.95, 0.2, 0, 3.3, 1.3, -0.6, 3.4, 1.1), drift('H2O', 0.95, -0.2, 0, -3.3, 1.3, 0.6, 3.4, 2.6)];
    view.label('O₂ in', [-3.2, 0.2, 0.6], { size: 0.85, color: '#dc2626', fontSize: 56 });
    view.label('CO₂ + H₂O out', [2.4, 4.5, 0], { size: 0.8, color: '#334155', fontSize: 42 });
    h.overlay('top:4px;left:6px;font-size:11px;color:#334155;background:rgba(255,255,255,.72);border-radius:8px;padding:2px 7px',
      '<div>wax + O₂ → CO₂ + H₂O + energy</div><div style="color:#dc2626">exothermic: heat + light out</div>');
    view.run((t) => {
      const c = (t % 12) / 12;
      const H = H0 - 0.5 * Math.sin(Math.PI * c), top = 0.1 + H;
      body.scale.set(0.5, H, 0.5); body.position.y = 0.1 + H / 2;
      pool.scale.set(0.43, 0.06, 0.43); pool.position.y = top + 0.01;
      wick.scale.set(0.035, 0.32, 0.035); wick.position.y = top + 0.16;
      drips.forEach(d => { d.m.scale.set(0.09, 0.3, 0.09); d.m.position.set(0.49 * Math.cos(d.a), top - 0.2 - 0.12 * d.i, 0.49 * Math.sin(d.a)); });
      const fy = top + 0.62, fl = 1 + 0.09 * Math.sin(t * 17) + 0.06 * Math.sin(t * 29 + 1);
      flameOut.scale.set(0.23 * (2 - fl), 0.46 * fl, 0.23 * (2 - fl)); flameOut.position.set(0.02 * Math.sin(t * 9), fy, 0.02 * Math.cos(t * 7));
      flameIn.scale.set(0.11 * (2 - fl), 0.24 * fl, 0.11 * (2 - fl)); flameIn.position.set(flameOut.position.x, fy - 0.1, flameOut.position.z);
      const pu = 0.5 + 0.5 * Math.sin(t * 4.5);
      halo.scale.setScalar(0.95 + 0.25 * pu); halo.position.set(0, fy, 0); halo.material.opacity = 0.14 + 0.1 * pu;
      rays.forEach(r => {
        const b = 0.5 + 0.5 * Math.sin(t * 5 + r.i * 1.7);
        r.m.position.set(0, fy, 0).addScaledVector(r.dir, 0.95 + 0.15 * b);
        r.m.material.opacity = 0.25 + 0.7 * b;
      });
      O2s.forEach(o => {
        const f = ((t + o.dl) / o.per) % 1, e = ss(f, 0, 1);
        o.g.position.set(lerp(o.x0, o.x1, f), lerp(o.y0, fy - 0.2, e) + 0.1 * Math.sin(t * 2 + o.dl), o.z * (1 - 0.7 * f));
        o.g.scale.setScalar(o.sc * Math.max(0.001, ss(f, 0, 0.15) * (1 - ss(f, 0.82, 1))));
        o.g.rotation.z = t * 0.9 + o.dl; o.g.rotation.y = t * 0.6;
      });
      outs.forEach(o => {
        const f = ((t + o.dl) / o.per) % 1;
        o.g.position.set(lerp(o.x0, o.x1, f), lerp(fy + 0.35, fy + 0.35 + 1.2 + o.y1 * 0.25, f) + 0.12 * Math.sin(t * 2 + o.dl), o.z * (0.3 + 0.7 * f));
        o.g.scale.setScalar(o.sc * Math.max(0.001, ss(f, 0, 0.15) * (1 - ss(f, 0.82, 1))));
        o.g.rotation.z = t * 0.5 + o.dl; o.g.rotation.y = -t * 0.7;
      });
    });
  }));

  // @@STEPS@@

  // Re-issued wording for the two steps whose 3D picture differs from the flat one (null = keep existing).
  addTutorialExplanations('chemistry', 'reactions', [
    {
      explain: '<p>Drag the 3D picture to turn it. Under <b>Reactants</b> are two hydrogen molecules (pale <b>hydrogen atoms</b> in bonded pairs) and one oxygen molecule (two red <b>oxygen atoms</b> with a double bond). The atoms swing across, the old bonds fade, new bonds appear, and two bent <b>water</b> molecules form.</p><p>Notice that both sides say 4 H + 2 O.</p>',
      say: 'This picture is three dimensional, so you can drag it to turn it around. Under reactants, the small pale atoms are hydrogen, joined in pairs. The two bigger red atoms are oxygen, joined to each other. Now watch. The atoms swing across to the products side. The old bonds fade, and the message says bonds break. Then new bonds appear, and each red oxygen atom ends up holding two hydrogen atoms. That makes two bent water molecules. Now count the atoms under each heading. Four hydrogen and two oxygen on both sides. Nothing was created or destroyed. The atoms only changed partners.'
    },
    {
      explain: '<p>Choose <b>Water</b>, <b>Methane</b> or <b>Ammonia</b> at the top left, then press the − and + buttons under the picture to change the big number in front of each formula. That many 3D molecules stand on the floor plates. The counter at the top shows each atom as <b>green with =</b> when the counts match and <b>red with ≠</b> when not. The plates turn green only when every atom balances.</p>',
      say: 'This one is yours to play with. At the top left, choose water, methane, or ammonia. Under the picture, each formula has a minus button and a plus button that change the big number in front of it. That number is called the coefficient. As you change it, that many molecules appear. Reactants stand on the left plate and products on the right. The counter at the top compares each kind of atom on both sides. A match turns green, and a mismatch turns red. When every atom matches, the plates turn green and the message says balanced. Change only the big numbers, never the small numbers inside a formula.'
    },
    null, null, null, null, null, null
  ]);

  scenes[3] = null;   // "Heat in, heat out" is an energy chart: keep the flat (2D) version
  addTutorialScenes3D('chemistry', 'reactions', scenes);
})();
