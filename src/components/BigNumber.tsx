"use client";

import { AnimatePresence, motion } from "framer-motion";

interface BigNumberProps {
  percent: number;
  animKey: string;
  halftime: boolean;
  pulse: boolean;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.6 };

export function BigNumber({ percent, animKey, halftime, pulse }: BigNumberProps) {
  return (
    <div className="relative flex h-[0.85em] items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {halftime ? (
          <motion.span
            key="halftime"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={spring}
            className="text-[0.16em] font-medium uppercase tracking-[0.15em] text-fg"
          >
            Halbzeit
          </motion.span>
        ) : (
          <motion.span
            key={animKey}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: pulse ? 1.02 : 1,
            }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={spring}
            className="tabular-nums font-semibold leading-none tracking-[-0.04em] text-fg"
          >
            {percent}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
