# app/api/

Next.js Route Handler API endpoints. All routes are server-side; none are edge runtime.

## Routes

| Route | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/auth/[...nextauth]` | GET / POST | - | NextAuth GitHub OAuth handler |
| `/api/blog/reactions` | GET / POST | None | Blog post emoji reactions (Supabase) |
| `/api/blog/read-event` | POST | None | Scroll-depth event ingestion (Supabase + Redis rate limit) |
| `/api/contact` | POST | Turnstile | Sendgrid contact form |
| `/api/cv-pdf` | GET | None | Stream main CV PDF from `public/resume/` |
| `/api/cv-word` | GET | None | Stream main CV DOCX from `public/resume/` |
| `/api/cv-software-pdf` | GET | None | Stream software role CV PDF |
| `/api/cv-software-word` | GET | None | Stream software role CV DOCX |
| `/api/cv-embedded-pdf` | GET | None | Stream embedded role CV PDF |
| `/api/cv-embedded-word` | GET | None | Stream embedded role CV DOCX |
| `/api/cv-devops-pdf` | GET | None | Stream devops role CV PDF |
| `/api/cv-devops-word` | GET | None | Stream devops role CV DOCX |
| `/api/cv-data-pdf` | GET | None | Stream data role CV PDF |
| `/api/cv-data-word` | GET | None | Stream data role CV DOCX |
| `/api/cv-quant-pdf` | GET | None | Stream quant role CV PDF |
| `/api/cv-quant-word` | GET | None | Stream quant role CV DOCX |
| `/api/cv-security-pdf` | GET | None | Stream security role CV PDF |
| `/api/cv-security-word` | GET | None | Stream security role CV DOCX |
| `/api/dashboard/github-stats` | GET | Session | GitHub contribution and repo stats |
| `/api/dashboard/trigger-cv` | POST | Session | Dispatch cv-pdf.yml workflow via GitHub Actions |
| `/api/dashboard/trigger-wakatime` | POST | Session | Dispatch wakatime-sync.yml workflow via GitHub Actions |
| `/api/github-activity` | GET | None | Last public GitHub push event |
| `/api/github-stats` | GET | None | Public GitHub stats (stars, repos) |
| `/api/gpc` | POST | Secret | Gaming PC daemon endpoint - writes CPU/GPU/game to Redis |
| `/api/lenovo` | POST | Secret | Lenovo daemon endpoint - writes battery state to Redis |
| `/api/macbook` | POST | Secret | MacBook daemon endpoint - writes battery state to Redis |
| `/api/newsletter` | POST | None | Beehiiv newsletter subscription |
| `/api/newsletter-issues` | GET | None | Fetch past Beehiiv newsletter issues |
| `/api/og` | GET | None | Open Graph image generation (Satori) |
| `/api/ps5` | GET | None | PS5 presence - proxies Upstash Redis (set by Cloudflare Worker) |
| `/api/spotify` | GET | None | Spotify now-playing (or last-played fallback) |
| `/api/quote` | GET | None | Bible verse of the day |
| `/api/bible-verse` | GET | None | Bible verse (alternative route) |
