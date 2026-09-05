"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { computePixelDiff, loadImageFile, releaseImage, type LoadedImage } from "@/lib/diff/image-diff";
import { useZoomPan } from "@/hooks/use-zoom-pan";
import { InputPaneHeader } from "./input-pane";
import { ImageToolbar } from "./image-toolbar";
import { ImageStatsBar } from "./image-stats-bar";
import { ImageViewport, type ImageDiffMode } from "./image-viewport";

const FILE_ACCEPT = "image/*";
const ONION_FLICKER_MS = 600;

function noop() {}

export function ImageCompare() {
  const [leftImage, setLeftImage] = useState<LoadedImage | null>(null);
  const [rightImage, setRightImage] = useState<LoadedImage | null>(null);
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);

  const [mode, setMode] = useState<ImageDiffMode>("side-by-side");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [fadeOpacity, setFadeOpacity] = useState(50);
  const [onionShow, setOnionShow] = useState<"a" | "b">("a");
  const [onionAutoFlicker, setOnionAutoFlicker] = useState(false);
  const [diffThreshold, setDiffThreshold] = useState(10);
  const [diffIncludeAA, setDiffIncludeAA] = useState(false);

  const zoomPan = useZoomPan();

  useEffect(() => {
    if (!onionAutoFlicker || mode !== "onion" || !leftImage || !rightImage) return;
    const id = window.setInterval(() => setOnionShow((s) => (s === "a" ? "b" : "a")), ONION_FLICKER_MS);
    return () => window.clearInterval(id);
  }, [onionAutoFlicker, mode, leftImage, rightImage]);

  const handleFile = useCallback(
    (side: "a" | "b") => async (file: File) => {
      try {
        const image = await loadImageFile(file);
        if (side === "a") {
          setLeftImage((prev) => {
            releaseImage(prev);
            return image;
          });
          setLeftError(null);
        } else {
          setRightImage((prev) => {
            releaseImage(prev);
            return image;
          });
          setRightError(null);
        }
      } catch {
        const message = "Could not read this image";
        if (side === "a") setLeftError(message);
        else setRightError(message);
      }
    },
    []
  );

  const handleClearSide = useCallback(
    (side: "a" | "b") => () => {
      if (side === "a") {
        setLeftImage((prev) => {
          releaseImage(prev);
          return null;
        });
        setLeftError(null);
      } else {
        setRightImage((prev) => {
          releaseImage(prev);
          return null;
        });
        setRightError(null);
      }
    },
    []
  );

  const handleSwap = useCallback(() => {
    setLeftImage(rightImage);
    setRightImage(leftImage);
    setLeftError(rightError);
    setRightError(leftError);
  }, [leftImage, rightImage, leftError, rightError]);

  const handleClearAll = useCallback(() => {
    setLeftImage((prev) => {
      releaseImage(prev);
      return null;
    });
    setRightImage((prev) => {
      releaseImage(prev);
      return null;
    });
    setLeftError(null);
    setRightError(null);
  }, []);

  const canvasWidth = Math.max(leftImage?.width ?? 0, rightImage?.width ?? 0);
  const canvasHeight = Math.max(leftImage?.height ?? 0, rightImage?.height ?? 0);

  const diffResult = useMemo(() => {
    if (mode !== "diff" || !leftImage || !rightImage) return null;
    return computePixelDiff(leftImage, rightImage, { threshold: diffThreshold / 100, includeAA: diffIncludeAA });
  }, [mode, leftImage, rightImage, diffThreshold, diffIncludeAA]);

  const hasBoth = leftImage !== null && rightImage !== null;

  return (
    <div className="flex h-[calc(100vh-230px)] min-h-120 flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
      <ImageToolbar
        mode={mode}
        onModeChange={setMode}
        fadeOpacity={fadeOpacity}
        onFadeOpacityChange={setFadeOpacity}
        onionShow={onionShow}
        onOnionShowChange={setOnionShow}
        onionAutoFlicker={onionAutoFlicker}
        onOnionAutoFlickerChange={setOnionAutoFlicker}
        diffThreshold={diffThreshold}
        onDiffThresholdChange={setDiffThreshold}
        diffIncludeAA={diffIncludeAA}
        onDiffIncludeAAChange={setDiffIncludeAA}
        zoomPercent={Math.round(zoomPan.scale * 100)}
        onZoomIn={zoomPan.zoomIn}
        onZoomOut={zoomPan.zoomOut}
        onZoomReset={zoomPan.reset}
        onSwap={handleSwap}
        onClear={handleClearAll}
        disabled={!hasBoth}
      />

      <div className="grid grid-cols-2">
        <InputPaneHeader
          label="Original"
          filename={leftImage?.filename ?? null}
          accentClassName="bg-destructive"
          className="border-r border-b border-border/60"
          onFile={handleFile("a")}
          onPasteText={noop}
          onClear={handleClearSide("a")}
          error={leftError}
          hidePaste
          fileAccept={FILE_ACCEPT}
        />
        <InputPaneHeader
          label="Changed"
          filename={rightImage?.filename ?? null}
          accentClassName="bg-primary"
          className="border-b border-border/60"
          onFile={handleFile("b")}
          onPasteText={noop}
          onClear={handleClearSide("b")}
          error={rightError}
          hidePaste
          fileAccept={FILE_ACCEPT}
        />
      </div>

      <ImageStatsBar mode={mode} left={leftImage} right={rightImage} diffResult={diffResult} />

      <ImageViewport
        mode={mode}
        left={leftImage}
        right={rightImage}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        sliderPosition={sliderPosition}
        onSliderPositionChange={setSliderPosition}
        fadeOpacity={fadeOpacity}
        onionShow={onionShow}
        diffResult={diffResult}
        zoomPan={zoomPan}
      />
    </div>
  );
}
