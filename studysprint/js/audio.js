// Tiny synthesized sound effects + spoken praise for correct/incorrect feedback — no audio files needed.

const CORRECT_PRAISE = ['Correct', 'Great job', 'Well done', 'Excellent', 'Nice work', 'You got it', 'Awesome'];
const INCORRECT_PRAISE = ['Not quite', 'Keep trying', 'So close', 'Nice try', 'Almost there'];

const SoundFX = (() => {
  let ctx = null;
  let enabled = true;
  let userName = '';
  let speechRate = 0.8;   // global voice speed for ALL spoken audio (praise + tutorial narration)
  try {
    enabled = localStorage.getItem('mathsprint_sound') !== 'off';
    userName = localStorage.getItem('mathsprint_name') || '';
    const storedRate = parseFloat(localStorage.getItem('studysprint_speech_rate'));
    if (storedRate >= 0.4 && storedRate <= 1.6) speechRate = storedRate;
  } catch (e) { /* storage unavailable — default to enabled, no name */ }

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, startTime, duration, type, peakGain) {
    const audioCtx = getCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  function buildPraise(phrases) {
    const base = phrases[Math.floor(Math.random() * phrases.length)];
    return userName ? `${base}, ${userName}!` : `${base}!`;
  }

  function speak(text) {
    if (!enabled) return;
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = speechRate;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
    } catch (e) { /* speech unavailable — fail silently */ }
  }

  function playCorrect() {
    if (!enabled) return;
    try {
      const audioCtx = getCtx();
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        tone(freq, now + i * 0.09, 0.18, 'sine', 0.22);
      });
    } catch (e) { /* audio unavailable — fail silently */ }
    speak(buildPraise(CORRECT_PRAISE));
  }

  function playIncorrect() {
    if (!enabled) return;
    try {
      const audioCtx = getCtx();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) { /* audio unavailable — fail silently */ }
    speak(buildPraise(INCORRECT_PRAISE));
  }

  function isEnabled() { return enabled; }

  function setEnabled(value) {
    enabled = value;
    try {
      localStorage.setItem('mathsprint_sound', value ? 'on' : 'off');
    } catch (e) { /* storage unavailable — preference just won't persist */ }
  }

  function getSpeechRate() { return speechRate; }

  function setSpeechRate(value) {
    const v = Math.min(1.6, Math.max(0.4, Number(value) || 0.8));
    speechRate = v;
    try {
      localStorage.setItem('studysprint_speech_rate', String(v));
    } catch (e) { /* storage unavailable — preference just won't persist */ }
  }

  // Short spoken sample so the learner can hear the new speed right away.
  function speakSample() { speak('This is how fast I will talk.'); }

  function getName() { return userName; }

  function setName(value) {
    userName = (value || '').trim().slice(0, 20);
    try {
      localStorage.setItem('mathsprint_name', userName);
    } catch (e) { /* storage unavailable — preference just won't persist */ }
  }

  return { playCorrect, playIncorrect, isEnabled, setEnabled, getName, setName, getSpeechRate, setSpeechRate, speakSample };
})();
