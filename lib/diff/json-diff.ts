/**
 * Structural diff over parsed JSON values, independent of formatting/key order -
 * this is what powers the "added/removed/changed key paths" summary, separate from
 * the text-level diff that drives the CodeMirror merge view.
 */

export type JsonChangeType = "added" | "removed" | "changed";

export interface JsonPathChange {
  path: string;
  type: JsonChangeType;
  before?: unknown;
  after?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatPath(path: (string | number)[]): string {
  if (path.length === 0) return "$";
  let out = "$";
  for (const segment of path) {
    out += typeof segment === "number" ? `[${segment}]` : `.${segment}`;
  }
  return out;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => key in b && deepEqual(a[key], b[key]));
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }
  return false;
}

const DEFAULT_MAX_RESULTS = 500;

export function diffJsonValues(a: unknown, b: unknown, maxResults = DEFAULT_MAX_RESULTS): JsonPathChange[] {
  const results: JsonPathChange[] = [];

  function walk(av: unknown, bv: unknown, path: (string | number)[]) {
    if (results.length >= maxResults) return;
    if (Object.is(av, bv)) return;

    if (isPlainObject(av) && isPlainObject(bv)) {
      const keys = new Set([...Object.keys(av), ...Object.keys(bv)]);
      for (const key of keys) {
        if (results.length >= maxResults) return;
        const inA = key in av;
        const inB = key in bv;
        if (inA && !inB) results.push({ path: formatPath([...path, key]), type: "removed", before: av[key] });
        else if (!inA && inB) results.push({ path: formatPath([...path, key]), type: "added", after: bv[key] });
        else walk(av[key], bv[key], [...path, key]);
      }
      return;
    }

    if (Array.isArray(av) && Array.isArray(bv)) {
      const len = Math.max(av.length, bv.length);
      for (let i = 0; i < len; i++) {
        if (results.length >= maxResults) return;
        if (i >= av.length) results.push({ path: formatPath([...path, i]), type: "added", after: bv[i] });
        else if (i >= bv.length) results.push({ path: formatPath([...path, i]), type: "removed", before: av[i] });
        else walk(av[i], bv[i], [...path, i]);
      }
      return;
    }

    if (deepEqual(av, bv)) return;
    results.push({ path: formatPath(path), type: "changed", before: av, after: bv });
  }

  walk(a, b, []);
  return results;
}

export function formatJsonPreview(value: unknown, maxLength = 60): string {
  if (value === undefined) return "undefined";
  let text: string;
  try {
    text = JSON.stringify(value);
  } catch {
    text = String(value);
  }
  if (text === undefined) text = "undefined";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
