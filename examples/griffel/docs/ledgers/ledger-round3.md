# Round 3 triage summary

All three critics say 'one more pass' (overall 7/6/7). The lowest sub-score is camera at 5; hook, pacing, handoffs, layering, polish and phone-size readability sit at 6.
Most round 2 fixes held: the thesis hold, the hero payoff row, the clean covers, whole-block exits, the i-dot, Thomas renamed, cv08 and the e-mail strings. The open faults cluster at the hook (0-3.3), the drop caption (22.0-22.9), the inbox half of the payoff (32.6-35) and a slow back fifth with a D->E camera hitch (36.3-43).
Foundation runs first. One timeline retime: hook marker at 0.7, a 'Griffel vraagt daarna door.' ch1 sub, a slower dark, a closer 4:5 AB framing, the climax at 22.7, the inbox sub to 35.0, trust 35.3-37.4, DE moved right, collapse from 39.5 and the poster complete at about 43.75. Plus a colour-managed, dithered final encode.
The acts then read T. Act D gets a single D->E key and a continuous camera, and readable inbox rows that keep Lisa's action. Act C grows the drop caption before the thesis and holds the camera for the send tap. Act E draws brand-green bars with no mint-on-white 'new recording'. Act A gets a thin-bar morph and the whisper under the line in 4:5.
Skipped: the A/B restructure that pulls 'Doorvragen.' to 11 s (the drop is fixed at 22.0; too risky for the last pass), the parallax and cover rewrites, the 4:5 naming push (contradicted by the measured camera), and anything that would fake the inbox preheader.

min score: 5

## Skipped

- Critic 1 sev1 restructure: compress 'Opnemen.' and 'Echte namen.' to about 3.5 s each, pull 'Doorvragen.' forward to 11-12 s, and add an answer line ('Griffel vraagt het na.') in the hook at 1.6-2.0. -- The drop is fixed at 22.0 on the music grid, so starting 'Doorvragen.' earlier only stretches the wait before the drop. Retiming acts A and B cascades through every tap, push and hand-off, which is a risky rewrite for the last pass, and round 2 rejected the same change. The hook is already crowded at 1.6-2.0 with the morph, and the line would pre-empt the climax 'Griffel vraagt.' The concern is partly met by the foundation ch1 promise line, the earlier hook marker and the act-a hook item.
- Critic 1 sev2 (4:5) 12.4-15.3: push to about z 1.25 on the Spreker 1 card; also the critic 3 verification that the typed 'Lisa' is about 5 px. -- Contradicted by critic 2's per-frame camera dump: 4:5 already holds z 1.22-1.25 from 10.9 to 15.8, and the card, field and caption are legible at 360 px. Critic 3 also confirms the push. More zoom would add camera moves, and camera is the lowest score.
- Critic 3 sev3 (4:5) 12.0-16.3: inverted hierarchy; set the name-flip caption at or below the 'Geen Spreker 1.' sub size, or let the sub leave. -- Conflicts with critic 1, who wants the flip caption larger. The flip is act B's signature and the readable carrier of F3, so readability wins. The sub carries the F3 claim, so it stays.
- Critic 2 sev3 global: give the stage 15-25% of the camera motion as parallax, add tilt and shadow offset, and replace every UI swap with 0.25 s slide covers. -- Stage parallax already exists (stage.js DEPTH 0.06, round 2). Raising it would shift framings other acts have measured (act D clips, act E lock, act B x>1000 checks). Round 2 rejected tilt for readability. Critics 1 and 3 confirm the covers are clean, and reworking every swap across four acts is a broad rewrite for the last pass.
- Critic 3 sev3 (16:9): raise the VOORBEELD label from 30 px to 38-40 px. -- 4:5 is the mobile-feed deliverable, and its label passes (7.56:1, about 9 px at 360). 16:9 targets desktop and YouTube, where 30 px is legible. The storyboard fixes 30 px.
- Critic 1 sev3 signature 1: colour the flying bars #09FE94 from the start of the flight. -- #09FE94 on the light stage is about 1.35:1 (critic 3 flags the same colour on white in act E), and the storyboard rule is ink outside the phone, mint inside. The rest of that note (no squeezed glyphs or slabs) is kept in act-a.
- Critic 1 sev2 inbox: land Lisa's row LAST. -- This contradicts the shipped design, in which the hero line flies into Lisa's row on the first tick (confirmed as the right order by critics 1 and 3). Her row is made the largest and highlighted instead, which meets the same intent.
- Critic 3 sev2/sev3 inbox: show the action as Lisa's preview line instead of the real preheader. -- The real preheader is fixed (summary-email.tsx), so replacing it would fake the inbox row, against the truth rule. Instead, the e-mail's own ACTIES row 1 docks under the real subject and preheader (act-d inbox item).
- Critic 1 sev2 act E: make the recap a single beat. -- The three words stay on the 120 BPM beats (round 2 decision). The slowness is fixed instead by starting the collapse under the stack, cutting the mint-on-white waveform and pulling the poster in (foundation T.E and act-e items).
- Critic 1 and critic 2 verification: act A frozen stretches 7.9-9.6 in 16:9. -- Partly met by foundation's closer 4:5 AB push. In 16:9 the creep, the hold-to-stop fill and caption 3 carry the stretch, and round 2 already kept the hold-stop timing for the drop callback. No further change.

