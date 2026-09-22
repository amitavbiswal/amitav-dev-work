// ---- helpers ----------------------------------------------------------

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randIntNonZero(min, max) {
  let n;
  do { n = randInt(min, max); } while (n === 0);
  return n;
}

function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function reduceFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(num, den);
  return [num / g, den / g];
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Builds a set of 4 distinct MCQ choices (correct + 3 unique distractors).
function buildChoices(correct, distractorFn) {
  const set = new Set([String(correct)]);
  let guard = 0;
  while (set.size < 4 && guard < 200) {
    set.add(String(distractorFn()));
    guard++;
  }
  return shuffle(Array.from(set));
}

// ---- answer checking ----------------------------------------------------

function parseAnswerString(s) {
  if (s === null || s === undefined) return null;
  s = String(s).trim();
  if (s === '') return null;
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
      return null;
    }
  }
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}

function checkNumeric(userInput, correctAnswer, tolerance) {
  const val = parseAnswerString(userInput);
  if (val === null) return false;
  return Math.abs(val - correctAnswer) <= (tolerance !== undefined ? tolerance : 0.01);
}

// Converts textbook-style "x^7" or "10^-3" into HTML with a real superscript.
function supify(str) {
  return String(str).replace(/\^(-?\d+)/g, '<sup>$1</sup>');
}

// ---- Pythagorean triples for clean geometry answers ----------------------

const PYTHAGOREAN_TRIPLES = [
  [3, 4, 5], [6, 8, 10], [9, 12, 15], [5, 12, 13], [8, 15, 17],
  [7, 24, 25], [10, 24, 26], [20, 21, 29], [12, 16, 20], [9, 40, 41]
];

// ---- SVG diagram helpers --------------------------------------------------

const C_PRIMARY = '#4f46e5';
const C_MUTED = '#6b7280';
const C_TEXT = '#1f2937';
const C_BORDER = '#e5e7eb';
const C_GREEN = '#16a34a';

function numberLineSVG(min, max, value) {
  const width = 560, height = 90, padding = 30;
  const scale = (width - padding * 2) / (max - min);
  const xFor = v => padding + (v - min) * scale;
  const step = (max - min) > 24 ? 5 : 1;
  let ticks = '';
  for (let v = min; v <= max; v++) {
    const x = xFor(v);
    const isMajor = v % step === 0;
    ticks += `<line x1="${x}" y1="35" x2="${x}" y2="${isMajor ? 50 : 43}" stroke="${C_MUTED}" stroke-width="2"/>`;
    if (isMajor) ticks += `<text x="${x}" y="68" font-size="13" text-anchor="middle" fill="${C_MUTED}">${v}</text>`;
  }
  const vx = xFor(value);
  return `<svg viewBox="0 0 ${width} ${height}" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <line x1="${padding}" y1="40" x2="${width - padding}" y2="40" stroke="${C_MUTED}" stroke-width="2"/>
    ${ticks}
    <circle cx="${vx}" cy="40" r="7" fill="${C_PRIMARY}"/>
  </svg>`;
}

function barChartSVG(data) {
  const width = 480, height = 220, padding = 36;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const gap = (width - padding * 2) / data.length;
  const barWidth = gap * 0.55;
  let bars = '';
  data.forEach((d, i) => {
    const barHeight = (d.value / maxVal) * (height - padding * 2);
    const x = padding + i * gap + (gap - barWidth) / 2;
    const y = height - padding - barHeight;
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${C_PRIMARY}" rx="3"/>
      <text x="${x + barWidth / 2}" y="${height - padding + 18}" font-size="12" text-anchor="middle" fill="${C_MUTED}">${d.label}</text>
      <text x="${x + barWidth / 2}" y="${y - 6}" font-size="12" text-anchor="middle" fill="${C_TEXT}">${d.value}</text>`;
  });
  return `<svg viewBox="0 0 ${width} ${height}" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="${C_BORDER}" stroke-width="2"/>
    ${bars}
  </svg>`;
}

function pieSlicesSVG(segments) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = 100, cy = 100, r = 85;
  let angle = -90;
  let paths = '';
  segments.forEach(seg => {
    const sliceAngle = (seg.value / total) * 360;
    const start = angle, end = angle + sliceAngle;
    const large = sliceAngle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(start * Math.PI / 180);
    const y1 = cy + r * Math.sin(start * Math.PI / 180);
    const x2 = cx + r * Math.cos(end * Math.PI / 180);
    const y2 = cy + r * Math.sin(end * Math.PI / 180);
    paths += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${seg.color}" stroke="#fff" stroke-width="2"/>`;
    angle = end;
  });
  let legend = '';
  segments.forEach((seg, i) => {
    legend += `<rect x="210" y="${16 + i * 24}" width="14" height="14" fill="${seg.color}" rx="3"/>
      <text x="230" y="${28 + i * 24}" font-size="13" fill="${C_TEXT}">${seg.label}</text>`;
  });
  return `<svg viewBox="0 0 360 200" class="q-diagram" xmlns="http://www.w3.org/2000/svg">${paths}${legend}</svg>`;
}

function fractionSlicesSVG(total, filled) {
  const cx = 90, cy = 90, r = 75;
  let angle = -90;
  let paths = '';
  for (let i = 0; i < total; i++) {
    const sliceAngle = 360 / total;
    const start = angle, end = angle + sliceAngle;
    const large = sliceAngle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(start * Math.PI / 180);
    const y1 = cy + r * Math.sin(start * Math.PI / 180);
    const x2 = cx + r * Math.cos(end * Math.PI / 180);
    const y2 = cy + r * Math.sin(end * Math.PI / 180);
    paths += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${i < filled ? C_PRIMARY : '#f3f4f6'}" stroke="#fff" stroke-width="2"/>`;
    angle = end;
  }
  return `<svg viewBox="0 0 180 180" class="q-diagram" xmlns="http://www.w3.org/2000/svg">${paths}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C_BORDER}" stroke-width="2"/></svg>`;
}

function tapeDiagramSVG(parts, colors) {
  const total = parts.reduce((a, b) => a + b, 0);
  const width = 320, height = 60;
  let segs = ''; let x = 10;
  parts.forEach((p, i) => {
    const w = (p / total) * (width - 20);
    segs += `<rect x="${x}" y="15" width="${w}" height="30" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="1"/>
      <text x="${x + w / 2}" y="35" font-size="12" text-anchor="middle" fill="#fff">${p}</text>`;
    x += w;
  });
  return `<svg viewBox="0 0 ${width} 60" class="q-diagram" xmlns="http://www.w3.org/2000/svg">${segs}</svg>`;
}

function rectangleSVG(l, w) {
  return `<svg viewBox="0 0 260 160" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="30" width="180" height="90" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <text x="130" y="20" font-size="14" text-anchor="middle" fill="${C_TEXT}">${l}</text>
    <text x="240" y="80" font-size="14" text-anchor="middle" fill="${C_TEXT}">${w}</text>
  </svg>`;
}

function triangleSVG(base, height) {
  return `<svg viewBox="0 0 260 170" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <polygon points="40,140 220,140 110,25" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <line x1="110" y1="140" x2="110" y2="25" stroke="${C_MUTED}" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="130" y="160" font-size="13" text-anchor="middle" fill="${C_TEXT}">base = ${base}</text>
    <text x="118" y="85" font-size="13" fill="${C_TEXT}">height = ${height}</text>
  </svg>`;
}

function circleSVG(r) {
  return `<svg viewBox="0 0 220 160" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <circle cx="110" cy="80" r="65" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <line x1="110" y1="80" x2="175" y2="80" stroke="${C_MUTED}" stroke-width="2"/>
    <text x="140" y="72" font-size="13" fill="${C_TEXT}">r = ${r}</text>
  </svg>`;
}

function rightTriangleSVG(a, b, c) {
  return `<svg viewBox="0 0 260 200" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <polygon points="40,160 200,160 40,40" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <rect x="40" y="145" width="15" height="15" fill="none" stroke="${C_MUTED}" stroke-width="1.5"/>
    <text x="14" y="105" font-size="14" fill="${C_TEXT}">${a}</text>
    <text x="110" y="180" font-size="14" fill="${C_TEXT}">${b}</text>
    <text x="130" y="90" font-size="14" fill="${C_TEXT}">${c}</text>
  </svg>`;
}

function prismSVG(l, w, h) {
  return `<svg viewBox="0 0 260 200" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <polygon points="60,150 160,150 160,70 60,70" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <polygon points="60,70 90,40 190,40 160,70" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <polygon points="160,70 190,40 190,120 160,150" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <text x="110" y="170" font-size="13" text-anchor="middle" fill="${C_TEXT}">l = ${l}</text>
    <text x="30" y="115" font-size="13" fill="${C_TEXT}">h = ${h}</text>
    <text x="195" y="85" font-size="13" fill="${C_TEXT}">w = ${w}</text>
  </svg>`;
}

function cubeSVG(s) {
  return `<svg viewBox="0 0 220 200" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,150 140,150 140,70 50,70" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <polygon points="50,70 80,40 170,40 140,70" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <polygon points="140,70 170,40 170,120 140,150" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <text x="95" y="170" font-size="13" text-anchor="middle" fill="${C_TEXT}">s = ${s}</text>
  </svg>`;
}

function cylinderSVG(r, h) {
  return `<svg viewBox="0 0 220 220" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="110" cy="50" rx="60" ry="18" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <line x1="50" y1="50" x2="50" y2="170" stroke="${C_PRIMARY}" stroke-width="3"/>
    <line x1="170" y1="50" x2="170" y2="170" stroke="${C_PRIMARY}" stroke-width="3"/>
    <path d="M50,170 A60,18 0 0 0 170,170" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <text x="110" y="46" font-size="13" text-anchor="middle" fill="${C_TEXT}">r = ${r}</text>
    <text x="26" y="115" font-size="13" fill="${C_TEXT}">h = ${h}</text>
  </svg>`;
}

function coordinatePlaneSVG(opts) {
  const points = opts.points || [];
  const segments = opts.segments || [];
  const xMin = opts.xMin !== undefined ? opts.xMin : -10;
  const xMax = opts.xMax !== undefined ? opts.xMax : 10;
  const yMin = opts.yMin !== undefined ? opts.yMin : -10;
  const yMax = opts.yMax !== undefined ? opts.yMax : 10;
  const size = 300, padding = 20;
  const scaleX = (size - padding * 2) / (xMax - xMin);
  const scaleY = (size - padding * 2) / (yMax - yMin);
  const px = x => padding + (x - xMin) * scaleX;
  const py = y => size - padding - (y - yMin) * scaleY;
  let grid = '';
  for (let gx = Math.ceil(xMin); gx <= xMax; gx++) {
    grid += `<line x1="${px(gx)}" y1="${padding}" x2="${px(gx)}" y2="${size - padding}" stroke="#eef0f4" stroke-width="1"/>`;
  }
  for (let gy = Math.ceil(yMin); gy <= yMax; gy++) {
    grid += `<line x1="${padding}" y1="${py(gy)}" x2="${size - padding}" y2="${py(gy)}" stroke="#eef0f4" stroke-width="1"/>`;
  }
  const axisX = `<line x1="${padding}" y1="${py(0)}" x2="${size - padding}" y2="${py(0)}" stroke="${C_MUTED}" stroke-width="1.5"/>`;
  const axisY = `<line x1="${px(0)}" y1="${padding}" x2="${px(0)}" y2="${size - padding}" stroke="${C_MUTED}" stroke-width="1.5"/>`;
  const segEls = segments.map(s => `<line x1="${px(s.x1)}" y1="${py(s.y1)}" x2="${px(s.x2)}" y2="${py(s.y2)}" stroke="${C_PRIMARY}" stroke-width="2.5"/>`).join('');
  const ptEls = points.map(p => `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="5" fill="${p.color || C_PRIMARY}"/><text x="${px(p.x) + 8}" y="${py(p.y) - 8}" font-size="12" fill="${C_TEXT}">${p.label || ''}</text>`).join('');
  return `<svg viewBox="0 0 ${size} ${size}" class="q-diagram" xmlns="http://www.w3.org/2000/svg">${grid}${axisX}${axisY}${segEls}${ptEls}</svg>`;
}

