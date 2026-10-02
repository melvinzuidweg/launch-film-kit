"""
Edit-decision-list mix: music with phrase-aligned jumps, low-pass windows, SFX on measured peaks,
two-pass loudnorm. All times are OUTPUT (video) seconds unless named song_*.

    python tools/audio/mix_edl.py --edl renders/audio/edl-169.json --cues renders/audio/cues.json --out renders/audio/mix-169

EDL JSON:
{
  "music": "assets/audio/licensed/hartzmann-just-flow.wav",
  "duration": 52.364,                      # output length (s)
  "segments": [                            # at out_t the song position jumps to song_t (30 ms crossfade)
    {"out_t": 0.0,   "song_t": 81.0},
    {"out_t": 39.27, "song_t": 137.72}
  ],
  "lowpass": [[0.0, 24.0]],                # out-time windows where the music is muffled (~700 Hz)
  "lp_ramp": 0.4,                          # open/close ramp (s), smoothstep; opening ends exactly at the window end
  "fade_out": 0.0,                         # optional linear fade at the end (s)
  "music_gain": 0.8, "sfx_gain": 0.5, "target_lufs": -14.0
}
Writes <out>.wav (full mix) and <out>-music-only.wav (both loudness-normalised).
"""
import argparse, json, os, subprocess, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
SFX_DIR = os.path.join(HERE, "..", "..", "assets", "audio", "sfx")


def decode(path, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path]
    if af:
        cmd += ["-af", af]
    cmd += ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def loudnorm(src, dst, I=-14.0, TP=-1.0, LRA=11.0):
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(p1[p1.rfind("{"): p1.rfind("}") + 1])
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", af, "-ar", str(SR), dst], check=True)
    return j


def assemble(src, segments, n, xfade=0.03):
    """Concatenate song pieces: piece k plays from song_t_k at out_t_k until out_t_{k+1}."""
    out = np.zeros((n, 2))
    xf = int(xfade * SR)
    for k, seg in enumerate(segments):
        o0 = int(round(seg["out_t"] * SR))
        o1 = int(round(segments[k + 1]["out_t"] * SR)) if k + 1 < len(segments) else n
        s0 = int(round(seg["song_t"] * SR))
        length = o1 - o0 + (xf if k + 1 < len(segments) else 0)
        piece = src[s0: s0 + length]
        if len(piece) < length:
            piece = np.concatenate([piece, np.zeros((length - len(piece), 2))])
        env = np.ones((length, 1))
        if k > 0:
            env[:xf, 0] = np.linspace(0, 1, xf)
        if k + 1 < len(segments):
            env[-xf:, 0] = np.linspace(1, 0, xf)
        end = min(n, o0 + length)
        out[o0:end] += (piece * env)[: end - o0]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--edl", required=True)
    ap.add_argument("--cues", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    E = json.load(open(a.edl, encoding="utf-8"))
    C = json.load(open(a.cues, encoding="utf-8"))
    dur = float(E.get("duration", C["duration"]))
    n = int(dur * SR)
    full = decode(E["music"])
    lp = decode(E["music"], "lowpass=f=700,lowpass=f=700")
    segs = sorted(E["segments"], key=lambda s: s["out_t"])
    mf, ml = assemble(full, segs, n), assemble(lp, segs, n)
    t = np.arange(n) / SR
    ramp = float(E.get("lp_ramp", 0.4))
    muff = np.zeros(n)
    for w0, w1 in E.get("lowpass", []):
        # 1 inside the window; closes over `ramp` after w0 (unless w0 == 0), opens over `ramp` ending at w1
        u_in = np.ones(n) if w0 <= 0 else np.clip((t - w0) / ramp, 0, 1)
        u_out = np.clip((w1 - t) / ramp, 0, 1)
        m = np.minimum(u_in, u_out) * ((t >= w0) & (t <= w1))
        muff = np.maximum(muff, m * m * (3 - 2 * m))
    music = ml * muff[:, None] * 1.25 + mf * (1 - muff)[:, None]
    fo = float(E.get("fade_out", 0))
    if fo > 0:
        music *= np.clip((dur - t) / fo, 0, 1)[:, None]
    music *= float(E.get("music_gain", 0.8))

    sfx = np.zeros((n, 2))
    cache = {}
    for c in C["cues"]:
        name = c["sfx"]
        if name not in cache:
            cache[name] = decode(os.path.join(SFX_DIR, name + ".wav"))
        s = cache[name] / (np.abs(cache[name]).max() + 1e-9) * c.get("gain", 1.0)
        peak = int(np.abs(s).sum(1).argmax())
        start = int(c["t"] * SR) - peak
        a0, b0 = max(0, start), min(n, start + len(s))
        if b0 > a0:
            sfx[a0:b0] += s[a0 - start: b0 - start]
    sfx *= float(E.get("sfx_gain", 0.5))

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    target = float(E.get("target_lufs", -14.0))
    raw_full, raw_music = a.out + "-raw.wav", a.out + "-music-raw.wav"
    write(raw_full, music + sfx)
    j = loudnorm(raw_full, a.out + ".wav", I=target)
    write(raw_music, music)
    loudnorm(raw_music, a.out + "-music-only.wav", I=target)
    os.remove(raw_full); os.remove(raw_music)
    print(f"wrote {a.out}.wav and -music-only.wav (in {j['input_i']} LUFS -> {target})")


if __name__ == "__main__":
    main()
