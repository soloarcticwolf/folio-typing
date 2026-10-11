"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { requireSession } from "@/lib/session";
import { canView } from "@/lib/permissions";
import { buildDocxBuffer } from "@/lib/exportDocx";
import { getDocsCol } from "@/models/document.model";
import { getSharesCol } from "@/models/share.model";

const safeFilename = (title: string): string =>
  `${(title || "Untitled").replace(/[^\w\- ]+/g, "").trim().slice(0, 100) || "Untitled"}.docx`;

export async function exportDocxAction(docId: string): Promise<{ filename: string; base64: string }> {
  const session = await requireSession();
  const db = await getDb();
  const doc = await getDocsCol(db).findOne({ _id: new ObjectId(docId) });
  if (!doc) throw new Error("Not found");
  const shares = await getSharesCol(db).find({ docId: doc._id }).toArray();
  const refs = shares.map((s) => ({
    sharedWithUserId: s.sharedWithUserId.toHexString(),
    role: s.role,
  }));
  if (!canView(doc.ownerId.toHexString(), refs, session.id)) throw new Error("Forbidden");
  const buffer = await buildDocxBuffer(doc.title, doc.contentJSON);
  return { filename: safeFilename(doc.title), base64: buffer.toString("base64") };
}
