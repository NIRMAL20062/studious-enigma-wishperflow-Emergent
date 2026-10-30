// Scene types: the interactive part of a scene, added after its title and lines.
// Each one is called as SCENE_TYPES[type](inner, data, scene) while the page is built.
// A scene can also set:
//   scene.voiceCommands  extra spoken commands while this scene is on screen
//   scene.onEnter / scene.onLeave  run when the scene arrives or goes
// Helpers used here (make, prepareDictation, playDictation, listenOnce, micErrorText,
// SpeechRecognition) live in engine.js and exist by the time scenes are built.

function icon(paths) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  paths.forEach(([tag, attrs]) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    svg.append(el);
  });
  return svg;
}

const MIC_ICON = [
  ["rect", { x: "9", y: "3", width: "6", height: "11", rx: "3" }],
  ["path", { d: "M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" }],
];

function button(className, text, iconPaths) {
  const btn = make("button", className);
  btn.type = "button";
  if (iconPaths) btn.append(icon(iconPaths));
  if (text) btn.append(make("span", "", text));
  return btn;
}

// A dictated line that waits until the scene arms it (after a choice or an answer)
function manualLine(text, className = "story-text") {
  const p = make("p", className, text);
  p.dataset.dictate = "";
  p.dataset.manual = "";
  return p;
}

function arm(line, delay = 400) {
  line.dataset.armed = "";
  playDictation(line, delay);
}

