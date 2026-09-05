import { ToolShell } from "@/components/tool-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Excel & CSV Diff Checker",
  description:
    "Compare XLSX, XLS, CSV, TSV, and ODS spreadsheets sheet-by-sheet with row alignment by position or key column and cell-level highlighting.",
  path: "/compare/excel",
});

export default function ExcelComparePage() {
  return (
    <>
      <h1 className="mb-2 text-base font-semibold tracking-tight">Excel & CSV Diff Checker</h1>
      <ToolShell mode="excel" />
    </>
  );
}
