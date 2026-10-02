#!/usr/bin/env node
/*
 * Capture the film as a PNG sequence at any frame rate, straight from window.__seek(t).
 * Used for the final render: HyperFrames' disk pre-check refuses a 480 fps png-sequence on this
 * machine (it estimates ~5.8 MB/frame; real frames are ~0.2 MB). Same capture method as
 * HyperFrames' Windows screenshot mode (Page.captureScreenshot), same pages, same fonts.
 *
 *   node tools/capture_seq.mjs --page portrait.html --fps 480 --out renders/seq-45-480 [--workers 3] [--from 0 --to 52.8]
 *
 * --from / --to are OUTPUT times (the rendered video's clock = film time x T.SCALE, see
 * src/timeline.js); without --to the capture runs to the page's own output length,
 * window.T.OUT_DURATION, read from the page before the workers start.
 * Each worker (its own Chrome process) owns one contiguous time range and seeks strictly forward (deterministic order).
 * Frames are written as frame_000000.png ... with the global frame index (t = index / fps).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]);
  return acc;
}, []));
const page = args.page || "index.html";
const fps = Number(args.fps || 60);
const from = Number(args.from ?? 0);
const workers = Math.max(1, Number(args.workers || 3));
const out = path.resolve(ROOT, args.out || `renders/seq-${fps}`);
fs.mkdirSync(out, { recursive: true });
const dims = page.includes("portrait") ? { width: 1080, height: 1350 } : { width: 1920, height: 1080 };

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".ttf": "font/ttf", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/${page}`;

const LAUNCH = {
  executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--hide-scrollbars", "--force-color-profile=srgb", "--disable-gpu-vsync", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
};

// the output length comes from the page itself unless --to is given
let to = args.to !== undefined && args.to !== true ? Number(args.to) : NaN;
if (!Number.isFinite(to)) {
  const probe = await puppeteer.launch(LAUNCH);
  const tab = await probe.newPage();
  await tab.goto(url, { waitUntil: "networkidle0" });
  to = await tab.evaluate(() => window.T.OUT_DURATION ?? window.T.DURATION);
  await probe.close();
  console.log(`output length from ${page}: ${to} s`);
}
const first = Math.round(from * fps), last = Math.round(to * fps) - 1; // [from, to)
const total = last - first + 1;
const chunk = Math.ceil(total / workers);
let done = 0, errors = [];
const t0 = Date.now();
async function work(w) {
  const a = first + w * chunk, b = Math.min(last, a + chunk - 1);
  if (a > b) return;
  // one Chrome process per worker: background tabs of a shared browser fail Page.captureScreenshot
  const browser = await puppeteer.launch(LAUNCH);
  const tab = await browser.newPage();
  await tab.setViewport({ ...dims, deviceScaleFactor: 1 });
  tab.on("pageerror", (e) => errors.push(String(e)));
  tab.on("console", (m) => { if (m.type() === "error" && !/404/.test(m.text())) errors.push(m.text()); });
  await tab.goto(url, { waitUntil: "networkidle0" });
  await tab.evaluate(() => document.fonts.ready);
  // warm-up seek so the first frame of every chunk renders from the same settled state
  await tab.evaluate((t) => window.__seek(t), Math.max(0, a / fps - 0.5));
  for (let i = a; i <= b; i++) {
    const f = path.join(out, `frame_${String(i).padStart(6, "0")}.png`);
    if (args.resume && fs.existsSync(f) && fs.statSync(f).size > 0) { done++; continue; }
    await tab.evaluate((t) => window.__seek(t), i / fps);
    await tab.screenshot({ path: f, clip: { x: 0, y: 0, ...dims }, optimizeForSpeed: true });
    done++;
    if (done % 500 === 0) {
      const s = (Date.now() - t0) / 1000;
      console.log(`${done}/${total} frames  ${(done / s).toFixed(1)} fps  eta ${((total - done) / (done / s) / 60).toFixed(1)} min`);
    }
  }
  await browser.close();
}
await Promise.all(Array.from({ length: workers }, (_, w) => work(w)));
server.close();
console.log(`captured ${done} frames (${first}..${last}) at ${fps} fps into ${out} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
if (errors.length) { console.log("PAGE ERRORS:\n" + [...new Set(errors)].slice(0, 20).join("\n")); process.exitCode = 1; }
