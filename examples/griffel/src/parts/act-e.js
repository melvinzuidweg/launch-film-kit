/*
 * Act E: outro + logo sting + end card (T.E, 38.0 - 48.0). See docs/storyboard.md.
 * Owned by the act-e builder.
 *
 * Light -> dark -> light: there is no dark reprise and no recorder. The phone keeps act D's
 * "Verstuurd" screen (StageHero: check tile + title) until it dissolves; there is never a blank
 * white screen and never a waveform on white.
 *
 *   38.0  T.handoff.DE: only the top row (back button + meeting subject) fades out under a white
 *         strip (gone by 38.35, before the VOORBEELD label leaves at T.voorbeeld 38.6). The
 *         "Verstuurd" hero stays. "Opnemen." / "Doorvragen." / "Notulen." stack on the beats
 *         (overlay: left column in 16:9, top in 4:5) and are gone by T.E.stackOut + 0.3. The
 *         camera makes one move from the DE hand-off framing (16:9: a push-in with the phone's
 *         left bezel pinned clear of the text column; 4:5: a push-in onto the lock framing) and is
 *         still moving when the collapse starts.
 *   38.6  T.voorbeeld: the phone's screen container (hero title, status bar, island) starts a slow
 *         fade, light on light, done with the old collapse fade (c0 + 0.45); shadow and buttons go
 *         with it. A screen-space copy of the check tile takes over the tile pixel for pixel, so
 *         the tile stays while the screen goes: it becomes the mark's centre.
 *   c0    Collapse (T.E.collapse[0], 39.5): the check in the tile gives way to the 36 bars, which
 *         rise inside the tile, centre first, already standing in five combs shaped like the
 *         mark's bars (static, brand green, never a live waveform). The tile then carries them out
 *         of the phone to the lock point (already the end-card height and size, gliding slowly
 *         along the travel, LY.creep) and grows to the mark's size while its mint fill fades;
 *         the combs fill in to the exact bars. The bezel's straight segments retract into its four
 *         corners, which cross-fade into green copies of the mark's brackets and fly in on one
 *         mirrored path. The early phases stretch with the collapse window.
 *   41.x  The brackets close in one house-curve move that decelerates into exactly T.E.lock (42.0)
 *         over its last ~0.33 s; it starts while the fly is still moving, so there is no stall.
 *   42.0  T.E.lock: one 4 % settle of the whole mark, a house-curve scale ease 1.04 -> 1 (0.3 s).
 *   42.0  The lockup slides left into place (horizontal only, 0.75 s, house) while the wordmark
 *         wipes on in reading order (42.05-42.75).
 *   42.45 End card poster (T.E.endCard; the slogan rises on T.E.endLines[0], right behind the
 *         slide); a linear 1.5 % zoom drift that keeps moving to the last frame.
 *
 * Everything that leaves the phone is drawn in one screen-space SVG in ctx.top, read from
 * Film.phoneToScreen, so the hand-off from phone pixels to poster pixels is exact. The SVG never
 * gets a CSS transform (the drift is an SVG transform), so its raster never changes mode.
 *
 * Film-only legibility setting: the slogan and the outro words use Inter's cv08 (capital I with
 * serifs), so "AI" never reads as "Al". App UI never uses it.
 */
