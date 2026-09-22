(function () {
  // 3D scenes for chemistry/periodic: addTutorialScenes3D('chemistry', 'periodic', [...8 scenes...]).

  // ---------------------------------------------------------------------------------
  // Shared data + helpers (all local to this file)
  // ---------------------------------------------------------------------------------
  // [Z, symbol, group, period, class m=metal / l=metalloid / n=nonmetal (g = noble gas), name]
  const PER_EL = [
    [1, 'H', 1, 1, 'n', 'Hydrogen'], [2, 'He', 18, 1, 'g', 'Helium'],
    [3, 'Li', 1, 2, 'm', 'Lithium'], [4, 'Be', 2, 2, 'm', 'Beryllium'], [5, 'B', 13, 2, 'l', 'Boron'],
    [6, 'C', 14, 2, 'n', 'Carbon'], [7, 'N', 15, 2, 'n', 'Nitrogen'], [8, 'O', 16, 2, 'n', 'Oxygen'],
    [9, 'F', 17, 2, 'n', 'Fluorine'], [10, 'Ne', 18, 2, 'g', 'Neon'],
    [11, 'Na', 1, 3, 'm', 'Sodium'], [12, 'Mg', 2, 3, 'm', 'Magnesium'], [13, 'Al', 13, 3, 'm', 'Aluminum'],
    [14, 'Si', 14, 3, 'l', 'Silicon'], [15, 'P', 15, 3, 'n', 'Phosphorus'], [16, 'S', 16, 3, 'n', 'Sulfur'],
    [17, 'Cl', 17, 3, 'n', 'Chlorine'], [18, 'Ar', 18, 3, 'g', 'Argon'],
    [19, 'K', 1, 4, 'm', 'Potassium'], [20, 'Ca', 2, 4, 'm', 'Calcium']
  ].map(a => ({ z: a[0], sym: a[1], g: a[2], p: a[3], cls: a[4], name: a[5] }));

  const GROUPS = [1, 2, 13, 14, 15, 16, 17, 18];
  const PITCH = 1.14;                                    // tile spacing
  const GX = { 1: 0, 2: 1, 13: 3.05, 14: 4.05, 15: 5.05, 16: 6.05, 17: 7.05, 18: 8.05 };   // column slots; 3-12 gap sits between 2 and 13
  const TILE_H = 0.4;
  const easeOutBack = x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const tilePos = (e, rows) => [(GX[e.g] - 4.025) * PITCH, ((e.p - 1) - (rows - 1) / 2) * PITCH];

  // Slow left-right sway of the camera (instead of a full spin, so the lettering stays readable). Works with dragging.
  function sway(view, amp, speed) {
    view.run((t, dt) => { view.cam.yaw += amp * speed * Math.cos(t * speed) * dt; });
  }

  // Keep the whole picture in frame on narrow canvases (phones): the scene distance is authored for a ~1.7:1 canvas and is
  // pulled back when the canvas is narrower than that.
  function fit(view, need) {
    const base = view.cam.distance;
    let last = 0;
    view.run(() => {
      const a = view.camera.aspect;
      if (a !== last) { last = a; view.setCamera({ distance: base * Math.max(1, need / a) }); }
    });
  }

  // Wide text sprite. Text is auto-shrunk to fit; sprite is 8h x h world units. sprite.userData.set(text, color).
  function banner(view, text, pos, o) {
    o = o || {};
    const h = o.h || 0.8;
    const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.renderOrder = 999;
    sp.scale.set(8 * h, h, 1);
    function draw(t, col) {
      col = col || o.color || '#1f2937';
      g.clearRect(0, 0, 1024, 128);
      let px = o.px || 76;
      const font = s => (o.bold === false ? '600 ' : '800 ') + s + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      g.font = font(px);
      while (g.measureText(t).width > 990 && px > 20) { px -= 2; g.font = font(px); }
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const w = g.measureText(t).width;
      if (o.bg) {
        g.fillStyle = o.bg; const x = 512 - w / 2 - 20;
        g.beginPath(); if (g.roundRect) g.roundRect(x, 14, w + 40, 100, 30); else g.rect(x, 14, w + 40, 100); g.fill();
      }
      if (!o.bg && o.outline !== false) {
        g.lineWidth = 10; g.lineJoin = 'round';
        g.strokeStyle = o.outline || 'rgba(255,255,255,0.92)';
        g.strokeText(t, 512, 68);
      }
      g.fillStyle = col; g.fillText(t, 512, 68);
      tex.needsUpdate = true;
    }
    draw(String(text));
    sp.userData.set = (t, col) => draw(String(t), col);
    if (pos) sp.position.set(pos[0], pos[1], pos[2]);
    view.scene.add(sp);
    return sp;
  }

  // Shared geometries for periodic-table tiles (base of the block sits at y = 0 so it can "grow" upward).
  const TILE_BODY = new THREE.BoxGeometry(1, 1, 1); TILE_BODY.translate(0, 0.5, 0);
  const TILE_TOP = new THREE.PlaneGeometry(1, 1); TILE_TOP.rotateX(-Math.PI / 2);

  // One extruded 3D tile: a block with the atomic number + symbol printed on its top face.
  // t.k = height factor (0 = flat/hidden, 1 = full), t.lift = extra hover height, t.setColor(c), t.setGlow(c, amount)
  function makeTile(view, e, pos, o) {
    o = o || {};
    const size = o.size || 1, H = (o.h || TILE_H);
    const grp = new THREE.Group();
    grp.position.set(pos[0], 0, pos[1]);
    const mat = view.mat(o.color || '#c7d2fe', { shininess: 60, specular: '#666666' });
    const body = new THREE.Mesh(TILE_BODY, mat);
    body.scale.set(size * 0.98, H, size * 0.98);
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const g = c.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1e293b';
    if (o.number !== false) { g.font = '700 30px -apple-system, "Segoe UI", Roboto, sans-serif'; g.fillText(String(e.z), 64, 26); }
    g.font = '800 ' + (e.sym.length > 1 ? 66 : 74) + 'px -apple-system, "Segoe UI", Roboto, sans-serif';
    g.fillText(e.sym, 64, o.number === false ? 66 : 80);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    const top = new THREE.Mesh(TILE_TOP, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    top.scale.set(size * 0.92, 1, size * 0.92);
    grp.add(body, top);
    view.scene.add(grp);
    const t = {
      e, grp, body, mat, top, k: 1, lift: 0, base: pos, H, size,
      place() {
        const h = H * Math.max(t.k, 0.0001);
        body.scale.y = h;
        top.position.y = h + 0.012;
        top.visible = t.k > 0.08;
        grp.position.y = t.lift;
        grp.visible = t.k > 0.005;
      },
      setColor(col) { mat.color.set(col); },
      setGlow(col, a) { mat.emissive.set(col).multiplyScalar(a); }
    };
    t.place();
    return t;
  }

  // Dashed outline rectangle lying on the floor (x0..x1, z0..z1); returns the group.
  function dashedRect(view, x0, z0, x1, z1, col) {
    const grp = new THREE.Group();
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = view.mat(col || '#818cf8', { shininess: 10 });
    const dash = (cx, cz, lx, lz) => { const m = new THREE.Mesh(geo, mat); m.scale.set(lx, 0.05, lz); m.position.set(cx, 0.03, cz); grp.add(m); };
    const seg = (ax, az, bx, bz) => {
      const len = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.round(len / 0.42));
      for (let i = 0; i < n; i += 2) {
        const a = i / n, b = Math.min(1, (i + 1) / n);
        const px = ax + (bx - ax) * (a + b) / 2, pz = az + (bz - az) * (a + b) / 2;
        dash(px, pz, Math.abs(bx - ax) > 0 ? len * (b - a) : 0.07, Math.abs(bz - az) > 0 ? len * (b - a) : 0.07);
      }
    };
    seg(x0, z0, x1, z0); seg(x1, z0, x1, z1); seg(x1, z1, x0, z1); seg(x0, z1, x0, z0);
    view.scene.add(grp);
    return grp;
  }

  // Group/period header labels, table slab, and the marked 3-12 gap. Returns { gh: {group: sprite}, ph: {period: sprite}, gapLabel }.
  function tableFrame(view, rows) {
    const P = PITCH, zc = (rows - 1) / 2;
    const slab = view.box(10.7, 0.1, rows * P + 0.5, '#a5b4fc', { opacity: 0.32, pos: [0, -0.06, 0] });
    const zBack = -(zc * P) - 0.95;
    const gh = {}, ph = {};
    GROUPS.forEach(g => { gh[g] = banner(view, String(g), [(GX[g] - 4.025) * P, 0.15, zBack], { h: 0.62, px: 84, color: '#475569' }); });
    for (let p = 1; p <= rows; p++) ph[p] = banner(view, String(p), [-4.025 * P - 0.98, 0.15, ((p - 1) - zc) * P], { h: 0.62, px: 84, color: '#475569' });
    const gx0 = (1 - 4.025) * P + 0.58, gx1 = (3.05 - 4.025) * P - 0.58;
    const z0 = -(zc * P) - 0.5, z1 = zc * P + 0.5;
    dashedRect(view, gx0, z0, gx1, z1, '#818cf8');
    const gapLabel = banner(view, '3–12', [(gx0 + gx1) / 2, 0.15, zBack], { h: 0.62, px: 84, color: '#475569' });
    return { slab, gh, ph, gapLabel, zFront: z1, zBack };
  }

  // ---------------------------------------------------------------------------------
  // Step 1 — Elements in order
  // ---------------------------------------------------------------------------------
  const scene1 = Chem3D.define({ distance: 11.6, pitch: 0.95, yaw: 0.12, autoRotate: 0, target: [0, 0, 0.55] }, (view) => {
    const fr = tableFrame(view, 4);
    const tiles = PER_EL.map(e => makeTile(view, e, tilePos(e, 4), { color: '#c7d2fe' }));
    const cap = banner(view, '', [0, 0.2, fr.zFront + 0.85], { h: 0.95, color: '#4338ca' });
    const arrow = view.arrow([-3.4, 0.15, fr.zFront + 1.7], [3.4, 0.15, fr.zFront + 1.7], '#4f46e5', { width: 0.07, head: 0.6 });
    const DUR = 11, STEP = 0.35;
    sway(view, 0.22, 0.45);
    fit(view, 1.7);
    view.run((t) => {
      const c = t % DUR;
      let cur = 0;
      tiles.forEach(tl => {
        const t0 = (tl.e.z - 0.5) * STEP;
        let k = clamp01((c - t0) / 0.55);
        k = k > 0 ? Math.max(0.0001, easeOutBack(k)) : 0;
        if (c > 10.15) k *= 1 - clamp01((c - 10.15) / 0.8);
        tl.k = k;
        tl.lift = 0;
        const fresh = c >= t0 && c < t0 + 0.55 ? 1 - (c - t0) / 0.55 : 0;
        tl.setGlow('#f59e0b', fresh * 0.9);
        if (c >= t0) cur = tl.e.z;
        tl.place();
      });
      const done = c > 7.3;
      if (c < 7.3 && cur > 0) { cap.visible = true; cap.userData.set('Atomic number ' + cur + ' = ' + cur + (cur === 1 ? ' proton' : ' protons'), '#4338ca'); }
      else if (done && c < 10.15) { cap.visible = true; cap.userData.set('Increasing atomic number = more protons', '#4338ca'); }
      else cap.visible = false;
      arrow.visible = done && c < 10.15;
    });
  });

  // ---------------------------------------------------------------------------------
  // Step 2 — Groups (columns) and periods (rows)
  // ---------------------------------------------------------------------------------
  const C_AMBER = new THREE.Color('#fbbf24'), C_IDLE = new THREE.Color('#c7d2fe');
  const scene2 = Chem3D.define({ distance: 11.6, pitch: 0.95, yaw: 0.12, autoRotate: 0, target: [0, 0, 0.55] }, (view, ctx) => {
    const fr = tableFrame(view, 4);
    const tiles = PER_EL.map(e => makeTile(view, e, tilePos(e, 4), { color: '#c7d2fe' }));
    const hot = {};   // highlighted header sprites (orange pill), shown for the chosen group / period
    GROUPS.forEach(g => { hot['g' + g] = banner(view, String(g), [(GX[g] - 4.025) * PITCH, 0.4, fr.zBack], { h: 0.85, px: 84, color: '#ffffff', bg: '#d97706' }); });
    for (let p = 1; p <= 4; p++) hot['p' + p] = banner(view, String(p), [-4.025 * PITCH - 0.98, 0.4, (p - 2.5) * PITCH], { h: 0.85, px: 84, color: '#ffffff', bg: '#d97706' });
    const cap1 = banner(view, '', [0, 0.2, fr.zFront + 0.85], { h: 0.95, color: '#b45309' });
    const cap2 = banner(view, '', [0, 0.2, fr.zFront + 1.75], { h: 0.85, color: '#1e293b', bold: false });
    // glowing translucent band around the chosen column / row
    const band = view.box(1, 1, 1, '#fbbf24', { opacity: 0.3, emissive: '#f59e0b' });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center"><button class="scene-btn" id="per2-bg" type="button">Columns (groups)</button><button class="scene-btn" id="per2-bp" type="button">Rows (periods)</button></div>');
    const bg = row.querySelector('#per2-bg'), bp = row.querySelector('#per2-bp');
    let mode = 'g', idx = 0, timer = 0, sel = [];
    function paint() {
      const gv = GROUPS[idx % GROUPS.length], pv = (idx % 4) + 1;
      sel = tiles.map(tl => (mode === 'g' ? tl.e.g === gv : tl.e.p === pv));
      const inSel = tiles.filter((tl, i) => sel[i]);
      const xs = inSel.map(tl => tl.base[0]), zs = inSel.map(tl => tl.base[1]);
      const x0 = Math.min(...xs) - 0.62, x1 = Math.max(...xs) + 0.62, z0 = Math.min(...zs) - 0.62, z1 = Math.max(...zs) + 0.62;
      band.scale.set(x1 - x0, 1.5, z1 - z0);
      band.position.set((x0 + x1) / 2, 0.7, (z0 + z1) / 2);
      Object.keys(hot).forEach(k => { hot[k].visible = mode === 'g' ? k === 'g' + gv : k === 'p' + pv; });
      GROUPS.forEach(g => { fr.gh[g].visible = !(mode === 'g' && g === gv); });
      for (let p = 1; p <= 4; p++) fr.ph[p].visible = !(mode === 'p' && p === pv);
      if (mode === 'g') {
        cap1.userData.set('Group ' + gv + ' (a column)', '#b45309');
        cap2.userData.set(gv === 1 ? '1 outer electron each' : gv === 2 ? '2 outer electrons each' : gv === 18 ? 'full outer shell' : (gv - 10) + ' outer electrons each');
      } else {
        cap1.userData.set('Period ' + pv + ' (a row)', '#b45309');
        cap2.userData.set(pv + (pv === 1 ? ' electron shell' : ' electron shells'));
      }
    }
    function setMode(m) {
      mode = m; idx = 0; timer = 0; paint();
      bg.style.borderColor = m === 'g' ? 'var(--primary)' : '';
      bp.style.borderColor = m === 'p' ? 'var(--primary)' : '';
    }
    bg.addEventListener('click', () => setMode('g'));
    bp.addEventListener('click', () => setMode('p'));
    setMode('g');
    sway(view, 0.22, 0.45);
    fit(view, 1.7);
    view.run((t, dt) => {
      timer += dt;
      if (timer > 2.0) { timer = 0; idx++; paint(); }
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);
      tiles.forEach((tl, i) => {
        const on = sel[i];
        tl.lift += ((on ? 0.75 + 0.1 * Math.sin(t * 4 + i) : 0) - tl.lift) * Math.min(1, dt * 8);
        tl.mat.color.lerp(on ? C_AMBER : C_IDLE, Math.min(1, dt * 8) || 1);
        tl.setGlow('#f59e0b', on ? 0.35 + 0.35 * pulse : 0);
        tl.place();
      });
      band.material.opacity = 0.18 + 0.16 * pulse;
    });
  });

  // ---------------------------------------------------------------------------------
  // Step 3 — Metals, metalloids, nonmetals colour in phase by phase
  // ---------------------------------------------------------------------------------
  const CLS_FILL = { m: '#60a5fa', l: '#fde047', n: '#5eead4', g: '#5eead4' };   // noble gases are nonmetals here
  const scene3 = Chem3D.define({ distance: 12.6, pitch: 0.95, yaw: 0.12, autoRotate: 0, target: [0, 0, 0.75] }, (view) => {
    const fr = tableFrame(view, 4);
    const GREY = new THREE.Color('#d1d5db');
    const tiles = PER_EL.map(e => makeTile(view, e, tilePos(e, 4), { color: '#d1d5db' }));
    const target = tiles.map(() => new THREE.Color('#d1d5db'));
    // thick dark frames under the two metalloids
    const frames = tiles.filter(tl => tl.e.cls === 'l').map(tl => {
      const f = view.box(1.14, 0.07, 1.14, '#92400e', { pos: [tl.base[0], 0.035, tl.base[1]] });
      f.visible = false; f.userData.tile = tl; return f;
    });
    const cap = banner(view, '', [0, 0.2, fr.zFront + 0.75], { h: 0.9, color: '#4338ca' });
    const legend = [['m', 'Metals', -4.1], ['l', 'Metalloids', -1.1], ['n', 'Nonmetals', 2.1]].map(a => {
      const blk = view.box(0.6, 0.3, 0.6, CLS_FILL[a[0]], { pos: [a[2], 0.15, fr.zFront + 1.75] });
      const lab = banner(view, a[1], [a[2] + 1.6, 0.2, fr.zFront + 1.75], { h: 0.75, color: '#1e293b' });
      return { blk, lab };
    });
    const hArrow = view.arrow([tiles[0].base[0], 2.1, tiles[0].base[1]], [tiles[0].base[0], 1.0, tiles[0].base[1]], '#f97316', { width: 0.07, head: 0.4 });
    hArrow.visible = false;
    const CAPS = ['', 'Metals: left and middle', 'Metalloids: the staircase (B, Si)', 'Nonmetals: right side (+ H)'];
    const starts = [0, 1.2, 3.4, 5.6], LOOP = 9.5;
    let phase = -1, phaseT = 0;
    sway(view, 0.22, 0.45);
    fit(view, 1.7);
    view.run((t, dt) => {
      const c = t % LOOP;
      let ph = 0;
      starts.forEach((s, i) => { if (c >= s) ph = i; });
      if (ph !== phase) {
        phase = ph; phaseT = c - starts[ph];
        cap.visible = !!CAPS[ph]; if (CAPS[ph]) cap.userData.set(CAPS[ph], '#4338ca');
        tiles.forEach((tl, i) => {
          const e = tl.e, show = (e.cls === 'm' && ph >= 1) || (e.cls === 'l' && ph >= 2) || ((e.cls === 'n' || e.cls === 'g') && ph >= 3);
          target[i].set(show ? CLS_FILL[e.cls] : '#d1d5db');
        });
        frames.forEach(f => { f.visible = ph >= 2; });
        hArrow.visible = ph >= 3;
      }
      phaseT = c - starts[ph];
      const kk = Math.min(1, dt * 6) || 1;
      tiles.forEach((tl, i) => {
        tl.mat.color.lerp(target[i], kk);
        const e = tl.e, active = (e.cls === 'm' && ph === 1) || (e.cls === 'l' && ph === 2) || ((e.cls === 'n' || e.cls === 'g') && ph === 3);
        const pop = active && phaseT < 0.9 ? Math.sin(phaseT / 0.9 * Math.PI) : 0;
        tl.k = 1 + pop * 1.2 + (e.cls === 'l' && ph >= 2 ? 0.6 : 0);
        tl.lift = 0;
        tl.setGlow('#f59e0b', e.cls === 'l' && ph >= 2 ? 0.25 + 0.15 * Math.sin(t * 4) : pop * 0.4);
        tl.place();
      });
      hArrow.position.y = 0.15 * Math.sin(t * 5);
    });
  });

  // ---------------------------------------------------------------------------------
  // Step 4 — Try it: valence electrons by group (period-3 atoms Na ... Ar as 3D atoms)
  // ---------------------------------------------------------------------------------
  const VAL_DATA = [
    [1, 'Na', 'Sodium', 1, 'Alkali metal', 'Loses 1 electron easily', 'very reactive'],
    [2, 'Mg', 'Magnesium', 2, 'Alkaline earth metal', 'Loses 2 electrons', 'reactive'],
    [13, 'Al', 'Aluminum', 3, 'Metal', 'Can lose 3 electrons', 'reactive'],
    [14, 'Si', 'Silicon', 4, 'Metalloid', 'Shares its 4 outer', 'electrons with others'],
    [15, 'P', 'Phosphorus', 5, 'Nonmetal', 'Needs 3 more electrons', 'to fill its shell'],
    [16, 'S', 'Sulfur', 6, 'Nonmetal', 'Needs 2 more electrons', 'to fill its shell'],
    [17, 'Cl', 'Chlorine', 7, 'Halogen', 'Needs 1 more electron', 'very reactive'],
    [18, 'Ar', 'Argon', 8, 'Noble gas', 'Full outer shell', 'very unreactive']
  ];
  const scene4 = Chem3D.define({ distance: 11.2, pitch: 0.28, yaw: 0.3, autoRotate: 0, target: [0, 0.1, 0] }, (view, ctx) => {
    const AX = -3.05, TX = 3.25;
    const atomG = new THREE.Group(); atomG.position.set(AX, 0.2, 0); view.scene.add(atomG);
    const nucleus = view.sphere(0.66, view.color('Na'), { shininess: 90 });
    view.scene.remove(nucleus); atomG.add(nucleus);
    const nlabel = banner(view, 'Na', [0, 0, 0], { h: 0.8, px: 90, color: '#111827' });
    view.scene.remove(nlabel); atomG.add(nlabel);
    const RAD = [1.05, 1.65, 2.3], TILT = [[0.3, -1.1, 0], [-0.9, 0.5, 0.3], [0.55, 0.15, 0]];
    const shells = RAD.map((r, i) => {
      const g = new THREE.Group(); g.rotation.set(...TILT[i]);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, i === 2 ? 0.032 : 0.018, 10, 96), view.mat(i === 2 ? '#f97316' : '#94a3b8', { opacity: i === 2 ? 0.9 : 0.75, shininess: 20 }));
      g.add(ring); atomG.add(g); return g;
    });
    const mkE = (shell, col, r, emissive) => { const m = view.sphere(r, col, { shininess: 90 }); if (emissive) m.material.emissive.set(emissive); view.scene.remove(m); shells[shell].add(m); return m; };
    const eA = [0, 1].map(() => mkE(0, '#64748b', 0.13));
    const eB = Array.from({ length: 8 }, () => mkE(1, '#64748b', 0.13));
    const eC = Array.from({ length: 8 }, () => mkE(2, '#f97316', 0.2, '#c2410c'));
    const tCls = banner(view, '', [TX, 1.6, 0], { h: 0.8, color: '#4338ca' });
    const tGrp = banner(view, '', [TX, 2.5, 0], { h: 1.05, color: '#1e293b' });
    const tEl = banner(view, '', [TX, 0.8, 0], { h: 0.66, color: '#475569', bold: false });
    const tVal = banner(view, '', [TX, -0.15, 0], { h: 0.92, color: '#ea580c' });
    const tL1 = banner(view, '', [TX, -1.1, 0], { h: 0.74, color: '#1e293b', bold: false });
    const tL2 = banner(view, '', [TX, -1.85, 0], { h: 0.74, color: '#1e293b' });
    const row = ctx.controls('<div class="scene-slider-row"><span>Group</span><input id="per4-slider" type="range" min="0" max="7" step="1" value="0" aria-label="Group number"><span id="per4-val2" style="min-width:2.5ch">1</span></div>');
    const slider = row.querySelector('#per4-slider'), val2 = row.querySelector('#per4-val2');
    let nVal = 1, T = 0;
    function update() {
      const d = VAL_DATA[+slider.value];
      val2.textContent = d[0];
      nucleus.material.color.set(view.color(d[1]));
      nlabel.userData.set(d[1]);
      tGrp.userData.set('Group ' + d[0]);
      tCls.userData.set(d[4]);
      tEl.userData.set('shown: ' + d[2] + ' (period 3)');
      tVal.userData.set('Valence electrons: ' + d[3]);
      tL1.userData.set(d[5]);
      tL2.userData.set(d[6]);
      nVal = d[3];
      eC.forEach((m, i) => { m.visible = i < nVal; });
      orbit(T);
    }
    function orbit(t) {
      eA.forEach((m, i) => { const a = t * 1.6 + i * Math.PI; m.position.set(Math.cos(a) * RAD[0], Math.sin(a) * RAD[0], 0); });
      eB.forEach((m, i) => { const a = -t * 1.0 + i * Math.PI / 4; m.position.set(Math.cos(a) * RAD[1], Math.sin(a) * RAD[1], 0); });
      eC.forEach((m, i) => { const a = t * 0.6 + i * 2 * Math.PI / Math.max(1, nVal); m.position.set(Math.cos(a) * RAD[2], Math.sin(a) * RAD[2], 0); });
    }
    slider.addEventListener('input', update);
    update();
    sway(view, 0.3, 0.4);
    fit(view, 1.7);
    view.run((t) => {
      T = t; orbit(t);
      shells[0].rotation.y = TILT[0][1] + 0.25 * Math.sin(t * 0.5);
      shells[1].rotation.x = TILT[1][0] + 0.2 * Math.sin(t * 0.4 + 1);
      shells[2].rotation.y = TILT[2][1] + 0.18 * Math.sin(t * 0.45 + 2);
    });
  });

  // ---------------------------------------------------------------------------------
  // Step 5 — Reactivity trend: alkali metals in water (Li steady fizz, Na faster, K lilac flame)
  // ---------------------------------------------------------------------------------
  const scene5 = Chem3D.define({ distance: 12, pitch: 0.36, yaw: 0.14, autoRotate: 0, target: [0, 0.9, 0.3] }, (view) => {
    const TW = 3.15, TD = 2.2, WATER_Y = 0.95;
    view.box(12.6, 0.1, 3.6, '#cbd5e1', { opacity: 0.4, pos: [0, -0.06, 0] });
    const CONE = new THREE.ConeGeometry(1, 1, 14); CONE.translate(0, 0.5, 0);
    const RING = new THREE.TorusGeometry(1, 0.025, 8, 48); RING.rotateX(Math.PI / 2);
    const SPECS = [
      { x: -4.05, sym: 'Li', name: 'Lithium (Li)', note: 'steady fizz', ax: 0.55, az: 0.35, w: 1.5, bubbles: 3, flame: false, col: '#cbd5e1' },
      { x: 0, sym: 'Na', name: 'Sodium (Na)', note: 'fast fizz', ax: 1.0, az: 0.55, w: 3.9, bubbles: 6, flame: false, col: '#cbd5e1' },
      { x: 4.05, sym: 'K', name: 'Potassium (K)', note: 'lilac flame!', ax: 1.15, az: 0.7, w: 7.0, bubbles: 10, flame: true, col: '#cbd5e1' }
    ];
    const troughs = SPECS.map((s, ti) => {
      // glass trough: base + four glass walls + translucent water
      view.box(TW, 0.1, TD, '#94a3b8', { pos: [s.x, 0.05, 0] });
      const wallMat = { opacity: 0.25, shininess: 120, specular: '#ffffff' };
      view.box(TW, 1.2, 0.06, '#dbeafe', Object.assign({ pos: [s.x, 0.65, TD / 2] }, wallMat));
      view.box(TW, 1.2, 0.06, '#dbeafe', Object.assign({ pos: [s.x, 0.65, -TD / 2] }, wallMat));
      view.box(0.06, 1.2, TD, '#dbeafe', Object.assign({ pos: [s.x - TW / 2, 0.65, 0] }, wallMat));
      view.box(0.06, 1.2, TD, '#dbeafe', Object.assign({ pos: [s.x + TW / 2, 0.65, 0] }, wallMat));
      const water = view.box(TW - 0.1, WATER_Y - 0.1, TD - 0.1, '#60a5fa', { opacity: 0.5, pos: [s.x, 0.1 + (WATER_Y - 0.1) / 2, 0] });
      water.material.emissive.set('#1e40af').multiplyScalar(0.15);
      // the metal piece + symbol
      const piece = view.sphere(0.34, s.col, { shininess: 120, specular: '#ffffff' });
      const tag = banner(view, s.sym, [0, 0, 0], { h: 0.6, px: 90, color: '#1e293b' });
      // hydrogen bubbles
      const bubbles = [];
      for (let i = 0; i < s.bubbles; i++) bubbles.push(view.sphere(0.12 + 0.025 * (i % 3), '#ffffff', { opacity: 0.85, shininess: 100 }));
      // ripples on the water surface
      const rings = [0, 1].map(() => { const m = new THREE.Mesh(RING, view.mat('#e0f2fe', { opacity: 0.8, shininess: 20 })); view.scene.add(m); return m; });
      // lilac flame (potassium only)
      let flame = null;
      if (s.flame) {
        flame = new THREE.Group();
        const mk = (col, em, op) => { const m = new THREE.Mesh(CONE, view.mat(col, { opacity: op, shininess: 10 })); m.material.emissive.set(em); return m; };
        const outer = [0, 1, 2].map(k => { const m = mk('#c084fc', '#a855f7', 0.8); flame.add(m); return m; });
        const inner = mk('#fde68a', '#f59e0b', 0.95); flame.add(inner);
        flame.userData = { outer, inner };
        view.scene.add(flame);
      }
      // labels under the trough
      banner(view, s.name, [s.x, -0.55, 1.65], { h: 0.85, color: '#1e293b' });
      banner(view, s.note, [s.x, -1.4, 1.65], { h: 0.72, color: s.flame ? '#7e22ce' : '#475569', bold: s.flame });
      return { s, piece, tag, bubbles, rings, flame };
    });
    // the reactivity arrow: Li -> Na -> K
    banner(view, 'Li → Na → K: more and more reactive', [0, 4.4, 0], { h: 1.0, color: '#4338ca' });
    view.arrow([-4.4, 3.6, 0], [4.4, 3.6, 0], '#4f46e5', { width: 0.08, head: 0.6 });
    sway(view, 0.2, 0.4);
    fit(view, 1.7);
    view.run((t) => {
      troughs.forEach((tr, ti) => {
        const s = tr.s, w = s.w;
        let px = s.x + s.ax * Math.sin(w * t), pz = s.az * Math.sin(w * 1.31 * t + ti);
        if (s.flame) { px += 0.25 * Math.sin(w * 2.3 * t); pz += 0.2 * Math.cos(w * 1.9 * t); }
        const py = WATER_Y + 0.16 + 0.03 * Math.sin(t * 6 + ti);
        tr.piece.position.set(px, py, pz);
        tr.piece.rotation.y = t * 2; tr.piece.rotation.x = t * 1.3;
        tr.tag.position.set(px, py + 0.02, pz);
        tr.bubbles.forEach((b, i) => {
          const d = 0.9 + (i % 4) * 0.25, u = (((t + i * 0.17) / d) % 1 + 1) % 1;
          const rise = 1.0 + (i % 3) * 0.35;
          b.position.set(px + ((i % 5) - 2) * 0.12 + 0.1 * Math.sin(u * 9 + i), py + 0.25 + u * rise, pz + ((i % 3) - 1) * 0.14);
          b.material.opacity = 0.9 * Math.sin(u * Math.PI);
          b.visible = b.material.opacity > 0.03;
        });
        tr.rings.forEach((r, k) => {
          const per = ti === 0 ? 2.2 : ti === 1 ? 1.1 : 0.7, u = (((t / per) + k * 0.5) % 1 + 1) % 1;
          r.position.set(px, WATER_Y + 0.03, pz);
          r.scale.setScalar(0.25 + u * (0.5 + ti * 0.25));
          r.material.opacity = 0.7 * (1 - u);
        });
        if (tr.flame) {
          const f = tr.flame, o = f.userData.outer, inn = f.userData.inner;
          f.position.set(px, py + 0.2, pz);
          o.forEach((m, k) => {
            const fl = 0.75 + 0.35 * Math.sin(t * 17 + k * 2.1) + 0.15 * Math.sin(t * 31 + k);
            m.scale.set(0.3 + 0.06 * Math.sin(t * 13 + k), 0.9 * fl, 0.3);
            m.position.set((k - 1) * 0.1 + 0.06 * Math.sin(t * 9 + k), 0, 0.06 * Math.cos(t * 11 + k));
            m.rotation.z = 0.15 * (k - 1) + 0.12 * Math.sin(t * 12 + k); m.rotation.x = 0.1 * Math.cos(t * 10 + k);
          });
          inn.scale.set(0.16, 0.55 * (0.8 + 0.3 * Math.sin(t * 21)), 0.16);
        }
      });
    });
  });

  // ---------------------------------------------------------------------------------
  // Step 6 — Real life: helium balloons and a neon sign (noble gases, full shells)
  // ---------------------------------------------------------------------------------
  const scene6 = Chem3D.define({ distance: 11.8, pitch: 0.16, yaw: 0.16, autoRotate: 0, target: [0.1, 0.55, 0] }, (view) => {
    view.box(12.2, 0.1, 4.6, '#cbd5e1', { opacity: 0.35, pos: [0, -0.06, 0.3] });
    // ---- helium balloons (left) ----
    const HOLD = [-3.85, 0.12, -1.0];
    view.box(0.5, 0.24, 0.5, '#64748b', { pos: HOLD });
    const BAL = [
      { c: '#ef4444', p: [-4.6, 2.35, -0.65] }, { c: '#3b82f6', p: [-3.1, 2.5, -1.35] }, { c: '#facc15', p: [-3.85, 3.35, -1.0] }
    ];
    const balloons = BAL.map((b, i) => {
      const body = view.sphere(1, b.c, { shininess: 130, specular: '#ffffff' });
      body.scale.set(0.72, 0.9, 0.72);
      const knot = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 10), view.mat(b.c)); knot.rotation.x = Math.PI; view.scene.add(knot);
      const str = view.cylinder([0, 0, 0], [0, 1, 0], 0.017, '#475569');
      return { body, knot, str, b, i };
    });
    banner(view, 'Helium (He)', [-3.85, -0.75, -0.1], { h: 0.85, color: '#1e293b' });
    // ---- helium atom (middle) ----
    const AC = new THREE.Group(); AC.position.set(0.15, 1.55, 0); view.scene.add(AC);
    const nuc = view.sphere(0.5, '#f97316', { shininess: 90 }); view.scene.remove(nuc); AC.add(nuc);
    const nlab = banner(view, 'He', [0, 0, 0], { h: 0.72, px: 90, color: '#ffffff', outline: 'rgba(124,45,18,0.9)' });
    view.scene.remove(nlab); AC.add(nlab);
    const DASH = new THREE.BoxGeometry(0.2, 0.045, 0.045), DASHMAT = view.mat('#94a3b8', { shininess: 10 });
    const RADI = 1.4, orbits = [[0.35, 0, 0.25], [-0.95, 0.7, 0]].map((rot, k) => {
      const g = new THREE.Group(); g.rotation.set(...rot); AC.add(g);
      for (let j = 0; j < 30; j += 2) { const a = j / 30 * Math.PI * 2; const m = new THREE.Mesh(DASH, DASHMAT); m.position.set(Math.cos(a) * RADI, 0, Math.sin(a) * RADI); m.rotation.y = -a + Math.PI / 2; g.add(m); }
      const e = view.sphere(0.17, '#3b82f6', { shininess: 100 }); e.material.emissive.set('#1d4ed8').multiplyScalar(0.4); view.scene.remove(e); g.add(e);
      return { g, e, k };
    });
    banner(view, '2 electrons: shell full', [0.15, 3.55, 0], { h: 0.72, color: '#1e293b' });
    banner(view, 'helium atom', [0.15, -0.55, 0.4], { h: 0.66, color: '#475569', bold: false });
    // ---- neon tube (right) ----
    const NG = new THREE.Group(); NG.position.set(3.95, 0.6, 1.0); view.scene.add(NG);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.75, 0.35, 0.2), new THREE.Vector3(-1.2, 1.9, 0.35), new THREE.Vector3(-0.45, 2.05, -0.25), new THREE.Vector3(-0.3, 0.7, -0.4),
      new THREE.Vector3(0.45, 0.3, 0.1), new THREE.Vector3(0.8, 1.6, 0.4), new THREE.Vector3(1.4, 2.15, 0), new THREE.Vector3(1.75, 1.2, -0.3)
    ]);
    const tubeCore = new THREE.Mesh(new THREE.TubeGeometry(curve, 140, 0.16, 12, false), view.mat('#f97316', { shininess: 30 }));
    tubeCore.material.emissive.set('#f97316').multiplyScalar(0.8);
    const tubeHi = new THREE.Mesh(new THREE.TubeGeometry(curve, 140, 0.06, 8, false), view.mat('#fed7aa', { shininess: 10 }));
    tubeHi.material.emissive.set('#fed7aa').multiplyScalar(0.7);
    const tubeGlow = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.4, 10, false), view.mat('#fb923c', { opacity: 0.25, shininess: 5 }));
    NG.add(tubeGlow, tubeCore, tubeHi);
    const capA = view.box(0.34, 0.3, 0.34, '#1e293b'); view.scene.remove(capA); capA.position.copy(curve.getPoint(0)).add(new THREE.Vector3(0, -0.2, 0)); NG.add(capA);
    const capB = view.box(0.34, 0.3, 0.34, '#1e293b'); view.scene.remove(capB); capB.position.copy(curve.getPoint(1)).add(new THREE.Vector3(0, -0.2, 0)); NG.add(capB);
    const sparks = [0, 1, 2].map(() => { const m = view.sphere(0.1, '#ffffff', { shininess: 10 }); m.material.emissive.set('#ffffff'); view.scene.remove(m); NG.add(m); return m; });
    banner(view, 'Neon (Ne)', [4.1, -0.75, 1.1], { h: 0.85, color: '#1e293b' });
    banner(view, 'Group 18: full outer shell,', [0, -1.95, 0.3], { h: 0.85, color: '#4338ca' });
    banner(view, 'so they rarely react', [0, -2.7, 0.3], { h: 0.85, color: '#4338ca' });
    sway(view, 0.22, 0.4);
    fit(view, 1.7);
    const tmpA = new THREE.Vector3();
    view.run((t) => {
      balloons.forEach(b => {
        const y = b.b.p[1] + 0.16 * Math.sin(t * 2 + b.i * 1.7), x = b.b.p[0] + 0.08 * Math.sin(t * 1.3 + b.i), z = b.b.p[2] + 0.08 * Math.cos(t * 1.1 + b.i);
        b.body.position.set(x, y, z);
        b.body.rotation.z = 0.08 * Math.sin(t * 1.5 + b.i);
        b.knot.position.set(x, y - 0.95, z);
        view.placeCylinder(b.str, [x, y - 1.05, z], HOLD, 0.017);
      });
      orbits.forEach(o => {
        const a = t * 2.0 + o.k * Math.PI;
        o.e.position.set(Math.cos(a) * RADI, 0, Math.sin(a) * RADI);
        o.g.rotation.y += 0.004;
      });
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      tubeGlow.material.opacity = 0.14 + 0.2 * pulse;
      tubeCore.material.emissive.set('#f97316').multiplyScalar(0.6 + 0.4 * pulse);
      sparks.forEach((s, k) => { const u = (((t / 2.4) + k / 3) % 1 + 1) % 1; curve.getPointAt(u, tmpA); s.position.copy(tmpA); });
    });
  });

  // ---------------------------------------------------------------------------------
  // Step 7 — Real life: does it conduct? (circuit tester, metals vs nonmetal)
  // ---------------------------------------------------------------------------------
  const CIRCUIT_ITEMS = [
    { id: 'cu', label: 'Copper', name: 'Copper (Cu)', metal: true, fill: '#c2410c', shine: 120, spec: '#ffcfa0' },
    { id: 'al', label: 'Al foil', name: 'Aluminum (Al)', metal: true, fill: '#cbd5e1', shine: 140, spec: '#ffffff' },
    { id: 'fe', label: 'Iron', name: 'Iron (Fe)', metal: true, fill: '#64748b', shine: 90, spec: '#cbd5e1' },
    { id: 's', label: 'Sulfur', name: 'Sulfur (S)', metal: false, fill: '#facc15', shine: 4, spec: '#222222' }
  ];
  const scene7 = Chem3D.define({ distance: 13.2, pitch: 0.22, yaw: 0.3, autoRotate: 0, target: [0.9, 0.2, 0] }, (view, ctx) => {
    const X0 = -3.6, X1 = 3.6, Y0 = -1.3, Y1 = 1.5, W = X1 - X0, H = Y1 - Y0, P = 2 * (W + H);
    view.box(9.2, 0.16, 3.0, '#e2e8f0', { pos: [0, -1.85, 0.1], shininess: 20 });     // little board the circuit stands on
    const wireCol = '#475569', WR = 0.07;
    const wire = (a, b) => view.cylinder(a, b, WR, wireCol, { shininess: 60 });
    wire([X0, Y1, 0], [X1, Y1, 0]); wire([X1, Y1, 0], [X1, Y0, 0]);
    wire([X1, Y0, 0], [1.5, Y0, 0]); wire([-1.5, Y0, 0], [X0, Y0, 0]);
    wire([X0, Y0, 0], [X0, -0.35, 0]); wire([X0, 0.8, 0], [X0, Y1, 0]);
    wire([0, Y1, 0], [0, Y1 + 0.35, 0]);
    // battery (vertical): body + gold cap
    const batt = view.cylinder([X0, -0.35, 0], [X0, 0.6, 0], 0.42, '#16a34a', { shininess: 80 });
    view.cylinder([X0, 0.6, 0], [X0, 0.8, 0], 0.16, '#eab308', { shininess: 120 });
    view.cylinder([X0, -0.15, 0], [X0, 0.15, 0], 0.435, '#111827', { shininess: 30 });
    // sample bar in the bottom wire, with two clips
    const barMat = view.mat('#c2410c', { shininess: 120, specular: '#ffcfa0' });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.46, 0.5), barMat); bar.position.set(0, Y0, 0); view.scene.add(bar);
    view.box(0.18, 0.7, 0.62, '#1e293b', { pos: [-1.4, Y0, 0] }); view.box(0.18, 0.7, 0.62, '#1e293b', { pos: [1.4, Y0, 0] });
    // bulb: base + glass sphere + filament + halo
    view.cylinder([0, Y1 + 0.3, 0], [0, Y1 + 0.75, 0], 0.3, '#94a3b8', { shininess: 80 });
    const glass = view.sphere(0.72, '#e5e7eb', { opacity: 0.55, shininess: 140, specular: '#ffffff' });
    glass.position.set(0, Y1 + 1.4, 0);
    const fil = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 24), view.mat('#9ca3af', { shininess: 30 })); fil.position.set(0, Y1 + 1.35, 0); view.scene.add(fil);
    const halo = view.sphere(1.3, '#fde047', { opacity: 0.0001 }); halo.position.copy(glass.position);
    halo.material.transparent = true; halo.material.opacity = 0; halo.material.depthWrite = false;
    const bulbLight = new THREE.PointLight('#fde047', 0, 0, 2); bulbLight.position.copy(glass.position); view.scene.add(bulbLight);
    // electrons ride the loop
    const NE = 18, es = [];
    for (let i = 0; i < NE; i++) { const e = view.sphere(0.13, '#38bdf8', { shininess: 100 }); e.material.emissive.set('#0369a1'); es.push(e); }
    function pt(s, out) {
      s = ((s % P) + P) % P;
      if (s < W) return out.set(X0 + s, Y1, 0.3);
      s -= W; if (s < H) return out.set(X1, Y1 - s, 0.3);
      s -= H; if (s < W) return out.set(X1 - s, Y0, 0.3);
      s -= W; return out.set(X0, Y0 + s, 0.3);
    }
    // labels
    banner(view, 'battery', [X0 - 1.0, 0.1, 0.4], { h: 0.6, color: '#475569', bold: false });
    const res = banner(view, '', [3.6, 3.05, 0], { h: 0.72, color: '#a16207' });
    const nm = banner(view, '', [0, -2.25, 0.8], { h: 0.8, color: '#1e293b' });
    const note = banner(view, '', [0, -2.9, 0.8], { h: 0.68, color: '#475569', bold: false });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 6px">' +
      CIRCUIT_ITEMS.map(it => '<button type="button" class="scene-btn" style="padding:5px 9px;font-size:13px" data-i="' + it.id + '">' + it.label + '</button>').join('') + '</div>');
    let cur = CIRCUIT_ITEMS[0], glow = 0, off = 0;
    function pick(it) {
      cur = it;
      barMat.color.set(it.fill); barMat.shininess = it.shine; barMat.specular.set(it.spec);
      nm.userData.set(it.name + (it.metal ? ': a metal' : ': a nonmetal'));
      note.userData.set(it.metal ? 'shiny, conducts electricity' : 'brittle yellow solid, insulator');
      res.userData.set(it.metal ? 'Bulb ON: electrons flow' : 'Bulb OFF: no flow', it.metal ? '#a16207' : '#6b7280');
      row.querySelectorAll('button').forEach(o => { const on = o.dataset.i === it.id; o.style.borderColor = on ? 'var(--primary)' : ''; o.style.color = on ? 'var(--primary)' : ''; });
    }
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => pick(CIRCUIT_ITEMS.find(x => x.id === b.dataset.i))));
    pick(cur);
    sway(view, 0.3, 0.4);
    fit(view, 1.7);
    const tmp = new THREE.Vector3();
    view.run((t, dt) => {
      if (cur.metal) off += 3.0 * dt * (P / 7.5) / 3;   // ~ one lap in a few seconds
      glow += ((cur.metal ? 1 : 0) - glow) * Math.min(1, dt * 5);
      const fl = glow * (0.85 + 0.15 * Math.sin(t * 8));
      glass.material.emissive.set('#fde047').multiplyScalar(fl * 0.9);
      glass.material.color.set(glow > 0.5 ? '#fef9c3' : '#e5e7eb');
      fil.material.emissive.set('#f97316').multiplyScalar(fl); fil.material.color.set(glow > 0.5 ? '#fb923c' : '#9ca3af');
      halo.material.opacity = fl * 0.28; halo.visible = fl > 0.02;
      bulbLight.intensity = fl * 7;
      es.forEach((e, i) => {
        pt(off + i * P / NE + (cur.metal ? 0 : Math.sin(t * 5 + i) * 0.14), tmp);
        e.position.copy(tmp);
      });
    });
  });

  // ---------------------------------------------------------------------------------
  // Step 8 — Real life: find the element (everyday objects -> mini 3D table of elements 1-18)
  // ---------------------------------------------------------------------------------
  const FIND_FILL = { m: '#93c5fd', l: '#fde68a', n: '#86efac', g: '#d8b4fe' };
  const FIND_KIND = { m: 'metal', l: 'metalloid', n: 'nonmetal', g: 'noble gas' };
  const FIND_ITEMS = [
    { id: 'balloon', label: 'Balloon', name: 'Party balloon gas', z: 2 },
    { id: 'foil', label: 'Foil', name: 'Aluminum foil', z: 13 },
    { id: 'pencil', label: 'Pencil', name: 'Pencil "lead" (graphite)', z: 6 },
    { id: 'battery', label: 'Battery', name: 'Phone battery metal', z: 3 },
    { id: 'chip', label: 'Chip', name: 'Computer chip', z: 14 },
    { id: 'sign', label: 'Neon', name: 'Red-orange glowing sign', z: 10 }
  ];
  const FIND_NAMES = { 2: 'helium', 13: 'aluminum', 6: 'carbon', 3: 'lithium', 14: 'silicon', 10: 'neon' };
  const scene8 = Chem3D.define({ distance: 12, pitch: 0.85, yaw: 0.12, autoRotate: 0, target: [0, 0.3, 1.0] }, (view, ctx) => {
    const els = PER_EL.slice(0, 18);
    view.box(10.7, 0.1, 3 * PITCH + 0.5, '#a5b4fc', { opacity: 0.3, pos: [0, -0.06, 0] });
    const tiles = els.map(e => makeTile(view, e, tilePos(e, 3), { color: FIND_FILL[e.cls], number: false }));
    const gx0 = (1 - 4.025) * PITCH + 0.58, gx1 = (3.05 - 4.025) * PITCH - 0.58, zz = 1.5 * PITCH + 0.5;
    dashedRect(view, gx0, -zz, gx1, zz, '#818cf8');
    banner(view, '3–12', [(gx0 + gx1) / 2, 0.15, -zz - 0.45], { h: 0.55, px: 84, color: '#475569' });
    const zFront = zz;
    const l1 = banner(view, 'Pick an object below', [0, 0.2, zFront + 0.7], { h: 0.85, color: '#1e293b' });
    const l2 = banner(view, ' ', [0, 0.2, zFront + 1.35], { h: 0.75, color: '#4338ca' });
    const l3 = banner(view, ' ', [0, 0.2, zFront + 1.95], { h: 0.68, color: '#475569', bold: false });
    // 3D everyday-object models (only the picked one is shown, hovering over its element)
    const mkObj = {
      balloon() {
        const g = new THREE.Group();
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), view.mat('#ef4444', { shininess: 130, specular: '#ffffff' })); b.scale.y = 1.2; b.position.y = 0.5; g.add(b);
        const k = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 8), view.mat('#ef4444')); k.rotation.x = Math.PI; k.position.y = -0.1; g.add(k);
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), view.mat('#475569')); s.position.y = -0.4; g.add(s);
        return g;
      },
      foil() {
        const g = new THREE.Group(), m = view.mat('#e2e8f0', { shininess: 140, specular: '#ffffff' });
        const r = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 24), m); r.rotation.z = Math.PI / 2; r.position.y = 0.3; g.add(r);
        const e = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.82, 16), view.mat('#94a3b8')); e.rotation.z = Math.PI / 2; e.position.y = 0.3; g.add(e);
        return g;
      },
      pencil() {
        const g = new THREE.Group();
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.85, 6), view.mat('#facc15')); b.position.y = 0.45; g.add(b);
        const w = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 6), view.mat('#fcd9a8')); w.position.y = 0.98; g.add(w);
        const l = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 6), view.mat('#374151')); l.position.y = 1.14; g.add(l);
        const er = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.14, 8), view.mat('#f9a8d4')); er.position.y = -0.04; g.add(er);
        g.rotation.z = 0.5; g.position.y = -0.1;
        const o = new THREE.Group(); o.add(g); return o;
      },
      battery() {
        const g = new THREE.Group();
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.9, 0.16), view.mat('#1f2937', { shininess: 90 })); b.position.y = 0.45; g.add(b);
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.02), view.mat('#22c55e')); s.position.set(0, 0.45, 0.09); g.add(s);
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.1), view.mat('#eab308', { shininess: 120 })); c.position.y = 0.94; g.add(c);
        return g;
      },
      chip() {
        const g = new THREE.Group();
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.7), view.mat('#111827', { shininess: 80 })); b.position.y = 0.3; g.add(b);
        const die = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.3), view.mat('#94a3b8', { shininess: 140 })); die.position.y = 0.37; g.add(die);
        const pm = view.mat('#e5e7eb', { shininess: 120 });
        for (let i = 0; i < 5; i++) { const t = -0.28 + i * 0.14;
          [[t, 0.38], [t, -0.38], [0.38, t], [-0.38, t]].forEach(p => { const pin = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.07), pm); pin.position.set(p[0], 0.3, p[1]); g.add(pin); }); }
        return g;
      },
      sign() {
        const g = new THREE.Group();
        const c = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.5, 0.05, 0), new THREE.Vector3(-0.3, 0.7, 0.05), new THREE.Vector3(0, 0.2, -0.05), new THREE.Vector3(0.3, 0.7, 0.05), new THREE.Vector3(0.5, 0.05, 0)]);
        const tm = view.mat('#f97316', { shininess: 30 }); tm.emissive.set('#f97316').multiplyScalar(0.8);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.07, 8, false), tm));
        const gl = view.mat('#fb923c', { opacity: 0.25 }); g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.19, 8, false), gl));
        return g;
      }
    };
    const objs = {};
    FIND_ITEMS.forEach(it => { const g = mkObj[it.id](); g.visible = false; view.scene.add(g); objs[it.id] = g; });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 40), view.mat('#f97316', { opacity: 0.9, shininess: 20 }));
    halo.rotation.x = Math.PI / 2; halo.visible = false; view.scene.add(halo);
    halo.material.emissive.set('#f97316').multiplyScalar(0.6);
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 3px">' +
      FIND_ITEMS.map(it => '<button type="button" class="scene-btn" style="padding:4px 6px;font-size:12px" data-i="' + it.id + '">' + it.label + '</button>').join('') + '</div>');
    let sel = null, selTile = null, fly = 0, T0 = 0;
    const ORANGE = new THREE.Color('#fb923c');
    function pick(it) {
      if (selTile) selTile.setColor(FIND_FILL[selTile.e.cls]);
      if (sel) objs[sel.id].visible = false;
      sel = it; selTile = tiles.find(tl => tl.e.z === it.z);
      const e = selTile.e;
      objs[it.id].visible = true; halo.visible = true;
      fly = 0.001;
      l1.userData.set(it.name + ' = ' + FIND_NAMES[it.z] + ' (' + e.sym + ')');
      l2.userData.set('Atomic number ' + e.z + ' · Group ' + e.g + ' · Period ' + e.p);
      l3.userData.set('a ' + FIND_KIND[e.cls] + (e.cls === 'g' ? ': very unreactive' : e.cls === 'm' ? ': shiny, conducts' : e.cls === 'l' ? ': in between a metal and a nonmetal' : ': does not conduct well'));
      row.querySelectorAll('button').forEach(o => { const on = o.dataset.i === it.id; o.style.borderColor = on ? 'var(--primary)' : ''; o.style.color = on ? 'var(--primary)' : ''; });
    }
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => pick(FIND_ITEMS.find(x => x.id === b.dataset.i))));
    sway(view, 0.22, 0.45);
    fit(view, 1.7);
    view.run((t, dt) => {
      tiles.forEach(tl => {
        const on = tl === selTile;
        tl.lift += ((on ? 0.5 : 0) - tl.lift) * Math.min(1, dt * 8);
        if (on) tl.mat.color.lerp(ORANGE, Math.min(1, dt * 8) || 1);
        tl.setGlow('#f97316', on ? 0.4 : 0);
        tl.place();
      });
      if (!selTile) return;
      const tx = selTile.base[0], tz = selTile.base[1];
      const o = objs[sel.id];
      if (fly > 0 && fly < 1) fly = Math.min(1, fly + dt / 0.9);
      const k = 1 - Math.pow(1 - fly, 3);
      const sx = 0, sy = 1.2, sz = zFront + 0.6;
      const hover = 0.7 + 0.1 * Math.sin(t * 3);
      o.position.set(sx + (tx - sx) * k, sy + (hover + selTile.lift - sy) * k + Math.sin(k * Math.PI) * 1.4, sz + (tz - sz) * k);
      o.rotation.y = t * 1.6;
      const s = 0.5 + 0.5 * k; o.scale.setScalar(s * 1.0);
      halo.position.set(tx, selTile.lift + TILE_H + 0.05, tz);
      const pulse = 1 + 0.25 * (0.5 + 0.5 * Math.sin(t * 5));
      halo.scale.setScalar(pulse); halo.material.opacity = 0.9 - 0.4 * (pulse - 1) / 0.25;
    });
    pick(FIND_ITEMS[0]);
  });

  // @@NEXT@@

  // ---------------------------------------------------------------------------------
  // Explanations + narration re-written for what the 3D scenes really show
  // ---------------------------------------------------------------------------------
  addTutorialExplanations('chemistry', 'periodic', [
    // 1. Elements in order
    {
      explain: '<p>A 3D <b>periodic table</b> of the first 20 elements. Group numbers run along the back, period numbers down the left side. Each block <b>rises</b> in order, showing its atomic number and symbol, from hydrogen at 1 to calcium at 20. The dashed box is the gap for groups 3 to 12. A caption counts the protons, then an arrow shows the order.</p>',
      say: 'This is the start of the periodic table, built from solid blocks, and you can drag the picture to turn it around. Along the back are the group numbers, which label the columns. Down the left side are the period numbers, which label the rows. Now watch the blocks rise up, one at a time. Each one shows its atomic number and its symbol. It starts with hydrogen, number one. Then helium, number two, appears far across on the right. The next row starts with lithium. The caption says the atomic number equals the number of protons, so more protons means a higher number.'
    },
    // 2. Groups and periods
    {
      explain: '<p>The same 3D table, now with a glowing amber <b>band</b> around one column or row. The blocks inside lift up and glow, and their group or period number turns into an orange tag. Every two seconds the band moves on. <b>Columns</b> mode steps through the groups and names the outer electrons. <b>Rows</b> mode steps through the periods and names the electron shells.</p>',
      say: 'The table is back, and now a glowing band lifts one part of it. Each column is called a group. Every two seconds the band moves to the next group, and the caption tells you how many outer electrons those elements have. Group one has one outer electron each. Group two has two. Group eighteen has a full outer shell. Elements in the same group behave alike because they have the same number of outer electrons. Now press the rows button. A row is called a period. The lifted blocks sweep down through the periods, and the caption gives the number of electron shells.'
    },
    // 3. Metals, metalloids, nonmetals
    {
      explain: '<p>The 3D table starts all gray, then colors fill in with a caption for each. First the <b>metals</b> turn blue and pop up: lithium, beryllium, sodium, magnesium, aluminum, potassium and calcium. Next the two <b>metalloids</b>, boron and silicon, turn yellow and stand taller on a dark frame. Last the <b>nonmetals</b>, including hydrogen, turn teal. A color key sits in front.</p>',
      say: 'Watch the table fill with color. It starts all gray. First, the metals pop up in blue. They fill the left and middle of the table. Metals are shiny and good at carrying electricity. Next, two blocks turn yellow and stand taller on a dark frame. Those are boron and silicon, the metalloids. They sit along a staircase between the metals and the nonmetals, and they have properties of both. Finally, the nonmetals turn teal on the right side. Notice that hydrogen is teal too, with an arrow pointing at it. It is a nonmetal, even though it sits at the top of group one.'
    },
    // 4. Try it: valence electrons
    {
      explain: '<p>A 3D atom model with a colored <b>nucleus</b> showing the symbol, two gray shells of orbiting electrons, and an outer orange shell of orange electrons: the <b>valence electrons</b>. Drag the <b>Group</b> slider from 1 to 18. The atom changes from sodium to argon, the number of orange electrons changes, and the text on the right names the type and what the atom does.</p>',
      say: 'Here is a three dimensional model of an atom. The big colored ball in the middle is the nucleus. Around it, the electrons travel in rings called shells. The gray balls are inner electrons. The orange balls on the outside are valence electrons. Those are the ones that matter in reactions. Now drag the slider. It moves across the groups, from sodium in group one to argon in group eighteen. Watch the orange balls grow from one to eight. The text on the right tells you what each atom tends to do. Sodium loses one electron easily. Chlorine needs just one more. Argon has a full outer shell, so it is very unreactive.'
    },
    // 5. Reactivity trend: alkali metals
    {
      explain: '<p>Three glass troughs of water: <b>lithium</b>, <b>sodium</b> and <b>potassium</b>, each with a silvery ball for the metal. Bubbles of hydrogen rise from each ball. Lithium drifts slowly with a few bubbles, sodium zips faster with more, and potassium darts about with many bubbles and a flickering lilac flame. The arrow above the troughs points toward the most reactive metal.</p>',
      say: 'Look at the three glass troughs of water. Each one has a small silvery ball, which is a piece of a soft metal from group one. On the left is lithium, in the middle is sodium, and on the right is potassium. In every trough, the metal reacts with water and makes bubbles of hydrogen gas. Watch the differences. Lithium drifts slowly and makes a steady fizz. Sodium zips about faster, with more bubbles. Potassium darts around wildly, with lots of bubbles, and a lilac flame appears. Going down group one, the metals get more reactive, because their outer electron is easier to lose. Please never try this yourself.'
    },
    // 6. Real life: Balloons and neon signs
    {
      explain: '<p>On the left, three <b>balloons</b> bob on strings tied to a weight; they hold helium. In the middle is a 3D <b>helium atom</b>: an orange nucleus marked He, with two blue electrons circling along dashed rings labeled shell full. On the right, a curving orange <b>neon tube</b> glows while white sparks run along it.</p><p>Both are Group 18 gases.</p>',
      say: 'Look at the picture from left to right, and drag it to see it from other sides. On the left, three balloons bob up and down on their strings. They are filled with helium, a light gas. In the middle is a helium atom. The orange center is the nucleus, and two blue electrons circle around it along dashed rings. Two electrons is a full shell for helium. On the right is a glowing sign tube. It holds neon gas, and the white sparks stand for electricity passing through it and making it glow. Helium and neon are noble gases from group eighteen. Their outer shells are full, so they almost never react.'
    },
    // 7. Real life: Does it conduct?
    {
      explain: '<p>A simple 3D circuit on a board: a <b>battery</b> on the left, a <b>bulb</b> on top, and a <b>sample bar</b> in the bottom wire. Small blue balls are <b>electrons</b>. Pick a material with the buttons. For copper, aluminum or iron, the electrons stream around the loop and the bulb glows yellow. For sulfur they only jiggle and the bulb stays gray.</p>',
      say: 'Here is a simple electric circuit. There is a battery on the left, a bulb at the top, and a bar of material in the bottom wire that you can swap. The small blue balls are electrons. Right now the bar is copper. Look, the electrons stream around the loop, and the bulb glows yellow. Copper is a metal, and metals let electrons flow. Now press the sulfur button. The electrons only jiggle in place, and the bulb goes dark. Sulfur is a nonmetal, and it does not conduct. Aluminum foil and iron light the bulb too. That is why wires are made of metal, and plugs are covered in plastic.'
    },
    // 8. Real life: Find the element
    {
      explain: '<p>A mini 3D periodic table of elements 1 to 18, colored by type: blue metals, yellow metalloids, green nonmetals, purple noble gases. Tap an <b>object button</b> and a little model of that object flies to the matching element. That block lifts, turns orange and gets a pulsing ring. Three lines of text give its name, atomic number, group, period and type.</p>',
      say: 'This is an element scavenger hunt. You see a small three dimensional periodic table, with colors for metals, metalloids, nonmetals, and noble gases. Underneath are buttons for everyday objects. Press balloon. A little balloon flies over to helium, and its block lifts up with a pulsing ring. The text tells you the atomic number, the group, the period, and the type of element. Now try the others. Foil is aluminum, a metal. A pencil is mostly carbon, a nonmetal. A phone battery uses lithium. A computer chip is made from silicon, a metalloid. A glowing sign is neon, another noble gas. Notice that elements in the same column behave alike.'
    }
  ]);

  addTutorialScenes3D('chemistry', 'periodic', [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8]);
})();
