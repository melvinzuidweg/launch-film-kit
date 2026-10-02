/*
 * Act B: Processing + Sprekers benoemen (9.8 - 16.6). Spec: docs/storyboard.md (Act B).
 * Times: src/timeline.js (T.B, T.handoff, T.O.ch2a). Everything below is a pure function of t.
 *
 *  9.8 - 10.0  Act A's recording chrome (live dot, timer, buttons) fades and blurs away under a
 *              dark sheet, so only the 36 bars are left when the morph starts.
 *  9.82- 10.38 Morph, on the still-dark screen. The 36 bars (taken over pixel-exact from act A,
 *              same maths) break into the chunks they become: 4 bars per status dot, 2-3 per
 *              connector. Each chunk leaves as one piece (6 ms after its left neighbour), rises to
 *              a full bar (16-20 px tall, 4 px wide, so >= 12 px on screen in both formats) and
 *              travels straight to its row in the status-dot column, where its bars close up into
 *              the dot (an 18 px disc, the size of the app's status ring) or the 2 x 16 px line.
 *              Green on dark the whole way: the bars form the step list's spine before the light.
 * 10.1 - 11.18 Light: one plain, even crossfade of the stage and the screen together (no disc, no
 *              front): the stage's dark sheet fades out over a replica of stage.js' light look,
 *              and the screen's white page (with the working stage on it) fades in over the dark
 *              screen while the green spine fades out over the page's own dots. Even rate (a
 *              constant-speed core with 0.12 s soft ends, 10-90 % in ~0.77 s), so a 60 fps frame
 *              changes ~1/58 of the whole change (~4.2 grey levels of the mean, <= ~4.7). It
 *              starts once "Opnemen." is past its fastest exit frames, and the bars are home
 *              while the screen is under 25 % light. While it is on, Film.stageDark answers
 *              1 - its progress (overlay and label colours) and the status bar turns
 *              dark-on-light at 45 %.
 * 10.1 - 12.4  Meeting screen, working stage (app/(app)/meetings/[id].tsx), on the page that fades
 *              in: top row, StageHero (title rises from 10.25), ProcessingSteps
 *              (processing-steps.tsx). Uploaden done 10.6, Transcriberen done 11.0, Sprekers
 *              benoemen -> "Jouw actie nodig" 11.4.
 * 11.6 - 12.43 Push "Sprekers benoemen", tapped at 12.35 (the banner leaves at the tap).
 * 12.42- 15.36 Speaker naming (speaker-naming.tsx) is pushed in from the right (house, 0.35 s)
 *              over the working stage, which moves 30 % left and dims 10 % under it; the top row
 *              and the status bar stay put. Play the clip, scroll to the name field, type "Lisa",
 *              scroll to Bevestigen, tap. One move at a time.
 * 15.36- 16.6  The same push in reverse: the naming screen leaves to the right and the working
 *              stage (top row included) comes back from -30 %: "Sprekers benoemen" checks off,
 *              "Vragen" starts.
 * 13.0 - 16.55 Signature (overlay captions box): "Spreker 1 · Die pakken we wel op." while the clip
 *              plays (karaoke + a small waveform). Right after the confirm, "Spreker 1" is struck
 *              through and "Lisa" takes its place. One 44 px line in both formats: 4:5 between text
 *              and phone, 16:9 at the top of L.captions (ends at x ~910, phone bezel at ~1035).
 *
 * Camera: one take. It starts from act A's creep framing (T.handoff.AB), holds while the light
 * comes up (so the push and the light never add up in the same frames), and pushes in once the
 * light is done (both formats ~11.08; 16:9 1.0 s, 4:5 0.9 s + the overlapping key to the naming
 * card): it holds (with a slow drift) on the step list, the push and the naming card, then pans to
 * T.handoff.BC (top of the phone, where act C's push lands) by its t. 4:5 adds a slow +5 % push
 * toward the name field (13.0 - 15.2) and folds the way back to BC's z 1.25 into the BC move,
 * which starts right where the push ends.
 *
 * Phone screen z-index 12: above act A's recording screen (4), below act C's wizard (24).
 */
