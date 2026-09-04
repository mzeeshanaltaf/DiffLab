# Phase 02 — Text diff engine

**Goal** — the core product. Biggest phase; get it right before anything else.

`lib/cm/languages.ts` (language registry + extension→language map), `lib/cm/theme.ts` (CM themes bound
to Tailwind tokens), `lib/diff/{engine,normalize,patch}.ts`, `components/compare/text-compare.tsx` on
`MergeView`/`unifiedMergeView`, plus `toolbar.tsx`, `stats-bar.tsx`, `input-pane.tsx`.

Features: two live panes (Original / Changed) with paste, file picker, drag-drop · side-by-side ↔
unified toggle · precision smart/line/word/character · ignore whitespace · ignore case · custom ignore
regex (timestamps, UUIDs) · collapse unchanged lines with context margin · line wrap · line numbers ·
syntax highlighting with language picker + auto-detect from extension · per-chunk merge/revert arrows ·
live re-diff while typing · add/remove/modify stats · prev/next change nav with keyboard shortcuts ·
swap sides · clear · load example · export unified `.patch` + copy to clipboard · print-to-PDF stylesheet.

**Apply the `ssr: false` wrapper here first** — this is where a hydration mistake is most costly.
Use `nextjs-best-practices` and `vercel-react-best-practices`.

**Done when** typing in either pane live-updates the diff, every toggle visibly changes output, and
merge arrows actually move text.
