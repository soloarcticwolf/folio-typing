export type Role = "viewer" | "editor";

export type ShareRef = {
  sharedWithUserId: string;
  role: Role;
};

export const isOwner = (ownerId: string, userId: string): boolean =>
  ownerId === userId;

export const findShareForUser = (
  shares: ShareRef[],
  userId: string,
): ShareRef | null => shares.find((s) => s.sharedWithUserId === userId) ?? null;

export const canView = (
  ownerId: string,
  shares: ShareRef[],
  userId: string,
): boolean => isOwner(ownerId, userId) || findShareForUser(shares, userId) !== null;

export const canEdit = (
  ownerId: string,
  shares: ShareRef[],
  userId: string,
): boolean =>
  isOwner(ownerId, userId) ||
  findShareForUser(shares, userId)?.role === "editor";
