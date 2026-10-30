// THE VOYAGE: game engine. Screens: lobby > map > island > inside.
// Every voice command also has a tap, and every tap works without voice.

const $ = (sel, root = document) => root.querySelector(sel);
const NS = "http://www.w3.org/2000/svg";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion ? 0 : ms));

function svgEl(tag, attrs = {}, text) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (text !== undefined) el.textContent = text;
  return el;
}

const state = {
  screen: "lobby",
  island: null, // index into GAME.islands
  place: null, // index into the island's places
  cleared: new Set(), // "islandId:placeId"
  rewarded: new Set(), // island ids
  busy: false, // true while a transition runs
};

const islands = GAME.islands;
const screens = {
  lobby: $("#lobby"),
  map: $("#map"),
  island: $("#island"),
  inside: $("#inside"),
};

// ---------- Progress rules ----------
const isCleared = (i) => islands[i].places.every((p) => state.cleared.has(`${islands[i].id}:${p.id}`));
const isUnlocked = (i) => {
  if (islands[i].final) return islands.every((isl, j) => isl.final || isCleared(j));
  return i === 0 || isCleared(i - 1);
};
const nextIsland = () => islands.findIndex((_, i) => isUnlocked(i) && !isCleared(i));
const treasureTotal = islands.filter((i) => i.treasure).length;

// ---------- Art in the static page ----------
document.querySelectorAll('[data-art="hero"]').forEach((el) => (el.innerHTML = ART.heroSvg()));
document.querySelectorAll('[data-art="portrait"]').forEach((el) => (el.innerHTML = ART.portrait()));
document.querySelectorAll('[data-art="chest"]').forEach((el) => (el.innerHTML = ART.chest()));
$(".island-count").textContent = islands.length;

// ---------- HUD ----------
function renderHud() {
  const name = $(".hud-name");
  name.textContent = GAME.hero.name;
  name.append(Object.assign(document.createElement("span"), { textContent: `Lv ${GAME.hero.level}` }));

  const where = {
    lobby: "",
    map: "The sea",
    island: state.island !== null ? islands[state.island].name : "",
    inside: state.place !== null ? islands[state.island].places[state.place].label : "",
  };
  $(".hud-where").textContent = where[state.screen];
  const found = islands.filter((i) => i.treasure && state.rewarded.has(i.id)).length;
  $(".hud-loot-count").textContent = `${found}/${treasureTotal}`;
}

let toastTimer = null;
function toast(text) {
  const el = $(".toast");
  el.textContent = text;
  el.classList.add("is-shown");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-shown"), 2400);
}

// ---------- Screen switching and camera ----------
async function switchScreen(to) {
  const from = screens[state.screen];
  const next = screens[to];
  next.hidden = false;
  next.classList.add("is-entering");
  void next.offsetWidth;
  next.classList.remove("is-entering");
  from.classList.add("is-leaving");
  state.screen = to;
  document.body.dataset.screen = to;
  renderHud();
  await wait(600);
  from.hidden = true;
  from.classList.remove("is-leaving");
}

// Zoom an SVG so the point (x, y) in its 1000 x 1000 viewBox fills the centre of the screen
function zoomTo(svg, x, y, k, instant = false) {
  const box = svg.getBoundingClientRect();
  const s = Math.min(box.width, box.height) / 1000;
  const px = (box.width - 1000 * s) / 2 + x * s;
  const py = (box.height - 1000 * s) / 2 + y * s;
  if (instant) svg.style.transition = "none";
  svg.style.transformOrigin = `${px}px ${py}px`;
  svg.style.transform = `translate(${box.width / 2 - px}px, ${box.height / 2 - py}px) scale(${k})`;
  if (instant) {
    void svg.getBoundingClientRect();
    svg.style.transition = "";
  }
}

function zoomReset(svg, instant = false) {
  if (instant) svg.style.transition = "none";
  svg.style.transform = "";
  if (instant) {
    void svg.getBoundingClientRect();
    svg.style.transition = "";
  }
}

