(function () {
  'use strict';
  // more-chem-atoms: 5 extra real-life examples for Chemistry > Atoms & Elements.
  // Each has a flat (SVG) scene used as fallback and a three.js scene (scene3d). Ids/classes prefixed 'mca-'.

  const SVGNS = 'http://www.w3.org/2000/svg';
  const RED = '#dc2626', GREY = '#9ca3af', ELEC = '#4f46e5', ELEC_GLOW = '#3730a3';
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = x => x * x * (3 - 2 * x);
  const HAS3D = typeof Chem3D !== 'undefined' && typeof THREE !== 'undefined';
  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const RADII = [0.85, 1.4, 1.9, 2.4];
  const TILTS = [[0.9, 0.3], [-0.6, 0.7], [0.4, -0.9], [-0.9, -0.4]];
  function shellCounts(e) {
    const out = []; let left = e;
    [2, 8, 8, 8].forEach(cap => { out.push(Math.max(0, Math.min(left, cap))); left -= cap; });
    return out;
  }
  // protons and neutrons spread evenly through the list
  function typesFor(p, n) {
    const total = p + n, out = [];
    for (let i = 0; i < total; i++) out.push(Math.floor((i + 1) * p / total) > Math.floor(i * p / total) ? 'p' : 'n');
    return out;
  }
  const hash01 = x => { const v = Math.sin(x * 12.9898) * 43758.5453; return v - Math.floor(v); };
  const btnCss = 'padding:4px 8px';
  const btn = (id, label) => `<button type="button" class="scene-btn" id="${id}" style="${btnCss}">${label}</button>`;
  const rowStyle = 'style="flex:0 0 auto;flex-wrap:wrap;justify-content:center;gap:6px;"';
  const readStyle = 'style="display:block;text-align:center;font-size:12.5px;line-height:1.3;padding:1px 6px;flex:0 0 auto"';
  if (!document.getElementById('mca-style')) {
    const st = document.createElement('style'); st.id = 'mca-style';
    st.textContent = '.mca-read > span { display:inline-block; margin:0 6px; } @media (max-width:480px) { .mca-read .mca-hide { display:none !important; } .mca-read { font-size:11.5px !important; } #mca-sd-val { display:none; } .mca-read > span { margin:0 4px; } }';
    document.head.appendChild(st);
  }
  function hilite(row, sel, on) {
    row.querySelectorAll(sel).forEach(b => {
      const yes = on(b);
      b.style.borderColor = yes ? 'var(--primary)' : ''; b.style.color = yes ? 'var(--primary)' : '';
    });
  }

  // ------------------------------------------------------------------
  // Flat helpers: atoms drawn in SVG with signs on every particle
  // ------------------------------------------------------------------
  function spiral2d(n, d) {
    const pts = [];
    const ring = [[1, 0], [6, 0.3], [12, 0.1], [18, 0.5]];
    let k = 0;
    for (let r = 0; r < ring.length && k < n; r++) {
      const cnt = ring[r][0];
      for (let j = 0; j < cnt && k < n; j++, k++) {
        if (r === 0) pts.push([0, 0]);
        else { const a = ring[r][1] + (2 * Math.PI * j) / cnt; pts.push([r * d * 0.93 * Math.cos(a), r * d * 0.93 * Math.sin(a)]); }
      }
    }
    return pts;
  }
  const FLAT_SIGN = { p: ['+', '#ffffff'], n: ['0', '#111827'], e: ['−', '#ffffff'] };
  // A flat atom: nucleus of balls (with +/0 signs) and tilted-looking rings with orbiting electrons (with signs).
  //   o: rp (ball radius), er (electron radius), radii (ring radii), sx/sy squash of the rings
  function flatAtom(svg, cx, cy, o) {
    const rp = o.rp || 7, er = o.er || 6, sy = o.sy || 0.86;
    const root = svgEl('g', {}, svg);
    const rings = [];
    const es = [];
    const balls = [];
    const api = {
      root, es, balls, rings, cx, cy,
      setNucleus(types) {
        balls.forEach(b => { b.g.remove(); });
        balls.length = 0;
        const pts = spiral2d(types.length, rp * 2.02);
        types.forEach((ty, i) => {
          const g = svgEl('g', { transform: `translate(${(cx + pts[i][0]).toFixed(1)} ${(cy + pts[i][1]).toFixed(1)})` }, root);
          const c = svgEl('circle', { r: rp, fill: ty === 'p' ? RED : GREY, stroke: 'rgba(15,23,42,0.35)', 'stroke-width': 0.8 }, g);
          const t = svgEl('text', { y: rp * 0.38, 'text-anchor': 'middle', 'font-size': Math.max(10, rp * 1.5), 'font-weight': 800, fill: FLAT_SIGN[ty][1] }, g);
          t.textContent = FLAT_SIGN[ty][0];
          balls.push({ g, c, t, type: ty });
        });
      },
      setBall(i, ty) {
        const b = balls[i]; if (!b) return;
        b.type = ty; b.c.setAttribute('fill', ty === 'p' ? RED : GREY);
        b.t.setAttribute('fill', FLAT_SIGN[ty][1]); b.t.textContent = FLAT_SIGN[ty][0];
      },
      setElectrons(counts) {
        rings.forEach(r => r.remove()); rings.length = 0;
        es.forEach(e => e.g.remove()); es.length = 0;
        counts.forEach((n, s) => {
          if (!n) return;
          rings.push(svgEl('ellipse', { cx, cy, rx: o.radii[s], ry: o.radii[s] * sy, fill: 'none', stroke: '#a5b4fc', 'stroke-width': 1.3 }, root));
        });
        counts.forEach((n, s) => {
          for (let k = 0; k < n; k++) {
            const g = svgEl('g', {}, root);
            svgEl('circle', { r: er, fill: ELEC, stroke: '#1e1b4b', 'stroke-width': 0.8 }, g);
            const t = svgEl('text', { y: er * 0.42, 'text-anchor': 'middle', 'font-size': Math.max(10, er * 1.7), 'font-weight': 800, fill: '#ffffff' }, g);
            t.textContent = '−';
            es.push({ g, s, k, n, dr: 0, fly: null, hidden: false });
          }
        });
      },
      pos(e, t) {
        const a = e.s * 0.9 + (2 * Math.PI * e.k) / e.n + (o.speeds || [1.5, 1.0, 0.7, 0.5])[e.s] * t;
        const r = o.radii[e.s] + (e.dr || 0);
        return [cx + r * Math.cos(a), cy + r * sy * Math.sin(a)];
      },
      tick(t) {
        es.forEach(e => {
          let [x, y] = api.pos(e, t);
          if (e.fly) {
            const p = ease(clamp01((t - e.fly.t0) / e.fly.dur));
            x = e.fly.x + (x - e.fly.x) * p; y = e.fly.y + (y - e.fly.y) * p;
            if (p >= 1) e.fly = null;
          }
          e.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        });
      }
    };
    return api;
  }
  // Standard flat scene shell: svg + optional control rows. Returns { svg, row, read }.
  function flatShell(el, controlsHtml, vb) {
    el.innerHTML =
      `<svg viewBox="${vb || '0 0 400 190'}" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>` +
      (controlsHtml ? `<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;gap:6px;padding:2px 8px">${controlsHtml}</div>` : '') +
      '<div class="scene-slider-row mca-read" style="justify-content:center;flex-wrap:wrap;gap:0;font-size:12.5px;line-height:1.3;padding:1px 8px;display:block;text-align:center"></div>';
    const rows = el.querySelectorAll('.scene-slider-row');
    return { svg: el.querySelector('svg'), row: controlsHtml ? rows[0] : null, read: el.querySelector('.mca-read') };
  }
  function txt(parent, x, y, s, o) {
    const t = svgEl('text', Object.assign({ x, y, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: 'var(--t-ink)' }, o || {}), parent);
    t.textContent = s;
    return t;
  }

  // ------------------------------------------------------------------
  // 3D helpers (only when three.js is present)
  // ------------------------------------------------------------------
  const H3 = HAS3D ? (function () {
    const TEX = { p: ['+', '#ffffff', '#7f1d1d'], n: ['0', '#111827', '#e5e7eb'], e: ['−', '#ffffff', '#1e1b4b'] };
    const texCache = {};
    function signTex(txt2, fg, bg) {
      const key = txt2 + fg + bg;
      if (!texCache[key]) {
        const c = document.createElement('canvas'); c.width = c.height = 128;
        const x = c.getContext('2d');
        x.font = '900 118px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 12; x.strokeStyle = bg;
        x.strokeText(txt2, 64, 70); x.fillStyle = fg; x.fillText(txt2, 64, 70);
        texCache[key] = new THREE.CanvasTexture(c);
      }
      return texCache[key];
    }
    const lists = new WeakMap();
    const _sp = new THREE.Vector3();
    // sign sprite on the camera-facing surface of a ball
    function addSign(view, mesh, txt2, fg, bg, size) {
      const mat = new THREE.SpriteMaterial({ map: signTex(txt2, fg, bg), transparent: true, depthTest: true, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(size || 1.5, size || 1.5, 1);
      sp.renderOrder = 5;
      mesh.add(sp);
      let list = lists.get(view);
      if (!list) {
        list = []; lists.set(view, list);
        view.run(() => {
          const cp = view.camera.position;
          list.forEach(it => {
            _sp.copy(cp); it.mesh.worldToLocal(_sp);
            it.sp.position.copy(_sp).multiplyScalar(1.05 / (_sp.length() || 1));
          });
        });
      }
      list.push({ mesh, sp });
      return sp;
    }
    function addKindSign(view, mesh, kind) { return addSign(view, mesh, TEX[kind][0], TEX[kind][1], TEX[kind][2]); }
    function makeBall(view, rp, type) {
      const m = view.sphere(rp, type === 'p' ? RED : GREY, { shininess: 60 });
      m.userData.type = type; m.userData.sp = addKindSign(view, m, type);
      return m;
    }
    function setBallType(m, type) {
      m.userData.type = type;
      m.material.color.set(type === 'p' ? RED : GREY);
      m.userData.sp.material.map = signTex(TEX[type][0], TEX[type][1], TEX[type][2]);
    }
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
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
          const a = pts[i], b = pts[j];
          let dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], d = Math.hypot(dx, dy, dz);
          if (d >= min) continue;
          if (d < 1e-5) { dx = 0.01; dy = 0.02; dz = 0.03; d = Math.hypot(dx, dy, dz); }
          const k = (min - d) / 2 / d;
          a[0] -= dx * k; a[1] -= dy * k; a[2] -= dz * k; b[0] += dx * k; b[1] += dy * k; b[2] += dz * k;
        }
        pts.forEach(p => { p[0] *= 0.985; p[1] *= 0.985; p[2] *= 0.985; });
      }
      const c = [0, 0, 0];
      pts.forEach(p => { c[0] += p[0] / n; c[1] += p[1] / n; c[2] += p[2] / n; });
      pts.forEach(p => { p[0] -= c[0]; p[1] -= c[1]; p[2] -= c[2]; });
      return pts;
    }
    // Pool of nucleus balls. layout(types, rp) shows types.length balls (each 'p' or 'n').
    function makeNucleus(view, maxN, rp0, pos) {
      const group = new THREE.Group();
      if (pos) group.position.set(pos[0], pos[1], pos[2]);
      view.scene.add(group);
      const balls = [];
      for (let i = 0; i < maxN; i++) {
        const m = makeBall(view, rp0, 'n'); group.add(m); m.visible = false;
        balls.push({ m, i, home: [0, 0, 0], rp: rp0 });
      }
      return {
        group, balls,
        layout(types, rp) {
          const pts = packCluster(types.length, rp);
          balls.forEach((b, i) => {
            if (i < types.length) { b.m.visible = true; b.home = pts[i]; b.rp = rp; b.m.scale.setScalar(rp); setBallType(b.m, types[i]); }
            else b.m.visible = false;
          });
        },
        tick(t, amp) {
          balls.forEach(b => {
            if (!b.m.visible) return;
            b.m.position.set(b.home[0] + amp * Math.sin(t * 4 + b.i * 1.7), b.home[1] + amp * Math.cos(t * 3.4 + b.i * 2.3), b.home[2] + amp * Math.sin(t * 3.1 + b.i * 0.9));
          });
        }
      };
    }
    // Tilted shell rings with electrons orbiting. Electron balls live in the scene root (world coordinates).
    const _w = new THREE.Vector3();
    function makeOrbits(view, radii, tilts, opts) {
      opts = opts || {};
      const er = opts.er || 0.17, maxE = opts.maxE || 20, speeds = opts.speeds || [1.5, 1.0, 0.7, 0.5];
      const shells = radii.map((r, s) => {
        const g = new THREE.Group();
        g.rotation.set(tilts[s][0], 0, tilts[s][1]);
        if (opts.pos) g.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
        view.scene.add(g);
        const ring = view.ring(1, '#a5b4fc', { opacity: 0.9, tube: 0.02 });
        ring.scale.setScalar(r);
        g.add(ring);
        g.updateMatrixWorld(true);
        return { g, ring, r };
      });
      const es = [];
      for (let i = 0; i < maxE; i++) {
        const m = view.sphere(er, ELEC, { emissive: ELEC_GLOW, shininess: 90 });
        addKindSign(view, m, 'e');
        m.visible = false;
        es.push({ m, s: 0, k: 0, n: 1, on: false, dr: 0, fly: null });
      }
      return {
        shells, es,
        set(counts) {
          let idx = 0;
          shells.forEach((sh, s) => {
            sh.ring.visible = (counts[s] || 0) > 0;
            for (let k = 0; k < (counts[s] || 0) && idx < maxE; k++, idx++) {
              const e = es[idx]; e.s = s; e.k = k; e.n = counts[s]; e.on = true; e.dr = 0; e.fly = null; e.m.visible = true;
            }
          });
          for (; idx < maxE; idx++) { es[idx].on = false; es[idx].m.visible = false; }
        },
        // radius scale per shell (shell index -> new radius)
        setRadius(s, r) { shells[s].r = r; shells[s].ring.scale.setScalar(r); },
        orbitPos(e, t, out) {
          const a = e.s * 0.9 + (2 * Math.PI * e.k) / e.n + speeds[e.s] * t;
          const r = shells[e.s].r + e.dr;
          out.set(r * Math.cos(a), 0, r * Math.sin(a));
          return shells[e.s].g.localToWorld(out);
        },
        tick(t) {
          es.forEach(e => {
            if (!e.on) return;
            this.orbitPos(e, t, _w);
            if (e.fly) {
              const p = ease(clamp01((t - e.fly.t0) / e.fly.dur));
              _w.lerpVectors(e.fly.from, _w, p); _w.y += Math.sin(Math.PI * p) * 0.4;
              if (p >= 1) e.fly = null;
            }
            e.m.position.copy(_w);
          });
        }
      };
    }
    // keep the whole scene (half extents halfW x halfH around the target) in view at any canvas shape
    function autoFit(view, halfW, halfH, margin) {
      let last = 0;
      return () => {
        const a = view.camera.aspect;
        if (Math.abs(a - last) < 0.01) return;
        last = a;
        const tn = Math.tan(view.camera.fov * Math.PI / 360);
        view.cam.distance = Math.max(halfH / tn, halfW / (tn * a)) * (margin || 1.06);
      };
    }
    return { autoFit, addSign, addKindSign, makeBall, setBallType, packCluster, makeNucleus, makeOrbits, signTex, TEX };
  })() : null;

  const examples = [];
  // ====================================================================
  // 1. FIREWORK COLOURS: an electron jumps up and falls back; each element gives its own colour
  // ====================================================================
  const FW = [
    { sym: 'Li', name: 'Lithium', p: 3, n: 4, color: '#e11d48', cname: 'Red', rp3: 0.24, rpf: 8, radii: [40, 56] },
    { sym: 'Na', name: 'Sodium', p: 11, n: 12, color: '#facc15', cname: 'Yellow', rp3: 0.19, rpf: 5.6, radii: [44, 60, 76] },
    { sym: 'B', name: 'Boron', p: 5, n: 6, color: '#22c55e', cname: 'Green', rp3: 0.22, rpf: 7, radii: [40, 56] }
  ];
  const FW_D = 6.5;
  function fwPhase(f) {
    let jump = 0;
    if (f >= 0.14 && f < 0.24) jump = ease((f - 0.14) / 0.1);
    else if (f >= 0.24 && f < 0.44) jump = 1;
    else if (f >= 0.44 && f < 0.54) jump = 1 - ease((f - 0.44) / 0.1);
    const pf = (f - 0.5) / 0.2, bf = (f - 0.7) / 0.28;
    return { jump, photon: pf >= 0 && pf <= 1 ? pf : -1, burst: bf >= 0 && bf <= 1 ? bf : -1, cap: f < 0.44 ? 0 : f < 0.7 ? 1 : 2 };
  }
  function fwReadout(d, cap) {
    const c = ['Heat gives an electron extra energy, so it jumps up.', 'It falls back and gives off the energy as light.', `${d.cname} light: that is ${d.name.toLowerCase()}!`][cap];
    return `<span class="mca-hide"><b>${d.name} atom</b>: ${d.p} protons, ${d.n} neutrons, ${d.p} electrons</span><span style="color:var(--t-muted)">${c}</span>`;
  }
  const fwButtons = () => FW.map((d, i) => btn('mca-fw-' + i, d.name)).join('');
  examples.push({
    kind: 'example',
    title: 'Real life: Firework colours',
    text: '<p>Fireworks get their colours from <b>metal atoms</b>. The heat lifts an <b>electron</b> to a higher level, and when it falls back it gives off <b>light</b>. Each element gives its own colour: <b>lithium red</b>, <b>sodium yellow</b>, <b>boron green</b>. Pick an element!</p>',
    explain: '<p>On the left is one <b>atom</b> with its <b>red protons (+)</b>, <b>grey neutrons (0)</b> and <b>indigo electrons (−)</b> on rings. The outer electron jumps to the dashed ring, then falls back and a flash of light flies to the dark sky on the right, where a burst opens. Press <b>Lithium, Sodium or Boron</b> to change the colour. Drag the picture to turn it.</p>',
    say: 'This picture is in three dimensions, so you can drag it to turn it around. On the left is an atom with its red protons, grey neutrons and indigo electrons. Watch the electron on the outer ring. Heat gives it extra energy, so it jumps up to the dashed ring. Then it falls back down, and it gives off that energy as a flash of light. The flash flies to the night sky on the right and a firework bursts open. Now press the buttons. Lithium bursts red, sodium bursts yellow, and boron bursts green. Every element has its own energy gaps, so every element makes its own colour.',
    mount(el, api) {
      const sh = flatShell(el, fwButtons());
      const svg = sh.svg, CX = 98, CY = 106, SY = 0.8;
      let cur = 1, t0 = 0, lastT = 0, capKey = -1, atom = null;
      txt(svg, CX, 16, '', { id: 'mca-fw-title' });
      const title = svg.lastChild;
      const ringHi = svgEl('ellipse', { cx: CX, cy: CY, rx: 10, ry: 8, fill: 'none', stroke: '#f59e0b', 'stroke-width': 1.6, 'stroke-dasharray': '3 4' }, svg);
      const holder = svgEl('g', {}, svg);
      svgEl('rect', { x: 236, y: 28, width: 158, height: 124, rx: 10, fill: '#0b1226' }, svg);
      for (let i = 0; i < 12; i++) svgEl('circle', { cx: 246 + 140 * hash01(i * 2.1), cy: 36 + 100 * hash01(i * 3.7 + 1), r: 1.3, fill: '#e2e8f0' }, svg);
      const SPX = 315, SPY = 84, N = 26;
      const sparks = [];
      for (let i = 0; i < N; i++) sparks.push({ c: svgEl('circle', { r: 3, fill: '#facc15', opacity: 0 }, svg), a: (2 * Math.PI * i) / N + 0.3 * Math.sin(i * 5), s: 0.6 + 0.4 * ((i * 0.618) % 1) });
      const photon = svgEl('circle', { r: 6, fill: '#facc15', opacity: 0 }, svg);
      const sky = txt(svg, 315, 143, '', { 'font-size': 13, fill: '#facc15' });
      function setElem(i) {
        cur = i; const d = FW[i];
        holder.innerHTML = '';
        atom = flatAtom(holder, CX, CY, { rp: d.rpf, er: 6, radii: d.radii, sy: SY });
        atom.setNucleus(typesFor(d.p, d.n)); atom.setElectrons(shellCounts(d.p));
        const last = shellCounts(d.p).filter(n => n).length - 1;
        ringHi.setAttribute('rx', d.radii[last] + 18); ringHi.setAttribute('ry', (d.radii[last] + 18) * SY);
        title.textContent = d.name + ' atom';
        sky.setAttribute('fill', d.color);
        sparks.forEach(s => s.c.setAttribute('fill', d.color)); photon.setAttribute('fill', d.color);
        t0 = lastT; capKey = -1;
        hilite(sh.row, 'button', b => b.id === 'mca-fw-' + i);
      }
      sh.row.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => setElem(i)));
      setElem(1);
      api.loop(t => {
        lastT = t;
        const d = FW[cur], f = (((t - t0) % FW_D) + FW_D) % FW_D / FW_D, ph = fwPhase(f);
        const lastIdx = atom.es.length - 1;
        atom.es.forEach(e => { e.dr = 0; });
        atom.es[lastIdx].dr = 18 * ph.jump;
        atom.tick(t);
        const je = atom.es[lastIdx], hot = ph.jump > 0.05;
        je.g.firstChild.setAttribute('fill', hot ? d.color : ELEC);
        if (ph.photon >= 0) {
          const q = ease(ph.photon), x0 = CX + 92, y0 = CY - 4;
          photon.setAttribute('cx', (x0 + (236 + 30 - x0) * q).toFixed(1)); photon.setAttribute('cy', (y0 + (SPY - y0) * q - 22 * Math.sin(Math.PI * q)).toFixed(1));
          photon.setAttribute('opacity', 1);
        } else photon.setAttribute('opacity', 0);
        sparks.forEach(s => {
          if (ph.burst < 0) { s.c.setAttribute('opacity', 0); return; }
          const b = ph.burst, R = 58 * Math.sqrt(b) * s.s;
          s.c.setAttribute('cx', (SPX + R * Math.cos(s.a)).toFixed(1)); s.c.setAttribute('cy', (SPY + R * Math.sin(s.a) * 0.9 + 36 * b * b).toFixed(1));
          s.c.setAttribute('r', (3.4 * (1 - b * 0.6)).toFixed(2)); s.c.setAttribute('opacity', (1 - b * b).toFixed(2));
        });
        sky.textContent = ph.burst >= 0 ? d.cname + ' light' : '';
        if (ph.cap !== capKey) { capKey = ph.cap; sh.read.innerHTML = fwReadout(d, ph.cap); }
      });
    },
    scene3d: HAS3D ? Chem3D.define({ distance: 11.5, pitch: 0.2, yaw: 0.15, target: [-0.3, 0, 0], autoRotate: 0 }, (view, ctx) => {
      const AX = -3.7, SKX = 3.2, SKY = 0.15, N = 90;
      const nuc = H3.makeNucleus(view, 23, 0.19, [AX, 0, 0]);
      const orb = H3.makeOrbits(view, RADII, TILTS, { er: 0.15, pos: [AX, 0, 0], maxE: 11 });
      const tmp = new THREE.Vector3(), dm = new THREE.Object3D();
      // dashed higher level
      const hi = new THREE.Group(); view.scene.add(hi);
      const dotMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' }), dotGeo = new THREE.SphereGeometry(1, 8, 6);
      const dots = new THREE.InstancedMesh(dotGeo, dotMat, 44); hi.add(dots);
      for (let i = 0; i < 44; i++) { const a = (i / 44) * Math.PI * 2; dm.position.set(Math.cos(a), 0, Math.sin(a)); dm.scale.setScalar(i % 2 ? 0.035 : 0.022); dm.updateMatrix(); dots.setMatrixAt(i, dm.matrix); }
      // night sky
      const board = view.box(5.0, 3.4, 0.25, '#0b1226', { shininess: 30 }); board.position.set(SKX, SKY, -0.3);
      const starGeo = new THREE.SphereGeometry(1, 6, 4), starMat = new THREE.MeshBasicMaterial({ color: '#e2e8f0' });
      const stars = new THREE.InstancedMesh(starGeo, starMat, 24); view.scene.add(stars);
      for (let i = 0; i < 24; i++) { dm.position.set(SKX - 2.3 + 4.6 * hash01(i * 2.1), SKY - 1.5 + 3.0 * hash01(i * 3.7 + 1), -0.12); dm.scale.setScalar(0.03); dm.updateMatrix(); stars.setMatrixAt(i, dm.matrix); }
      const sparkGeo = new THREE.SphereGeometry(1, 8, 6), sparkMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
      const sparks = new THREE.InstancedMesh(sparkGeo, sparkMat, N); sparks.frustumCulled = false; view.scene.add(sparks);
      const dirs = [];
      for (let i = 0; i < N; i++) {
        const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), th = i * 2.399963;
        dirs.push({ v: new THREE.Vector3(r * Math.cos(th), y, r * Math.sin(th)), s: 0.65 + 0.35 * ((i * 0.618) % 1) });
      }
      const flash = view.sphere(1, '#ffffff', { opacity: 0.35, shininess: 5 }); flash.visible = false;
      const photon = [0, 1, 2, 3].map(i => view.sphere([0.2, 0.15, 0.11, 0.07][i], '#facc15', { emissive: '#f59e0b', opacity: [0.999, 0.6, 0.4, 0.25][i] }));
      const pHalo = view.sphere(0.42, '#fde047', { opacity: 0.25, shininess: 5 }); photon.push(pHalo);
      photon.forEach(m => { m.visible = false; });
      const title = view.label('', [AX, 3.15, 0], { size: 0.78, color: '#1f2937' });
      const skyLab = view.label('', [SKX, -2.25, 0.3], { size: 0.62, color: '#facc15', bg: 'rgba(11,18,38,0.92)' }); skyLab.visible = false;
      view.label('higher level', [AX + 0.2, -3.0, 0], { size: 0.55, color: '#b45309' });
      const fit = H3.autoFit(view, 6.2, 3.45);
      const row = ctx.controls(`<div class="scene-slider-row" ${rowStyle}>${fwButtons()}</div><div class="scene-slider-row mca-read" ${readStyle}></div>`);
      const read = row.querySelector('.mca-read');
      let cur = 1, t0 = 0, lastT = 0, capKey = -1, jShell = 1, lastSway = 0, burstOn = false;
      function setElem(i) {
        cur = i; const d = FW[i], cnt = shellCounts(d.p);
        nuc.layout(typesFor(d.p, d.n), d.rp3); orb.set(cnt);
        jShell = cnt.filter(n => n).length - 1;
        hi.position.set(AX, 0, 0); hi.rotation.copy(orb.shells[jShell].g.rotation);
        title.userData.setText(d.name + ' atom');
        [sparkMat, dotMat].forEach(m => m.color.set(d.color));
        photon.forEach(m => { m.material.color.set(d.color); m.material.emissive.set(d.color); });
        skyLab.material.map && skyLab.userData.setText(d.cname + ' light');
        flash.material.color.set(d.color);
        t0 = lastT; capKey = -1;
        hilite(row, 'button', b => b.id === 'mca-fw-' + i);
      }
      row.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => setElem(i)));
      setElem(1);
      dm.position.set(0, 0, 0); dm.scale.setScalar(0.0001); dm.updateMatrix();
      for (let i = 0; i < N; i++) sparks.setMatrixAt(i, dm.matrix);
      sparks.instanceMatrix.needsUpdate = true;
      const P0 = new THREE.Vector3(AX + 2.4, 0.3, 0.4), P1 = new THREE.Vector3(SKX - 2.2, SKY + 0.2, 0.5);
      view.run((t, dt) => {
        lastT = t; fit();
        const d = FW[cur], f = (((t - t0) % FW_D) + FW_D) % FW_D / FW_D, ph = fwPhase(f);
        const sw = 0.2 * Math.sin(t * 0.35); view.cam.yaw += sw - lastSway; lastSway = sw;
        nuc.tick(t, 0.02);
        orb.es.forEach(e => { e.dr = 0; });
        const je = orb.es[d.p - 1];
        je.dr = 0.62 * ph.jump;
        orb.tick(t);
        const hot = ph.jump > 0.05;
        je.m.material.color.set(hot ? d.color : ELEC); je.m.material.emissive.set(hot ? d.color : ELEC_GLOW);
        hi.scale.setScalar(orb.shells[jShell].r + 0.62);
        if (ph.photon >= 0) {
          photon.forEach((m, i) => {
            const q = clamp01(ph.photon - (i < 4 ? i * 0.05 : 0));
            tmp.lerpVectors(P0, P1, ease(q)); tmp.y += Math.sin(Math.PI * q) * 0.7;
            m.position.copy(tmp); m.visible = ph.photon - (i < 4 ? i * 0.05 : 0) >= 0;
          });
        } else photon.forEach(m => { m.visible = false; });
        if (ph.burst >= 0) {
          const b = ph.burst, R = 1.75 * Math.sqrt(b);
          for (let i = 0; i < N; i++) {
            const dd = dirs[i];
            dm.position.set(SKX + dd.v.x * R * dd.s, SKY + 0.3 + dd.v.y * R * dd.s - 0.9 * b * b, dd.v.z * R * dd.s * 0.6);
            dm.scale.setScalar(Math.max(0.001, 0.13 * (1 - b * 0.85)));
            dm.updateMatrix(); sparks.setMatrixAt(i, dm.matrix);
          }
          sparks.instanceMatrix.needsUpdate = true; burstOn = true;
          flash.visible = b < 0.18; flash.position.set(SKX, SKY + 0.3, 0.2); flash.scale.setScalar(0.5 + 3 * b); flash.material.opacity = 0.4 * (1 - b / 0.18);
          skyLab.visible = true;
        } else if (burstOn) {
          dm.scale.setScalar(0.0001); dm.updateMatrix();
          for (let i = 0; i < N; i++) sparks.setMatrixAt(i, dm.matrix);
          sparks.instanceMatrix.needsUpdate = true; burstOn = false; flash.visible = false; skyLab.visible = false;
        }
        if (ph.cap !== capKey) { capKey = ph.cap; read.innerHTML = fwReadout(d, ph.cap); }
      });
      return () => { dotMat.dispose(); dotGeo.dispose(); starGeo.dispose(); starMat.dispose(); sparkGeo.dispose(); sparkMat.dispose(); dots.dispose(); stars.dispose(); sparks.dispose(); };
    }) : undefined
  });
  // ====================================================================
  // 2. CARBON DATING: carbon-12 is stable; carbon-14 slowly turns into nitrogen-14
  // ====================================================================
  const CD_D = 11.5;
  // stage: 0 carbon-14 waiting, 1 glowing, 2 neutron has become a proton and an electron flies out, 3 nitrogen-14
  function cdPhase(l) {
    const stage = l < 3 ? 0 : l < 4.2 ? 1 : l < 6.6 ? 2 : 3;
    return {
      stage,
      pop: ease(clamp01(l / 0.6)) * (1 - ease(clamp01((l - 10.8) / 0.7))),
      glow: stage === 1 ? 0.5 + 0.5 * Math.sin((l - 3) * 9) : 0,
      beta: l >= 4.2 && l < 6.6 ? (l - 4.2) / 2.4 : -1,
      admit: (l - 6.6) / 1.4
    };
  }
  const CD_TYPES14 = typesFor(6, 8);
  const CD_JBALL = CD_TYPES14.findIndex((ty, i) => ty === 'n' && i >= 6);
  function cdReadout(mode, stage) {
    if (mode === 0) return '<span><b>Carbon-12</b>: 6 protons, 6 neutrons, 6 electrons</span><span class="mca-hide" style="color:var(--t-muted)">Stable: it never changes.</span>';
    if (stage < 2) return '<span><b>Carbon-14</b>: 6 protons, 8 neutrons, 6 electrons</span><span class="mca-hide" style="color:var(--t-muted)">' + (stage === 0 ? 'Too many neutrons: it is unstable.' : 'One neutron is about to change...') + '</span>';
    if (stage === 2) return '<span><b>A neutron turns into a proton</b> and an electron shoots out!</span><span class="mca-hide" style="color:var(--t-muted)">Now 7 protons: a new element.</span>';
    return '<span><b>Nitrogen-14</b>: 7 protons, 7 neutrons, 7 electrons</span><span class="mca-hide" style="color:var(--t-muted)">Half of a carbon-14 sample changes like this every 5,730 years.</span>';
  }
  const cdButtons = () => btn('mca-cd-0', 'Carbon-12') + btn('mca-cd-1', 'Carbon-14');
  examples.push({
    kind: 'example',
    title: 'Real life: Carbon dating',
    text: '<p>How old is an ancient bone? Living things contain <b>carbon-12</b> (6 neutrons) and a little <b>carbon-14</b> (8 neutrons). After death the unstable carbon-14 slowly changes into <b>nitrogen</b>, so counting what is left gives the age. Half is gone after <b>5,730 years</b>.</p>',
    explain: '<p>The clump in the middle is the <b>nucleus</b>: 6 <b>red protons (+)</b> and grey <b>neutrons (0)</b>, with <b>indigo electrons (−)</b> on two rings. In <b>Carbon-14</b> one neutron glows, turns red as it becomes a proton, and an electron flies out. The label changes to <b>Nitrogen-14</b>. Press <b>Carbon-12</b> to see an atom that never changes.</p>',
    say: 'Look at the middle of this atom. It is the nucleus, with red protons and grey neutrons. Carbon-twelve has six protons and six neutrons, and it is stable, so press that button and nothing ever happens. Now press carbon-fourteen. It has six protons but eight neutrons, which is too many, so it is unstable. Watch one neutron start to glow. It turns into a proton, and a fast electron shoots out. Now there are seven protons, so the atom has become nitrogen. Scientists count how much carbon-fourteen is left in an old bone. Half of it changes every five thousand seven hundred thirty years, and that tells them the age.',
    mount(el, api) {
      const sh = flatShell(el, cdButtons());
      const svg = sh.svg, CX = 200, CY = 100;
      let mode = 1, t0 = 0, lastT = 0, applied = -1, atom = null;
      const title = txt(svg, CX, 16, '', {});
      const holder = svgEl('g', {}, svg);
      const beta = svgEl('g', { opacity: 0 }, svg);
      svgEl('circle', { r: 7, fill: ELEC, stroke: '#1e1b4b', 'stroke-width': 0.8 }, beta);
      const bt = svgEl('text', { y: 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#fff' }, beta); bt.textContent = '−';
      const bl = txt(svg, 0, 0, 'electron', { 'font-size': 12, 'font-weight': 700, opacity: 0 });
      function build() {
        holder.innerHTML = '';
        atom = flatAtom(holder, CX, CY, { rp: 7, er: 6, radii: [46, 68], sy: 0.8 });
        atom.setNucleus(mode === 0 ? typesFor(6, 6) : CD_TYPES14); atom.setElectrons([2, 4]);
        title.textContent = mode === 0 ? 'Carbon-12' : 'Carbon-14';
        applied = -1;
      }
      function reset() { t0 = lastT; build(); hilite(sh.row, 'button', b => b.id === 'mca-cd-' + mode); }
      sh.row.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => { mode = i; reset(); }));
      reset();
      api.loop(t => {
        lastT = t;
        const l = ((t - t0) % CD_D + CD_D) % CD_D, ph = cdPhase(l);
        const stage = mode === 0 ? 0 : ph.stage;
        if (mode === 1 && l < 0.1 && applied === 3) { build(); applied = -1; }
        if (stage !== applied) {
          if (mode === 1) {
            if (stage === 2) { atom.setBall(CD_JBALL, 'p'); title.textContent = 'Nitrogen-14'; }
            if (stage === 3) { atom.setElectrons([2, 5]); atom.es[6].fly = { x: 24, y: 60, t0: t, dur: 1.4 }; }
            if (stage < 2) atom.setBall(CD_JBALL, 'n');
          }
          applied = stage; sh.read.innerHTML = cdReadout(mode, stage);
        }
        if (mode === 1) {
          const b = atom.balls[CD_JBALL];
          b.c.setAttribute('stroke', ph.glow > 0.3 || stage === 2 && ph.beta < 0.15 ? '#facc15' : 'rgba(15,23,42,0.35)');
          b.c.setAttribute('stroke-width', ph.glow > 0.3 ? 3.2 : 0.8);
        }
        atom.root.setAttribute('opacity', mode === 1 ? ph.pop.toFixed(2) : 1);
        atom.tick(t);
        if (mode === 1 && ph.beta >= 0) {
          const q = ease(ph.beta), x = CX + 8 + 190 * q, y = CY - 6 - 24 * q;
          beta.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); beta.setAttribute('opacity', (1 - clamp01((ph.beta - 0.7) / 0.3)).toFixed(2));
          bl.setAttribute('x', x.toFixed(1)); bl.setAttribute('y', (y - 12).toFixed(1)); bl.setAttribute('opacity', beta.getAttribute('opacity'));
        } else { beta.setAttribute('opacity', 0); bl.setAttribute('opacity', 0); }
      });
    },
    scene3d: HAS3D ? Chem3D.define({ distance: 10, pitch: 0.3, yaw: 0.5, target: [0, 0.5, 0], autoRotate: 0.2 }, (view, ctx) => {
      const RP = 0.4, R2 = [2.0, 2.9];
      const nuc = H3.makeNucleus(view, 14, RP);
      const orb = H3.makeOrbits(view, R2, TILTS, { er: 0.22, maxE: 8 });
      const title = view.label('', [0, 3.5, 0], { size: 0.85, color: '#1f2937' });
      const beta = view.sphere(0.2, ELEC, { emissive: ELEC_GLOW, opacity: 0.999, shininess: 90 }); H3.addKindSign(view, beta, 'e'); beta.visible = false;
      const bLab = view.label('electron', [0, 0, 0], { size: 0.55, color: ELEC, bold: true }); bLab.visible = false;
      const fit = H3.autoFit(view, 5, 3.55);
      const row = ctx.controls(`<div class="scene-slider-row" ${rowStyle}>${cdButtons()}</div><div class="scene-slider-row mca-read" ${readStyle}></div>`);
      const read = row.querySelector('.mca-read');
      let mode = 1, t0 = 0, lastT = 0, applied = -1;
      const FROM = new THREE.Vector3(-7, 1.6, 2.5), DIR = new THREE.Vector3(1, 0.35, 0.5).normalize();
      function build() {
        nuc.layout(mode === 0 ? typesFor(6, 6) : CD_TYPES14, RP); orb.set([2, 4]);
        title.userData.setText(mode === 0 ? 'Carbon-12' : 'Carbon-14');
        nuc.balls.forEach(b => { b.m.material.emissive.set('#000000'); b.m.material.emissiveIntensity = 0; });
        applied = -1;
      }
      function reset() { t0 = lastT; build(); hilite(row, 'button', b => b.id === 'mca-cd-' + mode); }
      row.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => { mode = i; reset(); }));
      reset();
      view.run((t) => {
        lastT = t; fit();
        const l = ((t - t0) % CD_D + CD_D) % CD_D, ph = cdPhase(l);
        const stage = mode === 0 ? 0 : ph.stage;
        if (mode === 1 && l < 0.1 && applied === 3) { build(); }
        if (stage !== applied) {
          if (mode === 1) {
            const jb = nuc.balls[CD_JBALL].m;
            if (stage === 2) { H3.setBallType(jb, 'p'); title.userData.setText('Nitrogen-14'); }
            if (stage === 3) { orb.set([2, 5]); orb.es[6].fly = { from: FROM, t0: t, dur: 1.4 }; }
            if (stage < 2) H3.setBallType(jb, 'n');
          }
          applied = stage; read.innerHTML = cdReadout(mode, stage);
        }
        nuc.tick(t, 0.03);
        const sc = mode === 1 ? Math.max(0.001, ph.pop) : 1;
        nuc.group.scale.setScalar(sc); orb.shells.forEach(s => { s.g.scale.setScalar(sc); s.g.updateMatrixWorld(true); });
        if (mode === 1) {
          const jb = nuc.balls[CD_JBALL].m, em = ph.glow > 0.3 || (stage === 2 && ph.beta < 0.15);
          jb.material.emissive.set(em ? '#fde047' : '#000000'); jb.material.emissiveIntensity = em ? 0.9 : 0;
        }
        orb.tick(t);
        if (mode === 1 && ph.beta >= 0) {
          const q = ease(ph.beta), jb = nuc.balls[CD_JBALL].m;
          beta.position.copy(jb.position).addScaledVector(DIR, 0.4 + 9 * q);
          beta.material.opacity = 0.999 * (1 - clamp01((ph.beta - 0.7) / 0.3));
          beta.visible = true; bLab.visible = true; bLab.position.set(beta.position.x, beta.position.y + 0.6, beta.position.z);
        } else { beta.visible = false; bLab.visible = false; }
      });
    }) : undefined
  });
  // ====================================================================
  // 3. HELIUM BALLOON: helium atoms are far lighter than the molecules in air
  // ====================================================================
  const HE_TYPES = typesFor(2, 2);
  const HE_N = 10;
  function heReadout(mode) {
    return '<span class="mca-hide"><b>Helium atom</b>: 2 protons, 2 neutrons, 2 electrons</span>' +
      '<span style="color:var(--t-muted)">' + (mode === 0 ? 'Very light: about 7 times lighter than an air molecule, so the balloon floats up.'
        : 'Air molecules are heavier, so an air balloon is not lighter than the air around it and it sinks.') + '</span>';
  }
  const heButtons = () => btn('mca-he-0', 'Helium') + btn('mca-he-1', 'Air');
  // bounce a point inside an ellipsoid (semi-axes rx, ry, rz): reflect velocity where it hits the wall
  function bounceIn(p, v, rx, ry, rz) {
    const q = (p.x / rx) * (p.x / rx) + (p.y / ry) * (p.y / ry) + (p.z / rz) * (p.z / rz);
    if (q <= 1) return;
    const nx = p.x / (rx * rx), ny = p.y / (ry * ry), nz = p.z / (rz * rz), nl = Math.hypot(nx, ny, nz) || 1;
    const ux = nx / nl, uy = ny / nl, uz = nz / nl, dp = v.x * ux + v.y * uy + v.z * uz;
    if (dp > 0) { v.x -= 2 * dp * ux; v.y -= 2 * dp * uy; v.z -= 2 * dp * uz; }
    const k = 0.98 / Math.sqrt(q); p.x *= k; p.y *= k; p.z *= k;
  }
  examples.push({
    kind: 'example',
    title: 'Real life: Helium balloons',
    text: '<p>Why does a <b>helium</b> balloon float? A helium atom has just <b>2 protons, 2 neutrons</b> and 2 electrons, so it is much lighter than the <b>nitrogen and oxygen molecules</b> in air. A balloon full of helium is lighter than the air around it, so it rises. Try filling it with air!</p>',
    explain: '<p>On the right is one <b>helium atom</b>: 2 <b>red protons (+)</b>, 2 <b>grey neutrons (0)</b> and 2 <b>indigo electrons (−)</b>. Below it is a heavier <b>air molecule</b>, two blue nitrogen atoms. The balloon on the left holds ten tiny particles that whizz about. Press <b>Helium</b> and it floats up; press <b>Air</b> and it sinks.</p>',
    say: 'Let us find out why a helium balloon floats. On the right is a single helium atom. It has just two protons, two neutrons, and two electrons, so it is very light. Below it is a nitrogen molecule from the air, which is about seven times heavier. On the left is the balloon, and the little particles inside are whizzing around. Press the helium button. The balloon is full of very light atoms, so it is lighter than the air around it, and it floats up. Now press the air button. A balloon of air is not lighter than the air outside, so it sinks.',
    mount(el, api) {
      const sh = flatShell(el, heButtons());
      const svg = sh.svg, BX = 92, FLOOR = 176, WT = 164, KOFF = 48, RX = 38, RY = 44, IX = 27, IY = 33;
      let mode = 0, lastT = 0, by = WT - KOFF - 46;
      svgEl('line', { x1: 10, y1: FLOOR, x2: 392, y2: FLOOR, stroke: 'var(--t-muted)', 'stroke-width': 1.5 }, svg);
      svgEl('rect', { x: BX - 11, y: WT, width: 22, height: FLOOR - WT, fill: '#64748b' }, svg);
      const string = svgEl('line', { x1: BX, y1: WT, x2: BX, y2: WT - 40, stroke: 'var(--t-muted)', 'stroke-width': 1.5 }, svg);
      const bal = svgEl('g', {}, svg);
      svgEl('ellipse', { rx: RX, ry: RY, fill: '#f97316', 'fill-opacity': 0.4, stroke: '#ea580c', 'stroke-width': 2 }, bal);
      svgEl('path', { d: `M-5,${RY} L5,${RY} L0,${RY + 7} Z`, fill: '#ea580c' }, bal);
      const parts = [];
      for (let i = 0; i < HE_N; i++) {
        const he = svgEl('circle', { r: 4.5, fill: '#67e8f9', stroke: '#0e7490', 'stroke-width': 0.8 }, bal);
        const ag = svgEl('g', {}, bal);
        const isO = i >= 8;
        svgEl('line', { x1: -4, y1: 0, x2: 4, y2: 0, stroke: '#94a3b8', 'stroke-width': 2 }, ag);
        svgEl('circle', { cx: -4.5, r: 4, fill: isO ? '#ef4444' : '#3b82f6' }, ag); svgEl('circle', { cx: 4.5, r: 4, fill: isO ? '#ef4444' : '#3b82f6' }, ag);
        const a = i * 2.4;
        parts.push({ he, ag, x: IX * 0.7 * Math.cos(a), y: IY * 0.7 * Math.sin(a * 1.3), vx: 0, vy: 0, ang: a, w: 0.6 + 0.3 * (i % 3), a });
        parts[i].vx = Math.cos(a * 3) ; parts[i].vy = Math.sin(a * 3);
      }
      const title = txt(svg, BX, 16, '', {});
      // helium atom (right) and an air molecule under it
      txt(svg, 300, 16, 'Helium atom', {});
      const atom = flatAtom(svg, 300, 68, { rp: 7.5, er: 6, radii: [40], sy: 0.85, speeds: [1.6] });
      atom.setNucleus(HE_TYPES); atom.setElectrons([2]);
      svgEl('line', { x1: 288, y1: 140, x2: 312, y2: 140, stroke: '#94a3b8', 'stroke-width': 4 }, svg);
      svgEl('circle', { cx: 288, cy: 140, r: 13, fill: '#3b82f6', stroke: '#1e3a8a', 'stroke-width': 1 }, svg); svgEl('circle', { cx: 312, cy: 140, r: 13, fill: '#3b82f6', stroke: '#1e3a8a', 'stroke-width': 1 }, svg);
      txt(svg, 300, 172, 'Air molecule (N₂)', {});
      function setMode(m) { mode = m; title.textContent = m === 0 ? 'Balloon of helium' : 'Balloon of air'; sh.read.innerHTML = heReadout(m); hilite(sh.row, 'button', b => b.id === 'mca-he-' + m); }
      sh.row.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => setMode(i)));
      setMode(0);
      api.loop((t, dt) => {
        lastT = t;
        const target = mode === 0 ? WT - KOFF - 46 : WT - KOFF;
        by += (target - by) * Math.min(1, dt * 2.2);
        const bob = mode === 0 ? 3 * Math.sin(t * 1.5) : 0, cy = by + bob;
        bal.setAttribute('transform', `translate(${(BX + (mode === 0 ? 3 * Math.sin(t * 0.9) : 0)).toFixed(1)} ${cy.toFixed(1)})`);
        string.setAttribute('x1', BX); string.setAttribute('y2', (cy + RY + 6).toFixed(1));
        string.setAttribute('opacity', WT - (cy + RY + 6) > 3 ? 1 : 0);
        const sp = mode === 0 ? 62 : 24;
        parts.forEach((p, i) => {
          const isO = i >= 8;
          p.x += p.vx * sp * dt; p.y += p.vy * sp * dt;
          const q = (p.x / IX) * (p.x / IX) + (p.y / IY) * (p.y / IY);
          if (q > 1) {
            const nx = p.x / (IX * IX), ny = p.y / (IY * IY), nl = Math.hypot(nx, ny), ux = nx / nl, uy = ny / nl, dp = p.vx * ux + p.vy * uy;
            if (dp > 0) { p.vx -= 2 * dp * ux; p.vy -= 2 * dp * uy; }
            const k = 0.98 / Math.sqrt(q); p.x *= k; p.y *= k;
          }
          p.ang += p.w * dt;
          p.he.setAttribute('cx', p.x.toFixed(1)); p.he.setAttribute('cy', p.y.toFixed(1)); p.he.setAttribute('display', mode === 0 ? 'inline' : 'none');
          p.ag.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(p.ang * 57.3).toFixed(0)})`); p.ag.setAttribute('display', mode === 1 ? 'inline' : 'none');
        });
        atom.tick(t);
      });
    },
    scene3d: HAS3D ? Chem3D.define({ distance: 11, pitch: 0.12, yaw: 0.25, target: [0, 0.2, 0], autoRotate: 0 }, (view, ctx) => {
      const BX = -3.3, AXR = 3.1, FLOOR = -2.6, WTOP = FLOOR + 0.4, KOFF = 1.5, L = 1.8;
      const slab = view.box(10, 0.16, 3.2, '#c7d2fe', { opacity: 0.55 }); slab.position.set(0, FLOOR - 0.08, 0);
      const wt = view.box(0.6, 0.4, 0.6, '#64748b', { shininess: 30 }); wt.position.set(BX, FLOOR + 0.2, 0);
      const string = view.cylinder([BX, WTOP, 0], [BX, WTOP + 1, 0], 0.025, '#64748b');
      const bal = new THREE.Group(); view.scene.add(bal);
      const body = view.sphere(1, '#f97316', { opacity: 0.34, shininess: 90, specular: '#ffffff' }); body.scale.set(1.15, 1.35, 1.15); bal.add(body);
      const knot = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 12), view.mat('#ea580c')); knot.position.y = -1.42; knot.rotation.x = Math.PI; bal.add(knot);
      const IXY = [0.85, 1.05, 0.85];
      const mk = (i) => ({ p: new THREE.Vector3(Math.cos(i * 2.4) * 0.5, Math.sin(i * 3.1) * 0.6, Math.sin(i * 1.7) * 0.5), v: new THREE.Vector3(Math.cos(i * 7.1), Math.sin(i * 5.3), Math.cos(i * 3.3 + 1)).normalize(), w: 0.6 + 0.3 * (i % 3) });
      const heP = [], airP = [];
      const cylG = new THREE.CylinderGeometry(0.035, 0.035, 0.22, 8), cylM = view.mat('#cbd5e1', { shininess: 40 });
      for (let i = 0; i < HE_N; i++) {
        const m = view.sphere(0.18, '#22d3ee', { shininess: 90 }); bal.add(m); heP.push(Object.assign(mk(i), { m }));
        const g = new THREE.Group(), col = i >= 8 ? Chem3D.color('O') : Chem3D.color('N');
        const a1 = view.sphere(0.11, col), a2 = view.sphere(0.11, col), bd = new THREE.Mesh(cylG, cylM);
        a1.position.x = -0.13; a2.position.x = 0.13; bd.rotation.z = Math.PI / 2; g.add(a1, a2, bd); bal.add(g);
        airP.push(Object.assign(mk(i + 5), { m: g }));
      }
      // helium atom (zoomed) and an air molecule for comparison
      const AY = 0.95;
      const nuc = H3.makeNucleus(view, 4, 0.34, [AXR, AY, 0]); nuc.layout(HE_TYPES, 0.34);
      const orb = H3.makeOrbits(view, [1.4], [TILTS[0]], { er: 0.2, pos: [AXR, AY, 0], maxE: 2, speeds: [1.6] }); orb.set([2]);
      const n1 = view.atom('N', [AXR - 0.5, -1.75, 0], { radius: 0.42 }), n2 = view.atom('N', [AXR + 0.5, -1.75, 0], { radius: 0.42 });
      view.bond(n1, n2, { order: 3, radius: 0.05, spread: 0.13 });
      view.label('Helium atom', [AXR, 3.0, 0], { size: 0.78, color: '#1f2937' });
      view.label('Air molecule N₂', [AXR, -2.65, 0], { size: 0.7, color: '#1f2937' });
      const title = view.label('', [BX, 3.3, 0], { size: 0.78, color: '#1f2937' });
      const fit = H3.autoFit(view, 5.1, 3.3);
      const row = ctx.controls(`<div class="scene-slider-row" ${rowStyle}>${heButtons()}</div><div class="scene-slider-row mca-read" ${readStyle}></div>`);
      const read = row.querySelector('.mca-read');
      let mode = 0, lastSway = 0, by = WTOP + KOFF + L;
      function setMode(m) {
        mode = m; title.userData.setText(m === 0 ? 'Balloon of helium' : 'Balloon of air'); read.innerHTML = heReadout(m);
        heP.forEach(o => { o.m.visible = m === 0; }); airP.forEach(o => { o.m.visible = m === 1; });
        hilite(row, 'button', b => b.id === 'mca-he-' + m);
      }
      row.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => setMode(i)));
      setMode(0);
      view.run((t, dt) => {
        fit();
        const sw = 0.2 * Math.sin(t * 0.35); view.cam.yaw += sw - lastSway; lastSway = sw;
        const target = WTOP + KOFF + (mode === 0 ? L : 0.02);
        by += (target - by) * Math.min(1, dt * 2.2 + (t === 0 ? 1 : 0));
        const bob = mode === 0 ? 0.08 * Math.sin(t * 1.5) : 0;
        bal.position.set(BX + (mode === 0 ? 0.08 * Math.sin(t * 0.9) : 0), by + bob, 0);
        bal.rotation.z = mode === 0 ? 0.05 * Math.sin(t * 1.1) : 0;
        view.placeCylinder(string, [BX, WTOP, 0], [BX, by + bob - KOFF - 0.05, 0], 0.025);
        string.visible = by + bob - KOFF - 0.05 - WTOP > 0.08;
        const list = mode === 0 ? heP : airP, sp = mode === 0 ? 1.7 : 0.65;
        list.forEach(o => {
          o.p.addScaledVector(o.v, sp * dt); bounceIn(o.p, o.v, IXY[0], IXY[1], IXY[2]);
          o.m.position.copy(o.p);
          if (mode === 1) { o.m.rotation.y += o.w * dt; o.m.rotation.z += o.w * 0.7 * dt; }
        });
        nuc.tick(t, 0.02); orb.tick(t);
      });
      return () => { cylG.dispose(); };
    }) : undefined
  });
  // ====================================================================
  // 4. GOLD FOIL: alpha particles fired at a gold atom; most go straight through, a few bend or bounce back
  // ====================================================================
  const AU_K = 7, AU_V = 4.5, AU_L = 1.1, AU_X0 = -5.6;
  const AU_AUTO = [2.4, -1.8, 1.2, 2.8, -0.55, 2.1, -2.6, 1.6, 0.09, -2.2, 2.7, -1.1, 0.4, 1.9, -2.9, 1.4];
  const AU_TYPES = typesFor(6, 9);   // a gold nucleus has 79 protons and 118 neutrons: drawn here with fewer balls
  const auFire = b => ({ x: AU_X0, s: b, vx: AU_V, vs: 0, age: 0, done: false, ang: 0, len: 0, lx: AU_X0, ls: b });
  // screened Coulomb repulsion between the alpha particle (+2) and the gold nucleus (+79), integrated in small steps
  function auStep(sh, dt) {
    let left = dt;
    sh.age += dt;
    while (left > 0) {
      const h = Math.min(left, 0.004); left -= h;
      const r2 = sh.x * sh.x + sh.s * sh.s, r = Math.sqrt(r2) + 1e-6;
      const f = AU_K / (r2 + 0.01) * (1 + r / AU_L) * Math.exp(-r / AU_L);
      sh.vx += f * sh.x / r * h; sh.vs += f * sh.s / r * h;
      sh.x += sh.vx * h; sh.s += sh.vs * h;
    }
    if (sh.x > 5.9 || sh.x < -6.3 || Math.abs(sh.s) > 4.6 || sh.age > 7) {
      sh.done = true; sh.ang = Math.atan2(Math.abs(sh.vs), sh.vx) * 180 / Math.PI;
    }
  }
  const auKind = ang => ang < 10 ? 0 : ang < 90 ? 1 : 2;
  function auReadout(tally, mode, aim) {
    const hint = mode === 0 ? 'Almost all pass straight through: atoms are mostly empty space!'
      : aim < 0.25 ? 'Head-on to the tiny nucleus: it bounces straight back!' : aim < 1.2 ? 'Close to the nucleus: the plus charges push it sideways.' : 'Far from the nucleus: it goes straight through.';
    return `<span><b>Fired: ${tally[0] + tally[1] + tally[2]}</b></span><span>straight: ${tally[0]}</span><span>bent: ${tally[1]}</span><span>bounced back: ${tally[2]}</span>` +
      `<span class="mca-hide" style="display:block;color:var(--t-muted)">${hint}</span>`;
  }
  const auControls = () => btn('mca-au-auto', 'Random') + '<span>Aim</span>' +
    '<input type="range" id="mca-au-aim" min="0" max="30" step="1" value="6" style="flex:1 1 70px;max-width:190px" aria-label="How far from the centre the alpha particle is aimed"><span id="mca-au-val" style="min-width:2.4em">0.6</span>';
  function auWire(row, st) {
    const slider = row.querySelector('#mca-au-aim'), val = row.querySelector('#mca-au-val'), autoB = row.querySelector('#mca-au-auto');
    const paint = () => { hilite(row, '#mca-au-auto', () => st.mode === 0); val.textContent = (+slider.value / 10).toFixed(1); };
    autoB.addEventListener('click', () => { st.mode = 0; st.reset(); paint(); });
    slider.addEventListener('input', () => { st.mode = 1; st.aim = +slider.value / 10; st.reset(); paint(); });
    paint();
  }
  examples.push({
    kind: 'example',
    title: 'Real life: The gold foil experiment',
    text: '<p>Around 1910, scientists fired tiny <b>alpha particles</b> (each one <b>2 protons + 2 neutrons</b>) at very thin gold foil. Nearly all went straight through, so an atom is <b>mostly empty space</b>. Only about 1 in 8,000 bounced back, off a tiny, heavy, positive <b>nucleus</b>. Try aiming!</p>',
    explain: '<p>The big pale-gold ball is a <b>gold atom</b>; a few <b>indigo electrons (−)</b> circle inside it. In the middle is the tiny <b>nucleus</b> of <b>red protons (+)</b> and <b>grey neutrons (0)</b> (real gold has many more: 79 protons and 118 neutrons). Small four-ball <b>alpha particles</b> fly in from the left. Slide <b>Aim</b> to change how close to the centre they pass.</p>',
    say: 'This picture shows one gold atom. The big pale ball is the atom, and the electrons circle inside it. Right in the middle is the nucleus, made of protons and neutrons. A real gold nucleus has seventy nine protons and one hundred eighteen neutrons, so this picture uses fewer balls. Small alpha particles, each with two protons and two neutrons, fly in from the left. Watch how nearly all of them go straight through. That means an atom is mostly empty space. Now move the aim slider towards the middle. When an alpha particle passes close to the positive nucleus, it is pushed away, and if it goes head on, it bounces back.',
    mount(el, api) {
      const sh = flatShell(el, auControls());
      const svg = sh.svg, CX = 200, CY = 104, S = 26, SY = 0.8;
      svgEl('circle', { cx: CX, cy: CY, r: 2.7 * S, fill: '#facc15', 'fill-opacity': 0.15, stroke: '#eab308', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, svg);
      txt(svg, CX, 16, 'Gold atom', {});
      txt(svg, 62, 16, 'alpha particles', { 'font-size': 12, 'font-weight': 700 });
      const atom = flatAtom(svg, CX, CY, { rp: 5.2, er: 5, radii: [44, 62], sy: SY, speeds: [1.3, 0.8] });
      atom.setNucleus(AU_TYPES); atom.setElectrons([4, 6]);
      const slots = [];
      for (let i = 0; i < 4; i++) {
        const trail = svgEl('polyline', { fill: 'none', stroke: '#f59e0b', 'stroke-width': 1.6, 'stroke-opacity': 0.85, points: '' }, svg);
        const g = svgEl('g', { display: 'none' }, svg);
        ['n', 'p', 'n', 'p'].forEach((ty, k) => {
          const bx = (k % 2 ? 1 : -1) * 4.6, by = (k < 2 ? -1 : 1) * 4.6;
          const c = svgEl('circle', { cx: bx, cy: by, r: 5, fill: ty === 'p' ? RED : GREY, stroke: 'rgba(15,23,42,0.35)', 'stroke-width': 0.6 }, g);
          const t = svgEl('text', { x: bx, y: by + 3.6, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: FLAT_SIGN[ty][1] }, g); t.textContent = FLAT_SIGN[ty][0];
        });
        slots.push({ trail, g, sh: null, pts: [] });
      }
      const st = { mode: 0, aim: 0.6, tally: [0, 0, 0], reset() { this.tally = [0, 0, 0]; nextFire = lastT + 0.1; paintRead(); } };
      let lastT = 0, nextFire = 0.3, idx = 0;
      const paintRead = () => { sh.read.innerHTML = auReadout(st.tally, st.mode, st.aim); };
      auWire(sh.row, st); paintRead();
      api.loop((t, dt) => {
        lastT = t;
        atom.tick(t);
        if (t >= nextFire) {
          const slot = slots.find(s => !s.sh || s.sh.done) ;
          if (slot) {
            const b = st.mode === 0 ? AU_AUTO[idx++ % AU_AUTO.length] : st.aim;
            slot.sh = auFire(b); slot.pts = []; slot.g.setAttribute('display', 'inline');
          }
          nextFire = t + 1.25;
        }
        slots.forEach(sl => {
          const a = sl.sh; if (!a) return;
          if (!a.done) {
            auStep(a, dt);
            if (a.done) { st.tally[auKind(a.ang)]++; paintRead(); sl.g.setAttribute('display', 'none'); }
            const X = CX + a.x * S, Y = CY - a.s * S;
            sl.g.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)})`);
            if (!sl.pts.length || Math.hypot(a.x - a.lx, a.s - a.ls) > 0.12) { sl.pts.push(X.toFixed(1) + ',' + Y.toFixed(1)); a.lx = a.x; a.ls = a.s; sl.trail.setAttribute('points', sl.pts.join(' ')); }
          }
        });
      });
    },
    scene3d: HAS3D ? Chem3D.define({ distance: 11.5, pitch: 0.2, yaw: 0.35, target: [0, 0.05, 0], autoRotate: 0 }, (view, ctx) => {
      const cloud = view.sphere(2.7, '#facc15', { opacity: 0.13, shininess: 10 });
      const nuc = H3.makeNucleus(view, 15, 0.2); nuc.layout(AU_TYPES, 0.2);
      const orb = H3.makeOrbits(view, [1.6, 2.4], [TILTS[0], TILTS[1]], { er: 0.18, maxE: 10, speeds: [1.3, 0.8] }); orb.set([4, 6]);
      view.label('Gold atom', [0, 3.15, 0], { size: 0.8, color: '#1f2937' });
      view.label('electron cloud', [0, -3.05, 0], { size: 0.6, color: '#92400e' });
      const aLab = view.label('alpha particle', [0, 0, 0], { size: 0.6, color: '#b45309' }); aLab.visible = false;
      const fit = H3.autoFit(view, 5.9, 3.4);
      const row = ctx.controls(`<div class="scene-slider-row" ${rowStyle}>${auControls()}</div><div class="scene-slider-row mca-read" ${readStyle}></div>`);
      const read = row.querySelector('.mca-read');
      const OFF = [[0.17, 0.17, 0.17], [-0.17, -0.17, 0.17], [-0.17, 0.17, -0.17], [0.17, -0.17, -0.17]], TY = ['n', 'p', 'n', 'p'];
      const slots = [];
      for (let i = 0; i < 4; i++) {
        const g = new THREE.Group(); view.scene.add(g); g.visible = false;
        OFF.forEach((o, k) => { const m = H3.makeBall(view, 0.17, TY[k]); m.position.set(o[0], o[1], o[2]); g.add(m); });
        const geom = new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 200), 3)); geom.setDrawRange(0, 0);
        const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.85 })); line.frustumCulled = false; view.scene.add(line);
        slots.push({ g, line, geom, sh: null, n: 0, u: new THREE.Vector3(0, 1, 0), spin: 1 + i * 0.4 });
      }
      const st = { mode: 0, aim: 0.6, tally: [0, 0, 0], reset() { this.tally = [0, 0, 0]; nextFire = lastT + 0.1; paintRead(); } };
      let lastT = 0, nextFire = 0.3, idx = 0, lastSway = 0, newest = null;
      const paintRead = () => { read.innerHTML = auReadout(st.tally, st.mode, st.aim); };
      auWire(row, st); paintRead();
      view.run((t, dt) => {
        lastT = t; fit();
        const sw = 0.2 * Math.sin(t * 0.35); view.cam.yaw += sw - lastSway; lastSway = sw;
        nuc.tick(t, 0.012); orb.tick(t);
        if (t >= nextFire && dt > 0) {
          const slot = slots.find(s => !s.sh || s.sh.done);
          if (slot) {
            const b = st.mode === 0 ? AU_AUTO[idx % AU_AUTO.length] : st.aim;
            slot.u.set(0, 1, st.mode === 0 ? 0.55 * Math.sin(idx * 1.7) : 0).normalize(); idx++;
            slot.sh = auFire(b); slot.n = 0; slot.geom.setDrawRange(0, 0); slot.g.visible = true; newest = slot;
          }
          nextFire = t + 1.25;
        }
        slots.forEach(sl => {
          const a = sl.sh; if (!a) return;
          if (!a.done && dt > 0) {
            auStep(a, dt);
            if (a.done) { st.tally[auKind(a.ang)]++; paintRead(); sl.g.visible = false; }
            sl.g.position.set(a.x, a.s * sl.u.y, a.s * sl.u.z); sl.g.rotation.x += sl.spin * dt; sl.g.rotation.y += 0.7 * sl.spin * dt;
            if (!sl.n || Math.hypot(a.x - a.lx, a.s - a.ls) > 0.1) {
              if (sl.n < 200) {
                const pos = sl.geom.attributes.position; pos.setXYZ(sl.n, sl.g.position.x, sl.g.position.y, sl.g.position.z); pos.needsUpdate = true;
                sl.n++; sl.geom.setDrawRange(0, sl.n);
              }
              a.lx = a.x; a.ls = a.s;
            }
          }
        });
        aLab.visible = !!(newest && newest.sh && !newest.sh.done);
        if (aLab.visible) aLab.position.set(newest.g.position.x, newest.g.position.y + 0.75, newest.g.position.z);
      });
    }) : undefined
  });
  // ====================================================================
  // 5. SPORTS DRINK: dissolved salt gives sodium ions (+) and chloride ions (-)
  // ====================================================================
  const ION = [
    { key: 'Na', name: 'Sodium ion', sym: 'Na⁺', p: 11, n: 12, e: 10, chg: '+1', shells: [2, 8] },
    { key: 'Cl', name: 'Chloride ion', sym: 'Cl⁻', p: 17, n: 18, e: 18, chg: '−1', shells: [2, 8, 8] }
  ];
  function ionReadout(ion, pairs) {
    const l2 = pairs === 0 ? 'Plain water: no ions, so it hardly carries any electric charge.'
      : `${pairs} sodium ions (+) and ${pairs} chloride ions (−): total charge 0.`;
    return `<span><b>${ion.name} ${ion.sym}</b>: ${ion.p} protons (+), ${ion.e} electrons (−)</span><span class="mca-hide">Net charge ${ion.chg}</span>` +
      `<span style="display:block;color:var(--t-muted)">${l2}</span>`;
  }
  const ionControls = () => btn('mca-sd-0', 'Sodium') + btn('mca-sd-1', 'Chloride') + '<span>Salt</span>' +
    '<input type="range" id="mca-sd-salt" min="0" max="8" step="1" value="5" style="flex:1 1 60px;max-width:140px" aria-label="Amount of salt in the drink"><span id="mca-sd-val" style="min-width:1.2em">5</span>';
  examples.push({
    kind: 'example',
    title: 'Real life: Sports drink ions',
    text: '<p>A sports drink contains <b>salt</b>. In water the salt splits into <b>ions</b>: <b>sodium ions</b> (Na<sup>+</sup>) and <b>chloride ions</b> (Cl<sup>−</sup>). These charged particles help nerves and muscles pass tiny electric signals, so we lose them when we sweat. Add some salt!</p>',
    explain: '<p>The glass on the left holds a drink with <b>purple sodium ions (+)</b> and <b>green chloride ions (−)</b> drifting about. On the right is one ion zoomed in, with <b>red protons (+)</b>, <b>grey neutrons (0)</b> and <b>indigo electrons (−)</b>. Sodium has one electron fewer than protons; chloride has one more. Use <b>Salt</b> to add ions, and the buttons to switch ions.</p>',
    say: 'The glass on the left is a sports drink with a little salt dissolved in it. In water, salt breaks into charged atoms called ions. The purple ones are sodium ions, which have a plus charge. The green ones are chloride ions, which have a minus charge. Now look at the big ion on the right. A sodium ion has eleven protons but only ten electrons, so it has one extra plus. A chloride ion has seventeen protons and eighteen electrons, so it has one extra minus. Slide the salt control and watch more ions appear. The total charge in the drink stays zero. Your nerves and muscles use these ions to send tiny electric signals.',
    mount(el, api) {
      const sh = flatShell(el, ionControls());
      const svg = sh.svg, CX = 296, CY = 104, SY = 0.8;
      const GX0 = 40, GX1 = 134, GY0 = 62, GY1 = 168;
      svgEl('rect', { x: GX0 - 4, y: GY0 - 6, width: GX1 - GX0 + 8, height: GY1 - GY0 + 10, rx: 8, fill: '#38bdf8', 'fill-opacity': 0.25, stroke: 'var(--t-muted)', 'stroke-width': 2 }, svg);
      txt(svg, 87, 44, 'Sports drink', {});
      const title = txt(svg, CX, 16, '', {});
      const holder = svgEl('g', {}, svg);
      svgEl('defs', {}, svg).innerHTML = TutorialKit.arrowMarker('mca-sd-ar', '#94a3b8');
      svgEl('path', { d: 'M148 100 L176 100', stroke: '#94a3b8', 'stroke-width': 2.5, 'marker-end': 'url(#mca-sd-ar)' }, svg);
      const ions = [];
      for (let i = 0; i < 16; i++) {
        const na = i % 2 === 0, g = svgEl('g', {}, svg);
        svgEl('circle', { r: na ? 7 : 9, fill: na ? '#8b5cf6' : '#22c55e', stroke: na ? '#4c1d95' : '#14532d', 'stroke-width': 1 }, g);
        const t = svgEl('text', { y: 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#ffffff' }, g); t.textContent = na ? '+' : '−';
        const a = i * 2.1;
        ions.push({ g, na, x: GX0 + 12 + (GX1 - GX0 - 24) * hash01(i + 1), y: GY0 + 12 + (GY1 - GY0 - 24) * hash01(i * 1.7 + 3), vx: Math.cos(a), vy: Math.sin(a), pair: i >> 1 });
      }
      let ion = 0, atom = null, pairs = 5;
      const paintRead = () => { sh.read.innerHTML = ionReadout(ION[ion], pairs); };
      function build() {
        const d = ION[ion]; holder.innerHTML = '';
        atom = flatAtom(holder, CX, CY, { rp: 5, er: 4.6, radii: d.shells.length === 2 ? [46, 62] : [46, 60, 74], sy: SY, speeds: [1.4, 0.9, 0.6] });
        atom.setNucleus(typesFor(d.p, d.n)); atom.setElectrons(d.shells);
        title.textContent = d.name + ' ' + d.sym;
        hilite(sh.row, 'button', b => b.id === 'mca-sd-' + ion); paintRead();
      }
      const slider = sh.row.querySelector('#mca-sd-salt'), val = sh.row.querySelector('#mca-sd-val');
      slider.addEventListener('input', () => { pairs = +slider.value; val.textContent = pairs; paintRead(); });
      sh.row.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => { ion = i; build(); }));
      build();
      api.loop((t, dt) => {
        atom.tick(t);
        ions.forEach(o => {
          const on = o.pair < pairs;
          o.g.setAttribute('display', on ? 'inline' : 'none');
          if (!on) return;
          o.x += o.vx * 22 * dt; o.y += o.vy * 22 * dt;
          if (o.x < GX0 + 8 || o.x > GX1 - 8) { o.vx = -o.vx; o.x = Math.max(GX0 + 8, Math.min(GX1 - 8, o.x)); }
          if (o.y < GY0 + 8 || o.y > GY1 - 8) { o.vy = -o.vy; o.y = Math.max(GY0 + 8, Math.min(GY1 - 8, o.y)); }
          o.g.setAttribute('transform', `translate(${o.x.toFixed(1)} ${o.y.toFixed(1)})`);
        });
      });
    },
    scene3d: HAS3D ? Chem3D.define({ distance: 12, pitch: 0.2, yaw: 0.3, target: [0.3, 0.2, 0], autoRotate: 0 }, (view, ctx) => {
      const GX = -3.5, FLOOR = -2.3, GH = 3.6, GR = 1.45, AXR = 3.4, AY = 0.1;
      view.beaker(GR, GH, { level: 0.82, liquidColor: '#38bdf8', liquidOpacity: 0.3, pos: [GX, FLOOR, 0] });
      const ions = [];
      for (let i = 0; i < 16; i++) {
        const na = i % 2 === 0;
        const m = view.sphere(na ? 0.22 : 0.3, na ? Chem3D.color('Na') : Chem3D.color('Cl'), { shininess: 80 });
        H3.addSign(view, m, na ? '+' : '−', '#ffffff', na ? '#4c1d95' : '#14532d', 1.3);
        const a = i * 2.1, r = 0.9 * Math.sqrt(hash01(i + 1)), th = 6.28 * hash01(i * 1.3 + 2);
        m.position.set(GX + r * Math.cos(th), FLOOR + 0.5 + 1.9 * hash01(i * 1.7 + 3), r * Math.sin(th));
        ions.push({ m, pair: i >> 1, v: new THREE.Vector3(Math.cos(a), Math.sin(a * 1.3), Math.sin(a * 0.7 + 1)).multiplyScalar(0.5), rad: na ? 0.22 : 0.3 });
      }
      const nuc = H3.makeNucleus(view, 35, 0.16, [AXR, AY, 0]);
      const orb = H3.makeOrbits(view, [0.95, 1.55, 2.15], [TILTS[0], TILTS[1], TILTS[2]], { er: 0.16, pos: [AXR, AY, 0], maxE: 18, speeds: [1.4, 0.9, 0.6] });
      view.arrow([-1.75, 0.3, 0], [0.75, 0.3, 0], '#94a3b8', { width: 0.045, head: 0.4 });
      view.label('zoom in', [-0.5, 0.85, 0], { size: 0.55, color: '#475569' });
      view.label('Sports drink', [GX, FLOOR + GH + 0.55, 0], { size: 0.7, color: '#1f2937' });
      const title = view.label('', [AXR, 3.0, 0], { size: 0.8, color: '#1f2937' });
      const fit = H3.autoFit(view, 5.6, 3.5);
      const row = ctx.controls(`<div class="scene-slider-row" ${rowStyle}>${ionControls()}</div><div class="scene-slider-row mca-read" ${readStyle}></div>`);
      const read = row.querySelector('.mca-read');
      let ion = 0, pairs = 5, lastSway = 0;
      const paintRead = () => { read.innerHTML = ionReadout(ION[ion], pairs); };
      function build() {
        const d = ION[ion];
        nuc.layout(typesFor(d.p, d.n), 0.16); orb.set(d.shells);
        title.userData.setText(d.name + ' ' + d.sym);
        hilite(row, 'button', b => b.id === 'mca-sd-' + ion); paintRead();
      }
      const slider = row.querySelector('#mca-sd-salt'), val = row.querySelector('#mca-sd-val');
      slider.addEventListener('input', () => { pairs = +slider.value; val.textContent = pairs; paintRead(); });
      row.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => { ion = i; build(); }));
      build();
      view.run((t, dt) => {
        fit();
        const sw = 0.2 * Math.sin(t * 0.35); view.cam.yaw += sw - lastSway; lastSway = sw;
        nuc.tick(t, 0.012); orb.tick(t);
        ions.forEach(o => {
          o.m.visible = o.pair < pairs;
          if (!o.m.visible || dt === 0) return;
          o.m.position.addScaledVector(o.v, dt);
          const dx = o.m.position.x - GX, dz = o.m.position.z, rr = Math.hypot(dx, dz), lim = GR - 0.1 - o.rad;
          if (rr > lim) { const k = lim / rr; o.m.position.x = GX + dx * k; o.m.position.z = dz * k; const nx = dx / rr, nz = dz / rr, dp = o.v.x * nx + o.v.z * nz; if (dp > 0) { o.v.x -= 2 * dp * nx; o.v.z -= 2 * dp * nz; } }
          const y0 = FLOOR + 0.1 + o.rad, y1 = FLOOR + GH * 0.82 - 0.1 - o.rad;
          if (o.m.position.y < y0) { o.m.position.y = y0; o.v.y = Math.abs(o.v.y); } else if (o.m.position.y > y1) { o.m.position.y = y1; o.v.y = -Math.abs(o.v.y); }
        });
      });
    }) : undefined
  });
  // @@EXAMPLES-PUSH

  addTutorialSteps('chemistry', 'atoms', examples, [
    { term: 'Alpha particle', definition: 'A tiny particle made of 2 protons and 2 neutrons (a helium nucleus) that some atoms give off.' },
    { term: 'Half-life', definition: 'The time it takes for half of the atoms in a radioactive sample to change. For carbon-14 it is 5,730 years.' },
    { term: 'Electrolyte', definition: 'A substance whose ions in water carry electric charge, like the salts in a sports drink.' }
  ]);
})();
