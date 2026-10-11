import { z } from "zod";

export const ACCEPTED_UPLOAD_TYPES = [
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const uploadMetaSchema = z.object({
  filename: z.string().min(1).max(200),
  mimeType: z.string().min(1),
  size: z.number().int().positive().max(5 * 1024 * 1024, "Max 5MB"),
});
