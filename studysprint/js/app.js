// Math and English sessions run longer (30 questions) than Physics/Chemistry (20).
const SESSION_LENGTH_BY_SUBJECT = { math: 30, physics: 20, chemistry: 20, english: 30 };
// Per-topic overrides win over the subject default (e.g. a full-bank vocab drill).
const SESSION_LENGTH_BY_TOPIC = { vocabulary: 200 };
const DEFAULT_SESSION_LENGTH = 20;
const MAX_ATTEMPTS = 3;
const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

// ---- Subjects ----------------------------------------------------------

// Math's topic list already differs by grade (GRADE_TOPICS = {7:[...],8:[...]}).
// The other subjects share one topic list across both grades, since their
// middle-school curricula overlap heavily grade to grade.
const SUBJECTS = {
  math: { id: 'math', name: 'Math', icon: '🔢', topicsByGrade: GRADE_TOPICS },
  physics: { id: 'physics', name: 'Physics', icon: '⚛️', topicsByGrade: { 7: PHYSICS_TOPICS, 8: PHYSICS_TOPICS } },
  chemistry: { id: 'chemistry', name: 'Chemistry', icon: '🧪', topicsByGrade: { 7: CHEMISTRY_TOPICS, 8: CHEMISTRY_TOPICS } },
  english: { id: 'english', name: 'English', icon: '📖', topicsByGrade: { 7: ENGLISH_TOPICS, 8: ENGLISH_TOPICS } },
  puzzles: { id: 'puzzles', name: 'Puzzles', icon: '🧩', topicsByGrade: { 7: PUZZLE_TOPICS, 8: PUZZLE_TOPICS } }
};
const SUBJECT_LIST = [SUBJECTS.math, SUBJECTS.physics, SUBJECTS.chemistry, SUBJECTS.english, SUBJECTS.puzzles];

// ---- Sound toggle ----------------------------------------------------

function renderSoundToggle() {
  const btn = document.getElementById('sound-toggle');
  btn.textContent = SoundFX.isEnabled() ? '🔊' : '🔇';
}

document.getElementById('sound-toggle').addEventListener('click', () => {
  SoundFX.setEnabled(!SoundFX.isEnabled());
  renderSoundToggle();
});

renderSoundToggle();

// ---- Theme (light / dark) ------------------------------------------------

const THEME_KEY = 'studysprint_theme';
const themeBtn = document.getElementById('theme-toggle');
const metaThemeColor = document.getElementById('meta-theme-color');

function storedTheme() {
  try { const t = localStorage.getItem(THEME_KEY); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; }
}

function applyTheme(theme, persist) {
  document.documentElement.setAttribute('data-theme', theme);
  const toDark = theme === 'light';   // the button offers the OTHER mode
  themeBtn.textContent = toDark ? '🌙' : '☀️';
  themeBtn.title = toDark ? 'Switch to dark mode' : 'Switch to light mode';
  themeBtn.setAttribute('aria-label', themeBtn.title);
  if (metaThemeColor) metaThemeColor.setAttribute('content', theme === 'dark' ? '#0b1220' : '#f4f7fb');
  if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* preference just won't persist */ } }
  const tut = document.getElementById('screen-tutorial');
  if (tut && tut.classList.contains('active')) TutorialPlayer.refreshScene();   // re-draw 3D labels etc. in the new theme
}

applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
themeBtn.addEventListener('click', () => {
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
});
// Until the user picks a theme, follow the operating system's setting live.
if (window.matchMedia) {
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const follow = e => { if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light', false); };
  if (mq.addEventListener) mq.addEventListener('change', follow); else if (mq.addListener) mq.addListener(follow);
}

// ---- Voice speed (global: praise voice + tutorial narration) ----------

const speechRateSelect = document.getElementById('speech-rate');
(function initSpeechRate() {
  const current = SoundFX.getSpeechRate();
  let best = speechRateSelect.options[0];
  [...speechRateSelect.options].forEach(o => {
    if (Math.abs(Number(o.value) - current) < Math.abs(Number(best.value) - current)) best = o;
  });
  speechRateSelect.value = best.value;
  SoundFX.setSpeechRate(Number(best.value));
})();
speechRateSelect.addEventListener('change', () => {
  SoundFX.setSpeechRate(Number(speechRateSelect.value));
  if (TutorialNarrator.isSpeaking()) TutorialNarrator.refreshRate();   // hear it immediately
  else SoundFX.speakSample();
});

// ---- Name field ----------------------------------------------------

const nameInput = document.getElementById('user-name-input');
nameInput.value = SoundFX.getName();
nameInput.addEventListener('input', () => SoundFX.setName(nameInput.value));

const state = {
  grade: null,
  subjectId: null,
  topicId: null, // null topicId with mixed=true means mixed practice
  mixed: false,
  questionIndex: 0,
  score: 0,
  current: null,
  answered: false,
  attemptsLeft: MAX_ATTEMPTS,
  history: [], // {topicName, correct}
  sessionLength: DEFAULT_SESSION_LENGTH
};

const screens = {
  home: document.getElementById('screen-home'),
  subjects: document.getElementById('screen-subjects'),
  topics: document.getElementById('screen-topics'),
  tutorial: document.getElementById('screen-tutorial'),
  quiz: document.getElementById('screen-quiz'),
  summary: document.getElementById('screen-summary')
};

function showScreen(name) {
  if (name !== 'tutorial') TutorialPlayer.stop();
  document.querySelector('.app-main').classList.toggle('wide', name === 'tutorial');
  if (name !== 'quiz') document.querySelector('.app-main').classList.remove('quiz-compact-1', 'quiz-compact-2', 'quiz-compact-3');
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function currentTopics() {
  return SUBJECTS[state.subjectId].topicsByGrade[state.grade];
}

// ---- Home: grade selection ----------------------------------------------

document.querySelectorAll('.grade-card').forEach(card => {
  card.addEventListener('click', () => {
    state.grade = Number(card.dataset.grade);
    renderSubjects();
    showScreen('subjects');
  });
});

document.getElementById('back-to-home').addEventListener('click', () => {
  showScreen('home');
});

// ---- Subject selection -------------------------------------------------

function renderSubjects() {
  const grid = document.getElementById('subjects-grid');
  grid.innerHTML = '';
  document.getElementById('subjects-grade-label').textContent = `Grade ${state.grade}`;

  SUBJECT_LIST.forEach(subject => {
    const card = document.createElement('button');
    card.className = 'topic-card subject-card';
    card.innerHTML = `<span class="topic-icon">${subject.icon}</span><span class="topic-name">${subject.name}</span>`;
    card.addEventListener('click', () => {
      state.subjectId = subject.id;
      renderTopics();
      showScreen('topics');
    });
    grid.appendChild(card);
  });
}

document.getElementById('back-to-subjects').addEventListener('click', () => {
  showScreen('subjects');
});

// ---- Topic selection -------------------------------------------------

function renderTopics() {
  const grid = document.getElementById('topics-grid');
  grid.innerHTML = '';
  const subject = SUBJECTS[state.subjectId];
  document.getElementById('topics-subject-label').textContent = `Grade ${state.grade} ${subject.name}`;

  const mixedCard = document.createElement('button');
  mixedCard.className = 'topic-card mixed';
  mixedCard.innerHTML = `<span class="topic-icon">🌟</span><span class="topic-name">Mixed Practice</span>`;
  mixedCard.addEventListener('click', () => startSession(true, null));
  grid.appendChild(mixedCard);

  const anyTutorials = currentTopics().some(t => hasTutorial(state.subjectId, t.id));
  document.getElementById('topics-subtitle').textContent = anyTutorials
    ? 'Tap 🎬 Learn for an animated tutorial, or tap a topic to practice.'
    : 'Choose a topic to practice, or try a mixed set.';

  currentTopics().forEach(topic => {
    const card = document.createElement('button');
    card.className = 'topic-card';
    card.innerHTML = `<span class="topic-icon">${topic.icon}</span><span class="topic-name">${topic.name}</span>`;
    card.addEventListener('click', () => startSession(false, topic.id));

    if (!hasTutorial(state.subjectId, topic.id)) {
      grid.appendChild(card);
      return;
    }
    const item = document.createElement('div');
    item.className = 'topic-item';
    const learn = document.createElement('button');
    learn.type = 'button';
    learn.className = 'learn-btn';
    learn.textContent = '🎬 Learn';
    learn.addEventListener('click', () => {
      TutorialPlayer.start(state.subjectId, topic.id, { icon: topic.icon, name: topic.name });
      showScreen('tutorial');
    });
    item.appendChild(card);
    item.appendChild(learn);
    grid.appendChild(item);
  });
}

TutorialPlayer.setHandlers({
  onExit: () => showScreen('topics'),
  onPractice: (subjectId, topicId) => startSession(false, topicId)
});

// ---- Quiz session ------------------------------------------------------

// Each topic ships a fixed bank of pre-built questions spanning all six
// Bloom's-taxonomy levels. A session samples state.sessionLength of them
// without repeats (length varies by subject — see SESSION_LENGTH_BY_SUBJECT);
// mixed practice draws from every topic's bank at once. Sampling is
// stratified by Bloom's level (roughly sessionLength/6 from each) instead of
// a flat random draw, so a session can't cluster on one or two concept levels
// and always covers the full spread from recall to creation.
function buildSessionQuestions(mixed, topicId) {
  let pool;
  if (mixed) {
    pool = [];
    currentTopics().forEach(topic => pool.push(...topic.questions));
  } else {
    pool = currentTopics().find(t => t.id === topicId).questions;
  }

  const sessionLength = state.sessionLength;
  const byLevel = BLOOM_LEVELS.map(level => shuffle(pool.filter(q => q.bloom === level)));
  const base = Math.floor(sessionLength / BLOOM_LEVELS.length);
  const remainder = sessionLength - base * BLOOM_LEVELS.length;
  const extraLevels = new Set(shuffle(BLOOM_LEVELS.map((_, i) => i)).slice(0, remainder));

  const picked = [];
  const leftovers = [];
  byLevel.forEach((questions, i) => {
    const want = base + (extraLevels.has(i) ? 1 : 0);
    picked.push(...questions.slice(0, want));
    leftovers.push(...questions.slice(want));
  });

  // Backfill from leftovers (any level) in case a topic's bank is short on
  // a particular concept level, so a session always reaches sessionLength.
  if (picked.length < sessionLength) {
    picked.push(...shuffle(leftovers).slice(0, sessionLength - picked.length));
  }

  return shuffle(picked).slice(0, sessionLength);
}

function startSession(mixed, topicId) {
  state.mixed = mixed;
  state.topicId = topicId;
  state.questionIndex = 0;
  state.score = 0;
  state.history = [];
  state.sessionLength = (!mixed && SESSION_LENGTH_BY_TOPIC[topicId])
    || SESSION_LENGTH_BY_SUBJECT[state.subjectId]
    || DEFAULT_SESSION_LENGTH;
  state.sessionQuestions = buildSessionQuestions(mixed, topicId);
  nextQuestion();
  showScreen('quiz');
}

function nextQuestion() {
  state.answered = false;
  state.attemptsLeft = MAX_ATTEMPTS;
  state.current = state.sessionQuestions[state.questionIndex];
  renderQuestion();
}

function renderAttemptsIndicator() {
  const el = document.getElementById('attempts-indicator');
  if (state.answered || state.attemptsLeft >= MAX_ATTEMPTS) {
    el.textContent = '';
  } else {
    el.textContent = `${state.attemptsLeft} attempt${state.attemptsLeft === 1 ? '' : 's'} left`;
  }
}


// ---- Keep the whole quiz card on screen (no scrolling to reach the buttons) ----
// Tries the normal size first, then progressively tighter layouts, and stops as soon as it fits.
function fitQuizCard() {
  const main = document.querySelector('.app-main');
  if (!screens.quiz.classList.contains('active')) return;
  const levels = window.innerWidth >= 700 ? 3 : 2;   // on phones keep text readable and let the page scroll
  main.classList.remove('quiz-compact-1', 'quiz-compact-2', 'quiz-compact-3');
  const bottom = () => document.querySelector('.quiz-actions').getBoundingClientRect().bottom;
  for (let lv = 0; lv <= levels; lv++) {
    if (lv > 0) main.classList.add(`quiz-compact-${lv}`);
    if (bottom() <= window.innerHeight - 8) break;
  }
}
window.addEventListener('resize', fitQuizCard);

function renderQuestion() {
  const q = state.current;
  document.getElementById('quiz-counter').textContent = `Question ${state.questionIndex + 1} of ${state.sessionLength}`;
  document.getElementById('quiz-score').textContent = `Score: ${state.score}`;
  document.getElementById('progress-fill').style.width = `${(state.questionIndex / state.sessionLength) * 100}%`;
  document.getElementById('quiz-topic-label').textContent = state.mixed ? `Mixed · ${q._topicName}` : q._topicName;
  document.getElementById('quiz-bloom-badge').textContent = q.bloom || '';

  document.getElementById('question-prompt').innerHTML = supify(q.prompt);

  const diagramEl = document.getElementById('question-diagram');
  if (q.diagram) {
    diagramEl.innerHTML = q.diagram;
    diagramEl.classList.remove('hidden');
  } else {
    diagramEl.innerHTML = '';
    diagramEl.classList.add('hidden');
  }

  renderAttemptsIndicator();

  const answerArea = document.getElementById('answer-area');
  answerArea.innerHTML = '';

  const feedback = document.getElementById('feedback');
  feedback.className = 'feedback hidden';
  feedback.innerHTML = '';

  document.getElementById('check-btn').classList.remove('hidden');
  document.getElementById('next-btn').classList.add('hidden');

  if (q.type === 'numeric') {
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.autocomplete = 'off';
    input.id = 'answer-input';
    input.placeholder = 'Your answer';
    input.className = 'answer-input';
    answerArea.appendChild(input);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!state.answered) submitAnswer();
        else nextQuestion();
      }
    });
    setTimeout(() => input.focus(), 30);
  } else {
    const choicesWrap = document.createElement('div');
    choicesWrap.className = 'choices';
    q.choices.forEach(choiceText => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.innerHTML = supify(choiceText);
      btn.dataset.value = choiceText;
      btn.addEventListener('click', () => {
        if (state.answered) return;
        document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        answerArea.dataset.selected = choiceText;
      });
      choicesWrap.appendChild(btn);
    });
    answerArea.appendChild(choicesWrap);
  }
  fitQuizCard();
}

