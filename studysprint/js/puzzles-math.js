(function () {
  // Puzzles: math — registerPuzzles('math', [ ... ]);

  // ---------- diagram helpers (own SVG builders; hard-coded colours, shown on a white panel) ----------
  const INK = '#111827';
  const LINE = '#374151';
  const HILITE = '#fde68a';
  const SOFT = '#e0e7ff';
  const FONT = 'font-family="Arial,Helvetica,sans-serif"';

  // Diagrams are capped at about 180px tall on screen so the whole question card fits without scrolling.
  function svg(w, h, inner) {
    const maxW = Math.min(280, Math.round(180 * w / h));
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" style="max-width:' + maxW + 'px">' + inner + '</svg>';
  }

  function txt(x, y, s, size, weight, fill, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" font-size="' + (size || 18) +
      '" font-weight="' + (weight || 500) + '" fill="' + (fill || INK) + '" ' + FONT + '>' + s + '</text>';
  }

  // Square grid of cells; '?' cells are highlighted, '' cells are blank. opts: cell, font, fills {'r,c': colour}
  function grid(rows, opts) {
    const o = opts || {};
    const cell = o.cell || 56, pad = 8, R = rows.length, C = rows[0].length;
    let s = '';
    rows.forEach(function (row, r) {
      row.forEach(function (v, k) {
        const x = pad + k * cell, y = pad + r * cell;
        const q = v === '?';
        const fill = q ? HILITE : ((o.fills && o.fills[r + ',' + k]) || '#ffffff');
        s += '<rect x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" fill="' + fill + '" stroke="' + LINE + '" stroke-width="2"/>';
        if (v !== '') s += txt(x + cell / 2, y + cell / 2 + (o.font || 22) * 0.35, v, o.font || 22, q ? 700 : 500);
      });
    });
    return svg(2 * pad + C * cell, 2 * pad + R * cell, s);
  }

  // Clock face showing given hour and minute angles (degrees clockwise from 12)
  function clockAngles(hDeg, mDeg, noNumbers) {
    const cx = 110, cy = 110;
    let s = '<circle cx="' + cx + '" cy="' + cy + '" r="102" fill="#ffffff" stroke="' + LINE + '" stroke-width="4"/>';
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0;
      const r1 = (noNumbers && i % 15 === 0) ? 78 : (big ? 90 : 95), r2 = 100;
      s += '<line x1="' + (cx + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (cy - r1 * Math.cos(a)).toFixed(1) +
        '" x2="' + (cx + r2 * Math.sin(a)).toFixed(1) + '" y2="' + (cy - r2 * Math.cos(a)).toFixed(1) +
        '" stroke="' + LINE + '" stroke-width="' + (big ? 2.5 : 1.5) + '"/>';
    }
    for (let n = 1; n <= 12 && !noNumbers; n++) {
      const a = n * 30 * Math.PI / 180;
      s += txt((cx + 72 * Math.sin(a)).toFixed(1), (cy - 72 * Math.cos(a) + 6).toFixed(1), n, 17, 700);
    }
    const hand = function (deg, len, w) {
      const a = deg * Math.PI / 180;
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + len * Math.sin(a)).toFixed(1) + '" y2="' + (cy - len * Math.cos(a)).toFixed(1) +
        '" stroke="' + INK + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    };
    s += hand(hDeg, 46, 7) + hand(mDeg, 68, 4);
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="' + INK + '"/>';
    return svg(220, 220, s);
  }
  function clock(h, m, noNumbers) { return clockAngles((h % 12) * 30 + m * 0.5, m * 6, noNumbers); }

  // Number pyramid: rows[0] is the top brick row; '?' is highlighted
  function pyramid(rows, opts) {
    const o = opts || {};
    const bw = o.bw || 56, bh = o.bh || 38, n = rows.length, W = n * bw + 16;
    let s = '';
    rows.forEach(function (row, i) {
      const total = row.length * bw, x0 = (W - total) / 2, y = 8 + i * bh;
      row.forEach(function (v, k) {
        const q = v === '?';
        s += '<rect x="' + (x0 + k * bw) + '" y="' + y + '" width="' + bw + '" height="' + bh + '" fill="' + (q ? HILITE : '#ffffff') + '" stroke="' + LINE + '" stroke-width="2"/>';
        if (v !== '') s += txt(x0 + k * bw + bw / 2, y + bh / 2 + 6, v, 19, q ? 700 : 500);
      });
    });
    return svg(W, n * bh + 16, s);
  }

  // Month calendar. start = weekday index of the 1st (0 = Sunday), days = length of month, hi = dates to shade.
  // opts.blank = draw no date numbers at all (just the weekday grid); opts.rows = force number of week rows
  function calendar(start, days, hi, opts) {
    const o = opts || {};
    const cw = 36, ch = 30, pad = 8, heads = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    let s = '';
    heads.forEach(function (d, i) { s += txt(pad + i * cw + cw / 2, pad + 20, d, 14, 700, '#4338ca'); });
    const rowsNeeded = o.rows || Math.ceil((start + days) / 7);
    for (let d = 1; d <= days; d++) {
      const idx = start + d - 1, r = Math.floor(idx / 7) + 1, c = idx % 7;
      if (r > rowsNeeded) break;
      const x = pad + c * cw, y = pad + r * ch + 6;
      const on = hi && hi.indexOf(d) >= 0;
      s += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" fill="' + (on ? HILITE : '#ffffff') + '" stroke="' + LINE + '" stroke-width="1.5"/>';
      if (!o.blank) s += txt(x + cw / 2, y + 20, d, 15, on ? 700 : 500);
    }
    return svg(2 * pad + 7 * cw, pad + (rowsNeeded + 1) * ch + 14, s);
  }

  // Number wheel: sectors listed clockwise from the top; '?' is highlighted
  function wheel(nums) {
    const cx = 110, cy = 110, R = 100, r0 = 24, n = nums.length;
    let s = '';
    for (let i = 0; i < n; i++) {
      const a0 = (i * 360 / n - 90) * Math.PI / 180, a1 = ((i + 1) * 360 / n - 90) * Math.PI / 180, am = (a0 + a1) / 2;
      const p = function (a, r) { return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1); };
      const q = nums[i] === '?';
      s += '<path d="M' + p(a0, r0) + ' L' + p(a0, R) + ' A' + R + ',' + R + ' 0 0 1 ' + p(a1, R) + ' L' + p(a1, r0) + ' A' + r0 + ',' + r0 + ' 0 0 0 ' + p(a0, r0) + ' Z" fill="' + (q ? HILITE : (i % 2 ? '#ffffff' : SOFT)) + '" stroke="' + LINE + '" stroke-width="2"/>';
      s += txt((cx + 66 * Math.cos(am)).toFixed(1), (cy + 66 * Math.sin(am) + 7).toFixed(1), nums[i], 20, q ? 700 : 600);
    }
    return svg(220, 220, s);
  }

  // Simple table: rows of strings, first row is a header
  function table(rows, widths, opts) {
    const o = opts || {};
    const rh = o.rh || 34, pad = 8;
    const total = widths.reduce(function (a, b) { return a + b; }, 0);
    let s = '';
    rows.forEach(function (row, r) {
      let x = pad;
      row.forEach(function (v, c) {
        const head = r === 0;
        s += '<rect x="' + x + '" y="' + (pad + r * rh) + '" width="' + widths[c] + '" height="' + rh + '" fill="' + (head ? SOFT : (v === '?' ? HILITE : '#ffffff')) + '" stroke="' + LINE + '" stroke-width="2"/>';
        s += txt(x + widths[c] / 2, pad + r * rh + rh / 2 + 6, v, o.font || 17, head || v === '?' ? 700 : 500);
        x += widths[c];
      });
    });
    return svg(2 * pad + total, 2 * pad + rows.length * rh, s);
  }

  // Lattice of points for path counting
  function lattice(cols, rows) {
    const g = 46, pad = 30;
    let s = '';
    for (let i = 0; i <= cols; i++) s += '<line x1="' + (pad + i * g) + '" y1="' + pad + '" x2="' + (pad + i * g) + '" y2="' + (pad + rows * g) + '" stroke="' + LINE + '" stroke-width="2"/>';
    for (let j = 0; j <= rows; j++) s += '<line x1="' + pad + '" y1="' + (pad + j * g) + '" x2="' + (pad + cols * g) + '" y2="' + (pad + j * g) + '" stroke="' + LINE + '" stroke-width="2"/>';
    s += '<circle cx="' + pad + '" cy="' + (pad + rows * g) + '" r="8" fill="#4338ca"/>';
    s += '<circle cx="' + (pad + cols * g) + '" cy="' + pad + '" r="8" fill="#b91c1c"/>';
    s += txt(pad - 2, pad + rows * g + 26, 'A', 18, 700, '#4338ca');
    s += txt(pad + cols * g + 2, pad - 12, 'B', 18, 700, '#b91c1c');
    return svg(2 * pad + cols * g, 2 * pad + rows * g + 10, s);
  }

  // ---------- Batch 1: ages and counting ----------
  registerPuzzles('math', [
    { q: 'Mia is <b>3 times</b> as old as her little brother. In 6 years she will be exactly <b>twice</b> as old as he will be. How old is Mia now?',
      n: 18, why: 'Let the brother be b, so Mia is 3b. In 6 years: 3b + 6 = 2(b + 6), so b = 6 and Mia is 18. Check: in 6 years they are 24 and 12.', bloom: 'Apply' },
    { q: 'A father is 30 years older than his son. In 5 years the father will be exactly <b>4 times</b> as old as his son. How old is the son now?',
      n: 5, why: 'Son now s, father s + 30. In 5 years: s + 35 = 4(s + 5), so 3s = 15 and s = 5. Check: 40 = 4 &times; 10.', bloom: 'Analyze' },
    { q: 'Mary is twice as old as Ann was <i>when Mary was as old as Ann is now</i>. Mary is 24. How old is Ann?',
      n: 18, why: 'Let Ann be A. The gap between them is 24 &minus; A, so that many years ago Ann was A &minus; (24 &minus; A) = 2A &minus; 24. Then 24 = 2(2A &minus; 24), so 4A = 72 and A = 18. Check: 6 years ago Mary was 18 and Ann was 12, and 24 = 2 &times; 12.', bloom: 'Understand' },
    { q: 'Eight friends meet, and each one shakes hands exactly <b>once</b> with every other friend. How many handshakes happen in total?',
      n: 28, why: 'Each of the 8 shakes 7 hands, which counts every handshake twice: 8 &times; 7 &divide; 2 = 28.', bloom: 'Apply' },
    { q: 'At a party everyone shook hands exactly once with everyone else, and there were <b>45</b> handshakes in total. How many people were at the party?',
      n: 10, why: 'With n people there are n(n &minus; 1)&divide;2 handshakes. Since 10 &times; 9 &divide; 2 = 45, there were 10 people.', bloom: 'Analyze' },
    { q: 'A <b>diagonal</b> joins two corners of a polygon that are not neighbours. How many diagonals does a regular decagon (10 sides) have?',
      n: 35, why: 'Each corner connects to 10 &minus; 3 = 7 others by diagonals. Every diagonal is counted from both ends: 10 &times; 7 &divide; 2 = 35.', bloom: 'Apply' },
    { q: 'A knockout tournament starts with <b>64 players</b>. Each match has one winner who goes on and one loser who is out. How many matches are played to find the champion?',
      a: '63', w: ['32', '64', '31'],
      why: 'Every match eliminates exactly one player, and 63 players must be eliminated to leave one champion. So there are 63 matches (32 + 16 + 8 + 4 + 2 + 1).', bloom: 'Analyze' },
    { q: 'At a dinner, <b>6 married couples</b> (12 people) meet. Everyone shakes hands once with every person <b>except their own partner</b> (and themselves). How many handshakes happen?',
      n: 60, why: 'Each person shakes 12 &minus; 2 = 10 hands, so 12 &times; 10 &divide; 2 = 60 handshakes.', bloom: 'Analyze' },
    { q: 'You walk from <b>A</b> to <b>B</b> along the grid lines, moving only <b>right</b> or <b>up</b> (4 blocks across, 3 blocks up). How many different routes are there?',
      n: 35, why: 'Every route has 7 steps: 4 rights and 3 ups. You just choose which 3 of the 7 steps are ups: 7&times;6&times;5 &divide; (3&times;2&times;1) = 35.', bloom: 'Apply', diagram: lattice(4, 3) },
  ]);

  // ---------- Batch 2: cryptarithms, magic squares, number pyramids ----------
  registerPuzzles('math', [
    { q: 'In the famous sum <b>SEND + MORE = MONEY</b>, each letter stands for a different digit (0-9) and no number starts with 0. What number does <b>MONEY</b> stand for?',
      n: 10652, why: 'Adding two 4-digit numbers gives less than 20 000, so M = 1. That forces O = 0 and S = 9, and working through the columns gives E = 5, N = 6, D = 7, R = 8, Y = 2: 9567 + 1085 = 10652.', bloom: 'Understand' },
    { q: 'In <b>GO + TO = OUT</b>, each letter is a different digit and no number starts with 0. Which digits work?',
      a: 'G = 8, O = 1, T = 2, U = 0', w: ['G = 7, O = 1, T = 3, U = 0', 'G = 6, O = 1, T = 4, U = 0', 'G = 8, O = 1, T = 2, U = 3'],
      why: 'Two 2-digit numbers add to less than 200, so O = 1. The units column gives O + O = T, so T = 2. The tens column is then G + 2 = 10 + U; U cannot be 1 or 2 (already used), so U = 0 and G = 8: 81 + 21 = 102.', bloom: 'Create' },
    { q: 'Solve the cryptarithm <b>CROSS + ROADS = DANGER</b> (each letter a different digit, no number starts with 0). What number does <b>DANGER</b> stand for?',
      n: 158746, why: 'Two 5-digit numbers give a 6-digit answer, so D = 1. Working from the units column (S + S ends in R) and checking the carries gives C = 9, R = 6, O = 2, S = 3, A = 5, N = 8, G = 7, E = 4: 96233 + 62513 = 158746.', bloom: 'Analyze' },

    { q: 'In this <b>magic square</b> every row, column and diagonal has the same total. What number belongs in the centre?',
      n: 5, why: 'The top row 4 + 9 + 2 = 15, so every line must total 15. The middle row 3 + ? + 7 = 15 gives ? = 5.', bloom: 'Understand',
      diagram: grid([['4', '9', '2'], ['3', '?', '7'], ['8', '1', '6']]) },
    { q: 'In this magic square every row, column and diagonal adds up to the same total. Only the corners and the centre are shown. What number replaces <b>?</b>',
      n: 6, why: 'The diagonal 17 + 12 + 7 = 36 gives the magic total. The top row is 17 + ? + 13 = 36, so ? = 6.', bloom: 'Analyze',
      diagram: grid([['17', '?', '13'], ['', '12', ''], ['11', '', '7']]) },
    { q: 'This is the magic square from Albrecht D&uuml;rer\'s 1514 engraving <i>Melencolia I</i>. It uses the numbers 1 to 16, and every row, column and diagonal has the same total. What number belongs in the <b>?</b> cell?',
      n: 12, why: 'The numbers 1 to 16 add to 136, and 4 rows share it equally, so each line totals 34. The third row is 9 + 6 + 7 + ? = 34, so ? = 12.', bloom: 'Apply',
      diagram: grid([['16', '3', '2', '13'], ['5', '10', '11', '8'], ['9', '6', '7', '?'], ['4', '15', '14', '1']], { cell: 52 }) },
    { q: 'This <b>3 &times; 3 magic square</b> uses each of 1 to 9 once, and every row, column and diagonal adds to the same total. Which numbers go in the top <b>?</b> and the right <b>?</b>?',
      a: 'Top = 7, right = 1', w: ['Top = 1, right = 7', 'Top = 5, right = 3', 'Top = 7, right = 3'],
      why: 'The bottom row 4 + 3 + 8 = 15 sets the total. The top row 2 + ? + 6 = 15 gives 7, and the middle row 9 + 5 + ? = 15 gives 1.', bloom: 'Create',
      diagram: grid([['2', '?', '6'], ['9', '5', '?'], ['4', '3', '8']]) },
    { q: 'In a 3 &times; 3 magic square that uses each of 1 to 9 once (every row, column and diagonal adds to 15), Sam says the centre could be any number. Which statement is correct?',
      a: 'The centre must be 5', w: ['The centre must be 1', 'The centre could be any of 1 to 9', 'The centre must be 9'],
      why: 'The four lines through the centre (middle row, middle column, two diagonals) cover every number once, plus the centre four times, so 60 = 45 + 3 &times; centre. The centre must be 5.', bloom: 'Evaluate' },

    { q: 'In this <b>number pyramid</b>, every brick is the <b>sum</b> of the two bricks just below it. The top brick is 39. What number is the missing brick?',
      n: 5, why: 'Call the missing bottom number b. The rows above are 3 + b, b + 4, 13, then 7 + 2b and b + 17, so the top is 24 + 3b = 39. So b = 5.', bloom: 'Understand',
      diagram: pyramid([['39'], ['', ''], ['', '', ''], ['3', '?', '4', '9']]) },
    { q: 'In this pyramid every brick is the <b>product</b> of the two bricks just below it. The top brick is 90. What number is the missing brick?',
      n: 3, why: 'With the middle bottom number b, the row above is 2b and 5b, and their product is 10b&sup2; = 90. So b&sup2; = 9 and b = 3.', bloom: 'Understand',
      diagram: pyramid([['90'], ['', ''], ['2', '?', '5']]) },
  ]);

  // ---------- Batch 3: number sequences ----------
  registerPuzzles('math', [
    { q: 'Each number in this list (after the first two) is made from the two before it.<br><b>3, 4, 7, 11, 18, ?</b><br>What is the next number?',
      n: 29, why: 'Add the two previous terms: 3 + 4 = 7, 4 + 7 = 11, 7 + 11 = 18, so the next is 11 + 18 = 29. (It is a Fibonacci-style sequence with different starters.)', bloom: 'Apply' },
    { q: 'What comes next?<br><b>1, 2, 4, 7, 11, 16, ?</b>',
      n: 22, why: 'Look at the gaps: +1, +2, +3, +4, +5, so the next gap is +6: 16 + 6 = 22.', bloom: 'Analyze' },
    { q: 'Which formula (n = 1, 2, 3, 4, &hellip;) produces the sequence <b>3, 8, 15, 24, &hellip;</b>?',
      a: 'n&sup2; + 2n', w: ['n&sup2; + 2', 'n&sup2; + 3n &minus; 1', '2n + 1'],
      why: 'Test each rule: n&sup2; + 2n gives 3, 8, 15, 24. The others fail already at n = 2 (6, 9 and 5). Also, each term is one less than a square: 4 &minus; 1, 9 &minus; 1, 16 &minus; 1, 25 &minus; 1.', bloom: 'Create' },
    { q: 'Two patterns are woven together.<br><b>2, 10, 4, 20, 6, 30, ?</b><br>What is the next number?',
      n: 8, why: 'Read every other number: 2, 4, 6, &hellip; is one pattern and 10, 20, 30, &hellip; is the other. The next number continues the first pattern: 8.', bloom: 'Analyze' },
    { q: 'What comes next in the list of <b>prime numbers</b>?<br><b>2, 3, 5, 7, 11, 13, 17, 19, ?</b>',
      a: '23', w: ['21', '25', '27'],
      why: 'A prime has exactly two factors, 1 and itself. 21 = 3 &times; 7, 25 = 5 &times; 5 and 27 = 3 &times; 9 all have more factors, while 23 has none.', bloom: 'Understand' },
    { q: 'Decode the pattern (each term describes the term before it out loud):<br><b>1, 11, 21, 1211, 111221, ?</b>',
      n: 312211, why: 'This is the "look-and-say" sequence. 1 is "one 1" = 11; 11 is "two 1s" = 21; 21 is "one 2, one 1" = 1211; 1211 is "one 1, one 2, two 1s" = 111221; and 111221 is "three 1s, two 2s, one 1" = 312211.', bloom: 'Understand' },
    { q: 'What comes next?<br><b>1, 4, 27, 256, ?</b>',
      n: 3125, why: 'Each term is a number raised to its own power: 1&sup1;, 2&sup2;, 3&sup3;, 4&#8308;. The next is 5&#8309; = 3125.', bloom: 'Analyze' },
    { q: 'Join <i>n</i> points on a circle with straight chords (no three chords meet at one point). The maximum number of regions inside is 1, 2, 4, 8, 16 for n = 1 to 5. Maya says n = 6 will give 32. What really happens?',
      a: 'Only 31 regions, so the doubling pattern breaks', w: ['Exactly 32 regions, the doubling continues', '30 regions', '36 regions'],
      why: 'This is Moser\'s circle problem. The count is 1 + (pairs of points) + (groups of 4 points) = 1 + 15 + 15 = 31 for six points. A pattern that fits five terms is not proof of a rule.', bloom: 'Evaluate' },
  ]);

  // ---------- Batch 4: digit sums, divisibility, remainders of numbers ----------
  registerPuzzles('math', [
    { q: 'A smudge hides one digit: the number <b>47&#9633;2</b> is known to be a multiple of 9. Which digit is hidden?',
      n: 5, why: 'A number is divisible by 9 exactly when its digit sum is. 4 + 7 + 2 = 13, and the next multiple of 9 is 18, so the hidden digit is 18 &minus; 13 = 5 (4752 = 9 &times; 528).', bloom: 'Understand' },
    { q: 'What is the <b>smallest</b> positive number that is divisible by every whole number from 1 to 10?',
      a: '2520', w: ['1260', '5040', '3628800'],
      why: 'Take the highest power of each prime needed: 8 = 2&sup3;, 9 = 3&sup2;, 5 and 7. So 8 &times; 9 &times; 5 &times; 7 = 2520. Half of that, 1260, is not divisible by 8, and 5040 and 3 628 800 (= 10!) work but are not the smallest.', bloom: 'Create' },
    { q: 'How many zeros are at the end of <b>25!</b> (that is, 25 &times; 24 &times; 23 &times; &hellip; &times; 2 &times; 1)?',
      n: 6, why: 'Each trailing zero needs a factor 10 = 2 &times; 5, and there are plenty of 2s. Count the 5s: 5, 10, 15, 20 give one each and 25 gives two, so 6 fives and 6 zeros.', bloom: 'Analyze' },
    { q: 'Try this number trick. Take 853, reverse it to get 358, and subtract: 853 &minus; 358 = 495. Now reverse that result (594) and <b>add</b>: 495 + 594 = ?',
      n: 1089, why: 'Any 3-digit number whose digits go strictly down (like 853) gives 495 after the subtraction, and 495 + 594 is always 1089. Try 742: 742 &minus; 247 = 495 too, so you get 1089 again.', bloom: 'Apply' },
    { q: '<b>Kaprekar\'s routine:</b> take a 4-digit number, arrange its digits from largest to smallest and from smallest to largest, and subtract the second from the first. Repeat with the answer. Starting with <b>3524</b>, how many subtractions does it take to first reach 6174?',
      n: 3, why: '5432 &minus; 2345 = 3087; then 8730 &minus; 0378 = 8352; then 8532 &minus; 2358 = 6174. That is 3 subtractions, and 6174 stays fixed forever after.', bloom: 'Apply' },
    { q: 'In <b>Kaprekar\'s routine</b> you arrange a 4-digit number\'s digits from largest to smallest and from smallest to largest, then subtract. Which of these starting numbers gives exactly <b>6174</b> after just <b>one</b> subtraction?',
      a: '7531', w: ['3524', '9642', '6931'],
      why: '7531 &minus; 1357 = 6174. The others give 5432 &minus; 2345 = 3087, 9642 &minus; 2469 = 7173 and 9631 &minus; 1369 = 8262.', bloom: 'Create' },
    { q: 'Exactly one number below 50 has <b>exactly 10 divisors</b> (counting 1 and the number itself). Which one?',
      n: 48, why: 'Divisor count comes from prime powers: 48 = 2&#8308; &times; 3 has (4 + 1)(1 + 1) = 10 divisors: 1, 2, 3, 4, 6, 8, 12, 16, 24, 48. No other number under 50 has 10.', bloom: 'Analyze' },
    { q: 'Find the <b>smallest number greater than 1</b> that leaves remainder <b>1</b> when divided by 2, by 3, by 4, by 5 and by 6.',
      n: 61, why: 'The number minus 1 must be a multiple of 2, 3, 4, 5 and 6. The smallest such multiple is their lowest common multiple, 60, so the number is 61.', bloom: 'Create' },
    { q: 'Which of these statements about divisibility is <b>false</b>?',
      a: 'If a number is divisible by both 4 and 6, it is divisible by 24', w: ['If a number is divisible by both 3 and 4, it is divisible by 12', 'If the digit sum of a number is divisible by 9, the number is divisible by 9', 'If a number is divisible by 6, it is divisible by 3'],
      why: '12 is divisible by 4 and 6 but not by 24. The rule works for 3 and 4 because they share no factor; 4 and 6 both contain a 2, so you only get 12.', bloom: 'Evaluate' },
    { q: 'A two-digit number is <b>27 more</b> than the number you get by reversing its digits, and its digits add up to <b>11</b>. What is the number?',
      n: 74, why: 'For tens digit a and units digit b: (10a + b) &minus; (10b + a) = 9(a &minus; b) = 27, so a &minus; b = 3. With a + b = 11, a = 7 and b = 4. Check: 74 &minus; 47 = 27.', bloom: 'Analyze' },
  ]);

  // ---------- Batch 5: clock puzzles ----------
  registerPuzzles('math', [
    { q: 'The clock shows <b>8:20</b>. What is the (smaller) angle between the hour hand and the minute hand, in degrees?',
      n: 130, why: 'The minute hand is at 20 &times; 6 = 120&deg;. The hour hand has moved 8 &times; 30 = 240&deg; plus 20 minutes &times; 0.5&deg; = 250&deg;. The gap is 250 &minus; 120 = 130&deg;.', bloom: 'Analyze',
      diagram: clock(8, 20) },
    { q: 'Alex looks at a plain wall clock in a <b>mirror</b> and sees the picture (the top of the dial is 12 o\'clock). What time is it really?',
      a: '8:40', w: ['3:20', '8:20', '9:40'],
      why: 'A mirror swaps left and right, so the time you see is 12:00 minus the real time. The picture reads 3:20, and 12:00 &minus; 3:20 = 8:40.', bloom: 'Understand',
      diagram: clock(3, 20, true) },
    { q: 'Zed says: "The hour hand and the minute hand overlap once every hour, so in a 12-hour cycle (from 12:00 up to but not including the next 12:00) they overlap 12 times." How many overlaps really happen in that cycle?',
      a: '11', w: ['12', '10', '13'],
      why: 'The minute hand catches the hour hand every 12/11 hours (about 65.5 minutes), so there are 11 overlaps in 12 hours: at 12:00, about 1:05, 2:11, &hellip; 10:54. Between 11:00 and 12:00 there is no overlap, since the next one is exactly at 12:00 again.', bloom: 'Evaluate' },
    { q: 'In one 12-hour cycle (from 12:00 up to but not including the next 12:00), how many times are the hour hand and minute hand at <b>right angles</b> (exactly 90&deg; apart)?',
      a: '22', w: ['24', '12', '11'],
      why: 'The minute hand gains 330&deg; per hour on the hour hand, so it passes each of the two 90&deg; positions about 11 times in 12 hours: 2 &times; 11 = 22.', bloom: 'Analyze' },
    { q: 'A clock strikes once at 1 o\'clock, twice at 2 o\'clock, and so on. It takes <b>6 seconds</b> to strike 4 o\'clock (from the start of the first strike to the start of the last strike). How long does it take to strike <b>8 o\'clock</b> the same way?',
      n: 14, why: '4 strikes have only 3 gaps between them, so each gap is 6 &divide; 3 = 2 seconds. 8 strikes have 7 gaps: 7 &times; 2 = 14 seconds (not 12).', bloom: 'Analyze' },
    { q: 'A slow clock <b>loses 4 minutes every real hour</b>. It is set correctly at 8:00 a.m. What does it show when the real time is 8:00 p.m.?',
      a: '7:12 p.m.', w: ['7:48 p.m.', '7:52 p.m.', '8:48 p.m.'],
      why: 'In 12 real hours the clock loses 12 &times; 4 = 48 minutes, so it shows 48 minutes less than 8:00 p.m., that is 7:12 p.m.', bloom: 'Apply' },
    { q: 'Priya says the hour and minute hands overlap at exactly 3:15, since the minute hand is on the 3. Ravi disagrees. Who is right, and when do the hands first overlap after 3:00?',
      a: 'Ravi: a little after 3:16, since the hour hand has moved on', w: ['Priya: exactly at 3:15', 'Ravi: exactly at 3:20', 'Neither: they never overlap between 3 and 4'],
      why: 'At 3:15 the hour hand has already moved a quarter of the way to 4. The minute hand gains 5.5&deg; per minute and starts 90&deg; behind at 3:00, so it catches up after 90 &divide; 5.5 = 16 4/11 minutes, that is at about 3:16:22.', bloom: 'Evaluate' },
  ]);

  // ---------- Batch 6: coins and change, work rates ----------
  registerPuzzles('math', [
    { q: 'You must pay exactly <b>94 cents</b> using the fewest possible coins from these types: 25c, 10c, 5c and 1c. How many coins is that?',
      n: 9, why: 'Use the biggest coins first: three 25c (75c), one 10c (85c), one 5c (90c) and four 1c (94c). That is 3 + 1 + 1 + 4 = 9 coins.', bloom: 'Apply' },
    { q: 'In how many different ways can you make <b>25 cents</b> using pennies (1c), nickels (5c), dimes (10c) and quarters (25c)? (Order does not matter.)',
      n: 13, why: 'Sort by the bigger coins, and let pennies fill the rest. One quarter: 1 way. No quarter and 2 dimes: 2 ways (0 or 1 nickel). One dime: 4 ways (0 to 3 nickels). No dime: 6 ways (0 to 5 nickels). Total 1 + 2 + 4 + 6 = 13.', bloom: 'Analyze' },
    { q: 'A country has coins worth <b>1, 3 and 4</b> only. A cashier always hands over the biggest coin that fits, so 6 is paid as 4 + 1 + 1 (3 coins). Is that always the fewest coins?',
      a: 'No, 3 + 3 uses only 2 coins', w: ['Yes, 4 + 1 + 1 uses the fewest coins', 'No, 3 + 1 + 1 + 1 uses fewer coins', 'Yes, the biggest coin always gives the fewest'],
      why: '3 + 3 = 6 needs only 2 coins. "Always take the biggest coin" works for 1, 5, 10, 25 but not for every set of coins, so it has to be checked.', bloom: 'Evaluate' },
    { q: 'A stamp shop only has stamps worth <b>4 cents</b> and <b>7 cents</b>. What is the <b>largest</b> postage amount (in cents) that <b>cannot</b> be made exactly using these stamps?',
      n: 17, why: 'For two coprime stamp values a and b the largest impossible amount is a &times; b &minus; a &minus; b = 28 &minus; 11 = 17. Every amount from 18 upward can be made (18 = 4 + 7 + 7, 19 = 4 &times; 3 + 7, 20 = 4 &times; 5, 21 = 7 &times; 3), while 17 cannot.', bloom: 'Analyze' },
    { q: 'This table shows the coins in a piggy bank. How many cents are in the piggy bank in total?',
      n: 200, why: '8 &times; 5 = 40, 6 &times; 10 = 60 and 4 &times; 25 = 100 cents. Add: 40 + 60 + 100 = 200 cents.', bloom: 'Understand',
      diagram: table([['Coin', 'How many'], ['5c', '8'], ['10c', '6'], ['25c', '4']], [90, 110]) },
    { q: 'Sam has <b>20 coins</b>, all nickels (5c) or dimes (10c), worth <b>$1.35</b> in total. Which mix of coins could Sam have?',
      a: '13 nickels and 7 dimes', w: ['12 nickels and 8 dimes', '14 nickels and 6 dimes', '10 nickels and 10 dimes'],
      why: 'If all 20 were nickels they would be worth 100c. That is 35c short, and each nickel swapped for a dime adds 5c, so 7 swaps: 7 dimes and 13 nickels (65 + 70 = 135). The other mixes also use 20 coins but total 140c, 130c and 150c.', bloom: 'Create' },
    { q: 'Which choice is exactly <b>6 coins</b> that add up to <b>47 cents</b>?',
      a: '20c, 10c, 10c, 5c, 1c, 1c', w: ['20c, 20c, 5c, 2c, 1c, 1c', '20c, 10c, 5c, 5c, 5c, 1c', '20c, 20c, 2c, 2c, 2c, 2c'],
      why: '20 + 10 + 10 + 5 + 1 + 1 = 47. The other sets have 6 coins too, but they total 49, 46 and 48.', bloom: 'Create' },

    { q: 'A tap fills a tank in <b>4 hours</b>. A drain at the bottom empties a full tank in <b>6 hours</b>. If both are open from an empty tank, how many hours until it is full?',
      n: 12, why: 'Per hour the tap adds 1/4 of the tank and the drain removes 1/6. The net gain is 1/4 &minus; 1/6 = 1/12, so it takes 12 hours.', bloom: 'Apply' },
    { q: '<b>5 machines make 5 widgets in 5 minutes.</b> Sam says 100 machines need 100 minutes to make 100 widgets. Tia says it takes less. Who is right?',
      a: 'Tia: 5 minutes, since each machine makes 1 widget in 5 minutes', w: ['Sam: 100 minutes', 'Tia: 1 minute', 'Tia: 20 minutes'],
      why: 'Each machine makes 1 widget in 5 minutes. So 100 machines make 100 widgets in the same 5 minutes.', bloom: 'Evaluate' },
    { q: 'If <b>a hen and a half lays an egg and a half in a day and a half</b>, how many eggs do <b>6 hens</b> lay in <b>6 days</b>?',
      n: 24, why: '1.5 hens lay 1.5 eggs in 1.5 days, so 1 hen lays 1 egg in 1.5 days, or 2/3 egg per day. 6 hens for 6 days: 6 &times; 6 &times; 2/3 = 24 eggs.', bloom: 'Analyze' },
    { q: 'A tank has tap <b>A</b> (fills it in 3 hours), tap <b>B</b> (fills it in 6 hours) and a drain <b>C</b> (empties a full tank in 2 hours). All three are open from an empty tank. What happens?',
      a: 'The tank never fills', w: ['It fills in 1 hour', 'It fills in 3 hours', 'It fills in 11 hours'],
      why: 'Per hour: +1/3 + 1/6 &minus; 1/2 = 2/6 + 1/6 &minus; 3/6 = 0. The drain removes water exactly as fast as the taps add it.', bloom: 'Evaluate' },
  ]);

  // ---------- Batch 7: consecutive numbers, "think of a number", averages ----------
  registerPuzzles('math', [
    { q: 'What is the sum of the <b>first ten odd numbers</b>?<br><b>1 + 3 + 5 + 7 + &hellip; + 19</b>',
      n: 100, why: 'The sum of the first n odd numbers is always n&sup2;: 1 = 1&sup2;, 1 + 3 = 2&sup2;, 1 + 3 + 5 = 3&sup2;, and so on. For ten numbers it is 10&sup2; = 100. (You can also pair 1 + 19, 3 + 17, &hellip; = five pairs of 20.)', bloom: 'Understand' },
    { q: 'In how many ways can <b>45</b> be written as a sum of <b>two or more consecutive positive whole numbers</b>? (For example 22 + 23 = 45.)',
      n: 5, why: 'The five ways are 22 + 23, 14 + 15 + 16, 7 + 8 + 9 + 10 + 11, 5 + 6 + 7 + 8 + 9 + 10 and 1 + 2 + &hellip; + 9. Each way matches an odd divisor of 45 above 1 (3, 5, 9, 15 and 45), which is why there are exactly 5.', bloom: 'Analyze' },
    { q: 'Which "think of a number" trick <b>always</b> ends with the same answer, whatever number you start with?',
      a: 'Double it, add 8, halve it, subtract your starting number', w: ['Add 5, double it, subtract 4', 'Triple it, add 6, subtract your starting number', 'Multiply by 4, add 8, divide by 2'],
      why: 'With starting number x: (2x + 8) &divide; 2 &minus; x = 4 always, because the x\'s cancel. The others give 2x + 6, 2x + 6 and 2x + 4, which change with x.', bloom: 'Evaluate' },
    { q: 'Ravi thinks of a number, adds 7, multiplies by 3, subtracts 9, then divides by 3. His answer is <b>20</b>. What number did he think of?',
      n: 16, why: 'Work backwards: 20 &times; 3 = 60, 60 + 9 = 69, 69 &divide; 3 = 23, 23 &minus; 7 = 16. Check: (16 + 7) &times; 3 = 69, 69 &minus; 9 = 60, 60 &divide; 3 = 20.', bloom: 'Apply' },
    { q: 'Pick any 3-digit number, write it twice to make a 6-digit number (for example 482 becomes 482482), then divide by 7, then by 11, then by 13. What do you get for <b>482482</b>?',
      n: 482, why: 'A repeated number such as abcabc equals abc &times; 1001, and 1001 = 7 &times; 11 &times; 13. Dividing by all three just gives back the original number, 482.', bloom: 'Understand' },
    { q: 'Complete this trick so the answer is <b>always 5</b>: "Think of a number, add 6, double it, subtract 12, halve it, and then &hellip;" What is the last instruction?',
      a: 'Subtract your starting number, then add 5', w: ['Add your starting number, then subtract 5', 'Subtract 5', 'Add 5'],
      why: 'After the first four steps you are back at your starting number x: 2(x + 6) &minus; 12 = 2x, and half of 2x is x. Subtracting x and adding 5 always leaves 5. The other endings leave x &minus; 5 or x + 5 or 2x &minus; 5, which depend on x.', bloom: 'Create' },

    { q: 'The average of five numbers is <b>12</b>. When one number is removed, the average of the remaining four is <b>10</b>. What number was removed?',
      n: 20, why: 'Five numbers total 5 &times; 12 = 60, and the four left total 4 &times; 10 = 40. The removed number is 60 &minus; 40 = 20.', bloom: 'Apply' },
    { q: 'Leo drives to a town at <b>60 km/h</b> and back the same road at <b>40 km/h</b>. He says his average speed for the round trip is 50 km/h. What is the right average speed?',
      a: '48 km/h', w: ['50 km/h', '52 km/h', '45 km/h'],
      why: 'Average speed = total distance &divide; total time. For a one-way distance d the times are d/60 and d/40, so the average is 2d &divide; (d/60 + d/40) = 48. More time is spent going slowly, which pulls the average below 50.', bloom: 'Evaluate' },
    { q: 'A family of 4 has an average age of <b>20</b>. When Grandma joins them, the average age of the 5 people becomes <b>28</b>. How old is Grandma?',
      n: 60, why: 'Total age before: 4 &times; 20 = 80. Total after: 5 &times; 28 = 140. Grandma\'s age is 140 &minus; 80 = 60.', bloom: 'Analyze' },
  ]);

  // ---------- Batch 8: remainders and cycles, calendars ----------
  registerPuzzles('math', [
    { q: 'What is the <b>last digit</b> of 7<sup>2026</sup> (that is, 7 multiplied by itself 2026 times)?',
      n: 9, why: 'The last digits of the powers of 7 repeat every 4 steps: 7, 9, 3, 1, 7, 9, 3, 1, &hellip; Since 2026 = 4 &times; 506 + 2, the last digit is the 2nd in the cycle: 9.', bloom: 'Analyze' },
    { q: 'Today is a <b>Wednesday</b>. What day of the week will it be <b>100 days</b> from today?',
      a: 'Friday', w: ['Thursday', 'Saturday', 'Wednesday'],
      why: 'The days of the week repeat every 7 days. 100 = 14 &times; 7 + 2, so the day is 2 days after Wednesday: Friday.', bloom: 'Apply' },
    { q: 'The calendar shows a month that has <b>30 days</b>. On what day of the week does the <b>next month</b> begin?',
      a: 'Thursday', w: ['Wednesday', 'Friday', 'Tuesday'],
      why: 'The 1st is a Tuesday, so the 29th is also a Tuesday (4 weeks later) and the 30th is a Wednesday. The next month therefore begins on Thursday.', bloom: 'Understand',
      diagram: calendar(2, 30) },
    { q: 'Nine dates in a 3 &times; 3 block are shaded on a calendar (the dates are hidden). Together the nine dates add up to <b>135</b>. What is the date in the <b>top-left</b> shaded square?',
      n: 7, why: 'In a calendar, one step right is +1 and one step down is +7. The nine dates average to the centre one, so the centre is 135 &divide; 9 = 15. The top-left square is 1 left and 1 up from the centre: 15 &minus; 1 &minus; 7 = 7.', bloom: 'Analyze',
      diagram: calendar(3, 31, [7, 8, 9, 14, 15, 16, 21, 22, 23], { blank: true, rows: 5 }) },
    { q: 'A month has <b>31 days</b>. It is always true that some days of the week appear <b>5 times</b> in it. Exactly how many different weekdays (out of Monday to Sunday) appear 5 times?',
      n: 3, why: '31 days = 4 full weeks (28 days) + 3 extra days. Every weekday appears 4 times, and the 3 extra days (which are 3 different weekdays) appear a 5th time.', bloom: 'Analyze' },
  ]);

  // ---------- Batch 9: percentages and fractions, pigeonhole, wheels and triangles ----------
  registerPuzzles('math', [
    { q: 'A jacket costs 100. The price goes <b>up by 20%</b>, and then <b>down by 20%</b>. Zoe says the jacket is back to exactly 100. What is correct?',
      a: 'The jacket costs 96, because 20% is taken off a bigger price', w: ['The jacket costs 100, because +20% and &minus;20% cancel', 'The jacket costs 104', 'The jacket costs 120'],
      why: '20% of 100 is 20, so the jacket costs 120. Then 20% of 120 is 24, which comes off: 120 &minus; 24 = 96. The two percentages are taken from different amounts, so they do not cancel.', bloom: 'Evaluate' },
    { q: 'A shop takes <b>50% off</b> the marked price, then takes <b>another 50% off</b> the reduced price. What single percentage discount is that from the original price?',
      n: 75, why: 'A price of 100 becomes 50 after the first cut, and 25 after the second. The total reduction is 75 out of 100 = 75%, not 100%.', bloom: 'Apply' },
    { q: 'A 100 kg watermelon is <b>99% water</b>. After sitting in the sun it is <b>98% water</b>. Ali says it has lost only 1 kg, so it weighs 99 kg. What does it weigh?',
      a: '50 kg', w: ['99 kg', '98 kg', '75 kg'],
      why: 'The non-water part is 1% of 100 = 1 kg and does not change. Now that 1 kg is 2% of the weight, so the whole thing weighs 1 &divide; 0.02 = 50 kg. Ali forgot that the percentage is taken from the new, smaller weight.', bloom: 'Evaluate' },
    { q: 'Tom\'s height is <b>25% more</b> than Ben\'s. Ben says, "So I am 25% shorter than Tom." Is that right?',
      a: 'No, Ben is 20% shorter than Tom', w: ['Yes, Ben is 25% shorter', 'No, Ben is 12.5% shorter', 'No, Ben is 30% shorter'],
      why: 'If Ben is 100 cm, Tom is 125 cm. The 25 cm difference is 25/125 = 20% of Tom\'s height, because this time the percentage is taken from the larger height.', bloom: 'Evaluate' },
    { q: 'A shop wants a total discount of exactly <b>36%</b>. It will take the same percentage off twice in a row (the second time off the already reduced price). What percentage should each discount be?',
      n: 20, why: 'Two equal discounts of d% leave (1 &minus; d)&sup2; of the price, and 36% off leaves 64% = 0.64. Since 0.8 &times; 0.8 = 0.64, each discount is 20%. (Check: 100 &rarr; 80 &rarr; 64.)', bloom: 'Create' },
    { q: 'In a class, <b>3/5</b> of the students like pizza and <b>2/3</b> like pasta. Every student likes at least one of the two. What fraction of the class likes <b>both</b>?',
      a: '4/15', w: ['1/15', '2/5', '1/3'],
      why: 'Adding 3/5 + 2/3 = 19/15 counts the students who like both twice. The whole class is 15/15, so the overlap is 19/15 &minus; 1 = 4/15.', bloom: 'Analyze' },

    { q: 'A drawer is full of loose red, blue and black socks. In the dark, what is the smallest number of socks you must take out to be <b>sure</b> that at least two of them are the same colour?',
      n: 4, why: 'With 3 colours you could take 3 socks, all different. The 4th sock must repeat a colour (pigeonhole principle).', bloom: 'Understand' },
    { q: 'What is the smallest number of numbers you must choose from <b>1, 2, 3, &hellip;, 10</b> to be <b>certain</b> that two of your chosen numbers add up to 11?',
      n: 6, why: 'Split the numbers into 5 pairs that add to 11: (1,10), (2,9), (3,8), (4,7), (5,6). You can choose 5 numbers with one from each pair and no two add to 11, but a 6th number must complete a pair.', bloom: 'Analyze' },
    { q: 'At a party of 10 people, some pairs shake hands (nobody shakes hands with the same person twice or with themselves). Ella says: "At least two people shook the <b>same number</b> of hands." Is she right?',
      a: 'Yes, this must happen', w: ['No, everyone could have a different number', 'Only if some person shook nobody\'s hand', 'Only if the number of people is even'],
      why: 'Each person shakes between 0 and 9 hands. But someone with 9 shook everyone, so nobody has 0; so 0 and 9 cannot both appear. That leaves only 9 possible values for 10 people, so two people match.', bloom: 'Evaluate' },

    { q: 'In this number wheel, every pair of numbers <b>directly opposite</b> each other has the same total. What number belongs in the <b>?</b> sector?',
      n: 13, why: 'The opposite pair 5 and 20 gives the total 25. Opposite 12 is the ?, so ? = 25 &minus; 12 = 13. (Check: 8 + 17 = 25 and 15 + 10 = 25.)', bloom: 'Understand',
      diagram: wheel(['5', '12', '8', '15', '20', '?', '17', '10']) },
    { q: 'Pascal\'s triangle is built so that each number is the sum of the two numbers above it. Look at the sums of the rows. What will the numbers in the row that begins <b>1, 10, 45, &hellip;</b> add up to?',
      n: 1024, why: 'The rows add up to 1, 2, 4, 8, 16: they double each time, so a row that starts 1, n, &hellip; adds to 2<sup>n</sup>. The row beginning 1, 10 adds to 2<sup>10</sup> = 1024.', bloom: 'Understand',
      diagram: pyramid([['1'], ['1', '1'], ['1', '2', '1'], ['1', '3', '3', '1'], ['1', '4', '6', '4', '1']], { bw: 44, bh: 36 }) },
  ]);

  // @@NEXT
})();
