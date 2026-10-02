# Act A

All 15 problems are addressed in `act-a.js`: 10 fully fixed, 3 partly, and 2 not fixed because they are in files I don't own. I re-rendered stills of every affected moment in both formats; the only page error is a 404 for a missing resource that has nothing to do with act A.

While working I found and fixed two bugs of my own:
- **Word positions came from the fallback font.** `document.fonts.status` already reads "loaded" before Inter has been requested, so the word layout was measured with the wrong font. The bars sat 8–39 px off their words in both formats. I added a `document.fonts.check` on the hook's Inter face; the measured and drawn positions now agree within 0.5 px.
- **The hook text ghosted through the whole act.** My first pass set child elements to `visibility: visible`, which overrides a hidden parent. They now use `inherit`. Rendering frames out of order gives the same pixels for everything act A draws.

| # | Problem | Status | What changed |
|---|---|---|---|
| 1 | Caption push collisions | fixed | The older line moves up first (from 0.25 s before the new caption, over 0.5 s). The new line enters 0.1 s after its start and stays invisible until the older one has left the slot. 16:9 rows got 16 px more spacing. At 5.5–5.9 and 7.2–7.45 nothing touches, and the gap between the dimmed line and the next tag is about 60 px. |
| 2 | Collapse looked like a double exposure | fixed | Each word now squashes at full opacity to its cluster width (26–43 % of its width) and 80 % height. It then dissolves into its bars at exactly the same footprint and colour. No bar ever shows over letters that are still unsquashed. |
| 3 | Payoff buried in the grey band | partly | Every bar lands by 2.974 and looks settled by about 2.93, so the finished waveform reads on the light stage from 2.93 to 3.15. The grey-stage dip and "Opnemen." fading in grey-on-grey belong to stage.js, overlay-text.js and timeline.js. |
| 4 | VOORBEELD label missing on frame 1 | not fixed | stage.js / timeline.js; see the recommendations below. |
| 5 | Tags unreadable at phone size | fixed (act A) | 16:9: tag 24 px / 600 / 0.12em, line 46 px. The longest line is 822 px and ends at x≈992, about 130 px clear of the phone. 4:5: tag 22 px in a fixed 150 px column, line 34 px; the longest line is 772 of 912 px. The VOORBEELD label size goes to the stage.js owner. |
| 6 | Dirty hand-off to act B | fixed | The live row, timer, description and mic row fade out over 10.0–10.25; the waveform stays. My dark-screen window now ends at 10.3. The white status bar you still see at 10.45 comes from act B's window. |
| 7 | Busy state kept "Stop opname" | fixed | At 9.6 the label crossfades to "Opslaan..." over 0.15 s, and the button dims to 0.6 as in the app. The strings are inline nl.ts fallbacks until copy.js has the keys. |
| 8 | Camera creep not felt | fixed | +4.5 % from 3.4 to 6.2, then +6 % in total by 9.2 (the two moves overlap a little so there is no dead stop). The return runs 9.35–10.0, overlapping the end of the hold. All on the house curve. |
| 9 | Bars slid over the phone frame; staircases | fixed | Anything inside the phone outline is now drawn on the screen (mint) and anything outside in the world (ink); the bezel strip in between hides the bar, so it reads as passing under the bezel. 16:9: one arc into a row left of the phone, then the row slides in. 4:5: two rows spread out sideways, drop beside the phone, then slide in. The slide runs on one shared clock, so the row stays rigid with no staircases and no bar crosses another. |
| 10 | Static 16:9 composition | partly | Added a −10 px caption drift over 3.4–9.2 as a second motion layer. I did not move the caption box: it is `L.captions` in film.js, and moving it up to the waveform's height would hit the ch1 sub line at y 442–491. I skipped the waveform accent: an accent on the bar heights would still be on screen at 9.8 and break act B's exact bar hand-off. |
| 11 | Marker sweep and colour change not linked | fixed | A green copy of "Q4-deadline" is revealed by the same progress value as the marker, so the ink turns green just behind its edge. The mint block is about 6 px taller. |
| 12 | Weak first frame | fixed | "…dan" is already ink at t=0; the karaoke runs over the rest within [0.05, 1.0]. |
| 13 | Empty frame from 2.45 to 3.2 | partly | 16:9: the whisper holds until 2.65 and fades out by 3.05. 4:5: the rising phone reaches the whisper's position at about 2.42, so it holds until 2.15 and is gone by 2.4. In 4:5 the camera also eases up 40 px over 2.3–3.1. The top of the 4:5 frame is still fairly empty until "Opnemen." arrives. |
| 14 | Orphan text at the overlay exit | not fixed | overlay-text.js owner. |
| 15 | Mic row missing | fixed | Added the MicrophoneSelector row: mic-outline 14 px and "Microfoon" (13 px / 500, muted), 24 px under the description, matching recording-view.tsx. |

