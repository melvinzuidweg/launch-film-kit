# Scale

The time scale works: the film now plays 1.1× slower, which makes it 52.8 s long. All three checks you asked for pass. Film time inside the acts is unchanged; only the output clock is scaled. I did not edit any `src/parts/*.js` file.

**One thing behaves differently from the design.** HyperFrames' renderer ignores a `data-duration` set from script whenever the page also has one in the markup. A first test rendered 2880 frames, the old 48 s from the static value. So I removed the static attribute from both pages. Now the renderer asks the page for its length, and both real pages come back with 52.8 s and 3168 frames. The cost: `hyperframes lint` adds one more false error (`root_composition_missing_duration_source`), on top of the 3 that were already there, and `hyperframes info` shows a 5.0 s placeholder. Renders and snapshots are correct.

**What changed (all in the project root):**
- **`src/timeline.js`**:
  - `T.SCALE` defaults to 1.1. A page can override it by setting `window.TIME_SCALE` before this file loads.
  - New: `T.OUT_DURATION` (52.8), `T.OUT_DROP` (24.2) and `T.OUT_FPS` (60).
  - New: `T.toOut(tFilm)` and `T.toFilm(tOut)`. `toFilm` rounds to 1e-9 s, so output 24.2 gives film 22.0 exactly.
  - `OUT_DURATION` and `OUT_DROP` are worked out live from `DURATION` and `SCALE`, so a variant that changes either before boot stays consistent.
- **`src/film.js`**:
  - `Film.render(tOut)` now takes output time and converts it to film time.
  - New: `Film.frameT(t)` = `floor(t*SCALE*60 + 1e-6)/60/SCALE`. The header explains that any text whose value changes must use it.
  - `Film.boot()` first writes `T.OUT_DURATION` into the root's `data-duration`. The GSAP proxy and the layer durations also use the output length.
  - `window.__seek`, `hf-seek` and `window.T_OFFSET` all work in output time.
  - New: `window.__seekFilm(t)` and `Film.lastOutT()`. `Film.lastT()` still returns film time.
- **`index.html`, `portrait.html`**: the static `data-duration` is gone. An inline script right after `#root` sets it from `window.T.OUT_DURATION`, with a comment explaining why.
- **`tools/still.mjs`**: times are output times. Without `--to`, the range runs to `T.OUT_DURATION`. New `--film` flag takes film times (labels show `f22.00s`).
- **`tools/capture_seq.mjs`**: `--from`/`--to` are output times. Without `--to`, it reads `T.OUT_DURATION` from the page first.
- **`tools/render.sh`**: `VARIANT=vraag` renders `index-vraag.html` / `portrait-vraag.html`. Outputs are named `renders/film-<fmt>-vraag-<mode>.mp4` and sequences `renders/seq-<fmt>-vraag-*`. It stops with an error if the page is missing. Without `VARIANT`, pages and names are as before. I also corrected the header comment, which still described the old two-pass capture.
- **`tools/audio/events.mjs`**: new `--page` option (default `index.html`). Every cue is worked out in film time and multiplied by `SCALE`. `drop` and `duration` are output values; `bpm` is the output BPM (109.091), plus `bpm_film`, `scale` and `page` for reference.
- **`tools/audio/mix.py`**: no timing logic needed changing; it already works off the cues file. I updated the docstring and added an optional `--song-drop X`, which sets song start = X − cues drop.
- **`docs/storyboard.md`**: new "Time scale" section, and the Tools section now covers stills, the final render and `VARIANT`.

**Verification:**
- **Drop still:** output 24.2 (= 22.0 × 1.1) shows the tap on "12 december" in both 16:9 and 4:5. It is pixel-identical to `--film --times 22`. HyperFrames' own snapshot at 24.2 matches too.
- **Full run:** a 0–52.8 sheet plays through to the end card.
- **Short capture:** `capture_seq` captured 24.15–24.25 at 480 fps (48 frames) and encoded it to 6 frames at 60 fps. Without `--to` it read 52.8 s from the page.
- **Runtime checks:** `frameT` gives the same value for all 8 subframes of every one of the 3168 output frames. The GSAP, hf-seek and `__seek` paths and the end clamp (52.8 output = 48 film) all behave.
- **Cues:** `events.mjs` gives drop 24.2, duration 52.8, 41 cues, all within 0.0005 s of the old cues × 1.1.
- **Mix:** `mix.py` produces a 52.8 s mix, and `--song-drop` worked on a test tone.

