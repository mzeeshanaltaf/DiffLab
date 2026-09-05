import { ToolShell } from "@/components/tool-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "JSON Diff Checker",
  description:
    "Compare two JSON documents with inline error markers, pretty-printing, optional key sorting, and a semantic summary of added, removed, and changed key paths.",
  path: "/compare/json",
});

export default function JsonComparePage() {
  return (
    <>
      <h1 className="mb-2 text-base font-semibold tracking-tight">JSON Diff Checker</h1>
      <ToolShell mode="json" />
    </>
  );
}
