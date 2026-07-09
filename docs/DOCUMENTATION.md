# Documentation

Full reference for the Isaac Adjei portfolio and private dashboard. For a high-level overview see [README.md](README.md).

---

## Contents

- [Public site](#public-site)
- [Private dashboard](#private-dashboard)
- [CV system](#cv-system)
- [Job scraper](#job-scraper)
- [Discord presence (Lanyard)](#discord-presence-lanyard)
- [Daily Discord digest](#daily-discord-digest)
- [Background daemons](#background-daemons)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Dashboard shortcuts](#dashboard-shortcuts)
- [Development commands](#development-commands)
- [Environment variables](#environment-variables)
- [API routes](#api-routes)
- [Rules to remember](#rules-to-remember)
- [Deployment](#deployment)
- [File structure](#file-structure)
- [Key dependencies](#key-dependencies)

---

## Public site

### Pages

| Route | Description |
| --- | --- |
| `/` | Hero, social links, live status cards (Spotify, London time, MacBook battery, GitHub, Discord) |
| `/about` | Personal story, education, awards, societies, volunteering and languages |
| `/projects` | Grid of 10 engineering projects with cover images |
| `/projects/[slug]` | Project detail: overview, highlights, tech stack and image lightbox |
| `/experience` | Work experience and internships timeline |
| `/skills` | Full tech stack with animated icon grid across 15 categories |
| `/blog` | Blog listing with type filters (blog, journal, research, report, article, notes, resources) |
| `/blog/[slug]` | Blog post with reading progress bar, copy buttons, TOC sidebar and project links |
| `/notes` | Public notebook: live status, current builds, summer plans and upcoming projects |
| `/consumed` | Monthly content log with 7 category subpages (videos, podcasts, books, music, articles, resources, others); each category has its own URL and individual item pages at `/consumed/[category]/[slug]` |
| `/consumed/[category]/[slug]` | 216 individual consumed item pages with embedded players (YouTube for videos, Spotify for podcasts) and prose notes |
| `/now` | Snapshot of what Isaac is doing right now - updated manually |
| `/uses` | Hardware, software and tools used day to day |
| `/colophon` | How the site is built and the stack decisions behind it |
| `/changelog` | Public version history |
| `/lab` | Interactive terminal with 30+ commands and live status cards |
| `/newsletter` | Newsletter signup via Beehiiv |
| `/contact` | Contact form with Cloudflare Turnstile and Resend delivery |
| `/cv` | CV viewer with PDF download and inline preview |
| `/links` | Linktree-style page with all social and professional links |
| `/all-pages` | Full directory of every public page |
| `/privacy` | Privacy policy |
| `/security-policy` | Responsible disclosure policy |
| `/hall-of-fame` | Security researcher acknowledgements |
| `/respub` | Academic profile, research interests and publications (ORCID, Google Scholar, ResearchGate) |
| `/til` | Today I Learned: 63 entries across 21 categories; search, category filter and pagination (10 per page) |
| `/til/[slug]` | Individual TIL entry with block content, ShareButton and optional ToC sidebar |
| `/til/feed.xml` | TIL RSS feed; HTML browser view; `?raw` for raw XML |
| `/tags` | Tag cloud from blog, TIL, projects, publications and consumed |
| `/tags/[tag]` | Content filtered by a single tag across all content types in grouped sections |
| `/search` | Full-text search across blog, TIL, projects, publications, notes, newsletter and consumed |
| `/newsletter/feed.xml` | Newsletter RSS feed; HTML browser view; `?raw` for raw XML |
| `/blog/feed.xml` | Blog RSS feed (canonical); old `/feed.xml` redirects here with 301 |
| `/cv/cover-letters` | Role-specific cover letter downloads |
| `/cv/cv-picker` | Role-specific CV picker |

### Sitemap and robots

`app/sitemap.ts` generates `/sitemap.xml` at build time. It lists only public routes - never `/dashboard` or any private path.

`app/robots.ts` generates `/robots.txt`. Crawlers are allowed on `/` and disallowed on `/dashboard/` and `/api/dashboard/`. 19 AI crawlers are explicitly blocked (GPTBot, anthropic-ai, Claude-Web and others).

---

## Private dashboard

Accessible at `/dashboard`. Requires GitHub OAuth login via NextAuth.js v5. Only the GitHub account matching `ALLOWED_GITHUB_ID` (numeric, not username) can sign in.

Certain pages (Diary, Notes, Vault) also require a secondary PIN set via `AUTH_SECONDARY_PIN`. The PIN is verified server-side by `POST /api/dashboard/verify-pin` and stored as an httpOnly cookie (`dashboard_pin_verified`, 4-hour maxAge). Do not use `getToken` from next-auth/jwt in routes - that is NextAuth v4 and always returns null in this project; use `auth()` from `@/auth` instead.

Inactivity auto-logout is enforced client-side after 1 hour.

### Sections

| Route | Description |
| --- | --- |
| `/dashboard` | Home with recent activity feed and stat cards for all sections |
| `/dashboard/me` | Personal snapshot page - editable from the config table |
| `/dashboard/us` | Relationship section |
| `/dashboard/goals` | CRUD goal tracker by category and status |
| `/dashboard/goals/[category]` | Goals filtered to one category (Personal, Academic, Career, Health, Finance) |
| `/dashboard/health` | Health and fitness overview - links to gym, nutrition and running sub-pages |
| `/dashboard/health/[section]` | Gym workout plan, nutrition categories or running log |
| `/dashboard/diary` | Private diary with mood tracking, mood analytics bar chart and 3-dot menu (hide, pin, lock) |
| `/dashboard/notes` | Notes organised by folder with 3-dot menu |
| `/dashboard/notes/[folder]` | Folder view for notes |
| `/dashboard/wishlist` | Wishlist tracker by category |
| `/dashboard/wishlist/[category]` | Wishlist entries for one category |
| `/dashboard/inventory` | Inventory list with pagination (50 items per page) |
| `/dashboard/inventory/[category]` | Inventory entries for one category |
| `/dashboard/inventory/[category]/[id]` | Full item detail page with warranty colour coding and edit/delete |
| `/dashboard/course` | University course overview |
| `/dashboard/modules` | Module list by year |
| `/dashboard/modules/[year]` | Year view for modules (year-1, year-2, placement, final-year) |
| `/dashboard/applications` | Job applications in table and Kanban view with category groups and funnel chart |
| `/dashboard/vault` | Vault overview by type (account, api-key, card, note, identity) |
| `/dashboard/vault/[type]` | Vault entries with 3-dot menu (hide, lock, edit, delete) |
| `/dashboard/streaks` | Streak tracker with 90-day heatmap and activity line chart |
| `/dashboard/habits` | Habit tracker with frequency and check-in logging |
| `/dashboard/settings` | Settings: PIN change, theme toggle, data export, job scraper trigger, weekly digest test and Discord digest trigger |

### Global dashboard features

- **Quick Capture (FAB)** - fixed `+` button bottom-right opens a dialog with tabs for Diary, Note, Goal and Application. Each tab calls the relevant server action and fires a sonner toast on success.
- **Keyboard shortcuts** - see [Dashboard shortcuts](#dashboard-shortcuts)
- **Global search (Ctrl+K)** - searches Goals, Notes, Diary and Applications in one query. Results grouped by section with keyboard navigation.
- **Dark mode persistence** - theme preference is saved to the `config` table in Supabase so it persists across devices.
- **Inactivity guard** - auto-locks after 1 hour of inactivity and redirects to login.
- **3-dot menus** - Diary, Notes and Vault entries each have a MoreVertical dropdown with contextual actions (Hide/Show, Pin/Unpin, Lock/Unlock, Edit, Delete).

### Applications tracker

The applications page has two views (Table and Kanban) and multiple tabs:

| Tab | Content |
| --- | --- |
| All | Every application regardless of type |
| Internships | Summer internships and industrial placements |
| Jobs | Full-time graduate roles |
| Spring Weeks | Spring week programmes |
| Events | Insight days and open days |

Applications are grouped by category: FAANG+, Software Engineering, Data Science, AI and Machine Learning, DevOps and Infrastructure, Embedded, Quant Developer, Tech Consulting, Cyber Security, Startups, IT, Miscellaneous.

The category column in Supabase has a default value of "Software Engineering". The client-side `detectCategory()` function skips the DB value when it equals the default and re-derives the category from company name and role title to ensure correct grouping.

The funnel chart at the bottom of the page shows four cumulative conversion stages: Applied (blue), Assessment (violet), Interview (amber) and Offer (green). Each stage shows the count and the conversion rate from the previous stage.

Status values: Not Applied, Interested, Application Submitted, Online Assessment, Case Study, HireVue, Telephone Interview, Video Interview, Face-to-face Interview, Assessment Centre, Offer Received, Rejected, Not Interested.

### Database (Supabase)

All dashboard data is stored in a Supabase Postgres database. For a fresh install run `sql/schema.sql` in the Supabase SQL Editor. For an existing database run the migration files in `sql/migrations/` in order. Key tables:

| Table | Purpose |
| --- | --- |
| `goals` | Goals with category, status and updated_at |
| `diary` | Diary entries with mood, hidden, pinned and locked columns |
| `notes` | Notes with folder, hidden and locked columns |
| `vault` | Vault entries with type, hidden and locked columns |
| `applications` | Job applications with status, category and unique URL index |
| `streaks` | Streak definitions and check-ins via `streak_logs` |
| `habits` | Habit definitions and frequency |
| `habit_logs` | One check-in row per habit per date |
| `health_sections` | Gym, nutrition, running and cardio section definitions |
| `health_workouts` | Day cards per gym section with exercises as jsonb |
| `health_nutrition` | Meal categories with items and rules |
| `modules` | University modules with code, credits and year |
| `assessments` | Module assessments with marks and weights |
| `course_modules` | Full programme spec from the official module catalogue |
| `inventory_items` | Devices and equipment with warranty and serial number |
| `wishlist` | Wishlist items by category and priority |
| `activity_log` | Last N user actions for the activity feed on the dashboard home |
| `config` | Key-value store for settings (theme_preference, me_profile, course_data, dashboard_pin_hash) |
| `opensource_contributions` | External OSS PRs submitted to third-party repos |
| `blog_read_events` | Scroll-depth events (25/50/75/100%) per post per IP hash |
| `wakatime_daily` | Daily coding activity synced from WakaTime API by `wakatime-sync.yml` |

---

## CV system

### Files

| File | Purpose |
| --- | --- |
| `data/cv.yml` | Single source of truth for CV content across all roles |
| `public/resume/cv.html` | Hand-crafted main CV - do not overwrite with generate-cvs.js |
| `public/resume/cv-*.html` | Role-specific HTML CVs generated from cv.yml |
| `public/resume/Isaac_Adjei_CV.pdf` | Main CV PDF |
| `public/resume/cv-*.pdf` | Role-specific PDFs generated by generate-pdfs.js |
| `public/resume/cv-*.docx` | Role-specific Word files generated by generate-docx.js |
| `scripts/generate-cvs.js` | Regenerates the 6 role-specific HTML files from cv.yml |
| `scripts/generate-pdfs.js` | Runs Puppeteer to produce PDFs from each HTML CV |
| `scripts/generate-docx.js` | Reads cv.yml and produces Word files per role |

### Roles

`software`, `embedded`, `data`, `devops`, `quant`, `security`

### How to update

1. Edit `data/cv.yml` - add content, change section order or update skills.
2. Run `npm run generate-cvs` to regenerate the 6 role HTML files. Do not run this on `cv.html`.
3. Run `npm run generate-pdfs` to regenerate all role PDFs.
4. Run `npm run generate-docx` to regenerate Word files.
5. To regenerate the main CV PDF, run `npm run generate-pdfs` after ensuring `cv.html` is correct.

### Adding a new role

1. Add a new key under `roles` in `cv.yml` with a `sections` array and optional `cover_letter`.
2. Add an entry to the `ROLES` array in `scripts/generate-cvs.js`.
3. Run the generate scripts.
4. Add a new card to the CV picker page at `app/cv/page.tsx` if it exists.

---

## Job scraper

The job scraper is a Python script (`scripts/job-scraper.py`) that runs every 3 days at midnight UTC via GitHub Actions. It can also be triggered manually from `/dashboard/settings` via the "Run Now" button, which calls `POST /api/dashboard/trigger-scraper` and dispatches the workflow using a `GH_PAT` with workflow scope.

The GitHub Actions job has two parallel jobs: `api-sources` (REST APIs, no browser) and `browser-sources` (Playwright). Both write to the same Supabase table and share the deduplication key set.

### Sources

| Source | Method | Auth |
| --- | --- | --- |
| The Trackr | Playwright (headless Chromium) | None |
| Google Careers | Playwright | None |
| Meta Careers | Playwright | None |
| ARM Careers | Playwright (Workday - session auth blocks REST API) | None |
| Goldman Sachs | Playwright (higher.gs.com React portal) | None |
| JPMorgan Careers | Playwright (Workday - session auth blocks REST API) | None |
| Greenhouse | JSON API (`/v1/boards/{company}/jobs?content=true`) | None |
| Lever | JSON API (`/v0/postings/{company}?mode=json`) | None |
| Ashby | REST API (`/posting-api/job-board/{slug}`) | None |
| SmartRecruiters | JSON API (`/v1/companies/{id}/postings`) | None |
| Apple Careers | JSON API | None |
| Microsoft Careers | JSON API | None |
| Amazon Jobs | JSON API (`/en/search.json`) | None |
| Workday | CXS API (NVIDIA, Intel, Morgan Stanley) | None |
| Remotive | JSON API (free, no auth) | None |
| Adzuna | REST API (`/v1/api/jobs/gb/search/`) | `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` |
| Jooble | REST API | `JOOBLE_API_KEY` |
| Arbeitnow | REST API (free, no auth) | None |
| Jobicy | RSS feed (free, no auth) | None |
| Reed | REST API | `REED_API_KEY` |

### Category detection

`detect_category(company, role)` in job-scraper.py assigns one of: Software Engineering, Data Science, AI and Machine Learning, DevOps and Infrastructure, Embedded, Quant Developer, Tech Consulting, Cyber Security, Startups, IT. The same logic is mirrored in `detectCategory()` in ApplicationsClient.tsx for client-side grouping.

AI detection uses a word-boundary regex (`\bai\b`) to avoid false positives from words like "email", "trail" or "retain".

### Adzuna URL resolution

Adzuna provides a `redirect_url` tracking link instead of the direct company ATS URL. The scraper calls `_resolve_url()` which follows the redirect (HEAD request with `allow_redirects=True`) and stores the final destination URL. This means all Adzuna links in the dashboard go directly to the company's own application page.

### Data lifecycle

- Scraped entries have `status = 'scraped'` and are never overwritten once a user changes the status manually.
- Each scraper run refreshes `last_scraped_at` for all entries it sees.
- Entries not seen in any scraper run for 30 days are deleted automatically by the script.
- Senior, lead, staff and internal roles are filtered out by `is_student_role()` before insertion.
- US-only and Asia-only roles are filtered by `is_uk_eu_role()` before insertion.

### Required GitHub Actions secrets

`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `REED_API_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `JOOBLE_API_KEY`, `DISCORD_WEBHOOK_URL`, `GH_PAT`

`WAKATIME_API_KEY` — GitHub Actions secret only. Do not add to Vercel. The `wakatime-sync.yml` workflow writes to Supabase directly; the dashboard reads from Supabase, so the key never touches the Next.js runtime.

---

## Discord presence (Lanyard)

The live status widget on `/now`, `/notes` and `/` includes a Discord presence card powered by [Lanyard](https://github.com/Phineas/lanyard). Lanyard is a free, open-source service that exposes Discord presence data via a REST API and WebSocket - no auth or API key required, only a Discord user ID.

### How it works

1. The user must be in the Lanyard Discord server (one-time join, free).
2. Lanyard polls Discord for the user's presence every few seconds.
3. `LiveStatusCards.tsx` fetches `api.lanyard.rest/v1/users/1087417301583790212` on a 30-second poll.
4. The `activities` array from the Lanyard response contains all concurrent activities (games, VS Code, Spotify, JetBrains, etc.).
5. Activities with `type = 4` are custom status messages and are shown separately; all other types (0=Playing, 2=Listening, 3=Watching) are shown as rich activity rows.

### Activity sources

Rich presence is broadcast automatically by: Steam games, Spotify (enable "Display on profile" in Discord settings), JetBrains IDEs (built-in plugin), VS Code (requires the Discord Presence extension), PreMiD (YouTube/Netflix/Twitch via browser extension).

### Card behaviour

- `/notes` - card only visible when Discord status is online, idle or dnd; hidden when offline.
- `/now` - card always visible; shows "last seen Xm ago" at reduced opacity when offline so the layout does not shift.
- When multiple activities are active simultaneously (e.g. Playing a game and Listening to Spotify) all are rendered as a compact stacked list with a type label ("Playing" / "Listening" / "Watching") and elapsed time per row, separated by thin dividers.

### Discord user ID

`1087417301583790212` - hardcoded in `components/shared/LiveStatusCards.tsx`. To change it, update that constant and also update the external link URL on the card.

---

## Daily Discord digest

A daily digest is sent to a Discord channel via webhook every day at 8am UTC. It can also be triggered manually from `/dashboard/settings > Discord Digest > Send now`.

### How it works

1. Vercel cron calls `GET /api/dashboard/discord-digest` at `0 8 * * *` (as configured in `vercel.json`).
2. The route checks the `Authorization: Bearer <CRON_SECRET>` header and then calls `lib/send-discord-digest.ts`.
3. The helper queries Supabase for last 24 hours of goals, applications, streaks and diary entries.
4. It builds a Discord embed with 4 inline fields and an applied-today list.
5. The embed is POSTed to `DISCORD_WEBHOOK_URL`.

The manual trigger at `POST /api/dashboard/trigger-discord-digest` uses the NextAuth session instead of CRON_SECRET, so it is protected by login rather than the shared secret.

### Required env vars

`DISCORD_WEBHOOK_URL` (Vercel), `CRON_SECRET` (Vercel)

---

## Background daemons

Three Python daemons run continuously on local machines and write status data to Upstash Redis. The `/api/macbook`, `/api/gpc` and `/api/lenovo` routes read from Redis with a live/last-known fallback pattern - if the live key (with a 10-minute TTL) has expired, the route falls back to the `*:last-known` key (no expiry) to show the last-known state with a "last seen Xm ago" label.

| Daemon | Script | Runs on | Writes to |
| --- | --- | --- | --- |
| Mac daemon | `scripts/mac-daemon.py` | MacBook Air | `macbook:status`, `macbook:last-known` |
| Gaming PC daemon | `scripts/gpc-daemon.py` | Gaming PC (Windows) | `gpc:status`, `gpc:last-known` |
| Lenovo daemon | `scripts/lenovo-daemon.py` | Lenovo ThinkPad (Windows) | `lenovo:status`, `lenovo:last-known` |

### Mac daemon

Writes every 30 seconds. Data: battery percentage, charging state, device name (from `scutil --get ComputerName`), weather (via WeatherAPI.com with `is_day` flag for correct moon/sun emoji) and heartbeat timestamp. The `is_day` field controls whether the weather card shows a sun or moon emoji based on real local sunrise/sunset rather than a fixed hour.

Runs via launchd on macOS. See `scripts/README.md` for the full launchd plist setup.

### Gaming PC daemon

Writes every 30 seconds. Data: CPU usage percentage, GPU usage percentage (NVIDIA RTX 4060 via pynvml), current game name (derived from Windows process list) and heartbeat timestamp. Runs via NSSM on Windows.

### Lenovo daemon

Writes every 30 seconds. Data: battery percentage, charging state and heartbeat timestamp. Runs via NSSM on Windows.

### PS5 presence

A Cloudflare Worker (`workers/ps5-presence/`) polls the PlayStation Network API every 2 minutes using the NPSSO session token. It writes to three Upstash Redis keys: `ps5:status` (120s TTL), `ps5:last-known` (no TTL, updated when online) and `ps5:last-game` (no TTL, updated only when a game is actively running). The `/api/ps5` route reads from Redis with the live/last-known fallback pattern. The NPSSO token expires periodically - renew it from `playstation.com` cookies when the PS5 card goes stale.

---

## Keyboard shortcuts

### Public site

| Shortcut | Action |
| --- | --- |
| `Ctrl+I` / `Cmd+I` | Open command palette (Navigation and Actions groups) |

Shortcut labels adapt to the user's OS - `Cmd` on Mac and `Ctrl` on Windows/Linux.

---

## Dashboard shortcuts

Shortcuts are registered by `hooks/useDashboardShortcuts.ts` which is mounted inside `components/dashboard/ShortcutHelp.tsx`.

| Shortcut | Destination |
| --- | --- |
| `g` then `d` | Diary |
| `g` then `n` | Notes |
| `g` then `g` | Goals |
| `g` then `a` | Applications |
| `g` then `h` | Habits |
| `g` then `s` | Streaks |
| `g` then `v` | Vault |
| `g` then `x` | Settings |
| `?` | Open shortcut help dialog |
| `Ctrl+K` / `Cmd+K` | Open global search |

Shortcuts are ignored when focus is inside an `<input>`, `<textarea>` or `[contenteditable]`. The `g` key waits 500ms for the second keypress before resetting.

---

## Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run generate-cvs` | Regenerate role-specific HTML CVs from cv.yml |
| `npm run generate-pdfs` | Regenerate role-specific PDFs using Puppeteer |
| `npm run generate-docx` | Regenerate role-specific Word files from cv.yml |

---

## Environment variables

Create `.env.local` in the project root for local development. All variables are optional for local dev unless marked as required for a specific feature.

### Public site

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL. Defaults to `https://isaacadjei.me`. Set to `http://localhost:3000` locally. Used for OG image base URLs and sitemap |
| `RESEND_API_KEY` | Optional | Resend API key for the contact form and weekly digest emails. Without it the contact form returns a 500 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Recommended | Cloudflare Turnstile site key (public, safe to expose). Without it the contact form renders without CAPTCHA |
| `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile secret for server-side token verification. Without it the CAPTCHA check is skipped |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 measurement ID (e.g. `G-XXXXXXXXXX`). Without it analytics are not collected |
| `BEEHIIV_API_KEY` | Optional | Beehiiv v2 API key for the newsletter subscription endpoint. Without it `/api/newsletter` returns a 500 |
| `BEEHIIV_PUBLICATION_ID` | Optional | Beehiiv publication ID (starts with `pub_`). Required alongside the API key |
| `GITHUB_PAT` | Optional | GitHub Personal Access Token for `/api/github-activity`. Without it the GitHub API rate limit is 60 requests/hour; with it the limit is 5,000/hour |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis REST URL. Required for Spotify cache, Mac/PC/Lenovo status cards and rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis REST token. Required alongside the URL |
| `SPOTIFY_CLIENT_ID` | Optional | Spotify app client ID for the now-playing card. Without it the Spotify card does not render |
| `SPOTIFY_CLIENT_SECRET` | Optional | Spotify app client secret |
| `SPOTIFY_REFRESH_TOKEN` | Optional | Spotify long-lived OAuth refresh token. Generate once using `scripts/spotify-auth.ts` (`npx tsx scripts/spotify-auth.ts`) |
| `PSN_NPSSO` | Optional | 64-character NPSSO session token from Sony auth. Used by the Cloudflare Worker to poll PSN presence. Renew from `playstation.com` cookies when the PS5 card goes stale. This variable is set in the Cloudflare Worker environment, not in Vercel |

### Dashboard (all required for dashboard functionality)

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (e.g. `https://xyz.supabase.co`). Found in Supabase > Settings > API |
| `SUPABASE_ANON_KEY` | Supabase anon key (safe to expose client-side but kept server-only here). Found in the same place. Use the `eyJ...` format, not the new `sb_publishable_` format which PostgREST does not yet support |
| `ALLOWED_GITHUB_ID` | Numeric GitHub user ID (not username) that is allowed to sign in. Find it at `api.github.com/users/yourusername` |
| `AUTH_SECRET` | NextAuth.js secret. Generate with `openssl rand -base64 32` or `npx auth secret` |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID. Create the OAuth app at github.com/settings/developers |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret |
| `AUTH_SECONDARY_PIN` | 4-digit (or longer) PIN for the secondary auth gate on Diary, Notes and Vault. Can be overridden by setting a bcrypt hash in the `config` table under key `dashboard_pin_hash` |
| `CRON_SECRET` | Shared secret for Vercel cron routes. The cron job sends `Authorization: Bearer <CRON_SECRET>` and the route verifies it. Generate with `openssl rand -base64 32` |
| `DIGEST_EMAIL` | Email address that receives the weekly dashboard digest sent via Resend |
| `GH_PAT` | GitHub Personal Access Token with `workflow` scope. Required for the Settings page scraper, WakaTime sync and CV regeneration triggers which dispatch GitHub Actions workflows |
| `DISCORD_WEBHOOK_URL` | Discord incoming webhook URL for the daily digest. Create it in Discord > Server Settings > Integrations > Webhooks. Required in Vercel environment variables for the daily cron |

### GitHub Actions only (never add to Vercel)

| Variable | Purpose |
| --- | --- |
| `WAKATIME_API_KEY` | WakaTime API key for `wakatime-sync.yml`. The sync writes coding stats to Supabase; the dashboard reads from Supabase. The key is only needed by the GitHub Actions runner, not by the Next.js app. Get it from wakatime.com/settings/account |

---

## API routes

### Public

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/contact` | POST | Contact form with rate limiting (3 per 10 min per IP via Upstash), honeypot field check and Resend delivery |
| `/api/newsletter` | POST | Newsletter signup via Beehiiv API. Rate limited to 3 requests per IP per hour |
| `/api/spotify` | GET | Spotify now-playing with album art, progress, duration and last-played fallback. Cached in Redis |
| `/api/macbook` | GET | MacBook battery, charging state and weather from Upstash Redis. Falls back to `macbook:last-known` when live key has expired |
| `/api/gpc` | GET | Gaming PC CPU%, GPU% and current game from Upstash Redis. Falls back to `gpc:last-known` |
| `/api/lenovo` | GET | Lenovo battery and charging state from Upstash Redis. Falls back to `lenovo:last-known` |
| `/api/ps5` | GET | PS5 presence (online status, current game) from Upstash Redis written by the Cloudflare Worker |
| `/api/github-activity` | GET | Last public push event from GitHub, cached 5 min in Redis |
| `/api/github-stats` | GET | Public repo count, follower count and total stars from GitHub API, cached 10 min |
| `/api/cv-pdf` | GET | Serve main CV PDF from `public/resume/Isaac_Adjei_CV.pdf` |
| `/api/cv-word` | GET | Serve main CV Word file from `public/resume/Isaac_Adjei_CV.docx` |
| `/api/quote` | GET | Random quote from ZenQuotes with a hardcoded fallback |
| `/api/bible-verse` | GET | Random Bible verse from NET Bible API with fallback to Jeremiah 29:11 |
| `/api/og` | GET | Dynamic OG image generation - accepts `title` and `description` query params; strips non-ASCII |
| `/api/newsletter-issues` | GET | Fetches past Beehiiv posts for the newsletter page; cached 10 min in Redis |
| `/api/blog/read-event` | POST | Record a scroll-depth event (25/50/75/100%) for a blog post; rate-limited per IP |
| `/api/cover-letter/[role]/[format]` | GET | Serve a role-specific cover letter as PDF or DOCX |
| `/api/live-status/stream` | GET | Edge Runtime SSE endpoint; fetches all 7 live-status APIs in parallel and streams merged updates every 10s |
| `/api/dashboard-manifest` | GET | Serve the private dashboard PWA manifest |

### Dashboard (session auth required)

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/dashboard/trigger-digest` | POST | Trigger the weekly email digest immediately |
| `/api/dashboard/weekly-digest` | GET | Vercel cron endpoint (checks CRON_SECRET); fires Sunday 18:00 UTC |
| `/api/dashboard/trigger-discord-digest` | POST | Trigger the daily Discord digest immediately; uses session auth |
| `/api/dashboard/discord-digest` | GET | Vercel cron endpoint for daily Discord digest (checks CRON_SECRET); fires 08:00 UTC |
| `/api/dashboard/trigger-scraper` | POST | Dispatch the GitHub Actions job-scraper workflow via `GH_PAT` |
| `/api/dashboard/scraper-status` | GET | Poll the latest GitHub Actions workflow run status for the job scraper |
| `/api/dashboard/trigger-wakatime` | POST | Dispatch the GitHub Actions wakatime-sync workflow via `GH_PAT` |
| `/api/dashboard/trigger-cv` | POST | Dispatch the GitHub Actions cv-pdf workflow via `GH_PAT` |
| `/api/dashboard/vault-expiry-check` | GET | CRON_SECRET-protected endpoint called by `vault-expiry-check.yml` |
| `/api/dashboard/verify-pin` | POST | Verify secondary PIN and set `dashboard_pin_verified` httpOnly cookie |
| `/api/dashboard/change-pin` | POST | Change the secondary PIN (bcrypt hash stored in Supabase config table) |

---

## Rules to remember

- **UK English** throughout - colour not color, organised not organized, favourite not favorite.
- **No em dashes or en dashes** - use a hyphen or rephrase.
- **No Oxford commas** - write "x, y and z" not "x, y, and z".
- **First-person comments** in code - "I use..." not "Uses...", "I fetch..." not "Fetches...". One short line max, never multi-line comment blocks.
- **No AI attribution** in commit messages or code comments.
- **Weather card shows country only** - never the city name.
- **Sitemap lists only public routes** - never `/dashboard` or any private path.
- **Do not replace the GitHub Lucide icon** with any other icon.
- **Private dashboard changes** go in `docs/LOG.md` only - never in `CHANGELOG.md`.
- **Public changes** go in `CHANGELOG.md` and the session log.
- **Never commit directly to main** - always branch, then PR, then squash merge.
- **Every PR must pass CI (Lint and Build)** before merge.
- **Supabase anon key format** - use the `eyJ...` JWT format in GitHub Actions secrets; the newer `sb_publishable_` format is not yet supported by PostgREST upserts.

---

## Deployment

Hosted on **Vercel**. DNS via **Cloudflare**. Every push to `main` triggers an automatic production deploy.

### GitHub Actions workflows

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `ci.yml` | Every PR and push to main | Lint, build, and `check-image-sizes` (fails if any image in `public/images` exceeds 50 megapixels) |
| `gitleaks-scan.yml` | Every push | Credential leak scanning |
| `deploy-ps5-presence.yml` | Push touching `workers/ps5-presence/**`, manual dispatch | Deploys the PS5 presence Cloudflare Worker |
| `cv-pdf.yml` | Push to `public/resume/cv.html` on main | Regenerate all CV PDFs and DOCX, create auto-merge PR |
| `job-scraper.yml` | Every 3 days at midnight UTC and manual dispatch | Scrape jobs from all sources and upsert to Supabase |
| `wakatime-sync.yml` | Daily at 23:30 UTC and manual dispatch | Fetch WakaTime daily summaries, upsert to `wakatime_daily` |
| `vault-expiry-check.yml` | Daily at 08:00 UTC and manual dispatch | Check vault item expiry, send Discord alert if any are near or past |

The branch ruleset on `main` does not require PRs to be up to date with main before merging - each PR merges as soon as its own checks pass. See `docs/TROUBLESHOOTING.md` for why this matters.

### Vercel cron jobs

Cron jobs are configured in `vercel.json` under the `crons` array.

| Schedule | Route | Purpose |
| --- | --- | --- |
| `0 18 * * 0` (Sun 18:00 UTC) | `/api/dashboard/weekly-digest` | Weekly email digest via Resend to DIGEST_EMAIL |
| `0 8 * * *` (daily 8:00 UTC) | `/api/dashboard/discord-digest` | Daily Discord embed digest to DISCORD_WEBHOOK_URL |

Both routes verify `Authorization: Bearer <CRON_SECRET>` before executing.

### Mac daemon

`scripts/mac-daemon.py` runs continuously on the MacBook via launchd. It writes battery percentage, charging state, device name, weather data and a heartbeat timestamp to Upstash Redis every 30 seconds. The `/api/macbook` route reads this data. See `scripts/README.md` for launchd setup.

---

## File structure

```text
├── app/
│   ├── dashboard/          # Private dashboard (auth required, not in sitemap)
│   ├── (public)/           # All public routes
│   │   ├── about/, blog/, changelog/, colophon/, consumed/
│   │   ├── cv/, experience/, lab/, links/, newsletter/
│   │   ├── notes/, now/, projects/, respub/, search/
│   │   ├── share/, skills/, tags/, til/, uses/
│   │   └── page.tsx        # Homepage / Hero
│   ├── api/                # All API routes
│   ├── globals.css
│   ├── layout.tsx          # Root layout: font, theme, header, footer
│   └── page.tsx            # Root (redirects to public group)
│
├── components/
│   ├── blog/               # PostCard, ScrollDepthTracker
│   ├── consumed/           # BookCard, VideoCard, PodcastsContent, etc.
│   ├── cv/                 # CV viewer component
│   ├── dashboard/          # Dashboard-only components
│   ├── forms/              # Contact form, newsletter signup
│   ├── layout/             # Header, Footer, Navigation, MobileNav, MobileBanner
│   ├── projects/           # ProjectCard, ProjectDetail, ImageGallery
│   ├── search/             # SearchClient
│   ├── sections/           # Hero, FeaturedProjects, ExperienceTimeline, etc.
│   ├── shared/             # SocialLinks, CommandMenu, ThemeToggle, LiveStatusCards
│   ├── tags/               # TagsClient
│   ├── til/                # TILList
│   └── ui/                 # shadcn/ui primitives
│
├── data/
│   ├── blog/               # index.ts + posts/*.ts (38 files, one per post)
│   ├── til/                # index.ts + entries/*.ts (63 files, one per entry)
│   ├── projects/           # index.ts + items/*.ts (11 files, one per project)
│   ├── respub/             # index.ts + items/*.ts (publications)
│   ├── consumed/           # index.ts, types.ts, videos/podcasts/books/music/articles/resources/others
│   ├── cv.yml              # CV source (generates role-specific HTML/PDF/DOCX)
│   ├── education.ts
│   ├── experience.ts
│   ├── links.ts
│   ├── skills.ts
│   ├── social.ts
│   └── societies.ts
│
├── docs/                   # Internal session docs (not served)
│   ├── LOG.md              # Private session log - newest first
│   ├── RULES.md            # Per-session rules
│   ├── WORKFLOW.md         # Dev workflow reference
│   ├── DASHBOARD.md        # Dashboard current state reference
│   ├── SUGGESTIONS.md      # Deferred feature backlog
│   └── verification.md     # Pre-deploy checklist
│
├── hooks/                  # Custom React hooks
├── lib/                    # animations.ts, constants.ts, utils.ts, search.ts, tags.ts, send-weekly-digest.ts, send-discord-digest.ts
├── public/
│   ├── images/projects/    # Project photos by slug
│   ├── resume/             # CV PDFs and DOCX files
│   └── Media/              # Video assets
├── scripts/
│   ├── mac-daemon.py       # Writes MacBook battery status to Upstash Redis
│   ├── gpc-daemon.py       # Writes Gaming PC GPU/CPU stats to Upstash Redis
│   ├── lenovo-daemon.py    # Writes Lenovo battery status to Upstash Redis
│   ├── job-scraper.py      # Scrapes job listings from multiple sources
│   ├── generate-pdfs.js    # Puppeteer: regenerate all role-specific PDFs
│   ├── generate-docx.js    # Regenerate role-specific Word files from cv.yml
│   ├── split-data.ts       # One-time utility to split flat data files into per-entry files
│   ├── daily-coding-summary.ts  # Nightly Discord coding summary (run via GitHub Actions)
│   └── spotify-auth.ts     # One-time OAuth helper for Spotify refresh token
└── workers/
    └── ps5-presence/       # Cloudflare Worker - polls PSN every 2 minutes
```

---

## Key dependencies

| Package | Purpose |
| --- | --- |
| `next` | App Router, SSR, image optimisation, API routes |
| `react` / `react-dom` | UI rendering |
| `typescript` | Type safety |
| `tailwindcss` | Utility-first styling |
| `framer-motion` | Page and section entrance animations |
| `next-themes` | Dark / light mode with system preference detection |
| `lucide-react` | Icon set |
| `react-icons` | Brand icons (GitHub, PlayStation, etc.) |
| `@radix-ui/*` | Accessible UI primitives via shadcn/ui |
| `@marsidev/react-turnstile` | Cloudflare Turnstile CAPTCHA widget |
| `cmdk` | Command menu behaviour |
| `clsx` + `tailwind-merge` | Class name composition |
| `puppeteer` + `@sparticuz/chromium` | Server-side CV PDF rendering |
| `@upstash/redis` + `@upstash/ratelimit` | Rate limiting and status card data |
| `geist` | Vercel Geist font (sans + mono) |
| `resend` | Contact form and weekly digest email delivery |
| `@supabase/supabase-js` | Dashboard database client |
| `next-auth` | GitHub OAuth for dashboard login (NextAuth v5 / Auth.js) |
| `recharts` | Dashboard charts (streak heatmap, mood bar chart, application funnel) |
| `sonner` | Toast notifications in the dashboard |
| `@hello-pangea/dnd` | Drag-and-drop for the Applications Kanban board |
