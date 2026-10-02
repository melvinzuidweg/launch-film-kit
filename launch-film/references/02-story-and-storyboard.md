# 02 · Story and storyboard

This stage turns the brief ([01-brief-research-truth.md](01-brief-research-truth.md)) into a storyboard that builders can work from without asking questions. In the Griffel case the storyboard was a build spec: every time was a key in `timeline.js`, every string a key in `copy.js`, every claim a facts ID, every rebuilt screen a source file in the product repo. Five builders worked from it in parallel, and the critics checked against it.

Most of the rules below exist because a critic caught the opposite in the case. Where that happened, the example is given.

## Contents

1. [Message spine](#1-message-spine)
2. [Hooks](#2-hooks)
3. [Chapters and the climax](#3-chapters-and-the-climax)
4. [One continuous take: the carried object](#4-one-continuous-take-the-carried-object)
5. [Captions that create exactly the right ambiguity](#5-captions-that-create-exactly-the-right-ambiguity)
6. [Fictional demo content and the example label](#6-fictional-demo-content-and-the-example-label)
7. [Mute-first copy](#7-mute-first-copy)
8. [Feed-size readability](#8-feed-size-readability)
9. [Timing on the music's bar grid](#9-timing-on-the-musics-bar-grid)
10. [The storyboard as build spec](#10-the-storyboard-as-build-spec)
11. [Variants and cut-downs](#11-variants-and-cut-downs)
12. [The end card is the poster](#12-the-end-card-is-the-poster)
13. [Storyboard review checklist](#13-storyboard-review-checklist)

---

## 1. Message spine

Three parts, in this order:

1. **The reason before the feature.** Show the moment that goes wrong today, in the viewer's own world, before showing any product. A viewer who recognises the problem keeps watching; a viewer shown a feature list scrolls.
2. **One core USP.** Exactly one thing the film is about, chosen by the competitor research (01 §5), not by the feature list. Everything else is setting or support.
3. **A payoff that makes the core visible.** The core is usually an action (the product asks a question); the payoff is the result you can point at (the action item with a name and a date, arriving in someone else's inbox).

In the Griffel film the spine was one chain the viewer can follow on mute:

```
a vague line at the table ("…then we'll keep the Q4 deadline")
  → the product asks ("Which date is that?") and you tap "12 December"
  → the e-mail row: "Lisa sends the quote to the client · 12 December"
  → that row lands in the inboxes of the people you chose
```

The support beat (real speaker names: "Speaker 1" becomes "Lisa") earns the name in the payoff row, and the trust beat ("Sent is deleted.") closes the story. Privacy and "no bot" never became claims, because the closest competitor says the same.

Write the spine at the top of the storyboard with its facts IDs. Every beat should be traceable to one of its links; a beat that is not is a candidate for cutting.

## 2. Hooks

The first two seconds decide whether anyone sees the rest. Three patterns worked; two were rejected.

### Patterns that worked

**A problem line from the product's own world.** Not a statistic and not a competitor: a sentence that someone really says, which the product later fixes. The Griffel hook was a line from the fictional meeting, "…dan houden we de Q4-deadline aan." ("…then we'll keep the Q4 deadline"), with the viewer's own question underneath in green: "En wanneer is dat?" ("And when is that?"). It needs no source, it names no one, and it sets up the exact question the product asks at the climax.

**Question-first: the strongest moment first.** The variant "vraag" opened on the product's signature screen: the question card with "Iets onduidelijk?" ("Something unclear?"), a tap on the answer at 0.8 s, and "Griffel vraagt het eerst aan jou." ("Griffel asks you first."). Its critic scored hook clarity 8/10 and scroll-stop power 6/10; the original's hook ended at 6/10 with the final critic. Use this when the core feature can be understood from one screen and one tap.

**The product mid-action.** In the original, the recording phone already peeks into frame 0. The viewer sees the product working before any explanation.

### Two rules for every hook

- **Frame 0 is a finished poster.** Many players show frame 0 as the thumbnail, and a fast scroll sees it as a still. In the case, frame 0 started as a half-grey sentence with nothing moving for a second; the round-4 fix made it a finished composition: the full line in ink, the question in green as a second headline, the dark phone peeking in at the bottom, the example label in its corner.
- **Motion from frame 1.** A finished poster that sits still reads as a frozen video. The fix was a calm push (2.5 % per second plus a slow upward drift), a phone creeping up at 60 px/s, and the key word growing 7 % with its highlighter sweep so the first real event lands before 1.0 s. Measured as the mean frame-to-frame difference, the first 1.8 s went from about 0.2 to about 0.6. Make slow motion sub-pixel smooth: text that moves in whole-pixel steps reads as jitter.

### Patterns to avoid

- **A statistic hook** ("30 % of meetings…") unless the number has a source you can cite. Griffel had none, so none was used.
- **Contrast with competitors** ("Other apps give you Speaker 1"). It needs naming or invites the comparison, and it was not even true against some of them.
- The research ranked muted hooks roughly as: an oversized UI element with typing, a problem or benefit question set as type, a light-sweep product reveal, a real hand opening the app, and last a talking head. The two Griffel hooks are the first two kinds.

## 3. Chapters and the climax

### Three chapters, named on screen

A three-part rhythm gives a muted viewer a map. The Griffel chapters were the store subtitle, "Opnemen. Doorvragen. Notulen." (Record. Clarify. Notes.), each shown as a chapter word when its act starts, and stacked on three beats at the end. The reference for the rhythm was a well-known three-part UI motion film (Things 3: design, feel, power).

A fourth card was added in round 2: "Echte namen." (Real names.) for the naming step. Without it, "Doorvragen." arrived during the naming screen and was spent before the actual questions. Each chapter word should land on the beat it names.

### Proportions of the Griffel hero (film time, 48 s)

| Part | Film time | Share | What it does |
|---|---|---|---|
| Hook | 0-3.4 | 7 % | the vague line, the question, words become the waveform |
| Record | 3.4-10 | 14 % | setting: phone on the table, captions of the meeting |
| Real names | 10-16.3 | 13 % | support beat |
| Clarify + climax | 16.3-26 | 20 % | the core: question, tap on the drop, thesis |
| Context + send | 26-28 | 4 % | a two-second extra |
| Notes (payoff) | 28-35 | 15 % | the e-mail, the action row, the inboxes |
| Trust | 35-38 | 6 % | "Sent is deleted." |
| Outro, logo, end card | 38-48 | 21 % | three words, logo build, poster |

The critics' most persistent note was that the "aha" (the tap on the answer) only arrives at 22 s of a 48 s film; the final hook and pacing scores stayed at 6 and 6.5 out of 10. Restructuring was refused late in the build because the drop was fixed on the music grid and every later time depended on it. Decide where the core moment sits *before* building, and consider putting it around the 35-40 % mark, or let a variant hook carry it (§11).

For a teaser of 15 s or less, use the proportions in SKILL.md ("Short teasers and no-questions requests"): hook 0-2 s, the core moment at about 40 %, and an end card held complete for at least 3.5 s.

### The climax: one event at a time

Around the drop, the case started with four events within 1.2 s: the tap, the caption swap, the second question and the thesis line. Critics could not read any of them. The fix spaced them so that each owns the frame:

| Film t | Event |
|---|---|
| 22.0 | the tap on "12 december" (the music drop), a +4 % camera punch, the only accent in the film |
| 22.0-22.66 | the answer flies into the meeting caption |
| 22.66-23.35 | the resolved caption, alone in the text area and large: "…dan houden we 12 december aan." |
| 22.3-23.6 | the second question, answered by a tap on "Lisa" |
| 24.0 | the thesis: "Griffel raadt niet. Griffel vraagt." (Griffel doesn't guess. Griffel asks.) |

The thesis originally had about 1.1 s of full readability; after the retime about 1.8 s.

## 4. One continuous take: the carried object

### The grammar

One object stays on screen for the whole film and every scene change happens *through* it. In Griffel the object was the phone; the camera never left it. Scene changes were morphs in which the thing in front becomes the next scene:

| Morph | From → to |
|---|---|
| Hook → record | the words of the vague line collapse into bars that fly into the phone's waveform |
| Record → naming | the 36 waveform bars fold into the processing-step dots |
| Climax | the tapped answer flies out of the option into the meeting caption |
| Send → notes | the e-mail unfolds out of the phone screen |
| Payoff → inboxes | the e-mail card collapses into three inbox rows |
| Trust | three chips ("Opname", "Transcriptie", "Vragen") dissolve next to the phone |
| Outro → logo | the phone's corners become the logo's brackets, the waveform bars become the five bars of the mark |

Why it works: the viewer never has to re-orient, and the film can be read as one action. It also forces each transition to mean something; a morph that does not connect two ideas is decoration.

### Rules that came out of the critic rounds

- **A pure no-cut take gets monotonous over 45-50 s.** The research recommended at most 2-3 matched cuts, at chapter breaks only, and never a hard cut to unrelated content. The Griffel film ended up using none: chapter cards and the light → dark → light acts gave the breathing room instead.
- **Screen changes inside the phone follow the platform's own grammar.** Cross-dissolves between app screens (round 2 counted seven) and one-frame hard cuts read as cheap. In-phone changes became clean covers and then iOS-style horizontal pushes of 0.35 s.
- **Direction carries meaning.** A push from the right is forward navigation on iOS. In the variant, the recording screen pushed in from the right after the answer tap, which read as "answering starts a recording", the reverse of the real flow. The fix was a dissolve, which has no direction.
- **Time jumps are visual, not clocks.** Real processing takes minutes. Show the jump with a light change or a notification, and never with a counter that would make a time claim.
- **The camera hands off between acts.** When every act returned to a rest framing at its boundary, the camera went out and back in at every hand-off ("yo-yo"). Shared hand-off framings (the outgoing act ends on one, the incoming act starts from it) fixed it. Write them into the storyboard's geometry contract.
- **The light change is a lighting change, not an iris.** A hard black circle closing on the phone was the biggest frame difference in the film and read as dated. It became a wide vignette darkening from the edges over about a second, and the way back became an even crossfade with no white bloom.

## 5. Captions that create exactly the right ambiguity

If the product resolves ambiguity, the film has to create that ambiguity first, on screen, in words a muted viewer can read. In Griffel, what is said at the table appears as captions in the scene (the app has no transcript screen, so it could not be an app screen). Each caption was written to set up one specific question the product asks later:

| Caption (fictional) | The doubt it creates | The question that resolves it |
|---|---|---|
| Speaker 2: "Wie stuurt de offerte naar de klant?" (Who sends the quote to the client?) | sets the topic | |
| Speaker 1: "Die pakken we wel op." (We'll pick that up.) | who is "we"? | "Wie stuurt de offerte naar de klant?" → Lisa |
| Speaker 3: "…dan houden we de Q4-deadline aan." | which date is "the Q4 deadline"? | "Welke datum is dat?" → 12 december |

### The Lisa bug

The first version had Speaker 1 saying "Die stuur ik wel." ("I'll send it."). After the naming step turned "Speaker 1" into "Lisa", the viewer already knew Lisa would send the quote, and then the product asked who sends it. The question answered nothing, and the film made the product look slow. A round-1 builder flagged it ("the flip answers Q2 before Griffel asks it"), and the line became the ambiguous "Die pakken we wel op."

Check every caption against every question:

- Does each question have exactly one caption that creates its doubt?
- Does any caption, name flip or screen answer a question before the product asks it?
- Does the payoff contain every answer (the name *and* the date)?
- When the answer returns into the caption ("…dan houden we 12 december aan."), is the sentence still grammatical? A critic suggestion to swap both "we" and the deadline into the hook line produced ungrammatical Dutch and was skipped.

## 6. Fictional demo content and the example label

Never show real meeting content, real people, real companies or real e-mail addresses. Script a fictional scene and keep it in its own file (`demo-meeting.md`): subject, attendees, talk shares, the lines heard, the questions with options and answers, the resulting e-mail.

- **Reuse existing fictional fixtures** from the product repo where they exist. Griffel reused the fixture meeting "Projectoverleg nieuwe website" from its e-mail preview script.
- **First names only, checked against the real UI.** The naming field's real placeholder reads "Bijvoorbeeld: Thomas" (for example: Thomas). With an attendee called Thomas, the placeholder looked like the app suggesting a name, a feature the code does not have. Thomas became Daan.
- **No e-mail addresses on screen.** Recipient chips show first names. Check any fictional company name against the company registry; generic names collide with real ones.
- **Dates age.** The research recommended weekdays ("vrijdag") so nothing looks stale; the film used "12 december" because the question needed a date. That is fine for a social film and a problem in an App Store preview, which bans dated references.
- **Label it.** A small "VOORBEELD" (example) label sits on screen from frame 0 until the last legible fictional content has left (film 38.6, when the meeting subject dissolves). Reserve its corner in every layout. In the case: 30 px bottom-left in 16:9, 28 px top-left in 4:5, tracking 0.14em, #4B5563 on light (7.56:1) and #9C9C9C on dark. During the light/dark transitions its colour is chosen from the stage luminance right under it, so every frame keeps at least 3:1. An early version was too small and left too early; both were critic notes.

## 7. Mute-first copy

Feeds autoplay muted, so the type carries the story. No voice-over in the hero; music and sound effects add energy but never information.

### Rules

- **One short sentence per moment, at most about 5 words or 30 characters per line.** One idea per card.
- **Reading time.** Plan each card's fully-readable hold as `characters / 12 + 0.5 s`, never under 1 s (from subtitle norms of about 10-12 characters per second). If the hold does not fit the bar budget, cut words, not hold time. In a 10 s teaser the formula usually cannot all be met; SKILL.md ("Short teasers") gives the order in which to trade.
- **Never two cards in the text box at once.** Every card is gone before the next one rises.
- **Never two word-by-word builds at once.** In the case, the in-app question built word by word while an overlay line also built; the overlay moved to after the in-app build.
- **Exits leave as one block.** Per-word exits left dangling fragments ("…vraagt" alone on screen). Exits became a 0.25 s block move on the house curve with at most 4 px blur, gone by out + 0.3 s.
- **Keep the text column alive.** Gaps between cards stayed at 1.4 s or less, except where the frame belonged to the payoff.
- **Legibility glyphs.** In Inter, a capital I and a lowercase l look the same: "Iets" read as "lets". The film-only fix was Inter's serifed capital I (`cv08`) on overlay text. Never change the app UI; it stays verbatim.
- **Long compound words** (Dutch "actiepunten") set the minimum width: size headlines so the longest word fits one line in the narrowest format, and do not hyphenate headlines.
- **Check on mute,** on a phone, at feed size. A muted contact sheet of the whole film is the cheapest test.

### Audit: where the case met the formula and where it did not

| Card | Chars | Formula hold | Readable in the film | Verdict |
|---|---|---|---|---|
| "Opnemen." | 8 | 1.2 s | about 6 s | fine |
| "Echte namen." / "Geen Spreker 1." | 27 | 2.8 s | about 4 s | fine |
| "Griffel raadt niet." / "Griffel vraagt." | 34 | 3.3 s | about 1.8 s (was 1.1) | short; critics flagged pacing |
| "Besluiten en actiepunten" / "in de inbox van wie jij kiest." | 54 | 5.0 s | about 2 s | short, but the payoff row carried the meaning |
| "Voeg een agenda of offerte toe." / "Griffel gebruikt die voor namen en bedragen." | 75 | 6.8 s | about 0.8-1.5 s | failed: 13 words next to five taps |

The last row is the clearest lesson. The two-second "context" beat broke the five-word rule and shared its window with a file upload, a scroll, three recipient taps and the send tap. A critic recommended inserting one bar for it; that was not done before delivery.

## 8. Feed-size readability

A 4:5 video in a phone feed is about 360 px wide. Text that reads on a 1080 px monitor can be 5 px tall there. Make this a storyboard rule with numbers, not something critics discover.

### The arithmetic

```
feed px = frame px × (feed width / frame width)
          4:5  (1080 wide) at 360 px: × 0.333
          16:9 (1920 wide) at 360 px: × 0.1875

for UI inside the phone:
frame px = UI logical px × phone scale × camera zoom
```

Example from the case: recipient chips with 14 px app text, at a 4:5 camera zoom of about 1.32, are about 18 px in the frame and about 6 px at feed width. The verifying critic's verdict: "you can see there are three green pills, but you can't read the names".

### Minimums (derived from what passed and failed in the case, not a platform rule)

| Text role | At 360 px feed | 4:5 frame (1080 wide) | 16:9 frame, if it must survive 360 px |
|---|---|---|---|
| Chapter words, thesis, payoff line | 16 px or more | 48 px or more | 85 px or more |
| Supporting lines, captions | 11-12 px | 33-36 px | 60-64 px |
| UI text the story depends on (the question, the answer, the payoff row) | 10 px or more | 30 px or more | 53 px or more |
| Labels (example label) | about 9 px | 28 px | 48 px |
| Below about 6 px | reads as a shape only | | |

Anything the story depends on must clear its row. UI text that is only texture (secondary rows, chips) may be smaller, as long as the meaning is carried elsewhere. In the case, the payoff row was lifted out of the e-mail as a large "hero" line because the real row was about 5 px at feed width.

**Decide per format which width it must survive.** In the case, 16:9 was treated as the desktop and YouTube cut and 4:5 as the feed cut, so several 16:9 elements (fine print, inbox rows) stayed unreadable on a phone. That was a conscious trade-off; if the 16:9 will run in mobile feeds, size it for 360 px too.

**How to check:** render stills of key moments at feed scale (the case used the still tool's `--scale 0.333` for 4:5 and `--scale 0.1875` for 16:9) and look at single frames, not sheets.

## 9. Timing on the music's bar grid

### Build on bars from day one

Write every structural time as a bar or beat of the music: chapter starts on bar downbeats, the drop on the core moment, the outro words on beats, the logo lock on the track's final hit. One bar lasts `240 / BPM` seconds (2.0 s at 120 BPM, 2.18 s at 110 BPM).

```js
const BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4;
const bar = (n) => (n - 1) * BAR;   // start of bar n (1-based)
// Griffel: DROP = 22.0 = bar(12); logo lock 42.0 = bar(22); outro words 38.0 / 38.5 / 39.0 on beats
```

Why whole bars: music edits (cutting the intro, jumping into the outro so the final hit lands on the logo) are clean only when the two points are a whole number of bars apart. Half-bar jumps stumble audibly.

### The drop is the core moment

The music drop landed exactly on the tap that answers the product's question. Before it, the music ran under a low-pass filter (about 700 Hz, "music from the next room"), which opened on the tap. The drop is also visible: a +4 % camera punch, the only accent in the film. A muted viewer still gets the moment.

### Choose the track before you polish

The Griffel timeline was written on a 120 BPM grid for a first-choice track that was never used. The final tracks were 110 BPM. A uniform time scale rescued it: output time = film time × `SCALE`, with `SCALE = 120 / 110`, so every film beat lands on a music beat. That also made the film about 9 % slower, which the founder had asked for anyway. The 48 s film became 52.36 s, with the drop at 24.0 s.

The first attempt used `SCALE = 1.1`. A critic measured the tracks at about 110 BPM and found the logo lock 0.18 s (a third of a beat) late; 120/110 fixed it. The lesson: pick the track (tempo and structure) at the start, write on its grid, and only use a scale when you must. Some licences mean you buy late; you can still choose early from previews.

## 10. The storyboard as build spec

The storyboard is a spec, not a mood board. Builders and critics should never have to guess a time, a string or a pixel.

### Sections, in order

1. **Header:** hero length, formats and their pages, viewer and goal, the message spine with facts IDs, the timing grid and the drop.
2. **Time scale:** film time vs output time, if a scale is used.
3. **Non-negotiables**, each with its reason: everything is a pure function of time (see [03-engine.md](03-engine.md)); one house easing curve, varying durations instead of curves; truth rules (strings verbatim from the product, no feature that does not exist, no time claims); fictional content only; brand rules (font, radius, which green may be text); ownership (one builder per file); readability.
4. **Geometry contract:** the phone's logical screen size, the world origin, the rest camera per format, the hand-off framings, shared anchors (in the case, the waveform anchor that three acts had to hit to the pixel), the overlay text box and the captions box.
5. **Overlay cards table:** every card with its in and out times, text and notes.
6. **Tools:** how to make stills, phone-size checks and renders.
7. **One table per act**, owned by one builder.

### Table formats

Overlay cards:

```markdown
| Card | In | Out (gone +0.3) | Text | Notes |
|---|---|---|---|---|
| ch2 | 16.6 | 21.95 | "Doorvragen." | Comes in with the questions push. Hard exit so it is gone before the climax rises in the same box. |
| climax | 24.0 / 24.25 | 25.85 | "Griffel raadt niet." / "Griffel vraagt." | F2. One event at a time around the drop. |
```

Per act (the time column names the `T` key, the "What" column names the source screen and the facts ID):

```markdown
## Act C: Clarify + drop (16.2-28.0) · act-c.js · T.C

| t | What | Notes |
|---|---|---|
| 17.0-24.25 | **Question wizard**, faithful to <component file, lines>. Header "Stap 1 van 2 · Vragen"; question 24 px bold; options ≥ 56 px, radius 10; selected = mint background + check icon. | F2, F11 |
| 22.0 | **DROP.** Touch dot taps "12 december" at exactly 22.0; option selected at 22.05; +4 % camera punch settling over 0.6 s. | `T.DROP` |
```

A fuller column set, which the research proposed and which is worth using for new projects: `t (T key) · duration · chapter · on-screen text (facts ID) · carried object · lead motion · secondary motion · transition in/out · SFX cue · 16:9 notes · 4:5 notes`.

### Working rules

- **All times live in one file** (`timeline.js`); the storyboard quotes the keys. Hard-coded times drift.
- **All strings live in one file** (`copy.js`), copied verbatim from the product's i18n and notification sources, with the fictional content marked.
- **Each act's window overlaps its neighbours on purpose,** so the incoming act covers the outgoing one: no gaps, no hard cuts.
- **One owner per file, and one owner for the timeline** (the loop itself is in [04-build-and-critique.md](04-build-and-critique.md)). In the case, parallel fixers editing shared files broke each other's renders. After that: builders edit only their act file and write timing requests into their report; one owner applies timeline changes.
- **Fixers update the storyboard rows they change.** Otherwise the next critic flags the spec and the film as inconsistent.
- **Three signature moments are marked** in the storyboard; they get the most build and review attention.

## 11. Variants and cut-downs

### Hook variants: shared timeline, only the hook swaps

Plan variants from the start. The Griffel variant "vraag" (question) was added after the build, and it worked because the engine allowed it:

- **A page per variant** (`index-vraag.html`, `portrait-vraag.html`) that sets `window.VARIANT` before the scripts load. Variant code registers only when the variant matches, so the original pages stay pixel-identical (this was checked).
- **A join point.** From film 3.2 s on, the variant is the original film. Only the first three seconds differ: the question card, the tap at 0.8, "Griffel vraagt het eerst aan jou.", then a dissolve into the recording screen.
- **Remove what the new hook makes redundant.** The original's sub lines at the drop repeated the variant's hook word for word, so the promise was said four times; the variant pages switch those lines off.
- **The join is a camera problem.** The variant's first framing was much closer than the original's, and the first pull-out dipped below the original's framing and pushed back in (a yo-yo). The fix ended the pull on a framing that already sat on the original's camera path.
- **Each variant gets its own music edit** (in the case, a cold open on the drop, then a jump back so the same drop lands on the same answer tap) and **its own critic.** The variant critic scored 7/10 and found problems no critic of the original could have seen: the direction of the screen change, the camera at the join, the repeated promise.

### The 15 s cut-down (recommended, not built in the case)

LinkedIn reports its best completion for 7-15 s videos, so paid placements want a short cut. The research's plan, "from vague to action item":

| Time | Picture | Text |
|---|---|---|
| 0-3 | the vague caption "…dan houden we de Q4-deadline aan." | a one-word card |
| 3-9 | the question card and the tap on the answer | "Griffel vraagt het eerst aan jou." |
| 9-13 | the e-mail row with name and date | a one-word card |
| 13-15 | logo, slogan, free-tier offer | |

At 110 BPM, 7 bars are 15.27 s. Building it from the hero's own bar-aligned segments, on a page that maps output time to hero film segments, should avoid new animation, but that approach is untested. It is still not an App Store preview: those need real screen captures.

## 12. The end card is the poster

The last frame is what many players show after the video ends and what people screenshot. Treat it as a poster:

- **Hold at least 3.5 s.** Round 2 rated the first end card too short (a severity-1 note). It went to about 3.8 s, then to 4.25 s of film time (about 4.6 s of output) in the final film.
- **Content, in order:** logo, slogan, the offer plus the URL (bold), small fine print, official store badges unmodified at equal height. Griffel: "De AI-notulist die doorvraagt." / "Gratis: 3 meetings per maand." / griffel.ai / "Gemaakt in Nederland. Verwerkt in de EU." / the badges.
- **The logo assembles at its final position.** The mark first assembled in the middle of the frame and then jumped about 290 px into its poster position; critics called it a lurch. It now assembles where it ends, and only a slide and the wordmark wipe remain, with one small settle on the music's final hit.
- **Never fully frozen:** a slow 1.5 % zoom drift over the hold.
- **Export it** as a PNG as well. It becomes the thumbnail.
- **Check the fine print at feed size.** The 16:9 fine print was about 5 px at 360 px width; acceptable only because 16:9 was the desktop cut.

## 13. Storyboard review checklist

Run this before any builder starts:

- [ ] The message spine is written at the top, and every beat maps to one of its links and a facts ID.
- [ ] Frame 0 is described as a finished poster, and something moves from frame 1.
- [ ] The core moment's position is decided on purpose (not by accident at 45 % or later).
- [ ] Every caption creates exactly one doubt; nothing answers a question before the product asks it; the payoff contains every answer.
- [ ] Every card has at most about 5 words per line, a planned hold from the reading-time formula, and no overlap with another card or another word-by-word build.
- [ ] Every must-read element has a computed feed-size height that clears the minimum for its format.
- [ ] Structural times sit on the chosen track's bar grid; the drop is the core moment.
- [ ] Scene changes are morphs or platform-native transitions; directions mean what the app means; no clocks for time jumps.
- [ ] Hand-off framings are defined for every act boundary.
- [ ] Fictional content is labelled from frame 0 to the last legible frame; names do not collide with real UI placeholders; no e-mail addresses.
- [ ] Variants and the 15 s cut-down are in the plan, with a join point.
- [ ] The end card holds at least 3.5 s and the logo assembles where it ends.
