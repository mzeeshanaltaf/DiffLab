export interface DocumentMarker {
  /** 0-indexed line number in `text` where this marker starts. */
  line: number;
  label: string;
}

export interface ParsedDocument {
  text: string;
  markers: DocumentMarker[];
}

const UNSUPPORTED: Record<string, string> = {
  ppt: "PowerPoint files (.ppt) aren't supported yet.",
  pptx: "PowerPoint files (.pptx) aren't supported yet.",
  doc: "Legacy Word files (.doc) aren't supported — save as .docx and try again.",
};

function extensionOf(filename: string): string {
  const dot = filename.toLowerCase().lastIndexOf(".");
  return dot === -1 ? "" : filename.toLowerCase().slice(dot + 1);
}

/** Dispatches by extension: PDF and DOCX get real extraction + markers, everything else falls back to plain text. */
export async function parseDocumentFile(file: File): Promise<ParsedDocument> {
  const ext = extensionOf(file.name);

  if (UNSUPPORTED[ext]) throw new Error(UNSUPPORTED[ext]);

  if (ext === "pdf") {
    const { parsePdfFile } = await import("./pdf");
    return parsePdfFile(file);
  }

  if (ext === "docx") {
    const { parseDocxFile } = await import("./docx");
    return parseDocxFile(file);
  }

  const text = await file.text();
  return { text, markers: [] };
}
