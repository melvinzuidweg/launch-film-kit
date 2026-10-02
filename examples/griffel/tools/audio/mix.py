"""
Mix the film's soundtrack.
  Every time here is OUTPUT time, the rendered video's clock: tools/audio/events.mjs writes the
  cues, `drop` (T.OUT_DROP = T.DROP x T.SCALE, 24.2 at SCALE 1.1) and `duration`
  (T.OUT_DURATION, 52.8) in output time, so the mix lines up with the video as rendered. The
  film's 120 BPM grid plays at T.BPM / T.SCALE in the video (cues.json `bpm`, 109.09 at 1.1).
  - Music (optional): starts at --song-start (song time at video 0), or give --song-drop (song
    time of the track's drop, e.g. from tools/audio/find_drop.py) and the start is song_drop -
    drop, so the track's drop lands on the film's. Low-passed (~700 Hz, "in the next room") until
    the drop, then opens to full over 0.4 s exactly at the drop.
    Optional --cut "a,b": jump from song time a to b (phrase-aligned edit), 30 ms crossfade.
  - SFX: every cue from cues.json, each placed so its measured PEAK lands on the cue time.
  - Loudness: two-pass ffmpeg loudnorm to -14 LUFS integrated, -1 dBTP.
Outputs: <out>.wav (full mix) and <out>-music-only.wav.

    python tools/audio/mix.py --cues renders/audio/cues.json --out renders/audio/mix
    python tools/audio/mix.py --cues renders/audio/cues.json --music assets/audio/licensed/eternal-afternoon.wav --song-start 94.0 --out renders/audio/mix
    python tools/audio/mix.py --cues renders/audio/cues.json --music assets/audio/licensed/<track>.wav --song-drop 118.2 --out renders/audio/mix
"""
import argparse, json, os, subprocess, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
SFX_DIR = os.path.join(HERE, "..", "..", "assets", "audio", "sfx")


def decode(path, extra=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path]
    if extra:
        cmd += ["-af", extra]
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
    j = json.loads(p1[p1.rfind("{") : p1.rfind("}") + 1])
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", af, "-ar", str(SR), dst], check=True)
    return j


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cues", required=True)
    ap.add_argument("--music")
    ap.add_argument("--song-start", type=float, default=0.0)
    ap.add_argument("--song-drop", type=float, default=None, help="song time of the track's drop; sets --song-start = song_drop - cues drop")
    ap.add_argument("--cut", default=None, help="a,b song-time jump (seconds)")
    ap.add_argument("--music-gain", type=float, default=0.8)
    ap.add_argument("--sfx-gain", type=float, default=0.5)
    ap.add_argument("--target", type=float, default=-14.0, help="integrated LUFS target")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    cues = json.load(open(a.cues, encoding="utf-8"))
    dur, drop = cues["duration"], cues["drop"]  # output time (see the docstring)
    if a.song_drop is not None:
        a.song_start = a.song_drop - drop
        print(f"song start = song drop {a.song_drop:.3f} - drop {drop:.3f} = {a.song_start:.3f} s")
    N = int(dur * SR)
    music = np.zeros((N, 2))

    if a.music:
        full = decode(a.music)
        lp = decode(a.music, "lowpass=f=700,lowpass=f=700")
        def segment(src):
            if a.cut:
                ca, cb = [float(v) for v in a.cut.split(",")]
                s0 = int(a.song_start * SR)
                part1 = src[s0 : int(ca * SR)]
                part2 = src[int(cb * SR) :]
                xf = int(0.03 * SR)
                ramp = np.linspace(0, 1, xf)[:, None]
                joined = np.concatenate([part1[:-xf], part1[-xf:] * (1 - ramp) + part2[:xf] * ramp, part2[xf:]])
                return joined[:N]
            return src[int(a.song_start * SR) : int(a.song_start * SR) + N]
        f, l = segment(full), segment(lp)
        n = min(len(f), N)
        t = np.arange(n) / SR
        open_u = np.clip((t - drop) / 0.4, 0, 1)
        open_u = open_u * open_u * (3 - 2 * open_u)
        mix = l[:n] * (1 - open_u)[:, None] * 1.25 + f[:n] * open_u[:, None]  # +2 dB on the muffled part
        fade = np.clip((dur - t) / 1.5, 0, 1)[:, None]
        music[:n] = mix * fade * a.music_gain

    sfx = np.zeros((N, 2))
    cache = {}
    for c in cues["cues"]:
        name = c["sfx"]
        if name not in cache:
            cache[name] = decode(os.path.join(SFX_DIR, name + ".wav"))
        s = cache[name] / (np.abs(cache[name]).max() + 1e-9) * c.get("gain", 1.0)
        peak = int(np.abs(s).sum(1).argmax())
        start = int(c["t"] * SR) - peak
        a0, b0 = max(0, start), min(N, start + len(s))
        if b0 > a0:
            sfx[a0:b0] += s[a0 - start : b0 - start]
    sfx *= a.sfx_gain

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    raw_full, raw_music = a.out + "-raw.wav", a.out + "-music-raw.wav"
    write(raw_full, music + sfx)
    j = loudnorm(raw_full, a.out + ".wav", I=a.target)
    print("full mix loudness in:", j["input_i"], "LUFS ->", a.target)
    if a.music:
        write(raw_music, music)
        loudnorm(raw_music, a.out + "-music-only.wav", I=a.target)
        os.remove(raw_music)
    os.remove(raw_full)
    print("wrote", a.out + ".wav")


if __name__ == "__main__":
    main()
