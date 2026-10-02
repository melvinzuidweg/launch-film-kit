/*
 * Touch indicator: a phone app is driven by a finger, so we show a touch-dot (never a cursor).
 * Acts register taps with Film.tap({t, x, y, hold}) in phone logical coords, at the exact centre
 * of the control being tapped. Timeline per tap: appears t-0.32 .. presses at t .. releases at
 * t+hold .. gone 0.22 s after the release.
 *
 * One finger: when the next tap follows within GLIDE_GAP s of a release, the dot does not fade and
 * no second dot appears; the same dot glides to the next target (house curve, up to 0.22 s) and
 * presses there. So there is never more than one dot on screen.
 */
(function () {
  const { Film, Eng } = window;
  const { P, E, lerp } = Eng;
  const GLIDE_GAP = 0.6;
  let layer;
  const dots = [];
  let plan = null;

  // chain the taps once: for every tap, does the finger arrive by gliding from the previous one?
  function build() {
    const order = Film.taps.map((tp, i) => i).sort((a, b) => Film.taps[a].t - Film.taps[b].t);
    plan = Film.taps.map(() => ({ from: -1, glide: null, handoff: Infinity }));
    for (let k = 1; k < order.length; k++) {
      const i = order[k], j = order[k - 1];
      const cur = Film.taps[i], prev = Film.taps[j];
      const rel = prev.t + Math.max(0, prev.hold || 0);
      if (cur.t - rel >= GLIDE_GAP) continue;
      const end = cur.t - 0.07;
      const start = Math.max(rel + 0.1, end - 0.22);
      if (end - start < 0.06) continue;
      plan[i] = { from: j, glide: [start, end - start], handoff: Infinity };
      plan[j].handoff = start;
    }
  }

  Film.register({
    id: "touch",
    order: 90,
    mount(ctx) {
      layer = Film.el("div", "abs", ctx.phone.screen, { left: 0, top: 0, width: ctx.PHONE.w + "px", height: ctx.PHONE.h + "px", zIndex: 80, pointerEvents: "none" });
    },
    render(t) {
      // lazily create one element pair per registered tap
      while (dots.length < Film.taps.length) {
        const ring = Film.el("div", "abs", layer, { width: "44px", height: "44px", marginLeft: "-22px", marginTop: "-22px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 0 0 1px rgba(19,20,23,0.25)", opacity: 0 });
        const dot = Film.el("div", "abs", layer, {
          width: "44px", height: "44px", marginLeft: "-22px", marginTop: "-22px", borderRadius: "50%",
          background: "rgba(150,152,160,0.42)", border: "2px solid rgba(255,255,255,0.92)",
          boxShadow: "0 4px 14px rgba(16,24,40,0.25), inset 0 0 0 1px rgba(19,20,23,0.12)", opacity: 0,
        });
        dots.push({ dot, ring });
      }
      if (!plan || plan.length !== Film.taps.length) build();

      Film.taps.forEach((tp, i) => {
        const { dot, ring } = dots[i];
        const pl = plan[i];
        const hold = tp.hold || 0;
        let x = tp.x, y = tp.y, appear;
        if (pl.glide) {
          const prev = Film.taps[pl.from];
          const g = P(t, pl.glide[0], pl.glide[1], E.house);
          x = lerp(prev.x, tp.x, g);
          y = lerp(prev.y, tp.y, g);
          appear = t >= pl.glide[0] ? 1 : 0;
        } else {
          appear = P(t, tp.t - 0.32, 0.26, E.out);
        }
        const gone = Number.isFinite(pl.handoff) ? (t >= pl.handoff ? 1 : 0) : P(t, tp.t + Math.max(0, hold) + 0.04, 0.18, E.house);
        const press = P(t, tp.t - 0.06, 0.08, E.out) * (1 - P(t, tp.t + hold, 0.12, E.out));
        const op = appear * (1 - gone);
        const s = (0.6 + 0.4 * appear) * (1 - 0.18 * press);
        dot.style.left = x.toFixed(2) + "px";
        dot.style.top = y.toFixed(2) + "px";
        dot.style.opacity = op.toFixed(3);
        dot.style.transform = `scale(${s.toFixed(4)})`;
        // ripple on press
        const r = P(t, tp.t, 0.5, E.out);
        ring.style.left = tp.x + "px";
        ring.style.top = tp.y + "px";
        ring.style.opacity = (r > 0 && r < 1 ? (1 - r) * 0.8 : 0).toFixed(3);
        ring.style.transform = `scale(${(1 + r * 1.2).toFixed(4)})`;
      });
    },
  });
})();
