# Copilot instructions for CineNaito

## Issue-first workflow (required)

- Before making any code change, create a GitHub Issue (or use an existing one) and record its number.
- If no Issue is provided, do **not** implement code changes yet; first create the Issue and confirm it with the user.
- Treat each implementation task as issue-driven: reference the Issue number in branch/PR context and progress updates.

## Build, lint, and run commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Lint project: `npm run lint`
- Build production bundle: `npm run build`
- Start production server: `npm run start`

There is currently no `test` script in `package.json` (no automated test command is configured yet).

## Project architecture (high-level)

- This is a Next.js App Router app. Route entry points live in `src/app/**`.
- `src/app/actions.ts` is the main server-action layer for movie plans, reactions, comments, and movie metadata fetching from eiga.com.
- Authentication actions are separated in `src/app/auth/actions.ts` and use username-based login mapped to synthetic emails (`usernameToEmail`), then Supabase Auth underneath.
- Supabase access is split by runtime:
  - Server components/actions: `src/lib/supabase/server.ts`
  - Browser client components: `src/lib/supabase/client.ts`
  - Middleware/session refresh: `src/lib/supabase/middleware.ts` wired via `src/proxy.ts`
  - Admin API client (service role key): `src/lib/supabase/admin.ts`
- Data model source of truth is `supabase/schema.sql`; TypeScript DB contracts are in `src/types/database.types.ts`.
- Dashboard and detail pages fetch on the server, then pass initial data into client components (`dashboard-client.tsx`, `plan-detail-client.tsx`) for interactive updates and optimistic UI.

## Repository-specific conventions

- UI copy, validation messages, and enum values are Japanese. Keep new user-facing text consistent (`絶対観る` / `時間が合えば` / `気にはなっている`).
- Reuse shared validation/helpers instead of duplicating rules:
  - Form/comment schemas: `src/lib/validations.ts`
  - Date/month and display helpers: `src/lib/helpers.ts`
- Keep emoji reaction constraints aligned between server and client:
  - Server whitelist in `src/app/actions.ts` (`ALLOWED_EMOJIS`)
  - Client picker options in `src/app/plans/[id]/plan-detail-client.tsx`
- Admin permission checks are based on `profiles.is_admin`; use `getIsAdmin` (`src/lib/admin.ts`) when adding privileged mutations.
- Protected-route behavior is centralized in Supabase middleware (`/new`, `/profile`, `/admin` currently protected); update `src/lib/supabase/middleware.ts` when adding protected sections.
- Dashboard filtering depends on `release_month` with fallback to `target_month`. Preserve this behavior when changing queries (`src/app/dashboard/page.tsx` + `extractYearMonthFromReleaseDate`).

## Environment and data setup

- Required env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` is required for signup flow using the admin client.
- Initialize database schema with `supabase/schema.sql`; `README.md` also references the `release_month` migration (`supabase/migrations/20260214_add_release_month.sql`).
