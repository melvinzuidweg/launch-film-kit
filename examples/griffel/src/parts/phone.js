/*
 * Phone: CSS iPhone frame in the world, logical screen 393x852, status bar, dynamic island.
 * Screens are built by the act parts inside ctx.phone.screen (absolute, 393x852).
 * Z-order inside the screen: act screens 1-40, status bar 50, pushes 60, island 70, touch 80.
 */
(function () {
  const { Film, Eng } = window;

  let phone, frame, screen, status, statusTime, statusIcons, island, shadow;

  function icons(parent) {
    const g = Film.el("div", "abs", parent, { right: "30px", top: "20px", display: "flex", alignItems: "center", gap: "6px", height: "14px" });
    // signal
    const sig = Film.el("div", null, g, { display: "flex", alignItems: "flex-end", gap: "1.5px", height: "12px" });
    [4, 6, 8.5, 11].forEach((h) => Film.el("span", "sb", sig, { width: "3px", height: h + "px", borderRadius: "1px", display: "block" }));
    // wifi (three arcs approximated with a quarter-circle stack)
    const wifi = Film.el("div", null, g, { position: "relative", width: "16px", height: "12px" });
    wifi.innerHTML = '<svg width="16" height="12" viewBox="0 0 16 12"><path class="sbf" d="M8 11.2l2.3-2.6a3.3 3.3 0 0 0-4.6 0L8 11.2z"/><path class="sbs" fill="none" stroke-width="1.8" stroke-linecap="round" d="M3.6 6.1a6.2 6.2 0 0 1 8.8 0"/><path class="sbs" fill="none" stroke-width="1.8" stroke-linecap="round" d="M1.1 3.4a9.8 9.8 0 0 1 13.8 0"/></svg>';
    // battery
    const bat = Film.el("div", null, g, { position: "relative", width: "27px", height: "13px", borderRadius: "4px", border: "1px solid", boxSizing: "border-box", padding: "1.5px" });
    bat.className = "sbb";
    Film.el("div", "sb", bat, { width: "80%", height: "100%", borderRadius: "2px" });
    Film.el("div", "sb", g, { width: "1.5px", height: "4.5px", borderRadius: "0 1px 1px 0", marginLeft: "-5px" });
    return g;
  }

  Film.register({
    id: "phone",
    order: 5,
    mount(ctx) {
      const { PHONE } = ctx;
      const W = PHONE.w + PHONE.bezel * 2, H = PHONE.h + PHONE.bezel * 2;
      phone = Film.el("div", "abs", ctx.world, { left: -W / 2 + "px", top: -H / 2 + "px", width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
      shadow = Film.el("div", "abs", phone, {
        left: "0px", top: "0px", width: W + "px", height: H + "px", borderRadius: PHONE.radius + "px",
        boxShadow: "0 60px 120px -40px rgba(16,24,40,0.35), 0 24px 48px -20px rgba(16,24,40,0.22), 0 2px 6px rgba(16,24,40,0.08)",
      });
      frame = Film.el("div", "abs", phone, {
        left: "0px", top: "0px", width: W + "px", height: H + "px", borderRadius: PHONE.radius + "px",
        background: "linear-gradient(145deg, #2b2d31 0%, #0d0e10 40%, #1b1c1f 100%)",
        boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.10), inset 0 0 0 4px #0a0a0b",
      });
      // side buttons
      [[-3, 190, 3, 34], [-3, 250, 3, 64], [-3, 330, 3, 64], [W, 270, 3, 100]].forEach(([x, y, w, h]) =>
        Film.el("div", "abs", phone, { left: x + "px", top: y + "px", width: w + "px", height: h + "px", borderRadius: "2px", background: "#1a1b1e" }));
      screen = Film.el("div", "abs", phone, {
        left: PHONE.bezel + "px", top: PHONE.bezel + "px", width: PHONE.w + "px", height: PHONE.h + "px",
        borderRadius: PHONE.screenRadius + "px", overflow: "hidden", background: "#ffffff", isolation: "isolate",
      });
      status = Film.el("div", "abs", screen, { left: 0, top: 0, width: PHONE.w + "px", height: "54px", zIndex: 50 });
      statusTime = Film.el("div", "abs tabular", status, { left: "50px", top: "16px", fontSize: "17px", fontWeight: 600, letterSpacing: "-0.01em" }, ctx.COPY.app.statusTime);
      statusIcons = icons(status);
      island = Film.el("div", "abs", screen, { left: (PHONE.w - 124) / 2 + "px", top: "11px", width: "124px", height: "36px", borderRadius: "18px", background: "#000", zIndex: 70 });
      ctx.phone = { el: phone, frame, screen, status, island, W, H };
    },
    render(t, ctx) {
      const m = Film.phoneMotion.at(t);
      phone.style.transform = `translate3d(${m.x.toFixed(3)}px, ${m.y.toFixed(3)}px, 0) rotate(${m.r.toFixed(3)}deg) scale(${m.s.toFixed(5)})`;
      // depth: a light above the frame centre, so the shadow falls away from the centre as the
      // camera moves (a few px, no rotation, no glow)
      const L = ctx.L, pc = Film.phoneToScreen(196.5, 426, t);
      const ox = Eng.clamp((pc.x - L.W / 2) / (L.W / 2), -1, 1) * 9, oy = Eng.clamp((pc.y - L.H / 2) / (L.H / 2), -1, 1) * 6;
      shadow.style.boxShadow =
        `${ox.toFixed(2)}px ${(60 + oy).toFixed(2)}px 120px -40px rgba(16,24,40,0.35), ` +
        `${(ox * 0.45).toFixed(2)}px ${(24 + oy * 0.45).toFixed(2)}px 48px -20px rgba(16,24,40,0.22), 0 2px 6px rgba(16,24,40,0.08)`;
      const dark = Film.isDarkScreen(t);
      const c = dark ? "#ffffff" : "#000000";
      statusTime.style.color = c;
      status.querySelectorAll(".sb").forEach((e) => (e.style.background = c));
      status.querySelectorAll(".sbb").forEach((e) => (e.style.borderColor = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)"));
      status.querySelectorAll(".sbf").forEach((e) => e.setAttribute("fill", c));
      status.querySelectorAll(".sbs").forEach((e) => e.setAttribute("stroke", c));
    },
  });
})();
