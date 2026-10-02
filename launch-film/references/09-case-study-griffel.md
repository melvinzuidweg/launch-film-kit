# 09 · Case study: the Griffel launch film

How a 52-second launch film for a Dutch app was made with Claude Code, from the first question to the delivered files, over about 18 hours of wall-clock time (much of it autonomous overnight) and about 20M subagent tokens. Everything here is first-hand from the session that made it; where a number is approximate it says so.

> **Brand note.** Griffel's name, logo, UI and copy belong to its founder and are not licensed for reuse. Dutch lines are quoted here to explain decisions, with translations. Competitors are named factually, with the founder's permission.

## Contents

1. [The product and the ask](#1-the-product-and-the-ask)
2. [The quiz: what the founder decided](#2-the-quiz-what-the-founder-decided)
3. [Research, and what it changed](#3-research-and-what-it-changed)
4. [The film, beat by beat](#4-the-film-beat-by-beat)
5. [The variant "vraag"](#5-the-variant-vraag)
6. [How it was built, in numbers](#6-how-it-was-built-in-numbers)
7. [Critic scores per round](#7-critic-scores-per-round)
8. [What the critics caught](#8-what-the-critics-caught)
9. [Music and sound](#9-music-and-sound)
10. [Rendering and encoding](#10-rendering-and-encoding)
11. [Deliverables and the state at delivery](#11-deliverables-and-the-state-at-delivery)
12. [What we would do differently](#12-what-we-would-do-differently)

---

## 1. The product and the ask

**Griffel** (griffel.ai) is a Dutch AI meeting-notes app built by a solo founder. You put your phone on the table during an in-person meeting; it records; afterwards it asks short clarifying questions about what was unclear (names, deadlines, amounts, owners); it e-mails notulen (minutes) with decisions and action items to the attendees you choose; and it deletes the recording, transcription and questions once the notes are sent. Its slogan is "De AI-notulist die doorvraagt" (the AI note-taker that asks follow-up questions).

**The ask** was "a super professional launch video". The founder had seen posts about motion films made with Claude and shared the sources behind them: a skill with a pure `seek(t)` renderer, springs, 8-subframe motion blur, beat maps and a self-critique loop (howseen-ai/claude-motion-design); a process kit with fresh critics and a measurable quality bar (echris6/motion-video-kit, built around HyperFrames); a launch blueprint (2-second hook, reason before features, mute-first, 30-60 s, poster end frame, a launch-day plan); and a gallery of examples. Their ideas run through the whole kit.

## 2. The quiz: what the founder decided

The founder answered rounds of four multiple-choice questions, each with a recommended option. The research reports fed a decision map that separated blocking from later questions.

| Topic | Decision |
|---|---|
| Goal | installs + awareness |
| Viewer | a Dutch SMB team lead who runs in-person meetings with 3-6 people |
| Concept | a hybrid: "phone on the table" as the hero, one continuous take; a 15 s "from vague to action item" ad variant; a logo sting |
| Length and formats | 45-50 s, 16:9 and 4:5 (9:16 recomposed from 4:5 later) |
| Look | UI only (no people, no table for now); light → dark recording act → light |
| Sound | no voice-over; library music |
| Build | a new repo, HyperFrames as the renderer |
| Review | the founder reviews only the final result, so the build ran autonomously |
| Launch | no date yet; English later |

The founder also asked for competitor research before the message was fixed. That request changed the film more than any other decision.

## 3. Research, and what it changed

### Discovery (5 agents, about 0.8M tokens)

- **Brand brain.** The real tokens came from the live website's CSS and the app's token file. The repo's `DESIGN_TOKENS.md` was a stale template from another project (a serif font, pill buttons); the shipping CSS used Inter only and 10 px radii. Contrast math: brand green #1ABA6D on white is about 2.5:1 and fails even large text, so highlighted words on light used #12804B (5.0:1); the UI mint #09FE94 was never text on light.
- **Facts file.** Every on-screen claim was marked SAFE, NEEDS CHECK or DO NOT USE, with its source. Banned: "foutloos" (flawless, rejected by Apple under guideline 2.3.7), "alles gewist" (everything wiped), "Europese AI", every time claim, ratings and testimonials.
- **Motion tooling.** HyperFrames (Apache-2.0, by HeyGen) became the renderer. On Windows it captures by screenshot rather than BeginFrame, so renders are not byte-reproducible; its CLI did not expose motion blur; telemetry is on by default and was disabled. One shared repo link returned 404 and turned out to be `motion-video-kit`, a process kit with no renderer. howseen's renderer is a minimal MIT-licensed Python + Playwright script. Remotion is free only for teams of three or fewer.
- **References and distribution.** The Dutch B2B audience is on LinkedIn (about 5.8M users; X is small and shrinking in NL), and LinkedIn autoplays muted. App Store previews must be screen captures, so a film with rebuilt UI cannot be a store preview. LinkedIn's ad spec asked for under 30 fps.
- **Assets.** The website already had HTML rebuilds of key app screens (the recording screen, the question wizard, an iPhone frame), but they ran on timers and could not be seeked. Inter fonts were available under OFL. The machine: Windows 11, a 6-core/12-thread laptop CPU, an RTX 2060 with 6 GB, 24 GB of RAM with only about 1.4-3 GB free, and about 40 GB of free disk.

### Competitor and USP research (14 agents, about 2.0M tokens)

Method: three discovery agents with different search angles found 53 candidates; 20 were profiled on a fixed feature matrix (16 after merging duplicates); one skeptic agent per candidate USP tried to refute it (5 verdicts); a strategist ranked the result.

**The finding that changed the message.** The closest competitor, Notuly, does the same basics: phone on the table, no bot, notes mailed to chosen recipients (also without an account), keeps nothing, hosting in the Netherlands. It is cheaper and uses privacy as its own headline. TalkMark, Topical, Notizy, Jamie, Leexi, MeetGeek, Plaud, Granola, Fireflies and Microsoft's Copilot features each covered parts of the rest. So privacy and "no bot" became setting, not message.

| Rank | USP | Verdict | Role |
|---|---|---|---|
| 1 | **Doorvragen**: the app asks you about unclear content before the notes are written | rare, no counter-example found (medium confidence) | the core |
| 2 | The action item with name and date in the inbox of whoever you choose | common on its own | the payoff, where 1 and 3 become visible |
| 3 | Real speaker names via a clip and a confirm | the mechanism is rare, the result is not (Jamie names speakers via a clip, after the notes) | support |
| - | "Verstuurd is verwijderd" (sent is deleted) | rare (high confidence), but the competitor makes the same promise | a 3 s trust beat plus an end-card line |

The web search budget ran out during the skeptic step, so the checks continued with direct fetches of vendor pages. "No evidence found" is weak evidence of absence, which is why the film never says "only" or "unique".

**The hook changed too.** The first decision map recommended opening on the phone landing on the table. The competitor report recommended opening on the vague moment itself, without any contrast with other apps, and that became the hook.

### Code-level truth checks

Three claims that the marketing implied were not supported by the code:

- **Name suggestions.** A suggestion appears only when a previously saved name literally occurs in that speaker's words (and saving names is off by default). The film shows the user typing "Lisa".
- **The push "Je notulen staan klaar."** (your notes are ready) did not exist in the code; it was an example in the tone guide. The film uses the real push copy.
- **Screens.** The app has no transcript screen and no notes screen. What is said at the table is shown as captions in the scene; the notes appear as the e-mail.

During the build, critics found two more of the same kind: the "done" screen's real description used the banned word "alles" (everything), so the film shows only its title and icon; and the name field's real placeholder, "Bijvoorbeeld: Thomas", made a fictional attendee called Thomas look like a name suggestion, so Thomas became Daan.

The research also found that the live website hero still said "Foutloze notulen", the claim Apple had rejected. Since the film sends traffic there, fixing the site was put on the pre-launch list.

## 4. The film, beat by beat

The storyboard was written in film time on a 120 BPM grid (one bar is 2.0 s) with the drop at 22.0. The final music is 110 BPM, so the whole film plays at 120/110 (about 9 % slower); output time = film time × 1.0909. The output is 52.36 s.

| Film t | Output t | What happens |
|---|---|---|
| 0 | 0 | **Hook.** Frame 0 is a finished poster: "…dan houden we de Q4-deadline aan." ("…then we'll keep the Q4 deadline") in ink, "En wanneer is dat?" ("And when is that?") in green, the dark recording phone peeking in from below, the VOORBEELD label in its corner. A calm push from frame 1; the highlighter sweeps "Q4-deadline" at 0.7. |
| 2.0-3.4 | 2.18-3.71 | The words collapse into bars that fly into the phone's waveform. The lights go down: a wide vignette, about a second of visible change. |
| 3.4-10 | 3.71-10.91 | **"Opnemen."** (Record.) "Leg je telefoon op tafel." / "Griffel vraagt daarna door." Dark recording screen, timer 00:00 → 47:12, meeting captions tagged Spreker 1/2/3. Hold-to-stop at 8.4. |
| ~10-11.2 | ~10.9-12.2 | An even crossfade back to light; the waveform bars fold into the processing-step dots. |
| 11.4-16.3 | 12.44-17.78 | **"Echte namen."** / "Geen Spreker 1." The "Sprekers benoemen" push, the naming screen: play the clip, type "Lisa", confirm. In the caption, "Spreker 1" is struck through and becomes "Lisa". |
| 16.6-22 | 18.11-24.0 | **"Doorvragen."** (Clarify.) The push "Je notulenvragen staan klaar." The question builds word by word: "Er werd verwezen naar 'de Q4-deadline'. Welke datum is dat?" Then "Iets onduidelijk?" / "Griffel vraagt het eerst aan jou." |
| **22.0** | **24.0** | **The music drop.** The tap on "12 december", a +4 % camera punch. The answer flies into the caption: "…dan houden we 12 december aan." |
| 22.3-23.6 | 24.33-25.75 | Question 2: "Wie stuurt de offerte naar de klant?" (Who sends the quote to the client?) → Lisa. |
| 24.0-25.85 | 26.18-28.2 | The thesis: "Griffel raadt niet. Griffel vraagt." (Griffel doesn't guess. Griffel asks.) |
| 26.1-27.5 | 28.47-30.0 | Context: "Voeg een agenda of offerte toe." / "Griffel gebruikt die voor namen en bedragen." A file is attached, three recipients are tapped, "Notulen versturen". |
| 28-35 | 30.55-38.18 | **"Notulen."** The e-mail unfolds out of the phone; the camera moves to the action row "**Lisa** stuurt de offerte naar de klant · **12 december**", held as a large hero line. It fans out to three inboxes under "Besluiten en actiepunten / in de inbox van wie jij kiest." (Decisions and action items in the inbox of whoever you choose.) |
| 35.3-37.4 | 38.51-40.8 | "Verstuurd is verwijderd." / "Binnen enkele seconden gewist." (Sent is deleted. Wiped within seconds.) The chips Opname, Transcriptie, Vragen dissolve one by one. |
| 38-42 | 41.45-45.82 | "Opnemen. Doorvragen. Notulen." stack on three beats. The phone dissolves; its corners become the logo's brackets around five bars. The lock lands on the music's final hit. |
| 42-48 | 45.82-52.36 | The wordmark wipes in. End card (poster), complete from about 43.75 (output 47.7), held to the end: logo, "De AI-notulist die doorvraagt.", "Gratis: 3 meetings per maand.", griffel.ai, "Gemaakt in Nederland. Verwerkt in de EU.", the official store badges. |

The meeting is fictional: Lisa, Daan and Sanne at a "Projectoverleg nieuwe website" (new-website project meeting), a fixture reused from the product's own e-mail previews. The VOORBEELD label stays until the meeting subject has dissolved (film 38.6). No e-mail addresses appear anywhere.

## 5. The variant "vraag"

Built after the original, on the same timeline, to put the strongest moment first.

| Film t | Output t | What happens |
|---|---|---|
| 0 | 0 | Frame 0 is the question card in a close framing, with "Iets onduidelijk?" as the headline (96 px in 16:9, 92 px in 4:5) and the VOORBEELD label. A constant push from frame 1. |
| 0.8 | 0.87 | The tap on "12 december"; "Griffel vraagt het eerst aan jou." rises, "Griffel vraagt" in green. |
| 2.25-3.65 | 2.45-3.98 | The camera pulls back (in 4:5 to a framing on the original's camera path, not below it). |
| 2.4-2.9 | 2.62-3.16 | The card dissolves into the dark recording screen. The overlay is gone by 3.0. |
| 3.2 on | 3.49 on | Identical to the original, except that the "Iets onduidelijk?" lines at the drop are switched off, because the hook already said them. |

The music opens cold on the drop (§9). The variant's own critic scored it 7/10 and found that the first version pushed the recording screen in from the right, which on iOS means "forward" and read as "answering starts a recording"; it became a direction-free dissolve.

## 6. How it was built, in numbers

| Phase | Who | Tokens | Time |
|---|---|---|---|
| Discovery research | 5 agents | about 0.8M | |
| Competitor and USP research | 14 agents | about 2.0M | |
| Foundation: engine, film core, timeline, copy, stage, phone, touch, pushes, overlay text, the still tool, the storyboard | the main session | | about 1.5 h |
| Act build: 5 builders in parallel, each followed by a fresh critic and a fixer | 15 agents | about 4.3M | about 1.5 h |
| Global critic round 2 (3 lenses, triage, one fixer per file) | | 2.9M | |
| Global critic round 3 | | 3.0M | |
| Global critic round 4 | | 2.7M | |
| Time scale, the variant, its critic and fixer | | about 1.0M | |
| Final fresh critic, 5 targeted fixes, verification, music, renders | | not itemised | |
| **Total** | | **about 20M subagent tokens** | **about 18 h wall clock** |

The itemised phases add up to about 16.7M; the rest went to the final critic, the targeted fixes, verification, music and render work.

**Render times on this machine:**

- Draft (HyperFrames, 60 fps PNG sequence, then encode): about 3.5 min for the 48 s film at 2 workers, capturing about 13.7 frames per second.
- Final: 480 fps capture (23-25k frames), about 13-16 min per format at 4 workers, then an 8-subframe blur and encode down to 60 fps. Roughly 20-25 minutes per final file end to end; the four finals (2 versions × 2 formats) ran back to back at the very end.

**Two process lessons with numbers attached:**

- **Diminishing returns after round 3.** Round 2 moved the overall score from 6 towards 7; rounds 3 and 4 each cost about 3M tokens for smaller gains. Next time: two broad rounds, then targeted fixes only.
- **Parallel fixers on shared files caused breakage.** In round 1, an in-progress edit to act A left the hook line on screen for the whole film while two other builders were rendering their acts; both reported it as a mystery in their files. Rules that followed: one owner per file; re-render once before concluding that something outside your file is broken; timeline changes go through one owner.

## 7. Critic scores per round

Each global round used three critics, each with one lens: story and message; motion and technique; brand, truth and the 4:5 format. Scores are out of 10.

| Round | Overall | Lenses (story / motion / brand) | Weakest | Verdict |
|---|---|---|---|---|
| 1 (per act) | not scored overall | | | 5 builder + critic + fixer loops |
| 2 | 6 | 6 / 5 / 7 | the three selling moments failed at feed size | "one more pass" |
| 3 | not given as one number | 7 / 6 / 7 | camera at 5; hook, pacing, hand-offs and phone-size readability at 6 | "one more pass" |
| 4 | 7 | 7 / 7 / 7 | hook, pacing and polish at 6 | "one more pass" |
| Final fresh critic | 7.5 | | hook 6, pacing 6.5 | "ship after small fixes" |
| Verification after 5 targeted fixes | 7.5 | | | no regressions |
| Variant critic | 7 | | transition into the story 5 | fix, then ship |

In round 2, copy and tone scored 9, UI fidelity 8 and facts 8: the truth work done before the build held up. The final critic's highest scores were the payoff (8.5), brand and UI fidelity (8.5), the end card (8.5) and readability on mute (8).

## 8. What the critics caught

### Before → after

| Problem | Before | After | Round |
|---|---|---|---|
| Story contradiction | Speaker 1 said "Die stuur ik wel." (I'll send it), then Griffel asked who sends it | the ambiguous "Die pakken we wel op." (we'll pick that up) | 1 |
| Name collision | an attendee called Thomas next to the placeholder "Bijvoorbeeld: Thomas" | Thomas renamed to Daan | 2 |
| Legibility | "Iets" read as "lets" in Inter | the serifed capital I (`cv08`) on overlay text only | 2 |
| Diluted core | "Doorvragen." arrived during the naming step | a new "Echte namen." card; "Doorvragen." lands fresh at 16.6 | 2 |
| Truth | the e-mail intro and inbox subject were not the real strings; later the preheader was cut mid-word | real strings; the preheader shows its first full sentence | 2, 5 |
| Example label | too small, left early | 30 px / 28 px, on screen until 38.6, colour from the stage luminance under it | 2 |
| Payoff size | the action row was about 5 px at feed width | a hero row lifted out of the e-mail at large size | 2 |
| Exits | words leaving one by one left dangling fragments | block exits | 2 |
| Touch | two touch dots visible at once | one dot that glides between taps under 0.6 s apart | 2 |
| Camera | every act returned to rest at its boundary (yo-yo) | shared hand-off framings | 2 |
| Encode | the MP4 shifted #1ABA6D to #16B867 and banded the near-white gradient | explicit BT.709 conversion with dither; a colour check in the pipeline | 2-3 |
| Dark transition | a hard black circle iris, the biggest frame difference in the film | a feathered vignette; the way back an even crossfade with no white bloom | 2, 3, 5 |
| Hook | a half-grey sentence and a static first second | frame 0 a finished poster, a calm push from frame 1 | 4, 5 |
| In-phone screen changes | one-frame hard cuts | iOS-style horizontal pushes (0.35 s) | 4 |
| Drop | four events within 1.2 s | one at a time: tap, caption swap, question 2, then the thesis | 5 |
| Thesis | readable about 1.1 s | about 1.8 s | 2-5 |
| Logo | the mark jumped about 290 px into place | assembled at its final position; only a slide and the wordmark wipe remain | 5 |
| Overlap | "12 december2 december" while the answer lifted off the option | the copy fades in only once it is clear of the label | variant critic |
| Timer | the running timer smeared under 8-subframe blur | the value quantised to the output frame grid | scale work |
| End card | too short | the poster holds about 4.25 s of film time | 2-3 |
| Music grid | time scale 1.1 left the logo lock 0.18 s off the 110 BPM beat | scale 120/110 | variant critic |

Builders also caught bugs of their own: word positions measured before Inter had loaded (the bars landed 8-39 px off their words; fixed by checking `document.fonts.check`), and `visibility: visible` on a child overriding a hidden parent, which made the hook ghost through a whole act (fixed with `inherit`).

### Notes that were deliberately skipped

Triage mattered as much as fixing. Each round's ledger lists skipped notes with a reason. Some examples:

- A callback that would have produced "…dan houden Lisa 12 december aan": ungrammatical, and it misattributed the line.
- A mint chip "Lisa · offerte · 12 december" inside an inbox row: it invented a UI string.
- A spring follower layered over the whole camera late in polish: it would have shifted every act's measured framings.
- A 2-4° phone tilt for depth: it hurt the weakest score, readability at phone size.
- Easing curves other than the house curve for punchier moments: same effect achieved by shortening durations.
- Pulling "Doorvragen." forward to about 11 s: the drop was fixed on the music grid, and the retime would cascade through every act in the last pass.
- Showing the "done" screen's real description: it says "alles" (everything), which the facts file bans.
- Zooming in on the recipient chips in 4:5: it would put UI under the overlay text, against a storyboard rule. The chips stayed unreadable at feed size, a known limitation.

## 9. Music and sound

### Choosing the track

The first plan was a one-month business licence from a large library and a 120 BPM track, "Eternal Afternoon" by Susan Bear; the film's 120 BPM grid comes from that plan. Its licence forbids new versions after cancelling, so the plan was to buy only at picture lock. That purchase turned out not to be needed: the final music came from Uppbeat, licensed per video.

The search happened in the in-app browser. Each category page of the library carried its track list as structured data (tempo, energy, genre, vocals, length, preview link). About 1,400 candidates across about 60 categories were filtered to instrumental, 108-112 BPM, electronic, not dark, at least 80 s long. The streaming previews were analysed in the page with Web Audio: decode, a one-pole low-pass at 150 Hz, bass energy per 0.5 s, from which the intro, breakdown, drop and ending can be read. Five tracks made the shortlist. The two final WAVs were downloaded only after the founder approved those exact files; each download is a licence for a single video, with a credit line for the video description.

### Tempo

The tracks are 110 BPM and the film was built on 120. A uniform time scale of 120/110 makes every film beat land on a music beat and slowed the film by about 9 %, which the founder had asked for anyway: 48 s became 52.36 s, with the drop at 24.0 s.

### The edits

| | Original: "Just Flow" (Hartzmann) | Variant: "One More Chance" (Hartzmann) |
|---|---|---|
| Track structure used | drop at song 105.0 s; a final hit at 144.27 | drop at 109.08 s after a 2 s near-silent break; a hard stop at 196.30 |
| Start | song 81.0 at output 0, so the drop lands on the answer tap at 24.0 | cold open on the drop at frame 0 |
| Middle | low-passed (about 700 Hz, "next room") until the drop, then the filter opens | at output 4.36 (2 bars), jump back 11 bars, so the break falls at 21.9-23.9 and the same drop hits at 24.0 on the answer tap |
| End | at output 39.27, jump 8 bars ahead into the outro, so the final hit lands on the logo lock at 45.82; the tail runs under the end card | at the logo lock, jump 27 bars ahead, so the hard stop lands on the last frame |

Every jump is a whole number of bars (one bar is 2.18 s at 110 BPM). Half-bar jumps stumble audibly.

### Sound effects and mix

- Ten effects (tap, tick, whoosh, chime, confirm, select, pop, lock, dissolve, stop-hold) were synthesised with seeded numpy code, so no licence was needed.
- The cue list was generated from the film itself: a script read the registered taps, pushes and timeline values and converted them to output time. When the drop window was retimed, the effects followed without any edit to the audio tools.
- The mixer placed music segments with 30 ms crossfades, the low-pass windows, and each effect so that its peak lands on its cue; then a two-pass loudness normalisation to -14 LUFS with -1 dBTP, plus a music-only export.

## 10. Rendering and encoding

- **Engine.** Every frame is a pure function of time: one `render(t)` per part, a single house easing curve `cubic-bezier(.45,0,.15,1)`, damped springs with zeta at least 0.9 (no bounce), seeded noise instead of `Math.random`, no timers. Two pages (16:9 1920×1080 and 4:5 1080×1350) load the same scripts; a variant page sets one more variable.
- **Drafts** went through HyperFrames. **Finals** needed 8-subframe motion blur, so 480 fps capture. HyperFrames' disk pre-check refused a 480 fps PNG sequence, estimating 67 GB when real frames were about 0.2 MB each, so a small capture script seeked the page directly with one Chrome process per worker (background tabs of a shared browser failed to capture). Its output was pixel-identical to the still tool.
- **Colour.** The first MP4s shifted the brand green and banded the near-white gradient. The fix was an explicit BT.709 matrix, limited range, error-diffusion dither, correct tags, CRF 10 and no `-tune animation`. A check script samples the brand mark (within ±2 of #1ABA6D), white (exact) and banding. Mixed RGB/RGBA PNG frames made ffmpeg silently drop frames (a 48-frame test came out as 29), so the encoder normalises frame modes and verifies the frame count.
- **Gotchas.** The npm minimum release age of 7 days meant pinning HyperFrames to a version at least a week old. HyperFrames ignored a script-set duration when the markup also had one. Editing a bash script while it runs breaks the run. Windows Python prints cp1252 by default. Telemetry was switched off with `HYPERFRAMES_NO_TELEMETRY=1`.

[03-engine.md](03-engine.md) and [05-render-and-encode.md](05-render-and-encode.md) describe these in detail; the review loop is in [04-build-and-critique.md](04-build-and-critique.md).

## 11. Deliverables and the state at delivery

**Delivered:**

- The original, with music: 16:9 and 4:5, 52.36 s, 60 fps, 8-subframe motion blur, BT.709, -14 LUFS.
- The variant "vraag": 16:9 and 4:5, same specs.
- Light phone previews (about 8 MB each), music-only WAVs, poster PNGs (the last frame), contact sheets.
- Docs: brief, facts file, storyboard, the fictional meeting, a delivery report in the founder's language, and one ledger per review round.

**Measured at delivery:** no freeze of 0.4 s or longer, no single-frame spikes, brand green within one level of #1ABA6D, white exact, BT.709 tags, measured text contrast of at least 4.5:1, readability checked at 360 px feed width.

**Known limitations, stated in the delivery report:**

- The hook (6/10) and pacing (6.5/10) were the weakest scores; the "aha" arrives at 24 s of output. A 15-20 s version that starts at the question was recommended for paid ads.
- Question 2 is readable for only about 1 s.
- The recipient name chips cannot be read at phone size. The e-mail payoff shows clearly who gets what.
- The context beat packs 13 words next to five taps; a critic recommended inserting one bar, which was not done.

**Left for a human:** watch the 4:5 in the LinkedIn app as a private draft, muted, and ask whether someone who does not know the product understands it; compare the rebuilt UI with the build that is live in the stores; judge the mix by ear. Posting, uploading and pushing were left to the founder.

## 12. What we would do differently

1. **Pick the music first** (tempo and structure) and write the storyboard on its bar grid from day one. Set a time scale from the tempo only if you must. Ask on day one which music sources the founder can already use.
2. **Make feed-size readability a storyboard rule,** with minimum on-screen text sizes per format. The app UI's zoom has to serve a 360 px wide feed, and the recipient chips show what happens when it does not.
3. **Budget two broad critic rounds,** then targeted fixes only. Freeze ownership of the timeline file.
4. **Run the code-level claim checks during the brief,** not after the build. Two of the truth problems were found by critics mid-build and each cost a round.
5. **Place the core moment on purpose.** It landed at 46 % of the film because the drop was fixed on the music grid before anyone asked where the "aha" should be.
6. **Keep the variant pages in the plan from the start:** a shared timeline where only the hook swaps, with a defined join point.
7. **Plan the 15 s cut-down** for paid ads alongside the hero. It was recommended and not built.
8. **Give dense beats their time** instead of slowing the whole film: the context beat needed one more bar, not a global slowdown.
