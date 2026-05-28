# Session Log

All session logs - newest first. Public-facing changes also in CHANGELOG.md.

---

## 2026-05-28

- fix/scraper-category-and-adzuna (7b4498b): improved detect_category in job-scraper.py with word-boundary regex for "AI" (`\bai\b`), additional quant companies (Virtu, SIG, DRW, Flow Traders, Akuna), full Embedded category (firmware/fpga/vhdl/rtos/bare metal/hardware engineer/IoT/microcontroller); capped Adzuna results_per_page from 50 to 15 per search; added `_resolve_url()` to follow Adzuna redirect_url tracking links to the real company ATS page; SUGGESTIONS.md replaced with newsletter content tasks only (Issue 001-003 on Beehiiv).
- feat/embedded-category-and-detect-improvements (PR #231): added "Embedded" to the CATEGORIES array in ApplicationsClient.tsx so Embedded roles from the scraper route to the correct group rather than Miscellaneous; expanded detectCategory client-side for all verticals (Embedded with firmware/fpga/rtos/hardware engineer/IoT; AI using word-boundary `_AI_WORD = /\bai\b/i`; Data Science adds data engineer and BI analyst; Quant adds Virtu/SIG/DRW; Cyber adds pen test and appsec).
- fix/discord-card-activities (PR #230): changed `.find()` to `.filter()` in LiveStatusCards.tsx so all concurrent Discord activities (Playing/Listening/Watching) render as a compact stacked list with type labels and elapsed time, separated by dividers; fixed ApplicationsClient.tsx category grouping to skip the DB default value of "Software Engineering" when grouping and filtering so Data Science/AI/DevOps roles appear in their correct category columns.
- fix/lanyard-csp (PR #229): added `api.lanyard.rest` to connect-src in next.config.mjs CSP header so Lanyard WebSocket and REST calls are not blocked by the browser.
- feat/discord-card-link (PR #228): added external link icon on the Discord presence card that opens `discord.com/users/1087417301583790212` in a new tab; corrected the Discord profile URL on /links to use the same deep-link format.
- fix/lanyard-always-show (PR #227): Discord card on /now no longer waits for Lanyard before rendering; shows immediately with offline placeholder so there is no layout shift on load.
- feat/lanyard-discord-card (PR #226): added Discord presence card to the live status widget powered by the Lanyard API (no auth, free); card shows status dot (online/idle/dnd/offline), current rich presence activity (game, VS Code workspace, Spotify via Discord) and custom status text; on /notes the card only appears when online/idle/dnd; on /now it is always visible and shows "last seen Xm ago" at reduced opacity when offline; Discord user ID 1087417301583790212 hardcoded in LiveStatusCards.tsx.
- feat/inventory-pagination (PR #225): added client-side prev/next pagination to inventory category pages with PAGE_SIZE = 50; shows "1-50 of N items" when paginated, plain "N items" when under the limit; adding a new item resets to page 0 so it is always visible at top.
- feat/applications-funnel (PR #224): added an Application Funnel section pinned to the bottom of the applications page (both Table and Kanban views); four cumulative stages: Applied (blue), Assessment (violet), Interview (amber), Offer (green); each stage shows count and conversion rate from previous stage; counts update when switching tabs (All / Internships / etc.).
- feat/discord-daily-digest: added lib/send-discord-digest.ts with fetchDigestData/buildEmbeds/sendDiscordDigest; created app/api/dashboard/discord-digest/route.ts (CRON_SECRET protected GET); added daily 8am UTC cron to vercel.json; DISCORD_WEBHOOK_URL must be added to Vercel environment variables.
- feat/scraper-adzuna-and-reed: added scrape_adzuna(), scrape_jooble() (JOOBLE_API_KEY), scrape_arbeitnow() and scrape_jobicy() (both free, no auth); improved scrape_reed() with graduate=true flag and more keyword variants; added all new secrets to job-scraper.yml and .env.example.
- fix/scraper-filters-and-status: fixed infer_type to use whole-word regex for "intern" (prevents "international" matching); added _SENIOR_ROLE_RE guard to Trackr non-internship category bypass; changed insert_job from upsert to insert-only so user-set statuses are never overwritten; added batch last_scraped_at refresh at end of run; removed Twilio from PRIORITY_COMPANIES; added scrape_reed() (requires REED_API_KEY secret); added send_discord_alert() for daily new-job notifications (requires DISCORD_WEBHOOK_URL secret); updated job-scraper.yml to pass new secrets; added both env vars to .env.example; removed CV editor from SUGGESTIONS.md; added Beehiiv branding instructions note to SUGGESTIONS.md.
- chore/docs-stale-pages-and-changelog: updated colophon (PS5 daemon, GitHub activity entries), uses (PS5 hardware, Cloudflare Workers service), DOCUMENTATION.md (PSN_NPSSO env var, workers/ file structure), CHANGELOG.md (consolidated unreleased sections), website changelog page (Unreleased + v2.4.0 entries), README.md (PSN_NPSSO env var), verification.md (inventory detail page + live widget checks). NEXT-SESSION-PLAN.md deleted - all items complete.
- feat/3dot-menus-kanban (PR #219): 3-dot MoreVertical dropdowns on Diary, Notes and Vault entry cards (Hide/Pin/Lock/Edit); drag-and-drop Kanban board for Applications with List/Grid toggle; job scraper `_INTERNAL_FUNCTION_RE` and `_SENIOR_ROLE_RE` guards to block internal engineering, recruiter and senior roles from student listings.
- PR #217 (merged): PS5 NPSSO renewal cron, PWA manifest, activity log page, Notes Now card, Vercel Analytics.
- PR #216 (merged): WeatherAPI.com weather source with is_day moon detection, friendly Mac device name via scutil.
- PR #211 (fix/livestatuscards-icons-and-github): PS5 card added to LiveStatusCards 2x2 grid with classic SiPlaystation icon, GitHub moved to full-width strip, Cloudflare Worker (workers/ps5-presence/) polling PSN every minute replacing Mac daemon, ps5-daemon.py fixed (npsso_cookie, busy status, User.get_presence), workers/ excluded from root tsconfig.json.
- feat/notes-live-indicator-and-now-cards (open PR #214): pulsing "Updated live" indicator added to /now page header (blue dot, matching device card online colour), LiveStatusCards added to /now page. Fixed PS5 card issues from PR #211 - device name colour (was blue, now default foreground), device icons (Laptop/Monitor/PS) now turn blue when online, redundant "Online" status line removed (status only shown for informative states like "Busy").
- feat/ps5-daemon: new scripts/ps5-daemon.py and com.zacess.ps5-daemon.plist, new app/api/ps5/route.ts, PS5 card added to LiveStatusCards.tsx 2x2 grid, GitHub moved to full-width strip between Spotify and device grid, PSN_NPSSO added to .env.example.
- feat/inventory-detail-pages: added /dashboard/inventory/[category]/[id] detail page with full item info, back navigation, edit/delete actions and warranty colour coding. Added stopPropagation on edit/delete icons in InventoryCategoryClient.tsx. SQL migration for updated_at column and trigger in supabase-schema.sql already added in a prior PR this session.
- PR fix/scraper-accumulate-and-filters: replaced reset_scraped_entries() with 30-day TTL stale delete, added last_scraped_at and sponsors_visa columns to supabase-schema.sql (SECTION A and B), fixed Bug A (Remote - US location strings including "palo alto", "gurugram"), Bug B (Internal title rejection in is_student_role), Bug C (seniority terms default to Full-time Job in infer_type), Bug D (Singapore/Australia moved to UK_EU_TERMS), fixed The Trackr placement/spring-week category bypass, changed GitHub Actions cron from every 30 minutes to midnight daily, added NotesCell expand/collapse component in ApplicationsClient.tsx.
- PR fix/digest-rename: renamed "Nexus Dashboard" to "Dashboard" in email subject line, "My Dashboard" in the from field and removed "Nexus -" prefix from the footer tagline in lib/send-weekly-digest.ts.
- PR #206 (fix/readme-and-share-cleanup): removed all em/en dashes from the entire repo (replaced with hyphens), removed Oxford commas, ShareButton scoped to project detail, blog slug, CV and links pages only (removed from experience, skills, about, now, notes, newsletter, consumed, colophon, uses, hall-of-fame and both notes sub-pages), added ShareButton to /cv and /links (next to name), fixed URL-encoded em dashes in OG metadata URLs, fixed TypeScript startTransition void issue across 16 dashboard files from PR #204.

## 2026-05-27

- LinkedIn social profile overhaul: all 9 project entries added, Proteus version fix PR #202.
- PR #203 (chore/docs-reorg): renamed memory/ to docs/, consolidated session logs, rewrote README to essentials only, moved file structure and key dependencies to DOCUMENTATION.md, removed LinkedIn badge from footer.
- PR #204 (fix/security-and-comments): patched recursive json() helper in contact route, added OG param sanitisation, Cache-Control: no-store on contact and newsletter responses, Upstash rate limiting on newsletter (3/hour), runtime input validation on all dashboard server actions, PIN gate and inline-styles comments, private entries removed from CHANGELOG, Unreleased versioned as v2.4.0.
- PR #205 (feat/share-links): new ShareButton component (Web Share API + clipboard fallback), OG thumbnails on every public page via /api/og, ShareButton wired to all relevant public pages.

---

## Session Start (2026-05-26)

- Date: 26 May 2026
- Branch strategy: one branch per feature, PR + auto-merge each
- Plan: c-dev-github-repos-isaac-adjei-portfoli-effervescent-cake.md

## Implementation Order

1. Create this log file - DONE
2. A1: Weather night icon fix (public)
3. A2: Weekly digest refactor (private)
4. A3: CV improvements + FPGA/VHDL + PDF/DOCX scripts (public)
5. Phase 12: Mood Analytics in Diary (private)
6. Phase 13: Quick Capture widget (private)
7. Phase 14: Dashboard keyboard shortcuts (private)
8. Phase 15: Dashboard global search (private)
9. Phase 16: Streak charts (private)
10. Phase 17: Dark mode persistence (private)
11. DOCUMENTATION.md (public)

---

## A1: Weather Night Icon Fix

### Status: COMPLETE - PR #183 merged, PR #184 auto-merging (7pm threshold update)

Files changed:
- `app/api/macbook/route.ts` - checks local hour, replaces day emojis with moon between 7pm-6am

---

## A2: Weekly Digest Refactor

### Status: COMPLETE - PR #185 MERGED

Root cause: internal HTTP fetch in trigger-digest was failing on Vercel (header stripping on redirects).
Fix: extracted all logic to `lib/send-weekly-digest.ts`, both routes call it directly.

Files changed:
- `lib/send-weekly-digest.ts` - NEW shared helper with all Supabase queries and Resend call
- `app/api/dashboard/trigger-digest/route.ts` - removed HTTP fetch, calls helper directly
- `app/api/dashboard/weekly-digest/route.ts` - keeps CRON_SECRET check, calls helper

---

## A3: CV Improvements

### Status: COMPLETE - PR #186 MERGED, follow-up fixes on fix/cv-downloads (pending PR)

PR #186 changes (merged):
- `data/cv.yml` - FPGA/VHDL added to embedded.hardware, software section order fixed (skills before education), Cancer Research UK tagged for all roles
- `data/skills.ts` - FPGA (AMD/Wikimedia logo) and VHDL (embeddedc icon) added to Embedded & Hardware
- `scripts/generate-pdfs.js` - NEW Puppeteer script generating A4 PDFs for all 6 roles
- `scripts/generate-docx.js` - NEW docx script generating role-specific Word files from cv.yml
- `package.json` - added generate-pdfs and generate-docx scripts
- `.github/workflows/ci.yml` - bumped to Node 22, changed npm ci to npm install

Issues encountered with PR #186:
- FPGA icon: cdn.simpleicons.org/xilinx slug removed after AMD acquisition, fixed with AMD logo from Wikimedia
- CI lock file sync: puppeteer v25 transitive deps missing, fixed by switching to npm install
- generate-cvs.js incorrectly overwrote the hand-crafted cv.html with a bare 162-line generated version, stripping all content (ORCID, icons, hardware skills, extra projects etc.)
- All cv-*.html files also overwritten with minimal generated versions

fix/cv-downloads branch - PR #187 MERGED - also contains:
- Restored cv.html and all cv-*.html to original comprehensive 1545+ line versions from git
- Added FPGA and VHDL to Embedded & Hardware line in cv.html and cv-embedded.html
- Fixed generate-cvs.js to never overwrite cv.html
- Fixed generate-cvs.yml to only git-add cv-*.html (not cv.html), use npm install
- Restored original role-specific PDFs (generated from wrong templates by #186)
- Kept new role-specific DOCX files (now genuinely different per role, replacing old identical copies)
- Fixed CV preview iframe: CSP frame-src includes 'self', X-Frame-Options changed to SAMEORIGIN
- Fixed print button: window.open instead of blocked iframe.contentWindow.print()
- Fixed Word download route: filename corrected from cv.docx to Isaac_Adjei_CV.docx
- Regenerated main Isaac_Adjei_CV.pdf from restored cv.html (136536 -> 151931 bytes)
- Updated generate-pdfs.js to include main CV PDF in generation list

---

## CI Workflow Fixes

### Status: COMPLETE - PR #188 MERGED

Root cause: Ubuntu 24.04 (Noble) renamed libasound2 to libasound2t64. Both CV workflows were failing on the install step. cv-pdf.yml also had no Chromium deps step and was using npm ci (lock file mismatch with puppeteer).

Files changed:
- `.github/workflows/generate-cvs.yml` - libasound2 -> libasound2t64, Node 20 -> 22
- `.github/workflows/cv-pdf.yml` - npm ci -> npm install, Node 20 -> 22, added Chromium deps step

---

## Phase 12: Mood Analytics in Diary

### Status: COMPLETE - PR #189 MERGED

Files changed:

- `app/dashboard/(protected)/diary/DiaryClient.tsx` - added collapsible BarChart showing mood frequency over last 30 days, derived from existing entries state with no extra Supabase query

---

## Phase 13: Quick Capture Widget

### Status: COMPLETE - PR #190 MERGED

Files changed:

- `components/dashboard/QuickCapture.tsx` - NEW: fixed FAB (bottom-right), Radix Dialog, 4 tabs (Diary/Note/Goal/Job), each wired to existing server actions
- `app/dashboard/(protected)/layout.tsx` - added QuickCapture and Toaster
- `package.json` / `package-lock.json` - added sonner for toast notifications

---

## Phase 14: Dashboard Keyboard Shortcuts

### Status: COMPLETE - PR #191 MERGED

Files changed:

- `hooks/useDashboardShortcuts.ts` - NEW: g+key navigation, ? triggers help, ignores input fields
- `components/dashboard/ShortcutHelp.tsx` - NEW: dialog showing all shortcuts
- `app/dashboard/(protected)/layout.tsx` - added ShortcutHelp

---

## Phase 15: Global Search (Ctrl+K)

### Status: COMPLETE - PR #192 MERGED

Files changed:

- `components/dashboard/DashboardSearch.tsx` - NEW: Ctrl+K CommandDialog, fetches last 50 of goals/notes/diary/applications on first open
- `app/dashboard/actions.ts` - added getDashboardSearchData server action
- `app/dashboard/components/DashboardSidebar.tsx` - added search trigger in sidebar

---

## Phase 16: Streak Charts + Phase 17: Dark Mode Persistence

### Status: COMPLETE - PR #193 MERGED

Phase 16 files:

- `app/dashboard/(protected)/streaks/page.tsx` - extended query from 30 to 90 days
- `app/dashboard/(protected)/streaks/StreaksClient.tsx` - heatmap extended to 90 days, LineChart added showing per-streak activity

Phase 17 files:

- `components/dashboard/ThemeSync.tsx` - NEW: applies saved theme from Supabase on dashboard load
- `app/dashboard/(protected)/layout.tsx` - fetches theme_preference, renders ThemeSync
- `app/dashboard/(protected)/settings/SettingsClient.tsx` - theme toggle now calls setConfig to persist preference

---

## Session Cleanup (2026-05-26)

### Status: COMPLETE (this session)

- Deleted `memory/PLAN-2026-05-24.md` (completed, superseded)
- Deleted `memory/CV_GENERATION_DISABLED.md` (outdated - CV generation re-enabled)
- Deleted `memory/LOG-2026-05-25.md` (archived - yesterday's session)
- Deleted `.claude/worktrees/` (empty folder)
- Rewrote `memory/SUGGESTIONS.md` - removed done items, kept only genuine backlog
- Rewrote `memory/verification.md` - updated checklist for current feature set
- Fixed non-first-person comments in: opengraph-image.tsx, sitemap.ts, SocialLinks.tsx, useScrollPosition.ts
- Created `app/robots.ts` - disallows /dashboard/ and /api/dashboard/ from crawlers
- Updated sitemap.ts comment to clarify it never includes private paths

---

## 2026-05-24 - CV awards and experience emphasis

- Removed duplicated school names from education award lines in `public/resume/cv.html`
- Restored bold keyword emphasis in Experience bullets and regenerated CV PDF/DOCX artefacts
- Updated CV artefact workflow to regenerate PDF/DOCX after `cv.html` lands on `main`, then open an artefact-only PR for auto-merge
- Routed the Experience page CV download button through `/api/cv-pdf` to match the other PDF CTAs
- Avoided PR self-commit loops by moving generated CV artefacts into a separate automated PR flow
- Set dashboard metadata to the absolute title `Isaac Adjei | Dashboard` so the browser tab does not duplicate the name

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
