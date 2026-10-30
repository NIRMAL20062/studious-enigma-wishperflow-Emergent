// THE VOYAGE: all game text lives here. Edit words here only.
// Only facts from FACTS.md. Missing facts stay as "TODO", which shows as a coral dashed box.
//
// Island:
//   id, name, sub        name on the map and in the HUD
//   x, y                 position on the sea map (map is 1000 x 1000)
//   treasure             optional: what you win when every place on the island is cleared
//   places               the spots you tap on the island to go inside
// Place:
//   id, label, kind      kind picks the drawing: "harbour" | "house" | "taxi" | "lamp" | "school" | "tower" | "storm" | "college" | "fog"
//   x, y                 position on the island close-up (island view is 1000 x 1000)
//   mood                 "day" | "night" | "storm": colours of the inside view
//   lines                dialog. who: "Nirmal" or "Narrator". voice: optional clip in assets/voice/ (my own recording)
//   activity             optional: an interactive card after the dialog (see js/activities.js)

const GAME = {
  hero: { name: "Nirmal", level: 20 },

  islands: [
    {
      id: "kolkata",
      name: "Kolkata",
      sub: "2006",
      x: 180, y: 800,
      places: [
        {
          id: "harbour", label: "The harbour", kind: "harbour", x: 500, y: 550, mood: "day",
          lines: [
            { who: "Narrator", text: "24 August 2006. A boy is born in Kolkata." },
            { who: "Nirmal", text: "I was born here. But I am not from here." },
            { who: "Nirmal", text: "TODO: why I was born in Kolkata." },
          ],
        },
      ],
    },
    {
      id: "bihar",
      name: "Bihar",
      sub: "The village",
      x: 320, y: 540,
      places: [
        {
          id: "home", label: "Home", kind: "house", x: 280, y: 580, mood: "day",
          lines: [
            { who: "Narrator", text: "A few years later, the family moves to a small village in Bihar." },
            { who: "Nirmal", text: "Rural life began." },
            { who: "Nirmal", text: "TODO: one real detail of the village. A sound, a smell, something I did every day." },
          ],
        },
        {
          id: "taxi", label: "Father's taxi", kind: "taxi", x: 710, y: 610, mood: "day",
          lines: [
            { who: "Nirmal", text: "My father ran his own taxi." },
            { who: "Nirmal", text: "TODO: one memory of him." },
          ],
        },
        {
          id: "lamp", label: "That year", kind: "lamp", x: 520, y: 400, mood: "night",
          lines: [
            { who: "Narrator", text: "Then his father got cancer." },
            { who: "Narrator", text: "In three months, he was gone." },
            { who: "Nirmal", text: "TODO: what that year was like, in my words. Short." },
          ],
        },
      ],
    },
    {
      id: "mumbai",
      name: "Mumbai",
      sub: "Two new languages",
      x: 560, y: 780,
      treasure: { name: "ANTHE", detail: "100% scholarship, Aakash Institute" },
      places: [
        {
          id: "brother", label: "Brother's job", kind: "tower", x: 720, y: 420, mood: "day",
          lines: [
            { who: "Narrator", text: "His brother moves to Mumbai with help from their mother's sister. He finds a job." },
            { who: "Nirmal", text: "Slowly, things got better." },
          ],
        },
        {
          id: "school", label: "School", kind: "school", x: 280, y: 420, mood: "day",
          lines: [
            { who: "Nirmal", text: "I studied in Maharashtra. Marathi and English, at the same time." },
            { who: "Nirmal", text: "Your turn. Twenty seconds, one question. Like my first weeks in a Marathi classroom." },
          ],
          // V.8 Trial. TODO: have a Marathi speaker check the passage and translation.
          activity: {
            type: "readthis",
            kicker: "Trial",
            title: "Read this",
            seconds: 20,
            passage: "उद्या सकाळी नऊ वाजता शाळेत विज्ञान प्रदर्शन आहे. प्रत्येक विद्यार्थ्याने आपला प्रकल्प वर्गशिक्षकांकडे जमा करावा. उशिरा येणाऱ्यांना प्रवेश मिळणार नाही.",
            question: "When do you need to be at school?",
            choices: ["9 in the morning", "9 at night", "After lunch"],
            correct: 0,
            translation: "Tomorrow at 9 in the morning there is a science exhibition at school. Every student must hand their project to the class teacher. Latecomers will not be let in.",
            after: "TODO: this was me in class _. One real moment when Marathi beat me.",
          },
        },
        {
          id: "say", label: "Say it", kind: "speech", x: 280, y: 770, mood: "day",
          lines: [
            { who: "Nirmal", text: "The first Marathi sentence I needed was the one that said I didn't know Marathi." },
          ],
          // V.9 Voice moment
          activity: {
            type: "sayit",
            kicker: "Voice trial",
            title: "Say it out loud",
            phrase: "मला मराठी येत नाही.",
            roman: "Mala Marathi yet nahi.",
            meaning: "I don't know Marathi.",
            lang: "mr-IN",
            after: "TODO: how long it took me to stop saying this.",
          },
        },
        {
          id: "choice", label: "The choice", kind: "signpost", x: 720, y: 770, mood: "day",
          lines: [
            { who: "Narrator", text: "In 9th grade, he sits the Homi Bhabha exam." },
            { who: "Narrator", text: "Then ANTHE, by Aakash Institute. A 100% scholarship for three years of JEE coaching." },
            { who: "Narrator", text: "One year in, another exam comes up. A different city, a different coaching, and no guarantee." },
          ],
          // V.10 Decision
          activity: {
            type: "decision",
            kicker: "Your call, captain",
            title: "Stay, or go?",
            options: [
              { title: "Stay", points: ["100% scholarship at Aakash", "2 more years, guaranteed", "TODO: what staying meant to me"], say: ["stay", "first", "rukna", "ruko"] },
              { title: "Go", points: ["The TopNeurons exam, Jaipur", "Allen coaching + CBSE 12th", "TODO: what going would cost me"], say: ["go", "second", "jaipur", "jao"] },
            ],
            outcome: "TODO: what I chose, and the one real reason why.",
          },
        },
      ],
    },
    {
      id: "jaipur",
      name: "Jaipur",
      sub: "The bet",
      x: 620, y: 450,
      treasure: { name: "TopNeurons", detail: "100% scholarship, Allen + CBSE 12th" },
      places: [
        {
          id: "exam", label: "The new exam", kind: "school", x: 320, y: 520, mood: "day",
          lines: [
            { who: "Narrator", text: "TopNeurons, an NGO in Jaipur, runs the exam." },
            { who: "Narrator", text: "100% scholarship. Allen coaching, and CBSE 12th." },
          ],
        },
        {
          id: "storm", label: "JEE 2024", kind: "storm", x: 680, y: 470, mood: "storm",
          lines: [
            { who: "Narrator", text: "Then came the storm. JEE 2024." },
            { who: "Nirmal", text: "I did not clear it. Here is my log." },
          ],
          // V.11 The JEE post-mortem, as the captain's log
          activity: {
            type: "log",
            kicker: "Captain's log",
            title: "JEE 2024",
            status: "Not qualified",
            rows: [
              { label: "What happened", text: "TODO: in my words." },
              { label: "What I own", text: "TODO: health was part of it. What else was mine?" },
              { label: "What I changed", text: "TODO" },
              { label: "What I did next", text: "August 2024: a four-year 100% scholarship at Sitare, Lucknow." },
            ],
          },
        },
      ],
    },
    {
      id: "lucknow",
      name: "Lucknow",
      sub: "Sitare",
      x: 830, y: 640,
      treasure: { name: "Sitare", detail: "4-year 100% scholarship, BTech CSE" },
      places: [
        {
          id: "sitare", label: "Sitare", kind: "college", x: 320, y: 530, mood: "day",
          lines: [
            { who: "Narrator", text: "August 2024. Sitare Foundation, Lucknow. A four-year 100% scholarship for BTech in Computer Science." },
            { who: "Nirmal", text: "Now I am in my third year." },
            { who: "Nirmal", text: "TODO: what this chapter feels like. Two or three honest lines." },
          ],
        },
        {
          id: "ask", label: "Ask me", kind: "speech", x: 690, y: 560, mood: "night",
          lines: [
            { who: "Nirmal", text: "Anything you want to know? Ask me. Type it, or say it." },
          ],
          // V.12 Ask me anything. Answers only from here. keys: words that point to an answer.
          activity: {
            type: "ask",
            kicker: "Ask the captain",
            title: "Ask me anything",
            suggestions: ["Where are you from?", "Why did you leave Aakash?", "What happened at JEE?", "Why Wispr Flow?"],
            answers: [
              { keys: ["from", "born", "where", "kolkata", "bihar"], a: "Born in Kolkata on 24 August 2006. From Bihar. Since then: Bihar, Maharashtra, Rajasthan, and now Uttar Pradesh." },
              { keys: ["scholarship", "scholarships"], a: "Three 100% scholarships: ANTHE at Aakash, TopNeurons with Allen in Jaipur, and Sitare in Lucknow." },
              { keys: ["aakash", "leave", "left", "jaipur", "topneurons"], a: "TODO: why I left Aakash for Jaipur." },
              { keys: ["jee", "fail", "failed", "exam"], a: "TODO: what happened at JEE, in my words." },
              { keys: ["wispr", "flow", "hire", "internship"], a: "TODO: why Wispr Flow, why me." },
              { keys: ["language", "languages", "marathi", "hindi", "bhojpuri", "english"], a: "TODO: the languages I grew up with, and how I learned Marathi and English." },
              { keys: ["father", "dad", "papa"], a: "He ran his own taxi. He died of cancer within three months. TODO: anything more I want to share." },
              { keys: ["sitare", "college", "btech", "study", "studying"], a: "BTech in Computer Science at Sitare, Lucknow, on a four-year 100% scholarship. I am in my third year." },
            ],
            fallback: "I have not written an answer to that one yet. Try one of the questions above.",
          },
        },
      ],
    },
    {
      id: "bangalore",
      name: "Bangalore",
      sub: "Wispr Flow",
      x: 800, y: 220,
      final: true,
      places: [
        {
          id: "flow", label: "Wispr Flow", kind: "fog", x: 280, y: 420, mood: "day",
          lines: [
            { who: "Nirmal", text: "The fog clears. This is the island I am sailing to." },
            { who: "Nirmal", text: "TODO: why Wispr Flow, why me. My pitch, in my words." },
          ],
        },
        {
          id: "crew", label: "Recruit a crew", kind: "flag", x: 720, y: 420, mood: "day",
          lines: [
            { who: "Nirmal", text: "Every voyage needs a crew. These are the students I would bring to Wispr Flow." },
            { who: "Nirmal", text: "I have been all three." },
          ],
          // V.13 The pitch: three student personas
          activity: {
            type: "crew",
            kicker: "The pitch",
            title: "Recruit your crew",
            personas: [
              {
                name: "The Hindi-first student",
                say: ["hindi", "first"],
                rows: [
                  { label: "Who", text: "Grows up in a small town or village. Thinks in Hindi or Bhojpuri, studies in another language." },
                  { label: "Where I saw it", text: "My own village in Bihar, and my first years in Maharashtra." },
                  { label: "What they struggle with", text: "TODO" },
                  { label: "How I would reach them", text: "TODO" },
                ],
              },
              {
                name: "The coaching student",
                say: ["coaching", "second"],
                rows: [
                  { label: "Who", text: "Preparing for JEE or NEET in a coaching city, far from home." },
                  { label: "Where I saw it", text: "Aakash, and Allen in Jaipur." },
                  { label: "What they struggle with", text: "TODO" },
                  { label: "How I would reach them", text: "TODO" },
                ],
              },
              {
                name: "The scholarship student",
                say: ["scholarship", "third"],
                rows: [
                  { label: "Who", text: "Gets into college on merit and a scholarship, often the first to code or write in English every day." },
                  { label: "Where I saw it", text: "Sitare, Lucknow." },
                  { label: "What they struggle with", text: "TODO" },
                  { label: "How I would reach them", text: "TODO" },
                ],
              },
            ],
          },
        },
        {
          id: "demo", label: "Try Flow", kind: "mic", x: 280, y: 770, mood: "day",
          lines: [
            { who: "Nirmal", text: "This is how I think: in Hinglish, with fillers. Try it yourself." },
          ],
          // V.13 Live demo
          activity: {
            type: "demo",
            kicker: "Live demo",
            title: "Speak the way you think",
            example: "um so basically mujhe kal ka assignment like submit karna hai",
            note: "A tiny version, built for this page. Wispr Flow does this properly, in every app.",
          },
        },
        {
          id: "join", label: "Join the crew", kind: "ship", x: 720, y: 770, mood: "day",
          lines: [
            { who: "Nirmal", text: "That's my voyage so far. The next island is yours to decide." },
          ],
          // V.13 Ending
          activity: {
            type: "ending",
            kicker: "End of the voyage",
            title: "Ready to start in November",
            line: "TODO: one closing line, in my words.",
            facts: [
              { label: "Role", text: "Internship, Growth" },
              { label: "Earliest start", text: "TODO" },
              { label: "Bangalore", text: "TODO: based there, or ready to move" },
            ],
            links: [
              { label: "LinkedIn", href: "TODO" },
              { label: "Email", href: "TODO" },
            ],
            credit: "Built by voice with Wispr Flow.",
          },
        },
      ],
    },
  ],
};
