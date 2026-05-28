# Next Session Plan - Scraper Fixes, PS5 Daemon, Inventory Detail Pages

Delete this file once all items below are implemented.

---

## Background concepts

### What is a daemon?

A **daemon** (pronounced "dee-mon", from Unix "Disk And Execution MONitor") is a background process with no UI that runs continuously. On the MacBook, `mac-daemon.py` is loaded by launchd (macOS's service manager) and wakes every 30 seconds, reads battery and weather, writes to Upstash Redis, then sleeps again. No window, no icon - always running silently. `gpc-daemon.py` and `lenovo-daemon.py` do the same on the other machines.

### What is "Nexus Dashboard"?

"Nexus" (Latin: connection/link) was a placeholder name used when the dashboard email digest was first built. It appears in `lib/send-weekly-digest.ts` in three places and has never been changed. Fix is trivial - see Item 1 below.

---

## Item 1 - Rename "Nexus Dashboard" in email digest (5 min, do first)

**File:** `lib/send-weekly-digest.ts`

Three occurrences to change:

- Line 80: `"Isaac Adjei - Nexus Dashboard"` -> `"Isaac Adjei - Dashboard"`
- Line 203: `"Nexus - Isaac Adjei's private dashboard"` -> `"Isaac Adjei's private dashboard"`
- Line 283: `from: "Nexus Dashboard <contact@isaacadjei.me>"` -> `from: "My Dashboard <contact@isaacadjei.me>"`

**Branch:** `fix/digest-rename` - tiny PR, merge first before anything else.

---

## Item 2 - Scraper fixes (most urgent - broken right now)

### What's wrong (from screenshots)

The internships tab is showing roles that should never appear:

- **MongoDB "Staff Product Manager - Internal AI"** (Palo Alto) - senior PM role at a US office, not an intern
- **MongoDB "Lead Engineer, Internal Engineering"** (Gurugram, India) - full-time senior engineer in India
- **MongoDB "Associate Recruiter (Contract)"** (Gurugram) - recruiter role, non-tech, India
- **Twilio "Technical Video Content Intern"** (Remote - US) - US-only, should be location-filtered
- **Twilio "Go-to-market Analyst Intern"** (Remote - US) - US-only
- **Twilio "Developer Advocacy Intern"** (Remote - US) - US-only
- **Datadog "Software Engineer - Early Career"** (Lisbon, Portugal) - full-time entry-level, not UK
- **Palantir "Forward Deployed Software Engineer, Internship"** (Paris, France) - non-UK
- **Adyen "Internal Auditor - Security"** (Amsterdam) - non-tech, non-UK

### Root causes

**Bug A - "Remote - US" not caught**
`US_LOCATIONS` set probably does not include the exact string `"remote - us"` (lowercase normalised). Fix: add `"remote - us"`, `"remote, us"`, `"us remote"` to `US_LOCATIONS` in `job-scraper.py`. Also reject any location string that ends with `", us"` after normalisation.

**Bug B - "Internal [team]" roles slipping through**
The regex `\b(internal|international|internally)\b` prevents "intern" false-positives but does not reject roles whose TITLE starts with "Internal" as a team descriptor (e.g. "Internal Engineering", "Internal AI"). These are department-facing roles, not student positions. Add a title-level rejection: if the job title begins with the word "Internal" (case-insensitive, word boundary), mark it as `NOT_A_ROLE` and skip entirely. This is separate from the intern-word exclusion.

**Bug C - Default type "Internship" catches senior roles**
`infer_type()` defaults to `"Internship"` when no student-term matches. Senior roles like "Staff Product Manager" and "Lead Engineer" pass no student-term check and so default to Internship type. Fix: add a seniority-term check BEFORE the default - if the title contains `staff`, `principal`, `senior`, `lead`, `director`, `head of`, `manager`, `associate` (non-internship sense), `vp`, `president`, default to `"Full-time Job"` instead of `"Internship"`. Also ensure the `is_student_role()` guard runs before inserting to the internship flow.

**Bug D - Location filtering too loose**
Palantir (Paris), Datadog (Lisbon), Adyen (Amsterdam) are non-UK EU. The corrected location policy is:

- Prioritise UK roles
- Accept: UK, Remote (global), Remote EU, Remote US, Remote Canada, EU cities (France, Germany, Netherlands, Ireland, Sweden, Switzerland), US remote, Canada remote, Singapore, Australia
- Reject: India, Southeast Asia (Vietnam, Philippines, Bangladesh, Pakistan) and other non-major-tech regions
- Remote roles labelled "Remote - US", "Remote - Canada", "Remote - EU" are fine
- Non-remote EU city roles are acceptable for internships

### Fix 2a - Accumulate instead of reset (30-day TTL)

**Current behaviour:** `reset_scraped_entries()` deletes ALL `status='scraped'` rows before each run. Every run wipes the board and repopulates. If the run fails midway, data is lost.

**New behaviour:**

1. Add `last_scraped_at TIMESTAMPTZ` column to `applications` table in Supabase (no default - nullable)
2. SQL migration: `ALTER TABLE applications ADD COLUMN last_scraped_at timestamptz;`
3. Backfill: `UPDATE applications SET last_scraped_at = created_at WHERE status = 'scraped';` (run IMMEDIATELY after migration, before the next scraper run)
4. In scraper: remove `reset_scraped_entries()` call entirely
5. On each upsert, also set `last_scraped_at = NOW()` so live jobs stay fresh
6. At the START of each run (before scraping), delete only truly stale entries:

```python
supabase.table("applications").delete() \
  .eq("status", "scraped") \
  .lt("last_scraped_at", (datetime.utcnow() - timedelta(days=30)).isoformat()) \
  .execute()
```

7. Manual entries (any status other than `scraped`) are never touched

**Scraper frequency:** Run once per day at midnight (00:00 UTC via GitHub Actions cron). If runtime is a concern, run every 3 days - quality over frequency.

### Fix 2b - Fix Industrial Placements and Spring Weeks (keep the tabs)

The Industrial Placements and Spring Weeks tabs stay. The problem is the scraper currently produces 0 results for both types - it is not detecting or classifying them. Fix the scraper to recognise:

- Industrial placement keywords: "placement year", "industrial placement", "12-month placement", "sandwich year", "year in industry"
- Spring week keywords: "spring week", "spring insight", "spring programme", "insight week"

These should be scraped from all sources: Greenhouse API, Lever API, Ashby, Gradcracker, RateMyPlacement, TargetJobs, Bright Network, The-Trackr and direct priority company job pages.

### Fix 2c - Role type coverage

Cover every tech discipline relevant to a CS/EEE student. The scraper currently misses hardware, quant, DevOps and other non-software roles. Add keyword detection for:

- Software engineering (already present)
- Hardware / embedded / firmware / FPGA / PCB / electronics / EE
- AI / ML / data science / data engineering / data analyst
- Cloud / DevOps / platform engineering / infrastructure / SRE
- Quant / quantitative research / quant developer
- Cybersecurity / security engineering
- Any other tech role relevant to the CV and course

Keywords for each should be broad enough to catch variants (e.g. "machine learning" not just "ML").

### Fix 2d - Full field extraction for all sources

For ALL scraped sources (not just Greenhouse), extract:

- `cv_required` (bool) - scan application questions and job text for "cv", "resume"
- `cover_letter_required` (bool) - scan for "cover letter", "covering letter"
- `sponsors_visa` (bool or "Unknown") - scan all job text and application questions for "visa", "right to work", "sponsorship". If not determinable, set `"Unknown"` - not null and not false
- `opening_date` - parse from listing if present
- `closing_date` / `deadline` - parse from listing if present
- `notes` - populate with a 1-2 sentence summary from the job description (salary, perks, key details). If nothing available, leave blank.

For Greenhouse companies, the full application form can be fetched:

```
GET https://boards-api.greenhouse.io/v1/boards/{slug}/jobs/{id}?questions=true
```

The `questions` array contains text for each application field. Scan it for the keywords above. Only do this for the top 30 priority companies to keep scraper runtime under control.

All fields should be populated wherever data exists. Use `"Unknown"` over null for anything that should be determinable. If a URL returns 404 or 4xx, mark the entry as stale or remove it on the next run rather than keeping a dead link.

### Fix 2e - Table row expansion

Applications table rows should expand for long Notes and description text. Add an expand/collapse toggle on any row where content overflows. No truncation that breaks layout.

### SQL schema convention

All new columns (`last_scraped_at`, `sponsors_visa`) must be added to `supabase-schema.sql`:

- SECTION A: add to the `applications` CREATE TABLE statement so fresh installs get them
- SECTION B: add ALTER TABLE migration scripts so existing databases can be updated safely

First-person comments throughout. No Oxford commas. No em/en dashes. UK English.

### Branch and PR

`fix/scraper-accumulate-and-filters` - one PR covering all scraper fixes. Run the Supabase migration BEFORE the next scheduled scraper run. Backfill `last_scraped_at` immediately after migration.

---

## Item 3 - PS5 Status Card

### What "NPSSO token" means and will it expire?

The NPSSO is a session cookie from Sony's authentication servers (`ca.account.sony.com`). It expires after **60 days of inactivity**. However - as long as the daemon is running and making PSN API calls every 60 seconds, the inactivity clock keeps resetting. In practice, if the MacBook is running continuously, the NPSSO **never expires**. You only need to manually renew it if the daemon is stopped for more than 60 days (e.g. laptop off for 2 months). Renewal takes 30 seconds: log into playstation.com, DevTools -> Application -> Cookies -> copy the `npsso` value, update `.env.local` and the launchd plist.

### Architecture

**New file:** `scripts/ps5-daemon.py`

- Runs on MacBook via launchd alongside `mac-daemon.py` but strictly isolated - its own plist, its own PID
- Uses `psnawp-api==2.1.0` Python library
- Polls every 60 seconds (PSN rate limits are generous - no need to go lower)
- Redis keys: `ps5:status` (TTL 120s) and `ps5:last-known` (no TTL)

**Payload written to Redis:**

```json
{
  "online": true,
  "status": "playing",
  "game": "EA Sports FC 25",
  "platform": "PS5",
  "lastSeen": "2026-05-28T01:30:00Z"
}
```

**New env var:** `PSN_NPSSO` - 64-character hex string from the browser cookie.

- Add a blank entry with comment to `.env.local.example`
- Add to Vercel project settings (Production + Preview)
- Never commit the real value anywhere

**New API route:** `app/api/ps5/route.ts` - mirrors `app/api/gpc/route.ts` exactly, reads `ps5:status` with fallback to `ps5:last-known`

**New launchd plist:** `scripts/com.zacess.ps5-daemon.plist` - mirrors mac-daemon plist, `KeepAlive = true`, StartInterval 60

**Core daemon code:**

```python
from psnawp_api import PSNAWP
psnawp = PSNAWP(npsso_token=os.environ["PSN_NPSSO"])
client = psnawp.me()
presence = client.get_presence()
# I read the game title from gameTitleInfoList[0]["titleName"] when present
# availability values: "availableToPlay" / "doNotDisturb" / "unavailable"
```

**Account scope:** `psnawp.me()` reads my PSN account presence only - not the physical PS5 device. If someone else plays on their own PSN account on the same console, the card shows me as offline. This is the correct behaviour.

**Rest mode:** When PS5 enters rest mode, PSN reports `availability: "unavailable"` and stops updating presence. The card shows "Offline" with the last-seen time from before rest mode. Last seen and status match in this state.

### PS5 device name

PSN's presence API returns `platform` ("PS5") only - it does not return the console's custom name. You CAN set a custom name on the PS5 at Settings > System > Console Name but it does not appear in the presence API. The display name is hardcoded as `ZACCESS-PS5` in LiveStatusCards.tsx.

### PS5 daemon setup walkthrough

Follow these steps in order when setting up the daemon on the MacBook:

**Step 1** - Install the Python library:

```bash
pip3 install psnawp-api==2.1.0
```

**Step 2** - Get your NPSSO token:

- Open browser, go to playstation.com and sign in
- Open DevTools (Cmd+Option+I) -> Application tab -> Cookies -> ca.account.sony.com
- Find the cookie named `npsso` - copy its value (64-character hex string)

**Step 3** - Add to `.env.local`:

```
PSN_NPSSO=your_64_char_token_here
```

**Step 4** - Add to Vercel (project -> Settings -> Environment Variables):
Key: `PSN_NPSSO`, Value: the 64-char token. Apply to Production and Preview.

**Step 5** - Add to the launchd plist EnvironmentVariables block (same section as UPSTASH keys in mac-daemon plist):

```xml
<key>PSN_NPSSO</key>
<string>your_token_here</string>
```

**Step 6** - The code and plist files are created as part of the PR. Once merged, load the plist:

```bash
cp scripts/com.zacess.ps5-daemon.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.zacess.ps5-daemon.plist
```

**Step 7** - Verify it started and mac-daemon is still running:

```bash
launchctl list | grep zacess
tail -f /tmp/ps5-daemon.log
```

**Note on credentials:** The user will provide NPSSO token and Upstash details directly in chat when we reach this step. Insert them directly into terminal commands. Do not hardcode or commit.

### LiveStatusCards.tsx layout change

**New full layout (top to bottom):**

1. Weather + Time (full width)
2. Spotify (full width)
3. GitHub strip (full width, one line): `[GitHub icon]  |  [GitBranch icon]  pushed  **repo-name**  time`
4. 2x2 device grid: MacBook | Lenovo | GPC | PS5

The GitHub strip replaces the GitHub card in the 2x2 grid. It is full-width and one line tall - same width as weather and Spotify cards. GitHub icon first, then a divider, then GitBranch icon, then "pushed", then repo name (bold), then relative time (muted).

**PS5 card (4 lines, accent colour blue matching other device cards):**

1. SiPlaystation5 icon + "ZACCESS-PS5"
2. Last seen relative time - always shown
3. Status: "Playing", "Online" or "Offline"
4. Game or app name - only shown when a game or media app (Twitch, Netflix, YouTube, Spotify etc.) is active. Disappears when nothing is open.

**Branch:** `feat/ps5-daemon`

---

## Item 4 - Inventory Item Detail Pages

### Problem

`/dashboard/inventory/tech-and-devices` shows all items as cramped 2-column cards. Fields like purchase date, notes and full description are clipped. There is no way to see a single item's full details without opening the edit dialog.

### Solution

Add route: `app/dashboard/(protected)/inventory/[category]/[id]/page.tsx`

**New files:**

- `app/dashboard/(protected)/inventory/[category]/[id]/page.tsx` - server component, fetches single item by id, passes to client
- `app/dashboard/(protected)/inventory/[category]/[id]/InventoryItemClient.tsx` - renders full detail layout

**Modified files:**

- `app/dashboard/(protected)/inventory/[category]/InventoryCategoryClient.tsx` - wrap each ItemCard in a `<Link href={.../{item.id}}>`. Stop edit/delete icon clicks from navigating (use `e.stopPropagation()`).
- `app/dashboard/actions.ts` - after `deleteInventoryItem`, redirect to the category page (use `redirect()` from `next/navigation`)

**Detail page layout:**

```
<- Back to Tech and Devices        [Edit]  [Delete]

MacBook Air 13-inch (M5)
[Tech and Devices]

Description    Apple M5, 24GB RAM, 512GB SSD, macOS Tahoe 26
Serial         C02X9FXX9Y
Model          Mac17,3 - Production year 2026
Quantity       1
Price paid     £1,299
Purchase date  March 2026
Warranty       March 2027  <- red if within 3 months
Notes          Primary dev machine
```

Also add `updated_at` column to `inventory_items` Supabase table (currently missing) with an auto-update trigger.

SQL (add to `supabase-schema.sql` SECTION A and SECTION B):

```sql
ALTER TABLE inventory_items ADD COLUMN updated_at timestamptz DEFAULT now();
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Branch:** `feat/inventory-detail-pages`

---

## Item 5 - Notes page live indicator + LiveStatusCards on /now page

### Notes page tagline

Current text: "A public notebook. Not polished posts, just honest notes on what I am building, thinking about and planning. Updated as things change."

Update to signal it is a live/actively updated page. Add a small pulsing dot indicator next to the heading or tagline (matching the style used in other live components), or update the wording to include "Live notebook" or "Updated live". The exact phrasing is flexible but it must make clear the page changes in real time.

### LiveStatusCards on /now page

LiveStatusCards currently appears on the /notes page only. Add it to the /now page too. It should render identically - same polling, same layout. No new component needed, just import and render LiveStatusCards in the /now page.

These are public-facing changes. Add to CHANGELOG.md under [Unreleased].

**Branch:** `feat/notes-live-indicator-and-now-cards`

---

## Suggested sequence

| Order | Branch | Notes |
|-------|--------|-------|
| 1 | `fix/digest-rename` | 3-line change, done in 5 min |
| 2 | `fix/scraper-accumulate-and-filters` | Run Supabase migration BEFORE next scraper run |
| 3 | `feat/inventory-detail-pages` | Independent - no blockers |
| 4 | `feat/ps5-daemon` | Needs PSN_NPSSO env var ready |
| 5 | `feat/notes-live-indicator-and-now-cards` | Simple public change |

---

## Additional advice

- **Scraper runtime:** Current full run takes ~4-6 min. The CV/cover-letter Greenhouse calls add ~30s for 30 companies. If runtime exceeds limits, switch to every 3 days rather than daily.
- **PS5 daemon isolation:** The PS5 daemon must not touch, restart or modify mac-daemon or any other running service. Verify with `launchctl list | grep zacess` after setup.
- **Inventory pagination:** With 9 items currently it is fine, but add pagination to the category page before it grows - `LIMIT 50 OFFSET n` on the Supabase query.
- **`last_scraped_at` backfill timing:** Run the backfill UPDATE immediately after the migration, before the next scheduled scraper run, or all existing scraped rows will look 30+ days stale and get deleted on first run.
- **MongoDB and other priority companies:** After the scraper fixes, re-check the priority company list and remove any whose jobs are consistently non-UK and non-intern.
- **Weather accuracy:** +/- 2-3 degrees difference between the dashboard and macOS weather is normal (different data sources). Investigate switching to Tomorrow.io or WeatherKit tied to exact GPS coordinates for better accuracy. Add to SUGGESTIONS.md.
- **Subagents:** Use subagents where parallel work is possible. Write clear, detailed prompts with full context so each agent does not need to ask for it. If anything is unclear at any point, stop and ask instead of assuming.
- **All code comments:** First person throughout ("I check...", "I use..."). Descriptive and clear.

---

## Session end tasks (after all items implemented)

1. Update `docs/verification.md` with these checks:
   - Item 1: Send test digest from Settings, confirm sender shows "My Dashboard"
   - Item 2: Trigger scraper from Settings, check no senior/US/India roles in internships, check placements and spring weeks tabs have results
   - Item 3: Confirm `ps5:status` key in Upstash Redis, PS5 card renders correctly in LiveStatusCards
   - Item 4: Navigate to /dashboard/inventory/tech-and-devices, click a card, confirm detail page loads
   - Item 5: Confirm /now page shows LiveStatusCards, notes page tagline has live indicator
   - Security: `grep -r "npsso\|upstash\|redis_token\|api_key" --include="*.ts" --include="*.py" .` to confirm no secrets committed

2. Run full security check - no secrets committed, all API routes return Cache-Control: no-store, robots.txt still correct, rate limiting active

3. Update pages if content is now stale:
   - `/colophon` - if PS5 daemon changes the tech stack listed
   - `/now` - if anything material changed
   - `/uses` - if new tools or devices added (PS5 daemon, psnawp library)
   - Any blog post describing how the site was built
   - `README.md` and `docs/DOCUMENTATION.md` - new env vars, new daemon, new routes

4. Log all items in `docs/LOG.md` (private changes only - nothing goes in CHANGELOG.md for these items)

5. Delete this file

---

## Previous session work (completed - for reference)

PRs #203-207 all merged to main:

- #203: memory/ -> docs/, README rewrite
- #204: Security hardening (OG sanitisation, rate limiting, Cache-Control, server action validation)
- #205: ShareButton + OG thumbnails on all public pages
- #206: Em/en dash removal, ShareButton scoped to project/blog/cv/links, Oxford commas removed
- #207: Verification checklist updated
