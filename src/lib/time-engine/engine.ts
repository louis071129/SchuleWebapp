import {
  addDays,
  clamp,
  isBeforeDay,
  isSameDay,
  minutesSinceMidnight,
  startOfWeek,
  toWeekday,
  withMinutes,
} from "./calendar";
import {
  getHolidayPeriodContaining,
  getNextHolidayPeriod,
  getPreviousHolidayPeriod,
  getHolidayPeriods,
  isPublicHoliday,
} from "./holidays";
import { blockLabel, firstBlockStart, generateDayBlocks, lastBlockEnd } from "./schedule";
import type { Block, BundeslandCode, HolidayPeriod, ScheduleConfig, Weekday } from "./types";

export type DayType = "schoolday" | "weekend" | "holiday" | "public_holiday";

export type Phase = "before_school" | "in_school" | "after_school" | "weekend" | "holiday";

export interface TermProgress {
  week: number;
  halfYear: { progress: number; label: "1. Halbjahr" | "2. Halbjahr" };
  untilVacation: { progress: number; nextPeriod: HolidayPeriod | null } | null;
}

export interface Snapshot {
  now: Date;
  phase: Phase;
  today?: { weekday: Weekday; blocks: Block[]; dayProgress: number };
  block?: {
    block: Block;
    index: number;
    progress: number;
    msRemaining: number;
    label: string;
  };
  beforeSchool?: { msUntilStart: number; startsAt: Date };
  freeDay?: { nextSchoolDay: Date; msUntilNextSchool: number };
  vacation?: {
    period: HolidayPeriod;
    dayIndex: number;
    totalDays: number;
    daysRemaining: number;
  };
  term: TermProgress | null;
}

export function classifyDay(date: Date, config: ScheduleConfig): DayType {
  if (getHolidayPeriodContaining(date, config.bundesland)) return "holiday";
  if (toWeekday(date) === null) return "weekend";
  if (isPublicHoliday(date, config.bundesland)) return "public_holiday";
  return "schoolday";
}

export function isSchoolDay(date: Date, config: ScheduleConfig): boolean {
  return classifyDay(date, config) === "schoolday";
}

export function getNextSchoolDay(date: Date, config: ScheduleConfig): Date {
  let d = addDays(date, 1);
  for (let i = 0; i < 400; i++) {
    if (isSchoolDay(d, config)) return d;
    d = addDays(d, 1);
  }
  return d;
}

/** Aktueller Block (Stunde/Pause) zu `now`, oder null vor/nach dem Schultag. */
export function getCurrentBlock(
  now: Date,
  blocks: Block[],
): { block: Block; index: number } | null {
  const nowMinutes = minutesSinceMidnight(now);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (nowMinutes >= block.startMinutes && nowMinutes < block.endMinutes) {
      return { block, index: i };
    }
  }
  return null;
}

export function getBlockProgress(now: Date, block: Block): number {
  const nowMinutes = minutesSinceMidnight(now);
  const duration = block.endMinutes - block.startMinutes;
  if (duration <= 0) return 1;
  return clamp((nowMinutes - block.startMinutes) / duration, 0, 1);
}

export function getBlockMsRemaining(now: Date, block: Block): number {
  const end = withMinutes(now, block.endMinutes);
  return Math.max(0, end.getTime() - now.getTime());
}

/** Fortschritt des Schultags (0..1) über die Spanne erster Block bis letzter Block. */
export function getDayProgress(now: Date, blocks: Block[]): number {
  if (blocks.length === 0) return 0;
  const start = firstBlockStart(blocks);
  const end = lastBlockEnd(blocks);
  const duration = end - start;
  if (duration <= 0) return 0;
  const nowMinutes = minutesSinceMidnight(now);
  return clamp((nowMinutes - start) / duration, 0, 1);
}

function daysBetweenInclusive(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.round((withMinutes(b, 0).getTime() - withMinutes(a, 0).getTime()) / msPerDay) + 1;
}

/**
 * Schultage (Mo-Fr, ohne Ferien/Feiertage) im Bereich [start, endExclusive).
 */
function schoolDaysInRange(start: Date, endExclusive: Date, config: ScheduleConfig): Date[] {
  const days: Date[] = [];
  let cursor = start;
  let guard = 0;
  while (cursor.getTime() < endExclusive.getTime() && guard < 2000) {
    if (isSchoolDay(cursor, config)) days.push(cursor);
    cursor = addDays(cursor, 1);
    guard++;
  }
  return days;
}

