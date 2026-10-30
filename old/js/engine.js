// Scenes, reveals, dictation effect and voice. Built in tasks 1.x and 2.x.

document.documentElement.classList.add("js");

// Small DOM helper. Text always goes in through textContent, never innerHTML.
// Text starting with "TODO" gets flagged so placeholder lines are impossible to miss.
function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) {
    el.textContent = text;
    if (text.startsWith("TODO")) el.classList.add("todo");
  }
  return el;
}

// 1.4 Build scenes from STORY (js/story.js).
function buildScenes() {
  const root = document.getElementById("story");

  STORY.scenes.forEach((data, index) => {
    const scene = document.createElement("section");
    scene.className = "scene";
    scene.dataset.theme = data.theme || "cream";
    if (data.type) scene.dataset.type = data.type;

    const inner = document.createElement("div");
    inner.className = "scene-inner";

    if (data.eyebrow) {
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.dataset.reveal = "";
      eyebrow.textContent = data.eyebrow;
      inner.append(eyebrow);
    }

    if (data.title) {
      const title = document.createElement(index === 0 ? "h1" : "h2");
      title.dataset.reveal = "";
      data.title.split("\n").forEach((part, i) => {
        if (i > 0) title.append(document.createElement("br"));
        title.append(part);
      });
      inner.append(title);
    }

    (data.lines || []).forEach((line) => {
      const p = make("p", "story-text", line.text);
      if (line.dictate) p.dataset.dictate = "";
      else p.dataset.reveal = "";
      inner.append(p);
    });

    if (SCENE_TYPES[data.type]) SCENE_TYPES[data.type](inner, data, scene);

    scene.append(inner);
    root.append(scene);
  });
}

// 1.2 Reveal: when a scene comes into view, its [data-reveal] items fade in one after another.
// Leaving a scene resets it, so scrolling back plays the reveal again.
function setupReveals() {
  const scenes = document.querySelectorAll(".scene");

  scenes.forEach((scene) => {
    scene.querySelectorAll("[data-reveal]").forEach((el, i) => {
      el.style.setProperty("--i", i);
    });
  });

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const visible = entry.isIntersecting;
        entry.target.querySelectorAll("[data-reveal]").forEach((el) => {
          el.classList.toggle("is-visible", visible);
        });
        onSceneChange(entry.target, visible);
      });
    },
    { threshold: 0.5 }
  );

  scenes.forEach((scene) => observer.observe(scene));
}

// 1.3 Dictation: [data-dictate] text appears word by word, with a caret, like Wispr Flow transcribing.
// Uneven gaps and longer pauses after punctuation make it feel spoken, not typed.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Split an element's text into word spans. Scenes call this again when they swap in new text.
function prepareDictation(el, text = el.textContent) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  el.setAttribute("aria-label", words.join(" "));
  el.classList.toggle("todo", words[0] === "TODO:" || words[0] === "TODO");
  el.textContent = "";
  words.forEach((w, i) => {
    const span = document.createElement("span");
    span.className = "word";
    span.setAttribute("aria-hidden", "true");
    span.textContent = w;
    el.append(span);
    if (i < words.length - 1) el.append(" ");
  });
  const caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");
  el.append(caret);
}

function setupDictation() {
  document.querySelectorAll("[data-dictate]").forEach((el) => prepareDictation(el));
}

function wordGap(word) {
  if (/[.!?]$/.test(word)) return 520;
  if (/[,;:]$/.test(word)) return 300;
  return 90 + Math.random() * 110;
}

// Returns when (ms from now) the last word lands, so lines can be chained one after another.
// pace > 1 slows it down (the quiet scene uses 1.8).
function playDictation(el, startDelay, pace = 1) {
  stopDictation(el);
  const words = el.querySelectorAll(".word");
  if (reducedMotion) {
    words.forEach((w) => w.classList.add("on"));
    return startDelay;
  }

  el.timers = [];
  let t = startDelay;
  el.timers.push(setTimeout(() => el.classList.add("is-typing"), t));
  words.forEach((w) => {
    t += wordGap(w.textContent) * pace;
    el.timers.push(setTimeout(() => w.classList.add("on"), t));
  });
  el.timers.push(setTimeout(() => el.classList.remove("is-typing"), t + 1200));
  return t;
}

function stopDictation(el) {
  (el.timers || []).forEach(clearTimeout);
  el.timers = [];
  el.classList.remove("is-typing");
  el.querySelectorAll(".word").forEach((w) => w.classList.remove("on"));
}

