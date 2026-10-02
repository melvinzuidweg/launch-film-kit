# 06 · Music and sound

A launch film without voice-over is carried by its music more than by anything else on the soundtrack. The music sets the tempo of the cut, decides where the big moment lands and tells the viewer when the film is over. This reference covers choosing a track without being able to listen to it, fitting the film to it with bar-exact edits, building sound effects from code and mixing to a platform-safe loudness.

The reference scripts are in `examples/griffel/tools/audio/`: `find_drop.py`, `events.mjs`, `synth_sfx.py`, `mix_edl.py` (and the simpler single-cut `mix.py`). The case's edit decision lists are in `examples/griffel/renders/audio/edl-*.json`.

## Contents

1. [Music first](#1-music-first)
2. [Licences](#2-licences)
3. [Choosing tracks without listening](#3-choosing-tracks-without-listening)
4. [Finding the drop to 20 ms](#4-finding-the-drop-to-20-ms)
5. [Setting the film's time scale from the BPM](#5-setting-the-films-time-scale-from-the-bpm)
6. [Whole-bar edits: the EDL](#6-whole-bar-edits-the-edl)
7. [The "next room" low-pass](#7-the-next-room-low-pass)
8. [Sound effects from code](#8-sound-effects-from-code)
9. [A cue list generated from the film](#9-a-cue-list-generated-from-the-film)
10. [Mixing and loudness](#10-mixing-and-loudness)
11. [Boundaries: what Claude does and does not do](#11-boundaries-what-claude-does-and-does-not-do)
12. [Exit checklist for this stage](#12-exit-checklist-for-this-stage)

---

## 1. Music first

**Pick the music (its tempo and its structure) before the storyboard is final, and buy it at picture lock.** Those are two different moments, and keeping them apart is what makes both cheap.

What happened in the case shows why. The storyboard was written on a 120 BPM grid (a bar is 2.0 s, a beat 0.5 s) because the first-choice track, from a different library, was 120 BPM. The music that was finally licensed was two 110 BPM tracks. The whole film then had to be time-scaled by 120/110 (see §5), every cue regenerated and every musical edit re-derived. It worked out, and the founder had asked for a slightly slower film anyway, but it was a retime that a day-one music choice would have avoided.

The order that works:

```
shortlist tracks from metadata (free) ─> read their structure from previews (free)
   ─> fix the BPM grid and the drop time ─> storyboard on whole bars ─> build and review
   ─> picture lock ─> human approves the exact files ─> download/buy ─> measure the drop
   ─> EDL ─> mix ─> final render with audio
```

- **Previews are enough to plan with.** Tempo comes from the library's metadata and is confirmed from the audio; the structure (where the breakdown, the drop and the ending are) can be read from a preview's bass energy (§3). Nothing has to be bought to write a storyboard on the right grid.
- **Buying late protects the licence.** Several subscription licences forbid new productions or new versions after you cancel, even with files you already downloaded (§2). Buy when the picture is locked, then finish every cut (both aspect ratios, the variant, the 15 s version, the ad versions) inside the paid period.
- **The storyboard is written in bars.** Put every major event (the hook tap, the drop, the logo lock) on a whole-bar line of the chosen grid. That is what makes the later music edits clean (§6).

---

## 2. Licences

What follows is the comparison made for the case on 2026-10-01 from each library's published terms. Terms and prices change; read the current licence before buying. This is a summary of what we found, not legal advice.

| Library / plan | Who it is for | Paid ads, website, YouTube | After cancelling | Price seen (EUR) |
|---|---|---|---|---|
| **Epidemic Sound Business** | Brands under USD 10M revenue, up to 2 users | Yes, online campaigns only; channels cleared per platform | Productions completed during the subscription stay licensed; **no new productions or new versions afterwards** | 75 for a single month, or 30/month billed yearly (excl. VAT) |
| **Epidemic Sound Pro** | Individuals, and companies whose main business is content creation | Yes | Same as Business | 39.99/month |
| **Uppbeat Pro** ("Solo Professional") | Individuals, freelancers, solo professionals; for a business, only if you are its only employee | Paid advertising, own websites, YouTube and social platforms listed; up to 10 YouTube channels can be safelisted | Content first published during the subscription stays usable; downloaded files cannot be used after cancelling. **One download = one licence = one video** | 27.99/month |
| **Uppbeat Business** | Teams and companies | Same distribution as Pro | Same as Pro | 359.88/year, yearly only |
| **Artlist** (Music & SFX Pro) | Companies up to 50 employees | Yes | Projects must be created and published while subscribed | Billed annually only |
| **Soundstripe Pro** | Individuals only | | | 39.99 USD/month |
| **Musicbed Business** | Brands up to 100 employees | | Paid-media rights are not perpetual unless stated | Annual only |

**What the case used:** two tracks from Uppbeat by the same artist, one per edit: 'Just Flow' for the original and 'One More Chance' for the variant. The deciding question was not the catalogue but who the plan is for: check the "Who it is for" column against the size of the company before anything else. For a company with more than one person, Epidemic Sound Business for one month was the cheapest plan we found that covered a company's own ads and website.

**Rules that follow from the terms:**

- **One credit per video.** Uppbeat states that each credit (licence code) is valid for a single video. The case downloaded one track per edit. Both aspect ratios of the same edit were treated as one video; if that matters to you, ask the library.
- **Buy at picture lock** and finish all versions inside the paid period (§1).
- **Safelist your YouTube channel before uploading,** and put the credit line the library gives you in the description.
- **Ask in writing about anything the licence does not name.** In the case, Uppbeat's terms did not name LinkedIn (they list "platforms such as" YouTube, TikTok, Instagram, Facebook), and none of the libraries' terms named App Store or Play Store previews.
- **Keep licence codes and account details out of the repository.** Record track, artist, URL, download date, plan and the code in a private document. The repo can say which track is used and by whom.
- **Never commit licensed audio** (`assets/audio/licensed/` is in `.gitignore`), and do not publish the music-only exports. They are still the licensed track.

---

## 3. Choosing tracks without listening

Claude cannot hear. It can read metadata and measure audio. That turns out to be enough to shortlist well, as long as a human listens to the shortlist before anything is bought.

### Step 1: harvest metadata

Music libraries render their catalogue pages from data, and that data is usually in the page.

- **Uppbeat:** every category page embeds its track list as JSON in the HTML, with tempo, energy, genre, vocal flag, length and a preview URL per track. In the case, about 1,400 candidates were collected from about 60 category pages in the in-app browser.
- **Epidemic Sound:** a public JSON search endpoint returns track data without an account, for example `https://www.epidemicsound.com/json/search/tracks/?term=<title>&bpm=120-120&vocals=false`. The site also serves waveform peak data for its player, which is a coarse structure preview on its own.

Then filter hard. The case filter was: instrumental, 108–112 BPM, electronic, not "dark", at least 80 s long. The BPM window is the most important line: it is set by how far you are willing to time-scale the film (§5).

### Step 2: read the structure from the bass

Bass energy over time is a good map of an electronic track's structure: kick and bass drop out in a breakdown and come back at the drop. In the case this ran inside the library's own page in the in-app browser, where the page can fetch its own previews:

```js
// Run in the page that plays the previews. Returns bass energy in dB per `step` seconds.
async function bassProfile(url, step = 0.5, fc = 150) {
  const bytes = await (await fetch(url)).arrayBuffer();
  const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes);
  const x = audio.getChannelData(0), sr = audio.sampleRate;
  const a = Math.exp(-2 * Math.PI * fc / sr);      // one-pole low-pass at fc
  const n = Math.floor(step * sr), out = [];
  let acc = 0;
  for (let i = 0; i + n <= x.length; i += n) {
    let e = 0;
    for (let j = i; j < i + n; j++) { acc = (1 - a) * x[j] + a * acc; e += acc * acc; }
    out.push(+(10 * Math.log10(e / n + 1e-12)).toFixed(1));
  }
  return out;                                       // out[k] covers k*step .. (k+1)*step seconds
}
```

How to read the curve:

| Section | What the bass curve does | What it is good for in a launch film |
|---|---|---|
| Intro | Low, often rising in steps every 4 or 8 bars | Rarely used; most edits start later |
| Full section | High and flat | The payoff after the drop |
| Breakdown | Falls by a large step and stays low, typically for 8–16 bars | The setup: the problem, the recording, the question. Muffled (§7), it sits under reading without competing |
| Build / rise | Low, sometimes climbing toward the end | The last seconds before the key moment |
| Near-silent break | Drops to almost nothing for a beat or a bar right before the drop | A gift: a moment of silence right before the key tap |
| Drop | The largest positive jump after a breakdown | The single most important moment of the film |
| Ending: fade | Declines gradually | Weak for a logo; usable under a long end card |
| Ending: hit / hard stop | Ends on a strong last hit, or stops dead | A hit can land the logo lock; a hard stop can land on the last frame |

A track is a good candidate when it has a breakdown or build long enough to sit under the setup (24 s from the first frame to the drop in the case), one clean drop, a full section of 15–25 s after it, and an ending that is a hit or a hard stop.

### Step 3: confirm the tempo

Library BPM tags are usually right but not always exact. Confirm from the audio: an onset-strength envelope and an autocorrelation (or a comb of candidate tempos) gives the beat period. Both case tracks measured 109.95–110.0 BPM, matching their 110 BPM tags. That exactness matters more than it seems (§5).

### Step 4: shortlist, then a human listens

The case put five tracks into the library's Favorites. What Claude cannot judge from numbers is the character: does it sound confident or corporate, sunny or sober, are there vocal chops, does the drop feel like "opening up"? Ask the human to listen to the shortlist previews (two minutes each, around the breakdown and the drop) before choosing.

---

## 4. Finding the drop to 20 ms

The preview analysis places the drop to about half a second. The edit needs it to about a frame. Once the licensed WAV is on disk, `find_drop.py` does this:

1. Decodes to mono 22.05 kHz with ffmpeg and low-passes at 150 Hz (a one-pole filter).
2. Computes bass energy in 0.5 s windows and prints the 8 largest positive jumps in dB, with their song times. Pick the one that matches the structure you read from the preview, and pass it with `--around`.
3. Zooms to 20 ms windows from 0.4 s before to 0.4 s after the best candidate (or `--around <seconds>`), and reports the 20 ms step with the largest rise.

```bash
python tools/audio/find_drop.py assets/audio/licensed/<track>.wav --around 105
```

Do not trust an automatic beat tracker's grid for this. The one number the whole edit hangs on deserves a direct measurement.

Results in the case: 'Just Flow' drops at song time 105.0 s; 'One More Chance' drops at about 109.08 s after a near-silent break of about 2 s, and ends with a hard stop at about 196.30 s.

One caution: the case's `find_drop.py` prints a suggested song start using a hard-coded film drop time (`drop_song − 22.0`). That was correct before the time scale changed and wrong after it (the drop moved to output 24.0). Take the film's drop time from the cue file (§9), never from a constant in a helper. The template's `find_drop.py` does that: pass `--cues renders/audio/cues.json` and it prints `song_start = drop_song − cues.drop` as the first EDL segment.

---

## 5. Setting the film's time scale from the BPM

The storyboard was written on a grid; the track has its own tempo. If they differ, scale the whole film so the grids match:

```
SCALE        = grid BPM / track BPM          120 / 110 = 1.090909
output time  = film time × SCALE
bar (output) = 4 beats × 60 / track BPM      240 / 110 = 2.181818 s
```

In the case:

| | Film time (120 BPM grid) | Output time (× 120/110) |
|---|---|---|
| Bar length | 2.0 s | 2.1818 s |
| Drop (tap on the answer) | 22.0 | **24.0** |
| Logo lock | 42.0 | 45.818 |
| Film length | 48.0 | 52.36 |

Every film beat now lands on a music beat, for the whole film, not just at the drop.

**Use the exact ratio.** The case first used SCALE = 1.1 (rounded, chosen as "about 10 % slower"). Aligned at the drop, the 110 BPM tracks then drifted against the 109.09 BPM film grid: events before the drop arrived up to about 0.2 s early, and the logo lock landed about 0.18 s late, a third of a beat, which a critic flagged. With 120/110 exactly, the drift is zero and the extra slowness (9.1 % instead of 10 %) is invisible.

**How far can you scale?** The case scaled by 9 % (slower), which the founder had asked for anyway. We did not test larger factors. Scaling slower makes moves calmer; scaling faster makes them snappier and shortens holds that may already be at their minimum readable time. If the best track is far off the grid, consider writing the timeline in the track's BPM instead.

**How it is wired in the case:** `timeline.js` holds film times and `SCALE`; `OUT_DURATION`, `OUT_DROP` and conversions are derived from them. The renderer, the capture tools and the cue generator all speak output time; the page converts back. Any text whose value changes per frame quantises to the output frame grid (see 05 §3).

**After any change of SCALE:** regenerate the cue list (§9), re-derive the EDL (§6) and re-render. Nothing else needs touching if every time lives in one timeline file.

---

## 6. Whole-bar edits: the EDL

A 52 s film rarely matches a 3-minute track's structure. The edit fixes that by playing pieces of the song in a different order. `mix_edl.py` reads an edit decision list:

```json
{
  "music": "assets/audio/licensed/<track>.wav",
  "duration": 52.363636,
  "segments": [
    {"out_t": 0.0,       "song_t": 81.0},
    {"out_t": 39.272727, "song_t": 137.727273}
  ],
  "lowpass": [[0.0, 24.0]],
  "lp_ramp": 0.4,
  "music_gain": 0.8, "sfx_gain": 0.5, "target_lufs": -14.0, "target_tp": -1.5
}
```

`target_tp` exists in the template's mixer, not in the case's (see §10). Each segment says "from output time `out_t`, play the song from `song_t`". Adjacent segments overlap by a 30 ms crossfade: short enough not to smear the downbeat, long enough to avoid a click.

### The arithmetic

```
bar               = 240 / BPM
song_start        = song_drop − out_drop                         (the drop lands on the key moment)
song position p at output time t, inside a segment = song_t + (t − out_t)
a jump at output time t_j          new song_t = p(t_j) + N × bar      N whole (negative = back)
choose t_j on a bar line           t_j = out_drop + k × bar           k a whole number
choose N so a target event lands   N = round((s_target − (t_target − t_j) − p(t_j)) / bar)
```

Two conditions make a jump clean: **the jump happens on a bar line, and it moves by a whole number of bars.** Then both sides of the cut are at beat 1 of a bar, and the kick pattern, the bass line and the chord rhythm continue as if nothing happened. Prefer jumps of 4, 8 or 16 bars where the numbers allow, because those also keep the phrase (most electronic tracks change something every 4 or 8 bars).

### Why half-bar jumps stumble

A jump of N + ½ bars moves beat 3 to where beat 1 should be. The listener hears the bar restart in the middle: the accent lands on the wrong beat and the groove trips. The same applies to the film side. If the hook tap and the drop are a whole number of bars apart, a cut between them is clean; if they are 6.5 bars apart, no jump can fix it. **That is why the storyboard puts its key events on whole bars from day one.**

### Worked example 1: the original edit ('Just Flow', 110 BPM)

Song facts: drop at 105.0 s; a strong final hit at 144.27 s; an outro after it. Film facts (output time): drop 24.0; logo lock 45.818; length 52.36. Bar = 2.1818 s.

1. **Start offset.** `song_start = 105.0 − 24.0 = 81.0`. The film opens exactly 11 bars before the drop.
2. **Where the final hit would land without an edit:** `144.27 − 81.0 = 63.27` output, eleven seconds after the film ends. A jump forward is needed.
3. **Pick the jump point on a bar line after the drop:** `t_j = 24.0 + 7 × 2.1818 = 39.2727` (film time 36.0, during the "deleted after sending" trust beat).
4. **Song position there without a jump:** `81.0 + 39.2727 = 120.2727`.
5. **Choose N so the final hit lands on the logo lock (45.818):** the song must be at `144.27 − (45.818 − 39.2727) = 137.72` at the jump. `N = (137.72 − 120.27) / 2.1818 = 8.0`. Jump **8 bars** ahead: `song_t = 120.2727 + 17.4545 = 137.7273`.
6. **Check:** the final hit lands at `39.2727 + (144.27 − 137.7273) = 45.815`, within 3 ms of the lock. The outro's tail then runs under the end card to the last frame.

An 8-bar jump is a phrase multiple, so the cut also keeps the phrase.

### Worked example 2: the variant with a cold open ('One More Chance', 110 BPM)

The variant opens on the strongest moment (the question card and the answer tap) and then plays the same film from 3.2 s film time on. The music should open on the drop too, and still hit the same drop again at output 24.0. Song facts: drop at about 109.08 s, preceded by about 2 s of near-silence; a hard stop at about 196.30 s.

1. **Cold open.** `out_t 0.0 → song_t 109.06`: the film starts on the drop, at full brightness (no low-pass). The EDL starts 20 ms before the measured drop so frame 0 already carries the attack.
2. **Jump back after 2 bars.** At `t_j = 2 × 2.1818 = 4.3636` the song is at `109.06 + 4.3636 = 113.42`, two bars past the drop. The second drop has to land at 24.0, which is `(24.0 − 4.3636) / 2.1818 = 9` bars later. So at 4.3636 the song must be 9 bars before the drop: `109.06 − 19.636 = 89.42`. That is 2 + 9 = **11 bars back**: `out_t 4.3636 → song_t 89.4236`. The low-pass closes here.
3. **The break lands where it should.** The near-silent 2 s before the drop now falls just before 24.0, right before the tap on the answer. Because the EDL starts 20 ms early, the second drop arrives at 24.02, about one frame after the tap; the low-pass window ends at 24.02 to match.
4. **Jump forward at the logo lock to land the hard stop on the last frame.** At `t_j = 45.818` (a bar line: 24.0 + 10 bars) the song is at `89.4236 + 41.4545 = 130.878`. For the stop (196.30) to land at the end of the video (52.35), the song must be at about `196.30 − 6.53 = 189.77`. `N = (189.77 − 130.88) / 2.1818 = 26.99`, so **27 bars** ahead: `out_t 45.8182 → song_t 189.7873`.
5. **Check:** the hard stop lands at `45.8182 + (196.30 − 189.7873) = 52.331`. The video's last frame starts at 52.333 (frame 3,140 at 60 fps), so the music stops on the last frame.

```json
"segments": [
  {"out_t": 0.0,       "song_t": 109.06},
  {"out_t": 4.363636,  "song_t": 89.423636},
  {"out_t": 45.818182, "song_t": 189.787273}
],
"lowpass": [[4.363636, 24.02]]
```

11 and 27 are not phrase multiples; the numbers did not allow it here. Both are whole bars on bar lines, so the beat continues cleanly. Whether the phrase change is noticeable is a question for a human ear (see §11 and 07).

### Checking an edit without ears

- Recompute every landing time from the EDL, as above, and compare with the film's event times. A whole-bar edit should land within one find_drop window (20 ms).
- Render the mix and look at the waveform around each cut (ffmpeg `showwavespic`, or bass energy per 50 ms): a cut on the bar line shows the kick pattern continuing at the same spacing.
- Render a still at the drop time and check that the visual event is on that frame.
- Then the human listens. The delivery note in the case said plainly that the sound could only be judged by ear once the music was in.

---

## 7. The "next room" low-pass

Until the drop, the music plays as if it is coming from the next room: low-passed at about 700 Hz, so the beat and the bass are there but the bright parts are gone. At the drop the filter opens, as if a door swings open, and the track arrives at full brightness on the key moment.

Why it works for a muted-first product film: the setup is where the viewer reads (the problem, the app's first screens, the question). Muffled music keeps the tempo and the mood without competing for attention, and the opening gives the drop a second layer of impact on top of the track's own.

How `mix_edl.py` does it:

- It decodes the track twice: clean, and through two cascaded 700 Hz low-pass filters (`lowpass=f=700,lowpass=f=700`, a steeper slope than one).
- It assembles both versions with the same EDL, so they stay sample-aligned through every jump.
- For each window in `"lowpass"`, a mix weight rises over `lp_ramp` (0.4 s) after the window's start and falls over 0.4 s **ending exactly at the window's end**, with a smoothstep curve. A window that starts at 0 is closed from the first frame.
- The muffled version gets +25 % gain (about +2 dB) because removing the highs removes perceived loudness.

In the original, the window is `[0, 24.0]`: muffled from the first frame, fully open at the drop. In the variant it is `[4.36, 24.02]`: the cold open plays clean for 2 bars, closes as the film goes back to the recording, and opens on the second drop.

---

## 8. Sound effects from code

Every sound effect in the case was synthesised with numpy (`synth_sfx.py`). No samples were downloaded, so there is no licence to track, and the effects are tunable and identical on every run (the noise generator is seeded: `np.random.default_rng(7)`).

| Effect | Built from | Used for |
|---|---|---|
| `tap` | band-passed noise click (1.8–5.2 kHz) + a 180 Hz body | every tap on the phone |
| `select` | a fuller tap with a falling 140→80 Hz body | the one tap on the drop |
| `stop_hold` | a soft rising tone (220→330 Hz) over 1.2 s | hold-to-stop |
| `type` | short bright noise ticks + a 320 Hz body | typing a name, one per keystroke |
| `tick`, `tick_low` | short pitch-gliding sines (1.9→2.5 kHz, 1.4→1.8 kHz) | steps completing, files attached, inbox rows |
| `chime` | two sine partials and a delayed third note | an iOS-style push arriving |
| `confirm` | two short rising notes | confirming an answer |
| `pop` | a fast downward pitch blip | a name or chip appearing |
| `whoosh`, `whoosh_short` | noise with a band swept up and down | morphs, the e-mail unfolding, the wordmark wipe |
| `dissolve` | band-passed noise with a fast decay | data chips dissolving |
| `lock` | a low "thock" (95→60 Hz) + a click + a little air | the logo locking |

Design rules that kept the effects from fighting the music:

- **Short and soft.** Taps, ticks and keystrokes last under 0.1 s, most other effects under 0.6 s; only the hold tone is longer. Effects confirm what the eye sees; they are not the soundtrack.
- **Each in its own frequency band, below the music,** so a tap and a tick at the same moment do not mask each other.
- **Normalised to the same peak** (0.89) when written, with gains set per cue in the cue list.
- **A hint of stereo width** on the whooshes, the chime, the lock and the dissolve (a delay of up to 0.3 ms on one channel), none on taps and ticks.
- 48 kHz, 16-bit stereo WAV.

---

## 9. A cue list generated from the film

Hand-placed sound effects drift the moment someone retimes an act. In the case the cue list was generated from the film itself: `events.mjs` loads the page in headless Chrome, reads what the acts registered (`Film.taps`, `Film.pushes`) plus key times from the timeline (morphs, steps, the logo lock), maps each event to an effect and a gain, and writes `cues.json` in **output time** (film time × SCALE).

```bash
node tools/audio/events.mjs > renders/audio/cues-orig.json
node tools/audio/events.mjs --page index-vraag.html > renders/audio/cues-vraag.json
```

The file also carries `duration`, `drop`, `scale` and the output BPM, so the mixer never needs a constant. Typical mapping rules:

- the tap at the drop time → `select` (gain 1.0); a held tap → `tap` plus `stop_hold`; any other tap → `tap` (0.7);
- a push → `chime` 0.2 s after it starts;
- named timeline moments (morphs, steps done, the e-mail unfolding, the wipe, the lock) → their effect.

**Re-run it for every page and after every timing change.** Review the output for variants: in the case, the variant's opening tap got a plain `tap` (only the drop tap maps to `select`), and a `whoosh_short` was still generated for a hook morph the variant does not show. It happened to land under a camera move and fit, but a rule written for one page will not always suit another.

---

## 10. Mixing and loudness

`mix_edl.py` puts it together:

1. **Music:** the EDL assembly of the clean and the low-passed track, blended by the low-pass weight, times `music_gain` (0.8).
2. **Effects, peak-aligned:** each effect is placed so that **its loudest sample lands on the cue time**, not its first sample. Attacks differ: a whoosh peaks a quarter of a second in, a tap at once. Aligning peaks makes every effect feel in sync with the frame it belongs to. The sum is scaled by `sfx_gain` (0.5), on top of the per-cue gains (0.35–1.0).
3. **Two-pass loudness normalisation** with ffmpeg `loudnorm` to −14 LUFS integrated, −1 dBTP true peak, LRA 11:
   - pass 1 measures (`print_format=json`);
   - pass 2 applies the measured values with `linear=true`, which scales the whole mix by one gain and keeps its dynamics.
   - **Linear or dynamic.** ffmpeg silently falls back to its dynamic mode, a limiter that softens peaks, when one linear gain would push the true peak over the ceiling. The template's `mix_edl.py` prints which mode ran and the "linear max", the loudest level one linear gain could reach. A dynamic result is louder with limited peaks; a mix at the linear max is quieter and untouched. Choose by ear (the template's synthetic test track and its sound effects both run dynamic).
   - **Leave headroom for the AAC encode.** The case's WAV mixes measured exactly −1.0 dBTP, but one muxed MP4 measured −0.8 dBTP: lossy encoding can raise inter-sample peaks. The template's `mix_edl.py` therefore caps the WAV at `target_tp` = −1.5 dBTP by default; still re-measure after the mux (07 §6).
   - **When the ceiling wins.** A very peaky mix cannot reach −14 LUFS under a −1.5 dBTP ceiling; the mixer trims down, prints the loudness it reached and warns when that is more than 0.5 LU off (the template's synthetic test track lands around −15 on its own). Within about half a LU of −14 is fine; further off, lower the loudest effects' cue gains or `sfx_gain` rather than raising the ceiling.
4. **A music-only export,** normalised to the same target, written next to the full mix. It is the bed for recuts, captions-only versions and future edits without regenerating the EDL.
5. **Mux** into the video with `-c:v copy`, AAC 256 kbps, `-shortest` (see 05 §9).

Why −14 LUFS: no social platform in the case's research publishes a target, but −14 LUFS integrated with a −1 dBTP ceiling is the common streaming convention, which makes it a safe default.

**Sound effects only.** A teaser without music, or a draft before the music is chosen, mixes just the cues with `"music": null` (no `segments`, no `lowpass`):

```json
{ "music": null, "duration": 10.0, "sfx_gain": 0.5, "target_lufs": -14.0, "target_tp": -2.0 }
```

Sparse effects are nearly all peak, so the numbers behave differently from a music mix. The case had music throughout; these come from two later tests of the template:

- **Loudness.** One linear gain reaches only about −19 to −20 LUFS under the ceiling; loudnorm then goes dynamic. The template's 12 cues came out at −14.1 to −14.2 LUFS, and a 10 s teaser's sparser cues at −15.1 (−15.3 muxed). Anything from about −14 to −16 is a reasonable result. Listen whether the taps keep their click; if the limiter blunts them, set `target_lufs` to the linear max the mixer prints and accept a quieter film.
- **True peak.** AAC lifted the effects' true peak by 0.4–0.6 dB (WAVs at −1.5 dBTP measured −1.1 and −0.9 muxed, the second over the −1 bar), against 0.2 dB for the case's music. Use `"target_tp": -2.0` for an effects-only mix; the template's then measured −1.9 dBTP muxed.
- **Report it.** Put the measured loudness, the mode and the reason in the delivery report, so nobody "fixes" a quiet teaser by squashing it.

Outputs per edit: `mix-<name>.wav` and `mix-<name>-music-only.wav`.

```bash
python tools/audio/synth_sfx.py
node tools/audio/events.mjs > renders/audio/cues-orig.json
python tools/audio/mix_edl.py --edl renders/audio/edl-orig.json --cues renders/audio/cues-orig.json --out renders/audio/mix-orig
```

---

## 11. Boundaries: what Claude does and does not do

In the case, Claude did the whole music search in the in-app browser: collected the candidates, analysed the previews, put five tracks in Favorites, downloaded two WAVs, measured, edited and mixed. The boundaries were explicit, and they are worth keeping:

- **Browsing, analysing previews and adding favourites are free and reversible,** so Claude does them without asking.
- **Downloading spends a credit and creates a licence.** Claude downloads only after the human has explicitly approved the **exact files** (track, artist, format). An approval of "the music" is not an approval of a specific download.
- **Claude never handles payment, never signs up, and never enters credentials.** The human buys the plan and signs in; Claude works in the session they opened.
- **Cookie banners:** choose strictly necessary cookies only.
- **Licence codes and credits go to a private document,** not to the repo or a public delivery note.
- **No ripped audio.** No downloading tracks from video sites, no "temp" music from sources the project will not license.
- **The human's ear is the final check.** Claude can verify that the drop lands on the frame and that the loudness is on target; it cannot verify that the track feels right or that a jump sounds natural. Say so in the delivery note.

---

## 12. Exit checklist for this stage

- [ ] The BPM grid and the drop time were fixed before the storyboard, and the key events sit on whole bars.
- [ ] The licence fits the company (size, use, platforms); open questions were asked in writing; the human approved and bought it.
- [ ] Exact files approved by the human before download; WAVs stored in a gitignored folder; licence details recorded privately.
- [ ] Track BPM confirmed from the audio; drop (and final hit or hard stop) measured with `find_drop.py`.
- [ ] `SCALE = grid BPM / track BPM` exactly; cue lists regenerated after the last timing change.
- [ ] Every EDL jump is on a bar line and moves a whole number of bars; landing times recomputed and within 20 ms of their targets.
- [ ] Low-pass opens exactly on the drop.
- [ ] Mix and music-only versions normalised to −14 LUFS / −1 dBTP (an effects-only mix: see §10), and measured again on the muxed MP4 (see 07).
- [ ] The delivery note says what still needs a human ear.