**Changes for other owners:**
- **timeline.js**
  - `voorbeeld: [-0.4, 37.9]`, so the label is there on frame 1 (rank 4).
  - `O.ch1: { in: 3.45, sub: 3.75, out: 9.6 }`, so "Opnemen." starts white on a stage that is at least 85 % dark (rank 3).
- **stage.js**
  - Darken toward the phone with a radial or vignette, instead of a flat full-frame fade.
  - Raise the VOORBEELD label to at least 22 px in 16:9.
- **overlay-text.js:** exit the ch1 headline and its sub line together, or the sub 0.1 s earlier (rank 14).
- **copy.js:** add `app.recStop: "Stop opname"`, `app.recStopping: "Opslaan..."` and `app.recMic: "Microfoon"`, verbatim from nl.ts. Act A already reads these keys first and falls back to its inline strings.
- **act-b.js**
  - End its dark-screen window (currently to 10.58) when the light passes the status bar, at about 10.4.
  - Match its returning caption to act A's new type sizes. It is still 14/32 px in 16:9 and 13/28 px in 4:5.
- **storyboard.md**
  - Change the pause button to the real 64 px with a 40 % #9C9C9C border.
  - Note the mic row.
  - Note that the 4:5 whisper leaves at about 2.4.
  - Record the signature-move timing: words fold 2.0–2.35 and all bars land by 2.98.