**API for the variant builder:**
- Build `index-vraag.html` and `portrait-vraag.html` as copies of the current pages. Keep the inline `data-duration` script, and do not put a static `data-duration` on `#root`.
- Any change to `T.DURATION` or `T.SCALE` must happen before `Film.boot()`.
- In `act-a.js` (line 564), the timer still quantises on the film grid, which smears once `SCALE` ≠ 1. Change `const tq = Math.floor(t * 60 + 1e-6) / 60;` to `const tq = Film.frameT(t);` in the variant. The original `act-a.js` needs the same one-line change by whoever owns it.
- Render with `VARIANT=vraag bash tools/render.sh 169 final` (and `45`).
- Cues: `node tools/audio/events.mjs --page index-vraag.html > renders/audio/cues-vraag.json`.
- Stills: use output times, or add `--film` for the times in the storyboard.

**For the music choice:**
- In the video the drop is at 24.2 s, and the 120 BPM beat grid now plays at about 109 BPM. The on-beat moments move too: the end-of-film words at 41.8, 42.35 and 42.9, the logo lock at 46.2.
- A track around 109 BPM will stay on those beats; a 120 BPM track will drift from them, though the drop itself still lands if you align with `--song-drop`.
- `tools/audio/find_drop.py` still prints "song start = drop_song − 22.0". That should be 24.2 (the `drop` in the cues file). It was outside the files I was allowed to edit.

Stills are in `renders/_ts/` (drop169, drop169film, drop45, full169 sheet). All other test files are removed.

# Variant

The "vraag" variant is built and works in both formats. Everything from film time 3.2 (output 3.52) on is the original film. The original pages render as before except for the act A timer: its digits now step on the 60 fps output frames (`Film.frameT`), as the spec asked for both variants.

**What it shows (film times; output is ×1.1):**
- **0.0:** the frame opens on a finished poster: the phone at rest in a close framing, showing the question card as act C draws it at the same layout and tokens. Only the strings act C lacks are copied, verbatim, from its own list. The card shows "STAP 1 VAN 3 · VRAGEN" (act C's count of 3, not the storyboard's "van 2"), the full question, three options, "Of zelf invullen" and "Vraag overslaan". "Iets onduidelijk?" is up from frame 0 (96 px in 16:9 on the left, 92 px in 4:5 on top), with the VOORBEELD label.
- **0.0–2.1:** a slow push of about 7 %, moving from frame 1.
  - 16:9: z 1.55 to 1.66 about "12 december"; the whole card is in frame at frame 0 and the phone's left bezel is at x ~1054.
  - 4:5: z 1.40 to 1.50 with the phone top pinned at y 300; "Vraag overslaan" is in frame at frame 0.
- **1.0:** the touch-dot taps "12 december" and it turns selected exactly like in act C. At the same moment "Griffel vraagt het eerst aan jou." rises, 700 weight, "Griffel vraagt" in the green emphasis. The bold/regular switch on the selected option also changes only once per output frame.
- **1.9–2.4:** act A's own dark recording screen slides in over the card, using act C's page-push style. The timer starts at 00:00, "OPNAME LOOPT" shows and the waveform runs. The status bar turns white halfway through.
- **2.0–3.15:** the camera eases out to the normal rest framing, where the original's slow camera creep (from 2.975) takes over. The overlay leaves as one block at 2.55 (gone by 2.8), so the text column is empty for 0.6 s before "Opnemen." at 3.4. The stage darkens from 2.0 as in the original. The original hook line and the words-to-waveform morph never show.

**Files** (all in the project root):
- `src\parts\act-a.js`:
  - New `T.V` block: `hookTap` 1.0, `subIn` 1.0, `camPush` [0, 2.1], `push` [1.9, 0.5], `pull` [2.0, 1.15], `out` 2.55. It is set on `window.T.V` only in the variant.
  - Copied card-drawing code, hook overlay, camera keys, the tap and the dark-status-bar window, all registered only when `VARIANT === "vraag"`. The variant registers no phone-motion keys.
  - The timer line is now `const tq = Film.frameT(t);` in both versions.
