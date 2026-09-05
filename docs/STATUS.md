# Status

- [x] Phase 01 — foundation (scaffold, shadcn init, dark/emerald theme, header/footer, theme toggle)
- [x] Phase 02 — text diff engine (biggest phase — the core product)
- [x] Phase 03 — landing page
- [x] Phase 04 — contact & privacy
- [x] Phase 05 — structured diff (JSON/Excel)
- [x] Phase 06 — image diff
- [x] Phase 07 — document diff
- [x] Phase 08 — sharing & persistence
- [x] Phase 09 — SEO & analytics
- [x] Phase 10 — deploy

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

- **Phase 07 notes:** both parsers (`lib/parse/pdf.ts`, `lib/parse/docx.ts`) return the same shape —
  `{ text, markers: {line, label}[] }` — so `document-compare.tsx` hands `text` straight to the exact
  Phase 2 `MergeView`/`unifiedMergeView` setup (no language extension) and renders `markers` through a
  new hand-rolled gutter (`lib/cm/marker-gutter.ts`, a plain `gutter({ lineMarker })` closing over a
  static array — document text only changes on file load, never per keystroke, so there's no need for
  a `StateField`/effect like CodeMirror's own dynamic gutters use). PDF: `pdfjs-dist`'s worker is a
  build artifact, not a static asset, so `scripts/copy-pdf-worker.js` copies
  `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` → `public/pdf.worker.min.mjs` on every
  `npm install` (wired via `postinstall`); `GlobalWorkerOptions.workerSrc` points at that public path.
  Pages are split into lines using `TextItem.hasEOL` (pdf.js's own line-break flag) rather than any
  y-position heuristic, with a "Page N" marker recorded at each page's first line. DOCX: `mammoth`
  ships no types (no `@types/mammoth` exists either), so `types/mammoth.d.ts` declares the minimal
  `convertToHtml` surface actually used. Rather than trust blank-line grouping in `extractRawText`,
  DOCX goes through `convertToHtml` + `DOMParser` and flattens each block element (`p`/`h1-6`/`li`/
  table cell) to exactly one line, so every line has an unambiguous 1:1 paragraph marker (`¶ N`) —
  list items inside `ul`/`ol` are recursed into rather than squashed into their parent's text. PPTX
  (and legacy `.doc`) are rejected with an inline error badge via the same `InputPaneHeader` error prop
  Phase 5 uses for bad JSON/CSV, not silently mis-parsed. No language selector or examples dropdown in
  `document-toolbar.tsx` (documents have neither concept) — otherwise identical options to the text
  tool. Verified end-to-end with a throwaway Playwright script (same pattern as Phases 5/6): two real
  multi-page PDFs from Chromium's own `page.pdf()` and two real DOCX files from `pandoc` (both already
  present in this environment) confirmed page/paragraph gutters, word-level highlighting, stats, and
  the PPTX rejection message, with zero console errors.

- **Phase 08 notes:** the three pre-Phase-8 risks were resolved for real, not just documented: SSH'd into
  the VPS and found `postgres-pgvector` (the container behind `postgresdb`) had `ssl = off` and `ufw`
  inactive, confirming both Risk 1 and Risk 3. Generated a self-signed cert with `openssl` inside the
  container (`postgres` runs as uid 999), set `ssl = on` in `postgresql.conf`, and restarted the
  container — a brief blip for any other app sharing that Postgres instance, done with the user's
  explicit go-ahead since it's shared infra. `DATABASE_URL` gained `?sslmode=require&connection_limit=1
  &pool_timeout=20`; the self-signed cert means no CA to verify against, which is fine for `sslmode=require`
  (encrypt, don't verify) — except recent `pg`/`pg-connection-string` now treats `require` as an alias for
  `verify-full` and rejects the self-signed cert, so `&uselibpqcompat=true` is also required to restore the
  old encrypt-only behavior (see the warning in `pg`'s own connection code if this ever needs revisiting).
  **Prisma 7 gotcha:** the `prisma-database-setup` skill's driver-adapter pattern (`@prisma/adapter-pg` +
  `PrismaPg`) moves the connection URL out of `schema.prisma` into `prisma.config.ts`, and critically, the
  generated client **fully qualifies every query's schema name at codegen time** rather than trusting the
  connection's `search_path` — so `?schema=difflab` in the URL (which is all classic Prisma needed, and
  still all `prisma migrate` needs) silently does nothing for actual query execution and every query 404's
  with "table `public.diffs` does not exist" even though the table is right there in `difflab`. The fix is
  the multi-schema feature: `schemas = ["difflab"]` on the `datasource` block plus `@@schema("difflab")`
  on the `Diff` model (no `previewFeatures` flag needed — it's stable in 7.10). `prisma.config.ts` loads
  `.env.local` explicitly via `dotenv` since the Prisma CLI only reads `.env` by default and this repo
  keeps every secret in `.env.local`. Sharing itself: `lib/share/url.ts` (client-safe: `lz-string` hash
  encode/decode, a 6000-char budget past which the share dialog switches to the saved-link flow) is
  imported directly by each tool component so `#d=...` restores on the *live* `/compare/*` URL, while
  `/d/[id]` is a Server Component that fetches via `lib/share/persist.ts` (server-only Prisma calls) and
  feeds the row's `payload` into `ToolShell`'s new `initial` prop — both paths converge on the same
  `Partial<...ShareData>` restore effect inside each tool. Wired the Share button (new `dialog`/`sonner`
  shadcn components) into **Text, JSON, and Excel only** — their state is plain JSON-serializable data
  (text/options, or `ParsedWorkbook`). Image and Document are binary-shaped (pixel canvases, PDF/DOCX
  bytes) and don't fit the same payload; sharing for those two is deliberately out of scope for v1, same
  precedent as Phase 3 leaving unbuilt tool cards unlinked rather than half-wiring something misleading.
  `lib/rate-limit.ts` now takes a `kind` param (`"contact"` | `"diffs"`) so `/api/diffs` gets its own
  tighter Upstash limiter (10/10min) instead of sharing the contact form's budget. Verified end-to-end
  with a throwaway Playwright script (same pattern as Phases 5-7): small diff round-tripped through a
  `#d=` hash in a fresh tab, a 20k-line diff correctly fell back to the oversized-saved-link UI, the
  created `/d/[id]` rendered its content in a fresh browser context, a `SELECT` against
  `difflab.diffs` showed real rows with `views` incrementing, and a rapid-fire loop against
  `/api/diffs` returned 429 — zero console errors throughout.

- **Phase 09 notes:** `lib/seo.ts` centralizes `SITE_URL`/`SITE_NAME` and a `pageMetadata({title,
  description, path})` helper used by every route's `metadata` export — necessary because Next's
  metadata merging is shallow: a page that defines `openGraph`/`twitter` fully replaces (doesn't
  deep-merge with) the root layout's, so each page must restate its own title/description inside
  those nested objects rather than relying on inheritance. `app/opengraph-image.tsx` is a single
  root-level `next/og` `ImageResponse` (dark/emerald branded, badge + wordmark + tagline + a
  "Try it free — no signup →" CTA pill) that applies to every route via file-convention lookup;
  no per-route OG images since the tools have no per-page visual to differentiate on. `app/sitemap.ts`
  lists the 8 public routes (`/`, five `/compare/*`, `/contact`, `/privacy`); `/d/[id]` is intentionally
  excluded and stays noindexed via the per-page `robots` meta added in Phase 8, reinforced by
  `app/robots.ts` disallowing `/d/` and `/api/` outright. JSON-LD (`SoftwareApplication` + `FAQPage`,
  built from a `FAQS` array now exported out of `components/landing/faq.tsx` so the structured data
  can't drift from the visible FAQ copy) lives in `app/page.tsx` as a single `<script type="application/
  ld+json">` with both objects in a top-level array. Running the `seo-audit` skill against the built
  site surfaced one real defect worth recording: **all five `/compare/*` tool pages had zero `<h1>`** —
  `ToolShell` is a client-only dynamic import with no heading of its own, so `page.tsx` (a Server
  Component) needed its own compact `<h1>` added directly, sized small (`text-base font-semibold`) to
  keep the "quiet and utilitarian" tool chrome per 00-overview.md's design direction without disturbing
  the `calc(100vh-230px)` viewport-height budget each tool's editor pane depends on (confirmed via a
  rebuilt+restarted prod server, not the stale one still bound to the port from the previous check —
  `next start` binds to a build snapshot, so a killed/re-launched server is required to see fixes, a
  `curl` against a stale process silently serves the old HTML with no error). Also fixed from the audit:
  the image tool's meta description was 161 chars (over the 160 truncation limit) and the contact
  page's was only 51 (under the 70-char "wasted opportunity" floor) — both rewritten to fit.
  `@vercel/analytics`'s `<Analytics/>` (from the `/next` entry, App-Router-aware) is mounted directly in
  `app/layout.tsx`'s `<body>` as a sibling after the provider tree, not inside it — it injects its
  tracking script client-side via `document.createElement` on mount, so it produces no server-rendered
  markup and is a verified no-op until the app is actually deployed on Vercel with Web Analytics enabled
  in the project dashboard.

- **Phase 10 notes:** deployed via the Vercel CLI (`npx vercel`) rather than the dashboard import
  flow — `vercel link --project difflab` both created the project and auto-connected the existing
  `mzeeshanaltaf/DiffLab` GitHub repo (device-flow login auto-approved against an already-authenticated
  browser session, no manual click needed). All 5 env vars from `.env.local` were pushed via `vercel env
  add <NAME> <target>` (one call per target — passing multiple targets as separate args is misparsed as
  `<environment> <gitBranch>` and fails with `branch_not_found`); `DATABASE_URL` went to Production +
  Preview, the other 4 to Production + Preview as planned. First deploy: `vercel deploy --prod`.
  **Deviation from this file's own plan:** `vercel domains add difflab.zeeshanai.cloud difflab` then
  `vercel domains inspect` returned Vercel's *actual* required record for this domain as an **A record
  `difflab → 76.76.21.21`**, not the `CNAME → cname.vercel-dns.com` the plan guessed — created that A
  record on Hostinger DNS via the `hostinger-dns` MCP (`DNS_updateDNSRecordsV1`, `overwrite:false` so it
  only appended, verified first against `DNS_getDNSRecordsV1` that no `difflab` record already existed
  and that it wouldn't collide with the Coolify box's other 20+ subdomains). DNS resolved and Vercel's
  auto-provisioned SSL was live within under a minute (no manual "verify" step needed). Smoke-tested
  every route plus the two DB-backed API routes for real: `POST /api/diffs` → `GET /d/[id]` round-tripped
  successfully (confirms the Phase 8 Prisma multi-schema/`uselibpqcompat` setup works from Vercel's
  network, not just locally), and `POST /api/contact` with the honeypot field filled returned
  `{success:true}` without hitting the real n8n webhook — verified the anti-spam path without sending a
  real notification. Live at **https://difflab.zeeshanai.cloud**.
