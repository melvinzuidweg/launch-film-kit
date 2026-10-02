# launch-film

**A Claude Code skill for making a professional launch film for your app or product, from the first question to the delivered MP4s.**

This skill teaches Claude Code to make a code-rendered launch film: 45-50 seconds of animated app UI, kinetic type, music and sound effects, in 16:9 and 4:5 at 60 fps, with motion blur, accurate colour and platform-safe loudness. It is the process that produced a real launch film for a Dutch app, written down in full, including what failed and what we would do differently.

The process starts with a founder quiz and competitor research that decides the message. Every on-screen claim then goes through a facts file. The storyboard is written on the music's bar grid. Parallel subagents build the acts, and fresh critics who have never seen the work judge them with measurements. The last steps are the music edit, a colour-managed render and a QA pass against numbers. It works because every frame is a pure function of time, so any moment can be rendered, measured and fixed on its own.

## Watch the result

<a href="media/griffel-vraag-4x5-preview.mp4"><img src="media/poster-45.png" width="360" alt="End card of the Griffel launch film: logo, slogan, offer and store badges"></a>

- [Variant "vraag", 4:5](media/griffel-vraag-4x5-preview.mp4): opens on the app's question (52 s)
- [Original, 4:5](media/griffel-origineel-4x5-preview.mp4): opens on a vague line from a meeting (52 s)
- [Variant "vraag", 16:9](media/griffel-vraag-16x9-preview.mp4)
- [Contact sheet of the 4:5 variant](media/contact-vraag-4x5.png) and the [16:9 end card](media/poster-169.png)

