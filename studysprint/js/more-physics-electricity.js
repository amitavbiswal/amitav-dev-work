(function () {
  'use strict';
  // more-physics-electricity: five more real-life example steps for Electricity & Magnetism (namespace mele-).

  const PRIM = 'var(--primary)', ORANGE = 'var(--t-orange)', BLUE = 'var(--t-blue)', TEAL = 'var(--t-teal)';
  const YELLOW = 'var(--t-yellow)', RED = 'var(--t-red)', GREEN = 'var(--t-green)';
  const SOFT = 'var(--t-soft)', INK = 'var(--t-ink)', MUTED = 'var(--t-muted)';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const f1 = n => (Math.round(n * 10) / 10).toString();
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
  // Mount an <svg> that shares the container with a control row.
  function scene(el, vb, inner, rows) {
    el.innerHTML = `<svg viewBox="${vb}" xmlns="${NS}" role="img" preserveAspectRatio="xMidYMid meet" style="flex:1 1 0;min-height:0;width:100%;height:auto">${inner}</svg>${rows || ''}`;
    return el.querySelector('svg');
  }
  // Point at distance s along a polyline (clamped), and the total length.
  function pathTools(pts) {
    const segs = [], N = pts.length - 1; let total = 0;
    for (let i = 0; i < N; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push(l); total += l; }
    return {
      total,
      at(s) {
        s = ((s % total) + total) % total;
        for (let i = 0; i < N; i++) {
          if (s <= segs[i] || i === N - 1) { const k = segs[i] ? s / segs[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; }
          s -= segs[i];
        }
        return pts[0];
      }
    };
  }

  // --- 1. Conductor or insulator? A bulb tester (button: next material) ---
  function meleTesterMount(el, api) {
    const LOOP = [[50, 96], [50, 150], [350, 150], [350, 50], [50, 50], [50, 84]];
    const mats = [
      { name: 'Copper wire', cond: true, art: `<rect x="-46" y="-4" width="92" height="8" rx="4" fill="#c8753a" stroke="#8a4a1e" stroke-width="1.5"/>` },
      { name: 'Rubber eraser', cond: false, art: `<rect x="-46" y="-10" width="92" height="20" rx="4" fill="#e88ea0" stroke="#a04a5d" stroke-width="1.5"/><rect x="-14" y="-10" width="28" height="20" fill="#3e63a8"/>` },
      { name: 'Iron nail', cond: true, art: `<rect x="-46" y="-3" width="88" height="6" rx="2" fill="#8b95a1" stroke="#4d5661" stroke-width="1.5"/><rect x="-52" y="-8" width="10" height="16" rx="2" fill="#8b95a1" stroke="#4d5661" stroke-width="1.5"/><polygon points="42,-3 52,0 42,3" fill="#8b95a1"/>` },
      { name: 'Plastic ruler', cond: false, art: `<rect x="-46" y="-9" width="92" height="18" rx="2" fill="#3aa0ff" fill-opacity="0.45" stroke="#1d6fb5" stroke-width="1.5"/><g stroke="#1d4f80" stroke-width="1.5"><line x1="-36" y1="-9" x2="-36" y2="-3"/><line x1="-24" y1="-9" x2="-24" y2="-3"/><line x1="-12" y1="-9" x2="-12" y2="-3"/><line x1="0" y1="-9" x2="0" y2="-3"/><line x1="12" y1="-9" x2="12" y2="-3"/><line x1="24" y1="-9" x2="24" y2="-3"/><line x1="36" y1="-9" x2="36" y2="-3"/></g>` },
      { name: 'Aluminium foil', cond: true, art: `<path d="M-46,-3 L-30,3 L-14,-3 L2,3 L18,-3 L34,3 L46,-2 L46,3 L34,4 L18,-2 L2,4 L-14,-2 L-30,4 L-46,0 Z" fill="#d5dbe3" stroke="#8b95a1" stroke-width="1.5"/>` },
      { name: 'Glass rod', cond: false, art: `<rect x="-46" y="-6" width="92" height="12" rx="6" fill="#bfe9f5" fill-opacity="0.85" stroke="#6fb2c7" stroke-width="1.5"/>` }
    ];
    let dots = '';
    for (let i = 0; i < 18; i++) dots += `<circle class="mele-e" r="4" fill="${TEAL}"/>`;
    const matSvg = mats.map((m, i) => `<g class="mele-mat" data-i="${i}" opacity="0">${m.art}</g>`).join('');
    scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <polyline points="50,96 50,150 165,150" fill="none" stroke="${MUTED}" stroke-width="4" stroke-linejoin="round"/>
      <polyline points="235,150 350,150 350,50 50,50 50,84" fill="none" stroke="${MUTED}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="36" y1="84" x2="64" y2="84" stroke="${INK}" stroke-width="4"/><line x1="43" y1="96" x2="57" y2="96" stroke="${INK}" stroke-width="7"/>
      ${T(78, 89, '+', { size: 16, anchor: 'start', fill: RED })}${T(78, 109, '−', { size: 16, anchor: 'start', fill: PRIM })}
      <circle id="mele-glow" cx="200" cy="50" r="28" fill="${YELLOW}" opacity="0"/>
      <circle cx="200" cy="50" r="14" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
      <path d="M192,56 L195,46 L200,56 L205,46 L208,56" fill="none" stroke="${INK}" stroke-width="2"/>
      ${T(244, 42, 'Bulb', { size: 13, anchor: 'start' })}
      ${dots}
      <circle cx="165" cy="150" r="6" fill="${INK}"/><circle cx="235" cy="150" r="6" fill="${INK}"/>
      <g id="mele-matg" transform="translate(200 150)">${matSvg}</g>
      ${T(200, 128, 'Material in the gap', { size: 12, weight: 600, fill: MUTED })}
      ${T(200, 20, '', { id: 'mele-name', size: 15, fill: INK })}
      ${T(200, 182, '', { id: 'mele-msg', size: 14, fill: PRIM })}`,
      btnRow([{ id: 'mele-next', label: 'Test next material →' }]));
    const q = s => el.querySelector(s), es = [...el.querySelectorAll('.mele-e')], ms = [...el.querySelectorAll('.mele-mat')];
    const path = pathTools(LOOP);
    let idx = 0, t0 = null, flow = 0, s0 = 0, glow = 0, tNow = 0;
    q('#mele-next').addEventListener('click', () => { idx = (idx + 1) % mats.length; t0 = tNow; });
    api.loop((t, dt) => {
      tNow = t; if (t0 === null) t0 = t;
      if (t - t0 > 4) { idx = (idx + 1) % mats.length; t0 = t; }
      const m = mats[idx], age = t - t0;
      const slide = clamp(age / 0.45, 0, 1), on = m.cond && age > 0.6;
      ms.forEach((g, i) => g.setAttribute('opacity', i === idx ? slide : 0));
      q('#mele-matg').setAttribute('transform', `translate(200 ${(150 + (1 - slide) * 26).toFixed(1)})`);
      flow += ((on ? 1 : 0) - flow) * Math.min(1, dt * 5);
      glow += ((on ? 1 : 0) - glow) * Math.min(1, dt * 6);
      s0 += flow * 70 * dt;
      es.forEach((c, i) => {
        const p = path.at(s0 + i * path.total / es.length);
        c.setAttribute('cx', p[0].toFixed(1)); c.setAttribute('cy', p[1].toFixed(1)); c.setAttribute('opacity', (0.3 + 0.7 * flow).toFixed(2));
      });
      q('#mele-glow').setAttribute('opacity', (0.9 * glow).toFixed(2));
      q('#mele-name').textContent = 'Testing: ' + m.name;
      q('#mele-msg').textContent = age < 0.6 ? '…' : m.cond ? 'Conductor: current flows, bulb lights' : 'Insulator: no current, bulb stays dark';
      q('#mele-msg').setAttribute('fill', age < 0.6 ? MUTED : m.cond ? PRIM : RED);
    });
  }
  addTutorialSteps('physics', 'electricity', [
    { kind: 'example', title: 'Real life: Conductor or insulator?',
      text: '<p>Wires are made of metal but coated in plastic. Metals are <b>conductors</b>: their free electrons carry current easily. Rubber, plastic and glass are <b>insulators</b>: nothing flows, which keeps you safe.</p>',
      explain: '<p>A battery, a <b>bulb</b> and a gap in the bottom wire make a test circuit. Each material slides into the gap in turn: copper, iron and foil are conductors, so teal <b>electron</b> dots flow and the bulb glows. Rubber, plastic and glass are insulators, so the dots stay still and the bulb is dark. Press <b>Test next material</b> to skip ahead.</p>',
      say: 'This is a simple tester. A battery is connected to a bulb, but there is a gap in the bottom wire. The bulb only lights if the gap is filled with something that lets electricity through. Watch the materials slide into the gap, one at a time. When it is copper wire, an iron nail, or aluminium foil, the teal electrons flow round the circuit and the bulb glows. These materials are called conductors, because metals have free electrons that can move. When it is a rubber eraser, a plastic ruler, or a glass rod, the electrons stay still and the bulb stays dark. These are insulators. Press the button to test the next material.',
      mount: meleTesterMount }
  ]);

  // --- 2. Static electricity: a rubbed balloon sticks to the wall (looping story) ---
  function meleStaticMount(el, api) {
    const PER = 13, WX = 318;
    const ease = k => k * k * (3 - 2 * k);
    const L = [[-12, -14], [10, -16], [-16, 4], [14, 6], [0, 16]];         // charge spots on the balloon (relative to its centre)
    const H = [[86, 130], [92, 146], [80, 120], [94, 160], [84, 138]];      // where the electrons leave the hair
    const chg = (cls, s, fill) => `<g class="${cls}"><circle r="7" fill="${fill}"/><text y="4.5" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">${s}</text></g>`;
    let plus = '', minus = '', atoms = '';
    H.forEach(() => { plus += chg('mele-hp', '+', RED); minus += chg('mele-em', '−', BLUE); });
    [336, 376].forEach(cx => [96, 132, 168, 204].forEach(cy => {
      atoms += `<g class="mele-atom" data-x="${cx}" data-y="${cy}"><circle cx="${cx}" cy="${cy}" r="15" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.5"/>` +
        `<circle cx="${cx}" cy="${cy}" r="7" fill="${RED}"/><text x="${cx}" y="${cy + 4.5}" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">+</text>` +
        `<circle class="mele-orb" r="4.5" fill="${BLUE}"/></g>`;
    }));
    scene(el, '0 0 400 240', `
      <rect x="0" y="0" width="400" height="240" fill="${SOFT}" rx="8"/>
      <rect x="${WX}" y="56" width="82" height="184" fill="${MUTED}" fill-opacity="0.35"/>
      ${T(359, 232, 'Wall', { size: 14 })}
      <g id="mele-all">
        <rect x="34" y="204" width="56" height="36" rx="12" fill="${PRIM}"/>
        <circle cx="62" cy="170" r="36" fill="#f0c8a0"/><ellipse cx="62" cy="146" rx="40" ry="30" fill="#6b4a2b"/>
        <circle cx="50" cy="178" r="3" fill="#2b2b2b"/><circle cx="74" cy="178" r="3" fill="#2b2b2b"/><path d="M52,190 q10,8 20,0" fill="none" stroke="#2b2b2b" stroke-width="2.5" stroke-linecap="round"/>
        ${T(40, 106, 'Hair', { size: 13 })}
        ${atoms}
        <polyline id="mele-str" points="0,0 0,0" fill="none" stroke="${MUTED}" stroke-width="2"/>
        <ellipse id="mele-bal" cx="0" cy="0" rx="22" ry="28" fill="${RED}"/><ellipse id="mele-shine" cx="0" cy="0" rx="4" ry="8" fill="#fff" opacity="0.5"/>
        ${plus}${minus}
        ${T(0, 0, 'Balloon', { id: 'mele-bl', size: 13 })}
        ${T(236, 154, 'Sticks!', { id: 'mele-stick', size: 15, fill: PRIM })}
      </g>
      ${T(200, 18, '', { id: 'mele-c1', size: 14, fill: PRIM })}
      ${T(200, 37, '', { id: 'mele-c2', size: 13, fill: INK })}`);
    const q = s => el.querySelector(s);
    const hp = [...el.querySelectorAll('.mele-hp')], em = [...el.querySelectorAll('.mele-em')];
    const atoms2 = [...el.querySelectorAll('.mele-atom')].map(g => ({ x: +g.dataset.x, y: +g.dataset.y, orb: g.querySelector('.mele-orb') }));
    const bal = q('#mele-bal'), shine = q('#mele-shine'), str = q('#mele-str'), bl = q('#mele-bl'), all = q('#mele-all'), stick = q('#mele-stick');
    const c1 = q('#mele-c1'), c2 = q('#mele-c2');
    api.loop((t0) => {
      const t = t0 % PER;
      all.setAttribute('opacity', (t < 0.4 ? t / 0.4 : t > 12.2 ? Math.max(0, (PER - t) / 0.8) : 1).toFixed(2));
      let bx = 122, by = 150;
      if (t < 4) { by = 150 + 14 * Math.sin(t * 2 * Math.PI * 1.1); bx = 122 + 2 * Math.sin(t * 9); }
      else if (t < 6) { const k = ease((t - 4) / 2); bx = 122 + (296 - 122) * k; by = 150 + 14 * Math.sin(4 * 2 * Math.PI * 1.1) * (1 - k); }
      else { bx = 296; by = 150; }
      const p = t < 6 ? 0 : ease(clamp((t - 6) / 1.5, 0, 1));                 // wall polarisation 0..1
      bal.setAttribute('cx', bx.toFixed(1)); bal.setAttribute('cy', by.toFixed(1));
      shine.setAttribute('cx', (bx - 9).toFixed(1)); shine.setAttribute('cy', (by - 10).toFixed(1));
      const sw = t < 6 ? Math.sin(t * 5) * 4 : 0;
      str.setAttribute('points', `${bx.toFixed(1)},${(by + 28).toFixed(1)} ${(bx + sw).toFixed(1)},${(by + 44).toFixed(1)} ${(bx - sw).toFixed(1)},${(by + 60).toFixed(1)}`);
      bl.setAttribute('x', bx.toFixed(1)); bl.setAttribute('y', (by - 36).toFixed(1));
      H.forEach((h, i) => {
        const s = 0.6 + 0.55 * i, k = clamp((t - s) / 0.8, 0, 1), e = ease(k);
        const tx = bx + L[i][0], ty = by + L[i][1];
        const x = h[0] + (tx - h[0]) * e, y = h[1] + (ty - h[1]) * e;
        em[i].setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        em[i].setAttribute('opacity', t >= s ? 1 : 0);
        hp[i].setAttribute('transform', `translate(${h[0]} ${h[1]})`);
        hp[i].setAttribute('opacity', k > 0.05 ? 1 : 0);
      });
      atoms2.forEach((a, i) => {
        const ang = t0 * 3 + i * 1.3;
        a.orb.setAttribute('cx', (a.x + 8 * p + 10 * Math.cos(ang)).toFixed(1)); a.orb.setAttribute('cy', (a.y + 10 * Math.sin(ang)).toFixed(1));
      });
      stick.setAttribute('opacity', t > 7.2 && t < 12.2 ? (0.6 + 0.4 * Math.sin(t * 6)).toFixed(2) : 0);
      const ph = t < 4 ? 0 : t < 6 ? 1 : 2;
      c1.textContent = ['1. Rubbing moves electrons from hair to balloon', '2. The charged balloon moves to the wall', '3. Its − charge pushes the wall’s electrons away'][ph];
      c2.textContent = ['Hair is left with +, the balloon gets −', 'It carries extra electrons, so it is negative', 'The wall surface near it is +, so it sticks'][ph];
    });
  }
  addTutorialSteps('physics', 'electricity', [
    { kind: 'example', title: 'Real life: A balloon that sticks to the wall',
      text: '<p>Rub a balloon on your hair and it sticks to a wall. Rubbing moves <b>electrons</b> from the hair to the balloon, so the balloon becomes negatively charged. It then attracts the wall’s surface. This is <b>static electricity</b>.</p>',
      explain: '<p>A head with brown <b>hair</b> on the left rubs a red <b>balloon</b>. Blue circles with a minus sign, the <b>electrons</b>, hop from the hair onto the balloon, leaving red plus signs on the hair. The balloon then floats to the <b>wall</b>, where tiny atoms show their electrons shifting away from it, so the surface nearest is plus and it sticks. It loops.</p>',
      say: 'Look at the head on the left. A red balloon is being rubbed on the hair. Watch the blue circles with minus signs. Those are electrons, and they hop from the hair onto the balloon. The hair loses electrons, so it is left with plus signs. The balloon gains electrons, so it becomes negative. Now the balloon floats over to the wall. The wall is neutral, but each of its atoms has an electron cloud. The negative balloon pushes those electrons away, so the surface of the wall nearest the balloon becomes slightly positive. Opposite charges attract, so the balloon sticks. This is called static electricity, because the charge stays in place instead of flowing.',
      mount: meleStaticMount }
  ]);

  // --- 3. An electric bell: an electromagnet that switches itself off (button: bell push) ---
  function meleBellMount(el, api) {
    const HX = 222, HY = 150, P = 0.9;
    const wire = pts => `<polyline points="${pts}" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linejoin="round"/>`;
    const flow = (id, pts) => `<polyline id="${id}" points="${pts}" fill="none" stroke="${YELLOW}" stroke-width="4" stroke-linejoin="round" stroke-dasharray="3 9" opacity="0"/>`;
    const pA = '222,172 300,172 300,150 300,109 272,109 230,109 226,109 222,150 200,150 200,132 188,125';
    const pB = '133,105 100,105 100,172 210,172';
    let loops = '';
    [146, 160, 174, 188].forEach(cx => { loops += `<ellipse cx="${cx}" cy="105" rx="7" ry="19" fill="none" stroke="${ORANGE}" stroke-width="4"/>`; });
    scene(el, '0 0 400 200', `
      <rect x="0" y="0" width="400" height="200" fill="${SOFT}" rx="8"/>
      <circle cx="66" cy="84" r="24" fill="${BLUE}" fill-opacity="0.3" stroke="${BLUE}" stroke-width="4"/>
      <circle class="mele-ring" cx="66" cy="84" r="30" fill="none" stroke="${BLUE}" stroke-width="3" opacity="0"/>
      <circle class="mele-ring" cx="66" cy="84" r="30" fill="none" stroke="${BLUE}" stroke-width="3" opacity="0"/>
      ${T(66, 124, 'Gong', { size: 13 })}
      ${wire('133,105 100,105 100,172 210,172')}${wire('222,172 300,172 300,150')}${wire('300,128 300,109 272,109')}${wire('188,125 200,132 200,150 216,150')}
      ${flow('mele-fa', pA)}${flow('mele-fb', pB)}
      <ellipse id="mele-halo" cx="165" cy="105" rx="62" ry="34" fill="${BLUE}" opacity="0"/>
      <rect x="132" y="100" width="68" height="10" fill="#8b95a1" stroke="#4d5661" stroke-width="1.5"/>
      ${loops}
      ${T(150, 144, 'Electromagnet', { size: 12 })}
      <rect x="230" y="106" width="40" height="6" fill="#8b95a1" stroke="#4d5661" stroke-width="1"/><rect x="268" y="101" width="8" height="16" rx="2" fill="#8b95a1" stroke="#4d5661" stroke-width="1.5"/>
      ${T(258, 96, 'Contact', { size: 12 })}
      <polygon id="mele-spark" points="236,100 232,108 238,108 233,118 243,106 237,106 241,100" fill="${YELLOW}" stroke="${ORANGE}" stroke-width="1" opacity="0"/>
      <g id="mele-arm" transform="translate(${HX} ${HY})"><rect x="-110" y="-92" width="114" height="6" fill="#8b95a1" stroke="#4d5661" stroke-width="1.5"/>
        <rect x="-4" y="-90" width="8" height="90" fill="#8b95a1" stroke="#4d5661" stroke-width="1.5"/><circle cx="-110" cy="-89" r="8" fill="#4d5661"/></g>
      <circle cx="${HX}" cy="${HY}" r="4" fill="${INK}"/>
      ${T(160, 44, 'Hammer', { size: 13 })}${T(268, 74, 'Armature', { size: 13 })}
      <line x1="242" y1="152" x2="228" y2="151" stroke="${INK}" stroke-width="1.5"/>${T(262, 156, 'Spring', { size: 12, anchor: 'start' })}
      <line x1="210" y1="164" x2="210" y2="180" stroke="${INK}" stroke-width="7"/><line x1="222" y1="160" x2="222" y2="184" stroke="${INK}" stroke-width="4"/>
      ${T(232, 168, '+', { size: 15, anchor: 'start', fill: RED })}${T(198, 168, '−', { size: 15, anchor: 'end', fill: PRIM })}
      ${T(216, 197, 'Battery', { size: 12 })}
      <circle cx="300" cy="150" r="3.5" fill="${INK}"/><circle cx="300" cy="128" r="3.5" fill="${INK}"/>
      <line id="mele-lever" x1="300" y1="150" x2="300" y2="128" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      ${T(316, 142, 'Bell push', { size: 12, anchor: 'start' })}
      ${T(200, 16, '', { id: 'mele-st', size: 14, fill: PRIM })}
      ${T(390, 34, 'Slowed down', { size: 12, anchor: 'end', fill: MUTED, weight: 600 })}`,
      btnRow([{ id: 'mele-push', label: 'Release the bell push' }]));
    const q = s => el.querySelector(s), rings = [...el.querySelectorAll('.mele-ring')];
    let pressed = true, cyc = 0.7, halo = 0, dash = 0;
    const btn = q('#mele-push');
    btn.addEventListener('click', () => { pressed = !pressed; btn.textContent = pressed ? 'Release the bell push' : 'Press the bell push'; });
    const theta = c => c < 0.30 ? 5 - 15 * Math.pow(c / 0.30, 2) : c < 0.36 ? -10 : c < 0.66 ? -10 + 15 * (1 - Math.pow(1 - (c - 0.36) / 0.30, 2)) : 5;
    api.loop((t, dt) => {
      if (pressed || cyc < 0.66) { cyc += dt; if (cyc >= P) cyc = pressed ? cyc - P : 0.7; } else cyc = 0.7;
      const th = theta(cyc), on = pressed && th > 3.8;
      halo += ((on ? 0.4 : 0) - halo) * Math.min(1, dt * 14);
      dash -= 40 * dt;
      q('#mele-arm').setAttribute('transform', `translate(${HX} ${HY}) rotate(${th.toFixed(2)})`);
      q('#mele-halo').setAttribute('opacity', halo.toFixed(2));
      ['#mele-fa', '#mele-fb'].forEach(id => { const l = q(id); l.setAttribute('opacity', on ? 1 : 0); l.setAttribute('stroke-dashoffset', dash.toFixed(1)); });
      q('#mele-spark').setAttribute('opacity', pressed && cyc > 0.07 && cyc < 0.16 ? 1 : 0);
      q('#mele-lever').setAttribute('x2', pressed ? 300 : 312); q('#mele-lever').setAttribute('y2', pressed ? 128 : 134);
      rings.forEach((r, i) => {
        const age = cyc - 0.30 - i * 0.12;
        if (age < 0 || age > 0.5 || (!pressed && cyc < 0.3)) { r.setAttribute('opacity', 0); return; }
        r.setAttribute('r', (28 + age * 70).toFixed(1)); r.setAttribute('opacity', (0.9 * (1 - age / 0.5)).toFixed(2));
      });
      const st = q('#mele-st');
      st.textContent = !pressed ? 'Bell push released: circuit open, no ringing' : on ? 'Contact closed: electromagnet ON' : 'Contact open: electromagnet OFF';
      st.setAttribute('fill', on ? RED : PRIM);
    });
  }
  addTutorialSteps('physics', 'electricity', [
    { kind: 'example', title: 'Real life: How an electric bell rings',
      text: '<p>When you press a doorbell, current flows through an <b>electromagnet</b>, which pulls a springy iron strip so the hammer hits the gong. But that pull breaks the circuit, so the magnet switches off and the spring flicks the strip back. This repeats very fast: ring-ring-ring!</p>',
      explain: '<p>Follow the loop: <b>battery</b>, <b>bell push</b>, <b>contact</b> screw, iron <b>armature</b> and <b>electromagnet</b>. With the push pressed, yellow dashes flow and the magnet pulls the armature so the <b>hammer</b> strikes the blue <b>gong</b>. The armature leaves the contact, the current stops, and the <b>spring</b> pulls it back. The button stops or restarts the bell.</p>',
      say: 'This is the inside of an electric bell. Follow the wires. Current runs from the battery, through the bell push, through a contact screw, into a springy iron strip called the armature, and on through a coil of wire. That coil wrapped around iron is an electromagnet. With the current on, it pulls the armature toward it, and the hammer on the end of the armature strikes the gong. Ring! But when the armature moves, it leaves the contact screw, so the circuit breaks and the electromagnet switches off. The spring pulls the armature back, the contact closes again, and the whole thing repeats. It happens many times a second. Press the button to release the bell push and stop it.',
      mount: meleBellMount }
  ]);

  // --- 4. Phone charger: a step-down transformer (interactive secondary turns) ---
  function meleTransformerMount(el, api) {
    const NP = 460, VP = 230, W = 1.6;                       // primary turns, mains volts, drawn period (s)
    let ploops = '', sloops = '', fdots = '', pdots = '', sdots = '';
    for (let i = 0; i < 8; i++) ploops += `<ellipse cx="143" cy="${71 + i * 6}" rx="17" ry="5" fill="none" stroke="${ORANGE}" stroke-width="3"/>`;
    for (let i = 0; i < 10; i++) sloops += `<ellipse class="mele-sl" cx="257" cy="92" rx="17" ry="5" fill="none" stroke="${GREEN}" stroke-width="3"/>`;
    for (let i = 0; i < 14; i++) fdots += `<circle class="mele-fd" r="3.5" fill="${BLUE}"/>`;
    for (let i = 0; i < 9; i++) pdots += `<circle class="mele-pd" r="3.5" fill="${TEAL}"/>`;
    for (let i = 0; i < 9; i++) sdots += `<circle class="mele-sd" r="3.5" fill="${TEAL}"/>`;
    scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <path d="M132,44 H268 V140 H132 Z M154,66 V118 H246 V66 Z" fill-rule="evenodd" fill="#9aa5b1" stroke="#4d5661" stroke-width="2"/>
      ${T(200, 96, 'Iron core', { size: 13 })}
      <polyline points="54,80 100,80 100,71 126,71" fill="none" stroke="${MUTED}" stroke-width="3"/>
      <polyline points="54,102 100,102 100,113 126,113" fill="none" stroke="${MUTED}" stroke-width="3"/>
      <rect x="28" y="72" width="26" height="38" rx="5" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
      <line x1="12" y1="80" x2="28" y2="80" stroke="${INK}" stroke-width="4"/><line x1="12" y1="102" x2="28" y2="102" stroke="${INK}" stroke-width="4"/>
      ${T(40, 128, 'Mains', { size: 13 })}
      ${ploops}${sloops}
      <polyline id="mele-sw1" points="0,0" fill="none" stroke="${MUTED}" stroke-width="3"/><polyline id="mele-sw2" points="0,0" fill="none" stroke="${MUTED}" stroke-width="3"/>
      <rect x="328" y="58" width="46" height="78" rx="9" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
      <rect x="334" y="68" width="34" height="52" rx="3" fill="${BLUE}" fill-opacity="0.2"/>
      <polygon id="mele-bolt" points="353,72 342,98 350,98 346,116 361,90 353,90 358,72" fill="${YELLOW}" stroke="${ORANGE}" stroke-width="1.5" opacity="0"/>
      <text id="mele-x" x="351" y="105" font-size="30" font-weight="800" fill="${RED}" text-anchor="middle" opacity="0">✕</text>
      ${T(351, 152, 'Phone', { size: 13 })}
      ${fdots}${pdots}${sdots}
      ${T(136, 36, 'Primary: 460 turns', { size: 12 })}${T(257, 36, '', { id: 'mele-sl-t', size: 12 })}
      ${T(10, 16, 'In: 230 V AC', { size: 14, anchor: 'start' })}${T(390, 16, '', { id: 'mele-out', size: 14, anchor: 'end', fill: PRIM })}
      ${T(200, 166, '', { id: 'mele-eq', size: 13 })}${T(200, 184, '', { id: 'mele-v', size: 14 })}`,
      sliderRow('Turns', 'mele-ns', 5, 50, 5, 10, '10'));
    const q = s => el.querySelector(s), sl = q('#mele-ns');
    const sls = [...el.querySelectorAll('.mele-sl')], fd = [...el.querySelectorAll('.mele-fd')], pd = [...el.querySelectorAll('.mele-pd')], sd = [...el.querySelectorAll('.mele-sd')];
    const ring = pathTools([[132 + 11, 55], [257, 55], [257, 129], [143, 129], [143, 55]].concat([[143, 55]]));
    const ptools = pathTools([[54, 80], [100, 80], [100, 71], [126, 71], [126, 113], [100, 113], [100, 102], [54, 102]]);
    let stools = null, N = 0;
    function layout() {
      N = +sl.value / 5;
      const sp = Math.min(6, 44 / Math.max(1, N - 1));
      sls.forEach((e, i) => { e.setAttribute('opacity', i < N ? 1 : 0); e.setAttribute('cy', 92 + (i - (N - 1) / 2) * sp); });
      const yt = 92 - (N - 1) / 2 * sp, yb = 92 + (N - 1) / 2 * sp;
      q('#mele-sw1').setAttribute('points', `274,${yt} 300,${yt} 300,80 328,80`);
      q('#mele-sw2').setAttribute('points', `274,${yb} 300,${yb} 300,104 328,104`);
      stools = pathTools([[328, 80], [300, 80], [300, yt], [274, yt], [274, yb], [300, yb], [300, 104], [328, 104]]);
      const ns = +sl.value, vs = VP * ns / NP;
      q('#mele-sl-t').textContent = `Secondary: ${ns} turns`;
      q('#mele-sl-t').setAttribute('x', 294);
      q('#mele-ns-v').textContent = String(ns);
      q('#mele-out').textContent = `Out: ${f1(vs)} V`;
      q('#mele-eq').textContent = `460 turns : ${ns} turns  =  ${f1(NP / ns)} : 1`;
      const ok = vs >= 4.5 && vs <= 5.5;
      const v = q('#mele-v');
      v.textContent = ok ? `230 V ÷ ${f1(NP / ns)} = ${f1(vs)} V: just right for a phone` : vs < 4.5 ? `Only ${f1(vs)} V: too low, phone will not charge` : `${f1(vs)} V: too high, could damage the phone`;
      v.setAttribute('fill', ok ? PRIM : RED);
      q('#mele-bolt').setAttribute('opacity', ok ? 1 : 0); q('#mele-x').setAttribute('opacity', ok ? 0 : 1);
    }
    sl.addEventListener('input', layout);
    layout();
    api.loop((t) => {
      const sw = Math.sin(t * 2 * Math.PI / W);
      fd.forEach((c, i) => { const p = ring.at(sw * 60 + i * ring.total / fd.length); c.setAttribute('cx', p[0].toFixed(1)); c.setAttribute('cy', p[1].toFixed(1)); });
      pd.forEach((c, i) => { const p = ptools.at(20 + sw * 14 + i * (ptools.total - 40) / (pd.length - 1)); c.setAttribute('cx', p[0].toFixed(1)); c.setAttribute('cy', p[1].toFixed(1)); });
      sd.forEach((c, i) => { const p = stools.at(20 + sw * 14 + i * (stools.total - 40) / (sd.length - 1)); c.setAttribute('cx', p[0].toFixed(1)); c.setAttribute('cy', p[1].toFixed(1)); });
    });
  }
  addTutorialSteps('physics', 'electricity', [
    { kind: 'example', title: 'Real life: Inside a phone charger',
      text: '<p>Wall sockets give 230 volts, far too much for a phone. A <b>transformer</b> steps it down. Alternating current in the primary coil makes a changing magnetic field in the iron core, which pushes current through the secondary coil. Fewer turns there means a lower voltage.</p>',
      explain: '<p>A <b>mains</b> plug on the left feeds the <b>primary</b> coil of 460 turns, wound on an <b>iron core</b>; the <b>secondary</b> coil on the right feeds a <b>phone</b>. Blue dots swing round the core: the changing magnetic field. Coils are drawn with fewer loops than real. The <b>Turns</b> slider sets the secondary turns; the output volts follow.</p>',
      say: 'A phone charger contains a transformer. On the left, the mains plug supplies two hundred and thirty volts of alternating current to the primary coil, which has four hundred and sixty turns of wire. The current swings back and forth, so it makes a changing magnetic field in the iron core. The blue dots show that field swinging round the core. That changing field pushes current through the secondary coil on the right. The output voltage is the mains voltage times the secondary turns divided by the primary turns. With ten turns, the answer is five volts, just right for a phone. Use the slider to change the secondary turns. The coils are drawn with fewer loops than real ones.',
      mount: meleTransformerMount }
  ]);

  // --- 5. A lemon battery: cells in series add up their voltage (interactive number of lemons) ---
  function meleLemonMount(el, api) {
    const CX = i => 76 + 70 * i, CY = 104, VCELL = 0.9, VLED = 2;
    let lem = '', wires = '', ions = '', dots = '';
    for (let i = 0; i < 4; i++) {
      const c = CX(i);
      lem += `<g class="mele-lem" data-i="${i}"><ellipse cx="${c}" cy="${CY}" rx="30" ry="20" fill="#f7d63a" stroke="#c9a41c" stroke-width="2.5"/><path d="M${c + 29},${CY - 4} l7,3 l-7,3 Z" fill="#f7d63a" stroke="#c9a41c" stroke-width="1.5"/>` +
        `<rect x="${c - 17}" y="60" width="6" height="48" fill="#9aa5b1" stroke="#5b6673" stroke-width="1.5"/><rect x="${c + 11}" y="60" width="6" height="48" fill="#c8753a" stroke="#8a4a1e" stroke-width="1.5"/></g>`;
      for (let k = 0; k < 3; k++) ions += `<circle class="mele-ion" data-i="${i}" data-k="${k}" r="3.5" fill="${RED}"/>`;
      wires += `<polyline class="mele-link" data-i="${i}" points="${c + 14},60 ${c + 14},50 ${CX(i + 1) - 14},50 ${CX(i + 1) - 14},60" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linejoin="round"/>`;
    }
    for (let i = 0; i < 40; i++) dots += `<circle class="mele-d" r="3.5" fill="${TEAL}"/>`;
    scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      ${lem}
      ${wires}
      <polyline id="mele-top" points="0,0" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linejoin="round"/>
      <polyline id="mele-ret" points="${CX(0) - 14},60 ${CX(0) - 14},50 28,50 28,160 352,160 352,128" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linejoin="round"/>
      <circle id="mele-lg" cx="352" cy="108" r="26" fill="#ff5a5a" opacity="0"/>
      <path d="M340,120 V104 A12,12 0 0 1 364,104 V120 Z" fill="#f3d4d4" stroke="${INK}" stroke-width="3"/>
      <path id="mele-ld" d="M340,120 V104 A12,12 0 0 1 364,104 V120 Z" fill="#ff5a5a" opacity="0"/>
      <line x1="346" y1="120" x2="346" y2="128" stroke="${INK}" stroke-width="3"/><line x1="358" y1="120" x2="358" y2="124" stroke="${INK}" stroke-width="3"/>
      <line x1="352" y1="88" x2="352" y2="94" stroke="${INK}" stroke-width="3"/>
      ${T(369, 112, 'LED', { size: 13, anchor: 'start' })}
      ${ions}${dots}
      ${T(52, 142, 'Zinc −', { size: 12 })}${T(118, 142, 'Copper +', { size: 12 })}
      ${T(200, 18, '', { id: 'mele-v', size: 14, fill: INK })}${T(200, 182, '', { id: 'mele-msg', size: 14, fill: PRIM })}`,
      sliderRow('Lemons', 'mele-n', 1, 4, 1, 3, '3'));
    const q = s => el.querySelector(s), sl = q('#mele-n');
    const lems = [...el.querySelectorAll('.mele-lem')], links = [...el.querySelectorAll('.mele-link')];
    const ionEls = [...el.querySelectorAll('.mele-ion')], dEls = [...el.querySelectorAll('.mele-d')];
    let n = 3, tracks = [], on = false, bright = 0, s0 = 0, ionT = 0;
    function layout() {
      n = +sl.value;
      const V = VCELL * n;
      on = V >= VLED; bright = on ? (n === 3 ? 0.55 : 0.9) : 0;
      lems.forEach((g, i) => { g.querySelectorAll('rect').forEach(r => r.setAttribute('opacity', i < n ? 1 : 0)); g.setAttribute('opacity', i < n ? 1 : 0.22); });
      links.forEach((l, i) => l.setAttribute('opacity', i < n - 1 ? 1 : 0));
      const cl = CX(n - 1) + 14;
      q('#mele-top').setAttribute('points', `352,88 352,36 ${cl},36 ${cl},60`);
      // electron tracks (electrons leave zinc, so links run zinc -> copper)
      tracks = [pathTools([[CX(0) - 14, 60], [CX(0) - 14, 50], [28, 50], [28, 160], [352, 160], [352, 88], [352, 36], [cl, 36], [cl, 60]])];
      for (let i = 0; i < n - 1; i++) tracks.push(pathTools([[CX(i + 1) - 14, 60], [CX(i + 1) - 14, 50], [CX(i) + 14, 50], [CX(i) + 14, 60]]));
      q('#mele-n-v').textContent = String(n);
      q('#mele-v').textContent = `Voltage: ${n} × 0.9 V = ${f1(V)} V`;
      q('#mele-msg').textContent = on ? `Over 2 V: the LED glows${n === 3 ? ' faintly' : ''}` : 'Under 2 V: not enough to light the LED';
      q('#mele-msg').setAttribute('fill', on ? PRIM : RED);
      q('#mele-lg').setAttribute('opacity', (bright * 0.6).toFixed(2)); q('#mele-ld').setAttribute('opacity', bright.toFixed(2));
    }
    sl.addEventListener('input', layout);
    layout();
    api.loop((t, dt) => {
      const v = on ? (n === 3 ? 30 : 46) : 0;
      s0 += v * dt; ionT += (on ? 0.5 : 0) * dt;
      let k = 0;
      tracks.forEach(tr => {
        const cnt = Math.max(3, Math.round(tr.total / 17));
        for (let j = 0; j < cnt && k < dEls.length; j++, k++) {
          const p = tr.at(s0 + j * tr.total / cnt);
          dEls[k].setAttribute('cx', p[0].toFixed(1)); dEls[k].setAttribute('cy', p[1].toFixed(1)); dEls[k].setAttribute('opacity', on ? 1 : 0.35);
        }
      });
      for (; k < dEls.length; k++) dEls[k].setAttribute('opacity', 0);
      ionEls.forEach(e => {
        const i = +e.dataset.i, kk = +e.dataset.k;
        if (i >= n) { e.setAttribute('opacity', 0); return; }
        const f = (ionT + kk / 3) % 1;
        e.setAttribute('cx', (CX(i) - 12 + 24 * f).toFixed(1)); e.setAttribute('cy', (CY + (kk - 1) * 6).toFixed(1)); e.setAttribute('opacity', on ? 1 : 0.4);
      });
      q('#mele-lg').setAttribute('opacity', (bright * (0.5 + 0.15 * Math.sin(t * 5))).toFixed(2));
    });
  }
  addTutorialSteps('physics', 'electricity', [
    { kind: 'example', title: 'Real life: A lemon battery',
      text: '<p>A zinc strip and a copper strip in a lemon make a small battery: the acid juice lets the metals push electrons round a circuit. One lemon gives only about 0.9 volts, so several joined in <b>series</b> add up their voltages to light an LED.</p>',
      explain: '<p>Up to four <b>lemons</b> each hold a grey <b>zinc</b> strip and a brown <b>copper</b> strip. Wires join each copper to the next zinc, and a long wire returns to the <b>LED</b> on the right. Teal dots are electrons flowing from the zinc, round the circuit; red dots are ions moving inside each lemon. The <b>Lemons</b> slider adds cells and the total volts.</p>',
      say: 'This is a battery made from lemons. Each lemon has a zinc strip and a copper strip pushed into it. The acid juice lets the zinc give up electrons, and they flow out through the wire. Those are the teal dots. Inside each lemon, the red dots are charged particles moving through the juice, which completes the circuit. But one lemon gives only about nought point nine volts, and an LED needs about two. So the lemons are joined in series, each copper to the next zinc, and their voltages add up. Use the slider. With one or two lemons, the LED stays dark. With three, the total is two point seven volts, and the LED glows faintly. Try four lemons, and it glows brighter.',
      mount: meleLemonMount }
  ], [
    { term: 'Static electricity', definition: 'Electric charge that builds up on an object, for example when rubbing moves electrons from one material to another.' },
    { term: 'Transformer', definition: 'A device with two coils on an iron core that changes an alternating voltage. Voltage out : voltage in = turns on secondary : turns on primary.' },
    { term: 'Cell in series', definition: 'Cells joined end to end. Their voltages add up, so more cells give a bigger total voltage.' }
  ]);

})();
