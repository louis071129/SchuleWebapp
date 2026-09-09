import { BUNDESLAND_CODES } from "@/lib/time-engine/bundesland";
import { stateName } from "@/lib/time-engine/holidays";
import type { DraftConfig } from "./types";
import { FieldLabel, inputClass, StepShell } from "./ui";

interface StepBundeslandProps {
  draft: DraftConfig;
  onChange: (patch: Partial<DraftConfig>) => void;
}

export function StepBundesland({ draft, onChange }: StepBundeslandProps) {
  return (
    <StepShell title="Bundesland">
      <p className="-mt-2 text-sm text-fg-dim">Für die richtigen Ferientermine.</p>
      <label className="flex flex-col gap-2">
        <FieldLabel>Bundesland</FieldLabel>
        <select
          value={draft.bundesland}
          onChange={(e) => onChange({ bundesland: e.target.value as DraftConfig["bundesland"] })}
          className={inputClass}
        >
          {BUNDESLAND_CODES.map((code) => (
            <option key={code} value={code} className="bg-bg text-fg">
              {stateName(code)}
            </option>
          ))}
        </select>
      </label>
    </StepShell>
  );
}
