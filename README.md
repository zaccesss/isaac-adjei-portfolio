<!-- Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header&text=Isaac%20Adjei%20Portfolio&fontSize=36&fontAlignY=32&fontColor=ffffff&animation=bounce" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1200&color=0066CC&center=true&vCenter=true&width=650&height=45&lines=Personal+Portfolio+Website;Next.js+16+%7C+TypeScript+%7C+Tailwind+CSS;10+Projects+%7C+Image+Gallery+%7C+Lightbox;Dark+%2F+Light+Mode+%7C+Fully+Responsive" />
</p>

<p align="center">
  <a href="https://isaacadjei.me">
    <img src="https://img.shields.io/badge/Live-isaacadjei.me-000000?style=for-the-badge&logo=googlechrome&logoColor=06ffa5" />
  </a>
  <a href="https://github.com/zaccesss/isaac-adjei-portfolio">
    <img src="https://img.shields.io/badge/Repo-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="mailto:contact@isaacadjei.me">
    <img src="https://img.shields.io/badge/Contact-contact@isaacadjei.me-ff6f61?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/deployment-Vercel-000000?style=flat&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/DNS-Cloudflare-f48024?style=flat&logo=cloudflare&logoColor=white" />
  <img src="https://img.shields.io/badge/status-live-brightgreen?style=flat" />
</p>

---

<p align="center">
  <b>Quick navigation:</b><br/>
  <a href="#overview">Overview</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#pages">Pages</a> •
  <a href="#features">Features</a> •
  <a href="#projects">Projects</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#api-routes">API Routes</a> •
  <a href="#file-structure">File Structure</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#scripts">Scripts</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#pre-deploy-security-checks">Pre-Deploy Security Checks</a> •
  <a href="#deployment">Deployment</a>
</p>

---

<a id="overview"></a>

## Overview

Personal portfolio website for **Isaac Adjei (Zac)** - Top 40 Finalist, Black Heritage Undergraduate of the Year 2026 and Electronic Engineering and Computer Science student at Aston University (Predicted First Class). Built to showcase 10 engineering and software projects with full image galleries and lightboxes, alongside skills, experience, blog and contact pages.

The site is a proper **Next.js 16 App Router** application with TypeScript, Tailwind CSS, Framer Motion animations and full dark/light mode support. Every page is server-rendered or statically generated where possible, with client components only where interactivity requires it.

---

<a id="live-demo"></a>

## Live Demo

<div align="center">

