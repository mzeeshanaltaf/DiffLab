# Phase 07 — Document diff

**Goal** — `/compare/document`. PDF via `pdfjs-dist` (worker copied to `/public`) and DOCX via
`mammoth`, normalized to text and handed to the Phase 2 engine, with a page/paragraph marker gutter.

**PPTX is explicitly deferred** — show it as unsupported rather than shipping bad extraction.
