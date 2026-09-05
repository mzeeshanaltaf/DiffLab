import { ToolShell } from "@/components/tool-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Document Diff Checker",
  description:
    "Compare PDF and Word documents. Text is extracted with a page or paragraph marker gutter and handed to the same diff engine as the text tool.",
  path: "/compare/document",
});

export default function DocumentComparePage() {
  return (
    <>
      <h1 className="mb-2 text-base font-semibold tracking-tight">Document Diff Checker</h1>
      <ToolShell mode="document" />
    </>
  );
}