/**
 * Fortschritt (0..1) über einen Zeitraum, gemessen in Schultag-Einheiten:
 * vergangene Schultage zählen voll, der heutige Tag anteilig nach
 * Tagesfortschritt, künftige Schultage zählen nicht. Dieselbe Logik trägt
 * Woche, Halbjahr und "bis Ferien" - die App stapelt dieselbe Idee einfach
 * auf einer größeren Zeitskala.
 */
export function rangeSchoolProgress(
  now: Date,
  rangeStart: Date,
  rangeEndExclusive: Date,
  config: ScheduleConfig,
): number {
  const days = schoolDaysInRange(rangeStart, rangeEndExclusive, config);
  if (days.length === 0) return 1;

  let elapsedUnits = 0;
  for (const day of days) {
    if (isBeforeDay(day, now)) {
      elapsedUnits += 1;
    } else if (isSameDay(day, now)) {
      const weekday = toWeekday(day);
      if (weekday) {
        const blocks = generateDayBlocks(config, weekday);
        elapsedUnits += getDayProgress(now, blocks);
      }
    }
  }
  return clamp(elapsedUnits / days.length, 0, 1);
}

export function getWeekProgress(now: Date, config: ScheduleConfig): number {
  const start = startOfWeek(now);
  const end = addDays(start, 7);
  return rangeSchoolProgress(now, start, end, config);
}

/** Beginn/Ende des Schuljahrs, aus den bekannten Sommerferien-Zeiträumen abgeleitet. */
export function getSchoolYearBounds(
  date: Date,
  bundesland: BundeslandCode,
): { start: Date; end: Date } {
  const summerPeriods = getHolidayPeriods(bundesland).filter((p) => p.name === "Sommerferien");

  let prevSummerEnd: Date | null = null;
  let nextSummerStart: Date | null = null;
  for (const period of summerPeriods) {
    if (period.end.getTime() < date.getTime()) prevSummerEnd = period.end;
    if (period.start.getTime() > date.getTime() && !nextSummerStart) {
      nextSummerStart = period.start;
    }
  }

  const start = prevSummerEnd ? addDays(prevSummerEnd, 1) : addDays(date, -300);
  const end = nextSummerStart ?? addDays(date, 300);
  return { start, end };
}

/**
 * Trennlinie zwischen 1. und 2. Halbjahr: Beginn der Winterferien, falls das
 * Bundesland welche hat, sonst der 31. Januar als verbreiteter Näherungswert.
 * Amtliche Zeugnistermine variieren leicht von Land zu Land und Jahr zu Jahr.
 */
export function getHalfYearSplit(
  schoolYearStart: Date,
  schoolYearEnd: Date,
  bundesland: BundeslandCode,
): Date {
  const winter = getHolidayPeriods(bundesland).find(
    (p) =>
      p.name === "Winterferien" &&
      p.start.getTime() > schoolYearStart.getTime() &&
      p.start.getTime() < schoolYearEnd.getTime(),
  );
  if (winter) return winter.start;

  const janYear =
    schoolYearStart.getMonth() >= 6
      ? schoolYearStart.getFullYear() + 1
      : schoolYearStart.getFullYear();
  return withMinutes(new Date(janYear, 0, 31), 0);
}

export function getHalfYearBounds(
  date: Date,
  bundesland: BundeslandCode,
): { start: Date; end: Date; label: "1. Halbjahr" | "2. Halbjahr" } {
  const { start, end } = getSchoolYearBounds(date, bundesland);
  const split = getHalfYearSplit(start, end, bundesland);
  if (date.getTime() < split.getTime()) {
    return { start, end: split, label: "1. Halbjahr" };
  }
  return { start: split, end, label: "2. Halbjahr" };
}

export function getHalfYearProgress(
  now: Date,
  config: ScheduleConfig,
): { progress: number; label: "1. Halbjahr" | "2. Halbjahr" } {
  const bounds = getHalfYearBounds(now, config.bundesland);
  return { progress: rangeSchoolProgress(now, bounds.start, bounds.end, config), label: bounds.label };
}

