(function () {
  'use strict';
  // more-physics-heat: five extra real-life examples for "Heat & Thermal Energy".
  // Namespace: mhea- (every DOM id / class in this file starts with it).

  const PRIM = 'var(--primary)', ORANGE = 'var(--t-orange)', BLUE = 'var(--t-blue)', TEAL = 'var(--t-teal)';
  const YELLOW = 'var(--t-yellow)', RED = 'var(--t-red)', GREEN = 'var(--t-green)';
  const SOFT = 'var(--t-soft)', INK = 'var(--t-ink)', MUTED = 'var(--t-muted)';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const rnd = i => { const x = Math.sin(i * 12.9898 + 2.7) * 43758.5453; return x - Math.floor(x); };
  const NS = 'http://www.w3.org/2000/svg';

  function T(x, y, s, o) {
    o = o || {};
    return `<text${o.id ? ` id="${o.id}"` : ''} x="${x}" y="${y}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" fill="${o.fill || INK}" text-anchor="${o.anchor || 'middle'}"${o.extra ? ' ' + o.extra : ''}>${s}</text>`;
  }
  function sliderRow(label, id, min, max, step, val, out) {
    return `<div class="scene-slider-row"><span style="min-width:70px;flex-shrink:0">${label}</span>` +
      `<input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}" style="min-width:0">` +
      `<span id="${id}-v" style="min-width:62px;text-align:right;flex-shrink:0">${out}</span></div>`;
  }
  function btnRow(buttons) {
    return `<div class="scene-slider-row" style="justify-content:center;gap:8px">${buttons.map(b =>
      `<button type="button" class="scene-btn" id="${b.id}">${b.label}</button>`).join('')}</div>`;
  }
  // Mount scene: an <svg> sharing the container with a control row.
  function scene(el, vb, inner, rows) {
    el.innerHTML = `<svg viewBox="${vb}" xmlns="${NS}" role="img" preserveAspectRatio="xMidYMid meet" style="flex:1 1 0;min-height:0;width:100%;height:auto">${inner}</svg>${rows || ''}`;
    return el.querySelector('svg');
  }

  const steps = [];

  // --- 1. Dark vs light clothes in the sun: radiation is absorbed or reflected (buttons: shirt colour) ---
  function mheaShirtMount(el, api) {
    const C = [46, 36], D = [0.8, 0.6], AIR = 30;
    const E = [[112, 82], [166, 82], [190, 112]];
    const LOOK = {
      white: { name: 'White shirt', fill: '#f1f5f9', abs: 0.2 },
      grey: { name: 'Grey shirt', fill: '#94a3b8', abs: 0.5 },
      black: { name: 'Black shirt', fill: '#1e293b', abs: 0.9 }
    };
    const rays = E.map((e, k) => {
      const w = [e[0] - C[0], e[1] - C[1]], u = w[0] * 0.6 - w[1] * 0.8, L = w[0] * D[0] + w[1] * D[1];
      const sx = e[0] - L * D[0], sy = e[1] - L * D[1];
      return { sx, sy, ex: e[0], ey: e[1] };
    });
    const inc = rays.map((r, k) => `<line id="mhea-i${k}" x1="${r.sx.toFixed(1)}" y1="${r.sy.toFixed(1)}" x2="${(r.ex - 8 * D[0]).toFixed(1)}" y2="${(r.ey - 8 * D[1]).toFixed(1)}" stroke="${YELLOW}" stroke-width="4" stroke-dasharray="9 6"/>` +
      `<polygon points="${r.ex},${r.ey} ${(r.ex - 10 * D[0] - 5 * D[1]).toFixed(1)},${(r.ey - 10 * D[1] + 5 * D[0]).toFixed(1)} ${(r.ex - 10 * D[0] + 5 * D[1]).toFixed(1)},${(r.ey - 10 * D[1] - 5 * D[0]).toFixed(1)}" fill="${YELLOW}"/>`).join('');
    const refl = E.map((e, k) => `<g id="mhea-r${k}"><line id="mhea-rl${k}" stroke="${YELLOW}" stroke-width="4" stroke-dasharray="9 6"/><polygon id="mhea-rh${k}" fill="${YELLOW}"/></g>`).join('');
    const shirtPath = 'M108,84 L128,78 Q140,90 152,78 L172,84 L202,104 L186,122 L172,112 L172,160 L108,160 L108,112 L94,122 L78,104 Z';
    const svg = scene(el, '0 0 400 190', `
      <circle cx="${C[0]}" cy="${C[1]}" r="15" fill="${YELLOW}"/>
      <g stroke="${YELLOW}" stroke-width="3" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => `<line x1="${C[0]}" y1="${C[1] - 21}" x2="${C[0]}" y2="${C[1] - 27}" transform="rotate(${i * 45} ${C[0]} ${C[1]})"/>`).join('')}</g>
      <path d="${shirtPath}" id="mhea-shirt" fill="#f1f5f9" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="${shirtPath}" id="mhea-glow" fill="${RED}" opacity="0"/>
      ${inc}${refl}
      ${T(140, 178, 'Sunlight (yellow arrows)', { size: 12, weight: 600, fill: MUTED })}
      ${T(262, 34, '', { id: 'mhea-nm', size: 15, fill: PRIM, anchor: 'start' })}
      ${T(262, 56, '', { id: 'mhea-rf', size: 14, anchor: 'start' })}
      ${T(262, 76, '', { id: 'mhea-ab', size: 14, anchor: 'start', fill: RED })}
      ${T(262, 116, '', { id: 'mhea-tp', size: 18, anchor: 'start' })}
      ${T(262, 136, 'Air: 30 °C', { size: 13, anchor: 'start', weight: 600, fill: MUTED })}
      <rect x="262" y="146" width="128" height="12" rx="3" fill="${MUTED}" opacity="0.25"/>
      <rect id="mhea-bar" x="262" y="146" width="10" height="12" rx="3" fill="${RED}"/>
      ${T(262, 176, 'Example numbers', { size: 12, anchor: 'start', weight: 600, fill: MUTED })}`,
      btnRow([{ id: 'mhea-bw', label: 'White' }, { id: 'mhea-bg', label: 'Grey' }, { id: 'mhea-bb', label: 'Black' }]));
    const $ = s => svg.querySelector(s), q = s => el.querySelector(s);
    let key = 'white', temp = AIR;
    const setKey = k => {
      key = k; temp = AIR;
      $('#mhea-shirt').setAttribute('fill', LOOK[k].fill);
      ['white', 'grey', 'black'].forEach(n => q('#mhea-b' + n[0] + (n === 'black' ? '' : '')).style.borderColor = n === k ? 'var(--primary)' : '');
      const a = LOOK[k].abs, r = 1 - a;
      $('#mhea-nm').textContent = LOOK[k].name;
      $('#mhea-rf').textContent = `Reflects ${Math.round(r * 100)}%`;
      $('#mhea-ab').textContent = `Absorbs ${Math.round(a * 100)}%`;
      E.forEach((e, i) => {
        const len = 8 + 52 * r, x2 = e[0] + D[0] * len, y2 = e[1] - D[1] * len;
        const l = $('#mhea-rl' + i), h = $('#mhea-rh' + i), ux = D[0], uy = -D[1];
        l.setAttribute('x1', e[0]); l.setAttribute('y1', e[1]); l.setAttribute('x2', x2 - ux * 8); l.setAttribute('y2', y2 - uy * 8);
        h.setAttribute('points', `${x2},${y2} ${x2 - ux * 10 - uy * 5},${y2 - uy * 10 + ux * 5} ${x2 - ux * 10 + uy * 5},${y2 - uy * 10 - ux * 5}`);
        $('#mhea-r' + i).setAttribute('opacity', r < 0.15 ? 0.25 : 1);
      });
    };
    [['#mhea-bw', 'white'], ['#mhea-bg', 'grey'], ['#mhea-bb', 'black']].forEach(([id, k]) => q(id).addEventListener('click', () => setKey(k)));
    setKey('white');
    api.loop((t, dt) => {
      const teq = AIR + 20 * LOOK[key].abs;
      temp += (teq - temp) * Math.min(1, dt / 4);
      const off = -t * 45;
      [0, 1, 2].forEach(i => { $('#mhea-i' + i).setAttribute('stroke-dashoffset', off.toFixed(1)); $('#mhea-rl' + i).setAttribute('stroke-dashoffset', off.toFixed(1)); });
      $('#mhea-glow').setAttribute('opacity', (clamp((temp - AIR) / 20, 0, 1) * 0.5).toFixed(2));
      $('#mhea-tp').textContent = `Shirt: ${Math.round(temp)} °C`;
      $('#mhea-bar').setAttribute('width', (clamp(temp / 50, 0, 1) * 128).toFixed(1));
    });
    return () => {};
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Dark and light clothes in the sun',
    text: '<p>Sunlight carries heat by <b>radiation</b>. A dark shirt <b>absorbs</b> most of it, so it warms up a lot. A white shirt <b>reflects</b> most of it and stays cooler. Press the buttons and compare!</p>',
    explain: '<p>A <b>shirt</b> sits in the sun at the top left. <b>Yellow arrows</b> bring sunlight in. Shorter arrows bounce back up and right: the light the shirt reflects. Choose <b>White</b>, <b>Grey</b> or <b>Black</b>. The dark shirt reflects little, glows <b>red</b> as it absorbs the energy, and its temperature climbs higher.</p>',
    say: 'Sunlight reaches this shirt as radiation. The yellow arrows bring the light in. Some of it bounces off, and that is the shorter arrows going back up. The rest is absorbed by the cloth, and the absorbed energy makes the shirt warmer. Press the buttons to change the color. A white shirt reflects most of the light, so it absorbs only a small part and heats up just a little. A black shirt reflects very little, so it absorbs almost everything, and it gets much hotter. The numbers on the screen are examples. That is why people wear light colors in hot countries.',
    mount: mheaShirtMount
  });

  // --- 2. Ice cubes in hot tea: heat flows hot -> cold until they reach one temperature (slider: cubes) ---
  function mheaTeaMount(el, api) {
    const M_TEA = 200, T_TEA = 80, M_CUBE = 15, LF = 334, CW = 4.18, DUR = 8, HOLD = 4;
    const GX0 = 226, GX1 = 388, GY0 = 150, GY1 = 34, SURF = 84;
    const gx = tau => GX0 + tau * (GX1 - GX0), gy = c => GY0 - c / 90 * (GY0 - GY1);
    const cubes = Array.from({ length: 4 }, (_, i) => `<rect id="mhea-c${i}" rx="3" fill="${BLUE}" fill-opacity="0.4" stroke="${BLUE}" stroke-width="2.5"/>`).join('');
    const dots = Array.from({ length: 14 }, (_, i) => `<circle id="mhea-d${i}" r="4" stroke="${INK}" stroke-width="0.8"/>`).join('');
    const heat = Array.from({ length: 4 }, (_, i) => `<g id="mhea-h${i}"><line stroke="${RED}" stroke-width="3"/><polygon fill="${RED}"/></g>`).join('');
    const steam = [0, 1, 2].map(i => `<path id="mhea-st${i}" d="M${70 + i * 30},76 q-6,-9 0,-18 q6,-9 0,-18" fill="none" stroke="${MUTED}" stroke-width="2.5" stroke-linecap="round"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      ${steam}
      <rect x="43" y="${SURF}" width="114" height="80" fill="${ORANGE}" opacity="0.4"/>
      <path d="M160,92 Q192,92 192,122 Q192,152 158,152" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M40,66 L40,158 Q40,166 48,166 L152,166 Q160,166 160,158 L160,66" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      ${dots}${heat}${cubes}
      ${T(100, 184, 'Cup of hot tea, 200 g', { size: 12, weight: 600, fill: MUTED })}
      ${T(GX0, 16, '', { id: 'mhea-ro', size: 14, anchor: 'start' })}
      <line x1="${GX0}" y1="${GY0}" x2="${GX1}" y2="${GY0}" stroke="${INK}" stroke-width="2"/><line x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY1 - 6}" stroke="${INK}" stroke-width="2"/>
      ${T(GX0 - 4, gy(80) + 4, '80', { size: 12, anchor: 'end', fill: MUTED })}${T(GX0 - 4, gy(0) + 4, '0', { size: 12, anchor: 'end', fill: MUTED })}
      <line x1="${GX0}" y1="${gy(80)}" x2="${GX1}" y2="${gy(80)}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="4 4"/>
      <line id="mhea-eq" x1="${GX0}" y1="0" x2="${GX1}" y2="0" stroke="${GREEN}" stroke-width="2" stroke-dasharray="6 4" opacity="0"/>
      <line id="mhea-il" x1="${GX0}" y1="${gy(0) - 1.5}" x2="${GX0}" y2="${gy(0) - 1.5}" stroke="${BLUE}" stroke-width="4" stroke-linecap="round"/>
      <polyline id="mhea-tl" fill="none" stroke="${RED}" stroke-width="4" stroke-linejoin="round" points=""/>
      <circle id="mhea-dot" r="6" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/>
      ${T(GX0 + 4, gy(0) - 8, 'Ice', { size: 12, anchor: 'start', fill: BLUE })}
      ${T(GX1, 168, 'Time →', { size: 12, anchor: 'end', fill: MUTED })}
      ${T(GX0 - 4, gy(40) + 4, '°C', { size: 12, anchor: 'end', fill: MUTED })}
      ${T(GX0, 184, '', { id: 'mhea-eqt', size: 14, anchor: 'start', fill: GREEN })}`,
      sliderRow('Ice cubes', 'mhea-n', 1, 4, 1, 2, '2 cubes'));
    const $ = s => svg.querySelector(s), slider = el.querySelector('#mhea-n'), out = el.querySelector('#mhea-n-v');
    const P = Array.from({ length: 14 }, (_, i) => ({ x: 52 + rnd(i) * 96, y: SURF + 10 + rnd(i + 40) * 68, a: rnd(i + 80) * 6.28, el: $('#mhea-d' + i) }));
    const tf = m => (M_TEA * CW * T_TEA - LF * m) / (M_TEA * CW + CW * m);          // energy balance: tea cools, ice melts, meltwater warms
    const tAt = (m, s) => (M_TEA * CW * T_TEA - LF * m * s) / (M_TEA * CW + CW * m * s);
    const prog = tau => (1 - Math.exp(-4 * tau)) / (1 - Math.exp(-4));
    let t0 = 0, n = +slider.value;
    const onInput = () => { n = +slider.value; out.textContent = n + (n === 1 ? ' cube' : ' cubes'); t0 = -1; };
    slider.addEventListener('input', onInput);
    api.loop((t, dt) => {
      if (t0 < 0) t0 = t;
      let c = t - t0; if (c > DUR + HOLD) { t0 = t; c = 0; }
      const m = n * M_CUBE, tau = Math.min(1, c / DUR), s = prog(tau), T1 = tAt(m, s), Tfin = tf(m);
      const side = 24 * Math.cbrt(Math.max(0, 1 - s));
      for (let i = 0; i < 4; i++) {
        const r = $('#mhea-c' + i), on = i < n && side > 0.5;
        if (!on) { r.setAttribute('width', 0); r.setAttribute('height', 0); continue; }
        const cx = 100 + (i - (n - 1) / 2) * 27 + Math.sin(t * 1.5 + i) * 2;
        r.setAttribute('x', (cx - side / 2).toFixed(1)); r.setAttribute('y', (SURF - side * 0.1).toFixed(1));
        r.setAttribute('width', side.toFixed(1)); r.setAttribute('height', side.toFixed(1));
      }
      for (let i = 0; i < 4; i++) {                                      // heat arrows tea -> ice while ice is left
        const g = $('#mhea-h' + i), cx = 100 + (i - (n - 1) / 2) * 27, on = i < n && s < 0.995;
        const pulse = 0.55 + 0.45 * Math.sin(t * 5 + i), y1 = SURF + 40, y2 = SURF + 12 + side * 0.9;
        g.setAttribute('opacity', on ? pulse.toFixed(2) : 0);
        const ln = g.firstChild, pg = g.lastChild;
        ln.setAttribute('x1', cx); ln.setAttribute('x2', cx); ln.setAttribute('y1', y1); ln.setAttribute('y2', y2 + 8);
        pg.setAttribute('points', `${cx},${y2} ${cx - 5},${y2 + 9} ${cx + 5},${y2 + 9}`);
      }
      const sp = 0.5 + T1 / 12;                                          // hotter tea: livelier particles
      P.forEach((p, i) => {
        p.a += (rnd(i + Math.floor(t * 3)) - 0.5) * 0.9;
        p.x = clamp(p.x + Math.cos(p.a) * sp * 22 * dt, 50, 150); p.y = clamp(p.y + Math.sin(p.a) * sp * 22 * dt, SURF + 8, 158);
        p.el.setAttribute('cx', p.x.toFixed(1)); p.el.setAttribute('cy', p.y.toFixed(1));
        p.el.setAttribute('fill', T1 > 68 ? RED : T1 > 52 ? ORANGE : YELLOW);
      });
      for (let i = 0; i < 3; i++) $('#mhea-st' + i).setAttribute('opacity', (clamp((T1 - 40) / 40, 0, 1) * (0.5 + 0.5 * Math.sin(t * 2 + i * 2))).toFixed(2));
      // graph: the curve is drawn up to now
      let pts = ''; for (let k = 0; k <= 40; k++) { const ta = tau * k / 40; pts += `${gx(ta).toFixed(1)},${gy(tAt(m, prog(ta))).toFixed(1)} `; }
      $('#mhea-tl').setAttribute('points', pts.trim());
      const il = $('#mhea-il'); il.setAttribute('x2', gx(s < 0.999 ? tau : 1));
      $('#mhea-dot').setAttribute('cx', gx(tau)); $('#mhea-dot').setAttribute('cy', gy(T1));
      const done = s > 0.985;
      const eq = $('#mhea-eq'); eq.setAttribute('y1', gy(Tfin)); eq.setAttribute('y2', gy(Tfin)); eq.setAttribute('opacity', done ? 1 : 0);
      $('#mhea-eqt').textContent = done ? `Same temperature: ${Math.round(Tfin)} °C` : 'Heat flows hot → cold';
      $('#mhea-ro').textContent = `Tea ${Math.round(T1)} °C   Ice ${done ? 'gone' : '0 °C'}`;
    });
    return () => { slider.removeEventListener('input', onInput); };
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Ice in hot tea',
    text: '<p>Put ice into hot tea and heat flows from the hot tea into the cold ice until everything is at <b>one temperature</b> (thermal equilibrium). Melting ice soaks up a lot of heat, so the tea cools. More ice means a cooler drink!</p>',
    explain: '<p>A <b>cup of tea</b> holds 200 g of hot tea with <b>blue ice cubes</b> floating in it, each 15 g. <b>Red arrows</b> show heat flowing from tea to ice. The graph on the right shows the <b>red tea line</b> falling while the <b>blue ice line</b> stays at 0 °C. When the ice is gone, both meet at one temperature. Try 1 to 4 cubes.</p>',
    say: 'Here is a cup of hot tea with ice cubes floating in it. The red arrows show heat flowing from the hot tea into the cold ice. Heat always flows from hot to cold. Watch the graph on the right. The red line is the tea. It cools down as it gives away heat. The blue line is the ice. It stays at zero degrees Celsius while it melts, because the heat goes into melting instead of warming it up. When the ice is gone, everything is at one temperature. This is called thermal equilibrium. Use the slider to add more ice cubes. With more ice, the tea ends up cooler.',
    mount: mheaTeaMount
  });

  // --- 3. Railway gaps: solids expand when heated (slider: temperature) ---
  function mheaRailMount(el, api) {
    const T0 = 10, G0 = 10, ALPHA_L = 0.24, MMPX = 3.2, RY = 118, CX = 200;    // laid at 10 C with a 10 mm gap; 20 m steel rail expands 0.24 mm per degree
    const sleepers = Array.from({ length: 11 }, (_, i) => `<rect x="${i * 40 + 12}" y="140" width="16" height="10" fill="${MUTED}" opacity="0.7"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <rect x="0" y="150" width="400" height="40" fill="${MUTED}" opacity="0.2"/>
      ${sleepers}
      <g id="mhea-sun" opacity="0"><circle cx="30" cy="34" r="12" fill="${YELLOW}"/><g stroke="${YELLOW}" stroke-width="3" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => `<line x1="30" y1="14" x2="30" y2="9" transform="rotate(${i * 45} 30 34)"/>`).join('')}</g></g>
      <g id="mhea-snow" opacity="0" stroke="${BLUE}" stroke-width="3" stroke-linecap="round"><line x1="30" y1="20" x2="30" y2="48"/><line x1="18" y1="27" x2="42" y2="41"/><line x1="18" y1="41" x2="42" y2="27"/></g>
      ${T(214, 18, '', { id: 'mhea-tp', size: 15, fill: PRIM })}
      ${T(214, 38, '', { id: 'mhea-gp', size: 14 })}
      ${T(214, 56, '', { id: 'mhea-ch', size: 13, weight: 600, fill: MUTED })}
      <g id="mhea-tr">
        <rect x="-46" y="82" width="92" height="26" rx="4" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
        <rect x="-38" y="88" width="24" height="12" fill="${SOFT}" stroke="${INK}" stroke-width="1"/><rect x="-8" y="88" width="24" height="12" fill="${SOFT}" stroke="${INK}" stroke-width="1"/>
        <circle id="mhea-w0" cx="-28" cy="109" r="9" fill="${MUTED}" stroke="${INK}" stroke-width="2.5"/><circle id="mhea-w1" cx="28" cy="109" r="9" fill="${MUTED}" stroke="${INK}" stroke-width="2.5"/>
      </g>
      <g id="mhea-rails" fill="${SOFT}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
        <path id="mhea-rl" d=""/><path id="mhea-rr" d=""/></g>
      <g id="mhea-al"><line stroke="${ORANGE}" stroke-width="5"/><polygon fill="${ORANGE}"/></g>
      <g id="mhea-ar"><line stroke="${ORANGE}" stroke-width="5"/><polygon fill="${ORANGE}"/></g>
      <path id="mhea-br" d="" fill="none" stroke="${PRIM}" stroke-width="2.5"/>
      ${T(200, 182, 'Rails laid at 10 °C with a 10 mm gap (gap drawn larger)', { size: 12, weight: 600, fill: MUTED })}`,
      sliderRow('Temp', 'mhea-tm', -10, 45, 1, 32, '32 °C'));
    const $ = s => svg.querySelector(s), slider = el.querySelector('#mhea-tm'), out = el.querySelector('#mhea-tm-v');
    const prof = (a, b) => { const lo = Math.min(a, b), hi = Math.max(a, b);          // simple rail profile: head, web, foot
      return `M${lo},${RY} L${hi},${RY} L${hi},${RY + 22} L${lo},${RY + 22} L${lo},${RY} Z`; };
    const arrowSet = (g, x1, x2, y, color) => {
      const dir = Math.sign(x2 - x1) || 1, hl = 9, bx = x2 - dir * hl;
      g.firstChild.setAttribute('x1', x1); g.firstChild.setAttribute('x2', bx); g.firstChild.setAttribute('y1', y); g.firstChild.setAttribute('y2', y);
      g.firstChild.setAttribute('stroke', color); g.lastChild.setAttribute('fill', color);
      g.lastChild.setAttribute('points', `${x2},${y} ${bx},${y - 6} ${bx},${y + 6}`);
    };
    const onInput = () => { out.textContent = slider.value + ' °C'; };
    slider.addEventListener('input', onInput);
    let xt = -60;
    api.loop((t, dt) => {
      const tc = +slider.value, dl = ALPHA_L * (tc - T0), gap = Math.max(0.5, G0 - dl), gp = gap * MMPX;
      const lx = CX - gp / 2, rx = CX + gp / 2;
      $('#mhea-rl').setAttribute('d', prof(-10, lx)); $('#mhea-rr').setAttribute('d', prof(rx, 410));
      xt += 62 * dt; if (xt > 470) xt = -60;
      const dip = [-28, 28].some(o => Math.abs(xt + o - CX) < gp / 2 + 5) ? 2.5 : 0;
      $('#mhea-tr').setAttribute('transform', `translate(${xt.toFixed(1)} ${dip})`);
      const big = Math.abs(dl) > 0.3, len = 8 + Math.min(1, Math.abs(dl) / 8) * 26;
      $('#mhea-al').setAttribute('opacity', big ? 1 : 0); $('#mhea-ar').setAttribute('opacity', big ? 1 : 0);
      if (big) {
        if (dl > 0) { arrowSet($('#mhea-al'), lx - 6 - len, lx - 6, RY + 11, ORANGE); arrowSet($('#mhea-ar'), rx + 6 + len, rx + 6, RY + 11, ORANGE); }
        else { arrowSet($('#mhea-al'), lx - 4, lx - 4 - len, RY + 11, BLUE); arrowSet($('#mhea-ar'), rx + 4, rx + 4 + len, RY + 11, BLUE); }
      }
      $('#mhea-br').setAttribute('d', `M${lx},${RY + 28} L${lx},${RY + 34} L${rx},${RY + 34} L${rx},${RY + 28}`);
      $('#mhea-sun').setAttribute('opacity', clamp((tc - 22) / 12, 0, 1).toFixed(2));
      $('#mhea-snow').setAttribute('opacity', clamp((4 - tc) / 8, 0, 1).toFixed(2));
      $('#mhea-tp').textContent = `Temperature: ${tc} °C`;
      $('#mhea-gp').textContent = `Gap between rails: ${gap.toFixed(1)} mm`;
      const a = Math.abs(dl).toFixed(1);
      $('#mhea-ch').textContent = Math.abs(dl) < 0.05 ? 'Same length as when laid' : `Each 20 m rail is ${a} mm ${dl > 0 ? 'longer' : 'shorter'}`;
    });
    return () => { slider.removeEventListener('input', onInput); };
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Gaps in railway tracks',
    text: '<p>Solids <b>expand</b> when they get hot, because their particles vibrate harder and push apart. Steel rails grow a few millimeters on a hot day, so builders leave small gaps. Drag the temperature!</p>',
    explain: '<p>A <b>train</b> rolls across two <b>steel rails</b> with a gap between them. The <b>Temp</b> slider changes the weather. Hot: <b>orange arrows</b> show each rail growing into the gap, which shrinks. Cold: <b>blue arrows</b> show the rails shrinking, and the gap widens. The gap is drawn larger than real.</p>',
    say: 'A train rolls along a railway track. Look at the small gap between the two steel rails. Now use the temperature slider. On a hot day, the particles in the steel vibrate more and push slightly apart, so the rails get longer. The orange arrows show each rail growing into the gap, and the gap gets smaller. On a cold day, the rails shrink, the blue arrows point away, and the gap opens wider. A twenty meter steel rail changes by only about a quarter of a millimeter for every degree, but that adds up. Without a gap, hot rails would push against each other and bend.',
    mount: mheaRailMount
  });

  // --- 4. Hot air balloon: hot air is less dense, so it floats up (slider: air temperature) ---
  function mheaBalloonMount(el, api) {
    const V = 2800, LOAD = 500, T_OUT = 20, K = 352.96, GY = 160, BX = 110, NP = 16;      // rho = K / T(kelvin) for air: 1.204 kg/m3 at 20 C
    const rho = c => K / (c + 273.15), Y_TOP = 118;
    const dots = Array.from({ length: NP }, (_, i) => `<circle id="mhea-p${i}" r="3.6" fill="${ORANGE}" stroke="${INK}" stroke-width="0.6"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <g fill="${SOFT}" stroke="${MUTED}" stroke-width="1.5" opacity="0.9">
        <ellipse cx="0" cy="34" rx="26" ry="9"><animate attributeName="cx" values="-30;440" dur="40s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="0" cy="88" rx="20" ry="7"><animate attributeName="cx" values="120;440;-30;120" keyTimes="0;0.5;0.5001;1" dur="30s" repeatCount="indefinite"/></ellipse></g>
      <rect x="0" y="${GY}" width="400" height="24" fill="${GREEN}" opacity="0.35"/><line x1="0" y1="${GY}" x2="400" y2="${GY}" stroke="${INK}" stroke-width="2"/>
      <g id="mhea-bal">
        <line x1="-22" y1="-44" x2="-12" y2="-18" stroke="${INK}" stroke-width="2"/><line x1="22" y1="-44" x2="12" y2="-18" stroke="${INK}" stroke-width="2"/>
        <path d="M0,-132 C64,-132 66,-78 30,-50 L22,-44 L-22,-44 L-30,-50 C-66,-78 -64,-132 0,-132 Z" fill="${RED}" fill-opacity="0.28" stroke="${RED}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="-15" y="-18" width="30" height="18" rx="2" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
        <rect x="-4" y="-46" width="8" height="4" fill="${MUTED}"/>
        <ellipse id="mhea-fl" cx="0" cy="-53" rx="4" ry="9" fill="${YELLOW}" stroke="${ORANGE}" stroke-width="2"/>
        ${dots}
      </g>
      ${T(268, 22, '', { id: 'mhea-ti', size: 14, anchor: 'start', fill: PRIM })}
      ${T(268, 40, 'Air outside: 20 °C', { size: 13, anchor: 'start', weight: 600, fill: MUTED })}
      ${T(268, 60, '', { id: 'mhea-ri', size: 13, anchor: 'start', fill: RED })}
      ${T(268, 78, '', { id: 'mhea-ro', size: 13, anchor: 'start', fill: BLUE })}
      ${T(268, 102, '', { id: 'mhea-vd', size: 17, anchor: 'start' })}
      <line id="mhea-ul" x1="196" x2="196"/><polygon id="mhea-uh" fill="${GREEN}"/>
      <line id="mhea-dl" x1="252" x2="252" stroke="${RED}" stroke-width="5"/><polygon id="mhea-dh" fill="${RED}"/>
      ${T(196, 173, 'Lift', { size: 12, fill: INK })}${T(252, 173, 'Weight', { size: 12, fill: INK })}
      ${T(196, 187, '', { id: 'mhea-lt', size: 12, fill: INK })}${T(252, 187, '', { id: 'mhea-wt', size: 12, fill: INK })}`,
      sliderRow('Air inside', 'mhea-bt', 20, 120, 1, 95, '95 °C'));
    const $ = s => svg.querySelector(s), slider = el.querySelector('#mhea-bt'), out = el.querySelector('#mhea-bt-v');
    $('#mhea-ul').setAttribute('stroke', GREEN); $('#mhea-ul').setAttribute('stroke-width', 5);
    const P = Array.from({ length: NP }, (_, i) => ({ x: (rnd(i) - 0.5) * 70, y: -92 + (rnd(i + 30) - 0.5) * 60, a: rnd(i + 60) * 6.28, el: $('#mhea-p' + i) }));
    const arrow = (line, head, x, y1, y2, w) => {                           // vertical arrow from y1, tip at y2
      const dir = Math.sign(y2 - y1) || 1, hl = 9, by = y2 - dir * hl;
      line.setAttribute('y1', y1); line.setAttribute('y2', by);
      head.setAttribute('points', `${x},${y2} ${x - 6},${by} ${x + 6},${by}`);
    };
    const onInput = () => { out.textContent = slider.value + ' °C'; };
    slider.addEventListener('input', onInput);
    let alt = 0;                                                             // pixels above the ground
    api.loop((t, dt) => {
      const tc = +slider.value, rin = rho(tc), rout = rho(T_OUT), lift = V * (rout - rin), net = lift - LOAD;
      let vy = Math.abs(net) < 20 ? 0 : clamp(net / 14, -28, 30);
      alt = clamp(alt + vy * dt, 0, GY - Y_TOP);
      $('#mhea-bal').setAttribute('transform', `translate(${BX} ${(GY - alt).toFixed(1)}) scale(0.78)`);
      const nAct = Math.round(NP * rin / rout), sp = 14 + Math.sqrt(tc + 273) * 1.2;
      P.forEach((p, i) => {
        p.a += (rnd(i + Math.floor(t * 4)) - 0.5) * 1.2;
        p.x += Math.cos(p.a) * sp * dt; p.y += Math.sin(p.a) * sp * dt;
        const ex = p.x / 46, ey = (p.y + 92) / 34, d = Math.hypot(ex, ey);
        if (d > 1) { p.x /= d; p.y = -92 + (p.y + 92) / d; p.a += Math.PI; }
        p.el.setAttribute('cx', p.x.toFixed(1)); p.el.setAttribute('cy', p.y.toFixed(1)); p.el.setAttribute('opacity', i < nAct ? 1 : 0);
      });
      const hot = clamp((tc - 20) / 100, 0, 1);
      $('#mhea-fl').setAttribute('ry', (tc > 20 ? 5 + 9 * hot + Math.sin(t * 25) * 2 : 0).toFixed(1));
      $('#mhea-bal').querySelector('path').setAttribute('fill-opacity', (0.15 + 0.25 * hot).toFixed(2));
      $('#mhea-ti').textContent = `Air inside: ${tc} °C`;
      $('#mhea-ri').textContent = `Inside: ${rin.toFixed(2)} kg/m³`;
      $('#mhea-ro').textContent = `Outside: ${rout.toFixed(2)} kg/m³`;
      const v = $('#mhea-vd');
      v.textContent = Math.abs(net) < 20 ? 'Just floats' : net > 0 ? 'Balloon RISES' : (alt > 0.5 ? 'Balloon SINKS' : 'On the ground');
      const L = 6 + lift * 0.055, W = 6 + LOAD * 0.055, y0 = 112;
      arrow($('#mhea-ul'), $('#mhea-uh'), 196, y0, y0 - L); arrow($('#mhea-dl'), $('#mhea-dh'), 252, y0, y0 + W);
      $('#mhea-lt').textContent = `${Math.round(lift)} kg`; $('#mhea-wt').textContent = `${LOAD} kg`;
    });
    return () => { slider.removeEventListener('input', onInput); };
  }
  steps.push({
    kind: 'example',
    title: 'Real life: A hot air balloon',
    text: '<p>A burner heats the air inside the balloon. Hot air <b>expands</b>, so it is <b>less dense</b> than the cooler air outside, and the surrounding air pushes it upward, just like a cork in water. When the lift is bigger than the weight, the balloon rises.</p>',
    explain: '<p>A <b>red balloon</b> with an orange basket has a yellow flame below its opening. <b>Orange dots</b> are air particles inside; fewer of them fit as the <b>Air inside</b> slider gets hotter. The panel compares air densities. A <b>green arrow</b> shows lift and a <b>red arrow</b> shows the 500 kg weight. Lift wins above about 71 °C.</p>',
    say: 'Look at the hot air balloon. The orange dots are the air particles inside it. Use the slider to heat the air. When air gets hot, it expands, so some of it escapes from the opening at the bottom. That leaves fewer particles inside, so the air in the balloon is less dense than the cooler air outside. The cooler air pushes the light, hot air upward, and this gives the balloon a lift. The green arrow shows the lift and the red arrow shows the weight. When the lift is bigger than the weight, the balloon rises. If you cool the air, the balloon sinks. Pilots control height with the burner.',
    mount: mheaBalloonMount
  });

  // --- 5. Refrigerator: a heat pump moves heat from cold to warm, using electricity (buttons: door) ---
  function mheaFridgeMount(el, api) {
    // closed loop of pipe: evaporator (inside) -> compressor -> condenser (back) -> valve -> evaporator
    const raw = [[46, 50], [62, 66], [78, 50], [94, 66], [110, 50], [126, 66], [136, 50], [144, 50], [156, 50], [156, 152], [196, 152],
      [196, 146], [206, 134], [186, 122], [206, 110], [186, 98], [206, 86], [186, 74], [206, 62], [196, 52], [196, 22], [46, 22], [46, 50]];
    const cum = [0]; for (let i = 1; i < raw.length; i++) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
    const TOTAL = cum[cum.length - 1];
    const at = d => { d = ((d % TOTAL) + TOTAL) % TOTAL; let i = 1; while (cum[i] < d) i++; const k = (d - cum[i - 1]) / (cum[i] - cum[i - 1]); return [lerp(raw[i - 1][0], raw[i][0], k), lerp(raw[i - 1][1], raw[i][1], k)]; };
    const D_COMP_OUT = cum[10], D_COND_MID = cum[15], D_VALVE = cum[20] + (196 - 110);        // where the refrigerant changes state
    const kind = d => (d >= D_COMP_OUT && d < D_COND_MID) ? RED : (d >= D_COND_MID && d < D_VALVE) ? ORANGE : BLUE;
    const NP = 26, pipe = 'M' + raw.map(p => p.join(',')).join(' L') + ' Z';
    const dots = Array.from({ length: NP }, (_, i) => `<circle id="mhea-f${i}" r="3.6" stroke="${INK}" stroke-width="0.7"/>`).join('');
    const warm = [0, 1, 2].map(i => `<g id="mhea-w${i}" opacity="0"><line x1="4" x2="24" y1="${104 + i * 20}" y2="${104 + i * 20}" stroke="${ORANGE}" stroke-width="4"/><polygon points="32,${104 + i * 20} 23,${99 + i * 20} 23,${109 + i * 20}" fill="${ORANGE}"/></g>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <rect x="34" y="32" width="110" height="142" rx="6" fill="${BLUE}" fill-opacity="0.13" stroke="${INK}" stroke-width="4"/>
      <line id="mhea-door" x1="34" y1="32" x2="34" y2="174" stroke="${MUTED}" stroke-width="8" stroke-linecap="round"/>
      <line x1="40" y1="150" x2="138" y2="150" stroke="${INK}" stroke-width="3"/>
      <circle cx="62" cy="141" r="9" fill="${RED}" stroke="${INK}" stroke-width="1.5"/><rect x="94" y="126" width="18" height="24" rx="2" fill="${SOFT}" stroke="${INK}" stroke-width="2"/><polygon points="94,126 103,118 112,126" fill="${SOFT}" stroke="${INK}" stroke-width="2"/>
      <path d="${pipe}" fill="none" stroke="${MUTED}" stroke-width="7" stroke-linejoin="round" opacity="0.45"/>
      <circle cx="176" cy="152" r="12" fill="${SOFT}" stroke="${INK}" stroke-width="3"/><path d="M170,152 L182,152 M176,146 L176,158" stroke="${INK}" stroke-width="2"/>
      <polygon points="102,16 110,22 102,28" fill="${INK}"/><polygon points="118,16 110,22 118,28" fill="${INK}"/>
      ${warm}${dots}
      ${T(110, 13, 'Valve', { size: 12, fill: MUTED })}
      ${T(90, 90, 'Evaporator', { size: 12, fill: BLUE })}
      ${T(176, 184, 'Compressor', { size: 12, fill: MUTED })}
      ${T(216, 122, 'Condenser', { size: 12, fill: RED, anchor: 'start' })}
      <g id="mhea-hin" opacity="0.9">
        <line x1="54" y1="118" x2="54" y2="102" stroke="${BLUE}" stroke-width="3"/><polygon points="54,94 49,104 59,104" fill="${BLUE}"/>
        <line x1="126" y1="118" x2="126" y2="102" stroke="${BLUE}" stroke-width="3"/><polygon points="126,94 121,104 131,104" fill="${BLUE}"/>
        ${T(90, 112, 'heat in', { size: 12, fill: BLUE })}</g>
      <line id="mhea-hl" x1="214" y1="88" x2="230" y2="88" stroke="${RED}" stroke-width="5"/><polygon id="mhea-hh" fill="${RED}"/>
      ${T(260, 92, 'Heat out', { size: 13, fill: RED, anchor: 'start' })}
      ${T(252, 22, '', { id: 'mhea-dr', size: 14, anchor: 'start', fill: PRIM })}
      ${T(252, 42, '', { id: 'mhea-in', size: 15, anchor: 'start' })}
      ${T(252, 60, 'Room: 22 °C', { size: 13, anchor: 'start', weight: 600, fill: MUTED })}
      ${T(252, 148, 'A fridge pumps heat', { size: 12, anchor: 'start', weight: 600, fill: MUTED })}
      ${T(252, 164, 'from cold to warm,', { size: 12, anchor: 'start', weight: 600, fill: MUTED })}
      ${T(252, 180, 'using electricity.', { size: 12, anchor: 'start', weight: 600, fill: MUTED })}`,
      btnRow([{ id: 'mhea-dc', label: 'Door closed' }, { id: 'mhea-do', label: 'Door open' }]));
    const $ = s => svg.querySelector(s), q = s => el.querySelector(s);
    const F = Array.from({ length: NP }, (_, i) => ({ d: i * TOTAL / NP, el: $('#mhea-f' + i) }));
    let open = false, inside = 4, hout = 26;
    const setDoor = o => {
      open = o;
      q('#mhea-dc').style.borderColor = o ? '' : 'var(--primary)'; q('#mhea-do').style.borderColor = o ? 'var(--primary)' : '';
      $('#mhea-door').setAttribute('opacity', o ? 0.12 : 1);
      $('#mhea-dr').textContent = o ? 'Door open' : 'Door closed';
    };
    q('#mhea-dc').addEventListener('click', () => setDoor(false)); q('#mhea-do').addEventListener('click', () => setDoor(true));
    setDoor(false);
    api.loop((t, dt) => {
      inside += ((open ? 14 : 4) - inside) * Math.min(1, dt / (open ? 6 : 3));
      const speed = open ? 78 : 46;
      F.forEach(f => { f.d = (f.d + speed * dt) % TOTAL; const p = at(f.d); f.el.setAttribute('cx', p[0].toFixed(1)); f.el.setAttribute('cy', p[1].toFixed(1)); f.el.setAttribute('fill', kind(f.d)); });
      hout += ((open ? 40 : 24) - hout) * Math.min(1, dt * 2);
      const x2 = 214 + hout * 0.8;
      $('#mhea-hl').setAttribute('x2', x2 - 8); $('#mhea-hh').setAttribute('points', `${x2 + 4},88 ${x2 - 8},81 ${x2 - 8},95`);
      $('#mhea-hin').setAttribute('opacity', (0.55 + 0.45 * Math.sin(t * 5)).toFixed(2));
      [0, 1, 2].forEach(i => $('#mhea-w' + i).setAttribute('opacity', open ? (0.5 + 0.5 * Math.sin(t * 6 + i)).toFixed(2) : 0));
      $('#mhea-in').textContent = `Inside: ${Math.round(inside)} °C`;
    });
    return () => {};
  }
  steps.push({
    kind: 'example',
    title: 'Real life: How a fridge works',
    text: '<p>Heat flows from hot to cold by itself, so a fridge has to work to push heat the other way. A <b>compressor</b> and a special fluid carry heat out of the cold inside and dump it into your kitchen. That is why the back of a fridge is warm.</p>',
    explain: '<p>A <b>fridge</b> with a <b>blue cold coil</b> inside, a <b>compressor</b> and a <b>red coil</b> at the back. Dots travel round the pipe: blue when cold, red when hot. <b>Blue arrows</b> take heat in from the food, and a <b>red arrow</b> pushes more heat out. Press <b>Door open</b>: warm air enters, the inside warms and the motor works harder.</p>',
    say: 'This is the inside of a fridge. A special fluid flows round the pipe, and the colored dots show it. In the cold coil inside the fridge, the fluid boils into gas and takes heat from the food. That is the small blue arrows. The compressor squeezes the gas, and this makes it hot. In the coil at the back, the hot gas gives its heat to the kitchen air and turns back into liquid. The red arrow is the heat going out, and it is bigger than the heat taken in, because the motor adds energy. Press door open. Warm air rushes in, the inside warms up, and the fridge works harder.',
    mount: mheaFridgeMount
  });

  // STEPS-GO-HERE

  addTutorialSteps('physics', 'heat', steps, []);
})();
