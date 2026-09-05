"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface SheetStatsBarProps {
  added: number;
  removed: number;
  changed: number;
  changedCells: number;
  onPrev: () => void;
  onNext: () => void;
}

export function SheetStatsBar({ added, removed, changed, changedCells, onPrev, onNext }: SheetStatsBarProps) {
  const hasDiffs = added + removed + changed > 0;

  return (
    <div className="flex items-center gap-4 border-b border-border/60 px-3 py-1 text-xs print:hidden">
      {!hasDiffs ? (
        <span className="text-muted-foreground">No differences</span>
      ) : (
        <>
          <span className="font-medium text-primary">+{added} rows</span>
          <span className="font-medium text-destructive">-{removed} rows</span>
          <span className="text-muted-foreground">
            {changed} {changed === 1 ? "row" : "rows"} changed ({changedCells} {changedCells === 1 ? "cell" : "cells"})
          </span>
        </>
      )}
      <div className="ml-auto flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-xs" aria-label="Previous difference" onClick={onPrev} disabled={!hasDiffs}>
                <ChevronUp />
              </Button>
            }
          />
          <TooltipContent>Previous difference</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-xs" aria-label="Next difference" onClick={onNext} disabled={!hasDiffs}>
                <ChevronDown />
              </Button>
            }
          />
          <TooltipContent>Next difference</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
