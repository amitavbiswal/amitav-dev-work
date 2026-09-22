(function () {
  // Chemistry tutorials (part a): Atoms & Elements ('atoms') and Molecules & Bonding ('molecules').
  // Registered via registerTutorial('chemistry', topicId, {...}). Nothing here leaks into global scope.

  const SVGNS = 'http://www.w3.org/2000/svg';
  const RED = '#dc2626';      // protons (matches quiz diagrams)
  const GREY = '#9ca3af';     // neutrons
  const ELEC = '#4f46e5';     // electrons
  const SYMBOLS = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
  const NAMES = ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon',
    'Sodium', 'Magnesium', 'Aluminum', 'Silicon', 'Phosphorus', 'Sulfur', 'Chlorine', 'Argon', 'Potassium', 'Calcium'];

  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // Gentle looping SMIL pulse (runs on its own and freezes with the Pause button).
  function pulse(node, attr, values, dur) {
    svgEl('animate', { attributeName: attr, values, dur: dur + 's', repeatCount: 'indefinite' }, node);
    return node;
  }
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = x => x * x * (3 - 2 * x);

  // Electrons per shell using capacities 2, 8, 8, 8 (fine for the first 20 elements).
  function shellCounts(e) {
    const out = [];
    let left = e;
    [2, 8, 8, 8].forEach(cap => { out.push(Math.max(0, Math.min(left, cap))); left -= cap; });
    return out;
  }

  // Draws shell rings + orbiting electrons inside `parent`. Returns a small controller.
  function createOrbit(parent, cx, cy, radii, er) {
    const ringG = svgEl('g', {}, parent);
    const rings = radii.map(r => svgEl('circle', { cx, cy, r, fill: 'none', stroke: '#c7d2fe', 'stroke-width': 1.5, opacity: 0 }, ringG));
    const eG = svgEl('g', {}, parent);
    const speeds = [1.5, 1.0, 0.7, 0.5];
    let es = [];
    let lastT = 0;

    function pos(e, t) {
      const a = e.s * 0.9 + (2 * Math.PI * e.k) / e.n + speeds[e.s] * t;
      return [cx + radii[e.s] * Math.cos(a), cy + radii[e.s] * Math.sin(a)];
    }
    function set(counts) {
      eG.innerHTML = '';
      es = [];
      rings.forEach((r, s) => r.setAttribute('opacity', counts[s] > 0 ? 1 : 0));
      counts.forEach((n, s) => {
        for (let k = 0; k < n; k++) {
          const c = svgEl('circle', { r: er, fill: ELEC }, eG);
          es.push({ c, s, k, n, arrive: null, leave: null, sx: 0, sy: 0, cb: null });
        }
      });
    }
    function outermost() {
      let best = null;
      es.forEach(e => { if (!best || e.s > best.s || (e.s === best.s && e.k > best.k)) best = e; });
      return best;
    }
    // Make the outermost electron fly away, then call cb.
    function eject(cb) {
      const e = outermost();
      if (!e) { cb(); return; }
      e.leave = lastT;
      e.cb = cb;
    }
    // Apply new counts; the outermost electron flies in from the corner.
    function admit(counts) {
      set(counts);
      const e = outermost();
      if (e) { e.arrive = lastT; e.sx = cx - 80; e.sy = cy - 92; }
    }
    function tick(t) {
      lastT = t;
      es.forEach(e => {
        let [x, y] = pos(e, t);
        let op = 1;
        if (e.arrive !== null) {
          const p = ease(clamp01((t - e.arrive) / 0.9));
          x = e.sx + (x - e.sx) * p;
          y = e.sy + (y - e.sy) * p;
          if (p >= 1) e.arrive = null;
        }
        if (e.leave !== null) {
          const p = ease(clamp01((t - e.leave) / 0.9));
          x += 150 * p;
          y -= 40 * p;
          op = 1 - p;
          if (p >= 1) { const cb = e.cb; e.leave = null; e.cb = null; if (cb) cb(); return; }
        }
        e.c.setAttribute('cx', x.toFixed(1));
        e.c.setAttribute('cy', y.toFixed(1));
        e.c.setAttribute('opacity', op.toFixed(2));
      });
    }
    return { set, tick, eject, admit };
  }

  // Interactive scenes: an svg that fills the space + one row of controls below it.
  function sceneShell(el, controlsHTML) {
    el.innerHTML = '';
    const svg = svgEl('svg', { viewBox: '0 10 400 210', preserveAspectRatio: 'xMidYMid meet', role: 'img' }, el);
    svg.style.cssText = 'width:100%;flex:1 1 auto;min-height:0;display:block;';
    const row = document.createElement('div');
    row.className = 'scene-slider-row';
    row.style.cssText = 'flex:0 0 auto;flex-wrap:wrap;justify-content:center;gap:6px;';
    row.innerHTML = controlsHTML;
    el.appendChild(row);
    return { svg, row };
  }

  function btn(id, label) {
    return `<button type="button" class="scene-btn" id="${id}" style="padding:4px 8px">${label}</button>`;
  }

  // ====================================================================
  // ATOMS & ELEMENTS
  // ====================================================================
  const atomsSteps = [];
  // ---- Step 1: zoom into an atom (SMIL)
  (function () {
    let nuc = '';
    for (let i = 0; i < 12; i++) {
      const a = i * 2.4, r = 7.5 * Math.sqrt(i + 0.5);
      const x = (130 + r * Math.cos(a)).toFixed(1), y = (120 + r * Math.sin(a)).toFixed(1);
      nuc += `<circle cx="${x}" cy="${y}" r="6.5" fill="${i % 2 ? GREY : RED}" stroke="#fff" stroke-width="1"/>`;
    }
    const shell = (r, n, dur, dir) => {
      let dots = '';
      for (let k = 0; k < n; k++) {
        const a = (2 * Math.PI * k) / n;
        dots += `<circle cx="${(130 + r * Math.cos(a)).toFixed(1)}" cy="${(120 + r * Math.sin(a)).toFixed(1)}" r="5.5" fill="${ELEC}"/>`;
      }
      return `<circle cx="130" cy="120" r="${r}" fill="none" stroke="#c7d2fe" stroke-width="1.5"/>
        <g>${dots}<animateTransform attributeName="transform" type="rotate" from="0 130 120" to="${dir * 360} 130 120" dur="${dur}s" repeatCount="indefinite"/></g>`;
    };
    atomsSteps.push({
      title: 'Zoom into an atom',
      text: '<p>Everything is made of tiny <b>atoms</b>. In the middle is the <b>nucleus</b>, packed with <b>protons</b> (positive) and <b>neutrons</b> (no charge). <b>Electrons</b> (negative) zip around it in shells.</p>',
      svg: TutorialKit.svg(`
        ${shell(50, 2, 3, 1)}
        ${shell(85, 4, 6, 1)}
        ${nuc}
        <text x="252" y="48" font-size="17" font-weight="700" fill="var(--t-ink)">Carbon atom</text>
        <circle cx="262" cy="86" r="7" fill="${RED}"/><text x="278" y="91" font-size="14" fill="var(--t-ink)">Proton (+)</text>
        <circle cx="262" cy="118" r="7" fill="${GREY}"/><text x="278" y="123" font-size="14" fill="var(--t-ink)">Neutron (0)</text>
        <circle cx="262" cy="150" r="6" fill="${ELEC}"/><text x="278" y="155" font-size="14" fill="var(--t-ink)">Electron (−)</text>
        <text x="252" y="190" font-size="13" fill="var(--t-muted)">Nucleus in the middle,</text>
        <text x="252" y="208" font-size="13" fill="var(--t-muted)">electrons in shells.</text>`)
    });
  })();
  // ---- Step 2: build an atom (interactive)
  atomsSteps.push({
    title: 'Build an atom',
    text: '<p>The number of protons is the <b>atomic number</b>, and it decides the element. Add or remove protons and watch the element change. A neutral atom has as many electrons as protons, filling shells 2, then 8, then 8.</p>',
    mount(el, api) {
      const { svg, row } = sceneShell(el,
        btn('atm-minus', '− Proton') +
        '<input type="range" id="atm-zslider" min="1" max="20" step="1" value="6" style="min-width:90px" aria-label="Number of protons">' +
        btn('atm-plus', '+ Proton'));
      const cx = 115, cy = 118;
      const orbit = createOrbit(svg, cx, cy, [30, 48, 66, 84], 4.5);
      pulse(svgEl('circle', { cx, cy, r: 18, fill: RED }, svg), 'r', '18;19.5;18', 1.6);
      const nucText = svgEl('text', { x: cx, y: cy + 5, 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: '#fff' }, svg);
      const nameT = svgEl('text', { x: 232, y: 40, 'font-size': 20, 'font-weight': 700, fill: 'var(--t-ink)' }, svg);
      const symT = svgEl('text', { x: 232, y: 100, 'font-size': 56, 'font-weight': 700, fill: 'var(--primary)' }, svg);
      const l1 = svgEl('text', { x: 232, y: 138, 'font-size': 14, fill: 'var(--t-ink)' }, svg);
      const l2 = svgEl('text', { x: 232, y: 162, 'font-size': 14, fill: 'var(--t-ink)' }, svg);
      const l3 = svgEl('text', { x: 232, y: 186, 'font-size': 14, fill: 'var(--t-ink)' }, svg);
      const l4 = svgEl('text', { x: 232, y: 210, 'font-size': 14, fill: 'var(--t-muted)' }, svg);
      const slider = row.querySelector('#atm-zslider');
      let z = 6;
      function update() {
        const counts = shellCounts(z);
        orbit.set(counts);
        nucText.textContent = z + 'p';
        nameT.textContent = NAMES[z - 1];
        symT.textContent = SYMBOLS[z - 1];
        l1.textContent = 'Atomic number = ' + z;
        l2.textContent = 'Protons: ' + z + '  (+' + z + ')';
        l3.textContent = 'Electrons: ' + z + '  (−' + z + ')';
        l4.textContent = 'Shells: ' + counts.filter(n => n > 0).join(', ') + '';
        slider.value = z;
      }
      const setZ = v => { z = Math.max(1, Math.min(20, v)); update(); };
      row.querySelector('#atm-minus').addEventListener('click', () => setZ(z - 1));
      row.querySelector('#atm-plus').addEventListener('click', () => setZ(z + 1));
      slider.addEventListener('input', () => setZ(parseInt(slider.value, 10)));
      update();
      api.loop(t => orbit.tick(t));
    }
  });
  // ---- Step 3: ions (interactive)
  atomsSteps.push({
    title: 'Ions: gaining and losing electrons',
    text: '<p>Protons never change in a reaction, but electrons can move. Lose an electron and the atom becomes a positive <b>ion</b> (cation). Gain one and it becomes a negative ion (anion). Try it!</p>',
    mount(el, api) {
      const elems = [11, 12, 8, 17];
      const { svg, row } = sceneShell(el,
        elems.map(n => btn('atm-el-' + n, SYMBOLS[n - 1])).join('') +
        btn('atm-lose', '− e⁻') + btn('atm-gain', '+ e⁻'));
      const cx = 115, cy = 118;
      const orbit = createOrbit(svg, cx, cy, [30, 48, 66, 84], 4.5);
      pulse(svgEl('circle', { cx, cy, r: 18, fill: RED }, svg), 'r', '18;19.5;18', 1.6);
      const nucText = svgEl('text', { x: cx, y: cy + 5, 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: '#fff' }, svg);
      const symT = svgEl('text', { x: 232, y: 70, 'font-size': 56, 'font-weight': 700, fill: 'var(--primary)' }, svg);
      const l1 = svgEl('text', { x: 232, y: 104, 'font-size': 14, fill: 'var(--t-ink)' }, svg);
      const l2 = svgEl('text', { x: 232, y: 128, 'font-size': 14, fill: 'var(--t-ink)' }, svg);
      const l3 = svgEl('text', { x: 232, y: 156, 'font-size': 16, 'font-weight': 700, fill: 'var(--t-ink)' }, svg);
      const l4 = svgEl('text', { x: 232, y: 182, 'font-size': 14, fill: 'var(--t-muted)' }, svg);
      const l5 = svgEl('text', { x: 232, y: 204, 'font-size': 14, fill: 'var(--t-muted)' }, svg);
      let z = 11, e = 11, busy = false;
      const sup = c => {
        const n = Math.abs(c), d = ['', '', '²', '³'][n] || '';
        return c > 0 ? d + '⁺' : c < 0 ? d + '⁻' : '';
      };
      function panel() {
        const c = z - e;
        nucText.textContent = z + 'p';
        symT.textContent = SYMBOLS[z - 1] + sup(c);
        l1.textContent = 'Protons: ' + z + '  (+' + z + ')';
        l2.textContent = 'Electrons: ' + e + '  (−' + e + ')';
        l3.textContent = 'Net charge: ' + (c > 0 ? '+' + c : c < 0 ? '−' + Math.abs(c) : '0');
        l4.textContent = c > 0 ? 'Lost electron(s): cation' : c < 0 ? 'Gained electron(s): anion' : 'Neutral atom';
        l5.textContent = [2, 10, 18].includes(e) ? 'Full outer shell: stable!' : '';
        row.querySelectorAll('button[id^="atm-el-"]').forEach(b => {
          b.style.borderColor = b.id === 'atm-el-' + z ? 'var(--primary)' : '';
          b.style.color = b.id === 'atm-el-' + z ? 'var(--primary)' : '';
        });
      }
      function pick(n) { if (busy) return; z = n; e = n; orbit.set(shellCounts(e)); panel(); }
      elems.forEach(n => row.querySelector('#atm-el-' + n).addEventListener('click', () => pick(n)));
      row.querySelector('#atm-lose').addEventListener('click', () => {
        if (busy || e <= Math.max(1, z - 2)) return;
        busy = true;
        orbit.eject(() => { e -= 1; orbit.set(shellCounts(e)); panel(); busy = false; });
      });
      row.querySelector('#atm-gain').addEventListener('click', () => {
        if (busy || e >= z + 2) return;
        e += 1;
        orbit.admit(shellCounts(e));
        panel();
      });
      orbit.set(shellCounts(e));
      panel();
      api.loop(t => orbit.tick(t));
    }
  });
  // ---- Step 4: isotopes (interactive)
  atomsSteps.push({
    title: 'Isotopes and mass number',
    text: '<p>Atoms of one element always have the same protons, but the neutrons can differ. These are <b>isotopes</b>. <b>Mass number</b> = protons + neutrons. Slide the neutrons and watch carbon change.</p>',
    mount(el, api) {
      const { svg, row } = sceneShell(el,
        '<span>Neutrons</span><input type="range" id="atm-nslider" min="6" max="8" step="1" value="6" aria-label="Number of neutrons"><span id="atm-nval" style="min-width:1.2em">6</span>');
      const cx = 115, cy = 118;
      const orbit = createOrbit(svg, cx, cy, [50, 82], 5);
      orbit.set([2, 4]);
      pulse(svgEl('circle', { cx, cy, r: 34, fill: 'rgba(220,38,38,0.08)' }, svg), 'r', '32;37;32', 1.8);
      const partG = svgEl('g', {}, svg);
      const sup = { 12: '¹²', 13: '¹³', 14: '¹⁴' };
      const nameT = svgEl('text', { x: 232, y: 42, 'font-size': 20, 'font-weight': 700, fill: 'var(--t-ink)' }, svg);
      const symT = svgEl('text', { x: 232, y: 100, 'font-size': 52, 'font-weight': 700, fill: 'var(--primary)' }, svg);
      const l1 = svgEl('text', { x: 232, y: 136, 'font-size': 14, fill: 'var(--t-ink)' }, svg);
      const l2 = svgEl('text', { x: 232, y: 160, 'font-size': 14, fill: 'var(--t-ink)' }, svg);
      const l3 = svgEl('text', { x: 232, y: 188, 'font-size': 16, 'font-weight': 700, fill: 'var(--t-ink)' }, svg);
      const l4 = svgEl('text', { x: 232, y: 212, 'font-size': 13, fill: 'var(--t-muted)' }, svg);
      const slider = row.querySelector('#atm-nslider');
      const nval = row.querySelector('#atm-nval');
      let parts = [];
      let n = 6;
      function build() {
        partG.innerHTML = '';
        parts = [];
        const total = 6 + n;
        for (let i = 0; i < total; i++) {
          const proton = i < 12 ? i % 2 === 0 : false;
          const a = i * 2.4, r = 7.5 * Math.sqrt(i + 0.5);
          const c = svgEl('circle', { r: 6.5, fill: proton ? RED : GREY, stroke: '#fff', 'stroke-width': 1 }, partG);
          parts.push({ c, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), i });
        }
      }
      function update() {
        n = parseInt(slider.value, 10);
        nval.textContent = n;
        const mass = 6 + n;
        build();
        nameT.textContent = 'Carbon-' + mass;
        symT.textContent = sup[mass] + 'C';
        l1.textContent = 'Protons: 6 (always!)';
        l2.textContent = 'Neutrons: ' + n;
        l3.textContent = 'Mass number = ' + mass;
        l4.textContent = '= 6 protons + ' + n + ' neutrons';
      }
      slider.addEventListener('input', update);
      update();
      api.loop(t => {
        orbit.tick(t);
        parts.forEach(p => {
          p.c.setAttribute('cx', (p.x + 1.6 * Math.sin(t * 4 + p.i * 1.7)).toFixed(1));
          p.c.setAttribute('cy', (p.y + 1.6 * Math.cos(t * 3.4 + p.i * 2.3)).toFixed(1));
        });
      });
    }
  });
  // ---- Step 5: the periodic table (counting up protons)
  atomsSteps.push({
    title: 'Elements make up everything',
    text: '<p>Each <b>element</b> is one kind of atom, and the periodic table lists them by atomic number. About 100 kinds of atoms build everything, including you: mostly hydrogen, oxygen, carbon and nitrogen (outlined).</p>',
    mount(el, api) {
      el.innerHTML = '';
      const svg = svgEl('svg', { viewBox: '0 0 400 240', preserveAspectRatio: 'xMidYMid meet', role: 'img' }, el);
      const cells = [];
      const bodyZ = [1, 6, 7, 8];
      SYMBOLS.forEach((s, i) => {
        const z = i + 1;
        let row, col;
        if (z === 1) { row = 0; col = 0; }
        else if (z === 2) { row = 0; col = 7; }
        else if (z <= 10) { row = 1; col = z - 3; }
        else if (z <= 18) { row = 2; col = z - 11; }
        else { row = 3; col = z - 19; }
        const x = 24 + col * 42 + (col >= 2 ? 16 : 0), y = 14 + row * 36;
        const g = svgEl('g', {}, svg);
        const rect = svgEl('rect', { x, y, width: 40, height: 32, rx: 6, fill: '#fff', stroke: bodyZ.includes(z) ? '#ea580c' : '#c7d2fe', 'stroke-width': bodyZ.includes(z) ? 3 : 1.5 }, g);
        const txt = svgEl('text', { x: x + 20, y: y + 21, 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: 'var(--t-ink)' }, g);
        txt.textContent = s;
        if (bodyZ.includes(z)) pulse(rect, 'stroke-opacity', '1;0.45;1', 1.8);
        cells.push({ rect, txt });
      });
      const cap1 = svgEl('text', { x: 200, y: 196, 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: 'var(--primary)' }, svg);
      const cap2 = svgEl('text', { x: 200, y: 220, 'font-size': 14, 'text-anchor': 'middle', fill: 'var(--t-muted)' }, svg);
      let shown = -1;
      api.loop(t => {
        const cur = Math.min(20, Math.floor((t % 13) / 0.55) + 1);
        if (cur === shown) return;
        shown = cur;
        cells.forEach((c, i) => {
          const z = i + 1;
          c.rect.setAttribute('fill', z === cur ? 'var(--primary)' : z < cur ? '#e0e7ff' : '#fff');
          c.txt.setAttribute('fill', z === cur ? '#fff' : 'var(--t-ink)');
        });
        cap1.textContent = 'Atomic number ' + cur + ' = ' + NAMES[cur - 1];
        cap2.textContent = 'Every ' + NAMES[cur - 1].toLowerCase() + ' atom has exactly ' + cur + ' proton' + (cur > 1 ? 's' : '');
      });
    }
  });
  // @@ATOMS-STEPS-END

  registerTutorial('chemistry', 'atoms', {
    title: 'Atoms & Elements',
    keyTerms: [
      { term: 'Proton', definition: 'A positively charged particle in the nucleus.' },
      { term: 'Neutron', definition: 'A particle with no charge in the nucleus.' },
      { term: 'Electron', definition: 'A tiny negatively charged particle that moves around the nucleus in shells.' },
      { term: 'Atomic number', definition: 'The number of protons in an atom. It decides which element it is.' },
      { term: 'Ion', definition: 'An atom that has gained or lost electrons, so it has an electric charge.' },
      { term: 'Isotopes', definition: 'Atoms of the same element with different numbers of neutrons.' }
    ],
    steps: atomsSteps
  });

  // ====================================================================
  // MOLECULES & BONDING
  // ====================================================================
  const moleculesSteps = [];
  // ---- Step 1: atoms share electrons (H + H -> H2)
  moleculesSteps.push({
    title: 'Atoms join up by sharing',
    text: '<p>Atoms often team up. Each hydrogen atom has 1 electron but is happiest with 2. So two H atoms <b>share</b> a pair of electrons. That sharing is a <b>covalent bond</b>, and the joined atoms form a <b>molecule</b>.</p>',
    mount(el, api) {
      el.innerHTML = '';
      const svg = svgEl('svg', { viewBox: '0 0 400 240', preserveAspectRatio: 'xMidYMid meet', role: 'img' }, el);
      const cy = 118, R = 48;
      const ringA = svgEl('circle', { cy, r: R, fill: 'rgba(79,70,229,0.06)', stroke: '#a5b4fc', 'stroke-width': 1.5 }, svg);
      const ringB = svgEl('circle', { cy, r: R, fill: 'rgba(79,70,229,0.06)', stroke: '#a5b4fc', 'stroke-width': 1.5 }, svg);
      const nA = pulse(svgEl('circle', { cy, r: 10, fill: RED }, svg), 'r', '10;11.5;10', 1.6);
      const nB = pulse(svgEl('circle', { cy, r: 10, fill: RED }, svg), 'r', '10;11.5;10', 1.6);
      const eA = svgEl('circle', { r: 6.5, fill: ELEC }, svg);
      const eB = svgEl('circle', { r: 6.5, fill: ELEC }, svg);
      const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, 'text-anchor': 'middle', fill }, svg);
      const lblA = T(0, 50, 18, 700, 'var(--t-ink)'); lblA.textContent = 'H';
      const lblB = T(0, 50, 18, 700, 'var(--t-ink)'); lblB.textContent = 'H';
      const lblM = T(200, 50, 20, 700, 'var(--primary)'); lblM.textContent = 'H₂ molecule';
      const capA = T(200, 216, 15, 700, 'var(--t-muted)'); capA.textContent = 'Each H atom has 1 electron and wants 2.';
      const capB = T(200, 216, 15, 700, 'var(--primary)'); capB.textContent = 'Shared pair = covalent bond';
      api.loop(t => {
        const c = t % 10;
        const p = c < 3 ? ease(c / 3) : c < 7 ? 1 : 1 - ease(clamp01((c - 7) / 2.5));
        const blend = ease(clamp01((c - 2.6) / 0.8)) * (1 - ease(clamp01((c - 7) / 0.6)));
        const xa = 100 + 75 * p, xb = 300 - 75 * p;
        [[ringA, nA, lblA, xa], [ringB, nB, lblB, xb]].forEach(([r, n, l, x]) => {
          r.setAttribute('cx', x); n.setAttribute('cx', x); l.setAttribute('x', x); l.setAttribute('opacity', 1 - blend);
        });
        const mid = (xa + xb) / 2;
        [[eA, xa, 0], [eB, xb, Math.PI]].forEach(([e, x, ph]) => {
          const a = 2.2 * t + ph + 1;
          const ox = x + R * Math.cos(a), oy = cy + R * Math.sin(a);
          const sa = 3 * t + ph;
          const sx = mid + (Math.abs(xb - xa) / 2 + 30) * Math.cos(sa), sy = cy + 38 * Math.sin(sa);
          e.setAttribute('cx', (ox + (sx - ox) * blend).toFixed(1));
          e.setAttribute('cy', (oy + (sy - oy) * blend).toFixed(1));
        });
        lblM.setAttribute('opacity', blend);
        capA.setAttribute('opacity', 1 - blend);
        capB.setAttribute('opacity', blend);
      });
    }
  });
  // ---- Step 2: water is bent (SMIL)
  (function () {
    const hAtom = (x, y, dir) => `<g>
        <line x1="140" y1="80" x2="${x}" y2="${y}" stroke="#9ca3af" stroke-width="9" stroke-linecap="round"/>
        <circle cx="${x}" cy="${y}" r="18" fill="var(--primary)"/>
        <text x="${x}" y="${y + 5}" font-size="15" font-weight="700" text-anchor="middle" fill="#fff">H</text>
        <animateTransform attributeName="transform" type="rotate" values="${-4 * dir} 140 80;${4 * dir} 140 80;${-4 * dir} 140 80" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" keyTimes="0;.5;1"/>
      </g>`;
    moleculesSteps.push({
      title: 'Water is bent',
      text: '<p>In water, an oxygen atom shares electrons with two hydrogen atoms. The <b>chemical formula</b> H<sub>2</sub>O says it: the small 2 means 2 hydrogens, and no number means 1 oxygen. The molecule is <b>bent</b>, not straight.</p>',
      svg: TutorialKit.svg(`
        ${hAtom(77, 129, 1)}
        ${hAtom(203, 129, -1)}
        <circle cx="140" cy="80" r="27" fill="${RED}"/>
        <text x="140" y="86" font-size="18" font-weight="700" text-anchor="middle" fill="#fff">O</text>
        <path d="M106.8 105.7 A42 42 0 0 0 173.2 105.7" fill="none" stroke="var(--t-orange)" stroke-width="2.5" stroke-dasharray="5 4"/>
        <text x="140" y="160" font-size="14" font-weight="700" text-anchor="middle" fill="var(--t-orange)">104.5°</text>
        <text x="262" y="82" font-size="42" font-weight="700" fill="var(--primary)">H₂O</text>
        <text x="262" y="116" font-size="14" fill="var(--t-ink)">2 hydrogen atoms</text>
        <text x="262" y="138" font-size="14" fill="var(--t-ink)">1 oxygen atom</text>
        <text x="262" y="170" font-size="14" font-weight="700" fill="var(--t-orange)">Bent: about 104.5°</text>
        <text x="200" y="222" font-size="13" text-anchor="middle" fill="var(--t-muted)">Ball-and-stick model: balls are atoms, sticks are bonds</text>`)
    });
  })();
  // ---- Step 3: ionic bond, Na gives an electron to Cl (interactive)
  moleculesSteps.push({
    title: 'Ionic bonds: giving an electron',
    text: '<p>Sometimes electrons are <b>transferred</b>, not shared. A metal like sodium gives an electron to a nonmetal like chlorine. Sodium becomes Na<sup>+</sup>, chlorine becomes Cl<sup>−</sup>, and the opposite charges attract: an <b>ionic bond</b>.</p>',
    mount(el, api) {
      const { svg, row } = sceneShell(el, btn('mol-transfer', 'Transfer electron') + btn('mol-reset', 'Reset'));
      const cy = 112, radii = [18, 38, 58], speeds = [1.5, 1.0, 0.7];
      const mkAtom = (shellsN, outerN) => {
        const rings = radii.map(r => svgEl('circle', { cy, r, fill: 'none', stroke: '#c7d2fe', 'stroke-width': 1.5 }, svg));
        const nuc = pulse(svgEl('circle', { cy, r: 11, fill: RED }, svg), 'r', '11;12.5;11', 1.6);
        const dots = [];
        shellsN.forEach((n, s) => {
          const total = s === 2 ? outerN : n;
          for (let k = 0; k < n; k++) {
            dots.push({ s, k, n: total, c: svgEl('circle', { r: 4, fill: ELEC }, svg) });
          }
        });
        return { rings, nuc, dots };
      };
      const na = mkAtom([2, 8, 1], 1);
      const cl = mkAtom([2, 8, 7], 8);   // outer shell has 8 slots; slot 0 is left open for the incoming electron
      cl.dots.forEach(d => { if (d.s === 2) d.k += 1; });
      const mover = na.dots[na.dots.length - 1];
      mover.c.setAttribute('fill', 'var(--t-orange)');
      mover.c.setAttribute('r', 5.5);
      const label = (size, weight, fill) => svgEl('text', { 'font-size': size, 'font-weight': weight, 'text-anchor': 'middle', fill }, svg);
      const cap = label(15, 700, 'var(--t-ink)'); cap.setAttribute('x', 200); cap.setAttribute('y', 30);
      const nameNa = label(20, 700, 'var(--primary)'); nameNa.setAttribute('y', 192);
      const nameCl = label(20, 700, 'var(--primary)'); nameCl.setAttribute('y', 192);
      const infoNa = label(13, 400, 'var(--t-muted)'); infoNa.setAttribute('y', 212);
      const infoCl = label(13, 400, 'var(--t-muted)'); infoCl.setAttribute('y', 212);
      const attract = svgEl('g', { opacity: 0 }, svg);
      svgEl('line', { x1: 180, y1: 112, x2: 194, y2: 112, stroke: 'var(--t-green)', 'stroke-width': 3 }, attract);
      svgEl('line', { x1: 220, y1: 112, x2: 206, y2: 112, stroke: 'var(--t-green)', 'stroke-width': 3 }, attract);
      const aTxt = svgEl('text', { x: 200, y: 100, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: 'var(--t-green)' }, attract);
      aTxt.textContent = 'attract';
      let mode = 'idle', t0 = 0, lastT = 0;
      row.querySelector('#mol-transfer').addEventListener('click', () => { if (mode === 'idle') { mode = 'go'; t0 = lastT; } });
      row.querySelector('#mol-reset').addEventListener('click', () => { mode = 'idle'; });
      const pos = (d, x, t) => {
        const a = d.s * 0.9 + (2 * Math.PI * d.k) / d.n + speeds[d.s] * t;
        return [x + radii[d.s] * Math.cos(a), cy + radii[d.s] * Math.sin(a)];
      };
      api.loop(t => {
        lastT = t;
        const q = mode === 'idle' ? 0 : ease(clamp01((t - t0) / 1.6));
        const dd = mode === 'idle' ? 0 : ease(clamp01((t - t0 - 1.6) / 1.2));
        const xN = 80 + 30 * dd, xC = 320 - 30 * dd;
        [[na, xN], [cl, xC]].forEach(([a, x]) => {
          a.rings.forEach(r => r.setAttribute('cx', x));
          a.nuc.setAttribute('cx', x);
          a.dots.forEach(d => {
            let [px, py] = pos(d, x, t);
            if (d === mover) {
              const [tx, ty] = pos({ s: 2, k: 0, n: 8 }, xC, t);
              px += (tx - px) * q; py += (ty - py) * q;
            }
            d.c.setAttribute('cx', px.toFixed(1)); d.c.setAttribute('cy', py.toFixed(1));
          });
        });
        const done = q >= 1;
        na.rings[2].setAttribute('opacity', done ? 0 : 1);   // Na+ has lost its whole outer shell
        nameNa.setAttribute('x', xN); nameCl.setAttribute('x', xC);
        infoNa.setAttribute('x', xN); infoCl.setAttribute('x', xC);
        nameNa.textContent = done ? 'Na⁺' : 'Na';
        nameCl.textContent = done ? 'Cl⁻' : 'Cl';
        infoNa.textContent = done ? '11 p, 10 e⁻: charge +1' : '11 p, 11 e⁻ (neutral)';
        infoCl.textContent = done ? '17 p, 18 e⁻: charge −1' : '17 p, 17 e⁻ (neutral)';
        cap.textContent = mode === 'idle' ? 'Na has 1 outer electron. Cl has 7 and needs 8.'
          : !done ? 'Na transfers its outer electron to Cl...'
            : 'Na⁺ and Cl⁻ attract: an ionic bond!';
        attract.setAttribute('opacity', dd);
      });
    }
  });
  // ---- Step 4: counting atoms in formulas (interactive)
  moleculesSteps.push({
    title: 'Reading a chemical formula',
    text: '<p>A formula tells you which atoms are in a molecule. The small number after a symbol counts that atom. If there is no number, it means 1. So CO<sub>2</sub> has 1 carbon and 2 oxygen atoms. Pick a molecule!</p>',
    mount(el, api) {
      const list = [
        { id: 'h2o', f: 'H₂O', rows: [['H', 2], ['O', 1]] },
        { id: 'co2', f: 'CO₂', rows: [['C', 1], ['O', 2]] },
        { id: 'ch4', f: 'CH₄', rows: [['C', 1], ['H', 4]] },
        { id: 'glu', f: 'C₆H₁₂O₆', rows: [['C', 6], ['H', 12], ['O', 6]] }
      ];
      const colors = { H: '#4f46e5', O: '#dc2626', C: '#374151' };
      const { svg, row } = sceneShell(el, list.map(m => btn('mol-f-' + m.id, m.f)).join(''));
      const g = svgEl('g', {}, svg);
      let balls = [], counts = [], totalT = null, totalN = 0, start = 0, lastT = 0, current = null;
      const formulaT = pulse(svgEl('text', { x: 200, y: 54, 'font-size': 34, 'font-weight': 700, 'text-anchor': 'middle', fill: 'var(--primary)' }, svg), 'opacity', '1;0.75;1', 2.4);
      const hint = svgEl('text', { x: 200, y: 76, 'font-size': 13, 'text-anchor': 'middle', fill: 'var(--t-muted)' }, svg);
      hint.textContent = 'The small number counts the atom before it';
      totalT = svgEl('text', { x: 200, y: 205, 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: 'var(--t-ink)' }, svg);
      function choose(m) {
        current = m;
        g.innerHTML = '';
        balls = [];
        counts = [];
        totalN = 0;
        start = lastT;
        formulaT.textContent = m.f;
        m.rows.forEach(([sym, n], r) => {
          const y = 104 + r * 34;
          const lab = svgEl('text', { x: 30, y: y + 6, 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: colors[sym] }, g);
          lab.textContent = sym;
          const cnt = svgEl('text', { x: 388, y: y + 6, 'font-size': 18, 'font-weight': 700, 'text-anchor': 'end', fill: 'var(--t-ink)' }, g);
          counts.push({ cnt, row: r, n });
          for (let k = 0; k < n; k++) {
            const x = 62 + k * 24;
            balls.push({ c: svgEl('circle', { cx: x, cy: y, r: 0, fill: colors[sym] }, g), row: r, i: balls.length });
          }
          totalN += n;
        });
        row.querySelectorAll('button').forEach(b => {
          const on = b.id === 'mol-f-' + m.id;
          b.style.borderColor = on ? 'var(--primary)' : '';
          b.style.color = on ? 'var(--primary)' : '';
        });
      }
      list.forEach(m => row.querySelector('#mol-f-' + m.id).addEventListener('click', () => choose(m)));
      choose(list[0]);
      api.loop(t => {
        lastT = t;
        const shown = counts.map(() => 0);
        balls.forEach(b => {
          const p = ease(clamp01((t - start - 0.3 - b.i * 0.16) / 0.3));
          b.c.setAttribute('r', (10 * p).toFixed(2));
          if (p >= 1) shown[b.row]++;
        });
        counts.forEach((c, i) => { c.cnt.textContent = shown[i] ? '= ' + shown[i] : ''; });
        const sum = shown.reduce((a, b) => a + b, 0);
        totalT.textContent = sum ? 'Total: ' + sum + ' atoms' + (sum === totalN ? ' in one molecule' : '') : '';
      });
    }
  });
  // ---- Step 5: rotating ball-and-stick models (interactive)
  moleculesSteps.push({
    title: 'Molecules have shapes',
    text: '<p>Molecules are 3D. Water is bent, CO<sub>2</sub> is straight (linear) with double bonds, and methane (CH<sub>4</sub>) is a tetrahedron. Water\'s bend helps it dissolve many substances. Pick a molecule to spin.</p>',
    mount(el, api) {
      const L = 40;
      const models = [
        { id: 'h2o', f: 'H₂O', name: 'Water', shape: 'Bent: 104.5°', bonds: '2 single bonds',
          atoms: [['O', 0, -22, 0], ['H', -55, 22, 0], ['H', 55, 22, 0]], links: [[0, 1, 1], [0, 2, 1]] },
        { id: 'co2', f: 'CO₂', name: 'Carbon dioxide', shape: 'Linear: 180°', bonds: '2 double bonds',
          atoms: [['C', 0, 0, 0], ['O', -78, 0, 0], ['O', 78, 0, 0]], links: [[0, 1, 2], [0, 2, 2]] },
        { id: 'ch4', f: 'CH₄', name: 'Methane', shape: 'Tetrahedral: 109.5°', bonds: '4 single bonds',
          atoms: [['C', 0, 0, 0], ['H', L, L, L], ['H', L, -L, -L], ['H', -L, L, -L], ['H', -L, -L, L]], links: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
        { id: 'o2', f: 'O₂', name: 'Oxygen gas', shape: 'Two O atoms', bonds: '1 double bond',
          atoms: [['O', -34, 0, 0], ['O', 34, 0, 0]], links: [[0, 1, 2]] }
      ];
      const colors = { H: '#4f46e5', O: '#dc2626', C: '#374151' };
      const radius = { H: 13, O: 19, C: 18 };
      const { svg, row } = sceneShell(el, models.map(m => btn('mol-m-' + m.id, m.f)).join(''));
      const g = svgEl('g', {}, svg);
      const T = (x, y, size, weight, fill) => svgEl('text', { x, y, 'font-size': size, 'font-weight': weight, fill }, svg);
      const fT = pulse(T(258, 70, 38, 700, 'var(--primary)'), 'opacity', '1;0.75;1', 2.4);
      const nT = T(258, 98, 15, 700, 'var(--t-ink)');
      const sT = T(258, 130, 13, 700, 'var(--t-orange)');
      const bT = T(258, 152, 13, 400, 'var(--t-muted)');
      let cur = models[0];
      function choose(m) {
        cur = m;
        fT.textContent = m.f; nT.textContent = m.name; sT.textContent = m.shape; bT.textContent = m.bonds;
        row.querySelectorAll('button').forEach(b => {
          const on = b.id === 'mol-m-' + m.id;
          b.style.borderColor = on ? 'var(--primary)' : '';
          b.style.color = on ? 'var(--primary)' : '';
        });
      }
      models.forEach(m => row.querySelector('#mol-m-' + m.id).addEventListener('click', () => choose(m)));
      choose(cur);
      const cx = 122, cy = 116, sc = 1.25, tilt = 0.4;
      api.loop(t => {
        const th = t * 0.8;
        const ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(tilt), sp = Math.sin(tilt);
        const P = cur.atoms.map(([s, x, y, z]) => {
          const x1 = x * ct + z * st, z1 = -x * st + z * ct;
          const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
          const k = 420 / (420 - z2);
          return { s, x: cx + x1 * sc * k, y: cy + y2 * sc * k, z: z2, k };
        });
        const items = [];
        cur.links.forEach(([a, b, order]) => {
          const A = P[a], B = P[b];
          const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
          [[A, mx, my], [B, mx, my]].forEach(([S, ex, ey]) => {
            const dx = ex - S.x, dy = ey - S.y, len = Math.hypot(dx, dy) || 1;
            const ox = -dy / len, oy = dx / len;
            const offs = order === 2 ? [-4.5, 4.5] : [0];
            const w = (order === 2 ? 3.6 : 7) * S.k;
            const svgLines = offs.map(o => `<line x1="${(S.x + ox * o * S.k).toFixed(1)}" y1="${(S.y + oy * o * S.k).toFixed(1)}" x2="${(ex + ox * o * S.k).toFixed(1)}" y2="${(ey + oy * o * S.k).toFixed(1)}" stroke="#9ca3af" stroke-width="${w.toFixed(1)}" stroke-linecap="round"/>`).join('');
            items.push({ z: (S.z + (A.z + B.z) / 2) / 2, html: svgLines });
          });
        });
        P.forEach(p => {
          const r = radius[p.s] * sc * p.k;
          items.push({ z: p.z, html: `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="${colors[p.s]}" stroke="#fff" stroke-width="1.5"/><text x="${p.x.toFixed(1)}" y="${(p.y + 5).toFixed(1)}" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">${p.s}</text>` });
        });
        items.sort((a, b) => a.z - b.z);
        g.innerHTML = items.map(i => i.html).join('');
      });
    }
  });
  // @@MOLECULES-STEPS-END

  registerTutorial('chemistry', 'molecules', {
    title: 'Molecules & Bonding',
    keyTerms: [
      { term: 'Molecule', definition: 'Two or more atoms joined together by chemical bonds.' },
      { term: 'Covalent bond', definition: 'A bond formed when atoms share electrons.' },
      { term: 'Ionic bond', definition: 'A bond formed when one atom transfers electrons to another and the oppositely charged ions attract.' },
      { term: 'Ion', definition: 'An atom that has gained or lost electrons and carries a charge.' },
      { term: 'Chemical formula', definition: 'Shows which atoms are in a substance. Small numbers count the atoms, like H₂O.' },
      { term: 'Double bond', definition: 'Two pairs of shared electrons between two atoms, like in O₂.' }
    ],
    steps: moleculesSteps
  });
})();
