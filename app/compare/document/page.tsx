import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

export const metadata: Metadata = {
  title: "Document Diff Checker",
  description:
    "Compare PDF and Word documents. Text is extracted with a page or paragraph marker gutter and handed to the same diff engine as the text tool.",
};

export default function DocumentComparePage() {
  return <ToolShell mode="document" />;
}
