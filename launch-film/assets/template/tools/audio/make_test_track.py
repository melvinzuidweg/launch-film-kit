"""
Synthesise a 120 BPM TEST track for exercising the audio pipeline before real music is chosen
(or in CI). It is a click-track sketch, not music: never ship it.

    python tools/audio/make_test_track.py [--out renders/audio/test-track.wav] [--drop 16] [--hit 32] [--length 40]

Structure (song time, bars of 2.0 s from 0): hats and a soft pad until --drop; at --drop the kick
and a bass line come in (a clear bass-energy jump for tools/audio/find_drop.py); a final
low "hit" at --hit, then the pad rings out. With the defaults and the template's film (drop at
output 4.0, logo lock at 8.0), tools/audio/edl.example.json starts the song at 12.0 and jumps
6 bars ahead at output 6.0, so the drop lands on the key tap and the hit on the lock.
"""
import argparse, os, sys, wave
import numpy as np

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SR = 48000
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="renders/audio/test-track.wav")
    ap.add_argument("--bpm", type=float, default=120.0)
    ap.add_argument("--drop", type=float, default=16.0)
    ap.add_argument("--hit", type=float, default=32.0)
    ap.add_argument("--length", type=float, default=40.0)
    a = ap.parse_args()
    n = int(a.length * SR)
    t = np.arange(n) / SR
    beat = 60.0 / a.bpm
    rng = np.random.default_rng(3)
    x = np.zeros(n)

    def place(sig, at, gain=1.0):
        i = int(at * SR)
        j = min(n, i + len(sig))
        if j > i:
            x[i:j] += sig[: j - i] * gain

    # pad: a soft major chord, swelling per bar, until the hit, then ringing out
    pad = sum(np.sin(2 * np.pi * f * t) for f in (220.0, 277.18, 329.63)) / 3
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * t / (4 * beat) - np.pi / 2)
    tail = np.where(t < a.hit, 1.0, np.exp(-(t - a.hit) * 1.2))
    x += pad * (0.06 + 0.04 * swell) * tail

    # hats on every 8th note until the hit
    hl = int(0.04 * SR)
    hat = rng.standard_normal(hl) * np.exp(-np.arange(hl) / SR * 120)
    hat = np.diff(np.concatenate([[0.0], hat]))  # crude high-pass
    k = 0.0
    while k < a.hit:
        place(hat, k, 0.10 if (k / (beat / 2)) % 2 else 0.16)
        k += beat / 2

    # from the drop: kick on every beat and a bass note per bar (the bass-energy jump)
    kl = int(0.35 * SR)
    kt = np.arange(kl) / SR
    kick = np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-kt * 30)) / SR) * np.exp(-kt * 9)
    b = a.drop
    while b < a.hit - 1e-6:
        place(kick, b, 0.9)
        b += beat
    roots = [55.0, 55.0, 61.74, 49.0]
    bar, i = a.drop, 0
    while bar < a.hit - 1e-6:
        L = int(4 * beat * SR)
        bt = np.arange(L) / SR
        note = np.sin(2 * np.pi * roots[i % 4] * bt) * np.minimum(1, bt / 0.01) * np.exp(-bt * 0.8)
        place(note, bar, 0.45)
        bar += 4 * beat
        i += 1

    # the final hit: a big low thump with a noise burst
    hl2 = int(1.5 * SR)
    ht = np.arange(hl2) / SR
    hit = np.sin(2 * np.pi * np.cumsum(45 + 60 * np.exp(-ht * 12)) / SR) * np.exp(-ht * 2.5) + rng.standard_normal(hl2) * np.exp(-ht * 18) * 0.3
    place(hit, a.hit, 1.0)

    x = x / (np.abs(x).max() + 1e-9) * 0.8
    st = np.stack([x, x], 1)
    out = a.out if os.path.isabs(a.out) else os.path.join(ROOT, a.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print(f"wrote {out}: {a.length:.1f} s at {a.bpm:g} BPM, drop at {a.drop:.2f} s, final hit at {a.hit:.2f} s (TEST ONLY)")


if __name__ == "__main__":
    main()
