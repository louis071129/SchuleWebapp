import { describe, expect, it } from "vitest";
import {
  easterSunday,
  getHolidayPeriodContaining,
  getHolidayPeriods,
  getNextHolidayPeriod,
  getPreviousHolidayPeriod,
  getPublicHolidays,
  isPublicHoliday,
} from "../holidays";
import { at } from "./fixtures";

describe("easterSunday", () => {
  it("berechnet bekannte Ostertermine korrekt", () => {
    // Referenzwerte (amtlich bekannt)
    expect(easterSunday(2024).toDateString()).toBe(at(2024, 3, 31).toDateString());
    expect(easterSunday(2025).toDateString()).toBe(at(2025, 4, 20).toDateString());
    expect(easterSunday(2026).toDateString()).toBe(at(2026, 4, 5).toDateString());
    expect(easterSunday(2027).toDateString()).toBe(at(2027, 3, 28).toDateString());
    expect(easterSunday(2028).toDateString()).toBe(at(2028, 4, 16).toDateString());
  });
});

describe("getPublicHolidays", () => {
  it("enthält bundesweite Feiertage", () => {
    const holidays = getPublicHolidays(2027, "NW");
    const names = holidays.map((h) => h.name);
    expect(names).toContain("Neujahr");
    expect(names).toContain("Tag der Arbeit");
    expect(names).toContain("Tag der Deutschen Einheit");
    expect(names).toContain("1. Weihnachtsfeiertag");
  });

  it("berücksichtigt landesspezifische Feiertage", () => {
    const nw = getPublicHolidays(2027, "NW").map((h) => h.name);
    expect(nw).toContain("Fronleichnam");
    expect(nw).toContain("Allerheiligen");

    const be = getPublicHolidays(2027, "BE").map((h) => h.name);
    expect(be).not.toContain("Fronleichnam");
    expect(be).toContain("Internationaler Frauentag");

    const sn = getPublicHolidays(2027, "SN").map((h) => h.name);
    expect(sn).toContain("Buß- und Bettag");
  });

  it("Buß- und Bettag fällt immer auf einen Mittwoch zwischen dem 16. und 22.11.", () => {
    for (const year of [2026, 2027, 2028, 2029, 2030]) {
      const holiday = getPublicHolidays(year, "SN").find((h) => h.name === "Buß- und Bettag")!;
      expect(holiday.date.getDay()).toBe(3);
      expect(holiday.date.getDate()).toBeGreaterThanOrEqual(16);
      expect(holiday.date.getDate()).toBeLessThanOrEqual(22);
    }
  });
});

describe("isPublicHoliday", () => {
  it("erkennt Neujahr", () => {
    expect(isPublicHoliday(at(2027, 1, 1), "NW")?.name).toBe("Neujahr");
  });

  it("erkennt normale Schultage nicht als Feiertag", () => {
    expect(isPublicHoliday(at(2027, 9, 15), "NW")).toBeNull();
  });
});

describe("Ferienzeiträume", () => {
  it("liefert sortierte Zeiträume", () => {
    const periods = getHolidayPeriods("NW");
    for (let i = 1; i < periods.length; i++) {
      expect(periods[i].start.getTime()).toBeGreaterThanOrEqual(periods[i - 1].start.getTime());
    }
  });

  it("erkennt einen Tag innerhalb der Herbstferien", () => {
    const period = getHolidayPeriodContaining(at(2026, 10, 15), "NW");
    expect(period?.name).toBe("Herbstferien");
  });

  it("liefert null außerhalb aller Ferien", () => {
    expect(getHolidayPeriodContaining(at(2026, 9, 15), "NW")).toBeNull();
  });

  it("findet den nächsten Ferienzeitraum", () => {
    const next = getNextHolidayPeriod(at(2026, 9, 15), "NW");
    expect(next?.name).toBe("Herbstferien");
    expect(next?.start.toDateString()).toBe(at(2026, 10, 12).toDateString());
  });

  it("findet den vorherigen Ferienzeitraum", () => {
    const prev = getPreviousHolidayPeriod(at(2026, 11, 1), "NW");
    expect(prev?.name).toBe("Herbstferien");
  });

  it("liefert null, wenn es keinen vorherigen Zeitraum gibt", () => {
    const prev = getPreviousHolidayPeriod(at(2026, 6, 1), "NW");
    expect(prev).toBeNull();
  });

  it("findet die Sommerferien als vorherigen Zeitraum im September", () => {
    const prev = getPreviousHolidayPeriod(at(2026, 9, 1), "NW");
    expect(prev?.name).toBe("Sommerferien");
  });
});
