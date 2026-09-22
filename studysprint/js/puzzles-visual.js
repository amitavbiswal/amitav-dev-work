(function () {
  // Puzzles: visual — registerPuzzles('visual', [ ... ]);

  // ---------- tiny SVG helpers (hard-coded colours; the diagram sits on a white panel) ----------
  const INK = '#222';
  const BLUE = '#3b6fd4';
  const RED = '#d9483b';
  const GREEN = '#2e9e5b';
  const GOLD = '#f2b632';
  const GREY = '#c9ced6';
  const PALE = '#e8edf7';

  function svg(w, h, body, maxH) {
    const maxW = Math.min(280, Math.round((maxH || 180) * w / h));
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" style="max-width:' + maxW + 'px" font-family="Arial, Helvetica, sans-serif" font-size="14" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }
  function ln(x1, y1, x2, y2, c, w) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || INK) + '" stroke-width="' + (w || 2) + '"/>';
  }
  function rc(x, y, w, h, fill, stroke, sw) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || INK) + '" stroke-width="' + (sw || 2) + '"/>';
  }
  function ci(x, y, r, fill, stroke, sw) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (fill || 'none') + '" stroke="' + (stroke === undefined ? INK : stroke) + '" stroke-width="' + (sw || 2) + '"/>';
  }
  function pg(pts, fill, stroke, sw) {
    return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + (fill || 'none') + '" stroke="' + (stroke === undefined ? INK : stroke) + '" stroke-width="' + (sw || 2) + '"/>';
  }
  function pl(pts, stroke, sw) {
    return '<polyline points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="none" stroke="' + (stroke || INK) + '" stroke-width="' + (sw || 2) + '"/>';
  }
  function tx(x, y, s, size, anchor, fill, weight) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 14) + '" text-anchor="' + (anchor || 'middle') + '" fill="' + (fill || INK) + '"' + (weight ? ' font-weight="' + weight + '"' : '') + '>' + s + '</text>';
  }
  // a grid of cols x rows squares with top-left corner (x0,y0) and cell size cs; fills = {'r,c': colour}
  function gridSq(cols, rows, x0, y0, cs, fills, stroke, sw) {
    let o = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      o += rc(x0 + c * cs, y0 + r * cs, cs, cs, (fills && fills[r + ',' + c]) || 'none', stroke || INK, sw || 1.5);
    }
    return o;
  }
  // regular polygon points
  function regPoly(cx, cy, r, n, rot) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (rot === undefined ? -Math.PI / 2 : rot) + i * 2 * Math.PI / n;
      pts.push([+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)]);
    }
    return pts;
  }
  // clock face with hour and minute hand at h:m (mirror = draw as seen in a mirror)
  function clock(cx, cy, r, h, m, mirror, nums) {
    let o = ci(cx, cy, r, '#fff', INK, 2.5);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const sx = mirror ? -1 : 1;
      o += ln(cx + sx * (r - 6) * Math.sin(a), cy - (r - 6) * Math.cos(a), cx + sx * r * Math.sin(a), cy - r * Math.cos(a), INK, 2);
      if (nums !== false) {
        const num = i === 0 ? 12 : i;
        if (mirror) o += '<text x="' + (cx + sx * (r - 19) * Math.sin(a)) + '" y="' + (cy - (r - 19) * Math.cos(a) + 5) + '" font-size="14" text-anchor="middle" fill="' + INK + '" transform="translate(' + (2 * (cx + sx * (r - 19) * Math.sin(a))) + ',0) scale(-1,1)">' + num + '</text>';
        else o += tx(cx + (r - 19) * Math.sin(a), cy - (r - 19) * Math.cos(a) + 5, num, 14);
      }
    }
    const sx = mirror ? -1 : 1;
    const ha = ((h % 12) + m / 60) * Math.PI / 6;
    const ma = m * Math.PI / 30;
    o += ln(cx, cy, cx + sx * r * 0.5 * Math.sin(ha), cy - r * 0.5 * Math.cos(ha), INK, 4.5);
    o += ln(cx, cy, cx + sx * r * 0.78 * Math.sin(ma), cy - r * 0.78 * Math.cos(ma), RED, 3);
    o += ci(cx, cy, 3.5, INK, INK, 1);
    return o;
  }

  // ============ Batch 1: counting shapes ============
  function fanTriangle() {
    let o = pl([[30, 190], [160, 25], [290, 190], [30, 190]]);
    [95, 160, 225].forEach(function (x) { o += ln(160, 25, x, 190); });
    return svg(320, 210, o);
  }
  function dotsGrid(n, sp, x0, y0, extra) {
    let o = extra || '';
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) o += ci(x0 + i * sp, y0 + j * sp, 4.5, INK, INK, 1);
    return o;
  }
  function triGrid(n) {
    const side = 180, s = side / n, h = s * Math.sqrt(3) / 2, top = [160, 25];
    const P = function (r, c) { return [+(top[0] - r * s / 2 + c * s).toFixed(1), +(top[1] + r * h).toFixed(1)]; };
    let o = '';
    for (let r = 1; r <= n; r++) { const a = P(r, 0), b = P(r, r); o += ln(a[0], a[1], b[0], b[1]); }
    for (let c = 0; c < n; c++) { const a = P(c, c), b = P(n, c); o += ln(a[0], a[1], b[0], b[1]); }
    for (let d = 0; d < n; d++) { const a = P(d, 0), b = P(n, n - d); o += ln(a[0], a[1], b[0], b[1]); }
    return svg(320, 200, o);
  }
  function chessBoard(n, x0, y0, cs, fills) {
    let o = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const key = r + ',' + c;
      const f = fills && fills[key] !== undefined ? fills[key] : ((r + c) % 2 ? '#8a94a8' : '#fff');
      o += rc(x0 + c * cs, y0 + r * cs, cs, cs, f, INK, 1.2);
    }
    return o + rc(x0, y0, n * cs, n * cs, 'none', INK, 2.5);
  }
  function pentaDiag(all) {
    const v = regPoly(160, 122, 100, 5);
    let o = '';
    if (all) o += pg(v);
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) {
      const adj = (j - i === 1) || (i === 0 && j === 4);
      if (!adj) o += ln(v[i][0], v[i][1], v[j][0], v[j][1]);
    }
    return svg(320, 235, o);
  }
  function hexagram() {
    const a = regPoly(160, 122, 100, 3, -Math.PI / 2), b = regPoly(160, 122, 100, 3, Math.PI / 2);
    return svg(320, 235, pg(a) + pg(b));
  }

  registerPuzzles('visual', [
    {
      q: 'Count every triangle of <b>any size</b> in the figure: three lines run from the top point down to the base of the big triangle.',
      n: 10, bloom: 'Apply', diagram: fanTriangle(),
      why: 'Every triangle is made from the top point plus two of the 5 spots on the base line, and 5 spots give 4+3+2+1 = 10 pairs. So there are 10 triangles.'
    },
    {
      q: 'Alex says a 3×3 grid of small squares holds 9 squares. Bea says squares of every size count, so it holds more. Who is right?',
      a: 'Bea: 14 squares (9 small, 4 of size 2×2, 1 of size 3×3)', w: ['Alex: 9 squares, only the small ones count', 'Bea: 13 squares', 'Bea: 16 squares'],
      bloom: 'Evaluate', diagram: svg(320, 215, gridSq(3, 3, 70, 15, 60, null, INK, 2.5)),
      why: 'Squares of every size count: 9 of size 1, 4 of size 2 (a 2×2 block can sit in 4 places) and 1 of size 3 = 14.'
    },
    {
      q: 'How many rectangles (squares count too) can you find in this grid of 2 rows and 3 columns?',
      n: 18, bloom: 'Apply', diagram: svg(320, 180, gridSq(3, 2, 55, 15, 70, null, INK, 2.5)),
      why: 'A rectangle is fixed by choosing 2 of the 3+1 = 4 vertical lines and 2 of the 2+1 = 3 horizontal lines: 6 × 3 = 18.'
    },
    {
      q: 'The big triangle is cut into 9 small triangles of the same size. How many triangles of all sizes are in the figure?',
      n: 13, bloom: 'Analyze', diagram: triGrid(3),
      why: 'Point-up triangles: 6 small, 3 of side 2, 1 big = 10. Point-down triangles: 3 small. Total 13.'
    },
    {
      q: 'A square has both diagonals drawn. How many triangles are in the figure?',
      n: 8, bloom: 'Understand',
      diagram: svg(320, 210, rc(100, 20, 160, 160, 'none', INK, 2.5) + ln(100, 20, 260, 180) + ln(260, 20, 100, 180)),
      why: 'There are 4 small triangles around the centre and 4 bigger ones, each made from two neighbours (half of the square): 8.'
    },
    {
      q: 'A five-pointed star is drawn with five straight lines. How many triangles of all sizes does it contain?',
      n: 10, bloom: 'Analyze', diagram: pentaDiag(false),
      why: 'Any 3 of the 5 lines make a triangle, and there are 10 ways to pick 3 lines from 5. That is 5 thin triangles at the tips plus 5 wide ones: 10 in all.'
    },
    {
      q: 'Two big triangles overlap to make a six-pointed star. Counting triangles of every size, how many are in the picture?',
      n: 8, bloom: 'Analyze', diagram: hexagram(),
      why: 'The 2 big triangles, plus the 6 small triangles at the star points: 8. Nothing else is bounded by three of the drawn lines.'
    },
    {
      q: 'All five diagonals of this regular pentagon are drawn. How many triangles of every size are in the figure?',
      n: 35, bloom: 'Analyze', diagram: pentaDiag(true),
      why: 'Sort by how many pentagon corners a triangle uses: 3 corners gives 10 triangles, 2 corners gives 20, and 1 corner gives 5 (the star tips). 10 + 20 + 5 = 35.'
    },
    {
      q: 'On this 4×4 dot board, a square is drawn by joining four dots. Tilted squares count too. How many different squares can you make?',
      n: 20, bloom: 'Analyze', diagram: svg(320, 210, dotsGrid(4, 55, 77, 25)),
      why: 'Upright: 9 (1×1) + 4 (2×2) + 1 (3×3) = 14. Tilted: 4 small diamonds (each fits in a 3×3 block of dots) and 2 larger slanted squares whose sides go 1 across and 2 up, or 2 across and 1 up. That is 6 more: 20.'
    },
    {
      q: 'How many squares of every size are on an ordinary 8×8 chessboard?',
      n: 204, bloom: 'Apply', diagram: svg(320, 230, chessBoard(8, 56, 10, 26)),
      why: 'Squares of side k fit in (9-k)² places: 64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204.'
    }
  ]);

  // ============ Batch 2: sequences and odd one out ============
  function arrowAt(cx, cy, deg, len, c) {
    const col = c || INK;
    return '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + deg + ')">' + ln(0, len / 2, 0, -len / 2 + 6, col, 4) +
      '<polygon points="0,' + (-len / 2) + ' -10,' + (-len / 2 + 14) + ' 10,' + (-len / 2 + 14) + '" fill="' + col + '" stroke="' + col + '" stroke-width="1"/></g>';
  }
  function quadShade(cx, cy, r, q) {
    const P = [
      'M' + cx + ' ' + cy + 'L' + (cx - r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r) + 'Z',
      'M' + cx + ' ' + cy + 'L' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + 'Z',
      'M' + cx + ' ' + cy + 'L' + (cx + r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + 'Z',
      'M' + cx + ' ' + cy + 'L' + cx + ' ' + (cy + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (cx - r) + ' ' + cy + 'Z'
    ];
    return ci(cx, cy, r, '#fff', INK, 2) + '<path d="' + P[q] + '" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2"/>' + ln(cx - r, cy, cx + r, cy, INK, 1.5) + ln(cx, cy - r, cx, cy + r, INK, 1.5);
  }
  function qBox(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="#fff" stroke="' + INK + '" stroke-width="2" stroke-dasharray="5 4"/>' + tx(x + w / 2, y + h / 2 + 8, '?', 24, 'middle', INK, 'bold');
  }
  function cellsNorm(cells) {
    const mr = Math.min.apply(null, cells.map(function (c) { return c[0]; }));
    const mc = Math.min.apply(null, cells.map(function (c) { return c[1]; }));
    return cells.map(function (c) { return [c[0] - mr, c[1] - mc]; });
  }
  function rot90(cells, times) {
    let out = cells;
    for (let i = 0; i < (times || 1); i++) out = cellsNorm(out.map(function (c) { return [c[1], -c[0]]; }));
    return out;
  }
  function mirrorCells(cells) { return cellsNorm(cells.map(function (c) { return [c[0], -c[1]]; })); }
  function drawCells(cells, x0, y0, cs, fill, stroke) {
    return cells.map(function (c) { return rc(x0 + c[1] * cs, y0 + c[0] * cs, cs, cs, fill || BLUE, stroke || INK, 1.8); }).join('');
  }
  function lab(x, y, s) { return tx(x, y, s, 16, 'middle', RED, 'bold'); }
  function dotTri(n, cx, y0, sp) {
    let o = '';
    for (let r = 0; r < n; r++) for (let c = 0; c <= r; c++) o += ci(cx + (c - r / 2) * sp, y0 + r * sp, 4.5, BLUE, INK, 1);
    return o;
  }
  function stickTri(n, x0, y0, s) {
    const h = s * 0.866, pts = [];
    for (let k = 0; k <= n + 1; k++) pts.push([x0 + k * s / 2, k % 2 === 0 ? y0 + h : y0]);
    let o = pl(pts, INK, 3.5);
    for (let k = 0; k + 2 <= n + 1; k++) o += ln(pts[k][0], pts[k][1], pts[k + 2][0], pts[k + 2][1], INK, 3.5);
    return o;
  }
  function diamond(n, cx, cy, cs) {
    let o = '';
    for (let r = -(n - 1); r <= n - 1; r++) {
      const half = n - 1 - Math.abs(r);
      for (let c = -half; c <= half; c++) o += rc(cx + c * cs - cs / 2, cy + r * cs - cs / 2, cs, cs, BLUE, INK, 1.5);
    }
    return o;
  }
  const L4 = [[0, 0], [1, 0], [2, 0], [2, 1]];

  registerPuzzles('visual', [
    {
      q: 'Look at the pattern. Each figure has one more side than the one before, and the colours alternate. What comes in the box?',
      a: 'A white hexagon', w: ['A black hexagon', 'A white heptagon', 'A black pentagon'],
      bloom: 'Understand',
      diagram: svg(320, 120, [[3, INK], [4, '#fff'], [5, INK]].map(function (p, i) {
        return pg(regPoly(48 + i * 82, 60, 32, p[0], p[0] === 4 ? Math.PI / 4 : -Math.PI / 2), p[1], INK, 2.5);
      }).join('') + qBox(276, 32, 40, 56)),
      why: 'Triangle (3 sides), square (4), pentagon (5): the next has 6 sides, a hexagon. The colours go black, white, black, so the next is white.'
    },
    {
      q: 'The arrow turns the same amount clockwise each time. Which way does the arrow in the box point?',
      a: 'Down and to the right', w: ['Straight down', 'Up and to the right', 'Down and to the left'],
      bloom: 'Understand',
      diagram: svg(320, 120, [0, 45, 90].map(function (d, i) { return arrowAt(45 + i * 80, 60, d, 64); }).join('') + qBox(262, 28, 48, 64)),
      why: 'The arrow turns 45° clockwise each step: up, up-right, right, and next down-right.'
    },
    {
      q: 'A triangle of dots grows by one row each time: Figure 1 has 1 dot, Figure 2 has 3, Figure 3 has 6, Figure 4 has 10. How many dots are in Figure 10?',
      n: 55, bloom: 'Apply',
      diagram: svg(320, 115, [1, 2, 3, 4].map(function (n, i) { const cx = [30, 90, 165, 255][i]; return dotTri(n, cx, 18, 18) + tx(cx, 100, 'Fig ' + n, 13); }).join('')),
      why: 'Each new figure adds a row with as many dots as its number, so Figure 10 has 1 + 2 + 3 + ... + 10 = 55 dots.'
    },
    {
      q: 'The shaded quarter of the circle moves to the next quarter clockwise in every figure. Which quarter is shaded in Figure 10?',
      a: 'Top right', w: ['Top left', 'Bottom right', 'Bottom left'],
      bloom: 'Analyze',
      diagram: svg(320, 120, [0, 1, 2].map(function (q, i) { return quadShade(45 + i * 85, 55, 32, q) + tx(45 + i * 85, 108, 'Fig ' + (i + 1), 13); }).join('') + qBox(262, 23, 48, 64) + tx(286, 108, 'Fig 4', 13)),
      why: 'The pattern repeats every 4 figures. Figure 9 is back at top left (like Figure 1), so Figure 10 is at top right (like Figure 2).'
    },
    {
      q: 'A row of triangles is built from matchsticks as shown. The pattern goes on. How many matchsticks are needed for a row of 10 triangles?',
      n: 21, bloom: 'Analyze',
      diagram: svg(320, 110, [1, 2, 3].map(function (n, i) { const x0 = [22, 100, 185][i]; return stickTri(n, x0, 15, 44) + tx(x0 + (n + 1) * 11, 96, n + (n === 1 ? ' triangle' : ' triangles'), 13); }).join('')),
      why: 'One triangle needs 3 sticks, and every extra triangle needs 2 more: 3, 5, 7, ... so n triangles need 2n + 1 sticks. For 10 triangles: 21.'
    },
    {
      q: 'Squares are added to a rectangle like a spiral: each new square sits on the longest side of the rectangle so far. The squares so far have sides 1, 1, 2, 3 and 5. What is the side of the next square?',
      n: 8, bloom: 'Analyze',
      diagram: svg(320, 150, [[0, 0, 5], [5, 0, 3], [5, 3, 2], [7, 3, 1], [7, 4, 1]].map(function (f, i) {
        return rc(64 + f[0] * 24, 20 + f[1] * 24, f[2] * 24, f[2] * 24, ['#dbe6fb', '#fbe7b7', '#d6f0df', '#f8d8d4', '#f8d8d4'][i], INK, 2) + tx(64 + (f[0] + f[2] / 2) * 24, 20 + (f[1] + f[2] / 2) * 24 + 6, f[2], 16, 'middle', INK, 'bold');
      }).join('')),
      why: 'The rectangle is 8 wide and 5 tall, so the new square sits on the side of length 8. This is the Fibonacci pattern: 1, 1, 2, 3, 5, 8, ...'
    },
    {
      q: 'The tile figure grows by adding a ring of squares each time. Figure 1 has 1 square, Figure 2 has 5 and Figure 3 has 13. How many squares are in Figure 5?',
      n: 41, bloom: 'Analyze',
      diagram: svg(320, 140, [1, 2, 3].map(function (n, i) { const cx = [40, 120, 235][i]; return diamond(n, cx, 62, 18) + tx(cx, 130, 'Fig ' + n, 13); }).join('')),
      why: 'Figure n has rows of 1, 3, 5, ... up to 2n-1 squares and back down. Figure 5: 1+3+5+7+9+7+5+3+1 = 41.'
    },
    {
      q: 'One of these four shapes has a dent: it points inwards at one corner, unlike the others. Which one?',
      a: 'C', w: ['A', 'B', 'D'], bloom: 'Understand',
      diagram: svg(320, 170,
        pg(regPoly(55, 55, 34, 5), '#fff', INK, 2.5) + lab(55, 112, 'A') +
        pg([[130, 32], [200, 32], [188, 82], [142, 82]], '#fff', INK, 2.5) + lab(165, 112, 'B') +
        pg([[240, 30], [300, 82], [270, 62], [240, 82]], '#fff', INK, 2.5) + lab(270, 112, 'C') +
        pg([[130, 130], [190, 130], [160, 165]], '#fff', INK, 2.5) + lab(210, 155, 'D')),
      why: 'A shape with an inward "dent" (an angle bigger than 180°) is called concave. Shape C is an arrowhead with such a dent; the other three bulge outwards at every corner.'
    },
    {
      q: 'Three of these four shapes have at least one line of symmetry (a mirror line). Which shape has none?',
      a: 'B', w: ['A', 'C', 'D'], bloom: 'Analyze',
      diagram: svg(320, 150,
        pg([[14, 78], [44, 26], [74, 78]], '#fff', INK, 2.5) + lab(44, 112, 'A') +
        pg([[100, 78], [124, 30], [180, 30], [156, 78]], '#fff', INK, 2.5) + lab(140, 112, 'B') +
        rc(206, 30, 44, 48, '#fff', INK, 2.5) + lab(228, 112, 'C') +
        pg([[268, 78], [280, 30], [304, 30], [316, 78]], '#fff', INK, 2.5) + lab(292, 112, 'D')),
      why: 'A is an equilateral triangle, C a rectangle and D a trapezoid with equal slanted sides: each can be folded onto itself. B is a leaning parallelogram (unequal sides, no right angles), which has no mirror line.'
    },
    {
      q: 'Three of these four L-shaped blocks are the same block turned around. One is its mirror image and can never match by turning. Which one?',
      a: 'A', w: ['B', 'C', 'D'], bloom: 'Analyze',
      diagram: (function () {
        const opts = [rot90(mirrorCells(L4), 3), rot90(L4, 1), rot90(L4, 2), L4];
        let o = '';
        opts.forEach(function (c, i) { const x = 24 + i * 76; o += drawCells(c, x, 22, 22) + lab(x + 22, 128, 'ABCD'[i]); });
        return svg(320, 140, o);
      })(),
      why: 'B, C and D are the same L-block turned 90°, 180° or not at all. A is a flipped copy: hold up a mirror and you get A, but no turning of an L ever changes its handedness.'
    },
    {
      q: 'Three of these rectangles are exact copies of one another at different sizes (same shape, just scaled; a rectangle turned sideways still counts as the same shape). Which rectangle has a different shape?',
      a: 'B', w: ['A', 'C', 'D'], bloom: 'Evaluate',
      diagram: (function () {
        const dims = [[3, 6], [4, 9], [5, 10], [8, 4]];
        let o = '', x = 10;
        dims.forEach(function (d, i) {
          const w = d[0] * 8, h = d[1] * 8;
          o += rc(x, 14 + (80 - h), w, h, '#dbe6fb', INK, 2) + lab(x + w / 2, 118, 'ABCD'[i]) + tx(x + w / 2, 138, d[0] + '×' + d[1], 13);
          x += w + 26;
        });
        return svg(320, 145, o);
      })(),
      why: 'Compare the long side to the short side. A: 6 to 3 is 2 to 1. C: 10 to 5 is 2 to 1. D: 8 to 4 is 2 to 1. But B: 9 to 4 is 2.25 to 1, so B is the odd one out.'
    }
  ]);

  // ============ Batch 3: matchsticks and grid paths ============
  const STICK = '#c0762b';
  function digit7(x, y, d) {
    const w = 26, h = 48, m = h / 2;
    const segs = {
      a: [x + 3, y, x + w - 3, y], b: [x + w, y + 3, x + w, y + m - 3], c: [x + w, y + m + 3, x + w, y + h - 3],
      d: [x + 3, y + h, x + w - 3, y + h], e: [x, y + m + 3, x, y + h - 3], f: [x, y + 3, x, y + m - 3], g: [x + 3, y + m, x + w - 3, y + m]
    };
    const on = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' }[d];
    return on.split('').map(function (k) { const s = segs[k]; return ln(s[0], s[1], s[2], s[3], STICK, 6); }).join('');
  }
  function stickEq(a, op, b, c) {
    let o = digit7(40, 30, a);
    o += ln(96, 54, 120, 54, STICK, 6);
    if (op === '+') o += ln(108, 42, 108, 66, STICK, 6);
    o += digit7(146, 30, b);
    o += ln(196, 46, 220, 46, INK, 5) + ln(196, 62, 220, 62, INK, 5);
    o += digit7(252, 30, c);
    return svg(320, 110, o);
  }
  function stickSq(cols, rows, x0, y0, cs, colour) {
    let o = '';
    for (let r = 0; r <= rows; r++) for (let c = 0; c < cols; c++) o += ln(x0 + c * cs, y0 + r * cs, x0 + (c + 1) * cs, y0 + r * cs, colour || STICK, 5);
    for (let r = 0; r < rows; r++) for (let c = 0; c <= cols; c++) o += ln(x0 + c * cs, y0 + r * cs, x0 + c * cs, y0 + (r + 1) * cs, colour || STICK, 5);
    return o;
  }
  function cubeFrame() {
    const cs = 52, dx = 28, dy = -22, x0 = 90, y0 = 100;
    const P = function (i, j, k) { return [x0 + i * cs + k * dx, y0 + j * cs + k * dy]; };
    let o = '';
    for (let k = 2; k >= 0; k--) {
      for (let j = 0; j <= 2; j++) { const a = P(0, j, k), b = P(2, j, k); o += ln(a[0], a[1], b[0], b[1], k === 2 ? '#9aa1ad' : INK, 2.5); }
      for (let i = 0; i <= 2; i++) { const a = P(i, 0, k), b = P(i, 2, k); o += ln(a[0], a[1], b[0], b[1], k === 2 ? '#9aa1ad' : INK, 2.5); }
    }
    for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) { const a = P(i, j, 0), b = P(i, j, 2); o += ln(a[0], a[1], b[0], b[1], '#5b6472', 2); }
    return svg(320, 215, o);
  }
  // street grid: R rows x C columns of intersections
  function streets(R, C, x0, y0, sp, o) {
    o = o || {};
    let s = '';
    const X = function (c) { return x0 + c * sp; }, Y = function (r) { return y0 + r * sp; };
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (c < C - 1 && !(o.removedH || []).includes(r + ',' + c)) s += ln(X(c), Y(r), X(c + 1), Y(r), '#5b6472', 3);
      if (r < R - 1 && !(o.removedV || []).includes(r + ',' + c)) s += ln(X(c), Y(r), X(c), Y(r + 1), '#5b6472', 3);
      if (o.diag && r < R - 1 && c < C - 1) s += ln(X(c), Y(r), X(c + 1), Y(r + 1), '#5b6472', 2);
    }
    (o.removedH || []).forEach(function (k) {
      const p = k.split(',').map(Number); const mx = X(p[1]) + sp / 2, my = Y(p[0]);
      s += ln(mx - 8, my - 8, mx + 8, my + 8, RED, 3.5) + ln(mx - 8, my + 8, mx + 8, my - 8, RED, 3.5);
    });
    (o.removedV || []).forEach(function (k) {
      const p = k.split(',').map(Number); const mx = X(p[1]), my = Y(p[0]) + sp / 2;
      s += ln(mx - 8, my - 8, mx + 8, my + 8, RED, 3.5) + ln(mx - 8, my + 8, mx + 8, my - 8, RED, 3.5);
    });
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const k = r + ',' + c;
      if ((o.blocked || []).includes(k)) {
        s += ci(X(c), Y(r), 11, '#fff', RED, 3) + ln(X(c) - 6, Y(r) - 6, X(c) + 6, Y(r) + 6, RED, 3.5) + ln(X(c) - 6, Y(r) + 6, X(c) + 6, Y(r) - 6, RED, 3.5);
      } else if (o.via === k) s += ci(X(c), Y(r), 11, GOLD, INK, 2.5);
      else s += ci(X(c), Y(r), 5, INK, INK, 1);
    }
    s += tx(X(0) - 18, Y(0) - 10, 'A', 18, 'middle', BLUE, 'bold') + tx(X(C - 1) + 18, Y(R - 1) + 22, 'B', 18, 'middle', BLUE, 'bold');
    if (o.via) { const p = o.via.split(',').map(Number); s += tx(X(p[1]), Y(p[0]) + 5, 'C', 13, 'middle', INK, 'bold'); }
    return s;
  }
  function galton() {
    let s = '';
    const sp = 44, top = 44;
    for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) s += ci(160 + (c - r / 2) * sp, top + r * 34, 6, INK, INK, 1);
    s += tx(160, 16, 'drop', 13, 'middle', RED, 'bold');
    s += '<polygon points="160,32 154,20 166,20" fill="' + RED + '"/>';
    for (let i = 0; i < 5; i++) {
      const x = 160 + (i - 2) * sp;
      s += rc(x - 19, 170, 38, 34, i === 2 ? '#fbe7b7' : '#fff', INK, 2) + tx(x, 192, i === 2 ? 'M' : '', 15, 'middle', INK, 'bold');
    }
    return svg(320, 215, s);
  }

  registerPuzzles('visual', [
    {
      q: 'The matchstick equation is wrong. Move exactly <b>one</b> stick (take a stick from one place and put it down in another) so that the equation becomes true. The equals sign stays as it is. Which equation do you get?',
      a: '3 + 3 = 6', w: ['2 + 3 = 5', '2 + 4 = 6', '5 + 3 = 8'], bloom: 'Create',
      diagram: stickEq(2, '+', 3, 6),
      why: 'Slide the bottom-left stick of the 2 across to the bottom-right: the 2 turns into a 3 (one stick moved inside the same digit), and 3 + 3 = 6 is true. The other equations need more than one moved stick.'
    },
    {
      q: 'Move exactly <b>one</b> matchstick so that this equation is true. A plus sign may lose its upright stick and become a minus, and any stick may be added to a digit. The equals sign stays. Which equation do you get?',
      a: '9 − 7 = 2', w: ['5 + 4 = 9', '8 − 7 = 1', '5 − 3 = 2'],
      bloom: 'Create', diagram: stickEq(5, '+', 7, 2),
      why: 'Take the upright stick from the plus (it becomes a minus) and add it to the 5 at its top right: the 5 becomes a 9. Then 9 − 7 = 2. The other equations are not one move away.'
    },
    {
      q: 'Here is a false equation made of matchsticks. Move exactly <b>one</b> stick to make it true (the equals sign stays). What does the true equation say?',
      a: '3 + 6 = 9', w: ['9 − 6 = 3', '8 − 6 = 2', '3 + 5 = 8'], bloom: 'Analyze',
      diagram: stickEq(9, '+', 6, 5),
      why: 'Take the top-left stick off the 9 (it becomes a 3) and put it on the 5 at the top right (it becomes a 9). Now 3 + 6 = 9. No other single move works.'
    },
    {
      q: 'A 2×2 square made of 12 matchsticks holds 5 squares in all (4 small, 1 big). What is the <b>fewest</b> sticks you must take away so that no square of any size is left?',
      a: '3', w: ['2', '4', '6'], bloom: 'Create',
      diagram: svg(320, 190, stickSq(2, 2, 90, 15, 70)),
      why: 'Two sticks are not enough: to break all 4 small squares each stick must be a middle stick, and the only such pairs (the two halves of the middle line) leave the big outer square. Three work, for example the two top sticks and the lower half of the middle upright.'
    },
    {
      q: 'The big triangle is built from 18 matchsticks. What is the <b>fewest</b> sticks you must remove to leave no triangle of any size at all?',
      n: 6, bloom: 'Analyze', diagram: triGrid(3),
      why: 'The 6 small point-up triangles share no sticks, so at least 6 sticks must go. And 6 is enough: take away all the horizontal sticks, because every triangle here needs a horizontal side.'
    },
    {
      q: 'A ladder of squares is made from matchsticks. The 2×3 ladder needs 17 sticks. How many sticks does the 2×6 ladder need (2 rows of 6 squares)?',
      n: 32, bloom: 'Apply', diagram: svg(320, 150, stickSq(3, 2, 85, 20, 50)),
      why: 'Horizontal sticks: 3 rows of 6 sticks = 18. Upright sticks: 7 columns of 2 sticks = 14. Total 18 + 14 = 32.'
    },
    {
      q: 'A 2×2×2 cube frame (like a 3-D grid, with 27 joints) is built from matchsticks: one stick between every two neighbouring joints, as drawn. How many matchsticks does it need?',
      n: 54, bloom: 'Apply', diagram: cubeFrame(),
      why: 'Count the sticks in each of the three directions: 3 layers of 3 rows of 2 sticks makes 18 sticks per direction. 3 × 18 = 54.'
    },
    {
      q: 'You have exactly six identical matchsticks. Build <b>four</b> equilateral triangles, each side being one whole matchstick. How?',
      a: 'Make a 3-D pyramid with a triangle base', w: ['Lay them flat as a six-pointed star', 'Break two sticks in half', 'It cannot be done'],
      bloom: 'Create',
      why: 'On a flat table it is impossible, but a triangular pyramid (tetrahedron) has 6 edges and 4 triangular faces, and every edge is a whole stick.'
    },
    {
      q: 'Only moving right or down along the streets, how many different routes lead from A to B?',
      n: 6, bloom: 'Understand',
      diagram: svg(320, 215, streets(3, 3, 85, 35, 70)),
      why: 'Every route is 2 steps right and 2 steps down in some order: there are 6 orders (RRDD, RDRD, RDDR, DRRD, DRDR, DDRR).'
    },
    {
      q: 'The map shows streets with 3 blocks going across and 4 blocks going down. Moving only right or down, how many routes go from A to B?',
      n: 35, bloom: 'Apply',
      diagram: svg(320, 235, streets(5, 4, 97, 30, 42)),
      why: 'Each route has 3 steps right and 4 steps down in some order, i.e. 7 steps of which you choose 3 to be "right": 7×6×5 / (3×2×1) = 35.'
    }
  ]);

  // ============ Batch 4: more paths and chessboard puzzles ============
  const DARKSQ = '#aab4c8';
  function board(n, x0, y0, cs, fills, labels) {
    let o = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const f = fills && fills[r + ',' + c] !== undefined ? fills[r + ',' + c] : ((r + c) % 2 ? DARKSQ : '#fff');
      o += rc(x0 + c * cs, y0 + r * cs, cs, cs, f, INK, 1.2);
    }
    o += rc(x0, y0, n * cs, n * cs, 'none', INK, 2.5);
    if (labels) {
      for (let c = 0; c < n; c++) o += tx(x0 + c * cs + cs / 2, y0 + n * cs + 16, 'abcdefgh'[c], 13);
      for (let r = 0; r < n; r++) o += tx(x0 - 10, y0 + r * cs + cs / 2 + 5, n - r, 13);
    }
    return o;
  }
  function piece(r, c, glyph, x0, y0, cs, colour) {
    return tx(x0 + c * cs + cs / 2, y0 + r * cs + cs * 0.8, glyph, cs * 1.05, 'middle', colour || INK);
  }
  function crossCell(r, c, x0, y0, cs) {
    const a = x0 + c * cs + 4, b = y0 + r * cs + 4;
    return ln(a, b, a + cs - 8, b + cs - 8, RED, 3) + ln(a, b + cs - 8, a + cs - 8, b, RED, 3);
  }

  registerPuzzles('visual', [
    {
      q: 'The streets form a grid. The street with the red cross is closed. Moving only right or down, how many different routes lead from A to B?',
      n: 14, bloom: 'Analyze',
      diagram: svg(320, 225, streets(4, 4, 82, 35, 52, { removedH: ['1,1'] })),
      why: 'Write on every junction the number of ways to reach it, adding the ways from the left and from above. Row by row: 1 1 1 1, then 1 2 1 2, then 1 3 4 6, then 1 4 8 14. So 14 routes.'
    },
    {
      q: 'You must walk from A to B moving only right or down, and you must pass through the bakery at the gold junction C. How many routes are there?',
      n: 9, bloom: 'Apply',
      diagram: svg(320, 225, streets(4, 4, 82, 35, 52, { via: '1,2' })),
      why: 'Routes from A to C: 3 (one down and two right in some order). Routes from C to B: 3 (two down and one right). Multiply: 3 × 3 = 9.'
    },
    {
      q: 'Two junctions are closed for roadworks (crossed circles). Moving only right or down, how many routes lead from A to B without touching them?',
      n: 4, bloom: 'Analyze',
      diagram: svg(320, 225, streets(4, 4, 82, 35, 52, { blocked: ['1,1', '2,2'] })),
      why: 'Write on each junction the number of ways to reach it (a closed junction gets 0). Row by row: 1 1 1 1, then 1 0 1 2, then 1 1 0 2, then 1 2 2 4. So 4 routes.'
    },
    {
      q: 'The square blocks have diagonal shortcuts. Now you may move right, down, or diagonally down-right along a shortcut. How many routes lead from A to B?',
      n: 13, bloom: 'Analyze',
      diagram: svg(320, 215, streets(3, 3, 85, 35, 70, { diag: true })),
      why: 'Count the ways to reach each junction, adding the ways from the left, from above and from the diagonal. The first row and column are 1, 1; then 1, 3, 5; then 1, 5, 13. So 13.'
    },
    {
      q: 'A ball is dropped at the top of this peg board. At each peg it bounces left or right with equal chance. How many different paths lead to the middle slot M?',
      n: 6, bloom: 'Understand', diagram: galton(),
      why: 'The ball meets 4 pegs. To end in the middle slot it must go left twice and right twice, in any order: LLRR, LRLR, LRRL, RLLR, RLRL, RRLL = 6 paths.'
    },
    {
      q: 'Two opposite corners are cut off a chessboard, leaving 62 squares. Can 31 dominoes (2 touching squares each) cover it exactly?',
      a: 'No: it has 32 squares of one colour, 30 of the other',
      w: ['Yes: 62 is even, so 31 dominoes fit', 'Yes, if the first domino goes in the middle', 'No: 31 dominoes are too few'],
      bloom: 'Evaluate',
      diagram: svg(320, 230, board(8, 56, 10, 26, { '0,0': '#f4c7c3', '7,7': '#f4c7c3' }) + crossCell(0, 0, 56, 10, 26) + crossCell(7, 7, 56, 10, 26), 150),
      why: 'The two removed corners are the same colour, so 32 squares of one colour and 30 of the other remain. A domino always covers one light and one dark square, so 31 dominoes would need 31 of each colour. Impossible.'
    },
    {
      q: 'How many different ways can this 2×5 strip be covered exactly by 5 dominoes (each covers two touching squares and may stand upright or lie down)?',
      n: 8, bloom: 'Apply',
      diagram: svg(320, 130, gridSq(5, 2, 60, 20, 40, null, INK, 2.5)),
      why: 'Let f(n) be the ways for a 2×n strip. The last column holds one upright domino (leaving 2×(n-1)) or two lying dominoes (leaving 2×(n-2)), so f(n) = f(n-1) + f(n-2): 1, 2, 3, 5, 8. For n = 5: 8.'
    },
    {
      q: 'One square is missing from an 8×8 board (the crossed one). Can the other 63 squares be covered exactly with L-shaped pieces of 3 squares (like the one shown), wherever the missing square is?',
      a: 'Yes, whichever square is missing',
      w: ['No: 63 cannot be split into groups of 3', 'Only if the missing square is a corner', 'Only if the missing square is a light one'],
      bloom: 'Evaluate',
      diagram: svg(320, 235, board(8, 56, 10, 26, { '2,5': '#f4c7c3' }) + crossCell(2, 5, 56, 10, 26) + drawCells([[0, 0], [1, 0], [1, 1]], 282, 190, 14, GOLD)),
      why: '63 = 3 × 21, so the count works. Split the board into four 4×4 quarters; one L-piece placed at the centre covers one square in each quarter that has no hole. Now every quarter is a smaller board with one missing square, and the same trick repeats down to 2×2.'
    },
    {
      q: 'Place 4 queens on a 4×4 board so that none attacks another (same row, column or diagonal). One queen is on the top row, in column 2. Which column is the bottom-row queen in?',
      a: 'Column 3', w: ['Column 1', 'Column 2', 'Column 4'], bloom: 'Create',
      diagram: svg(320, 210, board(4, 80, 10, 40, null) + piece(0, 1, '♛', 80, 10, 40) + [0, 1, 2, 3].map(function (c) { return tx(80 + c * 40 + 20, 190, c + 1, 13); }).join('')),
      why: 'The queen on row 2 cannot be in columns 1, 2 or 3 (they are attacked), so it goes in column 4. Then row 3 must be column 1 and row 4 must be column 3. That is the only solution with the first queen there.'
    },
    {
      q: 'Kings attack every square touching them, including diagonally. What is the largest number of kings you can place on an 8×8 board so that no two attack each other?',
      n: 16, bloom: 'Analyze',
      diagram: svg(320, 235, board(8, 56, 10, 26, { '7,0': '#fbe7b7', '6,0': '#fbe7b7', '6,1': '#fbe7b7', '7,1': '#fbe7b7' }) + piece(7, 0, '♚', 56, 10, 26)),
      why: 'Cut the board into sixteen 2×2 blocks. Two kings in the same block would touch, so there is at most one king per block: at most 16. Putting a king in the same corner of every block reaches 16.'
    }
  ]);

  // ============ Batch 5: chess pieces and one-stroke drawings ============
  function houseFig() {
    let o = pg([[110, 100], [210, 100], [160, 40]], '#fff', INK, 3);
    o += rc(110, 100, 100, 100, 'none', INK, 3) + ln(110, 100, 210, 200, INK, 3) + ln(210, 100, 110, 200, INK, 3);
    [[110, 100], [210, 100], [160, 40], [110, 200], [210, 200], [160, 150]].forEach(function (p) { o += ci(p[0], p[1], 5, INK, INK, 1); });
    return svg(320, 220, o);
  }
  function cubeWire() {
    const f = [[70, 90], [170, 90], [170, 190], [70, 190]], dx = 60, dy = -50;
    const b = f.map(function (p) { return [p[0] + dx, p[1] + dy]; });
    let o = pg(b, 'none', INK, 3) + pg(f, 'none', INK, 3);
    for (let i = 0; i < 4; i++) o += ln(f[i][0], f[i][1], b[i][0], b[i][1], INK, 3);
    f.concat(b).forEach(function (p) { o += ci(p[0], p[1], 5, INK, INK, 1); });
    return svg(320, 215, o);
  }
  function bridgeIslands() {
    const BR = '#8b5a2b';
    let o = rc(30, 8, 260, 34, '#d6f0df', INK, 2) + tx(160, 31, 'North bank', 14) +
      rc(30, 178, 260, 34, '#d6f0df', INK, 2) + tx(160, 200, 'South bank', 14) +
      '<ellipse cx="100" cy="110" rx="42" ry="26" fill="#d6f0df" stroke="' + INK + '" stroke-width="2"/>' + tx(100, 115, 'Island I', 14) +
      '<ellipse cx="220" cy="110" rx="42" ry="26" fill="#d6f0df" stroke="' + INK + '" stroke-width="2"/>' + tx(220, 115, 'Island J', 14);
    o += ln(82, 42, 88, 88, BR, 6) + ln(112, 42, 112, 86, BR, 6);
    o += ln(100, 136, 100, 178, BR, 6);
    o += ln(220, 42, 220, 84, BR, 6);
    o += ln(205, 128, 205, 178, BR, 6) + ln(235, 128, 235, 178, BR, 6);
    o += ln(142, 110, 178, 110, BR, 6);
    return svg(320, 220, o);
  }

  registerPuzzles('visual', [
    {
      q: 'A knight jumps in an L: two squares in one direction and one square sideways. What is the fewest number of jumps it needs to get from a1 to h8 (opposite corners)?',
      n: 6, bloom: 'Analyze',
      diagram: svg(320, 245, board(8, 56, 10, 26, null, true) + piece(7, 0, '♞', 56, 10, 26) + ci(56 + 7 * 26 + 13, 10 + 13, 9, 'none', RED, 3)),
      why: 'Trying all knight routes step by step shows that h8 cannot be reached in fewer than 6 jumps. One 6-jump route is a1, b3, c5, d7, f8, g6, h8.'
    },
    {
      q: 'A queen moves any distance along a row, column or diagonal. On an empty 8×8 board, how many squares can the queen on d4 move to?',
      n: 27, bloom: 'Apply',
      diagram: svg(320, 245, board(8, 56, 10, 26, null, true) + piece(4, 3, '♛', 56, 10, 26)),
      why: 'Its row and column give 7 + 7 = 14 squares. Its two diagonals give 7 + 6 = 13 squares (one is longer). Total 14 + 13 = 27.'
    },
    {
      q: 'In how many different ways can 4 rooks be placed on a 4×4 board so that no two of them attack each other (a rook attacks along its row and column)?',
      n: 24, bloom: 'Apply',
      diagram: svg(320, 210, board(4, 80, 10, 40, { '0,0': '#fbe7b7', '0,1': '#fbe7b7', '0,2': '#fbe7b7', '0,3': '#fbe7b7', '1,0': '#fbe7b7', '2,0': '#fbe7b7', '3,0': '#fbe7b7' }) + piece(0, 0, '♜', 80, 10, 40) + tx(160, 195, 'the rook attacks the shaded squares', 13)),
      why: 'There is exactly one rook per row and per column. The first row can choose any of 4 columns, the second any of the remaining 3, the third any of 2, and the last has 1: 4 × 3 × 2 × 1 = 24.'
    },
    {
      q: 'A bishop moves any distance diagonally and stands on a1. Which of these squares can it reach after a few moves (no other pieces in the way)?',
      a: 'c5', w: ['b1', 'd1', 'h5'], bloom: 'Understand',
      diagram: svg(320, 245, board(8, 56, 10, 26, null, true) + piece(7, 0, '♝', 56, 10, 26)),
      why: 'A bishop always stays on squares of the same colour. a1 is dark, and c5 is dark (a1 to d4, then d4 to c5 in two moves), while b1, d1 and h5 are light.'
    },
    {
      q: 'What is the largest number of knights you can put on an 8×8 board so that no knight attacks another? (The knight in the picture shows its 8 attack squares.)',
      n: 32, bloom: 'Analyze',
      diagram: svg(320, 245, board(8, 56, 10, 26, { '3,2': '#fbe7b7', '3,4': '#fbe7b7', '5,2': '#fbe7b7', '5,4': '#fbe7b7', '2,3': '#fbe7b7', '2,5': '#fbe7b7', '6,3': '#fbe7b7', '6,5': '#fbe7b7' }, true) + piece(4, 3, '♞', 56, 10, 26)),
      why: 'A knight always jumps to a square of the other colour, so knights on all 32 light squares never attack each other. No more fit: cut the board into eight 2×4 blocks; each block has 4 pairs of squares a knight jump apart, so at most 4 knights per block: 8 × 4 = 32.'
    },
    {
      q: 'You want to draw this house in one continuous stroke, never lifting the pencil and never going over a line twice. Where must you start?',
      a: 'At one of the two bottom corners', w: ['At the tip of the roof', 'At the centre where the diagonals cross', 'At either top corner of the square'],
      bloom: 'Analyze', diagram: houseFig(),
      why: 'Only points where an odd number of lines meet can be a start or end. Each bottom corner has 3 lines (side, floor, diagonal); every other point has an even number of lines. So you start at one bottom corner and finish at the other.'
    },
    {
      q: 'The edges of a cube are drawn as a wire frame. You draw them with a pencil, never going over an edge twice, but you may lift the pencil. At least how many separate strokes do you need?',
      n: 4, bloom: 'Apply', diagram: cubeWire(),
      why: 'All 8 corners have 3 edges meeting, an odd number. Each stroke can only start and end at odd corners, so it uses up at most 2 of them: 8 odd corners need 8 ÷ 2 = 4 strokes.'
    },
    {
      q: 'A tourist wants to cross every bridge exactly once. Where can the walk start (it may end anywhere)?',
      a: 'Only on the North bank or the South bank', w: ['Only on Island I', 'On any of the four pieces of land', 'Only on Island J'],
      bloom: 'Analyze', diagram: bridgeIslands(),
      why: 'Count the bridges at each piece of land: North bank 3, South bank 3, Island I 4, Island J 4. A walk that uses every bridge once must start and end at the two odd places, so it starts on the North or South bank.'
    },
    {
      q: 'Lena draws 5 towns and roads between them and says: "Each town has exactly 3 roads leaving it." Is her drawing possible?',
      a: 'No: the road-ends would add up to 15, an odd number, but they come in pairs', w: ['Yes: just join every town to 3 others', 'Yes: draw a pentagon and add all the diagonals', 'No: every town would need at least 4 roads'],
      bloom: 'Evaluate',
      why: 'Every road has two ends, so the total number of road-ends is even. But 5 towns × 3 ends = 15 is odd. (A pentagon with all diagonals gives every town 4 roads, not 3.)'
    },
    {
      q: 'A pentagon has all five diagonals drawn. Can it be drawn in one stroke, never lifting the pencil or repeating a line?',
      a: 'Yes, and it can end where it started', w: ['Yes, but it must end at another corner', 'No: five corners have an odd number of lines', 'No: the crossing points block the way'],
      bloom: 'Evaluate', diagram: pentaDiag(true),
      why: 'At every corner 4 lines meet (2 sides and 2 diagonals), and at every crossing point 4 lines meet. All even, so a closed one-stroke tour exists.'
    }
  ]);

  // ============ Batch 6: networks and mazes ============
  function netDiagram(nodes, edges, unit) {
    let o = '';
    edges.forEach(function (e) {
      const a = nodes[e[0]], b = nodes[e[1]];
      o += ln(a[0], a[1], b[0], b[1], '#5b6472', 3);
    });
    edges.forEach(function (e) {
      const a = nodes[e[0]], b = nodes[e[1]];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      o += '<rect x="' + (mx - 13) + '" y="' + (my - 11) + '" width="26" height="22" rx="5" fill="#fff" stroke="#5b6472" stroke-width="1.5"/>' + tx(mx, my + 5, e[2] + (unit || ''), 14, 'middle', INK, 'bold');
    });
    Object.keys(nodes).forEach(function (k) {
      const p = nodes[k];
      o += ci(p[0], p[1], 16, '#dbe6fb', INK, 2.5) + tx(p[0], p[1] + 5, k, 15, 'middle', INK, 'bold');
    });
    return o;
  }
  function mazeSvg(rows, x0, y0, cs) {
    let o = '';
    for (let r = 0; r < rows.length; r++) for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c], x = x0 + c * cs, y = y0 + r * cs;
      if (ch === '#') o += '<rect x="' + x + '" y="' + y + '" width="' + cs + '" height="' + cs + '" fill="#3a3f4b"/>';
      else if (ch === 'S') o += '<rect x="' + x + '" y="' + y + '" width="' + cs + '" height="' + cs + '" fill="#bfe8cd"/>' + tx(x + cs / 2, y + cs / 2 + 5, 'S', 15, 'middle', INK, 'bold');
      else if (ch === 'E') o += '<rect x="' + x + '" y="' + y + '" width="' + cs + '" height="' + cs + '" fill="#f6c4bf"/>' + tx(x + cs / 2, y + cs / 2 + 5, 'E', 15, 'middle', INK, 'bold');
    }
    return o + rc(x0, y0, rows[0].length * cs, rows.length * cs, 'none', INK, 2);
  }
  const MAZE = [
    '###########',
    '#S    #   #',
    '# ### # # #',
    '#   #   # #',
    '### ##### #',
    '#   #     #',
    '# ### ### #',
    '# #   #   #',
    '# # ### ###',
    '#   #    E#',
    '###########'
  ];

  registerPuzzles('visual', [
    {
      q: 'A diagonal joins two corners that are <b>not</b> next to each other. How many diagonals does a hexagon (six corners) have?',
      n: 9, bloom: 'Apply',
      diagram: svg(320, 230, pg(regPoly(160, 115, 90, 6, Math.PI / 6)) + regPoly(160, 115, 90, 6, Math.PI / 6).map(function (p) { return ci(p[0], p[1], 5, INK, INK, 1); }).join('')),
      why: 'Each corner joins to 3 non-neighbours, giving 6 × 3 = 18, but every diagonal is counted from both of its ends, so 18 ÷ 2 = 9.'
    },
    {
      q: 'Five villages must be joined by roads so that you can travel between any two (directly or through other villages). The numbers show what each possible road costs. What is the smallest total cost of a network that connects all five?',
      n: 14, bloom: 'Create',
      diagram: svg(320, 220, netDiagram({ A: [45, 110], B: [130, 35], C: [130, 185], D: [230, 90], E: [275, 185] }, [['A', 'B', 7], ['A', 'C', 3], ['B', 'C', 4], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 6], ['D', 'E', 2]]) ),
      why: 'Always take the cheapest road that joins a new village without closing a loop: D-E (2), A-C (3), B-C (4), then B-D (5) joins the two groups. 2 + 3 + 4 + 5 = 14.'
    },
    {
      q: 'The numbers show the distances between places. What is the length of the shortest route from S to T?',
      n: 8, bloom: 'Analyze',
      diagram: svg(320, 220, netDiagram({ S: [35, 115], A: [125, 50], B: [110, 180], C: [215, 40], D: [215, 180], T: [285, 115] }, [['S', 'A', 4], ['S', 'B', 2], ['B', 'A', 1], ['A', 'C', 5], ['A', 'D', 3], ['B', 'D', 7], ['C', 'T', 3], ['D', 'T', 2]])),
      why: 'The route S-B-A-D-T is 2 + 1 + 3 + 2 = 8. The route with the fewest roads (S-B-D-T) costs 11 and S-A-D-T costs 9, so more roads can mean a shorter trip.'
    },
    {
      q: 'You may move one square at a time up, down, left or right (never diagonally, never through a dark wall). What is the fewest number of steps from S to E?',
      n: 24, bloom: 'Analyze',
      diagram: svg(320, 240, mazeSvg(MAZE, 50, 8, 20)),
      why: 'The shortest route is 4 right, 2 down, 2 right, 2 up, 2 right, 6 down, 2 left, 2 down, 2 right: 4+2+2+2+2+6+2+2+2 = 24 steps. Every other way ends at a wall or is longer.'
    }
  ]);

  // ============ Batch 7: cubes, dice and nets ============
  // isometric projection: i runs right-and-down, j runs left-and-down, k runs up
  function isoP(ox, oy, s) {
    const ax = s * 0.866, ay = s * 0.5;
    return function (i, j, k) { return [+(ox + (i - j) * ax).toFixed(1), +(oy + (i + j) * ay - k * s).toFixed(1)]; };
  }
  function quad(a, b, c, d, fill, sw) {
    return pg([a, b, c, d], fill, INK, sw || 2);
  }
  function isoBigCube(n, s, ox, oy, fillTop, fillL, fillR, holes) {
    const P = isoP(ox, oy, s);
    let o = quad(P(0, 0, n), P(n, 0, n), P(n, n, n), P(0, n, n), fillTop, 2.5);
    o += quad(P(0, n, 0), P(n, n, 0), P(n, n, n), P(0, n, n), fillL, 2.5);
    o += quad(P(n, 0, 0), P(n, n, 0), P(n, n, n), P(n, 0, n), fillR, 2.5);
    if (holes) {
      const h = 1, DK = '#3a3f4b';
      o += quad(P(h, h, n), P(h + 1, h, n), P(h + 1, h + 1, n), P(h, h + 1, n), DK, 2);
      o += quad(P(n, h, h), P(n, h + 1, h), P(n, h + 1, h + 1), P(n, h, h + 1), DK, 2);
      o += quad(P(h, n, h), P(h + 1, n, h), P(h + 1, n, h + 1), P(h, n, h + 1), DK, 2);
    }
    for (let t = 1; t < n; t++) {
      let a = P(t, 0, n), b = P(t, n, n); o += ln(a[0], a[1], b[0], b[1], INK, 1.5);
      a = P(0, t, n); b = P(n, t, n); o += ln(a[0], a[1], b[0], b[1], INK, 1.5);
      a = P(n, t, 0); b = P(n, t, n); o += ln(a[0], a[1], b[0], b[1], INK, 1.5);
      a = P(n, 0, t); b = P(n, n, t); o += ln(a[0], a[1], b[0], b[1], INK, 1.5);
      a = P(t, n, 0); b = P(t, n, n); o += ln(a[0], a[1], b[0], b[1], INK, 1.5);
      a = P(0, n, t); b = P(n, n, t); o += ln(a[0], a[1], b[0], b[1], INK, 1.5);
    }
    return o;
  }
  function isoStack(heights, s, ox, oy) {
    const P = isoP(ox, oy, s), cubes = [];
    heights.forEach(function (row, i) { row.forEach(function (h, j) { for (let k = 0; k < h; k++) cubes.push([i, j, k]); }); });
    cubes.sort(function (a, b) { return (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]); });
    let o = '';
    cubes.forEach(function (c) {
      const i = c[0], j = c[1], k = c[2];
      o += quad(P(i, j, k + 1), P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1), '#e8f0ff', 2);
      o += quad(P(i, j + 1, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1), '#a9c1ee', 2);
      o += quad(P(i + 1, j, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i + 1, j, k + 1), '#6f93d8', 2);
    });
    return o;
  }
  function pipsAt(O, U, V, n) {
    const L = {
      1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]],
      4: [[.25, .25], [.25, .75], [.75, .25], [.75, .75]], 5: [[.25, .25], [.25, .75], [.5, .5], [.75, .25], [.75, .75]],
      6: [[.25, .2], [.25, .5], [.25, .8], [.75, .2], [.75, .5], [.75, .8]]
    }[n];
    return L.map(function (p) { return ci(O[0] + p[0] * U[0] + p[1] * V[0], O[1] + p[0] * U[1] + p[1] * V[1], 4.6, INK, INK, 1); }).join('');
  }
  function isoDie(top, left, right) {
    const P = isoP(160, 108, 78);
    let o = quad(P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1), '#fff', 3);
    o += quad(P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1), '#f1f4fa', 3);
    o += quad(P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1), '#dfe6f3', 3);
    const d = function (a, b) { return [b[0] - a[0], b[1] - a[1]]; };
    o += pipsAt(P(0, 0, 1), d(P(0, 0, 1), P(1, 0, 1)), d(P(0, 0, 1), P(0, 1, 1)), top);
    o += pipsAt(P(0, 1, 1), d(P(0, 1, 1), P(1, 1, 1)), d(P(0, 1, 1), P(0, 1, 0)), left);
    o += pipsAt(P(1, 1, 1), d(P(1, 1, 1), P(1, 0, 1)), d(P(1, 1, 1), P(1, 1, 0)), right);
    return svg(320, 230, o);
  }
  function drawNet(rows, x0, y0, cs, labelOf) {
    let o = '';
    rows.forEach(function (row, r) {
      row.split('').forEach(function (ch, c) {
        if (ch === '.') return;
        o += rc(x0 + c * cs, y0 + r * cs, cs, cs, '#dbe6fb', INK, 2);
        const t = labelOf ? labelOf(ch, r, c) : '';
        if (t !== '' && t !== undefined) o += tx(x0 + c * cs + cs / 2, y0 + r * cs + cs / 2 + 6, t, cs > 30 ? 20 : 15, 'middle', INK, 'bold');
      });
    });
    return o;
  }

  registerPuzzles('visual', [
    {
      q: 'A 3×3×3 cube is painted blue on all six outside faces and then cut into 27 small cubes. How many of the small cubes have <b>exactly two</b> blue faces?',
      n: 12, bloom: 'Apply', diagram: svg(320, 240, isoBigCube(3, 33, 160, 119, '#9db9f0', '#8aa9e8', '#7297df')),
      why: 'Cubes with two painted faces sit on the edges of the big cube but not in its corners. There are 12 edges and only one such cube in the middle of each edge: 12.'
    },
    {
      q: 'A 4×4×4 cube is painted red on all six outside faces and then cut into 64 small cubes. How many of the small cubes have <b>exactly one</b> red face?',
      n: 24, bloom: 'Analyze', diagram: svg(320, 240, isoBigCube(4, 26, 160, 124, '#f3b3ab', '#eb9d94', '#e2887e')),
      why: 'A cube with exactly one painted face lies in the middle of a face, not on an edge. Each face has a 2×2 block of such cubes (4 cubes), and there are 6 faces: 6 × 4 = 24.'
    },
    {
      q: 'This solid is built from identical small cubes stacked in columns on the floor, with no gaps or hidden holes. Cubes hidden behind other cubes still count. The tallest column at the back is 3 cubes high. How many small cubes are used in all?',
      n: 14, bloom: 'Understand', diagram: svg(320, 235, isoStack([[3, 2, 1], [2, 2, 1], [1, 1, 1]], 28, 160, 110)),
      why: 'Count each column from back to front, row by row. The column heights are 3, 2, 1, then 2, 2, 1, then 1, 1, 1, so the total is 6 + 5 + 3 = 14.'
    },
    {
      q: 'On this die, opposite faces always add up to 7. What is the total number of pips on the <b>three faces you cannot see</b>?',
      n: 12, bloom: 'Understand', diagram: isoDie(5, 3, 1),
      why: 'The faces you cannot see are opposite to 5, 3 and 1, so they show 2, 4 and 6: 2 + 4 + 6 = 12. (Check: all six faces add to 21, and 21 − (5 + 3 + 1) = 12.)'
    },
    {
      q: 'This net folds into a die on which opposite faces add up to 7. What number goes on the blank face?',
      n: 6, bloom: 'Analyze',
      diagram: svg(320, 230, drawNet(['.X.', 'XXX', '.X.', '.X.'], 100, 25, 40, function (ch, r, c) { return { '0,1': 1, '1,0': 3, '1,1': 2, '1,2': 4, '3,1': 5 }[r + ',' + c] || ''; }) + tx(160, 134, '?', 26, 'middle', RED, 'bold')),
      why: 'In a straight strip of four squares, the 1st and 3rd faces end up opposite, as do the 2nd and 4th. The blank is the 3rd face, opposite the 1, so it must show 7 − 1 = 6. (Check: 2 and 5 are opposite and add to 7.)'
    },
    {
      q: 'Only one of these four flat shapes (nets) can be folded up into a cube with no overlaps and no gaps. Which one?',
      a: 'B', w: ['A', 'C', 'D'], bloom: 'Create',
      diagram: (function () {
        const cs = 22, nets = [['XXXXX', 'X....'], ['XX..', '.XXX', '...X'], ['XX..', 'XXXX'], ['X..X', 'XXXX']];
        const pos = [[10, 20], [170, 20], [10, 130], [170, 130]];
        let o = '';
        nets.forEach(function (n, i) { o += drawNet(n, pos[i][0] + 14, pos[i][1], cs) + lab(pos[i][0], pos[i][1] + 22, 'ABCD'[i]); });
        return svg(320, 215, o);
      })(),
      why: 'A has five squares in a row, which would wrap around and overlap. C has a 2×2 block, and D has two squares on the same side of the strip that land on top of each other. Net B (a 2-3-1 shape) folds into a cube.'
    },
    {
      q: 'This net is folded into a cube, with the letters on the outside. Which letter is on the face <b>opposite</b> the face marked B?',
      a: 'F', w: ['A', 'C', 'E'], bloom: 'Analyze',
      diagram: svg(320, 190, drawNet(['AB..', '.CDE', '...F'], 60, 22, 46, function (ch) { return ch; })),
      why: 'Fold the net step by step, or use the rule for a 2-3-1 net: A is opposite D, C is opposite E, and B is opposite F.'
    },
    {
      q: 'What is the fewest number of straight saw cuts that can cut a 3×3×3 cube into 27 small cubes, even if you may rearrange the pieces between cuts?',
      a: '6', w: ['3', '4', '9'], bloom: 'Evaluate',
      diagram: svg(320, 240, isoBigCube(3, 33, 160, 119, '#f6e3b0', '#efd48d', '#e6c470')),
      why: 'The small cube in the very middle has 6 faces, and every face must be made by a different cut (a cut makes at most one face of that cube). So at least 6 cuts are needed, and two cuts in each direction do it.'
    },
    {
      q: 'A 3×3×3 cube is made of 27 small cubes. The middle small cube of every face is pushed out, and so is the very centre cube, leaving tunnels through the cube in all three directions. How many small cubes remain?',
      n: 20, bloom: 'Apply', diagram: svg(320, 240, isoBigCube(3, 33, 160, 119, '#dbe6fb', '#c4d4f3', '#aabfe9', true)),
      why: '6 face-centre cubes plus the centre cube are removed, which is 7 cubes. 27 − 7 = 20 remain.'
    }
  ]);

  // ============ Batch 8: mirrors, folds, reflections, fractions ============
  function mirrorWord() {
    let o = '<g><text x="40" y="100" font-size="44" font-weight="bold" fill="' + INK + '">CAT</text></g>';
    o += '<g transform="translate(320 0) scale(-1 1)"><text x="40" y="100" font-size="44" font-weight="bold" fill="' + BLUE + '">CAT</text></g>';
    o += rc(154, 30, 12, 100, '#c9ced6', INK, 2.5);
    o += tx(85, 150, 'word', 14) + tx(235, 150, 'its mirror image', 14) + tx(160, 22, 'mirror', 13);
    return svg(320, 165, o);
  }
  function foldPunch() {
    let o = rc(15, 40, 60, 60, '#e8edf7', INK, 2.5) + ln(45, 36, 45, 104, RED, 2) + tx(45, 122, '1. fold', 13);
    o += ln(82, 70, 104, 70, INK, 2.5) + pg([[104, 64], [112, 70], [104, 76]], INK, INK, 1);
    o += rc(120, 40, 30, 60, '#dbe6fb', INK, 2.5) + ln(116, 70, 154, 70, RED, 2) + tx(135, 122, '2. fold', 13);
    o += ln(160, 70, 182, 70, INK, 2.5) + pg([[182, 64], [190, 70], [182, 76]], INK, INK, 1);
    o += rc(198, 55, 30, 30, '#dbe6fb', INK, 2.5) + ci(213, 70, 5, '#fff', INK, 2.5) + tx(213, 122, '3. punch', 13);
    return svg(320, 140, o);
  }
  function magicTri() {
    const T = [160, 34], L = [50, 195], R = [270, 195];
    const M = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    let o = pg([T, L, R], 'none', INK, 3);
    const pts = [[T, ''], [L, ''], [R, ''], [M(T, L), ''], [M(T, R), '5'], [M(L, R), '4']];
    pts.forEach(function (p) { o += ci(p[0][0], p[0][1], 19, p[1] ? '#fbe7b7' : '#fff', INK, 2.5) + (p[1] ? tx(p[0][0], p[0][1] + 6, p[1], 18, 'middle', INK, 'bold') : ''); });
    return svg(320, 225, o);
  }
  function reflectGrid() {
    const u = 25, x0 = 45, y0 = 200;
    let o = '';
    for (let i = 0; i <= 7; i++) {
      o += ln(x0 + i * u, y0, x0 + i * u, y0 - 7 * u, '#c9ced6', 1.5) + ln(x0, y0 - i * u, x0 + 7 * u, y0 - i * u, '#c9ced6', 1.5);
      o += tx(x0 + i * u, y0 + 18, i, 13) + tx(x0 - 12, y0 - i * u + 5, i, 13);
    }
    o += ln(x0, y0, x0, y0 - 7 * u, INK, 2.5) + ln(x0, y0, x0 + 7 * u, y0, INK, 2.5);
    o += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (x0 + 7 * u) + '" y2="' + (y0 - 7 * u) + '" stroke="' + BLUE + '" stroke-width="3" stroke-dasharray="7 5"/>';
    o += tx(x0 + 7 * u + 8, y0 - 7 * u - 2, 'mirror', 13, 'start', BLUE, 'bold');
    o += ci(x0 + 2 * u, y0 - 5 * u, 6, RED, INK, 1.5) + tx(x0 + 2 * u - 14, y0 - 5 * u - 8, 'P', 15, 'middle', RED, 'bold');
    return svg(320, 235, o);
  }
  const FCELLS = [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]];

  registerPuzzles('visual', [
    {
      q: 'You see this clock in a mirror, so the numbers appear back to front. What time is it really?',
      a: '8:20', w: ['3:40', '4:20', '9:40'], bloom: 'Understand',
      diagram: svg(320, 230, clock(160, 115, 92, 8, 20, true)),
      why: 'A mirror swaps left and right. Read as it appears, the clock says 3:40, but a mirror shows the time that is 12:00 minus the real time, so the real time is 12:00 − 3:40 = 8:20.'
    },
    {
      q: 'What is the smaller angle between the hour hand and the minute hand of this clock (in degrees)?',
      n: 105, bloom: 'Apply', diagram: svg(320, 230, clock(160, 115, 92, 2, 30, false)),
      why: 'The clock shows 2:30. The minute hand points at 6, which is 180° from 12. The hour hand is halfway between 2 and 3: 2.5 × 30° = 75°. The difference is 180° − 75° = 105°.'
    },
    {
      q: 'Standing next to a mirror, as in the picture, the word CAT appears back to front. Which of these words would look <b>exactly the same</b> as its own mirror image?',
      a: 'MOM', w: ['DAD', 'BOB', 'POP'], bloom: 'Evaluate', diagram: mirrorWord(),
      why: 'A mirror reverses the order of the letters AND flips each letter. All four words read the same backwards, but D, B and P become different shapes when flipped. M and O flip into themselves, so only MOM is unchanged.'
    },
    {
      q: 'A square sheet of paper is folded in half, then folded in half again the other way, and a single hole is punched through all the layers. How many holes are in the sheet when it is unfolded?',
      n: 4, bloom: 'Understand', diagram: foldPunch(),
      why: 'After two folds there are 4 layers on top of each other, and the punch goes through all of them, so unfolding shows 4 holes (one in each quarter of the sheet).'
    },
    {
      q: 'Put the numbers 1 to 6 in the six circles, each number once, so that every side of the triangle adds up to 9 (the 5 and 4 are already placed). Which number goes in the top circle?',
      n: 1, bloom: 'Create', diagram: magicTri(),
      why: 'The three sides add to 27, which is 21 (the numbers 1 to 6) plus the corners counted twice, so the corners add to 6: they are 1, 2 and 3. The 5 needs corners adding to 4 (1 and 3) and the 4 needs corners adding to 5 (2 and 3), so the right corner is 3, the top is 1 and the left is 2. Check: 1+6+2, 1+5+3, 2+4+3 all make 9.'
    },
    {
      q: 'The point P is reflected in the dashed mirror line (the diagonal through the origin). What are the coordinates of its mirror image?',
      a: '(5, 2)', w: ['(2, −5)', '(−2, 5)', '(−5, −2)'], bloom: 'Apply', diagram: reflectGrid(),
      why: 'P is at (2, 5). Reflecting in the line y = x swaps the two coordinates, so the image is at (5, 2), the same distance from the mirror on the other side.'
    },
    {
      q: 'The letter-like shape on top is turned <b>90° clockwise</b>. Which picture shows the result?',
      a: 'C', w: ['A', 'B', 'D'], bloom: 'Analyze',
      diagram: (function () {
        const cs = 16, opts = [rot90(FCELLS, 2), rot90(FCELLS, 3), rot90(FCELLS, 1), mirrorCells(rot90(FCELLS, 1))];
        let o = drawCells(FCELLS, 136, 12, cs, GOLD) + tx(230, 40, 'start', 14, 'start');
        opts.forEach(function (c, i) { const x = 20 + i * 75; o += drawCells(c, x, 100, cs) + lab(x + 24, 175, 'ABCD'[i]); });
        return svg(320, 190, o);
      })(),
      why: 'Turn the page a quarter turn to the right in your mind: the top of the shape goes to the right, and the right side goes to the bottom. Only C matches. A is turned a half turn, B a quarter turn the wrong way, and D is a flipped copy.'
    },
    {
      q: 'The corners of the inner square are the midpoints of the sides of the big square. What fraction of the big square is shaded?',
      a: '1/2', w: ['1/4', '1/3', '2/3'], bloom: 'Understand',
      diagram: svg(320, 210, rc(80, 15, 160, 160, '#fff', INK, 2.5) + pg([[160, 15], [240, 95], [160, 175], [80, 95]], '#9db9f0', INK, 2.5)),
      why: 'The two lines through the midpoints cut the big square into four equal quarters, and each side of the shaded square cuts its quarter exactly in half. So half of every quarter is shaded, which is 1/2 of the whole.'
    }
  ]);

  // ============ Batch 9: Venn diagrams, areas, number puzzles ============
  function sier(x, y, size, depth) {
    if (depth === 0) return '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" fill="#9db9f0" stroke="' + INK + '" stroke-width="1.2"/>';
    const h = size / 2;
    return sier(x, y, h, depth - 1) + sier(x, y + h, h, depth - 1) + sier(x + h, y + h, h, depth - 1);
  }
  function sierFig() {
    let o = '';
    [0, 1, 2].forEach(function (d, i) {
      const x = 15 + i * 105;
      o += sier(x, 20, 90, d) + rc(x, 20, 90, 90, 'none', INK, 2.5) + tx(x + 45, 132, ['start', 'step 1', 'step 2'][i], 14);
    });
    return svg(320, 145, o);
  }
  function venn2() {
    let o = rc(15, 15, 290, 185, '#fff', INK, 2.5);
    o += '<circle cx="125" cy="115" r="62" fill="#9db9f0" fill-opacity="0.55" stroke="' + INK + '" stroke-width="2.5"/>';
    o += '<circle cx="195" cy="115" r="62" fill="#f6c990" fill-opacity="0.55" stroke="' + INK + '" stroke-width="2.5"/>';
    o += tx(105, 36, 'Chess: 25', 14, 'middle', INK, 'bold') + tx(215, 36, 'Music: 22', 14, 'middle', INK, 'bold');
    o += tx(160, 122, '?', 26, 'middle', INK, 'bold') + tx(272, 188, '10', 20, 'middle', INK, 'bold') + tx(272, 168, 'neither', 12);
    return svg(320, 215, o);
  }
  function venn3() {
    let o = '<circle cx="125" cy="90" r="60" fill="#9db9f0" fill-opacity="0.45" stroke="' + INK + '" stroke-width="2.5"/>';
    o += '<circle cx="195" cy="90" r="60" fill="#f6c990" fill-opacity="0.45" stroke="' + INK + '" stroke-width="2.5"/>';
    o += '<circle cx="160" cy="150" r="60" fill="#a9dcb9" fill-opacity="0.45" stroke="' + INK + '" stroke-width="2.5"/>';
    [[100, 68, 5], [220, 68, 6], [160, 198, 4], [160, 66, 3], [128, 140, 2], [192, 140, 1], [160, 112, 2]].forEach(function (p) { o += tx(p[0], p[1], p[2], 18, 'middle', INK, 'bold'); });
    o += tx(58, 28, 'Pizza', 14, 'middle', INK, 'bold') + tx(262, 28, 'Pasta', 14, 'middle', INK, 'bold') + tx(160, 232, 'Salad', 14, 'middle', INK, 'bold');
    return svg(320, 240, o);
  }
  function vennBirds() {
    let o = '<circle cx="125" cy="105" r="70" fill="#9db9f0" fill-opacity="0.45" stroke="' + INK + '" stroke-width="2.5"/>';
    o += '<circle cx="195" cy="105" r="70" fill="#f6c990" fill-opacity="0.45" stroke="' + INK + '" stroke-width="2.5"/>';
    o += tx(90, 28, 'Birds', 15, 'middle', INK, 'bold') + tx(232, 28, 'Can fly', 15, 'middle', INK, 'bold');
    [[88, 108, 'Penguin'], [160, 108, 'Eagle'], [232, 108, 'Bat']].forEach(function (p) { o += ci(p[0], p[1] - 14, 4.5, INK, INK, 1) + tx(p[0], p[1] + 4, p[2], 13); });
    return svg(320, 200, o);
  }
  function twoSquares() {
    const u = 22;
    let o = rc(40, 20, 5 * u, 5 * u, '#dbe6fb', INK, 2.5) + rc(40 + 3 * u, 20 + 2 * u, 5 * u, 5 * u, '#fbe7b7', INK, 2.5);
    o += rc(40 + 3 * u, 20 + 2 * u, 2 * u, 3 * u, '#a9dcb9', INK, 2.5);
    o += tx(40 + 2.5 * u, 14, '5', 15) + tx(40 + 5.5 * u + 20, 20 + 4.5 * u, '5', 15) + tx(40 + 4 * u, 20 + 3.5 * u + 5, '2×3', 14, 'middle', INK, 'bold');
    return svg(320, 215, '<g transform="translate(0 12)">' + o + '</g>');
  }
  function pickFig() {
    const x0 = 50, y0 = 20, sp = 40, poly = [[1, 0], [5, 1], [4, 4], [1, 3]];
    let o = pg(poly.map(function (p) { return [x0 + p[0] * sp, y0 + p[1] * sp]; }), '#dbe6fb', BLUE, 3);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) o += ci(x0 + i * sp, y0 + j * sp, 4.5, INK, INK, 1);
    return svg(320, 200, o);
  }
  function pyramid() {
    const w = 62, h = 32, x0 = 36, y0 = 20;
    let o = '';
    for (let r = 0; r < 4; r++) {
      const n = 4 - r;
      for (let c = 0; c < n; c++) {
        const x = x0 + (r * w) / 2 + c * w, y = y0 + (3 - r) * h;
        const val = r === 0 ? [2, '?', 3, 5][c] : (r === 3 ? 31 : '');
        o += rc(x, y + 0, w, h, r === 0 && c === 1 ? '#fbe7b7' : '#dbe6fb', INK, 2) + (val !== '' ? tx(x + w / 2, y + 22, val, 17, 'middle', INK, 'bold') : '');
      }
    }
    return svg(320, 170, o);
  }
  function sudokuFig() {
    const g = [[0, 2, 0, 0], [3, 0, 0, 2], [0, 0, 4, 0], [0, 3, 0, 1]], x0 = 72, y0 = 15, cs = 44;
    let o = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const shade = r === 2 && c === 0;
      o += rc(x0 + c * cs, y0 + r * cs, cs, cs, shade ? '#fbe7b7' : '#fff', INK, 1.5);
      if (g[r][c]) o += tx(x0 + c * cs + cs / 2, y0 + r * cs + 30, g[r][c], 22, 'middle', INK, 'bold');
      if (shade) o += tx(x0 + c * cs + cs / 2, y0 + r * cs + 30, '?', 22, 'middle', RED, 'bold');
    }
    o += rc(x0, y0, 4 * cs, 4 * cs, 'none', INK, 4) + ln(x0 + 2 * cs, y0, x0 + 2 * cs, y0 + 4 * cs, INK, 4) + ln(x0, y0 + 2 * cs, x0 + 4 * cs, y0 + 2 * cs, INK, 4);
    return svg(320, 205, o);
  }

  registerPuzzles('visual', [
    {
      q: 'Start with a fully shaded square. At each step, every shaded square is cut into 4 equal smaller squares and the <b>top right</b> one is left unshaded. Steps 1 and 2 are shown. What fraction of the original square is shaded after step 3?',
      a: '27/64', w: ['9/16', '21/64', '81/256'], bloom: 'Analyze', diagram: sierFig(),
      why: 'Each step keeps 3 of every 4 parts, so the shaded fraction is multiplied by 3/4 each time: 3/4, then 9/16, then 27/64.'
    },
    {
      q: '40 children were asked about their hobbies. 25 play chess, 22 play music, and 10 play neither. How many children play <b>both</b> chess and music?',
      n: 17, bloom: 'Apply', diagram: venn2(),
      why: '40 − 10 = 30 children play at least one hobby. Adding 25 + 22 = 47 counts the children who play both twice, so the extra 47 − 30 = 17 are the ones who play both.'
    },
    {
      q: 'Each number shows how many students like exactly that combination of foods. How many students like <b>exactly two</b> of the three foods?',
      n: 6, bloom: 'Analyze', diagram: venn3(),
      why: 'Exactly two foods means the three parts where two circles overlap but not the centre: 3 + 2 + 1 = 6. The 2 in the very middle likes all three foods, so it is not counted.'
    },
    {
      q: 'The diagram shows some animals sorted into two overlapping circles. Which statement is true?',
      a: 'Some birds cannot fly', w: ['All birds can fly', 'Everything that can fly is a bird', 'No bird can fly'], bloom: 'Evaluate', diagram: vennBirds(),
      why: 'The penguin is inside Birds but outside Can fly, so some birds cannot fly. The eagle is in both circles, and the bat can fly without being a bird.'
    },
    {
      q: 'Two squares with sides of 5 units overlap in a 2 by 3 rectangle (green). What is the total area covered by the two squares together?',
      n: 44, bloom: 'Apply', diagram: twoSquares(),
      why: 'Each square has area 25, together 50, but the green overlap of 2 × 3 = 6 is counted twice. So the area covered is 50 − 6 = 44.'
    },
    {
      q: 'The dots are 1 unit apart. Use the dots to find the area of the four-sided shape, in square units. (Hint: count the dots inside and the dots on the edge.)',
      n: 11, bloom: 'Analyze', diagram: pickFig(),
      why: 'Pick\'s rule: area = (dots inside) + (dots on the edge) ÷ 2 − 1. Here 9 dots are inside and 6 are on the edge, so the area is 9 + 3 − 1 = 11.'
    },
    {
      q: 'In this number pyramid each brick shows the sum of the two bricks directly below it. What number belongs in the brick with the question mark?',
      n: 5, bloom: 'Apply', diagram: pyramid(),
      why: 'Call the missing number x. The second row is 2+x, x+3, 8; the third row is 5+2x and 11+x; and the top is 16 + 3x. Since the top is 31, 3x = 15, so x = 5.'
    },
    {
      q: 'Fill the grid with 1, 2, 3 and 4 so that every row, every column and every 2×2 box (thick lines) contains each number once. What goes in the shaded square?',
      n: 2, bloom: 'Create', diagram: sudokuFig(),
      why: 'The bottom-right box has 4 and 1, so it needs 2 and 3. The bottom row already has a 3, so the 2 goes in the bottom row and the 3 goes above it. That makes the bottom row 4, 3, 2, 1. Now the third row is missing 1 and 2 in its first two squares. Column 2 already has a 2 at the top, so the second square of row 3 is 1, and the shaded square is 2.'
    }
  ]);
})();
