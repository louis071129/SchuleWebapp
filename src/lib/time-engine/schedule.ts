import type { Block, ScheduleConfig, Weekday } from "./types";

/**
 * Erzeugt die Blockfolge eines Schultags (Stunden + Pausen) rein aus der
 * Konfiguration. Die Uhrzeiten sind an jedem Wochentag identisch, nur die
 * Fächer unterscheiden sich.
 */
export function generateDayBlocks(config: ScheduleConfig, weekday: Weekday): Block[] {
  const blocks: Block[] = [];
  let cursor = config.startMinutes;
  const subjectsForDay = config.subjects?.[weekday];

  for (let lesson = 1; lesson <= config.lessonsPerDay; lesson++) {
    const endMinutes = cursor + config.lessonMinutes;
    blocks.push({
      type: "lesson",
      lessonIndex: lesson,
      startMinutes: cursor,
      endMinutes,
      subject: subjectsForDay?.[lesson],
    });
    cursor = endMinutes;

    const pause = config.breaks.find((b) => b.afterLesson === lesson);
    if (pause) {
      const breakEnd = cursor + pause.minutes;
      blocks.push({
        type: "break",
        afterLesson: lesson,
        startMinutes: cursor,
        endMinutes: breakEnd,
      });
      cursor = breakEnd;
    }
  }

  return blocks;
}

export function firstBlockStart(blocks: Block[]): number {
  return blocks[0]?.startMinutes ?? 0;
}

export function lastBlockEnd(blocks: Block[]): number {
  return blocks.length > 0 ? blocks[blocks.length - 1].endMinutes : 0;
}

export function blockLabel(block: Block, weekday: Weekday, config: ScheduleConfig): string {
  if (block.type === "break") {
    return "Pause";
  }
  const subject = config.subjects?.[weekday]?.[block.lessonIndex];
  return subject ? `${block.lessonIndex}. Stunde · ${subject}` : `${block.lessonIndex}. Stunde`;
}
