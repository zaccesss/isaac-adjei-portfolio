# Agent Instructions — Isaac Adjei Portfolio

Read this entire file before doing anything. Do not skip sections. Do not ask the user
questions that are answered here. Do not make assumptions that contradict what is written here.

---

## Who the user is

Isaac Adjei (Zac) — Electronic Engineering and Computer Science student at Aston University,
London/Birmingham based, travels between the two. Top 40 Finalist Black Heritage Undergraduate
of the Year 2026. Builds hardware, embedded and full-stack software projects. Not a beginner —
understands code well but types fast and messily in chat. Read his messages carefully even when
spelling is off.

---

## How to communicate

- Short and direct. No padding, no summaries of what you just did.
- No em dashes (—) or en dashes (–). Use a hyphen (-) instead.
- No Oxford comma. Write "x, y and z" not "x, y, and z".
- No emojis unless Isaac explicitly asks.
- When referencing files use markdown links: [filename.ts](path/to/file.ts)
- One or two sentence updates while working. Never silent.

---

## Code comment rules

- Write comments in first person: "I fetch the player endpoint here because..." not "Fetches the player endpoint"
- Add comments where the WHY is non-obvious — a hidden constraint, a subtle invariant, a workaround, behaviour that would surprise a reader
- Be detailed in comments where the reasoning is complex or the decision was deliberate
- Do not comment on WHAT the code does if the code is self-explanatory
- No multi-line block comments for simple things. A single well-written line is almost always enough.
- No auto-generated docstrings. Only write a docstring if the function has a non-obvious contract.

---

## Project overview

Personal portfolio website: **isaacadjei.me**
Repo: `https://github.com/zaccesss/isaac-adjei-portfolio`
Local path: `/Users/isaacadjei/dev/github/repos/isaac-adjei-portfolio`
Framework: Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
Deployment: Vercel (auto-deploys on push to main)
DNS: Cloudflare
Database/cache: Upstash Redis (all env vars live on Vercel only — no .env.local file exists)

---

## Absolute workflow rules — never deviate

