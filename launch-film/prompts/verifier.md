# Prompt: fresh verifier

**Used in:** after a targeted fix round (04 §11), and after the small fixes that follow the final critic. It checks a fixed list of named problems against their targets, then scans the whole film for regressions. See [`references/04-build-and-critique.md`](../references/04-build-and-critique.md) §9 and §11.

The verifier gets the problems, never the fixers' ledgers. "Is the logo still jumping between 42.1 and 42.5?" gets measured; "we fixed the logo jump" gets confirmed.

## Placeholders

| Placeholder | Example / meaning |
|---|---|
| `{REPO}` | Absolute path of the film project. |
| `{VERIFY_DIR}` | Evidence folder, e.g. `verify5` |
| `{PROBLEMS_WITH_TARGETS}` | A numbered list. Each item: a name, the time window, and what "fixed" looks like, with the numeric target from the fix round. Written from the problem side, not the fix side. |
| `{DURATION}` | The output length in seconds, for the whole-film scan. |

## Prompt

```text
You are a fresh verifier for the launch film in {REPO}. Do not edit any project files; create evidence only under {REPO}/renders/{VERIFY_DIR}/.
Render stills with: cd {REPO} && node tools/still.mjs --page index.html|portrait.html --from A --to B --step 0.1 --out renders/{VERIFY_DIR}/<name> --sheet --cols 6 (at most 36 frames per call). Where a check is about movement, render consecutive stills at 1/60 s steps (explicit --times) and compute per-frame mean absolute differences on 1/4-size grayscale with a small Python script over the PNGs. Check readability at feed size by scaling frames to 360 px wide (--scale 0.1875 for index.html, 0.333 for portrait.html).

Check each of these problems in BOTH formats and report fixed / partly / still there, with evidence (numbers, frame times, file paths):
{PROBLEMS_WITH_TARGETS}

Also scan the whole film (0-{DURATION} s) at 1 s steps in both formats for anything newly broken: overlaps, missing elements, clipped text, page errors printed by still.mjs.

Return a short report: per item the status and the evidence, any regressions with timestamps, anything else you noticed (say whether it may be pre-existing), and a 1-10 overall score.
```

## Example `{PROBLEMS_WITH_TARGETS}`

```text
1. Logo reveal lurch, 41-43.5: the mark must not jump; after the lock only a horizontal slide and the wordmark reveal; no static lull before the lock. Target: max 60 fps frame difference <= 6.
2. White flash or iris at the dark-to-light change, 9.7-10.8: an even crossfade, no bright blob; the bars-to-dots morph visible. Target: max frame difference <= 5.
3. Key-moment window, 22.0-25.0: the second question readable for at least 1.2 s before its answer is tapped; the thesis line starts at about 24.0; no caption reflow jump in 16:9.
4. Hook, 0-1.8: calm, perceptible motion from frame 1; frame 0 is a finished poster. Target: mean frame difference >= 0.5 without spikes.
5. Recipients and payoff, 25.5-33: chips readable at 360 px wide; no lurching pull-out; no empty-frame lull over 0.4 s; no half-cut phone; no preheader cut mid-word.
```

## Why the prompt says what it says

- **Problems, not fixes:** fixers are honest but measure what they changed, the way they changed it. In the case a fixer measured recipient chips at full resolution and called them fixed; this verifier scaled to 360 px and found 4-5 px text in both formats.
- **Numeric targets:** they make "partly" a precise answer. The case's verifier reported a question screen readable for 0.95-1.1 s against a 1.2 s target, and that the touch dot arrived 0.3 s before the tap.
- **Both formats, every item:** fixes are often verified in one format by the fixer, and the other format is where the regression hides.
- **The whole-film scan at 1 s:** targeted fixes touch shared timing; a cheap scan catches the obvious knock-on breakage.
- **"Anything else you noticed":** the case's verifier found a status screen that still said "on its way" while the e-mail was already open, and a near-still 0.4 s during a camera push. Neither was on any list.
- **A score:** comparable with the final critic's, so the delivery report can say whether the fixes moved the film (in the case: 7.5 before and after, with no regressions).
