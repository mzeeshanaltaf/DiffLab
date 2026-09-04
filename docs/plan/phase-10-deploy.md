# Phase 10 — Deploy

**Goal** — live at **difflab.zeeshanai.cloud**.

Push to GitHub → import to Vercel → add all five env vars (`DATABASE_URL` with its full query string,
the two n8n vars, the two Upstash vars) → add the custom domain in Vercel → create the DNS record on
`zeeshanai.cloud` (CNAME `difflab` → `cname.vercel-dns.com`) using the **Hostinger DNS MCP tools** →
verify SSL issues → smoke-test every route on production → `ship`.

Note: DNS for `zeeshanai.cloud` is at Hostinger while the app runs on Vercel — that split is fine, but
the record must not collide with anything already pointing at the Coolify box.
