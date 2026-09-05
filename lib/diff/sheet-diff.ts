import type { CellValue } from "@/lib/parse/sheet";

export type AlignMode = "index" | "key";

export interface AlignedRow {
  leftIndex: number | null;
  rightIndex: number | null;
}

function cellKey(value: CellValue): string {
  return value === null ? "" : String(value);
}

/** Pairs rows by position, or by matching a key column's value (first-seen-first-matched, order-preserving). */
export function alignRows(
  leftRows: CellValue[][],
  rightRows: CellValue[][],
  mode: AlignMode,
  keyColumn: number
): AlignedRow[] {
  if (mode === "index") {
    const max = Math.max(leftRows.length, rightRows.length);
    const aligned: AlignedRow[] = [];
    for (let i = 0; i < max; i++) {
      aligned.push({ leftIndex: i < leftRows.length ? i : null, rightIndex: i < rightRows.length ? i : null });
    }
    return aligned;
  }

  const rightByKey = new Map<string, number[]>();
  rightRows.forEach((row, index) => {
    const key = cellKey(row[keyColumn] ?? null);
    const bucket = rightByKey.get(key);
    if (bucket) bucket.push(index);
    else rightByKey.set(key, [index]);
  });

  const consumed = new Set<number>();
  const aligned: AlignedRow[] = [];

  leftRows.forEach((row, leftIndex) => {
    const key = cellKey(row[keyColumn] ?? null);
    const bucket = rightByKey.get(key);
    const rightIndex = bucket?.find((i) => !consumed.has(i)) ?? null;
    if (rightIndex !== null) consumed.add(rightIndex);
    aligned.push({ leftIndex, rightIndex });
  });

  rightRows.forEach((_row, rightIndex) => {
    if (!consumed.has(rightIndex)) aligned.push({ leftIndex: null, rightIndex });
  });

  return aligned;
}

export type RowStatus = "added" | "removed" | "changed" | "unchanged";

export interface DiffedRow {
  leftIndex: number | null;
  rightIndex: number | null;
  status: RowStatus;
  changedColumns: Set<number>;
}

export interface SheetDiffOptions {
  ignoreCase: boolean;
  trimWhitespace: boolean;
}

function normalizeForCompare(value: CellValue, options: SheetDiffOptions): string {
  if (value === null) return "";
  let text = typeof value === "string" ? value : String(value);
  if (options.trimWhitespace) text = text.trim();
  if (options.ignoreCase) text = text.toLowerCase();
  return text;
}

export interface SheetDiffResult {
  rows: DiffedRow[];
  columnCount: number;
  stats: { added: number; removed: number; changed: number; unchanged: number; changedCells: number };
}

export function diffSheet(
  leftRows: CellValue[][],
  rightRows: CellValue[][],
  mode: AlignMode,
  keyColumn: number,
  options: SheetDiffOptions
): SheetDiffResult {
  const aligned = alignRows(leftRows, rightRows, mode, keyColumn);
  const columnCount = Math.max(0, ...leftRows.map((r) => r.length), ...rightRows.map((r) => r.length));

  const stats = { added: 0, removed: 0, changed: 0, unchanged: 0, changedCells: 0 };
  const rows: DiffedRow[] = aligned.map(({ leftIndex, rightIndex }) => {
    if (leftIndex === null) {
      stats.added++;
      return { leftIndex, rightIndex, status: "added", changedColumns: new Set<number>() };
    }
    if (rightIndex === null) {
      stats.removed++;
      return { leftIndex, rightIndex, status: "removed", changedColumns: new Set<number>() };
    }

    const leftRow = leftRows[leftIndex];
    const rightRow = rightRows[rightIndex];
    const changedColumns = new Set<number>();
    for (let c = 0; c < columnCount; c++) {
      const a = normalizeForCompare(leftRow[c] ?? null, options);
      const b = normalizeForCompare(rightRow[c] ?? null, options);
      if (a !== b) changedColumns.add(c);
    }

    stats.changedCells += changedColumns.size;
    const status: RowStatus = changedColumns.size > 0 ? "changed" : "unchanged";
    if (status === "changed") stats.changed++;
    else stats.unchanged++;

    return { leftIndex, rightIndex, status, changedColumns };
  });

  return { rows, columnCount, stats };
}
