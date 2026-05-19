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

- Write comments in first person: "I use the player endpoint here because..." not "Uses the player endpoint"
- Add comments where the WHY is non-obvious — a hidden constraint, a subtle invariant, a workaround, behaviour that would surprise a reader
- Be detailed in comments where the reasoning is complex or the decision was deliberate
- Do not comment on WHAT the code does if the code is self-explanatory
- No multi-line block comments for simple things. One well-written line is almost always enough.
- No auto-generated docstrings. Only write a docstring if the function has a non-obvious contract.

---

## MANDATORY SESSION RULES — do these every session without being asked

### At the start of every session
1. Read this file (`memory/AGENT_PROMPT.md`)
2. Read `memory/LOG.md` if it exists — understand what was done before
3. Run `npm run dev` in the background so changes are visible at http://localhost:3000 throughout the session
4. Note: no `.env.local` exists and none should be created. All secrets live on Vercel only. Local dev will show null/fallback for any Redis or API data — this is expected and fine. Always test real data behaviour on the live site after deploy.

### During every session
5. Update `memory/LOG.md` continuously — log every decision, change, problem faced, how it was fixed, code written and why. Be detailed. This is the permanent project diary.

### At the end of every session
6. Make sure `memory/LOG.md` is fully updated before Isaac leaves
7. Commit and push any uncommitted LOG.md or AGENT_PROMPT.md changes

### LOG.md format — use this structure for every session entry
```markdown
## [YYYY-MM-DD] — [brief topic]

### What we did
- bullet list of everything done

### Decisions made
- decision: reasoning behind it

### Problems and fixes
- problem: what went wrong
  fix: what we did and why

### Files changed
- file path: what changed and why

### Next session
- carry-forward tasks
```

---

## Project overview

Personal portfolio website: **isaacadjei.me**
Repo: `https://github.com/zaccesss/isaac-adjei-portfolio`
Local path on Mac: `/Users/isaacadjei/dev/github/repos/isaac-adjei-portfolio`
Framework: Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
Deployment: Vercel (auto-deploys on push to main)
DNS: Cloudflare
Database/cache: Upstash Redis

`.env.local` is gitignored and never committed. Isaac gets credentials from upstash.com
directly each session. Never store real credentials in any file that is committed to GitHub.

---

## Absolute workflow rules — never deviate

1. Always branch from latest main: `git checkout main && git pull`
2. Update CHANGELOG.md under `[Unreleased]` BEFORE committing
3. Branch naming: `feat/description`, `fix/description`, `chore/description`, `content/description`
4. Commit message rules: use `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` — no em/en dashes, no Oxford comma, no AI attribution lines
5. Push branch, create PR and enable auto-merge:
   ```
   git push -u origin branch-name
   gh pr create --title "..." --body "..."
   gh pr merge --squash --delete-branch --auto
   ```
6. CI (Lint and Build) takes ~2 minutes. Wait for it to pass.
7. After merge: `git checkout main && git pull && git branch -d branch-name && git remote prune origin`
8. Never commit directly to main. Never force push. Never skip hooks.

---

## Code rules

- TypeScript strict mode — no `any`, no untyped variables
- No unused imports — CI fails on lint errors
- Tailwind only for styles. Exception: genuinely dynamic values like `style={{ width: \`${pct}%\` }}` which cannot be static
- The `Github` icon from lucide-react is deprecated but intentionally kept — do not replace it
- `react-hooks/set-state-in-effect` — never call setState synchronously at the top level of a useEffect body. Use `setTimeout(..., 0)` to defer, or put it inside an interval/async callback
- All API routes return `{ headers: { "Cache-Control": "no-store" } }`
- Redis key pattern: `resource:type` e.g. `macbook:status`, `spotify:last_played`

---

## Live status widget system — full state as of 2026-05-19 (updated)

### Layout (component: components/shared/LiveStatusCards.tsx, used on /notes /home /lab)

```
[Weather + Time — full width]
[Spotify — full width]
[MacBook]  [Lenovo]
[Gaming PC] [GitHub last pushed]
```

### Weather + Time card
- Country name via `Intl.DisplayNames` from `country_code` written by Mac daemon
- NEVER shows city — Isaac does not want strangers knowing his location. Country only, always.
- Clock timezone is dynamic from daemon — auto-switches when travelling (e.g. Ghana shows Ghana time)
- Weather (emoji + condition + temp) hidden until daemon has written real data — no placeholder dashes
- Falls back to `macbook:last-known` (no TTL) so data persists when Mac is off

