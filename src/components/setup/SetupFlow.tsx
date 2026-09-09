"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveConfig } from "@/lib/db/config-repo";
import { DEFAULT_BUNDESLAND } from "@/lib/time-engine/bundesland";
import { parseTimeToMinutes } from "@/lib/time-engine/format";
import type { ScheduleConfig } from "@/lib/time-engine/types";
import { StepBasics } from "./StepBasics";
import { StepBreaks } from "./StepBreaks";
import { StepBundesland } from "./StepBundesland";
import { StepSubjects } from "./StepSubjects";
import { defaultBreaksFor, type DraftConfig } from "./types";
import { GhostButton, PrimaryButton } from "./ui";

const STEPS = ["basics", "breaks", "bundesland", "subjects"] as const;
type Step = (typeof STEPS)[number];

const INITIAL_DRAFT: DraftConfig = {
  startTime: "08:00",
  lessonMinutes: 45,
  lessonsPerDay: 6,
  breaks: defaultBreaksFor(6),
  bundesland: DEFAULT_BUNDESLAND,
  subjects: {},
};

export function SetupFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<DraftConfig>(INITIAL_DRAFT);
  const [saving, setSaving] = useState(false);

  const step: Step = STEPS[stepIndex];

  const patch = (p: Partial<DraftConfig>) => {
    setDraft((current) => {
      const next = { ...current, ...p };
      if (p.lessonsPerDay !== undefined && p.lessonsPerDay !== current.lessonsPerDay) {
        next.breaks = next.breaks.filter((b) => b.afterLesson < next.lessonsPerDay + 1);
      }
      return next;
    });
  };

  const finish = async (subjects: DraftConfig["subjects"]) => {
    setSaving(true);
    const schedule: ScheduleConfig = {
      startMinutes: parseTimeToMinutes(draft.startTime),
      lessonMinutes: draft.lessonMinutes,
      lessonsPerDay: draft.lessonsPerDay,
      breaks: draft.breaks,
      bundesland: draft.bundesland,
      subjects,
    };
    await saveConfig({ schedule, setupComplete: true });
    router.push("/");
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
    else void finish(draft.subjects);
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center bg-bg px-6 pb-10 pt-10">
      <div className="flex w-full max-w-md flex-1 flex-col">
        <div className="mb-8 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-[2px] flex-1 rounded-full ${i <= stepIndex ? "bg-fg" : "bg-fg-faint"}`}
            />
          ))}
        </div>

        {step === "basics" && <StepBasics draft={draft} onChange={patch} />}
        {step === "breaks" && <StepBreaks draft={draft} onChange={patch} />}
        {step === "bundesland" && <StepBundesland draft={draft} onChange={patch} />}
        {step === "subjects" && <StepSubjects draft={draft} onChange={patch} />}

        <div className="mt-8 flex flex-col gap-3">
          <PrimaryButton onClick={goNext} disabled={saving}>
            {step === "subjects" ? "Fertig" : "Weiter"}
          </PrimaryButton>
          {step === "subjects" && !saving && (
            <GhostButton onClick={() => void finish({})}>Überspringen</GhostButton>
          )}
          {stepIndex > 0 && !saving && <GhostButton onClick={goBack}>Zurück</GhostButton>}
        </div>
      </div>
    </main>
  );
}
