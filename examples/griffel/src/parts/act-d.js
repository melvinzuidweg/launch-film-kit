/*
 * Act D: Notulen + trust (27.6 - 38.0). Spec: docs/storyboard.md, times: T.D in src/timeline.js.
 *
 *   27.6  phone: meeting screen, stage "Notulen onderweg" (StageHero, MailOpen on a mint tile,
 *         ProcessingSteps with Notulen -> Verzonden). It slides up 32 px over act C's review
 *         screen and fades in over 0.14 s (under act C's send whip: no one-frame swap); the status
 *         bar stays put. A soft light sweep = time jump. The camera's first key starts at 27.6,
 *         inside the whip, so the two blend and the camera never stops at 28.0.
 *   27.9  (T.D.emailUnfold, fix 5: during act C's slow pull-out, so 27.6-28.2 is never a small
 *         phone on an empty stage) a page lifts out of the empty lower part of the phone screen and
 *         unfolds into the 600 px notulen e-mail (rebuilt from packages/emails summary-email.tsx +
 *         components.tsx + theme.ts). It is opaque and complete from its first frame and grows up
 *         over the opaque stage: no cross-fade, no white dip. The camera never pulls out past act
 *         C's rest framing and keeps moving into the payoff push (no stop between the two keys).
 *         16:9: the page slides left out of the phone while the camera puts the phone at the
 *         right, then the phone steps out to the right (29.15-30.7); 4:5: the phone slides down
 *         and out (27.98-30.1). Fix 5: through the payoff the phone is parked fully out of frame
 *         (never half cut, never "Notulen onderweg" next to the open e-mail); it comes back for
 *         the inbox (16:9 from 32.2, 4:5 from 32.45), showing "Verstuurd" from the first tick.
 *   30.1  PAYOFF: ACTIES row 1 lifts out of the e-mail as a large world line, left-aligned over
 *         two lines, the date on its own line (so no "·"): "Lisa stuurt de offerte naar de klant" /
 *         "12 december" (66 px in 16:9, 56 px in 4:5; the date re-forms under the line while the
 *         e-mail's own date fades), while the e-mail recedes and dims behind it (to 6 % under the
 *         line's band, 18 % elsewhere). Markers on "Lisa" and "12 december" are complete by 31.0;
 *         the line holds (a camera creep from 30.5, fix 5: already moving when the line has landed,
 *         still past its peak speed when the fan-out takes over) to 32.6, alone in the frame.
 *   32.6  fan-out: the camera eases out; Lisa's row forms around the line (a card hugging it that
 *         shrinks with it, on one curve, to her inbox slot), so the line docks as content from the
 *         opened mail: under her subject and preheader, a hairline and, indented behind a vertical
 *         rule, the mail's "ACTIES · 3" label and ACTIES row 1 (number badge, markers kept). As it
 *         lands, the bold line morphs word by word into the mail's body styling. The e-mail card
 *         folds into Daan's row; its content leaves once the fold is under way and Daan's row face
 *         rides the bottom of the folding card, so the card is never an empty slab; Sanne's row is
 *         dealt out from under it. Every row shows the real subject and the preheader's first
 *         sentence ("Meeting-notulen, met jou gedeeld.", fix 5: never cut mid-word), with its inbox
 *         owner's first name (Lisa / Daan / Sanne) in ink outside the card; Lisa's row is the
 *         largest and highlighted. The phone switches to "Verstuurd" on the first tick (opaque
 *         cover). No "verstuurd" push.
 *   33.3  the inbox drifts (16:9 toward the trust framing; 4:5, fix 5: a 4 % pull-back with a
 *         12 px rise, so the read until the rows leave is never a frozen frame).
 *   35.0  rows (and the docked line) leave with the ch3 sub (T.O.ch3.subOut).
 *         16:9: the camera drifts on to the trust framing without a zoom-out/push-in: the
 *         "Verstuurd" hero plus three large world chips (Opname / Transcriptie / Vragen) stacked
 *         left of the top of the phone; at 36.4 one 1.6 s move onto act E's opening framing
 *         (Film.handoff("DE")), out of the trust drift. The left bezel stays right of x 1000.
 *         4:5 (fix 4): ONE move from 35.0 onto Film.handoff("DE") at 38.0; the phone rises back to
 *         its base on the same house curve, and the chips ride 34 px above it in one row. Its top
 *         stays below y ~430 while the trust lines are up (429 at 37.4, 423 as they leave).
 *         The chips dissolve on T.D.wipe (strike, then fade with blur, 6 px drop).
 *
 * Every peak on-screen speed in this act is <= 25 px per frame at 60 fps.
 *
 * Phone screen z-index: 35 (act C sits below, act E above). Pure function of t.
 */