Files are in the project root:
- `src\parts\act-a.js` (the only file edited; the pre-pass version is saved as `act-a.before-r2.js` in my scratchpad)
- Stills under `renders\stills\`:
  - `actA-r2-final169`, `actA-r2-final45`, `actA-r2-rec169`, `actA-r2-rec45` (whole-act sheets, both formats)
  - `actA-r2-push169\crops.png` (caption pushes)
  - `actA-r2-ends169\handoff.png` (hand-off to act B)
  - `actA-r2-small169`, `actA-r2-small45` (phone-size frames)

# Act B

Act B is reworked and every problem is now fixed or partly fixed, except problems 13 and 14, which need your decision. I re-rendered stills of every affected moment in 16:9 and 4:5. No page errors came from `act-b.js` (the only console line is a 404 for a missing resource, which was there before). I only edited `act-b.js`.

| # | Status | What changed |
|---|---|---|
| 1 | fixed | The flip now overlaps instead of chaining. The strike runs 15.25–15.39, "Spreker 1" leaves 15.40–15.54, "Lisa" rises in 15.42–15.74 (scale 1.05→1) and the marker runs 15.60–15.90. The caption exit moved to 16.35 (`T.O.ch2.swap − 0.05`). "Lisa · Die stuur ik wel." is fully resolved for 0.45 s and readable from about 15.6. |
| 2 | partly | I did not use the critic's numbers: a scroll from 14.9 to 15.45 would put the 15.2 tap on a moving or off-frame button. The scroll is now split in two. The first scroll (220 px) runs 13.32–13.88, during the clip and before the focus-tap dot appears. The second (183 px) runs 14.64–15.14, after "Lisa" is complete at 14.54. 403 px in total is the real page's maximum scroll. Peak speed is about 28–30 px per frame, down from 60–75, and the camera holds still during both. The pull-back now runs 15.75–16.35, after "Lisa" lands. One leftover: the dot appears at 14.88 while the button is still about 40 px from its spot; it settles under the dot by about 15.0. |
| 3 | fixed | The tag is sentence case "Spreker 1", weight 600, #6B7280, with a 3 px #131417 strike. "Lisa" lands in the same slot at the same size (700, #12804B). I used the line size (36 px in 16:9, 30 px in 4:5, matching Act A) rather than 0.8×, because 0.8× could not reach the ≥5 px target. Cap height at phone size is now about 4.9 px in 16:9 and 7.3 px in 4:5. |
| 4 | fixed | Each incoming screen now fades in on top (0.25 s, house curve) while the outgoing one stays at 100%, so there is no white dip: naming at 12.42–12.67, back to the working stage at 15.36–15.61. The confirm tap uses `hold: -0.18`, so its dot is gone by about 15.44 (side effect: on this one tap the dot itself doesn't shrink; the ripple and the button press still show). Left over: about 3 frames of normal crossfade text overlap. |
| 5 | partly | The banner now starts leaving at 12.25 and is gone by 12.67. My top row hides under the opaque banner (12.35–12.47) and comes back at 12.68–12.98, and "Wie hoor je hier?" enters at 12.62, so the banner never crosses my content. It still crosses "9:41" and the status icons at about 12.45–12.63; fixing that needs the change in `pushes.js` below. |
| 6 | fixed | A dark layer with a 0→4 px backdrop blur covers Act A's chrome at 9.80–10.00, so only the bars are left when the swing starts (9.88 in 16:9, 9.94 in 4:5). The −8 px drift isn't possible without editing Act A. The card frame now unfolds both edges from the spine in one move (10.36–10.72), so there is no lingering narrow box. |
| 7 | fixed | A 54 px dark band (with a 14 px soft edge) stays under the status bar until `T.A.recScreen[1]` and fades out at 10.54–10.60, in step with the status bar's colour flip. |
| 8 | fixed | 16:9: the camera leans in to {cx −150, cy 70, z 1.45} at 10.7–11.5, then eases to {−245, −50, 1.22} by 11.95. 4:5: {0, −90, 1.2}, then z 1.02 with the phone top at y 451. The phone stays right of x≈995 from 12.0. The badge text is still about 3 px at phone size in 16:9; the mint pill reads as a shape. |
| 9 | partly | The 16:9 naming push is z 1.45 creeping to 1.47 (was 1.33), not 1.7. At 1.7 the frame can't hold card 1's header and Bevestigen without a camera move during the scroll. Typed "Lisa" is about 4.4 px at 360 px wide. |
| 10 | fixed | "Griffel is aan het werk" and "Wie hoor je hier?" now come in as single blocks (opacity plus a 12 px rise, house curve). Act B has no per-word masks left. |
| 11 | fixed | 4:5: the phone top is pinned at y 444, below the caption box. Bevestigen sits at y≈1229, 121 px above the bottom, and Overslaan is fully in frame. |
| 12 | fixed | Order is now: phone screen settles by 15.61, "Lisa" lands 15.42–15.74 while the camera holds, then the camera pulls back. |
| 13 | not fixed | Story contradiction (the flip answers Q2 before Griffel asks it). This needs you: change C's second question or the flipped line in `copy.js`/`demo-meeting.md`. |
| 14 | not fixed | I kept the RefreshCw tile because the storyboard explicitly asks for it. The app's owner working stage (`[id].tsx` ~563–569) has no tile. If you drop it, the hero should move up about 100 px in my file. |
| 15 | partly | "Fragment 2/3" now holds at 0:00 from 14.2 to 14.9. The caption's small waveform stops when fragment 1 ends. Both former E.in fades now use the house curve. I did not add a keyboard. |

**Remaining known issues**
- The two screen crossfades (12.45–12.6 and 15.4–15.55) overlap text at about 50% for roughly 3 frames.
- The banner still crosses the status bar on exit (problem 5).
- Act A's stop-tap dot stays visible over the dark layer until about 10.0, because touch dots are drawn above every screen.
- Out-of-order seeks show tiny Chrome rendering differences (battery outline, overlay text edges). The parts don't hold state between frames, so sequential renders are consistent.
- I ran one read-only `git status` by mistake; nothing was changed by it.

**Recommendations (I edited none of these files)**
- `timeline.js`: no change needed. Optionally, ending Act A's dark-screen window (`T.A.recScreen[1]`) at about 10.45 would make the status-bar band unnecessary; the band already follows that value.
- `pushes.js`: fade the banner out within the first 60% of its exit, on the house curve. This affects every push in the film.
- `touch.js`: the dot fades out on a slow-start curve and lingers about 0.4 s after release. A faster fade, or a separate release time, would let me drop the `hold: -0.18` workaround.
- `storyboard.md`: remove the tile from the working-stage spec (problem 14), and settle problem 13.

Files are in the project root:
- `src\parts\act-b.js` (backup of the previous version: `<scratchpad>\act-b.before-r2.js`)
- `renders\stills\b2-169-final\sheet.png`
- `renders\stills\b2-45-final\sheet.png`
- detail stills: `renders\stills\b2-169-{morph,cover2,clip,name,s2,back,phone}` and `renders\stills\b2-45-{morph,name,check,phone}`

# Act C

I've reworked act C and re-rendered both formats; the page shows no errors from my file. The last sheets for 16:9 and 4:5 hold together end to end. Of the 20 problems, I fixed 12 in act-c.js and partly fixed 3. The other 5 need a timeline, overlay or shared-part change outside my file, and #1 (overlay cards overlapping) is the biggest of those. I only edited `src/parts/act-c.js`. The only console message is a 404 that comes from elsewhere on the page; my file loads nothing.

| # | Problem | Status | What changed |
|---|---|---|---|
| 1 | Overlay cards overlap at 22.15 and 24.6 | Not fixed (overlay owner) | Still visible at 22.2 and 24.6. My screen now leaves 22.0–22.3 to the tap and selection only. The T.O times that would fix it are listed below. |
| 2 | Empty phone 17.1–17.65 | Fixed | The question build starts at 17.07 (`tStepIn + 0.12`) instead of 17.4, and its pace is unchanged. "Er" is readable by about 17.3. |
| 3 | Drop payoff half-drawn | Fixed | Selection, check circle and tick each take 0.12 s and are complete by 22.20. Q1 leaves at 22.29 over 0.24 s. The tap, punch and selection own 22.0–22.3. |
| 4 | 16:9 crops through the island; options too small | Fixed | The Q1 close-up is at z 1.5–1.55 (1.61 at the punch), cropping just above the step label, with the phone left of x 1022. Q2 is at z 1.5 and shows the top row down to "Terug". At phone size the options are readable. |
| 5 | Double exposure with act D | Fixed | The review content fades as one block from 27.52 over 0.22 s with an 8 px drop. Act D's hero lands on a clean white screen at about 27.7. |
| 6 | Send button clipped under the corners | Fixed | The scroll is split in two. The first scroll is 150 px, so the button stays fully off screen while the file row lands. The second scroll (330 px at 25.3) brings it in with about 59 px clearance. It still passes the bottom edge for about 0.2 s while scrolling in. |
| 7 | Recipients pop in by themselves | Fixed | I added the real "Eerder gebruikt" contact list. Three taps (26.04, 26.34, 26.64) on rows that exist in the app each remove the row and pop the chip. The rows are listed Sanne/Thomas/Lisa and tapped bottom-up, so no row moves under the finger. In 16:9 the camera stays on the recipients at z 1.5–1.53 instead of going to rest. |
| 8 | Two word-by-word builds at once (18.55–19.25) | Partly | The question now ends earlier (last word starts 18.85). The overlay line still builds at 18.4, which is a T.O change. |
| 9 | Push banner lingers after the tap | Fixed in act C | The banner's exit is scheduled from 16.75. Because of the slow-start exit curve in pushes.js, it only starts moving after the tap and is gone by about 17.15. |
| 10 | Camera static 16.0–17.1 | Fixed | A lead move from 16.3 leans in on the push banner (z 1.25 in 16:9, z 1.2 in 4:5 with the phone top kept at 375). |
| 11 | Step 2 too fast to read | Partly | Q2 builds from 22.35 at 0.032 s per word and is readable by about 22.7, framed at z 1.5. Lisa is tapped at 23.15. The competing "Griffel vraagt." build is a T.O change. |
| 12 | Review missing the answered card and "Terug" | Fixed | Added the "VRAGEN / 2 van 2 beantwoord / Wijzigen" card, "Terug" under Q2's skip and "Terug" under the send button, and re-laid out the review screen. |
| 13 | 16:9 crop cuts the step label during the context beat | Fixed | After the first scroll the crop sits in the gap above the answered card (z 1.58), and the camera moves together with the scroll. |
| 14 | 4:5: three events in 0.6 s | Fixed | The camera holds z 1.12 through the busy state (27.28) and returns 27.4–28.0. |
| 15 | 4:5 gap under the context title | Not fixed (overlay owner) | Needs a change in overlay-text.js. |
| 16 | One-word widow in the subtitle | Not fixed (overlay owner) | Needs a change in overlay-text.js. |
| 17 | Android-style ripple | Fixed | The selection is now a flat mint fill on the house curve plus the 0.985 press squash. |
| 18 | Easing curves other than the house curve | Fixed | My file now uses the house curve everywhere; word rise is 0.42 s and page exits 0.24 s. |
| 19 | Self chip doesn't pop at 25.8 | Kept static, as it always exists in the app | 25.8 is now the scroll cue. Please update the storyboard to three tap-driven pops at 26.1, 26.4 and 26.7. |
| 20 | Storyboard and copy.js out of date | Not done (no edit rights) | The film already shows "Stap 1 van 3" and a file row with an X. The storyboard needs both updates, and the NL strings need folding into copy.js. |

**Recommended changes outside my file (I edited none of these):**
- **Overlay timings (`T.O`):**
  - `ch2.out` to 21.45 with the current 0.4 s exit (21.75 if exits become a 0.2 s block fade).
  - `climax.a` to 22.30.
  - `climax.out` to 23.95 (24.15 with a 0.2 s exit).
  - `context.a` to 24.5.
  - `ch2.subB` to [16.6, 19.3].
- **`overlay-text.js`:**
  - Build "Griffel vraagt." as one block.
  - Place the context subtitle from the measured title height (#15).
  - Cap the subtitle width at about 560 px in 16:9 (#16).
- **`T.C`:** optionally move `tapQ2` to about 23.3 for more reading time on step 2. `q1Build[0]` no longer drives the start; act C now times it from the push tap.
- **`pushes.js`:** use the house curve over 0.3 s for the exit when the banner is tapped.
- **`touch.js`:** the fade-out keeps an old dot fully visible for about 0.3 s. With taps 0.3 s apart, two dots show at once during the recipient taps; a shorter house-curve fade-out would fix it.

**Remaining known issues:**
- **Near-empty moments:** the phone is nearly empty for about 0.1 s at the Q1→Q2 page change (about 22.45) and the Q2→review change (about 23.65).
- **Left out of the real app's UI:**
  - The "Volgende" button that shows for 250 ms after a selection.
  - The Detailniveau and Taal sections of the setup card.
  - The e-mail input, whose placeholder text is itself an example e-mail address.
  - The file-types hint.
- **Names instead of addresses:** chips and contact rows show first names instead of e-mail addresses, on purpose.
- **Scroll clip in 4:5:** the send tile is clipped by the scroll edge at the top of the 4:5 frame after the first scroll. This is a normal scroll clip.

Files are in the project root:
- src\parts\act-c.js (backup of the previous version: <scratchpad>\act-c.prev.js)
- renders\stills\actc-final-169\sheet.png
- renders\stills\actc-v3-45\sheet.png
- renders\stills\actc-v5-45-fine\sheet.png
- renders\stills\actc-v4-169-fine\sheet.png

# Act D

I made a full revision pass on `act-d.js` and only edited that file. Stills now render with no page errors from Act D in either format. I re-rendered every affected moment in both formats, including the phone-size checks (`--scale 0.1875` for 16:9, `--scale 0.333` for 4:5).

| # | Problem | Status | What changed |
|---|---|---|---|
| 1 | 4:5 fan-out text on text | fixed | In 4:5 the e-mail header blocks fade out from 30.1 and stay hidden through the collapse. The card is clipped every frame so nothing renders above screen y = 340, computed from `Film.camera.at(t)`. Checked: the card top cuts exactly at 340. |
| 2 | 4:5 zoom crosses the title zone | fixed | The same y = 340 clip runs from the zoom on, so the top edge, shadow and left-edge sweep never reach the title zone. The 4:5 zoom is now z 2.3 then 2.36, and the card's left edge is just past the frame edge. I did not add the extra `z: 0.95` key, because the clip already solves it. |
| 3 | Step list dissolving inside the app at 'Verstuurd' | fixed | The ProcessingSteps card now leaves at `tDone` (opacity 1→0, 8 px rise, 0.4 s, house curve), in the same window as the title swap. The `tStepsOut` dissolve is gone and no description line was added. |
| 4 | Frozen, empty ending | fixed | Camera: back to rest from 33.8, then a push on the StageHero from 34.35 to 35.4 (16:9 `{cx -380, cy -220, z 1.14}`; 4:5 `{cy -360, z 0.86×1.14}`). Then a drift from 35.3 to 36.7 (+2 % zoom, 8 px), and back to rest from 36.6, landing exactly at 38.0. The lower screen is cropped and something moves in every frame. |
| 5 | Fan-out overloaded and ghosted | fixed | Moves are staggered: camera pull-out 32.2–32.7, card collapse 32.28–32.66. In 16:9 the heading moves and scales onto the row's subject line, and the row face cuts in over 0.08 s at 32.56. The rest of the e-mail stays visible while the card folds, so it never shows as an empty slab, and the logo and tag leave upward. The phone is parked out of frame during the hold (31.25), so the pull-out reveals it instead of it sliding in. The L avatar now waits until the card has become a row. In 4:5 the row face dissolves in from 32.44. |
| 6 | Payoff hold too short | fixed | `tRowsOut` = 33.85 with house-curve exits (0.4 s, 0.06 s stagger), so all three rows hold together from 33.2 to 33.85. From 33.8 the rows sit behind the phone (z-index −1), so the returning phone slides over them. |
| 7 | 'Verstuurd' flip happens off-stage | fixed | `tDone` = 34.0 and `tSentCheck` = 33.9. Checked: the phone is in frame mid-return in both formats. |
| 8 | Phone half behind the card | fixed | 16:9: the phone tucks fully behind the card (`{x 140, y 24, s 0.82}`) and its screen fades out with a 6 px blur (28.5–29.0). It comes back while hidden and parks at `{x 518, s 0.75}`. 4:5: the phone is now at y 470, so the card's bottom edge sits between the header and the tile. |
| 9 | Page lift starts as a blank white slab | fixed | The lifted page starts below the safe area (inset 59, height 793) and follows the moving phone, so the island and status bar stay visible. The keyline, logo and tag are fully visible from the first frame; the whole page fades in over 0.12 s with a 2 % lift and a shadow. The body builds faster. |
| 10 | 16:9 phone-size readability | partly fixed | Chips are now 70 px tall at 30 px type, and they read at 360 px wide. Rows: the camera is z 1.15 and the row type is larger (20/19/16). 'Griffel / Je meeting-notulen' is borderline readable at 360 px; the third line is not. 4:5 is fine. |
| 11 | Fan-out jammed right | fixed | Rows sit at about x 780–1411 and the phone at about 1460–1820 (about 45 px gutter, 100 px right margin). The overlay text ends at about x 665. |
| 12 | Sloppy zoom crop | fixed | Zoom now `frame(…, 1084, 560, 2.0)`, creep `frame(…, 1080, 556, 2.04)`. Card edge at about 1004 and row 1 ends about 1810. Upper blocks dim to 0.15 and the shadow is cut by 0.9×. |
| 13 | Whip zoom | fixed | The camera zoom now runs 30.1 + 1.05 s (z 2.0 in 16:9, 2.3 in 4:5). `T.D.zoomAction` is still the anchor for the markers. |
| 14 | Handoff in from Act C | partly fixed | Act C was rewritten while I worked: it now ends scrolled 330 px down with its header off-screen, so matching its header is no longer possible. Instead the new stage settles in from slightly above over Act C's own fade-out. The hero, header and steps come in at once, so there is no blank frame, only a short crossfade. The light sweep now has a mint core and the veil peaks at 0.3; it is visible on the stage. |
| 15 | Handoff out at 38.0 | not fixed (other owners) | Still true at 38.0: the trust lines are fully on screen. Act E now crossfades in a dark screen rather than the iris. |
| 16 | Copy truth and fidelity | partly fixed | Rows 2 and 3 are plain sentences now, and `K.success` is `#29513B` (verified against the app's `global.css`). The row's third line uses `C.email.inboxPreheader` if `copy.js` gains one, and never repeats the subject. The intro line and the inbox subject strings belong to the `copy.js` owner. |
| 17 | 4:5 chips sliced by the phone edge | fixed | Chip opacity is now `P(t, t0 + 0.2, 0.35)`, so chips only become opaque once they clear the phone. Applied in both formats. |

