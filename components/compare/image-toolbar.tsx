"use client";

import { ArrowLeftRight, Blend, Columns2, Layers, MoveHorizontal, ScanSearch, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ImageDiffMode } from "./image-viewport";

function firstValue(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number);
}

const MODES: { value: ImageDiffMode; label: string; icon: typeof Columns2 }[] = [
  { value: "side-by-side", label: "Side by side", icon: Columns2 },
  { value: "slider", label: "Slider", icon: MoveHorizontal },
  { value: "fade", label: "Fade", icon: Blend },
  { value: "onion", label: "Onion skin", icon: Layers },
  { value: "diff", label: "Pixel diff", icon: ScanSearch },
];

export interface ImageToolbarProps {
  mode: ImageDiffMode;
  onModeChange: (mode: ImageDiffMode) => void;
  fadeOpacity: number;
  onFadeOpacityChange: (value: number) => void;
  onionShow: "a" | "b";
  onOnionShowChange: (value: "a" | "b") => void;
  onionAutoFlicker: boolean;
  onOnionAutoFlickerChange: (value: boolean) => void;
  diffThreshold: number;
  onDiffThresholdChange: (value: number) => void;
  diffIncludeAA: boolean;
  onDiffIncludeAAChange: (value: boolean) => void;
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onSwap: () => void;
  onClear: () => void;
  disabled: boolean;
}

export function ImageToolbar(props: ImageToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2">
      <ToggleGroup
        value={[props.mode]}
        onValueChange={(value) => {
          if (value[0]) props.onModeChange(value[0] as ImageDiffMode);
        }}
        variant="outline"
        size="sm"
      >
        {MODES.map((m) => (
          <ToggleGroupItem key={m.value} value={m.value} aria-label={m.label} disabled={props.disabled}>
            <m.icon />
            <span className="hidden lg:inline">{m.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {props.mode === "fade" ? (
        <div className="flex min-w-40 items-center gap-2">
          <Label className="text-xs font-normal text-muted-foreground">Opacity</Label>
          <Slider
            value={[props.fadeOpacity]}
            onValueChange={(v) => props.onFadeOpacityChange(firstValue(v))}
            min={0}
            max={100}
            step={1}
            className="w-32"
          />
          <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{props.fadeOpacity}%</span>
        </div>
      ) : null}

      {props.mode === "onion" ? (
        <div className="flex items-center gap-2">
          <ToggleGroup
            value={[props.onionShow]}
            onValueChange={(value) => {
              if (value[0]) props.onOnionShowChange(value[0] as "a" | "b");
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="a">Original</ToggleGroupItem>
            <ToggleGroupItem value="b">Changed</ToggleGroupItem>
          </ToggleGroup>
          <Label htmlFor="img-opt-flicker" className="text-xs font-normal text-muted-foreground">
            Auto-flicker
          </Label>
          <Switch id="img-opt-flicker" checked={props.onionAutoFlicker} onCheckedChange={props.onOnionAutoFlickerChange} />
        </div>
      ) : null}

      {props.mode === "diff" ? (
        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="sm">Diff options</Button>} />
          <PopoverContent align="start" className="w-72">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-4">
                <Label className="font-normal">Sensitivity</Label>
                <span className="text-xs tabular-nums text-muted-foreground">{props.diffThreshold}</span>
              </div>
              <Slider
                value={[props.diffThreshold]}
                onValueChange={(v) => props.onDiffThresholdChange(firstValue(v))}
                min={0}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Lower catches subtler pixel changes; higher ignores minor noise.</p>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="img-opt-aa" className="font-normal">
                Flag anti-aliased edges
              </Label>
              <Switch id="img-opt-aa" checked={props.diffIncludeAA} onCheckedChange={props.onDiffIncludeAAChange} />
            </div>
          </PopoverContent>
        </Popover>
      ) : null}

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={props.onZoomOut} disabled={props.disabled}>
                <ZoomOut />
              </Button>
            }
          />
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>
        <button
          type="button"
          onClick={props.onZoomReset}
          disabled={props.disabled}
          className="w-12 rounded px-1 text-center text-xs tabular-nums text-muted-foreground hover:bg-accent disabled:opacity-50"
        >
          {props.zoomPercent}%
        </button>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={props.onZoomIn} disabled={props.disabled}>
                <ZoomIn />
              </Button>
            }
          />
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Swap sides" onClick={props.onSwap} disabled={props.disabled}>
                <ArrowLeftRight />
              </Button>
            }
          />
          <TooltipContent>Swap sides</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Clear both sides" onClick={props.onClear} disabled={props.disabled}>
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
