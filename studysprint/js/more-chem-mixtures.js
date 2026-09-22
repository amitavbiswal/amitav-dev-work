(function () {
  'use strict';
  // more-chem-mixtures: 5 extra real-life example steps for Chemistry > Mixtures & Solutions.
  // Ids / classes are prefixed "mxm-". Each step has a flat fallback (svg / mount) AND a 3D scene (scene3d).

  const SVGNS = 'http://www.w3.org/2000/svg';
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // DOM overlay on top of a 3D canvas (legend / readouts). Colours follow the theme.
  function overlay(view, css) {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;pointer-events:none;font-weight:700;color:var(--t-ink);text-shadow:0 0 3px var(--stage-bg),0 0 3px var(--stage-bg);' + (css || '');
    view.wrap.appendChild(d);
    return d;
  }
  // Slide the picture sideways inside the canvas (fraction of width; + moves it left) without moving the orbit centre.
  function shiftView(view, f) {
    const a = view.camera.aspect;
    view.camera.setViewOffset(a * 100, 100, f * a * 100, 0, a * 100, 100);
  }
  // Gentle left-right sway of the camera instead of a full auto-rotate. Drag still works.
  function sway(view, amp, speed) {
    view.autoRotate = 0;
    let prev = 0;
    view.run((t) => { const s = amp * Math.sin(t * speed); view.cam.yaw += s - prev; prev = s; });
  }
  function jitter(v, speed, dt, k) {
    v.x += (Math.random() - 0.5) * k * dt; v.y += (Math.random() - 0.5) * k * dt; v.z += (Math.random() - 0.5) * k * dt;
    const s = v.length() || 1e-4;
    v.multiplyScalar(1 + (speed / s - 1) * Math.min(1, dt * 2));
  }
  function inCylinder(r, y0, y1) {
    const a = rnd(0, TAU), rr = r * Math.sqrt(Math.random());
    return new THREE.Vector3(Math.cos(a) * rr, rnd(y0, y1), Math.sin(a) * rr);
  }
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
  const paintButtons = (row, key, on) => row.querySelectorAll('button').forEach(b => {
    const sel = b.dataset[key] === on;
    b.style.borderColor = sel ? 'var(--primary)' : ''; b.style.color = sel ? 'var(--primary)' : '';
  });

  // On a narrow (phone) canvas pull the camera back so nothing is clipped.
  function fitNarrow(view, factor) {
    if (view.camera.aspect < 1.6) view.setCamera({ distance: view.cam.distance * factor });
  }

  const steps = [];

  // ====================================================================
  // 1. Sieving sand and gravel (interactive: hole size)
  // ====================================================================
  (function () {
    const KINDS = [
      { k: 'peb', name: 'Small gravel', mm: 4, col: '#b45309', n3: 10, nf: 5 },
      { k: 'gra', name: 'Big gravel', mm: 8, col: '#64748b', n3: 6, nf: 3 },
      { k: 'san', name: 'Sand', mm: 1, col: '#eab35f', n3: 40, nf: 22 }
    ];
    KINDS.sort((a, b) => b.mm - a.mm);          // big stones are placed first
    const CYC = 12, DEF = 3;
    const rowHtml = '<div class="scene-slider-row" style="padding:2px 8px"><span>Holes</span>' +
      '<input type="range" id="mxm-sv-h" min="2" max="10" step="1" value="' + DEF + '" aria-label="Size of the holes in millimeters">' +
      '<span id="mxm-sv-hv" style="min-width:44px;text-align:right">' + DEF + ' mm</span></div>';
    const legendHtml = () => KINDS.slice().reverse().map(k =>
      '<div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:' + k.col + ';display:inline-block;flex:0 0 auto"></span>' + k.name + ' ' + k.mm + ' mm</div>').join('');

    steps.push({
      kind: 'example',
      title: 'Real life: Sieving sand and gravel',
      text: '<p>Builders shake a <b>sieve</b> to sort sand from gravel. Grains smaller than the holes fall through and bigger stones stay on top. Nothing dissolves or changes, so sieving is a <b>physical</b> way to separate a mixture by <b>particle size</b>.</p>',
      explain: '<p>A teal square <b>sieve</b> with a dark wire grid shakes over a grey tray. Tan specks are <b>sand</b> (1 mm), orange-brown pebbles are <b>small gravel</b> (4 mm) and grey stones are <b>big gravel</b> (8 mm). Only pieces smaller than the holes drop into the tray. Drag the <b>Holes</b> slider to change the mesh and pour again. Drag the picture to turn it.</p>',
      say: 'Watch the sieve shake. It holds a mixture of sand, small gravel and big gravel. This picture is in three dimensions, so you can drag it to turn it around. The holes in the mesh are three millimeters wide, and the sand grains are only one millimeter. So the sand falls through into the tray, while the gravel stays on top. Nothing is dissolved and nothing changes, so this is a physical way to separate a mixture. Now drag the holes slider. At five millimeters the small gravel falls through too. At ten millimeters even the big stones drop down. The size of the holes decides what passes through.',
      mount(el, api) {
        el.innerHTML = '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' + rowHtml;
        const svg = el.querySelector('svg');
        const XL = 30, XR = 230, MY = 86, FLOOR = 176, PX = 2.4, G = 520;
        const T = (x, y, size, weight, fill, anchor) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor || 'start' }, svg);
        svgEl('line', { x1: XL, y1: MY, x2: XL, y2: FLOOR, stroke: 'var(--t-muted)', 'stroke-width': 2 }, svg);
        svgEl('line', { x1: XR, y1: MY, x2: XR, y2: FLOOR, stroke: 'var(--t-muted)', 'stroke-width': 2 }, svg);
        svgEl('path', { d: 'M' + (XL - 8) + ' 148 L' + (XL - 8) + ' ' + FLOOR + ' L' + (XR + 8) + ' ' + FLOOR + ' L' + (XR + 8) + ' 148', fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 3 }, svg);
        const sg = svgEl('g', {}, svg);
        svgEl('line', { x1: XL - 4, y1: MY - 26, x2: XL - 4, y2: MY + 2, stroke: '#14b8a6', 'stroke-width': 5, 'stroke-linecap': 'round' }, sg);
        svgEl('line', { x1: XR + 4, y1: MY - 26, x2: XR + 4, y2: MY + 2, stroke: '#14b8a6', 'stroke-width': 5, 'stroke-linecap': 'round' }, sg);
        const mesh = svgEl('line', { x1: XL, y1: MY, x2: XR, y2: MY, stroke: 'var(--t-ink)', 'stroke-width': 3 }, sg);
        const pg = svgEl('g', {}, svg);
        // legend + readouts
        KINDS.slice().reverse().forEach((k, i) => {
          svgEl('circle', { cx: 268, cy: 34 + i * 22, r: 6, fill: k.col }, svg);
          T(280, 39 + i * 22, 13, 700, 'var(--t-ink)').textContent = k.name + ' ' + k.mm + ' mm';
        });
        const tTop = T(262, 122, 14, 700, 'var(--t-ink)'), tThru = T(262, 144, 14, 700, 'var(--t-ink)');
        const tHole = T(262, 172, 13, 700, 'var(--primary)');
        T((XL + XR) / 2, 20, 13, 700, 'var(--t-muted)', 'middle').textContent = 'Shake the sieve';
        const parts = [];
        KINDS.forEach(k => { for (let i = 0; i < k.nf; i++) parts.push({ k, r: k.k === 'san' ? 1.5 : k.mm * PX / 2, c: svgEl('circle', { r: k.k === 'san' ? 1.5 : k.mm * PX / 2, fill: k.col, opacity: 0 }, pg) }); });
        const slider = el.querySelector('#mxm-sv-h'), hv = el.querySelector('#mxm-sv-hv');
        let hole = DEF, ct = 0;
        function reset() {
          ct = 0; hole = +slider.value;
          hv.textContent = hole + ' mm'; tHole.textContent = 'Holes: ' + hole + ' mm';
          mesh.setAttribute('stroke-dasharray', '3 ' + (hole * PX).toFixed(1));
          const placed = [];
          parts.forEach(p => {
            let best = XL + 20, bd = -1;
            for (let i = 0; i < 14; i++) {
              const x = rnd(XL + p.r + 2, XR - p.r - 2); let md = 999;
              placed.forEach(q => { md = Math.min(md, Math.abs(x - q.x) - p.r - q.r); });
              if (md > bd) { bd = md; best = x; }
            }
            p.x = best; placed.push(p);
            p.st = 'wait'; p.delay = rnd(0, 1.8); p.y = 0; p.vy = 0; p.pass = p.k.mm < hole; p.c.setAttribute('opacity', 0);
          });
        }
        slider.addEventListener('input', reset);
        reset();
        api.loop((t, dt) => {
          ct += dt;
          if (ct > CYC) reset();
          const sh = clamp((ct - 2.6) / 0.5, 0, 1), ox = 3 * Math.sin(ct * 18) * sh;
          sg.setAttribute('transform', 'translate(' + ox.toFixed(2) + ' 0)');
          let top = 0, thru = 0;
          parts.forEach(p => {
            if (p.st === 'wait' && ct >= p.delay) { p.st = 'pour'; p.y = -4; p.vy = 0; p.c.setAttribute('opacity', 0.95); }
            if (p.st === 'pour') { p.vy += G * dt; p.y += p.vy * dt; if (p.y >= MY - 2 - p.r) { p.y = MY - 2 - p.r; p.st = 'sieve'; p.passT = Math.max(ct, 2.8) + rnd(0.2, 5); } }
            else if (p.st === 'sieve') { p.y = MY - 2 - p.r - sh * 1.6 * Math.abs(Math.sin(ct * 17 + p.x)); if (p.pass && ct >= p.passT) { p.st = 'fall'; p.vy = 0; p.x += ox; p.ox0 = ox; } }
            else if (p.st === 'fall') { p.vy += G * dt; p.y += p.vy * dt; if (p.y >= FLOOR - 2 - p.r) { p.y = FLOOR - 2 - p.r; p.st = 'tray'; } }
            if (p.st === 'fall' || p.st === 'tray') thru++; else top++;
            const dx = (p.st === 'fall' || p.st === 'tray') ? 0 : ox;
            p.c.setAttribute('cx', (p.x + dx).toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1));
          });
          tTop.textContent = 'On the sieve: ' + top; tThru.textContent = 'In the tray: ' + thru;
        });
      },
      scene3d: Chem3D.define({ distance: 10.4, pitch: 0.52, yaw: 0.45, autoRotate: 0, target: [0, 0, 0] }, (view, ctx) => {
        sway(view, 0.35, 0.5); fitNarrow(view, 1.16);
        const S = 0.12, SW = 3.6, HALF = SW / 2, MY = 1.3, FY = -1.7, G = 14;
        const TW = SW + 0.5;
        // tray with low glass-like walls, and four posts holding the sieve up
        view.box(TW, 0.1, TW, '#94a3b8', { pos: [0, FY - 0.05, 0] });
        [[0, TW / 2, TW, 0.06], [0, -TW / 2, TW, 0.06], [TW / 2, 0, 0.06, TW], [-TW / 2, 0, 0.06, TW]].forEach(w =>
          view.box(w[2], 0.45, w[3], '#cbd5e1', { opacity: 0.4, pos: [w[0], FY + 0.2, w[1]] }));
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(s => view.cylinder([s[0] * (HALF + 0.05), FY, s[1] * (HALF + 0.05)], [s[0] * (HALF + 0.05), MY - 0.05, s[1] * (HALF + 0.05)], 0.05, '#64748b'));
        // sieve: teal frame + wire grid whose spacing follows the hole size
        const sg = new THREE.Group(); view.scene.add(sg);
        const rim = (w, d, x, z) => { const b = view.box(w, 0.42, d, '#14b8a6', { pos: [x, MY + 0.16, z] }); view.scene.remove(b); sg.add(b); };
        rim(SW + 0.16, 0.08, 0, HALF + 0.04); rim(SW + 0.16, 0.08, 0, -HALF - 0.04); rim(0.08, SW, HALF + 0.04, 0); rim(0.08, SW, -HALF - 0.04, 0);
        // wire mesh: one see-through texture, redrawn with the hole spacing for the chosen hole size
        const mc = document.createElement('canvas'); mc.width = mc.height = 512;
        const mctx = mc.getContext('2d'), mtex = new THREE.CanvasTexture(mc);
        const mplane = new THREE.Mesh(new THREE.PlaneGeometry(SW, SW), new THREE.MeshBasicMaterial({ map: mtex, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, depthWrite: false }));
        mplane.rotation.x = -Math.PI / 2; mplane.position.y = MY; sg.add(mplane);
        function drawMesh(h) {
          const n = Math.max(2, Math.round(SW / (h * S + 0.03))), st = 512 / n, w = Math.max(3, 0.03 / SW * 512);
          mctx.clearRect(0, 0, 512, 512); mctx.fillStyle = '#8fa0b8';
          for (let i = 0; i <= n; i++) { const c = i * st - w / 2; mctx.fillRect(c, 0, w, 512); mctx.fillRect(0, c, 512, w); }
          mtex.needsUpdate = true;
        }
        // particles
        const geo = new THREE.SphereGeometry(1, 14, 10);
        const parts = [];
        KINDS.forEach(k => {
          const mat = view.mat(k.col, { shininess: 25 });
          for (let i = 0; i < k.n3; i++) {
            const m = new THREE.Mesh(geo, mat); const r = k.mm * S / 2; m.scale.setScalar(r); m.visible = false; view.scene.add(m);
            parts.push({ m, k, r });
          }
        });
        const row = ctx.controls('<div class="scene-slider-row" style="padding:2px 8px"><span>Holes</span>' +
          '<input type="range" id="mxm-sv-h" min="2" max="10" step="1" value="' + DEF + '" aria-label="Size of the holes in millimeters">' +
          '<span id="mxm-sv-hv" style="min-width:44px;text-align:right">' + DEF + ' mm</span></div>');
        shiftView(view, 0.2);
        const ov = overlay(view, 'right:6px;top:6px;width:44%;font-size:11px;line-height:1.5');
        ov.innerHTML = legendHtml() + '<div style="margin-top:8px;font-size:12px"><div id="mxm-sv-a"></div><div id="mxm-sv-b"></div></div>';
        const eA = ov.querySelector('#mxm-sv-a'), eB = ov.querySelector('#mxm-sv-b');
        const slider = row.querySelector('#mxm-sv-h'), hv = row.querySelector('#mxm-sv-hv');
        let hole = DEF, ct = 0, lastA = -1, lastB = -1;
        function reset() {
          ct = 0; hole = +slider.value; hv.textContent = hole + ' mm';
          drawMesh(hole);
          const placed = [];
          parts.forEach(p => {
            let bx = 0, bz = 0, bd = -1;
            for (let i = 0; i < 14; i++) {
              const x = rnd(-HALF + p.r + 0.05, HALF - p.r - 0.05), z = rnd(-HALF + p.r + 0.05, HALF - p.r - 0.05); let md = 99;
              placed.forEach(q => { md = Math.min(md, Math.hypot(x - q.x, z - q.z) - p.r - q.r); });
              if (md > bd) { bd = md; bx = x; bz = z; }
            }
            p.x = bx; p.z = bz; placed.push(p);
            p.st = 'wait'; p.delay = rnd(0, 2.0); p.vy = 0; p.y = 0; p.pass = p.k.mm < hole; p.m.visible = false;
          });
        }
        slider.addEventListener('input', reset);
        reset();
        view.run((t, dt) => {
          ct += dt;
          if (ct > CYC) reset();
          const sh = clamp((ct - 2.6) / 0.5, 0, 1), ox = 0.07 * Math.sin(ct * 18) * sh;
          sg.position.x = ox;
          let top = 0, thru = 0;
          parts.forEach(p => {
            if (p.st === 'wait' && ct >= p.delay) { p.st = 'pour'; p.y = 3.4; p.vy = 0; p.m.visible = true; }
            if (p.st === 'pour') { p.vy -= G * dt; p.y += p.vy * dt; if (p.y <= MY + p.r) { p.y = MY + p.r; p.st = 'sieve'; p.passT = Math.max(ct, 2.8) + rnd(0.2, 5); } }
            else if (p.st === 'sieve') {
              p.y = MY + p.r + sh * 0.05 * Math.abs(Math.sin(ct * 17 + p.x * 3));
              if (p.pass && ct >= p.passT) { p.st = 'fall'; p.vy = 0; p.x += ox; p.y = MY + p.r; }
            } else if (p.st === 'fall') { p.vy -= G * dt; p.y += p.vy * dt; if (p.y <= FY + p.r) { p.y = FY + p.r; p.st = 'tray'; } }
            const ff = p.st === 'fall' || p.st === 'tray';
            if (ff) thru++; else top++;
            p.m.position.set(p.x + (ff ? 0 : ox), p.y, p.z);
          });
          if (top !== lastA) { eA.textContent = 'On the sieve: ' + top; lastA = top; }
          if (thru !== lastB) { eB.textContent = 'In the tray: ' + thru; lastB = thru; }
        });
      })
    });
  })();
  // @@STEP-SIEVE-END
  // ====================================================================
  // 2. Homemade water filter: gravel, sand, charcoal (not interactive)
  // ====================================================================
  (function () {
    const CYC = 11;
    const DIRT = [
      { n: 8, r: 0.1, col: '#5b3a12', lo: 3.0, hi: 3.0 },      // bits: stop on top of the gravel
      { n: 12, r: 0.06, col: '#7a5424', lo: 2.15, hi: 2.35 },  // mud: stops where gravel meets sand
      { n: 14, r: 0.04, col: '#8a6a3a', lo: 1.55, hi: 2.05 }   // fine silt: trapped inside the sand
    ];
    steps.push({
      kind: 'example',
      title: 'Real life: A homemade water filter',
      text: '<p>Muddy water trickles down through layers of <b>gravel</b>, <b>sand</b> and <b>charcoal</b>. The solid bits get stuck because they cannot fit between the grains, so cleaner water drips out. Filtering removes solids, not dissolved salt or germs, so people still boil the water.</p>',
      explain: '<p>A clear column holds layers: grey <b>gravel</b> on top, tan <b>sand</b> in the middle and black <b>charcoal</b> at the bottom. Brown bits float in the dirty water above. Big bits stop on the gravel and fine silt is trapped in the sand. Cleaner water drips from the tube into the <b>beaker</b>, whose level rises.</p>',
      say: 'Look at this homemade water filter. Muddy water sits at the top and trickles down through three layers. First comes gravel, then fine sand, then charcoal. Watch the brown bits. The biggest pieces get stuck on top of the gravel. The finer mud is trapped in the sand. Cleaner water drips out of the bottom into the beaker, and its level slowly rises. Filtration works because the gaps between the grains are smaller than the bits of dirt. But be careful. Dissolved salt and tiny germs can slip through, so water from a filter like this should still be boiled before anyone drinks it.',
      mount(el, api) {
        el.innerHTML = '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>';
        const svg = el.querySelector('svg');
        const XL = 40, XR = 140, XC = 90;
        const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
        const LAY = [[20, 50, '#8b6b3d', 0.45], [50, 80, '#94a3b8', 0.7], [80, 110, '#eab35f', 0.75], [110, 140, '#475569', 0.85]];
        LAY.forEach(l => svgEl('rect', { x: XL, y: l[0], width: XR - XL, height: l[1] - l[0], fill: l[2], opacity: l[3] }, svg));
        for (let i = 0; i < 9; i++) svgEl('circle', { cx: XL + 8 + (i % 5) * 20 + (i > 4 ? 10 : 0), cy: i > 4 ? 70 : 58, r: 7.5, fill: '#64748b', stroke: '#475569' }, svg);
        for (let i = 0; i < 26; i++) svgEl('circle', { cx: XL + 5 + (i * 37 % 91), cy: 84 + (i * 13 % 23), r: 2.2, fill: '#b7791f' }, svg);
        for (let i = 0; i < 18; i++) svgEl('circle', { cx: XL + 6 + (i * 29 % 88), cy: 114 + (i * 11 % 22), r: 3, fill: '#0f172a' }, svg);
        svgEl('path', { d: 'M' + XL + ' 14 L' + XL + ' 140 L' + (XC - 6) + ' 140 L' + (XC - 6) + ' 152 M' + XR + ' 14 L' + XR + ' 140 L' + (XC + 6) + ' 140 L' + (XC + 6) + ' 152', fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
        svgEl('path', { d: 'M56 158 L56 184 L124 184 L124 158', fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 3 }, svg);
        const clean = svgEl('rect', { x: 58, y: 180, width: 64, height: 4, fill: 'var(--t-blue)', opacity: 0.5 }, svg);
        const drop = svgEl('circle', { cx: XC, cy: 154, r: 3, fill: 'var(--t-blue)' }, svg);
        [['Dirty water', 38, '#8b6b3d'], ['Gravel', 68, 'var(--t-ink)'], ['Sand', 98, 'var(--t-ink)'], ['Charcoal', 128, 'var(--t-ink)']].forEach(l => {
          T(152, l[1] + 4, 14, 700, l[2] === '#8b6b3d' ? 'var(--t-orange)' : l[2]).textContent = l[0];
        });
        T(134, 176, 13, 700, 'var(--t-blue)').textContent = 'Cleaner water';
        [['Big bits stop on', 60], ['the gravel. Fine', 78], ['silt is trapped', 96], ['in the sand.', 114]].forEach(l => { T(262, l[1], 13, 400, 'var(--t-ink)').textContent = l[0]; });
        const dirt = [];
        DIRT.forEach(d => { for (let i = 0; i < Math.round(d.n * 0.9); i++) {
          const rr = d.r === 0.1 ? 3.5 : d.r === 0.06 ? 2.4 : 1.6;
          dirt.push({ d, rr, c: svgEl('circle', { r: rr, fill: d.col, opacity: 0 }, svg), x: rnd(XL + 8, XR - 8), delay: rnd(0, 4) , stop: 0 });
        } });
        dirt.forEach(p => { p.stop = p.d.lo === 3.0 ? 50 - p.rr : p.d.lo === 2.15 ? rnd(78, 84) : rnd(88, 106); });
        let ct = 0;
        api.loop((t, dt) => {
          ct += dt; if (ct > CYC) { ct = 0; dirt.forEach(p => { p.delay = rnd(0, 4); p.x = rnd(XL + 8, XR - 8); }); }
          const fade = clamp((CYC - ct) / 0.6, 0, 1);
          dirt.forEach(p => {
            const u = clamp((ct - p.delay) * 0.13, 0, 1), y = 26 + (p.stop - 26) * u;
            p.c.setAttribute('cx', (p.x + Math.sin(ct * 2 + p.x) * 1.2 * (1 - u)).toFixed(1)); p.c.setAttribute('cy', y.toFixed(1));
            p.c.setAttribute('opacity', ct > p.delay ? 0.95 * fade : 0);
          });
          const lvl = 4 + 24 * clamp(ct / 9.5, 0, 1);
          clean.setAttribute('y', 184 - lvl); clean.setAttribute('height', lvl);
          const k = (ct * 1.2) % 1;
          drop.setAttribute('cy', (154 + (184 - lvl - 154) * k * k).toFixed(1));
        });
      },
      scene3d: Chem3D.define({ distance: 13.2, pitch: 0.2, yaw: 0.45, autoRotate: 0, target: [0.5, 0.55, 0] }, (view) => {
        sway(view, 0.35, 0.5);
        const R = 1.0, Y0 = 0.6, YT = 4.2;
        const LY = [{ y0: 0.6, y1: 1.4, col: '#374151', g: '#0f172a', gr: 0.08, n: 22 }, { y0: 1.4, y1: 2.2, col: '#eab35f', g: '#b7791f', gr: 0.055, n: 40 }, { y0: 2.2, y1: 3.0, col: '#94a3b8', g: '#64748b', gr: 0.2, n: 12 }];
        view.box(6.4, 0.2, 3.2, '#cbd5e1', { pos: [0, -3.1, 0] });
        view.cylinder([-1.9, -3, -0.9], [-1.9, 4.4, -0.9], 0.07, '#64748b');
        view.cylinder([-1.9, 1.5, -0.9], [-R - 0.12, 1.5, 0], 0.06, '#64748b');
        const glass = view.mat('#dbeafe', { opacity: 0.2, doubleSide: true, shininess: 120, specular: '#ffffff' });
        const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, YT - Y0, 40, 1, true), glass); wall.position.y = (YT + Y0) / 2; view.scene.add(wall);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.035, 8, 48), view.mat('#e0f2fe', { opacity: 0.9 })); rim.rotation.x = Math.PI / 2; rim.position.y = YT; view.scene.add(rim);
        const cyl = (r, h, col, o, y) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 36), view.mat(col, o)); m.position.y = y; view.scene.add(m); return m; };
        cyl(R * 0.98, 0.9, '#8b6b3d', { opacity: 0.42, shininess: 40 }, 3.45);                 // dirty water
        LY.forEach(l => cyl(R * 0.97, l.y1 - l.y0, l.col, { opacity: 0.55, shininess: 20 }, (l.y0 + l.y1) / 2));
        const geo = new THREE.SphereGeometry(1, 12, 9);
        LY.forEach(l => { const mat = view.mat(l.g, { shininess: 30 }); for (let i = 0; i < l.n; i++) { const m = new THREE.Mesh(geo, mat); m.scale.setScalar(l.gr); m.position.copy(inCylinder(R - l.gr - 0.03, l.y0 + l.gr, l.y1 - l.gr)); view.scene.add(m); } });
        cyl(0.12, 1.5, '#dbeafe', { opacity: 0.3 }, -0.15);
        const bk = view.beaker(1.15, 1.9, { base: -2.95, level: 0.1, liquidColor: '#8fc9f5', liquidOpacity: 0.5 });
        const dropM = new THREE.Mesh(geo, view.mat('#0284c7')); dropM.scale.setScalar(0.08); view.scene.add(dropM);
        const lab = (t, p, o) => view.label(t, p, Object.assign({ size: 1.0, fontSize: 44, bg: 'rgba(255,255,255,0.88)', color: '#334155' }, o));
        lab('Dirty water', [2.6, 3.5, 0], { color: '#8b5a1c' }); lab('Gravel', [2.3, 2.6, 0]); lab('Sand', [2.3, 1.8, 0]); lab('Charcoal', [2.4, 1.0, 0]);
        lab('Cleaner water', [3.0, -1.9, 0], { color: '#0369a1' });
        const dirt = [];
        DIRT.forEach(d => { for (let i = 0; i < d.n; i++) {
          const m = new THREE.Mesh(geo, view.mat(d.col, { shininess: 20 })); m.scale.setScalar(d.r); m.visible = false; view.scene.add(m);
          dirt.push({ m, d, x: 0, z: 0, delay: 0, stop: 0, ph: rnd(0, TAU) });
        } });
        let ct = 0;
        function reset() {
          dirt.forEach(p => {
            const a = rnd(0, TAU), rr = (R - 0.2) * Math.sqrt(Math.random());
            p.x = Math.cos(a) * rr; p.z = Math.sin(a) * rr; p.delay = rnd(0, 4);
            p.stop = p.d.lo === 3.0 ? 3.0 + p.d.r : rnd(p.d.lo, p.d.hi);
          });
        }
        reset();
        view.run((t, dt) => {
          ct += dt; if (ct > CYC) { ct = 0; reset(); }
          const fade = clamp((CYC - ct) / 0.6, 0, 1);
          dirt.forEach(p => {
            const u = clamp((ct - p.delay) * 0.14, 0, 1), y = 3.85 + (p.stop - 3.85) * u, w = (1 - u) * 0.05;
            p.m.visible = ct > p.delay; p.m.position.set(p.x + Math.sin(ct * 2 + p.ph) * w, y, p.z + Math.cos(ct * 1.7 + p.ph) * w);
            p.m.scale.setScalar(p.d.r * fade);
          });
          const lvl = 0.1 + 0.5 * clamp(ct / 9.5, 0, 1); bk.setLevel(lvl);
          const top = -2.95 + 0.01 + 1.9 * 0.96 * lvl, k = (ct * 1.2) % 1;
          dropM.position.set(0, -0.9 - (-0.9 - top) * k * k, 0);
        });
      })
    });
  })();
  // @@STEP-FILTER-END
  // ====================================================================
  // 3. Sea salt from salt pans (interactive: sunshine)
  // ====================================================================
  (function () {
    const SUNW = ['weak', 'mild', 'medium', 'strong', 'very strong'];
    const VMIN = 0.08, VX = 0.16, DEF = 3;
    const rowHtml = '<div class="scene-slider-row" style="padding:2px 8px"><span>Sun</span>' +
      '<input type="range" id="mxm-sp-s" min="1" max="5" step="1" value="' + DEF + '" aria-label="Strength of the sunshine">' +
      '<span id="mxm-sp-sv" style="min-width:78px;text-align:right">' + SUNW[DEF - 1] + '</span></div>';
    // shared evaporation clock: water left V goes 1 -> VMIN, holds, then sea water flows back in
    function clock() {
      const c = { V: 1, ph: 'evap', hold: 0, sun: DEF };
      c.step = dt => {
        if (c.ph === 'evap') { c.V = Math.max(VMIN, c.V - 0.04 * c.sun * dt); if (c.V <= VMIN) { c.ph = 'hold'; c.hold = 3.2; } }
        else if (c.ph === 'hold') { c.hold -= dt; if (c.hold <= 0) c.ph = 'fill'; }
        else { c.V = Math.min(1, c.V + 0.9 * dt); if (c.V >= 1) c.ph = 'evap'; }
        c.salt = c.ph === 'fill' ? clamp(1 - (c.V - VMIN) / 0.2, 0, 1) : clamp((VX - c.V) / (VX - VMIN), 0, 1);
      };
      c.step(0);
      return c;
    }
    const msg = c => c.ph === 'fill' ? 'Fresh sea water flows in' : c.salt > 0.5 ? 'Salt crystals are left!' : c.V < 0.5 ? 'Salty water gets stronger' : 'Water evaporates';
    steps.push({
      kind: 'example',
      title: 'Real life: Salt from the sea',
      text: '<p>Sea water is a <b>solution</b>: about 3.5% salt dissolved in water. In sunny places it is let into shallow pans. The Sun\'s heat makes the water evaporate, but the salt stays behind, so white crystals are left to collect.</p>',
      explain: '<p>A shallow clay <b>pan</b> holds blue sea water with dots of dissolved salt. The <b>Sun</b> sends yellow arrows: more arrows mean stronger sunshine. Pale vapor rises and the water level sinks. When about a tenth of the water is left, white <b>salt crystals</b> appear on the bottom. Then sea water flows in again. Try the <b>Sun</b> slider.</p>',
      say: 'This is a salt pan, used in sunny places to get salt from the sea. Sea water is a solution. About three and a half percent of it is dissolved salt. Watch the Sun heat the shallow water. Pale vapor rises, and the water level slowly sinks. Only the water evaporates. The salt cannot, so the dissolved salt gets more crowded. When about one tenth of the water is left, white salt crystals begin to grow on the bottom. Then fresh sea water flows in and it starts again. Now drag the sun slider. Stronger sunshine evaporates the water faster, so the crystals appear sooner.',
      mount(el, api) {
        el.innerHTML = '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' + rowHtml;
        const svg = el.querySelector('svg');
        const XL = 40, XR = 240, BOT = 172, DEPTH = 40;
        const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
        const sun = svgEl('g', {}, svg);
        const rays = [];
        for (let i = 0; i < 5; i++) rays.push(svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#eab308', 'stroke-width': 3, 'stroke-linecap': 'round' }, sun));
        svgEl('circle', { cx: 60, cy: 36, r: 15, fill: '#facc15', stroke: '#ca8a04', 'stroke-width': 2 }, sun);
        rays.forEach((r, i) => { const a = 0.15 + i * 0.28, x0 = 60 + Math.cos(a) * 24, y0 = 36 + Math.sin(a) * 24; r.setAttribute('x1', x0); r.setAttribute('y1', y0); r.setAttribute('x2', x0 + Math.cos(a) * 26); r.setAttribute('y2', y0 + Math.sin(a) * 26); });
        const water = svgEl('rect', { x: XL + 2, y: BOT - DEPTH, width: XR - XL - 4, height: DEPTH, fill: 'var(--t-blue)', opacity: 0.45 }, svg);
        const dots = [];
        for (let i = 0; i < 16; i++) dots.push({ c: svgEl('circle', { r: 3.2, fill: i % 2 ? 'var(--t-muted)' : '#f8fafc', stroke: 'var(--t-muted)', 'stroke-width': 0.8 }, svg), x: rnd(XL + 8, XR - 8), y: rnd(0, 1), vx: rnd(-10, 10), vy: rnd(-6, 6) });
        const cr = [];
        for (let i = 0; i < 12; i++) cr.push(svgEl('rect', { x: XL + 10 + i * 15.5, y: BOT - 8, width: 8, height: 8, fill: '#fff', stroke: 'var(--t-muted)', 'stroke-width': 1.3, opacity: 0 }, svg));
        svgEl('path', { d: 'M' + (XL - 6) + ' ' + (BOT - DEPTH - 6) + ' L' + (XL - 6) + ' ' + (BOT + 4) + ' L' + (XR + 6) + ' ' + (BOT + 4) + ' L' + (XR + 6) + ' ' + (BOT - DEPTH - 6), fill: 'none', stroke: '#a16207', 'stroke-width': 5, 'stroke-linejoin': 'round' }, svg);
        const vap = [];
        for (let i = 0; i < 6; i++) vap.push({ c: svgEl('circle', { r: 4, fill: 'var(--t-muted)', opacity: 0 }, svg), x: XL + 25 + i * 30, ph: i / 6 });
        T(262, 40, 14, 700, 'var(--primary)').textContent = 'Salt pan';
        const tW = T(262, 66, 14, 700, 'var(--t-ink)'), tM = T(262, 92, 13, 700, 'var(--t-orange)');
        T(262, 136, 13, 400, 'var(--t-muted)').textContent = 'Sea water: about';
        T(262, 154, 13, 400, 'var(--t-muted)').textContent = '3.5% salt';
        const slider = el.querySelector('#mxm-sp-s'), sv = el.querySelector('#mxm-sp-sv');
        const ck = clock();
        slider.addEventListener('input', () => { ck.sun = +slider.value; sv.textContent = SUNW[ck.sun - 1]; });
        let last = '';
        api.loop((t, dt) => {
          ck.step(dt);
          const h = DEPTH * ck.V;
          water.setAttribute('y', (BOT - h).toFixed(1)); water.setAttribute('height', h.toFixed(1));
          rays.forEach((r, i) => r.setAttribute('opacity', i < ck.sun ? 1 : 0.1));
          dots.forEach(d => {
            d.x += d.vx * dt; d.y += d.vy * dt / 30; if (d.x < XL + 6 || d.x > XR - 6) d.vx = -d.vx; if (d.y < 0.05 || d.y > 0.95) d.vy = -d.vy;
            d.c.setAttribute('cx', d.x.toFixed(1)); d.c.setAttribute('cy', (BOT - 5 - (h - 8) * d.y).toFixed(1)); d.c.setAttribute('opacity', (1 - ck.salt).toFixed(2));
          });
          cr.forEach(c => c.setAttribute('opacity', ck.salt.toFixed(2)));
          vap.forEach(v => {
            const u = (t * (0.15 + 0.08 * ck.sun) + v.ph) % 1, on = ck.V > 0.1 && ck.ph !== 'fill' && v.ph * 6 < ck.sun + 1;
            v.c.setAttribute('cx', (v.x + Math.sin(u * 8 + v.ph * 9) * 4).toFixed(1)); v.c.setAttribute('cy', (BOT - h - 4 - u * 46).toFixed(1));
            v.c.setAttribute('opacity', on ? (0.5 * (1 - u)).toFixed(2) : 0);
          });
          tW.textContent = 'Water left: ' + Math.round(ck.V * 100) + '%';
          const m = msg(ck); if (m !== last) { tM.textContent = m; last = m; }
        });
      },
      scene3d: Chem3D.define({ distance: 10.4, pitch: 0.42, yaw: 0.5, autoRotate: 0, target: [0.2, 1.1, 0] }, (view, ctx) => {
        sway(view, 0.35, 0.5); fitNarrow(view, 1.25);
        const PW = 4.4, PD = 3.0, WH = 0.55;
        // clay pan
        view.box(PW + 0.5, 0.12, PD + 0.5, '#a8896a', { pos: [0, -0.06, 0] });
        [[0, PD / 2 + 0.22, PW + 0.5, 0.12], [0, -PD / 2 - 0.22, PW + 0.5, 0.12], [PW / 2 + 0.22, 0, 0.12, PD + 0.5], [-PW / 2 - 0.22, 0, 0.12, PD + 0.5]].forEach(w =>
          view.box(w[2], WH + 0.1, w[3], '#b98f5b', { pos: [w[0], (WH + 0.1) / 2, w[1]] }));
        const wat = view.box(PW, 1, PD, '#4aa8f0', { opacity: 0.5, shininess: 90 });
        const geo = new THREE.SphereGeometry(1, 12, 9), cubeGeo = new THREE.BoxGeometry(1, 1, 1);
        const ions = [];
        for (let i = 0; i < 40; i++) {
          const m = new THREE.Mesh(geo, view.mat(i % 2 ? '#94a3b8' : '#f1f5f9', { shininess: 60 })); m.scale.setScalar(0.09); view.scene.add(m);
          ions.push({ m, p: new THREE.Vector3(rnd(-PW / 2 + 0.1, PW / 2 - 0.1), rnd(0.02, 1), rnd(-PD / 2 + 0.1, PD / 2 - 0.1)), v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(0.45) });
        }
        const crys = [];
        const cmat = view.mat('#ffffff', { shininess: 100, specular: '#ffffff' });
        for (let i = 0; i < 30; i++) {
          const m = new THREE.Mesh(cubeGeo, cmat); const s = rnd(0.17, 0.3);
          m.position.set(rnd(-PW / 2 + 0.3, PW / 2 - 0.3), s * 0.5 * 0.9, rnd(-PD / 2 + 0.3, PD / 2 - 0.3)); m.rotation.set(0, rnd(0, 1.5), 0); m.scale.setScalar(0.001); view.scene.add(m); crys.push({ m, s });
        }
        // sun and its arrows
        const SP = new THREE.Vector3(-3.0, 3.6, -0.4);
        const sunM = view.sphere(0.55, '#facc15', { emissive: '#f59e0b', shininess: 10 }); sunM.position.copy(SP);
        const arrows = [];
        for (let i = 0; i < 5; i++) {
          const tgt = new THREE.Vector3(-1.5 + i * 0.75, 0.9, (i % 2 ? 0.5 : -0.5)), d = tgt.clone().sub(SP).normalize();
          const a = view.arrow(SP.clone().addScaledVector(d, 1.0).toArray(), SP.clone().addScaledVector(d, 3.2 + (i % 2) * 0.3).toArray(), '#eab308', { width: 0.045, head: 0.35 });
          arrows.push(a);
        }
        const vap = [];
        for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(geo, view.mat('#e2e8f0', { opacity: 0.5, shininess: 5 })); view.scene.add(m); vap.push({ m, ph: i / 10, x: rnd(-1.8, 1.8), z: rnd(-1.1, 1.1) }); }
        view.label('Salt pan', [1.4, 2.7, 0], { size: 0.85, color: '#1f2937' });
        const labSalt = view.label('Salt crystals', [0.2, -0.65, 1.9], { size: 1.0, fontSize: 44, bg: 'rgba(255,255,255,0.88)', color: '#334155' });
        const row = ctx.controls(rowHtml);
        shiftView(view, 0.12);
        const ov = overlay(view, 'right:8px;top:6px;width:36%;font-size:12px;line-height:1.45');
        ov.innerHTML = '<div id="mxm-sp-w" style="font-size:13px"></div><div id="mxm-sp-m" style="color:var(--t-orange);margin:4px 0 8px"></div><div style="font-weight:600;font-size:11px;color:var(--t-muted)">Sea water: about 3.5% salt</div>';
        const eW = ov.querySelector('#mxm-sp-w'), eM = ov.querySelector('#mxm-sp-m');
        const slider = row.querySelector('#mxm-sp-s'), sv = row.querySelector('#mxm-sp-sv');
        const ck = clock();
        slider.addEventListener('input', () => { ck.sun = +slider.value; sv.textContent = SUNW[ck.sun - 1]; });
        let lastW = '', lastM = '';
        view.run((t, dt) => {
          shiftView(view, 0.12);
          ck.step(dt);
          const h = WH * 0.9 * ck.V + 0.02;
          wat.scale.y = h; wat.position.y = h / 2 + 0.05; wat.visible = ck.V > 0.02;
          arrows.forEach((a, i) => { a.visible = i < ck.sun; });
          sunM.scale.setScalar(0.5 + 0.03 * ck.sun + 0.02 * Math.sin(t * 3));
          ions.forEach(o => {
            jitter(o.v, 0.5, dt, 4); o.p.addScaledVector(o.v, dt);
            if (o.p.x < -PW / 2 + 0.1 || o.p.x > PW / 2 - 0.1) o.v.x = -o.v.x; if (o.p.z < -PD / 2 + 0.1 || o.p.z > PD / 2 - 0.1) o.v.z = -o.v.z;
            o.p.x = clamp(o.p.x, -PW / 2 + 0.1, PW / 2 - 0.1); o.p.z = clamp(o.p.z, -PD / 2 + 0.1, PD / 2 - 0.1);
            if (o.p.y < 0.08) { o.p.y = 0.08; o.v.y = Math.abs(o.v.y); } if (o.p.y > h - 0.02) { o.p.y = Math.max(0.08, h - 0.02); o.v.y = -Math.abs(o.v.y); }
            o.m.position.copy(o.p); o.m.scale.setScalar(0.09 * (1 - ck.salt) + 0.001);
          });
          crys.forEach(c => c.m.scale.setScalar(c.s * ck.salt + 0.001));
          labSalt.visible = ck.salt > 0.5;
          vap.forEach(v => {
            const u = (t * (0.12 + 0.07 * ck.sun) + v.ph) % 1, on = ck.V > 0.1 && ck.ph !== 'fill' && v.ph * 10 < ck.sun * 2;
            v.m.position.set(v.x + Math.sin(t + v.ph * 9) * 0.12, h + 0.15 + u * 2.0, v.z);
            v.m.scale.setScalar(on ? 0.14 + u * 0.25 : 0.001); v.m.material.opacity = 0.38 * (1 - u) * Math.min(1, u * 6);
          });
          const w = 'Water left: ' + Math.round(ck.V * 100) + '%'; if (w !== lastW) { eW.textContent = w; lastW = w; }
          const m = msg(ck); if (m !== lastM) { eM.textContent = m; lastM = m; }
        });
      })
    });
  })();
  // @@STEP-SALTPANS-END
  // ====================================================================
  // 4. Milk and fog: a colloid shows a light beam (interactive: choose the liquid)
  // ====================================================================
  (function () {
    const MODES = [['salt', 'Salt water'], ['milk', 'Milk in water']];
    const INFO = {
      salt: ['Solution: tiny particles', ['Under 1 nm: light passes', 'straight through.']],
      milk: ['Colloid: bigger particles', ['1 to 1000 nm: they scatter', 'light, so the beam shows.']]
    };
    const rowHtml = '<div class="scene-slider-row" style="justify-content:center;gap:6px;padding:2px 8px">' +
      MODES.map(m => '<button type="button" class="scene-btn" data-m="' + m[0] + '" style="padding:3px 10px">' + m[1] + '</button>').join('') + '</div>';
    steps.push({
      kind: 'example',
      title: 'Real life: Milk and fog show the light',
      text: '<p>A torch beam vanishes in salt water but lights up in milky water or fog. Milk and fog are <b>colloids</b>: their particles are bigger than dissolved ones, so they scatter light. This is the <b>Tyndall effect</b>.</p>',
      explain: '<p>A torch on the left shines a yellow beam through a glass beaker. In <b>Salt water</b> the tiny grey and white dots let the light pass, so the middle of the beam disappears. In <b>Milk in water</b> the bigger cream droplets glow bright yellow wherever the beam hits them, so the beam shows. The scene switches by itself, and the buttons let you choose.</p>',
      say: 'A torch shines a beam of light through a glass of liquid. First the glass holds salt water. The dissolved particles are so tiny that the light passes straight through, and you cannot see the beam inside the water. Now it changes to milk in water. Look at the bigger cream droplets. Wherever the beam touches one, it glows and scatters light in every direction, so the beam lights up. This is called the Tyndall effect. Milk is a colloid, and so is fog, which is why car headlights make a bright beam in fog. Use the two buttons to switch between salt water and milk in water and compare.',
      mount(el, api) {
        el.innerHTML = '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' + rowHtml;
        const svg = el.querySelector('svg'), row = el.querySelector('.scene-slider-row');
        const BL = 110, BR = 210, BT = 46, BB = 172, BY = 90;
        const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
        const liq = svgEl('rect', { x: BL + 2, y: 70, width: BR - BL - 4, height: BB - 70, fill: 'var(--t-blue)', opacity: 0.3 }, svg);
        const bL = svgEl('rect', { x: 46, y: BY - 6, width: BL - 46, height: 12, fill: '#facc15', opacity: 0.35 }, svg);
        const bM = svgEl('rect', { x: BL + 2, y: BY - 6, width: BR - BL - 4, height: 12, fill: '#facc15', opacity: 0 }, svg);
        const bR = svgEl('rect', { x: BR, y: BY - 6, width: 96, height: 12, fill: '#facc15', opacity: 0.35 }, svg);
        svgEl('rect', { x: 14, y: BY - 12, width: 26, height: 24, rx: 4, fill: 'var(--t-muted)' }, svg);
        svgEl('rect', { x: 38, y: BY - 9, width: 8, height: 18, rx: 2, fill: '#facc15', stroke: '#ca8a04' }, svg);
        svgEl('path', { d: 'M' + BL + ' ' + BT + ' L' + BL + ' ' + BB + ' L' + BR + ' ' + BB + ' L' + BR + ' ' + BT, fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
        const ions = [], drops = [];
        for (let i = 0; i < 34; i++) ions.push({ c: svgEl('circle', { r: 1.8, fill: i % 2 ? 'var(--t-muted)' : '#cbd5e1' }, svg), x: rnd(BL + 6, BR - 6), y: rnd(74, BB - 6), a: rnd(0, TAU) });
        for (let i = 0; i < 18; i++) drops.push({ c: svgEl('circle', { r: 4, fill: '#f5ecd7', stroke: '#d6c9a8', 'stroke-width': 1, opacity: 0 }, svg), x: rnd(BL + 8, BR - 8), y: rnd(76, BB - 8), a: rnd(0, TAU) });
        const tT = T(232, 34, 14, 700, 'var(--primary)');
        const tl = [0, 1].map(i => T(232, 128 + i * 19, 13, 400, 'var(--t-ink)'));
        T(232, 60, 13, 700, 'var(--t-orange)').textContent = 'Torch beam';
        let mode = 'salt', mix = 0, auto = true;
        const setMode = m => { mode = m; paintButtons(row, 'm', m); tT.textContent = INFO[m][0]; tl.forEach((t, i) => { t.textContent = INFO[m][1][i]; }); };
        row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { auto = false; setMode(b.dataset.m); }));
        setMode('salt');
        api.loop((t, dt) => {
          if (auto && t > 3.5 && mode === 'salt') setMode('milk');
          mix += ((mode === 'milk' ? 1 : 0) - mix) * Math.min(1, dt * 5);
          liq.setAttribute('fill', mix > 0.5 ? '#f3efe4' : 'var(--t-blue)'); liq.setAttribute('opacity', (0.3 + 0.35 * mix).toFixed(2));
          bM.setAttribute('opacity', (0.75 * mix).toFixed(2)); bR.setAttribute('opacity', (0.35 - 0.2 * mix).toFixed(2));
          ions.forEach(p => { p.a += (Math.random() - 0.5) * 6 * dt; p.x += Math.cos(p.a) * 14 * dt; p.y += Math.sin(p.a) * 14 * dt; if (p.x < BL + 6 || p.x > BR - 6) p.a = Math.PI - p.a; if (p.y < 74 || p.y > BB - 6) p.a = -p.a; p.x = clamp(p.x, BL + 6, BR - 6); p.y = clamp(p.y, 74, BB - 6); p.c.setAttribute('cx', p.x.toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1)); p.c.setAttribute('opacity', (1 - mix).toFixed(2)); });
          drops.forEach(p => {
            p.a += (Math.random() - 0.5) * 6 * dt; p.x += Math.cos(p.a) * 12 * dt; p.y += Math.sin(p.a) * 12 * dt; if (p.x < BL + 8 || p.x > BR - 8) p.a = Math.PI - p.a; if (p.y < 76 || p.y > BB - 8) p.a = -p.a; p.x = clamp(p.x, BL + 8, BR - 8); p.y = clamp(p.y, 76, BB - 8);
            const lit = Math.abs(p.y - BY) < 9;
            p.c.setAttribute('cx', p.x.toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1)); p.c.setAttribute('opacity', mix.toFixed(2)); p.c.setAttribute('fill', lit ? '#fde047' : '#f5ecd7');
          });
        });
      },
      scene3d: Chem3D.define({ distance: 10.6, pitch: 0.16, yaw: 0.12, autoRotate: 0, target: [0, 1.75, 0] }, (view, ctx) => {
        sway(view, 0.16, 0.5); fitNarrow(view, 1.12);
        const R = 1.4, H = 3.2, LEVEL = 0.75, BY = 1.4, top = 0.01 + H * 0.96 * LEVEL;
        const bk = view.beaker(R, H, { level: LEVEL, liquidColor: '#8fc9f5', liquidOpacity: 0.3 });
        // torch (left) and its beam, drawn in three pieces so the part inside the liquid can change
        const torch = view.cylinder([-4.8, BY, 0], [-3.9, BY, 0], 0.34, '#475569');
        view.cylinder([-3.9, BY, 0], [-3.5, BY, 0], 0.48, '#94a3b8');
        view.cylinder([-3.5, BY, 0], [-3.46, BY, 0], 0.42, '#fde047', { emissive: '#facc15', shininess: 10 });
        const beam = (x0, x1, op) => { const m = view.cylinder([x0, BY, 0], [x1, BY, 0], 0.17, '#facc15', { opacity: op, shininess: 5 }); return m; };
        const bL = beam(-3.4, -R, 0.28), bM = beam(-R, R, 0.02), bR = beam(R, 4.0, 0.28);
        const geo = new THREE.SphereGeometry(1, 14, 10);
        const ions = [], drops = [];
        for (let i = 0; i < 44; i++) {
          const m = new THREE.Mesh(geo, view.mat(i % 2 ? '#94a3b8' : '#e2e8f0', { shininess: 50 })); m.scale.setScalar(0.05); view.scene.add(m);
          ions.push({ m, p: inCylinder(R - 0.15, 0.15, top - 0.12), v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(0.5) });
        }
        for (let i = 0; i < 30; i++) {
          const mat = view.mat('#f3e9cf', { shininess: 30 }); const m = new THREE.Mesh(geo, mat); m.scale.setScalar(0.001); view.scene.add(m);
          drops.push({ m, mat, lit: 0, p: inCylinder(R - 0.2, 0.2, top - 0.15), v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).setLength(0.4) });
        }
        const row = ctx.controls(rowHtml);
        const ov = overlay(view, 'left:6px;right:6px;top:4px;text-align:center;font-size:11px;line-height:1.25');
        ov.innerHTML = '<div id="mxm-ty-t" style="color:var(--primary);font-size:13px"></div><div id="mxm-ty-d" style="font-weight:600"></div>';
        const eT = ov.querySelector('#mxm-ty-t'), eD = ov.querySelector('#mxm-ty-d');
        let mode = 'salt', mix = 0, auto = true;
        const setMode = m => { mode = m; paintButtons(row, 'm', m); eT.textContent = INFO[m][0]; eD.textContent = INFO[m][1].join(' '); };
        row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { auto = false; setMode(b.dataset.m); }));
        setMode('salt');
        const wc = new THREE.Color('#8fc9f5'), mc = new THREE.Color('#f3efe4'), tmp = new THREE.Color(), dark = new THREE.Color('#000000'), glow = new THREE.Color('#fde047');
        const step = (o, r, dt, sp) => {
          jitter(o.v, sp, dt, 5); o.p.addScaledVector(o.v, dt); keepInCylinder(o.p, o.v, R - r - 0.06, r + 0.06, top - r - 0.05); o.m.position.copy(o.p);
        };
        view.run((t, dt) => {
          if (auto && t > 3.5 && mode === 'salt') setMode('milk');
          mix += ((mode === 'milk' ? 1 : 0) - mix) * Math.min(1, dt * 5);
          bk.liquidMesh.material.color.copy(tmp.copy(wc).lerp(mc, mix)); bk.liquidMesh.material.opacity = 0.3 + 0.3 * mix;
          bM.material.opacity = 0.02 + 0.5 * mix; bR.material.opacity = 0.28 - 0.17 * mix;
          ions.forEach(o => { step(o, 0.05, dt, 0.5); o.m.scale.setScalar(0.05 * (1 - mix) + 0.001); });
          drops.forEach(o => {
            step(o, 0.11, dt, 0.4);
            const inBeam = Math.abs(o.p.y - BY) < 0.26 && Math.abs(o.p.z) < 0.26;
            o.lit += ((inBeam ? 1 : 0) - o.lit) * Math.min(1, dt * 10);
            o.m.scale.setScalar((0.11 + 0.05 * o.lit) * mix + 0.001);
            o.mat.emissive.copy(dark).lerp(glow, o.lit * mix); o.mat.color.set(o.lit > 0.5 ? '#fde68a' : '#f3e9cf');
          });
        });
      })
    });
  })();
  // @@STEP-TYNDALL-END
  // ====================================================================
  // 5. Alloys: brass and steel are solid mixtures (interactive: choose the metal)
  // ====================================================================
  (function () {
    const CU = '#c2410c', ZN = '#6d7fd1', FE = '#8a94a6', CC = '#111827';
    const MODES = [['cu', 'Copper'], ['brass', 'Brass'], ['steel', 'Steel']];
    const AMP = { cu: 1, brass: 0.45, steel: 0.18 };
    const INFO = {
      cu: { t: 'Pure copper', d: ['Same-size atoms.', 'Layers slide easily,', 'so copper is soft.'], leg: [[CU, 'Copper atom']] },
      brass: { t: 'Brass', d: ['Zinc atoms are a', 'different size. They', 'block the layers.'], leg: [[CU, 'Copper atom'], [ZN, 'Zinc atom']] },
      steel: { t: 'Steel', d: ['Small carbon atoms', 'lock the layers: much', 'harder than iron.'], leg: [[FE, 'Iron atom'], [CC, 'Carbon atom']] }
    };
    const rowHtml = '<div class="scene-slider-row" style="justify-content:center;gap:6px;padding:2px 8px">' +
      MODES.map(m => '<button type="button" class="scene-btn" data-m="' + m[0] + '" style="padding:3px 10px">' + m[1] + '</button>').join('') + '</div>';
    steps.push({
      kind: 'example',
      title: 'Real life: Brass and steel are mixtures too',
      text: '<p>Brass instruments and steel bridges are made of <b>alloys</b>: mixtures of a metal with other elements, mixed while melted. An alloy is not a compound, since the amounts can vary. Atoms of a different size make the metal <b>harder</b>.</p>',
      explain: '<p>A block of atoms sits in layers, and the top layer is pushed right and back. In <b>Copper</b> the orange atoms are all alike and the layer slides far. In <b>Brass</b> some are swapped for blue-violet zinc atoms and it slides less. In <b>Steel</b> small black carbon atoms sit between grey iron atoms and it barely moves. It switches by itself; use the buttons.</p>',
      say: 'Look at this block of metal atoms, arranged in neat layers. The top layer is being pushed to the right. In pure copper, all the atoms are the same size, so the layer slides a long way. That is why copper is soft. Now watch brass. Some copper atoms are swapped for bigger zinc atoms, and the layer slides much less. Then steel. Tiny carbon atoms sit in the gaps between iron atoms and lock the layers almost in place. Brass and steel are alloys, which are mixtures of a metal with other elements. They are made by mixing the substances while they are melted. Press the buttons to compare the three metals.',
      mount(el, api) {
        el.innerHTML = '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' + rowHtml;
        const svg = el.querySelector('svg'), row = el.querySelector('.scene-slider-row');
        const NC = 7, NR = 4, DX = 30, DY = 27, X0 = 40, Y0 = 62;
        const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
        const zincSlot = new Set(); while (zincSlot.size < 9) zincSlot.add(Math.floor(rnd(0, NC * NR)));
        const atoms = [];
        for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) atoms.push({ j, i, x: X0 + i * DX, y: Y0 + j * DY, c: svgEl('circle', { r: 12, cx: X0 + i * DX, cy: Y0 + j * DY, stroke: 'rgba(0,0,0,0.25)', 'stroke-width': 1 }, svg), zn: zincSlot.has(j * NC + i) });
        const carbs = [];
        for (let i = 0; i < 4; i++) carbs.push(svgEl('circle', { r: 4.5, cx: X0 + 15 + i * 60, cy: Y0 + DY / 2, fill: CC, stroke: '#94a3b8', 'stroke-width': 1, opacity: 0 }, svg));
        svgEl('line', { x1: 20, y1: Y0 + DY / 2, x2: 250, y2: Y0 + DY / 2, stroke: 'var(--t-muted)', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, svg);
        const arrow = svgEl('path', { d: 'M40 30 L96 30 M88 24 L96 30 L88 36', fill: 'none', stroke: 'var(--t-orange)', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
        T(104, 35, 13, 700, 'var(--t-orange)').textContent = 'Push';
        const tT = T(262, 34, 15, 700, 'var(--primary)');
        const legG = svgEl('g', {}, svg);
        const tl = [0, 1, 2].map(i => T(262, 132 + i * 19, 13, 400, 'var(--t-ink)'));
        let mode = 'cu', auto = true, mix = { zn: 0, c: 0 }, amp = 1, tcyc = 0;
        const setMode = m => {
          mode = m; paintButtons(row, 'm', m); tT.textContent = INFO[m].t; tl.forEach((t, i) => { t.textContent = INFO[m].d[i]; });
          legG.innerHTML = '';
          INFO[m].leg.forEach((l, i) => { svgEl('circle', { cx: 268, cy: 58 + i * 22, r: 6, fill: l[0], stroke: '#94a3b8', 'stroke-width': 1 }, legG); svgEl('text', { x: 280, y: 63 + i * 22, 'font-size': 13, 'font-weight': 700, fill: 'var(--t-ink)' }, legG).textContent = l[1]; });
        };
        row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { auto = false; setMode(b.dataset.m); }));
        setMode('cu');
        api.loop((t, dt) => {
          if (auto) { const k = Math.floor(t / 5.5) % 3; if (MODES[k][0] !== mode) setMode(MODES[k][0]); }
          amp += (AMP[mode] - amp) * Math.min(1, dt * 4); tcyc += dt;
          const s = amp * DX * (0.5 - 0.5 * Math.cos(tcyc * 1.6)) + (mode === 'brass' ? 1.2 * Math.sin(tcyc * 9) * amp : 0);
          atoms.forEach(a => {
            const zn = mode === 'brass' && a.zn, fe = mode === 'steel';
            a.c.setAttribute('fill', zn ? ZN : fe ? FE : CU); a.c.setAttribute('r', zn ? 13.5 : 12);
            a.c.setAttribute('cx', (a.x + (a.j === 0 ? s : 0) + Math.sin(t * 6 + a.i * 2 + a.j) * 0.8).toFixed(1)); a.c.setAttribute('cy', (a.y + Math.cos(t * 5 + a.i + a.j * 3) * 0.8).toFixed(1));
          });
          carbs.forEach(c => c.setAttribute('opacity', mode === 'steel' ? 1 : 0));
        });
      },
      scene3d: Chem3D.define({ distance: 9.4, pitch: 0.4, yaw: 0.6, autoRotate: 0, target: [0, 0.9, 0] }, (view, ctx) => {
        sway(view, 0.3, 0.45); fitNarrow(view, 1.12);
        const NX = 4, NY = 3, NZ = 4, SP = 0.9, RA = 0.32;
        const geo = new THREE.SphereGeometry(1, 20, 14);
        const mCu = view.mat(CU, { shininess: 90, specular: '#ffedd5' }), mZn = view.mat(ZN, { shininess: 90 }), mFe = view.mat(FE, { shininess: 100, specular: '#ffffff' }), mC = view.mat(CC, { shininess: 60 });
        const slots = new Set(); while (slots.size < 14) slots.add(Math.floor(rnd(0, NX * NY * NZ)));
        const atoms = [];
        for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) for (let k = 0; k < NZ; k++) {
          const m = new THREE.Mesh(geo, mCu); m.scale.setScalar(RA); view.scene.add(m);
          atoms.push({ m, j, hx: (i - (NX - 1) / 2) * SP, hy: j * SP, hz: (k - (NZ - 1) / 2) * SP, zn: slots.has(atoms.length), ph: rnd(0, TAU) });
        }
        const carbs = [];
        const cells = []; for (let i = 0; i < NX - 1; i++) for (let k = 0; k < NZ - 1; k++) cells.push([i, k]);
        cells.sort(() => Math.random() - 0.5);
        cells.slice(0, 8).forEach(c => {
          const m = new THREE.Mesh(geo, mC); m.scale.setScalar(0.001); m.position.set((c[0] + 0.5 - (NX - 1) / 2) * SP, 1.5 * SP, (c[1] + 0.5 - (NZ - 1) / 2) * SP); view.scene.add(m); carbs.push(m);
        });
        const push = view.arrow([-2.4, 2.6, 0], [-1.3, 2.6, 0], '#f97316', { width: 0.07, head: 0.4 });
        view.label('Push', [-1.85, 3.1, 0], { size: 0.8, color: '#ea580c' });
        const row = ctx.controls(rowHtml);
        shiftView(view, 0.16);
        const ov = overlay(view, 'right:8px;top:6px;width:38%;font-size:11px;line-height:1.4');
        const eT = document.createElement('div'); eT.style.cssText = 'color:var(--primary);font-size:13px;margin-bottom:4px';
        const eL = document.createElement('div'), eD = document.createElement('div'); eD.style.cssText = 'margin-top:6px;font-weight:600';
        ov.append(eT, eL, eD);
        let mode = 'cu', auto = true, amp = 1, tcyc = 0, cm = 0;
        const setMode = m => {
          mode = m; paintButtons(row, 'm', m); eT.textContent = INFO[m].t; eD.textContent = INFO[m].d.join(' ');
          eL.innerHTML = INFO[m].leg.map(l => '<div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:' + l[0] + ';border:1px solid #94a3b8;display:inline-block;flex:0 0 auto"></span>' + l[1] + '</div>').join('');
        };
        row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { auto = false; setMode(b.dataset.m); }));
        setMode('cu');
        view.run((t, dt) => {
          shiftView(view, 0.16);
          if (auto) { const k = Math.floor(t / 5.5) % 3; if (MODES[k][0] !== mode) setMode(MODES[k][0]); }
          amp += (AMP[mode] - amp) * Math.min(1, dt * 4); tcyc += dt;
          cm += ((mode === 'steel' ? 1 : 0) - cm) * Math.min(1, dt * 5);
          const s = amp * SP * (0.5 - 0.5 * Math.cos(tcyc * 1.6)) + (mode === 'brass' ? 0.03 * Math.sin(tcyc * 9) * amp : 0);
          atoms.forEach(a => {
            const zn = mode === 'brass' && a.zn;
            a.m.material = zn ? mZn : mode === 'steel' ? mFe : mCu; a.m.scale.setScalar(zn ? RA * 1.12 : RA);
            a.m.position.set(a.hx + (a.j === NY - 1 ? s : 0) + 0.02 * Math.sin(t * 6 + a.ph), a.hy + 0.02 * Math.cos(t * 5 + a.ph), a.hz + 0.02 * Math.sin(t * 7 + a.ph * 2));
          });
          carbs.forEach(c => c.scale.setScalar(0.17 * cm + 0.001));
        });
      })
    });
  })();
  // @@STEP-ALLOY-END

  addTutorialSteps('chemistry', 'mixtures', steps, [
    { term: 'Sieving', definition: 'Separating solid pieces of different sizes with a mesh; small pieces fall through the holes and big ones stay on top.' },
    { term: 'Colloid', definition: 'A mixture with particles bigger than dissolved ones but too small to settle, such as milk or fog. It scatters light.' },
    { term: 'Tyndall effect', definition: 'The scattering of a light beam by the particles in a colloid, which makes the beam visible.' },
    { term: 'Alloy', definition: 'A mixture of a metal with other elements, such as brass (copper and zinc) or steel (iron and carbon).' }
  ]);
})();
