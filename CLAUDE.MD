# Project: "From a village in Bihar to Wispr Flow"

An interactive, game-like portfolio that tells my real life story and ends with a pitch for growing Wispr Flow in India. I am applying for the **internship** in the Wispr Flow x Emergent Hiring Challenge.

Read this file at the start of every session. Follow it over any default habit.

---

## 1. What the challenge needs from me (do not lose sight of this)

Source: the official challenge page (28 Oct to 4 Nov).

**Deadline: 4 November.** Shortlist is contacted 5 Nov, hire announced 20 Nov. Submit one day early.

**They judge:**
1. Creativity: how creatively I show who I am.
2. Use of voice: how I used voice to build, and what it added.
3. Extreme ownership: initiative, decisions, follow-through.
4. Work over credentials: how I think and what I made happen.
5. Logistics: ready to start in November, Bangalore-based or willing to travel.

**I must submit (form fields):**
- Name
- Wispr Flow account email (must be the same email I sign in to Flow with, they check my account was active during the challenge)
- Interested in: Internship
- Earliest start date
- Portfolio URL: built NEW for this challenge, publicly accessible. Old portfolios are rejected.
- Recording URL: 3 minutes max. What I built, why, and what value I saw in voice.
- LinkedIn profile
- My "oddly specific" $3,000 setup pick (what I would spend the grant on)
- Permission to feature my build publicly (yes or no)

**Optional but encouraged:** post it on LinkedIn or X and tag Wispr Flow and Emergent.

**Voice rule:** every prompt I give Claude must be dictated with Wispr Flow. Screen-record at least some building sessions as proof and for the video. Do not type long prompts.

**Tool rule:** the page says the portfolio should be built on Emergent using Wispr Flow, and the FAQ says I may use another vibe-coding tool. I am building in VS Code with Claude. Before submitting, check the FAQ again or email the team to confirm this is fine, and say clearly in the video which tools I used. If time allows, also recreate or deploy part of it on Emergent with my voice.

**Credits:** Emergent credits arrive at my registered email within 10 hours. Not required for this build.

---

## 2. What we are building

A **cinematic interactive story** (decided 30 Oct), not a kids game. Think NYT interactive feature or an Apple product page: scroll-driven scenes, big typography, subtle motion and sound. Every interaction must make the visitor *feel* something or *decide* something. No points, stars, badges, or "tap the object" collecting. **Voice is a core control**: voice moments in most chapters, with a button fallback everywhere. The last chapter is my pitch for Wispr Flow in India, told from the point of view of the exact user they want to reach.

**The core idea:** my life is a growth story. Again and again I found a channel most people did not know about (Homi Bhabha, Anthe, TopNeurons, Sitare), earned it, and moved on. Growth teams need that skill. The final pitch connects this to how voice would have changed my school life as a student who thought in Hindi and Bhojpuri, studied in Marathi, and wrote in English.

**Chapters (in order):**
1. Kolkata, 24 Aug 2006: born there, but from Bihar. Words appear as if being dictated, one by one.
2. Bihar village: rural life, father's taxi. Slow scroll-driven scene. Father's illness and death in about 3 months: one quiet screen, no interaction at all.
3. Mumbai: brother's job, a new language, Marathi and English struggle, 10th grade, Homi Bhabha exam. Interaction **"Read this"**: a Marathi paragraph, one question, 20-second timer; most visitors fail, then "This was me in class 9". Voice: visitor tries to say a Marathi phrase and sees the live transcript get it wrong.
4. Anthe (Aakash): 100% scholarship, 3 years of JEE coaching for classes 10 to 12. Interaction: **a real decision** between two trade-off cards (stay safe vs. bet on Jaipur). Visitor commits, then sees what I chose and why.
5. Jaipur: TopNeurons NGO exam, 100% scholarship, Allen plus CBSE 12th (2024). JEE not cleared (health, and maybe I was not ready yet). Interaction: **a startup-style post-mortem** (what happened, what I own, what I changed, what I did next).
6. Sitare Foundation, Lucknow: August 2024, 4-year scholarship, BTech CSE, now in 3rd year. Centrepiece: **"Ask me anything"**, a voice-first AI version of me answering only from my profile text.
7. The pitch: why voice, why India, why me. Interaction: visitor picks a student persona (Tier 2/3 town, Hindi-first) and sees my campaign for them, plus a live demo: speak Hinglish and watch it become clean text.

**Facts to confirm with me before writing final text** (do not invent details; ask me):
- Birth year is 2006 (confirmed).
- Sitare is in Lucknow, UP (confirmed).
- What my current chapter (3rd year) feels like: pressure, money, direction. Need my own words.
- Exact order and timing of Homi Bhabha, Anthe, the move from Aakash to TopNeurons and Allen.
- Which words and moments are really mine (a smell, a sound, a name). Placeholder lines in the prototype are guesses, replace them with my real details.
- How much of my father's illness I want shown. Default: quiet, short, respectful, no drama.

