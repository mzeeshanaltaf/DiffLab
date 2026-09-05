"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { MergeView, goToNextChunk, goToPreviousChunk, unifiedMergeView } from "@codemirror/merge";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { buildEditorExtensions } from "@/lib/cm/setup";
import { getLanguageDef } from "@/lib/cm/languages";
import { buildDiffConfig, computeDiffStats, type DiffStats } from "@/lib/diff/engine";
import { compileIgnoreRegex, DEFAULT_DIFF_OPTIONS, type Precision } from "@/lib/diff/normalize";
import { createUnifiedPatch, downloadTextFile } from "@/lib/diff/patch";
import { diffJsonValues } from "@/lib/diff/json-diff";
import { parseJsonWithError, prettyPrintJson, type IndentOption, type JsonParseResult } from "@/lib/parse/json";
import { getDiffExample } from "@/lib/diff/examples";
import { readShareHashFromLocation } from "@/lib/share/url";
import { InputPaneHeader } from "./input-pane";
import { JsonToolbar } from "./json-toolbar";
import { StatsBar } from "./stats-bar";

type ViewMode = "split" | "unified";
type MergeDirection = "a-to-b" | "b-to-a";

interface JsonShareData {
  left: string;
  right: string;
  leftFilename: string | null;
  rightFilename: string | null;
  viewMode: ViewMode;
  precision: Precision;
  ignoreCase: boolean;
  ignoreRegex: string;
  indent: IndentOption;
  sortKeys: boolean;
}

const EMPTY_PARSE = parseJsonWithError("");

function displayError(parse: JsonParseResult) {
  if (parse.ok || parse.error.message === "Input is empty") return null;
  return parse.error;
}

