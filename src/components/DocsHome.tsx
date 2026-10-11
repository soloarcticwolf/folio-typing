"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Upload, FileText, FileSearch, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/ui/Badge";
import { EmptyState, SectionHeader } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/Toast";
import { UploadDialog } from "@/components/UploadDialog";
import { createDocumentAction } from "@/actions/documents";
import type { DocumentDTO } from "@/models/document.model";

type Listed = DocumentDTO & { role: "owner" | "viewer" | "editor" };
type Tab = "all" | "owned" | "shared";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All documents" },
  { key: "owned", label: "Owned" },
  { key: "shared", label: "Shared with me" },
];

function formatUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today at ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

export default function DocsHome({
  owned,
  shared,
  initialFilter = "all",
}: {
  owned: Listed[];
  shared: Listed[];
  initialFilter?: Tab;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>(initialFilter);
  const [creating, setCreating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const visible = useMemo(() => {
    const base = tab === "owned" ? owned : tab === "shared" ? shared : [...owned, ...shared];
    const needle = q.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((d) => d.title.toLowerCase().includes(needle));
  }, [owned, shared, q, tab]);

  const selectTab = (t: Tab) => {
    setTab(t);
    const url = t === "all" ? "/docs" : `/docs?filter=${t}`;
    router.replace(url, { scroll: false });
  };

  const onNew = async () => {
    setCreating(true);
    try {
      const doc = await createDocumentAction({ title: "Untitled" });
      push("New document created");
      router.push(`/docs/${doc.id}`);
    } catch (e) {
      push(e instanceof Error ? e.message : "Could not create document", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1160px] px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeader
        title="All documents"
        subtitle="Your documents, all in one place."
        actions={
          <>
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              <Upload size={15} />
              Import
            </Button>
            <Button variant="primary" loading={creating} onClick={() => void onNew()}>
              {!creating && <Plus size={15} />}
              New document
            </Button>
          </>
        }
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Document filters" className="flex gap-1 border-b border-line">
          {TABS.map((t) => {
            const count = t.key === "owned" ? owned.length : t.key === "shared" ? shared.length : owned.length + shared.length;
            const selected = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={selected}
                onClick={() => selectTab(t.key)}
                className={`relative px-3 py-2 text-[13px] font-medium whitespace-nowrap ${
                  selected ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {t.label}
                <span className={`ml-1.5 rounded-full px-1.5 text-[11px] ${selected ? "bg-accent-subtle text-accent" : "bg-ink/[0.06] text-ink-2"}`}>
                  {count}
                </span>
                {selected && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
        <div className="relative sm:w-64">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documents…"
            aria-label="Search documents"
            className="h-9 w-full rounded-[10px] border border-line bg-surface pr-3 pl-9 text-[13px] placeholder:text-muted hover:border-line-strong focus:border-accent"
          />
        </div>
      </div>

      <div className="mt-4">
        {visible.length === 0 ? (
          q.trim() ? (
            <EmptyState
              icon={<FileSearch size={20} />}
              title="No matching documents"
              message={`Nothing matches “${q.trim()}”. Try a different search term.`}
              action={
                <Button variant="secondary" size="sm" onClick={() => setQ("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<FileText size={20} />}
              title={tab === "shared" ? "Nothing shared with you yet" : "No documents yet"}
              message={
                tab === "shared"
                  ? "Documents other people share with you will appear here."
                  : "Create your first document to start writing, or import an existing file."
              }
              action={
                tab !== "shared" ? (
                  <Button variant="primary" size="sm" loading={creating} onClick={() => void onNew()}>
                    {!creating && <Plus size={14} />}
                    Create document
                  </Button>
                ) : undefined
              }
            />
          )
        ) : (
          <ul className="overflow-hidden rounded-[14px] border border-line bg-surface shadow-[var(--shadow-subtle)]">
            {visible.map((d, i) => (
              <li key={d.id} className={i > 0 ? "border-t border-line" : ""}>
                <Link
                  href={`/docs/${d.id}`}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-surface-2"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-surface-2 text-ink-2 group-hover:border-line-strong group-hover:text-accent">
                    <FileText size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {d.title || "Untitled"}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      Updated {formatUpdated(d.updatedAt)}
                    </span>
                  </span>
                  <RoleBadge role={d.role} />
                  <ChevronRight size={16} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink-2" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-[11px] text-muted">
        Supported imports: .txt, .md, .docx (max 5MB). Each upload becomes a new editable document.
      </p>

      <UploadDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(docId) => router.push(`/docs/${docId}`)}
      />
    </div>
  );
}
