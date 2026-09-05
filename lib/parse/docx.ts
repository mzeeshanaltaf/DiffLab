import type { DocumentMarker, ParsedDocument } from "./document";

const BLOCK_TAGS = new Set(["P", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "TD", "TH", "BLOCKQUOTE"]);
const CONTAINER_TAGS = new Set(["UL", "OL", "TABLE", "TR", "TBODY", "THEAD"]);

function collectParagraphs(root: Element, lines: string[], markers: DocumentMarker[], counter: { n: number }) {
  for (const el of Array.from(root.children)) {
    if (CONTAINER_TAGS.has(el.tagName)) {
      collectParagraphs(el, lines, markers, counter);
    } else if (BLOCK_TAGS.has(el.tagName)) {
      counter.n++;
      markers.push({ line: lines.length, label: `¶ ${counter.n}` });
      lines.push((el.textContent ?? "").replace(/\s+/g, " ").trim());
    } else {
      collectParagraphs(el, lines, markers, counter);
    }
  }
}

/** Converts DOCX to HTML via mammoth, then flattens each block element (paragraph/heading/list item) to one line, so every line maps 1:1 to a paragraph marker. */
export async function parseDocxFile(file: File): Promise<ParsedDocument> {
  const mammoth = (await import("mammoth")).default;
  const buffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });

  const doc = new DOMParser().parseFromString(result.value, "text/html");
  const lines: string[] = [];
  const markers: DocumentMarker[] = [];
  collectParagraphs(doc.body, lines, markers, { n: 0 });

  return { text: lines.join("\n"), markers };
}
