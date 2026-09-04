# Phase 04 — Contact and privacy

**Goal** — `/contact` and `/privacy`, matching the reference screenshot.

Drive this with the **`nextjs-contact-form` skill** and its four templates — the env var names in
`.env.local` (`N8N_CONTACT_WEBHOOK_URL`, `N8N_API_KEY`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`) already match what it expects, so this is close to push-button.

Includes: Name / Email / Message-Feedback fields, icon badge + title + muted subtitle, emerald
"Send message" button with a send glyph, non-semantic `hp_field` honeypot, per-IP Upstash rate limiting,
progressive enhancement so it works without hydration, `x-api-key` sent server-side only.

Privacy page states the client-side-by-default stance, what "Save & share" stores, retention/expiry, and
what the contact webhook receives.

**Done when** a real submission lands in n8n, the honeypot silently swallows a bot fill, and rapid
repeat submissions return 429.
