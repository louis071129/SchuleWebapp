"use client";

import Link from "next/link";
import { useTheme } from "@/lib/hooks/useTheme";

export function TopNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-6 text-[10px] font-medium uppercase tracking-[0.18em] text-fg-faint">
      <Link href="/archiv" className="pointer-events-auto">
        Archiv
      </Link>
      <div className="pointer-events-auto flex items-center gap-5">
        <button type="button" onClick={toggleTheme} aria-label="Darstellung wechseln">
          {theme === "dark" ? "Hell" : "Dunkel"}
        </button>
        <Link href="/ambient">Ambient</Link>
      </div>
    </nav>
  );
}
