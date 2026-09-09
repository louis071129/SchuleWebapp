export type BundeslandCode =
  | "BW"
  | "BY"
  | "BE"
  | "BB"
  | "HB"
  | "HH"
  | "HE"
  | "MV"
  | "NI"
  | "NW"
  | "RP"
  | "SL"
  | "SN"
  | "ST"
  | "SH"
  | "TH";

/** 1 = Montag ... 5 = Freitag. Samstag/Sonntag sind keine Schultage. */
export type Weekday = 1 | 2 | 3 | 4 | 5;

export interface BreakDefinition {
  /** Nach dieser Unterrichtsstunde folgt die Pause. */
  afterLesson: number;
  /** Dauer der Pause in Minuten. */
  minutes: number;
}

export interface ScheduleConfig {
  /** Schulbeginn als Minuten seit Mitternacht. */
  startMinutes: number;
  /** Länge einer Unterrichtsstunde in Minuten. */
  lessonMinutes: number;
  /** Anzahl Stunden pro Tag. */
  lessonsPerDay: number;
  breaks: BreakDefinition[];
  bundesland: BundeslandCode;
  /** Optionale Fächer je Wochentag und Stundenindex. */
  subjects?: Partial<Record<Weekday, Record<number, string>>>;
}

export interface LessonBlock {
  type: "lesson";
  lessonIndex: number;
  startMinutes: number;
  endMinutes: number;
  subject?: string;
}

export interface BreakBlock {
  type: "break";
  afterLesson: number;
  startMinutes: number;
  endMinutes: number;
}

export type Block = LessonBlock | BreakBlock;

export interface HolidayPeriod {
  name: string;
  /** Erster unterrichtsfreier Tag, lokale Kalenderdatum-Grenze. */
  start: Date;
  /** Letzter unterrichtsfreier Tag (inklusive). */
  end: Date;
}

export interface PublicHoliday {
  name: string;
  date: Date;
}
