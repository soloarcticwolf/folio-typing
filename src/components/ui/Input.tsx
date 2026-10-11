import type { InputHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-[13px] font-medium text-ink">
      <span className="mb-1.5 block">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-normal text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs font-normal text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-9 w-full rounded-[10px] border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted hover:border-line-strong focus:border-accent ${className}`}
      {...rest}
    />
  );
}
