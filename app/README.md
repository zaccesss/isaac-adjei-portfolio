# app/

Next.js 16 App Router. Every folder here is either a route segment or a route group.

## Structure

| Directory | Type | Description |
| --- | --- | --- |
| `(public)/` | Route group | Public-facing pages - no auth required |
| `api/` | API routes | Server-side endpoints (REST + Next.js route handlers) |
| `dashboard/` | Route group | Private dashboard (GitHub OAuth via NextAuth) |

## Public routes

`about`, `blog`, `changelog`, `colophon`, `consumed`, `cv`, `experience`, `lab`, `links`, `newsletter`, `notes`, `now`, `projects`, `respub`, `search`, `share`, `skills`, `tags`, `til`, `uses` - all live under `(public)/`.

`consumed` has category subpages (`consumed/[category]`) and individual item pages (`consumed/[category]/[slug]`, 216 pages). `til` has individual entry pages (`til/[slug]`) and an RSS feed (`til/feed.xml`). `tags` has per-tag pages (`tags/[tag]`).

The homepage (`page.tsx`) is at the `app/` root.

## API routes

See [app/api/README.md](api/README.md) for the full route table.

## Dashboard

All dashboard pages live under `dashboard/(protected)/`. Every page in that group requires a valid NextAuth session (GitHub OAuth). The session is checked by `middleware.ts` at the repo root.

See [docs/DASHBOARD.md](../docs/DASHBOARD.md) for the full route list and Supabase schema overview.
