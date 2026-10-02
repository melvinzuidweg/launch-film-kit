"""
Motion QA on a rendered MP4: frozen stretches and single-frame spikes.

    python tools/qa_motion.py renders/film-169-draft.mp4 [--max-freeze 0.6] [--freeze-eps 0.015]
                              [--spike-ratio 4] [--spike-min 1.5] [--peak-max 6] [--plot renders/qa-169.png]

Every frame is decoded small (320 px wide, grayscale) and compared with the previous one (mean
absolute difference, 0..255).
  freeze : a run of frames that differ from the frame 0.1 s earlier by less than --freeze-eps
           for longer than --max-freeze seconds. (The 0.1 s lag lets a slow drift, e.g. a 1.5 %
           zoom over 4 s on the end card, add up to a measurable change; an encoded frozen frame
           stays near 0.) A held frame reads as a stall or a hang; give every hold a slow drift
           (the reference bar was no freeze over 0.6 s, none over 0.4 s near the end).
  spike  : "jump": one frame-to-frame change --spike-ratio times its neighbourhood (median of the
           changes around it) and at least --spike-min, with small changes on both sides: a hard
           cut, a pop-in, a one-frame snap. "blip": one frame that differs from both neighbours
           while they agree with each other: an element that flips for a single frame.
           A deliberate cut shows up as a jump too; this film style has none.
  peak   : stretches where the frame-to-frame change exceeds --peak-max (default 6, the bar for
           big transitions: a light change, a full-frame fade, a fast push). Listed with their
           start, end and highest value. The change per frame scales with 1/duration, so the fix is
           a longer move: in one 10 s test, a 0.45 s phone fade at zoom 1.6 peaked at 9.6 and a
           1.1 s push from zoom 0.86 to 1.6 at 7.9; at 0.7 s and 1.45 s both were about 6.9.
           A draft has no motion blur and reads a little high (one case move: 11.99 on the draft,
           10.0 in the final); judge the final, or accept up to about 7 on a draft. --peak-max 0
           turns the check off.
Prints a JSON report; exit code 1 when anything is found. --plot writes the difference curve
(grey), the --peak-max line (orange dashes), spikes (red) and freezes (blue bands).
"""
import argparse, json, subprocess, sys
import numpy as np

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def probe(mp4):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                          "-of", "json", mp4], capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    n, d = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(n) / float(d)


def frames(mp4, w, h):
    sw = 320
    sh = int(round(h * sw / w / 2)) * 2
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-vf", f"scale={sw}:{sh}:flags=area,format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    # kept as uint8 (about 128 KB per 4:5 frame): a float copy of a 52 s film needed ~4.5 GB of RAM
    return np.frombuffer(raw, np.uint8).reshape(-1, sh, sw)


