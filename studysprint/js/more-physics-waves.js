(function () {
  'use strict';
  // more-physics-waves: five more real-life example steps for Light & Sound (namespace mwav-).

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
  // Mount an <svg> that shares the container with a control row.
  function scene(el, vb, inner, rows) {
    el.innerHTML = `<svg viewBox="${vb}" xmlns="${NS}" role="img" preserveAspectRatio="xMidYMid meet" style="flex:1 1 0;min-height:0;width:100%;height:auto">${inner}</svg>${rows || ''}`;
    return el.querySelector('svg');
  }

  // --- 1. Ambulance siren: the Doppler effect (interactive speed) ---
  function mwavDopplerMount(el, api) {
    const F0 = 700, C = 343, CVIS = 100, GY = 150, MAXR = 240;
    let pool = '';
    for (let i = 0; i < 12; i++) pool += `<circle class="mwav-front" cx="0" cy="136" r="0" fill="none" stroke="${BLUE}" stroke-width="2.5" opacity="0"/>`;
    const person = (x, name) => `<circle cx="${x}" cy="122" r="8" fill="${ORANGE}"/><rect x="${x - 7}" y="131" width="14" height="19" rx="4" fill="${PRIM}"/>${T(x, 108, name, { size: 13, fill: PRIM })}`;
    scene(el, '0 0 400 190', `
      <clipPath id="mwav-dclip"><rect x="0" y="24" width="400" height="126"/></clipPath>
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <rect x="0" y="${GY}" width="400" height="40" fill="${GREEN}" opacity="0.45"/>
      <g clip-path="url(#mwav-dclip)">${pool}</g>
      ${person(45, 'Behind')}${person(355, 'Ahead')}
      <g id="mwav-amb" transform="translate(200 ${GY})">
        <rect x="-26" y="-28" width="34" height="24" rx="3" fill="#f8fafc" stroke="${MUTED}" stroke-width="2"/>
        <path d="M8,-28 L20,-28 L28,-16 L28,-4 L8,-4 Z" fill="#f8fafc" stroke="${MUTED}" stroke-width="2"/>
        <rect x="-4" y="-25" width="4" height="12" fill="${RED}"/><rect x="-8" y="-21" width="12" height="4" fill="${RED}"/>
        <rect x="-26" y="-9" width="54" height="3" fill="${RED}"/>
        <rect id="mwav-lite" x="-12" y="-34" width="14" height="6" rx="2" fill="${RED}"/>
        <circle cx="-14" cy="-2" r="6" fill="${INK}"/><circle cx="16" cy="-2" r="6" fill="${INK}"/></g>
      ${T(10, 16, 'Siren: 700 Hz when parked', { size: 13, anchor: 'start' })}
      ${T(390, 16, 'Waves exaggerated', { size: 12, anchor: 'end', fill: MUTED, weight: 600 })}
      ${T(70, 169, '', { id: 'mwav-hb', size: 13, fill: INK })}${T(70, 185, '', { id: 'mwav-pb', size: 13, fill: PRIM })}
      ${T(330, 169, '', { id: 'mwav-ha', size: 13, fill: INK })}${T(330, 185, '', { id: 'mwav-pa', size: 13, fill: PRIM })}`,
      sliderRow('Speed', 'mwav-sp', 0, 100, 5, 60, '60 km/h'));
    const q = s => el.querySelector(s), sl = q('#mwav-sp'), circles = [...el.querySelectorAll('.mwav-front')];
    const fronts = [];                      // { x, age }
    let x = 110, since = 0, lite = 0;
    sl.addEventListener('input', () => { q('#mwav-sp-v').textContent = sl.value + ' km/h'; });
    api.loop((t, dt) => {
      const kmh = +sl.value, v = kmh / 3.6;
      const vis = kmh / 100 * 0.5 * CVIS;       // picture speed: exaggerated so the bunching can be seen
      if (kmh === 0) x = 200; else x += vis * dt;
      if (x > 290) { x = 110; fronts.length = 0; }
      since += dt; lite += dt;
      if (since >= 0.3) { since = 0; fronts.push({ x, age: 0 }); if (fronts.length > 12) fronts.shift(); }
      fronts.forEach(f => { f.age += dt; });
      while (fronts.length && fronts[0].age * CVIS > MAXR) fronts.shift();
      circles.forEach((c, i) => {
        const f = fronts[i];
        if (!f) { c.setAttribute('opacity', 0); return; }
        const r = f.age * CVIS;
        c.setAttribute('cx', f.x); c.setAttribute('r', r.toFixed(1));
        c.setAttribute('opacity', (0.9 * (1 - r / MAXR)).toFixed(2));
      });
      q('#mwav-amb').setAttribute('transform', `translate(${x.toFixed(1)} ${GY})`);
      q('#mwav-lite').setAttribute('fill', Math.floor(lite / 0.25) % 2 ? BLUE : RED);
      const ahead = Math.round(F0 * C / (C - v)), behind = Math.round(F0 * C / (C + v));
      q('#mwav-ha').textContent = 'Ahead: ' + ahead + ' Hz'; q('#mwav-hb').textContent = 'Behind: ' + behind + ' Hz';
      q('#mwav-pa').textContent = kmh ? 'higher pitch' : 'same pitch'; q('#mwav-pb').textContent = kmh ? 'lower pitch' : 'same pitch';
    });
  }

  addTutorialSteps('physics', 'waves', [
    { kind: 'example', title: 'Real life: The ambulance siren',
      text: '<p>An ambulance sounds higher-pitched as it comes toward you and lower as it drives away, though the siren never changes. This is the <b>Doppler effect</b>: a moving source bunches waves up in front and stretches them out behind.</p>',
      explain: '<p>An <b>ambulance</b> drives right, past a person marked <b>Ahead</b> on the right and one marked <b>Behind</b> on the left. Blue circles are sound wave fronts sent out by the siren: they bunch up in front and spread out behind. Labels give the pitch each person hears in hertz. The <b>Speed</b> slider changes it; the waves are drawn exaggerated.</p>',
      say: 'Watch the ambulance drive to the right. Its siren makes sound waves, and the blue circles show each wave front spreading out. Look closely. In front of the ambulance, the circles are squeezed close together. Behind it, they are stretched far apart. Squeezed waves mean a higher frequency, so the person ahead hears a higher pitch. Stretched waves mean a lower pitch for the person behind. This is called the Doppler effect. The picture is exaggerated, because a real ambulance is much slower than sound, but the numbers in hertz are the real ones. Now drag the speed slider. At zero, both people hear exactly seven hundred hertz. Speed up, and the two pitches move apart.',
      mount: mwavDopplerMount }
  ]);

  // --- 2. Rainbow from a prism: dispersion (ray-traced with Snell's law) ---
  function mwavPrismSvg() {
    const A = [200, 62], B = [140, 166], C = [260, 166], P1 = [170, 114];
    const deg = Math.PI / 180, dIn = [Math.cos(-20 * deg), Math.sin(-20 * deg)];
    const nOutAB = [-0.866025, -0.5], nInAC = [-0.866025, 0.5];      // normals facing the side the ray comes from
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    function refract(d, n, eta) {                                     // n faces the incoming ray; eta = n1 / n2
      const c = -dot(n, d), k = 1 - eta * eta * (1 - c * c);
      const s = eta * c - Math.sqrt(k);
      return [eta * d[0] + s * n[0], eta * d[1] + s * n[1]];
    }
    const cols = [['Red', '#ff3b3b', 1.520], ['Orange', '#ff9a2e', 1.535], ['Yellow', '#ffe14d', 1.550], ['Green', '#3ddc6b', 1.565],
      ['Blue', '#3aa0ff', 1.585], ['Indigo', '#6b6bff', 1.603], ['Violet', '#b86bff', 1.620]];
    const u = [C[0] - A[0], C[1] - A[1]];
    const start = [P1[0] - 145 * dIn[0], P1[1] - 145 * dIn[1]];
    let rays = '', lines = '';
    const dash = (pts, color, w, dur) =>
      `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>` +
      `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 14"><animate attributeName="stroke-dashoffset" values="16;0" dur="${dur}" repeatCount="indefinite"/></polyline>`;
    lines += dash(`${start[0].toFixed(1)},${start[1].toFixed(1)} ${P1[0]},${P1[1]}`, '#ffffff', 5, '0.7s');
    const ends = [];
    cols.forEach(([name, col, n]) => {
      const d1 = refract(dIn, nOutAB, 1 / n);
      const cr = (a, b) => a[0] * b[1] - a[1] * b[0];
      const s = cr([A[0] - P1[0], A[1] - P1[1]], u) / cr(d1, u);
      const P2 = [P1[0] + s * d1[0], P1[1] + s * d1[1]];
      const d2 = refract(d1, nInAC, n);
      const L = (388 - P2[0]) / d2[0];
      const E = [P2[0] + L * d2[0], P2[1] + L * d2[1]];
      ends.push(E);
      rays += dash(`${P1[0]},${P1[1]} ${P2[0].toFixed(1)},${P2[1].toFixed(1)} ${E[0].toFixed(1)},${E[1].toFixed(1)}`, col, 3.5, '0.7s');
    });
    return TutorialKit.svg(`
      <rect x="0" y="0" width="400" height="240" fill="none"/>
      ${T(200, 18, 'Each colour bends by a different amount', { size: 14 })}
      <rect x="0" y="28" width="400" height="212" rx="8" fill="#131b2e"/>
      <polygon points="${A} ${B} ${C}" fill="#9fb6d8" fill-opacity="0.22" stroke="#b9c9e4" stroke-width="3" stroke-linejoin="round"/>
      ${lines}${rays}
      ${T(12, 134, 'White light', { size: 13, anchor: 'start', fill: '#f1f5f9' })}
      ${T(200, 190, 'Glass prism', { size: 14, fill: '#f1f5f9' })}
      ${T(390, 108, 'Red bends least', { size: 13, anchor: 'end', fill: '#ff8a8a' })}
      ${T(390, 226, 'Violet bends most', { size: 13, anchor: 'end', fill: '#d2a6ff' })}
      ${T(10, 232, 'Spread exaggerated', { size: 12, anchor: 'start', fill: '#b6c2d6', weight: 600 })}`);
  }
  addTutorialSteps('physics', 'waves', [
    { kind: 'example', title: 'Real life: A rainbow from a prism',
      text: '<p>Sunlight looks white but is a mix of colours. A glass <b>prism</b> bends each colour by a different amount, so it spreads the light into a rainbow. Raindrops do the same job in the sky. This spreading is called <b>dispersion</b>.</p>',
      explain: '<p>A white beam of light comes in from the lower left and hits a <b>glass prism</b>. Inside and after it, the beam fans out into seven coloured rays that stream to the right: <b>red</b> bends least and lies on top, <b>violet</b> bends most and lies at the bottom. Moving dots show the light travelling. The spread is drawn bigger than in real glass.</p>',
      say: 'A beam of white light comes in from the lower left and hits a glass prism. Watch what happens. The beam does not stay white. It spreads out into seven colours, red, orange, yellow, green, blue, indigo, and violet. That is because white light is a mixture of all these colours. Glass slows each colour by a slightly different amount, so each colour bends by a different amount when it enters and leaves the prism. Red bends the least, and violet bends the most. This spreading is called dispersion. A rainbow is made the same way. Tiny raindrops act like little prisms and spread sunlight into colours. In this picture the spread is drawn bigger than it is in real glass.',
      svg: mwavPrismSvg() }
  ]);

  // --- 3. Magnifying glass and sunlight: a convex lens focuses light (interactive paper distance) ---
  function mwavLensMount(el, api) {
    const CY = 100, LX = 150, FPX = 100, HALF = 30;            // scale: 10 px = 1 cm; lens 6 cm across, focal length 10 cm
    const hs = [-30, -15, 0, 15, 30];
    let rays = '';
    hs.forEach((h, i) => { rays += `<line class="mwav-pre" x1="58" y1="${CY + h}" x2="${LX}" y2="${CY + h}" stroke="${YELLOW}" stroke-width="3" stroke-dasharray="8 8"/>` +
      `<line class="mwav-post" data-h="${h}" x1="${LX}" y1="${CY + h}" x2="${LX + 100}" y2="${CY}" stroke="${YELLOW}" stroke-width="3" stroke-dasharray="8 8"/>`; });
    let smoke = '';
    for (let i = 0; i < 5; i++) smoke += `<circle class="mwav-smk" r="4" fill="${MUTED}" opacity="0"/>`;
    scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <line x1="10" y1="${CY}" x2="390" y2="${CY}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3 5" opacity="0.6"/>
      <circle cx="28" cy="${CY}" r="15" fill="${YELLOW}"/>
      <g stroke="${YELLOW}" stroke-width="3"><line x1="28" y1="${CY - 24}" x2="28" y2="${CY - 20}"/><line x1="28" y1="${CY + 20}" x2="28" y2="${CY + 24}"/><line x1="4" y1="${CY}" x2="8" y2="${CY}"/></g>
      ${T(28, 142, 'Sun', { size: 13 })}
      <line x1="${LX + FPX}" y1="${CY - 12}" x2="${LX + FPX}" y2="${CY + 12}" stroke="${PRIM}" stroke-width="2"/>
      ${rays}
      <path d="M${LX},${CY - HALF - 2} Q${LX + 20},${CY} ${LX},${CY + HALF + 2} Q${LX - 20},${CY} ${LX},${CY - HALF - 2} Z" fill="${BLUE}" fill-opacity="0.35" stroke="${BLUE}" stroke-width="3"/>
      ${T(LX, 152, 'Lens', { size: 13 })}${T(LX + FPX, 162, 'Focus (10 cm)', { size: 13, fill: PRIM })}
      <rect id="mwav-scorch" x="0" y="${CY - 3}" width="10" height="6" rx="2" fill="${INK}" opacity="0"/>
      <rect id="mwav-paper" x="0" y="${CY - 40}" width="6" height="80" rx="2" fill="#f5efdc" stroke="${MUTED}" stroke-width="1.5"/>
      <circle id="mwav-hot" cx="0" cy="${CY}" r="8" fill="${ORANGE}" opacity="0"/>
      <rect id="mwav-spot" x="0" y="${CY}" width="8" height="4" rx="1" fill="${RED}"/>
      ${smoke}
      ${T(0, 52, 'Paper', { id: 'mwav-plabel', size: 13 })}
      ${T(200, 16, '', { id: 'mwav-rd', size: 14, fill: INK })}
      ${T(200, 182, '', { id: 'mwav-msg', size: 14, fill: PRIM })}`,
      sliderRow('Paper', 'mwav-pd', 4, 18, 0.5, 10, '10 cm'));
    const q = s => el.querySelector(s), sl = q('#mwav-pd');
    const posts = [...el.querySelectorAll('.mwav-post')], pres = [...el.querySelectorAll('.mwav-pre')], smk = [...el.querySelectorAll('.mwav-smk')];
    let heat = 0;
    sl.addEventListener('input', () => { q('#mwav-pd-v').textContent = f1(+sl.value) + ' cm'; });
    api.loop((t, dt) => {
      const d = +sl.value, xp = LX + d * 10;
      const spot = Math.sqrt(0.093 * 0.093 + Math.pow(6 * Math.abs(1 - d / 10), 2));       // cm: geometric blur + the Sun's own image
      const conc = Math.pow(6 / spot, 2);
      heat = clamp(heat + (spot < 0.8 ? 0.5 : -0.3) * dt, 0, 1);
      posts.forEach(p => {
        const h = +p.dataset.h;
        p.setAttribute('x2', xp); p.setAttribute('y2', CY + h * (1 - d / 10));
        p.setAttribute('stroke-dashoffset', (-t * 40).toFixed(1));
      });
      pres.forEach(p => p.setAttribute('stroke-dashoffset', (-t * 40).toFixed(1)));
      q('#mwav-paper').setAttribute('x', xp - 3);
      q('#mwav-plabel').setAttribute('x', xp);
      const sh = Math.max(3, spot * 10);
      const sp = q('#mwav-spot'); sp.setAttribute('x', xp - 4); sp.setAttribute('y', CY - sh / 2); sp.setAttribute('height', sh);
      sp.setAttribute('fill', spot < 0.8 ? RED : YELLOW);
      const hot = q('#mwav-hot'); hot.setAttribute('cx', xp); hot.setAttribute('opacity', (spot < 0.8 ? 0.35 + 0.25 * Math.sin(t * 9) : 0).toFixed(2));
      const sc = q('#mwav-scorch'); sc.setAttribute('x', xp - 5); sc.setAttribute('opacity', heat > 0.6 ? 0.85 : 0);
      smk.forEach((c, i) => {
        const k = ((t * 0.6 + i / smk.length) % 1);
        c.setAttribute('cx', xp + 4 + Math.sin(k * 6 + i) * 6); c.setAttribute('cy', CY - 6 - k * 40);
        c.setAttribute('r', 3 + k * 5); c.setAttribute('opacity', heat > 0.5 ? (0.5 * (1 - k)).toFixed(2) : 0);
      });
      q('#mwav-rd').textContent = `Sunlight squeezed into a spot ${spot < 0.15 ? 'about 0.1' : f1(spot)} cm wide` ;
      q('#mwav-msg').textContent = spot < 0.8 ? `Light about ${conc >= 1000 ? Math.round(conc / 100) * 100 : Math.round(conc)} times stronger: paper scorches!`
        : spot < 2 ? 'Spot is bigger: only warm, not hot enough' : 'Light spread out: paper stays cool';
      q('#mwav-msg').setAttribute('fill', spot < 0.8 ? RED : PRIM);
    });
  }
  addTutorialSteps('physics', 'waves', [
    { kind: 'example', title: 'Real life: A magnifying glass and sunlight',
      text: '<p>A magnifying glass is a <b>convex lens</b>. It refracts parallel sunlight so all the rays meet at one <b>focus</b>. Every bit of light that hits the lens is squeezed into a tiny spot, which is hot enough to scorch paper. Slide the paper to see!</p>',
      explain: '<p>Yellow dashed lines are parallel sunlight from the <b>Sun</b> on the left, passing through a blue <b>lens</b>. Behind it they bend and meet at the <b>Focus</b>, 10 cm away. A <b>paper</b> on the right marks where they land. The <b>Paper</b> slider moves it: at the focus the bright spot is tiny and the paper smokes; nearer or farther, the spot grows and cools.</p>',
      say: 'Sunlight arrives from the left as parallel rays. They pass through a magnifying glass, which is a convex lens. A convex lens is thicker in the middle, and it bends every ray inward. All the rays meet at one point, called the focus. Here the focus is ten centimeters behind the lens. Now look at the paper on the right. Right now it sits at the focus. All the light that hit the whole lens is squeezed into a spot about one millimeter wide, so the paper gets very hot, and it starts to smoke. Now use the slider to move the paper closer or farther away. The spot grows wider, the light is spread out, and the paper stays cool.',
      mount: mwavLensMount }
  ]);

  // --- 4. A ringing bell in a vacuum: sound needs a medium (interactive pump) ---
  function mwavVacuumMount(el, api) {
    const JX = 115, NP = 40, XL = 70, XR = 160, YT = 58, YB = 144;
    let parts = '', arcs = '';
    for (let i = 0; i < NP; i++) parts += `<circle class="mwav-air" r="2.6" fill="${TEAL}"/>`;
    for (let i = 0; i < 4; i++) arcs += `<path class="mwav-arc" d="M0,-24 Q12,0 0,24" fill="none" stroke="${BLUE}" stroke-width="4" stroke-linecap="round"/>`;
    scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="${SOFT}" rx="8"/>
      <rect x="20" y="158" width="370" height="6" rx="2" fill="${MUTED}" opacity="0.5"/>
      <rect x="50" y="148" width="130" height="10" rx="2" fill="${MUTED}"/>
      <polyline points="${JX},158 ${JX},174 44,174" fill="none" stroke="${MUTED}" stroke-width="4"/>
      <rect x="10" y="162" width="34" height="24" rx="4" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
      ${T(28, 156, 'Pump', { size: 12 })}
      <path d="M60,148 L60,72 Q60,30 ${JX},30 Q170,30 170,72 L170,148 Z" fill="${BLUE}" fill-opacity="0.12" stroke="${MUTED}" stroke-width="3"/>
      ${parts}
      <g id="mwav-clock"><circle cx="${JX - 12}" cy="106" r="6" fill="${ORANGE}"/><circle cx="${JX + 12}" cy="106" r="6" fill="${ORANGE}"/>
        <line id="mwav-ham" x1="${JX}" y1="100" x2="${JX}" y2="108" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <line x1="${JX - 12}" y1="142" x2="${JX - 16}" y2="148" stroke="${INK}" stroke-width="3"/><line x1="${JX + 12}" y1="142" x2="${JX + 16}" y2="148" stroke="${INK}" stroke-width="3"/>
        <circle cx="${JX}" cy="126" r="17" fill="#f8fafc" stroke="${INK}" stroke-width="3"/>
        <line x1="${JX}" y1="126" x2="${JX}" y2="115" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><line x1="${JX}" y1="126" x2="${JX + 8}" y2="130" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></g>
      ${T(JX, 20, 'Alarm clock ringing in a jar', { size: 13, weight: 600, fill: MUTED, id: 'mwav-title' })}
      <line x1="${JX + 18}" y1="118" x2="338" y2="112" stroke="${YELLOW}" stroke-width="3" stroke-dasharray="7 7"><animate attributeName="stroke-dashoffset" values="14;0" dur="0.6s" repeatCount="indefinite"/></line>
      ${T(262, 98, 'Light still arrives', { size: 13, fill: ORANGE })}
      ${arcs}
      <circle cx="352" cy="118" r="11" fill="${ORANGE}"/><ellipse cx="341" cy="119" rx="3.5" ry="6" fill="${ORANGE}" stroke="${INK}" stroke-width="1.5"/>
      <rect x="342" y="130" width="20" height="28" rx="6" fill="${PRIM}"/>
      ${T(352, 96, 'Listener', { size: 13 })}
      ${T(300, 16, '', { id: 'mwav-air-t', size: 14, fill: INK })}
      ${T(126, 184, '', { id: 'mwav-msg', size: 14, fill: PRIM, anchor: 'start' })}`,
      sliderRow('Air out', 'mwav-pump', 0, 100, 1, 0, '0%'));
    const q = s => el.querySelector(s), sl = q('#mwav-pump');
    const air = [...el.querySelectorAll('.mwav-air')], arc = [...el.querySelectorAll('.mwav-arc')];
    const P = air.map(() => ({ x: XL + Math.random() * (XR - XL), y: YT + Math.random() * (YB - YT), vx: (Math.random() - 0.5) * 70, vy: (Math.random() - 0.5) * 70 }));
    sl.addEventListener('input', () => { q('#mwav-pump-v').textContent = sl.value + '%'; });
    api.loop((t, dt) => {
      const a = 1 - (+sl.value) / 100, n = Math.round(NP * a);
      air.forEach((c, i) => {
        if (i >= n) { c.setAttribute('opacity', 0); return; }
        const p = P[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < XL || p.x > XR) { p.vx = -p.vx; p.x = clamp(p.x, XL, XR); }
        if (p.y < YT || p.y > YB) { p.vy = -p.vy; p.y = clamp(p.y, YT, YB); }
        c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('opacity', 1);
      });
      q('#mwav-clock').setAttribute('transform', `translate(${(Math.sin(t * 60) * 1.2).toFixed(2)} 0)`);
      q('#mwav-ham').setAttribute('x2', JX + Math.sin(t * 40) * 9);
      arc.forEach((p, i) => {
        const k = ((t * 0.5 + i / arc.length) % 1);
        p.setAttribute('transform', `translate(${(182 + k * 130).toFixed(1)} 122)`);
        p.setAttribute('opacity', (Math.pow(a, 1.4) * (1 - k * 0.6)).toFixed(2));
      });
      q('#mwav-air-t').textContent = 'Air left in jar: ' + Math.round(a * 100) + '%';
      q('#mwav-air-t').setAttribute('x', 290);
      q('#mwav-title').setAttribute('x', 105);
      q('#mwav-msg').textContent = a > 0.7 ? 'Loud: air carries the sound' : a > 0.35 ? 'Quieter: fewer particles to pass it on'
        : a > 0.08 ? 'Very faint: almost no particles' : 'Silent: no air, no sound';
      q('#mwav-msg').setAttribute('fill', a < 0.08 ? RED : PRIM);
    });
  }
  addTutorialSteps('physics', 'waves', [
    { kind: 'example', title: 'Real life: A ringing bell in a vacuum',
      text: '<p>Sound is a vibration passed from particle to particle, so it needs a medium such as air. In a science lab, an alarm clock in a jar goes quiet as a pump removes the air, even though you can still see it. Space is silent because it is nearly a <b>vacuum</b>.</p>',
      explain: '<p>A ringing <b>alarm clock</b> sits in a glass jar with tiny teal dots for air particles, a <b>Pump</b> on the left and a <b>Listener</b> on the right. Blue arcs carry the sound toward the listener; a yellow dashed line is light. The <b>Air out</b> slider pumps air away: the dots vanish, the arcs fade to nothing, but the light line stays.</p>',
      say: 'An alarm clock is ringing inside a glass jar. The tiny teal dots are air particles. The clock shakes the air, the air passes the vibration along, and the blue arcs carry the sound to the listener on the right. Now use the air out slider. It works like a vacuum pump, and it removes air from the jar. Watch the dots disappear. The arcs get fainter, and the sound gets quieter. When almost all the air is gone, there are no particles left to pass on the vibration, and the sound stops. Yet the yellow dashed line stays, because light does not need air, so you can still see the clock. This is why there is no sound in space.',
      mount: mwavVacuumMount }
  ]);

  // --- 5. A periscope: two mirrors, angle in = angle out ---
  function mwavPeriscopeSvg() {
    const halo = 'paint-order="stroke" stroke="var(--t-soft)" stroke-width="3" stroke-linejoin="round"';
    const path = '320,60 180,60 180,180 124,180';
    const mirror = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${MUTED}" stroke-width="9" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e6f0ff" stroke-width="4" stroke-linecap="round"/>`;
    return TutorialKit.svg(`
      <rect x="0" y="0" width="400" height="240" fill="${SOFT}" rx="8"/>
      <rect x="0" y="212" width="400" height="28" fill="${GREEN}" opacity="0.45"/>
      ${T(200, 17, 'A periscope lets you see over a fence', { size: 14, fill: PRIM })}
      <rect x="145" y="30" width="70" height="182" fill="${BLUE}" fill-opacity="0.1"/>
      <path d="M145,160 L145,30 L215,30 L215,42 M215,80 L215,212 L145,212 L145,202" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      ${mirror(156, 84, 204, 36)}${mirror(156, 204, 204, 156)}
      <line x1="180" y1="60" x2="201" y2="81" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 3"/>
      <line x1="180" y1="180" x2="159" y2="159" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 3"/>
      <rect x="250" y="100" width="32" height="112" fill="#c58a4f" stroke="#7a4d22" stroke-width="2"/>
      <line x1="266" y1="100" x2="266" y2="212" stroke="#7a4d22" stroke-width="1.5"/>
      ${T(266, 92, 'Fence', { size: 13 })}
      <g><polygon points="335,38 351,58 335,82 319,58" fill="${RED}" stroke="${INK}" stroke-width="2"/>
        <line x1="335" y1="38" x2="335" y2="82" stroke="${INK}" stroke-width="1.5"/><line x1="319" y1="58" x2="351" y2="58" stroke="${INK}" stroke-width="1.5"/>
        <path d="M335,82 q-8,8 0,16 q8,8 0,16" fill="none" stroke="${INK}" stroke-width="2"/>
        <animateTransform attributeName="transform" type="translate" values="0,-4;0,4;0,-4" dur="2.4s" repeatCount="indefinite"/></g>
      ${T(335, 138, 'Kite', { size: 13 })}
      <polyline points="${path}" fill="none" stroke="${ORANGE}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity="0.4"/>
      <polyline points="${path}" fill="none" stroke="${ORANGE}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="3 13"><animate attributeName="stroke-dashoffset" values="16;0" dur="0.6s" repeatCount="indefinite"/></polyline>
      <polygon points="114,180 128,173 128,187" fill="${ORANGE}"/>
      <circle cx="96" cy="182" r="13" fill="${ORANGE}"/><circle cx="103" cy="180" r="2.5" fill="${INK}"/><rect x="82" y="196" width="28" height="16" rx="5" fill="${PRIM}"/>
      ${T(96, 160, 'You', { size: 13 })}
      ${T(190, 73, '45°', { size: 12, anchor: 'start', extra: halo })}${T(186, 94, '45°', { size: 12, anchor: 'start', extra: halo })}
      ${T(176, 148, '45°', { size: 12, anchor: 'end', extra: halo })}${T(172, 176, '45°', { size: 12, anchor: 'end', extra: halo })}
      ${T(200, 233, 'Each mirror turns the light by 90°', { size: 14 })}`);
  }
  addTutorialSteps('physics', 'waves', [
    { kind: 'example', title: 'Real life: A periscope',
      text: '<p>A periscope lets you see over a wall, or from inside a submarine. Two flat mirrors sit at 45°. A mirror always reflects light so that the <b>angle in equals the angle out</b>, so each one turns the light through 90°.</p>',
      explain: '<p>A tall tube stands next to a brown <b>fence</b>, with a red <b>kite</b> flying beyond it on the right. Orange dashes show light from the kite entering the top of the tube, striking a <b>mirror</b> (45° in, 45° out), dropping down, and striking a second mirror that sends it left to <b>your</b> eye. The fence blocks any direct view.</p>',
      say: 'You are crouching behind a tall fence on the left, and a kite is flying on the right. The fence blocks your view, so you use a periscope. Follow the orange dashes. Light from the kite travels left and enters the top of the tube. It hits the first mirror, which is tilted at forty five degrees. A mirror reflects light so the angle coming in equals the angle going out. Here both are forty five degrees, so the light turns ninety degrees and heads straight down. It hits a second mirror, and that turns it ninety degrees again, out toward your eye. Now you can see the kite, even though the fence is in the way.',
      svg: mwavPeriscopeSvg() }
  ], [
    { term: 'Doppler effect', definition: 'The change in pitch you hear when a sound source moves toward you (higher) or away from you (lower).' },
    { term: 'Dispersion', definition: 'Splitting white light into its colours, because glass bends each colour by a different amount.' },
    { term: 'Convex lens', definition: 'A lens thicker in the middle that bends parallel light rays together to meet at a point called the focus.' },
    { term: 'Vacuum', definition: 'A space with no particles. Sound cannot travel through it, but light can.' }
  ]);

})();
