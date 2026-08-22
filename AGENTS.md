<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Base44 dev environment

## Run
```
docker compose -f docker-compose.base44.yml up -d
```
App is a Next.js 16 (Turbopack) app served on host port 3000 by `next dev -H 0.0.0.0`. Source is bind-mounted at `/app`; `npm install` runs at container start. Edits hot-reload.

## Secrets
The landing page (`app/page.tsx`) is fully static and renders with NO credentials. The quiz features need external services, configured via env vars delivered to `/run/base44/app.env` (placeholders live in `.env.base44-defaults`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase client (public).
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase admin (server-side, used by `lib/supabase-admin.ts`).
- `GEMINI_API_KEY` — Google Gemini, used by the `/api/ai/*` routes for quiz generation.
- `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAILS` — Resend email notifications (optional; skipped if no admin emails).

## Preview origin
`next.config.ts` adds `allowedDevOrigins` derived from `BASE44_PUBLIC_HOST_SUFFIX` so the preview's external origin can load dev assets/HMR. Do not hardcode the suffix.

## Verify
`curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the Quizzzer page; a `_next` asset under the same host returns 200.
