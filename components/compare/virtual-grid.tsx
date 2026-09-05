"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject, type UIEvent } from "react";
import { cn } from "@/lib/utils";

/** Spreadsheet-style column label: 0,1,2... -> A,B,...,Z,AA,AB,... */
export function columnLetter(index: number): string {
  let n = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

export interface VirtualGridProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  rowCount: number;
  columnCount: number;
  rowHeight?: number;
  columnWidth?: number;
  rowHeaderWidth?: number;
  renderRowHeader: (rowIndex: number) => ReactNode;
  renderCell: (rowIndex: number, columnIndex: number) => ReactNode;
  rowClassName?: (rowIndex: number) => string | undefined;
  cellClassName?: (rowIndex: number, columnIndex: number) => string | undefined;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  className?: string;
}

const OVERSCAN = 6;

/**
 * Minimal windowed grid: only rows within the visible viewport (plus overscan) are
 * mounted, so a 50k-row sheet stays as fast as a 50-row one. No external dep - just
 * absolute positioning inside a full-height spacer div.
 */
export function VirtualGrid({
  containerRef,
  rowCount,
  columnCount,
  rowHeight = 26,
  columnWidth = 130,
  rowHeaderWidth = 44,
  renderRowHeader,
  renderCell,
  rowClassName,
  cellClassName,
  onScroll,
  className,
}: VirtualGridProps) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const node = localRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setViewportHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
  const visibleRowCount = Math.ceil(viewportHeight / rowHeight) + OVERSCAN * 2;
  const endRow = Math.min(rowCount, startRow + Math.max(visibleRowCount, 1));

  const visibleRows = useMemo(() => {
    const items: number[] = [];
    for (let r = startRow; r < endRow; r++) items.push(r);
    return items;
  }, [startRow, endRow]);

  const columns = useMemo(() => Array.from({ length: columnCount }, (_, i) => i), [columnCount]);
  const bodyWidth = rowHeaderWidth + columnCount * columnWidth;

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
    onScroll?.(target.scrollTop, target.scrollLeft);
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="flex shrink-0 overflow-hidden border-b border-border/60 bg-muted/40" style={{ height: rowHeight }}>
        <div className="shrink-0 border-r border-border/60" style={{ width: rowHeaderWidth }} />
        <div className="flex" style={{ transform: `translateX(-${scrollLeft}px)` }}>
          {columns.map((c) => (
            <div
              key={c}
              className="shrink-0 truncate border-r border-border/40 px-2 text-xs font-medium text-muted-foreground"
              style={{ width: columnWidth, lineHeight: `${rowHeight}px` }}
            >
              {columnLetter(c)}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={(node) => {
          localRef.current = node;
          if (containerRef) containerRef.current = node;
        }}
        className="min-h-0 flex-1 overflow-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: rowCount * rowHeight, width: bodyWidth, position: "relative" }}>
          {visibleRows.map((r) => (
            <div
              key={r}
              className={cn("absolute left-0 flex", rowClassName?.(r))}
              style={{ top: r * rowHeight, height: rowHeight, width: bodyWidth }}
            >
              <div
                className="sticky left-0 z-10 shrink-0 border-r border-b border-border/40 bg-card text-center text-[11px] text-muted-foreground"
                style={{ width: rowHeaderWidth, lineHeight: `${rowHeight}px` }}
              >
                {renderRowHeader(r)}
              </div>
              {columns.map((c) => (
                <div
                  key={c}
                  className={cn("shrink-0 truncate border-r border-b border-border/40 px-2 text-xs", cellClassName?.(r, c))}
                  style={{ width: columnWidth, lineHeight: `${rowHeight}px` }}
                >
                  {renderCell(r, c)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