// 1.5 Progress: the line fills with scroll; the label and colours follow the current scene.
const progress = document.querySelector(".progress");
const progressFill = progress.querySelector(".progress-fill");
const progressLabel = progress.querySelector(".progress-label");

function updateProgressFill() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  progressFill.style.transform = `scaleX(${ratio})`;
}

function setCurrentScene(scene) {
  const scenes = [...document.querySelectorAll(".scene")];
  const index = scenes.indexOf(scene);
  const total = String(scenes.length).padStart(2, "0");
  const number = String(index + 1).padStart(2, "0");
  const name = STORY.scenes[index].eyebrow;
  progressLabel.textContent = name ? `${number} / ${total}  ·  ${name}` : `${number} / ${total}`;
  currentIndex = index;
  document.body.dataset.sceneType = scene.dataset.type || "";
  document.querySelectorAll(".progress, .sound-toggle, .voice-dock").forEach((el) => {
    el.dataset.theme = scene.dataset.theme;
  });
  document.querySelector('[data-nav="prev"]').disabled = index === 0;
  document.querySelector('[data-nav="next"]').disabled = index === scenes.length - 1;
}

let progressTicking = false;
window.addEventListener("scroll", () => {
  if (progressTicking) return;
  progressTicking = true;
  requestAnimationFrame(() => {
    updateProgressFill();
    progressTicking = false;
  });
}, { passive: true });
window.addEventListener("resize", updateProgressFill);

// 1.6 Sound: off by default. A soft ambient chord made in code (Web Audio), no files to download.
// Replace with a real loop later by swapping startAmbient().
const soundToggle = document.querySelector(".sound-toggle");
let audio = null;

function startAmbient() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.connect(master);

  // A open fifth, slightly detuned so it breathes
  [110, 164.81, 220, 220.6].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = 0.25;
    osc.connect(g).connect(filter);
    osc.start();
  });

  // Slow swell in the filter, like air moving
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 350;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  return { ctx, master };
}

function setSound(on) {
  if (on && !audio) audio = startAmbient();
  if (audio) {
    const now = audio.ctx.currentTime;
    if (on) audio.ctx.resume();
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setTargetAtTime(on ? 0.05 : 0, now, 0.6);
  }
  soundToggle.setAttribute("aria-pressed", String(on));
  soundToggle.setAttribute("aria-label", on ? "Sound on. Turn sound off" : "Sound off. Turn sound on");
}

soundToggle.addEventListener("click", () => {
  setSound(soundToggle.getAttribute("aria-pressed") !== "true");
});

// 2.x Navigation: arrows and voice both use goToScene, so every voice action has a button.
let currentIndex = 0;

function goToScene(index) {
  const scenes = document.querySelectorAll(".scene");
  const target = scenes[Math.max(0, Math.min(index, scenes.length - 1))];
  target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
}

document.querySelectorAll("[data-nav]").forEach((btn) => {
  btn.addEventListener("click", () => {
    goToScene(currentIndex + (btn.dataset.nav === "next" ? 1 : -1));
  });
});

// 2.1 to 2.3 Voice: tap the mic, speak, see your words live, then the command runs.
// English and Hindi words both work, because that is how I actually talk.
const VOICE_COMMANDS = [
  { words: ["next", "aage", "age", "continue", "go on", "chalo", "forward"], label: "Next scene", run: () => goToScene(currentIndex + 1) },
  { words: ["back", "previous", "go back", "peeche", "pichhe", "piche"], label: "Previous scene", run: () => goToScene(currentIndex - 1) },
  { words: ["start over", "beginning", "from the start", "shuru"], label: "Back to the start", run: () => goToScene(0) },
  { words: ["sound off", "mute", "music off", "quiet"], label: "Sound off", run: () => setSound(false) },
  { words: ["sound on", "music on", "play sound"], label: "Sound on", run: () => setSound(true) },
];

const micBtn = document.querySelector(".mic-btn");
const transcript = document.querySelector(".voice-transcript");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let transcriptTimer = null;

function showTranscript(text, holdMs) {
  clearTimeout(transcriptTimer);
  transcript.textContent = text;
  transcript.classList.add("is-shown");
  if (holdMs) {
    transcriptTimer = setTimeout(() => transcript.classList.remove("is-shown"), holdMs);
  }
}

