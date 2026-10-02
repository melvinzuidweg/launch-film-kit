# 01 · Brief, research and truth

This stage decides what the film says. The next stage, [02-story-and-storyboard.md](02-story-and-storyboard.md), turns it into a storyboard. The work comes before any storyboard or code, because in the Griffel case the research changed the message: the "obvious" selling points (privacy, no bot in your call) turned out to be things the closest competitor also does, and cheaper. Three claims that the marketing implied were also not supported by the product code. Each of those findings would have cost a rebuild if it had surfaced after the acts were animated.

The output of this stage is a small set of files that every later agent reads: `brief.md`, `facts.md`, a brand/design note, `demo-meeting.md` (or whatever fictional content the film shows) and the research reports they are based on.

## Contents

1. [Order of operations](#1-order-of-operations)
2. [The founder quiz](#2-the-founder-quiz)
3. [Brand brain: the real tokens](#3-brand-brain-the-real-tokens)
4. [The facts file](#4-the-facts-file)
5. [Competitor and USP research](#5-competitor-and-usp-research)
6. [Code-level claim verification](#6-code-level-claim-verification)
7. [Distribution research](#7-distribution-research)
8. [Exit checklist for this stage](#8-exit-checklist-for-this-stage)

---

## 1. Order of operations

```
quiz round 1 (strategy)                ──┐
discovery research, in parallel:         │
  brand brain · motion tooling ·         ├─> decision map ─> quiz rounds 2-3 (story, look, sound, process)
  references + distribution · assets   ──┘
competitor + USP research ─> message ─> code-level claim checks ─> facts.md ─> brief.md
                                                                                  │
                                                         only now: storyboard (see 02)
```

A few reasons for this order:

- **Ask before you research, then ask again.** The first round of questions sets goal, viewer and constraints so the research agents look in the right places. The later rounds are better questions because they can offer options the research found ("the closest competitor already claims X, so X should be setting, not message").
- **Fix the message only after the competitor research.** In the Griffel case the founder asked for that explicitly, and it was the single most valuable step.
- **Run the code-level claim checks during the brief, not after the build.** In the case they ran alongside the competitor research and still arrived late enough that the storyboard had to be corrected. Next time they belong right next to the facts file.
- **Separate blocking from later decisions.** The decision map used two labels: BLOCKING (must be settled before the storyboard) and LATER (can wait for stills, the render or launch week). Ask the blocking ones first; the founder's attention is the scarcest resource in the project.

In the case, discovery research took 5 agents and about 0.8M tokens; the competitor/USP research took 14 agents and about 2.0M tokens.

## 2. The founder quiz

### Format

- **Rounds of at most 4 multiple-choice questions.** More than four and answers get rushed; fewer than three and the session drags.
- **Each question has 2-4 concrete options and a recommended one, with a one-line reason.** The recommendation is what you would do if the founder says "your call". It turns the quiz into a fast review of your plan instead of a blank form.
- **Options are specific enough to build from.** "Light → dark recording act → light" is buildable; "modern and clean" is not.
- **Record every answer** in `brief.md` with the date, in the founder's own words where it matters. Later agents and critics resolve disputes against this file.
- **Say what is not being asked yet** ("music licence: after picture lock") so nothing looks forgotten.

### Question bank

Pick from this list; the defaults are what worked for an app launch with a solo founder.

| Topic | Question | Options (examples) | Default and why |
|---|---|---|---|
| Goal | What should the film achieve first? | installs · trials of a paid plan · awareness/credibility · founder or build story | Installs + awareness. The lowest-friction offer (a free tier) makes a CTA that needs no explanation. |
| Viewer | Who is the one viewer? | a role, a company size, a sector, "international tech crowd" | One concrete role. The payoff has to land for that person (in the case: a team lead, because the payoff is "notes in the whole team's inbox"). |
| What launches | The product, a version, a plan? | product · version number · plan | The product. Version numbers date the film and stores dislike dated references. |
| Concept | Which concept? | 2-3 short concept paragraphs, each with a hook line, a carried object and three signature moments | A hybrid is fine if one concept is the spine (see 02 §4). |
| Length | Hero length? | 30 s · 45-50 s · 60 s | 45-50 s for the hero, with 15 s cut-downs later for paid placements. |
| Formats | Which aspect ratios are authored, not cropped? | 16:9 master only · 16:9 + 4:5 · 9:16 first | 16:9 + 4:5 authored on one timeline, 9:16 recomposed from 4:5. 4:5 is the mobile-feed deliverable. |
| Look | Light, dark or both? | brand-light · product-dark · light → dark → light | Follow the product: if a key screen is always dark, let that be an act. |
| People | Show people or a table? | UI only · abstract figures · live action | UI only unless there is budget for a shoot; people add privacy and casting questions. |
| Voice | Voice-over? | none (music + SFX) · founder's own voice · actor · TTS | None for the hero. Feeds autoplay muted, and a VO track does not survive mute. |
| Music | Where does the music come from? | a library the founder already pays for · a new library licence · commissioned · SFX only | Ask first which music sources the founder can already use. In the case, a library purchase was researched in depth and then turned out not to be needed; asking first would have saved that work. |
| Music timing | When is the track chosen? | before the storyboard · at picture lock | Before the storyboard: the timeline should sit on the track's bar grid (see 02 §9). Some library licences forbid new versions after you cancel, so buying "only at picture lock" can be right for the *payment*, while the *choice* is made early from previews. |
| Build | Where and with what? | new repo · folder in the product repo; renderer choice | A new repo, so heavy dependencies and renders stay out of the product's CI. |
| Installs | May agents install tools? | yes, scoped to the new repo · no | Ask explicitly; list exactly what gets installed. |
| Review cadence | When does the founder review? | every iteration · fixed gates · final only | If "final only", the build runs autonomously and the internal gates (fresh critics, measured QA) carry more weight. Say that out loud. |
| Launch | Date and channel? | a date or "none yet"; founder profile · company page · ads | Native upload from the founder's personal profile if the audience is on LinkedIn; the company page reshares. Avoid school holidays. |
| Language | Which language first? | local · English · both | The language of the product's output, because the UI in that language is the proof. |

### Things only the founder can give you

List these early so they are not discovered at the end:

1. The music source and its licence terms (and whether a plan is allowed for the size of the company).
2. A written OK, per item, for every NEEDS CHECK claim they want on screen.
3. Install approvals and the repo location.
4. Real proof (testimonials, logos, user counts) with written permission. Never invent any.
5. The launch date and all posting. Publishing is the founder's action, not the agent's.
6. Optional: their own voice or face for a later founder cut.

## 3. Brand brain: the real tokens

The brand brain is one report that later agents treat as the design source. Its job is to find what actually ships, not what a design document says.

### Find the live source first

- **Confirm which repo or site is live.** Check the git remote, the last commit date, the deploy link (for example a `.vercel/project.json`) and fetch the live page to compare. In the case, a second "website" folder on disk turned out to be an unrelated template.
- **Distrust design docs until the CSS agrees.** The product repo's `DESIGN_TOKENS.md` was a stale template from another project: it listed a serif font and fully round pill buttons. The CSS that ships used Inter only and 10 px radii. The rule that came out of it: verify every token against the CSS (or the app's token file) that actually ships, and cite that file.
- **Positioning docs drift too.** An old context document still described a previous tech stack and an old company registration number. Use such docs for positioning only, never for facts.

### What to extract

| Section | Contents | Where to look |
|---|---|---|
| Colours | hex, role, and the file it came from | shipping CSS (`globals.css` or similar), the app's token file, the logo README |
| Type | families, weights, tracking, line heights; where the font files are and their licence | CSS, `node_modules` font packages (Inter ships under OFL), the designer's handover |
| Shape | corner radii, which elements are true circles | CSS, component code |
| Buttons and cards | fills, borders, shadows | components |
| Light vs dark | which screens are always dark | app theme files |
| Logo | every file, its viewBox, colours, usage rules | logo folder, website `public/` |
| Recognisable elements | the 6-10 things that make the brand look like itself | website hero, store screenshots |
| Tone of voice | rules, word list, banned words, lines that already exist | tone guide, website copy, store listing |
| Do not reuse | assets that carry banned claims or private data | store graphics, screenshots |

In the case, the wordmark's font was commercial and its file was not in any repo. The logo SVG already had the wordmark as outlines, so no new text was set in that font; all film text used Inter.

### Contrast math

Measure contrast for every text/background pair the film will use. Brand greens are the usual trap.

WCAG contrast ratio = (L1 + 0.05) / (L2 + 0.05), where L is relative luminance of the lighter (L1) and darker (L2) colour. Thresholds: 4.5:1 for normal text, 3:1 for large text (about 24 px regular or 19 px bold at 1x).

```python
def lum(hex_):
    r, g, b = (int(hex_.lstrip("#")[i:i+2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def contrast(a, b):
    hi, lo = sorted((lum(a), lum(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)
```

What the numbers did to the Griffel film:

| Pair | Ratio | Consequence |
|---|---|---|
| brand green #1ABA6D on white | 2.53:1 | Fails even large text. Allowed on light only as fill or decoration. |
| dark end of the site's green gradient #12804B on white | 4.98:1 | Became the colour for highlighted words on light. |
| #1ABA6D on near-black #0A0A0A | 7.81:1 | Fine as text in the dark act. |
| UI accent mint #09FE94 on white | 1.34:1 | Never text on light; waveform and live dots only. |
| label grey #4B5563 on white | 7.56:1 | The VOORBEELD (example) label on light. |
| faint grey #9AA1A9 on white | 2.61:1 | Too weak for a hook line; the round-4 fix made the whole hook line ink. |

Two practical notes: measure on the actual background (a gradient or a vignette changes the ratio across the frame), and re-measure after encoding, because a careless encode can shift brand colours (see [05-render-and-encode.md](05-render-and-encode.md)).

### Logo and badges

- Prefer tightly cropped SVGs; a 500×500 canvas with lots of padding makes every placement fiddly.
- Write down the colour rule (in the case: the mark is always the brand green, never the UI mint; the wordmark is ink on light and white on dark).
- Official store badges come from Apple and Google and are used unmodified, at equal height, following their rules. Do not redistribute them in a public repo.
- List assets not to reuse, with the reason. In the case: the Play feature graphic and an onboarding slide carried a claim that Apple had rejected, and two App Store screenshots showed real e-mail addresses.

## 4. The facts file

`facts.md` is the only source for on-screen claims. If a sentence is not in it with status SAFE (or a recorded founder approval), it does not go on screen. Critics check against it, and so do you.

### Three statuses

- **SAFE**: shipping sources say it and the code agrees. Cite the file.
- **NEEDS CHECK**: plausible but unmeasured, absolute, or the sources disagree. Usable only with the founder's written OK, recorded with a date.
- **DO NOT USE**: false, rejected by a store reviewer, a superlative you cannot prove, a statistic with no source, a competitor's own line, a comparison, or anything that would date fast.

### Template

```markdown
# Facts file (only source for on-screen claims)

Sources: brand-brain report §4, code checks in the USP report, founder approval <date>.

| ID | Claim on screen (verbatim) | Status | Source |
|---|---|---|---|
| F1 | "<slogan>" | SAFE, official slogan | website hero, store listing, e-mail footer |
| F2 | <what the core feature does, in one sentence>. Lines: "<line 1>", "<line 2>" | SAFE | <i18n file>, <listing file> |
| F3 | <feature> | SAFE, with a limit: <what the film must show instead> | <component file>, <job file> |
| F6 | "<time claim>" | Approved by <founder> on <date> (<what the code shows>) | <doc> |

**Do not use:**
- <banned words and why>
- any time claim, ratings, user counts, testimonials
- competitor names or comparisons
- prices other than <the free tier>
```

### Working rules

- **Every claim gets an ID, and the storyboard cites it** per beat ("F2", "F4"). Critics can then check a beat in seconds.
- **UI strings are their own category.** Copy them verbatim from the app's i18n file and the real notification copy, and say so in one row (in the case, F11: "the push copy and the UI strings shown in the app, verbatim").
- **Keep a tone gate.** A grep over every string in the film for the banned words, exclamation marks and the formal "you" caught tone slips cheaply. For Dutch the pattern included the banned claim words, words the tone guide replaces ("samenvat", "uploaden", "vergadering"), superlatives and filler words.
- **Record what you are not showing, and why.** It stops a later critic from "improving" the film back into a false claim. In the case: no name suggestion (it is conditional in the code), no time claims, no "everything wiped".

In the Griffel facts file, the banned list was: "foutloos/foutloze" (flawless; Apple had rejected it under guideline 2.3.7), "enige", "uniek", "beste", "alles gewist" and "bewaart niets" (metadata stays and failed meetings keep audio up to 24 hours), "Europese AI" (the models are not European, only the hosting), "geen account nodig", every time claim, ratings, user counts, testimonials, competitor names, and prices other than the free tier.

## 5. Competitor and USP research

### Why it matters

A launch film has room for one message. Picking it from the founder's feature list tends to pick the features the founder is proudest of, not the ones that set the product apart. In the case, the closest competitor did the same basics (phone on the table, no bot, mail to recipients, keeps nothing, local hosting), was cheaper, and used privacy as its own headline. Leading with privacy would have made the product look interchangeable. The research moved privacy and "no bot" into the setting and made "asks clarifying questions" the core.

### Pipeline

```
discover (3 agents, different search angles)
   └─> ~50 candidates, each with relevance 1-5 and a "why"
profile (parallel agents, a fixed matrix)
   └─> ~20 profiles, deduplicated
skeptics (one agent per candidate USP, told to REFUTE it)
   └─> verdict + confidence + counter-examples with sources
strategist (one agent)
   └─> ranking, roles (core / payoff / support / setting), hook advice, banned claims, open questions
```

In the case: 53 candidates discovered, 20 profiled (16 after merging duplicates), 5 skeptic verdicts, one synthesis report. 14 agents, about 2.0M tokens.

**Discover.** Give each agent a different angle so they do not return the same ten names: for example (1) local-market tools in the product's language, (2) the international category leaders, (3) adjacent tools a buyer might use instead (built-in suites, hardware recorders). Ask for name, URL, segment, relevance 1-5 and a short "why", with a source.

**Profile on a fixed matrix.** Every competitor gets the same columns, so the table can be compared and the skeptics have something to check. The case used: platforms; the product's setting (in-person recording, bot-free); language support; one column per candidate USP (speaker identification, clarifying questions, auto-share to attendees, retention and deletion, EU data location, AI training, context upload, detail level, action items with owners, offline and max length); price and free tier; export and branding; strengths and weaknesses versus the product; sources. Mark each cell yes / partly / no / unknown, and keep "no evidence found" distinct from "no".

**One skeptic per candidate USP.** Each skeptic gets one claim and one job: find a competitor that already does it. The output schema that worked:

```json
{
  "usp": "the claim in one sentence",
  "verdict": "unique | rare | common",
  "confidence": "low | medium | high",
  "competitors_that_also_do_it": [{"name": "", "how": "", "source": ""}],
  "safe_wording": "how the film can say it without overclaiming",
  "how_visual": "what it looks like on a muted screen",
  "audience_relevance": "why the viewer would care",
  "where_product_is_weaker": "",
  "notes": ""
}
```

Telling the agent to refute, rather than to "assess", matters. An assessing agent tends to agree with the claim it was handed; a refuting agent goes looking for the counter-example, and when it cannot find one, that absence means something.

**Strategist.** One agent reads the matrix and the verdicts and scores each candidate 1-5 on three axes: distinctiveness (from the skeptic's verdict), relevance to the viewer, and visibility on mute (can a silent screen show it?). In the case:

| Candidate | Distinct | Viewer | Mute | Total | Role in the film |
|---|---|---|---|---|---|
| Asks clarifying questions ("doorvragen") | 5 | 5 | 5 | 15 | Core |
| Decisions and action items in the inbox of whoever you choose | 2 | 5 | 5 | 12 | Payoff: where the core becomes visible |
| Real speaker names via a clip and a confirm | 3 | 4 | 4 | 11 | Support |
| Phone on the table, no bot | 1 | 5 | 5 | 11 | Setting, not a claim |
| "Sent is deleted" | 3 | 3 | 3 | 9 | A short trust beat plus an end-card line |

The insight in the second row is worth keeping: a feature can be common and still be the payoff, because it is where the rare feature shows its result. The strategist's chain for the film was "a fragment of dialogue makes something vague → the product asks → the e-mail shows the action item with a name and a date".

### What else the strategist should return

- **Hook advice.** In the case: no contrast with competitors (it invites comparison and needs naming), no statistics (none were sourced). Open with the vague moment the product fixes.
- **What the film must not suggest**, from the weaknesses the profiles exposed (in the case: that it is the only tool that asks, that it remembers voices between meetings, that questions always appear, that mail arrives instantly, that the app has a transcript screen).
- **Open questions for the founder**, numbered, each answerable in one line.

### Honesty about the research itself

- The case's web search budget ran out during the skeptic step, so the checks continued with direct fetches of vendor pages. "No evidence found" is weak evidence of absence, which is why the verdict for the core USP was "rare, medium confidence" and never "unique". The film's copy followed: no "only", no "unique".
- Date-stamp the research. Prices and features move; one competitor had dropped its price since a blog post earlier the same year.
- Keep competitor names out of the film and out of the facts file's allowed claims. Comparisons invite disputes and age badly.

## 6. Code-level claim verification

Marketing copy drifts away from the code. Before a feature appears in the film, someone reads the code path that produces it.

### Procedure

1. List every product behaviour the storyboard would show or imply, including the small ones (a notification text, a suggestion chip, a screen you pass through).
2. For each, find the string in the i18n file and the code that decides when it appears. Read the job or component, not just the copy.
3. Write the result next to the claim: what the code does, under which conditions, and the file.
4. Decide per item: show as is, show with the real condition (and change the storyboard), or leave out.
5. Put anything the founder needs to decide into the numbered open-questions list.

### What it found in the case

| Implied by marketing | What the code said | What the film did |
|---|---|---|
| The app suggests a name for each speaker | A suggestion appears only when a previously saved name literally occurs in that speaker's words, and saving names is off by default. There is no voice memory. | The user types "Lisa". No suggestion chip anywhere. |
| A push "Je notulen staan klaar." ("your notes are ready") | That text existed only as an example in the tone guide. The real pushes were different strings. | The film used the real push copy verbatim. |
| You read the transcript or the notes in the app | The app has no transcript screen and no notes screen; the question card even says the transcript stays hidden. | What is said at the table appears as captions over the scene, not as an app screen. The notes appear as the e-mail. |
| "Afterwards everything is deleted" | Metadata stays; failed meetings keep audio up to 24 hours. Sent meetings are wiped on the next worker tick (about 3 s). | "Sent is deleted. Wiped within seconds." after the founder approved the time claim. |
| The "done" screen | Its real description says the product deleted "everything" from its servers, a word the facts file bans. | The film kept the done screen's title and icon and left the description out. |
| A name placeholder in the naming field | The real placeholder reads "For example: Thomas". | The fictional attendee called Thomas was renamed Daan, so the placeholder could never look like a name suggestion. |

The last two were caught by critics during the build, which is the argument for doing this sweep up front: each one cost a round.

## 7. Distribution research

Distribution facts change the film, not just the launch post. Research them in the discovery phase.

### What to find out

| Question | Why it changes the film |
|---|---|
| Where is the audience, in this country? | Picks the primary format and the posting profile. |
| Does the platform autoplay muted? | If yes, every beat has to read with the sound off. |
| Native video specs per platform (aspect range, length, fps, file size, captions) | Fixes the deliverable list. |
| Ad specs (often stricter, for example a frame-rate cap) | Plan derivatives early. |
| Store preview rules (App Store, Google Play) | Usually decide that the launch film is *not* a store asset. |
| Loudness conventions | Sets the mix target. |
| Best days and times, holidays | Sets the launch window. |
| Founder profile vs company page | Sets who posts. |
| Local subtitle norms | Sets text length and hold times. |

### What the case found (checked 2026-10-01; check again before you rely on it)

- **Audience.** In the Netherlands LinkedIn had about 5.8M users and was where the B2B decision-makers were; X was about 2.7M and shrinking. Recommendation: upload natively from the founder's personal profile (personal profiles reach far more people than company pages), let the company page reshare a few hours later, and save a "built with Claude Code" story for X a week after launch so it does not split attention on launch day.
- **Muted autoplay.** LinkedIn autoplays muted; LinkedIn's own advice is to assume sound off and put the key point in the first 10 s, and it reports better completion for 7-15 s videos. Consequence: no voice-over, on-screen type carries the story, and a 15 s cut-down is planned for paid placements.
- **LinkedIn member posts** accepted aspect ratios from 1:2.4 to 2.4:1 and 10-60 fps. The ad spec page listed 16:9, 1:1, 4:5 and 9:16 and a frame rate under 30 fps, so plan a 30 fps (or lower) derivative and re-read the spec before buying ads.
- **App Store previews** must be screen captures of the app: no people, no hands, no device filming, 15-30 s, at most 30 fps, no prices, separate sets per localization. A film with rebuilt UI is therefore not a store preview. A store preview is a separate track: a role-played fictional meeting recorded in a demo account.
- **Google Play promo videos** are a YouTube URL; only the first 30 s autoplay, muted; at least 80 % should show the real app; no install calls to action, prices or rankings.
- **Loudness.** No platform publishes a LUFS target; the working convention is -14 LUFS integrated and -1 dBTP true peak.
- **Timing.** Tuesday to Thursday mornings; avoid the school holidays.
- **Dutch subtitle norms** gave the copy rules: at most 2 lines of about 42 characters, roughly 10-12 characters per second. These feed the reading-time formula in 02 §7.

## 8. Exit checklist for this stage

- [ ] `brief.md`: goal, one viewer, one message, proof points in order (core, payoff, support), what is *not* the message and why, CTA, formats, length, music source, the founder's dated decisions.
- [ ] `facts.md`: every on-screen claim with an ID, status and source; the do-not-use list.
- [ ] Brand/design note: real tokens with source files, contrast table, logo rules, font licence status, assets not to reuse.
- [ ] Fictional content file (`demo-meeting.md` or equivalent): names checked against real UI placeholders, no e-mail addresses, no real companies.
- [ ] Research reports kept next to the project, dated, with sources.
- [ ] Open questions answered or explicitly parked.
- [ ] Founder sign-off on facts, copy and the fictional content before anything visual starts.
