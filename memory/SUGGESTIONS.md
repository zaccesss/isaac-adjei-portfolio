---
name: suggestions
description: "Deferred feature ideas and suggestions - not yet planned or implemented"
metadata:
  type: project
  updated: 2026-05-24
---

# Suggestions and Future Features

Ideas raised during sessions but not yet planned or implemented. Pick from here in a future session.

---

## Dashboard - Incomplete from 2026-05-24 session (do these first)

### Group F - 3-dot menus for Notes, Diary and Vault (DEFERRED - hit Opus weekly limit)
Each entry card needs a MoreVertical (three-dot) dropdown with:
- **Edit** - existing functionality, just moved into the menu
- **Hide / Show** - toggle a `hidden` boolean column on the table; hidden entries are filtered from the main view with a "N hidden" reveal button
- **Pin / Unpin** - toggle a `pinned` boolean column; pinned entries sort to top of list
- **Lock / Unlock** - toggle a `locked` boolean column; locked entries show a padlock and require the global PIN to reveal content

Affects: `app/dashboard/(protected)/diary/DiaryClient.tsx`, `app/dashboard/(protected)/notes/[folder]/NotesFolderClient.tsx`, and the Vault client component.

Server actions needed: `toggleDiaryHidden`, `toggleDiaryPinned`, `toggleDiaryLocked`, `toggleNoteHidden`, `toggleNoteLocked`, plus vault equivalents.

SQL to run in Supabase BEFORE deploying this group:
```sql
ALTER TABLE diary ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE vault ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE vault ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
```

### Group F - Now section on Notes home page (DEFERRED)
A "Now" card at the top of `app/dashboard/(protected)/notes/page.tsx` with inline-editable fields:
- Building, Studying, Focused on, Listening to
- Stored in Supabase `config` table under key `now_status` as JSON
- Server action: `updateNowStatus(data)`

### Group G - CV templates (DEFERRED - depends on Group C being merged first)
Six role-specific HTML CV files branched from the corrected cv.html:
- `public/resume/cv-software-engineer.html`
- `public/resume/cv-embedded.html`
- `public/resume/cv-cloud.html`
- `public/resume/cv-cybersecurity.html`
- `public/resume/cv-ai-ml.html`
- `public/resume/cv-data.html`

New public picker page: `app/cv/templates/page.tsx` - shows a card per role with View, Download PDF and Download Word buttons.
Extend `app/api/cv-pdf/route.ts` and `app/api/cv-word/route.ts` to accept optional `?template=embedded` query param.

---

## Dashboard - General improvements

### Global search
A command-palette style search (Cmd+K) that queries goals, notes, diary, applications and vault in one shot. Results grouped by section with keyboard navigation.

### Better dashboard home page
- Today's weather (OpenWeatherMap API - Birmingham)
- Upcoming deadlines from assessments/modules table
- Tasks due today from goals table
- Quick-add bar for common actions

### Application kanban view
Visual pipeline board alongside the existing table view. Columns: Wishlist, Applied, OA, Interview, Offer, Rejected. Drag-and-drop to change status.

### Streak charts
Graph streak progress over weeks/months (line or bar chart using Recharts or Chart.js). Show longest streak, current streak and a calendar heatmap.

### Keyboard shortcuts
GitHub-style shortcuts: `g m` (go to Me), `g g` (Goals), `g d` (Diary), `g n` (Notes), `g a` (Applications). Display a shortcut reference panel on `?` key.

### Mobile PWA
Add `manifest.json` and a service worker so the dashboard can be installed on a phone home screen. Already secured via PIN so safe to do.

### Activity log in Settings
Show last N actions taken on the dashboard - login times, what was edited and when. Stored in a `activity_log` table in Supabase. Useful for auditing and for resuming after a break.

### Dark mode persistence
Dark mode preference should be saved to the `config` table so it persists across devices and sessions, not just browser localStorage.

---

## Public site improvements

### "Now" page
A public `/now` page showing what Isaac is currently building, studying and listening to. Data can pull from the same `now_status` config key used by the dashboard Notes section. Spotify data already scraped - wire it up here.

### Blog / writing section
A `/blog` or `/writing` page. The Beehiiv newsletter infrastructure is already wired up - a blog page gives it a public home and improves SEO. Can start with 1-2 posts.

### More prominent project CTAs
Each project card on `/projects` should have a live demo link front and centre (not buried). Add a "Live" chip/badge linking to the deployed URL.

---

## Job scraper - further improvements

