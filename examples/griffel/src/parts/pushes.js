/*
 * iOS-style push notification banners inside the phone screen. Registered by the act parts:
 *   Film.push({ t, dur, title, body, tapAt })
 * The banner slides down from under the island, holds, and leaves upward at t+dur.
 * Copy must be the real push copy from workers/meeting-pipeline/src/workflowPushCopy.ts.
 */
(function () {
  const { Film, Eng } = window;
  const { P, E } = Eng;
  let layer, markSvg;
  const items = [];

  function banner(p, ctx) {
    const el = Film.el("div", "abs", layer, {
      left: "10px", top: "0px", width: ctx.PHONE.w - 20 + "px", padding: "13px 14px", borderRadius: "22px",
      background: "rgba(246,246,248,0.97)", boxShadow: "0 12px 30px -8px rgba(16,24,40,0.30), 0 2px 6px rgba(16,24,40,0.10)",
      display: "flex", gap: "11px", alignItems: "flex-start", opacity: 0,
    });
    const icon = Film.el("div", null, el, { width: "38px", height: "38px", flex: "0 0 38px", borderRadius: "9px", background: "#fff", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" });
    icon.innerHTML = markSvg;
    const col = Film.el("div", null, el, { flex: "1", minWidth: 0 });
    const row = Film.el("div", null, col, { display: "flex", justifyContent: "space-between", alignItems: "baseline" });
    Film.el("div", null, row, { fontSize: "15px", fontWeight: 600, color: "#131417", letterSpacing: "-0.01em" }, p.title);
    Film.el("div", null, row, { fontSize: "13px", color: "#8a8f98", flex: "0 0 auto", marginLeft: "8px" }, "nu");
    Film.el("div", null, col, { fontSize: "15px", lineHeight: "20px", color: "#3f454d", marginTop: "2px" }, p.body);
    return el;
  }

  Film.register({
    id: "pushes",
    order: 85,
    mount(ctx) {
      layer = Film.el("div", "abs", ctx.phone.screen, { left: 0, top: 0, width: ctx.PHONE.w + "px", height: ctx.PHONE.h + "px", zIndex: 60, pointerEvents: "none" });
      markSvg = '<svg width="26" height="24" viewBox="' + window.MARK.viewBox + '"><g fill="#1aba6d">' + window.MARK.markInner + '</g></svg>';
    },
    render(t, ctx) {
      while (items.length < Film.pushes.length) items.push(banner(Film.pushes[items.length], ctx));
      Film.pushes.forEach((p, i) => {
        const el = items[i];
        const inU = P(t, p.t, 0.5, E.out);
        const exitDur = p.tapAt !== undefined ? 0.3 : 0.42;
        const outU = P(t, p.t + p.dur, exitDur, E.house);
        const outFade = P(t, p.t + p.dur, exitDur * 0.6, E.house);
        const tapPress = p.tapAt !== undefined ? P(t, p.tapAt - 0.05, 0.08, E.out) * (1 - P(t, p.tapAt + 0.1, 0.15)) : 0;
        const y = -130 + 186 * inU - 190 * outU;
        el.style.opacity = (Math.min(1, inU * 1.6) * (1 - outFade)).toFixed(3);
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${(1 - 0.03 * tapPress).toFixed(4)})`;
        el.style.visibility = t < p.t - 0.01 || outU >= 1 ? "hidden" : "visible";
      });
    },
  });
})();
