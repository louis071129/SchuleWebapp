import { describe, expect, it } from "vitest";
import { generateDayBlocks, firstBlockStart, lastBlockEnd, blockLabel } from "../schedule";
import { standardConfig } from "./fixtures";

describe("generateDayBlocks", () => {
  it("reiht Stunden und Pausen lückenlos aneinander", () => {
    const blocks = generateDayBlocks(standardConfig, 2);

    expect(blocks).toHaveLength(8); // 6 Stunden + 2 Pausen
    expect(blocks[0]).toMatchObject({ type: "lesson", lessonIndex: 1, startMinutes: 480, endMinutes: 525 });
    expect(blocks[1]).toMatchObject({ type: "lesson", lessonIndex: 2, startMinutes: 525, endMinutes: 570 });
    expect(blocks[2]).toMatchObject({ type: "break", afterLesson: 2, startMinutes: 570, endMinutes: 590 });
    expect(blocks[3]).toMatchObject({ type: "lesson", lessonIndex: 3, startMinutes: 590, endMinutes: 635 });
    expect(blocks[4]).toMatchObject({ type: "lesson", lessonIndex: 4, startMinutes: 635, endMinutes: 680 });
    expect(blocks[5]).toMatchObject({ type: "break", afterLesson: 4, startMinutes: 680, endMinutes: 695 });
    expect(blocks[6]).toMatchObject({ type: "lesson", lessonIndex: 5, startMinutes: 695, endMinutes: 740 });
    expect(blocks[7]).toMatchObject({ type: "lesson", lessonIndex: 6, startMinutes: 740, endMinutes: 785 });
  });

  it("hat für jeden Block keine Lücke zum nächsten (cursor lückenlos)", () => {
    const blocks = generateDayBlocks(standardConfig, 2);
    for (let i = 1; i < blocks.length; i++) {
      expect(blocks[i].startMinutes).toBe(blocks[i - 1].endMinutes);
    }
  });

  it("liefert erste Startzeit und letzte Endzeit korrekt", () => {
    const blocks = generateDayBlocks(standardConfig, 2);
    expect(firstBlockStart(blocks)).toBe(480);
    expect(lastBlockEnd(blocks)).toBe(785);
  });

  it("funktioniert ohne Pausen", () => {
    const blocks = generateDayBlocks({ ...standardConfig, breaks: [] }, 2);
    expect(blocks).toHaveLength(6);
    expect(blocks.every((b) => b.type === "lesson")).toBe(true);
  });

  it("übernimmt Fächer nur für den passenden Wochentag", () => {
    const monday = generateDayBlocks(standardConfig, 1);
    const tuesday = generateDayBlocks(standardConfig, 2);
    const firstLessonMonday = monday.find((b) => b.type === "lesson" && b.lessonIndex === 1);
    const firstLessonTuesday = tuesday.find((b) => b.type === "lesson" && b.lessonIndex === 1);
    expect(firstLessonMonday && firstLessonMonday.type === "lesson" && firstLessonMonday.subject).toBe(
      "Mathe",
    );
    expect(
      firstLessonTuesday && firstLessonTuesday.type === "lesson" && firstLessonTuesday.subject,
    ).toBeUndefined();
  });
});

describe("blockLabel", () => {
  it("zeigt Fach an, wenn vorhanden", () => {
    const blocks = generateDayBlocks(standardConfig, 1);
    const lesson1 = blocks[0];
    expect(blockLabel(lesson1, 1, standardConfig)).toBe("1. Stunde · Mathe");
  });

  it("zeigt nur die Stundenzahl ohne Fach", () => {
    const blocks = generateDayBlocks(standardConfig, 2);
    const lesson1 = blocks[0];
    expect(blockLabel(lesson1, 2, standardConfig)).toBe("1. Stunde");
  });

  it("zeigt 'Pause' für Pausenblöcke", () => {
    const blocks = generateDayBlocks(standardConfig, 1);
    const pause = blocks.find((b) => b.type === "break")!;
    expect(blockLabel(pause, 1, standardConfig)).toBe("Pause");
  });
});
