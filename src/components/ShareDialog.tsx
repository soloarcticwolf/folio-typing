"use client";

import { useState } from "react";
import { Share2, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { listSharesAction, shareDocumentAction, revokeShareAction } from "@/actions/sharing";
import type { ShareDTO } from "@/models/share.model";

export default function ShareDialog({ docId, isOwner }: { docId: string; isOwner: boolean }) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<ShareDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const refresh = async () => {
    setLoadingList(true);
    try {
      setShares(await listSharesAction(docId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sharing info");
    } finally {
      setLoadingList(false);
    }
  };

  const onOpen = () => {
    setError(null);
    setConfirmRevoke(null);
    setOpen(true);
    void refresh();
  };

  const onGrant = async () => {
    if (!email.trim()) {
      setError("Enter an email address.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await shareDocumentAction({ docId, email, role });
      setEmail("");
      await refresh();
      push(`Shared with ${email.trim()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not share document");
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async (sharedWithUserId: string, sharedEmail: string) => {
    setBusy(true);
    try {
      await revokeShareAction({ docId, sharedWithUserId });
      setConfirmRevoke(null);
      await refresh();
      push(`Access revoked for ${sharedEmail}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not revoke access");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="primary" size="sm" onClick={onOpen}>
        <Share2 size={15} />
        Share
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Share document"
        description="Invite people by email. Viewers can read, editors can modify."
      >
        {isOwner ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="min-w-0 flex-1">
              <Field label="Email address" error={undefined}>
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void onGrant();
                    }
                  }}
                />
              </Field>
            </div>
            <div className="sm:w-32">
              <Field label="Role">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
                  className="h-9 w-full rounded-[10px] border border-line bg-surface px-2.5 text-sm text-ink hover:border-line-strong focus:border-accent"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
              </Field>
            </div>
            <div className="flex items-end">
              <Button variant="primary" loading={busy} onClick={() => void onGrant()}>
                Share
              </Button>
            </div>
          </div>
        ) : (
          <p className="rounded-[10px] bg-surface-2 px-3 py-2 text-[13px] text-ink-2">
            Only the document owner can grant or revoke access.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 rounded-[10px] border border-destructive/30 bg-destructive/[0.06] px-3 py-2 text-[13px] text-destructive">
            {error}
          </p>
        )}

        <h3 className="mt-4 mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
          People with access ({shares.length})
        </h3>
        {loadingList ? (
          <p className="py-3 text-[13px] text-ink-2">Loading…</p>
        ) : shares.length === 0 ? (
          <p className="rounded-[10px] bg-surface-2 px-3 py-3 text-[13px] text-ink-2">
            Only you have access. Invite someone above to collaborate.
          </p>
        ) : (
          <ul className="max-h-56 space-y-1 overflow-y-auto">
            {shares.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2.5 rounded-[10px] border border-line px-2.5 py-2"
              >
                <Avatar name={s.sharedWithEmail} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {s.sharedWithEmail}
                  </span>
                  <span className="block text-[11px] text-muted">
                    {s.role === "editor" ? "Editor — can modify" : "Viewer — can read"}
                  </span>
                </span>
                {isOwner &&
                  (confirmRevoke === s.sharedWithUserId ? (
                    <span className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        loading={busy}
                        onClick={() => void onRevoke(s.sharedWithUserId, s.sharedWithEmail)}
                      >
                        Confirm
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmRevoke(null)}>
                        Keep
                      </Button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmRevoke(s.sharedWithUserId)}
                      aria-label={`Revoke access for ${s.sharedWithEmail}`}
                      className="shrink-0 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-destructive"
                    >
                      <Trash2 size={15} />
                    </button>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </>
  );
}
