import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

export const metadata: Metadata = {
  title: "JSON Diff Checker",
  description:
    "Compare two JSON documents with inline error markers, pretty-printing, optional key sorting, and a semantic summary of added, removed, and changed key paths.",
};

export default function JsonComparePage() {
  return <ToolShell mode="json" />;
}
