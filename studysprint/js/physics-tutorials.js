(function () {
  'use strict';
  // Physics tutorials, registered via registerTutorial('physics', topicId, {...}).
  // Every scene is self-animating (SMIL / CSS / api.loop). Names are namespaced per topic:
  // frc- (forces), nrg- (energy), mat- (matter), hea- (heat), wav- (waves), ele- (electricity).

  // ---------- shared helpers ----------
  const PRIM = 'var(--primary)', ORANGE = 'var(--t-orange)', BLUE = 'var(--t-blue)', TEAL = 'var(--t-teal)';
  const YELLOW = 'var(--t-yellow)', RED = 'var(--t-red)', GREEN = 'var(--t-green)';
  const SOFT = 'var(--t-soft)', INK = 'var(--t-ink)', MUTED = 'var(--t-muted)';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const f1 = n => (Math.round(n * 10) / 10).toString();
  const f2 = n => (Math.round(n * 100) / 100).toString();

  // <text> helper
  function T(x, y, s, o) {
    o = o || {};
    return `<text${o.id ? ` id="${o.id}"` : ''} x="${x}" y="${y}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" fill="${o.fill || INK}" text-anchor="${o.anchor || 'middle'}"${o.extra ? ' ' + o.extra : ''}>${s}</text>`;
  }

  // Arrow geometry: shaft stops at the base of the head so the tip is exactly (x2,y2).
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

  // Slider row (uses the framework's .scene-slider-row class)
  function sliderRow(label, id, min, max, step, val, out) {
    return `<div class="scene-slider-row"><span style="min-width:70px;flex-shrink:0">${label}</span>` +
      `<input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}" style="min-width:0">` +
      `<span id="${id}-v" style="min-width:62px;text-align:right;flex-shrink:0">${out}</span></div>`;
  }
  function btnRow(buttons) {
    return `<div class="scene-slider-row" style="justify-content:center;gap:8px">${buttons.map(b =>
      `<button type="button" class="scene-btn" id="${b.id}">${b.label}</button>`).join('')}</div>`;
  }

  // Build a mount scene: an <svg> that shares the 240px container with any control rows.
  function scene(el, vb, inner, rows) {
    el.innerHTML = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet" style="flex:1 1 0;min-height:0;width:100%;height:auto">${inner}</svg>${rows || ''}`;
    return el.querySelector('svg');
  }
  function stick(x, gy, col, o) {
    o = o || {};
    // simple stick figure. lean = horizontal offset of the head; arm = [x,y] hand target (optional)
    const lean = o.lean || 0;
    const arm = o.arm ? `<line x1="${x + lean * 0.7}" y1="${gy - 40}" x2="${o.arm[0]}" y2="${o.arm[1]}"/>` : '';
    return `<g stroke="${col}" stroke-width="4" stroke-linecap="round" fill="none">` +
      `<circle cx="${x + lean}" cy="${gy - 58}" r="8" fill="${col}"/>` +
      `<line x1="${x + lean * 0.9}" y1="${gy - 49}" x2="${x + lean * 0.4}" y2="${gy - 24}"/>` +
      `<line x1="${x + lean * 0.4}" y1="${gy - 24}" x2="${x - 9}" y2="${gy}"/>` +
      `<line x1="${x + lean * 0.4}" y1="${gy - 24}" x2="${x + 9}" y2="${gy}"/>${arm}</g>`;
  }

  // =====================================================================
  // FORCES & MOTION
  // =====================================================================
  const frcStep1 = (() => {
    const lane1 = `
      <text x="14" y="70" font-size="18" font-weight="800" fill="${PRIM}">Push</text>
      <line x1="10" y1="100" x2="390" y2="100" stroke="${MUTED}" stroke-width="2"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;100 0;100 0;0 0" keyTimes="0;0.6;0.92;1" dur="4.5s" repeatCount="indefinite"/>
        ${stick(100, 100, INK, { lean: 4, arm: [140, 72] })}
        <rect x="140" y="56" width="44" height="44" rx="4" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
        ${staticArrow(140, 40, 186, 40, RED, 4, 12)}
        ${T(163, 26, '10 N', { size: 14, fill: RED })}
      </g>`;
    const lane2 = `
      <text x="14" y="176" font-size="18" font-weight="800" fill="${PRIM}">Pull</text>
      <line x1="10" y1="205" x2="390" y2="205" stroke="${MUTED}" stroke-width="2"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;100 0;100 0;0 0" keyTimes="0;0.6;0.92;1" dur="4.5s" repeatCount="indefinite"/>
        <rect x="80" y="161" width="44" height="44" rx="4" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>
        <line x1="124" y1="187" x2="200" y2="176" stroke="${INK}" stroke-width="3"/>
        ${stick(222, 205, INK, { lean: 4, arm: [200, 176] })}
        ${staticArrow(80, 150, 126, 150, RED, 4, 12)}
        ${T(103, 138, '10 N', { size: 14, fill: RED })}
      </g>`;
    return TutorialKit.svg(lane1 + lane2 + T(200, 230, 'Force is measured in newtons (N)', { size: 13, fill: MUTED }));
  })();

  function frcTugMount(el, api) {
    const gy = 190, ropeY = 148;
    const svg = scene(el, '0 0 400 240', `
      ${T(200, 24, 'BALANCED', { id: 'frc-t1', size: 18, fill: GREEN })}
      ${T(200, 46, '', { id: 'frc-t2', size: 14 })}
      <line x1="0" y1="${gy}" x2="400" y2="${gy}" stroke="${MUTED}" stroke-width="2"/>
      <line x1="200" y1="${ropeY - 12}" x2="200" y2="${gy + 4}" stroke="${MUTED}" stroke-width="2" stroke-dasharray="4 4"/>
      <g id="frc-teams">
        ${stick(58, gy, BLUE, { lean: -14, arm: [82, ropeY] })}${stick(98, gy, BLUE, { lean: -14, arm: [122, ropeY] })}
        ${stick(302, gy, RED, { lean: 14, arm: [278, ropeY] })}${stick(342, gy, RED, { lean: 14, arm: [318, ropeY] })}
      </g>
      <line x1="80" y1="${ropeY}" x2="320" y2="${ropeY}" stroke="#a16207" stroke-width="5" stroke-linecap="round"/>
      <g id="frc-knot"><path d="M0,${ropeY} L0,${ropeY - 22} L16,${ropeY - 15} L0,${ropeY - 8}" fill="${YELLOW}" stroke="${INK}" stroke-width="1.5"/><circle cx="0" cy="${ropeY}" r="6" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/></g>
      ${arrowHTML('frc-al', BLUE, 5)}${arrowHTML('frc-ar', RED, 5)}
      ${T(0, 100, '', { id: 'frc-ll', size: 14, fill: BLUE })}${T(0, 100, '', { id: 'frc-lr', size: 14, fill: RED })}
      ${T(200, 226, '', { id: 'frc-t3', size: 14, fill: MUTED })}`);
    const $ = s => svg.querySelector(s);
    let last = '';
    api.loop(t => {
      const c = t % 8, bal = c < 4, tau = bal ? 0 : c - 4;
      const dx = bal ? 0 : 0.5 * 6.25 * tau * tau;
      const fl = bal ? 60 : 40, fr = bal ? 60 : 80;
      const kx = 200 + dx, sway = Math.sin(t * 7) * 1.6;
      $('#frc-knot').setAttribute('transform', `translate(${kx + sway * 0.4},0)`);
      $('#frc-teams').setAttribute('transform', `translate(${dx * 0.5 + sway},0)`);
      setArrow(svg, 'frc-al', kx - 6, 112, kx - 6 - fl * 1.4, 112, 5, 14);
      setArrow(svg, 'frc-ar', kx + 6, 112, kx + 6 + fr * 1.4, 112, 5, 14);
      const ll = $('#frc-ll'), lr = $('#frc-lr');
      ll.setAttribute('x', kx - 6 - fl * 0.7); lr.setAttribute('x', kx + 6 + fr * 0.7);
      ll.textContent = fl + ' N'; lr.textContent = fr + ' N';
      if (last !== (bal ? 'b' : 'u')) {
        last = bal ? 'b' : 'u';
        const t1 = $('#frc-t1');
        t1.textContent = bal ? 'BALANCED forces' : 'UNBALANCED forces';
        t1.setAttribute('fill', bal ? GREEN : RED);
        $('#frc-t2').textContent = bal ? 'Net force = 60 − 60 = 0 N' : 'Net force = 80 − 40 = 40 N to the right';
        $('#frc-t3').textContent = bal ? 'No change in motion' : 'The knot speeds up to the right';
      }
    });
  }

  function frcNewtonMount(el, api) {
    const gy = 140;
    const svg = scene(el, '0 0 400 172', `
      ${T(200, 22, '', { id: 'frc-form', size: 17, fill: PRIM })}
      ${T(200, 42, '', { id: 'frc-spd', size: 14, fill: MUTED })}
      <rect x="0" y="${gy}" width="400" height="32" fill="#e5e7eb"/>
      <line x1="0" y1="${gy}" x2="400" y2="${gy}" stroke="${MUTED}" stroke-width="2"/>
      <g id="frc-cart">
        <rect id="frc-body" x="0" y="${gy - 36}" width="40" height="26" rx="4" fill="${PRIM}"/>
        <circle id="frc-w1" cx="10" cy="${gy - 6}" r="6" fill="${INK}"/><circle id="frc-w2" cx="30" cy="${gy - 6}" r="6" fill="${INK}"/>
        ${T(20, gy - 18, '', { id: 'frc-mt', size: 13, fill: '#fff' })}
        ${arrowHTML('frc-arrow', RED, 5)}${T(0, gy - 42, '', { id: 'frc-flab', size: 14, fill: RED })}
      </g>`,
      sliderRow('Force', 'frc-F', 10, 60, 5, 30, '30 N') + sliderRow('Mass', 'frc-M', 1, 10, 1, 3, '3 kg'));
    const $ = s => el.querySelector(s);
    let F = 30, M = 3, ts = 0, hold = 0;
    function pose(x, W) {
      $('#frc-cart').setAttribute('transform', `translate(${x},0)`);
      $('#frc-body').setAttribute('width', W);
      $('#frc-w1').setAttribute('cx', 10); $('#frc-w2').setAttribute('cx', W - 10);
      $('#frc-mt').setAttribute('x', W / 2); $('#frc-mt').textContent = M + ' kg';
      const L = F * 1.5;
      setArrow(svg, 'frc-arrow', -L, gy - 23, 0, gy - 23, 5, 14);
      $('#frc-flab').setAttribute('x', -L / 2); $('#frc-flab').textContent = F + ' N';
    }
    function text(v) {
      const a = F / M;
      $('#frc-form').textContent = `a = F ÷ m = ${F} ÷ ${M} = ${f1(a)} m/s²`;
      $('#frc-spd').textContent = `speed = ${f1(v)} m/s`;
    }
    function upd() {
      $('#frc-F-v').textContent = F + ' N'; $('#frc-M-v').textContent = M + ' kg';
      ts = 0; hold = 0;
    }
    $('#frc-F').addEventListener('input', e => { F = +e.target.value; upd(); });
    $('#frc-M').addEventListener('input', e => { M = +e.target.value; upd(); });
    api.loop((t, dt) => {
      const W = 34 + M * 3, a = F / M;
      if (hold > 0) { hold -= dt; if (hold <= 0) ts = 0; }
      else {
        ts += dt;
        const x0 = 110 + 8 * 0.5 * a * ts * ts;
        if (x0 + W > 390 || ts > 5) hold = 0.7;
      }
      const x = 110 + 8 * 0.5 * a * ts * ts;
      pose(Math.min(x, 390 - W), W);
      text(a * ts);
    });
  }

  function frcFrictionMount(el, api) {
    const gy = 140;
    const surfaces = [
      { name: 'Ice', a: 6, fill: '#dbeafe', msg: 'Very little friction — it keeps going!', fr: 10 },
      { name: 'Wood', a: 45, fill: '#d6a86b', msg: 'Friction slows it down and stops it.', fr: 45 },
      { name: 'Carpet', a: 140, fill: '#f0a0a0', msg: 'Lots of friction — it stops quickly.', fr: 70 }
    ];
    const svg = scene(el, '0 0 400 196', `
      ${T(200, 22, '', { id: 'frc-sn', size: 16, fill: PRIM })}
      <rect id="frc-ground" x="0" y="${gy}" width="400" height="30"/>
      <g id="frc-deco" stroke-width="2" fill="none"></g>
      <g id="frc-puck"><rect x="0" y="${gy - 18}" width="36" height="18" rx="7" fill="${INK}"/>
        ${arrowHTML('frc-fa', RED, 5)}${T(0, gy - 30, 'friction', { id: 'frc-fl', size: 13, fill: RED })}</g>
      ${T(200, 190, '', { id: 'frc-msg', size: 14, fill: INK })}`,
      btnRow([{ id: 'frc-s0', label: 'Ice' }, { id: 'frc-s1', label: 'Wood' }, { id: 'frc-s2', label: 'Carpet' }]));
    const $ = s => el.querySelector(s);
    let si = 1, x = 64, v = 140, phase = 'run', hold = 0;
    function deco() {
      const d = $('#frc-deco'); let h = '';
      if (si === 0) { for (let i = 0; i < 6; i++) h += `<line x1="${30 + i * 70}" y1="${gy + 8}" x2="${60 + i * 70}" y2="${gy + 4}" stroke="#fff"/>`; }
      if (si === 1) { for (let i = 0; i < 4; i++) h += `<path d="M0,${gy + 6 + i * 6} Q100,${gy + 2 + i * 6} 200,${gy + 6 + i * 6} T400,${gy + 6 + i * 6}" stroke="#a16207" opacity=".6"/>`; }
      if (si === 2) { for (let i = 0; i < 40; i++) h += `<line x1="${5 + i * 10}" y1="${gy}" x2="${5 + i * 10}" y2="${gy + 7}" stroke="#dc2626" opacity=".7"/>`; }
      d.innerHTML = h;
      $('#frc-ground').setAttribute('fill', surfaces[si].fill);
      $('#frc-sn').textContent = 'Surface: ' + surfaces[si].name;
      [0, 1, 2].forEach(i => { const b = $('#frc-s' + i); b.style.borderColor = i === si ? 'var(--primary)' : ''; b.style.color = i === si ? 'var(--primary)' : ''; });
    }
    function restart() { x = 64; v = 140; phase = 'run'; hold = 0; }
    [0, 1, 2].forEach(i => $('#frc-s' + i).addEventListener('click', () => { si = i; deco(); restart(); }));
    deco();
    api.loop((t, dt) => {
      const s = surfaces[si];
      if (phase === 'run') {
        x += v * dt; v = Math.max(0, v - s.a * dt);
        if (v <= 0) { phase = 'hold'; hold = 1.6; }
        else if (x > 410) { phase = 'hold'; hold = 0.6; }
      } else { hold -= dt; if (hold <= 0) restart(); }
      $('#frc-puck').setAttribute('transform', `translate(${Math.min(x, 420)},0)`);
      const moving = phase === 'run';
      $('#frc-fa').style.display = moving ? '' : 'none';
      $('#frc-fl').style.display = moving ? '' : 'none';
      if (moving) {
        const L = s.fr * 0.6 + 6;
        setArrow(svg, 'frc-fa', 0, gy - 9, -L, gy - 9, 5, 12);
        $('#frc-fl').setAttribute('x', -L / 2);
      }
      $('#frc-msg').textContent = moving ? (si === 0 ? 'Sliding… inertia keeps it moving' : 'Sliding… friction pushes back') : (x > 410 ? s.msg : s.msg);
    });
  }

  function frcBooksMount(el, api) {
    const tableTop = 150, bh = 20, cx = 135;
    const cols = [PRIM, ORANGE, TEAL, RED];
    const svg = scene(el, '0 0 400 196', `
      ${T(135, 26, 'Balanced forces:', { size: 15, fill: GREEN })}${T(135, 46, '', { id: 'frc-net', size: 15, fill: GREEN })}
      <rect x="25" y="${tableTop}" width="220" height="10" rx="2" fill="#a16207"/>
      <rect x="40" y="${tableTop + 10}" width="12" height="34" fill="#a16207"/><rect x="218" y="${tableTop + 10}" width="12" height="34" fill="#a16207"/>
      <g id="frc-books"></g>
      <rect x="272" y="8" width="122" height="180" rx="10" fill="#fff" stroke="${MUTED}" stroke-dasharray="4 4" opacity=".9"/>
      ${T(333, 28, 'Forces on books', { size: 13, fill: MUTED })}
      ${T(333, 50, '', { id: 'frc-upl', size: 13, fill: BLUE })}
      <g id="frc-fbd">${arrowHTML('frc-up', BLUE, 5)}${arrowHTML('frc-dn', RED, 5)}<circle cx="333" cy="108" r="7" fill="${INK}"/></g>
      ${T(333, 182, '', { id: 'frc-dnl', size: 13, fill: RED })}`,
      btnRow([{ id: 'frc-add', label: '+ Add a book' }, { id: 'frc-rem', label: '− Remove a book' }]));
    const $ = s => el.querySelector(s);
    const books = [];
    function addBook() { if (books.length >= 4) return; books.push({ y: -30, vy: 0, landed: false, c: cols[books.length % 4] }); }
    function remBook() { books.pop(); }
    addBook(); addBook();
    books.forEach((b, i) => { b.y = tableTop - bh * (i + 1); b.landed = true; });
    $('#frc-add').addEventListener('click', addBook);
    $('#frc-rem').addEventListener('click', remBook);
    api.loop((t, dt) => {
      let n = 0, h = '';
      books.forEach((b, i) => {
        const target = tableTop - bh * (i + 1);
        if (!b.landed) { b.vy += 700 * dt; b.y += b.vy * dt; if (b.y >= target) { b.y = target; b.landed = true; } }
        else b.y = target;
        if (b.landed) n++;
        h += `<rect x="${cx - 45}" y="${b.y}" width="90" height="${bh - 1}" rx="3" fill="${b.c}" stroke="${INK}" stroke-width="1.5"/>` +
          `<text x="${cx}" y="${b.y + 14}" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">5 N</text>`;
      });
      $('#frc-books').innerHTML = h;
      const W = 5 * n, L = n ? 10 + 10 * n : 0;
      const pulse = 0.78 + 0.22 * Math.sin(t * 4);
      $('#frc-fbd').setAttribute('opacity', pulse);
      $('#frc-up').style.display = $('#frc-dn').style.display = n ? '' : 'none';
      if (n) { setArrow(svg, 'frc-up', 333, 108, 333, 108 - L, 5, 13); setArrow(svg, 'frc-dn', 333, 108, 333, 108 + L, 5, 13); }
      $('#frc-upl').textContent = `Push up: ${W} N`;
      $('#frc-dnl').textContent = `Weight: ${W} N`;
      $('#frc-net').textContent = `net force = ${W} − ${W} = 0 N`;
    });
  }

  registerTutorial('physics', 'forces', {
    title: 'Forces & Motion',
    keyTerms: [
      { term: 'Force', definition: 'A push or a pull on an object, measured in newtons (N).' },
      { term: 'Net force', definition: 'All the forces on an object added together, with direction. Balanced forces give a net force of 0.' },
      { term: 'Acceleration', definition: 'How quickly an object’s speed or direction changes. F = m × a.' },
      { term: 'Friction', definition: 'A force that opposes motion between two surfaces that touch.' },
      { term: 'Inertia', definition: 'An object’s tendency to keep doing what it is doing (Newton’s 1st law).' },
      { term: 'Weight', definition: 'The force of gravity pulling on an object, in newtons. Mass (kg) is how much matter it has.' }
    ],
    steps: [
      { title: 'A force is a push or a pull',
        text: '<p>A <b>force</b> is a push or a pull. Forces can start an object moving, stop it, or change its direction. We measure force in <b>newtons (N)</b>, and every force has a direction shown by an arrow.</p>',
        svg: frcStep1 },
      { title: 'Balanced or unbalanced?',
        text: '<p>Forces are added up to find the <b>net force</b> (right is positive). <b>Balanced</b> forces cancel to 0 N, so the motion does not change. <b>Unbalanced</b> forces make the object speed up, slow down, or turn.</p>',
        mount: frcTugMount },
      { title: 'Newton’s 2nd law: F = m × a',
        text: '<p><b>Acceleration</b> is how fast speed changes (speed is in m/s). Newton’s 2nd law: F = m × a. Try it: more force gives more acceleration; more mass gives less.</p>',
        mount: frcNewtonMount },
      { title: 'Friction and inertia',
        text: '<p><b>Inertia</b> (Newton’s 1st law): a moving object keeps moving in a straight line unless a force acts on it. <b>Friction</b> is that force. Pick a surface and watch the puck.</p>',
        mount: frcFrictionMount },
      { title: 'Weight and Newton’s 3rd law',
        text: '<p>Gravity pulls the books down; that force is their <b>weight</b>. The table pushes up with an equal force, so the net force is 0 N. Newton’s 3rd law: forces come in equal, opposite pairs.</p>',
        mount: frcBooksMount }
    ]
  });

  // =====================================================================
  // ENERGY & WORK
  // =====================================================================
  function nrgHalfPipeMount(el, api) {
    const xc = 135, hw = 120, yb = 200, hd = 110, A = 112;
    const curveY = x => yb - hd * Math.pow((x - xc) / hw, 2);
    const Emax = yb - curveY(xc + A), S = 100 / Emax;
    const bar = (id, x, c) => `<rect id="${id}" x="${x}" y="100" width="26" height="0" fill="${c}" stroke="${INK}" stroke-width="1.5"/>`;
    const svg = scene(el, '0 0 400 240', `
      <path d="M15,90 Q135,310 255,90 L255,236 L15,236 Z" fill="#cbd5e1"/>
      <path d="M15,90 Q135,310 255,90" fill="none" stroke="${INK}" stroke-width="4"/>
      ${T(135, 26, '', { id: 'nrg-cap', size: 15, fill: PRIM })}
      <g id="nrg-sk"><rect x="-15" y="-7" width="30" height="5" rx="2" fill="${INK}"/><circle cx="-9" cy="-1" r="3" fill="${INK}"/><circle cx="9" cy="-1" r="3" fill="${INK}"/>
        <line x1="0" y1="-7" x2="0" y2="-26" stroke="${PRIM}" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="-33" r="7" fill="${PRIM}"/></g>
      ${T(328, 82, 'Energy', { size: 14, fill: MUTED })}
      <line x1="272" y1="200" x2="386" y2="200" stroke="${INK}" stroke-width="2"/>
      ${bar('nrg-bpe', 277, BLUE)}${bar('nrg-bke', 315, ORANGE)}${bar('nrg-btot', 353, PRIM)}
      ${T(290, 220, 'PE', { fill: BLUE })}${T(328, 220, 'KE', { fill: ORANGE })}${T(366, 220, 'Total', { fill: PRIM })}`);
    const $ = s => svg.querySelector(s);
    let last = '';
    api.loop(t => {
      const x = xc + A * Math.cos(t * Math.PI / 2);
      const y = curveY(x), H = yb - y, ke = Math.max(0, Emax - H);
      const slope = -2 * hd * (x - xc) / (hw * hw);
      const ang = clamp(Math.atan(slope) * 180 / Math.PI, -40, 40);
      $('#nrg-sk').setAttribute('transform', `translate(${x},${y - 1}) rotate(${ang})`);
      const set = (id, v) => { const b = $(id), h = Math.max(0.5, v * S); b.setAttribute('height', h); b.setAttribute('y', 200 - h); };
      set('#nrg-bpe', H); set('#nrg-bke', ke); set('#nrg-btot', Emax);
      const fr = ke / Emax;
      const cap = fr < 0.04 ? 'Top: all PE, no KE' : fr > 0.96 ? 'Bottom: all KE, least PE' : 'PE and KE trade places';
      if (cap !== last) { last = cap; $('#nrg-cap').textContent = cap; }
    });
  }

  function nrgPEMount(el, api) {
    const gy = 150;
    let ticks = '';
    [0, 5, 10, 15, 20].forEach(h => {
      ticks += `<line x1="46" y1="${gy - h * 5}" x2="56" y2="${gy - h * 5}" stroke="${MUTED}" stroke-width="2"/>` +
        (h ? T(40, gy - h * 5 + 4, h + ' m', { size: 13, anchor: 'end', fill: MUTED, weight: 600 }) : '');
    });
    const svg = scene(el, '0 0 400 168', `
      <rect x="0" y="${gy}" width="400" height="18" fill="#e5e7eb"/><line x1="0" y1="${gy}" x2="400" y2="${gy}" stroke="${MUTED}" stroke-width="2"/>
      <line x1="56" y1="${gy}" x2="56" y2="${gy - 100}" stroke="${MUTED}" stroke-width="2"/>${ticks}
      <ellipse id="nrg-sh" cx="120" cy="${gy + 1}" rx="10" ry="3" fill="#94a3b8"/>
      <circle id="nrg-ball" cx="120" cy="${gy - 20}" r="10" fill="${PRIM}" stroke="${INK}" stroke-width="2"/>
      ${T(205, 22, 'PE = m × g × h  (g = 10 m/s²)', { size: 14, anchor: 'start', fill: MUTED })}
      ${T(205, 46, '', { id: 'nrg-f', size: 15, anchor: 'start', fill: PRIM })}
      ${T(205, 84, '', { id: 'nrg-pe', size: 15, anchor: 'start', fill: BLUE })}
      ${T(205, 108, '', { id: 'nrg-ke', size: 15, anchor: 'start', fill: ORANGE })}
      ${T(205, 132, '', { id: 'nrg-v', size: 14, anchor: 'start', fill: MUTED })}`,
      sliderRow('Mass', 'nrg-m', 1, 10, 1, 4, '4 kg') + sliderRow('Height', 'nrg-h', 1, 20, 1, 5, '5 m'));
    const $ = s => el.querySelector(s);
    let m = 4, h = 5, phase = 'hold', timer = 1.2, tf = 0;
    function reset() { phase = 'hold'; timer = 1.4; tf = 0; $('#nrg-m-v').textContent = m + ' kg'; $('#nrg-h-v').textContent = h + ' m'; }
    $('#nrg-m').addEventListener('input', e => { m = +e.target.value; reset(); });
    $('#nrg-h').addEventListener('input', e => { h = +e.target.value; reset(); });
    api.loop((t, dt) => {
      let s = 0;
      if (phase === 'hold') { timer -= dt; if (timer <= 0) { phase = 'fall'; tf = 0; } }
      else if (phase === 'fall') { tf += dt; s = 5 * tf * tf; if (s >= h) { s = h; phase = 'land'; timer = 1.6; } }
      else { s = h; timer -= dt; if (timer <= 0) reset(); }
      const r = 6 + m * 1.2, hh = h - s, v = phase === 'hold' ? 0 : (phase === 'land' ? Math.sqrt(2 * 10 * h) : 10 * tf);
      const ball = $('#nrg-ball');
      ball.setAttribute('r', r); ball.setAttribute('cy', gy - hh * 5 - r);
      $('#nrg-sh').setAttribute('rx', r * (0.6 + 0.4 * (1 - hh / 20)));
      $('#nrg-f').textContent = `= ${m} × 10 × ${h} = ${m * 10 * h} J`;
      $('#nrg-pe').textContent = `PE now: ${Math.round(m * 10 * hh)} J`;
      $('#nrg-ke').textContent = `KE now: ${Math.round(0.5 * m * v * v)} J`;
      $('#nrg-v').textContent = `speed: ${f1(v)} m/s`;
    });
  }

  function nrgKEMount(el, api) {
    const svg = scene(el, '0 0 400 172', `
      ${T(200, 22, '', { id: 'nrg-kf', size: 15, fill: PRIM })}
      <line x1="0" y1="72" x2="400" y2="72" stroke="${MUTED}" stroke-width="2"/>
      <g id="nrg-car"><g id="nrg-lines" stroke="${MUTED}" stroke-width="3" stroke-linecap="round"><line/><line/><line/></g>
        <rect id="nrg-cb" x="0" y="44" width="46" height="18" rx="4" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
        <rect id="nrg-cc" x="10" y="32" width="24" height="14" rx="3" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
        <circle id="nrg-w1" cx="10" cy="64" r="7" fill="${INK}"/><circle id="nrg-w2" cx="36" cy="64" r="7" fill="${INK}"/></g>
      ${T(80, 108, 'Now', { anchor: 'end', fill: ORANGE })}${T(80, 130, '2× mass', { anchor: 'end', fill: BLUE })}${T(80, 152, '2× speed', { anchor: 'end', fill: RED })}
      <rect id="nrg-b1" x="86" y="96" width="50" height="16" fill="${ORANGE}"/><rect id="nrg-b2" x="86" y="118" width="100" height="16" fill="${BLUE}"/><rect id="nrg-b3" x="86" y="140" width="200" height="16" fill="${RED}"/>
      ${T(0, 109, '', { id: 'nrg-t1', size: 13, anchor: 'start' })}${T(0, 131, '', { id: 'nrg-t2', size: 13, anchor: 'start' })}${T(0, 153, '', { id: 'nrg-t3', size: 13, anchor: 'start' })}`,
      sliderRow('Mass', 'nrg-km', 1, 10, 1, 4, '4 kg') + sliderRow('Speed', 'nrg-kv', 1, 10, 1, 3, '3 m/s'));
    const $ = s => el.querySelector(s);
    let m = 4, v = 3, x = 20;
    function upd() {
      $('#nrg-km-v').textContent = m + ' kg'; $('#nrg-kv-v').textContent = v + ' m/s';
      const ke = 0.5 * m * v * v;
      $('#nrg-kf').textContent = `KE = ½ × ${m} × ${v}² = ${f1(ke)} J`;
      [[1, ke], [2, 2 * ke], [3, 4 * ke]].forEach(([i, val]) => {
        const w = i === 1 ? 50 : i === 2 ? 100 : 200;
        $('#nrg-b' + i).setAttribute('width', w);
        const tx = $('#nrg-t' + i); tx.setAttribute('x', 86 + w + 6); tx.textContent = f1(val) + ' J';
      });
    }
    $('#nrg-km').addEventListener('input', e => { m = +e.target.value; upd(); });
    $('#nrg-kv').addEventListener('input', e => { v = +e.target.value; upd(); });
    upd();
    api.loop((t, dt) => {
      const W = 34 + m * 4;
      x += v * 26 * dt; if (x > 410) x = -W - 30;
      $('#nrg-car').setAttribute('transform', `translate(${x},0)`);
      $('#nrg-cb').setAttribute('width', W); $('#nrg-cc').setAttribute('x', W * 0.25); $('#nrg-cc').setAttribute('width', W * 0.5);
      $('#nrg-w1').setAttribute('cx', 10); $('#nrg-w2').setAttribute('cx', W - 10);
      $('#nrg-lines').querySelectorAll('line').forEach((l, i) => {
        l.setAttribute('x1', -6); l.setAttribute('x2', -6 - (v * 4 + 4)); l.setAttribute('y1', 44 + i * 9); l.setAttribute('y2', 44 + i * 9);
      });
    });
  }

  function nrgWorkMount(el, api) {
    const gy = 112, x0 = 64, ppm = 19;
    const svg = scene(el, '0 0 400 172', `
      ${T(200, 22, '', { id: 'nrg-wf', size: 16, fill: PRIM })}
      <line x1="0" y1="${gy}" x2="400" y2="${gy}" stroke="${MUTED}" stroke-width="2"/>
      <line x1="${x0}" y1="50" x2="${x0}" y2="138" stroke="${MUTED}" stroke-width="2" stroke-dasharray="4 4"/>
      <line id="nrg-endl" x1="0" y1="50" x2="0" y2="138" stroke="${MUTED}" stroke-width="2" stroke-dasharray="4 4"/>
      <g id="nrg-wbox"><rect x="0" y="${gy - 42}" width="42" height="42" rx="4" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>
        ${arrowHTML('nrg-wa', RED, 5)}${T(-30, gy - 62, '', { id: 'nrg-wl', size: 14, fill: RED })}</g>
      <line id="nrg-brk" x1="${x0}" y1="128" x2="200" y2="128" stroke="${INK}" stroke-width="2"/>
      ${T(200, 152, '', { id: 'nrg-wd', size: 14, fill: INK })}`,
      sliderRow('Force', 'nrg-wF', 5, 40, 5, 20, '20 N') + sliderRow('Distance', 'nrg-wD', 2, 14, 1, 5, '5 m'));
    const $ = s => el.querySelector(s);
    let F = 20, D = 5, ts = 0;
    function upd() {
      $('#nrg-wF-v').textContent = F + ' N'; $('#nrg-wD-v').textContent = D + ' m';
      $('#nrg-wf').textContent = `Work = F × d = ${F} × ${D} = ${F * D} J`;
      const xe = x0 + 42 + D * ppm;
      $('#nrg-endl').setAttribute('x1', xe); $('#nrg-endl').setAttribute('x2', xe);
      const b = $('#nrg-brk'); b.setAttribute('x1', x0 + 42); b.setAttribute('x2', xe);
      $('#nrg-wd').setAttribute('x', (x0 + 42 + xe) / 2); $('#nrg-wd').textContent = `distance d = ${D} m`;
      ts = 0;
    }
    $('#nrg-wF').addEventListener('input', e => { F = +e.target.value; upd(); });
    $('#nrg-wD').addEventListener('input', e => { D = +e.target.value; upd(); });
    upd();
    api.loop((t, dt) => {
      ts += dt;
      const dur = 0.6 + D * 0.22, k = clamp(ts / dur, 0, 1);
      const x = x0 + D * ppm * k;
      if (ts > dur + 1.2) ts = 0;
      $('#nrg-wbox').setAttribute('transform', `translate(${x},0)`);
      const L = 16 + F * 1.3;
      setArrow(svg, 'nrg-wa', -L, gy - 21, 0, gy - 21, 5, 13);
      const wl = $('#nrg-wl'); wl.setAttribute('x', -L / 2); wl.textContent = F + ' N';
    });
  }

  const nrgStep5 = (() => {
    const flow = (x1, x2, y, c, begin) => `<circle r="5" fill="${c}"><animateMotion dur="1.4s" begin="-${begin}s" repeatCount="indefinite" path="M${x1},${y} L${x2},${y}"/></circle>`;
    return TutorialKit.svg(`
      ${T(200, 24, 'Chemical  →  Kinetic  →  Thermal', { size: 16, fill: PRIM })}
      <!-- battery: chemical -->
      <rect x="40" y="82" width="42" height="64" rx="5" fill="#e5e7eb" stroke="${INK}" stroke-width="3"/>
      <rect x="54" y="74" width="14" height="8" fill="${INK}"/>
      <rect x="44" y="104" width="34" height="38" rx="3" fill="${YELLOW}"><animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite"/></rect>
      ${T(61, 100, '+', { size: 15 })}
      ${T(61, 178, 'Chemical', { size: 14 })}${T(61, 196, 'energy', { size: 14 })}
      ${T(61, 214, '(battery)', { size: 13, fill: MUTED, weight: 600 })}
      <!-- fan: kinetic -->
      <circle cx="200" cy="114" r="38" fill="none" stroke="${INK}" stroke-width="3"/>
      <g><animateTransform attributeName="transform" type="rotate" from="0 200 114" to="360 200 114" dur="0.9s" repeatCount="indefinite"/>
        <path d="M200,114 C188,88 212,80 206,104 Z" fill="${TEAL}"/><path d="M200,114 C226,102 232,126 208,120 Z" fill="${TEAL}"/><path d="M200,114 C194,140 172,128 192,120 Z" fill="${TEAL}"/></g>
      <circle cx="200" cy="114" r="6" fill="${INK}"/>
      ${T(200, 178, 'Kinetic', { size: 14 })}${T(200, 196, 'energy', { size: 14 })}${T(200, 214, '(spinning fan)', { size: 13, fill: MUTED, weight: 600 })}
      <!-- heat: thermal -->
      <g fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round">
        <path d="M322,150 q-8,-12 0,-24 q8,-12 0,-24"><animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 8;0 -12" dur="1.6s" repeatCount="indefinite"/></path>
        <path d="M344,150 q-8,-12 0,-24 q8,-12 0,-24"><animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="-0.5s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 8;0 -12" dur="1.6s" begin="-0.5s" repeatCount="indefinite"/></path>
        <path d="M366,150 q-8,-12 0,-24 q8,-12 0,-24"><animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="-1s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 8;0 -12" dur="1.6s" begin="-1s" repeatCount="indefinite"/></path>
      </g>
      ${T(344, 178, 'Thermal', { size: 14 })}${T(344, 196, 'energy', { size: 14 })}${T(344, 214, '(heat)', { size: 13, fill: MUTED, weight: 600 })}
      <!-- arrows with flowing energy -->
      ${staticArrow(96, 114, 150, 114, MUTED, 3, 10)}${flow(96, 150, 114, YELLOW, 0)}${flow(96, 150, 114, YELLOW, 0.7)}
      ${staticArrow(250, 114, 300, 114, MUTED, 3, 10)}${flow(250, 300, 114, ORANGE, 0.2)}${flow(250, 300, 114, ORANGE, 0.9)}
      ${T(123, 100, 'wire', { size: 13, fill: MUTED, weight: 600 })}${T(275, 100, 'friction', { size: 13, fill: MUTED, weight: 600 })}`);
  })();

  registerTutorial('physics', 'energy', {
    title: 'Energy & Work',
    keyTerms: [
      { term: 'Energy', definition: 'The ability to cause change or do work, measured in joules (J).' },
      { term: 'Kinetic energy', definition: 'The energy of motion: KE = ½ × m × v².' },
      { term: 'Potential energy', definition: 'Stored energy due to position or height: PE = m × g × h.' },
      { term: 'Work', definition: 'Force moving an object through a distance: Work = F × d, in joules.' },
      { term: 'Thermal energy', definition: 'The energy of moving particles, which we feel as heat.' },
      { term: 'Chemical energy', definition: 'Energy stored in the bonds of molecules, like in food or batteries.' }
    ],
    steps: [
      { title: 'Potential and kinetic energy',
        text: '<p><b>Potential energy (PE)</b> is stored energy from height or position. <b>Kinetic energy (KE)</b> is the energy of motion. Going down, PE turns into KE; going up, KE turns back into PE. On this ideal ramp the total stays the same.</p>',
        mount: nrgHalfPipeMount },
      { title: 'Potential energy: PE = m × g × h',
        text: '<p>PE = mass × gravity (g = 10 m/s²) × height. Energy is measured in <b>joules (J)</b>. Change the mass or height, then watch the drop: the PE turns into KE, so KE at the bottom equals the PE at the top.</p>',
        mount: nrgPEMount },
      { title: 'Kinetic energy: KE = ½mv²',
        text: '<p><b>KE = ½ × m × v²</b>. Speed is squared, so doubling the speed makes KE four times bigger. Doubling the mass only doubles it. Speed matters most!</p>',
        mount: nrgKEMount },
      { title: 'Work: Force × distance',
        text: '<p><b>Work</b> is done when a force moves an object: Work = Force × distance. Pushing with 20 N for 5 m does 100 J of work. Work transfers energy, so it is measured in joules too.</p>',
        mount: nrgWorkMount },
      { title: 'Energy changes form',
        text: '<p>A battery stores <b>chemical energy</b>. The fan turns it into <b>kinetic energy</b>, and friction turns some into <b>thermal energy</b> (heat). Energy is never used up — it only changes form.</p>',
        svg: nrgStep5 }
    ]
  });

  // =====================================================================
  // MATTER & STATES
  // =====================================================================
  const rnd = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

  const matStep1 = (() => {
    const bx = [10, 142, 274], by = 34, bw = 116, bh = 124;
    let out = T(200, 22, 'Particles in a solid, a liquid and a gas', { size: 14, fill: MUTED });
    const box = (x, c) => `<rect x="${x}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="${SOFT}" stroke="${c}" stroke-width="3"/>`;
    // solid: 4x4 lattice, vibrating in place
    out += box(bx[0], PRIM);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const i = r * 4 + c, cx = bx[0] + 16 + c * 28, cy = by + 23 + r * 28, d = (0.28 + rnd(i) * 0.16).toFixed(2);
      out += `<circle cx="${cx}" cy="${cy}" r="9" fill="${PRIM}"><animateTransform attributeName="transform" type="translate" values="0 0;2.5 -2;-2 2.5;-2.5 -1.5;0 0" dur="${d}s" repeatCount="indefinite"/></circle>`;
    }
    // liquid: close together, jostling
    out += box(bx[1], BLUE);
    const rows = [[100, [21, 43, 65, 87, 105]], [121, [32, 54, 76, 98]], [142, [21, 43, 65, 87, 105]]];
    let k = 0;
    rows.forEach(([y, xs]) => xs.forEach(x => {
      k++;
      const d = (1.3 + rnd(k + 20) * 0.9).toFixed(2), a = 3.2;
      out += `<circle cx="${bx[1] + x}" cy="${y + 8}" r="9" fill="${BLUE}"><animateTransform attributeName="transform" type="translate" values="0 0;${a} ${a * 0.6};${-a * 0.7} ${a};${-a} ${-a * 0.5};0 0" dur="${d}s" repeatCount="indefinite"/></circle>`;
    }));
    // gas: few particles, far apart, zooming and bouncing
    out += box(bx[2], ORANGE);
    for (let i = 0; i < 6; i++) {
      const x0 = bx[2] + 12, x1 = bx[2] + bw - 12, y0 = by + 12, y1 = by + bh - 12;
      const dx = (1.5 + rnd(i + 40) * 1.3).toFixed(2), dy = (1.2 + rnd(i + 50) * 1.4).toFixed(2);
      const sx = rnd(i + 60) < 0.5 ? [x0, x1, x0] : [x1, x0, x1], sy = rnd(i + 70) < 0.5 ? [y0, y1, y0] : [y1, y0, y1];
      out += `<circle r="8" fill="${ORANGE}" cx="${sx[0]}" cy="${sy[0]}"><animate attributeName="cx" values="${sx.join(';')}" dur="${dx}s" begin="-${(rnd(i + 80) * 3).toFixed(2)}s" repeatCount="indefinite"/><animate attributeName="cy" values="${sy.join(';')}" dur="${dy}s" begin="-${(rnd(i + 90) * 3).toFixed(2)}s" repeatCount="indefinite"/></circle>`;
    }
    const lab = (i, name, l1, l2, c) => T(bx[i] + bw / 2, 184, name, { size: 17, fill: c }) + T(bx[i] + bw / 2, 204, l1, { size: 13, fill: INK, weight: 600 }) + T(bx[i] + bw / 2, 221, l2, { size: 13, fill: INK, weight: 600 });
    out += lab(0, 'Solid', 'fixed positions,', 'just vibrate', PRIM) + lab(1, 'Liquid', 'close together,', 'can flow', BLUE) + lab(2, 'Gas', 'far apart,', 'move freely', ORANGE);
    return TutorialKit.svg(out);
  })();

  function matHeatMount(el, api) {
    const N = 20, R = 9, xmin = 23, xmax = 185, ymin = 21, ymax = 145;
    const ps = [];
    for (let i = 0; i < N; i++) {
      const c = i % 5, r = Math.floor(i / 5);
      ps.push({ x: 104 + (c - 2) * 21, y: 145 - r * 19, vx: 0, vy: 0, lx: 104 + (c - 2) * 21, ly: 145 - r * 19, ph: rnd(i) * 6.28, w: 9 + rnd(i + 5) * 6 });
    }
    const circles = ps.map((p, i) => `<circle id="mat-p${i}" r="${R}" cx="${p.x}" cy="${p.y}" fill="#93c5fd" stroke="${INK}" stroke-width="1.2"/>`).join('');
    const svg = scene(el, '0 0 400 172', `
      <rect x="14" y="12" width="180" height="142" rx="8" fill="#fff" stroke="${INK}" stroke-width="3"/>${circles}
      ${T(300, 40, '', { id: 'mat-st', size: 22 })}${T(300, 62, '', { id: 'mat-nm', size: 14, fill: MUTED })}
      ${T(300, 102, '', { id: 'mat-tp', size: 26, fill: PRIM })}
      ${T(300, 128, 'Melts at 0 °C', { size: 13, fill: MUTED, weight: 600 })}${T(300, 147, 'Boils at 100 °C', { size: 13, fill: MUTED, weight: 600 })}`,
      sliderRow('Temp', 'mat-T', -20, 120, 5, -20, '-20 °C'));
    const $ = s => el.querySelector(s);
    const cs = ps.map((p, i) => $('#mat-p' + i));
    let T0 = -20, auto = true, last = '';
    $('#mat-T').addEventListener('input', e => { auto = false; T0 = +e.target.value; });
    api.loop((t, dt) => {
      if (auto) { T0 = -20 + ((t * 11) % 150); if (T0 > 120) T0 = 120; $('#mat-T').value = Math.round(T0 / 5) * 5; }
      const Tk = Math.round(T0 / 5) * 5, tf = Math.sqrt((T0 + 273) / 293);
      const state = Tk < 0 ? 'solid' : Tk < 100 ? 'liquid' : 'gas';
      // pairwise repulsion for liquid and gas
      if (state !== 'solid') {
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
          const a = ps[i], b = ps[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, m = 2 * R;
          if (d2 < m * m && d2 > 0.0001) {
            const d = Math.sqrt(d2), o = (m - d) / 2, nx = dx / d, ny = dy / d;
            a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
            const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rv < 0) { a.vx += nx * rv; a.vy += ny * rv; b.vx -= nx * rv; b.vy -= ny * rv; }
          }
        }
      }
      ps.forEach((p, i) => {
        if (state === 'solid') {
          const amp = 1.4 + (T0 + 20) * 0.03;
          const tx = p.lx + Math.sin(t * p.w + p.ph) * amp, ty = p.ly + Math.cos(t * p.w * 1.1 + p.ph) * amp;
          p.vx += (140 * (tx - p.x) - 16 * p.vx) * dt; p.vy += (140 * (ty - p.y) - 16 * p.vy) * dt;
        } else if (state === 'liquid') {
          p.vy += 500 * dt;
          p.vx += (Math.random() - 0.5) * 1800 * tf * dt; p.vy += (Math.random() - 0.5) * 1800 * tf * dt;
          const damp = Math.max(0, 1 - 3 * dt); p.vx *= damp; p.vy *= damp;
          const sp = Math.hypot(p.vx, p.vy), mx = 70 * tf; if (sp > mx) { p.vx *= mx / sp; p.vy *= mx / sp; }
        } else {
          let sp = Math.hypot(p.vx, p.vy);
          if (sp < 1) { const a = Math.random() * 6.28; p.vx = Math.cos(a); p.vy = Math.sin(a); sp = 1; }
          const target = 110 * tf, k = Math.min(1, 6 * dt), s2 = sp + (target - sp) * k;
          p.vx *= s2 / sp; p.vy *= s2 / sp;
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < xmin) { p.x = xmin; p.vx = Math.abs(p.vx) * (state === 'gas' ? 1 : 0.3); }
        if (p.x > xmax) { p.x = xmax; p.vx = -Math.abs(p.vx) * (state === 'gas' ? 1 : 0.3); }
        if (p.y < ymin) { p.y = ymin; p.vy = Math.abs(p.vy) * (state === 'gas' ? 1 : 0.3); }
        if (p.y > ymax) { p.y = ymax; p.vy = -Math.abs(p.vy) * (state === 'gas' ? 1 : 0.3); }
        cs[i].setAttribute('cx', p.x.toFixed(1)); cs[i].setAttribute('cy', p.y.toFixed(1));
      });
      $('#mat-tp').textContent = Tk + ' °C';
      $('#mat-T-v').textContent = Tk + ' °C';
      if (state !== last) {
        last = state;
        const info = { solid: ['SOLID', 'Ice', PRIM, '#93c5fd'], liquid: ['LIQUID', 'Liquid water', BLUE, '#38bdf8'], gas: ['GAS', 'Water vapor (steam)', ORANGE, '#fdba74'] }[state];
        const st = $('#mat-st'); st.textContent = info[0]; st.setAttribute('fill', info[2]);
        $('#mat-nm').textContent = info[1];
        cs.forEach(c => c.setAttribute('fill', info[3]));
      }
    });
  }

  const matStep3 = (() => {
    const boxes = [[8, 'Solid', PRIM], [168, 'Liquid', BLUE], [328, 'Gas', ORANGE]];
    let out = boxes.map(([x, n, c]) => `<rect x="${x}" y="88" width="64" height="48" rx="8" fill="${SOFT}" stroke="${c}" stroke-width="3"/>` + T(x + 32, 118, n, { size: 16, fill: c })).join('');
    const defs = `<defs>${TutorialKit.arrowMarker('mat-mr', 'var(--t-red)')}${TutorialKit.arrowMarker('mat-mb', 'var(--t-blue)')}</defs>`;
    const line = (x1, y1, x2, y2, m, c) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="3" marker-end="url(#${m})"/>`;
    out += line(80, 102, 160, 102, 'mat-mr', RED) + line(160, 124, 80, 124, 'mat-mb', BLUE);
    out += line(240, 102, 320, 102, 'mat-mr', RED) + line(320, 124, 240, 124, 'mat-mb', BLUE);
    out += T(120, 87, 'Melting', { fill: RED }) + T(120, 150, 'Freezing', { fill: BLUE });
    out += T(280, 87, 'Evaporation', { fill: RED }) + T(280, 150, 'Condensation', { fill: BLUE });
    // big arcs: sublimation over the top, deposition underneath
    const up = 'M40,86 Q200,-10 360,86', dn = 'M360,138 Q200,236 40,138';
    out += `<path d="${up}" fill="none" stroke="${RED}" stroke-width="3" marker-end="url(#mat-mr)"/><path d="${dn}" fill="none" stroke="${BLUE}" stroke-width="3" marker-end="url(#mat-mb)"/>`;
    out += T(200, 58, 'Sublimation', { fill: RED, size: 14 }) + T(200, 176, 'Deposition', { fill: BLUE, size: 14 });
    out += T(200, 226, 'Red arrows: heat is added.  Blue arrows: heat is removed.', { size: 13, fill: MUTED, weight: 600 });
    // travelling energy dots
    const dot = (path, c, begin) => `<circle r="5" fill="${c}" stroke="${INK}" stroke-width="1.5"><animateMotion dur="2.6s" begin="-${begin}s" repeatCount="indefinite" path="${path}"/></circle>`;
    out += dot('M80,102 L160,102', YELLOW, 0) + dot('M160,124 L80,124', '#fff', 0.4) + dot('M240,102 L320,102', YELLOW, 0.8) + dot('M320,124 L240,124', '#fff', 1.2) + dot(up, YELLOW, 0.3) + dot(dn, '#fff', 1.4);
    return TutorialKit.svg(defs + out);
  })();

  const matStep4 = (() => {
    let out = T(200, 24, 'Density = mass ÷ volume', { size: 18, fill: PRIM });
    const box = (x, n, c, pts, amp, colr) => {
      let g = `<rect x="${x}" y="42" width="110" height="100" rx="6" fill="${SOFT}" stroke="${c}" stroke-width="3"/>`;
      pts.forEach(([px, py], i) => {
        const d = (0.35 + rnd(i + n.length) * 0.5).toFixed(2);
        g += `<circle cx="${x + px}" cy="${42 + py}" r="9" fill="${colr}"><animateTransform attributeName="transform" type="translate" values="0 0;${amp} ${-amp};${-amp} ${amp};0 0" dur="${d}s" repeatCount="indefinite"/></circle>`;
      });
      return g;
    };
    const dense = [], sparse = [[26, 24], [78, 34], [40, 72], [86, 80]];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) dense.push([17 + c * 25, 17 + r * 22]);
    out += box(50, 'A', PRIM, dense.slice(0, 16), 2, PRIM) + box(240, 'B', ORANGE, sparse, 3.5, ORANGE);
    out += T(200, 92, 'same', { size: 13, fill: MUTED, weight: 600 }) + T(200, 108, 'volume', { size: 13, fill: MUTED, weight: 600 });
    const info = (cx, m, dens, c) => T(cx, 164, `Mass = ${m} g`, { size: 14 }) + T(cx, 183, 'Volume = 10 mL', { size: 14 }) +
      `<text x="${cx}" y="208" font-size="17" font-weight="800" fill="${c}" text-anchor="middle">${m} ÷ 10 = ${dens} g/mL<animate attributeName="opacity" values="1;0.45;1" dur="1.8s" repeatCount="indefinite"/></text>`;
    out += info(105, 20, '2', PRIM) + info(295, 5, '0.5', ORANGE);
    out += T(105, 232, 'Denser: more particles', { size: 13, fill: MUTED, weight: 600 }) + T(295, 232, 'Less dense: fewer particles', { size: 13, fill: MUTED, weight: 600 });
    return TutorialKit.svg(out);
  })();

  function matFloatMount(el, api) {
    const surf = 68, bottom = 170, S = 46, bx = 120;
    const svg = scene(el, '0 0 400 196', `
      <rect x="40" y="${surf}" width="180" height="${bottom - surf}" fill="#7dd3fc" opacity=".75"/>
      <path id="mat-surf" d="" fill="none" stroke="#0284c7" stroke-width="3"/>
      <rect id="mat-block" x="${bx}" y="${surf}" width="${S}" height="${S}" rx="4" fill="#78716c" stroke="${INK}" stroke-width="2.5"/>
      <path d="M40,20 L40,${bottom} L220,${bottom} L220,20" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      ${T(130, 190, 'Water: 1.0 g/mL', { size: 14, fill: BLUE })}
      ${T(310, 50, '', { id: 'mat-fb', size: 16, fill: INK })}${T(310, 78, '', { id: 'mat-fc', size: 20 })}
      ${T(310, 106, '', { id: 'mat-fd', size: 14, fill: MUTED })}${T(310, 128, '', { id: 'mat-fe', size: 14, fill: MUTED })}`,
      sliderRow('Density', 'mat-rho', 0.2, 2.4, 0.1, 0.6, '0.6 g/mL'));
    const $ = s => el.querySelector(s);
    let rho = 0.6, auto = true, y = surf - 10, vy = 0, lastMsg = '';
    $('#mat-rho').addEventListener('input', e => { auto = false; rho = +e.target.value; });
    api.loop((t, dt) => {
      if (auto) { rho = Math.round((1.3 + 1.0 * Math.sin(t * 0.55 - 1.2)) * 10) / 10; $('#mat-rho').value = rho; }
      const hover = Math.abs(rho - 1) < 0.05;
      const target = rho < 0.95 ? surf + rho * S - S : hover ? surf + 30 : bottom - S - 2;
      vy += (70 * (target - y) - (rho < 1 ? 7 : 12) * vy) * dt; y += vy * dt;
      y = Math.min(y, bottom - S - 2);
      const blk = $('#mat-block'); blk.setAttribute('y', y);
      const g = Math.round(200 - clamp((rho - 0.2) / 2.2, 0, 1) * 130);
      blk.setAttribute('fill', `rgb(${g + 10},${g - 10},${g - 30})`);
      // ripples
      let d = 'M40,' + surf;
      for (let x = 40; x <= 220; x += 6) d += ` L${x},${(surf + Math.sin(x * 0.12 + t * 3) * (1.2 + Math.min(4, Math.abs(vy) * 0.05))).toFixed(1)}`;
      $('#mat-surf').setAttribute('d', d);
      const msg = rho < 0.95 ? 'FLOATS' : hover ? 'HOVERS' : 'SINKS';
      $('#mat-fb').textContent = `Block: ${rho.toFixed(1)} g/mL`;
      const fc = $('#mat-fc'); fc.textContent = msg; fc.setAttribute('fill', msg === 'FLOATS' ? GREEN : msg === 'SINKS' ? RED : ORANGE);
      $('#mat-fd').textContent = rho < 0.95 ? `${rho.toFixed(1)} < 1.0: less dense` : hover ? 'same density as water' : `${rho.toFixed(1)} > 1.0: denser`;
      $('#mat-fe').textContent = rho < 0.95 ? `${Math.round(rho * 100)}% underwater` : '';
      $('#mat-rho-v').textContent = rho.toFixed(1) + ' g/mL';
    });
  }

  registerTutorial('physics', 'matter', {
    title: 'Matter & States',
    keyTerms: [
      { term: 'States of matter', definition: 'Solid, liquid and gas: three forms matter takes, set by how its particles are arranged and move.' },
      { term: 'Melting / freezing', definition: 'Melting: solid to liquid (heat added). Freezing: liquid to solid (heat removed).' },
      { term: 'Evaporation', definition: 'A liquid changing to a gas. Boiling is fast evaporation throughout the liquid.' },
      { term: 'Condensation', definition: 'A gas cooling and changing into a liquid.' },
      { term: 'Sublimation', definition: 'A solid changing straight into a gas without becoming a liquid first.' },
      { term: 'Density', definition: 'How much mass is packed into a volume: density = mass ÷ volume (g/mL).' }
    ],
    steps: [
      { title: 'Everything is made of particles',
        text: '<p>Matter is made of tiny <b>particles</b> that are always moving. In a <b>solid</b> they vibrate in fixed spots, in a <b>liquid</b> they slide past each other, and in a <b>gas</b> they are far apart and zoom around.</p>',
        svg: matStep1 },
      { title: 'Heat changes the state',
        text: '<p>Add heat and the particles move faster. At 0 °C ice melts, and at 100 °C water boils. Drag the temperature and watch an ordered solid become a flowing liquid and then a gas.</p>',
        mount: matHeatMount },
      { title: 'Names of the changes',
        text: '<p>Heating makes a solid <b>melt</b> and a liquid <b>evaporate</b>. Cooling makes a gas <b>condense</b> and a liquid <b>freeze</b>. A solid can jump straight to a gas: that is <b>sublimation</b>.</p>',
        svg: matStep3 },
      { title: 'What is density?',
        text: '<p>Mass is how much matter there is; volume is the space it fills. <b>Density = mass ÷ volume</b>. Both boxes are the same size, but the left packs in more particles, so it is denser.</p>',
        svg: matStep4 },
      { title: 'Float or sink?',
        text: '<p>Water has a density of 1 g/mL. An object <b>floats</b> if it is less dense than the liquid and <b>sinks</b> if it is denser. Oil (0.9 g/mL) floats on water. Slide the density!</p>',
        mount: matFloatMount }
    ]
  });

  // =====================================================================
  // HEAT & THERMAL ENERGY
  // =====================================================================
  // colour from cold (blue) to hot (red): k in 0..1
  function heatColor(k) {
    k = clamp(k, 0, 1);
    const a = [147, 197, 253], b = [220, 38, 38];
    return `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;
  }

  function heaTempMount(el, api) {
    const N = 16, R = 7, xmin = 21, xmax = 187, ymin = 19, ymax = 147;
    const ps = [];
    for (let i = 0; i < N; i++) { const a = rnd(i) * 6.28; ps.push({ x: 30 + rnd(i + 3) * 150, y: 28 + rnd(i + 7) * 110, ax: Math.cos(a), ay: Math.sin(a) }); }
    const circles = ps.map((p, i) => `<circle id="hea-p${i}" r="${R}" cx="${p.x}" cy="${p.y}" fill="#93c5fd" stroke="${INK}" stroke-width="1"/>`).join('');
    const svg = scene(el, '0 0 400 172', `
      <rect x="14" y="12" width="180" height="142" rx="8" fill="#fff" stroke="${INK}" stroke-width="3"/>${circles}
      <rect x="226" y="20" width="18" height="112" rx="9" fill="#e5e7eb" stroke="${INK}" stroke-width="2.5"/>
      <rect id="hea-fill" x="230" y="100" width="10" height="32" fill="${RED}"/>
      <circle cx="235" cy="142" r="14" fill="${RED}" stroke="${INK}" stroke-width="2.5"/>
      ${T(322, 44, 'Temperature', { size: 14, fill: MUTED })}${T(322, 82, '', { id: 'hea-tp', size: 28 })}
      ${T(322, 112, '', { id: 'hea-sp', size: 14, fill: INK })}${T(322, 134, 'Air in a sealed jar', { size: 13, fill: MUTED, weight: 600 })}`,
      sliderRow('Temp', 'hea-T', -100, 200, 10, 20, '20 °C'));
    const $ = s => el.querySelector(s);
    const cs = ps.map((p, i) => $('#hea-p' + i));
    let T0 = 20, auto = true;
    $('#hea-T').addEventListener('input', e => { auto = false; T0 = +e.target.value; });
    api.loop((t, dt) => {
      if (auto) { T0 = Math.round((50 + 100 * Math.sin(t * 0.45 - 1.4)) / 10) * 10; $('#hea-T').value = T0; }
      const rel = Math.sqrt((T0 + 273) / 293), speed = 70 * rel, k = (T0 + 100) / 300, col = heatColor(k);
      ps.forEach((p, i) => {
        p.x += p.ax * speed * dt; p.y += p.ay * speed * dt;
        if (p.x < xmin) { p.x = xmin; p.ax = Math.abs(p.ax); } if (p.x > xmax) { p.x = xmax; p.ax = -Math.abs(p.ax); }
        if (p.y < ymin) { p.y = ymin; p.ay = Math.abs(p.ay); } if (p.y > ymax) { p.y = ymax; p.ay = -Math.abs(p.ay); }
        cs[i].setAttribute('cx', p.x.toFixed(1)); cs[i].setAttribute('cy', p.y.toFixed(1)); cs[i].setAttribute('fill', col);
      });
      const h = 8 + k * 96;
      $('#hea-fill').setAttribute('height', h); $('#hea-fill').setAttribute('y', 132 - h);
      const tp = $('#hea-tp'); tp.textContent = T0 + ' °C'; tp.setAttribute('fill', col === '' ? INK : `rgb(${Math.round(lerp(60, 220, k))},${Math.round(lerp(110, 38, k))},${Math.round(lerp(220, 38, k))})`);
      $('#hea-sp').textContent = (rel < 0.85 ? 'Slow' : rel > 1.2 ? 'Fast' : 'Medium') + ' particles';
      $('#hea-T-v').textContent = T0 + ' °C';
    });
  }

  function heaFlowMount(el, api) {
    const bx = [20, 200], by = 62, bw = 180, bh = 84;
    const dots = (x0, id) => { let d = ''; for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) d += `<circle id="${id}${r * 5 + c}" r="7" cx="${x0 + 22 + c * 34}" cy="${by + 18 + r * 24}" fill="#93c5fd"/>`; return d; };
    const svg = scene(el, '0 0 400 240', `
      ${T(200, 24, '', { id: 'hea-ttl', size: 16 })}
      <rect id="hea-b1" x="${bx[0]}" y="${by}" width="${bw}" height="${bh}" rx="6" stroke="${INK}" stroke-width="3"/>
      <rect id="hea-b2" x="${bx[1]}" y="${by}" width="${bw}" height="${bh}" rx="6" stroke="${INK}" stroke-width="3"/>
      ${dots(bx[0], 'hea-a')}${dots(bx[1], 'hea-c')}
      ${arrowHTML('hea-arrow', RED, 8)}
      ${T(110, 172, '', { id: 'hea-t1', size: 22 })}${T(290, 172, '', { id: 'hea-t2', size: 22 })}
      ${T(110, 194, 'Hot block', { size: 13, fill: MUTED })}${T(290, 194, 'Cold block', { size: 13, fill: MUTED })}
      ${T(200, 226, 'Two identical blocks end up at the average temperature', { size: 13, fill: MUTED, weight: 600 })}`);
    const $ = s => svg.querySelector(s);
    const A = [], C = [];
    for (let i = 0; i < 15; i++) { A.push($('#hea-a' + i)); C.push($('#hea-c' + i)); }
    api.loop(t => {
      const c = t % 12, e = Math.exp(-c / 2.2), T1 = 50 + 30 * e, T2 = 50 - 30 * e, dT = T1 - T2;
      const k1 = (T1 - 10) / 80, k2 = (T2 - 10) / 80;
      $('#hea-b1').setAttribute('fill', heatColor(k1)); $('#hea-b2').setAttribute('fill', heatColor(k2));
      const vib = (arr, k, ph) => arr.forEach((d, i) => {
        const a = 0.8 + 3.6 * k, w = 12 + k * 14;
        d.setAttribute('transform', `translate(${(Math.sin(t * w + i * 1.7 + ph) * a).toFixed(2)},${(Math.cos(t * w * 1.13 + i * 2.3 + ph) * a).toFixed(2)})`);
        d.setAttribute('fill', '#fff'); d.setAttribute('opacity', 0.9);
      });
      vib(A, k1, 0); vib(C, k2, 1.3);
      $('#hea-t1').textContent = Math.round(T1) + ' °C'; $('#hea-t2').textContent = Math.round(T2) + ' °C';
      const flowing = dT > 2;
      $('#hea-arrow').style.display = flowing ? '' : 'none';
      if (flowing) { const L = 20 + 120 * (dT / 60); setArrow(svg, 'hea-arrow', 200 - L / 2, 44, 200 + L / 2, 44, 8, 22); }
      const ttl = $('#hea-ttl');
      ttl.textContent = flowing ? 'Heat flows from hot to cold' : 'Same temperature: no net heat flow';
      ttl.setAttribute('fill', flowing ? RED : GREEN);
    });
  }

  function heaConductMount(el, api) {
    const rods = [{ y: 84, speed: 95, fill: '#cbd5e1', name: 'Metal spoon: a conductor' }, { y: 176, speed: 9, fill: '#d6a86b', name: 'Wooden spoon: an insulator' }];
    let inner = `${T(10, 22, 'Heat is added at the left end', { size: 14, fill: MUTED, anchor: 'start' })}${T(390, 22, '', { id: 'hea-clk', size: 14, fill: INK, anchor: 'end' })}`;
    rods.forEach((r, k) => {
      const y = r.y;
      inner += T(220, y - 30, r.name, { size: 15, fill: INK });
      inner += `<rect x="56" y="${y - 20}" width="330" height="40" rx="8" fill="${r.fill}" stroke="${INK}" stroke-width="2.5"/>`;
      for (let i = 0; i < 8; i++) inner += `<circle id="hea-r${k}p${i}" r="8" cx="${80 + i * 40}" cy="${y}" fill="#93c5fd" stroke="${INK}" stroke-width="1"/>`;
      inner += `<g transform="translate(30,${y})"><path d="M0,16 C-14,6 -6,-6 0,-20 C6,-6 14,6 0,16 Z" fill="${ORANGE}"><animateTransform attributeName="transform" type="scale" values="1 1;0.85 1.12;1.05 0.92;1 1" dur="0.5s" repeatCount="indefinite"/></path><path d="M0,16 C-6,10 -3,2 0,-6 C3,2 6,10 0,16 Z" fill="${YELLOW}"/></g>`;
    });
    inner += T(200, 226, 'Blue particles are cool, red particles are hot', { size: 13, fill: MUTED, weight: 600 });
    const svg = scene(el, '0 0 400 240', inner);
    const $ = s => svg.querySelector(s);
    const dots = rods.map((r, k) => Array.from({ length: 8 }, (_, i) => $(`#hea-r${k}p${i}`)));
    api.loop(t => {
      const c = t % 10;
      $('#hea-clk').textContent = 'Time: ' + f1(c) + ' s';
      rods.forEach((r, k) => dots[k].forEach((d, i) => {
        const dist = 80 + i * 40 - 56, h = clamp((c * r.speed - dist) / 50, 0, 1);
        const a = 0.8 + 3.8 * h, w = 12 + h * 14;
        d.setAttribute('fill', heatColor(h));
        d.setAttribute('transform', `translate(${(Math.sin(t * w + i * 1.9) * a).toFixed(2)},${(Math.cos(t * w * 1.2 + i * 2.5) * a).toFixed(2)})`);
      }));
    });
  }

  const heaStep4 = (() => {
    const path = 'M62,148 L62,86 Q62,74 74,74 L126,74 Q138,74 138,86 L138,136 Q138,148 126,148 Z';
    let out = T(100, 28, 'Convection', { size: 17, fill: PRIM });
    out += `<rect x="30" y="52" width="140" height="122" rx="10" fill="#bae6fd" stroke="${INK}" stroke-width="3"/>`;
    out += `<path d="M36,112 L44,136 L52,112" fill="none" stroke="none"/>`;
    // heat source under left side
    out += `<g transform="translate(64,192)"><path d="M0,8 C-14,-2 -6,-12 0,-22 C6,-12 14,-2 0,8 Z" fill="${ORANGE}"><animateTransform attributeName="transform" type="scale" values="1 1;0.85 1.12;1.05 0.92;1 1" dur="0.5s" repeatCount="indefinite"/></path></g>`;
    for (let i = 0; i < 8; i++) {
      const b = (i * 0.75).toFixed(2);
      out += `<circle r="6" fill="${RED}" stroke="${INK}" stroke-width="1"><animateMotion dur="6s" begin="-${b}s" repeatCount="indefinite" path="${path}"/><animate attributeName="fill" values="#dc2626;#dc2626;#0ea5e9;#0ea5e9;#dc2626" keyTimes="0;0.27;0.52;0.77;1" dur="6s" begin="-${b}s" repeatCount="indefinite"/></circle>`;
    }
    out += T(100, 214, 'warm (red) fluid rises,', { size: 13, weight: 600 }) + T(100, 232, 'cool (blue) fluid sinks', { size: 13, weight: 600 });
    // radiation panel
    out += T(300, 28, 'Radiation', { size: 17, fill: PRIM });
    out += `<rect x="212" y="42" width="176" height="132" rx="10" fill="#1e1b4b"/>`;
    [[230, 56], [262, 158], [300, 60], [318, 160], [350, 54], [376, 150], [290, 164]].forEach(([x, y], i) => {
      out += `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"><animate attributeName="opacity" values="1;0.2;1" dur="${1.5 + i * 0.3}s" repeatCount="indefinite"/></circle>`;
    });
    out += `<circle cx="240" cy="108" r="22" fill="${YELLOW}"><animate attributeName="r" values="22;25;22" dur="1.6s" repeatCount="indefinite"/></circle>`;
    [90, 108, 126].forEach((y, i) => {
      out += `<path d="M266,${y} q8,-8 16,0 t16,0 t16,0 t16,0 t16,0" fill="none" stroke="${YELLOW}" stroke-width="3" stroke-dasharray="14 10"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" repeatCount="indefinite"/></path>`;
    });
    out += `<circle cx="360" cy="108" r="14" fill="${BLUE}"/><path d="M350,102 q6,-5 10,2 q3,6 -3,8" fill="${GREEN}"/>`;
    out += T(240, 160, 'Sun', { size: 13, fill: '#fff' }) + T(360, 160, 'Earth', { size: 13, fill: '#fff' });
    out += T(300, 214, 'energy travels as waves,', { size: 13, weight: 600 }) + T(300, 232, 'even through empty space', { size: 13, weight: 600 });
    return TutorialKit.svg(out);
  })();

  function heaScaleMount(el, api) {
    const yOf = c => 144 - (c + 20) / 130 * 120;
    let ticks = '';
    for (let c = -20; c <= 100; c += 20) {
      const y = yOf(c), f = Math.round(c * 9 / 5 + 32);
      ticks += `<line x1="100" y1="${y}" x2="120" y2="${y}" stroke="${INK}" stroke-width="1.5"/>` +
        T(94, y + 4, String(c), { size: 13, anchor: 'end', fill: BLUE, weight: 600 }) + T(126, y + 4, String(f), { size: 13, anchor: 'start', fill: ORANGE, weight: 600 });
    }
    const svg = scene(el, '0 0 400 172', `
      ${T(74, 17, '°C', { size: 15, fill: BLUE })}${T(146, 17, '°F', { size: 15, fill: ORANGE })}
      <rect x="104" y="24" width="12" height="122" rx="6" fill="#e5e7eb" stroke="${INK}" stroke-width="2"/>
      <rect id="hea-mer" x="106" y="100" width="8" height="44" fill="${RED}"/>
      <circle cx="110" cy="152" r="12" fill="${RED}" stroke="${INK}" stroke-width="2"/>${ticks}
      ${T(28, yOf(0) + 4, 'freezes', { size: 12, anchor: 'middle', fill: MUTED, weight: 600 })}${T(28, yOf(100) + 4, 'boils', { size: 12, fill: MUTED, weight: 600 })}
      ${T(200, 34, 'F = C × 9/5 + 32', { size: 16, anchor: 'start', fill: PRIM })}
      ${T(200, 64, '', { id: 'hea-l2', size: 16, anchor: 'start' })}${T(200, 92, '', { id: 'hea-l3', size: 16, anchor: 'start' })}
      ${T(200, 124, '', { id: 'hea-l4', size: 24, anchor: 'start', fill: ORANGE })}
      ${T(200, 156, 'Back again: C = (F − 32) × 5/9', { size: 13, anchor: 'start', fill: MUTED, weight: 600 })}`,
      sliderRow('Celsius', 'hea-C', -20, 110, 1, 25, '25 °C'));
    const $ = s => el.querySelector(s);
    let C = 25, auto = true;
    $('#hea-C').addEventListener('input', e => { auto = false; C = +e.target.value; });
    api.loop(t => {
      if (auto) { C = Math.round(45 + 62 * Math.sin(t * 0.5 - 1)); $('#hea-C').value = C; }
      const F = C * 9 / 5 + 32, h = Math.max(2, (C + 20) / 130 * 122);
      $('#hea-mer').setAttribute('height', h); $('#hea-mer').setAttribute('y', 146 - h);
      $('#hea-l2').textContent = `= ${C} × 9/5 + 32`;
      $('#hea-l3').textContent = `= ${f1(C * 9 / 5)} + 32`;
      $('#hea-l4').textContent = `= ${f1(F)} °F`;
      $('#hea-C-v').textContent = C + ' °C';
    });
  }

  registerTutorial('physics', 'heat', {
    title: 'Heat & Thermal Energy',
    keyTerms: [
      { term: 'Temperature', definition: 'A measure of the average kinetic energy (speed) of the particles in a substance.' },
      { term: 'Heat', definition: 'Energy that flows from a hotter object to a colder one, until they reach the same temperature (thermal equilibrium).' },
      { term: 'Conduction', definition: 'Heat moving through direct contact, as particles bump into their neighbors.' },
      { term: 'Convection', definition: 'Heat carried by the movement of a fluid (liquid or gas): hot fluid rises, cool fluid sinks.' },
      { term: 'Radiation', definition: 'Heat travelling as electromagnetic waves, like sunlight. It needs no material to travel through.' },
      { term: 'Insulator', definition: 'A material, like wool or foam, that slows heat flow. Metals are good conductors of heat.' }
    ],
    steps: [
      { title: 'Temperature: how fast particles move',
        text: '<p><b>Temperature</b> tells how fast the particles in something are moving, on average. Hotter means faster. <b>Heat</b> is the energy that moves from a hotter object to a colder one.</p>',
        mount: heaTempMount },
      { title: 'Heat flows from hot to cold',
        text: '<p>Heat always flows from hot to cold, never the other way. The hot block cools and the cold block warms until both match: <b>thermal equilibrium</b>. Then the net heat flow stops.</p>',
        mount: heaFlowMount },
      { title: 'Conduction and insulators',
        text: '<p>In <b>conduction</b>, hot particles bump their neighbors and pass energy along; the particles themselves stay put. Metals are <b>conductors</b>. Wood, plastic and foam are <b>insulators</b>: they slow heat down.</p>',
        mount: heaConductMount },
      { title: 'Convection and radiation',
        text: '<p><b>Convection</b>: hot fluid (liquid or gas) rises and cooler fluid sinks, making a current. <b>Radiation</b>: energy travels as waves, even through empty space. That is how the Sun warms Earth.</p>',
        svg: heaStep4 },
      { title: 'Celsius and Fahrenheit',
        text: '<p>Water freezes at 0 °C (32 °F) and boils at 100 °C (212 °F). To convert: <b>F = C × 9/5 + 32</b>. Slide the temperature and watch both scales rise together.</p>',
        mount: heaScaleMount }
    ]
  });

  // =====================================================================
  // LIGHT & SOUND (WAVES)
  // =====================================================================
  function wavRopeMount(el, api) {
    const mid = 118, A = 26, lam = 150, per = 2.5, bx = [100, 200, 300];
    const svg = scene(el, '0 0 400 240', `
      ${T(200, 22, 'The wave travels this way', { size: 14, fill: PRIM })}${staticArrow(140, 38, 260, 38, PRIM, 4, 12)}
      <path id="wav-water" d="" fill="#bae6fd" opacity=".85"/>
      <path id="wav-line" d="" fill="none" stroke="#0284c7" stroke-width="4" stroke-linejoin="round"/>
      <line x1="200" y1="68" x2="200" y2="196" stroke="${MUTED}" stroke-width="2" stroke-dasharray="4 4"/>
      ${T(200, 62, 'stays in this spot', { size: 13, fill: INK, weight: 700 })}
      ${bx.map((x, i) => `<circle id="wav-b${i}" cx="${x}" cy="100" r="10" fill="${YELLOW}" stroke="${INK}" stroke-width="2.5"/>`).join('')}
      ${T(200, 224, 'The wave carries energy, not the water or the buoys', { size: 14, fill: MUTED })}`);
    const $ = s => svg.querySelector(s);
    const yAt = (x, t) => mid - A * Math.sin(2 * Math.PI * (x / lam - t / per));
    api.loop(t => {
      let d = '';
      for (let x = 0; x <= 400; x += 5) d += (x ? ' L' : 'M') + x + ',' + yAt(x, t).toFixed(1);
      $('#wav-line').setAttribute('d', d);
      $('#wav-water').setAttribute('d', d + ' L400,196 L0,196 Z');
      bx.forEach((x, i) => $('#wav-b' + i).setAttribute('cy', (yAt(x, t) - 9).toFixed(1)));
    });
  }

  const wavStep2 = (() => {
    const mid = 120, A = 48, lam = 130, x0 = 100, x1 = 392;
    let d = '';
    for (let x = x0; x <= x1; x += 3) d += (x > x0 ? ' L' : 'M') + x + ',' + (mid - A * Math.cos(2 * Math.PI * (x - 130) / lam)).toFixed(1);
    const pulse = (i, inner) => `<g opacity="0.6"><animate attributeName="opacity" values="0.6;1;1;0.6;0.6" keyTimes="0;0.03;0.22;0.27;1" dur="8s" begin="${i * 2}s" repeatCount="indefinite"/>${inner}</g>`;
    let out = `<line x1="90" y1="${mid}" x2="396" y2="${mid}" stroke="${MUTED}" stroke-width="2" stroke-dasharray="6 5"/>`;
    out += T(80, 138, 'resting line', { size: 13, anchor: 'end', fill: MUTED, weight: 600 });
    out += `<path d="${d}" fill="none" stroke="${PRIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    out += pulse(0, `<circle cx="130" cy="72" r="7" fill="${RED}"/>${T(140, 60, 'Crest', { size: 15, anchor: 'start', fill: RED })}`);
    out += pulse(1, `<circle cx="195" cy="168" r="7" fill="${BLUE}"/>${T(195, 194, 'Trough', { size: 15, fill: BLUE })}`);
    out += pulse(2, `<line x1="130" y1="36" x2="260" y2="36" stroke="${GREEN}" stroke-width="3"/><line x1="130" y1="28" x2="130" y2="44" stroke="${GREEN}" stroke-width="3"/><line x1="260" y1="28" x2="260" y2="44" stroke="${GREEN}" stroke-width="3"/>` +
      `<line x1="130" y1="44" x2="130" y2="66" stroke="${GREEN}" stroke-width="1.5" stroke-dasharray="3 3"/><line x1="260" y1="44" x2="260" y2="66" stroke="${GREEN}" stroke-width="1.5" stroke-dasharray="3 3"/>` +
      T(195, 24, 'Wavelength', { size: 15, fill: GREEN }));
    out += pulse(3, `<line x1="130" y1="72" x2="84" y2="72" stroke="${ORANGE}" stroke-width="1.5" stroke-dasharray="3 3"/>${staticArrow(84, 96, 84, 72, ORANGE, 3, 9)}${staticArrow(84, 96, 84, 120, ORANGE, 3, 9)}${T(76, 98, 'Amplitude', { size: 15, anchor: 'end', fill: ORANGE })}`);
    out += T(250, 226, 'One full cycle: crest to crest', { size: 13, fill: MUTED, weight: 600 });
    return TutorialKit.svg(out);
  })();

  function wavSpeedMount(el, api) {
    const mid = 92, A = 24, ppm = 30;
    const svg = scene(el, '0 0 400 172', `
      ${T(200, 22, '', { id: 'wav-eq', size: 16, fill: PRIM })}${T(200, 42, '', { id: 'wav-sub', size: 13, fill: MUTED, weight: 600 })}
      <line x1="0" y1="${mid}" x2="400" y2="${mid}" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="5 4"/>
      <path id="wav-w" d="" fill="none" stroke="${PRIM}" stroke-width="4" stroke-linejoin="round"/>
      <circle id="wav-dot" cx="30" cy="${mid}" r="7" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
      <line id="wav-rl" x1="30" y1="140" x2="120" y2="140" stroke="${GREEN}" stroke-width="3"/>
      <line id="wav-rl1" x1="30" y1="133" x2="30" y2="147" stroke="${GREEN}" stroke-width="3"/><line id="wav-rl2" x1="120" y1="133" x2="120" y2="147" stroke="${GREEN}" stroke-width="3"/>
      ${T(130, 145, '', { id: 'wav-rt', size: 14, anchor: 'start', fill: GREEN })}`,
      sliderRow('Frequency', 'wav-f', 1, 4, 1, 2, '2 Hz') + sliderRow('Wavelength', 'wav-l', 1, 4, 1, 3, '3 m'));
    const $ = s => el.querySelector(s);
    let f = 2, L = 3;
    function upd() {
      $('#wav-f-v').textContent = f + ' Hz'; $('#wav-l-v').textContent = L + ' m';
      $('#wav-eq').textContent = `v = f × λ = ${f} × ${L} = ${f * L} m/s`;
      $('#wav-sub').textContent = `${f} wave${f > 1 ? 's' : ''} pass each second, each ${L} m long`;
      const px = L * ppm;
      $('#wav-rl2').setAttribute('x1', 30 + px); $('#wav-rl2').setAttribute('x2', 30 + px); $('#wav-rl').setAttribute('x2', 30 + px);
      $('#wav-rt').setAttribute('x', 30 + px + 10); $('#wav-rt').textContent = `λ = ${L} m`;
    }
    $('#wav-f').addEventListener('input', e => { f = +e.target.value; upd(); });
    $('#wav-l').addEventListener('input', e => { L = +e.target.value; upd(); });
    upd();
    let ph = 0;
    api.loop((t, dt) => {
      ph += f * dt;
      const px = L * ppm, yAt = x => mid - A * Math.sin(2 * Math.PI * (x / px - ph));
      let d = '';
      for (let x = 0; x <= 400; x += 4) d += (x ? ' L' : 'M') + x + ',' + yAt(x).toFixed(1);
      $('#wav-w').setAttribute('d', d);
      $('#wav-dot').setAttribute('cy', yAt(30).toFixed(1));
    });
  }

  function wavSoundMount(el, api) {
    const cols = 40, rows = 4, tx0 = 54, tx1 = 390, ty0 = 52, ty1 = 124, vs = 100;
    let parts = '';
    const track = new Set([4, 14, 24, 34]);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const tr = r === 1 && track.has(c);
      parts += `<circle id="wav-s${r * cols + c}" cx="${58 + c * 8.2}" cy="${64 + r * 16}" r="${tr ? 4.2 : 2.6}" fill="${tr ? ORANGE : INK}"${tr ? ` stroke="${INK}" stroke-width="1"` : ' opacity=".75"'}/>`;
    }
    const svg = scene(el, '0 0 400 172', `
      ${T(200, 16, 'Air particles in a tube (slowed down)', { size: 13, fill: MUTED, weight: 600 })}
      <rect x="${tx0}" y="${ty0}" width="${tx1 - tx0}" height="${ty1 - ty0}" rx="6" fill="#fff" stroke="${MUTED}" stroke-width="2"/>
      <rect x="6" y="66" width="20" height="44" rx="3" fill="${INK}"/><polygon id="wav-cone" points="26,80 46,56 46,120 26,96" fill="${PRIM}"/>
      ${parts}
      <g id="wav-ct" opacity="0"><line x1="0" y1="45" x2="0" y2="51" stroke="${RED}" stroke-width="3"/>${T(0, 42, 'Compression', { id: 'wav-ctt', size: 13, fill: RED })}</g>
      <g id="wav-rt" opacity="0"><line x1="0" y1="125" x2="0" y2="131" stroke="${BLUE}" stroke-width="3"/>${T(0, 145, 'Rarefaction', { id: 'wav-rtt', size: 13, fill: BLUE })}</g>
      ${T(200, 165, 'dense = compression · spread out = rarefaction', { size: 13, fill: INK, weight: 600 })}`,
      sliderRow('Frequency', 'wav-sf', 1, 4, 1, 2, '2 Hz') + sliderRow('Loudness', 'wav-sa', 1, 5, 1, 3, 'medium'));
    const $ = s => el.querySelector(s);
    const cs = []; for (let i = 0; i < rows * cols; i++) cs.push($('#wav-s' + i));
    const loud = ['low', 'soft', 'medium', 'loud', 'max'];
    let f = 2, Am = 3;
    function upd() { $('#wav-sf-v').textContent = f + ' Hz'; $('#wav-sa-v').textContent = loud[Am - 1]; }
    $('#wav-sf').addEventListener('input', e => { f = +e.target.value; upd(); });
    $('#wav-sa').addEventListener('input', e => { Am = +e.target.value; upd(); });
    upd();
    let ph = 0;
    const fade = pos => clamp(Math.min(pos * 6, (1 - pos) * 6), 0, 1);
    api.loop((t, dt) => {
      ph += f * dt;
      const lam = vs / f, k = 2 * Math.PI / lam, w = 2 * Math.PI * ph, a = Math.min(1.2 * Am + 0.5, 0.85 / k);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x0 = 58 + c * 8.2, u = x0 - tx0;
        cs[r * cols + c].setAttribute('cx', (x0 + a * Math.sin(w - k * u)).toFixed(2));
      }
      $('#wav-cone').setAttribute('points', `26,80 ${46 + a * Math.sin(w)},56 ${46 + a * Math.sin(w)},120 26,96`);
      const phi = w % (2 * Math.PI);
      const uc = phi / k, ur = (((phi - Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / k;
      const place = (id, u0) => {
        let u = u0; while (u < 24) u += lam;
        const pos = (u - 24) / lam, g = $(id);
        g.setAttribute('transform', `translate(${(tx0 + u).toFixed(1)},0)`); g.setAttribute('opacity', fade(pos).toFixed(2));
      };
      place('#wav-ct', uc); place('#wav-rt', ur);
    });
  }

  function wavLightMount(el, api) {
    const sy = 86, cx = 200, Ln = 68, n = 1.33;
    const svg = scene(el, '0 0 400 172', `
      <rect x="0" y="0" width="400" height="${sy}" fill="#fffbeb"/><rect x="0" y="${sy}" width="400" height="${172 - sy}" fill="#bae6fd"/>
      <line x1="0" y1="${sy}" x2="400" y2="${sy}" stroke="#0284c7" stroke-width="3"/>
      <line x1="${cx}" y1="8" x2="${cx}" y2="166" stroke="${MUTED}" stroke-width="2" stroke-dasharray="5 4"/>
      ${T(cx + 6, 26, 'normal', { size: 13, anchor: 'start', fill: MUTED, weight: 600 })}
      ${T(8, sy - 8, 'Air', { size: 14, anchor: 'start', fill: MUTED })}${T(8, sy + 20, 'Water', { size: 14, anchor: 'start', fill: '#0369a1' })}
      <line id="wav-inc" stroke="${ORANGE}" stroke-width="4"/><polygon id="wav-inch" fill="${ORANGE}"/>
      <line id="wav-ref" stroke="${ORANGE}" stroke-width="4" opacity=".55"/><polygon id="wav-refh" fill="${ORANGE}" opacity=".55"/>
      <line id="wav-rfr" stroke="${ORANGE}" stroke-width="4"/><polygon id="wav-rfrh" fill="${ORANGE}"/>
      <circle id="wav-d1" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle id="wav-d2" r="4" fill="#fff" stroke="${INK}" stroke-width="2"/><circle id="wav-d3" r="4" fill="#fff" stroke="${INK}" stroke-width="2"/>
      ${T(8, 18, '', { id: 'wav-ti', size: 14, anchor: 'start', fill: ORANGE })}${T(392, 18, '', { id: 'wav-tr', size: 14, anchor: 'end', fill: ORANGE })}
      ${T(392, 164, '', { id: 'wav-tt', size: 14, anchor: 'end', fill: '#0369a1' })}`,
      sliderRow('Angle in', 'wav-th', 0, 80, 5, 40, '40°'));
    const $ = s => el.querySelector(s);
    let th = 40, auto = true;
    $('#wav-th').addEventListener('input', e => { auto = false; th = +e.target.value; });
    function ray(id, x1, y1, x2, y2) {
      const g = arrowGeom(x1, y1, x2, y2, 4, 13), l = $('#' + id), h = $('#' + id + 'h');
      l.setAttribute('x1', g.lx1); l.setAttribute('y1', g.ly1); l.setAttribute('x2', g.lx2); l.setAttribute('y2', g.ly2); h.setAttribute('points', g.pts);
    }
    api.loop(t => {
      if (auto) { th = Math.round((40 + 38 * Math.sin(t * 0.7)) / 5) * 5; $('#wav-th').value = th; }
      const a = th * Math.PI / 180, b = Math.asin(Math.sin(a) / n), bd = Math.round(b * 180 / Math.PI);
      const p0 = [cx - Ln * Math.sin(a), sy - Ln * Math.cos(a)], p1 = [cx + Ln * Math.sin(a), sy - Ln * Math.cos(a)], p2 = [cx + Ln * Math.sin(b), sy + Ln * Math.cos(b)];
      ray('wav-inc', p0[0], p0[1], cx, sy); ray('wav-ref', cx, sy, p1[0], p1[1]); ray('wav-rfr', cx, sy, p2[0], p2[1]);
      // travelling pulses
      const ph = (t % 2) / 2, first = clamp(ph / 0.5, 0, 1), second = clamp((ph - 0.5) / 0.5, 0, 1);
      const d1 = $('#wav-d1'), d2 = $('#wav-d2'), d3 = $('#wav-d3');
      d1.setAttribute('cx', lerp(p0[0], cx, first)); d1.setAttribute('cy', lerp(p0[1], sy, first)); d1.setAttribute('opacity', ph < 0.5 ? 1 : 0);
      d2.setAttribute('cx', lerp(cx, p1[0], second)); d2.setAttribute('cy', lerp(sy, p1[1], second)); d2.setAttribute('opacity', ph >= 0.5 ? 1 : 0);
      d3.setAttribute('cx', lerp(cx, p2[0], second)); d3.setAttribute('cy', lerp(sy, p2[1], second)); d3.setAttribute('opacity', ph >= 0.5 ? 1 : 0);
      $('#wav-ti').textContent = `Angle in: ${th}°`; $('#wav-tr').textContent = `Reflected: ${th}°`; $('#wav-tt').textContent = `Refracted: ${bd}°`;
      $('#wav-th-v').textContent = th + '°';
    });
  }

  registerTutorial('physics', 'waves', {
    title: 'Light & Sound (Waves)',
    keyTerms: [
      { term: 'Wavelength', definition: 'The distance from one crest to the next (one full wave cycle), measured in meters.' },
      { term: 'Amplitude', definition: 'A wave’s maximum height from its resting position. Bigger amplitude means more energy.' },
      { term: 'Frequency', definition: 'How many waves pass a point each second, in hertz (Hz). Wave speed = frequency × wavelength.' },
      { term: 'Sound wave', definition: 'A compression (longitudinal) wave that needs a medium. Higher frequency means higher pitch.' },
      { term: 'Reflection', definition: 'A wave bouncing off a surface. For light, the angle in equals the angle out.' },
      { term: 'Refraction', definition: 'A wave changing direction as it passes from one material into another, such as light entering water.' }
    ],
    steps: [
      { title: 'A wave carries energy',
        text: '<p>A <b>wave</b> carries energy from place to place without carrying matter. The wave moves right, but each buoy just bobs up and down. This is a <b>transverse</b> wave: the motion is at right angles to the wave’s direction.</p>',
        mount: wavRopeMount },
      { title: 'Parts of a wave',
        text: '<p><b>Crest</b>: the highest point. <b>Trough</b>: the lowest point. <b>Wavelength</b>: the distance from one crest to the next. <b>Amplitude</b>: the height from the resting line to a crest. Bigger amplitude means more energy.</p>',
        svg: wavStep2 },
      { title: 'Wave speed: v = f × λ',
        text: '<p><b>Frequency</b> is how many waves pass a point each second, in hertz (Hz). Wave speed = frequency × wavelength: <b>v = f × λ</b>. Slide both and watch the speed change.</p>',
        mount: wavSpeedMount },
      { title: 'Sound is a compression wave',
        text: '<p>Sound is a <b>compression wave</b>: air particles bunch up (compressions) and spread out (rarefactions), passing energy along. It needs a medium like air. Higher frequency means higher pitch; bigger amplitude means louder.</p>',
        mount: wavSoundMount },
      { title: 'Light: reflection and refraction',
        text: '<p><b>Light</b> is a wave that can travel through empty space; sound cannot. Light bounces off a surface at the same angle it arrived, measured from the dashed normal line (<b>reflection</b>). Entering water, it bends (<b>refraction</b>).</p>',
        mount: wavLightMount }
    ]
  });

  // =====================================================================
  // ELECTRICITY & MAGNETISM
  // =====================================================================
  // A closed polyline path that things (electrons) can travel around.
  function loopPath(pts) {
    const segs = []; let total = 0;
    pts.forEach((a, i) => { const b = pts[(i + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, len, start: total }); total += len; });
    return {
      total,
      at(s) {
        s = ((s % total) + total) % total;
        for (const g of segs) if (s <= g.start + g.len) { const k = (s - g.start) / (g.len || 1); return [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k]; }
        return segs[0].a;
      }
    };
  }
  // Bulb: glow + glass + lit overlay + filament. setBulb() controls brightness 0..1.
  function bulbHTML(id, cx, cy, r) {
    return `<g id="${id}"><circle id="${id}-g" cx="${cx}" cy="${cy}" r="${r * 1.7}" fill="${YELLOW}" opacity="0"/>` +
      `<circle id="${id}-c" cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2.5"/>` +
      `<circle id="${id}-l" cx="${cx}" cy="${cy}" r="${r - 1.5}" fill="#fde047" opacity="0"/>` +
      `<path id="${id}-f" d="M${cx - r * 0.55},${cy + r * 0.55} L${cx - r * 0.3},${cy - r * 0.2} L${cx},${cy + r * 0.2} L${cx + r * 0.3},${cy - r * 0.2} L${cx + r * 0.55},${cy + r * 0.55}" fill="none" stroke="${INK}" stroke-width="2"/></g>`;
  }
  function setBulb(root, id, b, present) {
    const q = s => root.querySelector('#' + id + s);
    q('-g').setAttribute('opacity', (b * 0.4).toFixed(2)); q('-l').setAttribute('opacity', b.toFixed(2));
    const c = q('-c'), f = q('-f');
    if (present === false) { c.setAttribute('fill', 'none'); c.setAttribute('stroke-dasharray', '4 3'); f.style.display = 'none'; }
    else { c.setAttribute('fill', '#fff'); c.removeAttribute('stroke-dasharray'); f.style.display = ''; }
  }
  const eleElectron = id => `<g id="${id}"><circle r="6" fill="${BLUE}" stroke="${INK}" stroke-width="1.2"/><line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#fff" stroke-width="2"/></g>`;
  // battery symbol on a vertical wire at x, centred at y (long plate = +, on top)
  function batteryV(x, y) {
    return `<rect x="${x - 20}" y="${y - 9}" width="40" height="18" fill="#fff" opacity="0"/>` +
      `<line x1="${x - 16}" y1="${y - 7}" x2="${x + 16}" y2="${y - 7}" stroke="${INK}" stroke-width="3"/>` +
      `<line x1="${x - 8}" y1="${y + 7}" x2="${x + 8}" y2="${y + 7}" stroke="${INK}" stroke-width="6"/>`;
  }

  function eleCircuitMount(el, api) {
    const xL = 60, xR = 340, yT = 56, yB = 158;
    const loop = loopPath([[xL, 116], [xL, yB], [xR, yB], [xR, yT], [xL, yT], [xL, 98]]);
    const N = 14;
    let els = ''; for (let i = 0; i < N; i++) els += eleElectron('ele-e' + i);
    const svg = scene(el, '0 0 400 200', `
      ${T(200, 20, '', { id: 'ele-st', size: 16 })}
      <path d="M${xL},${yT} L183,${yT} M217,${yT} L${xR},${yT} L${xR},${yB} L236,${yB} M164,${yB} L${xL},${yB} L${xL},116 M${xL},98 L${xL},${yT}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="${xL - 18}" y1="98" x2="${xL + 18}" y2="98" stroke="${INK}" stroke-width="3"/><line x1="${xL - 9}" y1="112" x2="${xL + 9}" y2="112" stroke="${INK}" stroke-width="6"/>
      ${T(xL - 26, 100, '+', { size: 16, anchor: 'end', fill: RED })}${T(xL - 26, 124, '−', { size: 20, anchor: 'end', fill: BLUE })}
      ${bulbHTML('ele-b', 200, yT, 17)}
      <circle cx="164" cy="${yB}" r="5" fill="${INK}"/><circle cx="236" cy="${yB}" r="5" fill="${INK}"/>
      <line id="ele-lever" x1="164" y1="${yB}" x2="236" y2="${yB}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      ${T(60, 188, 'Battery', { size: 13 })}${T(200, 188, 'Switch', { size: 13 })}${T(200, 86, 'Bulb', { size: 13 })}
      ${T(200, 110, 'Electrons (−) flow around the loop', { size: 13, fill: BLUE })}${T(200, 128, 'from the − end to the + end', { size: 13, fill: BLUE })}
      ${els}`,
      btnRow([{ id: 'ele-sw', label: 'Open the switch' }]));
    const $ = s => el.querySelector(s);
    const es = []; for (let i = 0; i < N; i++) es.push($('#ele-e' + i));
    let closed = true, ang = 0, s0 = 0, bright = 1;
    $('#ele-sw').addEventListener('click', () => { closed = !closed; $('#ele-sw').textContent = closed ? 'Open the switch' : 'Close the switch'; });
    api.loop((t, dt) => {
      if (closed) s0 += 70 * dt;
      ang += ((closed ? 0 : -32) - ang) * Math.min(1, 12 * dt);
      $('#ele-lever').setAttribute('x2', 164 + 72 * Math.cos(ang * Math.PI / 180)); $('#ele-lever').setAttribute('y2', yB + 72 * Math.sin(ang * Math.PI / 180));
      bright += ((closed ? 1 : 0) - bright) * Math.min(1, 10 * dt);
      setBulb(svg, 'ele-b', bright, true);
      es.forEach((e, i) => { const p = loop.at(s0 + i * loop.total / N); e.setAttribute('transform', `translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`); });
      const st = $('#ele-st');
      st.textContent = closed ? 'Closed circuit: current flows, bulb is on' : 'Open circuit: no flow, bulb is off';
      st.setAttribute('fill', closed ? GREEN : RED);
    });
  }

  function eleOhmMount(el, api) {
    const xL = 56, xR = 344, yT = 40, yB = 126;
    const loop = loopPath([[xL, 96], [xL, yB], [xR, yB], [xR, yT], [xL, yT], [xL, 82]]);
    const N = 16;
    let els = ''; for (let i = 0; i < N; i++) els += `<circle id="ele-o${i}" r="4.5" fill="${BLUE}" stroke="${INK}" stroke-width="1"/>`;
    const svg = scene(el, '0 0 400 172', `
      <path d="M${xL},${yT} L172,${yT} M228,${yT} L${xR},${yT} L${xR},${yB} L${xL},${yB} L${xL},96 M${xL},82 L${xL},${yT}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="${xL - 16}" y1="82" x2="${xL + 16}" y2="82" stroke="${INK}" stroke-width="3"/><line x1="${xL - 8}" y1="96" x2="${xL + 8}" y2="96" stroke="${INK}" stroke-width="6"/>
      ${T(xL - 22, 92, '', { id: 'ele-vl', size: 16, anchor: 'end', fill: RED })}
      <rect x="172" y="${yT - 12}" width="56" height="24" rx="3" fill="#fde68a" stroke="${INK}" stroke-width="2.5"/>
      ${T(200, yT - 20, '', { id: 'ele-rl', size: 16, fill: GREEN })}
      ${T(200, 76, 'I = V ÷ R', { size: 14, fill: MUTED })}${T(200, 100, '', { id: 'ele-il', size: 22, fill: ORANGE })}
      ${els}`,
      sliderRow('Voltage', 'ele-V', 1, 12, 1, 6, '6 V') + sliderRow('Resistance', 'ele-R', 1, 12, 1, 3, '3 Ω'));
    const $ = s => el.querySelector(s);
    const es = []; for (let i = 0; i < N; i++) es.push($('#ele-o' + i));
    let V = 6, R = 3, s0 = 0;
    function upd() {
      $('#ele-V-v').textContent = V + ' V'; $('#ele-R-v').textContent = R + ' Ω';
      $('#ele-vl').textContent = V + ' V'; $('#ele-rl').textContent = R + ' Ω';
      $('#ele-il').textContent = `${V} ÷ ${R} = ${f1(V / R)} A`;
    }
    $('#ele-V').addEventListener('input', e => { V = +e.target.value; upd(); });
    $('#ele-R').addEventListener('input', e => { R = +e.target.value; upd(); });
    upd();
    api.loop((t, dt) => {
      const I = V / R; s0 += clamp(20 * I, 8, 220) * dt;
      es.forEach((e, i) => { const p = loop.at(s0 + i * loop.total / N); e.setAttribute('cx', p[0].toFixed(1)); e.setAttribute('cy', p[1].toFixed(1)); });
    });
  }

  function eleSeriesMount(el, api) {
        const sLoop = loopPath([[16, 102], [16, 142], [160, 142], [160, 52], [16, 52], [16, 90]]);
    const aLoop = loopPath([[215, 102], [215, 142], [295, 142], [295, 52], [215, 52], [215, 90]]);
    const bLoop = loopPath([[215, 102], [215, 142], [368, 142], [368, 52], [215, 52], [215, 90]]);
    const dot = (id) => `<circle id="${id}" r="4" fill="${BLUE}" stroke="${INK}" stroke-width="1"/>`;
    let sD = '', aD = '', bD = '';
    for (let i = 0; i < 10; i++) sD += dot('ele-sd' + i);
    for (let i = 0; i < 7; i++) aD += dot('ele-ad' + i);
    for (let i = 0; i < 10; i++) bD += dot('ele-bd' + i);
    const svg = scene(el, '0 0 400 206', `
      ${T(88, 22, 'Series', { size: 17, fill: PRIM })}${T(292, 22, 'Parallel', { size: 17, fill: PRIM })}
      <path d="M16,90 L16,52 L74,52 M102,52 L160,52 L160,80 M160,108 L160,142 L16,142 L16,102" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="0" y1="90" x2="32" y2="90" stroke="${INK}" stroke-width="3"/><line x1="8" y1="102" x2="24" y2="102" stroke="${INK}" stroke-width="6"/>
      <path d="M215,90 L215,52 L368,52 L368,80 M368,108 L368,142 L215,142 L215,102 M295,52 L295,80 M295,108 L295,142" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="199" y1="90" x2="231" y2="90" stroke="${INK}" stroke-width="3"/><line x1="207" y1="102" x2="223" y2="102" stroke="${INK}" stroke-width="6"/>
      ${bulbHTML('ele-s1', 88, 52, 14)}${bulbHTML('ele-s2', 160, 94, 14)}${bulbHTML('ele-pa', 295, 94, 14)}${bulbHTML('ele-pb', 368, 94, 14)}
      ${sD}${aD}${bD}
      ${T(88, 172, 'One path: bulbs are dim', { id: 'ele-cs', size: 13 })}${T(292, 172, 'Two paths: bulbs are bright', { id: 'ele-cp', size: 13 })}
      ${T(88, 190, '', { id: 'ele-cs2', size: 13, fill: RED })}${T(292, 190, '', { id: 'ele-cp2', size: 13, fill: GREEN })}`,
      btnRow([{ id: 'ele-rm', label: 'Unscrew the right-hand bulb' }]));
    const $ = s => el.querySelector(s);
    const grab = (p, n) => Array.from({ length: n }, (_, i) => $('#' + p + i));
    const sd = grab('ele-sd', 10), ad = grab('ele-ad', 7), bd = grab('ele-bd', 10);
    let removed = false, ss = 0, sp = 0;
    $('#ele-rm').addEventListener('click', () => { removed = !removed; $('#ele-rm').textContent = removed ? 'Screw the bulb back in' : 'Unscrew the right-hand bulb'; });
    const place = (arr, path, off, on) => arr.forEach((d, i) => {
      d.style.display = on ? '' : 'none';
      if (on) { const p = path.at(off + i * path.total / arr.length); d.setAttribute('cx', p[0].toFixed(1)); d.setAttribute('cy', p[1].toFixed(1)); }
    });
    api.loop((t, dt) => {
      if (!removed) ss += 42 * dt;
      sp += 90 * dt;
      place(sd, sLoop, ss, !removed); place(ad, aLoop, sp, true); place(bd, bLoop, sp, !removed);
      setBulb(svg, 'ele-s1', removed ? 0 : 0.5, true); setBulb(svg, 'ele-s2', removed ? 0 : 0.5, !removed);
      setBulb(svg, 'ele-pa', 1, true); setBulb(svg, 'ele-pb', removed ? 0 : 1, !removed);
      $('#ele-cs2').textContent = removed ? 'Break in the path: all off' : '';
      $('#ele-cp2').textContent = removed ? 'The other bulb stays on' : '';
    });
  }

  function eleMagnetMount(el, api) {
    const y0 = 98, mh = 40, mw = 90;
    const mag = (id, leftPole) => {
      const L = leftPole === 'N' ? RED : BLUE, Rc = leftPole === 'N' ? BLUE : RED, Rn = leftPole === 'N' ? 'S' : 'N';
      return `<g id="${id}"><rect x="0" y="${y0}" width="${mw / 2}" height="${mh}" fill="${L}" stroke="${INK}" stroke-width="2.5"/><rect x="${mw / 2}" y="${y0}" width="${mw / 2}" height="${mh}" fill="${Rc}" stroke="${INK}" stroke-width="2.5"/>` +
        `${T(mw / 4, y0 + 27, leftPole, { size: 20, fill: '#fff' })}${T(mw * 0.75, y0 + 27, Rn, { size: 20, fill: '#fff' })}</g>`;
    };
    const svg = scene(el, '0 0 400 200', `
      ${T(200, 26, '', { id: 'mag-t', size: 17 })}
      <line x1="0" y1="${y0 + mh + 2}" x2="400" y2="${y0 + mh + 2}" stroke="${MUTED}" stroke-width="2"/>
      <g transform="translate(60,0)">${mag('mag-1', 'S')}</g>
      <g id="mag-2w"><g id="mag-2"></g></g>
      ${arrowHTML('mag-a1', GREEN, 5)}${arrowHTML('mag-a2', GREEN, 5)}
      ${T(0, 60, 'force', { id: 'mag-f1', size: 13, fill: GREEN })}${T(0, 60, 'force', { id: 'mag-f2', size: 13, fill: GREEN })}
      ${T(200, 178, 'N = north pole (red)   S = south pole (blue)', { size: 13, fill: MUTED, weight: 600 })}`,
      btnRow([{ id: 'mag-flip', label: 'Flip the right-hand magnet' }]));
    const $ = s => el.querySelector(s);
    let flipped = false, x2 = 210, v2 = 0, phase = 'go', hold = 0;
    function build() { $('#mag-2').innerHTML = mag('mag-2i', flipped ? 'N' : 'S'); }
    function restart() { x2 = flipped ? 168 : 214; v2 = 0; phase = 'go'; hold = 0; }
    $('#mag-flip').addEventListener('click', () => { flipped = !flipped; build(); restart(); });
    build(); restart();
    api.loop((t, dt) => {
      const attract = !flipped;
      if (phase === 'go') {
        v2 += (attract ? -260 : 260) * dt; x2 += v2 * dt;
        if (attract && x2 <= 154) { x2 = 154; phase = 'hold'; hold = 1.3; }
        if (!attract && x2 >= 300) { x2 = 300; phase = 'hold'; hold = 0.8; }
      } else { hold -= dt; if (hold <= 0) restart(); }
      $('#mag-2w').setAttribute('transform', `translate(${x2},0)`);
      const d = attract ? 1 : -1, c1 = 105 + 0, c2 = x2 + 45;
      setArrow(svg, 'mag-a1', c1 - 20 * d, 76, c1 + 20 * d, 76, 5, 12);
      setArrow(svg, 'mag-a2', c2 + 20 * d, 76, c2 - 20 * d, 76, 5, 12);
      $('#mag-f1').setAttribute('x', c1); $('#mag-f2').setAttribute('x', c2);
      $('#mag-f1').setAttribute('y', 62); $('#mag-f2').setAttribute('y', 62);
      const tt = $('#mag-t');
      tt.textContent = attract ? 'N faces S: opposite poles ATTRACT' : 'N faces N: same poles REPEL';
      tt.setAttribute('fill', attract ? GREEN : RED);
    });
  }

  function eleElectroMount(el, api) {
    const ny = 106;
    let coil = '';
    for (let x = 108; x <= 186; x += 13) coil += `<line x1="${x}" y1="${ny + 20}" x2="${x + 10}" y2="${ny - 20}" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>`;
    const dashes = (d, i) => `<path d="${d}" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-dasharray="8 6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.7s" repeatCount="indefinite"/></path>`;
    const svg = scene(el, '0 0 400 200', `
      ${T(200, 20, '', { id: 'emg-t', size: 16 })}
      <line x1="0" y1="194" x2="400" y2="194" stroke="${MUTED}" stroke-width="2"/>
      <g id="emg-field" style="display:none">${dashes('M56,100 C20,14 274,14 234,100')}${dashes('M60,98 C50,50 240,50 230,98')}${dashes('M56,112 C20,190 274,190 234,112')}</g>
      <rect x="58" y="${ny - 7}" width="176" height="14" rx="3" fill="#94a3b8" stroke="${INK}" stroke-width="2"/>
      ${coil}
      <path d="M300,142 L300,164 L108,164 L108,${ny + 20} M196,${ny - 20} L196,74 L300,74 L300,120" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="292" y1="124" x2="308" y2="124" stroke="${INK}" stroke-width="6"/><line x1="284" y1="138" x2="316" y2="138" stroke="${INK}" stroke-width="3"/>
      ${T(276, 143, '+', { size: 16, anchor: 'end', fill: RED })}${T(276, 130, '−', { size: 18, anchor: 'end', fill: BLUE })}${T(352, 136, 'Battery', { size: 13 })}
      ${T(46, ny + 6, 'N', { id: 'emg-n', size: 18, anchor: 'end', fill: RED, extra: 'opacity="0.25"' })}${T(246, ny + 6, 'S', { id: 'emg-s', size: 18, anchor: 'start', fill: BLUE, extra: 'opacity="0.25"' })}
      ${T(392, 184, 'yellow dots = current (+ to −)', { size: 13, fill: MUTED, weight: 600, anchor: 'end' })}
      <g id="emg-flow"></g>
      <g id="emg-clips"></g>`,
      btnRow([{ id: 'emg-sw', label: 'Turn current ON' }]));
    const $ = s => el.querySelector(s);
    const cur = loopPath([[300, 142], [300, 164], [108, 164], [108, ny + 20], [196, ny - 20], [196, 74], [300, 74], [300, 120]]);
    let flow = ''; for (let i = 0; i < 12; i++) flow += `<circle id="emg-d${i}" r="4" fill="${YELLOW}" stroke="${INK}" stroke-width="1" style="display:none"/>`;
    $('#emg-flow').innerHTML = flow;
    const ds = Array.from({ length: 12 }, (_, i) => $('#emg-d' + i));
    const clips = [0, 1, 2].map(k => ({ x: 60 + k * 26 - 8, y: 185, vy: 0, k }));
    let on = false, s0 = 0;
    $('#emg-sw').addEventListener('click', () => { on = !on; $('#emg-sw').textContent = on ? 'Turn current OFF' : 'Turn current ON'; });
    api.loop((t, dt) => {
      if (on) s0 += 70 * dt;
      $('#emg-field').style.display = on ? '' : 'none';
      $('#emg-n').setAttribute('opacity', on ? 1 : 0.25); $('#emg-s').setAttribute('opacity', on ? 1 : 0.25);
      ds.forEach((d, i) => { d.style.display = on ? '' : 'none'; if (on) { const p = cur.at(s0 + i * cur.total / 12); d.setAttribute('cx', p[0].toFixed(1)); d.setAttribute('cy', p[1].toFixed(1)); } });
      let h = '';
      clips.forEach(c => {
        const ty = ny + 12 + 10 + c.k * 11;
        if (on) { c.x += (58 - c.x) * Math.min(1, 6 * dt); const spd = 150 + c.k * 20; c.y = Math.max(ty, c.y - spd * dt); c.vy = 0; }
        else { c.vy += 600 * dt; c.y = Math.min(185, c.y + c.vy * dt); if (c.y >= 185) c.vy = 0; }
        h += `<rect x="${(c.x - 11).toFixed(1)}" y="${(c.y - 4).toFixed(1)}" width="22" height="9" rx="4.5" fill="none" stroke="#475569" stroke-width="2.5"/>`;
      });
      $('#emg-clips').innerHTML = h;
      const tt = $('#emg-t');
      tt.textContent = on ? 'Current ON: the nail is a magnet' : 'Current OFF: no magnetism, clips fall';
      tt.setAttribute('fill', on ? GREEN : MUTED);
    });
  }

  registerTutorial('physics', 'electricity', {
    title: 'Electricity & Magnetism',
    keyTerms: [
      { term: 'Electric current', definition: 'The flow of electric charge (electrons in a wire), measured in amperes (A). Conventional current is drawn from + to −.' },
      { term: 'Voltage', definition: 'The “push” (energy per charge) from a battery that drives current, measured in volts (V).' },
      { term: 'Resistance', definition: 'How much a part opposes current, in ohms (Ω). Ohm’s law: V = I × R.' },
      { term: 'Circuit', definition: 'A path for current. A closed circuit lets it flow; an open circuit has a break, so nothing flows.' },
      { term: 'Conductor / insulator', definition: 'A conductor (copper, other metals) lets current flow easily. An insulator (rubber, plastic) blocks it.' },
      { term: 'Electromagnet', definition: 'A magnet made by current flowing through a coil of wire; it can be switched on and off.' }
    ],
    steps: [
      { title: 'A circuit: charges flow in a loop',
        text: '<p>A battery pushes <b>electrons</b> (tiny negative charges) around a closed loop of metal wire, a <b>conductor</b>. That flow is <b>electric current</b>. Open the switch and the loop is broken, so nothing flows.</p>',
        mount: eleCircuitMount },
      { title: 'Ohm’s law: V = I × R',
        text: '<p><b>Voltage</b> (V, volts) pushes; <b>resistance</b> (R, ohms Ω) resists. The current I (amperes, A) is I = V ÷ R. More voltage means more current; more resistance means less.</p>',
        mount: eleOhmMount },
      { title: 'Series and parallel circuits',
        text: '<p>In a <b>series</b> circuit there is one path, so one broken bulb breaks it for all, and bulbs share the voltage and glow dimmer. In <b>parallel</b>, each bulb has its own branch and glows brightly.</p>',
        mount: eleSeriesMount },
      { title: 'Magnets: attract and repel',
        text: '<p>Every magnet has a north (N) and a south (S) <b>pole</b>. Opposite poles attract; the same poles repel. The push or pull works without touching, through the magnet’s invisible <b>magnetic field</b>.</p>',
        mount: eleMagnetMount },
      { title: 'Electromagnets',
        text: '<p>Current in a coil of wire makes a magnetic field, and an iron core makes it stronger: an <b>electromagnet</b>. Unlike a permanent magnet, you can switch it off, so the clips drop.</p>',
        mount: eleElectroMount }
    ]
  });

  // __NEXT_TOPIC__
})();
