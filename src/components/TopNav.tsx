import Link from "next/link";

export function TopNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-6 text-[10px] font-medium uppercase tracking-[0.18em] text-fg-faint">
      <Link href="/archiv" className="pointer-events-auto">
        Archiv
      </Link>
      <Link href="/ambient" className="pointer-events-auto">
        Ambient
      </Link>
    </nav>
  );
}
