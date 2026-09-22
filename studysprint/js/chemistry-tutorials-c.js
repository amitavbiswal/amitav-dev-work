(function () {
  // Chemistry tutorials (part c): Acids & Bases, Periodic Table.
  // Registered via registerTutorial('chemistry', topicId, {...}).

  // ---- shared helpers ----------------------------------------------------
  const SVGNS = 'http://www.w3.org/2000/svg';

  // Universal-indicator style color for a pH value (0 red ... 7 green ... 14 purple).
  const PH_STOPS = [
    [0, [229, 50, 45]], [3, [242, 140, 40]], [5, [245, 208, 32]],
    [7, [63, 185, 80]], [10, [59, 130, 246]], [14, [124, 58, 237]]
  ];
  function phColor(ph) {
    const p = Math.max(0, Math.min(14, ph));
    for (let i = 1; i < PH_STOPS.length; i++) {
      if (p <= PH_STOPS[i][0]) {
        const [p0, c0] = PH_STOPS[i - 1];
        const [p1, c1] = PH_STOPS[i];
        const f = (p - p0) / (p1 - p0);
        return 'rgb(' + c0.map((v, k) => Math.round(v + (c1[k] - v) * f)).join(',') + ')';
      }
    }
    return 'rgb(124,58,237)';
  }

  // A beaker: outline + liquid. (x, y) top-left, w, h, liquid top offset from y.
  function beaker(x, y, w, h, liquidFill, level, idPrefix) {
    const yt = y + level, yb = y + h - 2, r = 12;
    const liquid = 'M' + (x + 2) + ',' + yt + ' H' + (x + w - 2) + ' V' + (yb - r) +
      ' Q' + (x + w - 2) + ',' + yb + ' ' + (x + w - 2 - r) + ',' + yb +
      ' H' + (x + 2 + r) + ' Q' + (x + 2) + ',' + yb + ' ' + (x + 2) + ',' + (yb - r) + ' Z';
    return '<path id="' + idPrefix + '-liq" d="' + liquid + '" fill="' + liquidFill + '" opacity="0.75"/>' +
      '<path d="M' + (x - 6) + ',' + (y - 4) + ' L' + x + ',' + y + ' V' + (y + h - r) +
      ' Q' + x + ',' + (y + h) + ' ' + (x + r) + ',' + (y + h) + ' H' + (x + w - r) +
      ' Q' + (x + w) + ',' + (y + h) + ' ' + (x + w) + ',' + (y + h - r) + ' V' + y +
      ' L' + (x + w + 6) + ',' + (y - 4) + '" fill="none" stroke="var(--t-ink)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
  }

  // A static-position ion that gently wobbles (SMIL). cx, cy = home position.
  function ion(cx, cy, label, fill, dur, dx, dy) {
    const v = '0 0; ' + dx + ' ' + (-dy) + '; ' + (-dx) + ' ' + dy + '; ' + (dx * 0.5) + ' ' + dy + '; 0 0';
    return '<g><animateTransform attributeName="transform" type="translate" values="' + v +
      '" dur="' + dur + 's" repeatCount="indefinite"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="14" fill="' + fill + '" stroke="#fff" stroke-width="1.5"/>' +
      '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">' + label + '</text></g>';
  }

  // Nudge overlapping circular particles ({x, y}) apart so they never pile up.
  function separate(list, minD, box) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < minD) {
          if (d < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
          const dd = Math.hypot(dx, dy) || 1;
          const push = (minD - d) / 2 * 0.5;
          a.x -= dx / dd * push; a.y -= dy / dd * push;
          b.x += dx / dd * push; b.y += dy / dd * push;
        }
      }
    }
    list.forEach(p => {
      p.x = Math.max(box.x0, Math.min(box.x1, p.x));
      p.y = Math.max(box.y0, Math.min(box.y1, p.y));
    });
  }

  // @@HELPERS-END

  // =====================================================================
  // ACIDS & BASES
  // =====================================================================
  const acidSteps = [];

  // Step 1: what acids and bases release in water
  acidSteps.push({
    title: 'Acids and bases in water',
    text: '<p>Lemons and vinegar are <b>acids</b>: in water they release <b>hydrogen ions (H<sup>+</sup>)</b>. Soap and baking soda are <b>bases</b>: they release <b>hydroxide ions (OH<sup>-</sup>)</b>.</p>',
    svg: TutorialKit.svg(
      '<text x="105" y="26" text-anchor="middle" font-size="16" font-weight="700" fill="var(--t-red)">Acid</text>' +
      '<text x="295" y="26" text-anchor="middle" font-size="16" font-weight="700" fill="var(--t-blue)">Base</text>' +
      beaker(30, 42, 150, 150, '#fde7d9', 40, 'aci1a') +
      beaker(220, 42, 150, 150, '#dbeafe', 40, 'aci1b') +
      ion(65, 120, 'H⁺', '#e5322d', 3.1, 8, 6) + ion(105, 100, 'H⁺', '#e5322d', 2.6, 7, 9) +
      ion(145, 130, 'H⁺', '#e5322d', 3.4, 9, 5) + ion(80, 165, 'H⁺', '#e5322d', 2.9, 10, 4) +
      ion(135, 170, 'Cl⁻', '#94a3b8', 3.3, 6, 6) + ion(105, 140, 'Cl⁻', '#94a3b8', 2.8, 7, 7) +
      ion(255, 120, 'OH⁻', '#2563eb', 3.0, 8, 6) + ion(300, 100, 'OH⁻', '#2563eb', 2.7, 7, 9) +
      ion(345, 130, 'OH⁻', '#2563eb', 3.5, 6, 5) + ion(270, 168, 'OH⁻', '#2563eb', 2.9, 9, 4) +
      ion(335, 172, 'Na⁺', '#94a3b8', 3.2, 6, 6) + ion(300, 145, 'Na⁺', '#94a3b8', 2.6, 7, 7) +
      '<text x="105" y="216" text-anchor="middle" font-size="14" fill="var(--t-ink)">HCl gives H⁺</text>' +
      '<text x="295" y="216" text-anchor="middle" font-size="14" fill="var(--t-ink)">NaOH gives OH⁻</text>' +
      '<text x="200" y="120" text-anchor="middle" font-size="22" fill="var(--t-muted)">vs</text>'
    )
  });

  // Step 2: the pH scale, with a pointer touring everyday substances
  acidSteps.push({
    title: 'The pH scale',
    text: '<p>The <b>pH scale</b> runs from 0 to 14. Below 7 is <b>acidic</b>, 7 is <b>neutral</b>, above 7 is <b>basic</b>. Each step is a <b>tenfold</b> change: pH 3 is 10 times more acidic than pH 4.</p>',
    mount(el, api) {
      const X0 = 20, UNIT = 360 / 14;
      const xs = ph => X0 + ph * UNIT;
      let grad = '';
      for (let i = 0; i <= 14; i++) grad += '<stop offset="' + (i / 14 * 100) + '%" stop-color="' + phColor(i) + '"/>';
      let ticks = '';
      for (let i = 0; i <= 14; i++) {
        ticks += '<text x="' + xs(i) + '" y="172" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">' + i + '</text>';
      }
      el.innerHTML = TutorialKit.svg(
        '<defs><linearGradient id="aci2-grad" x1="0" x2="1" y1="0" y2="0">' + grad + '</linearGradient></defs>' +
        '<text x="' + xs(3) + '" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-red)">ACIDIC</text>' +
        '<text x="' + xs(7) + '" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-green)">NEUTRAL</text>' +
        '<text x="' + xs(11) + '" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-blue)">BASIC</text>' +
        '<rect x="' + X0 + '" y="112" width="360" height="40" rx="8" fill="url(#aci2-grad)"/>' +
        ticks +
        '<g id="aci2-ptr"><path d="M0,110 L-9,94 L9,94 Z" fill="var(--t-ink)"/>' +
        '<rect id="aci2-box" x="-64" y="56" width="128" height="38" rx="8" fill="var(--t-ink)"/>' +
        '<text id="aci2-name" x="0" y="72" text-anchor="middle" font-size="14" font-weight="700" fill="#fff"></text>' +
        '<text id="aci2-val" x="0" y="88" text-anchor="middle" font-size="13" fill="#fff"></text></g>' +
        '<text x="200" y="204" text-anchor="middle" font-size="14" font-weight="700" fill="var(--primary)">Each step down = 10× more acidic</text>' +
        '<text x="200" y="224" text-anchor="middle" font-size="13" fill="var(--t-muted)">Never taste-test chemicals to find their pH!</text>'
      );
      const items = [
        ['Stomach acid', 1.5], ['Lemon juice', 2], ['Vinegar', 2.8], ['Coffee', 5],
        ['Milk', 6.5], ['Pure water', 7], ['Baking soda', 9], ['Soap', 10],
        ['Ammonia', 11], ['Bleach', 12.5]
      ];
      const ptr = el.querySelector('#aci2-ptr');
      const name = el.querySelector('#aci2-name');
      const val = el.querySelector('#aci2-val');
      let cur = xs(1.5), last = -1;
      api.loop((t, dt) => {
        const i = Math.floor(t / 2.2) % items.length;
        if (i !== last) {
          last = i;
          name.textContent = items[i][0];
          const p = items[i][1];
          val.textContent = 'pH ' + p + (p < 7 ? ' (acid)' : p > 7 ? ' (base)' : ' (neutral)');
        }
        cur += (xs(items[i][1]) - cur) * Math.min(1, dt * 4);
        const bx = Math.max(64 + 4, Math.min(400 - 68, cur));
        ptr.setAttribute('transform', 'translate(' + cur + ',0)');
        el.querySelector('#aci2-box').setAttribute('x', (bx - cur) - 64);
        name.setAttribute('x', bx - cur);
        val.setAttribute('x', bx - cur);
      });
    }
  });

  // Step 3: indicators (litmus paper dipped in acid / base)
  (function () {
    const RED = '#e5322d', BLUE = '#3b6fe0';
    // One dipping strip. cx = center x; from/to = wet-tip colors before/after; resultId label.
    function strip(cx, from, to) {
      const kt = '0;0.1;0.3;0.6;0.8;1';
      return '<g>' +
        '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 55;0 55;0 0;0 0" keyTimes="' + kt + '" dur="8s" repeatCount="indefinite"/>' +
        '<rect x="' + (cx - 11) + '" y="40" width="22" height="80" rx="2" fill="' + from + '" stroke="#fff" stroke-width="1"/>' +
        '<rect x="' + (cx - 11) + '" y="88" width="22" height="32" rx="2" fill="' + from + '">' +
        '<animate attributeName="fill" values="' + from + ';' + from + ';' + to + ';' + to + ';' + to + ';' + from + '" keyTimes="0;0.3;0.42;0.85;0.92;1" dur="8s" repeatCount="indefinite"/></rect>' +
        '</g>';
    }
    function result(cx, word, color) {
      return '<text x="' + cx + '" y="34" text-anchor="middle" font-size="15" font-weight="700" fill="' + color + '" opacity="0">' + word +
        '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.4;0.48;0.85;0.92;1" dur="8s" repeatCount="indefinite"/></text>';
    }
    acidSteps.push({
      title: 'Indicators show acid or base',
      text: '<p>An <b>indicator</b> changes color to reveal acids and bases. <b>Litmus paper</b> turns <b>red in acid</b> and <b>blue in base</b>. Universal indicator shows the whole rainbow of the pH scale.</p>',
      svg: TutorialKit.svg(
        beaker(30, 110, 140, 100, '#fde7d9', 25, 'aci3a') +
        beaker(230, 110, 140, 100, '#dbeafe', 25, 'aci3b') +
        '<text x="100" y="200" text-anchor="middle" font-size="13" fill="var(--t-ink)">lemon juice (acid)</text>' +
        '<text x="300" y="200" text-anchor="middle" font-size="13" fill="var(--t-ink)">soapy water (base)</text>' +
        strip(100, BLUE, RED) + strip(300, RED, BLUE) +
        result(100, 'Blue → RED', RED) + result(300, 'Red → BLUE', BLUE) +
        '<text x="100" y="228" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">blue litmus</text>' +
        '<text x="300" y="228" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">red litmus</text>'
      )
    });
  })();

  // Step 4: interactive pH slider
  acidSteps.push({
    title: 'Try it: slide the pH',
    text: '<p>Drag the slider. Low pH means <b>many H<sup>+</sup> ions</b> (acid). High pH means <b>many OH<sup>-</sup> ions</b> (base). At pH 7 they are balanced, so the water is neutral.</p>',
    mount(el, api) {
      const MAXP = 9, R = 13;
      const box = { x0: 44, x1: 168, y0: 82, y1: 162 };
      let parts = '';
      for (let i = 0; i < MAXP; i++) {
        parts += '<g id="aci4-h' + i + '"><circle r="' + R + '" fill="#e5322d" stroke="#fff" stroke-width="1.5"/><text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">H⁺</text></g>';
      }
      for (let i = 0; i < MAXP; i++) {
        parts += '<g id="aci4-o' + i + '"><circle r="' + (R + 1) + '" fill="#2563eb" stroke="#fff" stroke-width="1.5"/><text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">OH⁻</text></g>';
      }
      let grad = '';
      for (let i = 0; i <= 14; i++) grad += '<stop offset="' + (i / 14 * 100) + '%" stop-color="' + phColor(i) + '"/>';
      const svg = TutorialKit.svg(
        '<defs><linearGradient id="aci4-grad" x1="0" x2="1" y1="0" y2="0">' + grad + '</linearGradient></defs>' +
        beaker(24, 30, 164, 150, '#4ade80', 34, 'aci4') + parts +
        '<text id="aci4-ph" x="300" y="66" text-anchor="middle" font-size="42" font-weight="800" fill="var(--t-ink)">pH 2</text>' +
        '<text id="aci4-cat" x="300" y="94" text-anchor="middle" font-size="17" font-weight="700" fill="var(--t-red)">Acidic</text>' +
        '<rect x="212" y="106" width="176" height="20" rx="6" fill="url(#aci4-grad)"/>' +
        '<path id="aci4-mk" d="M0,128 L-7,142 L7,142 Z" fill="var(--t-ink)"/>' +
        '<text x="212" y="160" font-size="13" fill="var(--t-muted)">0</text>' +
        '<text x="300" y="160" text-anchor="middle" font-size="13" fill="var(--t-muted)">7</text>' +
        '<text x="388" y="160" text-anchor="end" font-size="13" fill="var(--t-muted)">14</text>' +
        '<text id="aci4-like" x="300" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)"></text>' +
        '<text id="aci4-ten" x="300" y="197" text-anchor="middle" font-size="13" fill="var(--primary)"></text>'
      ).replace('viewBox="0 0 400 240"', 'viewBox="0 0 400 200"');
      el.innerHTML = svg +
        '<div class="scene-slider-row"><span>pH</span><input id="aci4-slider" type="range" min="0" max="14" step="1" value="2" aria-label="pH value"><span id="aci4-val" style="min-width:2ch">2</span></div>';
      const svgEl = el.querySelector('svg');
      svgEl.style.height = 'auto';
      svgEl.style.flex = '1 1 0';
      svgEl.style.minHeight = '0';
      const q = id => el.querySelector('#' + id);
      const like = ['battery acid', 'stomach acid', 'lemon juice', 'vinegar', 'tomato juice', 'coffee', 'milk', 'pure water',
        'sea water', 'baking soda', 'soap', 'ammonia cleaner', 'limewater', 'bleach', 'drain cleaner'];
      // particles
      const P = [];
      for (let i = 0; i < MAXP * 2; i++) {
        const isH = i < MAXP;
        P.push({
          g: q((isH ? 'aci4-h' : 'aci4-o') + (i % MAXP)), isH, idx: i % MAXP,
          x: box.x0 + Math.random() * (box.x1 - box.x0), y: box.y0 + Math.random() * (box.y1 - box.y0),
          vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50
        });
      }
      let nH = 0, nO = 0;
      function counts(ph) {
        const strong = Math.abs(7 - ph) / 7;
        const major = Math.round(1 + strong * (MAXP - 1));
        const minor = Math.max(0, Math.round(1 - Math.abs(7 - ph) / 2));
        return ph < 7 ? [major, minor] : ph > 7 ? [minor, major] : [1, 1];
      }
      function update() {
        const ph = +q('aci4-slider').value;
        q('aci4-val').textContent = ph;
        q('aci4-ph').textContent = 'pH ' + ph;
        const cat = q('aci4-cat');
        cat.textContent = ph < 7 ? 'Acidic' : ph > 7 ? 'Basic' : 'Neutral';
        cat.setAttribute('fill', ph < 7 ? '#dc2626' : ph > 7 ? '#2563eb' : '#16a34a');
        q('aci4-liq').setAttribute('fill', phColor(ph));
        q('aci4-mk').setAttribute('transform', 'translate(' + (212 + ph / 14 * 176) + ',0)');
        q('aci4-like').textContent = 'like ' + like[ph];
        const ten = q('aci4-ten');
        if (ph < 7) ten.textContent = '10× more H⁺ than pH ' + (ph + 1);
        else if (ph > 7) ten.textContent = '10× more OH⁻ than pH ' + (ph - 1);
        else ten.textContent = 'H⁺ and OH⁻ are balanced';
        [nH, nO] = counts(ph);
        P.forEach(p => {
          p.g.style.display = p.idx < (p.isH ? nH : nO) ? '' : 'none';
          p.g.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')');
        });
      }
      q('aci4-slider').addEventListener('input', update);
      update();
      api.loop((t, dt) => {
        const vis = P.filter(p => p.idx < (p.isH ? nH : nO));
        vis.forEach(p => {
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < box.x0 || p.x > box.x1) { p.vx = -p.vx; p.x = Math.max(box.x0, Math.min(box.x1, p.x)); }
          if (p.y < box.y0 || p.y > box.y1) { p.vy = -p.vy; p.y = Math.max(box.y0, Math.min(box.y1, p.y)); }
        });
        separate(vis, 29, box);
        vis.forEach(p => p.g.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')'));
      });
    }
  });

  // Step 5: neutralization (acid + base -> salt + water)
  acidSteps.push({
    title: 'Neutralization',
    text: '<p>Mix an acid with a base and they cancel out: <b>acid + base → salt + water</b>. Each OH<sup>-</sup> joins an H<sup>+</sup> to make H<sub>2</sub>O. Antacid tablets use this to soothe a sour stomach.</p>',
    mount(el, api) {
      const box = { x0: 34, x1: 194, y0: 88, y1: 160 };
      const CFG = {
        H: ['H⁺', '#e5322d', 13, '#fff'], Cl: ['Cl⁻', '#94a3b8', 13, '#fff'], Na: ['Na⁺', '#64748b', 14, '#fff'],
        OH: ['OH⁻', '#2563eb', 14, '#fff'], W: ['H₂O', '#bae6fd', 16, '#075985']
      };
      const svg = TutorialKit.svg(
        beaker(14, 34, 200, 146, '#f97316', 36, 'aci5') + '<g id="aci5-layer"></g>' +
        '<text id="aci5-ph" x="312" y="56" text-anchor="middle" font-size="38" font-weight="800" fill="var(--t-ink)">pH 1</text>' +
        '<text id="aci5-cat" x="312" y="82" text-anchor="middle" font-size="16" font-weight="700" fill="#dc2626">Acidic</text>' +
        '<text x="312" y="116" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-ink)">HCl + NaOH</text>' +
        '<text x="312" y="136" text-anchor="middle" font-size="15" font-weight="700" fill="var(--primary)">→ NaCl + H₂O</text>' +
        '<text id="aci5-msg" x="312" y="164" text-anchor="middle" font-size="13" fill="var(--t-muted)"></text>' +
        '<text id="aci5-msg2" x="312" y="182" text-anchor="middle" font-size="13" fill="var(--t-muted)"></text>'
      ).replace('viewBox="0 0 400 240"', 'viewBox="0 0 400 200"');
      el.innerHTML = svg +
        '<div class="scene-slider-row" style="justify-content:center"><button class="scene-btn" id="aci5-drop" type="button">Drop base (NaOH)</button><button class="scene-btn" id="aci5-reset" type="button">Reset</button></div>';
      const svgEl = el.querySelector('svg');
      svgEl.style.height = 'auto'; svgEl.style.flex = '1 1 0'; svgEl.style.minHeight = '0';
      const q = id => el.querySelector('#' + id);
      const layer = q('aci5-layer');
      let parts, acid, extra, drops;

      function make(kind, x, y) {
        const c = CFG[kind];
        const g = document.createElementNS(SVGNS, 'g');
        const ci = document.createElementNS(SVGNS, 'circle');
        ci.setAttribute('r', c[2]); ci.setAttribute('fill', c[1]); ci.setAttribute('stroke', '#fff'); ci.setAttribute('stroke-width', '1.5');
        const tx = document.createElementNS(SVGNS, 'text');
        tx.setAttribute('y', 5); tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('font-size', 13);
        tx.setAttribute('font-weight', 700); tx.setAttribute('fill', c[3]); tx.textContent = c[0];
        g.appendChild(ci); g.appendChild(tx); layer.appendChild(g);
        const p = { kind, g, ci, tx, x, y, vx: (Math.random() - 0.5) * 44, vy: (Math.random() - 0.5) * 44, fall: false };
        place(p);
        parts.push(p);
        return p;
      }
      function place(p) { p.g.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')'); }
      function readout() {
        const PH = { 3: 1, 2: 2, 1: 3.5 };
        let ph, cat, col, m1, m2;
        if (acid > 0) { ph = PH[acid]; cat = 'Acidic'; col = '#dc2626'; m1 = 'Still H⁺ left over,'; m2 = 'so add more base.'; }
        else if (extra === 0) { ph = 7; cat = 'Neutral'; col = '#16a34a'; m1 = 'No H⁺ or OH⁻ left over.'; m2 = 'Salt + water!'; }
        else { ph = extra === 1 ? 10 : 12; cat = 'Basic'; col = '#2563eb'; m1 = 'Too much base:'; m2 = 'OH⁻ is left over.'; }
        q('aci5-ph').textContent = 'pH ' + ph;
        const c = q('aci5-cat'); c.textContent = cat; c.setAttribute('fill', col);
        q('aci5-msg').textContent = m1; q('aci5-msg2').textContent = m2;
        q('aci5-liq').setAttribute('fill', phColor(ph));
        q('aci5-drop').disabled = drops >= 5;
      }
      function reset() {
        layer.innerHTML = ''; parts = []; acid = 3; extra = 0; drops = 0;
        for (let i = 0; i < 3; i++) {
          make('H', box.x0 + 20 + i * 55, box.y0 + 12 + (i % 2) * 34);
          make('Cl', box.x0 + 48 + i * 55, box.y0 + 46 - (i % 2) * 34);
        }
        readout();
      }
      function react(oh) {
        const hs = parts.filter(p => p.kind === 'H');
        if (!hs.length) { extra++; readout(); return; }
        hs.sort((a, b) => Math.hypot(a.x - oh.x, a.y - oh.y) - Math.hypot(b.x - oh.x, b.y - oh.y));
        const h = hs[0];
        h.kind = 'W'; h.ci.setAttribute('fill', CFG.W[1]); h.ci.setAttribute('r', CFG.W[2]);
        h.tx.setAttribute('fill', CFG.W[3]); h.tx.textContent = CFG.W[0];
        layer.removeChild(oh.g); parts.splice(parts.indexOf(oh), 1);
        acid--; readout();
      }
      q('aci5-drop').addEventListener('click', () => {
        if (drops >= 5) return;
        drops++;
        const x = box.x0 + 30 + Math.random() * 100;
        const na = make('Na', x - 17, 12), oh = make('OH', x + 17, 12);
        na.fall = oh.fall = true; na.vx = na.vy = oh.vx = oh.vy = 0;
        oh.react = true;
        readout();
      });
      q('aci5-reset').addEventListener('click', reset);
      reset();
      api.loop((t, dt) => {
        const settled = [];
        parts.slice().forEach(p => {
          if (p.fall) {
            p.y += 110 * dt;
            if (p.y >= box.y0 + 10) {
              p.fall = false; p.vx = (Math.random() - 0.5) * 44; p.vy = (Math.random() - 0.5) * 44;
              if (p.react) react(p);
            }
          } else {
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.x < box.x0 || p.x > box.x1) { p.vx = -p.vx; p.x = Math.max(box.x0, Math.min(box.x1, p.x)); }
            if (p.y < box.y0 || p.y > box.y1) { p.vy = -p.vy; p.y = Math.max(box.y0, Math.min(box.y1, p.y)); }
          }
          if (!p.fall && p.g.parentNode) settled.push(p);
        });
        separate(settled, 30, box);
        parts.forEach(place);
      });
    }
  });

  // @@ACIDS-END

  registerTutorial('chemistry', 'acids', {
    title: 'Acids & Bases',
    keyTerms: [
      { term: 'Acid', definition: 'A substance that releases hydrogen ions (H⁺) in water. It has a pH below 7 and turns blue litmus red.' },
      { term: 'Base', definition: 'A substance that releases hydroxide ions (OH⁻) in water. It has a pH above 7 and turns red litmus blue.' },
      { term: 'pH scale', definition: 'A scale from 0 to 14 that shows how acidic or basic a solution is. 7 is neutral, and each step is a tenfold change.' },
      { term: 'Indicator', definition: 'A substance, like litmus or universal indicator, that changes color to show whether something is an acid or a base.' },
      { term: 'Neutralization', definition: 'The reaction of an acid with a base that makes a salt and water, moving the pH toward 7.' },
      { term: 'Salt', definition: 'An ionic compound made when an acid and a base react. For example, HCl + NaOH → NaCl + H₂O.' }
    ],
    steps: acidSteps
  });

  // =====================================================================
  // PERIODIC TABLE
  // =====================================================================
  const periodicSteps = [];

  // ---- shared periodic-table layout (first 20 elements, main-group columns) ----
  // [atomic number, symbol, group, period, class m=metal / l=metalloid / n=nonmetal, name]
  const PER_EL = [
    [1, 'H', 1, 1, 'n', 'Hydrogen'], [2, 'He', 18, 1, 'n', 'Helium'],
    [3, 'Li', 1, 2, 'm', 'Lithium'], [4, 'Be', 2, 2, 'm', 'Beryllium'], [5, 'B', 13, 2, 'l', 'Boron'],
    [6, 'C', 14, 2, 'n', 'Carbon'], [7, 'N', 15, 2, 'n', 'Nitrogen'], [8, 'O', 16, 2, 'n', 'Oxygen'],
    [9, 'F', 17, 2, 'n', 'Fluorine'], [10, 'Ne', 18, 2, 'n', 'Neon'],
    [11, 'Na', 1, 3, 'm', 'Sodium'], [12, 'Mg', 2, 3, 'm', 'Magnesium'], [13, 'Al', 13, 3, 'm', 'Aluminum'],
    [14, 'Si', 14, 3, 'l', 'Silicon'], [15, 'P', 15, 3, 'n', 'Phosphorus'], [16, 'S', 16, 3, 'n', 'Sulfur'],
    [17, 'Cl', 17, 3, 'n', 'Chlorine'], [18, 'Ar', 18, 3, 'n', 'Argon'],
    [19, 'K', 1, 4, 'm', 'Potassium'], [20, 'Ca', 2, 4, 'm', 'Calcium']
  ];
  const PER_COLX = { 1: 38, 2: 74, 13: 164, 14: 200, 15: 236, 16: 272, 17: 308, 18: 344 };
  const PER_CW = 33, PER_CH = 40;
  const perRowY = p => 50 + (p - 1) * 44;
  const CLS_FILL = { m: '#93c5fd', l: '#fde68a', n: '#99f6e4' };

  // Group-number header, period labels and the 20 element cells. `fillOf(el)` picks each cell's fill.
  function perGrid(fillOf, extraOf) {
    let s = '';
    Object.keys(PER_COLX).forEach(g => {
      s += '<text id="per-gh' + g + '" x="' + (PER_COLX[g] + PER_CW / 2) + '" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">' + g + '</text>';
    });
    s += '<text x="' + (110 + 27) + '" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">3–12</text>';
    s += '<rect x="112" y="48" width="50" height="132" rx="6" fill="none" stroke="#c7d2fe" stroke-width="1.5" stroke-dasharray="4 4"/>';
    for (let p = 1; p <= 4; p++) {
      s += '<text id="per-ph' + p + '" x="20" y="' + (perRowY(p) + 26) + '" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">' + p + '</text>';
    }
    PER_EL.forEach(e => {
      const x = PER_COLX[e[2]], y = perRowY(e[3]);
      s += '<g id="per-e' + e[0] + '"><rect x="' + x + '" y="' + y + '" width="' + PER_CW + '" height="' + PER_CH + '" rx="5" fill="' + fillOf(e) + '" stroke="#818cf8" stroke-width="1.5"/>' +
        '<text x="' + (x + PER_CW / 2) + '" y="' + (y + 14) + '" text-anchor="middle" font-size="13" fill="var(--t-muted)">' + e[0] + '</text>' +
        '<text x="' + (x + PER_CW / 2) + '" y="' + (y + 33) + '" text-anchor="middle" font-size="16" font-weight="800" fill="var(--t-ink)">' + e[1] + '</text>' + (extraOf ? extraOf(e) : '') + '</g>';
    });
    return s;
  }
  const perCellRect = n => document.querySelector('#per-e' + n + ' rect');

  // Step 1: elements lined up by atomic number
  periodicSteps.push({
    title: 'Elements in order',
    text: '<p>The periodic table lines up every element by its <b>atomic number</b> (its number of protons). Rows are called <b>periods</b>, columns are called <b>groups</b>. Watch the first elements arrive in order.</p>',
    svg: (function () {
      const DUR = 11, STEP = 0.35;
      const pop = e => {
        const a = ((e[0] - 0.5) * STEP / DUR).toFixed(4), b = (((e[0] - 0.5) * STEP + 0.25) / DUR).toFixed(4);
        return '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;' + a + ';' + b + ';0.93;1" dur="' + DUR + 's" repeatCount="indefinite"/>';
      };
      const fade = '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.66;0.72;0.93;1" dur="' + DUR + 's" repeatCount="indefinite"/>';
      return TutorialKit.svg(
        perGrid(() => '#e0e7ff', pop) +
        '<g opacity="0"><text x="266" y="196" text-anchor="middle" font-size="15" font-weight="700" fill="var(--primary)">Increasing atomic number</text>' +
        '<text x="266" y="216" text-anchor="middle" font-size="14" fill="var(--t-ink)">= more protons →</text>' + fade + '</g>'
      );
    })()
  });

  // Step 2: interactive columns (groups) vs rows (periods)
  periodicSteps.push({
    title: 'Groups and periods',
    text: '<p>A column is a <b>group</b>: its elements have the same number of outer (<b>valence</b>) electrons, so they behave alike. A row is a <b>period</b>: its elements have the same number of electron shells.</p>',
    mount(el, api) {
      el.innerHTML = TutorialKit.svg(
        perGrid(() => '#e0e7ff') +
        '<rect id="per2-band" x="0" y="0" width="10" height="10" rx="8" fill="none" stroke="#d97706" stroke-width="3"><animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/></rect>' +
        '<text id="per2-c1" x="250" y="201" text-anchor="middle" font-size="15" font-weight="800" fill="var(--primary)"></text>' +
        '<text id="per2-c2" x="250" y="220" text-anchor="middle" font-size="14" fill="var(--t-ink)"></text>',
        '0 26 400 198'
      ) +
        '<div class="scene-slider-row" style="justify-content:center"><button class="scene-btn" id="per2-bg" type="button">Columns (groups)</button><button class="scene-btn" id="per2-bp" type="button">Rows (periods)</button></div>';
      const svgEl = el.querySelector('svg');
      svgEl.style.height = 'auto'; svgEl.style.flex = '1 1 0'; svgEl.style.minHeight = '0';
      const q = id => el.querySelector('#' + id);
      const GROUPS = [1, 2, 13, 14, 15, 16, 17, 18];
      const PERIODS = [1, 2, 3, 4];
      let mode = 'g', idx = 0, timer = 0;
      function paint() {
        const gv = GROUPS[idx % GROUPS.length], pv = PERIODS[idx % PERIODS.length];
        PER_EL.forEach(e => {
          const on = mode === 'g' ? e[2] === gv : e[3] === pv;
          const r = el.querySelector('#per-e' + e[0] + ' rect');
          r.setAttribute('fill', on ? '#fbbf24' : '#e0e7ff');
          r.setAttribute('stroke', on ? '#b45309' : '#818cf8');
        });
        const inSel = PER_EL.filter(e => (mode === 'g' ? e[2] === gv : e[3] === pv));
        const bx0 = Math.min(...inSel.map(e => PER_COLX[e[2]])), bx1 = Math.max(...inSel.map(e => PER_COLX[e[2]] + PER_CW));
        const by0 = Math.min(...inSel.map(e => perRowY(e[3]))), by1 = Math.max(...inSel.map(e => perRowY(e[3]) + PER_CH));
        const band = q('per2-band');
        band.setAttribute('x', bx0 - 4); band.setAttribute('y', by0 - 4);
        band.setAttribute('width', bx1 - bx0 + 8); band.setAttribute('height', by1 - by0 + 8);
        Object.keys(PER_COLX).forEach(g => {
          const h = q('per-gh' + g); const on = mode === 'g' && +g === gv;
          h.setAttribute('fill', on ? '#b45309' : 'var(--t-muted)');
          h.setAttribute('font-size', on ? 16 : 13);
        });
        for (let p = 1; p <= 4; p++) {
          const h = q('per-ph' + p); const on = mode === 'p' && p === pv;
          h.setAttribute('fill', on ? '#b45309' : 'var(--t-muted)');
          h.setAttribute('font-size', on ? 16 : 13);
        }
        if (mode === 'g') {
          q('per2-c1').textContent = 'Group ' + gv + ' (a column)';
          q('per2-c2').textContent = gv === 1 ? '1 outer electron each' : gv === 2 ? '2 outer electrons each' :
            gv === 18 ? 'full outer shell' : (gv - 10) + ' outer electrons each';
        } else {
          q('per2-c1').textContent = 'Period ' + pv + ' (a row)';
          q('per2-c2').textContent = pv + (pv === 1 ? ' electron shell' : ' electron shells');
        }
      }
      function setMode(m) {
        mode = m; idx = 0; timer = 0; paint();
        q('per2-bg').style.borderColor = m === 'g' ? 'var(--primary)' : '';
        q('per2-bp').style.borderColor = m === 'p' ? 'var(--primary)' : '';
      }
      q('per2-bg').addEventListener('click', () => setMode('g'));
      q('per2-bp').addEventListener('click', () => setMode('p'));
      setMode('g');
      api.loop((t, dt) => {
        timer += dt;
        if (timer > 2.0) { timer = 0; idx++; paint(); }
      });
    }
  });

  // Step 3: metals, metalloids, nonmetals colored in one by one
  periodicSteps.push({
    title: 'Metals, metalloids, nonmetals',
    text: '<p><b>Metals</b> (shiny, good conductors) fill the left and middle. <b>Nonmetals</b> sit on the right. <b>Metalloids</b> lie along a staircase between them. Hydrogen is a nonmetal, even though it sits above Group 1.</p>',
    mount(el, api) {
      const legend = (x, c, w) => '<rect x="' + x + '" y="206" width="12" height="12" rx="2" fill="' + c + '" stroke="#64748b"/>' +
        '<text x="' + (x + 17) + '" y="217" font-size="13" font-weight="700" fill="var(--t-ink)">' + w + '</text>';
      el.innerHTML = TutorialKit.svg(
        perGrid(() => '#e5e7eb') +
        '<text id="per3-cap" x="245" y="195" text-anchor="middle" font-size="14" font-weight="800" fill="var(--primary)"></text>' +
        legend(130, CLS_FILL.m, 'Metals') + legend(212, CLS_FILL.l, 'Metalloids') + legend(300, CLS_FILL.n, 'Nonmetals')
      );
      const cap = el.querySelector('#per3-cap');
      const rects = PER_EL.map(e => el.querySelector('#per-e' + e[0] + ' rect'));
      rects.forEach(r => { r.style.transition = 'fill .5s'; });
      const CAPS = ['', 'Metals: left and middle', 'Metalloids: the staircase (B, Si)', 'Nonmetals: right side (+ H)'];
      const starts = [0, 1.2, 3.4, 5.6];
      let phase = -1;
      function apply(ph) {
        phase = ph;
        PER_EL.forEach((e, i) => {
          const show = (e[4] === 'm' && ph >= 1) || (e[4] === 'l' && ph >= 2) || (e[4] === 'n' && ph >= 3);
          rects[i].setAttribute('fill', show ? CLS_FILL[e[4]] : '#e5e7eb');
        });
        PER_EL.forEach((e, i) => {
          const hot = e[4] === 'l' && ph >= 2;
          rects[i].setAttribute('stroke', hot ? '#92400e' : '#818cf8');
          rects[i].setAttribute('stroke-width', hot ? 3.5 : 1.5);
        });
        cap.textContent = CAPS[ph];
      }
      apply(3); // a complete picture even if the scene starts paused
      api.loop(t => {
        const c = t % 9.5;
        let ph = 0;
        starts.forEach((s, i) => { if (c >= s) ph = i; });
        if (ph !== phase) apply(ph);
      });
    }
  });

  // Step 4: interactive valence electrons by group (period-3 atoms)
  periodicSteps.push({
    title: 'Try it: valence electrons',
    text: '<p>Slide across the groups. The electrons in an atom\'s outer shell are its <b>valence electrons</b>, and they decide how it reacts. Atoms with a full outer shell, like argon, are very unreactive.</p>',
    mount(el, api) {
      const CX = 100, CY = 100, RAD = [34, 54, 74];
      const DATA = [
        [1, 'Na', 'Sodium', 1, 'Alkali metal', 'Loses 1 electron easily:', 'very reactive'],
        [2, 'Mg', 'Magnesium', 2, 'Alkaline earth metal', 'Loses 2 electrons:', 'reactive'],
        [13, 'Al', 'Aluminum', 3, 'Metal', 'Can lose 3 electrons:', 'reactive'],
        [14, 'Si', 'Silicon', 4, 'Metalloid', 'Shares its 4 outer', 'electrons with others'],
        [15, 'P', 'Phosphorus', 5, 'Nonmetal', 'Needs 3 more electrons', 'to fill its shell'],
        [16, 'S', 'Sulfur', 6, 'Nonmetal', 'Needs 2 more electrons', 'to fill its shell'],
        [17, 'Cl', 'Chlorine', 7, 'Halogen', 'Needs 1 more electron:', 'very reactive'],
        [18, 'Ar', 'Argon', 8, 'Noble gas', 'Full outer shell:', 'very unreactive']
      ];
      let dots = '';
      for (let i = 0; i < 2; i++) dots += '<circle id="per4-a' + i + '" r="5" fill="#64748b"/>';
      for (let i = 0; i < 8; i++) dots += '<circle id="per4-b' + i + '" r="5" fill="#64748b"/>';
      for (let i = 0; i < 8; i++) dots += '<circle id="per4-c' + i + '" r="6.5" fill="#f97316" stroke="#fff" stroke-width="1.5"/>';
      const svg = TutorialKit.svg(
        RAD.map((r, i) => '<circle cx="' + CX + '" cy="' + CY + '" r="' + r + '" fill="none" stroke="' + (i === 2 ? '#f97316' : '#cbd5e1') + '" stroke-width="' + (i === 2 ? 2 : 1.5) + '" stroke-dasharray="' + (i === 2 ? '' : '3 4') + '"/>').join('') +
        '<circle cx="' + CX + '" cy="' + CY + '" r="21" fill="var(--primary)"/>' +
        '<text id="per4-sym" x="' + CX + '" y="' + (CY + 6) + '" text-anchor="middle" font-size="17" font-weight="800" fill="#fff">Na</text>' +
        '<g transform="translate(' + CX + ',' + CY + ')">' + dots + '</g>' +
        '<text id="per4-grp" x="300" y="34" text-anchor="middle" font-size="26" font-weight="800" fill="var(--t-ink)"></text>' +
        '<text id="per4-cls" x="300" y="56" text-anchor="middle" font-size="14" font-weight="700" fill="var(--primary)"></text>' +
        '<text id="per4-el" x="300" y="78" text-anchor="middle" font-size="14" fill="var(--t-muted)"></text>' +
        '<text id="per4-val" x="300" y="110" text-anchor="middle" font-size="16" font-weight="800" fill="#ea580c"></text>' +
        '<text id="per4-l1" x="300" y="136" text-anchor="middle" font-size="14" fill="var(--t-ink)"></text>' +
        '<text id="per4-l2" x="300" y="155" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-ink)"></text>' +
        '<text x="300" y="184" text-anchor="middle" font-size="13" fill="var(--t-muted)">orange dots = valence electrons</text>',
        '0 0 400 200'
      );
      el.innerHTML = svg + '<div class="scene-slider-row"><span>Group</span><input id="per4-slider" type="range" min="0" max="7" step="1" value="0" aria-label="Group number"><span id="per4-val2" style="min-width:2.5ch">1</span></div>';
      const svgEl = el.querySelector('svg');
      svgEl.style.height = 'auto'; svgEl.style.flex = '1 1 0'; svgEl.style.minHeight = '0';
      const q = id => el.querySelector('#' + id);
      let nVal = 1, T = 0;
      function update() {
        const d = DATA[+q('per4-slider').value];
        q('per4-val2').textContent = d[0];
        q('per4-sym').textContent = d[1];
        q('per4-grp').textContent = 'Group ' + d[0];
        q('per4-cls').textContent = d[4];
        q('per4-el').textContent = 'shown: ' + d[2] + ' (period 3)';
        q('per4-val').textContent = 'Valence electrons: ' + d[3];
        q('per4-l1').textContent = d[5];
        q('per4-l2').textContent = d[6];
        nVal = d[3];
        for (let i = 0; i < 8; i++) q('per4-c' + i).style.display = i < nVal ? '' : 'none';
        orbit(T);
      }
      function orbit(t) {
        const place = (id, r, ang) => q(id).setAttribute('transform', 'translate(' + (Math.cos(ang) * r).toFixed(1) + ',' + (Math.sin(ang) * r).toFixed(1) + ')');
        for (let i = 0; i < 2; i++) place('per4-a' + i, RAD[0], t * 1.6 + i * Math.PI);
        for (let i = 0; i < 8; i++) place('per4-b' + i, RAD[1], -t * 1.0 + i * Math.PI / 4);
        for (let i = 0; i < nVal; i++) place('per4-c' + i, RAD[2], t * 0.6 + i * 2 * Math.PI / nVal);
      }
      q('per4-slider').addEventListener('input', update);
      update();
      api.loop(t => { T = t; orbit(t); });
    }
  });

  // Step 5: reactivity trend down Group 1 (Li < Na < K with water)
  periodicSteps.push({
    title: 'Reactivity trend: alkali metals',
    text: '<p>Group 1 metals (<b>alkali metals</b>) have one valence electron and react with water. Going <b>down</b> the group they get <b>more reactive</b>: lithium fizzes, sodium fizzes fast, potassium bursts into flame.</p>',
    svg: (function () {
      // One reacting piece: cx = trough center, sway = horizontal travel, dur = motion period,
      // bubbles = number of H2 bubbles, flame = show flame.
      function piece(cx, sym, sway, jit, dur, bubbles, flame) {
        let b = '';
        for (let i = 0; i < bubbles; i++) {
          const bx = (i % 5 - 2) * 8, rise = 42 + (i % 3) * 12, d = (0.9 + (i % 4) * 0.25).toFixed(2);
          b += '<circle cx="' + bx + '" cy="-8" r="3.5" fill="#fff" stroke="#60a5fa" stroke-width="1.2" opacity="0">' +
            '<animate attributeName="cy" values="-8;' + (-8 - rise) + '" dur="' + d + 's" begin="' + (i * 0.17).toFixed(2) + 's" repeatCount="indefinite"/>' +
            '<animate attributeName="opacity" values="0;1;0" dur="' + d + 's" begin="' + (i * 0.17).toFixed(2) + 's" repeatCount="indefinite"/></circle>';
        }
        const fl = flame ?
          '<g><animateTransform attributeName="transform" type="scale" values="1 1;1.25 0.8;0.9 1.25;1 1" dur="0.45s" repeatCount="indefinite"/>' +
          '<path d="M-11,-8 Q-14,-26 0,-46 Q14,-26 11,-8 Z" fill="#c084fc" opacity="0.85"/>' +
          '<path d="M-5,-8 Q-6,-20 0,-30 Q6,-20 5,-8 Z" fill="#fde68a"/></g>' : '';
        return '<g><animateTransform attributeName="transform" type="translate" values="0 0;' + sway + ' ' + (-jit) + ';' + (-sway) + ' ' + jit + ';0 0" dur="' + dur + 's" repeatCount="indefinite"/>' +
          '<g transform="translate(' + cx + ',118)">' + b + fl +
          '<circle r="13" fill="#94a3b8" stroke="#475569" stroke-width="2"/>' +
          '<text y="5" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">' + sym + '</text></g></g>';
      }
      function trough(cx, name, note) {
        return '<rect x="' + (cx - 56) + '" y="120" width="112" height="72" rx="8" fill="#bfdbfe" stroke="var(--t-ink)" stroke-width="2.5"/>' +
          '<text x="' + cx + '" y="212" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)">' + name + '</text>' +
          '<text x="' + cx + '" y="230" text-anchor="middle" font-size="13" fill="var(--t-muted)">' + note + '</text>';
      }
      return TutorialKit.svg(
        TutorialKit.arrowMarker('per5-arr', '#4f46e5') +
        '<text x="200" y="22" text-anchor="middle" font-size="15" font-weight="800" fill="var(--primary)">Li → Na → K: more and more reactive</text>' +
        '<line x1="70" y1="34" x2="330" y2="34" stroke="#4f46e5" stroke-width="3" marker-end="url(#per5-arr)"/>' +
        trough(70, 'Lithium (Li)', 'steady fizz') + trough(200, 'Sodium (Na)', 'fast fizz') + trough(330, 'Potassium (K)', 'lilac flame!') +
        piece(70, 'Li', 8, 1, 4, 3, false) + piece(200, 'Na', 26, 2, 1.6, 6, false) + piece(330, 'K', 34, 3, 0.9, 10, true)
      );
    })()
  });

  // @@PERIODIC-END

  registerTutorial('chemistry', 'periodic', {
    title: 'Periodic Table',
    keyTerms: [
      { term: 'Atomic number', definition: 'The number of protons in an atom. The periodic table lists elements in order of increasing atomic number.' },
      { term: 'Group', definition: 'A vertical column of the periodic table. Elements in a group have the same number of valence electrons and similar behavior.' },
      { term: 'Period', definition: 'A horizontal row of the periodic table. Elements in a period have the same number of electron shells.' },
      { term: 'Valence electrons', definition: 'The electrons in an atom\'s outermost shell. They determine how the atom reacts and bonds.' },
      { term: 'Metalloid', definition: 'An element along the staircase between metals and nonmetals, with properties of both. Silicon is one.' },
      { term: 'Noble gas', definition: 'A Group 18 element with a full outer shell, so it is very unreactive. Helium, neon, and argon are noble gases.' }
    ],
    steps: periodicSteps
  });
})();
