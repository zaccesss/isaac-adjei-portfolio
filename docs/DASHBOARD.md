# Private Dashboard - Current State

**Status: FULLY BUILT. Do not rebuild anything from scratch.**

Private section at `/dashboard` - not linked from public nav, sitemap or command menu.

---

## Auth

- NextAuth.js v5 (Auth.js) GitHub OAuth, numeric user ID allow-list (`ALLOWED_GITHUB_ID`)
- All DB access via server actions only - never direct Supabase calls from client components
- PIN gate: `AUTH_SECONDARY_PIN` env var. Cookie `dashboard_pin_verified` (httpOnly, 4-hour maxAge) unlocks Diary, Notes and Vault
- PIN fix: routes use `auth()` from `@/auth` - NOT `getToken` from next-auth/jwt (that is NextAuth v4 and always returns null)
- Inactivity auto-logout: 1 hour

---

## All routes (all live as of 2026-05-21)

| Route | Notes |
|-------|-------|
| /dashboard | Home overview page - stat cards for all sections |
| /dashboard/me | Personal profile |
| /dashboard/us | Relationship page |
| /dashboard/goals | Overview cards by category - links to /goals/[category] |
| /dashboard/goals/[category] | Full CRUD for personal/academic/career/health/finance/other |
| /dashboard/health | Overview cards - links to /health/[section] |
| /dashboard/health/[section] | gym, nutrition, running |
| /dashboard/diary | PIN gated, mood picker |
| /dashboard/notes | Folder overview - links to /notes/[folder] |
| /dashboard/notes/[folder] | Full CRUD per folder, PIN gated |
| /dashboard/wishlist | Overview by category - links to /wishlist/[category] |
| /dashboard/wishlist/[category] | Full CRUD per category |
| /dashboard/inventory | Overview by category - links to /inventory/[category] |
| /dashboard/inventory/[category] | Full CRUD per category |
| /dashboard/course | Editable modules table |
| /dashboard/modules | Overview by year - links to /modules/[year] |
| /dashboard/modules/[year] | year-1, year-2, placement, final-year |
| /dashboard/applications | Trackr-like table with tabs |
| /dashboard/vault | Overview by type - links to /vault/[type] |
| /dashboard/vault/[type] | account, api-key, card, note, identity - PIN gated |
| /dashboard/streaks | 30-day heatmap |
| /dashboard/settings | PIN change, lock all, scraper status, Run Now |
| /dashboard/gym | Redirects to /health |
| /dashboard/internships | Redirects to /applications |
| /dashboard/tech | Redirects to /inventory |

---

## Settings page (/dashboard/settings)

- Change PIN: calls `POST /api/dashboard/change-pin`
- Lock all: calls `DELETE /api/dashboard/verify-pin`
- Scraper status: calls `GET /api/dashboard/scraper-status` (GitHub Actions API)
- Run Now: calls `POST /api/dashboard/trigger-scraper` (requires `GH_PAT` in Vercel)

## Lock button and Cmd+L

- Diary, Notes and Vault all have a Lock button and Cmd+L shortcut
- Both call `DELETE /api/dashboard/verify-pin` then `router.refresh()`

---

## Weekly email digest

- Vercel cron every Sunday 6pm: `POST /api/dashboard/weekly-digest`
- Requires `CRON_SECRET` and `DIGEST_EMAIL` env vars in Vercel
- Sends via Resend from `dashboard@isaacadjei.me`
- Sections: goals updated, applications activity, streak check-ins, diary moods

---

## Applications tracker

Tabs: Summer Internships / Industrial Placements / Graduate Schemes / Spring Weeks / Events / Jobs

Table columns: My Status (inline dropdown), Company, Programme, Opening Date, Closing Date, Last Year Opening, Find Housing, CV, Cover Letter, Written Answers, Sponsors Visa, Notes

Category groups: FAANG+, Software Engineering, Data Science, AI and Machine Learning, DevOps and Infrastructure, Quant Developer, Tech Consulting, Cyber Security, Startups, IT, Miscellaneous

My Status values: Not Applied, Interested, Application Submitted, Online Assessment, Case Study, HireVue, Telephone Interview, Video Interview, Face-to-face Interview, Assessment Centre, Offer Received, Rejected, Not Interested

---

## Job scraper

- GitHub Actions cron every 30 minutes (`.github/workflows/job-scraper.yml`)
- Secrets needed: `SUPABASE_URL` and `SUPABASE_ANON_KEY` as GitHub repo secrets (use legacy `eyJ...` format, not `sb_publishable_`)
- Sources: The Trackr (Playwright), Greenhouse API, Lever API, Ashby, Gradcracker, RateMyPlacement, TargetJobs, BrightNetwork, TotalJobs, Remotive
- Student-role filter: only saves internships, placements, spring weeks and graduate schemes
- Deletes all `status=scraped` entries at run start then repopulates

---

## Supabase schema

All tables are in `supabase-setup.sql`. Key migrations applied:

```sql
-- Applied 2026-05-21: new applications columns
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS opening_date date,
  ADD COLUMN IF NOT EXISTS last_year_opening date,
  ADD COLUMN IF NOT EXISTS housing_location text,
  ADD COLUMN IF NOT EXISTS cv_required text,
  ADD COLUMN IF NOT EXISTS cover_letter_required text,
  ADD COLUMN IF NOT EXISTS written_answers text,
  ADD COLUMN IF NOT EXISTS sponsors_visa text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Software Engineering';
```

---

## Packages installed for dashboard

recharts, react-day-picker, react-markdown, remark-gfm, bcryptjs, @types/bcryptjs, @radix-ui/react-popover, @radix-ui/react-checkbox, @radix-ui/react-switch, playwright (Python scripts/requirements.txt)
