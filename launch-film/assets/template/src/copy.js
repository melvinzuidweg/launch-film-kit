/*
 * Copy: every visible string in the film. Parts never contain a user-facing string.
 *
 * >>> PLACEHOLDERS. Everything below is example copy for a fictional task app called "Acme". <<<
 * Replace it for your product. Rules that kept the reference film honest:
 *   - Every on-screen claim comes from the facts file (SAFE rows only), with its source.
 *     Check claims against the product's CODE, not its marketing copy: features the marketing
 *     implies are not always there.
 *   - App UI strings are copied verbatim from the app's translation files, push copy from the
 *     code that sends the push. Never invent a screen or a notification the app does not have.
 *   - Demo content (people, companies, meeting lines) is fictional and shown with the "Example"
 *     label (COPY.exampleLabel, T.exampleLabel). Avoid names the real app uses as placeholders.
 *   - If a caption or line sets up a question, it must create exactly the ambiguity the product
 *     then resolves (no contradictions between what is "said" and what is "asked").
 *   - Few words per card. The film must work on mute.
 */
window.COPY = {
  exampleLabel: "Example",                       // PLACEHOLDER: in the product's language

  // bar 1: the hook. A finished poster at frame 0: a vague line + the question it raises.
  hook: {
    line: "“Someone will pick that up.”",   // PLACEHOLDER: the problem, in the user's words
    key: "Someone",                              // PLACEHOLDER: the word the marker sweeps (must occur in `line`)
    question: "But who? And by when?",           // PLACEHOLDER: the question your product answers ("" = one-line hook)
  },

  // overlay cards (src/parts/overlay-text.js). Keys match T.O in src/timeline.js.
  //   chapter:   a one-word headline + optional sub lines
  //   statement: lines at statement size; `em` lists the line indexes set in --brand-ink
  cards: {
    ch1: { kind: "chapter", word: "Assign.", sub: ["Every task gets a name and a date."] },   // PLACEHOLDER
    thesis: { kind: "statement", lines: ["No more “someone”.", "Sam has it, by Friday."], em: [1] }, // PLACEHOLDER
  },

  // end card (the poster: holds to the last frame)
  end: {
    name: "Acme",                                // PLACEHOLDER product name (wordmark if logo.js has none)
    slogan: "Every task has an owner.",          // PLACEHOLDER one-line promise
    offer: "Free for teams up to 5.",            // PLACEHOLDER offer (from the facts file)
    url: "acme.example",                         // PLACEHOLDER
    fine: "Available on iOS and Android.",       // PLACEHOLDER (or "" for none)
    // Optional store badges: official artwork only, unmodified, and only if you may use it.
    // Badges are not redistributed with this template. Example:
    //   badges: [{ src: "assets/badges/app-store.svg", w: 120, h: 40 }, { src: "assets/badges/google-play.svg", w: 135, h: 40 }],
    // (w/h: the artwork's own aspect; the end card sets the visible height)
    badges: [],
  },

  // app UI strings (PLACEHOLDER: verbatim from the app)
  app: {
    statusTime: "9:41",
    pushTime: "now",
    eyebrow: "Today",
    title: "Tasks",
    task: "Follow up with the client",
    noOwner: "No owner yet",
    assignLabel: "Assign to",
    people: ["Sam", "Alex", "Jo"],
    due: "Friday",
    others: [
      { title: "Book the venue", meta: "Alex · Monday" },
      { title: "Send the agenda", meta: "Jo · Today", done: true },
    ],
    back: "Tasks",
    doneTitle: "Assigned",
    doneLine: "Sam will follow up by Friday.",
  },

  // push copy (PLACEHOLDER: verbatim from the code that sends the push)
  push: {
    accepted: { title: "Sam accepted the task", body: "Follow up with the client · due Friday" },
  },

  // Film variants: a page sets window.VARIANT = "<name>" (index-<name>.html / portrait-<name>.html).
  // Keep variants to a different hook on the same timeline. `alt` belongs to the example act: when
  // you replace act-example.js, delete index-alt.html, portrait-alt.html and this entry, or rename
  // them for your own variant and point their <script> tags at your acts.
  variants: {
    alt: {
      hook: { line: "“Let’s circle back on that.”", key: "circle back", question: "Who does? And when?" }, // PLACEHOLDER
    },
  },
};
