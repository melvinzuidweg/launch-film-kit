"""
Interleave K capture passes (each a PNG sequence at the same fps, pass k rendered with a time offset
of k / (K * fps)) into one sequence at K * fps.

    python tools/interleave_seq.py <out_dir> <pass0_dir> <pass1_dir> [...]

Frames are moved (not copied): pass k's i-th frame (sorted by name) becomes out frame i * K + k,
named f_%07d.png from 0. All passes must hold the same number of frames.
"""
import os, sys


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    out, passes = sys.argv[1], sys.argv[2:]
    lists = [sorted(f for f in os.listdir(p) if f.lower().endswith(".png")) for p in passes]
    n = len(lists[0])
    if n == 0 or any(len(l) != n for l in lists):
        sys.exit(f"pass sizes differ or are empty: {[len(l) for l in lists]}")
    os.makedirs(out, exist_ok=True)
    k = len(passes)
    for j, (p, l) in enumerate(zip(passes, lists)):
        for i, f in enumerate(l):
            os.replace(os.path.join(p, f), os.path.join(out, f"f_{i * k + j:07d}.png"))
    print(f"interleaved {k} passes x {n} frames -> {k * n} frames in {out}")


if __name__ == "__main__":
    main()