function submitAnswer() {
  const q = state.current;
  const answerArea = document.getElementById('answer-area');
  let isCorrect = false;
  let selected = null;

  if (q.type === 'numeric') {
    const input = document.getElementById('answer-input');
    selected = input.value;
    isCorrect = checkNumeric(input.value, q.answer, q.tolerance);
  } else {
    selected = answerArea.dataset.selected;
    isCorrect = selected === q.correct;
  }

  if (!isCorrect) state.attemptsLeft--;
  const outOfAttempts = !isCorrect && state.attemptsLeft <= 0;

  if (!isCorrect && !outOfAttempts) {
    // Wrong, but retries remain: give a hint without revealing the answer.
    SoundFX.playIncorrect();

    if (q.type === 'numeric') {
      const input = document.getElementById('answer-input');
      input.value = '';
      input.focus();
    } else {
      document.querySelectorAll('.choice-btn').forEach(b => {
        if (b.dataset.value === selected) {
          b.classList.add('incorrect');
          b.classList.remove('selected');
          b.disabled = true;
        }
      });
      delete answerArea.dataset.selected;
    }

    renderAttemptsIndicator();
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback retry';
    feedback.innerHTML = `<div class="feedback-headline">❌ Not quite — try again! (${state.attemptsLeft} attempt${state.attemptsLeft === 1 ? '' : 's'} left)</div>`;
    fitQuizCard();
    return;
  }

  // Either correct, or out of attempts — finalize this question.
  if (q.type === 'numeric') {
    document.getElementById('answer-input').disabled = true;
  } else {
    document.querySelectorAll('.choice-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.value === q.correct) b.classList.add('correct');
      else if (b.dataset.value === selected) b.classList.add('incorrect');
    });
  }

  state.answered = true;
  if (isCorrect) state.score++;
  state.history.push({ topicName: q._topicName, correct: isCorrect });

  if (isCorrect) SoundFX.playCorrect();
  else SoundFX.playIncorrect();

  renderAttemptsIndicator();
  const feedback = document.getElementById('feedback');
  feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  const correctAnswerDisplay = q.type === 'numeric' ? q.answer : q.correct;
  feedback.innerHTML = `
    <div class="feedback-headline">${isCorrect ? '✅ Correct!' : `❌ Out of attempts — the answer is ${supify(String(correctAnswerDisplay))}`}</div>
    <div class="feedback-explanation">${supify(q.explanation)}</div>
  `;

  document.getElementById('check-btn').classList.add('hidden');
  document.getElementById('next-btn').classList.remove('hidden');
  document.getElementById('quiz-score').textContent = `Score: ${state.score}`;
  fitQuizCard();
  document.getElementById('next-btn').focus();
}

