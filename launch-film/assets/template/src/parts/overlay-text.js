/*
 * Overlay type (screen space): the cards in the text box ctx.L.text. Data-driven: every key that
 * exists in both COPY.cards (the words) and T.O (the times) becomes a card.
 *
 *   chapter    COPY.cards.x = { kind: "chapter", word: "Assign.", sub: ["line", ...] }
 *              T.O.x        = { in, sub: [t, ...], out, exit? }
 *              A one-word headline (Inter 700, tight tracking) and optional sub lines under it.
 *   statement  COPY.cards.x = { kind: "statement", lines: ["line", ...], em: [index, ...] }
 *              T.O.x        = { in, lines: [t, ...], out, exit? }
 *              Lines at statement size; lines listed in `em` are set in --brand-ink.
 *
 * Words rise one by one on the house curve; a card leaves as ONE block (Film.type), starting at
 * `out` and gone by out + 0.25 (or out + exit, at most 0.3). Never two cards at once: each
 * card's goneAt <= the next card's `in`. Lines stack in normal flow (a column), so a line that
 * wraps pushes the next one down instead of overlapping it.
 * Colour follows the stage under each card: ink on light, white on the dark act.
 */
(function () {
  const { Film, Eng } = window;
  const { mixHex } = Eng;
  const cards = [];   // { key, kind, blocks: [{ block, role, tIn }], out, exit, probe }

  Film.register({
    id: "overlay-text",
    order: 80,
    mount(ctx) {
      const { L, COPY, T, overlay } = ctx;
      const C = COPY.cards || {}, O = T.O || {};
      for (const key of Object.keys(C)) {
        const c = C[key], o = O[key];
        if (!o) continue;
        const box = Film.el("div", null, overlay, {
          position: "absolute", left: L.text.x + "px", top: L.text.y + "px", width: L.text.w + "px",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
        });
        const card = { key, kind: c.kind, blocks: [], out: o.out ?? Infinity, exit: o.exit, probe: { x: L.text.x + 160, y: L.text.y + 40 } };
        if (c.kind === "statement") {
          const em = new Set(c.em || []);
          (c.lines || []).forEach((line, i) => {
            const b = Film.type.make(box, line, null, {
              position: "relative", fontSize: L.stmtSize + "px", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: "1.08", textWrap: "balance",
            });
            const tIn = (o.lines && o.lines[i] !== undefined) ? o.lines[i] : o.in + 0.25 * i;
            card.blocks.push({ block: b, role: em.has(i) ? "em" : "head", tIn });
          });
        } else {
          const w = Film.type.make(box, c.word, null, { position: "relative", fontSize: L.wordSize + "px", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: "1.02" });
          card.blocks.push({ block: w, role: "head", tIn: o.in });
          (c.sub || []).forEach((line, i) => {
            const b = Film.type.make(box, line, null, {
              position: "relative", fontSize: L.subSize + "px", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: "1.25",
              marginTop: (i === 0 ? Math.round(L.wordSize * 0.2) : 4) + "px", textWrap: "balance", maxWidth: Math.min(L.text.w, 720) + "px",
            });
            const tIn = (o.sub && o.sub[i] !== undefined) ? o.sub[i] : o.in + 0.35 + 0.3 * i;
            card.blocks.push({ block: b, role: "sub", tIn });
          });
        }
        cards.push(card);
      }
    },
    render(t, ctx) {
      const ink = Film.tok("--ink"), body = Film.tok("--body"), onDark = Film.tok("--on-dark"), onDarkMuted = Film.tok("--on-dark-muted");
      const brandInk = Film.tok("--brand-ink"), brandOnDark = Film.tok("--brand-on-dark");
      for (const card of cards) {
        const ro = card.exit !== undefined ? { exitDur: card.exit } : {};
        const k = Film.stageDark ? Film.stageDark(t, card.probe.x, card.probe.y) : 0;
        for (const { block, role, tIn } of card.blocks) {
          Film.type.render(block, t, tIn, card.out, Object.assign({ stagger: card.kind === "statement" ? 0.05 : 0.06 }, ro));
          if (block.el.style.visibility === "hidden") continue;
          block.el.style.color = role === "sub" ? mixHex(body, onDarkMuted, k) : role === "em" ? mixHex(brandInk, brandOnDark, k) : mixHex(ink, onDark, k);
        }
      }
      // a reading hold should never be a frozen frame: a gentle drift on the whole overlay
      ctx.overlay.style.transform = `translate3d(0, ${(Math.sin(t * 0.6) * 2).toFixed(2)}px, 0)`;
    },
  });
})();