1. Always branch from latest main: `git checkout main && git pull`
2. Update CHANGELOG.md under `[Unreleased]` BEFORE committing
3. Branch naming: `feat/description`, `fix/description`, `chore/description`, `content/description`
4. Commit message format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` — no em/en dashes, no Oxford comma
5. Push branch, create PR, enable auto-merge in one go:
   ```
   git push -u origin branch-name
   gh pr create --title "..." --body "..."
   gh pr merge --squash --delete-branch --auto
   ```
6. Wait for CI (Lint and Build) to pass — it takes ~2 minutes
7. After merge: `git checkout main && git pull && git branch -d branch-name && git remote prune origin`
8. Never commit directly to main. Never force push. Never skip hooks.
9. No .env.local exists — all secrets are on Vercel. Local dev will show null/fallback for any Redis or API data. This is expected and fine — test on the live site after deploy.

---

## Git commit hook rules

The `.githooks/commit-msg` hook rejects:
- Em dashes (—) or en dashes (–) — use hyphen instead
- Oxford comma (x, y, and z) — write x, y and z
- AI attribution lines (Co-Authored-By: Claude etc.)

---

## Code rules

- TypeScript strict mode — no `any`, no untyped variables
- No unused imports — CI will fail on lint errors
- No inline CSS styles where avoidable — use Tailwind. Exception: genuinely dynamic values like progress bar width (`style={{ width: \`${pct}%\` }}`) which cannot be done statically in Tailwind
- The `Github` icon from lucide-react is deprecated but intentionally kept — do not replace it
- `react-hooks/set-state-in-effect` — do not call setState synchronously at the top level of a useEffect body. Use setTimeout(..., 0) to defer, or put it inside an interval/async callback
- All API routes use `{ headers: { "Cache-Control": "no-store" } }` in NextResponse.json
- Redis keys follow the pattern `resource:type` e.g. `macbook:status`, `spotify:last_played`

---

## Environment variables

All on Vercel. Never commit real values. The `.env.example` has placeholders.
Key variables relevant to live status system:
- `UPSTASH_REDIS_REST_URL` — Upstash Redis endpoint
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis token
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`
- `GITHUB_PAT` — raises GitHub API rate limit from 60 to 5000 req/hr

The launchd plist at `~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist` contains the
real Upstash values for the daemon. The script path in the plist must be:
`/Users/isaacadjei/dev/github/repos/isaac-adjei-portfolio/scripts/mac-daemon.py`

---

## Live status widget system — full state as of 2026-05-19

### Layout on /notes (component: components/shared/LiveStatusCards.tsx)

```
[Weather + Time card — full width]
[Spotify card — full width]
[MacBook card]  [Lenovo card]
[Gaming PC card] [GitHub last pushed card]
```

### Weather + Time card
- Shows "Currently in {country name}" — country name from `Intl.DisplayNames` using country_code from daemon
- NEVER shows city — privacy decision. Isaac travels between Birmingham and London and does not want strangers knowing his exact location. Country level only, always.
- Clock uses timezone from daemon (dynamic — auto-switches when travelling e.g. Ghana shows Ghana time)
- Weather emoji + condition + temperature shown on the right, hidden entirely until daemon has written real data
- All data comes from `macbook:last-known` Redis key (no TTL — persists when Mac is off)

### Spotify card
- Uses `/me/player` endpoint (not `/me/player/currently-playing`) to get device name
- Supports tracks AND podcast episodes (currently_playing_type field)
- Label: "Currently Listening on {device name}" — actual Spotify device name, fully dynamic
- Progress bar ticks every second client-side via setInterval
- Polls every 10 seconds
- When nothing playing: shows last played track/episode from `spotify:last_played` Redis key (no TTL), greyed out with grayscale artwork
- Spotify activity stays in Spotify card ONLY — other device cards do not show Spotify data

### MacBook card (top-left of 2x2 grid)
- Source: `macbook:status` (TTL 600s) with fallback to `macbook:last-known` (no TTL)
- Shows: device name, last seen (online now / Xm ago / Xh ago / Xd ago), battery %, charging state
- Online indicator: blue Wifi icon if last seen < 5 minutes, grey WifiOff otherwise
- Battery: blue BatteryCharging icon when charging, red Battery icon if <= 20%, grey otherwise

### Lenovo card (top-right of 2x2 grid)
- Currently: offline placeholder ("daemon not set up")
- When daemon built: will show same as MacBook (last seen + battery + charging)
- Redis keys to use: `lenovo:status` (TTL 600s) and `lenovo:last-known` (no TTL)
- API route to build: `/api/lenovo`
- Component state to add: `lenovo: LenovoData` with same interface as MacbookData (minus weather/location fields — those stay Mac only)

### Gaming PC card (bottom-left of 2x2 grid)
- Currently: offline placeholder ("daemon not set up")
- When daemon built: last seen + CPU% + active game (if one is running)
- NO battery (desktop machine)
- NO Spotify activity — that stays in Spotify card only
- Redis keys to use: `gpc:status` (TTL 600s) and `gpc:last-known` (no TTL)
- API route to build: `/api/gpc`
- GPU stats: ask Isaac at start of that session whether NVIDIA or AMD before coding (he was unsure)
  - NVIDIA: `pip install pynvml` then `pynvml.nvmlDeviceGetUtilizationRates(handle).gpu`
  - AMD: use WMI (`pip install wmi`) — more complex

### GitHub last pushed card (bottom-right of 2x2 grid)
- Source: `/api/github-activity` — GitHub public events API, cached 5 min in Redis
- Shows: Github icon | GitBranch icon, "pushed {repo}" and relative time
- Skips `zaccesss/zaccesss` profile README repo

---

## Mac daemon — scripts/mac-daemon.py

Runs on Mac via launchd. Writes every 30 seconds. Weather refreshes every 10 cycles (~5 min).

What it writes to Redis (both `macbook:status` and `macbook:last-known`):
```json
{
  "battery": 82,
  "charging": false,
  "timestamp": "2026-05-19T15:40:00Z",
  "device": "Isaacs MacBook Air",
  "country_code": "GB",
  "timezone": "Europe/London",
  "weather_condition": "Overcast",
  "weather_emoji": "☁️",
  "temp_c": 15
}
```

Location: `ipinfo.io/json` — returns city (for coordinates only, never stored), country_code, timezone
Weather: `open-meteo.com/v1/forecast` — WMO weather codes mapped to condition + emoji
City coordinates used ONLY for accurate weather. City name never written to Redis.

Dependencies: `psutil`, `requests` — installed in `~/macdaemon-venv`
Launchd plist: `~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist`
Logs: `/tmp/macdaemon.log`
To restart: `launchctl unload ~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist && launchctl load ~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist`

---

## Windows daemons — NOT YET BUILT (next task)

### Build order: Lenovo FIRST, then Gaming PC

Lenovo is straightforward (same as Mac). Do Lenovo completely — daemon, API route,
component wiring, tested on live site — before touching Gaming PC.

---

### Lenovo daemon (laptop — build first)

Structure is identical to mac-daemon.py with these differences:
- No weather or location logic — weather stays Mac only (Lenovo doesn't need it)
- `psutil.sensors_battery()` works on Windows for battery
- Write to `lenovo:status` (TTL 600s) and `lenovo:last-known` (no TTL)
- Payload structure:
```json
{
  "battery": 74,
  "charging": true,
  "timestamp": "2026-05-19T15:40:00Z",
  "device": "LENOVO-HOSTNAME"
}
```
- Use `socket.gethostname()` for device name
- NSSM for auto-start (see below)

Portfolio changes needed:
1. New API route `/api/lenovo` — same structure as `/api/macbook` but reads `lenovo:status`/`lenovo:last-known`, no weather fields
2. Update `LiveStatusCards.tsx`:
   - Add `LenovoData` interface: `{ battery: number|null, charging: boolean|null, lastSeen: string|null, device: string|null }`
   - Add `lenovo` state
   - Add fetch effect for `/api/lenovo` polling every 60s
   - Wire Lenovo card to show actual data with same blue/grey online logic as MacBook

---

### Gaming PC daemon (desktop — build second)

- No battery
- CPU: `psutil.cpu_percent(interval=1)`
- GPU: ask Isaac whether NVIDIA or AMD at start of that session
- Game detection: scan `psutil.process_iter(['name'])` against known executables
- Write to `gpc:status` (TTL 600s) and `gpc:last-known` (no TTL)
- Payload structure:
```json
{
  "timestamp": "2026-05-19T15:40:00Z",
  "device": "ZACCESS-GPC",
  "cpu_percent": 34,
  "gpu_percent": 67,
  "game": "Fortnite"
}
```

Game executable detection list:
```python
KNOWN_GAMES = {
    "Fortnite":        "FortniteClient-Win64-Shipping.exe",
    "Minecraft":       "javaw.exe",
    "GTA V":           "GTA5.exe",
    "GTA VI":          "GTAVI.exe",
    "FC 26":           "FC26.exe",
    "FC 27":           "FC27.exe",
    "Call of Duty":    "cod.exe",
    "Apex Legends":    "r5apex.exe",
    "Rocket League":   "RocketLeague.exe",
    "Overwatch 2":     "Overwatch.exe",
}
```

Portfolio changes needed:
1. New API route `/api/gpc`
2. Update `LiveStatusCards.tsx`:
   - Add `GpcData` interface: `{ cpu: number|null, gpu: number|null, game: string|null, lastSeen: string|null, device: string|null }`
   - Add `gpc` state
   - Add fetch effect for `/api/gpc` polling every 30s (CPU changes faster than battery)
   - Gaming PC card: last seen + CPU% + GPU% (if available) + game name if detected

---

### Auto-start on Windows — use NSSM

NSSM (Non-Sucking Service Manager) wraps the Python script as a proper Windows service
with auto-restart on crash. This is the equivalent of launchd on Mac. Do NOT use Task Scheduler.

Download from nssm.cc. Install as:
```
nssm install LenovoDaemon "C:\path\to\python.exe" "C:\path\to\lenovo-daemon.py"
nssm set LenovoDaemon AppEnvironmentExtra UPSTASH_REDIS_REST_URL=https://... UPSTASH_REDIS_REST_TOKEN=...
nssm start LenovoDaemon
```

Python must be installed on Windows. Check with `py --version` or `python --version`.
Install deps: `pip install psutil requests`

---

## File structure relevant to live status

```
app/
  api/
    macbook/route.ts         — reads macbook Redis keys
    spotify/route.ts         — Spotify now-playing with episode + device support
    github-activity/route.ts — last push event
    lenovo/route.ts          — TO BUILD
    gpc/route.ts             — TO BUILD
components/
  shared/
    LiveStatusCards.tsx      — single component, used on /notes /home /lab
scripts/
  mac-daemon.py              — Mac battery + weather daemon (done)
  lenovo-daemon.py           — TO BUILD (Windows)
  gpc-daemon.py              — TO BUILD (Windows)
  spotify-auth.mjs           — one-time OAuth helper for Spotify refresh token
~/Library/LaunchAgents/
  me.isaacadjei.macdaemon.plist — launchd config, contains Upstash credentials
```

---

## CHANGELOG rules

- Always update CHANGELOG.md before committing
- Add entries under `[Unreleased]` with correct headings: Added / Changed / Fixed / Removed
- No em dashes, no Oxford comma
- Current version: v2.2.0 released 2026-05-18. Everything merged after that is unreleased.

---

## Things NOT to do

- Do not create .env.local — Isaac keeps all secrets on Vercel
- Do not use em dashes or en dashes anywhere — not in code, not in commits, not in responses
- Do not add Oxford commas
- Do not replace the Github lucide icon — intentionally kept despite deprecation hint
- Do not hardcode city names in the weather/time card — privacy, country only, always
- Do not show Spotify data in the Gaming PC or Lenovo device cards
- Do not commit directly to main
- Do not push without a PR
- Do not ask about things already answered in this file
- Do not add error handling for scenarios that cannot happen
- Do not wrap simple things in abstractions not required by the task

---

## Memory files in this folder

- `AGENT_PROMPT.md` — this file, full instructions
- `MEMORY.md` — index of all memory files
- `feedback_commit_style.md` — commit and writing style rules
- `feedback_writing_style.md` — response style rules
- `project_live_status_widgets.md` — widget system state and next steps

Delete this entire memory folder when the Windows daemons are fully built, tested on the
live site and merged to main.
