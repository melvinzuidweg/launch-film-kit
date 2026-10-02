#!/usr/bin/env node
/*
 * Render the film to MP4. Both modes capture lossless PNGs with tools/capture_seq.mjs and encode
 * them with tools/encode_seq.py (explicit BT.709, 16-bit blur, dither, tagged).
 *
 *   node tools/render.mjs 169 draft                  -> renders/film-169-draft.mp4  (60 fps, no blur)
 *   node tools/render.mjs 45 final                   -> renders/film-45-final.mp4   (480 fps captured, 8-subframe blur -> 60 fps)
 *   node tools/render.mjs 169 final --audio renders/audio/mix.wav   -> also writes film-169-final-audio.mp4
 *   node tools/render.mjs 169 final --variant alt    -> index-alt.html -> renders/film-169-alt-final.mp4
 *   node tools/render.mjs 169 draft --from 0 --to 2  -> a 2-second piece (output times): film-169-draft-0-2.mp4
 *
 *   node tools/render.mjs 45 final --fps 30          -> renders/film-45-final-30fps.mp4 (240 fps captured, 8-subframe blur), e.g. for LinkedIn ads
 *
 * Options: --workers N (capture processes), --fps F (final delivery fps, default 60; the page's
 * T.OUT_FPS is set to match, so Film.frameT quantises timers to the delivered frame grid),
 * --sub N (subframes per output frame, default 8), --keep-seq (keep the PNGs), --resume (reuse
 * captured frames), --out file.mp4, --crf N.
 * Env: CHROME_PATH (browser), PYTHON (python executable; default python on Windows, python3 elsewhere).
 *
 * Time and disk (reference numbers, 12-thread laptop): a draft captures ~14 frames/s with 2
 * workers; a final captures 8x as many frames (~13-16 min per 48 s format with 4 workers) at
 * ~0.2 MB per 1080p frame. Sequences are deleted after a successful encode unless --keep-seq.
 *
 * Alternative renderer: the pages also work with HyperFrames (`npx hyperframes render`), see
 * the runtime hooks in src/film.js. This script does not need it.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, parseArgs } from "./lib.mjs";

const args = parseArgs();
const [fmt = "169", mode = "draft"] = args._;
if (!["169", "45"].includes(fmt) || !["draft", "final"].includes(mode)) {
  console.error("usage: node tools/render.mjs <169|45> <draft|final> [--variant name] [--audio mix.wav] [--from s --to s]");
  process.exit(2);
}
const variant = typeof args.variant === "string" ? args.variant : "";
const base = fmt === "45" ? "portrait" : "index";
const page = variant ? `${base}-${variant}.html` : `${base}.html`;
if (!fs.existsSync(path.join(ROOT, page))) { console.error(`render: page ${page} not found`); process.exit(1); }
const tag = variant ? `${fmt}-${variant}` : fmt;
const hasRange = args.from !== undefined || args.to !== undefined;
const rangeTag = hasRange ? `-${args.from ?? 0}-${args.to ?? "end"}` : "";
const fps = mode === "draft" ? 60 : Number(args.fps || 60);
const sub = mode === "draft" ? 1 : Number(args.sub || 8);
const fpsTag = fps !== 60 ? `-${fps}fps` : "";            // a 30 fps final never overwrites the 60 fps one
const out = path.resolve(ROOT, typeof args.out === "string" ? args.out : `renders/film-${tag}-${mode}${fpsTag}${rangeTag}.mp4`);
fs.mkdirSync(path.dirname(out), { recursive: true });
const PY = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");

function run(cmd, argv) {
  console.log(`> ${cmd} ${argv.join(" ")}`);
  const r = spawnSync(cmd, argv, { cwd: ROOT, stdio: "inherit", env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
  if (r.error) throw r.error;
  if (r.status !== 0) { console.error(`render: ${cmd} exited with ${r.status}`); process.exit(r.status || 1); }
}

const cap = fps * sub;
const seq = path.join(ROOT, "renders", `seq-${tag}-${cap}${rangeTag}`);
if (!args.resume) fs.rmSync(seq, { recursive: true, force: true });

const capArgs = ["tools/capture_seq.mjs", "--page", page, "--fps", String(cap), "--out-fps", String(fps), "--out", path.relative(ROOT, seq)];
if (args.workers) capArgs.push("--workers", String(args.workers));
else if (mode === "draft") capArgs.push("--workers", "2");
if (args.from !== undefined) capArgs.push("--from", String(args.from));
if (args.to !== undefined) capArgs.push("--to", String(args.to));
if (args.resume) capArgs.push("--resume");
run(process.execPath, capArgs);

const encArgs = ["tools/encode_seq.py", seq, out, "--in-fps", String(cap), "--sub", String(sub)];
if (mode === "draft") encArgs.push("--preset", "medium", "--crf", String(args.crf || 14));
else if (args.crf) encArgs.push("--crf", String(args.crf));
run(PY, encArgs);
if (!args["keep-seq"]) fs.rmSync(seq, { recursive: true, force: true });

if (typeof args.audio === "string") {
  // the mix covers the whole film in output time; a partial render takes the matching slice
  const mux = out.replace(/\.mp4$/, "-audio.mp4");
  const ss = args.from !== undefined ? ["-ss", String(args.from)] : [];
  run("ffmpeg", ["-v", "error", "-y", "-i", out, ...ss, "-i", path.resolve(ROOT, args.audio), "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", mux]);
  console.log(mux);
}
console.log(out);
