/**
 * JSON.parse's SyntaxError message shape varies by engine version - some include
 * "position N", some include "line L column C", some both. This normalizes whichever
 * subset is present into a single {pos, line, column}, computing the missing half
 * by walking the source text.
 */

export interface JsonParseError {
  message: string;
  pos: number;
  line: number;
  column: number;
}

export type JsonParseResult = { ok: true; value: unknown } | { ok: false; error: JsonParseError };

function lineColumnFromOffset(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const end = Math.min(offset, text.length);
  for (let i = 0; i < end; i++) {
    if (text[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function offsetFromLineColumn(text: string, line: number, column: number): number {
  const lines = text.split("\n");
  let offset = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) offset += lines[i].length + 1;
  return offset + (column - 1);
}

export function parseJsonWithError(text: string): JsonParseResult {
  if (text.trim() === "") {
    return { ok: false, error: { message: "Input is empty", pos: 0, line: 1, column: 1 } };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    const lineColMatch = message.match(/line (\d+) column (\d+)/i);
    const posMatch = message.match(/position (\d+)/i);

    let line: number;
    let column: number;
    let pos: number;

    if (lineColMatch) {
      line = Number(lineColMatch[1]);
      column = Number(lineColMatch[2]);
      pos = posMatch ? Number(posMatch[1]) : offsetFromLineColumn(text, line, column);
    } else {
      pos = posMatch ? Number(posMatch[1]) : 0;
      ({ line, column } = lineColumnFromOffset(text, pos));
    }

    return { ok: false, error: { message, pos: Math.max(0, Math.min(pos, text.length)), line, column } };
  }
}

export type IndentOption = 2 | 4 | "tab";

function sortValueKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValueKeys);
  if (value && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortValueKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/** Pretty-prints `value`, optionally sorting object keys recursively so reordering isn't reported as noise. */
export function prettyPrintJson(value: unknown, indent: IndentOption, sortKeys: boolean): string {
  const target = sortKeys ? sortValueKeys(value) : value;
  return JSON.stringify(target, null, indent === "tab" ? "\t" : indent);
}
