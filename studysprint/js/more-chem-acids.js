(function () {
  'use strict';
  // more-chem-acids: five extra real-life example steps for Chemistry > Acids & Bases (ids prefixed "mca-").
  // Each has a flat (SVG) scene, used as the fallback, and a three.js scene (scene3d) built with Chem3D.

  const T = typeof THREE !== 'undefined' ? THREE : null;
  const steps = [];

  // ---------------------------------------------------------------- shared numeric helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const lerpArr = (a, b, f) => a.map((v, k) => v + (b[k] - v) * f);
  const rgbStr = c => 'rgb(' + c.map(v => Math.round(clamp(v, 0, 255))).join(',') + ')';
  function stopsRGB(stops, x) {
    if (x <= stops[0][0]) return stops[0][1].slice();
    for (let i = 1; i < stops.length; i++) {
      if (x <= stops[i][0]) { const a = stops[i - 1], b = stops[i]; return lerpArr(a[1], b[1], (x - a[0]) / (b[0] - a[0])); }
    }
    return stops[stops.length - 1][1].slice();
  }
  function keyf(u, kts, vals) {
    for (let i = 1; i < kts.length; i++) {
      if (u <= kts[i]) { const f = kts[i] === kts[i - 1] ? 1 : (u - kts[i - 1]) / (kts[i] - kts[i - 1]); return vals[i - 1] + (vals[i] - vals[i - 1]) * f; }
    }
    return vals[vals.length - 1];
  }
  const smooth = (e0, e1, x) => { const k = clamp((x - e0) / (e1 - e0), 0, 1); return k * k * (3 - 2 * k); };

  // Universal-indicator style colour (0 red ... 7 green ... 14 purple), same as the other acid scenes.
  const PH_STOPS = [[0, [229, 50, 45]], [3, [242, 140, 40]], [5, [245, 208, 32]], [7, [63, 185, 80]], [10, [59, 130, 246]], [14, [124, 58, 237]]];
  const phRGB = ph => stopsRGB(PH_STOPS, clamp(ph, 0, 14));

  function markButtons(row, on) {
    row.querySelectorAll('button').forEach(o => { const s = o === on; o.style.borderColor = s ? 'var(--primary)' : ''; o.style.color = s ? 'var(--primary)' : ''; });
  }

  // ---------------------------------------------------------------- flat (SVG) helpers
  const NS = 'http://www.w3.org/2000/svg';
  function mkEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  }
  const svgWrap = (inner, h) => `<svg viewBox="0 0 400 ${h || 190}" xmlns="${NS}" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%">${inner}</svg>`;
  const btnRow = html => `<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 6px">${html}</div>`;

  // Flat ions: [label, fill, radius]. Signs are drawn on every ion.
  const FI = { H: ['H⁺', '#e5322d', 10], OH: ['OH⁻', '#2563eb', 12], Cl: ['Cl⁻', '#64748b', 11], Mg: ['Mg²⁺', '#15803d', 15], Ca: ['Ca²⁺', '#0f766e', 15] };
  function ionNode(kind, parent) {
    const d = FI[kind], g = mkEl('g', null, parent);
    mkEl('circle', { r: d[2], fill: d[1], stroke: 'rgba(15,23,42,0.35)', 'stroke-width': 1 }, g);
    const t = mkEl('text', { y: 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#ffffff' }, g);
    t.textContent = d[0];
    g.__r = d[2];
    return g;
  }
  // A water molecule (bent, red oxygen and two white hydrogens) with an H2O tag.
  function waterNode(parent) {
    const g = mkEl('g', null, parent);
    mkEl('circle', { r: 7, fill: '#ef4444', stroke: 'rgba(15,23,42,0.35)', 'stroke-width': 1 }, g);
    mkEl('circle', { cx: -7, cy: 6, r: 4, fill: '#f8fafc', stroke: '#64748b', 'stroke-width': 1 }, g);
    mkEl('circle', { cx: 7, cy: 6, r: 4, fill: '#f8fafc', stroke: '#64748b', 'stroke-width': 1 }, g);
    const t = mkEl('text', { y: -10, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--t-ink)' }, g);
    t.textContent = 'H₂O';
    g.__r = 9;
    return g;
  }

  // Particles bouncing about in a rectangle (flat scenes). Each particle: { el, r, x, y, vx, vy, hold, kind }.
  function flatGas(b) {
    const parts = [];
    const draw = p => p.el.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')');
    function add(el, speed, x, y, kind) {
      const r = el.__r || 10, sp = speed || 22, a = Math.random() * 6.283;
      const p = { el, r, sp, kind, hold: false, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, x: 0, y: 0 };
      if (x != null) { p.x = clamp(x, b.x0 + r, b.x1 - r); p.y = clamp(y, b.y0 + r, b.y1 - r); }
      else for (let k = 0; k < 30; k++) {
        p.x = rand(b.x0 + r, b.x1 - r); p.y = rand(b.y0 + r, b.y1 - r);
        if (parts.every(q => Math.hypot(q.x - p.x, q.y - p.y) > (q.r + r) * 1.1)) break;
      }
      parts.push(p); draw(p);
      return p;
    }
    function remove(p) {
      const i = parts.indexOf(p); if (i >= 0) parts.splice(i, 1);
      if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
    }
    function clear() { parts.slice().forEach(remove); }
    function step(dt) {
      dt = Math.min(dt, 0.05);
      parts.forEach(p => {
        if (p.hold) return;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx += rand(-1, 1) * dt * 40; p.vy += rand(-1, 1) * dt * 40;
        const s = Math.hypot(p.vx, p.vy) || 1, k = p.sp * (0.85 + 0.3 * Math.random()) / s; p.vx *= k; p.vy *= k;
        if (p.x < b.x0 + p.r) { p.x = b.x0 + p.r; p.vx = Math.abs(p.vx); }
        if (p.x > b.x1 - p.r) { p.x = b.x1 - p.r; p.vx = -Math.abs(p.vx); }
        if (p.y < b.y0 + p.r) { p.y = b.y0 + p.r; p.vy = Math.abs(p.vy); }
        if (p.y > b.y1 - p.r) { p.y = b.y1 - p.r; p.vy = -Math.abs(p.vy); }
      });
      for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i], c = parts[j]; if (a.hold || c.hold) continue;
        const dx = a.x - c.x, dy = a.y - c.y, d = Math.hypot(dx, dy), min = (a.r + c.r) * 1.05;
        if (d < min && d > 1e-3) {
          const nx = dx / d, ny = dy / d, push = (min - d) / 2;
          a.x += nx * push; a.y += ny * push; c.x -= nx * push; c.y -= ny * push;
          const va = a.vx * nx + a.vy * ny, vc = c.vx * nx + c.vy * ny;
          if (va - vc < 0) { a.vx += (vc - va) * nx; a.vy += (vc - va) * ny; c.vx += (va - vc) * nx; c.vy += (va - vc) * ny; }
        }
      }
      parts.forEach(draw);
    }
    return { parts, add, remove, clear, step, draw };
  }

  // ---------------------------------------------------------------- 3D helpers (same look as js/chem3d-acids.js)
  // Ion kinds: [label, colour, radius]
  const ION = { H: ['H⁺', '#e5322d', 0.3], Cl: ['Cl⁻', '#94a3b8', 0.42], OH: ['OH⁻', '#2563eb', 0.38], Mg: ['Mg²⁺', '#16a34a', 0.5], Ca: ['Ca²⁺', '#0d9488', 0.5] };
  function makeIon(view, kind, pos) {
    const c = ION[kind];
    const m = view.sphere(c[2], c[1], { shininess: 60 });
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    const s = view.label(c[0], [0, 0, 0], { size: 0.62, color: '#ffffff', bold: true, fontSize: 60 });
    m.add(s); s.scale.multiplyScalar(1 / m.scale.x);
    m.userData.kind = kind; m.userData.r = c[2];
    return m;
  }
  // Free-moving particles inside a cylinder (world coordinates): bounce off the walls and off each other.
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
      parts.push(p); place(p);
      return p;
    }
    const tmp = new T.Vector3();
    function step(dt) {
      dt = Math.min(dt, 0.05);
      parts.forEach(p => {
        if (!p.on || p.hold) return;
        const pos = p.m.position;
        pos.addScaledVector(p.v, dt);
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
  function table(view, w, d, y, x) {
    const t = view.box(w, 0.16, d, '#e2e8f0', { shininess: 30 });
    t.position.set(x || 0, (y || 0) - 0.08, 0);
    return t;
  }
  // A downward-pointing marker cone whose tip sits at (x, y, z).
  function pointerCone(view, col) {
    const m = new T.Mesh(new T.ConeGeometry(0.32, 0.75, 20), view.mat(col || '#0f172a', { shininess: 40 }));
    m.rotation.x = Math.PI;
    view.scene.add(m);
    m.userData.setTip = (x, y, z) => m.position.set(x, y + 0.375 * m.scale.y, z);
    return m;
  }
  // A rainbow bar (vertex-coloured box); colorAt(f) gets 0..1 along the bar and returns a CSS colour string.
  function gradBar(view, x0, x1, y, z, h, d, colorAt) {
    const w = x1 - x0, g = new T.BoxGeometry(w, h, d, 56, 1, 1);
    const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new T.Color();
    for (let i = 0; i < pos.count; i++) { c.set(colorAt(pos.getX(i) / w + 0.5)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new T.BufferAttribute(col, 3));
    const m = new T.Mesh(g, new T.MeshPhongMaterial({ vertexColors: true, shininess: 50, specular: new T.Color('#666666') }));
    m.position.set((x0 + x1) / 2, y, z);
    view.scene.add(m);
    return m;
  }
  // A turntable: objects added with TT.add() turn about a vertical axis through x = cx (slowly, and when the user drags)
  // while the camera stays put, so the readout panel next to the apparatus never gets in the way.
  function makeTurntable(view, cx, speed) {
    const pivot = new T.Group(); pivot.position.set(cx, 0, 0);
    const inner = new T.Group(); inner.position.set(-cx, 0, 0);
    pivot.add(inner); view.scene.add(pivot);
    const base = view.cam.yaw;
    let spin = 0, idleUntil = 0;
    view.autoRotate = 0;
    view.canvas.addEventListener('dblclick', () => { spin = 0; pivot.rotation.y = 0; });
    return {
      inner, pivot,
      add(o) { inner.add(o); return o; },
      update(dt) {
        const d = view.cam.yaw - base;
        if (d) { spin -= d; view.cam.yaw = base; idleUntil = performance.now() + 2500; }
        else if (performance.now() > idleUntil) spin += (speed != null ? speed : 0.25) * dt;
        pivot.rotation.y = spin;
      }
    };
  }
  // Wide text label (1024 px canvas) for long strings; sprite.userData.setText(str) updates it.
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
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      let fg = o.color || '#1f2937';
      if (dark && !o.bg && /^#[0-9a-f]{6}$/i.test(fg) && (0.299 * parseInt(fg.slice(1, 3), 16) + 0.587 * parseInt(fg.slice(3, 5), 16) + 0.114 * parseInt(fg.slice(5, 7), 16)) < 125) fg = '#e8ecf6';
      if (o.bg) { const w = Math.min(1000, ctx.measureText(t).width + 40); ctx.fillStyle = o.bg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(512 - w / 2, 22, w, 84, 24) : ctx.rect(512 - w / 2, 22, w, 84); ctx.fill(); }
      else { ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = o.outline || (fg === '#e8ecf6' ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.92)'); ctx.strokeText(t, 512, 66); }
      ctx.fillStyle = fg; ctx.fillText(t, 512, 66);
      tex.needsUpdate = true;
    }
    draw(String(text));
    sprite.userData.setText = t => draw(String(t));
    if (pos) sprite.position.set(pos[0], pos[1], pos[2]);
    view.scene.add(sprite);
    return sprite;
  }
  // A small 3D water molecule (bent, 104.5 degrees) with an H2O tag; radius ~0.45 for collisions.
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
  // Panel colour scheme: dark ink for text on the light stage, light ink on the dark stage is handled inside label().
  const INK = '#0f172a';

  // ================================================================ 1. Heartburn and antacids
  // Model shared by the flat and 3D scenes: 6 H+ (with 6 Cl-) in the stomach, at most two antacid tablets.
  // A tablet of magnesium hydroxide gives Mg2+ and two OH-; each OH- takes one H+ and makes one water molecule.
  const HB_PH = { 6: 1.5, 4: 2.5, 2: 3.5 };
  const HB_HEART = { 6: 'Heartburn: strong', 4: 'Heartburn: easing', 2: 'Heartburn: much less' };

  function heartburnFlat(el, api) {
    el.innerHTML = svgWrap(
      `<path d="M34,0 L34,48 C10,72 8,150 56,166 C116,180 214,174 228,134 C240,92 204,68 158,78 C118,86 84,82 70,48 L70,0" fill="#fda4af" fill-opacity="0.35" stroke="var(--t-muted)" stroke-width="2.5"/>` +
      `<text x="76" y="22" font-size="12" fill="var(--t-muted)">food pipe</text>` +
      `<text x="130" y="188" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t-muted)">stomach</text>` +
      `<g id="mca-hb-ions"></g>` +
      `<g id="mca-hb-splash"></g>` +
      `<g id="mca-hb-tab" opacity="0"><ellipse rx="10" ry="6" fill="#f8fafc" stroke="var(--t-muted)" stroke-width="1.5"/><text id="mca-hb-tabl" x="-14" y="4" text-anchor="end" font-size="12" font-weight="700" fill="var(--t-ink)">antacid</text></g>` +
      `<text x="322" y="22" text-anchor="middle" font-size="13" fill="var(--t-muted)">Stomach pH</text>` +
      `<text id="mca-hb-ph" x="322" y="56" text-anchor="middle" font-size="28" font-weight="800" fill="var(--t-ink)">pH 1.5</text>` +
      `<text id="mca-hb-kind" x="322" y="78" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-red)">Very acidic</text>` +
      `<text id="mca-hb-heart" x="322" y="104" text-anchor="middle" font-size="13" font-weight="800" fill="var(--t-ink)">Heartburn: strong</text>` +
      `<text x="322" y="134" text-anchor="middle" font-size="13" fill="var(--t-ink)">Mg(OH)₂ + 2 HCl</text>` +
      `<text x="322" y="152" text-anchor="middle" font-size="13" fill="var(--t-ink)">→ MgCl₂ + 2 H₂O</text>` +
      `<text id="mca-hb-note" x="322" y="176" text-anchor="middle" font-size="12" fill="var(--t-muted)">Tablet 0 of 2</text>`
    ) + btnRow('<button type="button" class="scene-btn" id="mca-hb-chew">Chew antacid</button><button type="button" class="scene-btn" id="mca-hb-reset">Reset</button>');
    const $ = id => el.querySelector('#mca-hb-' + id);
    const layer = $('ions'), splash = $('splash'), tab = $('tab');
    const gas = flatGas({ x0: 44, y0: 92, x1: 214, y1: 160 });
    const sp = [0, 1].map(() => ionNode('H', splash));
    let doses = 0, hLeft = 6, tabS = null, merges = [], spawnQ = [], splashOp = [1, 1];
    function readout() {
      const key = hLeft + (hLeft % 2), ph = HB_PH[key];   // pH steps down once both OH- of a tablet have reacted
      $('ph').textContent = 'pH ' + ph.toFixed(1);
      $('kind').textContent = ph < 2 ? 'Very acidic' : 'Still acidic';
      $('heart').textContent = HB_HEART[key];
      $('note').textContent = doses >= 2 ? 'Two tablets: the limit' : 'Tablet ' + doses + ' of 2';
      $('chew').disabled = doses >= 2 || !!tabS;
    }
    function reset() {
      gas.clear(); merges = []; tabS = null; doses = 0; hLeft = 6; tab.setAttribute('opacity', 0);
      for (let i = 0; i < 6; i++) gas.add(ionNode('H', layer), 24, null, null, 'H');
      for (let i = 0; i < 6; i++) gas.add(ionNode('Cl', layer), 20, null, null, 'Cl');
      readout();
    }
    $('chew').addEventListener('click', () => { if (doses >= 2 || tabS) return; doses++; tabS = { x: 52, y: -10, stage: 'fall', t: 0 }; readout(); });
    $('reset').addEventListener('click', reset);
    reset();
    api.loop((t, dt) => {
      dt = Math.min(dt, 0.05);
      if (tabS) {
        const s = tabS;
        if (s.stage === 'fall') {
          s.y += 95 * dt;
          if (s.y >= 98) {
            s.stage = 'melt'; s.t = 0;
            const mg = gas.add(ionNode('Mg', layer), 18, 60, 108, 'Mg');
            [[74, 100], [58, 130]].forEach(pp => {
              const oh = gas.add(ionNode('OH', layer), 22, pp[0], pp[1], 'OH');
              const hs = gas.parts.filter(q => q.kind === 'H' && !q.claimed).sort((a, b) => Math.hypot(a.x - oh.x, a.y - oh.y) - Math.hypot(b.x - oh.x, b.y - oh.y));
              if (hs.length) { const h = hs[0]; h.claimed = true; h.hold = true; oh.hold = true; merges.push({ oh, h, t: 0, x0: oh.x, y0: oh.y }); }
            });
          }
        } else { s.t += dt; if (s.t > 1.1) { tabS = null; readout(); } }
        if (tabS) {
          const k = s.stage === 'melt' ? 1 - s.t / 1.1 : 1;
          tab.setAttribute('transform', `translate(${s.x},${s.y.toFixed(1)}) scale(${Math.max(0.05, k).toFixed(2)})`);
          tab.setAttribute('opacity', 1);
          $('tabl').setAttribute('opacity', s.stage === 'fall' && s.y < 70 ? 1 : 0);
        } else tab.setAttribute('opacity', 0);
      }
      for (let i = merges.length - 1; i >= 0; i--) {
        const m = merges[i]; m.t += dt;
        const k = Math.min(1, m.t / 0.7), e = k * k * (3 - 2 * k);
        m.oh.x = m.x0 + (m.h.x - m.x0) * e; m.oh.y = m.y0 + (m.h.y - m.y0) * e;
        if (k >= 1) {
          const x = m.h.x, y = m.h.y;
          gas.remove(m.oh); gas.remove(m.h);
          gas.add(waterNode(layer), 14, x, y, 'W');
          hLeft--; merges.splice(i, 1); readout();
        }
      }
      gas.step(dt);
      // acid splashing up the food pipe: fewer H+ in the stomach means less splash
      const want = [hLeft >= 6 ? 1 : 0, hLeft >= 4 ? 1 : 0];
      sp.forEach((g, i) => {
        splashOp[i] += (want[i] - splashOp[i]) * Math.min(1, dt * 3);
        g.setAttribute('opacity', splashOp[i].toFixed(2));
        g.setAttribute('transform', `translate(52,${(i ? 38 : 16) + 7 * Math.sin(t * 2.2 + i * 2)})`);
      });
    });
  }

  const heartburn3d = Chem3D.define({ fov: 30, distance: 11.6, pitch: 0.22, yaw: 0.05, target: [0.5, 2.0, 0] }, (view, ctx) => {
    const BX = -1.9, PX = 2.5, TX = BX - 0.8;
    const TT = makeTurntable(view, BX);
    table(view, 4.6, 3.2, 0, BX);
    const mkIon = k => { const m = makeIon(view, k); m.scale.multiplyScalar(0.75); m.userData.r *= 0.75; return TT.add(m); };
    // stomach (soft pink ellipsoid) and food pipe
    const stomach = view.sphere(1, '#fda4af', { opacity: 0.3, shininess: 80 });
    stomach.scale.set(1.85, 1.45, 1.5); stomach.position.set(BX, 1.7, 0); TT.add(stomach);
    const pipe = new T.Mesh(new T.CylinderGeometry(0.44, 0.44, 1.7, 28, 1, true), view.mat('#fda4af', { opacity: 0.35, doubleSide: true, shininess: 80 }));
    pipe.position.set(TX, 3.95, 0); TT.add(pipe);
    view.label('food pipe', [BX + 0.35, 4.55, 0], { size: 0.8, color: '#475569', fontSize: 56 });
    view.label('stomach', [BX, -0.55, 0.4], { size: 0.9, color: '#475569', fontSize: 56 });
    const SURF = 2.5;
    const gas = makeGas({ cx: BX, cz: 0, R: 1.2, y0: 0.9, y1: SURF });
    // acid splashing up the food pipe
    const sp = [0, 1].map(() => { const m = mkIon('H'); return m; });
    // panel (right)
    const phL = view.label('pH 1.5', [PX, 3.75, 0], { size: 1.5, color: INK, fontSize: 84 });
    const kindL = { a: view.label('Very acidic', [PX, 2.85, 0], { size: 1.0, color: '#dc2626', fontSize: 60 }), b: view.label('Still acidic', [PX, 2.85, 0], { size: 1.0, color: '#ea580c', fontSize: 60 }) };
    const heartL = wideLabel(view, HB_HEART[6], [PX, 2.0, 0], { size: 0.85, color: INK, fontSize: 56 });
    wideLabel(view, 'Mg(OH)₂ + 2 HCl', [PX, 1.35, 0], { size: 0.8, color: '#4f46e5', fontSize: 52 });
    wideLabel(view, '→ MgCl₂ + 2 H₂O', [PX, 0.75, 0], { size: 0.8, color: '#4f46e5', fontSize: 52 });
    const noteL = wideLabel(view, 'Tablet 0 of 2', [PX, 0.05, 0], { size: 0.75, color: '#475569', fontSize: 54 });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center"><button class="scene-btn mca-hb3-chew" type="button">Chew antacid</button><button class="scene-btn mca-hb3-reset" type="button">Reset</button></div>');
    const chewB = row.querySelector('.mca-hb3-chew'), resetB = row.querySelector('.mca-hb3-reset');
    // the tablet
    const tablet = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.16, 28), view.mat('#f8fafc', { shininess: 80 }));
    tablet.visible = false; view.scene.add(tablet);
    let doses, hLeft, tabS, splashOp = [1, 1];
    const merges = [], waters = [];
    function kill(p) { if (p.m.parent) p.m.parent.remove(p.m); const i = gas.parts.indexOf(p); if (i >= 0) gas.parts.splice(i, 1); }
    function readout() {
      const key = hLeft + (hLeft % 2), ph = HB_PH[key];
      phL.userData.setText('pH ' + ph.toFixed(1));
      kindL.a.visible = ph < 2; kindL.b.visible = ph >= 2;
      heartL.userData.setText(HB_HEART[key]);
      noteL.userData.setText(doses >= 2 ? 'Two tablets: the limit' : 'Tablet ' + doses + ' of 2');
      chewB.disabled = doses >= 2 || !!tabS;
    }
    function reset() {
      [...gas.parts].forEach(kill);
      waters.length = 0; merges.length = 0; tabS = null; doses = 0; hLeft = 6; tablet.visible = false;
      for (let i = 0; i < 6; i++) { const h = gas.add(mkIon('H'), 0.7); h.kind = 'H'; }
      for (let i = 0; i < 6; i++) gas.add(mkIon('Cl'), 0.6);
      readout();
    }
    chewB.addEventListener('click', () => { if (doses >= 2 || tabS) return; doses++; tabS = { y: 5.7, stage: 'fall', t: 0 }; readout(); });
    resetB.addEventListener('click', reset);
    reset();
    view.run((t, dt) => {
      TT.update(dt);
      dt = Math.min(dt, 0.05);
      if (tabS) {
        const s = tabS;
        if (s.stage === 'fall') {
          s.y -= 3.6 * dt;
          if (s.y <= 2.3) {
            s.stage = 'melt'; s.t = 0;
            const mg = gas.add(mkIon('Mg'), 0.5); mg.m.position.set(TX + 0.4, 2.2, 0.2);
            [[TX + 0.5, 2.0, -0.5], [TX - 0.2, 1.7, 0.5]].forEach(pp => {
              const oh = gas.add(mkIon('OH'), 0.6); oh.m.position.set(pp[0], pp[1], pp[2]);
              const hs = gas.parts.filter(q => q.m.userData.kind === 'H' && !q.claimed).sort((a, b) => a.m.position.distanceTo(oh.m.position) - b.m.position.distanceTo(oh.m.position));
              if (hs.length) { const h = hs[0]; h.claimed = true; h.hold = true; oh.hold = true; merges.push({ oh, h, t: 0, from: oh.m.position.clone() }); }
            });
          }
        } else { s.t += dt; if (s.t > 1.1) { tabS = null; readout(); } }
        if (tabS) {
          tablet.visible = true;
          tablet.position.set(TX, s.y, 0); tablet.rotation.set(t * 3, 0, t * 2);
          tablet.scale.setScalar(s.stage === 'melt' ? Math.max(0.05, 1 - s.t / 1.1) : 1);
        } else tablet.visible = false;
      }
      for (let i = merges.length - 1; i >= 0; i--) {
        const mg = merges[i]; mg.t += dt;
        const k = Math.min(1, mg.t / 0.7), e = k * k * (3 - 2 * k);
        mg.oh.m.position.lerpVectors(mg.from, mg.h.m.position, e);
        if (k >= 1) {
          const pos = mg.h.m.position.clone();
          kill(mg.oh); kill(mg.h);
          const w = TT.add(makeWater(view)); gas.add(w, 0.5); w.position.copy(pos); waters.push(w);
          hLeft--; merges.splice(i, 1); readout();
        }
      }
      waters.forEach(w => { w.rotation.y += dt * 0.8; w.rotation.z = 0.25 * Math.sin(t * 2 + w.id); });
      gas.step(dt);
      stomach.scale.set(1.85 + 0.03 * Math.sin(t * 1.6), 1.45 + 0.03 * Math.sin(t * 1.6 + 1), 1.5);
      const want = [hLeft >= 6 ? 1 : 0, hLeft >= 4 ? 1 : 0];
      sp.forEach((m, i) => {
        splashOp[i] += (want[i] - splashOp[i]) * Math.min(1, dt * 3);
        m.visible = splashOp[i] > 0.05;
        m.scale.setScalar(ION.H[2] * 0.75 * splashOp[i]);
        m.position.set(TX, (i ? 3.75 : 4.3) + 0.15 * Math.sin(t * 2.2 + i * 2), 0);
      });
    });
  });

  steps.push({
    kind: 'example',
    title: 'Real life: Heartburn and antacids',
    text: '<p>Your stomach makes strong <b>hydrochloric acid</b> (about pH 1.5) to digest food. When some splashes up the food pipe you feel <b>heartburn</b>. An <b>antacid</b> tablet is a mild base that <b>neutralizes</b> some of that acid.</p>',
    explain: '<p>A pink <b>stomach</b> with a <b>food pipe</b> on top holds six red <b>H<sup>+</sup></b> balls (hydrogen ions) and six gray <b>Cl<sup>−</sup></b> balls. Press <b>Chew antacid</b> and a white tablet drops in and releases a green <b>Mg<sup>2+</sup></b> ion and two blue <b>OH<sup>−</sup></b> ions. Each OH<sup>−</sup> joins an H<sup>+</sup> to make an <b>H<sub>2</sub>O</b> molecule, so the pH rises a little.</p><p>Drag the picture to turn it.</p>',
    say: 'Look at the stomach. It makes hydrochloric acid to break down food, and the acid is strong, about P H one point five. This picture is three dimensional, so you can drag it to turn it around. The red balls are hydrogen ions, and the gray balls are chloride ions. When some acid splashes up the food pipe, you feel heartburn. Now press chew antacid. A tablet of magnesium hydroxide dissolves and releases hydroxide ions. Each one joins a hydrogen ion and makes a water molecule. The P H rises, and the heartburn eases. Notice that the stomach stays acidic, because it needs acid to digest food. Two tablets is the limit here.',
    mount: heartburnFlat,
    scene3d: heartburn3d
  });

  // ================================================================ 2. Acid rain and a marble statue
  // Marble is calcium carbonate: CaCO3 + 2 H+ -> Ca2+ + H2O + CO2. More H+ in the rain means faster wear.
  // Time-lapse is qualitative: 100 "years" pass every ~25 s and the wear speed follows the rain pH.
  const rainSev = ph => clamp((6.8 - ph) / 3.0, 0.04, 1);
  const rainKind = ph => ph < 5.55 ? ['Acid rain', 'a'] : ph <= 6.3 ? ['Natural rain, slightly acidic', 'n'] : ['Nearly neutral rain', 'z'];
  const rainH = ph => Math.round(clamp((6.0 - ph) * 2.2, 0, 5));

  function rainFlat(el, api) {
    let drops = '';
    for (let i = 0; i < 14; i++) drops += `<path id="mca-ar-d${i}" d="M0,-5 Q4,1 0,4 Q-4,1 0,-5Z" fill="var(--t-blue)"/>`;
    let pitsSvg = '';
    [[92, 82, 3.2], [108, 90, 2.6], [96, 118, 3], [110, 126, 2.6], [88, 134, 2.4], [104, 100, 2.2], [114, 112, 2.6]].forEach((p, i) => { pitsSvg += `<circle id="mca-ar-p${i}" cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="#64748b" opacity="0"/>`; });
    el.innerHTML = svgWrap(
      `<line x1="10" y1="168" x2="200" y2="168" stroke="var(--t-muted)" stroke-width="3"/>` +
      `<g fill="#94a3b8"><ellipse cx="52" cy="22" rx="34" ry="14"/><ellipse cx="94" cy="16" rx="40" ry="16"/><ellipse cx="136" cy="22" rx="34" ry="14"/><ellipse cx="96" cy="27" rx="66" ry="11"/></g>` +
      `<rect x="68" y="146" width="64" height="22" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>` +
      `<path d="M78,146 L82,112 Q100,104 118,112 L122,146Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>` +
      `<circle id="mca-ar-head" cx="100" cy="92" r="17" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>` +
      `<path id="mca-ar-nose" d="M100,88 L106,100 L98,100Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>` +
      pitsSvg +
      `<g id="mca-ar-rain">${drops}</g><g id="mca-ar-ions"></g>` +
      `<text id="mca-ar-year" x="100" y="187" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t-muted)">Year 0 of 100</text>` +
      // close-up
      `<rect x="236" y="6" width="156" height="104" rx="10" fill="var(--t-soft)" fill-opacity="0.55" stroke="var(--t-muted)" stroke-width="1.5" stroke-dasharray="4 3"/>` +
      `<text x="314" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t-muted)">close up of the stone</text>` +
      `<rect x="240" y="84" width="148" height="22" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>` +
      `<text x="314" y="100" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">marble (CaCO₃)</text>` +
      `<g id="mca-ar-zoom"></g>` +
      `<text id="mca-ar-ph" x="314" y="130" text-anchor="middle" font-size="15" font-weight="800" fill="var(--t-ink)">Rain pH 4.5</text>` +
      `<text id="mca-ar-kind" x="314" y="148" text-anchor="middle" font-size="13" font-weight="800" fill="var(--t-red)">Acid rain</text>` +
      `<text x="314" y="168" text-anchor="middle" font-size="12" fill="var(--t-ink)">CaCO₃ + 2 H⁺ →</text>` +
      `<text x="314" y="184" text-anchor="middle" font-size="12" fill="var(--t-ink)">Ca²⁺ + H₂O + CO₂</text>`
    ) + `<div class="scene-slider-row"><span>Rain pH</span><input type="range" id="mca-ar-s" min="3.5" max="7" step="0.1" value="4.5" aria-label="Rain pH"><span id="mca-ar-sv" style="min-width:3ch">4.5</span></div>`;
    const $ = id => el.querySelector('#mca-ar-' + id);
    const sl = $('s'), ionsL = $('ions'), zoom = $('zoom');
    const dr = [];
    for (let i = 0; i < 14; i++) dr.push({ el: $('d' + i), x: 30 + (i * 37) % 130 + (i % 3) * 3, off: (i * 0.173) % 1 });
    const hIons = [0, 1, 2, 3, 4].map(i => ({ el: ionNode('H', ionsL), x: 42 + i * 28, off: i * 0.21 + 0.05 }));
    const sites = [262, 302, 342].map((x, k) => ({ x, k, h: ionNode('H', zoom), ca: ionNode('Ca', zoom), b: mkEl('g', null, zoom) }));
    sites.forEach(s => {
      mkEl('circle', { r: 13, fill: '#e2e8f0', stroke: '#64748b', 'stroke-width': 1.5 }, s.b);
      const tx = mkEl('text', { y: 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#334155' }, s.b); tx.textContent = 'CO₂';
    });
    const pits = [0, 1, 2, 3, 4, 5, 6].map(i => $('p' + i));
    let wear = 0, year = 0, hold = 0;
    function upd() {
      const ph = +sl.value;
      $('sv').textContent = ph.toFixed(1);
      $('ph').textContent = 'Rain pH ' + ph.toFixed(1);
      const k = rainKind(ph), kt = $('kind');
      kt.textContent = k[0]; kt.setAttribute('font-size', k[1] === 'n' ? 12 : 13);
      kt.setAttribute('fill', k[1] === 'a' ? 'var(--t-red)' : k[1] === 'n' ? 'var(--t-orange)' : 'var(--t-teal)');
    }
    sl.addEventListener('input', upd); upd();
    api.loop((t, dt) => {
      dt = Math.min(dt, 0.05);
      const ph = +sl.value, sev = rainSev(ph), nH = rainH(ph);
      if (hold > 0) { hold -= dt; if (hold <= 0) { wear = 0; year = 0; } }
      else { year += 4 * dt; wear += sev * dt * 0.04; if (year >= 100) { year = 100; hold = 2; } }
      dr.forEach(d => { const f = (t * 0.55 + d.off) % 1; d.el.setAttribute('transform', `translate(${d.x},${(36 + f * 128).toFixed(1)})`); });
      hIons.forEach((h, i) => {
        const f = (t * 0.4 + h.off) % 1;
        h.el.setAttribute('opacity', i < nH ? 1 : 0);
        h.el.setAttribute('transform', `translate(${h.x},${(40 + f * 116).toFixed(1)})`);
      });
      const w = clamp(wear, 0, 1);
      $('head').setAttribute('r', (17 * (1 - 0.28 * w)).toFixed(2));
      $('nose').setAttribute('transform', `translate(100,100) scale(${(1 - 0.95 * w).toFixed(2)}) translate(-100,-100)`);
      pits.forEach((p, i) => p.setAttribute('opacity', clamp(w * 1.6 - i * 0.12, 0, 0.85).toFixed(2)));
      $('year').textContent = 'Year ' + Math.round(year) + ' of 100';
      // close-up reactions: more sites when the rain is more acidic
      const nSites = sev > 0.6 ? 3 : sev > 0.3 ? 2 : 1;
      zoom.setAttribute('opacity', (0.4 + 0.6 * sev).toFixed(2));
      sites.forEach(s => {
        const on = s.k < nSites, f = ((t / 2.4 + s.k / 3) % 1);
        const hOn = on && f < 0.45, rOn = on && f >= 0.45, g = (f - 0.45) / 0.55;
        s.h.setAttribute('opacity', hOn ? 1 : 0);
        s.h.setAttribute('transform', `translate(${s.x},${(34 + Math.min(1, f / 0.45) * 38).toFixed(1)})`);
        s.ca.setAttribute('opacity', rOn ? (1 - g).toFixed(2) : 0);
        s.ca.setAttribute('transform', `translate(${(s.x + 10 + g * 18).toFixed(1)},${(68 + g * 6).toFixed(1)})`);
        s.b.setAttribute('opacity', rOn ? (1 - g * 0.6).toFixed(2) : 0);
        s.b.setAttribute('transform', `translate(${(s.x - 12).toFixed(1)},${(76 - g * 42).toFixed(1)})`);
      });
    });
  }

  const rain3d = Chem3D.define({ fov: 30, distance: 11.8, pitch: 0.2, yaw: 0.05, target: [0.5, 1.95, 0] }, (view, ctx) => {
    const BX = -1.9, PX = 2.5;
    const TT = makeTurntable(view, BX);
    table(view, 4.6, 3.2, 0, BX);
    // marble statue: pedestal, torso, head, nose and dark pits that grow as the stone wears away
    const marble = view.mat('#f1f5f9', { shininess: 90, specular: '#999999' });
    const ped = new T.Mesh(new T.BoxGeometry(1.8, 0.9, 1.8), marble); ped.position.set(BX, 0.45, 0); TT.add(ped);
    const torso = new T.Mesh(new T.CylinderGeometry(0.55, 0.78, 1.3, 32), marble); torso.position.set(BX, 1.55, 0); TT.add(torso);
    const head = new T.Mesh(new T.SphereGeometry(1, 32, 24), marble); head.position.set(BX, 2.6, 0); head.scale.setScalar(0.5); TT.add(head);
    const nose = new T.Mesh(new T.ConeGeometry(0.11, 0.3, 16), marble); nose.rotation.x = Math.PI / 2; nose.position.set(BX, 2.58, 0.52); TT.add(nose);
    const pitMat = view.mat('#64748b', { shininess: 10 });
    const pitPos = [[0.3, 2.85, 0.35], [-0.35, 2.7, 0.3], [0.1, 2.35, 0.47], [0.45, 1.9, 0.42], [-0.4, 1.6, 0.6], [0.2, 1.25, 0.72], [-0.15, 1.9, 0.5], [0.5, 1.4, 0.65]];
    const pitMeshes = pitPos.map(pp => { const m = new T.Mesh(new T.SphereGeometry(1, 12, 10), pitMat); m.position.set(BX + pp[0], pp[1], pp[2]); m.scale.setScalar(0.001); TT.add(m); return m; });
    view.label('marble statue', [BX, -0.55, 0.4], { size: 0.9, color: '#475569', fontSize: 56 });
    // cloud and falling rain (world space: the statue turns beneath it)
    const cloudMat = view.mat('#94a3b8', { shininess: 10 });
    [[-0.9, 0, 0, 0.6], [0, 0.15, 0.2, 0.75], [0.9, 0, 0, 0.6], [-0.3, -0.15, -0.5, 0.55], [0.4, -0.1, 0.5, 0.5]].forEach(c => {
      const m = new T.Mesh(new T.SphereGeometry(1, 20, 16), cloudMat); m.scale.set(c[3] * 1.3, c[3] * 0.85, c[3]); m.position.set(BX + c[0] * 1.3, 4.0 + c[1], c[2]); view.scene.add(m);
    });
    const dropM = view.mat('#60a5fa', { shininess: 90 }), dropG = new T.SphereGeometry(1, 10, 8);
    const drops = [];
    for (let i = 0; i < 18; i++) {
      const m = new T.Mesh(dropG, dropM); m.scale.set(0.06, 0.1, 0.06); view.scene.add(m);
      drops.push({ m, x: BX + rand(-1.7, 1.7), z: rand(-0.9, 0.9), off: i / 18 });
    }
    const hIons = [0, 1, 2, 3, 4].map(i => { const m = makeIon(view, 'H'); m.scale.multiplyScalar(0.8); return { m, x: BX - 1.4 + i * 0.7, z: [0.7, -0.6, 0.9, -0.3, 0.3][i], off: i * 0.21 + 0.05 }; });
    // reaction products at the stone: Ca2+ ions run down, CO2 bubbles rise
    const sites = [0, 1, 2].map(k => {
      const ca = makeIon(view, 'Ca'); ca.scale.multiplyScalar(0.7);
      const b = view.sphere(0.2, '#cbd5e1', { shininess: 60 });
      const lb = view.label('CO₂', [0, 0, 0], { size: 0.6, color: '#334155', fontSize: 60 }); b.add(lb); lb.scale.multiplyScalar(1 / b.scale.x);
      return { k, ca, b };
    });
    // panel
    const phL = view.label('Rain pH 4.5', [PX, 3.75, 0], { size: 1.2, color: INK, fontSize: 72 });
    const kindL = { a: wideLabel(view, 'Acid rain', [PX, 2.9, 0], { size: 1.0, color: '#dc2626', fontSize: 64 }), n: wideLabel(view, 'Natural rain, slightly acidic', [PX, 2.9, 0], { size: 0.9, color: '#ea580c', fontSize: 44 }), z: wideLabel(view, 'Nearly neutral rain', [PX, 2.9, 0], { size: 0.95, color: '#0d9488', fontSize: 54 }) };
    const yearL = wideLabel(view, 'Year 0 of 100', [PX, 2.0, 0], { size: 0.85, color: '#475569', fontSize: 58 });
    wideLabel(view, 'CaCO₃ + 2 H⁺ →', [PX, 1.3, 0], { size: 0.8, color: '#4f46e5', fontSize: 52 });
    wideLabel(view, 'Ca²⁺ + H₂O + CO₂', [PX, 0.7, 0], { size: 0.8, color: '#4f46e5', fontSize: 52 });
    wideLabel(view, 'H⁺ dissolves the stone', [PX, 0.0, 0], { size: 0.7, color: '#475569', fontSize: 50 });
    const row = ctx.controls('<div class="scene-slider-row"><span>Rain pH</span><input type="range" min="3.5" max="7" step="0.1" value="4.5" aria-label="Rain pH"><span class="mca-ar3-v" style="min-width:3ch">4.5</span></div>');
    const sl = row.querySelector('input'), sv = row.querySelector('.mca-ar3-v');
    function upd() {
      const ph = +sl.value;
      sv.textContent = ph.toFixed(1);
      phL.userData.setText('Rain pH ' + ph.toFixed(1));
      const k = rainKind(ph)[1];
      Object.keys(kindL).forEach(q => { kindL[q].visible = q === k; });
    }
    sl.addEventListener('input', upd); upd();
    let wear = 0, year = 0, hold = 0, shownYear = -1;
    view.run((t, dt) => {
      TT.update(dt);
      dt = Math.min(dt, 0.05);
      const ph = +sl.value, sev = rainSev(ph), nH = rainH(ph);
      if (t === 0 && dt === 0) return;
      if (hold > 0) { hold -= dt; if (hold <= 0) { wear = 0; year = 0; } }
      else { year += 4 * dt; wear += sev * dt * 0.04; if (year >= 100) { year = 100; hold = 2; } }
      drops.forEach(d => { const f = (t * 0.7 + d.off) % 1; d.m.position.set(d.x, 3.7 - f * 3.65, d.z); });
      hIons.forEach((h, i) => { const f = (t * 0.32 + h.off) % 1; h.m.visible = i < nH; h.m.position.set(h.x, 3.6 - f * 3.4, h.z); });
      const w = clamp(wear, 0, 1);
      head.scale.setScalar(0.5 * (1 - 0.25 * w));
      nose.scale.setScalar(Math.max(0.001, 1 - 0.95 * w));
      pitMeshes.forEach((m, i) => m.scale.setScalar(Math.max(0.001, clamp(w * 1.6 - i * 0.1, 0, 0.85) * 0.14)));
      const ry = Math.round(year);
      if (ry !== shownYear) { shownYear = ry; yearL.userData.setText('Year ' + ry + ' of 100'); }
      const nSites = sev > 0.6 ? 3 : sev > 0.3 ? 2 : 1;
      sites.forEach(s => {
        const on = s.k < nSites, f = (t / 2.6 + s.k / 3) % 1;
        s.ca.visible = s.b.visible = on;
        s.ca.position.set(BX + 0.95 + s.k * 0.2, 1.9 - f * 1.6, 0.9);
        s.b.position.set(BX - 0.6 + s.k * 0.55, 1.5 + f * 1.8, 0.95);
      });
    });
  });

  steps.push({
    kind: 'example',
    title: 'Real life: Acid rain and a marble statue',
    text: '<p>Marble and limestone are <b>calcium carbonate</b>. Rain is always a little acidic (about pH 5.6), but polluted <b>acid rain</b> can be far more acidic. Its H<sup>+</sup> ions slowly dissolve stone statues. Slide the rain pH and watch 100 years pass.</p>',
    explain: '<p>A gray <b>cloud</b> rains onto a white <b>marble statue</b>. Red <b>H<sup>+</sup></b> balls fall among the drops when the rain is acidic. At the stone, teal <b>Ca<sup>2+</sup></b> ions wash away and gray <b>CO<sub>2</sub></b> bubbles rise. Slide the <b>Rain pH</b>: a lower pH means more H<sup>+</sup>, and the statue\'s nose and face wear away faster over the 100 years shown.</p>',
    say: 'A marble statue stands in the rain. Marble is calcium carbonate, and acids attack it. Rain is always slightly acidic, about P H five point six, because it picks up carbon dioxide from the air. But polluted rain can be much more acidic. Watch the red hydrogen ions falling with the drops. When they hit the stone, they react with it. Calcium ions wash away, and carbon dioxide bubbles rise. Now slide the rain P H. A lower P H means more hydrogen ions, so the statue wears away faster. Over a hundred years, its nose and face can almost disappear. This is why old stone statues and buildings need protecting.',
    mount: rainFlat,
    scene3d: rain3d
  });

  // ================================================================ 3. Testing swimming-pool water
  // Test kits use an indicator (phenol red): yellow when acidic, through orange, to red when basic. Good pool water: pH 7.2 to 7.8.
  const POOL_STOPS = [[6.4, [250, 225, 60]], [6.8, [251, 191, 36]], [7.2, [251, 146, 60]], [7.6, [244, 100, 50]], [8.0, [225, 45, 50]], [8.4, [190, 24, 93]]];
  const poolRGB = ph => stopsRGB(POOL_STOPS, ph);
  const poolColorName = ph => ph < 6.8 ? 'yellow' : ph < 7.2 ? 'yellow-orange' : ph < 7.6 ? 'orange' : ph < 8.0 ? 'orange-red' : 'red';
  // status: [headline, note line, kind]
  function poolStatus(ph) {
    if (ph < 7.15) return ['Too acidic', 'Stings eyes, eats pool metal', 'a'];
    if (ph <= 7.85) return ['Just right!', 'Comfortable and chlorine works', 'g'];
    return ['Too basic', 'Cloudy water, chlorine works less', 'b'];
  }
  const poolIons = ph => [ph < 7.15 ? Math.round(clamp((7.4 - ph) * 4, 1, 5)) : 1, ph > 7.85 ? Math.round(clamp((ph - 7.6) * 4, 1, 5)) : ph >= 7.15 ? 1 : 0];

  function poolFlat(el, api) {
    const BX0 = 246, BW = 144, phX = ph => BX0 + (ph - 6.4) / 2 * BW;
    let stops = '';
    for (let i = 0; i <= 10; i++) stops += `<stop offset="${i * 10}%" stop-color="${rgbStr(poolRGB(6.4 + i * 0.2))}"/>`;
    el.innerHTML = svgWrap(
      `<defs><linearGradient id="mca-pl-g" x1="0" x2="1">${stops}</linearGradient><clipPath id="mca-pl-clip"><rect x="12" y="58" width="208" height="84"/></clipPath></defs>` +
      `<g clip-path="url(#mca-pl-clip)"><path id="mca-pl-w" d="" fill="var(--t-blue)" fill-opacity="0.38"/></g>` +
      `<path d="M8,58 L12,58 L12,142 L220,142 L220,58 L224,58" fill="none" stroke="var(--t-ink)" stroke-width="3.5" stroke-linejoin="round"/>` +
      `<g id="mca-pl-ring"><circle r="11" fill="none" stroke="var(--t-orange)" stroke-width="5"/><circle r="11" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="7 10"/></g>` +
      `<g id="mca-pl-ions"></g>` +
      `<text id="mca-pl-st" x="116" y="164" text-anchor="middle" font-size="15" font-weight="800" fill="var(--t-green)">Too acidic</text>` +
      `<text id="mca-pl-nt" x="116" y="182" text-anchor="middle" font-size="12" fill="var(--t-muted)">Stings eyes, eats pool metal</text>` +
      // test tube with dropper
      `<rect x="259" y="0" width="12" height="16" rx="5" fill="#94a3b8"/><path d="M262,16 L268,16 L266.5,28 L263.5,28Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/>` +
      `<circle id="mca-pl-drop" cx="265" cy="30" r="3.5" fill="#dc2626" opacity="0"/>` +
      `<clipPath id="mca-pl-vc"><path d="M250,36 L250,90 Q250,98 258,98 L272,98 Q280,98 280,90 L280,36Z"/></clipPath>` +
      `<g clip-path="url(#mca-pl-vc)"><rect id="mca-pl-liq" x="250" y="52" width="30" height="50" fill="rgb(251,191,36)"/></g>` +
      `<path d="M250,36 L250,90 Q250,98 258,98 L272,98 Q280,98 280,90 L280,36" fill="none" stroke="var(--t-ink)" stroke-width="2.5"/>` +
      `<text x="292" y="58" font-size="20" font-weight="800" fill="var(--t-ink)" id="mca-pl-ph">pH 6.8</text>` +
      `<text x="292" y="78" font-size="12" font-weight="700" fill="var(--t-muted)" id="mca-pl-cn">yellow</text>` +
      `<rect x="${BX0}" y="108" width="${BW}" height="14" rx="4" fill="url(#mca-pl-g)"/>` +
      `<rect x="${phX(7.2)}" y="105" width="${phX(7.8) - phX(7.2)}" height="20" rx="3" fill="none" stroke="var(--t-ink)" stroke-width="2.5"/>` +
      `<path id="mca-pl-mk" d="M0,124 L-6,134 L6,134Z" fill="var(--t-ink)"/>` +
      `<text x="${BX0}" y="152" font-size="12" font-weight="700" fill="var(--t-muted)">6.4</text><text x="${BX0 + BW}" y="152" text-anchor="end" font-size="12" font-weight="700" fill="var(--t-muted)">8.4</text>` +
      `<text x="${(phX(7.2) + phX(7.8)) / 2}" y="152" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t-ink)">ideal</text>` +
      `<text x="318" y="178" text-anchor="middle" font-size="12" fill="var(--t-muted)">test colour vs pH</text>`
    ) + btnRow('<button type="button" class="scene-btn" id="mca-pl-acid">Add acid (pH down)</button><button type="button" class="scene-btn" id="mca-pl-base">Add base (pH up)</button>');
    const $ = id => el.querySelector('#mca-pl-' + id);
    const gas = flatGas({ x0: 20, y0: 84, x1: 212, y1: 134 });
    const hs = [], os = [];
    for (let i = 0; i < 5; i++) { hs.push(gas.add(ionNode('H', $('ions')), 18, null, null, 'H')); os.push(gas.add(ionNode('OH', $('ions')), 18, null, null, 'OH')); }
    let ph = 6.8, cur = poolRGB(6.8), shown = 6.8;
    function upd() {
      $('ph').textContent = 'pH ' + ph.toFixed(1);
      $('cn').textContent = poolColorName(ph);
      const st = poolStatus(ph), e = $('st');
      e.textContent = st[0]; $('nt').textContent = st[1];
      e.setAttribute('fill', st[2] === 'g' ? 'var(--t-green)' : st[2] === 'a' ? 'var(--t-red)' : 'var(--t-blue)');
      const n = poolIons(ph);
      hs.forEach((p, i) => { p.hold = i >= n[0]; p.el.setAttribute('opacity', i < n[0] ? 1 : 0); });
      os.forEach((p, i) => { p.hold = i >= n[1]; p.el.setAttribute('opacity', i < n[1] ? 1 : 0); });
    }
    $('acid').addEventListener('click', () => { ph = Math.round(clamp(ph - 0.2, 6.4, 8.4) * 10) / 10; upd(); });
    $('base').addEventListener('click', () => { ph = Math.round(clamp(ph + 0.2, 6.4, 8.4) * 10) / 10; upd(); });
    upd();
    api.loop((t, dt) => {
      dt = Math.min(dt, 0.05);
      gas.step(dt);
      let d = 'M12,142 L12,' + (66 + 2 * Math.sin(t * 1.6));
      for (let x = 12; x <= 220; x += 8) d += ' L' + x + ',' + (66 + 3 * Math.sin(x / 22 + t * 2.2)).toFixed(1);
      $('w').setAttribute('d', d + ' L220,142 Z');
      $('ring').setAttribute('transform', `translate(168,${(66 + 3 * Math.sin(168 / 22 + t * 2.2) - 4).toFixed(1)}) rotate(${Math.sin(t) * 6})`);
      cur = lerpArr(cur, poolRGB(ph), Math.min(1, dt * 4));
      const f = (t % 3) / 3;
      $('drop').setAttribute('opacity', f < 0.35 ? 1 : 0);
      $('drop').setAttribute('cy', 30 + Math.min(1, f / 0.3) * 30);
      $('liq').setAttribute('fill', rgbStr(cur));
      $('liq').setAttribute('y', 52 + 1.5 * Math.sin(t * 3));
      shown += (ph - shown) * Math.min(1, dt * 8);
      $('mk').setAttribute('transform', `translate(${phX(shown).toFixed(1)},0)`);
    });
  }

  const pool3d = Chem3D.define({ fov: 30, distance: 10.8, pitch: 0.3, yaw: 0.05, target: [0.6, 1.4, 0] }, (view, ctx) => {
    const BX = -2.0, VX = 0.95, PX = 2.95;
    const TT = makeTurntable(view, BX);
    table(view, 4.4, 4.0, 0, BX);
    table(view, 1.5, 1.5, 0, VX);
    // round pool: glass-like wall with water, a swim ring floating on top
    const pool = view.beaker(1.7, 1.5, { pos: [BX, 0, 0], level: 0.8, liquidColor: '#38bdf8', liquidOpacity: 0.5 });
    TT.add(pool.group);
    const SURF = 1.5 * 0.96 * 0.8;
    const ring = new T.Mesh(new T.TorusGeometry(0.42, 0.14, 12, 32), view.mat('#fb923c', { shininess: 60 }));
    ring.rotation.x = Math.PI / 2; TT.add(ring);
    view.label('pool water', [BX, -0.55, 0.9], { size: 0.9, color: '#475569', fontSize: 56 });
    const gas = makeGas({ cx: BX, cz: 0, R: 1.4, y0: 0.15, y1: SURF - 0.05 });
    const hs = [], os = [];
    for (let i = 0; i < 5; i++) {
      const h = makeIon(view, 'H'); h.scale.multiplyScalar(0.9); h.userData.r *= 0.9; hs.push(gas.add(TT.add(h), 0.7));
      const o = makeIon(view, 'OH'); o.scale.multiplyScalar(0.9); o.userData.r *= 0.9; os.push(gas.add(TT.add(o), 0.7));
    }
    // the test tube and dropper (world space, static)
    const tube = view.beaker(0.42, 1.6, { pos: [VX, 0, 0], level: 0.7, liquidColor: '#fbbf24', liquidOpacity: 0.9 });
    view.label('test tube', [VX, -0.55, 0.9], { size: 0.8, color: '#475569', fontSize: 56 });
    const bulb = new T.Mesh(new T.SphereGeometry(0.3, 20, 16), view.mat('#475569', { shininess: 40 })); bulb.position.set(VX, 3.15, 0); view.scene.add(bulb);
    const stem = new T.Mesh(new T.CylinderGeometry(0.12, 0.06, 0.9, 16), view.mat('#cbd5e1', { shininess: 80, opacity: 0.9 })); stem.position.set(VX, 2.55, 0); view.scene.add(stem);
    const dropM = view.sphere(0.09, '#dc2626', { shininess: 90 }); dropM.position.set(VX, 2.0, 0); dropM.visible = false;
    // panel
    const phL = view.label('pH 6.8', [PX, 3.5, 0], { size: 1.3, color: INK, fontSize: 76 });
    const nameL = wideLabel(view, 'yellow', [PX, 2.75, 0], { size: 0.7, color: '#475569', fontSize: 56 });
    const X0 = PX - 1.1, X1 = PX + 1.1, xs = ph => X0 + (ph - 6.4) / 2 * (X1 - X0);
    gradBar(view, X0, X1, 1.85, 0, 0.36, 0.5, f => rgbStr(poolRGB(6.4 + f * 2)));
    [7.2, 7.8].forEach(v => { const b = view.box(0.07, 0.62, 0.6, '#6d28d9', { shininess: 10 }); b.position.set(xs(v), 1.85, 0); });
    const mk = pointerCone(view, '#6d28d9'); mk.scale.setScalar(0.65);
    view.label('6.4', [X0, 1.2, 0], { size: 0.65, color: '#64748b', fontSize: 64 });
    view.label('8.4', [X1, 1.2, 0], { size: 0.65, color: '#64748b', fontSize: 64 });
    view.label('ideal', [xs(7.5), 1.2, 0], { size: 0.65, color: INK, fontSize: 64 });
    const stL = { a: wideLabel(view, 'Too acidic', [PX, 0.5, 0], { size: 0.95, color: '#dc2626', fontSize: 62 }), g: wideLabel(view, 'Just right!', [PX, 0.5, 0], { size: 0.95, color: '#16a34a', fontSize: 62 }), b: wideLabel(view, 'Too basic', [PX, 0.5, 0], { size: 0.95, color: '#2563eb', fontSize: 62 }) };
    const noteS = { a: 'Stings eyes, eats metal', g: 'Comfortable, safe', b: 'Cloudy, chlorine weak' };
    const ntL = wideLabel(view, noteS.a, [PX, -0.15, 0], { size: 0.85, color: '#475569', fontSize: 48 });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;gap:4px 6px"><button class="scene-btn mca-pl3-a" type="button">Add acid (pH down)</button><button class="scene-btn mca-pl3-b" type="button">Add base (pH up)</button></div>');
    let ph = 6.8, cur = poolRGB(6.8), shown = 6.8, shownTxt = '';
    function upd() {
      phL.userData.setText('pH ' + ph.toFixed(1));
      nameL.userData.setText('test colour: ' + poolColorName(ph));
      const st = poolStatus(ph)[2];
      Object.keys(stL).forEach(k => { stL[k].visible = k === st; });
      ntL.userData.setText(noteS[st]);
      const n = poolIons(ph);
      hs.forEach((p, i) => { p.on = p.m.visible = i < n[0]; });
      os.forEach((p, i) => { p.on = p.m.visible = i < n[1]; });
    }
    row.querySelector('.mca-pl3-a').addEventListener('click', () => { ph = Math.round(clamp(ph - 0.2, 6.4, 8.4) * 10) / 10; upd(); });
    row.querySelector('.mca-pl3-b').addEventListener('click', () => { ph = Math.round(clamp(ph + 0.2, 6.4, 8.4) * 10) / 10; upd(); });
    upd();
    view.run((t, dt) => {
      TT.update(dt);
      dt = Math.min(dt, 0.05);
      gas.step(dt);
      ring.position.set(BX + 0.6, SURF + 0.02 + 0.04 * Math.sin(t * 2), -0.5 + 0.1 * Math.sin(t * 0.7));
      ring.rotation.z = 0.08 * Math.sin(t * 1.3);
      cur = lerpArr(cur, poolRGB(ph), Math.min(1, dt * 4));
      tube.liquidMesh.material.color.set(rgbStr(cur));
      tube.setLevel(0.7 + 0.008 * Math.sin(t * 3));
      const f = (t % 3) / 3;
      dropM.visible = f < 0.3 && t > 0;
      dropM.position.set(VX, 2.05 - Math.min(1, f / 0.28) * 0.9, 0);
      shown += (ph - shown) * Math.min(1, dt * 8);
      mk.userData.setTip(xs(shown), 2.05, 0);
    });
  });

  steps.push({
    kind: 'example',
    title: 'Real life: Testing pool water',
    text: '<p>Pool owners test the water with an <b>indicator</b>. A drop turns the sample <b>yellow when acidic</b> and <b>red when basic</b>. Good pool water is <b>pH 7.2 to 7.8</b>. Add acid to lower the pH or base to raise it, and check the test color.</p>',
    explain: '<p>A round <b>pool</b> holds water with a few red <b>H<sup>+</sup></b> and blue <b>OH<sup>−</sup></b> ions. Beside it, a <b>test tube</b> of pool water gets a drop of indicator and turns yellow, orange or red. Press <b>Add acid</b> or <b>Add base</b> to change the pH: the marker slides along the color bar, and the two dark posts mark the <b>ideal</b> range, pH 7.2 to 7.8.</p>',
    say: 'This is a swimming pool with a test tube beside it. Pool owners test the water with an indicator, which changes color with P H. In this test, yellow means acidic, orange is in the middle, and red means basic. Good pool water sits between P H seven point two and seven point eight, marked ideal on the bar. Too acidic, and the water stings eyes and eats away metal parts. Too basic, and the water can go cloudy, and the chlorine works less well. Press add acid to lower the P H, or add base to raise it. Watch the red hydrogen ions and blue hydroxide ions in the pool, and the color in the tube.',
    mount: poolFlat,
    scene3d: pool3d
  });

  // ================================================================ 4. Lemon on fish
  // Fish smell comes from amines (such as trimethylamine): small, easily evaporating BASES. Lemon juice is acidic; its H+
  // joins an amine to make a positive ion (amine-H+) that stays in the liquid instead of drifting off to your nose.
  // Model: 6 smelly amines, each squeeze of lemon brings 2 H+ (max 3 squeezes).
  const FISH_SMELL = ['Smell: much less', 'Smell: faint', 'Smell: medium', 'Smell: strong'];   // indexed by ceil(free / 2)
  const fishSmellText = free => FISH_SMELL[Math.ceil(free / 2)];

  function fishFlat(el, api) {
    el.innerHTML = svgWrap(
      `<ellipse cx="122" cy="160" rx="116" ry="15" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>` +
      `<g><ellipse cx="120" cy="142" rx="60" ry="20" fill="#94a3b8" stroke="#64748b" stroke-width="2"/><path d="M178,142 L206,124 L206,160Z" fill="#94a3b8" stroke="#64748b" stroke-width="2" stroke-linejoin="round"/>` +
      `<circle cx="78" cy="138" r="4" fill="#0f172a"/><path d="M96,126 Q104,142 96,158" fill="none" stroke="#64748b" stroke-width="2"/></g>` +
      `<text x="120" y="188" text-anchor="middle" font-size="12" font-weight="700" fill="var(--t-muted)">raw fish on a plate</text>` +
      `<text x="66" y="14" font-size="12" fill="var(--t-muted)">blue and gray balls = amine molecule</text>` +
      `<g id="mca-fs-lemon"><circle r="19" fill="#fde047" stroke="#ca8a04" stroke-width="2.5"/><circle r="12" fill="#fef9c3"/><path d="M0,-12 L0,12 M-12,0 L12,0 M-8.5,-8.5 L8.5,8.5 M8.5,-8.5 L-8.5,8.5" stroke="#fde047" stroke-width="1.5"/></g>` +
      `<g id="mca-fs-amines"></g><g id="mca-fs-fx"></g>` +
      `<text x="322" y="22" text-anchor="middle" font-size="13" fill="var(--t-muted)">Fish smell</text>` +
      `<text id="mca-fs-smell" x="322" y="48" text-anchor="middle" font-size="16" font-weight="800" fill="var(--t-red)">Smell: strong</text>` +
      `<text id="mca-fs-free" x="322" y="72" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">Smelly amines: 6</text>` +
      `<text x="322" y="104" text-anchor="middle" font-size="13" fill="var(--t-ink)">amine (base) + H⁺</text>` +
      `<text x="322" y="122" text-anchor="middle" font-size="13" fill="var(--t-ink)">→ amine-H⁺ ion</text>` +
      `<text x="322" y="146" text-anchor="middle" font-size="12" fill="var(--t-muted)">the ion stays in the</text>` +
      `<text x="322" y="162" text-anchor="middle" font-size="12" fill="var(--t-muted)">liquid: no smell</text>` +
      `<text id="mca-fs-note" x="322" y="182" text-anchor="middle" font-size="12" fill="var(--t-muted)">Squeeze 0 of 3</text>`
    ) + btnRow('<button type="button" class="scene-btn" id="mca-fs-sq">Squeeze lemon</button><button type="button" class="scene-btn" id="mca-fs-reset">Reset</button>');
    const $ = id => el.querySelector('#mca-fs-' + id);
    const layer = $('amines'), fx = $('fx'), lemon = $('lemon');
    lemon.setAttribute('transform', 'translate(36,36)');
    const SLOT = [68, 89, 110, 131, 152, 173];
    function amineNode() {
      const g = mkEl('g', null, layer);
      [[-9, 5], [9, 5], [0, -10]].forEach(o => mkEl('circle', { cx: o[0], cy: o[1], r: 4.5, fill: '#64748b', stroke: 'rgba(15,23,42,0.4)', 'stroke-width': 1 }, g));
      mkEl('circle', { r: 8, fill: '#3b82f6', stroke: 'rgba(15,23,42,0.4)', 'stroke-width': 1 }, g);
      const b = mkEl('g', { opacity: 0 }, g);
      mkEl('circle', { cx: 11, cy: -10, r: 7, fill: '#e5322d', stroke: '#fff', 'stroke-width': 1 }, b);
      const tx = mkEl('text', { x: 11, y: -6, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#fff' }, b); tx.textContent = '+';
      return { g, badge: b };
    }
    let am = [], chasers = [], juice = [], squeezes = 0, squeezeT = -1, spawnQ = 0, spawnT = 0;
    function reset() {
      layer.innerHTML = ''; fx.innerHTML = '';
      am = []; chasers = []; juice = []; squeezes = 0; squeezeT = -1; spawnQ = 0;
      for (let i = 0; i < 6; i++) { const n = amineNode(); am.push({ n, x0: 70 + (i * 29) % 130, ph: i / 6, state: 'free', slot: -1, targeted: false, x: 0, y: 0 }); }
      readout();
    }
    function readout() {
      const free = am.filter(a => a.state === 'free').length;
      const sm = $('smell'); sm.textContent = fishSmellText(free);
      sm.setAttribute('fill', free >= 5 ? 'var(--t-red)' : free >= 3 ? 'var(--t-orange)' : 'var(--t-green)');
      $('free').textContent = 'Smelly amines: ' + free;
      $('note').textContent = 'Squeeze ' + squeezes + ' of 3';
      $('sq').disabled = squeezes >= 3 || squeezeT >= 0 || chasers.length > 0;
    }
    $('sq').addEventListener('click', () => { if (squeezes >= 3 || squeezeT >= 0) return; squeezes++; squeezeT = 0; spawnQ = 2; spawnT = 0.2; readout(); });
    $('reset').addEventListener('click', reset);
    reset();
    api.loop((t, dt) => {
      dt = Math.min(dt, 0.05);
      // amines
      am.forEach((a, i) => {
        if (a.state === 'free') {
          a.ph += 0.2 * dt; if (a.ph >= 1) { a.ph -= 1; a.x0 = 70 + Math.random() * 120; }
          a.x = a.x0 + 12 * Math.sin(a.ph * 9 + i) + a.ph * 34; a.y = 118 - a.ph * 84;
          const o = a.ph < 0.1 ? a.ph / 0.1 : a.ph > 0.75 ? (1 - a.ph) / 0.25 : 1;
          a.n.g.setAttribute('opacity', o.toFixed(2));
        } else if (a.state === 'go') {
          a.k = Math.min(1, a.k + dt / 0.9);
          const e = a.k * a.k * (3 - 2 * a.k);
          a.x = a.fx + (SLOT[a.slot] - a.fx) * e; a.y = a.fy + (114 - a.fy) * e;
          a.n.g.setAttribute('opacity', 1);
          a.n.badge.setAttribute('opacity', 1);
          if (a.k >= 1) a.state = 'done';
        } else { a.y = 114 + 1.5 * Math.sin(t * 2 + i); a.n.g.setAttribute('opacity', 1); }
        a.n.g.setAttribute('transform', `translate(${a.x.toFixed(1)},${a.y.toFixed(1)})`);
      });
      // squeezing the lemon
      if (squeezeT >= 0) {
        squeezeT += dt;
        const k = squeezeT < 0.4 ? Math.sin(squeezeT / 0.4 * Math.PI) : 0;
        lemon.setAttribute('transform', `translate(36,36) scale(${(1 - 0.16 * k).toFixed(2)},${(1 + 0.1 * k).toFixed(2)})`);
        if (squeezeT > 0.4) { squeezeT = -1; lemon.setAttribute('transform', 'translate(36,36)'); readout(); }
      }
      if (spawnQ > 0) {
        spawnT -= dt;
        if (spawnT <= 0) {
          spawnQ--; spawnT = 0.35;
          const target = am.find(a => a.state === 'free' && !a.targeted);
          if (target) target.targeted = true;
          const g = ionNode('H', fx); 
          chasers.push({ g, target, x: 44 + rand(-4, 4), y: 54, life: 0 });
          const jd = mkEl('circle', { r: 4, fill: '#fde047', stroke: '#ca8a04', 'stroke-width': 1 }, fx); juice.push({ e: jd, x: 40 + rand(-8, 8), y: 56, vy: 60 });
        }
      }
      for (let i = chasers.length - 1; i >= 0; i--) {
        const c = chasers[i]; c.life += dt;
        if (c.target && c.target.state === 'free') {
          const dx = c.target.x - c.x, dy = c.target.y - c.y, d = Math.hypot(dx, dy);
          if (d < 12) {
            const a = c.target; a.state = 'go'; a.k = 0; a.fx = a.x; a.fy = a.y; a.slot = am.filter(q => q.state !== 'free').length - 1; a.n.g.setAttribute('opacity', 1);
            fx.removeChild(c.g); chasers.splice(i, 1); readout(); continue;
          }
          const sp = 120 * dt; c.x += dx / d * sp; c.y += dy / d * sp;
        } else { c.y += 90 * dt; if (c.y > 150) { fx.removeChild(c.g); chasers.splice(i, 1); readout(); continue; } }
        c.g.setAttribute('transform', `translate(${c.x.toFixed(1)},${c.y.toFixed(1)})`);
      }
      for (let i = juice.length - 1; i >= 0; i--) {
        const j = juice[i]; j.y += j.vy * dt; j.vy += 200 * dt;
        if (j.y > 138) { fx.removeChild(j.e); juice.splice(i, 1); continue; }
        j.e.setAttribute('cx', j.x.toFixed(1)); j.e.setAttribute('cy', j.y.toFixed(1));
      }
    });
  }

  const fish3d = Chem3D.define({ fov: 30, distance: 10.6, pitch: 0.28, yaw: 0.05, target: [0.4, 1.75, 0] }, (view, ctx) => {
    const BX = -1.7, PX = 2.55, FX = BX - 0.1;
    const TT = makeTurntable(view, BX);
    table(view, 4.4, 4.0, 0, BX);
    // plate, fish (ellipsoid body, tail, eye), lemon half
    const plate = new T.Mesh(new T.CylinderGeometry(1.8, 1.6, 0.14, 40), view.mat('#f8fafc', { shininess: 90 })); plate.position.set(BX, 0.07, 0); TT.add(plate);
    const fishMat = view.mat('#94a3b8', { shininess: 70 });
    const body = new T.Mesh(new T.SphereGeometry(1, 32, 24), fishMat); body.scale.set(1.5, 0.5, 0.62); body.position.set(FX, 0.6, 0); TT.add(body);
    const tail = new T.Mesh(new T.ConeGeometry(0.5, 0.7, 4), fishMat); tail.rotation.z = -Math.PI / 2; tail.scale.set(1, 1, 0.35); tail.position.set(FX + 1.85, 0.6, 0); TT.add(tail);
    const eye = view.sphere(0.07, '#0f172a'); eye.position.set(FX - 1.15, 0.72, 0.5); TT.add(eye);
    const lemon = new T.Group(); lemon.position.set(BX - 1.1, 3.3, 0); TT.add(lemon);
    const lm = new T.Mesh(new T.SphereGeometry(1, 28, 20), view.mat('#fde047', { shininess: 60 })); lm.scale.set(0.6, 0.5, 0.5); lemon.add(lm);
    [-0.6, 0.6].forEach(x => { const n = new T.Mesh(new T.ConeGeometry(0.1, 0.16, 12), view.mat('#facc15', { shininess: 40 })); n.rotation.z = x > 0 ? -Math.PI / 2 : Math.PI / 2; n.position.set(x * 1.03, 0, 0); lemon.add(n); });
    const lemonL = view.label('lemon (acid)', [BX - 1.1, 4.1, 0], { size: 0.8, color: '#475569', fontSize: 56 });
    view.label('raw fish', [BX, -0.55, 0.5], { size: 0.9, color: '#475569', fontSize: 56 });
    // amines: a blue N atom with three gray methyl groups; a red "+" badge marks an H+ that has joined
    const cMat = view.mat('#64748b', { shininess: 60 });
    function amine() {
      const g = new T.Group();
      g.add(view.sphere(0.26, '#3b82f6', { shininess: 70 }));
      [[0.3, -0.15, 0.06], [-0.26, -0.15, 0.18], [-0.04, -0.15, -0.31]].forEach(o => { const c = new T.Mesh(new T.SphereGeometry(1, 14, 10), cMat); c.scale.setScalar(0.17); c.position.set(...o); g.add(c); });
      const badge = view.sphere(0.17, '#e5322d', { shininess: 60 }); badge.position.set(0.05, 0.4, 0); badge.visible = false; g.add(badge);
      const pl = view.label('+', [0, 0, 0], { size: 0.55, color: '#ffffff', fontSize: 84 }); badge.add(pl); pl.scale.multiplyScalar(1 / badge.scale.x);
      view.scene.remove(g); TT.add(g);
      g.userData.badge = badge;
      return g;
    }
    const SLOT = [0, 1, 2, 3, 4, 5].map(i => [FX - 1.05 + i * 0.42, 1.12, 0.0]);
    const am = [];
    let squeezes = 0, squeezeT = -1, spawnQ = 0, spawnT = 0;
    for (let i = 0; i < 6; i++) { const g = amine(); am.push({ g, x0: 0, z0: 0, ph: i / 6, state: 'free', slot: -1, targeted: false, k: 0, from: new T.Vector3() }); }
    const respawn = a => { a.x0 = FX + rand(-1.0, 0.8); a.z0 = rand(-0.35, 0.35); };
    // H+ ions from the lemon and juice drops
    const chasers = [], juice = [];
    const jG = new T.SphereGeometry(1, 10, 8), jM = view.mat('#fde047', { shininess: 90 });
    const jd = []; for (let i = 0; i < 8; i++) { const m = new T.Mesh(jG, jM); m.scale.setScalar(0.07); m.visible = false; TT.add(m); jd.push(m); }
    // panel
    const smellL = [['#dc2626', 'Smell: strong'], ['#ea580c', 'Smell: medium'], ['#16a34a', 'Smell: faint'], ['#16a34a', 'Smell: much less']].map(a => wideLabel(view, a[1], [PX, 3.55, 0], { size: 1.0, color: a[0], fontSize: 60 }));
    const freeL = wideLabel(view, 'Smelly amines: 6', [PX, 2.75, 0], { size: 0.8, color: INK, fontSize: 56 });
    wideLabel(view, 'amine (base) + H⁺', [PX, 1.95, 0], { size: 0.8, color: '#4f46e5', fontSize: 52 });
    wideLabel(view, '→ amine-H⁺ ion', [PX, 1.3, 0], { size: 0.8, color: '#4f46e5', fontSize: 52 });
    wideLabel(view, 'blue ball = amine molecule', [PX, 0.6, 0], { size: 0.7, color: '#475569', fontSize: 44 });
    const noteL = wideLabel(view, 'Squeeze 0 of 3', [PX, -0.05, 0], { size: 0.7, color: '#475569', fontSize: 54 });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center"><button class="scene-btn mca-fs3-sq" type="button">Squeeze lemon</button><button class="scene-btn mca-fs3-reset" type="button">Reset</button></div>');
    const sqB = row.querySelector('.mca-fs3-sq'), resetB = row.querySelector('.mca-fs3-reset');
    function readout() {
      const free = am.filter(a => a.state === 'free').length;
      const lvl = free >= 5 ? 0 : free >= 3 ? 1 : free >= 1 ? 2 : 3;
      smellL.forEach((l, i) => { l.visible = i === lvl; });
      freeL.userData.setText('Smelly amines: ' + free);
      noteL.userData.setText('Squeeze ' + squeezes + ' of 3');
      sqB.disabled = squeezes >= 3 || squeezeT >= 0 || chasers.length > 0;
    }
    function reset() {
      chasers.splice(0).forEach(c => c.g.parent && c.g.parent.remove(c.g));
      juice.splice(0).forEach(j => { j.m.visible = false; });
      squeezes = 0; squeezeT = -1; spawnQ = 0;
      am.forEach((a, i) => { a.state = 'free'; a.targeted = false; a.ph = i / 6; a.g.userData.badge.visible = false; respawn(a); });
      readout();
    }
    sqB.addEventListener('click', () => { if (squeezes >= 3 || squeezeT >= 0) return; squeezes++; squeezeT = 0; spawnQ = 2; spawnT = 0.2; readout(); });
    resetB.addEventListener('click', reset);
    reset();
    const lemonPos = new T.Vector3(BX - 1.1, 2.75, 0);
    view.run((t, dt) => {
      TT.update(dt);
      dt = Math.min(dt, 0.05);
      am.forEach((a, i) => {
        if (a.state === 'free') {
          a.ph += 0.11 * dt; if (a.ph >= 1) { a.ph -= 1; respawn(a); }
          a.g.position.set(a.x0 + 0.5 * a.ph + 0.14 * Math.sin(a.ph * 9 + i), 1.15 + a.ph * 2.4, a.z0 + 0.14 * Math.cos(a.ph * 7 + i));
          a.g.scale.setScalar(a.ph < 0.08 ? Math.max(0.05, a.ph / 0.08) : a.ph > 0.8 ? Math.max(0.05, (1 - a.ph) / 0.2) : 1);
          a.g.rotation.set(t * 0.8 + i, t * 0.6, 0);
        } else if (a.state === 'go') {
          a.k = Math.min(1, a.k + dt / 0.9);
          const e = a.k * a.k * (3 - 2 * a.k), sl = SLOT[a.slot];
          a.g.position.set(a.from.x + (sl[0] - a.from.x) * e, a.from.y + (sl[1] - a.from.y) * e, a.from.z + (sl[2] - a.from.z) * e);
          a.g.scale.setScalar(1);
          if (a.k >= 1) a.state = 'done';
        } else { const sl = SLOT[a.slot]; a.g.position.set(sl[0], sl[1] + 0.03 * Math.sin(t * 2 + i), sl[2]); a.g.rotation.set(0, t * 0.5, 0); }
      });
      if (squeezeT >= 0) {
        squeezeT += dt;
        const k = squeezeT < 0.4 ? Math.sin(squeezeT / 0.4 * Math.PI) : 0;
        lemon.scale.set(1 - 0.15 * k, 1 + 0.12 * k, 1 - 0.15 * k);
        if (squeezeT > 0.4) { squeezeT = -1; lemon.scale.set(1, 1, 1); readout(); }
      }
      if (spawnQ > 0) {
        spawnT -= dt;
        if (spawnT <= 0) {
          spawnQ--; spawnT = 0.4;
          const target = am.find(a => a.state === 'free' && !a.targeted);
          if (target) target.targeted = true;
          const g = makeIon(view, 'H'); g.scale.multiplyScalar(0.85); view.scene.remove(g); TT.add(g);
          g.position.copy(lemonPos);
          chasers.push({ g, target });
          const m = jd.find(q => !q.visible); if (m) { m.visible = true; m.position.set(lemonPos.x + rand(-0.15, 0.15), 2.7, rand(-0.15, 0.15)); juice.push({ m, vy: 0 }); }
        }
      }
      for (let i = chasers.length - 1; i >= 0; i--) {
        const c = chasers[i], p = c.g.position;
        if (c.target && c.target.state === 'free') {
          const d = c.target.g.position.clone().sub(p), L = d.length();
          if (L < 0.3) {
            const a = c.target; a.state = 'go'; a.k = 0; a.from.copy(a.g.position); a.slot = am.filter(q => q.state !== 'free').length - 1; a.g.userData.badge.visible = true;
            c.g.parent.remove(c.g); chasers.splice(i, 1); readout(); continue;
          }
          p.addScaledVector(d.normalize(), Math.min(L, 3.4 * dt));
        } else { p.y -= 2.5 * dt; if (p.y < 1.0) { c.g.parent.remove(c.g); chasers.splice(i, 1); readout(); continue; } }
      }
      for (let i = juice.length - 1; i >= 0; i--) {
        const j = juice[i]; j.vy += 6 * dt; j.m.position.y -= j.vy * dt;
        if (j.m.position.y < 1.0) { j.m.visible = false; juice.splice(i, 1); }
      }
    });
  });

  steps.push({
    kind: 'example',
    title: 'Real life: Lemon on fish',
    text: '<p>Raw fish smells because of small <b>basic</b> molecules called <b>amines</b> that drift into the air. Lemon juice is an <b>acid</b>: its H<sup>+</sup> ions join the amines and turn them into <b>ions</b> that stay in the liquid, so the smell fades. Squeeze the lemon!</p>',
    explain: '<p>A gray <b>fish</b> lies on a plate. Small <b>amine</b> molecules, each a blue nitrogen ball with three gray balls, float up from it: that is the smell. Press <b>Squeeze lemon</b>: red <b>H<sup>+</sup></b> balls fall from the lemon and each joins an amine, marked with a red plus. Those <b>amine-H<sup>+</sup></b> ions sink onto the fish, so fewer amines reach your nose.</p>',
    say: 'Raw fish has a strong smell. The smell comes from small molecules called amines. They are bases, and they are light enough to float up into the air and reach your nose. In the picture, each blue ball with three gray balls is one amine. Now press squeeze lemon. Lemon juice is an acid, so it carries hydrogen ions. Each hydrogen ion joins an amine. That makes a positive ion, marked with a red plus. An ion like that stays in the liquid on the fish. It cannot float away, so the smell gets weaker. Each squeeze catches two amines, and three squeezes catch all six in this simplified picture. That is why cooks serve fish with lemon.',
    mount: fishFlat,
    scene3d: fish3d
  });

  // ================================================================ 5. Bee and wasp stings
  // Bee venom is mildly acidic (about pH 5); wasp venom is close to neutral, maybe a little basic (about pH 7 to 8).
  // The old advice (baking soda for bees, vinegar for wasps) sounds like neutralization, but the tiny drop of venom is deep
  // under the skin, out of reach of anything dabbed on the surface. So the remedy can only act on top of the skin.
  const STING = {
    bee: { name: 'Bee sting', ph: 'Venom: about pH 5', kind: 'mildly acidic', kcol: 'var(--t-red)', remedy: 'baking soda (a base)', rion: 'OH', h: 4, oh: 0 },
    wasp: { name: 'Wasp sting', ph: 'Venom: about pH 7 to 8', kind: 'near neutral', kcol: 'var(--t-teal)', remedy: 'vinegar (an acid)', rion: 'H', h: 1, oh: 2 }
  };
  const STING_T = 6;   // seconds per sting cycle
  // Stinger depth (0 = outside, 1 = fully in) and venom size (0..1) at time u seconds into the cycle.
  const stingerDepth = (u, kind) => kind === 'bee' ? smooth(0, 0.8, u) : smooth(0, 0.8, u) * (1 - smooth(3, 3.8, u));
  const venomSize = u => smooth(0.7, 1.8, u) * (1 - smooth(5.3, 5.9, u));

  function stingFlat(el, api) {
    el.innerHTML = svgWrap(
      `<rect x="10" y="66" width="230" height="18" fill="#fcd5b5"/><rect x="10" y="84" width="230" height="78" fill="#fda4af" fill-opacity="0.6"/>` +
      `<line x1="10" y1="66" x2="240" y2="66" stroke="#b45309" stroke-width="2.5"/>` +
      `<text x="16" y="79" font-size="12" font-weight="700" fill="#7c2d12">skin surface</text>` +
      `<text x="16" y="156" font-size="12" font-weight="700" fill="#7f1d1d">deeper skin</text>` +
      `<circle id="mca-st-blob" cx="111" cy="114" r="30" fill="#fde047" fill-opacity="0.5" stroke="#ca8a04" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<g id="mca-st-vions"></g>` +
      `<g id="mca-st-bug"><ellipse id="mca-st-body" cx="0" cy="0" rx="22" ry="11" fill="#facc15" stroke="#1f2937" stroke-width="2"/><path d="M-6,-10 L-6,10 M4,-10 L4,10 M14,-8 L14,8" stroke="#1f2937" stroke-width="3.5"/>` +
      `<path id="mca-st-sting" d="M-2.5,10 L2.5,10 L0.5,58 L-0.5,58Z" fill="#334155"/></g>` +
      `<text id="mca-st-tag" x="20" y="24" font-size="13" font-weight="800" fill="var(--t-ink)">Bee</text>` +
      `<g id="mca-st-rem" opacity="0"><ellipse cx="190" cy="64" rx="40" ry="4" fill="#bae6fd" stroke="#38bdf8" stroke-width="1.5"/><g id="mca-st-rions"></g></g>` +
      `<circle id="mca-st-rd" cx="190" cy="20" r="5" fill="#bae6fd" stroke="#38bdf8" stroke-width="1.5" opacity="0"/>` +
      `<text id="mca-st-rl" x="196" y="104" text-anchor="middle" font-size="12" font-weight="700" fill="#7f1d1d" opacity="0">remedy stays<tspan x="196" dy="15">on top</tspan></text>` +
      `<text id="mca-st-name" x="322" y="24" text-anchor="middle" font-size="16" font-weight="800" fill="var(--t-ink)">Bee sting</text>` +
      `<text id="mca-st-ph" x="322" y="48" text-anchor="middle" font-size="13" font-weight="800" fill="var(--t-ink)">Venom: about pH 5</text>` +
      `<text id="mca-st-kind" x="322" y="68" text-anchor="middle" font-size="13" font-weight="800" fill="var(--t-red)">mildly acidic</text>` +
      `<text x="322" y="98" text-anchor="middle" font-size="12" fill="var(--t-muted)">old remedy:</text>` +
      `<text id="mca-st-rem-n" x="322" y="116" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">baking soda (a base)</text>` +
      `<text x="322" y="146" text-anchor="middle" font-size="12" fill="var(--t-ink)">Venom sits deep in</text>` +
      `<text x="322" y="162" text-anchor="middle" font-size="12" fill="var(--t-ink)">the skin, out of reach</text>` +
      `<text x="322" y="182" text-anchor="middle" font-size="12" fill="var(--t-muted)">A cold pack helps more</text>`
    ) + btnRow('<button type="button" class="scene-btn" data-k="bee">Bee sting</button><button type="button" class="scene-btn" data-k="wasp">Wasp sting</button><button type="button" class="scene-btn" data-k="dab">Try the old remedy</button>');
    const $ = id => el.querySelector('#mca-st-' + id);
    const vions = $('vions'), rions = $('rions');
    const CX = 111, CY = 114;
    const vh = [0, 1, 2, 3].map(() => ionNode('H', vions)), vo = [0, 1].map(() => ionNode('OH', vions));
    const rh = [0, 1, 2].map(() => ionNode('H', rions)), ro = [0, 1, 2].map(() => ionNode('OH', rions));
    const SLOT_H = [[-14, -8], [14, -8], [-10, 13], [13, 12]], SLOT_O = [[10, -8], [0, 14]];
    let kind = 'bee', t0 = 0, dabT = -1, puddle = 0;
    const row = el.querySelector('.scene-slider-row');
    function setKind(k) {
      kind = k; const d = STING[k];
      $('name').textContent = d.name; $('ph').textContent = d.ph;
      $('kind').textContent = d.kind; $('kind').setAttribute('fill', d.kcol);
      $('rem-n').textContent = d.remedy; $('tag').textContent = k === 'bee' ? 'Bee' : 'Wasp';
      $('body').setAttribute('fill', k === 'bee' ? '#facc15' : '#eab308'); $('body').setAttribute('ry', k === 'bee' ? 11 : 8);
      rh.forEach(n => n.setAttribute('opacity', d.rion === 'H' ? 1 : 0)); ro.forEach(n => n.setAttribute('opacity', d.rion === 'OH' ? 1 : 0));
      dabT = -1; puddle = 0;
      markButtons(row, row.querySelector('[data-k="' + k + '"]'));
    }
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.k === 'dab') { dabT = 0; puddle = 0; markButtons(row, b); } else { setKind(b.dataset.k); t0 = curT; }
    }));
    let curT = 0;
    setKind('bee');
    api.loop((t, dt) => {
      curT = t;
      const u = (t - t0) % STING_T, d = STING[kind];
      const dep = stingerDepth(u, kind), vs = venomSize(u);
      $('bug').setAttribute('transform', `translate(111,${(16 + dep * 30).toFixed(1)})`);
      $('sting').setAttribute('d', `M-2.5,10 L2.5,10 L0.5,${(10 + 12 + dep * 42).toFixed(1)} L-0.5,${(10 + 12 + dep * 42).toFixed(1)}Z`);
      const pulse = 1 + 0.05 * Math.sin(t * 5);
      $('blob').setAttribute('r', (30 * vs * pulse).toFixed(1));
      $('blob').setAttribute('opacity', vs > 0.02 ? 1 : 0);
      vh.forEach((n, i) => { const s = SLOT_H[i]; n.setAttribute('opacity', i < d.h && vs > 0.85 ? 1 : 0); n.setAttribute('transform', `translate(${(CX + s[0] + 3 * Math.sin(t * 2 + i * 1.7)).toFixed(1)},${(CY + s[1] + 3 * Math.cos(t * 1.7 + i)).toFixed(1)})`); });
      vo.forEach((n, i) => { const s = SLOT_O[i]; n.setAttribute('opacity', i < d.oh && vs > 0.85 ? 1 : 0); n.setAttribute('transform', `translate(${(CX + s[0] + 3 * Math.sin(t * 2.3 + i * 2.1)).toFixed(1)},${(CY + s[1] + 3 * Math.cos(t * 1.9 + i)).toFixed(1)})`); });
      // remedy dab: a drop lands on the skin surface and its ions stay on top
      if (dabT >= 0) {
        dabT += dt;
        const k = Math.min(1, dabT / 0.6);
        $('rd').setAttribute('opacity', dabT < 0.6 ? 1 : 0); $('rd').setAttribute('cy', 20 + k * 40);
        puddle = smooth(0.6, 1.0, dabT);
      }
      $('rem').setAttribute('opacity', puddle.toFixed(2));
      $('rl').setAttribute('opacity', puddle.toFixed(2));
      [rh, ro].forEach(arr => arr.forEach((n, i) => n.setAttribute('transform', `translate(${(158 + i * 32).toFixed(1)},${(50 + 2 * Math.sin(t * 3 + i * 2)).toFixed(1)})`)));
    });
  }

  const sting3d = Chem3D.define({ fov: 30, distance: 10.8, pitch: 0.28, yaw: 0.05, target: [0.4, 1.45, 0] }, (view, ctx) => {
    const BX = -1.7, PX = 2.55, VX = BX - 0.3, VY = 0.85;
    const TT = makeTurntable(view, BX);
    table(view, 4.0, 3.2, 0, BX);
    // skin: tan surface layer on top of translucent pink deeper skin, so the venom underneath can be seen
    const deep = new T.Mesh(new T.BoxGeometry(3.4, 1.6, 2.2), view.mat('#fda4af', { opacity: 0.5, shininess: 40 })); deep.position.set(BX, 0.8, 0); TT.add(deep);
    const top = new T.Mesh(new T.BoxGeometry(3.4, 0.28, 2.2), view.mat('#fcd5b5', { shininess: 30 })); top.position.set(BX, 1.74, 0); TT.add(top);
    const lb = (txt, y, bg) => { const l = view.label(txt, [BX - 1.3, y, 1.25], { size: 0.62, color: '#ffffff', bg, fontSize: 56 }); view.scene.remove(l); TT.add(l); return l; };
    lb('skin surface', 1.9, 'rgba(146,64,14,0.9)'); lb('deeper skin', 0.45, 'rgba(127,29,29,0.9)');
    // the insect: striped body and a stinger (cone pointing down)
    const bug = new T.Group(); TT.add(bug);
    const body = new T.Mesh(new T.SphereGeometry(1, 28, 20), view.mat('#facc15', { shininess: 60 })); body.scale.set(0.75, 0.42, 0.42); bug.add(body);
    [-0.3, 0.05, 0.4].forEach(x => { const st = new T.Mesh(new T.CylinderGeometry(1, 1, 0.12, 20), view.mat('#1f2937', { shininess: 30 })); st.rotation.z = Math.PI / 2; st.position.x = x; st.scale.set(0.34 * (1 - Math.abs(x) * 0.5), 1, 0.34 * (1 - Math.abs(x) * 0.5)); bug.add(st); });
    const sting = new T.Mesh(new T.ConeGeometry(0.07, 1.6, 12), view.mat('#334155', { shininess: 60 })); sting.rotation.z = Math.PI; sting.position.set(0, -0.2 - 0.8, 0); bug.add(sting);
    const tagL = wideLabel(view, 'Bee', [BX + 1.3, 3.7, 0], { size: 0.9, color: INK, fontSize: 64 });
    // venom blob and its ions
    const blob = new T.Mesh(new T.SphereGeometry(1, 28, 20), view.mat('#fde047', { opacity: 0.45, shininess: 80 })); blob.position.set(VX, VY, 0); TT.add(blob);
    const mk = (k, sc) => { const m = makeIon(view, k); m.scale.multiplyScalar(sc); view.scene.remove(m); TT.add(m); return m; };
    const vh = [0, 1, 2, 3].map(() => mk('H', 0.8)), vo = [0, 1].map(() => mk('OH', 0.8));
    const SH = [[-0.35, 0.25, 0.2], [0.35, 0.2, -0.2], [-0.2, -0.3, -0.25], [0.3, -0.3, 0.25]], SO = [[0.3, 0.3, 0.25], [-0.05, -0.32, 0.2]];
    // remedy on the skin surface
    const RX = BX + 0.95;
    const puddle = new T.Mesh(new T.CylinderGeometry(0.75, 0.75, 0.05, 32), view.mat('#7dd3fc', { opacity: 0.6, shininess: 90 })); puddle.position.set(RX, 1.9, 0); puddle.visible = false; TT.add(puddle);
    const rd = view.sphere(0.13, '#7dd3fc', { shininess: 90 }); view.scene.remove(rd); TT.add(rd); rd.visible = false;
    const rh = [0, 1, 2].map(i => mk('H', 0.75)), ro = [0, 1, 2].map(i => mk('OH', 0.75));
    const remL = wideLabel(view, 'remedy stays on top', [BX, -0.55, 0.9], { size: 0.8, color: '#7f1d1d', fontSize: 52 });
    // panel
    const nameL = wideLabel(view, 'Bee sting', [PX, 3.6, 0], { size: 1.0, color: INK, fontSize: 64 });
    const phL = { bee: wideLabel(view, STING.bee.ph, [PX, 2.8, 0], { size: 0.8, color: INK, fontSize: 52 }), wasp: wideLabel(view, STING.wasp.ph, [PX, 2.8, 0], { size: 0.8, color: INK, fontSize: 48 }) };
    const kindL = { bee: wideLabel(view, STING.bee.kind, [PX, 2.1, 0], { size: 0.9, color: '#dc2626', fontSize: 58 }), wasp: wideLabel(view, STING.wasp.kind, [PX, 2.1, 0], { size: 0.9, color: '#0d9488', fontSize: 58 }) };
    wideLabel(view, 'old remedy:', [PX, 1.35, 0], { size: 0.7, color: '#475569', fontSize: 52 });
    const remN = { bee: wideLabel(view, STING.bee.remedy, [PX, 0.8, 0], { size: 0.8, color: INK, fontSize: 52 }), wasp: wideLabel(view, STING.wasp.remedy, [PX, 0.8, 0], { size: 0.8, color: INK, fontSize: 52 }) };
    wideLabel(view, 'Venom is out of reach', [PX, 0.05, 0], { size: 0.75, color: '#475569', fontSize: 52 });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;gap:4px 6px"><button class="scene-btn" type="button" data-k="bee">Bee sting</button><button class="scene-btn" type="button" data-k="wasp">Wasp sting</button><button class="scene-btn" type="button" data-k="dab">Try the old remedy</button></div>');
    let kind = 'bee', t0 = 0, curT = 0, dabT = -1, pud = 0;
    function setKind(k) {
      kind = k; const d = STING[k];
      nameL.userData.setText(d.name); tagL.userData.setText(k === 'bee' ? 'Bee' : 'Wasp');
      ['bee', 'wasp'].forEach(q => { phL[q].visible = kind === q; kindL[q].visible = kind === q; remN[q].visible = kind === q; });
      body.material.color.set(k === 'bee' ? '#facc15' : '#eab308'); body.scale.set(0.75, k === 'bee' ? 0.42 : 0.3, k === 'bee' ? 0.42 : 0.3);
      rh.forEach(m => { m.userData.on = d.rion === 'H'; }); ro.forEach(m => { m.userData.on = d.rion === 'OH'; });
      dabT = -1; pud = 0;
      markButtons(row, row.querySelector('[data-k="' + k + '"]'));
    }
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.k === 'dab') { dabT = 0; pud = 0; markButtons(row, b); } else { setKind(b.dataset.k); t0 = curT; }
    }));
    setKind('bee');
    view.run((t, dt) => {
      TT.update(dt);
      dt = Math.min(dt, 0.05); curT = t;
      const u = (t - t0) % STING_T, d = STING[kind];
      const dep = stingerDepth(u, kind), vs = venomSize(u);
      bug.position.set(BX - 0.3, 3.75 - dep * 0.95, 0); bug.rotation.z = 0.06 * Math.sin(t * 6);
      const pulse = 1 + 0.05 * Math.sin(t * 5);
      blob.scale.setScalar(Math.max(0.001, 0.78 * vs * pulse)); blob.visible = vs > 0.02;
      vh.forEach((m, i) => { m.visible = i < d.h && vs > 0.85; const s = SH[i]; m.position.set(VX + s[0] + 0.05 * Math.sin(t * 2 + i * 1.7), VY + s[1] + 0.05 * Math.cos(t * 1.7 + i), s[2]); });
      vo.forEach((m, i) => { m.visible = i < d.oh && vs > 0.85; const s = SO[i]; m.position.set(VX + s[0] + 0.05 * Math.sin(t * 2.3 + i * 2.1), VY + s[1] + 0.05 * Math.cos(t * 1.9 + i), s[2]); });
      if (dabT >= 0) {
        dabT += dt;
        rd.visible = dabT < 0.6; rd.position.set(RX, 3.4 - Math.min(1, dabT / 0.6) * 1.45, 0);
        pud = smooth(0.6, 1.0, dabT);
      }
      puddle.visible = pud > 0.02; puddle.scale.set(pud, 1, pud);
      remL.visible = pud > 0.5;
      [rh, ro].forEach(arr => arr.forEach((m, i) => { m.visible = m.userData.on && pud > 0.5; m.position.set(RX - 0.4 + i * 0.4, 2.3 + 0.05 * Math.sin(t * 3 + i * 2), (i - 1) * 0.15); }));
    });
  });

  steps.push({
    kind: 'example',
    title: 'Real life: Bee and wasp stings',
    text: '<p>Bee venom is mildly <b>acidic</b> (about pH 5) and wasp venom is nearer to neutral. Old advice says to <b>neutralize</b> a sting with baking soda or vinegar, but the venom sits deep under the skin, out of reach of a remedy dabbed on top.</p>',
    explain: '<p>A block of <b>skin</b> has a tan surface layer over deeper pink skin. A <b>stinger</b> reaches the deeper layer and leaves a yellow drop of <b>venom</b> with ions inside: four red <b>H<sup>+</sup></b> for a bee, mostly blue <b>OH<sup>−</sup></b> for a wasp. Press <b>Try the old remedy</b>: a drop with its ions lands on the surface and stays on top, far from the venom.</p>',
    say: 'Bee venom is mildly acidic, about P H five. Wasp venom is close to neutral, maybe a little basic. Old advice says to dab baking soda on a bee sting and vinegar on a wasp sting, to neutralize the venom. It sounds sensible. But look at the picture. The stinger puts a tiny drop of venom deep under the skin. Press try the old remedy. The drop lands on the surface, and its ions stay on top. They cannot reach the venom, so they cannot neutralize it. A cold pack, washing the spot, and taking out a bee\'s stinger help more. If someone has trouble breathing, or their face swells, get an adult and call for help straight away.',
    mount: stingFlat,
    scene3d: sting3d
  });

  // @@EX6@@

  addTutorialSteps('chemistry', 'acids', steps, [
    { term: 'Antacid', definition: 'A mild base, such as magnesium hydroxide, taken to neutralize some stomach acid and ease heartburn.' },
    { term: 'Acid rain', definition: 'Rain that is more acidic than normal rain (about pH 5.6). Its H⁺ ions slowly dissolve marble and limestone.' }
  ]);
})();
