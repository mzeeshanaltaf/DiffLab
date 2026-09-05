import * as XLSX from "xlsx";

/**
 * Cell values are normalized to primitives (dates become ISO strings) so the diff
 * layer never has to special-case SheetJS's richer cell object shapes.
 */
export type CellValue = string | number | boolean | null;

export interface SheetGrid {
  name: string;
  rows: CellValue[][];
}

export interface ParsedWorkbook {
  sheets: SheetGrid[];
}

const CSV_EXTENSIONS = new Set(["csv", "tsv"]);

function cellToValue(value: unknown): CellValue {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") return value;
  return String(value);
}

function sheetToGrid(sheet: XLSX.WorkSheet, name: string): SheetGrid {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    blankrows: true,
  });
  return { name, rows: rows.map((row) => row.map(cellToValue)) };
}

function workbookToParsed(workbook: XLSX.WorkBook): ParsedWorkbook {
  return { sheets: workbook.SheetNames.map((name) => sheetToGrid(workbook.Sheets[name], name)) };
}

/** Parses an uploaded .xlsx/.xls/.ods/.csv/.tsv file into plain-value sheet grids. */
export async function parseWorkbookFile(file: File): Promise<ParsedWorkbook> {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  const buffer = await file.arrayBuffer();

  if (CSV_EXTENSIONS.has(extension)) {
    const text = new TextDecoder("utf-8").decode(buffer);
    return parseDelimitedText(text, extension === "tsv" ? "\t" : ",");
  }

  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  return workbookToParsed(workbook);
}

/** Parses pasted clipboard text as CSV/TSV (auto-detects the delimiter from the first line). */
export function parseDelimitedText(text: string, delimiter?: "," | "\t", sheetName = "Sheet1"): ParsedWorkbook {
  const fs = delimiter ?? (text.split("\n", 1)[0]?.includes("\t") ? "\t" : ",");
  const workbook = XLSX.read(text, { type: "string", cellDates: true, FS: fs });
  if (workbook.SheetNames.length === 1) {
    workbook.SheetNames[0] = sheetName;
    const sheet = workbook.Sheets.Sheet1 ?? Object.values(workbook.Sheets)[0];
    workbook.Sheets = { [sheetName]: sheet };
  }
  return workbookToParsed(workbook);
}
