import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

export const metadata: Metadata = {
  title: "Excel & CSV Diff Checker",
  description:
    "Compare XLSX, XLS, CSV, TSV, and ODS spreadsheets sheet-by-sheet with row alignment by position or key column and cell-level highlighting.",
};

export default function ExcelComparePage() {
  return <ToolShell mode="excel" />;
}
