# Documentation

Full reference for the Isaac Adjei portfolio and private dashboard. For a high-level overview see [README.md](README.md).

---

## Contents

- [Public site](#public-site)
- [Private dashboard](#private-dashboard)
- [CV system](#cv-system)
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
| `/` | Hero, social links, live status cards (Spotify, London time, MacBook battery, GitHub) |
| `/about` | Personal story, education, awards, societies, volunteering and languages |
| `/projects` | Grid of 10 engineering projects with cover images |
| `/projects/[slug]` | Project detail: overview, highlights, tech stack and image lightbox |
| `/experience` | Work experience and internships timeline |
| `/skills` | Full tech stack with animated icon grid across 15 categories |
| `/blog` | Blog listing with type filters (blog, journal, research, report, article, notes, resources) |
| `/blog/[slug]` | Blog post with reading progress bar, copy buttons, TOC sidebar and project links |
| `/notes` | Public notebook: live status, current builds, summer plans and upcoming projects |
| `/consumed` | Monthly content log: YouTube videos, podcasts and books |
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

### Sitemap and robots

`app/sitemap.ts` generates `/sitemap.xml` at build time. It lists only public routes - never `/dashboard` or any private path.

`app/robots.ts` generates `/robots.txt`. Crawlers are allowed on `/` and disallowed on `/dashboard/` and `/api/dashboard/`.

---

## Private dashboard

Accessible at `/dashboard`. Requires GitHub OAuth login. Only the GitHub account with `ALLOWED_GITHUB_ID` can sign in.

Certain pages (Diary, Notes, Vault) also require a secondary PIN set via `AUTH_SECONDARY_PIN`.

### Sections

| Route | Description |
| --- | --- |
| `/dashboard` | Home with recent activity feed |
| `/dashboard/me` | Personal snapshot page |
| `/dashboard/us` | Relationship section |
| `/dashboard/goals` | CRUD goal tracker by category and status |
| `/dashboard/health` | Health and fitness log |
| `/dashboard/diary` | Private diary with mood tracking, mood analytics chart and 3-dot menu (hide, pin, lock) |
| `/dashboard/notes` | Notes organised by folder with 3-dot menu |
| `/dashboard/notes/[folder]` | Folder view |
| `/dashboard/wishlist` | Wishlist tracker |
| `/dashboard/inventory` | Inventory list |
| `/dashboard/course` | University course overview |
| `/dashboard/modules` | Module list |
| `/dashboard/modules/[year]` | Year view for modules |
| `/dashboard/applications` | Job applications in table and Kanban view |
| `/dashboard/vault` | Vault overview by type |
| `/dashboard/vault/[type]` | Vault entries with 3-dot menu (hide, lock, edit, delete) |
| `/dashboard/streaks` | Streak tracker with 90-day heatmap and activity line chart |
| `/dashboard/habits` | Habit tracker |
| `/dashboard/settings` | Settings: theme toggle, data export, job scraper trigger and weekly digest test |

### Global dashboard features

- **Quick Capture (FAB)** - fixed `+` button bottom-right opens a dialog with tabs for Diary, Note, Goal and Application. Each tab calls the relevant server action and fires a sonner toast on success.
- **Keyboard shortcuts** - see [Dashboard shortcuts](#dashboard-shortcuts)
- **Global search (Ctrl+K)** - searches Goals, Notes, Diary and Applications in one query. Results grouped by section with keyboard navigation.
- **Dark mode persistence** - theme preference is saved to the `config` table in Supabase so it persists across devices.
- **Inactivity guard** - auto-locks after inactivity and redirects to login.

### Database (Supabase)

All dashboard data is stored in a Supabase Postgres database. The full schema is in `everything-in-supabase.sql`. Key tables:

| Table | Purpose |
| --- | --- |
| `goals` | Goals with category, status and updated_at |
| `diary` | Diary entries with mood, hidden, pinned and locked columns |
| `notes` | Notes with folder, hidden and locked columns |
| `vault` | Vault entries with type, hidden and locked columns |
| `applications` | Job applications with status and unique URL index |
| `streaks` | Streak definitions and check-ins via `streak_logs` |
| `habits` | Habit definitions and logs |
| `config` | Key-value store for settings (theme_preference, now_status, etc.) |
| `activity_log` | Last N user actions for the activity feed |

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

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL, defaults to `https://isaacadjei.me` |
| `RESEND_API_KEY` | Optional | Resend API key for contact form and weekly digest emails |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Recommended | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile secret for server-side verification |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis URL for rate limiting, Spotify cache and Mac daemon |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis token |
| `BEEHIIV_API_KEY` | Optional | Beehiiv API key for newsletter subscriptions |
| `BEEHIIV_PUBLICATION_ID` | Optional | Beehiiv publication ID (starts with `pub_`) |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 measurement ID |
| `SPOTIFY_CLIENT_ID` | Optional | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Optional | Spotify app client secret |
| `SPOTIFY_REFRESH_TOKEN` | Optional | Spotify long-lived OAuth refresh token |
| `GITHUB_PAT` | Optional | GitHub PAT for `/api/github-activity` (raises rate limit to 5000/hr) |
| `SUPABASE_URL` | Dashboard | Supabase project URL |
| `SUPABASE_ANON_KEY` | Dashboard | Supabase anon key |
| `ALLOWED_GITHUB_ID` | Dashboard | Numeric GitHub user ID allowed to access the dashboard |
| `AUTH_SECRET` | Dashboard | NextAuth.js secret |
| `AUTH_GITHUB_ID` | Dashboard | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | Dashboard | GitHub OAuth app client secret |
| `AUTH_SECONDARY_PIN` | Dashboard | PIN for Diary, Notes and Vault access |
| `CRON_SECRET` | Dashboard | Shared secret for Vercel cron routes |
| `DIGEST_EMAIL` | Dashboard | Email address for the weekly dashboard digest |
| `GH_PAT` | Dashboard | GitHub PAT with workflow permissions for the scraper trigger |

---

## API routes

### Public

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/contact` | POST | Contact form with rate limiting, honeypot and Resend delivery |
| `/api/newsletter` | POST | Newsletter signup via Beehiiv |
| `/api/spotify` | GET | Spotify now-playing with last-played fallback |
| `/api/macbook` | GET | MacBook battery status from Upstash Redis |
| `/api/github-activity` | GET | Last public push event from GitHub, cached 5 min |
| `/api/cv-pdf` | GET | Serve main CV PDF |
| `/api/cv-word` | GET | Serve main CV Word file |
| `/api/quote` | GET | Random quote from ZenQuotes with fallback |
| `/api/bible-verse` | GET | Random Bible verse from NET Bible API with fallback |
| `/api/og` | GET | Dynamic OG image generation |

### Dashboard (auth required)

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/dashboard/trigger-digest` | POST | Trigger the weekly email digest immediately (calls `lib/send-weekly-digest.ts` directly) |
| `/api/dashboard/weekly-digest` | POST | Vercel cron endpoint (CRON_SECRET Bearer check, then calls the same helper) |
| `/api/dashboard/trigger-scraper` | POST | Dispatch the GitHub Actions job scraper workflow |
| `/api/dashboard/scraper-status` | GET | Poll the GitHub Actions workflow status |

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

---

## Deployment

Hosted on **Vercel**. DNS via **Cloudflare**. Every push to `main` triggers an automatic production deploy.

### GitHub Actions workflows

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `ci.yml` | Push and PR to main | Lint and build check |
| `gitleaks.yml` | Push and PR | Secret leak detection |
| `generate-cvs.yml` | Push to main affecting cv.yml | Regenerate role-specific HTML CVs and PDFs |
| `cv-pdf.yml` | Push to main affecting cv.html | Regenerate main Isaac_Adjei_CV.pdf |
| `job-scraper.yml` | Weekly cron + manual dispatch | Run job-scraper.py and upsert results to Supabase |

### Weekly digest

Vercel cron runs every Sunday at 18:00 UTC and calls `/api/dashboard/weekly-digest` with `Authorization: Bearer <CRON_SECRET>`. The route verifies the secret and calls `lib/send-weekly-digest.ts` which queries Supabase and sends via Resend to `DIGEST_EMAIL`.

### Mac daemon

`scripts/mac-daemon.py` runs continuously on the MacBook via launchd. It writes battery percentage, charging state, device name and a heartbeat timestamp to Upstash Redis every 30 seconds. The `/api/macbook` route reads this data. See `scripts/README.md` for launchd setup.

---

## File structure

```text
├── app/
│   ├── dashboard/          # Private dashboard (auth required, not in sitemap)
│   ├── about/
│   ├── api/                # All API routes (contact, newsletter, spotify, cv-pdf, og, etc.)
│   ├── blog/[slug]/
│   ├── cv/
│   ├── experience/
│   ├── projects/[slug]/
│   ├── skills/
│   ├── globals.css
│   ├── layout.tsx          # Root layout: font, theme, header, footer
│   └── page.tsx            # Homepage / Hero
│
├── components/
│   ├── dashboard/          # Dashboard-only components
│   ├── layout/             # Header, Footer, Navigation, MobileNav
│   ├── projects/           # ProjectCard, ProjectDetail, ImageGallery
│   ├── sections/           # Hero, FeaturedProjects, ExperienceTimeline, etc.
│   ├── shared/             # SocialLinks, CommandMenu, ThemeToggle, BackToTop
│   └── ui/                 # shadcn/ui primitives
│
├── data/
│   ├── blog.ts             # Posts, types and helpers
│   ├── cv.yml              # CV source (generates role-specific HTML/PDF/DOCX)
│   ├── experience.ts
│   ├── projects.ts         # All project entries with images and highlights
│   ├── skills.ts
│   └── societies.ts
│
├── docs/                   # Internal session docs (not served)
│   ├── LOG.md              # Private session log - newest first
│   ├── RULES.md            # Per-session rules
│   ├── WORKFLOW.md         # Dev workflow reference
│   └── verification.md     # Pre-deploy checklist
│
├── hooks/                  # Custom React hooks
├── lib/                    # animations.ts, constants.ts, utils.ts, send-weekly-digest.ts
├── public/
│   ├── images/projects/    # Project photos by slug
│   ├── resume/             # CV PDFs and DOCX files
│   └── Media/              # Video assets
└── scripts/
    ├── mac-daemon.py       # Writes MacBook battery status to Upstash Redis
    ├── gpc-daemon.py       # Writes Gaming PC GPU/CPU stats to Upstash Redis
    ├── lenovo-daemon.py    # Writes Lenovo battery status to Upstash Redis
    ├── generate-pdfs.js    # Puppeteer: regenerate all role-specific PDFs
    ├── generate-docx.js    # Regenerate role-specific Word files from cv.yml
    └── spotify-auth.mjs    # One-time OAuth helper for Spotify refresh token
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
| `react-icons` | Brand icons (GitHub, etc.) |
| `@radix-ui/*` | Accessible UI primitives via shadcn/ui |
| `@marsidev/react-turnstile` | Cloudflare Turnstile CAPTCHA widget |
| `cmdk` | Command menu behaviour |
| `clsx` + `tailwind-merge` | Class name composition |
| `puppeteer` + `@sparticuz/chromium` | Server-side CV PDF rendering |
| `@upstash/redis` + `@upstash/ratelimit` | Rate limiting and status card data |
| `geist` | Vercel Geist font (sans + mono) |
| `resend` | Contact form and digest email delivery |
| `@supabase/supabase-js` | Dashboard database client |
| `next-auth` | GitHub OAuth for dashboard login |
| `recharts` | Dashboard charts (streak heatmap, mood bar chart) |
| `sonner` | Toast notifications in the dashboard |
