"""
Check the colour of a delivery MP4 by decoding frames with an explicit BT.709 limited-range matrix.

    python tools/check_encode.py renders/film-169-final.mp4
        [--brand "#5b5bd6"] [--mark-t 11.5] [--white-t 0] [--band-t 0] [--ref-dir renders/check-ref]
        [--white-box x0,y0,x1,y1] [--band-cols c1,c2,c3] [--band-rows y0,y1] [--band-max 1.5]
        [--checks tags,white,banding,mark]

Checks:
  tags   : yuv420p, limited ("tv") range, bt709 matrix/transfer/primaries in the stream.
  mark   : pixels of the brand colour (the logo on the end card at --mark-t, default 0.5 s before
           the end): their median must be within +-2 per channel of --brand (default: --brand in
           src/tokens.css). A failure here means the encode shifted the brand colour.
  white  : a white area of the stage at --white-t: median #FFFFFF +-1 and 1st percentile >= 253.
  banding: a smooth stage gradient at --band-t. Columns clear of text are averaged over 24 px and
           5 rows each side of every row boundary (removes the dither). With --ref-dir (the source
           PNG t_<t>.png of that frame from tools/still.mjs) the check runs on decoded-minus-source,
           so only encoder bands count (<= 1.5 levels: about one 8-bit level is unavoidable on a
           smooth gradient; the failure this exists for was a 3-4 level step); without it on the
           decoded red channel (<= 3). Override with --band-max.
           Check banding on a FINAL, not a draft: a CRF 14 draft adds quantisation steps of its
           own (two tests: 1.9-2.1 on drafts, 1.05-1.29 on finals of the same frame; limit 1.5).
           Before the full final exists, render half a second of it and the matching still:
               node tools/render.mjs 45 final --from 0 --to 0.5
               node tools/still.mjs --page portrait.html --times 0 --out renders/check-ref
               python tools/check_encode.py renders/film-45-final-0-0.5.mp4 --checks tags,white,banding --ref-dir renders/check-ref
           A final frame averages 8 subframes over 15 ms, so it matches the still only where the
           stage does not move in that time; frame 0 does in the template. On a draft, skip the
           banding check (--checks tags,white,mark) or read it against --band-max 2.5.
The default boxes and columns fit the template's frame 0 (text left/top, phone bottom right/centre).
Move them when your layout differs: they must sit on plain stage, away from text and the phone.
Exit code 1 when a check fails.
"""
import argparse, json, os, re, subprocess, sys
import numpy as np
from PIL import Image

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def token_brand():
    try:
        css = open(os.path.join(ROOT, "src", "tokens.css"), encoding="utf-8").read()
        m = re.search(r"--brand\s*:\s*(#[0-9a-fA-F]{6})", css)
        return m.group(1) if m else None
    except OSError:
        return None


def hex_rgb(h):
    h = h.strip().lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)])


def probe(mp4):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height,pix_fmt,color_range,color_space,color_transfer,color_primaries,r_frame_rate:format=duration",
                          "-of", "json", mp4], capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    s = j["streams"][0]
    s["duration"] = float(j.get("format", {}).get("duration", 0) or 0)
    return s


def decode(mp4, t, w, h):
    # explicit BT.709 limited -> full-range RGB, accurate rounding
    vf = "zscale=matrixin=709:rangein=limited:matrix=709:range=full,format=gbrp,format=rgb24"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.4f}", "-i", mp4, "-frames:v", "1", "-vf", vf,
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8)[: w * h * 3].reshape(h, w, 3).astype(int)


def mark_check(img, brand):
    near = np.abs(img - brand).max(axis=2) <= 24
    inner = near.copy()
    for dy, dx in [(-3, 0), (3, 0), (0, -3), (0, 3), (-3, -3), (3, 3), (-3, 3), (3, -3)]:
        inner &= np.roll(np.roll(near, dy, 0), dx, 1)
    if inner.sum() < 50:
        return False, {"error": "brand colour not found (is the logo on screen at --mark-t?)", "pixels": int(inner.sum())}
    med = np.median(img[inner], axis=0)
    dev = np.abs(med - brand)
    return bool(dev.max() <= 2), {"pixels": int(inner.sum()), "median": med.round(1).tolist(), "target": brand.tolist(), "max_dev": float(dev.max())}


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
    source), so the source's own gradient cancels; dither noise averages out."""
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


def ints(s):
    return [int(float(v)) for v in str(s).split(",")]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mp4")
    ap.add_argument("--brand", default=None)
    ap.add_argument("--mark-t", type=float, default=None)
    ap.add_argument("--white-t", type=float, default=0.0)
    ap.add_argument("--band-t", type=float, default=0.0)
    ap.add_argument("--ref-dir", default=None)
    ap.add_argument("--white-box", default=None)
    ap.add_argument("--band-cols", default=None)
    ap.add_argument("--band-rows", default=None)
    ap.add_argument("--band-max", type=float, default=None)
    ap.add_argument("--checks", default="tags,white,banding,mark")
    a = ap.parse_args()
    checks = set(c.strip() for c in a.checks.split(",") if c.strip())

    s = probe(a.mp4)
    w, h = int(s["width"]), int(s["height"])
    portrait = h > w
    white_box = ints(a.white_box) if a.white_box else ([700, 90, 1060, 200] if portrait else [1300, 30, 1900, 200])
    band_cols = ints(a.band_cols) if a.band_cols else ([1000, 1040, 1066] if portrait else [1700, 1800, 1890])
    band_rows = ints(a.band_rows) if a.band_rows else ([250, h - 20] if portrait else [200, h - 20])
    report = {"file": a.mp4, "stream": s}
    passed = {}

    if "tags" in checks:
        passed["tags"] = s.get("pix_fmt") == "yuv420p" and s.get("color_range") == "tv" and s.get("color_space") == "bt709" \
            and s.get("color_transfer") == "bt709" and s.get("color_primaries") == "bt709"
    if "mark" in checks:
        brand_hex = a.brand or token_brand()
        if not brand_hex:
            sys.exit("no --brand given and no --brand token found in src/tokens.css")
        mt = a.mark_t if a.mark_t is not None else max(0.0, s["duration"] - 0.5)
        passed["mark"], report["mark"] = mark_check(decode(a.mp4, mt, w, h), hex_rgb(brand_hex))
        report["mark"]["t"] = mt
    f0 = None
    if "white" in checks:
        f0 = decode(a.mp4, a.white_t, w, h)
        passed["white"], report["white"] = white_check(f0, white_box)
    if "banding" in checks:
        fb = f0 if (f0 is not None and a.band_t == a.white_t) else decode(a.mp4, a.band_t, w, h)
        ref = None
        if a.ref_dir:
            rp = os.path.join(a.ref_dir, f"t_{a.band_t:06.2f}.png")
            if os.path.exists(rp):
                ref = np.array(Image.open(rp).convert("RGB")).astype(int)
        worst, report["banding"] = band_steps(fb, band_cols, band_rows, ref)
        limit = a.band_max if a.band_max is not None else (1.5 if ref is not None else 3.0)
        passed["banding"] = worst <= limit
        report["banding_limit"] = limit
        report["banding_worst"] = round(worst, 2)
        report["banding_mode"] = "excess over source" if ref is not None else "absolute"
    report["pass"] = passed
    print(json.dumps(report, indent=1))
    sys.exit(0 if all(passed.values()) else 1)


if __name__ == "__main__":
    main()