const SCENE_TYPES = {
  // 4.3 Quiet: nothing to do here. Controls fade back (CSS) and dictation slows down.
  quiet(inner, data, scene) {
    scene.dataset.pace = "1.8";
  },

  // 4.5 Read this: a Marathi passage, a countdown, one question.
  readthis(inner, data, scene) {
    const startBtn = button("pill-btn", "I'm ready");
    startBtn.dataset.reveal = "";

    const stage = make("div", "rt-stage");
    stage.hidden = true;

    const timer = make("div", "rt-timer");
    const bar = make("div", "rt-bar");
    const count = make("span", "rt-count");
    timer.append(bar);

    const passage = make("p", "rt-passage", data.passage);
    passage.lang = "mr";

    const question = make("p", "rt-question", data.question);
    const choices = make("div", "rt-choices");
    const choiceBtns = data.choices.map((text) => {
      const btn = button("rt-choice", text);
      choices.append(btn);
      return btn;
    });

    const result = make("div", "rt-result");
    result.hidden = true;
    const verdict = make("p", "rt-verdict");
    verdict.setAttribute("aria-live", "polite");
    const translation = make("p", "rt-translation", data.translation);
    const after = manualLine(data.after);
    result.append(verdict, translation, after);

    stage.append(count, timer, passage, question, choices, result);
    inner.append(startBtn, stage);

    let tick = null;

    const finish = (picked) => {
      clearInterval(tick);
      tick = null;
      choiceBtns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === data.correct) btn.classList.add("is-correct");
        else if (i === picked) btn.classList.add("is-wrong");
      });
      verdict.textContent =
        picked === null ? "Time's up." : picked === data.correct ? "Right." : "Not quite.";
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "center" });
      arm(after, 900);
    };

    const start = () => {
      if (tick || !stage.hidden) return;
      startBtn.hidden = true;
      stage.hidden = false;
      const total = data.seconds * 1000;
      const endsAt = Date.now() + total;
      tick = setInterval(() => {
        const left = Math.max(0, endsAt - Date.now());
        bar.style.transform = `scaleX(${left / total})`;
        count.textContent = `${Math.ceil(left / 1000)}s`;
        if (left === 0) finish(null);
      }, 100);
      choiceBtns[0].focus({ preventScroll: true });
    };

    startBtn.addEventListener("click", start);
    choiceBtns.forEach((btn, i) => btn.addEventListener("click", () => finish(i)));

    // Leaving mid-countdown resets, so nobody comes back to a dead timer
    scene.onLeave = () => {
      if (!tick) return;
      clearInterval(tick);
      tick = null;
      stage.hidden = true;
      startBtn.hidden = false;
    };

    scene.voiceCommands = [{ words: ["ready", "begin", "start"], label: "Go", run: start }];
  },

  // 4.6 Say it: the visitor tries a Marathi phrase and sees what the browser heard.
  sayit(inner, data) {
    const card = make("div", "sayit");
    card.dataset.reveal = "";
    const phrase = make("p", "sayit-phrase", data.phrase);
    phrase.lang = "mr";
    card.append(phrase, make("p", "sayit-roman", data.roman), make("p", "sayit-meaning", data.meaning));

    const controls = make("div", "scene-controls");
    const mic = button("pill-btn", "Try saying it", MIC_ICON);
    mic.setAttribute("aria-pressed", "false");
    const skip = button("link-btn", SpeechRecognition ? "Skip" : "I can't say it either");
    controls.append(mic, skip);
    controls.dataset.reveal = "";

    const heard = make("p", "heard");
    heard.setAttribute("aria-live", "polite");
    const after = manualLine(data.after);

    const done = () => {
      if (!("armed" in after.dataset)) arm(after, 700);
    };

    if (!SpeechRecognition) mic.hidden = true;

    mic.addEventListener("click", () => {
      const stop = listenOnce({
        lang: data.lang,
        onStart: () => {
          mic.setAttribute("aria-pressed", "true");
          heard.textContent = "Listening...";
        },
        onInterim: (said) => (heard.textContent = said),
        onFinal: (said) => {
          heard.textContent = `Heard: "${said}"`;
          done();
        },
        onError: (code) => (heard.textContent = micErrorText(code)),
        onEnd: () => mic.setAttribute("aria-pressed", "false"),
      });
      if (!stop) heard.textContent = "Voice isn't available here.";
    });
    skip.addEventListener("click", done);

    inner.append(card, controls, heard, after);
  },

  // 4.7 Decision: pick one card (tap or say it). The others step back, then my real choice is dictated.
  decision(inner, data, scene) {
    const cards = make("div", "decision");
    const outcome = manualLine(data.outcome, "story-text decision-outcome");

    const choose = (chosen) => {
      if (cards.dataset.chosen) return;
      cards.dataset.chosen = String(chosen);
      [...cards.children].forEach((card, i) => {
        card.classList.add(i === chosen ? "is-chosen" : "is-dimmed");
        card.setAttribute("aria-pressed", String(i === chosen));
        card.disabled = true;
      });
      arm(outcome, 500);
    };

    data.options.forEach((opt, i) => {
      const card = make("button", "decision-card");
      card.type = "button";
      card.dataset.reveal = "";
      card.setAttribute("aria-pressed", "false");
      card.append(make("span", "decision-key", String.fromCharCode(65 + i)));
      card.append(make("h3", "", opt.title));
      const list = make("ul");
      opt.points.forEach((point) => list.append(make("li", "", point)));
      card.append(list);
      card.addEventListener("click", () => choose(i));
      cards.append(card);
    });

    inner.append(cards, outcome);

    scene.voiceCommands = data.options.map((opt, i) => ({
      words: opt.say || [],
      label: `You chose "${opt.title}"`,
      run: () => choose(i),
    }));
  },

  // 4.9 Post-mortem: a short incident review, each row revealed in turn.
  postmortem(inner, data) {
    const doc = make("article", "postmortem");
    const head = make("header", "pm-head");
    head.dataset.reveal = "";
    head.append(make("p", "pm-kicker", "Incident review"));
    head.append(make("h3", "pm-name", data.doc.name));
    head.append(make("span", "pm-status", data.doc.status));
    doc.append(head);
    doc.append(rowsList(data.doc.rows, "pm-rows", "pm-row"));
    inner.append(doc);
  },

  // 4.11 Ask me anything: type, tap a suggestion, or speak. Answers come only from story.js.
  ask(inner, data) {
    const chips = make("div", "chips");
    chips.dataset.reveal = "";
    data.suggestions.forEach((q) => {
      const chip = button("chip", q);
      chip.addEventListener("click", () => answer(q));
      chips.append(chip);
    });

    const form = make("form", "ask-form");
    form.dataset.reveal = "";
    const input = make("input", "ask-input");
    input.type = "text";
    input.placeholder = "Ask me something";
    input.setAttribute("aria-label", "Your question");
    input.autocomplete = "off";
    const mic = button("icon-btn", "", MIC_ICON);
    mic.setAttribute("aria-label", "Ask by voice");
    mic.setAttribute("aria-pressed", "false");
    if (!SpeechRecognition) mic.hidden = true;
    const send = button("pill-btn", "Ask");
    send.type = "submit";
    form.append(input, mic, send);

    const asked = make("p", "ask-q");
    const reply = manualLine("", "story-text ask-a");

    const wordHit = (text, key) => new RegExp(`\\b${key}\\b`).test(text);

    function answer(q) {
      const text = q.toLowerCase();
      let best = null;
      let bestScore = 0;
      data.answers.forEach((entry) => {
        const score = entry.keys.filter((k) => wordHit(text, k)).length;
        if (score > bestScore) {
          best = entry;
          bestScore = score;
        }
      });
      asked.textContent = q;
      prepareDictation(reply, best ? best.a : data.fallback);
      arm(reply, 200);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const q = input.value.trim();
      if (q) answer(q);
    });

    mic.addEventListener("click", () => {
      listenOnce({
        onStart: () => {
          mic.setAttribute("aria-pressed", "true");
          input.value = "";
          input.placeholder = "Listening...";
        },
        onInterim: (said) => (input.value = said),
        onFinal: (said) => {
          input.value = said;
          answer(said);
        },
        onError: (code) => (input.placeholder = micErrorText(code)),
        onEnd: () => {
          mic.setAttribute("aria-pressed", "false");
          if (input.placeholder === "Listening...") input.placeholder = "Ask me something";
        },
      });
    });

    inner.append(chips, form, asked, reply);
  },

  // 4.13 Personas: pick a student, see who they are and how I would reach them.
  personas(inner, data, scene) {
    const picker = make("div", "chips");
    picker.dataset.reveal = "";
    const panel = make("div", "persona-panel");
    panel.dataset.reveal = "";
    panel.setAttribute("aria-live", "polite");

    const pickBtns = data.personas.map((p, i) => {
      const btn = button("chip", p.name);
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => show(i));
      picker.append(btn);
      return btn;
    });

    function show(i) {
      pickBtns.forEach((btn, j) => btn.setAttribute("aria-pressed", String(i === j)));
      const persona = data.personas[i];
      panel.replaceChildren(make("h3", "persona-name", persona.name), rowsList(persona.rows, "pm-rows", "pm-row"));
      // Restart the fade so a new pick feels like a new page
      panel.classList.remove("is-swapped");
      void panel.offsetWidth;
      panel.classList.add("is-swapped");
    }

    show(0);
    inner.append(picker, panel);

    scene.voiceCommands = data.personas.map((p, i) => ({ words: p.say || [], label: p.name, run: () => show(i) }));
  },

  // 4.14 Demo: speak messy Hinglish, see the fillers struck out and the clean sentence.
  demo(inner, data) {
    const box = make("div", "demo");
    box.dataset.reveal = "";

    const rawPanel = make("div", "demo-panel");
    const raw = make("p", "demo-raw");
    raw.setAttribute("aria-live", "polite");
    rawPanel.append(make("p", "demo-label", "What you said"), raw);

    const cleanPanel = make("div", "demo-panel demo-panel-clean");
    const clean = manualLine("", "demo-clean");
    cleanPanel.append(make("p", "demo-label", "What you meant"), clean);
    box.append(rawPanel, cleanPanel);

    const controls = make("form", "scene-controls");
    controls.dataset.reveal = "";
    const mic = button("pill-btn", "Speak", MIC_ICON);
    mic.setAttribute("aria-pressed", "false");
    if (!SpeechRecognition) mic.hidden = true;
    const input = make("input", "ask-input demo-input");
    input.type = "text";
    input.placeholder = SpeechRecognition ? "or type it here" : "Type it here";
    input.setAttribute("aria-label", "Something in Hinglish");
    const example = button("link-btn", "Use an example");
    controls.append(mic, input, example);

    const note = make("p", "demo-note", data.note);

    function run(text) {
      const { tokens, kept } = cleanUp(text);
      raw.replaceChildren();
      tokens.forEach(({ word, filler }, i) => {
        if (i) raw.append(" ");
        raw.append(filler ? make("s", "filler", word) : word);
      });
      prepareDictation(clean, kept);
      arm(clean, 300);
    }

    mic.addEventListener("click", () => {
      listenOnce({
        onStart: () => {
          mic.setAttribute("aria-pressed", "true");
          raw.textContent = "Listening...";
        },
        onInterim: (said) => (raw.textContent = said),
        onFinal: run,
        onError: (code) => (raw.textContent = micErrorText(code)),
        onEnd: () => mic.setAttribute("aria-pressed", "false"),
      });
    });

    controls.addEventListener("submit", (event) => {
      event.preventDefault();
      if (input.value.trim()) run(input.value.trim());
    });

    example.addEventListener("click", () => {
      input.value = data.example;
      run(data.example);
    });

    inner.append(box, controls, note);
  },

  // 4.15 Ending: the facts a recruiter needs, and where to find me.
  ending(inner, data) {
    inner.append(rowsList(data.facts, "end-facts", "end-fact"));

    const links = make("div", "scene-controls");
    links.dataset.reveal = "";
    data.links.forEach((link) => {
      if (link.href.startsWith("TODO")) {
        links.append(make("span", "pill-btn todo", `${link.label}: TODO`));
        return;
      }
      const a = make("a", "pill-btn", link.label);
      a.href = link.href;
      if (link.href.startsWith("http")) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      links.append(a);
    });
    inner.append(links);

    const credit = make("p", "end-credit", data.credit);
    credit.dataset.reveal = "";
    inner.append(credit);
  },
};

