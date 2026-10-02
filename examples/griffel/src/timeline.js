/*
 * Single source of truth for timing. Grid: 120 BPM (temp grid for "Eternal Afternoon",
 * Epidemic Sound), so one bar = 2.0 s and one beat = 0.5 s. The music drop lands on DROP,
 * the tap on the answer to Griffel's question. Re-time by changing BPM/DROP after the
 * licensed track is analysed.
 *
 * Ownership: each act part owns the visuals inside its window; the windows overlap on
 * purpose so the incoming act covers the outgoing one (no gaps, no hard cuts).
 *
 * Overlay text (T.O): an `out` time means "starts leaving at out, gone by out + 0.3"
 * (Film.type exits a block as one unit; Film.type.goneAt(out) gives the exact time).
 * Rule: never two cards in the text box at once, so every card's goneAt <= the next card's in.
 *
 * Time scale (SCALE): every time in this file is FILM time. The film plays SCALE times slower than
 * it is written: OUTPUT time (the rendered video, the runtime, the stills, the audio cues) is
 * film time x SCALE, so the output runs OUT_DURATION = DURATION x SCALE seconds and the music drop
 * lands at DROP x SCALE in the video. Film.render converts back (film = output / SCALE); act code
 * never sees output time. A page may set window.TIME_SCALE before this file to override SCALE.
 */
