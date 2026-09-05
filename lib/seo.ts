import type { Metadata } from "next";

export const SITE_URL = "https://difflab.zeeshanai.cloud";
export const SITE_NAME = "DiffLab";

export function canonical(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Per-page metadata. `openGraph`/`twitter` are shallow-merged by Next.js, not deep-merged, so any
 * page defining them must restate title/description itself rather than relying on the root layout's.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title: fullTitle, description },
    twitter: { title: fullTitle, description },
  };
}
