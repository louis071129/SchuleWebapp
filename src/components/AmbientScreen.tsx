"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWakeLock } from "@/lib/hooks/useWakeLock";
import { getSnapshot } from "@/lib/time-engine/engine";
import { getAmbientValue } from "@/lib/jetzt/ambient";
import type { ScheduleConfig } from "@/lib/time-engine/types";
import { ProgressRing } from "./ProgressRing";

interface AmbientScreenProps {
  config: ScheduleConfig;
}

export function AmbientScreen({ config }: AmbientScreenProps) {
  const router = useRouter();
  const [value, setValue] = useState(() => getAmbientValue(getSnapshot(new Date(), config)));

  useWakeLock(true);

  useEffect(() => {
    const recompute = () => setValue(getAmbientValue(getSnapshot(new Date(), config)));
    recompute();
    const interval = setInterval(recompute, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") recompute();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [config]);

  return (
    <div
      onClick={() => router.back()}
      className="fixed inset-0 flex items-center justify-center bg-black"
    >
      <div className="relative flex items-center justify-center">
        <ProgressRing raw={value.raw} />
        <span className="tabular-nums absolute text-5xl font-medium leading-none tracking-[-0.03em] text-fg-dim">
          {value.percent}
        </span>
      </div>
    </div>
  );
}
