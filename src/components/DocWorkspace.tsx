"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCheck, Loader2, AlertTriangle } from "lucide-react";
import DocEditor, { type SaveStatus } from "@/components/DocEditor";
import ShareDialog from "@/components/ShareDialog";
import ExportMenu from "@/components/ExportMenu";
import { RoleBadge } from "@/components/ui/Badge";
import type { DocumentDTO } from "@/models/document.model";

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status.kind === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
        <Loader2 size={13} className="animate-spin" />
        {status.text}
      </span>
    );
  }
  if (status.kind === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-destructive">
        <AlertTriangle size={13} />
        {status.text}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
      <CheckCheck size={13} className="text-success" />
      {status.text}
    </span>
  );
}

export function DocWorkspace({
  doc,
  role,
}: {
  doc: DocumentDTO;
  role: "owner" | "viewer" | "editor";
}) {
  const [status, setStatus] = useState<SaveStatus>({ kind: "saved", text: "Saved" });
  const canEdit = role === "owner" || role === "editor";

  return (
    <div className="pb-16">
      {/* Editor header */}
      <header className="no-print sticky top-0 z-20 border-b border-line bg-app/90 backdrop-blur md:top-0">
        <div className="mx-auto flex h-[62px] w-full max-w-[1160px] items-center gap-2 px-4 sm:px-6 lg:px-8">
          <Link
            href="/docs"
            aria-label="Back to documents"
            className="rounded-md p-2 text-ink-2 hover:bg-ink/[0.05] hover:text-ink"
          >
            <ArrowLeft size={18} />
          </Link>
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] sm:flex">
            <Link href="/docs" className="shrink-0 text-ink-2 hover:text-ink">
              Documents
            </Link>
            <span aria-hidden className="text-muted">/</span>
            <span className="truncate font-medium text-ink">{doc.title || "Untitled"}</span>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SaveIndicator status={status} />
            <ExportMenu docId={doc.id} />
            <ShareDialog docId={doc.id} isOwner={role === "owner"} />
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className="mx-auto w-full max-w-[1160px] px-4 pt-6 sm:px-6 lg:px-8">
        <article className="print-doc mx-auto w-full max-w-[800px] rounded-[14px] border border-line bg-surface px-6 py-8 shadow-[var(--shadow-card)] sm:px-10 md:px-14 md:py-12">
          <RoleBadge role={role} />
          <p className="mt-3 text-[12px] text-muted">
            Updated{" "}
            {new Date(doc.updatedAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            {role !== "owner" && (canEdit ? " · shared with you (can edit)" : " · shared with you (view only)")}
          </p>
          <div className="mt-2">
            <DocEditor
              docId={doc.id}
              initialTitle={doc.title}
              initialJSON={doc.contentJSON}
              canEdit={canEdit}
              onStatus={setStatus}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
