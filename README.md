# Isaac Adjei - Portfolio

> Personal portfolio and private dashboard at [isaacadjei.me](https://isaacadjei.me)

[![CI](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/live-isaacadjei.me-000000?style=flat&logo=googlechrome&logoColor=white)](https://isaacadjei.me)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Built with Next.js 16 App Router, TypeScript, Tailwind CSS and Framer Motion. Server-rendered where possible, client components only where interactivity requires it. Deployed on Vercel with Cloudflare DNS.

> For full technical reference - pages, dashboard sections, CV system, API routes, environment variables and deployment notes - see [DOCUMENTATION.md](DOCUMENTATION.md).

---

## What this is

**Public site** at `isaacadjei.me` - projects, blog, CV, experience and a live status widget showing Spotify now-playing, MacBook/PC battery, GitHub last push, PS5 presence and Discord activity in real time.

**Private dashboard** at `isaacadjei.me/dashboard` - a personal mission-control behind GitHub OAuth and a secondary PIN. Tracks job applications (with a daily job scraper that pulls from 11 sources), university modules and marks, diary entries, goals, habits, streaks, inventory, wishlist and vault. Sends a weekly email digest and a daily Discord embed.

---

## Pages

### Public

| Route | Description |
| --- | --- |
| `/` | Hero, live status cards, social links |
| `/about` | Story, education, awards, societies and languages |
| `/projects` | 10 engineering and software projects with full detail pages |
| `/experience` | Work experience and internships timeline |
| `/skills` | Tech stack across 15 categories |
| `/blog` | 13+ published posts with reading progress bar and TOC sidebar |
| `/notes` | Public notebook: current builds, summer plans and upcoming projects |
| `/lab` | Interactive terminal with 30+ commands |
| `/cv` | CV viewer with PDF and Word download |
| `/consumed` | Monthly content log: videos, podcasts and books |
| `/now` | Current life snapshot with always-on Discord presence |
| `/newsletter` | Newsletter signup and past issues via Beehiiv |
| `/links` | All social and professional links |
| `/changelog` | Public version history |

### Private dashboard

| Route | Description |
| --- | --- |
| `/dashboard` | Home with activity feed and stat cards |
| `/dashboard/applications` | Job applications in table and Kanban view with funnel chart |
| `/dashboard/diary` | Private diary with mood tracking and analytics |
| `/dashboard/goals` | Goal tracker by category and status |
| `/dashboard/streaks` | Streak tracker with 90-day heatmap |
| `/dashboard/habits` | Habit tracker with frequency and check-in |
| `/dashboard/notes` | Private notes by folder |
| `/dashboard/vault` | Password, API key and card vault |
| `/dashboard/inventory` | Device and equipment inventory |
| `/dashboard/wishlist` | Wishlist by category |
| `/dashboard/course` | University modules, marks and programme spec |
| `/dashboard/health` | Gym plan, nutrition and running log |
| `/dashboard/settings` | PIN, theme, digest triggers and job scraper |

---

## Live status widget

The homepage (`/`), `/now` and `/lab` show the full iOS-style live status grid. `/notes` shows a slim animated teaser strip linking to `/now`.

- **Spotify** - now-playing with album art and real-time progress bar; last-played fallback when idle
- **London time** - always Europe/London timezone
- **MacBook battery** - live percentage and charging state from a Python daemon writing to Upstash Redis every 30 seconds
- **Gaming PC** - CPU and GPU usage and current game from a Windows daemon
- **Lenovo** - battery and charging state from a Windows daemon
- **GitHub** - last public push event with repo name and time
- **PS5** - online status and current game via a Cloudflare Worker polling PSN every 2 minutes
- **Discord** - real-time presence via Lanyard API; shows status dot, current activity (game, VS Code, Spotify) and custom status text; always visible on `/now` - shows "last seen Xm ago" at reduced opacity when offline

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

Most features work without any environment variables. The Spotify card, MacBook card, dashboard and job scraper require their respective secrets - see [DOCUMENTATION.md - Environment variables](DOCUMENTATION.md#environment-variables) for the full list with descriptions.

---

## Tech stack

<table align="center">
  <tr>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="48" height="48" alt="Next.js" />
      <br><sub><b>Next.js 16</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://techstack-generator.vercel.app/ts-icon.svg" width="48" height="48" alt="TypeScript" />
      <br><sub><b>TypeScript</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://techstack-generator.vercel.app/react-icon.svg" width="48" height="48" alt="React" />
      <br><sub><b>React</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" alt="Tailwind CSS" />
      <br><sub><b>Tailwind CSS</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://techstack-generator.vercel.app/python-icon.svg" width="48" height="48" alt="Python" />
      <br><sub><b>Python</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/framermotion/framermotion-original.svg" width="48" height="48" alt="Framer Motion" />
      <br><sub><b>Framer Motion</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" width="48" height="48" alt="Supabase" />
      <br><sub><b>Supabase</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" width="48" height="48" alt="Redis" />
      <br><sub><b>Upstash Redis</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="48" height="48" alt="PostgreSQL" />
      <br><sub><b>PostgreSQL</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vercel" width="48" height="48" alt="Vercel" />
      <br><sub><b>Vercel</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=cloudflare" width="48" height="48" alt="Cloudflare" />
      <br><sub><b>Cloudflare</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://techstack-generator.vercel.app/github-icon.svg" width="48" height="48" alt="GitHub" />
      <br><sub><b>GitHub</b></sub>
    </td>
  </tr>
</table>

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Animation | Framer Motion |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| Database | Supabase (Postgres + PostgREST) |
| Cache and rate limiting | Upstash Redis |
| Email | Resend |
| Newsletter | Beehiiv |
| CAPTCHA | Cloudflare Turnstile |
| Charts | Recharts |
| Deployment | Vercel |
| DNS and edge workers | Cloudflare |
| Discord presence | Lanyard API |
| PS5 presence | Cloudflare Worker + custom PSN OAuth v2 |
| CV generation | Puppeteer, html-to-docx |
| Job scraper | Python, Playwright, GitHub Actions |

---

## Repository structure

```text
app/            Next.js App Router pages and API routes
components/     Shared and dashboard-specific components
data/           Static data (projects, blog posts, CV YAML, skills)
docs/           Internal session logs, rules and verification checklist
hooks/          Custom React hooks
lib/            Shared utilities, digest helpers and constants
public/         Static assets (images, CV PDFs, media)
scripts/        Python daemons, CV generation scripts, Spotify auth helper
workers/        Cloudflare Worker for PS5 presence polling
```

---

<div align="center">

Built by [Isaac Adjei](https://isaacadjei.me)

[![isaacadjei.me](https://img.shields.io/badge/isaacadjei.me-000000?style=for-the-badge)](https://isaacadjei.me)
[![zacess.com](https://img.shields.io/badge/zacess.com-000000?style=for-the-badge)](https://zacess.com)
[![GitHub](https://img.shields.io/badge/github-zaccesss-181717?style=for-the-badge&logo=github)](https://github.com/zaccesss)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer" alt="footer" />

</div>