**Remaining known issues and conflicts:**
- **Spec divergence (fix 5).** I parked the phone before the fan-out instead of adding a phone slide at 32.45. The storyboard allows "aside or behind", so this does not conflict with it.
- **Truth fix not taken (fix 16).** Per the storyboard and `copy.js`, the inbox rows still read "Griffel · Je meeting-notulen · Projectoverleg nieuwe website". The critic's more truthful subject and preheader version needs the copy owner to change `copy.js`.
- **Empty 'Verstuurd' screen.** The done screen is the hero only, which matches the real app. The push-in keeps the empty part small, but it is still there.
- **Act C camera (for its owner).** In 4:5, Act C's camera is still returning to rest until 28.0. In 16:9 it zooms out from z ≈ 1.5 between 27.4 and 28.0, overlapping Act D's entry.
- **Act A (for its owner).** While I was rendering, an in-progress Act A edit briefly left the hook line ("…dan houden we de Q4-deadline aan.") on screen through 32–38 s. It was gone in my last check at 33.5.

**Recommended `timeline.js` changes (not edited):**
- `O.trust.out` 37.8 → 37.5, so the trust text's blurred exit (about 0.47 s) is finished by about 37.97. The other half of fix 15 belongs to Act E: start "Opnemen." no earlier than 38.05.
- `D.zoomAction` could become `[30.1, 1.05]` to match the camera key I now use locally. This is optional.

