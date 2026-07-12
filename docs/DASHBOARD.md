# Private Dashboard - Current State

**Status: FULLY BUILT. Do not rebuild anything from scratch.**

Private section at `/dashboard` - not linked from public nav, sitemap or command menu.

---

## Auth

- NextAuth.js v5 (Auth.js) GitHub OAuth; numeric user ID allow-list via `ALLOWED_GITHUB_ID`
- All DB access via server actions only - never direct Supabase calls from client components
- PIN gate: secondary PIN set by `AUTH_SECONDARY_PIN` env var (or overridden by bcrypt hash in `config` table under key `dashboard_pin_hash`)
- Cookie `dashboard_pin_verified` (httpOnly, SameSite=Strict, 4-hour maxAge) unlocks Diary, Notes and Vault
- **Critical:** use `auth()` from `@/auth` in API routes - NOT `getToken` from next-auth/jwt (that is NextAuth v4 and always returns null in this project)
- Inactivity auto-logout: 1 hour client-side

---

## All routes

| Route | Notes |
| --- | --- |
| `/dashboard` | Home overview - activity feed and stat cards for all sections |
| `/dashboard/me` | Personal profile - editable via `config` table key `me_profile` |
| `/dashboard/us` | Relationship page |
| `/dashboard/goals` | Overview by category - links to `/goals/[category]` |
| `/dashboard/goals/[category]` | Full CRUD: Personal, Academic, Career, Health, Finance |
| `/dashboard/health` | Overview - links to `/health/[section]` |
| `/dashboard/health/[section]` | gym, nutrition, running |
| `/dashboard/diary` | PIN gated; mood picker; mood bar chart (last 30 days); 3-dot menu (Hide/Pin/Lock) |
| `/dashboard/notes` | Folder overview - links to `/notes/[folder]`; 3-dot menu (Hide/Pin/Lock) |
| `/dashboard/notes/[folder]` | Full CRUD per folder; PIN gated |
| `/dashboard/wishlist` | Overview by category - links to `/wishlist/[category]` |
| `/dashboard/wishlist/[category]` | Full CRUD per category |
| `/dashboard/inventory` | Overview by category with pagination (50 items per page) |
| `/dashboard/inventory/[category]` | Full CRUD per category; prev/next pagination |
| `/dashboard/inventory/[category]/[id]` | Full item detail; warranty colour coding; edit/delete |
| `/dashboard/course` | Editable modules table |
| `/dashboard/modules` | Overview by year - links to `/modules/[year]` |
| `/dashboard/modules/[year]` | year-1, year-2, placement, final-year |
| `/dashboard/applications` | Table and Kanban view; Internships/Jobs/Spring Weeks/Events tabs; category groups; funnel chart |
| `/dashboard/vault` | Overview by type - links to `/vault/[type]`; 3-dot menu (Hide/Lock) |
| `/dashboard/vault/[type]` | account, api-key, card, note, identity - PIN gated |
| `/dashboard/streaks` | 90-day heatmap; per-streak activity line chart; check-in |
| `/dashboard/habits` | Habit tracker with frequency (daily/weekly) and check-in logging |
| `/dashboard/settings` | PIN change, theme toggle, scraper trigger, weekly digest test, Discord digest trigger |
| `/dashboard/opensource` | Open source contributions tracker - add, edit and delete merged PRs submitted to external repos |
| `/dashboard/blog-analytics` | Blog read funnel - scroll depth stats per post (25/50/75/100% reached) |
| `/dashboard/coding` | WakaTime heatmap - daily coding activity from the wakatime-sync GitHub Actions workflow |

---

## Settings page (/dashboard/settings)

- **Change PIN**: calls `POST /api/dashboard/change-pin` - stores bcrypt hash in Supabase config table
- **Lock all**: calls `DELETE /api/dashboard/verify-pin` which clears the PIN cookie
- **Theme**: saves preference to Supabase config (`theme_preference`) for cross-device persistence
- **Scraper status**: calls `GET /api/dashboard/scraper-status` to poll the GitHub Actions API
- **Run Now**: calls `POST /api/dashboard/trigger-scraper` (requires `GH_PAT` with `workflow` scope in Vercel)
- **Weekly digest - Send test**: calls `POST /api/dashboard/trigger-digest` which calls `lib/send-weekly-digest.ts` directly
- **Discord digest - Send now**: calls `POST /api/dashboard/trigger-discord-digest` which calls `lib/send-discord-digest.ts` directly

