"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { parseDelimitedText, parseWorkbookFile, type CellValue, type ParsedWorkbook } from "@/lib/parse/sheet";
import { diffSheet, type AlignMode } from "@/lib/diff/sheet-diff";
import { InputPaneHeader } from "./input-pane";
import { ExcelToolbar } from "./excel-toolbar";
import { SheetTabs, type SheetTabInfo } from "./sheet-tabs";
import { SheetStatsBar } from "./sheet-stats-bar";
import { VirtualGrid, columnLetter } from "./virtual-grid";

const ROW_HEIGHT = 26;
const FILE_ACCEPT = ".xlsx,.xls,.csv,.tsv,.ods";

function formatCell(value: CellValue | undefined): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value);
}

export function ExcelCompare() {
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingRef = useRef(false);

  const [leftWorkbook, setLeftWorkbook] = useState<ParsedWorkbook | null>(null);
  const [rightWorkbook, setRightWorkbook] = useState<ParsedWorkbook | null>(null);
  const [leftFilename, setLeftFilename] = useState<string | null>(null);
  const [rightFilename, setRightFilename] = useState<string | null>(null);
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);
  const [manualActiveSheet, setManualActiveSheet] = useState<string | null>(null);

  const [alignMode, setAlignMode] = useState<AlignMode>("index");
  const [keyColumn, setKeyColumn] = useState(0);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);

  const sheetNames = useMemo<SheetTabInfo[]>(() => {
    const names: string[] = [];
    const leftSet = new Set(leftWorkbook?.sheets.map((s) => s.name) ?? []);
    const rightSet = new Set(rightWorkbook?.sheets.map((s) => s.name) ?? []);
    for (const sheet of leftWorkbook?.sheets ?? []) if (!names.includes(sheet.name)) names.push(sheet.name);
    for (const sheet of rightWorkbook?.sheets ?? []) if (!names.includes(sheet.name)) names.push(sheet.name);
    return names.map((name) => ({ name, inLeft: leftSet.has(name), inRight: rightSet.has(name) }));
  }, [leftWorkbook, rightWorkbook]);

  const activeSheet = useMemo(() => {
    if (manualActiveSheet && sheetNames.some((s) => s.name === manualActiveSheet)) return manualActiveSheet;
    return sheetNames[0]?.name ?? null;
  }, [manualActiveSheet, sheetNames]);

  const leftRows = useMemo(
    () => leftWorkbook?.sheets.find((s) => s.name === activeSheet)?.rows ?? [],
    [leftWorkbook, activeSheet]
  );
  const rightRows = useMemo(
    () => rightWorkbook?.sheets.find((s) => s.name === activeSheet)?.rows ?? [],
    [rightWorkbook, activeSheet]
  );

  const diffResult = useMemo(
    () => diffSheet(leftRows, rightRows, alignMode, keyColumn, { ignoreCase, trimWhitespace }),
    [leftRows, rightRows, alignMode, keyColumn, ignoreCase, trimWhitespace]
  );

  const keyColumnOptions = useMemo(() => {
    const options: { value: number; label: string }[] = [];
    for (let c = 0; c < diffResult.columnCount; c++) {
      const hint = leftRows[0]?.[c] ?? rightRows[0]?.[c];
      const label = typeof hint === "string" && hint.trim() ? `${columnLetter(c)} — ${hint}` : `Column ${columnLetter(c)}`;
      options.push({ value: c, label });
    }
    return options;
  }, [diffResult.columnCount, leftRows, rightRows]);

  const diffRowPositions = useMemo(
    () => diffResult.rows.reduce<number[]>((acc, row, index) => (row.status !== "unchanged" ? [...acc, index] : acc), []),
    [diffResult.rows]
  );

  const handleFile = useCallback(
    (side: "a" | "b") => async (file: File) => {
      try {
        const workbook = await parseWorkbookFile(file);
        if (side === "a") {
          setLeftWorkbook(workbook);
          setLeftFilename(file.name);
          setLeftError(null);
        } else {
          setRightWorkbook(workbook);
          setRightFilename(file.name);
          setRightError(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not read this file";
        if (side === "a") setLeftError(message);
        else setRightError(message);
      }
    },
    []
  );

  const handlePasteText = useCallback(
    (side: "a" | "b") => (text: string) => {
      try {
        const workbook = parseDelimitedText(text);
        if (side === "a") {
          setLeftWorkbook(workbook);
          setLeftFilename(null);
          setLeftError(null);
        } else {
          setRightWorkbook(workbook);
          setRightFilename(null);
          setRightError(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not parse pasted data as CSV";
        if (side === "a") setLeftError(message);
        else setRightError(message);
      }
    },
    []
  );

  const handleClearSide = useCallback(
    (side: "a" | "b") => () => {
      if (side === "a") {
        setLeftWorkbook(null);
        setLeftFilename(null);
        setLeftError(null);
      } else {
        setRightWorkbook(null);
        setRightFilename(null);
        setRightError(null);
      }
    },
    []
  );

  const handleSwap = useCallback(() => {
    setLeftWorkbook(rightWorkbook);
    setRightWorkbook(leftWorkbook);
    setLeftFilename(rightFilename);
    setRightFilename(leftFilename);
    setLeftError(rightError);
    setRightError(leftError);
  }, [leftWorkbook, rightWorkbook, leftFilename, rightFilename, leftError, rightError]);

  const handleClearAll = useCallback(() => {
    setLeftWorkbook(null);
    setRightWorkbook(null);
    setLeftFilename(null);
    setRightFilename(null);
    setLeftError(null);
    setRightError(null);
    setManualActiveSheet(null);
  }, []);

  const handleGridScroll = useCallback((source: "left" | "right", scrollTop: number, scrollLeft: number) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    const target = source === "left" ? rightScrollRef.current : leftScrollRef.current;
    if (target) {
      target.scrollTop = scrollTop;
      target.scrollLeft = scrollLeft;
    }
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }, []);

  const scrollToRow = useCallback((rowIndex: number) => {
    const top = Math.max(0, rowIndex * ROW_HEIGHT - ROW_HEIGHT * 3);
    if (leftScrollRef.current) leftScrollRef.current.scrollTop = top;
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = top;
  }, []);

  const handlePrevDiff = useCallback(() => {
    if (diffRowPositions.length === 0) return;
    const currentRow = Math.floor((leftScrollRef.current?.scrollTop ?? 0) / ROW_HEIGHT);
    const candidates = diffRowPositions.filter((r) => r < currentRow);
    scrollToRow(candidates.length ? candidates[candidates.length - 1] : diffRowPositions[diffRowPositions.length - 1]);
  }, [diffRowPositions, scrollToRow]);

  const handleNextDiff = useCallback(() => {
    if (diffRowPositions.length === 0) return;
    const currentRow = Math.floor((leftScrollRef.current?.scrollTop ?? 0) / ROW_HEIGHT);
    const next = diffRowPositions.find((r) => r > currentRow);
    scrollToRow(next ?? diffRowPositions[0]);
  }, [diffRowPositions, scrollToRow]);

  const hasAnyFile = leftWorkbook !== null || rightWorkbook !== null;

  return (
    <div className="flex h-[calc(100vh-230px)] min-h-120 flex-col overflow-hidden rounded-xl border border-border/60 bg-card print:h-auto print:overflow-visible print:border-0">
      <ExcelToolbar
        alignMode={alignMode}
        onAlignModeChange={setAlignMode}
        keyColumn={keyColumn}
        onKeyColumnChange={setKeyColumn}
        keyColumnOptions={keyColumnOptions}
        ignoreCase={ignoreCase}
        onIgnoreCaseChange={setIgnoreCase}
        trimWhitespace={trimWhitespace}
        onTrimWhitespaceChange={setTrimWhitespace}
        onSwap={handleSwap}
        onClear={handleClearAll}
      />

      <SheetTabs sheets={sheetNames} activeSheet={activeSheet} onActiveSheetChange={setManualActiveSheet} />

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

      <SheetStatsBar
        added={diffResult.stats.added}
        removed={diffResult.stats.removed}
        changed={diffResult.stats.changed}
        changedCells={diffResult.stats.changedCells}
        onPrev={handlePrevDiff}
        onNext={handleNextDiff}
      />

      {!activeSheet ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          {hasAnyFile ? "Loading sheets…" : "Upload or paste spreadsheet data on both sides to compare."}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-border/60">
          <VirtualGrid
            containerRef={leftScrollRef}
            rowCount={diffResult.rows.length}
            columnCount={diffResult.columnCount}
            rowHeight={ROW_HEIGHT}
            renderRowHeader={(r) => {
              const row = diffResult.rows[r];
              return row.leftIndex !== null ? row.leftIndex + 1 : "";
            }}
            renderCell={(r, c) => {
              const row = diffResult.rows[r];
              if (row.leftIndex === null) return null;
              return formatCell(leftRows[row.leftIndex]?.[c]);
            }}
            rowClassName={(r) => {
              const row = diffResult.rows[r];
              if (row.leftIndex === null) return "bg-muted/20";
              if (row.status === "removed") return "bg-destructive/10";
              return undefined;
            }}
            cellClassName={(r, c) => (diffResult.rows[r].changedColumns.has(c) ? "bg-amber-500/25" : undefined)}
            onScroll={(top, left) => handleGridScroll("left", top, left)}
          />
          <VirtualGrid
            containerRef={rightScrollRef}
            rowCount={diffResult.rows.length}
            columnCount={diffResult.columnCount}
            rowHeight={ROW_HEIGHT}
            renderRowHeader={(r) => {
              const row = diffResult.rows[r];
              return row.rightIndex !== null ? row.rightIndex + 1 : "";
            }}
            renderCell={(r, c) => {
              const row = diffResult.rows[r];
              if (row.rightIndex === null) return null;
              return formatCell(rightRows[row.rightIndex]?.[c]);
            }}
            rowClassName={(r) => {
              const row = diffResult.rows[r];
              if (row.rightIndex === null) return "bg-muted/20";
              if (row.status === "added") return "bg-primary/10";
              return undefined;
            }}
            cellClassName={(r, c) => (diffResult.rows[r].changedColumns.has(c) ? "bg-amber-500/25" : undefined)}
            onScroll={(top, left) => handleGridScroll("right", top, left)}
          />
        </div>
      )}
    </div>
  );
}
