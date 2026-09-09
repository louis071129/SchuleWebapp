import type { BreakDefinition, BundeslandCode, Weekday } from "@/lib/time-engine/types";

export interface DraftConfig {
  startTime: string;
  lessonMinutes: number;
  lessonsPerDay: number;
  breaks: BreakDefinition[];
  bundesland: BundeslandCode;
  subjects: Partial<Record<Weekday, Record<number, string>>>;
}

export function defaultBreaksFor(lessonsPerDay: number): BreakDefinition[] {
  const breaks: BreakDefinition[] = [];
  if (lessonsPerDay >= 2) breaks.push({ afterLesson: 2, minutes: 20 });
  if (lessonsPerDay >= 5) breaks.push({ afterLesson: 4, minutes: 15 });
  return breaks;
}
