# Prompt: triage

**Used in:** every global critic round, after the three lens critics ([`global-critic-lenses.md`](global-critic-lenses.md)) and before the per-file fixers ([`file-fixer.md`](file-fixer.md)). See [`references/04-build-and-critique.md`](../references/04-build-and-critique.md) §6.

Give triage to a fresh agent, not to the lead session. The lead wrote the foundation and has opinions about it; a triage agent with only the spec and the critic JSON is more neutral, and its skipped list is written down instead of remembered.

## Placeholders

| Placeholder | Example / meaning |
|---|---|
| `{REPO}` | Absolute path of the film project. |
| `{OWNER_MAP}` | Which file owns which part of the film, e.g. `act-a 0-10 s hook + recording; act-b 10-16.3 processing + naming; act-c 16.3-28 questions + key moment + send setup; act-d 28-38 e-mail + payoff + trust; act-e 38-48 outro + logo + end card; foundation = film.js, engine.js, stage.js, overlay-text.js, pushes.js, touch.js, phone.js, timeline.js, copy.js, tokens.css, tools/*` |
| `{OWNERS}` | The owner ids for the schema enum, e.g. `["act-a", "act-b", "act-c", "act-d", "act-e", "foundation"]` |
| `{CONCEPT_RULE}` | The concept constraint from the storyboard, e.g. `one continuous take around the phone` |
| `{CRITICS_JSON}` | The lens critics' results, failed ones filtered out. |
| `{ROUND_RULE}` | One of the round rules below. |

## Prompt

```text
You are the director triaging critic notes for the launch film in {REPO}. Read docs/storyboard.md, docs/brief.md and docs/facts.md, and skim the header comments of src/parts/*.js so you know which file owns what: {OWNER_MAP}.
Critic results (JSON):
{CRITICS_JSON}

Do this:
- Deduplicate overlapping notes; the lenses often describe one fault from different sides.
- Resolve contradictions: storyboard.md, brief.md, facts.md and the non-negotiables win, in that order.
- Drop notes that would invent features or claims, fake UI the product does not render, break the concept ({CONCEPT_RULE}), move events off the music's bar grid, or break a house rule (house curve, no bounce, no decorative glows). Keep everything that makes it look more like a top-tier launch film.
- Read each critic's creative_weaknesses as notes too. Turn the ones a file owner can fix into items; put structural ones (the core moment arrives too late, the hook concept is weak) into skipped with the reason "structural: decision for the human", so the lead can take them to the human.
- Prioritise what raises the lowest scores, not what has the most notes.
- Assign each kept note to exactly ONE owner group: the file where the fix must be made. If a fix needs both a timeline change and an act change, give the timeline part to foundation and the act part to the act, and say so in both fixes.
- Order items by severity.
{ROUND_RULE}

Return the groups (omit empty owners), every skipped note with its reason, a 5-line summary of the film's state and the plan, and the minimum score across all critics.
Return only JSON matching the schema.
```

### Round rules

Use the line that fits the round.

- **First broad round:** leave `{ROUND_RULE}` empty.
- **Last broad round:**
  ```text
  This is the last broad fix round before the targeted fixes, so keep only fixes that can be done safely in one pass (no risky rewrites); prefer severity 1-2.
  ```
- **Final polish round** (if you run one; see the round budget in 04 §10):
  ```text
  This is the FINAL polish round before the final render. Keep only fixes that can be done safely and verified in one pass: no rewrites, no restructuring of acts, no timing changes that ripple across acts unless severity 1. Prioritise what raises the lowest scores. A note that is right but structural goes into skipped with the reason "structural: decision for the human".
  ```

## Schema

```json
{
  "type": "object",
  "properties": {
    "groups": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "owner": { "type": "string", "enum": "{OWNERS}" },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "severity": { "type": "integer" },
                "t": { "type": "string" },
                "format": { "type": "string" },
                "problem": { "type": "string" },
                "fix": { "type": "string" }
              },
              "required": ["severity", "t", "format", "problem", "fix"]
            }
          }
        },
        "required": ["owner", "items"]
      }
    },
    "skipped": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": { "problem": { "type": "string" }, "reason": { "type": "string" } },
        "required": ["problem", "reason"]
      }
    },
    "summary": { "type": "string" },
    "min_score": { "type": "integer" }
  },
  "required": ["groups", "skipped", "summary", "min_score"]
}
```

Replace `"{OWNERS}"` (including the quotes) with the JSON array of owner ids.

## After triage: the problems-only file

The next round's critics verify these problems without seeing any claim about fixes. Save them without the `fix` field:

```js
const problems = triage.groups.flatMap((g) =>
  g.items.map((it) => ({ owner: g.owner, severity: it.severity, t: it.t, format: it.format, problem: it.problem })))
// write to {REPO}/docs/round{N}-problems.json
```

## What good skip reasons look like

From the case's ledgers (`examples/griffel/docs/ledgers/`, lightly edited):

- "38.4 and 38.8 fall off the 120 BPM beat grid. The stack stays on the beats [38.0, 38.5, 39.0]."
- "An accelerating ease breaks non-negotiable 2 (house curve only, vary durations). The same effect, arriving at speed on the hit, comes from shortening the snap."
- "The real preheader is fixed in the e-mail template, so replacing it would fake the inbox row, against the truth rule."
- "Conflicts with critic 1, who wants the flip caption larger. The flip is the act's signature and carries a facts-file claim, so readability wins."
- "Late in polish it would shift every act's measured framings."
- "16:9 is the desktop cut. Feed placements use 4:5. A delivery-spec note, not a film change."

Each names the rule or the evidence, so the next triage can apply the same reason without re-arguing it.
