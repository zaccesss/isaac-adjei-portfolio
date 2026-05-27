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
