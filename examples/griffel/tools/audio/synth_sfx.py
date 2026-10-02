"""
Synthesise the film's sound effects with numpy only (no third-party samples, no licence needed).
Every effect is short, soft and sits in its own frequency band, below the music.

    python tools/audio/synth_sfx.py            -> assets/audio/sfx/*.wav (48 kHz, 16-bit stereo)
"""
import os, wave
import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "audio", "sfx")
rng = np.random.default_rng(7)  # seeded: identical output every run


def env(n, a=0.002, d=0.08, curve=4.0):
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * np.clip(t - a, 0, None) / max(d, 1e-4))
    return att * dec


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def bandpass(x, lo, hi):
    return onepole_lp(x, hi) - onepole_lp(x, lo)


def sine(f, n, phase=0.0):
    t = np.arange(n) / SR
    if callable(f):
        ph = 2 * np.pi * np.cumsum(f(t)) / SR
        return np.sin(ph + phase)
    return np.sin(2 * np.pi * f * t + phase)


def save(name, x, width=0.0):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    # tiny stereo width via a 0.3 ms offset on one side
    d = int(SR * 0.0003 * width)
    l = x
    r = np.concatenate([np.zeros(d), x[: len(x) - d]]) if d > 0 else x
    st = np.stack([l, r], 1)
    pcm = (st * 32767).astype(np.int16)
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def tap():
    n = int(SR * 0.09)
    click = bandpass(rng.standard_normal(n), 1800, 5200) * env(n, 0.0005, 0.012, 5)
    body = sine(180, n) * env(n, 0.001, 0.03, 5) * 0.5
    return click + body


def tick(f0=1900, f1=2500):
    n = int(SR * 0.07)
    return sine(lambda t: f0 + (f1 - f0) * np.clip(t / 0.03, 0, 1), n) * env(n, 0.001, 0.035, 5)


def type_key():
    n = int(SR * 0.05)
    return bandpass(rng.standard_normal(n), 2500, 7000) * env(n, 0.0003, 0.008, 6) * 0.8 + sine(320, n) * env(n, 0.0005, 0.012, 6) * 0.2


def whoosh(dur=0.55, lo=300, hi=2600):
    n = int(SR * dur)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # sweep a band through the noise in short blocks
    out = np.zeros(n)
    blk = 512
    for i in range(0, n, blk):
        u = i / n
        c = lo + (hi - lo) * np.sin(np.pi * u) ** 1.5
        seg = noise[i : i + blk]
        out[i : i + blk] = bandpass(seg, c * 0.6, c * 1.6)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * shape


def chime():
    n = int(SR * 0.6)
    a = sine(1318.5, n) * env(n, 0.002, 0.35, 4) + 0.35 * sine(2637, n) * env(n, 0.002, 0.15, 4)
    b = np.concatenate([np.zeros(int(SR * 0.09)), (sine(1760, n) * env(n, 0.002, 0.4, 4))[: n - int(SR * 0.09)]])
    return a * 0.7 + b * 0.6


def confirm():
    n = int(SR * 0.32)
    a = sine(880, n) * env(n, 0.001, 0.12, 4)
    b = np.concatenate([np.zeros(int(SR * 0.06)), (sine(1318.5, n) * env(n, 0.001, 0.18, 4))[: n - int(SR * 0.06)]])
    return a * 0.6 + b * 0.7


def select():
    # the drop tap: a fuller, rounder tap with a soft low body
    n = int(SR * 0.25)
    return tap()[: n] if False else (bandpass(rng.standard_normal(n), 1500, 4500) * env(n, 0.0005, 0.015, 5) * 0.7 + sine(lambda t: 140 - 60 * np.clip(t / 0.12, 0, 1), n) * env(n, 0.001, 0.09, 4) * 0.9)


def pop():
    n = int(SR * 0.12)
    return sine(lambda t: 600 + 500 * np.exp(-t * 60), n) * env(n, 0.001, 0.04, 5)


def lock():
    n = int(SR * 0.9)
    thock = sine(lambda t: 95 - 35 * np.clip(t / 0.15, 0, 1), n) * env(n, 0.001, 0.18, 4)
    click = bandpass(rng.standard_normal(n), 2000, 6000) * env(n, 0.0005, 0.01, 6) * 0.6
    air = bandpass(rng.standard_normal(n), 5000, 11000) * env(n, 0.02, 0.5, 3) * 0.12
    return thock + click + air


def dissolve():
    n = int(SR * 0.45)
    t = np.arange(n) / SR
    x = bandpass(rng.standard_normal(n), 900, 6000)
    return x * np.exp(-t * 7) * (1 - np.exp(-t * 60)) * 0.7


def stop_hold():
    # soft rising tone under the 1.2 s hold-to-stop
    n = int(SR * 1.25)
    t = np.arange(n) / SR
    return sine(lambda tt: 220 + 110 * (tt / 1.25), n) * np.clip(t / 1.2, 0, 1) ** 2 * np.exp(-np.clip(t - 1.2, 0, None) * 40) * 0.35


if __name__ == "__main__":
    save("tap", tap())
    save("tick", tick())
    save("tick_low", tick(1400, 1800))
    save("type", type_key())
    save("whoosh", whoosh(), 1.0)
    save("whoosh_short", whoosh(0.32, 500, 3000), 1.0)
    save("chime", chime(), 0.6)
    save("confirm", confirm())
    save("select", select())
    save("pop", pop())
    save("lock", lock(), 0.8)
    save("dissolve", dissolve(), 1.0)
    save("stop_hold", stop_hold())
    print("sfx written to", os.path.abspath(OUT))
