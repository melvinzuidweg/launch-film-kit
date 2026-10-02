#!/usr/bin/env node
/*
 * Capture the film as a PNG sequence at any frame rate, straight from window.__seek(t).
 * Draft: 60 fps, encoded as is. Final: 480 fps, averaged 8 at a time into 60 fps (motion blur).
 *
 *   node tools/capture_seq.mjs --page index.html --fps 480 --out renders/seq-169-480 [--workers 4] [--from 0 --to 12] [--resume]
 *
 * --from / --to are OUTPUT times; without --to the capture runs to the page's own length
 * (window.T.OUT_DURATION). Frames are written as frame_000000.png ... with the global frame index
 * (t = index / fps), so partial captures and --resume line up.
 * --out-fps F sets the page's delivery frame rate (window.T.OUT_FPS) before the first seek, so
 * Film.frameT quantises value-changing text (timers, counters) to the grid of the video you are
 * making. tools/render.mjs passes it; without it the page keeps its own OUT_FPS (60).
 * --shot-timeout MS (default 30000): a seek or screenshot that takes longer counts as a hang; the
 * worker then restarts its Chrome and retries that frame (at most 3 restarts per worker).
 *
 * Each worker is its own Chrome PROCESS that owns one contiguous range and seeks strictly
 * forward. (Several tabs of one browser do not work: background tabs fail
 * Page.captureScreenshot.) Because every frame is a pure function of t, workers need no
 * coordination and the result is identical to a single-worker capture.
 * Every worker logs when its last frame is on disk and how long its Chrome took to close. Chrome
 * gets 5 s to close and is then killed: on Windows browser.close() sometimes hung for about two
 * minutes after the last frame, which made the capture look much slower than it was.
 * Disk: roughly 0.1-0.25 MB per 1080p frame, so 480 fps is ~2-6 GB per minute of film.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT, parseArgs, serve, launch, openFilm, pagePath, withTimeout, closeBrowser } from "./lib.mjs";

const args = parseArgs();
const page = pagePath(args.page || "index.html");
const fps = Number(args.fps || 60);
const outFps = args["out-fps"] !== undefined && args["out-fps"] !== true ? Number(args["out-fps"]) : null;
const from = Number(args.from ?? 0);
const workers = Math.max(1, Number(args.workers || Math.min(4, Math.max(1, Math.floor(os.cpus().length / 3)))));
const out = path.resolve(ROOT, args.out || `renders/seq-${fps}`);
const SHOT_MS = Number(args["shot-timeout"] || 30000);
const MAX_RESTARTS = 3;
fs.mkdirSync(out, { recursive: true });

const { server, base } = await serve();
const url = `${base}/${page}`;
const t0 = Date.now();
const secs = (since = t0) => ((Date.now() - since) / 1000).toFixed(1);

// the output length comes from the page itself unless --to is given
let to = args.to !== undefined && args.to !== true ? Number(args.to) : NaN;
if (!Number.isFinite(to)) {
  const probe = await launch();
  try {
    const { tab } = await openFilm(probe, url);
    to = await tab.evaluate(() => window.T.OUT_DURATION);
  } finally { await closeBrowser(probe); }
  console.log(`output length from ${page}: ${to} s`);
}
const first = Math.round(from * fps), last = Math.round(to * fps) - 1; // [from, to)
const total = last - first + 1;
if (total <= 0) { console.error("nothing to capture"); process.exit(1); }
const chunk = Math.ceil(total / workers);
let done = 0;
let lastFrameAt = 0;
const errors = [];

// one Chrome with the film open, its delivery fps set, warmed up just before `at` (output s)
async function openWorker(at) {
  const browser = await launch();
  try {
    const opened = await openFilm(browser, url);
    // the delivery frame rate decides Film.frameT's grid (a 30 fps final must not quantise to 60)
    if (outFps) await opened.tab.evaluate((f) => { window.T.OUT_FPS = f; }, outFps);
    // warm-up seek so the first frame of every chunk renders from the same settled state
    await opened.tab.evaluate((t) => window.__seek(t), Math.max(0, at - 0.5));
    return { browser, ...opened };
  } catch (err) {
    await closeBrowser(browser, 2000);
    throw err;
  }
}

async function work(w) {
  const a = first + w * chunk, b = Math.min(last, a + chunk - 1);
  if (a > b) return;
  let W = await openWorker(a / fps);
  let restarts = 0;
  try {
    for (let i = a; i <= b; ) {
      const f = path.join(out, `frame_${String(i).padStart(6, "0")}.png`);
      if (args.resume && fs.existsSync(f) && fs.statSync(f).size > 0) { done++; i++; continue; }
      try {
        await withTimeout(W.tab.evaluate((t) => window.__seek(t), i / fps), SHOT_MS, `seek frame ${i}`);
        await withTimeout(W.tab.screenshot({ path: f, clip: { x: 0, y: 0, ...W.dims }, optimizeForSpeed: true }), SHOT_MS, `screenshot frame ${i}`);
      } catch (err) {
        // a hung or crashed Chrome: start a fresh one and retry the same frame (frames are pure
        // functions of t, so nothing is lost but time)
        if (++restarts > MAX_RESTARTS) throw new Error(`[w${w}] giving up at frame ${i} after ${MAX_RESTARTS} restarts: ${err.message}`);
        console.log(`[w${w}] ${err.message}; restarting this worker's Chrome (${restarts}/${MAX_RESTARTS})`);
        errors.push(...W.errors);
        W.errors.length = 0;
        await closeBrowser(W.browser, 2000);
        W = await openWorker(i / fps);
        continue;
      }
      done++; i++;
      if (done % 250 === 0) {
        const s = (Date.now() - t0) / 1000;
        console.log(`${done}/${total} frames  ${(done / s).toFixed(1)} fps  eta ${((total - done) / (done / s) / 60).toFixed(1)} min`);
      }
    }
    lastFrameAt = Math.max(lastFrameAt, Date.now());
    console.log(`[w${w}] frames ${a}..${b} on disk at ${secs()} s`);
  } finally {
    errors.push(...W.errors);
    const tc = Date.now();
    const how = await closeBrowser(W.browser);
    if (how !== "closed" || Date.now() - tc > 2000) console.log(`[w${w}] Chrome ${how} after ${secs(tc)} s`);
  }
}
// allSettled: a worker that gives up does not orphan the others' Chrome processes
let results;
try {
  results = await Promise.allSettled(Array.from({ length: workers }, (_, w) => work(w)));
} finally {
  server.close();
}
const failed = results.filter((r) => r.status === "rejected");
// teardown: last frame on disk -> now (Chrome closing); only meaningful when every worker finished
const teardown = lastFrameAt && !failed.length ? ` (teardown ${((Date.now() - lastFrameAt) / 1000).toFixed(1)} s)` : "";
console.log(`captured ${done} frames (${first}..${last}) at ${fps} fps into ${out} in ${((Date.now() - t0) / 60000).toFixed(1)} min${teardown}`);
if (errors.length) { console.log("PAGE ERRORS:\n" + [...new Set(errors)].slice(0, 20).join("\n")); process.exitCode = 1; }
if (failed.length) {
  for (const f of failed) console.error(`FAILED: ${f.reason && f.reason.message ? f.reason.message : f.reason}`);
  console.error(`${total - done} of ${total} frames missing; fix the cause, then re-run the same command with --resume`);
  process.exitCode = 1;
}
