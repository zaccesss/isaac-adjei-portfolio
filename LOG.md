# Private Dashboard Log

Private session log for dashboard changes. Never referenced from public pages.
See CHANGELOG.md for public site changes only.

---

## 2026-05-21 - Full Dashboard Overhaul, CV Update and Codebase Comments

### Branch: `feat/dashboard-overhaul`

### What we did

- Dashboard home page at `/dashboard` - replaced redirect with a mission-control overview showing stat cards (goals, applications, streaks, modules, diary, wishlist, vault, notes) with colour accents, Framer Motion animations and links to each section
- Settings page at `/dashboard/settings` - change PIN form, lock-all button, job scraper status with Run Now trigger, session info
- Manual lock button and Cmd+L keyboard shortcut on Diary, Notes and Vault pages
- Sub-pages for all sections that needed them: Goals by category, Modules by year, Health by section (Gym/Nutrition/Running), Vault by type, Wishlist by category, Inventory by category, Notes by folder - all using dynamic [param] routes
- Weekly email digest via Vercel cron every Sunday 6pm - pulls weekly stats and sends via Resend to DIGEST_EMAIL
- New API routes: /api/dashboard/scraper-status, /api/dashboard/trigger-scraper, /api/dashboard/weekly-digest
- DashboardBreadcrumb shared component for all sub-page navigation
- dashboardPage, dashboardCard, dashboardGrid Framer Motion variants added to lib/animations.ts
- Settings link added to sidebar above Sign out
- getDashboardSummary server action (parallel Supabase queries for all section counts)
- Security audit: all dashboard API routes verified to check auth(), PIN cookie checks confirmed server-side, dashboard excluded from sitemap, robots.txt updated to disallow /dashboard
- First-person comments added across all new dashboard files, public API routes (spotify, macbook, lenovo, gpc, github-activity) and components (LiveStatusCards, ContactForm, MobileNav, ProjectFilter)
- CV updated: profile rewritten, one-page target, Java removed from skills, Web and Frameworks / AI/ML and Data headings, Jupyter Notebooks added, git-unlocked corrected to 217+ files, PHAEMOS marked as in active development, AstonCV website link updated to astoncv.zacess.com, volunteering merged to 1 bullet each, bold key terms in experience and volunteering

### Files changed
- lib/animations.ts
- app/dashboard/page.tsx
- app/dashboard/DashboardHome.tsx
- app/dashboard/actions.ts (getDashboardSummary)
- app/dashboard/components/DashboardSidebar.tsx
- app/dashboard/components/DashboardBreadcrumb.tsx
- app/dashboard/(protected)/settings/page.tsx + SettingsClient.tsx
- app/dashboard/(protected)/goals/GoalsClient.tsx + [category]/page.tsx + [category]/GoalsCategoryClient.tsx
- app/dashboard/(protected)/modules/ModulesClient.tsx + [year]/page.tsx + [year]/ModulesYearClient.tsx
- app/dashboard/(protected)/health/HealthClient.tsx + [section]/page.tsx + [section]/HealthSectionClient.tsx
- app/dashboard/(protected)/vault/VaultClient.tsx + VaultWrapper.tsx + [type]/page.tsx + [type]/VaultTypeClient.tsx
- app/dashboard/(protected)/wishlist/WishlistClient.tsx + [category]/page.tsx + [category]/WishlistCategoryClient.tsx
- app/dashboard/(protected)/inventory/InventoryClient.tsx + [category]/page.tsx + [category]/InventoryCategoryClient.tsx
- app/dashboard/(protected)/notes/NotesClient.tsx + NotesWrapper.tsx + [folder]/page.tsx + [folder]/NotesFolderClient.tsx
- app/dashboard/(protected)/diary/DiaryWrapper.tsx
- app/api/dashboard/scraper-status/route.ts
- app/api/dashboard/trigger-scraper/route.ts
- app/api/dashboard/weekly-digest/route.ts
- vercel.json (cron config)
- .env.example (CRON_SECRET, DIGEST_EMAIL, GH_PAT)
- public/robots.txt (Disallow: /dashboard)
- public/resume/cv.html

### New env vars needed in Vercel
- CRON_SECRET - random secret for weekly digest cron authentication
- DIGEST_EMAIL - email to receive weekly digest
- GH_PAT - GitHub PAT for trigger-scraper (optional)

### Next session
- Run the Supabase SQL for any missing columns if not already done
- Set CRON_SECRET and DIGEST_EMAIL in Vercel env vars
- Set GH_PAT in Vercel if you want the Run Now button in Settings to work

---

## 2026-05-21 - Applications, Job Scraper and Bug Fixes

### Current branch: `fix/pin-auth-and-scraper`

### RESUME PROMPT (copy this if context runs out)

