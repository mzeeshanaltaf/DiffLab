"use client";

import dynamic from "next/dynamic";

const loading = () => (
  <div className="flex h-[calc(100vh-230px)] min-h-120 items-center justify-center rounded-xl border border-border/60 bg-card text-sm text-muted-foreground">
    Loading editor…
  </div>
);

const TextCompare = dynamic(() => import("@/components/compare/text-compare").then((m) => m.TextCompare), {
  ssr: false,
  loading,
});

const JsonCompare = dynamic(() => import("@/components/compare/json-compare").then((m) => m.JsonCompare), {
  ssr: false,
  loading,
});

const ExcelCompare = dynamic(() => import("@/components/compare/excel-compare").then((m) => m.ExcelCompare), {
  ssr: false,
  loading,
});

const ImageCompare = dynamic(() => import("@/components/compare/image-compare").then((m) => m.ImageCompare), {
  ssr: false,
  loading,
});

const DocumentCompare = dynamic(() => import("@/components/compare/document-compare").then((m) => m.DocumentCompare), {
  ssr: false,
  loading,
});

export type ToolMode = "text" | "json" | "excel" | "image" | "document";

// Only text/json/excel have a shareable, restorable state shape (see
// components/compare/share-dialog.tsx) -- `initial` is loosely typed here
// because it crosses the boundary from a saved diff's untyped JSON payload
// into each tool's own `Partial<...ShareData>` prop.
export function ToolShell({ mode, initial }: { mode: ToolMode; initial?: unknown }) {
  switch (mode) {
    case "text":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <TextCompare initial={initial as any} />;
    case "json":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <JsonCompare initial={initial as any} />;
    case "excel":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <ExcelCompare initial={initial as any} />;
    case "image":
      return <ImageCompare />;
    case "document":
      return <DocumentCompare />;
  }
}
