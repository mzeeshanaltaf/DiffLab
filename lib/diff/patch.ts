import { createTwoFilesPatch } from "diff";

export function createUnifiedPatch(
  leftLabel: string,
  rightLabel: string,
  leftText: string,
  rightText: string
): string {
  return createTwoFilesPatch(leftLabel, rightLabel, leftText, rightText, undefined, undefined, {
    context: 3,
  });
}

export function downloadTextFile(filename: string, content: string, mimeType = "text/x-patch"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
