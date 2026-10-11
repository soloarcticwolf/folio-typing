import { z } from "zod";

export const shareDocSchema = z.object({
  docId: z.string().min(1),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  role: z.enum(["viewer", "editor"]),
});

export const revokeShareSchema = z.object({
  docId: z.string().min(1),
  sharedWithUserId: z.string().min(1),
});
