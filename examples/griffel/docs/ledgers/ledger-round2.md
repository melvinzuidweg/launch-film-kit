# Round 2 triage summary

The film is close but not done: all three critics say 'one more pass' (overall 6). Copy and tone (9), UI fidelity (8) and facts (8) are solid. The three moments that sell the film fail at feed size: the drop at 22.0, the payoff at 30-32 and the end-card hold.
The one message never lands as one image. '12 december' and the action row are about 5 px at feed width. The thesis gets about 1.1 s. 'Doorvragen.' is spent on speaker naming, and the e-mail payoff and the inbox rows are two unrelated pictures.
Motion has visible craft faults: cross-dissolved screen changes (10.5, 12.5, 15.45, 23.6, 27.6, 38.2, 40.65), a camera that yo-yos at act boundaries with stop-start keys, a 6000 px/s fan-out whip, a hard circle iris at 3.2, squashed type at 2.1, and frozen holds.
Brand and truth: the e-mail logo is missing its i-dot, the VOORBEELD label is too small and leaves early, the MP4 shifts the brand colours, the e-mail intro and inbox subject are not verbatim, 'Bijvoorbeeld: Thomas' reads as a name suggestion, and I/l is ambiguous in 'AI' and 'Iets'.
Plan: foundation retimes first (climax 22.05-25.25, a 2 s footnote context card, a naming card plus a fresh 'Doorvragen.', 'Notulen.' out at 30.1, T.E pulled forward for a 3.8 s poster, handoff framings). Then the acts rebuild the drop (the caption resolves to 12 december), the payoff (a hero line that flies into Lisa's inbox row) and the outro (no reprise).

## Skipped

- Critic 3 creative note 1: at 30.2, bring the hook line back and replace 'we' → 'Lisa' and 'de Q4-deadline' → '12 december' at hero size. -- '…dan houden Lisa 12 december aan' is ungrammatical Dutch. It also misattributes the line: Spreker 3's line is about the deadline, and 'we' as the owner belongs to Spreker 1's 'Die pakken we wel op.' The before/after callback now happens at the drop (act-c drop item, '…dan houden we 12 december aan.'), and the payoff lifts the real ACTIES row at hero size instead.
- Critic 1 note 5: a new mint chip 'Lisa · offerte · 12 december' drops into the L inbox row. -- It invents a new, abbreviated string inside a mail-client row. The same link is made with the existing row text: the lifted hero line travels into Lisa's row (act-d payoff item).
- Critic 2 note 6: layer a critically damped spring follower in Film.camera (film.js) over all keyed targets. -- Late in polish it would shift every act's measured framings: act D's y=340 clip, act E's lock point and act B's x>1000 checks all read Film.camera.at. Film.camera.at already blends overlapping keys, so the acts fix the staccato by overlapping and merging keys (act-c camera item, handoff contract).
- Critic 2 note 12: add a ±2-3° phone rotation for depth. -- Tilting dense UI hurts the weakest score, readability at phone size. Act E's brackets are derived from the phone corners. Depth comes from the parallax and shadow item instead.
- Critic 2 note 12: bring the full phone silhouette back at 22.0 and 27.2. -- At 22.0 this contradicts the readable close framing on the answer (critic 1: options at least 40 px; critic 3: the question fills the frame at the drop). At 27.2 it adds a pull-out and push-in bounce, which is exactly the yo-yo being removed.
- Critic 2 note 5: drop punch with an E.out attack, option scale 1→1.03→1, and a left-to-right mint fill sweep. -- E.out breaks the house-curve rule (non-negotiable 2), so the punch uses a short house-curve attack instead. The real app's selection is a flat fill (round 1 removed a ripple for the same reason), so the sweep and the over-scale would misrepresent the UI.
- Critic 2 note 15: use E.in (accelerate) for the bracket snap. -- It breaks non-negotiable 2 (house curve only, vary durations). The same effect, arriving at speed on the hit, comes from shortening the snap (act-e item).
- Critic 3 creative note 2: shorten naming to about 2.5 s and processing to about 1.5 s so the question starts by about 14 s. -- The drop is fixed at 22.0 on the music grid, so starting the question earlier only stretches the wait before the drop. The dilution is solved by giving naming its own card and landing 'Doorvragen.' fresh at 16.6.
- Critic 1 note 8 (optional): quickly show Spreker 2 and 3 named between 14.8 and 15.1. -- It adds a third UI beat to a crowded naming step that act B is calming down. Once Thomas is renamed to Daan, the later options no longer collide with the placeholder.
- Critic 1 note 4: E.stack at [38.0, 38.4, 38.8]. -- 38.4 and 38.8 fall off the 120 BPM beat grid. The stack stays on the beats [38.0, 38.5, 39.0] and still clears by 40.0. The rest of that T.E retime is kept.
- Critic 1 note 17 (optional): start the hold-to-stop at 8.0. -- The 7.7-9.3 freeze is solved by the even creep and the caption-3 marker hold. Moving T.A.holdStop would shorten the caption-3 set-up that the drop now calls back.
- Critic 3 creative note 3: cut or speed through UI that cannot be read. -- Too general to act on. It is covered concretely by the three hero moments (the drop caption resolve, the payoff hero line, the poster hold) and the per-beat legibility items.

# foundation

I fixed 12 of the 14 notes fully, 1 partly, and could not fix the encode note (it lives in `tools/render.sh`, which I don't own). I checked every fix with stills in both formats. Three problems remain for other owners. The worst is a stray green "12 december" from act C that stays on screen from about 22.5 s to 48 s in both formats, over the end card too. Act D also still reads two removed timeline keys, so I kept them as temporary aliases.

| # | Note | Status | What changed |
|---|---|---|---|
| 1 | Thesis / context (sev 1) | fixed | "Doorvragen." leaves at 21.95 with a 0.13 s exit. The thesis is at 22.05 / 22.45 and out at 25.25; it is gone by 25.5, exactly when the context card comes in. Context is at 25.5 / 25.8, out at 27.6, set at footnote size (16:9 42 px/600, 4:5 38 px/600). The context tap moves to 25.45 and the file chip to 25.7. "Griffel vraagt." now rises as one block. |
| 2 | Notulen payoff (sev 1) | fixed (my part) | "Notulen." is the headline alone, 28.0 to 30.1. The inbox line comes in alone at 32.8, out at 34.3. Act D's timings are set as the note asked, the sent push is removed, and the trust card is 34.6 / 35.3, out at 37.6; wipe at 35.2 / 35.6 / 36.0. |
| 3 | End card too short (sev 1) | fixed (my part) | Words stack on 38.0 / 38.5 / 39.0 and are gone by 40.0. No reprise. Logo build 40.0–42.0, lock on 42.0, wordmark 42.0, end card 42.8, lines 43.0–43.9. Act E has adopted this: the full poster is on screen from about 44.2 to 48.0. The lock still needs re-checking against the licensed track. |
| 4 | Camera yo-yo (sev 1) | fixed (my part) | Added shared hand-off framings between acts: A→B at 10.0, B→C at 16.3, D→E at 38.0, each per format, plus a `Film.handoff("AB")` helper. The rule in `film.js` and the storyboard is now: end on the hand-off when one is defined, otherwise return to rest. Acts A, B, C and E use them: there are no zoom reversals left from 9.4 to 17.1. Act D still returns to rest, so the D→E bounce remains. |
| 5 | Doorvragen diluted (sev 2) | fixed | New card "Echte namen." / "Geen Spreker 1." from 11.4 to 16.3. "Doorvragen." comes in at 16.6. Its two sub lines come in at 19.2 / 19.45, after the in-app question has built, so two word-by-word builds never run at once. The ch1 sub leaves at 6.0 and "Opnemen." at 10.0. The old subA/swap timings are removed. Every gap in the text column is 1.15 s or less, except 30.4–32.8, which is left free on purpose for the payoff. |
| 6 | Hard black circle (sev 2) | fixed | The light-to-dark change is now a wide vignette that darkens from the frame edges toward the phone over 1.15 s (from 2.7) on the house curve. It starts at the corners with no pop and has no visible edge. The bars that land in the phone stay on a light background. "Opnemen." comes in at 3.2, when its spot is fully dark. The way back uses the same effect but sits under act B's light front. Overlay text and the VOORBEELD label now take their colour from the darkness right under them. |
| 7 | VOORBEELD label (sev 2) | fixed | 30 px in 16:9 and 28 px in 4:5 (moved up to y 40), tracking 0.14em. Colour is #4B5563 on light (I measured 6.0:1 on the gradient) and #9C9C9C on dark. It now stays until 38.6. |
| 8 | Dangling words at exits (sev 2) | fixed | Each text block now leaves as one unit: 0.25 s, house curve, blur of 4 px or less, gone by out + 0.3. `Film.type.goneAt(out)` gives the exact time. |
| 9 | Two touch dots (sev 2) | fixed | When the next tap comes less than 0.6 s after a release, the same dot glides to the next target. A released dot is gone within 0.22 s. I counted dots on every frame (30 fps) from 8.0 to 27.6: never more than one. |
| 10 | MP4 colour and blur (sev 2) | not fixed | `tools/render.sh` is outside my files. |
| 11 | Thomas looks like a name suggestion (sev 2) | fixed | Thomas is now Daan in the question options, the meeting names and the e-mail action items. The avatar initial now reads D. `docs/demo-meeting.md` and storyboard rule 4 are updated. |
| 12 | "Iets" reads as "lets" (sev 2) | fixed | Inter's serifed capital I (`cv08`) is on all overlay text only, not the app UI. The bundled Inter has it and I checked it visually. Recorded in the storyboard's brand section. |
| 13 | E-mail strings not real (sev 3) | fixed | The intro, the inbox subject and the new preheader now match the real app strings. Act D already renders them. |
| 14 | No depth (sev 3) | fixed | The background gradient and rings shift slightly with the camera (at most 1.5 % of the frame, about 2 % zoom). The phone shadow shifts a few pixels with the phone's position on screen. Frame 1 is unchanged. |

**Other owners still need to:**
- **act-c:**
  - Remove the stray green "12 december" left over from the drop caption.
  - The recipient taps already use the glide.
- **act-d:**
  - Drop the sent push and stop reading `T.D.pushSent` and `T.E.reprise`. Both are temporary aliases at the bottom of `timeline.js` with their old values; delete them once act D no longer reads them.
  - End on `Film.handoff("DE")` by 38.0. Act D still goes back to rest at 33.9 and from 36.6 to 38.0, so its camera still reverses at 34.5 and 36.6.
  - Keep the inbox rows out of the text box while the inbox line is up (32.8–34.55). In 16:9 the box is about x 170–810, y 300–410; it's about 100 px clear right now.
- **act-e:** compute the moment the trust card is gone with `Film.type.goneAt(T.O.trust.out)`, which is 37.85.
- **act-b:** the phone must stay clear of the text column from 11.4 (it is today).
- **tools owner:** the encode note:
  - convert colours with an explicit bt709 matrix and range;
  - add dither or 10-bit against banding;
  - use 8-subframe motion blur;
  - gate the final on a sampled mark within ±1 of #1ABA6D and white at 255.

I also wrote every spec change into `docs/storyboard.md`, including a new table of all overlay cards and their times.

Files are in the project root:
- `src\film.js`, `src\timeline.js`, `src\copy.js`
- `src\parts\stage.js`, `src\parts\overlay-text.js`, `src\parts\touch.js`, `src\parts\phone.js`
- `docs\storyboard.md`, `docs\demo-meeting.md`
- Stills: `renders\fix2\foundation-169` and `renders\fix2\foundation-45` (each has `sheet.png`, plus `dark\`, `overlay\` and `misc\`; 16:9 also has `taps\`)
- Pre-edit backups: `<scratchpad>\foundation-before\`

# act-a

## Act A fix ledger (round 2)

I only edited `src\parts\act-a.js`. I rendered stills in both formats for the hook, the morph, the recording hold and the hand-off at 10.4. Frames rendered in a different seek order were pixel-identical (PSNR inf). The only page error was a 404 for a missing resource, which was already there before my changes.

| Note | Status | What changed |
|---|---|---|
| **1. Hook tension, whisper, frame 0, 4:5 layout** (sev 2) | fixed | **Frame 0:** "…dan houden we de" is already ink at t=0, and only "Q4-deadline aan." is grey.<br>**Karaoke:** an ink wipe runs over the syllables of "Q4-deadline" (0.1–0.7), then "aan." follows. The marker sweep is unchanged.<br>**Whisper:** "En wanneer is dat?" is now ink #131417, weight 600, 60 px in 16:9 and 56 px in 4:5. It comes in at 1.0 with the marker and is fully visible from about 1.17 to 2.35. It fades out with a blur of 4 px or less from 2.35 to 2.5, while the words are folding and the bars are in flight, so it is never alone on the stage.<br>**4:5:** the line is 86 px, left-aligned at x=84 like the label, with the line block centred at y≈631. The whisper sits above the line (y≈444–514); the phone's top is still at 641 at 2.4 and at 569 at 2.5, so it never reaches the whisper. |
| **2. Signature move distorts type** (sev 2) | fixed | No more scaleX on live type. Words fold one after another from 2.0, 25 ms apart. In each word's first 0.18 s (40 % of a 0.45 s collapse), the glyphs fade and blur out (at most 4 px). Meanwhile a solid rounded block grows from the word's x-height centre into the bar cluster (green for Q4-deadline). At lift-off, the block hands over to bars that tile it exactly, so the swap doesn't show. In flight the gaps open, the corners round into capsules and the heights become the live waveform. All 36 bars still land pixel-exact by 2.975. The same object is on screen from 2.0 to 2.975 (at least 0.85 s per word). |
| **3. Frozen stretches, creep, return to rest, caption 3** (sev 2) | fixed | **Hook drift:** now linear (2 %/s) from t=0 through the fold, with no ease-out stall.<br>**Camera:** one even creep from 2.975 to `T.handoff.AB.t` (10.0), ending on `Film.handoff("AB")`, with no return to rest. Sampled: z rises about 0.004 every 0.4 s, constant from 3.6 to 9.2. I removed the old front-loaded keys, the 4:5 tilt-up at 2.3 (it was a reversal) and the 9.35 return.<br>**Caption parallax:** follows the same even creep.<br>**Caption 3:** the words light up quickly and the marker starts at about 7.45 (full by 7.9). It holds at full as the end image until the stop at 9.6, then leaves over 9.6–9.96 with the chapter word. |

**Deviations you should know about:**
- **Creep curve:** the creep uses a trapezoid velocity profile (soft 15 % ramps at each end, constant speed in between) instead of `E.house`. The note asked for an even creep, and the house curve is never even over 7 s. Every other move in the act still uses the house curve.
- **Git:** early on I ran three read-only git commands (`status`, `diff --stat`, `log`) before I noticed the "no git" rule. Nothing was changed by them.

**For other owners:**
- **timeline.js (foundation):** `T.A.hook.whisper` is still 1.3. Act A uses `min(whisper, highlight[0])`, so it enters at 1.0. Please set it to 1.0 so the file says what happens on screen.
- **storyboard.md:** the Act A rows are out of date. They should record:
  - whisper: ink, 600, 60 px in 16:9 / 56 px in 4:5, 1.0–2.5; in 4:5 it sits above the line;
  - 4:5 hook: 86 px, left-aligned at x 84;
  - signature move: fade/blur plus a growing block, then a split in flight, landing by 2.975;
  - camera: creep 2.975 → handoff AB at 10.0, no return to rest;
  - captions: caption 3 marker at about 7.45, held until 9.6.
- **act-b.js:** `solveLight` still maps the light front with `L.cam0`. At 9.8–10.0 the camera is at the AB framing (z 1.06), so check that the stage and screen light stay in register. Act B's camera also starts moving before 10.0 and cuts into the end of my creep. It blends continuously, so that is fine.
- **act-c.js:** the callback of caption 3 at the drop uses a 42 px line in 16:9. Act A sets the same line at 46 px with a 24 px tag (4:5: 34 px with a 22 px tag). Match it if the callback should read as the same object.
- **Concurrent edits:** one 4:5 render came out broken (phone at the left, no hook), and one 16:9 run logged "Identifier 'target' has already been declared". Both came from other files being edited mid-render; a re-render was clean, but all renders while edits are running are suspect.

Files are in the project root:
- `src\parts\act-a.js` (the pre-round version is saved as `act-a.before-fix2.js` in my scratchpad)
- Stills under `renders\fix2\`:
  - `act-a-169\sheet.png`, `act-a-45\sheet.png` (whole act, 0–10.4)
  - `act-a-169-morph\sheet.png`, `act-a-169-split\split.png`, `act-a-45-morph\sheet.png` (signature move)
  - `act-a-169-rec\sheet.png`, `act-a-45-rec\sheet.png` (recording hold and the hand-off to act B)
  - `act-a-45-hook\sheet.png`, `act-a-169-small\row.png`, `act-a-45-small\row.png` (4:5 hook and phone-size checks)
  - `act-a-169-base`, `act-a-45-base` (before)

# act-b

All four notes are worked in `src\parts\act-b.js` (no other file touched). Notes 1, 2 and 4 are fixed. Note 3 is partly fixed: the last bars still form a short dotted column at the bottom of the list for about 0.3 s. Every change is checked in stills at both formats, including the frames either side of the act.

| Note | Status | What changed |
|---|---|---|
| **1 (sev 1)** Screen changes were cross-dissolves | **fixed** | Both screen changes are now covers. At 12.42 the naming screen arrives fully opaque and slides up 32 px over 0.45 s on the house curve, with the working stage opaque underneath. At 15.36 the working stage covers the naming screen the same way. Nothing fades in either change, so the ghosting at 12.5 and 15.45 is gone (checked at 12.43, 12.5, 15.38 and 15.45). The back row "Projectoverleg nieuwe website" no longer dips out around the swap. It now hides only while a push banner sits over it, so it doesn't show through the 97%-opaque banner. |
| **2 (sev 1)** Camera yo-yo | **fixed** | The camera starts from `T.handoff.AB`. There is one push in, under the morph: 9.85–11.25 in 16:9 (to z 1.45, using BC's cx so the phone's left edge stays at about 1035), 9.85–10.95 in 4:5 (to z 1.22). The 11.5 pull-back is gone. Through the working stage, the push and the naming the camera holds with a slow cy drift (16:9) or eases from 1.22 to 1.25 (4:5). Then it pans to `T.handoff.BC` over 15.8–16.3, landed by its t: a pure pan up in 16:9, a 40 px pan down in 4:5, with no zoom change. Measured from 9.5 to 16.6: no zoom-direction change in either format. Peak speed is 20.6 px/frame in 16:9 and 8.2 in 4:5. |
| **3 (sev 2)** Morph read as one swinging hairline | **partly** | The swinging spine is gone. The 36 bars leave one by one, 11 ms apart, each on its own curved path, and grow a little in flight so they read as bars. About 4 bars gather into each status dot and 2–3 thin into each connector line, so the list builds top to bottom. The move runs 9.84–10.73 (0.9 s). The light front now has a smooth feather, 300 px inside the phone and at least 600 px on the stage, with no hard edge. The title starts rising at 10.3. **Not fully met:** fading every bar by 10.35 conflicts with 0.8 s of continuous motion, so the last bars land on the lower rows until 10.73. That shows as a short dotted column for about 0.3 s, not a full-height ghost line. |
| **4 (sev 2)** 4:5 naming too small to read | **fixed** | In 4:5 the camera holds z 1.25 on the Spreker 1 card from 12.8 to 15.8. The phone top is pinned at y 400, the card header is at y 485 or lower, and Bevestigen sits 30 px above the frame bottom. The caption is 44 px on one line (it ends at x 822 of 996) and is centred between "Geen Spreker 1." and the phone, at y 294–349. At 360 px wide, "Lisa · Die pakken we wel op.", the card and the typed "Lis" are readable. The caption now leaves with `T.O.ch2a.out` as one unit in 0.25 s. |

Stills are in `renders\fix2\`:
- `act-b-169\sheet.png` and `act-b-45\sheet.png` (all affected moments)
- `act-b-169-morph`, `act-b-45-morph`
- `act-b-169-cover`, `act-b-45-cover`
- `act-b-169-handoff`, `act-b-45-handoff`
- `act-b-169-banner\banner_sheet.png`
- `act-b-45-small\small.png` (phone size)

A backup of the previous `act-b.js` is at `...\scratchpad\act-b.before-fix2.js`.

**Still to do by other owners:**
- **Act A:** caption 3 ("Spreker 3 …Q4-deadline aan.") stays on screen until about 9.95 in both formats, while act B is already fading the recording chrome.
- **`pushes.js`:** the banner fades over 0.18 s while it moves on a slow-start curve over 0.3 s, so it fades mostly in place. Around 16.8–16.9, act C's top row shows through C's exiting banner.
- **`touch.js`:** the dot from the 12.35 push tap stays on the back row until about 12.57.
- **Overlay/stage:** "Opnemen." takes its colour from `Film.stageDark` (stage.js's radial front). On screen the light is act B's bottom-to-top front, so the word dims to grey on dark during its exit (10.0–10.3). It looks acceptable but isn't driven by the same front.
- **Act C:** it now starts from `T.handoff.BC`, and my probe shows no zoom-out at 16.3. Keep BC at z 1.45 (16:9) and 1.25 (4:5), because act B holds exactly those zooms through the naming.

# act-c

**Act C fix ledger (round 2).** All five notes are fixed in both formats. The one exception is the 4:5 punch: there the option text only reaches about 30 px, not 36–40. I edited only `src\parts\act-c.js`, re-rendered stills of every affected moment in 16:9 and 4:5, and checked the hand-offs on both sides of my window (16.0–16.3 and 27.55–28.2). The only page error is the existing 404, which my file does not cause. I also measured camera speed frame by frame at 60 fps for 16.0–28.4 with a throwaway probe script, now in my scratchpad.

| Note | Status | What changed |
|---|---|---|
| 1 · Climax (sev 1) | fixed in 16:9; in 4:5 fixed except the option text size | **Caption:** caption 3 comes back at 20.8: "SPREKER 3 · …dan houden we de Q4-deadline aan.", with a mint marker and #12804B on "Q4-deadline". 16:9: tag at y 600, line 639–687 at 38 px (ends about x 850, under the climax lines). 4:5: one line at y 340–384. It holds until 23.8 (`T.C.q2[1]`) and leaves as one block, gone by 24.1.<br>**Flight:** the tap is at 22.0 and the flat selected fill at 22.05. At 22.12 a copy of "12 december" lifts out of the row; it starts as the app's own 16 px text, so it sits exactly on the label, and the in-app label hides at that moment. It flies in screen space, following the option through the camera via `Film.phoneToScreen`, on a mint chip cut from the selected row. 16:9: across, then down. 4:5: across, then up. It lands at 22.62 (4:5: 22.72) with a 1.05→1 settle, and the chip tightens into the caption marker.<br>**Flip:** in the caption, "de Q4-deadline" is struck through (22.14), leaves (22.30), and the slot eases to the new width. Result: "…dan houden we 12 december aan."<br>**Punch:** aimed at the options, 0.16 s attack plus 0.6 s settle, house curve only. 16:9: options at 35 → 38 → 36 px; the phone frame stays right of x 933. 4:5: 29 → 30 px only, because the phone has to stay below the caption line. |
| 2 · Page changes (sev 1) | fixed | Every page change is now a cover. The new page is fully opaque from its first frame and rises 30 px over 0.45 s inside a fixed clip, so the old page never shows through and no layer is ever below 100%. This applies to B→wizard (16.93), Q1→Q2 (22.29) and Q2→review (23.44). The top row and step indicator stay put. Q2 and the review page arrive complete, with no fade-ins. The 27.52 fade-out is gone: the review stays opaque under act D's screen (z 35) until 28.4. |
| 3 · Camera (sev 1) | fixed | **Phrases:** no key targets rest before the end; the first key starts at 16.1 and blends into act B's landing on `T.handoff.BC`. Three phrases with overlapping keys: 16.1–20.0, 18.6–22.76, 22.55–28.0. 23.0–25.4 is one slow pull-out with no focus push.<br>**Context beat:** tap at 25.45 on the unscrolled page, file at 25.7. The context-row push starts at 25.35, the single 200 px scroll runs 25.72–26.16, and the recipient taps are at 26.2, 26.45 and 26.7.<br>**Measured:** peak speed is 26.6 px/frame in 16:9 (at the punch) and 20.2 in 4:5. Speed drops below 0.3 px/frame only at act B's landing on BC (16.3), the punch turn (22.17), 3 frames at 18.65 and the arrival at rest at 28.0. |
| 4 · Row removal (sev 2) | fixed | A tapped row presses, its content fades over 0.14 s, then its height closes over 0.35 s on the house curve. Its chip pops in at tap + 0.12 while the row closes, so "Notulen versturen" slides up smoothly. The 0.25 s gap between taps lets touch.js glide one dot between them. |
| 5 · Question marker (sev 3) | fixed | The in-app question is plain text-2xl bold again: no marker, no green. It still builds word by word, and "'de Q4-deadline'." doesn't break across lines. |

**Still to do by other owners:**
- **storyboard.md:**
  - Change "with de Q4-deadline lightly highlighted" to a plain question.
  - Describe the new climax: caption 3 returns at 20.8, the chip flies at 22.12–22.62, the caption leaves at 23.8.
  - Describe the context beat: the tap is on the unscrolled page, followed by one 200 px scroll.
  - Note the actual tap times. Recipient taps are 26.2/26.45/26.7 with chips at +0.12, which is not exactly `T.C.recipients − 0.06` anymore. Foundation may want to set `T.C.recipients` to match.
- **Director decision:** in 4:5 the punch reaches about 30 px option text, not 36–40. More would push the phone into the caption or the climax text.
- **tokens.css / overlay-text owner:** the `.w` class has `will-change: transform, opacity, filter`. That makes the climax lines render slightly differently depending on seek order (a frame reached by jumping differs from one reached sequentially). I removed `will-change` from my own words for the same reason. Remaining difference in my area: one anti-aliased pixel column at the phone screen edge.
- **act D:** you own the 27.6 cover. My camera reaches rest at 28.0 through one long pull-back that starts at 26.55 (16:9) / 26.6 (4:5) and peaks at 22 px/frame around 27.0. Right now your screen appears in a single frame at 27.6, which you should check.
- **copy.js:** keep the substring "de " + key inside `captions[2].text`, because the flip depends on it. The inline NL strings from round 1 still need folding into copy.js.

Files are in the project root:
- src\parts\act-c.js (previous version saved as `<scratchpad>\act-c.before-fix2.js`)
- renders\fix2\act-c-169\sheet.png
- renders\fix2\act-c-45\sheet.png
- Detail folders in renders\fix2: act-c-169-covers, act-c-169-rcp, act-c-45-drop, act-c-169-small, act-c-45-small, and small169.png / small45.png (phone-size frames)
- Before-fix sheets: act-c-169-base, act-c-45-base

# act-d

All five notes are fixed in both formats, except two "partly" points: the line reaches Lisa's row about 0.5 s after her row lands, and the camera leaves the trust framing at 36.9 rather than holding it to 37.6. In both cases the requested time and the 30 px/frame limit can't both be met. The fastest on-screen movement in act D is now 29.7 px/frame at 60 fps (16:9) and 29.1 (4:5), measured frame by frame from 27.4 to 38.1. I only edited `src\parts\act-d.js` and ran no git.

The checks were full-resolution stills of every affected moment in both formats, including the frames just before and after the act, plus phone-size stills. Rendering frames out of order gives the same picture apart from small text-edge anti-aliasing differences. The only page error is a 404 for a missing resource that was already there.

| Note | Status | What changed |
|---|---|---|
| 1 · payoff unreadable (sev 1) | fixed, two parts partly | **Fixed:**<br>• ACTIES row 1 now lifts out of the e-mail from 30.1 as one world line set over two lines, "Lisa stuurt de offerte naar de klant" / "12 december". It uses the existing row text (`C.email.acties[0]`).<br>• Size: 70 px in 16:9, 56 px in 4:5. It starts exactly over the e-mail row, and "12 december" drops under the first line while still small, so the two lines never cross.<br>• The e-mail recedes to 85 % and dims behind the line; its row 1 stays visible as an empty slot.<br>• Both markers are complete by 31.0; the line holds with a 1 %/s camera creep until 32.6.<br>• It stays below the overlay text area, and the area is clear by 32.8.<br>• Fan-out: the camera move takes 1.15 s and the card fold starts 0.15 s after it. The e-mail's content scales down with the card, so the card is never empty; the content scrolls out while the row text fades in over 0.27 s.<br>• The camera now zooms out around the e-mail's spot on screen, so the card folds almost in place.<br>**Partly:**<br>• Lisa's row lands on the first tick (32.9), but the line needs 0.85 s to shrink into it (32.6 → 33.45). A 0.3 s flight would be about 85 px/frame.<br>• The line stays readable from 31.0 to about 32.85. |
| 2 · logo reads "Grıffel" (sev 1) | fixed | Act E's i-dot path is now a local constant in my file, added to the header logo in the wordmark's coordinates with fill #1ABA6D. I zoomed in on the header in both formats and the green dot is there. |
| 3 · washed-out C→D hand-off (sev 1) | fixed | The "Notulen onderweg" screen is an opaque sheet from its first frame and slides up 32 px over 0.45 s on the house curve. The status bar and top row stay put. Act C is opaque at 27.55, my screen is opaque at 27.6, and no frame has both below 50 % opacity. |
| 4 · "sent" order and signals (sev 2) | fixed | • The phone switches to "Verstuurd" on the first tick with an opaque sliding sheet, while it is still behind the folding card, so the pull-out reveals it already sent.<br>• The "verstuurd" push registration is removed.<br>• Rows show Griffel / "Projectoverleg nieuwe website" / the preheader, cut off with "…". The old heading-onto-subject registration is gone.<br>• Avatars come from `C.meeting.names` (now L / D / S).<br>• 4:5: the phone stays below the rows and never rises through them. |
| 5 · slow tail, bouncing camera (sev 2) | fixed, one part partly | **Fixed:**<br>• Every hold now has a slow drift: from 28.0, the 1 %/s creep on the payoff, the inbox, and a 1.2 %/s drift on the trust beat.<br>• The camera goes straight from the inbox framing to the trust framing, with no stop at rest in between.<br>• The trust framing is zoomed in on the "Verstuurd" screen (1.45 in 16:9, 1.4 in 4:5) with the empty lower screen cropped. The three chips are much larger: 84–88 px tall with 34–36 px labels, beside the phone in 16:9 and stacked above it in 4:5.<br>• Act D ends exactly on `T.handoff.DE` at 38.0, with the phone back at its base position. Act E's camera starts from there, so there is no corner at 38.0.<br>**Partly:** the move to act E starts at 36.9, not 37.6; in 0.4 s it would be about 58 px/frame. In 16:9 it keeps the phone at least 45 px clear of "Verstuurd is verwijderd." until that line is gone, then slides the last ~70 px. |

**Still for other owners:**
- **timeline.js (foundation):**
  - Act D no longer reads `T.D.pushSent` or `T.E.reprise`. Those deprecated aliases can go once nothing else reads them.
  - `T.D.backToPhone` is unused now: the rows leave with the ch3 sub at `O.ch3.subOut − 0.25`.
- **storyboard.md:** act D's rows are now L / D / S because `C.meeting.names` changed. The storyboard should also record the new trust framing and that there is no sent push.
- **act-e.js:** act D's screen stays opaque and unchanged until `T.E.collapse[0] + 0.6`, under act E's white cover; nothing to change.
- **act-c.js:** keep act C's screen opaque until 28.0. The hand-off relies on it.
- **Open:** in 4:5 the inbox row text is about 5 px at feed size, so the rows read as shapes with avatars. I left the row size unchanged.

I added `data-actd` attributes to a few elements so I could measure their movement. They have no effect on the picture.

Files are in the project root:
- `src\parts\act-d.js` (the pre-fix version is `act-d.before-fix2.js` in my scratchpad)
- `renders\fix2\act-d-169\sheet.png`
- `renders\fix2\act-d-45\sheet.png`
- `renders\fix2\act-d-169-small\` and `renders\fix2\act-d-45-small\` (phone-size stills)
- `renders\fix2\act-d-before-169\` and `renders\fix2\act-d-before-45\` (before the fixes)

# act-e

I fixed all three notes in `src\parts\act-e.js` and checked them on stills in both formats. Every time is now read from foundation's new `T.E`, `T.handoff.DE` and `T.E.stackOut`. Act D has not yet been changed to land on the DE camera framing, so I also rendered a version with that landing simulated in a scratch harness.

| Note | Status | What changed |
|---|---|---|
| 1 (sev 1): grey outro, dark reprise, freeze 39.47–40.30 | fixed | <ul><li>**Reprise cut.** The dark recording screen and its dark-status-bar call are removed, so the film now goes light → dark → light.</li><li>**38.0–38.12 handoff.** At `T.handoff.DE.t` (38.0) a white cover (z 40) fades in over act D's screen in 0.12 s. "Verstuurd" and the meeting subject are gone by 38.12, well before the VOORBEELD label ends at 38.6.</li><li>**Waveform.** From 38.12 the 36 bars rise out of the white screen at (196.5, 430), centre first, and are fully up by 38.8. They then keep moving as the live waveform. They are mint inside the screen and ink outside it, using a clip on the screen's rounded rectangle. In practice no bar ever leaves the screen before the screen fades, so the ink part never shows.</li><li>**Triad.** It lands at 38.08 / 38.5 / 39.0. It starts leaving at `T.E.stackOut` (39.7), the three words 0.03 s apart, and is gone by 40.0.</li><li>**Camera.** One move on the house curve from the DE framing to the lock framing: 38.0 to 40.4 in 16:9, 38.0 to 40.5 in 4:5. It is still moving at 40.0.</li><li>**4:5 lock point.** Moved down to y 750 (zoom 0.78), so the phone's top never touches "Notulen.".</li><li>**Build retimed.** Screen fade 39.95–40.3 is light on light, so there is no grey frame. Bezel retracts 40.25, brackets cross-fade 40.37, brackets fly 40.55–41.52, bars gather 40.3–41.15, lock at 42.0, wordmark 42.3–42.8, end card 42.8, lines 43.0–43.9. The poster is complete at about 44.2.</li><li>**Checked.** The frames just before (37.6, 37.85) and after (40.0–40.45) hand off cleanly, with no grey slab and no stacked layers.</li></ul> |
| 2 (sev 2): bracket snap crawls into the lock, then dead hold | fixed | <ul><li>Still on the house curve. The snap now runs 41.82–42.0 (0.18 s) and ends exactly on `T.E.lock`, so the last two frames carry only about 10 % and 2 % of the travel.</li><li>One 4 % settle, 42.0–42.3.</li><li>The slide starts at 42.25 and the wordmark wipe at 42.3, both ending at 42.8, so there is no dead hold.</li></ul> |
| 3 (sev 2): "Al" in the slogan; fine print contrast and size | fixed | <ul><li>`fontFeatureSettings "'cv08' 1"` (Inter's capital I with serifs) is set on the end-card slogan and the three outro words only. "AI" now reads correctly, also at phone size.</li><li>Fine print is #4B5563 at 30 px in both formats (4:5 was 26, 16:9 was 28). Measured contrast on the final frame is at least 6.3:1 in 4:5 and 5.6:1 in 16:9.</li><li>Badges are unchanged, at equal height.</li></ul> |

Still to do by other owners:
- **Act D owner:**
  - Act D should land on `Film.handoff("DE")` by 38.0. It still returns to the rest camera, so for now act E's single move starts from rest, which also works.
  - Act D still reads the deprecated `T.E.reprise[0]` and fades its own screen from 39.0–39.5. That is hidden under act E's cover, but it should stop reading the alias so foundation can remove it.
  - In 16:9, if the DE move happens while the trust card is still up, the phone's left edge can overlap "Verstuurd is verwijderd.". It did around 37.6 in my simulation with a 36.7–38.0 move.
- **Director / foundation:** record cv08 in the design docs as a film-only legibility setting. Foundation still has to apply cv08 to the overlay lines.
- **Shared code (`film.js` / `tokens.css` owners):** the rising words (`Film.type`) and the end-card drift layer render with small anti-aliasing differences depending on the order frames are seeked in (a Chrome rendering effect). A front-to-back render is consistent. This was already there before my change.
- **Known limit:** the 16:9 fine print is still only about 5–6 px tall when the 16:9 film is shown at phone width. 16:9 isn't the feed format.

Other fixers' files briefly failed to load during my runs, mid-edit. I re-rendered once everything loaded cleanly, so the stills below show the current state.

Files are in the project root:
- `src\parts\act-e.js` (the only file edited)
- `renders\fix2\act-e-169\sheet.png`, `renders\fix2\act-e-45\sheet.png` (37.6–48.0)
- `renders\fix2\act-e-169-simD\sheet.png`, `renders\fix2\act-e-45-simD\sheet.png` (act D's DE landing simulated)
- `renders\fix2\act-e-169-small`, `renders\fix2\act-e-45-small`, `renders\fix2\act-e-small-48.png` (phone-size checks)

