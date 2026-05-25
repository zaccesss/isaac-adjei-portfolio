---
name: suggestions
description: "Remaining private dashboard phases (11-17) - detailed implementation plan"
metadata:
  type: project
  updated: 2026-05-25
---

# Private Dashboard - Phases 11-17

Remaining implementation work for the private dashboard. These phases build on the existing dashboard infrastructure (Goals, Notes, Diary, Vault, Applications, Streaks, Settings).

---

## Phase 11: Mood Analytics in Diary

Add mood tracking with visual analytics to the diary section.

### Implementation

**Database changes:**
```sql
ALTER TABLE diary ADD COLUMN IF NOT EXISTS mood text;
```

**UI changes:**
- Add mood selector in diary entry form (emoji-based: happy, neutral, sad, stressed, productive)
- Display mood icon on each diary entry card
- Add mood analytics card showing:
  - Mood distribution over time (pie chart)
  - Mood trend line (last 30 days)
  - Average mood by day of week

**Files to modify:**
- `app/dashboard/(protected)/diary/DiaryClient.tsx` - add mood selector and display
- `app/dashboard/(protected)/diary/page.tsx` - add analytics section
- `app/dashboard/actions.ts` - add `updateDiaryMood` action

---

## Phase 12: 3-Dot Menus for Notes, Diary and Vault

Add MoreVertical (three-dot) dropdown menus to each entry card with additional actions.

### Implementation

**Database changes:**
```sql
ALTER TABLE diary ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE vault ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE vault ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
```

**Menu actions:**
- **Edit** - existing functionality, moved into menu
- **Hide / Show** - toggle `hidden` column; hidden entries filtered from main view with "N hidden" reveal button
- **Pin / Unpin** - toggle `pinned` column; pinned entries sort to top
- **Lock / Unlock** - toggle `locked` column; locked entries show padlock and require global PIN to reveal

**Files to modify:**
- `app/dashboard/(protected)/diary/DiaryClient.tsx`
- `app/dashboard/(protected)/notes/[folder]/NotesFolderClient.tsx`
- `app/dashboard/(protected)/vault/[type]/VaultTypeClient.tsx`
- `app/dashboard/actions.ts` - add toggle actions for all three tables

---

## Phase 13: "Now" Section on Notes Home

Add a "Now" card at the top of the notes page showing current status.

### Implementation

**Database changes:**
```sql
INSERT INTO config (key, value) VALUES ('now_status', '{"building":"","studying":"","focused_on":"","listening_to":""}') ON CONFLICT (key) DO NOTHING;
```

**UI changes:**
- Add "Now" card at top of `app/dashboard/(protected)/notes/page.tsx`
- Inline-editable fields: Building, Studying, Focused on, Listening to
- Stored in Supabase `config` table under key `now_status` as JSON

**Server action:**
- `updateNowStatus(data)` in `app/dashboard/actions.ts`

---

## Phase 14: Better Dashboard Home Page

Enhance the dashboard home with useful widgets.

### Implementation

**Add to `app/dashboard/DashboardHome.tsx`:**
- Today's weather (OpenWeatherMap API - Birmingham)
- Upcoming deadlines from assessments/modules table
- Tasks due today from goals table
- Quick-add bar for common actions (Add Note, Add Diary Entry, Add Goal)

**Environment variable:**
- `OPENWEATHER_API_KEY` for weather data

---

## Phase 15: Application Kanban View

Add visual pipeline board alongside existing table view.

### Implementation

**New route:** `app/dashboard/(protected)/applications/kanban/page.tsx`

**Columns:** Wishlist, Applied, OA, Interview, Offer, Rejected

**Features:**
- Drag-and-drop to change status (use @hello-pangea/dnd or similar)
- Sync with existing applications table
- Toggle between table and kanban views

**Files to modify:**
- `app/dashboard/(protected)/applications/page.tsx` - add view toggle
- `app/dashboard/actions.ts` - add `updateApplicationStatus` action

---

## Phase 16: Streak Charts

Add visual analytics for streak progress.

### Implementation

**Add to `app/dashboard/(protected)/streaks/page.tsx`:**
- Line chart showing streak progress over weeks/months (use Recharts)
- Calendar heatmap (GitHub-style) showing check-in history
- Stats cards: longest streak, current streak, total check-ins

**Data aggregation:**
- Query `streak_logs` table for historical data
- Group by week/month for trend line
- Build calendar grid from date range

---

## Phase 17: Activity Log in Settings

Show recent dashboard activity for auditing and resuming work.

### Implementation

**Database changes:**
```sql
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log (created_at DESC);
```

**UI changes:**
- Add activity log section to `app/dashboard/(protected)/settings/SettingsClient.tsx`
- Show last 50 actions with timestamps
- Group by day for readability
- Filter by action type (create, update, delete)

**Server action:**
- `logActivity(action, entityType, entityId, details)` in `app/dashboard/actions.ts`
- Call this action from all existing create/update/delete actions

---

## SQL Migration Script

Run this in Supabase SQL Editor before deploying phases 11-17:

```sql
-- Phase 11: Mood in diary
ALTER TABLE diary ADD COLUMN IF NOT EXISTS mood text;

-- Phase 12: 3-dot menu columns
ALTER TABLE diary ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE vault ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE vault ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;

-- Phase 13: Now status config
INSERT INTO config (key, value) VALUES ('now_status', '{"building":"","studying":"","focused_on":"","listening_to":""}') ON CONFLICT (key) DO NOTHING;

-- Phase 17: Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log (created_at DESC);
```

---

## Implementation Order

1. **Phase 11** (Mood Analytics) - standalone, no dependencies
2. **Phase 12** (3-Dot Menus) - requires database migration
3. **Phase 13** (Now Section) - standalone, simple
4. **Phase 14** (Dashboard Home) - standalone, visual only
5. **Phase 15** (Kanban View) - extends existing applications
6. **Phase 16** (Streak Charts) - analytics on existing data
7. **Phase 17** (Activity Log) - requires adding logging to all actions

Each phase should be a separate branch and PR following the workflow in `.github/WORKFLOW.md`.