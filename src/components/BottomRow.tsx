import { roundToStep } from "@/lib/time-engine/format";
import type { TermProgress } from "@/lib/time-engine/engine";

interface BottomRowProps {
  term: TermProgress;
}

export function BottomRow({ term }: BottomRowProps) {
  const items: Array<{ label: string; value: number }> = [
    { label: "Woche", value: term.week },
    { label: term.halfYear.label, value: term.halfYear.progress },
    { label: "bis Ferien", value: term.untilVacation?.progress ?? 0 },
  ];

  return (
    <div className="grid w-full grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1.5">
          <span className="tabular-nums text-lg font-medium text-fg-dim">
            {roundToStep(item.value)}%
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-fg-faint">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
