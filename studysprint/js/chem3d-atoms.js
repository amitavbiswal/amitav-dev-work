(function () {
  // 3D scenes for chemistry/atoms: addTutorialScenes3D('chemistry', 'atoms', [...8 scenes...]).
  if (typeof THREE === 'undefined' || typeof Chem3D === 'undefined') return;

  const RED = '#dc2626';      // protons
  const GREY = '#9ca3af';     // neutrons
  const ELEC = '#4f46e5';     // electrons
  const ELEC_GLOW = '#3730a3';
  const SYMBOLS = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
  const NAMES = ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon',
    'Sodium', 'Magnesium', 'Aluminum', 'Silicon', 'Phosphorus', 'Sulfur', 'Chlorine', 'Argon', 'Potassium', 'Calcium'];
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = x => x * x * (3 - 2 * x);

  // ---- charge signs on the particles: + on protons, − on electrons, 0 on neutrons ----
  // A sign sits on the surface of its ball facing the camera (so it follows rotation and is
  // hidden by nearer balls). One updater per view repositions all signs each frame.
  const signTextures = {};
  function signTexture(txt, fg, bg) {
    const key = txt + fg;
    if (!signTextures[key]) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d');
      x.font = '900 118px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineJoin = 'round'; x.lineWidth = 12; x.strokeStyle = bg; x.strokeText(txt, 64, 70);
      x.fillStyle = fg; x.fillText(txt, 64, 70);
      signTextures[key] = new THREE.CanvasTexture(c);
    }
    return signTextures[key];
  }
  const signLists = new WeakMap();
  const _sp = new THREE.Vector3();
  function addSign(view, mesh, txt, fg, bg) {
    const mat = new THREE.SpriteMaterial({ map: signTexture(txt, fg, bg), transparent: true, depthTest: true, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(1.5, 1.5, 1);
    sp.renderOrder = 5;
    mesh.add(sp);
    let list = signLists.get(view);
    if (!list) {
      list = [];
      signLists.set(view, list);
      view.run(() => {
        const cp = view.camera.position;
        list.forEach(it => {
          _sp.copy(cp);
          it.mesh.worldToLocal(_sp);
          const len = _sp.length() || 1;
          it.sp.position.copy(_sp).multiplyScalar(1.05 / len);
        });
      });
    }
    list.push({ mesh, sp });
    return sp;
  }
  const signProton = (view, m) => addSign(view, m, '+', '#ffffff', '#7f1d1d');
  const signNeutron = (view, m) => addSign(view, m, '0', '#111827', '#e5e7eb');
  const signElectron = (view, m) => addSign(view, m, '−', '#ffffff', '#1e1b4b');

  // Electrons per shell (capacities 2, 8, 8, 8), fine for the first 20 elements.
  function shellCounts(e) {
    const out = [];
    let left = e;
    [2, 8, 8, 8].forEach(cap => { out.push(Math.max(0, Math.min(left, cap))); left -= cap; });
    return out;
  }

  // Close-packed cluster of n balls of radius rp: returns [[x,y,z], ...] centred on the origin.
  function packCluster(n, rp) {
    if (n <= 0) return [];
    if (n === 1) return [[0, 0, 0]];
    const R = rp * Math.cbrt(n / 0.5), pts = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - 2 * ((i * 0.6180339887 + 0.31) % 1);
      const rad = Math.sqrt(Math.max(0, 1 - y * y)), th = i * 2.399963;
      const rho = R * Math.cbrt(((i * 0.7548776662 + 0.2) % 1) * 0.9 + 0.1);
      pts.push([rad * Math.cos(th) * rho, y * rho, rad * Math.sin(th) * rho]);
    }
    const min = 2 * rp * 1.03;
    for (let it = 0; it < 70; it++) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = pts[i], b = pts[j];
          let dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
          let d = Math.hypot(dx, dy, dz);
          if (d >= min) continue;
          if (d < 1e-5) { dx = 0.01; dy = 0.02; dz = 0.03; d = Math.hypot(dx, dy, dz); }
          const k = (min - d) / 2 / d;
          a[0] -= dx * k; a[1] -= dy * k; a[2] -= dz * k;
          b[0] += dx * k; b[1] += dy * k; b[2] += dz * k;
        }
      }
      pts.forEach(p => { p[0] *= 0.985; p[1] *= 0.985; p[2] *= 0.985; });
    }
    const c = [0, 0, 0];
    pts.forEach(p => { c[0] += p[0] / n; c[1] += p[1] / n; c[2] += p[2] / n; });
    pts.forEach(p => { p[0] -= c[0]; p[1] -= c[1]; p[2] -= c[2]; });
    return pts;
  }

  // A pool of nucleus balls (protons red / neutrons grey). layout(list) shows the first list.length balls at home spots.
  function makeNucleus(view, total, rp, isProton, pos) {
    const group = new THREE.Group();
    if (pos) group.position.set(pos[0], pos[1], pos[2]);
    view.scene.add(group);
    const parts = [];
    for (let i = 0; i < total; i++) {
      const m = view.sphere(rp, isProton(i) ? RED : GREY, { shininess: 60 });
      group.add(m);
      (isProton(i) ? signProton : signNeutron)(view, m);
      m.visible = false;
      parts.push({ m, i, home: [0, 0, 0], born: -10 });
    }
    return {
      group, parts,
      layout(pts, now) {
        parts.forEach((p, i) => {
          if (i < pts.length) {
            if (!p.m.visible) p.born = now;
            p.m.visible = true; p.home = pts[i];
          } else p.m.visible = false;
        });
      },
      tick(t, amp, popTime) {
        parts.forEach(p => {
          if (!p.m.visible) return;
          p.m.position.set(
            p.home[0] + amp * Math.sin(t * 4 + p.i * 1.7),
            p.home[1] + amp * Math.cos(t * 3.4 + p.i * 2.3),
            p.home[2] + amp * Math.sin(t * 3.1 + p.i * 0.9));
          const s = popTime ? ease(clamp01((t - p.born) / popTime)) : 1;
          p.m.scale.setScalar(rp * Math.max(0.001, s));
        });
      }
    };
  }

  // Shell rings (tilted in 3D) with electrons orbiting on them. Electrons can fly in / out along 3D paths.
  //   radii: ring radius per shell; tilts: [rotX, rotZ] per shell; opts: er (electron radius), maxE, speeds, flyLabel
  const _w = new THREE.Vector3(), _o = new THREE.Vector3(), _d = new THREE.Vector3();
  const OUT_DIR = new THREE.Vector3(5.5, 0.8, 2.4).normalize();
  const IN_FROM = new THREE.Vector3(-5.2, 1.4, 2.4);
  function makeOrbits(view, radii, tilts, opts) {
    opts = opts || {};
    const er = opts.er || 0.15, maxE = opts.maxE || 20;
    const speeds = opts.speeds || [1.5, 1.0, 0.7, 0.5];
    const shells = radii.map((r, s) => {
      const g = new THREE.Group();
      g.rotation.set(tilts[s][0], 0, tilts[s][1]);
      if (opts.pos) g.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
      view.scene.add(g);
      const ring = view.ring(r, '#a5b4fc', { opacity: 0.9, tube: 0.022 });
      g.add(ring);
      g.updateMatrixWorld(true);
      return { g, ring, r };
    });
    const es = [];
    for (let i = 0; i < maxE; i++) {
      const m = view.sphere(er, ELEC, { emissive: ELEC_GLOW, opacity: 0.999, shininess: 90 });
      signElectron(view, m);
      m.visible = false;
      es.push({ m, s: 0, k: 0, n: 1, on: false, arrive: null, leave: null, cb: null });
    }
    const flyLabel = opts.flyLabel ? view.label('e⁻', [0, 0, 0], { size: 0.55, color: ELEC, bold: true }) : null;
    if (flyLabel) flyLabel.visible = false;
    let lastT = 0;

    function orbitWorld(e, t, out) {
      const a = e.s * 0.9 + (2 * Math.PI * e.k) / e.n + speeds[e.s] * t;
      const sh = shells[e.s];
      out.set(sh.r * Math.cos(a), 0, sh.r * Math.sin(a));
      return sh.g.localToWorld(out);
    }
    function set(counts) {
      let idx = 0;
      shells.forEach((sh, s) => {
        sh.ring.visible = (counts[s] || 0) > 0;
        for (let k = 0; k < (counts[s] || 0) && idx < maxE; k++, idx++) {
          const e = es[idx];
          e.s = s; e.k = k; e.n = counts[s]; e.on = true; e.arrive = null; e.leave = null; e.cb = null;
          shells[s].g.add(e.m);
          e.m.visible = true; e.m.material.opacity = 0.999;
        }
      });
      for (; idx < maxE; idx++) { es[idx].on = false; es[idx].m.visible = false; es[idx].arrive = null; es[idx].leave = null; }
      if (flyLabel) flyLabel.visible = false;
    }
    function outermost() {
      let best = null;
      es.forEach(e => { if (e.on && (!best || e.s > best.s || (e.s === best.s && e.k > best.k))) best = e; });
      return best;
    }
    function eject(cb) {
      const e = outermost();
      if (!e) { cb(); return; }
      e.leave = lastT; e.cb = cb;
    }
    function admit(counts) {
      set(counts);
      const e = outermost();
      if (e) e.arrive = lastT;
    }
    function tick(t) {
      lastT = t;
      let anyFly = false;
      es.forEach(e => {
        if (!e.on) return;
        orbitWorld(e, t, _w);
        let fly = false, op = 1;
        if (e.arrive !== null) {
          const p = ease(clamp01((t - e.arrive) / 1.2));
          _w.lerpVectors(IN_FROM, _w, p);
          _w.y += Math.sin(Math.PI * p) * 0.5;
          fly = true;
          if (p >= 1) e.arrive = null;
        }
        if (e.leave !== null) {
          const p = ease(clamp01((t - e.leave) / 1.3));
          _w.addScaledVector(OUT_DIR, 7 * p);
          _w.y += Math.sin(Math.PI * p) * 0.5;
          op = 1 - clamp01((p - 0.55) / 0.45);
          fly = true;
          if (p >= 1) {
            const cb = e.cb; e.leave = null; e.cb = null; e.on = false; e.m.visible = false;
            if (cb) cb();
            return;
          }
        }
        shells[e.s].g.worldToLocal(_o.copy(_w));
        e.m.position.copy(_o);
        e.m.material.opacity = Math.max(0.02, op * 0.999);
        if (fly && flyLabel) { anyFly = true; flyLabel.position.set(_w.x, _w.y + 0.55, _w.z); }
      });
      if (flyLabel) flyLabel.visible = anyFly;
    }
    return { shells, es, set, tick, eject, admit };
  }

  // Two DOM rows helper for control strips
  const btn = (id, label, extra) => `<button type="button" class="scene-btn" id="${id}" style="padding:4px 8px"${extra || ''}>${label}</button>`;
  const rowStyle = 'style="flex:0 0 auto;flex-wrap:wrap;justify-content:center;gap:6px;"';
  const readStyle = 'style="display:block;text-align:center;font-size:12.5px;line-height:1.3;padding:1px 6px;flex:0 0 auto"';
  if (!document.getElementById('atm3d-style')) {
    const st = document.createElement('style'); st.id = 'atm3d-style';
    st.textContent = '#atm-read > span { display:inline-block; margin:0 6px; }';
    document.head.appendChild(st);
  }

  const scenes = [];
  // ---- Step 1: zoom into a carbon atom
  scenes.push(Chem3D.define({ distance: 10.2, pitch: 0.38, yaw: 0.5, target: [0, 0.05, 0], autoRotate: 0.25 }, (view, ctx) => {
    const nuc = makeNucleus(view, 12, 0.3, i => i % 2 === 0);
    nuc.layout(packCluster(12, 0.3), 0);
    const orb = makeOrbits(view, [1.6, 2.65], [[1.0, 0.35], [-0.55, -0.8]], { er: 0.2 });
    orb.set([2, 4]);
    view.label('Carbon atom', [0, 2.7, 0], { size: 0.7, color: '#1f2937' });
    ctx.controls('<div class="scene-slider-row" style="flex:0 0 auto;flex-wrap:wrap;justify-content:center;gap:1px 10px;font-size:12px;line-height:1.3">' +
      `<span><b style="color:${RED}">\u25CF</b> Proton (+)</span><span><b style="color:${GREY}">\u25CF</b> Neutron (0)</span><span><b style="color:${ELEC}">\u25CF</b> Electron (\u2212)</span>` +
      '<span style="color:var(--t-muted)">Shells: 2 electrons, then 4</span></div>');
    view.run((t) => {
      nuc.tick(t, 0.025);
      nuc.group.scale.setScalar(1 + 0.03 * Math.sin(t * 2.2));
      orb.tick(t);
    });
  }));
  const RADII4 = [1.15, 1.8, 2.45, 3.1];
  const TILTS4 = [[0.9, 0.3], [-0.6, 0.7], [0.4, -0.9], [-0.9, -0.4]];

  // ---- Step 2: build an atom (interactive)
  scenes.push(Chem3D.define({ distance: 11.2, pitch: 0.35, yaw: 0.5, target: [0, 0.2, 0], autoRotate: 0.22 }, (view, ctx) => {
    const RP = 0.24;
    const nuc = makeNucleus(view, 20, RP, () => true);
    const orb = makeOrbits(view, RADII4, TILTS4, { er: 0.19 });
    const title = view.label('', [0, 3.75, 0], { size: 0.8, color: '#4338ca', bg: 'rgba(255,255,255,0.75)' });
    const row = ctx.controls(
      `<div class="scene-slider-row" ${rowStyle}>` + btn('atm-minus', '− Proton') +
      '<input type="range" id="atm-zslider" min="1" max="20" step="1" value="6" style="min-width:90px" aria-label="Number of protons">' +
      btn('atm-plus', '+ Proton') + '</div>' +
      `<div class="scene-slider-row" id="atm-read" ${readStyle}></div>`);
    const slider = row.querySelector('#atm-zslider'), read = row.querySelector('#atm-read');
    let z = 6, now = 0, outerR = 1.8;
    function update() {
      const counts = shellCounts(z);
      outerR = RADII4[counts.filter(n => n > 0).length - 1];
      title.position.y = outerR * 0.85 + 0.9;
      orb.set(counts);
      nuc.layout(packCluster(z, RP), now);
      title.userData.setText(SYMBOLS[z - 1] + '  ·  ' + NAMES[z - 1]);
      read.innerHTML = `<span><b>Atomic number = ${z}</b></span><span>Protons: ${z} (+${z})</span><span>Electrons: ${z} (−${z})</span>` +
        `<span style="color:var(--t-muted)">Shells: ${counts.filter(n => n > 0).join(', ')}</span>`;
      slider.value = z;
    }
    const setZ = v => { z = Math.max(1, Math.min(20, v)); update(); };
    row.querySelector('#atm-minus').addEventListener('click', () => setZ(z - 1));
    row.querySelector('#atm-plus').addEventListener('click', () => setZ(z + 1));
    slider.addEventListener('input', () => setZ(parseInt(slider.value, 10)));
    update();
    view.run((t, dt) => {
      now = t;
      const wantD = 4.2 + 2.4 * outerR;      // zoom out smoothly as new shells appear
      view.cam.distance += (wantD - view.cam.distance) * Math.min(1, dt * 3 + (t === 0 ? 1 : 0));
      nuc.tick(t, 0.02, 0.35);
      nuc.group.scale.setScalar(1 + 0.04 * Math.sin(t * 3.5));
      orb.tick(t);
    });
  }));
  // ---- Step 3: ions (interactive): an electron flies out / in along a 3D path
  scenes.push(Chem3D.define({ distance: 10, pitch: 0.33, yaw: 0.5, target: [0.6, 0.2, 0], autoRotate: 0.2 }, (view, ctx) => {
    const elems = [11, 12, 8, 17];
    const RP = 0.24;
    const nuc = makeNucleus(view, 20, RP, () => true);
    const orb = makeOrbits(view, RADII4, TILTS4, { er: 0.19, flyLabel: true });
    const aura = view.sphere(1, '#22c55e', { opacity: 0.14, shininess: 10 });
    aura.visible = false;
    const labs = [['#1f2937', 0], ['#dc2626', 1], ['#2563eb', 2]].map(a => {
      const s = view.label('', [0, 3.6, 0], { size: 1.0, color: a[0], bg: 'rgba(255,255,255,0.8)' });
      s.visible = false; return s;
    });
    const sup = c => { const n = Math.abs(c), d = ['', '', '²', '³'][n] || ''; return c > 0 ? d + '⁺' : c < 0 ? d + '⁻' : ''; };
    const row = ctx.controls(
      `<div class="scene-slider-row" ${rowStyle}>` + elems.map(n => btn('atm-el-' + n, SYMBOLS[n - 1])).join('') + btn('atm-lose', '− e⁻') + btn('atm-gain', '+ e⁻') + '</div>' +
      `<div class="scene-slider-row" id="atm-read" ${readStyle}></div>`);
    const read = row.querySelector('#atm-read');
    let z = 11, e = 11, busy = false, now = 0, outerR = 1.8;
    function panel() {
      const c = z - e;
      const counts = shellCounts(Math.max(e, z));
      outerR = RADII4[counts.filter(n => n > 0).length - 1];
      labs.forEach((s, i) => { s.visible = (i === 0 && c === 0) || (i === 1 && c > 0) || (i === 2 && c < 0); s.position.y = outerR * 0.85 + 0.9; s.userData.setText(SYMBOLS[z - 1] + sup(c)); });
      const full = [2, 10, 18].includes(e);
      aura.visible = full;
      aura.scale.setScalar(RADII4[shellCounts(e).filter(n => n > 0).length - 1] + 0.25);
      read.innerHTML = `<span>Protons: ${z} (+${z})</span><span>Electrons: ${e} (−${e})</span>` +
        `<span><b>Net charge: ${c > 0 ? '+' + c : c < 0 ? '−' + Math.abs(c) : '0'}</b></span>` +
        `<span style="color:var(--t-muted)">${c > 0 ? 'Lost electron(s): cation' : c < 0 ? 'Gained electron(s): anion' : 'Neutral atom'}${full ? ' · Full outer shell: stable!' : ''}</span>`;
      row.querySelectorAll('button[id^="atm-el-"]').forEach(b => {
        const on = b.id === 'atm-el-' + z;
        b.style.borderColor = on ? 'var(--primary)' : ''; b.style.color = on ? 'var(--primary)' : '';
      });
    }
    function pick(n) { if (busy) return; z = n; e = n; nuc.layout(packCluster(z, RP), now); orb.set(shellCounts(e)); panel(); }
    elems.forEach(n => row.querySelector('#atm-el-' + n).addEventListener('click', () => pick(n)));
    row.querySelector('#atm-lose').addEventListener('click', () => {
      if (busy || e <= Math.max(1, z - 2)) return;
      busy = true;
      orb.eject(() => { e -= 1; orb.set(shellCounts(e)); panel(); busy = false; });
    });
    row.querySelector('#atm-gain').addEventListener('click', () => {
      if (busy || e >= z + 2) return;
      e += 1;
      orb.admit(shellCounts(e));
      panel();
    });
    nuc.layout(packCluster(z, RP), 0);
    orb.set(shellCounts(e));
    panel();
    view.run((t, dt) => {
      now = t;
      const wantD = 3.6 + 2.5 * outerR;
      view.cam.distance += (wantD - view.cam.distance) * Math.min(1, dt * 3 + (t === 0 ? 1 : 0));
      nuc.tick(t, 0.02, 0.35);
      nuc.group.scale.setScalar(1 + 0.04 * Math.sin(t * 3.5));
      orb.tick(t);
      if (aura.visible) aura.material.opacity = 0.12 + 0.05 * Math.sin(t * 3);
    });
  }));
  // ---- Step 4: isotopes and mass number (neutron slider)
  scenes.push(Chem3D.define({ distance: 9.6, pitch: 0.36, yaw: 0.5, target: [0, 0.1, 0], autoRotate: 0.22 }, (view, ctx) => {
    const RP = 0.34, cluster = packCluster(14, RP);
    const nuc = makeNucleus(view, 14, RP, i => i < 12 && i % 2 === 0);
    const orb = makeOrbits(view, [1.85, 2.85], [[1.0, 0.35], [-0.55, -0.8]], { er: 0.2 });
    orb.set([2, 4]);
    const halo = view.sphere(1.35, '#ef4444', { opacity: 0.1, shininess: 10 });
    const title = view.label('Carbon-12', [0, 3.05, 0], { size: 0.85, color: '#4338ca', bg: 'rgba(255,255,255,0.8)' });
    const row = ctx.controls(
      `<div class="scene-slider-row" ${rowStyle}><span>Neutrons</span>` +
      '<input type="range" id="atm-nslider" min="6" max="8" step="1" value="6" aria-label="Number of neutrons"><span id="atm-nval" style="min-width:1.2em">6</span></div>' +
      `<div class="scene-slider-row" id="atm-read" ${readStyle}></div>`);
    const slider = row.querySelector('#atm-nslider'), nval = row.querySelector('#atm-nval'), read = row.querySelector('#atm-read');
    let now = 0;
    function update() {
      const n = parseInt(slider.value, 10), mass = 6 + n;
      nval.textContent = n;
      nuc.layout(cluster.slice(0, mass), now);
      title.userData.setText('Carbon-' + mass);
      read.innerHTML = `<span>Protons: 6 (always!)</span><span>Neutrons: ${n}</span><span><b>Mass number = ${mass}</b></span>` +
        `<span style="color:var(--t-muted)">= 6 protons + ${n} neutrons</span>`;
    }
    slider.addEventListener('input', update);
    nuc.layout(cluster.slice(0, 12), 0);
    update();
    view.run((t) => {
      now = t;
      nuc.tick(t, 0.035, 0.4);
      const k = 1 + 0.04 * Math.sin(t * 1.8);
      halo.scale.setScalar(1.35 * k);
      orb.tick(t);
    });
  }));
  // ---- Step 5: the first 20 elements as 3D tiles that rise in order
  scenes.push(Chem3D.define({ distance: 9.8, pitch: 0.85, yaw: 0, target: [0, 0.2, 0.1], autoRotate: 0 }, (view, ctx) => {
    const bodyZ = [1, 6, 7, 8];
    const PRIMARY = '#6366f1';
    const geo = new THREE.BoxGeometry(1, 1, 1), planeGeo = new THREE.PlaneGeometry(0.92, 0.92);
    const texs = [];
    function symTex(z, color) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d');
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color;
      g.font = '800 62px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      g.fillText(SYMBOLS[z - 1], 64, 70);
      g.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      g.textAlign = 'left'; g.fillText(String(z), 10, 20);
      const tex = new THREE.CanvasTexture(c);
      texs.push(tex);
      return tex;
    }
    const table = new THREE.Group();
    view.scene.add(table);
    const slab = view.box(9.6, 0.12, 5.3, '#c7d2fe', { opacity: 0.55 });
    slab.position.set(0, -0.06, 0); table.add(slab);
    const tiles = SYMBOLS.map((s, i) => {
      const z = i + 1;
      let r, c;
      if (z === 1) { r = 0; c = 0; } else if (z === 2) { r = 0; c = 7; } else if (z <= 10) { r = 1; c = z - 3; }
      else if (z <= 18) { r = 2; c = z - 11; } else { r = 3; c = z - 19; }
      const x = (c + (c >= 2 ? 0.5 : 0) - 3.75) * 1.1, zz = (r - 1.5) * 1.1;
      const mat = view.mat('#ffffff', { shininess: 40 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0.075, zz); mesh.scale.set(0.98, 0.15, 0.98);
      table.add(mesh);
      const tDark = symTex(z, '#1e1b4b'), tWhite = symTex(z, '#ffffff');
      const pm = new THREE.MeshBasicMaterial({ map: tDark, transparent: true });
      const plane = new THREE.Mesh(planeGeo, pm);
      plane.rotation.x = -Math.PI / 2; plane.position.set(x, 0.16, zz);
      table.add(plane);
      let frame = null;
      if (bodyZ.includes(z)) {
        frame = new THREE.Mesh(geo, view.mat('#ea580c', { emissive: '#9a3412' }));
        frame.scale.set(1.25, 0.04, 1.25); frame.position.set(x, 0.02, zz);
        table.add(frame);
      }
      return { z, x, zz, mesh, mat, plane, pm, tDark, tWhite, frame, h: 0.15, lastCur: 0 };
    });
    const tag = view.label('1 proton', [0, 1.6, 0], { size: 0.62, color: '#4338ca', bg: 'rgba(255,255,255,0.85)' });
    table.add(tag);
    const read = ctx.controls(`<div class="scene-slider-row" id="atm-read" ${readStyle}></div>`).querySelector('#atm-read');
    let shown = -1;
    function caption(cur) {
      const n = NAMES[cur - 1];
      read.innerHTML = `<span style="color:var(--primary);font-weight:700;font-size:15px">Atomic number ${cur} = ${n}</span>` +
        `<span style="color:var(--t-muted)">Every ${n.toLowerCase()} atom has exactly ${cur} proton${cur > 1 ? 's' : ''}</span>`;
      tag.userData.setText(cur + ' proton' + (cur > 1 ? 's' : ''));
    }
    view.run((t, dt) => {
      const cur = Math.min(20, Math.floor((t % 13) / 0.55) + 1);
      if (cur !== shown) { shown = cur; caption(cur); }
      table.rotation.y = 0.32 * Math.sin(t * 0.35);
      const k = Math.min(1, dt * 7 + (t === 0 ? 1 : 0));
      tiles.forEach(T => {
        const target = T.z === cur ? 1.15 : T.z < cur ? 0.5 : 0.15;
        T.h += (target - T.h) * k;
        T.mesh.scale.y = T.h; T.mesh.position.y = T.h / 2;
        T.plane.position.y = T.h + 0.01;
        if (T.frame) T.frame.material.emissiveIntensity = 0.7 + 0.5 * Math.sin(t * 3);
        if (T.lastCur !== (T.z === cur ? 2 : T.z < cur ? 1 : 0)) {
          T.lastCur = T.z === cur ? 2 : T.z < cur ? 1 : 0;
          T.mat.color.set(T.lastCur === 2 ? PRIMARY : T.lastCur === 1 ? '#c7d2fe' : '#ffffff');
          T.mat.emissive.set(T.lastCur === 2 ? '#3730a3' : '#000000');
          T.pm.map = T.lastCur === 2 ? T.tWhite : T.tDark;
        }
        if (T.z === cur) tag.position.set(T.x, T.h + 0.85, T.zz);
      });
    });
    return () => { texs.forEach(x => x.dispose()); geo.dispose(); planeGeo.dispose(); };
  }));
  // ---- Step 6 (example): neon sign. An electron jumps up, falls back and a photon lights the sign
  scenes.push(Chem3D.define({ distance: 10.8, pitch: 0.28, yaw: 0.1, target: [0.3, 0, 0], autoRotate: 0 }, (view, ctx) => {
    const D = 5, AX = -3.4, SX = 3.7;
    const nuc = makeNucleus(view, 20, 0.17, i => i % 2 === 0, [AX, 0, 0]);
    nuc.layout(packCluster(20, 0.17), 0);
    const orb = makeOrbits(view, [0.95, 1.7], [[1.25, 0.25], [1.0, -0.45]], { er: 0.18, pos: [AX, 0, 0], maxE: 10 });
    orb.set([2, 8]);
    const g2 = orb.shells[1].g;               // the 8-electron ring's frame; the higher level shares its plane
    const R2 = 1.7, R3 = 2.55;
    // dashed higher-level ring (instanced dots)
    const dotN = 44, dots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), view.mat('#f59e0b', { opacity: 0.9 }), dotN);
    const dm = new THREE.Object3D();
    for (let i = 0; i < dotN; i++) {
      const a = (i / dotN) * Math.PI * 2;
      dm.position.set(R3 * Math.cos(a), 0, R3 * Math.sin(a)); dm.scale.setScalar(i % 2 ? 0.045 : 0.03); dm.updateMatrix();
      dots.setMatrixAt(i, dm.matrix);
    }
    g2.add(dots);
    // the electron that jumps
    const jm = orb.es[2].m;
    orb.es[2].on = false;
    jm.material.color.set('#f97316'); jm.material.emissive.set('#c2410c');
    view.scene.add(jm);
    // sign: dark board, glass tubes and a glowing NEON text
    const board = view.box(4.8, 2.4, 0.35, '#111827', { shininess: 30 });
    board.position.set(SX, 0.1, 0);
    const tubeMat = view.mat('#fdba74', { emissive: '#7c2d12', shininess: 90 });
    [1.17, -0.97].forEach(y => {
      const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.4, 12), tubeMat);
      tb.rotation.z = Math.PI / 2; tb.position.set(SX, y + 0.1, 0.24); view.scene.add(tb);
    });
    function neonTex(on) {
      const c = document.createElement('canvas'); c.width = 512; c.height = 256;
      const g = c.getContext('2d');
      g.font = '800 150px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      if (on) { g.shadowColor = '#ff6b3d'; g.shadowBlur = 40; g.lineWidth = 12; g.strokeStyle = '#ff6b3d'; g.strokeText('NEON', 256, 132); g.strokeText('NEON', 256, 132); g.shadowBlur = 0; g.lineWidth = 5; g.strokeStyle = '#fff1e6'; g.strokeText('NEON', 256, 132); }
      else { g.lineWidth = 7; g.strokeStyle = '#7c2d12'; g.strokeText('NEON', 256, 132); }
      return new THREE.CanvasTexture(c);
    }
    const tOff = neonTex(false), tOn = neonTex(true);
    const planeGeo = new THREE.PlaneGeometry(4.2, 2.1);
    const offM = new THREE.MeshBasicMaterial({ map: tOff, transparent: true, depthWrite: false });
    const onM = new THREE.MeshBasicMaterial({ map: tOn, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const offP = new THREE.Mesh(planeGeo, offM), onP = new THREE.Mesh(planeGeo, onM);
    [offP, onP].forEach((p, i) => { p.position.set(SX, 0.1, 0.2 + i * 0.01); view.scene.add(p); });
    // photon: bright ball with a short trail
    const photon = [0, 1, 2, 3].map(i => view.sphere([0.2, 0.15, 0.11, 0.07][i], '#facc15', { emissive: '#f59e0b', opacity: [0.999, 0.6, 0.4, 0.25][i] }));
    const pHalo = view.sphere(0.42, '#fde047', { opacity: 0.25, shininess: 5 });
    photon.push(pHalo);
    photon.forEach(m => { m.visible = false; });
    const plabel = view.label('light', [0, 0, 0], { size: 0.6, color: '#b45309', bold: true }); plabel.visible = false;
    view.label('Neon atom', [AX, 3.2, 0], { size: 0.75, color: '#1f2937' });
    view.label('higher level', [AX + 0.2, -3.05, 0], { size: 0.6, color: '#b45309' });
    const read = ctx.controls(`<div class="scene-slider-row" id="atm-read" ${readStyle}></div>`).querySelector('#atm-read');
    let cap = -1;
    function setCap(i) {
      if (cap === i) return; cap = i;
      read.innerHTML = i === 0 ? '<span><b>Electric energy makes an electron jump up.</b></span>'
        : '<span style="color:#c2410c"><b>Falling back, it gives off the energy as light!</b></span>';
      read.innerHTML += '<span style="color:var(--t-muted)">10 protons, 10 neutrons, 10 electrons in shells 2 and 8</span>';
    }
    let lastSway = 0;
    const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), Pp = new THREE.Vector3();
    view.run((t) => {
      const f = (t % D) / D, cyc = Math.floor(t / D);
      nuc.tick(t, 0.02);
      orb.tick(t);
      // camera sways a little so the sign is always readable (adds to the user's own rotation)
      const sw = 0.4 * Math.sin(t * 0.35); view.cam.yaw += sw - lastSway; lastSway = sw;
      // jumper: 1.7 -> 2.55 (up), stay, back down
      let r = R2;
      if (f >= 0.2 && f < 0.3) r = R2 + (R3 - R2) * ease((f - 0.2) / 0.1);
      else if (f >= 0.3 && f < 0.6) r = R3;
      else if (f >= 0.6 && f < 0.7) r = R3 - (R3 - R2) * ease((f - 0.6) / 0.1);
      const a = 0.9 + 1.0 * t;
      jm.position.set(r * Math.cos(a), 0, r * Math.sin(a)); g2.localToWorld(jm.position);
      // photon from where the electron falls to the sign
      const pf = (f - 0.65) / 0.21;
      const showP = pf >= 0 && pf <= 1;
      if (showP) {
        const t0 = cyc * D + 0.65 * D, a0 = 0.9 + 1.0 * t0;
        P0.set(R2 * Math.cos(a0), 0, R2 * Math.sin(a0)); g2.localToWorld(P0);
        P1.set(SX - 1.2, 0.2, 0.9);
        photon.forEach((m, i) => {
          const q = clamp01(pf - (i < 4 ? i * 0.05 : 0));
          Pp.lerpVectors(P0, P1, ease(q)); Pp.y += Math.sin(Math.PI * q) * 0.7;
          m.position.copy(Pp); m.visible = pf - (i < 4 ? i * 0.05 : 0) >= 0;
        });
        plabel.visible = true; plabel.position.set(photon[0].position.x, photon[0].position.y + 0.65, photon[0].position.z);
      } else { photon.forEach(m => { m.visible = false; }); plabel.visible = false; }
      // sign glow
      let glow = 0.0;
      if (f > 0.84 && f <= 0.88) glow = (f - 0.84) / 0.04; else if (f > 0.88 && f <= 0.95) glow = 1; else if (f > 0.95) glow = 1 - (f - 0.95) / 0.05;
      onM.opacity = glow;
      tubeMat.emissive.set(glow > 0.02 ? '#ea580c' : '#7c2d12'); tubeMat.emissiveIntensity = 0.5 + glow;
      setCap(f >= 0.56 ? 1 : 0);
    });
    return () => { tOff.dispose(); tOn.dispose(); planeGeo.dispose(); offM.dispose(); onM.dispose(); dots.geometry.dispose(); };
  }));
  // ---- Step 7 (example): static on a balloon. Electrons hop from the hair to the balloon; the hair rises
  scenes.push(Chem3D.define({ distance: 10.4, pitch: 0.14, yaw: 0.25, target: [0.9, 0.2, 0], autoRotate: 0 }, (view, ctx) => {
    const MAXQ = 8, HX = 3.1, HR = 1.35, NS = 18, SEG = 4, BY = 1.15, BX0 = -1.9;
    // head (faces the balloon), neck, hair strands
    const head = view.sphere(HR, '#fcd9b6', { shininess: 25 }); head.position.set(HX, 0, 0);
    const neck = view.cylinder([HX, -1.0, 0], [HX, -2.3, 0], 0.5, '#f5c9a0', { shininess: 20 });
    [0.85, 0.15].forEach(psi => {
      const v = new THREE.Vector3(-Math.cos(psi), 0.26, Math.sin(psi)).normalize().multiplyScalar(HR * 0.99);
      const eye = view.sphere(0.13, '#1f2937', { shininess: 90 }); eye.position.set(HX + v.x, v.y, v.z);
    });
    { const v = new THREE.Vector3(-Math.cos(0.5), -0.1, Math.sin(0.5)).normalize().multiplyScalar(HR * 1.0);
      const nose = view.sphere(0.14, '#f1b58f', { shininess: 20 }); nose.position.set(HX + v.x, v.y, v.z); }
    const hairMat = view.mat('#7c4a1e', { shininess: 30 });
    const segGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
    const capGeo = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, 1.3);
    const cap = new THREE.Mesh(capGeo, hairMat); cap.scale.setScalar(HR * 1.04); cap.position.set(HX, 0, 0); view.scene.add(cap);
    const strands = [];
    for (let i = 0; i < NS; i++) {
      const th = (2 * Math.PI * i) / NS + 0.3 * Math.sin(i * 2.1), ph = 0.35 + 0.75 * ((i * 0.618) % 1);
      const out = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      const root = out.clone().multiplyScalar(HR * 1.05); root.x += HX;
      const segs = [];
      for (let k = 0; k < SEG; k++) { const m = new THREE.Mesh(segGeo, hairMat); view.scene.add(m); segs.push(m); }
      strands.push({ i, out, root, segs, tip: new THREE.Vector3(), plus: null });
    }
    // balloon (a stretched sphere with a knot and a string) and minus decals on its skin
    const bal = new THREE.Group(); view.scene.add(bal);
    const body = view.sphere(1, '#f97316', { shininess: 90, specular: '#ffffff' });
    body.scale.set(1.1, 1.32, 1.1); bal.add(body);
    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 12), view.mat('#ea580c'));
    knot.position.y = -1.42; knot.rotation.x = Math.PI; bal.add(knot);
    const string = view.cylinder([0, -1.55, 0], [0.15, -3.0, 0], 0.02, '#94a3b8'); bal.add(string);
    const mc = document.createElement('canvas'); mc.width = mc.height = 64;
    { const g = mc.getContext('2d'); g.fillStyle = '#4f46e5'; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(14, 27, 36, 10); }
    const mTex = new THREE.CanvasTexture(mc);
    const mMat = new THREE.MeshBasicMaterial({ map: mTex, transparent: true }), mGeo = new THREE.PlaneGeometry(0.46, 0.46);
    const decals = [];
    for (let i = 0; i < MAXQ; i++) {
      const y = 0.75 - 1.5 * i / (MAXQ - 1) * 0.9 - 0.05, rr = Math.sqrt(1 - y * y), a = 0.35 + ((i * 0.618 + 0.13) % 1) * 2.45;
      const n = new THREE.Vector3(rr * Math.cos(a), y, rr * Math.sin(a));
      const d = new THREE.Mesh(mGeo, mMat);
      d.position.set(n.x * 1.1 * 1.02, n.y * 1.32 * 1.02, n.z * 1.1 * 1.02);
      d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      d.visible = false; bal.add(d); decals.push(d);
    }
    // plus signs on some hair tips + the hopping electrons
    strands.forEach(s => { if (s.i % 2 === 0) { s.plus = view.label('+', [0, 0, 0], { size: 0.62, color: '#dc2626', bold: true }); s.plus.visible = false; } });
    const eDots = [0, 1, 2].map(() => { const m = view.sphere(0.19, ELEC, { emissive: ELEC_GLOW }); signElectron(view, m); m.visible = false; return m; });
    const row = ctx.controls(
      `<div class="scene-slider-row" ${rowStyle}>` + btn('exatm-rub', 'Rub the balloon') + btn('exatm-reset', 'Reset') + '</div>' +
      `<div class="scene-slider-row" id="atm-read" ${readStyle}></div>`);
    const read = row.querySelector('#atm-read');
    let q = 0, qv = 0, rubT0 = -1, lastT = 0, auto = true, capKey = '';
    const rub = () => { if (rubT0 < 0 && q < MAXQ) rubT0 = lastT; };
    row.querySelector('#exatm-rub').addEventListener('click', () => { auto = false; rub(); });
    row.querySelector('#exatm-reset').addEventListener('click', () => { auto = false; q = 0; rubT0 = -1; });
    const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), Up = new THREE.Vector3(0, 1, 0), dirB = new THREE.Vector3(), tmpQ = new THREE.Vector3();
    const P = [0, 1, 2, 3, 4].map(() => new THREE.Vector3());
    let lastSway = 0;
    view.run((t, dt) => {
      lastT = t;
      const sw = 0.35 * Math.sin(t * 0.4); view.cam.yaw += sw - lastSway; lastSway = sw;
      if (auto && t > 0.5) { auto = false; rub(); }
      let off = 0, p = -1, jy = 0;
      if (rubT0 >= 0) {
        p = (t - rubT0) / 2.0;
        if (p >= 1) { q = Math.min(MAXQ, q + 1); rubT0 = -1; p = -1; }
        else { off = 2.75 * Math.sin(Math.PI * Math.min(1, p * 1.05)); jy = 0.35 * Math.sin(p * 26) * Math.sin(Math.PI * p); }
      }
      qv += (q - qv) * Math.min(1, dt * 4);
      const qf = qv / MAXQ;
      const bx = BX0 + off, by = BY + jy + Math.sin(t * 1.6) * 0.05;
      bal.position.set(bx, by, 0);
      bal.rotation.z = -0.06 * Math.sin(t * 1.3) - 0.5 * jy;
      decals.forEach((d, i) => { d.visible = i < q && !(p >= 0 && i === q); });
      // electrons hop from the hair onto the balloon
      eDots.forEach((d, k) => {
        const s = ease(clamp01((p - 0.32 - k * 0.07) / 0.3));
        if (p < 0 || s <= 0 || s >= 1) { d.visible = false; return; }
        const st = strands[k * 5 + 1].root;
        tmpQ.set(bx + 0.95, by + 0.35 - k * 0.35, 0.3 - k * 0.3);
        d.position.lerpVectors(st, tmpQ, s); d.position.y += Math.sin(Math.PI * s) * 0.8; d.position.z += Math.sin(Math.PI * s) * 0.5;
        d.visible = true;
      });
      // hair: hangs down, then reaches towards the balloon as charge builds
      strands.forEach(s => {
        const wob = qf > 0.05 ? Math.sin(t * 2.2 + s.i) * 0.08 : 0;
        A.copy(s.root);
        dirB.set(bx + 0.5 - A.x, by + 0.3 - A.y, -A.z * 0.6).normalize();
        // tip: hang vs reach
        B.set(A.x + s.out.x * 0.45, A.y - 1.15 + s.out.y * 0.2, A.z + s.out.z * 0.45);
        tmpQ.set(A.x + dirB.x * 1.5 + wob, A.y + dirB.y * 1.5 + 0.2 + wob, A.z + dirB.z * 1.2);
        B.lerp(tmpQ, qf);
        // control point: a little lift off the scalp, tilting toward the balloon with charge
        C.set(A.x + s.out.x * 0.6, A.y + s.out.y * 0.6 + 0.15, A.z + s.out.z * 0.6);
        tmpQ.set(A.x + dirB.x * 0.8, A.y + dirB.y * 0.8, A.z + dirB.z * 0.5);
        C.lerp(tmpQ, qf);
        for (let k = 0; k <= SEG; k++) {
          const u = k / SEG, w0 = (1 - u) * (1 - u), w1 = 2 * u * (1 - u), w2 = u * u;
          P[k].set(w0 * A.x + w1 * C.x + w2 * B.x, w0 * A.y + w1 * C.y + w2 * B.y, w0 * A.z + w1 * C.z + w2 * B.z);
        }
        for (let k = 0; k < SEG; k++) {
          const m = s.segs[k], d = tmpQ.subVectors(P[k + 1], P[k]), len = Math.max(d.length(), 1e-4);
          m.position.copy(P[k]).add(P[k + 1]).multiplyScalar(0.5);
          m.scale.set(0.06, len, 0.06);
          m.quaternion.setFromUnitVectors(Up, d.normalize());
        }
        s.tip.copy(P[SEG]);
        if (s.plus) { s.plus.visible = qf > 0.1; s.plus.position.set(P[SEG].x, P[SEG].y + 0.4, P[SEG].z); }
      });
      const key = p >= 0 ? 'rub' : q === 0 ? 'zero' : q < 4 ? 'some' : 'lots';
      if (key !== capKey) {
        capKey = key;
        const c1 = { rub: 'Electrons hop from hair to balloon...', zero: 'Balloon and hair are neutral. Press Rub!',
          some: 'Balloon: extra electrons (\u2212). Hair: (+).', lots: 'Opposite charges attract: hair reaches up!' }[key];
        const c2 = '';
        read.innerHTML = `<span><b>${c1}</b></span>` + (c2 ? `<span style="color:var(--t-muted)">${c2}</span>` : '');
      }
    });
    return () => { mTex.dispose(); mMat.dispose(); mGeo.dispose(); segGeo.dispose(); capGeo.dispose(); };
  }));
  // ---- Step 8 (example): the atoms in your body, by mass, as 3D columns
  scenes.push(Chem3D.define({ distance: 12.4, pitch: 0.24, yaw: 0.14, target: [0, 1.9, 0], autoRotate: 0 }, (view, ctx) => {
    const D = 9, K = 0.075, GAP = 1.75;
    const rows = [['O', 'Oxygen', 65, '#ef4444'], ['C', 'Carbon', 18, '#374151'], ['H', 'Hydrogen', 10, ELEC],
      ['N', 'Nitrogen', 3, '#14b8a6'], ['+', 'Others', 4, '#94a3b8']];
    const slab = view.box(9.4, 0.16, 2.3, '#c7d2fe', { opacity: 0.6 }); slab.position.set(0, -0.08, 0);
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const cols = rows.map((r, i) => {
      const x = (i - 2) * GAP;
      const mesh = new THREE.Mesh(geo, view.mat(r[3], { shininess: 60 }));
      mesh.scale.set(1.15, 0.001, 1.15); mesh.position.set(x, 0, 0); view.scene.add(mesh);
      view.label(r[1], [x, -0.55, 1.15], { size: 0.62, color: '#1f2937' });
      const val = view.label(r[2] + '%', [x, 1, 0], { size: 0.85, color: '#1f2937', bg: 'rgba(255,255,255,0.85)' });
      val.visible = false;
      return { x, mesh, val, H: r[2] * K, s: 0.02 + i * 0.6, pct: r[2] };
    });
    ctx.controls(`<div class="scene-slider-row" id="atm-read" ${readStyle}><span style="color:var(--t-muted)">Hydrogen: most atoms, but very light.</span></div>`);
    let lastSway = 0;
    view.run((t) => {
      const sw = 0.2 * Math.sin(t * 0.4); view.cam.yaw += sw - lastSway; lastSway = sw;
      const tt = t % D;
      const shrink = ease(clamp01((tt - 7.6) / 1.2));
      cols.forEach(c => {
        const h = Math.max(0.001, c.H * ease(clamp01((tt - c.s) / 1.2)) * (1 - shrink));
        c.mesh.scale.y = h; c.mesh.position.y = h / 2;
        c.val.visible = h > c.H * 0.97;
        if (c.val.visible) c.val.position.y = h + 0.55 + 0.06 * Math.sin(t * 2.5 + c.x);
      });
    });
    return () => { geo.dispose(); };
  }));
  // @@STEPS-END

  scenes[4] = null;   // step 5 shows a periodic table: keep the flat (2D) version
  scenes[7] = null;   // step 8 is a bar chart (atoms in the body): keep the flat (2D) version
  addTutorialScenes3D('chemistry', 'atoms', scenes);

  // Explanations / narration re-issued for the 3D pictures (null = keep the existing text).
  addTutorialExplanations('chemistry', 'atoms', [
    {
      explain: '<p>This is a 3D <b>carbon atom</b>. The clump in the middle is the <b>nucleus</b>: 6 <b>red protons</b> and 6 <b>grey neutrons</b>. Two tilted rings circle it, and the <b>indigo electrons</b> keep orbiting: 2 on the inner ring, 4 on the outer. Drag to turn it around.</p><p>Notice that 6 protons (+) and 6 electrons (−) balance each other.</p>',
      say: 'You are looking at a three dimensional picture, so you can drag it to turn the atom around. That clump of balls in the middle is the nucleus of a carbon atom. The red balls are protons, and they carry a positive charge. The grey balls are neutrons, and they carry no charge at all. There are six of each. Now look at the tilted rings. The blue dots are electrons, and they carry a negative charge. Two electrons travel on the inner ring, and four travel on the outer ring. Those rings are called shells. Six protons and six electrons means the charges cancel out.'
    },
    {
      explain: '<p>The <b>red balls</b> in the middle are the nucleus: one ball for each proton, with the name and symbol floating above. Press <b>+ Proton</b> or <b>− Proton</b>, or drag the slider, and the <b>indigo electrons</b> fill the rings: 2 first, then 8, then 8.</p><p>Notice that changing only the proton number turns the atom into a different element.</p>',
      say: 'This is the atom builder, and right now it shows carbon. Look at the cluster of red balls in the middle. Each red ball is one proton, and carbon has six. The number of protons is called the atomic number, and it decides which element the atom is. The blue dots are electrons. A neutral atom has the same number of electrons as protons, so carbon has six. They fill the shells in order, two on the first shell, then up to eight on the second. Now press the plus proton button, or drag the slider. Watch the name change, and watch new electrons fill the outer rings.'
    },
    {
      explain: '<p>Pick an atom with the buttons: <b>Na, Mg, O</b> or <b>Cl</b>. <b>− e<sup>−</sup></b> makes an <b>indigo electron</b> fly away, and <b>+ e<sup>−</sup></b> makes one fly in. The big symbol above the atom shows its charge, and the line below counts protons, electrons and net charge.</p><p>Notice that only electrons move, never protons.</p>',
      say: null
    },
    {
      explain: '<p>The jiggling nucleus holds 6 <b>red protons</b> and some <b>grey neutrons</b>. Drag the slider to change the neutrons from 6 to 8, and a new grey ball pops in. The name changes from carbon-12 to 13 to 14, and the line below shows <b>mass number = protons + neutrons</b>.</p><p>Notice that the protons stay at 6, so it is always carbon.</p>',
      say: null
    },
    null,
    {
      explain: '<p>On the left is a <b>neon atom</b>. Its nucleus holds 10 <b>red protons</b> and 10 <b>grey neutrons</b>, with 2 electrons on the inner ring and 8 on the next. One <b>orange electron</b> jumps out to the dashed outer ring, then falls back. A <b>yellow flash</b> flies to the dark <b>NEON</b> sign, which lights up orange.</p>',
      say: 'Look at the neon atom on the left. Its nucleus holds ten red protons and ten grey neutrons. Around it are two electrons on the inner ring, and eight on the next ring. Watch the orange electron. First, the caption says electric energy makes it jump up to the dashed outer ring. Then it falls back down, and it gives off that energy as light. See the yellow flash fly across to the sign on the right. The word neon glows bright orange. That is how a neon sign works. Electricity pushes electrons up, and when they fall back, the gas gives off light.'
    },
    null,
    null
  ]);
})();
