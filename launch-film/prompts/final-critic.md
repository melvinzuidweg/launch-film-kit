# Prompt: final fresh critic

**Used in:** once, on the final render (motion blur, final encode), before delivery. See [`references/04-build-and-critique.md`](../references/04-build-and-critique.md) §11. Its score and verdict go into the delivery report for the human; its top problems become the last targeted fixes, checked by [`verifier.md`](verifier.md).

Run it as a single background subagent with a fresh context. It must not have seen the process, the ledgers or earlier critiques.

## Placeholders

| Placeholder | Example / meaning |
|---|---|
| `{BENCHMARK}` | `Linear, Things, Apple product films` |
| `{PRODUCT}` | The product name. |
| `{REPO}` | Absolute path of the film project. |
| `{FINAL_FEED}`, `{FINAL_WIDE}` | Paths of the final renders, e.g. the 4:5 feed version and the 16:9 version. |
| `{FEED}` | The main platform, e.g. `LinkedIn` |
| `{SPECS}` | e.g. `52.4 s, 60 fps, 8-subframe motion blur` |
| `{AUDIO_NOTE}` | e.g. `temporary synthesized sound effects only; the licensed music is not added yet, ignore its absence` |
| `{CORE_MESSAGE_SCORE}` | The core-message line in a few words, used as a score name, e.g. `the "asks instead of guessing" message lands` |

## Prompt

```text
You are a fresh, demanding launch-film critic (benchmark: {BENCHMARK}). You have not seen this work before. Score the FINAL render of the {PRODUCT} launch film honestly: this score goes into the delivery report for the founder.

Files (read-only; do not edit anything in the project except creating your own evidence files under {REPO}/renders/final-critic/):
- {FEED} feed version (primary): {FINAL_FEED}
- Wide version: {FINAL_WIDE}
- Spec and context: {REPO}/docs/storyboard.md, docs/brief.md, docs/facts.md and the fictional demo content in docs/
Both are {SPECS}; {AUDIO_NOTE}.

How: extract frames with ffmpeg (contact sheets, e.g. -vf "fps=2,scale=270:-1,tile=8x12" -frames:v 1; consecutive frames around fast moves, e.g. -ss <t> -vf "scale=540:-1,tile=6x2" -frames:v 1), view the PNGs with the Read tool, and check phone-size readability by scaling feed-version frames to 360 px wide. Optionally compute per-frame differences with numpy for pops and frozen holds. No git, no installs.

Return (concise, in English):
1. Scores 1-10: hook (first 2 s), understandable with sound off, {CORE_MESSAGE_SCORE}, payoff clarity, pacing, motion quality and smoothness, hand-offs and camera, brand fidelity, UI fidelity, typography, feed-format composition, phone-size readability, end card as poster, overall.
2. The 5 most important remaining problems, ranked, each with a timestamp, the format and a concrete fix.
3. The 3 strongest moments.
4. Verdict: ship as-is (after adding music) / ship after small fixes / needs another round, with one sentence why.
```

## Why the prompt says what it says

- **"This score goes into the delivery report for the founder":** it tells the critic who the reader is and that inflation has a cost. In the case the final critic gave 7.5 with "ship after small fixes" and still scored the hook 6, which is what made the report useful to the founder.
- **The final render, not a draft:** motion blur, colour management and the final encode change what a viewer sees. Problems such as a timer smearing under motion blur only exist in the final.
- **Five problems, not fifty:** at this stage the useful output is a short list of targeted fixes (04 §11). An unbounded list invites another broad round, which the budget does not have.
- **The 3 strongest moments:** they go into the delivery report as well, and they tell the lead what not to touch in the last fixes.
- **Three verdicts, not two:** "ship after small fixes" is the honest middle that a ship / one-more-pass choice lacks. It maps directly to a targeted fix round plus a verifier.

## Output from the case, for calibration

- **Overall** 7.5, verdict "ship after small fixes".
- **Highest:** payoff, brand and UI fidelity, end card (8.5 each); understandable with sound off (8).
- **Lowest:** hook (6), pacing (6.5). The film's strongest moment arrives at 22 s, which no polish can fix; it was addressed separately by the question-first variant.
- **Five fixes** came out of it (logo lurch, a white flash at a light change, crowding around the key moment, the hook's motion, payoff polish). A verifier then confirmed three fixed, two partly, no regressions, still 7.5.
