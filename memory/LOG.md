# Session Log

All session logs - newest first. Public-facing changes also in CHANGELOG.md.

---

## 2026-05-24 - CV awards and experience emphasis

- Removed duplicated school names from education award lines in `public/resume/cv.html`
- Restored bold keyword emphasis in Experience bullets and regenerated CV PDF/DOCX artefacts
- Updated CV artefact workflow to regenerate PDF/DOCX on PR branches instead of pushing to protected `main`

---

## 2026-05-24 - CV download artefacts regenerated

- Regenerated `public/resume/Isaac_Adjei_CV.pdf` from the merged CV HTML after PR #164
- Added `public/resume/Isaac_Adjei_CV.docx` so Word download has a committed artefact

---

## 2026-05-24 - Dashboard fixes and login redesign

### Group A + B - Dashboard fixes and login redesign (feat/dashboard-fixes-login)

- A1: Added metadata export to `(protected)/layout.tsx` so all dashboard tabs show "Isaac Adjei | Dashboard" without affecting the public site root layout
- A2: Fixed LinkedIn URL template in `MeClient.tsx` to use `www` and a trailing slash
- A3: Created `(protected)/page.tsx` so the dashboard home grid renders inside the sidebar layout; deleted the outer `page.tsx` (was causing TypeScript error); added "Open Dashboard" CTA button linking to `/dashboard/me`
- A4: Added PIN gate to Course and Modules pages via new `CourseWrapper.tsx` and `ModulesWrapper.tsx` client components; updated Settings PIN-protected pages text to include Course and Modules
- A5: Added "Preferences" section to `SettingsClient.tsx` with a Sun/Moon toggle that calls `setTheme` from `next-themes`
- A6: Created `app/api/dashboard/trigger-digest/route.ts` as an authenticated wrapper around the weekly-digest route; added "Weekly Digest" section in Settings with "Send test" button and success/error feedback
- A7: Mapped GitHub API status codes in `trigger-scraper/route.ts` to human-readable messages; Settings scraper handler now shows the specific `error` field from the API response
- B: Redesigned login page with avatar image, bold name, styled card and full-width GitHub sign-in button

---

## 2026-05-24 - CV content edits

### Group C - CV content edits (fix/cv-content-edits)

- Added cybersecurity to profile
- Merged Aston University education bullets into one
- Added pipe school/country format to both education awards; added font-weight: normal to .edu-award
- Added Java to Languages; changed PHP 8.2 to PHP in Web/Frameworks; added Kubernetes to Cloud/DevOps
- AstonCV project: 11 -> 12+ security controls; Implemented -> Engineered
- Synonyms: LED Cube Implemented -> Introduced; CNC Implemented -> Engineered; BA Analysed -> Reviewed; Yunex Analysed -> Examined
- Ghana High Commission roles: merged to single technical bullet each

---

## 2026-05-24 - CV Word download

### Group D - CV Word download (feat/cv-word-download)

- Installed html-to-docx package
- Created app/api/cv-word/route.ts - reads cv.html live, returns .docx with correct MIME type
- Added "Download Word" button to CVViewer next to existing download buttons
- Extended .github/workflows/cv-pdf.yml to also generate Isaac_Adjei_CV.docx on cv.html changes

---

## 2026-05-24 - Applications tab and scraper fixes

### Group E - Applications tab and scraper fixes (fix/applications-scraper-fixes)

- Renamed "Summer Internships" tab to "Internships" and "Summer Internship" type to "Internship" throughout ApplicationsClient.tsx
- Fixed job-scraper.py whole-word regex for "intern" to stop false positives from "internal"/"international"
- Scraper type labels updated: "Summer Internship" -> "Internship"
- Changed scraper insert to upsert (on_conflict=url) to prevent duplicate inserts
- Added empty-set guard in load_existing_keys with clear warning log
- Confirmed CYCLE_CUTOFF is datetime(2025, 9, 1)
- Improved trigger-scraper route error messages with status-code-to-text mapping
- Updated Settings UI to show specific scraper error text from API response

---

## 2026-05-21 - Full dashboard overhaul, CV update, codebase comments

### What we did
- Dashboard home page at `/dashboard` - mission-control overview with stat cards for all sections
- Settings page at `/dashboard/settings` - PIN change, lock all, scraper status, Run Now trigger
- Manual lock button and Cmd+L shortcut on Diary, Notes and Vault
- Sub-pages for all sections: Goals by category, Modules by year, Health (Gym/Nutrition/Running), Vault by type, Wishlist by category, Inventory by category, Notes by folder - all dynamic [param] routes
- Weekly email digest via Vercel cron every Sunday 6pm - Resend to DIGEST_EMAIL
- New API routes: scraper-status, trigger-scraper, weekly-digest
- DashboardBreadcrumb component, Settings sidebar link, Framer Motion dashboard variants
- getDashboardSummary server action (parallel Supabase queries)
- Security audit: all API routes verified, PIN checks confirmed server-side, robots.txt updated to disallow /dashboard
- First-person comments added across all new dashboard files and public API routes
- CV updated: profile rewritten, one-page, Java removed, skills headings renamed, Jupyter Notebooks added, git-unlocked corrected to 217+ files, PHAEMOS marked active development, AstonCV website link updated to astoncv.zacess.com, volunteering merged to 1 bullet each, bold key terms
- Auto-regenerate PDF workflow: `.github/workflows/cv-pdf.yml` - triggers on cv.html push to main
- Memory folder reorganised: RULES.md, PROJECT.md, DASHBOARD.md, combined LOG.md
- PRs merged: #157 (dashboard overhaul), #158 (CV PDF), #159 (CV PDF auto-workflow)

