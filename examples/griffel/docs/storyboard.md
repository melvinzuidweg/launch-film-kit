# Griffel launch film — storyboard and build spec

**Hero:** 48 s, one continuous take around the phone, no voice-over, Dutch, muted-first.
**Formats:** 16:9 1920×1080 (`index.html`) and 4:5 1080×1350 (`portrait.html`), same timeline, recomposed layout.
**Viewer:** a Dutch MKB team lead with in-person meetings. **Goal:** installs + awareness.
**Message spine (from the competitor research):** doorvragen (core) → the action item with name and date in the inbox of whoever you choose (payoff) → real names (support). "Verstuurd is verwijderd" is a short trust beat.
**Timing grid:** 120 BPM (one bar = 2.0 s, one beat = 0.5 s). The music drop is at **22.0 s**, exactly on the tap that answers Griffel's question. All times live in `src/timeline.js`; never hard-code a time that exists there.

## Time scale

The whole film plays **`T.SCALE` = 1.1 times slower** than it is written (founder's request: easier to follow; the film may get longer). The scale is one uniform number in `src/timeline.js`, so every relation between events stays exactly as designed.

- **Film time** is what this storyboard, every `T` value and every part's `render(t, ctx)` use. It is unchanged: 0–48 s, drop at 22.0. Act code never sees anything else.
- **Output time** is the rendered video's clock: film time × `T.SCALE`. The video runs `T.OUT_DURATION` = 52.8 s, the drop lands at `T.OUT_DROP` = 24.2 s, and the 120 BPM grid plays at 120 / 1.1 = 109.09 BPM. `T.toOut(t)` / `T.toFilm(t)` convert.
- **Who speaks which:** the runtime (GSAP proxy, `hf-seek`), `window.__seek(t)`, `tools/still.mjs`, `tools/capture_seq.mjs`, `tools/render.sh` and the audio cues (`tools/audio/events.mjs` → `mix.py`) all use output time. `Film.render(tOut)` converts to film time (snapped to 1e-9 s, so output 24.2 is film 22.0 exactly). `window.__seekFilm(t)` and `still.mjs --film` take film times.
- **Value-changing text** (counters, timers, fast digits): compute the value from **`Film.frameT(t)`**, which quantises film time to the 60 fps *output* frame grid (`floor(t × SCALE × 60 + 1e-6) / 60 / SCALE`). The final render averages 8 subframes (480 fps) per output frame; with `frameT` all 8 show the same value. `floor(t × 60) / 60` is the film grid and smears once `SCALE` ≠ 1.
- **Length:** `Film.boot()` (and an inline script on each page) writes `T.OUT_DURATION` into the root's `data-duration`. The pages carry **no static `data-duration`**: HyperFrames' render planner uses a static value as-is and only asks the page (`window.__hf.duration`) when there is none. `hyperframes lint` therefore reports `root_composition_missing_duration_source` (a false positive, like the existing `missing_timeline_registry`) and `hyperframes info` shows a placeholder length; renders and snapshots get 52.8 s.
- **Changing the scale:** edit `SCALE` in `timeline.js`, or set `window.TIME_SCALE` on a page before `timeline.js` loads. `T.DURATION` / `T.SCALE` may only change before `Film.boot()`. Re-run `events.mjs` and re-align the music (`mix.py --song-drop`) after any change.

## Non-negotiables

1. **Pure function of time.** Every animated style is set from `t` inside `render(t)`. No timers, no CSS transitions or animations, no `requestAnimationFrame`, no `Date`, no `Math.random` (use `Eng.hash` / `Eng.noise1`). Any frame must render the same regardless of seek order.
2. **House curve.** Every morph and camera move uses `Eng.E.house` = `cubic-bezier(.45,0,.15,1)`. Vary durations (0.35–1.2 s), not curves. Springs only via `Eng.spring`/`Eng.S` with zeta ≥ 0.9 (no bounce). No particles, no decorative glows, no lens effects.
3. **Truth.** UI strings come verbatim from `src/copy.js` (which mirrors griffel-app `nl.ts` and the real push copy). Never show a feature that does not exist:
   - The app has **no transcript screen** and **no notes screen**. What is said at the table is shown as overlay captions, not as an app screen.
   - In the naming step, **the user types the name** ("Lisa"). Do not show the "Griffel denkt: …" suggestion.
   - No "30 seconds" or "within minutes" time claims. Time jumps are visual (light change), not clocks.
4. **Fictional meeting only** (see `docs/demo-meeting.md`). First names Lisa, Daan, Sanne. Never "Thomas": the real name-field placeholder in act B reads "Bijvoorbeeld: Thomas" (verbatim, it stays), and an attendee with that name would look like Griffel suggesting a name. No e-mail addresses on screen. The VOORBEELD label is handled by `stage.js`: 30 px in 16:9 (bottom-left) and 28 px in 4:5 (top-left, y 40), tracking 0.14em, #4B5563 on light (at least 4.5:1 on the gradient), #9C9C9C on the dark act. While the stage under it changes (2.8-3.4, 9.8-10.6), stage.js picks the colour against the local stage luminance across the label, not by a blend: darker toward ink while the stage is light, a switch to light grey (white at the switch itself) at about 19 % luminance, then back to #9C9C9C, so every frame keeps at least 3:1. It is on screen from frame 1 until act E's dissolve has removed the meeting subject (`T.voorbeeld`, 38.6).
5. **Brand.**
   - Inter only (400–800).
   - Film-only legibility setting: the overlay type (cards, climax, context, trust, and act E's slogan) sets Inter `cv08` (capital I with serifs), so "Iets onduidelijk?" never reads as "lets". The website does not use cv08. Never apply it to the app UI, which stays verbatim.
   - App UI radius is 10 px. Only real circles (avatars, dots, the touch-dot) are fully round.
   - #1ABA6D is the brand green (logo, brand moments). On light backgrounds it is only allowed as fill or decoration, never as text. Green text on light uses #12804B or `.hl-green-dark`.
   - #09FE94 is the UI accent (waveform, live dots) and is never text on light.
   - App cards are flat white with a #E8EAED hairline. Selected option = `#D6FBEB` background, `#00301B` text, and a CheckCircle2 icon.
6. **Ownership.**
   - Each act builder edits **only** its own file `src/parts/act-<x>.js`.
   - If you truly need a new shared helper, put it inside your own file.
   - Do not edit `film.js`, `timeline.js`, `copy.js`, the other parts or the HTML pages. If a time in `timeline.js` is wrong for your act, note it in your report instead of editing.
7. **Readability.** At phone size (360 px wide sheet) key text must be readable. Text over the phone UI never collides with other text. Keep your world content clear of the overlay text box (`ctx.L.text` region) while overlay text is visible. Use `Film.toScreen` to check.

## Geometry contract

- **Phone.**
  - Logical screen is 393×852. `ctx.phone.screen` is the clipping container.
  - Build your screens as absolute children 393×852 with `zIndex` between 1 and 40.
  - The incoming screen covers the outgoing one; windows overlap on purpose.
  - Status bar (z50), pushes (z60), island (z70) and touch (z80) are already handled.
  - Call `Film.darkScreen([from, to])` for every window in which your screen is dark, so the status bar turns white.
- **World.**
  - The phone centre is the world origin, and 1 world px = 1 logical px.
  - Rest camera is `ctx.L.cam0`: 16:9 `{cx:-380, cy:0, z:1}`, so the phone sits right-of-centre with text on the left; 4:5 `{cx:0, cy:-210, z:0.86}`, so the phone sits low with text on top.
  - Camera moves: `Film.camera.key(t, dur, {cx, cy, z})`. Moves compose sequentially and use log-space zoom; overlapping keys blend.
  - **Hand-offs (round 2).** End on `Film.handoff("<XY>")` (= `T.handoff.<XY>[format]`, landed by `T.handoff.<XY>.t`) when a hand-off to the next act is defined, and start from it in the next act. Otherwise, return to the rest camera by the end of your window. This replaces "always return to rest", which made the camera yo-yo (out-then-in bounces at A→B, B→C and D→E). Defined:
    - `AB` (10.0): act A's creep framing. 16:9: rest + 6 % `{-362, 6, 1.06}`. 4:5 (fix 3): z 1.15 with the screen top pinned at y 445, `f45(196.5, 0, 540, 445, 1.15)` = `{0, -226, 1.15}`, so the dark act is one slow, even push to a phone that fills the frame. The bezel top stays at y 429 or lower on screen (the caption box ends at about 411), and the stop button, the hold dot and "Houd ingedrukt om te stoppen" stay in frame (logical y 720 lands at about 1272). Act A stays on it; act B leaves from it and only zooms in from there (1.15, then 1.22, then BC 1.25).
    - `BC` (16.3): the top of the phone, where the questions push lands. 16:9: z 1.45, banner at screen (1340, 300), phone left edge about 1035. 4:5: z 1.25, phone top pinned at y 440, under act B's caption box.
    - `DE` (38.0): act E's opening framing (16:9 `{-255, 0, 0.94}`, 4:5 `{0, -120, 0.8}`). Act D ends on it after the trust beat; act E starts from it. Fix 3 moved 16:9 from cx -122 to -255: the phone's left bezel lands at x 1002 instead of 877 (inside the 950 px text column), so act D's hand-off is one key (no 37.7-38.0 hitch) and "Doorvragen." has about 200 px of air. (cx -230 would put the bezel at 978, short of the 1000 the note asked for.)
    - There is no C→D hand-off: act C returns to rest after the send tap (fix 5: one slow 2.7 s pull-out from 27.3 that is still easing out when act D's first key blends in at 27.6).
  - Make camera keys format-aware: `if (Film.format === "45")`.
- **Phone motion:** `Film.phoneMotion.key(t, dur, {x, y, s, r})`.
- **Recording waveform anchor (shared by acts A, B and E):**
  - 36 bars, each 4 px wide with a 4 px gap, so the waveform is 284 px wide and 72 px tall.
  - Centre at phone logical **(196.5, 430)**.
  - Bar heights use the real mapping `0.08 … 1 × 72px`, seeded noise scrolling one bar per 90 ms.
- **Overlay (screen space):** `ctx.overlay` (under `ctx.top`). Text cards are done by `overlay-text.js`. Meeting captions use the box `ctx.L.captions`.
  - `Film.type.render(block, t, in, out)`: entries rise word by word. The exit moves the **whole block as one unit** (no stagger, blur of 4 px or less, house curve, 0.25 s by default). An `out` time means "starts leaving at out, gone by `Film.type.goneAt(out)`", which is at most out + 0.3. No dangling words.
  - Never two cards in the text box at once: every card is gone before the next one rises. Text-column gaps stay at 1.4 s or less, except 30.4–32.8, where the frame belongs to the payoff row.
- **Backdrop depth (final polish):** stage.js moves the green gradient and the rings as a far plane: 18 % of the world's on-screen motion on both axes, softly limited (tanh) to 3.25 % of the frame's long side, plus a z^0.03 scale. The gradient layer extends past the frame on every side by 1.25 × that limit + 8 px, so no edge shows. The dark vignette stays screen-based.
- **Stage darkness:** `Film.stageDark(t, x, y)` returns 0 (light) to 1 (dark) at a screen point. Use it to colour anything that sits on the stage during the light/dark changes. `T.dark` (fix 3): `inStart 2.0, inDur 3.4, spread 0.3` on the way in; `outStart 9.8, outDur 0.8, spreadOut 0.5` on the way back (unchanged).
- **Taps:** `Film.tap({t, x, y, hold})` in phone logical coords at the exact centre of the control being tapped. One finger: when the next tap follows less than 0.6 s after a release, `touch.js` glides the same dot to the next target (house curve, up to 0.22 s) instead of showing a second dot. A released dot is gone within 0.22 s.
- **Pushes:** `Film.push({t, dur, title, body, tapAt})` with copy from `COPY.push`.

## Overlay cards (`T.O`, round 3)

| Card | In | Out (gone +0.3) | Text | Notes |
|---|---|---|---|---|
| ch1 | 3.4 | 10.0 | "Opnemen." | Starts once the text column is at least 85 % dark (0.90 in 16:9, 0.92 in 4:5 at 3.4 with the slower dark). |
| ch1 subs | 3.7 / 4.0 | 6.0 | "Leg je telefoon op tafel." / "Griffel vraagt daarna door." | The instruction at sub size in grey (500); fix 5: the promise (F2) is a white headline-weight emphasis line, 700 / -0.03em, 60 px in 16:9 (722 px wide, ends x ~892) and 48 px in 4:5 (its "g" descender ends ~y 321, 50 px above the caption box at y 372). The brand and the doorvragen promise are legible in the first 5 s. Both leave at 6.0, because the captions own the second half of the recording. |
| ch2a | 11.4 | 16.3 | "Echte namen." | Comes in with "Jouw actie nodig" (F3). |
| ch2a sub | 12.0 | 16.3 | "Geen Spreker 1." | |
| ch2 | 16.6 | 21.95 | "Doorvragen." | Comes in with the questions push. Hard exit of 0.13 s, so it is gone before the climax rises in the same line box. |
| ch2 subs | 19.2 / 19.45 | 21.95 | "Iets onduidelijk?" / "Griffel vraagt het eerst aan jou." | Only after the in-app question has built, so two word-by-word builds never run at once (F2). Fix 5: larger than the sub size, grey 500: 48 px in 16:9 (one line each, the second ends x ~848, clear of the phone at ~933 and ~90 px above the returning caption) and 40 px in 4:5 (4 px higher, line pitch 1.24; glyphs end ~y 308, ~32 px above the returning caption). |
| climax | 24.0 / 24.25 | 25.85 | "Griffel raadt niet." / "Griffel vraagt." | "Griffel vraagt." rises as one block with one gradient fill. Fix 5 (the drop window is one event at a time): the tap and the "12 december" flight (22.0-22.66), the resolved caption alone at its big size (lands about 22.66-22.7, leaves 23.35, gone 23.65), then Q2 ("who") until Lisa is tapped at 23.6, then the thesis at 24.0 over the review page. The caption never sits under the thesis (act C only settles it if a re-time puts it there). The pair is fully readable from about 24.75 to 25.85 (about 1.1 s) and gone by 26.1, as the context card rises. Text-column gap: 23.65-24.0. |
| context | 26.1 / 26.35 | 27.55 | "Voeg een agenda of offerte toe." / "Griffel gebruikt die voor namen en bedragen." | Footnote size: 42 px/600 in 16:9, 38 px/600 in 4:5 (F7). Fix 5: on screen 26.1-27.8 (both lines up from about 26.6), gone before "Notulen." at 28.0. |
| ch3 | 28.0 | 30.1 | "Notulen." | Headline only, so the full frame is free for the payoff. |
| ch3 sub | 32.8 / 32.95 | 35.0 | "Besluiten en actiepunten" / "in de inbox van wie jij kiest." | Comes in alone at the top of the text box, once the payoff row has cleared it (F4). Fix 3: a 700 statement at the largest size that keeps each line on one line in the box: 62 px in 16:9 and 72 px in 4:5 (-0.03em, cv08). Readable for about 2 s, gone by 35.25. Act D's rows leave, and its trust camera starts, from `subOut`. |
| trust | 35.3 / 35.65 | 37.4 | "Verstuurd is verwijderd." / "Binnen enkele seconden gewist." | Gone by 37.65, before act E's first word at 38.0 (F5, F6). |

## Tools

- **Stills:** `node tools/still.mjs --page index.html --from <a> --to <b> --step 0.25 --out renders/stills/<you> --sheet --cols 6`. Also run it with `--page portrait.html`. Times are output times (film × 1.1; without `--to` the range runs to `T.OUT_DURATION`); add `--film` to give the film times of this storyboard instead (e.g. `--film --times 22` is the drop).
- **Phone-size check:** add `--scale 0.1875` (16:9) or `--scale 0.333` (4:5) and look at single frames.
- **Render:**
  - `bash tools/render.sh 169 draft`: 60 fps, no blur.
  - `bash tools/render.sh 169 final`: 60 fps with 8-subframe motion blur. `tools/capture_seq.mjs` captures 480 fps straight from `window.__seek` (output time, to the page's `T.OUT_DURATION`), and every 8 frames are averaged into one output frame. (`window.T_OFFSET`, in output seconds, still shifts the HyperFrames-driven render time for a multi-pass HyperFrames capture.)
  - `FINAL_FPS=30 SUB=8` captures 240 fps for 30 fps delivery (then set `T.OUT_FPS = 30` before boot so `Film.frameT` quantises to that grid).
  - `VARIANT=<name> bash tools/render.sh 169 final` renders `index-<name>.html` (4:5: `portrait-<name>.html`) to `renders/film-169-<name>-final.mp4`.
  - Both paths encode through `tools/encode_seq.py`: explicit BT.709 matrix, limited range, 16-bit blur, 1 LSB dither, tagged output.
- **Colour check:** `python tools/check_encode.py renders/film-169-final.mp4 --ref-dir <stills dir with t_000.00.png>` decodes with an explicit BT.709 matrix. It checks the end-card mark (#1ABA6D ±2), white (#FFFFFF ±1) and banding in the frame 0 gradient.
- **Viewing:** use the Read tool on the PNGs to look at them. Look at the frames like a harsh motion director: overlaps, clipped text, pops, empty frames, frozen holds, off-brand colour.

---

## Act A — Hook + Opnemen (0.0 – 10.6) · `act-a.js` · `T.A`

| t | What | Notes |
|---|---|---|
| 0.0 | **Frame 1 is a finished picture.** On the light stage, the fictional line `COPY.hook.line` ("…dan houden we de Q4-deadline aan.") sits large in Inter 700, grey #9AA1A9: 16:9 centred-left about 88 px, 4:5 centred about 76 px, wrapping allowed in 4:5. | The VOORBEELD label is already on screen (stage.js). |
| 0.05–0.7 | Karaoke: words turn ink #131417 one by one, as if spoken. | `T.A.hook.karaoke` (fix 3: ended at 1.0) |
| 0.7–1.15 | "Q4-deadline" gets a green marker sweep: a #D6FBEB highlight block behind the word, left to right, and the word becomes #12804B. The first real visual event lands before 1.0. | `T.A.hook.highlight` |
| 0.7 | The question `COPY.hook.whisper` ("En wanneer is dat?") comes in with the marker. It is readable from about 0.9 to 2.35 and gone by 2.5. | `T.A.hook.whisper` |
| 1.8–2.9 | The phone rises in from below to rest (`phoneMotion` y from +1150 to 0, house curve). Its screen is already the **recording screen** (dark). | `T.A.phoneEnter` |
| 2.0–3.4 | **Signature move 1: words become the waveform.** Each word of the line collapses horizontally into a bar (scaleX to about 4 px width, height to 0.3–0.9 × 72), then the bars fly in an arc into the phone's waveform anchor and become its bars. The whisper line fades. The bars land at exactly the waveform's screen position (`Film.phoneToScreen`), so the hand-off is pixel-accurate. After 3.4 only the phone's own waveform remains. | `T.A.hook.morph` |
| 2.0–5.4 | The lights go down (stage.js, `T.dark`: 2.0 + 3.4 s, spread 0.3). A wide vignette deepens from the frame edges toward the phone on the house curve. Each point darkens over 70 % of the move, so it reads as lights dimming, not an iris.<br>• Visible change: the stage goes from 2 % to 98 % dark between about 2.8 and 3.8 (1.0 s in 16:9, 0.93 s in 4:5).<br>• No 60 fps frame diff above 6 (it was 19.7).<br>• The stage next to the phone is still less than 10 % dark at 2.975, when the last hook bar lands.<br>• The text column is 90 % dark at 3.4.<br>"Opnemen." comes in at 3.4 and its two sub lines at 3.7 and 4.0. The subs leave at 6.0 and "Opnemen." at 10.0 (overlay-text.js). | Fix 3: this was 2.7 + 1.15 s with spread 0.5, a 0.3 s change with a bright shrinking halo. |
| 1.8–10.6 | **Recording screen**, faithful to `griffel-app/apps/mobile/src/features/recording/recording-view.tsx` and the web rebuild `griffel-website/src/components/marketing/recording-screen.tsx`. | Call `Film.darkScreen([1.8, 10.6])`. |
| | Recording screen: background #0B0B0B; top live indicator with a 10 px #FF4D2E dot pulsing between opacity 1 and 0.3 on a sine of t, plus "OPNAME LOOPT" (12 px, 700, tracking 1.6). | |
| | Recording screen: timer Inter 700 72/76, tracking −2.4, tabular. It runs 00:00 → 47:12 between 2.0 and 9.4, accelerating then easing (time compression). | `T.A.timer` |
| | Recording screen: waveform at the anchor; "Griffel schrijft mee." in muted grey under it. | |
| | Recording screen: an outlined pause button (52 px, #9C9C9C 1.5 px border, radius 10) and the stop button. | Stop: at least 64 px, radius 10, #FF4D2E, glow `0 6px 16px rgba(255,77,46,.4)`, caption "Houd ingedrukt om te stoppen". |
| 4.2–9.5 | **Meeting captions** in the overlay `ctx.L.captions` box, one after another per `T.A.captions`. Each shows a small speaker tag ("Spreker 2", #9C9C9C, 600, uppercase tracking) and the line in white at about `L.capSize`. A new caption pushes the older one up and dims it; at most 2 visible. Caption 3's "Q4-deadline" gets the same marker treatment (#1ABA6D underline/marker; on the dark stage #1ABA6D is fine as text). The captions leave by 9.6. In 4:5 the box sits between the text and the phone: keep it to 1 line per caption and shrink if needed. | |
| 8.4–9.6 | Hold-to-stop: touch-dot holds on the stop button for 1.2 s (`Film.tap({t: 8.4, hold: 1.2})`). The button fills with rgba(255,255,255,.25) left to right over 1.2 s. At 9.6 the timer freezes and the waveform settles flat over 0.3 s. | |
| 3.0–10.0 | Camera creeps slowly toward the phone so the long hold is never frozen. 16:9: z +6 %. 4:5: z 0.86 to 1.15, screen top 489 to 445. It ends on `T.handoff.AB` and does **not** return to rest; act B moves on from this framing. | |

## Act B — Processing + Sprekers benoemen (9.8 – 16.6) · `act-b.js` · `T.B`

| t | What | Notes |
|---|---|---|
| 9.8–10.8 | **Morph: the 36 waveform bars fold into the processing step list.** Bars gather and turn into the 6 step rows' left status dots and lines; the screen background goes #0B0B0B → #FFFFFF. This is the "vague time jump": add a soft white light sweep across the stage as well. | `T.B.morphBarsToSteps`; stage.js handles the dark → light stage |
| 11.4 | Overlay card "Echte namen." comes in, with "Geen Spreker 1." at 12.0 (`T.O.ch2a`, until 16.3). From 11.4 the phone must stay clear of the text column. | |
| 10.0–12.6 | **Meeting screen, working stage**, faithful to `griffel-app/apps/mobile/src/features/meetings/processing-steps.tsx` + `processing-steps-model.ts` and `app/(app)/meetings/[id].tsx` (StageHero, 80×80 rounded tile with a lucide icon, title `text-3xl`). Steps from `COPY.app.steps`. Uploaden ✓ 10.6, Transcriberen ✓ 11.0, "Sprekers benoemen" becomes active with the badge "Jouw actie nodig" at 11.4. | |
| 11.6–12.6 | Push `COPY.push.speakers` (`Film.push`), tapped at 12.35. | |
| 12.4–16.6 | **Speaker naming screen**, faithful to `griffel-app/apps/mobile/src/features/meetings/speaker-naming.tsx`. | |
| | Naming screen content: title "Wie hoor je hier?"; card for **Spreker 1** with a numbered 48 px circle, a talk-share bar and "Ongeveer 34% van het gesprek"; a "Beluister deze spreker" play-clip button; a name field. | |
| | Naming taps and fields: tap play at 12.95, then the clip progress bar runs 13.0–14.2 with a small waveform. Name field types "Lisa" 14.3–14.8 with a caret, then tap "Bevestigen" at 15.2, then a check state. A second card (Spreker 2) may peek below. **Do not show a name suggestion.** | |
| 13.0–16.2 | **Signature: the name flip.** In the overlay captions box, caption 2 returns: "SPREKER 1 · Die stuur ik wel." (ink on light now). At 15.3 the "Spreker 1" tag is struck through and replaced by "Lisa" (#12804B, slight scale settle). | Overlay text cards are on the left/top; keep the caption in `L.captions` |
| 12.6–16.3 | Camera pushes in on the naming card (z about 1.3), then pans to `T.handoff.BC` (the top of the phone) by 16.3 instead of returning to rest. In 16:9 keep the card right of x = 1000. | |

## Act C — Doorvragen + drop + send setup (16.2 – 28.0) · `act-c.js` · `T.C`

| t | What | Notes |
|---|---|---|
| 16.2–17.1 | Push `COPY.push.questions`, tapped at 16.9. The camera starts from `T.handoff.BC`. "Doorvragen." comes in at 16.6. | |
| 17.0–24.25 | **QuestionWizard**, faithful to `QuestionWizard` in `griffel-app/apps/mobile/app/(app)/meetings/[id].tsx` (lines about 796–1080). Header "Stap 1 van 2 · Vragen"; question `text-2xl font-bold` (24 px). Options: at least 56 px tall, hairline border, radius 10; a selected option gets bg #D6FBEB, text #00301B and a CheckCircle2 icon. "Of zelf invullen" field; "Vraag overslaan" text button. | |
| 17.4–19.6 | **Signature: the question builds word by word** (Apple Live Translate grammar): each word fades and rises in. `COPY.q1.text`, with "de Q4-deadline" lightly highlighted. The camera pushes in so the question nearly fills the phone width (z about 1.45 toward the question), then eases back to about z 1.2 by 20.4 to show the options. | |
| 19.8 / 20.1 / 20.4 | Options appear: "12 december", "19 december", "Er is nog geen datum". "Vraag overslaan" at 20.7. | |
| 24.0–26.1 | Overlay thesis "Griffel raadt niet." (24.0) / "Griffel vraagt." (24.25), out at 25.85, gone by 26.1. "Doorvragen." has a hard exit at 21.95. 22.0–23.65 belongs to the drop's caption swap: the copy lands about 22.66, the resolved caption reads alone at its big size and leaves as one block at 23.35 (gone 23.65). In 16:9 its layout is locked before the swap ("…dan houden we" / slot / "aan.", "aan." keeps its own line), so nothing reflows. | Fix 5 moved the thesis from 23.2 / 23.45 (final polish: from 22.7 / 22.95). |
| 22.0 | **DROP.** Touch-dot taps "12 december" at exactly 22.0, and the option turns selected at 22.05. Add a camera punch-in of +4 % that settles over 0.6 s, the only accent in the film. 250 ms later (the real app's auto-advance) the step advances. | |
| 22.3–24.25 | Step 2 of 2: `COPY.q2` "Wie stuurt de offerte naar de klant?" with options Lisa / Daan / Sanne (pushed in 22.30-22.65); tap Lisa at 23.6, selected, advance (the review is pushed over it 23.90-24.25). The camera keeps about 150 px of headroom over the question until the tap. | Fix 5 moved the tap from 23.15. |
| 23.9–28.0 | **Send setup** ("Klaar om te versturen"), faithful to `NotesSetupCard` in `[id].tsx` (about line 1256). Rows: Onderwerp "Projectoverleg nieuwe website"; **Context** row, tap on "Bestand toevoegen" at 25.95, the file row "Offerte-website.pdf" lands from 26.15 (SFX tick) as the context card rises (26.1); one scroll (26.17–26.57) brings "Wie krijgt de notulen?" and the "Eerder gebruikt" rows up; the rows are tapped bottom-up at 26.61 / 26.83 / 27.05 and the chips Lisa, Daan and Sanne pop at 26.73, 26.95 and 27.17 (`T.C.recipients[1..3]`, the SFX pops) next to `Jij — altijd` (lock icon); the solid ink button "Notulen versturen" is tapped at 27.5, act D covers at 27.6. Camera: calm under the thesis (24.0–26.1); from 25.6 one slow push in on the lower half of the review page that holds the context tap, the scroll, the three recipient taps and the send tap in one framing. 16:9: z 2.3 with the phone's left screen edge at x 1000, so the chips read at 26-28 px and the names at ~32 px. 4:5: the text box caps the zoom: the phone rises under the context footnote (top bezel ~210, z 1.32) with every tap in frame (Lisa's row was cut before); chips ~16 px. Then one slow pull-out to rest (27.3–30.0, house curve, so it barely moves until the send tap; peak 60 fps frame diff about 7 in 16:9, was 11.2), with act D's camera key blending in from 27.6. | Fix 5 moved the context tap from 25.45, the file from 25.7, the pops from 26.32-26.82 and the send tap from 27.2. |

## Act D — Notulen + trust (27.6 – 38.0) · `act-d.js` · `T.D`

| t | What | Notes |
|---|---|---|
| 27.6–27.9 | The phone shows the "Notulen onderweg" stage (StageHero with a Send icon). A soft light sweep marks the time jump. | |
| 27.9–29.1 | **Signature: the notulen e-mail unfolds out of the phone** (`T.D.emailUnfold`; fix 5 moved it from 28.4, so it plays during act C's slow pull-out and the frame is never a small phone on empty white). A 600 px e-mail card, rebuilt from `griffel-app/packages/emails/src/summary-email.tsx` + `components.tsx` + `theme.ts`, grows out of the phone screen rect into a large card in the world. The phone slides aside or behind (`phoneMotion`). | |
| | E-mail card structure: white; 3 px #09FE94 top keyline; Griffel wordmark (`MARK`) left with tag "NOTULEN"; hairline; "Je meeting-notulen"; intro; BESPROKEN bullets; **ACTIES · 3** rows with 20×20 number badges (#D6FBEB on #00301B); BESLUITEN · 2; privacy callout (3 px mint bar on #F6F8F7, `COPY.email.privacy`); footer. | Set it in Inter like the rest of the film (the real mail uses Helvetica/Arial; Inter keeps the film consistent and ships as a file). Content from `COPY.email`. |
| 28.0–30.1 | Overlay "Notulen." alone (headline only, gone by 30.4). | |
| 30.1–32.6 | Camera zooms to ACTIES row 1 (`T.D.zoomAction` [30.1, 1.0]): "**Lisa** stuurt de offerte naar de klant · **12 december**". Lisa and 12 december get the marker highlight; this is the payoff of the naming and the question. The fully highlighted row holds from 31.0 to 32.6 (`holdAction`). | The text column is empty from 30.4 to 32.8, so the payoff may use the full frame. |
| 32.6–33.8 | **Fan-out** (`fanOut` [32.6, 1.2]): the e-mail card shrinks into three inbox rows or cards, one per team member. Each row has an avatar circle L/D/S with initials, sender "Griffel", subject `COPY.email.inboxSubject` (the meeting subject) and preheader `COPY.email.inboxPreheader`, truncated with an ellipsis. They land with soft ticks at 32.9, 33.2 and 33.5. The overlay "Besluiten en actiepunten / in de inbox van wie jij kiest." comes in alone at 32.8 / 32.95 and leaves at 35.0 (62 px in 16:9, 72 px in 4:5), so keep the rows clear of the text box. | |
| 33.9–34.6 | Camera and phone return (`backToPhone` [33.9, 0.7]); the phone shows the "Verstuurd" stage (StageHero with a check icon on a mint tile, title "Verstuurd"). | There is no "verstuurd" push any more (`pushSent` removed). |
| 35.7 / 36.05 / 36.4 | **Wipe beat:** three small chips in the world next to the phone (not inside the app UI): "Opname", "Transcriptie", "Vragen". They dissolve one by one (strike line, then fade with blur and a 6 px drop). The overlay says "Verstuurd is verwijderd." (35.3) / "Binnen enkele seconden gewist." (35.65), out at 37.4. In 16:9 the chips sit between the text column and the phone, x about 960–1100, or below the phone; in 4:5 just above the phone. The camera ends on `T.handoff.DE` by 38.0, not on rest. | |

## Act E — Outro + logo + end card (38.0 – 48.0) · `act-e.js` · `T.E`

| t | What | Notes |
|---|---|---|
| 38.0 / 38.5 / 39.0 | The three chapter words stack on the beats: "Opnemen." "Doorvragen." "Notulen.", Inter 700 about 96 px, left column in 16:9 and top in 4:5. "Doorvragen." is in `.hl-green-dark`. They are gone by 40.0 (`T.E.stackOut` 39.7). Act E starts from `T.handoff.DE`. | |
| 38.0–38.6 | No reprise (round 2). The "Verstuurd" screen dissolves, which removes the meeting subject by 38.6, when the VOORBEELD label is gone. | Cutting the reprise removes about 8 s with no new information, where muted viewers dropped off. |
| 39.5–42.0 | **Signature: the logo assembles itself** (`collapse` [39.5, 2.5]; since fix 3 the phone starts dissolving under the stack). The phone frame dissolves; the 36 waveform bars converge into the mark's 5 rounded bars (`MARK.bars`); the 4 bracket corners (`MARK.brackets`, paths) fly in from the old phone corners and lock around them at 42.0 (`T.E.lock`, the downbeat of bar 22; re-check against the licensed track's hit), with one 4 % settle. The stage is light again; the mark is #1ABA6D, never #09FE94. | |
| 42.0–42.55 | The mark slides left and the wordmark (`MARK.wordmark` paths, #121316) reveals from behind it by a mask (`wordmark` [42.0, 0.55]). | |
| 42.45–48.0 | **End card = poster** (`endCard` 42.45; `endLines` 42.55 / 42.8 / 43.0 / 43.2 / 43.4). The slogan follows the lockup. The complete poster holds from about 43.75 to 48.0 (about 4.25 s), and the URL for about 5 s. Lines in this order: logo; `COPY.end.slogan` "De AI-notulist die doorvraagt." (about 44 px, ink); `COPY.end.offer` "Gratis: 3 meetings per maand." plus `COPY.end.url` "griffel.ai" (bold); small `COPY.end.fine` (#6B7280). | |
| 43.2–48.0 | End-card badges: the official NL store badges from `assets/badges/app-store-nl.svg` and `assets/badges/google-play-nl.png`, unmodified, at equal height (about 56 px in 16:9), side by side under the offer. | |
| 42.45–48.0 | Hold to 48.0 with a slow 1.5 % zoom drift. The stage uses the website hero look; you may strengthen the green gradient for the end card. | |
