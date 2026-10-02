"""
Encode a PNG sequence (sRGB, RGB or RGBA) to the delivery MP4: optional motion blur, an explicit
BT.709 conversion with dither, 8-bit yuv420p, limited range, tagged.

    python tools/encode_seq.py <png_dir> <out.mp4> [--in-fps 480] [--sub 8] [--crf 10] [--preset slow]

--sub N averages N consecutive capture frames per output frame (tmix) and keeps one in N, so the
output runs at in_fps / N with a 360-degree shutter: 480 fps / 8 = 60 fps, 240 fps / 8 = 30 fps.
Fewer subframes (240 / 4) step fast moves into visible copies. --sub 1 encodes every frame as is
(draft path).

Colour (an implicit conversion shifted a brand colour by ~4 levels and banded a near-white
gradient in the reference project; these steps fixed both):
  1. Frames are read as full-range RGB and widened to 16 bit by zscale (255 -> 65535) before the
     blur, so the average of N frames is not rounded back to 8 bit. (swscale's format=gbrp16le
     maps 255 to 65280, which put white at Y 234 and every colour ~0.9 LSB too dark.)
  2. They are tagged as what they are (RGB, full range, BT.709 primaries/transfer) and zscale
     converts them with the BT.709 matrix to limited-range YUV, with error-diffusion dither on the
     way down to 8 bit. No transfer or primaries conversion: the pixel values stay the browser's
     sRGB values, as players expect from BT.709-tagged web video.
  3. The stream is tagged bt709 / tv in the container and in the H.264 VUI.
  4. x264 keeps the dither: no `-tune animation` (it lowers AQ, which bands gradients),
     aq-mode 3, slightly weaker deblocking.
  5. Every frame gets the same PNG mode first. A sequence that mixes RGB and RGBA frames makes
     ffmpeg rebuild the filter graph mid-stream, which restarts tmix/select and silently drops
     frames. Odd frames are converted to the majority mode and the output frame count is checked.
Check the result with tools/check_encode.py and tools/qa_motion.py.
"""
import argparse, json, os, re, subprocess, sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

try:  # Windows consoles default to cp1252
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def build_cmd(pattern, start, out, in_fps, sub, crf, preset, dither):
    out_fps = in_fps / sub
    out_fps_s = str(int(out_fps)) if float(out_fps).is_integer() else f"{in_fps}/{sub}"
    tag = "setparams=range=pc:color_primaries=bt709:color_trc=bt709:colorspace=gbr"
    vf = ["format=gbrp", tag, "zscale=rangein=full:range=full:dither=none", "format=gbrp16le"]
    if sub > 1:
        vf += [
            f"tmix=frames={sub}",
            f"select='eq(mod(n\\,{sub})\\,{sub - 1})'",
        ]
    vf += [
        f"setpts=N/({out_fps_s})/TB",
        tag,
        f"zscale=matrix=709:range=limited:primaries=709:transfer=709:chromal=left:dither={dither}",
        "format=yuv420p",
    ]
    x264 = "aq-mode=3:aq-strength=0.9:deblock=-1,-1:colorprim=bt709:transfer=bt709:colormatrix=bt709:range=tv"
    return [
        "ffmpeg", "-v", "error", "-y", "-framerate", str(in_fps), "-start_number", str(start), "-i", pattern,
        "-vf", ",".join(vf), "-r", out_fps_s,
        "-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p", "-x264-params", x264,
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
        "-movflags", "+faststart", out,
    ], out_fps_s


def normalise_modes(seq, files):
    from PIL import Image

    def mode(f):
        with Image.open(os.path.join(seq, f)) as im:
            return im.mode

    with ThreadPoolExecutor(8) as ex:
        modes = list(ex.map(mode, files))
    counts = Counter(modes)
    if len(counts) <= 1:
        return dict(counts), 0
    target = "RGBA" if counts.get("RGBA", 0) > counts.get("RGB", 0) else "RGB"
    odd = [f for f, m in zip(files, modes) if m != target]

    def fix(f):
        p = os.path.join(seq, f)
        with Image.open(p) as im:
            im2 = im.convert(target)
        im2.save(p, compress_level=1)

    with ThreadPoolExecutor(8) as ex:
        list(ex.map(fix, odd))
    return dict(counts), len(odd)


def count_frames(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries",
                          "stream=nb_read_packets", "-of", "json", path], capture_output=True, text=True, check=True).stdout
    return int(json.loads(out)["streams"][0]["nb_read_packets"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("seq")
    ap.add_argument("out")
    ap.add_argument("--in-fps", type=int, default=480)
    ap.add_argument("--sub", type=int, default=8)
    ap.add_argument("--crf", type=int, default=10)
    ap.add_argument("--preset", default="slow")
    ap.add_argument("--dither", default="error_diffusion", choices=["error_diffusion", "ordered", "random", "none"])
    a = ap.parse_args()
    if a.sub < 1:
        sys.exit("--sub must be >= 1")

    files = sorted(f for f in os.listdir(a.seq) if f.lower().endswith(".png"))
    if not files:
        sys.exit(f"no PNGs in {a.seq}")
    m = re.match(r"^(.*?)(\d+)\.png$", files[0])
    if not m:
        sys.exit(f"cannot parse frame name {files[0]}")
    prefix, digits = m.group(1), m.group(2)
    # the sequence must be contiguous: a gap ends ffmpeg's image2 reader early
    first = int(digits)
    idx = [int(re.match(r"^.*?(\d+)\.png$", f).group(1)) for f in files]
    if idx != list(range(first, first + len(files))):
        sys.exit(f"{a.seq}: frame numbers are not contiguous ({len(files)} files from {first})")
    pattern = os.path.join(a.seq, f"{prefix}%0{len(digits)}d.png")
    modes, fixed = normalise_modes(a.seq, files)
    if fixed:
        print(f"PNG modes {modes}: converted {fixed} frame(s) to the majority mode")
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    cmd, out_fps = build_cmd(pattern, first, a.out, a.in_fps, a.sub, a.crf, a.preset, a.dither)
    print(" ".join(cmd))
    subprocess.run(cmd, check=True)
    want, got = len(files) // a.sub, count_frames(a.out)
    if got != want:
        sys.exit(f"frame count mismatch: {a.out} has {got} frames, expected {want}")
    print(f"wrote {a.out} ({len(files)} capture frames -> {got} frames at {out_fps} fps, {a.sub} subframes each)")


if __name__ == "__main__":
    main()