// Label and text rows, used by the post-mortem, personas and ending
function rowsList(rows, listClass, rowClass) {
  const list = make("dl", listClass);
  rows.forEach((row) => {
    const wrap = make("div", rowClass);
    wrap.dataset.reveal = "";
    wrap.append(make("dt", "", row.label), make("dd", "", row.text));
    list.append(wrap);
  });
  return list;
}

// Tiny Hinglish clean-up for the demo: drop fillers and repeats, then tidy the sentence.
const FILLERS = ["um", "umm", "uh", "uhh", "hmm", "basically", "matlab", "actually"];
const FILLER_PHRASES = [["you", "know"], ["i", "mean"]];
const LIKE_KEEPERS = ["i", "you", "we", "they", "would", "to", "dont", "don't", "really"];

function cleanUp(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const bare = (w) => (w || "").toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
  const tokens = words.map((word) => ({ word, filler: false }));

  tokens.forEach((t, i) => {
    const w = bare(t.word);
    const prev = bare(words[i - 1]);
    if (FILLERS.includes(w)) t.filler = true;
    if (w === "like" && !LIKE_KEEPERS.includes(prev)) t.filler = true;
    if (w === "so" && tokens.slice(0, i).every((p) => p.filler)) t.filler = true;
    if (i > 0 && w && w === prev) t.filler = true;
    FILLER_PHRASES.forEach(([a, b]) => {
      if (w === a && bare(words[i + 1]) === b) {
        t.filler = true;
        tokens[i + 1].filler = true;
      }
    });
  });

  let kept = tokens.filter((t) => !t.filler).map((t) => t.word).join(" ");
  kept = kept.replace(/\s+([,.!?])/g, "$1").replace(/^[,\s]+/, "");
  if (kept) kept = kept[0].toUpperCase() + kept.slice(1);
  if (kept && !/[.!?]$/.test(kept)) kept += ".";
  return { tokens, kept };
}
