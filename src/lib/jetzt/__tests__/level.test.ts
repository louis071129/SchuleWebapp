import { describe, expect, it } from "vitest";
import { availableLevels, defaultLevel, nextLevel } from "../level";

describe("availableLevels", () => {
  it("bietet alle vier Ebenen während des Unterrichts", () => {
    expect(availableLevels("in_school", true)).toEqual(["block", "day", "week", "untilVacation"]);
  });

  it("bietet vor der Schule Block, Tag, Woche, bis Ferien", () => {
    expect(availableLevels("before_school", true)).toEqual([
      "block",
      "day",
      "week",
      "untilVacation",
    ]);
  });

  it("lässt Block nach Schulschluss weg", () => {
    expect(availableLevels("after_school", true)).toEqual(["day", "week", "untilVacation"]);
  });

  it("lässt Block und Tag am Wochenende weg", () => {
    expect(availableLevels("weekend", false)).toEqual(["week", "untilVacation"]);
  });
});

describe("defaultLevel", () => {
  it("startet mit Block während des Unterrichts", () => {
    expect(defaultLevel("in_school")).toBe("block");
    expect(defaultLevel("before_school")).toBe("block");
  });

  it("springt nach Schulschluss / am Wochenende auf Woche", () => {
    expect(defaultLevel("after_school")).toBe("week");
    expect(defaultLevel("weekend")).toBe("week");
  });
});

describe("nextLevel", () => {
  it("zyklisiert Block → Tag → Woche → bis Ferien → Block", () => {
    const available = ["block", "day", "week", "untilVacation"] as const;
    expect(nextLevel("block", [...available])).toBe("day");
    expect(nextLevel("day", [...available])).toBe("week");
    expect(nextLevel("week", [...available])).toBe("untilVacation");
    expect(nextLevel("untilVacation", [...available])).toBe("block");
  });

  it("überspringt nicht verfügbare Ebenen (z.B. Wochenende)", () => {
    const available = ["week", "untilVacation"] as const;
    expect(nextLevel("week", [...available])).toBe("untilVacation");
    expect(nextLevel("untilVacation", [...available])).toBe("week");
  });
});
