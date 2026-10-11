"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Printer, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { exportDocxAction } from "@/actions/exportDoc";

export default function ExportMenu({ docId }: { docId: string }) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open ]);

  const onDocx = async () => {
    setBusy(true);
    try {
      const { filename, base64 } = await exportDocxAction(docId);
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
      push("Document exported as .docx");
    } catch (e) {
      push(e instanceof Error ? e.message : "Export failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={menuRef} className="no-print relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:border-line-strong hover:bg-surface-2"
      >
        <Download size={15} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <div role="menu" className="dv-pop absolute right-0 z-40 mt-1.5 w-60 rounded-[12px] border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]">
          <button
            role="menuitem"
            onClick={() => void onDocx()}
            disabled={busy}
            className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left hover:bg-surface-2 disabled:opacity-50"
          >
            <FileText size={16} className="shrink-0 text-accent" />
            <span>
              <span className="block text-[13px] font-medium text-ink">
                {busy ? "Exporting…" : "Download .docx"}
              </span>
              <span className="block text-[11px] text-muted">Editable Word document</span>
            </span>
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              window.print();
            }}
            className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left hover:bg-surface-2"
          >
            <Printer size={16} className="shrink-0 text-accent" />
            <span>
              <span className="block text-[13px] font-medium text-ink">Download .pdf</span>
              <span className="block text-[11px] text-muted">Via print dialog</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
