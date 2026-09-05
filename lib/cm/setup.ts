import { EditorState, type Extension } from "@codemirror/state";
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

/** Hand-rolled equivalent of `basicSetup`, kept minimal for a diff/compare editor. */
export function buildEditorExtensions(options: EditorSetupOptions): Extension[] {
  return [
    options.lineNumbers ? lineNumbersExt() : [],
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
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
