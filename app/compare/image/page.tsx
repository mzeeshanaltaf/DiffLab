import { ToolShell } from "@/components/tool-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Image Diff Checker",
  description:
    "Compare two images side-by-side with a slider, fade, onion skin, or pixel-diff highlighting. Mismatched sizes are padded, never cropped.",
  path: "/compare/image",
});

export default function ImageComparePage() {
  return (
    <>
      <h1 className="mb-2 text-base font-semibold tracking-tight">Image Diff Checker</h1>
      <ToolShell mode="image" />
    </>
  );
}