```
Current branch: fix/pin-auth-and-scraper
All changes are staged but NOT yet committed/pushed.

Key rules:
- UK English, no em/en dashes, no Oxford commas, no AI co-author in commits
- Everything must pass `npm run build` with zero errors before committing
- Workflow: commit -> push -> gh pr create -> gh pr merge --squash --delete-branch --auto

Outstanding SQL to run in Supabase after deployment:
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS opening_date date,
  ADD COLUMN IF NOT EXISTS last_year_opening date,
  ADD COLUMN IF NOT EXISTS housing_location text,
  ADD COLUMN IF NOT EXISTS cv_required text,
  ADD COLUMN IF NOT EXISTS cover_letter_required text,
  ADD COLUMN IF NOT EXISTS written_answers text,
  ADD COLUMN IF NOT EXISTS sponsors_visa text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Software Engineering';

Also update the job scraper in GitHub Secrets to use the legacy anon key
(eyJ... format) not the new sb_publishable_ format.
```

### What was done this session

#### Bugs fixed
- PIN gate returning 401 on all requests - root cause was `getToken` from NextAuth v4 being used in a NextAuth v5 project. Fixed by replacing `getToken` with `auth()` in both `/api/dashboard/verify-pin` and `/api/dashboard/change-pin`
- PIN debug logs added temporarily (removed in same session)
- "Nexus" label removed from sidebar above user name (just shows name now)
- Course page: fixed broken programme spec link, moved PDF to `public/documents/`, added both Aston course page URL and PDF link

#### Job scraper
- Fixed GitHub Actions secrets: `SUPABASE_URL` and `SUPABASE_ANON_KEY` must be set as GitHub repo secrets (not Vercel env vars)
- Fixed API key format: use legacy `eyJ...` anon key, not new `sb_publishable_` key
- Added Playwright for The Trackr (JS-rendered, headless Chromium)
- Added Greenhouse JSON API for 40+ companies (Cloudflare, Stripe, Figma, Anthropic, Citadel, Akuna Capital, CrowdStrike, GitLab, Snyk, Twilio and many more)
- Added Lever JSON API (Palantir, Canva, Discord, Shopify, Tailscale, LaunchDarkly, etc.)
- Added Ashby Next.js embed scraper (Linear, Perplexity, Cursor, Vercel, etc.)
- Added Gradcracker, RateMyPlacement, Milkround, TargetJobs scrapers
- Student-role filter: only saves internships/placements/spring weeks/graduate schemes - no full-time permanent roles unless from priority companies
- URL-based deduplication (same posting from multiple sources = never inserted twice)
- Added cloud-specific keywords: aws, azure, gcp, kubernetes, terraform, serverless, etc.
- Added 30+ more priority companies: CrowdStrike, Palo Alto Networks, Zscaler, Okta, GitLab, JFrog, Dynatrace, Snyk, Wiz, Twilio, Graphcore, Riverlane, Darktrace and more
- Removed Edinburgh from TARGET_LOCATIONS

#### Applications page rebuilt
- Complete rewrite of ApplicationsClient.tsx to match The Trackr layout exactly
- Tabs: Summer Internships | Industrial Placements | Graduate Schemes | Spring Weeks | Events
- Full-width table with: My Status (inline dropdown), Company, Programme, Opening Date (colour-coded), Closing Date, Last Year Opening, Find Housing, CV, Cover Letter, Written Answers, Sponsors Visa, Notes
- Category groups with expand/collapse: FAANG+, Software Engineering, Data Science, AI and ML, DevOps and Infrastructure, Quant Developer, Tech Consulting, Cyber Security, Startups, IT, Miscellaneous
- My Status values match The Trackr exactly (Not Applied, Interested, Application Submitted, etc.)
- Date colour coding: green = open/future, red = closed/past
- Search, filter by status, filter by open status, filter by cover letter requirement
- Stats bar: Total, Active pipeline, Offers, Rejected
- New DB fields added to actions.ts: opening_date, last_year_opening, housing_location, cv_required, cover_letter_required, written_answers, sponsors_visa, category

### Files changed this session
- app/api/dashboard/verify-pin/route.ts (auth fix)
- app/api/dashboard/change-pin/route.ts (auth fix)
- lib/pin.ts (removed debug logs)
- app/dashboard/components/DashboardSidebar.tsx (removed Nexus label)
- app/dashboard/(protected)/course/CourseClient.tsx (fixed links)
- public/documents/eecs-programme-spec.pdf (moved from public root)
- app/dashboard/(protected)/applications/ApplicationsClient.tsx (full rewrite)
- app/dashboard/actions.ts (new fields for applications)
- scripts/job-scraper.py (full rewrite - Playwright + 50+ sources)
- scripts/requirements.txt (added playwright)
- .github/workflows/job-scraper.yml (added playwright browser install step)

### Pending
- Run the SQL above in Supabase to add new application columns
- The job scraper cron runs every 30 minutes automatically once GitHub secrets are correct
- No other pending tasks

---

## 2026-05-20 - Nexus Dashboard Overhaul (COMPLETE - merged as PR #140, #141, #142, #145)

The full Nexus dashboard overhaul was completed and merged. All pages built:
Me, Us, Goals, Health, Diary (PIN gate), Notes, Wishlist, Inventory, Course, Modules,
Applications (now rebuilt again above), Vault (PIN gate), Streaks.
Sidebar: collapsible, new nav order, mobile hamburger.
Auth: NextAuth v5, PIN gate via bcrypt, inactivity auto-logout (1 hour).
See PR #140 for full details.
