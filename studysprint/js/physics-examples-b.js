(function () {
  'use strict';
  // physics-examples-b: extra real-life example steps, added via addTutorialSteps(...).
  // Namespaces: exhea- (heat), exwav- (waves), exele- (electricity).

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
  // Arrow with the tip exactly at (x2,y2).
  function arrow(x1, y1, x2, y2, color, w) {
    w = w || 3;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, hl = Math.min(10, len), hw = hl * 0.55 + w * 0.3;
    const bx = x2 - ux * hl, by = y2 - uy * hl;
    return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="${w}"/>` +
      `<polygon points="${x2},${y2} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}" fill="${color}"/>`;
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
  // Mount an <svg> that shares the 240px container with control rows.
  function scene(el, vb, inner, rows) {
    el.innerHTML = `<svg viewBox="${vb}" xmlns="${NS}" role="img" preserveAspectRatio="xMidYMid meet" style="flex:1 1 0;min-height:0;width:100%;height:auto">${inner}</svg>${rows || ''}`;
    return el.querySelector('svg');
  }

  // ===================== HEAT =====================

  // --- Sea breeze: convection loop that flips between day and night ---
  function exheaBreezeMount(el, api) {
    const X = { land: 100, sea: 300 }, TOP = 46, BOT = 128;
    const dots = Array.from({ length: 16 }, (_, i) => `<circle class="exhea-d" r="5" fill="${TEAL}"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <rect id="exhea-land" x="0" y="146" width="200" height="44" fill="${ORANGE}"/>
      <rect x="200" y="146" width="200" height="44" fill="${BLUE}" opacity="0.75"/>
      <g id="exhea-sun"><circle cx="36" cy="36" r="15" fill="${YELLOW}"/>
        <g stroke="${YELLOW}" stroke-width="3"><line x1="36" y1="10" x2="36" y2="14"/><line x1="36" y1="58" x2="36" y2="62"/><line x1="10" y1="36" x2="14" y2="36"/><line x1="58" y1="36" x2="62" y2="36"/></g></g>
      <g id="exhea-moon" opacity="0"><circle cx="36" cy="36" r="15" fill="${MUTED}"/><circle cx="43" cy="31" r="13" fill="${SOFT}"/></g>
      ${T(200, 20, '', { id: 'exhea-msg', size: 14, fill: PRIM })}
      ${T(100, 170, '', { id: 'exhea-land-t', size: 13, fill: '#fff' })}
      ${T(300, 170, '', { id: 'exhea-sea-t', size: 13, fill: '#fff' })}
      <g id="exhea-dots">${dots}</g>
      ${T(112, 84, '', { id: 'exhea-up', size: 13, fill: RED, anchor: 'start' })}
      ${T(288, 108, '', { id: 'exhea-down', size: 13, fill: BLUE, anchor: 'end' })}`,
      btnRow([{ id: 'exhea-day', label: '☀ Day' }, { id: 'exhea-night', label: '☾ Night' }]));
    const q = s => el.querySelector(s);
    const circles = [...el.querySelectorAll('.exhea-d')];
    let dir = 1, v = 1, s0 = 0;            // dir: +1 day, -1 night; v eases toward dir
    // perimeter loop, day direction: bottom (sea -> land), up over land, top (land -> sea), down over sea
    const segs = [[X.sea, BOT, X.land, BOT], [X.land, BOT, X.land, TOP], [X.land, TOP, X.sea, TOP], [X.sea, TOP, X.sea, BOT]];
    const lens = segs.map(s => Math.hypot(s[2] - s[0], s[3] - s[1])), total = lens.reduce((a, b) => a + b, 0);
    function pos(s) {
      s = ((s % total) + total) % total;
      for (let i = 0; i < 4; i++) {
        if (s <= lens[i]) { const k = s / lens[i], g = segs[i]; return [g[0] + (g[2] - g[0]) * k, g[1] + (g[3] - g[1]) * k]; }
        s -= lens[i];
      }
      return [X.sea, BOT];
    }
    function setMode(day) {
      dir = day ? 1 : -1;
      q('#exhea-sun').setAttribute('opacity', day ? 1 : 0);
      q('#exhea-moon').setAttribute('opacity', day ? 0 : 1);
      q('#exhea-land').setAttribute('fill', day ? ORANGE : PRIM);
      q('#exhea-msg').textContent = day ? 'Day: sea breeze blows sea → land' : 'Night: land breeze blows land → sea';
      q('#exhea-land-t').textContent = day ? 'LAND: heats fast' : 'LAND: cools fast';
      q('#exhea-sea-t').textContent = day ? 'SEA: heats slowly' : 'SEA: stays warmer';
      q('#exhea-up').textContent = day ? 'warm air rises' : 'cool air sinks';
      q('#exhea-down').textContent = day ? 'cool air sinks' : 'warm air rises';
      q('#exhea-up').setAttribute('fill', day ? RED : BLUE);
      q('#exhea-down').setAttribute('fill', day ? BLUE : RED);
      q('#exhea-day').style.borderColor = day ? 'var(--primary)' : '';
      q('#exhea-night').style.borderColor = day ? '' : 'var(--primary)';
    }
    q('#exhea-day').addEventListener('click', () => setMode(true));
    q('#exhea-night').addEventListener('click', () => setMode(false));
    setMode(true);
    api.loop((t, dt) => {
      v += (dir - v) * Math.min(1, dt * 2.5);
      s0 += v * 70 * dt;
      circles.forEach((c, i) => {
        const p = pos(s0 + (i * total) / circles.length);
        c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]);
        // warm (red) where air rises over the hotter surface, cool (blue) elsewhere
        const warmX = dir > 0 ? X.land : X.sea;
        c.setAttribute('fill', Math.abs(p[0] - warmX) < 1.5 || Math.abs(p[1] - TOP) < 1.5 ? RED : BLUE);
      });
    });
  }
  addTutorialSteps('physics', 'heat', [
    { kind: 'example', title: 'Real life: The sea breeze',
      text: '<p>At the beach, land heats up faster than water. Air over the hot sand warms, expands and rises, and cooler sea air flows in to replace it: a <b>convection</b> current. At night it reverses!</p>',
      mount: exheaBreezeMount }
  ]);

  // --- Metal vs wooden spoon in hot soup (SMIL) ---
  function exheaSpoonsSvg() {
    const dur = '10s';
    const overlay = (x, i, ends, peak) => {
      const y = 130 - i * 20;                       // segment i counts upward from the soup
      return `<rect x="${x - 6}" y="${y}" width="12" height="20" fill="${RED}" opacity="0">` +
        `<animate attributeName="opacity" dur="${dur}" repeatCount="indefinite" values="0;${peak};${peak};0" keyTimes="0;${ends};0.92;1"/></rect>`;
    };
    const bowl = cx => `
      <path d="M${cx - 62},150 L${cx + 62},150 Q${cx + 58},208 ${cx},210 Q${cx - 58},208 ${cx - 62},150 Z" fill="${SOFT}" stroke="${MUTED}" stroke-width="3"/>
      <path d="M${cx - 60},152 L${cx + 60},152 Q${cx + 56},200 ${cx},202 Q${cx - 56},200 ${cx - 60},152 Z" fill="${ORANGE}" opacity="0.85"/>
      <path d="M${cx + 30},142 q-8,-10 0,-20 q8,-10 0,-20" stroke="${MUTED}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6">
        <animate attributeName="opacity" values="0.15;0.7;0.15" dur="2.2s" repeatCount="indefinite"/></path>
      <path d="M${cx - 36},142 q-8,-10 0,-20 q8,-10 0,-20" stroke="${MUTED}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2.2s" repeatCount="indefinite"/></path>`;
    const metalEnds = [0.12, 0.23, 0.34, 0.45, 0.56], woodEnds = [0.5, 0.6, 0.7, 0.8, 0.9];
    const woodPeak = [0.5, 0.32, 0.18, 0.09, 0.04];
    let A = '', B = '';
    for (let i = 0; i < 5; i++) {
      A += overlay(100, i, metalEnds[i], 0.9);
      B += overlay(300, i, woodEnds[i] > 0.9 ? 0.9 : woodEnds[i], woodPeak[i]);
    }
    return TutorialKit.svg(`
      ${bowl(100)}${bowl(300)}
      <rect x="94" y="30" width="12" height="150" rx="6" fill="#b8c2cc" stroke="${MUTED}" stroke-width="1.5"/>
      <ellipse cx="100" cy="184" rx="15" ry="9" fill="#b8c2cc" stroke="${MUTED}" stroke-width="1.5"/>
      <rect x="294" y="30" width="12" height="150" rx="6" fill="#b07a4a" stroke="#6f4a26" stroke-width="1.5"/>
      <ellipse cx="300" cy="184" rx="15" ry="9" fill="#b07a4a" stroke="#6f4a26" stroke-width="1.5"/>
      <clipPath id="exhea-cpA"><rect x="94" y="30" width="12" height="150" rx="6"/></clipPath>
      <clipPath id="exhea-cpB"><rect x="294" y="30" width="12" height="150" rx="6"/></clipPath>
      <g clip-path="url(#exhea-cpA)">${A}</g><g clip-path="url(#exhea-cpB)">${B}</g>
      ${T(100, 232, 'Metal spoon', { size: 14 })}${T(300, 232, 'Wooden spoon', { size: 14 })}
      ${T(100, 20, 'Handle gets hot!', { size: 14, fill: RED, extra: 'opacity="0"' }).replace('</text>', '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.45;0.6;0.92;1" dur="10s" repeatCount="indefinite"/></text>')}
      ${T(300, 20, 'Handle stays cool', { size: 14, fill: GREEN, extra: 'opacity="0"' }).replace('</text>', '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.45;0.6;0.92;1" dur="10s" repeatCount="indefinite"/></text>')}`);
  }
  addTutorialSteps('physics', 'heat', [
    { kind: 'example', title: 'Real life: Metal vs wooden spoon in hot soup',
      text: '<p>Leave a metal spoon in hot soup and the handle soon burns your fingers. A wooden spoon stays cool. Metal is a good <b>conductor</b>, so heat travels up it fast; wood is an <b>insulator</b>.</p>',
      svg: exheaSpoonsSvg() }
  ]);

  // --- Thermos flask: which transfer is blocked by which part (SMIL) ---
  function exheaFlaskSvg() {
    let dots = '';
    const pts = [[92, 110], [112, 120], [134, 108], [156, 122], [172, 110], [98, 146], [122, 156], [148, 150], [170, 160], [104, 182], [132, 178], [160, 184]];
    pts.forEach((p, i) => {
      const dx = 3 + (i % 3), dy = 3 + ((i + 1) % 3), d = 0.5 + (i % 4) * 0.13;
      dots += `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${RED}"><animateTransform attributeName="transform" type="translate" values="0,0;${dx},-${dy};-${dx},${dy};0,0" dur="${d + 0.4}s" repeatCount="indefinite"/></circle>`;
    });
    const pulse = (begin, dur) => `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.75;1" dur="${dur}" begin="${begin}" repeatCount="indefinite"/>`;
    return TutorialKit.svg(`
      <rect x="50" y="56" width="160" height="160" rx="16" fill="none" stroke="#b8c2cc" stroke-width="5"/>
      <rect x="76" y="62" width="108" height="146" rx="10" fill="${ORANGE}" opacity="0.25" stroke="#b8c2cc" stroke-width="4"/>
      <rect x="80" y="100" width="100" height="104" rx="6" fill="${ORANGE}" opacity="0.55"/>
      <rect x="100" y="28" width="60" height="42" rx="6" fill="${MUTED}"/>
      ${dots}
      <g opacity="0">${arrow(100, 132, 60, 132, RED, 4)}${pulse('0s', '2.4s')}</g>
      <g opacity="0">${T(56, 128, '✕', { size: 18, fill: RED })}${pulse('0.6s', '2.4s')}</g>
      <g opacity="0">${arrow(130, 96, 130, 76, RED, 4)}${pulse('0.2s', '2.4s')}</g>
      <g opacity="0">${arrow(140, 196, 179, 178, YELLOW, 4)}${pulse('0s', '2.4s')}</g>
      <g opacity="0">${arrow(179, 178, 140, 158, YELLOW, 4)}${pulse('1.0s', '2.4s')}</g>
      <line x1="216" y1="70" x2="164" y2="52" stroke="${MUTED}" stroke-width="2"/>
      <line x1="216" y1="128" x2="197" y2="128" stroke="${MUTED}" stroke-width="2"/>
      <line x1="216" y1="190" x2="208" y2="190" stroke="${MUTED}" stroke-width="2"/>
      ${T(222, 66, 'Stopper', { size: 14, anchor: 'start', fill: PRIM })}${T(222, 82, 'stops convection', { size: 13, anchor: 'start', weight: 600 })}
      ${T(222, 124, 'Vacuum gap', { size: 14, anchor: 'start', fill: PRIM })}${T(222, 140, 'stops conduction', { size: 13, anchor: 'start', weight: 600 })}
      ${T(222, 186, 'Shiny walls', { size: 14, anchor: 'start', fill: PRIM })}${T(222, 202, 'reflect radiation', { size: 13, anchor: 'start', weight: 600 })}
      ${T(130, 20, 'Hot drink stays hot', { size: 14, fill: RED })}`);
  }
  addTutorialSteps('physics', 'heat', [
    { kind: 'example', title: 'Real life: How a thermos keeps drinks hot',
      text: '<p>A thermos fights all three kinds of heat loss: a <b>vacuum</b> gap has no particles to conduct or carry heat, a stopper traps warm air, and shiny walls <b>reflect radiation</b> back inside.</p>',
      svg: exheaFlaskSvg() }
  ]);

  // ===================== WAVES =====================

  // --- Thunder and lightning: light is much faster than sound (interactive distance) ---
  function exwavThunderMount(el, api) {
    const PX = 40, SPEED = 343;                       // person x; speed of sound in air (m/s)
    const svg = scene(el, '0 0 400 190', `
      <clipPath id="exwav-clip"><rect x="0" y="0" width="400" height="150"/></clipPath>
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <rect id="exwav-flash" x="0" y="0" width="400" height="150" fill="${YELLOW}" opacity="0"/>
      <rect x="0" y="150" width="400" height="40" fill="${GREEN}" opacity="0.45"/>
      <g clip-path="url(#exwav-clip)"><circle id="exwav-ring" cx="300" cy="150" r="0" fill="none" stroke="${BLUE}" stroke-width="5" opacity="0.8"/>
        <circle id="exwav-ring2" cx="300" cy="150" r="0" fill="none" stroke="${BLUE}" stroke-width="3" opacity="0.5"/></g>
      <g id="exwav-storm">
        <ellipse cx="0" cy="50" rx="32" ry="16" fill="${MUTED}"/><ellipse cx="-18" cy="58" rx="20" ry="11" fill="${MUTED}"/><ellipse cx="18" cy="58" rx="20" ry="11" fill="${MUTED}"/>
        <polygon id="exwav-bolt" points="4,62 -8,96 0,96 -6,138 14,88 5,88 12,62" fill="${YELLOW}" stroke="${ORANGE}" stroke-width="1.5" opacity="0"/></g>
      <line id="exwav-beam" x1="0" y1="112" x2="0" y2="112" stroke="${YELLOW}" stroke-width="3" stroke-dasharray="6 5" opacity="0"/>
      <g id="exwav-person"><circle cx="${PX}" cy="118" r="9" fill="${ORANGE}"/><rect x="${PX - 8}" y="128" width="16" height="22" rx="5" fill="${PRIM}"/></g>
      ${T(PX, 104, 'You', { size: 13, fill: PRIM })}
      ${T(10, 20, '', { id: 'exwav-clock', size: 14, anchor: 'start', fill: PRIM })}
      ${T(10, 166, '', { id: 'exwav-see', size: 13, anchor: 'start', fill: ORANGE })}
      ${T(390, 166, '', { id: 'exwav-hear', size: 14, anchor: 'end', fill: BLUE })}
      ${T(200, 184, '', { id: 'exwav-res', size: 14, fill: INK })}`,
      sliderRow('Distance', 'exwav-d', 0.5, 3, 0.1, 2, '2.0 km'));
    const q = s => el.querySelector(s), sl = q('#exwav-d');
    let t0 = 0;
    const restart = () => { t0 = -1; };
    sl.addEventListener('input', () => { q('#exwav-d-v').textContent = f1(+sl.value) + ' km'; restart(); });
    api.loop((t) => {
      if (t0 < 0) t0 = t;
      const km = +sl.value, delay = km * 1000 / SPEED;
      const sx = PX + 30 + (km - 0.5) / 2.5 * 290, dist = sx - PX;
      const e = t - t0 - 0.6;                          // seconds since the flash (negative = before it)
      q('#exwav-storm').setAttribute('transform', `translate(${sx} 0)`);
      const flashOn = e >= 0 && e < 0.25;
      q('#exwav-bolt').setAttribute('opacity', flashOn ? 1 : 0);
      q('#exwav-flash').setAttribute('opacity', flashOn ? 0.35 : 0);
      const b = q('#exwav-beam');
      b.setAttribute('x1', PX + 12); b.setAttribute('x2', sx - 8); b.setAttribute('opacity', flashOn ? 1 : 0);
      const shown = clamp(e, 0, delay), arrived = e >= delay;
      const r = e < 0 ? 0 : clamp(e / delay, 0, 1) * (dist - 12);
      [['#exwav-ring', r], ['#exwav-ring2', Math.max(0, r - 14)]].forEach(([id, rr]) => {
        const c = q(id); c.setAttribute('cx', sx); c.setAttribute('r', arrived ? 0 : rr);
      });
      q('#exwav-clock').textContent = e < 0 ? 'Waiting for lightning…' : 'Time since flash: ' + f1(shown) + ' s';
      q('#exwav-see').textContent = e >= 0 ? 'You SEE the flash: 0 s' : '';
      q('#exwav-hear').textContent = arrived ? 'You HEAR thunder: ' + f1(delay) + ' s' : (e >= 0 ? 'Sound still travelling…' : '');
      q('#exwav-res').textContent = arrived ? `${f1(delay)} s delay ≈ ${f1(km)} km away (about 3 s per km)` : '';
      if (e > delay + 2.2) t0 = t;                     // loop the storm
    });
  }
  addTutorialSteps('physics', 'waves', [
    { kind: 'example', title: 'Real life: Thunder and lightning',
      text: '<p>Lightning and thunder happen together, but you see the flash first. Light travels almost instantly; sound moves at about 343 m/s (roughly 3 s per km). Slide the storm farther away and the delay grows.</p>',
      mount: exwavThunderMount }
  ]);

  // --- Guitar string: shorter string, higher frequency, higher pitch (interactive) ---
  function exwavGuitarMount(el, api) {
    const X0 = 30, XB = 370, Y = 84;                 // nut (start of string) and bridge
    let frets = '';
    for (let i = 1; i <= 8; i++) frets += `<line x1="${X0 + i * 36}" y1="66" x2="${X0 + i * 36}" y2="102" stroke="#c9ced6" stroke-width="2"/>`;
    scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <rect x="240" y="34" width="150" height="100" rx="40" fill="#c58a4f" stroke="#7a4d22" stroke-width="3"/>
      <circle cx="292" cy="84" r="22" fill="#4a2f16"/>
      <rect x="${X0}" y="66" width="230" height="36" fill="#7a4d22"/>${frets}
      <rect x="${XB - 3}" y="72" width="6" height="24" rx="2" fill="#4a2f16"/>
      <line id="exwav-still" x1="${X0}" y1="${Y}" x2="${X0}" y2="${Y}" stroke="${MUTED}" stroke-width="2"/>
      <polyline id="exwav-str" points="" fill="none" stroke="#e6e9ee" stroke-width="3" stroke-linejoin="round"/>
      <circle id="exwav-fing" cx="${X0}" cy="${Y}" r="8" fill="${ORANGE}" stroke="#fff" stroke-width="2"/>
      ${T(200, 22, '', { id: 'exwav-len', size: 14, fill: PRIM })}
      ${T(200, 150, '', { id: 'exwav-freq', size: 15, fill: INK })}
      ${T(200, 170, 'Vibration slowed down so you can see it', { size: 13, fill: MUTED, weight: 600 })}`,
      sliderRow('String', 'exwav-L', 30, 100, 1, 100, '100%'));
    const q = s => el.querySelector(s), sl = q('#exwav-L');
    const str = q('#exwav-str'), still = q('#exwav-still'), fing = q('#exwav-fing');
    let phase = 0;
    function draw() {
      const frac = +sl.value / 100, L = (XB - X0) * frac, xf = XB - L;
      const f = 110 / frac;                            // fixed tension: f is proportional to 1 / length
      q('#exwav-L-v').textContent = sl.value + '%';
      q('#exwav-len').textContent = 'Vibrating length: ' + sl.value + '%';
      q('#exwav-freq').textContent = 'Frequency: ' + Math.round(f) + ' Hz  (' + (frac > 0.85 ? 'low pitch' : frac > 0.55 ? 'medium pitch' : 'high pitch') + ')';
      still.setAttribute('x2', xf); fing.setAttribute('cx', xf); fing.setAttribute('opacity', frac < 0.995 ? 1 : 0);
      return { frac, L, xf, f };
    }
    sl.addEventListener('input', draw);
    draw();
    api.loop((t) => {
      const { L, xf, f } = draw();
      const amp = 9 * Math.cos(2 * Math.PI * (f / 110) * 1.3 * t);   // visual rate proportional to real frequency
      let pts = '';
      for (let i = 0; i <= 40; i++) { const x = xf + L * i / 40; pts += `${x.toFixed(1)},${(Y + amp * Math.sin(Math.PI * i / 40)).toFixed(1)} `; }
      str.setAttribute('points', pts);
    });
  }
  addTutorialSteps('physics', 'waves', [
    { kind: 'example', title: 'Real life: Guitar strings and pitch',
      text: '<p>Pressing a guitar string at a fret makes the vibrating part shorter. A shorter string vibrates faster, so its <b>frequency</b> is higher and the sound has a higher <b>pitch</b>. Slide to shorten the string.</p>',
      mount: exwavGuitarMount }
  ]);

  // --- Echo off a cliff: sound reflects, round trip takes time (SMIL) ---
  function exwavEchoSvg() {
    const dur = '5s';
    const arcs = (dx) => `<path d="M0,-30 Q${dx},0 0,30" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/><path d="M-14,-24 Q${dx - 6},0 -14,24" fill="none" stroke="${BLUE}" stroke-width="3" stroke-linecap="round" opacity="0.55" transform="translate(${dx > 0 ? -2 : 16} 0)"/>`;
    return TutorialKit.svg(`
      <rect x="0" y="0" width="400" height="240" fill="${SOFT}" rx="8"/>
      <rect x="0" y="176" width="400" height="64" fill="${GREEN}" opacity="0.45"/>
      <polygon points="336,176 344,60 372,30 400,30 400,176" fill="${MUTED}" opacity="0.8"/>
      ${T(374, 96, 'CLIFF', { size: 14, fill: '#fff' })}
      <circle cx="50" cy="132" r="10" fill="${ORANGE}"/><rect x="42" y="142" width="16" height="34" rx="5" fill="${PRIM}"/>
      <g fill="none" stroke="${MUTED}" stroke-width="2"><line x1="60" y1="52" x2="330" y2="52"/><line x1="60" y1="46" x2="60" y2="58"/><line x1="330" y1="46" x2="330" y2="58"/></g>
      ${T(195, 44, '170 m', { size: 14, fill: MUTED })}
      <g opacity="0"><g>${arcs(12)}<animateTransform attributeName="transform" type="translate" values="70 140;318 140;318 140" keyTimes="0;0.5;1" dur="${dur}" repeatCount="indefinite"/></g>
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.47;0.5;1" dur="${dur}" repeatCount="indefinite"/></g>
      <g opacity="0"><g>${arcs(-12)}<animateTransform attributeName="transform" type="translate" values="318 140;318 140;76 140" keyTimes="0;0.5;1" dur="${dur}" repeatCount="indefinite"/></g>
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.5;0.52;0.97;1" dur="${dur}" repeatCount="indefinite"/></g>
      <g opacity="0">${T(50, 108, 'Hello!', { size: 15, fill: PRIM })}<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.15;0.2;1" dur="${dur}" repeatCount="indefinite"/></g>
      <g opacity="0">${T(52, 108, 'Hello!', { size: 15, fill: BLUE })}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.9;0.93;0.99;1" dur="${dur}" repeatCount="indefinite"/></g>
      ${T(200, 203, 'There and back: 170 m + 170 m = 340 m', { size: 14 })}
      ${T(200, 226, '340 m ÷ 343 m/s ≈ 1 s later you hear the echo', { size: 14, fill: PRIM })}`);
  }
  addTutorialSteps('physics', 'waves', [
    { kind: 'example', title: 'Real life: Echoes',
      text: '<p>Shout toward a cliff and your voice comes back. The sound wave <b>reflects</b> off the hard surface, just like light off a mirror. The echo arrives late because sound must travel there and back (shown in slow motion).</p>',
      svg: exwavEchoSvg() }
  ]);

  // ===================== ELECTRICITY =====================

  // --- Fuse: too many appliances -> overload -> fuse wire melts (interactive) ---
  function exeleFuseMount(el, api) {
    const BX = [230, 290, 350], TOPY = 40, BOTY = 150, LIM = 5, EACH = 2;
    const names = ['Lamp', 'Fan', 'Heater'];
    let branches = '';
    BX.forEach((x, i) => {
      branches += `<g id="exele-b${i}" opacity="0.25"><line x1="${x}" y1="${TOPY}" x2="${x}" y2="${BOTY}" stroke="${MUTED}" stroke-width="4"/>` +
        `<circle id="exele-glow${i}" cx="${x}" cy="84" r="20" fill="${YELLOW}" opacity="0"/>` +
        `<circle cx="${x}" cy="84" r="13" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>` +
        `<rect x="${x - 26}" y="106" width="52" height="18" rx="4" fill="${SOFT}"/>${T(x, 120, names[i], { size: 13 })}</g>`;
    });
    let dots = '';
    for (let i = 0; i < 9; i++) dots += `<circle class="exele-md" r="4" fill="${TEAL}"/>`;
    for (let i = 0; i < 9; i++) dots += `<circle class="exele-bd" data-b="${Math.floor(i / 3)}" r="4" fill="${TEAL}"/>`;
    scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <polyline points="40,${BOTY} 40,${TOPY} ${BX[2]},${TOPY}" fill="none" stroke="${MUTED}" stroke-width="4"/>
      <polyline points="40,${BOTY} ${BX[2]},${BOTY}" fill="none" stroke="${MUTED}" stroke-width="4"/>
      <rect x="26" y="78" width="28" height="30" fill="${SOFT}"/>
      <line x1="26" y1="86" x2="54" y2="86" stroke="${INK}" stroke-width="4"/><line x1="33" y1="98" x2="47" y2="98" stroke="${INK}" stroke-width="6"/>
      ${T(66, 82, '+', { size: 15, anchor: 'start', fill: RED })}
      ${branches}
      <rect x="98" y="30" width="54" height="20" rx="6" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
      <line id="exele-fw" x1="100" y1="40" x2="150" y2="40" stroke="${MUTED}" stroke-width="3"/>
      <line id="exele-fw2" x1="138" y1="40" x2="150" y2="40" stroke="${MUTED}" stroke-width="3" opacity="0"/>
      <g id="exele-spark" opacity="0"><polygon points="125,26 118,40 127,40 120,54 134,36 126,36" fill="${YELLOW}" stroke="${ORANGE}" stroke-width="1"/></g>
      ${T(125, 68, 'Fuse: 5 A', { size: 13, fill: PRIM })}
      ${dots}
      ${T(200, 18, '', { id: 'exele-rd', size: 14, fill: INK })}
      ${T(200, 178, '', { id: 'exele-msg', size: 14, fill: PRIM })}`,
      btnRow([{ id: 'exele-add', label: '+ Plug in appliance' }, { id: 'exele-rst', label: 'Reset fuse' }]));
    const q = s => el.querySelector(s);
    const md = [...el.querySelectorAll('.exele-md')], bd = [...el.querySelectorAll('.exele-bd')];
    let n = 0, heat = 0, blown = false, s0 = 0;
    const mainLen = (BOTY - TOPY) + (BX[0] - 40);
    function ui() {
      const I = blown ? 0 : n * EACH;
      BX.forEach((x, i) => {
        q('#exele-b' + i).setAttribute('opacity', i < n ? 1 : 0.25);
        q('#exele-glow' + i).setAttribute('opacity', i < n && !blown ? 0.9 : 0);
      });
      q('#exele-rd').textContent = blown ? 'Current: 0 A (circuit broken)' : `Current: ${n * EACH} A  (each appliance draws ${EACH} A)`;
      q('#exele-msg').textContent = blown ? 'Fuse melted: circuit open, power off'
        : n === 0 ? 'Plug in appliances one by one' : n * EACH > LIM ? 'Over 5 A! The fuse wire is heating up…' : 'Under the 5 A limit: all fine';
      q('#exele-msg').setAttribute('fill', blown || n * EACH > LIM ? RED : PRIM);
            q('#exele-add').disabled = blown || n >= 3;
      return I;
    }
    q('#exele-add').addEventListener('click', () => { if (n < 3 && !blown) { n++; ui(); } });
    q('#exele-rst').addEventListener('click', () => { n = 0; heat = 0; blown = false; ui(); });
    ui();
    api.loop((t, dt) => {
      const I = blown ? 0 : n * EACH;
      if (!blown) {
        heat = clamp(heat + (I > LIM ? (I - LIM) * 0.5 * dt : -0.4 * dt), 0, 1);
        if (heat >= 1) { blown = true; ui(); }
      }
      const fw = q('#exele-fw');
      q('#exele-fw2').setAttribute('opacity', blown ? 1 : 0);
      if (blown) { fw.setAttribute('x1', 100); fw.setAttribute('x2', 112); fw.setAttribute('stroke', MUTED); fw.setAttribute('stroke-width', 3); }
      else { fw.setAttribute('x1', 100); fw.setAttribute('x2', 150); fw.setAttribute('stroke', heat > 0.66 ? RED : heat > 0.2 ? ORANGE : MUTED); fw.setAttribute('stroke-width', 3 + heat); }
      q('#exele-spark').setAttribute('opacity', blown && (t * 6) % 1 < 0.5 && heat >= 1 ? 1 : 0);
      if (blown && q('#exele-spark').getAttribute('data-t') === null) q('#exele-spark').setAttribute('data-t', t);
      if (blown && t - +q('#exele-spark').getAttribute('data-t') > 1) q('#exele-spark').setAttribute('opacity', 0);
      if (!blown) q('#exele-spark').removeAttribute('data-t');
      s0 += I * 14 * dt;
      md.forEach((c, i) => {
        c.setAttribute('opacity', I > 0 ? 1 : 0);
        let s = ((s0 + i * mainLen / md.length) % mainLen + mainLen) % mainLen;
        let x, y;
        if (s < BOTY - TOPY) { x = 40; y = BOTY - s; } else { x = 40 + (s - (BOTY - TOPY)); y = TOPY; }
        if (y === TOPY && x > 96 && x < 154) c.setAttribute('opacity', 0); // hidden while over the fuse body
        c.setAttribute('cx', x); c.setAttribute('cy', y);
      });
      bd.forEach((c, i) => {
        const b = +c.dataset.b, k = i % 3, on = b < n && !blown;
        c.setAttribute('opacity', on ? 1 : 0);
        const len = BOTY - TOPY, s = (s0 * 1.2 + k * len / 3) % len;
        c.setAttribute('cx', BX[b]); c.setAttribute('cy', TOPY + s);
      });
    });
  }
  addTutorialSteps('physics', 'electricity', [
    { kind: 'example', title: 'Real life: Why a fuse blows',
      text: '<p>Appliances in a home are wired in parallel, so each one adds current. Too many at once makes a big current that overheats wires. A <b>fuse</b> has a thin wire that melts first, breaking the circuit.</p>',
      mount: exeleFuseMount }
  ]);

  // --- Bicycle dynamo: motion -> electricity (interactive speed) ---
  function exeleDynamoMount(el, api) {
    const WX = 80, WY = 104, MX = 220, MY = 106;
    let spokes = '';
    for (let i = 0; i < 8; i++) spokes += `<line x1="0" y1="0" x2="0" y2="-54" stroke="${MUTED}" stroke-width="2.5" transform="rotate(${i * 45})"/>`;
    let coil = '';
    [206, 220, 234].forEach(cx => { coil += `<ellipse cx="${cx}" cy="${MY}" rx="15" ry="44" fill="none" stroke="${ORANGE}" stroke-width="4"/>`; });
    let dots = '';
    for (let i = 0; i < 12; i++) dots += `<circle class="exele-dd" r="4" fill="${TEAL}"/>`;
    scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <circle cx="${WX}" cy="${WY}" r="60" fill="none" stroke="${INK}" stroke-width="8"/>
      <g id="exele-wheel" transform="translate(${WX} ${WY})">${spokes}<circle r="5" fill="${INK}"/></g>
      <circle cx="${WX + 66}" cy="${WY}" r="8" fill="${MUTED}" stroke="${INK}" stroke-width="2"/>
      <line x1="${WX + 66}" y1="${WY}" x2="${MX}" y2="${MY}" stroke="${MUTED}" stroke-width="4" stroke-dasharray="6 4"/>
      <polyline points="${MX},${MY - 44} ${MX},32 340,32 340,168 ${MX},168 ${MX},${MY + 44}" fill="none" stroke="${MUTED}" stroke-width="3"/>
      ${coil}
      <g id="exele-mag" transform="translate(${MX} ${MY})"><rect x="-26" y="-9" width="26" height="18" fill="${RED}"/><rect x="0" y="-9" width="26" height="18" fill="${BLUE}"/>
        ${T(-13, 5, 'N', { size: 13, fill: '#fff' })}${T(13, 5, 'S', { size: 13, fill: '#fff' })}</g>
      <circle id="exele-lampglow" cx="340" cy="100" r="34" fill="${YELLOW}" opacity="0"/>
      <circle cx="340" cy="100" r="15" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
      ${dots}
      ${T(WX, 184, 'Wheel', { size: 13 })}${T(MX, 186, 'Magnet spins in coil', { size: 13 })}${T(372, 152, 'Lamp', { size: 13 })}
      ${T(200, 16, '', { id: 'exele-volt', size: 14, fill: PRIM })}`,
      sliderRow('Speed', 'exele-sp', 0, 100, 1, 60, '60%'));
    const q = s => el.querySelector(s), sl = q('#exele-sp'), dd = [...el.querySelectorAll('.exele-dd')];
    // closed path through the coil ends, top wire, lamp side and bottom wire
    const pts = [[MX, MY - 44], [MX, 32], [340, 32], [340, 168], [MX, 168], [MX, MY + 44]];
    const segLen = [], N = pts.length - 1; let total = 0;
    for (let i = 0; i < N; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segLen.push(l); total += l; }
    function at(s) {
      s = clamp(s, 0, total);
      for (let i = 0; i < N; i++) { if (s <= segLen[i] || i === N - 1) { const k = s / segLen[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } s -= segLen[i]; }
      return pts[0];
    }
    let wa = 0, ma = 0;
    sl.addEventListener('input', () => { q('#exele-sp-v').textContent = sl.value + '%'; });
    api.loop((t, dt) => {
      const sp = +sl.value / 100;
      wa += sp * 4 * dt; ma += sp * 12 * dt;
      q('#exele-wheel').setAttribute('transform', `translate(${WX} ${WY}) rotate(${wa * 180 / Math.PI})`);
      q('#exele-mag').setAttribute('transform', `translate(${MX} ${MY}) rotate(${ma * 180 / Math.PI})`);
      q('#exele-lampglow').setAttribute('opacity', (0.95 * sp).toFixed(2));
      q('#exele-volt').textContent = sp < 0.02 ? 'Wheel stopped: no voltage, lamp off' : `Output ≈ ${f1(6 * sp)} V (alternating current)`;
      // alternating current: charges slosh back and forth, amplitude grows with speed
      const swing = Math.sin(ma) * 26 * sp;
      dd.forEach((c, i) => { const p = at(i * total / dd.length + swing + 13); c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('opacity', sp < 0.02 ? 0.3 : 1); });
    });
  }
  addTutorialSteps('physics', 'electricity', [
    { kind: 'example', title: 'Real life: A bicycle dynamo',
      text: '<p>A bike dynamo turns motion into electricity. The wheel spins a magnet inside a coil, which pushes charges around the wire. Pedal faster and the magnet spins faster, so the voltage rises and the lamp gets brighter.</p>',
      mount: exeleDynamoMount }
  ]);

  // --- Compass needle deflects when current flows in a nearby wire (SMIL) ---
  function exeleCompassSvg() {
    const D = '8s', KT = '0;0.3;0.34;0.8;0.84;1';
    const on = (inner, extra) => `<g opacity="0">${inner}<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="${KT}" dur="${D}" repeatCount="indefinite"/></g>`;
    const off = inner => `<g opacity="1">${inner}<animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="${KT}" dur="${D}" repeatCount="indefinite"/></g>`;
    const R = a => `${a} 200 120`;
    return TutorialKit.svg(`
      <rect x="0" y="0" width="400" height="240" fill="${SOFT}" rx="8"/>
      <circle cx="200" cy="120" r="50" fill="#fff" stroke="${MUTED}" stroke-width="4"/>
      ${T(153, 125, 'W', { size: 13, fill: MUTED })}${T(247, 125, 'E', { size: 13, fill: MUTED })}${T(218, 80, 'N', { size: 13, fill: RED })}${T(218, 168, 'S', { size: 13, fill: MUTED })}
      ${on(`<line x1="200" y1="25" x2="200" y2="215" stroke="${BLUE}" stroke-width="30" opacity="0.28" stroke-linecap="round"/>`)}
      <g id="exele-needle"><polygon points="200,76 192,120 208,120" fill="${RED}"/><polygon points="200,164 192,120 208,120" fill="${MUTED}"/><circle cx="200" cy="120" r="4" fill="${INK}"/>
        <animateTransform attributeName="transform" type="rotate" values="${R(0)};${R(0)};${R(50)};${R(34)};${R(42)};${R(42)};${R(-6)};${R(0)};${R(0)}" keyTimes="0;0.3;0.38;0.43;0.48;0.8;0.86;0.9;1" dur="${D}" repeatCount="indefinite"/></g>
      <polyline points="60,105 60,25 110,25" fill="none" stroke="${INK}" stroke-width="4"/>
      <polyline points="150,25 200,25 200,215 60,215 60,135" fill="none" stroke="${INK}" stroke-width="4"/>
      <line x1="44" y1="105" x2="76" y2="105" stroke="${INK}" stroke-width="4"/><line x1="51" y1="118" x2="69" y2="118" stroke="${INK}" stroke-width="7"/>
      ${T(88, 112, '+', { size: 15, fill: RED })}${T(108, 146, 'Battery', { size: 13 })}
      <line x1="110" y1="25" x2="150" y2="25" stroke="${INK}" stroke-width="4" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-28 110 25;-28 110 25;0 110 25;0 110 25;-28 110 25;-28 110 25" keyTimes="${KT}" dur="${D}" repeatCount="indefinite"/></line>
      <circle cx="110" cy="25" r="4" fill="${INK}"/><circle cx="150" cy="25" r="4" fill="${INK}"/>
      ${T(130, 52, 'Switch', { size: 13 })}
      ${on(`<path d="M60,105 L60,25 L110,25 M150,25 L200,25 L200,215 L60,215 L60,135" fill="none" stroke="${YELLOW}" stroke-width="3" stroke-dasharray="6 10"><animate attributeName="stroke-dashoffset" values="16;0" dur="0.6s" repeatCount="indefinite"/></path>${arrow(60, 82, 60, 58, RED, 4)}${arrow(200, 176, 200, 200, RED, 4)}`)}
      ${off(T(320, 58, 'Switch OFF', { size: 16, fill: MUTED }) + T(320, 80, 'Needle points north', { size: 13, fill: MUTED }))}
      ${on(T(320, 58, 'Switch ON', { size: 16, fill: RED }) + T(320, 80, 'Needle swings!', { size: 14, fill: RED }))}
      ${T(320, 150, 'Current in a wire', { size: 13, weight: 600 })}${T(320, 168, 'makes a magnetic', { size: 13, weight: 600 })}${T(320, 186, 'field that turns', { size: 13, weight: 600 })}${T(320, 204, 'the compass needle', { size: 13, weight: 600 })}`);
  }
  addTutorialSteps('physics', 'electricity', [
    { kind: 'example', title: 'Real life: Current moves a compass needle',
      text: '<p>A compass needle is a tiny magnet. Switch on a current in a nearby wire and the needle swings away from north: <b>moving charges make a magnetic field</b>. This link between electricity and magnetism is how electromagnets work.</p>',
      svg: exeleCompassSvg() }
  ]);

})();