GitHub does not play video files from a repository inline. Click a link to open or download the preview. The on-screen copy is Dutch, and the film is made to work on mute, which is how these previews come: they are silent, because the soundtrack is licensed for the film itself and is not redistributed here. The music edit is documented as data in [examples/griffel](examples/griffel/#sound).

The film is for [Griffel](https://griffel.ai), an AI meeting-notes app. A fresh critic that had not seen the process scored the final render 7.5/10, "ship after small fixes"; the hook (6) and pacing (6.5) were the weakest scores. It took about 20M subagent tokens and about 18 hours of wall clock, much of it running unattended overnight. The full story with every number is in the [case study](launch-film/references/09-case-study-griffel.md), and the source is in [examples/griffel](examples/griffel/).

The Griffel name, logo, UI, copy and these films are Griffel's and are shown for study only (see [Licence](#licence)).

## What's in the box

```
launch-film/                      the skill: copy this folder into your skills directory
├── SKILL.md                      the pipeline, its checkpoints and the non-negotiables
├── references/
│   ├── 01-brief-research-truth.md    founder quiz, brand tokens, facts file, competitor/USP research, claim checks
│   ├── 02-story-and-storyboard.md    hooks, chapters, captions, mute-first copy, feed-size minimums, bar grid, storyboard as spec
│   ├── 03-engine.md                  the seek(t) engine: Film API, timeline/copy, ownership and geometry contracts
│   ├── 04-build-and-critique.md      the build loop: act lanes, lens critics, triage, fixers, verifiers, round budget
│   ├── 05-render-and-encode.md       motion blur, capture, BT.709 colour chain, encode checks, platform specs
│   ├── 06-music-and-sound.md         choosing music, the drop, time scale, whole-bar edits, SFX, loudness
│   ├── 07-qa-checklist.md            the measurable quality bar, with scripts
│   ├── 08-gotchas.md                 symptom → cause → fix for every pitfall we hit
│   └── 09-case-study-griffel.md      the whole case, with scores and numbers
├── prompts/                      subagent prompts: act builder/critic, lens critics, triage, fixer, verifier,
│                                 final critic, USP skeptic, and the founder quiz
└── assets/template/              a working starter project (12 s example film, render and QA tools)
examples/griffel/                 the real source of the Griffel film: code, storyboard, facts, critic ledgers
media/                            previews and posters of the Griffel film
```

## Install

Clone the repository, then copy the skill folder into your Claude Code skills directory:

```bash
git clone <repo-url> launch-film-kit
mkdir -p ~/.claude/skills
cp -r launch-film-kit/launch-film ~/.claude/skills/launch-film
```

On Windows (PowerShell):

```powershell
New-Item -ItemType Directory -Force "$HOME\.claude\skills" | Out-Null
Copy-Item -Recurse launch-film-kit\launch-film "$HOME\.claude\skills\launch-film"
```

To use it in one project only, copy it to `.claude/skills/launch-film` inside that project instead. Keep the clone around: the worked example in `examples/griffel/` lives outside the skill folder, and the skill points Claude to it when it is available.

### Prerequisites

| Tool | Why |
|---|---|
| **Node 22.12+** | Runs the stills, capture and render tools. `puppeteer-core` 25 requires 22.12 or newer. |
| **Google Chrome** (or Chromium/Edge) | Renders the frames headless. Found automatically; set `CHROME_PATH` if it is not. |
| **ffmpeg with `zscale`** (a build with libzimg), plus `ffprobe` | The colour-managed encode, motion blur, contact sheets and loudness. Not every build includes `zscale`; the doctor below checks it. |
| **Python 3.10+ with numpy and Pillow** | Encode, QA and audio tools. Set `PYTHON` if your interpreter is not `python` (Windows) or `python3`. |

Check a machine with the template's doctor:

```bash
cd launch-film/assets/template
npm install
node tools/doctor.mjs
```

The pipeline was built and tested on Windows 11. The macOS and Linux Chrome locations are coded but untested. A final render needs about 4.5 GB of temporary disk per format and runs for about 20-25 minutes per file on a 12-thread laptop.

## Quick start

Open Claude Code in an empty folder (or next to your product's repo) and ask for what you want. The skill triggers on launch, product, promo and ad videos, even if you never say "launch film":

```text
Make a launch video for my app. The code is in ../myapp and the website source is in ../myapp-site.
```

```text
We need a 45-second LinkedIn launch film for our SaaS, 4:5 and 16:9, no voice-over. Start with the questions.
```

```text
I saw those Claude-made motion videos on X. Can you make one for our new feature? Research our competitors first.
```

```text
Make a 10-second 4:5 teaser for our app with sound effects only. Don't ask questions, just make it.
```

```text
Render the launch-film template's example in both formats so I can see the pipeline works on this machine.
```

For a full film, Claude starts with a short quiz (at most four multiple-choice questions at a time, each with a recommended answer), runs the research, and comes back to you at a few checkpoints:

- the message, the facts and the fictional demo content;
- the storyboard and the music shortlist;
- picture lock, where you approve the exact music files;
- the delivery report.

A teaser of 15 s or less takes a short path: one act, no competitor research, at most one round of questions, and with "no questions" it writes its assumptions into the brief and the delivery report instead of asking. The facts file still applies.

It asks before installing, downloading or buying anything. It never handles payment or passwords, and it never posts, uploads or publishes: launching is yours.

### Try the template without Claude

```bash
cd launch-film/assets/template
npm install
npm run stills          # contact sheet of the 16:9 example: renders/stills/169
npm run draft           # renders/film-169-draft.mp4 (60 fps, no motion blur)
npm run final:45        # 4:5 final: 480 fps capture, 8-subframe motion blur, BT.709
```

See [the template's README](launch-film/assets/template/README.md) for every command and the rules that make it work.

## What to expect

- **Cost.** The case used about 20M subagent tokens over about 18 hours: research 2.8M, act builds 4.3M, and about 3M per global critic round. Overall scores went from 6 to 7 over three global critic rounds, and the last two each cost about 3M tokens for small gains. The skill therefore budgets two broad rounds, then targeted fixes. One test made a 10 s teaser with sound effects only from the template in about 28 minutes, renders included.
- **Quality.** Measured, not eyeballed:
  - no freezes and no single-frame spikes;
  - brand colour within ±2 after the encode;
  - text contrast at least 4.5:1;
  - −14 LUFS;
  - key text readable at 360 px feed width.

  The case's final critic, benchmarked against Linear and Apple product films, gave 7.5/10. Read critic scores as a relative measure between rounds, not as a grade.
- **Limits.**
  - The template lays out 16:9 and 4:5 only; 9:16 needs a third layout.
  - The device is a generic CSS phone.
  - A film with rebuilt UI is a marketing film, not an App Store preview, because those must be real screen captures.
  - The 15 s cut-down is planned in the references but was never built in the case.
- **You still do:**
  - license the music;
  - watch the 4:5 in the real feed app on a phone, muted;
  - check the rebuilt UI against your store build;
  - judge the mix by ear;
  - publish.

## Credits

- **[howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design)** (MIT): ideas for the seek(t) pipeline, damped springs, 8-subframe motion blur, beat maps and a self-critique loop.
- **[echris6/motion-video-kit](https://github.com/echris6/motion-video-kit)** (MIT): ideas for the build process, fresh critics and a written quality bar.
- **[HyperFrames](https://github.com/heygen-com/hyperframes)** by HeyGen (Apache-2.0): the renderer the case used for draft renders. It is optional in the template, which has its own direct capture.
- **[GSAP](https://gsap.com)**: installed from npm under GSAP's own standard "no charge" licence, not vendored and not covered by this repository's licence. The template uses it only as an optional bridge for HyperFrames.
- **[puppeteer-core](https://github.com/puppeteer/puppeteer)** (Apache-2.0): drives Chrome. Installed from npm, not vendored.
- **[Inter](https://rsms.me/inter/)** by Rasmus Andersson: SIL Open Font License 1.1, bundled as TTFs with `OFL.txt`.
- The launch playbook ideas (a 2-second hook, the reason before the features, mute-first, a poster end frame) draw on the LaunchAnything launch blueprint.

## Licence

The code and documentation in this repository are released under the [MIT licence](LICENSE): the skill, the references, the prompts, the starter template, and the example's code and tools.

Not covered by the MIT licence:

- **Griffel brand material:** the Griffel name, logo and wordmark (`examples/griffel/assets/logo/`, see its [NOTICE](examples/griffel/assets/logo/NOTICE.md), and the logo geometry generated from them in `examples/griffel/src/mark.js`), the Dutch on-screen copy, the rebuilt app screens, and the films and images in `media/`. They belong to Griffel and are included for study only. Don't reuse them in your own work.
- **Inter fonts:** SIL Open Font License 1.1 (`OFL.txt` next to the fonts).
- **npm dependencies:** each is under its own licence. They are installed by `npm`, not included here.
- **Music:** no licensed audio is included, and the previews in `media/` have no audio track. The Griffel film uses 'Just Flow' and 'One More Chance' by Hartzmann from Uppbeat, licensed for that film only. The only audio files in this repository are the synthesised sound effects in `examples/griffel/assets/audio/sfx/` (generated by numpy code, MIT like the rest). License your own music.
- **Store badges:** the official App Store and Google Play badge files are not included. The example uses neutral placeholders; use the official artwork under Apple's and Google's own terms. The badges visible in the `media/` previews and posters are part of Griffel's own rendered film and are trademarks of Apple and Google.
