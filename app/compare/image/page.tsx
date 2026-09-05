import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

export const metadata: Metadata = {
  title: "Image Diff Checker",
  description:
    "Compare two images side-by-side, with a slider, fade, onion skin, or pixel-level difference highlighting. Mismatched dimensions are padded so nothing is cropped.",
};

export default function ImageComparePage() {
  return <ToolShell mode="image" />;
}