---

## Global features

- **Quick Capture FAB**: fixed `+` button bottom-right; Radix Dialog with 4 tabs (Diary/Note/Goal/Job); each tab calls the relevant server action; sonner toast on success/failure
- **Keyboard shortcuts**: registered by `hooks/useDashboardShortcuts.ts`; `g+d/n/g/a/h/s/v/x` for navigation; `?` opens help dialog; ignored inside input/textarea/contenteditable
- **Global search (Ctrl+K)**: `components/dashboard/DashboardSearch.tsx`; fetches last 50 of goals/notes/diary/applications on first open via `getDashboardSearchData` server action; results grouped by section
- **3-dot menus**: MoreVertical dropdown on Diary, Notes and Vault entry cards; actions are contextual per type (Hide/Show, Pin/Unpin, Lock/Unlock, Edit, Delete)
- **Kanban board**: Applications page has a toggle between Table and Kanban views; drag-and-drop via `@hello-pangea/dnd`; dragging a card between columns updates its status in Supabase

---

## Applications tracker

Tabs: All / Internships / Jobs / Spring Weeks / Events

Category groups: FAANG+, Software Engineering, Data Science, AI and Machine Learning, DevOps and Infrastructure, Embedded, Quant Developer, Tech Consulting, Cyber Security, Startups, IT, Miscellaneous

Table columns: My Status (inline dropdown), Company, Programme, Opening Date, Closing Date, Last Year Opening, Find Housing, CV, Cover Letter, Written Answers, Sponsors Visa, Notes

Status values: Not Applied, Interested, Application Submitted, Online Assessment, Case Study, HireVue, Telephone Interview, Video Interview, Face-to-face Interview, Assessment Centre, Offer Received, Rejected, Not Interested

Funnel chart: Applied (blue) / Assessment (violet) / Interview (amber) / Offer (green) - pinned to bottom of the applications page in both Table and Kanban views; counts update per tab.

Category grouping note: the Supabase column has `DEFAULT 'Software Engineering'` so every DB row is truthy. The client skips the DB value when it equals the default and calls `detectCategory(company, role)` instead. This means roles scraped before the category detection improvement still end up in the correct group.

---

## Job scraper

