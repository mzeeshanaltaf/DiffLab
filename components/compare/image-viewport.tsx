"use client";
/* eslint-disable @next/next/no-img-element -- these render blob: URLs at exact natural pixel size; next/image can't optimize either. */

import { useEffect, useRef } from "react";
import { GripVertical } from "lucide-react";
import type { LoadedImage, PixelDiffResult, PixelDiffTooLarge } from "@/lib/diff/image-diff";
import type { ZoomPan } from "@/hooks/use-zoom-pan";
import { cn } from "@/lib/utils";

export type ImageDiffMode = "side-by-side" | "slider" | "fade" | "onion" | "diff";

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, var(--muted) 25%, transparent 25%), linear-gradient(-45deg, var(--muted) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--muted) 75%), linear-gradient(-45deg, transparent 75%, var(--muted) 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
};

function Dimensions({ image }: { image: LoadedImage }) {
  return (
    <span className="pointer-events-none absolute left-2 top-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur">
      {image.width}×{image.height}
    </span>
  );
}

function DiffCanvas({ data }: { data: ImageData }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = data.width;
    canvas.height = data.height;
    canvas.getContext("2d")?.putImageData(data, 0, 0);
  }, [data]);
  return (
    <canvas
      ref={canvasRef}
      className="absolute left-0 top-0"
      style={{ width: data.width, height: data.height, imageRendering: "pixelated" }}
    />
  );
}

interface ImageViewportProps {
  mode: ImageDiffMode;
  left: LoadedImage | null;
  right: LoadedImage | null;
  canvasWidth: number;
  canvasHeight: number;
  sliderPosition: number;
  onSliderPositionChange: (value: number) => void;
  fadeOpacity: number;
  onionShow: "a" | "b";
  diffResult: PixelDiffResult | PixelDiffTooLarge | null;
  zoomPan: ZoomPan;
}

export function ImageViewport({
  mode,
  left,
  right,
  canvasWidth,
  canvasHeight,
  sliderPosition,
  onSliderPositionChange,
  fadeOpacity,
  onionShow,
  diffResult,
  zoomPan,
}: ImageViewportProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const canvasBoxRef = useRef<HTMLDivElement | null>(null);
  const draggingSliderRef = useRef(false);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || canvasWidth === 0 || canvasHeight === 0) return;
    const { clientWidth, clientHeight } = outer;
    const fit = Math.min(1, (clientWidth - 32) / canvasWidth, (clientHeight - 32) / canvasHeight);
    zoomPan.setScale(fit > 0 ? fit : 1);
    zoomPan.setOffset({ x: 0, y: 0 });
    // Re-fit only when a new image pair changes the canvas size, not on every zoom/pan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, canvasHeight]);

  function updateSliderFromClientX(clientX: number) {
    const box = canvasBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    onSliderPositionChange(Math.min(100, Math.max(0, percent)));
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    if (mode === "slider") {
      draggingSliderRef.current = true;
      updateSliderFromClientX(event.clientX);
    } else {
      zoomPan.handlers.onPointerDown(event);
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (mode === "slider") {
      if (draggingSliderRef.current) updateSliderFromClientX(event.clientX);
    } else {
      zoomPan.handlers.onPointerMove(event);
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (mode === "slider") {
      draggingSliderRef.current = false;
    } else {
      zoomPan.handlers.onPointerUp(event);
    }
  }

  if (!left || !right) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Upload an image on both sides to compare.
      </div>
    );
  }

  const transform = `translate(-50%, -50%) translate(${zoomPan.offset.x}px, ${zoomPan.offset.y}px) scale(${zoomPan.scale})`;

  return (
    <div
      ref={outerRef}
      className={cn(
        "relative flex-1 touch-none overflow-hidden bg-muted/10",
        mode === "slider" ? "cursor-ew-resize" : zoomPan.isPanning ? "cursor-grabbing" : "cursor-grab"
      )}
      onWheel={zoomPan.handlers.onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div className="absolute left-1/2 top-1/2" style={{ transform }}>
        {mode === "side-by-side" ? (
          <div className="flex gap-3">
            <div className="relative overflow-hidden rounded" style={{ width: canvasWidth, height: canvasHeight, ...CHECKERBOARD_STYLE }}>
              <img src={left.url} alt="Original" draggable={false} className="absolute left-0 top-0" style={{ width: left.width, height: left.height }} />
              <Dimensions image={left} />
            </div>
            <div className="relative overflow-hidden rounded" style={{ width: canvasWidth, height: canvasHeight, ...CHECKERBOARD_STYLE }}>
              <img src={right.url} alt="Changed" draggable={false} className="absolute left-0 top-0" style={{ width: right.width, height: right.height }} />
              <Dimensions image={right} />
            </div>
          </div>
        ) : (
          <div
            ref={canvasBoxRef}
            className="relative overflow-hidden rounded shadow-lg"
            style={{ width: canvasWidth, height: canvasHeight, ...CHECKERBOARD_STYLE }}
          >
            {mode === "slider" ? (
              <>
                <img src={right.url} alt="Changed" draggable={false} className="absolute left-0 top-0" style={{ width: right.width, height: right.height }} />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img src={left.url} alt="Original" draggable={false} className="absolute left-0 top-0" style={{ width: left.width, height: left.height }} />
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0 w-1 bg-primary"
                  style={{ left: `${sliderPosition}%`, boxShadow: "0 0 0 1.5px rgba(0,0,0,0.55), 0 0 10px rgba(0,0,0,0.35)" }}
                >
                  <span className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-lg">
                    <GripVertical className="size-4" />
                  </span>
                </div>
              </>
            ) : null}

            {mode === "fade" ? (
              <>
                <img src={right.url} alt="Changed" draggable={false} className="absolute left-0 top-0" style={{ width: right.width, height: right.height }} />
                <img
                  src={left.url}
                  alt="Original"
                  draggable={false}
                  className="absolute left-0 top-0"
                  style={{ width: left.width, height: left.height, opacity: fadeOpacity / 100 }}
                />
              </>
            ) : null}

            {mode === "onion" ? (
              <img
                src={onionShow === "a" ? left.url : right.url}
                alt={onionShow === "a" ? "Original" : "Changed"}
                draggable={false}
                className="absolute left-0 top-0 transition-opacity duration-100"
                style={{ width: onionShow === "a" ? left.width : right.width, height: onionShow === "a" ? left.height : right.height }}
              />
            ) : null}

            {mode === "diff" ? (
              diffResult && !diffResult.tooLarge ? (
                <DiffCanvas data={diffResult.diffImageData} />
              ) : diffResult?.tooLarge ? (
                <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                  {diffResult.width}×{diffResult.height} is too large to compute a pixel diff in-browser.
                </div>
              ) : null
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
