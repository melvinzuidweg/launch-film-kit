"""
Check the colour of a delivery MP4 by decoding frames with an explicit BT.709 limited-range matrix.

    python tools/check_encode.py renders/film-169-final.mp4 [--mark-t 47.5] [--white-t 0.0] [--band-t 0.0]
                                 [--ref-dir renders/check-ref]   (optional PNGs t_<t>.png from tools/still.mjs)

Checks (fix 3):
  mark   : interior pixels of the brand mark (#1ABA6D) on the end card, median within +-2 per channel
  white  : the white stage at the top of frame 0, median #FFFFFF +-1 (and 99th percentile >= 253)
  banding: the near-white stage gradient on frame 0. Columns clear of text are averaged over 24 px
           horizontally and 5 rows on each side of every row boundary (removes the dither). With
           --ref-dir (the source PNG of that frame, from tools/still.mjs) the check runs on the
           decoded-minus-source residual, so only encoder bands count (<= 1.0); without it, on the
           decoded R itself (<= 3; the old draft stepped 246 -> 242 in one row).
Exit code 1 when a check fails.
"""
import argparse, json, os, subprocess, sys
import numpy as np
from PIL import Image

BRAND = np.array([26, 186, 109])


def probe(mp4):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height,pix_fmt,color_range,color_space,color_transfer,color_primaries,r_frame_rate",
                          "-of", "json", mp4], capture_output=True, text=True, check=True).stdout
    return json.loads(out)["streams"][0]


def decode(mp4, t, w, h):
    # explicit BT.709 limited -> full-range RGB, accurate rounding, full chroma interpolation
    vf = "zscale=matrixin=709:rangein=limited:matrix=709:range=full,format=gbrp,format=rgb24"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.4f}", "-i", mp4, "-frames:v", "1", "-vf", vf,
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8)[: w * h * 3].reshape(h, w, 3).astype(int)


def mark_check(img):
    near = np.abs(img - BRAND).max(axis=2) <= 24
    inner = near.copy()
    for dy, dx in [(-3, 0), (3, 0), (0, -3), (0, 3), (-3, -3), (3, 3), (-3, 3), (3, -3)]:
        inner &= np.roll(np.roll(near, dy, 0), dx, 1)
    if inner.sum() < 50:
        return False, {"error": "mark not found", "pixels": int(inner.sum())}
    med = np.median(img[inner], axis=0)
    dev = np.abs(med - BRAND)
    return bool(dev.max() <= 2), {"pixels": int(inner.sum()), "median": med.round(1).tolist(), "target": BRAND.tolist(), "max_dev": float(dev.max())}


def white_check(img, box):
    x0, y0, x1, y1 = box
    reg = img[y0:y1, x0:x1].reshape(-1, 3)
    med = np.median(reg, axis=0)
    p1 = np.percentile(reg, 1, axis=0)
    ok = bool(np.abs(med - 255).max() <= 1 and p1.min() >= 253)
    return ok, {"box": box, "median": med.tolist(), "p1": p1.tolist()}


def col_profile(img, c, rows):
    y0, y1 = rows
    return img[y0:y1, c - 12:c + 12, 0].mean(axis=1)


def band_steps(img, cols, rows, ref=None, k=5):
    """A band is a step that persists: the mean of the k rows below a row boundary minus the mean
    of the k rows above it. With a reference the step is measured on the residual (decoded minus
    source), so the source's own gradient and its ring lines cancel; dither noise averages out."""
    res = {}
    worst = 0.0
    for c in cols:
        p = col_profile(img, c, rows)
        r = p - col_profile(ref, c, rows) if ref is not None else p
        cs = np.concatenate([[0.0], np.cumsum(r)])
        n = len(r)
        idx = np.arange(k, n - k + 1)
        below = (cs[idx + k] - cs[idx]) / k
        above = (cs[idx] - cs[idx - k]) / k
        st = np.abs(below - above)
        i = int(st.argmax())
        res[str(c)] = {"worst": round(float(st[i]), 2), "at_y": rows[0] + int(idx[i])}
        worst = max(worst, float(st[i]))
    return worst, res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mp4")
    ap.add_argument("--mark-t", type=float, default=47.5)
    ap.add_argument("--white-t", type=float, default=0.0)
    ap.add_argument("--band-t", type=float, default=0.0)
    ap.add_argument("--ref-dir", default=None)
    a = ap.parse_args()

    s = probe(a.mp4)
    w, h = int(s["width"]), int(s["height"])
    tags_ok = s.get("pix_fmt") == "yuv420p" and s.get("color_range") == "tv" and s.get("color_space") == "bt709" \
        and s.get("color_transfer") == "bt709" and s.get("color_primaries") == "bt709"
    portrait = h > w
    # regions clear of text/UI on frame 0 (16:9: right of the hook line, above the phone's entry;
    # 4:5: right of the VOORBEELD label, above the hook line)
    white_box = [700, 90, 1060, 200] if portrait else [1300, 30, 1900, 200]
    band_cols = [1000, 1040, 1066] if portrait else [1500, 1700, 1880]
    band_rows = [250, h - 20] if portrait else [200, h - 20]

    report = {"file": a.mp4, "stream": s, "tags_ok": tags_ok}
    ok = tags_ok
    m_ok, report["mark"] = mark_check(decode(a.mp4, a.mark_t, w, h)); ok &= m_ok
    f0 = decode(a.mp4, a.white_t, w, h)
    w_ok, report["white"] = white_check(f0, white_box); ok &= w_ok
    fb = f0 if a.band_t == a.white_t else decode(a.mp4, a.band_t, w, h)
    ref = None
    if a.ref_dir:
        rp = os.path.join(a.ref_dir, f"t_{a.band_t:06.2f}.png")
        if os.path.exists(rp):
            ref = np.array(Image.open(rp).convert("RGB")).astype(int)
    worst, report["banding"] = band_steps(fb, band_cols, band_rows, ref)
    b_ok = worst <= (1.0 if ref is not None else 3.0)
    ok &= b_ok
    report["banding_worst"] = round(worst, 2)
    report["banding_mode"] = "excess over source" if ref is not None else "absolute"
    report["pass"] = {"tags": tags_ok, "mark": m_ok, "white": w_ok, "banding": b_ok}
    print(json.dumps(report, indent=1))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
