import type { ArchiveDay } from "./useArchiveData";

const CELL_WIDTH = 14;
const CELL_GAP = 4;
const ROW_HEIGHT = 72;
const ROW_GAP = 7;
const PADDING = 24;

function readColor(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function mixColor(intensity: number, accent: [number, number, number], base: [number, number, number]): string {
  const r = Math.round(base[0] + (accent[0] - base[0]) * intensity);
  const g = Math.round(base[1] + (accent[1] - base[1]) * intensity);
  const b = Math.round(base[2] + (accent[2] - base[2]) * intensity);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Zeichnet die Tagesstreifen-Ansicht auf ein Canvas und löst den PNG-Download aus. */
export function exportArchiveAsPng(weeks: ArchiveDay[][], maxDensity: number): void {
  if (typeof document === "undefined" || weeks.length === 0) return;

  const bg = hexToRgb(readColor("--color-bg", "#0b0b0a"));
  const fgFaint = hexToRgb(readColor("--color-fg-faint", "#35322d"));
  const accent = hexToRgb(readColor("--color-accent", "#ff4a2e"));

  const width = PADDING * 2 + 5 * CELL_WIDTH + 4 * CELL_GAP;
  const height = PADDING * 2 + weeks.length * ROW_HEIGHT + (weeks.length - 1) * ROW_GAP;

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  ctx.fillStyle = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
  ctx.fillRect(0, 0, width, height);

  weeks.forEach((week, weekIndex) => {
    const rowTop = PADDING + weekIndex * (ROW_HEIGHT + ROW_GAP);

    week.forEach((day, dayIndex) => {
      const x = PADDING + dayIndex * (CELL_WIDTH + CELL_GAP);

      if (!day.isSchoolDay || day.blocks.length === 0) {
        ctx.fillStyle = `rgba(${fgFaint[0]}, ${fgFaint[1]}, ${fgFaint[2]}, 0.6)`;
        ctx.fillRect(x, rowTop + ROW_HEIGHT - 6, CELL_WIDTH, 6);
        return;
      }

      const start = day.blocks[0].startMinutes;
      const end = day.blocks[day.blocks.length - 1].endMinutes;
      const totalMinutes = Math.max(1, end - start);
      let cursorY = rowTop;

      day.blocks.forEach((block, blockIndex) => {
        const segmentHeight = ((block.endMinutes - block.startMinutes) / totalMinutes) * ROW_HEIGHT;
        const count = day.blockMarkerCounts[blockIndex] ?? 0;
        const intensity = maxDensity > 0 ? Math.min(1, count / maxDensity) : 0;
        ctx.fillStyle = mixColor(intensity, accent, fgFaint);
        ctx.fillRect(x, cursorY, CELL_WIDTH, Math.max(1, segmentHeight - 1));
        cursorY += segmentHeight;
      });
    });
  });

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "noch-schuljahr.png";
    link.click();
    URL.revokeObjectURL(url);
  });
}
