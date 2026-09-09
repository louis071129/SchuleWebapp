import type { Weekday } from "./types";

/** Erzeugt ein lokales Datum (Mitternacht) ohne UTC-Umweg. */
export function dateAt(year: number, month1to12: number, day: number): Date {
  return new Date(year, month1to12 - 1, day, 0, 0, 0, 0);
}

/** Stabiler, zeitzonenfreier Schlüssel "YYYY-MM-DD" aus lokalen Datumsteilen. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return dateAt(y, m, d);
}

/** Lokale Mitternacht des übergebenen Datums, unabhängig von Uhrzeit/DST. */
export function startOfDay(date: Date): Date {
  return dateAt(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}

/** true wenn a an Kalendertagen vor b liegt (Uhrzeit wird ignoriert). */
export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isDayInRange(date: Date, start: Date, end: Date): boolean {
  const d = startOfDay(date).getTime();
  return d >= startOfDay(start).getTime() && d <= startOfDay(end).getTime();
}

/** 1 (Montag) bis 5 (Freitag), oder null am Wochenende. */
export function toWeekday(date: Date): Weekday | null {
  const day = date.getDay();
  return day >= 1 && day <= 5 ? (day as Weekday) : null;
}

/** Montag 00:00 der Woche, in der `date` liegt. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

export function withMinutes(date: Date, minutesFromMidnight: number): Date {
  const d = startOfDay(date);
  d.setMinutes(minutesFromMidnight);
  return d;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
