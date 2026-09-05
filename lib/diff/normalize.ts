/**
 * Builds a "comparable" version of a string for diffing purposes while keeping an
 * offset map back to the real string. This lets ignore-whitespace, ignore-case, and
 * custom ignore-regex all be implemented as pure diff-input transforms - the actual
 * document text is never touched, only what the diff algorithm is allowed to "see".
 */

export type Precision = "smart" | "line" | "word" | "character";

export interface DiffOptions {
  precision: Precision;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  /** Raw regex source (no slashes). Empty string disables it. */
  ignoreRegex: string;
}

export const DEFAULT_DIFF_OPTIONS: DiffOptions = {
  precision: "smart",
  ignoreWhitespace: false,
  ignoreCase: false,
  ignoreRegex: "",
};

/** Placeholder char substituted for masked (ignored) ranges. Private-use, unlikely in real text. */
const MASK_CHAR = String.fromCharCode(0xe000);

/** Horizontal whitespace only - newlines are preserved so line structure survives. */
const WHITESPACE_RUN = /[^\S\r\n]+/g;

export function compileIgnoreRegex(pattern: string): RegExp | null {
  const trimmed = pattern.trim();
  if (!trimmed) return null;
  try {
    return new RegExp(trimmed, "gi");
  } catch {
    return null;
  }
}

interface MaskRange {
  start: number;
  end: number;
}

function collectMaskRanges(text: string, ignoreWhitespace: boolean, regex: RegExp | null): MaskRange[] {
  const ranges: MaskRange[] = [];

  if (ignoreWhitespace) {
    WHITESPACE_RUN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = WHITESPACE_RUN.exec(text))) {
      ranges.push({ start: m.index, end: m.index + m[0].length });
      if (m[0].length === 0) WHITESPACE_RUN.lastIndex++;
    }
  }

  if (regex) {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text))) {
      if (m[0].length === 0) {
        regex.lastIndex++;
        continue;
      }
      ranges.push({ start: m.index, end: m.index + m[0].length });
    }
  }

  if (ranges.length === 0) return ranges;

  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: MaskRange[] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    const cur = ranges[i];
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

export interface Comparable {
  /** The string that should actually be fed to the diff algorithm. */
  text: string;
  /** map[p] = offset into the original real string corresponding to position p in `text`. */
  map: number[];
}

export function buildComparable(
  realText: string,
  options: Pick<DiffOptions, "ignoreWhitespace" | "ignoreCase">,
  regex: RegExp | null
): Comparable {
  const ranges = collectMaskRanges(realText, options.ignoreWhitespace, regex);
  const source = options.ignoreCase ? realText.toLowerCase() : realText;

  if (ranges.length === 0) {
    const map = new Array(source.length + 1);
    for (let i = 0; i <= source.length; i++) map[i] = i;
    return { text: source, map };
  }

  let text = "";
  const map: number[] = [0];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      const chunk = source.slice(cursor, range.start);
      text += chunk;
      for (let k = 0; k < chunk.length; k++) map.push(cursor + k + 1);
    }
    text += MASK_CHAR;
    map.push(range.end);
    cursor = range.end;
  }

  if (cursor < source.length) {
    const chunk = source.slice(cursor);
    text += chunk;
    for (let k = 0; k < chunk.length; k++) map.push(cursor + k + 1);
  }

  return { text, map };
}
