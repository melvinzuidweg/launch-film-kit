# Worked example: the Griffel launch film

This folder is the real source of a 52-second launch film for [Griffel](https://griffel.ai), a Dutch AI meeting-notes app. Claude Code wrote and rendered it in October 2026, with the founder reviewing only the finished film. Nothing here was cleaned up to look better than it was. The code, the storyboard and the critic ledgers are what the session actually produced. The only changes are the removals listed below, local paths turned into relative ones, and the founder's name replaced with "the founder".

Use it to see what a finished project built with this kit looks like: how the timeline is laid out, how five act files share one camera, what the critics found in each round, and how the music was cut to the picture. To start your own film, use the starter in [`../../launch-film/assets/template/`](../../launch-film/assets/template/) instead. The full story, including what went wrong, is in the case study: [`../../launch-film/references/09-case-study-griffel.md`](../../launch-film/references/09-case-study-griffel.md).

| | |
|---|---|
| Length | 52.36 s output (48 s of film time × 120/110) |
| Formats | 16:9 1920×1080 (`index.html`) and 4:5 1080×1350 (`portrait.html`) |
| Variant | "vraag", which opens on Griffel's question instead of the vague meeting line (`index-vraag.html`, `portrait-vraag.html`) |
| Delivery | 60 fps, 8-subframe motion blur, BT.709 colour, −14 LUFS |
| Language | Dutch on screen, no voice-over, made to work on mute |
| Final critic score | 7.5 / 10, "ship after small fixes" |

## What is not included, and why

| Missing | Why | What happens instead |
|---|---|---|
| The music: 'Just Flow' (original) and 'One More Chance' (variant), both by Hartzmann on Uppbeat | Each Uppbeat licence covers one video for the account that downloaded it, so the WAVs can't be redistributed | The music edit is here as data (`renders/audio/edl-*.json`). Get your own licence for the tracks to hear the real mix, or mix the sound effects alone (see [Sound](#sound)). |
| The official App Store and Google Play badges | Apple and Google don't allow redistribution | `assets/badges/placeholder-*.svg` have the same geometry. The comment above the badge code in `src/parts/act-e.js` says how to swap the real ones back in. |
| A vendored copy of GSAP | Only the npm package is used | The pages load `node_modules/gsap/dist/gsap.min.js` (GSAP 3.15.0, pinned in `package.json`). |
| The delivery notes, the music-licence notes and the renders | They held licence codes and account details, or they are large outputs | Render the film yourself (below). |

The Griffel logo and wordmark in `assets/logo/` are © Griffel and **not** licensed for reuse; see [`assets/logo/NOTICE.md`](assets/logo/NOTICE.md). The Dutch on-screen copy and the rebuilt app screens are Griffel's product. Study them, but don't ship them as yours.

## Requirements

- **Node 22.12 or newer.** HyperFrames and puppeteer-core need it. The case pinned HyperFrames 0.8.68; for a new project, see [05 §8](../../launch-film/references/05-render-and-encode.md#8-hyperframes-as-an-option) for its state as of 0.8.138.
- **Google Chrome.** The tools default to the Windows install path; set `CHROME_PATH` on macOS or Linux, for example `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- **ffmpeg** on `PATH`. It is used for contact sheets, encodes and audio.
- **Python 3 with numpy and Pillow,** for the encode, check and audio tools.
- **bash** for `tools/render.sh`. On Windows, Git Bash works.

```bash
npm ci                              # installs the pinned HyperFrames, GSAP and puppeteer-core from the lockfile
export HYPERFRAMES_NO_TELEMETRY=1   # HyperFrames sends telemetry by default; render.sh also sets this
```

## Render stills

Every frame is a pure function of time, so any moment can be rendered on its own. `tools/still.mjs` serves the folder over local HTTP, because Chrome blocks fonts on `file://`. It then seeks the page with `window.__seek(t)` and screenshots it.

```bash
# times are OUTPUT seconds (the video's clock)
node tools/still.mjs --page index.html --times 2,24,47 --out renders/stills/check
node tools/still.mjs --page portrait-vraag.html --times 1 --out renders/stills/vraag45

# a labelled contact sheet of one act (needs ffmpeg)
node tools/still.mjs --page portrait.html --from 0 --to 12 --step 0.5 --out renders/stills/a45 --sheet --cols 6

# FILM time, the numbers in src/timeline.js and docs/storyboard.md (film 22.0 = output 24.0, the drop)
node tools/still.mjs --page index.html --film --times 22 --out renders/stills/drop

# phone-feed size: a 16:9 frame at 360 px wide, to check that text is still readable
node tools/still.mjs --page index.html --times 24.2 --scale 0.1875 --out renders/stills/feed
```

The page reports one 404, for `/favicon.ico`. That one is harmless; any other 404 is a missing asset.

## Render the film

```bash
bash tools/render.sh 169 draft                            # renders/film-169-draft.mp4: 60 fps, no blur, about 3–4 min
bash tools/render.sh 45 final                             # renders/film-45-final.mp4: 480 fps capture, 8-subframe blur, 60 fps
VARIANT=vraag bash tools/render.sh 169 final              # the "vraag" variant
bash tools/render.sh 169 final renders/audio/mix-orig.wav # also muxes a soundtrack
python tools/check_encode.py renders/film-169-final.mp4   # brand green within ±2, white exact, no banding
```

- **Draft.** HyperFrames renders a 60 fps PNG sequence, which `tools/encode_seq.py` encodes.
- **Final.** `tools/capture_seq.mjs` captures 480 fps itself, with one Chrome process per worker. HyperFrames' disk pre-check refused a sequence that size. A 16:9 final needs about 4.5 GB of temporary disk and took 13–16 minutes per format with 4 workers on a 6-core laptop.
- **Encode.** `encode_seq.py` averages 8 subframes at 16-bit, converts with an explicit BT.709 matrix and dither, and tags the stream. Without that, the encode shifted the brand green #1ABA6D to #16B867 and banded the near-white gradient.
- **Lint warnings.** `hyperframes lint` and `snapshot` warn about a missing duration source and a missing `window.__timelines`. Both are false positives: the pages set `data-duration` from script on purpose. The comment in `index.html` explains why.

## Sound

Every time in the audio pipeline is output time.

```bash
python tools/audio/synth_sfx.py                                   # regenerates assets/audio/sfx/*.wav (numpy only, seeded)
node tools/audio/events.mjs > renders/audio/cues-orig.json        # SFX cues read from the film itself
node tools/audio/events.mjs --page index-vraag.html > renders/audio/cues-vraag.json

# with your own licensed copies saved under the names in the EDL:
python tools/audio/mix_edl.py --edl renders/audio/edl-orig.json  --cues renders/audio/cues-orig.json  --out renders/audio/mix-orig
python tools/audio/mix_edl.py --edl renders/audio/edl-vraag.json --cues renders/audio/cues-vraag.json --out renders/audio/mix-vraag

# without the music: the sound effects alone, loudness-normalised
python tools/audio/mix.py --cues renders/audio/cues-orig.json --out renders/audio/sfx-only
```

`mix_edl.py` expects the tracks at `assets/audio/licensed/hartzmann-just-flow.wav` and `assets/audio/licensed/hartzmann-one-more-chance.wav`. That folder is git-ignored so licensed audio never gets committed. The music edit is the interesting part, because the music is cut to the picture rather than the picture to the music:

| EDL | Song structure | Edit |
|---|---|---|
| `edl-orig.json` ('Just Flow', 110 BPM) | Drop at song 105.0 s; final hit at 144.27 s | Start at song 81.0, so the drop lands at output 24.0 on the tap that answers Griffel's question. At output 39.27, jump 8 bars ahead (to 137.73), so the final hit lands on the logo lock at 45.82. Low-passed (about 700 Hz, "in the next room") until the drop. |
| `edl-vraag.json` ('One More Chance', 110 BPM) | Drop at song 109.06 s after a 2 s near-silent break; hard stop at 196.30 s | Cold open on the drop. At output 4.36 (2 bars), jump back 11 bars (to 89.42), so the break lands at 21.9–23.9 and the same drop hits again at 24.0. At the logo lock, jump 27 bars ahead (to 189.79), so the hard stop lands on the last frame. |

The film was written on a 120 BPM grid. The tracks are 110 BPM, so `SCALE = 120/110` in `src/timeline.js` slows the whole film by about 9 % and every film beat lands on a music beat. Every jump is a whole number of bars; half-bar jumps audibly stumble. `tools/audio/find_drop.py` finds a track's drop from bass energy, so you don't have to trust an automatic beat grid.

## How the code is organised

Each page loads the same scripts in a fixed order: GSAP, then `engine.js` (maths), `timeline.js` (every time), `copy.js` (every string), `mark.js` (logo geometry), `film.js` (core), then the parts, then `Film.boot()`. `window.FORMAT` selects the layout; `window.VARIANT` and the inline override in `index-vraag.html` select the variant.

```
examples/griffel/
├── index.html, portrait.html          16:9 and 4:5 pages (same timeline, recomposed layout)
├── index-vraag.html, portrait-vraag.html   variant pages: a different hook, identical from film 3.2 s on
├── package.json, package-lock.json    HyperFrames 0.8.68 and GSAP 3.15.0, pinned
├── src/
│   ├── engine.js        clamp/lerp/bezier, the house curve, P(t, start, dur), closed-form damped springs (zeta >= 0.9), seeded noise
│   ├── timeline.js      the single source of truth for timing: T.A..T.E per act, T.O overlay cards, hand-off framings, SCALE
│   ├── copy.js          every on-screen string, verbatim from the app where it shows app UI
│   ├── mark.js          logo geometry generated from assets/logo (do not edit by hand)
│   ├── film.js          layers, camera keys, phone motion, taps, pushes, Film.type, Film.frameT, the seek hooks
│   ├── tokens.css       Inter @font-face and the brand colour tokens
│   └── parts/
│       ├── stage.js         background gradient and rings, the dark recording act, the VOORBEELD label
│       ├── phone.js         CSS iPhone frame, 393×852 logical screen, status bar
│       ├── touch.js         one finger; taps under 0.6 s apart glide instead of showing two dots
│       ├── pushes.js        iOS-style notification banners
│       ├── overlay-text.js  chapter cards, the thesis line, context and trust lines
│       └── act-a.js … act-e.js   one file per act, each owned by one builder agent
├── tools/
│   ├── still.mjs        stills and contact sheets (output or film time)
│   ├── capture_seq.mjs  high-fps PNG capture for the final render
│   ├── encode_seq.py    subframe blur + colour-managed BT.709 encode
│   ├── check_encode.py  brand colour, white and banding check on a delivered MP4
│   ├── interleave_seq.py  merges time-offset capture passes (multi-pass path; rarely needed)
│   ├── render.sh        draft / final / variant / mux in one command
│   └── audio/           synth_sfx.py, events.mjs, find_drop.py, mix.py (simple mix), mix_edl.py (bar-aligned edit)
├── assets/
│   ├── fonts/           Inter 400–800 + OFL.txt
│   ├── logo/            Griffel logo SVGs + NOTICE.md (not licensed for reuse)
│   ├── badges/          neutral placeholders for the store badges
│   └── audio/sfx/       synthesised sound effects (made by synth_sfx.py, no third-party samples)
├── renders/audio/       edl-orig.json, edl-vraag.json, cues-orig.json, cues-vraag.json (all other renders are git-ignored)
└── docs/
    ├── brief.md         the one-page brief: viewer, goal, one message, proof points
    ├── facts.md         every on-screen claim marked SAFE or not to be used, with its source
    ├── demo-meeting.md  the fictional meeting (Lisa, Daan, Sanne) and the two questions it must produce
    ├── storyboard.md    the build spec: non-negotiables, geometry contract, overlay rules, act-by-act beats
    └── ledgers/         what every critic and fixer reported, round by round
```

## Reading the docs

Read them in this order: `brief.md` → `facts.md` → `demo-meeting.md` → `storyboard.md` → the ledgers.

- **`ledger-round1.md`:** the act build, where each act's builder was followed by a fresh critic and a fixer.
- **`ledger-round2.md` to `ledger-round4.md`:** the global critic rounds. Each used three lenses (story, motion and brand/truth), then triage, then one fixer per file.
- **`ledger-round5.md`:** the targeted fixes and the verification after the final critic.
- **`ledger-variant-vraag.md`:** the variant, the time-scale change and that critic's verdict.
- **`round2-problems.json`, `round3-problems.json`:** the triaged notes in the form handed to the fixers. Each note has an owner, a severity, a time range, a format and a problem.

Some things in these docs are out of date or point somewhere you can't follow:

- **Time scale.** `storyboard.md`, parts of the ledgers and some code comments still say `SCALE` 1.1 (52.8 s, drop at 24.2). The final value is 120/110 = 1.0909 (52.36 s, drop at 24.0). `src/timeline.js` is authoritative.
- **Music in the brief.** `brief.md` names an Epidemic Sound track and a 48 s length. That was the plan before the music search; the final tracks came from Uppbeat, and the time scale made the film 52.36 s.
- **`griffel-app/...` paths** in comments and docs point to the product's private repository. They record where each string, token or screen layout was copied from, and that check is the point: every UI string was verified against the shipping app.
- **`<scratchpad>` paths** in the ledgers were temporary files of the session (backups, probe scripts). They are not included. Likewise, `renders/fixN/` paths in the ledgers name stills that are not included.
