# Folio — Your space for thoughtful work

Notion-style docs: create/rename/edit, TipTap rich-text (B/I/U, H1–H3, bullets, numbered), upload `.txt/.md/.docx` as new doc, share viewer/editor, export `.docx`/`.pdf`.

Stack: Next.js 16.4, React 19.3, Tailwind v4, MongoDB, Server Actions only.

## Setup

```bash
npm install
cp .env.example .env  # fill MONGODB_URI + AUTH_SECRET (32+ chars)
npm run dev            # http://localhost:3000
```

Env:

- `MONGODB_URI` — Atlas or `mongodb://localhost:27017/docviewer`
- `AUTH_SECRET` — 32+ char secret
- `MONGODB_DB` — optional, default `docviewer`

## Features

- Auth: signup/login (email+password, bcrypt + JWT cookie).
- Docs: new, rename, autosave TipTap JSON+HTML, reopen, search, Owned / Shared / All tabs.
- Upload: `.txt`, `.md`, `.docx`, max 5MB → new editable doc.
- Sharing: share by email (viewer/editor), revoke, read-only for viewers.
- Export: Download `.docx` (server), `.pdf` via print.

## Demo sharing

1. A signs up, creates doc, Share → B@email as editor.
2. B logs in (different browser OK) → Shared with me → edits.

## Scripts

```bash
npm run dev | npm run build | npm start
npm run lint
npm test   # vitest: permissions matrix
```

## Deploy (Vercel)

Set `MONGODB_URI`, `AUTH_SECRET`, `vercel --prod`.
