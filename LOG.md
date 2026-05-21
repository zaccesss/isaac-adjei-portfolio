# Private Dashboard Log

Private session log for dashboard changes. Never referenced from public pages.
See CHANGELOG.md for public site changes only.

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
