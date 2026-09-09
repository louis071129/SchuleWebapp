"use client";

import { useEffect, useState } from "react";
import { getSnapshot, type Snapshot } from "@/lib/time-engine/engine";
import type { ScheduleConfig } from "@/lib/time-engine/types";

const TICK_MS = 15_000;

/**
 * Liefert den live berechneten Zeit-Snapshot. Tickt regelmäßig und
 * rechnet zusätzlich sofort neu, sobald der Tab/das Fenster wieder
 * sichtbar wird - nicht erst beim nächsten Intervall-Tick.
 */
export function useSnapshot(config: ScheduleConfig | null): Snapshot | null {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(() =>
    config ? getSnapshot(new Date(), config) : null,
  );

  useEffect(() => {
    if (!config) {
      setSnapshot(null);
      return;
    }

    const recompute = () => setSnapshot(getSnapshot(new Date(), config));
    recompute();

    const interval = setInterval(recompute, TICK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") recompute();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", recompute);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", recompute);
    };
  }, [config]);

  return snapshot;
}
