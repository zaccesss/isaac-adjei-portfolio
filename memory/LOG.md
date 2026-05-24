# Session Log

All session logs - newest first. Public-facing changes also in CHANGELOG.md.

---

## 2026-05-24 - CV Word download

### Group D - CV Word download (feat/cv-word-download)

- Installed html-to-docx package
- Created app/api/cv-word/route.ts - reads cv.html live, returns .docx with correct MIME type
- Added "Download Word" button to CVViewer next to existing download buttons
- Extended .github/workflows/cv-pdf.yml to also generate Isaac_Adjei_CV.docx on cv.html changes

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
