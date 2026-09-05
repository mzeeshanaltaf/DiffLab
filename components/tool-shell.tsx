"use client";

import dynamic from "next/dynamic";

const TextCompare = dynamic(() => import("@/components/compare/text-compare").then((m) => m.TextCompare), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-230px)] min-h-[480px] items-center justify-center rounded-xl border border-border/60 bg-card text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

const TOOLS = {
  text: TextCompare,
} as const;

export type ToolMode = keyof typeof TOOLS;

export function ToolShell({ mode }: { mode: ToolMode }) {
  const Tool = TOOLS[mode];
  return <Tool />;
}
