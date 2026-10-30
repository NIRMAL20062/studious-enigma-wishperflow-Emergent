# Progress

## Done (30 Oct)

- Setup: folders, fonts, palette, local preview (`python3 -m http.server 8000 --bind 0.0.0.0`)
- Engine: full-screen snapping scenes, fade reveals, dictation effect, progress line, generated ambient sound
- Voice dock: mic with live transcript, up/down arrows, English + Hindi commands
- All 15 scenes of the story built from confirmed facts only (`js/story.js`); every missing fact is a dashed TODO box
- Scene types in `js/scenes.js`: quiet, readthis (Marathi timer), sayit (Marathi voice), decision, postmortem, ask (Ask me anything), personas (pitch), demo (Hinglish clean-up), ending
- Click-through test in headless Chrome, phone and desktop: all 15 scenes, no errors
- `FACTS.md`: what is confirmed and what is still missing

## Next

- Me: dictate the missing facts in `FACTS.md`, replace every TODO on the page
- Marathi speaker checks the passage in the Read this scene
- 4.12 Gemini for Ask me anything (optional)
- Polish (group 5), then deploy (6.1)

## Browser notes (task 2.4)

Checked in headless Chrome (desktop 1280px and phone 390px): no JavaScript errors, all scenes render. Still to do by hand on real devices.

| Browser | Scenes, arrows, sound | Voice (mic) |
|---|---|---|
| Chrome desktop | works | works. Needs internet: Chrome sends audio to Google for recognition |
| Edge desktop | works | works |
| Chrome Android | works | works on the deployed https link only |
| Safari Mac / iPhone | works | partial: uses Apple's recognition, may need Siri enabled; less reliable |
| Firefox | works | no speech support: mic is hidden, arrows still work, no error |

- The microphone only works on `https://` or `localhost`. On the local Wi-Fi link (`http://<laptop-ip>:8000`) the phone shows "Microphone is blocked". Expected; test voice on the phone after deploy (6.1).
- Sound stays off until the visitor taps Sound (browsers block autoplay).
- Missing favicon causes one harmless 404; add one during polish.