# foundation

All nine notes are fixed, in both formats. One deviation is deliberate: note 3's suggested dark values (2.45 / 1.6 s) could not meet its own 0.9 s target, so I used a longer ramp and moved "Opnemen." to 3.4, as the note allows. The final render itself has not been run; the new pipeline was tested end to end on 1 fps runs of the real pages in both formats. No git, no installs.

| Note | Status | What changed |
|---|---|---|
| 1 · brand promise from about 4 s (sev 1) | fixed | <ul><li>copy.js: `ch1.sub` gets "Griffel vraagt daarna door.".</li><li>`T.O.ch1.sub` is now `[3.7, 4.0]` (note 3 shifted it from `[3.5, 3.8]`); `subOut` stays 6.0.</li><li>overlay-text.js: new block `ch1s1` at sub size, one line under the instruction, weight 600, white on the dark stage.</li><li>In 4:5 both lines end at about y 305, clear of the caption box (y 372). Both read at 360 px wide.</li></ul> |
| 2 · hook scroll-stop | fixed | <ul><li>`T.A.hook` set as the note asked: karaoke `[0.05, 0.7]`, highlight `[0.7, 0.45]`, whisper 0.7; morph and phone entry unchanged.</li><li>The marker sweep now lands before 1.0, and "En wanneer is dat?" reads from about 0.9 to 2.35. Act A picks this up with no edits.</li></ul> |
| 3 · light-to-dark flash | fixed, with different values | <ul><li>`T.dark` is now `{inStart 2.0, inDur 3.4, spread 0.3}`. The way back keeps its old behaviour (`spreadOut 0.5`).</li><li>stage.js reads both spreads from `T.dark`; the in and out moves never overlap.</li><li>Why not 2.45 / 1.6: it measured only 0.45 s of visible change (2 % to 98 % stage darkness).</li><li>Visible change is now 1.0 s in 16:9 and 0.93 s in 4:5. The largest 60 fps frame diff is 6 (it was 19.7).</li><li>Next to the phone the stage is under 10 % dark at 2.975, and the hook bars in flight sit on a light stage.</li><li>"Opnemen." moved to 3.4, where the text column is 0.90 / 0.92 dark (16:9 / 4:5).</li><li>The bright ring is gone; the phone sits in a soft, wide vignette instead.</li></ul> |
| 4 · 4:5 phone too small in the dark act | fixed | <ul><li>`T.handoff.AB['45']` is now `f45(196.5, 0, 540, 445, 1.15)`, which is `{0, -226, 1.15}`.</li><li>The bezel top stays at y 429 or lower on screen, below the caption box (ends about 411).</li><li>The stop button, hold dot and "Houd ingedrukt om te stoppen" stay in frame; their lowest point is about y 1272.</li><li>Zoom only rises from 3.0 to 16.3 (1.15, then 1.22, then 1.25 at the BC hand-off).</li></ul> |
| 5 · climax hides the "12 december" picture | fixed | `T.O.climax` is now a 22.7, b 22.95, out 25.2. It is gone by 25.45, before the context card at 25.5. The text column is empty from 22.08 to 22.7. |
| 6 · payoff line too small and too short | fixed | <ul><li>`ch3.sub` is now `[32.8, 32.95]` with `subOut` 35.0.</li><li>Trust: 35.3 / 35.65, out 37.4, gone 37.65.</li><li>`T.D.wipe` is now `[35.7, 36.05, 36.4]`.</li><li>The sub is a weight-700 statement at 62 px in 16:9 and 72 px in 4:5, the largest sizes that keep each line on one line. The sizes are fixed numbers, so the layout never depends on when the font finished loading.</li><li>It stays clear of act D's inbox rows and reads at phone size.</li></ul> |
| 7 · 16:9 phone inside the text column at 38.0 | fixed, cx differs from the note | <ul><li>`DE['169']` is now cx -255. At the suggested -230 the left bezel lands at x 978, short of the 1000 the note asked for; at -255 it lands at 1001.8.</li><li>Act D's hand-off is now one smooth move (bezel from 1242 to 1002 over 36.9–38.0), so the 37.7 hitch is gone.</li><li>"Doorvragen." has about 200 px of air. The 4:5 framing is unchanged.</li></ul> |
| 8 · empty back fifth | fixed | `T.E`: collapse `[39.5, 2.5]`, wordmark `[42.0, 0.55]`, endCard 42.45, endLines `[42.55, 42.8, 43.0, 43.2, 43.4]`. Act E follows, and the poster is complete at about 43.75 in both formats. |
| 9 · encode colour, banding and blur | fixed (pipeline-tested; full final not yet rendered) | <ul><li>`encode_seq.py`: 16-bit blur, explicit BT.709 matrix, limited range, error-diffusion dither, tagged output. It also fixed a 0.9-level darkening I found in the 8-to-16-bit conversion step (white came out as 254).</li><li>New check: `tools/check_encode.py` decodes with BT.709 and tests the end-card mark (±2), white (±1) and gradient banding against a source still.</li><li>`render.sh`: the default final is 60 fps with 8 subframes. HyperFrames captures at most 240 fps, so it renders two passes, the second offset by 1/480 s through a new `window.T_OFFSET` in film.js (on a generated page copy), and interleaves them (new `tools/interleave_seq.py`). `FINAL_FPS=30 SUB=8` gives a single pass at 30 fps. Drafts now use the same encoder.</li><li>Results on the 1 fps two-pass test renders: mark (27, 186, 109), white 255, banding 0.78–0.82 against 3.7–4.2 in the old drafts (limit 1.0). The blurred frames match the average of the offset stills, and the old banding step at y 464 is gone.</li><li>Fixed along the way: a few frames come out of HyperFrames as RGBA instead of RGB (4:5 around 29–30 s). That made ffmpeg silently drop frames (a 48-frame test came out as 29). `encode_seq.py` now makes all frames the same format first and fails if the output frame count is wrong.</li></ul> |