function segmentThrough(px, py, m, ext) {
  ext = ext || 2.5;
  return { x1: px - ext, y1: py - m * ext, x2: px + ext, y2: py + m * ext };
}

// ---- question bank engine -------------------------------------------------

// A question's true identity for dedup purposes. Plain prompt text is the
// key for most questions — two questions with the same wording read as "the
// same question repeating" even if their answer choices differ underneath.
// Diagram questions are the exception: templates like "Which number does the
// dot represent..." intentionally reuse one generic prompt across many
// distinct pictures, and a different picture reads as a genuinely different
// question, so those are keyed on prompt+diagram+answer instead.
function questionIdentityKey(q) {
  if (q.diagram) {
    // Deliberately excludes `choices`: two questions showing the same
    // picture and asking the same thing with the same correct answer read
    // as "the same question" to a user even if the wrong-answer decoys
    // happen to differ, so the decoys shouldn't count toward uniqueness.
    return JSON.stringify([q.prompt, q.answer, q.correct, q.diagram]);
  }
  return q.prompt;
}

// Builds a bank of up to `count` DISTINCT questions by cycling round-robin
// through the topic's Bloom's-taxonomy templates, tagging each with its
// level. Templates backed by small fixed fact pools naturally run out of
// unique variants before reaching an even 1/6 share — when that happens
// their slot is skipped and reassigned to the next template in rotation,
// so no exact duplicate ever lands in the same topic's bank.
function makeBank(templates, count) {
  count = count || 50;
  const bank = [];
  const seen = new Set();
  const maxAttemptsPerSlot = 30;
  const maxTotalAttempts = count * 60;
  let templateIndex = 0;
  let totalAttempts = 0;

  while (bank.length < count && totalAttempts < maxTotalAttempts) {
    const t = templates[templateIndex % templates.length];
    templateIndex++;
    for (let attempt = 0; attempt < maxAttemptsPerSlot; attempt++) {
      const q = t.gen();
      totalAttempts++;
      const key = questionIdentityKey(q);
      if (!seen.has(key)) {
        seen.add(key);
        q.bloom = t.bloom;
        bank.push(q);
        break;
      }
      if (totalAttempts >= maxTotalAttempts) break;
    }
  }

  return bank;
}

function defineTopic(id, name, icon, templates, count) {
  const questions = makeBank(templates, count || 200);
  questions.forEach(q => { q._topicName = name; });
  return { id, name, icon, questions };
}

// =====================================================================
// GRADE 7 TOPICS
// =====================================================================

