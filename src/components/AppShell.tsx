"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  LayoutGrid,
  User,
  Users,
  Menu,
  X,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/actions/auth";

const NAV = [
  { key: "all", label: "All documents", href: "/docs", icon: LayoutGrid },
  { key: "owned", label: "Owned by me", href: "/docs?filter=owned", icon: User },
  { key: "shared", label: "Shared with me", href: "/docs?filter=shared", icon: Users },
] as const;

function Brand({ email }: { email: string }) {
  return (
    <Link href="/docs" className="flex items-center gap-2.5 rounded-[10px] p-1">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent text-white shadow-[var(--shadow-subtle)]">
        <FileText size={17} strokeWidth={2.2} />
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] leading-tight font-bold tracking-tight text-ink">
          Folio
        </span>
        <span className="block truncate text-[11px] text-muted">{email}</span>
      </span>
    </Link>
  );
}

function NavList({ active, onNavigate }: { active: string | null; onNavigate?: () => void }) {
  return (
    <nav aria-label="Documents" className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13px] font-medium ${
              isActive
                ? "bg-accent-subtle text-ink"
                : "text-ink-2 hover:bg-ink/[0.05] hover:text-ink"
            }`}
          >
            <Icon size={16} className={isActive ? "text-accent" : "text-muted"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onLogout = async () => {
    setBusy(true);
    try {
      await logoutAction();
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      {open && (
        <button
          aria-label="Close account menu"
          className="fixed inset-0 z-30 cursor-default bg-transparent"
          onClick={() => setOpen(false)}
          tabIndex={-1}
        />
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-[10px] border border-line bg-surface px-2.5 py-2 text-left hover:border-line-strong"
      >
        <Avatar name={name || email} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">
            {name || email}
          </span>
          <span className="block truncate text-[11px] text-muted">{email}</span>
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-muted" />
      </button>
      {open && (
        <div role="menu" className="dv-pop absolute right-0 bottom-full z-40 mb-2 w-full rounded-[12px] border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]">
          <div className="border-b border-line px-2.5 py-2">
            <p className="truncate text-[13px] font-medium text-ink">{name || "Account"}</p>
            <p className="truncate text-[11px] text-muted">{email}</p>
          </div>
          <button
            role="menuitem"
            onClick={() => void onLogout()}
            disabled={busy}
            className="mt-1 flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-[13px] text-ink-2 hover:bg-surface-2 hover:text-destructive disabled:opacity-50"
          >
            <LogOut size={15} />
            {busy ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const active = pathname === "/docs" ? (searchParams.get("filter") ?? "all") : null;

  return (
    <div className="flex min-h-screen bg-app">
      {/* Desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-sidebar md:flex">
        <div className="px-3 pt-4 pb-2">
          <Brand email={email} />
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-3 py-2">
          <NavList active={active} />
        </div>
        <div className="border-t border-line p-3">
          <AccountMenu name={name} email={email} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="dv-fade absolute inset-0 bg-ink/30" onClick={() => setDrawer(false)} />
          <div className="dv-pop absolute top-0 left-0 flex h-full w-[270px] flex-col border-r border-line bg-sidebar shadow-[var(--shadow-pop)]">
            <div className="flex items-center justify-between px-3 pt-4 pb-2">
              <Brand email={email} />
              <button
                onClick={() => setDrawer(false)}
                aria-label="Close navigation"
                className="rounded-md p-1.5 text-ink-2 hover:bg-ink/[0.05]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <NavList active={active} onNavigate={() => setDrawer(false)} />
            </div>
            <div className="border-t border-line p-3">
              <AccountMenu name={name} email={email} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-app/90 px-3 backdrop-blur md:hidden">
          <button
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
            className="rounded-md p-2 text-ink-2 hover:bg-ink/[0.05]"
          >
            <Menu size={19} />
          </button>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent text-white">
            <FileText size={15} />
          </span>
          <span className="text-[16px] font-bold text-ink">Folio</span>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