Files are in the project root:
- src\parts\act-d.js (the only file edited)
- renders\stills\d2-169-final1, d2-169-final2, d2-45-final1, d2-45-final2 (full passes, 27.5–38.25)
- renders\stills\d2-169-small, d2-45-small (phone-size checks)

# Act E

I fixed all 13 problems in `act-e.js` and checked them on stills in both formats. Three are only partly fixed: #1 and #12 because of a timing value in `timeline.js` that I can't edit, and #9 because the 16:9 fine print stays tiny at phone size.

**Before you review the stills: act A now leaks into every frame.** `act-a.js` was changed at 19:45 while I was working, and it now leaves the hook line "…dan houden we de Q4-deadline aan." on screen for the whole film. I checked at 30.0 and 39.6, and it covers the act E words and logo in both formats. Act E isn't causing it. My earlier stills of this act, rendered before that edit, are clean. The page also now prints `DBG` lines that come from act-a.

| # | Status | What changed |
|---|---|---|
| 1 | partly | Circle iris removed. The recording screen fades in over 38.0–38.5. Live label, timer, waveform, desc and buttons come in 0.05 s apart. "Opnemen." waits until the trust card is fully gone (38.28) and rises in 0.22 s, so text never overlaps. At 30 fps the frame-to-frame change now peaks around 10, down from about 19, with no single-frame jump. Not fully fixed: because `trust.out` is 37.8, word 1 can only land at 38.5. |
| 2 | fixed | Reverse iris removed. The whole phone screen (dark background, status bar, island) fades to 0 over 40.5–40.9, after the recording UI has moved away. The bars sit in a layer above it, so nothing dark ever passes over them. |
| 3 | fixed | Shadow and side buttons fade by 40.9. The bezel becomes a ring, and its straight segments shrink into the four corners over 40.9–41.2. Each corner then crossfades to a green bracket over 41.02–41.26 (opacity crossfade, not a colour tween). No black pieces remain after 41.26 and there is no dark-green mid-tone. |
| 4 | fixed | All four corners follow one path, mirrored per corner, so they form a rectangle in every frame. A 3° turn of the whole group is back to 0 by 42.4. |
| 5 | fixed | Two stages. 41.0–41.5: the 36 bars split 7/7/8/7/7 in x order (no crossing). Each group becomes a comb of equal-width bars whose outline is the exact shape of its logo bar. 41.5–41.9: the combs close up and the solid logo bars fade in underneath; at the end the shapes match exactly, with nothing partly overlapping. |
| 6 | fixed | The snap runs 42.70 → 43.00 exactly. Then one settle, group scale 1.04 → 1.00 over 43.00–43.35, with nothing else moving. The open frame keeps creeping closed from 41.9, so there is no dead hold before the snap. |
| 7 | fixed | The wordmark moves as one piece with the logo and appears through a hard-edged wipe from left to right: "G" first, i-dot together with its "i". The mark locks at frame centre, which covers the G's final position, so a fully static wordmark could not show the G first. I chose this over "static at final position" for that reason. |
| 8 | fixed | Drift is now linear, 1.000 → 1.015 over 44–48. The logo is never scaled through CSS, and the end-card text has its own layer, so nothing toggles at 44.3. Measured at 30 fps from 44.2 to 44.4: change is steady (about 0.7 % of pixels per frame) with no spike. |
| 9 | partly | The 16:9 block is 1.25× larger and centred on y 540: logo 812 px wide, slogan 70, offer 48, griffel.ai 51 px extra-bold ink, badges 70 px tall, fine print 28. Still too small: the fine print is about 5 px tall at a 360 px wide phone view. The badges are larger than the storyboard's "about 56 px"; I followed the critic, and they stay unmodified at equal height. |
| 10 | fixed | The three-word block is centred on y 540 (top 391). The phone holds near x 1075 while the words are up and moves to 960 over 40.3–40.9 as they leave. |
| 11 | fixed | In 4:5 the camera starts moving up at 40.55 (1.0 s), so the logo assembles near frame centre (540, 648). |
| 12 | partly | Each word now starts rising 0.3 s before its beat and is about 93 % up on the beat. With the current trust timing the stack lands at 38.5 / 39.0 / 39.5, one beat later than the storyboard. Changing `trust.out` (below) brings it back to 38.0 / 38.5 / 39.0 with no code change. |
| 13 | fixed | During the end card the stage's hero rings fade to about 0.3 opacity behind the poster block (both formats). |

