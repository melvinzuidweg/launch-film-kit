/*
 * Overlay type (screen space): chapter cards, the climax line, the context line and the
 * trust line. Inter 700, tight tracking, few words per card, masked word-by-word rise in,
 * and an exit that moves each block as one unit (Film.type: gone by out + 0.3).
 * Colour follows the stage under each block (ink on light, white on the dark act).
 *
 * Cards in order (times in T.O; never two cards in the text box at once):
 *   ch1     "Opnemen." + "Leg je telefoon op tafel." / "Griffel vraagt daarna door." (F2; fix 5:
 *           the promise is a white 700 emphasis line, 60/48 px; both subs leave at 6.0, captions own 6-9.6)
 *   ch2a    "Echte namen." + "Geen Spreker 1."            (speaker naming, F3)
 *   ch2     "Doorvragen." + "Iets onduidelijk? / Griffel vraagt het eerst aan jou." (F2; fix 5: 48/40 px)
 *   climax  "Griffel raadt niet." / "Griffel vraagt." (one block, green gradient)
 *   context "Voeg een agenda of offerte toe." / "Griffel gebruikt die ..." (footnote size, F7)
 *   ch3     "Notulen." alone; later "Besluiten en actiepunten / in de inbox van wie jij kiest." alone,
 *           as a 700 statement at the largest size that keeps each line on one line in the box (F4)
 *   trust   "Verstuurd is verwijderd." / "Binnen enkele seconden gewist." (F5, F6)
 *
 * Film-only legibility setting: Inter cv08 (capital I with serifs) on these blocks, so
 * "Iets" never reads as "lets". Never on the app UI, which stays verbatim.
 */
