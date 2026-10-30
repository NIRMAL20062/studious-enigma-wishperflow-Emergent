// Activities: the interactive card that opens after a place's dialog.
// ACTIVITIES[type](body, data, ctx)
//   body         the card's content area
//   data         the place's activity from game-data.js
//   ctx.complete()        call when the player has done it (enables Continue)
//   ctx.commands          set to a list of extra voice commands while the card is open
//   ctx.onClose           set to a function to clean up (timers) when the card closes
// Uses SpeechRecognition from game.js (loaded after this file, before any card opens).

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) {
    node.textContent = text;
    if (text.startsWith("TODO")) node.classList.add("todo");
  }
  return node;
}

function btn(className, text) {
  const b = el("button", className, text);
  b.type = "button";
  return b;
}

const MIC_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';

function micButton(className, label) {
  const b = btn(className);
  b.innerHTML = MIC_SVG;
  if (label) b.append(el("span", "", label));
  b.setAttribute("aria-pressed", "false");
  if (!SpeechRecognition) b.hidden = true;
  return b;
}

// Word-by-word text, like live transcription
function typeText(node, text, delay = 200) {
  (node.typeTimers || []).forEach(clearTimeout);
  node.typeTimers = [];
  node.textContent = "";
  node.classList.toggle("todo", text.startsWith("TODO"));
  node.setAttribute("aria-label", text);
  let t = delay;
  text.split(/\s+/).forEach((w, i) => {
    const s = document.createElement("span");
    s.className = "word";
    s.textContent = w;
    s.setAttribute("aria-hidden", "true");
    if (i) node.append(" ");
    node.append(s);
    t += reducedMotion ? 0 : /[.!?]$/.test(w) ? 340 : 60 + Math.random() * 70;
    node.typeTimers.push(setTimeout(() => s.classList.add("on"), t));
  });
}

// One-shot listening. Returns false if voice is not available.
function listen({ lang = "en-IN", button, onStart, onInterim, onFinal, onError }) {
  if (!SpeechRecognition) return false;
  const rec = new SpeechRecognition();
  rec.lang = lang;
  rec.interimResults = true;
  rec.onstart = () => {
    if (button) button.setAttribute("aria-pressed", "true");
    if (onStart) onStart();
  };
  rec.onresult = (e) => {
    const r = e.results[e.results.length - 1];
    const said = r[0].transcript.trim();
    if (r.isFinal) onFinal && onFinal(said);
    else onInterim && onInterim(said);
  };
  rec.onerror = (e) => onError && onError(micMessage(e.error));
  rec.onend = () => button && button.setAttribute("aria-pressed", "false");
  try {
    rec.start();
  } catch {
    return false;
  }
  return true;
}

function micMessage(code) {
  if (code === "not-allowed" || code === "service-not-allowed") return "Microphone is blocked.";
  if (code === "no-speech") return "Didn't catch that. Try again.";
  if (code === "network") return "Voice needs an internet connection.";
  if (code === "language-not-supported") return "This browser can't listen in that language.";
  return "Voice stopped. Try again.";
}

function rowList(rows) {
  const dl = el("dl", "rows");
  rows.forEach((r) => {
    const row = el("div", "row");
    row.append(el("dt", "", r.label), el("dd", "", r.text));
    dl.append(row);
  });
  return dl;
}

