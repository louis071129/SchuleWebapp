import { describe, expect, it } from "vitest";
import {
  classifyDay,
  getBlockProgress,
  getCurrentBlock,
  getDayProgress,
  getHalfYearBounds,
  getNextSchoolDay,
  getSchoolYearBounds,
  getSnapshot,
  getUntilVacationProgress,
  getVacationInfo,
  getWeekProgress,
} from "../engine";
import { generateDayBlocks } from "../schedule";
import { at, nextWeekday, standardConfig, withTime } from "./fixtures";

// Montag im September 2026, garantiert außerhalb jeder Ferien-/Feiertagsphase.
const schoolMonday = nextWeekday(at(2026, 9, 1), 1);

describe("classifyDay", () => {
  it("erkennt einen normalen Schultag", () => {
    expect(classifyDay(schoolMonday, standardConfig)).toBe("schoolday");
  });

  it("erkennt Wochenende", () => {
    const saturday = nextWeekday(schoolMonday, 6);
    expect(classifyDay(saturday, standardConfig)).toBe("weekend");
  });

  it("erkennt Ferien", () => {
    expect(classifyDay(at(2026, 10, 15), standardConfig)).toBe("holiday");
  });

  it("erkennt gesetzliche Feiertage außerhalb der Ferien", () => {
    // Fronleichnam 2027 fällt auf Donnerstag, 27. Mai (NW hat Fronleichnam).
    expect(classifyDay(at(2027, 5, 27), standardConfig)).toBe("public_holiday");
  });
});

describe("getCurrentBlock / getBlockProgress", () => {
  const blocks = generateDayBlocks(standardConfig, 1);

  it("liefert null vor Schulbeginn", () => {
    expect(getCurrentBlock(withTime(schoolMonday, 7, 30), blocks)).toBeNull();
  });

  it("liefert null nach Schulschluss", () => {
    expect(getCurrentBlock(withTime(schoolMonday, 14, 0), blocks)).toBeNull();
  });

  it("findet die erste Stunde direkt am Anfang", () => {
    const result = getCurrentBlock(withTime(schoolMonday, 8, 0), blocks);
    expect(result?.block.type).toBe("lesson");
    expect(result?.index).toBe(0);
  });

  it("berechnet 50% mitten in einer Stunde", () => {
    // 1. Stunde 8:00-8:45, Mitte = 8:22:30
    const mid = withTime(schoolMonday, 8, 22, 30);
    const result = getCurrentBlock(mid, blocks)!;
    expect(getBlockProgress(mid, result.block)).toBeCloseTo(0.5, 5);
  });

  it("erkennt eine Pause als eigenen Block", () => {
    // Pause nach der 2. Stunde: 9:30-9:50
    const during = withTime(schoolMonday, 9, 40);
    const result = getCurrentBlock(during, blocks)!;
    expect(result.block.type).toBe("break");
  });

  it("Fortschritt ist 0 exakt am Blockstart und nahe 1 kurz vor Blockende", () => {
    const startTime = withTime(schoolMonday, 8, 0);
    const result = getCurrentBlock(startTime, blocks)!;
    expect(getBlockProgress(startTime, result.block)).toBe(0);

    const almostEnd = withTime(schoolMonday, 8, 44, 30);
    expect(getBlockProgress(almostEnd, result.block)).toBeCloseTo(1, 1);
  });
});

describe("getDayProgress", () => {
  const blocks = generateDayBlocks(standardConfig, 1);

  it("ist 0 vor Schulbeginn", () => {
    expect(getDayProgress(withTime(schoolMonday, 6, 0), blocks)).toBe(0);
  });

  it("ist 1 nach Schulschluss", () => {
    expect(getDayProgress(withTime(schoolMonday, 15, 0), blocks)).toBe(1);
  });

  it("liegt bei ca. 50% zur Tagesmitte", () => {
    // Schultag 8:00-13:05 (305 Min), Mitte bei 10:32:30
    const mid = withTime(schoolMonday, 10, 32, 30);
    expect(getDayProgress(mid, blocks)).toBeCloseTo(0.5, 1);
  });
});

describe("Sonderfälle: vor/nach der Schule, Wochenende, Ferien", () => {
  it("vor Schulbeginn: before_school mit Restzeit", () => {
    const snap = getSnapshot(withTime(schoolMonday, 7, 20), standardConfig);
    expect(snap.phase).toBe("before_school");
    expect(snap.beforeSchool?.msUntilStart).toBe(40 * 60_000);
  });

  it("nach Schulschluss: after_school mit nächstem Schultag", () => {
    const snap = getSnapshot(withTime(schoolMonday, 14, 0), standardConfig);
    expect(snap.phase).toBe("after_school");
    expect(snap.freeDay?.nextSchoolDay.getDay()).toBe(2); // Dienstag
  });

  it("während des Unterrichts: in_school mit Blockdaten", () => {
    const snap = getSnapshot(withTime(schoolMonday, 8, 22, 30), standardConfig);
    expect(snap.phase).toBe("in_school");
    expect(snap.block?.progress).toBeCloseTo(0.5, 5);
  });

  it("Wochenende: eigener Zustand ohne Stundenlogik", () => {
    const saturday = nextWeekday(schoolMonday, 6);
    const snap = getSnapshot(withTime(saturday, 10, 0), standardConfig);
    expect(snap.phase).toBe("weekend");
    expect(snap.block).toBeUndefined();
    expect(snap.freeDay?.nextSchoolDay.getDay()).toBe(1); // nächster Montag
  });

  it("Ferien: eigener Zustand mit Tageszähler, keine Stundenlogik", () => {
    // Herbstferien NW: 2026-10-12 bis 2026-10-24 (13 Tage)
    const snap = getSnapshot(at(2026, 10, 20), standardConfig);
    expect(snap.phase).toBe("holiday");
    expect(snap.vacation?.totalDays).toBe(13);
    expect(snap.vacation?.dayIndex).toBe(9);
    expect(snap.vacation?.daysRemaining).toBe(5);
    expect(snap.term).toBeNull();
  });

  it("Feiertag mitten in der Woche verhält sich wie Wochenende (kein Unterricht)", () => {
    const snap = getSnapshot(withTime(at(2027, 5, 27), 10, 0), standardConfig);
    expect(snap.phase).toBe("weekend");
  });
});

