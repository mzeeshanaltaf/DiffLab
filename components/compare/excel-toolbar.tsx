"use client";

import { ArrowLeftRight, Hash, KeySquare, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AlignMode } from "@/lib/diff/sheet-diff";

export interface ExcelToolbarProps {
  alignMode: AlignMode;
  onAlignModeChange: (mode: AlignMode) => void;
  keyColumn: number;
  onKeyColumnChange: (column: number) => void;
  keyColumnOptions: { value: number; label: string }[];
  ignoreCase: boolean;
  onIgnoreCaseChange: (value: boolean) => void;
  trimWhitespace: boolean;
  onTrimWhitespaceChange: (value: boolean) => void;
  onSwap: () => void;
  onClear: () => void;
}

export function ExcelToolbar(props: ExcelToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2 print:hidden">
      <ToggleGroup
        value={[props.alignMode]}
        onValueChange={(value) => {
          if (value[0]) props.onAlignModeChange(value[0] as AlignMode);
        }}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="index" aria-label="Align rows by position">
          <Hash />
          By position
        </ToggleGroupItem>
        <ToggleGroupItem value="key" aria-label="Align rows by key column">
          <KeySquare />
          By key column
        </ToggleGroupItem>
      </ToggleGroup>

      {props.alignMode === "key" ? (
        <Select value={String(props.keyColumn)} onValueChange={(value) => value && props.onKeyColumnChange(Number(value))}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue>
              {(value: string) => props.keyColumnOptions.find((o) => String(o.value) === value)?.label ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {props.keyColumnOptions.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              <SlidersHorizontal />
              Options
            </Button>
          }
        />
        <PopoverContent align="start" className="w-72">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="excel-opt-ignore-case" className="font-normal">
              Ignore case
            </Label>
            <Switch id="excel-opt-ignore-case" checked={props.ignoreCase} onCheckedChange={props.onIgnoreCaseChange} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="excel-opt-trim" className="font-normal">
              Trim whitespace
            </Label>
            <Switch id="excel-opt-trim" checked={props.trimWhitespace} onCheckedChange={props.onTrimWhitespaceChange} />
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Swap sides" onClick={props.onSwap}>
                <ArrowLeftRight />
              </Button>
            }
          />
          <TooltipContent>Swap sides</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Clear both sides" onClick={props.onClear}>
                <Trash2 />
              </Button>
            }
          />
          <TooltipContent>Clear both sides</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
