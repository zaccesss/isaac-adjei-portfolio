# Isaac Adjei - Portfolio

[![CI](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml)
[![CV PDF](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/cv-pdf.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/cv-pdf.yml)
[![Job Scraper](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/job-scraper.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/job-scraper.yml)
[![WakaTime Sync](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/wakatime-sync.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/wakatime-sync.yml)
[![Vault Expiry](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/vault-expiry-check.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/vault-expiry-check.yml)
[![Live](https://img.shields.io/badge/live-isaacadjei.me-000000?style=flat&logo=googlechrome&logoColor=white)](https://isaacadjei.me)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Personal portfolio at [isaacadjei.me](https://isaacadjei.me). Built with Next.js 16 App Router, TypeScript and Tailwind CSS. Server-rendered where possible, client components only where interactivity requires it. Includes a private dashboard with 20+ live integrations, a job scraper pipeline, blog analytics, WakaTime heatmap, and a full CV system with automated PDF/DOCX generation. Deployed on Vercel with Cloudflare DNS.

> For full technical reference - API routes, environment variables, deployment notes - see [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md).
> For dashboard routes and Supabase schema see [docs/DASHBOARD.md](docs/DASHBOARD.md).

---

## Quick navigation

- [Public pages](#public-pages)
- [Live status](#live-status)
- [Dashboard](#dashboard)
- [CV system](#cv-system)
- [Repository structure](#repository-structure)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [GitHub Actions workflows](#github-actions-workflows)

---

## Public pages

| Route | Description |
| --- | --- |
| `/` | Hero, live status cards and social links |
| `/about` | Story, education, awards, societies and languages |
| `/projects` | 11 engineering and software projects with full detail pages |
| `/experience` | Work experience and internships timeline |
| `/skills` | Tech stack across 15 categories |
| `/blog` | Published posts with reading progress bar and TOC sidebar |
| `/notes` | Public notebook: current builds and upcoming projects |
| `/lab` | Interactive terminal with 30+ commands |
| `/cv` | CV viewer with PDF and Word download |
| `/consumed` | Monthly content log: videos, podcasts and books |
| `/now` | Current life snapshot |
| `/newsletter` | Newsletter signup and past issues via Beehiiv |
| `/links` | All social and professional links |
| `/respub` | Academic profile, research interests and publications |
| `/til` | Today I Learned: short-form knowledge entries by category |
| `/search` | Full-text search across all content types |
| `/tags` | Tag cloud across blog, TIL, projects and consumed |
| `/changelog` | Public version history |
| `/colophon` | How the site is built |
| `/uses` | Hardware, software and tools I use day to day |

---

## Live status

The homepage, `/now` and `/lab` show a live status grid. `/notes` shows a slim teaser strip. All 7 sources stream via a single SSE connection at `/api/live-status/stream` instead of per-source polling.

| Card | What it shows |
| --- | --- |
| Spotify | Now-playing with album art and real-time progress bar; last-played fallback when idle |
| London time | Always Europe/London timezone |
| MacBook | Battery percentage and charging state via a Python daemon writing to Redis every 30s |
| Gaming PC | CPU and GPU usage and current game via a Windows daemon |
| Lenovo | Battery and charging state via a Windows daemon |
| GitHub | Last public push event with repo name and time |
| PS5 | Online status and current game via a Cloudflare Worker polling PSN every 2 minutes |
| Discord | Real-time presence via Lanyard API with current activity and custom status text |

---

## Dashboard

Private dashboard at `/dashboard` (GitHub OAuth via NextAuth). Backed by Supabase PostgreSQL.

Key sections: applications tracker, job board (scraped daily), vault, diary, notes, goals, habits, activity log, open source contributions, blog analytics, WakaTime coding heatmap, and the Me page.

See [docs/DASHBOARD.md](docs/DASHBOARD.md) for the full route list and Supabase schema overview.

---

## CV system

Seven role-specific CVs (software, embedded, devops, data, quant, security, general) are generated from `public/resume/cv.html` using `scripts/generate-role-cvs.js`. The `cv-pdf.yml` workflow regenerates all PDFs and DOCX files automatically whenever `cv.html` is pushed to main.

SQL for the Supabase database lives in `sql/schema.sql` (fresh install) and `sql/migrations/` (incremental). See [sql/README.md](sql/README.md).

---

## Repository structure

```text
.github/
├── workflows/
│   ├── ci.yml                        Lint and build check on every PR
│   ├── cv-pdf.yml                    Regenerate CV PDF/DOCX on cv.html push
│   ├── job-scraper.yml               Job scraper - every 3 days at midnight UTC
│   ├── wakatime-sync.yml             Daily WakaTime coding activity sync (01:00 UTC)
│   ├── vault-expiry-check.yml        Daily vault item expiry check and Discord alert
│   ├── generate-cvs.yml              Manual CV regeneration trigger
│   ├── gitleaks-scan.yml             Secret scanning on every push
│   ├── update-pr-branches.yml        Auto-rebase open PRs when main changes
│   └── automerge-dependabot.yml      Auto-merge Dependabot PRs after CI

app/                                  Next.js App Router
├── about/, all-pages/, blog/         Public-facing pages
├── changelog/, colophon/, consumed/
├── contact/, cv/, experience/
├── hall-of-fame/, lab/, links/
├── newsletter/, notes/, now/
├── privacy/, projects/, respub/
├── search/, security-policy/, share/
├── skills/, tags/, til/, uses/
├── page.tsx                          Homepage
├── api/                              API routes
│   ├── auth/                         NextAuth GitHub OAuth handler
│   ├── blog/                         Blog reactions and scroll-depth events
│   ├── contact/                      Sendgrid contact form handler
│   ├── cover-letter/[role]/[format]/ Role-specific cover letter stream
│   ├── cv-*/                         CV PDF and DOCX generation (role-specific)
│   ├── dashboard/                    GitHub stats and activity
│   ├── dashboard-manifest/           Private dashboard PWA manifest
│   ├── github-*/                     GitHub presence integrations
│   ├── gpc/, lenovo/, macbook/       Device daemon endpoints (Redis writes)
│   ├── live-status/stream/           Edge SSE: all 7 live sources merged, every 10s
│   ├── newsletter*/                  Beehiiv newsletter endpoints
│   ├── og/                           Open Graph image generation
│   ├── ps5/, spotify/                Live presence integrations
│   └── quote/                        Bible verse of the day
└── dashboard/
    ├── (protected)/                  Auth-required dashboard pages
    │   ├── activity/, applications/, blog-analytics/, coding/
    │   ├── course/, diary/, goals/, gym/, habits/, health/
    │   ├── internships/, inventory/, me/, modules/, notes/
    │   ├── opensource/, settings/, streaks/, tech/, us/, vault/, wishlist/
    │   └── page.tsx                  Dashboard home
    ├── actions.ts                    Supabase server actions
    └── components/                   Dashboard-specific components (sidebar, header)

components/
├── blog/                             Blog post components (ScrollDepthTracker, TOC)
├── consumed/                         Consumed item cards (BookCard, VideoCard, PodcastsContent)
├── cv/                               CV viewer component
├── dashboard/                        Dashboard widgets and cards
├── forms/                            Contact and newsletter forms
├── layout/                           Header, footer, nav
├── projects/                         Project cards and detail components
├── providers/                        Context providers (theme, session)
├── search/                           SearchClient full-text search component
├── sections/                         Homepage sections (hero, status, socials)
├── shared/                           Cross-page components (breadcrumbs, badges, ShareButton)
├── tags/                             TagsClient tag cloud component
├── til/                              TILList with search, filter and pagination
└── ui/                               shadcn/ui primitives

data/
├── blog/
│   ├── index.ts                      Blog helpers and type exports
│   └── posts/                        One .ts file per blog post (~38 files)
├── consumed/
│   ├── index.ts                      Re-exports from all category files
│   ├── types.ts                      Shared consumed types
│   ├── articles.ts, books.ts, music.ts, others.ts, podcasts.ts, resources.ts, videos.ts
├── projects/
│   ├── index.ts                      Project helpers and type exports
│   └── items/                        One .ts file per project (11 files)
├── respub/
│   ├── index.ts                      Publications array and type exports
│   └── items/                        One .ts file per publication
├── til/
│   ├── index.ts                      TIL helpers: getPublishedTILEntries(), getTILBySlug()
│   └── entries/                      One .ts file per TIL entry (~63 files)
├── cv.yml                            Structured CV data (parsed by generate-role-cvs.js)
├── education.ts                      Education and awards
├── experience.ts                     Work experience and internships
├── links.ts                          Social and professional links
├── skills.ts                         Tech stack grouped by category
├── social.ts                         Social profiles
└── societies.ts                      University societies and committees

docs/
├── DASHBOARD.md                      Dashboard route list and Supabase schema overview
├── DOCUMENTATION.md                  Full technical reference
├── LOG.md                            Private session and feature history (all changes)
├── PROJECT.md                        Legacy session log (pre-June 2026)
├── RULES.md                          Code conventions for this repo
├── SUGGESTIONS.md                    Deferred feature ideas
├── TROUBLESHOOTING.md                Known issues and fixes
├── WORKFLOW.md                       Branching, PR and deployment workflow
└── verification.md                   Manual verification checklist

hooks/
├── useCommandMenu.ts                 CommandMenu open/close state
├── useDashboardShortcuts.ts          Dashboard keyboard shortcuts
├── useMediaQuery.ts                  Responsive breakpoint hook
├── useModKey.ts                      Cmd/Ctrl key label for current OS
├── useScrollPosition.ts              Scroll position tracker
└── useTheme.ts                       Theme toggle hook

lib/
├── animations.ts                     Framer Motion animation variants
├── constants.ts                      Shared constants (site URL, nav items)
├── linear-sync.ts                    Linear issue sync helpers
├── newsletter.ts                     Shared fetchNewsletterIssues() (used by API + RSS feed)
├── pin.ts                            Dashboard PIN lock
├── search.ts                         fieldScore() and relevanceScore() for /search
├── send-discord-digest.ts            Discord webhook digest helper
├── send-weekly-digest.ts             Weekly email digest helper
├── supabase.ts                       Supabase client (safe placeholder fallbacks)
├── tags.ts                           normTag() and consumedSlug() for /tags routes
├── utils.ts                          cn() and other utilities
└── vault-expiry-check.ts             Vault item expiry logic

public/
├── images/                           Project screenshots and favicons
└── resume/
    ├── cv.html                       Master CV source (never edit manually for role CVs)
    ├── cv-*.html                     Role-specific CVs (auto-generated)
    ├── cover-letter-*.html           Cover letters (software, embedded, devops, data, quant, security)
    ├── Isaac_Adjei_CV.pdf            Main CV PDF (auto-regenerated by cv-pdf.yml)
    ├── Isaac_Adjei_CV.docx           Main CV DOCX (auto-regenerated by cv-pdf.yml)
    └── cv-*.pdf / cv-*.docx          Role CV artefacts (auto-generated)

scripts/
├── generate-role-cvs.js             Assembles role-specific CV HTML from cv.html sections
├── generate-cvs.js                  Unified CV generation entry point
├── generate-pdfs.js                 Puppeteer: renders all HTML CVs to PDF
├── generate-docx.js                 html-to-docx: converts CVs to DOCX
├── watch-cvs.js                     File-watcher: re-runs role CV generation on cv.html change
├── job-scraper.py                   Multi-source job scraper (Playwright + REST APIs)
├── wakatime-sync.py                 Syncs WakaTime daily stats to Supabase
├── gpc-daemon.py                    Windows daemon: GPU/CPU usage + IGDB game art → Redis
├── mac-daemon.py                    macOS daemon: battery state → Redis
├── lenovo-daemon.py                 Windows daemon: Lenovo battery state → Redis
├── ps5-daemon.py                    Legacy PS5 polling script (superseded by Cloudflare Worker)
├── daily-coding-summary.ts          Nightly Discord summary of coding activity (GitHub Actions)
├── spotify-auth.ts                  One-time Spotify OAuth helper to obtain refresh token
├── split-data.ts                    One-time data migration: split blog.ts / projects.ts into per-entry files
└── vault-expiry-check.js            Node.js vault expiry checker (calls Supabase directly)

sql/
├── schema.sql                       Full DROP+CREATE schema for fresh Supabase installs
└── migrations/
    ├── 001_add_jobs_table.sql        Applications tracker columns
    ├── 002_add_vault_table.sql       Vault/diary/notes hidden+locked columns
    ├── 003_add_blog_reactions.sql    Activity log, habits, habit_logs, goals updated_at
    ├── 004_add_opensource_contributions.sql  Open source contributions table
    ├── 005_add_blog_read_events.sql  Blog scroll-depth events table + unique index
    ├── 006_add_wakatime_daily.sql    WakaTime daily coding activity table
    ├── 007_add_blog_read_funnel_function.sql blog_read_funnel() RPC function
    ├── 008_add_inventory_url.sql     inventory_items.url column
    ├── 008_add_wakatime_os.sql       WakaTime OS breakdown columns
    ├── 009_ensure_activity_log.sql   Activity log table and indexes
    ├── 010_add_trash_table.sql       Trash/recycle bin table
    ├── 011_add_contacts_table.sql    Contacts tracker table
    ├── 012_add_detail_to_activity_log.sql  Detail column on activity log
    ├── 013_add_contacts_phone_github.sql   Phone and github_url on contacts
    ├── 014_add_linear_issue_id.sql   linear_issue_id on jobs table
    └── 015_add_markdown_column_comments.sql  Markdown column for comments

types/                                TypeScript type definitions
workers/
└── ps5-presence/                    Cloudflare Worker: PSN polling → Upstash Redis (every 2 min)
```

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v3, shadcn/ui, Radix UI |
| Animation | Framer Motion v11 |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| Database | Supabase (Postgres + PostgREST) |
| Cache | Upstash Redis |
| CAPTCHA | Cloudflare Turnstile |
| Charts | Recharts |
| CV generation | Puppeteer, html-to-docx |
| Deployment | Vercel |
| DNS and edge | Cloudflare |
| Discord presence | Lanyard API |
| PS5 presence | Cloudflare Worker + custom PSN OAuth v2 |
| Coding activity | WakaTime (synced daily via GitHub Actions) |

<div align="center">

### Frontend

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="60" /> | <img src="https://techstack-generator.vercel.app/react-icon.svg" width="60" /> | <img src="https://techstack-generator.vercel.app/ts-icon.svg" width="60" /> | <img src="https://skillicons.dev/icons?i=tailwind" width="60" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/framermotion/framermotion-original.svg" width="60" /> |
| :----------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------: | :-------------------------------------------------------------------------: | :--------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------: |
| **Next.js 16** | **React** | **TypeScript** | **Tailwind CSS** | **Framer Motion** |

### Backend and Services

| <img src="https://techstack-generator.vercel.app/python-icon.svg" width="60" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" width="60" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="60" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" width="60" /> | <img src="https://skillicons.dev/icons?i=cloudflare" width="60" /> |
| :-----------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------: |
| **Python** | **Supabase** | **PostgreSQL** | **Upstash Redis** | **Cloudflare Workers** |

### Infrastructure and DevOps

| <img src="https://skillicons.dev/icons?i=vercel" width="60" /> | <img src="https://techstack-generator.vercel.app/github-icon.svg" width="60" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="60" /> |
| :------------------------------------------------------------: | :------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------: |
| **Vercel** | **GitHub Actions** | **Git** |

</div>

---

## Getting started

**Prerequisites:** Node.js 20.9+ and npm

```bash
git clone https://github.com/zaccesss/isaac-adjei-portfolio.git
cd isaac-adjei-portfolio
npm install
git config core.hooksPath .githooks
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Most pages work without environment variables. The live status cards (Spotify, MacBook, PS5, Discord) and the contact form require their respective secrets. See [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) for the full environment variable list.

---

## GitHub Actions workflows

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `ci.yml` | Every PR and push | Lint + Next.js build check |
| `cv-pdf.yml` | Push to `public/resume/cv.html` | Regenerate all CV PDFs and DOCX, create auto-merge PR |
| `job-scraper.yml` | Every 3 days at midnight UTC + manual | Scrape jobs from 20+ sources (Playwright + REST APIs) and upsert to Supabase |
| `wakatime-sync.yml` | Daily 01:00 UTC + manual | Sync WakaTime coding stats to `wakatime_daily` in Supabase |
| `vault-expiry-check.yml` | Daily 09:00 UTC + manual | Check vault item expiry, send Discord alert if any are near or past |
| `generate-cvs.yml` | Manual | Regenerate role CVs without changing cv.html |
| `gitleaks-scan.yml` | Every push | Secret scanning |
| `automerge-dependabot.yml` | Dependabot PRs | Auto-merge after CI passes |

---

Built by [Isaac Adjei](https://isaacadjei.me)
