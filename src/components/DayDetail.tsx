"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ArchiveDay } from "@/lib/archive/useArchiveData";
import { formatMinutesOfDay } from "@/lib/time-engine/format";

interface DayDetailProps {
  day: ArchiveDay | null;
  onClose: () => void;
}

const WEEKDAY_NAMES: Record<number, string> = {
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
};

export function DayDetail({ day, onClose }: DayDetailProps) {
  return (
    <AnimatePresence>
      {day && (
        <motion.div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-2xl bg-bg-elevated px-6 pb-8 pt-6"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fg-dim">
              {WEEKDAY_NAMES[day.weekday]} · {day.dateKey}
            </p>

            {!day.isSchoolDay ? (
              <p className="mt-4 text-sm text-fg-dim">Kein Schultag.</p>
            ) : (
              <>
                <p className="mt-1 text-sm text-fg-dim">
                  {day.markerCount === 0
                    ? "Keine zäh-Markierungen"
                    : day.markerCount === 1
                      ? "1 zäh-Markierung"
                      : `${day.markerCount} zäh-Markierungen`}
                </p>
                <ul className="mt-5 flex flex-col gap-1.5">
                  {day.blocks.map((block, i) => {
                    const count = day.blockMarkerCounts[i] ?? 0;
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between border-b border-fg-faint/40 py-1.5 text-sm"
                      >
                        <span className="tabular-nums text-fg-dim">
                          {formatMinutesOfDay(block.startMinutes)}
                        </span>
                        <span className="flex-1 px-3 text-fg">
                          {block.type === "break"
                            ? "Pause"
                            : block.subject
                              ? `${block.lessonIndex}. Stunde · ${block.subject}`
                              : `${block.lessonIndex}. Stunde`}
                        </span>
                        <span className="tabular-nums text-fg-dim">{count > 0 ? count : ""}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
