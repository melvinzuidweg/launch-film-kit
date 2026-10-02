#!/usr/bin/env node
/*
 * Render stills of the film at given times, deterministic (window.__seek(t)).
 * Serves the repo over a local HTTP server (Chrome blocks fonts on file://) and drives the
 * system Chrome via puppeteer-core.
 *
 * Times are OUTPUT times (the rendered video's clock = film time x T.SCALE, see src/timeline.js).
 * Without --to (and without --times) the range runs to the page's output length, T.OUT_DURATION.
 * --film reads every time (--times, --from, --to, --step) as FILM time, the times in
 * src/timeline.js, and seeks window.__seekFilm; the sheet labels then read "f<t>s".
 *
 *   node tools/still.mjs --page index.html --times 0,1.65,3.3 --out renders/stills/a
 *   node tools/still.mjs --page portrait.html --from 0 --to 11 --step 0.55 --out renders/stills/a45 --sheet --cols 5
 *   node tools/still.mjs --page index.html --times 24.2 --scale 0.1875   (the drop; phone-size: 360 px wide)
 *   node tools/still.mjs --page index.html --film --times 22 --out renders/stills/drop   (same frame, film time)
 *
 * Writes PNGs named t_<seconds>.png and, with --sheet, a labelled contact sheet sheet.png.
 * Prints console errors from the page (failed parts are reported, not fatal).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]);
    return acc;
  }, [])
);
const page = args.page || "index.html";
const out = path.resolve(ROOT, args.out || "renders/stills");
const scale = Number(args.scale || 1);
const film = !!args.film; // times are film times (src/timeline.js) instead of output times
let times = [];
if (args.times) times = String(args.times).split(",").map(Number);
fs.mkdirSync(out, { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".ttf": "font/ttf", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const chrome = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars", "--force-color-profile=srgb", "--disable-gpu-vsync"] });
const tab = await browser.newPage();
const dims = page.includes("portrait") ? { width: 1080, height: 1350 } : { width: 1920, height: 1080 };
await tab.setViewport({ ...dims, deviceScaleFactor: scale });
const errors = [];
tab.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.text()); });
tab.on("pageerror", (e) => errors.push(String(e)));
await tab.goto(`http://127.0.0.1:${port}/${page}`, { waitUntil: "networkidle0" });
await tab.evaluate(() => document.fonts.ready);
if (!args.times) {
  // default end: the page's own length (output time, or film time with --film)
  const len = await tab.evaluate((f) => (f ? window.T.DURATION : window.T.OUT_DURATION ?? window.T.DURATION), film);
  const from = Number(args.from ?? 0), to = Number(args.to ?? len), step = Number(args.step ?? 1);
  for (let i = 0; from + i * step <= to + 1e-9; i++) times.push(Math.round((from + i * step) * 1000) / 1000);
}

const files = [];
for (const t of times) {
  await tab.evaluate((tt, f) => (f ? window.__seekFilm(tt) : window.__seek(tt)), t, film);
  await tab.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const f = path.join(out, `t_${t.toFixed(2).padStart(6, "0")}.png`);
  await tab.screenshot({ path: f, clip: { x: 0, y: 0, ...dims } });
  files.push(f);
}
await browser.close();
server.close();

if (args.sheet) {
  const cols = Number(args.cols || 4);
  const w = Number(args.cellw || (dims.width > dims.height ? 480 : 300));
  const list = path.join(out, "_list.txt");
  // label each cell with its time using drawtext, then tile
  const tmp = path.join(out, "_lab");
  fs.mkdirSync(tmp, { recursive: true });
  const fontFile = path.join(ROOT, "assets/fonts/Inter_600SemiBold.ttf").replace(/\\/g, "/").replace(/^([A-Za-z]):/, "$1\\:");
  files.forEach((f, i) => {
    const t = (film ? "f" : "") + times[i].toFixed(2);
    const bw = Math.max(92, 16 + 11 * (t.length + 1));
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", f, "-vf", `scale=${w}:-1,drawbox=x=0:y=0:w=${bw}:h=30:color=black@0.7:t=fill,drawtext=fontfile='${fontFile}':text='${t}s':x=8:y=7:fontsize=17:fontcolor=white`, path.join(tmp, `c_${String(i).padStart(4, "0")}.png`)]);
  });
  const rows = Math.ceil(files.length / cols);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "1", "-i", path.join(tmp, "c_%04d.png"), "-vf", `tile=${cols}x${rows}:padding=6:margin=6:color=0x888888`, "-frames:v", "1", path.join(out, "sheet.png")]);
  fs.rmSync(tmp, { recursive: true, force: true });
  if (fs.existsSync(list)) fs.rmSync(list);
  console.log("sheet:", path.join(out, "sheet.png"));
}
console.log(`stills: ${files.length} in ${out}`);
if (errors.length) console.log("PAGE ERRORS:\n" + [...new Set(errors)].slice(0, 30).join("\n"));
