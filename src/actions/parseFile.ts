"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import mammoth from "mammoth";
import { marked } from "marked";
import { getDb } from "@/lib/mongo";
import { requireSession } from "@/lib/session";
import { textToTiptap, htmlToTiptapText, tiptapToHtml } from "@/lib/tiptap";
import { getDocsCol, ensureDocIndexes } from "@/models/document.model";

const MAX_SIZE = 5 * 1024 * 1024;

const extOf = (name: string): string => name.split(".").pop()?.toLowerCase() ?? "";

export async function parseAndImportAction(formData: FormData): Promise<{ docId: string }> {
  const session = await requireSession();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");
  if (file.size > MAX_SIZE) throw new Error("Max 5MB");
  const filename = file.name || "upload";
  const ext = extOf(filename);
  if (!["txt", "md", "docx"].includes(ext)) throw new Error("Only .txt, .md, .docx allowed");

  const title = filename.replace(/\.[^.]+$/, "").slice(0, 200) || "Untitled";
  let tiptap;
  let html = "";

  if (ext === "txt") {
    const text = await file.text();
    tiptap = textToTiptap(text);
    html = tiptapToHtml(tiptap);
  } else if (ext === "md") {
    const text = await file.text();
    html = await marked.parse(text);
    tiptap = htmlToTiptapText(html);
    html = tiptapToHtml(tiptap);
  } else {
    const buf = Buffer.from(await file.arrayBuffer());
    const { value } = await mammoth.convertToHtml({ buffer: buf });
    html = value;
    tiptap = htmlToTiptapText(value);
  }

  const db = await getDb();
  await ensureDocIndexes(db);
  const now = new Date();
  const res = await getDocsCol(db).insertOne({
    ownerId: new ObjectId(session.id),
    title,
    contentJSON: tiptap,
    contentHTML: html,
    createdAt: now,
    updatedAt: now,
  } as never);
  revalidatePath("/");
  return { docId: res.insertedId.toHexString() };
}
