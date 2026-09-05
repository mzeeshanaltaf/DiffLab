import pixelmatch from "pixelmatch";

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  url: string;
  filename: string;
  size: number;
}

export interface PixelDiffOptions {
  threshold: number;
  includeAA: boolean;
}

export interface PixelDiffResult {
  tooLarge: false;
  width: number;
  height: number;
  diffPixels: number;
  totalPixels: number;
  diffPercent: number;
  diffImageData: ImageData;
}

export interface PixelDiffTooLarge {
  tooLarge: true;
  width: number;
  height: number;
}

/** Padded canvases beyond this many pixels are skipped so pixelmatch can't lock up the main thread. */
const MAX_DIFF_PIXELS = 40_000_000;

export async function loadImageFile(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  return {
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
    url: URL.createObjectURL(file),
    filename: file.name,
    size: file.size,
  };
}

export function releaseImage(image: LoadedImage | null) {
  if (!image) return;
  image.bitmap.close();
  URL.revokeObjectURL(image.url);
}

function drawToImageData(bitmap: ImageBitmap, width: number, height: number): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

/** Diffs two images pixel-by-pixel, padding the smaller one to the larger canvas size. */
export function computePixelDiff(
  left: LoadedImage,
  right: LoadedImage,
  options: PixelDiffOptions
): PixelDiffResult | PixelDiffTooLarge {
  const width = Math.max(left.width, right.width);
  const height = Math.max(left.height, right.height);
  const totalPixels = width * height;
  if (totalPixels > MAX_DIFF_PIXELS) return { tooLarge: true, width, height };

  const leftData = drawToImageData(left.bitmap, width, height);
  const rightData = drawToImageData(right.bitmap, width, height);
  const diff = new Uint8ClampedArray(width * height * 4);

  const diffPixels = pixelmatch(leftData.data, rightData.data, diff, width, height, {
    threshold: options.threshold,
    includeAA: options.includeAA,
    alpha: 0.25,
    diffColor: [239, 68, 68],
  });

  return {
    tooLarge: false,
    width,
    height,
    diffPixels,
    totalPixels,
    diffPercent: totalPixels === 0 ? 0 : (diffPixels / totalPixels) * 100,
    diffImageData: new ImageData(diff, width, height),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
