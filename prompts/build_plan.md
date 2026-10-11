# docViewer — Build Plan

## 1. Decisions

- **Theme:** Notion-style — sidebar, Owned/Shared/All, search, canvas with inline title.
- **Editor:** TipTap.
- **Auth:** Email + password, MongoDB, Next.js Server Actions only. No Express.
- **Sharing:** Viewer + Editor roles, revoke, Owned vs Shared badges.
- **Upload:** Import `.txt` / `.md` / `.docx` as new doc. Max 5MB.
- **Export:** Download `.docx` + `.pdf` (print-to-PDF).
- **Persistence:** MongoDB Atlas for users + documents + shares.

## 2. Requirements

### 2.1 Core
1. Docs: create, rename, edit, save/reopen. Formatting: bold, italic, underline, H1/H2/H3, bullet + numbered lists. Export per doc: `.docx` and `.pdf`.
2. Upload: `.txt/.md/.docx` → new editable doc.
3. Sharing: owner shares by email, Owned vs Shared distinction, viewer/editor.
4. Persistence: survive refresh, preserve formatting, sharing works cross-device.
5. Quality: README, Vercel deploy, validation + errors, ≥1 test, `ARCHITECTURE.md`.

### 2.2 Constraints
- Next.js + Server Actions.
- Vercel deploy.

## 3. Tech stack (Next.js 16 + stable versions)

- Next.js 16.4 stable (App Router, Turbopack), React 19.3, TypeScript 5.x, Tailwind CSS v4. Scaffold via `npx create-next-app@latest`, then pin versions. No `experimental` flags except defaults.
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline` (latest v2/v3 stable at build time, mutually compatible).
- `mongodb`, `bcryptjs`, `jose`, `zod` (latest stable).
- `mammoth` (docx import), `marked` (md import), `docx` (docx export).
- `vitest` (latest stable). PDF via `window.print` + print CSS.

## 4. Architecture (modular + functional)

Style: modular, functional programming. Pure functions only, no classes. Small modules, single responsibility, immutable data. Actions are thin orchestrators: validate (schemas) → session → permissions → models.

```
app/(auth)/login, signup -> actions/auth.ts
app/(app)/ -> RSC fetch docs/shares -> Sidebar + Canvas
components: Sidebar, DocList, Editor+Toolbar, ShareDialog, UploadDropzone, ExportMenu, UserMenu
models: user.model.ts, document.model.ts, share.model.ts (types + collection + indexes + queries, no UI, no auth)
schemas: auth.schema.ts, document.schema.ts, share.schema.ts, upload.schema.ts (zod only)
lib: mongo.ts, session.ts, permissions.ts, tiptap.ts, exportDocx.ts (pure helpers)
actions: auth.ts, documents.ts, sharing.ts, parseFile.ts, exportDoc.ts
tests: permissions.test.ts
```

All actions: zod validate → session → permission check → Mongo op → `revalidatePath`.

### 4.1 Models (`/models`, separate from schemas)

`models/user.model.ts`: `User, toUserDTO`, `getUsersCol(), ensureUserIndexes(), findUserByEmail(), createUser()`.
`models/document.model.ts`: `Doc, toDocDTO`, `getDocsCol(), ensureDocIndexes(), findOwnedDocs(), findSharedDocs(), getDocById()`.
`models/share.model.ts`: `Share, Role`, `getSharesCol(), ensureShareIndexes(), findShare(), grantShare(), revokeShare()`.

Shapes:
`users`: `{ _id, name, email unique lowercase, passwordHash, createdAt }`
`documents`: `{ _id, ownerId, title, contentJSON, contentHTML, createdAt, updatedAt }`
`shares`: `{ _id, docId, ownerId, sharedWithUserId, sharedWithEmail lowercase, role: viewer|editor, createdAt }`

Schemas live separately in `/schemas` (zod only, no DB): `auth.schema.ts` (signup/login), `document.schema.ts` (create/rename/save), `share.schema.ts` (share/revoke), `upload.schema.ts` (file type/size). Models never import schemas; actions compose both.

### 4.2 Permissions
- `canView = isOwner || !!share`
- `canEdit = isOwner || share.role === 'editor'`
- Viewer: TipTap `editable: false`.

### 4.3 Flows
- **Auth:** signup/login set JWT httpOnly cookie. `getSession` verifies. Middleware guards `/(app)`.
- **Docs:** create/rename/save via `documents.ts`. Autosave debounced 800ms.
- **Upload:** dropzone → `parseFile` action → create doc → open.
- **Sharing:** `shareByEmail` + `revoke`. Lookup user by email.
- **Export:** `exportDoc(docId)` checks `canView` → build `.docx`. PDF via print stylesheet.

## 5. UI

- Top bar: search, upload, new-doc, export, user menu.
- Sidebar: Owned / Shared with me / All, sorted by `updatedAt desc`, role badges.
- Canvas: title, meta (owner, updated, role), toolbar, content max-w 720px.
- ShareDialog: email + role + grant + revoke list.
- ExportMenu: Download .docx / Download .pdf.

## 6. Validation + errors

- Zod on all actions + forms.
- Auth: invalid credentials, duplicate email.
- Docs: empty title → `Untitled`.
- Share: unknown user, duplicate, self-share blocked.
- Upload: unsupported type, too large, corrupt file.
- Export: no-view blocked, generation failure toast.

## 7. Testing

- `permissions.test.ts`: owner/viewer/editor/stranger matrix.
- Stretch: parser + export unit test, Playwright smoke.

## 8. Docs + deploy

- `README.md`: setup, features, limits, sharing demo, export usage, test command.
- `ARCHITECTURE.md`: stack + decisions.
- Vercel env: `MONGODB_URI`, `AUTH_SECRET`.

## 9. Phases

- [ ] P0 Approval (current gate)
- [ ] P1 Scaffold: Next.js 16 + TS + Tailwind v4, env, mongo helper
- [ ] P2 Auth: users + actions + login/signup UI
- [ ] P3 Data: documents/shares + actions + permissions test
- [ ] P4 Editor: TipTap + CRUD + search
- [ ] P5 Upload: dropzone + parseFile
- [ ] P6 Sharing: dialog + roles + revoke
- [ ] P7 Export: exportDoc + print CSS + menu
- [ ] P8 Polish + Quality gate: validation, tests, README, ARCHITECTURE.md, Vercel deploy

## 10. Requisites

- `MONGODB_URI` (Atlas or local `mongodb://localhost:27017/docviewer`).
- `AUTH_SECRET` (32+ chars).
- Vercel account.
