// =====================================================================
// Puzzles: a curated (hand-written, NOT generated) question bank.
//
// Puzzle files (puzzles-logic.js, puzzles-math.js, ...) each wrap themselves in an IIFE and call
//   registerPuzzles('logic', [ puzzle, puzzle, ... ]);
//
// Multiple choice:   { q: 'Question text (HTML ok)', a: 'correct choice', w: ['wrong 1', 'wrong 2', 'wrong 3'],
//                      why: 'Explanation shown after answering', bloom: 'Analyze', diagram: '<svg …>…</svg>' /* optional */ }
// Numeric answer:    { q: '…', n: 42, tol: 0.01 /* optional */, why: '…', bloom: 'Apply', diagram: '…' /* optional */ }
//
// bloom must be one of: 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'
// (used to spread each quiz across thinking levels).
// Choices are shuffled when the bank is built, so list the correct answer in `a`.
// =====================================================================

const PUZZLE_SETS = {};
const PUZZLE_ISSUES = [];
const PUZZLE_BLOOM = ['Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

function registerPuzzles(topicId, list) {
  PUZZLE_SETS[topicId] = (PUZZLE_SETS[topicId] || []).concat(list);
}

function definePuzzleTopic(id, name, icon) {
  const questions = [];
  const seen = new Set();
  (PUZZLE_SETS[id] || []).forEach((p, idx) => {
    const where = `${id}#${idx + 1}`;
    const problems = [];
    if (!p.q || typeof p.q !== 'string') problems.push('missing q');
    if (!p.why) problems.push('missing why');
    if (PUZZLE_BLOOM.indexOf(p.bloom) < 0) problems.push('bad bloom ' + p.bloom);
    const isNumeric = typeof p.n === 'number';
    if (isNumeric && !isFinite(p.n)) problems.push('bad n');
    if (!isNumeric) {
      if (!p.a || !Array.isArray(p.w) || p.w.length !== 3) problems.push('mcq needs a + 3 wrong answers in w');
      else if (new Set([p.a, ...p.w].map(String)).size !== 4) problems.push('mcq choices not 4 unique');
    }
    const key = p.q + (p.diagram ? '|d' : '') + '|' + (isNumeric ? p.n : p.a);
    if (seen.has(key)) problems.push('duplicate puzzle');
    seen.add(key);
    if (problems.length) { PUZZLE_ISSUES.push(`${where}: ${problems.join('; ')}`); return; }

    const q = { prompt: p.q, explanation: p.why, bloom: p.bloom, _topicName: name };
    if (p.diagram) q.diagram = p.diagram;
    if (isNumeric) {
      q.type = 'numeric';
      q.answer = p.n;
      if (p.tol !== undefined) q.tolerance = p.tol;
    } else {
      q.type = 'mcq';
      q.choices = shuffle([p.a, ...p.w].map(String));
      q.correct = String(p.a);
    }
    questions.push(q);
  });
  return { id, name, icon, questions };
}
