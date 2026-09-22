(function () {
  'use strict';
  // more-chem-periodic: five extra real-life example steps for chemistry / Periodic Table.
  // FLAT (2D) SVG only. Ids are namespaced 'mfpe-'.

  const steps = [];
  const MINUS = '−';

  // Build a scene: an svg (flex-filling, like the existing examples) plus an optional compact control row.
  function shell(el, vb, inner, controls) {
    el.innerHTML =
      '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" style="flex:1 1 0;min-height:0;height:auto;width:100%">' + inner + '</svg>' +
      (controls ? '<div class="scene-slider-row" style="justify-content:center;flex-wrap:wrap;padding-top:0;gap:4px 5px">' + controls.replace(/class="scene-btn"/g, 'class="scene-btn" style="padding:3px 8px;font-size:0.78rem"') + '</div>' : '');
    return id => el.querySelector('#mfpe-' + id);
  }
  // Electron: indigo with a white minus sign.
  function electron(id, r) {
    return '<g id="' + id + '"><circle r="' + r + '" fill="#4f46e5" stroke="#c7d2fe" stroke-width="1.2"/>' +
      '<text y="' + (r * 0.42).toFixed(1) + '" text-anchor="middle" font-size="' + Math.round(r * 1.6) + '" font-weight="800" fill="#fff">' + MINUS + '</text></g>';
  }
  function markButtons(el, attr, val) {
    el.querySelectorAll('button[data-' + attr + ']').forEach(b => {
      const on = b.dataset[attr] === String(val);
      b.style.borderColor = on ? 'var(--primary)' : '';
      b.style.color = on ? 'var(--primary)' : '';
    });
  }

  // ---- Example 1: flame test colors (interactive: pick a metal)
  steps.push({
    kind: 'example',
    title: 'Real life: Flame test colors',
    text: '<p>Put a pinch of a metal salt in a flame and it glows its own color. Heat lifts an electron up an energy level, and when it drops back it gives out light. Every element has its own jump, so its own color.</p>',
    explain: '<p>On the left a <b>Bunsen burner</b> flame flickers around a salt on a wire loop. On the right an <b>electron</b> (indigo, marked with a minus sign) is lifted up between two energy lines by heat, then drops back and sends out a wavy <b>light beam</b>. Pick a metal: the flame, beam and size of the jump change.</p>',
    say: 'Fireworks and lab flame tests use the same trick. On the left, a Bunsen burner flame flickers around a pinch of salt on a wire loop. On the right, you can see what happens inside one atom. Heat lifts an electron up to a higher energy level. Then it falls back down and gives out a beam of light. Each element has its own size of jump, so each gives its own color. Now press the buttons. Lithium glows red. Sodium glows yellow orange. Potassium glows lilac. Copper glows blue green. Notice that three of these are in group one, yet each has a different color. Scientists use flame colors to identify elements.',
    mount: function (el, api) {
      const METALS = [
        { id: 'li', label: 'Lithium', name: 'Lithium (Li)', grp: 'Group 1 metal', col: '#ef4444', cname: 'Crimson red flame', gap: 42, jump: 'small' },
        { id: 'na', label: 'Sodium', name: 'Sodium (Na)', grp: 'Group 1 metal', col: '#f59e0b', cname: 'Yellow-orange flame', gap: 62, jump: 'medium' },
        { id: 'k', label: 'Potassium', name: 'Potassium (K)', grp: 'Group 1 metal', col: '#c084fc', cname: 'Lilac flame', gap: 98, jump: 'biggest' },
        { id: 'cu', label: 'Copper', name: 'Copper (Cu)', grp: 'transition metal', col: '#14b8a6', cname: 'Blue-green flame', gap: 80, jump: 'big' }
      ];
      let sparks = '';
      for (let i = 0; i < 7; i++) sparks += '<circle id="mfpe-sp' + i + '" r="2.6" fill="#fff" opacity="0"/>';
      const $ = shell(el, '0 0 400 190',
        // burner
        '<rect x="82" y="176" width="36" height="9" rx="3" fill="var(--t-muted)"/>' +
        '<rect x="92" y="132" width="16" height="46" fill="var(--t-muted)"/>' +
        '<rect x="88" y="128" width="24" height="7" rx="2" fill="var(--t-ink)"/>' +
        '<g id="mfpe-flame" transform="translate(100,128) scale(0.78)">' +
        '<path id="mfpe-glow" d="M-24,0 C-36,-38 -10,-58 0,-96 C10,-58 36,-38 24,0 Z" fill="#f59e0b" opacity="0.28"/>' +
        '<path id="mfpe-outer" d="M-19,0 C-29,-33 -8,-50 0,-84 C8,-50 29,-33 19,0 Z" fill="#f59e0b" opacity="0.92"/>' +
        '<path d="M-9,0 C-13,-14 -3,-22 0,-34 C3,-22 13,-14 9,0 Z" fill="#93c5fd"/>' +
        sparks + '</g>' +
        // wire loop with the salt
        '<path d="M58,76 L92,86" stroke="var(--t-ink)" stroke-width="2.5" fill="none"/>' +
        '<circle cx="100" cy="88" r="8" fill="none" stroke="var(--t-ink)" stroke-width="2.5"/>' +
        '<circle cx="100" cy="88" r="4.5" fill="#f8fafc" stroke="var(--t-muted)" stroke-width="1"/>' +
        '<text x="12" y="70" font-size="13" fill="var(--t-muted)">salt on wire</text>' +
        // titles
        '<text id="mfpe-t1" x="14" y="17" font-size="15" font-weight="800" fill="var(--t-ink)"> </text>' +
        '<circle id="mfpe-sw" cx="21" cy="32" r="6" fill="#f59e0b"/>' +
        '<text id="mfpe-t2" x="34" y="37" font-size="14" font-weight="700" fill="var(--t-ink)"> </text>' +
        // energy levels
        '<line x1="232" y1="150" x2="372" y2="150" stroke="var(--t-ink)" stroke-width="3"/>' +
        '<line id="mfpe-up" x1="232" y1="90" x2="372" y2="90" stroke="var(--t-ink)" stroke-width="3"/>' +
        '<defs>' + TutorialKit.arrowMarker('mfpe-arr', '#f97316') + '</defs>' +
        '<line id="mfpe-dash" x1="226" y1="150" x2="226" y2="90" stroke="#f97316" stroke-width="2.5" marker-end="url(#mfpe-arr)" opacity="0"/>' +
        '<text x="232" y="170" text-anchor="start" font-size="13" fill="var(--t-muted)">ground level</text>' +
        '<text id="mfpe-hi" x="232" y="80" text-anchor="start" font-size="13" fill="var(--t-muted)">higher level</text>' +
        '<text id="mfpe-heat" x="218" y="122" text-anchor="end" font-size="13" font-weight="700" fill="var(--t-orange)" opacity="0">heat</text>' +
        '<path id="mfpe-photon" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" opacity="0"/>' +
        '<text id="mfpe-lt" x="300" y="122" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)" opacity="0">light</text>' +
        electron('mfpe-e', 9),
        METALS.map(m => '<button type="button" class="scene-btn" data-m="' + m.id + '">' + m.label + '</button>').join(''));
      const dashEl = $('dash'), eG = $('e'), photon = $('photon'), flame = $('flame'), heat = $('heat'), lt = $('lt');
      const sp = []; for (let i = 0; i < 7; i++) sp.push($('sp' + i));
      let cur = METALS[1], tOff = 0;
      function pick(m) {
        cur = m;
        $('t1').textContent = m.name + ', ' + m.grp;
        $('t2').textContent = m.cname + ' · jump: ' + m.jump;
        $('sw').setAttribute('fill', m.col);
        $('outer').setAttribute('fill', m.col); $('glow').setAttribute('fill', m.col);
        photon.setAttribute('stroke', m.col);
        sp.forEach(s => s.setAttribute('fill', m.col));
        const y = 150 - m.gap;
        $('up').setAttribute('y1', y); $('up').setAttribute('y2', y);
        $('dash').setAttribute('y2', y + 6);
        $('hi').setAttribute('y', y - 10);
        markButtons(el, 'm', m.id);
      }
      el.querySelectorAll('button[data-m]').forEach(b => b.addEventListener('click', () => { pick(METALS.find(x => x.id === b.dataset.m)); tOff = 0; }));
      pick(cur);
      const CYC = 4.4;
      const wave = (x0, y0) => { let d = ''; for (let i = 0; i <= 18; i++) { const x = x0 + i * 2.5; d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + (y0 + Math.sin(i * 0.9) * 6).toFixed(1); } return d; };
      api.loop((t, dt) => {
        const c = (t % CYC) / CYC, y0 = 150 - 12, y1 = 150 - cur.gap - 12;
        let y = y0, heatOp = 0, phOp = 0, phX = 0;
        if (c < 0.2) { y = y0; }
        else if (c < 0.4) { const k = (c - 0.2) / 0.2; y = y0 + (y1 - y0) * (1 - Math.pow(1 - k, 3)); heatOp = 1; }
        else if (c < 0.6) { y = y1 + Math.sin(t * 24) * 1.2; }
        else if (c < 0.7) { const k = (c - 0.6) / 0.1; y = y1 + (y0 - y1) * k * k; }
        else { y = y0; }
        if (c >= 0.6 && c < 1) { const k = (c - 0.6) / 0.4; phX = k * 34; phOp = k < 0.75 ? 1 : (1 - k) / 0.25; }
        eG.setAttribute('transform', 'translate(352,' + y.toFixed(1) + ')');
        heat.setAttribute('opacity', heatOp); dashEl.setAttribute('opacity', heatOp);
        heat.setAttribute('y', ((y0 + y1) / 2 + 4).toFixed(1));
        photon.setAttribute('d', wave(292, (y0 + y1) / 2 - 2));
        photon.setAttribute('transform', 'translate(' + (-phX).toFixed(1) + ',0)');
        photon.setAttribute('opacity', phOp.toFixed(2));
        lt.setAttribute('opacity', phOp > 0.2 ? 1 : 0);
        lt.setAttribute('y', ((y0 + y1) / 2 + 22).toFixed(1));
        lt.setAttribute('x', (312 - phX).toFixed(1));
        const fl = 1 + 0.06 * Math.sin(t * 9) + 0.04 * Math.sin(t * 15 + 1);
        flame.setAttribute('transform', 'translate(100,128) scale(' + (0.78 * (1 + 0.05 * Math.sin(t * 11 + 2))).toFixed(3) + ',' + (0.78 * fl).toFixed(3) + ')');
        sp.forEach((s, i) => {
          const k = ((t * 0.9 + i / 7) % 1);
          s.setAttribute('cx', (Math.sin(i * 2.1 + t * 3) * 12 * (1 - k * 0.4)).toFixed(1));
          s.setAttribute('cy', (-20 - k * 66).toFixed(1));
          s.setAttribute('opacity', (Math.sin(k * Math.PI) * 0.9).toFixed(2));
        });
      });
    }
  });

  // ---- Example 2: table salt from Group 1 sodium + Group 17 chlorine (automatic)
  steps.push({
    kind: 'example',
    title: 'Real life: Table salt',
    text: '<p>Table salt is sodium from <b>Group 1</b> joined with chlorine from <b>Group 17</b>. Sodium has one outer electron to lose and chlorine needs one more. The electron moves across, and the two <b>ions</b> stick together as salt.</p>',
    explain: '<p>On the left, a <b>purple sodium atom</b> and a <b>green chlorine atom</b> show only their outer electrons (indigo, minus sign). Sodium\'s single electron moves to the gap in chlorine\'s ring of seven. Sodium turns smaller with a plus sign, chlorine bigger with a minus sign. On the right, purple and green ions alternate in a <b>salt crystal</b> slice.</p>',
    say: 'Table salt is made from two very different elements. Sodium is a soft, reactive metal from group one. Chlorine is a poisonous gas from group seventeen. Watch the left side. The purple sodium atom has just one outer electron. The green chlorine atom has seven and is missing one. The sodium electron moves across to fill the gap. Now sodium has a plus charge and chlorine has a minus charge. These charged atoms are called ions, and opposite charges attract. On the right you can see the result. Millions of sodium ions and chloride ions line up in a neat pattern. That pattern is a salt crystal, the salt on your food.',
    mount: function (el, api) {
      const NAX = 56, CLX = 150, Y = 110, RING = 36;
      const PURPLE = '#7c3aed', GREEN = '#16a34a';
      // lattice: 4 columns x 3 rows of alternating ions
      let lat = '';
      const LX = [233, 279, 325, 371], LY = [70, 116, 162], ions = [];
      LY.forEach((y, r) => LX.forEach((x, c) => {
        const na = (r + c) % 2 === 0;
        ions.push({ x, y, na, id: 'mfpe-i' + r + c });
        lat += '<g id="mfpe-i' + r + c + '"><circle r="' + (na ? 16 : 20) + '" fill="' + (na ? PURPLE : GREEN) + '" stroke="var(--t-ink)" stroke-width="1"/>' +
          '<text y="5" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">' + (na ? 'Na⁺' : 'Cl⁻') + '</text></g>';
      }));
      let ring = '';
      for (let k = 1; k <= 7; k++) ring += electron('mfpe-c' + k, 7);
      const $ = shell(el, '0 0 400 190',
        '<text x="200" y="17" text-anchor="middle" font-size="15" font-weight="800" fill="var(--t-ink)">Sodium + chlorine = table salt</text>' +
        '<text id="mfpe-cap" x="98" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--primary)"> </text>' +
        '<circle cx="' + CLX + '" cy="' + Y + '" r="' + RING + '" fill="none" stroke="var(--t-muted)" stroke-width="1.2" stroke-dasharray="3 4"/>' +
        '<circle cx="' + NAX + '" cy="' + Y + '" r="30" fill="none" stroke="var(--t-muted)" stroke-width="1.2" stroke-dasharray="3 4" id="mfpe-naring"/>' +
        '<circle id="mfpe-na" cx="' + NAX + '" cy="' + Y + '" r="22" fill="' + PURPLE + '" stroke="var(--t-ink)" stroke-width="1.5"/>' +
        '<text id="mfpe-nat" x="' + NAX + '" y="' + (Y + 5) + '" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">Na</text>' +
        '<circle id="mfpe-cl" cx="' + CLX + '" cy="' + Y + '" r="20" fill="' + GREEN + '" stroke="var(--t-ink)" stroke-width="1.5"/>' +
        '<text id="mfpe-clt" x="' + CLX + '" y="' + (Y + 5) + '" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">Cl</text>' +
        ring + electron('mfpe-e0', 7) +
        '<text x="' + NAX + '" y="166" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">Sodium</text>' +
        '<text x="' + NAX + '" y="182" text-anchor="middle" font-size="13" fill="var(--t-muted)">Group 1</text>' +
        '<text x="' + CLX + '" y="166" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">Chlorine</text>' +
        '<text x="' + CLX + '" y="182" text-anchor="middle" font-size="13" fill="var(--t-muted)">Group 17</text>' +
        '<text x="302" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">Salt crystal (a slice)</text>' +
        lat);
      const na = $('na'), cl = $('cl'), nat = $('nat'), clt = $('clt'), naring = $('naring'), cap = $('cap'), e0 = $('e0');
      const cs = [];
      for (let k = 1; k <= 7; k++) cs.push($('c' + k));
      const ionG = ions.map(i => el.querySelector('#' + i.id));
      const CYC = 10;
      const ease = k => k * k * (3 - 2 * k);
      api.loop((t, dt) => {
        const c = t % CYC;
        const tr = c < 2.8 ? 0 : c < 4.4 ? ease((c - 2.8) / 1.6) : 1;      // transfer progress
        const back = c > 9 ? (c - 9) : 0;                                    // fade back to atoms at the end
        const ion = c < 9 ? tr : 1 - back;
        na.setAttribute('r', (24 - 8 * ion).toFixed(1));
        cl.setAttribute('r', (20 + 6 * ion).toFixed(1));
        nat.textContent = ion > 0.6 ? 'Na⁺' : 'Na';
        clt.textContent = ion > 0.6 ? 'Cl⁻' : 'Cl';
        naring.setAttribute('opacity', ion > 0.5 ? 0 : 1);
        // ring electrons of chlorine (the eighth slot faces sodium)
        cs.forEach((g, i) => {
          const a = Math.PI + (i + 1) * Math.PI / 4, b = 1.2 * Math.sin(t * 3 + i * 1.7);
          g.setAttribute('transform', 'translate(' + (CLX + (RING + b) * Math.cos(a)).toFixed(1) + ',' + (Y + (RING + b) * Math.sin(a)).toFixed(1) + ')');
        });
        // the moving electron: from sodium's slot to chlorine's empty slot
        const sx = NAX + 30, ex = CLX - RING;
        const px = sx + (ex - sx) * (c < 9 ? tr : 1), py = Y - Math.sin(Math.PI * (c < 9 ? tr : 1)) * 18 + (c < 2.8 ? Math.sin(t * 3) * 1.5 : 0);
        e0.setAttribute('transform', 'translate(' + px.toFixed(1) + ',' + py.toFixed(1) + ')');
        e0.setAttribute('opacity', c > 9 ? (1 - back) : 1);
        cap.textContent = c < 2.8 ? 'Na has 1 outer electron, Cl has 7' : c < 4.4 ? 'The electron moves across' : 'Na⁺ and Cl⁻ attract';
        ionG.forEach((g, i) => {
          const q = ions[i];
          g.setAttribute('transform', 'translate(' + (q.x + Math.sin(t * 4 + i * 2.3) * 1.6).toFixed(1) + ',' + (q.y + Math.cos(t * 3.4 + i * 1.9) * 1.6).toFixed(1) + ')');
        });
      });
    }
  });

  // ---- Example 3: calcium in milk and bones, Group 2 (interactive: glasses of milk)
  steps.push({
    kind: 'example',
    title: 'Real life: Calcium in milk and bones',
    text: '<p>Calcium is a <b>Group 2</b> metal with two outer electrons, so it forms Ca<sup>2+</sup> ions. Milk is a rich source, and your body stores about 99% of its calcium in bones and teeth. Slide to change how many glasses of milk you drink.</p>',
    explain: '<p>On the left is a <b>glass of milk</b> that fills as you slide. Blue balls are <b>calcium ions</b>. They drift right along the arrow marked <b>absorbed</b> and settle inside the <b>bone</b>, which has room for twelve. The bar at the bottom fills with the share of a teenager\'s daily calcium need, and turns green at about three quarters.</p>',
    say: 'Calcium sits in group two of the periodic table, and it is the mineral that makes your bones hard. Milk is full of it. In this picture, the glass on the left holds milk, and the blue balls are calcium ions. Slide the control to change how many glasses of milk you drink in a day. Watch the ions travel right and pack into the bone. The bar at the bottom shows how close you are to the amount a teenager needs each day, which is about thirteen hundred milligrams. One glass gives about three hundred. Cheese, yogurt, and green vegetables add more. Almost all your calcium is stored in your bones and teeth.',
    mount: function (el, api) {
      const NEED = 1300, PER = 300;
      const CA = '#0ea5e9';
      let travel = '', slots = '';
      for (let i = 0; i < 8; i++) travel += '<circle id="mfpe-t' + i + '" r="9" fill="' + CA + '" stroke="#e0f2fe" stroke-width="1.2" opacity="0"/>';
      const SLOT = [];
      const ORDER = [0, 7, 3, 10, 5, 8, 1, 6, 11, 2, 9, 4];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) SLOT.push([246 + c * 20, 101 + r * 16]);
      SLOT.forEach((p, i) => { slots += '<circle id="mfpe-s' + i + '" r="8" fill="' + CA + '" stroke="#e0f2fe" stroke-width="1.2" opacity="0"/>'; });
      const $ = shell(el, '0 0 400 197',
        '<defs><clipPath id="mfpe-gc"><path d="M24,62 L84,62 L76,150 L32,150 Z"/></clipPath>' + TutorialKit.arrowMarker('mfpe-arr2', '#6b7280') + '</defs>' +
        '<text x="14" y="17" font-size="15" font-weight="800" fill="var(--t-ink)">Calcium (Ca): Group 2 metal, Ca²⁺ ions</text>' +
        '<text id="mfpe-l2" x="14" y="37" font-size="14" font-weight="700" fill="var(--primary)"> </text>' +
        // glass of milk
        '<g clip-path="url(#mfpe-gc)"><rect id="mfpe-milk" x="20" y="150" width="70" height="0" fill="#d5deec" stroke="#64748b" stroke-width="1.5"/></g>' +
        '<path d="M24,62 L84,62 L76,150 L32,150 Z" fill="none" stroke="var(--t-ink)" stroke-width="3" stroke-linejoin="round"/>' +
        '<text x="54" y="164" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)">milk</text>' +
        // route
        '<line x1="96" y1="106" x2="222" y2="106" stroke="var(--t-muted)" stroke-width="2" stroke-dasharray="5 5" marker-end="url(#mfpe-arr2)"/>' +
        '<text x="160" y="82" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">absorbed</text>' +
        // bone
        '<g fill="#f1f5f9" stroke="var(--t-ink)" stroke-width="2.5"><rect x="228" y="90" width="134" height="40" rx="4"/>' +
        '<circle cx="230" cy="90" r="14"/><circle cx="230" cy="130" r="14"/><circle cx="360" cy="90" r="14"/><circle cx="360" cy="130" r="14"/></g>' +
        '<rect x="230" y="92" width="130" height="36" fill="#f1f5f9"/>' +
        slots + travel +
        '<text x="296" y="154" text-anchor="middle" font-size="13" fill="var(--t-muted)">bone: Ca²⁺ ions packed in</text>' +
        // meter
        '<rect x="20" y="167" width="360" height="7" rx="4" fill="var(--t-soft)" stroke="var(--t-muted)" stroke-width="1"/>' +
        '<rect id="mfpe-bar" x="20" y="167" width="0" height="7" rx="4" fill="#f97316"/>' +
        '<text id="mfpe-cap" x="200" y="190" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-ink)"> </text>',
        '<span>Glasses of milk</span><input id="mfpe-sl" type="range" min="0" max="4" step="1" value="2" aria-label="Glasses of milk per day"><span id="mfpe-slv" style="min-width:2ch">2</span>');
      const sl = $('sl');
      const trav = []; for (let i = 0; i < 8; i++) trav.push($('t' + i));
      const slotEls = SLOT.map((p, i) => { const c = $('s' + i); c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); return c; });
      let g = 2, m = 0, shownMilk = 0;
      function upd() {
        g = +sl.value;
        $('slv').textContent = g;
        const mg = g * PER, pct = Math.round(mg / NEED * 100);
        m = Math.min(12, Math.round(12 * mg / NEED));
        $('l2').textContent = g === 0 ? 'No milk: no calcium coming in' : g + (g === 1 ? ' glass' : ' glasses') + ' = about ' + mg + ' mg of calcium';
        $('cap').textContent = 'about ' + pct + '% of a teen’s daily need (1300 mg)';
        const bar = $('bar'); bar.setAttribute('width', Math.min(1, mg / NEED) * 360); bar.setAttribute('fill', pct >= 75 ? '#16a34a' : '#f97316');
      }
      sl.addEventListener('input', upd);
      upd();
      api.loop((t, dt) => {
        shownMilk += (g - shownMilk) * Math.min(1, dt * 5);
        const h = shownMilk / 4 * 84;
        $('milk').setAttribute('y', 150 - h); $('milk').setAttribute('height', h); $('milk').setAttribute('opacity', h > 1 ? 1 : 0);
        const n = g * 2;
        trav.forEach((c, i) => {
          if (i >= n) { c.setAttribute('opacity', 0); return; }
          const k = (t * 0.32 + i / n) % 1;
          c.setAttribute('cx', (78 + 156 * k).toFixed(1));
          c.setAttribute('cy', (106 + Math.sin(k * 6 * Math.PI + i * 2) * 9).toFixed(1));
          c.setAttribute('opacity', Math.min(1, k * 8, (1 - k) * 8).toFixed(2));
        });
        slotEls.forEach((c, i) => {
          const on = ORDER.indexOf(i) < m;
          c.setAttribute('opacity', on ? 1 : 0);
          if (on) { c.setAttribute('cx', (SLOT[i][0] + Math.sin(t * 2 + i) * 1.6).toFixed(1)); c.setAttribute('cy', (SLOT[i][1] + Math.cos(t * 2.3 + i * 1.4) * 1.6).toFixed(1)); }
        });
      });
    }
  });

  // ---- Example 4: silicon chips, metalloid semiconductor (interactive: pure / warm / doped)
  steps.push({
    kind: 'example',
    title: 'Real life: Silicon chips',
    text: '<p>Every phone and computer chip is built on <b>silicon</b>, a metalloid in <b>Group 14</b>. Pure silicon barely conducts, but heat or a pinch of <b>phosphorus</b> (Group 15) frees electrons so it conducts a controllable amount. That is what makes it a <b>semiconductor</b>.</p>',
    explain: '<p>A slab of <b>silicon atoms</b> (grey balls joined by bond lines) sits between a <b>minus plate</b> on the left and a <b>plus plate</b> on the right. Free <b>electrons</b> (indigo, minus sign) drift right. Press the buttons: <b>warming</b> frees more electrons, and orange <b>phosphorus atoms</b> each add one. The current bar grows.</p>',
    say: 'Your phone is packed with silicon chips. Silicon sits in group fourteen, between the metals and the nonmetals. It is called a semiconductor, because it conducts a little, but not much. In this picture, grey silicon atoms sit between a minus plate and a plus plate. The small indigo dots are free electrons, and they drift toward the plus side. In pure silicon there are very few, so the current bar is tiny. Press warm it up, and heat shakes more electrons loose. Now press add phosphorus. The orange atoms each bring one extra electron, so the current jumps. Engineers control silicon this way to build billions of tiny switches.',
    mount: function (el, api) {
      const COLX = [100, 150, 200, 250, 300], ROWY = [78, 108, 138];
      const PIDX = { '0,1': 1, '1,3': 1, '2,0': 1, '2,4': 1 };    // phosphorus positions "row,col"
      let bonds = '', atoms = '';
      ROWY.forEach((y, r) => COLX.forEach((x, c) => {
        if (c < 4) bonds += '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 50) + '" y2="' + y + '" stroke="var(--t-muted)" stroke-width="3"/>';
        if (r < 2) bonds += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + 30) + '" stroke="var(--t-muted)" stroke-width="3"/>';
        atoms += '<g id="mfpe-a' + r + c + '" transform="translate(' + x + ',' + y + ')"><circle r="14" fill="#64748b" stroke="var(--t-ink)" stroke-width="1"/>' +
          '<text y="5" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">Si</text></g>';
      }));
      let free = '';
      for (let i = 0; i < 9; i++) free += electron('mfpe-f' + i, 7);
      const $ = shell(el, '0 0 400 197',
        '<text x="14" y="17" font-size="15" font-weight="800" fill="var(--t-ink)">Silicon (Si): a metalloid semiconductor</text>' +
        '<text id="mfpe-l2" x="14" y="37" font-size="14" font-weight="700" fill="var(--primary)"> </text>' +
        '<rect x="72" y="54" width="256" height="100" rx="6" fill="var(--t-soft)" opacity="0.6" stroke="var(--t-muted)" stroke-width="1.5"/>' +
        '<rect x="64" y="54" width="8" height="100" fill="var(--t-ink)"/><rect x="328" y="54" width="8" height="100" fill="var(--t-ink)"/>' +
        '<circle cx="40" cy="104" r="12" fill="var(--t-soft)" stroke="var(--t-ink)" stroke-width="2"/><text x="40" y="111" text-anchor="middle" font-size="20" font-weight="800" fill="var(--t-ink)">' + MINUS + '</text>' +
        '<circle cx="360" cy="104" r="12" fill="var(--t-soft)" stroke="var(--t-ink)" stroke-width="2"/><text x="360" y="111" text-anchor="middle" font-size="20" font-weight="800" fill="var(--t-ink)">+</text>' +
        bonds + atoms + free +
        '<text x="12" y="173" font-size="13" font-weight="700" fill="var(--t-ink)">current</text>' +
        '<rect x="78" y="164" width="240" height="10" rx="5" fill="var(--t-soft)" stroke="var(--t-muted)" stroke-width="1"/>' +
        '<rect id="mfpe-bar" x="78" y="164" width="10" height="10" rx="5" fill="#f97316"/>' +
        '<text id="mfpe-lv" x="326" y="173" font-size="13" font-weight="700" fill="var(--t-ink)">tiny</text>' +
        '<text x="200" y="189" text-anchor="middle" font-size="13" fill="var(--t-muted)">Group 14: between the metals and the nonmetals</text>',
        [['pure', 'Pure silicon'], ['warm', 'Warm it up'], ['dope', 'Add phosphorus']].map(b => '<button type="button" class="scene-btn" data-md="' + b[0] + '">' + b[1] + '</button>').join(''));
      const fr = []; for (let i = 0; i < 9; i++) fr.push($('f' + i));
      const MODES = {
        pure: { n: 2, v: 14, jit: 1, bar: 0.06, lv: 'tiny', say: 'Pure silicon: very few free electrons' },
        warm: { n: 4, v: 26, jit: 3, bar: 0.32, lv: 'small', say: 'Warm silicon: heat frees more electrons' },
        dope: { n: 6, v: 46, jit: 1.5, bar: 0.86, lv: 'large', say: 'Doped with phosphorus: each P adds an electron' }
      };
      let mode = 'pure', px = fr.map((f, i) => 76 + (i * 37) % 250), ph = fr.map((f, i) => i * 1.9);
      const rowsY = [93, 123, 108, 93, 123, 108, 93, 123, 108];
      function setMode(m) {
        mode = m;
        const d = MODES[m];
        $('l2').textContent = d.say;
        $('lv').textContent = d.lv;
        $('bar').setAttribute('width', 240 * d.bar);
        ROWY.forEach((y, r) => COLX.forEach((x, c) => {
          const p = m === 'dope' && PIDX[r + ',' + c];
          const g = $('a' + r + c);
          g.querySelector('circle').setAttribute('fill', p ? '#ea580c' : '#64748b');
          g.querySelector('text').textContent = p ? 'P' : 'Si';
        }));
        markButtons(el, 'md', m);
      }
      el.querySelectorAll('button[data-md]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.md)));
      setMode('pure');
      api.loop((t, dt) => {
        const d = MODES[mode];
        fr.forEach((f, i) => {
          if (i >= d.n) { f.setAttribute('opacity', 0); return; }
          px[i] += d.v * dt;
          if (px[i] > 322) px[i] = 78;
          f.setAttribute('opacity', 1);
          f.setAttribute('transform', 'translate(' + (px[i] + Math.sin(t * 6 + ph[i]) * d.jit).toFixed(1) + ',' + (rowsY[i] + Math.cos(t * 5 + ph[i]) * d.jit * 1.5).toFixed(1) + ')');
        });
      });
    }
  });

  // ---- Example 5: the halogens, Group 17 (interactive: pick F / Cl / Br / I)
  steps.push({
    kind: 'example',
    title: 'Real life: Halogens at home',
    text: '<p>The <b>halogens</b> in <b>Group 17</b> all have seven outer electrons and are very reactive, yet they look different: fluorine and chlorine are gases, bromine is a liquid, iodine is a solid. Tap each one to see how it is used.</p>',
    explain: '<p>On the left is <b>Group 17</b> of the periodic table, with fluorine at the top and iodine at the bottom. The <b>glass jar</b> shows the chosen halogen as pairs of joined balls, which are <b>molecules</b>: fast and far apart in a gas, sliding in a liquid, locked in a crystal for a solid. The text on the right gives its color, state and use.</p>',
    say: 'These four elements share a column of the periodic table called group seventeen, the halogens. Each has seven outer electrons, so each is eager to gain one more. Press the buttons to compare them. In the jar, every pair of joined balls is one molecule. Fluorine and chlorine are gases, so the molecules zoom about. Bromine is a liquid, so they slide past each other. Iodine is a solid, so they stay in place and only vibrate. Each also has a use. Fluoride helps protect your teeth. Chlorine keeps pool water free of germs. Iodine is an antiseptic for cuts. Going up the column, the halogens get more reactive.',
    mount: function (el, api) {
      const H = [
        { id: 'f', sym: 'F', name: 'Fluorine (F)', state: 'gas', s1: 'Pale yellow gas', s2: 'the most reactive halogen', a: 'Fluoride in toothpaste', b: 'toughens tooth enamel', col: '#fde047' },
        { id: 'cl', sym: 'Cl', name: 'Chlorine (Cl)', state: 'gas', s1: 'Green-yellow gas', s2: 'toxic gas: use with care', a: 'Chlorine kills pool germs', b: 'and cleans drinking water', col: '#84cc16' },
        { id: 'br', sym: 'Br', name: 'Bromine (Br)', state: 'liquid', s1: 'Red-brown liquid', s2: 'one of only 2 liquid elements', a: 'Fire-retardant chemicals', b: 'slow the spread of flames', col: '#c2410c' },
        { id: 'i', sym: 'I', name: 'Iodine (I)', state: 'solid', s1: 'Gray-violet solid', s2: 'the least reactive of the four', a: 'Iodine antiseptic on cuts', b: 'and in iodized table salt', col: '#4b5563' }
      ];
      const CELLY = [58, 88, 118, 148];
      let cells = '';
      H.forEach((h, i) => {
        cells += '<g id="mfpe-h' + h.id + '" style="cursor:pointer" data-h="' + h.id + '"><rect x="12" y="' + CELLY[i] + '" width="48" height="27" rx="5" fill="#e0e7ff" stroke="#818cf8" stroke-width="1.5"/>' +
          '<text x="36" y="' + (CELLY[i] + 19) + '" text-anchor="middle" font-size="16" font-weight="800" fill="#1f2937" style="pointer-events:none">' + h.sym + '</text></g>';
      });
      const NM = 14;
      let mols = '';
      for (let i = 0; i < NM; i++) mols += '<g id="mfpe-m' + i + '"><line x1="-5" x2="5" stroke="var(--t-ink)" stroke-width="2"/><circle cx="-5.5" r="5.5" stroke="var(--t-ink)" stroke-width="1"/><circle cx="5.5" r="5.5" stroke="var(--t-ink)" stroke-width="1"/></g>';
      const $ = shell(el, '0 0 400 190',
        '<text x="14" y="17" font-size="15" font-weight="800" fill="var(--t-ink)">Halogens (Group 17): 7 outer electrons</text>' +
        '<text x="36" y="50" text-anchor="middle" font-size="13" font-weight="700" fill="var(--t-muted)">Group 17</text>' +
        cells +
        '<rect x="80" y="54" width="112" height="106" rx="8" fill="var(--t-soft)" opacity="0.55"/>' +
        '<rect id="mfpe-liq" x="82" y="128" width="108" height="30" fill="#7c2d12" opacity="0"/>' +
        '<rect x="80" y="54" width="112" height="106" rx="8" fill="none" stroke="var(--t-ink)" stroke-width="2.5"/>' +
        '<rect x="74" y="47" width="124" height="8" rx="3" fill="var(--t-muted)"/>' +
        mols +
        '<text x="136" y="178" text-anchor="middle" font-size="13" fill="var(--t-muted)">pair = molecule</text>' +
        '<circle id="mfpe-sw" cx="216" cy="70" r="7" fill="#fde047" stroke="var(--t-ink)" stroke-width="1"/>' +
        '<text id="mfpe-nm" x="230" y="65" font-size="14" font-weight="800" fill="var(--t-ink)"> </text>' +
        '<text id="mfpe-s1" x="230" y="83" font-size="13" font-weight="700" fill="var(--t-ink)"> </text>' +
        '<text id="mfpe-s2" x="210" y="103" font-size="13" fill="var(--t-muted)"> </text>' +
        '<line x1="210" y1="114" x2="392" y2="114" stroke="var(--t-muted)" stroke-width="1" opacity="0.6"/>' +
        '<text x="210" y="134" font-size="13" font-weight="700" fill="var(--primary)">Where you meet it</text>' +
        '<text id="mfpe-ua" x="210" y="152" font-size="13" font-weight="700" fill="var(--t-ink)"> </text>' +
        '<text id="mfpe-ub" x="210" y="170" font-size="13" fill="var(--t-ink)"> </text>',
        H.map(h => '<button type="button" class="scene-btn" data-hx="' + h.id + '">' + h.name.split(' ')[0] + '</button>').join(''));
      const M = [];
      for (let i = 0; i < NM; i++) M.push({ g: $('m' + i), x: 0, y: 0, vx: 0, vy: 0, a: 0, av: 0, bx: 0, by: 0, kind: 'gas' });
      let cur = H[1];
      const BX0 = 93, BX1 = 179;
      function place(m, i, h) {
        const rnd = (a, b) => a + Math.random() * (b - a);
        m.a = rnd(0, 6.28); m.av = rnd(-2, 2);
        if (h.state === 'gas') {
          m.kind = i < 12 ? 'gas' : 'off';
          m.x = rnd(BX0, BX1); m.y = rnd(68, 142);
          const sp = h.id === 'f' ? 62 : 46, an = rnd(0, 6.28); m.vx = Math.cos(an) * sp; m.vy = Math.sin(an) * sp; m.top = 68; m.bot = 142;
        } else if (h.state === 'liquid') {
          if (i < 12) { m.kind = 'liq'; m.x = rnd(BX0, BX1); m.y = rnd(134, 148); const an = rnd(0, 6.28); m.vx = Math.cos(an) * 20; m.vy = Math.sin(an) * 20; m.top = 132; m.bot = 148; }
          else { m.kind = 'vap'; m.x = rnd(BX0, BX1); m.y = rnd(68, 116); const an = rnd(0, 6.28); m.vx = Math.cos(an) * 28; m.vy = Math.sin(an) * 28; m.top = 68; m.bot = 122; }
        } else {
          if (i < 12) { m.kind = 'sol'; m.bx = 103 + (i % 4) * 24; m.by = 114 + Math.floor(i / 4) * 15; m.x = m.bx; m.y = m.by; m.a = 0; m.av = 0; }
          else { m.kind = 'vap'; m.x = rnd(BX0, BX1); m.y = rnd(68, 100); const an = rnd(0, 6.28); m.vx = Math.cos(an) * 28; m.vy = Math.sin(an) * 28; m.top = 68; m.bot = 104; }
        }
      }
      function pick(h) {
        cur = h;
        H.forEach(o => {
          const c = $('h' + o.id).querySelector('rect'), on = o === h;
          c.setAttribute('fill', on ? '#fbbf24' : '#e0e7ff'); c.setAttribute('stroke', on ? '#b45309' : '#818cf8'); c.setAttribute('stroke-width', on ? 3 : 1.5);
        });
        $('sw').setAttribute('fill', h.col);
        $('nm').textContent = h.name; $('s1').textContent = h.s1; $('s2').textContent = h.s2;
        $('ua').textContent = h.a; $('ub').textContent = h.b;
        $('liq').setAttribute('opacity', h.state === 'liquid' ? 0.85 : 0);
        M.forEach((m, i) => {
          place(m, i, h);
          const fill = m.kind === 'vap' ? (h.id === 'br' ? '#f97316' : '#a855f7') : (h.id === 'br' ? '#ea580c' : h.col);
          m.g.querySelectorAll('circle').forEach(c => c.setAttribute('fill', fill));
          m.g.setAttribute('opacity', m.kind === 'off' ? 0 : 1);
        });
        markButtons(el, 'hx', h.id);
      }
      el.querySelectorAll('button[data-hx]').forEach(b => b.addEventListener('click', () => pick(H.find(x => x.id === b.dataset.hx))));
      el.querySelectorAll('g[data-h]').forEach(g => g.addEventListener('click', () => pick(H.find(x => x.id === g.dataset.h))));
      pick(cur);
      api.loop((t, dt) => {
        M.forEach((m, i) => {
          if (m.kind === 'sol') {
            m.x = m.bx + Math.sin(t * 9 + i * 1.7) * 1.6; m.y = m.by + Math.cos(t * 8 + i * 2.3) * 1.6;
          } else if (m.kind !== 'off') {
            m.x += m.vx * dt; m.y += m.vy * dt; m.a += m.av * dt;
            if (m.x < BX0) { m.x = BX0; m.vx = Math.abs(m.vx); } else if (m.x > BX1) { m.x = BX1; m.vx = -Math.abs(m.vx); }
            if (m.y < m.top) { m.y = m.top; m.vy = Math.abs(m.vy); } else if (m.y > m.bot) { m.y = m.bot; m.vy = -Math.abs(m.vy); }
          }
          m.g.setAttribute('transform', 'translate(' + m.x.toFixed(1) + ',' + m.y.toFixed(1) + ') rotate(' + (m.a * 57.3).toFixed(0) + ')');
        });
      });
    }
  });

  addTutorialSteps('chemistry', 'periodic', steps, [
    { term: 'Ion', definition: 'An atom that has gained or lost electrons, so it carries a charge. Sodium loses one electron to become Na+; chlorine gains one to become Cl\u2212.' },
    { term: 'Halogen', definition: 'An element in Group 17 (fluorine, chlorine, bromine, iodine). Each has seven outer electrons and is very reactive.' },
    { term: 'Semiconductor', definition: 'A material that conducts electricity a little, and can be controlled by heat or by adding other atoms. Silicon is the classic example.' }
  ]);
})();
