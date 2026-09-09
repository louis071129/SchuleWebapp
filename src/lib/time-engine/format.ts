import { clamp } from "./calendar";

/**
 * Rundet einen Fortschritt (0..1) auf 5%-Schritte. Bewusst kein glatter
 * Wert: sichtbare Sprünge fühlen sich nach Fortschritt an.
 */
export function roundToStep(progress: number, stepPercent = 5): number {
  const clamped = clamp(progress, 0, 1) * 100;
  const stepped = Math.round(clamped / stepPercent) * stepPercent;
  return clamp(stepped, 0, 100);
}

/**
 * Text für die verbleibende Zeit, auf 5 Minuten gerundet. Unter 5 Minuten
 * bewusst unpräzise: "gleich".
 */
export function formatRemaining(msRemaining: number): string {
  if (msRemaining <= 0) return "gleich";
  const minutes = msRemaining / 60000;
  if (minutes < 5) return "gleich";

  const rounded = Math.round(minutes / 5) * 5;
  if (rounded >= 60) {
    const hours = Math.floor(rounded / 60);
    const restMinutes = rounded % 60;
    const hourLabel = hours === 1 ? "1 Stunde" : `${hours} Stunden`;
    if (restMinutes === 0) return `noch etwa ${hourLabel}`;
    return `noch etwa ${hourLabel} ${restMinutes} Minuten`;
  }
  return `noch etwa ${rounded} Minuten`;
}

/** Sekundengenaue Restzeit für den Long-Press-Reveal. */
export function formatExactRemaining(msRemaining: number): string {
  if (msRemaining <= 0) return "0:00";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatPercent(progress: number): string {
  return `${Math.round(clamp(progress, 0, 1) * 100)}`;
}
