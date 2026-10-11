"use server";

import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongo";
import { setSessionCookie, clearSessionCookie, requireSession } from "@/lib/session";
import { signupSchema, loginSchema } from "@/schemas/auth.schema";
import {
  getUsersCol,
  ensureUserIndexes,
  normalizeEmail,
  toUserDTO,
} from "@/models/user.model";

export async function signupAction(input: { name: string; email: string; password: string }) {
  const parsed = signupSchema.parse(input);
  const email = normalizeEmail(parsed.email);
  const db = await getDb();
  await ensureUserIndexes(db);
  const col = getUsersCol(db);
  const existing = await col.findOne({ email });
  if (existing) throw new Error("Email already registered");
  const passwordHash = await bcrypt.hash(parsed.password, 10);
  const res = await col.insertOne({
    name: parsed.name.trim(),
    email,
    passwordHash,
    createdAt: new Date(),
    // @ts-expect-error _id generated
    _id: undefined,
  });
  const doc = await col.findOne({ _id: res.insertedId });
  if (!doc) throw new Error("Signup failed");
  const dto = toUserDTO(doc);
  await setSessionCookie({ id: dto.id, email: dto.email, name: dto.name });
  return dto;
}

export async function loginAction(input: { email: string; password: string }) {
  const parsed = loginSchema.parse(input);
  const email = normalizeEmail(parsed.email);
  const db = await getDb();
  await ensureUserIndexes(db);
  const user = await getUsersCol(db).findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const ok = await bcrypt.compare(parsed.password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");
  const dto = toUserDTO(user);
  await setSessionCookie({ id: dto.id, email: dto.email, name: dto.name });
  return dto;
}

export async function logoutAction() {
  await clearSessionCookie();
  return { ok: true };
}

export async function meAction() {
  const session = await requireSession().catch(() => null);
  return session;
}
