import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/**
 * Colors come from CSS custom properties defined in app/globals.css, so this single
 * theme adapts to both the light and dark palettes without any runtime branching.
 */
export const editorTheme = EditorView.theme({
  "&": {
    color: "var(--foreground)",
    backgroundColor: "var(--card)",
    height: "100%",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-content": {
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    caretColor: "var(--primary)",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    overflow: "auto",
  },
  ".cm-gutters": {
    backgroundColor: "var(--card)",
    color: "var(--muted-foreground)",
    border: "none",
    borderRight: "1px solid var(--border)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 12px" },
  ".cm-marker-gutter": { fontSize: "11px" },
  ".cm-marker-gutter .cm-gutterElement": { padding: "0 10px" },
  ".cm-marker-label": {
    color: "var(--primary)",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklch, var(--foreground) 6%, transparent)",
  },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--foreground)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "color-mix(in oklch, var(--primary) 35%, transparent) !important",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--primary)" },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--muted)",
    border: "1px solid var(--border)",
    color: "var(--muted-foreground)",
    borderRadius: "var(--radius-sm)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
  },
  ".cm-panels": { backgroundColor: "var(--muted)", color: "var(--foreground)" },
  ".cm-panels button": {
    backgroundColor: "var(--secondary)",
    color: "var(--secondary-foreground)",
  },
  ".cm-searchMatch": { backgroundColor: "color-mix(in oklch, var(--primary) 25%, transparent)" },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "color-mix(in oklch, var(--primary) 45%, transparent)",
  },

  // --- @codemirror/merge chunk / change styling ---
  ".cm-changedLine": {
    backgroundColor: "color-mix(in oklch, var(--primary) 10%, transparent)",
  },
  ".cm-changedText, .cm-inlineChangedLine": {
    backgroundColor: "color-mix(in oklch, var(--primary) 34%, transparent)",
  },
  "&.cm-merge-a .cm-changedLine, .cm-deletedChunk": {
    backgroundColor: "color-mix(in oklch, var(--destructive) 12%, transparent)",
  },
  "&.cm-merge-a .cm-changedText, .cm-deletedChunk .cm-deletedText": {
    backgroundColor: "color-mix(in oklch, var(--destructive) 34%, transparent)",
  },
  ".cm-insertedLine, .cm-deletedLine, .cm-deletedLine del": { textDecoration: "none" },
  ".cm-changeGutter": { width: "4px" },
  "&.cm-merge-a .cm-changedLineGutter, .cm-deletedLineGutter": { background: "var(--destructive)" },
  "&.cm-merge-b .cm-changedLineGutter": { background: "var(--primary)" },
  // .cm-mergeView / .cm-mergeViewEditor sizing lives in app/globals.css as plain CSS — see the
  // comment there for why EditorView.theme() can't scope those selectors correctly.
  ".cm-collapsedLines": {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "1px 10px",
    margin: "2px 4px",
  },
  ".cm-collapsedLines:hover": { color: "var(--foreground)", backgroundColor: "var(--accent)" },
  ".cm-merge-revert": { color: "var(--muted-foreground)" },
  ".cm-merge-revert button": { color: "inherit", cursor: "pointer" },
  ".cm-merge-revert button:hover": { color: "var(--primary)" },
});

export const editorHighlightStyle = HighlightStyle.define([
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: "var(--cm-comment)", fontStyle: "italic" },
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: "var(--cm-keyword)" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "var(--cm-string)" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "var(--cm-number)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--cm-function)" },
  { tag: [t.definition(t.variableName), t.definition(t.propertyName)], color: "var(--cm-variable)" },
  { tag: [t.typeName, t.className, t.namespace, t.self], color: "var(--cm-type)" },
  { tag: [t.propertyName, t.attributeName], color: "var(--cm-property)" },
  { tag: [t.operator, t.punctuation, t.bracket, t.separator], color: "var(--cm-punctuation)" },
  { tag: t.tagName, color: "var(--cm-tag)" },
  { tag: t.meta, color: "var(--cm-comment)" },
  { tag: t.invalid, color: "var(--destructive)" },
]);

export function languageHighlighting() {
  return syntaxHighlighting(editorHighlightStyle);
}