export function JsonCompare({ initial }: { initial?: Partial<JsonShareData> }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftTextRef = useRef("");
  const rightTextRef = useRef("");
  const mergeViewRef = useRef<MergeView | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const [leftFilename, setLeftFilename] = useState<string | null>(null);
  const [rightFilename, setRightFilename] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [precision, setPrecision] = useState<Precision>(DEFAULT_DIFF_OPTIONS.precision);
  const [ignoreCase, setIgnoreCase] = useState(DEFAULT_DIFF_OPTIONS.ignoreCase);
  const [ignoreRegex, setIgnoreRegex] = useState(DEFAULT_DIFF_OPTIONS.ignoreRegex);
  const [collapseEnabled, setCollapseEnabled] = useState(true);
  const [collapseMargin, setCollapseMargin] = useState(3);
  const [lineWrap, setLineWrap] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [mergeDirection, setMergeDirection] = useState<MergeDirection>("a-to-b");
  const [indent, setIndent] = useState<IndentOption>(2);
  const [sortKeys, setSortKeys] = useState(false);

  const [stats, setStats] = useState<DiffStats>({ additions: 0, deletions: 0, changes: 0 });
  const [leftParse, setLeftParse] = useState<JsonParseResult>(EMPTY_PARSE);
  const [rightParse, setRightParse] = useState<JsonParseResult>(EMPTY_PARSE);

  const ignoreRegexValid = ignoreRegex.trim() === "" || compileIgnoreRegex(ignoreRegex) !== null;

  const jsonChanges = useMemo(() => {
    if (!leftParse.ok || !rightParse.ok) return [];
    return diffJsonValues(leftParse.value, rightParse.value);
  }, [leftParse, rightParse]);

  const commitSide = useCallback((side: "a" | "b", text: string, filename?: string | null) => {
    if (side === "a") {
      leftTextRef.current = text;
      if (filename !== undefined) setLeftFilename(filename);
    } else {
      rightTextRef.current = text;
      if (filename !== undefined) setRightFilename(filename);
    }
    setReloadKey((k) => k + 1);
  }, []);

  const handleFile = useCallback(
    (side: "a" | "b") => async (file: File) => {
      const text = await file.text();
      commitSide(side, text, file.name);
    },
    [commitSide]
  );

  const handlePasteText = useCallback(
    (side: "a" | "b") => (text: string) => commitSide(side, text),
    [commitSide]
  );

  const handleClearSide = useCallback((side: "a" | "b") => () => commitSide(side, "", null), [commitSide]);

  const handleSwap = useCallback(() => {
    const left = leftTextRef.current;
    const right = rightTextRef.current;
    leftTextRef.current = right;
    rightTextRef.current = left;
    setLeftFilename(rightFilename);
    setRightFilename(leftFilename);
    setReloadKey((k) => k + 1);
  }, [leftFilename, rightFilename]);

  const handleClearAll = useCallback(() => {
    leftTextRef.current = "";
    rightTextRef.current = "";
    setLeftFilename(null);
    setRightFilename(null);
    setReloadKey((k) => k + 1);
  }, []);

  const handleLoadExample = useCallback((id: string) => {
    const example = getDiffExample(id);
    if (!example) return;
    leftTextRef.current = example.left;
    rightTextRef.current = example.right;
    setLeftFilename(example.leftFilename);
    setRightFilename(example.rightFilename);
    setReloadKey((k) => k + 1);
  }, []);

  const handleExportPatch = useCallback(() => {
    const patch = createUnifiedPatch(
      leftFilename ?? "original.json",
      rightFilename ?? "changed.json",
      leftTextRef.current,
      rightTextRef.current
    );
    downloadTextFile("difflab.patch", patch);
  }, [leftFilename, rightFilename]);

  const handleCopyPatch = useCallback(() => {
    const patch = createUnifiedPatch(
      leftFilename ?? "original.json",
      rightFilename ?? "changed.json",
      leftTextRef.current,
      rightTextRef.current
    );
    navigator.clipboard.writeText(patch).catch(() => {});
  }, [leftFilename, rightFilename]);

  const handlePrint = useCallback(() => window.print(), []);

  const goToChange = useCallback((direction: "next" | "prev") => {
    const command = direction === "next" ? goToNextChunk : goToPreviousChunk;
    if (mergeViewRef.current) command(mergeViewRef.current.b);
    else if (editorViewRef.current) command(editorViewRef.current);
  }, []);

  const getShareData = useCallback(
    (): JsonShareData => ({
      left: leftTextRef.current,
      right: rightTextRef.current,
      leftFilename,
      rightFilename,
      viewMode,
      precision,
      ignoreCase,
      ignoreRegex,
      indent,
      sortKeys,
    }),
    [leftFilename, rightFilename, viewMode, precision, ignoreCase, ignoreRegex, indent, sortKeys]
  );

  // Restore from either a saved diff (passed in as `initial` by /d/[id]) or a
  // `#d=...` hash on this same tool URL.
  useEffect(() => {
    const restore =
      initial ??
      (() => {
        const fromHash = readShareHashFromLocation();
        return fromHash?.mode === "json" ? (fromHash.data as Partial<JsonShareData>) : undefined;
      })();
    if (!restore) return;

    if (typeof restore.left === "string") leftTextRef.current = restore.left;
    if (typeof restore.right === "string") rightTextRef.current = restore.right;
    if (restore.leftFilename !== undefined) setLeftFilename(restore.leftFilename);
    if (restore.rightFilename !== undefined) setRightFilename(restore.rightFilename);
    if (restore.viewMode) setViewMode(restore.viewMode);
    if (restore.precision) setPrecision(restore.precision);
    if (typeof restore.ignoreCase === "boolean") setIgnoreCase(restore.ignoreCase);
    if (typeof restore.ignoreRegex === "string") setIgnoreRegex(restore.ignoreRegex);
    if (restore.indent !== undefined) setIndent(restore.indent);
    if (typeof restore.sortKeys === "boolean") setSortKeys(restore.sortKeys);
    setReloadKey((k) => k + 1);
    // Runs once on mount only -- `initial` is a stable prop for the lifetime of this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    async function build() {
      const languageExtension = await getLanguageDef("json")!.load();
      if (cancelled) return;

      mergeViewRef.current?.destroy();
      mergeViewRef.current = null;
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
      container!.innerHTML = "";

      const leftParsed = parseJsonWithError(leftTextRef.current);
      const rightParsed = parseJsonWithError(rightTextRef.current);
      const leftDisplay = leftParsed.ok ? prettyPrintJson(leftParsed.value, indent, sortKeys) : leftTextRef.current;
      const rightDisplay = rightParsed.ok ? prettyPrintJson(rightParsed.value, indent, sortKeys) : rightTextRef.current;
      leftTextRef.current = leftDisplay;
      rightTextRef.current = rightDisplay;
      setLeftParse(leftParsed);
      setRightParse(rightParsed);

      const diffConfig = buildDiffConfig({ precision, ignoreWhitespace: false, ignoreCase, ignoreRegex });
      const collapseUnchanged = collapseEnabled ? { margin: collapseMargin, minSize: 4 } : undefined;

      function updateStats() {
        setStats(computeDiffStats(leftTextRef.current, rightTextRef.current, diffConfig));
      }

      function trackChanges(side: "a" | "b") {
        return EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          const text = update.state.doc.toString();
          if (side === "a") {
            leftTextRef.current = text;
            setLeftParse(parseJsonWithError(text));
          } else {
            rightTextRef.current = text;
            setRightParse(parseJsonWithError(text));
          }
          updateStats();
        });
      }

      function errorLinter() {
        return linter((view): Diagnostic[] => {
          const text = view.state.doc.toString();
          if (!text.trim()) return [];
          const result = parseJsonWithError(text);
          if (result.ok) return [];
          const from = Math.min(result.error.pos, Math.max(text.length - 1, 0));
          const to = Math.min(from + 1, text.length);
          return [{ from, to, severity: "error", message: result.error.message }];
        });
      }

      const editorOptions = { lineNumbers: showLineNumbers, lineWrap, editable: true, languageExtension };

      if (viewMode === "split") {
        mergeViewRef.current = new MergeView({
          parent: container!,
          a: {
            doc: leftDisplay,
            extensions: [...buildEditorExtensions(editorOptions), lintGutter(), errorLinter(), trackChanges("a")],
          },
          b: {
            doc: rightDisplay,
            extensions: [...buildEditorExtensions(editorOptions), lintGutter(), errorLinter(), trackChanges("b")],
          },
          gutter: true,
          highlightChanges: true,
          revertControls: mergeDirection,
          collapseUnchanged,
          diffConfig,
        });
      } else {
        editorViewRef.current = new EditorView({
          parent: container!,
          doc: rightDisplay,
          extensions: [
            ...buildEditorExtensions(editorOptions),
            lintGutter(),
            errorLinter(),
            unifiedMergeView({
              original: leftDisplay,
              gutter: true,
              mergeControls: true,
              collapseUnchanged,
              diffConfig,
            }),
            trackChanges("b"),
          ],
        });
      }

      updateStats();
    }

    build();

    return () => {
      cancelled = true;
      mergeViewRef.current?.destroy();
      mergeViewRef.current = null;
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
    };
  }, [
    viewMode,
    precision,
    ignoreCase,
    ignoreRegex,
    collapseEnabled,
    collapseMargin,
    lineWrap,
    showLineNumbers,
    mergeDirection,
    indent,
    sortKeys,
    reloadKey,
  ]);

  const leftError = displayError(leftParse);
  const rightError = displayError(rightParse);
  const bothValid = leftParse.ok && rightParse.ok;

  return (
    <div className="flex h-[calc(100vh-230px)] min-h-120 flex-col overflow-hidden rounded-xl border border-border/60 bg-card print:h-auto print:overflow-visible print:border-0">
      <JsonToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        precision={precision}
        onPrecisionChange={setPrecision}
        indent={indent}
        onIndentChange={setIndent}
        sortKeys={sortKeys}
        onSortKeysChange={setSortKeys}
        ignoreCase={ignoreCase}
        onIgnoreCaseChange={setIgnoreCase}
        ignoreRegex={ignoreRegex}
        onIgnoreRegexChange={setIgnoreRegex}
        ignoreRegexValid={ignoreRegexValid}
        collapseEnabled={collapseEnabled}
        onCollapseEnabledChange={setCollapseEnabled}
        collapseMargin={collapseMargin}
        onCollapseMarginChange={setCollapseMargin}
        lineWrap={lineWrap}
        onLineWrapChange={setLineWrap}
        showLineNumbers={showLineNumbers}
        onShowLineNumbersChange={setShowLineNumbers}
        mergeDirection={mergeDirection}
        onMergeDirectionChange={setMergeDirection}
        onSwap={handleSwap}
        onClear={handleClearAll}
        onLoadExample={handleLoadExample}
        onExportPatch={handleExportPatch}
        onCopyPatch={handleCopyPatch}
        onPrint={handlePrint}
        summary={{ changes: jsonChanges, bothValid }}
        getShareData={getShareData}
      />

      <div className="grid grid-cols-2 print:hidden">
        <InputPaneHeader
          label="Original"
          filename={leftFilename}
          accentClassName="bg-destructive"
          className="border-r border-b border-border/60"
          onFile={handleFile("a")}
          onPasteText={handlePasteText("a")}
          onClear={handleClearSide("a")}
          error={leftError ? `Line ${leftError.line}, col ${leftError.column}` : null}
          fileAccept=".json,.jsonc,application/json,text/plain"
        />
        <InputPaneHeader
          label="Changed"
          filename={rightFilename}
          accentClassName="bg-primary"
          className="border-b border-border/60"
          onFile={handleFile("b")}
          onPasteText={handlePasteText("b")}
          onClear={handleClearSide("b")}
          error={rightError ? `Line ${rightError.line}, col ${rightError.column}` : null}
          fileAccept=".json,.jsonc,application/json,text/plain"
        />
      </div>

      <StatsBar
        additions={stats.additions}
        deletions={stats.deletions}
        changes={stats.changes}
        onPrev={() => goToChange("prev")}
        onNext={() => goToChange("next")}
      />

      <div ref={containerRef} className="min-h-0 flex-1 print:h-auto" />
    </div>
  );
}
