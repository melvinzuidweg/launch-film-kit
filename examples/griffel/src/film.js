/*
 * Griffel launch film: core.
 *
 * Coordinate systems
 *   screen  : output pixels (1920x1080 for 16:9, 1080x1350 for 4:5). Overlay text lives here.
 *   world   : camera space. The phone's centre is the world origin (0,0); 1 world px = 1 logical
 *             app px at zoom 1. The camera maps world -> screen.
 *   phone   : the app screen's logical coordinates, 0..393 x 0..852 (iPhone 15/16 logical size),
 *             top-left of the screen. Film.phoneToWorld() converts to world.
 *
 * Contract for parts (src/parts/*.js):
 *   Film.register({ id, order, mount(ctx), render(t, ctx) })
 *   - mount runs once and builds DOM inside ctx.stage / ctx.world / ctx.phone.screen / ctx.overlay.
 *   - render(t) must be a pure function of t: set every animated style from t, every frame.
 *   - lower order renders first; later parts may override earlier styles.
 *   - camera moves:   Film.camera.key(t, dur, {cx?, cy?, z?}, ease?)   (per format: check Film.format)
 *                     Overlapping keys blend (each key lerps from the state the earlier keys left).
 *   - camera hand-off: an act ENDS on Film.handoff("<XY>") (T.handoff, landed by its `t`) when a
 *                     hand-off to the next act is defined, and the next act STARTS from it;
 *                     otherwise it returns to the rest camera L.cam0 by the end of its window.
 *                     Defined: AB (10.0), BC (16.3), DE (38.0).
 *   - phone moves:    Film.phoneMotion.key(t, dur, {x?, y?, s?, r?}, ease?)
 *   - taps:           Film.tap({ t, x, y, hold? })            (phone logical coords)
 *   - pushes:         Film.push({ t, dur, title, body, tapAt? })
 *   - dark status bar: Film.darkScreen([from, to])
 *   - stage darkness:  Film.stageDark(t, x, y) -> 0 (light) .. 1 (dark) at a screen point (stage.js)
 *   - overlay type:    Film.type.make / Film.type.render(block, t, in, out, o). Entries rise word
 *                     by word; the exit moves the whole block as one unit, starts at `out` and is
 *                     gone by Film.type.goneAt(out) <= out + 0.3.
 *
 * Time scale (T.SCALE, src/timeline.js)
 *   film time   : what every part, every T value and render(t, ctx) uses. Unchanged by the scale.
 *   output time : the rendered video's clock = film time x T.SCALE (0 .. T.OUT_DURATION). The
 *                 runtime (GSAP proxy, hf-seek), window.__seek(t), the stills/capture tools and
 *                 the audio cues all speak output time; Film.render(tOut) converts with
 *                 T.toFilm (snapped to 1e-9 s, so output 24.2 is film 22.0 exactly).
 *   - Film.frameT(t): film time quantised to the 60 fps OUTPUT frame grid,
 *                     floor(t * SCALE * 60 + 1e-6) / 60 / SCALE. The final render captures 480 fps
 *                     and averages 8 subframes per 60 fps output frame, so ANY TEXT WHOSE VALUE
 *                     CHANGES (counters, timers, fast digits) must compute that value from
 *                     Film.frameT(t), never from t or floor(t * 60) / 60 (that is the film grid,
 *                     which no longer lines up with the output frames when SCALE != 1). Then all 8
 *                     subframes of one output frame show the same value and nothing smears.
 *   - window.__seekFilm(t) renders a film time (debug helper; the tools use __seek).
 */
