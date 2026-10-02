/*
 * Example act (0 - 12 s, 120 BPM: one bar = 2 s). Replace it with your own acts; keep the
 * patterns. Times: T.EX (src/timeline.js). Strings: COPY (src/copy.js). Colours: src/tokens.css.
 *
 *  bar 1  0.0   Hook. Frame 0 is a finished poster: the vague line and the question, both in
 *               full from the first frame, the phone already peeking in at the bottom edge. The
 *               block pushes in linearly from frame 1 (no static frame, no ease-out stall) and
 *               the marker sweep behind the key word is a real event inside the first second.
 *               The hook leaves as one block at T.EX.hook.out.
 *         0-2.4 The phone creeps up linearly and runs straight into its rise to rest (two
 *               overlapping phone keys: no stall between them).
 *  bar 2  2.0   Chapter card "Assign." + sub (overlay-text.js, T.O.ch1).
 *         2.4   Camera push-in onto the task card (house curve), then a slow linear creep.
 *  bar 3  4.0   DROP: the touch-dot taps "Sam" (the music drop lands on this tap). The chip
 *               selects, then the card's owner line flips (0.15 s later), then the thesis rises
 *               0.7 s after the tap: one event at a time.
 *         5.3   Push banner (pushes.js), tapped at 6.1; the app answers with an iOS-style
 *               horizontal screen push (0.35 s), never a one-frame cut. A line types itself in
 *               (Film.frameT keeps every motion-blur subframe on the same character count).
 *         6.3   The camera returns to rest.
 *  bar 4  7.35  The phone sinks and fades; the logo parts assemble AT THEIR FINAL POSITION
 *               (nothing flies in and lurches into place).
 *  bar 5  8.0   Lock: one 4 % settle of the mark on the beat, the product name wipes on, the end
 *               lines rise. The poster is complete by ~9.0 and holds to the last frame with a
 *               1.5 % drift, so the end card is never a frozen frame.
 *
 * Ownership: this file owns everything it draws (hook, phone screens, end card) and registers its
 * own camera, phone, tap, push and sfx keys. It does not edit shared parts; a shared helper it
 * needs lives in this file.
 *
 * Variant: window.VARIANT = "alt" (index-alt.html / portrait-alt.html) swaps the hook copy
 * (COPY.variants.alt.hook). Same timeline, same everything else.
 *
 * Everything below is a pure function of t.
 */
