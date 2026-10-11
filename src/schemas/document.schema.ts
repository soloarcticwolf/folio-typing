import { z } from "zod";

const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.any()).default([]),
});

export const createDocSchema = z.object({
  title: z.string().trim().max(200).default("Untitled"),
});

export const renameDocSchema = z.object({
  docId: z.string().min(1),
  title: z.string().trim().min(1, "Title required").max(200),
});

export const saveDocSchema = z.object({
  docId: z.string().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  contentJSON: tiptapDocSchema,
  contentHTML: z.string().max(500_000).default(""),
});

export const getDocSchema = z.object({
  docId: z.string().min(1),
});
