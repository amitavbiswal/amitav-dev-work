(function () {
  // Puzzles: classic (Famous Brain Teasers) — registerPuzzles('classic', [ ... ]);

  // ---------- tiny SVG helpers (hard-coded colours; shown on a white panel) ----------
  const INK = '#1f2933';
  function svgWrap(w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" role="img">' + body + '</svg>';
  }
  function tx(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 14) + '" text-anchor="' + (o.anchor || 'middle') +
      '" font-family="Arial, Helvetica, sans-serif" font-weight="' + (o.weight || 'normal') + '" fill="' + (o.fill || INK) + '">' + s + '</text>';
  }
  function rc(x, y, w, h, fill, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.rx || 0) + '" fill="' + fill +
      '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.sw || 2) + '"/>';
  }
  function ci(x, y, r, fill, o) {
    o = o || {};
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.sw || 2) + '"/>';
  }
  function ln(x1, y1, x2, y2, o) {
    o = o || {};
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.sw || 2) +
      '" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
  }
  const DISC_COLORS = ['#f4a261', '#e9c46a', '#8ecae6', '#95d5b2', '#cdb4db', '#ffafcc'];

  // Tower of Hanoi: pegs = three arrays of disc sizes listed bottom to top
  function hanoiSvg(pegs) {
    let s = ln(10, 140, 310, 140, { sw: 3 });
    const xs = [55, 160, 265];
    for (let i = 0; i < 3; i++) {
      s += ln(xs[i], 40, xs[i], 140, { sw: 4 });
      s += tx(xs[i], 162, 'ABC'[i], { size: 16, weight: 'bold' });
      pegs[i].forEach((d, k) => {
        const w = 22 + d * 14;
        s += rc(xs[i] - w / 2, 140 - (k + 1) * 18, w, 18, DISC_COLORS[(d - 1) % 6], { rx: 4 });
      });
    }
    return svgWrap(320, 170, s);
  }

  // Doors (Monty Hall): opened = index of an opened door showing a goat
  function montyDoors() {
    let s = '';
    const xs = [22, 124, 226];
    for (let i = 0; i < 3; i++) {
      if (i === 2) {
        s += rc(xs[i], 35, 72, 110, '#e5e7eb', { sw: 2 });
        s += tx(xs[i] + 36, 95, 'Goat', { size: 15, weight: 'bold' });
      } else {
        s += rc(xs[i], 35, 72, 110, '#c68642', { sw: i === 0 ? 5 : 2 });
        s += tx(xs[i] + 36, 100, '?', { size: 30, weight: 'bold', fill: '#fff' });
        s += ci(xs[i] + 60, 92, 3, '#fff', { stroke: INK, sw: 1.5 });
      }
      s += tx(xs[i] + 36, 168, 'Door ' + (i + 1), { size: 15, weight: 'bold' });
    }
    s += tx(58, 24, 'Your pick', { size: 14, weight: 'bold' });
    s += tx(262, 24, 'Opened', { size: 14, weight: 'bold' });
    return svgWrap(320, 180, s);
  }

  // River banks: leftLines / rightLines are arrays of text lines; boat on left when boatLeft is true
  function banksSvg(leftLines, rightLines, boatLeft, seats) {
    let s = rc(3, 20, 100, 130, '#d8f3dc');
    s += rc(217, 20, 100, 130, '#d8f3dc');
    s += rc(103, 20, 114, 130, '#bde0fe', { sw: 0, stroke: '#bde0fe' });
    s += tx(53, 14, 'Left bank', { size: 14, weight: 'bold' });
    s += tx(267, 14, 'Right bank', { size: 14, weight: 'bold' });
    leftLines.forEach((t, i) => { s += tx(53, 55 + i * 26, t, { size: 15 }); });
    rightLines.forEach((t, i) => { s += tx(267, 55 + i * 26, t, { size: 15 }); });
    const bx = boatLeft ? 112 : 160;
    s += '<path d="M' + bx + ' 92 L' + (bx + 90) + ' 92 L' + (bx + 76) + ' 116 L' + (bx + 14) + ' 116 Z" fill="#c68642" stroke="' + INK + '" stroke-width="2"/>';
    s += tx(bx + 45, 86, seats || 'boat', { size: 13 });
    return svgWrap(320, 165, s);
  }

  // Bridge and torch: people with their crossing times
  function torchSvg(times) {
    let s = rc(3, 30, 110, 120, '#d8f3dc') + rc(207, 30, 110, 120, '#d8f3dc');
    s += ln(113, 90, 207, 90, { sw: 8 });
    s += ln(113, 90, 207, 90, { sw: 2, stroke: '#c68642' });
    s += tx(160, 78, 'bridge', { size: 14 });
    s += tx(58, 20, 'Start', { size: 14, weight: 'bold' }) + tx(262, 20, 'Safe side', { size: 14, weight: 'bold' });
    const pos = [[32, 62], [84, 62], [32, 114], [84, 114]];
    times.forEach((t, i) => {
      s += ci(pos[i][0], pos[i][1], 23, '#ffe8a3');
      s += tx(pos[i][0], pos[i][1] + 5, t + ' min', { size: 13, weight: 'bold' });
    });
    s += tx(160, 135, 'one torch', { size: 14 });
    return svgWrap(320, 165, s);
  }

  // Water jugs: caps = capacities in litres, fills = current litres, k = pixels per litre
  function jugsSvg(caps, fills, k) {
    let s = ln(10, 160, 310, 160, { sw: 3 });
    const gap = 320 / caps.length;
    caps.forEach((c, i) => {
      const cx = gap * i + gap / 2, w = 54, h = c * k;
      s += rc(cx - w / 2, 160 - h, w, h, '#f1f5f9', { sw: 0, stroke: '#f1f5f9' });
      if (fills[i] > 0) s += rc(cx - w / 2, 160 - fills[i] * k, w, fills[i] * k, '#8ecae6', { sw: 0, stroke: '#8ecae6' });
      s += '<path d="M' + (cx - w / 2) + ' ' + (160 - h) + ' L' + (cx - w / 2) + ' 160 L' + (cx + w / 2) + ' 160 L' + (cx + w / 2) + ' ' + (160 - h) + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
      s += tx(cx, 182, c + ' litres', { size: 15, weight: 'bold' });
      if (fills[i] > 0) s += tx(cx, 160 - fills[i] * k / 2 + 5, fills[i] + ' L', { size: 14 });
    });
    return svgWrap(320, 192, s);
  }

  // Balance scale: nL and nR balls on the pans, nAside balls on the table; tilt 'L' (left heavier), 'R' or 'level'
  function balanceSvg(nL, nR, nAside, tilt) {
    const d = tilt === 'L' ? 10 : tilt === 'R' ? -10 : 0;
    const ly = 45 + d, ry = 45 - d;
    let s = ln(160, 45, 160, 150, { sw: 4 }) + rc(120, 150, 80, 9, '#9ca3af', { rx: 3 });
    s += ln(60, ly, 260, ry, { sw: 5 }) + ci(160, 45, 6, '#fff');
    [[60, ly, nL], [260, ry, nR]].forEach(([ex, ey, n]) => {
      s += ln(ex, ey, ex - 42, ey + 44, { sw: 2 }) + ln(ex, ey, ex + 42, ey + 44, { sw: 2 });
      s += rc(ex - 46, ey + 44, 92, 8, '#9ca3af', { rx: 3 });
      const x0 = ex - (n - 1) * 11;
      for (let i = 0; i < n; i++) s += ci(x0 + i * 22, ey + 34, 9, '#ffe8a3', { sw: 2 });
    });
    if (nAside > 0) {
      s += tx(160, 184, 'set aside, not weighed', { size: 14 });
      const x0 = 160 - (nAside - 1) * 12;
      for (let i = 0; i < nAside; i++) s += ci(x0 + i * 24, 204, 9, '#ffe8a3', { sw: 2 });
    }
    return svgWrap(320, 216, s);
  }

  // Josephus circle: numbers 1..n around a ring
  function ringSvg(n) {
    let s = ci(160, 108, 84, 'none', { stroke: '#cbd5e1', sw: 2 });
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n;
      const x = 160 + 84 * Math.cos(a), y = 108 + 84 * Math.sin(a);
      s += ci(x.toFixed(1), y.toFixed(1), 16, '#ffe8a3') + tx(x.toFixed(1), (y + 5).toFixed(1), i + 1, { size: 14, weight: 'bold' });
    }
    s += tx(160, 112, 'circle', { size: 14, fill: '#6b7280' });
    return svgWrap(320, 216, s);
  }

  // Generic square grid: cellFn(r, c) returns { fill, text, size, bold } (all optional)
  function gridSvg(rows, cols, cell, x0, y0, cellFn) {
    let s = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const o = cellFn(r, c) || {};
        s += rc(x0 + c * cell, y0 + r * cell, cell, cell, o.fill || '#ffffff', { sw: 1.5 });
        if (o.text !== undefined && o.text !== '') s += tx(x0 + c * cell + cell / 2, y0 + r * cell + cell / 2 + (o.size || 14) * 0.35, o.text, { size: o.size || 14, weight: o.bold ? 'bold' : 'normal' });
      }
    }
    return s;
  }

  // Curved or straight connector between two points (off = sideways bulge)
  function edge(x1, y1, x2, y2, off) {
    if (!off) return ln(x1, y1, x2, y2, { sw: 3 });
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy);
    const cx = mx + (-dy / L) * off * 2, cy = my + (dx / L) * off * 2;
    return '<path d="M' + x1 + ' ' + y1 + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + x2 + ' ' + y2 + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  }

  // Seven Bridges of Koenigsberg as a picture: land areas A (island), B, C, D; each line is a bridge
  function konigsbergSvg() {
    const P = { A: [55, 100], B: [160, 26], C: [160, 174], D: [265, 100] };
    let s = '';
    [['A', 'B', 1], ['A', 'B', -1], ['A', 'C', 1], ['A', 'C', -1], ['A', 'D', 0], ['B', 'D', 0], ['C', 'D', 0]].forEach(([a, b, o]) => {
      s += edge(P[a][0], P[a][1], P[b][0], P[b][1], o * 12);
    });
    Object.keys(P).forEach(k => {
      s += ci(P[k][0], P[k][1], 19, '#bde0fe') + tx(P[k][0], P[k][1] + 6, k, { size: 17, weight: 'bold' });
    });
    return svgWrap(320, 200, s);
  }

  // Sissa and the chessboard: grains double on each square; square 20 is highlighted
  function wheatSvg() {
    let s = gridSvg(8, 8, 26, 56, 4, (r, c) => {
      const n = r * 8 + c + 1;
      const o = { fill: (r + c) % 2 ? '#cbd5e1' : '#f1f5f9', size: 13 };
      if (r === 0) o.text = 2 ** c;
      if (n === 20) { o.fill = '#ffe08a'; o.text = '?'; o.bold = true; o.size = 18; }
      return o;
    });
    s += tx(160, 240, 'Squares are numbered row by row, 1 to 64', { size: 13 });
    return svgWrap(320, 248, s);
  }

  // Ants on a stick: marks in cm with direction arrows (dir +1 right, -1 left)
  function stickSvg(ants) {
    let s = rc(30, 66, 260, 10, '#e9c46a', { sw: 2 }) + tx(30, 108, '0', { size: 14 }) + tx(290, 108, '100', { size: 14 });
    ants.forEach(([pos, dir]) => {
      const x = 30 + 2.6 * pos;
      s += ci(x, 56, 9, '#374151', { stroke: '#111827' });
      const x1 = x - 16 * dir, x2 = x + 18 * dir;
      s += ln(x1, 30, x2, 30, { sw: 3 });
      s += '<polygon points="' + (x2 + 8 * dir) + ',30 ' + (x2 - 2 * dir) + ',24 ' + (x2 - 2 * dir) + ',36" fill="' + INK + '"/>';
      s += ln(x, 76, x, 86, { sw: 2 }) + tx(x, 102, pos, { size: 14, weight: 'bold' });
    });
    s += tx(160, 132, 'Marks are in cm; the stick is 100 cm long', { size: 13 });
    return svgWrap(320, 142, s);
  }

  // Two trains approaching each other with a bee
  function trainsSvg() {
    let s = ln(5, 82, 315, 82, { sw: 3 });
    s += rc(12, 40, 70, 34, '#f4a261', { rx: 5 }) + ci(28, 79, 6, '#374151') + ci(66, 79, 6, '#374151');
    s += rc(238, 40, 70, 34, '#8ecae6', { rx: 5 }) + ci(254, 79, 6, '#374151') + ci(292, 79, 6, '#374151');
    s += ln(90, 55, 118, 55, { sw: 3 }) + '<polygon points="126,55 116,49 116,61" fill="' + INK + '"/>';
    s += ln(230, 55, 202, 55, { sw: 3 }) + '<polygon points="194,55 204,49 204,61" fill="' + INK + '"/>';
    s += tx(47, 104, '30 km/h', { size: 14 }) + tx(273, 104, '30 km/h', { size: 14 });
    s += ln(47, 122, 273, 122, { sw: 2 }) + ln(47, 114, 47, 130, { sw: 2 }) + ln(273, 114, 273, 130, { sw: 2 });
    s += tx(160, 116, '60 km apart', { size: 14, weight: 'bold' });
    s += ci(88, 30, 6, '#ffe08a') + tx(88, 18, 'bee 60 km/h', { size: 13 });
    return svgWrap(320, 140, s);
  }

  // Two doors and two guards
  function guardsSvg() {
    let s = rc(20, 28, 70, 96, '#c68642') + rc(230, 28, 70, 96, '#c68642');
    s += tx(55, 146, 'Door 1', { size: 15, weight: 'bold' }) + tx(265, 146, 'Door 2', { size: 15, weight: 'bold' });
    s += ci(55, 84, 3, '#fff', { stroke: INK, sw: 1.5 }) + ci(265, 84, 3, '#fff', { stroke: INK, sw: 1.5 });
    [125, 195].forEach(x => {
      s += ci(x, 66, 14, '#ffe8a3') + ln(x, 80, x, 112, { sw: 3 }) + ln(x - 14, 92, x + 14, 92, { sw: 3 });
      s += ln(x, 112, x - 10, 128, { sw: 3 }) + ln(x, 112, x + 10, 128, { sw: 3 });
    });
    s += tx(125, 48, 'Guard', { size: 14 }) + tx(195, 48, 'Guard', { size: 14 });
    s += tx(160, 16, 'freedom behind one, a dragon behind the other', { size: 13 });
    return svgWrap(320, 156, s);
  }

  // Three prisoners in a line facing a wall (A at the back)
  function hatsSvg() {
    let s = rc(262, 30, 48, 112, '#d1d5db') + tx(286, 92, 'wall', { size: 14 });
    [['A', 50], ['B', 130], ['C', 210]].forEach(([n, x]) => {
      s += rc(x - 16, 32, 32, 22, '#e5e7eb', { rx: 4 }) + tx(x, 49, '?', { size: 16, weight: 'bold' });
      s += ci(x, 74, 15, '#ffe8a3') + ci(x + 6, 72, 2, INK, { sw: 1 });
      s += ln(x, 89, x, 120, { sw: 3 }) + ln(x, 120, x - 9, 140, { sw: 3 }) + ln(x, 120, x + 9, 140, { sw: 3 });
      s += tx(x, 162, n, { size: 16, weight: 'bold' });
    });
    s += tx(150, 18, 'everyone faces the wall', { size: 14 });
    return svgWrap(320, 172, s);
  }

  // Pancake stack: sizes listed from TOP to BOTTOM
  function pancakeSvg(sizes) {
    let s = tx(160, 18, 'top', { size: 14, weight: 'bold' });
    const h = 26;
    sizes.forEach((sz, i) => {
      const w = 30 + sz * 34;
      s += rc(160 - w / 2, 28 + i * h, w, h - 2, '#e9c46a', { rx: 12 });
      s += tx(160, 28 + i * h + 18, sz, { size: 15, weight: 'bold' });
    });
    s += rc(60, 28 + sizes.length * h + 2, 200, 6, '#9ca3af', { rx: 3 });
    s += tx(160, 28 + sizes.length * h + 28, 'bottom (plate)', { size: 14 });
    return svgWrap(320, 28 + sizes.length * h + 38, s);
  }

  // Wheel-shaped map graph: one hub country surrounded by a ring of countries (circles = countries, lines = shared borders)
  function wheelSvg(n) {
    let s = '';
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n;
      pts.push([160 + 82 * Math.cos(a), 112 + 82 * Math.sin(a)]);
    }
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % n];
      s += ln(p[0].toFixed(1), p[1].toFixed(1), q[0].toFixed(1), q[1].toFixed(1), { sw: 3 });
      s += ln(160, 112, p[0].toFixed(1), p[1].toFixed(1), { sw: 3 });
    });
    pts.forEach(p => { s += ci(p[0].toFixed(1), p[1].toFixed(1), 16, '#ffffff'); });
    s += ci(160, 112, 18, '#ffffff');
    return svgWrap(320, 224, s);
  }

  // Pascal's triangle rows 0..5 in full and row 6 with the middle entry hidden
  function pascalSvg() {
    let s = '';
    for (let r = 0; r <= 6; r++) {
      for (let k = 0; k <= r; k++) {
        let v = 1;
        for (let i = 1; i <= k; i++) v = v * (r - k + i) / i;
        const x = 160 + (k - r / 2) * 42, y = 24 + r * 30;
        const hide = r === 6 && k === 3;
        s += tx(x, y, hide ? '?' : v, { size: hide ? 20 : 15, weight: hide ? 'bold' : 'normal', fill: hide ? '#b45309' : INK });
      }
    }
    return svgWrap(320, 216, s);
  }

  // The 15 puzzle: rows is a 4x4 array of tile numbers (0 = empty)
  function fifteenSvg(rows) {
    const s = gridSvg(4, 4, 40, 80, 4, (r, c) => {
      const v = rows[r][c];
      return v ? { fill: '#ffe8a3', text: v, size: 19, bold: true } : { fill: '#e5e7eb' };
    });
    return svgWrap(320, 192, s + tx(160, 186, 'the grey square is empty', { size: 13 }));
  }

  // Chessboard with rank and file labels; marks(r, c) may return { fill, text, bold }; r = 0 is rank 8
  function chessSvg(marks) {
    let s = gridSvg(8, 8, 24, 72, 6, (r, c) => {
      const o = marks(r, c) || {};
      return { fill: o.fill || ((r + c) % 2 ? '#94a3b8' : '#f1f5f9'), text: o.text, size: 15, bold: o.bold };
    });
    for (let i = 0; i < 8; i++) {
      s += tx(72 + i * 24 + 12, 214, 'abcdefgh'[i], { size: 14 });
      s += tx(59, 6 + i * 24 + 17, 8 - i, { size: 14 });
    }
    return svgWrap(320, 220, s);
  }

  // A closed room with a bulb and three switches A, B, C
  function switchesSvg() {
    let s = '';
    ['A', 'B', 'C'].forEach((n, i) => {
      const x = 22 + i * 62;
      s += rc(x, 40, 46, 76, '#e5e7eb', { rx: 6 }) + rc(x + 10, 52, 26, 24, '#374151', { rx: 3 });
      s += tx(x + 23, 142, n, { size: 18, weight: 'bold' });
    });
    s += rc(214, 22, 88, 110, '#fef3c7', { sw: 3 }) + tx(258, 16, 'closed room', { size: 14, weight: 'bold' });
    s += ci(258, 66, 15, '#ffe08a') + rc(250, 82, 16, 12, '#9ca3af', { sw: 2 }) + tx(258, 118, 'one bulb', { size: 13 });
    return svgWrap(320, 152, s);
  }

  // A chain of numbered links
  function chainSvg(n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const cx = 36 + i * 41;
      s += '<ellipse cx="' + cx + '" cy="66" rx="23" ry="15" fill="#fde68a" stroke="' + INK + '" stroke-width="3"/>';
      s += '<ellipse cx="' + cx + '" cy="66" rx="10" ry="6" fill="#ffffff" stroke="' + INK + '" stroke-width="1.5"/>';
      s += tx(cx, 104, i + 1, { size: 15, weight: 'bold' });
    }
    return svgWrap(320, 122, s);
  }

  // A round pizza cut by three straight lines into 7 pieces
  function pizzaSvg() {
    const cx = 160, cy = 105, R = 88;
    let s = ci(cx, cy, R, '#fde68a', { sw: 3 });
    [[0, 35], [120, 35], [240, 35]].forEach(([deg, d]) => {
      const th = deg * Math.PI / 180, nx = -Math.sin(th), ny = Math.cos(th), dx = Math.cos(th), dy = Math.sin(th);
      const px = cx + d * nx, py = cy + d * ny, t = Math.sqrt(R * R - d * d);
      s += ln((px - dx * t).toFixed(1), (py - dy * t).toFixed(1), (px + dx * t).toFixed(1), (py + dy * t).toFixed(1), { sw: 3 });
    });
    return svgWrap(320, 212, s);
  }

  registerPuzzles('classic', [
    // ===== Monty Hall and probability =====
    {
      q: 'Three doors hide one car and two goats. You pick Door 1. The host, who knows where the car is, opens Door 3 (a goat) and offers you a switch to Door 2. What gives the best chance of winning the car?',
      a: 'Switch: wins the car 2 times out of 3',
      w: ['Stay: wins the car 2 times out of 3', 'No difference: it is 50/50', 'Switch: raises 1/3 to 1/2'],
      why: 'This is the Monty Hall problem. Your first pick is right only 1/3 of the time, and the host opening a goat door does not change that. So the car is behind the other closed door with probability 2/3.',
      bloom: 'Evaluate', diagram: montyDoors()
    },
    {
      q: 'Monty Hall with 100 doors: one hides a car. You pick a door. The host, who knows where the car is, opens 98 of the other doors, all showing goats, leaving your door and one other door closed. What is the probability that the car is behind that other closed door?',
      a: '99/100', w: ['1/2', '1/100', '98/100'],
      why: 'Your first pick had only a 1/100 chance of being right, and that stays true. All the remaining probability, 99/100, is squeezed onto the one other door the host left closed.',
      bloom: 'Apply'
    },
    {
      q: 'Bertrand\'s box puzzle: three boxes each hold two coins. One box has two gold coins, one has two silver coins, and one has a gold and a silver coin. You pick a box at random and draw out one coin without looking at the other. It is gold. What is the chance that the other coin in the same box is also gold?',
      a: '2/3', w: ['1/2', '1/3', '3/4'],
      why: 'There are three gold coins you could have drawn. Two of them sit in the gold-gold box (their partner is gold) and only one sits in the mixed box. So the other coin is gold in 2 of the 3 equally likely cases.',
      bloom: 'Analyze'
    },
    // ===== Tower of Hanoi =====
    {
      q: 'Tower of Hanoi: 4 discs sit on peg A, biggest at the bottom. Move the whole stack to peg C, one disc at a time, never putting a bigger disc on top of a smaller one (peg B may be used). What is the fewest number of moves?',
      n: 15,
      why: 'For n discs the minimum is 2<sup>n</sup> − 1: move n−1 discs away, move the biggest, move n−1 discs back on top. The counts go 1, 3, 7, 15, so 4 discs need 15 moves.',
      bloom: 'Apply', diagram: hanoiSvg([[4, 3, 2, 1], [], []])
    },
    {
      q: 'Three discs start on peg A and must end on peg C (peg B is spare). To finish in the fewest possible moves, where must the smallest disc go on the very first move?',
      a: 'Peg C', w: ['Peg B', 'Either peg: both finish in 7 moves', 'The smallest disc must wait until the end'],
      why: 'The smallest disc moves every other move and always circles in the same direction. With an odd number of discs, the first move goes straight to the target peg (A to C, then C to B, then B to A, and so on), giving the 7-move solution.',
      bloom: 'Create', diagram: hanoiSvg([[3, 2, 1], [], []])
    },
    {
      q: 'Four discs start on peg A and must all end on peg C (peg B is spare). To finish in the fewest possible moves (15), where should the smallest disc go on the very first move?',
      a: 'Peg B', w: ['Peg C', 'Either peg: both can finish in 15 moves', 'The smallest disc must stay put until the end'],
      why: 'With an even number of discs the pattern flips: the smallest disc heads for the spare peg first. Since the shortest solution is unique, starting with the smallest disc to peg C would cost extra moves.',
      bloom: 'Create'
    },
    {
      q: 'Tower of Hanoi with FOUR pegs instead of three: move a stack of 4 discs from the first peg to the last, same rules. What is the fewest number of moves?',
      n: 9,
      why: 'Park the top 2 discs on a spare peg (3 moves, using the extra peg), move the 2 bigger discs across using the remaining three pegs (3 moves), then bring the 2 small discs on top (3 moves). A computer search confirms 9 is the minimum.',
      bloom: 'Analyze'
    },
    // ===== Wolf, goat and cabbage =====
    {
      q: 'A farmer must ferry a wolf, a goat and a cabbage across a river in a boat that carries the farmer and only ONE of them at a time. Left alone without the farmer, the wolf eats the goat and the goat eats the cabbage. What is the fewest number of river crossings (each trip in either direction counts as one)?',
      n: 7,
      why: 'Goat over, back alone, wolf over, goat back, cabbage over, back alone, goat over. That is 7 crossings, and nothing shorter keeps everything safe.',
      bloom: 'Apply', diagram: banksSvg(['Farmer', 'Wolf', 'Goat', 'Cabbage'], [], true, 'holds 1 item')
    },
    {
      q: 'In the farmer, wolf, goat and cabbage crossing, what must the farmer take across on the very first trip?',
      a: 'The goat', w: ['The wolf', 'The cabbage', 'Nothing: he goes alone'],
      why: 'Whatever is left behind must be safe. Leaving wolf and goat, or goat and cabbage, means something gets eaten. Only the goat can be taken, which leaves the wolf and cabbage together harmlessly.',
      bloom: 'Create'
    },
    {
      q: 'In the wolf, goat and cabbage crossing, which passenger rides in the boat the most times in a shortest (7-trip) solution?',
      a: 'The goat (3 of the 7 trips)', w: ['The wolf', 'The cabbage', 'They all ride the same number of times'],
      why: 'The goat goes over, comes back so it is not left with the wolf or the cabbage, and goes over again: 3 trips. The wolf and cabbage each ride only once.',
      bloom: 'Analyze'
    },
    // ===== Missionaries and cannibals, jealous husbands =====
    {
      q: 'Three missionaries and three cannibals must cross a river in a boat that holds at most 2 people (at least 1 must row). On either bank, the cannibals may never outnumber the missionaries unless there are no missionaries there. What is the fewest number of crossings?',
      n: 11,
      why: 'This is the classic Missionaries and Cannibals puzzle. A search of all safe states shows the shortest solution takes 11 crossings, mixing pairs and single passengers so that neither bank ever has cannibals outnumbering missionaries.',
      bloom: 'Apply', diagram: banksSvg(['M M M', 'C C C'], [], true, 'holds 2')
    },
    {
      q: 'Now four missionaries and four cannibals must cross with the same rules, in a boat that still holds only 2 people. What is the situation?',
      a: 'It is impossible', w: ['It can be done in 13 crossings', 'It can be done in 15 crossings', 'It can be done in 17 crossings'],
      why: 'With three of each the boat for two just works, but with four of each every possible sequence of crossings eventually leaves missionaries outnumbered. A full search of all the safe states finds no way across at all.',
      bloom: 'Evaluate'
    },
    {
      q: 'Jealous husbands: three married couples must cross a river in a boat that holds two people. No woman may ever be in the company of another man unless her own husband is present too (on a bank or in the boat). What is the fewest number of crossings?',
      n: 11,
      why: 'Checking every allowed arrangement of the six people shows the shortest safe plan has 11 crossings. (With four couples and a two-person boat, it cannot be done.)',
      bloom: 'Analyze'
    },
    // ===== Bridge and torch =====
    {
      q: 'Four people must cross a narrow bridge at night with one torch. The bridge holds at most 2 people at once, and the torch must be carried on every crossing. They need 1, 2, 5 and 10 minutes to cross alone, and a pair goes at the slower person\'s pace. What is the least total time for everyone to cross?',
      n: 17,
      why: 'Send 1 and 2 (2 min), 1 returns (1), send 5 and 10 together (10), 2 returns (2), send 1 and 2 again (2). Total 2 + 1 + 10 + 2 + 2 = 17. The trick is to send the two slowest walkers together.',
      bloom: 'Apply', diagram: torchSvg([1, 2, 5, 10])
    },
    {
      q: 'In the fastest plan for the 1, 2, 5 and 10 minute walkers (17 minutes in total), which two people cross together on the very first trip?',
      a: 'The 1-minute and 2-minute walkers', w: ['The 5-minute and 10-minute walkers', 'The 1-minute and 10-minute walkers', 'The 1-minute and 5-minute walkers'],
      why: 'The two fastest cross first (2 min), then the fastest brings the torch back. Starting with 1 and 5, or 1 and 10, costs 5 or 10 minutes at once and cannot get down to 17.',
      bloom: 'Create'
    },
    {
      q: 'Sam says: "The quickest way is to let the 1-minute walker escort each of the others across, walking back with the torch every time." For walkers of 1, 2, 5 and 10 minutes, is Sam right?',
      a: 'No: his plan takes 19 minutes but 17 is possible', w: ['Yes: it takes 17 minutes, the fastest possible', 'Yes: it takes 19 minutes, the fastest possible', 'No: his plan takes 21 minutes but 17 is possible'],
      why: 'Escorting costs 2 + 1 + 5 + 1 + 10 = 19 minutes. Sending the two slowest walkers together (5 and 10) so their times overlap saves 2 minutes, giving 17.',
      bloom: 'Evaluate'
    }
  ]);

  registerPuzzles('classic', [
    // ===== Water jugs =====
    {
      q: 'You have an unmarked 3-litre jug, an unmarked 5-litre jug and a tap with a drain. You need exactly 4 litres in one jug. Each filling, emptying or pouring counts as one step (a pour goes on until the pouring jug is empty or the receiving jug is full). What is the fewest number of steps?',
      n: 6,
      why: 'Fill the 5 (1), pour into the 3 leaving 2 in the 5 (2), empty the 3 (3), pour the 2 into the 3 (4), fill the 5 again (5), top up the 3 jug with 1 litre from the 5 (6). The 5-litre jug now holds exactly 4.',
      bloom: 'Apply', diagram: jugsSvg([3, 5], [0, 0], 22)
    },
    {
      q: 'With the 3-litre and 5-litre jugs, you want exactly 4 litres. Which first step leads to the quickest solution?',
      a: 'Fill the 5-litre jug: 6 steps in total', w: ['Fill the 3-litre jug: 6 steps in total', 'Fill the 3-litre jug: 5 steps in total', 'Either first step gives the same number of steps'],
      why: 'Starting by filling the 5-litre jug gives the 6-step route. Starting by filling the 3-litre jug also works, but the shortest route from there takes 8 steps.',
      bloom: 'Create'
    },
    {
      q: 'Split 8 litres of juice equally, using the full 8-litre jug and two empty unmarked jugs of 5 and 3 litres. You may only pour from one jug into another, until the source is empty or the target is full. What is the fewest number of pours to get 4 litres in the 8-litre jug and 4 litres in the 5-litre jug?',
      n: 7,
      why: 'One shortest route: 8-5-3 becomes 3-5-0, 3-2-3, 6-2-0, 6-0-2, 1-5-2, 1-4-3, 4-4-0. That is 7 pours, and a search of every possibility shows it cannot be done in fewer.',
      bloom: 'Analyze', diagram: jugsSvg([8, 5, 3], [8, 0, 0], 16)
    },
    {
      q: 'You have unmarked jugs of 4 litres and 6 litres, a tap and a drain. Can you measure exactly 5 litres?',
      a: 'No: every amount you can measure is even', w: ['Yes, in 6 steps', 'Yes, in 8 steps', 'Yes, but only with a third jug'],
      why: 'Every fill, empty or pour changes amounts by multiples of 2, since both jug sizes are even. So only even amounts (0, 2, 4, 6) can ever appear, and 5 is impossible. A target must be a multiple of the greatest common divisor of the jug sizes.',
      bloom: 'Evaluate'
    },
    // ===== Weighing puzzles =====
    {
      q: 'Nine balls look identical, but one is slightly heavier than the rest. You have a two-pan balance scale and no weights. What is the fewest number of weighings that is guaranteed to find the heavy ball?',
      n: 2,
      why: 'Each weighing has three outcomes (left heavy, right heavy, level), so it can split the suspects into three groups. 9 balls become 3, then 1. Two weighings are enough, and one is not (three outcomes cannot pick from 9).',
      bloom: 'Apply'
    },
    {
      q: 'Of nine balls, one is heavier. You weigh 3 balls against 3 others, and the scale stays level (see the picture). How many more weighings do you need to be sure which ball is the heavy one?',
      n: 1,
      why: 'A level scale means the heavy ball is not on the pans, so it is one of the 3 balls set aside. Weigh two of them against each other: the heavier one is the culprit, and if they balance it is the third.',
      bloom: 'Understand', diagram: balanceSvg(3, 3, 3, 'level')
    },
    {
      q: 'Among 27 coins, one is a slightly heavier fake. With a two-pan balance scale, what is the fewest number of weighings that is guaranteed to find the fake?',
      n: 3,
      why: 'Each weighing cuts the suspects to a third: 27, then 9, then 3, then 1. That needs 3 weighings, since 27 = 3 × 3 × 3.',
      bloom: 'Apply'
    },
    {
      q: 'Twelve coins look identical, but one fake is either heavier or lighter than the rest (you do not know which). What is the fewest number of weighings on a two-pan balance that is guaranteed to find the fake AND tell whether it is heavy or light?',
      n: 3,
      why: 'There are 24 possibilities (12 coins, each heavy or light) but two weighings give only 9 outcomes, so 3 weighings are needed. The classic solution weighs 4 coins against 4 first, and a search of all strategies confirms that 3 is enough.',
      bloom: 'Analyze'
    },
    {
      q: 'Twelve coins, one fake that is heavier or lighter. You weigh 4 coins against 4 others and the scale balances. What do you learn?',
      a: 'The fake is among the 4 coins not weighed', w: ['The fake is among the 8 weighed coins', 'The fake must be the lighter kind', 'You learn nothing new'],
      why: 'If a fake were on the pans, the scale would tip, so a level scale means all 8 coins on it are genuine. The fake is among the 4 coins left off, and the 8 genuine coins can now serve as references.',
      bloom: 'Understand', diagram: balanceSvg(4, 4, 4, 'level')
    },
    {
      q: 'Bachet\'s weights puzzle: a merchant wants to weigh any whole number of kilograms from 1 to 40 on a balance scale, and may put weights on BOTH pans. Which set of four weights (in kg) does the job?',
      a: '1, 3, 9 and 27', w: ['1, 2, 4 and 8', '1, 4, 10 and 20', '1, 3, 6 and 10'],
      why: 'Each weight can go on the object\'s pan (subtract), the other pan (add) or stay off, so each weight gives three choices. Weights that are powers of 3 (1, 3, 9, 27) reach every integer from 1 to 40; a computer check shows the other sets miss some weights.',
      bloom: 'Create'
    },
    // ===== Egg drop =====
    {
      q: 'Egg drop: you have 2 identical eggs and a 100-storey building. There is some highest floor from which an egg survives a drop, and an egg that survives can be reused. What is the fewest number of drops that is guaranteed to find that floor, even in the worst case?',
      n: 14,
      why: 'Drop the first egg from floors 14, 27, 39, 50, … (the jumps shrink by 1) so that the worst case is always 14 drops. It works because 14 + 13 + 12 + … + 1 = 105, which is at least 100.',
      bloom: 'Analyze'
    },
    {
      q: 'In the 2-egg, 100-storey egg-drop puzzle, the standard plan drops the first egg from floor 14, and then makes each next jump one floor smaller (13, 12, 11, …) as long as the egg survives. From which floor is the fifth drop of the first egg?',
      n: 60,
      why: 'The floors are 14, 14 + 13 = 27, 27 + 12 = 39, 39 + 11 = 50, and 50 + 10 = 60. Shrinking the jumps keeps the worst-case count the same however soon the first egg breaks.',
      bloom: 'Apply'
    },
    {
      q: 'Now you have 3 identical eggs and the same 100-storey building. What is the fewest number of drops that is guaranteed to find the highest safe floor in the worst case?',
      n: 9,
      why: 'With d drops and 3 eggs you can cover d + d(d−1)/2 + d(d−1)(d−2)/6 floors. That is 92 floors for d = 8 (too few) and 129 for d = 9, so 9 drops are needed and enough for 100 floors.',
      bloom: 'Analyze'
    },
    // ===== Josephus problem =====
    {
      q: 'Josephus problem, small version: seven people stand in a circle numbered 1 to 7. Starting with person 1, they count around the circle, and every second person (2, then 4, then 6, and so on, continuing around) is removed. Who is the last person left?',
      n: 7,
      why: 'The order of removal is 2, 4, 6, 1, 5, 3. Person 7 is left standing.',
      bloom: 'Apply', diagram: ringSvg(7)
    },
    {
      q: 'The original Josephus story: 41 soldiers stand in a circle numbered 1 to 41. Counting starts at 1, and every THIRD person (3, 6, 9, …) is removed, with counting going on around the circle. Which starting position survives to the end?',
      n: 31,
      why: 'Simulating the circle (or using the recursion J(n) = (J(n−1) + 3) mod n, counted from 0) shows that position 31 is the last one standing. In the legend Josephus placed himself there.',
      bloom: 'Apply'
    },
    {
      q: 'One hundred people stand in a circle numbered 1 to 100, and every SECOND person is removed (2, 4, 6, …, and on around the circle). Who is the last survivor? (Hint: after the first lap, the circle looks like a smaller version of the same puzzle.)',
      n: 73,
      why: 'If the circle has 2<sup>k</sup> + r people, the survivor is 2r + 1. Here 100 = 64 + 36, so the survivor is 2 × 36 + 1 = 73.',
      bloom: 'Analyze'
    }
  ]);

  registerPuzzles('classic', [
    // ===== Seven Bridges of Konigsberg =====
    {
      q: 'Seven Bridges of K&ouml;nigsberg: A is an island and each line is a bridge. Can you cross every bridge exactly once, starting and finishing anywhere?',
      a: 'No: all four areas have 3 or 5 bridges', w: ['Yes: start on the island A', 'No: seven is an odd number', 'Yes: any start works with a plan'],
      why: 'Euler showed that a walk using every bridge once can have at most two land areas with an odd number of bridges (the start and the finish). Here A has 5 bridges and B, C, D have 3 each, so all four are odd, and no such walk exists.',
      bloom: 'Understand', diagram: konigsbergSvg()
    },
    {
      q: 'In the K&ouml;nigsberg picture, what is the fewest number of NEW bridges (between any two land areas) that would make a walk crossing every bridge exactly once possible?',
      n: 1,
      why: 'A walk over every bridge once needs at most two land areas with an odd number of bridges. One new bridge between two of the odd areas (say B and C) makes both even, leaving only A and D odd, so a walk from A to D works.',
      bloom: 'Create', diagram: konigsbergSvg()
    },
    // ===== Fibonacci's rabbits =====
    {
      q: 'Fibonacci\'s rabbits: you start with one newborn pair of rabbits. A pair becomes able to breed when it is 2 months old, and from then on it produces one new pair every month. No rabbits ever die. How many pairs are there after 10 months?',
      n: 89,
      why: 'The counts are 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89. Each month\'s total is the sum of the previous two months (this month\'s adults are last month\'s total, and the newborns equal the pairs from two months ago). After 10 months there are 89 pairs.',
      bloom: 'Apply'
    },
    // ===== Birthday paradox =====
    {
      q: 'The birthday paradox: ignoring leap years and assuming all 365 birthdays are equally likely, what is the smallest number of people in a room for which the chance that at least two share a birthday is more than 50%?',
      n: 23,
      why: 'Multiply the chances that everyone so far has a different birthday: (364/365) × (363/365) × … . For 23 people this product is about 0.493, so the chance of a match is about 50.7%. For 22 people it is only about 47.6%.',
      bloom: 'Apply'
    },
    {
      q: 'The surprising size of the birthday paradox comes from counting pairs. How many different pairs of people can be formed from a group of 23?',
      n: 253,
      why: 'Each of the 23 people pairs with 22 others, and each pair is counted twice, so 23 × 22 ÷ 2 = 253 pairs. Each pair has a 1/365 chance of a shared birthday, and 253 chances add up quickly.',
      bloom: 'Apply'
    },
    // ===== Wheat and the chessboard =====
    {
      q: 'Sissa and the chessboard: square 1 gets 1 grain of wheat, square 2 gets 2, square 3 gets 4, doubling each time. Squares are numbered row by row. How many grains go on the shaded square 20?',
      n: 524288,
      why: 'Square n holds 2<sup>n−1</sup> grains, so square 20 holds 2<sup>19</sup> = 524,288 grains. Doubling grows extremely fast.',
      bloom: 'Apply', diagram: wheatSvg()
    },
    {
      q: 'In the wheat-and-chessboard story, the last square (square 64) holds 2<sup>63</sup> grains. How does that compare with the total on squares 1 to 63 combined?',
      a: 'Square 64 has exactly 1 grain more', w: ['Square 64 has exactly twice as many', 'Square 64 has about half as many', 'Square 64 has exactly the same number'],
      why: 'Squares 1 to 63 add up to 1 + 2 + 4 + … + 2<sup>62</sup> = 2<sup>63</sup> − 1. So the last square alone holds one grain more than all the earlier squares together.',
      bloom: 'Analyze'
    },
    // ===== Zeno =====
    {
      q: 'Zeno\'s dichotomy paradox: to walk 1 metre you must first walk half a metre, then a quarter, then an eighth, and so on with endless smaller steps. What is the total length of all these steps added together?',
      a: 'Exactly 1 metre', w: ['Infinitely many metres', '2 metres', 'It cannot be added up at all'],
      why: 'The endless sum 1/2 + 1/4 + 1/8 + … gets closer and closer to 1 and equals exactly 1. Infinitely many steps can still have a finite total, so you do arrive.',
      bloom: 'Understand'
    },
    {
      q: 'Achilles and the tortoise: Achilles runs at 10 m/s and the tortoise crawls at 1 m/s. The tortoise starts 90 m ahead. After how many seconds does Achilles catch it?',
      n: 10,
      why: 'Achilles gains 10 − 1 = 9 metres every second, so he closes the 90 m gap in 90 ÷ 9 = 10 seconds. Zeno\'s infinite list of "catch-up" stages adds up to a finite time.',
      bloom: 'Apply'
    },
    // ===== Ants on a stick, two trains and a bee =====
    {
      q: 'Three ants stand on a 100 cm stick at the 20 cm, 50 cm and 70 cm marks. Each walks at 1 cm per second in the direction of its arrow. When two ants meet, both turn around at once and keep walking. An ant that reaches either end of the stick falls off. After how many seconds does the last ant fall off?',
      n: 80,
      why: 'Two ants that bounce off each other behave, as a group, exactly like two ants that walk straight through each other. So each ant\'s "ghost" simply walks to an end: 80 s for the 20 cm ant going right, 50 s, and 30 s. The last exit is at 80 seconds.',
      bloom: 'Analyze', diagram: stickSvg([[20, 1], [50, -1], [70, 1]])
    },
    {
      q: 'Two trains are 60 km apart on the same track, driving toward each other at 30 km/h each. A bee starts at the front of one train and flies back and forth between the trains at 60 km/h until they meet. How many kilometres does the bee fly in total?',
      n: 60,
      why: 'The trains close the gap at 30 + 30 = 60 km/h, so they meet after 1 hour. The bee flies for that whole hour at 60 km/h: 60 km. No need to add up the zig-zags.',
      bloom: 'Apply', diagram: trainsSvg()
    },
    // ===== Two guards, hats =====
    {
      q: 'Two doors: one leads to freedom, one to a dragon. One guard always tells the truth, the other always lies (you don\'t know which). You may ask ONE guard ONE question. Which question always finds the safe door?',
      a: '"Which door would the other guard call safe?" Then go the other way', w: ['"Are you the truthful guard?"', '"Which door is safe?" Then go there', '"Does the other guard lie?"'],
      why: 'Ask either guard what the other guard would say. The truthful guard reports the liar\'s wrong answer; the liar lies about the truthful guard\'s right answer. Either way you hear the WRONG door, so choose the other one.',
      bloom: 'Create', diagram: guardsSvg()
    },
    {
      q: 'The same two guards (one always truthful, one always lying). You ask one guard: "If I asked the other guard whether Door 1 leads to freedom, what would he say?" The guard answers "No." Which door is safe?',
      a: 'Door 1', w: ['Door 2', 'Neither door', 'You cannot tell without knowing which guard you asked'],
      why: 'If Door 1 is safe, the truthful guard says the liar would say "no", and the liar guard falsely says the truthful one would say "no". So Door 1 safe gives "no" from either guard. If Door 1 were the dragon door, you would hear "yes". So "no" means Door 1 is safe.',
      bloom: 'Analyze'
    },
    {
      q: 'One hundred prisoners stand in a line, each wearing a black or white hat. Each can see the hats of everyone in front of him, but not his own. Starting from the back, each prisoner calls out "black" or "white", and is freed if right. They may agree a plan beforehand. What is the largest number of prisoners they can guarantee to free?',
      a: '99', w: ['100', '75', '50'],
      why: 'The back prisoner announces "black" if he sees an even number of black hats, otherwise "white". Everyone else, listening and seeing the hats ahead, can work out their own hat from that parity. Only the first prisoner takes a 50-50 risk, and he cannot do better because he has no information.',
      bloom: 'Evaluate'
    },
    {
      q: 'Three prisoners A, B, C stand in a line facing a wall (A at the back), each wearing a hat taken from 3 white and 2 black hats. Each sees only the hats ahead. A says "I cannot tell my colour." Then B says "I cannot tell mine either." What colour is C\'s hat?',
      a: 'White', w: ['Black', 'The same colour as B\'s hat', 'It cannot be determined'],
      why: 'If B and C both had black hats, A would see two blacks and know his own is white. So A\'s "I don\'t know" means B and C are not both black. If C were black, B would see it and know his own hat must be white; since B does not know, C\'s hat is white.',
      bloom: 'Analyze', diagram: hatsSvg()
    },
    // ===== Mini zebra puzzle =====
    {
      q: 'A mini Einstein zebra puzzle. Three houses stand in a row, left to right, painted red, blue and green. Each has a different pet (cat, dog, fish) and a different drink (tea, milk, juice).<br>1) The green house is at the right end.<br>2) The milk drinker lives in the middle house.<br>3) The cat lives in the red house.<br>4) The dog\'s owner drinks tea.<br>5) The fish lives in the house immediately to the left of the dog.<br>Which colour house has the fish?',
      a: 'Blue', w: ['Red', 'Green', 'It cannot be determined'],
      why: 'Clues 1 and 2 put green on the right and milk in the middle. So tea and juice are at the two ends. The dog drinks tea (clue 4), so it lives in an end house, and clue 5 needs a house on its left, so the dog is on the right end and the fish is in the middle. The cat is then on the left, and clue 3 makes that house red, leaving blue for the middle house with the fish.',
      bloom: 'Analyze'
    }
  ]);

  registerPuzzles('classic', [
    // ===== Famous quick riddles with arithmetic =====
    {
      q: 'A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How many cents does the ball cost?',
      n: 5,
      why: 'If the ball costs x cents, the bat costs x + 100, so x + (x + 100) = 110. Then 2x = 10 and x = 5. (The tempting answer of 10 cents would make the bat $1.10 and the total $1.20.)',
      bloom: 'Understand'
    },
    {
      q: 'Lily pads on a pond double their covered area every day. It takes 48 days for them to cover the whole pond. On which day is exactly half the pond covered?',
      n: 47,
      why: 'Because the area doubles each day, the day before it is full it was half full. So the pond is half covered on day 47.',
      bloom: 'Understand'
    },
    {
      q: 'Five machines take 5 minutes to make 5 widgets. How many minutes would 100 machines need to make 100 widgets (all machines working at the same steady rate)?',
      n: 5,
      why: 'Each machine makes 1 widget in 5 minutes. So 100 machines make 100 widgets in the same 5 minutes.',
      bloom: 'Apply'
    },
    {
      q: 'The missing dollar: three friends pay $30 for a hotel room, but it only costs $25. The bellboy returns $5 but keeps $2 and gives each friend $1 back. Now each friend paid $9, so $27 in total, and the bellboy has $2 (that is $29). Where did the other dollar go?',
      a: 'Nowhere: the $27 already includes the bellboy\'s $2, so adding it again is the mistake', w: ['The bellboy actually kept $3', 'The hotel owes the friends one more dollar', 'The room really cost $26'],
      why: 'The $27 the friends paid is made of $25 for the room and $2 kept by the bellboy. Adding the $2 again is meaningless. The correct check: $27 paid − $2 kept = $25 room, or $25 + $2 + $3 returned = $30.',
      bloom: 'Evaluate'
    },
    {
      q: 'The young Gauss was asked to add 1 + 2 + 3 + … + 100. What is the sum?',
      n: 5050,
      why: 'Pair the numbers from opposite ends: 1 + 100, 2 + 99, 3 + 98, … Each pair adds to 101, and there are 50 pairs, so the sum is 50 × 101 = 5050.',
      bloom: 'Apply'
    },
    {
      q: 'A hallway has 100 closed lockers. Student 1 opens every locker. Student 2 changes (opens or closes) every 2nd locker, student 3 changes every 3rd locker, and so on up to student 100, who changes only locker 100. How many lockers are open at the end?',
      n: 10,
      why: 'Locker n is changed once for each of its divisors. Divisors usually come in pairs, so the locker ends up closed, except when n is a perfect square (one divisor is paired with itself). The open lockers are 1, 4, 9, …, 100: ten of them.',
      bloom: 'Analyze'
    },
    // ===== Sliding tiles and pancakes =====
    {
      q: 'Sam Loyd\'s 15 puzzle: the picture is the solved board except that tiles 14 and 15 are swapped. Tiles slide into the empty square. Can you reach the fully solved order 1 to 15?',
      a: 'No: it cannot be reached', w: ['Yes, in about 12 moves', 'Yes, but it needs 40+ moves', 'Yes: every board is solvable'],
      why: 'Each slide is a swap of the empty square with a tile, and with the empty square back in its corner the number of tile swaps must be even. Swapping just two tiles is an odd change, so it can never be undone by sliding. Loyd\'s offer of a prize for this was safe.',
      bloom: 'Evaluate', diagram: fifteenSvg([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 15, 14, 0]])
    },
    {
      q: 'Pancake sorting: a stack of four pancakes has sizes (top to bottom) 2, 4, 1, 3, where 1 is the smallest. One flip slides a spatula under any pancake and turns over that pancake and everything above it. What is the fewest number of flips that puts the stack in order, smallest on top and biggest at the bottom?',
      n: 4,
      why: 'A search of all flip sequences shows 4 flips are needed and enough: flip the top 2 (4, 2, 1, 3), flip the top 4 (3, 1, 2, 4), flip the top 3 (2, 1, 3, 4), flip the top 2 (1, 2, 3, 4). Three flips are not enough.',
      bloom: 'Analyze', diagram: pancakeSvg([2, 4, 1, 3])
    },
    {
      q: 'A stack of three pancakes has sizes (top to bottom) 3, 1, 2, where 1 is the smallest. A flip turns over the top k pancakes. Which two flips put the stack in order (smallest on top, biggest at the bottom)?',
      a: 'Flip the top 3, then flip the top 2', w: ['Flip the top 2, then flip the top 3', 'Flip the top 3 twice', 'Flip the top 2, then flip the top 2 again'],
      why: 'Flipping the top 3 turns 3, 1, 2 into 2, 1, 3, which puts the biggest pancake at the bottom. Flipping the top 2 then gives 1, 2, 3. Flipping the top 2 and then the top 3 ends at 2, 3, 1, and repeating the same flip twice just undoes it.',
      bloom: 'Create', diagram: pancakeSvg([3, 1, 2])
    },
    // ===== Collatz, handshakes, colouring, Pascal =====
    {
      q: 'The Collatz game: pick a whole number. If it is even, halve it; if it is odd, triple it and add 1. Repeat. Starting from 7, how many steps does it take to reach 1?',
      n: 16,
      why: 'The path is 7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1. That is 16 steps.',
      bloom: 'Apply'
    },
    {
      q: 'At a party of 7 people, each person claims to have shaken hands with exactly 3 others. Can this be true?',
      a: 'No: the total number of hand-ends would be 21, which is odd', w: ['Yes: everyone shakes hands with 3 different people', 'Yes, but only if two people shake hands twice', 'No: 7 people is too few for 3 handshakes each'],
      why: 'By the handshake lemma, each handshake has two ends, so the total of everyone\'s handshake counts must be even. Here 7 × 3 = 21 is odd, so the claim is impossible.',
      bloom: 'Evaluate'
    },
    {
      q: 'Four colour problem: in this map each circle is a country, and a line joins two countries that share a border. What is the fewest number of colours that lets you colour every country so that neighbours never match?',
      n: 4,
      why: 'The middle country touches all five outer countries, which form a ring of five. A ring of an odd length needs 3 colours by itself, and the middle country needs a fourth colour different from all of those.',
      bloom: 'Analyze', diagram: wheelSvg(5)
    },
    {
      q: 'In Pascal\'s triangle each number is the sum of the two numbers just above it. What is the missing number (?) in the bottom row?',
      n: 20,
      why: 'The two numbers above the "?" are 10 and 10 (row 5 is 1, 5, 10, 10, 5, 1), and 10 + 10 = 20. It is also the number of ways to choose 3 items from 6.',
      bloom: 'Understand', diagram: pascalSvg()
    }
  ]);

  registerPuzzles('classic', [
    // ===== Worst-case counting, calendars, switches =====
    {
      q: 'In a dark room a drawer holds 10 black socks and 10 white socks, all mixed up. What is the fewest number of socks you must pull out to be certain of having a matching pair?',
      n: 3,
      why: 'This is the pigeonhole principle. Two socks could be one black and one white, but a third sock must match one of them, since there are only two colours.',
      bloom: 'Analyze'
    },
    {
      q: 'The Gregorian calendar rule: a year is a leap year if it is divisible by 4, EXCEPT century years (like 1900), which must also be divisible by 400. Which of these years is NOT a leap year?',
      a: '2100', w: ['2000', '2024', '2400'],
      why: '2024 is divisible by 4, and 2000 and 2400 are century years divisible by 400. But 2100 is a century year that is not divisible by 400, so it is not a leap year.',
      bloom: 'Apply'
    },
    {
      q: 'Three switches A, B, C are outside a closed room, and one controls the ordinary (heat-giving) bulb inside. You may flip switches freely but can enter the room only once. Which plan finds the right switch for certain?',
      a: 'A on a while, then off; B on; enter. Lit = B, warm = A, cold = C', w: ['A and B on together; enter and see if it is lit', 'A on, others off; enter and see if it is lit', 'A on then off, B on then off, fast; enter'],
      why: 'A bulb gives two clues: light and heat. Leaving A on for a while and then off makes its bulb warm; B left on makes it lit; C untouched stays cold. Each switch produces a different state, so one visit is enough.',
      bloom: 'Create', diagram: switchesSvg()
    },
    // ===== Knowledge and logic classics =====
    {
      q: 'Cheryl\'s birthday: Cheryl gives Albert and Bernard ten possible dates: May 15, 16, 19; June 17, 18; July 14, 16; August 14, 15, 17. She tells Albert only the month and Bernard only the day.<br>Albert: "I don\'t know when Cheryl\'s birthday is, but I know that Bernard doesn\'t know either."<br>Bernard: "At first I didn\'t know, but now I do."<br>Albert: "Then I know too." When is Cheryl\'s birthday?',
      a: 'July 16', w: ['August 17', 'May 19', 'June 18'],
      why: 'Albert knows Bernard does not know, so the month has no unique day: this rules out May and June (19 and 18 appear only once), leaving July 14, 16 and August 14, 15, 17. Bernard now knows, so his day is not 14 (still two options), leaving July 16, August 15, August 17. Albert now knows, so the month is July, and the date is July 16.',
      bloom: 'Analyze'
    },
    // ===== Chessboard classics =====
    {
      q: 'A chess knight stands on a1 (bottom left). What is the fewest number of knight moves needed to reach h8 (top right)?',
      n: 6,
      why: 'One shortest route is a1, b3, c5, d7, f8, g6, h8, which is 6 moves. Each knight move changes the square colour, and a1 and h8 have the same colour, so the number of moves must be even; a search shows 4 moves cannot reach it.',
      bloom: 'Analyze', diagram: chessSvg((r, c) => (r === 7 && c === 0 ? { fill: '#bde0fe', text: 'N', bold: true } : r === 0 && c === 7 ? { fill: '#ffe08a', text: 'X', bold: true } : null))
    },
    {
      q: 'Mutilated chessboard: opposite corners a1 and h8 are cut off (62 squares left). Can 31 dominoes, each covering two neighbouring squares, cover the board exactly?',
      a: 'No: the colour counts are 32 and 30', w: ['Yes: 31 dominoes cover 62 squares', 'Yes, if you start in the middle', 'No: 62 is not a multiple of 4'],
      why: 'Opposite corners have the same colour, so removing both leaves 32 squares of one colour and 30 of the other. Every domino covers one dark and one light square, so 31 dominoes would cover 31 of each. A perfect cover is impossible.',
      bloom: 'Evaluate', diagram: chessSvg((r, c) => ((r === 7 && c === 0) || (r === 0 && c === 7) ? { fill: '#111827' } : null))
    },
    // ===== Classic stories =====
    {
      q: 'A father leaves 17 camels to his three sons: half to the eldest, a third to the middle son and a ninth to the youngest. A wise neighbour lends one camel, making 18. The sons take 9, 6 and 2 camels, and the neighbour takes back his own camel. Why does this trick work?',
      a: 'The three fractions add up to only 17/18, so the shares of 18 camels total 17 and leave one over', w: ['The three fractions add up to exactly 1, and 18 is just a convenient number', 'The neighbour secretly gives the sons an extra camel as a gift', 'Each son gets exactly the fraction of 17 that the will promised'],
      why: '1/2 + 1/3 + 1/9 = 9/18 + 6/18 + 2/18 = 17/18, which is less than a whole. So the will never gave away all the camels, and dividing 18 leaves exactly the one camel that was lent.',
      bloom: 'Understand'
    },
    {
      q: 'A traveller has a gold chain of 7 links (see the picture) and stays at an inn for 7 nights. He must pay exactly one link per night, settling up each morning, and the innkeeper may give change (links or pieces) back. Opening a link costs money. What is the fewest number of links he must cut open?',
      n: 1,
      why: 'Cut open only link 3, leaving pieces of 1, 2 and 4 links. Day 1: give the 1. Day 2: swap it for the 2. Day 3: give the 1 as well. Day 4: swap both for the 4. Days 5 to 7: add the 1, swap for the 2, add the 1 again. With no cut he could not even pay for the first night.',
      bloom: 'Create', diagram: chainSvg(7)
    },
    {
      q: 'The pizza problem (lazy caterer): a round pizza is cut by straight lines, and the picture shows 3 cuts making 7 pieces. What is the largest number of pieces that 4 straight cuts can make?',
      n: 11,
      why: 'The nth cut can cross all n − 1 earlier cuts, adding n new pieces. So the counts go 1, 2, 4, 7, 11, 16, … and 4 cuts give at most 11 pieces.',
      bloom: 'Analyze', diagram: pizzaSvg()
    },
    {
      q: 'Five logical, greedy pirates A, B, C, D, E (A the most senior) find 100 gold coins. A proposes how to split them, and all five vote, A included. If at least half vote yes, the split is used. Otherwise the proposer is thrown overboard and the next in seniority proposes. A pirate votes yes only if it gives him strictly more coins than he would otherwise get. How many coins can A keep and still get his plan accepted?',
      n: 98,
      why: 'Work backwards. With D and E left, D keeps all 100 (his own vote is enough). So with C, D, E, C offers E one coin and D none (99, 0, 1). With B, C, D, E, B gives D 1 coin and keeps 99. With five, A needs 3 votes: A buys C (1 coin) and E (1 coin) because they would get nothing otherwise. A keeps 98: (98, 0, 1, 0, 1).',
      bloom: 'Analyze'
    },
    {
      q: 'Diophantus\' epitaph says: his boyhood lasted 1/6 of his life, his beard grew after 1/12 more, and he married after another 1/7. A son was born 5 years later, who lived half as many years as his father, and Diophantus died 4 years after his son. How many years did Diophantus live?',
      n: 84,
      why: 'Let his age be x. The fractions 1/6 + 1/12 + 1/7 + 1/2 add up to 75/84 of his life. The remaining 5 + 4 = 9 years are the other 9/84 of his life, so x = 84.',
      bloom: 'Apply'
    },
    {
      q: 'Hilbert\'s Grand Hotel has infinitely many rooms, numbered 1, 2, 3, …, and every room is occupied. A new guest arrives. How can the manager give him a room without sending anyone away?',
      a: 'Move the guest in room n to room n + 1 for everyone; the new guest takes room 1', w: ['It is impossible: a full hotel has no space', 'Move the guest in room n to room n − 1 for everyone', 'Put the new guest in the last room'],
      why: 'Because the rooms never end, every guest can shift one room up, since room n + 1 always exists. Room 1 is then empty. There is no "last room" and no room 0.',
      bloom: 'Create'
    },
    {
      q: 'A snail is at the bottom of a 10 m well. Each day it climbs up 3 m, and each night it slips back 2 m. On which day does the snail first reach the top?',
      n: 8,
      why: 'Each full day-and-night gains only 1 m, so after 7 days the snail is at 7 m. On day 8 it climbs 3 m to reach 10 m and gets out before it can slip back.',
      bloom: 'Apply'
    },
    {
      q: 'Nim: there are three piles of 3, 4 and 5 stones. Two players alternately take any number of stones (at least one) from ONE pile, and whoever takes the last stone wins. You go first. Which move guarantees a win with perfect play?',
      a: 'Take 2 stones from the pile of 3', w: ['Take 1 stone from the pile of 5', 'Take all 4 stones from the pile of 4', 'Take 3 stones from the pile of 5'],
      why: 'Write the piles in binary: 3 = 011, 4 = 100, 5 = 101. Their XOR is 010, so the position is winning, and the move must make the XOR zero. Only reducing the 3 to 1 does that (1, 4, 5 has XOR 0). From then on you can always answer to keep the XOR at zero.',
      bloom: 'Create'
    },
    {
      q: 'Sun Tzu\'s ancient puzzle: a number leaves remainder 2 when divided by 3, remainder 3 when divided by 5, and remainder 2 when divided by 7. What is the smallest positive such number?',
      n: 23,
      why: 'Numbers with remainder 2 on division by both 3 and 7 are 2 more than a multiple of 21: 2, 23, 44, … Of these, 23 leaves remainder 3 on division by 5, and 2 does not.',
      bloom: 'Analyze'
    },
    {
      q: 'Chicken nuggets are sold in boxes of 6, 9 and 20. What is the largest number of nuggets you can NOT buy exactly using any combination of these boxes?',
      n: 43,
      why: 'The numbers 44 to 49 can all be made (44 = 4 × 6 + 20, 45 = 5 × 9, 46 = 20 + 20 + 6, 47 = 20 + 9 + 9 + 9, 48 = 8 × 6, 49 = 20 + 20 + 9). Six in a row means adding 6s reaches every larger number. But 43 fails: 6s and 9s make multiples of 3, and 43 − 20 = 23 and 43 − 40 = 3 are not makeable.',
      bloom: 'Analyze'
    }
  ]);

  registerPuzzles('classic', [
    {
      q: 'A ship floats in a harbour with a rope ladder hanging over its side. Exactly 3 rungs of the ladder are under water, and the rungs are 30 cm apart. Over the next four hours the tide rises by 1.2 metres. The ship floats freely and rises with the water. How many rungs are under water at the end?',
      n: 3,
      why: 'This is the old rope-ladder-and-tide riddle. The ship and its ladder rise together with the water, so the water stays at the same rung. Still 3 rungs are under water (a common wrong answer is 7).',
      bloom: 'Understand'
    },
    {
      q: 'A fair coin has landed heads five times in a row. What is the probability that the next flip is heads?',
      a: '1/2', w: ['1/64', 'Less than 1/2, because tails is "due"', 'More than 1/2, because the coin is on a streak'],
      why: 'This is the gambler\'s fallacy. A fair coin has no memory, so each flip is heads with probability 1/2 regardless of the past. (1/64 is the chance of six heads in a row before you start.)',
      bloom: 'Understand'
    },
    {
      q: 'The barber paradox: in a village, the barber (a man of the village) shaves exactly those men who do not shave themselves. Who shaves the barber?',
      a: 'Nobody can consistently: such a barber cannot exist', w: ['The barber shaves himself', 'Another man shaves the barber', 'The barber does not need to be shaved'],
      why: 'If the barber shaves himself, he breaks the rule "shaves only men who do not shave themselves". If he does not, the rule says he must shave himself. Both cases are contradictions, so no such barber can exist (a version of Russell\'s paradox).',
      bloom: 'Evaluate'
    }
  ]);
})();