(function (G) {
  "use strict";
  const { clamp, lerp, P, E, zoomLerp } = G.Eng;

  const FORMAT = G.FORMAT === "45" ? "45" : "169";
  const LAYOUTS = {
    "169": {
      W: 1920, H: 1080,
      cam0: { cx: -380, cy: 0, z: 1.0 },          // phone centre lands at x = 960 + 380 = 1340
      text: { x: 170, y: 300, w: 780 },            // overlay text block (top-left anchor)
      captions: { x: 170, y: 640, w: 780 },
      wordSize: 112, subSize: 40, capSize: 30,
      voorbeeld: { x: 170, y: 1000 },
    },
    "45": {
      W: 1080, H: 1350,
      cam0: { cx: 0, cy: -210, z: 0.86 },          // phone centre lands at y = 675 + 180 = 856
      text: { x: 84, y: 96, w: 912 },
      captions: { x: 84, y: 372, w: 912 },
      wordSize: 92, subSize: 36, capSize: 28,
      voorbeeld: { x: 84, y: 40 },
    },
  };
  const L = LAYOUTS[FORMAT];

  const PHONE = { w: 393, h: 852, bezel: 14, radius: 62, screenRadius: 50 };

  const parts = [];
  const camKeys = [];
  const phoneKeys = [];
  const taps = [];
  const pushes = [];
  const darkScreens = [];

  const Film = {
    format: FORMAT, L, PHONE, parts, taps, pushes,
    register(p) { parts.push(p); parts.sort((a, b) => (a.order || 50) - (b.order || 50)); },
    tap(o) { taps.push(Object.assign({ hold: 0 }, o)); },
    push(o) { pushes.push(o); },
    darkScreen(w) { darkScreens.push(w); },
    isDarkScreen(t) { return darkScreens.some(([a, b]) => t >= a && t < b); },
  };

  // ---- camera --------------------------------------------------------------
  Film.camera = {
    key(t, dur, to, ease = E.house) { camKeys.push({ t, dur, to, ease }); camKeys.sort((a, b) => a.t - b.t); },
    at(t) {
      let s = Object.assign({}, L.cam0);
      for (const k of camKeys) {
        const u = k.ease(clamp((t - k.t) / k.dur));
        if (u <= 0) continue;
        if (k.to.cx !== undefined) s.cx = lerp(s.cx, k.to.cx, u);
        if (k.to.cy !== undefined) s.cy = lerp(s.cy, k.to.cy, u);
        if (k.to.z !== undefined) s.z = zoomLerp(s.z, k.to.z, u);
      }
      return s;
    },
  };
  // shared camera framing between two acts (T.handoff), for this format
  Film.handoff = function (k) {
    const h = G.T.handoff && G.T.handoff[k];
    return h ? Object.assign({}, h[FORMAT]) : Object.assign({}, L.cam0);
  };
  Film.toScreen = function (wx, wy, t) {
    const c = Film.camera.at(t);
    return { x: (wx - c.cx) * c.z + L.W / 2, y: (wy - c.cy) * c.z + L.H / 2, z: c.z };
  };

  // ---- phone motion inside the world --------------------------------------
  Film.phoneMotion = {
    base: { x: 0, y: 0, s: 1, r: 0 },
    key(t, dur, to, ease = E.house) { phoneKeys.push({ t, dur, to, ease }); phoneKeys.sort((a, b) => a.t - b.t); },
    at(t) {
      let s = Object.assign({}, this.base);
      for (const k of phoneKeys) {
        const u = k.ease(clamp((t - k.t) / k.dur));
        if (u <= 0) continue;
        for (const p of ["x", "y", "s", "r"]) if (k.to[p] !== undefined) s[p] = p === "s" ? zoomLerp(s[p], k.to[p], u) : lerp(s[p], k.to[p], u);
      }
      return s;
    },
  };
  // phone logical point -> world point (accounts for phone motion at time t)
  Film.phoneToWorld = function (x, y, t = 0) {
    const m = Film.phoneMotion.at(t);
    const lx = (x - PHONE.w / 2) * m.s, ly = (y - PHONE.h / 2) * m.s;
    const cr = Math.cos((m.r * Math.PI) / 180), sr = Math.sin((m.r * Math.PI) / 180);
    return { x: m.x + lx * cr - ly * sr, y: m.y + lx * sr + ly * cr };
  };
  Film.phoneToScreen = function (x, y, t) {
    const w = Film.phoneToWorld(x, y, t);
    return Film.toScreen(w.x, w.y, t);
  };

  // ---- DOM helpers -----------------------------------------------------------
  Film.el = function (tag, cls, parent, style, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (style) Object.assign(e.style, style);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  Film.css = function (e, o) { for (const k in o) e.style[k] = o[k]; };

  // ---- kinetic type -----------------------------------------------------------
  // Split text into masked words. Returns { el, words: [{outer, inner, text}] }.
  Film.type = {
    // opts.whole: keep the text as one masked unit (it rises as one block, one gradient fill)
    make(parent, text, cls, style, opts = {}) {
      const el = Film.el("div", cls, parent, style);
      const words = [];
      const parts = opts.whole ? [String(text)] : String(text).split(/(\s+)/);
      for (const p of parts) {
        if (/^\s+$/.test(p)) { el.appendChild(document.createTextNode(" ")); continue; }
        if (!p) continue;
        const outer = Film.el("span", "wmask", el);
        const inner = Film.el("span", "w", outer, null, p);
        words.push({ outer, inner, text: p });
      }
      return { el, words };
    },
    // masked word-by-word rise in from tIn; optional exit at tOut. Pure function of t.
    // The exit moves the block as ONE unit (no dangling words): a short rise, a fade and at most
    // 4 px of blur on the house curve, over o.exitDur (default 0.25 s, never more than 0.3 s), so
    // the block is gone by goneAt(tOut). Styles on block.el are only touched when tOut is finite.
    EXIT: 0.25,
    GONE: 0.3,
    goneAt(tOut, o = {}) { return tOut + Math.min(o.exitDur ?? Film.type.EXIT, Film.type.GONE); },
    render(block, t, tIn, tOut = Infinity, o = {}) {
      const stagger = o.stagger ?? 0.06, dur = o.dur ?? 0.65;
      const exitDur = Math.min(o.exitDur ?? Film.type.EXIT, Film.type.GONE);
      block.words.forEach((w, i) => {
        const u = P(t, tIn + i * stagger, dur, E.house);
        w.inner.style.transform = `translate3d(0, ${((1 - u) * 105).toFixed(2)}%, 0)`;
        w.inner.style.opacity = clamp(u * 1.4).toFixed(3);
        w.inner.style.filter = "none";
      });
      if (Number.isFinite(tOut)) {
        const ex = P(t, tOut, exitDur, E.house);
        block.el.style.opacity = (1 - ex).toFixed(3);
        block.el.style.transform = ex > 0 ? `translate3d(0, ${(-0.12 * ex).toFixed(4)}em, 0)` : "none";
        block.el.style.filter = ex > 0.001 ? `blur(${(4 * ex).toFixed(2)}px)` : "none";
      }
      block.el.style.visibility = t < tIn - 0.01 || t > tOut + exitDur + 0.01 ? "hidden" : "visible";
    },
  };

  // ---- layers -----------------------------------------------------------------
  function buildLayers() {
    const root = document.getElementById("root");
    Object.assign(root.style, { width: L.W + "px", height: L.H + "px" });
    document.documentElement.style.width = document.body.style.width = L.W + "px";
    document.documentElement.style.height = document.body.style.height = L.H + "px";
    const stage = Film.el("div", "layer clip", root, { width: L.W + "px", height: L.H + "px", zIndex: 0 });
    const world = Film.el("div", "layer clip", root, { width: "0px", height: "0px", zIndex: 10, transformOrigin: "0 0" });
    const overlay = Film.el("div", "layer clip", root, { width: L.W + "px", height: L.H + "px", zIndex: 20, pointerEvents: "none" });
    const top = Film.el("div", "layer clip", root, { width: L.W + "px", height: L.H + "px", zIndex: 30, pointerEvents: "none" });
    for (const [i, e] of [stage, world, overlay, top].entries()) {
      e.setAttribute("data-start", "0");
      e.setAttribute("data-duration", String(G.T.OUT_DURATION));
      e.setAttribute("data-track-index", String(i));
    }
    return { root, stage, world, overlay, top };
  }

  let ctx = null;
  let mounted = false;
  function mountAll() {
    if (mounted) return;
    mounted = true;
    const layers = buildLayers();
    ctx = Object.assign({ Film, T: G.T, COPY: G.COPY, Eng: G.Eng, L, PHONE, format: FORMAT }, layers);
    Film.ctx = ctx;
    for (const p of parts) {
      try { p.mount && p.mount(ctx); }
      catch (err) { console.error("[film] mount failed:", p.id, err); p._broken = true; }
    }
  }

  // film time quantised to the 60 fps OUTPUT frame grid (see the header): use it for any text
  // whose value changes, so the 8 motion-blur subframes of one output frame agree
  Film.frameT = function (t) {
    const S = G.T.SCALE, F = G.T.OUT_FPS || 60;
    return Math.floor(t * S * F + 1e-6) / F / S;
  };

  let lastT = -1, lastOutT = -1;
  // tOut: OUTPUT time (0 .. T.OUT_DURATION). Parts render at film time tOut / T.SCALE.
  Film.render = function (tOut) {
    mountAll();
    tOut = Math.max(0, Math.min(G.T.OUT_DURATION, Number(tOut) || 0));
    const t = Math.max(0, Math.min(G.T.DURATION, G.T.toFilm(tOut)));
    lastOutT = tOut;
    lastT = t;
    const c = Film.camera.at(t);
    ctx.world.style.transform = `translate3d(${L.W / 2}px, ${L.H / 2}px, 0) scale(${c.z.toFixed(5)}) translate3d(${(-c.cx).toFixed(3)}px, ${(-c.cy).toFixed(3)}px, 0)`;
    for (const p of parts) {
      if (p._broken) continue;
      try { p.render && p.render(t, ctx); }
      catch (err) { console.error("[film] render failed:", p.id, t, err); }
    }
  };
  Film.lastT = () => lastT;          // film time of the last render
  Film.lastOutT = () => lastOutT;    // output time of the last render

  // ---- runtime hooks ------------------------------------------------------------
  // Everything here speaks OUTPUT time (film time x T.SCALE).
  // HyperFrames seeks the registered GSAP timeline; the proxy tween calls Film.render.
  // window.__seek(t) is used by tools/still.mjs and tools/capture_seq.mjs.
  // window.T_OFFSET (output seconds, default 0) shifts the time HyperFrames renders, never the
  // stills' __seek (kept for a multi-pass HyperFrames capture: a second pass from a copy of the
  // page with T_OFFSET = 1/480 s, interleaved into a 480 fps sequence).
  // Boot first writes the output length (T.OUT_DURATION) into the composition root's
  // data-duration, so every page that boots the film (index, portrait and any variant page built
  // from them) declares the scaled length to the HyperFrames runtime. Pages must NOT carry a
  // static data-duration on the root: HyperFrames' render planner uses a static value as-is and
  // only asks the page (window.__hf.duration = this length) when there is none.
  // Change T.DURATION / T.SCALE only before boot.
  Film.boot = function () {
    const OUT = G.T.OUT_DURATION;
    const root = document.getElementById("root");
    if (root) root.setAttribute("data-duration", String(OUT));
    mountAll();
    const OFF = Number.isFinite(Number(G.T_OFFSET)) ? Number(G.T_OFFSET) : 0;
    const proxy = { t: 0 };
    const tl = G.gsap.timeline({ paused: true });
    tl.to(proxy, { t: OUT, duration: OUT, ease: "none", onUpdate: () => Film.render(proxy.t + OFF) }, 0);
    G.__timelines = G.__timelines || {};
    G.__timelines["main"] = tl;
    G.addEventListener("hf-seek", (e) => Film.render(e.detail.time + OFF));
    G.__seek = (t) => { Film.render(t); return true; };
    G.__seekFilm = (t) => { Film.render(G.T.toOut(Number(t) || 0)); return true; };
    Film.render(0);
  };

  G.Film = Film;
})(window);
