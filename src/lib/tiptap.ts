import type { TiptapDoc } from "@/models/document.model";

type TextMark = { type: "bold" | "italic" | "underline" };

const escapeHtml = (s: string): string =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

type InlineNode = {
  type?: string;
  text?: string;
  marks?: { type: string }[];
};

const renderInline = (node: InlineNode): string => {
  const text = escapeHtml(node.text ?? "");
  const marks = new Set((node.marks ?? []).map((m) => m.type));
  let out = text;
  if (marks.has("bold")) out = `<strong>${out}</strong>`;
  if (marks.has("italic")) out = `<em>${out}</em>`;
  if (marks.has("underline")) out = `<u>${out}</u>`;
  return out;
};

const renderNode = (node: {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: InlineNode[] & { type?: string }[];
  text?: string;
}): string => {
  if (!node || typeof node !== "object") return "";
  if (node.type === "text") return renderInline(node as InlineNode);
  const inner = ((node.content ?? []) as InlineNode[])
    .map((c) =>
      c.type === "text" ? renderInline(c) : renderNode(c as never),
    )
    .join("");
  switch (node.type) {
    case "heading": {
      const level =
        typeof node.attrs?.level === "number" &&
        node.attrs.level >= 1 &&
        node.attrs.level <= 3
          ? node.attrs.level
          : 1;
      return `<h${level}>${inner}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${inner}</ul>`;
    case "orderedList":
      return `<ol>${inner}</ol>`;
    case "listItem":
      return `<li>${inner}</li>`;
    case "paragraph":
      return `<p>${inner}</p>`;
    default:
      return inner;
  }
};

export function tiptapToHtml(doc: TiptapDoc): string {
  const content = Array.isArray(doc.content) ? doc.content : [];
  return content.map((n) => renderNode(n as never)).join("");
}

export function textToTiptap(text: string): TiptapDoc {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: trimmed.slice(4) }],
      };
    }
    if (trimmed.startsWith("## ")) {
      return {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: trimmed.slice(3) }],
      };
    }
    if (trimmed.startsWith("# ")) {
      return {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: trimmed.slice(2) }],
      };
    }
    if (trimmed === "") return { type: "paragraph" };
    return { type: "paragraph", content: [{ type: "text", text: line }] };
  });
  return { type: "doc", content };
}

export function htmlToTiptapText(html: string): TiptapDoc {
  const text = html
    .replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, "# $1\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  return textToTiptap(text);
}

export type { TextMark };
