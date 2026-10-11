import type { JSONContent } from "@tiptap/core";
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

// ---------------------------------------------------------------------------
// sanitizeTiptapDoc: rebuilds unknown input into a guaranteed-plain document
// containing only the node types the app supports. Anything else (images,
// tables, embeds, exotic values) is reduced to its readable text so no words
// are lost but no junk or oversized blobs reach the database.
// ---------------------------------------------------------------------------

const MAX_NODES = 5000;
const MAX_TEXT = 20000;

const KNOWN_BLOCKS = new Set(["paragraph", "heading", "bulletList", "orderedList", "listItem"]);
const KNOWN_MARKS = new Set(["bold", "italic", "underline"]);

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

function cleanMarks(marks: unknown): { type: string }[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const out: { type: string }[] = [];
  for (const m of marks) {
    const r = asRecord(m);
    if (r && typeof r.type === "string" && KNOWN_MARKS.has(r.type)) out.push({ type: r.type });
  }
  return out.length > 0 ? out : undefined;
}

function collectText(node: unknown, depth = 0): string {
  if (depth > 20) return "";
  if (typeof node === "string") return node;
  const r = asRecord(node);
  if (!r) return "";
  if (typeof r.text === "string") return r.text;
  if (Array.isArray(r.content)) return r.content.map((c) => collectText(c, depth + 1)).join("");
  return "";
}

function cleanOne(node: unknown, budget: { n: number }): JSONContent[] {
  const r = asRecord(node);
  if (!r || budget.n <= 0) return [];

  if (r.type === "text") {
    const text = typeof r.text === "string" ? r.text.slice(0, MAX_TEXT) : "";
    if (!text) return [];
    budget.n -= 1;
    const clean: Record<string, unknown> = { type: "text", text };
    const marks = cleanMarks(r.marks);
    if (marks) clean.marks = marks;
    return [clean as JSONContent];
  }

  if (typeof r.type === "string" && KNOWN_BLOCKS.has(r.type)) {
    budget.n -= 1;
    const clean: Record<string, unknown> = { type: r.type };
    if (r.type === "heading") {
      const attrs = asRecord(r.attrs);
      const level = attrs?.level;
      clean.attrs = { level: level === 2 ? 2 : level === 3 ? 3 : 1 };
    }
    if (Array.isArray(r.content)) {
      const children: JSONContent[] = [];
      for (const c of r.content) {
        if (budget.n <= 0) break;
        children.push(...cleanOne(c, budget));
      }
      if (children.length > 0) clean.content = children;
    }
    if (!clean.content && r.type !== "paragraph" && r.type !== "heading") return [];
    return [clean as JSONContent];
  }

  // Unknown node (image, table, embed…): keep its readable text, drop the rest.
  const text = collectText(r).trim().slice(0, MAX_TEXT);
  if (text) {
    budget.n -= 1;
    return [{ type: "paragraph", content: [{ type: "text", text }] } as JSONContent];
  }
  return Array.isArray(r.content) ? cleanNodes(r.content, budget) : [];
}

function cleanNodes(nodes: unknown, budget: { n: number }): JSONContent[] {
  if (!Array.isArray(nodes)) return [];
  const out: JSONContent[] = [];
  for (const n of nodes) {
    if (budget.n <= 0) break;
    out.push(...cleanOne(n, budget));
  }
  return out;
}

export function sanitizeTiptapDoc(input: unknown): TiptapDoc {
  const r = asRecord(input);
  const budget = { n: MAX_NODES };
  return { type: "doc", content: r ? cleanNodes(r.content, budget) : [] };
}

export type { TextMark };
