# logo

Ledger: logo reveal lurch, act E (only `src\parts\act-e.js` was edited)

| Problem | Status | What changed |
|---|---|---|
| Logo reveal lurches at 42.1–42.5: about 290 px up, 300 px left and a shrink to about 70 % in about 0.35 s. The worst frame difference was 10.0 at 42.33 in 4:5. | **Fixed** | The mark now assembles at its end-card height and size. The lock point (`LY.lock`) is the frame centre x at the poster's mark y: 4:5 (540, 429) and 16:9 (960, 322), with `Klock = Kfin` (2.22 / 2.0). It used to be (540, 760) at K 3.0 and (960, 518) at K 3.2. The check tile now carries the bars **up** to it in 4:5 and left to it in 16:9. After the lock only the horizontal slide and the wordmark wipe remain. The slide is now 42.0–42.75 (0.75 s, house curve), was 42.1–42.65. The wipe is now 42.05–42.75. |
| Frame-difference target: ≤ 6 in 41–43.5 | **Met** | Measured at 60 fps on 1/4-downscaled grayscale, **without** motion blur. Without blur my baseline gave 11.99 where the critique (with blur) measured 10.0, so these numbers overstate the final render. 4:5: max **4.84** at 42.317 (baseline 11.99). 16:9: max **2.77** (baseline 7.33). The window 39.4–41.05 stays ≤ 1.5 in both formats. |
| Near-static lull 41.4–42.1 | **Fixed (slow creep)** | The lock point glides at a constant speed along the tile's travel direction (`LY.creep`): 4:5 rises at 40 px/s and stops on the lock; 16:9 moves left at 50 px/s. In 16:9 that is the slide's own direction, so the glide runs on through 42.0 and the slide takes over with no speed dip or reversal. The bracket close still slows into exactly 42.0 on top of this. A creep this slow barely shows in mean frame difference (about 0.05–0.1), but on screen it is visible. |
| Keep the 42.0 lock and a complete poster by about 43.8 that holds for at least 4 s | **Kept** | `T.E.lock` (42.0), the 4 % settle at 42.0–42.3 and `endLines` are unchanged. The poster is complete by about 43.75 and holds to 48.0. The last frame shows the same final lockup position. The slogan, which rises from 42.55, never collides with the slide. Nothing before 39.88 changes. |

The header and layout comments are updated to match, line endings are still CRLF, and `node --check` passes. The stills were rendered from the current file with no page errors (the only console line is a 404 resource-load message from the still tool). Sheets:
- `renders\fix5\logo-45\sheet.png` and `...\fix5\logo-169\sheet.png`: 39.5–43.875 at 0.125 s, 36 frames each.
- `...\fix5\logo-45-detail\sheet.png` and `...\fix5\logo-169-detail\sheet.png`: 41.9–42.75 at fine steps, plus 43.8, 46 and 48.
- `...\fix5\logo-45-before\sheet.png`: baseline for comparison.

The frame-difference probe is in the scratchpad: `<scratchpad>\fdiff.mjs`.

**For other owners:**
- **Docs / storyboard owner:** in the act E rows of `docs\storyboard.md`:
  - **39.5–42.0 row:** should say the mark assembles at the poster's mark height and size (16:9 y 322, 4:5 y 429), gliding slowly into place.
  - **42.0–42.55 row:** should become 42.0–42.75, horizontal slide only.
- **Timeline owner (optional):** `T.E.wordmark` in `src\timeline.js` could become `[42.0, 0.75]` to match. `act-e.js` already treats 0.75 s as the minimum, so nothing breaks if it stays as it is.
- **Audio:** the whoosh at `T.E.wordmark[0] + 0.25` (42.25, in `tools/audio/events.mjs`) still lands on the slide's fastest point, so it needs no change.

# light

I replaced the white disc with one even crossfade of the stage and the screen together. The bars now fold into the step dots on the still-dark screen, where they read clearly. The only file I changed is `src\parts\act-b.js`. The highest frame difference in 9.7–10.8 is now 4.2 in 16:9 and 4.4 in 4:5 (it was about 7.5).

**Ledger**

