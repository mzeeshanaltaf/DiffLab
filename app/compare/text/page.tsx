import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

export const metadata: Metadata = {
  title: "Text & Code Diff Checker",
  description:
    "Compare two blocks of text or code with live side-by-side and unified diffs, syntax highlighting, word/character precision, and per-chunk merge.",
};

export default function TextComparePage() {
  return <ToolShell mode="text" />;
}
