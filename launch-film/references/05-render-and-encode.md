# 05 · Render and encode

This stage turns a seekable page into delivery files. Everything before it decides what the film says and how it moves; this stage decides whether that survives the trip to an MP4. In the Griffel case it nearly didn't: the first MP4s shifted the brand green, turned white into off-white, banded the near-white background and would have strobed fast moves. None of that is visible in a browser preview, and all of it is visible on a phone.

The reference scripts are in `examples/griffel/tools/` (`still.mjs`, `capture_seq.mjs`, `encode_seq.py`, `check_encode.py`, `render.sh`); command lines and environment variables below are the case's. The starter template wraps its own version of this pipeline in `tools/render.mjs` (`npm run draft`, `npm run final`). In a project started from the template, use these:

| The case (`render.sh`, env vars) | The template (`tools/render.mjs`) |
|---|---|
| `bash tools/render.sh 169 draft` | `node tools/render.mjs 169 draft` |
| `bash tools/render.sh 45 final` | `node tools/render.mjs 45 final` |
| `VARIANT=vraag bash tools/render.sh 169 final` | `node tools/render.mjs 169 final --variant <name>` |
| `bash tools/render.sh 169 final mix.wav` | `node tools/render.mjs 169 final --audio renders/audio/mix.wav` |
| `FINAL_FPS=30 SUB=8 ...` | `node tools/render.mjs 45 final --fps 30` (also sets the page's `T.OUT_FPS`) |
| `KEEP_SEQ=1 ...` | `--keep-seq` (and `--resume` to reuse captured frames) |
| a piece of the film | `--from <s> --to <s>` (output seconds) |

## Contents

1. [The pipeline at a glance](#1-the-pipeline-at-a-glance)
2. [Draft vs final](#2-draft-vs-final)
3. [Motion blur: 480 fps capture, 8-subframe tmix](#3-motion-blur-480-fps-capture-8-subframe-tmix)
4. [Capture: local server, one Chrome per worker](#4-capture-local-server-one-chrome-per-worker)
5. [Colour management](#5-colour-management)
6. [Checking the encode](#6-checking-the-encode)
7. [Budgeting time, disk and memory](#7-budgeting-time-disk-and-memory)
8. [HyperFrames as an option](#8-hyperframes-as-an-option)
9. [Platform delivery specs](#9-platform-delivery-specs)
10. [Posters, contact sheets and phone previews](#10-posters-contact-sheets-and-phone-previews)
11. [Exit checklist for this stage](#11-exit-checklist-for-this-stage)

---

## 1. The pipeline at a glance

```
page (pure function of t, window.__seek(tOut))
   │  served over http://127.0.0.1:<port>  (never file://)
   ▼
capture: lossless PNG per frame          draft: 60 fps          final: 480 fps (60 x 8)
   │  normalise PNG modes (RGB vs RGBA)
   ▼
ffmpeg: widen to 16 bit ─> [tmix 8 + keep 1 in 8] ─> BT.709 matrix, limited range, dither ─> x264, tagged
   │
   ▼
check_encode.py (brand colour, white, banding, tags) + frame count + QA (see 07)
   │
   ▼
mux audio (see 06) ─> derivatives: 30 fps ad cut, phone previews, posters, contact sheets
```

Three principles hold the pipeline together:

- **Capture lossless, encode once.** Every path writes PNGs and goes through one encoder script. A renderer's built-in MP4 output is a black box for colour; a PNG sequence is not.
- **Time is the only input.** The capture tool calls `window.__seek(t)` for each frame. Nothing depends on wall-clock time, so a frame can be captured by any worker, in any order, at any frame rate (see 03 for how the page guarantees that).
- **Output time is the renderer's clock.** When the film is time-scaled to fit the music (see 06 §5), every tool talks output time (`film time × SCALE`). The page converts back. Mixing the two clocks is the easiest way to get a drop that misses by 9 %.

---

## 2. Draft vs final

| | Draft | Final |
|---|---|---|
| Purpose | Critic rounds, timing checks, a first look at the mix | Delivery, after picture lock and after the music is aligned |
| Capture rate | 60 fps | 480 fps (60 × 8 subframes) |
| Motion blur | None | 8-subframe average, 360° shutter |
| Capture tool | HyperFrames `render --format png-sequence` (case) or the direct capture tool | `capture_seq.mjs`: direct `window.__seek`, one Chrome per worker |
| Encode | Same colour chain, `--sub 1`, x264 `medium` | Same colour chain, `--sub 8`, x264 `slow`, CRF 10 |
| Time (48–52 s film, 6-core laptop) | 3.5–7.5 min per format at 2 workers | 10.7–15.5 min capture + encode, about 20 min per format end to end |
| Disk while running | ~0.5 GB | ~4.5 GB per format (deleted after the encode) |

**Use stills for most review.** A contact sheet of 40 stills takes seconds and answers most questions a critic asks (overlaps, clipped text, empty frames, colour). Drafts are for motion: pacing, frame-difference spikes, frozen runs and the feel of a transition. Finals are for delivery only. In the case, critics worked mostly from stills and contact sheets, with draft renders for motion; the four finals (2 formats × 2 variants) ran back to back in about 80 minutes at the very end.

**Render the final only after the music is aligned.** A change of `SCALE` changes the output length and every frame time, so a final rendered before the music choice has to be thrown away. In the case the film was retimed from 48 s to 52.36 s after the tracks were chosen (see 06 §5).

**Draft encodes use the same colour chain as finals.** A draft that shifts colour sends critics after a problem that is not in the film. In the case, critics in two consecutive rounds reported "the brand green is off" before the encode was fixed.

---

## 3. Motion blur: 480 fps capture, 8-subframe tmix

A 60 fps frame of a fast move without blur is a sharp snapshot, and a sequence of sharp snapshots reads as stutter. Real cameras smear motion across the shutter time. The pipeline imitates that: capture several subframes per output frame and average them.

```
capture at OUT_FPS × SUB    (60 × 8 = 480 fps)
average SUB consecutive frames in 16 bit          tmix=frames=8
keep one frame in SUB                              select='eq(mod(n\,8)\,7)'
re-time to OUT_FPS                                 setpts=N/(60)/TB
```

Output frame k is the mean of capture frames 8k … 8k+7, which covers output times k/60 to k/60 + 7/480. That is a 360° shutter: the blur spans the whole frame interval. Its centre sits about 7 ms after the nominal frame time, which is far below anything you can see or hear.

### Why 8 subframes, not 4

The obvious workaround in the HyperFrames community is `--fps 240` and `tmix=frames=4`, because 240 fps is the CLI's ceiling. The case started there and a critic flagged it before the final: **with 4 subframes, a fast move does not blur, it shows 4 stepped copies.** The gap between copies is the distance moved per output frame divided by the subframe count:

| Move in the case | Speed (px per output frame) | Gap at 4 subframes | Gap at 8 subframes |
|---|---|---|---|
| Send "whip", 4:5 | 17 | 4 px | 2 px |
| Send "whip", 16:9 | 47 | 12 px | 6 px |
| First light-to-dark iris edge | 95 | 24 px | 12 px |

When a critic asked to slow the 47 px/frame whip, the fixer kept it, because the final's 8-subframe blur (6 px gaps) covers it; the delivered film bore that out. The 95 px/frame iris was replaced for other reasons (it read as a dated slide transition and was the largest frame difference in the film). As a practical ceiling, keep the fastest element around 50 px per output frame at 8 subframes; that is a judgement from this one case, not a measured limit. If something has to move faster, slow it down or hide it behind another motion rather than raising the subframe count; 16 subframes doubles the capture time again.

### Things the blur changes in the film itself

- **Value-changing text smears.** A running timer averaged over 8 subframes shows 8 different digits on top of each other. The fix is in the page: compute the displayed value from time quantised to the output frame grid (`Film.frameT(t)` in the case, `floor(t × SCALE × 60 + 1e-6) / 60 / SCALE`). Then all 8 subframes show the same digits. Quantising to the film grid (`floor(t × 60) / 60`) is wrong as soon as `SCALE ≠ 1`; the case had exactly that bug in its timer until the variant review caught it.
- **Frame-difference numbers drop.** Critics who measure frame differences on an unblurred draft overstate the final. In the case a logo move measured 11.99 on the draft and 10.0 with blur. Measure on the final, or simulate the blur by averaging 8 stills (see 07).
- **Crossfades get smoother, not slower.** Blur does not change timing, only edges. A transition that reads as a hard cut in the draft still reads as one in the final.

### 30 fps deliveries

LinkedIn ads require under 30 fps (see §9). Render those natively: `node tools/render.mjs 45 final --fps 30` in the template (`FINAL_FPS=30 SUB=8` in the case) captures 240 fps and gives a 30 fps file with the same 360° blur in half the capture time. The page's output frame rate must be 30 too, so `frameT` quantises to the 30 fps grid; the template's render passes it to the capture (`--out-fps`), and in the case it meant setting `T.OUT_FPS = 30`. Dropping every other frame from the 60 fps master also works, but it halves the effective shutter (180° instead of 360°), so fast moves look choppier than in a native 30 fps render.

---

## 4. Capture: local server, one Chrome per worker

The direct capture tool (`capture_seq.mjs`) is about 120 lines. It exists because HyperFrames refused the 480 fps job (see §8), and it turned out simpler to reason about. In the case its output was pixel-identical to the stills tool. In a later test of the template, stills (which seek in ascending order, like the capture) matched the captured frames within 2 levels.

**What it does, and why each part is there:**

- **Serves the project over `http://127.0.0.1:<random port>`.** Chrome blocks font loading on `file://` URLs, so a page opened from disk silently renders in a fallback font and every text measurement is wrong. The server is a dozen lines of `node:http` with a MIME map; it refuses paths outside the project root.
- **Drives the system Chrome through `puppeteer-core`** (`CHROME_PATH` overrides the default path). No browser download, and the same Chrome you preview in.
- **Launches one Chrome process per worker.** With one browser and several tabs, the background tabs fail `Page.captureScreenshot` (as far as we could tell, because a background tab is not being painted). Separate processes each have a foreground tab.
- **Launch flags:**
  - `--force-color-profile=srgb`: screenshots return the page's sRGB values, not values converted to the display's colour profile.
  - `--hide-scrollbars`: no scrollbar gutter in a 1920 px viewport.
  - `--disable-background-timer-throttling`, `--disable-renderer-backgrounding`: keep a busy worker from being throttled.
  - `--disable-gpu-vsync`.
- **Viewport at `deviceScaleFactor: 1`** with the format's size (1920×1080 or 1080×1350), and a `clip` of exactly that rectangle.
- **Waits for `document.fonts.ready`** before the first seek.
- **Gives each worker one contiguous range** of frame indices and seeks strictly forward. Seek order should not matter in a deterministic page, but forward order is the cheapest insurance.
- **Warm-up seek 0.5 s before the worker's first frame.** Chrome keeps some rasterisation state from the first frame a page paints (in the case the phone's anti-aliased edges differed by up to 11 levels depending on which frame was painted first). The warm-up makes the first frame of every chunk come from the same kind of settled state.
- **Names frames by global index** (`frame_000000.png`, t = index / fps), so the encoder sees one sequence regardless of how many workers wrote it.
- **`--resume`** skips frames that already exist with a non-zero size. A capture that dies at 80 % costs 20 % to finish.
- **Collects page errors** and exits non-zero if there were any. A 404 for a missing image is easy to miss in a 25,000-frame log.
- **Reads the length from the page** (`window.T.OUT_DURATION`) unless `--to` is given, so a re-timed film never captures the old length.
- **Never waits long on Chrome** (template only). Each worker logs when its last frame is on disk. `browser.close()` gets 5 s, and then the Chrome process tree is killed: on Windows the main browser process sometimes lingered for about two minutes after the last frame, which made a 40 s draft capture report 2.4 min (08 §3). A seek or screenshot that takes longer than `--shot-timeout` (30 s) restarts that worker's Chrome and retries the frame, at most 3 times per worker.

```bash
node tools/capture_seq.mjs --page portrait.html --fps 480 --workers 4 --out renders/seq-45-480
python tools/encode_seq.py renders/seq-45-480 renders/film-45-final.mp4 --in-fps 480 --sub 8
```

**Windows screenshot capture is not byte-reproducible.** Two captures of the same frame can differ by 1–2 levels in a few pixels. Compare frames with a tolerance (max difference ≤ 2, or a mean difference), never with file hashes.

---

## 5. Colour management

### What went wrong

The first MP4s (HyperFrames 0.8.68's own encode; HyperFrames fixed its matrix in 0.8.81, see §8) measured:

| Colour | Source | Decoded from MP4 |
|---|---|---|
| Brand mark | #1ABA6D | #16B867 |
| Wordmark ink | #121316 | #0F1013 |
| White stage | #FFFFFF | #FDFFFF |
| Near-white gradient | smooth | an R step from 246 to 242 in one row (a visible band) |

#16B867 is a slightly darker, duller green and #FDFFFF a faint cyan tint. Small numbers, but brand colours are the one thing a founder will hold up against the website.

### Why it happens

- **An implicit BT.601 matrix.** Converting RGB to YUV needs a matrix. When none is given, ffmpeg's swscale uses BT.601 coefficients. Players decode HD video with BT.709. The mismatch shifts saturated colours (greens most visibly) and nudges white.
- **Range mixing.** PNGs are full range (0–255); H.264 delivery is limited range (16–235). If one step assumes the wrong range, white lands a level or two off.
- **8-bit rounding in the blur and no dither.** Averaging 8 frames in 8 bit rounds every result, and a smooth near-white gradient quantised to 8 bit without dither turns into steps.
- **Encoder tuning that removes the dither.** `-tune animation` lowers adaptive quantisation, which flattens fine noise in flat areas, so the dither that hides banding is the first thing the encoder throws away.

### The chain that fixed it

From `encode_seq.py`, in order:

```
format=gbrp,
setparams=range=pc:color_primaries=bt709:color_trc=bt709:colorspace=gbr,
zscale=rangein=full:range=full:dither=none,
format=gbrp16le,                                   # widen to 16 bit with zscale
tmix=frames=8, select='eq(mod(n\,8)\,7)',          # final only: blur in 16 bit
setpts=N/(60)/TB,
setparams=range=pc:color_primaries=bt709:color_trc=bt709:colorspace=gbr,
zscale=matrix=709:range=limited:primaries=709:transfer=709:chromal=left:dither=error_diffusion,
format=yuv420p
```

```
-c:v libx264 -preset slow -crf 10 -pix_fmt yuv420p
-x264-params aq-mode=3:aq-strength=0.9:deblock=-1,-1:colorprim=bt709:transfer=bt709:colormatrix=bt709:range=tv
-color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv
-movflags +faststart
```

Step by step:

1. **Tag the PNGs as what they are:** RGB, full range, BT.709 primaries and transfer. That tells zscale to convert nothing except the matrix. The browser's sRGB pixel values pass through unchanged, which is what players expect from BT.709-tagged web video.
2. **Widen to 16 bit with zscale, not swscale.** swscale's `format=gbrp16le` maps 255 to 65280 (a shift, not a scale), which put white at Y 234 and every colour about 0.9 levels too dark. zscale maps 255 to 65535.
3. **Blur in 16 bit**, so the average of 8 frames keeps its fractions.
4. **Convert with an explicit BT.709 matrix to limited range, with error-diffusion dither** (about 1 level of noise) on the way down to 8 bit. The dither breaks gradient steps into noise the eye averages out.
5. **4:2:0 chroma sited left** (the H.264 default), so chroma does not shift half a pixel.
6. **Tag the stream** in both the container and the H.264 VUI: BT.709, TV range. An untagged file leaves the player guessing, and different players guess differently.
7. **x264 keeps the dither:** no `-tune animation`; `aq-mode=3` (auto-variance with a bias toward dark scenes), `aq-strength=0.9`, slightly weaker deblocking (`-1,-1`).
8. **CRF 10, preset slow.** That sounds extravagant, but flat UI compresses well: the 52 s finals came out at 7.6 Mbps (4:5, about 50 MB) and 9.9 Mbps (16:9, about 66 MB). Every platform re-encodes what you upload, so a master with headroom loses less in their encode.

### PNG modes and the frame-count check

Chrome screenshots are mostly RGB, but a few frames come out RGBA (a one-pixel capture seam with alpha around 0.85). The case saw this in both HyperFrames and direct capture: from 2 to 773 RGBA frames per 23,000–25,000. When the pixel format changes mid-sequence, ffmpeg rebuilds the filter graph. That restarts `tmix` and `select`, and frames disappear without an error: a 48-frame test came out as 29 frames.

`encode_seq.py` therefore:

1. reads every PNG's mode (8 threads, Pillow) and converts the minority frames to the majority mode before encoding (alpha is dropped, the straight RGB kept);
2. counts the output frames with `ffprobe -count_packets` and fails if the count is not `captured_frames // SUB`.

Keep both steps even if your first sequence is clean. The RGBA frames appear in some renders and not others.

---

## 6. Checking the encode

`check_encode.py` decodes frames from the MP4 and checks them against the source colours. It decodes with an explicit BT.709 limited-to-full matrix (`zscale=matrixin=709:rangein=limited:matrix=709:range=full`). That matters: decoding with ffmpeg's defaults can apply the same wrong matrix in reverse, and a checker that makes the inverse mistake passes a broken file.

| Check | How | Pass |
|---|---|---|
| Tags | ffprobe: `yuv420p`, `color_range=tv`, `bt709` space/transfer/primaries | all present |
| Brand mark | End-card frame. Pixels within 24 levels of the brand colour, eroded by 3 px to drop anti-aliased edges; take the median | every channel within ±2 |
| White | A text-free region of frame 0 | median 255 ± 1 and 1st percentile ≥ 253 |
| Banding | Columns clear of text in the frame-0 gradient, averaged over 24 px horizontally; the step between the 5 rows below and the 5 rows above every row boundary | with a source PNG (`--ref-dir`): the decoded-minus-source step ≤ 1.0 in the case's script (the template's `check_encode.py` allows 1.5, `--band-max` to change it); without: ≤ 3 |

```bash
python tools/check_encode.py renders/film-169-final.mp4 --mark-t 47.5 --ref-dir renders/stills/check
```

The regions and times are film-specific (where the mark sits on the end card, which part of frame 0 is plain background). Set them once per project and keep them in the script.

**Judge banding on a final, not a draft.** A CRF 14 draft adds quantisation steps of its own: in two tests of the template, frame 0 read 1.9-2.1 on drafts against 1.05-1.29 on finals of the same frame, with the limit at 1.5. A draft failure is therefore not an encoder bug. Before the full final exists, render half a second of it and compare it with the matching still:

```bash
node tools/render.mjs 45 final --from 0 --to 0.5
node tools/still.mjs --page portrait.html --times 0 --out renders/check-ref
python tools/check_encode.py renders/film-45-final-0-0.5.mp4 --checks tags,white,banding --ref-dir renders/check-ref
```

On a draft, skip banding (`--checks tags,white,mark`) or read it against `--band-max 2.5`. A final frame averages 8 subframes over about 15 ms, so it matches the still only where the stage does not move in that time; frame 0 does in the template.

**Case result after the fix:** brand green within 1 level of #1ABA6D, white exact, no banding over the source, tags correct, in all four finals.

---

## 7. Budgeting time, disk and memory

### Formulas

```
capture frames  = output_seconds × OUT_FPS × SUB             52.36 × 60 × 8 ≈ 25,100
disk            = frames × 0.17–0.2 MB (1080p-class PNG)     ≈ 4.3–5 GB per format
capture time    = frames ÷ capture rate                      25,135 ÷ 35 fps ≈ 12 min
encode time     ≈ 5–8 min per format (estimated from render timestamps; x264 slow, 3,141 output frames from 25k PNGs)
```

### Measured in the case (Windows 11, 6-core/12-thread i7 laptop, 4 workers)

| Job | Frames | Time | Rate |
|---|---|---|---|
| Draft 16:9 via HyperFrames, 2 workers | 2,880 | 3.5–7.5 min | 6–14 fps |
| Draft 4:5 via HyperFrames, 2 workers | 2,880 | ~5 min | ~9 fps |
| Final capture 16:9, 480 fps | 23,040–25,135 | 11.6–15.5 min | 25–37 fps |
| Final capture 4:5, 480 fps | 23,040–25,135 | 10.7–13 min | 29–39 fps |
| Four finals, capture + encode + mux, back to back | | ~80 min | |

The PNG size depends on content: flat UI frames were 50–500 KB, most around 170 KB in 16:9.

### Practical rules

- **Check free disk before a final.** The case machine had about 40 GB free. The render script deletes each sequence after a successful encode (`--keep-seq` in the template, `KEEP_SEQ=1` in the case, keeps one for debugging), so only one 4–5 GB sequence exists at a time.
- **Memory, not CPU, sets the worker count.** The machine had 24 GB RAM with only 1.4–3 GB free while other apps ran. Four Chrome processes worked. Close heavy apps (including the browser you browse with) before a final.
- **Render formats one after another.** The case ran the four finals sequentially; parallel captures compete for the same cores and memory.
- **Do not edit the page or the render script while a final runs.** Each worker loads the page once at launch, so an edit does not change a running worker, but a `--resume` run (or a restarted worker) loads the new code and you get a film stitched from two versions. Bash reads a running script incrementally, so editing `render.sh` mid-run changes what the running job does next (see 08).
- **Run long renders in the background and poll the log.** The capture prints progress every 500 frames with an ETA.

---

## 8. HyperFrames as an option

HyperFrames (HeyGen, Apache-2.0) was the planned renderer. In the end it rendered the drafts and a few cross-checks; the finals went through the direct capture tool. It is still a reasonable choice, especially for its studio preview, lint and GSAP integration. Keep your page renderer-agnostic (a `window.__seek(t)` that renders any time) so you can drop it at any point without touching the film.

**What it gives you:**

- A scrubbable preview studio (`npx hyperframes preview`) the founder can use to give timed notes. On macOS and Linux there is also the Studio desktop app (see below).
- `lint`, `doctor`, `check`, `snapshot`, and `clean` (since 0.8.87) to remove leftover render temp folders.
- A GSAP adapter (`window.__timelines`), so a page with one registered root timeline is seekable without extra work.
- Parallel workers and PNG-sequence output.

**Status as of 0.8.138 (6 October 2026; the case used 0.8.68).** The project is still pre-1.0 and ships about five releases a day, so re-check the open issues named below before you rely on any line here. Points marked *from source* were read in the HyperFrames code but not run by the case.

- **Pin an exact version, 0.8.81 or newer.** Use `save-exact=true` in `.npmrc`. If your npm setup enforces a minimum release age (the case machine required 7 days), take the newest version at least that old. 0.8.69 fixed a font race that made renders differ between worker counts (#4359), and 0.8.81 fixed the colour matrix of its MP4 (below). 0.8.113 and 0.8.116 changed how a seek lands on an exact tween boundary (#4911, #4942), so after an upgrade, re-take the key stills and compare.
- **Disable telemetry.** It is still on by default. Set `HYPERFRAMES_NO_TELEMETRY=1` (or `DO_NOT_TRACK=1`) in the environment of every command, or run `hyperframes telemetry disable` once. Since 0.8.78 the web studio that `hyperframes preview` starts honours the opt-out too; the desktop app records usage data under its own notice. *From source:* a `--docker` render does not pass the variable into its container, so the render inside it probably sends telemetry; don't use `--docker`.
- **`--fps` still stops at 240, and the render CLI still has no motion blur.** Issue #4833 and draft PR #4072 are open. For 8 subframes at 60 fps you need 480 fps, which means two offset passes interleaved (`interleave_seq.py` and a page-side time offset in the case) or your own capture. Two other routes exist, neither used in the case:
  - *From source:* the engine's whole-frame blur is reachable only from Node, by calling `@hyperframes/producer` (`createRenderJob` with a `motionBlur` option; `shutterAngle: 360, shutterPhase: 0` matches the §3 window). It captures PNG, refuses shader transitions, HDR and injected `<video>`, rounds the average to 8 bit without dither, and on Windows or macOS with a hardware GPU needs draw-element capture (a faster path that draws the page into a canvas instead of taking a screenshot) switched off (`useDrawElement: false`).
  - The `motion-blur` catalog component (`data-hf-motion-blur` on an element) blurs only the transforms of the elements you mark, and only when GSAP tweens move them. It runs in the page, so the plain CLI captures it, but it samples the timeline with callbacks suppressed. *From source, untested:* on this skill's pages, where one proxy tween's `onUpdate` calls `Film.render`, it should find no motion and draw no smear. The `motion-blur-streak` rule in HyperFrames' own skills is a drawn effect (blur filter or ghost copies), not temporal blur.
- **The disk pre-check still refuses high-rate PNG jobs.** Unchanged since 0.8.51. *From source:* for PNG it estimates frames × width × height × 4 bytes, the raw RGBA size, against 90 % of the free space on the volume that holds the render's work folder: the temp folder (`os.tmpdir()`) on Windows, the output folder on macOS and Linux. `--format png-sequence` always captures to disk as PNG. The 4:5 frame at 1080 × 1350 comes to about 5.8 MB, while the real PNG was about 0.2 MB, so one 240 fps pass of a 48 s film was refused on a machine with 40 GB free. No flag, config or variable skips the check. On Windows, pointing `TEMP`/`TMP` at a drive with more free space should make the check use that drive (untested), but one 240 fps pass of a 48 s film at 4:5 would still need about 75 GB free for about 2.3 GB of real frames. PR #4061, which would halve the estimate, is open. This is why `capture_seq.mjs` exists.
- **Its MP4 colour is fixed, but use it only for a quick look.** Since 0.8.81 (#4564) the MP4 is converted and tagged as BT.709. Upstream measured saturated page colours within about 2 code values (its JPEG capture can add about one more), so the shifted green in §5 should no longer happen there; the case did not re-measure it. For critic drafts and the final, still render `--format png-sequence` and encode with the chain in §5, so drafts match the final (§2). *From source:* the MP4 path captures JPEG frames at quality 80, stays 8 bit with no dither, so near-white gradients can still band, and its best preset is CRF 15 with stronger deblocking. It also cannot blend subframes.
- **How it captures.** BeginFrame, the single-step capture, is used only on Linux with chrome-headless-shell for opaque formats (mp4, hls). *From source:* `--format png-sequence` never uses BeginFrame, even on Linux, because it is an alpha format; it uses screenshots unless you force draw-element capture with `--experimental-fast-capture`. On Windows and macOS with a hardware GPU, an MP4 render may use draw-element capture. That is checked against screenshots and falls back to them, so two runs can take different paths. `--docker` does not give BeginFrame either: the container forces software GPU and screenshot capture. Expect 1–2 levels of run-to-run noise (the case's measurement) and compare with a tolerance.
- **Parallel workers on Windows and macOS share one Chrome as separate pages.** *From source:* that is still the default at 0.8.138. HyperFrames' own code says screenshots are then taken one at a time per browser, so extra workers may add little speed. The case's HyperFrames drafts ran this way with 2 workers (§7); the case's direct capture failed on `Page.captureScreenshot` in the same setup, which is why its own tool runs one Chrome per worker (§4). `PRODUCER_ENABLE_BROWSER_POOL=false` should give each HyperFrames worker its own Chrome; this is untested.
- **PNG sequences are documented as RGBA, and the page background is cleared.** *From source:* the html and body backgrounds are made transparent and only the composition root keeps its own, so paint the stage colour on an element, not on `body`. The frame modes still mix: with an opaque stage, the case's HyperFrames drafts came out mostly RGB with a few RGBA frames (§5), and upstream #4610 saw RGB frames among RGBA ones (fixed for GIF only). Keep the mode normalisation in §5.
- **A static `data-duration` in the markup wins over one set from script.** After the time-scale change, a render produced 2,880 frames (the old 48 s) instead of 3,168. Remove the static attribute and set it from an inline script right after the root element. `hyperframes lint` then reports `root_composition_missing_duration_source`, which is a false positive in this setup. So is `missing_timeline_registry` when you drive rendering from your own seek function; a root `data-no-timeline` attribute silences it, but only use that if nothing registers a timeline (untested in the case).
- **It renders composition markup, not any page.** The root element needs `data-composition-id`, `data-width` and `data-height`, and the timeline must be registered in `window.__timelines` (the template's pages do both). Neither `preview` nor the Studio app opens an arbitrary URL.
- **Leave the cloud features off.** Its HeyGen voices and music library need a HeyGen sign-in. Without one it falls back to local voices and to generated music (Lyria through a Google API key, or local MusicGen). The optional asset captioning sends screenshots to a third-party model API when a key is set. None of it is needed.
- **Reported by others, not hit in the case:** on Windows 11, Smart App Control can block the image library behind `hyperframes snapshot`; make contact sheets with ffmpeg if that happens.

**The Studio desktop app** ([hyperframes.dev](https://www.hyperframes.dev/), checked 6 October 2026). You describe a film, a local agent (Claude Code or Codex) builds it, and you change it by typing, pointing at the picture, drawing or commenting. HyperFrames calls it free (agent runs bill to your own Claude or ChatGPT plan), but it needs a HeyGen account sign-in, and by default the agent runs with full access to the machine. There are Mac and Linux builds; Windows is listed as coming soon. Its projects are ordinary HyperFrames folders. `hyperframes open <dir>` hands an existing project from the terminal to the app (macOS only at 0.8.138), and `hyperframes catch-up` tells the terminal agent what changed in the app since. For this process it is at most a notes surface: a founder on a Mac can point at the frame they mean. The renders and the critic loop stay as in this skill.

**HyperFrames' own skills.** HyperFrames ships 21 agent skills (install: `claude plugin marketplace add heygen-com/hyperframes`, then `claude plugin install hyperframes@hyperframes`). Among them, `product-launch-video` and the new-film plan in `hyperframes-studio` overlap with this skill. Their launch rules differ in places: `hyperframes-studio` asks for a screen recording of the product and never an approximated UI, and `product-launch-video` uses the site's captured screenshots rather than a rebuild, while this skill rebuilds the UI from the product's source with literal copy (03, 07). If both are installed, decide up front which one leads the film. If this one leads, use theirs only for renderer-specific advice.

Draft command used in the case:

```bash
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes render . -c index.html -o renders/seq-169-draft \
  --format png-sequence --fps 60 -w 2 --quiet
python tools/encode_seq.py renders/seq-169-draft renders/film-169-draft.mp4 --in-fps 60 --sub 1 --preset medium
```

---

## 9. Platform delivery specs

Researched on 2026-10-01 from each platform's help pages; specs change, so check them again before a launch. Rows marked "unverified" came from third-party summaries.

| Destination | Format to send | Key limits | Notes |
|---|---|---|---|
| **LinkedIn feed** (member post) | 4:5, 1080×1350, 60 fps, H.264, AAC | 3 s–15 min; 75 KB–5 GB; 256×144 to 4096×2304; 10–60 fps; aspect 1:2.4 to 2.4:1 | Autoplays muted, so the film has to work without sound. The case used 4:5 for the feed. SRT captions upload on desktop only. Upload natively from a personal profile rather than posting a link; in the Dutch B2B case, LinkedIn was where the audience was. |
| **LinkedIn ads** | 4:5, 1:1, 16:9 or 9:16 at **under 30 fps** | 3 s–30 min; 75 KB–500 MB | A 60 fps master does not meet the spec. Render a native 30 fps version (§3). LinkedIn's own advice favours 7–15 s for completion, so plan a cut-down. |
| **X** | 16:9 or 4:5 | Without Premium: 140 s, 512 MB. Aspect 1:2.39 to 2.39:1 (from ad-spec summaries) | Autoplays in timelines; automatic captions on mobile. Small reach in some markets (in the Netherlands, about 2.7M users and falling); fine for an English cut aimed at the international tech crowd. |
| **YouTube** | 16:9, 1920×1080, 60 fps | | Safelist the channel with the music library **before** uploading, and put the track credit in the description (see 06 §2). |
| **Google Play promo video** | A YouTube URL (public or unlisted, ads off, embeddable, not age-restricted) | Only the first 30 s autoplay, muted | At least 80 % should show the real app; core features within 10 s; no "install now" calls to action, prices or ranking claims. |
| **App Store app previews** | Real screen captures of the app | 15–30 s; ≤ 500 MB; ≤ 30 fps; H.264 10–12 Mbps or ProRes 422 HQ; 886×1920 portrait covers current iPhones; stereo AAC 256 kbps | **A rebuilt-UI film is not an app preview.** Apple allows captures of the app only, with overlays and narration, and no footage of people using a device. Make a separate preview from a real screen recording. No prices or dated references. |
| **Instagram Reels / TikTok** | 9:16, 1080×1920 (unverified specs) | | Recompose 9:16 from the 4:5 layout (the same timeline with a third layout), do not crop 16:9. |

**Audio for all of them:** AAC 256 kbps, 48 kHz stereo, mixed to −14 LUFS integrated with true peak ≤ −1 dBTP. No platform in this list publishes a loudness target; −14 LUFS is the streaming convention and a safe middle ground for platforms that normalise (see 06 §10).

**Mux command** (video stream copied, so no second colour conversion):

```bash
ffmpeg -v error -y -i film-45-final.mp4 -i mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart film-45-final-audio.mp4
```

---

## 10. Posters, contact sheets and phone previews

### Two posters

- **Frame 0 is a poster.** Feeds show the first frame before autoplay starts, and some viewers have autoplay off. In the case, frame 0 was designed as a finished picture: the full hook line in ink, the key word in green, the phone already in frame. Check it in the encoded MP4, not only as a still.
- **The end card is the other poster:** logo, slogan, offer, URL, store badges, held about 4 s. Export it as a lossless PNG from the stills tool (`still.mjs --times <end-card time>`) for custom thumbnails, link previews and the README. A PNG from the page has no encode in between, so it carries the exact brand colours.

### Contact sheets

`still.mjs --sheet` renders stills at chosen times and tiles them with time labels (ffmpeg `drawtext` + `tile`). Useful sheets:

| Sheet | Settings | What it answers |
|---|---|---|
| Whole film | 1 s or 0.5 s steps, 5–6 columns | Story, layout, colour, empty frames |
| Transition strip | 0.05–0.1 s steps over 1–2 s | Pops, overlaps, ghosting, iris/flash |
| Feed size | `--scale 0.1875` (16:9) or `--scale 0.333` (4:5), i.e. 360 px wide | What is readable in a phone feed (see 07) |
| Delivery sheet | One frame per chapter | A one-page overview for the founder and the README |

Stills come from the page at a seek time, so they show the film without motion blur. For anything blur-related (smear, ghosting), grab frames from the final MP4 with ffmpeg instead.

### Phone previews

The founder reviewed on a phone. The case delivered "phone previews" next to the masters: full resolution, 60 fps, about 1 Mbps video plus 155 kbps AAC, about 8 MB for 52 s. Aim for under 30 MB so they are quick to send and to attach anywhere. Size is roughly `(video kbps + audio kbps) × seconds ÷ 8 ÷ 1000` MB.

A command that produces an equivalent file from the master (the stream is already BT.709 limited-range YUV, so re-encoding does not convert colour; restate the tags so they survive):

```bash
ffmpeg -i griffel-launch-origineel-4x5.mp4 -c:v libx264 -preset slow -b:v 1M -maxrate 1.5M -bufsize 3M \
  -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 160k -movflags +faststart preview-telefoon-origineel-4x5.mp4
```

Suggest the founder also uploads the 4:5 master as a private draft (or to a test account) in the target app. That is the real test of readability, muted autoplay and the platform's own re-encode.

### Deliverable set from the case

- Masters with music: 16:9 and 4:5, 52.35 s, 60 fps, for the original and the variant.
- Phone previews (4:5).
- Music-only WAVs for recuts.
- Posters (end card, both formats) and contact sheets.
- A delivery note listing specs, measured QA results, what a human still has to check, and where the licence details are kept (privately).

---

## 11. Exit checklist for this stage

- [ ] The final was rendered after the music was aligned, with the page's output length (`OUT_DURATION`) and output frame rate set.
- [ ] Capture used a local HTTP server, one Chrome per worker, `--force-color-profile=srgb`, fonts ready before the first seek.
- [ ] PNG modes normalised; output frame count equals capture frames ÷ SUB.
- [ ] Encoded with the explicit BT.709 chain, 16-bit blur, dither, no `-tune animation`, tagged.
- [ ] `check_encode.py` passes on every delivered file (tags, brand colour ±2, white, banding).
- [ ] A 30 fps version exists for any paid-ads placement.
- [ ] Audio muxed with `-c:v copy`; loudness measured on the muxed file (see 07).
- [ ] Posters, contact sheets and phone previews (< 30 MB) exported.
- [ ] Temporary PNG sequences deleted; licensed audio and renders kept out of git.