### More UK sources
Add dedicated scraper functions for:
- **Reed.co.uk** - large UK job board with internship filter
- **Milkround** - major UK graduate/intern aggregator
- **Prospects.ac.uk** - official UK graduate careers site
- **Indeed UK** - search "software intern" filtered to UK
- **Workable** (`apply.workableapp.com`) - many UK startups post here

### London and Birmingham priority
Add a second scraping pass that specifically targets "london" and "birmingham" location terms to improve local coverage, especially for The Trackr and Greenhouse sources.

### Email alerts for new matches
When the scraper runs and finds new listings matching Isaac's skills (Python, Next.js, C++, embedded), send a Resend email summary rather than waiting for the weekly digest.

---

## CV

### Dashboard CV editor (Phase 2)
Protected route at `app/dashboard/(protected)/cv-editor/page.tsx` that parses CV sections into editable text fields. On save, writes to a session-specific template or Supabase JSON column. Can export as HTML or trigger PDF/Word generation. Plan separately once CV templates (Group G) are live.




this is yest to be done too 
# Implementation Plan - Job Scraper, Settings and UI Fixes

Plan to resolve the job scraper database upsert errors, correct API triggers and UI layouts in dashboard settings, and ensure the weekly digest runs reliably.

## User Review Required

> [!IMPORTANT]
> The database currently lacks a proper unconditional `UNIQUE` constraint or index on the `url` column, which is causing all scraper inserts to fail with PostgREST/PostgreSQL error code `42P10` ("there is no unique or exclusion constraint matching the ON CONFLICT specification"). 
> 
> To resolve this, you must run the following SQL script in your Supabase SQL Editor. This script removes duplicate URLs (preferring newer ones) and creates a clean, unconditional unique index on `url` that matches the `ON CONFLICT (url)` resolution:

```sql
-- 1. Remove all scraped entries first so they do not block index creation and can be cleanly repopulated
DELETE FROM applications WHERE status = 'scraped';

-- 2. Clean up any duplicate URLs in manual entries (keeping the newest one)
DELETE FROM applications
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY url ORDER BY created_at DESC) as rn
    FROM applications
    WHERE url IS NOT NULL AND url <> ''
  ) t
  WHERE rn > 1
);

-- 3. Drop the old partial unique index if it exists
DROP INDEX IF EXISTS applications_url_unique;

-- 4. Create an unconditional unique index on the url column to match the ON CONFLICT clause
CREATE UNIQUE INDEX IF NOT EXISTS applications_url_unique ON applications (url);
```

## Open Questions

None - the root causes are clear and have simple, deterministic fixes.

---

## Proposed Changes

### Database & Scraper Logic

#### [MODIFY] [job-scraper.py](file:///c:/dev/github/repos/isaac-adjei-portfolio/scripts/job-scraper.py)
- Change the `url` insertion field from `job.get("url", "")` to `job.get("url") or None` so missing URLs are stored as `NULL` instead of empty strings `""`. This allows multiple manual/scraped entries without a URL to coexist under the unconditional unique index.

---

### Dashboard Settings & Scraper API

#### [MODIFY] [route.ts](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/api/dashboard/trigger-scraper/route.ts)
- Correct the owner typo in the GitHub API repository dispatch URL from `zaccessss` to `zaccesss` (two 's's). This resolves the `404` ("Workflow file not found") error returned when clicking the "Run now" button.

#### [MODIFY] [route.ts](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/api/dashboard/scraper-status/route.ts)
- Correct the owner typo in the GitHub API workflow runs URL from `zaccessss` to `zaccesss` (two 's's) to fix the status display on the settings page.

#### [MODIFY] [SettingsClient.tsx](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/dashboard/%28protected%29/settings/SettingsClient.tsx)
- Wrap the theme toggle `Sun` and `Moon` icons inside a `relative h-4 w-4 shrink-0` box. Apply `absolute inset-0` to the `Moon` icon. This prevents the absolute-positioned moon icon from overlapping the "Light mode" text in dark mode by keeping the icon container size fixed in the flexbox flow.

---

### Weekly Digest API

#### [MODIFY] [route.ts](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/api/dashboard/trigger-digest/route.ts)
- Pass the `NextRequest` parameter to the `POST` handler.
- Extract the request origin dynamically using `req.nextUrl.origin` and construct the fetch URL to the inner `weekly-digest` route. This avoids relying on `process.env.NEXTAUTH_URL` which might be missing or set incorrectly on Vercel.

