# Isaac Adjei - Portfolio

[![CI](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/live-isaacadjei.me-000000?style=flat&logo=googlechrome&logoColor=white)](https://isaacadjei.me)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Personal portfolio at [isaacadjei.me](https://isaacadjei.me). Built with Next.js 16, TypeScript and Tailwind CSS. Server-rendered where possible, client components only where interactivity requires it. Deployed on Vercel with Cloudflare DNS.

> For full technical reference including API routes, environment variables and deployment notes see [DOCUMENTATION.md](DOCUMENTATION.md).

---

## Contents

- [Pages](#pages)
- [Live status](#live-status)
- [Getting started](#getting-started)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)

---

## Pages

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
| `/changelog` | Public version history |
| `/colophon` | How the site is built |
| `/uses` | Hardware, software and tools I use day to day |

---

## Live status

The homepage, `/now` and `/lab` show a live status grid. `/notes` shows a slim teaser strip linking to `/now`.

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

Most pages work without environment variables. The live status cards (Spotify, MacBook, PS5, Discord) and the contact form require their respective secrets. See [DOCUMENTATION.md](DOCUMENTATION.md) for the full environment variable list.

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
| CV generation | Puppeteer, docx |
| Deployment | Vercel |
| DNS and edge | Cloudflare |
| Discord presence | Lanyard API |
| PS5 presence | Cloudflare Worker + custom PSN OAuth v2 |

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

## Repository structure

```text
app/            Next.js App Router pages and API routes
components/     Shared UI components
data/           Static data (projects, blog posts, CV YAML and skills)
docs/           Internal session logs, rules and verification checklist
hooks/          Custom React hooks
lib/            Shared utilities and constants
public/         Static assets (images, CV PDFs and media)
scripts/        Python daemons, CV generation scripts and Spotify auth helper
workers/        Cloudflare Worker for PS5 presence polling
```

---

<div align="center">

Built by [Isaac Adjei](https://isaacadjei.me)

[![isaacadjei.me](https://img.shields.io/badge/isaacadjei.me-000000?style=for-the-badge)](https://isaacadjei.me)
[![zacess.com](https://img.shields.io/badge/zacess.com-000000?style=for-the-badge)](https://zacess.com)
[![GitHub](https://img.shields.io/badge/github-zaccesss-181717?style=for-the-badge&logo=github)](https://github.com/zaccesss)
[![GitLab](https://img.shields.io/badge/gitlab-zaccesss-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white)](https://gitlab.com/zaccesss)
[![Codeberg](https://img.shields.io/badge/codeberg-zaccesss-2185D0?style=for-the-badge&logo=codeberg&logoColor=white)](https://codeberg.org/zaccesss)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer" alt="footer" />

</div>
