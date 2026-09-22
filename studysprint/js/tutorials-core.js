// =====================================================================
// Tutorial framework: registry + animated step player.
//
// Content files (physics-tutorials.js, chemistry-tutorials.js) call
//   registerTutorial(subjectId, topicId, { title, keyTerms, steps })
// and must wrap themselves in an IIFE so they add nothing to global scope.
//
// A tutorial:
//   {
//     title: 'Forces & Motion',
//     keyTerms: [{ term: 'Force', definition: 'A push or a pull.' }, ...],
//     steps: [ step, step, ... ]          // 4-5 steps per topic
//   }
//
// A step has a title, short HTML text, and ONE animated scene, given either as:
//   svg:   '<svg viewBox="0 0 400 240">…</svg>'   self-animating via SMIL
//          (<animate>, <animateTransform>, <animateMotion>) and/or CSS @keyframes
//          declared in a <style> inside the svg.
//   mount: (el, api) => { …; return cleanupFn }  imperative scene. `el` is the
//          scene container (build an <svg> and/or sliders/buttons inside it).
//          api.loop((t, dt) => {…}) runs every frame while NOT paused
//          (t = seconds since mount, dt = seconds since last frame) and is
//          stopped automatically when the step changes.
//
// A step may also have `scene3d` (added with addTutorialScenes3D from chem3d-kit.js):
// a three.js scene used instead of the flat scene whenever WebGL is available.
//
// Each step may also carry (added by the explain-*.js files via
// addTutorialExplanations):
//   explain: 'HTML shown under the lesson text: what you're seeing in the animation'
//   say:     'Plain-text script read aloud (browser speech synthesis) narrating the scenario'
// If `say` is missing the narration falls back to title + text + explain.
//
// The player provides Pause/Replay buttons, step dots, Back/Next, arrow-key
// navigation and a final recap page with a "Practice this topic" button.
// =====================================================================

const TUTORIALS = { physics: {}, chemistry: {} };

function registerTutorial(subjectId, topicId, tutorial) {
  if (!TUTORIALS[subjectId]) TUTORIALS[subjectId] = {};
  TUTORIALS[subjectId][topicId] = tutorial;
}

// Append extra steps (e.g. real-life examples marked kind: 'example') to an
// already-registered tutorial. Must run after that tutorial's own file loads.
function addTutorialSteps(subjectId, topicId, steps, keyTerms) {
  const t = TUTORIALS[subjectId] && TUTORIALS[subjectId][topicId];
  if (!t) return;
  t.steps.push(...steps);
  if (keyTerms) t.keyTerms = (t.keyTerms || []).concat(keyTerms);
}


// Attach on-screen explanations / spoken scripts to already-registered steps.
// `list` is aligned by step index; each entry is a string (explain) or { explain, say }.
function addTutorialExplanations(subjectId, topicId, list) {
  const t = TUTORIALS[subjectId] && TUTORIALS[subjectId][topicId];
  if (!t) return;
  list.forEach((item, i) => {
    const step = t.steps[i];
    if (!step || item == null) return;
    if (typeof item === 'string') step.explain = item;
    else { if (item.explain) step.explain = item.explain; if (item.say) step.say = item.say; }
  });
}

