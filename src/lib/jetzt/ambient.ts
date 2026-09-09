import type { Snapshot } from "@/lib/time-engine/engine";
import { roundToStep } from "@/lib/time-engine/format";

export interface AmbientValue {
  /** Ungerundeter Fortschritt (0..1) für die ruhig fliessende Ring-Animation. */
  raw: number;
  /** Auf 5% gerundet, konsistent mit dem Rest der App. */
  percent: number;
}

/**
 * Ein einzelner, ruhiger Fortschrittswert für den Ambient-Modus: Block
 * während des Unterrichts, sonst Tag, sonst Woche, in den Ferien der
 * Fortschritt durch die Ferienzeit.
 */
export function getAmbientValue(snapshot: Snapshot): AmbientValue {
  if (snapshot.phase === "holiday" && snapshot.vacation) {
    const raw = snapshot.vacation.dayIndex / snapshot.vacation.totalDays;
    return { raw, percent: roundToStep(raw) };
  }
  if (snapshot.phase === "in_school" && snapshot.block) {
    return { raw: snapshot.block.progress, percent: roundToStep(snapshot.block.progress) };
  }
  if (snapshot.phase === "before_school") {
    return { raw: 0, percent: 0 };
  }
  if (snapshot.today) {
    return { raw: snapshot.today.dayProgress, percent: roundToStep(snapshot.today.dayProgress) };
  }
  if (snapshot.term) {
    return { raw: snapshot.term.week, percent: roundToStep(snapshot.term.week) };
  }
  return { raw: 0, percent: 0 };
}
