"use client";

import { useEffect, useState } from "react";
import { getMarkersInDateRange } from "@/lib/db/markers-repo";
import type { Marker } from "@/lib/db/schema";
import type { Block, ScheduleConfig } from "@/lib/time-engine/types";
import { getArchiveDayList, groupIntoWeeks, type ArchiveDayMeta } from "./days";

export interface ArchiveDay extends ArchiveDayMeta {
  markerCount: number;
  blockMarkerCounts: number[];
}

interface ArchiveDataState {
  weeks: ArchiveDay[][];
  allMarkers: Marker[];
  loading: boolean;
}

function blockMatchesMarker(block: Block, marker: Marker): boolean {
  if (block.type === "lesson") {
    return marker.blockType === "lesson" && marker.lessonIndex === block.lessonIndex;
  }
  return marker.blockType === "break" && marker.afterLesson === block.afterLesson;
}

export function useArchiveData(config: ScheduleConfig): ArchiveDataState {
  const [state, setState] = useState<ArchiveDataState>({ weeks: [], allMarkers: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const now = new Date();
      const dayList = getArchiveDayList(config, now);
      if (dayList.length === 0) {
        if (!cancelled) setState({ weeks: [], allMarkers: [], loading: false });
        return;
      }

      const markers = await getMarkersInDateRange(
        dayList[0].dateKey,
        dayList[dayList.length - 1].dateKey,
      );
      const byDate = new Map<string, Marker[]>();
      for (const marker of markers) {
        const list = byDate.get(marker.dateKey);
        if (list) list.push(marker);
        else byDate.set(marker.dateKey, [marker]);
      }

      const days: ArchiveDay[] = dayList.map((day) => {
        const dayMarkers = byDate.get(day.dateKey) ?? [];
        const blockMarkerCounts = day.blocks.map(
          (block) => dayMarkers.filter((m) => blockMatchesMarker(block, m)).length,
        );
        return { ...day, markerCount: dayMarkers.length, blockMarkerCounts };
      });

      if (!cancelled) setState({ weeks: groupIntoWeeks(days), allMarkers: markers, loading: false });
    })();

    return () => {
      cancelled = true;
    };
  }, [config]);

  return state;
}
