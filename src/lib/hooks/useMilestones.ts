"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentLevel } from "@/lib/jetzt/level";

const THRESHOLDS = [25, 50, 75, 90, 100];

interface MilestoneState {
  pulse: boolean;
  halftime: boolean;
}

/**
 * Beobachtet den Fortschritt der Block-Ebene und löst beim Überschreiten
 * von 25/50/75/90/100% eine kurze, sehr subtile Reaktion aus (Zahlen-Reflow
 * + Haptik). Bei 50% erscheint kurz "Halbzeit" statt der Zahl.
 */
export function useMilestones(level: ContentLevel, percent: number, blockKey: string): MilestoneState {
  const lastThreshold = useRef(-1);
  const lastBlockKey = useRef(blockKey);
  const [pulse, setPulse] = useState(false);
  const [halftime, setHalftime] = useState(false);

  useEffect(() => {
    if (lastBlockKey.current !== blockKey) {
      lastBlockKey.current = blockKey;
      lastThreshold.current = -1;
    }

    if (level !== "block") return;

    const highest = [...THRESHOLDS].reverse().find((t) => percent >= t) ?? -1;
    if (highest < 25 || highest <= lastThreshold.current) return;

    lastThreshold.current = highest;
    setPulse(true);
    if (highest === 50) setHalftime(true);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(highest === 100 ? [10, 40, 10] : 8);
    }

    const pulseTimer = setTimeout(() => setPulse(false), 300);
    const halftimeTimer = setTimeout(() => setHalftime(false), 900);
    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(halftimeTimer);
    };
  }, [level, percent, blockKey]);

  return { pulse, halftime };
}
