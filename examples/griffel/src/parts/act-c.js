/*
 * Act C: Doorvragen + drop + send setup (16.2 - 28.0). See docs/storyboard.md and T.C.
 *
 * Phone screen: the meeting screen of griffel-app (app/(app)/meetings/[id].tsx) in its
 * "yourTurn / questions_ready" state, i.e. the QuestionWizard:
 *   top row (ArrowLeft + subject) · step indicator (label + Progress) · question page(s) ·
 *   review step ("Klaar om te versturen") with the answered card, the NotesSetupCard,
 *   "Notulen versturen" and "Terug".
 * The wizard has 2 questions and no names step, so the real app counts 3 steps
 * (2 questions + review, totalSteps = reviewIndex + 1): "Stap 1 van 3 · Vragen",
 * "Stap 2 van 3 · Vragen", "Stap 3 van 3 · Versturen". The question is plain text-2xl bold.
 *
 * Page changes are navigation pushes (0.35 s, house curve): the incoming page slides in from
 * x +393 over the outgoing one, which moves -30 % and dims 10 %; the top row, the step indicator
 * (its values crossfade) and the status bar stay put. At 16.93 the outgoing screen is act B's
 * working stage, which stays put under a dim sheet. Act D covers the review page at 27.6 (this
 * act keeps it opaque until then).
 *
 * Signature: the question builds word by word (Live Translate grammar). Climax: caption 3 from
 * act A ("SPREKER 3 · ...dan houden we de Q4-deadline aan.") returns while the options are up.
 * As "Doorvragen." leaves (T.O.ch2.out) the caption grows from its bottom-left into the empty
 * text box (64 px 16:9, 58 px 4:5). On the drop (22.0) the tap selects "12 december" (the row
 * keeps its label and leaves with Q1); a copy of it lifts off the row, leaves the phone at the
 * option row and travels off the phone's silhouette (never over app text, the island or the
 * status bar), growing along its arc to the caption's size. "de Q4-deadline" is struck on the
 * tap and fades out (0.1 s) before the copy reaches it; the copy lands in its slot (act B's flip
 * grammar). Fix 5: in 16:9 the layout is locked ("...dan houden we" / slot / "aan.", nothing
 * reflows); the caption holds at its big size and leaves as one block before the tap on Lisa
 * (23.35-23.65), so Q2 has the frame and the thesis (T.O.climax.a, 24.0) rises into an empty box.
 * The camera punch (+4 %, a spring settling over 0.6 s) is aimed at the options.
 * Recipients are chosen by the user: three taps on the "Eerder gebruikt" contact rows
 * (NotesSetupCard, visibleContacts); each tapped row closes and its mint chip pops in.
 * First names stand in for the e-mail addresses (no addresses on screen).
 *
 * Camera: one take in three long phrases with overlapping keys (never a dead stop):
 *   16.3-19.9  from T.handoff.BC, push in on the building question
 *   19.6-22.8  settle on the options, anticipation zoom about "12 december", the punch
 *   22.6-25.9  one slow descent and pull-out down Q2 (its question keeps headroom until the tap
 *              on Lisa, 23.6) and the review page, calm under the thesis (24.0-26.1)
 *   25.6-27.5  (fix 5) one slow push in on the lower half of the review page: 16:9 z 2.3, so
 *              "Wie krijgt de notulen?", the names and the chips read; the context tap, the
 *              scroll, the recipient taps and the send tap (27.5) all play in that framing.
 *              4:5: the phone rises under the context footnote (z 1.32: the text box caps it)
 *   27.55-28.85 a slow pull-out to rest (1.3 s); act D's camera key blends in from 27.6 while
 *              its e-mail unfolds (T.D.emailUnfold, 27.9).
 *
 * Pure function of t. All layout is absolute in phone logical px (393 x 852), so tap
 * targets are exact. Screen z-index 24 (covers act B, covered by act D). House curve only.
 */
