# Tasks

One task at a time. Each task is small, ends with something I can open and check, and gets ticked only after I have checked it.

Status: `[ ]` not started, `[~]` in progress, `[x]` done and checked by me.

Rule: Claude does only the task I name. After each task: preview it, I check it, then we tick it and pick the next one.

---

## 0. Setup (30 Oct)

- [x] 0.1 Rename `CLAUDE.MD` to `CLAUDE.md` so it loads automatically
- [ ] 0.2 Email the Wispr Flow team to confirm that building in VS Code with Claude (not Emergent) is fine
- [ ] 0.3 Start screen-recording my building sessions (proof of voice use + video footage)
- [x] 0.4 Create the empty folder structure (`index.html`, `css/`, `js/`, `js/chapters/`, `assets/`)
- [x] 0.5 Add fonts (Figtree, EB Garamond) and the colour palette as CSS variables
- [x] 0.6 Run a local preview server and open the page

## 1. Base engine (30 to 31 Oct)

- [x] 1.1 Full-screen sections that snap or scroll one scene at a time
- [x] 1.2 Scroll-triggered fade and reveal for text and shapes (with reduced-motion fallback)
- [x] 1.3 "Dictation" text effect: words appear one by one, like being transcribed
- [x] 1.4 `story.js`: all story text lives here, nothing hard-coded in scenes
- [x] 1.5 Progress line showing which chapter you are in (thin, minimal, not a game bar)
- [x] 1.6 Mute button + one ambient sound test
- [x] 1.7 Mobile check: open on my phone, fix anything broken

## 2. Voice system (31 Oct)

- [x] 2.1 Mic button: tap, speak, see the live transcript on screen
- [x] 2.2 Fallback: if the browser has no speech support, show buttons instead, with no error
- [x] 2.3 Simple voice commands ("next", "back") working alongside scroll
- [~] 2.4 Test in Chrome (desktop + phone) and note what fails in Safari or Firefox

## 3. Facts I must give (before writing each chapter)

Tracked in detail in `FACTS.md`. Each missing fact is a dashed coral TODO box on the page.

- [ ] 3.1 Kolkata: why I was born there
- [ ] 3.2 Village name or district + one real sensory detail
- [ ] 3.3 My father: one memory, the taxi, how much to show
- [ ] 3.4 My age when we moved to the village, and when he passed
- [ ] 3.5 Exact order and years: Homi Bhabha, Anthe, Aakash, TopNeurons, Allen
- [ ] 3.6 Languages I grew up with (Bhojpuri? Hindi?) and a real Marathi struggle moment
- [ ] 3.7 Why I chose to leave Aakash for Jaipur (the real reason)
- [ ] 3.8 JEE post-mortem in my words: what happened, what I own, what I changed
- [ ] 3.9 My current chapter (3rd year): pressure, money, direction, in 2 to 3 honest lines

## 4. Chapters (one task each, built only after its facts are in)

- [~] 4.1 Ch 1 Kolkata: the dictated opening
- [~] 4.2 Ch 2 Bihar village: scroll scene
- [~] 4.3 Ch 2 the quiet screen for my father
- [~] 4.4 Ch 3 Mumbai: story scene
- [~] 4.5 Ch 3 "Read this" Marathi timer interaction
- [~] 4.6 Ch 3 voice moment: try saying a Marathi phrase
- [~] 4.7 Ch 4 Aakash: the decision cards (stay safe or bet on Jaipur)
- [~] 4.8 Ch 5 Jaipur: story scene
- [~] 4.9 Ch 5 JEE post-mortem layout
- [~] 4.10 Ch 6 Sitare: story scene
- [~] 4.11 Ch 6 "Ask me anything" with pre-written answers first (works offline)
- [ ] 4.12 Ch 6 connect Gemini through a free Cloudflare Worker (optional, key never in the page)
- [~] 4.13 Ch 7 pitch: persona picker + campaign for each persona
- [~] 4.14 Ch 7 live Hinglish speak-to-text demo
- [~] 4.15 Ending screen: contact, LinkedIn, "start in November"

## V. The Voyage (game version, from 30 Oct evening)

The scrolling site moved to `old/`. Its interactions get folded into islands.

- [~] V.1 Lobby: hero, title, mission, Set sail button
- [~] V.2 HUD: avatar, level, location, treasure counter, sound
- [~] V.3 Sea map: islands unlock in order, ship, fogged final island
- [~] V.4 Zoom camera: map > island > place, and back
- [~] V.5 Anime dialog box: portrait, name tag, dictated text, tap or say "next"
- [~] V.6 Treasure and island-cleared popups
- [~] V.7 Voice commands per screen (English + Hindi)
- [~] V.8 Mumbai: Marathi "Read this" trial inside the school
- [~] V.9 Mumbai: say-it Marathi voice moment
- [~] V.10 Aakash: stay-or-go decision before sailing to Jaipur
- [~] V.11 Jaipur storm: JEE post-mortem as the captain's log
- [~] V.12 Lucknow: Ask me anything
- [~] V.13 Bangalore: pitch as "recruit your crew" (3 personas) + Hinglish demo + ending
- [ ] V.14 My narration clips (record on phone, put in assets/voice/, add file names in game-data.js)
- [ ] V.15 Sound effects: sail, treasure, page turn

## G. Growth focus (31 Oct): the story as evidence, the final island as Growth HQ

- [x] G.1 "Skip to the growth pitch" for busy judges
- [~] G.2 Growth lesson with each treasure (my words: TODO)
- [~] G.3 Growth HQ: voice vs typing race, users, 30-day playbook, funnel model, Experiment #1, ending
- [ ] G.4 Me: write the 3 playbook experiments (hypothesis, channel, cost, metric, target)
- [ ] G.5 Me: run Experiment #1 before 3 Nov and put the real numbers in
- [ ] G.6 Me: replace the funnel's example numbers with my own estimates

## 5. Polish (2 Nov)

- [ ] 5.1 Read every line of text out loud; remove anything I did not say or would not say
- [ ] 5.2 Check: no emojis, no cartoon characters, nothing that looks like a kids site
- [ ] 5.3 Keyboard focus visible, works without a mouse
- [ ] 5.4 Full run on phone, start to end
- [ ] 5.5 Hindi or Hinglish toggle (only if everything else is done)

## 6. Ship (3 Nov)

- [ ] 6.1 Deploy to GitHub Pages, Netlify or Vercel
- [ ] 6.2 Test the public link in a private window and on my phone
- [ ] 6.3 Decide the $3,000 setup pick
- [ ] 6.4 Record the 3-minute video (outline in CLAUDE.md section 6)
- [ ] 6.5 LinkedIn or X post tagging Wispr Flow and Emergent

## 7. Submit (4 Nov morning)

- [ ] 7.1 Fill the challenge form (same email as my Wispr Flow account)
- [ ] 7.2 Double-check every link opens publicly

---

## Done log

Write one line per finished task: date, task number, what changed.
