@AGENTS.md

# DiffLab

Web diff/comparison tool (text, JSON, Excel, image, document) modeled on diffchecker.com. Next.js 16
App Router + TypeScript + Tailwind v4 + shadcn (base-nova, Base UI primitives) + CodeMirror 6 merge.

**Full plan:** [docs/plan/00-overview.md](docs/plan/00-overview.md) is the source of truth — stack
decisions, architecture, data model, design tokens. Read it first, every session. Phase specs live in
`docs/plan/phase-NN-*.md`; implement **one phase per session**, in order.

## Status

- [x] Phase 01 — foundation (scaffold, shadcn init, dark/emerald theme, header/footer, theme toggle)
- [x] Phase 02 — text diff engine (biggest phase — the core product)
- [x] Phase 03 — landing page
- [x] Phase 04 — contact & privacy
- [x] Phase 05 — structured diff (JSON/Excel)
- [x] Phase 06 — image diff
- [ ] Phase 07 — document diff
- [ ] Phase 08 — sharing & persistence (resolve the 3 risks in 00-overview.md first)
- [ ] Phase 09 — SEO & analytics
- [ ] Phase 10 — deploy

**When you finish a phase:** check its box above, and if you made a decision that deviates from or
extends the plan, note it in one line here so the next session doesn't rediscover it.

- **Phase 02 notes:** `@codemirror/merge`'s `DiffConfig` has no ignore-whitespace/case/regex options, so
  `lib/diff/normalize.ts` builds a length-mapped "masked" comparison string (regex/whitespace runs → a
  single placeholder char, same-length so offsets stay valid) and `lib/diff/engine.ts` runs `jsdiff` on
  it, translating positions back to real doc offsets via `override`. Precision/ignore-* toggles and the
  split↔unified switch fully rebuild the `MergeView`/`unifiedMergeView` (reconfigure() doesn't re-run
  `Chunk.build` for a changed `diffConfig`); collapse/gutter/line-wrap/language changes take the same
  full-rebuild path for simplicity — cursor/undo history resets on toggle, an acceptable v1 trade-off.
  No `codemirror`/`basicSetup` meta-package — `lib/cm/setup.ts` hand-assembles the minimal extension set
  from the granular packages listed in 00-overview.md.

- **Phase 03 notes:** used `motion` (the `framer-motion` successor, imported from `motion/react`) instead
  of `framer-motion` per current upstream guidance; `MotionConfig reducedMotion="user"` is set once in
  `app/layout.tsx` rather than scattering `useReducedMotion()` checks into every `initial` prop — SSR
  bakes `initial` values into inline styles, so a component-level `reduce ? false : {...}` branch renders
  differently server vs. client whenever the visitor's OS actually has reduced-motion on, which is a real
  hydration mismatch (confirmed via a Playwright `reducedMotion: "reduce"` context during this session).
  `MotionConfig` keeps `initial` deterministic and collapses the transition to instant client-side instead.
  The hero's `LiveDiffDemo` renders its diff lines as plain static markup (no entrance animation) to
  protect LCP/avoid the same SSR-opacity-0 trap on above-the-fold content; only the blinking cursor is
  client-only, gated behind a `useSyncExternalStore`-based `useIsClient()` (not `useState`+`useEffect`,
  which trips the `react-hooks/set-state-in-effect` lint rule). No dedicated `/compare/json`, `/compare/excel`,
  `/compare/image`, `/compare/document` routes exist yet (phases 5-7), so the landing page's file-type
  grid is informational only (no links) with an honest "next" caption rather than linking to 404s.

- **Phase 04 notes:** built via the `nextjs-contact-form` skill's four templates, restyled onto the
  project's own shadcn components (`Input`/`Label`/`Textarea`/`Button`) instead of the templates' raw
  Tailwind baseline; added `components/ui/textarea.tsx` since base-nova/Base UI has no textarea
  primitive to wrap — it's a plain native `<textarea>` with the same class treatment as `ui/input.tsx`.
  `lib/rate-limit.ts` and `app/api/contact/route.ts` are copied in verbatim (they're already
  framework-neutral); only `source: "difflab"` was filled in. Privacy page's "Save & share" section
  describes Phase 8's not-yet-built persistence honestly as the intended design (hash for small diffs,
  DB row + 1d/7d/30d/never expiry for large ones) rather than claiming it's live. `/contact` and
  `/privacy` are linked from `SiteFooter` only, not the header's mode nav — verified end-to-end against
  the real n8n webhook and Upstash instance in `.env.local`: a real submission returned `{success:true}`,
  a honeypot-filled payload was silently swallowed, and the 6th rapid submission returned 429.