// Reads text aloud with the browser's speech synthesis (offline, no audio files).
// Long scripts are spoken sentence by sentence (avoids a Chrome cut-off bug).
const TutorialNarrator = (() => {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let token = 0, speaking = false, voice = null, keepAlive = [], onChange = null, current = null, queueRef = [];

  function pickVoice() {
    if (!supported) return;
    const vs = window.speechSynthesis.getVoices();
    voice = vs.find(v => /^en[-_]US/i.test(v.lang) && /Samantha|Google US English|Aria|Jenny|Natural/i.test(v.name))
      || vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  if (supported) {
    pickVoice();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
  }

  const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

  // Turn on-screen notation (HTML, symbols) into something that sounds right when spoken.
  function clean(html) {
    let t = String(html || '');
    t = t.replace(/<sup>\s*\+\s*<\/sup>/gi, ' plus ').replace(/<sup>\s*[−-]\s*<\/sup>/gi, ' minus ')
      .replace(/<sup>\s*2\s*<\/sup>/gi, ' squared ').replace(/<sup>\s*3\s*<\/sup>/gi, ' cubed ')
      .replace(/<sup>([^<]*)<\/sup>/gi, ' to the power $1 ')
      .replace(/<sub>([^<]*)<\/sub>/gi, ' $1 ')
      .replace(/<\/(p|li|div|h\d)>/gi, '. ').replace(/<br\s*\/?>/gi, '. ')
      .replace(/<[^>]+>/g, ' ');
    t = t.replace(/[₀-₉]/g, m => ' ' + SUB[m] + ' ')
      .replace(/⁺/g, ' plus ').replace(/⁻/g, ' minus ').replace(/²/g, ' squared ').replace(/³/g, ' cubed ')
      .replace(/°\s*C\b/g, ' degrees Celsius ').replace(/°\s*F\b/g, ' degrees Fahrenheit ').replace(/°/g, ' degrees ')
      .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/≈/g, ' about ')
      .replace(/→/g, ' gives ').replace(/⇌/g, ' and back to ').replace(/≤/g, ' is at most ').replace(/≥/g, ' is at least ')
      .replace(/(\d)\s*%/g, '$1 percent')
      .replace(/\bm\/s\b/g, ' meters per second ').replace(/\bkm\/h\b/g, ' kilometers per hour ')
      .replace(/\s=\s/g, ' equals ').replace(/\s[−–]\s/g, ' minus ').replace(/\s\+\s/g, ' plus ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, ' and ').replace(/&lt;/g, ' less than ').replace(/&gt;/g, ' greater than ')
      .replace(/[—–]/g, ', ');
    return t.replace(/\s+/g, ' ').replace(/\s+([.,!?;:])/g, '$1').replace(/([.!?])\s*\.+/g, '$1').trim();
  }

  function sentences(text) {
    const parts = text.match(/[^.!?]+[.!?]*/g) || [text];
    const out = [];
    parts.forEach(p => {
      p = p.trim();
      while (p.length > 200) {           // very long sentence: split at a comma/space
        let cut = p.lastIndexOf(',', 200); if (cut < 60) cut = p.lastIndexOf(' ', 200);
        out.push(p.slice(0, cut + 1).trim()); p = p.slice(cut + 1).trim();
      }
      if (p) out.push(p);
    });
    return out;
  }

  function setSpeaking(v) { if (speaking !== v) { speaking = v; if (onChange) onChange(v); } }

  function cancel() {
    token++;
    keepAlive = [];
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function speakLines(lines) {
    cancel();
    if (!supported || !lines.length) return;
    const queue = lines.slice();
    queueRef = queue;
    const my = token;
    setSpeaking(true);
    const next = () => {
      if (my !== token) return;
      const line = queue.shift();
      current = line || null;
      if (!line) { setSpeaking(false); return; }
      const u = new SpeechSynthesisUtterance(line);
      u.lang = 'en-US'; u.pitch = 1;
      u.rate = (typeof SoundFX !== 'undefined' && SoundFX.getSpeechRate) ? SoundFX.getSpeechRate() : 0.8;   // global speed setting
      if (voice) u.voice = voice;
      u.onend = next;
      u.onerror = () => { if (my === token) next(); };
      keepAlive.push(u);
      window.speechSynthesis.speak(u);
    };
    next();
  }

  function speak(text) { speakLines(sentences(clean(text))); }

  // Speed changed while talking: restart the sentence in progress (and the rest) at the new speed.
  function refreshRate() {
    if (!speaking || !current) return;
    speakLines([current, ...queueRef]);
  }

  return { supported, speak, refreshRate, cancel, clean, isSpeaking: () => speaking, onChange: fn => { onChange = fn; } };
})();

function hasTutorial(subjectId, topicId) {
  return !!(TUTORIALS[subjectId] && TUTORIALS[subjectId][topicId]);
}

// Tiny helpers so scene authors don't repeat boilerplate. Inline SVG inherits
// the page's CSS variables, so scenes can use fill="var(--primary)" etc.
const TutorialKit = {
  svg(inner, viewBox) {
    return `<svg viewBox="${viewBox || '0 0 400 240'}" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  },
  arrowMarker(id, color) {
    return `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="${color}"/></marker>`;
  }
};


// Dark theme: make sure every label in a scene is readable against whatever is drawn behind it.
// Scenes are drawn with theme colours plus some fixed colours (pale tiles, orange bars…), so a light
// label can end up on a light shape. This checks each label once the scene is up (and again when
// labels are redrawn) and switches it to dark or light ink when the contrast would be too low.
const TutorialContrast = (() => {
  const STAGE_BG = { r: 19, g: 30, b: 52 };
  const parse = c => { const m = (c || '').match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const DARK_INK = { r: 17, g: 24, b: 39 }, LIGHT_INK = { r: 248, g: 250, b: 252 };
  const pick = bg => (ratio(DARK_INK, bg) >= ratio(LIGHT_INK, bg) ? 'rgb(17,24,39)' : 'rgb(248,250,252)');
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) });

  function svgBackground(text, scene, point) {
    for (const el of document.elementsFromPoint(point[0], point[1])) {
      if (el === text || el.contains(text) || text.contains(el)) continue;
      if (el === scene || el.tagName.toLowerCase() === 'svg') break;
      if (!(el instanceof SVGGraphicsElement)) continue;
      const cs = getComputedStyle(el), f = parse(cs.fill), op = parseFloat(cs.fillOpacity) * (+cs.opacity);
      if (f && cs.fill !== 'none' && op > 0.45) return { r: f.r, g: f.g, b: f.b };
    }
    return STAGE_BG;
  }

  function domBackground(el, scene) {
    const layers = [];
    for (let e = el; e && e !== scene.parentElement; e = e.parentElement) {
      if (e === scene) break;
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let base = STAGE_BG;
    for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
    return base;
  }

  function run(scene) {
    if (document.documentElement.getAttribute('data-theme') !== 'dark') return;
    scene.querySelectorAll('svg text').forEach(t => {
      if (!(t.textContent || '').trim()) return;
      const cs = getComputedStyle(t);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || parseFloat(cs.fillOpacity) < 0.4) return;
      const fg = parse(cs.fill); if (!fg) return;
      const r = t.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
      let worst = 99, worstBg = null;
      [0.5, 0.15, 0.85].forEach(k => {
        const bg = svgBackground(t, scene, [r.left + r.width * k, r.top + r.height / 2]);
        const rr = ratio(fg, bg);
        if (rr < worst) { worst = rr; worstBg = bg; }
      });
      if (worst < 3.2) t.style.fill = pick(worstBg);
    });
    const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || !/[A-Za-z0-9]/.test(n.textContent) || el.closest('svg, canvas, button, option, select')) continue;   // skip symbol-only text (e.g. coloured legend dots)
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const fg = parse(cs.color), bg = domBackground(el, scene); if (!fg || !bg) continue;
      if (ratio(blend(fg, bg), bg) < 3.0) el.style.color = pick(bg);
    }
  }

  let observer = null, timer = null, poll = null;
  function watch(scene) {
    stop();
    const schedule = ms => { clearTimeout(timer); timer = setTimeout(() => run(scene), ms); };
    schedule(150);
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => schedule(400));
      observer.observe(scene, { childList: true, subtree: true, characterData: true });
    }
    // Shapes that fade/appear via SVG animation don't change the page structure, so also re-check on a slow timer.
    poll = setInterval(() => run(scene), 1200);
  }
  function stop() { if (observer) observer.disconnect(); observer = null; clearTimeout(timer); timer = null; clearInterval(poll); poll = null; }
  return { watch, stop, run };
})();

const TutorialPlayer = (() => {
  const st = {
    subjectId: null, topicId: null, tutorial: null, meta: null,
    index: 0, paused: false, cleanup: null,
    loops: [], rafId: null, lastTs: 0, time: 0
  };
  const handlers = { onExit: null, onPractice: null };
  let els = null;

  function grab() {
    if (els) return els;
    const $ = id => document.getElementById(id);
    els = {
      screen: $('screen-tutorial'), back: $('tutorial-back'),
      icon: $('tutorial-topic-icon'), topic: $('tutorial-topic-title'),
      counter: $('tutorial-step-counter'), dots: $('tutorial-dots'),
      stepTitle: $('tutorial-step-title'), lesson: $('tutorial-lesson'),
      scene: $('tutorial-scene'), pause: $('tutorial-pause'), replay: $('tutorial-replay'),
      text: $('tutorial-text'), recap: $('tutorial-recap'),
      prev: $('tutorial-prev'), next: $('tutorial-next'),
      practice: $('tutorial-practice'), again: $('tutorial-again'),
      explain: $('tutorial-explain'), explainBody: $('tutorial-explain-body'),
      listen: $('tutorial-listen'), auto: $('tutorial-autonarrate'), narrationBar: document.querySelector('.narration-bar')
    };
    return els;
  }

  function stopLoops() {
    if (st.rafId) cancelAnimationFrame(st.rafId);
    st.rafId = null;
    st.loops = [];
  }

  function unmount() {
    TutorialContrast.stop();
    if (st.cleanup) { try { st.cleanup(); } catch (e) { /* scene cleanup errors must not break navigation */ } }
    st.cleanup = null;
    stopLoops();
  }

  function tick(ts) {
    st.rafId = null;
    if (!st.loops.length) return;
    const dt = Math.min(0.05, Math.max(0, (ts - st.lastTs) / 1000));
    st.lastTs = ts;
    if (!st.paused) {
      st.time += dt;
      st.loops.forEach(fn => fn(st.time, dt));
    }
    st.rafId = requestAnimationFrame(tick);
  }

  function ensureRaf() {
    if (st.rafId) return;
    st.lastTs = performance.now();
    st.rafId = requestAnimationFrame(tick);
  }

  function applyPause() {
    const e = grab();
    e.scene.classList.toggle('paused', st.paused);
    e.scene.querySelectorAll('svg').forEach(s => {
      if (st.paused && s.pauseAnimations) s.pauseAnimations();
      if (!st.paused && s.unpauseAnimations) s.unpauseAnimations();
    });
    e.pause.textContent = st.paused ? '▶ Play' : '⏸ Pause';
  }

  function mountScene() {
    const e = grab();
    unmount();
    st.time = 0;
    e.scene.innerHTML = '';
    const step = st.tutorial.steps[st.index];
    const api = {
      el: e.scene,
      loop(fn) { st.loops.push(fn); ensureRaf(); },
      isPaused: () => st.paused
    };
    let done = false;
    if (step.scene3d && typeof Chem3D !== 'undefined' && Chem3D.supported()) {
      try {
        const cleanup = step.scene3d(e.scene, api);
        if (typeof cleanup === 'function') st.cleanup = cleanup;
        done = true;
      } catch (err) {
        console.warn('3D scene failed; showing the flat version instead.', err);
        unmount();                 // stop any half-registered loops / free the WebGL context
        st.time = 0;
        e.scene.innerHTML = '';
      }
    }
    if (!done) {
      if (step.svg) {
        e.scene.innerHTML = step.svg;
      } else if (step.mount) {
        const cleanup = step.mount(e.scene, api);
        if (typeof cleanup === 'function') st.cleanup = cleanup;
      }
    }
    applyPause();
    TutorialContrast.watch(e.scene);
  }

  function scriptFor(step) {
    if (step.say) return step.say;
    return [step.title, step.text, step.explain].filter(Boolean).join('. ');
  }

  function updateListenButton() {
    const e = grab();
    const on = TutorialNarrator.isSpeaking();
    e.listen.textContent = on ? '⏹ Stop' : '🔊 Listen';
    e.listen.classList.toggle('speaking', on);
  }

  function autoNarrate() {
    const e = grab();
    TutorialNarrator.cancel();
    if (!TutorialNarrator.supported || !e.auto.checked) return;
    if (typeof SoundFX !== 'undefined' && !SoundFX.isEnabled()) return;   // header mute switch
    const step = st.tutorial.steps[st.index];
    if (step) TutorialNarrator.speak(scriptFor(step));
  }

  function renderDots() {
    const e = grab();
    const total = st.tutorial.steps.length + 1;
    e.dots.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'tutorial-dot' + (i === st.index ? ' active' : '') + (i < st.index ? ' done' : '');
      d.setAttribute('aria-label', i < total - 1 ? `Go to step ${i + 1}` : 'Go to recap');
      d.addEventListener('click', () => goTo(i));
      e.dots.appendChild(d);
    }
  }

  function render() {
    const e = grab();
    const steps = st.tutorial.steps;
    const isRecap = st.index >= steps.length;
    renderDots();
    const stepKind = isRecap ? '' : steps[st.index].kind;
    e.counter.textContent = isRecap ? 'Recap'
      : `Step ${st.index + 1} of ${steps.length}${stepKind === 'example' ? ' · Real-life example' : ''}`;
    e.lesson.classList.toggle('hidden', isRecap);
    if (isRecap) TutorialNarrator.cancel();
    e.recap.classList.toggle('hidden', !isRecap);
    e.prev.classList.toggle('hidden', st.index === 0);
    e.next.classList.toggle('hidden', isRecap);
    e.practice.classList.toggle('hidden', !isRecap);
    e.again.classList.toggle('hidden', !isRecap);

    if (isRecap) {
      unmount();
      e.scene.innerHTML = '';
      e.stepTitle.textContent = 'What you learned';
      const terms = (st.tutorial.keyTerms || [])
        .map(t => `<div class="recap-term"><dt>${t.term}</dt><dd>${t.definition}</dd></div>`).join('');
      const list = steps.map(s => `<li>${s.title}</li>`).join('');
      e.recap.innerHTML = `<ul class="recap-list">${list}</ul>${terms ? `<h3 class="recap-heading">Key terms</h3><dl class="recap-terms">${terms}</dl>` : ''}`;
      return;
    }

    const step = steps[st.index];
    e.stepTitle.textContent = step.title;
    e.text.innerHTML = step.text;
    e.explain.classList.toggle('hidden', !step.explain);
    e.explainBody.innerHTML = step.explain || '';
    e.narrationBar.classList.toggle('hidden', !TutorialNarrator.supported);
    e.next.textContent = st.index === steps.length - 1 ? 'Finish ✓' : 'Next →';
    mountScene();
    autoNarrate();
  }

  function goTo(i) {
    const max = st.tutorial.steps.length;
    st.index = Math.max(0, Math.min(max, i));
    st.paused = false;
    render();
  }

  function start(subjectId, topicId, meta) {
    const e = grab();
    unmount();
    st.subjectId = subjectId;
    st.topicId = topicId;
    st.tutorial = TUTORIALS[subjectId][topicId];
    st.meta = meta || {};
    st.paused = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    e.icon.textContent = st.meta.icon || '';
    e.topic.textContent = st.tutorial.title || st.meta.name || '';
    st.index = 0;
    render();
  }

  function stop() {
    TutorialNarrator.cancel();
    unmount();
    st.tutorial = null;
  }

  function isActive() {
    return !!st.tutorial && grab().screen.classList.contains('active');
  }

  function wire() {
    const e = grab();
    e.back.addEventListener('click', () => { stop(); if (handlers.onExit) handlers.onExit(); });
    e.prev.addEventListener('click', () => goTo(st.index - 1));
    e.next.addEventListener('click', () => goTo(st.index + 1));
    e.pause.addEventListener('click', () => { st.paused = !st.paused; applyPause(); });
    e.replay.addEventListener('click', () => { st.paused = false; mountScene(); });
    e.again.addEventListener('click', () => goTo(0));
    try { e.auto.checked = localStorage.getItem('studysprint_tutorial_autoplay') !== 'off'; } catch (err) { /* storage may be blocked */ }
    e.auto.addEventListener('change', () => {
      try { localStorage.setItem('studysprint_tutorial_autoplay', e.auto.checked ? 'on' : 'off'); } catch (err) { /* ignore */ }
      if (!e.auto.checked) TutorialNarrator.cancel();
    });
    TutorialNarrator.onChange(updateListenButton);
    e.listen.addEventListener('click', () => {
      if (TutorialNarrator.isSpeaking()) { TutorialNarrator.cancel(); return; }
      if (!st.tutorial || st.index >= st.tutorial.steps.length) return;
      st.paused = false; mountScene();               // restart the scene so it lines up with the narration
      TutorialNarrator.speak(scriptFor(st.tutorial.steps[st.index]));
    });
    e.practice.addEventListener('click', () => {
      const { subjectId, topicId } = st;
      stop();
      if (handlers.onPractice) handlers.onPractice(subjectId, topicId);
    });
    document.addEventListener('keydown', ev => {
      if (!isActive()) return;
      if (ev.key === 'ArrowRight') goTo(st.index + 1);
      else if (ev.key === 'ArrowLeft') goTo(st.index - 1);
    });
  }

  wire();

  return {
    start, stop, goTo,
    setHandlers(h) { Object.assign(handlers, h); },
    refreshScene() { if (st.tutorial && st.index < st.tutorial.steps.length) { const keep = st.paused; mountScene(); if (keep) { st.paused = true; applyPause(); } } },
    currentScript: () => (st.tutorial && st.tutorial.steps[st.index]) ? scriptFor(st.tutorial.steps[st.index]) : '',
    state: () => ({ index: st.index, paused: st.paused, steps: st.tutorial ? st.tutorial.steps.length : 0 })
  };
})();
