# Phase 05 — Structured diff

**Goal** — `/compare/json` and `/compare/excel`.

JSON: parse with inline error markers, pretty-print, optional key sorting so reordering isn't noise,
semantic summary of added/removed/changed key paths, then hand off to the Phase 2 engine.

Excel/CSV: XLSX, XLS, CSV, TSV, ODS via the CDN SheetJS build · sheet tabs · row alignment by index or
chosen key column · cell-level add/remove/change highlighting · virtualized grid.
