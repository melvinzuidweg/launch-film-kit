# Prompt: founder quiz

**Used in:** the first phase, before and after the discovery research. The rationale for each question and the full decision map are in [`references/01-brief-research-truth.md`](../references/01-brief-research-truth.md) §2. This file is the operational version: how to ask, in which rounds, with recommended defaults ready to paste.

Unlike the other prompts, this one is for the lead session itself, not for a subagent. The founder's answers are the only source of authority in the project; they go into `docs/brief.md` with the date.

## How to ask

- **Rounds of at most 4 questions,** each multiple choice with 2-4 concrete options. Use the AskUserQuestion tool when it is available; otherwise number the questions and options in one message.
- **Put the recommended option first and mark it "(Recommended)",** with a one-line reason. If the founder says "your call", take the recommended option and write that down as their decision.
- **Make options buildable.** "Light, then a dark recording act, then light" can be built; "modern and clean" cannot.
- **Ask BLOCKING questions first** (they must be settled before the storyboard) and leave LATER ones for later rounds or the stills stage.
- **After every round, say what you will do next** and what you are deliberately not asking yet ("the music licence: at picture lock").
- **Never fold an action into a quiz answer.** Purchases, downloads, installs and publishing are asked separately, each with the exact item, source, size and cost, and each needs its own explicit yes.

## Round 1: strategy (before the research)

These set the direction for the research agents.

```text
1. Goal. What should the film achieve first?
   - Installs + awareness (Recommended): the free tier is the lowest-friction call to action.
   - Trials of a paid plan
   - Credibility with investors or partners
   - The founder's build story
2. Viewer. Who is the one viewer we design for?
   - <one concrete role from the product's best customers> (Recommended): the payoff has to land for one person.
   - <a second segment>
   - <a sector>
   - An international tech audience
3. Research first. Should we research competitors and the selling points before fixing the message?
   - Yes, competitors + a skeptic per selling point, then decide (Recommended): the obvious message may be one a competitor already owns.
   - Light research only
   - No, the message is already decided: <message>
4. Review. When do you want to review?
   - At fixed gates: brief and facts, key stills, the final (Recommended)
   - Only the final result: the build runs autonomously, with fresh critics and measured checks as the internal gates
   - Every iteration
```

## Round 2: story and formats (after discovery research)

Offer two or three concept paragraphs from the research, each with a hook line, a carried object and three signature moments.

```text
1. Concept. Which concept carries the film?
   - <concept B: one continuous take around the product> (Recommended): follows the real flow, works in portrait.
   - <concept A: problem line to resolved action item>
   - <concept C: brand-forward kinetic type>
   - A hybrid: B as the spine, A's morph as a signature moment, C as the logo sting
2. Hook. What is on screen in the first 2 seconds?
   - A problem line from the product's own world as a finished poster at frame 0, plus a strongest-moment-first variant on the same timeline (Recommended): in the case the original's hook scored 6 (its lowest score) and the question-first variant's scroll-stop power also 6, so plan both and let the critics compare.
   - The strongest moment first only (question-first, result-first)
   - The product mid-action
   - A bold statement card
3. Length. How long is the hero film?
   - 45-50 s, with 15 s cut-downs later for paid placements (Recommended)
   - 30 s
   - 60 s
4. Formats. Which aspect ratios are authored rather than cropped?
   - 16:9 + 4:5 on one timeline, 9:16 recomposed from 4:5 later (Recommended): 4:5 is the mobile-feed version.
   - 16:9 only
   - 9:16 first
```

## Round 3: look and sound

```text
1. Look. Light, dark or both?
   - Follow the product: light brand look, with a dark act where the product's own screen is dark (Recommended)
   - Light throughout
   - Dark throughout
2. People. Show people or a table?
   - UI only, rebuilt from the product's code (Recommended): no casting, no privacy questions, sharp at any zoom.
   - Abstract figures or a top-down table
   - Live action (needs a shoot)
3. Voice. A voice-over?
   - None: on-screen type, music and sound effects (Recommended): feeds autoplay muted.
   - The founder's own voice, as a later cut
   - A voice actor
4. Music. Where does the music come from?
   - A library you already have an account with: which one? (Recommended): check its licence terms for your company size first.
   - A new library licence: chosen by BPM and structure before the storyboard, paid for at picture lock
   - Sound effects only
```

## Round 4: build and launch

```text
1. Build location. Where does the project live?
   - A new repository just for the film (Recommended): heavy dependencies and renders stay out of the product's CI.
   - A folder in the product repository
2. Installs. May I install the film's tools inside that repository (Node packages, a Python environment)?
   - Yes, scoped to the new repository; I will list exactly what (Recommended)
   - Ask me per install
3. Variants. Besides the hero film?
   - Plan a hook variant on the shared timeline from the start, and a 15 s cut-down later (Recommended)
   - Hero only for now
4. Launch. Date and channel?
   - No date yet; native upload from your personal profile on the platform where your audience is, company page reshares (Recommended)
   - A date: <date>
   - Paid placements first
```

## LATER questions (ask at the stills stage or at picture lock)

- **End card:** the call-to-action line ("free tier" offer plus URL is a safe default), store badges, poster hold of at least 3.5 s.
- **Language versions:** the language of the product's output first; an English version later as a `copy.js` swap.
- **Music purchase:** the exact track(s), licence plan and cost, asked separately once picture is locked.
- **Claims marked NEEDS CHECK in the facts file:** per item, "use / reword / drop".
- **Posting:** always the founder's own action.

## Record it

After each round, append to `docs/brief.md`:

```markdown
- **Decisions (<date>):**
  - Goal: installs + awareness.
  - Viewer: <role>.
  - ...
  - "Your call" on: <questions where the recommendation was taken>.
```

Later agents and critics resolve disputes against this file, so write the decision, not the discussion.