// The current scene's own commands (like "stay" or "go") are checked alongside the global ones.
function matchCommand(said, sceneCommands = []) {
  const text = said.toLowerCase();
  // Longest phrase first, so "go back" wins over "go"
  const options = [...sceneCommands, ...VOICE_COMMANDS]
    .flatMap((c) => c.words.map((w) => ({ w, c })))
    .sort((a, b) => b.w.length - a.w.length);
  const hit = options.find(({ w }) => new RegExp(`\\b${w}\\b`).test(text));
  return hit ? hit.c : null;
}

// One-shot listening for scenes with their own mic (Marathi phrase, Ask me, Hinglish demo).
// Returns a stop function. Returns null when the browser has no speech support.
function listenOnce({ lang = "en-IN", onStart, onInterim, onFinal, onError, onEnd }) {
  if (!SpeechRecognition) return null;
  const rec = new SpeechRecognition();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = false;
  rec.onstart = () => onStart && onStart();
  rec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const said = result[0].transcript.trim();
    if (result.isFinal) onFinal && onFinal(said);
    else onInterim && onInterim(said);
  };
  rec.onerror = (event) => onError && onError(event.error);
  rec.onend = () => onEnd && onEnd();
  try {
    rec.start();
  } catch {
    return null;
  }
  return () => rec.stop();
}

function micErrorText(code) {
  if (code === "not-allowed" || code === "service-not-allowed") return "Microphone is blocked.";
  if (code === "no-speech") return "Didn't catch that. Try again.";
  if (code === "network") return "Voice needs an internet connection.";
  if (code === "language-not-supported") return "This browser can't listen in that language.";
  return "Voice stopped. Try again.";
}

function setupVoice() {
  // 2.2 No speech support (Firefox, some Safari): no mic, no error. The arrows still work.
  if (!SpeechRecognition) return;

  micBtn.hidden = false;
  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    micBtn.setAttribute("aria-pressed", "true");
    micBtn.setAttribute("aria-label", "Listening. Tap to stop");
    showTranscript("Listening...");
  };

  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const said = result[0].transcript.trim();
    if (!result.isFinal) {
      showTranscript(said);
      return;
    }
    const scene = document.querySelectorAll(".scene")[currentIndex];
    const command = matchCommand(said, scene.voiceCommands);
    if (command) {
      showTranscript(`"${said}"  ·  ${command.label}`, 2200);
      command.run();
    } else {
      showTranscript(`"${said}"  ·  try "next" or "back"`, 3200);
    }
  };

  recognition.onerror = (event) => {
    const messages = {
      "not-allowed": "Microphone is blocked. The arrows work too.",
      "service-not-allowed": "Microphone is blocked. The arrows work too.",
      "no-speech": "Didn't catch that. Tap and try again.",
      "network": "Voice needs an internet connection.",
    };
    showTranscript(messages[event.error] || "Voice stopped. Tap to try again.", 3200);
  };

  recognition.onend = () => {
    micBtn.setAttribute("aria-pressed", "false");
    micBtn.setAttribute("aria-label", "Speak a command");
    if (transcript.textContent === "Listening...") transcript.classList.remove("is-shown");
  };

  micBtn.addEventListener("click", () => {
    if (micBtn.getAttribute("aria-pressed") === "true") {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch {
      // start() throws if a session is still closing; ignore and let the user tap again
    }
  });
}

function onSceneChange(scene, visible) {
  if (visible) setCurrentScene(scene);
  const pace = Number(scene.dataset.pace || 1);
  const revealCount = Math.min(scene.querySelectorAll("[data-reveal]").length, 4);
  let start = revealCount * 140 + 400;

  // Lines are dictated one after another. Manual lines (like a decision's outcome)
  // wait until they are armed, then replay when you come back to the scene.
  scene.querySelectorAll("[data-dictate]").forEach((el) => {
    if (!visible) return stopDictation(el);
    if ("manual" in el.dataset && !("armed" in el.dataset)) return;
    start = playDictation(el, start, pace) + 700 * pace;
  });

  // Scene types can react to arriving or leaving (for example, stopping a timer)
  if (visible && scene.onEnter) scene.onEnter();
  if (!visible && scene.onLeave) scene.onLeave();
}

buildScenes();
setupDictation();
setCurrentScene(document.querySelector(".scene"));
updateProgressFill();
setupReveals();
setupVoice();
