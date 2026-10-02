---
name: launch-film
description: Make a professional launch film for an app, SaaS or product with Claude Code, end to end. The result is a 30-60 s code-rendered motion-graphics video with animated app UI, kinetic type, music and sound effects, in 16:9 and 4:5 at 60 fps, with motion blur, accurate colour and -14 LUFS sound. Use this skill whenever someone wants a launch video, product or promo video, teaser, announcement, explainer, feature demo, app UI animation, motion graphics, a social video ad (LinkedIn, X, Instagram, TikTok, YouTube) or "one of those Opus/Claude-made motion videos", even if they never say "launch film". Typical requests are "make a video for my app", "we need a clip for the launch" and "animate our onboarding for an ad". The skill covers the founder quiz, competitor and USP research, a facts file, a storyboard on the music's bar grid, parallel act builds with fresh critics, the music edit and mix, the final render, QA and launch notes.
---

# Launch film

This skill makes a launch film the way the Griffel film was made: a 52-second film for a Dutch meeting-notes app, scored 7.5/10 by a fresh critic ("ship after small fixes"). Every pixel is a pure function of time in an HTML page. Headless Chrome captures the frames and ffmpeg encodes them. A loop of builders, critics who have never seen the work and per-file fixers turns a storyboard into a film. The skill writes down what worked and what failed, so the next film can be at least as good.

The work is mostly judgement, not code. The case's biggest wins came before any animation: research that changed the message, a facts file that kept every claim true, and a storyboard precise enough for five agents to build from in parallel. Its weakest scores (hook 6, pacing 6.5) were structural, and the ordering below is built to fix exactly that.

## What you deliver

| Deliverable | Spec |
|---|---|
| Hero film | 45-50 s of story (52.36 s in the case), 16:9 1920×1080 and 4:5 1080×1350, 60 fps, 8-subframe motion blur, H.264 CRF 10, BT.709 tagged, -14 LUFS integrated and at most -1 dBTP true peak, measured on the muxed file |
| Variant(s) | A different hook on the same timeline, its own music edit and its own critic |
| Derivatives | A 30 fps cut for paid ads, phone previews under 30 MB, poster PNGs (the end card), contact sheets, music-only WAVs (private, never published) |
| Docs | `brief.md`, `facts.md`, the fictional content, `storyboard.md`, one ledger per review round, and a delivery report in the human's language |

The quality bar, measured and not eyeballed (details and scripts in [references/07-qa-checklist.md](references/07-qa-checklist.md)):

- Frame 0 is a finished poster, and something moves from frame 1.
- No freeze longer than 0.6 s outside the end card (aim for 0.4 s). No single-frame spikes. Big transitions peak at a frame difference of about 6 or less (`qa_motion.py` checks all three).
- Text contrast is at least 4.5:1, measured. The brand colour is within ±2 per channel after the encode, and white is exact.
- Story-critical text is readable at 360 px feed width. Every line is held for at least (characters ÷ 12) + 0.5 s.
- The film is understandable on mute. Fictional content carries an "example" label whenever it is legible. Every claim comes from the facts file.
- The end card is a complete poster held for at least 3.5-4 s, and the music's ending lands on it.

## The kit

