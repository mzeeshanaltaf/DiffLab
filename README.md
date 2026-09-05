# DiffLab

A web-based diff and comparison tool — text, JSON, spreadsheets, images, and documents — built with
Next.js 16, TypeScript, Tailwind v4, and shadcn/ui (Base UI primitives). Modeled on diffchecker.com.

## Features

- **Text diff** ([/compare/text](app/compare/text)) — side-by-side or unified view powered by
  `@codemirror/merge`, with character/word/line precision, ignore whitespace/case/regex, syntax
  highlighting for a dozen languages, and collapsible unchanged regions.
- **JSON diff** ([/compare/json](app/compare/json)) — pretty-prints and compares JSON with optional
  key sorting, inline parse-error linting, and a semantic key-path summary of what actually changed
  (independent of formatting or key order).
- **Spreadsheet diff** ([/compare/excel](app/compare/excel)) — compares Excel/CSV/TSV workbooks
  sheet-by-sheet in a virtualized grid, with index-based or key-column row alignment and cell-level
  highlighting.
- **Image diff** ([/compare/image](app/compare/image)) — slider, fade, onion-skin, side-by-side, and
  pixel-diff (via `pixelmatch`) comparison modes, with zoom/pan, mismatched-dimension handling, and
  diff statistics.
- **Document diff** ([/compare/document](app/compare/document)) — compares PDF and DOCX files as text,
  with page/paragraph gutter markers and word-level highlighting.
- **Save & share** — small diffs round-trip through a compressed URL hash; larger diffs (Text/JSON/
  Excel) are persisted to Postgres and shared via a short `/d/[id]` link with configurable expiry.
- **SEO-ready** — per-page metadata, Open Graph image generation, sitemap/robots, and JSON-LD
  structured data.
- **Dark/emerald themed UI** with a light/dark toggle, landing page, contact form, and privacy policy.

See [docs/plan/00-overview.md](docs/plan/00-overview.md) for the full architecture and design-token
reference, and the "Status" section of [CLAUDE.md](CLAUDE.md) for phase-by-phase implementation notes.

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling/UI:** Tailwind CSS v4, shadcn/ui (`base-nova` preset, Base UI primitives)
- **Diff engine:** `@codemirror/merge` + `diff` (jsdiff), `pixelmatch` for image pixel diffing
- **Parsing:** SheetJS (`xlsx`) for spreadsheets, `pdfjs-dist` for PDF, `mammoth` for DOCX
- **Persistence:** Prisma 7 + PostgreSQL (driver adapter), `lz-string` for hash-based sharing
- **Infra:** Upstash Redis (rate limiting), n8n webhook (contact form), Vercel Analytics

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables

Copy `.env.local.example` (or see `.env.local`) and fill in:

- `DATABASE_URL` — PostgreSQL connection string (used by Prisma for saved diffs)
- n8n webhook URL/API key — contact form submission
- Upstash Redis URL/token — rate limiting for the contact form and `/api/diffs`

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Next.js features and API.
- [shadcn/ui](https://ui.shadcn.com) — the component system this project is built on.

## Deploy

The easiest way to deploy a Next.js app is [Vercel](https://vercel.com/new), from the creators of
Next.js — see the [deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for details.