document.getElementById('check-btn').addEventListener('click', () => {
  if (state.answered) return;
  if (state.current.type === 'numeric') {
    const input = document.getElementById('answer-input');
    if (input.value.trim() === '') { input.focus(); return; }
  } else {
    if (!document.getElementById('answer-area').dataset.selected) return;
  }
  submitAnswer();
});

document.getElementById('next-btn').addEventListener('click', () => {
  state.questionIndex++;
  delete document.getElementById('answer-area').dataset.selected;
  if (state.questionIndex >= state.sessionLength) {
    renderSummary();
    showScreen('summary');
  } else {
    nextQuestion();
  }
});

document.getElementById('quit-quiz').addEventListener('click', () => {
  showScreen('topics');
});

// ---- Summary -------------------------------------------------------

function renderSummary() {
  const pct = Math.round((state.score / state.sessionLength) * 100);
  document.getElementById('summary-score').textContent = `${state.score} / ${state.sessionLength}`;
  document.getElementById('summary-pct').textContent = `${pct}%`;

  let message, emoji;
  if (pct >= 90) { message = 'Outstanding work!'; emoji = '🏆'; }
  else if (pct >= 70) { message = 'Great job!'; emoji = '🎉'; }
  else if (pct >= 50) { message = 'Good effort — keep practicing!'; emoji = '💪'; }
  else { message = "Keep at it — you'll get there!"; emoji = '📘'; }
  document.getElementById('summary-emoji').textContent = emoji;
  document.getElementById('summary-message').textContent = message;

  const breakdown = document.getElementById('summary-breakdown');
  breakdown.innerHTML = '';
  if (state.mixed) {
    const byTopic = {};
    state.history.forEach(h => {
      if (!byTopic[h.topicName]) byTopic[h.topicName] = { correct: 0, total: 0 };
      byTopic[h.topicName].total++;
      if (h.correct) byTopic[h.topicName].correct++;
    });
    Object.entries(byTopic).forEach(([name, stat]) => {
      const row = document.createElement('div');
      row.className = 'breakdown-row';
      row.innerHTML = `<span>${name}</span><span>${stat.correct}/${stat.total}</span>`;
      breakdown.appendChild(row);
    });
  }

  document.getElementById('retry-btn').onclick = () => startSession(state.mixed, state.topicId);
}

document.getElementById('choose-topic-btn').addEventListener('click', () => {
  renderTopics();
  showScreen('topics');
});

document.getElementById('summary-home-btn').addEventListener('click', () => {
  showScreen('home');
});
