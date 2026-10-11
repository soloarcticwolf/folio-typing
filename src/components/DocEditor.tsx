"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from "lucide-react";
import { IconButton } from "@/components/ui/primitives";
import { renameDocumentAction, saveDocumentAction } from "@/actions/documents";
import type { TiptapDoc } from "@/models/document.model";

export type SaveStatus = { kind: "saved" | "saving" | "error"; text: string };

function ToolbarButton({
  label,
  shortcut,
  active,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <IconButton
      label={shortcut ? `${label} (${shortcut})` : label}
      active={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </IconButton>
  );
}

export default function DocEditor({
  docId,
  initialTitle,
  initialJSON,
  canEdit,
  onStatus,
}: {
  docId: string;
  initialTitle: string;
  initialJSON: TiptapDoc;
  canEdit: boolean;
  onStatus?: (s: SaveStatus) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const report = (s: SaveStatus) => onStatus?.(s);

  const editor = useEditor({
    extensions: [
      // Note: StarterKit already includes Underline — do not add it again
      // (duplicate extension names corrupt editor state).
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: initialJSON,
    editable: canEdit,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!canEdit) return;
      report({ kind: "saving", text: "Saving…" });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void (async () => {
          try {
            // JSON round-trip: guarantees only plain data crosses to the
            // Server Action (anything exotic would break transport/storage).
            const json = JSON.parse(JSON.stringify(editor.getJSON())) as TiptapDoc;
            await saveDocumentAction({ docId, contentJSON: json, contentHTML: editor.getHTML() });
            report({
              kind: "saved",
              text: `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
            });
          } catch (e) {
            report({ kind: "error", text: e instanceof Error ? `Save failed: ${e.message}` : "Save failed — keep editing to retry" });
          }
        })();
      }, 800);
    },
  });

  useEffect(() => {
    editor?.setEditable(canEdit);
  }, [editor, canEdit]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onTitleBlur = async () => {
    const t = title.trim() || "Untitled";
    setTitle(t);
    if (!canEdit) return;
    try {
      await renameDocumentAction({ docId, title: t });
    } catch {
      report({ kind: "error", text: "Rename failed" });
    }
  };

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => void onTitleBlur()}
        readOnly={!canEdit}
        aria-label="Document title"
        placeholder="Untitled"
        className="w-full rounded-[8px] bg-transparent text-[32px] font-bold tracking-tight text-ink placeholder:text-muted focus:bg-accent-subtle/40"
      />
      {editor && (
        <div className="no-print sticky top-0 z-10 mt-2 border-b border-line bg-surface/95 backdrop-blur">
          {canEdit ? (
            <div
              role="toolbar"
              aria-label="Formatting"
              className="thin-scroll flex items-center gap-0.5 overflow-x-auto py-1.5"
            >
              <ToolbarButton label="Bold" shortcut="Ctrl+B" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                <Bold size={16} />
              </ToolbarButton>
              <ToolbarButton label="Italic" shortcut="Ctrl+I" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Italic size={16} />
              </ToolbarButton>
              <ToolbarButton label="Underline" shortcut="Ctrl+U" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <UnderlineIcon size={16} />
              </ToolbarButton>
              <span aria-hidden className="mx-1.5 h-5 w-px shrink-0 bg-line" />
              <ToolbarButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 size={16} />
              </ToolbarButton>
              <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 size={16} />
              </ToolbarButton>
              <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 size={16} />
              </ToolbarButton>
              <span aria-hidden className="mx-1.5 h-5 w-px shrink-0 bg-line" />
              <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List size={16} />
              </ToolbarButton>
              <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered size={16} />
              </ToolbarButton>
            </div>
          ) : (
            <p className="py-2 text-xs text-muted">You have view-only access to this document.</p>
          )}
        </div>
      )}
      <div
        className="prose-doc thin-scroll mt-2 h-[clamp(480px,70vh,720px)] overflow-y-auto"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest(".ProseMirror")) {
            editor?.chain().focus().run();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
