"use client";

import { useCallback, useRef } from "react";

const LONG_PRESS_MS = 550;
const REVEAL_MS = 3000;

interface LongPressHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
}

/**
 * Long-Press blendet für REVEAL_MS die exakte Restzeit ein (mit Haptik),
 * ein normaler Tap ruft onTap auf. Beides über denselben Pointer-Zyklus,
 * damit sich Tap und Long-Press auf demselben Element nicht in die Quere
 * kommen.
 */
export function useLongPress(onTap: () => void, onReveal: (active: boolean) => void): LongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);

  const onPointerDown = useCallback(() => {
    triggeredRef.current = false;
    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);
      onReveal(true);
      revealTimerRef.current = setTimeout(() => onReveal(false), REVEAL_MS);
    }, LONG_PRESS_MS);
  }, [onReveal]);

  const onPointerUp = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    if (!triggeredRef.current) onTap();
  }, [onTap]);

  const onPointerLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const onPointerCancel = onPointerLeave;

  return { onPointerDown, onPointerUp, onPointerLeave, onPointerCancel };
}
