import type { Phase } from "@/lib/time-engine/engine";

/**
 * Die vier Bezugsebenen, durch die TAP auf die grosse Zahl schaltet:
 * Block → Tag → Woche → bis Ferien → zurück.
 */
export type ContentLevel = "block" | "day" | "week" | "untilVacation";

const ORDER: ContentLevel[] = ["block", "day", "week", "untilVacation"];

export function availableLevels(phase: Phase, hasToday: boolean): ContentLevel[] {
  return ORDER.filter((level) => {
    if (level === "block") return phase === "in_school" || phase === "before_school";
    if (level === "day") return hasToday;
    return true; // week / untilVacation sind immer verfügbar (Term-Daten existieren)
  });
}

export function defaultLevel(phase: Phase): ContentLevel {
  return phase === "in_school" || phase === "before_school" ? "block" : "week";
}

export function nextLevel(current: ContentLevel, available: ContentLevel[]): ContentLevel {
  if (available.length === 0) return current;
  const idx = ORDER.indexOf(current);
  for (let i = 1; i <= ORDER.length; i++) {
    const candidate = ORDER[(idx + i) % ORDER.length];
    if (available.includes(candidate)) return candidate;
  }
  return current;
}
