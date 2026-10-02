"""
Edit-decision-list mix: music with bar-aligned jumps, low-pass windows, SFX on their measured
peaks, two-pass loudness normalisation. All times are OUTPUT (video) seconds unless named song_*.

    python tools/audio/mix_edl.py --edl renders/audio/edl.json --cues renders/audio/cues.json --out renders/audio/mix

EDL JSON (see tools/audio/edl.example.json):
{
  "music": "assets/audio/licensed/<track>.wav",   # licensed music stays out of git
  "duration": 12.0,                        # output length (s); default: cues.json duration
  "segments": [                            # at out_t the song position jumps to song_t (30 ms crossfade)
    {"out_t": 0.0,  "song_t": 81.0},       #   start so the track's drop lands on the film's drop
    {"out_t": 8.0,  "song_t": 137.0}       #   jump a whole number of bars (bar = 240 / BPM s)
  ],
  "lowpass": [[0.0, 4.0]],                 # out-time windows where the music is muffled (~700 Hz, "next room")
  "lp_ramp": 0.4,                          # open/close ramp (s), smoothstep; the opening ends exactly at the window end
  "fade_out": 0.0,                         # optional linear fade at the end (s)
  "music_gain": 0.8, "sfx_gain": 0.5, "target_lufs": -14.0,
  "target_tp": -1.5                        # true-peak ceiling of the WAV; -1.5 leaves headroom for AAC
}
Writes <out>.wav (full mix) and <out>-music-only.wav (both loudness-normalised to target_lufs,
true peak at most target_tp, default -1.5 dBTP). Why -1.5 and not -1.0: the AAC encode in the
mux can lift inter-sample peaks; a reference film's WAV measured exactly -1.0 dBTP and its
muxed MP4 -0.8. Always measure the muxed MP4 too (ffmpeg ebur128=peak=true). Music paths are
relative to the project root.

Linear or dynamic: pass 2 asks loudnorm for one linear gain. When that gain would push the true
peak over the ceiling, ffmpeg silently switches to its dynamic mode, a limiter that softens the
peaks. The script prints which mode ran, and the loudest level a linear gain could reach
("linear max"), so you can choose: keep dynamic (louder, peaks limited) or set target_lufs to the
linear max (quieter, untouched). It warns when the result is more than 0.5 LU from target_lufs
and when the true peak is above target_tp.

SFX only: "music": null mixes just the cues (a teaser without music, or drafts before the music
is chosen). Leave out segments and lowpass; for example
    {"music": null, "duration": 10.0, "sfx_gain": 0.5, "target_lufs": -14.0, "target_tp": -2.0}
Sparse effects are all peaks, so loudnorm goes dynamic: the template's 12 cues could reach only
about -19 LUFS linearly and came out at -14.1 dynamic; a 10 s teaser's sparser cues came out at
-15.1. Listen whether the taps keep their click; if they sound blunted, use the linear max. Use
target_tp -2.0 for sound effects: AAC lifted their true peak by 0.4-0.6 dB (-1.5 in the WAV,
-0.9 and -1.1 muxed, over the -1 bar), where a music mix gained 0.2 dB. At -2.0 the template's
muxed file measured -1.9 dBTP.

Edit rules that worked: open the low-pass exactly on the drop (the film's key tap); make every
jump a whole number of bars so the beat never stumbles; land the track's final hit on the logo
lock (jump into the outro if needed); let the tail run under the end card.
"""
import argparse, json, os, subprocess, sys, wave
import numpy as np

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SFX_DIR = os.path.join(ROOT, "assets", "audio", "sfx")


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
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true:print_format=json")
    p2 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", src, "-af", af, "-ar", str(SR), dst], capture_output=True, text=True)
    if p2.returncode != 0:
        sys.exit(p2.stderr[-2000:])
    try:
        j2 = json.loads(p2.stderr[p2.stderr.rfind("{"): p2.stderr.rfind("}") + 1])
        j["normalization_type"] = j2.get("normalization_type", "?")
    except ValueError:
        j["normalization_type"] = "?"
    # the loudest a single linear gain could go without crossing the true-peak ceiling
    j["linear_max_lufs"] = float(j["input_i"]) + (TP - float(j["input_tp"]))
    # loudnorm lands within a few tenths; the resample back to 48 kHz can lift the true peak
    # above the target, so measure and trim (only ever down) until the peak is under TP
    m = measure(dst)
    if m["tp"] > TP:
        trim = TP - m["tp"] - 0.05
        tmp = dst + ".trim.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", dst, "-af", f"volume={trim:.2f}dB", "-ar", str(SR), tmp], check=True)
        os.replace(tmp, dst)
        m = measure(dst)
    j["output_measured"] = m
    return j


