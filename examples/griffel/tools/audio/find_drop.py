"""
Find the drop of a music track by bass energy (never trust an automatic beat grid).
    python tools/audio/find_drop.py assets/audio/licensed/<track>.wav [--around 116]
Prints the bar-level bass energy jumps, then zooms to 20 ms windows around the best candidate.
"""
import subprocess, sys
import numpy as np

SR = 22050


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def lowpass(x, fc=150):
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
    path = sys.argv[1]
    around = None
    if "--around" in sys.argv:
        around = float(sys.argv[sys.argv.index("--around") + 1])
    x = load(path)
    lp = lowpass(x)
    win = 0.5
    times = np.arange(0, len(x) / SR - win, win)
    e = np.array([db(lp[int(t * SR) : int((t + win) * SR)]) for t in times])
    jumps = np.diff(e)
    order = np.argsort(-jumps)
    print("top bass-energy jumps (t_song, +dB):")
    for i in order[:8]:
        print(f"  {times[i + 1]:7.2f}  +{jumps[i]:.1f} dB")
    cand = around if around is not None else times[order[0] + 1]
    print(f"\nzoom around {cand:.2f} s (20 ms windows):")
    best, bestj = cand, -1e9
    prev = None
    for t in np.arange(cand - 0.4, cand + 0.4, 0.02):
        v = db(lp[int(t * SR) : int((t + 0.02) * SR)])
        if prev is not None and v - prev > bestj:
            bestj, best = v - prev, t
        prev = v
        print(f"  {t:7.2f}  {v:6.1f} dB")
    print(f"\nDROP (song time) ~= {best:.3f} s  ->  song start for film = drop_song - 22.0 = {best - 22.0:.3f} s")


if __name__ == "__main__":
    main()
