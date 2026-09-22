(function () {
  'use strict';
  // physics-examples-a: extra real-life example steps, added via addTutorialSteps(...).
  // Namespaces: exfrc- (forces), exnrg- (energy), exmat- (matter).

  const PRIM = 'var(--primary)', ORANGE = 'var(--t-orange)', BLUE = 'var(--t-blue)', TEAL = 'var(--t-teal)';
  const YELLOW = 'var(--t-yellow)', RED = 'var(--t-red)', GREEN = 'var(--t-green)';
  const SOFT = 'var(--t-soft)', INK = 'var(--t-ink)', MUTED = 'var(--t-muted)';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;

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
  function staticArrow(x1, y1, x2, y2, color, w, head) {
    w = w || 4;
    const g = arrowGeom(x1, y1, x2, y2, w, head);
    return `<line x1="${g.lx1}" y1="${g.ly1}" x2="${g.lx2}" y2="${g.ly2}" stroke="${color}" stroke-width="${w}"/><polygon points="${g.pts}" fill="${color}"/>`;
  }
  function arrowHTML(id, color, w) {
    return `<g id="${id}"><line id="${id}-l" stroke="${color}" stroke-width="${w || 4}"/><polygon id="${id}-h" fill="${color}"/></g>`;
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
  function btnRow(buttons) {
    return `<div class="scene-slider-row" style="justify-content:center;gap:8px">${buttons.map(b =>
      `<button type="button" class="scene-btn" id="${b.id}">${b.label}</button>`).join('')}</div>`;
  }
  // Mount scene: an <svg> sharing the 240px container with optional control rows.
  function scene(el, vb, inner, rows) {
    el.innerHTML = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet" style="flex:1 1 0;min-height:0;width:100%;height:auto">${inner}</svg>${rows || ''}`;
    return el.querySelector('svg');
  }

  // =====================================================================
  // FORCES
  // =====================================================================
  const forcesSteps = [];

  // --- Seatbelt and inertia: a 6 s loop (cruise 0-2 s, braking 2-3.5 s, stopped) ---
  const exfrcSeatbelt = (() => {
    const DUR = '6s', KT = '0;0.333;0.583;0.85;1';
    const SP_LEAN = '0 0 1 1;0.333 0 0.667 0.333;0 0 1 1;0.4 0 0.6 1';
    const anim = (type, values) =>
      `<animateTransform attributeName="transform" type="${type}" values="${values}" keyTimes="${KT}" dur="${DUR}" repeatCount="indefinite" calcMode="spline" keySplines="${SP_LEAN}"/>`;
    // road dashes: constant speed for 2 s, then constant deceleration to rest (offset 120 = 3 dash periods)
    const road = y => `<line x1="10" y1="${y}" x2="175" y2="${y}" stroke="${MUTED}" stroke-width="4" stroke-dasharray="20 20">` +
      `<animate attributeName="stroke-dashoffset" values="0;87.3;120;120" keyTimes="0;0.333;0.583;1" dur="${DUR}" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;0.333 0.667 0.667 1;0 0 1 1"/></line>`;
    const car = (y, belted, lean, shift) => `
      <g transform="translate(20 ${y})">
        <path d="M0,62 L0,40 L28,36 L45,8 L115,8 L135,36 L150,42 L150,62 Z" fill="${SOFT}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="52" y="14" width="56" height="22" rx="3" fill="none" stroke="${MUTED}" stroke-width="2"/>
        <rect x="42" y="38" width="22" height="24" rx="3" fill="${MUTED}" opacity="0.5"/>
        <g>${anim('translate', shift)}
          <g>${anim('rotate', lean)}
            <line x1="60" y1="48" x2="60" y2="26" stroke="${ORANGE}" stroke-width="7" stroke-linecap="round"/>
            <circle cx="60" cy="15" r="9" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
            <line x1="60" y1="30" x2="76" y2="40" stroke="${ORANGE}" stroke-width="5" stroke-linecap="round"/>
          </g>
          <line x1="60" y1="48" x2="84" y2="48" stroke="${ORANGE}" stroke-width="7" stroke-linecap="round"/>
          <line x1="84" y1="48" x2="84" y2="62" stroke="${ORANGE}" stroke-width="7" stroke-linecap="round"/>
        </g>
        ${belted ? `<line x1="52" y1="20" x2="70" y2="50" stroke="${BLUE}" stroke-width="4" stroke-linecap="round"/>` : ''}
        <circle cx="32" cy="64" r="11" fill="${INK}"/><circle cx="118" cy="64" r="11" fill="${INK}"/>
        <circle cx="32" cy="64" r="4" fill="${SOFT}"/><circle cx="118" cy="64" r="4" fill="${SOFT}"/>
      </g>`;
    const flash = `<text x="200" y="122" font-size="16" font-weight="800" fill="${RED}" text-anchor="middle" opacity="0">BRAKING!` +
      `<animate attributeName="opacity" values="0;1;0;0" keyTimes="0;0.333;0.583;1" calcMode="discrete" dur="${DUR}" repeatCount="indefinite"/></text>`;
    return TutorialKit.svg(
      car(26, false, '0 60 48;0 60 48;42 60 48;42 60 48;0 60 48', '0 0;0 0;28 0;28 0;0 0') +
      car(140, true, '0 60 48;0 60 48;10 60 48;10 60 48;0 60 48', '0 0;0 0;3 0;3 0;0 0') +
      road(102) + road(216) + flash +
      T(290, 40, 'No seatbelt', { size: 15, fill: RED }) +
      T(290, 60, 'Car stops, but your', { size: 13, weight: 600 }) +
      T(290, 78, 'body keeps moving!', { size: 13, weight: 600 }) +
      T(290, 154, 'With seatbelt', { size: 15, fill: GREEN }) +
      T(290, 174, 'The belt pushes back', { size: 13, weight: 600 }) +
      T(290, 192, 'and stops you safely', { size: 13, weight: 600 }));
  })();
  forcesSteps.push({
    kind: 'example',
    title: 'Real life: Seatbelts and inertia',
    text: '<p>When a car brakes, the <b>friction</b> force from the road slows the car, but your body has <b>inertia</b> and keeps moving forward at the old speed. A seatbelt supplies the force that slows you down with the car.</p>',
    svg: exfrcSeatbelt
  });

  // --- Rocket launch: thrust vs weight (interactive thrust slider) ---
  function exfrcRocketMount(el, api) {
    const M = 2000, W = M * 10, GY = 172, CAP = 90, PX = 0.6;   // kg, N, ground y, max rise (units), units per metre
    const clouds = [[40, 30, 26], [120, 110, 20], [60, 200, 30], [200, 60, 22]];
    const svg = scene(el, '0 0 400 190', `
      <rect x="0" y="0" width="400" height="190" fill="none"/>
      <g id="exfrc-clouds" fill="${SOFT}" stroke="${MUTED}" stroke-width="1.5">${clouds.map((c, i) =>
        `<ellipse id="exfrc-c${i}" cx="${c[0] + 10}" cy="0" rx="${c[2]}" ry="${c[2] * 0.4}"/>`).join('')}</g>
      <g id="exfrc-ground"><rect x="0" y="${GY}" width="230" height="40" fill="${MUTED}" opacity="0.35"/>
        <line x1="0" y1="${GY}" x2="230" y2="${GY}" stroke="${INK}" stroke-width="3"/></g>
      <g id="exfrc-rocket">
        <polygon id="exfrc-flame" fill="${ORANGE}" points="0,0"/>
        <g id="exfrc-gas" fill="${YELLOW}">${[0, 1, 2, 3, 4].map(i => `<circle id="exfrc-g${i}" r="3.5"/>`).join('')}</g>
        <path d="M150,0 Q166,20 166,44 L166,62 L134,62 L134,44 Q134,20 150,0 Z" transform="translate(0 -62)" fill="${SOFT}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" id="exfrc-body"/>
        <circle cx="150" cy="-38" r="7" fill="${BLUE}" stroke="${INK}" stroke-width="2"/>
        <polygon points="134,-14 118,0 134,0" fill="${RED}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="166,-14 182,0 166,0" fill="${RED}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        ${arrowHTML('exfrc-th', ORANGE, 5)}${arrowHTML('exfrc-wt', RED, 5)}
        ${T(0, 0, 'Thrust', { id: 'exfrc-thl', size: 13, fill: ORANGE, anchor: 'start' })}
        ${T(0, 0, 'Weight', { id: 'exfrc-wtl', size: 13, fill: RED, anchor: 'end' })}
      </g>
      ${T(250, 26, '', { id: 'exfrc-r1', size: 13, fill: ORANGE, anchor: 'start' })}
      ${T(250, 46, '', { id: 'exfrc-r2', size: 13, fill: RED, anchor: 'start' })}
      ${T(250, 68, '', { id: 'exfrc-r3', size: 14, anchor: 'start' })}
      ${T(250, 88, '', { id: 'exfrc-r4', size: 13, anchor: 'start' })}
      ${T(250, 108, '', { id: 'exfrc-r5', size: 13, anchor: 'start' })}
      ${T(250, 138, '', { id: 'exfrc-r6', size: 14, fill: PRIM, anchor: 'start' })}
      ${T(250, 158, 'Gas is pushed down,', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(250, 176, 'so the rocket is pushed up', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}`,
      sliderRow('Thrust', 'exfrc-thr', 0, 40, 1, 30, '30 kN') + btnRow([{ id: 'exfrc-reset', label: '↺ Back to pad' }]));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#exfrc-thr'), out = el.querySelector('#exfrc-thr-v');
    let alt = 0, v = 0;
    const onInput = () => { out.textContent = slider.value + ' kN'; };
    const onReset = () => { alt = 0; v = 0; };
    slider.addEventListener('input', onInput);
    el.querySelector('#exfrc-reset').addEventListener('click', onReset);
    function draw(t) {
      const T = +slider.value * 1000;
      const net = T - W, onPad = alt <= 0 && T <= W;
      const a = onPad ? 0 : net / M;
      const rise = Math.min(alt * PX, CAP), cam = Math.max(0, alt * PX - CAP);
      $('#exfrc-rocket').setAttribute('transform', `translate(0 ${GY - rise})`);
      $('#exfrc-ground').setAttribute('transform', `translate(0 ${cam})`);
      clouds.forEach((c, i) => {
        const y = ((c[1] + cam) % 230 + 230) % 230 - 20;
        $('#exfrc-c' + i).setAttribute('cy', y);
      });
      // force arrows (1.6 units per kN), drawn beside the rocket from its middle
      const my = -31, k = 1.6;
      $('#exfrc-th').style.display = T > 0 ? '' : 'none';
      if (T > 0) setArrow(svg, 'exfrc-th', 184, my, 184, my - T / 1000 * k, 5, 12);
      setArrow(svg, 'exfrc-wt', 116, my, 116, my + W / 1000 * k, 5, 12);
      const tl = $('#exfrc-thl'); tl.setAttribute('x', 190); tl.setAttribute('y', my - T / 1000 * k + 8); tl.style.display = T > 0 ? '' : 'none';
      const wl = $('#exfrc-wtl'); wl.setAttribute('x', 110); wl.setAttribute('y', my + W / 1000 * k + 4);
      // flame + exhaust gas
      const fl = T / 1000 * 1.0 * (0.9 + 0.1 * Math.sin(t * 40));
      $('#exfrc-flame').setAttribute('points', T > 0 ? `138,0 162,0 150,${fl + 6}` : '0,0');
      for (let i = 0; i < 5; i++) {
        const ph = ((t * 1.6 + i / 5) % 1), g = $('#exfrc-g' + i);
        g.setAttribute('cx', 150 + Math.sin(i * 2.4) * 8 * (0.4 + ph)); g.setAttribute('cy', 6 + ph * 34);
        g.setAttribute('opacity', T > 0 ? (1 - ph) * Math.min(1, T / 15000) : 0);
      }
      $('#exfrc-r1').textContent = `Thrust: ${slider.value} kN`;
      $('#exfrc-r2').textContent = `Weight: ${W / 1000} kN`;
      const nk = net / 1000;
      const r3 = $('#exfrc-r3');
      r3.textContent = onPad ? 'Net force: 0 N' : `Net: ${nk > 0 ? '+' : ''}${nk} kN ${nk > 0 ? '(up)' : nk < 0 ? '(down)' : ''}`;
      r3.setAttribute('fill', net > 0 ? GREEN : net < 0 ? RED : INK);
      $('#exfrc-r4').textContent = `Acceleration: ${Math.round(a * 10) / 10} m/s²`;
      $('#exfrc-r5').textContent = `Speed: ${Math.round(Math.abs(v))} m/s`;
      $('#exfrc-r6').textContent = onPad ? 'Thrust < weight: stays on pad' : net === 0 ? 'Balanced: constant speed' : net > 0 ? 'Speeding up!' : (v > 0 ? 'Slowing down' : 'Falling back');
    }
    api.loop((t, dt) => {
      const T = +slider.value * 1000;
      if (!(alt <= 0 && T <= W)) {
        v += (T - W) / M * dt;
        alt += v * dt;
        if (alt <= 0) { alt = 0; v = 0; }
        if (alt > 1500) { alt = 0; v = 0; }
      }
      draw(t);
    });
    draw(0);
    return () => { slider.removeEventListener('input', onInput); };
  }
  forcesSteps.push({
    kind: 'example',
    title: 'Real life: Rocket launch',
    text: '<p>The engine pushes hot gas <b>down</b>, and by Newton’s 3rd law the gas pushes the rocket <b>up</b>. The rocket only lifts off when thrust is bigger than its weight (2000 kg × 10 = 20 000 N). Move the slider!</p>',
    mount: exfrcRocketMount
  });

  // --- Skydiver: air resistance vs weight, terminal velocity (interactive parachute) ---
  function exfrcSkydiveMount(el, api) {
    const M = 80, W = M * 10, K_FREE = W / (55 * 55), K_CHUTE = W / (6 * 6), SIM = 2;   // 80 kg; terminal speeds 55 and 6 m/s
    const clouds = [[30, 20, 26], [110, 90, 20], [70, 160, 30], [190, 50, 22], [20, 120, 18]];
    const svg = scene(el, '0 0 400 190', `
      <g fill="${SOFT}" stroke="${MUTED}" stroke-width="1.5">${clouds.map((c, i) =>
        `<ellipse id="exfrc-k${i}" cx="${c[0] + 20}" cy="0" rx="${c[2]}" ry="${c[2] * 0.4}"/>`).join('')}</g>
      <g id="exfrc-chute" opacity="0" stroke-linecap="round">
        <path d="M-46,-30 Q0,-88 46,-30 Q23,-38 0,-30 Q-23,-38 -46,-30 Z" fill="${ORANGE}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="-46" y1="-30" x2="0" y2="0" stroke="${INK}" stroke-width="1.5"/><line x1="46" y1="-30" x2="0" y2="0" stroke="${INK}" stroke-width="1.5"/>
      </g>
      <g id="exfrc-diver" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none">
        <circle id="exfrc-dh" r="7" fill="${INK}"/>
        <line id="exfrc-dt" x1="0" y1="-14" x2="0" y2="14"/>
        <line id="exfrc-da1" x1="0" y1="-8"/><line id="exfrc-da2" x1="0" y1="-8"/>
        <line id="exfrc-dl1" x1="0" y1="14"/><line id="exfrc-dl2" x1="0" y1="14"/>
      </g>
      ${arrowHTML('exfrc-aw', RED, 5)}${arrowHTML('exfrc-ad', BLUE, 5)}
      ${T(66, 178, 'Weight', { size: 13, fill: RED })}${T(176, 178, 'Air resistance', { id: 'exfrc-adl', size: 13, fill: BLUE })}
      ${T(236, 26, '', { id: 'exfrc-s1', size: 14, anchor: 'start' })}
      ${T(236, 50, '', { id: 'exfrc-s2', size: 13, fill: RED, anchor: 'start' })}
      ${T(236, 70, '', { id: 'exfrc-s3', size: 13, fill: BLUE, anchor: 'start' })}
      ${T(236, 92, '', { id: 'exfrc-s4', size: 14, anchor: 'start' })}
      ${T(236, 124, '', { id: 'exfrc-s5', size: 14, fill: PRIM, anchor: 'start' })}
      ${T(236, 144, '', { id: 'exfrc-s6', size: 13, weight: 600, fill: MUTED, anchor: 'start' })}`,
      btnRow([{ id: 'exfrc-open', label: '🪂 Open chute' }, { id: 'exfrc-jump', label: '↺ Restart' }]));
    const $ = s => svg.querySelector(s);
    const set = (id, a) => { const n = $(id); for (const k in a) n.setAttribute(k, a[k]); };
    let v = 0, dist = 0, open = false, c = 0;
    const openBtn = el.querySelector('#exfrc-open');
    const onOpen = () => { open = !open; openBtn.textContent = open ? '🪂 Close chute' : '🪂 Open chute'; };
    const onJump = () => { v = 0; dist = 0; open = false; c = 0; openBtn.textContent = '🪂 Open chute'; };
    openBtn.addEventListener('click', onOpen);
    el.querySelector('#exfrc-jump').addEventListener('click', onJump);
    function draw() {
      const DX = 120, DY = 116;
      $('#exfrc-diver').setAttribute('transform', `translate(${DX} ${DY})`);
      $('#exfrc-chute').setAttribute('transform', `translate(${DX} ${DY - 30}) scale(${Math.max(0.01, c)})`);
      $('#exfrc-chute').setAttribute('opacity', c > 0.02 ? 1 : 0);
      set('#exfrc-dh', { cx: 0, cy: -23 });
      set('#exfrc-da1', { x2: lerp(-24, -9, c), y2: lerp(-20, -30, c) }); set('#exfrc-da2', { x2: lerp(24, 9, c), y2: lerp(-20, -30, c) });
      set('#exfrc-dl1', { x2: lerp(-16, -6, c), y2: lerp(30, 34, c) }); set('#exfrc-dl2', { x2: lerp(16, 6, c), y2: lerp(30, 34, c) });
      const k = lerp(K_FREE, K_CHUTE, c), drag = k * v * v, net = W - drag;
      // arrows: 0.05 units per newton (capped so they stay inside the picture)
      setArrow(svg, 'exfrc-aw', 66, 96, 66, 96 + W * 0.05, 5, 12);
      const dl = Math.min(drag * 0.05, 82);
      $('#exfrc-ad').style.display = dl > 2 ? '' : 'none';
      if (dl > 2) setArrow(svg, 'exfrc-ad', 174, 96, 174, 96 - dl, 5, 12);
      clouds.forEach((cl, i) => set('#exfrc-k' + i, { cy: ((((cl[1] - dist) % 200) + 200) % 200) - 5 }));
      $('#exfrc-s1').textContent = `Speed: ${Math.round(v)} m/s`;
      $('#exfrc-s2').textContent = `Weight: ${W} N`;
      $('#exfrc-s3').textContent = `Air resistance: ${Math.round(drag)} N`;
      const balanced = Math.abs(net) < 0.03 * W && v > 1;
      const s4 = $('#exfrc-s4');
      s4.textContent = `Net force: ${Math.round(Math.abs(net) < 5 ? 0 : net)} N`;
      s4.setAttribute('fill', balanced ? GREEN : INK);
      $('#exfrc-s5').textContent = balanced ? 'Terminal velocity!' : v < 0.5 ? 'Just jumped!' : net > 0 ? 'Speeding up' : 'Slowing down';
      $('#exfrc-s6').textContent = balanced ? 'Forces are balanced' : 'More speed, more drag';
    }
    api.loop((t, dt) => {
      c = clamp(c + (open ? 1 : -1) * dt / 1.2, 0, 1);
      const h = dt * SIM;
      const drag = lerp(K_FREE, K_CHUTE, c) * v * v;
      v = Math.max(0, v + (W - drag) / M * h);
      dist += v * dt * 0.7;
      draw();
    });
    draw();
    return () => { openBtn.removeEventListener('click', onOpen); };
  }
  forcesSteps.push({
    kind: 'example',
    title: 'Real life: Skydiver and parachute',
    text: '<p>A falling skydiver speeds up until <b>air resistance</b> pushing up equals the <b>weight</b> pulling down. Forces balance, so speed stops changing: <b>terminal velocity</b>. A parachute catches more air, so the balance happens at a much slower speed.</p>',
    mount: exfrcSkydiveMount
  });

  // =====================================================================
  // ENERGY
  // =====================================================================
  const energySteps = [];

  // --- Hydroelectric dam: chain of energy changes (SMIL) ---
  const exnrgDam = (() => {
    const chain = [['Gravity PE', BLUE], ['Motion (KE)', TEAL], ['Electrical', ORANGE], ['Light + heat', YELLOW]];
    const boxes = chain.map((c, i) => {
      const x = 3 + i * 99.5;
      return `<g opacity="0.35"><animate attributeName="opacity" values="1;0.35;0.35;0.35" keyTimes="0;0.25;0.5;0.75" calcMode="discrete" dur="4s" begin="${i}s" repeatCount="indefinite"/>` +
        `<rect x="${x}" y="8" width="94" height="28" rx="8" fill="${c[1]}" stroke="${INK}" stroke-width="2"/>` +
        T(x + 47, 27, c[0], { size: 13, fill: i === 3 ? INK : '#fff' }) + `</g>`;
    }).join('');
    const blades = [0, 90, 180, 270].map(a => `<rect x="-3" y="-20" width="6" height="20" rx="2" fill="${INK}" transform="rotate(${a})"/>`).join('');
    return TutorialKit.svg(`
      ${boxes}
      <line x1="0" y1="205" x2="400" y2="205" stroke="${INK}" stroke-width="3"/>
      <rect x="6" y="66" width="96" height="139" fill="${BLUE}" opacity="0.55"/>
      <path d="M6,66 q12,-8 24,0 t24,0 t24,0 t24,0" fill="none" stroke="${BLUE}" stroke-width="3">
        <animateTransform attributeName="transform" type="translate" values="0 0;-24 0" dur="3s" repeatCount="indefinite"/></path>
      ${T(54, 58, 'Reservoir', { size: 13, fill: BLUE })}
      <polygon points="102,56 128,56 146,205 102,205" fill="${MUTED}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="100" y="163" width="106" height="24" fill="${SOFT}" stroke="${INK}" stroke-width="2"/>
      <line x1="104" y1="175" x2="200" y2="175" stroke="${BLUE}" stroke-width="12" stroke-dasharray="14 8" opacity="0.85">
        <animate attributeName="stroke-dashoffset" values="22;0" dur="0.6s" repeatCount="indefinite"/></line>
      <g transform="translate(212 175)"><circle r="24" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
        <g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="1.4s" repeatCount="indefinite"/>${blades}</g><circle r="4" fill="${INK}"/></g>
      ${T(212, 224, 'Turbine', { size: 13 })}
      <rect x="250" y="155" width="46" height="40" rx="6" fill="${ORANGE}" stroke="${INK}" stroke-width="3"/>
      ${T(273, 181, 'G', { size: 18, fill: '#fff' })}${T(276, 224, 'Generator', { size: 13 })}
      <line x1="237" y1="175" x2="250" y2="175" stroke="${INK}" stroke-width="4"/>
      <polyline points="296,175 330,175 330,150 345,150" fill="none" stroke="${YELLOW}" stroke-width="4" stroke-dasharray="8 6">
        <animate attributeName="stroke-dashoffset" values="14;0" dur="0.5s" repeatCount="indefinite"/></polyline>
      <polygon points="345,205 345,148 372,124 399,148 399,205" fill="${SOFT}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="372" cy="170" r="12" fill="${YELLOW}" stroke="${INK}" stroke-width="2">
        <animate attributeName="r" values="11;14;11" dur="1.2s" repeatCount="indefinite"/></circle>
      ${T(372, 224, 'Home', { size: 13 })}`);
  })();
  energySteps.push({
    kind: 'example',
    title: 'Real life: A hydroelectric dam',
    text: '<p>Water stored high up has <b>gravitational potential energy</b>. As it falls it gains <b>kinetic energy</b> and spins a turbine. The generator turns that motion into <b>electrical energy</b> for lights. Some becomes heat, but no energy is destroyed.</p>',
    svg: exnrgDam
  });

  // --- Bouncing ball: mechanical energy turns into heat and sound (interactive) ---
  function exnrgBounceMount(el, api) {
    const G = 10, H0 = 1.4, FLOOR = 158, R = 10, PXM = 95, SLOW = 0.5, VX = 38;   // g, drop height (m), floor y, ball radius, units per metre
    const BX = 250, BW = 34, BASE = 148, BH = 96;
    const bar = (id, x, c) => `<rect x="${BX + x}" y="${BASE}" width="${BW}" height="0" id="${id}" fill="${c}" stroke="${INK}" stroke-width="2"/>`;
    const svg = scene(el, '0 0 400 190', `
      <line x1="10" y1="${FLOOR}" x2="222" y2="${FLOOR}" stroke="${INK}" stroke-width="4"/>
      <line x1="14" y1="${FLOOR - H0 * PXM}" x2="56" y2="${FLOOR - H0 * PXM}" stroke="${MUTED}" stroke-width="2" stroke-dasharray="4 4"/>
      ${T(35, FLOOR - H0 * PXM - 5, `${H0} m`, { size: 13, fill: MUTED })}
      <g id="exnrg-trail" fill="${MUTED}" opacity="0.5"></g>
      <g id="exnrg-ball"><ellipse id="exnrg-bl" rx="${R}" ry="${R}" fill="${ORANGE}" stroke="${INK}" stroke-width="2.5"/></g>
      ${T(325, 20, 'Total energy = 100%', { size: 14 })}
      ${T(325, 40, '', { id: 'exnrg-st', size: 13, fill: MUTED })}
      <line x1="${BX - 6}" y1="${BASE}" x2="${BX + 3 * BW + 30}" y2="${BASE}" stroke="${INK}" stroke-width="2"/>
      ${bar('exnrg-bpe', 0, BLUE)}${bar('exnrg-bke', BW + 8, ORANGE)}${bar('exnrg-bht', 2 * (BW + 8), RED)}
      ${T(BX + BW / 2, 166, 'PE', { size: 13, fill: BLUE })}${T(BX + BW * 1.5 + 8, 166, 'KE', { size: 13, fill: ORANGE })}
      ${T(BX + BW * 2.5 + 16, 166, 'Heat &amp;', { size: 13, fill: RED })}${T(BX + BW * 2.5 + 16, 182, 'sound', { size: 13, fill: RED })}`,
      btnRow([{ id: 'exnrg-b1', label: 'Bouncy ball' }, { id: 'exnrg-b2', label: 'Soft ball' }]));
    const $ = s => svg.querySelector(s);
    let e = 0.8, h, v, x, n, squash, rest, pk;
    const reset = () => { h = H0; v = 0; x = 30; n = 0; squash = 0; rest = 0; pk = H0; $('#exnrg-trail').innerHTML = ''; };
    const b1 = el.querySelector('#exnrg-b1'), b2 = el.querySelector('#exnrg-b2');
    const pick = k => { e = k; reset(); b1.style.borderColor = k > 0.7 ? 'var(--primary)' : ''; b2.style.borderColor = k > 0.7 ? '' : 'var(--primary)'; };
    const on1 = () => pick(0.8), on2 = () => pick(0.5);
    b1.addEventListener('click', on1); b2.addEventListener('click', on2);
    pick(0.8);
    function draw() {
      const cy = FLOOR - R - h * PXM;
      const sq = squash > 0 ? 0.65 : 1;
      const bl = $('#exnrg-bl');
      bl.setAttribute('cx', x); bl.setAttribute('cy', cy + (1 - sq) * R); bl.setAttribute('ry', R * sq); bl.setAttribute('rx', R / Math.sqrt(sq));
      const pe = clamp(h / H0 * 100, 0, 100), ke = clamp(v * v / (2 * G * H0) * 100, 0, 100);
      const ht = clamp(100 - pe - ke, 0, 100);
      [['#exnrg-bpe', pe], ['#exnrg-bke', ke], ['#exnrg-bht', ht]].forEach(([id, val]) => {
        const r = $(id), hh = val / 100 * BH; r.setAttribute('height', hh); r.setAttribute('y', BASE - hh);
      });
      $('#exnrg-st').textContent = rest > 0 ? 'All energy is now heat' : n === 0 ? 'Dropped from 1.4 m' : `Bounce ${n}: rises to ${(Math.round(pk * 100) / 100)} m`;
    }
    api.loop((t, dt) => {
      if (rest > 0) { rest += dt; if (rest > 3) reset(); draw(); return; }
      let d = dt * SLOW;
      squash = Math.max(0, squash - dt);
      v -= G * d; h += v * d; x += VX * d;
      if (h <= 0) {
        h = 0; n++;
        v = -v * e; squash = 0.09;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        g.setAttribute('cx', x); g.setAttribute('cy', FLOOR + 6); g.setAttribute('r', 3); $('#exnrg-trail').appendChild(g);
        pk = v * v / (2 * G);
        if (v < 0.4) { v = 0; rest = 0.001; pk = 0; }
      }
      draw();
    });
    draw();
    return () => { b1.removeEventListener('click', on1); b2.removeEventListener('click', on2); };
  }
  energySteps.push({
    kind: 'example',
    title: 'Real life: A bouncing ball',
    text: '<p>A ball dropped from 1.4 m turns <b>potential energy</b> into <b>kinetic energy</b>. Each bounce, some energy becomes <b>heat</b> and <b>sound</b>, so it rises less high. The total energy stays the same, but less is left for bouncing.</p>',
    mount: exnrgBounceMount
  });

  // --- Archery: elastic potential energy becomes kinetic energy (interactive pull-back slider) ---
  function exnrgBowMount(el, api) {
    const K = 400, M = 0.05, S = 140, BX = 110, AY = 132, TX = 366, EMAX = 50, VPX = 10;   // N/m, kg, units per m, bow x, arrow y, target x, J, units per (m/s)
    const OMEGA = Math.sqrt(K / M);
    const svg = scene(el, '0 0 400 190', `
      ${T(10, 20, '', { id: 'exnrg-e1', size: 14, fill: TEAL, anchor: 'start' })}
      <rect x="10" y="26" width="180" height="12" rx="3" fill="none" stroke="${MUTED}" stroke-width="1.5"/><rect id="exnrg-pe" x="10" y="26" width="0" height="12" rx="3" fill="${TEAL}"/>
      ${T(10, 60, '', { id: 'exnrg-e2', size: 14, fill: ORANGE, anchor: 'start' })}
      <rect x="10" y="66" width="180" height="12" rx="3" fill="none" stroke="${MUTED}" stroke-width="1.5"/><rect id="exnrg-ke" x="10" y="66" width="0" height="12" rx="3" fill="${ORANGE}"/>
      ${T(395, 20, '', { id: 'exnrg-r1', size: 14, anchor: 'end' })}
      ${T(395, 40, '', { id: 'exnrg-r2', size: 14, anchor: 'end' })}
      <line x1="0" y1="176" x2="400" y2="176" stroke="${MUTED}" stroke-width="2"/>
      <line x1="${TX + 8}" y1="98" x2="${TX + 8}" y2="176" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="${TX + 4}" cy="${AY}" rx="9" ry="36" fill="${RED}" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="${TX + 4}" cy="${AY}" rx="6" ry="24" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
      <ellipse cx="${TX + 4}" cy="${AY}" rx="3.5" ry="12" fill="${RED}"/>
      <path id="exnrg-bow" d="" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <polyline id="exnrg-str" points="" fill="none" stroke="${MUTED}" stroke-width="2"/>
      <g id="exnrg-arrow"><line x1="0" y1="0" x2="58" y2="0" stroke="${INK}" stroke-width="3"/><polygon points="66,0 56,-5 56,5" fill="${INK}"/>
        <polygon points="0,0 -7,-5 3,0 -7,5" fill="${RED}"/></g>`,
      sliderRow('Pull back', 'exnrg-pull', 10, 50, 1, 30, '30 cm'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#exnrg-pull'), out = el.querySelector('#exnrg-pull-v');
    const onInput = () => { out.textContent = slider.value + ' cm'; };
    slider.addEventListener('input', onInput);
    let phase = 0, pt = 0, X = 0.3, ax = 0, speed = 0, pe = 0, ke = 0;
    const ease = u => u * u * (3 - 2 * u);
    function frame(dt) {
      pt += dt;
      const cur = +slider.value / 100;
      if (phase === 0) {                      // drawing the bow
        const u = Math.min(1, pt / 1.3);
        X = cur; const p = X * ease(u);
        ax = BX - 12 - p * S; pe = 0.5 * K * p * p; ke = 0; speed = 0;
        if (u >= 1) { phase = 1; pt = 0; }
      } else if (phase === 1) {               // hold and aim
        X = cur; const p = X;
        ax = BX - 12 - p * S; pe = 0.5 * K * p * p; ke = 0; speed = 0;
        if (pt > 0.5) { phase = 2; pt = 0; X = cur; }
      } else if (phase === 2) {               // release (slowed down about 15x so you can see it)
        const th = Math.min(Math.PI / 2, OMEGA * (pt / 15));
        const p = X * Math.cos(th);
        ax = BX - 12 - p * S; pe = 0.5 * K * p * p;
        const E0 = 0.5 * K * X * X; ke = E0 - pe; speed = Math.sqrt(2 * ke / M);
        if (th >= Math.PI / 2) { phase = 3; pt = 0; }
      } else if (phase === 3) {               // flight
        speed = X * OMEGA; ke = 0.5 * M * speed * speed; pe = 0;
        ax += speed * VPX * dt;
        if (ax + 66 >= TX) { ax = TX - 66; phase = 4; pt = 0; }
      } else {                                // stuck in target, then start again
        if (pt > 0.9) { phase = 0; pt = 0; }
      }
      const p = phase <= 2 ? (BX - 12 - ax) / S : 0;
      const tx = BX - 12 - p * S * 0.22;
      const vy = AY;
      $('#exnrg-bow').setAttribute('d', `M${tx},${AY - 42} Q${BX + 10},${AY - 22} ${BX + 8},${AY} Q${BX + 10},${AY + 22} ${tx},${AY + 42}`);
      $('#exnrg-str').setAttribute('points', phase <= 2 ? `${tx},${AY - 42} ${ax},${vy} ${tx},${AY + 42}` : `${BX - 12},${AY - 42} ${BX - 12},${AY + 42}`);
      $('#exnrg-arrow').setAttribute('transform', `translate(${ax} ${AY})`);
      const r = v => Math.round(v * 10) / 10;
      $('#exnrg-pe').setAttribute('width', clamp(pe / EMAX, 0, 1) * 180);
      $('#exnrg-ke').setAttribute('width', clamp(ke / EMAX, 0, 1) * 180);
      $('#exnrg-e1').textContent = `Elastic PE: ${r(pe)} J`;
      $('#exnrg-e2').textContent = `Arrow KE: ${r(ke)} J`;
      $('#exnrg-r1').textContent = `Pull: ${slider.value} cm`;
      $('#exnrg-r2').textContent = `Speed: ${Math.round(speed)} m/s`;
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => { slider.removeEventListener('input', onInput); };
  }
  energySteps.push({
    kind: 'example',
    title: 'Real life: Drawing a bow',
    text: '<p>Pulling back a bow stores <b>elastic potential energy</b>. When released, it becomes the arrow’s <b>kinetic energy</b>. Pull back twice as far and the stored energy is 4 times bigger, so the arrow leaves about 2 times faster (ideal bow).</p>',
    mount: exnrgBowMount
  });

  // =====================================================================
  // MATTER
  // =====================================================================
  const matterSteps = [];

  // --- Ice on the stove: melting and boiling plateaus, particle view (looping scene) ---
  function exmatStoveMount(el, api) {
    const N = 16, CYC = 10, GX0 = 228, GX1 = 392, GY0 = 190, GY1 = 40;
    const rnd = i => { const x = Math.sin(i * 12.9898 + 7.3) * 43758.5453; return x - Math.floor(x); };
    // temperature (deg C) against time for constant heating, drawn schematically
    const temp = t => t < 1.2 ? -20 + 20 * t / 1.2 : t < 3.2 ? 0 : t < 5.8 ? 100 * (t - 3.2) / 2.6 : 100;
    const gx = t => GX0 + t / CYC * (GX1 - GX0), gy = c => GY0 - (c + 20) / 130 * (GY0 - GY1);
    const pts = []; for (let t = 0; t <= 8.8; t += 0.1) pts.push(`${gx(t).toFixed(1)},${gy(temp(t)).toFixed(1)}`);
    const dots = Array.from({ length: N }, (_, i) => `<circle id="exmat-p${i}" r="5.5" fill="${BLUE}" stroke="${INK}" stroke-width="1"/>`).join('');
    const svg = scene(el, '0 0 400 240', `
      ${T(100, 24, '', { id: 'exmat-lab', size: 16, fill: PRIM })}
      <rect id="exmat-water" x="40" y="186" width="120" height="0" fill="${BLUE}" opacity="0.35"/>
      <rect id="exmat-ice" x="62" y="122" width="76" height="58" rx="6" fill="${BLUE}" opacity="0.25" stroke="${BLUE}" stroke-width="2"/>
      <path d="M34,100 L34,190 Q34,196 40,196 L160,196 Q166,196 166,190 L166,100" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      ${dots}
      <g id="exmat-flame">
        <ellipse cx="78" cy="216" rx="11" ry="14" fill="${ORANGE}"><animate attributeName="ry" values="11;16;11" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="100" cy="214" rx="13" ry="18" fill="${YELLOW}"><animate attributeName="ry" values="18;12;18" dur="0.5s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="122" cy="216" rx="11" ry="14" fill="${ORANGE}"><animate attributeName="ry" values="14;9;14" dur="0.45s" repeatCount="indefinite"/></ellipse>
      </g>
      <line x1="30" y1="232" x2="170" y2="232" stroke="${INK}" stroke-width="4"/>
      <line x1="${GX0}" y1="${GY0}" x2="${GX1}" y2="${GY0}" stroke="${INK}" stroke-width="2"/><line x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY1 - 10}" stroke="${INK}" stroke-width="2"/>
      <line x1="${GX0}" y1="${gy(0)}" x2="${GX1}" y2="${gy(0)}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="4 4"/>
      <line x1="${GX0}" y1="${gy(100)}" x2="${GX1}" y2="${gy(100)}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="4 4"/>
      ${T(GX0 - 4, gy(0) + 5, '0°', { size: 13, anchor: 'end', fill: MUTED })}${T(GX0 - 4, gy(100) + 5, '100°', { size: 13, anchor: 'end', fill: MUTED })}
      <polyline points="${pts.join(' ')}" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle id="exmat-dot" r="6" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/>
      ${T(310, 214, 'Time (heating steadily) →', { size: 13, fill: MUTED })}
      ${T(310, 234, '', { id: 'exmat-t', size: 15 })}
      ${T(300, 26, '', { id: 'exmat-note', size: 13, weight: 600, fill: MUTED })}`);
    const $ = s => svg.querySelector(s);
    const P = Array.from({ length: N }, (_, i) => ({
      hx: 71 + (i % 4) * 19, hy: 130 + Math.floor(i / 4) * 14, x: 0, y: 0, vx: 0, vy: 0, m: 0, el: $('#exmat-p' + i)
    }));
    const reset = () => P.forEach(p => { p.x = p.hx; p.y = p.hy; p.m = 0; });
    reset();
    let prev = 0;
    api.loop((t, dt) => {
      const c = t % CYC;
      if (c < prev) reset();
      prev = c;
      const melted = c < 1.2 ? 0 : Math.min(N, Math.floor((c - 1.2) / 2 * N + 0.5) + (c >= 3.2 ? N : 0));
      const gas = c < 5.8 ? 0 : Math.min(N, Math.floor((c - 5.8) / 3 * N + 0.5) + (c >= 8.8 ? N : 0));
      P.forEach((p, i) => {
        const mode = i < gas ? 2 : i < melted ? 1 : 0;
        if (mode !== p.m) {
          p.m = mode;
          const a = rnd(i * 7 + Math.floor(t)) * 6.283, sp = mode === 1 ? 32 : 105;
          p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
          if (mode === 2) p.vy = -Math.abs(p.vy) - 30;
        }
        if (mode === 0) {
          const amp = 1 + (temp(c) + 20) / 40;
          p.x = p.hx + Math.sin(t * 22 + i * 2.1) * amp; p.y = p.hy + Math.cos(t * 19 + i * 1.7) * amp;
        } else {
          p.x += p.vx * dt; p.y += p.vy * dt;
          const top = mode === 2 ? 34 : 134, right = (mode === 2 && p.y < 100) ? 200 : 155, left = (mode === 2 && p.y < 100) ? 30 : 46;
          if (p.x < left) { p.x = left; p.vx = Math.abs(p.vx); }
          if (p.x > right) { p.x = right; p.vx = -Math.abs(p.vx); }
          if (p.y < top) { p.y = top; p.vy = Math.abs(p.vy); }
          if (p.y > 188) { p.y = 188; p.vy = -Math.abs(p.vy); }
          if (mode === 2 && p.y > 100 && p.x > 155) { p.x = 155; p.vx = -Math.abs(p.vx); }
        }
        p.el.setAttribute('cx', p.x); p.el.setAttribute('cy', p.y);
        p.el.setAttribute('fill', mode === 0 ? BLUE : mode === 1 ? TEAL : ORANGE);
      });
      const liq = Math.max(0, melted - gas) / N;
      const wr = $('#exmat-water'), h = 8 + 52 * liq;
      wr.setAttribute('height', liq > 0 ? h : 0); wr.setAttribute('y', 186 - h);
      $('#exmat-ice').setAttribute('opacity', Math.max(0, 0.25 * (1 - melted / N)));
      const tc = temp(Math.min(c, 8.8)), tcy = Math.min(c, 8.8);
      $('#exmat-dot').setAttribute('cx', gx(tcy)); $('#exmat-dot').setAttribute('cy', gy(tc));
      $('#exmat-t').textContent = `Temperature: ${Math.round(tc)} °C`;
      $('#exmat-lab').textContent = c < 1.2 ? 'Solid ice' : c < 3.2 ? 'Melting' : c < 5.8 ? 'Liquid water' : c < 8.8 ? 'Boiling' : 'All steam (gas)';
      $('#exmat-note').textContent = (c >= 1.2 && c < 3.2) || (c >= 5.8 && c < 8.8) ? 'Temperature stays flat' : c < 5.8 ? 'Particles speed up' : '';
    });
    return () => {};
  }
  matterSteps.push({
    kind: 'example',
    title: 'Real life: Ice on the stove',
    text: '<p>Heat ice steadily and its temperature rises, then <b>stops at 0 °C</b> while it melts, rises again, and <b>stops at 100 °C</b> while it boils. Heat energy is being used to free the particles, not to speed them up.</p>',
    mount: exmatStoveMount
  });

  // --- Balloon in the freezer / warm room / hot car: gas particles and temperature (interactive slider) ---
  function exmatBalloonMount(el, api) {
    const N = 14, CX = 108, CY = 96;
    const rnd = i => { const x = Math.sin(i * 78.233 + 1.9) * 43758.5453; return x - Math.floor(x); };
    const dots = Array.from({ length: N }, (_, i) => `<circle id="exmat-g${i}" r="4.5" fill="${ORANGE}" stroke="${INK}" stroke-width="1"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <rect id="exmat-bg" x="0" y="0" width="400" height="190" opacity="0.14"/>
      <line id="exmat-str" x1="${CX}" y1="0" x2="${CX + 6}" y2="0" stroke="${MUTED}" stroke-width="2"/>
      <polygon id="exmat-knot" points="0,0" fill="${RED}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <circle id="exmat-bal" cx="${CX}" cy="${CY}" r="50" fill="${RED}" fill-opacity="0.22" stroke="${RED}" stroke-width="4"/>
      ${dots}
      ${T(218, 28, '', { id: 'exmat-place', size: 16, fill: PRIM, anchor: 'start' })}
      ${T(218, 56, '', { id: 'exmat-tt', size: 14, anchor: 'start' })}
      ${T(218, 80, '', { id: 'exmat-sp', size: 14, anchor: 'start' })}
      ${T(218, 104, '', { id: 'exmat-sz', size: 14, anchor: 'start' })}
      ${T(218, 136, 'Faster particles push the', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(218, 154, 'balloon wall out harder', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(218, 180, 'Sizes and speeds exaggerated', { size: 12, weight: 600, fill: MUTED, anchor: 'start' })}`,
      sliderRow('Temperature', 'exmat-temp', -30, 90, 1, 20, '20 °C'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#exmat-temp'), out = el.querySelector('#exmat-temp-v');
    const P = Array.from({ length: N }, (_, i) => {
      const a = rnd(i) * 6.283, r = Math.sqrt(rnd(i + 30)) * 30;
      return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r, dir: rnd(i + 60) * 6.283, el: $('#exmat-g' + i) };
    });
    let R = 55;
    const onInput = () => { out.textContent = slider.value + ' °C'; };
    slider.addEventListener('input', onInput);
    const lerpc = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
    api.loop((t, dt) => {
      const C = +slider.value, k = (C + 30) / 120;                 // 0 (coldest) .. 1 (hottest)
      const rT = 40 + 30 * k, sp = 22 + 80 * k;
      R += (rT - R) * Math.min(1, dt * 6);
      const bal = $('#exmat-bal'); bal.setAttribute('r', R);
      const by = CY + R;
      $('#exmat-knot').setAttribute('points', `${CX - 6},${by + 9} ${CX + 6},${by + 9} ${CX},${by - 1}`);
      const st = $('#exmat-str'); st.setAttribute('y1', by + 9); st.setAttribute('y2', by + 9 + Math.max(4, 176 - by - 9));
      P.forEach(p => {
        p.x += Math.cos(p.dir) * sp * dt; p.y += Math.sin(p.dir) * sp * dt;
        const dx = p.x - CX, dy = p.y - CY, d = Math.hypot(dx, dy), lim = R - 6;
        if (d > lim) {
          const nx = dx / d, ny = dy / d, vx = Math.cos(p.dir), vy = Math.sin(p.dir), dot = vx * nx + vy * ny;
          p.dir = Math.atan2(vy - 2 * dot * ny, vx - 2 * dot * nx);
          p.x = CX + nx * lim; p.y = CY + ny * lim;
        }
        p.el.setAttribute('cx', p.x); p.el.setAttribute('cy', p.y);
      });
      const bgCol = C < 5 ? [59, 130, 246] : C <= 30 ? [20, 184, 166] : lerpc([234, 179, 8], [239, 68, 68], clamp((C - 30) / 60, 0, 1));
      $('#exmat-bg').setAttribute('fill', `rgb(${bgCol.join(',')})`);
      $('#exmat-place').textContent = C < 0 ? 'In the freezer' : C <= 30 ? 'In a room' : 'In a hot car';
      $('#exmat-tt').textContent = `Temperature: ${C} °C`;
      $('#exmat-sp').textContent = `Particles: ${k < 0.35 ? 'slow' : k < 0.6 ? 'medium' : 'fast'}`;
      $('#exmat-sz').textContent = `Balloon: ${k < 0.35 ? 'shrunk' : k < 0.6 ? 'normal size' : 'puffed up'}`;
    });
    return () => { slider.removeEventListener('input', onInput); };
  }
  matterSteps.push({
    kind: 'example',
    title: 'Real life: A balloon in cold and heat',
    text: '<p>Gas particles are always zooming around and bumping the balloon’s wall. When the air is <b>warmer</b>, the particles move faster and push out harder, so the balloon gets bigger. In the <b>cold</b> they slow down and it shrinks.</p>',
    mount: exmatBalloonMount
  });

  // --- A puddle drying in the sun: evaporation from the surface (SMIL) ---
  const exmatPuddle = (() => {
    const rnd = i => { const x = Math.sin(i * 12.9898 + 3.3) * 43758.5453; return x - Math.floor(x); };
    const rays = Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="-28" x2="0" y2="-38" stroke="${YELLOW}" stroke-width="4" stroke-linecap="round" transform="rotate(${i * 45})"/>`).join('');
    const wisps = [0, 1, 2, 3].map(i => `<ellipse cx="${62 + i * 24}" cy="186" rx="8" ry="5" fill="none" stroke="${MUTED}" stroke-width="2">` +
      `<animate attributeName="cy" values="186;118" dur="3s" begin="${i * 0.75}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0.9;0" dur="3s" begin="${i * 0.75}s" repeatCount="indefinite"/></ellipse>`).join('');
    let liquid = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const x = 232 + c * 23 + (r % 2) * 11, y = 150 + r * 21, k = r * 7 + c;
      liquid += `<circle cx="${x}" cy="${y}" r="7" fill="${BLUE}" stroke="${INK}" stroke-width="1"><animate attributeName="cx" values="${x - 3};${x + 3};${x - 3}" dur="${(0.7 + rnd(k) * 0.6).toFixed(2)}s" repeatCount="indefinite"/>` +
        `<animate attributeName="cy" values="${y + 2};${y - 2};${y + 2}" dur="${(0.8 + rnd(k + 40) * 0.6).toFixed(2)}s" repeatCount="indefinite"/></circle>`;
    }
    const escapers = [[258, 0], [300, 1.1], [345, 2.2]].map(([x, b]) =>
      `<circle cx="${x}" cy="132" r="7" fill="${ORANGE}" stroke="${INK}" stroke-width="1">` +
      `<animate attributeName="cy" values="134;52" dur="3.3s" begin="${b}s" repeatCount="indefinite"/>` +
      `<animate attributeName="cx" values="${x};${x + 14}" dur="3.3s" begin="${b}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="1;1;0" keyTimes="0;0.7;1" dur="3.3s" begin="${b}s" repeatCount="indefinite"/></circle>`).join('');
    return TutorialKit.svg(`
      <clipPath id="exmat-clip"><circle cx="300" cy="128" r="82"/></clipPath>
      <g transform="translate(42 46)"><circle r="20" fill="${YELLOW}" stroke="${ORANGE}" stroke-width="3"/>
        <g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="14s" repeatCount="indefinite"/>${rays}</g></g>
      <rect x="0" y="196" width="200" height="44" fill="${MUTED}" opacity="0.3"/><line x1="0" y1="196" x2="200" y2="196" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="100" cy="197" rx="70" ry="8" fill="${BLUE}" opacity="0.75">
        <animate attributeName="rx" values="72;10;10;72" keyTimes="0;0.85;0.97;1" dur="10s" repeatCount="indefinite"/></ellipse>
      ${wisps}
      ${T(100, 226, 'Puddle dries in the sun', { size: 13 })}
      <line x1="150" y1="188" x2="232" y2="90" stroke="${MUTED}" stroke-width="2" stroke-dasharray="5 5"/>
      <g clip-path="url(#exmat-clip)"><rect x="216" y="46" width="168" height="164" fill="${SOFT}"/>
        <rect x="216" y="136" width="168" height="80" fill="${BLUE}" opacity="0.3"/>
        <line x1="216" y1="136" x2="384" y2="136" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 4"/>
        ${liquid}${escapers}</g>
      <circle cx="300" cy="128" r="82" fill="none" stroke="${INK}" stroke-width="3"/>
      ${T(300, 22, 'Zoom in on the surface', { size: 14, fill: PRIM })}
      ${T(300, 226, 'Fastest particles escape', { size: 13 })}`);
  })();
  matterSteps.push({
    kind: 'example',
    title: 'Real life: A puddle drying up',
    text: '<p>A puddle disappears without ever boiling. Water particles move at different speeds, and the fastest ones at the <b>surface</b> break free and become water vapor. That is <b>evaporation</b>. Boiling is faster and happens throughout the liquid at 100 °C.</p>',
    svg: exmatPuddle
  });

  addTutorialSteps('physics', 'forces', forcesSteps, [
    { term: 'Terminal velocity', definition: 'The steady top speed of a falling object, reached when air resistance equals its weight.' }
  ]);
  addTutorialSteps('physics', 'energy', energySteps, [
    { term: 'Elastic potential energy', definition: 'Energy stored in a stretched or squashed object, like a drawn bow or a spring.' }
  ]);
  addTutorialSteps('physics', 'matter', matterSteps);
})();
