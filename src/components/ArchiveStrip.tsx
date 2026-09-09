"use client";

import type { ArchiveDay } from "@/lib/archive/useArchiveData";

interface ArchiveStripProps {
  day: ArchiveDay;
  maxDensity: number;
  onSelect: (day: ArchiveDay) => void;
}

export function ArchiveStrip({ day, maxDensity, onSelect }: ArchiveStripProps) {
  if (!day.isSchoolDay || day.blocks.length === 0) {
    return (
      <button
        type="button"
        onClick={() => onSelect(day)}
        aria-label={`${day.dateKey}, kein Schultag`}
        className="flex h-16 w-3 items-end"
      >
        <span className="h-1.5 w-full rounded-[1px] bg-fg-faint/50" />
      </button>
    );
  }

  const start = day.blocks[0].startMinutes;
  const end = day.blocks[day.blocks.length - 1].endMinutes;
  const totalMinutes = Math.max(1, end - start);

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      aria-label={`${day.dateKey}, ${day.markerCount} zäh-Markierungen`}
      className="flex h-16 w-3 flex-col gap-px overflow-hidden"
    >
      {day.blocks.map((block, i) => {
        const heightPercent = ((block.endMinutes - block.startMinutes) / totalMinutes) * 100;
        const count = day.blockMarkerCounts[i] ?? 0;
        const intensity = maxDensity > 0 ? Math.min(1, count / maxDensity) : 0;
        return (
          <div
            key={i}
            className="rounded-[1px]"
            style={{
              height: `${heightPercent}%`,
              backgroundColor:
                intensity > 0
                  ? `color-mix(in srgb, var(--color-accent) ${Math.round(intensity * 100)}%, var(--color-bg-elevated))`
                  : "var(--color-fg-faint)",
              opacity: block.type === "break" ? 0.6 : 1,
            }}
          />
        );
      })}
    </button>
  );
}
