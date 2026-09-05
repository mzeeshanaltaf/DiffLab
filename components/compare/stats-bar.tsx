"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface StatsBarProps {
  additions: number;
  deletions: number;
  changes: number;
  onPrev: () => void;
  onNext: () => void;
}

export function StatsBar({ additions, deletions, changes, onPrev, onNext }: StatsBarProps) {
  return (
    <div className="flex items-center gap-4 border-b border-border/60 px-3 py-1 text-xs print:hidden">
      {changes === 0 ? (
        <span className="text-muted-foreground">No differences</span>
      ) : (
        <>
          <span className="font-medium text-primary">+{additions}</span>
          <span className="font-medium text-destructive">-{deletions}</span>
          <span className="text-muted-foreground">
            {changes} {changes === 1 ? "change" : "changes"}
          </span>
        </>
      )}
      <div className="ml-auto flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Previous change"
                onClick={onPrev}
                disabled={changes === 0}
              >
                <ChevronUp />
              </Button>
            }
          />
          <TooltipContent>Previous change (Ctrl+↑)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Next change"
                onClick={onNext}
                disabled={changes === 0}
              >
                <ChevronDown />
              </Button>
            }
          />
          <TooltipContent>Next change (Ctrl+↓)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