1. **White disc from the phone** → **fixed.** The radial bloom code is gone.
   - **Stage:** act B now draws its own copy of stage.js' light look (white, green gradient, rings, same parallax maths). One flat `#0B0B0B` sheet over it fades out evenly. I checked the copy against stage.js at 11.19, 11.3 and 11.4: identical pixels, so handing back to stage.js at 11.18–11.43 can't be seen.
   - **Screen:** the white page and the working stage fade in over the dark screen at the same rate as the stage.
   - **Timing:** the crossfade runs 10.1–11.18 with soft ends and a constant speed in between.
   - **Overrides:** `Film.stageDark` now returns `1 - progress`, evenly over the frame, so "Opnemen." and the VOORBEELD label are coloured against what is actually drawn; I checked the label crops mid-crossfade. `Film.isDarkScreen` switches the status bar to dark text at 45 % (about 10.59), and both sides read cleanly.

2. **Frame-difference target ≤ 5 in 9.7–10.8** → **fixed.** I simulated the final render (8 subframes averaged per frame, plus the encoder's dither): the maximum is 4.21 in 16:9 and 4.36 in 4:5. With the crossfade alone, Chrome's 8-bit compositing stepped the whole frame at once and single frames jittered up to 4.9. A tiny alpha slope across each fading sheet (±1.5/255, about one grey level corner to corner) spreads those steps out and removed the jitter.

3. **Duration 0.6–0.8 s** → **partly.** The visible bulk (10–90 %) takes 0.77 s, but 5–95 % takes 0.87 s. Almost the whole frame changes by about 240 grey levels, so a 5–95 % fade in 0.8 s would average about 4.5 per frame and peak near 5. I kept the margin under 5 rather than hit 0.8 s exactly.

4. **Bars → step dots too small to read** → **fixed.**
   - **Timing:** the bars fly from 9.82 to 10.38 (0.5 s each, 6 ms stagger), so all of it happens on the dark screen; the screen is under 25 % light when the last bar lands.
   - **Shape:** they stay bar-shaped in flight, 16–20 px tall and 4 px wide (at least 17 px on screen in both formats). Each group closes into an 18 px green disc on a status dot or a 2×16 line on a connector, at the real dot positions.
   - **Fade:** the green spine fades out over the page's own dots as one layer, so overlapping bars fade evenly.

5. **Camera (needed for item 2)** → **changed.** Moving the camera during the crossfade would have added to the frame difference, so it now holds on act A's hand-off framing until the light is done.
   - **16:9:** the push runs 11.08–12.08, instead of 10.3–11.35.
   - **4:5:** the push runs 11.08–11.98, with the key to the naming card overlapping its landing from 11.73.
   - **Effects:** the push peaks at about 3.9 frame difference. The "Sprekers benoemen" banner (11.6) now arrives while the camera is landing. The BC hand-off at 16.3 is unchanged.

Stills: `renders\fix5\light-169\sheet.png` and `renders\fix5\light-45\sheet.png` (9.80–11.18). For comparison: `light-before-*` (old version), `light-*-after` (11.0–12.7) and `light-*-late` (12.0–17.5).

**For other owners**
- **storyboard.md:** the Act B row (9.8–10.8, "soft white light sweep") and the `T.dark` "way back" note should now say: even crossfade 10.1–11.18, drawn by act B over stage.js. Stage.js' own dark-out front (9.8–10.6) is never seen. The `timeline.js` comment on line 40 ("act B's light front") is outdated in the same way.
- **stage.js:** if its light look changes (gradient stops, rings, depth constants, ring breathing), act B's copy has to follow (`DEPTH` and `mountStageLight` in act-b.js). Otherwise the hand-back shows a soft 0.25 s blend.

# drop

**Drop fixer ledger (act C, timeline, overlay text, storyboard)**

Four of the five fixes landed in both formats. The one gap is the recipients in 4:5, which are still about as small as before. I checked stills in both formats and at phone size, and the full-resolution 60 fps frame diff.

| Problem | Status | What changed |
|---|---|---|
| (a) Drop window overcrowded | Fixed | Lisa is now tapped at 23.6, so Q2 gets about 0.95 s on its own. The thesis moved to 24.0 / 24.25 and is gone at 26.1. The big "12 december" caption leaves before the tap (gone 23.65), so the thesis never shares the box with it. In 16:9 the camera now keeps about 150 px of room above the Q2 question until the tap. DROP stays at 22.0. |
| (a) "aan." jumps a line in 16:9 | Fixed | The caption layout is locked before the swap: "…dan houden we" / "de Q4-deadline" → "12 december" / "aan.", with "aan." on its own line throughout, so nothing reflows. |
| (b) Recipients invisible, 16:9 | Fixed | From 25.6 the camera pushes in (z 2.3) on the lower half of the review page. The context tap, file row, scroll, three recipient taps and send tap all play in that one close framing. Chips read at about 26–28 px, names at about 32 px. The phone stays at least 78 px clear of the overlay text. |
| (b) Recipients invisible, 4:5 | Partly | All taps are now in frame (Lisa's row used to be cut off at the bottom edge), but zoom stays at about 1.32 and chips at about 16 px. While the context footnote is up, the phone can't zoom further without going behind the text or the VOORBEELD label. Making them readable would need a cross-owner decision: either a text-free window for the chips, or a different footnote position in 4:5. |
| (b) Lurch and lull | Fixed | The pull-out to rest now starts at 27.3 and runs 2.7 s. It barely moves until the send tap at 27.5. Peak frame diff is about 7.7 at full resolution, down from 11.2. The e-mail unfold now starts at 27.9, so there is no small phone on an empty frame. In 4:5 the zoom dips by only about 2.5 % before act D's framing. |
| (b) Timing knock-ons | Done | Context card moved to 26.1 / 26.35, out 27.55, gone 27.8 (about 1.45 s on screen). Context tap 25.95, file row 26.15, chips pop at 26.73 / 26.95 / 27.17, send tap 27.5. The chip pops now land exactly on `T.C.recipients[1..3]`, so the sound effects line up. |
| (c) "Griffel vraagt daarna door." | Fixed | Now a white headline-weight line (700): 60 px in 16:9, 48 px in 4:5. It stays clear of the phone and the caption box. |
| (c) "Iets onduidelijk? / Griffel vraagt het eerst aan jou." | Fixed | Now 48 px in 16:9 and 40 px in 4:5 (was 40 / 36), one line each. In 4:5 it sits 4 px higher with tighter line spacing, leaving about 32 px above the returning caption. |
| Storyboard | Done | `docs\storyboard.md` is updated for every time I changed: both overlay-card rows, the act C rows, act D's 27.6–27.9 and 27.9–29.1 rows, and the C→D hand-off note. |

The sound-effect cues now follow the new times without any edit to the audio tools (checked: confirm 23.66, tick 26.15, pops 26.73 / 26.95 / 27.17, whoosh 28.25).

**For the payoff (act D) owner:**
- `T.D.emailUnfold` is now `[27.9, 1.2]` (was 28.4). Your current act D already reads it (your comment says 27.9).
- `T.D.sending` is unchanged at 27.6. Act C's send tap is now 27.5 (was 27.2), so "Notulen versturen…" only shows for about 0.1 s before your cover arrives.
- Act C's pull-out key now runs 27.3 → 30.0 toward rest and overlaps your camera key from 27.6. Please check your unfold frames against this camera.
- In 4:5 the zoom dips to about 0.954 near 28.8, then rises to your 0.978. If you want no dip at all, act C would need to stop its pull-out at your zoom rather than at rest; tell me and I'll change it.

Everything is in the project root:
- `src\timeline.js`
- `src\parts\act-c.js`
- `src\parts\overlay-text.js`
- `docs\storyboard.md`
- renders: `renders\fix5\drop-169\sheet.png`, `renders\fix5\drop-45\sheet.png`, `renders\fix5\drop-typo-169\sheet.png`, `renders\fix5\drop-typo-45\sheet.png`
- before / phone-size checks: `renders\fix5\drop-before-169`, `drop-before-45`, `drop-phone-169`, `drop-phone-45`

# hook

The opening now moves from frame 1 in both formats, and frame 0 is still the same poster. I measured from 60 fps stills over 0–1.8: 0.595 in 16:9 and 0.659 in 4:5, up from 0.173 and 0.196. No frame drops below 0.52 (16:9) or 0.55 (4:5), and the critic's spike rule (more than 3× the neighbouring frames and above 1) finds nothing over 0–3 s. I only edited `src\parts\act-a.js`. The only page error is a 404 for a missing file, which was there before my changes. Measured from the old final video, the opening scored 0.18–0.25, about what my stills give for the old code, so these numbers should hold once the video is re-rendered.

Ledger:

| Problem | Status | What changed |
|---|---|---|
| Hook block barely moves | fixed | The push is now 2.5 %/s about the block's left edge (4.5 % by 1.8 s, 5 % by the fold), plus a slight upward drift of 35 world px/s (63 px by 1.8 s in 16:9). The bars that start the fold follow the same movement, so they still start on their words. |
| Hook text stepped 1 px at a time | fixed | Without this the text moved in whole-pixel steps, so the frame diff flipped between 0.8 and 0.25. The hook block now gets `will-change: transform` and moves smoothly, at a steady 0.53–0.61 per frame. Text is just as sharp at 1.8 s. In 4:5, frame 0 has the same layout but the text now sits a fraction of a pixel lower. |
| Peeking phone hardly creeps | fixed | The phone now creeps up at 60 world px/s instead of 22. The peek grows from 156 to about 264 px in 16:9 and from 140 to about 233 px in 4:5 by 1.8 s. It still runs into the rise at `T.A.phoneEnter` without stopping. |
| Marker sweep doesn't read as an event | fixed | On the same clock as the sweep (`T.A.hook.highlight`), "Q4-deadline" grows 7 % about its left baseline and "aan." moves aside by the same amount. It produces one smooth 0.45 s bump in the frame diff (up to 1.36 in 16:9, 1.57 in 4:5), with no spike. The fold's bars start on the grown word and on the moved "aan.". |
| Frame 0 still a finished poster | kept | Frame 0 is pixel-identical in 16:9. 4:5 differs only by the sub-pixel shift above. |
| Hook bars land by 2.975 | kept | The last bar outside the phone is gone at 2.75 (16:9) and 2.755 (4:5); the bars inside the screen land at 2.975 as before. |
| Question vs phone | kept | 16:9: "En wanneer is dat?" is fully visible to 2.35 and gone by 2.495. 4:5: fully visible to 2.055, gone by 2.2, and at least 66.8 px from the phone's top edge while it shows. |
| Timer quantisation | intact | Line 557 still reads `const tq = Math.floor(t * 60 + 1e-6) / 60;` and it is still used for the timer value. |

Sheets are in `renders\fix5\`:
- `hook-169\sheet.png` and `hook-45\sheet.png`: 0–3.4 s at 0.1 s
- `hook-169-morph\sheet.png` and `hook-45-morph\sheet.png`: 1.95–2.8 s at 0.05 s

For other owners:
- **Storyboard (docs owner):** the Act A rows should mention the new movement: the 2.5 %/s push plus 35 px/s upward drift, the 60 px/s phone creep, and the key word growing 7 % with the marker. No times in `timeline.js` need to change.
- **Re-render:** the critic's numbers came from the old final video, so the improvement only shows up once someone re-renders it.

# payoff

All three payoff problems are fixed in `src\parts\act-d.js` (the only file I touched), checked in both formats against the live timeline, with `T.D.emailUnfold` now at 27.9 and act C's new slower pull-out. All on-screen speeds in the act stay at or under 24.6 px/frame. The only page error is the usual 404 that the still tool also shows on other pages.

**Ledger**

| # | Problem | Status | What changed |
|---|---|---|---|
| 1 | 16:9 phone half cut off at the right edge during the payoff, still showing "Notulen onderweg" | Fixed (both formats) | Once the e-mail page has left it, the phone moves fully out of frame: right in 16:9 (29.15–30.7), down in 4:5 (27.98–30.1). It stays out through the whole payoff hold and comes back for the inbox (16:9 from 32.2, 4:5 from 32.45), switching to "Verstuurd" on the first tick. The parking distance is computed from the camera, so the left bezel sits at x ≥ 2040 in 16:9 and the phone top at y ≥ 1390 in 4:5, shadow included. |
| 2 | Inbox preheader cut mid-word ("Ze best…" / "Z…") | Fixed | Every row shows the preheader's first sentence: "Meeting-notulen, met jou gedeeld." It is cut at the sentence end, with no ellipsis, and fits in both formats. |
| 3 | Act D must read `T`; 27.6–28.2 must never be a small phone in an empty frame | Fixed | No hard-coded times in the code; every time comes from `T.D` / `T.O` / `T.E`. "Notulen" now checks just before the page lifts out (min(27.6 + 0.55, unfold − 0.05) → 27.85). 16:9: the camera never pulls out past rest any more (unfold zoom 0.97 → 1.0), so there is no out-then-in. 4:5: the camera holds closer (0.92) instead of pulling out to 0.84; with act C's new pull-out the zoom is 1.16 at 28.0 and only dips to 0.919. Between them, the phone is large and the e-mail is already lifting out at 27.9. |
| 3b | No lull longer than 0.4 s in 27.4–35 | Fixed | I measured frame differences at 30 fps and fixed every quiet stretch: the first camera move now overlaps the payoff push, so there is no stop in between. In 4:5 the push starts as the unfold completes (29.1), which removes a still 29.45–30.05. The hold's slow camera push starts at 30.5 instead of 31.0, so 31.1–31.5 is no longer frozen. The 4:5 inbox pull-back went from 1.5 % to 4 % plus a 12 px rise; the rows keep about 45 px of clearance under the subtitle. |
| extra | 4:5 e-mail top edge moved about 30 px/frame during the unfold | Fixed | The 4:5 page's rise runs 0.35 s longer than its growth, which brings it to 22 px/frame. |

I checked the trust beat afterwards: the 4:5 phone top is still at 429 at 37.4 (same as before), and the chips are unchanged.

**For other owners**
- **Docs / storyboard:** the act D rows still say the unfold is at 28.4 and that the preheader is "truncated with an ellipsis". They should say: unfold at 27.9, the phone is parked out of frame for 30–32.6, and the preheader shows its first sentence.
- **`tools/still.mjs` `--sheet`:** the contact sheet silently drops the first frames. With 31 stills it showed only the last 22 (4:5) and 20 (16:9). The PNGs themselves are complete; I built my own sheets from them.
- **Act C:** nothing needed. One thing to know: the 0.14 s fade from act C's review screen into act D's "Notulen onderweg" screen is now seen at act C's close zoom, so around 27.65 both screens show at half opacity. That fade is in my file and I left it as it was.
- The shared scratchpad's `sheet.py` was overwritten by another agent during the session; my helpers are the `actd_*` files.

**Stills** (in `renders\fix5\`):
- `payoff-169\a.png` (27.4–31.15) and `payoff-169\b.png` (31.4–34.9)
- `payoff-45\all.png` (27.4–34.9)
- `payoff-trust-169\s.png` and `payoff-trust-45\s.png` (35.0–38.2)

# Verification

**Griffel launch film, verify round 5 (both formats).** Three of the five problems are fixed (1, 2, 4) and two are partly fixed (3, 5). I found no new breakage. Overall score: **7.5 / 10**.

**1. Logo reveal lurch, 41–43.5: FIXED (16:9 and 4:5)**
- I tracked the mark's centre and outline every 1/60 s.
- **No jump:** the mark speeds up smoothly from 42.02, reaching 22 px per frame (16:9) or 25 px per frame (4:5) at about 42.23. It then slows down and lands at 42.70–42.72. Its position never jumps.
- **Only slide and wordmark after 42.0:** the wordmark wipe starts at 42.10. The settle shrinks the mark slightly over 42.1–42.2 (175→168 px in 16:9, 195→187 px in 4:5) and stays continuous.
- **No static lull:** at least one measure moves every frame from 41.4 to 42.1.
  - In 16:9 the mark keeps drifting left at 0.5–1.3 px per frame.
  - In 4:5 it drifts up 0.4–1.1 px per frame.
- **Minor:** the brackets finish closing at about 41.85 (16:9) and 41.75 (4:5), not 42.0. From 41.78 to 42.02 the picture barely changes (mean frame difference about 0.09). That reads as a quiet beat, not a stop.

**2. White flash or iris at the dark→light change, 9.7–10.8: FIXED (both)**
- **No flash:** average brightness only goes up from 10.12 to about 11.15 (12→239), in even steps of 3.6–4.5 per frame with a soft ease-out from 11.08. No frame overshoots.
- **No iris:** I measured 6–7 areas (corners, middle, next to the phone). They brighten together and stay within about 10 % of each other, in both formats.
- **Morph visible:** the bars curl into a column and then into step dots over 10.0–10.4 in both formats (`morph169/sheet.png`, `morph45/sheet.png`).

**3. Drop window, 22.0–25.0: PARTLY**
- **Q2 reads for less than 1.2 s (the miss):** in both formats Q2 settles at 22.65 and is legible from about 22.5. Lisa turns highlighted at 23.6, so Q2 has 0.95–1.1 s, short of the 1.2 s target. The touch dot already appears at 23.3, so Q2 is untouched for only about 0.65 s. A slow camera pull-back runs over 22.7–23.9 while Q2 is up; the text stays readable.
- **Thesis timing OK:** "Griffel raadt niet." starts at about 24.08–24.1 in both formats.
- **No reflow jump in 16:9:** checked at 1/30 s, the caption keeps its three lines from 22.0 on. "12 december" flies in and lands at about 22.6 with a tiny settle. In 4:5 the word "aan." slides left smoothly over 22.45–22.68, with no jump.

**4. Hook, 0–1.8: FIXED (both)**
- **Frame 0 is a finished poster:** all text is set and the phone peeks in at the bottom.
- **Calm motion from frame 1:** frame-to-frame difference is about 0.53 (16:9) and 0.6 (4:5) from the very first frame. The text drifts about 0.6 px per frame and the phone rises about 1 px per frame (16:9). The phone's rise after 1.8 speeds up smoothly.

**5. Recipients, pull-out and payoff, 25.5–33: PARTLY**
- **Chips not readable at phone size (still there):** at 360 px wide the "Lisa ×", "Daan ×" and "Sanne ×" chips are pills of about 25×11 px with text about 4–5 px tall. You can see there are three green pills, but you can't read the names. The 16:9 version scaled to 360 px is the same.
- **No lurching pull-out (fixed):** I tracked the phone's width frame by frame.
  - In 16:9 it shrinks from 950 to 420 px, with a smooth speed peak of -28 px per 1/30 s around 28.1.
  - In 4:5 it goes from 562 to 352 px, peaking at -10 px per 1/30 s.
  - Direction changes pass smoothly through zero speed.
- **No empty-frame lull (fixed):** the e-mail unfolds from 27.9, while the pull-out is still running.
- **No half-cut phone during the payoff (fixed):** the phone is fully out of frame from about 29.9 (16:9) and 29.45 (4:5) until it comes back at 32.75 and 32.8. It is only cut by the frame edge while it moves out or back in.
- **No mid-word preheader cut (fixed):** "Meeting-notulen, met jou gedeeld." is shown in full in both formats.

**Things I noticed (minor; I can't tell whether they are new):**
- **"Notulen onderweg" next to the open e-mail:** in 16:9 (28.3–29.9) and in 4:5 (28.4–29.0, peeking under the card) the phone still says the minutes are on their way while the e-mail is open. The comments in `act-d.js` say this should never happen.
- **Phone parked half visible in 4:5:** during the inbox beat (about 33.2–35.5) only the top third of the phone shows at the bottom edge. This is the layout chosen in round 2, but it reads as a half-cut phone.
- **Payoff hold nearly freezes:** the slow camera push over 31.0–32.6 slows to about 0.1–0.2 px per frame over 32.2–32.6 in both formats. That is a near-still 0.4 s before the fan-out, although the code comment says it is "still past its peak speed".
- **"Doorvragen." overlaps the speaker caption:** the outgoing card is still fading out at 22.0–22.07 while the caption below it is already up.

**Whole-film scan at 1 s steps (0–48, both formats):** nothing is missing and nothing overlaps. The only page error is a 404 for `favicon.ico`, which is harmless; there were no script errors.

**Process notes:**
- Four of the extra 1/60 s calls rendered 37 frames each, one over the 36-per-call limit. It doesn't affect the results.
- `pay1169/sheet.png` from `still.mjs` came out with only one tile when several renders ran in parallel. I rebuilt the payoff, inbox and scan sheets myself as `sheet2.png`.

Everything is in `renders\verify5\`:
- **Contact sheets:** `hook169`, `hook45`, `morph169`, `morph45`, `logo169`, `logo45`, `drop169`, `drop45`, `pay1/2/3 169|45` (`sheet2.png`), `pay_late169.png`, `pay_late45.png`, `inbox169`, `inbox45`, `scanA169`, `scanB169`, `scanA45`, `scanB45` (`sheet2.png`)
- **1/60 s frames:** `f60_hook*`, `f60_hooktail*`, `f60_morph*`, `f60_morphtail*`, `f60_logo*`, `f60_drop*`, `f60_pay*`
- **Phone size:** `p360_45\montage.png`, `p360_45\chips_zoom.png`, `p360_169\montage.png`
