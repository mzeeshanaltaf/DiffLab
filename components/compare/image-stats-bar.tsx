"use client";

import type { LoadedImage, PixelDiffResult, PixelDiffTooLarge } from "@/lib/diff/image-diff";
import { formatBytes } from "@/lib/diff/image-diff";
import type { ImageDiffMode } from "./image-viewport";

export interface ImageStatsBarProps {
  mode: ImageDiffMode;
  left: LoadedImage | null;
  right: LoadedImage | null;
  diffResult: PixelDiffResult | PixelDiffTooLarge | null;
}

export function ImageStatsBar({ mode, left, right, diffResult }: ImageStatsBarProps) {
  if (!left || !right) return null;

  const dimensionsMismatch = left.width !== right.width || left.height !== right.height;

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border/60 px-3 py-1 text-xs">
      <span className="text-muted-foreground">
        Original <span className="text-foreground">{left.width}×{left.height}</span> ({formatBytes(left.size)})
      </span>
      <span className="text-muted-foreground">
        Changed <span className="text-foreground">{right.width}×{right.height}</span> ({formatBytes(right.size)})
      </span>
      {dimensionsMismatch ? <span className="font-medium text-amber-600 dark:text-amber-500">Dimensions differ — smaller side padded</span> : null}

      {mode === "diff" && diffResult ? (
        diffResult.tooLarge ? (
          <span className="ml-auto text-muted-foreground">Too large to diff</span>
        ) : diffResult.diffPixels === 0 ? (
          <span className="ml-auto font-medium text-primary">Pixel-identical</span>
        ) : (
          <span className="ml-auto font-medium text-destructive">
            {diffResult.diffPixels.toLocaleString()} / {diffResult.totalPixels.toLocaleString()} px differ ({diffResult.diffPercent.toFixed(2)}%)
          </span>
        )
      ) : null}
    </div>
  );
}