The storyboard is updated: the Act A, C, D and E rows, the AB and DE hand-offs, stage darkness, the overlay table and a new render/colour-check section.

**Still to do by other owners:**
- **Act A:** in 4:5, from 5.35 to 6.25 the older caption moves up to about y 330. That is roughly 25 px under the new "Griffel vraagt daarna door." line, so it reads like a third sub line. Please delay that move until the subs have left (6.25), or keep the caption at y 340 or lower.
- **Acts C and D (stills only):** seeking backwards leaves screens showing on top of the wrong scene. Act C's Q1/Q2 question cards and act D's "Notulen onderweg" sheet set `visibility: "visible"` inside containers that are later hidden. For example, a still at 3.25 taken after 22.5 shows the Q2 screen over the recording screen (mean pixel difference 28). The renders seek forward only, so the film is not affected. The fix is to use `"inherit"` instead of `"visible"`.
- **Final render:** run `bash tools/render.sh 169 final` and `bash tools/render.sh 45 final`. Expect about 35–40 minutes and about 4 GB of temporary space per format. Then run `python tools/check_encode.py renders/film-<fmt>-final.mp4 --ref-dir renders/fix3/fnd-enc-ref-<fmt>`.

Files are in the project root:
- Edited: `src\timeline.js`, `src\copy.js`, `src\film.js`, `src\parts\stage.js`, `src\parts\overlay-text.js`, `tools\encode_seq.py`, `tools\render.sh`, `docs\storyboard.md`
- New: `tools\check_encode.py`, `tools\interleave_seq.py`
- Stills: `renders\fix3\foundation-169\sheet.png` and `renders\fix3\foundation-45\sheet.png`, plus the detail folders `foundation-169-climax`, `foundation-45-climax`, `foundation-169-d`, `foundation-45-d`, `foundation-169-e`, `foundation-45-e`, `foundation-45-ab`, `foundation-45-small`, `foundation-45-subcap`
- Encode tests: `renders\fix3\fnd-pipetest-169.mp4`, `renders\fix3\fnd-pipetest-45.mp4`
- Pre-fix copies of the edited files: `<scratchpad>\fix3-foundation-before\`

# act-a

| Note | Status | What changed (`src/parts/act-a.js` only) |
|---|---|---|
| 1. Hook framing, and the whisper position in 4:5 | **Fixed** | 4:5 now uses the same layout as 16:9: tag above, the hook lines, then the whisper under the line, left-aligned at x 84 like the line. I moved the 4:5 group up a little: the line block starts at 470 instead of 540, and the group runs from about 420 to 745. Instead of a fixed exit time, the whisper's exit is worked out from the phone motion and the camera, so it is gone before the phone's top edge reaches it. It is gone by 2.27; the phone top reaches its bottom edge at about 2.30, with a 12 px margin. 16:9 is unchanged: gone by 2.5. A new "SPREKER 3" tag sits above the hook in both formats. It takes the speaker name from caption 3 in `copy.js`, in the caption style (600, uppercase, 0.12em tracking, #6B7280), at 28 px in 16:9 and 26 px in 4:5. It is on screen from frame 0 and fades and blurs out (≤4 px) with the first words that fold. All times come from `T.A.hook`. I checked the file against foundation's new times (karaoke ends 0.7, marker and whisper at 0.7), which are now live in `timeline.js`: the whisper is up from about 0.9. |
| 2. Ink slabs and clusters in signature move 1 | **Fixed** | The solid word blocks are gone. Each word's glyphs fade and blur out (≤4 px, house curve, 0.2 s). Its bars appear as separate 4 px rounded bars with the gaps open, spread evenly over the word, and only then grow to their live waveform heights. Measured: when a bar passes half its height, glyph opacity is 0.09 (the limit is 0.3). No type is scaled. All bars now move on one shared clock and are ordered by their own x position across both lines, so the row only contracts and no bar passes another. A short evening-out step removes the bar pairs where the two lines interleave. Measured gap spread: about 0 from 2.30–2.35 to landing in both formats. Bars are ink outside the phone (the key word's bars carry its green only while faint) and mint inside. Every bar lands by 2.975, no world bar is visible from 2.98, and no bar overlaps the phone outline except the clipped dock. |
| Extra: the same frame no matter the seek order | Fixed | The hook's styles are now set on every frame, even while it is hidden, so the page state at a given time no longer depends on which times were rendered before. Checked at 0.8, 2.12, 2.3, 2.6 and 2.9 in both formats. |

Stills for both formats are in `renders\fix3\act-a-169\sheet.png` and `renders\fix3\act-a-45\sheet.png` (0 to 4.6, including the 2.975 landing and the darkening). I also checked the hand-off and the new 4:5 AB camera framing (z 1.15) in `renders\fix3\act-a-169-late\sheet.png` and `renders\fix3\act-a-45-late\sheet.png` (3.0 to 10.4): the captions stay clear of the phone. Phone-size frames are in `renders\fix3\act-a-169-phone\` and `renders\fix3\act-a-45-phone\`.

**For other owners:**
- **Docs owner:** the Act A rows in `docs/storyboard.md` still describe the old move ("collapses horizontally into a bar (scaleX…)", "whisper line below" at 1.3, "words become bars at 2.0–3.4"). They should describe thin bars with the gaps open, no scaleX, and the "SPREKER 3" tag at frame 0.
- **Foundation:** a comment in `timeline.js` says "reads from ~0.9 to 2.35". In 4:5 the whisper is now gone by about 2.27 because of the phone. No time change is needed, just the comment.
- **Not mine, passing on:** for a few minutes, while `T.O.ch1.sub` became an array, "Leg je telefoon op tafel." showed from frame 0 and sat on top of the hook in 16:9. After `overlay-text.js` was updated at 22:34 it no longer showed, and my final stills are clean. Earlier test runs also hit errors in act-d (`FACE is not defined`) and act-e (`MINT is not defined`) while those files were being edited. They were gone on later runs.

# act-b

| Note | Status | What changed (only `src/parts/act-b.js`) |
|---|---|---|
| **Sev 2, A→B morph (9.95–10.65, both formats)** | **Fixed** | **Bars:** each bar now flies in two legs on the house curve. First it moves left along the waveform's own line (y 430, the gap between the Uploaden and Transcriberen rows) into the status-dot column. Then it moves up or down inside that column (x ≤ ~70, left of every label) to its dot or connector. Flights run 9.82–10.43, 4.5 ms stagger, 0.45 s each. Every bar has landed by 10.43 and has faded into its dot by 10.54. The card frame now unfolds only after the landing, at 10.37. I checked every 5 ms from 9.8 to 10.8 in both formats: no bar overlaps a step label that is drawn. There is no sagging chain any more: the line pulls into the column and the column fills.<br>**Light:** the stage front now uses the same edge as the screen (EDGE × zoom, same smoothstep, same height), so the stage at any height is lit together with the screen beside it. The tilt is now -2°, so the left side leads. The screen's lowest visible edge is lit at 9.95, and nothing is lit at 9.8, so there is no pop.<br>• 16:9: the screen is white, status bar included, at 10.36. The top-left corner of the stage is white at 10.34, so the stage does not lag the screen.<br>• 4:5 (with foundation's new AB `f45(…,445,1.15)`): the screen is white at 10.31 and the frame's top-left at 10.39, a lag of 0.08 s. The frame is about 35 % lit at 10.1, about 55 % at 10.2 and about 90 % at 10.3. At 9.95–10.05 it is still mostly dark, because the light only starts there, as asked.<br>**Status bar:** the dark-screen window now ends when the white passes the status bar (10.35 in 16:9, 10.3 in 4:5). The dark strip fades around that flip, so the status text keeps its contrast.<br>**Stage light hand-back:** the stage light hands back to stage.js once the whole frame is lit and T.dark is done, so after 10.6, fading out over 0.3 s. |
| **Sev 3, 16:9 name-flip caption (13.0–16.3)** | **Fixed** | 16:9 now uses the same one-line layout as 4:5 ("Spreker 1 · Die pakken we wel op." plus the small waveform) at 44 px. It sits in `L.captions` at x 170–909 and y ≈ 648–703. The phone's bezel is at x 1035. The strike-and-replace still runs at 15.3 with unchanged timing, and the caption still leaves with "Echte namen." at 16.3. 4:5 is unchanged. |

**Notes for other owners:**
- **stage.js / overlay-text.js owners:** for t in [9.8, ~10.6), the time act B's light covers the stage, act B now wraps `Film.stageDark` and answers from its own light front, which is what is actually drawn. Outside that window it calls stage.js's original function. Without this, the 4:5 VOORBEELD label turned #4B5563 on black at 10.1–10.4, and "Opnemen." turned grey on black at 10.05–10.1. If stage.js redefines `Film.stageDark` after mount, keep that window in mind.
- **phone.js owner (minor):** in 4:5 only, seek order changes a few anti-aliased pixels in the status-bar signal and wifi icons (PSNR about 43 dB). It shows even at 15.5, where act B changes nothing in the status bar. 16:9 frames are identical whatever the seek order.
- During this round I briefly saw "act-d mount failed: FACE is not defined" while act D was being edited. The latest render no longer shows it.

Stills are in `renders\fix3\act-b-169\sheet.png` and `renders\fix3\act-b-45\sheet.png`, covering 9.7–10.9 and 13.3–16.45. The before stills are in `renders\fix3\act-b-169-before` and `renders\fix3\act-b-45-before`.

# act-c

Act C ledger, fix round 3. I only edited `src\parts\act-c.js`. All four notes are fixed in both formats, with one exception: the 16:9 caption can't reach 18 px at 360 px wide (see note 1). Everything still runs on the house curve, Inter only, and all times come from T. The thesis now rises at `T.O.climax.a` = 22.7, and the caption settles from that time.

| Note | Status | What changed |
|---|---|---|
| **Sev 2 · 21.0–22.9 · caption too small** | Fixed (16:9 partly: under 18 px at 360 wide) | The returning caption grows from 21.95 (`T.O.ch2.out`) over 0.4 s, anchored at its bottom-left, up into the empty text box. 16:9 goes from 38 to **64 px** (about 12 px at 360 wide). 4:5 goes from 32 to **58 px** (about 19 px at 360 wide). The strike, the chip landing and the resolved "…dan houden we 12 december aan." all happen at the big size, between 22.12 and 22.6. From `T.O.climax.a` (22.7) it shrinks back to caption size over 0.5 s and dims to 50 %. The new layouts are: 16:9 in three lines (tag / "…dan houden we" / "de Q4-deadline" / "aan."), bottom at y 840; 4:5 in two lines ("SPREKER 3 · …dan houden we" / "de Q4-deadline aan."), bottom at y 416. To make room, I moved the 4:5 phone 20 px lower (key at 20.3) and 12 px lower (key at 22.55). Measured clearances: the caption stays about 16–30 px above the 4:5 phone frame, never touches the thesis, and stays about 250 px clear of the phone in 16:9. A guard shrinks the caption automatically if `climax.b` ever arrives before it has settled. |
| **Sev 2 · 25.35–27.95 · tail camera bump** | Fixed | Removed the push-in and pull-back pair (16:9 keys at 25.35 and 25.9) and the 4:5 key at 25.6 (z 1.12). In their place is one glide down to the context row, the recipients and the send button: 16:9 25.3 → 27.0 (z 1.62); 4:5 25.7 → 26.95 (z **1.32**, which is ≥ 1.25). The camera is fully still from about 27.0 to 27.28, so the 27.2 tap lands on a still frame, with the button in frame at y 752 (16:9) and y 1289 (4:5). The move to rest starts at `C.tapSend + 0.08` (27.28) and lands at 28.0. Peak speed of the phone points is **25.9 px/f** in 16:9 and **16.9 px/f** in 4:5, at 60 fps. There is no dead stop between keys. |
| **Sev 3 · 22.25–22.8 · chip route and missing spaces** | Fixed | The chip lifts at 22.10. It slides left along the option row, leaves the phone past its screen edge (drawn over the bezel), then:<br>• **16:9:** drops beside the phone, to the right of line 1, and slides left into the slot, which now ends its own line.<br>• **4:5:** climbs the left margin past the phone's top-left corner and comes up into the slot from below.<br>It lands at 22.58 / 22.60. I checked every 1/120 s against the visible app text, icons, island, status bar and the caption's own words: **0 hits** in both formats. The struck old words stay until the chip is 70 % of the way there (`CAP.gap`), and only then does the slot open. In 4:5 the slot reserves the new words' width plus 0.1 em, so the result reads "12 december aan." with a normal space. In 16:9 the old word breaks fall at line ends, so there are no spaces to lose. I also removed the 1.05 overshoot that had covered the spaces. |
| **Sev 3 · 22.0–22.6 · drop punch** | Fixed | The punch is now +4 % with a 0.16 s house attack: 16:9 goes from 2.2 to **2.288**, 4:5 from 1.8 to **1.872** (about (84, 120), so the phone top only rises about 9 px). The pull-back keys to 2.25 and 1.78 are gone. The framing holds until the 22.55 descent key takes over. |

I re-checked everything after the last edit. The caption is still a pure function of t: replaying the same times in a different seek order gives identical styles, apart from the chip element while it is hidden. Stills of the drop, the tail and both hand-offs (16.2–16.6 and 27.6–28.3) are clean in both formats. One render at 28.5 failed with `act-d … SAFE is not defined`; that was act D half-edited by its owner, and it rendered fine on the next pass.

Stills are in `renders/fix3/`:
- **Drop window:** `act-c-169`, `act-c-45`
- **Tail:** `act-c-169-tail`, `act-c-45-tail`
- **Early act C:** `act-c-169-early`, `act-c-45-early`
- **360-px feed-size check:** `act-c-169-small`, `act-c-45-small`

**For other owners:**
- **Storyboard (act C rows):** the 22.0 row still says "+4 % that settles over 0.6 s"; it should now read "0.16 s attack, then hold". The 23.8–28.0 row should describe the glide to the recipients and the move to rest starting at 27.3.
- **The 18 px at 360 px wide target can't be met in 16:9:** it would need a 96 px caption, and its first line would then run into the phone at x ≈ 941. 64 px is the safe maximum next to the zoomed phone.
- **Timeline owner:** my timing depends on `T.O.climax` = {a: 22.7, b: 22.95}. If those change, the caption settles at the new `climax.a`, and the guard keeps it clear of the second line.

# act-d

All four notes are fixed in both formats; the only file I edited is `src\parts\act-d.js`. When I started, `act-d.js` was half-rewritten and crashed every frame from 30.1 onward (`dFaceIn is not defined` and five other undefined names). I finished that rewrite rather than starting again.

Checked with stills in both formats, a 60 fps speed probe, and a seek-order check. Every act D element now moves at 25 px per frame or less in both formats, and both hand-offs into and out of the act are in the stills.

| Note | Status | What changed |
|---|---|---|
| sev1, 36.4–38.0, D→E hitch | fixed | One camera key onto `Film.handoff("DE")` from 36.4 to 38.0; the two-key split is gone. It flows out of the still-moving trust drift and only slows at the landing. Peak is 14.7 px/f (16:9) and 10.1 px/f (4:5). It lands exactly on DE with the phone at its base. The phone never crosses the trust lines: in 16:9 its left edge stays at x 1001.8 or more (the lines end around 911); in 4:5 its top stays at y 430 or lower (the lines end around 224). |
| sev2, 32.6–35.3, inbox barely registers | fixed | **Size:** 4:5 rows are 882 px wide (82 % of the frame) with subject and preheader at 34–36 px. 16:9 rows are about 640 px wide with every line at 28 px or more, 45 px from the bezel and below the ch3 sub. Every row shows the real subject and preheader. Lisa's row is the tallest and has a green ring. <br>**Payoff line:** left-aligned, verbatim, with the "·", breaking after the dot, markers kept, in both the large line and the docked row. Lisa's card now forms around the line and shrinks with it into her slot, so nothing crosses the moving text. It docks under her subject and preheader with the number badge, and stays until the rows leave with the sub at 35.0. <br>**E-mail and Daan's row:** the e-mail body fades to 0 by 32.9; Daan's row text starts at 33.15. Sanne's text appears only once her row clears Daan's. |
| sev2, 31.9–37.0, camera yo-yo | fixed | No zoom-out followed by a push-in: the zoom eases out for the fan-out and then pushes in 5 % (16:9) or 6 % (4:5) into the trust framing, with no stop. The hold creep now starts at 31.0 and runs to 33.8, so 31.9–32.45 moves at 0.46–1.47 px/f instead of freezing. The trust frame is the "Verstuurd" screen plus chips beside the top of the phone, with chip text at 37 px (16:9) and 42 px (4:5). It uses the retimed sub-out 35.0, trust 35.3/35.65/37.4 and wipe 35.7/36.05/36.4. |
| sev3, 28.45–28.55, white dip | fixed | The e-mail is opaque and complete from its first frame. It rises out of the empty white area below the steps card and grows up over the "Notulen onderweg" screen, with no cross-fade. |

Two timing changes made to keep within 25 px/f:
- **Lift:** the large line is 66 px in 16:9, down from 70. The lift runs the full 1.0 s to 31.1, and the markers still finish by 31.0.
- **Dock:** the line moves into Lisa's row over 1.3 s, docking at 33.9. Her sender, subject and preheader come in from about 33.4.

For the other owners:
- **Act C:** its camera return to rest peaks at about 47 px/f around 27.5, just before act D's first camera key at 28.0. Worth a look if 25 px/f applies there.
- **`overlay-text.js`:** a hidden card keeps whatever colour it last had, so the DOM differs depending on seek order. It never shows on screen.
- **`tools/still.mjs`:** with some time lists the contact sheet drops the first frames (my 4:5 sheet starts at 30.10). The individual PNGs are all written.

Nothing in `timeline.js` needs to change.

Files are in the project root:
- `src\parts\act-d.js`
- `renders\fix3\act-d-169\sheet.png`
- `renders\fix3\act-d-45\sheet.png`
- `renders\fix3\act-d-169-dock\sheet.png`
- `renders\fix3\act-d-45-dock\sheet.png`
- `renders\fix3\act-d-crops\phone.png` (feed-size check)

# act-e

Act E ledger. The only file I changed is `src/parts/act-e.js`. All three notes are fixed except one part of note 3: the fine print stays #4B5563, not #6B7280. I checked every fix with stills against foundation's live timeline (collapse [39.5, 2.5], DE 16:9 `{-255, 0, 0.94}`, wordmark [42.0, 0.55], endCard 42.45, endLines from 42.55), in both formats, including the D→E hand-off from 37.25 s and the poster to 48.0 s.

| Note | Status | What changed |
|---|---|---|
| 1. Opening reads as a recorder: #09FE94 bars on a white screen, near-still at 39.2–39.7 (both formats) | fixed | **Bar colour:** the 36 bars are #1ABA6D from their first frame. #09FE94 is never drawn, and the mint→green colour step and the screen clip are gone. **Dissolve:** it now starts at the collapse time (39.5): status bar, island, shadow and buttons fade over 39.5–39.95, under the stack. The collapse phases are worked out from the collapse start and the lock, and stretch 1.25× with the longer window. **16:9 camera:** one move from the DE framing, starting at 38.4 and running 2.6 s. It is a push-in that keeps the phone's left edge at x 1002, so the phone stays outside the 950 px text column ("Doorvragen." ends at 716). The bars and brackets travel left to the lock point (960, 518) as they gather. **4:5 camera:** a push-in that keeps the phone's top at y 419, about 56 px below the words, which end at about 363. The lock point is (540, 760). **Measured motion, 39.2–39.7:** the phone's edges move about 2–3 px per frame at 30 fps, plus the dissolve. **Slogan:** it rises on `T.E.endLines[0]` (42.55), when the slide is about 98 % done. |
| 2. Brackets dead still 41.45–41.83, land 2 frames early, settle not visible (both formats) | fixed | **Approach and snap:** the fly runs 40.19–41.5 and overlaps one closing move over 41.0–42.0. It starts slow (about 2 px per frame at 41.4) and speeds up into the snap. It is the first 32 % of one house curve, so it lands at full speed on exactly 42.0; the 41.90–42.10 frames confirm this. **Settle:** the rest of that same curve is a 4 % shrink of the whole mark over 42.0–42.3. **Slide:** it starts out of the settle at 42.1 and ends at 42.65. Slowest point anywhere in 41.0–42.2 is 1.1 px per frame (at 42.1), so nothing stands still. |
| 3. 4:5 poster: offer is the weakest line, group uses only the middle half | partly (colour) | **Scale:** the poster group is scaled 1.2× about y 675. The logo goes to `Kfin` 2.22 with `finY` 429. Offer 46 px, badges 86 px high (still unmodified and equal height), fine print 36 px. The slogan is 66 px (1.14×) so it keeps at least 79 px side margins through the drift. **Offer:** ink at weight 600; "griffel.ai" stays at 800. **Fine print: not #6B7280.** On the strengthened end-card gradient at 48.0 it measures only about 3.9:1, below the 4.5:1 floor, so I kept #4B5563 (about 6.2:1). Text stays readable in the phone-size still (`--scale 0.333`). 16:9 poster unchanged. |

Things other owners still need to do:
- **Foundation / storyboard:** the act E rows in `docs/storyboard.md` are out of date. They still say:
  - collapse [40.0, 2.0], endCard 42.8 and endLines from 43.0;
  - fine print #6B7280 (the code now uses #4B5563);
  - nothing about the 4:5 poster being scaled 1.2×.

  The new timings are: dissolve from 39.5, closing move 41.0–42.0, settle 42.0–42.3, slide 42.1–42.65.
- **Seek order (film-wide, not from these changes):** the same time can render with slightly different pixels depending on the order frames are seeked. It also happens at t=25 in act C. The page state (positions, opacities) is identical in both orders, so it looks like a Chrome rendering cache effect. The final render goes frame by frame in order, so it should not affect it.
- I also kept the 4:5 slide to a peak about 37 px per frame at 60 fps. That needed the higher 4:5 lock point (y 760), because the bigger poster makes the slide longer.

Stills are in `renders\fix3\`:
- `act-e-169\sheet.png`, `act-e-45\sheet.png` (37.25–44.0)
- `act-e-169-handoff\`
- `act-e-169-lock\lock_sheet.png`
- `act-e-169-poster\`, `act-e-45-poster\`
- `act-e-45-small\` (phone-size)
- before: `act-e-169-base\`, `act-e-45-base\`

