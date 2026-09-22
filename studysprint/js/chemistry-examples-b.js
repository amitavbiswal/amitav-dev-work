(function () {
  // chemistry-examples-b: extra real-life example steps, added via addTutorialSteps(...).
  // Topics: reactions (exrxn-), acids (exaci-), periodic (exper-).

  const rxnExamples = [];
  const aciExamples = [];
  const perExamples = [];

  // ---- Reactions 1: rusting nail (slow reaction), SMIL
  rxnExamples.push({
    kind: 'example',
    title: 'Real life: A nail rusts',
    text: '<p>Leave an iron nail in damp air and oxygen slowly reacts with the iron. The new substance, <b>rust</b> (iron oxide), is flaky and orange-brown. Water speeds it up. This reaction is <b>slow</b>: days and weeks, not seconds.</p>',
    svg: (function () {
      const D = '12s';
      const patch = (cx, cy, r, s) => `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${(r * 0.7).toFixed(1)}" fill="#b45309" opacity="0">` +
        `<animate attributeName="opacity" values="0;0;0.9;0.9;0" keyTimes="0;${s};${(s + 0.12).toFixed(2)};0.94;1" dur="${D}" repeatCount="indefinite"/></ellipse>`;
      // oxygen molecules (two red circles) sinking onto the nail
      const o2 = (x, i) => `<g opacity="0"><circle cx="-6" r="6" fill="var(--t-red)"/><circle cx="6" r="6" fill="var(--t-red)"/>` +
        `<animateTransform attributeName="transform" type="translate" values="${x} 62;${x + 6} 108" dur="2.4s" begin="${(i * 0.7).toFixed(1)}s" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.4s" begin="${(i * 0.7).toFixed(1)}s" repeatCount="indefinite"/></g>`;
      // water droplets
      const drop = (x, i) => `<path d="M0,-8 Q7,2 0,7 Q-7,2 0,-8Z" fill="var(--t-blue)" opacity="0"><animateTransform attributeName="transform" type="translate" values="${x} 60;${x - 4} 112" dur="2s" begin="${(i * 0.9 + 0.3).toFixed(1)}s" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2s" begin="${(i * 0.9 + 0.3).toFixed(1)}s" repeatCount="indefinite"/></path>`;
      const phase = (txt, a, b) => `<text x="330" y="150" text-anchor="middle" font-size="15" font-weight="800" fill="var(--t-orange)" opacity="0">${txt}` +
        `<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${a};${(a + 0.03).toFixed(2)};${b};${(b + 0.03).toFixed(2)};1" dur="${D}" repeatCount="indefinite"/></text>`;
      return TutorialKit.svg(
        `<rect x="0" y="0" width="400" height="240" fill="var(--t-soft)" opacity="0.5"/>` +
        `<circle cx="20" cy="44" r="6" fill="var(--t-red)"/><circle cx="32" cy="44" r="6" fill="var(--t-red)"/><text x="44" y="49" font-size="13" fill="var(--t-ink)">oxygen (O₂)</text>` +
        `<path d="M170,36 Q177,46 170,51 Q163,46 170,36Z" fill="var(--t-blue)"/><text x="182" y="49" font-size="13" fill="var(--t-ink)">water</text>` +
        [70, 130, 190, 250].map((x, i) => o2(x, i)).join('') +
        [95, 160, 225, 285].map((x, i) => drop(x, i)).join('') +
        // the nail
        `<rect x="50" y="122" width="26" height="12" rx="3" fill="#64748b"/>` +
        `<rect x="76" y="124" width="190" height="8" fill="#94a3b8"/>` +
        `<path d="M266,124 L292,128 L266,132Z" fill="#94a3b8"/>` +
        patch(96, 128, 10, 0.12) + patch(150, 128, 12, 0.3) + patch(205, 128, 11, 0.5) + patch(250, 128, 10, 0.68) +
        patch(62, 128, 9, 0.8) + patch(124, 128, 8, 0.4) + patch(230, 128, 7, 0.74) +
        `<text x="170" y="164" text-anchor="middle" font-size="13" fill="var(--t-muted)">iron nail (Fe)</text>` +
        phase('Day 1', 0, 0.28) + phase('Week 2', 0.28, 0.6) + phase('Month 3', 0.6, 0.94) +
        `<text x="200" y="196" text-anchor="middle" font-size="16" font-weight="800" fill="var(--t-ink)">4Fe + 3O₂ → 2Fe₂O₃</text>` +
        `<text x="200" y="218" text-anchor="middle" font-size="13" fill="var(--t-muted)">iron + oxygen → iron oxide (rust)</text>`
      );
    })()
  });

  // ---- Reactions 2: fizzy tablet, temperature and surface area (interactive)
  rxnExamples.push({
    kind: 'example',
    title: 'Real life: A fizzy tablet',
    text: '<p>An effervescent tablet fizzes when its acid meets baking soda in water, releasing CO<sub>2</sub> gas. <b>Warm water</b> or a <b>crushed tablet</b> (more surface touching water) makes the reaction <b>faster</b>. Try both!</p>',
    mount: function (el, api) {
      const NB = 36;
      let bub = '';
      for (let i = 0; i < NB; i++) bub += `<circle id="exrxn-b${i}" r="3" fill="#fff" stroke="var(--t-blue)" stroke-width="1.3" opacity="0"/>`;
      let pieces = '';
      for (let i = 0; i < 7; i++) pieces += `<rect id="exrxn-p${i}" rx="2" fill="#f8fafc" stroke="var(--t-muted)" stroke-width="1.2"/>`;
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%">` +
        `<rect x="60" y="72" width="150" height="98" fill="var(--t-blue)" opacity="0.28"/>` +
        `<path d="M60 30 L60 165 Q60 172 67 172 L203 172 Q210 172 210 165 L210 30" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
        `<line x1="60" y1="72" x2="210" y2="72" stroke="var(--t-blue)" stroke-width="2"/>` +
        pieces + bub +
        `<text x="135" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)" id="exrxn-cap">Press Drop tablet</text>` +
        `<text x="300" y="30" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)" id="exrxn-info">Water 20 °C</text>` +
        `<text x="300" y="50" text-anchor="middle" font-size="13" fill="var(--t-muted)" id="exrxn-form">whole tablet</text>` +
        `<text x="300" y="86" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">Reaction speed</text>` +
        `<rect x="240" y="94" width="120" height="14" rx="7" fill="#e5e7eb"/><rect id="exrxn-spd" x="240" y="94" width="10" height="14" rx="7" fill="var(--t-orange)"/>` +
        `<text x="300" y="138" text-anchor="middle" font-size="13" fill="var(--t-ink)">acid + baking soda</text>` +
        `<text x="300" y="156" text-anchor="middle" font-size="13" fill="var(--t-ink)">→ salt + water + CO₂</text>` +
        `<text x="300" y="176" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-blue)" id="exrxn-done"></text>` +
        `</svg>` +
        `<div class="scene-slider-row"><span>Water</span><input type="range" id="exrxn-temp" min="5" max="50" step="1" value="20"><span id="exrxn-tv">20 °C</span></div>` +
        `<div class="scene-slider-row" style="justify-content:center;padding-top:0"><button type="button" class="scene-btn" id="exrxn-crush">Crush it</button><button type="button" class="scene-btn" id="exrxn-drop">Drop tablet</button></div>`;
      const $ = id => el.querySelector('#' + id);
      const tempEl = $('exrxn-temp'), tv = $('exrxn-tv');
      let crushed = false, left = 0, active = false, elapsed = 0;
      const bs = [];
      for (let i = 0; i < NB; i++) bs.push({ el: $('exrxn-b' + i), on: false, x: 0, y: 0, vy: 0, r: 3 });
      const ps = [];
      for (let i = 0; i < 7; i++) ps.push($('exrxn-p' + i));
      const PX = [0, 0.32, 0.61, -0.4, -0.2, 0.15, 0.5];
      function drawTablet() {
        ps.forEach((p, i) => {
          if (!active || left <= 0.01) { p.setAttribute('opacity', 0); return; }
          p.setAttribute('opacity', 1);
          if (!crushed) {
            if (i > 0) { p.setAttribute('opacity', 0); return; }
            const w = 46 * Math.sqrt(left), h = 14 * Math.sqrt(left);
            p.setAttribute('width', w); p.setAttribute('height', h);
            p.setAttribute('x', 135 - w / 2); p.setAttribute('y', 168 - h);
          } else {
            const s = 12 * Math.sqrt(left);
            p.setAttribute('width', s); p.setAttribute('height', s * 0.7);
            p.setAttribute('x', 135 + PX[i] * 90 - s / 2); p.setAttribute('y', 164 - s * 0.7);
          }
        });
      }
      function rate() { return 0.05 * Math.pow(1.6, (+tempEl.value - 20) / 10) * (crushed ? 4 : 1); }
      function drop() { active = true; left = 1; elapsed = 0; $('exrxn-done').textContent = ''; $('exrxn-cap').textContent = 'Fizzing...'; drawTablet(); }
      function refresh() {
        tv.textContent = tempEl.value + ' °C';
        $('exrxn-info').textContent = 'Water ' + tempEl.value + ' °C';
        $('exrxn-form').textContent = crushed ? 'crushed tablet' : 'whole tablet';
        $('exrxn-crush').textContent = crushed ? 'Use whole' : 'Crush it';
        $('exrxn-crush').style.borderColor = crushed ? 'var(--primary)' : '';
        $('exrxn-crush').style.color = crushed ? 'var(--primary)' : '';
        drawTablet();
      }
      tempEl.addEventListener('input', refresh);
      $('exrxn-crush').addEventListener('click', () => { crushed = !crushed; refresh(); drop(); });
      $('exrxn-drop').addEventListener('click', drop);
      refresh();
      drop();
      let acc = 0;
      api.loop((t, dt) => {
        const k = active && left > 0 ? rate() : 0;
        if (active && left > 0) {
          elapsed += dt;
          left = Math.max(0, left - k * dt);
          if (left === 0) { $('exrxn-done').textContent = 'Done in ' + elapsed.toFixed(1) + ' s'; $('exrxn-cap').textContent = 'All dissolved!'; }
          drawTablet();
        }
        $('exrxn-spd').setAttribute('width', Math.max(6, Math.min(120, 120 * k / 0.6)));
        acc += k * 320 * dt;
        while (acc >= 1) {
          acc -= 1;
          const b = bs.find(q => !q.on);
          if (!b) break;
          b.on = true; b.x = crushed ? 80 + Math.random() * 110 : 105 + Math.random() * 60; b.y = 160; b.r = 2.5 + Math.random() * 2.5; b.vy = 40 + Math.random() * 30;
        }
        bs.forEach(b => {
          if (!b.on) return;
          b.y -= b.vy * dt; b.x += Math.sin(b.y / 9 + b.r) * 0.3;
          if (b.y < 66) { b.on = false; b.el.setAttribute('opacity', 0); return; }
          b.el.setAttribute('cx', b.x); b.el.setAttribute('cy', b.y); b.el.setAttribute('r', b.r); b.el.setAttribute('opacity', 1);
        });
      });
    }
  });

  // ---- Reactions 3: burning candle (combustion, exothermic), SMIL
  rxnExamples.push({
    kind: 'example',
    title: 'Real life: A burning candle',
    text: '<p>A candle flame is a reaction: <b>wax vapor + oxygen → carbon dioxide + water vapor</b>. It is <b>exothermic</b>, giving out heat and light. The wax slowly gets used up, but the atoms are not lost: they leave as new gases.</p>',
    svg: (function () {
      const mv = (path, dur, begin) => `<animateTransform attributeName="transform" type="translate" values="${path}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`;
      const o2 = (x0, x1, y, begin) => `<g opacity="0"><circle cx="-6" r="6" fill="var(--t-red)"/><circle cx="6" r="6" fill="var(--t-red)"/>${mv(`${x0} ${y};${x1} ${y - 8}`, 3, begin)}</g>`;
      const co2 = (x0, y0, x1, y1, begin) => `<g opacity="0"><circle cx="-11" r="5" fill="var(--t-red)"/><circle cx="11" r="5" fill="var(--t-red)"/><circle r="6.5" fill="#475569"/>${mv(`${x0} ${y0};${x1} ${y1}`, 3.4, begin)}</g>`;
      const h2o = (x0, y0, x1, y1, begin) => `<g opacity="0"><circle cx="-7" cy="6" r="3.5" fill="#e0f2fe" stroke="var(--t-blue)"/><circle cx="7" cy="6" r="3.5" fill="#e0f2fe" stroke="var(--t-blue)"/><circle r="6" fill="var(--t-red)"/>${mv(`${x0} ${y0};${x1} ${y1}`, 3.4, begin)}</g>`;
      return TutorialKit.svg(
        `<rect x="0" y="0" width="400" height="240" fill="#1e293b" opacity="0.08"/>` +
        `<circle cx="200" cy="105" r="44" fill="var(--t-yellow)" opacity="0.22"><animate attributeName="r" values="38;50;38" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0.15;0.3" dur="1.4s" repeatCount="indefinite"/></circle>` +
        `<rect x="176" y="126" width="48" height="84" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="2"><animate attributeName="y" values="126;138;126" keyTimes="0;0.5;1" dur="12s" repeatCount="indefinite"/><animate attributeName="height" values="84;72;84" keyTimes="0;0.5;1" dur="12s" repeatCount="indefinite"/></rect>` +
        `<line x1="200" y1="126" x2="200" y2="112" stroke="var(--t-ink)" stroke-width="3" stroke-linecap="round"><animate attributeName="y1" values="126;138;126" keyTimes="0;0.5;1" dur="12s" repeatCount="indefinite"/></line>` +
        `<g style="transform-box:fill-box;transform-origin:50% 100%"><path d="M200,72 Q222,98 214,112 Q200,122 186,112 Q178,98 200,72Z" fill="var(--t-orange)"/><path d="M200,90 Q210,104 206,112 Q200,118 194,112 Q190,104 200,90Z" fill="var(--t-yellow)"/>` +
        `<animateTransform attributeName="transform" type="scale" values="1 1;1.1 0.9;0.94 1.1;1 1" dur="0.6s" repeatCount="indefinite"/></g>` +
        `<line x1="240" y1="112" x2="266" y2="96" stroke="var(--t-yellow)" stroke-width="3" stroke-linecap="round"><animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite"/></line>` +
        `<line x1="160" y1="112" x2="134" y2="96" stroke="var(--t-yellow)" stroke-width="3" stroke-linecap="round"><animate attributeName="opacity" values="1;0.2;1" dur="0.8s" begin="0.4s" repeatCount="indefinite"/></line>` +
        o2(30, 150, 128, 0) + o2(60, 150, 150, 1.5) + o2(370, 250, 128, 0.8) + o2(340, 250, 150, 2.3) +
        co2(205, 76, 250, 26, 0.3) + co2(195, 76, 150, 26, 1.9) +
        h2o(210, 76, 300, 44, 1.1) + h2o(190, 76, 100, 44, 2.6) +
        `<text x="20" y="24" font-size="14" font-weight="800" fill="var(--t-red)">O₂ in</text>` +
        `<text x="20" y="208" font-size="13" fill="var(--t-muted)">exothermic:</text><text x="20" y="226" font-size="13" fill="var(--t-muted)">heat + light out</text>` +
        `<text x="380" y="24" text-anchor="end" font-size="14" font-weight="800" fill="#475569">CO₂ + H₂O out</text>` +
        `<text x="380" y="208" text-anchor="end" font-size="13" fill="var(--t-ink)">wax + O₂ →</text><text x="380" y="226" text-anchor="end" font-size="13" fill="var(--t-ink)">CO₂ + H₂O + energy</text>`
      );
    })()
  });

  // @@RXN@@

  // ---- Acids 1: red cabbage indicator in the kitchen (interactive)
  aciExamples.push({
    kind: 'example',
    title: 'Real life: Red cabbage juice',
    text: '<p>Red cabbage juice is a natural <b>indicator</b>. Its color depends on pH: <b>pink-red in acids</b>, purple in neutral water, <b>blue-green in bases</b>. Add a kitchen liquid and watch it change.</p>',
    mount: function (el, api) {
      const STOPS = [[0, [225, 29, 72]], [3, [244, 114, 182]], [5, [192, 132, 252]], [7, [139, 92, 246]], [8, [59, 130, 246]], [10, [20, 184, 166]], [12, [34, 197, 94]], [14, [234, 179, 8]]];
      function col(ph) {
        for (let i = 1; i < STOPS.length; i++) {
          if (ph <= STOPS[i][0]) {
            const a = STOPS[i - 1], b = STOPS[i], f = (ph - a[0]) / (b[0] - a[0]);
            return a[1].map((v, k) => v + (b[1][k] - v) * f);
          }
        }
        return STOPS[STOPS.length - 1][1];
      }
      const rgb = c => `rgb(${c.map(Math.round).join(',')})`;
      const ITEMS = [
        { id: 'lemon', label: 'Lemon', name: 'Lemon juice', ph: 2, kind: 'acid' },
        { id: 'water', label: 'Water', name: 'Plain water', ph: 7, kind: 'neutral' },
        { id: 'soda', label: 'Baking soda', name: 'Baking soda solution', ph: 8, kind: 'weak base' },
        { id: 'soap', label: 'Soap', name: 'Soapy water', ph: 10, kind: 'base' }
      ];
      let grad = '';
      for (let i = 0; i <= 14; i++) grad += `<stop offset="${(i / 14 * 100).toFixed(1)}%" stop-color="${rgb(col(i))}"/>`;
      const BX = 170, BW = 210;
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%">` +
        `<defs><linearGradient id="exaci-grad" x1="0" x2="1" y1="0" y2="0">${grad}</linearGradient><clipPath id="exaci-clip"><path d="M30 60 L30 160 Q30 168 38 168 L112 168 Q120 168 120 160 L120 60Z"/></clipPath></defs>` +
        `<g clip-path="url(#exaci-clip)"><rect id="exaci-liq" x="30" y="84" width="90" height="90" fill="rgb(139,92,246)"/>` +
        `<ellipse id="exaci-wave" cx="75" cy="84" rx="45" ry="4" fill="#fff" opacity="0.3"/></g>` +
        `<path d="M30 60 L30 160 Q30 168 38 168 L112 168 Q120 168 120 160 L120 60" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
        `<circle id="exaci-drop" cx="75" cy="10" r="6" fill="#fff" stroke="var(--t-ink)" stroke-width="2" opacity="0"/>` +
        `<text x="75" y="184" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">cabbage juice</text>` +
        `<text id="exaci-name" x="275" y="22" text-anchor="middle" font-size="16" font-weight="800" fill="var(--t-ink)">Pick a liquid</text>` +
        `<text id="exaci-kind" x="275" y="44" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-muted)"> </text>` +
        `<rect x="${BX}" y="96" width="${BW}" height="18" rx="9" fill="url(#exaci-grad)" stroke="var(--t-ink)" stroke-width="1.5"/>` +
        `<g id="exaci-mark"><path d="M0,90 L-8,76 L8,76Z" fill="var(--t-ink)"/><text y="68" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)" id="exaci-ph">pH 7</text></g>` +
        `<text x="${BX}" y="136" font-size="13" font-weight="700" fill="var(--t-red)">Acid</text>` +
        `<text x="${BX + BW / 2}" y="136" text-anchor="middle" font-size="13" font-weight="700" fill="#7c3aed">Neutral</text>` +
        `<text x="${BX + BW}" y="136" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-blue)">Base</text>` +
        `<text x="275" y="164" text-anchor="middle" font-size="13" fill="var(--t-muted)">The juice color shows the pH!</text>` +
        `</svg>` +
        `<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 6px">` +
        ITEMS.map(it => `<button type="button" class="scene-btn" data-i="${it.id}">${it.label}</button>`).join('') +
        `</div>`;
      const $ = id => el.querySelector('#' + id);
      let cur = col(7).slice(), target = col(7).slice(), ph = 7, shownPh = 7, dropT = -1, dropColor = '#fff';
      $('exaci-mark').setAttribute('transform', `translate(${BX + BW * 7 / 14},0)`);
      el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const it = ITEMS.find(x => x.id === b.dataset.i);
        ph = it.ph; target = col(ph);
        $('exaci-name').textContent = it.name;
        $('exaci-kind').textContent = it.kind;
        dropT = 0; dropColor = it.id === 'lemon' ? '#fef08a' : '#e0f2fe';
        el.querySelectorAll('button').forEach(o => { o.style.borderColor = o === b ? 'var(--primary)' : ''; o.style.color = o === b ? 'var(--primary)' : ''; });
      }));
      api.loop((t, dt) => {
        if (dropT >= 0) {
          dropT += dt;
          const d = $('exaci-drop');
          d.setAttribute('opacity', dropT < 0.7 ? 1 : 0);
          d.setAttribute('fill', dropColor);
          d.setAttribute('cy', 10 + Math.min(1, dropT / 0.6) * 62);
          if (dropT > 0.7) dropT = -1, d.setAttribute('opacity', 0);
        }
        const wait = dropT >= 0 && dropT < 0.6;
        if (!wait) {
          const f = Math.min(1, dt * 2.2);
          cur = cur.map((v, k) => v + (target[k] - v) * f);
          shownPh += (ph - shownPh) * f;
        }
        $('exaci-liq').setAttribute('fill', rgb(cur));
        $('exaci-mark').setAttribute('transform', `translate(${BX + BW * shownPh / 14},0)`);
        $('exaci-ph').textContent = 'pH ' + Math.round(shownPh);
        $('exaci-wave').setAttribute('cy', 84 + Math.sin(t * 3) * 1.5);
        $('exaci-wave').setAttribute('rx', 45 + Math.sin(t * 2) * 3);
      });
    }
  });

  // ---- Acids 2: brushing teeth, mouth pH over a snack-and-brush cycle (SMIL)
  aciExamples.push({
    kind: 'example',
    title: 'Real life: Sugar, acid and teeth',
    text: '<p>After a sugary snack, mouth bacteria make <b>acid</b>, so the pH drops. Below about pH 5.5 acid can start to dissolve tooth enamel. Toothpaste is mildly <b>basic</b>, so brushing helps neutralize the acid.</p>',
    svg: (function () {
      const D = 12;
      const anim = (attr, vals, kt, extra) => `<animate attributeName="${attr}" values="${vals}" keyTimes="${kt}" dur="${D}s" repeatCount="indefinite" ${extra || ''}/>`;
      const label = (txt, a, b) => `<text x="200" y="222" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)" opacity="0">${txt}` +
        anim('opacity', '0;0;1;1;0;0', `0;${Math.max(0, a - 0.02).toFixed(2)};${a};${b};${(b + 0.02).toFixed(2)};1`) + `</text>`;
      const bact = (x, y, i) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="#16a34a" stroke="#166534" stroke-width="1.5"><animateTransform attributeName="transform" type="translate" values="0 0;${4 - i * 2} ${i % 2 ? 4 : -4};0 0" dur="${1.4 + i * 0.3}s" repeatCount="indefinite"/></ellipse>`;
      const hplus = (x, y, i) => `<g opacity="0"><circle r="11" fill="#e5322d"/><text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">H⁺</text>` +
        `<animateTransform attributeName="transform" type="translate" values="${x + 24} ${y - 10};${x} ${y};${x + 5} ${y + 5}" dur="1.6s" begin="${(i * 0.4).toFixed(1)}s" repeatCount="indefinite"/>` +
        anim('opacity', '0;0;1;1;0;0', '0;0.28;0.32;0.56;0.6;1') + `</g>`;
      const MX = (ph) => (210 + (ph - 4) * 42.5).toFixed(1);
      return TutorialKit.svg(
        `<path d="M50,70 Q50,55 75,55 Q100,62 125,55 Q150,55 150,75 Q150,110 138,125 Q135,165 122,175 Q112,178 108,150 Q100,140 92,150 Q88,178 78,175 Q65,165 62,125 Q50,110 50,70Z" fill="#fff" stroke="#94a3b8" stroke-width="4"/>` +
        `<circle cx="98" cy="84" r="0" fill="#a16207"><animate attributeName="r" values="0;0;9;9;0;0" keyTimes="0;0.3;0.6;0.6;0.75;1" dur="${D}s" repeatCount="indefinite"/></circle>` +
        bact(36, 96, 0) + bact(158, 92, 1) + bact(104, 46, 2) +
        [[168, 118], [40, 130], [72, 46], [140, 42]].map((p, i) => hplus(p[0] - 12, p[1] - 10, i)).join('') +
        // sugar cube drops in during phase 1
        `<g opacity="0"><rect x="-9" y="-9" width="18" height="18" rx="3" fill="#fff" stroke="var(--t-muted)" stroke-width="1.5"/><text y="4" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">S</text>` +
        `<animateTransform attributeName="transform" type="translate" values="30 20;30 20;40 100;40 100" keyTimes="0;0.03;0.2;1" dur="${D}s" repeatCount="indefinite"/>` +
        anim('opacity', '0;1;1;0;0', '0;0.03;0.16;0.2;1') + `</g>` +
        // toothbrush sweeping in phase 3
        `<g opacity="0"><rect x="22" y="-6" width="48" height="12" rx="5" fill="var(--t-teal)"/><rect x="-14" y="-9" width="38" height="18" rx="3" fill="#fff" stroke="var(--t-ink)" stroke-width="2"/>` +
        `<path d="M-8,-9 v-8 M0,-9 v-8 M8,-9 v-8 M16,-9 v-8" stroke="var(--t-blue)" stroke-width="3" stroke-linecap="round"/>` +
        `<animateTransform attributeName="transform" type="translate" values="118 92;136 92;114 92;136 92;114 92;118 92" keyTimes="0;0.68;0.74;0.8;0.86;1" dur="${D}s" repeatCount="indefinite"/>` +
        anim('opacity', '0;0;1;1;0;0', '0;0.62;0.64;0.88;0.9;1') + `</g>` +
        `<text x="100" y="196" text-anchor="middle" font-size="13" fill="var(--t-muted)">tooth enamel</text>` +
        // pH meter
        `<text x="295" y="60" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)">Mouth pH</text>` +
        `<defs><linearGradient id="exaci-tg" x1="0" x2="1"><stop offset="0" stop-color="#e11d48"/><stop offset="0.5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs>` +
        `<rect x="210" y="104" width="170" height="16" rx="8" fill="url(#exaci-tg)" stroke="var(--t-ink)" stroke-width="1.5"/>` +
        `<line x1="${MX(5.5)}" y1="98" x2="${MX(5.5)}" y2="126" stroke="var(--t-ink)" stroke-width="2" stroke-dasharray="3 3"/>` +
        `<text x="210" y="142" font-size="13" font-weight="700" fill="var(--t-red)">acid</text><text x="380" y="142" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-blue)">base</text>` +
        `<text x="295" y="164" text-anchor="middle" font-size="13" fill="var(--t-muted)">dashed line: pH 5.5</text><text x="295" y="182" text-anchor="middle" font-size="13" fill="var(--t-muted)">below it, enamel suffers</text>` +
        `<g><path d="M0,102 L-7,90 L7,90Z" fill="var(--t-ink)"/>` +
        `<text y="84" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)" opacity="1">pH 7<animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="0;0.1;0.12;0.68;0.7;1" dur="${D}s" repeatCount="indefinite"/></text>` +
        `<text y="84" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-red)" opacity="0">pH 5<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.1;0.12;0.68;0.7;1" dur="${D}s" repeatCount="indefinite"/></text>` +
        `<animateTransform attributeName="transform" type="translate" values="${MX(7)} 0;${MX(7)} 0;${MX(5)} 0;${MX(5)} 0;${MX(7)} 0;${MX(7)} 0" keyTimes="0;0.08;0.4;0.62;0.85;1" dur="${D}s" repeatCount="indefinite"/></g>` +
        label('1. Sugar feeds the bacteria', 0.02, 0.26) +
        label('2. Bacteria make acid', 0.3, 0.56) +
        label('3. Toothpaste (a base) neutralizes acid', 0.62, 0.94)
      );
    })()
  });

  // ---- Acids 3: hydrangea color follows soil pH (interactive slider)
  aciExamples.push({
    kind: 'example',
    title: 'Real life: Garden soil pH',
    text: '<p>Gardeners use pH! Hydrangea flowers come out <b>blue in acidic soil</b> and <b>pink in basic soil</b>. Adding garden lime (a base) raises the soil pH. Slide the pH and watch the flowers change.</p>',
    mount: function (el, api) {
      const STOPS = [[4, [59, 130, 246]], [5.5, [99, 102, 241]], [6, [168, 85, 247]], [6.8, [236, 72, 153]], [8, [244, 114, 182]]];
      function col(ph) {
        for (let i = 1; i < STOPS.length; i++) {
          if (ph <= STOPS[i][0]) { const a = STOPS[i - 1], b = STOPS[i], f = (ph - a[0]) / (b[0] - a[0]); return a[1].map((v, k) => v + (b[1][k] - v) * f); }
        }
        return STOPS[STOPS.length - 1][1];
      }
      const BL = [[0, 0, 15]];
      for (let i = 0; i < 6; i++) BL.push([Math.cos(i * 1.047) * 24, Math.sin(i * 1.047) * 24, 14]);
      for (let i = 0; i < 6; i++) BL.push([Math.cos(i * 1.047 + 0.5) * 44, Math.sin(i * 1.047 + 0.5) * 44, 13]);
      let blooms = '';
      BL.forEach((b, i) => { blooms += `<circle id="exaci-f${i}" cx="${b[0]}" cy="${b[1]}" r="${b[2]}"/>`; });
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%">` +
        `<ellipse cx="70" cy="112" rx="30" ry="12" fill="#16a34a"/><ellipse cx="150" cy="112" rx="30" ry="12" fill="#15803d"/>` +
        `<rect x="106" y="96" width="8" height="44" fill="#15803d"/>` +
        `<g id="exaci-bloom" transform="translate(110,62)">${blooms}</g>` +
        `<path d="M62 138 L158 138 L150 182 L70 182Z" fill="#c2410c" stroke="#7c2d12" stroke-width="2"/>` +
        `<rect x="62" y="138" width="96" height="14" fill="#78350f"/>` +
        `<text x="110" y="168" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">soil</text>` +
        `<text id="exaci-sph" x="290" y="34" text-anchor="middle" font-size="26" font-weight="800" fill="var(--t-ink)">pH 5.0</text>` +
        `<text id="exaci-scat" x="290" y="56" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-red)">Acidic soil</text>` +
        `<text id="exaci-scol" x="290" y="82" text-anchor="middle" font-size="15" font-weight="800" fill="var(--t-blue)">Blue flowers</text>` +
        `<defs><linearGradient id="exaci-hg" x1="0" x2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="0.4" stop-color="#6366f1"/><stop offset="0.55" stop-color="#a855f7"/><stop offset="0.8" stop-color="#ec4899"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs>` +
        `<rect x="200" y="116" width="180" height="14" rx="7" fill="url(#exaci-hg)" stroke="var(--t-ink)" stroke-width="1.5"/>` +
        `<path id="exaci-hm" d="M0,112 L-7,98 L7,98Z" fill="var(--t-ink)"/>` +
        `<text x="200" y="154" font-size="13" font-weight="700" fill="var(--t-blue)">pH 4</text><text x="380" y="154" text-anchor="end" font-size="13" font-weight="700" fill="#db2777">pH 8</text>` +
        `<text x="290" y="176" text-anchor="middle" font-size="13" fill="var(--t-muted)">lime (a base) raises pH</text>` +
        `</svg>` +
        `<div class="scene-slider-row"><span>Soil pH</span><input type="range" id="exaci-s" min="4" max="8" step="0.1" value="5"><span id="exaci-sv">5.0</span></div>`;
      const $ = id => el.querySelector('#' + id);
      const sl = $('exaci-s');
      const fl = BL.map((b, i) => $('exaci-f' + i));
      let shown = +sl.value;
      function upd() {
        const ph = +sl.value;
        $('exaci-sv').textContent = ph.toFixed(1);
        $('exaci-sph').textContent = 'pH ' + ph.toFixed(1);
        const cat = $('exaci-scat');
        cat.textContent = ph < 6.5 ? 'Acidic soil' : ph <= 7.5 ? 'Nearly neutral soil' : 'Basic soil';
        cat.setAttribute('fill', ph < 6.5 ? '#dc2626' : ph <= 7.5 ? '#7c3aed' : '#0284c7');
        const c = $('exaci-scol');
        c.textContent = ph < 5.5 ? 'Blue flowers' : ph < 6.5 ? 'Purple flowers' : 'Pink flowers';
        c.setAttribute('fill', ph < 5.5 ? '#2563eb' : ph < 6.5 ? '#9333ea' : '#db2777');
        $('exaci-hm').setAttribute('transform', `translate(${200 + (ph - 4) / 4 * 180},0)`);
      }
      sl.addEventListener('input', upd);
      upd();
      api.loop((t, dt) => {
        shown += (+sl.value - shown) * Math.min(1, dt * 3);
        const c = col(shown);
        fl.forEach((f, i) => {
          const s = 1 + Math.sin(t * 1.6 + i) * 0.06, l = 1 + (i % 3 - 1) * 0.06;
          f.setAttribute('fill', `rgb(${c.map(v => Math.max(0, Math.min(255, Math.round(v * l)))).join(',')})`);
          f.setAttribute('r', BL[i][2] * s);
        });
        $('exaci-bloom').setAttribute('transform', `translate(110,62) rotate(${Math.sin(t * 1.1) * 3})`);
      });
    }
  });

  // @@ACI@@

  // ---- Periodic 1: noble gases in balloons and signs (SMIL)
  perExamples.push({
    kind: 'example',
    title: 'Real life: Balloons and neon signs',
    text: '<p>Helium (balloons) and neon (glowing signs) are <b>noble gases</b> from <b>Group 18</b>. Their outer shell is full, so they almost never react. That makes helium safe to float and neon safe to glow.</p>',
    svg: (function () {
      const tube = 'M272,112 C272,66 306,66 306,104 C306,142 338,142 338,98 C338,58 372,58 372,100';
      const spark = (b) => `<circle r="3.5" fill="#fff"><animateMotion dur="2.4s" begin="${b}s" repeatCount="indefinite" path="${tube}"/></circle>`;
      const balloon = (cx, cy, c, hi) => `<ellipse cx="${cx}" cy="${cy}" rx="21" ry="26" fill="${c}"/><ellipse cx="${cx - 7}" cy="${cy - 9}" rx="5" ry="8" fill="#fff" opacity="0.45"/>` +
        `<path d="M${cx},${cy + 26} L${cx - 3},${cy + 31} L${cx + 3},${cy + 31}Z" fill="${c}"/><path d="M${cx},${cy + 31} Q${cx + (hi ? 8 : -8)},${cy + 60} 78,168" fill="none" stroke="var(--t-muted)" stroke-width="1.5"/>`;
      return TutorialKit.svg(
        `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -9;0 0" dur="3s" repeatCount="indefinite"/>` +
        balloon(44, 66, 'var(--t-red)', false) + balloon(112, 66, 'var(--t-blue)', true) + balloon(78, 44, 'var(--t-yellow)', false) + `</g>` +
        `<rect x="70" y="166" width="16" height="9" rx="2" fill="var(--t-muted)"/>` +
        `<circle cx="200" cy="100" r="38" fill="none" stroke="var(--t-muted)" stroke-width="2" stroke-dasharray="4 4"/>` +
        `<circle cx="200" cy="100" r="16" fill="var(--t-orange)"/><text x="200" y="105" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">He</text>` +
        `<g><circle cx="238" cy="100" r="6" fill="var(--t-blue)"/><circle cx="162" cy="100" r="6" fill="var(--t-blue)"/><animateTransform attributeName="transform" type="rotate" values="0 200 100;360 200 100" dur="3.5s" repeatCount="indefinite"/></g>` +
        `<text x="214" y="42" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">2 electrons: shell full</text>` +
        `<path d="${tube}" fill="none" stroke="#fb923c" stroke-width="20" stroke-linecap="round" opacity="0.28"><animate attributeName="opacity" values="0.15;0.4;0.15" dur="1.6s" repeatCount="indefinite"/></path>` +
        `<path d="${tube}" fill="none" stroke="#f97316" stroke-width="9" stroke-linecap="round"/>` +
        `<path d="${tube}" fill="none" stroke="#fed7aa" stroke-width="3" stroke-linecap="round"/>` +
        spark(0) + spark(0.8) + spark(1.6) +
        `<rect x="262" y="112" width="18" height="10" rx="2" fill="var(--t-ink)"/><rect x="364" y="102" width="18" height="10" rx="2" fill="var(--t-ink)"/>` +
        `<text x="78" y="196" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)">Helium (He)</text>` +
        `<text x="200" y="176" text-anchor="middle" font-size="13" fill="var(--t-muted)">helium atom</text>` +
        `<text x="322" y="196" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)">Neon (Ne)</text>` +
        `<text x="200" y="220" text-anchor="middle" font-size="13" fill="var(--t-muted)">Group 18: full outer shell, so they rarely react</text>`
      );
    })()
  });

  // ---- Periodic 2: circuit tester, metals vs nonmetals (interactive)
  perExamples.push({
    kind: 'example',
    title: 'Real life: Does it conduct?',
    text: '<p>Test an element in a circuit. <b>Metals</b> (copper wires, aluminum foil, iron nails) let electrons flow, so the bulb lights. <b>Nonmetals</b> like sulfur do not conduct. That is why wires are metal and plugs are coated in plastic.</p>',
    mount: function (el, api) {
      const ITEMS = [
        { id: 'cu', label: 'Copper', name: 'Copper (Cu)', metal: true, fill: '#c2410c' },
        { id: 'al', label: 'Al foil', name: 'Aluminum (Al)', metal: true, fill: '#cbd5e1' },
        { id: 'fe', label: 'Iron', name: 'Iron (Fe)', metal: true, fill: '#64748b' },
        { id: 's', label: 'Sulfur', name: 'Sulfur (S)', metal: false, fill: '#facc15' }
      ];
      const X0 = 40, X1 = 360, Y0 = 56, Y1 = 132, W = X1 - X0, H = Y1 - Y0, P = 2 * (W + H);
      function pt(s) {
        s = ((s % P) + P) % P;
        if (s < W) return [X0 + s, Y0];
        s -= W; if (s < H) return [X1, Y0 + s];
        s -= H; if (s < W) return [X1 - s, Y1];
        s -= W; return [X0, Y1 - s];
      }
      const NE = 18;
      let els = '';
      for (let i = 0; i < NE; i++) els += `<circle id="exper-e${i}" r="4" fill="#38bdf8" stroke="#0369a1" stroke-width="1"/>`;
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%">` +
        `<rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="none" stroke="var(--t-muted)" stroke-width="3"/>` +
        `<rect x="${X0 - 14}" y="86" width="28" height="30" fill="#e5e7eb" stroke="none"/>` +
        `<line x1="${X0 - 12}" y1="90" x2="${X0 + 12}" y2="90" stroke="var(--t-ink)" stroke-width="4"/><line x1="${X0 - 6}" y1="106" x2="${X0 + 6}" y2="106" stroke="var(--t-ink)" stroke-width="4"/>` +
        `<text x="${X0 + 20}" y="98" font-size="13" fill="var(--t-muted)">battery</text>` +
        `<rect x="150" y="${Y1 - 6}" width="100" height="12" rx="4" id="exper-bar" fill="#c2410c" stroke="var(--t-ink)" stroke-width="2"/>` +
        `<circle id="exper-glow" cx="200" cy="${Y0}" r="30" fill="#fde047" opacity="0"/>` +
        `<circle id="exper-bulb" cx="200" cy="${Y0}" r="15" fill="#e5e7eb" stroke="var(--t-ink)" stroke-width="2.5"/>` +
        `<path d="M193,${Y0 + 4} L197,${Y0 - 4} L200,${Y0 + 3} L203,${Y0 - 4} L207,${Y0 + 4}" fill="none" stroke="var(--t-ink)" stroke-width="1.5"/>` +
        `<text x="224" y="${Y0 - 24}" font-size="13" fill="var(--t-muted)">bulb</text>` +
        els +
        `<text id="exper-res" x="200" y="18" text-anchor="middle" font-size="15" font-weight="800" fill="var(--t-ink)"> </text>` +
        `<text id="exper-name" x="200" y="164" text-anchor="middle" font-size="14" font-weight="800" fill="var(--t-ink)"> </text>` +
        `<text id="exper-note" x="200" y="184" text-anchor="middle" font-size="13" fill="var(--t-muted)"> </text>` +
        `</svg>` +
        `<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 6px">` +
        ITEMS.map(it => `<button type="button" class="scene-btn" data-i="${it.id}">${it.label}</button>`).join('') + `</div>`;
      const $ = id => el.querySelector('#' + id);
      const es = [];
      for (let i = 0; i < NE; i++) es.push($('exper-e' + i));
      let cur = ITEMS[0], glow = 0, off = 0;
      function pick(it) {
        cur = it;
        $('exper-bar').setAttribute('fill', it.fill);
        $('exper-name').textContent = it.name + (it.metal ? ': a metal' : ': a nonmetal');
        $('exper-note').textContent = it.metal ? 'shiny, conducts electricity' : 'brittle yellow solid, insulator';
        const r = $('exper-res');
        r.textContent = it.metal ? 'Bulb ON: electrons flow' : 'Bulb OFF: no flow';
        r.setAttribute('fill', it.metal ? '#a16207' : '#6b7280');
        el.querySelectorAll('button').forEach(o => { const on = o.dataset.i === it.id; o.style.borderColor = on ? 'var(--primary)' : ''; o.style.color = on ? 'var(--primary)' : ''; });
      }
      el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => pick(ITEMS.find(x => x.id === b.dataset.i))));
      pick(cur);
      api.loop((t, dt) => {
        if (cur.metal) off += 120 * dt;
        glow += ((cur.metal ? 1 : 0) - glow) * Math.min(1, dt * 5);
        $('exper-glow').setAttribute('opacity', (glow * (0.45 + 0.1 * Math.sin(t * 8))).toFixed(3));
        $('exper-bulb').setAttribute('fill', glow > 0.5 ? '#fde047' : '#e5e7eb');
        es.forEach((e, i) => {
          const p = pt(off + i * P / NE + (cur.metal ? 0 : Math.sin(t * 5 + i) * 2));
          e.setAttribute('cx', p[0]); e.setAttribute('cy', p[1]);
        });
      });
    }
  });

  // ---- Periodic 3: find the element in everyday objects (interactive)
  perExamples.push({
    kind: 'example',
    title: 'Real life: Find the element',
    text: '<p>Elements are everywhere! Tap an everyday object to find the element it is made of, and where that element lives on the periodic table. Neighbors in the same <b>group</b> (column) behave alike.</p>',
    mount: function (el, api) {
      // [Z, symbol, column, row, class]  (m metal, l metalloid, n nonmetal, g noble gas)
      const EL = [[1, 'H', 1, 1, 'n'], [2, 'He', 18, 1, 'g'],
        [3, 'Li', 1, 2, 'm'], [4, 'Be', 2, 2, 'm'], [5, 'B', 13, 2, 'l'], [6, 'C', 14, 2, 'n'], [7, 'N', 15, 2, 'n'], [8, 'O', 16, 2, 'n'], [9, 'F', 17, 2, 'n'], [10, 'Ne', 18, 2, 'g'],
        [11, 'Na', 1, 3, 'm'], [12, 'Mg', 2, 3, 'm'], [13, 'Al', 13, 3, 'm'], [14, 'Si', 14, 3, 'l'], [15, 'P', 15, 3, 'n'], [16, 'S', 16, 3, 'n'], [17, 'Cl', 17, 3, 'n'], [18, 'Ar', 18, 3, 'g']];
      const FILL = { m: '#bfdbfe', l: '#fde68a', n: '#bbf7d0', g: '#e9d5ff' };
      const KIND = { m: 'metal', l: 'metalloid', n: 'nonmetal', g: 'noble gas' };
      const ITEMS = [
        { id: 'balloon', label: 'Balloon', name: 'Party balloon gas', z: 2 },
        { id: 'foil', label: 'Foil', name: 'Aluminum foil', z: 13 },
        { id: 'pencil', label: 'Pencil', name: 'Pencil "lead" (graphite)', z: 6 },
        { id: 'battery', label: 'Battery', name: 'Phone battery metal', z: 3 },
        { id: 'chip', label: 'Chip', name: 'Computer chip', z: 14 },
        { id: 'sign', label: 'Neon sign', name: 'Red-orange glowing sign', z: 10 }
      ];
      const NAMES = { 2: 'helium', 13: 'aluminum', 6: 'carbon', 3: 'lithium', 14: 'silicon', 10: 'neon' };
      const PX = 22, PY = 24, X0 = 3, Y0 = 26;
      const cx = c => X0 + (c - 1) * PX + 10.5, cy = r => Y0 + (r - 1) * PY + 12;
      let cells = '';
      EL.forEach(e => {
        cells += `<g id="exper-c${e[0]}"><rect x="${cx(e[2]) - 10.5}" y="${cy(e[3]) - 11.5}" width="21" height="23" rx="3" fill="${FILL[e[4]]}" stroke="#94a3b8" stroke-width="1"/>` +
          `<text x="${cx(e[2])}" y="${cy(e[3]) + 4.5}" text-anchor="middle" font-size="13" font-weight="700" fill="#1f2937">${e[1]}</text></g>`;
      });
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%">` +
        `<text x="200" y="16" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">Periodic table: elements 1 to 18</text>` +
        cells +
        `<text x="156" y="${cy(2.5)}" text-anchor="middle" font-size="13" fill="var(--t-muted)">(transition metals not shown)</text>` +
        `<rect id="exper-ring" x="0" y="0" width="21" height="23" rx="3" fill="none" stroke="var(--t-orange)" stroke-width="3" opacity="0"/>` +
        `<circle id="exper-tok" r="8" fill="var(--t-orange)" opacity="0"/>` +
        `<text id="exper-l1" x="200" y="132" text-anchor="middle" font-size="16" font-weight="800" fill="var(--t-ink)">Pick an object below</text>` +
        `<text id="exper-l2" x="200" y="154" text-anchor="middle" font-size="14" font-weight="700" fill="var(--primary)"> </text>` +
        `<text id="exper-l3" x="200" y="176" text-anchor="middle" font-size="13" fill="var(--t-muted)"> </text>` +
        `</svg>` +
        `<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 6px">` +
        ITEMS.map(it => `<button type="button" class="scene-btn" data-i="${it.id}">${it.label}</button>`).join('') + `</div>`;
      const $ = id => el.querySelector('#' + id);
      const ring = $('exper-ring'), tok = $('exper-tok');
      let sel = null, fly = 0, from = [200, 122];
      function group(e) { return e[2] <= 2 ? e[2] : e[2]; }
      function pick(it) {
        if (sel) { const r = $('exper-c' + sel.z).querySelector('rect'); const e0 = EL.find(x => x[0] === sel.z); r.setAttribute('fill', FILL[e0[4]]); r.setAttribute('stroke', '#94a3b8'); r.setAttribute('stroke-width', 1); }
        sel = it;
        const e = EL.find(x => x[0] === it.z);
        const r = $('exper-c' + it.z).querySelector('rect');
        r.setAttribute('fill', '#fb923c'); r.setAttribute('stroke', '#1f2937'); r.setAttribute('stroke-width', 2);
        $('exper-c' + it.z).parentNode.appendChild($('exper-c' + it.z));
        $('exper-l1').textContent = it.name + ' = ' + NAMES[it.z] + ' (' + e[1] + ')';
        $('exper-l2').textContent = 'Atomic number ' + e[0] + ' · Group ' + group(e) + ' · Period ' + e[3];
        $('exper-l3').textContent = 'a ' + KIND[e[4]] + (e[4] === 'g' ? ': very unreactive' : e[4] === 'm' ? ': shiny, conducts' : e[4] === 'l' ? ': in between a metal and a nonmetal' : ': does not conduct well');
        fly = 0.001;
        ring.parentNode.appendChild(ring); ring.parentNode.appendChild(tok);
        el.querySelectorAll('button').forEach(o => { const on = o.dataset.i === it.id; o.style.borderColor = on ? 'var(--primary)' : ''; o.style.color = on ? 'var(--primary)' : ''; });
      }
      el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => pick(ITEMS.find(x => x.id === b.dataset.i))));
      pick(ITEMS[0]);
      api.loop((t, dt) => {
        if (!sel) return;
        const e = EL.find(x => x[0] === sel.z), tx = cx(e[2]), ty = cy(e[3]);
        if (fly > 0 && fly < 1) {
          fly = Math.min(1, fly + dt / 0.7);
          const k = 1 - Math.pow(1 - fly, 3);
          tok.setAttribute('cx', from[0] + (tx - from[0]) * k); tok.setAttribute('cy', from[1] + (ty - from[1]) * k - Math.sin(k * Math.PI) * 18);
          tok.setAttribute('opacity', fly < 1 ? 1 : 0);
        } else tok.setAttribute('opacity', 0);
        const s = 1 + 0.25 * (0.5 + 0.5 * Math.sin(t * 5));
        ring.setAttribute('width', 21 * s); ring.setAttribute('height', 23 * s);
        ring.setAttribute('x', tx - 10.5 * s); ring.setAttribute('y', ty - 11.5 * s);
        ring.setAttribute('opacity', 0.9 - 0.4 * (s - 1) / 0.25);
      });
    }
  });

  // @@PER@@

  addTutorialSteps('chemistry', 'reactions', rxnExamples);
  addTutorialSteps('chemistry', 'acids', aciExamples);
  addTutorialSteps('chemistry', 'periodic', perExamples);
})();