describe("getNextSchoolDay", () => {
  it("überspringt Wochenende", () => {
    const friday = nextWeekday(schoolMonday, 5);
    const next = getNextSchoolDay(friday, standardConfig);
    expect(next.getDay()).toBe(1);
  });

  it("überspringt eine komplette Ferienperiode", () => {
    const lastSchoolDayBeforeBreak = at(2026, 10, 9); // Freitag vor den Herbstferien
    const next = getNextSchoolDay(lastSchoolDayBeforeBreak, standardConfig);
    expect(next.toDateString()).toBe(at(2026, 10, 26).toDateString());
  });
});

describe("rangeSchoolProgress / getWeekProgress", () => {
  it("liegt bei 0 am Montagmorgen vor Schulbeginn", () => {
    const progress = getWeekProgress(withTime(schoolMonday, 6, 0), standardConfig);
    expect(progress).toBeCloseTo(0, 5);
  });

  it("wächst mit jedem vollen Schultag", () => {
    const monday = getWeekProgress(withTime(schoolMonday, 23, 59), standardConfig);
    const tuesday = getWeekProgress(withTime(nextWeekday(schoolMonday, 2), 23, 59), standardConfig);
    expect(tuesday).toBeGreaterThan(monday);
  });

  it("erreicht nahe 1 am Freitagabend", () => {
    const friday = nextWeekday(schoolMonday, 5);
    const progress = getWeekProgress(withTime(friday, 23, 59), standardConfig);
    expect(progress).toBeGreaterThan(0.95);
  });

  it("ein Feiertag verkleinert den Nenner (weniger Schultage in der Woche)", () => {
    // Normale Woche: Mi 23:59 = 3 von 5 Schultagen erledigt -> 0.6
    const normalWednesday = nextWeekday(schoolMonday, 3);
    const normalProgress = getWeekProgress(withTime(normalWednesday, 23, 59), standardConfig);
    expect(normalProgress).toBeCloseTo(0.6, 1);

    // Woche mit Fronleichnam (Do, 27.5.2027): nur 4 Schultage -> Mi 23:59 = 3/4 = 0.75
    const fronleichnamWednesday = at(2027, 5, 26);
    const holidayWeekProgress = getWeekProgress(withTime(fronleichnamWednesday, 23, 59), standardConfig);
    expect(holidayWeekProgress).toBeCloseTo(0.75, 1);
  });
});

describe("getSchoolYearBounds / getHalfYearBounds", () => {
  it("Schuljahr beginnt nach den Sommerferien und endet mit den nächsten", () => {
    const bounds = getSchoolYearBounds(schoolMonday, "NW");
    // NW Sommerferien 2027 beginnen am 05.07.2027 -> Schuljahresende
    expect(bounds.end.toDateString()).toBe(at(2027, 7, 5).toDateString());
  });

  it("Halbjahr wechselt an einer sinnvollen Stelle im Winter", () => {
    const bounds = getHalfYearBounds(schoolMonday, "NW");
    expect(bounds.label).toBe("1. Halbjahr");
    expect(bounds.start.getTime()).toBeLessThan(bounds.end.getTime());
  });
});

describe("getUntilVacationProgress", () => {
  it("ist null während der Ferien", () => {
    expect(getUntilVacationProgress(at(2026, 10, 15), standardConfig)).toBeNull();
  });

  it("zeigt den nächsten Ferienzeitraum außerhalb der Ferien", () => {
    const result = getUntilVacationProgress(schoolMonday, standardConfig);
    expect(result?.nextPeriod?.name).toBe("Herbstferien");
    expect(result?.progress).toBeGreaterThanOrEqual(0);
    expect(result?.progress).toBeLessThanOrEqual(1);
  });
});

describe("getVacationInfo", () => {
  it("noch 9 von 14 Tagen o.ä. - Tag 1 ist der erste Ferientag", () => {
    const info = getVacationInfo(at(2026, 10, 12), "NW");
    expect(info?.dayIndex).toBe(1);
    expect(info?.totalDays).toBe(13);
    expect(info?.daysRemaining).toBe(13);
  });

  it("letzter Ferientag: daysRemaining ist 1", () => {
    const info = getVacationInfo(at(2026, 10, 24), "NW");
    expect(info?.daysRemaining).toBe(1);
  });
});