(function () {
  const { Film, Eng } = window;
  const { mixHex, clamp } = Eng;
  const blocks = {};
  const probe = {};        // per block: screen point where the stage colour is sampled
  const IS45 = Film.format === "45";
  const FEAT = "'cv08' 1";

  function wordStyle(L) {
    return { position: "absolute", left: L.text.x + "px", width: L.text.w + "px", fontSize: L.wordSize + "px", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: "1.02", fontFeatureSettings: FEAT };
  }
  function subStyle(L, size, weight = 500, width) {
    const w = width || (IS45 ? L.text.w : Math.min(L.text.w, 660));
    return { position: "absolute", left: L.text.x + "px", width: w + "px", fontSize: (size || L.subSize) + "px", fontWeight: weight, letterSpacing: "-0.02em", lineHeight: "1.22", textWrap: "balance", fontFeatureSettings: FEAT };
  }
  function stmtStyle(L) {
    const s = IS45 ? 60 : 68;
    return { position: "absolute", left: L.text.x + "px", width: L.text.w + "px", fontSize: s + "px", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: "1.06", textWrap: "balance", fontFeatureSettings: FEAT };
  }

  Film.register({
    id: "overlay-text",
    order: 80,
    mount(ctx) {
      const { L, COPY: C, overlay } = ctx;
      const y0 = L.text.y;
      const subY = y0 + L.wordSize * 1.18 + 10;
      const mk = (key, text, style, opts) => {
        blocks[key] = Film.type.make(overlay, text, null, style, opts);
        probe[key] = { x: L.text.x + 160, y: parseFloat(style.top) + parseFloat(style.fontSize) * 0.55 };
        return blocks[key];
      };

      mk("ch1", C.ch1.word, Object.assign(wordStyle(L), { top: y0 + "px" }));
      mk("ch1s", C.ch1.sub[0], Object.assign(subStyle(L), { top: subY + "px" }));
      // the promise (F2, fix 5): headline weight (700, white on the dark stage) at an emphasis size
      // between the sub and the headline, one line under the grey instruction. 60 px in 16:9
      // (722 px wide, ends x ~892, far left of the phone); 48 px in 4:5 (578 px; its "g" descender
      // ends ~y 321, 50 px above the caption box at 372)
      const ps = IS45 ? 48 : 60;
      mk("ch1s1", C.ch1.sub[1], { position: "absolute", left: L.text.x + "px", top: subY + L.subSize * 1.22 + (IS45 ? 6 : 8) + "px", fontSize: ps + "px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: "1.1", whiteSpace: "nowrap", fontFeatureSettings: FEAT });

      mk("ch2a", C.ch2a.word, Object.assign(wordStyle(L), { top: y0 + "px" }));
      mk("ch2as", C.ch2a.sub[0], Object.assign(subStyle(L), { top: subY + "px" }));

      mk("ch2", C.ch2.word, Object.assign(wordStyle(L), { top: y0 + "px" }));
      // fix 5: the doorvragen promise is set larger than the sub size: 48 px in 16:9 (the second
      // line is 678 px, one line, ends x ~848, clear of the phone's left edge at ~933 and ~90 px
      // above the returning caption at ~651); 40 px in 4:5, 4 px higher and a little tighter
      // (glyphs end ~y 308, ~32 px above the returning caption's first glyphs at ~340)
      const s2 = IS45 ? 40 : 48, s2y = IS45 ? subY - 4 : subY;
      mk("ch2s0", C.ch2.sub[0], Object.assign(subStyle(L, s2, 500, L.text.w), { top: s2y + "px", whiteSpace: "nowrap" }));
      mk("ch2s1", C.ch2.sub[1], Object.assign(subStyle(L, s2, 500, L.text.w), { top: s2y + s2 * (IS45 ? 1.24 : 1.3) + "px", whiteSpace: "nowrap" }));

      const cs = IS45 ? 92 : 96;
      mk("climaxA", C.climax.a, Object.assign(wordStyle(L), { top: y0 + "px", fontSize: cs + "px", width: L.text.w + 120 + "px" }));
      // "Griffel vraagt." rises as one block with one gradient fill
      mk("climaxB", C.climax.b, Object.assign(wordStyle(L), { top: y0 + cs * 1.1 + "px", fontSize: cs + "px", width: L.text.w + 120 + "px" }), { whole: true });
      blocks.climaxB.words.forEach((w) => w.inner.classList.add("hl-green-dark"));

      // context: a footnote between the thesis and the payoff, at sub size (not a headline)
      const fs = IS45 ? 38 : 42;
      mk("ctxA", C.context.a, Object.assign(subStyle(L, fs, 600, IS45 ? L.text.w : 720), { top: y0 + "px" }));
      mk("ctxB", C.context.b, Object.assign(subStyle(L, fs, 600, IS45 ? L.text.w : 720), { top: y0 + fs * 1.22 + 6 + "px" }));

      mk("ch3", C.ch3.word, Object.assign(wordStyle(L), { top: y0 + "px" }));
      // the ch3 sub comes back alone (after the payoff), one 700 statement over two lines at the
      // largest size that keeps each line on one line in the text box. Measured with Inter 700,
      // -0.03em, cv08: "in de inbox van wie jij kiest." is 12.37 x the font size wide, so 62 px is
      // 767 px of the 780 px box (16:9) and 72 px is 891 of 912 (4:5). Constants, not measured at
      // mount, so the layout never depends on when the font finished loading.
      const s3 = IS45 ? 72 : 62, lh3 = 1.08;
      const st3 = () => ({ position: "absolute", left: L.text.x + "px", width: L.text.w + "px", fontSize: s3 + "px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: String(lh3), whiteSpace: "nowrap", fontFeatureSettings: FEAT });
      mk("ch3s0", C.ch3.sub[0], Object.assign(st3(), { top: y0 + "px" }));
      mk("ch3s1", C.ch3.sub[1], Object.assign(st3(), { top: y0 + s3 * lh3 + "px" }));

      const st = stmtStyle(L);
      const stSize = parseFloat(st.fontSize);
      mk("trA", C.trust.a, Object.assign({}, st, { top: y0 + "px" }));
      mk("trB", C.trust.b, Object.assign(subStyle(L), { top: y0 + stSize * 2.2 + 18 + "px" }));

      // gradient class for "Griffel vraagt." (dark end of the website gradient: >= 4.5:1 on white)
      const style = document.createElement("style");
      style.textContent = ".hl-green-dark{background:linear-gradient(180deg,#159a5a 0%,#12804b 55%,#0f6e40 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}";
      document.head.appendChild(style);
    },
    render(t, ctx) {
      const O = ctx.T.O;
      const R = (key, a, b, o) => Film.type.render(blocks[key], t, a, b, o);

      // ch1.sub: [instruction, promise] rise times (a bare number = the instruction only, promise +0.3)
      const s1 = Array.isArray(O.ch1.sub) ? O.ch1.sub : [O.ch1.sub, O.ch1.sub + 0.3];
      R("ch1", O.ch1.in, O.ch1.out); R("ch1s", s1[0], O.ch1.subOut); R("ch1s1", s1[1], O.ch1.subOut);

      R("ch2a", O.ch2a.in, O.ch2a.out); R("ch2as", O.ch2a.sub, O.ch2a.out);

      // "Doorvragen." in with the questions push; the subs only after the in-app question has
      // built (no two word-by-word builds at once); a hard exit before the climax rises
      const x2 = { exitDur: O.ch2.exit };
      R("ch2", O.ch2.in, O.ch2.out, x2);
      R("ch2s0", O.ch2.sub[0], O.ch2.out, x2); R("ch2s1", O.ch2.sub[1], O.ch2.out, x2);

      R("climaxA", O.climax.a, O.climax.out, { stagger: 0.05, dur: 0.5 });
      R("climaxB", O.climax.b, O.climax.out, { dur: 0.5 });

      R("ctxA", O.context.a, O.context.out, { stagger: 0.04, dur: 0.5 });
      R("ctxB", O.context.b, O.context.out, { stagger: 0.04, dur: 0.5 });

      R("ch3", O.ch3.in, O.ch3.out);
      R("ch3s0", O.ch3.sub[0], O.ch3.subOut, { stagger: 0.05 }); R("ch3s1", O.ch3.sub[1], O.ch3.subOut, { stagger: 0.05 });

      R("trA", O.trust.a, O.trust.out); R("trB", O.trust.b, O.trust.out);

      // statement subtitles sit under the measured statement height (1 or 2 lines)
      const gap = IS45 ? 20 : 24;
      blocks.trB.el.style.top = ctx.L.text.y + blocks.trA.el.offsetHeight + gap + "px";
      blocks.ctxB.el.style.top = ctx.L.text.y + blocks.ctxA.el.offsetHeight + (IS45 ? 4 : 6) + "px";

      // colour follows the stage under each block (the dark comes in as a vignette)
      for (const key in blocks) {
        if (key === "climaxB") continue;
        const b = blocks[key];
        if (b.el.style.visibility === "hidden") continue;
        const k = Film.stageDark ? Film.stageDark(t, probe[key].x, probe[key].y) : 0;
        const isSub = key !== "ch1" && key !== "ch2a" && key !== "ch2" && key !== "ch3" && key !== "climaxA" && key !== "trA"
          && key !== "ctxA" && key !== "ch3s0" && key !== "ch3s1" && key !== "ch1s1";
        b.el.style.color = isSub ? mixHex("#3f454d", "#b8bdc4", k) : mixHex("#131417", "#ffffff", k);
      }
      // a reading hold should never be a frozen frame: gentle drift on the whole overlay
      ctx.overlay.style.transform = `translate3d(0, ${(Math.sin(t * 0.6) * 2).toFixed(2)}px, 0)`;
    },
  });
})();
