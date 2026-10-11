"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCheck, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import DocEditor, { type SaveStatus } from "@/components/DocEditor";
import ShareDialog from "@/components/ShareDialog";
import ExportMenu from "@/components/ExportMenu";
import { RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Tooltip } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/Toast";
import { deleteDocumentAction } from "@/actions/documents";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { push } = useToast();
  const canEdit = role === "owner" || role === "editor";
  const isOwner = role === "owner";

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteDocumentAction(doc.id);
      push("Document deleted");
      router.push("/docs");
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : "Could not delete document", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

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
            <ShareDialog docId={doc.id} isOwner={isOwner} />
            {isOwner && (
              <Tooltip label="Delete document" align="right">
                <button
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete document"
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              </Tooltip>
            )}
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

      <Dialog
        open={confirmDelete}
        onClose={() => {
          if (!deleting) setConfirmDelete(false);
        }}
        title="Delete document?"
        description={`“${doc.title || "Untitled"}” and its shares will be permanently removed. This cannot be undone.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" disabled={deleting} onClick={() => setConfirmDelete(false)}>
            Keep
          </Button>
          <Button variant="destructive" loading={deleting} onClick={() => void onDelete()}>
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
