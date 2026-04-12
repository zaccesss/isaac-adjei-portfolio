<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header&text=Isaac%20Adjei%20%E2%80%94%20Portfolio&fontSize=36&fontAlignY=32&fontColor=ffffff&animation=bounce" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1200&color=0066CC&center=true&vCenter=true&width=600&height=45&lines=Personal+Portfolio+Website;Built+with+Next.js+14+%2B+TypeScript;Dark+%2F+Light+Mode+%7C+Fully+Responsive;Skills+%7C+Projects+%7C+Experience+%7C+Contact" />
</p>

<p align="center">
  <a href="https://zacess.com">
    <img src="https://img.shields.io/badge/Live-zacess.com-000000?style=for-the-badge&logo=googlechrome&logoColor=06ffa5" />
  </a>
  <a href="https://github.com/zaccesss/isaac-adjei-portfolio">
    <img src="https://img.shields.io/badge/Repo-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

---

## Overview

Personal portfolio website for **Isaac Adjei** — Electronic Engineering & Computer Science student at Aston University. Built to showcase projects, skills, experience and provide a contact point. Designed to be fast, clean and fully responsive with dark/light mode support.

---

## Pages

| Route | Description |
|---|---|
| `/` | Hero landing with profile image, tagline and CTA |
| `/about` | Background, education and personal story |
| `/projects` | Project cards with problem/solution/learnings format |
| `/experience` | Work experience and internships timeline |
| `/skills` | Full tech stack with animated icon grid |
| `/contact` | Contact form (name, email, subject, message) |
| `/links` | Linktree-style page with all social and professional links |

---

## Tech Stack

<div align="center">

### Core Framework

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="55" /> | <img src="https://techstack-generator.vercel.app/react-icon.svg" width="55" /> | <img src="https://techstack-generator.vercel.app/ts-icon.svg" width="55" /> | <img src="https://skillicons.dev/icons?i=tailwind" width="55" /> |
|:---:|:---:|:---:|:---:|
| **Next.js 14** | **React 18** | **TypeScript 5** | **Tailwind CSS** |

### UI & Styling

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="55" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" width="55" /> |
|:---:|:---:|
| **CSS / Animations** | **Figma (Design)** |

> UI components from [shadcn/ui](https://ui.shadcn.com) — Radix UI primitives + Tailwind. Icons via `lucide-react` and `react-icons`.

### Tooling & Deployment

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="55" /> | <img src="https://techstack-generator.vercel.app/github-icon.svg" width="55" /> | <img src="https://skillicons.dev/icons?i=vercel" width="55" /> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="55" /> |
|:---:|:---:|:---:|:---:|
| **Git** | **GitHub** | **Vercel** | **VS Code** |

</div>

---

## Features

- **Dark / Light mode** — system preference detection with manual toggle via `next-themes`
- **Animated skills grid** — scroll-triggered fade-in with `IntersectionObserver`, icons from devicons / skillicons / simpleicons
- **Responsive layout** — mobile-first, adapts from single column to multi-column on desktop
- **Contact form** — client-side form with API route handler (`/api/contact`)
- **Links page** — Linktree-style page with categorised professional, social and content links
- **CV download** — direct PDF download button on hero
- **Smooth animations** — `framer-motion` for hero section, CSS keyframes for scroll-triggered sections
- **Projects** — problem / solution / key decisions / learnings format per project

---

## Project Structure

```
├── app/
│   ├── about/          # About page
│   ├── api/contact/    # Contact form API route
│   ├── contact/        # Contact page
│   ├── experience/     # Experience page
│   ├── links/          # Links / Linktree page
│   ├── projects/       # Projects page
│   ├── skills/         # Skills page
│   ├── globals.css     # Global styles + skill grid CSS
│   ├── layout.tsx      # Root layout (font, theme, header, footer)
│   └── page.tsx        # Home / Hero
├── components/
│   ├── layout/         # Header, Footer, ThemeToggle
│   ├── sections/       # Hero, etc.
│   ├── shared/         # SocialLinks, reusable bits
│   └── ui/             # shadcn/ui components (Button, Card, etc.)
├── data/
│   ├── links.ts        # Links page data
│   ├── projects.ts     # Projects data
│   └── skills.ts       # Tech stack data (icons + categories)
├── lib/
│   ├── animations.ts   # Framer-motion variants
│   ├── constants.ts    # Nav links, routes
│   └── utils.ts        # cn() utility
└── public/
    ├── images/         # Profile photos, local skill icons
    └── resume/         # CV PDF
```

---

## Getting Started

**Prerequisites:** Node.js 18+ and npm/yarn/pnpm

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
npm start

# Lint
npm run lint

# Format
npm run format
```

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `next` 14 | App Router, SSR, image optimisation, API routes |
| `react` / `react-dom` 18 | UI rendering |
| `typescript` 5 | Type safety |
| `tailwindcss` 3 | Utility-first styling |
| `framer-motion` 11 | Hero animations |
| `next-themes` | Dark / light mode |
| `lucide-react` | Icon set |
| `react-icons` | Brand icons (GitHub, LinkedIn, etc.) |
| `@radix-ui/*` | Accessible UI primitives (Dialog, Tabs, Tooltip) |
| `class-variance-authority` | Component variant styling |
| `geist` | Vercel Geist font |

---

## Deployment

Deployed on **Vercel** via GitHub integration. Every push to `main` triggers an automatic production deploy.

Custom domain: **[zacess.com](https://zacess.com)**

---

## Author

**Isaac Adjei** — [@zaccesss](https://github.com/zaccesss)

<p align="center">
  <a href="https://zacess.com"><img src="https://img.shields.io/badge/Portfolio-zacess.com-000000?style=flat-square&logo=googlechrome&logoColor=white" /></a>
  <a href="https://www.linkedin.com/in/isaacadjei"><img src="https://img.shields.io/badge/LinkedIn-isaacadjei-0a66c2?style=flat-square&logo=linkedin&logoColor=white" /></a>
  <a href="mailto:contact@zacess.com"><img src="https://img.shields.io/badge/Email-contact@zacess.com-ff6f61?style=flat-square&logo=gmail&logoColor=white" /></a>
</p>

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer" />
</p>
