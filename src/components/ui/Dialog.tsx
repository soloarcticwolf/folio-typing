"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Focus the panel once per open transition (NOT on every parent render —
  // re-focusing here is what used to steal focus while typing).
  useEffect(() => {
    if (open && !wasOpen.current) {
      wasOpen.current = true;
      panelRef.current?.focus({ preventScroll: true });
    } else if (!open) {
      wasOpen.current = false;
    }
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  // Portal to <body>: ancestors with backdrop-filter/transform would
  // otherwise become the containing block for `fixed` and break centering.
  return createPortal(
    <div
      className="dv-fade fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/30 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`dv-pop my-auto w-full rounded-[14px] border border-line bg-surface shadow-[var(--shadow-pop)] outline-none ${wide ? "max-w-lg" : "max-w-md"}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-ink-2">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