// ---------- Map ----------
const mapSvg = $(".map-svg");

function renderMap() {
  mapSvg.innerHTML = ART.waves(46, 1000, 1000, 7);

  // Dotted sailing route through the islands, in order
  let d = `M${islands[0].x} ${islands[0].y}`;
  for (let i = 1; i < islands.length; i++) {
    const a = islands[i - 1];
    const b = islands[i];
    d += ` Q${(a.x + b.x) / 2 + (i % 2 ? 70 : -70)} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;
  }
  mapSvg.append(svgEl("path", { class: "route", d }));

  const next = nextIsland();
  islands.forEach((isl, i) => {
    const locked = !isUnlocked(i);
    const g = svgEl("g", {
      class: `map-island${locked ? " is-locked" : ""}${isCleared(i) ? " is-cleared" : ""}${i === next ? " is-next" : ""}`,
      tabindex: "0",
      role: "button",
      "aria-label": `${isl.name}${locked ? ", locked" : isCleared(i) ? ", cleared" : ""}`,
    });
    const art = svgEl("g", { class: "island-art" });
    art.innerHTML = ART.island(isl.x, isl.y, 92, i * 13 + 5);
    g.append(art);

    if (i === next) g.append(svgEl("ellipse", { class: "next-ring", cx: isl.x, cy: isl.y, rx: 120, ry: 90 }));

    const w = Math.max(140, isl.name.length * 22 + 48);
    g.append(svgEl("rect", { class: "flag-pill", x: isl.x - w / 2, y: isl.y - 136, width: w, height: 54, rx: 27 }));
    g.append(svgEl("text", { class: "flag-text", x: isl.x, y: isl.y - 109, style: "font-size:34px" }, isl.name));
    g.append(svgEl("text", { class: "flag-sub", x: isl.x, y: isl.y + 108 }, locked ? "Locked" : isl.sub));

    if (isl.final && locked) {
      const fog = svgEl("g");
      fog.innerHTML = ART.fog(isl.x, isl.y);
      g.append(fog);
    }

    g.addEventListener("click", () => openIsland(i));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openIsland(i);
      }
    });
    mapSvg.append(g);
  });

  const ship = svgEl("g", { class: "ship" });
  ship.innerHTML = ART.ship();
  mapSvg.append(ship);
  placeShip(state.island ?? 0, true);
}

function placeShip(i, instant) {
  const ship = $(".ship", mapSvg);
  if (!ship) return;
  const isl = islands[i];
  if (instant) ship.style.transition = "none";
  ship.style.transform = `translate(${isl.x + 96}px, ${isl.y + 40}px)`;
  if (instant) {
    void ship.getBoundingClientRect();
    ship.style.transition = "";
  }
}

async function goMap() {
  if (state.busy) return;
  state.busy = true;
  renderMap();
  zoomReset(mapSvg, true);
  await switchScreen("map");
  state.busy = false;
  const next = nextIsland();
  if (next >= 0) toast(`Tap ${islands[next].name}, or say it`);
}

async function openIsland(i) {
  if (state.busy) return;
  if (!isUnlocked(i)) {
    const before = islands[i].final ? "every other island" : islands[i - 1].name;
    toast(`Clear ${before} first`);
    return;
  }
  state.busy = true;
  state.island = i;
  placeShip(i);
  await wait(700);
  zoomTo(mapSvg, islands[i].x, islands[i].y, 3.4);
  await wait(650);
  renderIsland();
  zoomReset(islandSvg, true);
  await switchScreen("island");
  state.busy = false;
}

// ---------- Island ----------
const islandSvg = $(".island-svg");

function renderIsland() {
  const isl = islands[state.island];
  islandSvg.innerHTML = ART.waves(30, 1000, 1000, state.island + 3) + ART.island(500, 580, 420, state.island * 13 + 5, 0.9);

  const w = isl.name.length * 26 + 80;
  islandSvg.append(svgEl("rect", { class: "flag-pill", x: 500 - w / 2, y: 30, width: w, height: 64, rx: 32 }));
  islandSvg.append(svgEl("text", { class: "flag-text", x: 500, y: 62, style: "font-size:38px" }, isl.name));
  const placeScale = isl.places.length > 3 ? 1.1 : 1.3;

  isl.places.forEach((p, j) => {
    const done = state.cleared.has(`${isl.id}:${p.id}`);
    const g = svgEl("g", {
      class: `place${done ? " is-done" : ""}`,
      transform: `translate(${p.x} ${p.y}) scale(${placeScale})`,
      tabindex: "0",
      role: "button",
      "aria-label": `${p.label}${done ? ", visited" : ""}`,
    });
    // Invisible tap area over the whole place, so gaps in the drawing still count
    g.append(svgEl("rect", { x: -100, y: -120, width: 200, height: 235, fill: "transparent" }));
    const art = svgEl("g", { class: "place-art" });
    art.innerHTML = ART.place(p.kind);
    g.append(art);

    const w2 = Math.max(120, p.label.length * 17 + 64);
    g.append(svgEl("rect", { class: "place-pill", x: -w2 / 2, y: 66, width: w2, height: 46, rx: 23 }));
    g.append(svgEl("circle", { class: "place-marker", cx: -w2 / 2 + 24, cy: 89, r: 9 }));
    g.append(svgEl("text", { class: "flag-text", x: 14, y: 89, style: "font-size:26px" }, p.label));

    g.addEventListener("click", () => openPlace(j));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPlace(j);
      }
    });
    islandSvg.append(g);
  });
}

async function openPlace(j) {
  if (state.busy) return;
  state.busy = true;
  state.place = j;
  const p = islands[state.island].places[j];
  zoomTo(islandSvg, p.x, p.y, 3);
  await wait(650);
  renderInside(p);
  await switchScreen("inside");
  state.busy = false;
  startDialog(p.lines, () => (p.activity ? openActivity(p.activity) : finishPlace()));
}

// ---------- Inside ----------
function renderInside(p) {
  const inside = screens.inside;
  inside.dataset.mood = p.mood || "day";
  let extra = "";
  if (p.mood === "night") {
    for (let i = 0; i < 14; i++) {
      const x = (i * 97) % 300 - 150;
      const y = (i * 61) % 220 - 150;
      extra += `<circle class="sparkle" style="--d:${(i % 5) * 0.4}s" cx="${x}" cy="${y}" r="${2 + (i % 3)}"/>`;
    }
  }
  if (p.mood === "day") extra = `<circle cx="0" cy="-10" r="120" fill="var(--pink)" opacity=".5"/>`;
  $(".inside-art").innerHTML = `<svg viewBox="-150 -150 300 300">${extra}<g class="place-art">${ART.place(p.kind)}</g></svg>`;
  inside.querySelectorAll(".rain").forEach((r) => r.remove());
  if (p.mood === "storm") inside.prepend(Object.assign(document.createElement("div"), { className: "rain" }));
}

async function finishPlace() {
  const isl = islands[state.island];
  const p = isl.places[state.place];
  state.cleared.add(`${isl.id}:${p.id}`);
  state.place = null;
  renderIsland();
  zoomTo(islandSvg, p.x, p.y, 3, true);
  await switchScreen("island");
  zoomReset(islandSvg);

  if (isCleared(state.island) && !state.rewarded.has(isl.id)) {
    state.rewarded.add(isl.id);
    await wait(900);
    showReward(isl);
  }
}

function showReward(isl) {
  const box = $(".reward");
  $(".reward-kicker").textContent = isl.treasure ? "Treasure found" : "Island cleared";
  $(".reward-title").textContent = isl.treasure ? isl.treasure.name : isl.name;
  const next = nextIsland();
  $(".reward-detail").textContent = isl.treasure
    ? isl.treasure.detail
    : next >= 0 ? `Next island: ${islands[next].name}` : "The voyage continues.";
  $(".reward-chest").hidden = !isl.treasure;
  box.hidden = false;
  if (isl.treasure) {
    renderHud();
    const loot = $(".hud-loot");
    loot.classList.remove("is-bumped");
    void loot.offsetWidth;
    loot.classList.add("is-bumped");
  }
  $(".reward .big-btn").focus();
}

$('[data-action="reward-ok"]').addEventListener("click", async () => {
  $(".reward").hidden = true;
  await backToMap();
});

async function backToMap() {
  state.busy = true;
  renderMap();
  zoomTo(mapSvg, islands[state.island].x, islands[state.island].y, 3.4, true);
  await switchScreen("map");
  zoomReset(mapSvg);
  await wait(900);
  state.busy = false;
  const next = nextIsland();
  if (next >= 0 && next !== state.island) {
    toast(`${islands[next].name} is open`);
  }
}

// ---------- Activity card (trial, choice, log, demo...) ----------
const activityBox = $(".activity");
const activityDone = $(".activity-done");
let activity = null; // { ctx }

function openActivity(data) {
  const body = $(".activity-body");
  body.replaceChildren();
  $(".activity-kicker").textContent = data.kicker || "";
  $(".activity-title").textContent = data.title || "";
  activityDone.disabled = true;
  const ctx = {
    commands: [],
    onClose: null,
    complete: () => (activityDone.disabled = false),
  };
  activity = { ctx };
  activityBox.hidden = false;
  $(".activity-card").scrollTop = 0;
  ACTIVITIES[data.type](body, data, ctx);
}

function closeActivity() {
  if (!activity) return;
  if (activity.ctx.onClose) activity.ctx.onClose();
  activity = null;
  activityBox.hidden = true;
}

activityDone.addEventListener("click", () => {
  closeActivity();
  finishPlace();
});

// ---------- Dialog ----------
const dialog = $(".dialog");
const dialogText = $(".dialog-text");
let talk = null; // { lines, index, timers, typing, onDone }

function startDialog(lines, onDone) {
  talk = { lines, index: 0, timers: [], typing: false, onDone };
  dialog.hidden = false;
  showLine();
}

function showLine() {
  const line = talk.lines[talk.index];
  dialog.dataset.who = line.who;
  dialog.classList.remove("is-ready");
  $(".dialog-name").textContent = line.who;
  $(".dialog-portrait").innerHTML = line.who === "Narrator" ? ART.compass() : ART.portrait();

  dialogText.textContent = "";
  dialogText.classList.toggle("todo", line.text.startsWith("TODO"));
  dialogText.setAttribute("aria-label", line.text);
  const words = line.text.split(/\s+/);
  const spans = words.map((w, i) => {
    const s = Object.assign(document.createElement("span"), { className: "word", textContent: w });
    s.setAttribute("aria-hidden", "true");
    dialogText.append(s);
    if (i < words.length - 1) dialogText.append(" ");
    return s;
  });

  playNarration(line.voice);
  talk.typing = true;
  let t = 120;
  spans.forEach((s) => {
    const w = s.textContent;
    t += reducedMotion ? 0 : /[.!?]$/.test(w) ? 380 : /[,;:]$/.test(w) ? 220 : 70 + Math.random() * 70;
    talk.timers.push(setTimeout(() => s.classList.add("on"), t));
  });
  talk.timers.push(setTimeout(lineReady, t + 150));
}

function lineReady() {
  if (!talk) return;
  talk.typing = false;
  dialog.classList.add("is-ready");
}

function advanceDialog() {
  if (!talk) return;
  if (talk.typing) {
    talk.timers.forEach(clearTimeout);
    talk.timers = [];
    dialogText.querySelectorAll(".word").forEach((s) => s.classList.add("on"));
    lineReady();
    return;
  }
  talk.index++;
  if (talk.index < talk.lines.length) {
    showLine();
    return;
  }
  const done = talk.onDone;
  closeDialog();
  done();
}

function closeDialog() {
  if (!talk) return;
  talk.timers.forEach(clearTimeout);
  talk = null;
  stopNarration();
  dialog.hidden = true;
}

dialog.addEventListener("click", advanceDialog);

// ---------- Back ----------
async function goBack() {
  if (state.busy || !$(".reward").hidden) return;
  if (state.screen === "inside") {
    closeDialog();
    closeActivity();
    const p = islands[state.island].places[state.place];
    state.place = null;
    zoomTo(islandSvg, p.x, p.y, 3, true);
    await switchScreen("island");
    zoomReset(islandSvg);
  } else if (state.screen === "island") {
    await backToMap();
  } else if (state.screen === "map") {
    state.busy = true;
    await switchScreen("lobby");
    state.busy = false;
  }
}

$('[data-action="back"]').addEventListener("click", goBack);
$('[data-action="sail"]').addEventListener("click", goMap);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") goBack();
  if (talk && (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") && !e.target.closest("button")) {
    e.preventDefault();
    advanceDialog();
  }
});

// ---------- Sound: generated sea and a soft chord. Off until the player taps. ----------
const soundBtn = $(".sound-toggle");
let audio = null;
let soundOn = false;

function startAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Sea: filtered noise that swells like waves
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const seaFilter = ctx.createBiquadFilter();
  seaFilter.type = "lowpass";
  seaFilter.frequency.value = 500;
  const seaGain = ctx.createGain();
  seaGain.gain.value = 0.35;
  const swell = ctx.createOscillator();
  swell.frequency.value = 0.12;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = 0.25;
  swell.connect(swellDepth).connect(seaGain.gain);
  noise.connect(seaFilter).connect(seaGain).connect(master);
  noise.start();
  swell.start();

  // A warm open chord underneath
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 800;
  padFilter.connect(master);
  [110, 164.81, 220, 277.18].forEach((f) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = 0.18;
    osc.connect(g).connect(padFilter);
    osc.start();
  });

  return { ctx, master };
}

function setSound(on) {
  soundOn = on;
  if (on && !audio) audio = startAudio();
  if (audio) {
    if (on) audio.ctx.resume();
    audio.master.gain.setTargetAtTime(on ? 0.06 : 0, audio.ctx.currentTime, 0.5);
  }
  if (!on) stopNarration();
  soundBtn.setAttribute("aria-pressed", String(on));
  soundBtn.setAttribute("aria-label", on ? "Sound on. Turn sound off" : "Sound off. Turn sound on");
}

soundBtn.addEventListener("click", () => setSound(!soundOn));

// Narration: my own recorded clips in assets/voice/. Missing files are simply skipped.
let narration = null;
function playNarration(file) {
  stopNarration();
  if (!file || !soundOn) return;
  narration = new Audio(`assets/voice/${file}`);
  narration.play().catch(() => {});
}

function stopNarration() {
  if (narration) narration.pause();
  narration = null;
}

// ---------- Voice commands ----------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const micBtn = $(".mic-btn");
const transcript = $(".dock-transcript");
let transcriptTimer = null;

function showTranscript(text, holdMs) {
  clearTimeout(transcriptTimer);
  transcript.textContent = text;
  transcript.classList.add("is-shown");
  if (holdMs) transcriptTimer = setTimeout(() => transcript.classList.remove("is-shown"), holdMs);
}

// Commands depend on the screen. Hindi words work too, because that is how I talk.
function currentCommands() {
  const list = [
    { words: ["back", "go back", "peeche", "piche", "return"], label: "Back", run: goBack },
    { words: ["sound on", "music on"], label: "Sound on", run: () => setSound(true) },
    { words: ["sound off", "mute", "music off"], label: "Sound off", run: () => setSound(false) },
  ];
  if (!$(".reward").hidden) {
    list.push({ words: ["okay", "ok", "continue", "next", "aage", "sea"], label: "Back to the sea", run: () => $('[data-action="reward-ok"]').click() });
    return list;
  }
  if (activity) {
    list.push(...activity.ctx.commands);
    if (!activityDone.disabled) list.push({ words: ["continue", "done", "next", "aage", "okay"], label: "Continue", run: () => activityDone.click() });
    return list;
  }
  if (talk) {
    list.push({ words: ["next", "aage", "continue", "okay", "ok", "go on", "haan"], label: "Next", run: advanceDialog });
    return list;
  }
  if (state.screen === "lobby") {
    list.push({ words: ["set sail", "sail", "start", "play", "chalo", "let's go"], label: "Setting sail", run: goMap });
  }
  if (state.screen === "map") {
    islands.forEach((isl, i) => list.push({ words: [isl.name.toLowerCase()], label: `Sailing to ${isl.name}`, run: () => openIsland(i) }));
    list.push({ words: ["next island", "sail", "aage", "next"], label: "Next island", run: () => nextIsland() >= 0 && openIsland(nextIsland()) });
  }
  if (state.screen === "island") {
    const isl = islands[state.island];
    isl.places.forEach((p, j) => {
      const words = [p.label.toLowerCase(), p.id, p.kind, ...p.label.toLowerCase().split(/\W+/).filter((w) => w.length > 3)];
      list.push({ words, label: `Going to ${p.label}`, run: () => openPlace(j) });
    });
    const firstOpen = () => isl.places.findIndex((p) => !state.cleared.has(`${isl.id}:${p.id}`));
    list.push({ words: ["inside", "enter", "andar", "go in", "explore"], label: "Going inside", run: () => openPlace(Math.max(0, firstOpen())) });
  }
  return list;
}

function matchCommand(said) {
  const text = said.toLowerCase();
  const options = currentCommands()
    .flatMap((c) => c.words.map((w) => ({ w, c })))
    .sort((a, b) => b.w.length - a.w.length);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hit = options.find(({ w }) => new RegExp(`\\b${esc(w)}\\b`).test(text));
  return hit ? hit.c : null;
}

function setupVoice() {
  if (!SpeechRecognition) return; // no mic in this browser: every action still has a button
  micBtn.hidden = false;
  const rec = new SpeechRecognition();
  rec.lang = "en-IN";
  rec.interimResults = true;
  rec.continuous = false;

  rec.onstart = () => {
    micBtn.setAttribute("aria-pressed", "true");
    showTranscript("Listening...");
  };
  rec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const said = result[0].transcript.trim();
    if (!result.isFinal) return showTranscript(said);
    const cmd = matchCommand(said);
    if (cmd) {
      showTranscript(`"${said}" · ${cmd.label}`, 2000);
      cmd.run();
    } else {
      showTranscript(`"${said}" · try "back" or a place name`, 3000);
    }
  };
  rec.onerror = (event) => {
    const msg = {
      "not-allowed": "Microphone is blocked. Taps work too.",
      "service-not-allowed": "Microphone is blocked. Taps work too.",
      "no-speech": "Didn't catch that. Tap and try again.",
      network: "Voice needs an internet connection.",
    }[event.error];
    showTranscript(msg || "Voice stopped. Tap to try again.", 3000);
  };
  rec.onend = () => {
    micBtn.setAttribute("aria-pressed", "false");
    if (transcript.textContent === "Listening...") transcript.classList.remove("is-shown");
  };

  micBtn.addEventListener("click", () => {
    if (micBtn.getAttribute("aria-pressed") === "true") return rec.stop();
    try {
      rec.start();
    } catch {
      // still closing the last session; the next tap works
    }
  });
}

// ---------- Start ----------
renderHud();
setupVoice();
