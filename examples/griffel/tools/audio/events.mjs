#!/usr/bin/env node
/*
 * Build the SFX cue list from the film itself: loads a page (default index.html) in headless
 * Chrome, reads the taps/pushes the acts registered plus the key times in src/timeline.js, maps
 * them to effects.
 *   node tools/audio/events.mjs > renders/audio/cues.json
 *   node tools/audio/events.mjs --page index-vraag.html > renders/audio/cues-vraag.json
 *
 * Every time in the output is OUTPUT time (the rendered video's clock): each cue is worked out in
 * film time (the acts and src/timeline.js) and multiplied by T.SCALE; `duration` is
 * T.OUT_DURATION and `drop` is T.OUT_DROP (24.2 at SCALE 1.1). `bpm` is the beat grid as it plays
 * in the video (T.BPM / T.SCALE); `bpm_film` and `scale` are there for reference.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const argv = process.argv.slice(2);
const page = argv.includes("--page") ? argv[argv.indexOf("--page") + 1] : "index.html";
if (!page || !fs.existsSync(path.join(ROOT, page))) { console.error(`events.mjs: page ${page} not found`); process.exit(1); }
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(p);
  res.writeHead(200, { "Content-Type": { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".ttf": "font/ttf", ".svg": "image/svg+xml", ".png": "image/png" }[ext] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const tab = await browser.newPage();
await tab.goto(`http://127.0.0.1:${server.address().port}/${page}`, { waitUntil: "networkidle0" });
const data = await tab.evaluate(() => ({ taps: window.Film.taps, pushes: window.Film.pushes, T: JSON.parse(JSON.stringify(window.T, (k, v) => (typeof v === "function" ? undefined : v))) }));
await browser.close();
server.close();

const { T, taps, pushes } = data;
const SCALE = Number(T.SCALE) || 1;
const r3 = (v) => Math.round(v * 1000) / 1000;
const cues = [];
// t is FILM time (taps, pushes, T values); the cue is written in output time
const add = (t, sfx, gain = 1) => cues.push({ t: r3(t * SCALE), sfx, gain });

for (const tp of taps) {
  if (Math.abs(tp.t - T.DROP) < 0.02) add(tp.t, "select", 1.0);
  else if (tp.hold && tp.hold > 0.5) { add(tp.t, "tap", 0.7); add(tp.t + 0.05, "stop_hold", 0.6); }
  else add(tp.t, "tap", 0.7);
}
for (const p of pushes) add(p.t + 0.2, "chime", 0.55);

add(T.A.hook.morph[0] + 0.55, "whoosh_short", 0.5);
add(T.B.morphBarsToSteps[0] + 0.45, "whoosh", 0.45);
for (const s of T.B.stepsDone) add(s, "tick", 0.5);
add(T.B.stepAction, "tick_low", 0.5);
const [ty0, tyDur] = T.B.typeName;
for (let i = 0; i < 4; i++) add(ty0 + (i * tyDur) / 4 + 0.03, "type", 0.45);
add(T.B.tapConfirm + 0.08, "confirm", 0.5);
add(T.B.nameFlip, "pop", 0.45);
add(T.C.tapQ2 + 0.06, "confirm", 0.4);
add(T.C.contextFile, "tick", 0.5);
for (const r of T.C.recipients.slice(1)) add(r, "pop", 0.35); // [0] is the scroll cue; the self chip always exists
add(T.D.emailUnfold[0] + 0.35, "whoosh", 0.5);
for (const r of T.D.inboxTicks) add(r, "tick", 0.5);
for (const w of T.D.wipe) add(w, "dissolve", 0.45);
add(T.E.lock, "lock", 0.8);
add(T.E.wordmark[0] + 0.25, "whoosh_short", 0.35);

cues.sort((a, b) => a.t - b.t);
const out = {
  page,
  scale: SCALE,
  drop: T.OUT_DROP ?? r3(T.DROP * SCALE),           // output time
  duration: T.OUT_DURATION ?? r3(T.DURATION * SCALE), // output time
  bpm: Math.round((T.BPM / SCALE) * 1000) / 1000,    // the beat grid as it plays in the video
  bpm_film: T.BPM,
  cues,
};
process.stdout.write(JSON.stringify(out, null, 1));
