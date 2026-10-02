#!/usr/bin/env node
/*
 * Build the SFX cue list from the film itself: loads a page in headless Chrome and reads what the
 * acts registered (Film.taps, Film.pushes, Film.sfxCues) plus T. So the sound can never drift
 * from the picture: move a tap in the timeline and its click moves with it.
 *
 *   node tools/audio/events.mjs --out renders/audio/cues.json
 *   node tools/audio/events.mjs --page index-alt.html --out renders/audio/cues-alt.json
 *
 * Mapping: a tap at T.DROP -> "select" (the fuller drop tap); a tap held > 0.5 s -> "tap" +
 * "stop_hold"; any other tap -> "tap"; a push -> "chime" 0.2 s after it starts; Film.sfx cues as
 * registered. Every time in the output is OUTPUT time (film time x T.SCALE); `duration` is
 * T.OUT_DURATION, `drop` is T.OUT_DROP and `bpm` is the grid as it plays in the video
 * (T.BPM / T.SCALE). tools/audio/mix_edl.py places each effect so its measured peak lands on t.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, parseArgs, serve, launch, openFilm, pagePath, closeBrowser } from "../lib.mjs";

const args = parseArgs();
const page = pagePath(args.page || "index.html");
const { server, base } = await serve();
const browser = await launch();
let data;
try {
  const { tab } = await openFilm(browser, `${base}/${page}`);
  data = await tab.evaluate(() => ({
    taps: window.Film.taps, pushes: window.Film.pushes, sfx: window.Film.sfxCues || [],
    T: JSON.parse(JSON.stringify(window.T, (k, v) => (typeof v === "function" ? undefined : v))),
    OUT_DURATION: window.T.OUT_DURATION, OUT_DROP: window.T.OUT_DROP,
  }));
} finally {
  await closeBrowser(browser);
  server.close();
}

const { T, taps, pushes, sfx } = data;
const SCALE = Number(T.SCALE) || 1;
const r3 = (v) => Math.round(v * 1000) / 1000;
const cues = [];
// t is FILM time (taps, pushes, T values, Film.sfx); the cue is written in output time
const add = (t, name, gain = 1, src = "") => cues.push({ t: r3(t * SCALE), sfx: name, gain, src });

for (const tp of taps) {
  if (Math.abs(tp.t - T.DROP) < 0.02) add(tp.t, "select", 1.0, "tap@DROP");
  else if (tp.hold && tp.hold > 0.5) { add(tp.t, "tap", 0.7, "tap"); add(tp.t + 0.05, "stop_hold", 0.6, "hold"); }
  else add(tp.t, "tap", 0.7, "tap");
}
for (const p of pushes) add(p.t + 0.2, "chime", 0.55, "push");
for (const c of sfx) add(c.t, c.sfx, c.gain ?? 1, "Film.sfx");

// every effect must exist (run tools/audio/synth_sfx.py first)
const sfxDir = path.join(ROOT, "assets/audio/sfx");
const missing = [...new Set(cues.map((c) => c.sfx))].filter((n) => !fs.existsSync(path.join(sfxDir, n + ".wav")));
if (missing.length) console.error(`warning: missing SFX files (run python tools/audio/synth_sfx.py): ${missing.join(", ")}`);

cues.sort((a, b) => a.t - b.t);
const out = {
  page,
  scale: SCALE,
  drop: data.OUT_DROP,
  duration: data.OUT_DURATION,
  bpm: Math.round((T.BPM / SCALE) * 1000) / 1000,
  bpm_film: T.BPM,
  cues,
};
const json = JSON.stringify(out, null, 1);
if (typeof args.out === "string") {
  const f = path.resolve(ROOT, args.out);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, json);
  console.log(`wrote ${path.relative(ROOT, f)}: ${cues.length} cues, drop ${out.drop} s, duration ${out.duration} s, ${out.bpm} BPM`);
} else process.stdout.write(json);