- `src\copy.js`: `COPY.variant.vraag = { head, sub, em }`, using the existing F2 lines only.
- `index-vraag.html`, `portrait-vraag.html`: copies of the two pages with `window.VARIANT = "vraag"` next to `window.FORMAT`. The inline `data-duration` script is kept and there is no static value.

**Verification** (stills in `renders\_vraag\`):
- **Variant sheets:** output 0–5 s at 0.25 s steps in both formats (`v169`, `v45`), the transition at 0.1 s steps (`tr169`, `tr45`) and the tap at 0.05 s steps (`tap169`). Motion is smooth and nothing overlaps.
- **Feed size** (`feed_sheet.png`, at 0, 1.2 and 2.0): in 4:5 at 360 px wide the headline and question read clearly and the options are small but legible. In 16:9 at 0.1875 the headline and question read.
- **Frame 1 moves:** the mean change per frame is 0.33–0.43 in 16:9 and 0.6–0.8 in 4:5. The original hook was about 0.5–0.6.
- **Original pages, before vs after** (`base*` vs `fin*`, output 0, 0.5, 1, 1.5, 2, 2.2, 2.5, 3, 11, 24.2): the timer digits differ from output 2.2 on, at 2.8–8 s, which is the `frameT` change. The other differences are 1–2-level noise that also varies between runs of an unchanged page.
- **Seek order:** the variant gives the same frame whatever was seeked before (identical, or 1 level apart).
- **Variant vs original after 3.52 (16:9 and 4:5):** the film content is identical, but the screenshots are not pixel-identical. When both pages are seeked the same way, the only difference left is the anti-aliasing on the dynamic island's edge, at most 11 levels on black over #0B0B0B, so invisible.
  - The cause is Chrome, not the film. It keeps the phone's rasterisation from the first frame a page paints, and in the original that frame has the phone at scale 0.94.
  - Proof: a copy of the original whose first painted frame is anything else (3.3, 20 or 22 s) matches the variant exactly.
  - The original itself shows the same effect: its frame at 4.0 s differs between a fresh load and after seeking to 22 s.

**Notes for the orchestrator:**
- **Audio cues:** `events.mjs --page index-vraag.html` gives a "tap" cue at output 1.1 rather than "select", because only the drop tap maps to "select". It still adds a "whoosh_short" at output 2.805 from `T.A.hook.morph`; the morph isn't shown, but the whoosh lands mid camera pull-out and fits. A variant-aware rule would need an edit to `events.mjs`, which was outside my files.
- **Repeated phrasing:** "Griffel vraagt het eerst aan jou." is followed about 2 s later by the original's unchanged "Griffel vraagt daarna door." (3.7–4.0 film). The spec requires the original from 3.2, so I left it; it's a call for the director.
- **Status bar:** during the 0.5 s slide, "9:41" is briefly white over the white card. It switches when the dark screen covers half the screen, like a real iPhone.
- **Shared `act-a.js`:** the variant code lives in the same file the original pages load, and it only runs when `VARIANT` is "vraag". The timer line is already changed for both versions.

# Critic

{
 "scores": {
  "hook_scroll_stop_power": 6,
  "hook_clarity": 8,
  "transition_into_story": 5,
  "hook_ui_fidelity": 8,
  "typography_readability_feed": 7,
  "slowdown": 7,
  "overall": 7
 },
 "problems": [
  {
   "severity": 4,
   "t_output": "2.09-2.64",
   "page": "index-vraag.html + portrait-vraag.html",
   "problem": "Wrong transition grammar after the hook. Once '12 december' is answered, the recording screen pushes in from the right (x +393) over the wizard. In iOS, a push from the right means forward navigation, so the viewer reads it as 'answering the question starts a recording'. That is the reverse of the real order, and the app has no such flow: it auto-advances to Q2 after 250 ms. The selected row also holds 0.9 s with no auto-advance. The fix-for-meaning ('Griffel vraagt daarna door.') only arrives at 4.4. Evidence: renders/critic-vraag/v169-hook/t_002.30.png, v45-hook/t_002.40.png.",
   "fix": "Make the swap read as 'going back'. In act-a.js renderWizard, reverse the push: rec.root translate(-393*(1-u)) and wz.page translate(+0.3*393*u), which is iOS back-navigation, meaning earlier. Or replace the push with a 0.35 s house-curve crossfade during the pull-out, the film's own time-jump grammar from the storyboard ('time jumps are visual'). Either way the app never seems to go from answering to recording."
  },
  {
   "severity": 4,
   "t_output": "2.2-11.0",
   "page": "portrait-vraag.html",
   "problem": "The 4:5 camera yo-yos. Sampled with Film.camera.at, zoom goes 1.50 (2.2) -> 0.862 (3.58) -> 1.15 (11.0): a 43% pull-out, then a 33% push-in. Round 2 removed exactly this kind of bounce with the hand-off rule. The pull-out is also fast (1.50 -> 1.02 in 2.2-2.75) and runs at the same time as the screen push. The mean frame diff peaks at 47.8 per 0.1 s at 2.3, against ~3 in the hook before it. In 16:9 the dip is only 1.66 -> 1.00 -> 1.06, which is fine.",
   "fix": "In mountVariant, for F45, pull to a framing on the creep path instead of L.cam0. For example focusCam/f45(196.5, 0, 540, 455, 1.0): phone top pinned under the caption box, so the phone still fits at z 1.0 with its bottom at ~1335. Lengthen V.pull to ~1.4 s so it settles instead of snapping. The original creep then only pushes 1.0 -> 1.15, one direction, with no dip to 0.86."
  },
  {
   "severity": 4,
   "t_output": "whole film (drop 24.2 -> logo lock 46.2)",
   "page": "index.html, portrait.html, both vraag pages",
   "problem": "SCALE 1.1 sets the film's 120 BPM grid to 109.09 BPM. Both licensed tracks (Hartzmann 'Just Flow' and 'One More Chance') measure ~110 BPM (onset-autocorrelation comb: 109.95-110.0). The music is aligned only at the drop, so beat-locked events drift. The outro stack (film 38/38.5/39, output 41.8-42.9) is ~0.15 s late. The logo lock (film 42.0 -> 46.2) is ~0.18 s late, about 1/3 beat. Events before the drop arrive up to ~0.2 s early.",
   "fix": "Set SCALE = 120/110 = 1.090909 in timeline.js (OUT_DURATION 52.36, OUT_DROP 24.0). The difference in slowness is under 1% and can't be seen, and the grid then matches both tracks exactly. First confirm the BPM on each track's Uppbeat page. Then re-run events.mjs and mix.py --song-drop for both mixes."
  },
  {
   "severity": 3,
   "t_output": "1.10-3.08",
   "page": "index-vraag.html + portrait-vraag.html",
   "problem": "The hook's key line gets almost no calm reading time. 'Griffel vraagt het eerst aan jou.' builds 1.1-1.8 and is fully up at ~1.8. The screen push starts at 2.09 and the zoom-out at 2.2, both pulling the eye to the phone, and the overlay starts leaving at 2.805 (gone 3.08). That leaves ~0.3 s calm and ~1.0 s fully readable for the line that names the brand and the promise.",
   "fix": "In T.V (film times): hookTap and subIn 1.0 -> 0.8, push [1.9,0.5] -> [2.2,0.5], pull [2.0,1.15] -> [2.25,1.15], out 2.55 -> 2.75. The overlay is then gone by film 3.0, before the text column passes ~15% dark, so the stage-dark colour mix never shows grey text on grey. The sub is then fully up at ~1.6 output, calm until ~2.4 and readable until ~3.0. The film gets about 0.3 s longer only inside the hook."
  },
  {
   "severity": 3,
   "t_output": "0.0-1.1",
   "page": "portrait-vraag.html (also index-vraag.html)",
   "problem": "Scroll-stop: the first 1.1 s is nearly static. A 4% push (z 1.40 -> 1.459) gives a mean frame diff of only 2-3 per 0.1 s. The first event is the touch-dot (~0.85) and a pale mint fill at 1.1-1.2, which is low contrast at 360 px feed width (v45-feed/t_001.20.png). The frame-1 poster is clean and readable (31 px headline at feed size) but very white and UI-like, which is common in feeds.",
   "fix": "The earlier tap from the fix above (film 0.8 -> output 0.88) puts a real event inside the first second. Also make the push visibly move from frame 1: 4:5 z 1.40 -> 1.55 over V.camPush (16:9 1.55 -> 1.72), still a constant speed. Optionally let the dot already be touching down at frame 0, so the first image already shows the action."
  },
  {
   "severity": 3,
   "t_output": "28.6-30.4",
   "page": "index.html + portrait.html (same in the vraag pages)",
   "problem": "The slowdown doesn't fix the densest beat. The context footnote 'Voeg een agenda of offerte toe. / Griffel gebruikt die voor namen en bedragen.' (13 words; 3 lines in 16:9) is fully up only at ~29.5 and leaves at 30.3, so about 0.8 s readable. In the same window come the file row, a scroll, three recipient taps with chip pops (29.3-29.9) and the send tap (30.25). Evidence: index-ctx/sheet.png, portrait-ctx/sheet.png. A uniform +10% cannot give 13 words the ~3 s they need.",
   "fix": "Do a local re-time instead of a bigger global SCALE. Insert exactly one bar (2.0 film s) after the drop: +1.0 to the context window (O.context out 27.55 -> 28.55, then the recipients and tapSend +1.0, so the card reads alone before the taps start), +0.5 to the resolved caption hold (see the next item) and +0.5 to Q2. Shift every later T value (D, E, handoff DE, voorbeeld, O.ch3, O.trust, DURATION) by +2.0, so act E keeps its bar position. Re-check the outro phrase against the track; mix.py --cut can repeat one bar before act E if needed."
  },
  {
   "severity": 2,
   "t_output": "24.93-25.96",
   "page": "index.html + portrait.html",
   "problem": "The drop window is still quick at 1.1x. The resolved caption '…dan houden we 12 december aan.' holds alone for only ~0.76 s (lands 24.93, leaves 25.69). Q2 'Wie stuurt de offerte naar de klant?' with three options gets ~1.0 s before Lisa is tapped (25.96). Both lines were set up earlier, so they read, but only just.",
   "fix": "This is part of the one-bar insert: +0.5 film to CAP's hold (caption out 23.35 -> 23.85) and +0.5 to tapQ2 (23.6 -> 24.1 plus the 0.5 shift), with C.q2/setup/climax following. The climax then rises ~1 s later and stays one event at a time."
  },
  {
   "severity": 2,
   "t_output": "21.1-24.1 (vraag), 23.15-24.15 (4:5 stack)",
   "page": "index-vraag.html + portrait-vraag.html",
   "problem": "In the variant the hook comes back word for word. The ch2 subs 'Iets onduidelijk? / Griffel vraagt het eerst aan jou.' rise over the same Q1 screen and the same tap on '12 december' the viewer saw at 0-2 s, so the drop plays like a rerun. With 'Griffel vraagt daarna door.' (4.4) and the climax 'Griffel vraagt.' (26.4), the promise is said four times. In 4:5, four text blocks also stack over the phone at 23.15-24.15 ('Doorvragen.', two subs, the Spreker 3 caption), with the phone bezel right under them (portrait-B/t_023.90.png).",
   "fix": "When window.VARIANT === 'vraag', skip T.O.ch2.sub in overlay-text.js (or add a per-variant T.O override). 'Doorvragen.' then stands alone, and the caption callback plus the '12 december' flight become the drop's new information, which the hook did not show. This also clears the 4:5 stack."
  },
  {
   "severity": 2,
   "t_output": "2.0-2.2",
   "page": "index-vraag.html + portrait-vraag.html",
   "problem": "The motion stalls, then lurches. The push's soft stop (pushEase, last 40%) almost stops the frame (diff 0.65-1.05 per 0.1 s at 2.0-2.2). The screen push and pull-out then jump in at once (13 -> 48 per 0.1 s). It reads as a gear change.",
   "fix": "Let the push hand its speed to the pull. End V.camPush at V.pull[0] with no soft stop (pushEase a -> 0, or end the key at 2.0 film), so the overlapping pull key blends from motion instead of from rest."
  },
  {
   "severity": 2,
   "t_output": "24.33-24.43",
   "page": "index.html (and the vraag 16:9 page)",
   "problem": "At the drop, the lifted '12 december' chip slides left by less than a word width while the option keeps its own label underneath. For ~6 frames the row reads '12 december r' and then '12 december 2 december' (index-drop/zoom_24.35.png, zoom_24.40.png). The issue predates the slowdown; at 1.1x it lasts 10% longer.",
   "fix": "In act-c.js (copy flight, ~line 505-572), fade the option's own label to 0 over CAP.lift .. CAP.lift + 0.08. Or widen the chip mask to the label's right edge until the copy has cleared the row, so no second copy shows."
  },
  {
   "severity": 1,
   "t_output": "29.3-30.4",
   "page": "portrait.html (+ portrait-vraag.html)",
   "problem": "At feed size (360 px), the 4:5 recipient chips Lisa/Daan/Sanne are ~5 px and the 'Eerder gebruikt' rows ~6 px. The three-tap sequence registers as motion, not as names.",
   "fix": "Covered by the context re-time: once the card has its own time, push the 4:5 camera to ~z 1.5 for the recipient taps after the footnote leaves (the text box no longer caps the zoom), so the chips reach ~8 px at feed size."
  },
  {
   "severity": 1,
   "t_output": "1.8-2.2",
   "page": "index-vraag.html",
   "problem": "As the 16:9 push centres on '12 december', the top row 'Projectoverleg nieuwe website' drifts up to y ~28, cramped against the frame edge (v169-hook/t_002.00.png).",
   "fix": "Aim the push slightly lower (pv.sy 528 -> ~550) or end it at z1 1.62 instead of 1.66, so the top row stays at least ~50 px from the edge."
  }
 ],
 "verdict": "FIX, not ship yet. The 'vraag' hook works as a message: in muted 4:5 at feed size, 'Iets onduidelijk?' plus a real Griffel question answered with one tap explains the product within 2 s. The card is faithful to act C (verbatim strings, correct selected state, legible ~11 px question at 360 px). Its weak spots are the first second, which is nearly static, and the hand-off into the story. The forward app push suggests answering starts a recording. The 4:5 camera does a 1.50 -> 0.86 -> 1.15 out-and-in bounce. The brand line gets only ~0.3 s of calm. The variant also repeats its own hook word for word at the drop. All of these are small T.V / act-a.js changes. Reverse the push or crossfade, pull 4:5 to z ~1.0 instead of cam0, tap at 0.8 and hold the overlay to 2.75, and drop the ch2 subs in the variant.\n\nThe global slowdown is a net win: act B, the drop and act D read calmer, and nothing feels sluggish (continuous motion, payoff hold ~1.76 s still alive, end card ~4.7 s). But it is the wrong tool for the one real bottleneck, the context/recipients/send beat at 28.6-30.4, where 13 words are readable for ~0.8 s next to five taps. That needs a local one-bar re-time. Also change SCALE from 1.1 to 120/110 = 1.0909 so the grid matches the ~110 BPM Hartzmann tracks; otherwise the outro and logo lock land ~0.15-0.18 s off the beat.\n\nEvidence: renders\\critic-vraag\\ (v169-hook, v45-hook, v*-feed, v*-3to8, index/portrait-A/B/C, index-drop, index-ctx, portrait-ctx)."
}

# Fix

Ledger for variant "vraag". Eight of the twelve notes are fixed or partly fixed, and four belong to other owners. Files edited: `src\parts\act-a.js` (variant code only) and the two -vraag pages. `src\copy.js` is unchanged.

| # | Sev | Note | Status | What changed |
|---|---|---|---|---|
| 1 | 4 | Transition read as "answering starts a recording" | fixed | The push is gone. The wizard now dissolves into the recording screen at film 2.4–2.9 (`V.swap`, house curve, no direction). The status bar turns white halfway through. The wizard leaves the layout at 2.92. One thing remains: the selected "12 december" row still holds about 1.6 s with no auto-advance. I kept that on purpose, because an auto-advance would show Q2 before the drop does. |
| 2 | 4 | 4:5 camera yo-yo | fixed | In 4:5 the pull now ends at z 1.0 with the screen top at y 455, not at the rest framing. The pull is 1.4 s long (film 2.25–3.65). Sampled zoom: 1.40 → 1.58 (2.25) → 1.005 (3.6) → 1.15 (10.0). It only moves in after the landing, with no dip to 0.86. 16:9 still pulls to the rest framing (1.74 → 1.00 → 1.06). |
| 3 | 4 | SCALE 1.1 vs the ~110 BPM tracks | not fixed | Needs `timeline.js`. A page could set `window.TIME_SCALE`, but this has to be global for both mixes. |
| 4 | 3 | Too little calm reading time for the hook line | fixed | Tap and sub now at 0.8, pull at 2.25, dissolve at 2.4, overlay out at 2.75 (gone 3.0). The sub rises faster (the climax's timing: stagger 0.05, dur 0.5), so it is fully up at film ~1.6, calm until 2.25 and readable until 2.75. Stage dark at the text: ≤0.02 when the exit starts, ~0.10 halfway through, 0.27 only at the end when the text is already faint (16:9; 4:5 is similar). |
| 5 | 3 | Weak scroll-stop in the first second | partly | The earlier tap puts the dot on screen at output ~0.53, the press at 0.88 and the selection at ~0.93. The push now runs at one speed from frame 1: 4:5 z 1.40 → 1.58, 16:9 z 1.55 → 1.74. Frame diff per 0.1 s over 0–2.5 s output: 4:5 3.3–4.9 (the critic measured 2–3), 16:9 2.3–3.5, so only slightly more motion in 16:9. Not done: the dot touching down at frame 0. That needs `touch.js` or a fake press that does nothing. |
| 6 | 3 | Context beat too dense | not fixed | Needs `timeline.js`, `act-c.js` and `overlay-text.js`. |
| 7 | 2 | Drop window still quick | not fixed | Same files as note 6. |
| 8 | 2 | The ch2 subs repeat the hook | fixed | Both vraag pages now override the timing right after `timeline.js` loads: `window.T.O.ch2 = Object.assign({}, window.T.O.ch2, { sub: [Infinity, Infinity] })`. The subs never show. Stills at output 20.6–24.4 show "Doorvragen." alone in both formats, and the 4:5 stack over the phone is gone. |
| 9 | 2 | Push stalls, then lurches | fixed | The push is now one constant-speed key from frame 0 to the pull's landing. It reaches the peak framing at 2.25, so the pull starts from motion. 16:9 diffs are steady at ~2.5–3.0 until 2.6 output, then 8.3 → 30.4 → 40.9. 4:5: ~4 → 10.4 → 37.8 → 50.3. That peak is the white-to-dark dissolve itself. In 4:5 it is a little higher than the old push: about 88 vs 71.3 per 0.2 s. The dissolve was lengthened from 0.4 to 0.5 s to soften it. This push uses a linear ease rather than the house curve, like the existing constant-speed creep. |
| 10 | 2 | "12 december 2 december" at the drop | not fixed | Needs `act-c.js`. Still visible in `index-vraag` at output 24.40. |
| 11 | 1 | 4:5 recipient chips too small | not fixed | Needs `act-c.js` and `timeline.js`. |
| 12 | 1 | 16:9 top row cramped at the frame edge | fixed | The 16:9 push now tilts down slightly as it zooms in. The "Projectoverleg nieuwe website" text centre stays 56–60 px from the top edge for the whole push (was ~27). The phone's left edge stays at x ≥ 1014. |

**Checks**
- **Original pages unchanged:** I rendered `index.html` and `portrait.html` at 0–3.5 s output (15 frames each) before and after the edits. 16:9 is pixel-identical. In 4:5 one frame differs by 1 colour level, which is the same as the difference between two fresh renders of the same frame.
- **Vraag frame 0:** the poster is unchanged. The only differences are sub-pixel anti-aliasing at the right screen edge, where the recording screen used to sit off-screen.
- **Rules:** everything is still a pure function of t. No text value changes were added.

**For other owners**
- **`timeline.js`:** set SCALE to 120/110 (note 3), once the BPM is confirmed on each track's Uppbeat page. Then add the one-bar insert (notes 6, 7, 11). After both, re-run `events.mjs` and `mix.py --song-drop` for both mixes.
- **Audio:** in the vraag mix, the `whoosh_short` cue (film 2.55) now falls inside the dissolve (2.4–2.9, midpoint ~2.66), which looks right. For an exact fit, `events.mjs` could read `T.V.swap`, which the vraag pages expose.
- **`overlay-text.js`:** the ch2-sub skip is a page-level override for now. You may want to replace it with a proper per-variant rule. It shows up as `null` in the `events.mjs` dump, which is harmless.
- **`act-c.js`:** notes 10 and 11.
- **Docs:** `docs/storyboard.md` has no section on the vraag variant. The variant's timings are written up in the header comment of `act-a.js`.

Files are in the project root:
- `src\parts\act-a.js`
- `index-vraag.html`
- `portrait-vraag.html`
- `renders\stills\vfix\v169-hook\sheet.png`
- `renders\stills\vfix\v45-hook\sheet.png`
- `renders\stills\vfix\v169-ch2\sheet.png`
- `renders\stills\vfix\v45-ch2\sheet.png`
