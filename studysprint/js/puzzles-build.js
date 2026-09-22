// Builds the Puzzles topics once every puzzle file has registered its puzzles.
const PUZZLE_TOPICS = [
  definePuzzleTopic('logic', 'Logic & Deduction', '🕵️'),
  definePuzzleTopic('math', 'Math & Number Puzzles', '🧮'),
  definePuzzleTopic('riddles', 'Riddles & Lateral Thinking', '🤔'),
  definePuzzleTopic('visual', 'Visual & Diagram Puzzles', '🔷'),
  definePuzzleTopic('classic', 'Famous Brain Teasers', '🧠')
];
if (PUZZLE_ISSUES.length && typeof console !== 'undefined') console.warn('Puzzle issues:', PUZZLE_ISSUES);
