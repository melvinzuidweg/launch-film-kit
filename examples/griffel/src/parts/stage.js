/*
 * Stage: the light "website" backdrop (white, brand-green rising from the bottom, soft rings)
 * and the dark recording act (#0B0B0B). Light -> dark -> light on the house curve.
 *
 * The dark is a wide vignette that deepens from the frame edges toward the phone: the lights go
 * down around the phone, not a hard-edged circle. A point at distance d from the phone (q = d/far,
 * far = the farthest frame corner) darkens over s in [SPREAD*(1-q), SPREAD*(1-q) + 1-SPREAD] on a
 * smoothstep, s being the house-curve progress of T.dark. So the corners start at u = 0 (visible
 * from the first frame, no pop), the falloff is wider than the frame diagonal (no edge), the text
 * column is dark first and the bars that land in the phone keep a light stage until they are in.
 * SPREAD is T.dark.spread on the way in (0.3: a slow, even dimming over ~1 s) and T.dark.spreadOut
 * on the way back.
 * The way back (T.dark.out*) is the same in reverse; act B draws its own light front over it.
 * Film.stageDark(t, x, y) gives the darkness at any screen point (overlay colours read it).
 *
 * Depth (final polish): the gradient and the rings are a far plane. They move 18 % as far as the
 * world does on screen, on both axes, softly limited (tanh) to 3.25 % of the frame's long side, so
 * the take reads as a camera moving past a backdrop, not a flat card panned over wallpaper. The
 * gradient layer extends past the frame on every side by more than that limit (no edge can show).
 * The dark vignette stays screen-based.
 *
 * VOORBEELD label: #4B5563 on the light stage, #9C9C9C on the dark act. While the stage under it
 * changes, the colour is chosen against the local stage luminance (sampled across the label), not
 * blended: it darkens toward ink while the stage is light, switches to light grey (white at the
 * switch itself) where light text reads better (~19 % luminance), then relaxes to #9C9C9C. The
 * model keeps >= 3.6:1; measured on rendered frames it is >= 3.1:1 on the worst pixel.
 */
