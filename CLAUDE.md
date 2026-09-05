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
- [ ] Phase 03 — landing page
- [ ] Phase 04 — contact & privacy
- [ ] Phase 05 — structured diff (JSON/Excel)
- [ ] Phase 06 — image diff
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
