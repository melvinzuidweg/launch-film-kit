/*
 * Timeline: the single source of truth for WHEN. Every time in the film lives here; parts read
 * T.* and never hard-code a time that exists here. Strings live in src/copy.js, colours in
 * src/tokens.css.
 *
 * Grid. The film is written on a bar grid (default 120 BPM: one bar = 2.0 s, one beat = 0.5 s).
 * Put key events on whole bars (the hook, the key tap = DROP, the logo lock): then a music edit
 * that jumps N bars stays on the beat. Pick the music (its BPM and the position of its drop)
 * BEFORE you polish, and build on its grid.
 *
 * Time scale. Every time in this file is FILM time. The video plays SCALE times slower than it
 * is written: OUTPUT time (the rendered video, the runtime, the stills, the audio cues) = film
 * time x SCALE. Typical use: the film is written on a 120 BPM grid and the chosen track is
 * 110 BPM, so SCALE = 120 / 110 and every film beat lands on a music beat (the film runs ~9 %
 * longer). Film.render converts back; act code never sees output time. A page may set
 * window.TIME_SCALE before this file to override SCALE (e.g. for a variant cut).
 *
 * Overlay text (T.O): an `out` time means "starts leaving at out, gone by out + 0.25" (the
 * Film.type block exit). Never two cards in the text box at once: every card's goneAt <= the next
 * card's `in`. Keep each card fully readable for >= 1.8 s for a thesis line.
 *
 * Ownership: one person (or one agent) edits this file. Parallel edits to shared files were the
 * main source of transient breakage when acts were built in parallel.
 */
(function (G) {
  // uniform slow-down of the whole film (1 = as written); see the header
  const SCALE = Number.isFinite(Number(G.TIME_SCALE)) && Number(G.TIME_SCALE) > 0 ? Number(G.TIME_SCALE) : 1;
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

  const T = {
    BPM, BEAT, BAR, bar,
    DURATION: 12.0,           // film length (film time): 6 bars
    DROP: bar(3),             // 4.0: the key moment (the tap that answers the hook); the music drop lands here

    // ---- time scale (see the header) -----------------------------------------------------------
    // Derived values are getters, so a page that changes DURATION or SCALE before Film.boot()
    // still gets a consistent output length. Change them only before boot.
    SCALE,
    get OUT_DURATION() { return r6(this.DURATION * this.SCALE); },
    get OUT_DROP() { return r6(this.DROP * this.SCALE); },
    OUT_FPS: 60,                                  // delivery frame rate: Film.frameT quantises to this grid
    toOut(t) { return r6(t * T.SCALE); },         // film time -> output time
    toFilm(t) { return Math.round((t / T.SCALE) * 1e9) / 1e9; }, // output time -> film time, snapped to 1e-9 s

    frame: { "169": frame(1920, 1080), "45": frame(1080, 1350) },

    // Optional dark act (stage.js): the stage dims from the frame edges toward the phone (a
    // feathered vignette, never a hard iris) and later returns. null = always light. Example:
    //   dark: { inStart: 2.0, inDur: 3.4, spread: 0.3, outStart: 9.8, outDur: 0.8, spreadOut: 0.5 },
    // Mark the phone screen dark too (Film.darkScreen) if the app screen is dark in that window.
    dark: null,

    // the "Example" label is visible while fictional content is legible (stage.js)
    exampleLabel: [-0.4, 7.6],

    // Camera hand-offs between acts: the outgoing act ends ON this framing (landed by `t`) and the
    // incoming act starts FROM it (Film.handoff("AB")). One act in this example, so none defined:
    //   AB: { t: 10.0, "169": { cx: -362, cy: 6, z: 1.06 }, "45": frame(1080, 1350)(196.5, 0, 540, 445, 1.15) },
    handoff: {},

    // ---- the example act (src/parts/act-example.js), 0 - 12 -------------------------------------
    EX: {
      // bar 1: the hook. Frame 0 is a finished poster; the marker sweep is the first-second event.
      hook: { marker: [0.4, 0.45], out: 1.7 },            // out: the block leaves 1.7, gone 1.95
      // the phone peeks in from frame 0, creeps up linearly and runs into the rise to rest
      phone: { creep: [0.0, 2.0], rise: [1.3, 1.1] },
      // bar 2: chapter card (T.O.ch1) and a camera push-in onto the task card
      camIn: [2.4, 1.2],
      // bar 3: the key tap on the drop, then the result, then (0.7 s later) the thesis line
      tapAssign: bar(3),                                  // == DROP
      metaFlip: bar(3) + 0.15,
      push: { t: 5.3, dur: 0.85, tapAt: 6.1 },            // banner in 5.3, tapped 6.1, leaves 6.15
      screenPush: [6.15, 0.35],                           // in-phone screen change: an iOS-style push, never a cut
      typeLine: [6.5, 40],                                // [start, characters per second]
      // back to the rest framing. 1.4 s, not 1.2: the 4:5 zoom-out from 1.56 to 0.86 peaked at a
      // frame difference of 6.4 on the draft at 1.2 s and 5.2 at 1.4 s (qa_motion.py --peak-max 6)
      camOut: [6.3, 1.4],
      // bar 4-6: outro. The phone leaves, the logo assembles IN PLACE and locks on bar 5
      phoneExit: [7.35, 0.65],
      logo: [7.45, 0.55],                                 // parts fade/scale in at their final position
      lock: bar(5),                                       // 8.0: put this on a music hit
      wordmark: [bar(5), 0.5],                            // product name wipes on after the lock
      endLines: [8.15, 8.35, 8.55],                       // slogan, offer + URL, fine print: poster complete ~9.0
    },

    // ---- overlay text cards (src/parts/overlay-text.js; copy in COPY.cards) ---------------------
    O: {
      ch1: { in: bar(2), sub: [2.35], out: 4.3 },         // "Assign." + sub; gone 4.55
      thesis: { in: 4.7, lines: [4.7, 4.95], out: 7.0 },  // 0.7 s after the drop tap; gone 7.25
    },
  };

  G.T = T;
})(window);
