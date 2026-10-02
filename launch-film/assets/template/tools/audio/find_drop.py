"""
Find the drop of a music track by bass energy. Never trust an automatic beat grid or the
waveform's look: measure where the low end comes in.

    python tools/audio/find_drop.py assets/audio/licensed/<track>.wav [--around 105] [--cues renders/audio/cues.json]

Prints the biggest bass-energy jumps (0.5 s windows after a 150 Hz low-pass), then zooms to 20 ms
windows around the best candidate (or --around). With --cues (from tools/audio/events.mjs) it
also prints the song position to start the music at so the track's drop lands on the film's
drop (output time): song_start = drop_song - cues.drop. Use that as the first EDL segment
(tools/audio/mix_edl.py): {"out_t": 0, "song_t": song_start}.
Check the result by ear: a drop that lands half a beat off is worse than no drop.
"""
import argparse, json, subprocess, sys
import numpy as np

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SR = 22050


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def lowpass(x, fc=150):
    # one-pole low-pass (plain Python loop: a few seconds per song)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def db(seg):
    return 10 * np.log10((seg.astype(np.float64) ** 2).mean() + 1e-12)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("track")
    ap.add_argument("--around", type=float, default=None, help="zoom around this song time instead of the biggest jump")
    ap.add_argument("--cues", default=None, help="cues.json from tools/audio/events.mjs (for the film's drop)")
    a = ap.parse_args()
    x = load(a.track)
    lp = lowpass(x)
    win = 0.5
    times = np.arange(0, len(x) / SR - win, win)
    e = np.array([db(lp[int(t * SR): int((t + win) * SR)]) for t in times])
    jumps = np.diff(e)
    order = np.argsort(-jumps)
    print("top bass-energy jumps (song time s, +dB):")
    for i in order[:8]:
        print(f"  {times[i + 1]:7.2f}  +{jumps[i]:.1f} dB")
    cand = a.around if a.around is not None else times[order[0] + 1]
    print(f"\nzoom around {cand:.2f} s (20 ms windows):")
    best, bestj, prev = cand, -1e9, None
    for t in np.arange(max(0.0, cand - 0.4), cand + 0.4, 0.02):
        v = db(lp[int(t * SR): int((t + 0.02) * SR)])
        if prev is not None and v - prev > bestj:
            bestj, best = v - prev, t
        prev = v
        print(f"  {t:7.2f}  {v:6.1f} dB")
    print(f"\nDROP (song time) ~= {best:.3f} s")
    if a.cues:
        drop = float(json.load(open(a.cues, encoding="utf-8"))["drop"])
        print(f"film drop (output time) = {drop:.3f} s  ->  song start = {best - drop:.3f} s  (EDL: {{\"out_t\": 0.0, \"song_t\": {best - drop:.3f}}})")


if __name__ == "__main__":
    main()
