"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { addMarker } from "@/lib/db/markers-repo";
import { dateKey } from "@/lib/time-engine/calendar";
import type { Snapshot } from "@/lib/time-engine/engine";

interface ZaehButtonProps {
  snapshot: Snapshot;
}

export function ZaehButton({ snapshot }: ZaehButtonProps) {
  const [pulsing, setPulsing] = useState(false);

  if (!snapshot.today) return null;

  const handleTap = () => {
    const now = new Date();
    const currentBlock =
      snapshot.phase === "in_school" && snapshot.block ? snapshot.block.block : null;

    void addMarker({
      timestamp: now.getTime(),
      dateKey: dateKey(now),
      weekday: snapshot.today!.weekday,
      blockType: currentBlock?.type ?? "lesson",
      lessonIndex: currentBlock?.type === "lesson" ? currentBlock.lessonIndex : undefined,
      subject: currentBlock?.type === "lesson" ? currentBlock.subject : undefined,
    });

    setPulsing(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    setTimeout(() => setPulsing(false), 350);
  };

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      whileTap={{ scale: 0.9 }}
      animate={pulsing ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      aria-label="Diesen Moment als zäh markieren"
      className="fixed bottom-6 right-6 flex h-11 items-center justify-center rounded-full border border-fg-faint px-5 text-[11px] font-medium uppercase tracking-[0.18em] text-fg-dim active:text-fg"
    >
      zäh
    </motion.button>
  );
}