- GitHub Actions cron: every 3 days at midnight UTC (`.github/workflows/job-scraper.yml`)
- Manual trigger: Settings > "Run Now" via `POST /api/dashboard/trigger-scraper`
- Secrets needed in GitHub repo: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (use `eyJ...` JWT format, not `sb_publishable_`), `REED_API_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `JOOBLE_API_KEY`, `DISCORD_WEBHOOK_URL`, `GH_PAT`, `WAKATIME_API_KEY`
- Sources: The Trackr, Google Careers, Meta Careers, ARM Careers, Goldman Sachs, JPMorgan Careers (all Playwright); Greenhouse, Lever, Ashby, SmartRecruiters, Apple, Microsoft, Amazon, Workday (REST APIs); Reed, Adzuna, Jooble, Arbeitnow, Jobicy, Remotive (job boards)
- Student-role filter: only saves internships, placements, spring weeks and graduate schemes; seniors/leads/staff/internal filtered out
- Adzuna URL resolution: `_resolve_url()` follows redirect_url tracking links to the direct company ATS page
- Data lifecycle: `last_scraped_at` refreshed on each run; entries not seen for 30 days are deleted; user-set statuses are never overwritten

---

## Discord presence

- Lanyard API (`api.lanyard.rest/v1/users/1087417301583790212`) - no auth, free service
- User must be in the Lanyard Discord server (one-time join)
- `LiveStatusCards.tsx` polls on a 30-second interval
- `/now`: card always visible; offline state shown at reduced opacity
- `/notes`: card only visible when status is online/idle/dnd
- Multiple concurrent activities shown as a stacked list with type labels (Playing/Listening/Watching) and elapsed time; filtered by `type !== 4` (type 4 is custom status, shown separately)
- Discord user ID: `1087417301583790212`

---

## Daily Discord digest

- Vercel cron: daily at 8am UTC via `GET /api/dashboard/discord-digest` (CRON_SECRET protected)
- Manual trigger: Settings > Discord Digest > "Send now" via `POST /api/dashboard/trigger-discord-digest` (session auth)
- Helper: `lib/send-discord-digest.ts` - queries last 24h of goals, applications, streaks and diary; builds Discord embed with 4 inline fields and applied-today list; POSTs to `DISCORD_WEBHOOK_URL`
- Required in Vercel env vars: `DISCORD_WEBHOOK_URL`, `CRON_SECRET`

---

## Vault expiry alerts

- Vercel cron: daily at 9am UTC via `GET /api/dashboard/vault-expiry-check` (CRON_SECRET protected)
- Route: `app/api/dashboard/vault-expiry-check/route.ts`
- Logic: `lib/vault-expiry-check.ts`
- Checks three expiry sources:
  - `vault_entries.key_expiry` - ISO date string from API key entries (date input, format `YYYY-MM-DD`)
  - `vault_entries.card_expiry` - MM/YY format from card entries (parsed to last day of that month)
  - `inventory_items.warranty_expiry` - ISO date string from inventory warranty fields
- Alert window: 30 days. Any item expiring within 30 days (or already expired) triggers the embed.
- Discord embed: sorted by days remaining (soonest first), red colour if anything expires within 7 days, orange otherwise
- Only sends a Discord message if at least one item is expiring - silent if nothing is due
- Required in Vercel env vars: `DISCORD_WEBHOOK_URL`, `CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## Weekly email digest

- Vercel cron: every Sunday at 18:00 UTC via `GET /api/dashboard/weekly-digest` (CRON_SECRET protected)
- Manual trigger: Settings > Weekly Digest > "Send test" via `POST /api/dashboard/trigger-digest`
- Helper: `lib/send-weekly-digest.ts` - queries Supabase and sends via Resend to `DIGEST_EMAIL`
- Required in Vercel env vars: `RESEND_API_KEY`, `CRON_SECRET`, `DIGEST_EMAIL`

---

## Supabase schema

The whole schema is built from the numbered files in `sql/migrations/` - there is no `sql/schema.sql` any more (it embedded real seed data and was removed). A fresh project runs every migration in numeric order; an existing database runs only the ones not yet applied. The authoritative list of every migration and what it adds lives in [sql/migrations/README.md](../sql/migrations/README.md) - that is the single source of truth, so it is not duplicated here.

Key applications columns added in migrations (all in Section B):

- `opening_date`, `last_year_opening`, `housing_location`, `cv_required`, `cover_letter_required`, `written_answers`, `category` (B.8 - added 2026-05-21)
- `last_scraped_at`, `sponsors_visa` (B.9 - added 2026-05-28)

Inventory URL field (added in migration 008):

Key applications columns added in migrations (all in Section B):

- `opening_date`, `last_year_opening`, `housing_location`, `cv_required`, `cover_letter_required`, `written_answers`, `category` (B.8 - added 2026-05-21)
- `last_scraped_at`, `sponsors_visa` (B.9 - added 2026-05-28)

Inventory URL field (added in migration 008):

- `inventory_items.url` - TEXT nullable; set per item; renders as an external link icon on the inventory card; opened in a new tab when clicked

Vault expiry fields (already present from initial schema):

- `vault_entries.key_expiry` - DATE type, populated by the API key entry form
- `vault_entries.card_expiry` - TEXT type, MM/YY format, populated by the card entry form
- `inventory_items.warranty_expiry` - DATE type, populated by the inventory entry form

---

## Packages installed for dashboard

recharts, sonner, @hello-pangea/dnd, react-day-picker, react-markdown, remark-gfm, bcryptjs, @types/bcryptjs, @radix-ui/react-popover, @radix-ui/react-checkbox, @radix-ui/react-switch, playwright (in scripts/requirements.txt for the Python scraper)
