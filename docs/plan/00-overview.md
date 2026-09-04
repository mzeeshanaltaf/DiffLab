# DiffLab — Web-based diff & comparison tool

## Context

`E:\Projects\Claude Code\2_Tools\DiffChecker` is a greenfield build of **DiffLab** — a web app that
compares two inputs and highlights the differences, modelled on
[diffchecker.com](https://www.diffchecker.com/) but built from scratch.

Research that shapes the design:

- Diffchecker's product is five comparison surfaces — text/code, Excel, documents, images, and folders
  (folders are desktop-only, so out of scope for a web app).
- The text tool is the centre of gravity: two live editors, side-by-side **and** unified views,
  character/word/"smart" precision, ignore-whitespace, hide-unchanged-lines, line-wrap, syntax
  highlighting across 20+ languages, per-chunk merge/revert, and live re-diff while typing.
- Most of what Diffchecker charges Pro for — unified view, word/char precision, syntax highlighting,
  live editing, merge — ships free in `@codemirror/merge`. **That library is the single
  highest-leverage decision here** and removes most custom diff-rendering work.

**Confirmed scope:** all five web-capable comparison types · sharing via both URL-hash *and* saved short
links · Postgres on the Hostinger VPS (schema `difflab`) · deployed to Vercel at
**difflab.zeeshanai.cloud** · bold agency-grade landing page · Contact + Privacy pages.

---

## ⚠️ Three risks to decide on before Phase 8

**1. `DATABASE_URL` has no `sslmode`, and Vercel reaches the VPS over the open internet.**
The URL is a bare `postgres://…@76.13.7.106:5432/postgresdb`. Vercel's serverless functions connect
from rotating public IPs, so every query — credentials included, plus whatever text a user chose to
save — would cross the public internet unencrypted. Plan: append `?sslmode=require` and enable TLS on
the Postgres container. If TLS isn't configured there, Phase 8 stops and we set it up first.

**2. Serverless will exhaust Postgres connections.**
Each concurrent Vercel lambda opens its own connection; stock Postgres `max_connections` is 100 and
this box already runs 18+ Coolify apps. Plan: `?connection_limit=1&pool_timeout=20` on the Prisma URL,
and keep DB access confined to the two `/api/diffs` routes so nothing else holds connections.

**3. Port 5432 exposure.**
If the VPS firewall currently allows 5432 from anywhere, that's a standing risk independent of this
project. Vercel publishes no static egress IPs on Hobby/Pro, so IP-allowlisting isn't available —
which makes TLS + a strong role password the actual control. Worth a look with the Hostinger VPS MCP
tools during Phase 8.

None of these block Phases 1–7, which need no database at all.

---

## Technology decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 App Router + TypeScript** | SSG landing for SEO, client-only tool routes, API routes, first-class on Vercel |
| Styling | **Tailwind v4 + shadcn/ui** (`shadcn` skill) | Supplies Dialog/Select/Tabs/Tooltip/Toast primitives |
| Diff editors | **CodeMirror 6 + `@codemirror/merge`** | `MergeView` (split) and `unifiedMergeView`, with `highlightChanges`, `gutter`, `renderRevertControl`, `collapseUnchanged({margin, minSize})`, `diffConfig.scanLimit` — exactly the Diffchecker feature matrix |
| Syntax highlighting | `@codemirror/lang-*` + `@codemirror/legacy-modes` | ~15 first-class packs plus legacy modes to reach 30+ languages |
| Text diff (non-editor) | **`diff` (jsdiff)** | Unified-patch export, diff stats, diffing extracted document text |
| Image diff | **`pixelmatch`** + Canvas 2D | Standard pixel-difference impl; slider/fade/onion are plain CSS/canvas |
| PDF text | **`pdfjs-dist`** (`getTextContent`) | Only library exposing the positioning data needed to rebuild lines |
| Word | **`mammoth`** | DOCX → text/HTML in-browser |
| Spreadsheets | **SheetJS from the vendor CDN** | ⚠️ see gotcha below |
| URL sharing | **`lz-string`** | Compresses both sides into `#`, never leaves the browser |
| Saved diffs | **Hostinger VPS Postgres + Prisma**, schema `difflab`, `nanoid` IDs | Use `prisma-database-setup` skill |
| Contact form | **n8n webhook + Upstash rate limit** | Use `nextjs-contact-form` skill — env var names already match |
| Motion | **`framer-motion`** (`framer-motion-animator` skill) | Landing page only |
| Analytics | **`@vercel/analytics`** (`add-vercel-analytics` skill) | |
| SEO | **`seo-audit` skill** | Phase 9 |

### ⚠️ SheetJS install gotcha
npm `xlsx` is **abandoned at 0.18.5** with two unfixed high-severity advisories (prototype pollution
CVE-2023-30533, ReDoS CVE-2024-22363). The patched build is only distributed by the vendor:

```
npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

Do **not** run `npm i xlsx`. ExcelJS is not a substitute — it cannot read XLS or ODS.

### ⚠️ Hydration (from global CLAUDE.md)
Every tool surface initialises from browser-only APIs — CodeMirror touches `document` at construction,
the share layer reads `location.hash`, `nanoid()` is non-deterministic. Server-rendering that subtree
produces a mismatch that silently kills event handlers. **Every `/compare/*` page loads its tool through
`next/dynamic` with `{ ssr: false }`.** Since `ssr: false` is illegal inside a Server Component in the
App Router, the shape is:

```
app/compare/text/page.tsx        // Server Component — exports `metadata` only
  └─ components/tool-shell.tsx   // "use client" + dynamic(() => import(...), { ssr: false })
       └─ components/compare/text-compare.tsx
```

The contact form is the mirror image of this problem, which is why the `nextjs-contact-form` skill uses
progressive enhancement — it posts to a real route handler and works even if hydration fails.

---

## Design direction

Taken from the reference screenshot: near-black canvas (`#0a0a0a`), cards a step lighter with a hairline
border and generous radius, **emerald/green accent** for primary actions, rounded-square icon badges,
section headers pairing a bold title with a muted one-line subtitle. Landing gets agency-grade treatment
(`high-end-visual-design` + `framer-motion-animator`); the tool stays quiet and utilitarian.

---

## Architecture

```
app/
  layout.tsx                      fonts, theme provider, header, footer, <Analytics/>
  page.tsx                        LANDING (static, SEO, framer-motion)
  compare/
    layout.tsx                    tool chrome + mode tabs
    text/  json/  excel/  image/  document/   (page.tsx each)
  d/[id]/page.tsx                 saved diff (noindex)
  contact/page.tsx                n8n webhook form
  privacy/page.tsx
  api/contact/route.ts            rate-limited webhook proxy
  api/diffs/route.ts              POST create (rate-limited)
  api/diffs/[id]/route.ts         GET fetch
  sitemap.ts  robots.ts  opengraph-image.tsx

components/
  landing/                        hero, live-diff demo, features, use-cases, faq, cta
  compare/
    text-compare.tsx              CodeMirror MergeView wrapper — the core
    json-compare.tsx  excel-compare.tsx  image-compare.tsx  document-compare.tsx
    toolbar.tsx  stats-bar.tsx  input-pane.tsx  share-dialog.tsx
  contact-form.tsx  site-header.tsx  site-footer.tsx
  ui/                             shadcn primitives

lib/
  diff/engine.ts  diff/normalize.ts  diff/patch.ts
  cm/languages.ts  cm/theme.ts
  parse/pdf.ts  parse/docx.ts  parse/sheet.ts  parse/csv.ts
  share/url.ts  share/db.ts
  rate-limit.ts
workers/  diff.worker.ts  parse.worker.ts
prisma/schema.prisma
docs/plan/                        the phase docs
```

### Data model — schema `difflab`, one table

```prisma
generator client { provider = "prisma-client-js" }
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")   // + ?schema=difflab&sslmode=require&connection_limit=1
}

model Diff {
  id        String   @id            // nanoid(10)
  mode      String                  // text | json | excel | image | document
  payload   Json                    // { left, right, language, options }
  createdAt DateTime @default(now())
  expiresAt DateTime?               // 1d / 7d / 30d / never
  views     Int      @default(0)
  @@map("diffs")
}
```

Appending `?schema=difflab` makes Prisma Migrate create the schema and place tables inside it,
isolated from whatever else shares `postgresdb`.

**Privacy stance** (state on the landing page, enforce in code): *nothing is uploaded unless the user
explicitly clicks "Save & share".* Every parse, diff, and render is client-side.

---

## Phase index

- [phase-01-foundation.md](phase-01-foundation.md)
- [phase-02-text-diff-engine.md](phase-02-text-diff-engine.md)
- [phase-03-landing-page.md](phase-03-landing-page.md)
- [phase-04-contact-and-privacy.md](phase-04-contact-and-privacy.md)
- [phase-05-structured-diff.md](phase-05-structured-diff.md)
- [phase-06-image-diff.md](phase-06-image-diff.md)
- [phase-07-document-diff.md](phase-07-document-diff.md)
- [phase-08-sharing-and-persistence.md](phase-08-sharing-and-persistence.md)
- [phase-09-seo-and-analytics.md](phase-09-seo-and-analytics.md)
- [phase-10-deploy.md](phase-10-deploy.md)

---

## Verification (full pass, after Phase 10)

- **Hydration check first:** open `/compare/text`, type in the left pane, confirm live re-diff. Dead
  handlers with no console error means an `ssr: false` wrapper is missing.
- Two ~500-line files with a moved block: side-by-side and unified agree; word precision highlights
  intra-line changes; merge arrows move text.
- Toggle every option and confirm each visibly changes the rendered diff.
- 10k-line file stays responsive (worker path); past the cap, a message appears instead of a hang.
- Upload a real `.xlsx`, `.pdf`, `.docx`; a corrupt file shows an error, not a blank pane.
- Same-size and different-size image pairs through all five image modes.
- Share: hash round-trip in a fresh tab; oversized → saved link; `/d/[id]` in a private window;
  `/api/diffs` in a loop returns 429.
- Contact: real submission reaches n8n; honeypot fill silently succeeds without delivering; repeat
  submissions return 429; form still submits with JS disabled.
- `npm run build` clean (no type errors, no `window is not defined`).
- Lighthouse on `/`: Performance ≥ 90, Accessibility ≥ 95. `seo-audit` clean.
- Footer credit links to `https://zeeshanai.cloud` on every page.