(function () {
  "use strict";
  const { Film, Eng, COPY, T } = window;
  const { P, clamp, lerp, mixHex, spring } = Eng;
  const C = T.C;
  const A = COPY.app;
  const F45 = Film.format === "45";

  // Verbatim griffel-app nl.ts strings this screen needs that are not (yet) in copy.js.
  // Keys: see comments. Fold these into copy.js (COPY.app) when the copy owner can.
  const NL = {
    yourTurnDesc: "Je antwoorden maken de notulen scherper. Je transcript blijft verborgen.", // meeting.stage.yourTurn.description
    freeTextPlaceholder: "Anders, namelijk...",            // meeting.questions.freeTextPlaceholder
    stepReview: "Versturen",                               // meeting.wizard.stepReview
    reviewDesc: "Griffel maakt de notulen en stuurt ze naar je inbox.", // meeting.wizard.reviewDescription
    answered: "{count} van {total} beantwoord",            // meeting.wizard.answered
    edit: "Wijzigen",                                      // meeting.wizard.edit
    back: "Terug",                                         // common.back
    subjectLabel: "Onderwerp",                             // meeting.details.subjectLabel
    contextDesc: "Optioneel. Voeg een agenda, offerte of andere documenten toe. Griffel gebruikt ze om namen, bedragen en vaktermen goed in de notulen te krijgen.", // meeting.context.description
    addFile: "Bestand toevoegen",                          // meeting.context.addFile
    pasteToggle: "Tekst plakken",                          // meeting.context.pasteToggle
    previous: "Eerder gebruikt",                           // meeting.attendees.previous
    sendingBtn: "Notulen versturen...",                    // meeting.send.sending
    fileSize: "128 kB",                                    // formatFileSize() of the fictional file
  };

  // app tokens (griffel-app global.css, light)
  const K = {
    ink: "#131417", muted: "#6B7280", faint: "#9AA1A9", border: "#E8EAED", border60: "rgba(232,234,237,0.6)", card: "#FFFFFF", surfaceMuted: "#F6F7F8",
    mint: "#D6FBEB", mintInk: "#00301B", greenInk: "#12804B", track: "rgba(19,20,23,0.20)", onInk: "#FAFAFA",
  };

  // lucide icons (24 viewBox, round caps)
  const IC = {
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    checkCircle2: '<circle class="cc-c" cx="12" cy="12" r="10" pathLength="1"/><path class="cc-k" d="m9 12 2 2 4-4" pathLength="1"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
    fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  };
  function svg(name, size, color, sw = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${IC[name]}</svg>`;
  }
  const px = (v) => v.toFixed(2) + "px";

  // ---- layout (phone logical px, unscrolled; content column x 20..373) -----------------
  const X0 = 20, CW = 353, IW = CW - 40;
  const VIEW_TOP = 59;               // SafeAreaView top edge: the ScrollView clips here
  const Y = { top: 75, step: 135, bar: 161 };
  const BODY_TOP = 116;              // the wizard body (step indicator + pages) starts under the top row
  const PAGE_TOP = 174;              // a page starts under the progress bar (161..167)
  // QuestionWizard page: gap-6 stack; description -mt-3; options gap-2.5; skip + (index > 0) Terug
  const Q1L = { q: 191, desc: 299, opt: [363, 429, 495], freeL: 575, free: 599, skip: 687, back: 0 };
  const Q2L = { q: 191, desc: 267, opt: [331, 397, 463], freeL: 543, free: 567, skip: 655, back: 707 };
  // review: hero (tile, title, 2-line description) · answered card · NotesSetupCard · button · Terug
  const RV = { tile: 199, title: 279, desc: 317, ans: 381, card: 475 };
  // card-relative offsets (px-5 py-5, gap-6). FILE_GROW is added below the file row once it lands.
  const CD = { subjL: 20, subj: 44, ctxL: 108, ctxDesc: 136, file: 196, btns: 196, recL: 256, chips: 284, prevL: 328, rows: 348, h: 512 };
  const ROW_H = 48;                  // contact row: py-2.5 + 28 px circle
  const SEC_TAIL = 12 + 24;          // gap-3 + (pt-1 + label + gap-1): leaves with the last contact
  const FILE_GROW = 68;              // file row 56 + gap 12
  const CHIP_ROW = 36;               // second chip row (28 + gap 8): the last name wraps
  const SEND_Y0 = RV.card + CD.h + 24; // 1011 (+ layout changes)
  // One scroll, after the file row has landed: the contact rows come up (Lisa's row ends at 835)
  // while "Notulen versturen" stays below the screen edge until the rows close under it.
  const SCROLL = 200;
  const ADD_W = 172;                 // "Bestand toevoegen" outline button width
  // page change = a navigation push (house curve, 0.35 s): the incoming page slides in from
  // x +393 over the outgoing one, which moves -30 % and dims (black, 10 %). The top row, the step
  // indicator and the status bar stay put.
  const PUSH = { dur: 0.35, back: 0.3 * 393, dim: 0.1 };

  // ---- timing (all derived from T.C) ----------------------------------------------------
  const tA = C.tapAnswer;                      // 22.0 == DROP
  const tAdv1 = tA + C.autoAdvance;            // 22.25: wizard index 0 -> 1
  const tAdv2 = C.tapQ2 + C.autoAdvance;       // 23.40: wizard index 1 -> review
  const tShell = C.tapPush + 0.03;             // 16.93: the tap on the push opens the wizard
  const tCov1 = tAdv1 + 0.05;                  // 22.30: Q2 is pushed over Q1
  const tCov2 = tAdv2 + 0.05;                  // 23.45: the review is pushed over Q2
  const dFile = 0.4;                           // the file row lands (C.contextFile ..)
  const tScroll = C.contextFile + 0.02, dScroll = 0.4;    // 26.17 - 26.57: up to the recipients
  const tSendBusy = C.tapSend + 0.08;          // 27.58
  // act D's "Notulen onderweg" screen (z 35) covers this one from 27.6; stay opaque under it
  const tScreenOff = Math.max(C.end, (T.D && T.D.sending ? T.D.sending[1] : C.end));
  // recipients: chip i (Lisa, Daan, Sanne) pops as its row closes, exactly on T.C.recipients[i + 1]
  // (the SFX pops); its row is tapped 0.12 s earlier. The rows are listed Sanne / Daan / Lisa and
  // tapped bottom-up, so no row ever moves under the finger. The first tap waits for the scroll
  // (26.57); 0.22 s apart, so touch.js glides one dot between them: 26.61 / 26.83 / 27.05.
  const POP_AFTER_TAP = 0.12;
  const tTap = [0, 1, 2].map((i) => Math.max(C.recipients[i + 1] - POP_AFTER_TAP, tScroll + dScroll + 0.04 + i * 0.22));
  const tPop = tTap.map((x) => x + POP_AFTER_TAP);
  const rowOf = [2, 1, 0];                     // list row (top-down) of chip i

  // caption 3 returns (overlay, screen space) and flips on the drop. From the hard exit of
  // "Doorvragen." it grows (anchored at its bottom-left, up into the empty text box) so the swap
  // reads at feed size. Fix 5: it holds at that size and leaves as one block before Lisa is tapped
  // (out 23.35, gone 23.65), so Q2 ("who") has the frame to itself and the thesis (24.0) rises into
  // an empty text box. If a re-time ever puts the thesis under it again, it settles back to caption
  // size from T.O.climax.a (tag and the words around the answer dim, "12 december" keeps its colour).
  const O = T.O;
  const CAP = {
    in: C.q1Options[2] + 0.4,                  // 20.8: the options are up
    mark: C.q1Options[2] + 0.75,               // 21.15: marker on "Q4-deadline"
    grow: O.ch2.out, growDur: 0.4,             // 21.95: "Doorvragen." leaves, the caption grows
    strike: tA + 0.02,                         // 22.02: the answer is tapped, the old reference is struck
    lift: tA + 0.1,                            // 22.10: the selected fill is in; the copy lifts
    fly: F45 ? 0.6 : 0.56,
    oldTau: F45 ? 0.58 : 0.6,                  // the struck words are gone by this part of the flight
    oldFade: 0.1,                              // ... after a 0.1 s fade (no blur: no ghost)
    out: C.tapQ2 - 0.25,                       // 23.35: leaves as one block before the tap on Lisa
    exit: 0.3,
    settleDur: 0.5, dimTo: 0.45,
  };
  CAP.land = CAP.lift + CAP.fly;               // 22.66 (4:5 22.70)
  CAP.oldOut = CAP.lift + CAP.oldTau * CAP.fly;  // 22.44 (4:5 22.45)
  // settles only when the thesis rises before the caption has gone (not with the fix 5 times)
  CAP.settles = CAP.out + CAP.exit > O.climax.a;
  CAP.settle = CAP.settles ? Math.max(O.climax.a, CAP.land + 0.06) : Infinity;
  // caption type (screen px): small = caption size, big = the swap. 16:9 sets the quote in three
  // lines so the new words come in from the right along their own line; 4:5 in two lines, the new
  // words come up from under the slot. Both stay clear of the zoomed phone and of the thesis.
  const CT = F45
    ? { tag: 20, line: 32, lh: 42, big: 58, bottom: 416 }
    : { tag: 24, line: 38, lh: 50, big: 64, bottom: 840 };

  // Q1 words: speech rhythm, a breath after the first sentence. The quoted reference
  // ("'de Q4-deadline'.") never breaks over two lines. The first word lands as the wizard opens.
  const q1s = tShell + 0.14;                                  // 17.07
  const q1Last = C.q1Build[0] + C.q1Build[1] - 0.75;          // 18.85: last word starts
  const Q1_WORDS = (function () {
    const txt = COPY.q1.text;
    const ws = txt.split(/\s+/).filter(Boolean).map((w) => ({ w }));
    const qs = ws.findIndex((o) => o.w.startsWith("'"));
    if (qs >= 0) { ws[qs].grp = true; if (ws[qs + 1]) ws[qs + 1].grp = true; }
    let tt = q1s;
    ws.forEach((o, i) => {
      o.t = tt;
      tt += 0.155;
      if (/[.?!]'?$/.test(o.w) && i < ws.length - 1) tt += 0.28;
    });
    const last = ws[ws.length - 1].t;
    const k = (q1Last - q1s) / (last - q1s);
    ws.forEach((o) => (o.t = q1s + (o.t - q1s) * k));
    return ws;
  })();

  // ---- elements ---------------------------------------------------------------------------
  let scr, content, body, shellDim, stepLbl, stepDigit, stepSect, barFill, barTrack;
  const q1 = {}, q2 = {}, rv = {}, cap = {};

  const el = (tag, parent, style, text) => Film.el(tag, null, parent, Object.assign({ position: "absolute" }, style), text);
  const label12 = (parent, x, y, text, w) => el("div", parent, { left: x + "px", top: y + "px", width: (w || CW) + "px", fontSize: "12px", lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: K.muted, whiteSpace: "nowrap" }, text);
  const backLink = (parent, y) => el("div", parent, { left: "0px", top: y + "px", width: CW + "px", height: "36px", lineHeight: "36px", textAlign: "center", fontSize: "14px", color: K.muted, textDecoration: "underline", textUnderlineOffset: "2px" }, NL.back);

  // step value: two stacked spans on the same baseline; a value changes with a short crossfade
  // (no roll: the app has no rolling counter). The old value is out (0.12 s) just as the new one
  // comes in (0.12 s, 0.08 s later), so two different words never sit on top of each other.
  const XFADE = { out: 0.12, inAt: 0.08, in: 0.12 };
  function roller(parent, values, changes) {
    const mask = Film.el("span", null, parent, { display: "inline-block", position: "relative", height: "16px", verticalAlign: "top" });
    const cur = Film.el("span", null, mask, { display: "inline-block", whiteSpace: "nowrap" }, values[0]);
    const prev = Film.el("span", null, mask, { position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", opacity: 0 }, values[0]);
    return { mask, cur, prev, values, changes };
  }
  function renderRoller(r, t) {
    let i = 0;
    r.changes.forEach((c, j) => { if (t >= c) i = j + 1; });
    const c = i > 0 ? r.changes[i - 1] : 0;
    if (r.cur.textContent !== r.values[i]) r.cur.textContent = r.values[i];
    if (i > 0 && r.prev.textContent !== r.values[i - 1]) r.prev.textContent = r.values[i - 1];
    r.cur.style.opacity = (i > 0 ? P(t, c + XFADE.inAt, XFADE.in) : 1).toFixed(3);
    r.prev.style.opacity = (i > 0 ? 1 - P(t, c, XFADE.out) : 0).toFixed(3);
  }

  // option row (Pressable min-h-14, rounded-lg, px-4). Selected = flat bg-accent, no border.
  function option(parent, y, text) {
    const box = el("div", parent, { left: "0px", top: y + "px", width: CW + "px", height: "56px", borderRadius: "10px", overflow: "hidden", transformOrigin: "50% 50%" });
    const fill = el("div", box, { left: "0px", top: "0px", width: CW + "px", height: "56px", background: K.mint, opacity: 0 });
    const hair = el("div", box, { left: "0px", top: "0px", width: CW + "px", height: "56px", borderRadius: "10px", boxShadow: `inset 0 0 0 1px ${K.border}` });
    const txt = el("div", box, { left: "16px", top: "18px", width: CW - 64 + "px", fontSize: "16px", lineHeight: "20px", color: K.ink, fontWeight: 400, whiteSpace: "nowrap" }, text);
    const chk = el("div", box, { left: CW - 16 - 18 + "px", top: "19px", width: "18px", height: "18px" });
    chk.innerHTML = svg("checkCircle2", 18, K.mintInk, 2);
    return { box, fill, hair, txt, chk, cc: chk.querySelector(".cc-c"), ck: chk.querySelector(".cc-k") };
  }
  function renderOption(o, t, tIn, sel, inDur = 0.55) {
    // entrance: rise + fade (land slowly)
    const u = P(t, tIn, inDur);
    o.box.style.opacity = clamp(u * 1.6).toFixed(3);
    let tf = `translate3d(0, ${((1 - u) * 18).toFixed(2)}px, 0)`;
    // press (active:bg-accent/50) -> selected (bg-accent), all done by sel + 0.20
    let pressA = 0, selU = 0, chkU = 0, tickU = 0, squash = 0;
    if (sel) {
      pressA = P(t, sel - 0.06, 0.06) * (1 - P(t, sel + 0.05, 0.1));
      selU = P(t, sel + 0.02, 0.12);
      chkU = P(t, sel + 0.04, 0.12);
      tickU = P(t, sel + 0.08, 0.12);
      squash = 0.015 * P(t, sel - 0.06, 0.06) * (1 - P(t, sel + 0.05, 0.3));   // 0.985 at the tap
    }
    o.fill.style.opacity = Math.max(pressA * 0.5, selU).toFixed(3);
    o.hair.style.opacity = (1 - selU).toFixed(3);                      // selected = no border
    o.txt.style.color = mixHex(K.ink, K.mintInk, selU);
    o.txt.style.fontWeight = selU > 0.5 ? 500 : 400;
    o.chk.style.opacity = clamp(chkU * 6).toFixed(3);                 // round caps would show a dot at 0
    o.cc.style.strokeDasharray = "1"; o.cc.style.strokeDashoffset = (1 - chkU).toFixed(4);
    o.ck.style.strokeDasharray = "1"; o.ck.style.strokeDashoffset = (1 - tickU).toFixed(4);
    if (squash > 0) tf += ` scale(${(1 - squash).toFixed(4)})`;
    o.box.style.transform = tf;
  }

  // the outgoing page dims under the incoming one: a black sheet over its content
  const dimSheet = (pg, top) => el("div", pg, { left: "0px", top: top + "px", width: "393px", height: 1300 - top + "px", background: "#000000", opacity: 0 });   // appended last: paints over the page
  // question page: an opaque page (white from under the progress bar) holding the question
  // (text-2xl bold tracking-tight, plain), the muted description, options, free text and skip
  function buildQuestionPage(parent, L, words, opts) {
    const pg = el("div", parent, { left: "0px", top: "0px", width: "393px", height: "1300px" });
    el("div", pg, { left: "0px", top: PAGE_TOP + "px", width: "393px", height: 1300 - PAGE_TOP + "px", background: "#ffffff" });
    const inner = el("div", pg, { left: X0 + "px", top: "0px", width: CW + "px", height: "1300px" });
    const qEl = el("div", inner, { left: "0px", top: L.q + "px", width: CW + "px", fontSize: "24px", lineHeight: "32px", fontWeight: 700, letterSpacing: "-0.025em", color: K.ink });
    const ws = [];
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
      const s = Film.el("span", null, host, { display: "inline-block", position: "relative", whiteSpace: "pre" }, o.w);   // no will-change: a kept raster scale would depend on seek order
      ws.push({ s, o });
    });
    const desc = el("div", inner, { left: "0px", top: L.desc + "px", width: CW + "px", fontSize: "14px", lineHeight: "20px", color: K.muted }, NL.yourTurnDesc);
    const op = opts.map((txt, i) => option(inner, L.opt[i], txt));
    const freeL = label12(inner, 0, L.freeL, A.writeOwn);
    const free = el("div", inner, { left: "0px", top: L.free + "px", width: CW + "px", height: "64px", borderRadius: "10px", boxShadow: `inset 0 0 0 1px ${K.border}` });
    el("div", free, { left: "12px", top: "10px", fontSize: "16px", lineHeight: "20px", color: K.muted }, NL.freeTextPlaceholder);
    const skip = el("div", inner, { left: "0px", top: L.skip + "px", width: CW + "px", height: "44px", lineHeight: "44px", textAlign: "center", fontSize: "14px", fontWeight: 500, color: K.ink }, A.skip);
    const back = L.back ? backLink(inner, L.back) : null;
    const dim = dimSheet(pg, PAGE_TOP);
    return { pg, inner, qEl, ws, desc, op, freeL, free, skip, back, dim };
  }
  // word: Live Translate grammar — fade, rise and de-blur, each word on its own beat (house curve)
  function renderWord(w, t, t0, dur = 0.42) {
    const u = P(t, t0, dur);
    const a = P(t, t0, dur * 0.7);
    w.s.style.opacity = a.toFixed(3);
    w.s.style.transform = `translate3d(0, ${((1 - u) * 11).toFixed(2)}px, 0)`;
    const b = (1 - P(t, t0, 0.36)) * 6;
    w.s.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none";
  }
  const fadeRise = (e, t, t0, dur = 0.5, dy = 12) => {
    const u = P(t, t0, dur);
    e.style.opacity = clamp(u * 1.5).toFixed(3);
    e.style.transform = `translate3d(0, ${((1 - u) * dy).toFixed(2)}px, 0)`;
  };
  // push: the incoming page's x (from +393) and the outgoing page's x (to -30 %) and dim
  const pushU = (t, t0) => P(t, t0, PUSH.dur);
  const pushInX = (t, t0) => 393 * (1 - pushU(t, t0));
  const pushOutX = (t, t0) => -PUSH.back * pushU(t, t0);
  const pushDim = (t, t0) => PUSH.dim * pushU(t, t0);

  // ---- camera ----------------------------------------------------------------------------
  // focus(lx, ly, sx, sy, z): camera so that phone logical point (lx, ly) lands on screen (sx, sy)
  function focus(lx, ly, sx, sy, z) {
    const wx = lx - 196.5, wy = ly - 426;
    return { cx: wx - (sx - Film.L.W / 2) / z, cy: wy - (sy - Film.L.H / 2) / z, z };
  }
  // the drop's punch (+4 %): a near-critically damped spring (Eng.spring, zeta 1, no overshoot),
  // about 77 % in by 0.25 s, then still settling (a slow drift) through tA + 0.6, where the descent
  // takes over: no dead hold
  const PUNCH = { k: 1.04, dur: 0.6, f: 1.8, z: 1.0 };
  const DROP_DX = F45 ? 130 : 50;              // screen px the phone drifts right before the drop
  // fix 5: the close framing for the context tap, the recipients and the send tap. 16:9: phone
  // logical y 650 at screen (CLOSE.sx, 540) at z 2.3: the left screen edge lands at x 1000, Lisa's row
  // (logical 787-835 after the scroll) ends at ~966, the file row (471-527) starts at ~128. 4:5:
  // phone top at y 228 under the context footnote at z 1.32, Lisa's row ends at ~1330.
  const CLOSE = F45 ? { z: 1.32, sy: 228 } : { z: 2.3, ly: 650, sx: 1000 + 196.5 * 2.3 };
  const punchEase = (u) => spring(u * PUNCH.dur, PUNCH.f, PUNCH.z) / spring(PUNCH.dur, PUNCH.f, PUNCH.z);
  function registerCamera() {
    const cam = Film.camera;
    const rest = Object.assign({}, Film.L.cam0);
    const ansX = 84, ansY = Q1L.opt[0] + 28;      // "12 december": text centre (84, 391)
    // Phrase 1 starts from T.handoff.BC (act B lands on it by 16.3); no key of this act targets
    // it, so the take simply continues from wherever act B leaves the camera.
    if (!F45) {
      // 16:9: the phone stays right of the text column (climax lines end ~884, the returning
      // caption ~850): its left frame edge never comes left of ~933.
      // phrase 1: push in on the building question (starts while act B lands on BC)
      cam.key(16.1, 3.9, focus(196.5, 245, 1345, 510, 1.62));
      // phrase 2: settle on question + options (crop in the gap under the top row), then an
      // anticipation zoom about "12 december" (crop in the gap under the progress bar) that drifts
      // the phone DROP_DX right (its right bezel runs off the frame), so the copy of the answer has
      // room to come down beside the phone, off its silhouette. The punch is +4 % on a spring that
      // settles into the descent (no pull-back, no dead hold).
      const PS = { x: 1165.5, y: 486 };
      cam.key(18.6, 2.4, focus(ansX, ansY, PS.x, PS.y, 1.75));
      cam.key(20.6, 1.65, focus(ansX, ansY, PS.x + DROP_DX, PS.y, 2.2));
      cam.key(tA, PUNCH.dur, focus(ansX, ansY, PS.x + DROP_DX, PS.y, 2.2 * PUNCH.k), punchEase);
      // phrase 3 (fix 5): one slow descent + pull-out down Q2 and the review page, calm under the
      // thesis (24.0-26.1); from its tail one slow push in on the lower half of the review page,
      // close enough that "Wie krijgt de notulen?", the contact names and the chips read (12-14 px
      // UI at 29-32 px): the context tap (25.95) lands early in it, the scroll, the three recipient
      // taps and the send tap all play in that one framing (screen x of the phone's left edge stays
      // >= 1000, clear of the context card). Still easing in through the taps: no frozen hold.
      // (Q2 keeps ~150 px of headroom over its question until Lisa is tapped at 23.6)
      cam.key(22.55, 1.9, focus(196.5, 420, 1340, 540, 1.7));
      cam.key(23.8, 2.1, focus(196.5, 520, 1340, 540, 1.6));
      cam.key(25.6, 1.5, focus(196.5, CLOSE.ly, CLOSE.sx, 540, CLOSE.z));
    } else {
      // 4:5: overlay text on top; the returning caption sits above y ~416, so from 20.8 to 24.1
      // the phone frame stays below ~428. The phone runs off the bottom of the frame.
      const top = (z, sy) => focus(196.5, 0, 540, sy, z);   // phone top (logical 0) at screen y sy
      cam.key(16.1, 3.9, top(1.58, 395));
      cam.key(18.6, 2.4, top(1.65, 445));
      // the anticipation zoom drifts the phone DROP_DX right, so the copy of the answer can rise up
      // the left margin, off the phone's silhouette (never over the status bar, island or app text)
      cam.key(20.3, 2.0, focus(196.5, 0, 540 + DROP_DX, 470, 1.8));
      // punch +4 % about (84, 120): the phone top only rises ~9 px (clear of the grown caption),
      // the options move down ~20 px; a spring that settles into the descent (no dead hold)
      const PY = 120;
      const pv = { x: 540 + DROP_DX + (ansX - 196.5) * 1.8, y: 470 + PY * 1.8 };
      cam.key(tA, PUNCH.dur, focus(ansX, PY, pv.x, pv.y, 1.8 * PUNCH.k), punchEase);
      cam.key(22.55, 2.75, top(1.3, 452));
      // fix 5: under the thesis (two 92 px lines, glyphs end ~291) the phone top stays >= ~320;
      // as the thesis leaves and the context footnote (glyphs end ~192) rises, one slow glide brings
      // the phone up under it. Its top bezel stays below ~210 and Lisa's row (logical 835, the first
      // recipient tap) stays in frame: in this format the text box caps the zoom at ~1.33.
      cam.key(23.9, 2.0, top(1.32, 335));
      cam.key(25.85, 1.3, top(CLOSE.z, CLOSE.sy));
    }
    // fix 5: to rest in one slow pull-out that starts under the send tap (the house curve barely
    // moves the first 0.25 s, so the button is still at C.tapSend) and is still easing out while
    // act D's camera key (from T.D.sending[0]) blends in on top of it and its e-mail unfolds
    // (T.D.emailUnfold, 27.9): no whip, and never a small phone on an empty frame
    const tRest = C.tapSend - 0.2, dRest = 2.7;
    cam.key(tRest, dRest, rest);
  }

  // ---- caption 3 (overlay, screen space, in ctx.top so it does not drift) -----------------
  // The block is anchored at its bottom-left (CT.bottom): it grows up into the empty text box
  // and never reaches down over the phone. 16:9: tag / "…dan houden we" / "de Q4-deadline" /
  // "aan.", so the slot ends its line and the copy slides in from the right along it; "aan." keeps
  // its own line before, during and after the swap (fix 5: no reflow). 4:5: "SPREKER 3 · …dan
  // houden we" / "de Q4-deadline aan.", the copy comes up from under the slot.
  function mountCaption(ctx) {
    const L = ctx.L, BX = L.captions, c3 = COPY.captions[2];
    const S = Object.assign({}, CT);
    const oldTxt = "de " + c3.key;
    const i0 = c3.text.indexOf(oldTxt);
    const pre = c3.text.slice(0, i0).replace(/\s+$/, ""), post = c3.text.slice(i0 + oldTxt.length);
    const newTxt = COPY.q1.options[COPY.q1.pick];
    // Inter: ascender 0.969, content 1.211 em -> baseline from the top of a line box
    S.base = (S.lh - 1.211 * S.line) / 2 + 0.969 * S.line;
    cap.S = S; cap.BX = BX; cap.L = L;
    cap.layer = el("div", ctx.top, { left: "0px", top: "0px", width: L.W + "px", height: L.H + "px", visibility: "hidden" });
    cap.wrap = el("div", cap.layer, { left: BX.x + "px", bottom: L.H - S.bottom + "px", width: BX.w + "px", transformOrigin: "0% 100%", whiteSpace: "nowrap" });
    const tagStyle = { fontSize: S.tag + "px", lineHeight: "1.3", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: K.muted };
    const lineStyle = { fontSize: S.line + "px", lineHeight: S.lh + "px", fontWeight: 500, letterSpacing: "-0.012em", whiteSpace: "pre", color: K.ink };
    let l1;
    if (F45) {
      const r1 = Film.el("div", null, cap.wrap, { display: "flex", alignItems: "baseline", height: S.lh + "px" });
      cap.tag = Film.el("div", null, r1, tagStyle, c3.who);
      cap.dot = Film.el("div", null, r1, { fontSize: S.line + "px", lineHeight: S.lh + "px", fontWeight: 500, color: K.faint, padding: "0 0.3em" }, "·");
      l1 = Film.el("div", null, r1, lineStyle);
    } else {
      cap.tag = Film.el("div", null, cap.wrap, Object.assign({ marginBottom: "8px" }, tagStyle), c3.who);
      l1 = Film.el("div", null, cap.wrap, Object.assign({ height: S.lh + "px" }, lineStyle));
    }
    cap.l1 = Film.el("span", null, l1, null, pre);
    cap.line = Film.el("div", null, cap.wrap, Object.assign({ display: "flex", alignItems: "flex-start", height: S.lh + "px" }, lineStyle));
    cap.slot = Film.el("span", null, cap.line, { display: "block", position: "relative", height: S.lh + "px", flex: "0 0 auto" });
    // " aan.": its space and the word follow the slot on its line. In 16:9 the word is drawn on the
    // next line (translated) for the whole life of the caption; an empty line keeps the block's height.
    const postWord = post.replace(/^\s+/, "");
    Film.el("span", null, cap.line, { display: "block" }, post.slice(0, post.length - postWord.length));
    cap.post = Film.el("span", null, cap.line, { display: "block", position: "relative" }, postWord);
    if (!F45) Film.el("div", null, cap.wrap, { height: S.lh + "px" });
    // the old reference: "de " + "Q4-deadline" on a mint marker, struck through on the flip
    cap.old = Film.el("span", null, cap.slot, { position: "absolute", left: "0px", top: "0px", zIndex: 0, whiteSpace: "pre", height: S.lh + "px" });
    cap.old.appendChild(document.createTextNode("de "));
    cap.key = Film.el("span", null, cap.old, { position: "relative", display: "inline-block" });
    cap.keyMark = Film.el("span", null, cap.key, { position: "absolute", left: "-0.07em", right: "-0.07em", top: px((S.lh - 1.211 * S.line) / 2 + 0.12 * S.line), height: "0.95em", background: K.mint, borderRadius: "0.09em", zIndex: -1, transformOrigin: "0 50%", transform: "scaleX(0)" });
    cap.key.appendChild(document.createTextNode(c3.key));
    cap.strike = Film.el("span", null, cap.old, { position: "absolute", left: "-3px", right: "-3px", top: px(S.base - 0.31 * S.line - 1.5), height: F45 ? "2.5px" : "3px", borderRadius: "1.5px", background: K.ink, transformOrigin: "0 50%", transform: "scaleX(0)" });
    // width probe for the new words (same type)
    cap.probe = Film.el("span", null, cap.layer, Object.assign({ position: "absolute", left: "0px", top: "0px", visibility: "hidden" }, lineStyle), newTxt);
    // the copy that lifts out of the option row and becomes the new words of the caption
    cap.copy = el("div", cap.layer, Object.assign({ left: "0px", top: "0px", transformOrigin: "0 0", zIndex: 1, visibility: "hidden", color: K.mintInk }, lineStyle));
    cap.copyMark = Film.el("span", null, cap.copy, { position: "absolute", left: "-0.07em", right: "-0.07em", top: ((S.lh / S.line - 1.211) / 2 + 0.12).toFixed(4) + "em", height: "0.95em", background: K.mint, borderRadius: "0.09em", zIndex: -1 });
    Film.el("span", null, cap.copy, { position: "relative" }, newTxt);
  }

  // caption scale: caption size -> big from CAP.grow, back to caption size from CAP.settle
  function capScale(t, kBig) {
    const g = P(t, CAP.grow, CAP.growDur), s = P(t, CAP.settle, CAP.settleDur);
    return Math.exp(Math.log(kBig) * g * (1 - s));
  }
  // the phone's silhouette starts at logical x -PHONE_SIDE (bezel 14 + side buttons 3); in 4:5 the
  // copy keeps FRAME_PAD from the frame's left edge
  const PHONE_SIDE = 17, FRAME_PAD = 18;
  // eased progress of the sub-window [a, a + d] of the flight (fractions of CAP.fly)
  const flightSeg = (tau, a, d) => Eng.E.house(clamp((tau - a) / d));

  function renderCaption(t) {
    const on = t >= CAP.in - 0.01 && t < CAP.out + CAP.exit + 0.01;
    cap.layer.style.visibility = on ? "inherit" : "hidden";
    if (!on) return;
    const S = cap.S, BX = cap.BX;
    // in: the block rises with the options up; out: one block, up, blurred (like the overlay type)
    const iu = P(t, CAP.in, 0.5);
    const rise = (1 - iu) * (F45 ? 10 : 14);
    cap.wrap.style.opacity = clamp(iu * 1.5).toFixed(3);
    const H = cap.wrap.offsetHeight;
    // big size; guard: when the thesis's second line rises (T.O.climax.b) the settling caption
    // must already be under its line box (overlay-text: 96/92 px at text.y + 1.1 em, lh 1.02)
    let kBig = S.big / S.line;
    const eB = CAP.settles ? P(O.climax.b, CAP.grow, CAP.growDur) * (1 - P(O.climax.b, CAP.settle, CAP.settleDur)) : 0;
    if (eB > 0) {
      const cs = F45 ? 92 : 96, bBottom = cap.L.text.y + cs * 1.1 + cs * 1.02 + 12;
      const kMax = (S.bottom - bBottom) / H;
      kBig = kMax > 1 ? Math.min(kBig, Math.pow(kMax, 1 / eB)) : 1;
    }
    const k = capScale(t, kBig);
    cap.wrap.style.transform = `translate3d(0, ${rise.toFixed(2)}px, 0) scale(${k.toFixed(5)})`;
    // out as one block
    const ou = P(t, CAP.out, CAP.exit);
    cap.layer.style.opacity = (1 - ou).toFixed(3);
    cap.layer.style.transform = ou > 0 ? `translate3d(0, ${(-12 * ou).toFixed(2)}px, 0)` : "none";
    cap.layer.style.filter = ou > 0.001 ? `blur(${(4 * ou).toFixed(2)}px)` : "none";
    // from the settle on, only the speaker tag and the words around the answer dim under the
    // thesis; "12 december" and its marker keep their full colour (#12804B on #D6FBEB, 4.47:1)
    const dim = lerp(1, CAP.dimTo, P(t, CAP.settle, CAP.settleDur)).toFixed(3);
    [cap.tag, cap.dot, cap.l1, cap.post].forEach((e) => e && (e.style.opacity = dim));
    // the reference Griffel asks about: marker sweep, ink turns green behind its edge
    const mu = P(t, CAP.mark, 0.45);
    cap.keyMark.style.transform = `scaleX(${mu.toFixed(4)})`;
    cap.key.style.color = mixHex(K.ink, K.greenInk, mu);
    // flip: struck on the tap; the struck words fade out (0.1 s, no blur, no move) before the copy
    // reaches them, then the slot eases to the new words' width plus a small marker reserve
    cap.strike.style.transform = `scaleX(${P(t, CAP.strike, 0.14).toFixed(4)})`;
    const ox = P(t, CAP.oldOut - CAP.oldFade, CAP.oldFade);
    cap.old.style.opacity = (1 - ox).toFixed(3);
    cap.old.style.visibility = ox >= 1 ? "hidden" : "inherit";
    const wOld = cap.old.offsetWidth, wNew = cap.probe.offsetWidth;
    cap.slot.style.width = px(lerp(wOld, wNew + 0.1 * S.line, P(t, CAP.oldOut, CAP.land - CAP.oldOut)));
    // 16:9 (fix 5): one stable layout before, during and after the swap. "aan." keeps its own third
    // line at the left edge (the translate cancels the slot's width change exactly), so nothing
    // reflows: "...dan houden we" / "de Q4-deadline" -> "12 december" / "aan."
    if (!F45) cap.post.style.transform = `translate3d(${(-cap.post.offsetLeft).toFixed(2)}px, ${S.lh.toFixed(2)}px, 0)`;

    // the copy: from the selected option (tracked through the camera punch) into the slot; the
    // option keeps its own label (the copy lifts off it)
    const fly = t >= CAP.lift;
    cap.copy.style.visibility = fly ? "inherit" : "hidden";   // never outlives the hidden layer
    if (!fly) return;
    const tau = clamp((t - CAP.lift) / CAP.fly);
    const seg = (a, d) => flightSeg(tau, a, d);
    // type: it lifts off as the app's own 16 px line (same advances, so it sits exactly on the
    // option text) and lands as the caption's line; the app sets 0 tracking, the caption
    // -0.012em. The visual size is a separate scale, so the size change is smooth.
    const Pt = seg(0.1, 0.8);
    const F = lerp(16, S.line, Pt);
    cap.copy.style.fontSize = px(F);
    cap.copy.style.lineHeight = px((F * S.lh) / S.line);
    cap.copy.style.letterSpacing = (-0.012 * Pt).toFixed(4) + "em";
    const baseF = F * ((S.lh / S.line - 1.211) / 2 + 0.969);
    // start: the option text's left baseline, through the option's press squash and the camera
    const m = Film.phoneMotion.at(t);
    const baseIn = (20 - 1.211 * 16) / 2 + 0.969 * 16;           // option text baseline (logical)
    const sq = 0.015 * P(t, tA - 0.06, 0.06) * (1 - P(t, tA + 0.05, 0.3));
    const ocx = X0 + CW / 2, ocy = Q1L.opt[0] + 28;
    const p0 = Film.phoneToScreen(ocx + (X0 + 16 - ocx) * (1 - sq), ocy + (Q1L.opt[0] + 18 + baseIn - ocy) * (1 - sq), t);
    const V0 = 16 * p0.z * m.s * (1 - sq);                       // on-screen size of the option text
    // end: the slot's left baseline in the scaled block (anchored at its bottom-left)
    const A3 = { x: BX.x + cap.slot.offsetLeft * k, y: S.bottom - (H - cap.slot.offsetTop - S.base) * k + rise };
    const Vt = S.line * k;
    // route: out of the phone at the option row (over its own row's padding and the bezel), then
    // off the phone's silhouette (side buttons included) into the caption, never over the status
    // bar, the island, app text or the caption's other words. The copy grows along its arc (about
    // 1.7x in 16:9, 1.9x in 4:5): to g1 while it travels beside the phone (as much as the room
    // there allows), the rest as it comes into the slot, so it lands at the caption's size.
    const wEm = wNew / S.line + 0.3;                             // copy + its chip's right side, in em
    const edge = Film.phoneToScreen(-PHONE_SIDE, 426, t).x - 12; // the copy's right edge stays left of this
    let x, y, g1, a2;
    if (!F45) {
      // left along the option row, down beside the phone (right of line 1), then left into the slot
      const l1R = BX.x + (cap.l1.offsetLeft + cap.l1.offsetWidth) * k + 0.3 * V0 + 12;
      g1 = clamp((edge - l1R) / (wEm * V0), 1, 1.3);
      const xc = Math.max(l1R, edge - wEm * V0 * g1);
      x = p0.x + (xc - p0.x) * seg(0, 0.42) + (A3.x - xc) * seg(0.6, 0.4);
      y = p0.y + (A3.y - p0.y) * seg(0.3, 0.4);
      a2 = [0.58, 0.42];
    } else {
      // left along the option row out of the phone, straight up the margin, into the slot
      const room = edge - FRAME_PAD;                             // the margin left of the phone
      g1 = clamp(room / ((wEm + 0.3) * V0), 1, 1.3);
      const xm = Math.min(A3.x, FRAME_PAD + 0.3 * V0 * g1 + (room - (wEm + 0.3) * V0 * g1) / 2);
      x = p0.x + (xm - p0.x) * seg(0, 0.3) + (A3.x - xm) * seg(0.72, 0.28);
      y = p0.y + (A3.y - p0.y) * seg(0.2, 0.62);
      a2 = [0.66, 0.34];
    }
    const lnV = Math.log(V0) + Math.log(g1) * seg(0.05, a2[0] - 0.08) + Math.log(Vt / (V0 * g1)) * seg(a2[0], a2[1]);
    const V = t < CAP.land ? Math.exp(lnV) : Vt;
    const kc = V / F;
    cap.copy.style.left = px(x);
    cap.copy.style.top = px(y - baseF * kc);
    cap.copy.style.transform = `scale(${kc.toFixed(4)})`;
    cap.copy.style.color = mixHex(K.mintInk, K.greenInk, Pt);
    // the copy only shows once it has slid clear of the option's own label, so the two never
    // overlap into "12 december2 december" during the lift-off
    cap.copy.style.opacity = seg(0.1, 0.15).toFixed(3);
    // the copy travels on a mint chip cut from the selected row (same fill, so the lift-off is
    // seamless and the word never sits bare on what it passes); as it lands the chip tightens
    // into the caption's marker, the same marker "Q4-deadline" had
    const mk = P(t, CAP.land - 0.24, 0.32);
    const lbT = (S.lh / S.line - 1.211) / 2;                        // line-box top -> content top (em)
    cap.copyMark.style.left = cap.copyMark.style.right = lerp(-0.3, -0.07, mk).toFixed(4) + "em";
    cap.copyMark.style.top = (lbT + lerp(-0.22, 0.12, mk)).toFixed(4) + "em";
    cap.copyMark.style.height = lerp(1.211 + 0.44, 0.95, mk).toFixed(4) + "em";
    cap.copyMark.style.borderRadius = lerp(0.3, 0.09, mk).toFixed(4) + "em";
    cap.copyMark.style.opacity = "1";   // opaque from the lift: it hides the label it lifts off (no double word)
  }

  Film.register({
    id: "act-c",
    order: 30,
    mount(ctx) {
      // push + taps + camera, all from T.C. The tapped banner leaves at once: pushes.js exits on a
      // slow-start curve, so the exit is scheduled 0.15 s before the tap (it starts moving after it).
      const pt = C.pushQuestions[0];
      Film.push({ t: pt, dur: C.tapPush - 0.15 - pt, title: COPY.push.questions.title, body: COPY.push.questions.body, tapAt: C.tapPush });
      Film.tap({ t: C.tapPush, x: 196.5, y: 100 });
      Film.tap({ t: C.tapAnswer, x: 196.5, y: Q1L.opt[0] + 28 });
      Film.tap({ t: C.tapQ2, x: 196.5, y: Q2L.opt[0] + 28 });
      // the context tap lands on the unscrolled page (the button is in view at 671..707)
      Film.tap({ t: C.tapContext, x: X0 + 20 + ADD_W / 2, y: RV.card + CD.btns + 18 });
      const rowX = X0 + 20 - 8 + (IW - 24) / 2;      // centre of the contact row's Pressable
      tTap.forEach((tt, i) => Film.tap({ t: tt, x: rowX, y: RV.card + CD.rows + FILE_GROW + rowOf[i] * ROW_H + ROW_H / 2 - SCROLL }));
      const belowEnd = FILE_GROW + CHIP_ROW - 3 * ROW_H - SEC_TAIL;
      Film.tap({ t: C.tapSend, x: 196.5, y: SEND_Y0 + belowEnd - SCROLL + 22 });
      registerCamera();

      // screen: opaque under the status bar from its first frame (act B keeps its own until 17.2)
      scr = el("div", ctx.phone.screen, { left: "0px", top: "0px", width: "393px", height: "852px", zIndex: 24, overflow: "hidden", visibility: "hidden" });
      const view = el("div", scr, { left: "0px", top: VIEW_TOP + "px", width: "393px", height: 852 - VIEW_TOP + "px", overflow: "hidden" });
      content = el("div", view, { left: "0px", top: -VIEW_TOP + "px", width: "393px", height: "1300px" });
      el("div", content, { left: "0px", top: "0px", width: "393px", height: BODY_TOP + "px", background: "#ffffff" });

      // top row: back + subject (same place as act B's working stage: it never moves)
      const back = el("div", content, { left: X0 + "px", top: Y.top + "px", width: "36px", height: "36px", borderRadius: "50%", boxShadow: `inset 0 0 0 1px ${K.border}` });
      const bi = el("div", back, { left: "10px", top: "10px" });
      bi.innerHTML = svg("arrowLeft", 16, K.ink, 2);
      el("div", content, { left: X0 + 48 + "px", top: Y.top + "px", height: "36px", lineHeight: "36px", fontSize: "14px", fontWeight: 600, color: K.ink, whiteSpace: "nowrap" }, COPY.meeting.subject);

      // body: step indicator + pages, on an opaque panel. The tap on the push pushes it in from the
      // right over act B's working stage (which stays put under a dim sheet: it is act B's); it
      // sits in a static clip that starts under the top row, so the top row never moves.
      shellDim = el("div", content, { left: "0px", top: BODY_TOP + "px", width: "393px", height: 1300 - BODY_TOP + "px", background: "#000000", opacity: 0 });
      const bodyClip = el("div", content, { left: "0px", top: BODY_TOP + "px", width: "393px", height: 1300 - BODY_TOP + "px", overflow: "hidden" });
      body = el("div", bodyClip, { left: "0px", top: -BODY_TOP + "px", width: "393px", height: "1300px" });
      el("div", body, { left: "0px", top: BODY_TOP + "px", width: "393px", height: 1300 - BODY_TOP + "px", background: "#ffffff" });

      // step indicator: "Stap x van 3 · Vragen" + progress
      const parts = A.questionsStep(1, 3).split(" ");   // ["Stap","1","van","3"]
      stepLbl = el("div", body, { left: X0 + "px", top: Y.step + "px", height: "16px", fontSize: "12px", lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: K.muted, whiteSpace: "nowrap" });
      stepLbl.appendChild(document.createTextNode(parts[0] + " "));
      stepDigit = roller(stepLbl, ["1", "2", "3"], [tAdv1 + 0.05, tAdv2 + 0.05]);
      stepLbl.appendChild(document.createTextNode(" " + parts[2] + " " + parts[3] + " · "));
      stepSect = roller(stepLbl, [A.questionsLabel, NL.stepReview], [tAdv2 + 0.05]);
      stepDigit.mask.style.fontVariantNumeric = "tabular-nums";
      barTrack = el("div", body, { left: X0 + "px", top: Y.bar + "px", width: CW + "px", height: "6px", borderRadius: "3px", background: K.track, overflow: "hidden" });
      barFill = el("div", barTrack, { left: "0px", top: "0px", width: CW + "px", height: "6px", borderRadius: "3px", background: K.ink, transformOrigin: "0 50%" });

      // pages: a static clip from under the progress bar; each page is opaque and is pushed in
      // from the right over the one before it
      const pagesClip = el("div", body, { left: "0px", top: PAGE_TOP + "px", width: "393px", height: 1300 - PAGE_TOP + "px", overflow: "hidden" });
      const pages = el("div", pagesClip, { left: "0px", top: -PAGE_TOP + "px", width: "393px", height: "1300px" });
      Object.assign(q1, buildQuestionPage(pages, Q1L, Q1_WORDS, COPY.q1.options));
      const q2Words = COPY.q2.text.split(/\s+/).map((w) => ({ w }));
      Object.assign(q2, buildQuestionPage(pages, Q2L, q2Words, COPY.q2.options));

      // review step: hero + answered card + NotesSetupCard + send button + Terug
      rv.pg = el("div", pages, { left: "0px", top: "0px", width: "393px", height: "1300px" });
      el("div", rv.pg, { left: "0px", top: PAGE_TOP + "px", width: "393px", height: 1300 - PAGE_TOP + "px", background: "#ffffff" });
      const ri = el("div", rv.pg, { left: X0 + "px", top: "0px", width: CW + "px", height: "1300px" });
      rv.tile = el("div", ri, { left: CW / 2 - 32 + "px", top: RV.tile + "px", width: "64px", height: "64px", borderRadius: "10px", background: K.mint });
      const ti = el("div", rv.tile, { left: "19px", top: "19px" });
      ti.innerHTML = svg("send", 26, K.mintInk, 2);
      el("div", ri, { left: "0px", top: RV.title + "px", width: CW + "px", textAlign: "center", fontSize: "24px", lineHeight: "32px", fontWeight: 700, letterSpacing: "-0.025em", color: K.ink }, A.readyToSend);
      el("div", ri, { left: "16px", top: RV.desc + "px", width: CW - 32 + "px", textAlign: "center", fontSize: "14px", lineHeight: "20px", color: K.muted }, NL.reviewDesc);

      // answered card (Card rounded-lg, CardContent px-5 py-4): "VRAGEN" / "2 van 2 beantwoord" + Wijzigen
      const ans = el("div", ri, { left: "0px", top: RV.ans + "px", width: CW + "px", height: "70px", borderRadius: "10px", background: K.card, boxShadow: `inset 0 0 0 1px ${K.border}` });
      label12(ans, 20, 16, A.questionsLabel, 200);
      const nQ = 2;
      el("div", ans, { left: "20px", top: "34px", fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: K.ink, whiteSpace: "nowrap" }, NL.answered.replace("{count}", nQ).replace("{total}", nQ));
      el("div", ans, { right: "20px", top: "25px", fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: K.ink, textDecoration: "underline", textUnderlineOffset: "2px", whiteSpace: "nowrap" }, NL.edit);

      rv.card = el("div", ri, { left: "0px", top: RV.card + "px", width: CW + "px", height: CD.h + "px", borderRadius: "10px", background: K.card, boxShadow: `inset 0 0 0 1px ${K.border}`, overflow: "hidden" });
      label12(rv.card, 20, CD.subjL, NL.subjectLabel, IW);
      const subj = el("div", rv.card, { left: "20px", top: CD.subj + "px", width: IW + "px", height: "40px", borderRadius: "10px", boxShadow: `inset 0 0 0 1px ${K.border}` });
      el("div", subj, { left: "12px", top: "0px", lineHeight: "40px", fontSize: "16px", color: K.ink, whiteSpace: "nowrap" }, COPY.meeting.subject);

      label12(rv.card, 20, CD.ctxL, A.context, IW);
      el("div", rv.card, { left: "20px", top: CD.ctxDesc + "px", width: IW + "px", fontSize: "12px", lineHeight: "16px", color: K.muted }, NL.contextDesc);
      // file row (appears after the tap) in a clip that opens with the layout
      rv.fileClip = el("div", rv.card, { left: "20px", top: CD.file + "px", width: IW + "px", height: "0px", overflow: "hidden" });
      rv.file = el("div", rv.fileClip, { left: "0px", top: "0px", width: IW + "px", height: "56px" });
      rv.fileIc = el("div", rv.file, { left: "0px", top: "14px", width: "28px", height: "28px", borderRadius: "50%", background: K.surfaceMuted });
      const fi = el("div", rv.fileIc, { left: "7px", top: "7px" });
      fi.innerHTML = svg("fileText", 14, K.muted, 2);
      el("div", rv.file, { left: "40px", top: "10px", fontSize: "14px", lineHeight: "20px", color: K.ink, whiteSpace: "nowrap" }, COPY.meeting.contextFile);
      el("div", rv.file, { left: "40px", top: "30px", fontSize: "12px", lineHeight: "16px", color: K.muted, whiteSpace: "nowrap" }, NL.fileSize);
      const fx = el("div", rv.file, { left: IW - 32 + "px", top: "12px", width: "32px", height: "32px" });
      const fxi = el("div", fx, { left: "8px", top: "8px" });
      fxi.innerHTML = svg("x", 16, K.muted, 2);
      // buttons row: outline "Bestand toevoegen" + ghost "Tekst plakken"
      rv.btns = el("div", rv.card, { left: "20px", top: CD.btns + "px", width: IW + "px", height: "36px" });
      rv.add = el("div", rv.btns, { left: "0px", top: "0px", width: ADD_W + "px", height: "36px", borderRadius: "10px", boxShadow: `inset 0 0 0 1px ${K.border}`, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "14px", fontWeight: 500, color: K.ink, whiteSpace: "nowrap" });
      rv.addFill = el("div", rv.add, { left: "0px", top: "0px", width: ADD_W + "px", height: "36px", borderRadius: "10px", background: K.mint, opacity: 0 });
      const ai = Film.el("span", null, rv.add, { position: "relative", display: "block" });
      ai.innerHTML = svg("paperclip", 14, K.ink, 2);
      Film.el("span", null, rv.add, { position: "relative" }, NL.addFile);
      el("div", rv.btns, { left: ADD_W + 8 + "px", top: "0px", height: "36px", lineHeight: "36px", padding: "0 12px", fontSize: "14px", fontWeight: 500, color: K.ink, whiteSpace: "nowrap" }, NL.pasteToggle);

      // recipients: self chip (always) + one mint chip per chosen contact
      rv.recL = label12(rv.card, 20, CD.recL, A.whoGetsNotes, IW);
      rv.chips = el("div", rv.card, { left: "20px", top: CD.chips + "px", width: IW + "px", display: "flex", flexWrap: "wrap", gap: "8px" });
      const self = Film.el("div", null, rv.chips, { display: "flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 12px", borderRadius: "14px", background: K.surfaceMuted, fontSize: "12px", fontWeight: 500, color: K.muted, whiteSpace: "nowrap" });
      const li = Film.el("span", null, self, { display: "block" });
      li.innerHTML = svg("lock", 12, K.muted, 2);
      Film.el("span", null, self, null, A.selfChip);
      rv.names = COPY.meeting.names.map((n) => {
        const c = Film.el("div", null, rv.chips, { display: "flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 8px 0 12px", borderRadius: "14px", background: K.mint, fontSize: "12px", fontWeight: 500, color: K.mintInk, whiteSpace: "nowrap", transformOrigin: "30% 50%", opacity: 0 });
        Film.el("span", null, c, null, n);
        const xi = Film.el("span", null, c, { display: "block" });
        xi.innerHTML = svg("x", 12, K.mintInk, 2);
        return c;
      });
      // "Eerder gebruikt": previous contacts; a tap adds the chip and the row closes (height)
      rv.prevL = label12(rv.card, 20, CD.prevL, NL.previous, IW);
      rv.rows = COPY.meeting.names.map((n, i) => {
        const r = rowOf[i];
        // the clip is 8 px wider on the left, for the pressed highlight (-mx-2)
        const row = el("div", rv.card, { left: "12px", top: CD.rows + r * ROW_H + "px", width: IW + 8 + "px", height: ROW_H + "px", overflow: "hidden" });
        const press = el("div", row, { left: "0px", top: "0px", width: IW - 24 + "px", height: ROW_H + "px", borderRadius: "10px", background: K.mint, opacity: 0 });
        const inner = el("div", row, { left: "8px", top: "0px", width: IW + "px", height: ROW_H + "px" });
        if (r > 0) el("div", inner, { left: "0px", top: "0px", width: IW + "px", height: "1px", background: K.border60 });
        const circ = el("div", inner, { left: "0px", top: "10px", width: "28px", height: "28px", borderRadius: "50%", background: K.surfaceMuted });
        const pi = el("div", circ, { left: "7px", top: "7px" });
        pi.innerHTML = svg("plus", 14, K.muted, 2);
        el("div", inner, { left: "40px", top: "14px", fontSize: "14px", lineHeight: "20px", color: K.ink, whiteSpace: "nowrap" }, n);
        const rx = el("div", inner, { left: IW - 32 + "px", top: "8px", width: "32px", height: "32px" });
        const rxi = el("div", rx, { left: "8px", top: "8px" });
        rxi.innerHTML = svg("x", 16, K.muted, 2);
        return { row, press, inner, r };
      });

      // send button (size lg, solid ink) + "Terug"
      rv.send = el("div", ri, { left: "0px", top: SEND_Y0 + "px", width: CW + "px", height: "44px", borderRadius: "10px", background: K.ink, overflow: "hidden" });
      rv.sendTxt = el("div", rv.send, { left: "0px", top: "0px", width: CW + "px", height: "44px", lineHeight: "44px", textAlign: "center", fontSize: "14px", fontWeight: 500, color: K.onInk }, A.sendNotes);
      rv.busy = el("div", rv.send, { left: "0px", top: "0px", width: CW + "px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: 500, color: K.onInk, opacity: 0 });
      rv.spin = Film.el("span", null, rv.busy, { display: "block", width: "16px", height: "16px" });
      let spokes = "";
      for (let i = 0; i < 8; i++) {
        const a = (i * 45 * Math.PI) / 180;
        const x1 = 8 + Math.sin(a) * 3.6, y1 = 8 - Math.cos(a) * 3.6, x2 = 8 + Math.sin(a) * 7, y2 = 8 - Math.cos(a) * 7;
        spokes += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${K.onInk}" stroke-width="1.9" stroke-linecap="round" opacity="${(0.25 + (0.75 * i) / 7).toFixed(2)}"/>`;
      }
      rv.spin.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" style="display:block">${spokes}</svg>`;
      Film.el("span", null, rv.busy, null, NL.sendingBtn);
      rv.back = backLink(ri, SEND_Y0 + 52);

      mountCaption(ctx);
    },

    render(t, ctx) {
      renderCaption(t);
      const on = t >= tShell && t < tScreenOff;
      scr.style.visibility = on ? "inherit" : "hidden";
      if (!on) return;

      // ScrollView: one scroll, after the file row has landed, up to the recipients
      const S = SCROLL * P(t, tScroll, dScroll);
      content.style.transform = `translate3d(0, ${(-S).toFixed(2)}px, 0)`;

      // shell push: the tap on the push opens the wizard; its body is pushed in from the right over
      // act B's working stage, which dims (the top row is the same in both and stays put)
      body.style.transform = `translate3d(${pushInX(t, tShell).toFixed(2)}px, 0, 0)`;
      const shellOn = t < tShell + PUSH.dur + 0.02;
      shellDim.style.visibility = shellOn ? "inherit" : "hidden";
      shellDim.style.opacity = pushDim(t, tShell).toFixed(3);

      // step indicator: static through the page covers; digit and section roll
      renderRoller(stepDigit, t);
      renderRoller(stepSect, t);
      const prog = (1 / 3) * P(t, tShell + 0.15, 0.6) + (1 / 3) * P(t, tAdv1 + 0.05, 0.6) + (1 / 3) * P(t, tAdv2 + 0.05, 0.6);
      barFill.style.transform = `scaleX(${prog.toFixed(4)})`;

      // ---- Q1 (pushed out by Q2: it moves -30 % and dims; the selected row keeps its label) -----
      const q1on = t < tCov1 + PUSH.dur + 0.02;
      q1.pg.style.visibility = q1on ? "inherit" : "hidden";
      if (q1on) {
        q1.pg.style.transform = `translate3d(${pushOutX(t, tCov1).toFixed(2)}px, 0, 0)`;
        q1.dim.style.opacity = pushDim(t, tCov1).toFixed(3);
        q1.ws.forEach((w) => renderWord(w, t, w.o.t));
        const [o1, o2, o3] = C.q1Options;
        fadeRise(q1.desc, t, o1 - 0.2, 0.5, 8);
        renderOption(q1.op[0], t, o1, C.tapAnswer);
        renderOption(q1.op[1], t, o2, 0);
        renderOption(q1.op[2], t, o3, 0);
        fadeRise(q1.freeL, t, C.q1Skip - 0.15, 0.5, 10);
        fadeRise(q1.free, t, C.q1Skip - 0.15, 0.5, 10);
        fadeRise(q1.skip, t, C.q1Skip, 0.5, 10);
      }

      // ---- Q2: a complete, opaque page pushed in over Q1, then pushed out by the review -------
      const q2on = t >= tCov1 && t < tCov2 + PUSH.dur + 0.02;
      q2.pg.style.visibility = q2on ? "inherit" : "hidden";
      if (q2on) {
        q2.pg.style.transform = `translate3d(${(pushInX(t, tCov1) + pushOutX(t, tCov2)).toFixed(2)}px, 0, 0)`;
        q2.dim.style.opacity = pushDim(t, tCov2).toFixed(3);
        q2.op.forEach((o, i) => renderOption(o, t, -1, i === COPY.q2.pick ? C.tapQ2 : 0));
      }

      // ---- review: "Klaar om te versturen", complete and opaque; act D covers it --------------
      const rvon = t >= tCov2;
      rv.pg.style.visibility = rvon ? "inherit" : "hidden";
      if (!rvon) return;
      rv.pg.style.transform = `translate3d(${pushInX(t, tCov2).toFixed(2)}px, 0, 0)`;
      // Context: tap "Bestand toevoegen" -> file row lands, content below makes room
      const press = P(t, C.tapContext - 0.06, 0.06) * (1 - P(t, C.tapContext + 0.08, 0.25));
      rv.addFill.style.opacity = (press * 0.9).toFixed(3);                      // active:bg-accent
      rv.add.style.transform = `scale(${(1 - 0.03 * press).toFixed(4)})`;
      const g = P(t, C.contextFile, dFile);                                      // layout grows
      const f = P(t, C.contextFile + 0.03, dFile + 0.05);                        // row lands
      const dy = FILE_GROW * g;
      rv.fileClip.style.height = clamp(dy - 12, 0, 56).toFixed(2) + "px";
      rv.file.style.opacity = clamp(f * 1.6 - 0.2).toFixed(3);
      rv.file.style.transform = `translate3d(0, ${((1 - f) * -10).toFixed(2)}px, 0)`;
      rv.fileIc.style.transform = `scale(${(0.6 + 0.4 * f).toFixed(4)})`;
      rv.btns.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0)`;
      rv.recL.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0)`;
      rv.chips.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0)`;
      // recipients: a tap presses the row, its content goes, the row closes over 0.35 s (house)
      // and the chip pops in as it closes
      const wrap = P(t, tPop[2] - 0.02, 0.36);                                   // last chip wraps
      const cut = tTap.map((tt) => P(t, tt + 0.04, 0.35));
      const gone = tTap.map((tt) => P(t, tt + 0.04, 0.14));
      const listY = dy + CHIP_ROW * wrap;
      rv.prevL.style.transform = `translate3d(0, ${listY.toFixed(2)}px, 0)`;
      rv.prevL.style.opacity = (1 - P(t, tTap[2] + 0.04, 0.14)).toFixed(3);
      const idxAt = []; rowOf.forEach((r, i) => (idxAt[r] = i));
      let yAcc = CD.rows;
      for (let r = 0; r < idxAt.length; r++) {
        const i = idxAt[r], o = rv.rows[i];
        const h = ROW_H * (1 - cut[i]);
        o.row.style.top = yAcc.toFixed(2) + "px";
        o.row.style.height = h.toFixed(2) + "px";
        o.row.style.transform = `translate3d(0, ${listY.toFixed(2)}px, 0)`;
        o.row.style.visibility = cut[i] >= 1 ? "hidden" : "visible";
        o.inner.style.opacity = (1 - gone[i]).toFixed(3);
        o.press.style.opacity = (P(t, tTap[i] - 0.06, 0.06) * (1 - P(t, tTap[i] + 0.04, 0.3))).toFixed(3);
        yAcc += h;
      }
      rv.names.forEach((c, i) => {
        const t0 = tPop[i];
        const s = spring(t - t0, 3.2, 0.92);
        c.style.opacity = clamp((t - t0) / 0.14).toFixed(3);
        c.style.transform = `scale(${(0.55 + 0.45 * s).toFixed(4)})`;
      });
      const below = dy + CHIP_ROW * wrap - ROW_H * (cut[0] + cut[1] + cut[2]) - SEC_TAIL * cut[2];
      rv.card.style.height = (CD.h + below).toFixed(2) + "px";
      // send button: follows the layout, pressed at tapSend, then the busy state
      const sp = P(t, C.tapSend - 0.06, 0.06) * (1 - P(t, C.tapSend + 0.1, 0.25));
      rv.send.style.transform = `translate3d(0, ${below.toFixed(2)}px, 0) scale(${(1 - 0.02 * sp).toFixed(4)})`;
      rv.send.style.background = sp > 0 ? mixHex(K.ink, "#2b2c30", sp) : K.ink;   // active:bg-primary/90
      rv.back.style.transform = `translate3d(0, ${below.toFixed(2)}px, 0)`;
      const busy = P(t, tSendBusy, 0.2);
      rv.sendTxt.style.opacity = (1 - clamp(busy * 1.6)).toFixed(3);
      rv.sendTxt.style.transform = `translate3d(0, ${(-busy * 14).toFixed(2)}px, 0)`;
      rv.busy.style.opacity = clamp(busy * 1.4 - 0.2).toFixed(3);
      rv.busy.style.transform = `translate3d(0, ${((1 - busy) * 14).toFixed(2)}px, 0)`;
      // iOS activity indicator: 8 spokes stepping at 12 fps
      rv.spin.style.transform = `rotate(${(Math.floor(t * 12) * 45) % 360}deg)`;
    },
  });
})();