def lagged_diff(f, k, chunk=256):
    """mean |f[j + k] - f[j]| per frame pair, in chunks so memory stays small"""
    n = max(0, len(f) - k)
    out = np.empty(n, np.float64)
    for s in range(0, n, chunk):
        e = min(n, s + chunk)
        out[s:e] = np.abs(f[s + k:e + k].astype(np.int16) - f[s:e].astype(np.int16)).mean(axis=(1, 2))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mp4")
    ap.add_argument("--max-freeze", type=float, default=0.6)
    ap.add_argument("--freeze-eps", type=float, default=0.015)
    ap.add_argument("--spike-ratio", type=float, default=4.0)
    ap.add_argument("--spike-min", type=float, default=1.5)
    ap.add_argument("--peak-max", type=float, default=6.0)
    ap.add_argument("--plot", default=None)
    a = ap.parse_args()

    w, h, fps = probe(a.mp4)
    f = frames(a.mp4, w, h)
    d = lagged_diff(f, 1)                                   # d[i]: frame i -> i + 1
    t = (np.arange(len(d)) + 1) / fps                       # time of the later frame

    k = max(1, int(round(0.1 * fps)))
    lag = lagged_diff(f, k)                                 # lag[j]: frame j -> j + k
    freezes, run = [], 0
    for j, v in enumerate(np.append(lag, np.inf)):
        if v < a.freeze_eps:
            run += 1
        else:
            if run > 0 and (run + k) / fps > a.max_freeze:
                freezes.append({"from": round((j - run) / fps, 3), "to": round((j - 1 + k) / fps, 3), "seconds": round((run + k - 1) / fps, 3)})
            run = 0

    # spikes: (a) "jump": one frame-to-frame change far above its neighbourhood while both
    # neighbouring changes are small (a hard cut, a pop-in, a one-frame snap); (b) "blip": one
    # frame that differs from both neighbours while those two neighbours agree (an element that
    # flips for a single frame)
    spikes = []
    base_of = lambda i: float(np.median(np.concatenate([d[max(0, i - 6):i], d[i + 1:i + 7]]))) if len(d) > 1 else 0.0
    for i in range(len(d)):
        base = base_of(i)
        left = d[i - 1] if i > 0 else 0.0
        right = d[i + 1] if i + 1 < len(d) else 0.0
        if d[i] >= a.spike_min and d[i] > a.spike_ratio * max(base, 0.05) and max(left, right) < d[i] / 2:
            spikes.append({"kind": "jump", "t": round(float(t[i]), 3), "diff": round(float(d[i]), 2), "neighbourhood": round(base, 2)})
    for i in range(1, len(f) - 1):
        a_in, a_out = d[i - 1], d[i]                       # frame i-1 -> i and i -> i+1
        lo_ = min(a_in, a_out)
        if lo_ < a.spike_min:
            continue
        around = float(np.median(np.concatenate([d[max(0, i - 8):i - 1], d[i + 1:i + 8]]))) if len(d) > 3 else 0.0
        skip = float(np.abs(f[i + 1].astype(np.int16) - f[i - 1].astype(np.int16)).mean())
        if lo_ > a.spike_ratio * max(around, 0.05) and skip < lo_ / 2:
            spikes.append({"kind": "blip", "t": round(i / fps, 3), "diff": round(float(lo_), 2), "neighbourhood": round(around, 2)})

    # peaks: runs of frames whose change exceeds --peak-max (big transitions)
    peaks = []
    if a.peak_max > 0:
        over = np.append(d > a.peak_max, False)
        j = 0
        while j < len(d):
            if over[j]:
                k2 = j
                while over[k2 + 1]:
                    k2 += 1
                m = j + int(d[j:k2 + 1].argmax())
                peaks.append({"from": round(float(t[j]), 3), "to": round(float(t[k2]), 3), "max": round(float(d[m]), 2), "max_t": round(float(t[m]), 3)})
                j = k2 + 1
            else:
                j += 1

    report = {
        "file": a.mp4, "fps": fps, "frames": int(len(f)),
        "diff_mean": round(float(d.mean()), 3), "lag_min": round(float(lag.min()), 3), "diff_max": round(float(d.max()), 2), "diff_max_t": round(float(t[int(d.argmax())]), 3),
        "peak_max": a.peak_max, "freezes": freezes, "spikes": spikes, "peaks": peaks,
    }
    if a.plot:
        # the difference curve as a PNG (PIL only): grey = frame-to-frame change, red = spikes,
        # blue bands = freezes; one tick per second
        from PIL import Image, ImageDraw
        W, H, pad = 1400, 260, 24
        img = Image.new("RGB", (W, H), "white")
        dr = ImageDraw.Draw(img)
        dur = len(f) / fps
        top = max(1.0, float(d.max()) * 1.05, a.peak_max * 1.1)   # axis headroom only; the title shows the real max
        X = lambda tt: pad + (W - 2 * pad) * tt / dur
        Y = lambda v: H - pad - (H - 2 * pad) * min(v, top) / top
        for fz in freezes:
            dr.rectangle([X(fz["from"]), pad, X(fz["to"]), H - pad], fill=(214, 228, 255))
        for sec in range(int(dur) + 1):
            dr.line([X(sec), H - pad, X(sec), H - pad + 5], fill=(120, 120, 120))
            dr.text((X(sec) + 2, H - pad + 6), str(sec), fill=(90, 90, 90))
        if a.peak_max > 0:
            for x0 in range(pad, W - pad, 12):
                dr.line([x0, Y(a.peak_max), min(x0 + 6, W - pad), Y(a.peak_max)], fill=(235, 140, 30), width=1)
        dr.line([(X(tt), Y(v)) for tt, v in zip(t, d)], fill=(60, 60, 60), width=1)
        for sp in spikes:
            dr.line([X(sp["t"]), pad, X(sp["t"]), H - pad], fill=(220, 40, 40), width=2)
        dr.text((pad, 4), f"{a.mp4}: mean |frame diff| per frame (max {report['diff_max']:.2f} at {report['diff_max_t']:.2f} s, limit {a.peak_max:g})", fill=(0, 0, 0))
        img.save(a.plot)
        report["plot"] = a.plot
    print(json.dumps(report, indent=1))
    sys.exit(1 if freezes or spikes or peaks else 0)


if __name__ == "__main__":
    main()
