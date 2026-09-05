"use client";

import { ArrowLeftRight, Columns2, Copy, Download, Printer, Rows3, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Precision } from "@/lib/diff/normalize";

const PRECISIONS: { value: Precision; label: string }[] = [
  { value: "smart", label: "Smart" },
  { value: "line", label: "Line" },
  { value: "word", label: "Word" },
  { value: "character", label: "Character" },
];

export interface DocumentToolbarProps {
  viewMode: "split" | "unified";
  onViewModeChange: (value: "split" | "unified") => void;
  precision: Precision;
  onPrecisionChange: (value: Precision) => void;
  ignoreWhitespace: boolean;
  onIgnoreWhitespaceChange: (value: boolean) => void;
  ignoreCase: boolean;
  onIgnoreCaseChange: (value: boolean) => void;
  collapseEnabled: boolean;
  onCollapseEnabledChange: (value: boolean) => void;
  collapseMargin: number;
  onCollapseMarginChange: (value: number) => void;
  lineWrap: boolean;
  onLineWrapChange: (value: boolean) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (value: boolean) => void;
  mergeDirection: "a-to-b" | "b-to-a";
  onMergeDirectionChange: (direction: "a-to-b" | "b-to-a") => void;
  onSwap: () => void;
  onClear: () => void;
  onExportPatch: () => void;
  onCopyPatch: () => void;
  onPrint: () => void;
}

export function DocumentToolbar(props: DocumentToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2 print:hidden">
      <ToggleGroup
        value={[props.viewMode]}
        onValueChange={(value) => {
          if (value[0]) props.onViewModeChange(value[0] as "split" | "unified");
        }}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="split" aria-label="Side-by-side view">
          <Columns2 />
          Split
        </ToggleGroupItem>
        <ToggleGroupItem value="unified" aria-label="Unified view">
          <Rows3 />
          Unified
        </ToggleGroupItem>
      </ToggleGroup>

      <Select value={props.precision} onValueChange={(value) => value && props.onPrecisionChange(value as Precision)}>
        <SelectTrigger size="sm" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRECISIONS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              <SlidersHorizontal />
              Options
            </Button>
          }
        />
        <PopoverContent align="start" className="w-80">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="doc-opt-ignore-ws" className="font-normal">
              Ignore whitespace
            </Label>
            <Switch
              id="doc-opt-ignore-ws"
              checked={props.ignoreWhitespace}
              onCheckedChange={props.onIgnoreWhitespaceChange}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="doc-opt-ignore-case" className="font-normal">
              Ignore case
            </Label>
            <Switch id="doc-opt-ignore-case" checked={props.ignoreCase} onCheckedChange={props.onIgnoreCaseChange} />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="doc-opt-collapse" className="font-normal">
              Collapse unchanged lines
            </Label>
            <Switch
              id="doc-opt-collapse"
              checked={props.collapseEnabled}
              onCheckedChange={props.onCollapseEnabledChange}
            />
          </div>
          {props.collapseEnabled ? (
            <div className="flex items-center justify-between gap-4 pl-1">
              <Label htmlFor="doc-opt-collapse-margin" className="font-normal text-muted-foreground">
                Context lines
              </Label>
              <Input
                id="doc-opt-collapse-margin"
                type="number"
                min={0}
                max={50}
                value={props.collapseMargin}
                onChange={(event) => props.onCollapseMarginChange(Number(event.target.value) || 0)}
                className="h-7 w-16 text-xs"
              />
            </div>
          ) : null}

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="doc-opt-wrap" className="font-normal">
              Wrap long lines
            </Label>
            <Switch id="doc-opt-wrap" checked={props.lineWrap} onCheckedChange={props.onLineWrapChange} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="doc-opt-line-numbers" className="font-normal">
              Line numbers
            </Label>
            <Switch
              id="doc-opt-line-numbers"
              checked={props.showLineNumbers}
              onCheckedChange={props.onShowLineNumbersChange}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <Label className="font-normal">Merge arrows</Label>
            <ToggleGroup
              value={[props.mergeDirection]}
              onValueChange={(value) => {
                if (value[0]) props.onMergeDirectionChange(value[0] as "a-to-b" | "b-to-a");
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ToggleGroupItem value="a-to-b" className="flex-1">
                Original → Changed
              </ToggleGroupItem>
              <ToggleGroupItem value="b-to-a" className="flex-1">
                Changed → Original
              </ToggleGroupItem>
            </ToggleGroup>
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

        <Separator orientation="vertical" className="h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                <Download />
                Export
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Unified patch</DropdownMenuLabel>
              <DropdownMenuItem onClick={props.onExportPatch}>
                <Download />
                Download .patch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={props.onCopyPatch}>
                <Copy />
                Copy to clipboard
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={props.onPrint}>
              <Printer />
              Print / save as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
