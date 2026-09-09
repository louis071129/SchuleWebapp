import { withMinutes } from "@/lib/time-engine/calendar";
import type { Snapshot } from "@/lib/time-engine/engine";
import {
  formatRemaining,
  formatResumeCountdown,
  formatStartCountdown,
  roundToStep,
} from "@/lib/time-engine/format";
import { blockLabel, lastBlockEnd } from "@/lib/time-engine/schedule";
import type { ScheduleConfig } from "@/lib/time-engine/types";
import type { ContentLevel } from "./level";

export interface JetztView {
  topLabel: string;
  percent: number;
  /** Nur bei Block-Ebene während des Unterrichts gefüllt (spec-mandiert). */
  subtext: string | null;
}

export function deriveView(
  snapshot: Snapshot,
  level: ContentLevel,
  config: ScheduleConfig,
): JetztView | null {
  const topLabel = deriveTopLabel(snapshot);

  switch (level) {
    case "block": {
      if (snapshot.phase === "in_school" && snapshot.block) {
        return {
          topLabel,
          percent: roundToStep(snapshot.block.progress),
          subtext: formatRemaining(snapshot.block.msRemaining),
        };
      }
      if (snapshot.phase === "before_school" && snapshot.today) {
        const first = snapshot.today.blocks[0];
        return {
          topLabel,
          percent: 0,
          subtext: first ? blockLabel(first, snapshot.today.weekday, config) : null,
        };
      }
      return null;
    }
    case "day": {
      if (!snapshot.today) return null;
      if (snapshot.phase === "after_school") {
        return { topLabel, percent: 100, subtext: "Schultag beendet" };
      }
      return { topLabel, percent: roundToStep(snapshot.today.dayProgress), subtext: null };
    }
    case "week": {
      if (!snapshot.term) return null;
      return { topLabel, percent: roundToStep(snapshot.term.week), subtext: null };
    }
    case "untilVacation": {
      if (!snapshot.term?.untilVacation) return null;
      const next = snapshot.term.untilVacation.nextPeriod;
      return {
        topLabel,
        percent: roundToStep(snapshot.term.untilVacation.progress),
        subtext: next ? `bis ${next.name}` : null,
      };
    }
  }
}

function deriveTopLabel(snapshot: Snapshot): string {
  if (snapshot.phase === "in_school" && snapshot.block) {
    return snapshot.block.label;
  }
  if (snapshot.phase === "before_school" && snapshot.beforeSchool) {
    return formatStartCountdown(snapshot.beforeSchool.msUntilStart);
  }
  if ((snapshot.phase === "after_school" || snapshot.phase === "weekend") && snapshot.freeDay) {
    return formatResumeCountdown(snapshot.freeDay.msUntilNextSchool);
  }
  return "";
}

/** Exakte Restzeit für den Long-Press-Reveal, oder null wenn nicht sinnvoll. */
export function getExactRemainingMs(
  snapshot: Snapshot,
  level: ContentLevel,
  now: Date,
): number | null {
  if (level === "block") {
    if (snapshot.phase === "in_school" && snapshot.block) return snapshot.block.msRemaining;
    if (snapshot.phase === "before_school" && snapshot.beforeSchool) {
      return snapshot.beforeSchool.msUntilStart;
    }
    return null;
  }
  if (level === "day") {
    if (!snapshot.today) return null;
    if (snapshot.phase === "after_school") return 0;
    const end = withMinutes(now, lastBlockEnd(snapshot.today.blocks));
    return Math.max(0, end.getTime() - now.getTime());
  }
  if (snapshot.phase === "after_school" || snapshot.phase === "weekend") {
    return snapshot.freeDay?.msUntilNextSchool ?? null;
  }
  return null;
}
