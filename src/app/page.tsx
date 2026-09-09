"use client";

import Link from "next/link";
import { useConfig } from "@/lib/hooks/useConfig";
import { JetztScreen } from "@/components/JetztScreen";

export default function Home() {
  const { config, loading } = useConfig();

  if (loading) {
    return <div className="min-h-[100dvh] bg-bg" />;
  }

  if (!config || !config.setupComplete) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fg-dim">NOCH</p>
        <p className="max-w-xs text-balance text-sm text-fg-dim">
          Noch kein Stundenplan eingerichtet.
        </p>
        <Link
          href="/setup"
          className="rounded-full border border-fg-faint px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-fg"
        >
          Einrichten
        </Link>
      </main>
    );
  }

  return <JetztScreen config={config.schedule} />;
}