export function getUntilVacationProgress(
  now: Date,
  config: ScheduleConfig,
): { progress: number; nextPeriod: HolidayPeriod | null } | null {
  if (getHolidayPeriodContaining(now, config.bundesland)) return null;

  const next = getNextHolidayPeriod(now, config.bundesland);
  const prev = getPreviousHolidayPeriod(now, config.bundesland);
  const yearBounds = getSchoolYearBounds(now, config.bundesland);

  const rangeStart = prev ? addDays(prev.end, 1) : yearBounds.start;
  const rangeEnd = next ? next.start : yearBounds.end;

  return { progress: rangeSchoolProgress(now, rangeStart, rangeEnd, config), nextPeriod: next };
}

export function getVacationInfo(
  now: Date,
  bundesland: BundeslandCode,
): { period: HolidayPeriod; dayIndex: number; totalDays: number; daysRemaining: number } | null {
  const period = getHolidayPeriodContaining(now, bundesland);
  if (!period) return null;
  const totalDays = daysBetweenInclusive(period.start, period.end);
  const dayIndex = clamp(daysBetweenInclusive(period.start, now), 1, totalDays);
  const daysRemaining = totalDays - dayIndex + 1;
  return { period, dayIndex, totalDays, daysRemaining };
}

function buildTermProgress(now: Date, config: ScheduleConfig): TermProgress {
  return {
    week: getWeekProgress(now, config),
    halfYear: getHalfYearProgress(now, config),
    untilVacation: getUntilVacationProgress(now, config),
  };
}

/** Der zentrale Einstiegspunkt: berechnet den vollständigen Zustand zu `now`. */
export function getSnapshot(now: Date, config: ScheduleConfig): Snapshot {
  const dayType = classifyDay(now, config);

  if (dayType === "holiday") {
    const vacation = getVacationInfo(now, config.bundesland);
    return { now, phase: "holiday", vacation: vacation ?? undefined, term: null };
  }

  if (dayType === "weekend" || dayType === "public_holiday") {
    const nextSchoolDay = getNextSchoolDay(now, config);
    const msUntilNextSchool = withMinutes(nextSchoolDay, config.startMinutes).getTime() - now.getTime();
    return {
      now,
      phase: "weekend",
      freeDay: { nextSchoolDay, msUntilNextSchool: Math.max(0, msUntilNextSchool) },
      term: buildTermProgress(now, config),
    };
  }

  const weekday = toWeekday(now);
  if (!weekday) {
    const nextSchoolDay = getNextSchoolDay(now, config);
    const msUntilNextSchool = withMinutes(nextSchoolDay, config.startMinutes).getTime() - now.getTime();
    return {
      now,
      phase: "weekend",
      freeDay: { nextSchoolDay, msUntilNextSchool: Math.max(0, msUntilNextSchool) },
      term: buildTermProgress(now, config),
    };
  }

  const blocks = generateDayBlocks(config, weekday);
  const dayProgress = getDayProgress(now, blocks);
  const term = buildTermProgress(now, config);
  const today = { weekday, blocks, dayProgress };

  const nowMinutes = minutesSinceMidnight(now);
  if (nowMinutes < firstBlockStart(blocks)) {
    const startsAt = withMinutes(now, firstBlockStart(blocks));
    return {
      now,
      phase: "before_school",
      today,
      beforeSchool: { msUntilStart: Math.max(0, startsAt.getTime() - now.getTime()), startsAt },
      term,
    };
  }

  if (nowMinutes >= lastBlockEnd(blocks)) {
    const nextSchoolDay = getNextSchoolDay(now, config);
    const msUntilNextSchool = withMinutes(nextSchoolDay, config.startMinutes).getTime() - now.getTime();
    return {
      now,
      phase: "after_school",
      today,
      freeDay: { nextSchoolDay, msUntilNextSchool: Math.max(0, msUntilNextSchool) },
      term,
    };
  }

  const current = getCurrentBlock(now, blocks);
  if (!current) {
    return { now, phase: "after_school", today, term };
  }

  return {
    now,
    phase: "in_school",
    today,
    block: {
      block: current.block,
      index: current.index,
      progress: getBlockProgress(now, current.block),
      msRemaining: getBlockMsRemaining(now, current.block),
      label: blockLabel(current.block, weekday, config),
    },
    term,
  };
}
