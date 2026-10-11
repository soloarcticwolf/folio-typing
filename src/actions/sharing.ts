"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongo";
import { requireSession } from "@/lib/session";
import { canView } from "@/lib/permissions";
import { shareDocSchema, revokeShareSchema } from "@/schemas/share.schema";
import { getUsersCol, normalizeEmail } from "@/models/user.model";
import { getDocsCol } from "@/models/document.model";
import { getSharesCol, ensureShareIndexes, toShareDTO } from "@/models/share.model";

export async function shareDocumentAction(input: { docId: string; email: string; role: "viewer" | "editor" }) {
  const session = await requireSession();
  const parsed = shareDocSchema.parse(input);
  const db = await getDb();
  await ensureShareIndexes(db);
  const doc = await getDocsCol(db).findOne({ _id: new ObjectId(parsed.docId) });
  if (!doc) throw new Error("Not found");
  if (doc.ownerId.toHexString() !== session.id) throw new Error("Only owner can share");
  const email = normalizeEmail(parsed.email);
  const target = await getUsersCol(db).findOne({ email });
  if (!target) throw new Error("User not found");
  if (target._id.toHexString() === session.id) throw new Error("Cannot share to self");
  const col = getSharesCol(db);
  await col.updateOne(
    { docId: doc._id, sharedWithUserId: target._id },
    {
      $set: { role: parsed.role, sharedWithEmail: email },
      $setOnInsert: { docId: doc._id, ownerId: doc.ownerId, sharedWithUserId: target._id, createdAt: new Date() },
    },
    { upsert: true },
  );
  revalidatePath("/");
  return { ok: true };
}

export async function revokeShareAction(input: { docId: string; sharedWithUserId: string }) {
  const session = await requireSession();
  const parsed = revokeShareSchema.parse(input);
  const db = await getDb();
  const doc = await getDocsCol(db).findOne({ _id: new ObjectId(parsed.docId) });
  if (!doc) throw new Error("Not found");
  if (doc.ownerId.toHexString() !== session.id) throw new Error("Only owner can revoke");
  await getSharesCol(db).deleteOne({
    docId: doc._id,
    sharedWithUserId: new ObjectId(parsed.sharedWithUserId),
  });
  revalidatePath("/");
  return { ok: true };
}

export async function listSharesAction(docId: string) {
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
  return shares.map(toShareDTO);
}
