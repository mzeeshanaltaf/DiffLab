"use client";

import { useCallback, useRef, useState } from "react";

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export interface ZoomPan {
  scale: number;
  offset: { x: number; y: number };
  isPanning: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  setScale: (scale: number) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  handlers: {
    onWheel: (event: React.WheelEvent<HTMLElement>) => void;
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  };
}

/** Shared wheel-to-zoom + drag-to-pan behavior for the image compare viewport. */
export function useZoomPan(): ZoomPan {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(
    null
  );

  const zoomIn = useCallback(() => setScale((s) => clamp(s * 1.25, MIN_SCALE, MAX_SCALE)), []);
  const zoomOut = useCallback(() => setScale((s) => clamp(s / 1.25, MIN_SCALE, MAX_SCALE)), []);
  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);
  const setScaleClamped = useCallback((next: number) => setScale(clamp(next, MIN_SCALE, MAX_SCALE)), []);

  const onWheel = useCallback((event: React.WheelEvent<HTMLElement>) => {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    setScale((s) => clamp(s * factor, MIN_SCALE, MAX_SCALE));
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: offset.x,
        originY: offset.y,
      };
      setIsPanning(true);
    },
    [offset]
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset({ x: drag.originX + (event.clientX - drag.startX), y: drag.originY + (event.clientY - drag.startY) });
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    setIsPanning(false);
  }, []);

  return {
    scale,
    offset,
    isPanning,
    zoomIn,
    zoomOut,
    reset,
    setScale: setScaleClamped,
    setOffset,
    handlers: { onWheel, onPointerDown, onPointerMove, onPointerUp },
  };
}
