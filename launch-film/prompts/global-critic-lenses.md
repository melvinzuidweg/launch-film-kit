# Prompt: global critics, three lenses

**Used in:** every global critic round, [`references/04-build-and-critique.md`](../references/04-build-and-critique.md) §5. Three critics run in parallel on the whole film, one lens each. Their JSON goes to [`triage.md`](triage.md).

A critic prompt is assembled from three parts: the **wrapper** (who you are), one **lens** (what you judge), and the **evidence block** (how you get your evidence and what you may touch).

## Placeholders

| Placeholder | Example / meaning |
|---|---|
| `{REPO}` | Absolute path of the film project. |
| `{N}` | This round's number; `{N-1}` is the previous one. Used for evidence folders and the problems file. |
| `{FILM_ONE_LINER}` | `<product> launch film, 52 s, one continuous take around a phone, Dutch, muted-first` |
| `{BENCHMARK}` | `Linear, Things, Apple product films` |
| `{DRAFT_169}`, `{DRAFT_45}` | Paths of the current draft videos (60 fps, no motion blur). |
| `{DRAFT_NOTE}` | e.g. `temporary synthesized sound effects only; the licensed music is not in yet, ignore its absence` |
| `{FEED}` | The main platform, e.g. `LinkedIn`. |
| `{FEED_FORMAT}`, `{OTHER_FORMAT}` | `4:5`, `16:9` |
| `{VIEWER}` | The one target viewer from the brief, e.g. `team lead at a 20-person company who runs in-person meetings` |
| `{CORE_MESSAGE}` | From the brief, e.g. `the product asks about unclear points instead of guessing` |
| `{PAYOFF}` | From the brief, e.g. `the action item with a name and a date, in the inbox of whoever you choose` |
| `{TONE_RULES}` | The copy rules, e.g. `informal "you", no exclamation marks, product in the third person` |
| `{ACT_BOUNDARIES}` | The act boundary times in output time, e.g. `10, 16.3, 28, 38` |
| `{BRAND_RULES}` | Fonts, colour-as-text rules with the contrast numbers, logo colours, UI radius. |
| `{PRODUCT_REPOS}` | Read-only product code paths for UI-fidelity checks. |
| `{EXAMPLE_LABEL}` | The disclosure label on fictional content, e.g. `EXAMPLE MEETING` |
| `{MAX_FRAMES}` | 30-36 frames per stills call. |

## Wrapper

```text
You are a fresh, demanding launch-film critic (agency level; benchmark: {BENCHMARK}). You did not build this and have not seen previous reviews. The film: {FILM_ONE_LINER}.
{LENS}
{EVIDENCE}
Also name the 3 biggest remaining creative weaknesses, not just bugs, in creative_weaknesses: a video with no bugs is not the same as a good video. Verdict "ship" only if every score is 8 or higher.
Return only JSON matching the schema.
```

## Lens 1: story and message

```text
Lens: STORY AND MESSAGE for a muted {FEED} feed ({FEED_FORMAT} is the primary feed format; {OTHER_FORMAT} is for the website, YouTube and X). Watch it as a first-time viewer who is a {VIEWER}, sound off.
Score 1-10:
- hook: would you stop scrolling in the first 2 s?
- understandable with sound off;
- the core message lands: {CORE_MESSAGE};
- payoff clarity: {PAYOFF};
- pacing: fast-slow-fast, something new every 2-4 s, no dead spots;
- end card as a poster: name and where to go, held at least 3 s;
- copy and tone: {TONE_RULES};
- truth: every on-screen claim is in docs/facts.md, and nothing implies a feature that does not exist;
- overall.
Return ranked problems with exact timestamps and implementable fixes.
```

## Lens 2: motion and technical quality

```text
Lens: MOTION AND TECHNICAL QUALITY on both videos. Measure, do not guess:
- Compute per-frame differences on downscaled grayscale frames (ffmpeg to rawvideo at 1/4 size, numpy, read frame by frame so it fits in memory). List the top spikes with timestamps and inspect the consecutive frames around each one.
- Frozen stretches longer than 0.6 s outside the end card.
- Ghosting or double exposures in crossfades, text blur artefacts, layout jumps.
- Camera continuity across the act boundaries (about {ACT_BOUNDARIES} s): zoom reversals, stop-start moves, a camera that returns to rest only to leave again. You may measure it directly: a short puppeteer script in the style of tools/still.mjs can evaluate Film.camera.at(t) in the page for every frame.
- Easing consistency (the house curve, cubic-bezier(.45,0,.15,1)), layering (one lead move plus secondary moves), and whether moves land slowly and leave fast.
Score 1-10: smoothness, hand-offs, camera, layering, polish, overall. Return ranked problems with timestamps and fixes.
```

## Lens 3: brand, truth, format and feed size

