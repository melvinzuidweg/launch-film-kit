# Launch film starter

A working starter project for a code-rendered product launch film: HTML pages whose every pixel
is a pure function of time, captured frame by frame by headless Chrome and encoded with ffmpeg.
Out of the box it renders a 12-second example (a fictional task app called "Acme") in 16:9 and
4:5 that shows every pattern once: a finished frame-0 hook, a phone with app UI, a tap, a push
banner, a camera push-in, a chapter card, a thesis line and an end card, on a 120 BPM grid.

Copy this folder to start a new film, then replace the placeholders (tokens, copy, logo) and the
example act.

## Setup

Needs Node 22.12+ (puppeteer-core 25 requires it), Chrome (or Chromium/Edge), ffmpeg with
`zscale` (libzimg), and Python 3.10+ with numpy and Pillow.

```bash
npm install            # gsap (optional HyperFrames bridge) + puppeteer-core (drives your Chrome)
node tools/doctor.mjs  # checks Node, Chrome, ffmpeg filters, Python packages
```

Chrome is found automatically (standard Windows, macOS and Linux locations). Set `CHROME_PATH`
to override, and `PYTHON` if your Python is not `python` (Windows) / `python3` (elsewhere).

## Commands

All times on the command line are **output** times (the video's clock). See "Film time and
output time" below.

```bash
# stills (PNG; rendered in ascending time order like the capture, so they match the render)
node tools/still.mjs --page index.html --times 0,2,5,9 --out renders/stills/169
node tools/still.mjs --page portrait.html --from 0 --step 0.5 --sheet --cols 6 --out renders/stills/45
node tools/still.mjs --page portrait.html --times 4 --scale 0.333   # feed check: 360 px wide
node tools/still.mjs --page index.html --film --times 4               # a FILM time from timeline.js
# seek-order test: the same times seeked out of order must give the same pixels (references/03 §10)
node tools/still.mjs --page portrait.html --times 2,3,4,6,7.8,10 --out renders/det/fwd
node tools/still.mjs --page portrait.html --times 10,7.8,3,6,2,4 --order listed --out renders/det/shuf

# video
node tools/render.mjs 169 draft                    # renders/film-169-draft.mp4: 60 fps, no blur
node tools/render.mjs 45 final                     # 480 fps capture, 8-subframe motion blur -> 60 fps
node tools/render.mjs 169 draft --from 0 --to 2    # just a piece (output seconds)
node tools/render.mjs 169 final --variant alt      # index-alt.html -> film-169-alt-final.mp4
node tools/render.mjs 169 final --audio renders/audio/mix.wav   # + film-169-final-audio.mp4
node tools/render.mjs 45 final --fps 30            # native 30 fps (LinkedIn ads): film-45-final-30fps.mp4

# QA
python tools/check_encode.py renders/film-169-final.mp4    # brand colour, white, banding, tags (judge banding on a final)
python tools/qa_motion.py renders/film-169-draft.mp4 --plot renders/qa-169.png   # freezes, spikes, peaks over --peak-max 6

# sound
python tools/audio/synth_sfx.py                            # assets/audio/sfx/*.wav (seeded)
node tools/audio/events.mjs --out renders/audio/cues.json  # cue list read from the film itself
python tools/audio/make_test_track.py                      # 120 BPM test track (never ship it)
python tools/audio/find_drop.py renders/audio/test-track.wav --cues renders/audio/cues.json
python tools/audio/mix_edl.py --edl tools/audio/edl.example.json --cues renders/audio/cues.json --out renders/audio/mix
# (-14 LUFS, true peak capped at -1.5 dBTP so the AAC mux stays under -1; measure the muxed MP4 too.
#  It prints whether loudnorm ran linear or dynamic and warns when it lands > 0.5 LU off target.)
# sound effects only (no music yet, or a teaser without music): an EDL like
#   {"music": null, "duration": 12.0, "sfx_gain": 0.5, "target_lufs": -14.0, "target_tp": -2.0}
# expect -14 to -16 LUFS via the dynamic mode; -2.0 dBTP because AAC lifts effects 0.4-0.6 dB

# logo
node tools/logo_from_svg.mjs assets/logo/logo.svg          # regenerates src/logo.js
```

Render cost (reference: 12-thread laptop): a draft captures ~15-25 frames/s; a final captures
8x as many frames (about 25 s of wall clock per second of film per format with 4 workers) at
roughly 0.1-0.25 MB per 1080p frame. Sequences are deleted after a successful encode unless
`--keep-seq`. The capture logs when each worker's frames are on disk and its teardown time: on
Windows, Chrome sometimes lingered about two minutes after the last frame, so it now gets 5 s
to close and is then killed. A seek or screenshot that hangs over 30 s (`--shot-timeout`)
restarts that worker's Chrome and retries the frame.

## File map

```
index.html, portrait.html           16:9 (1920x1080) and 4:5 (1080x1350) pages: same scripts, window.FORMAT
index-alt.html, portrait-alt.html   a variant: window.VARIANT = "alt" swaps the hook (COPY.variants.alt);
                                    they load act-example.js, so delete them with it (or rename for your variant)
src/engine.js        maths only: house curve, eased progress P(), win(), closed-form springs, noise, typed()
src/timeline.js      ALL times (film time), the bar grid, DROP, SCALE, camera framings and hand-offs
src/copy.js          ALL visible strings (PLACEHOLDER)
src/tokens.css       ALL colours, the font and the UI radius (PLACEHOLDER); JS reads them with Film.tok()
src/logo.js          generated from assets/logo/logo.svg by tools/logo_from_svg.mjs; never edit by hand
src/film.js          core: layers, camera, phone motion, taps, pushes, sfx cues, Film.type, frameT, runtime hooks
src/parts/stage.js        backdrop (tinted floor, rings, parallax), optional dark act, "Example" label
src/parts/phone.js        CSS phone frame, status bar, island (logical screen 393x852)
src/parts/act-example.js  THE EXAMPLE ACT: replace with your acts (one file per act)
src/parts/pushes.js       iOS-style push banners
src/parts/overlay-text.js chapter and statement cards in the text box (data from COPY.cards + T.O)
src/parts/touch.js        the one-finger touch-dot
tools/lib.mjs        static server, Chrome discovery, "open a film page and wait until ready"
tools/still.mjs, tools/capture_seq.mjs, tools/render.mjs, tools/encode_seq.py
tools/check_encode.py, tools/qa_motion.py, tools/doctor.mjs, tools/logo_from_svg.mjs
tools/audio/         synth_sfx.py, events.mjs, find_drop.py, mix_edl.py, make_test_track.py, edl.example.json
assets/fonts/        Inter 400-800 (SIL Open Font License, OFL.txt)
assets/logo/         logo.svg (placeholder) + notes
assets/audio/        sfx/ (generated), licensed/ (your music; git-ignored, never committed)
```

## Contracts

These rules are what make parallel work, motion blur and re-timing safe. Each one exists because
breaking it cost hours on the reference film.

1. **Every frame is a pure function of t.** Set every animated style inside `render(t)`, every
   frame. No timers, `requestAnimationFrame`, `Date`, `Math.random` (use `Eng.hash`/`Eng.noise1`),
   CSS transitions or animations. Why: the capture seeks frames out of order across parallel
   Chrome processes, and motion blur averages 8 seeks per output frame; any hidden state shows up
   as flicker or smear. Inside the world (the phone and its screens) use 2D transforms
   (`translate()`, `scale()`), never `translate3d()`: Chrome's raster state then depends on
   which frames were painted before (see the header of `src/parts/phone.js`).
2. **Times live only in `src/timeline.js`.** Parts read `T.*`; they never hard-code a time that
   exists there. Why: re-timing to music (or to a founder's "slower, please") becomes one edit,
   and the sound cues follow automatically (`events.mjs` reads the film).
3. **Strings live only in `src/copy.js`, colours only in `src/tokens.css`, logo geometry only in
   `src/logo.js`.** Why: a brand swap or a translation never touches motion code, and claims can
   be reviewed in one file against the facts file.
4. **One owner per file.** An act file is owned by one builder; it registers its own camera,
   phone, tap, push and sfx keys and keeps any helper it needs inside itself. `timeline.js` and
   the shared parts have a single owner. Why: parallel fixers editing shared files produced
   half-edited states that broke each other's renders. Before concluding that something outside
   your file is broken, re-render once.
5. **Film time vs output time.** Acts and `T` speak film time. The video plays at
   `output = film x T.SCALE` (set `SCALE = 120 / 110` to fit a 120 BPM film grid to a 110 BPM
   track). Tools, `window.__seek(t)` and audio cues speak output time; `Film.render` converts.
   Any text whose value changes (timers, counters, typed text) must be computed from
   `Film.frameT(t)`, so all 8 motion-blur subframes of an output frame show the same value.
6. **Write on whole bars.** Put the hook, the key tap (`T.DROP`) and the logo lock on bar lines.
   Music edits then jump whole bars and the beat never stumbles.
7. **Overlay text.** Never two cards in the text box at once (`Film.type.goneAt(out)` <= the
   next card's `in`); cards leave as one block; keep a thesis line fully readable >= 1.8 s.
   `L.minText` (30 px in 16:9, 28 px in 4:5) is only the floor for labels and fine print: at
   360 px feed width it reads as ~6 px (16:9) and ~9 px (4:5). Story-critical text needs the
   minimums in the kit's `references/02-story-and-storyboard.md` §8 (4:5: chapter words and
   payoff >= 48 px, UI text the story depends on >= 30 px on screen; 16:9 roughly 1.8x that if
   it must survive a feed). Check with `still.mjs --scale 0.333` (4:5) or `--scale 0.1875`.
8. **Truth.** App UI strings verbatim from the app, push copy from the code that sends it, claims
   only from the facts file, fictional content labelled ("Example", `T.exampleLabel`).

## Geometry

- Screen space: output pixels. World space: the phone centre is (0, 0), 1 world px = 1 logical
  app px at zoom 1. Phone space: the app screen, 0..393 x 0..852.
- Rest cameras (`L.cam0`): 16:9 puts the phone right of centre (x 1340) with a text column on the
  left (x 170-950); 4:5 puts the phone low with the text box on top (y 110 down).
- `T.frame[format](lx, ly, sx, sy, z)` returns the camera that puts phone point (lx, ly) at
  screen (sx, sy) at zoom z. Check that the phone stays clear of the text box while text is up.
- Camera keys compose in time order and zoom in log space; overlapping keys blend, so start the
  next key before the previous one lands when you want no stall. Between acts, end on a shared
  hand-off framing (`T.handoff`, `Film.handoff("AB")`) instead of returning to rest each time.
- Inside the phone screen: act screens z 1-40, status bar 50, pushes 60, island 70, touch 80.
  A screen change is an iOS-style horizontal push (~0.35 s), never a one-frame cut.

## Adding an act

1. Create `src/parts/act-<name>.js` with `Film.register({ id, order, mount(ctx), render(t, ctx) })`
   (copy the structure of `act-example.js`; `order` anywhere between 5, the phone, and 80, the
   overlay text). When your acts replace the example, remove `act-example.js` and its `<script>`
   tags, and also `index-alt.html`, `portrait-alt.html` and `COPY.variants.alt`, which load it.
2. Add its times under a new key in `src/timeline.js` and its strings in `src/copy.js`.
3. Add a `<script>` tag for it to **every** page (index, portrait and each variant), after
   `phone.js` and before `pushes.js`.
4. Render stills across its window in both formats, run the seek-order test with a backward seek
   across your act, then a draft, then `qa_motion.py`.

## Determinism pitfalls (all hit in practice)

- `visibility: visible` on a child overrides a hidden parent: use `inherit`.
- `will-change` makes rasterisation depend on the seek order: do not use it.
- So does `translate3d()` on anything the camera scales (the world layer, the phone, its screens):
  after the phone's exit, a seek back drew the status bar 1 px lower. Use 2D transforms there.
- Text measured before its font loaded is wrong: the tools await `Film.ready()` before seeking;
  prefer layout that needs no measuring (flex columns, constants).
- Images must be loaded before capture: `Film.ready()` decodes every `<img>`.
- Mixed RGB/RGBA PNGs in one sequence make ffmpeg silently drop frames: `encode_seq.py`
  normalises modes and checks the frame count.

## Known limitations

- The capture is screenshot-based (CDP `Page.captureScreenshot`), not BeginFrame: deterministic
  in content, but a few frames may differ by a pixel between machines or Chrome versions.
- Only two formats are laid out (16:9, 4:5). A 9:16 layout means a third entry in `LAYOUTS`
  (`src/film.js`) and per-format branches in the acts.
- `check_encode.py` default sample regions fit the example's frame 0; move them for your layout.
- Motion blur is 8 discrete subframes. A very fast move (the example's phone rise peaks around
  28 px per output frame) shows stepped copies in a paused frame; in playback it reads as blur.
  Slow the move or capture more subframes (`--sub 16`, 960 fps) if it bothers you.
- `tools/lib.mjs` looks for Chrome in the standard Windows, macOS and Linux locations; only the
  Windows path was exercised when this template was built. Set `CHROME_PATH` if discovery fails.
- The phone frame is a generic CSS device, not an Apple asset. App Store previews must be real
  screen captures, so a rebuilt-UI film is a marketing film, not a store preview.
- Store badges and music are not included: use official badge artwork you may use
  (`COPY.end.badges`) and licensed music in `assets/audio/licensed/`.

## Optional: HyperFrames

The pages carry HyperFrames' composition attributes on the root, expose a paused GSAP timeline
(`window.__timelines.main`) and honour the `hf-seek` event, so `npx hyperframes render` can render
them. This project does not need it: its own capture is direct, supports 480 fps and gives stills
that match the frames. If you use it, pin an exact version (0.8.81 or newer), set
`HYPERFRAMES_NO_TELEMETRY=1`, keep `data-duration` off the static markup, and use it for drafts:
its CLI still has no motion blur and stops at 240 fps. The kit's `references/05-render-and-encode.md` §8 has the state
as of HyperFrames 0.8.138 (October 2026).

## Licences

Inter: SIL Open Font License 1.1 (`assets/fonts/OFL.txt`). npm packages are installed under
their own licences (puppeteer-core: Apache-2.0; GSAP: its own standard licence). Nothing
third-party is vendored. The placeholder logo and example copy are part of this template.
