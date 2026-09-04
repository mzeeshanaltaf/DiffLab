# Phase 08 — Sharing and persistence

**Goal** — both sharing modes. **Resolve the three risks at the top of [00-overview.md](00-overview.md) first.**

URL-hash sharing via `lz-string` with a size budget; above the budget, fall back to a saved link.
Then Prisma against the VPS Postgres with `?schema=difflab&sslmode=require&connection_limit=1`,
`prisma migrate dev` to create schema + table, `/api/diffs` POST (Upstash rate-limited, reusing
`lib/rate-limit.ts` from Phase 4) and GET, `/d/[id]` with expiry options 1d/7d/30d/never, and a
share dialog that picks hash vs. saved link by payload size.

**Done when** a small diff round-trips through the URL in a fresh tab, an oversized one falls back to a
short link, `/d/[id]` renders in a private window, and `SELECT * FROM difflab.diffs` shows the row.
