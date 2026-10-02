/*
 * Act A: Hook + Opnemen (0.0 - 10.6). Spec: docs/storyboard.md (Act A). Times: src/timeline.js (T.A).
 *
 *  0.0 - 2.5   Hook. Frame 1 is a finished problem poster: a small "SPREKER 3" tag (caption
 *              grammar: 600, uppercase tracking, #6B7280 on light; it calls back caption 3) over
 *              the fictional line, all of it in ink (no karaoke, T.A.hook.karaoke is unused), and
 *              under it, left-aligned, the question "En wanneer is dat?" as a second headline
 *              (700, #12804B, 0.81x the line: 78 px in 16:9, 70 px in 4:5), both on screen from
 *              frame 0. At T.A.hook.highlight the mint marker sweeps behind "Q4-deadline" and the
 *              word turns green right behind its edge; on the same clock the word grows 7 % about
 *              its left baseline and "aan." moves aside, so the marker is the hook's one distinct
 *              event. 16:9: the question leaves by 2.5; 4:5: it
 *              is gone before the rising phone's top edge reaches it (that time is measured from
 *              the phone motion). The tag leaves with the folding words. The whole hook block
 *              pushes in linearly from frame 0 (2.5 %/s about its left edge plus a 35 world px/s
 *              upward drift, on its own compositor layer so it moves sub-pixel smoothly): no
 *              frame is static, no ease-out stall, mean 60 fps frame diff over 0-1.8 ~0.6.
 *              4:5: line 86 px, left-aligned at x 84 like the VOORBEELD label, the block (tag to
 *              question) around the optical centre (~33-58 % of the height).
 *  0.0 - 2.9   The phone peeks in at the bottom edge from frame 0 (16:9 ~156 px at the phone's
 *              x, 4:5 ~140 px bottom-centre: island, live dot, "OPNAME LOOPT"), creeps up linearly
 *              (60 world px/s, ~108 px by 1.8) and runs straight into the rise to rest at
 *              T.A.phoneEnter (overlapping keys, no
 *              stall); its screen is the recording screen (dark) from T.A.start.
 *  2.0 - 3.0   Signature: words become the waveform. Live type is never scaled. Each word's glyphs
 *              fade and blur out (<= 4 px) first; its bars (count in proportion to the word's
 *              width, 36 in total) appear as separate thin bars, at bar width with the gaps open,
 *              spread evenly over the word at its x-height centre, and grow to their live waveform
 *              heights only once the glyphs are faint (glyph opacity < 0.3 before any bar passes
 *              half its height). No solid block is ever drawn. On one shared clock the bars then
 *              contract as one evenly spaced row into their slots of the waveform layout beside the
 *              phone (16:9: one row left of it; 4:5: two halves on both sides) and slide in under
 *              the bezel: the world bar is clipped at the phone's outer silhouette and the in-screen
 *              bar takes over at the screen edge (ink outside, mint inside). Every bar has landed
 *              by 2.975. Slots follow the bars' own x order (both lines merged), so the row only
 *              contracts and no bar passes another. The end point is recomputed every frame from
 *              Film.phoneToWorld.
 *  1.8 - 10.6  Recording screen, rebuilt from griffel-app recording-view.tsx: live dot, timer
 *              (time-compressed 00:00 -> 47:12), live waveform, microphone row, hold-to-stop with
 *              fill and the busy state ("Opslaan...").
 *  4.2 - 9.95  Meeting captions in L.captions: the older line is pushed up and dimmed first, then
 *              the new line rises into the freed slot; words light up as they are spoken. Caption 3
 *              (the hook line, called back by act C at the drop) gets its marker at ~7.45 and holds
 *              at full as the act's end image until the captions leave with the stop at 9.6.
 *  3.0 - 9.6   Camera creep toward the phone at an even speed (soft start and stop only), ending
 *              on the hand-off framing T.handoff.AB. Act A does not return to rest: act B moves
 *              on from this framing.
 *
 * Variant "vraag" (window.VARIANT === "vraag": index-vraag.html / portrait-vraag.html). The first
 * ~3 s are replaced by a question-first hook; the original pages never run any of it. Times in
 * T.V (defined below, film time):
 *  0.0         Frame 1 is a finished poster on the light stage: the phone at rest in a close
 *              framing (act C's question close-up), its screen the QuestionWizard exactly as act C
 *              draws it once Q1 has built (top row, "Stap 1 van 3 · Vragen", the question, the
 *              three options, "Of zelf invullen", "Vraag overslaan"), and in the text column the
 *              headline "Iets onduidelijk?" (COPY.variant.vraag, F2), up from frame 0.
 *  0.0 - 3.65  A push from frame 1 at one constant speed (no soft stop): 16:9 about "12 december"
 *              (z 1.55 -> 1.74 by the pull, tilting down a little so the top row keeps >= 50 px
 *              of air), 4:5 z 1.40 -> 1.58 with the phone top pinned under the text. The key runs
 *              on until the pull has landed, so the pull blends in from motion, never from rest.
 *  0.8         The touch-dot taps "12 december" (T.V.hookTap); it turns selected exactly like in
 *              act C (#D6FBEB, #00301B, CheckCircle2) and the sub "Griffel vraagt het eerst aan
 *              jou." rises with it ("Griffel vraagt" in the green emphasis, .hl-green-dark).
 *  2.25 - 3.65 The camera eases out (house curve, 1.4 s). 16:9: to the rest framing L.cam0, where
 *              the original's creep (from 2.975) takes over. 4:5: to a framing on the creep's own
 *              path (z 1.0, screen top at y 455, under the caption box), so the creep only pushes
 *              on, 1.0 -> 1.15, with no dip to the rest zoom.
 *  2.4 - 2.9   Time jump, not navigation: the wizard dissolves into this act's own recording
 *              screen (OPNAME LOOPT, the timer and the waveform running) on the house curve. No
 *              push: an iOS push from the right would read as "answering starts a recording",
 *              which is not the app's order (it auto-advances to Q2). The status bar turns white
 *              as the dissolve passes half. The hook overlay leaves as one block at T.V.out
 *              (2.75, gone 3.0, before the text column is ~15 % dark). The stage darkens from
 *              T.dark as in the original. The hook line and the words -> waveform morph are not
 *              shown; from ~3.65 on the film is the original (4:5: the creep from z 1.0).
 *
 * Everything below is a pure function of t.
 */
