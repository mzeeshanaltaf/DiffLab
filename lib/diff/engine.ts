import { diffChars, diffLines, diffWordsWithSpace, type Change as JsChange } from "diff";
import { Text } from "@codemirror/state";
import { Change, Chunk, type DiffConfig } from "@codemirror/merge";
import { buildComparable, compileIgnoreRegex, type DiffOptions, type Precision } from "./normalize";

const SCAN_LIMIT = 5000;

function runPrecisionDiff(precision: Exclude<Precision, "smart">, a: string, b: string): JsChange[] {
  switch (precision) {
    case "line":
      return diffLines(a, b, { ignoreNewlineAtEof: true });
    case "word":
      return diffWordsWithSpace(a, b);
    case "character":
      return diffChars(a, b);
  }
}

/**
 * jsdiff guarantees that concatenating the non-`added` parts reproduces `a` and
 * concatenating the non-`removed` parts reproduces `b`, so real offsets can be
 * recovered by walking cumulative lengths and translating through the comparable
 * string's offset map - no matter what precision or masking produced it.
 */
function toMergeChanges(parts: JsChange[], mapA: number[], mapB: number[]): Change[] {
  const changes: Change[] = [];
  let posA = 0;
  let posB = 0;
  let startA = -1;
  let startB = -1;
  let endA = 0;
  let endB = 0;

  const flush = () => {
    if (startA === -1) return;
    changes.push(new Change(mapA[startA], mapA[endA], mapB[startB], mapB[endB]));
    startA = -1;
  };

  for (const part of parts) {
    const len = part.value.length;
    if (!part.added && !part.removed) {
      flush();
      posA += len;
      posB += len;
      continue;
    }
    if (startA === -1) {
      startA = posA;
      startB = posB;
    }
    if (part.removed) posA += len;
    else posB += len;
    endA = posA;
    endB = posB;
  }
  flush();

  return changes;
}

/** Builds the `DiffConfig` that drives both `MergeView` and `unifiedMergeView`. */
export function buildDiffConfig(options: DiffOptions): DiffConfig {
  const regex = compileIgnoreRegex(options.ignoreRegex);
  const needsOverride = options.precision !== "smart" || options.ignoreWhitespace || options.ignoreCase || !!regex;

  if (!needsOverride) {
    return { scanLimit: SCAN_LIMIT };
  }

  const effectivePrecision = options.precision === "smart" ? "character" : options.precision;

  return {
    scanLimit: SCAN_LIMIT,
    override: (a, b) => {
      const ca = buildComparable(a, options, regex);
      const cb = buildComparable(b, options, regex);
      const parts = runPrecisionDiff(effectivePrecision, ca.text, cb.text);
      return toMergeChanges(parts, ca.map, cb.map);
    },
  };
}

export interface DiffStats {
  additions: number;
  deletions: number;
  changes: number;
}

function lineSpan(doc: Text, from: number, to: number): number {
  if (to <= from) return 0;
  const start = doc.lineAt(from).number;
  const end = doc.lineAt(Math.max(from, to - 1)).number;
  return end - start + 1;
}

/** Recomputes chunk-level stats via the same `Chunk.build` the merge views use, so the numbers always match what's rendered. */
export function computeDiffStats(aText: string, bText: string, diffConfig: DiffConfig): DiffStats {
  const a = Text.of(aText.split("\n"));
  const b = Text.of(bText.split("\n"));
  const chunks = Chunk.build(a, b, diffConfig);

  let additions = 0;
  let deletions = 0;
  for (const chunk of chunks) {
    deletions += lineSpan(a, chunk.fromA, chunk.endA);
    additions += lineSpan(b, chunk.fromB, chunk.endB);
  }

  return { additions, deletions, changes: chunks.length };
}

export type { DiffOptions, Precision } from "./normalize";
export { DEFAULT_DIFF_OPTIONS } from "./normalize";
