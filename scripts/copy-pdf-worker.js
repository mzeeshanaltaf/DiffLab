// pdfjs-dist ships its worker as a build artifact inside node_modules, which isn't served as a
// static asset. This copies it into /public so `GlobalWorkerOptions.workerSrc` can point at a real
// URL (see lib/parse/pdf.ts). Runs on every `npm install` via the postinstall hook.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
} else {
  console.warn("[copy-pdf-worker] pdfjs-dist worker not found, skipping copy:", src);
}
