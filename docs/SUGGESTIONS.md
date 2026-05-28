---
name: suggestions
description: "Deferred feature ideas - not yet implemented"
metadata:
  type: project
  updated: 2026-05-26
---

# Future Features

Ideas raised during sessions but not yet planned or implemented.

---

## Dashboard - Backlog

### 3-dot menus for Diary, Notes and Vault (Group F)

Each entry card needs a MoreVertical dropdown with Hide/Show, Pin/Unpin, Lock/Unlock and Edit.

SQL to run in Supabase BEFORE deploying:
```sql
ALTER TABLE diary ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE vault ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE vault ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
```

Server actions needed: `toggleDiaryHidden`, `toggleDiaryPinned`, `toggleDiaryLocked`, `toggleNoteHidden`, `toggleNoteLocked` plus vault equivalents.

Files: `app/dashboard/(protected)/diary/DiaryClient.tsx`, `app/dashboard/(protected)/notes/[folder]/NotesFolderClient.tsx`, vault client.

---

### Now section on Notes home page

A "Now" card at the top of the notes page with inline-editable fields: Building, Studying, Focused on, Listening to. Stored in `config` table under key `now_status` as JSON. Server action: `updateNowStatus(data)`.

---

### CV editor in Dashboard

Protected route at `app/dashboard/(protected)/cv-editor/page.tsx`. Parses cv.yml sections into editable fields. On save, writes back to cv.yml or a Supabase JSON column and triggers PDF regeneration.

---

### Application Kanban view

Visual pipeline board alongside the existing table view. Columns: Wishlist, Applied, OA, Interview, Offer, Rejected. Drag-and-drop to change status using the existing `updateApplication` server action.

---

### Mobile PWA

Add `manifest.json` and a service worker so the dashboard can be installed on a phone home screen.

---

### Activity log

Show last N actions taken on the dashboard - login times, edits, check-ins. Stored in an `activity_log` Supabase table.

---

## Job scraper - further improvements

- **Reed.co.uk** - large UK job board with internship filter
- **Milkround** - UK graduate aggregator
- **Prospects.ac.uk** - official UK graduate careers site
- **Email alerts** - when scraper finds new listings matching Isaac's skills, send a Resend summary rather than waiting for the weekly digest

### Database fix still needed

Run this SQL in Supabase if the scraper is still failing on duplicate URL conflicts:
```sql
DELETE FROM applications WHERE status = 'scraped';
DELETE FROM applications
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY url ORDER BY created_at DESC) as rn
    FROM applications WHERE url IS NOT NULL AND url <> ''
  ) t WHERE rn > 1
);
DROP INDEX IF EXISTS applications_url_unique;
CREATE UNIQUE INDEX IF NOT EXISTS applications_url_unique ON applications (url);
```

---

## Public site

### More prominent project CTAs
Each project card on `/projects` should have a live demo link front and centre.

### Blog / writing

A `/blog` or `/writing` page. The Beehiiv newsletter infrastructure is already wired up.

---

## Live status widget

### Apple WeatherKit - match the system Weather app exactly

The daemon currently uses Open-Meteo which can be 2-3 degrees off the macOS Weather app because they use different data sources. **Apple WeatherKit is the most accurate option** - it is the same API that powers the built-in Weather app on iPhone, iPad and Mac, so the widget and your phone would always show identical temperature and conditions. Free tier: 500k calls/month. Requires an Apple Developer account ($99/yr) and JWT-based authentication (more complex than a standard REST key).

If the Apple Developer account is not worth it, **Tomorrow.io** is the best free alternative - typically within 0.5 degrees and uses a simple API key.

Additional benefit of WeatherKit: it provides hourly sunrise and sunset times per location. This would let the daemon calculate night dynamically instead of using a fixed 5am cutoff, so the moon emoji switches at the exact local sunrise time regardless of season or latitude - a much cleaner solution.

Implementation plan (WeatherKit):

1. Create a WeatherKit service identifier in the Apple Developer portal
2. Generate a private key and sign JWT tokens in the daemon using `python-jose` or `authlib`
3. Call `https://weatherkit.apple.com/api/v1/weather/{lang}/{lat}/{lon}` with the JWT header
4. Map `conditionCode` to emoji (Apple uses its own condition code set, not WMO)
5. Use `solarEvents.sunrise` and `solarEvents.sunset` from the `forecastDaily` endpoint to replace the fixed `localHour < 5` cutoff

### PS5 NPSSO renewal reminder

The NPSSO session token expires after 60 days of inactivity. If the Cloudflare Worker stops writing to Redis, the PS5 card silently shows stale data. Add a Vercel cron (weekly) that checks the age of the `ps5:status` key and sends a Resend email if the key is missing or older than 50 days, prompting a manual NPSSO renewal before it expires.

---

## Dashboard

### Inventory pagination

Category pages load all items with no pagination. Add `LIMIT 50 OFFSET n` on the Supabase query and simple prev/next controls before the list grows past 50 items.

---

## Newsletter

### Beehiiv newsletter page - match site branding

The Beehiiv-hosted newsletter page (the one Beehiiv generates for subscribers) uses Beehiiv's default branding, not the site's design. Update the Beehiiv publication settings to match isaacadjei.me: dark background, Geist font, the same colour palette and header style used on the /newsletter page. Beehiiv supports custom CSS and logo upload in the publication settings. The goal is that someone clicking through from the site to the Beehiiv archive page does not feel like they have landed on a generic platform page.
