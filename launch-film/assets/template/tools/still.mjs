#!/usr/bin/env node
/*
 * Render stills of the film at given times, deterministically (window.__seek(t)). Same Chrome,
 * same page, same seek as the capture, so a still matches the frame in the video (identical, or
 * 1-2 levels apart on a few pixels: Windows screenshots are not byte-reproducible).
 *
 * Times are OUTPUT times (the video's clock = film time x T.SCALE, see src/timeline.js).
 * --film reads every time (--times, --from, --to, --step) as FILM time instead (the times in
 * src/timeline.js) and seeks window.__seekFilm; sheet labels then read "f<t>s".
 * Without --times the range runs --from (0) .. --to (the page's length) in --step (1) s.
 *
 * Seek order: the times are rendered in ascending order, like the capture (each capture worker
 * seeks strictly forward). Why: Chrome keeps some raster state from frames it painted before,
 * so a page with a determinism bug can give a different picture after a backward seek, and a
 * still should show what the render shows. --order listed renders them in the order given
 * instead; that is the seek-order test (references/03-engine.md §10).
 *
 *   node tools/still.mjs --page index.html --times 0,2,5,9 --out renders/stills/169
 *   node tools/still.mjs --page portrait.html --from 0 --step 0.5 --sheet --cols 6 --out renders/stills/45
 *   node tools/still.mjs --page index.html --times 4 --scale 0.1875     (feed check: 360 px wide)
 *   node tools/still.mjs --page index.html --film --times 4 --out renders/stills/drop
 *   node tools/still.mjs --page portrait.html --times 9,3,7.8,3 --order listed --out renders/det/shuf
 *
 * Writes t_<seconds>.png (and, with --sheet, a contact sheet sheet.png via ffmpeg, each cell
 * labelled in a strip under the frame so the label never covers the picture).
 * Prints page errors; exits 1 if there were any (a broken part only logs, so read them).
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, parseArgs, serve, launch, openFilm, pagePath, closeBrowser } from "./lib.mjs";

const args = parseArgs();
const page = pagePath(args.page || "index.html");
const out = path.resolve(ROOT, args.out || "renders/stills");
const scale = Number(args.scale || 1);
const film = !!args.film;
const listedOrder = args.order === "listed";
fs.mkdirSync(out, { recursive: true });

const { server, base } = await serve();
const browser = await launch();
let files = [], times = [], errors = [], dims;
try {
  const opened = await openFilm(browser, `${base}/${page}`, { scale });
  const tab = opened.tab;
  dims = opened.dims;
  errors = opened.errors;
  if (args.times) times = String(args.times).split(",").map(Number);
  else {
    const len = await tab.evaluate((f) => (f ? window.T.DURATION : window.T.OUT_DURATION), film);
    const from = Number(args.from ?? 0), to = Number(args.to ?? len), step = Number(args.step ?? 1);
    for (let i = 0; from + i * step <= to + 1e-9; i++) times.push(Math.round((from + i * step) * 1000) / 1000);
  }
  if (!listedOrder) times = [...new Set(times)].sort((a, b) => a - b);   // forward, like the capture
  for (const t of times) {
    await tab.evaluate((tt, f) => (f ? window.__seekFilm(tt) : window.__seek(tt)), t, film);
    const f = path.join(out, `t_${t.toFixed(2).padStart(6, "0")}.png`);
    await tab.screenshot({ path: f, clip: { x: 0, y: 0, ...dims } });
    files.push(f);
  }
} finally {
  await closeBrowser(browser);
  server.close();
}

if (args.sheet && files.length) {
  const cols = Number(args.cols || 4);
  const w = Number(args.cellw || (dims.width > dims.height ? 480 : 300));
  const tmp = path.join(out, "_lab");
  fs.mkdirSync(tmp, { recursive: true });
  // ffmpeg filter syntax needs the drive colon escaped on Windows
  const fontFile = path.join(ROOT, "assets/fonts/Inter_600SemiBold.ttf").replace(/\\/g, "/").replace(/^([A-Za-z]):/, "$1\\:");
  files.forEach((f, i) => {
    const t = (film ? "f" : "") + times[i].toFixed(2);
    // the time goes in a 28 px strip under the frame: drawn on the frame it covered the
    // "Example" label in the top-left corner of the 4:5 layout
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", f, "-vf", `scale=${w}:-2,pad=iw:ih+28:0:0:color=0x1b1c1f,drawtext=fontfile='${fontFile}':text='${t}s':x=8:y=h-22:fontsize=17:fontcolor=white`, path.join(tmp, `c_${String(i).padStart(4, "0")}.png`)]);
  });
  const rows = Math.ceil(files.length / cols);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "1", "-i", path.join(tmp, "c_%04d.png"), "-vf", `tile=${cols}x${rows}:padding=6:margin=6:color=0x888888`, "-frames:v", "1", path.join(out, "sheet.png")]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("sheet:", path.join(out, "sheet.png"));
}
console.log(`stills: ${files.length} in ${out}`);
if (errors.length) {
  console.log("PAGE ERRORS:\n" + [...new Set(errors)].slice(0, 30).join("\n"));
  process.exitCode = 1;
}