#### [MODIFY] [route.ts](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/api/dashboard/weekly-digest/route.ts)
- Change the email sender `from` parameter in Resend from `Nexus Dashboard <dashboard@isaacadjei.me>` to `Nexus Dashboard <contact@isaacadjei.me>`. This guarantees the email will send successfully even if the domain is not fully verified/configured for arbitrary subdomains in Resend (since `contact@isaacadjei.me` is verified and working for the contact form).

---

## Verification Plan

### Automated Tests
- Run `python -m py_compile scripts/job-scraper.py` to ensure no syntax errors.
- Run `npm run build` to verify that all Next.js API routes compile without any TypeScript or lint errors.

### Manual Verification
- After deploying the API routes and running the SQL script in Supabase, click **Run now** under the Job Scraper section in settings to trigger the action.
- Verify that the workflow status updates to "Success" once complete.
- Toggle between light and dark mode in settings and verify that the Sun and Moon icons render next to the text instead of overlapping it.
- Click **Send test** under the Weekly Digest section in settings to verify that the email is sent successfully and a green success message appears.


# Implementation Plan - Job Scraper, Settings, UI and Database Fixes

## User Review Required

> [!IMPORTANT]
> **Database action required.** After I rewrite the SQL file, you need to run **only the migration section at the bottom** in Supabase SQL Editor. This adds the missing columns and index to your existing tables without dropping any data.

> [!WARNING]
> The full file also contains a clean-slate section (DROP + CREATE) at the top for reference or fresh installs. **Do NOT run the full file** unless you want to wipe and rebuild everything from scratch.

## Open Questions

None - all root causes identified.

---

## Proposed Changes

### 1. Database - Full SQL Rewrite

#### [MODIFY] [everything-in-supabase.sql](file:///c:/dev/github/repos/isaac-adjei-portfolio/everything-in-supabase.sql)

Rewrite the entire file cleanly with two sections:

**Section A - Full Schema (reference / fresh installs)**
- All tables with their final column sets
- Group F columns baked into the table definitions: `hidden`, `pinned`, `locked` on diary; `hidden` on notes; `hidden`, `locked` on vault
- `updated_at` column on `goals` (the weekly digest queries this but it is missing from the current schema)
- RLS, policies, all seed data, config, course modules, inventory
- `applications_url_unique` index in the table definition

**Section B - Migration (run on existing DB)**
- ALTER TABLE statements for Group F columns
- ALTER TABLE to add `updated_at` to goals
- DROP + CREATE the unique index on applications(url)
- All with first-person comments

---

### 2. Scraper Logic

#### [MODIFY] [job-scraper.py](file:///c:/dev/github/repos/isaac-adjei-portfolio/scripts/job-scraper.py)
- Change `job.get("url", "")` to `job.get("url") or None` in the `insert_job` record so empty URLs become NULL (avoids unique constraint violations on empty strings)

---

### 3. Dashboard Settings API

#### [MODIFY] [trigger-scraper/route.ts](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/api/dashboard/trigger-scraper/route.ts)
- Fix repo owner typo: `zaccessss` to `zaccesss`

#### [MODIFY] [scraper-status/route.ts](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/api/dashboard/scraper-status/route.ts)
- Fix repo owner typo: `zaccessss` to `zaccesss`

---

### 4. Settings UI

#### [MODIFY] [SettingsClient.tsx](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/dashboard/%28protected%29/settings/SettingsClient.tsx)
- Wrap Sun/Moon icons in a `relative` container so the absolute-positioned Moon does not overlap the "Light mode" text in dark mode

---

### 5. Weekly Digest API

#### [MODIFY] [trigger-digest/route.ts](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/api/dashboard/trigger-digest/route.ts)
- Accept `NextRequest` parameter, use `req.nextUrl.origin` instead of `process.env.NEXTAUTH_URL`

#### [MODIFY] [weekly-digest/route.ts](file:///c:/dev/github/repos/isaac-adjei-portfolio/app/api/dashboard/weekly-digest/route.ts)
- Change sender from `dashboard@isaacadjei.me` to `contact@isaacadjei.me` (verified domain)

---

## Verification Plan

### Automated
- `python -m py_compile scripts/job-scraper.py`
- `npm run build`

### Manual (after deploy + SQL migration)
- Click **Run now** in Settings - should trigger the GitHub Action
- Toggle dark/light mode - icons should not overlap text
- Click **Send test** for weekly digest - should succeed


WARNING

The full file also contains a clean-slate section (DROP + CREATE) at the top for reference or fresh installs. Do NOT run the full file unless you want to wipe and rebuild everything from scratch. - i want to rewrite this  evbrything in there ? so we basiaclly have a fresh sql ?  but this time with all additons and ciorrections?