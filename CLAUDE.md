# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ShrimpShop — French-language e-commerce showcase for aquarium shrimp. The codebase and all labels/comments are in French.

## Commands

```bash
# Development
pnpm dev           # Start dev server
pnpm build         # Production build
pnpm preview       # Preview production build

# Type checking & linting
pnpm check         # svelte-check + tsc
pnpm lint          # prettier --check + eslint
pnpm format        # prettier --write

# Database (Prisma + Supabase PostgreSQL)
pnpm db:generate         # Generate Prisma client after schema changes
pnpm db:migrate          # Create and apply a dev migration
pnpm db:migrate:deploy   # Apply migrations in production
pnpm db:studio           # Open Prisma Studio
pnpm db:seed             # Run prisma/seed.ts
```

## Environment Variables

Copy `.env.example` to `.env`. Required variables:

- `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` — pooled connection (PgBouncer, port 6543, `?pgbouncer=true`)
- `DIRECT_URL` — direct connection for Prisma migrations (port 5432)
- `AUTH_SECRET` — 32-char random secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `PUBLIC_APP_URL` / `PUBLIC_APP_NAME` / `PUBLIC_APP_DESCRIPTION`

## Architecture

### Auth & Route Protection (`src/hooks.server.ts`)

Three hooks composed with `sequence()`:

1. **`supabaseHook`** — creates the SSR Supabase client from cookies, exposes `locals.safeGetSession()` which validates the JWT server-side via `getUser()`.
2. **`authHook`** — calls `safeGetSession()`, loads the Prisma user's role into `locals.userRole`.
3. **`routeGuardHook`** — RBAC redirect logic:
   - `/admin/*` → requires `ADMIN` role
   - `/articles`, `/faq` → requires any authenticated session
   - `/login`, `/register` → redirects away if already logged in

### Data Layer

- **`src/lib/server/db.ts`** — Prisma singleton (uses `globalThis.__prisma` to survive hot-reload).
- **`src/lib/server/supabase.ts`** — exports `createSupabaseServerClient(cookies)` for SSR and `supabaseAdmin` (service-role, no session persistence) for server-only operations.
- **`src/lib/server/storage.ts`** — `uploadImage(bucket, file, folder?)` / `deleteImage()` via `supabaseAdmin`. Two buckets: `articles` and `gallery`. Validates MIME type and 5MB max size.
- **`src/lib/server/errors.ts`** — typed error classes (`NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`), plus `throwKitError()` to convert them to SvelteKit `error()` calls and `formatApiError()` for JSON API responses.

### Services (`src/lib/services/`)

Business logic layer that wraps Prisma. All services use the `db` singleton and return serialized DTOs (dates as ISO strings). Services: `article.service.ts`, `faq.service.ts`, `photo.service.ts`, `user.service.ts`.

### Types & Schemas (`src/lib/types/`, `src/lib/schemas/`)

- **`$types`** — re-exports Prisma enums/models + defines DTO types (`ArticleDTO`, `ArticleCardDTO`, `PaginatedResponse<T>`, `ApiResponse<T>`, etc.).
- **`$schemas`** — Zod schemas for all form inputs; inferred TypeScript types are exported alongside the schemas.

### OAuth Callback (`src/routes/auth/callback/+server.ts`)

After Supabase exchanges the OAuth code for a session, `upsertUser()` syncs the Supabase user into the Prisma `users` table using `supabaseId` as the unique key.

### Upload API (`src/routes/api/upload/+server.ts`)

POST endpoint that requires authentication, accepts `multipart/form-data` with `file` and `bucket` (`articles` | `gallery`), and delegates to `uploadImage()`.

### TipTap WYSIWYG

The editor (`src/lib/components/admin/ArticleForm.svelte`) is **dynamically imported inside `onMount`** to avoid SSR issues. Article HTML content is sanitized before storage and rendering using `isomorphic-dompurify` (`src/lib/utils/sanitize.ts`). Only YouTube/YouTube-nocookie iframes are allowed.

## TypeScript Path Aliases

Defined in `svelte.config.js`:

| Alias | Path |
|---|---|
| `$lib` | `src/lib` |
| `$components` | `src/lib/components` |
| `$server` | `src/lib/server` |
| `$types` | `src/lib/types` |
| `$schemas` | `src/lib/schemas` |
| `$services` | `src/lib/services` |
| `$utils` | `src/lib/utils` |

## Svelte 5 Runes

Use Svelte 5 rune syntax throughout: `$state`, `$derived`, `$effect`, `$props`. Do not use legacy Svelte 4 reactive syntax (`$:`, `export let`).

## Prisma Schema Notes

- `Article` has both `status` (enum `DRAFT`/`PUBLISHED`) and `published` (boolean) — they must stay in sync. `publishedAt` is set to `now()` on first publish and cleared when unpublished.
- All models use `snake_case` column names via `@map`, but camelCase in TypeScript.
- After any schema change: run `pnpm db:generate` and `pnpm db:migrate`.
