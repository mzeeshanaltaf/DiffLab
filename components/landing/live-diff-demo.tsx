"use client";

import { useMemo, useSyncExternalStore } from "react";
import { diffLines } from "diff";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

const BEFORE = `function shouldRetry(status, attempt) {
  if (status >= 500) return true;
  if (attempt > 3) return false;
  return false;
}`;

const AFTER = `function shouldRetry(status, attempt) {
  if (status >= 500) return true;
  if (status === 429) return true;
  if (attempt > 5) return false;
  return false;
}`;

type Line = { type: "add" | "remove" | "context"; text: string };

function buildLines(): Line[] {
  const parts = diffLines(BEFORE, AFTER);
  const lines: Line[] = [];
  for (const part of parts) {
    const type = part.added ? "add" : part.removed ? "remove" : "context";
    for (const text of part.value.replace(/\n$/, "").split("\n")) {
      lines.push({ type, text });
    }
  }
  return lines;
}

export function LiveDiffDemo() {
  const lines = useMemo(() => buildLines(), []);
  const reduce = useReducedMotion();
  const mounted = useIsClient();

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden rounded-2xl border border-border/60 bg-card font-mono text-[13px] leading-relaxed shadow-2xl shadow-black/30"
    >
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-destructive/50" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-primary/50" />
        <span className="ml-2 text-xs text-muted-foreground">retry.js</span>
      </div>

      <div className="px-2 py-4">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 rounded px-2 py-0.5",
              line.type === "add" && "bg-primary/10",
              line.type === "remove" && "bg-destructive/10"
            )}
          >
            <span
              className={cn(
                "w-3 shrink-0 select-none",
                line.type === "add" && "text-primary",
                line.type === "remove" && "text-destructive"
              )}
            >
              {line.type === "add" ? "+" : line.type === "remove" ? "-" : ""}
            </span>
            <span className="whitespace-pre text-foreground/90">{line.text}</span>
          </div>
        ))}

        {mounted && !reduce ? (
          <motion.span
            aria-hidden="true"
            className="ml-9 mt-1 inline-block h-4 w-1.5 bg-primary"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          />
        ) : null}
      </div>
    </div>
  );
}