### Spotify card
- Uses `/me/player` — supports tracks and podcast episodes via `currently_playing_type`
- Label: "Currently Listening on {device name}" — real Spotify device name
- Progress bar ticks every second client-side, polls API every 10 seconds
- Last played fallback from `spotify:last_played` Redis key — greyed out, grayscale artwork
- Spotify activity in Spotify card ONLY. Device cards never show Spotify data.

### MacBook card (top-left)
- `macbook:status` (TTL 600s) with fallback to `macbook:last-known` (no TTL)
- Last seen, battery %, charging state. Blue if online (<5 min), grey otherwise.
- **Stale charging rule**: if `lastSeen` is >5 minutes ago, do NOT show the BatteryCharging icon or "charging" text - show plain Battery icon and just the percentage. This prevents "charging" freezing forever when the device shuts down while charging. When the daemon sends its next ping, charging reappears within 60s. Sleep <5 min is not affected.

### Lenovo card (top-right)
- DONE — live card showing last seen, battery %, charging state. Blue if online (<5 min), grey otherwise.
- Device name: ZACCESS-LNV (from hostname)
- Redis keys: `lenovo:status` (TTL 600s), `lenovo:last-known` (no TTL)
- API route: `app/api/lenovo/route.ts`
- Daemon: `scripts/lenovo-daemon.py` running as Windows service via NSSM
- **Stale charging rule**: same as MacBook - if `lastSeen` >5 minutes ago, hide charging state, show last battery % only.

### Gaming PC card (bottom-left)
- Currently: offline placeholder, "daemon not set up"
- Target: last seen + CPU% + active game name (if detected)
- **Offline rule**: when `online` is false (lastSeen stale or null), show ONLY last seen time. Do NOT show GPU%, CPU% or current game - those are live-only fields. This mirrors the shutdown behaviour of device cards.
- No battery. No Spotify data.
- Redis keys: `gpc:status` (TTL 600s), `gpc:last-known` (no TTL)
- New API route needed: `app/api/gpc/route.ts`
- GPU: ask Isaac whether NVIDIA or AMD at the start of that session before coding

### GitHub card (bottom-right)
- `Github` icon | `GitBranch` icon — "pushed {repo}" + relative time
- Cached in Redis 5 min. Skips `zaccesss/zaccesss` profile repo.

---

## Mac daemon — scripts/mac-daemon.py

- Runs via launchd plist: `~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist`
- Writes every 30s to `macbook:status` (TTL 600s) and `macbook:last-known` (no TTL)
- Weather via open-meteo, location via ipinfo.io — refreshes every 10 cycles (~5 min)
- City coordinates used for weather accuracy only — city name never written to Redis
- Dependencies in `~/macdaemon-venv` (psutil, requests)
- Logs to `/tmp/macdaemon.log`
- To restart: `launchctl unload ~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist && launchctl load ~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist`

---

## Windows daemons — NOT YET BUILT

### Build order: Lenovo first, Gaming PC second

---

### Windows NSSM daemon gotchas — learned from Lenovo session, apply to Gaming PC too

- ALWAYS use full Python path in nssm install: `nssm install ServiceName "C:\Program Files\Python314\python.exe" scripts\script.py`
  - "python" resolves in user shell but NOT for LocalSystem service
- ALWAYS install pip packages to system site-packages for services: `& "C:\Program Files\Python314\python.exe" -m pip install psutil requests --target "C:\Program Files\Python314\Lib\site-packages"`
  - User installs (C:\Users\zac\AppData\Roaming\Python\...) are invisible to LocalSystem
- ALWAYS set multiple env vars in ONE nssm call: `nssm set ServiceName AppEnvironmentExtra "VAR1=val1" "VAR2=val2"`
  - Two separate calls overwrite each other - only the last one is kept
- SERVICE_PAUSED means the process CRASHED, not that it is paused - always check the log
- Set up logging before starting: `nssm set ServiceName AppStdout C:\service.log` + `nssm set ServiceName AppStderr C:\service-err.log`
- If service is stuck in deletion loop after remove, close all PowerShell windows and reopen (or reboot)
- Run all nssm commands in admin PowerShell - non-admin silently fails or gives access denied

---

### Lenovo daemon (build first — straightforward, same as Mac)

