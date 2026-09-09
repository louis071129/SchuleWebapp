import holidaysData from "@/data/holidays/holidays.json";
import { dateAt, isDayInRange, parseDateKey } from "./calendar";
import type { BundeslandCode, HolidayPeriod, PublicHoliday } from "./types";

interface RawPeriod {
  name: string;
  start: string;
  end: string;
}

interface RawStateData {
  name: string;
  periods: RawPeriod[];
}

const rawStates = holidaysData.states as Record<BundeslandCode, RawStateData>;

const periodCache = new Map<BundeslandCode, HolidayPeriod[]>();

/** Alle bekannten Ferienzeiträume eines Bundeslands, chronologisch sortiert. */
export function getHolidayPeriods(bundesland: BundeslandCode): HolidayPeriod[] {
  const cached = periodCache.get(bundesland);
  if (cached) return cached;

  const raw = rawStates[bundesland]?.periods ?? [];
  const periods = raw
    .map((p) => ({ name: p.name, start: parseDateKey(p.start), end: parseDateKey(p.end) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  periodCache.set(bundesland, periods);
  return periods;
}

export function stateName(bundesland: BundeslandCode): string {
  return rawStates[bundesland]?.name ?? bundesland;
}

/** Der Ferienzeitraum, in dem `date` liegt, oder null. */
export function getHolidayPeriodContaining(
  date: Date,
  bundesland: BundeslandCode,
): HolidayPeriod | null {
  const periods = getHolidayPeriods(bundesland);
  for (const period of periods) {
    if (isDayInRange(date, period.start, period.end)) return period;
  }
  return null;
}

/** Der nächste Ferienzeitraum, dessen Start nach `date` liegt. */
export function getNextHolidayPeriod(
  date: Date,
  bundesland: BundeslandCode,
): HolidayPeriod | null {
  const periods = getHolidayPeriods(bundesland);
  for (const period of periods) {
    if (period.start.getTime() > date.getTime()) return period;
  }
  return null;
}

/** Der zuletzt beendete Ferienzeitraum vor oder an `date`. */
export function getPreviousHolidayPeriod(
  date: Date,
  bundesland: BundeslandCode,
): HolidayPeriod | null {
  const periods = getHolidayPeriods(bundesland);
  let previous: HolidayPeriod | null = null;
  for (const period of periods) {
    if (period.end.getTime() < date.getTime()) {
      previous = period;
    } else {
      break;
    }
  }
  return previous;
}

/** Gauß'sche Osterformel, liefert den Ostersonntag eines Jahres (lokale Zeit). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return dateAt(year, month, day);
}

function addDaysTo(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const STATES_WITH_FRONLEICHNAM = new Set<BundeslandCode>([
  "BW",
  "BY",
  "HE",
  "NW",
  "RP",
  "SL",
]);

const STATES_WITH_REFORMATIONSTAG = new Set<BundeslandCode>([
  "BB",
  "MV",
  "SN",
  "ST",
  "TH",
  "HB",
  "HH",
  "NI",
  "SH",
]);

const STATES_WITH_ALLERHEILIGEN = new Set<BundeslandCode>(["BW", "BY", "NW", "RP", "SL"]);

/** Gesetzliche Feiertage eines Bundeslands in einem Kalenderjahr. */
export function getPublicHolidays(year: number, bundesland: BundeslandCode): PublicHoliday[] {
  const easter = easterSunday(year);
  const holidays: PublicHoliday[] = [
    { name: "Neujahr", date: dateAt(year, 1, 1) },
    { name: "Karfreitag", date: addDaysTo(easter, -2) },
    { name: "Ostermontag", date: addDaysTo(easter, 1) },
    { name: "Tag der Arbeit", date: dateAt(year, 5, 1) },
    { name: "Christi Himmelfahrt", date: addDaysTo(easter, 39) },
    { name: "Pfingstmontag", date: addDaysTo(easter, 50) },
    { name: "Tag der Deutschen Einheit", date: dateAt(year, 10, 3) },
    { name: "1. Weihnachtsfeiertag", date: dateAt(year, 12, 25) },
    { name: "2. Weihnachtsfeiertag", date: dateAt(year, 12, 26) },
  ];

  if (STATES_WITH_FRONLEICHNAM.has(bundesland)) {
    holidays.push({ name: "Fronleichnam", date: addDaysTo(easter, 60) });
  }
  if (STATES_WITH_REFORMATIONSTAG.has(bundesland)) {
    holidays.push({ name: "Reformationstag", date: dateAt(year, 10, 31) });
  }
  if (STATES_WITH_ALLERHEILIGEN.has(bundesland)) {
    holidays.push({ name: "Allerheiligen", date: dateAt(year, 11, 1) });
  }
  if (bundesland === "BE") {
    holidays.push({ name: "Internationaler Frauentag", date: dateAt(year, 3, 8) });
  }
  if (bundesland === "TH") {
    holidays.push({ name: "Weltkindertag", date: dateAt(year, 9, 20) });
  }
  if (bundesland === "SN") {
    holidays.push({ name: "Buß- und Bettag", date: buessUndBettag(year) });
  }

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Mittwoch vor dem 23. November, liegt stets zwischen dem 16. und 22.11. */
function buessUndBettag(year: number): Date {
  const nov22 = dateAt(year, 11, 22);
  const diffToWednesday = (nov22.getDay() - 3 + 7) % 7;
  return addDaysTo(nov22, -diffToWednesday);
}

export function isPublicHoliday(date: Date, bundesland: BundeslandCode): PublicHoliday | null {
  const holidays = getPublicHolidays(date.getFullYear(), bundesland);
  const found = holidays.find((h) => isDayInRange(date, h.date, h.date));
  return found ?? null;
}
