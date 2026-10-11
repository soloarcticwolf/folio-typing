"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongo";
import { requireSession } from "@/lib/session";
import { canEdit, canView } from "@/lib/permissions";
import { tiptapToHtml, sanitizeTiptapDoc } from "@/lib/tiptap";
import {
  createDocSchema,
  renameDocSchema,
  saveDocSchema,
  getDocSchema,
} from "@/schemas/document.schema";
import {
  getDocsCol,
  ensureDocIndexes,
  toDocDTO,
  emptyTiptapDoc,
  type DocumentDTO,
} from "@/models/document.model";
import { getSharesCol, ensureShareIndexes } from "@/models/share.model";

const toSharesRef = (shares: { sharedWithUserId: ObjectId; role: "viewer" | "editor" }[]) =>
  shares.map((s) => ({ sharedWithUserId: s.sharedWithUserId.toHexString(), role: s.role }));

export async function createDocumentAction(input: { title?: string }): Promise<DocumentDTO> {
  const session = await requireSession();
  const parsed = createDocSchema.parse({ title: input.title ?? "Untitled" });
  const title = parsed.title.trim() || "Untitled";
  const db = await getDb();
  await ensureDocIndexes(db);
  const now = new Date();
  const res = await getDocsCol(db).insertOne({
    ownerId: new ObjectId(session.id),
    title,
    contentJSON: emptyTiptapDoc(),
    contentHTML: "",
    createdAt: now,
    updatedAt: now,
  } as never);
  const doc = await getDocsCol(db).findOne({ _id: res.insertedId });
  if (!doc) throw new Error("Create failed");
  revalidatePath("/");
  return toDocDTO(doc);
}

export async function listDocumentsAction(): Promise<{
  owned: (DocumentDTO & { role: "owner" })[];
  shared: (DocumentDTO & { role: "viewer" | "editor" })[];
}> {
  const session = await requireSession();
  const me = new ObjectId(session.id);
  const db = await getDb();
  await ensureDocIndexes(db);
  await ensureShareIndexes(db);
  const ownedDocs = await getDocsCol(db)
    .find({ ownerId: me })
    .sort({ updatedAt: -1 })
    .toArray();
  const myShares = await getSharesCol(db).find({ sharedWithUserId: me }).toArray();
  const sharedDocIds = myShares.map((s) => s.docId);
  const sharedDocs =
    sharedDocIds.length > 0
      ? await getDocsCol(db).find({ _id: { $in: sharedDocIds } }).sort({ updatedAt: -1 }).toArray()
      : [];
  const shareByDoc = new Map(myShares.map((s) => [s.docId.toHexString(), s.role]));
  return {
    owned: ownedDocs.map((d) => ({ ...toDocDTO(d), role: "owner" as const })),
    shared: sharedDocs.map((d) => ({
      ...toDocDTO(d),
      role: (shareByDoc.get(d._id.toHexString()) ?? "viewer") as "viewer" | "editor",
    })),
  };
}

export async function getDocumentAction(docId: string) {
  const session = await requireSession();
  const { docId: id } = getDocSchema.parse({ docId });
  const db = await getDb();
  const doc = await getDocsCol(db).findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error("Not found");
  const shares = await getSharesCol(db).find({ docId: doc._id }).toArray();
  const refs = toSharesRef(shares);
  if (!canView(doc.ownerId.toHexString(), refs, session.id)) throw new Error("Forbidden");
  const mine = shares.find((s) => s.sharedWithUserId.toHexString() === session.id);
  const role = doc.ownerId.toHexString() === session.id ? ("owner" as const) : ((mine?.role ?? "viewer") as "viewer" | "editor");
  const { toDocDTO: toDTO } = await import("@/models/document.model");
  return { doc: toDTO(doc), role };
}

export async function renameDocumentAction(input: { docId: string; title: string }) {
  const session = await requireSession();
  const parsed = renameDocSchema.parse(input);
  const db = await getDb();
  const col = getDocsCol(db);
  const doc = await col.findOne({ _id: new ObjectId(parsed.docId) });
  if (!doc) throw new Error("Not found");
  const shares = await getSharesCol(db).find({ docId: doc._id }).toArray();
  if (!canEdit(doc.ownerId.toHexString(), toSharesRef(shares), session.id)) throw new Error("Forbidden");
  await col.updateOne(
    { _id: doc._id },
    { $set: { title: parsed.title.trim(), updatedAt: new Date() } },
  );
  revalidatePath("/");
  return { ok: true };
}

export async function saveDocumentAction(input: {
  docId: string;
  title?: string;
  contentJSON: { type: "doc"; content: Record<string, unknown>[] };
  contentHTML?: string;
}) {
  const session = await requireSession();
  const parsed = saveDocSchema.parse(input);
  const db = await getDb();
  const col = getDocsCol(db);
  const doc = await col.findOne({ _id: new ObjectId(parsed.docId) });
  if (!doc) throw new Error("Not found");
  const shares = await getSharesCol(db).find({ docId: doc._id }).toArray();
  if (!canEdit(doc.ownerId.toHexString(), toSharesRef(shares), session.id)) throw new Error("Forbidden");
  // Rebuild into guaranteed-plain data: only plain JSON-safe values may
  // reach the database driver (anything exotic crashes BSON serialization).
  const clean = sanitizeTiptapDoc(parsed.contentJSON);
  const html = (parsed.contentHTML || tiptapToHtml(clean)).slice(0, 500_000);
  await col.updateOne(
    { _id: doc._id },
    {
      $set: {
        ...(parsed.title ? { title: parsed.title.trim() } : {}),
        contentJSON: clean,
        contentHTML: html,
        updatedAt: new Date(),
      },
    },
  );
  return { ok: true, updatedAt: new Date().toISOString() };
}

export async function deleteDocumentAction(docId: string) {
  const session = await requireSession();
  const { docId: id } = getDocSchema.parse({ docId });
  const db = await getDb();
  const doc = await getDocsCol(db).findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error("Not found");
  if (doc.ownerId.toHexString() !== session.id) throw new Error("Only owner can delete");
  await getDocsCol(db).deleteOne({ _id: doc._id });
  await getSharesCol(db).deleteMany({ docId: doc._id });
  revalidatePath("/");
  return { ok: true };
}