def measure(path):
    """Integrated loudness (LUFS) and true peak (dBTP) with ffmpeg's ebur128."""
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    summ = err[err.rfind("Summary:"):]
    i = float(summ.split("I:")[1].split("LUFS")[0])
    tp = float(summ.split("Peak:")[1].split("dBFS")[0])
    return {"lufs": i, "tp": tp}


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
    t = np.arange(n) / SR
    if E.get("music"):
        music_path = E["music"] if os.path.isabs(E["music"]) else os.path.join(ROOT, E["music"])
        full = decode(music_path)
        lp = decode(music_path, "lowpass=f=700,lowpass=f=700")
        segs = sorted(E.get("segments") or [{"out_t": 0.0, "song_t": 0.0}], key=lambda s: s["out_t"])
        mf, ml = assemble(full, segs, n), assemble(lp, segs, n)
    else:  # "music": null -> an SFX-only mix (drafts before the music is chosen)
        mf = ml = np.zeros((n, 2))
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
    tp = float(E.get("target_tp", -1.5))
    raw_full, raw_music = a.out + "-raw.wav", a.out + "-music-raw.wav"
    write(raw_full, music + sfx)
    j = loudnorm(raw_full, a.out + ".wav", I=target, TP=tp)
    os.remove(raw_full)
    if E.get("music"):
        write(raw_music, music)
        loudnorm(raw_music, a.out + "-music-only.wav", I=target, TP=tp)
        os.remove(raw_music)
    om = j["output_measured"]
    print(f"wrote {a.out}.wav{' and -music-only.wav' if E.get('music') else ' (SFX only)'}: "
          f"{j['input_i']} LUFS in -> {om['lufs']:.1f} LUFS, true peak {om['tp']:.1f} dBTP (target {target}, {tp})")
    lin = j["linear_max_lufs"]
    if j["normalization_type"] == "dynamic":
        print(f"loudnorm ran DYNAMIC (a limiter softened the peaks): one linear gain could reach only {lin:.1f} LUFS "
              f"under the {tp} dBTP ceiling. Listen to the transients; for an untouched mix set target_lufs to {lin:.1f}.")
    else:
        print(f"loudnorm ran {j['normalization_type']} (linear max {lin:.1f} LUFS)")
    if abs(om["lufs"] - target) > 0.5:
        why = ("the true-peak ceiling won. The peaks come from the loudest effects or from the music itself "
               "(the template's synthetic test track lands near -15 on its own). Lower the loudest cue gains or "
               "sfx_gain, or accept a quieter mix; an SFX-only mix may stay quieter (references/06-music-and-sound.md §10)"
               if om["lufs"] < target else "check the input")
        print(f"WARNING: {om['lufs']:.1f} LUFS is {abs(om['lufs'] - target):.1f} LU from the {target} target: {why}.")
    if om["tp"] > tp + 0.05:
        print(f"WARNING: true peak {om['tp']:.1f} dBTP is above the {tp} ceiling.")
    print("Measure the muxed MP4 too: the AAC encode added 0.2 dB (music) to 0.6 dB (sound effects only) of true peak.")


if __name__ == "__main__":
    main()
