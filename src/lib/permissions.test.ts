import { describe, expect, it } from "vitest";
import { canEdit, canView, isOwner } from "@/lib/permissions";

describe("permissions", () => {
  const owner = "owner-1";
  const editor = "editor-1";
  const viewer = "viewer-1";
  const stranger = "stranger-1";
  const shares = [
    { sharedWithUserId: editor, role: "editor" as const },
    { sharedWithUserId: viewer, role: "viewer" as const },
  ];

  it("owner can view and edit", () => {
    expect(isOwner(owner, owner)).toBe(true);
    expect(canView(owner, shares, owner)).toBe(true);
    expect(canEdit(owner, shares, owner)).toBe(true);
  });

  it("editor can view and edit, viewer can only view", () => {
    expect(canView(owner, shares, editor)).toBe(true);
    expect(canEdit(owner, shares, editor)).toBe(true);
    expect(canView(owner, shares, viewer)).toBe(true);
    expect(canEdit(owner, shares, viewer)).toBe(false);
  });

  it("stranger can neither view nor edit", () => {
    expect(canView(owner, shares, stranger)).toBe(false);
    expect(canEdit(owner, shares, stranger)).toBe(false);
  });
});
