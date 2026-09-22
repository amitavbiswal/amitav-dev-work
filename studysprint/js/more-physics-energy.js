(function () {
  'use strict';
  // more-physics-energy: five extra real-life examples for Energy & Work (namespace mnrg-).

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
  function scene(el, vb, inner, rows) {
    el.innerHTML = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet" style="flex:1 1 0;min-height:0;width:100%;height:auto">${inner}</svg>${rows || ''}`;
    return el.querySelector('svg');
  }

  const steps = [];

  // ---------------------------------------------------------------------
  // 1. Roller coaster: PE and KE swap, brakes make heat (slider: first hill height)
  // ---------------------------------------------------------------------
  function mnrgCoasterMount(el, api) {
    const SC = 2.8, GY = 172, BASE = 6, G = 9.8, V0 = 2, MASS = 1000, LIFT = 45, XB = 340;   // units per metre, ground, track offset, g, crest speed, kg, lift speed (units/s), brake start x
    const nodes = [[8, 0.06], [70, 1], [135, 0], [200, 0.64], [255, 0.05], [300, 0.36], [340, 0], [392, 0]];
    const BX = 8, BW = 384;
    const svg = scene(el, '0 0 400 196', `
      <rect x="${BX}" y="4" width="${BW}" height="14" rx="3" fill="none" stroke="${MUTED}" stroke-width="2"/>
      <rect id="mnrg-bpe" x="${BX}" y="4" width="0" height="14" fill="${BLUE}"/><rect id="mnrg-bke" x="${BX}" y="4" width="0" height="14" fill="${ORANGE}"/><rect id="mnrg-bht" x="${BX}" y="4" width="0" height="14" fill="${RED}"/>
      <line x1="0" y1="${GY}" x2="400" y2="${GY}" stroke="${INK}" stroke-width="3"/>
      <g id="mnrg-sup" stroke="${MUTED}" stroke-width="2"></g>
      <path id="mnrg-trk" d="" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="${XB}" y1="${GY - 26}" x2="${XB}" y2="${GY - BASE - 2}" stroke="${RED}" stroke-width="2" stroke-dasharray="3 3"/>
      ${T(XB + 26, GY - 30, 'Brakes', { size: 12, fill: RED })}
      <g id="mnrg-car"><rect x="-12" y="-10" width="24" height="8" rx="2" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
        <circle cx="-4" cy="-15" r="3.6" fill="${SOFT}" stroke="${INK}" stroke-width="1.5"/><circle cx="5" cy="-15" r="3.6" fill="${SOFT}" stroke="${INK}" stroke-width="1.5"/>
        <circle cx="-7" cy="-2" r="2.6" fill="${INK}"/><circle cx="7" cy="-2" r="2.6" fill="${INK}"/></g>
      ${T(8, 36, '', { id: 'mnrg-t1', size: 13, fill: BLUE, anchor: 'start' })}
      ${T(98, 36, '', { id: 'mnrg-t2', size: 13, fill: ORANGE, anchor: 'start' })}
      ${T(196, 36, '', { id: 'mnrg-t3', size: 13, fill: RED, anchor: 'start' })}
      ${T(392, 36, '', { id: 'mnrg-t4', size: 13, anchor: 'end' })}
      ${T(392, 54, '', { id: 'mnrg-t5', size: 13, weight: 600, fill: MUTED, anchor: 'end' })}
      ${T(8, 192, '', { id: 'mnrg-st', size: 13, anchor: 'start' })}`,
      sliderRow('First hill', 'mnrg-h', 15, 40, 1, 30, '30 m'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mnrg-h'), out = el.querySelector('#mnrg-h-v');
    let H = 30, pts = [], sApex = 0, sBrake = 0, sEnd = 0, Etot = 1;
    let mode = 'lift', s = 0, hold = 0, vb = 0;
    const smooth = u => (1 - Math.cos(Math.PI * u)) / 2;
    function hAt(x) {
      for (let i = 0; i < nodes.length - 1; i++) if (x <= nodes[i + 1][0]) {
        const u = clamp((x - nodes[i][0]) / (nodes[i + 1][0] - nodes[i][0]), 0, 1);
        return lerp(nodes[i][1], nodes[i + 1][1], smooth(u)) * H;
      }
      return 0;
    }
    function rebuild() {
      H = +slider.value; out.textContent = H + ' m';
      pts = []; let acc = 0, px = 0, py = 0;
      for (let x = 8; x <= 392; x += 1) {
        const h = hAt(x), y = GY - BASE - h * SC;
        if (x > 8) acc += Math.hypot(x - px, y - py);
        pts.push({ x, y, h, s: acc }); px = x; py = y;
      }
      sApex = pts[70 - 8].s; sBrake = pts[XB - 8].s; sEnd = pts[pts.length - 1].s;
      Etot = G * H + V0 * V0 / 2;
      $('#mnrg-trk').setAttribute('d', 'M' + pts.filter((p, i) => i % 3 === 0 || i === pts.length - 1).map(p => `${p.x},${p.y.toFixed(1)}`).join(' L'));
      $('#mnrg-sup').innerHTML = pts.filter(p => p.x % 16 === 8).map(p => `<line x1="${p.x}" y1="${(p.y + 2).toFixed(1)}" x2="${p.x}" y2="${GY}"/>`).join('');
      mode = 'lift'; s = 0; hold = 0;
    }
    function at(sv) {
      let lo = 0, hi = pts.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (pts[m].s <= sv) lo = m; else hi = m; }
      const a = pts[lo], b = pts[hi], k = b.s > a.s ? clamp((sv - a.s) / (b.s - a.s), 0, 1) : 0;
      return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), h: lerp(a.h, b.h, k), ang: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
    }
    slider.addEventListener('input', rebuild);
    rebuild();
    function frame(dt) {
      let v = 0;
      if (mode === 'lift') { s += LIFT * dt; if (s >= sApex) { s = sApex; mode = 'ride'; } }
      else if (mode === 'ride') {
        const p = at(s); v = Math.sqrt(V0 * V0 + 2 * G * Math.max(0, H - p.h));
        s += v * SC * dt;
        if (s >= sBrake) { s = sBrake; mode = 'brake'; vb = Math.sqrt(V0 * V0 + 2 * G * H); vb = Math.sqrt(V0 * V0 + 2 * G * Math.max(0, H - at(sBrake).h)); }
      } else if (mode === 'brake') {
        const u = (s - sBrake) / (sEnd - sBrake);
        v = vb * Math.sqrt(Math.max(0, 1 - u));
        s += Math.max(v, 0.6) * SC * dt;
        if (u > 0.985 || v < 0.3) { mode = 'hold'; hold = 0; v = 0; s = Math.min(s, sEnd); }
      } else { hold += dt; if (hold > 1.6) { mode = 'lift'; s = 0; } }
      const p = at(s);
      $('#mnrg-car').setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.ang})`);
      const pe = G * p.h / Etot, ke = mode === 'lift' ? 0 : v * v / 2 / Etot;
      const ht = mode === 'brake' || mode === 'hold' ? clamp(1 - pe - ke, 0, 1) : 0;
      const seg = (id, a, w) => { const n = $(id); n.setAttribute('x', BX + a * BW); n.setAttribute('width', Math.max(0, w) * BW); };
      seg('#mnrg-bpe', 0, pe); seg('#mnrg-bke', pe, ke); seg('#mnrg-bht', pe + ke, ht);
      $('#mnrg-t1').textContent = `PE ${Math.round(MASS * G * p.h / 1000)} kJ`;
      $('#mnrg-t2').textContent = `KE ${Math.round(MASS * v * v / 2000)} kJ`;
      $('#mnrg-t3').textContent = ht > 0.005 ? `Heat ${Math.round(ht * Etot * MASS / 1000)} kJ` : '';
      $('#mnrg-t4').textContent = mode === 'lift' ? 'Chain lift' : `Speed ${Math.round(v * 3.6)} km/h`;
      $('#mnrg-t5').textContent = `Height ${Math.round(p.h)} m`;
      $('#mnrg-st').textContent = mode === 'lift' ? 'Motor lifts the car (sped up): it adds PE'
        : mode === 'ride' ? 'Free ride, friction ignored: PE and KE swap' : mode === 'brake' ? 'Brakes: KE turns into heat' : 'Stopped: the energy became heat';
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => slider.removeEventListener('input', rebuild);
  }
  steps.push({
    kind: 'example',
    title: 'Real life: A roller coaster',
    text: '<p>A motor lifts the car to the top, giving it <b>gravitational potential energy</b>. Then every drop turns PE into <b>kinetic energy</b>, and every climb turns it back. The car can never rise higher than where it started, and the brakes finally turn its energy into heat.</p>',
    explain: '<p>A coaster car is pulled up the first hill, then rolls freely over lower hills to the brakes. The long <b>bar</b> on top is the total energy: <b>blue</b> is PE, <b>orange</b> is KE and <b>red</b> is heat. Blue shrinks as orange grows on each drop. Drag the <b>First hill</b> slider to change the height.</p><p>Notice that the bar is always full.</p>',
    say: 'Watch the roller coaster car. First, a motor pulls it slowly up the tall hill. The long bar at the top shows its energy. The blue part is potential energy, from height. Now the car is released. As it drops, the blue part shrinks and the orange part grows. Orange is kinetic energy, the energy of motion. Down at the bottom, the car is fastest. Then it climbs the next hill, and orange turns back into blue. It never gets as high as the first hill. At the end, the brakes turn the motion into heat, shown in red. Try the slider. A taller first hill gives a faster ride.',
    mount: mnrgCoasterMount
  });

  // ---------------------------------------------------------------------
  // 2. A ramp: a longer ramp needs less push, but the work is the same (slider: ramp length)
  // ---------------------------------------------------------------------
  function mnrgRampMount(el, api) {
    const SC = 50, GY = 160, XT = 330, WT = 500, HGT = 1, SPD = 1;    // units per metre, ground, top of ramp x, crate weight (N), height (m), push speed (m/s)
    const svg = scene(el, '0 0 400 190', `
      <line x1="0" y1="${GY}" x2="400" y2="${GY}" stroke="${INK}" stroke-width="3"/>
      <rect x="${XT}" y="${GY - HGT * SC}" width="${400 - XT}" height="${HGT * SC}" fill="${SOFT}" stroke="${INK}" stroke-width="3"/>
      <polygon id="mnrg-ramp" fill="${MUTED}" opacity="0.4"/>
      <line id="mnrg-rl" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      ${T(364, GY - 12, '1 m high', { size: 13 })}
      <g id="mnrg-crate"><rect x="-19" y="-15" width="38" height="30" rx="3" fill="${ORANGE}" stroke="${INK}" stroke-width="2.5"/>
        <line x1="-19" y1="-15" x2="19" y2="15" stroke="${INK}" stroke-width="1.2" opacity="0.5"/>${T(0, 5, '500 N', { size: 12, fill: INK })}</g>
      ${arrowHTML('mnrg-push', RED, 6)}
      ${T(8, 18, '', { id: 'mnrg-r1', size: 14, fill: RED, anchor: 'start' })}
      ${T(8, 36, '', { id: 'mnrg-r2', size: 14, anchor: 'start' })}
      ${T(8, 56, '', { id: 'mnrg-r3', size: 15, fill: GREEN, anchor: 'start' })}
      ${T(392, 18, 'Lifting straight up:', { size: 13, weight: 600, fill: MUTED, anchor: 'end' })}
      ${T(392, 36, '500 N × 1 m = 500 J', { size: 13, weight: 600, fill: MUTED, anchor: 'end' })}
      ${T(392, 58, '', { id: 'mnrg-pe', size: 14, fill: BLUE, anchor: 'end' })}
      ${T(8, 182, 'Smooth ramp, no friction', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}`,
      sliderRow('Ramp', 'mnrg-len', 1.5, 5, 0.5, 2.5, '2.5 m'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mnrg-len'), out = el.querySelector('#mnrg-len-v');
    let L = 2.5, ang = 0, run = 0, x0 = 0, ph = 0, F = 200;
    function setup() {
      L = +slider.value; out.textContent = f1(L) + ' m';
      ang = Math.asin(HGT / L); run = Math.sqrt(L * L - HGT * HGT) * SC; x0 = XT - run;
      F = WT * HGT / L;
      $('#mnrg-ramp').setAttribute('points', `${x0},${GY} ${XT},${GY - HGT * SC} ${XT},${GY}`);
      const rl = $('#mnrg-rl'); rl.setAttribute('x1', x0); rl.setAttribute('y1', GY); rl.setAttribute('x2', XT); rl.setAttribute('y2', GY - HGT * SC);
      $('#mnrg-r1').textContent = `Push needed: ${Math.round(F)} N`;
      $('#mnrg-r2').textContent = `Distance pushed: ${f1(L)} m`;
      $('#mnrg-r3').textContent = `Work: ${Math.round(F)} N × ${f1(L)} m = ${Math.round(F * L)} J`;
      ph = 0;
    }
    slider.addEventListener('input', setup);
    setup();
    function frame(dt) {
      ph += dt;
      const tpush = L / SPD, cyc = tpush + 1.4;
      if (ph >= cyc) ph -= cyc;
      const d = Math.min(L, ph * SPD), k = d / L;
      const px = x0 + k * run, py = GY - k * HGT * SC;
      const dx = Math.cos(ang), dy = -Math.sin(ang), nx = -Math.sin(ang), ny = -Math.cos(ang);
      const cx = px + 15 * nx, cy = py + 15 * ny;
      $('#mnrg-crate').setAttribute('transform', `translate(${cx} ${cy}) rotate(${-ang * 180 / Math.PI})`);
      const pushing = ph < tpush, len = F * 0.13;
      $('#mnrg-push').style.display = pushing ? '' : 'none';
      if (pushing) setArrow(svg, 'mnrg-push', cx - dx * (20 + len), cy - dy * (20 + len), cx - dx * 20, cy - dy * 20, 6, 12);
      const pe = $('#mnrg-pe');
      pe.textContent = ph >= tpush ? 'PE gained: 500 J' : '';
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => slider.removeEventListener('input', setup);
  }
  steps.push({
    kind: 'example',
    title: 'Real life: A ramp',
    text: '<p>A ramp is a <b>simple machine</b>. Lifting a 500 N box 1 m needs 500 J of work whatever you do. A longer ramp needs a smaller push, but you push over a longer distance, so <b>force × distance</b> stays the same.</p>',
    explain: '<p>An orange <b>box</b> is pushed up a smooth <b>ramp</b> to a platform 1 m high, then the scene repeats. The <b>red arrow</b> is the push along the ramp. The top lines work out the push, the distance and the work in joules. Drag the <b>Ramp</b> slider: a longer ramp needs a smaller push, but the work stays 500 J.</p><p>Notice that machines make a job easier, not smaller.</p>',
    say: 'Look at the orange box being pushed up a ramp to a platform one meter high. The red arrow is the push along the ramp. The box weighs five hundred newtons. The lines at the top work out the push, the distance and the work done. Work is force times distance, measured in joules. Now drag the ramp slider to make the ramp longer. The push needed gets smaller, but you have to push over a longer distance. The work stays five hundred joules every time. It is the same work as lifting the box straight up. A ramp does not save energy. It just makes each push easier to manage.',
    mount: mnrgRampMount
  });

  // ---------------------------------------------------------------------
  // 3. Wind turbine: wind KE to electricity; power grows with the cube of wind speed (slider)
  // ---------------------------------------------------------------------
  function mnrgWindMount(el, api) {
    const HX = 232, HY = 84, R = 54, GY = 168, K = 0.5 * 1.2 * Math.PI * 40 * 40, CP = 0.4, VMAX = 12;   // hub, blade length, ground, W per (m/s)^3 (rho 1.2, radius 40 m), fraction converted
    const CX0 = 308, CY0 = 144, CW = 80, CH = 70, PMAX = CP * K * VMAX * VMAX * VMAX;
    const fmt = w => w >= 1e6 ? r1(w / 1e6) + ' MW' : Math.round(w / 1000) + ' kW';
    const curve = Array.from({ length: 25 }, (_, i) => { const v = i / 2; return `${(CX0 + v / VMAX * CW).toFixed(1)},${(CY0 - CP * K * v * v * v / PMAX * CH).toFixed(1)}`; }).join(' ');
    const streaks = Array.from({ length: 14 }, (_, i) => `<line id="mnrg-s${i}" x1="0" y1="0" x2="18" y2="0" stroke="${TEAL}" stroke-width="2.5" stroke-linecap="round" opacity="0.65"/>`).join('');
    const blade = a => `<path d="M-5,0 L5,0 L1.5,-${R} L-1.5,-${R} Z" transform="rotate(${a})" fill="${SOFT}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    const svg = scene(el, '0 0 400 190', `
      <line x1="0" y1="${GY}" x2="400" y2="${GY}" stroke="${INK}" stroke-width="3"/>
      <g id="mnrg-air">${streaks}</g>
      <polygon points="${HX - 6},${HY + 6} ${HX + 6},${HY + 6} ${HX + 9},${GY} ${HX - 9},${GY}" fill="${SOFT}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="${HX - 4}" y="${HY - 6}" width="26" height="12" rx="4" fill="${MUTED}" stroke="${INK}" stroke-width="2"/>
      <g id="mnrg-rot" transform="translate(${HX} ${HY})">${blade(0)}${blade(120)}${blade(240)}<circle r="6" fill="${INK}"/></g>
      <rect x="${CX0 - 12}" y="50" width="98" height="114" rx="6" fill="${SOFT}" stroke="${MUTED}" stroke-width="1.5"/>
      <line x1="${CX0}" y1="${CY0}" x2="${CX0 + CW + 4}" y2="${CY0}" stroke="${INK}" stroke-width="2"/><line x1="${CX0}" y1="${CY0}" x2="${CX0}" y2="${CY0 - CH - 6}" stroke="${INK}" stroke-width="2"/>
      <polyline points="${curve}" fill="none" stroke="${GREEN}" stroke-width="3" stroke-linejoin="round"/>
      <circle id="mnrg-dot" r="5" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/>
      ${T(CX0 - 4, 66, 'Power', { size: 12, anchor: 'start' })}${T(CX0 + 40, 160, 'Wind speed', { size: 12, fill: MUTED })}
      ${T(8, 16, '', { id: 'mnrg-w1', size: 14, anchor: 'start' })}
      ${T(8, 34, '', { id: 'mnrg-w2', size: 13, fill: TEAL, anchor: 'start' })}
      ${T(8, 52, '', { id: 'mnrg-w3', size: 14, fill: GREEN, anchor: 'start' })}
      ${T(8, 70, '', { id: 'mnrg-w4', size: 13, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(8, 188, 'Twice the wind speed: 8 times the power', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}`,
      sliderRow('Wind', 'mnrg-v', 3, 12, 1, 6, '6 m/s'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mnrg-v'), out = el.querySelector('#mnrg-v-v');
    const ys = Array.from({ length: 14 }, (_, i) => 22 + (i * 37) % 138), xs = Array.from({ length: 14 }, (_, i) => (i * 47) % 300);
    let th = 0;
    function apply() {
      const v = +slider.value;
      out.textContent = v + ' m/s';
      $('#mnrg-w1').textContent = `Wind: ${v} m/s`;
      $('#mnrg-w2').textContent = `Wind power: ${fmt(K * v * v * v)}`;
      $('#mnrg-w3').textContent = `Electricity: ${fmt(CP * K * v * v * v)}`;
      $('#mnrg-w4').textContent = `Rotor: ${Math.round(v * 1.67)} turns a minute`;
      $('#mnrg-dot').setAttribute('cx', CX0 + v / VMAX * CW); $('#mnrg-dot').setAttribute('cy', CY0 - CP * K * v * v * v / PMAX * CH);
    }
    slider.addEventListener('input', apply);
    apply();
    function frame(dt) {
      const v = +slider.value;
      th += 0.175 * v * dt * 180 / Math.PI;
      $('#mnrg-rot').setAttribute('transform', `translate(${HX} ${HY}) rotate(${th})`);
      for (let i = 0; i < 14; i++) {
        xs[i] += v * 12 * (xs[i] > HX ? 0.65 : 1) * dt;
        if (xs[i] > 290) xs[i] = -20;
        const n = $('#mnrg-s' + i); n.setAttribute('transform', `translate(${xs[i]} ${ys[i]})`);
      }
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => slider.removeEventListener('input', apply);
  }
  steps.push({
    kind: 'example',
    title: 'Real life: A wind turbine',
    text: '<p>Moving air has <b>kinetic energy</b>. The turbine blades catch some of it and turn a generator that makes electricity. Twice the wind speed gives 4 times the energy in each kilogram of air and 2 times as much air per second, so <b>8 times</b> the power.</p>',
    explain: '<p>Wind, shown as <b>teal streaks</b>, blows from the left onto a turbine with three <b>blades</b>. After the blades the air is slower. Numbers on the left give the wind power and the electricity made, and a small <b>graph</b> plots power against wind speed with a yellow dot. Drag the <b>Wind</b> slider to change everything.</p><p>Notice that the graph curves steeply upward.</p>',
    say: 'Look at the wind turbine. The teal streaks are moving air, blowing from the left. The blades catch some of the energy of the moving air and spin. Notice that the air is slower after it has passed the blades. It has given up some of its energy. That energy drives a generator and makes electricity. The numbers show the power in the wind and the electricity made, which is about forty percent of it. Now drag the wind slider. The small graph curves steeply. If the wind speed doubles, the power becomes eight times bigger. So a windy site is worth much more than a calm one.',
    mount: mnrgWindMount
  });

  // ---------------------------------------------------------------------
  // 4. Power: energy per second, shown with a bulb and an energy meter (slider: power)
  // ---------------------------------------------------------------------
  function mnrgBulbMount(el, api) {
    const BXC = 110, BYC = 100, WY = 152, WLEN = 96 + 14, SPEED = 50, NDOT = 24, CYC = 10;
    const rays = Array.from({ length: 12 }, (_, i) => `<line id="mnrg-ry${i}" stroke="${YELLOW}" stroke-width="3" stroke-linecap="round"/>`).join('');
    const dots = Array.from({ length: NDOT }, (_, i) => `<circle id="mnrg-d${i}" r="3.6" fill="${ORANGE}" stroke="${INK}" stroke-width="1"/>`).join('');
    const heat = [-16, 0, 16].map((dx, i) => `<path id="mnrg-h${i}" d="M0,0 q4,-6 0,-12 t0,-12" fill="none" stroke="${RED}" stroke-width="2.5" stroke-linecap="round"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <circle id="mnrg-glow" cx="${BXC}" cy="${BYC}" r="40" fill="${YELLOW}" opacity="0.2"/>
      ${rays}
      <path d="M14,${WY} L${BXC},${WY} L${BXC},${WY - 14}" fill="none" stroke="${MUTED}" stroke-width="5" stroke-linejoin="round"/>
      ${dots}
      <rect x="2" y="${WY - 14}" width="14" height="28" rx="3" fill="${SOFT}" stroke="${INK}" stroke-width="2"/>
      <rect x="${BXC - 12}" y="${BYC + 24}" width="24" height="14" rx="2" fill="${MUTED}" stroke="${INK}" stroke-width="2"/>
      <circle id="mnrg-bulb" cx="${BXC}" cy="${BYC}" r="24" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/>
      <path d="M${BXC - 8},${BYC + 24} L${BXC - 6},${BYC - 2} L${BXC},${BYC + 8} L${BXC + 6},${BYC - 2} L${BXC + 8},${BYC + 24}" fill="none" stroke="${INK}" stroke-width="2"/>
      <g id="mnrg-heat" transform="translate(0 0)">${heat}</g>
      ${T(8, 18, '', { id: 'mnrg-p1', size: 15, fill: PRIM, anchor: 'start' })}
      ${T(8, 36, '', { id: 'mnrg-p2', size: 13, anchor: 'start' })}
      <rect x="236" y="8" width="156" height="150" rx="8" fill="${SOFT}" stroke="${INK}" stroke-width="2.5"/>
      ${T(314, 30, 'Energy used', { size: 13, weight: 600, fill: MUTED })}
      ${T(314, 66, '', { id: 'mnrg-e', size: 28 })}
      ${T(314, 88, '', { id: 'mnrg-tm', size: 13, weight: 600 })}
      <rect x="250" y="100" width="128" height="12" rx="3" fill="none" stroke="${MUTED}" stroke-width="2"/><rect id="mnrg-eb" x="250" y="100" width="0" height="12" rx="3" fill="${ORANGE}"/>
      <circle cx="262" cy="136" r="3.6" fill="${ORANGE}" stroke="${INK}" stroke-width="1"/>${T(272, 140, '= 10 J of energy', { size: 12, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(8, 184, 'A 10 W LED lights a room like an old 60 W bulb', { size: 13, weight: 600, fill: MUTED, anchor: 'start' })}`,
      sliderRow('Power', 'mnrg-pw', 5, 100, 5, 60, '60 W'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mnrg-pw'), out = el.querySelector('#mnrg-pw-v');
    let E = 0, tm = 0, off = 0, hp = 0;
    const pos = d => d < 96 ? [14 + d, WY] : [BXC, WY - (d - 96)];
    function apply() {
      const P = +slider.value, k = P / 100;
      out.textContent = P + ' W'; tm = 0; E = 0;
      $('#mnrg-p1').textContent = `Power: ${P} W`;
      $('#mnrg-p2').textContent = `= ${P} joules every second`;
      $('#mnrg-glow').setAttribute('r', 30 + 26 * k); $('#mnrg-glow').setAttribute('opacity', 0.06 + 0.4 * k);
      $('#mnrg-bulb').setAttribute('fill-opacity', 0.25 + 0.75 * k);
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6, r0 = 30, r1_ = 30 + 5 + 22 * k, n = $('#mnrg-ry' + i);
        n.setAttribute('x1', BXC + Math.cos(a) * r0); n.setAttribute('y1', BYC + Math.sin(a) * r0);
        n.setAttribute('x2', BXC + Math.cos(a) * r1_); n.setAttribute('y2', BYC + Math.sin(a) * r1_);
        n.setAttribute('opacity', 0.35 + 0.65 * k);
      }
    }
    slider.addEventListener('input', apply);
    apply();
    function frame(dt) {
      const P = +slider.value, k = P / 100;
      tm += dt; E += P * dt;
      if (tm >= CYC) { tm = 0; E = 0; }
      const spacing = Math.max(7, SPEED / (P / 10)); off = (off + SPEED * dt) % spacing;
      for (let i = 0; i < NDOT; i++) {
        const d = off + i * spacing, n = $('#mnrg-d' + i);
        if (d > WLEN) { n.setAttribute('opacity', 0); continue; }
        const q = pos(d); n.setAttribute('cx', q[0]); n.setAttribute('cy', q[1]); n.setAttribute('opacity', 1);
      }
      hp = (hp + dt * 0.8) % 1;
      [-16, 0, 16].forEach((dx, i) => {
        const ph = (hp + i / 3) % 1, n = $('#mnrg-h' + i);
        n.setAttribute('transform', `translate(${BXC + dx} ${BYC - 34 - ph * 22 * (0.5 + k)})`);
        n.setAttribute('opacity', (1 - ph) * (0.15 + 0.85 * k));
      });
      $('#mnrg-e').textContent = Math.round(E) + ' J';
      $('#mnrg-tm').textContent = `after ${r1(tm)} s`;
      $('#mnrg-eb').setAttribute('width', clamp(E / 1000, 0, 1) * 128);
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => slider.removeEventListener('input', apply);
  }
  steps.push({
    kind: 'example',
    title: 'Real life: Power of a light bulb',
    text: '<p><b>Power</b> is how fast energy is used: power = energy ÷ time. A 60 W bulb uses 60 J of electrical energy every second, and 600 J in 10 seconds. Most of it ends up as heat, so an efficient LED bulb wastes less.</p>',
    explain: '<p>Orange <b>dots</b>, each worth 10 J of electrical energy, flow along the wire into a <b>bulb</b>. Yellow rays show light and red wavy lines show heat. The <b>energy meter</b> box on the right counts joules for 10 seconds, then restarts. Drag the <b>Power</b> slider: more watts means more dots each second and a faster count.</p><p>Notice that the meter grows in step with the power.</p>',
    say: 'Look at the light bulb. Orange dots flow along the wire into it. Each dot stands for ten joules of electrical energy. Power tells you how many joules arrive every second, and we measure power in watts. At sixty watts, sixty joules arrive each second. The energy meter on the right counts the joules for ten seconds, and then it starts again. The yellow rays are light, and the red wavy lines are heat. Most of the energy in an old bulb becomes heat. Now try the power slider. More power means more dots each second, brighter light, and a meter that counts faster. An LED bulb needs far fewer watts for the same light.',
    mount: mnrgBulbMount
  });

  // ---------------------------------------------------------------------
  // 5. Solar panel: only about a fifth of the sunlight becomes electricity (slider: sunshine)
  // ---------------------------------------------------------------------
  function mnrgSolarMount(el, api) {
    const CX = 180, CY = 102, ANG = 19 * Math.PI / 180, DIR = [0.328, 0.945], BX = 8, BW = 384, EFF = 0.2, IMAX = 1000;
    const WPATH = [[180, 132], [300, 132], [300, 116]], WLEN = 120 + 16;
    const along = t => [CX + t * Math.cos(ANG), CY - t * Math.sin(ANG)];
    const TS = [-46, -23, 0, 23, 46];
    const beams = TS.map((t, i) => { const p = along(t), a = [p[0] - 78 * DIR[0], p[1] - 78 * DIR[1]];
      return `<line id="mnrg-bm${i}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${(p[0] - 5 * DIR[0]).toFixed(1)}" y2="${(p[1] - 5 * DIR[1]).toFixed(1)}" stroke="${YELLOW}" stroke-width="4" stroke-dasharray="9 7" stroke-linecap="round"/>`; }).join('');
    const sunRays = Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4;
      return `<line x1="${36 + Math.cos(a) * 22}" y1="${34 + Math.sin(a) * 22}" x2="${36 + Math.cos(a) * 30}" y2="${34 + Math.sin(a) * 30}" stroke="${YELLOW}" stroke-width="3" stroke-linecap="round"/>`; }).join('');
    const dots = Array.from({ length: 6 }, (_, i) => `<circle id="mnrg-sd${i}" r="3.6" fill="${ORANGE}" stroke="${INK}" stroke-width="1"/>`).join('');
    const svg = scene(el, '0 0 400 190', `
      <circle cx="36" cy="34" r="16" fill="${YELLOW}" stroke="${INK}" stroke-width="2.5"/>${sunRays}
      <g id="mnrg-beams">${beams}</g>
      <line x1="${CX}" y1="${CY + 6}" x2="${CX}" y2="132" stroke="${INK}" stroke-width="5"/>
      <g transform="translate(${CX} ${CY}) rotate(${-19})"><rect x="-58" y="-7" width="116" height="14" rx="2" fill="${BLUE}" stroke="${INK}" stroke-width="3"/>
        ${[-29, 0, 29].map(x => `<line x1="${x}" y1="-7" x2="${x}" y2="7" stroke="${SOFT}" stroke-width="2"/>`).join('')}</g>
      <path d="M${WPATH.map(p => p.join(',')).join(' L')}" fill="none" stroke="${MUTED}" stroke-width="5" stroke-linejoin="round"/>
      ${dots}
      <circle id="mnrg-lg" cx="300" cy="96" r="24" fill="${YELLOW}" opacity="0.2"/>
      <rect x="292" y="108" width="16" height="9" fill="${MUTED}" stroke="${INK}" stroke-width="2"/>
      <circle id="mnrg-lb" cx="300" cy="96" r="14" fill="${YELLOW}" stroke="${INK}" stroke-width="2.5"/>
      ${T(322, 100, 'Lamp', { size: 12, weight: 600, fill: MUTED, anchor: 'start' })}
      ${T(392, 16, '', { id: 'mnrg-o1', size: 14, anchor: 'end' })}
      ${T(392, 34, '', { id: 'mnrg-o2', size: 14, fill: GREEN, anchor: 'end' })}
      <line x1="120" y1="132" x2="240" y2="132" stroke="${INK}" stroke-width="3"/>
      ${T(8, 148, '', { id: 'mnrg-o3', size: 13, anchor: 'start' })}
      <rect x="${BX}" y="154" width="${BW}" height="14" rx="3" fill="none" stroke="${MUTED}" stroke-width="2" stroke-dasharray="4 3"/>
      <rect id="mnrg-be" x="${BX}" y="154" width="0" height="14" fill="${GREEN}"/><rect id="mnrg-bh" x="${BX}" y="154" width="0" height="14" fill="${RED}"/>
      ${T(8, 186, '', { id: 'mnrg-l1', size: 13, fill: GREEN, anchor: 'start' })}${T(392, 186, '', { id: 'mnrg-l2', size: 13, fill: RED, anchor: 'end' })}`,
      sliderRow('Sunshine', 'mnrg-sn', 20, 100, 10, 100, '100%'));
    const $ = s => svg.querySelector(s);
    const slider = el.querySelector('#mnrg-sn'), out = el.querySelector('#mnrg-sn-v');
    let off = 0, dOff = 0;
    function apply() {
      const sun = +slider.value / 100, I = IMAX * sun, Pe = Math.round(EFF * I), Ph = Math.round(I - Pe);
      out.textContent = slider.value + '%';
      $('#mnrg-o1').textContent = `Sunshine: ${slider.value}%`;
      $('#mnrg-o2').textContent = `Electricity: ${Pe} W`;
      $('#mnrg-o3').textContent = `Sunlight energy arriving: ${Math.round(I)} J every second on 1 m²`;
      $('#mnrg-be').setAttribute('width', BW * sun * EFF); $('#mnrg-bh').setAttribute('x', BX + BW * sun * EFF); $('#mnrg-bh').setAttribute('width', BW * sun * (1 - EFF));
      $('#mnrg-l1').textContent = `Electricity ${Pe} W`;
      $('#mnrg-l2').textContent = `Heat and reflection ${Ph} W`;
      $('#mnrg-beams').setAttribute('opacity', 0.3 + 0.7 * sun);
      $('#mnrg-lb').setAttribute('fill-opacity', 0.2 + 0.8 * sun); $('#mnrg-lg').setAttribute('opacity', 0.05 + 0.4 * sun);
    }
    slider.addEventListener('input', apply);
    apply();
    function wire(d) {
      if (d < 120) return [180 + d, 132];
      return [300, 132 - (d - 120)];
    }
    function frame(dt) {
      const sun = +slider.value / 100;
      off += 40 * dt;
      for (let i = 0; i < 5; i++) $('#mnrg-bm' + i).setAttribute('stroke-dashoffset', (-off).toFixed(1));
      dOff = (dOff + (16 + 60 * sun) * dt) % WLEN;
      for (let i = 0; i < 6; i++) {
        const q = wire((dOff + i * WLEN / 6) % WLEN), n = $('#mnrg-sd' + i);
        n.setAttribute('cx', q[0]); n.setAttribute('cy', q[1]);
      }
    }
    api.loop((t, dt) => frame(dt));
    frame(0);
    return () => slider.removeEventListener('input', apply);
  }
  steps.push({
    kind: 'example',
    title: 'Real life: A solar panel',
    text: '<p>A solar panel changes <b>light energy</b> into <b>electrical energy</b>. On a sunny day about 1000 J of sunlight hits each square metre every second, but a typical panel turns only about 20% of it into electricity. The rest becomes heat, so no energy is lost, just wasted.</p>',
    explain: '<p>Yellow dashed <b>sunbeams</b> travel from the sun onto a blue <b>solar panel</b>. Orange dots carry electricity along a wire to a <b>lamp</b>. The <b>bar</b> at the bottom splits the arriving sunlight into a small green part, <b>electricity</b>, and a big red part, <b>heat and reflection</b>. Drag the <b>Sunshine</b> slider to add clouds.</p><p>Notice that the split stays 20 to 80.</p>',
    say: 'Look at the solar panel. The yellow dashed lines are sunbeams landing on the blue panel. The panel changes light energy into electrical energy, and the orange dots carry it along the wire to the lamp. The bar at the bottom shows where the sunlight energy goes. On a bright day about one thousand joules arrive on every square meter each second. Only about twenty percent turns into electricity, the small green part. The big red part becomes heat, or bounces off. Nothing disappears, but most of it is not useful. Now drag the sunshine slider to make it cloudy. Less sunlight arrives, so less electricity is made and the lamp dims.',
    mount: mnrgSolarMount
  });

  addTutorialSteps('physics', 'energy', steps, [
    { term: 'Power', definition: 'How fast energy is transferred: energy ÷ time. Measured in watts (1 W = 1 joule per second).' },
    { term: 'Efficiency', definition: 'The fraction of the energy put in that ends up as useful energy out. The rest is usually wasted as heat.' }
  ]);
})();
