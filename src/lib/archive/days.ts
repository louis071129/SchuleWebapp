import { addDays, dateKey, startOfDay, startOfWeek, toWeekday } from "@/lib/time-engine/calendar";
import { classifyDay, getSchoolYearBounds } from "@/lib/time-engine/engine";
import { generateDayBlocks } from "@/lib/time-engine/schedule";
import type { Block, ScheduleConfig, Weekday } from "@/lib/time-engine/types";

export interface ArchiveDayMeta {
  date: Date;
  dateKey: string;
  weekday: Weekday;
  isSchoolDay: boolean;
  blocks: Block[];
}

const MAX_DAYS = 400;

/**
 * Alle Wochentage (Mo-Fr) vom Beginn des laufenden Schuljahrs bis heute
 * (einschließlich), auf volle Wochen ausgerichtet, damit sich das Archiv
 * sauber in 5er-Wochenreihen gruppieren lässt.
 */
export function getArchiveDayList(config: ScheduleConfig, now: Date): ArchiveDayMeta[] {
  const { start } = getSchoolYearBounds(now, config.bundesland);
  const days: ArchiveDayMeta[] = [];

  let cursor = startOfWeek(start);
  const end = addDays(startOfDay(now), 1);
  let guard = 0;

  while (cursor.getTime() < end.getTime() && guard < MAX_DAYS) {
    const weekday = toWeekday(cursor);
    if (weekday) {
      const isSchoolDay = classifyDay(cursor, config) === "schoolday";
      days.push({
        date: cursor,
        dateKey: dateKey(cursor),
        weekday,
        isSchoolDay,
        blocks: isSchoolDay ? generateDayBlocks(config, weekday) : [],
      });
    }
    cursor = addDays(cursor, 1);
    guard++;
  }

  return days;
}

/** Gruppiert die Tagesliste in Wochen von je 5 Einträgen (Mo-Fr). */
export function groupIntoWeeks<T extends ArchiveDayMeta>(days: T[]): T[][] {
  const weeks: T[][] = [];
  for (let i = 0; i < days.length; i += 5) {
    weeks.push(days.slice(i, i + 5));
  }
  return weeks;
}
