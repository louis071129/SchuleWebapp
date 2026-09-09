"use client";

import { useEffect, useState } from "react";
import { useSnapshot } from "@/lib/hooks/useSnapshot";
import { useMilestones } from "@/lib/hooks/useMilestones";
import { useLongPress } from "@/lib/hooks/useLongPress";
import { deriveView, getExactRemainingMs } from "@/lib/jetzt/derive";
import { availableLevels, defaultLevel, nextLevel, type ContentLevel } from "@/lib/jetzt/level";
import { formatExactRemaining } from "@/lib/time-engine/format";
import type { ScheduleConfig } from "@/lib/time-engine/types";
import { BigNumber } from "./BigNumber";
import { BottomRow } from "./BottomRow";
import { DayBar } from "./DayBar";
import { TopNav } from "./TopNav";
import { VacationScreen } from "./VacationScreen";
import { ZaehButton } from "./ZaehButton";

interface JetztScreenProps {
  config: ScheduleConfig;
}

export function JetztScreen({ config }: JetztScreenProps) {
  const snapshot = useSnapshot(config);
  const [level, setLevel] = useState<ContentLevel>("block");
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (snapshot) setLevel(defaultLevel(snapshot.phase));
    // Ebene beim Phasenwechsel zurücksetzen (z.B. Schulschluss -> Woche).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.phase]);

  const view = snapshot ? deriveView(snapshot, level, config) : null;
  const blockKey = snapshot?.today
    ? `${snapshot.phase}-${snapshot.block?.index ?? "x"}-${snapshot.today.weekday}`
    : (snapshot?.phase ?? "loading");

  const { pulse, halftime } = useMilestones(level, view?.percent ?? 0, blockKey);

  const handleTap = () => {
    if (!snapshot) return;
    const available = availableLevels(snapshot.phase, Boolean(snapshot.today));
    setLevel((current) => nextLevel(current, available));
  };

  const longPress = useLongPress(handleTap, setRevealing);

  if (!snapshot || !view) {
    return <div className="flex min-h-screen flex-col bg-bg" />;
  }

  if (snapshot.phase === "holiday" && snapshot.vacation) {
    return (
      <main className="flex min-h-screen flex-col bg-bg">
        <TopNav />
        <VacationScreen vacation={snapshot.vacation} />
      </main>
    );
  }

  const exactMs = getExactRemainingMs(snapshot, level, snapshot.now);
  const animKey = `${level}-${blockKey}`;

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-bg px-6 pb-4 pt-8 select-none">
      <TopNav />
      <div className="flex w-full max-w-md flex-1 flex-col items-center">
        <p className="min-h-[1.2em] text-center text-[11px] font-medium uppercase tracking-[0.2em] text-fg-dim">
          {view.topLabel}
        </p>

        <div
          {...longPress}
          className="flex flex-1 flex-col items-center justify-center gap-5 text-[clamp(6rem,32vw,11rem)]"
        >
          {revealing && exactMs !== null ? (
            <span className="tabular-nums text-[0.4em] font-semibold leading-none tracking-[-0.03em] text-fg">
              {formatExactRemaining(exactMs)}
            </span>
          ) : (
            <BigNumber percent={view.percent} animKey={animKey} halftime={halftime} pulse={pulse} />
          )}
          {!revealing && view.subtext && (
            <p className="text-[0.13em] font-normal text-fg-dim">{view.subtext}</p>
          )}
        </div>

        <div className="flex w-full flex-col items-center gap-8 pb-14">
          {snapshot.today && (
            <DayBar blocks={snapshot.today.blocks} now={snapshot.now} dayProgress={snapshot.today.dayProgress} />
          )}
          {snapshot.term && <BottomRow term={snapshot.term} />}
        </div>
      </div>

      <ZaehButton snapshot={snapshot} />
    </main>
  );
}
