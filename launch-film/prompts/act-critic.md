# Prompt: fresh act critic

**Used in:** the act-build pipeline, [`references/04-build-and-critique.md`](../references/04-build-and-critique.md) §3, between the builder and the act fixer ([`act-builder.md`](act-builder.md)). One critic per act. The critic has not seen the work being built and does not read the builder's report.

## Placeholders

| Placeholder | Example / meaning |
|---|---|
| `{REPO}` | Absolute path of the film project. |
| `{ACT_TITLE}`, `{ACT_ID}` | `Act C: questions, key moment, send setup (16.2-28.0)`, `c` |
| `{WIN_FROM}`, `{WIN_TO}` | The act window in output time plus about 0.2 s on each side (or use `--film` and film times). |
| `{PRODUCT_REPOS}` | Read-only paths of the product's code, for UI-fidelity checks. |
| `{BRAND_RULES}` | The brand non-negotiables, e.g. "Inter only; brand green never as text on light; UI accent never as text on light; app UI radius 10 px". |
| `{TRUTH_RULES}` | Product-specific truth rules from the storyboard, e.g. "no transcript screen; the name is typed by the user, never suggested". |
| `{MAX_FRAMES}` | 30-36 frames per stills call. |

## Prompt

```text
You are a harsh, fresh motion-design critic. You have not seen this work being built. Judge {ACT_TITLE} of the launch film in {REPO}.
Read {REPO}/docs/storyboard.md (the spec, especially the non-negotiables and the table for this act) and docs/facts.md. Do NOT read the builder's report and do not trust any claims about fixes.

Render your own evidence:
- cd {REPO} && node tools/still.mjs --page index.html --from {WIN_FROM} --to {WIN_TO} --step 0.2 --out renders/stills/crit-{ACT_ID}-169 --sheet --cols 6 (split into calls of at most {MAX_FRAMES} frames)
- the same with --page portrait.html into renders/stills/crit-{ACT_ID}-45
- phone-size singles (--scale 0.1875 for index.html, --scale 0.333 for portrait.html; both give 360 px wide) at the 3-4 most text-heavy moments.
Inspect every sheet and several full-size frames with the Read tool.

Check:
- spec fidelity: every row of this act's table happens, at its time;
- UI fidelity to the real product: layout, sizes, colours, icons, states and copy (compare with the sources named in the storyboard, read-only: {PRODUCT_REPOS});
- motion quality: no pops, no single-frame jumps, no frozen holds longer than 0.6 s, layered moves, the house curve;
- text collisions and clipping; readability at phone size; composition in both formats;
- brand: {BRAND_RULES};
- truth: no invented features or screens; {TRUTH_RULES}; fictional data only;
- the hand-offs at {WIN_FROM} s and {WIN_TO} s.

Score each dimension 1-10 and return a ranked list of concrete problems, each with a timestamp, the format and the exact fix. Be specific and demanding: a video with no bugs is not the same as a good video.
No edits to project files (your evidence images only), no git, no installs.
Return only JSON matching the schema.
```

## Schema

```json
{
  "type": "object",
  "properties": {
    "scores": {
      "type": "object",
      "properties": {
        "spec_fidelity": { "type": "integer" },
        "ui_fidelity": { "type": "integer" },
        "motion_quality": { "type": "integer" },
        "readability_phone_size": { "type": "integer" },
        "composition_both_formats": { "type": "integer" },
        "brand_and_truth": { "type": "integer" },
        "handoffs": { "type": "integer" }
      },
      "required": ["spec_fidelity", "ui_fidelity", "motion_quality", "readability_phone_size",
                   "composition_both_formats", "brand_and_truth", "handoffs"]
    },
    "problems": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "rank": { "type": "integer", "description": "1 = most important" },
          "t": { "type": "string", "description": "time or range, e.g. '22.0-22.6'" },
          "format": { "type": "string", "description": "16:9 | 4:5 | both" },
          "problem": { "type": "string" },
          "fix": { "type": "string", "description": "concrete and implementable" }
        },
        "required": ["rank", "t", "format", "problem", "fix"]
      }
    },
    "verdict": { "type": "string", "enum": ["ship", "one more pass"] }
  },
  "required": ["scores", "problems", "verdict"]
}
```

With the Workflow tool, pass it as `schema` to `agent()`. With plain subagents, paste it into the prompt and ask for "only the raw JSON, no prose, no code fences" as the final answer.

## Why the prompt says what it says

- **"You have not seen this work" / "do not read the builder's report":** a critic that reads "I built a smooth morph" looks for a smooth morph and finds one. A critic that only has the spec and the pixels finds what is actually there.
- **"Render your own evidence":** the critic's time stamps then refer to frames it has seen, and the fixer can re-render the same frames.
- **Phone-size singles:** most readability failures in the case were invisible at full size. 360 px wide is roughly a 4:5 video in a mobile feed.
- **The hand-offs at both window edges:** each act is built in isolation, so the seams are where the problems hide (screens that pop, a status bar in the wrong colour for a few frames, a camera that stops at an act boundary).
- **Seven fixed score dimensions:** the same dimensions for every act make lanes comparable and show the lead which kind of problem dominates.
- **"A video with no bugs is not the same as a good video":** without it, critics report defects and stop. With it, they also name dull holds, weak signature moments and unclear storytelling.
