/*
 * Griffel launch film: deterministic motion engine.
 * Every value on screen is a pure function of film time t (seconds).
 * No timers, no requestAnimationFrame, no Date, no Math.random.
 */
(function (G) {
  "use strict";

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const invLerp = (a, b, v) => clamp((v - a) / (b - a));

  // cubic-bezier(x1,y1,x2,y2) as a function of u in [0,1]
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (s) => ((ax * s + bx) * s + cx) * s;
    const sy = (s) => ((ay * s + by) * s + cy) * s;
    const dsx = (s) => (3 * ax * s + 2 * bx) * s + cx;
    return function (u) {
      if (u <= 0) return 0;
      if (u >= 1) return 1;
      let s = u;
      for (let i = 0; i < 8; i++) {
        const err = sx(s) - u;
        const d = dsx(s);
        if (Math.abs(err) < 1e-7) break;
        if (Math.abs(d) < 1e-6) break;
        s -= err / d;
      }
      // bisection fallback for robustness
      if (Math.abs(sx(s) - u) > 1e-5) {
        let lo = 0, hi = 1;
        s = u;
        for (let i = 0; i < 30; i++) {
          const x = sx(s);
          if (Math.abs(x - u) < 1e-7) break;
          if (x < u) lo = s; else hi = s;
          s = (lo + hi) / 2;
        }
      }
      return sy(s);
    };
  }

  // House curve for every morph and camera move: cubic-bezier(.45,0,.15,1)
  const E = {
    house: bezier(0.45, 0, 0.15, 1),
    out: bezier(0.16, 1, 0.3, 1),
    in: bezier(0.7, 0, 0.84, 0),
    inOut: bezier(0.65, 0, 0.35, 1),
    soft: bezier(0.33, 0, 0.2, 1),
    linear: (u) => clamp(u),
  };

  // eased progress of a move that starts at `start` and lasts `dur`
  const P = (t, start, dur, ease = E.house) => ease(clamp((t - start) / dur));

  // window: 0 before a, ramps in over fadeIn, 1, ramps out over fadeOut before b
  function win(t, a, b, fadeIn = 0.3, fadeOut = 0.3, ease = E.house) {
    if (t <= a || t >= b) return 0;
    const i = fadeIn > 0 ? ease(clamp((t - a) / fadeIn)) : 1;
    const o = fadeOut > 0 ? ease(clamp((b - t) / fadeOut)) : 1;
    return Math.min(i, o);
  }

  // Closed-form damped spring, 0 -> 1. Default is nearly critically damped
  // (zeta 0.9): mass and settle, overshoot well under 1 %. Nuchter, not bouncy.
  function spring(tau, f = 2.2, z = 0.9) {
    if (tau <= 0) return 0;
    const w = 2 * Math.PI * f;
    if (z >= 1) {
      return 1 - Math.exp(-w * tau) * (1 + w * tau);
    }
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + ((z * w) / wd) * Math.sin(wd * tau));
  }

  // value with several target changes, one spring per change, summed
  function S(t, base, changes, f, z) {
    let v = base, prev = base;
    for (const [t0, to] of changes) {
      v += (to - prev) * spring(t - t0, f, z);
      prev = to;
    }
    return v;
  }

  // log-space interpolation for camera zoom (constant perceived speed)
  const zoomLerp = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));

  // deterministic hash noise
  function hash(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }
  function noise1(x) {
    const i = Math.floor(x), f = x - i;
    const u = f * f * (3 - 2 * f);
    return lerp(hash(i), hash(i + 1), u);
  }

  // colour helpers
  function hexToRgb(h) {
    const n = parseInt(h.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mixHex(a, b, u) {
    const A = hexToRgb(a), B = hexToRgb(b);
    const c = A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  // text reveal: how many characters of `str` are typed at time t
  function typed(str, t, start, cps = 28) {
    const n = Math.floor(clamp((t - start) * cps, 0, str.length));
    return str.slice(0, n);
  }

  G.Eng = { clamp, lerp, invLerp, bezier, E, P, win, spring, S, zoomLerp, hash, noise1, hexToRgb, mixHex, typed };
})(window);