**Recommended `timeline.js` change:** move `T.O.trust.out` from 37.8 to 37.3 (anything up to 37.45 works). The trust card is then gone by about 37.8 and the outro words land on 38.0 / 38.5 / 39.0 as the storyboard says.

**Other known issues:**
- **Leaks into the shared phone and stage:** act-e changes the shared phone's styles at runtime (screen/frame opacity, a clip shape on the frame, shadow and buttons) from 40.5 on, and puts them back for earlier times. It also dims stage.js's rings during the end card. No other part's file was edited.
- **Seek order:** frames of a moving phone can differ slightly depending on the order they are rendered in, up to about 44 levels along edges at 40.7. Act D shows the same thing at 34.2, even larger, so it comes from Chrome's rendering rather than this act. I found and fixed one real cause of this in act E (the end-card gradient wasn't reset before 38.0).
- **Console error:** every render prints a 404 "Failed to load resource". It looks like the browser asking for a missing favicon; it doesn't come from act-e.

Files are in the project root:
- `src\parts\act-e.js`
- `renders\stills\e2-169-final\sheet.png`
- `renders\stills\e2-45-final\sheet.png` (both final sheets were rendered after the act-a leak, so the hook line shows in them)
- `renders\stills\e2-169-a`, `-b`, `-c`, `-x`
- `renders\stills\e2-45-a`, `-b`, `-c`
- `renders\stills\e2-hand`, `e2-snap`, `e2-169-d30` (30 fps checks)