- Battery via `psutil.sensors_battery()` — works on Windows
- No weather or location — Mac only
- Writes to `lenovo:status` and `lenovo:last-known`
- Payload: `{ battery, charging, timestamp, device }`
- Auto-start: NSSM (nssm.cc) — NOT Task Scheduler. NSSM auto-restarts on crash like launchd.
- Check Python first: `py --version`
- Install deps: `pip install psutil requests`

Portfolio changes for Lenovo:
1. `app/api/lenovo/route.ts` — same structure as macbook route, no weather fields
2. `LiveStatusCards.tsx` — add `LenovoData` interface, `lenovo` state, fetch effect, wire card

---

### Gaming PC daemon (build second)

- No battery
- CPU: `psutil.cpu_percent(interval=1)`
- GPU: ask Isaac NVIDIA or AMD before writing any GPU code
- Game detection: scan `psutil.process_iter(['name'])` against:
```python
KNOWN_GAMES = {
    "Fortnite":      "FortniteClient-Win64-Shipping.exe",
    "Minecraft":     "javaw.exe",
    "GTA V":         "GTA5.exe",
    "GTA VI":        "GTAVI.exe",
    "FC 26":         "FC26.exe",
    "FC 27":         "FC27.exe",
    "Call of Duty":  "cod.exe",
    "Apex Legends":  "r5apex.exe",
    "Rocket League": "RocketLeague.exe",
    "Overwatch 2":   "Overwatch.exe",
}
```
- Writes to `gpc:status` and `gpc:last-known`
- Payload: `{ timestamp, device, cpu_percent, gpu_percent, game }`
- Auto-start: NSSM

Portfolio changes for Gaming PC:
1. `app/api/gpc/route.ts`
2. `LiveStatusCards.tsx` — add `GpcData` interface, `gpc` state, fetch effect (poll every 30s), wire card

---

## Planned features — not yet built (build after Windows daemons)

### Hall of Fame — personal dedication
- Reframe existing `/hall-of-fame` page as acknowledgements
- Lead with God, mum and dad — then security researchers section below
- Keep security section, it exists for a reason

### `/consumed` — content log
- Monthly log of books, YouTube videos, podcasts and articles
- Organised by month: "May 2026", "June 2026" etc.
- Each entry links to the actual content
- Lives at `/consumed` — fits the public notebook theme

### `/now` page
- Single page: what is Isaac doing right now in life?
- Current year at uni, active projects, what he is reading and listening to
- Updated manually every few weeks. Simple static page, no API.

### Blog post reactions
- Reaction buttons at the bottom of each full blog post only (not on listing cards)
- Use lucide-react icons NOT emoji — emoji renders badly on Windows
  Icons: ThumbsUp, Flame, Lightbulb, Heart
- Count per reaction stored in Redis: `reactions:{slug}:{type}`
- One click, no typing, no moderation
- No comments — reactions only

### Dark/light mode crossfade animation
- ~150ms smooth crossfade on theme toggle instead of instant swap
- CSS transition on background-color and color on the root element

### Full site search in command menu
- Extend existing `Cmd+I` command menu to search projects, notes content and blog posts
- Currently only searches nav links and blog titles
- All data is static/build-time — index at build time, no runtime API needed
- Results grouped by type: Pages, Posts, Projects

---

## CHANGELOG rules

- Always update before committing
- Entries under `[Unreleased]`: Added / Changed / Fixed / Removed
- No em dashes, no Oxford comma
- Current version: v2.2.0 — 2026-05-18

---

## Memory folder rules

- Do NOT delete the memory folder — it is permanent
- LOG.md must be updated every session
- AGENT_PROMPT.md must be updated when major decisions are made or features are planned
- All memory files are committed to GitHub

---

## Things NOT to do

- Do not store credentials in any committed file — Redis URL comes from Isaac via Upstash each session
- Do not use em dashes or en dashes anywhere
- Do not add Oxford commas
- Do not replace the Github lucide icon
- Do not show city in the weather card — country only, always
- Do not show Spotify data in device cards
- Do not commit directly to main
- Do not push without a PR
- Do not ask about things already answered in this file
- Do not add error handling for impossible scenarios
- Do not over-abstract — three similar lines beats a premature abstraction
- Do not skip `.env.local` setup at session start
- Do not skip `npm run dev` at session start
- Do not skip updating LOG.md
