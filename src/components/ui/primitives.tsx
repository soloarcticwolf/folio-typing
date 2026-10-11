import type { ReactNode } from "react";

export function Tooltip({
  label,
  align = "center",
  children,
}: {
  label: string;
  align?: "left" | "center" | "right";
  children: ReactNode;
}) {
  const position =
    align === "right"
      ? "right-0"
      : align === "left"
        ? "left-0"
        : "left-1/2 -translate-x-1/2";
  return (
    <span className="group relative inline-flex" title={label}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full z-40 mb-1.5 hidden rounded-md border border-line bg-ink px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white group-hover:block group-focus-within:block ${position}`}
      >
        {label}
      </span>
    </span>
  );
}

export function IconButton({
  label,
  align = "center",
  active = false,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  align?: "left" | "center" | "right";
  active?: boolean;
}) {
  return (
    <Tooltip label={label} align={align}>
      <button
        aria-label={label}
        aria-pressed={active}
        className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center gap-1 rounded-[8px] border px-1.5 text-[13px] font-medium ${
          active
            ? "border-transparent bg-accent text-white"
            : "border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink"
        } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...rest}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[14px] border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent-subtle text-accent">
        {icon}
      </span>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-ink-2">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-[13px] text-ink-2">
      <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      {label}
    </span>
  );
}
