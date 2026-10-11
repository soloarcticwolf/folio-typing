import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
} from "docx";
import type { TiptapDoc } from "@/models/document.model";

type Inline = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };

function inlineToRuns(inlines: Inline[]): TextRun[] {
  return inlines.map(
    (t) =>
      new TextRun({
        text: t.text,
        bold: t.bold,
        italics: t.italic,
        underline: t.underline ? {} : undefined,
      }),
  );
}

function extractInlines(nodes: Array<{ text?: string; marks?: { type: string }[] }>): Inline[] {
  return nodes
    .filter((n) => typeof n.text === "string")
    .map((n) => {
      const marks = new Set((n.marks ?? []).map((m) => m.type));
      return {
        text: n.text ?? "",
        bold: marks.has("bold"),
        italic: marks.has("italic"),
        underline: marks.has("underline"),
      };
    });
}

function nodeToParagraphs(node: {
  type?: string;
  attrs?: { level?: number };
  content?: Array<{ type?: string; text?: string; marks?: { type: string }[]; content?: never }>;
}): Paragraph[] {
  if (node.type === "heading") {
    const level = node.attrs?.level === 2 ? HeadingLevel.HEADING_2 : node.attrs?.level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_1;
    return [new Paragraph({ heading: level, children: inlineToRuns(extractInlines(node.content ?? [])) })];
  }
  if (node.type === "bulletList" || node.type === "orderedList") return [];
  if (node.type === "paragraph" || !node.type) {
    const runs = inlineToRuns(extractInlines(node.content ?? []));
    if (runs.length === 0) return [new Paragraph({ text: "" })];
    return [new Paragraph({ children: runs })];
  }
  return [];
}

export async function buildDocxBuffer(title: string, doc: TiptapDoc): Promise<Buffer> {
  const body: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: title || "Untitled", bold: true, size: 48 })],
    }),
    new Paragraph({ text: "" }),
  ];
  for (const node of (doc.content ?? []) as Parameters<typeof nodeToParagraphs>[0][]) {
    if (node.type === "bulletList" || node.type === "orderedList") {
      const items = (node as unknown as { content?: { content?: Inline[] }[] }).content ?? [];
      for (const item of items) {
        const inlines = extractInlines(
          ((item as unknown as { content?: { text?: string; marks?: { type: string }[] }[] }).content ?? []) as never,
        );
        body.push(
          new Paragraph({
            bullet: node.type === "bulletList" ? { level: 0 } : undefined,
            children: inlineToRuns(inlines.length ? inlines : [{ text: "" }]),
          }),
        );
      }
      continue;
    }
    body.push(...nodeToParagraphs(node));
  }
  const file = new Document({ sections: [{ children: body }] });
  const buffer = await Packer.toBuffer(file);
  return Buffer.from(buffer);
}
