import type { DocumentMarker, ParsedDocument } from "./document";

let workerConfigured = false;

async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }
  return pdfjsLib;
}

/** Extracts text page-by-page, grouping items into lines via pdf.js's `hasEOL` flag and recording a "Page N" marker at each page's first line. */
export async function parsePdfFile(file: File): Promise<ParsedDocument> {
  const pdfjsLib = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const lines: string[] = [];
  const markers: DocumentMarker[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const markerLine = lines.length;

      let currentLine = "";
      for (const item of content.items) {
        if (!("str" in item)) continue;
        currentLine += item.str;
        if (item.hasEOL) {
          lines.push(currentLine);
          currentLine = "";
        }
      }
      if (currentLine) lines.push(currentLine);
      if (lines.length === markerLine) lines.push("");

      markers.push({ line: markerLine, label: `Page ${pageNum}` });
    }
  } finally {
    await loadingTask.destroy();
  }

  return { text: lines.join("\n"), markers };
}