(function () {
  "use strict";
  const { Film, Eng, COPY: C, T } = window;
  const { P, clamp, lerp, mixHex, spring, zoomLerp } = Eng;
  const D = T.D;
  const IS45 = Film.format === "45";
  const el = Film.el;
  const SCREEN_Z = 35;
  const LAY = Film.L, SW = LAY.W, SH = LAY.H;

  // app tokens (griffel-app apps/mobile/global.css light) + e-mail theme
  const K = {
    ink: "#131417", body: "#3F454D", muted: "#6B7280", faint: "#9AA1A9", hair: "#E8EAED",
    mint: "#09FE94", mintTint: "#D6FBEB", mintInk: "#00301B", privacyBg: "#F6F8F7",
    successBg: "#E5F8DD", success: "#29513B", brand: "#1ABA6D", greenInk: "#12804B",
  };

  // Section titles of the real Dutch summary e-mail (griffel-app packages/emails/src/
  // summary-email.tsx, getSummaryEmailCopy "nl"), verbatim. copy.js has no field for them.
  const EM = Object.assign({ besproken: "Besproken", acties: "Acties", besluiten: "Besluiten" }, C.email.labels || {});

  // The i-dot of the wordmark, in logo-wordmark.svg coordinates (same path as act E's IDOT).
  // MARK.wordmark has no dot: without it the header would read "Grıffel".
  const IDOT = "M295.75,218.43a8.54,8.54,0,0,1-2.64,6.23,8.7,8.7,0,0,1-6.36,2.64,9,9,0,0,1-8.88-8.87,8.71,8.71,0,0,1,2.65-6.3,8.47,8.47,0,0,1,6.23-2.7,9.12,9.12,0,0,1,9,9Z";

  // ---- lucide icons (24 grid, round caps) -------------------------------------------------
  const LU = {
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    mailOpen: '<path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>',
    checkCircle2: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    loader2: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    msgQuestion: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  };
  const svg = (name, size, color, sw = 1.75) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${LU[name]}</svg>`;

  // ---- timing: anchors from T.D / T.O, the rest is local choreography ----------------------
  // (times in the comments are for the current T; every one is derived from T.D / T.O / T.E)
  const tIn = D.sending[0];                    // 27.6  sending stage slides in over act C
  const dSlide = 0.45, SLIDE = 32;             // stage swaps: opaque, 32 px rise on the house curve
  const [tUnfold, dUnfold] = D.emailUnfold;    // 27.9 / 1.2
  // "Notulen" checks (and "Verzonden" starts) just before the page lifts out of the phone
  const tNotulenDone = Math.min(tIn + 0.55, tUnfold - 0.05);
  const tLift = D.zoomAction[0];               // 30.1  the action line lifts out of the e-mail
  const tHlDone = D.holdAction[0];             // 31.0  both markers complete
  const dLift = D.zoomAction[1];               // 1.0   at full size by 31.1 (markers done by 31.0)
  const tHlWho = tHlDone - 0.52, tHlWhen = tHlDone - 0.4; // marker sweeps (0.4 s), done by 31.0
  const tCamHold = tLift - 0.4;                // 29.7  camera onto the hero framing (1.0 s)
  // the first camera key (from inside act C's pull-out) lands after the hold key has started, so
  // the camera never comes to a stop between the unfold and the payoff push (no lull). 4:5: the
  // phone has left the frame by ~29.5, so the hold push starts as the unfold completes (29.1) and
  // runs slowly onto the hold framing (landed 30.7, as in 16:9): the open e-mail never sits still
  const tHoldPush = IS45 ? Math.min(tUnfold + dUnfold, tCamHold) : tCamHold;   // 29.1 / 29.7
  const dHoldPush = tCamHold + 1.0 - tHoldPush;                                 // 1.6 / 1.0
  const tCamU = IS45 ? tHoldPush + 0.5 : Math.max(tUnfold + dUnfold + 0.5, tCamHold + 0.3); // 29.6 / 30.0
  const tFan = D.fanOut[0];                    // 32.6  hold ends: fan-out
  // fix 5: the phone is parked fully out of frame while the payoff owns the frame (never half cut,
  // never "Notulen onderweg" next to the open e-mail). It steps out once the page has left it
  // (16:9 to the right, 4:5 down, one move from the unfold) and is >= 98 % out by tLift + 0.3,
  // when "Notulen." has gone; it comes back for the inbox, before the first tick
  const tPhOut = IS45 ? tUnfold + 0.08 : Math.min(tUnfold + dUnfold + 0.05, tLift - 0.95); // 27.98 / 29.15
  let dPhOut = Math.max(1.5, tLift + 0.6 - tPhOut);                                        // 16:9: 1.55 (set for 4:5 below)
  const tPhBack = tFan - (IS45 ? 0.15 : 0.4), dPhBack = IS45 ? 1.2 : 1.8;                   // 32.45 / 32.2
  const dFanCam = 1.2;                         // fan-out camera (starts 0.15 s early: no stop)
  const ticks = D.inboxTicks;                  // L / D / S rows land (soft ticks)
  const dFly = 1.3;                            // line -> its slot in Lisa's row (<= 25 px/f at the far end)
  const tFlyEnd = tFan + dFly;                 // 33.9 docked
  // fix 4: the card is already folding (tCol) when its content goes; the content stays until the
  // fold is well under way and Daan's row face comes in as the rect settles, so the card is never
  // an empty white slab (gap between the two ~0.1 s; Lisa's card, above, covers the face's top
  // lines until it has passed)
  const tBodyOut = tFan + 0.15, dBodyOut = 0.22; // e-mail content out 32.75-32.97 (cropped by the fold)
  const tFaceIn = tFan + 0.28;                 // Daan's row face 32.88-33.13, as the rect settles
  const dFaceIn = 0.25;
  const tCol = tFan;                           // e-mail folds into row 2 (second recipient)
  const dCol = Math.max(0.8, ticks[1] + 0.12 - tCol); // 0.8 (<= 25 px/f), around the 33.2 tick
  const tDoneSwap = ticks[0];                  // phone stage -> "Verstuurd" (opaque cover)
  const tSentCheck = tDoneSwap - 0.15;         // "Verzonden" checks just before
  const O3 = T.O.ch3 || {};
  const tRowsOut = O3.subOut || ticks[2] + 1.2; // 35.0 rows (and the docked line) leave with the ch3 sub
  const dRowsOut = 0.3;
  const wipe = D.wipe;                         // 35.7 / 36.05 / 36.4
  const tChipsIn = Math.max(tRowsOut + 0.25, wipe[0] - 0.6);   // after the rows, before the first wipe
  const HO = T.handoff && T.handoff.DE;
  const tHO = HO && Number.isFinite(HO.t) ? HO.t : D.end;   // 38.0  act E starts from this framing
  const tHand = tHO - 1.6;                     // 36.4  one move onto act E's opening framing
  // act E covers our screen with white at T.handoff.DE.t and fades the whole phone screen at its
  // collapse; ours stays (opaque, unchanged) until that fade is done
  const tOut = (T.E.collapse ? T.E.collapse[0] : T.E.start + 2) + 0.6;

  // ---- geometry -----------------------------------------------------------------------------
  const EW = 600, EH = 792;                    // e-mail card, components.tsx spacing at 1:1
  // the page lifts out of the empty lower part of the "Notulen onderweg" stage (under the steps
  // card, which ends at 609) and grows up over it: opaque from its first frame, so the stage is
  // never washed out (no fade-through-white)
  const LIFT_TOP = 618, LIFT_H = 852 - LIFT_TOP;
  const ROW1 = { pMid: 359, pLeft: 70 };       // ACTIES row 1 text (left, line centre), card-local
  const RECEDE = 0.85;                         // the e-mail drops back while the line lifts
  // Inbox rows (world px), sized for the inbox zoom so they hold up at feed size:
  //   16:9 (z 0.97): ~570 px card on screen, every line >= 28 px
  //   4:5  (z 1.00): 900 px wide with the name (83 % of the frame), subject and preheader >= 34 px
  // Lines are [fontSize, lineHeight]. Each row carries its inbox owner's first name outside the
  // card (ink, right-aligned, `lw` column): the three rows read as three people's inboxes. Lisa's
  // row adds content from the opened mail under a hairline, indented behind a vertical rule: the
  // e-mail's "ACTIES · 3" label, then ACTIES row 1 in the mail's body styling with its number
  // badge (two lines, `af` px; the date on its own line, so no "·").
  const ROW = IS45
    ? { lw: 112, lGap: 18, name: 36, cardW: 770, pad: 26, padT: 20, padB: 20, from: [34, 40], subj: [36, 44], meta: [34, 40], gap: 14, dot: 13, actGap: 10, indent: 20, lab: [21, 26], labGap: 8, af: 38, badge: 34, badgeGap: 14, padB1: 16 }
    : { lw: 96, lGap: 18, name: 30, cardW: 588, pad: 24, padT: 18, padB: 18, from: [30, 36], subj: [31, 38], meta: [29, 36], gap: 12, dot: 12, actGap: 8, indent: 16, lab: [17, 22], labGap: 6, af: 29, badge: 28, badgeGap: 12, padB1: 14 };
  ROW.w = ROW.lw + ROW.lGap + ROW.cardW;
  ROW.body = ROW.padT + ROW.from[1] + ROW.subj[1] + ROW.meta[1];
  ROW.h = ROW.body + ROW.padB;
  ROW.alh = ROW.af * 1.12;                     // = the hero's line height at the dock scale (registers)
  ROW.hair = ROW.body + ROW.actGap;            // hairline under the preheader
  ROW.exTop = ROW.hair + 1 + ROW.actGap;       // the opened-mail excerpt: "ACTIES · 3" label
  ROW.actTop = ROW.exTop + ROW.lab[1] + ROW.labGap;
  ROW.h1 = ROW.actTop + 2 * ROW.alh + ROW.padB1; // Lisa's row: the largest
  ROW.exL = ROW.pad + ROW.indent;              // excerpt content, card-local left (rule at `pad`)
  ROW.textL = ROW.exL + ROW.badge + ROW.badgeGap; // docked line, card-local left
  ROW.textW = ROW.cardW - ROW.textL - ROW.pad;
  ROW.nlh = Math.round(ROW.name * 1.2);

  // camera that puts world (wx, wy) at screen (sx, sy) with zoom z; and its inverse
  const frame = (wx, wy, sx, sy, z) => ({ cx: wx - (sx - SW / 2) / z, cy: wy - (sy - SH / 2) / z, z });
  const toWorld = (cam, sx, sy) => ({ x: cam.cx + (sx - SW / 2) / cam.z, y: cam.cy + (sy - SH / 2) / cam.z });
  const PL = -(196.5 + 14), PT = -(426 + 14);  // phone body top-left corner, world (phone at base)

  // Layout, designed in screen px and converted to world through the camera of each beat.
  // The zoom only steps down from the hold to the inbox and then drifts (<= 3 % push) through the
  // trust beat: no zoom-out followed by a push-in.
  //   hold  : the line set large over the receded e-mail
  //   inbox : rows between the text and the phone (16:9) / under the text (4:5), phone at the
  //           right (16:9) / below (4:5); the e-mail folds almost in place into row 2
  //   trust : 16:9 the StageHero plus the chips beside the top of the phone; 4:5 one move from the
  //           inbox onto act E's opening framing, the chips riding above the rising phone
  const G = (function () {
    if (IS45) {
      const zH = 0.98, zI = 1.0;
      const card = { x: 0, y: -190 };
      const camH = frame(card.x, card.y, 540, 690, zH);
      // fix 5: the unfold framing is centred on the card like the hold and never wider than rest
      // (0.86), so the phone stays as large as act C's pull-out leaves it while the page lifts out;
      // then a slow 6.5 % push onto the hold (keys()). The whole e-mail (730-776 px, top >= 302)
      // sits under "Notulen." (glyphs end ~206)
      const camU = { cx: camH.cx, cy: camH.cy, z: 0.92 };
      const camI = frame(card.x, card.y, 560, 650, zI);
      const rowsTL = toWorld(camI, (SW - ROW.w * zI) / 2, 290);   // under the ch3 sub (72 px, 2 lines: glyphs end ~265)
      const phoneTop = toWorld(camI, 0, 990).y;                   // phone (s 0.9) under the rows (they end ~946)
      const phone = { x: 0, y: phoneTop + 440 * 0.9, s: 0.9 };
      // parked below the frame through the payoff: the phone top (and its shadow) under the bottom
      // edge at the widest camera of that stretch (camU), so also at the hold and through the creep
      const parkTop = camH.cy + (SH / 2 + 40) / Math.min(camU.z, zH);
      const phoneOut = { x: 0, y: parkTop + 440 * 0.9, s: 0.9 };
      // no trust framing in this format: one move from the inbox onto act E's (keys())
      return {
        card, camU, camH, camI, phone, phoneOut, creep: 1.045, rowsTL,
        hero: { px: 56, cx: 540, cy: 655 },
        // fix 4: the chips ride 34 px above the phone through the one trust move (`ride` = the phone
        // top they are built against); `z` is set at mount to the camera zoom at the middle wipe, so
        // the labels keep their round-3 size there (42 px; ~46 px at the first wipe, ~40 at the last
        // as the camera pulls back)
        chips: { row: true, x: 0, ride: phoneTop, gapPx: 34, z: 1, px: { h: 98, fs: 42, ic: 38, gap: 18, pl: 20, pr: 25, ig: 13, st: 3.5 } },
        handoff: { cx: 0, cy: -120, z: 0.8 },              // act E camWords (fallback)
      };
    }
    const zH = 1.06, zI = 0.97, zT = 1.02;
    // the phone stays at its base in this format; the camera puts it at the right
    const camI = frame(PL, PT, 1475, 250, zI);                 // left bezel x 1475: rows end at 1430
    // under the ch3 sub (62 px, 2 lines: glyphs end ~445); cards start at x ~860, names left of them
    const rowsTL = toWorld(camI, 860 - (ROW.lw + ROW.lGap) * zI, 462);
    // the fan-out zooms out about row 2's centre, so the e-mail folds almost in place
    const r2 = { x: rowsTL.x + ROW.lw + ROW.lGap + ROW.cardW / 2, y: rowsTL.y + ROW.h1 + ROW.gap + ROW.h / 2 };
    const F = { x: SW / 2 + (r2.x - camI.cx) * zI, y: SH / 2 + (r2.y - camI.cy) * zI };
    const camH = frame(r2.x, r2.y, F.x, F.y, zH);
    const card = toWorld(camH, F.x - 170, F.y - 34);   // left of row 2: a short lift for the line
    // unfold: the page goes left of the phone. fix 5: z of rest (was 0.97), so the camera never
    // pulls out past act C's rest framing and then pushes in again; the phone (left bezel ~1475,
    // right ~1896) is fully in frame while the page leaves it
    const camU = { cx: camH.cx, cy: camH.cy, z: LAY.cam0.z };
    const camT = frame(PL, PT, 1380, 215, zT);                 // trust: chips left of the phone top
    // fix 5: parked off the right edge through the payoff: the left bezel (and the shadow, ~95 px)
    // past the frame at the widest camera of that stretch (camU), so also at the hold and creep
    const parkX = (SW / 2 + 110) / Math.min(camU.z, zH) - (PL - camH.cx);
    return {
      card, camU, camH, camI, camT, phone: null, phoneOut: { x: parkX }, creep: 1.05, rowsTL,
      hero: { px: 66, left: 330, cy: 680 },   // line 1 top ~604: under Lisa's preheader all through the dock
      chips: { row: false, right: PL - 40 / zT, cy: 227 - 426, z: zT, px: { h: 86, fs: 37, ic: 33, gap: 18, pl: 20, pr: 26, ig: 13, st: 3 } },
      handoff: { cx: -122, cy: 0, z: 0.94 },               // act E camWords (fallback)
    };
  })();
  // 4:5: the slide down to the park is as short as the speed cap allows (house curve peak = 3.14 x
  // the mean speed, held to 23 px/f at 60 fps), so the phone is out of frame by ~29.5 instead of
  // creeping along the bottom edge (2.1 s for the ~940 px of travel)
  if (IS45) dPhOut = Math.max(dUnfold, ((G.phoneOut.y - 440 * G.phoneOut.s + 440) * G.camU.z * 3.14) / (23 * 60));
  // hero line, world px (set at the hold zoom: G.hero.px on screen)
  const HF = G.hero.px / G.camH.z, HLH = HF * 1.12;
  const rowSlot = (i) => {
    const top = G.rowsTL.y + (i > 0 ? ROW.h1 + ROW.gap : 0) + (i > 1 ? ROW.h + ROW.gap : 0);
    const h = i === 0 ? ROW.h1 : ROW.h;
    const left = G.rowsTL.x;
    const cardLeft = left + ROW.lw + ROW.lGap;
    // name label: right-aligned in the `lw` column, centred on the row's sender/subject/preheader band
    return { top, h, cy: top + h / 2, nameX: left, nameY: top + ROW.h / 2, cardX: cardLeft + ROW.cardW / 2, cardLeft };
  };

  // D -> E: act E's opening framing (T.handoff.DE via Film.handoff); the phone back at its base
  const HAND = (function () {
    const h = T.handoff && T.handoff.DE;
    const v = h && Film.handoff ? Film.handoff("DE") : h && h[Film.format];
    const cam = v;
    const ok = cam && [cam.cx, cam.cy, cam.z].every((n) => typeof n === "number" && isFinite(n));
    const ph = h && h.phone && (h.phone[Film.format] || h.phone);
    return {
      cam: ok ? { cx: cam.cx, cy: cam.cy, z: cam.z } : G.handoff,
      phone: ph && typeof ph.x === "number" ? { x: ph.x, y: ph.y || 0, s: ph.s || 1 } : { x: 0, y: 0, s: 1 },
    };
  })();

  // ---- elements -----------------------------------------------------------------------------
  let scr, sheetA, sheetB, topRow, stepCardEl, steps = [], conns = [];
  let doneTile, doneCircle, doneTick, title2;
  let sweep, veil;
  let card, cardBody, blocks = [], row1P, row1Text, row1When, cardRow, cardFace;
  let hero, heroL1, heroL2, heroWho, heroWhen, dock, row1Dot, morph = [];
  let rows = [], names = [];
  let chipsWrap, chips = [];

  function keys() {
    const cam = Film.camera, ph = Film.phoneMotion;
    // fix 4: starts inside act C's send whip (0.4 s before it lands on rest at 28.0), so the two
    // keys blend and the camera never stops between the whip and this pan (no L-shaped stop-start:
    // 16:9 dips to ~2.2 px/f at 27.95 instead of 0 at 28.0)
    // fix 5: it lands after the hold push has started (tCamU), so the two blend and the camera
    // keeps moving from the unfold into the payoff push
    const tCam0 = tIn;
    cam.key(tCam0, tCamU - tCam0, G.camU);
    cam.key(tHoldPush, dHoldPush, G.camH);
    // hold: a creep that takes over the hold key's tail (fix 5: from 0.5 s before the markers are
    // done, so it is already moving when the line has landed: no still frame at 31.1-31.5), still
    // past its peak speed through 31.9-32.6 when the fan-out takes over (no frozen tail before tFan)
    const tCreep = tHlDone - 0.5;
    // a zoom plus a small glide (16:9: content drifts left, away from the phone; 4:5: up), still
    // mid-curve through 31.9-32.6
    cam.key(tCreep, tFan + 1.2 - tCreep, IS45 ? { z: G.camH.z * G.creep, cy: G.camH.cy + 22 } : { z: G.camH.z * G.creep, cx: G.camH.cx + 26 });
    // fan-out: onto the inbox framing, from just before tFan so the camera never stops
    const tFanCam = tFan - 0.15;
    cam.key(tFanCam, dFanCam, G.camI);
    const tDrift = tFanCam + dFanCam - 0.35;   // 33.3: overlaps the fan-out's tail
    if (IS45) {
      // fix 4: a slow pull-back on the inbox that runs into the trust move (same direction, so no
      // zoom reversal), then ONE move from the rows' exit onto act E's opening framing, landed at
      // T.handoff.DE.t; the phone rises on the same curve (below). Fix 5: 4 % plus a 12 px rise
      // (was 1.5 %, which read as a frozen frame from the dock to the rows' exit): the rows' top
      // stays put (+3 px, clear of the ch3 sub), rows and phone rise together (gap kept)
      cam.key(tDrift, tRowsOut + 0.6 - tDrift, { z: G.camI.z * 0.96, cy: G.camI.cy + 12 });
      cam.key(tRowsOut, tHO - tRowsOut, HAND.cam);
    } else {
      // one slow drift from the inbox to the trust framing (still moving when the hand-off starts)
      cam.key(tDrift, tHand + 1.0 - tDrift, G.camT);
      // D -> E: one move onto act E's opening framing
      cam.key(tHand, tHO - tHand, HAND.cam);
    }

    // fix 5: out of frame for the payoff, back for the inbox (16:9 to its base at the right of
    // the rows, 4:5 under the rows), landing as the rows tick in
    ph.key(tPhOut, dPhOut, G.phoneOut);
    ph.key(tPhBack, dPhBack, IS45 ? G.phone : { x: 0 });
    const tPh = IS45 ? tRowsOut : tHand;
    ph.key(tPh, tHO - tPh, HAND.phone);
  }

  // ---- phone screen: meeting detail, stages "sending" and "done" ([id].tsx) ---------------
  function buildScreen(ctx) {
    scr = el("div", "abs", ctx.phone.screen, { left: "0px", top: "0px", width: "393px", height: "852px", zIndex: SCREEN_Z, visibility: "hidden", overflow: "hidden" });
    // each stage is an opaque sheet (taller than the screen, so its rise never shows a gap)
    const sheet = () => el("div", "abs", scr, { left: "0px", top: "0px", width: "393px", height: 852 + 48 + "px", background: "#ffffff" });
    sheetA = sheet();
    sheetB = sheet();

    // StageHero: 80x80 rounded-lg tile, lucide 34 / 1.75, title text-3xl bold tracking-tight
    const tStyle = { left: "20px", top: "259px", width: "353px", textAlign: "center", fontSize: "30px", lineHeight: "36px", fontWeight: 700, letterSpacing: "-0.025em", color: K.ink, whiteSpace: "nowrap" };
    const tile = el("div", "abs", sheetA, { left: "156.5px", top: "159px", width: "80px", height: "80px", borderRadius: "10px", background: K.mintTint });
    el("div", "abs", tile, { left: "23px", top: "23px", width: "34px", height: "34px" }).innerHTML = svg("mailOpen", 34, K.mintInk, 1.75);
    el("div", "abs", sheetA, tStyle, C.app.sending);

    // ProcessingSteps card (processing-steps.tsx): rounded-lg border, py-2 + px-5 py-3, rows 28 + 16 connector
    stepCardEl = el("div", "abs", sheetA, { left: "20px", top: "319px", width: "353px", height: "290px", border: "1px solid " + K.hair, borderRadius: "10px", background: "#ffffff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", boxSizing: "border-box" });
    C.app.steps.forEach((label, i) => {
      const y = 20 + 44 * i;
      if (i > 0) conns.push(el("div", "abs", stepCardEl, { left: "33px", top: y - 16 + "px", width: "2px", height: "16px", borderRadius: "1px", background: K.hair }));
      const box = el("div", "abs", stepCardEl, { left: "20px", top: y + "px", width: "28px", height: "28px" });
      const pend = el("div", "abs", box, { left: "5px", top: "5px", width: "18px", height: "18px", borderRadius: "50%", border: "2px solid " + K.hair, background: "rgba(246,247,248,0.4)", boxSizing: "border-box" });
      const spin = el("div", "abs", box, { left: "3px", top: "3px", width: "22px", height: "22px" });
      spin.innerHTML = svg("loader2", 22, K.ink, 2);
      const check = el("div", "abs", box, { left: "3px", top: "3px", width: "22px", height: "22px" });
      check.innerHTML = svg("checkCircle2", 22, K.mintInk, 2);
      const text = el("div", "abs", stepCardEl, { left: "62px", top: y + "px", lineHeight: "28px", fontSize: "14px", whiteSpace: "nowrap" }, label);
      steps.push({ pend, spin, check, text });
    });

    // done stage: the StageHero alone (CheckCircle2 on bg-success-bg), check drawn on arrival
    doneTile = el("div", "abs", sheetB, { left: "156.5px", top: "159px", width: "80px", height: "80px", borderRadius: "10px", background: K.successBg });
    const icDone = el("div", "abs", doneTile, { left: "23px", top: "23px", width: "34px", height: "34px" });
    icDone.innerHTML = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${K.success}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10" pathLength="1" transform="rotate(-90 12 12)" stroke-dasharray="1 1"/><path d="m9 12 2 2 4-4" pathLength="1" stroke-dasharray="1 1"/></svg>`;
    doneCircle = icDone.querySelector("circle");
    doneTick = icDone.querySelector("path");
    title2 = el("div", "abs", sheetB, tStyle, C.app.sent);

    // top row: back button + subject (SafeArea 59 + pt-4). Static above both sheets.
    topRow = el("div", "abs", scr, { left: "20px", top: "75px", width: "353px", height: "36px" });
    const back = el("div", "abs", topRow, { left: "0px", top: "0px", width: "36px", height: "36px", borderRadius: "50%", border: "1px solid " + K.hair, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" });
    back.innerHTML = svg("arrowLeft", 16, K.ink, 2);
    el("div", "abs", topRow, { left: "48px", top: "11px", fontSize: "14px", lineHeight: "14px", fontWeight: 600, color: K.ink, whiteSpace: "nowrap" }, C.meeting.subject);
  }

  // step i: [tActive, tDone]. Uploaden..Vragen are done when the act starts.
  function stepTimes(i) {
    if (i <= 3) return [-Infinity, -Infinity];
    if (i === 4) return [-Infinity, tNotulenDone];
    return [tNotulenDone, tSentCheck];
  }

  // ---- the notulen e-mail ------------------------------------------------------------------
  function buildEmail(ctx) {
    card = el("div", "abs", ctx.world, { left: "0px", top: "0px", overflow: "hidden", visibility: "hidden", background: "#ffffff" });
    card.dataset.actd = "card";
    cardBody = el("div", "abs", card, { left: "0px", top: "0px", width: EW + "px", height: EH + "px", transformOrigin: "0 0" });
    const P0 = 40, CW = EW - 2 * P0;
    // reveal times: the page is complete from the first frame of the lift (the build runs before
    // tUnfold, while the card is hidden), so it cross-fades over the opaque "Notulen onderweg"
    // stage with no white dip; only the mint keyline and the header hairline draw on
    let tr = tUnfold - 0.9;
    const next = (d) => (tr += d);
    // o: instant = full opacity from the first frame, draw = keyline wipe, dim = dims behind the line
    const add = (node, t0, o = {}) => { blocks.push(Object.assign({ el: node, t: t0 }, o)); return node; };
    const box = (style, text) => el("div", "abs", cardBody, Object.assign({ whiteSpace: "nowrap" }, style), text);
    const hair = (top, left = P0, width = CW) => box({ left: left + "px", top: top + "px", width: width + "px", height: "1px", background: K.hair });

    // 3 px mint keyline over the full column
    add(box({ left: "0px", top: "0px", width: EW + "px", height: "3px", background: K.mint, transformOrigin: "0 50%" }), tUnfold, { draw: 0.75, instant: true });
    // header: Griffel logo (mark + wordmark + i-dot, all in the wordmark's coordinate space) + tag
    const logo = box({ left: P0 + "px", top: "35px", width: "117px", height: "24px" });
    logo.innerHTML = `<svg width="117" height="24" viewBox="${window.MARK.wordmarkViewBox}" style="display:block"><g fill="${K.brand}">${window.MARK.markInner}</g><g fill="#121316">${window.MARK.wordmark.map((d) => `<path d="${d}"/>`).join("")}</g><path d="${IDOT}" fill="${K.brand}"/></svg>`;
    add(logo, tUnfold, { instant: true });
    add(box({ left: P0 + "px", top: "35px", width: CW + "px", textAlign: "right", fontSize: "11px", lineHeight: "24px", fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: K.muted }, C.email.tag), tUnfold, { instant: true });
    add(hair(77), tUnfold + 0.04, { draw: 0.6 });
    add(box({ left: P0 + "px", top: "104px", fontSize: "20px", lineHeight: "27px", fontWeight: 700, letterSpacing: "-0.2px", color: K.ink }, C.email.heading), next(0.04), { dim: true });
    add(box({ left: P0 + "px", top: "143px", fontSize: "15px", lineHeight: "25px", color: K.body }, C.email.intro), next(0.025), { dim: true });

    const label = (top, text) => box({ left: P0 + "px", top: top + "px", fontSize: "11px", lineHeight: "15px", fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: K.muted }, text);
    add(label(192, EM.besproken), next(0.035), { dim: true });
    C.email.besproken.forEach((b, i) => {
      const li = box({ left: P0 + "px", top: 217 + i * 27 + "px", width: CW + "px", height: "23px" });
      el("div", "abs", li, { left: "7px", top: "9.5px", width: "4.5px", height: "4.5px", borderRadius: "50%", background: K.body });
      el("div", "abs", li, { left: "20px", top: "0px", fontSize: "14.5px", lineHeight: "23px", color: K.body }, b);
      add(li, next(0.02), { dim: true });
    });

    // ACTIES . 3 : numbered rows with 20x20 mint badges. Row 1's text is what lifts out.
    add(label(313, `${EM.acties} · ${C.email.acties.length}`), next(0.04), { dim: true });
    const numbered = (top0, items, render) => {
      items.forEach((it, i) => {
        const top = top0 + i * 43;
        const row = box({ left: P0 + "px", top: top + "px", width: CW + "px", height: "43px" });
        el("div", "abs", row, { left: "0px", top: "0px", width: CW + "px", height: "1px", background: K.hair });
        el("div", "abs", row, { left: "0px", top: "11px", width: "20px", height: "20px", borderRadius: "4px", background: K.mintTint, color: K.mintInk, fontSize: "11px", fontWeight: 700, lineHeight: "20px", textAlign: "center" }, String(i + 1));
        const p = el("div", "abs", row, { left: "30px", top: "10px", fontSize: "14px", lineHeight: "22px", color: K.ink, whiteSpace: "nowrap" });
        render(p, it, i);
        add(row, next(0.025), { dim: true });
      });
      add(hair(top0 + items.length * 43), tr + 0.02, { draw: 0.5, dim: true });
    };
    numbered(338, C.email.acties, (p, a, i) => {
      if (i === 0) {
        // row1Text = what becomes the hero's line 1 ("Lisa ... klant"); row1When = its line 2. The
        // "·" only separates the two on the mail's single line: the hero sets the date on its own
        // line, so the separator stays behind (and leaves with row1Text)
        row1P = p;
        row1Text = el("span", null, p);
        el("span", null, row1Text, { fontWeight: 600 }, a.who);
        row1Text.appendChild(document.createTextNode(" " + a.text));
        if (a.when) {
          row1Dot = el("span", null, p, null, " ·");
          p.appendChild(document.createTextNode(" "));
          row1When = el("span", null, p, { fontWeight: 600 }, a.when);
        }
      } else {
        p.appendChild(document.createTextNode(a.who + " " + a.text + (a.when ? " · " + a.when : "")));
      }
    });
    add(label(491, `${EM.besluiten} · ${C.email.besluiten.length}`), next(0.035), { dim: true });
    numbered(516, C.email.besluiten, (p, b) => p.appendChild(document.createTextNode(b)));

    // privacy callout: 3 px mint bar on #F6F8F7
    const pv = box({ left: P0 + "px", top: "630px", width: CW + "px", height: "64px", whiteSpace: "normal" });
    el("div", "abs", pv, { left: "0px", top: "0px", width: "3px", height: "64px", background: K.mint });
    const pvText = el("div", "abs", pv, { left: "3px", top: "0px", width: CW - 3 + "px", height: "64px", padding: "12px 16px", boxSizing: "border-box", background: K.privacyBg, fontSize: "12.5px", lineHeight: "20px", color: K.body });
    const cut = C.email.privacy.indexOf(":");
    el("strong", null, pvText, { color: K.ink, fontWeight: 600 }, C.email.privacy.slice(0, cut + 1));
    pvText.appendChild(document.createTextNode(C.email.privacy.slice(cut + 1)));
    add(pv, next(0.035), { dim: true });
    add(hair(722), next(0.025), { draw: 0.5, dim: true });
    add(box({ left: P0 + "px", top: "737px", fontSize: "12px", lineHeight: "18px", color: K.faint }, C.email.footer), next(0.02), { dim: true });

    // inbox-row face (the e-mail card becomes row 2 of the fan-out)
    cardRow = el("div", "abs", card, { left: "0px", top: "0px", width: ROW.cardW + "px", height: ROW.h + "px", opacity: 0 });
    cardFace = rowFace(cardRow);
  }

  // the payoff line: ACTIES row 1 verbatim, left-aligned over two lines, the date on its own line
  // ("Lisa stuurt de offerte naar de klant" / "12 december": the line break sets the date apart,
  // so the mail's "·" separator is dropped), markers on the name and the date.
  // The same element docks in Lisa's inbox row as the e-mail's own ACTIES row 1: as it lands it
  // cross-fades into `dock`, the same two lines in the mail's body styling (name and date 600, the
  // rest 400, no tracking), drawn by the hero's own transform so the two register exactly.
  function buildHero(ctx) {
    const a = C.email.acties[0];
    hero = el("div", "abs", ctx.world, { left: "0px", top: "0px", width: "0px", height: "0px", transformOrigin: "0 0", zIndex: 6, visibility: "hidden", fontWeight: 700, fontSize: HF + "px", lineHeight: HLH + "px", letterSpacing: "-0.03em", color: K.ink, whiteSpace: "nowrap" });
    // every word is its own inline-block, so the bold and the body setting can be registered word
    // by word during the cross-fade (a weight morph, never two offset copies of the line)
    const words = (line, text) => text.split(" ").map((w) => {
      line.appendChild(document.createTextNode(" "));
      return el("span", null, line, { display: "inline-block", transformOrigin: "0 50%" }, w);
    });
    heroL1 = el("div", "abs", hero, { left: "0px", top: "0px" });
    heroL1.dataset.actd = "hero1";
    heroWho = marker(heroL1, a.who);
    const hw1 = words(heroL1, a.text);
    if (a.when) {
      heroL2 = el("div", "abs", hero, { left: "0px", top: "0px" });
      heroL2.dataset.actd = "hero2";
      heroWhen = marker(heroL2, a.when);
    }
    dock = el("div", "abs", hero, { left: "0px", top: "0px", fontWeight: 400, letterSpacing: "0px", opacity: 0 });
    dock.dataset.actd = "dock";
    const d1 = el("div", "abs", dock, { left: "0px", top: "0px" });
    const dWho = marker(d1, a.who, true);
    dWho.s.style.fontWeight = 600;
    const dw1 = words(d1, a.text);
    morph = [[heroWho.s, dWho.s]].concat(hw1.map((h, i) => [h, dw1[i]]));
    if (a.when) {
      const d2 = el("div", "abs", dock, { left: "0px", top: HLH + "px" });
      const dWhen = marker(d2, a.when, true);
      dWhen.s.style.fontWeight = 600;
      morph.push([heroWhen.s, dWhen.s]);
    }
  }

  // marker highlight: #D6FBEB block wipes in behind the word, the word turns #12804B (`done`: set)
  function marker(parent, text, done) {
    const s = el("span", null, parent, { position: "relative", display: "inline-block", zIndex: 0, transformOrigin: "0 50%" });
    const bg = el("span", null, s, { position: "absolute", left: "-0.07em", right: "-0.07em", top: "0.1em", bottom: "0.04em", borderRadius: "0.07em", background: K.mintTint, zIndex: -1, transformOrigin: "0 50%", transform: done ? "none" : "scaleX(0)" });
    s.appendChild(document.createTextNode(text));
    if (done) s.style.color = K.greenInk;
    return { s, bg };
  }

  // inbox row content: sender + unread dot / subject / preheader (copy.js, verbatim; long lines end
  // in an ellipsis). Lisa's row adds content from the opened mail under a hairline, indented behind
  // a vertical rule: the mail's "ACTIES · 3" label and ACTIES row 1's number badge; the payoff line
  // itself docks next to the badge (renderHero).
  function rowFace(parent, lisa) {
    const subject = C.email.inboxSubject;
    // fix 5: the preheader is cut at its first sentence ("Meeting-notulen, met jou gedeeld.", a
    // verbatim prefix that fits the row in both formats), never mid-word ("Ze best…" read as a bug)
    const pre = C.email.inboxPreheader || "";
    const sentence = pre.match(/^.*?[.!?](?=\s|$)/);
    const third = pre ? (sentence ? sentence[0] : pre) : (subject === C.meeting.subject ? "" : C.meeting.subject);
    const tw = ROW.cardW - 2 * ROW.pad;
    let y = ROW.padT;
    const line = (spec, style, text) => {
      const n = el("div", "abs", parent, Object.assign({ left: ROW.pad + "px", top: y + "px", fontSize: spec[0] + "px", lineHeight: spec[1] + "px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, style), text);
      y += spec[1];
      return n;
    };
    const from = line(ROW.from, { fontWeight: 600, color: K.ink, letterSpacing: "-0.01em", width: tw - ROW.dot - 12 + "px" }, C.email.inboxFrom);
    const subj = line(ROW.subj, { fontWeight: 500, color: K.ink, width: tw + "px" }, subject);
    const meta = third ? line(ROW.meta, { color: K.muted, width: tw + "px" }, third) : null;
    const dot = el("div", "abs", parent, { left: ROW.cardW - ROW.pad - ROW.dot + "px", top: ROW.padT + (ROW.from[1] - ROW.dot) / 2 + "px", width: ROW.dot + "px", height: ROW.dot + "px", borderRadius: "50%", background: K.brand, transform: "scale(0)" });
    const face = { from, subj, meta, dot };
    if (lisa) {
      face.hair = el("div", "abs", parent, { left: ROW.pad + "px", top: ROW.hair + "px", width: tw + "px", height: "1px", background: K.hair, transformOrigin: "0 50%" });
      face.rule = el("div", "abs", parent, { left: ROW.pad + "px", top: ROW.exTop + "px", width: "2px", height: ROW.actTop + 2 * ROW.alh - ROW.exTop + "px", borderRadius: "1px", background: "#D6DADD", transformOrigin: "50% 0" });
      // the e-mail's section label (summary-email.tsx, as on the card): 600, uppercase, tracked, muted
      face.lab = el("div", "abs", parent, { left: ROW.exL + "px", top: ROW.exTop + "px", fontSize: ROW.lab[0] + "px", lineHeight: ROW.lab[1] + "px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: K.muted, whiteSpace: "nowrap" }, `${EM.acties} · ${C.email.acties.length}`);
      const b = ROW.badge;
      face.badge = el("div", "abs", parent, { left: ROW.exL + "px", top: ROW.actTop + (ROW.alh - b) / 2 + "px", width: b + "px", height: b + "px", borderRadius: (4 * b) / 20 + "px", background: K.mintTint, color: K.mintInk, fontSize: Math.round(b * 0.55) + "px", fontWeight: 700, lineHeight: b + "px", textAlign: "center" }, "1");
    }
    return face;
  }

  function buildRows(ctx) {
    const shadow = "0 18px 36px -18px rgba(16,24,40,0.28), 0 3px 8px rgba(16,24,40,0.06)";
    const mk = (beforeNode, lisa) => {
      // Lisa's row: the largest, with a brand-green ring (decoration, never text)
      const c = el("div", "abs", null, { left: "0px", top: "0px", width: ROW.cardW + "px", height: (lisa ? ROW.h1 : ROW.h) + "px", overflow: lisa ? "hidden" : "visible", borderRadius: "10px", background: "#ffffff", border: "1px solid " + (lisa ? K.brand : K.hair), boxSizing: "border-box", boxShadow: lisa ? `0 0 0 1px ${K.brand}, 0 22px 44px -20px rgba(16,24,40,0.32), 0 3px 8px rgba(16,24,40,0.06)` : shadow, visibility: "hidden" });
      if (beforeNode) ctx.world.insertBefore(c, beforeNode); else ctx.world.appendChild(c);
      c.dataset.actd = "row";
      return { el: c, face: rowFace(c, lisa) };
    };
    rows[0] = mk(null, true);           // Lisa: above the e-mail, the line docks in it
    rows[2] = mk(card, false);          // third recipient: dealt out from under the folding e-mail
    rows[1] = { el: card, face: null }; // second recipient: the e-mail card itself
    // the inbox owner's first name, in ink, outside the mail row (no initials, no e-mail address)
    C.meeting.names.forEach((n) => {
      const a = el("div", "abs", ctx.world, { left: "0px", top: "0px", width: ROW.lw + "px", textAlign: "right", fontSize: ROW.name + "px", lineHeight: ROW.nlh + "px", fontWeight: 700, letterSpacing: "-0.02em", color: K.ink, whiteSpace: "nowrap", visibility: "hidden" }, n);
      a.dataset.actd = "name" + names.length;
      names.push(a);
    });
  }

  // ---- wipe chips (world, beside the top of the phone) ---------------------------------------
  // Sized for the trust zoom (G.chips.z): 16:9 text ~37 px, stacked right-aligned left of the
  // phone at the height of the StageHero; 4:5 text 42 px at the middle wipe, one row riding 34 px
  // above the phone top (built against G.chips.ride, moved with the phone in renderChips).
  function buildChips(ctx) {
    const z = G.chips.z, px = G.chips.px;
    const w = (v) => v / z + "px";
    const n = C.wiped.length, H = px.h / z, GAP = px.gap / z;
    const place = G.chips.row
      ? { left: G.chips.x - 900 + "px", top: G.chips.ride - G.chips.gapPx / z - H + "px", width: "1800px", flexDirection: "row", justifyContent: "center", alignItems: "center" }
      : { left: G.chips.right - 900 + "px", top: G.chips.cy - (n * H + (n - 1) * GAP) / 2 + "px", width: "900px", flexDirection: "column", alignItems: "flex-end" };
    chipsWrap = el("div", "abs", null, Object.assign({ display: "flex", gap: GAP + "px", visibility: "hidden" }, place));
    ctx.world.insertBefore(chipsWrap, ctx.phone.el);
    const icons = ["mic", "fileText", "msgQuestion"];
    C.wiped.forEach((label, i) => {
      const c = el("div", null, chipsWrap, { height: H + "px", padding: `0 ${w(px.pr)} 0 ${w(px.pl)}`, borderRadius: "10px", background: "#ffffff", border: "1px solid " + K.hair, boxSizing: "border-box", display: "flex", alignItems: "center", gap: w(px.ig), boxShadow: "0 14px 30px -14px rgba(16,24,40,0.30), 0 2px 6px rgba(16,24,40,0.06)", flex: "0 0 auto" });
      const ic = px.ic / z;
      const icon = el("div", null, c, { width: ic + "px", height: ic + "px" });
      icon.innerHTML = svg(icons[i], ic, K.body, 1.9);
      const lab = el("div", null, c, { position: "relative", fontSize: w(px.fs), fontWeight: 600, color: K.ink, letterSpacing: "-0.01em", whiteSpace: "nowrap", lineHeight: "1" }, label);
      const strike = el("div", "abs", lab, { left: "-3px", right: "-3px", top: "52%", height: w(px.st), marginTop: "-1px", borderRadius: "1px", background: K.ink, transformOrigin: "0 50%", transform: "scaleX(0)" });
      c.dataset.actd = "chip" + i;
      chips.push({ el: c, icon, lab, strike });
    });
  }

  // ---- render helpers ------------------------------------------------------------------------
  const fmt = (v, d = 3) => (Math.abs(v) < 1e-9 ? "0" : v.toFixed(d));
  function show(node, on) { node.style.visibility = on ? "inherit" : "hidden"; }
  // landing tick: a soft, continuous 1.6 % swell that settles on the house curve
  const tick = (t, tl) => 1 + 0.016 * P(t, tl - 0.16, 0.16) * (1 - P(t, tl, 0.4));
  const blur = (v) => (v > 0.001 ? `blur(${fmt(v, 2)}px)` : "none");

  function renderScreen(t) {
    const on = t >= tIn && t < tOut;
    show(scr, on);
    if (!on) return;
    // stage swaps: the incoming sheet is opaque from its first frame and rises 32 px; the
    // outgoing one stays opaque underneath (no blank or washed-out frame)
    const a = P(t, tIn, dSlide);
    const aOn = t < tDoneSwap + dSlide;
    show(sheetA, aOn);
    sheetA.style.transform = `translate3d(0, ${fmt(SLIDE * (1 - a), 2)}px, 0)`;
    // fix 4: under act C's send whip the cover (and its top row with it, so the subject never
    // prints over act C's title) also fades in over 0.14 s: no one-frame swap
    const coverIn = fmt(P(t, tIn, 0.14));
    sheetA.style.opacity = coverIn;
    topRow.style.opacity = coverIn;
    const bOn = t >= tDoneSwap;
    show(sheetB, bOn);
    const b = P(t, tDoneSwap, dSlide);
    sheetB.style.transform = `translate3d(0, ${fmt(SLIDE * (1 - b), 2)}px, 0)`;
    const dc = P(t, tDoneSwap + 0.1, 0.32), dk = P(t, tDoneSwap + 0.3, 0.25);
    doneCircle.setAttribute("stroke-dashoffset", fmt(1 - dc, 4));
    doneTick.setAttribute("stroke-dashoffset", fmt(1 - dk, 4));
    const pop = P(t, tDoneSwap + 0.45, 0.2) * (1 - P(t, tDoneSwap + 0.65, 0.4));
    doneTile.style.transform = `scale(${fmt(1 + 0.04 * pop, 4)})`;
    if (!aOn) return;

    // processing steps
    const spinA = (t * 225) % 360; // Loader2, one turn per 1.6 s (Spinning default)
    steps.forEach((s, i) => {
      const [ta, td] = stepTimes(i);
      const ac = ta === -Infinity ? 1 : P(t, ta, 0.2);
      const d = td === -Infinity ? 1 : P(t, td, 0.3);
      s.pend.style.opacity = fmt(1 - ac);
      s.spin.style.opacity = fmt(ac * (1 - P(t, td, 0.12)));
      s.spin.style.transform = `rotate(${fmt(spinA, 2)}deg)`;
      s.check.style.opacity = fmt(d);
      s.check.style.transform = `scale(${fmt(0.6 + 0.4 * d, 4)})`;
      const done = d > 0.5, active = !done && ac > 0.5;
      s.text.style.fontWeight = done ? 500 : active ? 600 : 400;
      s.text.style.color = mixHex(K.muted, K.ink, ac);
      if (i > 0) {
        const prevDone = stepTimes(i - 1)[1];
        const pd = prevDone === -Infinity ? 1 : P(t, prevDone, 0.3);
        conns[i - 1].style.background = mixHex(K.hair, "#a6b1aa", pd); // accent-foreground/35 on white
      }
    });
  }

  let sweepOnTop = false;
  function renderSweep(t, ctx) {
    const L = ctx.L;
    // film.js sorts parts with (order || 50), so stage.js (order 0) mounts after the acts and
    // its opaque base would cover these layers: move them on top once.
    if (!sweepOnTop) { ctx.stage.appendChild(veil); ctx.stage.appendChild(sweep); sweepOnTop = true; }
    const a = tIn - 0.1, d = 1.0;
    const on = t > a && t < a + d;
    show(sweep, on); show(veil, on);
    if (!on) return;
    const u = P(t, a, d);
    const bell = Math.sin(Math.PI * clamp((t - a) / d));
    sweep.style.transform = `translate3d(${fmt(lerp(-0.7 * L.W, 1.15 * L.W, u), 1)}px, 0, 0) skewX(-14deg)`;
    sweep.style.opacity = fmt(bell);
    veil.style.opacity = fmt(0.3 * bell);
  }

  // the e-mail card's box at t (world): centre, size and content scale. Shared with the line.
  function cardState(t) {
    const u = P(t, tUnfold, dUnfold), ux = P(t, tUnfold, dUnfold + 0.6);   // sideways: <= 25 px/f
    // 4:5 (fix 5): the page rises ~700 px from the phone's lower screen to under "Notulen."; the
    // rise runs 0.35 s longer than the growth, so its top edge stays <= 25 px/f (was ~30)
    const uy = IS45 ? P(t, tUnfold, dUnfold + 0.35) : u;
    const c = P(t, tCol, dCol);
    const rec = lerp(1, RECEDE, P(t, tLift, dLift));
    // start rect: the empty lower part of the phone screen, attached to the moving phone (16:9:
    // until it steps out to the right, so the page's last few px of travel never follow it)
    const tp = IS45 ? t : Math.min(t, tPhOut);
    const pm = Film.phoneMotion.at(tp);
    const p0 = Film.phoneToWorld(196.5, LIFT_TOP + LIFT_H / 2, tp);
    const s1 = rowSlot(1);
    const x = lerp(lerp(p0.x, G.card.x, ux), s1.cardX, c);
    const y = lerp(lerp(p0.y, G.card.y, uy), s1.cy, c);
    const w = lerp(lerp(393 * pm.s, EW, u) * rec, ROW.cardW, c);
    const h = lerp(lerp(LIFT_H * pm.s, EH, u) * rec, ROW.h, c);
    return { u, c, x, y, w, h, k: w / EW, left: x - w / 2, top: y - h / 2 };
  }

  function renderEmail(t) {
    const exitR = P(t, tRowsOut + 0.04, dRowsOut);
    const on = t >= tUnfold && exitR < 1;
    show(card, on);
    if (!on) return;
    const cs = cardState(t);
    const { u, c, x, y, w, h } = cs;
    const rT = lerp(0, 10, u), rB = lerp(50 * Film.phoneMotion.at(t).s, 10, u);
    // it reads as lifting from the first frame: 2 % up-scale and a growing shadow, settling by 29.6
    const lift = 1 + 0.02 * P(t, tUnfold, 0.25) * (1 - P(t, tUnfold + 0.5, 0.7));
    const sc = lift * tick(t, ticks[1]);
    const yE = y - exitR * 18;
    const sh = P(t, tUnfold, 0.3);
    card.style.width = fmt(w, 2) + "px";
    card.style.height = fmt(h, 2) + "px";
    card.style.borderRadius = `${fmt(rT, 2)}px ${fmt(rT, 2)}px ${fmt(rB, 2)}px ${fmt(rB, 2)}px`;
    card.style.boxShadow = `0 0 0 1px rgba(16,24,40,${fmt(0.06 * sh)}), 0 ${fmt(lerp(18, 50, u) * (1 - 0.6 * c), 1)}px ${fmt(lerp(40, 110, u) * (1 - 0.6 * c), 1)}px -${fmt(lerp(14, 40, u), 1)}px rgba(16,24,40,${fmt((0.22 + 0.1 * u) * sh * (1 - 0.1 * c))}), 0 6px 16px -6px rgba(16,24,40,${fmt(0.12 * sh)})`;
    // opaque from its first frame (it starts over the stage's empty white area): no dissolve
    card.style.opacity = fmt(1 - exitR);
    card.style.filter = blur(exitR * 6);
    card.style.transform = `translate3d(${fmt(x - w / 2, 2)}px, ${fmt(yE - h / 2, 2)}px, 0) scale(${fmt(sc, 4)})`;

    // content: scaled with the card, top-anchored, so the folding card crops it from below (its
    // header stays in view). It fades out once the fold is under way, then Daan's row face rises
    // in as the rect settles: they barely overlap and the card is never an empty slab.
    const bo = P(t, tBodyOut, dBodyOut), fi = P(t, tFaceIn, dFaceIn);
    cardBody.style.transform = `translate3d(0, ${fmt(-12 * bo, 2)}px, 0) scale(${fmt(cs.k, 4)})`;
    cardBody.style.opacity = fmt(1 - bo);
    show(cardBody, bo < 1);
    cardRow.style.opacity = fmt(fi);
    // Daan's face rides the bottom of the folding card (Lisa's card covers its top while it passes),
    // so the part of the card in view is never an empty slab; it is at its own place once folded
    cardRow.style.transform = `translate3d(0, ${fmt(Math.max(0, h - ROW.h) + 8 * (1 - fi), 2)}px, 0)`;
    // the rest of the e-mail dims while the line is up; under the line's band it drops to 6 %, so
    // no mail text ghosts between the payoff's letters (fix 4)
    const dim = P(t, tLift, 0.5);
    if (!bandDone) markBand();
    blocks.forEach((b) => {
      const k1 = b.instant || b.draw ? (t >= b.t ? 1 : 0) : P(t, b.t, 0.32);
      let op = b.instant || b.draw ? k1 : clamp(k1 * 1.6);
      if (b.dim) op *= 1 - (b.band ? 0.94 : 0.82) * dim;
      b.el.style.opacity = fmt(op);
      if (b.draw) {
        b.el.style.transform = `scaleX(${fmt(P(t, b.t, b.draw), 4)})`;
        b.el.style.transformOrigin = "0 50%";
      } else if (!b.instant) {
        b.el.style.transform = `translate3d(0, ${fmt((1 - k1) * 10, 2)}px, 0)`;
      }
    });
    // ACTIES row 1's text has lifted out: its slot stays empty behind the line
    // the line's first part lifts out at once; the date stays a moment while the line's own
    // "12 december" re-forms under it (no long slide)
    row1Text.style.opacity = fmt(1 - P(t, tLift + 0.03, 0.08));
    if (row1Dot) row1Dot.style.opacity = row1Text.style.opacity;
    if (row1When) row1When.style.opacity = fmt(1 - P(t, tLift + 0.06, 0.3));
  }

  // which e-mail blocks lie under the payoff line's band at the hold (card-local, with a margin of
  // ~a third of a line): those dim to 6 % instead of 18 %. Layout reads only, no time dependence.
  let bandDone = false;
  function markBand() {
    bandDone = true;
    const cs = cardState(tHlDone);
    const H = heroHold(0);
    const m = 0.35 * HLH;
    const y0 = (H.y - m - cs.top) / cs.k, y1 = (H.y + 2 * HLH + m - cs.top) / cs.k;
    blocks.forEach((b) => {
      const top = b.el.offsetTop, bot = top + Math.max(1, b.el.offsetHeight);
      b.band = !!b.dim && bot > y0 && top < y1;
    });
  }

  // hold position of the line (top-left of the block, world) at the hold camera
  function heroHold(W1) {
    const z = G.camH.z;
    const sx = G.hero.left !== undefined ? G.hero.left : G.hero.cx - (W1 * z) / 2;
    return toWorld(G.camH, sx, G.hero.cy - HLH * z);
  }
  // docked: the e-mail's ACTIES row 1 in Lisa's row, next to the number badge, two lines. W1 is the
  // wider of the two line-1 settings (bold hero / body-styled dock), so both fit the text column.
  function heroDock(W1) {
    const r = rowSlot(0);
    const s = Math.min(ROW.af / HF, ROW.textW / W1);
    return { x: r.cardLeft + ROW.textL, y: r.top + ROW.actTop + (ROW.alh - HLH * s) / 2, s };
  }

  // the payoff line's state at t (world): lifts out of the e-mail (registered on ACTIES row 1),
  // holds large, then docks in Lisa's inbox row as the e-mail's own ACTIES row 1. One house curve
  // for the dock position and a linear scale, so both ends of the line run the same curve.
  function heroState(t) {
    const W1 = heroL1.offsetWidth;
    const cs = cardState(t);
    const W1e = row1Text.offsetLeft + row1Text.offsetWidth;
    const s0 = (W1e * cs.k) / W1;
    const X0 = cs.left + ROW1.pLeft * cs.k, Y0 = cs.top + ROW1.pMid * cs.k - (s0 * HLH) / 2;
    const m = P(t, tLift + 0.08, dLift - 0.08);
    const H = heroHold(W1), D2 = heroDock(Math.max(W1, dock.firstChild.offsetWidth));
    let X = lerp(X0, H.x, m), Y = lerp(Y0, H.y, m), s = zoomLerp(s0, 1, m);
    const fp = P(t, tFan, dFly);
    if (fp > 0) { X = lerp(X, D2.x, fp); Y = lerp(Y, D2.y, fp); s = lerp(s, D2.s, fp); }
    return { X, Y, s, W1, fp, H, D2 };
  }

  // Lisa's row forms around the line: its rect runs from a box hugging the line at the hold to
  // its inbox slot on the line's own curve, so the line is always inside it (no border or other
  // row ever crosses the moving text)
  function lisaRect(st) {
    const pl = 0.5 * HF, pt = 0.36 * HF;
    const r = rowSlot(0), f = st.fp;
    return {
      x: lerp(st.H.x - pl, r.cardLeft, f), y: lerp(st.H.y - pt, r.top, f),
      w: lerp(st.W1 + 2 * pl, ROW.cardW, f), h: lerp(2 * HLH + 2 * pt, ROW.h1, f),
    };
  }

  function renderHero(t) {
    const exitR = P(t, tRowsOut, dRowsOut);
    const on = t >= tLift && exitR < 1;
    show(hero, on);
    if (!on) return;
    const st = heroState(t);
    // left-aligned block, line 1 at the origin (registered on the e-mail's text), line 2 under it.
    // As it lands in Lisa's row the bold line cross-fades into the mail's body styling (dock).
    const dk = Eng.E.house(clamp((st.fp - 0.78) / 0.22));
    // overlapping (not complementary) opacities, so the registered pair never thins out mid-way
    const hOp = clamp((1 - dk) * 1.6), dOp = clamp(dk * 1.6);
    heroL1.style.transform = "none";
    heroL1.style.opacity = fmt(hOp);
    if (heroL2) {
      heroL2.style.transform = `translate3d(0, ${fmt(HLH, 2)}px, 0)`;
      heroL2.style.opacity = fmt(P(t, tLift + 0.06, 0.3) * hOp);
    }
    dock.style.opacity = fmt(dOp);
    // word-by-word registration while both are up: each bold word slides and stretches onto its
    // body-styled twin (and the twin from the bold word's box), so the glyph runs line up
    const mid = dk > 0 && dk < 1;
    for (const [h, d] of morph) {
      if (!mid) { h.style.transform = "none"; d.style.transform = "none"; continue; }
      const hx = h.offsetLeft, dx = d.offsetLeft, hw = h.offsetWidth || 1, dw = d.offsetWidth || 1;
      h.style.transform = `translate3d(${fmt((dx - hx) * dk, 2)}px, 0, 0) scaleX(${fmt(lerp(1, dw / hw, dk), 4)})`;
      d.style.transform = `translate3d(${fmt((hx - dx) * (1 - dk), 2)}px, 0, 0) scaleX(${fmt(lerp(hw / dw, 1, dk), 4)})`;
    }
    hero.style.transform = `translate3d(${fmt(st.X, 2)}px, ${fmt(st.Y - exitR * 18, 2)}px, 0) scale(${fmt(st.s, 5)})`;
    hero.style.opacity = fmt(P(t, tLift, 0.08) * (1 - exitR));
    hero.style.filter = blur(exitR * 6);
    // the payoff: marker on Lisa and on 12 december
    const hw = P(t, tHlWho, 0.4), hd = P(t, tHlWhen, 0.4);
    heroWho.bg.style.transform = `scaleX(${fmt(hw, 4)})`;
    heroWho.s.style.color = mixHex(K.ink, K.greenInk, hw);
    if (heroWhen) {
      heroWhen.bg.style.transform = `scaleX(${fmt(hd, 4)})`;
      heroWhen.s.style.color = mixHex(K.ink, K.greenInk, hd);
    }
  }

  function renderRows(t) {
    const st = t >= tFan - 0.05 ? heroState(t) : null;
    const lr = st ? lisaRect(st) : null;
    for (let i = 0; i < 3; i++) {
      const tl = ticks[i];
      const s = rowSlot(i);
      const exitR = P(t, tRowsOut + i * 0.04, dRowsOut);
      // the inbox owner's name, right-aligned left of the card, centred on the sender / subject /
      // preheader band. Lisa's rides with her row (centred on its top band) and comes in once the
      // row is narrow enough
      const nm = names[i];
      const ta = tl - 0.24;
      const aOn = t >= ta && exitR < 1;
      show(nm, aOn);
      if (aOn) {
        const ua = P(t, ta, 0.4);
        let ax = s.nameX, ay = s.nameY, ao = clamp(ua * 1.4);
        if (i === 0 && lr) {
          ax = lr.x - ROW.lGap - ROW.lw;
          ay = lr.y + Math.min(ROW.h, lr.h) / 2;
          ao *= Eng.E.house(clamp((st.fp - 0.25) / 0.35));
        } else if (i === 1) {
          // Daan's row is the folding e-mail card: keep the name clear of its left edge until it lands
          ax = Math.min(ax, cardState(t).left - ROW.lGap - ROW.lw);
        }
        nm.style.opacity = fmt(ao * (1 - exitR));
        nm.style.filter = blur(exitR * 6);
        nm.style.transform = `translate3d(${fmt(ax, 2)}px, ${fmt(ay - ROW.nlh / 2 + 8 * (1 - ua) - exitR * 18, 2)}px, 0)`;
      }
      if (i === 1) continue; // row 2 is the e-mail card itself (renderEmail)
      const r = rows[i];
      const start = i === 0 ? tl - 0.3 : tl - 0.45;
      const on = t >= start && exitR < 1;
      show(r.el, on);
      if (!on) continue;
      const m = P(t, start, tl - start);
      if (i === 0) {
        // the card fades in around the line, then its sender, subject and preheader (and the
        // hairline and number badge of ACTIES row 1) come in once the line has dropped clear of them
        const fo = Eng.E.house(clamp((st.fp - 0.84) / 0.16));
        for (const k of ["from", "subj", "meta", "dot"]) if (r.face[k]) r.face[k].style.opacity = fmt(fo);
        for (const k of ["from", "subj", "meta"]) if (r.face[k]) r.face[k].style.transform = `translate3d(0, ${fmt(6 * (1 - fo), 2)}px, 0)`;
        r.face.hair.style.opacity = fmt(fo);
        r.face.hair.style.transform = `scaleX(${fmt(fo, 4)})`;
        r.face.rule.style.opacity = fmt(fo);
        r.face.rule.style.transform = `scaleY(${fmt(fo, 4)})`;
        // the line slides down past the "ACTIES · 3" label's place until its last ~4 % (the card
        // and the line run the same curve from different offsets): label and badge come in after
        const fl = Eng.E.house(clamp((st.fp - 0.955) / 0.045));
        r.face.lab.style.opacity = fmt(fl);
        r.face.lab.style.transform = `translate3d(0, ${fmt(-6 * (1 - fl), 2)}px, 0)`;
        r.face.badge.style.opacity = fmt(fl);
        r.face.badge.style.transform = `scale(${fmt(0.6 + 0.4 * fl, 4)})`;
        r.face.dot.style.transform = `scale(${fmt(clamp(spring(t - tl, 3.2, 0.9), 0, 1.2), 4)})`;
        const scl = lerp(0.97, 1, m) * tick(t, tl);
        r.el.style.width = fmt(lr.w, 2) + "px";
        r.el.style.height = fmt(lr.h, 2) + "px";
        r.el.style.opacity = fmt(clamp(m * 1.6) * (1 - exitR));
        r.el.style.filter = blur(exitR * 6);
        r.el.style.transform = `translate3d(${fmt(lr.x, 2)}px, ${fmt(lr.y - exitR * 18, 2)}px, 0) scale(${fmt(scl, 4)})`;
        continue;
      }
      // row 3 is dealt out from under the folding e-mail; its text comes in as it clears row 2
      const y = lerp(rowSlot(1).cy, s.cy, m);
      const ft = Eng.E.house(clamp((m - 0.5) / 0.5));
      for (const k of ["from", "subj", "meta"]) if (r.face[k]) r.face[k].style.opacity = fmt(ft);
      r.face.dot.style.transform = `scale(${fmt(clamp(spring(t - tl, 3.2, 0.9), 0, 1.2), 4)})`;
      r.el.style.opacity = fmt(clamp(m * 4) * (1 - exitR));
      r.el.style.filter = blur(exitR * 6);
      r.el.style.transform = `translate3d(${fmt(s.cardX - ROW.cardW / 2, 2)}px, ${fmt(y - ROW.h / 2 - exitR * 18, 2)}px, 0) scale(${fmt(tick(t, tl), 4)})`;
    }
    // row 2's dot (the e-mail card's face)
    cardFace.dot.style.transform = `scale(${fmt(clamp(spring(t - ticks[1], 3.2, 0.9), 0, 1.2), 4)})`;
  }

  function renderChips(t) {
    const last = wipe[wipe.length - 1] + 0.62;
    const on = t >= tChipsIn - 0.01 && t < last;
    show(chipsWrap, on);
    if (!on) return;
    const zc = G.chips.z;
    if (G.chips.ride !== undefined) {
      // 4:5: ride above the phone top through the trust move
      const pm = Film.phoneMotion.at(t);
      chipsWrap.style.transform = `translate3d(${fmt(pm.x, 2)}px, ${fmt(pm.y - 440 * pm.s - G.chips.ride, 2)}px, 0)`;
    }
    const lift = 18 / zc;
    chips.forEach((c, i) => {
      const t0 = tChipsIn + i * 0.09;
      const u = P(t, t0, 0.5);
      const st = P(t, wipe[i], 0.22);
      const f = P(t, wipe[i] + 0.18, 0.38);
      c.el.style.opacity = fmt(P(t, t0, 0.35) * (1 - f));
      c.el.style.filter = blur(6 * f);
      c.el.style.transform = `translate3d(0, ${fmt((1 - u) * lift + (6 / zc) * f, 2)}px, 0)`;
      c.strike.style.transform = `scaleX(${fmt(st, 4)})`;
      c.lab.style.color = mixHex(K.ink, K.faint, st);
      c.icon.style.opacity = fmt(1 - 0.5 * st);
    });
  }

  Film.register({
    id: "act-d",
    order: 30,
    mount(ctx) {
      keys();
      // 4:5 chips: sized for the camera zoom at the middle wipe (the camera is in the trust move;
      // only this act's keys act on it at that time, so the value does not depend on mount order)
      if (G.chips.ride !== undefined) G.chips.z = Film.camera.at(wipe[1]).z;
      buildScreen(ctx);
      const L = ctx.L;
      veil = el("div", "abs", ctx.stage, { left: "0px", top: "0px", width: L.W + "px", height: L.H + "px", background: "#ffffff", opacity: 0, visibility: "hidden" });
      // light sweep with a faint mint core, so it reads on the white-to-mint stage
      sweep = el("div", "abs", ctx.stage, { left: "0px", top: "0px", width: Math.round(L.W * 0.6) + "px", height: L.H + "px", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 28%, rgba(214,251,235,0.7) 50%, rgba(255,255,255,0.55) 72%, rgba(255,255,255,0) 100%)", opacity: 0, visibility: "hidden" });
      buildEmail(ctx);
      buildRows(ctx);
      buildHero(ctx);
      buildChips(ctx);
    },
    render(t, ctx) {
      renderSweep(t, ctx);
      renderScreen(t);
      renderEmail(t);
      renderRows(t);
      renderHero(t);
      renderChips(t);
    },
  });
})();
