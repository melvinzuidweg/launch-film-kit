/*
 * Shared helpers for the Node tools: argument parsing, a tiny static server for the project
 * root, Chrome discovery and "open a film page and wait until it is ready".
 *
 * Why a local HTTP server: Chrome blocks fonts (and some module loads) on file:// pages, and a
 * frame rendered with a fallback font is silently wrong.
 * Why system Chrome + puppeteer-core: no browser download, and the same Chrome renders the
 * stills and the capture, so a still matches the frame in the video (identical, or within 1-2
 * levels on a few pixels: screenshot capture on Windows is not byte-reproducible).
 */
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import puppeteer from "puppeteer-core";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// --key value pairs and bare --flags; values never start with "--"
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) { out[a.slice(2)] = next; i++; }
      else out[a.slice(2)] = true;
    } else out._.push(a);
  }
  return out;
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".ttf": "font/ttf", ".otf": "font/otf", ".woff": "font/woff", ".woff2": "font/woff2", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".json": "application/json",
};

// static server for the project root on a free port; resolves to { server, base }
export async function serve(root = ROOT) {
  const server = http.createServer((req, res) => {
    if (req.url === "/favicon.ico") { res.writeHead(204); return res.end(); }  // keeps the error log clean
    const p = path.join(root, decodeURIComponent(req.url.split("?")[0]));
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(p).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

// CHROME_PATH wins; otherwise the usual install locations of Chrome, Chromium and Edge
export function findChrome() {
  if (process.env.CHROME_PATH) {
    if (fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    throw new Error(`CHROME_PATH points to a missing file: ${process.env.CHROME_PATH}`);
  }
  const env = process.env;
  const cands = {
    win32: [
      env.PROGRAMFILES && path.join(env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe"),
      env["PROGRAMFILES(X86)"] && path.join(env["PROGRAMFILES(X86)"], "Google/Chrome/Application/chrome.exe"),
      env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
      env.PROGRAMFILES && path.join(env.PROGRAMFILES, "Chromium/Application/chrome.exe"),
      env["PROGRAMFILES(X86)"] && path.join(env["PROGRAMFILES(X86)"], "Microsoft/Edge/Application/msedge.exe"),
      env.PROGRAMFILES && path.join(env.PROGRAMFILES, "Microsoft/Edge/Application/msedge.exe"),
    ],
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      path.join(os.homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ],
    linux: [
      "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/opt/google/chrome/chrome",
      "/usr/bin/chromium", "/usr/bin/chromium-browser", "/snap/bin/chromium", "/usr/bin/microsoft-edge",
    ],
  }[process.platform] || [];
  const hit = cands.filter(Boolean).find((p) => fs.existsSync(p));
  if (!hit) throw new Error("No Chrome/Chromium/Edge found. Install Chrome or set CHROME_PATH to its executable.");
  return hit;
}

export const LAUNCH_ARGS = [
  "--hide-scrollbars", "--force-color-profile=srgb", "--disable-gpu-vsync",
  "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
];

export function launch() {
  return puppeteer.launch({ executablePath: findChrome(), headless: true, args: LAUNCH_ARGS });
}

// A promise that rejects when `p` has not settled after `ms` milliseconds.
export function withTimeout(p, ms, label = "call") {
  let timer;
  const t = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label}: no answer after ${ms} ms`)), ms); });
  return Promise.race([p, t]).finally(() => clearTimeout(timer));
}

// Close a browser without ever waiting long for it. Why: on Windows, browser.close() sometimes
// took about two minutes to return after the last frame was already on disk (3 of 4 captures in
// one test session; a launch-then-close on its own took 0.2 s). The frames are written by then,
// so after `ms` the Chrome process tree is killed. Returns "closed", "killed" or "error: ...".
export async function closeBrowser(browser, ms = 5000) {
  if (!browser) return "closed";
  const proc = typeof browser.process === "function" ? browser.process() : null;
  let result;
  try { result = await withTimeout(browser.close().then(() => "closed"), ms, "browser.close"); }
  catch (e) { result = /no answer/.test(e.message) ? "timeout" : `error: ${e.message}`; }
  if (result !== "closed" && proc && proc.pid && proc.exitCode === null) {
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
    else { try { proc.kill("SIGKILL"); } catch { /* already gone */ } }
    return "killed";
  }
  return result;
}

// Open a film page, wait for fonts and images, size the viewport to the film's own frame.
// Returns { tab, dims, errors } (errors collects page errors and console errors/warnings).
export async function openFilm(browser, url, { scale = 1 } = {}) {
  const tab = await browser.newPage();
  const errors = [];
  tab.on("console", (m) => { if (m.type() === "error" || m.type() === "warn" || m.type() === "warning") errors.push(m.text()); });
  tab.on("pageerror", (e) => errors.push(String(e)));
  tab.on("requestfailed", (r) => errors.push(`request failed: ${r.url()}`));
  tab.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
  await tab.setViewport({ width: 1920, height: 1080, deviceScaleFactor: scale });
  await tab.goto(url, { waitUntil: "networkidle0" });
  const dims = await tab.evaluate(() => (window.Film ? { width: window.Film.L.W, height: window.Film.L.H } : null));
  if (!dims) throw new Error(`${url}: window.Film is missing (did a script fail to load?)\n${errors.join("\n")}`);
  await tab.setViewport({ ...dims, deviceScaleFactor: scale });
  await tab.evaluate(() => window.Film.ready());
  return { tab, dims, errors };
}

export function pagePath(page) {
  if (!fs.existsSync(path.join(ROOT, page))) throw new Error(`page not found: ${page}`);
  return page.replace(/\\/g, "/");
}
