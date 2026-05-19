---
name: project-live-status-widgets
description: Live status widget system on notes page - devices, weather, Spotify, GitHub. Current state and what's next.
metadata:
  type: project
---

Current state as of 2026-05-19 (all merged to main, live on isaacadjei.me):

**Layout (top to bottom):**
1. Full-width Weather + Time card — country name (privacy, not city), live clock in actual timezone, weather condition + emoji + temp from daemon
2. Full-width Spotify card — track/podcast, device name in label, real-time progress bar (1s tick), last played fallback when idle
3. 2x2 grid:
   - MacBook Air (top-left) — last seen, battery, charging via mac-daemon.py
   - Lenovo (top-right) — offline, daemon not set up
   - Gaming PC / ZACCESS-GPC (bottom-left) — offline, daemon not set up
   - GitHub last pushed (bottom-right) — Github icon | GitBranch icon, repo name + time

**Architecture:**
- `scripts/mac-daemon.py` — runs on Mac via launchd plist (`~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist`). Writes battery, charging, device name, country_code, timezone, weather_condition, weather_emoji, temp_c to Redis keys `macbook:status` (600s TTL) and `macbook:last-known` (no TTL). Weather refreshes every 10 cycles (~5 min) via ipinfo.io + open-meteo. City never stored for privacy.
- `/api/macbook` — reads from Redis, returns all fields
- `/api/spotify` — uses `/me/player` endpoint, returns track or podcast episode, device name, last_played fallback stored in Redis
- `/api/github-activity` — last public push, cached 5 min in Redis
- `components/shared/LiveStatusCards.tsx` — single component used on /notes, /home and /lab

**What's next — Windows daemons:**
- Need to build Windows daemon (Python) for Lenovo and Gaming PC
- Lenovo: same as mac-daemon but Windows — battery + last seen, writes to `lenovo:status` / `lenovo:last-known`
- Gaming PC: no battery — CPU%, active game detection (scan processes), writes to `gpc:status` / `gpc:last-known`
- Need new API routes: `/api/lenovo` and `/api/gpc`
- Component already has placeholder cards ready — just needs the data wired up
- Use NSSM (Non-Sucking Service Manager) instead of Task Scheduler for auto-restart like launchd
- GPU stats: need to confirm if NVIDIA (use pynvml) or AMD (use WMI) on gaming PC
- Game detection: scan Windows processes against a list of known game executables
- User is not sure if NVIDIA or AMD — confirm before building GPU stats

**Key decisions made:**
- City not shown publicly, only country (privacy — user travels Birmingham/London and doesn't want strangers knowing exact location)
- Clock timezone is dynamic from daemon — auto-switches when travelling (e.g. Ghana shows Ghana time)
- Weather hidden until daemon writes real data (no placeholder dashes)
- Spotify activity stays in Spotify card only — Gaming PC card will show CPU/game, not Spotify
- `macbook:last-known` has no TTL so weather/location persists when Mac is off

**Why:** [[feedback-workflow-preferences]]
