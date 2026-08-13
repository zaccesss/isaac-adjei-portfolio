# Isaac Adjei - Portfolio

[![CI](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml)
[![CV PDF](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/cv-pdf.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/cv-pdf.yml)
[![Live](https://img.shields.io/badge/live-isaacadjei.me-000000?style=flat&logo=googlechrome&logoColor=white)](https://isaacadjei.me)
[![License: PolyForm NC](https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue.svg)](LICENSE)

Personal portfolio at [isaacadjei.me](https://isaacadjei.me). Built with Next.js 16 App Router, TypeScript and Tailwind CSS. Server-rendered where possible, client components only where interactivity requires it. Includes a private dashboard with 20+ live integrations, a job scraper pipeline, blog analytics, WakaTime heatmap and a full CV system with automated PDF/DOCX generation. Deployed on Vercel with Cloudflare DNS.

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
| `/hall-of-fame` | People and work that inspire me |
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

Key sections: applications tracker, job board (scraped daily), health, study, faith, university, calendar, contacts, vault, diary, notes, goals, habits, streaks, activity log, open source contributions, blog analytics, the WakaTime coding heatmap and the Me page. There is also a read-only AI assistant and a per-area analytics view.

See [docs/DASHBOARD.md](docs/DASHBOARD.md) for the full route list and Supabase schema overview.

---

## CV system

Seven role-specific CVs (software, embedded, devops, data, quant, security, general) are generated from `public/resume/cv.html` using `scripts/generate-role-cvs.js`. The `cv-pdf.yml` workflow regenerates all PDFs and DOCX files automatically whenever `cv.html` is pushed to main.

SQL for the Supabase database lives in `sql/migrations/` - numbered, idempotent files that build the whole schema (there is no schema.sql). See [sql/README.md](sql/README.md).

---

## Repository structure

```text
.                                     Repo root (Next.js 16 App Router)
├── auth.ts                           NextAuth v5 config (GitHub OAuth, login/logout activity)
├── middleware.ts                     Edge middleware: maintenance gate and auth cookie check
├── instrumentation.ts                Sentry server/edge init hook
├── sentry.server.config.ts           Sentry setup (Node only - kept off the edge runtime)
├── open-next.config.ts               OpenNext build config
├── wrangler.jsonc                    Cloudflare Worker config
└── next.config.mjs, tailwind.config.ts, tsconfig.json, vercel.json, ...

.github/
├── WORKFLOWS.md                      Workflow index and conventions
└── workflows/
    ├── ci.yml                        Lint, build and image-size check on every PR
    ├── cv-pdf.yml                    Regenerate CV PDF/DOCX on cv.html push
    ├── deploy-ps5-presence.yml       Deploy the PS5 worker on changes to workers/ps5-presence/**
    ├── generate-cvs.yml              Manual CV regeneration trigger
    └── gitleaks-scan.yml             Secret scanning on every push

app/                                  Next.js App Router
├── (public pages)                    about, all-pages, blog, changelog, colophon, consumed,
│                                     contact, cv, experience, hall-of-fame, lab, links,
│                                     newsletter, notes, now, privacy, projects, respub,
│                                     search, security-policy, share, skills, tags, til, uses
├── maintenance/                      Standalone maintenance-mode page (theme toggle, prod gate)
├── feed.xml/, feed.xsl/              RSS feed and stylesheet
├── page.tsx                          Homepage
├── layout.tsx, error.tsx, not-found.tsx, globals.css
├── sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, twitter-image.tsx
├── api/                              API routes
│   ├── auth/                         NextAuth GitHub OAuth handler
│   ├── live-status/stream/           Edge SSE: all 7 live sources merged
│   ├── gpc/, lenovo/, macbook/       Device daemon endpoints (Redis writes)
│   ├── ps5/, spotify/, spotify-top/  PS5, Spotify now-playing and top tracks
│   ├── github-activity/, github-stats/   GitHub presence and stats
│   ├── blog/, blog-reactions/        Blog reactions and scroll-depth events
│   ├── contact/                      Resend contact form handler
│   ├── cover-letter/[role]/[format]/ Role-specific cover letter stream
│   ├── cv-*/                         CV PDF and DOCX generation (per role)
│   ├── newsletter/, newsletter-issues/   Beehiiv newsletter endpoints
│   ├── bible-verse/, quote/          Daily Bible verse
│   ├── routine-ical/                 Routine calendar (iCal) feed
│   ├── strava/                       Strava OAuth and activity webhook
│   ├── health/, incident/            Uptime health check and incident -> Linear webhook
│   ├── og/, top-content/, wakatime-stats/   OG images, popular content, coding stats
│   ├── discord-interaction/          Discord bot slash-command endpoint (Ed25519 verified)
│   ├── export/, files/               Data export and file storage endpoints
│   ├── dashboard-manifest/           Private dashboard PWA manifest
│   └── dashboard/                    ~22 dashboard routes (digests, triggers, Strava sync,
│                                     PIN lock, Linear, scraper and workflow status, ...)
└── dashboard/
    ├── (protected)/                  Auth-required dashboard pages:
    │                                 activity, analytics, applications, assistant, post-analytics,
    │                                 calendar, coding, contacts, course, diary, faith, files,
    │                                 goals, gym, habits, health, internships, inventory, me,
    │                                 modules, notes, opensource, settings, streaks, study, tech,
    │                                 trash, university, us, vault, wishlist
    ├── actions.ts                    Supabase server actions
    └── components/                   Dashboard-specific components (sidebar, header)

components/
├── analytics/                        Shared chart framework (period selector, line/bar/pie, stat cards)
├── blog/                             Blog post components (ScrollDepthTracker, TOC)
├── consumed/                         Consumed item cards (BookCard, VideoCard, PodcastsContent)
├── cv/                               CV viewer component
├── dashboard/                        Dashboard widgets and cards
├── editor/                           TipTap rich-text editor (notes and diary)
├── forms/                            Contact and newsletter forms
├── lab/                              Interactive /lab terminal components
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
├── blog/posts/                       One .ts file per blog post
├── consumed/                         Category files (articles, books, music, podcasts, videos, ...)
├── projects/items/                   One .ts file per project
├── respub/items/                     One .ts file per publication
├── til/entries/                      One .ts file per TIL entry
├── cv.yml                            Structured CV data (parsed by generate-role-cvs.js)
└── education.ts, experience.ts, links.ts, skills.ts, social.ts, societies.ts

docs/
├── DASHBOARD.md                      Dashboard route list and Supabase schema overview
├── DOCUMENTATION.md                  Full technical reference
├── RULES.md                          Code conventions for this repo
├── WORKFLOW.md                       Branching, PR and deployment workflow
├── TROUBLESHOOTING.md                Known issues and fixes
├── PROJECT.md, LOG.md                Legacy and session history
├── thoughts.md                       Planning and design notes
└── verification.md                   Manual verification checklist

hooks/
├── useBulkSelect.ts                  Multi-row select state for dashboard tables
├── useCommandMenu.ts                 CommandMenu open/close state
├── useDashboardShortcuts.ts          Dashboard keyboard shortcuts
├── useMediaQuery.ts                  Responsive breakpoint hook
├── useModKey.ts                      Cmd/Ctrl key label for current OS
├── useScrollPosition.ts              Scroll position tracker
└── useTheme.ts                       Theme toggle hook

lib/
├── animations.ts                     Framer Motion animation variants
├── application-status.ts             Applications status labels and helpers
├── cdn-cache.ts                      Cloudflare cache purge helper
├── constants.ts                      Shared constants (site URL, nav items)
├── digest-ai-summary.ts              AI intro generation for the digests (Groq/Gemini/...)
├── digest-facts.ts                   Shared fact-gathering for the email and Discord digests
├── goal-progress.ts                  Goal progress calculations
├── healthcheck-ping.ts               Healthchecks.io cron pings
├── ical.ts, routine-ical.ts          Calendar feed generation
├── incident.ts                       Incident -> urgent Linear issue webhook
├── lastfm.ts                         Last.fm scrobble helper
├── linear-sync.ts                    Linear issue sync helpers
├── live-status.ts                    Live-status source aggregation
├── maintenance.ts                    Maintenance-mode flag (config + Upstash)
├── newsletter.ts                     Shared fetchNewsletterIssues() (API + RSS feed)
├── pin.ts                            Dashboard PIN lock
├── ratelimit.ts                      Upstash rate limiting
├── redis.ts                          Upstash Redis client
├── search.ts                         fieldScore() and relevanceScore() for /search
├── send-discord-digest.ts            Discord webhook digest helper
├── send-weekly-digest.ts             Weekly email digest helper
├── strava.ts                         Strava token refresh and activity sync
├── streaks.ts                        Streak calculation helpers
├── supabase.ts                       Supabase client (safe placeholder fallbacks)
├── tags.ts                           normTag() and consumedSlug() for /tags routes
├── utils.ts                          cn() and other utilities
└── vault-expiry-check.ts             Vault item expiry logic (dashboard and digest)

public/
├── images/                           Project screenshots and favicons
└── resume/                           Master cv.html, role CVs, cover letters, generated PDF/DOCX

scripts/
├── generate-role-cvs.js              Assembles role-specific CV HTML from cv.html sections
├── generate-cvs.js                   Unified CV generation entry point
├── generate-pdfs.js                  Puppeteer: renders all HTML CVs to PDF
├── generate-docx.js                  html-to-docx: converts CVs to DOCX
├── watch-cvs.js                      File-watcher: re-runs role CV generation on cv.html change
├── check-image-sizes.ts              Enforces the OG and image size budget in CI
├── setup-discord-server.mjs          Builds the private Discord server from the dashboard layout
├── export-discord-server.mjs         Exports an existing Discord server to JSON
├── register-discord-commands.mjs     Registers the dashboard's Discord slash commands
├── linear-setup.ts                   One-time Linear project and team setup
├── spotify-auth.ts                   One-time Spotify OAuth helper to obtain a refresh token
├── split-data.ts                     One-time data migration: split blog/projects into per-entry files
├── gpc-daemon.py, mac-daemon.py, lenovo-daemon.py   Device daemons (battery/CPU/GPU -> Redis)
└── ps5-daemon.py                     Legacy PS5 polling script (superseded by Cloudflare Worker)

sql/
└── migrations/                       Numbered migrations 001-046 that build the whole schema - see sql/README.md

styles/
└── animations.css                    Shared keyframe animations

types/                                Shared TypeScript types (experience, projects, index)
workers/
└── ps5-presence/                     Cloudflare Worker: PSN polling -> Upstash Redis (every 2 min)
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
| `generate-cvs.yml` | Manual | Regenerate role CVs without changing cv.html |
| `gitleaks-scan.yml` | Every push | Secret scanning |

> Scheduled data jobs - the job scraper, WakaTime sync, vault expiry check, daily coding summary and streak reminder - now run from the separate [isaac-adjei-automations](https://github.com/zaccesss/isaac-adjei-automations) repo so they use its free Actions minutes. The Settings page still triggers the scraper and WakaTime sync on demand.

---

Built by [Isaac Adjei](https://isaacadjei.me)
