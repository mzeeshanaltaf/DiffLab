@AGENTS.md

# DiffLab

Web diff/comparison tool (text, JSON, Excel, image, document) modeled on diffchecker.com. Next.js 16
App Router + TypeScript + Tailwind v4 + shadcn (base-nova, Base UI primitives) + CodeMirror 6 merge.

**Full plan:** [docs/plan/00-overview.md](docs/plan/00-overview.md) is the source of truth — stack
decisions, architecture, data model, design tokens. Read it first, every session. Phase specs live in
`docs/plan/phase-NN-*.md`; implement **one phase per session**, in order.

**Status:** all 10 phases are complete. Phase checklist and per-phase implementation notes/deviations
live in [docs/STATUS.md](docs/STATUS.md) — check it when a past phase's decisions might be relevant;
no need to load it otherwise.

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
