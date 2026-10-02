# Prompt: act builder (and act fixer)

**Used in:** the act-build pipeline, [`references/04-build-and-critique.md`](../references/04-build-and-critique.md) §3. One builder per act file, all acts in parallel. After a fresh critic ([`act-critic.md`](act-critic.md)) has judged the act, a new agent gets the same brief plus the critic's problems: the act fixer (second prompt below).

**Before you use it:** the foundation exists (engine, film, timeline, copy, shared parts, stills tool), the storyboard has a table for this act with times that exist in `timeline.js`, and the act file is a stub. See [`references/03-engine.md`](../references/03-engine.md) for the API the prompt refers to.

## Placeholders

| Placeholder | Example / meaning |
|---|---|
| `{REPO}` | Absolute path of the film project. |
| `{PRODUCT}` | One sentence: what the product is and does. |
| `{ACT_TITLE}` | `Act C: questions, key moment, send setup (16.2-28.0)` |
| `{ACT_FILE}` | `src/parts/act-c.js` |
| `{WIN_FROM}`, `{WIN_TO}` | The act's window in **output** time (the stills tool's clock) plus about 0.2 s margin on each side for the hand-offs. If `T.SCALE` is not 1, convert from the storyboard's film times, or add `--film` to the stills commands and use film times. |
| `{APP_SOURCES}` | The real product files for this act's screens, read-only: screen components, theme tokens, the i18n strings file, push or e-mail templates. |
| `{BENCHMARK}` | `Linear, Things, Apple product films` |
| `{MAX_FRAMES}` | 30-36. Each stills call starts Chrome; larger calls failed on a machine with 1.5-3 GB free RAM. |
| `{BRAND_RULES}` | The brand non-negotiables in one line each, e.g. "Inter only; brand green #xxxxxx never as text on light (2.5:1), use #yyyyyy; UI accent never as text on light; app UI radius 10 px". |

## Common block

Prepend this to both the builder and the fixer prompt, so every agent in every lane works under the same contract.

```text
Project: {REPO}, a launch film for {PRODUCT}. Plain JS pages; every frame is a pure function of time t. Read these first, completely:
- {REPO}/docs/storyboard.md: THE build spec (non-negotiables, geometry contract, ownership rules, your act's table)
- {REPO}/src/film.js, src/engine.js, src/timeline.js, src/copy.js, src/tokens.css
- {REPO}/src/parts/stage.js, phone.js, pushes.js, touch.js, overlay-text.js (foundation parts: read them, do not edit them)
- {REPO}/docs/facts.md and the fictional demo content in {REPO}/docs/
Rules:
- Edit ONLY your own act file. Other agents own the other files and are working at the same time. If you need a shared helper, put it inside your own file.
- Never edit timeline.js or copy.js. If a time or a string is wrong for your act, write the exact change you need in your final report.
- Every animated style is set from t inside render(t): no timers, no CSS transitions or animations, no requestAnimationFrame, no Date, no Math.random (use Eng.hash / Eng.noise1). Text whose value changes (timers, counters, typing) takes its value from Film.frameT(t).
- Morphs and camera moves use the house curve (Eng.E.house); vary durations, not curves. Slow creeps and drifts may be linear. Springs only via Eng.spring / Eng.S with zeta >= 0.9.
- Children of a hidden container use visibility "inherit", never "visible". No will-change on anything that scales. Inside the phone (and anything else in the world layer), animate with 2D transforms (translate(), scale()), never translate3d(): a 3D transform makes the frame depend on what was painted before.
- All strings come from src/copy.js. The app UI is rebuilt faithfully from the real source; never show a feature, screen, suggestion or behaviour the product does not have. Fictional data only.
- {BRAND_RULES}
- No git commands, no installs, no servers except the one tools/still.mjs starts itself. Run shell commands from the project directory (cd into it inside each command).
- Render stills with: cd {REPO} && node tools/still.mjs --page index.html --from A --to B --step 0.25 --out renders/stills/<name> --sheet --cols 6 (and the same with --page portrait.html). At most {MAX_FRAMES} frames per call; if Chrome fails, retry once with fewer. Look at the PNGs with the Read tool. The tool prints PAGE ERRORS when a part throws: fix every error that comes from your file.
- Stills render the whole page, including other agents' files while they are mid-edit. If something outside your file looks broken, re-render once a minute later before concluding anything, and then report it instead of fixing it.
```

