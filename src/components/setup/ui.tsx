import type { ReactNode } from "react";

export function StepShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <h1 className="text-2xl font-medium text-fg">{title}</h1>
      <div className="flex flex-1 flex-col gap-6">{children}</div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-fg-dim">
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full bg-fg py-3.5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-bg disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-center text-[12px] font-medium uppercase tracking-[0.16em] text-fg-dim"
    >
      {children}
    </button>
  );
}

export const inputClass =
  "w-full border-b border-fg-faint bg-transparent py-2 text-lg text-fg outline-none focus:border-fg";
