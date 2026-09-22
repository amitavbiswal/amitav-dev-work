(function () {
  'use strict';
  // more-physics-forces: five extra real-life examples for Forces & Motion (namespace mfrc-).

  const PRIM = 'var(--primary)', ORANGE = 'var(--t-orange)', BLUE = 'var(--t-blue)', TEAL = 'var(--t-teal)';
  const YELLOW = 'var(--t-yellow)', RED = 'var(--t-red)', GREEN = 'var(--t-green)';
  const SOFT = 'var(--t-soft)', INK = 'var(--t-ink)', MUTED = 'var(--t-muted)';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const r1 = v => (Math.round(v * 10) / 10).toString();
  const f1 = v => (Math.round(v * 10) / 10).toFixed(1);

  function T(x, y, s, o) {
    o = o || {};
    return `<text${o.id ? ` id="${o.id}"` : ''} x="${x}" y="${y}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" fill="${o.fill || INK}" text-anchor="${o.anchor || 'middle'}"${o.extra ? ' ' + o.extra : ''}>${s}</text>`;
  }
  function arrowGeom(x1, y1, x2, y2, w, head) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 0.001;
    const ux = dx / len, uy = dy / len;
    const hl = Math.min(head || 12, len), hw = hl * 0.55 + w * 0.3;
    const bx = x2 - ux * hl, by = y2 - uy * hl;
    return { lx1: x1, ly1: y1, lx2: bx, ly2: by,
      pts: `${x2},${y2} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}` };
  }
  function arrowHTML(id, color, w) {
    return `<g id="${id}"><line id="${id}-l" stroke="${color}" stroke-width="${w || 4}" stroke-linecap="butt"/><polygon id="${id}-h" fill="${color}"/></g>`;
  }
  function setArrow(root, id, x1, y1, x2, y2, w, head) {
    const g = arrowGeom(x1, y1, x2, y2, w || 4, head);
    const l = root.querySelector('#' + id + '-l'), h = root.querySelector('#' + id + '-h');
    l.setAttribute('x1', g.lx1); l.setAttribute('y1', g.ly1); l.setAttribute('x2', g.lx2); l.setAttribute('y2', g.ly2);
    h.setAttribute('points', g.pts);
  }
  function sliderRow(label, id, min, max, step, val, out) {
    return `<div class="scene-slider-row"><span style="min-width:70px;flex-shrink:0">${label}</span>` +
      `<input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}" style="min-width:0">` +
      `<span id="${id}-v" style="min-width:62px;text-align:right;flex-shrink:0">${out}</span></div>`;
  }
  // One compact row: small buttons, then an optional slider with a value readout.
  function comboRow(buttons, slider) {
    return `<div class="scene-slider-row" style="gap:4px;padding:4px 6px">${buttons.map(b =>
      `<button type="button" class="scene-btn" id="${b.id}" style="padding:3px 6px;font-size:0.78rem;flex-shrink:0">${b.label}</button>`).join('')}` +
      (slider ? `<input type="range" id="${slider.id}" min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${slider.val}" aria-label="${slider.label}" style="min-width:30px">` +
        `<span id="${slider.id}-v" style="text-align:right;flex-shrink:0;font-size:0.8rem">${slider.out}</span>` : '') + `</div>`;
  }
  function scene(el, vb, inner, rows) {
    el.innerHTML = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet" style="flex:1 1 0;min-height:0;width:100%;height:auto">${inner}</svg>${rows || ''}`;
    return el.querySelector('svg');
  }
  const mark = b => b.style.borderColor = 'var(--primary)';

  const steps = [];

  // ---------------------------------------------------------------------
  // 1. Mass and weight: Earth, Moon, Mars (buttons + mass slider)
  // ---------------------------------------------------------------------
  function mfrcMoonMount(el, api) {
    const GY = 150, PXM = 26, U = 3, BX = 280;      // ground y, units per metre, jump speed (m/s), balance x
    const PL = {
      earth: { name: 'Earth', g: 9.8, sky: BLUE, ground: GREEN, so: 0.15 },
      moon: { name: 'Moon', g: 1.6, sky: MUTED, ground: MUTED, so: 0.2 },
      mars: { name: 'Mars', g: 3.7, sky: ORANGE, ground: ORANGE, so: 0.14 }
    };
    const stars = [[20, 20], [60, 60], [120, 24], [150, 90], [30, 110], [210, 46], [240, 100], [100, 120]]
      .map(s => `<circle cx="${s[0]}" cy="${s[1]}" r="1.6" fill="${INK}"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <rect id="mfrc-sky" x="0" y="0" width="400" height="${GY}" fill="${BLUE}" opacity="0.15"/>
      <g id="mfrc-stars" opacity="0">${stars}</g>
      <rect id="mfrc-gr" x="0" y="${GY}" width="400" height="40" fill="${GREEN}" opacity="0.45"/>
      <line x1="0" y1="${GY}" x2="400" y2="${GY}" stroke="${INK}" stroke-width="3"/>
      ${T(8, 18, '', { id: 'mfrc-l1', size: 13, anchor: 'start' })}
      ${T(8, 36, 'Same jump speed: 3 m/s', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(8, 54, '', { id: 'mfrc-l3', size: 14, fill: PRIM, anchor: 'start' })}
      ${T(8, 176, '', { id: 'mfrc-nm', size: 15, anchor: 'start' })}
      <ellipse id="mfrc-sh" cx="190" cy="${GY + 5}" rx="16" ry="3.5" fill="${INK}" opacity="0.3"/>
      <g id="mfrc-astro">
        <g stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"><line x1="-5" y1="-18" x2="-7" y2="0"/><line x1="5" y1="-18" x2="7" y2="0"/>
          <line x1="-10" y1="-34" x2="-19" y2="-24"/><line x1="10" y1="-34" x2="19" y2="-24"/></g>
        <rect x="-13" y="-44" width="26" height="28" rx="8" fill="${SOFT}" stroke="${INK}" stroke-width="2.5"/>
        <rect x="-19" y="-40" width="8" height="18" rx="3" fill="${MUTED}" stroke="${INK}" stroke-width="2"/>
        <circle cx="0" cy="-54" r="11" fill="${SOFT}" stroke="${INK}" stroke-width="2.5"/>
        <path d="M-1,-60 h10 a2,2 0 0 1 2,2 v5 a2,2 0 0 1 -2,2 h-10 z" fill="${BLUE}"/>
      </g>
      <line x1="${BX}" y1="0" x2="${BX}" y2="16" stroke="${INK}" stroke-width="3"/>
      <rect x="${BX - 13}" y="14" width="26" height="82" rx="5" fill="${SOFT}" stroke="${INK}" stroke-width="2.5"/>
      ${[0, 1, 2, 3, 4].map(i => `<line x1="${BX + 3}" y1="${22 + i * 16}" x2="${BX + 11}" y2="${22 + i * 16}" stroke="${MUTED}" stroke-width="2"/>`).join('')}
      <line id="mfrc-ptr" x1="${BX - 13}" x2="${BX + 3}" y1="0" y2="0" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
      <line x1="${BX}" y1="96" x2="${BX}" y2="108" stroke="${INK}" stroke-width="3"/>
      <g id="mfrc-rock">
        <polygon id="mfrc-rp" fill="${MUTED}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        ${T(BX, 0, '', { id: 'mfrc-rl', size: 13 })}
      </g>
      ${T(BX + 24, 38, 'Weight', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(BX + 24, 62, '', { id: 'mfrc-w', size: 20, fill: RED, anchor: 'start' })}
      ${T(BX + 24, 84, '', { id: 'mfrc-m', size: 13, anchor: 'start' })}
      ${T(BX + 24, 100, 'same anywhere', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}`,
      comboRow([{ id: 'mfrc-b-earth', label: 'Earth' }, { id: 'mfrc-b-moon', label: 'Moon' }, { id: 'mfrc-b-mars', label: 'Mars' }],
        { id: 'mfrc-mass', label: 'Mass', min: 10, max: 100, step: 5, val: 60, out: '60 kg' }));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mfrc-mass'), out = el.querySelector('#mfrc-mass-v');
    const btn = { earth: el.querySelector('#mfrc-b-earth'), moon: el.querySelector('#mfrc-b-moon'), mars: el.querySelector('#mfrc-b-mars') };
    let key = 'moon', cl = 0;
    function apply() {
      const p = PL[key], m = +slider.value, W = Math.round(m * p.g);
      Object.keys(btn).forEach(k => { btn[k].style.borderColor = k === key ? 'var(--primary)' : ''; });
      $('#mfrc-sky').setAttribute('fill', p.sky); $('#mfrc-sky').setAttribute('opacity', p.so);
      $('#mfrc-gr').setAttribute('fill', p.ground);
      $('#mfrc-stars').setAttribute('opacity', key === 'moon' ? 0.9 : 0);
      $('#mfrc-nm').textContent = p.name;
      $('#mfrc-l1').textContent = `Gravity: ${p.g} N per kg`;
      $('#mfrc-l3').textContent = `Jump height: ${r1(U * U / (2 * p.g))} m`;
      const y = 24 + clamp(W / 1000, 0, 1) * 64;
      $('#mfrc-ptr').setAttribute('y1', y); $('#mfrc-ptr').setAttribute('y2', y);
      const r = 10 + m * 0.16, cy = 112 + r;
      $('#mfrc-rp').setAttribute('points', [[-1, -0.9], [0.8, -1], [1.05, 0.1], [0.7, 0.95], [-0.6, 1], [-1.1, 0.2]]
        .map(q => `${BX + q[0] * r},${cy + q[1] * r}`).join(' '));
      $('#mfrc-rl').setAttribute('y', cy + r + 16); $('#mfrc-rl').textContent = m + ' kg';
      $('#mfrc-w').textContent = W + ' N';
      $('#mfrc-m').textContent = `Mass: ${m} kg`;
      out.textContent = m + ' kg';
      cl = 0;
    }
    const handlers = Object.keys(btn).map(k => { const f = () => { key = k; apply(); }; btn[k].addEventListener('click', f); return [btn[k], f]; });
    slider.addEventListener('input', apply);
    apply();
    function frame(dt) {
      const g = PL[key].g, flight = 2 * U / g, cyc = flight + 0.35;
      cl = (cl + dt) % cyc;
      const h = cl < flight ? (U * cl - 0.5 * g * cl * cl) : 0;      // metres
      const up = h * PXM;
      $('#mfrc-astro').setAttribute('transform', `translate(190 ${GY - up})`);
      $('#mfrc-sh').setAttribute('rx', 16 * (1 - Math.min(0.5, up / 90)));
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => { slider.removeEventListener('input', apply); handlers.forEach(([b, f]) => b.removeEventListener('click', f)); };
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Weight on the Moon',
    text: '<p>Your <b>mass</b> is how much matter you are made of, so it never changes. Your <b>weight</b> is the pull of gravity on that mass: weight = mass × g. The Moon pulls about 6 times less than Earth, so a 60 kg rock weighs 588 N here but only 96 N there.</p>',
    explain: '<p>A <b>spring balance</b> on the right holds a grey <b>rock</b>, and its red pointer shows the weight in newtons. On the left an <b>astronaut</b> keeps jumping with the same speed. Press <b>Earth</b>, <b>Moon</b> or <b>Mars</b>: the jump height and the pointer change, but the mass stays put. The <b>slider</b> changes the rock’s mass.</p><p>Notice that only the weight changes, never the mass.</p>',
    say: 'Look at the spring balance on the right. It is holding a grey rock, and the red pointer shows how many newtons the rock weighs. On the left, an astronaut keeps jumping with the same speed each time. The buttons let you choose Earth, the Moon or Mars. On the Moon, gravity is about six times weaker, so the rock weighs much less, and the astronaut floats far higher. But look at the mass. It stays the same, sixty kilograms, on every world. Mass is how much stuff is in the rock. Weight is the pull of gravity on it. Now try the slider to change the rock, and watch the weight change.',
    mount: mfrcMoonMount
  });

  // ---------------------------------------------------------------------
  // 2. Seesaw: moments (slider moves the child; auto-sweeps until you touch it)
  // ---------------------------------------------------------------------
  function mfrcSeesawMount(el, api) {
    const PX = 68, PVX = 200, PVY = 128, HALF = 2.5, WA = 400, DA = 1.0, WC = 200;
    const kid = (id, col, sc, label) => `<g id="${id}"><g transform="scale(${sc})">
        <g stroke="${col}" stroke-width="7" stroke-linecap="round" fill="none"><line x1="0" y1="-8" x2="0" y2="-30"/></g>
        <circle cx="0" cy="-38" r="8" fill="${col}" stroke="${INK}" stroke-width="2"/>
        <g stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"><line x1="0" y1="-12" x2="${id === 'mfrc-ka' ? 14 : -14}" y2="-12"/><line x1="${id === 'mfrc-ka' ? 14 : -14}" y2="0" x2="${id === 'mfrc-ka' ? 14 : -14}" y1="-12"/></g>
      </g>${T(0, -sc * 46 - 6, label, { size: 13 })}</g>`;
    const ticks = [-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5].map(k =>
      `<line x1="${k * PX / 1}" y1="4" x2="${k * PX}" y2="${Math.abs(k) % 1 === 0 ? 11 : 8}" stroke="${INK}" stroke-width="2"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <line x1="0" y1="172" x2="400" y2="172" stroke="${INK}" stroke-width="3"/>
      <polygon points="${PVX},${PVY + 4} ${PVX - 20},172 ${PVX + 20},172" fill="${MUTED}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <g id="mfrc-plank"><rect x="${-HALF * PX}" y="-4" width="${2 * HALF * PX}" height="8" rx="3" fill="${SOFT}" stroke="${INK}" stroke-width="2.5"/>
        ${ticks}
        <g id="mfrc-kidA">${kid('mfrc-ka', ORANGE, 1.25, '400 N')}</g><g id="mfrc-kidC">${kid('mfrc-kc', TEAL, 0.85, '200 N')}</g></g>
      <circle cx="${PVX}" cy="${PVY}" r="4.5" fill="${INK}"/>
      ${T(8, 18, 'Adult: 400 N × 1.0 m', { size: 13, anchor: 'start' })}
      ${T(8, 36, '= 400 N·m', { size: 14, fill: ORANGE, anchor: 'start' })}
      ${T(392, 18, '', { id: 'mfrc-c1', size: 13, anchor: 'end' })}
      ${T(392, 36, '', { id: 'mfrc-c2', size: 14, fill: TEAL, anchor: 'end' })}
      ${T(200, 187, '', { id: 'mfrc-st', size: 14 })}`,
      sliderRow('Child', 'mfrc-d', 0.5, 2.5, 0.1, 1.5, '1.5 m'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mfrc-d'), out = el.querySelector('#mfrc-d-v');
    let auto = true, at = 0, ang = 0, av = 0;
    const onInput = () => { auto = false; };
    slider.addEventListener('input', onInput);
    function frame(dt) {
      at += dt;
      let d = +slider.value;
      if (auto) { d = Math.round((1.5 - Math.cos(at * 2 * Math.PI / 16)) * 10) / 10; slider.value = d; }
      out.textContent = f1(d) + ' m';
      const Ml = WA * DA, Mr = WC * d, target = 12 * Math.tanh((Mr - Ml) / 150);
      const h = Math.min(dt, 0.05);
      av += (70 * (target - ang) - 9 * av) * h; ang += av * h;
      $('#mfrc-plank').setAttribute('transform', `translate(${PVX} ${PVY}) rotate(${ang})`);
      $('#mfrc-kidA').setAttribute('transform', `translate(${-DA * PX} -4) rotate(${-ang})`);
      $('#mfrc-kidC').setAttribute('transform', `translate(${d * PX} -4) rotate(${-ang})`);
      $('#mfrc-c1').textContent = `Child: 200 N × ${f1(d)} m`;
      $('#mfrc-c2').textContent = `= ${Math.round(Mr)} N·m`;
      const bal = Math.abs(Mr - Ml) < 6, st = $('#mfrc-st');
      st.textContent = bal ? 'Balanced!' : Mr > Ml ? 'Child side goes down' : 'Adult side goes down';
      st.setAttribute('fill', bal ? GREEN : INK);
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => slider.removeEventListener('input', onInput);
  }
  steps.push({
    kind: 'example',
    title: 'Real life: A seesaw',
    text: '<p>A force can turn things too. The turning effect, or <b>moment</b>, is force × distance from the pivot. A 400 N adult sitting 1.0 m out gives 400 N·m, so a 200 N child must sit 2.0 m out to balance it.</p>',
    explain: '<p>A <b>seesaw</b> with an orange <b>adult</b> (400 N) on the left, close to the pivot, and a teal <b>child</b> (200 N) on the right. The numbers at the top work out each moment. The child slides in and out on their own; drag the <b>Child</b> slider to take over. The plank turns toward the bigger moment and levels when both are 400 N·m.</p><p>Notice that distance matters as much as weight.</p>',
    say: 'This is a seesaw. On the left, an adult who weighs four hundred newtons sits one meter from the pivot. On the right, a child who weighs two hundred newtons can slide along the plank. The numbers at the top show each turning effect, called a moment. A moment is the force multiplied by the distance from the pivot. The adult makes four hundred newton meters. Watch the child move. When the child sits two meters out, the moments match, and the seesaw balances. Now drag the child slider yourself. Closer in, the adult side goes down. Farther out, the child side goes down. A light child can balance a heavy adult by sitting farther away.',
    mount: mfrcSeesawMount
  });

  // ---------------------------------------------------------------------
  // 3. Elevator: the scale reading changes when the lift speeds up or slows down
  // ---------------------------------------------------------------------
  function mfrcLiftMount(el, api) {
    const M = 60, G = 9.8, W = M * G, A = 1.5, PXM = 13, BOT = 230, CH = 50, CYC = 14.5, K = 0.12, OY = 140;
    const prof = u => u < 2 ? { h: 0.75 * u * u, a: A } : u < 4 ? { h: 3 + 3 * (u - 2), a: 0 }
      : { h: 9 + 3 * (u - 4) - 0.75 * (u - 4) * (u - 4), a: -A };
    function state(tc) {
      if (tc < 1) return { h: 0, a: 0, dir: 0 };
      if (tc < 7) { const p = prof(tc - 1); return { h: p.h, a: p.a, dir: 1 }; }
      if (tc < 8.5) return { h: 12, a: 0, dir: 0 };
      const p = prof(tc - 8.5); return { h: 12 - p.h, a: -p.a, dir: -1 };
    }
    const floors = [0, 1, 2, 3, 4].map(k => `<line x1="46" y1="${BOT - k * 3 * PXM}" x2="136" y2="${BOT - k * 3 * PXM}" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="4 4"/>` +
      T(40, BOT - k * 3 * PXM + 4, k === 0 ? 'G' : String(k), { size: 12, fill: MUTED, anchor: 'end' })).join('');
    const svg = scene(el, '0 0 400 240', `
      <rect x="46" y="10" width="90" height="222" fill="none" stroke="${INK}" stroke-width="3"/>
      ${floors}
      <line id="mfrc-cab" x1="91" y1="10" x2="91" y2="0" stroke="${INK}" stroke-width="3"/>
      <g id="mfrc-car">
        <rect x="-35" y="-${CH}" width="70" height="${CH}" rx="3" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
        <rect x="-15" y="-6" width="30" height="6" rx="2" fill="${MUTED}" stroke="${INK}" stroke-width="1.5"/>
        <g stroke="${ORANGE}" stroke-width="5" stroke-linecap="round" fill="none"><line x1="0" y1="-6" x2="0" y2="-22"/><line x1="0" y1="-22" x2="0" y2="-36"/>
          <line x1="0" y1="-32" x2="-10" y2="-22"/><line x1="0" y1="-32" x2="10" y2="-22"/></g>
        <circle cx="0" cy="-42" r="7" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
      </g>
      ${T(152, 18, '', { id: 'mfrc-lst', size: 14, anchor: 'start' })}
      ${T(152, 38, '', { id: 'mfrc-lnet', size: 13, weight: 600, anchor: 'start' })}
      <line x1="196" y1="${OY}" x2="286" y2="${OY}" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="4 4"/>
      <circle cx="196" cy="${OY}" r="4" fill="${INK}"/><circle cx="286" cy="${OY}" r="4" fill="${INK}"/>
      ${T(241, OY + 18, 'You', { size: 12, fill: MUTED })}
      ${arrowHTML('mfrc-aw', RED, 6)}${arrowHTML('mfrc-an', BLUE, 6)}
      ${T(208, 0, 'Weight', { id: 'mfrc-wl1', size: 13, fill: RED, anchor: 'start' })}${T(208, 0, W + ' N', { id: 'mfrc-wl2', size: 15, fill: RED, anchor: 'start' })}
      ${T(298, 0, 'Scale push', { id: 'mfrc-nl1', size: 13, fill: BLUE, anchor: 'start' })}${T(298, 0, '', { id: 'mfrc-nl2', size: 15, fill: BLUE, anchor: 'start' })}`);
    const $ = s => svg.querySelector(s);
    api.loop(t => draw(t % CYC));
    function draw(tc) {
      const s = state(tc), N = M * (G + s.a);
      const yb = BOT - s.h * PXM;
      $('#mfrc-car').setAttribute('transform', `translate(91 ${yb})`);
      $('#mfrc-cab').setAttribute('y2', yb - CH);
      setArrow(svg, 'mfrc-aw', 196, OY, 196, OY + W * K, 6, 12);
      setArrow(svg, 'mfrc-an', 286, OY, 286, OY - N * K, 6, 12);
      const wy = OY + W * K, ny = OY - N * K;
      $('#mfrc-wl1').setAttribute('y', wy - 16); $('#mfrc-wl2').setAttribute('y', wy + 2);
      $('#mfrc-nl1').setAttribute('y', ny + 4); $('#mfrc-nl2').setAttribute('y', ny + 22);
      $('#mfrc-nl2').textContent = Math.round(N) + ' N';
      const net = Math.round(M * s.a);
      let st;
      if (s.dir === 0) st = 'Stopped'; else if (s.a === 0) st = 'Steady speed'; else if (s.a * s.dir > 0) st = 'Speeding up, going ' + (s.dir > 0 ? 'up' : 'down');
      else st = 'Slowing down, going ' + (s.dir > 0 ? 'up' : 'down');
      $('#mfrc-lst').textContent = st;
      $('#mfrc-lnet').textContent = net === 0 ? 'Net force: 0 N (balanced)' : `Net force: ${Math.abs(net)} N ${net > 0 ? 'up' : 'down'}`;
    }
    draw(0);
  }
  steps.push({
    kind: 'example',
    title: 'Real life: An elevator ride',
    text: '<p>Stand on a scale in a lift. The scale measures the push it gives you, not gravity itself. When the lift speeds up upward, that push is bigger than your weight; when it speeds up downward, smaller. At steady speed it equals your weight.</p>',
    explain: '<p>A lift car with an orange <b>passenger</b> on a scale moves up and down a shaft marked G to 4. On the right, a <b>red arrow</b> is the weight, always 588 N, and a <b>blue arrow</b> is the scale’s push. The blue arrow grows when the lift speeds up going up and shrinks when it slows, with the net force written above.</p><p>Notice that the arrows match only at steady speed.</p>',
    say: 'Look at the lift going up and down its shaft. The passenger stands on a scale. On the right, the red arrow is the passenger’s weight, five hundred and eighty eight newtons. It never changes. The blue arrow is the push of the scale on the passenger, which is what the scale reads. When the lift starts moving up, the blue arrow gets longer, because the scale must push harder to speed you up. At steady speed, the two arrows match, so you feel normal. When the lift slows down near the top, the blue arrow gets shorter, and you feel lighter. Going down works the opposite way. Notice that the net force is only zero at steady speed.',
    mount: mfrcLiftMount
  });

  // ---------------------------------------------------------------------
  // 4. Rowing a boat: action and reaction (top view, auto)
  // ---------------------------------------------------------------------
  function mfrcRowMount(el, api) {
    const CYC = 3, DRV = 1.2, L = 52, LIN = 22, FP = 250, MASS = 100, DRAG = 0.35, PX = 30;
    const ripples = Array.from({ length: 9 }, (_, i) => ({ x: (i * 97) % 440, y: [24, 60, 172, 200, 78, 226, 150, 44, 188][i] }));
    const oar = (id, side) => `<g id="${id}"><line id="${id}-s" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
        <line id="${id}-b" stroke="${ORANGE}" stroke-width="9" stroke-linecap="butt"/></g>`;
    const svg = scene(el, '0 0 400 240', `
      <rect x="0" y="0" width="400" height="240" fill="${BLUE}" opacity="0.16"/>
      <g id="mfrc-rip" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round" opacity="0.7">${ripples.map((r, i) => `<path id="mfrc-rp${i}" d="M0,0 q7,-5 14,0 t14,0"/>`).join('')}</g>
      <path d="M98,120 Q128,96 220,96 Q288,98 310,120 Q288,142 220,144 Q128,144 98,120 Z" fill="${SOFT}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="110" y1="120" x2="290" y2="120" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="5 5"/>
      <ellipse id="mfrc-splash" rx="12" ry="6" fill="none" stroke="${BLUE}" stroke-width="3"/>
      ${oar('mfrc-o1')}${oar('mfrc-o2')}
      <line id="mfrc-sh" x1="0" y1="107" x2="0" y2="133" stroke="${ORANGE}" stroke-width="10" stroke-linecap="round"/>
      <circle id="mfrc-hd" r="9" cy="120" fill="${ORANGE}" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="200" cy="96" r="4" fill="${INK}"/><circle cx="200" cy="144" r="4" fill="${INK}"/>
      ${arrowHTML('mfrc-ar', RED, 5)}${arrowHTML('mfrc-ab', BLUE, 5)}
      ${T(8, 16, 'Oar pushes water', { size: 13, fill: RED, anchor: 'start' })}${T(8, 32, '', { id: 'mfrc-fr', size: 13, fill: RED, anchor: 'start' })}
      ${T(392, 16, 'Water pushes oar', { size: 13, fill: BLUE, anchor: 'end' })}${T(392, 32, '', { id: 'mfrc-fb', size: 13, fill: BLUE, anchor: 'end' })}
      ${T(8, 228, '', { id: 'mfrc-sp', size: 14, anchor: 'start' })}
      ${T(392, 228, '', { id: 'mfrc-stt', size: 14, anchor: 'end' })}`);
    const $ = s => svg.querySelector(s);
    const line = (id, x1, y1, x2, y2) => { const n = $(id); n.setAttribute('x1', x1); n.setAttribute('y1', y1); n.setAttribute('x2', x2); n.setAttribute('y2', y2); };
    let v = 1.6, ph = 0;
    function draw(dt) {
      ph = (ph + dt) % CYC;
      const drive = ph < DRV;
      const phi = (drive ? 45 * Math.cos(Math.PI * ph / DRV) : -45 * Math.cos(Math.PI * (ph - DRV) / (CYC - DRV))) * Math.PI / 180;
      const F = drive ? FP * Math.sin(Math.PI * ph / DRV) : 0;
      const h = Math.min(dt, 0.05);
      v += (F / MASS - DRAG * v) * h;
      const s = Math.sin(phi), c = Math.cos(phi);
      [[1, '#mfrc-o1', 100], [-1, '#mfrc-o2', 140]].forEach(([sg, id, py]) => {
        const tx = 200 + L * s, ty = py - sg * L * c, hx = 200 - LIN * s, hy = py + sg * LIN * c;
        line(id + '-s', hx, hy, tx, ty);
        line(id + '-b', 200 + (L - 15) * s, py - sg * (L - 15) * c, tx, ty);
        $(id + '-b').setAttribute('opacity', drive ? 1 : 0.55);
      });
      const bx = 200 + L * s, by = 100 - L * c;
      const len = F * 0.18;
      const shown = len > 3;
      $('#mfrc-ar').style.display = shown ? '' : 'none'; $('#mfrc-ab').style.display = shown ? '' : 'none';
      if (shown) { setArrow(svg, 'mfrc-ar', bx, by - 7, bx - len, by - 7, 5, 11); setArrow(svg, 'mfrc-ab', bx, by + 7, bx + len, by + 7, 5, 11); }
      const sp = $('#mfrc-splash'); sp.setAttribute('cx', bx); sp.setAttribute('cy', by); sp.setAttribute('opacity', drive ? 0.9 : 0);
      const bodyX = 192 + phi * 180 / Math.PI * 0.16;
      $('#mfrc-sh').setAttribute('x1', bodyX); $('#mfrc-sh').setAttribute('x2', bodyX); $('#mfrc-hd').setAttribute('cx', bodyX);
      ripples.forEach((r, i) => { r.x -= v * PX * dt; if (r.x < -30) r.x += 440; $('#mfrc-rp' + i).setAttribute('transform', `translate(${r.x} ${r.y})`); });
      const Fn = Math.round(F);
      $('#mfrc-fr').textContent = drive ? `backward: ${Fn} N` : 'backward: 0 N';
      $('#mfrc-fb').textContent = drive ? `forward: ${Fn} N` : 'forward: 0 N';
      $('#mfrc-sp').textContent = `Boat speed: ${r1(v)} m/s`;
      $('#mfrc-stt').textContent = drive ? 'Drive: oar in the water' : 'Glide: oar in the air';
    }
    api.loop((t, dt) => draw(dt));
    draw(0);
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Rowing a boat',
    text: '<p>Newton’s 3rd law: when one object pushes another, the second pushes back equally hard the opposite way. The oar pushes the water <b>backward</b>, so the water pushes the oar, and the boat, <b>forward</b>. The two forces act on different objects.</p>',
    explain: '<p>A top view of a boat with a <b>rower</b> and two <b>oars</b>. When the blade is in the water, a <b>red arrow</b> shows the oar pushing water backward and a <b>blue arrow</b> shows the water pushing the oar forward; both show the same number of newtons. With the oar in the air there is no push, so the boat glides and slows slightly.</p><p>Notice the ripples speed up after each stroke.</p>',
    say: 'This is a boat seen from above, with a rower pulling two oars. Look at the blade when it is in the water. The red arrow shows the oar pushing the water backward. The blue arrow shows the water pushing the oar forward. Both arrows show the same number of newtons, but they are pushes on different things, one on the water and one on the oar. That is Newton’s third law. The forward push is what speeds the boat up. When the oar lifts out of the water, there is no push, and the boat just glides. Water drag slows it down a little, until the next stroke begins.',
    mount: mfrcRowMount
  });

  // ---------------------------------------------------------------------
  // 5. Braking distance: speed and road grip (buttons + speed slider)
  // ---------------------------------------------------------------------
  function mfrcBrakeMount(el, api) {
    const X0 = 30, SC = 2.2, G = 9.8, WARP = 2, RY = 146, RUN0 = -20;
    const ROADS = { dry: { name: 'dry road', mu: 0.7 }, wet: { name: 'wet road', mu: 0.4 }, icy: { name: 'icy road', mu: 0.1 } };
    const ticks = Array.from({ length: 16 }, (_, i) => `<line x1="${X0 + i * 10 * SC}" y1="158" x2="${X0 + i * 10 * SC}" y2="${i % 5 === 0 ? 168 : 164}" stroke="${INK}" stroke-width="2"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <rect x="0" y="108" width="400" height="${RY - 108}" fill="${MUTED}" opacity="0.35"/>
      <line x1="0" y1="${RY}" x2="400" y2="${RY}" stroke="${INK}" stroke-width="3"/>
      <line x1="0" y1="127" x2="400" y2="127" stroke="${SOFT}" stroke-width="2" stroke-dasharray="14 12"/>
      <line x1="${X0}" y1="98" x2="${X0}" y2="170" stroke="${RED}" stroke-width="2" stroke-dasharray="4 3"/>
      ${T(X0, 94, 'BRAKE!', { size: 12, fill: RED })}
      <line x1="${X0 - 4}" y1="160" x2="${X0 + 15 * 10 * SC}" y2="160" stroke="${INK}" stroke-width="2"/>${ticks}
      <line id="mfrc-br" x1="${X0}" y1="160" x2="${X0}" y2="160" stroke="${RED}" stroke-width="5"/>
      ${[0, 50, 100, 150].map(m => T(X0 + m * SC, 184, m === 150 ? '150 m' : String(m), { size: 12, fill: MUTED })).join('')}
      <g id="mfrc-car">
        <path d="M0,-8 L0,-16 L8,-18 L14,-28 L30,-28 L36,-18 L42,-14 L42,-8 Z" fill="${ORANGE}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M16,-25 L28,-25 L32,-18 L12,-18 Z" fill="${SOFT}" stroke="${INK}" stroke-width="1.5"/>
        <rect id="mfrc-tl" x="-1" y="-15" width="4" height="6" fill="${RED}"/>
        <circle cx="10" cy="-5" r="5.5" fill="${INK}"/><circle cx="33" cy="-5" r="5.5" fill="${INK}"/>
      </g>
      ${arrowHTML('mfrc-fa', RED, 5)}
      ${T(8, 16, '', { id: 'mfrc-r1', size: 14, anchor: 'start' })}
      ${T(8, 34, '', { id: 'mfrc-r2', size: 13, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(8, 54, '', { id: 'mfrc-r3', size: 15, fill: PRIM, anchor: 'start' })}
      ${T(392, 16, 'Red arrow: friction', { size: 13, fill: RED, anchor: 'end' })}
      ${T(392, 34, 'Double the speed:', { size: 13, weight: 600, fill: MUTED, anchor: 'end' })}
      ${T(392, 50, '4 times the distance', { size: 13, weight: 600, fill: MUTED, anchor: 'end' })}`,
      comboRow([{ id: 'mfrc-b-dry', label: 'Dry' }, { id: 'mfrc-b-wet', label: 'Wet' }, { id: 'mfrc-b-icy', label: 'Icy' }],
        { id: 'mfrc-spd', label: 'Speed', min: 20, max: 100, step: 10, val: 50, out: '50 km/h' }));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mfrc-spd'), out = el.querySelector('#mfrc-spd-v');
    const btn = { dry: el.querySelector('#mfrc-b-dry'), wet: el.querySelector('#mfrc-b-wet'), icy: el.querySelector('#mfrc-b-icy') };
    let key = 'dry', mode = 'run', s = RUN0, v = 0, hold = 0, v0 = 0, mu = 0.7;
    function restart() {
      mu = ROADS[key].mu; v0 = +slider.value / 3.6; mode = 'run'; s = RUN0; v = v0; hold = 0;
      Object.keys(btn).forEach(k => { btn[k].style.borderColor = k === key ? 'var(--primary)' : ''; });
      out.textContent = slider.value + ' km/h';
      const D = v0 * v0 / (2 * mu * G);
      $('#mfrc-r2').textContent = `Slowing down at ${f1(mu * G)} m/s² (${ROADS[key].name})`;
      $('#mfrc-r3').textContent = `Braking distance: ${r1(D)} m` + (D > 150 ? ' (off the scale)' : '');
    }
    const hs = Object.keys(btn).map(k => { const f = () => { key = k; restart(); }; btn[k].addEventListener('click', f); return [btn[k], f]; });
    slider.addEventListener('input', restart);
    restart();
    function frame(dt) {
      const d = dt * WARP;
      if (mode === 'run') { s += v * d; if (s >= 0) { mode = 'brake'; } }
      else if (mode === 'brake') {
        const a = mu * G;
        const vn = Math.max(0, v - a * d);
        s += (v + vn) / 2 * d; v = vn;
        if (v <= 0 || X0 + s * SC > 470) { mode = 'hold'; hold = 0; }
      } else { hold += dt; if (hold > (X0 + s * SC > 470 ? 0.4 : 1.8)) restart(); }
      const xf = X0 + s * SC;
      $('#mfrc-car').setAttribute('transform', `translate(${xf - 42} ${RY - 1})`);
      $('#mfrc-tl').setAttribute('opacity', mode === 'brake' || (mode === 'hold' && v === 0) ? 1 : 0.25);
      const br = Math.max(0, Math.min(xf, 396) - X0);
      $('#mfrc-br').setAttribute('x2', X0 + br * (s > 0 ? 1 : 0));
      const fa = $('#mfrc-fa'); fa.style.display = mode === 'brake' ? '' : 'none';
      if (mode === 'brake') { const len = 10 + 50 * mu; setArrow(svg, 'mfrc-fa', xf - 21, 102, xf - 21 - len, 102, 5, 11); }
      $('#mfrc-r1').textContent = `Speed: ${Math.round(v * 3.6)} km/h`;
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => { slider.removeEventListener('input', restart); hs.forEach(([b, f]) => b.removeEventListener('click', f)); };
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Braking distance',
    text: '<p>Brakes make the tyres grip the road, and friction slows the car. The stopping distance grows with the <b>square</b> of the speed: twice as fast needs 4 times the distance. A wet or icy road grips less, so the car needs much more room.</p>',
    explain: '<p>An orange <b>car</b> drives in from the left and passes the dashed red <b>BRAKE!</b> line. Then a red <b>friction arrow</b> points backward and the <b>red bar</b> on the ruler grows to the braking distance in metres. Choose <b>Dry</b>, <b>Wet</b> or <b>Icy</b>, and change the <b>Speed</b> slider to compare.</p><p>Notice that the distance grows much faster than the speed.</p>',
    say: 'Here an orange car drives in from the left and reaches the dashed red line. That is where the driver brakes. A red arrow shows friction pushing backward on the car, and a red bar along the ruler grows until the car stops. That length is the braking distance. Try the buttons. On a dry road the tyres grip well and the car stops quickly. On a wet road, friction is smaller, so it takes longer. On ice, the car slides very far. Now drag the speed slider. If you double the speed, the braking distance becomes four times as long. That is why slowing down in bad weather matters so much.',
    mount: mfrcBrakeMount
  });

  addTutorialSteps('physics', 'forces', steps, [
    { term: 'Mass', definition: 'How much matter an object contains, in kilograms (kg). It is the same everywhere.' },
    { term: 'Moment', definition: 'The turning effect of a force: force × distance from the pivot. Balance needs equal moments.' }
  ]);
})();
