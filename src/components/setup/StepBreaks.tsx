import type { BreakDefinition } from "@/lib/time-engine/types";
import type { DraftConfig } from "./types";
import { FieldLabel, GhostButton, StepShell } from "./ui";

interface StepBreaksProps {
  draft: DraftConfig;
  onChange: (patch: Partial<DraftConfig>) => void;
}

export function StepBreaks({ draft, onChange }: StepBreaksProps) {
  const updateBreak = (index: number, patch: Partial<BreakDefinition>) => {
    const breaks = draft.breaks.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange({ breaks });
  };

  const removeBreak = (index: number) => {
    onChange({ breaks: draft.breaks.filter((_, i) => i !== index) });
  };

  const addBreak = () => {
    const usedLessons = new Set(draft.breaks.map((b) => b.afterLesson));
    let afterLesson = 1;
    while (usedLessons.has(afterLesson) && afterLesson < draft.lessonsPerDay) afterLesson++;
    onChange({ breaks: [...draft.breaks, { afterLesson, minutes: 15 }] });
  };

  return (
    <StepShell title="Pausen">
      <p className="-mt-2 text-sm text-fg-dim">
        Nach welcher Stunde kommt eine Pause, und wie lang ist sie?
      </p>

      <div className="flex flex-col gap-4">
        {draft.breaks.map((brk, i) => (
          <div key={i} className="flex items-end gap-4">
            <label className="flex flex-1 flex-col gap-2">
              <FieldLabel>Nach Stunde</FieldLabel>
              <select
                value={brk.afterLesson}
                onChange={(e) => updateBreak(i, { afterLesson: Number(e.target.value) })}
                className="w-full border-b border-fg-faint bg-transparent py-2 text-lg text-fg outline-none focus:border-fg"
              >
                {Array.from({ length: draft.lessonsPerDay }, (_, n) => n + 1).map((n) => (
                  <option key={n} value={n} className="bg-bg text-fg">
                    {n}.
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <FieldLabel>Minuten</FieldLabel>
              <input
                type="number"
                min={5}
                max={90}
                value={brk.minutes}
                onChange={(e) => updateBreak(i, { minutes: Number(e.target.value) || 0 })}
                className="w-full border-b border-fg-faint bg-transparent py-2 text-lg text-fg outline-none focus:border-fg"
              />
            </label>
            <button
              type="button"
              onClick={() => removeBreak(i)}
              aria-label="Pause entfernen"
              className="pb-2 text-fg-faint"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {draft.breaks.length < draft.lessonsPerDay && (
        <GhostButton onClick={addBreak}>+ Pause hinzufügen</GhostButton>
      )}
    </StepShell>
  );
}
