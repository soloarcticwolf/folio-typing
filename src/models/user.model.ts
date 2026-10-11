import type { Collection, Db, ObjectId } from "mongodb";

export type UserDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type UserDTO = {
  id: string;
  name: string;
  email: string;
};

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

export function getUsersCol(db: Db): Collection<UserDoc> {
  return db.collection<UserDoc>("users");
}

export async function ensureUserIndexes(db: Db): Promise<void> {
  await getUsersCol(db).createIndex({ email: 1 }, { unique: true });
}

export const toUserDTO = (doc: UserDoc): UserDTO => ({
  id: doc._id.toHexString(),
  name: doc.name,
  email: doc.email,
});
