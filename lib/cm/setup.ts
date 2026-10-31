import { EditorState, Transaction, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers as lineNumbersExt,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { goToNextChunk, goToPreviousChunk } from "@codemirror/merge";
import { editorTheme, languageHighlighting } from "./theme";

export interface EditorSetupOptions {
  lineNumbers: boolean;
  lineWrap: boolean;
  editable: boolean;
  languageExtension: Extension;
}

/**
 * CodeMirror scrolls the cursor into view on paste, which lands at the bottom of the pasted text.
 * Comparing starts from the top, so a paste stays where it is, and one that fills or replaces the
 * whole document goes to its first line.
 */
const keepScrollOnPaste = EditorState.transactionFilter.of((tr) => {
  if (!tr.isUserEvent("input.paste") || !tr.scrollIntoView) return tr;
  let replacedDocument = false;
  tr.changes.iterChangedRanges((fromA, toA) => {
    if (fromA === 0 && toA === tr.startState.doc.length) replacedDocument = true;
  });
  return {
    changes: tr.changes,
    selection: tr.selection,
    effects: replacedDocument ? [...tr.effects, EditorView.scrollIntoView(0)] : tr.effects,
    annotations: [Transaction.userEvent.of(tr.annotation(Transaction.userEvent)!)],
  };
});

/** Hand-rolled equivalent of `basicSetup`, kept minimal for a diff/compare editor. */
export function buildEditorExtensions(options: EditorSetupOptions): Extension[] {
  return [
    options.lineNumbers ? lineNumbersExt() : [],
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    keepScrollOnPaste,
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    options.lineWrap ? EditorView.lineWrapping : [],
    EditorView.editable.of(options.editable),
    keymap.of([
      { key: "Mod-ArrowDown", run: goToNextChunk },
      { key: "Mod-ArrowUp", run: goToPreviousChunk },
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      indentWithTab,
    ]),
    editorTheme,
    languageHighlighting(),
    options.languageExtension,
  ];
}
