import type { Collection, Db, ObjectId } from "mongodb";
import type { JSONContent } from "@tiptap/core";

export type TiptapDoc = {
  type: "doc";
  content: JSONContent[];
};

export type DocumentDoc = {
  _id: ObjectId;
  ownerId: ObjectId;
  title: string;
  contentJSON: TiptapDoc;
  contentHTML: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentDTO = {
  id: string;
  ownerId: string;
  title: string;
  contentJSON: TiptapDoc;
  contentHTML: string;
  createdAt: string;
  updatedAt: string;
};

export function getDocsCol(db: Db): Collection<DocumentDoc> {
  return db.collection<DocumentDoc>("documents");
}

export async function ensureDocIndexes(db: Db): Promise<void> {
  await getDocsCol(db).createIndex({ ownerId: 1, updatedAt: -1 });
}

export const toDocDTO = (doc: DocumentDoc): DocumentDTO => ({
  id: doc._id.toHexString(),
  ownerId: doc.ownerId.toHexString(),
  title: doc.title,
  contentJSON: doc.contentJSON,
  contentHTML: doc.contentHTML,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const emptyTiptapDoc = (): TiptapDoc => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});
