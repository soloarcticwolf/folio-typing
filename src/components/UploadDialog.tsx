"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileUp } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { parseAndImportAction } from "@/actions/parseFile";

const ACCEPT = ".txt,.md,.docx";
const MAX_SIZE = 5 * 1024 * 1024;

function validateFile(f: File): string | null {
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  if (!["txt", "md", "docx"].includes(ext)) return "Only .txt, .md, and .docx files are supported.";
  if (f.size > MAX_SIZE) return "File is too large. Maximum size is 5MB.";
  if (f.size === 0) return "File appears to be empty.";
  return null;
}

export function UploadDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (docId: string) => void;
}) {
  const { push } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async (f: File) => {
    const problem = validateFile(f);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", f);
      const { docId } = await parseAndImportAction(fd);
      push("Document imported");
      onClose();
      onImported(docId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!busy) {
          setError(null);
          onClose();
        }
      }}
      title="Import document"
      description="Upload a file to turn it into a new editable document."
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop file here or press Enter to browse"
        onKeyDown={(e) => {
          if (e.key === "Enter") inputRef.current?.click();
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void run(f);
        }}
        className={`flex cursor-pointer flex-col items-center rounded-[12px] border border-dashed px-6 py-9 text-center ${
          dragOver ? "border-accent bg-accent-subtle" : "border-line-strong bg-surface-2"
        }`}
      >
        <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle text-accent">
          {busy ? (
            <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          ) : (
            <UploadCloud size={19} />
          )}
        </span>
        <p className="text-[13px] font-medium text-ink">
          {busy ? "Importing…" : "Drag and drop your file here"}
        </p>
        <p className="mt-0.5 text-xs text-ink-2">or click to browse from your computer</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void run(f);
          }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {[".txt", ".md", ".docx"].map((t) => (
          <span key={t} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink-2">
            {t}
          </span>
        ))}
        <span className="ml-auto text-[11px] text-muted">Max 5MB</span>
      </div>
      {error && <p role="alert" className="mt-3 rounded-[10px] border border-destructive/30 bg-destructive/[0.06] px-3 py-2 text-[13px] text-destructive">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
          <FileUp size={15} />
          Choose file
        </Button>
      </div>
    </Dialog>
  );
}
