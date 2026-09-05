import { gutter, GutterMarker } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import type { DocumentMarker } from "@/lib/parse/document";

class LabelMarker extends GutterMarker {
  constructor(readonly label: string) {
    super();
  }
  eq(other: LabelMarker) {
    return other.label === this.label;
  }
  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.label;
    span.className = "cm-marker-label";
    return span;
  }
}

/**
 * A page/paragraph marker gutter for extracted PDF/DOCX text. Markers are fixed at build time
 * (document text only changes on file load, not keystroke), so this closes over a static array
 * rather than tracking edits via a StateField.
 */
export function markerGutter(markers: DocumentMarker[]): Extension {
  if (markers.length === 0) return [];
  const byLine = new Map(markers.map((m) => [m.line + 1, m.label]));

  return gutter({
    class: "cm-marker-gutter",
    lineMarker(view, block) {
      const lineNumber = view.state.doc.lineAt(block.from).number;
      const label = byLine.get(lineNumber);
      return label ? new LabelMarker(label) : null;
    },
    lineMarkerChange: () => false,
  });
}
