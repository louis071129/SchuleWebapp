import type { DraftConfig } from "./types";
import { FieldLabel, inputClass, StepShell } from "./ui";

interface StepBasicsProps {
  draft: DraftConfig;
  onChange: (patch: Partial<DraftConfig>) => void;
}

export function StepBasics({ draft, onChange }: StepBasicsProps) {
  return (
    <StepShell title="Der Schultag">
      <label className="flex flex-col gap-2">
        <FieldLabel>Schulbeginn</FieldLabel>
        <input
          type="time"
          value={draft.startTime}
          onChange={(e) => onChange({ startTime: e.target.value })}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <FieldLabel>Stundenlänge (Minuten)</FieldLabel>
        <input
          type="number"
          min={20}
          max={90}
          value={draft.lessonMinutes}
          onChange={(e) => onChange({ lessonMinutes: Number(e.target.value) || 0 })}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <FieldLabel>Stunden pro Tag</FieldLabel>
        <input
          type="number"
          min={1}
          max={12}
          value={draft.lessonsPerDay}
          onChange={(e) => onChange({ lessonsPerDay: Number(e.target.value) || 0 })}
          className={inputClass}
        />
      </label>
    </StepShell>
  );
}
