import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export type ShareMode = "text" | "json" | "excel";

export interface ShareState {
  mode: ShareMode;
  data: unknown;
}

export type ExpiryOption = "1d" | "7d" | "30d" | "never";

export const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: "1d", label: "1 day" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "never", label: "Never" },
];

export function isExpiryOption(value: unknown): value is ExpiryOption {
  return value === "1d" || value === "7d" || value === "30d" || value === "never";
}

// Length of the encoded hash above which a URL becomes unreliable to share --
// mail clients, chat apps, and some proxies mangle or truncate very long URLs
// well before a browser's own address-bar limit. Past this, fall back to a
// saved short link instead.
export const HASH_BUDGET = 6000;

export function encodeShareHash(state: ShareState): string {
  return compressToEncodedURIComponent(JSON.stringify(state));
}

export function decodeShareHash(encoded: string): ShareState | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object" && typeof parsed.mode === "string" && "data" in parsed) {
      return parsed as ShareState;
    }
    return null;
  } catch {
    return null;
  }
}

export function readShareHashFromLocation(): ShareState | null {
  if (typeof window === "undefined") return null;
  const match = /^#d=(.+)$/.exec(window.location.hash);
  if (!match) return null;
  return decodeShareHash(match[1]);
}

// lz-string's "encoded URI component" alphabet is already URL-safe, so the
// hash needs no further escaping.
export function buildHashUrl(state: ShareState): string {
  const encoded = encodeShareHash(state);
  return `${window.location.origin}${window.location.pathname}#d=${encoded}`;
}
