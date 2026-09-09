import { describe, expect, it } from "vitest";
import { getArchiveDayList, groupIntoWeeks } from "../days";
import { at } from "@/lib/time-engine/__tests__/fixtures";
import type { ScheduleConfig } from "@/lib/time-engine/types";

const config: ScheduleConfig = {
  startMinutes: 480,
  lessonMinutes: 45,
  lessonsPerDay: 6,
  breaks: [{ afterLesson: 2, minutes: 20 }],
  bundesland: "NW",
};

describe("getArchiveDayList", () => {
  it("enthält nur Wochentage (Mo-Fr)", () => {
    const days = getArchiveDayList(config, at(2026, 9, 14));
    expect(days.every((d) => d.weekday >= 1 && d.weekday <= 5)).toBe(true);
  });

  it("markiert Ferientage als keine Schultage ohne Blöcke", () => {
    const days = getArchiveDayList(config, at(2026, 10, 15));
    const herbstferienTag = days.find((d) => d.dateKey === "2026-10-15");
    expect(herbstferienTag?.isSchoolDay).toBe(false);
    expect(herbstferienTag?.blocks).toHaveLength(0);
  });

  it("erzeugt Blöcke für echte Schultage", () => {
    const days = getArchiveDayList(config, at(2026, 9, 14));
    const schoolDay = days.find((d) => d.isSchoolDay);
    expect(schoolDay?.blocks.length).toBeGreaterThan(0);
  });

  it("endet mit dem heutigen Tag", () => {
    const now = at(2026, 9, 14);
    const days = getArchiveDayList(config, now);
    const last = days[days.length - 1];
    expect(last.dateKey <= "2026-09-14").toBe(true);
    // letzter Eintrag ist entweder heute oder der Freitag derselben Woche,
    // je nachdem ob "heute" ein Wochentag ist.
  });
});

describe("groupIntoWeeks", () => {
  it("gruppiert in 5er-Blöcke", () => {
    const days = getArchiveDayList(config, at(2026, 9, 14));
    const weeks = groupIntoWeeks(days);
    for (const week of weeks.slice(0, -1)) {
      expect(week).toHaveLength(5);
      expect(week.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5]);
    }
  });
});
