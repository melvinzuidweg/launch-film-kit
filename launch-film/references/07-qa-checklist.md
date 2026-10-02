# 07 · QA checklist

"Looks good to me" is not a quality bar, least of all from the agent that built the film. This checklist turns the case's quality bar into numbers that can be measured on the actual files, and lists the few things that still need a person.

Two rules make the numbers trustworthy:

- **Measure the file you deliver.** Colour, loudness, frame count and motion blur only exist in the encoded MP4. A page preview or an unblurred draft can pass checks the final fails, and the reverse.
- **Measure, then look.** A number tells you where to look; a still at that time tells you what is wrong. Claude can view PNGs directly, so every measured problem should end with a look at the frame.

## Contents

1. [The bar at a glance](#1-the-bar-at-a-glance)
2. [Motion: frame-difference spikes, frozen runs, transitions](#2-motion-frame-difference-spikes-frozen-runs-transitions)
3. [Determinism](#3-determinism)
4. [Text contrast](#4-text-contrast)
5. [Brand colour after the encode](#5-brand-colour-after-the-encode)
6. [Loudness and sync](#6-loudness-and-sync)
7. [Readability at feed size (360 px)](#7-readability-at-feed-size-360-px)
8. [Mute comprehension](#8-mute-comprehension)
9. [Frame 0 and the first second](#9-frame-0-and-the-first-second)
10. [End card](#10-end-card)
11. [Facts and privacy grep](#11-facts-and-privacy-grep)
12. [File integrity](#12-file-integrity)
13. [Human checks that remain](#13-human-checks-that-remain)
14. [Using the bar in critic rounds](#14-using-the-bar-in-critic-rounds)

---

## 1. The bar at a glance

| # | Check | Pass | Measured on | Case result |
|---|---|---|---|---|
| 1 | Frame-difference spikes | none: no frame > 3× both neighbours and > 1.0 | final MP4 | none |
| 2 | Frozen runs | no run with frame difference < 0.1 longer than 0.6 s (aim for 0.4 s), end card excepted | final MP4 | none over 0.4 s |
| 3 | Whole-frame transitions | peak frame difference ≤ about 6; no brightness overshoot | final MP4 or blurred draft | light/dark change peaked at 6 (was 19.7) |
| 4 | Determinism | same frame from any seek order, within 2 levels | stills | identical or 1 level apart |
| 5 | Text contrast | ≥ 4.5:1 for all text meant to be read; ≥ 3:1 in every frame of a transition | lossless stills | met; green text on light moved to #12804B (5.0:1) |
| 6 | Brand colour | mark within ±2 per channel; white 255 ± 1; no banding over source; BT.709 tags | final MP4 (`check_encode.py`) | within 1 level, white exact |
| 7 | Loudness | −14 LUFS integrated (effects only: see §6), true peak ≤ −1 dBTP | muxed MP4 | WAV met (−14.0 / −1.0); the original's muxed MP4 measures −0.8 dBTP, see §6 |
| 8 | Sync | the drop's audio onset on the drop frame; SFX on their events | mix + stills | drop at output 24.0 |
| 9 | Feed-size readability | key text ≥ ~10 px font size at 360 px frame width | stills at 360 px | met for headlines and the payoff; small app chips still small |
| 10 | Readable hold | each line fully readable ≥ (characters ÷ 12) s + 0.5 s, never under 1 s | stills / timeline | thesis line raised from 1.1 to 1.8 s |
| 11 | Mute comprehension | a fresh viewer states the message from muted frames | critic + human | critic 8/10 on mute; human check open |
| 12 | Frame 0 | a finished picture; motion from frame 1 | final MP4 | met |
| 13 | End card | complete poster held ≥ 3.5 s (aim for 4); music ending lands on it | final MP4 | held about 4.25 s of film time (about 4.6 s of output); final hit on the logo lock |
| 14 | Facts and privacy | no banned claim, no real names or e-mail addresses, example label whenever fictional content is legible | source + stills | met |
| 15 | File integrity | frame count, duration, fps per destination, tags, audio present, faststart | ffprobe | met |

---

## 2. Motion: frame-difference spikes, frozen runs, transitions

**The measure:** decode the video to grayscale at a quarter of its size and take the mean absolute difference between consecutive frames, on a 0–255 scale. Downscaling removes encoder noise and dither so the number tracks visible change.

The template ships a packaged version, `python tools/qa_motion.py <mp4> --plot <png>` (exit code 1 when it finds something). It uses slightly different definitions, so read its own header before comparing numbers: freezes are frames that differ from the frame 0.1 s earlier by less than 0.015 (a lag that lets a very slow drift count as motion), and spikes are compared with the median of their neighbourhood. It also checks big transitions: `--peak-max` (default 6) lists every stretch whose frame-to-frame change exceeds the limit, with its start, end and highest value, and draws the limit as a dashed line in the plot. The script below is the plain consecutive-frame measure that the case's numbers in this file come from; use it when you want to compare with them.

```python
"""frame_diff.py <video.mp4>: per-frame change, spikes and frozen runs."""
import json, subprocess, sys
import numpy as np

def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height,r_frame_rate", "-of", "json", path],
                         capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    num, den = map(int, s["r_frame_rate"].split("/"))
    return s["width"], s["height"], num / den

def frame_diffs(path):
    W, H, fps = probe(path)
    w, h = W // 4, H // 4
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={w}:{h},format=gray",
                          "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    prev, d = None, []
    while len(buf := p.stdout.read(w * h)) == w * h:
        f = np.frombuffer(buf, np.uint8).astype(np.int16)
        if prev is not None:
            d.append(float(np.abs(f - prev).mean()))
        prev = f
    return np.array(d), fps            # d[i] is the change from frame i to frame i+1

d, fps = frame_diffs(sys.argv[1])
spikes = [i for i in range(1, len(d) - 1) if d[i] > 1.0 and d[i] > 3 * max(d[i - 1], d[i + 1])]
print("spikes at", [round((i + 1) / fps, 3) for i in spikes])
runs, start = [], None
for i, v in enumerate(np.append(d, 99)):
    if v < 0.1 and start is None: start = i
    if v >= 0.1 and start is not None:
        if (i - start) / fps > 0.4: runs.append((round(start / fps, 2), round(i / fps, 2)))
        start = None
print("frozen runs > 0.4 s:", runs)
print("top 10 changes:", [(round(float(i + 1) / fps, 3), round(float(d[i]), 2)) for i in np.argsort(-d)[:10]])
```

### Spikes

A spike is a single frame that changes much more than its neighbours: a pop, a one-frame cut inside the phone, a layout jump when a row collapses, an element appearing a frame early. The rule used in the case (borrowed from the howseen kit): **a frame whose difference is more than 3× both neighbours and above 1.0.** Pass: none.

The spikes the case found were all real defects: in-phone screen changes done as one-frame cuts (fixed with 0.35 s iOS-style pushes) and list rows collapsing in 4 frames, which jumped everything below them up three times in a row.

### Frozen runs

A frozen run is a stretch where nothing visible moves (difference below 0.1). On a phone feed, a still frame looks like a stalled video. Pass: **no run longer than 0.6 s; aim for none over 0.4 s.** The end card is the exception. The case's end card drifts very slowly (a linear 1.5 % scale over the last 4 s) so it never looks like a stalled video; that drift is below the 0.1 threshold, so the script reports the end card as frozen runs, which is expected.

Running the script on the case's delivered 4:5 film gives no spikes, frozen runs only after 48.9 s (the end card), and a largest change of 5.8 at 3.4 s (the light-to-dark change).

Fix frozen runs with continuous slow motion (a 2 %/s camera creep, a drift that overlaps the next move), not with decoration.

### Whole-frame transitions

A change that alters most of the frame (light to dark, a big crossfade) shows up as the largest differences in the film. The case's first light-to-dark change was a hard circle iris: 19.7 per frame, finished in about 0.25 s, and it read as a dated slide transition. The fix spread the change over about 0.9–1.0 s and peaked at 6.

- **Peak per frame:** keep whole-frame changes at about 6 or less. That means spreading a full black-to-white change over 0.8 s or more.
- **Rule of thumb: the peak scales with 1/duration.** Halve a move's duration and its peak roughly doubles, so the fix for a high peak is a longer move, or fewer things moving at once. In a 10 s teaser test, a 0.45 s fade of the full-frame phone at zoom 1.6 peaked at 9.6 and a 1.1 s push from zoom 0.86 to 1.6 at 7.9; stretched to 0.7 s and 1.45 s, both came down to about 6.9. A full-frame phone fade at zoom 1.5 or more needs about 0.8 s or longer to stay under 6. The template's own 4:5 camera return (zoom 1.56 back to 0.86) peaked at 6.4 on the draft over 1.2 s and at 5.2 over 1.4 s, which is why it now takes 1.4 s.
- **Monotonic brightness:** average frame brightness should move one way through a light change, without overshooting (a white bloom on the way back from dark is the classic failure).
- **8-bit compositing steps:** a plain opacity crossfade in Chrome steps the whole frame by one level at a time, which shows as single-frame jitter in the difference curve. A tiny alpha gradient across the fading layer (about ±1.5/255 corner to corner) spreads those steps out.

### Measure on the blurred film

Motion blur lowers frame differences: one logo move measured 11.99 on the unblurred draft and 10.0 in the final. Measure on the final MP4, or simulate the blur on stills by averaging 8 subframes per output frame (stills at `t + i/480`, i = 0…7). Thresholds from an unblurred draft are conservative, which is fine for finding problems and misleading for signing off. From that one measurement, a draft peak up to about 7 is likely to land near 6 in the final (`qa_motion.py --peak-max 7` on a draft); confirm on the final.

---

## 3. Determinism

Every frame must render the same no matter which frame was rendered before it. Otherwise parallel workers, resumed captures and stills disagree with each other.

**Test:** render a set of times in order, then the same times in reverse order or after a jump to the far end (`still.mjs --times 30,4,22,4 --order listed`; without `--order listed` the tool sorts the times ascending, like the capture), and compare with a tolerance. Include a backward seek across every exit or scale change of the phone (03 §10).

- Pass: identical, or at most 1–2 levels apart in a few pixels (Windows screenshot capture is not byte-reproducible).
- Fail: content that should not be there (a screen from a later act showing through), different text positions, different digits.

The case found two real determinism bugs this way: child elements set to `visibility: visible` inside a hidden parent (they show regardless; use `inherit`), and `will-change` on text that changed how it rasterised depending on seek order. A later test of the template found a third: `translate3d()` inside the camera-scaled world (use 2D transforms there). See 08 §1 for all three.

---

## 4. Text contrast

**Measure contrast on rendered pixels, not on design tokens,** whenever text sits on anything but a flat fill: a gradient, a stage that changes from light to dark, a translucent card.

```python
import numpy as np
from PIL import Image

def rel_lum(rgb):
    c = np.asarray(rgb, float) / 255
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]

def contrast(png, box, pad=12):
    """WCAG contrast of the text inside box=(x0, y0, x1, y1) against the background just around it."""
    im = np.asarray(Image.open(png).convert("RGB")).astype(float)
    x0, y0, x1, y1 = box
    ring = np.concatenate([im[y0 - pad:y0, x0:x1].reshape(-1, 3), im[y1:y1 + pad, x0:x1].reshape(-1, 3)])
    L_bg = rel_lum(np.median(ring, axis=0))
    L_in = rel_lum(im[y0:y1, x0:x1].reshape(-1, 3))
    k = max(1, len(L_in) // 20)                       # the 5 % of pixels furthest from the background
    L_text = np.median(L_in[np.argsort(np.abs(L_in - L_bg))[-k:]])
    hi, lo = max(L_text, L_bg), min(L_text, L_bg)
    return (hi + 0.05) / (lo + 0.05)
```

Use a box that fits one line of text tightly, on a lossless still from the page.

**Pass:** ≥ 4.5:1 for every line meant to be read. During a transition, ≥ 3:1 in every frame for labels that stay on screen.

**What the case found:**

- The brand green #1ABA6D on white measures about 2.5:1 and fails even for large text. It stayed as fill and decoration (the logo, highlight blocks); green text on light used #12804B (5.0:1). The UI accent #09FE94 is 1.3:1 on white and was never text on light.
- The fictional-content label sat in a corner that went from light to dark and back. A plain blend of its two colours dipped below 3:1 in the middle of the change. The fix sampled the stage's luminance under the label at 12 points per frame and picked the label colour from that, switching from dark to light grey at about 19 % luminance.

---

## 5. Brand colour after the encode

Run `check_encode.py` on every delivered file (see 05 §6). It decodes with an explicit BT.709 matrix and checks the tags, the brand mark on the end card (median within ±2 per channel), white on frame 0 (median 255 ± 1, 1st percentile ≥ 253) and banding in the frame-0 gradient against the source still.

```bash
python tools/check_encode.py renders/final/film-45.mp4 --mark-t 47.5 --ref-dir renders/stills/check
```

Pass: exit code 0, on a final. Judge banding on a final (or a 0.5 s final segment), not a draft: a CRF 14 draft reads about 2 against the 1.5 limit on its own (05 §6). The case's first encodes failed all three colour checks (#16B867 instead of #1ABA6D, #FDFFFF instead of white, a visible band); after the encode fix, all four finals passed with the green within 1 level.

---

## 6. Loudness and sync

### Loudness

Measure the **muxed MP4**, not the WAV: the AAC encode can raise the true peak slightly.

```bash
ffmpeg -hide_banner -nostats -i film-45-final-audio.mp4 -map 0:a -af ebur128=peak=true -f null - 2>&1 | tail -n 14
```

Read `I:` under "Integrated loudness" and `Peak:` under "True peak". Pass: integrated within about half a LU of −14 LUFS, true peak ≤ −1.0 dBFS. Check the music-only WAV the same way. The template's mixer caps its WAVs at −1.5 dBTP by default for exactly the reason below.

A film with sound effects only is the exception for loudness: one linear gain cannot reach −14 under the ceiling, so it may land between about −14 and −16 LUFS, or quieter if you keep it linear (06 §10). The true-peak bar still holds, and effects gain more in the AAC encode (0.4–0.6 dB in two tests), so mix them with `"target_tp": -2.0`.

**The case missed this one.** Its mixes were measured as WAVs (−14.0 LUFS, −1.0 dBTP exactly). Measuring the delivered MP4s while writing this kit showed the original edit at −14.0 LUFS but **−0.8 dBTP**: the AAC encode added 0.2 dB of true peak. The variant measured −2.4 dBTP and was fine. A 0.2 dB overshoot is harmless in practice, but it fails the bar as written. Two easy fixes: normalise the mix to −1.5 dBTP so the encode has headroom, or measure after the mux and re-run the mix with a lower ceiling when it fails.

### Sync

- **The drop:** run `find_drop.py` on the final mix. It should report the drop at the film's output drop time (24.0 in the case) to within 20 ms. Then render a still at that time and check the key visual event (the tap, in the case) is on that frame.
- **Effects:** the cue list is generated from the film (06 §9), so effects follow the film. After any retime, check that `cues.json` was regenerated (its `duration` equals the page's output length).
- **Ending:** the final hit or hard stop lands where the EDL says (on the logo lock, or on the last frame). Recompute the landing time from the EDL (06 §6).

---

## 7. Readability at feed size (360 px)

Most people will see the film in a phone feed, where a 4:5 frame is about 360 px wide on screen. Text that is crisp on a monitor can be a grey smudge there.

**How to look at it:**

```bash
node tools/still.mjs --page portrait.html --from 0 --step 1 --scale 0.333 --sheet --out renders/stills/feed45
node tools/still.mjs --page index.html    --from 0 --step 1 --scale 0.1875 --sheet --out renders/stills/feed169
ffmpeg -ss 24.0 -i renders/final/film-45.mp4 -frames:v 1 -vf scale=360:-2 feed_24.png      # from the final, with blur
```

Then look at each frame as a viewer scrolling past: can you read the headline, the question, the payoff, the offer?

**Pass:** key text at a font size of at least about 10 px at 360 px frame width. In the source frame that means (derived by scaling, not measured separately):

| Format | Frame width | Minimum font size for key text |
|---|---|---|
| 4:5 | 1080 | about 30 px |
| 16:9 | 1920 | about 54 px |

App UI inside a phone mockup is the usual failure, because it is drawn at its real size (13–16 px logical) and then scaled down with the phone. A 14 px chip needs a camera zoom of about 2× in 4:5 to reach 10 px at feed size. In the case:

- passed: overlay headlines (48–72 px), captions (about 12 px at feed), the question in the app (about 11 px at feed), the end card;
- failed and fixed: the payoff line inside the e-mail (about 5 px at feed). It became a "hero row" lifted out of the e-mail at large size;
- still small at delivery: the recipient name chips (real app UI). The e-mail that follows shows the same names large, so the information survives.

Make this a storyboard rule (minimum text sizes per format) rather than a late fix; see 02.

---

## 8. Mute comprehension

LinkedIn and most feeds autoplay muted. The film has to make its point with the sound off.

**Critic check:** give a fresh agent (one that has not seen the brief or the build) a 2 fps contact sheet or the muted frames, and ask three questions:

1. What is this product, and who is it for?
2. What does it do that others don't?
3. What should I do next?

Compare the answers with the brief's one message and CTA. In the case, a fresh critic scored "works without sound" at 8/10.

**Human check:** someone who does not know the product watches the 4:5 muted on their own phone and says what it does. No critic replaces this.

---

## 9. Frame 0 and the first second

Frame 0 is what a feed shows before autoplay starts, and what people with autoplay off see instead of the film.

- **Decode frame 0 from the final:** `ffmpeg -i film.mp4 -frames:v 1 f0.png`, and look at it.
- **Pass:** a finished picture. All text complete and fully opaque, the product visible, nothing mid-fade, no blank stage. In the case: the full hook line in ink, the key word in green, the dark phone already peeking in.
- **Motion from frame 1:** the frame difference stays clearly above the frozen level from the very first frame, so the film visibly starts. After the fix the case's opening averaged 0.60–0.66 per frame over the first 1.8 s and never dropped below 0.52; before, it averaged 0.17–0.20, which read as a static first second. The variant's 16:9 opening at 0.33–0.43 was judged only just enough.
- **Scroll-stop:** the first 2 s have to say why to keep watching. Judge it on the feed-size sheet. This is also a human call (§13).

---

## 10. End card

- **Complete and held:** the end card (logo, slogan, offer, URL, store badges) is complete for at least 3.5 s before the last frame (aim for 4 s). Measure from the frame where the last element finishes moving (frame difference falls to the end-card drift level) to the end. The case held about 4.25 s.
- **Still alive:** a very slow drift rather than a hard freeze (§2); it will measure as "frozen", which is fine here.
- **Last frame equals the poster:** the last frame shows the final layout; export it as the poster PNG (05 §10).
- **Music:** the final hit lands on the logo lock or the hard stop on the last frame (§6).
- **Badges and URL readable at 360 px** (§7).

---

## 11. Facts and privacy grep

The facts file is law: every on-screen claim has a status (SAFE, NEEDS CHECK, DO NOT USE) and a source. Grep for violations rather than trusting memory. All on-screen strings should live in one copy file, but grep the act files too, because strings creep in.

```bash
# banned claims: build the pattern from your facts.md "Do not use" list (this is the case's, in Dutch)
rg -n -i "foutlo|enige |uniek|beste|alles gewist|bewaart niets|europese ai|avg-compliant|geen account" src/
# time claims ("in 30 seconden", "binnen minuten")
rg -n -i "\b[0-9]+ ?(sec|seconden|seconds|min|minuten|minutes)\b" src/
# e-mail addresses anywhere in the film's sources
rg -n "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}" src/
```

Then by eye, on the whole-film contact sheet:

- every name and company on screen is fictional, and no fictional name collides with a real UI string (the case avoided "Thomas" because the app's own name-field placeholder used that name, which would have looked like a name suggestion the app does not make);
- the example label ("VOORBEELD" in the case) is visible whenever fictional content is legible;
- every feature shown exists in the product today (the case removed a name-suggestion bubble, a transcript screen and a notes screen that the code did not support);
- UI strings and notification copy are verbatim from the app.

**Before anything leaves the machine** (a delivery folder, a public repo, a shared link), grep the outgoing files for private data:

```bash
rg -n -i "licen[cs]e code|licentiecode|C:\\\\Users\\\\|/Users/|/home/|api[_-]?key|secret|password" <folder>
rg -n "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}" <folder>
```

Licence codes, account names, e-mail addresses and personal paths belong in private notes only. Licensed audio and the music-only exports never go into a public repo.

---

## 12. File integrity

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,color_range,color_space,color_transfer,color_primaries \
        -show_entries format=duration -of compact film-45-final-audio.mp4
ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 film-45-final-audio.mp4
ffprobe -v trace -i film-45-final-audio.mp4 2>&1 | grep -m2 -oE "type:'(moov|mdat)'"      # moov first = faststart
```

| Check | Pass |
|---|---|
| Frame count | `floor(output_seconds × fps)` (3,141 frames for 52.36 s at 60 fps) |
| Frame rate | 60 for organic posts; under 30 for LinkedIn ads; ≤ 30 for app previews |
| Size | 1920×1080 (16:9), 1080×1350 (4:5), 1080×1920 (9:16) |
| Tags | `yuv420p`, `tv`, `bt709` × 3 |
| Audio | AAC, 48 kHz, stereo, as long as the video |
| Faststart | `moov` before `mdat` |
| Value-changing text | timer and counter digits sharp in final frames during motion (grab a few with ffmpeg and look) |

---

## 13. Human checks that remain

These are the things the case could not measure and said so in its delivery note:

1. **The film in its real context.** Upload the 4:5 as a private draft or on a test account in the target app (LinkedIn in the case) and watch it in the feed, muted, on a phone.
2. **Mute comprehension by a stranger.** Someone who does not know the product explains it back after one muted viewing.
3. **The music by ear.** Does the track fit (confident, not corporate or saccharine)? Does the drop feel like the moment opening up? Do the jump points sound natural? Are the effects too present on phone speakers, or lost on headphones?
4. **UI fidelity.** The UI was rebuilt from the app's code; the founder confirms it matches what users will see in the current store build.
5. **Language and tone.** A native speaker reads every line for spelling, tone and register.
6. **Claims and licences.** The founder confirms the facts file is still true on launch day and that the music licence fits the company and the platforms.
7. **Taste.** Would they stop scrolling for it? Would they share it? The case's last fresh critic scored the film 7.5/10 ("ship after small fixes"), with the hook (6) and pacing (6.5) lowest. A number like that is useful for deciding where to spend the next hour, not for deciding whether the founder likes it.
8. **Posting.** Claude does not post, upload or publish. The founder does.

---

## 14. Using the bar in critic rounds

The full build-and-critique process is in 04; this is how the bar plugs into it.

- **Give critics the bar and the tools.** A critic that can run `frame_diff.py`, `check_encode.py` and the feed-size sheet returns findings with times and numbers ("spike at 26.18, 26.48, 26.78: rows collapse in 4 frames") instead of impressions.
- **Split critics by lens.** The case used three per round: story and message; motion and technical; brand, truth and the second format. Each scored its lens 1–10 with sub-scores.
- **Triage every finding:** fix now, later, or skip with a reason, and record it in a ledger (the case's ledgers are in `examples/griffel/docs/ledgers/`).
- **Budget two broad rounds, then targeted fixes.** Scores rose from 6 to 7 over rounds 2–4, with diminishing returns after round 3; a final fresh critic and a verification pass after five targeted fixes both landed at 7.5.
- **Re-verify after every fix with the same measurement** that found the problem, on the same times, in both formats.
