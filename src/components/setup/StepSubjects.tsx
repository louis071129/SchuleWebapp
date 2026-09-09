"use client";

import { useState } from "react";
import type { Weekday } from "@/lib/time-engine/types";
import type { DraftConfig } from "./types";
import { FieldLabel, StepShell } from "./ui";

interface StepSubjectsProps {
  draft: DraftConfig;
  onChange: (patch: Partial<DraftConfig>) => void;
}

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 1, label: "Mo" },
  { value: 2, label: "Di" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Do" },
  { value: 5, label: "Fr" },
];

export function StepSubjects({ draft, onChange }: StepSubjectsProps) {
  const [activeDay, setActiveDay] = useState<Weekday>(1);

  const setSubject = (lessonIndex: number, value: string) => {
    const dayEntries = { ...(draft.subjects[activeDay] ?? {}) };
    if (value.trim() === "") delete dayEntries[lessonIndex];
    else dayEntries[lessonIndex] = value;
    onChange({ subjects: { ...draft.subjects, [activeDay]: dayEntries } });
  };

  return (
    <StepShell title="Fächer">
      <p className="-mt-2 text-sm text-fg-dim">
        Optional. Kann auch komplett übersprungen werden.
      </p>

      <div className="flex gap-5">
        {WEEKDAYS.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => setActiveDay(day.value)}
            className={`text-[12px] font-medium uppercase tracking-[0.14em] ${
              activeDay === day.value ? "text-fg" : "text-fg-faint"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto">
        {Array.from({ length: draft.lessonsPerDay }, (_, i) => i + 1).map((lessonIndex) => (
          <label key={lessonIndex} className="flex items-center gap-4">
            <span className="w-6 shrink-0">
              <FieldLabel>{lessonIndex}.</FieldLabel>
            </span>
            <input
              type="text"
              placeholder="—"
              value={draft.subjects[activeDay]?.[lessonIndex] ?? ""}
              onChange={(e) => setSubject(lessonIndex, e.target.value)}
              className="w-full border-b border-fg-faint bg-transparent py-1.5 text-base text-fg outline-none focus:border-fg"
            />
          </label>
        ))}
      </div>
    </StepShell>
  );
}
