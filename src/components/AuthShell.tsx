import Link from "next/link";
import { FileText } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-10">
      <div className="dv-pop grid w-full max-w-[880px] overflow-hidden rounded-[18px] border border-line bg-surface shadow-[var(--shadow-card)] md:grid-cols-[1fr_440px]">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-8 md:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent-subtle"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-subtle/60"
          />
          <div className="relative flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-white">
              <FileText size={18} />
            </span>
            <span className="text-[18px] font-bold tracking-tight text-ink">Folio</span>
          </div>
          <div className="relative">
            <FileText size={120} strokeWidth={1} className="mb-5 text-accent/20" />
            <p className="max-w-xs text-[26px] leading-snug font-bold tracking-tight text-ink">
              Your space for thoughtful work.
            </p>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink-2">
              Write, import, share, and export — everything in one focused workspace.
            </p>
          </div>
          <p className="relative text-[11px] text-muted">Secure email &amp; password sign-in.</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8 sm:px-10">
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent text-white">
              <FileText size={16} />
            </span>
            <span className="text-[17px] font-bold text-ink">Folio</span>
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-1 text-[13px] text-ink-2">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-5 border-t border-line pt-4 text-center text-[13px] text-ink-2">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-[10px] border border-destructive/30 bg-destructive/[0.06] px-3 py-2 text-[13px] text-destructive">
      {message}
    </p>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-accent hover:text-accent-hover">
      {children}
    </Link>
  );
}