- **Phase 05 notes:** JSON tool (`json-compare.tsx`) hands off to the exact Phase 2 engine — it pretty-prints
  each side (`lib/parse/json.ts`, with optional recursive key-sort) into the same `MergeView`/`unifiedMergeView`
  used by the text tool, so precision/ignore-regex/collapse all carry over for free. Parse errors surface two
  ways: an inline `@codemirror/lint` gutter marker (added as a direct dependency — it was only a transitive
  one before) that re-parses on every doc change, and a red badge in the pane header; the "empty pane" case is
  special-cased out of both so an untouched side isn't flagged as an error. The semantic key-path summary
  (`lib/diff/json-diff.ts`) walks the *parsed values*, independent of formatting/key order, so it only lights
  up once both sides are valid JSON. Excel/CSV (`excel-compare.tsx`) has no test-framework precedent in this
  repo, so it was smoke-tested with a throwaway Playwright script against the running dev server (chromium-cli
  wasn't available in this environment) rather than skipped — caught a real bug where CSV uploads were named
  after the file (`left.csv`/`right.csv`), which meant the two sides could never align as "the same sheet";
  fixed by always naming a bare CSV/TSV parse `Sheet1`. There's no `react-window`/`react-virtual` dependency —
  `virtual-grid.tsx` is a ~100-line hand-rolled windowed grid (absolute-positioned rows + a `ResizeObserver`),
  reused for both the Original/Changed panes with scroll manually synced via refs. Row alignment is index-based
  or by a chosen key column (`lib/diff/sheet-diff.ts`); shadcn has no Tabs primitive in this project, so sheet
  tabs reuse `ToggleGroup` like the split/unified switch. One shadcn quirk worth remembering: Base UI's
  `<Select.Value>` renders the raw selected value, not the matching `<Select.Item>`'s label, unless you pass it
  a `children` render-prop function — used for the indent and key-column selects since their values (`2`, `4`,
  `0`, `1`...) aren't self-describing the way `smart`/`line`/`word` already were in the Phase 2 toolbar.
  Also updated `file-type-grid.tsx` on the landing page (Phase 3 left it link-free on purpose, see its
  note above) so the Text/JSON/Spreadsheets cards now link to their live tools; Images/Documents stay
  plain divs until phases 6-7.

- **Phase 06 notes:** all four overlay modes (slider/fade/onion/diff) plus side-by-side share one
  `ImageViewport` (`components/compare/image-viewport.tsx`) driven by a hand-rolled `useZoomPan` hook
  (`hooks/use-zoom-pan.ts` — new alias dir, wheel-to-zoom + pointer-drag-to-pan, clamped 0.1–8×, with a
  fit-to-container effect that re-fits whenever a new image pair's padded canvas size changes). Images
  load via `createImageBitmap` for pixel access plus a parallel `URL.createObjectURL` for cheap `<img>`
  display (`lib/diff/image-diff.ts`); mismatched dimensions are handled by sizing every mode's canvas box
  to `max(leftW,rightW) x max(leftH,rightH)` and drawing each image at its own natural size top-left, so
  the extra area shows through as a CSS checkerboard rather than stretching either image. Pixel diff uses
  `pixelmatch` directly on two same-size `ImageData` buffers from offscreen canvases (padded area vs. any
  real pixel reliably counts as a diff, which is the desired behavior for size mismatches); a 40-megapixel
  padded-canvas guard skips the computation with an inline message instead of hanging the main thread —
  no worker, consistent with Phases 2/5 not using the `workers/` dir either. `pixelmatch` ships its own
  `.d.ts` (v7.2.0), so `@types/pixelmatch` was installed then removed as redundant. Onion skin is
  implemented as an instant A/B toggle (plus an optional auto-flicker interval) rather than a continuous
  blend, to stay meaningfully distinct from the fade mode's opacity slider. `InputPaneHeader`'s clipboard-paste
  button only reads clipboard text, so the image tool passes `hidePaste` — no clipboard-image paste in v1,
  upload/drag-drop only. Added the `slider` shadcn/Base UI component (none existed) for the fade-opacity and
  diff-sensitivity controls; its generic `onValueChange` typed as `Value extends number ? number : Value`
  resolves to a union when the wrapper component doesn't forward a generic, so callers narrow with a small
  `firstValue()` helper in `image-toolbar.tsx` rather than casting. Verified end-to-end with a throwaway
  Playwright script (no `chromium-cli` in this environment, same as Phase 5) against two differently-sized
  generated PNGs: padding/checkerboard, slider drag, fade blend, onion A/B toggle, pixel-diff highlighting
  + stats, zoom, and pan all confirmed visually with zero console errors.

## Standing rules (don't relitigate)

- **Hydration:** every `/compare/*` page loads its tool via `next/dynamic({ ssr: false })` behind a
  `"use client"` shell (Server Component `page.tsx` → client `tool-shell.tsx` → dynamic import). See
  00-overview.md "Hydration" section.
- **SheetJS:** install from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, never `npm i xlsx`.
- **Footer credit** ("Developed with 💖 by Zeeshan Altaf" → zeeshanai.cloud) must stay on every page —
  it's in the root layout via `SiteFooter`, don't duplicate it per-page.
- **Base UI, not Radix.** `components.json` base is `base-nova`. Buttons/triggers rendering a non-native
  element (e.g. `next/link`) need `nativeButton={false}` on the shadcn `Button`.
- **Next.js 16:** `params`/`searchParams` are async; `middleware.ts` is renamed `proxy.ts`. Check
  `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` if something from training
  data doesn't match.
- **`.env.local`** has all 5 vars already (`DATABASE_URL`, n8n, Upstash) — don't ask the user for them.
- Only commit when the user explicitly asks.
