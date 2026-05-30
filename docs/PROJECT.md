# Project Reference

## About Isaac

Isaac Adjei (Zac) - Electronic Engineering and Computer Science student at Aston University, Birmingham/London based. Top 40 Finalist Black Heritage Undergraduate of the Year 2026. Builds hardware, embedded and full-stack software projects. Types fast and messily in chat - read messages carefully even when spelling is off.

---

## Site overview

- **Live site:** isaacadjei.me
- **Repo:** https://github.com/zaccesss/isaac-adjei-portfolio
- **Local path:** `/Users/isaacadjei/dev/github/repos/isaac-adjei-portfolio`
- **Framework:** Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Deployment:** Vercel (main Next.js app, auto-deploys on push to main); Cloudflare Workers (PS5 presence worker, deployed manually via Wrangler)
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
| `PSN_NPSSO` | PS5 Cloudflare Worker only - 64-char hex from playstation.com cookies. Not a Vercel env var. |
| `IGDB_CLIENT_ID` | Twitch Developer App - used by PS5 Worker and GPC daemon for IGDB cover art |
| `IGDB_CLIENT_SECRET` | Twitch Developer App secret (same app as above) |
| `STEAM_API_KEY` | Steam Web API key - GPC daemon only, for 5-tier game detection |
| `STEAM_ID` | Steam64 user ID (format: 76561198xxxxxxxxx) - GPC daemon only |
| `BEEHIIV_API_KEY` | Beehiiv newsletter API |
| `BEEHIIV_PUBLICATION_ID` | Beehiiv publication ID (format: pub_xxx) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics measurement ID |

---

## Live status widget system

**Layout (component: components/shared/LiveStatusCards.tsx, used on /notes /home /lab; full widget on /now, slim teaser strip on /notes)**

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
- Shows: last seen, CPU%, active game name and cover art thumbnail
- Offline rule: when offline show ONLY last seen time. Never show CPU/GPU/game when stale.
- Game detection uses 5-tier logic: (1) hardcoded KNOWN_GAMES dict, (2) Steam Web API, (3) Epic Games local manifests, (4) EA App local manifests, (5) psutil process scanning with IGDB fuzzy name matching. Cover art is fetched from IGDB on first detection per session and cached in memory.

### PS5 card
- Redis keys: `ps5:status` (TTL 150s), `ps5:last-known` (no TTL)
- Shows: online/offline, current game with IGDB cover art, last-seen time
- Offline rule: when offline shows text-only last played game name (no image); "Last played: [game]" text below the last-seen timestamp.
- Powered by Cloudflare Worker `workers/ps5-presence/` - cron every minute
- PSN auth: NPSSO cookie exchanged for access + refresh token on first run; refresh token stored in KV `PS5_KV`, rotated on each use (~60 day lifetime)
- Game cover art: IGDB lookup on every cron run; falls back to PSN `conceptIconUrl` (changes with promotions)
- Worker secrets: `PSN_NPSSO`, `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### GitHub card
- `Github` icon | `GitBranch` icon - "pushed {repo}" + relative time
- Cached in Redis 5 min. Skips `zaccesss/zaccesss` profile repo.

---

## Mac daemon

- `scripts/mac-daemon.py` - runs via launchd plist on macOS
- Writes every 30s to `macbook:status` (TTL 600s) and `macbook:last-known` (no TTL)
- **Weather:** Open-Meteo API (free, no key, ECMWF model) - more accurate for UK weather than WeatherAPI
- **Location:** CoreLocationCLI (GPS, street-level precision) with ipinfo.io as fallback for coordinates; ipinfo.io always used for `country_code` and `timezone`
- City is never written to Redis (privacy). Only `country_code` and `timezone` stored.
- Night emoji: `is_day` field from Open-Meteo determines moon vs sun. Clear and mainly-clear at night show moon. Partly cloudy at night shows plain cloud.
- Setup requirements: `brew install corelocationcli` + `pip install psutil requests`
- To restart: `pkill -f mac-daemon.py && python3 scripts/mac-daemon.py`
- env vars needed: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Windows NSSM daemon gotchas

- Always use full Python path in nssm install
- Always install pip packages to system site-packages for services
- Always set multiple env vars in ONE nssm call (two separate calls overwrite each other)
- SERVICE_PAUSED means the process CRASHED - always check the log
- Run all nssm commands in admin PowerShell
- GPC daemon requires IGDB_CLIENT_ID, IGDB_CLIENT_SECRET, STEAM_API_KEY and STEAM_ID in AppEnvironmentExtra (set all in ONE nssm call - two separate calls overwrite each other)

---

## CV

- CV at `/cv` - served from `public/resume/cv.html` via CVViewer component
- PDF download served from `public/resume/Isaac_Adjei_CV.pdf` via `/api/cv-pdf`
- PDF is auto-regenerated via GitHub Actions whenever `cv.html` changes on main (`.github/workflows/cv-pdf.yml`)
- To edit: change `cv.html`, push - PDF regenerates automatically

---

## Cloudflare Worker (PS5 presence)

- **Worker path:** `workers/ps5-presence/`
- **Deploy:** `cd workers/ps5-presence && npx wrangler@3 deploy`
- **Secrets to set (via `wrangler secret put`):**
  - `PSN_NPSSO` - 64-char hex NPSSO cookie from playstation.com
  - `IGDB_CLIENT_ID` - Twitch app client ID
  - `IGDB_CLIENT_SECRET` - Twitch app client secret
  - `UPSTASH_REDIS_REST_URL` - same as main site
  - `UPSTASH_REDIS_REST_TOKEN` - same as main site
- **KV namespace:** `PS5_KV` - stores the PSN refresh token so the NPSSO is only needed once per ~60 days
- **Cron:** every minute, configured in `wrangler.toml` schedule
- **To renew NPSSO:** `echo "your-npsso" | npx wrangler@3 secret put PSN_NPSSO`

---

## CHANGELOG rules

- Always update before committing
- Entries under `[Unreleased]`: Added / Changed / Fixed / Removed
- No em dashes, no Oxford comma
- Public changes only. Dashboard changes go in `docs/LOG.md`.
