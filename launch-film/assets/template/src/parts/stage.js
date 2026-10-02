/*
 * Stage: the light backdrop (white, a soft --stage-tint gradient rising from the floor, three
 * faint rings), the optional dark act (T.dark) and the "Example" label.
 *
 * Depth: the gradient and the rings are a far plane. They move 18 % as far as the world does on
 * screen, softly limited (tanh) to 3.25 % of the frame's long side, so a camera move reads as a
 * camera moving past a backdrop, not a card panned over wallpaper. The gradient layer extends
 * past the frame on every side by more than that limit, so no edge ever shows. The rings breathe
 * slowly, so a held frame is never frozen.
 *
 * Dark act (T.dark, optional): the dark comes in as a wide feathered vignette that deepens from
 * the frame edges toward the phone ("the lights go down"), never a hard iris (a hard circle was
 * the single biggest frame jump in the reference film and read as dated). A point at distance d
 * from the phone darkens over its own slice of the move (SPREAD), on a smoothstep, so the corners
 * go first and the phone last. The way back is the same in reverse (spreadOut).
 * Film.stageDark(t, x, y) gives the darkness 0..1 at any screen point: overlay colours read it.
 *
 * Example label: shown in T.exampleLabel while fictional content can be read. Its colour flips
 * between --label-ink (on light) and --on-dark-muted (on dark) against the stage under it.
 */
