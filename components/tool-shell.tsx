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

const TOOLS = {
  text: TextCompare,
  json: JsonCompare,
  excel: ExcelCompare,
} as const;

export type ToolMode = keyof typeof TOOLS;

export function ToolShell({ mode }: { mode: ToolMode }) {
  const Tool = TOOLS[mode];
  return <Tool />;
}
