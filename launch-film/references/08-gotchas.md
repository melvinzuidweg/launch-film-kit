# 08 · Gotchas

Every pitfall the Griffel build actually hit, as symptom → cause → fix. Scan the section for the tool you are about to use. Most were quick to fix once understood; the cost was in finding them. A few rows come from later tests of the starter template (a 10 s teaser built from it, and the checks that fixed what it found); they say so.

Two sections are different. Section 11 (platforms) comes from the distribution research rather than from failed uploads, because nothing had been published yet. Section 12 lists issues reported by others that the case did not run into, so you recognise them if they appear.

## Contents

1. [The page: determinism and rendering](#1-the-page-determinism-and-rendering)
2. [Film craft (caught by critics)](#2-film-craft-caught-by-critics)
3. [Capture: Chrome and Puppeteer](#3-capture-chrome-and-puppeteer)
4. [HyperFrames](#4-hyperframes)
5. [ffmpeg and colour](#5-ffmpeg-and-colour)
6. [Audio](#6-audio)
7. [Windows, shells, Node and Python](#7-windows-shells-node-and-python)
8. [Parallel agents and process](#8-parallel-agents-and-process)
9. [Browser automation on music and research sites](#9-browser-automation-on-music-and-research-sites)
10. [Story, truth and brand](#10-story-truth-and-brand)
11. [Platforms and delivery](#11-platforms-and-delivery)
12. [Reported by others, not hit here](#12-reported-by-others-not-hit-here)

---

## 1. The page: determinism and rendering

| Symptom | Cause | Fix |
|---|---|---|
| A screen from a later act shows through in early frames, but only when frames are rendered out of order (contact sheets, parallel workers) | A child element set to `visibility: visible` stays visible inside a hidden parent | Use `visibility: inherit` on children and hide/show the parent. Run a seek-order test (07 §3) after any visibility code. |
| Text renders a fraction differently depending on which frame was seeked before | `will-change: transform, opacity, filter` keeps a compositor layer whose raster scale depends on seek history | No `will-change` on text that scales or fades. The case removed it from the shared word class. |
| A slowly drifting text block moves in whole-pixel steps (frame difference flips between about 0.8 and 0.25) | Without its own layer, Chrome snaps glyph baselines to whole pixels | Put `will-change: transform` on that one block, which only translates, and confirm with a seek-order test. The two rows above are the same property with opposite effects; test each use. |
| The same frame differs by up to 11 levels on anti-aliased edges between a fresh page load and a load after other seeks | Chrome keeps some rasterisation state from the first frame a page paints (in the case, the phone's scale at first paint) | Do a warm-up seek before capturing a chunk. Compare frames with a tolerance, never by hash. |
| The seek-order test fails on the untouched template: t = 3 rendered after t = 7.8 has the status bar and island 1 px lower (max difference 255 on about 950 px). Found by a later test of the template, not in the case. | The phone used `translate3d()`, which gives it its own compositor layer. After Chrome had painted it at scale 0.96 (the exit), the layer kept that history. The phone's opacity was a red herring: forcing it to 1 left the difference. `translate3d()` on a screen inside the phone did the same to a fading frame (about 50 levels), and on the world layer to the screen's straight edges (about 35 levels, even seeking forward). | 2D transforms (`translate()`, `scale()`) for the world layer, the phone and everything inside them; the template does this now (03 §10). Keep a backward seek across the phone's exit in the seek-order test. `still.mjs` seeks in ascending order by default, like the capture, so stills match the render even if such a bug slips in. |
| Text boxes, wraps or measured positions are wrong in the first frames | Layout was measured before the web fonts loaded | Wait for `document.fonts.ready` (and check `document.fonts.check(...)`) before measuring and before the first seek. |
| Two renders of the same frame differ in content | `Math.random`, `Date`, `requestAnimationFrame`, CSS transitions or animations | Everything is a function of `t`. Use a seeded hash/noise for randomness. No timers, no CSS animation. |
| A running timer is an unreadable smear in the final | Motion blur averages 8 subframes, each showing different digits | Compute changing values from time quantised to the output frame grid (`Film.frameT(t)`). |
| The timer smears again after the film was time-scaled | Quantised to the film grid, `floor(t × 60) / 60`, which no longer matches output frames | Quantise on the output grid: `floor(t × SCALE × 60 + 1e-6) / 60 / SCALE`. For a 30 fps render the grid is 30, not 60 (the template's `render.mjs --fps 30` sets `T.OUT_FPS`). |
| A crossfade shows single-frame jitter in the frame-difference curve | Chrome composites in 8 bit, so a fade steps the whole frame by one level at once | Add a tiny alpha gradient across the fading layer (about ±1.5/255 corner to corner) so the steps spread out. |
| A 404 for a missing file stayed in the page errors and was noted as "already there before my changes" instead of being fixed | Console errors are easy to miss in long tool output, and easy to dismiss as someone else's | Collect `pageerror` and console errors in every tool and print them at the end; make the capture exit non-zero on errors. |

---

## 2. Film craft (caught by critics)

These are not bugs, but each was flagged by critics as an amateur tell and each had a clear fix. Details are in `examples/griffel/docs/ledgers/`.

| Symptom | Cause | Fix |
|---|---|---|
| Light-to-dark change reads as a dated slide transition, and is the biggest frame difference in the film | A hard circle iris that completed in about 0.25 s | A feathered vignette into dark, an even crossfade back to light, spread over about 1 s. No white bloom. |
| The camera bounces out and back in at every act boundary | Each act returned to a rest framing at its end | Shared hand-off framings between acts, owned by the timeline. |
| Screen changes inside the phone look like render glitches | One-frame cuts, or opacity cross-dissolves where both screens are half visible | 0.35 s iOS-style horizontal pushes; the incoming screen covers the outgoing one. |
| The key moment feels rushed | Four events within 1.2 s at the drop | One event at a time: the tap, then the result, then the thesis line 0.7 s later. |
| A headline is on screen but barely readable | Held about 1.1 s | At least (characters ÷ 12) s + 0.5 s of full readability; the thesis line went to about 1.8 s. |
| The logo lurches into place | It assembled elsewhere and then moved about 290 px | Assemble the mark at its final position from the start; keep only the slide and the wordmark wipe. |
| "12 december2 december" for about 6 frames | The selected answer's copy lifted off while the option's own label was still drawn | Fade the moving copy in only once it is clear of the label. |
| Word fragments dangle on exit | Exits staggered per word | Exit the whole block as one unit. |
| Two touch dots at once, like a ghost cursor | The next tap's dot appeared while the previous press was still held | One finger: if taps are under 0.6 s apart, glide the same dot to the next target. |
| The payoff line is a few pixels tall in a phone feed | Real app UI drawn at real size inside a scaled-down phone | Lift the payoff out of the UI as a large "hero row"; set minimum text sizes per format in the storyboard (07 §7). |
| The first second looks like a still image | Frame 0 was a half-built picture and nothing moved until the first event | Frame 0 is a finished poster; a calm push starts on frame 1. |

---

## 3. Capture: Chrome and Puppeteer

| Symptom | Cause | Fix |
|---|---|---|
| Renders show a fallback font and a different layout from the preview | Chrome blocks font loading from `file://` pages | Serve the project from a local HTTP server on `127.0.0.1` with a random port. |
| Workers other than the first fail or hang on `Page.captureScreenshot` | Several tabs in one browser: background tabs are not captured | One Chrome process per worker. |
| A capture prints "captured ... in 2.4 min" although every frame was on disk after about 40 s. Found by later tests of the template on Windows: 3 of 4 captures in one session, and again while writing this fix, more often while other heavy processes ran. | `browser.close()` waits for the Chrome process to exit, and the main browser process sometimes lingers for about two minutes (its renderers already gone, only the crash handler left). Without per-worker logs the hang looks like slow rendering. | The template's capture logs when each worker's last frame is on disk, gives `browser.close()` 5 s and then kills the Chrome process tree (`closeBrowser` in `tools/lib.mjs`), and prints the teardown time. A seek or screenshot that takes over 30 s (`--shot-timeout`) restarts that worker's Chrome and retries the frame. Time renders from the "on disk" lines. |
| Hash comparisons of two identical captures fail | Screenshot capture on Windows is not byte-reproducible (1–2 levels of noise) | Compare with a tolerance (max difference ≤ 2). |
| A few PNGs in a sequence are RGBA while the rest are RGB | A one-pixel capture seam with alpha around 0.85, in both HyperFrames and direct Puppeteer capture | Normalise modes before encoding (§5). |
| Paths built from the script's own location break on Windows | `new URL(import.meta.url).pathname` returns `/C:/...` | Use `fileURLToPath(import.meta.url)`, or strip the leading slash before a drive letter (the case's tools do the latter). |

---

## 4. HyperFrames

| Symptom | Cause | Fix |
|---|---|---|
| `npm install hyperframes@latest` fails or resolves an older version | The machine's npm configuration enforced a 7-day minimum release age, and HyperFrames ships several releases a day | Pin an exact version at least that old (the case used 0.8.68); `save-exact=true` in `.npmrc`. |
| After a retime, the render still produced the old length (2,880 frames instead of 3,168) | A static `data-duration` on the root element wins over one set from script | Remove the static attribute; set it from an inline script right after the root element. |
| `hyperframes lint` reports `root_composition_missing_duration_source` and `missing_timeline_registry` | The fix above, and a page that drives its own seek function | False positives in this setup. Note them in the project docs so nobody "fixes" them. |
| The render refuses to start a 480 fps (or 240 fps) PNG job | The disk pre-check estimated about 5.8 MB per frame (67 GB for one 240 fps pass) against about 0.2 MB real | Capture directly with `window.__seek` (`capture_seq.mjs`). |
| No way to ask for more than 240 fps, and no motion-blur flag | CLI limits (the engine's blur was not exposed on `render`) | Capture at N × fps yourself and blend with ffmpeg `tmix` (05 §3). |
| The MP4 shifts brand colours and bands gradients | The renderer's own encode | Render `--format png-sequence` and encode with the explicit BT.709 chain (05 §5). |
| Usage data leaves the machine | Telemetry is on by default | `HYPERFRAMES_NO_TELEMETRY=1` in every command's environment. |
| Two renders of the same page differ slightly | On Windows and macOS it uses screenshot capture; BeginFrame (deterministic) is Linux-only | Accept small noise; compare with a tolerance. |

---

## 5. ffmpeg and colour

| Symptom | Cause | Fix |
|---|---|---|
| Brand green #1ABA6D decodes as #16B867; white as #FDFFFF | RGB→YUV without an explicit matrix uses BT.601; players decode HD as BT.709 | `zscale=matrix=709:range=limited:...` with explicit input tags, and tag the output stream (05 §5). |
| White lands at Y 234 instead of 235 and every colour is about 0.9 levels dark | swscale's `format=gbrp16le` maps 255 to 65280 | Widen to 16 bit with zscale (`zscale=rangein=full:range=full`, then `format=gbrp16le`). |
| Visible bands in a near-white gradient (an R step from 246 to 242) | 8-bit rounding, no dither, and `-tune animation` lowering adaptive quantisation | Blur in 16 bit, error-diffusion dither on the way to 8 bit, `aq-mode=3`, no `-tune animation`, CRF 10. |
| Fast moves show stepped copies instead of blur | Only 4 subframes per output frame | 8 subframes (480 fps for 60 fps output). |
| The output has fewer frames than expected (a 48-frame test came out as 29), with no error | A pixel-format change mid-sequence (RGB ↔ RGBA) makes ffmpeg rebuild the filter graph, restarting `tmix` and `select` | Convert all PNGs to one mode first; verify the count with `ffprobe -count_packets`. |
| A colour check passes a broken file, or fails a good one | The checker decodes with ffmpeg's default conversion | Decode with an explicit matrix: `zscale=matrixin=709:rangein=limited:matrix=709:range=full`. |
| `drawtext` fails to parse on Windows | The drive colon in `fontfile=C:/...` is read as an option separator | Forward slashes and an escaped colon: `fontfile='C\:/path/Inter_600SemiBold.ttf'`. |
| `select` expression errors out | Commas inside filter expressions split the filter chain | Escape them: `select='eq(mod(n\,8)\,7)'`. |
| The delivered MP4's true peak is −0.8 dBTP although the WAV was −1.0 | AAC encoding raises inter-sample peaks | Normalise the mix to −1.5 dBTP (the template's `mix_edl.py` default, `target_tp` in the EDL), and measure after the mux. Found while writing this kit; the delivered original was 0.2 dB over. |

---

## 6. Audio

| Symptom | Cause | Fix |
|---|---|---|
| Music aligned at the drop, but the logo hit lands about 0.18 s late and earlier events up to 0.2 s early | The film was scaled by a rounded 1.1 instead of the exact 120/110 | `SCALE = grid BPM / track BPM` exactly (06 §5). |
| A helper prints the wrong song start after a retime | `find_drop.py` hard-codes the film's drop time (22.0) | Take the drop from the generated cue file, never from a constant. |
| A variant page got a plain tap sound where the drop sound was expected, and a whoosh for a morph it does not show | Cue rules written for the original page | Review the cue list per page; make rules variant-aware where it matters. |
| An automatic beat grid put the drop in the wrong place | Beat trackers guess | Measure bass energy at 20 ms resolution around the candidate (`find_drop.py`). |
| A music jump sounds like the bar restarts in the middle | A jump of N + ½ bars, or a cut that is not on a bar line | Jump whole bars, on bar lines; put film events on whole bars from day one (06 §6). |
| An effects-only mix lands at −15.1 LUFS against −14 with no warning, and the muxed file's true peak is 0.4–0.6 dB above the WAV's −1.5 (found by later tests of the template) | Sparse effects are nearly all peak: under the ceiling, loudnorm can only get there in its dynamic (limiter) mode, and AAC lifts sharp transients more than music | The mixer now prints the mode, the linear max and a warning past 0.5 LU. Use `"target_tp": -2.0` for effects only, accept about −14 to −16 LUFS (or the linear max), and say so in the delivery report (06 §10). |
| The whole film had to be retimed and re-mixed after the music was chosen | The storyboard grid came from a track that was not the one licensed | Choose the music (tempo and structure) before the storyboard; buy at picture lock (06 §1). |

---

## 7. Windows, shells, Node and Python

| Symptom | Cause | Fix |
|---|---|---|
| `UnicodeEncodeError` when a Python script prints arrows, check marks, euro signs or Dutch quotes | Python on Windows writes to the console in cp1252 by default | Set `PYTHONIOENCODING=utf-8` (or run `python -X utf8`); open text files with `encoding="utf-8"`. |
| A long render suddenly does something odd or fails after you edited `render.sh` | Bash reads a script incrementally while it runs, so edits change the commands it has not reached yet | Never edit a running script. Copy it to a new name, or wrap the body in a function that is called on the last line so bash parses it all first. |
| Little memory left for Chrome workers | 24 GB of RAM with only 1.4–3 GB free while other apps ran | Four Chrome workers worked on that machine; close heavy apps; render formats one after another. |
| Little disk left for frame sequences | A 480 fps sequence is 4–5 GB per format; the machine had about 40 GB free | Check free disk first; delete each sequence after a successful encode. |

---

## 8. Parallel agents and process

| Symptom | Cause | Fix |
|---|---|---|
| A render fails with an error in a file you did not touch (in the case, `SAFE is not defined` in another act) | Another agent was halfway through editing that file | One owner per file. Re-render once before concluding something outside your file is broken; report it rather than fixing it. |
| A shared helper script in the scratchpad was overwritten mid-session | Two agents used the same file name | Prefix every helper with the agent's or act's name. |
| Timing changes collide | Several agents edited the shared timeline file | One owner for the timeline. Other agents write the change they need into their ledger. |
| Critic rounds keep finding things but scores stop moving | Diminishing returns after round 3 (overall 6 in round 2, 7 in round 4, 7.5 after targeted fixes) | Two broad critic rounds, then targeted fixes only. |
| Critics report frame differences that the final does not have | They measured an unblurred draft (11.99 on the draft against 10.0 in the final for one move) | Measure on the final, or simulate the 8-subframe blur on stills. |
| A critic reports the brand colour is off, but the page is right | The draft's encode shifted it | Use the same colour-managed encode for drafts as for finals. |

---

## 9. Browser automation on music and research sites

| Symptom | Cause | Fix |
|---|---|---|
| Structured data (tempo, length, vocals) is needed for hundreds of tracks | Reading it off the rendered page is slow and fragile | Uppbeat category pages embed their track list as JSON in the HTML (tempo, energy, genre, vocal flag, length, preview URL). Read that. Epidemic has a public JSON search endpoint (`/json/search/tracks/?term=...&bpm=...&vocals=false`). |
| Finding Uppbeat's favourite control | It is the circle-plus icon (a "BoardsIndicator" component), and one click adds the track | It is a toggle: click once, then verify the state. |
| A download spent a licence credit | Every download issues a licence code that is "valid for a single video" | Download only after the human has approved the exact files (06 §11). Choose WAV in the dialog (MP3 is also offered). |
| The downloaded WAVs are nowhere to be found | In the in-app browser, downloads land in the Downloads folder as GUID-named `.tmp` files | Identify them with `ffprobe` (duration, sample rate) against the track lengths, rename them to `artist-title.wav`, and move them to the gitignored licensed-audio folder. |
| Prices are missing from a pricing page | The page renders prices with JavaScript, or only inside a checkout flow | Read the licence pages; ask the human to confirm the price. Never start a checkout to read a price. |
| Cookie banner blocks the page | | Choose strictly necessary cookies only. |
| X returns HTTP 402 for a post | X blocks unauthenticated fetches | Use search snippets or ask the human for the content. Do not sign in. |
| A linked GitHub repo returns 404 | The repo was renamed (the case's `echris6/motion` is `echris6/motion-video-kit`) | Search the GitHub API for the owner's repos. |

---

## 10. Story, truth and brand

| Symptom | Cause | Fix |
|---|---|---|
| The design tokens in the repo did not match the website | The repo's `DESIGN_TOKENS.md` was a stale template from another project | Take tokens from the CSS that actually ships (the live site and the app's token file). |
| The brand green fails contrast as text | #1ABA6D on white is about 2.5:1 | Use the brand green as fill and decoration; green text on light uses a darker green (#12804B, 5.0:1 in the case). |
| A planned scene showed something the app does not do | Marketing copy implied features the code did not support: name suggestions appear only when a saved name occurs in that speaker's words; the planned notification text did not exist; there is no transcript or notes screen | Check every claim against the code during the brief. Show the user typing the name, use the real notification copy, show speech as captions instead of a screen. |
| The story contradicted itself | A caption had Lisa say "I'll send it" and then the app asked who sends it | Captions create exactly the ambiguity the app's question resolves ("We'll pick it up"). |
| A fictional name looked like an app suggestion | The app's own placeholder text uses that name ("Thomas") | Pick fictional names that appear nowhere in the UI copy. |
| "AI" reads as "Al" and "Iets" as "lets" at small sizes | Inter's default capital I is a plain bar | Turn on Inter's `cv08` (capital I with serifs) for overlay type only; leave the app UI verbatim. |
| A word the app store had already rejected ("flawless") was still on the website hero and in the app's onboarding | Old marketing copy outlives review decisions, and a builder copying "real" copy picks it up | A facts file with SAFE / NEEDS CHECK / DO NOT USE per claim, and a grep before delivery (07 §11). |

---

## 11. Platforms and delivery

These come from the distribution research, not from failed uploads: in the case the founder publishes, and nothing had been uploaded when the kit was written. They are listed because each one decides what you render.

| Symptom | Cause | Fix |
|---|---|---|
| The film cannot be used as an App Store preview | Apple accepts screen captures of the app only, with no footage of people using a device | Make the store preview from a real screen recording; the film is for social and the website. |
| A 60 fps file would be rejected as a LinkedIn ad | Ads need under 30 fps | Render a native 30 fps version (`node tools/render.mjs 45 final --fps 30` in the template; `FINAL_FPS=30 SUB=8` in the case). |
| Captions cannot be added from the LinkedIn mobile app | SRT upload is desktop-only | Burn in the text that matters (the film is mute-first anyway), or upload from desktop. |
| A YouTube upload can get a music claim | The channel was not safelisted with the music library | Safelist before uploading; put the credit line in the description. |
| A Google Play promo video has extra rules | It needs a YouTube URL that is public or unlisted, embeddable, not age-restricted, with ads off, and mostly real app footage | Prepare a separate cut that meets those rules. |

---

## 12. Reported by others, not hit here

From the research phase; listed so you recognise them.

- **Windows 11 Smart App Control can silently block the image library behind `hyperframes snapshot`.** `render` and `check` are not affected. Make contact sheets with ffmpeg instead.
- **HyperFrames opened one console window per render shot on Windows** in some older versions (fixed upstream).
- **On Linux, the BeginFrame probe can time out with 6+ workers** and silently fall back to a mode that doubles render time.
- **Remotion is free only for organisations of up to 3 people;** above that it needs a paid licence. Check before choosing it as the renderer.
- **Some community kits hard-code their drop time** instead of measuring it. Measure yours (06 §4).
