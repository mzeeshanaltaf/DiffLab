"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { MergeView, goToNextChunk, goToPreviousChunk, unifiedMergeView } from "@codemirror/merge";
import { buildEditorExtensions } from "@/lib/cm/setup";
import { markerGutter } from "@/lib/cm/marker-gutter";
import { buildDiffConfig, computeDiffStats, type DiffStats } from "@/lib/diff/engine";
import { DEFAULT_DIFF_OPTIONS, type Precision } from "@/lib/diff/normalize";
import { createUnifiedPatch, downloadTextFile } from "@/lib/diff/patch";
import { parseDocumentFile, type DocumentMarker } from "@/lib/parse/document";
import { InputPaneHeader } from "./input-pane";
import { DocumentToolbar } from "./document-toolbar";
import { StatsBar } from "./stats-bar";

type ViewMode = "split" | "unified";
type MergeDirection = "a-to-b" | "b-to-a";

const FILE_ACCEPT = ".pdf,.docx,.txt,.md";

export function DocumentCompare() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftTextRef = useRef("");
  const rightTextRef = useRef("");
  const leftMarkersRef = useRef<DocumentMarker[]>([]);
  const rightMarkersRef = useRef<DocumentMarker[]>([]);
  const mergeViewRef = useRef<MergeView | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const [leftFilename, setLeftFilename] = useState<string | null>(null);
  const [rightFilename, setRightFilename] = useState<string | null>(null);
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [precision, setPrecision] = useState<Precision>(DEFAULT_DIFF_OPTIONS.precision);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(DEFAULT_DIFF_OPTIONS.ignoreWhitespace);
  const [ignoreCase, setIgnoreCase] = useState(DEFAULT_DIFF_OPTIONS.ignoreCase);
  const [collapseEnabled, setCollapseEnabled] = useState(true);
  const [collapseMargin, setCollapseMargin] = useState(3);
  const [lineWrap, setLineWrap] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [mergeDirection, setMergeDirection] = useState<MergeDirection>("a-to-b");

  const [stats, setStats] = useState<DiffStats>({ additions: 0, deletions: 0, changes: 0 });

  const commitSide = useCallback(
    (side: "a" | "b", text: string, markers: DocumentMarker[], filename?: string | null) => {
      if (side === "a") {
        leftTextRef.current = text;
        leftMarkersRef.current = markers;
        if (filename !== undefined) setLeftFilename(filename);
        setLeftError(null);
      } else {
        rightTextRef.current = text;
        rightMarkersRef.current = markers;
        if (filename !== undefined) setRightFilename(filename);
        setRightError(null);
      }
      setReloadKey((k) => k + 1);
    },
    []
  );

  const handleFile = useCallback(
    (side: "a" | "b") => async (file: File) => {
      try {
        const parsed = await parseDocumentFile(file);
        commitSide(side, parsed.text, parsed.markers, file.name);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not read this file";
        if (side === "a") setLeftError(message);
        else setRightError(message);
      }
    },
    [commitSide]
  );

  const handlePasteText = useCallback(
    (side: "a" | "b") => (text: string) => commitSide(side, text, [], null),
    [commitSide]
  );

  const handleClearSide = useCallback((side: "a" | "b") => () => commitSide(side, "", [], null), [commitSide]);

  const handleSwap = useCallback(() => {
    const text = leftTextRef.current;
    const markers = leftMarkersRef.current;
    leftTextRef.current = rightTextRef.current;
    leftMarkersRef.current = rightMarkersRef.current;
    rightTextRef.current = text;
    rightMarkersRef.current = markers;
    setLeftFilename(rightFilename);
    setRightFilename(leftFilename);
    setLeftError(rightError);
    setRightError(leftError);
    setReloadKey((k) => k + 1);
  }, [leftFilename, rightFilename, leftError, rightError]);

  const handleClearAll = useCallback(() => {
    leftTextRef.current = "";
    rightTextRef.current = "";
    leftMarkersRef.current = [];
    rightMarkersRef.current = [];
    setLeftFilename(null);
    setRightFilename(null);
    setLeftError(null);
    setRightError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const handleExportPatch = useCallback(() => {
    const patch = createUnifiedPatch(
      leftFilename ?? "original.txt",
      rightFilename ?? "changed.txt",
      leftTextRef.current,
      rightTextRef.current
    );
    downloadTextFile("difflab.patch", patch);
  }, [leftFilename, rightFilename]);

  const handleCopyPatch = useCallback(() => {
    const patch = createUnifiedPatch(
      leftFilename ?? "original.txt",
      rightFilename ?? "changed.txt",
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    mergeViewRef.current?.destroy();
    mergeViewRef.current = null;
    editorViewRef.current?.destroy();
    editorViewRef.current = null;
    container.innerHTML = "";

    const diffConfig = buildDiffConfig({ precision, ignoreWhitespace, ignoreCase, ignoreRegex: "" });
    const collapseUnchanged = collapseEnabled ? { margin: collapseMargin, minSize: 4 } : undefined;

    function updateStats() {
      setStats(computeDiffStats(leftTextRef.current, rightTextRef.current, diffConfig));
    }

    function trackChanges(side: "a" | "b") {
      return EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        if (side === "a") leftTextRef.current = update.state.doc.toString();
        else rightTextRef.current = update.state.doc.toString();
        updateStats();
      });
    }

    const editorOptions = { lineNumbers: showLineNumbers, lineWrap, editable: true, languageExtension: [] };

    if (viewMode === "split") {
      mergeViewRef.current = new MergeView({
        parent: container,
        a: {
          doc: leftTextRef.current,
          extensions: [...buildEditorExtensions(editorOptions), markerGutter(leftMarkersRef.current), trackChanges("a")],
        },
        b: {
          doc: rightTextRef.current,
          extensions: [...buildEditorExtensions(editorOptions), markerGutter(rightMarkersRef.current), trackChanges("b")],
        },
        gutter: true,
        highlightChanges: true,
        revertControls: mergeDirection,
        collapseUnchanged,
        diffConfig,
      });
    } else {
      editorViewRef.current = new EditorView({
        parent: container,
        doc: rightTextRef.current,
        extensions: [
          ...buildEditorExtensions(editorOptions),
          markerGutter(rightMarkersRef.current),
          unifiedMergeView({
            original: leftTextRef.current,
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

    return () => {
      mergeViewRef.current?.destroy();
      mergeViewRef.current = null;
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
    };
  }, [
    viewMode,
    precision,
    ignoreWhitespace,
    ignoreCase,
    collapseEnabled,
    collapseMargin,
    lineWrap,
    showLineNumbers,
    mergeDirection,
    reloadKey,
  ]);

  return (
    <div className="flex h-[calc(100vh-230px)] min-h-120 flex-col overflow-hidden rounded-xl border border-border/60 bg-card print:h-auto print:overflow-visible print:border-0">
      <DocumentToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        precision={precision}
        onPrecisionChange={setPrecision}
        ignoreWhitespace={ignoreWhitespace}
        onIgnoreWhitespaceChange={setIgnoreWhitespace}
        ignoreCase={ignoreCase}
        onIgnoreCaseChange={setIgnoreCase}
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
        onExportPatch={handleExportPatch}
        onCopyPatch={handleCopyPatch}
        onPrint={handlePrint}
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
          error={leftError}
          fileAccept={FILE_ACCEPT}
        />
        <InputPaneHeader
          label="Changed"
          filename={rightFilename}
          accentClassName="bg-primary"
          className="border-b border-border/60"
          onFile={handleFile("b")}
          onPasteText={handlePasteText("b")}
          onClear={handleClearSide("b")}
          error={rightError}
          fileAccept={FILE_ACCEPT}
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