(function () {
  "use strict";
  const { Film, Eng } = window;
  const { clamp, lerp, P, E, hash, noise1, hexToRgb } = Eng;
  const F45 = Film.format === "45";
  const PHONE = Film.PHONE;
  const px = (v) => v.toFixed(2) + "px";

  // variant "vraag" (see the header). T.V: its film times; a page may pre-set any of them in
  // window.T.V before this file loads.
  const VAR = window.VARIANT === "vraag";
  const V = Object.assign({
    hookTap: 0.8,          // the tap on "12 december" (output 0.88: an event in the first second)
    subIn: 0.8,            // "Griffel vraagt het eerst aan jou." rises with the tap (fully up ~1.6)
    camPush: 0.0,          // the push starts here at one constant speed and runs until the pull lands
    swap: [2.4, 0.5],      // the wizard dissolves into the recording screen (house curve): a time jump
    pull: [2.25, 1.4],     // the camera eases out, landed by 3.65 (house curve)
    out: 2.75,             // the hook overlay leaves as one block (gone by 3.0)
  }, (window.T && window.T.V) || {});
  if (VAR) window.T.V = V;

  // Verbatim griffel-app nl.ts strings this act needs that copy.js does not carry (yet).
  const NL = {
    recStop: "Stop opname",        // home.record.stop
    recStopping: "Opslaan...",     // home.record.stopping (HoldToStopButton label while isBusy)
    micLabel: "Microfoon",         // record.mic.label (MicrophoneSelector label for a single unnamed input)
  };

  // ---- geometry contract: the recording waveform (shared by acts A, B and E) -------------
  const NB = 36, BAR_W = 4, BAR_STEP = 8, WAVE_H = 72, WAVE_CX = 196.5, WAVE_CY = 430;
  const WAVE_W = NB * BAR_STEP - (BAR_STEP - BAR_W); // 284
  const barCX = (k) => WAVE_CX - WAVE_W / 2 + BAR_W / 2 + k * BAR_STEP;

  // recording screen layout (recording-view.tsx: safe area 59/34, padding 24/32, gaps 24/16)
  const REC = {
    liveTop: 115,                                 // inset 59 + paddingVertical 32 + paddingTop 24
    timerTop: WAVE_CY - WAVE_H / 2 - 24 - 76,     // gap xl (24) above the waveform, line height 76
    descTop: WAVE_CY + WAVE_H / 2 + 24,
    micTop: WAVE_CY + WAVE_H / 2 + 24 + 22 + 24,  // MicrophoneSelector: gap xl under the description
    stopTop: 608, stopH: 64,                      // stop 64 + 16 + caption 18 + 16 + squares 64 = 786
    holdTop: 688,
    squaresTop: 722, square: 64,
  };
  const STOP_CY = REC.stopTop + REC.stopH / 2;

  const HEX = {
    ink: "#131417", greenInk: "#12804B", mintSoft: "#D6FBEB", mint: "#09FE94",
    brand: "#1ABA6D", recBg: "#0B0B0B", fg: "#FFFFFF", muted: "#9C9C9C", stop: "#FF4D2E", sub: "#6B7280",
    capDim: "#5F646B",
  };
  const RGB = {};
  for (const k in HEX) RGB[k] = hexToRgb(HEX[k]);
  const mix = (a, b, u) => { u = clamp(u); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; };
  const css = (c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;

  // ---- live waveform: the real mapping (0.08 .. 1) x 72 px, one bar per 90 ms ---------------
  const TICK = 0.09;
  // Act B copies the first version of this maths (seed 13.3) for its 9.8 s hand-off, so every
  // sample from S_SHARED on (all bars visible from about 9.0 s) uses exactly that version.
  // Earlier samples use a seed without pauses during the landing.
  const S_SHARED = 100;
  function sampleV(s) {
    const shared = s >= S_SHARED;
    const phrase = noise1(s * 0.05 + (shared ? 13.3 : 7.9));     // speech vs. short pauses
    if (phrase < (shared ? 0.24 : 0.22)) return Math.max(0.08, 0.1 + 0.15 * hash(s * 1.93 + 7.7)); // the app's idle jitter
    const env = noise1(s * 0.21 + 4.1);               // word envelope
    const syl = hash(s * 0.731 + 2.9);                // per-tick variation
    const norm = shared ? clamp(0.06 + 1.05 * env * (0.35 + 0.65 * syl)) : clamp(0.08 + 1.1 * env * (0.35 + 0.65 * syl));
    return Math.max(0.08, Math.min(1, Math.pow(norm, 0.7)));
  }
  // bar k shows sample n+k; every tick the samples shift one bar left (newest on the right),
  // animated over the tick with the app's ease-out quad.
  function liveV(k, t) {
    const f = t / TICK, n = Math.floor(f), fr = f - n;
    const e = 1 - (1 - fr) * (1 - fr);
    return lerp(sampleV(n + k - 1), sampleV(n + k), e);
  }

  // ---- state --------------------------------------------------------------------------------
  let A, C, L, T;
  const hk = { words: [] };            // hook (world layer)
  const fly = [];                      // 36 flying bars (world layer)
  const rec = { bars: [], idle: [], fadeTop: [] };   // recording screen (phone screen)
  const caps = [];                     // meeting captions (overlay)
  let meas = null;

  function el(tag, parent, style, text) { return Film.el(tag, null, parent, style, text); }

  // Icons: lucide-style (24 grid) and Ionicons mic-outline (512 grid)
  const ICON = {
    stop: '<rect x="4.5" y="4.5" width="15" height="15" rx="2.5" fill="currentColor"/>',
    pause: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  };
  const MIC_SVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" stroke="currentColor" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M192 448h128M384 208v32c0 70.4-57.6 128-128 128h0c-70.4 0-128-57.6-128-128v-32M256 368v80"/><path d="M256 64a63.68 63.68 0 00-64 64v111c0 35.2 29 65 64 65s64-29 64-65V128c0-36-28-64-64-64z"/></svg>`;
  function icon(parent, name, size, color, sw = 1.75) {
    const d = el("div", parent, { width: size + "px", height: size + "px", color, flex: "0 0 auto", display: "block" });
    d.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${ICON[name]}</svg>`;
    return d;
  }

  // ---- morph timing --------------------------------------------------------------------------
  // per word, from its fold start cs:
  const GLYPH_DUR = 0.2;               //   glyphs fade + blur out over 0.2 s (opacity < 0.3 from cs + 0.088)
  const BLUR_MAX = 4;                  //   glyph blur at the end of the fade (px)
  const BAR_IN = 0.05, BAR_GROW = 0.22;//   its thin bars grow from cs + 0.05 (half height at cs + 0.127)
  const WSTAG = 0.025;                 // words fold one after the other, the end nearest the phone first
  const FLY0 = 0.2;                    // the shared flight starts at morph start + 0.2
  const LAND_AT = 0.975;               // every bar has landed by morph start + 0.975 (2.975)
  const XH = 0.585;                    // x-height centre of an Inter 700 line box (lh 1.06), as a fraction
  // flight sub-moves, as fractions of the shared flight. x leads, y follows: the path bends.
  //  16:9: the words sit level with the waveform, left of the phone: the two lines merge into one
  //        row while it contracts and arcs up and over into the waveform layout beside the
  //        phone, then the row slides in.
  //  4:5:  the words sit above the phone: the row first spreads out sideways into two halves
  //        (clear of the rising phone), drops beside the phone onto the waveform line, slides in.
  const E_END = F45 ? 0.2 : 0.25;      // even out over the text's span (ahead of the gather)
  const G_END = F45 ? 0.32 : 0.5;      // gather into the waveform layout beside the phone
  const Y0 = F45 ? 0.26 : 0.12, Y_END = F45 ? 0.62 : 0.5;   // drop onto the waveform line
  const LIFT = F45 ? 0 : 70;           // 16:9: arc height (world px)
  const D0 = F45 ? 0.5 : 0.4;          // dock: slide in under the bezel
  // the end of the group nearest the phone leads: 16:9 the right end, 4:5 the inner ends
  const launchRank = (k) => (F45 ? (k < NB / 2 ? NB / 2 - 1 - k : k - NB / 2) : NB - 1 - k);
  // staging offset: the bars gather into the waveform layout this far beside the phone (fully
  // outside its silhouette), then slide in horizontally (16:9 from the left, 4:5 from both sides)
  const DOCK = F45 ? 236 : 381.5;
  const dockDir = (k) => (F45 ? (k < NB / 2 ? -1 : 1) : -1);

  // ---- mount ---------------------------------------------------------------------------------
  function mountHook(ctx) {
    const c0 = L.cam0, zf = 1 / c0.z;
    const s2w = (sx, sy) => ({ x: (sx - L.W / 2) / c0.z + c0.cx, y: (sy - L.H / 2) / c0.z + c0.cy });
    // 16:9: two lines in the left text column (the rising phone never runs into the words), the
    //       speaker tag above them, the question under them.
    // 4:5:  the same grammar left-aligned at x 84 (the VOORBEELD label's edge): tag, two lines,
    //       question; the group (~450 - 785) sits around the optical centre, clear of the phone
    //       that peeks in at the bottom edge; the question stays up until the rising phone's top
    //       edge reaches it.
    // The question is a second headline: 700, #12804B, 0.81x the line (wsz), line height wlh.
    const H = F45
      ? { x: 84, w: 912, top: 500, size: 86, lh: 1.06, wsz: 70, wlh: 1.1, gap: 22, tsz: 26, tgap: 16 }
      : { x: 170, w: 940, top: 392, size: 96, lh: 1.06, wsz: 78, wlh: 1.1, gap: 26, tsz: 28, tgap: 18 };
    hk.H = H;
    hk.fs = H.size * zf;                         // font size in world px
    const o = s2w(H.x, H.top);
    hk.ox = o.x; hk.oy = o.y;
    // the drift scales about the left edge of the line block, so the left alignment holds;
    // will-change keeps the block on its own layer: without it the glyph baselines snap to whole
    // pixels and the slow drift steps 1 px / 0 px (frame diff alternating 0.8 / 0.25)
    hk.wrap = el("div", ctx.world, {
      position: "absolute", left: px(o.x), top: px(o.y), width: px(H.w * zf), textAlign: "left", transformOrigin: "0% 50%", willChange: "transform",
    });
    hk.line = el("div", hk.wrap, {
      position: "relative", fontSize: px(hk.fs), fontWeight: 700, letterSpacing: "-0.032em",
      lineHeight: String(H.lh), color: HEX.ink,
    });
    const words = C.hook.line.split(/\s+/).filter(Boolean);
    const keyAt = Math.max(0, words.indexOf(C.hook.key));
    hk.keyAt = keyAt;
    hk.after = [];
    words.forEach((w, i) => {
      if (i) hk.line.appendChild(document.createTextNode(" "));
      // break the line before the key word: "…dan houden we de / Q4-deadline aan."
      if (i === keyAt && i > 0) el("br", hk.line);
      // isolation keeps the marker (z -1) inside its word whatever the word's opacity or filter
      const span = el("span", hk.line, { display: "inline-block", position: "relative", whiteSpace: "pre", isolation: "isolate" });
      let marker = null, green = null;
      const key = w === C.hook.key;
      // the key word grows about its left baseline on the marker beat
      if (key) span.style.transformOrigin = `0% ${(EMPH_OY * 100).toFixed(1)}%`;
      if (key) {
        // mint marker block (a little taller than the x-height, so it survives downscaling)
        marker = el("span", span, {
          position: "absolute", left: "-0.07em", right: "-0.07em", top: "0.15em", height: "0.88em",
          background: HEX.mintSoft, borderRadius: "0.09em", zIndex: -1, transformOrigin: "0 50%", transform: "scaleX(0)",
        });
      }
      span.appendChild(document.createTextNode(w));
      if (key) {
        // the whole line is ink from frame 0; a green copy is revealed by the marker's sweep
        green = el("span", span, { position: "absolute", left: "0px", top: "0px", whiteSpace: "pre", color: HEX.greenInk, clipPath: "inset(-0.3em 100% -0.3em -0.2em)" }, w);
      }
      hk.words.push({ span, marker, green, text: w, key });
    });
    // the question: a second headline (700, #12804B) under the line it questions, left-aligned
    // with it, on screen from frame 0; out of the layout flow (the line block is the pivot)
    hk.whisper = el("div", hk.wrap, {
      position: "absolute", left: "0px", top: `calc(100% + ${px(H.gap * zf)})`, width: "100%", fontSize: px(H.wsz * zf), fontWeight: 700,
      letterSpacing: "-0.03em", lineHeight: String(H.wlh), color: HEX.greenInk, whiteSpace: "nowrap",
    }, C.hook.whisper);
    // the speaker tag, in the meeting captions' grammar (600, uppercase, tracking 0.12em; #6B7280 on
    // the light stage): frame 1 reads as a line said in a meeting, and it calls back caption 3
    const cap = (C.captions || []).find((c) => c.text === C.hook.line) || (C.captions || [])[2];
    hk.tag = el("div", hk.wrap, {
      position: "absolute", left: "0px", bottom: `calc(100% + ${px(H.tgap * zf)})`, fontSize: px(H.tsz * zf), lineHeight: "1.3", fontWeight: 600,
      letterSpacing: "0.12em", textTransform: "uppercase", color: HEX.sub, whiteSpace: "nowrap",
    }, cap ? cap.who : "");

    // the flying bars live above the hook text, in the world (the camera applies to them too)
    hk.barLayer = el("div", ctx.world, { position: "absolute", left: "0px", top: "0px", width: "0px", height: "0px" });
    for (let k = 0; k < NB; k++) {
      fly.push(el("div", hk.barLayer, { position: "absolute", left: "0px", top: "0px", width: BAR_W + "px", height: "10px", borderRadius: "999px", background: HEX.ink, visibility: "hidden", willChange: "transform" }));
    }
  }

  function mountRecording(ctx) {
    const s = ctx.phone.screen;
    rec.root = el("div", s, { position: "absolute", left: "0px", top: "0px", width: "393px", height: "852px", background: HEX.recBg, zIndex: 4, overflow: "hidden", visibility: "hidden" });

    // live indicator
    const live = el("div", rec.root, { position: "absolute", left: "0px", top: REC.liveTop + "px", width: "393px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" });
    rec.dot = el("div", live, { width: "10px", height: "10px", borderRadius: "999px", background: HEX.stop });
    el("div", live, { fontSize: "12px", fontWeight: 700, letterSpacing: "1.6px", textTransform: "uppercase", color: HEX.fg, lineHeight: "16px" }, C.app.recLive);

    // timer
    rec.timer = el("div", rec.root, {
      position: "absolute", left: "0px", top: REC.timerTop + "px", width: "393px", textAlign: "center",
      fontSize: "72px", lineHeight: "76px", fontWeight: 700, letterSpacing: "-2.4px", color: HEX.fg, fontVariantNumeric: "tabular-nums",
    }, "00:00");
    rec.timerText = "00:00";

    // waveform: faint idle slots, then the bars (they slide in from the screen edge and live)
    for (let k = 0; k < NB; k++) {
      const h = 0.08 * WAVE_H;
      rec.idle.push(el("div", rec.root, { position: "absolute", left: px(barCX(k) - BAR_W / 2), top: px(WAVE_CY - h / 2), width: BAR_W + "px", height: px(h), borderRadius: "2px", background: HEX.mint, opacity: 0 }));
    }
    for (let k = 0; k < NB; k++) {
      rec.bars.push(el("div", rec.root, { position: "absolute", left: px(barCX(k) - BAR_W / 2), top: "0px", width: BAR_W + "px", height: "6px", borderRadius: "2px", background: HEX.mint, visibility: "hidden" }));
    }

    // description
    const desc = el("div", rec.root, { position: "absolute", left: "0px", top: REC.descTop + "px", width: "393px", textAlign: "center", fontSize: "15px", lineHeight: "22px", fontWeight: 500, color: HEX.muted }, C.app.recWriting);

    // MicrophoneSelector (single input, not switchable): mic-outline 14 + label 13/500, muted
    const mic = el("div", rec.root, { position: "absolute", left: "0px", top: REC.micTop + "px", width: "393px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: HEX.muted });
    el("div", mic, { width: "14px", height: "14px" }).innerHTML = MIC_SVG(14);
    el("div", mic, { fontSize: "13px", lineHeight: "16px", fontWeight: 500, color: HEX.muted, whiteSpace: "nowrap" }, C.app.recMic || NL.micLabel);
    rec.fadeTop.push(live, rec.timer, desc, mic);

    // hold-to-stop button
    rec.stop = el("div", rec.root, {
      position: "absolute", left: "24px", top: REC.stopTop + "px", width: "345px", height: REC.stopH + "px", borderRadius: "10px",
      background: HEX.stop, overflow: "hidden", boxShadow: "0 6px 16px rgba(255,77,46,0.4)",
    });
    rec.fill = el("div", rec.stop, { position: "absolute", left: "0px", top: "0px", bottom: "0px", width: "0px", background: "rgba(255,255,255,0.25)" });
    // label: "Stop opname", and "Opslaan..." once onStop has set isBusy
    const stopRow = (label) => {
      const r = el("div", rec.stop, { position: "absolute", left: "0px", top: "0px", width: "345px", height: REC.stopH + "px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" });
      icon(r, "stop", 22, HEX.fg);
      el("div", r, { fontSize: "18px", fontWeight: 700, letterSpacing: "-0.3px", color: HEX.fg, whiteSpace: "nowrap" }, label);
      return r;
    };
    rec.stopLabel = stopRow(C.app.recStop || NL.recStop);
    rec.busyLabel = stopRow(C.app.recStopping || NL.recStopping);
    rec.busyLabel.style.opacity = "0";

    el("div", rec.root, { position: "absolute", left: "0px", top: REC.holdTop + "px", width: "393px", textAlign: "center", fontSize: "13px", lineHeight: "18px", fontWeight: 500, color: HEX.muted, opacity: 0.8 }, C.app.recHold);

    // pause + cancel squares (icon only, as in the app)
    const sq = (x, name, size, color) => {
      const b = el("div", rec.root, {
        position: "absolute", left: x + "px", top: REC.squaresTop + "px", width: REC.square + "px", height: REC.square + "px",
        borderRadius: "10px", border: "1.5px solid rgba(156,156,156,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
      });
      icon(b, name, size, color, 2);
      return b;
    };
    const rowW = REC.square * 2 + 20;
    sq(WAVE_CX - rowW / 2, "pause", 24, HEX.fg);
    sq(WAVE_CX - rowW / 2 + REC.square + 20, "trash", 22, HEX.muted);
  }

  // captions: 16:9 tag above the line; 4:5 tag in a fixed column left of the line (one line each;
  // 36 px = 12 px at a 360 px feed width, the tag scaled with it)
  const CAP = F45
    ? { line: 36, tag: 23, tagW: 160, gap: 14 }
    : { line: 46, tag: 24, tagW: 0, gap: 0 };
  function mountCaptions(ctx) {
    const B = L.captions;
    caps.wrap = el("div", ctx.overlay, { position: "absolute", left: B.x + "px", top: B.y + "px", width: B.w + "px", height: "0px" });
    caps.rowH = F45
      ? Math.round(CAP.line * 1.3) + 14
      : Math.round(CAP.tag * 1.3) + 8 + Math.round(CAP.line * 1.25) + 24 + 16;
    C.captions.forEach((c, i) => {
      const row = el("div", caps.wrap, {
        position: "absolute", left: "0px", top: "0px", width: B.w + "px", visibility: "hidden",
        display: F45 ? "flex" : "block", alignItems: "baseline", gap: CAP.gap + "px", whiteSpace: "nowrap",
      });
      el("div", row, {
        fontSize: CAP.tag + "px", lineHeight: "1.3", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: HEX.muted,
        marginBottom: F45 ? "0px" : "8px", flex: F45 ? `0 0 ${CAP.tagW}px` : "none",
      }, c.who);
      const line = el("div", row, { fontSize: CAP.line + "px", lineHeight: F45 ? "1.3" : "1.25", fontWeight: 500, letterSpacing: "-0.012em", color: HEX.fg });
      const words = [];
      c.text.split(/\s+/).filter(Boolean).forEach((w, j) => {
        if (j) line.appendChild(document.createTextNode(" "));
        const s = el("span", line, { display: "inline-block", position: "relative", whiteSpace: "pre" });
        s.appendChild(document.createTextNode(w));
        let ul = null;
        if (c.key && w === c.key) {
          ul = el("span", s, { position: "absolute", left: "0px", right: "0.04em", bottom: "0.0em", height: F45 ? "3px" : "4px", borderRadius: "2px", background: HEX.brand, transformOrigin: "0 50%", transform: "scaleX(0)" });
        }
        words.push({ s, ul, key: !!ul });
      });
      caps.push({ row, words, win: A.captions[i] });
    });
  }

  // ---- measurement (lazy: fonts must be loaded for the real word widths) ---------------------
  function measure() {
    if (meas && meas.final) return meas;
    // "loaded" alone is true before any face has been requested; check the hook's own face
    const final = !!(document.fonts && document.fonts.status === "loaded" && document.fonts.check(`700 ${Math.round(hk.fs)}px Inter`));
    const ws = hk.words.map((w) => ({ x: w.span.offsetLeft, y: w.span.offsetTop, w: w.span.offsetWidth, h: w.span.offsetHeight }));
    const pivot = { x: 0, y: hk.wrap.offsetHeight / 2 };
    // bars per word in proportion to the word's width, at least 2, 36 in total
    const tot = ws.reduce((a, b) => a + b.w, 0) || 1;
    const raw = ws.map((b) => (b.w / tot) * NB);
    const n = raw.map((r) => Math.max(2, Math.floor(r)));
    let left = NB - n.reduce((a, b) => a + b, 0);
    const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (let q = 0; left > 0; q = (q + 1) % order.length, left--) n[order[q][1]]++;
    while (left < 0) { const i = n.indexOf(Math.max(...n)); n[i]--; left++; }
    // each word's bars are spread evenly over the word at its x-height centre (thin, gaps open);
    // the slots follow the bars' own horizontal order (both lines merged), so the row only
    // contracts on its shared clock and no bar ever passes another
    // the marker beat has fully landed long before the fold (highlight ends 1.15, fold from 2.0):
    // the bars spawn from the grown key word and from the words it moved aside
    const kw = ws[hk.keyAt];
    hk.after = kw ? ws.map((b, i) => i).filter((i) => i > hk.keyAt && ws[i].y === kw.y) : [];
    const keyW = kw ? kw.w : 0;
    const emphX = (i, lx) => (!kw ? lx : i === hk.keyAt ? kw.x + (lx - kw.x) * (1 + EMPH) : hk.after.includes(i) ? lx + keyW * EMPH : lx);
    const emphY = (i, ly) => (kw && i === hk.keyAt ? kw.y + kw.h * EMPH_OY + (ly - kw.y - kw.h * EMPH_OY) * (1 + EMPH) : ly);
    const bars = [];
    ws.forEach((b, i) => {
      for (let j = 0; j < n[i]; j++) {
        const lx0 = b.x + ((j + 0.5) * b.w) / n[i];
        bars.push({ i, j, cnt: n[i], lx: emphX(i, lx0), ly: emphY(i, b.y + b.h * XH) });
      }
    });
    bars.sort((a, b) => a.lx - b.lx || a.ly - b.ly || a.i - b.i || a.j - b.j);
    // the two lines interleave in x with alternating gaps; early in the flight the bars even out
    // over the text's span (ex), so the row that contracts into the slots is evenly spaced
    const spanL = bars.length ? bars[0].lx : 0, spanR = bars.length ? bars[bars.length - 1].lx : 0;
    bars.forEach((b, k) => { b.k = k; b.ex = spanL + (k * (spanR - spanL)) / Math.max(1, bars.length - 1); });
    // the words fold one after the other; the word whose slots lead the dock goes first
    const lead = ws.map((_, i) => Math.min(...bars.filter((b) => b.i === i).map((b) => launchRank(b.k))));
    const cs = [];
    ws.map((_, i) => i).sort((a, b) => lead[a] - lead[b] || a - b).forEach((i, r) => {
      cs[i] = A.hook.morph[0] + r * WSTAG;
    });
    // one shared flight for all bars: every bar is home by morph start + LAND_AT
    const fsG = A.hook.morph[0] + FLY0;
    const land = A.hook.morph[0] + LAND_AT;
    const flyDur = land - fsG;
    for (const b of bars) { b.on = cs[b.i] + BAR_IN; b.land = land; }
    const ys = [...new Set(ws.map((b) => b.y))];
    const rowY = ys.reduce((a, y) => a + y, 0) / ys.length + (ws[0] ? ws[0].h * XH : 0);
    // the question leaves with the folding words; in 4:5 it is gone before the phone's top edge
    // (peeking from frame 0, then rising) reaches its bottom edge (sampled from the phone motion
    // and the camera from T.A.start on, so it follows any re-timing of T.A.phoneEnter)
    let wGone = whisperOut() + WHISPER_OUT_DUR;
    if (F45) {
      const yb = hk.whisper.offsetTop + hk.whisper.offsetHeight;
      const [p0, pd] = A.phoneEnter;
      for (let t = A.start; t <= p0 + pd; t += 0.005) {
        const k = driftK(t);
        const sy = Film.toScreen(0, hk.oy + pivot.y + (yb - pivot.y) * k + driftY(t), t).y;
        const top = Film.phoneToScreen(PHONE.w / 2, -PHONE.bezel, t).y;
        if (top <= sy + WHISPER_CLEAR) { wGone = Math.min(wGone, t - 0.02); break; }
      }
    }
    meas = { final, ws, pivot, n, bars, cs, fsG, flyDur, rowY, wGone, keyW };
    return meas;
  }

  // ---- render helpers ------------------------------------------------------------------------
  // the hook drifts at a constant rate from frame 1 until it has folded (no ease-out stall): a calm
  // push (2.5 %/s about the block's left edge: 4.5 % at 1.8, 5 % at the fold) plus a slight upward
  // drift (RISE world px/s: 16:9 ~0.58 px per frame, 4:5 ~0.5), so the opening never reads as a
  // static text post. Mean 60 fps frame diff over 0-1.8 lands at ~0.5-0.6 with no spike.
  const DRIFT = 0.025;                 // scale per second
  const RISE = 35;                     // upward drift, world px per second
  const driftK = (t) => 1 + DRIFT * Math.max(0, t);
  const driftY = (t) => -RISE * Math.max(0, t);
  function hookPt(lx, ly, t, m) {
    // a point of the line block (local px) in world px, with the drift
    const k = driftK(t), dy = driftY(t);
    return { x: hk.ox + m.pivot.x + (lx - m.pivot.x) * k, y: hk.oy + m.pivot.y + (ly - m.pivot.y) * k + dy, k, dy };
  }
  // the marker beat: while the mint marker sweeps, "Q4-deadline" grows by EMPH about its left
  // baseline (house curve, on the sweep's own clock, no overshoot) and the rest of its line moves
  // aside by the same amount, so the marker reads as the one distinct event of the hook
  const EMPH = 0.07;
  const EMPH_OY = 0.84;                // baseline of an Inter line box at lh 1.06, as a fraction
  const emphU = (t) => P(t, A.hook.highlight[0], A.hook.highlight[1]);
  // the whole line is ink from frame 0; the key word's bars start in its marker green
  const barRGB = (w) => (w.key ? RGB.greenInk : RGB.ink);
  const stopT = () => A.holdStop[0] + A.holdStop[1];
  function waveV(k, t) {
    const v = liveV(k, Math.min(t, stopT() + 0.3));
    return lerp(v, 0.08, P(t, stopT(), 0.3));
  }
  function fmt(sec) {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
  }
  const glyphOut = (i, t, m) => P(t, m.cs[i], GLYPH_DUR);
  // the question is on screen from frame 0 and leaves with the folding words: 16:9 fully visible
  // to 2.35, gone by 2.5; 4:5 gone by m.wGone (measure: before the phone's top reaches it)
  const whisperOut = () => A.hook.morph[0] + 0.35;
  const WHISPER_OUT_DUR = 0.15;
  const WHISPER_CLEAR = 12;            // 4:5: screen px kept between the question and the phone top

  // one bar's flight state at time t (world px); shared by the world bars and the in-screen bars
  function flight(b, t, m, pm) {
    // one shared clock for every bar: the row contracts evenly into its slots and arrives rigid
    const tau = clamp((t - m.fsG) / m.flyDur);
    const s = hookPt(b.lx, b.ly, t, m);           // spawn: on the word, at its x-height centre
    const tg = Film.phoneToWorld(barCX(b.k), WAVE_CY, t);
    const gx = tg.x + dockDir(b.k) * DOCK * pm.s;
    const ue = E.house(clamp(tau / E_END));
    const ug = E.house(clamp(tau / G_END));
    const uy = E.house(clamp((tau - Y0) / (Y_END - Y0)));
    const us = E.house(clamp((tau - D0) / (1 - D0)));
    const xa = lerp(s.x, hookPt(b.ex, b.ly, t, m).x, ue);
    const x = xa + (gx - xa) * ug + (tg.x - gx) * us;
    // the two text lines merge into one row while it gathers; 16:9 adds an arc over the gap
    const yRow = lerp(s.y, hk.oy + m.pivot.y + (m.rowY - m.pivot.y) * s.k + s.dy, ug);
    const y = lerp(yRow, tg.y, uy) - LIFT * Math.sin(Math.PI * clamp(tau / Y_END));
    // a thin bar from its first frame (bar width, capsule): it only grows to its live waveform
    // height once the word's glyphs are faint
    const gr = P(t, b.on, BAR_GROW);
    const bw = BAR_W * pm.s;
    const h = Math.max(0.5, waveV(b.k, t) * WAVE_H * pm.s * gr);
    // ink outside the phone: the key word's bars carry its green only while they are faint
    const col = mix(barRGB(hk.words[b.i]), RGB.ink, gr);
    // the same bar in phone logical px (for the part that is inside the phone's silhouette)
    const lx = barCX(b.k) + (x - tg.x) / pm.s, ly = WAVE_CY + (y - tg.y) / pm.s;
    return { x, y, h, bw, op: clamp(gr * 2.5), col, flying: t >= b.on, lx, ly, tg, landed: t >= b.land };
  }

  function renderHook(t, m) {
    const lastGone = Math.max(...m.cs) + GLYPH_DUR;
    const vis = t < Math.max(lastGone, m.wGone) + 0.05;
    hk.wrap.style.visibility = vis ? "visible" : "hidden";
    // styled on every frame, hidden or not, so the DOM state never depends on the seek order
    {
      hk.wrap.style.transform = `translate3d(0, ${driftY(t).toFixed(3)}px, 0) scale(${driftK(t).toFixed(5)})`;
      const hl = P(t, A.hook.highlight[0], A.hook.highlight[1]);
      // the marker beat: the key word grows about its left baseline, the rest of its line moves aside
      const eu = emphU(t);
      hk.words.forEach((w, i) => {
        if (i === hk.keyAt) w.span.style.transform = eu > 0 ? `scale(${(1 + EMPH * eu).toFixed(5)})` : "none";
        else if (hk.after.includes(i)) w.span.style.transform = eu > 0 ? `translate3d(${(m.keyW * EMPH * eu).toFixed(3)}px, 0, 0)` : "none";
      });
      // the speaker tag leaves with the first folding words (fade + <= 4 px blur, never scaled)
      const tgo = P(t, Math.min(...m.cs), GLYPH_DUR);
      hk.tag.style.opacity = (1 - tgo).toFixed(3);
      hk.tag.style.filter = tgo > 0.001 ? `blur(${(BLUR_MAX * tgo).toFixed(2)}px)` : "none";
      hk.tag.style.visibility = tgo >= 1 ? "hidden" : "inherit";
      hk.words.forEach((w, i) => {
        w.span.style.color = HEX.ink;
        // the glyphs fade and blur out before the word's bars grow (never scaled)
        const g = glyphOut(i, t, m);
        w.span.style.opacity = (1 - g).toFixed(3);
        w.span.style.filter = g > 0.001 ? `blur(${(BLUR_MAX * g).toFixed(2)}px)` : "none";
        w.span.style.visibility = g >= 1 ? "hidden" : "inherit";
        if (w.marker) {
          w.marker.style.transform = `scaleX(${hl.toFixed(4)})`;
          w.green.style.clipPath = `inset(-0.3em ${((1 - hl) * 100).toFixed(2)}% -0.3em -0.2em)`;
        }
      });
      // the question: on screen from frame 0, leaves with the folding words (fade + <= 4 px blur)
      const wo = P(t, m.wGone - WHISPER_OUT_DUR, WHISPER_OUT_DUR);
      const wop = 1 - wo;
      hk.whisper.style.visibility = wop > 0.001 ? "inherit" : "hidden";
      hk.whisper.style.opacity = wop.toFixed(3);
      hk.whisper.style.transform = `translate3d(0, ${(-wo * 8).toFixed(2)}px, 0)`;
      hk.whisper.style.filter = wo > 0.001 ? `blur(${(BLUR_MAX * wo).toFixed(2)}px)` : "none";
    }
  }

  // the phone's outer silhouette in world px (no rotation in this act)
  function silhouette(pm) {
    const hw = (PHONE.w / 2 + PHONE.bezel) * pm.s, hh = (PHONE.h / 2 + PHONE.bezel) * pm.s;
    return { l: pm.x - hw, r: pm.x + hw, t: pm.y - hh, b: pm.y + hh };
  }
  function renderFly(t, m, fl, pm) {
    const S = silhouette(pm);
    for (const b of m.bars) {
      const e = fly[b.k], f = fl[b.k];
      if (!f.flying || f.landed || f.op <= 0.001) { e.style.visibility = "hidden"; continue; }
      // a bar passes under the bezel: the world bar is clipped at the outer silhouette, the
      // in-screen bar (renderRecording) shows the part inside the screen
      let x0 = f.x - f.bw / 2, x1 = f.x + f.bw / 2;
      if (f.y > S.t && f.y < S.b && x1 > S.l && x0 < S.r) {
        if (f.x < pm.x) x1 = Math.min(x1, S.l); else x0 = Math.max(x0, S.r);
      }
      const w = x1 - x0;
      if (w <= 0.05) { e.style.visibility = "hidden"; continue; }
      e.style.visibility = "inherit";
      e.style.width = px(w);
      e.style.height = px(f.h);
      // always a capsule at bar width (never a block)
      e.style.borderRadius = px(Math.min(f.bw, f.h) / 2);
      e.style.opacity = f.op.toFixed(3);
      e.style.background = css(f.col);
      e.style.transform = `translate3d(${x0.toFixed(2)}px, ${(f.y - f.h / 2).toFixed(2)}px, 0)`;
    }
  }

  function renderRecording(t, m, fl, pm) {
    // visible from T.A.start: the phone peeks in at the bottom edge from frame 0
    const [r0, r1] = A.recScreen;
    const vis = t >= Math.min(A.start, r0 - 0.2) && t < r1;
    rec.root.style.visibility = vis ? "visible" : "hidden";
    if (!vis) return;
    // live dot: 1 <-> 0.3 on a 1.6 s sine (the app's 800 ms down, 800 ms up loop)
    rec.dot.style.opacity = (0.65 + 0.35 * Math.cos((2 * Math.PI * t) / 1.6)).toFixed(3);
    // timer: 00:00 -> 47:12, accelerating then easing; frozen at the stop
    const tm = A.timer;
    // quantised to the 60 fps OUTPUT frame (Film.frameT, so it holds at any T.SCALE): the 8
    // motion-blur subframes of one frame all show the same whole value, so the fast-running digits
    // never smear into each other
    const tq = Film.frameT(t);
    const sec = tm.from + (tm.to - tm.from) * P(Math.min(tq, stopT()), tm.start, tm.end - tm.start, E.house);
    const txt = fmt(sec);
    if (txt !== rec.timerText) { rec.timer.textContent = txt; rec.timerText = txt; }
    // hand-off to act B: live row, timer, description and mic row leave before its hero arrives
    // (the waveform stays: act B's morph takes the bars over)
    const top = (1 - P(t, handOff(), 0.25)).toFixed(3);
    for (const e of rec.fadeTop) e.style.opacity = top;
    // waveform: a faint idle slot until its bar lands; a bar on its way in shows from the screen
    // edge on (it continues the world bar that passed under the bezel), then lives
    const idleOp = 0.2 * P(t, A.phoneEnter[0], 0.6);
    for (const b of m.bars) {
      const e = rec.bars[b.k], f = fl[b.k];
      rec.idle[b.k].style.opacity = f.landed ? "0" : idleOp.toFixed(3);
      if (f.landed) {
        const h = waveV(b.k, t) * WAVE_H;
        e.style.visibility = "inherit";
        e.style.width = BAR_W + "px";
        e.style.left = px(barCX(b.k) - BAR_W / 2);
        e.style.height = px(h);
        e.style.top = px(WAVE_CY - h / 2);
      } else if (f.flying && f.lx > -f.bw && f.lx < PHONE.w + f.bw && f.ly > 0 && f.ly < PHONE.h) {
        const lw = f.bw / pm.s, lh = f.h / pm.s;
        e.style.visibility = "inherit";
        e.style.width = px(lw);
        e.style.left = px(f.lx - lw / 2);
        e.style.height = px(lh);
        e.style.top = px(f.ly - lh / 2);
      } else e.style.visibility = "hidden";
    }
    // hold-to-stop: white 25 % fill left to right over 1.2 s (linear, as in the app)
    const [h0, hd] = A.holdStop;
    const st = stopT();
    const fillU = clamp((t - h0) / hd);
    rec.fill.style.width = px(345 * fillU * (1 - P(t, st, 0.16, E.out)));
    // onStop sets isBusy: the button dims to 0.6 and the label becomes "Opslaan..."
    const busy = P(t, st, 0.15);
    rec.stop.style.opacity = (1 - 0.4 * P(t, st, 0.2)).toFixed(3);
    rec.stopLabel.style.opacity = (1 - busy).toFixed(3);
    rec.busyLabel.style.opacity = busy.toFixed(3);
  }
  const handOff = () => T.B.morphBarsToSteps[0] + 0.2;   // 10.0

  // ---- camera creep (also drives the captions' parallax) -------------------------------------
  // The recording hold creeps toward the phone at an even speed: a trapezoid velocity profile
  // (soft start and stop over the first and last 15 %, constant in between), so no stretch of the
  // hold is frozen and nothing is front-loaded. It ends on the A -> B hand-off framing and act A
  // does not return to rest; act B moves on from there.
  const creep0 = () => A.hook.morph[0] + LAND_AT;           // 2.975: the moment the last bar lands
  function creepEase(u, a = 0.15) {
    u = clamp(u);
    const v = 1 / (1 - a);
    if (u < a) return (v * u * u) / (2 * a);
    if (u > 1 - a) return 1 - (v * (1 - u) * (1 - u)) / (2 * a);
    return v * (a / 2 + (u - a));
  }
  const num = (v, d) => (typeof v === "number" && isFinite(v) ? v : d);
  // T.handoff.AB (timeline.js, read with Film.handoff("AB")): the creep framing act B starts
  // from, landed by T.handoff.AB.t. Falls back to the same framing (+6 %, phone held in place)
  // and the stop if the hand-off is missing.
  function handoff() {
    const fb = F45 ? { cx: 0, cy: -232, z: L.cam0.z * 1.06 } : { cx: -362, cy: 6, z: L.cam0.z * 1.06 };
    const ho = T.handoff && T.handoff.AB;
    const c = ho && ho[Film.format] ? (Film.handoff ? Film.handoff("AB") : ho[Film.format]) : fb;
    const cam = { cx: num(c.cx, fb.cx), cy: num(c.cy, fb.cy), z: num(c.z, fb.z) };
    const tEnd = ho && typeof ho.t === "number" && ho.t > creep0() + 4 ? ho.t : stopT();
    return { cam, t: tEnd };
  }
  const creepU = (t) => creepEase((t - creep0()) / (handoff().t - creep0()));

  // captions: the last one (the hook line) holds at full until the stop, then leaves with the
  // chapter word; the others leave at the end of their window
  const CAP_EXIT = 0.32, LAST_EXIT = 0.36;
  function capExit(i) {
    const b = caps[i].win[1];
    if (i === caps.length - 1) { const x0 = Math.max(b, stopT()); return [x0, LAST_EXIT]; }
    return [b - CAP_EXIT, CAP_EXIT];
  }
  function renderCaptions(t) {
    const rowH = caps.rowH;
    const PUSH_LEAD = 0.25, PUSH_DUR = 0.5;
    const push = (j) => P(t, caps[j].win[0] - PUSH_LEAD, PUSH_DUR);
    const last = caps.length - 1;
    let any = false;
    caps.forEach((c, i) => {
      const [a] = c.win;
      const [x0, exitDur] = capExit(i);
      const inU = P(t, a + 0.1, 0.45);
      const outU = P(t, x0, exitDur, E.in);
      const vis = t >= a + 0.09 && t < x0 + exitDur;
      c.row.style.visibility = vis ? "inherit" : "hidden";
      if (!vis) return;
      any = true;
      // pushed up by every newer caption, before that caption shows a single pixel
      let slot = 0;
      for (let j = i + 1; j < caps.length; j++) slot += push(j);
      // the new line only draws once the older line has (nearly) left its slot
      const gate = i > 0 ? clamp((push(i) - 0.5) / 0.3) : 1;
      // 16:9: newest on the lower row of the box; 4:5: newest on the box top (clear of the phone),
      // the older line moves up into the gap under the chapter text
      // 4:5: while the ch1 sub lines are still up, an older line only lifts a third of a row and
      // dims further, so it never reads as a third sub line under "Griffel vraagt daarna door."
      const subsUp = F45 && t < window.T.O.ch1.subOut + 0.3;
      const lift = subsUp ? 0.35 : 1;
      const y = (F45 ? -slot * lift : 1 - slot) * rowH + (1 - inU) * 18 - outU * 12;
      const op = clamp(inU * 1.5) * gate * (1 - outU) * (1 - (subsUp ? 1.0 : 0.6) * clamp(slot * (subsUp ? 1.6 : 1)));
      c.row.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      c.row.style.opacity = op.toFixed(3);
      c.row.style.filter = outU > 0.001 ? `blur(${(outU * 6).toFixed(2)}px)` : "none";
      // words light up as they are spoken; the hook line (last caption) is said quickly, so its
      // marker lands at ~7.45 and the line holds marked as the act's end image
      const n = c.words.length;
      const isLast = i === last;
      const stagger = isLast ? 0.05 : Math.min(0.12, 1.0 / n);
      const s0 = a + (isLast ? 0.1 : 0.22);
      const mk0 = isLast ? a + 0.25 : s0 + n * stagger + 0.05;
      c.words.forEach((w, j) => {
        let col = mix(RGB.capDim, RGB.fg, P(t, s0 + j * stagger, 0.22));
        if (w.key) {
          const mu = P(t, mk0, 0.45);
          col = mix(col, RGB.brand, mu);
          w.ul.style.transform = `scaleX(${mu.toFixed(4)})`;
        }
        w.s.style.color = css(col);
      });
    });
    caps.wrap.style.visibility = any ? "visible" : "hidden";
    // parallax: the captions drift up 12 px with the creep, at the same even speed
    caps.wrap.style.transform = `translate3d(0, ${(-12 * creepU(t)).toFixed(2)}px, 0)`;
  }

  // ---- variant "vraag": the question-first hook (see the header) ------------------------------
  // The QuestionWizard as act C draws it once Q1 has built (act-c.js: top row, step indicator,
  // question page). Same layout (phone logical px), tokens, icons and option grammar, copied here
  // so the parts stay independent.
  const WZ = { X0: 20, CW: 353, top: 75, step: 135, bar: 161, q: 191, desc: 299, opt: [363, 429, 495], freeL: 575, free: 599, skip: 687 };
  const WK = {
    ink: "#131417", muted: "#6B7280", border: "#E8EAED", mint: "#D6FBEB", mintInk: "#00301B", track: "rgba(19,20,23,0.20)",
  };
  // verbatim griffel-app nl.ts strings the wizard needs that copy.js does not carry (as in act C)
  const WZ_NL = {
    yourTurnDesc: "Je antwoorden maken de notulen scherper. Je transcript blijft verborgen.", // meeting.stage.yourTurn.description
    freeTextPlaceholder: "Anders, namelijk...",                                              // meeting.questions.freeTextPlaceholder
  };
  const WZ_IC = {
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    checkCircle2: '<circle class="cc-c" cx="12" cy="12" r="10" pathLength="1"/><path class="cc-k" d="m9 12 2 2 4-4" pathLength="1"/>',
  };
  const wsvg = (name, size, color, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${WZ_IC[name]}</svg>`;
  const wz = { op: [] };               // wizard (phone screen, under the recording screen)
  const vt = {};                       // hook overlay (screen space)
  const LANDED = { landed: true, flying: false };
  // the app's final state of a built element (act C's fadeRise / renderWord at u = 1)
  const BUILT = { opacity: "1.000", transform: "translate3d(0, 0.00px, 0)" };

  function mountWizard(ctx) {
    const ab = (parent, style, text) => Film.el("div", null, parent, Object.assign({ position: "absolute" }, style), text);
    const { X0, CW } = WZ;
    // z 3: under the recording screen (z 4), which is pushed in over it
    wz.root = ab(ctx.phone.screen, { left: "0px", top: "0px", width: "393px", height: "852px", zIndex: 3, overflow: "hidden" });
    wz.page = ab(wz.root, { left: "0px", top: "0px", width: "393px", height: "852px", background: "#ffffff" });
    // top row: back + subject
    const back = ab(wz.page, { left: X0 + "px", top: WZ.top + "px", width: "36px", height: "36px", borderRadius: "50%", boxShadow: `inset 0 0 0 1px ${WK.border}` });
    ab(back, { left: "10px", top: "10px" }).innerHTML = wsvg("arrowLeft", 16, WK.ink, 2);
    ab(wz.page, { left: X0 + 48 + "px", top: WZ.top + "px", height: "36px", lineHeight: "36px", fontSize: "14px", fontWeight: 600, color: WK.ink, whiteSpace: "nowrap" }, C.meeting.subject);
    // step indicator "Stap 1 van 3 · Vragen" (2 questions + review, as act C counts) + progress 1/3
    const parts = C.app.questionsStep(1, 3).split(" ");
    const lbl = ab(wz.page, { left: X0 + "px", top: WZ.step + "px", height: "16px", fontSize: "12px", lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: WK.muted, whiteSpace: "nowrap" });
    const value = (v, tab) => {
      const m = Film.el("span", null, lbl, { display: "inline-block", position: "relative", height: "16px", verticalAlign: "top" });
      if (tab) m.style.fontVariantNumeric = "tabular-nums";
      Film.el("span", null, m, { display: "inline-block", whiteSpace: "nowrap", opacity: "1.000" }, v);
    };
    lbl.appendChild(document.createTextNode(parts[0] + " "));
    value(parts[1], true);
    lbl.appendChild(document.createTextNode(" " + parts[2] + " " + parts[3] + " · "));
    value(C.app.questionsLabel, false);
    const track = ab(wz.page, { left: X0 + "px", top: WZ.bar + "px", width: CW + "px", height: "6px", borderRadius: "3px", background: WK.track, overflow: "hidden" });
    ab(track, { left: "0px", top: "0px", width: CW + "px", height: "6px", borderRadius: "3px", background: WK.ink, transformOrigin: "0 50%", transform: `scaleX(${(1 / 3).toFixed(4)})` });
    // the question, fully built (text-2xl bold, plain); the quoted reference never breaks
    const qEl = ab(wz.page, { left: X0 + "px", top: WZ.q + "px", width: CW + "px", fontSize: "24px", lineHeight: "32px", fontWeight: 700, letterSpacing: "-0.025em", color: WK.ink });
    const words = C.q1.text.split(/\s+/).filter(Boolean).map((w) => ({ w }));
    const qs = words.findIndex((o) => o.w.startsWith("'"));
    if (qs >= 0) { words[qs].grp = true; if (words[qs + 1]) words[qs + 1].grp = true; }
    let grp = null;
    words.forEach((o, i) => {
      let host = qEl;
      if (o.grp) {
        if (!grp) {
          if (i > 0) qEl.appendChild(document.createTextNode(" "));
          grp = Film.el("span", null, qEl, { display: "inline-block", whiteSpace: "nowrap" });
        } else grp.appendChild(document.createTextNode(" "));
        host = grp;
      } else if (i > 0) qEl.appendChild(document.createTextNode(" "));
      Film.el("span", null, host, Object.assign({ display: "inline-block", position: "relative", whiteSpace: "pre", filter: "none" }, BUILT), o.w);
    });
    ab(wz.page, Object.assign({ left: X0 + "px", top: WZ.desc + "px", width: CW + "px", fontSize: "14px", lineHeight: "20px", color: WK.muted }, BUILT), WZ_NL.yourTurnDesc);
    // options (Pressable min-h-14, rounded-lg, px-4); selected = flat mint, no border, CheckCircle2
    C.q1.options.forEach((txt, i) => {
      const box = ab(wz.page, { left: X0 + "px", top: WZ.opt[i] + "px", width: CW + "px", height: "56px", borderRadius: "10px", overflow: "hidden", transformOrigin: "50% 50%", opacity: "1.000" });
      const fill = ab(box, { left: "0px", top: "0px", width: CW + "px", height: "56px", background: WK.mint, opacity: 0 });
      const hair = ab(box, { left: "0px", top: "0px", width: CW + "px", height: "56px", borderRadius: "10px", boxShadow: `inset 0 0 0 1px ${WK.border}` });
      const txtEl = ab(box, { left: "16px", top: "18px", width: CW - 64 + "px", fontSize: "16px", lineHeight: "20px", color: WK.ink, fontWeight: 400, whiteSpace: "nowrap" }, txt);
      const chk = ab(box, { left: CW - 16 - 18 + "px", top: "19px", width: "18px", height: "18px" });
      chk.innerHTML = wsvg("checkCircle2", 18, WK.mintInk, 2);
      wz.op.push({ box, fill, hair, txt: txtEl, chk, cc: chk.querySelector(".cc-c"), ck: chk.querySelector(".cc-k") });
    });
    // "Of zelf invullen" + the free-text field, "Vraag overslaan"
    ab(wz.page, Object.assign({ left: X0 + "px", top: WZ.freeL + "px", width: CW + "px", fontSize: "12px", lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: WK.muted, whiteSpace: "nowrap" }, BUILT), C.app.writeOwn);
    const free = ab(wz.page, Object.assign({ left: X0 + "px", top: WZ.free + "px", width: CW + "px", height: "64px", borderRadius: "10px", boxShadow: `inset 0 0 0 1px ${WK.border}` }, BUILT));
    ab(free, { left: "12px", top: "10px", fontSize: "16px", lineHeight: "20px", color: WK.muted }, WZ_NL.freeTextPlaceholder);
    ab(wz.page, Object.assign({ left: X0 + "px", top: WZ.skip + "px", width: CW + "px", height: "44px", lineHeight: "44px", textAlign: "center", fontSize: "14px", fontWeight: 500, color: WK.ink }, BUILT), C.app.skip);
  }

  // act C's option render at its built state (entrance done): press -> selected by sel + 0.20.
  // The weight flip (400 -> 500) is a text change, so it is taken on the output frame grid.
  function renderWizOption(o, t, sel) {
    let pressA = 0, selU = 0, chkU = 0, tickU = 0, squash = 0, selW = 0;
    if (sel) {
      pressA = P(t, sel - 0.06, 0.06) * (1 - P(t, sel + 0.05, 0.1));
      selU = P(t, sel + 0.02, 0.12);
      selW = P(Film.frameT(t), sel + 0.02, 0.12);
      chkU = P(t, sel + 0.04, 0.12);
      tickU = P(t, sel + 0.08, 0.12);
      squash = 0.015 * P(t, sel - 0.06, 0.06) * (1 - P(t, sel + 0.05, 0.3));   // 0.985 at the tap
    }
    o.fill.style.opacity = Math.max(pressA * 0.5, selU).toFixed(3);
    o.hair.style.opacity = (1 - selU).toFixed(3);
    o.txt.style.color = Eng.mixHex(WK.ink, WK.mintInk, selU);
    o.txt.style.fontWeight = selW > 0.5 ? 500 : 400;
    o.chk.style.opacity = clamp(chkU * 6).toFixed(3);                     // round caps would show a dot at 0
    o.cc.style.strokeDasharray = "1"; o.cc.style.strokeDashoffset = (1 - chkU).toFixed(4);
    o.ck.style.strokeDasharray = "1"; o.ck.style.strokeDashoffset = (1 - tickU).toFixed(4);
    o.box.style.transform = "translate3d(0, 0.00px, 0)" + (squash > 0 ? ` scale(${(1 - squash).toFixed(4)})` : "");
  }

  function renderWizard(t) {
    const [s0, sd] = V.swap;
    const u = P(t, s0, sd);
    // once covered, the wizard leaves the layout (display, not visibility): its built 3D-transformed
    // elements would otherwise stay composited under the recording screen and change the
    // rasterisation (text anti-aliasing) of everything above them on the phone screen
    const on = t < s0 + sd + 0.02;
    wz.root.style.display = on ? "block" : "none";
    wz.op.forEach((o, i) => renderWizOption(o, t, i === C.q1.pick ? V.hookTap : 0));
    // the recording screen dissolves in over the wizard (a time jump, not an app navigation: no
    // push, no direction). From the end of the dissolve its opacity is unset again, exactly as in
    // the original; no transform at all (a 3D one would promote the screen to its own compositor
    // layer, and the browser's raster history of that layer shows in the island edge long after)
    rec.root.style.opacity = u < 1 ? u.toFixed(3) : "";
  }

  // the hook overlay: the same type system as overlay-text.js (masked word rise, one-block exit,
  // Inter 700, cv08, colour from the stage under it). 16:9 in the left column around the optical
  // centre; 4:5 on top (L.text), the phone under it.
  function mountHookText(ctx) {
    const cv = C.variant.vraag;
    const S = F45 ? { y: L.text.y, head: 92, sub: 48 } : { y: 392, head: 96, sub: 52 };
    const FEAT = "'cv08' 1";
    const base = { position: "absolute", left: L.text.x + "px", fontWeight: 700, whiteSpace: "nowrap", fontFeatureSettings: FEAT };
    vt.head = Film.type.make(ctx.overlay, cv.head, null, Object.assign({}, base, { top: S.y + "px", fontSize: S.head + "px", letterSpacing: "-0.04em", lineHeight: "1.02" }));
    const subY = S.y + S.head * 1.18 + 10;
    vt.sub = Film.type.make(ctx.overlay, cv.sub, null, Object.assign({}, base, { top: subY + "px", fontSize: S.sub + "px", letterSpacing: "-0.03em", lineHeight: "1.1" }));
    // "Griffel vraagt": the green emphasis (overlay-text.js' .hl-green-dark, >= 4.5:1 on white)
    const em = String(cv.em || "").split(/\s+/).filter(Boolean);
    const ws = vt.sub.words.map((w) => w.text);
    for (let i = 0; em.length && i + em.length <= ws.length; i++) {
      if (em.every((e, j) => ws[i + j] === e)) { for (let j = 0; j < em.length; j++) vt.sub.words[i + j].inner.classList.add("hl-green-dark"); break; }
    }
    vt.probe = { head: { x: L.text.x + 160, y: S.y + S.head * 0.55 }, sub: { x: L.text.x + 160, y: subY + S.sub * 0.55 } };
  }
  function renderHookText(t) {
    Film.type.render(vt.head, t, -1.2, V.out);           // fully up at frame 0
    // the climax's quicker rise (overlay-text.js): fully up ~0.8 s after the tap, so the line that
    // names the brand and the promise has calm reading time before the dissolve and the pull-out
    Film.type.render(vt.sub, t, V.subIn, V.out, { stagger: 0.05, dur: 0.5 });
    for (const k of ["head", "sub"]) {
      const b = vt[k];
      // gone: out of the layout too (no hidden composited words left behind for the rest of the film)
      b.el.style.display = b.el.style.visibility === "hidden" && t > V.out ? "none" : "block";
      if (b.el.style.visibility === "hidden") continue;
      const d = Film.stageDark ? Film.stageDark(t, vt.probe[k].x, vt.probe[k].y) : 0;
      b.el.style.color = Eng.mixHex(HEX.ink, "#ffffff", d);
    }
  }

  // camera: focus(lx, ly, sx, sy, z) puts phone logical point (lx, ly) on screen (sx, sy)
  const focusCam = (lx, ly, sx, sy, z) => ({ cx: lx - PHONE.w / 2 - (sx - L.W / 2) / z, cy: ly - 426 - (sy - L.H / 2) / z, z });
  // the key that, lerped linearly from `a` over its whole length, passes through `b` at fraction f
  // of it (z in log space, like Film.camera): a constant-speed move that runs on past `b`
  const extrapCam = (a, b, f) => ({
    cx: a.cx + (b.cx - a.cx) / f,
    cy: a.cy + (b.cy - a.cy) / f,
    z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) / f),
  });
  function mountVariant(ctx) {
    // the hook framing and its push. 16:9: the card from its top row to "Vraag overslaan" at z 1.55
    // (the question ~37 px, options ~25 px), the phone's left bezel at ~1054 (text column ends
    // < 930); the push (+12 % by the pull) is about "12 december" and tilts down 54 px, so the top
    // row ("Projectoverleg ...", logical y ~93) stays >= 50 px under the frame edge at the peak.
    // 4:5: z 1.40 with the top bezel pinned at y 300 under the text (the sub's descenders end
    // ~268), "Vraag overslaan" in frame at frame 0; the push (+13 % by the pull) keeps the top
    // pinned, so the phone grows down and away from the text.
    const pv = F45
      ? { lx: PHONE.w / 2, ly: -PHONE.bezel, sx: L.W / 2, sy0: 300, sy1: 300, z0: 1.40, z1: 1.58 }
      : { lx: PHONE.w / 2, ly: WZ.opt[0] + 28, sx: 1380, sy0: 540 - 12 * 1.55, sy1: 575, z0: 1.55, z1: 1.74 };
    const c0 = focusCam(pv.lx, pv.ly, pv.sx, pv.sy0, pv.z0), c1 = focusCam(pv.lx, pv.ly, pv.sx, pv.sy1, pv.z1);
    // the pull's target. 16:9: the rest framing (the original's creep starts there). 4:5: a framing
    // on the creep's path, z 1.0 with the screen top at y 455 (bezel ~441, under the caption box
    // that ends ~411; the bezel bottom lands ~1321), so the creep (-> T.handoff.AB, z 1.15) only
    // pushes on: no 1.58 -> 0.86 -> 1.15 yo-yo
    const pullTo = F45 ? focusCam(PHONE.w / 2, 0, L.W / 2, 455, 1.0) : Object.assign({}, L.cam0);
    // the push runs at one constant speed from frame 1 until the pull has landed, passing c1 as the
    // pull starts, so the overlapping pull blends in from motion (no soft stop, no stall)
    const pushEnd = V.pull[0] + V.pull[1], f = (V.pull[0] - V.camPush) / (pushEnd - V.camPush);
    Film.camera.key(-1, 0.001, c0);
    Film.camera.key(V.camPush, pushEnd - V.camPush, extrapCam(c0, c1, f), E.linear);
    Film.camera.key(V.pull[0], V.pull[1], pullTo);
    // the tap on "12 december" (centre of the option row, as act C taps it)
    Film.tap({ t: V.hookTap, x: PHONE.w / 2, y: WZ.opt[0] + 28 });
    // status bar: dark-on-light over the wizard, white once the recording screen is half dissolved in
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (E.house(m) < 0.5) lo = m; else hi = m; }
    Film.darkScreen([V.swap[0] + hi * V.swap[1], handOff() + 0.3]);
    mountWizard(ctx);
    mountHookText(ctx);
  }

  // ---- register -------------------------------------------------------------------------------
  Film.register({
    id: "act-a",
    order: 30,
    mount(ctx) {
      A = ctx.T.A; C = ctx.COPY; L = ctx.L; T = ctx.T;

      if (VAR) {
        // the question-first hook: the phone is at rest from frame 0 (no phone keys), its own
        // camera, tap and status-bar window; the creep, the hold-to-stop tap and the rest of the
        // act are the original's
        mountVariant(ctx);
        const ho = handoff();
        Film.camera.key(creep0(), ho.t - creep0(), ho.cam, creepEase);
        Film.tap({ t: A.holdStop[0], x: WAVE_CX, y: STOP_CY, hold: A.holdStop[1] });
        mountRecording(ctx);
        // the original hook is mounted too and runs its own code below, force-hidden while the
        // variant owns the frame: from 2.975 the DOM, and so the browser's layer tree and its text
        // rasterisation, is the original's (its will-change layers change how the phone rasterises)
        mountHook(ctx);
        mountCaptions(ctx);
        return;
      }

      // phone: peeks in at the bottom edge from frame 0 (PEEK screen px in frame at the rest camera:
      // island, live dot and "OPNAME LOOPT"), creeps up linearly, and the house-curve rise to rest
      // at T.A.phoneEnter takes over while the creep is still running (overlapping keys: the rise
      // starts at the creep's speed, no stall); small scale settle as before
      // CREEP: world px over the creep key (60 px/s: 16:9 ~1 px per frame, 4:5 ~0.86), so the peek
      // visibly grows from frame 0 (16:9 156 -> ~264 px by 1.8, 4:5 140 -> ~233 px)
      const S0 = 0.94, PEEK = F45 ? 140 : 156, CREEP = 60 * (A.phoneEnter[0] + A.phoneEnter[1] - A.start);
      const peekY = (L.H / 2 - PEEK) / L.cam0.z + L.cam0.cy + (PHONE.h / 2 + PHONE.bezel) * S0;
      const riseEnd = A.phoneEnter[0] + A.phoneEnter[1];
      Film.phoneMotion.key(-1, 0.001, { y: peekY, s: S0 });
      Film.phoneMotion.key(A.start, riseEnd - A.start, { y: peekY - CREEP }, E.linear);
      Film.phoneMotion.key(A.phoneEnter[0], A.phoneEnter[1], { y: 0 });
      Film.phoneMotion.key(A.phoneEnter[0] + 0.1, A.phoneEnter[1], { s: 1 });

      // camera: one even creep toward the phone under the whole recording hold (3.0 -> 9.6),
      // ending on the hand-off framing; no return to rest (act B moves on from this framing)
      const ho = handoff();
      Film.camera.key(creep0(), ho.t - creep0(), ho.cam, creepEase);

      // the status bar flips with the screen (dark from T.A.start: the phone peeks in from frame 0;
      // act B keeps it white until its light has passed)
      Film.darkScreen([A.start, handOff() + 0.3]);
      Film.tap({ t: A.holdStop[0], x: WAVE_CX, y: STOP_CY, hold: A.holdStop[1] });

      mountRecording(ctx);
      mountHook(ctx);
      mountCaptions(ctx);
    },
    render(t) {
      if (VAR) {
        // no hook line, no morph: the original's hook and flying bars stay hidden until they are
        // anyway (every bar has landed by creep0, 2.975), and every bar of the waveform is live
        // from frame 0
        const m = measure();
        const pm = Film.phoneMotion.at(t);
        renderHook(t, m);
        renderFly(t, m, m.bars.map((b) => flight(b, t, m, pm)), pm);
        if (t < creep0()) {
          hk.wrap.style.visibility = "hidden";
          for (const e of fly) e.style.visibility = "hidden";
        }
        renderRecording(t, m, m.bars.map(() => LANDED), pm);
        renderWizard(t);
        renderHookText(t);
        renderCaptions(t);
        return;
      }
      const m = measure();
      const pm = Film.phoneMotion.at(t);
      const fl = m.bars.map((b) => flight(b, t, m, pm));
      renderHook(t, m);
      renderFly(t, m, fl, pm);
      renderRecording(t, m, fl, pm);
      renderCaptions(t);
    },
  });
})();
