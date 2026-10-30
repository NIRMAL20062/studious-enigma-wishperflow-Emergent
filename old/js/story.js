// All story text lives here (CLAUDE.md section 4).
// Edit words here only. The engine builds the page from this list, top to bottom.
//
// Every scene:
//   theme:   "cream" | "green" | "lavender" | "ink"
//   eyebrow: small label above the title (also shown in the progress label)
//   title:   big heading. Use \n for a line break.
//   lines:   story lines. dictate: true = appears word by word, like live transcription.
//   type:    optional interactive part, see js/scenes.js
//
// Any text starting with "TODO" shows in a coral dashed box, so it can never ship by accident.
// Only facts from FACTS.md. Never invent details.

const STORY = {
  scenes: [
    // Chapter 1: Kolkata
    {
      theme: "cream",
      eyebrow: "Kolkata, 2006",
      title: "Born in Kolkata.\nFrom Bihar.",
      lines: [
        { text: "24 August 2006. I was born in Kolkata, but I am not from Kolkata.", dictate: true },
        { text: "TODO: why I was born there.", dictate: true },
      ],
    },

    // Chapter 2: Bihar village
    {
      theme: "green",
      eyebrow: "Bihar",
      title: "A small village\nin Bihar.",
      lines: [
        { text: "A few years later we moved to a small village in Bihar. Rural life began.", dictate: true },
        { text: "My father ran his own taxi.", dictate: true },
        { text: "TODO: one real detail of the village. A sound, a smell, something I did every day." },
      ],
    },

    // 4.3 Quiet screen. No interaction. Controls fade back, words come slower.
    {
      type: "quiet",
      theme: "ink",
      eyebrow: "Bihar",
      lines: [
        { text: "Then my father got cancer.", dictate: true },
        { text: "In three months, he was gone.", dictate: true },
        { text: "TODO: one memory of him, in my words.", dictate: true },
      ],
    },

    // Chapter 3: Mumbai
    {
      theme: "lavender",
      eyebrow: "Mumbai",
      title: "A new city.\nTwo new languages.",
      lines: [
        { text: "My brother moved to Mumbai with help from my mother's sister. He found a job, and slowly, things got better.", dictate: true },
        { text: "I studied in Maharashtra, learning Marathi and English at the same time.", dictate: true },
      ],
    },

    // 4.5 Read this: a Marathi passage, one question, a timer.
    // TODO: have a Marathi speaker check the passage and translation.
    {
      type: "readthis",
      theme: "cream",
      eyebrow: "Mumbai",
      title: "Read this.",
      lines: [{ text: "You get 20 seconds and one question. Like my first weeks in a Marathi classroom." }],
      seconds: 20,
      passage: "उद्या सकाळी नऊ वाजता शाळेत विज्ञान प्रदर्शन आहे. प्रत्येक विद्यार्थ्याने आपला प्रकल्प वर्गशिक्षकांकडे जमा करावा. उशिरा येणाऱ्यांना प्रवेश मिळणार नाही.",
      question: "When do you need to be at school?",
      choices: ["9 in the morning", "9 at night", "After lunch"],
      correct: 0,
      translation: "Tomorrow at 9 in the morning there is a science exhibition at school. Every student must hand their project to the class teacher. Latecomers will not be let in.",
      after: "TODO: this was me in class _. One real moment when Marathi beat me.",
    },

    // 4.6 Voice moment: try saying a Marathi phrase.
    {
      type: "sayit",
      theme: "green",
      eyebrow: "Mumbai",
      title: "Now say it.",
      phrase: "मला मराठी येत नाही.",
      roman: "Mala Marathi yet nahi.",
      meaning: "I don't know Marathi.",
      lang: "mr-IN",
      after: "TODO: how long it took me to stop saying this.",
    },

    // Chapter 4: Aakash
    {
      theme: "lavender",
      eyebrow: "Aakash",
      title: "First exam.\nFirst door.",
      lines: [
        { text: "In 9th grade I sat the Homi Bhabha exam.", dictate: true },
        { text: "Then ANTHE, by Aakash Institute. A 100% scholarship for three years of JEE coaching.", dictate: true },
      ],
    },

    // 4.7 Decision. The visitor commits to one card, then sees what I actually did.
    {
      type: "decision",
      theme: "cream",
      eyebrow: "Aakash",
      title: "Stay, or go?",
      lines: [
        { text: "One year in, another exam came up. A different city, a different coaching, and no guarantee." },
      ],
      options: [
        {
          title: "Stay",
          points: ["100% scholarship at Aakash", "2 more years, guaranteed", "TODO: what staying meant to me"],
          say: ["stay", "first", "rukna", "ruko"],
        },
        {
          title: "Go",
          points: ["The TopNeurons exam, Jaipur", "Allen coaching + CBSE 12th", "TODO: what going would cost me"],
          say: ["go", "second", "jaipur", "jao"],
        },
      ],
      outcome: "TODO: what I chose, and the one real reason why.",
    },

    // Chapter 5: Jaipur
    {
      theme: "green",
      eyebrow: "Jaipur",
      title: "I went.",
      lines: [
        { text: "TopNeurons, an NGO, ran an exam in Jaipur. I got a 100% scholarship: Allen coaching, and CBSE 12th.", dictate: true },
        { text: "Then came JEE.", dictate: true },
      ],
    },

    // 4.9 Post-mortem. Written the way startups review a failure.
    {
      type: "postmortem",
      theme: "cream",
      eyebrow: "Jaipur",
      title: "Post-mortem.",
      doc: {
        name: "JEE 2024",
        status: "Not qualified",
        rows: [
          { label: "What happened", text: "TODO: in my words." },
          { label: "What I own", text: "TODO: health was part of it. What else was mine?" },
          { label: "What I changed", text: "TODO" },
          { label: "What I did next", text: "August 2024: a four-year 100% scholarship at Sitare, Lucknow." },
        ],
      },
    },

    // Chapter 6: Sitare
    {
      theme: "lavender",
      eyebrow: "Lucknow",
      title: "Sitare.",
      lines: [
        { text: "August 2024. Sitare Foundation, Lucknow. A four-year 100% scholarship for BTech in Computer Science.", dictate: true },
        { text: "Now I am in my third year.", dictate: true },
        { text: "TODO: what this chapter feels like. Two or three honest lines.", dictate: true },
      ],
    },

    // 4.11 Ask me anything. Pre-written answers first; Gemini can be added later (4.12).
    // keys: words that point a question to this answer.
    {
      type: "ask",
      theme: "ink",
      eyebrow: "Lucknow",
      title: "Ask me anything.",
      lines: [{ text: "Type or say a question. Every answer is one I wrote myself." }],
      suggestions: ["Where are you from?", "Why did you leave Aakash?", "What happened at JEE?", "Why Wispr Flow?"],
      answers: [
        { keys: ["from", "born", "where", "kolkata", "bihar"], a: "Born in Kolkata on 24 August 2006. From Bihar. Since then: Bihar, Maharashtra, Rajasthan, and now Uttar Pradesh." },
        { keys: ["scholarship", "scholarships"], a: "Three 100% scholarships: ANTHE at Aakash, TopNeurons with Allen in Jaipur, and Sitare in Lucknow." },
        { keys: ["aakash", "leave", "left", "jaipur", "topneurons"], a: "TODO: why I left Aakash for Jaipur." },
        { keys: ["jee", "fail", "failed", "exam"], a: "TODO: what happened at JEE, in my words." },
        { keys: ["wispr", "flow", "why you", "hire", "internship"], a: "TODO: why Wispr Flow, why me." },
        { keys: ["language", "languages", "marathi", "hindi", "bhojpuri", "english"], a: "TODO: the languages I grew up with, and how I learned Marathi and English." },
        { keys: ["father", "dad", "papa"], a: "He ran his own taxi. He died of cancer within three months. TODO: anything more I want to share." },
        { keys: ["sitare", "college", "btech", "study", "studying"], a: "BTech in Computer Science at Sitare, Lucknow, on a four-year 100% scholarship. I am in my third year." },
      ],
      fallback: "I have not written an answer to that one yet. Try one of the questions above.",
    },

    // 4.13 The pitch: pick a student persona, see how I would reach them.
    {
      type: "personas",
      theme: "cream",
      eyebrow: "The pitch",
      title: "Growing Wispr Flow\nin India.",
      lines: [{ text: "Pick a student. I have been all three." }],
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

    // 4.14 Live demo: speak messy Hinglish, see clean text.
    {
      type: "demo",
      theme: "green",
      eyebrow: "Try it",
      title: "Speak the way\nyou think.",
      lines: [{ text: "Say something in Hinglish, the way you would tell a friend. Fillers and all." }],
      example: "um so basically mujhe kal ka assignment like submit karna hai",
      note: "A tiny version, built for this page. Wispr Flow does this properly, in every app.",
    },

    // 4.15 Ending
    {
      type: "ending",
      theme: "ink",
      eyebrow: "Next",
      title: "Ready to start\nin November.",
      lines: [{ text: "TODO: one closing line, in my words.", dictate: true }],
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
  ],
};