## Builder prompt

```text
You are the motion-design builder for {ACT_TITLE} of the launch film. Your file: {REPO}/{ACT_FILE} (currently a stub).
{COMMON}
App sources for your act. Read them so the rebuilt UI is faithful in layout, sizes, colours, icons, states, timing and copy: {APP_SOURCES}

Build your act exactly per the storyboard table for your act, at agency quality:
- layered motion: one lead move, secondary moves under it;
- speed changes: land slowly, leave fast;
- nothing frozen longer than about 0.6 s: a slow camera creep or drift under every hold;
- every action produces a visible result: a tap changes the UI, a push leads somewhere;
- frame-perfect hand-offs at your window edges: the incoming screen covers the outgoing one; end on Film.handoff("<XY>") where the storyboard defines a hand-off, otherwise return to the rest camera by the end of your window.
Draw icons as inline SVG matching the app's icon set (lucide-style: stroke 1.75-2, round caps). Register camera, phone-motion, tap, push and darkScreen keys at mount time. Keep world content out of the overlay text box while overlay text is visible (check with Film.toScreen). Start your file with a header comment that says what happens when, in film time, and why.

Verify: render stills over {WIN_FROM}-{WIN_TO} s in BOTH formats (step 0.25), plus phone-size singles of the text-heavy moments (--scale 0.1875 for index.html and --scale 0.333 for portrait.html; both give 360 px wide). Look at them critically and iterate until the act holds up next to {BENCHMARK}.

Final answer: a short report: what you built, the signature moment, any time in timeline.js or string in copy.js that should change (with exact values; do not edit them), and known weaknesses.
```

## Act fixer prompt

```text
You are the builder of {ACT_TITLE} of the launch film. A fresh critic has reviewed your act. Your file: {REPO}/{ACT_FILE}.
{COMMON}
Critic scores: {CRITIC_SCORES_JSON}
Critic verdict: {CRITIC_VERDICT}
Ranked problems. Fix the biggest first and fix all you can. If a note conflicts with storyboard.md, follow storyboard.md and say so:
{CRITIC_PROBLEMS_JSON}

Before editing, copy your file to a scratch folder so a regression can be diffed. After fixing, re-render stills of the affected moments in both formats and check every problem yourself, at the size the problem is about (full frame for motion and layout, 360 px wide for readability).

Final answer: a ledger table (problem → fixed / partly / not fixed → what changed), remaining known issues, and the changes you recommend in files you do not own (timeline.js, copy.js, shared parts, the storyboard), each with exact values and the reason.
```

## Why the prompt says what it says

- **"Edit ONLY your own act file"** and **"put a shared helper inside your own file":** five agents edit one working copy at the same time. Duplicated helpers are cheap; two agents editing one helper is how working code gets overwritten.
- **"Never edit timeline.js or copy.js":** every act reads them at runtime. A builder that nudges a time for its own act moves events in other acts. Requests in the report reach the lead, who applies them once, consistently.
- **The determinism rules are repeated** even though the storyboard has them: builders follow the prompt more reliably than a document, and a single `Math.random` or CSS transition breaks the whole render pipeline (see `03-engine.md` §10).
- **"Re-render once before concluding":** in the case one act's half-finished edit left its hook text on screen across the whole film for a while, and two other agents saw it over their own acts.
- **"Iterate until it holds up next to {BENCHMARK}":** without a named benchmark, "done" tends to mean "no errors". A named reference gives the builder a bar to iterate against.
- **The report asks for the signature moment and the weaknesses:** the lead uses the first to check the storyboard's intent survived, and the second to plan the global rounds. Asking for weaknesses explicitly puts them in the report instead of leaving them for the next critic to find.
- **The fixer is told "storyboard wins":** critics propose good ideas that break the spec (off-grid timings, features the product does not have). The fixer should not have to adjudicate; the spec decides, and the disagreement is recorded.
- **The fixer checks at the size the problem is about:** in the case a fixer measured chips at full resolution and called them readable; at 360 px wide they were not.
