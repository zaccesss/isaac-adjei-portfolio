# Isaac Adjei — Portfolio

> Personal portfolio at [isaacadjei.me](https://isaacadjei.me) — projects, blog, CV and a private dashboard.

[![CI](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/zaccesss/isaac-adjei-portfolio/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/live-isaacadjei.me-000000?style=flat&logo=googlechrome&logoColor=white)](https://isaacadjei.me)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Next.js 16 App Router with TypeScript, Tailwind CSS and Framer Motion. Server-rendered where possible, client components only where interactivity requires it. Deployed on Vercel with Cloudflare DNS.

> For full technical reference - pages, dashboard sections, CV system, API routes, environment variables and deployment notes - see [DOCUMENTATION.md](DOCUMENTATION.md).

---

## Pages

| Route | Description |
| --- | --- |
| `/` | Hero, live status cards, social links |
| `/about` | Story, education, awards, societies |
| `/projects` | 10 engineering and software projects with full detail pages |
| `/experience` | Work experience and internships timeline |
| `/skills` | Tech stack across 15 categories |
| `/blog` | 13 published posts with reading progress and TOC |
| `/notes` | Public notebook |
| `/lab` | Interactive terminal with 30+ commands |
| `/cv` | CV viewer with PDF and Word download |
| `/consumed` | Monthly content log: videos, podcasts and books |
| `/now` | Current snapshot |
| `/newsletter` | Newsletter signup via Beehiiv |
| `/links` | All social and professional links |
| `/changelog` | Public version history |

---

## Getting started

**Prerequisites:** Node.js 20.9+ and npm

```bash
git clone https://github.com/zaccesss/isaac-adjei-portfolio.git
cd isaac-adjei-portfolio
npm install

# Activate repo git hooks (strips AI Co-authored-by trailers)
git config core.hooksPath .githooks

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

All variables are optional for local dev - the site runs without any of them. See [DOCUMENTATION.md - Environment variables](DOCUMENTATION.md#environment-variables) for descriptions and which are required for specific features.

---

<div align="center">

Built by [Isaac Adjei](https://isaacadjei.me)

[![isaacadjei.me](https://img.shields.io/badge/isaacadjei.me-000000?style=for-the-badge)](https://isaacadjei.me)
[![zacess.com](https://img.shields.io/badge/zacess.com-000000?style=for-the-badge)](https://zacess.com)
[![GitHub](https://img.shields.io/badge/github-zaccesss-181717?style=for-the-badge&logo=github)](https://github.com/zaccesss)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer" alt="footer" />

</div>
