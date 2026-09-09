import { describe, expect, it } from "vitest";
import { computeHeatmapAnalytics } from "../heatmap";
import type { Marker } from "@/lib/db/schema";

function marker(overrides: Partial<Marker>): Marker {
  return {
    id: Math.random(),
    timestamp: Date.now(),
    dateKey: "2026-09-14",
    weekday: 1,
    blockType: "lesson",
    ...overrides,
  };
}

describe("computeHeatmapAnalytics", () => {
  it("liefert leere Auswertung ohne Marker", () => {
    const result = computeHeatmapAnalytics([], 6);
    expect(result.totalMarkers).toBe(0);
    expect(result.toughestSubject).toBeNull();
    expect(result.hardPhaseText).toBeNull();
    expect(result.heatmap).toHaveLength(30); // 5 Wochentage x 6 Stunden
  });

  it("findet das zähste Fach", () => {
    const markers = [
      marker({ subject: "Mathe", lessonIndex: 1 }),
      marker({ subject: "Mathe", lessonIndex: 1 }),
      marker({ subject: "Sport", lessonIndex: 2 }),
    ];
    const result = computeHeatmapAnalytics(markers, 6);
    expect(result.toughestSubject).toEqual({ value: "Mathe", count: 2 });
  });

  it("findet den zähsten Wochentag über alle Blocktypen", () => {
    const markers = [
      marker({ weekday: 2, blockType: "lesson", lessonIndex: 1 }),
      marker({ weekday: 2, blockType: "break" }),
      marker({ weekday: 1, blockType: "lesson", lessonIndex: 1 }),
    ];
    const result = computeHeatmapAnalytics(markers, 6);
    expect(result.toughestWeekday).toEqual({ value: 2, count: 2 });
  });

  it("zählt Pausen-Marker nicht in die Stunden-Heatmap", () => {
    const markers = [marker({ blockType: "break" })];
    const result = computeHeatmapAnalytics(markers, 6);
    expect(result.maxCellCount).toBe(0);
    expect(result.toughestLessonIndex).toBeNull();
  });

  it("baut den Heatmap-Grid für alle Kombinationen, auch mit 0", () => {
    const result = computeHeatmapAnalytics([marker({ weekday: 1, lessonIndex: 1 })], 3);
    expect(result.heatmap).toHaveLength(15); // 5 x 3
    const cell = result.heatmap.find((c) => c.weekday === 1 && c.lessonIndex === 1);
    expect(cell?.count).toBe(1);
    const emptyCell = result.heatmap.find((c) => c.weekday === 5 && c.lessonIndex === 3);
    expect(emptyCell?.count).toBe(0);
  });

  it("liefert keinen Fazit-Text unter der Mindestanzahl", () => {
    const markers = Array.from({ length: 4 }, () => marker({ weekday: 2, lessonIndex: 5 }));
    const result = computeHeatmapAnalytics(markers, 6);
    expect(result.hardPhaseText).toBeNull();
  });

  it("kombiniert zwei benachbarte starke Stunden im Fazit-Text", () => {
    const markers = [
      ...Array.from({ length: 5 }, () => marker({ weekday: 2, lessonIndex: 5 })),
      ...Array.from({ length: 4 }, () => marker({ weekday: 2, lessonIndex: 6 })),
      marker({ weekday: 1, lessonIndex: 1 }),
    ];
    const result = computeHeatmapAnalytics(markers, 6);
    expect(result.hardPhaseText).toBe("Deine harte Phase: Dienstag, 5. und 6. Stunde");
  });

  it("nennt nur eine Stunde, wenn die zweite deutlich abfällt", () => {
    const markers = [
      ...Array.from({ length: 10 }, () => marker({ weekday: 4, lessonIndex: 2 })),
      marker({ weekday: 4, lessonIndex: 6 }),
      marker({ weekday: 1, lessonIndex: 1 }),
    ];
    const result = computeHeatmapAnalytics(markers, 6);
    expect(result.hardPhaseText).toBe("Deine harte Phase: Donnerstag, 2. Stunde");
  });
});