(function (G) {
  // uniform slow-down of the whole film (1 = as written); see the header
  const SCALE = Number.isFinite(Number(G.TIME_SCALE)) && Number(G.TIME_SCALE) > 0 ? Number(G.TIME_SCALE) : 120 / 110; // 120 BPM film grid played at 110 BPM (Uppbeat tracks: Just Flow, One More Chance)
  // clean decimals for output times (48 x 1.1 = 52.800000000000004 in floating point)
  const r6 = (v) => Math.round(v * 1e6) / 1e6;
  const BPM = 120;
  const BEAT = 60 / BPM;      // 0.5
  const BAR = BEAT * 4;       // 2.0
  const bar = (n) => (n - 1) * BAR; // start of bar n (1-based)

  // camera framing that puts phone logical point (lx, ly) at screen (sx, sy) with zoom z.
  // The phone centre (196.5, 426) is the world origin; W/H are the output size per format.
  const frame = (W, H) => (lx, ly, sx, sy, z) => ({
    cx: +(lx - 196.5 - (sx - W / 2) / z).toFixed(2),
    cy: +(ly - 426 - (sy - H / 2) / z).toFixed(2),
    z,
  });
  const f169 = frame(1920, 1080), f45 = frame(1080, 1350);

  const T = {
    BPM, BEAT, BAR, bar,
    DURATION: 48.0,
    DROP: 22.0,

    // ---- time scale (see the header) ------------------------------------------------------
    // Read the derived values live (getters), so a page that changes DURATION or SCALE before
    // Film.boot() still gets a consistent output length. Change them only before boot.
    SCALE,
    get OUT_DURATION() { return r6(this.DURATION * this.SCALE); }, // 52.8 at SCALE 1.1
    get OUT_DROP() { return r6(this.DROP * this.SCALE); },         // the music drop in the video: 24.2
    OUT_FPS: 60,                                // delivery frame rate: Film.frameT quantises to this grid
    toOut(t) { return r6(t * T.SCALE); },        // film time -> output time
    toFilm(t) { return Math.round((t / T.SCALE) * 1e9) / 1e9; }, // output time -> film time, snapped to 1e-9 s

    // stage light/dark schedule (stage.js). Light -> dark recording act -> light.
    // The dark comes in as a wide vignette deepening from the frame edges toward the phone, slowly
    // (fix 3): the lights go down over about 1 s (2 %-98 % of the stage 2.8-3.8), each point over
    // 70 % of the move (spread 0.3), no frame diff above ~8 at 60 fps. The stage next to the phone
    // is still < 10 % dark at 2.975 (every hook bar has landed), the text column is >= 85 % dark
    // by 3.4 when "Opnemen." rises (T.O.ch1.in). The way back keeps the round-2 front (spreadOut
    // 0.5) and is drawn by act B's light front; stage.js only has to be dark-free by outStart + outDur.
    dark: { inStart: 2.0, inDur: 3.4, spread: 0.3, outStart: 9.8, outDur: 0.8, spreadOut: 0.5 },

    // VOORBEELD label visible while meeting content is legible: until act E's dissolve of the
    // "Verstuurd" screen has removed the meeting subject
    voorbeeld: [-0.4, 38.6],

    // ---- camera hand-offs between acts -------------------------------------------------------
    // The outgoing act ends ON this framing (landed by `t`) and the incoming act starts FROM it,
    // so the camera never returns to rest just to leave it again. Read with Film.handoff("AB").
    // Where no hand-off is defined, the old rule holds: return to the rest camera (L.cam0).
    handoff: {
      // act A's creep framing; act A simply stays on it, act B leaves from it. 16:9: rest + 6 %.
      // 4:5 (fix 3): z 1.15 with the screen top pinned at y 445 (under the caption box, which ends
      // ~411), so the 6.5 s dark act is a slow even push to a phone that fills the frame, and act B
      // starts close to BC (z 1.25, top 440) with no zoom reversal
      AB: { t: 10.0, "169": { cx: -362, cy: 6, z: 1.06 }, "45": f45(196.5, 0, 540, 445, 1.15) },
      // the top of the phone, where the questions push lands. 16:9: banner (logical y 110) at
      // screen (1340, 300), phone left edge ~1035 (text column ends at 950). 4:5: phone top pinned
      // at y 440, under act B's caption box (ends ~411)
      BC: { t: 16.3, "169": f169(196.5, 110, 1340, 300, 1.45), "45": f45(196.5, 0, 540, 440, 1.25) },
      // act E's opening framing: text column free for the outro words. 16:9 (fix 3): cx -255 puts
      // the phone's left bezel at x ~1002 (it was ~877, inside the 950 px text column), so act D's
      // hand-off is one key and "Doorvragen." has >= 150 px of air at the landing
      DE: { t: 38.0, "169": { cx: -255, cy: 0, z: 0.94 }, "45": { cx: 0, cy: -120, z: 0.8 } },
    },

    // ---- Act A: hook + recording (0 - 10.6) --------------------------------
    A: {
      start: 0.0, end: 10.6,
      // fix 3: the marker sweep lands before 1.0, so the hook has a real visual event in its first
      // second; "En wanneer is dat?" reads from ~0.9 to 2.35
      hook: { karaoke: [0.05, 0.7], highlight: [0.7, 0.45], whisper: 0.7, morph: [2.0, 1.4] },
      phoneEnter: [1.8, 1.1],        // phone rises in from below
      recScreen: [1.8, 10.6],        // recording screen visible (owned by A)
      timer: { start: 2.0, end: 9.4, from: 0, to: 47 * 60 + 12 }, // 00:00 -> 47:12 (compressed)
      captions: [[4.2, 6.2], [5.6, 7.8], [7.2, 9.5]],
      holdStop: [8.4, 1.2],          // real app: hold 1.2 s fills the stop button
    },

    // ---- Act B: processing + speaker naming (9.8 - 16.6) -------------------
    B: {
      start: 9.8, end: 16.6,
      morphBarsToSteps: [9.8, 1.0],
      stepsDone: [10.6, 11.0],       // Uploaden, Transcriberen check off
      stepAction: 11.4,              // "Sprekers benoemen" -> Jouw actie nodig (+ "Echte namen.")
      pushSpeakers: [11.6, 1.0],     // banner in, tap at tapPush
      tapPush: 12.35,
      naming: [12.4, 16.6],
      tapPlay: 12.95,
      clip: [13.0, 1.2],
      typeName: [14.3, 0.5],
      tapConfirm: 15.2,
      nameFlip: 15.3,                // overlay caption: Spreker 1 -> Lisa
    },

    // ---- Act C: questions + drop + send setup (16.2 - 28.0) ----------------
    // fix 5: the drop window is one event at a time. 22.0 tap + the "12 december" flight (lands
    // ~22.66), the big caption reads alone and leaves 23.35-23.65, Q2 ("who") has the frame until
    // Lisa is tapped at 23.6, the thesis rises at 24.0 over the review page. Then the context tap
    // with the context card, the scroll, three recipient taps held close, the send tap.
    C: {
      start: 16.2, end: 28.0,
      pushQuestions: [16.2, 0.9],
      tapPush: 16.9,
      wizard: [17.0, 24.25],
      q1Build: [17.4, 2.2],          // question builds word by word
      q1Options: [19.8, 20.1, 20.4],
      q1Skip: 20.7,
      tapAnswer: 22.0,               // == DROP
      autoAdvance: 0.25,             // real app: auto-advance after 250 ms
      q2: [22.3, 24.25],             // pushed in 22.30-22.65, pushed out by the review 23.90-24.25
      tapQ2: 23.6,                   // fix 5 (was 23.15): Q2 reads ~0.95 s on its own first
      setup: [23.9, 28.0],
      tapContext: 25.95,             // the context tap lands with the context card (O.context.a 26.1)
      contextFile: 26.15,            // file row lands (SFX tick); the scroll to the recipients starts with it
      // [0] the scroll cue; [1..3] the chip pops Lisa / Daan / Sanne (SFX pops; act C taps each
      // row 0.12 s before its chip pops), held close; the last chip wraps by ~27.5
      recipients: [26.17, 26.73, 26.95, 27.17],
      tapSend: 27.5,                 // the last row has closed and the wrap has landed; act D covers at 27.6
    },

    // ---- Act D: notulen payoff + trust beat (27.6 - 38.0) ------------------
    D: {
      start: 27.6, end: 38.0,
      sending: [27.6, 28.4],
      emailUnfold: [27.9, 1.2],      // fix 5 (was 28.4): unfolds during act C's slow pull-out, no empty frame
      zoomAction: [30.1, 1.0],       // "Notulen." is gone by 30.4: the full frame is the payoff's
      holdAction: [31.0, 32.6],      // fully highlighted ACTIES row 1 holds 1.6 s
      fanOut: [32.6, 1.2],
      inboxTicks: [32.9, 33.2, 33.5],
      backToPhone: [33.9, 0.7],
      wipe: [35.7, 36.05, 36.4],     // fix 3: after the longer ch3 sub; chips gone before E's 38.0
    },

    // ---- Act E: outro + logo sting + end card (38.0 - 48.0) ----------------
    // No reprise: the outro words stack over the "Verstuurd" phone, the phone starts dissolving
    // under the stack (39.5) and the logo builds over bar 21, locking on the downbeat of bar 22
    // (42.0). Re-check `lock` against the licensed track's hit once it is analysed.
    E: {
      start: 38.0, end: 48.0,
      stack: [38.0, 38.5, 39.0],     // on the beats
      stackOut: 39.7,                // outro words gone by 40.0
      collapse: [39.5, 2.5],         // fix 3: the phone starts dissolving under the stack; bars -> 5 logo bars, brackets lock
      lock: 42.0,                    // bracket lock on the music hit (bar 22 downbeat)
      wordmark: [42.0, 0.55],
      endCard: 42.45,
      endLines: [42.55, 42.8, 43.0, 43.2, 43.4], // poster complete ~43.75, holds ~4.25 s
    },

    // ---- overlay text cards (overlay-text.js) ------------------------------
    // Text-column gaps stay <= 1.4 s, except 30.4-32.8: the frame belongs to the payoff row.
    O: {
      // fix 3: two sub lines, the second is the brand promise (F2). "Opnemen." waits for the slower
      // dark (text column >= 85 % dark at 3.4); both subs leave at 6.0: the captions own 6-9.6
      ch1: { in: 3.4, sub: [3.7, 4.0], subOut: 6.0, out: 10.0 },
      ch2a: { in: 11.4, sub: 12.0, out: 16.3 },                      // "Echte namen." / "Geen Spreker 1."
      ch2: { in: 16.6, sub: [19.2, 19.45], out: 21.95, exit: 0.13 }, // subs after Q1 has built; hard exit
      // fix 5: the drop's caption swap (22.0-22.66) and Q2 (Lisa tapped 23.6) come first; the thesis
      // rises over the review page and is fully readable ~24.75-25.85, gone 26.1. Text-column gap
      // 23.65-24.0 (the caption leaves before the tap on Lisa)
      climax: { a: 24.0, b: 24.25, out: 25.85 },
      context: { a: 26.1, b: 26.35, out: 27.55 },                    // footnote size; 1.45 s up, gone 27.8
      ch3: { in: 28.0, out: 30.1, sub: [32.8, 32.95], subOut: 35.0 },// headline alone; sub alone later (fix 3: 2 s readable, gone 35.25)
      trust: { a: 35.3, b: 35.65, out: 37.4 },                       // fix 3: gone 37.65, before act E at 38.0
    },
  };

  // ---- DEPRECATED aliases, kept only while an act part still reads them (remove after) ------

  G.T = T;
})(window);
