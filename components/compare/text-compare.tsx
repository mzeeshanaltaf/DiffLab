"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { MergeView, goToNextChunk, goToPreviousChunk, unifiedMergeView } from "@codemirror/merge";
import { buildEditorExtensions } from "@/lib/cm/setup";
import { detectLanguageFromFilename, getLanguageDef } from "@/lib/cm/languages";
import { buildDiffConfig, computeDiffStats, type DiffStats } from "@/lib/diff/engine";
import { compileIgnoreRegex, DEFAULT_DIFF_OPTIONS, type Precision } from "@/lib/diff/normalize";
import { createUnifiedPatch, downloadTextFile } from "@/lib/diff/patch";
import { getDiffExample } from "@/lib/diff/examples";
import { InputPaneHeader } from "./input-pane";
import { Toolbar } from "./toolbar";
import { StatsBar } from "./stats-bar";

type ViewMode = "split" | "unified";
type MergeDirection = "a-to-b" | "b-to-a";

export function TextCompare() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftTextRef = useRef("");
  const rightTextRef = useRef("");
  const mergeViewRef = useRef<MergeView | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const languageAutoRef = useRef(true);

  const [leftFilename, setLeftFilename] = useState<string | null>(null);
  const [rightFilename, setRightFilename] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [precision, setPrecision] = useState<Precision>(DEFAULT_DIFF_OPTIONS.precision);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(DEFAULT_DIFF_OPTIONS.ignoreWhitespace);
  const [ignoreCase, setIgnoreCase] = useState(DEFAULT_DIFF_OPTIONS.ignoreCase);
  const [ignoreRegex, setIgnoreRegex] = useState(DEFAULT_DIFF_OPTIONS.ignoreRegex);
  const [collapseEnabled, setCollapseEnabled] = useState(true);
  const [collapseMargin, setCollapseMargin] = useState(3);
  const [lineWrap, setLineWrap] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [languageId, setLanguageId] = useState("plaintext");
  const [mergeDirection, setMergeDirection] = useState<MergeDirection>("a-to-b");

  const [stats, setStats] = useState<DiffStats>({ additions: 0, deletions: 0, changes: 0 });

  const ignoreRegexValid = ignoreRegex.trim() === "" || compileIgnoreRegex(ignoreRegex) !== null;

  const commitSide = useCallback((side: "a" | "b", text: string, filename?: string | null) => {
    if (side === "a") {
      leftTextRef.current = text;
      if (filename !== undefined) setLeftFilename(filename);
    } else {
      rightTextRef.current = text;
      if (filename !== undefined) setRightFilename(filename);
    }
    if (filename && languageAutoRef.current) {
      const detected = detectLanguageFromFilename(filename);
      if (detected) setLanguageId(detected);
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

  const handleLanguageChange = useCallback((id: string) => {
    languageAutoRef.current = false;
    setLanguageId(id);
  }, []);

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
    languageAutoRef.current = false;
    setLanguageId(example.languageId);
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
    let cancelled = false;

    async function build() {
      const langDef = getLanguageDef(languageId) ?? getLanguageDef("plaintext")!;
      const languageExtension = await langDef.load();
      if (cancelled) return;

      mergeViewRef.current?.destroy();
      mergeViewRef.current = null;
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
      container!.innerHTML = "";

      const diffConfig = buildDiffConfig({ precision, ignoreWhitespace, ignoreCase, ignoreRegex });
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

      const editorOptions = { lineNumbers: showLineNumbers, lineWrap, editable: true, languageExtension };

      if (viewMode === "split") {
        mergeViewRef.current = new MergeView({
          parent: container!,
          a: { doc: leftTextRef.current, extensions: [...buildEditorExtensions(editorOptions), trackChanges("a")] },
          b: { doc: rightTextRef.current, extensions: [...buildEditorExtensions(editorOptions), trackChanges("b")] },
          gutter: true,
          highlightChanges: true,
          revertControls: mergeDirection,
          collapseUnchanged,
          diffConfig,
        });
      } else {
        editorViewRef.current = new EditorView({
          parent: container!,
          doc: rightTextRef.current,
          extensions: [
            ...buildEditorExtensions(editorOptions),
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
    ignoreWhitespace,
    ignoreCase,
    ignoreRegex,
    collapseEnabled,
    collapseMargin,
    lineWrap,
    showLineNumbers,
    languageId,
    mergeDirection,
    reloadKey,
  ]);

  return (
    <div className="flex h-[calc(100vh-230px)] min-h-120 flex-col overflow-hidden rounded-xl border border-border/60 bg-card print:h-auto print:overflow-visible print:border-0">
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        precision={precision}
        onPrecisionChange={setPrecision}
        ignoreWhitespace={ignoreWhitespace}
        onIgnoreWhitespaceChange={setIgnoreWhitespace}
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
        languageId={languageId}
        onLanguageChange={handleLanguageChange}
        mergeDirection={mergeDirection}
        onMergeDirectionChange={setMergeDirection}
        onSwap={handleSwap}
        onClear={handleClearAll}
        onLoadExample={handleLoadExample}
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
        />
        <InputPaneHeader
          label="Changed"
          filename={rightFilename}
          accentClassName="bg-primary"
          className="border-b border-border/60"
          onFile={handleFile("b")}
          onPasteText={handlePasteText("b")}
          onClear={handleClearSide("b")}
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
