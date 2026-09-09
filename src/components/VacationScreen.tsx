import type { Snapshot } from "@/lib/time-engine/engine";

interface VacationScreenProps {
  vacation: NonNullable<Snapshot["vacation"]>;
}

export function VacationScreen({ vacation }: VacationScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fg-dim">
        {vacation.period.name}
      </p>
      <p className="tabular-nums text-[clamp(3.5rem,18vw,7rem)] font-semibold leading-none tracking-[-0.03em] text-fg">
        {vacation.daysRemaining}
      </p>
      <p className="text-sm text-fg-dim">
        noch {vacation.daysRemaining} von {vacation.totalDays} Tagen
      </p>
    </div>
  );
}