(function () {
  const { Film, Eng } = window;
  const { P, E, clamp, lerp, zoomLerp } = Eng;
  const SVGNS = "http://www.w3.org/2000/svg";
  const IS45 = Film.format === "45";
  const L = Film.L;
  const W = L.W, H = L.H;
  const PH = Film.PHONE;
  const FW = PH.w + 2 * PH.bezel, FH = PH.h + 2 * PH.bezel;   // phone body 421 x 880
  const T = window.T, TE = T.E;
  const HX_P = 0.3115, H_P = E.house(HX_P);   // where the house curve is fastest, and its value there
  const CV08 = "'cv08' 1";                     // Inter: capital I with serifs (film-only)

  // ---- logo geometry (mark units, from src/mark.js) ---------------------------------------
  const MK = window.MARK;
  const MC = { x: 89.425, y: 250 };            // centre of the mark's bounding box
  const LOGO_CX = 250;                         // centre of the full lockup (47.03 .. 452.97)
  // the green i-dot of the wordmark (assets/logo/logo-wordmark.svg; not in MARK.wordmark)
  const IDOT = "M295.75,218.43a8.54,8.54,0,0,1-2.64,6.23,8.7,8.7,0,0,1-6.36,2.64,9,9,0,0,1-8.88-8.87,8.71,8.71,0,0,1,2.65-6.3,8.47,8.47,0,0,1,6.23-2.7,9.12,9.12,0,0,1,9,9Z";
  // half size of the bracket frame; brackets are anchored at their outer corner
  const HX = (131.82 - 47.03) / 2, HY = (291.81 - 208.19) / 2;
  // MARK.brackets order: bottom-left, bottom-right, top-left, top-right
  const BRK = [
    { ax: 47.03, ay: 291.81, sx: -1, sy: 1 },
    { ax: 131.82, ay: 291.81, sx: 1, sy: 1 },
    { ax: 47.03, ay: 208.19, sx: -1, sy: -1 },
    { ax: 131.82, ay: 208.19, sx: 1, sy: -1 },
  ];
  const MBARS = MK.bars.slice().sort((a, b) => a.x - b.x).map((b) => ({ cx: b.x + b.width / 2, cy: b.y + b.height / 2, w: b.width, h: b.height }));
  const WM_X0 = 146, WM_X1 = 455;              // wordmark extent in lockup units (G .. l)

  // ---- the 36 waveform bars (same count as the recording waveform of acts A and B) ---------
  const NBARS = 36;
  // the 36 bars split over the 5 mark bars in x order, symmetric: 7 7 8 7 7 (no bar crosses another)
  const CL = [7, 7, 8, 7, 7];
  const clusterOf = [], posIn = [];
  CL.forEach((n, c) => { for (let j = 0; j < n; j++) { clusterOf.push(c); posIn.push(j); } });
  const BRAND = "#1ABA6D", INK = "#131417";

  // ---- act D's "Verstuurd" StageHero check tile (act-d.js buildScreen: 80x80 at (156.5, 159),
  // radius 10, bg-success-bg #E5F8DD, CheckCircle2 34 px / 1.75 in #29513B), phone logical px
  const TILE = { cx: 196.5, cy: 199, side: 80, r: 10, icon: 34, bg: "#E5F8DD", ink: "#29513B" };
  // top row (back button + meeting subject) at y 75..111; the strip stays below the status bar
  const TOPROW = { y: 60, h: 62 };

  // ---- per-format layout -------------------------------------------------------------------
  // 16:9 end card = the old block scaled by 1.25 and centred on y 540.
  // words.y (16:9): the 3-line ink block (cap top line 1 .. baseline line 3) centred on y 540.
  // The camera makes one move from the DE hand-off framing, and is still moving when the
  // collapse starts.
  // camLock: [delay after the DE hand-off, duration]. The push starts 0.4 s after act D's landing
  // (the top-row fade and the first words carry 38.0-38.4), so its fastest part runs under
  // the last word and the start of the dissolve (39.0-39.7) instead of going quiet there.
  // 16:9: a push-in (z x1.18) that pins the phone's left bezel where DE put it (x ~1002), so
  //      the phone stays clear of the 950 px text column while the words are up ("Doorvragen."
  //      ends at x 716); the logo assembles at LY.lock (frame centre, the poster's mark height
  //      y 322), left of the phone, and the bars and the brackets travel there as the phone
  //      dissolves.
  // 4:5: the words end at y ~363; a push-in (z x1.15) that pins the phone's top bezel where DE
  //      put it (y ~419), so it never reaches the words; the logo assembles at LY.lock (frame
  //      centre, the poster's mark height y 429), above the check tile (y ~600), which carries
  //      the bars up to it once the words have left.
  //      The poster group is the old one scaled 1.2x about y 675 (it holds up at feed size); the
  //      slogan only 1.14x, so it keeps >= 70 px side margins through the drift.
  // Both formats: the offer is ink 600 and the URL stays the strongest (800); fine print #4B5563.
  // fix 5: the mark assembles at its end-card height and size (lock = frame centre x, finY,
  // Kfin), so after the lock only the horizontal slide and the wordmark wipe remain (it used to
  // lock 330 px lower in 4:5 and 196 px lower in 16:9 at 1.35x / 1.6x size, then jump into place
  // in 0.55 s). creep: px/s of a slow linear glide of the lock point along the tile's travel,
  // so the assembled mark never stands still before the hit. 4:5: straight up (the tile rises
  // from y ~605), arriving on T.E.lock. 16:9: leftward (the tile comes in from the phone at
  // x ~1235), the slide's own direction, so it runs on through the lock and the slide takes over
  // from it with no speed dip (logoT).
  const LY = IS45
    ? {
        lock: { x: 540, y: 429 }, pin: "top", pinZ: 1.15, camLock: [0.4, 2.6],
        creep: { x: 0, y: -40 },
        Klock: 2.22, Kfin: 2.22, finY: 429,
        words: { x: L.text.x, y: L.text.y, size: 88 },
        slogan: { y: 647, size: 66 },
        offer: { y: 748, size: 46, weight: 600, color: INK },
        badges: { y: 875, h: 86 },
        fine: { y: 988, size: 36, color: "#4B5563" },
        driftO: { x: 540, y: 675 },
        veil: { x: 540, y: 705, rx: 768, ry: 396 },
      }
    : {
        lock: { x: 960, y: 322 }, pin: "left", pinZ: 1.18, camLock: [0.4, 2.6],
        creep: { x: -50, y: 0 },
        Klock: 2.0, Kfin: 2.0, finY: 322,
        words: { x: L.text.x, y: Math.round(540 - 1.5498 * 96), size: 96 },
        slogan: { y: 512, size: 70 },
        offer: { y: 610, size: 48, weight: 600, color: INK },   // as 4:5: ink 600, the URL 800
        badges: { y: 720, h: 70 },
        fine: { y: 827, size: 30, color: "#4B5563" },
        driftO: { x: 960, y: 540 },
        veil: { x: 960, y: 560, rx: 820, ry: 360 },
      };
  const FIN_X = W / 2 + (MC.x - LOGO_CX) * LY.Kfin;   // mark centre in the final lockup

  // ---- timing (all derived from T.E / T.O / T.handoff) -------------------------------------
  // hand-off from act D: T.handoff.DE.t (also accepts a bare time or [time, dur]); else T.E.start
  const HO = (() => {
    const h = T.handoff && T.handoff.DE;
    const v = Array.isArray(h) ? h[0] : h && typeof h === "object" ? (h.t ?? h.at ?? h.start) : h;
    return Number.isFinite(v) ? v : TE.start;
  })();
  const t0 = Math.min(TE.start, HO);           // first frame this act draws anything
  const c0 = TE.collapse[0];                   // 39.5 (foundation retime; was 40.0)
  const tLock = TE.lock;                       // 42.0
  const tEnd = TE.endCard;                     // 42.45
  const WMK = TE.wordmark || [tLock, tEnd - tLock];
  const tWmEnd = WMK[0] + WMK[1];              // 42.55
  const STRIP = { t: HO, dur: 0.35 };          // 38.0-38.35 top row (meeting subject) out under a white strip
  // early collapse phases, stretched with the collapse window (KS 1.25 for collapse 39.5 / lock 42.0)
  const KS = clamp((tLock - c0) / 2.0, 1, 1.4);
  // the screen container (hero title, status bar, island) + shadow and buttons: one slow fade from
  // T.voorbeeld (38.6) to c0 + 0.45 (39.95), light on light; the check tile is taken over before it
  const VB_END = T.voorbeeld && Number.isFinite(T.voorbeeld[1]) ? T.voorbeeld[1] : HO + 0.6;
  const SFADE = { t: Math.max(HO + 0.4, VB_END), dur: Math.max(0.45, c0 + 0.45 - Math.max(HO + 0.4, VB_END)) };
  const RETRACT = { t: c0 + 0.25 * KS, dur: 0.3 * KS };   // 39.81-40.19 bezel segments retract into the corners
  // a true cross-fade (complementary opacities), so the overlap never darkens into a muddy green
  const GREEN = { t: c0 + 0.37 * KS, dur: 0.22 * KS };    // 39.96-40.24 green bracket copies fade in
  const DARKOUT = GREEN;                       // dark corner pieces fade out on the same curve
  // the tile becomes the mark's centre: the check goes, the bars rise inside the tile (centre
  // first, in five combs), the tile carries them to the lock point and its fill fades
  const CHECK_OUT = { t: c0, dur: 0.25 };                 // 39.5-39.75 the check shrinks a little and fades
  const EMERGE = { t: c0 + 0.08, dur: 0.3, spread: 0.14 };   // 39.58-40.02 bars rise in the tile
  const TRAVEL = { t: c0 + 0.3 * KS, dur: 0.8 };          // 39.88-40.68 tile + combs out to the lock point
  const TILE_OUT = { t: TRAVEL.t + 0.05, dur: 0.45 };     // 39.93-40.38 the tile's mint fill fades
  const BAR2 = { t: TRAVEL.t + TRAVEL.dur - 0.2, dur: 0.4 * KS };  // 40.48-40.98 combs fill in to the exact bars
  // brackets: fly in to an open frame (house), and close (F_OPEN -> shut) in ONE move with a
  // continuous speed: the accelerating half of the house curve from CLOSE.t to CLOSE.peak takes
  // over while the fly slows (no stall, no slow-then-fast), then the decelerating half of the
  // same curve brakes into exactly T.E.lock over the last CLOSE.brake s (no dead stop)
  const FLY = { t: c0 + 0.55 * KS, dur: Math.max(0.6, tLock - 0.5 - (c0 + 0.55 * KS)) };   // 40.19-41.5
  const CLOSE = { t: Math.max(FLY.t + 0.3, tLock - 1.5), brake: 0.35 };          // 40.5-42.0: speed peak at 41.65, brake 0.35 s
  CLOSE.peak = tLock - CLOSE.brake;
  const SETTLE = { t: tLock, dur: 0.3 };       // 42.0-42.3 whole mark scale 1.04 -> 1.00, house curve
  const F_OPEN = 1.45;                         // open frame (x bracket half size) the fly aims at
  // fix 5: the lock point is already at the end-card height and size, so the slide is horizontal
  // only; it leaves from the lock on the house curve (its slow start carries the settle) and
  // takes 0.75 s, so no 60 fps frame jumps (it was 0.55 s with a 330 px rise and a 0.74x shrink).
  // The wordmark wipe runs with it and ends with it.
  const SLIDE = { t: tLock, dur: Math.max(0.75, tWmEnd - tLock) };               // 42.0-42.75 lockup into place
  const WIPE = { t: SLIDE.t + 0.05, dur: SLIDE.dur - 0.05 };                     // 42.05-42.75 wordmark wipe
  // closing progress 0 -> 1 (decelerates into T.E.lock) and settle progress 0 -> 1 after it
  const closeU = (t) => splitHouse(t, CLOSE.t, CLOSE.peak, tLock);
  const settleU = (t) => P(t, SETTLE.t, SETTLE.dur);
  // one move from a to b whose speed peaks at p: the house curve's accelerating part (to its
  // speed peak at x = HX_P) over [a, p], then its decelerating part over [p, b], with the share
  // of the distance m chosen so the speed is continuous at p. Progress 0 -> 1.
  function splitHouse(t, a, p, b) {
    if (t <= a) return 0;
    if (t >= b) return 1;
    const al = HX_P / (H_P * (p - a)), be = (1 - HX_P) / ((1 - H_P) * (b - p));
    const m = be / (al + be);
    if (t < p) return (m * E.house(HX_P * (t - a) / (p - a))) / H_P;
    return m + ((1 - m) * (E.house(HX_P + (1 - HX_P) * (t - p) / (b - p)) - H_P)) / (1 - H_P);
  }
  const DRIFT = { t: tEnd, dur: TE.end - tEnd, amt: 0.015 };
  const K0 = 1.8;                              // bracket scale at the phone corner (px per mark unit at S 1)
  const CORNER = 66;                           // retracted bezel corner piece (phone px), just past r 62

  // outro words: word 1 waits until the trust card is fully gone, so text layers never collide.
  // With T.O.trust.out <= 37.8 the stack lands 38.0-38.1 / 38.5 / 39.0 (now: 37.6 -> word 1 at 38.08).
  const BEAT = T.BEAT;
  const STACK = TE.stack || [TE.start, TE.start + BEAT, TE.start + 2 * BEAT];
  const goneAt = (out) => (Film.type.goneAt ? Film.type.goneAt(out) : out + 0.3);
  const trustGone = goneAt(T.O.trust.out) + 0.01;
  const LEAD = 0.3, RISE_W = 0.4;              // a rise is ~93 % up on its beat
  const WORDS = (() => {
    let s1 = STACK[0] - LEAD, d1 = RISE_W;
    if (trustGone > s1) { s1 = trustGone; d1 = 0.22; }
    const late = s1 + d1 - (STACK[0] + 0.1);
    const shift = late > 0.2 ? BEAT * Math.ceil((late - 0.2) / BEAT) : 0;
    return STACK.map((b, i) => (i === 0 ? { t: s1, dur: d1 } : { t: b + shift - LEAD, dur: RISE_W }));
  })();
  // T.E.stackOut (39.7): the three blocks leave top to bottom (as one when the collapse has started)
  const WORDS_OUT = TE.stackOut ?? c0 - 0.35;
  const WORDS_GAP = clamp((c0 - goneAt(WORDS_OUT)) / 2, 0, 0.03);

  // logo transform (screen): mark centre (X, Y), scale K px per mark unit
  // The lock point glides linearly (LY.creep, px/s) and is at LY.lock on T.E.lock. The x glide
  // (the slide's direction) runs on through the lock and the slide lerps away from it, so the
  // speed is continuous at the hit and the move stays monotonic; the y glide stops on the lock.
  function logoT(t) {
    const us = P(t, SLIDE.t, SLIDE.dur);
    const g = 1 + 0.04 * (1 - settleU(t));
    return {
      X: lerp(LY.lock.x + LY.creep.x * (t - tLock), FIN_X, us),
      Y: lerp(LY.lock.y + LY.creep.y * Math.min(0, t - tLock), LY.finY, us),
      K: zoomLerp(LY.Klock * g, LY.Kfin, us),
    };
  }
  const toS = (lt, ux, uy) => ({ x: lt.X + (ux - MC.x) * lt.K, y: lt.Y + (uy - MC.y) * lt.K });
  const drift = (t) => 1 + DRIFT.amt * clamp((t - DRIFT.t) / DRIFT.dur);   // linear, no easing

  // ---- DOM refs ----------------------------------------------------------------------------
  let strip, sRoot, svg, driftG, tileG, tileRect, checkG, barsG, barsIn, barEls = [], pillEls = [], brkG = [], wmOuter, wmClip, eText, grad, rings;
  let words = [], slogan, offer, url, sep, badges = [], fine;
  let extras = [], touched = false, maskKey = "", ringsTouched = false;

  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const f2 = (v) => v.toFixed(2);

  // ---- phone bezel as a ring, retracting into its corners (CSS clip-path on the real frame) --
  // Four corner pieces of the ring (body minus screen), each cw x ch, all wound clockwise so
  // overlapping pieces union cleanly. cw = FW/2 + 1 gives the whole ring. The ring's inner edge
  // sits 1 px inside the screen edge, so no seam shows while the screen still covers it.
  // clip-path (not a mask image) so every frame is synchronous and seek-order independent.
  function framePieces(cw, ch) {
    const Ro = PH.radius, b = PH.bezel + 1, Ri = PH.screenRadius - 1, n = (v) => +v.toFixed(2);
    const X = FW, Y = FH;
    cw = n(cw); ch = n(ch);
    return [
      `M0,${ch}V${Ro}A${Ro},${Ro} 0 0 1 ${Ro},0H${cw}V${b}H${b + Ri}A${Ri},${Ri} 0 0 0 ${b},${b + Ri}V${ch}Z`,
      `M${n(X - cw)},0H${X - Ro}A${Ro},${Ro} 0 0 1 ${X},${Ro}V${ch}H${X - b}V${b + Ri}A${Ri},${Ri} 0 0 0 ${X - b - Ri},${b}H${n(X - cw)}Z`,
      `M${X},${n(Y - ch)}V${Y - Ro}A${Ro},${Ro} 0 0 1 ${X - Ro},${Y}H${n(X - cw)}V${Y - b}H${X - b - Ri}A${Ri},${Ri} 0 0 0 ${X - b},${Y - b - Ri}V${n(Y - ch)}Z`,
      `M${cw},${Y}H${Ro}A${Ro},${Ro} 0 0 1 0,${Y - Ro}V${n(Y - ch)}H${b}V${Y - b - Ri}A${Ri},${Ri} 0 0 0 ${b + Ri},${Y - b}H${cw}Z`,
    ].join("");
  }

  // ---- end card (HTML, screen space, its own root after the SVG) ----------------------------
  function buildEndCard(ctx) {
    const C = ctx.COPY.end;
    const center = { position: "absolute", left: "0px", width: W + "px", textAlign: "center", whiteSpace: "nowrap" };
    slogan = Film.type.make(eText, C.slogan, null, Object.assign({}, center, {
      top: LY.slogan.y - LY.slogan.size * 0.6 + "px", fontSize: LY.slogan.size + "px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: "1.2", color: "#131417",
      fontFeatureSettings: CV08,
    }));
    const os = LY.offer.size;
    const offerRow = Film.el("div", null, eText, {
      position: "absolute", left: "0px", width: W + "px", top: LY.offer.y - os * 0.62 + "px", height: os * 1.24 + "px",
      display: "flex", justifyContent: "center", alignItems: "baseline", gap: Math.round(os * 0.55) + "px", lineHeight: "1.24", whiteSpace: "nowrap",
    });
    offer = Film.type.make(offerRow, C.offer, null, { fontSize: os + "px", fontWeight: LY.offer.weight, letterSpacing: "-0.015em", color: LY.offer.color });
    sep = Film.el("span", null, offerRow, { width: "2px", height: Math.round(os * 0.8) + "px", borderRadius: "1px", background: "#C9CED3", display: "block", alignSelf: "center" });
    // the call to action: a touch larger than the offer, extra bold, ink
    url = Film.type.make(offerRow, C.url, null, { fontSize: Math.round(os * 1.06) + "px", fontWeight: 800, letterSpacing: "-0.02em", color: "#131417" });
    // official NL store badges, unmodified, equal visible height.
    // Kit example: Apple's and Google's badges may not be redistributed, so this copy loads neutral
    // placeholders with the same geometry. Download the official badges from Apple's and Google's
    // marketing-guideline pages, save them as assets/badges/app-store-nl.svg and
    // assets/badges/google-play-nl.png, and point the two src lines below back at them.
    const bh = LY.badges.h;
    const badgeRow = Film.el("div", null, eText, { position: "absolute", left: "0px", width: W + "px", top: LY.badges.y - bh / 2 + "px", height: bh + "px", display: "flex", justifyContent: "center", gap: Math.round(bh * 0.3) + "px" });
    const as = Film.el("div", null, badgeRow, { width: (bh * 119.66407) / 40 + "px", height: bh + "px", opacity: 0 });
    const asImg = Film.el("img", null, as, { width: "100%", height: "100%", display: "block" });
    asImg.src = "assets/badges/placeholder-app-store.svg"; // film: assets/badges/app-store-nl.svg
    asImg.alt = "Download in de App Store";
    // google-play-nl.png is 646x250 with transparent padding: visible badge is y 29..221 (192 px)
    const gs = bh / 192;
    const gp = Film.el("div", null, badgeRow, { width: 646 * gs + "px", height: bh + "px", overflow: "hidden", position: "relative", opacity: 0 });
    const gpImg = Film.el("img", null, gp, { position: "absolute", left: "0px", top: -29 * gs + "px", width: 646 * gs + "px", height: 250 * gs + "px", display: "block" });
    gpImg.src = "assets/badges/placeholder-google-play.svg"; // film: assets/badges/google-play-nl.png
    gpImg.alt = "Ontdek het op Google Play";
    badges = [as, gp];
    // fine print: #4B5563, about 6:1 on the end-card gradient behind it at 48.0 (#6B7280 measures
    // only ~3.9:1 there, under the film's 4.5:1 floor)
    fine = Film.type.make(eText, C.fine, null, Object.assign({}, center, {
      top: LY.fine.y - LY.fine.size * 0.62 + "px", fontSize: LY.fine.size + "px", fontWeight: 500, letterSpacing: "-0.005em", lineHeight: "1.24", color: LY.fine.color,
    }));
  }

  Film.register({
    id: "act-e",
    order: 30,
    mount(ctx) {
      const st = document.createElement("style");
      st.textContent = ".e-hl{background:linear-gradient(180deg,#159a5a 0%,#12804b 55%,#0f6e40 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}";
      document.head.appendChild(st);

      // camera: one move from the DE hand-off framing (act D lands on it at T.handoff.DE.t), so it
      // keeps moving through the stack and is still moving when the collapse starts
      // a push-in about the phone's left bezel (16:9) or top bezel (4:5), which stays exactly
      // where the DE framing put it
      const de = Film.handoff("DE");
      const z1 = de.z * LY.pinZ;
      const to = { cx: de.cx, cy: de.cy, z: z1 };
      if (LY.pin === "left") to.cx = -FW / 2 - (W / 2 + (-FW / 2 - de.cx) * de.z - W / 2) / z1;
      else to.cy = -FH / 2 - (H / 2 + (-FH / 2 - de.cy) * de.z - H / 2) / z1;
      Film.camera.key(HO + LY.camLock[0], LY.camLock[1], to);

      // stage: stronger hero gradient for the end card
      grad = Film.el("div", "abs", ctx.stage, {
        left: 0, top: 0, width: W + "px", height: H + "px", opacity: 0,
        background: "linear-gradient(0deg, rgba(26,186,109,0.62) 0%, rgba(26,186,109,0.30) 12%, rgba(26,186,109,0.10) 24%, rgba(26,186,109,0) 34%)",
      });
      // stage.js' hero rings (the element with three round children): quieted behind the poster
      rings = Array.from(ctx.stage.children).find((e) => e.children.length === 3 && Array.from(e.children).every((c) => c.style.borderRadius === "50%")) || null;
      // phone pieces besides frame and screen: shadow + side buttons
      extras = Array.from(ctx.phone.el.children).filter((e) => e !== ctx.phone.frame && e !== ctx.phone.screen);

      // outro words (overlay, same grammar as the chapter cards)
      const wsz = LY.words.size;
      ctx.COPY.outro.forEach((w, i) => {
        const b = Film.type.make(ctx.overlay, w, null, {
          position: "absolute", left: LY.words.x + "px", top: LY.words.y + i * wsz * 1.04 + "px", width: L.text.w + "px",
          fontSize: wsz + "px", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: "1.02", color: "#131417", whiteSpace: "nowrap",
          fontFeatureSettings: CV08,
        });
        if (i === 1) b.words.forEach((x) => x.inner.classList.add("e-hl"));
        words.push(b);
      });

      // white strip over the top row of act D's "Verstuurd" screen only (back button + meeting
      // subject; act D sits at z 35, the status bar z 50 stays on top). The hero stays.
      strip = Film.el("div", "abs", ctx.phone.screen, { left: 0, top: TOPROW.y + "px", width: "393px", height: TOPROW.h + "px", zIndex: 40, background: "#ffffff", visibility: "hidden", opacity: 0 });

      // screen-space SVG: bars, brackets, wordmark. No CSS transform on it, ever.
      sRoot = Film.el("div", "abs", ctx.top, { left: 0, top: 0, width: W + "px", height: H + "px", display: "none" });
      svg = svgEl("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
      Object.assign(svg.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
      sRoot.appendChild(svg);
      const defs = svgEl("defs", {}, svg);
      const cp = svgEl("clipPath", { id: "e-wipe", clipPathUnits: "userSpaceOnUse" }, defs);
      wmClip = svgEl("rect", { x: WM_X0, y: 190, width: 0, height: 120 }, cp);

      driftG = svgEl("g", {}, svg);
      // screen-space copy of act D's check tile (takes over from the phone screen at SFADE.t)
      tileG = svgEl("g", {}, driftG);
      tileRect = svgEl("rect", { x: 0, y: 0, width: 0, height: 0, fill: TILE.bg }, tileG);
      checkG = svgEl("g", { fill: "none", stroke: TILE.ink, "stroke-width": 1.75, "stroke-linecap": "round", "stroke-linejoin": "round" }, tileG);
      svgEl("circle", { cx: 12, cy: 12, r: 10 }, checkG);
      svgEl("path", { d: "m9 12 2 2 4-4" }, checkG);
      tileG.style.display = "none";
      barsG = svgEl("g", {}, driftG);
      MBARS.forEach(() => pillEls.push(svgEl("rect", { x: 0, y: 0, width: 0, height: 0, fill: BRAND }, barsG)));
      // the 36 bars: brand green from their first frame (in the mint tile and on the light
      // stage alike), never the #09FE94 UI accent on light
      barsIn = svgEl("g", { fill: BRAND }, barsG);
      for (let i = 0; i < NBARS; i++) barEls.push(svgEl("rect", { x: 0, y: 0, width: 0, height: 0 }, barsIn));
      MK.brackets.forEach((d) => {
        const g = svgEl("g", {}, driftG);
        svgEl("path", { d, fill: BRAND }, g);
        brkG.push(g);
      });
      // wordmark: rigid part of the lockup, revealed left to right by a hard-edged clip
      wmOuter = svgEl("g", {}, driftG);
      const wmInner = svgEl("g", { "clip-path": "url(#e-wipe)" }, wmOuter);
      const wmInk = svgEl("g", { fill: "#121316" }, wmInner);
      MK.wordmark.forEach((d) => svgEl("path", { d }, wmInk));
      svgEl("path", { d: IDOT, fill: BRAND }, wmInner);

      // end card text: its own root after the SVG (drift via one stable CSS transform)
      eText = Film.el("div", "abs", ctx.top, {
        left: 0, top: 0, width: W + "px", height: H + "px", display: "none",
        transformOrigin: LY.driftO.x + "px " + LY.driftO.y + "px", transform: "scale(1)",
      });
      buildEndCard(ctx);
    },

    render(t, ctx) {
      const inAct = t >= t0;

      // ---- outro words ----------------------------------------------------------------------
      words.forEach((b, i) => Film.type.render(b, t, WORDS[i].t, WORDS_OUT + i * WORDS_GAP, { dur: WORDS[i].dur }));

      renderStrip(t);
      renderPhone(t, ctx);

      // ---- rings behind the poster ----------------------------------------------------------
      if (rings) {
        const q = P(t, tEnd - 0.4, 1.2);
        if (inAct && q > 0) {
          const a = (1 - 0.7 * q).toFixed(3);
          const v = LY.veil;
          const m = `radial-gradient(ellipse ${v.rx}px ${v.ry}px at ${v.x}px ${v.y}px, rgba(0,0,0,${a}) 0%, rgba(0,0,0,${a}) 72%, #000 100%)`;
          rings.style.webkitMaskImage = m;
          rings.style.maskImage = m;
          ringsTouched = true;
        } else if (ringsTouched) {
          rings.style.webkitMaskImage = "";
          rings.style.maskImage = "";
          ringsTouched = false;
        }
      }

      sRoot.style.display = inAct ? "block" : "none";
      eText.style.display = inAct ? "block" : "none";
      // keep the end-card gradient above the other stage layers (they may mount after this part)
      if (grad.nextSibling) ctx.stage.appendChild(grad);
      grad.style.opacity = inAct ? (0.72 * P(t, tLock - 0.2, 1.6) + 0.28 * P(t, tEnd + 0.4, 3.6)).toFixed(3) : "0";
      if (!inAct) return;

      // ---- drift (linear, to the last frame) ------------------------------------------------
      const d = drift(t);
      const O = LY.driftO;
      driftG.setAttribute("transform", `translate(${O.x} ${O.y}) scale(${d.toFixed(6)}) translate(${-O.x} ${-O.y})`);
      eText.style.transform = `scale(${d.toFixed(6)})`;

      const lt = logoT(t);
      const cam = Film.camera.at(t), pm = Film.phoneMotion.at(t);
      const S = cam.z * pm.s;

      const ct = carrierT(t, lt, S);
      renderTile(t, ct, S);
      renderBars(t, ct);
      renderBrackets(t, lt, S);

      // ---- wordmark: rigid with the lockup, hard wipe in reading order --------------------
      const uw = P(t, WIPE.t, WIPE.dur);
      wmOuter.style.display = uw > 0 ? "" : "none";
      if (uw > 0) {
        wmOuter.setAttribute("transform", `translate(${lt.X.toFixed(3)} ${lt.Y.toFixed(3)}) scale(${lt.K.toFixed(5)}) translate(${-MC.x} ${-MC.y})`);
        wmClip.setAttribute("width", ((WM_X1 - WM_X0) * uw).toFixed(3));
      } else wmClip.setAttribute("width", "0");

      // ---- end card lines: complete by about T.E.endLines[4] + 0.35 -------------------------
      const el5 = TE.endLines;
      Film.type.render(slogan, t, el5[0], Infinity, { stagger: 0.04, dur: 0.5 });
      Film.type.render(offer, t, el5[1], Infinity, { stagger: 0.035, dur: 0.45 });
      Film.type.render(url, t, el5[2], Infinity, { stagger: 0.035, dur: 0.45 });
      const us = P(t, el5[2] - 0.08, 0.45);
      sep.style.opacity = us.toFixed(3);
      sep.style.transform = `scaleY(${(0.2 + 0.8 * us).toFixed(3)})`;
      badges.forEach((b, j) => {
        const u = P(t, el5[3] + j * 0.06, 0.45);
        b.style.opacity = u.toFixed(3);
        b.style.transform = `translate(0px, ${((1 - u) * 18).toFixed(2)}px)`;
      });
      Film.type.render(fine, t, el5[4], Infinity, { stagger: 0.015, dur: 0.3 });
    },
  });

  // ---- white strip: the top row (meeting subject) fades out; the "Verstuurd" hero stays ------
  function renderStrip(t) {
    const on = t >= STRIP.t && t < SFADE.t + SFADE.dur + 0.02;
    strip.style.visibility = on ? "visible" : "hidden";
    strip.style.opacity = on ? P(t, STRIP.t, STRIP.dur).toFixed(4) : "0";
  }

  // ---- phone: screen fades out, bezel becomes four corners, then the phone is gone --------
  function renderPhone(t, ctx) {
    const ph = ctx.phone;
    if (!(t >= t0 && t >= SFADE.t)) {
      if (touched) {
        ph.screen.style.opacity = "";
        ph.frame.style.opacity = "";
        ph.frame.style.clipPath = "";
        maskKey = "";
        extras.forEach((e) => (e.style.opacity = ""));
        ph.el.style.visibility = "";
        touched = false;
      }
      return;
    }
    touched = true;
    const fo = (1 - P(t, SFADE.t, SFADE.dur)).toFixed(4);
    ph.screen.style.opacity = fo;
    extras.forEach((e) => (e.style.opacity = fo));
    const ur = P(t, RETRACT.t, RETRACT.dur);
    const cw = lerp(FW / 2 + 1, CORNER, ur), ch = lerp(FH / 2 + 1, CORNER, ur);
    const key = cw.toFixed(2) + "," + ch.toFixed(2);
    if (key !== maskKey) { maskKey = key; ph.frame.style.clipPath = `path("${framePieces(cw, ch)}")`; }
    const dk = 1 - P(t, DARKOUT.t, DARKOUT.dur);
    ph.frame.style.opacity = dk.toFixed(4);
    ph.el.style.visibility = dk <= 0 ? "hidden" : "";
  }

  // ---- the check tile carries the bars: phone tile -> lock point ---------------------------
  // carrier transform (screen): mark centre (X, Y), K px per mark unit. At rest it is the tile
  // (its 80 px side = the mark's bracket width, 2 * HX units), then it travels to the logo.
  function carrierT(t, lt, S) {
    const p = Film.phoneToScreen(TILE.cx, TILE.cy, t);
    const k0 = (TILE.side * S) / (2 * HX);
    const u = P(t, TRAVEL.t, TRAVEL.dur);
    return { X: lerp(p.x, lt.X, u), Y: lerp(p.y, lt.Y, u), K: zoomLerp(k0, lt.K, u), k0 };
  }
  // the tile copy: on top of act D's tile from SFADE.t (same pixels, so the take-over is invisible)
  function renderTile(t, ct, S) {
    const fill = 1 - P(t, TILE_OUT.t, TILE_OUT.dur);
    const on = t >= SFADE.t && fill > 0;
    tileG.style.display = on ? "" : "none";
    if (!on) return;
    const side = 2 * HX * ct.K, g = ct.K / ct.k0;   // g: growth since the phone
    tileRect.setAttribute("x", f2(ct.X - side / 2));
    tileRect.setAttribute("y", f2(ct.Y - side / 2));
    tileRect.setAttribute("width", f2(side));
    tileRect.setAttribute("height", f2(side));
    tileRect.setAttribute("rx", f2((side * TILE.r) / TILE.side));
    tileRect.setAttribute("opacity", fill.toFixed(3));
    const uc = P(t, CHECK_OUT.t, CHECK_OUT.dur);
    checkG.style.display = uc < 1 ? "" : "none";
    if (uc < 1) {
      const k = ((TILE.icon * S) / 24) * g * (1 - 0.2 * uc);
      checkG.setAttribute("transform", `translate(${ct.X.toFixed(3)} ${ct.Y.toFixed(3)}) scale(${k.toFixed(5)}) translate(-12 -12)`);
      checkG.setAttribute("opacity", (1 - uc).toFixed(3));
    }
  }

  // ---- bars: rise in the tile as five combs -> carried to the lock -> the exact bars ---------
  // half height of a pill (half width a, half height b, end radius r) at distance d from its axis
  function pillHalf(d, a, b) {
    const r = Math.min(a, b);
    const e = d - (a - r);
    return e <= 0 ? b : b - r + Math.sqrt(Math.max(0, r * r - e * e));
  }
  // centre-first stagger of the rise (bar 17/18 first, the ends last)
  const riseU = (i, t) => P(t, EMERGE.t + EMERGE.spread * (Math.abs(i - (NBARS - 1) / 2) - 0.5) / ((NBARS - 1) / 2 - 0.5), EMERGE.dur);
  function renderBars(t, ct) {
    const show = t >= EMERGE.t;
    barsG.style.display = show ? "" : "none";
    if (!show) return;
    const u2 = P(t, BAR2.t, BAR2.dur);
    const combsOn = u2 < 1;
    // target bars (screen) and comb envelopes, on the carrier
    const tg = MBARS.map((mb, c) => {
      const p = toS(ct, mb.cx, mb.cy);
      const tw = mb.w * ct.K, th = mb.h * ct.K;
      const cw = tw * (1 + 0.4 * (1 - u2));     // comb is a little wider, then closes to the bar
      return { x: p.x, y: p.y, tw, th, cw, pitch: cw / CL[c] };
    });
    pillEls.forEach((el, c) => {
      const g = tg[c];
      el.style.display = u2 > 0 ? "" : "none";
      if (u2 <= 0) return;
      el.setAttribute("x", f2(g.x - g.tw / 2));
      el.setAttribute("y", f2(g.y - g.th / 2));
      el.setAttribute("width", f2(g.tw));
      el.setAttribute("height", f2(g.th));
      el.setAttribute("rx", f2(g.tw / 2));
      el.setAttribute("opacity", u2.toFixed(3));
    });
    barsIn.style.display = combsOn ? "" : "none";
    if (!combsOn) return;
    for (let i = 0; i < NBARS; i++) {
      const el = barEls[i];
      const g = tg[clusterOf[i]];
      const ru = riseU(i, t);
      const w = g.pitch * 0.6;
      const x = g.x - g.cw / 2 + (posIn[i] + 0.5) * g.pitch;
      // the rise: each bar grows out of the comb's centre line to its place in the comb envelope
      const h = Math.max(0.01, 2 * pillHalf(Math.abs(x - g.x) + w / 2, g.cw / 2, g.th / 2) * ru);
      el.setAttribute("x", f2(x - w / 2));
      el.setAttribute("y", f2(g.y - h / 2));
      el.setAttribute("width", f2(w));
      el.setAttribute("height", f2(h));
      el.setAttribute("rx", f2(Math.min(w, h) / 2));
      el.setAttribute("opacity", clamp(ru * 2.5).toFixed(3));
    }
  }

  // ---- brackets: the phone's corners fly in on one mirrored path and lock --------------------
  function renderBrackets(t, lt, S) {
    const op = P(t, GREEN.t, GREEN.dur);
    const show = op > 0;
    brkG.forEach((g) => (g.style.display = show ? "" : "none"));
    if (!show) return;
    const uf = P(t, FLY.t, FLY.dur);
    const ufx = P(t, FLY.t + 0.12, FLY.dur - 0.12);   // x lags y: a curved path, same for all four
    // open frame -> one close that starts during the fly and decelerates into exactly T.E.lock
    const f = F_OPEN - (F_OPEN - 1) * closeU(t);
    const pc = Film.phoneToScreen(PH.w / 2, PH.h / 2, t);   // phone centre
    const cx = lerp(pc.x, lt.X, uf), cy = lerp(pc.y, lt.Y, uf);
    const ox = lerp((FW / 2) * S, f * HX * lt.K, ufx);
    const oy = lerp((FH / 2) * S, f * HY * lt.K, uf);
    const k = zoomLerp(K0 * S, lt.K, uf);
    // a small turn of the whole frame on the way in, back to 0 by the end of the fly
    const rot = 3 * (P(t, FLY.t, FLY.dur * 0.55) - P(t, FLY.t + FLY.dur * 0.45, FLY.dur * 0.55));
    BRK.forEach((b, i) => {
      const x = cx + b.sx * ox, y = cy + b.sy * oy;
      brkG[i].setAttribute("transform", `rotate(${rot.toFixed(4)} ${cx.toFixed(2)} ${cy.toFixed(2)}) translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(5)}) translate(${-b.ax} ${-b.ay})`);
      brkG[i].setAttribute("opacity", op.toFixed(3));
    });
  }
})();