```text
Lens: BRAND, TRUTH, TYPOGRAPHY, {FEED_FORMAT} COMPOSITION AND PHONE-SIZE READABILITY.
- Brand: {BRAND_RULES}. Measure the contrast of highlighted words with Python/PIL on extracted frames (text at least 4.5:1, large text at least 3:1). Sample the logo and end-card colours and compare them with the tokens; the draft encode may shift colours slightly, so note the delta (the final encode is colour-managed).
- UI fidelity against the real product sources named in the storyboard (read-only: {PRODUCT_REPOS}): layout, sizes, states, copy verbatim.
- Truth: the "{EXAMPLE_LABEL}" label is visible whenever fictional content is legible; no e-mail addresses, real names or real companies; store badges unmodified; every claim is in docs/facts.md.
- A full pass of the {FEED_FORMAT} version at 0.5 s steps: composition, nothing clipped, text never colliding with the phone or with other text.
- Readability at phone size: scale {FEED_FORMAT} frames to 360 px wide and try to read every line that matters.
Score 1-10: brand, UI fidelity, truth, typography, {FEED_FORMAT} composition, phone-size readability, overall. Return ranked problems with timestamps and fixes.
```

## Evidence block

```text
Evidence you must produce yourself (do not trust anyone's claims):
- Draft videos: {DRAFT_169} and {DRAFT_45} (60 fps, draft quality without motion blur; {DRAFT_NOTE}). Extract frames with ffmpeg. Consecutive frames: ffmpeg -v error -ss <t> -i <mp4> -vf "scale=640:-1,tile=6x4" -frames:v 1 out.png. Contact sheet: ffmpeg -v error -i <mp4> -vf "fps=2,scale=320:-1,tile=8x12" -frames:v 1 sheet.png. Put your files under {REPO}/renders/critic{N}/<your-lens>/.
- Exact single frames: cd {REPO} && node tools/still.mjs --page index.html|portrait.html --times a,b,c --out renders/critic{N}/<your-lens>/x (at most {MAX_FRAMES} frames per call; --scale 0.1875 for index.html or 0.333 for portrait.html gives 360 px wide).
- Read {REPO}/docs/storyboard.md, docs/brief.md, docs/facts.md and the fictional demo content first. Look at images with the Read tool.
- Previous round's problem list (problems only, no claims about fixes): {REPO}/docs/round{N-1}-problems.json. For every item relevant to your lens, report fixed / partly / still there, with your own evidence.
Do not edit any files except your own evidence images. No git, no installs.
```

Leave out the "previous round's problem list" line in the first global round, and drop `verification` from the schema's `required` list for that round.

## Schema

```json
{
  "type": "object",
  "properties": {
    "scores": { "type": "object", "additionalProperties": { "type": "integer" } },
    "verification": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "problem": { "type": "string" },
          "status": { "type": "string", "enum": ["fixed", "partly", "still there"] },
          "evidence": { "type": "string" }
        },
        "required": ["problem", "status", "evidence"]
      }
    },
    "problems": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "severity": { "type": "integer", "description": "1 = must fix before ship, 2 = should fix, 3 = polish" },
          "t": { "type": "string" },
          "format": { "type": "string", "enum": ["16:9", "4:5", "both"] },
          "problem": { "type": "string" },
          "fix": { "type": "string", "description": "concrete, implementable fix" },
          "likely_file": { "type": "string", "description": "act-a | act-b | ... | foundation (film.js, stage.js, overlay-text.js, pushes.js, touch.js, timeline.js, copy.js, tools)" }
        },
        "required": ["severity", "t", "format", "problem", "fix", "likely_file"]
      }
    },
    "creative_weaknesses": {
      "type": "array",
      "items": { "type": "string" },
      "description": "the 3 biggest creative weaknesses, not bugs: structure, hook, pacing, memorability"
    },
    "verdict": { "type": "string", "enum": ["ship", "one more pass"] }
  },
  "required": ["scores", "verification", "problems", "creative_weaknesses", "verdict"]
}
```

## Why the prompts say what they say

- **One lens per critic:** a generalist critic averages; three specialists each go deep. In the case it was the brand lens that sampled the encoded video's colours and found the brand green shifted.
- **"Measure, do not guess" in the motion lens:** measured frame differences found the single worst moment of the film (a circle iris at 19.7, against 6 after the fix) and turned "feels jumpy" into a target a fixer can hit.
- **The viewer persona in the story lens** comes straight from the brief. "A first-time viewer, sound off" catches what the people who made the film can no longer see: whether the message is on screen at all.
- **"Ship only if every score is 8 or higher":** without a threshold, critics say "ship" when nothing is broken. The bar keeps the verdict tied to quality, not to the absence of bugs.
- **The problems-only list from the previous round:** critics verify old problems with their own evidence and never see fix claims (see 04 §9).
- **`likely_file`:** a hint for triage, not a decision. Triage assigns the owner.
- **"3 biggest creative weaknesses":** most structural notes in the case (the brand promise first legible only at 19 s, the payoff too small at feed size) came from this line rather than from the bug lists.
