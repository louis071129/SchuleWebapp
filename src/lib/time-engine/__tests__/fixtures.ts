import type { ScheduleConfig } from "../types";

/**
 * 6 Stunden, Beginn 8:00, 45 Minuten je Stunde, große Pause nach der 2.
 * (20 Min) und nach der 4. Stunde (15 Min). Ergibt Schulschluss 13:05.
 */
export const standardConfig: ScheduleConfig = {
  startMinutes: 8 * 60,
  lessonMinutes: 45,
  lessonsPerDay: 6,
  breaks: [
    { afterLesson: 2, minutes: 20 },
    { afterLesson: 4, minutes: 15 },
  ],
  bundesland: "NW",
  subjects: {
    1: { 1: "Mathe", 2: "Deutsch", 3: "Englisch", 4: "Sport", 5: "Bio", 6: "Kunst" },
  },
};

export function at(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
  return new Date(year, month - 1, day, hour, minute, second, 0);
}

/** Nächster Wochentag ab (und ggf. einschließlich) `from`. 1=Montag..5=Freitag. */
export function nextWeekday(from: Date, targetDow: number): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== targetDow) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export function withTime(date: Date, hour: number, minute: number, second = 0): Date {
  const d = new Date(date);
  d.setHours(hour, minute, second, 0);
  return d;
}