(function () {
  const { Film, Eng } = window;
  const { P, clamp, smooth } = Eng;

  let glow, rings, dark, label, ext = 0, panMax = 0, darkRGB = [11, 11, 11];
  const DEPTH = 0.18;               // backdrop pans 18 % as far as the world on screen, both axes
  const DEPTH_MAX = 0.0325;         // soft limit of that pan: 3.25 % of the frame's long side
  const DEPTH_Z = 0.03;             // and zooms with z^0.03
  const GLOW_EXT = 1.25;            // the gradient layer overhangs the frame by 1.25 x the pan limit + 8 px
  const spreadOf = (v, d) => (Number.isFinite(v) ? clamp(v, 0.05, 0.95) : d);

  // front of the dark at time t (screen px from the phone centre)
  function front(t) {
    const d = window.T.dark, L = Film.L;
    if (!d) return { s: 0 };
    const s = P(t, d.inStart, d.inDur) * (1 - P(t, d.outStart, d.outDur));
    const c = Film.phoneToScreen(196.5, 426, t);
    const far = Math.max(Math.hypot(c.x, c.y), Math.hypot(L.W - c.x, c.y), Math.hypot(c.x, L.H - c.y), Math.hypot(L.W - c.x, L.H - c.y));
    const SPREAD = t < d.outStart ? spreadOf(d.spread, 0.3) : spreadOf(d.spreadOut, 0.5);
    return { s, c, D: (far * (1 - s)) / SPREAD, F: (far * (1 - SPREAD)) / SPREAD };
  }
  Film.stageDark = function (t, x, y) {
    const f = front(t);
    if (f.s <= 0) return 0;
    if (f.s >= 1) return 1;
    return smooth((Math.hypot(x - f.c.x, y - f.c.y) - (f.D - f.F)) / f.F);
  };

  Film.register({
    id: "stage",
    order: 0,
    mount(ctx) {
      const { L } = ctx;
      const tint = Eng.hexToRgb(Film.tok("--stage-tint") || "#888888").join(",");
      darkRGB = Eng.hexToRgb(Film.tok("--stage-dark") || "#0b0b0b");
      Film.el("div", "abs", ctx.stage, { left: 0, top: 0, width: L.W + "px", height: L.H + "px", background: Film.tok("--surface") || "#fff" });
      panMax = DEPTH_MAX * Math.max(L.W, L.H);
      ext = Math.ceil(panMax * GLOW_EXT + 8);
      glow = Film.el("div", "abs", ctx.stage, {
        left: -ext + "px", top: -ext + "px", width: L.W + 2 * ext + "px", height: L.H + 2 * ext + "px", transformOrigin: "50% 100%",
        background: `linear-gradient(0deg, rgba(${tint},0.26) 0px, rgba(${tint},0.26) ${ext}px, rgba(${tint},0.07) ${Math.round(ext + 0.38 * L.H)}px, rgba(255,255,255,0) ${Math.round(ext + 0.7 * L.H)}px)`,
      });
      rings = Film.el("div", "abs", ctx.stage, { left: 0, top: 0, width: L.W + "px", height: L.H + "px" });
      const cx = L.W / 2, cy = L.H * 1.08;
      [0.42, 0.62, 0.84].forEach((r, i) => {
        const d = Math.max(L.W, L.H) * r * 2;
        Film.el("div", "abs", rings, {
          left: cx - d / 2 + "px", top: cy - d / 2 + "px", width: d + "px", height: d + "px", borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.55)", background: i === 0 ? "rgba(255,255,255,0.10)" : "transparent",
        });
      });
      dark = Film.el("div", "abs", ctx.stage, { left: 0, top: 0, width: L.W + "px", height: L.H + "px", background: `rgb(${darkRGB.join(",")})`, visibility: "hidden" });

      // "Example" label: shown whenever fictional content can be read
      const IS45 = ctx.format === "45";
      label = Film.el("div", "label abs", ctx.top, {
        left: L.label.x + "px", top: L.label.y + "px", fontSize: (IS45 ? 28 : 30) + "px", letterSpacing: "0.14em", gap: "14px",
      });
      Film.el("span", "dot", label, { width: "10px", height: "10px" });
      Film.el("span", null, label, null, ctx.COPY.exampleLabel);
    },
    render(t, ctx) {
      const L = ctx.L;

      // ---- the dark: feathered vignette closing toward the phone ----------------------------
      const f = front(t);
      if (f.s <= 0) {
        dark.style.visibility = "hidden";
      } else {
        dark.style.visibility = "visible";
        const rgb = darkRGB.join(",");
        if (f.s >= 1) {
          dark.style.background = `rgb(${rgb})`;
        } else {
          // smoothstep falloff as 9 stops; stops before the centre fold into one at 0 px
          const r0 = f.D - f.F, stops = [];
          for (let i = 0; i <= 8; i++) {
            const p = r0 + (f.F * i) / 8;
            if (p < 0) continue;
            if (!stops.length && i > 0) stops.push(`rgba(${rgb},${smooth(-r0 / f.F).toFixed(4)}) 0px`);
            stops.push(`rgba(${rgb},${smooth(i / 8).toFixed(4)}) ${p.toFixed(1)}px`);
          }
          if (!stops.length) stops.push(`rgba(${rgb},1) 0px`);
          dark.style.background = `radial-gradient(circle at ${f.c.x.toFixed(1)}px ${f.c.y.toFixed(1)}px, ${stops.join(", ")})`;
        }
      }

      // ---- depth: the backdrop as a far plane -------------------------------------------------
      const cam = Film.camera.at(t), c0 = L.cam0;
      const soft = (v) => panMax * Math.tanh(v / panMax);
      const px = soft(-(cam.cx - c0.cx) * cam.z * DEPTH);
      const py = soft(-(cam.cy - c0.cy) * cam.z * DEPTH);
      const pz = Math.pow(cam.z / c0.z, DEPTH_Z);
      glow.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) scale(${pz.toFixed(5)})`;
      const by = Math.sin(t * 0.35) * 6, bs = 1 + 0.012 * Math.sin(t * 0.21);
      rings.style.transform = `translate3d(${px.toFixed(2)}px, ${(py + by).toFixed(2)}px, 0) scale(${(bs * pz).toFixed(5)})`;

      // ---- example label -----------------------------------------------------------------------
      const [a, b] = ctx.T.exampleLabel || [0, 0];
      const v = Eng.win(t, a, b, 0.4, 0.4);
      label.style.opacity = v.toFixed(3);
      label.style.visibility = v > 0 ? "inherit" : "hidden";
      if (v <= 0) return;
      // darkness sampled across the label; the colour switches where light text reads better
      let k = 0;
      for (let i = 0; i <= 4; i++) k = Math.max(k, Film.stageDark(t, L.label.x + 40 + i * 70, L.label.y + 15));
      label.style.color = k > 0.55 ? Film.tok("--on-dark-muted") : Film.tok("--label-ink");
    },
  });
})();
