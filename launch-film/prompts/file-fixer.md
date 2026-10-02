# Prompt: per-file fixer

**Used in:** global critic rounds (one fixer per owner group from [`triage.md`](triage.md)) and targeted fix rounds (one fixer per named problem). See [`references/04-build-and-critique.md`](../references/04-build-and-critique.md) §7 and §11.

Run the **foundation** group first and the act groups after it, in parallel. Acts read `timeline.js` and `copy.js` at runtime, so act fixers should verify against the foundation's final state, not a moving one.

## Placeholders

| Placeholder | Example / meaning |
|---|---|
| `{REPO}` | Absolute path of the film project. |
| `{OWNER}` | `act-c`, `foundation`, or a targeted fix name such as `logo` |
| `{FILES}` | The only files this fixer may edit, e.g. `src/parts/act-c.js`, or for foundation `src/film.js, src/engine.js, src/timeline.js, src/copy.js, src/tokens.css, src/parts/stage.js, src/parts/overlay-text.js, src/parts/pushes.js, src/parts/touch.js, src/parts/phone.js, tools/*, docs/*.md` |
| `{BRAND_SHORT}` | e.g. `Inter only, brand colour rules from the storyboard` |
| `{NOTES}` | The triage group's items as JSON, or for a targeted fix the problem text with its measured symptom and numeric target. |
| `{ROUND_DIR}` | Evidence folder for this round, e.g. `fix3` |
| `{MAX_FRAMES}` | 30-36 frames per stills call. |
| `{FOUNDATION_NOTE}`, `{FINAL_NOTE}`, `{BLUR_NOTE}` | Optional paragraphs below. |

## Prompt

```text
You are the fixer for "{OWNER}" in the launch film ({REPO}). You may edit ONLY: {FILES}. Other fixers edit the other files at the same time: never touch them. Stills rendered while others edit may briefly show their half-edited state, so re-render once before concluding that something outside your files is broken, and then report it instead of fixing it.
Read docs/storyboard.md (non-negotiables, geometry contract, hand-off framings) and the file(s) you own, plus src/film.js, src/engine.js and src/timeline.js for the APIs. Everything stays a pure function of t (no timers, requestAnimationFrame, Date or Math.random), house curve, {BRAND_SHORT}, the truth rules in docs/facts.md, no new features or claims.
{FOUNDATION_NOTE}
{BLUR_NOTE}
{FINAL_NOTE}
Notes to fix (severity 1 = must, 2 = should, 3 = polish; fix them in that order, as many as you can do well):
{NOTES}

Before editing, copy the files you own to a scratch folder so a regression can be diffed.
Verify every fix with stills of the affected moments in BOTH formats: cd {REPO} && node tools/still.mjs --page index.html --times <...> --out renders/{ROUND_DIR}/{OWNER}-169 --sheet --cols 6, and the same with --page portrait.html into renders/{ROUND_DIR}/{OWNER}-45. At most {MAX_FRAMES} frames per call. Check readability notes at 360 px wide (--scale 0.1875 for index.html, 0.333 for portrait.html). Check the hand-offs just outside your window too. Where a note has a numeric target, measure it and report the number. Look at the images with the Read tool. No git, no installs.

Final answer: a ledger table (note → fixed / partly / not fixed → what changed, with measured numbers where there was a target), anything another owner must still do (with exact values), and where your stills are.
```

### Optional paragraphs

`{FOUNDATION_NOTE}`, for the foundation fixer only:

```text
timeline.js and copy.js changes affect every act, because acts read T and COPY at runtime. Keep time changes minimal and consistent with the notes, keep events on the music's bar grid, keep "never two overlay cards at once" true (each card's Film.type.goneAt(out) <= the next card's in), and record every spec change in docs/storyboard.md. If an act still reads a key you remove, keep a temporary alias and say so.
```

`{BLUR_NOTE}`, once the final render uses supersampled motion blur:

```text
The final render captures 480 fps and averages 8 subframes into each 60 fps output frame. Any text whose VALUE changes (timers, counters, typed characters, a regular/bold switch) must take its value from Film.frameT(t), so all 8 subframes of an output frame agree; otherwise it smears.
```

`{FINAL_NOTE}`, for the last fix round before the final render:

```text
This is the final fix round before the final render: make safe, verified changes only. When in doubt, leave it and report it.
```

## Targeted-fix variant

For a targeted round (04 §11), `{NOTES}` is one named problem with its evidence and target, written by the lead, for example:

```text
Logo reveal lurches (41.9-42.5, both formats, worst in 4:5): the mark holds still at frame centre, then in about 0.35 s jumps about 290 px up and 300 px left and shrinks to about 70 % while the wordmark wipes in. It is the biggest frame-difference peak in the 4:5 film (10.0 at 42.33).
Fix: assemble the mark at, or travelling smoothly toward, its end-card position, so after the lock only the horizontal slide and the wordmark reveal remain, stretched to 0.7-0.8 s. Keep the lock on the music hit at 42.0 and the poster complete by about 43.8, holding at least 4 s. Remove the near-static lull before the lock (keep a slow creep).
Target: max 60 fps frame difference in 41-43.5 <= 6, measured on 1/4-size grayscale.
```

A numeric target turns "make it smoother" into something the fixer can verify and the verifier can check. In the case every targeted fix with a numeric target was reported with its measured number.

## Why the prompt says what it says

- **"You may edit ONLY":** the file list is the ownership contract made explicit for this agent. In the case, parallel fixers on shared files caused transient breakage; one owner per file stopped it.
- **"Re-render once before concluding":** every agent renders the whole page, so another agent's half-edited file shows up in your stills. A minute later it is usually gone.
- **"Report it instead of fixing it":** a quick fix in someone else's file collides with that file's owner, who is editing it right now.
- **Backups before editing:** if a fix regresses, the diff is the fastest way to see what changed.
- **"Check the hand-offs just outside your window":** a fix inside an act often moves its first or last frames, and the seam is where the next act's critic will look.
- **The ledger format** is what the lead pastes into `ledger-roundN.md`; the "anything another owner must still do" list is how cross-file work reaches the next round.
