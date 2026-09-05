"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface SheetTabInfo {
  name: string;
  inLeft: boolean;
  inRight: boolean;
}

export interface SheetTabsProps {
  sheets: SheetTabInfo[];
  activeSheet: string | null;
  onActiveSheetChange: (name: string) => void;
}

export function SheetTabs({ sheets, activeSheet, onActiveSheetChange }: SheetTabsProps) {
  if (sheets.length === 0) {
    return (
      <div className="border-b border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        Upload a spreadsheet on both sides to see sheet tabs.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-b border-border/60 bg-muted/20 px-2 py-1.5">
      <ToggleGroup
        value={activeSheet ? [activeSheet] : []}
        onValueChange={(value) => {
          if (value[0]) onActiveSheetChange(value[0]);
        }}
        variant="outline"
        size="sm"
      >
        {sheets.map((sheet) => {
          const partial = sheet.inLeft !== sheet.inRight;
          const label = (
            <span className="flex items-center gap-1.5">
              {partial ? (
                <span
                  className={cn("size-1.5 shrink-0 rounded-full", sheet.inLeft ? "bg-destructive" : "bg-primary")}
                />
              ) : null}
              {sheet.name}
            </span>
          );
          return (
            <ToggleGroupItem key={sheet.name} value={sheet.name}>
              {partial ? (
                <Tooltip>
                  <TooltipTrigger render={label} />
                  <TooltipContent>{sheet.inLeft ? "Only in Original" : "Only in Changed"}</TooltipContent>
                </Tooltip>
              ) : (
                label
              )}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