---

## 3. Design rules (copy the Wispr Flow look)

- **No emojis anywhere.** Use drawn SVG shapes and icons.
- **Palette:** cream `#FFFFEB`, deep green `#034F46`, lavender `#EBD5FF`, orange `#FFA946`, coral `#FF6B4E`, pink `#F9B8F0`, ink `#1A1A1A`.
- **Type:** Figtree (bold, geometric) for headings and UI, EB Garamond for story text.
- **Illustration:** minimal and typography-led. A few abstract drawn shapes and scene elements in SVG (a road, a window, a horizon). **No cartoon people or characters.** Must look premium, never like a kids site.
- **Feel:** cinematic, calm, warm. Big type, generous space, a lavender squiggle line as decoration. One memorable thing per screen, no clutter.
- Mobile first. Most people will open the link from a phone.
- Respect reduced motion. Visible keyboard focus.
- Never use localStorage-dependent logic that breaks if storage is blocked.

---

## 4. Technical plan (all free)

- **Stack:** plain HTML, CSS and JavaScript. No framework needed. Optional: Phaser if movement needs it later.
- **Structure:** keep story text in data, not in logic.
  ```
  /index.html
  /css/style.css
  /js/engine.js       (movement, hotspots, cards, voice)
  /js/chapters/ch1.js ... ch7.js   (scene SVG + spots + text)
  /js/story.js        (all text, so I can edit my words easily)
  /assets/            (audio, if any)
  ```
- **Starting point:** no prototype exists; build from scratch in this structure.
- **Voice:** browser Web Speech API for commands and read-aloud. Works best in Chrome and Edge. Every voice action must also have a button.
- **Gemini (free tier):** an "ask me anything" character in the Sitare lab, answering only from a profile text I write. Never put an API key in the page. Use a free Cloudflare Worker as a proxy, or ship a fallback of pre-written answers so the game never breaks if the limit runs out.
- **No database, no login.** Progress lives in memory during the visit.
- **Hosting:** GitHub Pages, Netlify, or Vercel (free), public link. Optionally mirror on Emergent.
- **Languages:** English first. Hindi or Hinglish toggle only if time allows (cut first).
- **Sound:** short free audio loops from freesound.org or Pixabay, with a mute button.

---

## 5. Build order (5 days, finish before polishing)

Priority: a finished, polished small game beats a big unfinished one. Cut mini-games before cutting story.

| Day | Date | Goal |
|---|---|---|
| 1 | 30 Oct | Set up repo, split prototype, confirm facts, write real text for ch 1 to 3, build Mumbai |
| 2 | 31 Oct | Chapters 4 and 5, first mini-games, scholarship stars |
| 3 | 1 Nov | Chapter 6 and the pitch level |
| 4 | 2 Nov | Gemini character, Hindi toggle, sound, mobile testing |
| 5 | 3 Nov | Deploy, record the 3-minute video, post on LinkedIn or X |
| Buffer | 4 Nov | Submit in the morning, not the last hour |

**Definition of done:** link opens on a phone, all 7 chapters playable start to finish, no emojis, voice and button controls both work, public URL tested in a private window.

---

## 6. The 3-minute video (outline)

1. 0:00 to 0:20: who I am in one line, plus the challenge brief.
2. 0:20 to 1:20: screen-share the game, walk through two chapters and one mini-game.
3. 1:20 to 2:20: how I built it with my voice (show Wispr Flow dictating into Claude), and what voice added: speed, my natural Hinglish thinking, telling stories out loud instead of typing.
4. 2:20 to 3:00: why it fits growth, the India pitch, and the $3,000 pick.

---

## 7. The $3,000 "oddly specific" answer

Pick something concrete and tied to the job. Options to choose from:
- A laptop and a good microphone to make regional-language and Hinglish demo videos for students in Tier 2 and 3 towns.
- A phone, gimbal, and light kit for street-style creator content with college influencers.
- A travel budget to visit 10 campuses and run voice-typing challenges.

Final choice: ______ (decide together on Day 4).

---

## 8. How Claude should work with me in this repo

- I speak my prompts with Wispr Flow, so expect casual and mixed Hindi-English phrasing. Ask one short question if something is unclear.
- Make small, working steps. Run or preview after each change. Keep the game playable at all times.
- Keep text in `story.js`. Never rewrite my life story in a dramatic voice. Keep it plain, honest, and specific.
- Never invent facts about my life. If a detail is missing, leave a clear TODO and ask me.
- Follow the design rules above. No emojis, ever.
- Keep it free: no paid services, no keys in client code.
- At the end of each session, update a short `PROGRESS.md` with what is done and what is next.