---

## 2026-05-21 - Applications tracker: scraper fixes, Jobs tab, filters

### What we did
- Fixed Add/Edit dialog white screen: Radix UI Select v2 rejects `value=""` on SelectItem; replaced all 5 optional Selects with sentinel values `"auto"` / `"none"`
- Fixed scraper ingesting full-time jobs and US jobs: removed priority-company exception, added US_LOCATIONS reject list
- Fixed 2024 entries: added CYCLE_CUTOFF = 2025-09-01
- Fixed opening_date stored in notes string: now written to proper DB column
- Fixed stale data: reset_scraped_entries() deletes all status=scraped rows at run start
- Added Jobs tab: full-time tech roles, dual-pass Greenhouse/Lever/Ashby
- Added Remotive scraper: remote full-time jobs
- Removed location restriction from internship scraping: worldwide, location shown in table
- Added Location column, location priority sort, Location and Keyword filter dropdowns
- Pinned job scraper to ubuntu-22.04 (ubuntu-latest = 24.04 breaks Playwright)
- Removed CV from /all-pages listing
- PRs #149-#154 merged

---

## 2026-05-21 - Applications page rebuilt, job scraper overhaul, PIN auth fix

### What we did
- PIN gate returning 401: root cause was `getToken` (NextAuth v4) used in NextAuth v5 project; fixed by replacing with `auth()` in verify-pin and change-pin routes
- Applications page full rewrite to match The Trackr layout: tabs, inline status dropdown, category groups, date colour coding, stats bar
- Job scraper full rewrite: Playwright for The Trackr, Greenhouse JSON API, Lever JSON API, Ashby, Gradcracker, RateMyPlacement, TargetJobs, student-role filter, URL deduplication
- New applications DB fields: opening_date, last_year_opening, housing_location, cv_required, cover_letter_required, written_answers, sponsors_visa, category

---

## 2026-05-20 - Full Nexus dashboard build (PRs #140-#145)

### What we did
- Set up NextAuth.js v5 with GitHub OAuth, numeric user ID allow-list
- Created Supabase project, wrote all tables and seed data in supabase-setup.sql
- Built all dashboard sections: Me, Us, Goals, Health, Diary (PIN gate), Notes, Wishlist, Inventory, Course, Modules, Applications, Vault (PIN gate), Streaks
- Sidebar: collapsible, mobile hamburger, correct nav order
- Inactivity auto-logout: 1 hour

---

## 2026-05-20 - /consumed page, /now, brace-expansion security fix

### What we did
- Built `/consumed` page: 49 YouTube videos, 12 Spotify podcasts, 10 books for 2026; All tab; click-to-play; real upload dates; month chips
- Fixed CSP blocking YouTube/Spotify embeds (added to frame-src in next.config.mjs)
- Fixed brace-expansion CVE (npm overrides to force 5.0.6)

---

## 2026-05-19 - Gaming PC daemon and card

### What we did
- Confirmed NVIDIA RTX 4060 GPU (pynvml used)
- Wrote scripts/gpc-daemon.py: CPU%, GPU%, active game via process scan, writes to gpc:status and gpc:last-known
- Wrote app/api/gpc/route.ts with live/last-known fallback and offline null rule
- Wired up Gaming PC card in LiveStatusCards.tsx

---

## 2026-05-19 - Lenovo daemon and stale charging fix

### What we did
- Wrote scripts/lenovo-daemon.py: battery, charging, timestamp to lenovo:status and lenovo:last-known
- Wrote app/api/lenovo/route.ts
- Wired up Lenovo live card
- Set up NSSM Windows service for auto-start

### NSSM gotchas (apply to all Windows daemons)
- Use full Python path in nssm install
- Install pip packages to system site-packages (LocalSystem cannot see user packages)
- Set multiple env vars in ONE nssm call (two calls overwrite each other)
- SERVICE_PAUSED = process crashed, not paused - always check the log
- Run nssm in admin PowerShell

### Stale charging fix
- Added isStale() helper in LiveStatusCards.tsx - if lastSeen > 5 min, hide charging state
- Prevents charging icon freezing when device shuts down while plugged in

---

## 2026-05-24 - Session end status (for next agent)

### COMPLETED this session (all merged to main)
- Group D: CV Word download - /api/cv-word route, Download Word button in CVViewer, DOCX in cv-pdf.yml workflow
- Group E: Applications tab renamed to "Internships", scraper whole-word regex fix, upsert dedup, error messages
- Group C: CV edits - cybersecurity in profile, Aston bullets merged, award pipe format, Java + Kubernetes + PHP fix, AstonCV 12+ controls, synonyms replaced, Ghana HC bullets merged
- Group A+B: Tab title fix, LinkedIn URL fix, sidebar on dashboard home, Course + Modules PIN gates, dark mode in Settings, test digest button, scraper error messages, login page redesign

### NOT DONE - do these next session
- Group F: 3-dot menus (Edit/Hide/Pin/Lock) on Diary, Notes and Vault entries + Now section on Notes home page. SQL must be run in Supabase first - see memory/SUGGESTIONS.md for exact SQL and full spec.
- Group G: CV templates (6 role-specific HTML files + /cv/templates picker page) - can start now that Group C is merged.
- SUGGESTIONS.md: full list of future features and dashboard improvements

### Manual steps still needed
1. Run SQL in Supabase (see SUGGESTIONS.md Group F section) BEFORE Group F code deploys
2. Go to /dashboard/me and update LinkedIn slug from "isaac-adjei" to "isaacadjei" (no hyphen) after Group A+B deploys
