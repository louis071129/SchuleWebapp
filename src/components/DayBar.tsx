"use client";

import { minutesSinceMidnight } from "@/lib/time-engine/calendar";
import { roundToStep } from "@/lib/time-engine/format";
import { firstBlockStart, lastBlockEnd } from "@/lib/time-engine/schedule";
import type { Block } from "@/lib/time-engine/types";

interface DayBarProps {
  blocks: Block[];
  now: Date;
  dayProgress: number;
}

export function DayBar({ blocks, now, dayProgress }: DayBarProps) {
  if (blocks.length === 0) return null;

  const start = firstBlockStart(blocks);
  const end = lastBlockEnd(blocks);
  const totalMinutes = Math.max(1, end - start);
  const nowMinutes = minutesSinceMidnight(now);
  const markerPercent = Math.min(100, Math.max(0, ((nowMinutes - start) / totalMinutes) * 100));

  return (
    <div className="w-full">
      <div className="relative flex h-2 w-full gap-[2px]">
        {blocks.map((block, i) => {
          const widthPercent = ((block.endMinutes - block.startMinutes) / totalMinutes) * 100;
          const blockProgress = Math.min(
            100,
            Math.max(0, ((nowMinutes - block.startMinutes) / (block.endMinutes - block.startMinutes)) * 100),
          );
          return (
            <div
              key={i}
              style={{ width: `${widthPercent}%` }}
              className="relative h-full overflow-hidden rounded-[1px] bg-fg-faint"
            >
              <div
                className="absolute inset-y-0 left-0 h-full bg-accent"
                style={{
                  width: `${blockProgress}%`,
                  transition: "width 400ms ease-out",
                }}
              />
            </div>
          );
        })}
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-px -translate-y-1/2 bg-fg"
          style={{ left: `${markerPercent}%`, transition: "left 400ms ease-out" }}
        />
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-fg-dim">
        Tag zu {roundToStep(dayProgress)}%
      </p>
    </div>
  );
}