(function () {
  "use strict";
  const { Film, Eng } = window;
  const { clamp, lerp, P, E, mixHex } = Eng;
  const T = window.T, X = T.EX, C = window.COPY, LOGO = window.LOGO;
  const IS45 = Film.format === "45";
  const L = Film.L, PH = Film.PHONE;
  const px = (v) => v.toFixed(2) + "px";
  const tok = (n) => Film.tok(n);

  const VAR = (Film.variant && C.variants && C.variants[Film.variant]) || {};
  const HOOK = Object.assign({}, C.hook, VAR.hook || {});

  // ---- app screen layout (phone logical px, 393 x 852) -----------------------------------
  const UI = {
    padX: 20,
    eyebrowTop: 66, titleTop: 86,
    card: { x: 16, y: 156, w: 361, h: 198, pad: 18 },
    chip: { w: 101, h: 44, gap: 11, top: 136 },          // chip row, relative to the card
    listTop: 378, rowH: 64,
  };
  const chipCenter = (i) => ({
    x: UI.card.x + UI.card.pad + i * (UI.chip.w + UI.chip.gap) + UI.chip.w / 2,
    y: UI.card.y + UI.chip.top + UI.chip.h / 2,
  });

  // ---- hook layout (screen px) ------------------------------------------------------------
  const HL = IS45
    ? { x: L.text.x, y: 330, w: L.text.w, line: 86, q: 64 }
    : { x: L.text.x, y: 350, w: 860, line: 88, q: 66 };

  // ---- end card layout (screen px) --------------------------------------------------------
  const hasBadges = Array.isArray(C.end.badges) && C.end.badges.length > 0;
  const EC = IS45
    ? { lockY: 470, mark: 128, name: 124, gap: 32, sloganTop: 600, slogan: 58, offerTop: 750, offer: 40, badgesTop: 870, badgeH: 64, fineTop: hasBadges ? 1000 : 880, fine: 28 }
    : { lockY: 370, mark: 140, name: 150, gap: 40, sloganTop: 500, slogan: 66, offerTop: 612, offer: 44, badgesTop: 712, badgeH: 70, fineTop: hasBadges ? 840 : 740, fine: 30 };

  // ---- keys: phone, camera, taps, pushes, sound ----------------------------------------------
  // phone: peeks in at frame 0 (~150 px of it on screen), creeps up linearly, rises to rest
  const PEEK = IS45 ? 852 : 830;                       // world px below rest
  Film.phoneMotion.key(-1, 0.001, { y: PEEK }, E.linear);
  Film.phoneMotion.key(X.phone.creep[0], X.phone.creep[1], { y: PEEK - 120 }, E.linear);
  Film.phoneMotion.key(X.phone.rise[0], X.phone.rise[1], { y: 0 });
  Film.phoneMotion.key(X.phoneExit[0], X.phoneExit[1], { y: 70, s: 0.94, o: 0 });

  // camera: push in on the task card (16:9 keeps the phone right of the 950 px text column;
  // 4:5 keeps the phone top under the text box), keep creeping in slowly while the UI plays (a
  // camera that lands and stops makes the next seconds feel frozen), then back to rest. The
  // linear creep starts before the push has landed, so the hand-over has no stall.
  // The zoom is chosen for the feed: at 1.5 the card title (19 px) is ~9.5 px on a 360 px wide
  // 4:5 feed frame. UI that matters must be framed this close; check with still.mjs --scale.
  const CAM_IN = IS45 ? T.frame["45"](196.5, 270, 540, 800, 1.5) : T.frame["169"](196.5, 270, 1350, 540, 1.55);
  const CAM_CREEP = IS45 ? T.frame["45"](196.5, 270, 540, 800, 1.56) : T.frame["169"](196.5, 270, 1350, 540, 1.62);
  const creep0 = X.camIn[0] + X.camIn[1] * 0.7;
  Film.camera.key(X.camIn[0], X.camIn[1], CAM_IN);
  Film.camera.key(creep0, X.camOut[0] + 0.4 - creep0, CAM_CREEP, E.linear);
  Film.camera.key(X.camOut[0], X.camOut[1], Object.assign({}, L.cam0));

  const sam = chipCenter(0);
  Film.tap({ t: X.tapAssign, x: sam.x, y: sam.y });
  Film.push({ t: X.push.t, dur: X.push.dur, title: C.push.accepted.title, body: C.push.accepted.body, tapAt: X.push.tapAt });
  Film.tap({ t: X.push.tapAt, x: 196.5, y: 100 });     // the banner's centre

  // taps and pushes are cued automatically (tools/audio/events.mjs); these are the extra cues
  Film.sfx({ t: X.hook.out + 0.1, sfx: "whoosh_short", gain: 0.4 });
  Film.sfx({ t: X.metaFlip, sfx: "pop", gain: 0.45 });
  Film.sfx({ t: X.screenPush[0] + 0.1, sfx: "whoosh_short", gain: 0.35 });
  for (let i = 0; i < 4; i++) Film.sfx({ t: X.typeLine[0] + 0.05 + i * 0.18, sfx: "type", gain: 0.35 });
  Film.sfx({ t: X.lock, sfx: "lock", gain: 0.8 });
  Film.sfx({ t: X.wordmark[0] + 0.25, sfx: "whoosh_short", gain: 0.3 });

  // ---- small builders -------------------------------------------------------------------
  const CHECK = (size, color, sw = 2.4) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
  function avatar(parent, letter, size, style) {
    return Film.el("div", null, parent, Object.assign({
      width: size + "px", height: size + "px", borderRadius: "50%", flex: `0 0 ${size}px`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.46) + "px", fontWeight: 700, color: "#fff", background: tok("--brand"),
    }, style || {}), letter);
  }
  function logoSvg(size) {
    const s = Film.svgEl("svg", { width: size, height: size, viewBox: LOGO.viewBox, preserveAspectRatio: "xMidYMid meet" });
    s.innerHTML = LOGO.defs || "";
    const parts = LOGO.parts.map((p) => {
      const g = Film.svgEl("g", {}, s);
      g.innerHTML = p;
      g.style.transformBox = "fill-box";
      g.style.transformOrigin = "center";
      return g;
    });
    return { svg: s, parts };
  }

  // DOM handles
  let tasks, tasksDim, done, chips = [], metaOld, metaNew, typedEl;
  let hookOuter, hookBlock, mkBg, mkTx;
  let endEl, lockRow, mark, word, slogan, offerRow, offerB, urlB, sep, fineB, badges = [];

  function buildTasks(screen) {
    const A = C.app;
    tasks = Film.el("div", "abs", screen, { left: 0, top: 0, width: PH.w + "px", height: PH.h + "px", background: tok("--surface"), zIndex: 2 });
    Film.el("div", "abs", tasks, { left: UI.padX + "px", top: UI.eyebrowTop + "px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: tok("--subtle") }, A.eyebrow);
    Film.el("div", "abs", tasks, { left: UI.padX + "px", top: UI.titleTop + "px", fontSize: "34px", fontWeight: 700, letterSpacing: "-0.03em", color: tok("--ink") }, A.title);
    const plus = Film.el("div", "abs", tasks, { right: UI.padX + "px", top: UI.titleTop + 4 + "px", width: "36px", height: "36px", borderRadius: "50%", background: tok("--ink"), display: "flex", alignItems: "center", justifyContent: "center" });
    plus.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M8 2v12M2 8h12"/></svg>';

    // the task card
    const cd = UI.card;
    const card = Film.el("div", "abs", tasks, { left: cd.x + "px", top: cd.y + "px", width: cd.w + "px", height: cd.h + "px", borderRadius: "var(--radius)", border: `1px solid ${tok("--border")}`, background: tok("--surface"), boxShadow: "0 1px 2px rgba(16,24,40,0.04)" });
    Film.el("div", "abs", card, { left: cd.pad + "px", top: cd.pad - 1 + "px", fontSize: "19px", fontWeight: 600, letterSpacing: "-0.015em", color: tok("--ink") }, A.task);
    // owner line: "No owner yet" flips to the avatar + "Sam · Friday"
    metaOld = Film.el("div", "abs", card, { left: cd.pad + "px", top: "54px", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", color: tok("--subtle") });
    Film.el("div", null, metaOld, { width: "22px", height: "22px", borderRadius: "50%", border: `1.5px dashed ${tok("--faint")}` });
    Film.el("span", null, metaOld, null, A.noOwner);
    metaNew = Film.el("div", "abs", card, { left: cd.pad + "px", top: "54px", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 600, color: tok("--ink"), opacity: 0 });
    avatar(metaNew, A.people[0][0], 22);
    Film.el("span", null, metaNew, null, `${A.people[0]} · ${A.due}`);
    Film.el("div", "abs", card, { left: cd.pad + "px", right: cd.pad + "px", top: "96px", height: "1px", background: tok("--border") });
    Film.el("div", "abs", card, { left: cd.pad + "px", top: "110px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em", color: tok("--subtle") }, A.assignLabel);
    chips = A.people.map((name, i) => {
      const el = Film.el("div", "abs", card, {
        left: cd.pad + i * (UI.chip.w + UI.chip.gap) + "px", top: UI.chip.top + "px", width: UI.chip.w + "px", height: UI.chip.h + "px",
        borderRadius: "var(--radius)", border: `1px solid ${tok("--border")}`, background: tok("--surface"),
        display: "flex", alignItems: "center", gap: "8px", padding: "0 10px", boxSizing: "border-box",
      });
      const av = avatar(el, name[0], 24, { position: "relative", background: i === 0 ? tok("--brand") : i === 1 ? "#8b8f97" : "#b0a28e" });
      const label = Film.el("span", null, el, { fontSize: "15px", fontWeight: 600, color: tok("--ink") }, name);
      // selected state: a check disc covers the avatar (selected = --accent-soft fill, --accent-ink text, check)
      const check = Film.el("div", "abs", av, { left: "0px", top: "0px", width: "24px", height: "24px", borderRadius: "50%", background: tok("--accent-ink"), display: "flex", alignItems: "center", justifyContent: "center", opacity: 0 });
      check.innerHTML = CHECK(15, "#fff", 3);
      return { el, label, check };
    });

    // the rest of the list
    C.app.others.forEach((o, i) => {
      const y = UI.listTop + i * UI.rowH;
      Film.el("div", "abs", tasks, { left: UI.padX + "px", right: UI.padX + "px", top: y + "px", height: "1px", background: tok("--border") });
      const dot = Film.el("div", "abs", tasks, { left: UI.padX + "px", top: y + 21 + "px", width: "22px", height: "22px", borderRadius: "50%", border: o.done ? "none" : `1.5px solid ${tok("--faint")}`, background: o.done ? tok("--brand") : "transparent", display: "flex", alignItems: "center", justifyContent: "center" });
      if (o.done) dot.innerHTML = CHECK(14, "#fff", 3);
      Film.el("div", "abs", tasks, { left: UI.padX + 36 + "px", top: y + 12 + "px", fontSize: "16px", fontWeight: 600, color: o.done ? tok("--subtle") : tok("--ink") }, o.title);
      Film.el("div", "abs", tasks, { left: UI.padX + 36 + "px", top: y + 34 + "px", fontSize: "13px", color: tok("--subtle") }, o.meta);
    });
    tasksDim = Film.el("div", "abs", tasks, { left: 0, top: 0, width: PH.w + "px", height: PH.h + "px", background: "#000", opacity: 0, zIndex: 5 });
  }

  function buildDone(screen) {
    const A = C.app;
    done = Film.el("div", "abs", screen, { left: 0, top: 0, width: PH.w + "px", height: PH.h + "px", background: tok("--surface"), zIndex: 3, visibility: "hidden" });
    const back = Film.el("div", "abs", done, { left: "14px", top: "62px", display: "flex", alignItems: "center", gap: "2px", fontSize: "17px", fontWeight: 500, color: tok("--brand-ink") });
    back.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${tok("--brand-ink")}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`;
    Film.el("span", null, back, null, A.back);
    const tile = Film.el("div", "abs", done, { left: (PH.w - 80) / 2 + "px", top: "150px", width: "80px", height: "80px", borderRadius: "var(--radius)", background: tok("--success-bg"), display: "flex", alignItems: "center", justifyContent: "center" });
    tile.innerHTML = CHECK(36, tok("--success-ink"), 2.2);
    Film.el("div", "abs", done, { left: 0, width: PH.w + "px", top: "252px", textAlign: "center", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.03em", color: tok("--ink") }, A.doneTitle);
    Film.el("div", "abs", done, { left: 0, width: PH.w + "px", top: "298px", textAlign: "center", fontSize: "17px", color: tok("--body") }, A.task);
    const row = Film.el("div", "abs", done, { left: 0, width: PH.w + "px", top: "338px", display: "flex", justifyContent: "center", gap: "8px" });
    const p1 = Film.el("div", null, row, { display: "flex", alignItems: "center", gap: "7px", height: "34px", padding: "0 12px 0 6px", borderRadius: "var(--radius)", background: tok("--accent-soft"), color: tok("--accent-ink"), fontSize: "15px", fontWeight: 600 });
    avatar(p1, A.people[0][0], 24);
    Film.el("span", null, p1, null, A.people[0]);
    Film.el("div", null, row, { display: "flex", alignItems: "center", height: "34px", padding: "0 12px", borderRadius: "var(--radius)", border: `1px solid ${tok("--border")}`, color: tok("--ink"), fontSize: "15px", fontWeight: 600 }, A.due);
    typedEl = Film.el("div", "abs", done, { left: 0, width: PH.w + "px", top: "400px", textAlign: "center", fontSize: "16px", color: tok("--subtle") });
  }

  function buildHook(ctx) {
    hookOuter = Film.el("div", "abs", ctx.overlay, { left: HL.x + "px", top: HL.y + "px", width: HL.w + "px", transformOrigin: "0% 50%" });
    hookBlock = { el: Film.el("div", null, hookOuter), words: [] };
    const line = Film.el("div", null, hookBlock.el, { fontSize: HL.line + "px", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: "1.06", color: tok("--ink"), textWrap: "balance" });
    const i = HOOK.line.indexOf(HOOK.key);
    const before = i >= 0 ? HOOK.line.slice(0, i) : HOOK.line, after = i >= 0 ? HOOK.line.slice(i + HOOK.key.length) : "";
    line.appendChild(document.createTextNode(before));
    if (i >= 0) {
      const mk = Film.el("span", null, line, { position: "relative", display: "inline-block", isolation: "isolate" });
      mkBg = Film.el("span", null, mk, { position: "absolute", left: "-0.07em", right: "-0.07em", top: "0.14em", bottom: "0.04em", borderRadius: "0.1em", background: tok("--accent-soft"), transformOrigin: "0% 50%", transform: "scaleX(0)", zIndex: -1 });
      mkTx = Film.el("span", null, mk, null, HOOK.key);
    }
    line.appendChild(document.createTextNode(after));
    // the question line is optional: question: "" (or no key) gives a one-line hook
    if (HOOK.question) Film.el("div", null, hookBlock.el, { marginTop: Math.round(HL.q * 0.32) + "px", fontSize: HL.q + "px", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: "1.08", color: tok("--brand-ink") }, HOOK.question);
  }

  function buildEnd(ctx) {
    const W = L.W;
    endEl = Film.el("div", "abs", ctx.top, { left: 0, top: 0, width: W + "px", height: L.H + "px", transformOrigin: `50% ${EC.lockY + 120}px`, visibility: "hidden" });
    // lockup: mark + product name, centred as a row; the mark sits at its final place from the
    // start because the (clipped) name already takes its space in the row
    lockRow = Film.el("div", "abs", endEl, { left: 0, width: W + "px", top: EC.lockY - EC.mark / 2 + "px", height: EC.mark + "px", display: "flex", alignItems: "center", justifyContent: "center", gap: EC.gap + "px" });
    mark = logoSvg(EC.mark);
    mark.svg.style.color = tok("--brand");
    mark.svg.style.flex = `0 0 ${EC.mark}px`;
    lockRow.appendChild(mark.svg);
    if (LOGO.wordmark) {
      const [, , vw, vh] = LOGO.wordmark.viewBox.split(" ").map(Number);
      const h = EC.name * 0.72;
      word = Film.svgEl("svg", { width: (h * vw) / vh, height: h, viewBox: LOGO.wordmark.viewBox }, lockRow);
      word.innerHTML = LOGO.wordmark.inner;
      word.style.color = tok("--ink");
    } else {
      word = Film.el("div", null, lockRow, { fontSize: EC.name + "px", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: "1", color: tok("--ink"), whiteSpace: "nowrap", paddingBottom: "0.06em" }, C.end.name);
    }
    const line = (top) => Film.el("div", "abs", endEl, { left: "60px", width: W - 120 + "px", top: top + "px", display: "flex", justifyContent: "center", alignItems: "baseline", flexWrap: "wrap", textAlign: "center" });
    slogan = Film.type.make(line(EC.sloganTop), C.end.slogan, null, { fontSize: EC.slogan + "px", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: "1.1", color: tok("--ink"), textWrap: "balance" });
    offerRow = line(EC.offerTop);
    offerRow.style.columnGap = Math.round(EC.offer * 0.6) + "px";
    offerB = Film.type.make(offerRow, C.end.offer, null, { fontSize: EC.offer + "px", fontWeight: 600, letterSpacing: "-0.02em", color: tok("--ink") });
    sep = Film.el("div", null, offerRow, { width: "2px", height: Math.round(EC.offer * 0.8) + "px", background: tok("--border"), alignSelf: "center" });
    urlB = Film.type.make(offerRow, C.end.url, null, { fontSize: EC.offer + "px", fontWeight: 700, letterSpacing: "-0.02em", color: tok("--ink") }, { whole: true });
    if (hasBadges) {
      const row = line(EC.badgesTop);
      row.style.gap = Math.round(EC.badgeH * 0.3) + "px";
      badges = C.end.badges.map((b) => {
        const img = Film.el("img", null, row, { height: EC.badgeH + "px", width: (EC.badgeH * b.w) / b.h + "px", opacity: 0 });
        img.src = b.src;
        img.alt = "";
        return img;
      });
    }
    if (C.end.fine) fineB = Film.type.make(line(EC.fineTop), C.end.fine, null, { fontSize: EC.fine + "px", fontWeight: 500, letterSpacing: "-0.01em", color: tok("--label-ink") });
  }

  Film.register({
    id: "act-example",
    order: 20,
    mount(ctx) {
      buildTasks(ctx.phone.screen);
      buildDone(ctx.phone.screen);
      buildHook(ctx);
      buildEnd(ctx);
    },
    render(t) {
      // ---- hook ------------------------------------------------------------------------------
      // a linear push from frame 0 (2.2 %/s about the left edge, a slow upward drift): no static
      // first second, no ease-out stall; it keeps moving through the exit
      const ht = Math.min(t, X.hook.out + 0.3);
      hookOuter.style.transform = `translate3d(0, ${px(-14 * ht)}, 0) scale(${(1 + 0.022 * ht).toFixed(5)})`;
      Film.type.render(hookBlock, t, -1, X.hook.out);
      if (mkBg) {
        const m = P(t, X.hook.marker[0], X.hook.marker[1], E.house);
        mkBg.style.transform = `scaleX(${m.toFixed(4)})`;
        // the word turns brand-ink right behind the marker's edge
        mkTx.style.color = mixHex(tok("--ink"), tok("--brand-ink"), P(t, X.hook.marker[0] + X.hook.marker[1] * 0.35, X.hook.marker[1] * 0.65, E.house));
      }

      // ---- tasks screen: the key tap selects Sam, then the owner line flips ---------------------
      const sel = P(t, X.tapAssign + 0.02, 0.18, E.out);
      const c0 = chips[0];
      c0.el.style.background = mixHex(tok("--surface"), tok("--accent-soft"), sel);
      c0.el.style.borderColor = mixHex(tok("--border"), tok("--accent-soft"), sel);
      c0.label.style.color = mixHex(tok("--ink"), tok("--accent-ink"), sel);
      c0.check.style.opacity = sel.toFixed(3);
      c0.check.style.transform = `scale(${(0.6 + 0.4 * sel).toFixed(4)})`;
      const fo = P(t, X.metaFlip, 0.22, E.house), fi = P(t, X.metaFlip + 0.06, 0.3, E.house);
      metaOld.style.opacity = (1 - fo).toFixed(3);
      metaOld.style.transform = `translate(0, ${px(-6 * fo)})`;
      metaNew.style.opacity = fi.toFixed(3);
      metaNew.style.transform = `translate(0, ${px(6 * (1 - fi))})`;

      // ---- screen push: tasks -> done (outgoing moves a third and dims, incoming covers it) ----
      // (2D translate() inside the phone, never translate3d(): see the header of phone.js)
      const u = P(t, X.screenPush[0], X.screenPush[1], E.house);
      tasks.style.transform = `translate(${px(-0.3 * PH.w * u)}, 0)`;
      tasks.style.visibility = u >= 1 ? "hidden" : "inherit";
      tasksDim.style.opacity = (0.1 * u).toFixed(3);
      done.style.transform = `translate(${px(PH.w * (1 - u))}, 0)`;
      done.style.boxShadow = u > 0 && u < 1 ? `-12px 0 32px rgba(16,24,40,${(0.16 * (1 - u)).toFixed(3)})` : "none";
      done.style.visibility = u > 0 ? "inherit" : "hidden";
      // value-changing text: computed from Film.frameT(t) so all 8 subframes agree
      typedEl.textContent = Eng.typed(C.app.doneLine, Film.frameT(t), X.typeLine[0], X.typeLine[1]);

      // ---- end card --------------------------------------------------------------------------
      const e0 = X.logo[0];
      endEl.style.visibility = t >= e0 - 0.01 ? "inherit" : "hidden";
      if (t < e0 - 0.01) return;
      const n = mark.parts.length, pd = 0.4, st = n > 1 ? Math.max(0, X.logo[1] - pd) / (n - 1) : 0;
      mark.parts.forEach((g, i) => {
        const a = P(t, e0 + i * st, pd, E.house);
        g.style.opacity = a.toFixed(3);
        g.style.transform = `scale(${(0.82 + 0.18 * a).toFixed(4)})`;
      });
      // one 4 % settle on the lock
      const settle = 1.04 - 0.04 * P(t, X.lock, 0.3, E.house);
      mark.svg.style.transform = `scale(${settle.toFixed(4)})`;
      const wu = P(t, X.wordmark[0], X.wordmark[1], E.house);
      word.style.clipPath = `inset(-20% ${((1 - wu) * 100).toFixed(2)}% -20% -2%)`;
      word.style.transform = `translate3d(${px(-14 * (1 - wu))}, 0, 0)`;
      const [l0, l1, l2] = X.endLines;
      Film.type.render(slogan, t, l0, Infinity, { stagger: 0.05, dur: 0.55 });
      Film.type.render(offerB, t, l1, Infinity, { stagger: 0.04, dur: 0.5 });
      Film.type.render(urlB, t, l1 + 0.12, Infinity, { dur: 0.5 });
      sep.style.opacity = P(t, l1 + 0.1, 0.35, E.house).toFixed(3);
      badges.forEach((b, i) => {
        const a = P(t, l2 + i * 0.08, 0.45, E.house);
        b.style.opacity = a.toFixed(3);
        b.style.transform = `translate3d(0, ${px(10 * (1 - a))}, 0)`;
      });
      if (fineB) Film.type.render(fineB, t, l2 + (hasBadges ? 0.2 : 0), Infinity, { stagger: 0.03, dur: 0.5 });
      // the poster drifts 1.5 % to the last frame: a held end card is never a frozen frame
      const drift = P(t, X.lock, Math.max(0.1, T.DURATION - X.lock), E.linear);
      endEl.style.transform = `scale(${(1 + 0.015 * drift).toFixed(5)})`;
    },
  });
})();