const integersTemplates = [
  { bloom: 'Remember', gen: () => {
    const n = randIntNonZero(-20, 20);
    if (Math.random() < 0.5) {
      return {
        prompt: `What is the absolute value of ${n}?`,
        type: 'numeric',
        answer: Math.abs(n),
        explanation: `The absolute value of a number is its distance from 0, which is always positive. |${n}| = ${Math.abs(n)}.`
      };
    }
    return {
      prompt: `What is the opposite of ${n}?`,
      type: 'numeric',
      answer: -n,
      explanation: `The opposite of a number flips its sign. The opposite of ${n} is ${-n}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const value = randInt(-9, 9);
    return {
      prompt: 'Which number does the dot represent on the number line below?',
      type: 'numeric',
      answer: value,
      diagram: numberLineSVG(-10, 10, value),
      explanation: `The dot sits above ${value} on the number line.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const a = randIntNonZero(-12, 12), b = randIntNonZero(-12, 12);
    const c = randIntNonZero(-9, 9), d = randIntNonZero(-20, 20);
    const answer = (a + b) * c - d;
    const dTerm = d >= 0 ? `- ${d}` : `+ ${Math.abs(d)}`;
    return {
      prompt: `(${a} + ${b}) × ${c} ${dTerm} = ?`,
      type: 'numeric',
      answer,
      explanation: `Parentheses first: ${a} + ${b} = ${a + b}. Then multiply: ${a + b} × ${c} = ${(a + b) * c}. Then ${d >= 0 ? 'subtract' : 'add'}: ${(a + b) * c} ${dTerm} = ${answer}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const a = randInt(2, 15), b = randInt(2, 15);
    const correct = `-${a} - (-${b}) = -${a} + ${b} = ${b - a}`;
    const choices = buildChoices(correct, () => choice([
      `-${a} - (-${b}) = -${a + b}`,
      `-${a} - (-${b}) = ${a - b}`,
      `-${a} - (-${b}) = -${a} - ${b} = ${-(a + b)}`
    ]));
    return {
      prompt: `Which shows the correct way to simplify -${a} - (-${b})?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Subtracting a negative is the same as adding: -${a} - (-${b}) = -${a} + ${b} = ${b - a}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const a = randInt(2, 9), b = randInt(2, 9);
    const options = [
      { text: `-${a} × -${b}`, positive: true },
      { text: `-${a} × ${b}`, positive: false },
      { text: `${a} × -${b}`, positive: false },
      { text: `-${a} - ${b}`, positive: false }
    ];
    const correctOpt = options.find(o => o.positive);
    const choices = shuffle(options.map(o => o.text));
    return {
      prompt: `Using a = ${a} and b = ${b}, which of these expressions results in a positive number?`,
      type: 'mcq',
      choices,
      correct: correctOpt.text,
      explanation: `A negative times a negative is positive: ${correctOpt.text} = ${a * b}. The others all give a negative result.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const start = randInt(-10, 20);
    let change = randIntNonZero(1, 15);
    while (change === start) change = randIntNonZero(1, 15);
    const dropped = Math.random() < 0.5;
    const correct = dropped ? `${start} - ${change}` : `${start} + ${change}`;
    const wrongsRaw = dropped
      ? [`${start} + ${change}`, `${change} - ${start}`, `${-start} - ${change}`, `${change} + ${start}`]
      : [`${start} - ${change}`, `${change} - ${start}`, `${-start} + ${change}`, `${change} + ${start}`];
    const wrongs = wrongsRaw.filter(w => w !== correct);
    const choices = buildChoices(correct, () => choice(wrongs));
    const scenario = dropped
      ? `The temperature started at ${start}°F and dropped ${change} degrees.`
      : `The temperature started at ${start}°F and rose ${change} degrees.`;
    return {
      prompt: `${scenario} Which expression represents the new temperature?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `"${dropped ? 'Dropped' : 'Rose'}" means we ${dropped ? 'subtract' : 'add'} the change from the start: ${correct}.`
    };
  }}
];

const fractionsTemplates = [
  { bloom: 'Remember', gen: () => {
    const pairs = [[1,3],[2,3],[1,6],[5,6],[1,7],[3,7],[1,8],[5,8],[7,8],[1,9],[5,9],[1,11],[5,11],[1,12],[7,12],[1,16],[7,16],[1,15],[7,15]];
    const [n, d] = choice(pairs);
    return {
      prompt: `What is ${n}/${d} written as a decimal? (round to the nearest hundredth)`,
      type: 'numeric',
      tolerance: 0.005,
      answer: round2(n / d),
      explanation: `Divide the numerator by the denominator: ${n} ÷ ${d} = ${round2(n / d)}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const total = randInt(4, 8);
    const filled = randInt(1, total - 1);
    const [rn, rd] = reduceFraction(filled, total);
    return {
      prompt: 'What fraction of the circle is shaded?',
      type: 'numeric',
      tolerance: 0.01,
      answer: filled / total,
      diagram: fractionSlicesSVG(total, filled),
      explanation: `${filled} out of ${total} equal slices are shaded: ${filled}/${total} = ${rn}/${rd}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const mode = choice(['addFrac', 'subFrac', 'mulFrac']);
    const d1 = randInt(2, 10), d2 = randInt(2, 10);
    const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
    let answerVal, opSymbol, explanation;
    if (mode === 'mulFrac') {
      const [rn, rd] = reduceFraction(n1 * n2, d1 * d2);
      answerVal = rn / rd;
      opSymbol = '×';
      explanation = `Multiply numerators and denominators: (${n1}×${n2})/(${d1}×${d2}) = ${n1 * n2}/${d1 * d2} = ${rn}/${rd}.`;
    } else {
      const commonDen = (d1 * d2) / gcd(d1, d2);
      const scaledN1 = n1 * (commonDen / d1);
      const scaledN2 = n2 * (commonDen / d2);
      const combinedNum = mode === 'addFrac' ? scaledN1 + scaledN2 : scaledN1 - scaledN2;
      const [rn, rd] = reduceFraction(combinedNum, commonDen);
      answerVal = rn / rd;
      opSymbol = mode === 'addFrac' ? '+' : '-';
      explanation = `Common denominator ${commonDen}: ${scaledN1}/${commonDen} ${opSymbol} ${scaledN2}/${commonDen} = ${combinedNum}/${commonDen} = ${rn}/${rd}.`;
    }
    return {
      prompt: `${n1}/${d1} ${opSymbol} ${n2}/${d2} = ?  <span class="hint">(fraction or decimal)</span>`,
      type: 'numeric',
      tolerance: 0.01,
      answer: answerVal,
      explanation
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const base = randInt(2, 6), k = randInt(2, 5);
    const num = base, den = base * 2;
    const correctEquivalents = [1, 2, 3].map(m => `${num * m}/${den * m}`);
    const wrongPair = `${num * k + 1}/${den * k}`;
    const choices = shuffle([...correctEquivalents.slice(0, 3), wrongPair]);
    return {
      prompt: `Which fraction is NOT equivalent to ${num}/${den}?`,
      type: 'mcq',
      choices,
      correct: wrongPair,
      explanation: `Equivalent fractions scale the numerator and denominator by the same factor. ${wrongPair} does not simplify to ${num}/${den}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    let n1, d1, n2, d2, v1, v2, guard = 0;
    do {
      d1 = randInt(3, 9); n1 = randInt(1, d1 - 1);
      d2 = randInt(3, 9); n2 = randInt(1, d2 - 1);
      v1 = n1 / d1; v2 = n2 / d2;
      guard++;
    } while (Math.abs(v1 - v2) < 0.02 && guard < 30);
    const bigger = v1 > v2 ? `${n1}/${d1}` : `${n2}/${d2}`;
    const choices = shuffle([`${n1}/${d1}`, `${n2}/${d2}`, 'They are equal', 'Cannot be determined']);
    return {
      prompt: `Which is greater: ${n1}/${d1} or ${n2}/${d2}?`,
      type: 'mcq',
      choices,
      correct: bigger,
      explanation: `${n1}/${d1} = ${round2(v1)} and ${n2}/${d2} = ${round2(v2)}, so ${bigger} is greater.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const whole = randInt(6, 16);
    const n = randInt(1, 4), d = randInt(n + 1, 6);
    const correct = `${n}/${d} of ${whole} items in a group`;
    const wrongs = [
      `${d}/${n} of ${whole} items in a group`,
      `${whole} divided evenly among ${n} people`,
      `${whole} increased by ${n}/${d}`
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which situation is best modeled by the expression ${n}/${d} × ${whole}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${n}/${d} × ${whole} means finding ${n}/${d} of a total of ${whole}, matching "${correct}."`
    };
  }}
];

const ratiosTemplates = [
  { bloom: 'Remember', gen: () => {
    const g = randInt(2, 6);
    let m1 = randInt(2, 6), m2 = randInt(2, 6);
    while (m2 === m1) m2 = randInt(2, 6);
    const a = m1 * g, b = m2 * g;
    const [rn, rd] = reduceFraction(a, b);
    const correct = `${rn}:${rd}`;
    const choices = buildChoices(correct, () => choice([`${a}:${b}`, `${rd}:${rn}`, `${rn + 1}:${rd}`]));
    return {
      prompt: `Simplify the ratio ${a}:${b} to lowest terms.`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Divide both parts by their greatest common factor (${gcd(a, b)}): ${a}:${b} = ${rn}:${rd}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    let a = randInt(2, 6), b = randInt(2, 6);
    while (b === a) b = randInt(2, 6);
    const diagram = tapeDiagramSVG([a, b], [C_PRIMARY, '#0891b2']);
    const correct = `${a}:${b}`;
    const choices = buildChoices(correct, () => choice([`${b}:${a}`, `${a + 1}:${b}`, `${a}:${b + 1}`]));
    return {
      prompt: 'The tape diagram shows red counters to blue counters. What is the ratio of red to blue?',
      type: 'mcq',
      choices,
      correct,
      diagram,
      explanation: `Reading the diagram directly, there are ${a} red for every ${b} blue, a ratio of ${a}:${b}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const a = randInt(2, 12), b = randInt(2, 12);
    const k = randInt(2, 8);
    const c = a * k, x = b * k;
    return {
      prompt: `${a} : ${b}  =  ${c} : x  &nbsp; Find x.`,
      type: 'numeric',
      answer: x,
      explanation: `${c} ÷ ${a} = ${k}, and the ratio is scaled by ${k}, so x = ${b} × ${k} = ${x}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const a = randInt(2, 6), b = randInt(2, 6);
    const correctPairs = [2, 3, 4].map(k => `${a * k}:${b * k}`);
    const wrongPair = `${a * 5 + 1}:${b * 5}`;
    const choices = shuffle([...correctPairs, wrongPair]);
    return {
      prompt: `A recipe uses a ratio of ${a}:${b}. Which of these mixtures is NOT in the same ratio?`,
      type: 'mcq',
      choices,
      correct: wrongPair,
      explanation: `Every equivalent mixture scales both parts by the same factor. ${wrongPair} breaks that pattern.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const price1 = randInt(8, 20), qty1 = randInt(3, 6);
    let price2 = randInt(8, 20), qty2 = randInt(3, 6);
    let rate1 = round2(price1 / qty1), rate2 = round2(price2 / qty2);
    let guard = 0;
    while (rate1 === rate2 && guard < 30) {
      price2 = randInt(8, 20); qty2 = randInt(3, 6);
      rate2 = round2(price2 / qty2);
      guard++;
    }
    const opt1 = `$${price1} for ${qty1} items ($${rate1}/item)`;
    const opt2 = `$${price2} for ${qty2} items ($${rate2}/item)`;
    const correct = rate1 < rate2 ? opt1 : opt2;
    const choices = shuffle([opt1, opt2, 'They cost the same', 'Cannot compare']);
    return {
      prompt: `Which unit rate is the better deal: $${price1} for ${qty1} items or $${price2} for ${qty2} items?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `$${price1}/${qty1} = $${rate1} per item, and $${price2}/${qty2} = $${rate2} per item. The lower unit price is the better deal.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const a = randInt(2, 5), b = randInt(2, 5);
    const total = (a + b) * randInt(3, 6);
    const k = total / (a + b);
    const correct = `${a * k}:${b * k}`;
    const wrongs = [`${a * k + 2}:${b * k - 2}`, `${a * (k + 1)}:${b * k}`, `${a * k}:${b * (k + 1)}`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which ratio is equivalent to ${a}:${b} with a total of ${total} parts?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Scale both parts by ${k} so they add to ${total}: ${a}×${k} : ${b}×${k} = ${correct}.`
    };
  }}
];

const percentTemplates = [
  { bloom: 'Remember', gen: () => {
    const pct = choice([8, 12, 15, 18, 24, 32, 35, 45, 65, 75, 85, 95]);
    const base = choice([20, 40, 60, 75, 80, 100, 120, 140, 150, 180, 200]);
    const answer = round2((pct / 100) * base);
    return {
      prompt: `What is ${pct}% of ${base}?`,
      type: 'numeric',
      tolerance: 0.05,
      answer,
      explanation: `${pct}% of ${base} = (${pct}/100) × ${base} = ${answer}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const pct = choice([10, 20, 30, 40, 50, 60, 70, 80, 90]);
    const filled = pct / 10;
    return {
      prompt: 'The circle is divided into 10 equal parts. What percent is shaded?',
      type: 'numeric',
      answer: pct,
      diagram: fractionSlicesSVG(10, filled),
      explanation: `${filled} out of 10 parts are shaded, which is ${filled}/10 = ${pct}%.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const mode = choice(['increase', 'decrease']);
    const pct = choice([5, 10, 15, 20, 25, 30, 40, 50]);
    const base = randInt(4, 40) * 5;
    const change = round2((pct / 100) * base);
    const answer = mode === 'increase' ? round2(base + change) : round2(base - change);
    const verb = mode === 'increase' ? 'increases' : 'is discounted';
    return {
      prompt: `A price of $${base} ${verb} by ${pct}%. What is the new price?`,
      type: 'numeric',
      answer,
      explanation: `${pct}% of $${base} is $${change}. ${mode === 'increase' ? `$${base} + $${change}` : `$${base} - $${change}`} = $${answer}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const old = choice([20, 25, 40, 50, 60, 80, 100]);
    const increase = choice([5, 10, 15, 20, 25, 30]);
    const newVal = old + increase;
    const correctPct = round2((newVal - old) / old * 100);
    const commonErrorPct = round2((newVal - old) / newVal * 100);
    const distractorPool = [`${commonErrorPct}%`, `${round2(newVal / old * 100)}%`, `${increase}%`, `${round2(correctPct / 2)}%`];
    const choices = buildChoices(`${correctPct}%`, () => choice(distractorPool));
    return {
      prompt: `A price rose from $${old} to $${newVal}. A student says that's a ${commonErrorPct}% increase because they divided the change by the new price. What is the correct percent increase?`,
      type: 'mcq',
      choices,
      correct: `${correctPct}%`,
      explanation: `Percent increase always uses the ORIGINAL value as the base: (${newVal} - ${old}) / ${old} × 100 = ${correctPct}%.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const base = choice([60, 80, 100, 120]);
    const pct = choice([10, 15, 20, 25, 30]);
    let flat = round2((pct / 100) * base) + choice([-5, 5]);
    if (flat <= 0) flat = round2((pct / 100) * base) + 5;
    const pctFinal = round2(base - (pct / 100) * base);
    const flatFinal = round2(base - flat);
    const opt1 = `${pct}% off $${base}`;
    const opt2 = `$${flat} off $${base}`;
    const correct = pctFinal <= flatFinal ? opt1 : opt2;
    const choices = shuffle([opt1, opt2, 'They are the same discount', 'Cannot be compared']);
    return {
      prompt: `Which is a better discount: ${opt1} or ${opt2}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${opt1} leaves a final price of $${pctFinal}, and ${opt2} leaves $${flatFinal}. The lower final price is the better deal.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const prices = [40, 50, 60, 80, 100, 120, 150, 200];
    const discounts = [10, 20, 25, 30, 50];
    const original = choice(prices);
    const discountPct = choice(discounts);
    const finalPrice = round2(original * (1 - discountPct / 100));
    const correct = `$${original} with ${discountPct}% off`;
    const distractors = [];
    let guard = 0;
    while (distractors.length < 3 && guard < 100) {
      guard++;
      const o2 = choice(prices), d2 = choice(discounts);
      const fp2 = round2(o2 * (1 - d2 / 100));
      const text = `$${o2} with ${d2}% off`;
      if (fp2 !== finalPrice && text !== correct && !distractors.includes(text)) distractors.push(text);
    }
    const choices = shuffle([correct, ...distractors]);
    return {
      prompt: `Which price and discount combination results in a final price of $${finalPrice}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `$${original} with ${discountPct}% off: $${original} × (1 - ${discountPct}/100) = $${finalPrice}.`
    };
  }}
];

const algebraTemplates = [
  { bloom: 'Remember', gen: () => {
    const a = randIntNonZero(-9, 9), b = randInt(-9, 9);
    const askCoef = Math.random() < 0.5;
    return {
      prompt: `In the expression ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}, what is the ${askCoef ? 'coefficient of x' : 'constant term'}?`,
      type: 'numeric',
      answer: askCoef ? a : b,
      explanation: askCoef
        ? `The coefficient is the number multiplying the variable: ${a}.`
        : `The constant term is the number without a variable: ${b}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const a = randInt(2, 9);
    let b = randInt(2, 12);
    while (b === a) b = randInt(2, 12);
    const correct = `${a}x + ${b}`;
    const wrongs = [`${b}x + ${a}`, `${a}(x + ${b})`, `x/${a} + ${b}`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which expression represents "${b} more than ${a} times a number"?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `"${a} times a number" is ${a}x, and "${b} more than" that means adding ${b}: ${correct}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const a = randIntNonZero(-9, 9), b = randIntNonZero(-9, 9), c = randInt(-9, 9);
    const x = randInt(-6, 6), y = randInt(-6, 6);
    const answer = a * x + b * y + c;
    const bTerm = b >= 0 ? `+ ${b}y` : `- ${Math.abs(b)}y`;
    const cTerm = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    return {
      prompt: `Evaluate ${a}x ${bTerm} ${cTerm} when x = ${x} and y = ${y}.`,
      type: 'numeric',
      answer,
      explanation: `Substitute x = ${x}, y = ${y}: ${a}(${x}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}(${y}) ${cTerm} = ${a * x} ${b * y >= 0 ? '+ ' + b * y : '- ' + Math.abs(b * y)} ${cTerm} = ${answer}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    const c = randInt(1, 12);
    const correctCoef = a + b;
    const correct = `${correctCoef}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
    const distractors = [
      `${correctCoef + 2}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`,
      `${correctCoef}x ${c >= 0 ? '- ' + c : '+ ' + Math.abs(c)}`,
      `${a - b}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`
    ];
    const choices = buildChoices(correct, () => choice(distractors));
    return {
      prompt: `Simplify: ${a}x + ${b}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Combine the like terms with x: ${a}x + ${b}x = ${correctCoef}x, so the expression simplifies to ${correct}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const a = randInt(3, 9), b = randInt(1, 12);
    const correct = `${a}x + ${a * b}`;
    const wrongs = [`${a}x + ${b}`, `x + ${a * b}`, `${a}x + ${b + a}`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which expression is equivalent to ${a}(x + ${b})?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Distribute ${a} to both terms inside the parentheses: ${a}(x + ${b}) = ${a}x + ${a}×${b} = ${correct}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const k = randInt(2, 8);
    const correct = `${k}x`;
    const wrongs = [`x^2`, `${k / 2}x`, `x + ${k}`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which expression could represent the perimeter of a shape made of ${k} equal sides of length x?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `The perimeter of a shape with ${k} equal sides of length x is ${k} × x = ${correct}.`
    };
  }}
];

const equationsTemplates = [
  { bloom: 'Remember', gen: () => {
    const x = randIntNonZero(-15, 15);
    const b = randInt(-15, 15);
    const rhs = x + b;
    return {
      prompt: `Solve for x:  &nbsp; x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${rhs}`,
      type: 'numeric',
      answer: x,
      explanation: `${b >= 0 ? `Subtract ${b} from` : `Add ${Math.abs(b)} to`} both sides: x = ${x}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const a = randIntNonZero(2, 9);
    const b = randIntNonZero(-15, 15);
    const step = b >= 0 ? `Subtract ${b} from both sides` : `Add ${Math.abs(b)} to both sides`;
    const wrongs = [`Divide both sides by ${a}`, `Multiply both sides by ${a}`, `Add ${b} to both sides`];
    const choices = shuffle([step, ...wrongs]);
    return {
      prompt: `Which is the correct first step to solve ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${a * randInt(-6,6) + b}?`,
      type: 'mcq',
      choices,
      correct: step,
      explanation: `To isolate the x-term first, ${step.toLowerCase()}, then divide by ${a}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const x = randIntNonZero(-12, 12);
    const a = randIntNonZero(-9, 9);
    const b = randInt(-15, 15);
    const rhs = a * x + b;
    return {
      prompt: `Solve for x:  &nbsp; ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${rhs}`,
      type: 'numeric',
      answer: x,
      explanation: `${b >= 0 ? `Subtract ${b} from` : `Add ${Math.abs(b)} to`} both sides: ${a}x = ${rhs - b}. Then divide by ${a}: x = ${x}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const a = randInt(2, 8);
    const trueX = randInt(2, 10);
    const n = randInt(1, 5);
    const b = a * n;
    const rhs = a * trueX + b;
    const wrongX = trueX + 2 * n;
    const explanationCorrect = `They added ${b} instead of subtracting it, getting x = ${wrongX} instead of the correct x = ${trueX}`;
    const wrongOpts = [
      `They divided incorrectly and should get x = ${trueX + 1}`,
      `The student's answer of x = ${wrongX} is actually correct`,
      `They forgot to simplify and the real answer is x = ${a}`
    ];
    const choices = shuffle([explanationCorrect, ...wrongOpts]);
    return {
      prompt: `A student solved ${a}x + ${b} = ${rhs} and got x = ${wrongX} (instead of x = ${trueX}). What mistake did they make?`,
      type: 'mcq',
      choices,
      correct: explanationCorrect,
      explanation: `Subtracting ${b} from both sides gives ${a}x = ${rhs - b} = ${a * trueX}, so x = ${trueX}. Getting x = ${wrongX} means they added ${b} to both sides instead of subtracting it.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const a = randIntNonZero(2, 6), c = randIntNonZero(1, a - 1 > 0 ? a - 1 : 1);
    const x = randIntNonZero(-8, 8);
    const b = randInt(-10, 10);
    const lhs = a * x + b;
    const d = lhs - c * x;
    const correct = String(x);
    const choices = buildChoices(correct, () => String(x + choice([-2, -1, 1, 2, 3])));
    return {
      prompt: `Which value of x makes the equation ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}x ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)} true?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Moving the x-terms to one side gives ${a - c}x = ${d - b}, so x = ${x}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const target = randInt(-9, 9) || 6;
    const a = randIntNonZero(2, 8);
    const b = randInt(-10, 10);
    const c = a * target + b;
    const correct = `${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`;
    const wrongs = [
      `${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c + a}`,
      `${a}x ${b >= 0 ? '+ ' + (b+1) : '- ' + Math.abs(b-1)} = ${c}`,
      `${a + 1}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which equation has a solution of x = ${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Substituting x = ${target} into ${correct} checks out: ${a}(${target}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}.`
    };
  }}
];

const SHAPE_FORMULA_POOL = [
  { shape: 'rectangle', asks: 'area', correct: 'length × width', wrongs: ['2 × (length + width)', 'length + width', '½ × base × height'] },
  { shape: 'rectangle', asks: 'perimeter', correct: '2 × (length + width)', wrongs: ['length × width', 'length + width', '½ × base × height'] },
  { shape: 'square', asks: 'area', correct: 'side × side', wrongs: ['4 × side', '2 × side', 'side + side'] },
  { shape: 'square', asks: 'perimeter', correct: '4 × side', wrongs: ['side × side', '2 × side', '½ × side × side'] },
  { shape: 'triangle', asks: 'area', correct: '½ × base × height', wrongs: ['base × height', 'base + height', '2 × base × height'] },
  { shape: 'circle', asks: 'area', correct: 'π × radius²', wrongs: ['2 × π × radius', 'π × diameter', 'radius²'] },
  { shape: 'circle', asks: 'circumference', correct: '2 × π × radius', wrongs: ['π × radius²', 'π × diameter²', 'radius × diameter'] }
];

const geometry7Templates = [
  { bloom: 'Remember', gen: () => {
    const entry = choice(SHAPE_FORMULA_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: `What is the formula for the ${entry.asks} of a ${entry.shape}?`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `The ${entry.asks} of a ${entry.shape} is found using ${entry.correct}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const l = randInt(4, 15), w = randInt(3, 12);
    return {
      prompt: 'Using the rectangle shown, what is its perimeter?',
      type: 'numeric',
      answer: 2 * (l + w),
      diagram: rectangleSVG(l, w),
      explanation: `Perimeter = 2 × (length + width) = 2 × (${l} + ${w}) = ${2 * (l + w)}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const shape = choice(['triangleArea', 'circleArea', 'circleCircumference']);
    if (shape === 'triangleArea') {
      const base = randInt(4, 20), height = randInt(3, 18);
      return {
        prompt: 'A triangle has the base and height shown. What is its area?',
        type: 'numeric',
        answer: round2((base * height) / 2),
        diagram: triangleSVG(base, height),
        explanation: `Area = (base × height) ÷ 2 = (${base} × ${height}) ÷ 2 = ${round2((base * height) / 2)}.`
      };
    }
    const r = randInt(2, 12);
    if (shape === 'circleArea') {
      return {
        prompt: 'A circle has the radius shown. What is its area? (use π ≈ 3.14, round to 2 decimals)',
        type: 'numeric',
        tolerance: 0.15,
        answer: round2(Math.PI * r * r),
        diagram: circleSVG(r),
        explanation: `Area = πr² = 3.14 × ${r}² = 3.14 × ${r * r} ≈ ${round2(Math.PI * r * r)}.`
      };
    }
    return {
      prompt: 'A circle has the radius shown. What is its circumference? (use π ≈ 3.14, round to 2 decimals)',
      type: 'numeric',
      tolerance: 0.15,
      answer: round2(2 * Math.PI * r),
      diagram: circleSVG(r),
      explanation: `Circumference = 2πr = 2 × 3.14 × ${r} ≈ ${round2(2 * Math.PI * r)}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const l = randInt(4, 12);
    const area = l * randInt(3, 9);
    const correctWidth = area / l;
    const choices = buildChoices(String(correctWidth), () => String(correctWidth + choice([-2, -1, 1, 2])));
    return {
      prompt: `A rectangle has area ${area} and length ${l}. A student says the width must be ${correctWidth + 1}. What is the actual width?`,
      type: 'mcq',
      choices,
      correct: String(correctWidth),
      explanation: `Width = area ÷ length = ${area} ÷ ${l} = ${correctWidth}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const half = randInt(7, 16);
    const perimeter = half * 2;
    let l1 = randInt(2, half - 2), w1 = half - l1;
    let l2, w2, guard = 0;
    do {
      l2 = randInt(2, half - 2);
      w2 = half - l2;
      guard++;
    } while ((l2 * w2 === l1 * w1 || (l2 === w1 && w2 === l1)) && guard < 30);
    const areaA = l1 * w1, areaB = l2 * w2;
    const correct = areaA > areaB ? `Shape A (${l1}×${w1})` : `Shape B (${l2}×${w2})`;
    const choices = shuffle([`Shape A (${l1}×${w1})`, `Shape B (${l2}×${w2})`, 'They have equal area', 'Cannot be determined']);
    return {
      prompt: `Shape A (${l1}×${w1}) and Shape B (${l2}×${w2}) both have a perimeter of ${perimeter}. Which shape has the larger area?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Shape A area = ${l1}×${w1} = ${areaA}. Shape B area = ${l2}×${w2} = ${areaB}. For a fixed perimeter, the more square-shaped rectangle has the larger area, so ${correct} wins.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const target = choice([24, 28, 30, 32, 36, 40, 42, 45, 48, 54, 60, 64, 72]);
    const divisors = [];
    for (let d = 2; d <= target / 2; d++) if (target % d === 0) divisors.push(d);
    const d = choice(divisors);
    const correctPair = [d, target / d];
    const correct = `${correctPair[0]} × ${correctPair[1]}`;
    const wrongs = [];
    let guard = 0;
    while (wrongs.length < 3 && guard < 100) {
      guard++;
      const l = randInt(2, 14), w = randInt(2, 14);
      const text = `${l} × ${w}`;
      if (l * w !== target && text !== correct && !wrongs.includes(text)) wrongs.push(text);
    }
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which set of dimensions creates a rectangle with area ${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct} = ${correctPair[0] * correctPair[1]}.`
    };
  }}
];

const data7Templates = [
  { bloom: 'Remember', gen: () => {
    const terms = [
      { term: 'Median', def: 'the middle value in an ordered data set' },
      { term: 'Mean', def: 'the sum of all values divided by how many there are' },
      { term: 'Mode', def: 'the value that appears most often' },
      { term: 'Range', def: 'the difference between the highest and lowest values' },
      { term: 'Outlier', def: 'a value much higher or lower than the rest of the data set' },
      { term: 'Frequency', def: 'how many times a value appears in a data set' }
    ];
    const target = choice(terms);
    const wrongs = shuffle(terms.filter(t => t !== target).map(t => t.term)).slice(0, 3);
    const choices = shuffle([target.term, ...wrongs]);
    return {
      prompt: `What do we call ${target.def}?`,
      type: 'mcq',
      choices,
      correct: target.term,
      explanation: `The ${target.term.toLowerCase()} is defined as ${target.def}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const red = randInt(2, 8), blue = randInt(2, 8), green = randInt(2, 8);
    const total = red + blue + green;
    const target = choice([['red', red, '#dc2626'], ['blue', blue, C_PRIMARY], ['green', green, C_GREEN]]);
    const [rn, rd] = reduceFraction(target[1], total);
    const diagram = pieSlicesSVG([
      { label: `Red (${red})`, value: red, color: '#dc2626' },
      { label: `Blue (${blue})`, value: blue, color: C_PRIMARY },
      { label: `Green (${green})`, value: green, color: C_GREEN }
    ]);
    return {
      prompt: `Using the bag shown, what is the probability of picking a ${target[0]} marble?`,
      type: 'numeric',
      tolerance: 0.01,
      answer: target[1] / total,
      diagram,
      explanation: `P(${target[0]}) = ${target[0]} marbles ÷ total marbles = ${target[1]}/${total} = ${rn}/${rd}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const mode = choice(['mean', 'median']);
    if (mode === 'mean') {
      const nums = Array.from({ length: 5 }, () => randInt(1, 30));
      const sum = nums.reduce((s, n) => s + n, 0);
      return {
        prompt: `Find the mean of: ${nums.join(', ')}`,
        type: 'numeric',
        tolerance: 0.05,
        answer: round2(sum / nums.length),
        explanation: `Mean = sum ÷ count = ${sum} ÷ ${nums.length} = ${round2(sum / nums.length)}.`
      };
    }
    const nums = Array.from({ length: 5 }, () => randInt(1, 40));
    const sorted = nums.slice().sort((a, b) => a - b);
    return {
      prompt: `Find the median of: ${nums.join(', ')}`,
      type: 'numeric',
      answer: sorted[2],
      explanation: `Sorted: ${sorted.join(', ')}. The middle value is ${sorted[2]}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const labels = ['A', 'B', 'C', 'D'];
    const values = labels.map(() => randInt(2, 12));
    const maxIdx = values.indexOf(Math.max(...values));
    const data = labels.map((l, i) => ({ label: l, value: values[i] }));
    return {
      prompt: 'Based on the bar chart, which category occurs most frequently (the mode category)?',
      type: 'mcq',
      choices: shuffle(labels.slice()),
      correct: labels[maxIdx],
      diagram: barChartSVG(data),
      explanation: `Category ${labels[maxIdx]} has the tallest bar with a value of ${values[maxIdx]}, so it is the mode.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const makeSet = () => {
      const size = randInt(4, 6);
      const vals = [];
      for (let i = 0; i < size; i++) vals.push(randInt(1, 30));
      return vals;
    };
    let aVals = makeSet(), bVals = makeSet();
    let rangeA = Math.max(...aVals) - Math.min(...aVals);
    let rangeB = Math.max(...bVals) - Math.min(...bVals);
    let guard = 0;
    while (rangeA === rangeB && guard < 20) {
      bVals = makeSet();
      rangeB = Math.max(...bVals) - Math.min(...bVals);
      guard++;
    }
    const correct = rangeA > rangeB ? 'Data set A' : 'Data set B';
    const choices = shuffle(['Data set A', 'Data set B', 'They are equal', 'Cannot be determined']);
    return {
      prompt: `Data set A: ${aVals.join(', ')}. Data set B: ${bVals.join(', ')}. Which data set has the greater range?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Range A = ${Math.max(...aVals)} - ${Math.min(...aVals)} = ${rangeA}. Range B = ${Math.max(...bVals)} - ${Math.min(...bVals)} = ${rangeB}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const target = randInt(6, 15);
    const a = randInt(1, target - 1), b = randInt(1, target - 1);
    const c = target * 3 - a - b;
    const correct = c > 0 ? `${a}, ${b}, ${c}` : `${a + 1}, ${b + 1}, ${target * 3 - a - b - 2}`;
    const parts = correct.split(', ').map(Number);
    const wrongs = [
      parts.map(n => n + 1).join(', '),
      parts.map(n => n + 2).join(', '),
      parts.slice().reverse().map((n,i)=> i===0? n+3 : n).join(', ')
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which data set has a mean of exactly ${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct} sums to ${parts.reduce((s,n)=>s+n,0)}, and ${parts.reduce((s,n)=>s+n,0)} ÷ 3 = ${target}.`
    };
  }}
];

const GRADE7_TOPICS = [
  defineTopic('integers', 'Integers', '➕', integersTemplates),
  defineTopic('fractions', 'Fractions & Decimals', '🍰', fractionsTemplates),
  defineTopic('ratios', 'Ratios & Proportions', '⚖️', ratiosTemplates),
  defineTopic('percent', 'Percentages', '💯', percentTemplates),
  defineTopic('algebra', 'Algebraic Expressions', '🔤', algebraTemplates),
  defineTopic('equations', 'One & Two-Step Equations', '🧮', equationsTemplates),
  defineTopic('geometry7', 'Geometry: Area & Perimeter', '📐', geometry7Templates),
  defineTopic('data7', 'Probability & Statistics', '🎲', data7Templates)
];

// =====================================================================
// GRADE 8 TOPICS
// =====================================================================

const exponentsTemplates = [
  { bloom: 'Remember', gen: () => {
    if (Math.random() < 0.5) {
      const letter = choice(['x', 'y', 'a', 'b', 'n', 'm']);
      return {
        prompt: `What does ${letter}^0 equal, for any nonzero ${letter}?`,
        type: 'mcq',
        choices: shuffle(['1', '0', letter, 'Undefined']),
        correct: '1',
        explanation: `Any nonzero number raised to the power of 0 equals 1, so ${letter}^0 = 1.`
      };
    }
    const base = randInt(2, 12), exp = randInt(2, 5);
    return {
      prompt: `Evaluate: ${base}^${exp}`,
      type: 'numeric',
      answer: Math.pow(base, exp),
      explanation: `${base}^${exp} means ${base} multiplied by itself ${exp} times, which equals ${Math.pow(base, exp)}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const letter = choice(['x', 'y', 'a', 'b']);
    const n = randInt(3, 12);
    const correct = `${letter}^${n}`;
    const wrongs = [`${n}${letter}`, `${letter}×${n}`, `${letter}^(1/${n})`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which expression means "${letter} multiplied by itself ${n} times"?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Multiplying ${letter} by itself ${n} times is written as ${letter}^${n}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const baseLetter = choice(['x', 'y', 'a', 'b']);
    const e1 = randInt(2, 6), e2 = randInt(2, 6);
    if (Math.random() < 0.5) {
      const correct = `${baseLetter}^${e1 + e2}`;
      const choices = buildChoices(correct, () => `${baseLetter}^${choice([e1 * e2, e1 + e2 + 1, Math.abs(e1 - e2), e1 + e2 - 1])}`);
      return {
        prompt: `Simplify: ${baseLetter}^${e1} × ${baseLetter}^${e2}`,
        type: 'mcq',
        choices,
        correct,
        explanation: `When multiplying powers with the same base, add the exponents: ${baseLetter}^${e1} × ${baseLetter}^${e2} = ${baseLetter}^(${e1}+${e2}) = ${correct}.`
      };
    }
    const big = Math.max(e1, e2) + 2, small = Math.min(e1, e2);
    const correct = `${baseLetter}^${big - small}`;
    const choices = buildChoices(correct, () => `${baseLetter}^${choice([big + small, big * small, Math.abs(big - small) + 1])}`);
    return {
      prompt: `Simplify: ${baseLetter}^${big} ÷ ${baseLetter}^${small}`,
      type: 'mcq',
      choices,
      correct,
      explanation: `When dividing powers with the same base, subtract the exponents: ${baseLetter}^${big} ÷ ${baseLetter}^${small} = ${baseLetter}^(${big}-${small}) = ${correct}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const baseLetter = choice(['x', 'y', 'a', 'b']);
    let e1 = randInt(2, 8), e2 = randInt(2, 8);
    while (e1 * e2 === e1 + e2) { e1 = randInt(2, 8); e2 = randInt(2, 8); }
    const correct = `They added the exponents instead of multiplying, so it should be ${baseLetter}^${e1 + e2}, not ${baseLetter}^${e1 * e2}`;
    const wrongs = [
      `They subtracted the exponents by mistake`,
      `The student's answer of ${baseLetter}^${e1 * e2} is actually correct`,
      `They should have multiplied the bases together`
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student simplified ${baseLetter}^${e1} × ${baseLetter}^${e2} as ${baseLetter}^${e1 * e2}. What was their mistake?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${baseLetter}^${e1} × ${baseLetter}^${e2} = ${baseLetter}^(${e1}+${e2}) = ${baseLetter}^${e1 + e2}. Multiplying the exponents (getting ${baseLetter}^${e1 * e2}) is a common error.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const base = choice(['x', 'y', 'a', 'b']);
    const n = randInt(2, 6);
    let m = randInt(2, 6);
    while (m === n) m = randInt(2, 6);
    const correct = `${base}^${n * m}`;
    const wrongs = [`${base}^${n + m}`, `${base}^${n}`, `${base}^${m}`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which expression is equivalent to (${base}^${n})^${m}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `A power raised to another power multiplies the exponents: (${base}^${n})^${m} = ${base}^(${n}×${m}) = ${correct}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const target = randInt(6, 50);
    const a = randInt(2, target - 2);
    const b = target - a;
    const correct = `a = ${a}, b = ${b}`;
    const wrongs = [`a = ${a + 1}, b = ${b}`, `a = ${a}, b = ${b + 1}`, `a = ${a - 1}, b = ${b - 1}`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which pair of exponents a and b makes x^a × x^b equal to x^${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `x^a × x^b = x^(a+b). We need a + b = ${target}, so a = ${a} and b = ${b} works since ${a} + ${b} = ${target}.`
    };
  }}
];

const SCINOTATION_FACT_POOL = [
  { q: "In scientific notation a × 10^n, what requirement must 'a' satisfy?", correct: '1 ≤ a < 10', wrongs: ['0 < a < 1', 'a must be a whole number', 'a can be any number'] },
  { q: 'In scientific notation, what does a NEGATIVE exponent (like 10^-3) indicate about the number?', correct: 'The number is smaller than 1', wrongs: ['The number is larger than 1', 'The number is negative', 'The exponent must be made positive first'] },
  { q: 'Why is scientific notation especially useful?', correct: 'It makes very large or very small numbers easier to read and compare', wrongs: ['It always makes a number smaller', 'It only works for whole numbers', 'It removes the need for units'] },
  { q: 'In 6.02 × 10^23, what does the exponent 23 tell you?', correct: 'How many places to move the decimal point to the right to get standard form', wrongs: ['How many times to add 10', 'The number of digits in 6.02', 'How many zeros are in the coefficient'] },
  { q: 'When multiplying two numbers written in scientific notation, what do you do with the exponents?', correct: 'Add them together', wrongs: ['Multiply them together', 'Subtract them', 'Ignore them'] },
  { q: 'When would you use scientific notation for a number SMALLER than 1?', correct: 'When the exponent on 10 is negative', wrongs: ['When the exponent on 10 is positive', 'Scientific notation cannot represent numbers smaller than 1', 'When the coefficient is negative'] }
];

const scinotationTemplates = [
  { bloom: 'Remember', gen: () => {
    const entry = choice(SCINOTATION_FACT_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: entry.q,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `${entry.q.replace('?','')} — ${entry.correct}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const mantissa = round2(randInt(11, 99) / 10);
    const exp = randInt(2, 6);
    const standard = mantissa * Math.pow(10, exp);
    const correct = `${mantissa} × 10^${exp}`;
    const wrongs = [`${mantissa * 10} × 10^${exp}`, `${round2(mantissa / 10)} × 10^${exp + 1}`, `${mantissa} × ${exp}^10`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which of these correctly represents ${standard.toLocaleString('en-US')} in scientific notation?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct} is valid because its coefficient (${mantissa}) is between 1 and 10.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const mantissa = round2(randInt(11, 99) / 10);
    const exp = randInt(2, 8);
    const toSci = Math.random() < 0.5;
    const standard = mantissa * Math.pow(10, exp);
    if (toSci) {
      const correct = `${mantissa} × 10^${exp}`;
      const choices = buildChoices(correct, () => `${mantissa} × 10^${choice([exp - 1, exp + 1, exp + 2])}`);
      return {
        prompt: `Write ${standard.toLocaleString('en-US')} in scientific notation.`,
        type: 'mcq',
        choices,
        correct,
        explanation: `Move the decimal point until one nonzero digit remains before it: ${standard.toLocaleString('en-US')} = ${correct}.`
      };
    }
    const correct = standard.toLocaleString('en-US');
    const choices = buildChoices(correct, () => (mantissa * Math.pow(10, choice([exp - 1, exp + 1, exp + 2]))).toLocaleString('en-US'));
    return {
      prompt: `Write ${mantissa} × 10^${exp} in standard form.`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Move the decimal point ${exp} places to the right: ${mantissa} × 10^${exp} = ${correct}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const mantissa = randInt(2, 9);
    const correctExp = randInt(3, 6);
    const value = mantissa * Math.pow(10, correctExp);
    const wrongExp = correctExp - 1;
    const correct = `They used the wrong exponent — it should be 10^${correctExp}, not 10^${wrongExp}`;
    const wrongs = [
      `The coefficient should be ${mantissa * 10}`,
      'They should not use scientific notation for this number',
      'There is no mistake'
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student wrote ${value.toLocaleString('en-US')} as ${mantissa}.0 × 10^${wrongExp}. What is their mistake?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${value.toLocaleString('en-US')} = ${mantissa} × 10^${correctExp}. Counting the decimal shift incorrectly leads to the wrong exponent.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    let options, texts, values;
    let guard = 0;
    do {
      options = [];
      const seen = new Set();
      while (options.length < 4) {
        const mantissa = randInt(1, 9), exp = randInt(2, 8);
        const key = `${mantissa}-${exp}`;
        if (!seen.has(key)) { seen.add(key); options.push({ mantissa, exp }); }
      }
      texts = options.map(o => `${o.mantissa} × 10^${o.exp}`);
      values = options.map(o => o.mantissa * Math.pow(10, o.exp));
      guard++;
    } while (values.filter(v => v === Math.max(...values)).length > 1 && guard < 50);
    const maxVal = Math.max(...values);
    const correct = texts[values.indexOf(maxVal)];
    return {
      prompt: `Which of these numbers is the largest: ${texts.join(', ')}?`,
      type: 'mcq',
      choices: shuffle(texts),
      correct,
      explanation: `Comparing exponents first (and coefficients when exponents tie), ${correct} is the largest.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const mantissa = randInt(1, 9);
    const exp = randInt(3, 6);
    const value = mantissa * Math.pow(10, exp);
    const correct = value.toLocaleString('en-US');
    const wrongs = [
      (mantissa * Math.pow(10, exp - 1)).toLocaleString('en-US'),
      (mantissa * Math.pow(10, exp + 1)).toLocaleString('en-US'),
      ((mantissa + 1) * Math.pow(10, exp)).toLocaleString('en-US')
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which value equals ${mantissa}.0 × 10^${exp}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${mantissa}.0 × 10^${exp} means moving the decimal ${exp} places right: ${correct}.`
    };
  }}
];

const linearEqTemplates = [
  { bloom: 'Remember', gen: () => {
    const x = randIntNonZero(-15, 15);
    const b = randInt(-15, 15);
    const rhs = x + b;
    return {
      prompt: `Solve for x:  &nbsp; x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${rhs}`,
      type: 'numeric',
      answer: x,
      explanation: `${b >= 0 ? `Subtract ${b} from` : `Add ${Math.abs(b)} to`} both sides: x = ${x}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const a = randIntNonZero(2, 6), b = randInt(-8, 8);
    const correct = `Distribute ${a} to get ${a}x ${a*b>=0?'+ '+a*b:'- '+Math.abs(a*b)} = ...`;
    const wrongs = ['Subtract from both sides before distributing', 'Divide both sides by the outer number immediately without distributing', 'Add to both sides before distributing'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which is the correct first step to solve ${a}(x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}) = 20?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `The correct approach is to distribute the outer number first before isolating x.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const x = randIntNonZero(-10, 10);
    if (Math.random() < 0.5) {
      const a = randIntNonZero(2, 6);
      const b = randInt(-8, 8);
      const inner = x + b;
      return {
        prompt: `Solve for x:  &nbsp; ${a}(x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}) = ${a * inner}`,
        type: 'numeric',
        answer: x,
        explanation: `Distribute: ${a}x ${a * b >= 0 ? '+ ' + a * b : '- ' + Math.abs(a * b)} = ${a * inner}. Then solve: ${a}x = ${a * inner - a * b}, so x = ${x}.`
      };
    }
    const a = randIntNonZero(2, 8);
    const c = randIntNonZero(1, a - 1 > 0 ? a - 1 : 1);
    const b = randInt(-10, 10);
    const d = randInt(-10, 10);
    const lhs = a * x + b;
    const rhs = c * x + d;
    return {
      prompt: `Solve for x:  &nbsp; ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}x ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)}`,
      type: 'numeric',
      answer: x,
      explanation: `Move the x terms to one side: ${a - c}x = ${d - b}. So x = ${x}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const a = randInt(2, 8);
    const trueX = randInt(2, 10);
    const n = randInt(1, 5);
    const b = a * n;
    const rhs = a * trueX + b;
    const wrongX = trueX + 2 * n;
    const correctText = `They added ${b} instead of subtracting it, getting x = ${wrongX} instead of the correct x = ${trueX}`;
    const wrongOpts = [
      `They divided incorrectly and should get x = ${trueX + 1}`,
      `The student's answer of x = ${wrongX} is actually correct`,
      `They forgot to simplify and the real answer is x = ${a}`
    ];
    const choices = shuffle([correctText, ...wrongOpts]);
    return {
      prompt: `A student solved ${a}x + ${b} = ${rhs} and got x = ${wrongX} (instead of x = ${trueX}). What mistake did they make?`,
      type: 'mcq',
      choices,
      correct: correctText,
      explanation: `Subtracting ${b} from both sides gives ${a}x = ${rhs - b} = ${a * trueX}, so x = ${trueX}. Getting x = ${wrongX} means they added ${b} instead of subtracting it.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const a = randIntNonZero(2, 6), c = randIntNonZero(1, a - 1 > 0 ? a - 1 : 1);
    const x = randIntNonZero(-8, 8);
    const b = randInt(-10, 10);
    const lhs = a * x + b;
    const d = lhs - c * x;
    const correct = String(x);
    const choices = buildChoices(correct, () => String(x + choice([-2, -1, 1, 2, 3])));
    return {
      prompt: `Which value of x makes the equation ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}x ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)} true?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Moving the x-terms to one side gives ${a - c}x = ${d - b}, so x = ${x}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const target = randInt(-9, 9) || -3;
    const a = randIntNonZero(2, 8);
    const b = randInt(-10, 10);
    const c = a * target + b;
    const correct = `${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`;
    const wrongs = [
      `${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c + a}`,
      `${a}x ${b >= 0 ? '+ ' + (b + 1) : '- ' + Math.abs(b - 1)} = ${c}`,
      `${a + 1}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which equation has a solution of x = ${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Substituting x = ${target} into ${correct} checks out: ${a}(${target}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}.`
    };
  }}
];

const SLOPE_FACT_POOL = [
  { q: 'What does the slope of a line measure?', correct: 'The steepness / rate of change of the line', wrongs: ['The y-intercept', 'The length of the line', 'The x-intercept'] },
  { q: 'What is the formula for slope, in words?', correct: 'rise / run (change in y divided by change in x)', wrongs: ['run / rise (change in x divided by change in y)', 'x divided by y', 'the sum of x and y'] },
  { q: 'What does a POSITIVE slope tell you about a line?', correct: 'The line goes upward from left to right', wrongs: ['The line goes downward from left to right', 'The line is horizontal', 'The line is vertical'] },
  { q: 'What does a NEGATIVE slope tell you about a line?', correct: 'The line goes downward from left to right', wrongs: ['The line goes upward from left to right', 'The line is horizontal', 'The line is vertical'] },
  { q: 'What does a slope of ZERO tell you about a line?', correct: 'The line is horizontal (flat, no rise)', wrongs: ['The line is vertical', 'The slope is undefined', 'The line goes upward'] },
  { q: 'A line with an UNDEFINED slope is what kind of line?', correct: 'A vertical line', wrongs: ['A horizontal line', 'A line with slope zero', 'A line with a positive slope'] }
];

const slopeTemplates = [
  { bloom: 'Remember', gen: () => {
    const entry = choice(SLOPE_FACT_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: entry.q,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `${entry.correct}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const x1 = randInt(-4, 0), y1 = randInt(-4, 2);
    const m = choice([1, 2, -1, -2]);
    const dx = randInt(2, 4);
    const x2 = x1 + dx, y2 = y1 + m * dx;
    const diagram = coordinatePlaneSVG({
      points: [{ x: x1, y: y1, label: `(${x1},${y1})` }, { x: x2, y: y2, label: `(${x2},${y2})` }],
      segments: [{ x1, y1, x2, y2 }],
      xMin: -6, xMax: 6, yMin: -6, yMax: 6
    });
    return {
      prompt: 'What is the slope of the line through the two points shown?',
      type: 'numeric',
      tolerance: 0.01,
      answer: m,
      diagram,
      explanation: `Slope = (y2 - y1)/(x2 - x1) = (${y2} - ${y1})/(${x2} - ${x1}) = ${m}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    if (Math.random() < 0.5) {
      const x1 = randInt(-8, 8), y1 = randInt(-8, 8);
      const slope = randIntNonZero(-4, 4);
      const dx = randIntNonZero(1, 6);
      const x2 = x1 + dx, y2 = y1 + slope * dx;
      return {
        prompt: `Find the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`,
        type: 'numeric',
        tolerance: 0.01,
        answer: slope,
        explanation: `Slope = (y2 - y1) / (x2 - x1) = (${y2} - ${y1}) / (${x2} - ${x1}) = ${y2 - y1}/${x2 - x1} = ${slope}.`
      };
    }
    const m = randIntNonZero(-6, 6);
    const b = randInt(-10, 10);
    const x = randInt(-8, 8);
    return {
      prompt: `For y = ${m}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}, find y when x = ${x}.`,
      type: 'numeric',
      answer: m * x + b,
      explanation: `Substitute x = ${x}: y = ${m}(${x}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${m * x} ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${m * x + b}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const x = randInt(-6, 6), y1 = randInt(-8, 0), y2 = y1 + randIntNonZero(1, 8);
    const claimedSlope = randIntNonZero(1, 6);
    const correct = 'The line is vertical, so the slope is undefined';
    const wrongs = [`The slope should be ${-claimedSlope}`, 'The slope should be 0', 'There is no mistake'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A line passes through (${x}, ${y1}) and (${x}, ${y2}). A student says the slope is ${claimedSlope}. What is wrong with this?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Both points share x = ${x}, making the line vertical. Slope = (change in y)/(change in x) = .../0, which is undefined.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const posSlope = choice([[1,4],[2,5],[3,4],[5,2],[7,3],[8,3]]);
    const posText = `${posSlope[0]}/${posSlope[1]}`;
    const posVal = posSlope[0] / posSlope[1];
    let negSlope, negSlopeVal, guard = 0;
    do {
      negSlope = -choice([1,2,3,4,5,6,7,8]);
      negSlopeVal = Math.abs(negSlope);
      guard++;
    } while (round2(negSlopeVal) === round2(posVal) && guard < 20);
    const correct = negSlopeVal > posVal ? `${negSlope}` : posText;
    const choices = shuffle([posText, `${negSlope}`, 'They are equally steep', 'Cannot be determined']);
    return {
      prompt: `Which line is steeper: one with slope ${posText} or one with slope ${negSlope}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Steepness depends on the absolute value of the slope. |${negSlope}| = ${negSlopeVal} vs |${posText}| = ${round2(posVal)}, so ${correct} is steeper.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const m = choice([2, 3, -2, -3, 4, -4]);
    const x1 = randInt(-5, 3), y1 = randInt(-5, 5), d = randInt(1, 4);
    const correctPair = `(${x1}, ${y1}) and (${x1 + d}, ${y1 + m * d})`;
    const wrongs = [
      `(${x1}, ${y1}) and (${x1 + d}, ${y1 + d})`,
      `(${x1}, ${y1}) and (${x1 + d}, ${y1 - m * d})`,
      `(${x1}, ${y1}) and (${x1 + 2 * d}, ${y1 + m * d})`
    ];
    const choices = shuffle([correctPair, ...wrongs]);
    return {
      prompt: `Which pair of points lies on a line with slope ${m}?`,
      type: 'mcq',
      choices,
      correct: correctPair,
      explanation: `Slope = (y2-y1)/(x2-x1). For ${correctPair}, slope = ${m * d}/${d} = ${m}.`
    };
  }}
];

const PYTHAGOREAN_FACT_POOL = [
  { q: 'In a right triangle, which side is the hypotenuse?', correct: 'The side opposite the right angle (the longest side)', wrongs: ['Either of the two legs', 'The shortest side', 'The side adjacent to the right angle'] },
  { q: 'What does the Pythagorean theorem state for a right triangle with legs a, b and hypotenuse c?', correct: 'a² + b² = c²', wrongs: ['a + b = c', 'a² - b² = c²', '2(a + b) = c'] },
  { q: 'The Pythagorean theorem can only be applied to which kind of triangle?', correct: 'A right triangle (one with a 90° angle)', wrongs: ['Any triangle', 'Only equilateral triangles', 'Only triangles with no equal sides'] },
  { q: 'If you know the hypotenuse and one leg of a right triangle, how do you find the other leg?', correct: 'Subtract the known leg squared from the hypotenuse squared, then take the square root', wrongs: ['Add the leg and the hypotenuse, then take the square root', 'Divide the hypotenuse by the known leg', 'Multiply the hypotenuse by the known leg'] },
  { q: 'A set of three whole numbers that satisfies a² + b² = c² is called what?', correct: 'A Pythagorean triple', wrongs: ['A right triangle set', 'A hypotenuse pair', 'A square root trio'] },
  { q: 'How can the Pythagorean theorem be used with real-world distances?', correct: 'By treating a horizontal and vertical distance as the two legs to find the straight-line (diagonal) distance', wrongs: ['It only works for triangles drawn on paper', 'By adding the two distances directly', 'It cannot be used for real-world distances'] }
];

const pythagoreanTemplates = [
  { bloom: 'Remember', gen: () => {
    const entry = choice(PYTHAGOREAN_FACT_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: entry.q,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `${entry.correct}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const a = randInt(3, 12), b = randInt(3, 12);
    const diagram = rightTriangleSVG(a, b, 'c');
    const correct = 'a² + b² = c²';
    const choices = shuffle([correct, 'a + b = c', 'a² - b² = c²', '2(a + b) = c']);
    return {
      prompt: 'Using the right triangle shown, which equation would you use to find the missing hypotenuse c?',
      type: 'mcq',
      choices,
      correct,
      diagram,
      explanation: 'The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse.'
    };
  }},
  { bloom: 'Apply', gen: () => {
    const [a, b, c] = choice(PYTHAGOREAN_TRIPLES);
    const findHyp = Math.random() < 0.5;
    if (findHyp) {
      return {
        prompt: 'A right triangle has the two legs shown. What is the length of the hypotenuse?',
        type: 'numeric',
        answer: c,
        diagram: rightTriangleSVG(a, b, '?'),
        explanation: `By the Pythagorean theorem, a² + b² = c²: ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b} = c², so c = ${c}.`
      };
    }
    return {
      prompt: 'A right triangle has the hypotenuse and one leg shown. What is the length of the other leg?',
      type: 'numeric',
      answer: b,
      diagram: rightTriangleSVG(a, '?', c),
      explanation: `By the Pythagorean theorem, leg² = c² - a² = ${c}² - ${a}² = ${c * c} - ${a * a} = ${c * c - a * a}, so the leg = ${b}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const [a0, b0, c0] = choice(PYTHAGOREAN_TRIPLES);
    let c = c0;
    if (Math.random() < 0.5) c = c0 + choice([1, -1, 2, -2]);
    const isValid = (a0 * a0 + b0 * b0) === (c * c);
    const correct = isValid
      ? `Correct — ${a0}² + ${b0}² = ${c}², so it is a right triangle.`
      : `Incorrect — ${a0}² + ${b0}² ≠ ${c}², so it is not a right triangle.`;
    const wrong = isValid
      ? `Incorrect — ${a0}² + ${b0}² ≠ ${c}², so it is not a right triangle.`
      : `Correct — ${a0}² + ${b0}² = ${c}², so it is a right triangle.`;
    const choices = shuffle([correct, wrong, 'Cannot be determined without more information', 'All triangles with three side lengths are right triangles']);
    return {
      prompt: `A triangle has sides ${a0}, ${b0}, and ${c}. A student claims it is a right triangle. Evaluate their claim.`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Check: ${a0}² + ${b0}² = ${a0 * a0} + ${b0 * b0} = ${a0 * a0 + b0 * b0}, and ${c}² = ${c * c}. ${isValid ? 'These are equal, confirming a right triangle.' : 'These are not equal, so the triangle is not a right triangle.'}`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const [a, b, c] = choice(PYTHAGOREAN_TRIPLES);
    const boxSize = choice([c, c - choice([1, 2, 3]), c + choice([2, 3, 4])]);
    const fits = boxSize >= c;
    const correct = fits ? `Yes, the diagonal is ${c} inches, which fits within ${boxSize} inches` : `No, the diagonal is ${c} inches, which exceeds ${boxSize} inches`;
    const wrong = fits ? `No, the diagonal is ${c} inches, which exceeds ${boxSize} inches` : `Yes, the diagonal is ${c} inches, which fits within ${boxSize} inches`;
    const choices = shuffle([correct, wrong, 'Cannot be determined', 'The diagonal equals the width plus the height']);
    return {
      prompt: `A rectangular screen is ${a} inches wide and ${b} inches tall. Does it fit inside a box with a ${boxSize}-inch diagonal opening?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Diagonal = √(${a}² + ${b}²) = √(${a*a} + ${b*b}) = √${a*a+b*b} = ${c} inches. ${fits ? `Since ${c} ≤ ${boxSize}, it fits.` : `Since ${c} > ${boxSize}, it does not fit.`}`
    };
  }},
  { bloom: 'Create', gen: () => {
    const correctTriple = choice(PYTHAGOREAN_TRIPLES);
    const correct = `${correctTriple[0]}, ${correctTriple[1]}, ${correctTriple[2]}`;
    const nonTriples = [[4,5,7],[5,9,11],[6,7,10],[3,4,6],[7,8,12],[5,6,9],[8,9,14],[6,9,13]];
    const choices = shuffle([correct, ...shuffle(nonTriples).slice(0,3).map(t => `${t[0]}, ${t[1]}, ${t[2]}`)]);
    return {
      prompt: `A right triangle has one leg of length ${correctTriple[0]}. Which set of three side lengths could be its sides?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct}: ${correctTriple[0]}² + ${correctTriple[1]}² = ${correctTriple[0]**2 + correctTriple[1]**2} = ${correctTriple[2]}².`
    };
  }}
];

const SYSTEMS_FACT_POOL = [
  { q: 'In a system of two linear equations, what does the solution represent graphically?', correct: 'The point where the two lines intersect', wrongs: ['The slope of either line', 'The y-intercept of the first equation', 'The area between the lines'] },
  { q: 'What does it mean if a system of two linear equations has NO solution?', correct: 'The lines are parallel and never intersect', wrongs: ['The lines are the same line', 'The lines intersect at the origin', 'One equation must be wrong'] },
  { q: 'What does it mean if a system of two linear equations has INFINITELY many solutions?', correct: 'The two equations describe the same line', wrongs: ['The lines are parallel', 'The lines intersect at exactly one point', 'The system has no valid equations'] },
  { q: 'Which method solves a system by replacing a variable in one equation with an equivalent expression from the other?', correct: 'Substitution', wrongs: ['Elimination', 'Graphing', 'Factoring'] },
  { q: 'Which method solves a system by adding or subtracting the equations to cancel out a variable?', correct: 'Elimination', wrongs: ['Substitution', 'Graphing', 'Distribution'] },
  { q: 'How many solutions does a typical system of two distinct, non-parallel linear equations have?', correct: 'Exactly one', wrongs: ['Zero', 'Infinitely many', 'Exactly two'] }
];

const systemsTemplates = [
  { bloom: 'Remember', gen: () => {
    const entry = choice(SYSTEMS_FACT_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: entry.q,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `${entry.correct}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const px = randInt(-3, 3), py = randInt(-3, 3);
    const m1 = choice([1, 2, -1, -2]);
    let m2 = choice([1, 2, -1, -2, 0.5, -0.5]);
    while (m2 === m1) m2 = choice([1, 2, -1, -2, 0.5, -0.5]);
    const seg1 = segmentThrough(px, py, m1);
    const seg2 = segmentThrough(px, py, m2);
    const diagram = coordinatePlaneSVG({ segments: [seg1, seg2], points: [{ x: px, y: py, label: '', color: C_GREEN }], xMin: -6, xMax: 6, yMin: -6, yMax: 6 });
    const correct = `(${px}, ${py})`;
    const choices = buildChoices(correct, () => `(${px + choice([-1, 1, 2, -2])}, ${py + choice([-1, 1, 2, -2])})`);
    return {
      prompt: 'The graph shows two lines from a system of equations. What is the solution to the system?',
      type: 'mcq',
      choices,
      correct,
      diagram,
      explanation: `The solution to a system is the point where the two lines intersect, which is (${px}, ${py}).`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const x = randIntNonZero(-8, 8);
    const y = randIntNonZero(-8, 8);
    const a1 = randIntNonZero(1, 5);
    const b1 = randIntNonZero(1, 5);
    const a2 = randIntNonZero(1, 5);
    const b2 = randIntNonZero(-5, 5) || 1;
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;
    const askX = Math.random() < 0.5;
    return {
      prompt: `Solve the system for ${askX ? 'x' : 'y'}:<br>${a1}x + ${b1}y = ${c1}<br>${a2}x ${b2 >= 0 ? '+ ' + b2 + 'y' : '- ' + Math.abs(b2) + 'y'} = ${c2}`,
      type: 'numeric',
      answer: askX ? x : y,
      explanation: `Solving simultaneously gives x = ${x} and y = ${y}, so ${askX ? 'x' : 'y'} = ${askX ? x : y}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const v1 = randInt(1, 8);
    let v2 = randInt(1, 8);
    while (v2 === v1) v2 = randInt(1, 8);
    const correct = 'The system has no solution (the lines are parallel and never meet)';
    const wrongs = ['The student made an arithmetic error only', `The solution is x = ${round2((v1 + v2) / 2)}`, 'The system has infinite solutions'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student solving a system got x = ${v1} from the first equation and x = ${v2} from the second. What does this tell us?`,
      type: 'mcq',
      choices,
      correct,
      explanation: 'If simplifying a system leads to two different values for the same variable, the equations describe parallel lines with no intersection — no solution.'
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const x0 = randInt(-6, 6);
    let y0 = randInt(-6, 6);
    while (y0 === x0) y0 = randInt(-6, 6);
    const sum = x0 + y0, diff = x0 - y0;
    const correct = `(${x0}, ${y0})`;
    const wrongs = [`(${x0 + 1}, ${y0})`, `(${x0}, ${y0 + 1})`, `(${y0}, ${x0})`];
    const choices = buildChoices(correct, () => choice(wrongs));
    return {
      prompt: `Which ordered pair is a solution to both x + y = ${sum} and x - y = ${diff}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Substituting (${x0}, ${y0}): ${x0} + ${y0} = ${sum} ✓ and ${x0} - ${y0} = ${diff} ✓. Both equations check out.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const px = randInt(-5, 5), py = randInt(-5, 5);
    const S = px + py, D = px - py;
    const correct = `x - y = ${D}`;
    const wrongs = [`x + y = ${S + 2}`, `x - y = ${D + 3}`, `2x + 2y = ${S}`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Given the equation x + y = ${S}, which second equation would give the system a unique solution at (${px}, ${py})?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `(${px}, ${py}) satisfies x - y = ${D}, and this line has a different slope than x + y = ${S}, guaranteeing exactly one intersection point.`
    };
  }}
];

const rootsTemplates = [
  { bloom: 'Remember', gen: () => {
    const root = randInt(2, 15);
    return {
      prompt: `What is √${root * root}?`,
      type: 'numeric',
      answer: root,
      explanation: `${root} × ${root} = ${root * root}, so √${root * root} = ${root}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const root = randInt(4, 12);
    const n = root * root;
    const correct = `It equals ${root}, since ${root}×${root}=${n}`;
    const wrongs = [`It equals ${round2(n / 2)}, since ${n}÷2=${round2(n / 2)}`, `It equals ${n * 2}, since ${n}×2=${n * 2}`, 'It cannot be simplified'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which statement about √${n} is true?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `A square root asks "what number times itself gives ${n}?" Since ${root} × ${root} = ${n}, √${n} = ${root}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const lower = randInt(2, 12);
    const upper = lower + 1;
    const n = randInt(lower * lower + 1, upper * upper - 1);
    const correct = `${lower} and ${upper}`;
    const choices = buildChoices(correct, () => `${lower + choice([-1, 1, 2])} and ${upper + choice([-1, 1, 2])}`);
    return {
      prompt: `√${n} is between which two consecutive integers?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${lower}² = ${lower * lower} and ${upper}² = ${upper * upper}. Since ${lower * lower} < ${n} < ${upper * upper}, √${n} is between ${lower} and ${upper}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const n = randInt(20, 90);
    const correct = 'They confused square root with dividing by 2 — square root asks what number times itself equals the value';
    const wrongs = ['This is actually the correct method for finding a square root', 'They should have multiplied by 2 instead', 'Square roots can only be found for perfect squares'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student says √${n} = ${round2(n / 2)} because they divided ${n} by 2. What is their mistake?`,
      type: 'mcq',
      choices,
      correct,
      explanation: 'Square root is not the same as dividing by 2. √n asks what number, multiplied by itself, gives n.'
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const lower = randInt(2, 11);
    const upper = lower + 1;
    const n = randInt(lower * lower + 1, upper * upper - 1);
    const distToLower = n - lower * lower;
    const distToUpper = upper * upper - n;
    const correct = distToLower < distToUpper ? String(lower) : String(upper);
    const choices = shuffle([String(lower), String(upper), 'Equally close to both', 'Cannot be determined']);
    return {
      prompt: `Is √${n} closer to ${lower} or ${upper}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${lower}² = ${lower * lower} (distance ${distToLower}) and ${upper}² = ${upper * upper} (distance ${distToUpper}) from ${n}. √${n} is closer to ${correct}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const target = randInt(4, 12);
    const correct = String(target * target);
    const choices = buildChoices(correct, () => String(target * target + choice([-9, -4, 4, 9, 16])));
    return {
      prompt: `Which value of n makes √n exactly equal to ${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `√n = ${target} means n = ${target}² = ${target * target}.`
    };
  }}
];

const VOLUME_FACT_POOL = [
  { q: 'What is the formula for the volume of a rectangular prism?', correct: 'length × width × height', wrongs: ['2(l+w+h)', 'l × w', '(l×w×h)/2'] },
  { q: 'What is the formula for the volume of a cube with side length s?', correct: 's³ (side × side × side)', wrongs: ['4 × s', 's²', '6 × s²'] },
  { q: 'What is the formula for the volume of a cylinder with radius r and height h?', correct: 'π × r² × h', wrongs: ['2 × π × r × h', 'π × r × h', '2 × π × r²'] },
  { q: 'Volume is always measured in what kind of units?', correct: 'Cubic units (like cm³ or in³)', wrongs: ['Square units (like cm²)', 'Linear units (like cm)', 'Units of time'] },
  { q: 'What does volume measure about a 3D object?', correct: 'The amount of space it takes up (or how much it can hold)', wrongs: ['The distance around its outside', 'The area of its largest face', 'Its weight'] },
  { q: 'How is the volume of any prism (triangular, rectangular, etc.) generally calculated?', correct: 'Area of the base × height', wrongs: ['Perimeter of the base × height', 'Area of the base ÷ height', 'Sum of all edge lengths'] }
];

const volumeTemplates = [
  { bloom: 'Remember', gen: () => {
    const entry = choice(VOLUME_FACT_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: entry.q,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `${entry.correct}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    if (Math.random() < 0.5) {
      const l = randInt(3, 10), w = randInt(2, 8), h = randInt(2, 8);
      return {
        prompt: 'Using the figure shown, what is the volume of this rectangular prism?',
        type: 'numeric',
        answer: l * w * h,
        diagram: prismSVG(l, w, h),
        explanation: `Volume = length × width × height = ${l} × ${w} × ${h} = ${l * w * h}.`
      };
    }
    const s = randInt(2, 9);
    return {
      prompt: 'Using the figure shown, what is the volume of this cube?',
      type: 'numeric',
      answer: s * s * s,
      diagram: cubeSVG(s),
      explanation: `Volume = side³ = ${s}³ = ${s * s * s}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const r = randInt(2, 8), h = randInt(3, 15);
    return {
      prompt: 'A cylinder has the radius and height shown. What is its volume? (use π ≈ 3.14, round to 2 decimals)',
      type: 'numeric',
      tolerance: 1,
      answer: round2(Math.PI * r * r * h),
      diagram: cylinderSVG(r, h),
      explanation: `Volume = πr²h = 3.14 × ${r}² × ${h} = 3.14 × ${r * r} × ${h} ≈ ${round2(Math.PI * r * r * h)}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const l = randInt(3, 8), w = randInt(2, 6);
    const h = randInt(2, 9);
    const volume = l * w * h;
    const correct = String(h);
    const choices = buildChoices(correct, () => choice([String(volume), String(l * w), String(h + 2), String(volume - w)]));
    return {
      prompt: `A box has volume ${volume} and two known dimensions ${l} and ${w}. A student says the third dimension is ${volume}. What is the actual third dimension?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Third dimension = volume ÷ (${l} × ${w}) = ${volume} ÷ ${l * w} = ${h}. The student forgot to divide.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const s = randInt(3, 7);
    let l2 = randInt(2, 6), w2 = randInt(2, 6), h2 = randInt(2, 6);
    let cubeVol = s * s * s, prismVol = l2 * w2 * h2;
    if (cubeVol === prismVol) h2 += 1;
    prismVol = l2 * w2 * h2;
    const cubeText = `The cube (side ${s}): volume = ${cubeVol}`;
    const prismText = `The prism (${l2}×${w2}×${h2}): volume = ${prismVol}`;
    const correct = cubeVol > prismVol ? cubeText : prismText;
    const choices = shuffle([cubeText, prismText, 'They have equal volume', 'Cannot be determined']);
    return {
      prompt: `Which container holds more: a cube with side ${s}, or a rectangular prism ${l2}×${w2}×${h2}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Cube volume = ${s}³ = ${cubeVol}. Prism volume = ${l2}×${w2}×${h2} = ${prismVol}. ${cubeVol > prismVol ? 'The cube holds more.' : 'The prism holds more.'}`
    };
  }},
  { bloom: 'Create', gen: () => {
    const target = choice([24, 30, 36, 40, 48, 60, 72]);
    const triples = [];
    for (let a = 1; a <= 10; a++) {
      if (target % a !== 0) continue;
      for (let b = 1; b <= 10; b++) {
        if ((target / a) % b !== 0) continue;
        const c = target / a / b;
        if (c >= 1 && c <= 12) triples.push([a, b, c]);
      }
    }
    const correctTriple = choice(triples);
    const correct = `${correctTriple[0]} × ${correctTriple[1]} × ${correctTriple[2]}`;
    const wrongs = [];
    let guard = 0;
    while (wrongs.length < 3 && guard < 100) {
      guard++;
      const a = randInt(1, 8), b = randInt(1, 8), c = randInt(1, 8);
      const text = `${a} × ${b} × ${c}`;
      if (a * b * c !== target && text !== correct && !wrongs.includes(text)) wrongs.push(text);
    }
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which set of dimensions gives a rectangular prism with volume ${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct} = ${correctTriple[0] * correctTriple[1] * correctTriple[2]}.`
    };
  }}
];

const FUNCTIONS_FACT_POOL = [
  { q: 'What does f(x) represent?', correct: 'The output value of the function f for input x', wrongs: ['The slope of the function', 'The x-intercept', 'The domain of the function'] },
  { q: 'What is the DOMAIN of a function?', correct: 'The set of all possible input (x) values', wrongs: ['The set of all possible output (y) values', 'The slope of the function', 'The point where the graph crosses the y-axis'] },
  { q: 'What is the RANGE of a function?', correct: 'The set of all possible output (y) values', wrongs: ['The set of all possible input (x) values', 'The steepness of the graph', 'The x-intercept of the graph'] },
  { q: 'How can you tell from a graph whether it represents a function?', correct: 'Any vertical line crosses the graph at most once (the vertical line test)', wrongs: ['Any horizontal line crosses the graph at most once', 'The graph must be a straight line', 'The graph must pass through the origin'] },
  { q: 'In a function, can a single input value (x) produce two different output values?', correct: 'No — each input must map to exactly one output', wrongs: ['Yes — inputs can map to as many outputs as needed', 'Only if the function is linear', 'Only if x is negative'] },
  { q: 'What is a linear function\'s graph always shaped like?', correct: 'A straight line', wrongs: ['A parabola', 'A circle', 'A zig-zag'] }
];

const functionsTemplates = [
  { bloom: 'Remember', gen: () => {
    const entry = choice(FUNCTIONS_FACT_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: entry.q,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `${entry.correct}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const a = randIntNonZero(-3, 3), b = randInt(-4, 4);
    const pts = [-2, -1, 0, 1, 2].map(x => ({ x, y: a * x + b, color: C_PRIMARY }));
    const diagram = coordinatePlaneSVG({ points: pts, segments: [{ x1: -2.5, y1: a * -2.5 + b, x2: 2.5, y2: a * 2.5 + b }], xMin: -6, xMax: 6, yMin: -8, yMax: 8 });
    const targetX = choice([-2, -1, 0, 1, 2]);
    return {
      prompt: `Based on the graph of f(x), what is f(${targetX})?`,
      type: 'numeric',
      answer: a * targetX + b,
      diagram,
      explanation: `Reading the graph at x = ${targetX}, the line passes through y = ${a * targetX + b}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const a = randIntNonZero(-6, 6), b = randInt(-10, 10);
    let m = randInt(-8, 8), n = randInt(-8, 8);
    while (n === m) n = randInt(-8, 8);
    const combine = choice(['sum', 'diff']);
    const fm = a * m + b, fn = a * n + b;
    const answer = combine === 'sum' ? fm + fn : fm - fn;
    const bStr = b >= 0 ? '+ ' + b : '- ' + Math.abs(b);
    return {
      prompt: `If f(x) = ${a}x ${bStr}, find f(${m}) ${combine === 'sum' ? '+' : '-'} f(${n}).`,
      type: 'numeric',
      answer,
      explanation: `f(${m}) = ${a}(${m}) ${bStr} = ${fm}. f(${n}) = ${a}(${n}) ${bStr} = ${fn}. So f(${m}) ${combine === 'sum' ? '+' : '-'} f(${n}) = ${fm} ${combine === 'sum' ? '+' : '-'} ${fn} = ${answer}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const a = randIntNonZero(-6, 6), b = randInt(-8, 8), x = randInt(-6, 6);
    const correctVal = a * x + b;
    const studentWrong = Math.random() < 0.5;
    const studentVal = studentWrong ? correctVal + choice([-3, -2, -1, 1, 2, 3]) : correctVal;
    const correctChoice = studentVal === correctVal
      ? `Correct — f(${x}) = ${correctVal}`
      : `Incorrect — f(${x}) should be ${correctVal}, not ${studentVal}`;
    const wrongChoice = studentVal === correctVal
      ? `Incorrect — f(${x}) should be ${correctVal + 1}, not ${correctVal}`
      : `Correct — f(${x}) = ${studentVal}`;
    const choices = shuffle([correctChoice, wrongChoice, 'Cannot be determined', 'The function is not valid']);
    return {
      prompt: `For f(x) = ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}, a student computed f(${x}) = ${studentVal}. Evaluate their work.`,
      type: 'mcq',
      choices,
      correct: correctChoice,
      explanation: `f(${x}) = ${a}(${x}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${correctVal}. ${studentVal === correctVal ? 'The student is correct.' : `The student's answer of ${studentVal} is wrong.`}`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const b = randInt(2, 8);
    const correct = [1, 2, 3].map(x => `x:${x}→${x + b}`).join(', ');
    const wrongs = [
      [1, 2, 3].map(x => `x:${x}→${x + b + 1}`).join(', '),
      [1, 2, 3].map(x => `x:${x}→${x * b}`).join(', '),
      [1, 2, 3].map(x => `x:${x}→${x + b - 1}`).join(', ')
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which table of values could represent the function f(x) = x + ${b}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `f(x) = x + ${b} adds ${b} to every input: ${correct}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const x = 2, target = randInt(6, 14);
    const a = randInt(2, 4);
    const b = target - a * x;
    const correct = `f(x) = ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`;
    const wrongs = [`f(x) = ${a + 1}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`, `f(x) = ${a}x ${b >= 0 ? '+ ' + (b + 2) : '- ' + Math.abs(b - 2)}`, `f(x) = ${a}x`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which function rule gives f(2) = ${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct}: f(2) = ${a}(2) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${a * x} ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${target}.`
    };
  }}
];

const GRADE8_TOPICS = [
  defineTopic('exponents', 'Exponents & Powers', '⚡', exponentsTemplates),
  defineTopic('scinotation', 'Scientific Notation', '🔬', scinotationTemplates),
  defineTopic('linear', 'Linear Equations', '➗', linearEqTemplates),
  defineTopic('slope', 'Slope & Linear Functions', '📈', slopeTemplates),
  defineTopic('pythagorean', 'Pythagorean Theorem', '📏', pythagoreanTemplates),
  defineTopic('systems', 'Systems of Equations', '🔗', systemsTemplates),
  defineTopic('roots', 'Square Roots', '√', rootsTemplates),
  defineTopic('volume', 'Volume & Surface Area', '📦', volumeTemplates),
  defineTopic('functions', 'Functions', 'ƒ', functionsTemplates)
];

const GRADE_TOPICS = {
  7: GRADE7_TOPICS,
  8: GRADE8_TOPICS
};
