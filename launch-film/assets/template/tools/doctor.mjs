#!/usr/bin/env node
/*
 * Check the machine before the first render: Node, Chrome, ffmpeg (with the filters the encode
 * needs), Python with numpy and Pillow, and the installed npm packages.
 *
 *   node tools/doctor.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// no static import of lib.mjs: it needs puppeteer-core, which may be what is missing
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let bad = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m, fix) => { bad++; console.log(`  FAIL  ${m}${fix ? `\n        -> ${fix}` : ""}`); };
const run = (cmd, args) => spawnSync(cmd, args, { encoding: "utf8" });

// puppeteer-core 25 declares engines.node >= 22.12.0
const [major, minor] = process.versions.node.split(".").map(Number);
major > 22 || (major === 22 && minor >= 12) ? ok(`node ${process.versions.node}`) : fail(`node ${process.versions.node}`, "install Node 22.12 or newer (puppeteer-core 25 requires it)");

for (const pkg of ["gsap", "puppeteer-core"]) {
  const p = path.join(ROOT, "node_modules", pkg, "package.json");
  fs.existsSync(p) ? ok(`${pkg} ${JSON.parse(fs.readFileSync(p, "utf8")).version}`) : fail(`${pkg} not installed`, "npm install");
}

try {
  const { findChrome } = await import("./lib.mjs");
  ok(`browser ${findChrome()}`);
} catch (e) { fail(String(e.message || e).split(/\r?\n/)[0], "install Chrome or set CHROME_PATH (or npm install, if puppeteer-core is missing)"); }

const ff = run("ffmpeg", ["-hide_banner", "-filters"]);
if (ff.error) fail("ffmpeg not on PATH", "install ffmpeg (a build with libzimg for zscale)");
else {
  for (const f of ["zscale", "tmix", "loudnorm", "drawtext", "ebur128"]) {
    new RegExp(`\\s${f}\\s`).test(ff.stdout) ? ok(`ffmpeg filter ${f}`) : fail(`ffmpeg has no ${f} filter`, f === "zscale" ? "use an ffmpeg build with --enable-libzimg" : f === "drawtext" ? "use a build with libfreetype (only for contact sheets)" : "use a full ffmpeg build");
  }
  run("ffprobe", ["-version"]).error ? fail("ffprobe not on PATH") : ok("ffprobe");
}

const PY = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const py = run(PY, ["-c", "import sys, numpy, PIL; print(sys.version.split()[0], numpy.__version__, PIL.__version__)"]);
if (py.error) fail(`${PY} not found`, "install Python 3.10+ or set PYTHON");
else if (py.status !== 0) fail(`${PY}: numpy/Pillow missing`, `${PY} -m pip install numpy pillow`);
else { const [v, np, pil] = py.stdout.trim().split(" "); ok(`python ${v}, numpy ${np}, Pillow ${pil}`); }

console.log(bad ? `\n${bad} problem(s).` : "\nAll good.");
process.exitCode = bad ? 1 : 0;