const ACTIVITIES = {
  // V.8 Read this: a countdown over a Marathi passage, one question
  readthis(body, data, ctx) {
    const start = btn("big-btn", "I'm ready");
    const stage = el("div", "rt");
    stage.hidden = true;

    const top = el("div", "rt-top");
    const count = el("span", "rt-count", `${data.seconds}s`);
    const track = el("div", "rt-track");
    const bar = el("div", "rt-bar");
    track.append(bar);
    top.append(count, track);

    const passage = el("p", "rt-passage", data.passage);
    passage.lang = "mr";
    const question = el("p", "rt-question", data.question);
    const choices = el("div", "choice-row");
    const choiceBtns = data.choices.map((c) => {
      const b = btn("choice", c);
      choices.append(b);
      return b;
    });

    const result = el("div", "rt-result");
    result.hidden = true;
    const verdict = el("p", "verdict");
    const translation = el("p", "soft", data.translation);
    const after = el("p", "story");
    result.append(verdict, translation, after);

    stage.append(top, passage, question, choices, result);
    body.append(start, stage);

    let tick = null;
    const finish = (picked) => {
      clearInterval(tick);
      tick = null;
      choiceBtns.forEach((b, i) => {
        b.disabled = true;
        if (i === data.correct) b.classList.add("is-right");
        else if (i === picked) b.classList.add("is-wrong");
      });
      verdict.textContent = picked === null ? "Time's up!" : picked === data.correct ? "Correct!" : "Not quite.";
      verdict.dataset.result = picked === data.correct ? "win" : "lose";
      result.hidden = false;
      typeText(after, data.after, 600);
      // Scroll only inside the card; scrollIntoView would also shift the game frame
      const card = result.closest(".activity-card");
      card.scrollTo({ top: card.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
      ctx.complete();
    };

    const go = () => {
      if (tick || !stage.hidden) return;
      start.hidden = true;
      stage.hidden = false;
      const total = data.seconds * 1000;
      const endsAt = Date.now() + total;
      tick = setInterval(() => {
        const left = Math.max(0, endsAt - Date.now());
        bar.style.transform = `scaleX(${left / total})`;
        count.textContent = `${Math.ceil(left / 1000)}s`;
        count.classList.toggle("is-low", left < 5000);
        if (left === 0) finish(null);
      }, 100);
    };

    start.addEventListener("click", go);
    choiceBtns.forEach((b, i) => b.addEventListener("click", () => finish(i)));
    ctx.onClose = () => clearInterval(tick);
    ctx.commands = [{ words: ["ready", "begin", "start"], label: "Go!", run: go }];
  },

  // V.9 Say it: try the Marathi phrase out loud, see what was heard
  sayit(body, data, ctx) {
    const card = el("div", "phrase-card");
    const phrase = el("p", "phrase", data.phrase);
    phrase.lang = "mr";
    card.append(phrase, el("p", "phrase-roman", data.roman), el("p", "soft", data.meaning));

    const row = el("div", "action-row");
    const mic = micButton("big-btn mic-big", "Say it");
    const skip = btn("link-btn", SpeechRecognition ? "Skip" : "I can't say it either");
    row.append(mic, skip);

    const heard = el("p", "heard");
    heard.setAttribute("aria-live", "polite");
    const after = el("p", "story");

    const done = () => {
      if (after.dataset.done) return;
      after.dataset.done = "1";
      typeText(after, data.after, 500);
      ctx.complete();
    };

    mic.addEventListener("click", () => {
      listen({
        lang: data.lang,
        button: mic,
        onStart: () => (heard.textContent = "Listening..."),
        onInterim: (s) => (heard.textContent = s),
        onFinal: (s) => {
          heard.textContent = `Heard: "${s}"`;
          done();
        },
        onError: (m) => (heard.textContent = m),
      });
    });
    skip.addEventListener("click", done);

    body.append(card, row, heard, after);
  },

  // V.10 Decision: commit to one card, then see what I really did
  decision(body, data, ctx) {
    const cards = el("div", "decision");
    const outcome = el("p", "story");
    let chosen = false;

    const choose = (i) => {
      if (chosen) return;
      chosen = true;
      [...cards.children].forEach((c, j) => {
        c.classList.add(i === j ? "is-chosen" : "is-dimmed");
        c.setAttribute("aria-pressed", String(i === j));
        c.disabled = true;
      });
      typeText(outcome, data.outcome, 400);
      ctx.complete();
    };

    data.options.forEach((opt, i) => {
      const c = btn("decision-card");
      c.setAttribute("aria-pressed", "false");
      c.append(el("span", "decision-key", String.fromCharCode(65 + i)), el("h3", "", opt.title));
      const ul = el("ul");
      opt.points.forEach((p) => ul.append(el("li", "", p)));
      c.append(ul);
      c.addEventListener("click", () => choose(i));
      cards.append(c);
    });

    body.append(cards, outcome);
    ctx.commands = data.options.map((opt, i) => ({ words: opt.say || [], label: `You chose "${opt.title}"`, run: () => choose(i) }));
  },

  // V.11 Captain's log: the JEE post-mortem
  log(body, data, ctx) {
    const page = el("article", "logbook");
    const head = el("header", "log-head");
    head.append(el("span", "log-status", data.status));
    page.append(head, rowList(data.rows));
    body.append(page);
    ctx.complete();
  },

  // V.12 Ask me anything: tap, type, or speak a question
  ask(body, data, ctx) {
    const chips = el("div", "chips");
    data.suggestions.forEach((q) => {
      const c = btn("chip", q);
      c.addEventListener("click", () => answer(q));
      chips.append(c);
    });

    const form = el("form", "ask-form");
    const input = el("input", "text-input");
    input.type = "text";
    input.placeholder = "Ask me something";
    input.autocomplete = "off";
    input.setAttribute("aria-label", "Your question");
    const mic = micButton("round-btn");
    mic.setAttribute("aria-label", "Ask by voice");
    const send = btn("small-btn", "Ask");
    send.type = "submit";
    form.append(input, mic, send);

    const asked = el("p", "asked");
    const reply = el("p", "story");

    function answer(q) {
      const text = q.toLowerCase();
      let best = null;
      let bestScore = 0;
      data.answers.forEach((a) => {
        const score = a.keys.filter((k) => new RegExp(`\\b${k}\\b`).test(text)).length;
        if (score > bestScore) {
          best = a;
          bestScore = score;
        }
      });
      asked.textContent = q;
      typeText(reply, best ? best.a : data.fallback, 150);
      ctx.complete();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim()) answer(input.value.trim());
    });

    mic.addEventListener("click", () => {
      listen({
        button: mic,
        onStart: () => {
          input.value = "";
          input.placeholder = "Listening...";
        },
        onInterim: (s) => (input.value = s),
        onFinal: (s) => {
          input.value = s;
          input.placeholder = "Ask me something";
          answer(s);
        },
        onError: (m) => (input.placeholder = m),
      });
    });

    body.append(chips, form, asked, reply);
    ctx.complete(); // asking is optional
  },

  // Tabs: pick an item, see its rows. Used for the user personas and the playbook.
  // Continue unlocks once every tab has been seen.
  tabs(body, data, ctx) {
    const items = data.items;
    const picker = el("div", "chips");
    const panel = el("div", "crew-card");
    panel.setAttribute("aria-live", "polite");
    const seen = new Set();

    const pickBtns = items.map((p, i) => {
      const b = btn("chip", p.name);
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => show(i));
      picker.append(b);
      return b;
    });

    function show(i) {
      pickBtns.forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
      const p = items[i];
      panel.replaceChildren(el("h3", "crew-name", p.name), rowList(p.rows));
      panel.classList.remove("is-swapped");
      void panel.offsetWidth;
      panel.classList.add("is-swapped");
      seen.add(i);
      pickBtns[i].classList.add("is-seen");
      if (seen.size === items.length) ctx.complete();
    }

    show(0);
    body.append(picker, panel);
    ctx.commands = items.map((p, i) => ({ words: p.say || [], label: p.name, run: () => show(i) }));
  },

  // Voice vs typing race: the visitor's own typing speed, then speaking speed, measured here.
  // Then the spoken words cleaned up, like Flow does. No claims, only their numbers.
  race(body, data, ctx) {
    const words = (t) => t.trim().split(/\s+/).filter(Boolean).length;
    const target = el("p", "race-target", data.sentence);

    const step1 = el("div", "race-step");
    const typeForm = el("form", "action-row");
    const input = el("input", "text-input");
    input.type = "text";
    input.placeholder = "Type it here. The clock starts on your first key.";
    input.autocomplete = "off";
    input.setAttribute("aria-label", "Type the sentence");
    const typed = btn("small-btn", "Done");
    typed.type = "submit";
    typeForm.append(input, typed);
    step1.append(el("p", "demo-label", "Round 1 · Type it"), typeForm);

    const step2 = el("div", "race-step");
    step2.hidden = true;
    const mic = micButton("big-btn mic-big", "Say it");
    const heard = el("p", "heard");
    heard.setAttribute("aria-live", "polite");
    step2.append(el("p", "demo-label", "Round 2 · Now say it"), mic, heard);

    const results = el("div", "race-results");
    results.hidden = true;
    const bars = el("div", "race-bars");
    const verdict = el("p", "verdict");
    const cleanBox = el("div", "demo-box is-clean");
    cleanBox.hidden = true;
    const clean = el("p", "demo-text");
    cleanBox.append(el("p", "demo-label", "What you meant"), clean);
    results.append(bars, verdict, cleanBox, el("p", "soft small", data.note));

    body.append(target, step1, step2, results);

    let typeStart = null;
    let typeWpm = null;
    let speakWpm = null;

    function bar(label, wpm, max, className) {
      const row = el("div", `race-row ${className}`);
      const track = el("div", "race-track");
      const fill = el("div", "race-fill");
      fill.style.width = `${Math.max(6, (wpm / max) * 100)}%`;
      track.append(fill);
      row.append(el("span", "race-label", label), track, el("span", "race-wpm", `${Math.round(wpm)} wpm`));
      return row;
    }

    function show() {
      const max = Math.max(typeWpm || 0, speakWpm || 0, 1);
      bars.replaceChildren();
      if (typeWpm) bars.append(bar("Typing", typeWpm, max, "is-type"));
      if (speakWpm) bars.append(bar("Speaking", speakWpm, max, "is-speak"));
      if (typeWpm && speakWpm) {
        const ratio = speakWpm / typeWpm;
        verdict.textContent = ratio >= 1.1 ? `Speaking was ${ratio.toFixed(1)}x faster for you.` : "Typing kept up this time. Try speaking the way you talk to a friend.";
      } else {
        verdict.textContent = SpeechRecognition ? "Now say it, and race yourself." : "Open this in Chrome to race your voice against your typing.";
      }
      results.hidden = false;
    }

    input.addEventListener("input", () => {
      if (!typeStart) typeStart = performance.now();
    });

    typeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!typeStart || !input.value.trim()) return;
      const minutes = (performance.now() - typeStart) / 60000;
      typeWpm = words(input.value) / Math.max(minutes, 1 / 600);
      input.disabled = true;
      typed.disabled = true;
      if (SpeechRecognition) step2.hidden = false;
      show();
      ctx.complete();
    });

    mic.addEventListener("click", () => {
      let firstWord = null;
      listen({
        button: mic,
        onStart: () => (heard.textContent = "Listening..."),
        onInterim: (s) => {
          if (!firstWord) firstWord = performance.now();
          heard.textContent = s;
        },
        onFinal: (s) => {
          const end = performance.now();
          const ms = Math.max(end - (firstWord || end - 1500), 600);
          speakWpm = words(s) / (ms / 60000);
          heard.textContent = `Heard: "${s}"`;
          const { kept } = cleanUp(s);
          cleanBox.hidden = false;
          typeText(clean, kept, 200);
          show();
        },
        onError: (m) => (heard.textContent = m),
      });
    });

    ctx.commands = [{ words: ["say it", "speak"], label: "Listening", run: () => mic.click() }];
  },

  // Funnel model: drag the assumptions, watch the numbers. Clearly labelled as assumptions.
  funnel(body, data, ctx) {
    const list = el("div", "funnel");
    const total = el("p", "funnel-total");
    const rows = data.stages.map((stage, i) => {
      const row = el("div", "funnel-row");
      const head = el("div", "funnel-head");
      const count = el("span", "funnel-count");
      head.append(el("span", "funnel-label", stage.label), count);
      const range = el("input", "funnel-range");
      range.type = "range";
      range.min = stage.min;
      range.max = stage.max;
      range.step = stage.step;
      range.value = stage.value;
      range.setAttribute("aria-label", i === 0 ? stage.label : `${stage.label}, percent of the step before`);
      const setting = el("span", "funnel-setting");
      const track = el("div", "funnel-track");
      const fill = el("div", "funnel-fill");
      track.append(fill);
      const controls = el("div", "funnel-controls");
      controls.append(range, setting);
      row.append(head, track, controls);
      list.append(row);
      range.addEventListener("input", update);
      return { stage, range, count, setting, fill };
    });

    function update() {
      let n = Number(rows[0].range.value);
      const top = n;
      rows.forEach((r, i) => {
        if (i > 0) n = (n * Number(r.range.value)) / 100;
        r.count.textContent = Math.round(n).toLocaleString("en-IN");
        r.setting.textContent = i === 0 ? "students" : `${r.range.value}%`;
        r.fill.style.width = `${Math.max(2, (n / top) * 100)}%`;
      });
      total.textContent = `${Math.round(n).toLocaleString("en-IN")} ${data.result}`;
    }

    update();
    body.append(el("p", "soft small", data.note), list, total);
    ctx.complete();
  },

  // V.13 Ending: what a recruiter needs
  ending(body, data, ctx) {
    const line = el("p", "story");
    body.append(line, rowList(data.facts));
    typeText(line, data.line, 300);

    const links = el("div", "action-row");
    data.links.forEach((l) => {
      if (l.href.startsWith("TODO")) {
        links.append(el("span", "small-btn todo", `${l.label}: TODO`));
        return;
      }
      const a = el("a", "small-btn", l.label);
      a.href = l.href;
      if (l.href.startsWith("http")) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      links.append(a);
    });
    body.append(links, el("p", "soft small", data.credit));
    ctx.complete();
  },
};

// Tiny Hinglish clean-up for the demo: drop fillers and repeats, then tidy the sentence.
const FILLERS = ["um", "umm", "uh", "uhh", "hmm", "basically", "matlab", "actually"];
const FILLER_PAIRS = [["you", "know"], ["i", "mean"]];
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
    FILLER_PAIRS.forEach(([a, b]) => {
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