| Path | Read it for |
|---|---|
| [references/01-brief-research-truth.md](references/01-brief-research-truth.md) | Founder quiz, brand tokens and contrast, the facts file, competitor/USP research, claim-versus-code checks, distribution |
| [references/02-story-and-storyboard.md](references/02-story-and-storyboard.md) | Message spine, hooks, chapters, the carried object, captions, mute-first copy, feed-size minimums, the bar grid, the storyboard as build spec, variants, the end card |
| [references/03-engine.md](references/03-engine.md) | The seek(t) architecture, the Film API, `timeline.js` and `copy.js`, ownership and geometry contracts, determinism pitfalls |
| [references/04-build-and-critique.md](references/04-build-and-critique.md) | The production loop: foundation, act lanes, lens critics, triage, fixers, ledgers, verifiers, round budget, Workflow scripts |
| [references/05-render-and-encode.md](references/05-render-and-encode.md) | Draft vs final, motion blur, capture, the colour chain, encode checks, time/disk budgets, platform specs |
| [references/06-music-and-sound.md](references/06-music-and-sound.md) | Music first, licences, reading a track's structure without listening, the drop, `SCALE`, whole-bar edits, SFX, mixing |
| [references/07-qa-checklist.md](references/07-qa-checklist.md) | The measurable bar, with runnable snippets |
| [references/08-gotchas.md](references/08-gotchas.md) | Symptom → cause → fix for every pitfall the case hit |
| [references/09-case-study-griffel.md](references/09-case-study-griffel.md) | The whole case: decisions, beat sheet, scores per round, before → after fixes, numbers |
| [prompts/](prompts/) | Subagent prompt templates: `act-builder`, `act-critic`, `global-critic-lenses`, `triage`, `file-fixer`, `verifier`, `final-critic`, `usp-skeptic`, plus `founder-quiz` for the lead session |
| [assets/template/](assets/template/) | A working starter project: a 12 s example film in both formats, stills/draft/final render tools, encode and motion QA, the audio pipeline, a logo generator and `doctor.mjs` |

The worked example (the Griffel source, storyboard and critic ledgers) is at `examples/griffel/` in the kit repository, one level above this skill folder. If the skill was installed by copying only `launch-film/`, that folder is not there. In that case [references/09](references/09-case-study-griffel.md) carries the essentials, or ask the user where they cloned the kit.

Read references when their phase starts, not all up front. Each one opens with a table of contents; jump to the section you need.

## Non-negotiables, and why

1. **The facts file is law.** Every on-screen claim has an ID in `facts.md` with a status (SAFE, NEEDS CHECK, DO NOT USE) and a source. App strings are copied verbatim from the product's code, and push copy comes from the code that sends it. Check claims against the code, not the marketing site. *Why:* in the case, three claims the marketing implied were not true in the code (a name suggestion, a push message, a notes screen), and one word on the do-not-use list had already been rejected by Apple. Those were caught during research; two more of the same kind (a real placeholder that looked like a name suggestion, a done-screen text with a banned word) were caught by critics mid-build, and each cost a round.
2. **Fictional data, labelled.** Demo content is invented, carries an "example" label whenever it is legible, and never contains e-mail addresses or real people or companies. Names are checked against the product's own UI placeholders. *Why:* honesty and privacy. In the case, "Thomas" was dropped because the real name field's placeholder already said "Thomas".
3. **Every frame is a pure function of t.** No timers, `requestAnimationFrame`, `Date`, `Math.random`, CSS transitions or `will-change`, and no `translate3d()` inside the camera-scaled world (03 §10). Text whose value changes (a running timer, a counter, typed characters) takes its value from `Film.frameT(t)`, time quantised to the output frame grid. *Why:* it makes parallel capture, 8-subframe motion blur, exact critic evidence ("at 22.05 the option is not selected yet") and a late global retime (`SCALE = 120/110`) possible. Hidden state shows up as flicker, smear or a different picture depending on seek order, and an unquantised timer shows 8 different digits averaged into a grey smear in the final.
4. **One house curve.** Use `cubic-bezier(.45, 0, .15, 1)` for every morph and camera move, and vary durations instead of curves. Springs are closed-form and damped (zeta ≥ 0.9), never bouncy. Linear is only for creeps and drifts, and OS-native motion only for system UI. *Why:* one curve makes five separately built acts read as one hand.
5. **Mute-first.** No voice-over in the hero. On-screen type carries the story, at most about 5 words per line, held for the reading time. *Why:* feeds autoplay muted, and a voice-over track does not survive mute.
6. **Feed-size readability is a storyboard rule with numbers.** A 4:5 film in a phone feed is about 360 px wide. Compute every must-read element's size at that width before building (02 §8). *Why:* in the case, the payoff row was about 5 px tall at feed size until a critic measured it. It had to be lifted out of the e-mail as a large hero line.
7. **Write on the music's bar grid, and choose the track before polishing.** Put the hook, the core moment (on the drop) and the logo lock on whole bars. *Why:* only whole-bar music edits sound clean. The case was built on a 120 BPM grid for a track it never used and had to be retimed for 110 BPM tracks.
8. **One owner per file.** Each act file has one builder or fixer at a time, and `timeline.js` and `copy.js` have a single owner. Re-render once before blaming another file. *Why:* parallel fixers on shared files produced half-edited states that broke each other's renders and sent agents chasing ghosts.
9. **Critics are fresh and never told what was fixed.** They get the problem list with numeric targets and measure it themselves. *Why:* told "we fixed the logo jump", a critic confirms it. Asked "is the logo still jumping between 42.1 and 42.5?", it measures. In the case, three "fixed" items turned out to be partly fixed or still there.
10. **Ask before downloads, purchases, installs and publishing.** Get explicit approval for the exact item (track, artist, format, cost). Never pay, sign up or enter credentials. Keep licence codes and account details out of the repository. Never post, upload, publish or push. *Why:* a download can spend a licence credit, licences bind the human, and launching is the founder's act.

