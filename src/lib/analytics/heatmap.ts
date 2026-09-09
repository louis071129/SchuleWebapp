import type { Marker } from "@/lib/db/schema";
import type { Weekday } from "@/lib/time-engine/types";

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
};

export interface HeatmapCell {
  weekday: Weekday;
  lessonIndex: number;
  count: number;
}

export interface RankedEntry<T> {
  value: T;
  count: number;
}

export interface HeatmapAnalytics {
  totalMarkers: number;
  heatmap: HeatmapCell[];
  maxCellCount: number;
  toughestSubject: RankedEntry<string> | null;
  toughestWeekday: RankedEntry<Weekday> | null;
  toughestLessonIndex: RankedEntry<number> | null;
  /** z.B. "Deine harte Phase: Dienstag, 5. und 6. Stunde". Null bei zu wenig Daten. */
  hardPhaseText: string | null;
}

const MIN_MARKERS_FOR_VERDICT = 5;
const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5];

function maxEntry<T>(counts: Map<T, number>): RankedEntry<T> | null {
  let best: RankedEntry<T> | null = null;
  for (const [value, count] of counts) {
    if (!best || count > best.count) best = { value, count };
  }
  return best;
}

export function computeHeatmapAnalytics(markers: Marker[], lessonsPerDay: number): HeatmapAnalytics {
  const bySubject = new Map<string, number>();
  const byWeekday = new Map<Weekday, number>();
  const byLessonIndex = new Map<number, number>();
  const byWeekdayLesson = new Map<string, number>();

  for (const marker of markers) {
    byWeekday.set(marker.weekday, (byWeekday.get(marker.weekday) ?? 0) + 1);

    if (marker.blockType === "lesson" && marker.lessonIndex !== undefined) {
      byLessonIndex.set(marker.lessonIndex, (byLessonIndex.get(marker.lessonIndex) ?? 0) + 1);
      const key = `${marker.weekday}-${marker.lessonIndex}`;
      byWeekdayLesson.set(key, (byWeekdayLesson.get(key) ?? 0) + 1);
      if (marker.subject) {
        bySubject.set(marker.subject, (bySubject.get(marker.subject) ?? 0) + 1);
      }
    }
  }

  const heatmap: HeatmapCell[] = [];
  let maxCellCount = 0;
  for (const weekday of WEEKDAYS) {
    for (let lessonIndex = 1; lessonIndex <= lessonsPerDay; lessonIndex++) {
      const count = byWeekdayLesson.get(`${weekday}-${lessonIndex}`) ?? 0;
      maxCellCount = Math.max(maxCellCount, count);
      heatmap.push({ weekday, lessonIndex, count });
    }
  }

  const toughestSubject = maxEntry(bySubject);
  const toughestWeekday = maxEntry(byWeekday);
  const toughestLessonIndex = maxEntry(byLessonIndex);

  return {
    totalMarkers: markers.length,
    heatmap,
    maxCellCount,
    toughestSubject,
    toughestWeekday,
    toughestLessonIndex,
    hardPhaseText: buildHardPhaseText(markers.length, toughestWeekday, byWeekdayLesson),
  };
}

function buildHardPhaseText(
  totalMarkers: number,
  toughestWeekday: RankedEntry<Weekday> | null,
  byWeekdayLesson: Map<string, number>,
): string | null {
  if (totalMarkers < MIN_MARKERS_FOR_VERDICT || !toughestWeekday) return null;

  const lessonsOnThatDay: RankedEntry<number>[] = [];
  for (const [key, count] of byWeekdayLesson) {
    const [weekdayStr, lessonStr] = key.split("-");
    if (Number(weekdayStr) === toughestWeekday.value && count > 0) {
      lessonsOnThatDay.push({ value: Number(lessonStr), count });
    }
  }
  if (lessonsOnThatDay.length === 0) {
    return `Deine harte Phase: ${WEEKDAY_NAMES[toughestWeekday.value]}`;
  }

  lessonsOnThatDay.sort((a, b) => b.count - a.count || a.value - b.value);
  const top = lessonsOnThatDay[0];
  const second = lessonsOnThatDay[1];

  const combineWithSecond =
    second && Math.abs(second.value - top.value) === 1 && second.count >= top.count * 0.7;

  const weekdayName = WEEKDAY_NAMES[toughestWeekday.value];
  if (combineWithSecond) {
    const [lower, higher] = [top, second].sort((a, b) => a.value - b.value);
    return `Deine harte Phase: ${weekdayName}, ${lower.value}. und ${higher.value}. Stunde`;
  }
  return `Deine harte Phase: ${weekdayName}, ${top.value}. Stunde`;
}
