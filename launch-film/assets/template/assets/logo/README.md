# Logo slot

`logo.svg` is a placeholder. Replace it with the product's mark (the symbol, not the full
lockup), then regenerate `src/logo.js`:

```bash
node tools/logo_from_svg.mjs assets/logo/logo.svg
# optional: an outlined wordmark SVG (the product NAME only, text converted to paths; a full
# lockup with the mark in it would show the mark twice), and/or --mono to recolour every fill
# to currentColor (the end card then paints the mark in --brand)
node tools/logo_from_svg.mjs assets/logo/logo.svg --wordmark assets/logo/wordmark.svg
```

What the generator expects:

- One `<svg>` with a `viewBox` (or `width`/`height`).
- The shapes the end card should animate as separate **top-level** elements (`<path>`, `<rect>`,
  `<circle>`, `<g>` ...). Each top-level element becomes one part that fades and scales in at its
  final position before the lock. Group shapes that belong together in a `<g>`.
- Flatten transforms on the root if your editor writes them (e.g. Inkscape "Apply transform",
  or `svgo --config` with `convertTransform`). Transforms *inside* a part are kept.
- `fill="currentColor"` paints that shape in `--brand` (src/tokens.css). Explicit colours are
  kept as they are. `<defs>` and `<style>` blocks are carried over.

If there is no wordmark SVG, the end card sets `COPY.end.name` in Inter 800. A brand wordmark
in a commercial font must be outlined (paths) before it goes here; never bundle the font.

Logos are trademarks. Only use a logo you are allowed to use, and do not publish a client's
logo in a public repository without permission.