| Feature       | Detail                                                                |
| ------------- | --------------------------------------------------------------------- |
| Hosting       | Vercel                                                                |
| DNS           | Cloudflare                                                            |
| Custom domain | [isaacadjei.me](https://isaacadjei.me)                                |
| Auto-deploy   | On push to `main`                                                     |
| Quote API     | ZenQuotes, proxied via `/api/quote`, refreshes every 30 min           |
| Bible verse   | NET Bible API, proxied via `/api/bible-verse`, refreshes every 30 min |
| CAPTCHA       | Cloudflare Turnstile on contact form                                  |

</div>

---

<a id="pages"></a>

## Pages

| Route              | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| `/`                | Hero with profile image, bio, social links and quick-nav                           |
| `/about`           | Full personal story, education, awards, societies, volunteering and languages      |
| `/projects`        | 10 project cards with cover images, each linking to a full detail page             |
| `/projects/[slug]` | Project detail: overview, highlights, technologies and image gallery with lightbox |
| `/experience`      | Work experience and internships timeline                                           |
| `/skills`          | Full tech stack with animated icon grid across 15 categories                       |
| `/blog`            | Interactive terminal blog - type commands to explore content                       |
| `/blog/[slug]`     | Blog post page for published posts with rich content blocks                        |
| `/contact`         | Contact form with spam protection and email delivery via Resend                    |
| `/cv`              | CV viewer page with direct PDF download via `/api/cv-pdf` and printable HTML       |
| `/links`           | Linktree-style page with all social and professional links                         |

---

<a id="features"></a>

## Features

### Projects and gallery

- **10 engineering projects** - hardware, embedded, web and open source, each with full detail pages
- **Image gallery with lightbox** - uniform grid of project photos, hover zoom effect, click to open full-screen
- **Lightbox navigation** - arrow keys (left/right), Escape to close, image counter (`1 / 9`)
- **Project cover images** - each project card shows a cover photo with hover zoom

### UI and navigation

- **Dark / light mode** - system preference detection with manual toggle via `next-themes`
- **Command palette** - `Ctrl+I` / `⌘I` global shortcut opens a searchable command menu with Navigation and Actions groups; shortcut labels adapt to the user's OS (⌘H on Mac, Ctrl+H on Windows/Linux)
- **Responsive layout** - mobile-first, adapts from single column to multi-column on desktop
- **Framer Motion** - page and section entrance animations with stagger containers
- **Animated skills grid** - scroll-triggered fade-in with `IntersectionObserver`, icons across 15 categories

### Blog

- **Interactive terminal blog** - fully functional terminal emulator with 10+ commands
- **Blinking cursor, command history** and macOS-style window controls
- **Dynamic quotes** - blog page fetches fresh quotes from ZenQuotes API every 30 minutes
- **Scripture section** - random Bible verse from the NET Bible API, auto-refreshes every 30 minutes with a manual refresh button

### Contact and security

- **Contact form** - honeypot field, Upstash Redis rate limiting (3 requests / 10 min per IP), input sanitisation and Resend email delivery
- **Cloudflare Turnstile CAPTCHA** - bot protection on the contact form
- **Security headers** - CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy configured in `next.config.mjs`
- **CI pipeline** - lint and build check on every push and PR via GitHub Actions
- **Gitleaks scanning** - secret leak detection on every push and PR via GitHub Actions
- **Branch protection** - `main` requires PR, passing CI check and linear history; force push blocked
- **Cloudflare hardening** - Bot Fight Mode, Full (strict) SSL, DDoS protection, proxied DNS, SPF and DMARC records

### Performance and SEO

- **Custom favicon** - avatar image served as site icon via Next.js App Router convention (`app/icon.png`)
- **Per-page metadata** - title, description and Open Graph tags on every page
- **Sitemap** - `/sitemap.xml` auto-generated at build time, submitted to Google Search Console
- **Schema.org JSON-LD** - `Person` structured data block in root layout for rich search results
- **Next.js Image optimisation** - automatic AVIF/WebP format conversion, lazy loading and responsive sizes

---

<a id="projects"></a>

## Projects

| Project                            | Category | Featured |
| ---------------------------------- | -------- | -------- |
| Two-Stage Audio Amplifier          | Hardware | Yes      |
| 4x4x4 NeoPixel LED Cube            | Embedded | Yes      |
| AstonCV - Full-Stack CV Database   | Web      | Yes      |
| git-unlocked Open Source Course    | Other    | Yes      |
| PHAEMOS Smart Maintenance Platform | Software | Yes      |
| zacess.com - Interactive Terminal  | Web      | -        |
| CNC Milling Machine Control System | Embedded | -        |
| Goods Lift Control System          | Embedded | -        |
| CAD Engineering Design Portfolio   | Hardware | -        |
| avr-zac Bare Metal AVR C           | Embedded | -        |

---

<a id="tech-stack"></a>

## Tech Stack

<div align="center">

### Core Framework

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="55" /> | <img src="https://techstack-generator.vercel.app/js-icon.svg" width="55" /> | <img src="https://techstack-generator.vercel.app/ts-icon.svg" width="55" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="55" /> | <img src="https://techstack-generator.vercel.app/react-icon.svg" width="55" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="55" /> |
| :--------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------: | :-------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------: |
|                                               **HTML**                                               |                               **JavaScript**                                |                              **TypeScript 5**                               |                                             **Next.js 16**                                             |                                  **React 18**                                  |                                              **Node.js**                                               |

### UI and Styling

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="55" /> | <img src="https://skillicons.dev/icons?i=tailwind" width="55" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" width="55" /> |
| :------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: |
|                                        **CSS / Animations**                                        |                         **Tailwind CSS**                         |                                          **Figma (Design)**                                          |

> UI components from [shadcn/ui](https://ui.shadcn.com) - Radix UI primitives + Tailwind. Icons via `lucide-react` and `react-icons`.

### Tooling and Deployment

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="55" /> | <img src="https://techstack-generator.vercel.app/github-icon.svg" width="55" /> | <img src="https://skillicons.dev/icons?i=vercel" width="55" /> | <img src="https://skillicons.dev/icons?i=cloudflare" width="55" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="55" /> |
| :----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :------------------------------------------------------------: | :----------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------: |
|                                             **Git**                                              |                                   **GitHub**                                    |                           **Vercel**                           |                           **Cloudflare**                           |                                              **VS Code**                                               |

</div>

- **Framework** - Next.js 16 App Router with TypeScript
- **Styling** - Tailwind CSS v3 with shadcn/ui component primitives
- **Animations** - Framer Motion 11 for page and section entrance effects
- **Theming** - next-themes, system preference detection
- **Email** - Resend for contact form delivery
- **CAPTCHA** - Cloudflare Turnstile via `@marsidev/react-turnstile`
- **Quote API** - ZenQuotes, proxied through a Next.js API route to avoid CORS
- **Bible verse API** - NET Bible public API, proxied through a Next.js API route
- **Font** - Vercel Geist (sans + mono) via the `geist` package
- **Deployment** - Vercel, auto-deploys on push to `main`
- **DNS** - Cloudflare

---

<a id="api-routes"></a>

## API Routes

| Route              | Method | Purpose                                                                                                                                                              |
| ------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/contact`     | `POST` | Contact form submission with Upstash Redis rate limiting (3 req / 10 min per IP), honeypot check, optional Turnstile verification and optional Resend email delivery |
| `/api/cv-pdf`      | `GET`  | Generates and downloads the latest CV PDF from `public/resume/cv.html` using headless browser rendering                                                              |
| `/api/quote`       | `GET`  | Fetches a random motivational quote from ZenQuotes with a local fallback                                                                                             |
| `/api/bible-verse` | `GET`  | Fetches a random Bible verse from the NET Bible API with a local fallback                                                                                            |

---

<a id="file-structure"></a>

## File Structure

```
├── app/
│   ├── about/          # About page - story, education, awards, societies
│   ├── api/contact/    # Contact form API route (rate limiting, Turnstile, Resend)
│   ├── api/cv-pdf/     # Server-side CV PDF generation endpoint
│   ├── api/quote/      # ZenQuotes proxy API route
│   ├── api/bible-verse/ # NET Bible API proxy route for random Scripture verses
│   ├── blog/           # Terminal blog page
│   │   └── [slug]/     # Individual blog posts
│   ├── contact/        # Contact page
│   ├── cv/             # CV viewer page with live download actions
│   ├── experience/     # Experience timeline page
│   ├── links/          # Links / Linktree page
│   ├── projects/       # Projects list and [slug] detail pages
│   ├── skills/         # Skills page
│   ├── globals.css     # Global styles and skill grid CSS
│   ├── icon.png        # Site favicon (served automatically by Next.js)
│   ├── layout.tsx      # Root layout (font, theme, header, footer)
│   └── page.tsx        # Home / Hero
│
├── components/
│   ├── blog/           # PostCard component
│   ├── forms/          # ContactForm with Turnstile CAPTCHA
│   ├── layout/         # Header, Footer, Navigation, MobileNav
│   ├── projects/       # ProjectCard, ProjectDetail, ProjectGrid, ImageGallery
│   ├── sections/       # Hero, AboutPreview, FeaturedProjects, ContactCTA, etc.
│   ├── shared/         # SocialLinks, CommandMenu, ThemeToggle
│   └── ui/             # shadcn/ui components (Button, Card, Badge, etc.)
│
├── data/
│   ├── blog.ts         # Blog posts, types and helpers
│   ├── education.ts    # Education history
│   ├── experience.ts   # Work experience and internships
│   ├── links.ts        # Links page data
│   ├── projects.ts     # 10 projects with images, highlights and descriptions
│   ├── skills.ts       # Tech stack (icons and categories)
│   ├── social.ts       # Social profile links
│   └── societies.ts    # University societies and memberships
│
├── hooks/              # Custom hooks (command menu, media query, scroll, theme, OS mod key)
├── styles/             # Additional CSS (animations)
├── types/              # Shared TypeScript types
│
├── lib/
│   ├── animations.ts   # Framer Motion variants
│   ├── constants.ts    # Nav links, routes, site URL
│   └── utils.ts        # cn() utility
│
└── public/
    ├── images/
    │   └── projects/   # Project photos organised by project slug
    ├── Media/          # GIFs and media assets
    └── resume/         # CV source HTML (and optional static backup PDF)
```

---

<a id="getting-started"></a>

## Getting Started

**Prerequisites:** Node.js 20.9+ and npm/yarn/pnpm

```bash
# Clone the repo
git clone https://github.com/zaccesss/isaac-adjei-portfolio.git
cd isaac-adjei-portfolio

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Build for production
npm run build
npm run start

# Lint
npm run lint

# Format all files
npm run format
```

---

<a id="scripts"></a>

## Scripts

| Command          | Description                |
| ---------------- | -------------------------- |
| `npm run dev`    | Start Next.js dev server   |
| `npm run build`  | Build production bundle    |
| `npm run start`  | Start production server    |
| `npm run lint`   | Run ESLint checks          |
| `npm run format` | Format files with Prettier |

---

<a id="environment-variables"></a>

## Environment Variables

Create a `.env.local` file in the root for local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key_here
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here
```

| `UPSTASH_REDIS_REST_URL` | Optional | REST URL from [upstash.com](https://upstash.com) Redis database. If missing, rate limiting is skipped |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | REST token for the Upstash Redis database. Required alongside `UPSTASH_REDIS_REST_URL` |
| Variable | Required | Description |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL (defaults to `https://isaacadjei.me`) |
| `RESEND_API_KEY` | Optional | API key from [resend.com](https://resend.com). If missing, contact submissions are logged server-side and still return success |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Recommended | Cloudflare Turnstile site key (public). Required when Turnstile is enabled on the contact form |
| `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile secret key (server-side). If set, the API route verifies Turnstile tokens |
| `UPSTASH_REDIS_REST_URL` | Optional | REST URL from [upstash.com](https://upstash.com) Redis database. If missing, rate limiting is skipped |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | REST token for the Upstash Redis database. Required alongside `UPSTASH_REDIS_REST_URL` |

---

## Key Dependencies

| Package                        | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `next` 16                      | App Router, SSR, image optimisation, API routes     |
| `react` / `react-dom` 18       | UI rendering                                        |
| `typescript` 5                 | Type safety                                         |
| `tailwindcss` 3                | Utility-first styling                               |
| `framer-motion` 11             | Page and section entrance animations                |
| `next-themes`                  | Dark / light mode                                   |
| `lucide-react`                 | Icon set                                            |
| `react-icons`                  | Brand icons (GitHub, LinkedIn, etc.)                |
| `@radix-ui/*`                  | Accessible UI primitives (Dialog, Tabs, Tooltip)    |
| `@marsidev/react-turnstile`    | Cloudflare Turnstile CAPTCHA widget                 |
| `cmdk`                         | Command menu behavior                               |
| `clsx` + `tailwind-merge`      | Class name composition utilities                    |
| `class-variance-authority`     | Component variant styling                           |
| `puppeteer` + `puppeteer-core` | Server-side CV PDF rendering                        |
| `@sparticuz/chromium`          | Chromium binary support for serverless runtime      |
| `@upstash/redis`               | Upstash Redis client for persistent rate limiting   |
| `@upstash/ratelimit`           | Sliding-window rate limiter backed by Upstash Redis |
| `geist`                        | Vercel Geist font (sans + mono)                     |

---

<a id="pre-deploy-security-checks"></a>

## Pre-Deploy Security Checks

Run this before every production push to keep deployments smooth:

```bash
# 1) Install exactly from lockfile
npm ci

# 2) Lint all source files
npm run lint

# 3) Fail on high/critical known vulnerabilities
npm audit --audit-level=high

# 4) Verify production build succeeds
npm run build
```

Notes:

- `npm audit --audit-level=high` should return no high/critical vulnerabilities.
- If build fails on Windows with a `.next` file lock (`EPERM`), clear cache and retry:

```bash
Remove-Item -Recurse -Force .next
npm run build
```

---

<a id="deployment"></a>

## Deployment

(`RESEND_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
Hosted on **Vercel**, connected to this GitHub repo. Every push to `main` triggers an automatic production deploy. DNS is managed through **Cloudflare**.

### Setup (already done)

1. Vercel - import GitHub repo - Next.js auto-detected, no build config needed
2. Custom domain added: `isaacadjei.me`
3. Cloudflare DNS updated to point to Vercel
4. Environment variables set in Vercel project settings (`RESEND_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)

### To deploy an update

```bash
git add .
git commit -m "your message"
git push
```

Vercel picks it up within seconds.

---

## Author

**Isaac Adjei (Zac)** - [@zaccesss](https://github.com/zaccesss)

<p align="center">
  <a href="https://isaacadjei.me"><img src="https://img.shields.io/badge/Portfolio-isaacadjei.me-000000?style=flat-square&logo=googlechrome&logoColor=white" /></a>
  <a href="https://www.linkedin.com/in/isaacadjei"><img src="https://img.shields.io/badge/LinkedIn-isaacadjei-0a66c2?style=flat-square&logo=linkedin&logoColor=white" /></a>
  <a href="mailto:contact@isaacadjei.me"><img src="https://img.shields.io/badge/Email-Contact-ff6f61?style=flat-square&logo=gmail&logoColor=white" /></a>
</p>

---

<!-- Footer -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer" />
</p>