(function () {
  const { Film, Eng } = window;
  const { P, clamp } = Eng;

  let glow, rings, dark, vb, ext = 0, panMax = 0;
  const IS45 = Film.format === "45";
  // 0 = global fade, 1 = hard front. T.dark.spread (in, default 0.3): each point darkens over 70 %
  // of the move, so the lights go down slowly and evenly (no iris, no flash ring around the phone).
  // T.dark.spreadOut (way back, default 0.5) keeps the front act B's light sweep was built on.
  const spreadOf = (v, d) => (Number.isFinite(v) ? clamp(v, 0.05, 0.95) : d);
  const DEPTH = 0.18;               // backdrop pans 18 % as far as the world on screen, both axes
  const DEPTH_MAX = 0.0325;         // soft limit of that pan: 3.25 % of the frame's long side
  const DEPTH_Z = 0.03;             // and zooms with z^0.03 (<= ~2.5 % at the film's closest framing)
  // the gradient layer extends past the frame on all four sides by more than the pan limit
  // (+25 % + 8 px for the z^0.03 scale), so no edge of it is ever on screen
  const GLOW_EXT = 1.25;            // x the pan limit, + 8 px
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

  // ---- VOORBEELD label colour against the local stage -------------------------------------
  const LBL = { light: "#4b5563", ink: "#131417", dark: "#9c9c9c", white: "#ffffff", C: 3.6 };
  const GREEN = [26, 186, 109], STAGE_DARK = [11, 11, 11];
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const mixRGB = (A, B, u) => A.map((v, i) => Math.round(v + (B[i] - v) * clamp(u)));
  // the least move from `from` toward `to` that reaches contrast C against bg luminance Lb
  // (luminance is monotonic along both mixes); returns the colour and the contrast it gets
  function reach(from, to, Lb, C) {
    if (ratio(lum(from), Lb) >= C) return { c: from, r: ratio(lum(from), Lb) };
    if (ratio(lum(to), Lb) < C) return { c: to, r: ratio(lum(to), Lb) };
    let lo = 0, hi = 1;
    for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (ratio(lum(mixRGB(from, to, m)), Lb) >= C) hi = m; else lo = m; }
    const c = mixRGB(from, to, hi);
    return { c, r: ratio(lum(c), Lb) };
  }

  // front of the dark at time t: dark for d >= D, light for d <= D - F (screen px from c)
  function front(t) {
    const T = window.T, d = T.dark, L = Film.L;
    const s = P(t, d.inStart, d.inDur) * (1 - P(t, d.outStart, d.outDur));
    const c = Film.phoneToScreen(196.5, 426, t);
    const far = Math.max(Math.hypot(c.x, c.y), Math.hypot(L.W - c.x, c.y), Math.hypot(c.x, L.H - c.y), Math.hypot(L.W - c.x, L.H - c.y));
    // the in and out moves never overlap (in ends at inStart + inDur <= outStart)
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
      Film.el("div", "abs", ctx.stage, { left: 0, top: 0, width: L.W + "px", height: L.H + "px", background: "#ffffff" });
      // same look as before inside the frame; the extra `ext` px on every side is for the parallax
      panMax = DEPTH_MAX * Math.max(L.W, L.H);
      ext = Math.ceil(panMax * GLOW_EXT + 8);
      glow = Film.el("div", "abs", ctx.stage, {
        left: -ext + "px", top: -ext + "px", width: L.W + 2 * ext + "px", height: L.H + 2 * ext + "px", transformOrigin: "50% 100%",
        background: `linear-gradient(0deg, rgba(26,186,109,0.30) 0px, rgba(26,186,109,0.30) ${ext}px, rgba(26,186,109,0.08) ${Math.round(ext + 0.38 * L.H)}px, rgba(255,255,255,0) ${Math.round(ext + 0.7 * L.H)}px)`,
      });
      // act E finds this element by its shape (3 round children): keep it that way
      rings = Film.el("div", "abs", ctx.stage, { left: 0, top: 0, width: L.W + "px", height: L.H + "px" });
      const cx = L.W / 2, cy = L.H * 1.08;
      [0.42, 0.62, 0.84].forEach((r, i) => {
        const d = Math.max(L.W, L.H) * r * 2;
        Film.el("div", "abs", rings, {
          left: cx - d / 2 + "px", top: cy - d / 2 + "px", width: d + "px", height: d + "px", borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.55)", background: i === 0 ? "rgba(255,255,255,0.10)" : "transparent",
        });
      });
      dark = Film.el("div", "abs", ctx.stage, { left: 0, top: 0, width: L.W + "px", height: L.H + "px", background: "#0b0b0b", visibility: "hidden" });

      // VOORBEELD label: shown whenever fictional meeting content can be read
      vb = Film.el("div", "label abs", ctx.top, {
        left: L.voorbeeld.x + "px", top: L.voorbeeld.y + "px", fontSize: (IS45 ? 28 : 30) + "px",
        letterSpacing: "0.14em", gap: "14px",
      });
      Film.el("span", "dot", vb, { width: "10px", height: "10px" });
      Film.el("span", null, vb, null, ctx.COPY.voorbeeld);
    },
    render(t, ctx) {
      const L = ctx.L;

      // ---- the dark: feathered vignette closing toward the phone --------------------------
      const f = front(t);
      if (f.s <= 0) {
        dark.style.visibility = "hidden";
      } else {
        dark.style.visibility = "visible";
        if (f.s >= 1) {
          dark.style.background = "#0b0b0b";
        } else {
          // smoothstep falloff as 9 stops; stops before the centre are folded into one at 0 px
          const r0 = f.D - f.F, stops = [];
          for (let i = 0; i <= 8; i++) {
            const p = r0 + (f.F * i) / 8;
            if (p < 0) continue;
            if (!stops.length && i > 0) stops.push(`rgba(11,11,11,${smooth(-r0 / f.F).toFixed(4)}) 0px`);
            stops.push(`rgba(11,11,11,${smooth(i / 8).toFixed(4)}) ${p.toFixed(1)}px`);
          }
          if (!stops.length) stops.push("rgba(11,11,11,1) 0px");
          dark.style.background = `radial-gradient(circle at ${f.c.x.toFixed(1)}px ${f.c.y.toFixed(1)}px, ${stops.join(", ")})`;
        }
      }

      // ---- depth: the backdrop as a far plane --------------------------------------------
      // the world's on-screen motion away from rest (the rest frame's centre point), x DEPTH,
      // softly limited to panMax (tanh: no dead stop when a big move runs into the limit)
      const cam = Film.camera.at(t), c0 = L.cam0;
      const soft = (v) => panMax * Math.tanh(v / panMax);
      const px = soft(-(cam.cx - c0.cx) * cam.z * DEPTH);
      const py = soft(-(cam.cy - c0.cy) * cam.z * DEPTH);
      const pz = Math.pow(cam.z / c0.z, DEPTH_Z);
      glow.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) scale(${pz.toFixed(5)})`;
      // slow breathing of the rings so the backdrop is never frozen
      const by = Math.sin(t * 0.35) * 6, bs = 1 + 0.012 * Math.sin(t * 0.21);
      rings.style.transform = `translate3d(${px.toFixed(2)}px, ${(py + by).toFixed(2)}px, 0) scale(${(bs * pz).toFixed(5)})`;

      // ---- VOORBEELD label ---------------------------------------------------------------
      const [a, b] = ctx.T.voorbeeld;
      const v = Eng.win(t, a, b, 0.4, 0.4);
      vb.style.opacity = v.toFixed(3);
      if (v <= 0) return;
      // #4B5563 on light (>= 4.5:1 on the gradient), #9C9C9C on the dark act. In between, the
      // colour is chosen against the stage actually under the label: its luminance is sampled
      // across the label box (the vignette is not even across it), from the light stage colour
      // (white + the green gradient at that height, with its parallax) and Film.stageDark (which
      // act B answers from its own light front while that is on).
      const fs = IS45 ? 28 : 30, x0 = L.voorbeeld.x + 24, w = 12.9 * fs, y0 = L.voorbeeld.y;
      const glowA = (y) => {
        const d = (L.H + ext + py - y) / pz - ext, H = L.H;   // px above the frame bottom (in the layer)
        if (d <= 0) return 0.30;
        if (d <= 0.38 * H) return 0.30 - 0.22 * (d / (0.38 * H));
        if (d <= 0.7 * H) return 0.08 * (1 - (d - 0.38 * H) / (0.32 * H));
        return 0;
      };
      let lo = 1, hi = 0;
      for (const yy of [y0 + 0.15 * fs, y0 + fs]) {
        const light = mixRGB([255, 255, 255], GREEN, glowA(yy));
        for (let i = 0; i <= 5; i++) {
          const xx = x0 + (w * i) / 5;
          const Lb = lum(mixRGB(light, STAGE_DARK, Film.stageDark(t, xx, yy)));
          lo = Math.min(lo, Lb); hi = Math.max(hi, Lb);
        }
      }
      // dark text is judged against the darkest stage under the label, light text against the
      // lightest; the side with the better best case wins (it flips once per change, at ~19 %)
      const hx = Eng.hexToRgb;
      const dk = reach(hx(LBL.light), hx(LBL.ink), lo, LBL.C);
      const lt = reach(hx(LBL.dark), hx(LBL.white), hi, LBL.C);
      const useDark = ratio(lum(hx(LBL.ink)), lo) >= ratio(lum(hx(LBL.white)), hi);
      const c = useDark ? dk.c : lt.c;
      vb.style.color = `rgb(${c[0]},${c[1]},${c[2]})`;
    },
  });
})();