## The pipeline

```
1 Quiz ─> 2 Research + truth ─> 3 Storyboard + music grid ─> [human: message, facts, storyboard]
  ─> 4 Foundation ─> 5 Act builds ─> 6 Global rounds (two) ─> 7 Targeted fixes ─> [human: picture lock, music files]
  ─> 8 Music edit + sound ─> 9 Final render + QA + final critic ─> 10 Delivery + launch notes ─> [human publishes]
```

The lead session (you) owns the human, the decisions, the foundation files and the ledgers. Subagents do research, builds, critiques and fixes, and return ledgers and file paths, not working notes, so the lead's context lasts the whole project.

This is the path for a 45-50 s hero film. For a teaser of 15 s or less, or when the human wants no questions, take the short path in [Short teasers and no-questions requests](#short-teasers-and-no-questions-requests) instead.

### Phase 1 · Founder quiz, round 1

- **Read:** [prompts/founder-quiz.md](prompts/founder-quiz.md), then 01 §1-2.
- **Do:** Ask rounds of at most 4 multiple-choice questions. Each question has a recommended option and a one-line reason, so "your call" becomes a decision. Round 1 covers strategy: the goal, the one viewer, whether to research before fixing the message, and when the human reviews. Ask early which music sources the human can already use (in the case, a library purchase was researched in depth and then turned out to be unnecessary) and whether you may install tools in a new repo. Check the machine early: Node 22.12+, Chrome, ffmpeg with `zscale`, Python with numpy and Pillow, free RAM, and about 5 GB of free disk per format for a final render.
- **Output:** `docs/brief.md` with dated answers in the human's words.
- **Checkpoint:** Say what is parked and when it will be asked (for example "music licence: at picture lock"). If the human chooses "final result only", say plainly that fresh critics and measured QA become the only gates.

### Phase 2 · Research and truth

- **Read:** 01 §3-8 and [prompts/usp-skeptic.md](prompts/usp-skeptic.md).
- **Do:** Run discovery in parallel:
  - **Brand brain:** take tokens from the CSS that actually ships, not a design doc that may be stale, and compute contrast.
  - **Tooling and machine.**
  - **References and distribution:** where the audience is, platform specs, muted autoplay.
  - **Existing assets.**

  Then run the competitor pipeline: discover, profile on a fixed feature matrix, give each candidate USP to one skeptic who tries to refute it, and finish with a strategist synthesis. Run the claim-versus-code checks now, next to the facts file, not after the build. Write the fictional content file. Ask quiz rounds 2-3 (story, formats, look, sound) with options the research made possible.
- **Output:** `brief.md` with the message spine (core, payoff, support, and what is not the message and why), `facts.md`, a brand note with a contrast table, `demo-*.md`, and dated research reports.
- **Checkpoint:** The human signs off on the message, the fictional content and, item by item, every NEEDS CHECK claim they want on screen. This is where the case's message changed: privacy and "no bot" were things the closest competitor also offered, so they became setting, and "it asks you clarifying questions" became the core.
- **Case cost:** 19 agents, about 2.8M tokens.

### Phase 3 · Storyboard and music grid

- **Read:** 02 (all of it), 06 §1-5.
- **Do:**
  - **Music:** shortlist tracks from library metadata and read their structure from preview audio. This costs nothing; no purchase yet. Fix the BPM grid and the drop time.
  - **The core moment:** place it on purpose and on the drop. In the case it landed at 46 % of the film because the grid was fixed first, and the hook stayed among the lowest scores from round 3 to the final critique (6/10).
  - **Frame 0:** a finished poster.
  - **Structure:** three named chapters, and one carried object that morphs from scene to scene.
  - **Captions:** each one creates exactly the doubt the product resolves (the "Lisa bug" in 02 §5).
  - **Sizing and timing:** reading-time holds, feed-size minimums per format, whole-bar timing.
  - **Variants:** put hook variants and the 15 s cut-down in the plan now, each with a join point.
  - **End card:** treat it as a poster.

  Write the storyboard as a build spec: non-negotiables with reasons, a geometry contract in numbers, an overlay-card table, and one table per act whose rows name `T` keys, strings, facts IDs and app source files. Then run the checklist in 02 §13.
- **Checkpoint:** The human approves the storyboard and the track shortlist, or the music source decision. After this point, changing the message costs a rebuild.

### Phase 4 · Foundation

- **Read:** 03, the template's `README.md`, 04 §2, and 08 §1, §3 and §7.
- **Do:**
  - **Set up:** create the film's own repo where the human said (never build inside this skill folder), copy `assets/template/` into it, `npm install` once approved, and run `node tools/doctor.mjs`.
  - **Brand:** put the real tokens in `tokens.css` with contrast measured. Generate `src/logo.js` from the product's SVG with `tools/logo_from_svg.mjs`.
  - **Single sources:** every string goes in `copy.js`, verbatim from the product. Every time goes in `timeline.js`, on the grid, with `SCALE` if the track tempo differs.
  - **Shared parts and stubs:** shared parts (stage, phone, pushes, overlay text, touch), act stubs and hand-off framings. Remove `act-example.js` and its `<script>` tags from every page once real acts exist. Remove `index-alt.html`, `portrait-alt.html` and `COPY.variants.alt` with it, because they load the example act and would break; if you are building a hook variant now, rename them instead and point their `<script>` tags at your acts.
  - **Rebuilt screens:** rebuild app screens from the product's source and port them to seek(t), because timer-driven website mock-ups can't be seeked.

  The lead writes these files, not agents, because they are contracts. Five parallel builders cannot negotiate a coordinate system or a time grid.
- **Exit check:** Stills of both formats render with no `PAGE ERRORS`, and the seek-order test passes (03 §10), including one backward seek across the phone's exit. Every storyboard time exists in `T` and every string in `COPY`.
- **Case:** about 1.5 h in the lead session. If the human reviews at gates, show frame 0 and the end card as stills now.

### Phase 5 · Act builds

- **Read:** 04 §3 and §14-15, [prompts/act-builder.md](prompts/act-builder.md), [prompts/act-critic.md](prompts/act-critic.md).
- **Do:** Run one lane per act file, all lanes in parallel: builder → fresh act critic → act fixer. The critic returns JSON and never sees the builder's report. Fold each lane's "changes for other owners" into the foundation. Render drafts of both formats afterwards.
- **Case:** 5 lanes, 15 agents, about 4.3M tokens, about 1.5 h.

### Phase 6 · Global critic rounds (budget: two)

- **Read:** 04 §4-10, 07 §14, [prompts/global-critic-lenses.md](prompts/global-critic-lenses.md), [prompts/triage.md](prompts/triage.md), [prompts/file-fixer.md](prompts/file-fixer.md).
- **Do:** Each round runs these steps:
  1. Render drafts of both formats.
  2. Three lens critics run in parallel:
     - **Story and message:** a first-time viewer, sound off, in a feed.
     - **Motion and technical:** measured frame differences and the camera path.
     - **Brand, truth, format and feed size.**
  3. A fresh triage agent dedupes the notes and resolves conflicts against the storyboard, then the brief, then the facts. It drops notes with written reasons and gives each kept note one owner.
  4. The foundation fixer runs first, then the act fixers in parallel.
  5. Write `ledger-roundN.md` and `roundN-problems.json`. From the second round on, critics verify the previous problems with their own evidence.
- **Stop rule:** Stop when the lowest score stops moving or the remaining notes need a restructure. Take those notes to the human as a decision (a variant, a cut-down, a different hook) instead of running another round.
- **Case:** about 3M tokens and 1.2-1.5 h per round. Scores went 6 → 7 over three rounds, with diminishing returns after round 3. The case's critics kept saying the strongest moment came too late, and the answer was a question-first variant, not a fifth round.

### Phase 7 · Targeted fixes and picture lock

- **Read:** 04 §11, [prompts/file-fixer.md](prompts/file-fixer.md) (targeted variant), [prompts/verifier.md](prompts/verifier.md).
- **Do:** Turn the remaining problems into a short list. Each item names the problem, its owner files, the measured symptom and a numeric target (for example "max frame difference ≤ 6 in 41-43.5 s"). Run the fixers in parallel on disjoint files. A fresh verifier then checks every target in both formats and scans the whole film for regressions.
- **Checkpoint: picture lock.** Ask the human to approve the exact music files (track, artist, format) and to buy the licence if one is needed. Buying at picture lock matters: several library licences forbid new versions after you cancel. Download only after an explicit yes for those files, and finish every cut inside the paid period.

### Phase 8 · Music edit and sound

- **Read:** 06 §4-12 and 08 §6.
- **Do:**
  - **Measure:** confirm the BPM from the audio, measure the drop to 20 ms with `find_drop.py`, and set `SCALE = grid BPM / track BPM` exactly. The case's first `SCALE = 1.1` left the logo lock a third of a beat late.
  - **Cues and edit:** regenerate cues from the film (`events.mjs`). Write an EDL whose jumps are whole bars.
  - **Sound:** add a "next room" low-pass that opens on the drop, synthesise the SFX, then mix to -14 LUFS with `mix_edl.py`. The template's mixer caps the WAV at -1.5 dBTP (`target_tp` in the EDL) to leave headroom for the AAC encode. A film with sound effects only uses `"music": null`; it cannot reach -14 under the ceiling, and that is fine (06 §10).
  - **Check after muxing:** measure again on the muxed MP4 (07 §6). The case's original edit measured -0.8 dBTP after muxing although its WAV passed at -1.0; that is why the template's default ceiling is -1.5.
  - **Keep it private:** licensed WAVs go in a git-ignored folder, and licence codes in a private note outside the repo.

### Phase 9 · Final render, QA and the final critic

- **Read:** 05, 07, 08 §3-5, [prompts/final-critic.md](prompts/final-critic.md).
- **Do:**
  - **Render:** render finals only after the music is aligned, because a change of `SCALE` throws them away. Each final is a 480 fps capture with one Chrome per worker, an 8-subframe 16-bit blend, the explicit BT.709 chain and CRF 10, without `-tune animation`.
  - **Check:** run `check_encode.py`, `qa_motion.py`, loudness on the muxed file, frame counts, feed-size stills and the facts/privacy grep (07 §11).
  - **Final critic:** a fresh critic judges the final render, and its score goes into the delivery report unedited. Then make small fixes, run the verifier and re-render the affected files.
- **Case:** about 20-25 min per final file on a 12-thread laptop with 4 workers, and about 4.5 GB of temporary disk per format. The four finals ran back to back in about 80 min.

### Phase 10 · Delivery and launch notes

- **Read:** 04 §16, 05 §9-10, 01 §7, 07 §13.
- **Do:**
  - **Derivatives:** a native 30 fps render for LinkedIn ads (`node tools/render.mjs 45 final --fps 30`, which also sets the page's `T.OUT_FPS` so timers stay sharp), phone previews under 30 MB, posters and contact sheets.
  - **Delivery report** in the human's language:
    1. What is delivered.
    2. The film as a time table.
    3. How it was made.
    4. Honest quality: the final critic's score, the lowest sub-scores, what was fixed only partly.
    5. Measured QA.
    6. What only a human can check.
    7. What is deliberately not in the film.
    8. Next steps.
  - **Launch notes:**
    - **Where:** on LinkedIn, a native upload from the founder's personal profile, with the company page resharing later.
    - **When:** Tuesday to Thursday mornings, avoiding school holidays. Re-check every platform claim, because the case's research is dated 2026-10-01.
    - **Not a store preview:** a film with rebuilt UI is not an App Store preview. Those must be real screen captures, which is a separate track.
- **Checkpoint:** The human watches the 4:5 in the real feed app as a private draft, muted, on a phone. They judge the music by ear, confirm that the UI matches the store build, and publish. You do not.

## Short teasers and no-questions requests

The pipeline above is sized for a 45-50 s film, five acts and a human at four checkpoints. A teaser of 15 s or less needs a fraction of it. One test made a 10 s 4:5 teaser with sound effects only from the template, in about 28 minutes including renders; everything below comes from that test and the case, not from a shipped teaser.

**What to keep and what to skip:**

| Phase | Teaser |
|---|---|
| 1 Quiz | One round at most: goal, viewer, format, music or sound effects only. |
| 2 Research | Skip the competitor pipeline. Keep the facts file and the claim-versus-code checks for every claim on screen, because a short film is no less public. |
| 3 Storyboard | One table: beats with times, strings, facts IDs and app source files. Use a bar grid only if there is music. |
| 4 Foundation | As in the full path, including removing the example act and the alt pages. |
| 5 Act builds | One act, built by the lead. No lanes. |
| 6 Global rounds | Skip, or run one fresh critic with all three lenses in one prompt. |
| 7-8 Fixes and sound | Targeted fixes. With no music, mix the cues with `"music": null` (06 §10). |
| 9 Final | The same render and QA. A fresh final critic is still worth it before anything is published. |
| 10 Delivery | A short report: the files, the measured QA, the assumptions, what a human must check. |

Minimum docs: `brief.md`, `facts.md` and the one-table storyboard.

**Proportions for 10 s** (stretch them for 15 s):

| Beat | Time | Why |
|---|---|---|
| Hook | 0-2.0 s | A finished poster on frame 0, one line, as few characters as you can manage |
| Product beat | 2.0-5.5 s | The core moment (the tap, the drop) at about 40 %, around 4.0 s; a statement line may share it |
| Hand-over | 5.5-6.5 s | The phone leaves while the logo builds in place |
| End card | complete by 6.5 s, held to 10.0 | At least 3.5 s complete: it is the poster and the call to action |

**When the reading-time formula does not fit.** In 10 s it usually can't all be met. The test's 25-character hook wanted 2.6 s and got 1.9, its statement wanted 2.2 s and got about 2.0, and its end card was held 3.1 s instead of 3.5. Trade in this order:

1. **Cut characters first.** The formula counts characters, so a 15-character hook needs 1.75 s where a 25-character one needs 2.6.
2. **Keep the end card's full hold.** Cut a beat before you cut the poster.
3. **Let only a redundant line run short.** A line the UI also shows (the statement under a visible result, for example) can run short at little cost. A line that alone carries the message cannot; shorten it or drop the beat.
4. **Never under 1 s** for any line.
5. **Write it down.** Put each line's hold next to its formula target in the delivery report.

**Motion gets faster in short films.** Compressed moves raise the frame difference, which scales with 1/duration. In the test, a 0.45 s phone fade at zoom 1.6 peaked at 9.6 and a 1.1 s push at 7.9. Stretched to 0.7 s and 1.45 s, both came down to about 6.9, and getting under 6 would have taken time the 10 s didn't have. Prefer fewer moves to faster ones, and run `qa_motion.py` (its `--peak-max` check lists the offenders). The hand-over is the tightest spot: render stills every 0.1 s across it and check that the arriving logo never crosses legible UI. In the test, the logo tile overlapped the fading phone's title for about 0.35 s.

**No-questions requests.** If the human says "just make it" or cannot answer:

- Take the recommended option for every quiz question and write each one in `brief.md` marked as an assumption, with the date.
- Put only SAFE facts on screen that you checked in the code yourself, never a NEEDS CHECK claim.
- List the assumptions at the top of the delivery report, so the human can overrule them all in one pass.

The other non-negotiables still hold: fictional data with an "example" label, nothing downloaded, bought or published without an explicit yes.

## Budget expectations

What the case cost (about 48 s of film, two formats, five acts, one variant):

| Phase | Agents | Tokens | Wall clock |
|---|---|---|---|
| Discovery research | 5 | about 0.8M | |
| Competitor and USP research | 14 | about 2.0M | not recorded |
| Foundation | lead session | | about 1.5 h |
| Act builds (5 lanes) | 15 | about 4.3M | about 1.5 h |
| Global rounds 2, 3, 4 | 10 each | 2.9M, 3.0M, 2.7M | 1.2-1.5 h each |
| Time scale, variant, its critic and fixer | 4 | about 1.0M | about 1.5 h |
| Final critic, targeted fixes, verifier, music, renders | | not itemised | |
| **Total** | | **about 20M subagent tokens** | **about 18 h**, much of it unattended overnight |

Planning numbers:

- **Per agent:** one agent in this loop costs roughly 0.3M tokens. A global round is about 10 agents.
- **Two-round plan:** an estimate that was not measured: research about 3M, act builds about 0.9M per act, two global rounds about 6M, then targeted fixes, the final critic and the verifier. For five acts that is about 14-16M tokens, a few million less than the case.
- **Render times:** stills take seconds and drafts 3.5-7.5 min per format. A final takes about 20-25 min per file, so render finals as a batch at the end. On Windows, Chrome sometimes took about two minutes to close after the last frame was on disk; the template's capture logs when each worker finishes and kills Chrome after 5 s (08 §3).
- **Machine limits:** the case ran on a 12-thread Windows laptop with 1.5-3 GB of free RAM. That is why stills calls are capped at about 36 frames and finals run with 4 workers.
- **Time:** tell the human early that a film like this is a day of wall-clock time, not an hour. Run rounds in the background and don't poll them.

If the budget is tighter, cut rounds before you cut truth. The case's facts work held up from the first global round (copy 9/10, facts 8/10 in round 2), while rounds 3 and 4 each cost about 3M tokens for small gains. A smaller version that still works is three acts, one global round, targeted fixes and a final critic. That is a recommendation derived from the case, not something it tested.

## Variants, cut-downs and formats

- **Hook variants** share the timeline; only the opening differs.
  - **Pages:** each variant is a page pair (`index-<v>.html`, `portrait-<v>.html`) that sets `window.VARIANT`. Variant code registers only when the variant matches, so the original pages stay pixel-identical.
  - **Join point:** define the moment where the variant becomes the original film (film 3.2 s in the case), and end the variant's camera on a framing that already sits on the original's camera path. Otherwise the join yo-yos.
  - **Redundant lines:** remove lines the new hook makes redundant. The case's variant otherwise said its promise four times.
  - **Sound and review:** each variant gets its own music edit and its own fresh critic. The case's variant critic found problems no critic of the original could have seen.
  - Details are in 02 §11 and 03 §12. The template ships this pattern as `index-alt.html` and `portrait-alt.html`, and `node tools/render.mjs 169 final --variant alt` renders it.
- **The 15 s cut-down** for paid placements was recommended in the case but not built. The plan in 02 §11 runs from the vague line, to the question and the tap, to the payoff row, to the end card: 7 bars at 110 BPM, 15.27 s. Building it from the hero's own bar-aligned segments should avoid new animation, but that is untested. Say so if you do it.
- **Formats:** 16:9 and 4:5 are authored on one timeline with per-format layouts, and 4:5 is the feed deliverable. 9:16 needs a third layout in `LAYOUTS` (`src/film.js`) and per-format branches in the acts; the template has not done that yet.
- **Frame rates:** LinkedIn ads want under 30 fps, so make a 30 fps derivative. Re-read each platform's spec before buying ads.
- **Languages:** the film's first language is the language of the product's output, because that UI is the proof. A translation means swapping `copy.js`. Then re-run the reading-time and feed-size checks, because line lengths change.

## Adapting beyond the case

- **A web or SaaS product rather than a phone app.** The template's device is a CSS phone with a 393×852 logical screen. A browser-frame part with the same contract (a logical screen, a screen-to-world mapping, a status/chrome layer) should work. The case did not test it, so build it in the foundation and seek-order-test it before the act lanes start.
- **No music licence yet.** Build and review with synthesised SFX and the template's `make_test_track.py`, a 120 BPM test track that matches `edl.example.json`. Never ship the test track.
- **The human wants to review often.** Gate at brief + facts, storyboard, key stills (frame 0, the core moment, the end card), picture lock and the final. Present stills, not drafts; they are faster to judge.
- **The human cannot answer code-level questions.** The claim checks still run, because agents read the product repo. Ask for read access to the product source, and to the website source for the real tokens.

## Running the loop

- **Workflow tool:** if your Claude Code has it, each round is one script. Load the `workflow-authoring` skill for the current API before writing one. 04 §12 has the shapes the case ran: act lanes as a `pipeline`, a global round with the foundation fixer first, and targeted fixes plus a verifier.
- **Plain subagents:** spawn every lane in one message, paste the JSON schema into each critic prompt and ask for raw JSON only. Give triage to a fresh agent, never to the lead (04 §13).
- **Agent hygiene:**
  - Use absolute paths, and have agents `cd` into the repo inside each shell command.
  - Give each agent its own output folder (`renders/<round>/<owner>-<format>/`).
  - Agents get no git and no installs; the lead commits between rounds.
  - At most about 36 stills per call, and every agent looks at its PNGs with the Read tool.
- **Before each tool:** scan the matching section of [references/08-gotchas.md](references/08-gotchas.md). Most pitfalls were quick to fix once understood; finding them was the expensive part.

## Working with the human

- Their attention is the scarcest resource. Ask blocking questions first, always with a recommended default, and never more than four at a time.
- Send short status messages at milestones: foundation done, acts built, each round's scores.
- Ask about decisions explicitly; never bury them in a report. These include downloads and purchases (exact files), NEEDS CHECK claims, installs, and structural changes such as a variant or a re-cut.
- Report quality honestly with numbers: the fresh critic's score, the weakest sub-scores, what was only partly fixed and what was deliberately left out. Ask for concrete, timecoded feedback ("at 0:12, calm the camera"); it is the most useful kind.
