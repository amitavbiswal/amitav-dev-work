(function () {
  'use strict';
  // more-physics-matter: five extra real-life examples for "Matter & States".
  // Namespace: mmat- (every DOM id / class in this file starts with it).

  const PRIM = 'var(--primary)', ORANGE = 'var(--t-orange)', BLUE = 'var(--t-blue)', TEAL = 'var(--t-teal)';
  const YELLOW = 'var(--t-yellow)', RED = 'var(--t-red)', GREEN = 'var(--t-green)';
  const SOFT = 'var(--t-soft)', INK = 'var(--t-ink)', MUTED = 'var(--t-muted)';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const f1 = n => (Math.round(n * 10) / 10).toFixed(1);
  const rnd = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
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

  // --- 1. Condensation on a cold glass: water vapor from the AIR turns to liquid (slider: glass temperature) ---
  function mmatGlassMount(el, api) {
    const N = 16, SLOTS = 12, DEW = 17, X0 = 172, X1 = 392, Y0 = 60, Y1 = 178, WALL = 150;
    const dots = Array.from({ length: N }, (_, i) => `<circle id="mmat-v${i}" r="4.5" fill="${TEAL}" stroke="${INK}" stroke-width="1"/>`).join('');
    const drops = Array.from({ length: SLOTS }, (_, k) =>
      `<circle id="mmat-d${k}" cx="${WALL + 2 + (k % 2) * 2}" cy="${72 + k * 7.8}" r="0" fill="${BLUE}" stroke="${INK}" stroke-width="1"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      ${T(200, 18, 'Room air 25 °C, humid: dew point 17 °C', { size: 14, fill: PRIM })}
      ${T(200, 38, '', { id: 'mmat-msg', size: 14 })}
      <rect x="${X0 - 8}" y="${Y0 - 4}" width="${X1 - X0 + 18}" height="${Y1 - Y0 + 10}" rx="8" fill="${TEAL}" opacity="0.08"/>
      <path d="M50,62 L50,158 Q50,166 58,166 L142,166 Q150,166 150,158 L150,62" fill="${SOFT}" fill-opacity="0.5" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <rect id="mmat-drink" x="54" y="84" width="92" height="80" fill="${BLUE}" opacity="0.4"/>
      <rect x="66" y="94" width="26" height="26" rx="4" fill="${BLUE}" opacity="0.25" stroke="${BLUE}" stroke-width="1.5" transform="rotate(-12 79 107)"/>
      ${drops}${dots}
      ${T(100, 188, 'Glass with a cold drink', { size: 12, weight: 600, fill: MUTED })}
      ${T(282, 188, 'Water vapor in the air (dots)', { size: 12, weight: 600, fill: MUTED })}`,
      sliderRow('Glass', 'mmat-gt', 0, 25, 1, 6, '6 °C'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mmat-gt'), out = el.querySelector('#mmat-gt-v');
    const P = Array.from({ length: N }, (_, i) => {
      const a = rnd(i) * 6.283;
      return { x: X0 + 10 + rnd(i + 20) * (X1 - X0 - 20), y: Y0 + 8 + rnd(i + 40) * (Y1 - Y0 - 16), vx: Math.cos(a) * 85, vy: Math.sin(a) * 85, el: $('#mmat-v' + i) };
    });
    const R = new Array(SLOTS).fill(0);           // droplet radius per slot (0 = none)
    const G = new Array(SLOTS).fill(0);           // growth target
    let dryT = 0, cnt = 0;
    const onInput = () => { out.textContent = slider.value + ' °C'; };
    slider.addEventListener('input', onInput);
    api.loop((t, dt) => {
      const tg = +slider.value, cold = tg < DEW, pStick = cold ? clamp((DEW - tg) / 9, 0.08, 1) : 0;
      $('#mmat-drink').setAttribute('opacity', 0.15 + 0.35 * (1 - tg / 25));
      P.forEach((p, i) => {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x > X1) { p.x = X1; p.vx = -Math.abs(p.vx); }
        if (p.y < Y0) { p.y = Y0; p.vy = Math.abs(p.vy); }
        if (p.y > Y1) { p.y = Y1; p.vy = -Math.abs(p.vy); }
        if (p.x < X0) {
          if (rnd(t * 60 + i * 7.7) < pStick) {                               // vapor slows, sticks, becomes liquid
            const free = R.findIndex((r, k) => r === 0 && G[k] === 0);
            if (free >= 0) G[free] = 3.4 + rnd(cnt++ + 3) * 1.6;
            else { const k = Math.floor(rnd(cnt++) * SLOTS); R[k] = 0; G[k] = 0; }   // a full drop runs down and clears
            p.x = X1 - 4; p.y = Y0 + 6 + rnd(cnt + i) * (Y1 - Y0 - 12);
            const a = Math.PI + (rnd(cnt + 5) - 0.5) * 1.6; p.vx = Math.cos(a) * 85; p.vy = Math.sin(a) * 85;
          } else { p.x = X0; p.vx = Math.abs(p.vx); }
        }
        p.el.setAttribute('cx', p.x); p.el.setAttribute('cy', p.y);
      });
      if (!cold) {                                                            // warm glass: drops evaporate again
        dryT += dt;
        if (dryT > 0.35) { dryT = 0; const k = R.findIndex(r => r > 0); if (k >= 0) G[k] = 0; }
      }
      for (let k = 0; k < SLOTS; k++) {
        R[k] += (G[k] - R[k]) * Math.min(1, dt * 4);
        if (G[k] === 0 && R[k] < 0.15) R[k] = 0;
        $('#mmat-d' + k).setAttribute('r', R[k].toFixed(2));
      }
      $('#mmat-msg').textContent = cold
        ? `Glass ${tg} °C is below dew point: vapor condenses`
        : `Glass ${tg} °C is above dew point: no droplets`;
    });
    return () => { slider.removeEventListener('input', onInput); };
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Water drops on a cold glass',
    text: '<p>A glass of iced water gets wet <i>outside</i>. The water is not leaking through: <b>water vapor</b> from the air touches the cold glass, loses energy and <b>condenses</b> into liquid droplets. Slide the glass temperature and see!</p>',
    explain: '<p>A <b>glass with a cold drink</b> stands at the left. To its right, <b>teal dots</b> show water vapor in the air, zooming around. When a dot hits the glass wall while the <b>Glass</b> slider is below 17 °C, it sticks and a <b>blue droplet</b> grows there. Above 17 °C the dots bounce off and the drops dry away.</p>',
    say: 'Here is a glass with a cold drink. The teal dots on the right are water vapor, the invisible gas that is always in humid air. The dots zoom about and bump into the glass. Try the glass temperature slider. When the glass is colder than the dew point, which is seventeen degrees Celsius in this room, a dot that hits the glass slows down and sticks. It turns into liquid, and a blue droplet grows on the outside of the glass. The colder the glass, the faster the droplets appear. Now slide the glass to a warm temperature. The dots just bounce off and the droplets dry away. So the water comes from the air, not from inside the glass.',
    mount: mmatGlassMount
  });

  // --- 2. An egg in fresh vs salty water: density decides float or sink (slider: salt) ---
  function mmatEggMount(el, api) {
    const RHO_E = 1.08, A = 25, SURF = 62, FLOOR = 164, CX = 100, NS_ = 30;
    const salts = Array.from({ length: NS_ }, (_, i) => `<circle id="mmat-s${i}" r="2.6" fill="${INK}" opacity="0.75"/>`).join('');
    const bx = v => 205 + clamp((v - 0.95) / 0.3, 0, 1) * 185;          // density -> bar end x
    const svg = scene(el, '0 0 400 190', `
      <path d="M30,40 L30,160 Q30,170 40,170 L160,170 Q170,170 170,160 L170,40" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <rect id="mmat-water" x="33" y="${SURF}" width="134" height="${FLOOR + 4 - SURF}" fill="${BLUE}" opacity="0.28"/>
      <path d="M33,${SURF} q8,-3 17,0 t17,0 t17,0 t17,0 t17,0 t17,0 t17,0 t17,0" fill="none" stroke="${BLUE}" stroke-width="2.5">
        <animateTransform attributeName="transform" type="translate" values="0,0;-34,0" dur="2.4s" repeatCount="indefinite"/></path>
      ${salts}
      <ellipse id="mmat-egg" cx="${CX}" cy="0" rx="19" ry="${A}" fill="${YELLOW}" fill-opacity="0.7" stroke="${ORANGE}" stroke-width="3"/>
      ${T(100, 186, 'Glass of water', { size: 12, weight: 600, fill: MUTED })}
      ${T(205, 24, 'Egg: 1.08 g/mL', { size: 14, fill: ORANGE, anchor: 'start' })}
      <rect x="205" y="30" width="${bx(RHO_E) - 205}" height="12" rx="3" fill="${ORANGE}"/>
      <rect id="mmat-wbar" x="205" y="48" width="10" height="12" rx="3" fill="${BLUE}"/>
      <line x1="${bx(RHO_E)}" y1="27" x2="${bx(RHO_E)}" y2="64" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4 3"/>
      ${T(205, 84, '', { id: 'mmat-wl', size: 14, fill: BLUE, anchor: 'start' })}
      ${T(205, 120, '', { id: 'mmat-v1', size: 17, anchor: 'start' })}
      ${T(205, 140, '', { id: 'mmat-v2', size: 13, fill: MUTED, weight: 600, anchor: 'start' })}
      ${T(205, 164, 'Salt adds mass,', { size: 13, anchor: 'start', weight: 600, fill: MUTED })}
      ${T(205, 180, 'but hardly any volume', { size: 13, anchor: 'start', weight: 600, fill: MUTED })}`,
      sliderRow('Salt', 'mmat-salt', 0, 25, 1, 6, '6 %'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mmat-salt'), out = el.querySelector('#mmat-salt-v');
    const S = Array.from({ length: NS_ }, (_, i) => ({ x: 40 + rnd(i) * 120, y: SURF + 6 + rnd(i + 50) * (FLOOR - SURF - 12), a: rnd(i + 90) * 6.283, el: $('#mmat-s' + i) }));
    const egg = $('#mmat-egg');
    let y = 22, v = 0;                                                     // egg centre and speed
    const onInput = () => { out.textContent = slider.value + ' %'; };
    slider.addEventListener('input', onInput);
    // depth (0..2A) of an egg-shaped body floating with volume fraction f under water: f = u^2 (3 - 2u), u = depth / 2A
    const depthFor = f => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const u = (lo + hi) / 2; (u * u * (3 - 2 * u) < f) ? lo = u : hi = u; } return (lo + hi) * A; };
    api.loop((t, dt) => {
      const w = +slider.value, rho = 1 + 0.0074 * w, d = rho - RHO_E;
      const nShow = Math.round(w * NS_ / 25);
      S.forEach((p, i) => {
        p.a += (rnd(i + Math.floor(t * 2)) - 0.5) * 3 * dt * 8;
        p.x = clamp(p.x + Math.cos(p.a) * 14 * dt, 38, 162); p.y = clamp(p.y + Math.sin(p.a) * 14 * dt, SURF + 6, FLOOR - 4);
        p.el.setAttribute('cx', p.x); p.el.setAttribute('cy', p.y); p.el.setAttribute('opacity', i < nShow ? 0.75 : 0);
      });
      let target;
      if (Math.abs(d) < 0.0005) target = null;                              // same density: hovers
      else if (d < 0) target = FLOOR - A;                                  // egg denser: sinks
      else target = SURF + depthFor(RHO_E / rho) - A;                      // floats: submerged fraction = rho_egg / rho_water
      const sp = clamp(Math.abs(d) * 700, 10, 75);
      if (target === null) { v = 0; y = clamp(y, SURF + A, FLOOR - A); }
      else if (d < 0) { y = Math.min(target, y + sp * dt); }
      else if (y > target + 0.5) { y = Math.max(target, y - sp * dt); }
      else y = target;
      const bob = (d > 0 && Math.abs(y - target) < 1) ? Math.sin(t * 2.2) * 1.3 : 0;
      egg.setAttribute('cy', (y + bob).toFixed(1));
      $('#mmat-wbar').setAttribute('width', bx(rho) - 205);
      $('#mmat-wl').textContent = `Salt water: ${rho.toFixed(2)} g/mL`;
      const ff = Math.abs(d) < 0.0005 ? 'The egg hovers' : d < 0 ? 'The egg SINKS' : 'The egg FLOATS';
      $('#mmat-v1').textContent = ff;
      $('#mmat-v2').textContent = Math.abs(d) < 0.0005 ? 'same density as the water' : d < 0 ? 'egg is denser than the water' : 'water is denser than the egg';
    });
    return () => { slider.removeEventListener('input', onInput); };
  }
  steps.push({
    kind: 'example',
    title: 'Real life: An egg in fresh and salty water',
    text: '<p>A fresh egg sinks in tap water but floats in very salty water. Dissolving salt adds mass without adding much volume, so the water gets <b>denser</b>. When it is denser than the egg, the egg floats. Slide the salt!</p>',
    explain: '<p>An <b>egg</b> (yellow oval) drops into a <b>glass of water</b> at the left. The <b>Salt</b> slider adds tiny dark dots for dissolved salt. On the right, an <b>orange bar</b> shows the egg’s density, 1.08 g/mL, and a <b>blue bar</b> shows the water’s. Once the blue bar passes the dashed line, the egg rises and floats.</p>',
    say: 'Here is an egg dropping into a glass of water. On the right, the orange bar shows the density of the egg, which is one point zero eight grams per milliliter. The blue bar shows the density of the water. Plain water has a density of one, so the egg is denser, and it sinks to the bottom. Now use the salt slider. The dark dots are dissolved salt. Salt adds mass to the water but hardly any volume, so the water becomes denser. When the blue bar gets longer than the dashed line, the water is denser than the egg, and the egg rises and floats. The Dead Sea is so salty that people float in it too.',
    mount: mmatEggMount
  });

  // --- 3. Frozen pipes: water is unusual, it EXPANDS about 9% when it freezes (looping scene) ---
  function mmatPipeMount(el, api) {
    const COLS = 18, ROWS = 4, X0 = 44, X1 = 356, CY = 120, CYC = 14, CRACK_X = 282;
    const dots = Array.from({ length: COLS * ROWS }, (_, i) => `<circle id="mmat-p${i}" r="5" fill="${BLUE}" stroke="${INK}" stroke-width="0.8"/>`).join('');
    const drips = [0, 1, 2].map(k => `<circle id="mmat-w${k}" cx="${CRACK_X}" cy="0" r="0" fill="${BLUE}" stroke="${INK}" stroke-width="1"/>`).join('');
    const svg = scene(el, '0 0 400 240', `
      ${T(200, 22, '', { id: 'mmat-ph', size: 15, fill: PRIM })}
      ${T(200, 42, '', { id: 'mmat-tp', size: 14 })}
      ${T(200, 60, '', { id: 'mmat-vol', size: 13, weight: 600, fill: MUTED })}
      <path id="mmat-fill" fill="${BLUE}" opacity="0.28"/>
      ${dots}
      <path id="mmat-wt" fill="none" stroke="${MUTED}" stroke-width="7" stroke-linecap="round"/>
      <path id="mmat-wb" fill="none" stroke="${MUTED}" stroke-width="7" stroke-linecap="round"/>
      <line x1="${X0 - 4}" y1="${CY - 38}" x2="${X0 - 4}" y2="${CY + 38}" stroke="${MUTED}" stroke-width="7" stroke-linecap="round"/>
      <line x1="${X1 + 4}" y1="${CY - 38}" x2="${X1 + 4}" y2="${CY + 38}" stroke="${MUTED}" stroke-width="7" stroke-linecap="round"/>
      <polyline id="mmat-crack" points="${CRACK_X - 2},150 ${CRACK_X + 4},158 ${CRACK_X - 4},166 ${CRACK_X + 4},174" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linejoin="round" opacity="0"/>
      ${T(CRACK_X + 14, 172, 'CRACK!', { id: 'mmat-cr', size: 14, fill: RED, anchor: 'start', extra: 'opacity="0"' })}
      ${drips}
      <ellipse id="mmat-pud" cx="${CRACK_X}" cy="228" rx="0" ry="4" fill="${BLUE}" opacity="0.6"/>
      ${T(100, 200, 'Water pipe (bulge exaggerated)', { size: 12, weight: 600, fill: MUTED })}
      ${T(100, 218, 'Dots: water particles', { size: 12, weight: 600, fill: MUTED })}`);
    const $ = s => svg.querySelector(s);
    const P = Array.from({ length: COLS * ROWS }, (_, i) => ({ c: i % COLS, r: Math.floor(i / COLS), ox: (rnd(i) - 0.5) * 7, oy: (rnd(i + 90) - 0.5) * 7, el: $('#mmat-p' + i) }));
    const sm = k => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
    const fzAt = c => c < 2.5 ? 0 : c < 6 ? sm((c - 2.5) / 3.5) : c < 8.5 ? 1 : c < 10.5 ? 1 - sm((c - 8.5) / 2) : 0;
    const tempAt = c => c < 2.5 ? 5 - 2 * c : c < 6 ? 0 : c < 7 ? -5 * (c - 6) : c < 8.5 ? -5 + (5 / 1.5) * (c - 7) : c < 10.5 ? 0 : c < 12 ? 5 * (c - 10.5) / 1.5 : 5;
    let last = 0;
    api.loop((t, dt) => {
      const c = t % CYC;
      const fz = fzAt(c), cracked = c >= 5.8, tc = tempAt(c);
      const b = 8 * fz + (cracked ? 2.5 * (1 - fz) : 0);
      const yt = CY - 38, yb = CY + 38;
      $('#mmat-wt').setAttribute('d', `M${X0 - 4},${yt} Q200,${yt - 2 * b} ${X1 + 4},${yt}`);
      $('#mmat-wb').setAttribute('d', `M${X0 - 4},${yb} Q200,${yb + 2 * b} ${X1 + 4},${yb}`);
      $('#mmat-fill').setAttribute('d', `M${X0 - 4},${yt} Q200,${yt - 2 * b} ${X1 + 4},${yt} L${X1 + 4},${yb} Q200,${yb + 2 * b} ${X0 - 4},${yb} Z`);
      $('#mmat-fill').setAttribute('fill', fz > 0.5 ? TEAL : BLUE);
      const dx = lerp(16.2, 16.9, fz), dy = lerp(15, 17.6, fz), leak = c >= 10.5 ? Math.min(1, (c - 10.5) / 1.5) : 0;
      P.forEach((p, i) => {
        const jig = (1 - fz) * 3 + 0.5;
        const x = X0 + 6 + p.c * dx + (p.r % 2) * fz * dx / 2 + p.ox * (1 - fz) + Math.sin(t * 9 + i * 2.3) * jig;
        const y = CY + (p.r - 1.5) * dy + p.oy * (1 - fz) + Math.cos(t * 8 + i * 1.7) * jig;
        p.el.setAttribute('cx', x.toFixed(1)); p.el.setAttribute('cy', y.toFixed(1));
        p.el.setAttribute('fill', fz > 0.5 ? TEAL : BLUE);
      });
      $('#mmat-crack').setAttribute('opacity', cracked ? 1 : 0);
      $('#mmat-cr').setAttribute('opacity', c >= 5.8 && c < 8.5 ? 1 : 0);
      for (let k = 0; k < 3; k++) {
        const w = $('#mmat-w' + k);
        if (leak > 0.05) { const ph = ((c * 1.1 + k / 3) % 1); w.setAttribute('cy', (168 + ph * 56).toFixed(1)); w.setAttribute('r', (3.5 * leak).toFixed(1)); }
        else w.setAttribute('r', 0);
      }
      $('#mmat-pud').setAttribute('rx', (c >= 10.5 ? Math.min(28, (c - 10.5) * 9) : 0).toFixed(1));
      $('#mmat-ph').textContent = c < 2.5 ? 'The water cools down' : c < 5.8 ? 'Freezing: water turns to ice and swells' :
        c < 8.5 ? 'The ice pushes hard: the pipe cracks!' : c < 10.5 ? 'A warm day: the ice melts' : 'Liquid again: water leaks out!';
      $('#mmat-tp').textContent = `Temperature: ${Math.round(tc)} °C`;
      $('#mmat-vol').textContent = `Same water, 100 g: ${Math.round(100 * (1 + 0.0905 * fz))} mL, density ${(1 / (1 + 0.0905 * fz)).toFixed(2)} g/mL`;
    });
    return () => {};
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Frozen pipes burst',
    text: '<p>Most liquids shrink when they freeze, but <b>water expands</b>: ice takes up about 9% more space than the same water. In a closed pipe the growing ice pushes on the walls until they crack. Ice is also less dense than water, so it floats.</p>',
    explain: '<p>A metal <b>water pipe</b> is full of <b>dots</b> for water particles. The temperature falls to 0 °C. The dots settle into an <b>open, orderly pattern</b> of ice, the pipe walls bulge outward, and the volume reading grows from 100 to 109 mL. Then a <b>red crack</b> appears, and after the thaw, drops leak out.</p>',
    say: 'This is a water pipe full of water particles. First the water cools down to zero degrees Celsius. Then it starts to freeze. Look at the dots. In liquid water they jiggle about and touch closely. In ice they lock into an open, orderly pattern with more gaps between them. So the same hundred grams of water now takes up about one hundred and nine milliliters, and the density drops from one point zero zero to about zero point nine two grams per milliliter. The ice pushes on the pipe walls, they bulge, and a crack appears. On a warm day the ice melts, and water leaks out. That is why people drain outdoor pipes before winter.',
    mount: mmatPipeMount
  });

  // --- 4. A scuba diver: water pressure grows with depth, pushes from every side (slider: depth) ---
  function mmatDiverMount(el, api) {
    const SURF = 34, DX = 108, P0 = 101.3, KPA_M = 10.06, YD = d => 42 + d * 1.9;      // seawater: about 10 kPa more per metre
    const NB = 7, bubbles = Array.from({ length: NB }, (_, i) => `<circle id="mmat-b${i}" r="0" fill="none" stroke="${INK}" stroke-width="1.6"/>`).join('');
    const ticks = [10, 20, 30, 40].map(d => `<line x1="216" y1="${YD(d)}" x2="226" y2="${YD(d)}" stroke="${MUTED}" stroke-width="1.5"/>${T(213, YD(d) + 4, d + ' m', { size: 12, anchor: 'end', weight: 600, fill: MUTED })}`).join('');
    const svg = scene(el, '0 0 400 190', `
      <defs><linearGradient id="mmat-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BLUE}" stop-opacity="0.12"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0.6"/></linearGradient>
        <clipPath id="mmat-sc"><rect x="0" y="${SURF}" width="230" height="152"/></clipPath></defs>
      <rect x="0" y="${SURF}" width="230" height="152" fill="url(#mmat-sea)"/>
      <path d="M0,${SURF} q10,-5 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0" fill="none" stroke="${BLUE}" stroke-width="3">
        <animateTransform attributeName="transform" type="translate" values="0,0;-40,0" dur="3s" repeatCount="indefinite"/></path>
      ${T(8, 24, 'Air above', { size: 12, weight: 600, fill: MUTED, anchor: 'start' })}${ticks}
      ${bubbles}
      <g clip-path="url(#mmat-sc)" id="mmat-arrows"></g>
      <g id="mmat-dv">
        <rect x="-19" y="0" width="9" height="24" rx="4" fill="${MUTED}" stroke="${INK}" stroke-width="1.5"/>
        <ellipse cx="0" cy="18" rx="10" ry="14" fill="${PRIM}" stroke="${INK}" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="8" fill="${ORANGE}" stroke="${INK}" stroke-width="1.5"/>
        <rect x="1" y="-4" width="8" height="5" rx="2" fill="${BLUE}" stroke="${INK}" stroke-width="1"/>
        <g id="mmat-fin" stroke="${INK}" stroke-width="1.5"><path d="M-3,30 l-10,18 l7,0 z" fill="${PRIM}"/><path d="M3,30 l10,18 l-7,0 z" fill="${PRIM}"/></g>
      </g>
      ${T(316, 26, '', { id: 'mmat-d', size: 15, fill: PRIM })}
      ${T(316, 50, '', { id: 'mmat-pr', size: 16 })}
      ${T(316, 68, '', { id: 'mmat-atm', size: 13, weight: 600, fill: MUTED })}
      <rect x="240" y="80" width="150" height="14" rx="3" fill="${MUTED}" opacity="0.2"/>
      <rect id="mmat-bair" x="240" y="80" width="30" height="14" fill="${TEAL}"/>
      <rect id="mmat-bwat" x="270" y="80" width="0" height="14" fill="${BLUE}"/>
      ${T(240, 112, '', { id: 'mmat-mix', size: 13, anchor: 'start', weight: 600 })}
      ${T(240, 134, 'Pressure pushes from', { size: 12, anchor: 'start', weight: 600, fill: MUTED })}
      ${T(240, 149, 'every side, equally.', { size: 12, anchor: 'start', weight: 600, fill: MUTED })}
      ${T(240, 170, 'Bubbles swell as', { size: 12, anchor: 'start', weight: 600, fill: MUTED })}
      ${T(240, 185, 'they rise.', { size: 12, anchor: 'start', weight: 600, fill: MUTED })}`,
      sliderRow('Depth', 'mmat-dep', 1, 40, 1, 12, '12 m'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mmat-dep'), out = el.querySelector('#mmat-dep-v');
    const arG = $('#mmat-arrows');
    arG.innerHTML = ['l', 'r', 't', 'b'].map(k => `<g id="mmat-a${k}"><line stroke="${ORANGE}" stroke-width="4"/><polygon fill="${ORANGE}"/></g>`).join('');
    const setA = (k, x1, y1, x2, y2) => {                    // arrow from (x1,y1) with the tip at (x2,y2)
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, hl = 8, hw = 5.5;
      const bx = x2 - ux * hl, by = y2 - uy * hl, g = $('#mmat-a' + k);
      const ln = g.firstChild, pg = g.lastChild;
      ln.setAttribute('x1', x1); ln.setAttribute('y1', y1); ln.setAttribute('x2', bx); ln.setAttribute('y2', by);
      pg.setAttribute('points', `${x2},${y2} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`);
    };
    const B = Array.from({ length: NB }, (_, i) => ({ el: $('#mmat-b' + i), s: i / NB, wob: rnd(i + 3) * 6.28 }));
    let dep = 12;
    const onInput = () => { out.textContent = slider.value + ' m'; };
    slider.addEventListener('input', onInput);
    api.loop((t, dt) => {
      dep += (+slider.value - dep) * Math.min(1, dt * 5);
      const yh = YD(dep), cy = 18, P = P0 + KPA_M * dep;
      $('#mmat-dv').setAttribute('transform', `translate(${DX} ${yh})`);
      $('#mmat-fin').setAttribute('transform', `rotate(${Math.sin(t * 5) * 7} 0 30)`);
      const L = 6 + (P - P0) / 400 * 18;               // arrow length grows with pressure
      const Rx = 24, Ry = 30, c = yh + cy;
      setA('l', DX - Rx - L, c, DX - Rx, c); setA('r', DX + Rx + L, c, DX + Rx, c);
      setA('t', DX, c - Ry - L, DX, c - Ry); setA('b', DX, c + Ry + L, DX, c + Ry);
      // rising bubbles: same amount of air, so volume ~ 1 / pressure (constant temperature)
      B.forEach(b => {
        b.s = (b.s + dt * 0.28) % 1;
        const y = (yh - 2) - b.s * Math.max(0, yh - 2 - SURF), depthB = Math.max(0, (y - 42) / 1.9), Pb = P0 + KPA_M * depthB;
        const r = 9 * Math.cbrt(P0 / Pb), x = DX + 10 + Math.sin(t * 2.5 + b.wob) * 4 + b.s * 8;
        b.el.setAttribute('cx', x.toFixed(1)); b.el.setAttribute('cy', y.toFixed(1)); b.el.setAttribute('r', (b.s < 0.03 ? 0 : r).toFixed(2));
      });
      const d = Math.round(+slider.value), Pt = P0 + KPA_M * d, atm = Pt / P0, wat = atm - 1;
      $('#mmat-d').textContent = `Depth: ${d} m`;
      $('#mmat-pr').textContent = `Pressure: ${Math.round(Pt)} kPa`;
      $('#mmat-atm').textContent = `about ${atm.toFixed(1)} atmospheres`;
      $('#mmat-bwat').setAttribute('width', (wat * 30).toFixed(1));
      $('#mmat-mix').textContent = `Air ${1.0.toFixed(1)} + water ${wat.toFixed(1)} atm`;
    });
    return () => { slider.removeEventListener('input', onInput); };
  }
  steps.push({
    kind: 'example',
    title: 'Real life: A diver and water pressure',
    text: '<p>Water has weight, so the deeper you go the more water is stacked above you. <b>Pressure</b> rises by about 1 atmosphere every 10 meters in the sea, and it pushes on you from all directions. Drag the diver down!</p>',
    explain: '<p>A <b>diver</b> with an orange head hangs in the sea at the left. Four <b>orange arrows</b> push in from every side, all the same length, and they grow as the <b>Depth</b> slider goes deeper. A <b>teal and blue bar</b> splits the pressure into air plus water. The diver’s <b>bubbles</b> get bigger as they rise.</p>',
    say: 'A scuba diver floats in the sea. The orange arrows show water pressure. Notice they all have the same length, because pressure pushes on you equally from every side. Now use the depth slider to send the diver deeper. The arrows grow. The bar on the right shows that the pressure is one atmosphere from the air above the sea, plus more from the weight of the water. In seawater, every ten meters adds about one more atmosphere. So at thirty meters the diver feels about four atmospheres. Watch the bubbles too. Deep down the pressure squeezes them small, and as they rise the pressure drops, so they expand. Divers must never hold their breath while rising.',
    mount: mmatDiverMount
  });

  // --- 5. Dry ice: sublimation, and where the fog really comes from (looping scene) ---
  function mmatDryIceMount(el, api) {
    const CX = 100, NG = 10, NF = 14, CYC = 20;
    const gas = Array.from({ length: NG }, (_, i) => `<circle id="mmat-g${i}" r="3.6" fill="${MUTED}" stroke="${INK}" stroke-width="0.8"/>`).join('');
    const fog = Array.from({ length: NF }, (_, i) => `<circle id="mmat-f${i}" r="0" fill="${SOFT}" stroke="${MUTED}" stroke-width="1"/>`).join('');
    const svg = scene(el, '0 0 400 240', `
      <rect x="0" y="202" width="400" height="38" fill="${MUTED}" opacity="0.25"/><line x1="0" y1="202" x2="400" y2="202" stroke="${INK}" stroke-width="3"/>
      <path d="M52,150 L148,150 L136,200 L64,200 Z" fill="${SOFT}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <g id="mmat-blk"><rect x="72" y="126" width="56" height="26" rx="3" fill="${BLUE}" fill-opacity="0.3" stroke="${BLUE}" stroke-width="3"/>
        <line x1="80" y1="134" x2="96" y2="134" stroke="${BLUE}" stroke-width="2"/><line x1="106" y1="143" x2="120" y2="143" stroke="${BLUE}" stroke-width="2"/></g>
      ${gas}${fog}
      ${T(100, 222, 'Bowl of dry ice', { size: 13, weight: 600, fill: MUTED })}
      ${T(230, 28, 'Dry ice: solid CO₂', { size: 14, fill: PRIM, anchor: 'start' })}
      ${T(230, 46, 'at −78 °C. It turns', { size: 13, anchor: 'start' })}
      ${T(230, 62, 'straight into gas:', { size: 13, anchor: 'start' })}
      ${T(230, 80, 'sublimation!', { size: 15, fill: ORANGE, anchor: 'start' })}
      <circle cx="238" cy="114" r="3.6" fill="${MUTED}" stroke="${INK}" stroke-width="0.8"/>${T(250, 118, 'CO₂ gas: invisible', { size: 13, anchor: 'start' })}
      <circle cx="238" cy="140" r="6" fill="${SOFT}" stroke="${MUTED}" stroke-width="1"/>${T(250, 144, 'Fog: water droplets', { size: 13, anchor: 'start' })}
      ${T(230, 166, 'Cold gas chills the moist', { size: 12, weight: 600, anchor: 'start', fill: MUTED })}
      ${T(230, 182, 'air, so its vapor condenses', { size: 12, weight: 600, anchor: 'start', fill: MUTED })}
      ${T(230, 222, 'Never touch: it burns skin', { size: 12, weight: 600, anchor: 'start', fill: RED })}`);
    const $ = s => svg.querySelector(s);
    const G = Array.from({ length: NG }, (_, i) => ({ el: $('#mmat-g' + i), ph: i / NG, x0: CX - 22 + rnd(i) * 44, w: rnd(i + 30) * 6.28 }));
    const F = Array.from({ length: NF }, (_, i) => ({ el: $('#mmat-f' + i), ph: i / NF, side: i % 2 ? 1 : -1, j: rnd(i + 60) }));
    api.loop((t, dt) => {
      const shrink = 1 - 0.3 * ((t % CYC) / CYC);
      $('#mmat-blk').setAttribute('transform', `translate(100 152) scale(${shrink.toFixed(3)}) translate(-100 -152)`);
      G.forEach(g => {
        const s = (t * 0.22 + g.ph) % 1;
        const x = g.x0 + Math.sin(t * 1.6 + g.w) * 6, y = 128 - s * 82;
        g.el.setAttribute('cx', x.toFixed(1)); g.el.setAttribute('cy', y.toFixed(1)); g.el.setAttribute('opacity', (1 - s * s).toFixed(2));
      });
      F.forEach(f => {
        const s = (t * 0.2 + f.ph) % 1, e = 1 - (1 - s) * (1 - s);
        const x = CX + f.side * (14 + 84 * s), y = 128 + 60 * Math.min(1, s * 1.6) + Math.sin(t * 2 + f.j * 6) * 2;
        f.el.setAttribute('cx', x.toFixed(1)); f.el.setAttribute('cy', y.toFixed(1));
        f.el.setAttribute('r', (7 + 10 * e).toFixed(1));
        f.el.setAttribute('opacity', Math.min(1, s * 6, (1 - s) * 1.6).toFixed(2) * 0.75);
      });
    });
    return () => {};
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Dry ice smoke',
    text: '<p><b>Dry ice</b> is solid carbon dioxide. At normal pressure it never becomes a liquid: it goes straight from solid to gas, called <b>sublimation</b>. The spooky fog you see is not the gas itself.</p>',
    explain: '<p>A <b>block of dry ice</b> in a bowl slowly shrinks. <b>Grey dots</b> rise from it: carbon dioxide gas, which is invisible in real life. Pale <b>fog puffs</b> spill over the bowl and roll along the table. That fog is tiny water droplets, made when the very cold gas chills the moist air around it.</p>',
    say: 'This bowl holds dry ice, which is frozen carbon dioxide, at about minus seventy eight degrees Celsius. Watch the block slowly shrink. It does not melt into a puddle. It turns straight into gas. That change from solid to gas is called sublimation. The grey dots are the carbon dioxide gas. In real life you cannot see it at all. So what is the fog rolling over the table? It is made of tiny drops of water. The very cold gas cools the moist air around it, and the water vapor in that air condenses into a cloud of droplets. Cold carbon dioxide is heavier than air, so the fog sinks and spreads.',
    mount: mmatDryIceMount
  });

  // STEPS-GO-HERE

  addTutorialSteps('physics', 'matter', steps, [
    { term: 'Dew point', definition: 'The temperature to which air must cool before its water vapor starts to condense into liquid droplets.' },
    { term: 'Pressure', definition: 'How hard a fluid pushes on each square meter of a surface. It grows with depth in water, about 1 atmosphere per 10 meters.' }
  ]);
})();
