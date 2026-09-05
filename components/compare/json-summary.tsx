"use client";

import { ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatJsonPreview, type JsonPathChange } from "@/lib/diff/json-diff";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<JsonPathChange["type"], { dot: string; label: string }> = {
  added: { dot: "bg-primary", label: "added" },
  removed: { dot: "bg-destructive", label: "removed" },
  changed: { dot: "bg-amber-500", label: "changed" },
};

export interface JsonSummaryProps {
  changes: JsonPathChange[];
  bothValid: boolean;
}

export function JsonSummary({ changes, bothValid }: JsonSummaryProps) {
  const counts = { added: 0, removed: 0, changed: 0 };
  for (const change of changes) counts[change.type]++;
  const total = changes.length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm">
            <ListTree />
            Summary
            {bothValid ? (
              <Badge variant={total > 0 ? "secondary" : "outline"} className="ml-1">
                {total}
              </Badge>
            ) : null}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-96">
        {!bothValid ? (
          <p className="p-1 text-sm text-muted-foreground">
            Fix the JSON errors on both sides to see a semantic summary of the differences.
          </p>
        ) : total === 0 ? (
          <p className="p-1 text-sm text-muted-foreground">No key differences — both documents have the same shape and values.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 px-1 pb-1 text-xs text-muted-foreground">
              <span className="font-medium text-primary">{counts.added} added</span>
              <span className="font-medium text-destructive">{counts.removed} removed</span>
              <span className="font-medium text-amber-500">{counts.changed} changed</span>
            </div>
            <div className="max-h-80 overflow-y-auto rounded-md border border-border/60">
              {changes.map((change, index) => (
                <div
                  key={`${change.path}-${index}`}
                  className="flex flex-col gap-0.5 border-b border-border/40 px-2 py-1.5 last:border-b-0"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={cn("size-1.5 shrink-0 rounded-full", TYPE_STYLES[change.type].dot)} />
                    <span className="truncate font-mono text-xs">{change.path}</span>
                  </div>
                  {change.type === "changed" ? (
                    <p className="truncate pl-3 text-xs text-muted-foreground">
                      {formatJsonPreview(change.before)} → {formatJsonPreview(change.after)}
                    </p>
                  ) : change.type === "added" ? (
                    <p className="truncate pl-3 text-xs text-muted-foreground">{formatJsonPreview(change.after)}</p>
                  ) : (
                    <p className="truncate pl-3 text-xs text-muted-foreground">{formatJsonPreview(change.before)}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
