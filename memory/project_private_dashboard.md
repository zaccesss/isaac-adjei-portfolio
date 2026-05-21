---
name: project-private-dashboard
description: Full spec and current state of the private /dashboard section - Nexus. NextAuth.js v5 GitHub OAuth, Supabase, all pages built and deployed.
metadata:
  type: project
---

# Private dashboard (Nexus)

A private section at `/dashboard` accessible only to Isaac. Not linked from public nav, sitemap or command menu. The display name is "Nexus" (the URL stays /dashboard).

**Auth:** NextAuth.js v5 (Auth.js) GitHub OAuth, numeric user ID allow-list, `ALLOWED_GITHUB_ID` env var.
**Database:** Supabase PostgreSQL. All DB access via server actions only - never direct Supabase calls from client components.
**PIN gate:** `AUTH_SECONDARY_PIN` env var (plain text on Vercel). On first successful login, I hash it with bcrypt and store in the `config` table so subsequent checks never compare plain text. Cookie `dashboard_pin_verified` (httpOnly, 4-hour maxAge) unlocks Diary, Notes and Vault for the session.

---

## Routes built (all live as of 2026-05-21)

| Route | Page | Notes |
|---|---|---|
| /dashboard/me | Me | Personal profile, editable, config table key `me_profile` |
| /dashboard/us | Us | Relationship page, editable, config table key `us_data` |
| /dashboard/goals | Goals | Category cards (Personal, Academic, Career, Health, Finance) |
| /dashboard/health | Health and Fitness | Gym split, nutrition, running - migrated from /gym |
| /dashboard/diary | Diary | PIN gated, mood picker, word count, server actions |
| /dashboard/notes | Notes | PIN gated, markdown, folders, tags, lock per note |
| /dashboard/wishlist | Wishlist | Category cards, priority colour border |
| /dashboard/inventory | Inventory | Tech devices, categories - migrated from /tech |
| /dashboard/course | Course | Editable modules table, programme spec PDF link, Aston URL |
| /dashboard/modules | Modules | Excel-like, year cards, assessment tracker, Recharts |
| /dashboard/applications | Applications | Trackr-like table - see below |
| /dashboard/vault | Vault | Bitwarden-like, PIN gated, Account/Note/APIKey/Card/Identity types |
| /dashboard/streaks | Streaks | LeetCode, GitHub, LinkedIn, Bible etc., 30-day heatmap |
| /dashboard/gym | - | Redirects to /health |
| /dashboard/internships | - | Redirects to /applications |
| /dashboard/tech | - | Redirects to /inventory |

---

## Applications page (rebuilt 2026-05-21 to match The Trackr)

Tabs: Summer Internships / Industrial Placements / Graduate Schemes / Spring Weeks / Events.
Full-width table: My Status (inline dropdown), Company, Programme, Opening Date, Closing Date, Last Year Opening, Find Housing, CV, Cover Letter, Written Answers, Sponsors Visa, Notes.
Category groups with expand/collapse: FAANG+, Software Engineering, Data Science, AI and Machine Learning, DevOps and Infrastructure, Quant Developer, Tech Consulting, Cyber Security, Startups, IT, Miscellaneous.
My Status values: Not Applied, Interested, Application Submitted, Online Assessment, Case Study, HireVue, Telephone Interview, Video Interview, Face-to-face Interview, Assessment Centre, Offer Received, Rejected, Not Interested.

**SQL I still need to run in Supabase after the next deploy:**
```sql
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS opening_date date,
  ADD COLUMN IF NOT EXISTS last_year_opening date,
  ADD COLUMN IF NOT EXISTS housing_location text,
  ADD COLUMN IF NOT EXISTS cv_required text,
  ADD COLUMN IF NOT EXISTS cover_letter_required text,
  ADD COLUMN IF NOT EXISTS written_answers text,
  ADD COLUMN IF NOT EXISTS sponsors_visa text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Software Engineering';
```

---

## Job scraper (scripts/job-scraper.py)

Runs via GitHub Actions every 30 minutes. Sources:
- The Trackr (Playwright - JS-rendered React app)
- Greenhouse JSON API - 50+ companies (Cloudflare, Citadel, CrowdStrike, GitLab, Databricks etc.)
- Lever JSON API - Palantir, Canva, Shopify, Tailscale etc.
- Ashby Next.js embed - Linear, Perplexity, Cursor, Vercel, Supabase etc.
- SmartRecruiters API - KPMG, Vodafone, Capgemini, Accenture, BT etc.
- HTML scrapers - Gradcracker, RateMyPlacement, TargetJobs, BrightNetwork, TotalJobs, Prospects

GitHub secrets needed: `SUPABASE_URL` and `SUPABASE_ANON_KEY` (must use legacy `eyJ...` format, not new `sb_publishable_` key).

Student-role filter: only saves internships, placements, spring weeks and graduate schemes. Full-time permanent roles are skipped unless from a priority company.

---

## Packages installed for dashboard

recharts, react-day-picker, react-markdown, remark-gfm, bcryptjs, @types/bcryptjs, @radix-ui/react-popover, @radix-ui/react-checkbox, @radix-ui/react-switch, playwright (Python scripts/requirements.txt)

---

## Known issues as of 2026-05-21

- PIN gate was returning 401 because `getToken` (NextAuth v4) was used instead of `auth()` (NextAuth v5). Fixed in PR #146.
- The new applications DB columns do not exist yet - I need to run the SQL above after PR #146 merges.
- Job scraper GitHub secrets must use the legacy anon key format.

---

## Planned for next session

1. **Sub-pages for all dashboard pages** - instead of long expanding pages, use preview card grids linking to sub-routes:
   - /dashboard/goals/personal, /dashboard/goals/academic, /dashboard/goals/career etc.
   - /dashboard/modules/year-1, /dashboard/modules/year-2, /dashboard/modules/final
   - /dashboard/health/gym, /dashboard/health/nutrition, /dashboard/health/running
2. **Manual lock button** on Vault, Notes and Diary to call DELETE /api/dashboard/verify-pin and re-trigger the PIN gate
3. **Settings page** at /dashboard/settings covering: change PIN, lock all PIN-protected pages, inactivity timeout, scraper status
