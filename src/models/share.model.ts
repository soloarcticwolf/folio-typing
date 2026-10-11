import type { Collection, Db, ObjectId } from "mongodb";
import type { Role } from "@/lib/permissions";

export type ShareDoc = {
  _id: ObjectId;
  docId: ObjectId;
  ownerId: ObjectId;
  sharedWithUserId: ObjectId;
  sharedWithEmail: string;
  role: Role;
  createdAt: Date;
};

export type ShareDTO = {
  id: string;
  docId: string;
  sharedWithUserId: string;
  sharedWithEmail: string;
  role: Role;
  createdAt: string;
};

export function getSharesCol(db: Db): Collection<ShareDoc> {
  return db.collection<ShareDoc>("shares");
}

export async function ensureShareIndexes(db: Db): Promise<void> {
  await getSharesCol(db).createIndex(
    { docId: 1, sharedWithUserId: 1 },
    { unique: true },
  );
  await getSharesCol(db).createIndex({ sharedWithUserId: 1 });
}

export const toShareDTO = (doc: ShareDoc): ShareDTO => ({
  id: doc._id.toHexString(),
  docId: doc.docId.toHexString(),
  sharedWithUserId: doc.sharedWithUserId.toHexString(),
  sharedWithEmail: doc.sharedWithEmail,
  role: doc.role,
  createdAt: doc.createdAt.toISOString(),
});