(function () {
  "use strict";
  const { Film, Eng } = window;
  const { clamp, lerp, P, E, hash, noise1, spring, mixHex } = Eng;
  const T = window.T, B = T.B, COPY = window.COPY, APP = COPY.app;
  const F45 = Film.format === "45";
  const px = (v) => v.toFixed(2) + "px";

  // Verbatim griffel-app nl.ts strings this act needs that copy.js does not carry (yet).
  const NL = {
    workingTitle: "Griffel is aan het werk",                                           // meeting.stage.working.title
    workingDesc: "Je kunt de app sluiten. Je krijgt een melding als er vragen zijn.",   // meeting.stage.working.description
    speakersDesc: "Griffel herkende meerdere sprekers. Geef ze een naam voor duidelijkere notulen. Weet je een naam niet? Laat het veld leeg.", // meeting.speakers.description
    placeholder: "Bijvoorbeeld: Thomas",                                                // meeting.speakers.inputPlaceholder
    fragment: (c, n) => `Fragment ${c}/${n}`,                                           // meeting.speakers.clipProgress
    clipTime: (e, n) => `${e} / ${n}`,                                                  // meeting.speakers.clipTime
    saveNames: "Bewaar deze namen voor volgende meetings",                              // meeting.names.save.label
    skip: "Overslaan",                                                                  // meeting.speakers.skip
    submitting: "Versturen...",                                                         // meeting.speakers.submitting
  };
  // Fictional talk shares for Spreker 2 and 3 (docs/demo-meeting.md only fixes Spreker 1 at 34 %).
  const SHARES = [34, 41, 25];

  // app tokens (griffel-app global.css / theme tokens, light)
  const K = {
    ink: "#131417", muted: "#6B7280", faint: "#9AA1A9", border: "#E8EAED", surfaceMuted: "#F6F7F8",
    mint: "#D6FBEB", mintInk: "#00301B", greenInk: "#12804B", brand: "#1ABA6D", accent: "#09FE94",
    track: "rgba(19,20,23,0.20)", onInk: "#FAFAFA", rec: "#0B0B0B", body: "#3F454D",
    connDone: "#A6B7AF",            // accent-foreground (#00301B) at 35 % on white
    placeholder: "rgba(107,114,128,0.5)",
  };
  // stage.js' light look (white, rising brand green, soft rings; both a far plane with stage.js'
  // depth maths), repeated under this act's dark sheet so the hand-back to stage.js is seamless
  const DEPTH = { k: 0.18, max: 0.0325, z: 0.03, ext: 1.25 };

  // lucide icons (24 grid, round caps)
  const IC = {
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    checkCircle2: '<circle class="cc-c" cx="12" cy="12" r="10" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><path class="cc-k" d="m9 12 2 2 4-4" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    square: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
  };
  function svg(name, size, color, sw = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block;overflow:visible">${IC[name]}</svg>`;
  }
  const abs = (parent, style, text) => Film.el("div", "abs", parent, style, text);
  const div = (parent, style, text) => Film.el("div", null, parent, style, text);
  const span = (parent, style, text) => Film.el("span", null, parent, style, text);
  function setText(e, s) { if (e._t !== s) { e.textContent = s; e._t = s; } }

  // ---- geometry (phone logical px) ---------------------------------------------------------
  const SW = 393, SH = 852, X0 = 20, CW = 353, VIEW_TOP = 59;
  // recording waveform contract (identical maths to act A, so the hand-off is pixel-exact)
  const NB = 36, BAR_W = 4, BAR_STEP = 8, WAVE_H = 72, WAVE_CX = 196.5, WAVE_CY = 430;
  // working stage: top row, StageHero (pt-6, 80 px tile, gap-5, text-3xl, gap-2.5), steps card
  const WK = { top: 75, tile: 159, title: 259, desc: 305, card: 369, cardH: 290 };
  const IN = 21;                                   // card hairline 1 + CardContent px-5 / py-2+py-3
  const ROW0 = WK.card + IN, ROW = 44;             // step rows: 28 px + 16 px connector
  const SPINE_X = IN + 14;                         // icon column, card-relative
  const ICON_CX = X0 + SPINE_X, iconCY = (k) => ROW0 + 14 + ROW * k;
  const SPINE = { top: ROW0 + 2, bot: ROW0 + ROW * 5 + 26 };
  // naming screen (speaker-naming.tsx): title 135, description 179 (3 lines), cards from 263
  const NM = { title: 135, desc: 179, cards: 263, cardH: 236 };
  const PROG = 24;                                 // gap-2 + 16 px clip-progress row (card 1, playing)
  const PLAY_W = 14 + 13 + 8 + 149 + 14;          // play button: px-3.5, icon 13, gap-2, label
  const PLAY_CY = NM.cards + 25 + 48 + 16 + 19;   // 371
  const INPUT_CY = NM.cards + 25 + 48 + 16 + 38 + PROG + 16 + 20 + 8 + 20;   // 478 (row open)
  const CONFIRM_CY0 = NM.cards + 3 * NM.cardH + 2 * 16 + PROG + 24 + 20 + 24 + 22; // 1117
  // The page ends at Overslaan (1191) + pb-16 (64) = 1255, so it scrolls at most 1255 - 852 = 403.
  // Two scrolls, one move at a time: S1 while the clip plays (card 1's header stays in view, the
  // name field moves up), S2 after "Lisa" is typed (Bevestigen comes up to 714).
  const SCROLL_MAX = 1255 - SH;
  const S1 = 220, S2 = SCROLL_MAX - S1;
  const CONFIRM_CY = CONFIRM_CY0 - SCROLL_MAX;     // 714

  // ---- timing (all derived from T.B / T.handoff / T.O) -----------------------------------------
  const m0 = B.morphBarsToSteps[0];
  const stageLightEnd = T.dark.outStart + T.dark.outDur;     // stage.js is dark-free from here
  const NAME = COPY.meeting.names[0];
  const LETTER = 0.08;                             // a quick thumb: "Lisa" is complete 0.24 s in
  // the overlay card this act's caption shares the frame with ("Echte namen." / "Geen Spreker 1.")
  const O2 = T.O.ch2a || { in: T.O.ch2.in, out: T.O.ch2.swap };
  const hoT = (k, d) => (T.handoff && T.handoff[k] && typeof T.handoff[k].t === "number" ? T.handoff[k].t : d);
  const hoCam = (k) => (typeof Film.handoff === "function" ? Film.handoff(k) : null);
  // bar flights: the bars leave in chunks (one chunk per status dot or connector), 6 ms after
  // the chunk on their left; 0.5 s per flight (9.82 - 10.38), straight to the chunk's row on the
  // house curve. Each bar rises to its travel height (16-20 px, full 4 px width) in the first
  // `lift` of the flight and closes up into its dot (DOT px disc) or line (2 x CONN px) in the last
  // `land`. All of it on the dark screen: the light only starts once the bars are nearly in.
  const FL = { t0: m0 + 0.02, stag: 0.006, dur: 0.5, lift: 0.3, land: 0.3, pitch: 6, hMin: 16, hVar: 4 };
  const DOT = 18, CONN = 16;
  // the light: one even crossfade of stage and screen (see renderStageLight / renderScreen). It
  // starts once "Opnemen." (out at T.O.ch1.out) is past its fastest exit frames, so the two do not
  // add up. Velocity is a trapezoid: `ramp` s soft ends, a constant core (u' = 1 / (dur - ramp)).
  // Nearly the whole frame changes by ~240 grey levels (#0B0B0B -> the light stage / white page),
  // so the constant core is what keeps every 60 fps frame under 5: 240 x 1.04 / 60 = ~4.2 per
  // frame (measured with the 8-subframe blur and XF_SLOPE: <= 4.2 in 16:9, <= 4.4 in 4:5). 10-90 %
  // takes ~0.77 s, 5-95 % ~0.87 s; a crossfade that does 5-95 % in 0.8 s would average ~4.5 and,
  // with the 8-bit steps, peak near 5.
  const XF = { t0: (T.O && T.O.ch1 ? T.O.ch1.out : m0 + 0.2) + 0.1, dur: 1.08, ramp: 0.12 };
  XF.end = XF.t0 + XF.dur;
  function xfU(t) {
    const s = t - XF.t0, v = 1 / (XF.dur - XF.ramp);
    if (s <= 0) return 0;
    if (s >= XF.dur) return 1;
    if (s < XF.ramp) return (0.5 * v * s * s) / XF.ramp;
    if (s > XF.dur - XF.ramp) { const q = XF.dur - s; return 1 - (0.5 * v * q * q) / XF.ramp; }
    return 0.5 * v * XF.ramp + v * (s - XF.ramp);
  }
  // A uniform sheet steps the whole frame by one 8-bit level at once, so single 60 fps frames
  // jitter around the even rate (4 or 5 levels a frame, also through the 8-subframe blur). The
  // crossfade's sheets therefore carry a +-1.5/255 alpha slope across the frame (about 1 grey
  // level corner to corner: invisible), so the steps reach different pixels at different times;
  // the slope is gone at both ends (exact dark, exact light).
  const XF_SLOPE = 1.5 / 255;
  function xfSheet(rgb, a) {
    const d = XF_SLOPE * clamp(Math.min(a, 1 - a) * 20);
    if (d <= 0) return `rgba(${rgb},${a.toFixed(4)})`;
    return `linear-gradient(135deg, rgba(${rgb},${(a - d).toFixed(5)}), rgba(${rgb},${(a + d).toFixed(5)}))`;
  }
  function xfAt(u) {                               // the time the crossfade reaches u
    let lo = XF.t0, hi = XF.end;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (xfU(m) < u) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const TM = {
    chromeDur: 0.2,                                // act A's chrome goes before the bars move
    // the working stage's hero settles in under the crossfade (it is on the page that fades in)
    tile: XF.t0 + 0.05, title: XF.t0 + 0.15, desc: XF.t0 + 0.23, topRow: XF.t0 + 0.19,
    naming: B.naming[0] + 0.02,                    // the naming screen is pushed in from the right
    swap: 0.35, swapBack: 0.3, swapDim: 0.1,       // push: 0.35 s; the screen under it moves 30 % and dims 10 %
    clip: B.clip[0], clipDur: B.clip[1],
    s1: B.tapPlay + 0.37, s1Dur: 0.56,             // after the play tap's dot has gone
    focus: B.typeName[0] - 0.18,
    type: B.typeName[0],
    confirm: B.tapConfirm,
    ret: B.tapConfirm + 0.16,                      // names submitted: the naming screen leaves to the right
    spkDone: B.tapConfirm + 0.75,                  // "Sprekers benoemen" checks off
    flip: B.nameFlip,
    capIn: B.clip[0], capOut: O2.out, capExit: 0.25, // leaves as one unit with "Echte namen."
    // one push, from act A's creep. It waits until the light is done (its last soft 0.1 s), so
    // the push and the crossfade never pile up in the same frames
    camIn: Math.max(hoT("AB", m0 + 0.2), XF.end - 0.1), camInDur: F45 ? 0.9 : 1.0,
    bcEnd: hoT("BC", B.end),                       // act C's framing is landed by then
    off: T.C.start + 1.0,                          // act C's screen has dissolved in by then
  };
  // the pan to act C's framing starts once "Lisa" has landed in the caption
  TM.bc = Math.min(Math.max(B.nameFlip + 0.5, TM.ret + TM.swap), TM.bcEnd - 0.4);
  TM.typed = TM.type + (NAME.length - 1) * LETTER; // last letter lands
  TM.s2 = TM.typed + 0.1; TM.s2Dur = 0.5;          // settled under the finger before the press
  TM.clipEnd = TM.clip + TM.clipDur;               // fragment 1 ends
  TM.frag2 = B.typeName[0] + B.typeName[1] + 0.1;  // fragment 2 buffers until then
  // The tapped banner goes at once: pushes.js exits on a slow-start curve, so the exit is
  // scheduled just before the tap (the banner starts to move right after the press).
  const PUSH_DUR = B.tapPush - 0.1 - B.pushSpeakers[0];

  // ---- where each bar lands ------------------------------------------------------------------
  // The bars are spread over the icon column top to bottom (left bar -> top). A bar that falls on
  // an icon's 28 px box gathers into that dot (about 4 per dot); one that falls between two icons
  // goes into that connector line (2-3 per line). Neighbouring bars with the same dot or line
  // form a chunk: they travel side by side (FL.pitch apart, centred on the column) and only close
  // up into the dot or line as they land.
  const target = [];
  {
    const sp = (SPINE.bot - SPINE.top) / (NB - 1);
    for (let i = 0; i < NB; i++) {
      const y = SPINE.top + i * sp;
      const rel = y - ROW0, k = Math.min(5, Math.floor(rel / ROW)), loc = rel - k * ROW;
      if (loc <= 28 || k === 5) target.push({ icon: true, k, x: ICON_CX, y: iconCY(k) });
      else target.push({ icon: false, k, x: ICON_CX, y: ROW0 + ROW * k + 28 + 8 });   // connector centre
    }
    let g = -1, key = "";
    target.forEach((tg) => { const kk = (tg.icon ? "i" : "c") + tg.k; if (kk !== key) { g++; key = kk; } tg.g = g; });
    target.forEach((tg, i) => {
      const grp = target.filter((o) => o.g === tg.g), j = grp.indexOf(tg);
      tg.off = (j - (grp.length - 1) / 2) * FL.pitch;
    });
  }
  const launchAt = (i) => FL.t0 + FL.stag * target[i].g;
  const landAt = (i) => launchAt(i) + FL.dur;
  const iconLand = [], connLand = [];              // first landing per status dot / connector
  target.forEach((tg, i) => { const a = tg.icon ? iconLand : connLand; if (a[tg.k] === undefined) a[tg.k] = landAt(i); });
  const LAST_LAND = landAt(NB - 1);
  // the card frame unfolds from the icon column once the bars are in
  TM.frame = LAST_LAND - 0.06; TM.frameDur = 0.42;

  // step states over time (processing-steps-model.ts semantics)
  const STEPS = [
    [[-1e9, "active"], [B.stepsDone[0], "done"]],
    [[-1e9, "pending"], [B.stepsDone[0], "active"], [B.stepsDone[1], "done"]],
    [[-1e9, "pending"], [B.stepsDone[1], "active"], [B.stepAction, "action"], [TM.ret, "active"], [TM.spkDone, "done"]],
    [[-1e9, "pending"], [TM.spkDone, "active"]],
    [[-1e9, "pending"]],
    [[-1e9, "pending"]],
  ];
  function weights(k, t) {
    const ev = STEPS[k], w = { pending: 0, active: 0, done: 0, action: 0 };
    for (let i = 0; i < ev.length; i++) {
      const a = ev[i][0], b = i + 1 < ev.length ? ev[i + 1][0] : Infinity;
      const fin = a < -1e8 ? 1 : P(t, a, 0.26);
      const fout = b === Infinity ? 0 : P(t, b, 0.18);
      w[ev[i][1]] += fin * (1 - fout);
    }
    return w;
  }
  function since(k, state, t) {
    let s = null;
    for (const [a, st] of STEPS[k]) if (st === state && a <= t) s = a;
    return s;
  }
  function firstOf(k, state) {
    for (const [a, st] of STEPS[k]) if (st === state) return a;
    return Infinity;
  }

  // ---- act A's waveform maths (act-a.js sampleV / liveV / waveV), for the hand-off ----------
  const TICK = 0.09;
  function sampleV(s) {
    const phrase = noise1(s * 0.05 + 13.3);
    if (phrase < 0.24) return Math.max(0.08, 0.1 + 0.15 * hash(s * 1.93 + 7.7));
    const env = noise1(s * 0.21 + 4.1);
    const syl = hash(s * 0.731 + 2.9);
    const norm = clamp(0.06 + 1.05 * env * (0.35 + 0.65 * syl));
    return Math.max(0.08, Math.min(1, Math.pow(norm, 0.7)));
  }
  function liveV(k, t) {
    const f = t / TICK, n = Math.floor(f), fr = f - n;
    const e = 1 - (1 - fr) * (1 - fr);
    return lerp(sampleV(n + k - 1), sampleV(n + k), e);
  }
  function aWaveV(k, t) {
    const stopT = T.A.holdStop[0] + T.A.holdStop[1];
    return lerp(liveV(k, Math.min(t, stopT + 0.3)), 0.08, P(t, stopT, 0.3));
  }

  // ---- light: one even crossfade of stage and screen ------------------------------------------
  // No front, no disc: every point of the frame (stage and screen) goes from dark to light at the
  // same time, at the same even rate (xfU). The stage: a replica of stage.js' light look (white,
  // the rising brand green and the rings, with stage.js' far-plane depth maths) under a uniform
  // #0B0B0B sheet whose opacity is 1 - xfU, kept above stage.js' layers (its own dark-out front,
  // T.dark out, runs under it and is never seen). Once the crossfade is whole and stage.js is
  // dark-free, the replica hands back to stage.js (same pixels).
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const sl = { panMax: 0, ext: 0 };
  function mountStageLight(ctx) {
    const L = ctx.L;
    sl.panMax = DEPTH.max * Math.max(L.W, L.H);
    sl.ext = Math.ceil(sl.panMax * DEPTH.ext + 8);
    const ext = sl.ext;
    stageLight = abs(ctx.stage, { left: "0px", top: "0px", width: L.W + "px", height: L.H + "px", overflow: "hidden", visibility: "hidden", background: "#ffffff" });
    sl.glow = abs(stageLight, {
      left: -ext + "px", top: -ext + "px", width: L.W + 2 * ext + "px", height: L.H + 2 * ext + "px", transformOrigin: "50% 100%",
      background: `linear-gradient(0deg, rgba(26,186,109,0.30) 0px, rgba(26,186,109,0.30) ${ext}px, rgba(26,186,109,0.08) ${Math.round(ext + 0.38 * L.H)}px, rgba(255,255,255,0) ${Math.round(ext + 0.7 * L.H)}px)`,
    });
    // (nested in stageLight, so act E's search for stage.js' rings among ctx.stage's children
    // never finds this copy)
    sl.rings = abs(stageLight, { left: "0px", top: "0px", width: L.W + "px", height: L.H + "px" });
    const rcx = L.W / 2, rcy = L.H * 1.08;
    [0.42, 0.62, 0.84].forEach((r, i) => {
      const d = Math.max(L.W, L.H) * r * 2;
      abs(sl.rings, {
        left: rcx - d / 2 + "px", top: rcy - d / 2 + "px", width: d + "px", height: d + "px", borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.55)", background: i === 0 ? "rgba(255,255,255,0.10)" : "transparent",
      });
    });
    sl.dark = abs(stageLight, { left: "0px", top: "0px", width: L.W + "px", height: L.H + "px", background: "#0b0b0b" });
  }

  // ---- state -----------------------------------------------------------------------------------
  let root, patch, cover, wipe, page, dimEl, dimTop, content, topRow, barLayer, stageLight;
  const bars = [];
  const wk = { steps: [] };
  const nm = { cards: [] };
  const cap = {};

  // entrances: opacity leads (quick, linear), the move lands slowly on the house curve
  const lead = (t, tIn, dur) => clamp(((t - tIn) / dur) * 2.4);
  // a block of type: opacity and a short rise together, on the house curve (no word masks)
  function blockIn(e, t, tIn, dur, dy, gate = 1) {
    const u = P(t, tIn, dur);
    e.style.opacity = (clamp(u * 1.3) * gate).toFixed(3);
    e.style.transform = `translate3d(0, ${((1 - u) * dy).toFixed(2)}px, 0)`;
  }

  // ---- mount: phone screen -------------------------------------------------------------------
  function mountScreen(ctx) {
    root = abs(ctx.phone.screen, { left: "0px", top: "0px", width: SW + "px", height: SH + "px", zIndex: 12, overflow: "hidden", visibility: "hidden" });
    // dark patch over act A's waveform: our bars take over from here
    patch = abs(root, { left: "46px", top: WAVE_CY - 46 + "px", width: "301px", height: "92px", background: K.rec });
    // dark sheet over act A's stale chrome (dot, timer, buttons): they blur and fade out under it
    cover = abs(root, { left: "0px", top: "0px", width: SW + "px", height: SH + "px", background: "rgba(11,11,11,0)" });
    // the white page and the scroll view on it: both fade in over the dark screen (the crossfade)
    wipe = abs(root, { left: "0px", top: "0px", width: SW + "px", height: SH + "px", background: "rgba(255,255,255,0)" });
    page = abs(root, { left: "0px", top: VIEW_TOP + "px", width: SW + "px", height: SH - VIEW_TOP + "px", overflow: "hidden", opacity: 0 });
    content = abs(page, { left: "0px", top: -VIEW_TOP + "px", width: SW + "px", height: "1400px" });

    mountWorking();
    mountNaming();

    // the screen that is pushed back under the incoming one dims (black, at most TM.swapDim):
    // in the scroll view under the naming screen, and in the safe area above it (left of the
    // naming screen's edge), so the dim has no edge under the status bar
    dimEl = abs(content, { left: "0px", top: "0px", width: SW + "px", height: "1400px", background: "#000000", opacity: 0, visibility: "hidden" });
    dimTop = abs(root, { left: "0px", top: "0px", width: SW + "px", height: VIEW_TOP + "px", background: "#000000", opacity: 0, visibility: "hidden" });

    // top row: back + subject (same pixels as act C's, so its dissolve is seamless). Shared by
    // the working stage and the naming screen: it stays put while the naming screen is pushed
    // in, and comes back with the working stage when the naming screen leaves.
    topRow = abs(content, { left: "0px", top: "0px", width: SW + "px", height: "120px", zIndex: 6 });
    const back = abs(topRow, { left: X0 + "px", top: WK.top + "px", width: "36px", height: "36px", borderRadius: "50%", boxShadow: `inset 0 0 0 1px ${K.border}` });
    abs(back, { left: "10px", top: "10px" }).innerHTML = svg("arrowLeft", 16, K.ink, 2);
    abs(topRow, { left: X0 + 48 + "px", top: WK.top + "px", height: "36px", lineHeight: "36px", fontSize: "14px", fontWeight: 600, color: K.ink, whiteSpace: "nowrap" }, COPY.meeting.subject);

    // the 36 bars, above everything in the screen
    barLayer = abs(root, { left: "0px", top: "0px", width: SW + "px", height: SH + "px" });
    for (let i = 0; i < NB; i++) {
      bars.push(abs(barLayer, { left: "0px", top: "0px", width: BAR_W + "px", height: "6px", borderRadius: "2px", background: K.accent, willChange: "transform" }));
    }
  }

  function mountWorking() {
    wk.layer = abs(content, { left: "0px", top: "0px", width: SW + "px", height: "1400px", zIndex: 2 });
    // white page of its own, only when it covers the naming screen again
    wk.sheet = abs(wk.layer, { left: "0px", top: "0px", width: SW + "px", height: "1400px", background: "#ffffff", visibility: "hidden" });
    wk.hero = abs(wk.layer, { left: "0px", top: "0px", width: SW + "px", height: "400px" });
    wk.tile = abs(wk.hero, { left: SW / 2 - 40 + "px", top: WK.tile + "px", width: "80px", height: "80px", borderRadius: "10px", background: K.surfaceMuted });
    wk.tileIcon = abs(wk.tile, { left: "23px", top: "23px", width: "34px", height: "34px" });
    wk.tileIcon.innerHTML = svg("refresh", 34, K.ink, 1.75);
    wk.title = abs(wk.hero, {
      left: X0 + 8 + "px", top: WK.title + "px", width: CW - 16 + "px", textAlign: "center",
      fontSize: "30px", lineHeight: "36px", fontWeight: 700, letterSpacing: "-0.025em", color: K.ink, whiteSpace: "nowrap",
    }, NL.workingTitle);
    wk.desc = abs(wk.hero, { left: X0 + 8 + "px", top: WK.desc + "px", width: CW - 16 + "px", textAlign: "center", fontSize: "14px", lineHeight: "20px", color: K.muted }, NL.workingDesc);

    wk.card = abs(wk.layer, { left: X0 + "px", top: WK.card + "px", width: CW + "px", height: WK.cardH + "px" });
    wk.frame = abs(wk.card, { left: "0px", top: "0px", width: CW + "px", height: WK.cardH + "px", borderRadius: "10px", boxShadow: `inset 0 0 0 1px ${K.border}` });
    APP.steps.forEach((label, k) => {
      const top = IN + ROW * k;
      const s = {};
      if (k < 5) {
        s.conn = abs(wk.card, { left: IN + 13 + "px", top: top + 28 + "px", width: "2px", height: "16px", borderRadius: "1px", background: K.border });
        s.fill = abs(s.conn, { left: "0px", top: "0px", width: "2px", height: "16px", borderRadius: "1px", background: K.connDone, transformOrigin: "50% 0%", transform: "scaleY(0)" });
      }
      s.box = abs(wk.card, { left: IN + "px", top: top + "px", width: "28px", height: "28px" });
      s.pend = abs(s.box, { left: "5px", top: "5px", width: "18px", height: "18px", borderRadius: "50%", boxShadow: `inset 0 0 0 2px ${K.border}`, background: "rgba(246,247,248,0.4)" });
      s.spin = abs(s.box, { left: "3px", top: "3px", width: "22px", height: "22px" });
      s.spin.innerHTML = svg("loader", 22, K.ink, 2);
      s.check = abs(s.box, { left: "3px", top: "3px", width: "22px", height: "22px" });
      s.check.innerHTML = svg("checkCircle2", 22, K.mintInk, 2);
      s.cc = s.check.querySelector(".cc-c");
      s.ck = s.check.querySelector(".cc-k");
      s.hand = abs(s.box, { left: "4px", top: "4px", width: "20px", height: "20px", transformOrigin: "50% 80%" });
      s.hand.innerHTML = svg("hand", 20, K.mintInk, 2);
      s.label = abs(wk.card, { left: IN + 28 + 14 + "px", top: top + "px", height: "28px", lineHeight: "28px", fontSize: "14px", whiteSpace: "nowrap", color: K.muted });
      s.label.textContent = label;
      if (k === 2) {
        s.badge = abs(wk.card, {
          right: IN + "px", top: top + 3 + "px", height: "22px", padding: "2px 8px", borderRadius: "10px", background: K.mint,
          color: K.mintInk, fontSize: "12px", lineHeight: "18px", fontWeight: 500, whiteSpace: "nowrap", transformOrigin: "100% 50%",
        }, APP.yourAction);
      }
      wk.steps.push(s);
    });
  }

  function speakerCard(parent, n, first) {
    const c = {};
    c.el = div(parent, {
      position: "relative", borderRadius: "10px", background: "#ffffff", boxShadow: `inset 0 0 0 1px ${K.border}`,
      padding: "25px 21px", display: "flex", flexDirection: "column", marginTop: first ? "0px" : "16px",
    });
    // identity row: number circle + label + talk share
    const id = div(c.el, { display: "flex", alignItems: "center", gap: "14px", height: "48px" });
    div(id, { flex: "0 0 48px", width: "48px", height: "48px", borderRadius: "50%", background: K.surfaceMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", lineHeight: "28px", fontWeight: 700, color: K.ink }, String(n));
    const col = div(id, { flex: "1", minWidth: "0px", display: "flex", flexDirection: "column", gap: "6px" });
    div(col, { fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: K.ink }, COPY.captions.find((x) => x.who.endsWith(" " + n)).who);
    const sr = div(col, { display: "flex", alignItems: "center", gap: "10px" });
    const tr = div(sr, { position: "relative", flex: "1", height: "6px", borderRadius: "3px", background: K.track, overflow: "hidden" });
    abs(tr, { left: "0px", top: "0px", height: "6px", width: SHARES[n - 1] + "%", background: K.ink });
    div(sr, { fontSize: "12px", lineHeight: "16px", color: K.muted, whiteSpace: "nowrap" }, APP.speakerShare.replace("34", String(SHARES[n - 1])));
    // play clip
    const pg = div(c.el, { marginTop: "16px", display: "flex", flexDirection: "column" });
    c.btn = div(pg, { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 14px", borderRadius: "10px", background: "#ffffff", boxShadow: `inset 0 0 0 1px ${K.border}` });
    const ic = div(c.btn, { position: "relative", width: "13px", height: "13px", flex: "0 0 13px" });
    c.play = abs(ic, { left: "0px", top: "0px" });
    c.play.innerHTML = svg("play", 13, K.ink, 2);
    c.sq = abs(ic, { left: "0px", top: "0px", opacity: 0 });
    c.sq.innerHTML = svg("square", 13, K.mintInk, 2);
    c.btnTxt = div(c.btn, { fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: K.ink, whiteSpace: "nowrap" }, APP.playClip);
    if (first) {
      c.prog = div(pg, { height: "0px", overflow: "hidden" });
      const row = div(c.prog, { marginTop: "8px", height: "16px", display: "flex", alignItems: "center", gap: "10px" });
      const tr2 = div(row, { position: "relative", flex: "1", height: "4px", borderRadius: "2px", background: K.track, overflow: "hidden" });
      c.progFill = abs(tr2, { left: "0px", top: "0px", width: "100%", height: "4px", background: K.ink, transformOrigin: "0 50%", transform: "scaleX(0)" });
      c.progTime = div(row, { fontSize: "12px", lineHeight: "16px", color: K.muted, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }, NL.clipTime("0:00", "0:03"));
    }
    // name field
    const ng = div(c.el, { marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" });
    div(ng, { fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: K.ink }, APP.nameField);
    c.input = div(ng, { position: "relative", height: "40px", borderRadius: "10px", background: "#ffffff", boxShadow: `inset 0 0 0 1px ${K.border}` });
    c.ph = abs(c.input, { left: "12px", top: "0px", lineHeight: "40px", fontSize: "16px", color: K.placeholder, whiteSpace: "nowrap" }, NL.placeholder);
    const val = abs(c.input, { left: "12px", top: "0px", height: "40px", display: "flex", alignItems: "center", fontSize: "16px", color: K.ink, whiteSpace: "pre" });
    c.val = span(val, {}, "");
    c.caret = span(val, { display: "inline-block", width: "2px", height: "20px", marginLeft: "1px", borderRadius: "1px", background: K.ink, opacity: 0 });
    return c;
  }

  function mountNaming() {
    nm.root = abs(content, { left: "0px", top: "0px", width: SW + "px", height: "1400px", zIndex: 3, visibility: "hidden" });
    // its white page covers the working stage (the incoming screen covers the outgoing one)
    nm.sheet = abs(nm.root, { left: "0px", top: "0px", width: SW + "px", height: "1400px", background: "#ffffff" });
    nm.title = abs(nm.root, {
      left: X0 + "px", top: NM.title + "px", width: CW + "px", whiteSpace: "nowrap",
      fontSize: "30px", lineHeight: "36px", fontWeight: 700, letterSpacing: "-0.025em", color: K.ink,
    }, APP.speakersTitle);
    nm.desc = abs(nm.root, { left: X0 + "px", top: NM.desc + "px", width: CW + "px", fontSize: "14px", lineHeight: "20px", color: K.muted }, NL.speakersDesc);
    const flow = abs(nm.root, { left: X0 + "px", top: NM.cards + "px", width: CW + "px", display: "flex", flexDirection: "column" });
    for (let n = 1; n <= 3; n++) nm.cards.push(speakerCard(flow, n, n === 1));
    nm.rest = div(flow, { display: "flex", flexDirection: "column" });
    const cb = div(nm.rest, { marginTop: "24px", height: "20px", display: "flex", alignItems: "center", gap: "12px" });
    div(cb, { flex: "0 0 16px", width: "16px", height: "16px", borderRadius: "4px", boxShadow: `inset 0 0 0 1px ${K.border}` });
    div(cb, { fontSize: "14px", lineHeight: "20px", color: K.muted, whiteSpace: "nowrap" }, NL.saveNames);
    nm.confirm = div(nm.rest, { marginTop: "24px", position: "relative", height: "44px", borderRadius: "10px", background: K.ink, display: "flex", alignItems: "center", justifyContent: "center" });
    nm.confirmTxt = div(nm.confirm, { fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: K.onInk, whiteSpace: "nowrap" }, APP.confirm);
    div(nm.rest, { marginTop: "8px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: K.ink }, NL.skip);
  }

  // ---- caption layout ----------------------------------------------------------------------------
  // Both formats: one line (label, dot, line + the clip's small waveform).
  // 16:9: 44 px at the top of L.captions; the whole line (waveform included) ends at x ~910,
  // inside the box (<= 950) and clear of the phone's bezel (~1035).
  // 4:5: one 44 px line between the overlay text and the phone. The phone's
  // top is pinned where Bevestigen (after the full scroll) still sits 30 px above the frame bottom
  // at the naming zoom; the caption is centred in the gap between the overlay card ("Echte
  // namen." + its sub lines, overlay-text.js layout) and the phone's bezel.
  const Z_NAME45 = 1.25;
  function capLayout(L) {
    const BX = L.captions;
    const size = 44;
    const lineH = Math.round(size * 1.25);
    if (F45) {
      const nSub = (COPY.ch2a && COPY.ch2a.sub && COPY.ch2a.sub.length) || 2;
      const textBottom = L.text.y + L.wordSize * 1.18 + 10 + (nSub - 1) * L.subSize * 1.3 + L.subSize * 1.22;
      const phoneTop = Math.round(L.H - 30 - (CONFIRM_CY + 22) * Z_NAME45);
      const bezelTop = phoneTop - 14 * Z_NAME45;
      const top = Math.round(textBottom + Math.max(10, (bezelTop - textBottom - lineH) / 2));
      return { size, lineH, top, phoneTop };
    }
    // 16:9: on act A's upper caption line (BX.y + its tag line + 8)
    return { size, lineH, top: BX.y + 8, phoneTop: null };
  }

  // ---- mount: overlay caption (act A's caption, ink on light) ----------------------------------
  // The speaker label is set at the size of the line, so "Spreker 1" -> "Lisa" reads as a
  // one-for-one swap. 16:9: label above the line (act A's layout); 4:5: label, dot and line on
  // one row.
  function mountCaption(ctx) {
    const L = ctx.L, BX = L.captions, CL = capLayout(L);
    const size = CL.size, lineH = CL.lineH, top = CL.top;
    // Inter: ascender 0.969, content 1.211 em -> baseline from the top of a line box
    const base = (lineH - 1.211 * size) / 2 + 0.969 * size;
    Object.assign(cap, { capSize: size, lineH });
    cap.wrap = abs(ctx.overlay, { left: BX.x + "px", top: top + "px", width: BX.w + "px", visibility: "hidden" });
    cap.row = div(cap.wrap, { position: "relative", display: "flex", alignItems: "flex-start", whiteSpace: "nowrap" });
    cap.slot = div(cap.row, { position: "relative", height: lineH + "px", flex: "0 0 auto" });
    cap.tag = span(cap.slot, {
      position: "absolute", left: "0px", top: "0px", display: "inline-block", fontSize: size + "px", lineHeight: lineH + "px",
      fontWeight: 600, letterSpacing: "-0.012em", color: K.muted, whiteSpace: "nowrap",
    }, COPY.captions[1].who);
    cap.strike = abs(cap.tag, {
      left: "-3px", right: "-3px", top: px(base - 0.33 * size - 1.5), height: "3px", borderRadius: "1.5px",
      background: K.ink, transformOrigin: "0 50%", transform: "scaleX(0)",
    });
    cap.name = abs(cap.slot, { left: "0px", top: "0px", height: lineH + "px", whiteSpace: "nowrap", transformOrigin: "0% 70%", opacity: 0 });
    cap.marker = abs(cap.name, { left: "-0.1em", right: "-0.12em", top: "0.2em", bottom: "0.1em", borderRadius: "0.14em", background: K.mint, transformOrigin: "0 50%", transform: "scaleX(0)", fontSize: size + "px" });
    cap.nameTxt = span(cap.name, { position: "relative", display: "inline-block", fontSize: size + "px", lineHeight: lineH + "px", fontWeight: 700, letterSpacing: "-0.02em", color: K.greenInk }, NAME);
    cap.sep = span(cap.row, { flex: "0 0 auto", height: lineH + "px", fontSize: size + "px", lineHeight: lineH + "px", fontWeight: 500, color: K.faint, padding: "0 0.32em" }, "·");
    // the line + the small waveform of the clip
    cap.line = div(cap.row, { display: "flex", flex: "0 0 auto", alignItems: "center", height: lineH + "px", fontSize: size + "px", lineHeight: lineH + "px", fontWeight: 500, letterSpacing: "-0.012em", color: K.ink });
    cap.words = [];
    // the line is a flex row (it carries the waveform), which drops bare spaces between items:
    // each word carries its own trailing space
    const ws = COPY.captions[1].text.split(/\s+/).filter(Boolean);
    ws.forEach((w, j) => cap.words.push(span(cap.line, { display: "inline-block", whiteSpace: "pre" }, j < ws.length - 1 ? w + " " : w)));
    cap.wave = span(cap.line, { display: "inline-flex", alignItems: "center", gap: "3px", height: Math.round(size * 0.7) + "px", marginLeft: Math.round(size * 0.45) + "px" });
    cap.waveBars = [];
    for (let i = 0; i < 5; i++) cap.waveBars.push(span(cap.wave, { display: "block", width: "3px", height: "4px", borderRadius: "1.5px", background: K.brand }));
  }

  // ---- render ----------------------------------------------------------------------------------
  function renderBars(t) {
    const vis = t >= B.start && t < XF.end;
    barLayer.style.visibility = vis ? "inherit" : "hidden";
    if (!vis) return;
    // the spine fades out with the crossfade, as one layer (the landed bars of a chunk overlap, so
    // a per-bar opacity would fade unevenly)
    barLayer.style.opacity = (1 - xfU(t)).toFixed(4);
    for (let i = 0; i < NB; i++) {
      const e = bars[i], tg = target[i];
      const x0 = WAVE_CX + (i - (NB - 1) / 2) * BAR_STEP, y0 = WAVE_CY;
      // one straight move per chunk on the house curve, from the waveform to the chunk's row in
      // the status-dot column; the chunk's bars travel side by side and close up as they land
      const u = clamp((t - launchAt(i)) / FL.dur), eu = E.house(u);
      const lift = E.house(clamp(u / FL.lift)), land = E.house(clamp((u - (1 - FL.land)) / FL.land));
      const x = lerp(x0, tg.x + tg.off * (1 - land), eu), y = lerp(y0, tg.y, eu);
      // height: act A's settled waveform at the hand-off; it rises to a full bar (16-20 px) as it
      // leaves and keeps it while it travels, then closes up into what it becomes: the chunk's
      // bars widen into one DOT px disc on the status dot, or thin into the 2 x CONN px line
      const hT = FL.hMin + FL.hVar * hash(i * 3.1 + 7.3);
      const h = lerp(lerp(aWaveV(i, t) * WAVE_H, hT, lift), tg.icon ? DOT : CONN, land);
      const w = lerp(BAR_W, tg.icon ? DOT : 2, land);
      e.style.width = px(w);
      e.style.height = px(h);
      e.style.borderRadius = px(Math.min(w, h) / 2);
      e.style.transform = `translate3d(${(x - w / 2).toFixed(2)}px, ${(y - h / 2).toFixed(2)}px, 0)`;
    }
  }

  // The push between the working stage and the naming screen (house, TM.swap): the naming screen
  // comes in from the right edge over the working stage, which moves TM.swapBack of the width to
  // the left and dims by TM.swapDim; at TM.ret the same move runs backwards.
  function swapX(t) {
    const u = t < TM.ret ? P(t, TM.naming, TM.swap) : 1 - P(t, TM.ret, TM.swap);
    return { nm: SW * (1 - u), wk: -TM.swapBack * SW * u, dim: TM.swapDim * u };
  }

  function renderWorking(t) {
    // Screen order: the working stage is on screen until the naming screen has been pushed in
    // over it; after the names are sent the naming screen leaves to the right and the working
    // stage comes back from under it (both moves: swapX).
    const back = t >= TM.ret;
    const on = back || t < TM.naming + TM.swap + 0.02;
    wk.layer.style.visibility = on ? "inherit" : "hidden";
    if (!on) return;
    wk.layer.style.zIndex = "2";
    wk.layer.style.opacity = "1";
    wk.layer.style.transform = `translate3d(${swapX(t).wk.toFixed(2)}px, 0, 0)`;
    wk.sheet.style.visibility = back ? "inherit" : "hidden";
    // (the whole page fades in with the crossfade, renderScreen; nothing here is gated by it)

    // hero: tile, then the title as one block, then the description
    const tu = P(t, TM.tile, 0.5);
    wk.tile.style.opacity = lead(t, TM.tile, 0.5).toFixed(3);
    wk.tile.style.transform = `translate3d(0, ${((1 - tu) * 10).toFixed(2)}px, 0) scale(${(0.86 + 0.14 * tu).toFixed(4)})`;
    wk.tileIcon.style.transform = `rotate(${((t * 225) % 360).toFixed(2)}deg)`;   // Spinning, 1.6 s a turn
    blockIn(wk.title, t, TM.title, 0.36, 12);
    blockIn(wk.desc, t, TM.desc, 0.36, 10);

    // card frame: unfolds from the spine to both sides in one move (both edges travel together)
    const fu = P(t, TM.frame, TM.frameDur);
    const fl = SPINE_X * (1 - fu), fr = lerp(SPINE_X, CW, fu);
    wk.frame.style.left = px(fl);
    wk.frame.style.width = px(Math.max(0, fr - fl));
    wk.frame.style.opacity = clamp(fu * 4).toFixed(3);

    wk.steps.forEach((s, k) => {
      const w = weights(k, t);
      const rv = P(t, iconLand[k] - 0.04, 0.3);                      // the dot grows out of its bars
      s.pend.style.opacity = (w.pending * rv).toFixed(3);
      s.pend.style.transform = `scale(${(0.55 + 0.45 * rv * (0.6 + 0.4 * w.pending)).toFixed(4)})`;
      s.spin.style.opacity = (w.active * rv).toFixed(3);
      s.spin.style.transform = `rotate(${((t * 225 + k * 40) % 360).toFixed(2)}deg) scale(${(0.7 + 0.3 * w.active).toFixed(4)})`;
      const td = since(k, "done", t);
      if (td !== null && w.done > 0.001) {
        const cu = P(t, td, 0.42), ku = P(t, td + 0.12, 0.3);
        s.cc.setAttribute("stroke-dashoffset", (1 - cu).toFixed(4));
        s.ck.setAttribute("stroke-dashoffset", (1 - ku).toFixed(4));
        s.check.style.opacity = (w.done * rv).toFixed(3);
        s.check.style.transform = `scale(${(0.82 + 0.18 * cu).toFixed(4)})`;
      } else s.check.style.opacity = "0";
      const ta = since(k, "action", t);
      if (ta !== null && w.action > 0.001) {
        const hu = P(t, ta, 0.45);
        s.hand.style.opacity = (w.action * rv).toFixed(3);
        s.hand.style.transform = `rotate(${(-18 * (1 - hu)).toFixed(2)}deg) scale(${(0.5 + 0.5 * hu).toFixed(4)})`;
      } else s.hand.style.opacity = "0";
      // label: muted (pending), ink (active/done), accent ink (action); weight follows the state
      const sum = w.pending + w.active + w.done + w.action || 1;
      let col = mixHex(K.muted, K.ink, (w.active + w.done) / sum);
      if (w.action > 0.001) col = mixHex(col, K.mintInk, w.action / sum);
      s.label.style.color = col;
      const top = [["pending", 400], ["active", 600], ["done", 500], ["action", 600]].reduce((a, b) => (w[b[0]] > w[a[0]] ? b : a));
      s.label.style.fontWeight = String(top[1]);
      const lu = P(t, iconLand[k] + 0.02, 0.45);
      s.label.style.opacity = lu.toFixed(3);
      s.label.style.transform = `translate3d(${(-14 * (1 - lu)).toFixed(2)}px, 0, 0)`;
      if (s.conn) {
        s.conn.style.opacity = P(t, connLand[k] - 0.04, 0.3).toFixed(3);
        s.fill.style.transform = `scaleY(${P(t, firstOf(k, "done") + 0.08, 0.4).toFixed(4)})`;
      }
      if (s.badge) {
        const bu = w.action;
        s.badge.style.opacity = bu.toFixed(3);
        s.badge.style.transform = `translate3d(${(8 * (1 - bu)).toFixed(2)}px, 0, 0) scale(${(0.86 + 0.14 * bu).toFixed(4)})`;
      }
    });
  }

  const scrollAt = (t) => S1 * P(t, TM.s1, TM.s1Dur) + S2 * P(t, TM.s2, TM.s2Dur);

  function renderNaming(t) {
    const on = t >= TM.naming && t < TM.ret + TM.swap + 0.02;
    nm.root.style.visibility = on ? "inherit" : "hidden";
    if (!on) return;
    // pushed in from the right over the working stage (opaque white page + content, full
    // opacity), and out to the right again at TM.ret. The banner has gone by then.
    nm.root.style.zIndex = "5";
    nm.root.style.transform = `translate3d(${swapX(t).nm.toFixed(2)}px, ${(-scrollAt(t)).toFixed(2)}px, 0)`;
    nm.root.style.opacity = "1";

    // card 1: play the clip
    const c = nm.cards[0];
    const press = P(t, B.tapPlay - 0.05, 0.08) * (1 - P(t, B.tapPlay + 0.08, 0.16));
    const pu = P(t, B.tapPlay + 0.02, 0.2);
    const playing = t >= B.tapPlay + 0.02;
    const frag = t >= TM.clipEnd ? 2 : 1;
    c.btn.style.background = mixHex("#FFFFFF", K.mint, pu);
    c.btn.style.boxShadow = `inset 0 0 0 1px rgba(232,234,237,${(1 - pu).toFixed(3)})`;
    c.btn.style.transform = `scale(${(1 - 0.04 * press).toFixed(4)})`;
    c.play.style.opacity = (1 - pu).toFixed(3);
    c.sq.style.opacity = pu.toFixed(3);
    setText(c.btnTxt, playing ? NL.fragment(frag, 3) : APP.playClip);
    c.btnTxt.style.color = mixHex(K.ink, K.mintInk, pu);
    // elapsed / total + progress (fragment 1 runs time-compressed; fragment 2 buffers at 0:00 while
    // the name is typed, so nothing runs under the field during the key beat)
    c.prog.style.height = px(PROG * P(t, TM.clip, 0.34));
    const fu = frag === 1 ? clamp((t - TM.clip) / TM.clipDur) : clamp((t - TM.frag2) / TM.clipDur);
    c.progFill.style.transform = `scaleX(${fu.toFixed(4)})`;
    setText(c.progTime, NL.clipTime("0:0" + Math.min(3, Math.floor(fu * 3 + 1e-6)), "0:03"));

    // name field: focus, caret, "Lisa" typed letter by letter (the user types; no suggestion)
    const fo = P(t, TM.focus, 0.16);
    c.input.style.boxShadow = `inset 0 0 0 1px ${mixHex(K.border, K.ink, fo)}`;
    const n = t < TM.type ? 0 : Math.min(NAME.length, 1 + Math.floor((t - TM.type) / LETTER + 1e-6));
    setText(c.val, NAME.slice(0, n));
    c.ph.style.opacity = n > 0 ? "0" : "1";
    const typing = t >= TM.type && t < TM.typed + 0.2;
    const blink = clamp(0.5 + 1.6 * Math.cos((2 * Math.PI * (t - TM.focus)) / 1.0));
    c.caret.style.opacity = (t < TM.focus + 0.06 ? 0 : typing ? 1 : blink).toFixed(3);

    // Bevestigen: press, then the submitting state (disabled = 50 %)
    const cp = P(t, TM.confirm - 0.05, 0.08) * (1 - P(t, TM.confirm + 0.1, 0.16));
    const busy = P(t, TM.confirm + 0.08, 0.14);
    nm.confirm.style.transform = `scale(${(1 - 0.025 * cp).toFixed(4)})`;
    nm.confirm.style.opacity = (1 - 0.5 * busy).toFixed(3);
    setText(nm.confirmTxt, t >= TM.confirm + 0.08 ? NL.submitting : APP.confirm);
  }

  // Whether a push banner (pushes.js geometry: top y = -130 + 186 in - 190 out, ~106 px tall,
  // 97 % opaque) sits over the top row's text line (logical 83-103) and is still more than faintly
  // visible. The top row hides only then, so it never ghosts through a banner and never shows
  // under a half-faded one; nothing dims it where no banner is.
  function underBanner(t) {
    let h = 0;
    for (const p of Film.pushes) {
      if (t < p.t || t > p.t + p.dur + 0.5) continue;
      const exitDur = p.tapAt !== undefined ? 0.3 : 0.42;
      const inU = P(t, p.t, 0.5, E.out), outU = P(t, p.t + p.dur, exitDur), outFade = P(t, p.t + p.dur, exitDur * 0.6);
      const y = -130 + 186 * inU - 190 * outU;
      const op = Math.min(1, inU * 1.6) * (1 - outFade);
      h = Math.max(h, smooth((y + 15) / 15) * clamp(op * 3));
    }
    return h;
  }

  function renderScreen(t) {
    const on = t >= B.start && t < TM.off;
    // (children use "inherit", never "visible": a child set visible would show through the hidden
    // root after a backward seek, e.g. the working stage over act A's recording screen)
    root.style.visibility = on ? "visible" : "hidden";
    if (!on) return;
    const lightOn = t < TM.screenLit + 0.05;       // the white page is whole from here on
    patch.style.visibility = lightOn ? "inherit" : "hidden";
    // act A's chrome blurs and fades away under a dark sheet before the bars move
    const cu = P(t, B.start, TM.chromeDur);
    cover.style.visibility = lightOn ? "inherit" : "hidden";
    cover.style.background = `rgba(11,11,11,${cu.toFixed(3)})`;
    const bl = cu > 0.001 && cu < 0.999 ? `blur(${(4 * cu).toFixed(2)}px)` : "none";
    cover.style.backdropFilter = bl;
    cover.style.webkitBackdropFilter = bl;
    // the crossfade: the white page and everything on it fade in over the dark screen, evenly
    // (the same progress as the stage's), while the bars' green spine fades out over it
    const xu = xfU(t);
    wipe.style.background = xfSheet("255,255,255", xu);
    page.style.opacity = xu.toFixed(4);
    // the pushed-back screen's dim, under the naming screen
    const sw = swapX(t);
    dimEl.style.visibility = sw.dim > 0.0005 ? "inherit" : "hidden";
    dimEl.style.opacity = sw.dim.toFixed(4);
    dimEl.style.zIndex = t < TM.ret ? "3" : "4";
    dimTop.style.visibility = dimEl.style.visibility;
    dimTop.style.opacity = dimEl.style.opacity;
    dimTop.style.width = px(Math.max(0, sw.nm));
    // top row: settles in on the page under the light, stays put while the naming screen is pushed in over the
    // working stage (shared chrome), scrolls with the naming page, and comes back with the
    // working stage (under the leaving naming screen, dimmed with it) when the names are sent
    let tx = 0, ty, to;
    if (t < TM.ret) {
      to = lead(t, TM.topRow, 0.5);
      ty = -scrollAt(t) + (1 - P(t, TM.topRow, 0.5)) * 8;
    } else {
      to = 1;
      ty = 0;
      tx = sw.wk;
    }
    topRow.style.zIndex = t < TM.ret ? "6" : "3";
    topRow.style.opacity = (to * (1 - underBanner(t))).toFixed(3);
    topRow.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
    renderWorking(t);
    renderNaming(t);
    renderBars(t);
  }

  function renderStageLight(t, L) {
    // once the crossfade is whole and stage.js is dark-free, hand back to stage.js: the replica
    // draws the same pixels, the short fade only covers sub-pixel differences
    const end = TM.handBack;
    const on = t >= B.start && t < end + 0.25;
    stageLight.style.visibility = on ? "visible" : "hidden";
    if (!on) return;
    // stage.js registers with order 0, which Film.register treats as 50, so its layers mount
    // after this part: keep this layer above them while it is on
    if (stageLight.nextSibling) stageLight.parentNode.appendChild(stageLight);
    // stage.js' far plane (same maths): the world's on-screen motion away from rest x DEPTH.k,
    // softly limited to DEPTH.max of the long side, plus a z^DEPTH.z scale; rings breathe
    const cam = Film.camera.at(t), c0 = L.cam0, pm = sl.panMax;
    const soft = (v) => pm * Math.tanh(v / pm);
    const ox = soft(-(cam.cx - c0.cx) * cam.z * DEPTH.k);
    const oy = soft(-(cam.cy - c0.cy) * cam.z * DEPTH.k);
    const oz = Math.pow(cam.z / c0.z, DEPTH.z);
    sl.glow.style.transform = `translate3d(${ox.toFixed(2)}px, ${oy.toFixed(2)}px, 0) scale(${oz.toFixed(5)})`;
    const by = Math.sin(t * 0.35) * 6, bs = 1 + 0.012 * Math.sin(t * 0.21);
    sl.rings.style.transform = `translate3d(${ox.toFixed(2)}px, ${(oy + by).toFixed(2)}px, 0) scale(${(bs * oz).toFixed(5)})`;
    // the even crossfade: one uniform dark sheet, 1 - progress
    sl.dark.style.background = xfSheet("11,11,11", 1 - xfU(t));
    stageLight.style.opacity = (1 - P(t, end, 0.25)).toFixed(3);
  }

  function renderCaption(t) {
    const on = t >= TM.capIn - 0.01 && t < TM.capOut + TM.capExit + 0.01;
    cap.wrap.style.visibility = on ? "visible" : "hidden";
    if (!on) return;
    // in: rises with the clip; out: as one unit with the overlay card above it (short rise, fade,
    // at most 4 px of blur, house curve, gone within 0.25 s), like Film.type's exit
    const iu = P(t, TM.capIn, 0.5), ou = P(t, TM.capOut, TM.capExit);
    cap.wrap.style.opacity = (clamp(iu * 1.5) * (1 - ou)).toFixed(3);
    cap.wrap.style.transform = `translate3d(0, ${((1 - iu) * 18 - ou * 0.12 * cap.capSize).toFixed(2)}px, 0)`;
    cap.wrap.style.filter = ou > 0.001 ? `blur(${(ou * 4).toFixed(2)}px)` : "none";
    // karaoke while fragment 1 plays: the line lights up as Spreker 1 says it
    const n = cap.words.length, step = (TM.clipDur - 0.35) / Math.max(1, n - 1);
    cap.words.forEach((w, j) => {
      w.style.color = mixHex(K.faint, K.ink, P(t, TM.clip + 0.1 + j * step, 0.22));
      w.style.transform = `translate3d(0, ${((1 - P(t, TM.capIn + 0.05 + j * 0.04, 0.5)) * 10).toFixed(2)}px, 0)`;
    });
    // small waveform: alive while fragment 1 plays, flat and gone when it ends
    const wv = Eng.win(t, TM.clip, TM.clipEnd + 0.1, 0.25, 0.3);
    const maxH = cap.capSize * 0.62;
    cap.wave.style.opacity = wv.toFixed(3);
    cap.waveBars.forEach((b, i) => {
      const v = 0.18 + 0.82 * noise1(t * 9.5 + i * 3.7) * (0.55 + 0.45 * Math.sin(i * 1.3 + 0.6) ** 2);
      b.style.height = px(Math.max(3, maxH * lerp(0.15, v, wv)));
    });
    // the name flip, overlapped so it resolves early: the strike runs right after the confirm,
    // "Spreker 1" leaves fast (up, blurred) as "Lisa" rises into the same slot with a small scale
    // settle, then the mint marker runs under it
    cap.strike.style.transform = `scaleX(${P(t, TM.flip - 0.05, 0.14).toFixed(4)})`;
    const tx = P(t, TM.flip + 0.1, 0.14);
    cap.tag.style.transform = `translate3d(0, ${(-10 * tx).toFixed(2)}px, 0)`;
    cap.tag.style.opacity = (1 - tx).toFixed(3);
    cap.tag.style.filter = tx > 0.001 ? `blur(${(3 * tx).toFixed(2)}px)` : "none";
    const t0 = TM.flip + 0.12;
    const nu = P(t, t0, 0.32);
    const sc = t < t0 ? 1.05 : 1 + 0.05 * (1 - spring(t - t0, 2.4, 0.95));
    cap.name.style.opacity = clamp(((t - t0) / 0.32) * 1.8).toFixed(3);
    cap.name.style.transform = `translate3d(0, ${(12 * (1 - nu)).toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
    cap.marker.style.transform = `scaleX(${P(t, TM.flip + 0.3, 0.3).toFixed(4)})`;
    // label and line share one row: the slot eases from the label's width to the name's
    const tw = cap.tag.offsetWidth, nw = cap.nameTxt.offsetWidth;
    cap.slot.style.width = px(lerp(tw, nw, P(t, t0, 0.35)));
  }

  // ---- register ----------------------------------------------------------------------------------
  Film.register({
    id: "act-b",
    order: 30,
    mount(ctx) {
      const L = ctx.L, cam = Film.camera;
      // Camera, one take. Act A leaves us on its creep framing (T.handoff.AB), which holds while
      // the bars gather and the light comes up. One push in once the light is done, to the framing
      // that holds the whole working stage, the push banner and later the naming card; a slow
      // drift while the screens change; then a pan to act C's framing T.handoff.BC, landed by its t.
      const bc = hoCam("BC") || {};
      if (F45) {
        // 4:5: the phone top is pinned under the caption line (CL.phoneTop, 400) at z 1.22 for the
        // working stage, then z 1.25 on the naming card from 12.8: card 1 sits at y >= 480 (under
        // the text box and the caption), Bevestigen 30 px above the bottom.
        const CL = capLayout(L);
        const cyTop = (top, z) => -SH / 2 - (top - L.H / 2) / z;      // phone top pinned at y = top
        const zN = Z_NAME45;
        cam.key(TM.camIn, TM.camInDur, { cx: 0, cy: cyTop(CL.phoneTop, 1.22), z: 1.22 });
        // the key to the naming card overlaps the push's soft landing (keys blend), so the two
        // read as one slowing move instead of a stop and a start
        const k3 = B.tapPlay - 0.15, k2 = Math.max(TM.camIn + TM.camInDur - 0.25, k3 - 1.2);   // on the card before the play tap
        cam.key(k2, k3 - k2, { cx: 0, cy: cyTop(CL.phoneTop, zN), z: zN });
        // 13.0 - 15.2: a slow, even push toward card 1's name field (+5 %, about the middle of the
        // card), so the 4 s on the naming card are never still. Bevestigen, scrolled up for the tap
        // at 15.2, keeps 8 px to the frame's bottom; the bezel rises to ~358, still under the
        // caption line (its ink ends ~345). The way back to BC's z 1.25 is the BC move itself,
        // which starts where the push ends: one move, no hold, no separate zoom-out (BC pins the
        // top at 440, away from the caption).
        const zP = zN * 1.05, kP = B.clip[0], kPEnd = B.tapConfirm;
        const topP = L.H - 8 - (CONFIRM_CY + 22) * zP;
        cam.key(kP, kPEnd - kP, { cx: 0, cy: cyTop(topP, zP), z: zP });
        if (bc.z) cam.key(kPEnd, TM.bcEnd - kPEnd, bc);
      } else {
        // 16:9: one zoom (BC's, 1.45) and BC's cx for the whole act, so the phone's left edge sits
        // at ~1035 from the push on (text column ends ~870) and the BC hand-off is a pure pan up.
        // cy drifts from -52 (status bar just in, banner top ~80 px down) to -16 (Bevestigen
        // ~60 px above the bottom) over the working stage and the naming screen.
        const zN = bc.z >= 1.3 && bc.z <= 1.6 ? bc.z : 1.45;
        const cx = Number.isFinite(bc.cx) ? bc.cx : -262;
        cam.key(TM.camIn, TM.camInDur, { cx, cy: -52, z: zN });
        const k2 = TM.camIn + TM.camInDur, k3 = B.typeName[0] + 0.3;
        cam.key(k2, k3 - k2, { cy: -16 });
        cam.key(TM.bc, TM.bcEnd - TM.bc, Object.assign({ cx, z: zN }, bc));
      }

      TM.screenLit = XF.end;                                         // the whole screen is white
      // the status bar turns dark-on-light at 45 % of the crossfade (black and white text read
      // about equally on the grey screen there)
      TM.lightB = xfAt(0.45);
      // the stage light hands back once the crossfade is whole and stage.js is dark-free
      TM.handBack = Math.max(XF.end, stageLightEnd);
      // the screen is dark until the crossfade is 45 % in
      Film.darkScreen([B.start, TM.lightB]);
      // Act A's dark-screen window runs to 10.3 (its own chrome fades until then), but from
      // B.start this act's screen covers act A's. Inside the crossfade's window only, the status
      // bar follows this act's screen, so its text always reads on the screen actually drawn.
      const baseIsDark = Film.isDarkScreen;
      if (typeof baseIsDark === "function") {
        Film.isDarkScreen = function (t) {
          return t >= B.start && t < TM.handBack ? t < TM.lightB : baseIsDark.call(Film, t);
        };
      }
      // Film.stageDark (stage.js) does not know this act's crossfade, which is what the stage shows
      // from B.start until the hand-back (stage.js' own dark-out front runs unseen under it). Inside
      // that window only, answer from the crossfade (even over the frame), so the overlay type and
      // the VOORBEELD label are coloured against what is actually drawn.
      const baseDark = Film.stageDark;
      if (typeof baseDark === "function") {
        Film.stageDark = function (t, x, y) {
          return t >= B.start && t < TM.handBack ? 1 - xfU(t) : baseDark(t, x, y);
        };
      }

      Film.push({ t: B.pushSpeakers[0], dur: PUSH_DUR, title: COPY.push.speakers.title, body: COPY.push.speakers.body, tapAt: B.tapPush });
      Film.tap({ t: B.tapPush, x: WAVE_CX, y: 104 });
      Film.tap({ t: B.tapPlay, x: X0 + IN + PLAY_W / 2, y: PLAY_CY });
      Film.tap({ t: TM.focus, x: WAVE_CX, y: INPUT_CY - S1 });
      // a quick tap: the finger lifts at once (touch.js fades the dot on a slow-start curve, and
      // the button under it leaves with the naming screen at TM.ret), so the dot is gone by ~15.44
      Film.tap({ t: B.tapConfirm, x: WAVE_CX, y: CONFIRM_CY, hold: 0 });

      mountStageLight(ctx);
      mountScreen(ctx);
      mountCaption(ctx);
    },
    render(t, ctx) {
      renderStageLight(t, ctx.L);
      renderScreen(t);
      renderCaption(t);
    },
  });
})();
