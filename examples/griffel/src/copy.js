/*
 * Every visible string in the film. Dutch, je-vorm, no exclamation marks, Griffel in the
 * third person, "notulen" plural (docs/tone-of-voice.md in griffel-app).
 * Claims only from docs/facts.md (SAFE rows). App UI strings verbatim from
 * griffel-app/apps/mobile/src/i18n/translations/nl.ts and workers/meeting-pipeline/src/workflowPushCopy.ts.
 * Meeting content is FICTIONAL (docs/demo-meeting.md) and always shown with the VOORBEELD label.
 */
window.COPY = {
  voorbeeld: "Voorbeeldmeeting",

  // 0-2s hook: a vague line from the fictional meeting
  hook: { line: "…dan houden we de Q4-deadline aan.", key: "Q4-deadline", whisper: "En wanneer is dat?" },

  // fictional meeting captions (what is said at the table)
  captions: [
    { who: "Spreker 2", text: "Wie stuurt de offerte naar de klant?" },
    { who: "Spreker 1", text: "Die pakken we wel op." },
    { who: "Spreker 3", text: "…dan houden we de Q4-deadline aan.", key: "Q4-deadline" },
  ],

  // overlay chapter cards
  ch1: { word: "Opnemen.", sub: ["Leg je telefoon op tafel.", "Griffel vraagt daarna door."] },   // sub 2: F2, the promise in the first 5 s
  ch2a: { word: "Echte namen.", sub: ["Geen Spreker 1."] },                                   // F3, during the naming step
  ch2: { word: "Doorvragen.", sub: ["Iets onduidelijk?", "Griffel vraagt het eerst aan jou."] }, // F2
  climax: { a: "Griffel raadt niet.", b: "Griffel vraagt." },
  context: { a: "Voeg een agenda of offerte toe.", b: "Griffel gebruikt die voor namen en bedragen." },
  ch3: { word: "Notulen.", sub: ["Besluiten en actiepunten", "in de inbox van wie jij kiest."] },
  trust: { a: "Verstuurd is verwijderd.", b: "Binnen enkele seconden gewist." },
  outro: ["Opnemen.", "Doorvragen.", "Notulen."],
  end: {
    slogan: "De AI-notulist die doorvraagt.",
    offer: "Gratis: 3 meetings per maand.",
    url: "griffel.ai",
    fine: "Gemaakt in Nederland. Verwerkt in de EU.",
  },

  // app UI strings (verbatim)
  app: {
    statusTime: "9:41",
    recLive: "Opname loopt",
    recWriting: "Griffel schrijft mee.",
    recHold: "Houd ingedrukt om te stoppen",
    recStop: "Stop opname",
    recStopping: "Opslaan...",
    recMic: "Microfoon",
    recPause: "Pauzeren",
    steps: ["Uploaden", "Transcriberen", "Sprekers benoemen", "Vragen", "Notulen", "Verzonden"],
    yourAction: "Jouw actie nodig",
    speakersTitle: "Wie hoor je hier?",
    speakerShare: "Ongeveer 34% van het gesprek",
    playClip: "Beluister deze spreker",
    nameField: "Naam",
    confirm: "Bevestigen",
    questionsStep: (x, y) => `Stap ${x} van ${y}`,
    questionsLabel: "Vragen",
    writeOwn: "Of zelf invullen",
    skip: "Vraag overslaan",
    readyToSend: "Klaar om te versturen",
    whoGetsNotes: "Wie krijgt de notulen?",
    selfChip: "Jij — altijd",
    sendNotes: "Notulen versturen",
    sending: "Notulen onderweg",
    sent: "Verstuurd",
    context: "Context",
  },

  push: {
    speakers: { title: "Sprekers benoemen", body: "Je opname is verwerkt. Luister en benoem de sprekers, dan maakt Griffel je vragen op maat." },
    questions: { title: "Je notulenvragen staan klaar.", body: "Beantwoord een paar korte vragen om je notulen af te ronden." },
    sent: { title: "Je notulen zijn verstuurd.", body: "De notulen zijn per e-mail verzonden." },
  },

  // fictional questions
  q1: { text: "Er werd verwezen naar 'de Q4-deadline'. Welke datum is dat?", options: ["12 december", "19 december", "Er is nog geen datum"], pick: 0 },
  // fictional attendees are Lisa, Daan and Sanne. Not "Thomas": the real name-field placeholder
  // reads "Bijvoorbeeld: Thomas", which must never look like a name suggestion.
  q2: { text: "Wie stuurt de offerte naar de klant?", options: ["Lisa", "Daan", "Sanne"], pick: 0 },

  meeting: {
    subject: "Projectoverleg nieuwe website",
    names: ["Lisa", "Daan", "Sanne"],
    contextFile: "Offerte-website.pdf",
  },

  // notulen e-mail (structure from griffel-app/packages/emails/src/summary-email.tsx)
  email: {
    tag: "Notulen",
    heading: "Je meeting-notulen",
    intro: "Hieronder vind je wat besproken is, plus de acties en besluiten.", // summary-email.tsx, organiser copy
    besproken: ["Opzet van de nieuwe homepage", "Offerte en planning richting de klant"],
    acties: [
      { who: "Lisa", text: "stuurt de offerte naar de klant", when: "12 december" },
      { who: "Daan", text: "belt de hostingpartij", when: "vrijdag" },
      { who: "Sanne", text: "zet de planning in de gedeelde map", when: "" },
    ],
    besluiten: ["De homepage krijgt een nieuwe opzet.", "De Q4-deadline is 12 december."],
    privacy: "Privacy: Deze notulen bestaan alleen in deze e-mail. Griffel bewaart er geen kopie van.",
    footer: "Griffel · De AI-notulist die doorvraagt · griffel.ai",
    inboxFrom: "Griffel",
    inboxSubject: "Projectoverleg nieuwe website",   // the real subject is the meeting subject (buildSummaryEmailSubject)
    inboxPreheader: "Meeting-notulen, met jou gedeeld. Ze bestaan alleen in deze e-mail.", // attendee preheader; the row truncates it
  },

  wiped: ["Opname", "Transcriptie", "Vragen"],

  // film variants (window.VARIANT on a page; index-<name>.html / portrait-<name>.html).
  // "vraag": the question-first hook (act A). F2 lines only, verbatim; `em` is the part of `sub`
  // set in the green emphasis.
  variant: {
    vraag: { head: "Iets onduidelijk?", sub: "Griffel vraagt het eerst aan jou.", em: "Griffel vraagt" },
  },
};
