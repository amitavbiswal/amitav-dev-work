(function () {
  // Chemistry tutorials (part b), registered via registerTutorial('chemistry', topicId, {...}).
  // Topics: mixtures (Mixtures & Solutions), reactions (Chemical Reactions).

  const SVGNS = 'http://www.w3.org/2000/svg';
  // A particle that wobbles gently in place (SMIL). i varies the path/duration per particle.
  function wobble(cx, cy, r, fill, i, amp, extra) {
    const a = amp || 8;
    const dx = ((i * 37) % 11 - 5) / 5 * a;
    const dy = ((i * 53) % 9 - 4) / 4 * a;
    const dur = (2.6 + (i % 5) * 0.55).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra || ''}>` +
      `<animateTransform attributeName="transform" type="translate" values="0 0;${dx.toFixed(1)} ${dy.toFixed(1)};${(-dy).toFixed(1)} ${(dx * 0.6).toFixed(1)};0 0" dur="${dur}s" repeatCount="indefinite"/></circle>`;
  }

  // ------------------------------------------------------------------
  // TOPIC: Mixtures & Solutions
  // ------------------------------------------------------------------
  const mixSteps = [];

  // ---- Step 1: mixture vs compound
  mixSteps.push({
    title: 'Mixture or compound?',
    text: '<p>A <b>mixture</b> is two or more substances just <b>physically combined</b>. Each keeps its own properties, in any amounts. A <b>compound</b> has atoms <b>chemically bonded</b> in a fixed ratio.</p>',
    svg: (function () {
      let mixP = '';
      const A = [[30, 70], [95, 95], [60, 140], [150, 70], [125, 160]];
      const B = [[70, 65], [140, 120], [45, 105]];
      A.forEach((p, i) => { mixP += wobble(p[0], p[1] + 20, 11, 'var(--t-orange)', i, 9); });
      B.forEach((p, i) => { mixP += wobble(p[0] + 20, p[1] + 25, 8, 'var(--t-blue)', i + 7, 9); });
      let compP = '';
      const pairs = [[230, 70], [300, 75], [255, 125], [335, 130], [225, 155], [305, 160]];
      pairs.forEach((p, i) => {
        const dx = (((i * 5) % 7) - 3) * 3, dy = (((i * 3) % 5) - 2) * 3;
        compP += `<g><line x1="${p[0]}" y1="${p[1] + 20}" x2="${p[0] + 26}" y2="${p[1] + 20}" stroke="var(--t-ink)" stroke-width="3"/>` +
          `<circle cx="${p[0]}" cy="${p[1] + 20}" r="11" fill="var(--t-orange)"/><circle cx="${p[0] + 26}" cy="${p[1] + 20}" r="8" fill="var(--t-blue)"/>` +
          `<animateTransform attributeName="transform" type="translate" values="0 0;${dx} ${dy};${-dy} ${dx};0 0" dur="${(3 + i * 0.4).toFixed(1)}s" repeatCount="indefinite"/></g>`;
      });
      return TutorialKit.svg(
        `<rect x="8" y="30" width="186" height="160" rx="12" fill="#fff" stroke="var(--border,#e5e7eb)" stroke-width="2"/>` +
        `<rect x="206" y="30" width="186" height="160" rx="12" fill="#fff" stroke="var(--border,#e5e7eb)" stroke-width="2"/>` +
        `<text x="101" y="21" text-anchor="middle" font-size="16" font-weight="700" fill="var(--t-ink)">Mixture</text>` +
        `<text x="299" y="21" text-anchor="middle" font-size="16" font-weight="700" fill="var(--t-ink)">Compound</text>` +
        `<g transform="translate(-4 -8)">${mixP}</g><g transform="translate(6 -2)">${compP}</g>` +
        `<text x="101" y="213" text-anchor="middle" font-size="13" fill="var(--t-muted)">Separate, any amounts</text>` +
        `<text x="299" y="213" text-anchor="middle" font-size="13" fill="var(--t-muted)">Bonded, fixed ratio</text>`
      );
    })()
  });

  // ---- Step 2: sugar dissolving (interactive: temperature + stir)
  mixSteps.push({
    title: 'Sugar dissolving in water',
    text: '<p>In a <b>solution</b>, the <b>solute</b> (sugar) spreads out between particles of the <b>solvent</b> (water). It is a physical change, so no sugar is lost. Heat and stirring make it dissolve faster.</p>',
    mount: function (el, api) {
      const X0 = 44, X1 = 236, Y0 = 52, Y1 = 186, N = 24, NW = 30;
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1;min-height:0;height:auto;width:100%">` +
        `<rect x="42" y="${Y0 - 2}" width="196" height="${Y1 - Y0 + 4}" fill="var(--t-blue)" opacity="0.18"/>` +
        `<clipPath id="mix-dis-clip"><rect x="42" y="30" width="196" height="30"/></clipPath>` +
        `<g clip-path="url(#mix-dis-clip)"><path d="M18 ${Y0} q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="var(--t-blue)" stroke-width="2.5" opacity="0.7"><animateTransform attributeName="transform" type="translate" values="0 0;24 0" dur="1.6s" repeatCount="indefinite"/></path></g>` +
        `<g id="mix-dis-water"></g><g id="mix-dis-sugar"></g>` +
        `<line id="mix-dis-rod" x1="140" y1="8" x2="140" y2="150" stroke="var(--t-muted)" stroke-width="5" stroke-linecap="round" opacity="0"/>` +
        `<path d="M40 14 L40 186 Q40 190 44 190 L236 190 Q240 190 240 186 L240 14" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
        `<text x="256" y="36" font-size="14" font-weight="700" fill="var(--t-ink)">Sugar (solute)</text>` +
        `<text x="256" y="60" font-size="13" fill="var(--t-muted)">Dissolved: <tspan id="mix-dis-n" font-weight="700" fill="var(--t-ink)">0</tspan></text>` +
        `<text x="256" y="80" font-size="13" fill="var(--t-muted)">Still solid: <tspan id="mix-dis-s" font-weight="700" fill="var(--t-ink)">24</tspan></text>` +
        `<text x="256" y="106" font-size="13" fill="var(--t-muted)">Total sugar: ${N}</text>` +
        `<text x="256" y="123" font-size="13" fill="var(--t-green)">(none is lost!)</text>` +
        `<text id="mix-dis-msg" x="256" y="152" font-size="13" font-weight="700" fill="var(--t-orange)"></text>` +
        `<text id="mix-dis-msg2" x="256" y="169" font-size="13" fill="var(--t-orange)"></text>` +
        `</svg>` +
        `<div class="scene-slider-row"><span>Temp</span><input type="range" id="mix-dis-temp" min="10" max="80" value="25" aria-label="Water temperature"><span id="mix-dis-tv" style="min-width:42px;text-align:right">25°C</span></div>` +
        `<div class="scene-slider-row" style="justify-content:center;padding-top:0"><button type="button" class="scene-btn" id="mix-dis-stir">Stir</button><button type="button" class="scene-btn" id="mix-dis-reset">Reset</button></div>`;
      const $ = id => el.querySelector('#' + id);
      const wg = $('mix-dis-water'), sg = $('mix-dis-sugar');
      const water = [], sugar = [];
      const mk = (g, r, fill) => { const c = document.createElementNS(SVGNS, 'circle'); c.setAttribute('r', r); c.setAttribute('fill', fill); g.appendChild(c); return c; };
      for (let i = 0; i < NW; i++) water.push({ n: mk(wg, 3.5, 'var(--t-blue)'), x: X0 + 6 + Math.random() * (X1 - X0 - 12), y: Y0 + 6 + Math.random() * (Y1 - Y0 - 12), a: Math.random() * 6.28 });
      for (let i = 0; i < N; i++) sugar.push({ n: mk(sg, 5, '#f5b301'), i: i, free: false, x: 0, y: 0, a: Math.random() * 6.28 });
      function reset() {
        sugar.forEach((p, i) => { p.free = false; p.x = 96 + (i % 8) * 11 + (Math.floor(i / 8) % 2) * 5; p.y = 179 - Math.floor(i / 8) * 10; });
      }
      reset();
      let stir = 0;
      $('mix-dis-stir').addEventListener('click', () => { stir = 3; });
      $('mix-dis-reset').addEventListener('click', () => { reset(); stir = 0; });
      const tSlider = $('mix-dis-temp');
      tSlider.addEventListener('input', () => { $('mix-dis-tv').textContent = tSlider.value + '°C'; });
      function move(p, speed, dt) {
        p.a += (Math.random() - 0.5) * 9 * dt;
        p.x += Math.cos(p.a) * speed * dt; p.y += Math.sin(p.a) * speed * dt;
        if (p.x < X0 + 5) { p.x = X0 + 5; p.a = Math.PI - p.a; } if (p.x > X1 - 5) { p.x = X1 - 5; p.a = Math.PI - p.a; }
        if (p.y < Y0 + 5) { p.y = Y0 + 5; p.a = -p.a; } if (p.y > Y1 - 5) { p.y = Y1 - 5; p.a = -p.a; }
      }
      api.loop(function (t, dt) {
        const temp = +tSlider.value;
        const cap = Math.round(14 + (temp - 10) / 70 * 10);
        const speed = (10 + temp * 0.6) * (stir > 0 ? 2.6 : 1);
        const rate = (0.04 + (temp - 10) * 0.012) * (stir > 0 ? 4 : 1);
        if (stir > 0) stir -= dt;
        $('mix-dis-rod').setAttribute('opacity', stir > 0 ? 1 : 0);
        $('mix-dis-rod').setAttribute('x1', 140 + Math.sin(t * 9) * 45);
        let dissolved = sugar.filter(p => p.free).length;
        const solids = sugar.filter(p => !p.free).sort((a, b) => a.y - b.y);
        for (let k = 0; k < Math.min(8, solids.length); k++) {
          if (dissolved < cap && Math.random() < rate * dt) { solids[k].free = true; dissolved++; }
        }
        water.forEach(p => { move(p, speed * 0.8, dt); p.n.setAttribute('cx', p.x.toFixed(1)); p.n.setAttribute('cy', p.y.toFixed(1)); });
        sugar.forEach(p => { if (p.free) move(p, speed, dt); p.n.setAttribute('cx', p.x.toFixed(1)); p.n.setAttribute('cy', p.y.toFixed(1)); });
        $('mix-dis-n').textContent = dissolved;
        $('mix-dis-s').textContent = N - dissolved;
        const full = dissolved >= cap && dissolved < N;
        $('mix-dis-msg').textContent = full ? 'Saturated!' : '';
        $('mix-dis-msg2').textContent = full ? 'Heat it for more.' : '';
      });
    }
  });

  // ---- Step 3: homogeneous vs heterogeneous
  mixSteps.push({
    title: 'Even or uneven?',
    text: '<p>A solution is <b>homogeneous</b>: it is the same all the way through, so you cannot see the parts. Sand in water is <b>heterogeneous</b>: the different parts are visible and settle apart.</p>',
    svg: (function () {
      let salt = '', sand = '';
      for (let i = 0; i < 22; i++) {
        const x = 34 + (i * 47) % 122, y = 66 + (i * 31) % 96;
        salt += wobble(x, y, 4, i % 2 ? 'var(--t-blue)' : '#94a3b8', i, 6);
      }
      for (let i = 0; i < 18; i++) {
        const x = 240 + ((i * 0.618) % 1) * 122, y0 = 58 + ((i * i * 0.137 + 0.3) % 1) * 90, yb = 162 - (i % 2) * 8;
        sand += `<circle cx="${x}" cy="${y0}" r="5" fill="#a16207"><animate attributeName="cy" values="${y0};${y0};${yb};${yb}" keyTimes="0;0.1;0.75;1" dur="6s" repeatCount="indefinite"/></circle>`;
      }
      return TutorialKit.svg(
        `<rect x="22" y="52" width="146" height="118" fill="var(--t-blue)" opacity="0.15"/>` +
        `<rect x="232" y="52" width="146" height="118" fill="var(--t-blue)" opacity="0.15"/>` +
        salt + sand +
        `<path d="M20 34 L20 168 Q20 172 24 172 L166 172 Q170 172 170 168 L170 34" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
        `<path d="M230 34 L230 168 Q230 172 234 172 L376 172 Q380 172 380 168 L380 34" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
        `<text x="95" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-ink)">Salt water</text>` +
        `<text x="305" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-ink)">Sand and water</text>` +
        `<text x="95" y="196" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-green)">Homogeneous</text>` +
        `<text x="305" y="196" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-orange)">Heterogeneous</text>` +
        `<text x="95" y="220" text-anchor="middle" font-size="13" fill="var(--t-muted)">same everywhere</text>` +
        `<text x="305" y="220" text-anchor="middle" font-size="13" fill="var(--t-muted)">sand settles at the bottom</text>`
      );
    })()
  });

  // ---- Step 4: separation methods (interactive: choose a method). Each entry returns svg inner markup.
  const mixSep = {};
  const mixCap = t => `<text x="8" y="18" font-size="14" font-weight="700" fill="var(--t-ink)">${t}</text>`;

  mixSep.filtration = function () {
    let sand = '', drops = '';
    for (let i = 0; i < 9; i++) {
      sand += `<circle cx="${178 + (i * 13) % 44}" cy="${56 + (i % 3) * 6 + (i > 5 ? 6 : 0)}" r="4.5" fill="#a16207"/>`;
    }
    for (let i = 0; i < 4; i++) {
      drops += `<circle cx="200" cy="100" r="3.5" fill="var(--t-blue)"><animate attributeName="cy" values="100;150;150" keyTimes="0;0.5;1" dur="1.2s" begin="${(i * 0.3).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
    }
    return mixCap('Filtration') +
      `<path d="M150 42 L250 42 L206 96 L194 96 Z" fill="#fff" stroke="var(--t-ink)" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M158 50 L242 50 L204 94 L196 94 Z" fill="var(--t-blue)" opacity="0.3"/>` + sand +
      `<rect x="194" y="96" width="12" height="8" fill="var(--t-ink)"/>` + drops +
      `<path d="M160 128 L160 182 L240 182 L240 128" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
      `<rect x="162" y="158" width="76" height="22" fill="var(--t-blue)" opacity="0.4"><animate attributeName="y" values="176;156;156" keyTimes="0;0.9;1" dur="6s" repeatCount="indefinite"/><animate attributeName="height" values="4;24;24" keyTimes="0;0.9;1" dur="6s" repeatCount="indefinite"/></rect>` +
      `<text x="262" y="60" font-size="13" fill="#a16207" font-weight="700">Sand is caught</text>` +
      `<text x="262" y="76" font-size="13" fill="var(--t-muted)">by the filter paper</text>` +
      `<text x="262" y="150" font-size="13" fill="var(--t-blue)" font-weight="700">Water passes</text>` +
      `<text x="262" y="166" font-size="13" fill="var(--t-muted)">through</text>`;
  };

  mixSep.evaporation = function () {
    let steam = '', crystals = '';
    for (let i = 0; i < 3; i++) {
      const x = 170 + i * 30;
      steam += `<path d="M${x} 92 q8 -10 0 -20 q-8 -10 0 -20" fill="none" stroke="var(--t-muted)" stroke-width="3" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;0.7;0" dur="2.4s" begin="${(i * 0.8).toFixed(1)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 10;0 -12" dur="2.4s" begin="${(i * 0.8).toFixed(1)}s" repeatCount="indefinite"/></path>`;
    }
    for (let i = 0; i < 6; i++) {
      crystals += `<rect x="${164 + i * 12}" y="${113 + (i % 2) * 3}" width="8" height="8" fill="#fff" stroke="var(--t-muted)" stroke-width="1.5"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.6;0.85;1" dur="6s" repeatCount="indefinite"/></rect>`;
    }
    return mixCap('Evaporation') + steam +
      `<path d="M140 100 L260 100 Q260 128 200 128 Q140 128 140 100 Z" fill="#fff" stroke="var(--t-ink)" stroke-width="3" stroke-linejoin="round"/>` +
      `<rect x="146" y="102" width="108" height="20" fill="var(--t-blue)" opacity="0.4"><animate attributeName="height" values="20;20;2;2" keyTimes="0;0.1;0.8;1" dur="6s" repeatCount="indefinite"/></rect>` +
      crystals +
      `<path d="M182 172 Q176 158 190 148 Q192 158 200 152 Q210 160 218 172 Z" fill="var(--t-orange)"><animate attributeName="opacity" values="1;0.6;1" dur="0.5s" repeatCount="indefinite"/></path>` +
      `<text x="272" y="66" font-size="13" fill="var(--t-muted)" font-weight="700">Water leaves</text>` +
      `<text x="272" y="82" font-size="13" fill="var(--t-muted)">as vapor</text>` +
      `<text x="272" y="124" font-size="13" fill="var(--t-ink)" font-weight="700">Salt is left</text>` +
      `<text x="272" y="140" font-size="13" fill="var(--t-muted)">behind</text>`;
  };

  mixSep.magnet = function () {
    let sand = '', iron = '';
    for (let i = 0; i < 12; i++) {
      sand += `<circle cx="${112 + (i * 17) % 90}" cy="${178 - (i % 3) * 5}" r="4.5" fill="#a16207"/>`;
    }
    for (let i = 0; i < 6; i++) {
      const x = 128 + i * 15, y = 176 - (i % 2) * 6, tx = 168 + (i % 3) * 8, ty = 88 + (i % 2) * 6;
      iron += `<rect x="-4" y="-2.5" width="8" height="5" rx="1.5" fill="#475569"><animateTransform attributeName="transform" type="translate" values="${x} ${y};${x} ${y};${tx} ${ty};${tx} ${ty};${x} ${y}" keyTimes="0;0.1;0.5;0.85;1" dur="6s" repeatCount="indefinite"/></rect>`;
    }
    return mixCap('Magnetic separation') +
      `<path d="M150 30 L150 62 A30 30 0 0 0 210 62 L210 30 L190 30 L190 62 A10 10 0 0 1 170 62 L170 30 Z" fill="var(--t-red)"/>` +
      `<rect x="150" y="30" width="20" height="14" fill="#cbd5e1"/><rect x="190" y="30" width="20" height="14" fill="#cbd5e1"/>` +
      `<line x1="90" y1="186" x2="240" y2="186" stroke="var(--t-ink)" stroke-width="3" stroke-linecap="round"/>` +
      sand + iron +
      `<text x="256" y="76" font-size="13" fill="#475569" font-weight="700">Iron filings jump</text>` +
      `<text x="256" y="92" font-size="13" fill="var(--t-muted)">to the magnet</text>` +
      `<text x="256" y="160" font-size="13" fill="#a16207" font-weight="700">Sand is not magnetic,</text>` +
      `<text x="256" y="176" font-size="13" fill="var(--t-muted)">so it stays</text>`;
  };

  mixSep.distillation = function () {
    const path = 'M80 66 L80 40 L200 40 L282 108';
    let vapor = '', salt = '';
    for (let i = 0; i < 4; i++) {
      vapor += `<circle r="4" fill="var(--t-muted)" opacity="0.7"><animateMotion path="${path}" dur="4s" begin="${i}s" repeatCount="indefinite"/></circle>`;
    }
    for (let i = 0; i < 5; i++) salt += `<circle cx="${62 + i * 9}" cy="${137 + (i % 2) * 6}" r="3" fill="#94a3b8"/>`;
    return mixCap('Distillation') +
      `<path d="M70 66 L70 82 A34 34 0 1 0 90 82 L90 66 Z" fill="#fff" stroke="var(--t-ink)" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M48 122 A32 32 0 0 0 112 122 Z" fill="var(--t-blue)" opacity="0.4"/>` + salt +
      `<path d="M62 168 Q58 156 68 148 Q70 158 78 154 Q90 160 98 168 Q100 176 80 176 Q60 176 62 168 Z" fill="var(--t-orange)"><animate attributeName="opacity" values="1;0.6;1" dur="0.5s" repeatCount="indefinite"/></path>` +
      `<line x1="200" y1="40" x2="282" y2="108" stroke="var(--t-blue)" stroke-width="18" stroke-linecap="round" opacity="0.25"/>` +
      `<path d="${path}" fill="none" stroke="var(--t-ink)" stroke-width="3" stroke-linejoin="round"/>` + vapor +
      `<circle cx="286" cy="122" r="3.5" fill="var(--t-blue)"><animate attributeName="cy" values="114;146;146" keyTimes="0;0.6;1" dur="1.1s" repeatCount="indefinite"/></circle>` +
      `<path d="M252 136 L252 184 L322 184 L322 136" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
      `<rect x="254" y="178" width="66" height="4" fill="var(--t-blue)" opacity="0.5"><animate attributeName="y" values="178;160;160" keyTimes="0;0.9;1" dur="6s" repeatCount="indefinite"/><animate attributeName="height" values="4;22;22" keyTimes="0;0.9;1" dur="6s" repeatCount="indefinite"/></rect>` +
      `<text x="238" y="24" font-size="13" fill="var(--t-blue)" font-weight="700">Condenser cools</text>` +
      `<text x="238" y="42" font-size="13" fill="var(--t-blue)" font-weight="700">vapor to liquid</text>` +
      `<text x="330" y="160" font-size="13" fill="var(--t-ink)" font-weight="700">Pure</text>` +
      `<text x="330" y="176" font-size="13" fill="var(--t-ink)" font-weight="700">water</text>` +
      `<text x="80" y="188" text-anchor="middle" font-size="13" fill="var(--t-muted)">Salt stays</text>`;
  };

  mixSteps.push({
    title: 'Separating mixtures',
    text: '<p>Because the parts of a mixture keep their own properties, we can separate them by <b>physical methods</b> that use those differences. Pick a method to see how it works.</p>',
    mount: function (el) {
      const keys = [['filtration', 'Filtration'], ['evaporation', 'Evaporation'], ['magnet', 'Magnet'], ['distillation', 'Distillation']];
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1;min-height:0;height:auto;width:100%"></svg>` +
        `<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;gap:6px;padding-top:0">` +
        keys.map(k => `<button type="button" class="scene-btn" data-k="${k[0]}" style="padding:4px 9px">${k[1]}</button>`).join('') + `</div>`;
      const svg = el.querySelector('svg');
      function show(k) {
        svg.innerHTML = mixSep[k]();
        el.querySelectorAll('button').forEach(b => {
          const on = b.dataset.k === k;
          b.style.borderColor = on ? 'var(--primary)' : '';
          b.style.color = on ? 'var(--primary)' : '';
        });
      }
      el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => show(b.dataset.k)));
      show('filtration');
    }
  });

  // ---- Step 5: concentration (interactive: solute mass + solution volume)
  mixSteps.push({
    title: 'How strong is the solution?',
    text: '<p><b>Concentration</b> tells how much solute is packed into a solution: <b>mass of solute ÷ volume of solution</b>, in g/mL. Same water, more solute? More concentrated. Try it!</p>',
    mount: function (el, api) {
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1;min-height:0;height:auto;width:100%">` +
        `<rect id="mix-con-water" x="34" y="60" width="162" height="126" fill="var(--t-blue)" opacity="0.3"/>` +
        `<clipPath id="mix-con-clip"><rect x="34" y="0" width="162" height="190"/></clipPath>` +
        `<g clip-path="url(#mix-con-clip)"><g id="mix-con-wg"><path d="M10 0 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="var(--t-blue)" stroke-width="2.5" opacity="0.7"><animateTransform attributeName="transform" type="translate" values="0 0;24 0" dur="1.6s" repeatCount="indefinite"/></path></g></g>` +
        `<g id="mix-con-dots"></g>` +
        `<path d="M32 14 L32 186 Q32 190 36 190 L194 190 Q198 190 198 186 L198 14" fill="none" stroke="var(--t-ink)" stroke-width="3"/>` +
        `<text x="222" y="34" font-size="13" fill="var(--t-muted)">Solute: <tspan id="mix-con-g" font-weight="700" fill="var(--t-ink)"></tspan></text>` +
        `<text x="222" y="54" font-size="13" fill="var(--t-muted)">Solution: <tspan id="mix-con-v" font-weight="700" fill="var(--t-ink)"></tspan></text>` +
        `<line x1="222" y1="70" x2="384" y2="70" stroke="var(--t-muted)" stroke-width="1.5"/>` +
        `<text x="222" y="94" font-size="13" font-weight="700" fill="var(--t-primary, var(--primary))">Concentration</text>` +
        `<text id="mix-con-f" x="222" y="118" font-size="14" fill="var(--t-ink)"></text>` +
        `<text id="mix-con-r" x="222" y="150" font-size="22" font-weight="700" fill="var(--primary)"></text>` +
        `</svg>` +
        `<div class="scene-slider-row"><span style="min-width:48px">Solute</span><input type="range" id="mix-con-gs" min="5" max="50" step="5" value="20" aria-label="Mass of solute in grams"><span id="mix-con-gv" style="min-width:48px;text-align:right">20 g</span></div>` +
        `<div class="scene-slider-row" style="padding-top:0"><span style="min-width:48px">Volume</span><input type="range" id="mix-con-vs" min="50" max="500" step="50" value="200" aria-label="Volume of solution in mL"><span id="mix-con-vv" style="min-width:48px;text-align:right">200 mL</span></div>`;
      const $ = id => el.querySelector('#' + id);
      const gs = $('mix-con-gs'), vs = $('mix-con-vs'), dotsG = $('mix-con-dots');
      let dots = [], top = 60;
      function update() {
        const g = +gs.value, v = +vs.value;
        const h = 40 + (v - 50) / 450 * 126;
        top = 186 - h;
        const conc = g / v;
        $('mix-con-water').setAttribute('y', top);
        $('mix-con-wg').setAttribute('transform', 'translate(0 ' + top + ')');
        $('mix-con-water').setAttribute('height', h);
        $('mix-con-water').setAttribute('fill', 'var(--t-blue)');
        $('mix-con-water').setAttribute('opacity', (0.12 + Math.min(1, Math.sqrt(conc) * 0.9) * 0.55).toFixed(2));
        $('mix-con-gv').textContent = g + ' g';
        $('mix-con-vv').textContent = v + ' mL';
        $('mix-con-g').textContent = g + ' g';
        $('mix-con-v').textContent = v + ' mL';
        $('mix-con-f').textContent = g + ' ÷ ' + v + ' =';
        $('mix-con-r').textContent = (Math.round(conc * 100) / 100).toFixed(2) + ' g/mL';
        // one dot per 2 g of solute, spread in the liquid
        const n = Math.round(g / 2);
        while (dots.length < n) {
          const c = document.createElementNS(SVGNS, 'circle');
          c.setAttribute('r', 4.5); c.setAttribute('fill', 'var(--t-orange)');
          dotsG.appendChild(c);
          dots.push({ n: c, x: 44 + Math.random() * 142, y: top + 8 + Math.random() * (h - 16), a: Math.random() * 6.28 });
        }
        while (dots.length > n) dotsG.removeChild(dots.pop().n);
      }
      gs.addEventListener('input', update);
      vs.addEventListener('input', update);
      update();
      api.loop(function (t, dt) {
        const bottom = 184;
        dots.forEach(p => {
          p.a += (Math.random() - 0.5) * 8 * dt;
          p.x += Math.cos(p.a) * 22 * dt; p.y += Math.sin(p.a) * 22 * dt;
          if (p.x < 40) { p.x = 40; p.a = Math.PI - p.a; } if (p.x > 190) { p.x = 190; p.a = Math.PI - p.a; }
          if (p.y < top + 6) { p.y = top + 6; p.a = -p.a; } if (p.y > bottom - 4) { p.y = bottom - 4; p.a = -p.a; }
          p.n.setAttribute('cx', p.x.toFixed(1)); p.n.setAttribute('cy', p.y.toFixed(1));
        });
      });
    }
  });

  registerTutorial('chemistry', 'mixtures', {
    title: 'Mixtures & Solutions',
    keyTerms: [
      { term: 'Mixture', definition: 'Two or more substances physically combined; each keeps its own properties and can be separated by physical methods.' },
      { term: 'Solution', definition: 'A homogeneous mixture in which a solute is dissolved evenly in a solvent.' },
      { term: 'Solute / Solvent', definition: 'The solute is what dissolves (sugar); the solvent does the dissolving (water).' },
      { term: 'Homogeneous / Heterogeneous', definition: 'Same throughout, or with visibly different parts.' },
      { term: 'Separation methods', definition: 'Filtration, evaporation, distillation and magnets pull mixtures apart without changing the substances.' },
      { term: 'Concentration', definition: 'Mass of solute divided by volume of solution (g/mL).' }
    ],
    steps: mixSteps
  });

  // ------------------------------------------------------------------
  // TOPIC: Chemical Reactions
  // ------------------------------------------------------------------
  const rxnSteps = [];

  // ---- Step 1: atoms rearrange in 2H2 + O2 -> 2H2O
  rxnSteps.push({
    title: 'Atoms change partners',
    text: '<p>In a chemical reaction, the starting substances (<b>reactants</b>) turn into new substances (<b>products</b>). Bonds break and new ones form, but atoms are only <b>rearranged</b>, never created or destroyed.</p>',
    mount: function (el, api) {
      const A = [ // H = hydrogen, O = oxygen; from = reactant spot, to = product spot
        { s: 'H', f: [50, 66], t: [296, 108] }, { s: 'H', f: [82, 66], t: [296, 188] },
        { s: 'O', f: [56, 130], t: [320, 84] }, { s: 'O', f: [96, 130], t: [320, 164] },
        { s: 'H', f: [50, 194], t: [344, 108] }, { s: 'H', f: [82, 194], t: [344, 188] }
      ];
      const REACT_BONDS = [[0, 1], [4, 5], [2, 3]], PROD_BONDS = [[2, 0], [2, 4], [3, 1], [3, 5]];
      let bonds = '', atoms = '';
      REACT_BONDS.forEach((b, i) => { bonds += `<line id="rxn-a-rb${i}" stroke="var(--t-ink)" stroke-width="5" stroke-linecap="round"/>`; });
      PROD_BONDS.forEach((b, i) => { bonds += `<line id="rxn-a-pb${i}" stroke="var(--t-ink)" stroke-width="5" stroke-linecap="round" opacity="0"/>`; });
      A.forEach((a, i) => {
        const isO = a.s === 'O';
        atoms += `<g id="rxn-a-at${i}"><circle r="${isO ? 16 : 11}" fill="${isO ? 'var(--t-red)' : '#e0f2fe'}" stroke="${isO ? '#991b1b' : 'var(--t-blue)'}" stroke-width="2.5"/>` +
          `<text y="5" text-anchor="middle" font-size="14" font-weight="700" fill="${isO ? '#fff' : 'var(--t-ink)'}">${a.s}</text></g>`;
      });
      el.innerHTML = TutorialKit.svg(
        TutorialKit.arrowMarker('rxn-a-arr', 'var(--t-muted)') +
        `<line x1="150" y1="130" x2="250" y2="130" stroke="var(--t-muted)" stroke-width="5" stroke-linecap="round" marker-end="url(#rxn-a-arr)" opacity="0.3"><animate attributeName="opacity" values="0.15;0.5;0.15" dur="2s" repeatCount="indefinite"/></line>` +
        `<text x="75" y="20" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-ink)">Reactants</text>` +
        `<text x="320" y="20" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-ink)">Products</text>` +
        `<text x="75" y="38" text-anchor="middle" font-size="13" fill="var(--t-muted)">4 H + 2 O atoms</text>` +
        `<text x="320" y="38" text-anchor="middle" font-size="13" fill="var(--t-muted)">4 H + 2 O atoms</text>` +
        `<text id="rxn-a-msg" x="200" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="var(--primary)"></text>` +
        `<g id="rxn-a-all">${bonds}${atoms}</g>` +
        `<text x="200" y="232" text-anchor="middle" font-size="18" font-weight="700" fill="var(--t-ink)">2H<tspan font-size="12" dy="4">2</tspan><tspan dy="-4"> + O</tspan><tspan font-size="12" dy="4">2</tspan><tspan dy="-4"> → 2H</tspan><tspan font-size="12" dy="4">2</tspan><tspan dy="-4">O</tspan></text>`
      );
      const $ = id => el.querySelector('#' + id);
      const nodes = A.map((a, i) => $('rxn-a-at' + i));
      const pos = A.map(a => [a.f[0], a.f[1]]);
      const ss = (x, a, b) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
      function setBond(id, i, j, op) {
        const l = $(id);
        l.setAttribute('x1', pos[i][0]); l.setAttribute('y1', pos[i][1]);
        l.setAttribute('x2', pos[j][0]); l.setAttribute('y2', pos[j][1]);
        l.setAttribute('opacity', op);
      }
      const msg = $('rxn-a-msg'), all = $('rxn-a-all');
      api.loop(function (t) {
        const c = t % 9;
        const p = ss(c, 2, 5);
        A.forEach((a, i) => {
          pos[i][0] = a.f[0] + (a.t[0] - a.f[0]) * p; pos[i][1] = a.f[1] + (a.t[1] - a.f[1]) * p;
          nodes[i].setAttribute('transform', `translate(${pos[i][0].toFixed(1)} ${pos[i][1].toFixed(1)})`);
        });
        const rb = 1 - ss(p, 0, 0.3), pb = ss(p, 0.7, 1);
        REACT_BONDS.forEach((b, i) => setBond('rxn-a-rb' + i, b[0], b[1], rb.toFixed(2)));
        PROD_BONDS.forEach((b, i) => setBond('rxn-a-pb' + i, b[0], b[1], pb.toFixed(2)));
        msg.textContent = c < 2 ? '' : (p < 0.5 ? 'Bonds break...' : (p < 1 ? 'New bonds form!' : (c < 8 ? 'Same atoms, new pairs' : '')));
        all.setAttribute('opacity', c < 0.5 ? (c * 2).toFixed(2) : (c > 8 ? (9 - c).toFixed(2) : 1));
      });
    }
  });

  // ---- Step 2: equation balancer (interactive: coefficient +/- buttons with live atom counter)
  rxnSteps.push({
    title: 'Balance the equation',
    text: '<p>Atoms cannot appear or vanish, so both sides need the <b>same number of each atom</b>. Change the <b>coefficients</b> (the big numbers in front) until every count matches. Never change the small subscripts.</p>',
    mount: function (el) {
      const RX = [
        { name: 'Water', sp: [['H₂', { H: 2 }, 0], ['O₂', { O: 2 }, 0], ['H₂O', { H: 2, O: 1 }, 1]] },
        { name: 'Methane', sp: [['CH₄', { C: 1, H: 4 }, 0], ['O₂', { O: 2 }, 0], ['CO₂', { C: 1, O: 2 }, 1], ['H₂O', { H: 2, O: 1 }, 1]] },
        { name: 'Ammonia', sp: [['N₂', { N: 2 }, 0], ['H₂', { H: 2 }, 0], ['NH₃', { N: 1, H: 3 }, 1]] }
      ];
      const gcd = (a, b) => b ? gcd(b, a % b) : a;
      el.innerHTML =
        `<style>
          .rxn-b-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;padding:2px 6px;box-sizing:border-box}
          .rxn-b-sel{display:flex;gap:6px}
          .rxn-b-sel .scene-btn{padding:3px 10px}
          .rxn-b-sel .scene-btn.rxn-b-on{border-color:var(--primary);color:var(--primary);background:var(--t-soft)}
          .rxn-b-eq{display:flex;align-items:flex-start;justify-content:center;gap:3px}
          .rxn-b-col{display:flex;flex-direction:column;align-items:center;gap:1px}
          .rxn-b-ctl{display:flex;align-items:center;gap:1px}
          .rxn-b-pm{box-sizing:border-box;min-width:20px;padding:1px 0 !important;font-size:.95rem !important;line-height:1.2}
          .rxn-b-n{min-width:15px;text-align:center;font-size:1.25rem;font-weight:800;color:var(--primary)}
          .rxn-b-f{font-size:1.05rem;font-weight:700;color:var(--t-ink)}
          .rxn-b-sep{font-size:1.15rem;font-weight:800;color:var(--t-muted);padding-top:2px}
          .rxn-b-arrow{display:inline-block;animation:rxn-b-nudge 1.4s ease-in-out infinite}
          @keyframes rxn-b-nudge{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}
          @keyframes rxn-b-pop{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}
          .rxn-b-atoms{display:block;max-width:400px}
          .rxn-b-status{font-size:.95rem;font-weight:800;color:var(--t-red);min-height:1.3em;text-align:center}
          .rxn-b-wrap.rxn-b-ok .rxn-b-status{color:var(--t-green)}
        </style>` +
        `<div class="rxn-b-wrap"><div class="rxn-b-sel"></div><div class="rxn-b-eq"></div><svg class="rxn-b-atoms" viewBox="0 0 400 80" style="width:100%" role="img" aria-label="Atom counts for reactants and products"></svg><div class="rxn-b-status" aria-live="polite"></div></div>`;
      const wrap = el.querySelector('.rxn-b-wrap'), sel = el.querySelector('.rxn-b-sel'), eq = el.querySelector('.rxn-b-eq');
      const atomsSvg = el.querySelector('.rxn-b-atoms'), status = el.querySelector('.rxn-b-status');
      let cur = 0, coef = [];
      RX.forEach((r, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'scene-btn'; b.textContent = r.name;
        b.addEventListener('click', () => load(i));
        sel.appendChild(b);
      });
      function load(i) {
        cur = i;
        const r = RX[i];
        coef = r.sp.map(() => 1);
        [...sel.children].forEach((b, k) => b.classList.toggle('rxn-b-on', k === i));
        eq.innerHTML = '';
        r.sp.forEach((s, k) => {
          if (k > 0) {
            const sep = document.createElement('span');
            sep.className = 'rxn-b-sep';
            sep.innerHTML = s[2] !== r.sp[k - 1][2] ? '<span class="rxn-b-arrow">→</span>' : '+';
            sep.style.marginTop = '2px';
            eq.appendChild(sep);
          }
          const col = document.createElement('div');
          col.className = 'rxn-b-col';
          col.innerHTML = `<div class="rxn-b-ctl"><button type="button" class="scene-btn rxn-b-pm" aria-label="Decrease coefficient of ${s[0]}">−</button><span class="rxn-b-n">1</span><button type="button" class="scene-btn rxn-b-pm" aria-label="Increase coefficient of ${s[0]}">+</button></div><div class="rxn-b-f">${s[0]}</div>`;
          const bs = col.querySelectorAll('button');
          bs[0].addEventListener('click', () => { coef[k] = Math.max(1, coef[k] - 1); update(); });
          bs[1].addEventListener('click', () => { coef[k] = Math.min(9, coef[k] + 1); update(); });
          eq.appendChild(col);
        });
        update();
      }
      function update() {
        const r = RX[cur];
        [...eq.querySelectorAll('.rxn-b-n')].forEach((n, k) => { n.textContent = coef[k]; });
        const tot = {}; // element -> [left, right]
        r.sp.forEach((s, k) => {
          Object.keys(s[1]).forEach(e => { tot[e] = tot[e] || [0, 0]; tot[e][s[2]] += s[1][e] * coef[k]; });
        });
        const COL = { H: 'var(--t-blue)', O: 'var(--t-red)', C: '#475569', N: '#8b5cf6' };
        let all = true, svg = `<text x="110" y="13" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-muted)">Reactants</text><text x="312" y="13" text-anchor="middle" font-size="14" font-weight="700" fill="var(--t-muted)">Products</text>`;
        Object.keys(tot).forEach((e, row) => {
          const [L, R] = tot[e], ok = L === R, y = 34 + row * 21, fc = ok ? 'var(--t-green)' : 'var(--t-red)';
          if (!ok) all = false;
          const dots = (n, x0) => {
            let d = '';
            for (let i = 0; i < Math.min(n, 18); i++) {
              d += `<circle cx="${x0 + i * 7.5}" cy="${y - 4}" r="3.2" fill="${COL[e]}"><animate attributeName="cy" values="${y - 4};${y - 7};${y - 4}" dur="1.6s" begin="${(i * 0.09).toFixed(2)}s" repeatCount="indefinite"/></circle>`;
            }
            return d;
          };
          svg += `<text x="12" y="${y}" font-size="17" font-weight="700" fill="${COL[e]}">${e}</text>` +
            dots(L, 36) + `<text x="207" y="${y}" text-anchor="end" font-size="17" font-weight="700" fill="${fc}">${L}</text>` +
            `<text x="216" y="${y}" text-anchor="middle" font-size="19" font-weight="700" fill="${fc}">${ok ? '=' : '≠'}</text>` +
            `<text x="226" y="${y}" font-size="17" font-weight="700" fill="${fc}">${R}</text>` + dots(R, 252);
        });
        atomsSvg.innerHTML = svg;
        wrap.classList.toggle('rxn-b-ok', all);
        const g = coef.reduce(gcd);
        status.textContent = !all ? 'Not balanced yet'
          : (g > 1 ? 'Balanced! Try smaller numbers?' : 'Balanced! Atoms in = atoms out');
      }
      load(0);
    }
  });

  // ---- Step 3: signs of a chemical change (four looping mini-scenes)
  rxnSteps.push({
    title: 'Signs of a reaction',
    text: '<p>A chemical change makes <b>new substances</b>. Clues: gas bubbles, a color change, a solid <b>precipitate</b> forming, or heat and light given off. Melting or dissolving is only a <b>physical</b> change: same substance, new form.</p>',
    svg: (function () {
      const X = [55, 152, 248, 345];
      const beaker = cx => `<path d="M${cx - 32} 60 L${cx - 32} 168 Q${cx - 32} 172 ${cx - 28} 172 L${cx + 28} 172 Q${cx + 32} 172 ${cx + 32} 168 L${cx + 32} 60" fill="none" stroke="var(--t-ink)" stroke-width="3"/>`;
      const label = (cx, a, b) => `<text x="${cx}" y="196" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">${a}</text><text x="${cx}" y="214" text-anchor="middle" font-size="13" fill="var(--t-muted)">${b}</text>`;
      // 1. gas bubbles
      let c = X[0], gas = `<rect x="${c - 30}" y="100" width="60" height="70" fill="var(--t-blue)" opacity="0.25"/><rect x="${c - 12}" y="162" width="24" height="8" rx="2" fill="#cbd5e1"/>`;
      for (let i = 0; i < 6; i++) {
        const x = c - 22 + (i * 23) % 44, r = 3 + (i % 3);
        gas += `<circle cx="${x}" cy="160" r="${r}" fill="#fff" stroke="var(--t-blue)" stroke-width="1.5"><animate attributeName="cy" values="160;96" dur="2s" begin="${(i * 0.33).toFixed(2)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;0.8;1" dur="2s" begin="${(i * 0.33).toFixed(2)}s" repeatCount="indefinite"/></circle>`;
      }
      // 2. color change
      c = X[1];
      const col = `<rect x="${c - 30}" y="100" width="60" height="70" fill="#93c5fd"><animate attributeName="fill" values="#93c5fd;#93c5fd;#fbbf24;#fbbf24;#93c5fd" keyTimes="0;0.2;0.5;0.85;1" dur="6s" repeatCount="indefinite"/></rect>` +
        `<circle cx="${c}" cy="64" r="4" fill="#f59e0b"><animate attributeName="cy" values="64;100;100" keyTimes="0;0.15;1" dur="6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.15;1" dur="6s" repeatCount="indefinite"/></circle>`;
      // 3. precipitate
      c = X[2];
      let ppt = `<rect x="${c - 30}" y="100" width="60" height="70" fill="var(--t-blue)" opacity="0.2"/>`;
      for (let i = 0; i < 9; i++) {
        const x = c - 24 + (i * 17) % 48, y0 = 108 + (i * 13) % 30, yb = 164 - (i % 3) * 3;
        ppt += `<circle cx="${x}" cy="${y0}" r="3.5" fill="#f8fafc" stroke="var(--t-muted)" stroke-width="1.2" opacity="0"><animate attributeName="cy" values="${y0};${y0};${yb};${yb}" keyTimes="0;0.15;0.7;1" dur="6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;1" keyTimes="0;0.15;0.2;1" dur="6s" repeatCount="indefinite"/></circle>`;
      }
      // 4. heat and light
      c = X[3];
      let heat = `<rect x="${c - 30}" y="100" width="60" height="70" fill="#fdba74" opacity="0.7"/>` +
        `<circle cx="${c}" cy="140" r="14" fill="var(--t-yellow)"><animate attributeName="r" values="10;20;10" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite"/></circle>`;
      for (let i = 0; i < 3; i++) {
        const x = c - 16 + i * 16;
        heat += `<path d="M${x} 56 q6 -8 0 -16 q-6 -8 0 -16" fill="none" stroke="var(--t-orange)" stroke-width="3" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;0.9;0" dur="1.8s" begin="${(i * 0.5).toFixed(1)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 12;0 -6" dur="1.8s" begin="${(i * 0.5).toFixed(1)}s" repeatCount="indefinite"/></path>`;
      }
      return TutorialKit.svg(
        `<text x="200" y="20" text-anchor="middle" font-size="15" font-weight="700" fill="var(--t-ink)">Clues that a chemical change happened</text>` +
        gas + col + ppt + heat + X.map(beaker).join('') +
        label(X[0], 'Gas bubbles', 'fizzing') + label(X[1], 'Color change', 'new color') +
        label(X[2], 'Precipitate', 'new solid') + label(X[3], 'Heat, light', 'energy out')
      );
    })()
  });

  // ---- Step 4: exothermic vs endothermic (interactive: two buttons)
  function rxnEnergyScene(exo) {
    const HI = 55, LO = 115, BASE = 168;
    const rTop = exo ? HI : LO, pTop = exo ? LO : HI;
    const c = exo ? 'var(--t-orange)' : 'var(--t-blue)';
    let dots = '';
    for (let i = 0; i < 4; i++) {
      const a = exo ? 262 : 320, b = exo ? 320 : 262;
      dots += `<circle cx="${a}" cy="${96 + (i % 2) * 14}" r="4.5" fill="${c}"><animate attributeName="cx" values="${a};${b}" dur="2s" begin="${(i * 0.5).toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2s" begin="${(i * 0.5).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
    }
    const merc = exo
      ? `<rect x="331" y="110" width="8" height="42" fill="var(--t-red)"><animate attributeName="y" values="112;68;68;112" keyTimes="0;0.5;0.85;1" dur="4s" repeatCount="indefinite"/><animate attributeName="height" values="40;84;84;40" keyTimes="0;0.5;0.85;1" dur="4s" repeatCount="indefinite"/></rect>`
      : `<rect x="331" y="112" width="8" height="40" fill="var(--t-blue)"><animate attributeName="y" values="112;140;140;112" keyTimes="0;0.5;0.85;1" dur="4s" repeatCount="indefinite"/><animate attributeName="height" values="40;12;12;40" keyTimes="0;0.5;0.85;1" dur="4s" repeatCount="indefinite"/></rect>`;
    const y1 = exo ? HI + 4 : LO - 4, y2 = exo ? LO - 6 : HI + 6, sh = exo ? 4 : -4;
    return `<text x="8" y="18" font-size="14" font-weight="700" fill="${c}">${exo ? 'Exothermic: releases heat' : 'Endothermic: absorbs heat'}</text>` +
      TutorialKit.arrowMarker('rxn-d-arr', 'var(--t-ink)') +
      `<line x1="34" y1="30" x2="34" y2="${BASE}" stroke="var(--t-muted)" stroke-width="2" marker-start="url(#rxn-d-arr)"/>` +
      `<text x="26" y="100" font-size="13" fill="var(--t-muted)" text-anchor="middle" transform="rotate(-90 26 100)">Energy</text>` +
      `<rect x="44" y="${rTop}" width="70" height="${BASE - rTop}" fill="#93c5fd"/>` +
      `<rect x="180" y="${pTop}" width="70" height="${BASE - pTop}" fill="#fdba74"/>` +
      `<line x1="114" y1="${rTop}" x2="250" y2="${rTop}" stroke="var(--t-muted)" stroke-width="1.5" stroke-dasharray="4 4"/>` +
      `<line x1="215" y1="${y1}" x2="215" y2="${y2}" stroke="var(--t-ink)" stroke-width="3" marker-end="url(#rxn-d-arr)"><animateTransform attributeName="transform" type="translate" values="0 0;0 ${sh};0 0" dur="1s" repeatCount="indefinite"/></line>` +
      `<line x1="40" y1="${BASE}" x2="256" y2="${BASE}" stroke="var(--t-ink)" stroke-width="2"/>` +
      `<text x="79" y="186" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">Reactants</text>` +
      `<text x="215" y="186" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">Products</text>` +
      dots +
      `<text x="290" y="72" text-anchor="middle" font-size="13" font-weight="700" fill="${c}">${exo ? 'Heat out' : 'Heat in'}</text>` +
      `<rect x="329" y="50" width="12" height="102" rx="6" fill="#fff" stroke="var(--t-ink)" stroke-width="2"/>` + merc +
      `<circle cx="335" cy="158" r="10" fill="${exo ? 'var(--t-red)' : 'var(--t-blue)'}" stroke="var(--t-ink)" stroke-width="2"/>` +
      `<text x="355" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="${c}">${exo ? 'gets warmer' : 'gets colder'}</text>` +
      `<text x="355" y="186" text-anchor="middle" font-size="13" fill="var(--t-muted)">Surroundings</text>`;
  }

  rxnSteps.push({
    title: 'Heat in, heat out',
    text: '<p><b>Exothermic</b> reactions release heat to the surroundings, so they feel warm (burning, hand warmers). <b>Endothermic</b> reactions absorb heat, so they feel cold (instant cold packs). Pick one!</p>',
    mount: function (el) {
      el.innerHTML =
        `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1;min-height:0;height:auto;width:100%"></svg>` +
        `<div class="scene-slider-row" style="justify-content:center;padding-top:0"><button type="button" class="scene-btn" data-m="exo">Exothermic</button><button type="button" class="scene-btn" data-m="endo">Endothermic</button></div>`;
      const svg = el.querySelector('svg');
      function show(m) {
        svg.innerHTML = rxnEnergyScene(m === 'exo');
        el.querySelectorAll('button').forEach(b => {
          const on = b.dataset.m === m;
          b.style.borderColor = on ? 'var(--primary)' : '';
          b.style.color = on ? 'var(--primary)' : '';
        });
      }
      el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => show(b.dataset.m)));
      show('exo');
    }
  });

  // ---- Step 5: reaction types (synthesis and decomposition)
  rxnSteps.push({
    title: 'Two reaction types',
    text: '<p>In <b>synthesis</b>, simple substances combine into one product, like iron + oxygen making rust. In <b>decomposition</b>, one compound breaks into simpler substances, like water split by electricity.</p>',
    svg: (function () {
      const D = '6s';
      const atom = (y, fill, r, letter, xs, ops) =>
        `<g><circle r="${r}" fill="${fill}"/><text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${letter}</text>` +
        `<animateTransform attributeName="transform" type="translate" values="${xs.map(x => x + ' ' + y).join(';')}" keyTimes="0;0.15;0.5;0.9;1" dur="${D}" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="${ops}" keyTimes="0;0.05;0.92;1" dur="${D}" repeatCount="indefinite"/></g>`;
      const bond = (y, ops) => `<line x1="262" y1="${y}" x2="296" y2="${y}" stroke="var(--t-ink)" stroke-width="4" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="${ops}" keyTimes="0;0.15;0.3;0.5;0.6;0.92;1" dur="${D}" repeatCount="indefinite"/></line>`;
      return TutorialKit.svg(
        `<line x1="12" y1="120" x2="388" y2="120" stroke="var(--border,#e5e7eb)" stroke-width="2"/>` +
        `<text x="12" y="62" font-size="16" font-weight="700" fill="var(--primary)">Synthesis</text>` +
        `<text x="12" y="82" font-size="13" fill="var(--t-muted)">2H₂ + O₂ → 2H₂O</text>` +
        `<text x="12" y="102" font-size="13" fill="var(--t-muted)">many → one</text>` +
        `<text x="12" y="166" font-size="16" font-weight="700" fill="var(--t-orange)">Decomposition</text>` +
        `<text x="12" y="186" font-size="13" fill="var(--t-muted)">2H₂O → 2H₂ + O₂</text>` +
        `<text x="12" y="206" font-size="13" fill="var(--t-muted)">one → many</text>` +
        // synthesis: apart -> bonded
        bond(72, '0;0;0;0;1;1;0') +
        atom(72, 'var(--t-orange)', 12, 'A', [190, 190, 262, 262, 262], '0;1;1;0') +
        atom(72, 'var(--t-blue)', 12, 'B', [368, 368, 296, 296, 296], '0;1;1;0') +
        // decomposition: bonded -> apart
        bond(175, '0;1;0;0;0;0;0') +
        atom(175, 'var(--t-orange)', 12, 'A', [262, 262, 190, 190, 190], '0;1;1;0') +
        atom(175, 'var(--t-blue)', 12, 'B', [296, 296, 368, 368, 368], '0;1;1;0')
      );
    })()
  });

  registerTutorial('chemistry', 'reactions', {
    title: 'Chemical Reactions',
    keyTerms: [
      { term: 'Reactants / Products', definition: 'Reactants are the starting substances; products are the new substances formed.' },
      { term: 'Law of conservation of mass', definition: 'Atoms are rearranged, never created or destroyed, so total mass stays the same.' },
      { term: 'Balanced equation', definition: 'Coefficients are chosen so each kind of atom has the same count on both sides, like 2H₂ + O₂ → 2H₂O.' },
      { term: 'Signs of a reaction', definition: 'Gas bubbles, color change, a precipitate (new solid), or heat/light given off.' },
      { term: 'Exothermic / Endothermic', definition: 'Exothermic reactions release heat; endothermic reactions absorb heat.' },
      { term: 'Synthesis / Decomposition', definition: 'Synthesis combines substances into one; decomposition breaks one compound into simpler ones.' }
    ],
    steps: rxnSteps
  });
})();
