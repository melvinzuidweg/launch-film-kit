# 04 · Build and critique: the production loop

The film is not made in one long session. A lead session writes the shared foundation, then many short-lived agents build, judge and fix it in rounds. Quality comes from three things working together: critics that have never seen the work, a triage step that protects the concept and the facts, and strict file ownership so parallel fixers do not break each other.

This file describes the loop as it ran on the Griffel film, what we would change, and how to run it with the Claude Code Workflow tool or with plain subagents. The prompt templates live in [`../prompts/`](../prompts/).

## Contents

1. [The loop at a glance](#1-the-loop-at-a-glance)
2. [Foundation first](#2-foundation-first)
3. [Act builds: builder, fresh critic, fixer](#3-act-builds-builder-fresh-critic-fixer)
4. [Draft renders between rounds](#4-draft-renders-between-rounds)
5. [Global critic rounds: three lenses](#5-global-critic-rounds-three-lenses)
6. [Triage](#6-triage)
7. [Per-file fixers](#7-per-file-fixers)
8. [Ledgers](#8-ledgers)
9. [Verification without leading the witness](#9-verification-without-leading-the-witness)
10. [Round budget and diminishing returns](#10-round-budget-and-diminishing-returns)
11. [Targeted fixes and the final critic](#11-targeted-fixes-and-the-final-critic)
12. [Running it with the Workflow tool](#12-running-it-with-the-workflow-tool)
13. [Running it with plain subagents](#13-running-it-with-plain-subagents)
14. [Collision rules](#14-collision-rules)
15. [Stills and measurements for agents](#15-stills-and-measurements-for-agents)
16. [What to report to the human](#16-what-to-report-to-the-human)

---

## 1. The loop at a glance

```
brief, facts, storyboard, music grid (01, 02, 06)
        │
        ▼
FOUNDATION ── lead session: engine, film, timeline, copy, shared parts, tools, storyboard as spec
        │
        ▼
ACT BUILDS ── one lane per act file, all lanes in parallel:
        │       builder ──> fresh act critic (JSON) ──> fixer
        │     lead collects the "for other owners" requests for the foundation, renders drafts of both formats
        ▼
GLOBAL ROUND (2 broad rounds recommended)
        │       3 lens critics in parallel ──> triage ──> foundation fixer ──> act fixers in parallel
        │     lead writes the ledger and a problems-only list for the next round, renders new drafts
        ▼
TARGETED FIXES ── named problems with numeric targets ──> fresh verifier
        ▼
FINAL RENDER ──> final fresh critic ──> small fixes ──> verifier ──> deliver (see 07, 05)
```

What it took on the Griffel film (about 48 s of film in two formats). The ledger files are in [`examples/griffel/docs/ledgers/`](../../examples/griffel/docs/ledgers/); their numbering is the case's: round 1 is the act-level fix pass, rounds 2-4 are the global rounds, round 5 the targeted fixes.

| Phase | Ledger | Agents | Tokens | Wall clock |
|---|---|---|---|---|
| Foundation | – | lead session | – | about 1.5 h |
| Act builds (5 lanes × builder, critic, fixer) | `ledger-round1.md` | 15 | about 4.3M | 1.6 h |
| Global round 2 | `ledger-round2.md` | 10 (3 critics, triage, 6 fixers) | about 2.9M | 1.2 h |
| Global round 3 | `ledger-round3.md` | 10 | about 3.0M | 1.5 h |
| Global round 4 | `ledger-round4.md` | 10 | about 2.7M | 1.5 h |
| Targeted fixes + verifier | `ledger-round5.md` | 6 | – | 1.0 h |
| Time scale + variant + critic + fixer | `ledger-variant-vraag.md` | 4 | about 1.0M | 1.5 h |

In total about 20M subagent tokens over about 18 hours of wall clock, much of it running autonomously overnight. A useful planning number: one agent in this loop costs roughly 0.3M tokens.

## 2. Foundation first

The lead session writes everything the parallel builders must agree on before any builder starts. In the case this took about 1.5 hours:

- `engine.js`, `film.js` (see [`03-engine.md`](03-engine.md));
- `timeline.js` with every act window, every overlay card time and the key moment on the music grid;
- `copy.js` with every string, app strings verbatim from the product source;
- the shared parts: stage, phone, touch dot, push banners, overlay text;
- `tools/still.mjs`, so every agent can render evidence from the first minute;
- the act files as stubs;
- `docs/storyboard.md` as a build spec: non-negotiables, the geometry contract, the ownership rules, and one table per act with a row per event, its time and the real app source to mirror.

Why the lead and not an agent: these files are contracts. Five builders working in parallel cannot negotiate a coordinate system, a type system or a time grid; whatever they each invent will not fit together. The lead also has the whole context of the brief and research, which the builders only get through the storyboard.

Before spawning builders, check:

- Stills of both formats render at a few times with no `PAGE ERRORS`.
- Every time the storyboard mentions exists in `T`; every string exists in `COPY`.
- The geometry contract has numbers, not descriptions (anchor points, box sizes, hand-off framings).
- The non-negotiables say why, so a builder can make judgement calls (see the storyboard in `examples/griffel/docs/storyboard.md`).

## 3. Act builds: builder, fresh critic, fixer

Each act file gets its own lane, and all lanes run in parallel. Within a lane, three agents run in sequence:

1. **Builder** ([`prompts/act-builder.md`](../prompts/act-builder.md)). Reads the storyboard, the foundation files and the real app sources for its screens. Builds its act at the quality bar ("layered motion, land slowly and leave fast, nothing frozen longer than about 0.6 s, every action produces a visible result, frame-perfect hand-offs at the window edges"). Renders stills of its window in both formats plus phone-size singles, looks at them, iterates. Reports what it built, its signature moment, any `timeline.js` change it needs (without editing it) and known weaknesses.
2. **Fresh act critic** ([`prompts/act-critic.md`](../prompts/act-critic.md)). Has not seen the build, does not read the builder's report, renders its own stills, and returns JSON: seven scores, a ranked list of problems with time, format and an exact fix, and a verdict.
3. **Fixer** (the second prompt in `act-builder.md`). A new agent with the builder's brief plus the critic's scores and ranked problems. Fixes the biggest first; when a note conflicts with the storyboard, follows the storyboard and says so. Re-renders, then returns a ledger table: problem, fixed / partly / not fixed, what changed, plus requests for other owners.

Why a pipeline rather than three parallel phases: each lane moves on as soon as its own builder finishes, so a slow act does not hold up the critics of the others.

What came out of it in the case: every act fixer had problems it could not fix inside its own file (overlay card timings, a shared push banner's exit curve, the touch dot's fade). Those went into the reports as "changes for other owners" and were folded into the first global round's foundation work (its triage cites them next to the new critic notes). Act fixers also found two real engine bugs while fixing their own act (fonts measured before load, `visibility: visible` overriding a hidden parent; see `03-engine.md` §10).

## 4. Draft renders between rounds

Global critics judge a rendered draft video of each format, not the source. A draft is 60 fps without motion blur, with temporary synthesized sound effects if the music is not in yet; it took about 3.5 minutes per format in the case (see [`05-render-and-encode.md`](05-render-and-encode.md)). Critics also render exact stills with the stills tool when they need a specific frame. Render drafts of both formats before every global round: the 4:5 version is the feed version and gets its own problems.

## 5. Global critic rounds: three lenses

Three critics run in parallel on the whole film, each with one lens ([`prompts/global-critic-lenses.md`](../prompts/global-critic-lenses.md)):

| Lens | Watches as | Scores |
|---|---|---|
| **Story and message** | a first-time viewer from the target audience, sound off, in a mobile feed | hook in the first 2 s, understandable on mute, core message lands, payoff clarity, pacing, end card as poster, copy and tone, truth against the facts file |
| **Motion and technical** | a motion director with a measuring tape | smoothness (measured frame-difference spikes and frozen runs), hand-offs, camera continuity at act boundaries, layering, easing consistency, polish |
| **Brand, truth and format** | the brand owner and a fact checker | brand tokens and measured contrast, logo colours, UI fidelity against the real app source, the "example" label, no personal data, unmodified store badges, a full pass of the second format, readability at 360 px wide |

Why lenses instead of one critic: a single critic averages everything into "pretty good, one more pass" and spends its attention where the film is loudest. Separate lenses find different failures. In round 2 the story lens found that the core message never landed as one image at feed size (the thesis line readable for about 1.1 s, the payoff row about 5 px tall), the motion lens measured the light-to-dark iris as the largest frame difference in the film, and the brand lens sampled the encoded video and found the brand green shifted, plus a real placeholder in the app that read as a feature the film must not show.

Every critic returns the same JSON shape: scores, a verification list (from the second global round on, §9), problems with severity 1-3 (must, should, polish), time, format, the problem, a concrete fix and the file it probably belongs to, and a verdict. They also name the three biggest creative weaknesses (a `creative_weaknesses` field in the schema, so a schema-validated run keeps them), because "a video with no bugs is not the same as a good video". The verdict may only be "ship" if every score is 8 or higher.

## 6. Triage

A director agent ([`prompts/triage.md`](../prompts/triage.md)) gets all critic JSON and turns it into work:

- **Deduplicate.** The three lenses often describe one fault from three sides.
- **Resolve contradictions** against the storyboard, the brief and the facts file, in that order. Critics contradict each other (one wanted a caption larger, another wanted it below the sub size); the spec decides.
- **Drop** notes that would invent features or claims, break the concept, or break a house rule. Every dropped note goes into a "skipped" list with its reason.
- **Prioritise** what raises the lowest scores, not the most notes.
- **Assign each kept note to exactly one owner file group.** If a fix needs a `timeline.js` change and an act change, the time goes to the foundation group and the visual part to the act, and each fix text mentions the other.

The skipped list is the most valuable part of a triage. It is the defence against critic churn: the same suggestions come back every round, and the reasons show why they were rejected. Typical reasons from the case:

- moves an event off the whole-bar music grid;
- breaks a house rule (an accelerating ease for a snap, a bouncy over-scale on a selection the real app renders flat);
- fakes UI (a new chip inside a mail-client row, replacing a real e-mail preheader with nicer text);
- an ungrammatical or misattributed callback line;
- a late restructure that ripples through every act ("pull this chapter forward 5 s"), proposed in two rounds and rejected both times as too risky inside a polish round;
- a global camera filter late in the project, which would shift framings other acts had measured;
- "16:9 is unreadable at mobile-feed width" (a delivery-spec note: feed placements use 4:5).

Late in the project the triage prompt gets stricter: "this is the final polish round; keep only fixes that can be done safely and verified in one pass; no restructuring, no timing changes that ripple across acts unless severity 1".

When a structural note keeps coming back, it is usually right but does not belong in a polish round. In the case, the critics kept saying the strongest moment arrives too late (at 22 s). Triage was right to refuse a restructure; the answer came outside the loop, as a question-first variant on the shared timeline. Surface such notes to the human as a decision.

After triage, the lead saves the kept problems, problems only, as `roundN-problems.json` for the next round's verification.

## 7. Per-file fixers

One fixer per owner group ([`prompts/file-fixer.md`](../prompts/file-fixer.md)). Each may edit only its files, knows others are editing at the same time, fixes notes in severity order, verifies with stills of the affected moments in both formats (including the hand-offs just outside its window), and returns a ledger table plus "anything another owner must still do".

**Run the foundation group first, then the act groups in parallel.** In the case all fixers of a round ran in parallel, although the triage plans said "foundation first". The foundation fixer changed `timeline.js` while act fixers were rendering stills against it, and acts read `T` at runtime, so some act fixers verified against times that changed under them. Sequencing costs the foundation fixer's wall clock and removes that whole class of confusion.

In the last rounds, add "make safe, verified changes only; when in doubt, leave it and report it". A fixer that half-finishes an ambitious change the night before the final render is worse than one that reports the problem.

## 8. Ledgers

After each round the lead writes `docs/ledger-roundN.md`:

1. **Triage summary:** the film's state in five lines, the lowest score, the plan.
2. **Skipped:** every dropped note with its reason.
3. **One section per owner:** the fixer's ledger table (note → fixed / partly / not fixed → what changed), remaining known issues, requests for other owners, where its stills are.

Ledgers serve the human (they show what the money bought) and the lead (they are the input for the next round's planning). They are **not** given to critics. Fixers also keep a copy of their file from before the pass in a scratch folder, so a regression can be diffed.

## 9. Verification without leading the witness

From the second global round on, critics get the previous round's problems-only list and must report each item relevant to their lens as fixed, partly or still there, with their own evidence. They never see the fixers' ledgers or anyone's claim about what was fixed.

Why: a critic told "we fixed the logo jump" looks at the logo, sees it moved less, and confirms. A critic asked "is the logo still jumping between 42.1 and 42.5?" measures it. Fixers are honest but measure what they changed, the way they changed it:

- Round 2's act A fixer reported the frozen stretch in the recording act as fixed (an even camera creep). In round 3, two critics independently flagged 7.9-9.6 s as still near-frozen in 16:9.
- In the targeted round, a fixer reported the recipient chips in 16:9 as fixed, measured at full resolution (26-28 px). The verifier checked at feed size: at 360 px wide they were pills with 4-5 px text, in both formats.
- The same verifier measured a question screen's readable time at 0.95-1.1 s against a 1.2 s target, and found the touch dot arriving 0.3 s before the tap, so the screen was untouched for only about 0.65 s.
- It also found minor things nobody had listed: a status screen that still said "on its way" while the e-mail was already open, a near-still 0.4 s during a camera push.

The same principle applies to the act critics in §3: they do not read the builder's report.

## 10. Round budget and diminishing returns

Scores in the case:

| Round | Overall | Lens scores (story / motion / brand) | Weakest sub-score |
|---|---|---|---|
| Global round 2 | 6 | 6 / 5 / 7 | – |
| Global round 3 | – | 7 / 6 / 7 | camera, 5 |
| Global round 4 | 7 | 7 / 7 / 7 | hook, pacing, polish, 6 |
| Final fresh critic (on the final render) | 7.5 | – | hook 6, pacing 6.5; verdict "ship after small fixes" |
| Verifier after 5 targeted fixes | 7.5 | – | no regressions |

Read each row as "the critics of round N judging the film after the previous round's fixes". Round 2's fixes lifted the lens scores from 6/5/7 to 7/6/7. Round 3's fixes (about 3.0M tokens) lifted the weakest sub-score from 5 to 6, and the overall stayed at 7. Round 4's fixes (about 2.7M tokens) plus the final render with motion blur ended at 7.5. The final critic's strongest scores were payoff, brand and UI fidelity and the end card (8.5 each) and mute comprehension (8). The weakest were structural, not polish: the strongest moment arrives at 22 s, and real app UI elements such as recipient chips are small at feed size by nature.

The budget we recommend:

- **Two broad global rounds.** The first catches the big faults, the second verifies them and catches what the fixes broke.
- **Then targeted fixes only** (§11), each with a measured target.
- **One final fresh critic on the final render**, then small fixes and a verifier.
- **Stop polishing when the lowest score does not move between rounds**, or when the remaining notes need a restructure. Take those to the human as a decision (a variant, a cut-down, a different hook) instead of a fifth round.

Scores of 8+ from every critic did not happen in the case. A critic benchmarked against "Linear, Things, Apple product films" is a demanding bar, and the scores are most useful as a relative measure between rounds.

## 11. Targeted fixes and the final critic

After the broad rounds, the lead turns the remaining problems into a short list of named fixes, each with owner files, the measured symptom and a numeric target. From the case:

| Fix | Owner | Symptom | Target |
|---|---|---|---|
| logo lurch | act E | the mark jumps about 290 px up and shrinks to 70 % in 0.35 s; worst frame difference 10.0 | max 60 fps frame difference ≤ 6 in 41-43.5 s; no static lull |
| light change | act B | a white disc expands from the phone (reads as an iris); about 7.5 frame difference for 0.3 s | ≤ 5 in 9.7-10.8 s; no bright blob |
| drop crowding | act C, timeline, overlay text, copy | four events in 1.2 s around the key moment | second question readable ≥ 1.2 s; thesis line starts about 24.0 |
| hook motion | act A | mean frame difference 0.20-0.22 over the first 1.8 s: reads as a static text post | mean ≥ 0.5 from frame 1 without spikes |
| payoff polish | act D | half-cut phone, a preheader truncated mid-word | none of either; no lull > 0.4 s in 27.4-35 s |

In the case these five came from the final fresh critic's top five, judged on a motion-blurred render before the music was in; the order above (broad rounds, targeted fixes, then picture lock, music and a final critic on the real final) is what we recommend, so the final critic sees what the viewer will see.

The fixers run in parallel (one per row, disjoint files), then a fresh verifier ([`prompts/verifier.md`](../prompts/verifier.md)) checks each problem in both formats against its target, scans the whole film at 1 s steps for regressions, and gives a score. In the case: three fixed, two partly, no regressions, 7.5.

The final fresh critic ([`prompts/final-critic.md`](../prompts/final-critic.md)) judges the final render with motion blur. Its prompt says the score goes into the delivery report for the founder, which keeps it honest. It returns scores, the five most important remaining problems, the three strongest moments, and one of three verdicts: ship as-is, ship after small fixes, needs another round.

## 12. Running it with the Workflow tool

If your Claude Code has the Workflow tool, each round is one script. Load the `workflow-authoring` skill for the current API before writing one; the shapes below are what we ran (API as of October 2026): `agent(prompt, {label, phase, schema})` returns the agent's final answer (parsed JSON when a schema is given, possibly `null` on failure), `parallel(fns)` runs thunks concurrently, `pipeline(items, ...stages)` runs each item through the stages independently, and `phase(title)` groups the progress display.

### Act builds

```js
export const meta = {
  name: 'film-build-acts',
  description: 'Build every act in parallel, each followed by a fresh critic and one fix pass',
  phases: [{ title: 'Build' }, { title: 'Critique' }, { title: 'Fix' }],
}

const REPO = '{REPO}'                                   // absolute path to the film project
const COMMON = `...`                                    // shared rules: prompts/act-builder.md, "Common block"
const ACTS = [
  { key: 'a', title: 'Act A: hook + recording (0.0-10.6)', win: [0, 10.6], refs: '<app source files>' },
  { key: 'b', title: 'Act B: processing + naming (9.8-16.6)', win: [9.6, 16.8], refs: '...' },
  // one entry per act file; win = the act window plus about 0.2 s margin for the hand-offs
]

const CRIT_SCHEMA = {
  type: 'object',
  properties: {
    scores: { type: 'object', properties: {
      spec_fidelity: { type: 'integer' }, ui_fidelity: { type: 'integer' }, motion_quality: { type: 'integer' },
      readability_phone_size: { type: 'integer' }, composition_both_formats: { type: 'integer' },
      brand_and_truth: { type: 'integer' }, handoffs: { type: 'integer' } } },
    problems: { type: 'array', items: { type: 'object', properties: {
      rank: { type: 'integer' }, t: { type: 'string' }, format: { type: 'string' },
      problem: { type: 'string' }, fix: { type: 'string' } },
      required: ['rank', 't', 'format', 'problem', 'fix'] } },
    verdict: { type: 'string', enum: ['ship', 'one more pass'] },
  },
  required: ['scores', 'problems', 'verdict'],
}

const results = await pipeline(
  ACTS,
  (act) => agent(builderPrompt(act), { label: `build:${act.key}`, phase: 'Build' }),
  // the critic gets the act, never the builder's report (the `report` argument is ignored on purpose)
  (report, act) => agent(criticPrompt(act), { label: `critic:${act.key}`, phase: 'Critique', schema: CRIT_SCHEMA }),
  (crit, act) => agent(actFixerPrompt(act, crit), { label: `fix:${act.key}`, phase: 'Fix' }),
)
return ACTS.map((a, i) => ({ act: a.key, ledger: results[i] }))
```

### A global round

```js
const PROBLEMS = {                                       // full schema: prompts/global-critic-lenses.md
  type: 'object',
  properties: {
    scores: { type: 'object', additionalProperties: { type: 'integer' } },
    verification: { type: 'array', items: { type: 'object', properties: {
      problem: { type: 'string' }, status: { type: 'string', enum: ['fixed', 'partly', 'still there'] },
      evidence: { type: 'string' } } } },
    problems: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'integer' }, t: { type: 'string' }, format: { type: 'string', enum: ['16:9', '4:5', 'both'] },
      problem: { type: 'string' }, fix: { type: 'string' }, likely_file: { type: 'string' } } } },
    creative_weaknesses: { type: 'array', items: { type: 'string' } },   // the "3 biggest" line in the wrapper
    verdict: { type: 'string', enum: ['ship', 'one more pass'] },
  },
  required: ['scores', 'verification', 'problems', 'creative_weaknesses', 'verdict'],   // round 1: drop 'verification'
}
const LENSES = [{ key: 'story', prompt: '...' }, { key: 'motion', prompt: '...' }, { key: 'brand', prompt: '...' }]

phase('Critique')
const crits = await parallel(LENSES.map((l) => () =>
  agent(lensPrompt(l, { problemsFile: `${REPO}/docs/round${N - 1}-problems.json` }),
        { label: `critic:${l.key}`, phase: 'Critique', schema: PROBLEMS })))

phase('Triage')
const triage = await agent(triagePrompt(crits.filter(Boolean), { finalPolish: N >= 3 }),
                           { label: 'triage', phase: 'Triage', schema: TRIAGE })   // schema: prompts/triage.md

phase('Fix')
const groups = (triage?.groups ?? []).filter((g) => g.items?.length)
const foundation = groups.find((g) => g.owner === 'foundation')
const ledgers = []
if (foundation) {                                        // foundation first: acts read T and COPY at runtime
  ledgers.push({ owner: 'foundation',
                 ledger: await agent(fixerPrompt(foundation), { label: 'fix:foundation', phase: 'Fix' }) })
}
const actGroups = groups.filter((g) => g !== foundation)
const actLedgers = await parallel(actGroups.map((g) => () =>
  agent(fixerPrompt(g), { label: `fix:${g.owner}`, phase: 'Fix' })))
actGroups.forEach((g, i) => ledgers.push({ owner: g.owner, ledger: actLedgers[i] }))

return { triage, ledgers, crits }
```

The lead then writes `ledger-roundN.md` from `triage` and `ledgers`, saves the kept problems as `roundN-problems.json`, renders new drafts, and looks at a contact sheet itself before starting the next round.

### Targeted fixes plus a verifier

```js
const FIXES = [
  { key: 'logo', files: 'src/parts/act-e.js', notes: 'symptom ... measured ... Target: max 60 fps frame diff <= 6 in 41-43.5' },
  // one entry per named problem; file sets must not overlap
]
phase('Fix')
const fixLedgers = await parallel(FIXES.map((f) => () =>
  agent(fileFixerPrompt(f), { label: `fix:${f.key}`, phase: 'Fix' })))
phase('Verify')
const verify = await agent(verifierPrompt(FIXES), { label: 'verify', phase: 'Verify' })
return { ledgers: FIXES.map((f, i) => ({ key: f.key, ledger: fixLedgers[i] })), verify }
```

Practical notes:

- Put the shared rules in one `COMMON` string and prepend it to every prompt, so every agent works under the same contract.
- Give absolute paths. Agents' working directories reset between shell calls; tell them to `cd` into the project inside each command.
- Filter `null` results (`crits.filter(Boolean)`) before passing them on; a failed agent should not crash the round.
- A global round took 1.2-1.5 hours in the case. Run rounds in the background and do something else; do not poll.

## 13. Running it with plain subagents

Without the Workflow tool the same loop works with the Agent (subagent) tool from the lead session:

- **Parallel lanes:** spawn the builders for all acts in one message, so they run concurrently. When each returns, spawn its critic, then its fixer.
- **Structured results:** paste the JSON schema into the critic prompt and ask for "only the raw JSON, no prose, no code fences" as the final answer. Parse it; if it does not parse, ask the same agent to resend.
- **Triage by a fresh agent, not by the lead.** The lead wrote the foundation and has opinions about it. A triage agent with the storyboard and the critic JSON is a cheaper and more neutral judge, and its skipped list is written down instead of remembered.
- **Keep the lead's context small.** Ask subagents for ledgers and file paths, not for their working notes. The lead's job is orchestration, decisions and the human, and it runs for the whole project.

## 14. Collision rules

Parallel agents sharing one working copy break each other in predictable ways. The rules that followed from the case:

1. **One owner per file per round.** Every fixer prompt lists the files it may edit ("You may edit ONLY: ...") and says others are editing the rest.
2. **`timeline.js` and `copy.js` have one owner,** the lead or the foundation fixer. Everyone else writes the change they need into their report.
3. **Foundation first, acts after** (§7).
4. **Re-render once before blaming another file.** Every agent renders the whole page, so any agent's half-edited file shows up in everyone's stills. In the case an in-progress edit to act A left its hook line on screen for the whole film for a while; two other act fixers saw it over their own acts. One re-render a minute later tells a transient state from a real bug.
5. **Never fix someone else's file, even for a one-line fix.** Report it. Two agents editing one file is how a working change gets overwritten.
6. **Separate output folders per agent** (`renders/<round>/<owner>-<format>/`). Parallel still renders writing contact sheets into one folder produced a sheet with a single tile.
7. **Back up your own file before a pass** (a scratch copy), so a regression can be diffed and reverted. Prefix scratch files with your owner id: in the case one agent's helper script in the shared scratch folder was overwritten by another agent's file of the same name.
8. **No git and no installs from agents.** The lead commits between rounds, which also gives a clean diff per round.
9. **Contain your act.** Gate each act's root elements by the act's time window, so a bug inside the act cannot draw over the whole film. (A suggestion from the leak in rule 4; the case's act A drew its hook directly into the world layer.)

## 15. Stills and measurements for agents

The stills tool renders exact frames through `window.__seek`, the same path as the final capture:

```bash
# a contact sheet of a window, output time, 6 columns
node tools/still.mjs --page index.html --from 16 --to 22 --step 0.25 --out renders/r2/act-c-169 --sheet --cols 6
node tools/still.mjs --page portrait.html --from 16 --to 22 --step 0.25 --out renders/r2/act-c-45 --sheet --cols 6

# exact moments
node tools/still.mjs --page index.html --times 24.0,24.5,25.0 --out renders/r2/drop

# phone-size check: both scale to 360 px wide (1920 x 0.1875, 1080 x 0.333)
node tools/still.mjs --page index.html --times 24.0 --scale 0.1875 --out renders/r2/feed-169
node tools/still.mjs --page portrait.html --times 24.0 --scale 0.333 --out renders/r2/feed-45

# film time instead of output time (the storyboard's numbers)
node tools/still.mjs --page index.html --film --times 22 --out renders/r2/drop-film
```

- **At most about 36 frames per call** (a 6×6 sheet). Every call launches Chrome; on a machine with 1.5-3 GB of free RAM larger calls failed. Retry once with fewer frames.
- **Look at the PNGs with the Read tool.** Sheets for flow, full-size frames for detail, scaled frames for feed readability.
- **Seek order:** the template's tool renders the times in ascending order, like the capture, so a still shows what the render shows. With `--order listed` it seeks in the order you list them, which is how the seek-order test in `03-engine.md` §10 works. (The case's tool always seeked in the listed order.) The contact sheet follows the rendered order and labels each frame in a strip under it.
- **Check that a contact sheet has every tile.** In the case a sheet of 31 stills silently showed only the last 20-22 (the PNGs themselves were complete), and parallel renders into one folder produced a single-tile sheet. If a sheet looks short, build it from the PNGs or split the call.

Measurements critics and fixers used, all on downscaled grayscale (1/4 size):

```python
# frame differences of a rendered video, streamed (a full film does not fit in memory as float)
import subprocess, numpy as np
W, H, FPS = 480, 270, 60                       # 16:9 at 1/4; use 270 x 338 for 4:5
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", "film.mp4", "-vf", f"scale={W}:{H},format=gray",
                      "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
prev, d = None, []
while True:
    buf = p.stdout.read(W * H)
    if len(buf) < W * H:
        break
    a = np.frombuffer(buf, np.uint8).astype(np.int16)
    if prev is not None:
        d.append(float(np.abs(a - prev).mean()))
    prev = a
d = np.array(d)                                # d[i]: change from frame i to frame i + 1
top = sorted(range(len(d)), key=lambda i: -d[i])[:15]
print("top spikes:", [(round((i + 1) / FPS, 3), round(d[i], 2)) for i in top])
```

How to read the numbers, calibrated on the case:

- A hard transition peaked at 19.7 (the circle iris critics called dated); after the fix the same change peaked at 6. Targets of ≤ 5-6 for big light changes and logo moves worked.
- A mean of 0.20 over the first seconds read as a static text post; 0.5-0.6 read as calm motion.
- About 0.09 for a quarter of a second read as "a quiet beat"; longer runs that low are frozen holds (the bar: no freeze over 0.6 s outside the end card).
- A single frame well above its neighbours is a pop; look at the consecutive frames around it.

For an exact frame-by-frame probe of the source rather than a video, render consecutive stills at 1/60 s steps (`--times` with explicit values) and diff the PNGs the same way. The camera can be measured directly in the page: evaluate `Film.camera.at(t)` for every frame and look for zoom reversals and speed peaks; that is how the motion critic counted six zoom reversals in seven seconds. Full QA recipes are in [`07-qa-checklist.md`](07-qa-checklist.md).

## 16. What to report to the human

In the case the founder reviewed only the final result, so the build ran autonomously and the report at the end carried everything. Short status messages at milestones (foundation done, acts built, each round's score) are enough during the build. Decisions the human must make are asked explicitly and not buried in a report: downloads or purchases (only the exact files, after an explicit yes), claims marked NEEDS CHECK, and structural changes such as a variant or a re-cut.

The delivery report, in the human's language:

1. **What is delivered:** files, formats, length, frame rate, loudness, where they are.
2. **The film in brief:** a table of time, chapter and what you see.
3. **How it was made:** research, build, the critic loop, what was measured.
4. **Honest quality:** the final fresh critic's score and verdict (an agent that did not see the process), the highest and lowest sub-scores, what was fixed after it and what only partly, with numbers.
5. **Measured QA:** freezes, frame-difference spikes, brand colour after encode, white level, loudness (see `07-qa-checklist.md`).
6. **What only a human can check:** watch the 4:5 on a phone in the real feed app as a private draft, check that the rebuilt UI matches the version in the stores, judge the sound by ear.
7. **What is deliberately not in the film, and why:** excluded claims, features not shown, fictional data.
8. **Next steps for the human:** concrete, timecoded notes are the most useful feedback ("at 0:12 calm the camera"); buy the music at picture lock; publishing is theirs to do.

Do not post, upload, publish or push anything yourself.
