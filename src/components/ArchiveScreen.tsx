"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { computeHeatmapAnalytics } from "@/lib/analytics/heatmap";
import type { ArchiveDay } from "@/lib/archive/useArchiveData";
import { useArchiveData } from "@/lib/archive/useArchiveData";
import { exportArchiveAsPng } from "@/lib/archive/exportPng";
import type { ScheduleConfig } from "@/lib/time-engine/types";
import { ArchiveStrip } from "./ArchiveStrip";
import { DayDetail } from "./DayDetail";

interface ArchiveScreenProps {
  config: ScheduleConfig;
}

export function ArchiveScreen({ config }: ArchiveScreenProps) {
  const { weeks, allMarkers, loading } = useArchiveData(config);
  const [selectedDay, setSelectedDay] = useState<ArchiveDay | null>(null);

  const maxDensity = useMemo(() => {
    let max = 0;
    for (const week of weeks) {
      for (const day of week) {
        for (const count of day.blockMarkerCounts) max = Math.max(max, count);
      }
    }
    return max;
  }, [weeks]);

  const analytics = useMemo(
    () => computeHeatmapAnalytics(allMarkers, config.lessonsPerDay),
    [allMarkers, config.lessonsPerDay],
  );

  return (
    <main className="flex min-h-[100dvh] flex-col items-center bg-bg px-6 pb-16 pt-8">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-fg-dim"
          >
            ← Jetzt
          </Link>
          <button
            type="button"
            onClick={() => exportArchiveAsPng(weeks, maxDensity)}
            disabled={loading || weeks.length === 0}
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-fg-dim disabled:opacity-40"
          >
            Als PNG
          </button>
        </header>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fg-dim">Archiv</p>
          <p className="mt-1 text-2xl font-medium text-fg">Schuljahr im Überblick</p>
        </div>

        {loading ? (
          <p className="text-sm text-fg-dim">Lädt…</p>
        ) : (
          <div className="flex flex-col gap-2">
            {weeks.map((week, i) => (
              <div key={i} className="flex gap-1">
                {week.map((day) => (
                  <ArchiveStrip
                    key={day.dateKey}
                    day={day}
                    maxDensity={maxDensity}
                    onSelect={setSelectedDay}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {analytics.hardPhaseText && (
          <div className="border-t border-fg-faint/40 pt-6">
            <p className="text-sm text-fg">{analytics.hardPhaseText}</p>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              {analytics.toughestSubject && (
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-fg-faint">
                    Zähstes Fach
                  </dt>
                  <dd className="mt-1 text-sm text-fg-dim">{analytics.toughestSubject.value}</dd>
                </div>
              )}
              {analytics.toughestLessonIndex && (
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-fg-faint">
                    Zähste Stunde
                  </dt>
                  <dd className="mt-1 text-sm text-fg-dim">
                    {analytics.toughestLessonIndex.value}.
                  </dd>
                </div>
              )}
              {analytics.toughestWeekday && (
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-fg-faint">
                    Zähster Tag
                  </dt>
                  <dd className="mt-1 text-sm text-fg-dim">
                    {["Mo", "Di", "Mi", "Do", "Fr"][analytics.toughestWeekday.value - 1]}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />
    </main>
  );
}
