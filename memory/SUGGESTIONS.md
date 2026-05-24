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
