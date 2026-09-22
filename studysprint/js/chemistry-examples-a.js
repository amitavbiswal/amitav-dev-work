(function () {
  // chemistry-examples-a: extra real-life example steps, added via addTutorialSteps(...).
  // Topics: atoms (exatm-), molecules (exmol-), mixtures (exmix-).

  const SVGNS = 'http://www.w3.org/2000/svg';
  const RED = '#dc2626';    // protons / oxygen
  const GREY = '#9ca3af';   // neutrons
  const ELEC = '#4f46e5';   // electrons / hydrogen
  const CARB = '#374151';   // carbon
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = x => x * x * (3 - 2 * x);
  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // ====================================================================
  // ATOMS
  // ====================================================================
  const atomsEx = [];
  // ---- Real life: neon sign (SMIL): an electron jumps up, falls back and gives off light
  (function () {
    const cx = 105, cy = 108, D = 5;   // atom centre, cycle length (s)
    let inner = '', outer = '';
    for (let k = 0; k < 2; k++) {
      const a = Math.PI * k;
      inner += `<circle cx="${(cx + 26 * Math.cos(a)).toFixed(1)}" cy="${(cy + 26 * Math.sin(a)).toFixed(1)}" r="5" fill="${ELEC}"/>`;
    }
    for (let k = 1; k < 8; k++) {
      const a = (Math.PI / 4) * k;
      outer += `<circle cx="${(cx + 48 * Math.cos(a)).toFixed(1)}" cy="${(cy + 48 * Math.sin(a)).toFixed(1)}" r="5" fill="${ELEC}"/>`;
    }
    const spin = dur => `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`;
    const sign = (blur) => `<text x="308" y="124" text-anchor="middle" font-size="46" font-weight="700" fill="none" stroke="#ff6b3d" stroke-width="${blur ? 6 : 3}" stroke-linejoin="round" ${blur ? 'filter="url(#exatm-glow)"' : ''}>NEON` +
      `<animate attributeName="stroke-opacity" values="0.15;0.15;1;1;0.15" keyTimes="0;0.7;0.86;0.95;1" dur="${D}s" repeatCount="indefinite"/></text>`;
    atomsEx.push({
      kind: 'example',
      title: 'Real life: Neon signs',
      text: '<p>A neon sign is a glass tube of <b>neon gas</b>. Electricity gives energy to neon\'s <b>electrons</b>, and they jump out to a higher level. When they fall back, they give off that energy as <b>light</b>!</p>',
      svg: TutorialKit.svg(`
        <defs><filter id="exatm-glow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="5"/></filter></defs>
        <text x="${cx}" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-ink)">Neon atom</text>
        <circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="#c7d2fe" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${cy}" r="48" fill="none" stroke="#c7d2fe" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${cy}" r="68" fill="none" stroke="#c7d2fe" stroke-width="1.5" stroke-dasharray="4 5"/>
        <g>${inner}${spin(2.5)}</g>
        <g>${outer}${spin(6)}</g>
        <g><circle cx="${cx + 48}" cy="${cy}" r="6" fill="var(--t-orange)"><animate attributeName="cx" values="${cx + 48};${cx + 48};${cx + 68};${cx + 68};${cx + 48};${cx + 48}" keyTimes="0;0.2;0.3;0.6;0.7;1" dur="${D}s" repeatCount="indefinite"/></circle>${spin(6)}</g>
        <circle cx="${cx + 9}" cy="${cy}" r="14" fill="${GREY}"/>
        <text x="${cx + 9}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#111827">10n</text>
        <circle cx="${cx - 9}" cy="${cy}" r="14" fill="${RED}"/>
        <text x="${cx - 9}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">10p</text>
        <rect x="224" y="66" width="168" height="86" rx="12" fill="#1f2937"/>
        ${sign(true)}${sign(false)}
        <circle cy="${cy - 4}" r="6" fill="var(--t-yellow)" opacity="0"><animate attributeName="cx" values="${cx + 50};${cx + 50};222;222" keyTimes="0;0.68;0.85;1" dur="${D}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.68;0.7;0.84;0.86;1" dur="${D}s" repeatCount="indefinite"/></circle>
        <text x="200" y="208" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-ink)">Electric energy makes an electron jump up.<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.5;0.56;0.98;1" dur="${D}s" repeatCount="indefinite"/></text>
        <text x="200" y="208" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-orange)" opacity="0">Falling back, it gives off the energy as light!<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.58;0.64;0.96;1" dur="${D}s" repeatCount="indefinite"/></text>
        <text x="200" y="228" text-anchor="middle" font-size="13" fill="var(--t-muted)">10 protons, 10 neutrons, 10 electrons in shells 2 and 8</text>`)
    });
  })();
  // ---- Real life: balloon rubbed on hair (interactive): electrons move, hair stands up
  atomsEx.push({
    kind: 'example',
    title: 'Real life: Static on a balloon',
    text: '<p>Rub a balloon on your hair and <b>electrons</b> hop from the hair to the balloon. The balloon turns negative, the hair positive, and opposite charges attract: hair reaches up! Only electrons move, never protons.</p>',
    mount(el, api) {
      el.innerHTML =
        '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' +
        '<div class="scene-slider-row" style="justify-content:center;gap:8px"><button type="button" class="scene-btn" id="exatm-rub">Rub the balloon</button><button type="button" class="scene-btn" id="exatm-reset">Reset</button></div>';
      const svg = el.querySelector('svg');
      const MAXQ = 8, HX = 305, HY = 168, HR = 42, NS = 9;
      svgEl('circle', { cx: HX, cy: HY, r: HR, fill: '#fcd9b6', stroke: 'var(--t-ink)', 'stroke-width': 2 }, svg);
      const strands = [];
      for (let i = 0; i < NS; i++) {
        const a = Math.PI * (1.12 + 0.76 * i / (NS - 1));
        const bx = HX + HR * Math.cos(a), by = HY + HR * Math.sin(a);
        const p = svgEl('path', { fill: 'none', stroke: '#7c4a1e', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
        const plus = svgEl('text', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: 'var(--t-red)', opacity: 0 }, svg);
        plus.textContent = '+';
        strands.push({ a, bx, by, p, plus, i });
      }
      const bal = svgEl('g', { transform: 'translate(120 102)' }, svg);
      svgEl('path', { d: 'M0 50 q-6 14 4 22', fill: 'none', stroke: 'var(--t-muted)', 'stroke-width': 2 }, bal);
      svgEl('ellipse', { cx: 0, cy: 0, rx: 46, ry: 52, fill: 'var(--t-orange)', stroke: 'var(--t-ink)', 'stroke-width': 2 }, bal);
      svgEl('ellipse', { cx: -28, cy: -28, rx: 6, ry: 10, fill: '#fff', opacity: 0.35 }, bal);
      const minus = [];
      for (let i = 0; i < MAXQ; i++) {
        const a = 0.4 + i * 0.79;
        const m = svgEl('text', { x: 26 * Math.cos(a), y: 30 * Math.sin(a) + 6, 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: '#fff', opacity: 0 }, bal);
        m.textContent = '−';
        minus.push(m);
      }
      const eDots = [0, 1, 2].map(() => svgEl('circle', { r: 5, fill: ELEC, opacity: 0 }, svg));
      const cap1 = svgEl('text', { x: 200, y: 18, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: 'var(--t-ink)' }, svg);
      const cap2 = svgEl('text', { x: 200, y: 37, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--t-muted)' }, svg);
      let q = 0, qv = 0, rubT0 = -1, lastT = 0, auto = true;
      const rub = () => { if (rubT0 < 0 && q < MAXQ) rubT0 = lastT; };
      el.querySelector('#exatm-rub').addEventListener('click', () => { auto = false; rub(); });
      el.querySelector('#exatm-reset').addEventListener('click', () => { auto = false; q = 0; rubT0 = -1; });
      api.loop(t => {
        lastT = t;
        if (auto && t > 0.5) { auto = false; rub(); }
        let off = 0, p = -1;
        if (rubT0 >= 0) {
          p = (t - rubT0) / 1.4;
          if (p >= 1) { q = Math.min(MAXQ, q + 1); rubT0 = -1; p = -1; }
          else off = 70 * Math.sin(Math.PI * p) + 5 * Math.sin(p * 34);
        }
        qv += (q - qv) * 0.08;
        const qf = qv / MAXQ;
        const bx = 120 + off, by = 102 + Math.sin(t * 1.6) * 3;
        bal.setAttribute('transform', `translate(${bx.toFixed(1)} ${by.toFixed(1)})`);
        minus.forEach((m, i) => m.setAttribute('opacity', i < q && !(p >= 0 && i === q) ? 1 : 0));
        eDots.forEach((d, k) => {
          const s = ease(clamp01((p - 0.3 - k * 0.07) / 0.35));
          if (p < 0 || s <= 0 || s >= 1) { d.setAttribute('opacity', 0); return; }
          const sx = 268 + k * 10, sy = 132 + k * 8, tx = bx + 40, ty = by - 16 + k * 16;
          d.setAttribute('cx', (sx + (tx - sx) * s).toFixed(1));
          d.setAttribute('cy', (sy + (ty - sy) * s).toFixed(1));
          d.setAttribute('opacity', 1);
        });
        strands.forEach(s => {
          const wob = qf > 0.05 ? Math.sin(t * 2.2 + s.i) * 2.5 : 0;
          const restX = s.bx + Math.cos(s.a) * 16, restY = s.by + 16;
          const upX = s.bx - 34 + (s.i - 4) * 7 + wob, upY = s.by - 62;
          const tx = restX + (upX - restX) * qf, ty = restY + (upY - restY) * qf;
          const cxm = s.bx + (tx - s.bx) * 0.4 - qf * 6, cym = s.by + (ty - s.by) * 0.7;
          s.p.setAttribute('d', `M${s.bx.toFixed(1)} ${s.by.toFixed(1)} Q${cxm.toFixed(1)} ${cym.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`);
          s.plus.setAttribute('x', (tx - 8).toFixed(1));
          s.plus.setAttribute('y', (ty + 4).toFixed(1));
          s.plus.setAttribute('opacity', qf > 0.1 && s.i % 2 === 0 ? 1 : 0);
        });
        cap1.textContent = p >= 0 ? 'Rubbing: electrons hop onto the balloon...'
          : q === 0 ? 'Both the balloon and the hair are neutral.'
            : 'Balloon: extra electrons (−). Hair: fewer electrons (+).';
        cap2.textContent = p >= 0 ? '' : q === 0 ? 'Press "Rub the balloon" and watch.'
          : q < 4 ? 'Rub more to build up more charge.' : 'Opposite charges attract, so the hair reaches up!';
      });
    }
  });
  // ---- Real life: the atoms in your body (SMIL bar chart, by mass)
  (function () {
    const D = 9, X0 = 104, K = 1.9;   // cycle length, bar start, px per percent
    const rows = [
      ['O', 'Oxygen', 65, RED], ['C', 'Carbon', 18, CARB], ['H', 'Hydrogen', 10, ELEC],
      ['N', 'Nitrogen', 3, 'var(--t-teal)'], ['+', 'Others', 4, 'var(--t-muted)']
    ];
    let bars = '';
    rows.forEach((r, i) => {
      const y = 44 + i * 30, w = r[2] * K, s = 0.04 + i * 0.07, e = s + 0.2;
      const kt = `0;${s.toFixed(2)};${e.toFixed(2)};0.94;1`;
      bars += `<circle cx="20" cy="${y + 10}" r="12" fill="${r[3]}"/>` +
        `<text x="20" y="${y + 15}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${r[0]}</text>` +
        `<text x="40" y="${y + 15}" font-size="14" fill="var(--t-ink)">${r[1]}</text>` +
        `<rect x="${X0 + 20}" y="${y}" height="20" rx="4" fill="${r[3]}" width="0"><animate attributeName="width" values="0;0;${w.toFixed(1)};${w.toFixed(1)};0" keyTimes="${kt}" dur="${D}s" repeatCount="indefinite"/></rect>` +
        `<text x="${(X0 + 28 + w).toFixed(1)}" y="${y + 15}" font-size="14" font-weight="700" fill="var(--t-ink)" opacity="0">${r[2]}%<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${e.toFixed(2)};${(e + 0.04).toFixed(2)};0.94;1" dur="${D}s" repeatCount="indefinite"/></text>`;
    });
    atomsEx.push({
      kind: 'example',
      title: 'Real life: The atoms in you',
      text: '<p>You are built from the same atoms as everything else! By mass, your body is about <b>65% oxygen</b>, <b>18% carbon</b>, <b>10% hydrogen</b> and <b>3% nitrogen</b>. A few other elements, like calcium, make up the rest.</p>',
      svg: TutorialKit.svg(`
        <text x="200" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-ink)">What a person is made of (by mass)</text>
        ${bars}
        <text x="200" y="210" text-anchor="middle" font-size="13" fill="var(--t-muted)">By count, hydrogen atoms are the most common,</text>
        <text x="200" y="228" text-anchor="middle" font-size="13" fill="var(--t-muted)">but they are so light they make only ~10% of your mass.</text>`)
    });
  })();
  // @@ATOMS-PUSH

  addTutorialSteps('chemistry', 'atoms', atomsEx, [
    { term: 'Static electricity', definition: 'Electric charge that builds up on an object when electrons move onto it or off it, like a rubbed balloon.' }
  ]);

  // ====================================================================
  // MOLECULES
  // ====================================================================
  const moleculesEx = [];
  // ---- Real life: why ice floats (interactive temperature slider)
  moleculesEx.push({
    kind: 'example',
    title: 'Real life: Why ice floats',
    text: '<p>Why does ice float? In ice, water molecules lock into an <b>open hexagon pattern</b> with gaps. In liquid water they pack closer together. So ice is <b>less dense</b> and floats. Slide the temperature!</p>',
    mount(el, api) {
      el.innerHTML =
        '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' +
        '<div class="scene-slider-row"><span>Temp</span><input type="range" id="exmol-temp" min="-10" max="20" step="1" value="-6" aria-label="Water temperature"><span id="exmol-tv" style="min-width:52px;text-align:right">-6 °C</span></div>';
      const svg = el.querySelector('svg');
      const XL = 48, XR = 182, YB = 174, R = 20, S3 = Math.sqrt(3);
      // honeycomb (hexagon vertices) = the open lattice of ice
      const pts = [];
      for (let r = -2; r < 9; r++) for (let q = -2; q < 9; q++) {
        const hx = 30 + R * S3 * (q + r / 2), hy = 60 + R * 1.5 * r;
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 6 + k * Math.PI / 3, x = hx + R * Math.cos(a), y = hy + R * Math.sin(a);
          if (x > XL && x < XR && y > 84 && y < YB + 4 && !pts.some(p => Math.hypot(p[0] - x, p[1] - y) < 4)) pts.push([x, y]);
        }
      }
      const maxY = Math.max(...pts.map(p => p[1]));
      pts.forEach(p => { p[1] += YB - maxY; });
      const minY = Math.min(...pts.map(p => p[1]));
      const iceH = YB - minY + 12, liqH = iceH * 0.8;
      const water = svgEl('rect', { x: 34, width: 162, fill: 'var(--t-blue)' }, svg);
      const surf = svgEl('rect', { x: 34, height: 3, width: 162, fill: 'var(--t-blue)' }, svg);
      svgEl('path', { d: 'M32 30 L32 182 Q32 186 36 186 L194 186 Q198 186 198 182 L198 30', fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 3 }, svg);
      const eg = svgEl('g', { stroke: 'var(--t-blue)', 'stroke-width': 2, 'stroke-dasharray': '3 3' }, svg);
      const edges = [];
      pts.forEach((a, i) => pts.forEach((b, j) => { if (j > i && Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1]) - R) < 2) edges.push([i, j, svgEl('line', {}, eg)]); }));
      const mols = pts.map((p, i) => {
        const g = svgEl('g', {}, svg);
        [-1, 1].forEach(s => svgEl('line', { x1: 0, y1: 0, x2: s * 6.5, y2: 5, stroke: '#9ca3af', 'stroke-width': 2 }, g));
        svgEl('circle', { r: 5.5, fill: RED }, g);
        [-1, 1].forEach(s => svgEl('circle', { cx: s * 6.5, cy: 5, r: 3.6, fill: ELEC }, g));
        return { g, tx: p[0], ty: p[1], x: p[0], y: p[1], vx: 0, vy: 0, rot: (i % 3) * 60 - 30, w: (Math.random() - 0.5) * 60, ph: i * 1.7 };
      });
      const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
      const tTemp = T(216, 44, 26, 700, 'var(--t-ink)');
      const tState = T(216, 72, 16, 700, 'var(--primary)');
      const l1 = T(216, 100, 13, 400, 'var(--t-ink)'), l2 = T(216, 118, 13, 400, 'var(--t-ink)'), l3 = T(216, 136, 13, 400, 'var(--t-ink)');
      const tDen = T(216, 162, 14, 700, 'var(--t-orange)');
      T(216, 182, 13, 400, 'var(--t-muted)').textContent = '(gaps exaggerated)';
      const slider = el.querySelector('#exmol-temp'), tv = el.querySelector('#exmol-tv');
      let f = 1, wasIce = true;   // f: 1 = ice, 0 = liquid
      const words = {
        ice: ['Molecules lock into an', 'open hexagon pattern', 'with empty gaps.', 'Less dense: it floats!'],
        liq: ['Molecules tumble and', 'slide past each other,', 'packed closer together.', 'More dense than ice.']
      };
      function labels() {
        const t = +slider.value, ice = t <= 0;
        tv.textContent = t + ' °C';
        tTemp.textContent = t + ' °C';
        tState.textContent = t < 0 ? 'Solid ice' : t === 0 ? 'Freezing point' : 'Liquid water';
        const w = ice ? words.ice : words.liq;
        l1.textContent = w[0]; l2.textContent = w[1]; l3.textContent = w[2]; tDen.textContent = w[3];
      }
      slider.addEventListener('input', labels);
      labels();
      api.loop((t, dt) => {
        const ice = +slider.value <= 0;
        if (wasIce && !ice) mols.forEach(m => { const a = Math.random() * 6.28; m.vx = Math.cos(a) * 30; m.vy = Math.sin(a) * 30; });
        wasIce = ice;
        f += ((ice ? 1 : 0) - f) * Math.min(1, dt * 2.5);
        const h = liqH + (iceH - liqH) * f, top = YB + 8 - h;
        water.setAttribute('y', top.toFixed(1)); water.setAttribute('height', (186 - top).toFixed(1));
        water.setAttribute('opacity', (0.2 + 0.1 * f).toFixed(2));
        surf.setAttribute('y', (top - 1.5).toFixed(1)); surf.setAttribute('opacity', 0.6);
        mols.forEach(m => {
          if (ice) {
            m.vx = m.vy = 0;
            const jx = Math.sin(t * 7 + m.ph) * 1.4, jy = Math.cos(t * 6 + m.ph * 1.3) * 1.4;
            m.x += (m.tx + jx - m.x) * Math.min(1, dt * 5);
            m.y += (m.ty + jy - m.y) * Math.min(1, dt * 5);
            m.rot += (Math.round(m.rot / 60) * 60 - m.rot) * Math.min(1, dt * 3);
          } else {
            m.vx += (Math.random() - 0.5) * 300 * dt; m.vy += (Math.random() - 0.5) * 300 * dt;
            const sp = Math.hypot(m.vx, m.vy), lim = 34;
            if (sp > lim) { m.vx *= lim / sp; m.vy *= lim / sp; }
            m.x += m.vx * dt; m.y += m.vy * dt; m.rot += m.w * dt;
            if (m.x < XL - 4) { m.x = XL - 4; m.vx = Math.abs(m.vx); }
            if (m.x > XR + 4) { m.x = XR + 4; m.vx = -Math.abs(m.vx); }
            if (m.y < top + 8) { m.y = top + 8; m.vy = Math.abs(m.vy); }
            if (m.y > YB + 2) { m.y = YB + 2; m.vy = -Math.abs(m.vy); }
          }
        });
        if (!ice) {
          for (let i = 0; i < mols.length; i++) for (let j = i + 1; j < mols.length; j++) {
            const a = mols[i], b = mols[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
            if (d > 0.1 && d < 14) { const push = (14 - d) / 2 / d; a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push; }
          }
        }
        mols.forEach(m => m.g.setAttribute('transform', `translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${m.rot.toFixed(0)}) scale(0.8)`));
        eg.setAttribute('opacity', (f * f * 0.7).toFixed(2));
        if (f > 0.02) edges.forEach(([i, j, ln]) => { ln.setAttribute('x1', mols[i].x.toFixed(1)); ln.setAttribute('y1', mols[i].y.toFixed(1)); ln.setAttribute('x2', mols[j].x.toFixed(1)); ln.setAttribute('y2', mols[j].y.toFixed(1)); });
      });
    }
  });
  // ---- Real life: breathing O2 in, CO2 out (SMIL)
  (function () {
    const O = '<circle r="9" fill="' + RED + '"/>', C = '<circle r="9" fill="' + CARB + '"/>';
    const dbl = (x1, x2) => `<line x1="${x1}" y1="-2.5" x2="${x2}" y2="-2.5" stroke="#9ca3af" stroke-width="2.5"/><line x1="${x1}" y1="2.5" x2="${x2}" y2="2.5" stroke="#9ca3af" stroke-width="2.5"/>`;
    const o2 = dbl(-10, 10) + `<g transform="translate(-10 0)">${O}</g><g transform="translate(10 0)">${O}</g>`;
    const co2 = dbl(-24, 24) + `<g transform="translate(-24 0)">${O}</g>${C}<g transform="translate(24 0)">${O}</g>`;
    const mover = (inner, x0, x1, y, begin) =>
      `<g opacity="0">${inner}<animateTransform attributeName="transform" type="translate" values="${x0} ${y};${x1} ${y}" dur="4s" begin="${begin}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="4s" begin="${begin}s" repeatCount="indefinite"/></g>`;
    let flow = '';
    [[62, 0], [104, 1.3], [146, 2.6]].forEach(([y, b]) => {
      flow += mover(o2, 46, 132, y, b) + mover(co2, 296, 364, y + 0, b + 0.65);
    });
    {
      moleculesEx.push({
        kind: 'example',
        title: 'Real life: Breathing gases',
        text: '<p>Each breath swaps gases. You breathe in <b>oxygen (O<sub>2</sub>)</b>, two oxygen atoms joined by a double bond. You breathe out <b>carbon dioxide (CO<sub>2</sub>)</b>: one carbon atom bonded to two oxygen atoms.</p>',
        svg: TutorialKit.svg(`
          <text x="90" y="24" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-blue)">Breathe in ➜</text>
          <text x="310" y="24" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-orange)">Breathe out ➜</text>
          <path d="M200 40 L200 76" stroke="#db2777" stroke-width="6" stroke-linecap="round"/>
          <g transform="translate(200 108)"><g><ellipse cx="-28" cy="0" rx="30" ry="50" fill="#fbcfe8" stroke="#db2777" stroke-width="2.5"/><ellipse cx="28" cy="0" rx="30" ry="50" fill="#fbcfe8" stroke="#db2777" stroke-width="2.5"/><animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="4s" repeatCount="indefinite"/></g></g>
          <text x="200" y="118" text-anchor="middle" font-size="14" font-weight="700" fill="#9d174d">Lungs</text>
          ${flow}
          <text x="90" y="192" text-anchor="middle" font-size="14" font-weight="700" fill="${RED}">O₂: 2 oxygen atoms</text>
          <text x="310" y="192" text-anchor="middle" font-size="14" font-weight="700" fill="${CARB}">CO₂: 1 carbon + 2 oxygen</text>
          <text x="200" y="222" text-anchor="middle" font-size="13" fill="var(--t-muted)">Your cells use O₂ to release energy from food, making CO₂.</text>`)
      });
    }
  })();
  // ---- Real life: salt vs sugar dissolving (interactive: pick the crystal)
  moleculesEx.push({
    kind: 'example',
    title: 'Real life: Salt vs sugar in water',
    text: '<p>Stir salt or sugar into water and both vanish. But salt is <b>ionic</b>: it splits into separate Na<sup>+</sup> and Cl<sup>−</sup> ions. Sugar is made of <b>molecules</b> that leave the crystal whole. Try both!</p>',
    mount(el, api) {
      el.innerHTML =
        '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' +
        '<div class="scene-slider-row" style="justify-content:center;gap:8px"><button type="button" class="scene-btn" id="exmol-salt">Salt</button><button type="button" class="scene-btn" id="exmol-sugar">Sugar</button><button type="button" class="scene-btn" id="exmol-again">Restart</button></div>';
      const svg = el.querySelector('svg');
      const X0 = 44, X1 = 236, Y0 = 62, Y1 = 178, NW = 26, NP = 12;
      svgEl('rect', { x: 34, y: 54, width: 210, height: 130, fill: 'var(--t-blue)', opacity: 0.18 }, svg);
      const wave = svgEl('path', { d: 'M22 54 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0', fill: 'none', stroke: 'var(--t-blue)', 'stroke-width': 2.5, opacity: 0.7 }, svg);
      svgEl('animateTransform', { attributeName: 'transform', type: 'translate', values: '0 0;24 0', dur: '1.6s', repeatCount: 'indefinite' }, wave);
      const clip = svgEl('clipPath', { id: 'exmol-clip' }, svg);
      svgEl('rect', { x: 34, y: 30, width: 210, height: 40 }, clip);
      wave.setAttribute('clip-path', 'url(#exmol-clip)');
      const wg = svgEl('g', {}, svg), pg = svgEl('g', {}, svg);
      svgEl('path', { d: 'M32 30 L32 182 Q32 186 36 186 L242 186 Q246 186 246 182 L246 30', fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 3 }, svg);
      const waters = [];
      for (let i = 0; i < NW; i++) {
        const g = svgEl('g', {}, wg);
        [-1, 1].forEach(s => svgEl('circle', { cx: s * 4.5, cy: 3.5, r: 2.4, fill: ELEC }, g));
        svgEl('circle', { r: 3.6, fill: RED }, g);
        waters.push({ g, x: X0 + Math.random() * (X1 - X0), y: Y0 + Math.random() * (Y1 - Y0), a: Math.random() * 6.28, r: Math.random() * 360 });
      }
      const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
      const title = T(258, 42, 15, 700, 'var(--primary)');
      const lines = [0, 1, 2, 3].map(i => T(258, 70 + i * 19, 13, 400, 'var(--t-ink)'));
      const count = T(258, 168, 13, 700, 'var(--t-orange)');
      const info = {
        salt: ['Salt in water', ['Water pulls the ions', 'apart. Each Na⁺ and', 'Cl⁻ floats free on', 'its own.'], ' ions free'],
        sugar: ['Sugar in water', ['Whole sugar molecules', 'break away from the', 'crystal and stay in', 'one piece.'], ' molecules free']
      };
      let mode = 'salt', parts = [], free = 0, nextAt = 0, doneAt = 0, lastT = 0;
      function build() {
        pg.innerHTML = '';
        parts = [];
        for (let i = 0; i < NP; i++) {
          const c = i % 4, r = Math.floor(i / 4), g = svgEl('g', {}, pg);
          const cl = (c + r) % 2 === 1;
          if (mode === 'salt') {
            svgEl('circle', { r: cl ? 9 : 7, fill: cl ? 'var(--t-green)' : 'var(--t-orange)', stroke: '#fff', 'stroke-width': 1 }, g);
            const tx = svgEl('text', { y: 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }, g);
            tx.textContent = cl ? '−' : '+';
          } else {
            svgEl('polygon', { points: '0,-9 8,-4.5 8,4.5 0,9 -8,4.5 -8,-4.5', fill: '#f5b301', stroke: '#b45309', 'stroke-width': 1.5 }, g);
            svgEl('circle', { r: 2.5, fill: '#b45309' }, g);
          }
          const x = 62 + c * 18, y = 173 - r * 18;
          parts.push({ g, x, y, free: false, a: Math.random() * 6.28, order: r * 10 - c });
        }
        parts.sort((p, q) => q.order - p.order).forEach((p, i) => { p.k = i; });
        free = 0; nextAt = lastT + 0.9; doneAt = 0;
        title.textContent = info[mode][0];
        info[mode][1].forEach((s, i) => { lines[i].textContent = s; });
        el.querySelector('#exmol-salt').style.borderColor = mode === 'salt' ? 'var(--primary)' : '';
        el.querySelector('#exmol-sugar').style.borderColor = mode === 'sugar' ? 'var(--primary)' : '';
      }
      el.querySelector('#exmol-salt').addEventListener('click', () => { mode = 'salt'; build(); });
      el.querySelector('#exmol-sugar').addEventListener('click', () => { mode = 'sugar'; build(); });
      el.querySelector('#exmol-again').addEventListener('click', build);
      build();
      const step = (p, sp, dt) => {
        p.a += (Math.random() - 0.5) * 9 * dt;
        p.x += Math.cos(p.a) * sp * dt; p.y += Math.sin(p.a) * sp * dt;
        if (p.x < X0) { p.x = X0; p.a = Math.PI - p.a; } if (p.x > X1) { p.x = X1; p.a = Math.PI - p.a; }
        if (p.y < Y0) { p.y = Y0; p.a = -p.a; } if (p.y > Y1) { p.y = Y1; p.a = -p.a; }
      };
      api.loop((t, dt) => {
        lastT = t;
        if (free < NP && t >= nextAt) { parts[free].free = true; free++; nextAt = t + 0.9; }
        if (free === NP) { if (!doneAt) doneAt = t; else if (t - doneAt > 4.5) build(); }
        waters.forEach(w => {
          step(w, 26, dt); w.r += 40 * dt;
          w.g.setAttribute('transform', `translate(${w.x.toFixed(1)} ${w.y.toFixed(1)}) rotate(${w.r.toFixed(0)})`);
        });
        parts.forEach(p => {
          if (p.free) step(p, 20, dt);
          p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        });
        count.textContent = free + '/' + NP + info[mode][2];
      });
    }
  });
  // @@MOLECULES-PUSH

  addTutorialSteps('chemistry', 'molecules', moleculesEx);

  // ====================================================================
  // MIXTURES
  // ====================================================================
  const mixturesEx = [];
  // ---- Real life: oil and water (interactive: shake the jar)
  mixturesEx.push({
    kind: 'example',
    title: 'Real life: Oil and water',
    text: '<p>Shake salad dressing and the oil breaks into tiny droplets, but it never truly mixes. Oil and water are <b>immiscible</b>. Oil is <b>less dense</b>, so the droplets rise and join into a layer on top again.</p>',
    mount(el, api) {
      el.innerHTML =
        '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' +
        '<div class="scene-slider-row" style="justify-content:center"><button type="button" class="scene-btn" id="exmix-shake">Shake the jar!</button></div>';
      const svg = el.querySelector('svg');
      const XL = 50, XR = 210, TOP = 62, BOT = 176, N = 20, K = 1.4;
      const jar = svgEl('g', {}, svg);
      svgEl('rect', { x: 46, y: TOP, width: 168, height: BOT + 4 - TOP, fill: 'var(--t-blue)', opacity: 0.28 }, jar);
      const layer = svgEl('rect', { x: 46, y: TOP, width: 168, height: 0, fill: '#facc15', opacity: 0.8 }, jar);
      const dg = svgEl('g', {}, jar);
      svgEl('path', { d: 'M44 40 L44 176 Q44 182 50 182 L210 182 Q216 182 216 176 L216 40', fill: 'none', stroke: 'var(--t-ink)', 'stroke-width': 3 }, jar);
      svgEl('rect', { x: 40, y: 28, width: 182, height: 12, rx: 4, fill: 'var(--t-muted)' }, jar);
      const drops = [];
      for (let i = 0; i < N; i++) {
        const r = 4.5 + (i * 7 % 5) * 1.1;
        const c = svgEl('circle', { r, fill: '#facc15', stroke: '#ca8a04', 'stroke-width': 1.5, opacity: 0 }, dg);
        drops.push({ c, r, x: 0, y: 0, vx: 0, vy: 0, merged: true });
      }
      const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
      T(236, 44, 15, 700, 'var(--primary)').textContent = 'Oil + water';
      const d1 = T(236, 72, 13, 400, 'var(--t-ink)'), d2 = T(236, 90, 13, 400, 'var(--t-ink)'), d3 = T(236, 108, 13, 400, 'var(--t-ink)');
      T(236, 146, 13, 400, 'var(--t-muted)').textContent = 'Oil and water are';
      T(236, 166, 15, 700, 'var(--t-orange)').textContent = 'immiscible.';
      let E = 0, lastT = 0, auto = true, H = 20;
      const shake = () => {
        E = 1;
        drops.forEach(d => {
          d.merged = false;
          d.x = XL + 8 + Math.random() * (XR - XL - 16); d.y = TOP + 12 + Math.random() * (BOT - TOP - 24);
          d.vx = (Math.random() - 0.5) * 80; d.vy = (Math.random() - 0.5) * 80;
        });
      };
      el.querySelector('#exmix-shake').addEventListener('click', () => { auto = false; shake(); });
      // start as two settled layers
      H = drops.reduce((s, d) => s + Math.PI * d.r * d.r, 0) / (XR - XL) * K;
      layer.setAttribute('height', H.toFixed(1));
      api.loop((t, dt) => {
        lastT = t;
        if (auto && t > 0.4) { auto = false; shake(); }
        E = Math.max(0, E - dt * 0.32);
        const shaking = E > 0.25;
        const jx = shaking ? Math.sin(t * 45) * 5 * E : 0, jy = shaking ? Math.cos(t * 38) * 2 * E : 0;
        jar.setAttribute('transform', `translate(${jx.toFixed(1)} ${jy.toFixed(1)})`);
        let area = 0, loose = 0;
        drops.forEach(d => { if (d.merged) area += Math.PI * d.r * d.r; else loose++; });
        H = area / (XR - XL) * K;
        layer.setAttribute('height', H.toFixed(1));
        drops.forEach(d => {
          if (d.merged) { d.c.setAttribute('opacity', 0); return; }
          if (shaking) {
            d.vx += (Math.random() - 0.5) * 900 * E * dt; d.vy += (Math.random() - 0.5) * 900 * E * dt;
            const sp = Math.hypot(d.vx, d.vy), lim = 40 + 110 * E;
            if (sp > lim) { d.vx *= lim / sp; d.vy *= lim / sp; }
          } else {
            d.vx *= 1 - Math.min(1, dt * 3);
            d.vy += (-(14 + d.r * 4) - d.vy) * Math.min(1, dt * 3);
          }
          d.x += d.vx * dt; d.y += d.vy * dt;
          if (d.x < XL + d.r) { d.x = XL + d.r; d.vx = Math.abs(d.vx); }
          if (d.x > XR - d.r) { d.x = XR - d.r; d.vx = -Math.abs(d.vx); }
          if (d.y > BOT - d.r) { d.y = BOT - d.r; d.vy = -Math.abs(d.vy); }
          if (d.y < TOP + d.r) { d.y = TOP + d.r; d.vy = Math.abs(d.vy); }
          if (!shaking && d.y - d.r <= TOP + H + 1) d.merged = true;
          d.c.setAttribute('cx', d.x.toFixed(1)); d.c.setAttribute('cy', d.y.toFixed(1)); d.c.setAttribute('opacity', 0.9);
        });
        if (shaking) { d1.textContent = 'Shaking breaks the oil'; d2.textContent = 'into tiny droplets.'; d3.textContent = ''; }
        else if (loose > 0) { d1.textContent = 'Oil is less dense, so'; d2.textContent = 'the droplets rise and'; d3.textContent = 'join together.'; }
        else { d1.textContent = 'Two layers again:'; d2.textContent = 'oil floats on water.'; d3.textContent = ''; }
      });
    }
  });
  // ---- Real life: ink chromatography (SMIL): one black dot splits into colours
  (function () {
    const D = 10, XC = 160, Y0 = 160, WATER = 176, FRONT = 62;
    const dyes = [
      ['Yellow', '#eab308', 84, 90], ['Red', '#dc2626', 112, 118], ['Blue', 'var(--t-blue)', 138, 144]
    ];
    const kt = (...a) => a.join(';');
    let blobs = '', labels = '';
    dyes.forEach(([name, col, yEnd, yLab]) => {
      blobs += `<ellipse cx="${XC}" cy="${Y0}" rx="9" ry="5" fill="${col}" opacity="0">` +
        `<animate attributeName="cy" values="${Y0};${Y0};${yEnd};${yEnd};${Y0}" keyTimes="${kt(0, 0.12, 0.8, 0.97, 1)}" dur="${D}s" repeatCount="indefinite"/>` +
        `<animate attributeName="ry" values="5;5;9;9;5" keyTimes="${kt(0, 0.12, 0.8, 0.97, 1)}" dur="${D}s" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="${kt(0, 0.12, 0.2, 0.97, 0.99, 1)}" dur="${D}s" repeatCount="indefinite"/></ellipse>`;
      labels += `<text x="192" y="${yLab}" font-size="14" font-weight="700" fill="${col}" opacity="0">${name}` +
        `<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="${kt(0, 0.72, 0.8, 0.97, 0.99, 1)}" dur="${D}s" repeatCount="indefinite"/></text>`;
    });
    const lines = ['Water climbs up the', 'paper, carrying the', 'dyes with it. Dyes', 'that dissolve best', 'travel the farthest.'];
    mixturesEx.push({
      kind: 'example',
      title: 'Real life: Ink colors split apart',
      text: '<p>Black marker ink is often a mixture of dyes! Dip paper in water and the water creeps up, carrying each dye a different distance. This way of separating a mixture is called <b>chromatography</b>.</p>',
      svg: TutorialKit.svg(`
        <rect x="140" y="40" width="40" height="164" fill="#fff" stroke="var(--t-muted)" stroke-width="2"/>
        <rect x="141" y="${WATER}" width="38" height="0" fill="var(--t-blue)" opacity="0.3"><animate attributeName="y" values="${WATER};${WATER};${FRONT};${FRONT};${WATER}" keyTimes="${kt(0, 0.02, 0.8, 0.97, 1)}" dur="${D}s" repeatCount="indefinite"/><animate attributeName="height" values="0;0;${WATER - FRONT};${WATER - FRONT};0" keyTimes="${kt(0, 0.02, 0.8, 0.97, 1)}" dur="${D}s" repeatCount="indefinite"/></rect>
        <line x1="140" y1="${Y0}" x2="180" y2="${Y0}" stroke="var(--t-muted)" stroke-width="1.5" stroke-dasharray="4 3"/>
        <circle cx="${XC}" cy="${Y0}" r="7" fill="#111827"><animate attributeName="opacity" values="1;1;0;0;1" keyTimes="${kt(0, 0.12, 0.28, 0.98, 1)}" dur="${D}s" repeatCount="indefinite"/></circle>
        ${blobs}
        <line x1="112" y1="40" x2="208" y2="40" stroke="#a16207" stroke-width="7" stroke-linecap="round"/>
        <rect x="102" y="${WATER}" width="116" height="40" fill="var(--t-blue)" opacity="0.3"/>
        <path d="M100 172 L100 212 Q100 220 108 220 L212 220 Q220 220 220 212 L220 172" fill="none" stroke="var(--t-ink)" stroke-width="3"/>
        <text x="132" y="${Y0 + 4}" text-anchor="end" font-size="13" fill="var(--t-muted)">Start</text>
        ${labels}
        <text x="262" y="60" font-size="14" font-weight="700" fill="var(--primary)">Chromatography</text>
        ${lines.map((l, i) => `<text x="262" y="${86 + i * 20}" font-size="13" fill="var(--t-ink)">${l}</text>`).join('')}
        <text x="132" y="234" font-size="13" fill="var(--t-muted)" text-anchor="middle">Paper hangs in a little water</text>`)
    });
  })();
  // ---- Real life: air is a mixture of gases (interactive: highlight one gas)
  mixturesEx.push({
    kind: 'example',
    title: 'Real life: Air is a mixture',
    text: '<p>The air around you is a <b>mixture</b> of gases: about <b>78% nitrogen</b>, <b>21% oxygen</b> and 1% other gases like argon. They are just mixed, not bonded together, so each gas keeps its own properties.</p>',
    mount(el, api) {
      el.innerHTML =
        '<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%"></svg>' +
        '<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;gap:6px">' +
        [['all', 'All'], ['N', 'Nitrogen'], ['O', 'Oxygen'], ['X', 'Other']].map(k => `<button type="button" class="scene-btn" data-k="${k[0]}" style="padding:4px 9px">${k[1]}</button>`).join('') + '</div>';
      const svg = el.querySelector('svg');
      const X0 = 26, X1 = 244, Y0 = 36, Y1 = 176;
      svgEl('rect', { x: 20, y: 30, width: 230, height: 152, rx: 10, fill: '#fff', stroke: 'var(--t-ink)', 'stroke-width': 3 }, svg);
      const NCOL = 'var(--t-blue)', OCOL = RED, XCOL = 'var(--t-green)';
      const kinds = [['N', 39, NCOL], ['O', 10, OCOL], ['X', 1, XCOL]];
      const gas = [];
      kinds.forEach(([k, n, col]) => {
        for (let i = 0; i < n; i++) {
          const g = svgEl('g', {}, svg);
          if (k === 'X') svgEl('circle', { r: 7, fill: col }, g);
          else [-5, 5].forEach(x => svgEl('circle', { cx: x, r: 5.5, fill: col }, g));
          const a = Math.random() * 6.28;
          gas.push({ k, g, x: X0 + 10 + Math.random() * (X1 - X0 - 20), y: Y0 + 10 + Math.random() * (Y1 - Y0 - 20), vx: Math.cos(a) * 45, vy: Math.sin(a) * 45, r: Math.random() * 360, w: (Math.random() - 0.5) * 120 });
        }
      });
      const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
      const rows = [['Nitrogen (N₂)', 'about 78%', NCOL, 'N'], ['Oxygen (O₂)', 'about 21%', OCOL, 'O'], ['Other gases', 'about 1%', XCOL, 'X']];
      const rowEls = rows.map(([name, pct, col, k], i) => {
        const y = 52 + i * 46, g = svgEl('g', {}, svg);
        svgEl('circle', { cx: 272, cy: y - 4, r: 7, fill: col }, g);
        const a = svgEl('text', { x: 288, y, 'font-size': 14, 'font-weight': 700, fill: 'var(--t-ink)' }, g); a.textContent = name;
        const b = svgEl('text', { x: 288, y: y + 20, 'font-size': 14, fill: 'var(--t-muted)' }, g); b.textContent = pct;
        return { k, g };
      });
      let mode = 'all';
      const paint = () => {
        el.querySelectorAll('button').forEach(b => { b.style.borderColor = b.dataset.k === mode ? 'var(--primary)' : ''; b.style.color = b.dataset.k === mode ? 'var(--primary)' : ''; });
        rowEls.forEach(r => r.g.setAttribute('opacity', mode === 'all' || mode === r.k ? 1 : 0.3));
      };
      el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.k; paint(); }));
      paint();
      api.loop((t, dt) => {
        gas.forEach(p => {
          p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.w * dt;
          if (p.x < X0 + 8) { p.x = X0 + 8; p.vx = Math.abs(p.vx); } if (p.x > X1 - 8) { p.x = X1 - 8; p.vx = -Math.abs(p.vx); }
          if (p.y < Y0 + 8) { p.y = Y0 + 8; p.vy = Math.abs(p.vy); } if (p.y > Y1 - 8) { p.y = Y1 - 8; p.vy = -Math.abs(p.vy); }
          p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.r.toFixed(0)})`);
          p.g.setAttribute('opacity', mode === 'all' || mode === p.k ? 1 : 0.15);
        });
      });
    }
  });
  // @@MIXTURES-PUSH

  addTutorialSteps('chemistry', 'mixtures', mixturesEx, [
    { term: 'Immiscible', definition: 'Liquids that will not mix, like oil and water; they form separate layers.' },
    { term: 'Chromatography', definition: 'Separating a mixture by letting a liquid carry its parts different distances along paper.' }
  ]);
})();
