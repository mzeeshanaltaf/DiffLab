import { ToolShell } from "@/components/tool-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Text & Code Diff Checker",
  description:
    "Compare two blocks of text or code with live side-by-side and unified diffs, syntax highlighting, word/character precision, and per-chunk merge.",
  path: "/compare/text",
});

export default function TextComparePage() {
  return (
    <>
      <h1 className="mb-2 text-base font-semibold tracking-tight">Text & Code Diff Checker</h1>
      <ToolShell mode="text" />
    </>
  );
}
