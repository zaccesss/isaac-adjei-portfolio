# Project Reference

## About Isaac

Isaac Adjei (Zac) - Electronic Engineering and Computer Science student at Aston University, Birmingham/London based. Top 40 Finalist Black Heritage Undergraduate of the Year 2026. Builds hardware, embedded and full-stack software projects. Types fast and messily in chat - read messages carefully even when spelling is off.

---

## Site overview

- **Live site:** isaacadjei.me
- **Repo:** https://github.com/zaccesss/isaac-adjei-portfolio
- **Local path:** `/Users/isaacadjei/dev/github/repos/isaac-adjei-portfolio`
- **Framework:** Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Deployment:** Vercel (auto-deploys on push to main)
- **DNS:** Cloudflare
- **DB:** Supabase PostgreSQL (dashboard only)
- **Cache:** Upstash Redis (live status cards, rate limiting)
- **Email:** Resend (contact form + weekly digest)

`.env.local` is gitignored. All secrets live on Vercel. Local dev shows null/fallback for Redis and API data - this is expected.

---

## Key env vars (set in Vercel)

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Contact form + weekly digest |
| `UPSTASH_REDIS_REST_URL` | Rate limiting, Redis cache |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth |
| `SPOTIFY_CLIENT_ID/SECRET/REFRESH_TOKEN` | Spotify now-playing |
| `GITHUB_PAT` | GitHub activity widget (public repo pushes) |
| `SUPABASE_URL` | Dashboard DB |
| `SUPABASE_ANON_KEY` | Dashboard DB (use legacy `eyJ...` format, not `sb_publishable_`) |
| `ALLOWED_GITHUB_ID` | Numeric GitHub user ID for dashboard auth |
| `AUTH_SECRET` | NextAuth.js secret |
| `AUTH_GITHUB_ID/SECRET` | GitHub OAuth for dashboard login |
| `AUTH_SECONDARY_PIN` | Master PIN for Diary, Notes and Vault |
| `CRON_SECRET` | Auth for Vercel cron routes (weekly digest) |
| `DIGEST_EMAIL` | Email to receive weekly dashboard summary |
| `GH_PAT` | GitHub PAT with workflow scope - enables Run Now in dashboard settings |

---

## Live status widget system

**Layout (component: components/shared/LiveStatusCards.tsx, used on /notes /home /lab)**

```
[Weather + Time - full width]
[Spotify - full width]
[MacBook]  [Lenovo]
[Gaming PC] [GitHub last pushed]
```

### Weather + Time card
- Country name via `Intl.DisplayNames` from `country_code` written by Mac daemon
- NEVER shows city - privacy. Country only, always.
- Clock timezone dynamic from daemon
- Falls back to `macbook:last-known` (no TTL) so data persists when Mac is off

### Spotify card
- Uses `/me/player` - supports tracks and podcast episodes
- Progress bar ticks every second client-side, polls API every 10 seconds
- Last played fallback from `spotify:last_played` Redis key - greyed out, grayscale
- Spotify activity in Spotify card ONLY

### MacBook card
- `macbook:status` (TTL 600s) with fallback to `macbook:last-known` (no TTL)
- Stale charging rule: if `lastSeen` > 5 min, do NOT show charging icon - prevents it freezing after shutdown

### Lenovo card
- Same pattern as MacBook
- Redis keys: `lenovo:status` (TTL 600s), `lenovo:last-known` (no TTL)
- Daemon: `scripts/lenovo-daemon.py` running as Windows service via NSSM

### Gaming PC card
- Redis keys: `gpc:status` (TTL 600s), `gpc:last-known` (no TTL)
- Shows: last seen, CPU%, active game name
- Offline rule: when offline show ONLY last seen time. Never show CPU/GPU/game when stale.

### GitHub card
- `Github` icon | `GitBranch` icon - "pushed {repo}" + relative time
- Cached in Redis 5 min. Skips `zaccesss/zaccesss` profile repo.

---

## Mac daemon

- `scripts/mac-daemon.py` - runs via launchd plist
- Writes every 30s to `macbook:status` (TTL 600s) and `macbook:last-known` (no TTL)
- Weather via open-meteo, location via ipinfo.io
- City never written to Redis (privacy)
- To restart: `launchctl unload ~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist && launchctl load ...`

## Windows NSSM daemon gotchas

- Always use full Python path in nssm install
- Always install pip packages to system site-packages for services
- Always set multiple env vars in ONE nssm call (two separate calls overwrite each other)
- SERVICE_PAUSED means the process CRASHED - always check the log
- Run all nssm commands in admin PowerShell

---

## CV

- CV at `/cv` - served from `public/resume/cv.html` via CVViewer component
- PDF download served from `public/resume/Isaac_Adjei_CV.pdf` via `/api/cv-pdf`
- PDF is auto-regenerated via GitHub Actions whenever `cv.html` changes on main (`.github/workflows/cv-pdf.yml`)
- To edit: change `cv.html`, push - PDF regenerates automatically

---

## CHANGELOG rules

- Always update before committing
- Entries under `[Unreleased]`: Added / Changed / Fixed / Removed
- No em dashes, no Oxford comma
- Public changes only. Dashboard changes go in `memory/LOG.md`.
