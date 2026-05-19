# Session Log

---

## 2026-05-19 - Lenovo daemon, API route and live card

### What we did
- Pulled from GitHub - picked up all Mac session work (weather card, Spotify card, MacBook card, mac-daemon.py, AGENT_PROMPT.md, memory folder)
- Checked Python on Lenovo (3.14.2) and installed psutil
- Wrote `scripts/lenovo-daemon.py` - writes battery, charging, timestamp and hostname to Redis every 30s
- Wrote `app/api/lenovo/route.ts` - reads `lenovo:status` (live) with `lenovo:last-known` fallback
- Wired up Lenovo card in `components/shared/LiveStatusCards.tsx` - added `LenovoData` interface, `lenovo` state, fetch effect (60s poll), replaced static placeholder card with live card matching MacBook card style
- Tested daemon manually - confirmed 200 responses, battery reading and charging state updating in real time (device reported as ZACCESS-LNV)
- Set up NSSM to run daemon as a Windows service so it auto-starts on boot
- Updated CHANGELOG.md

### Decisions made
- No weather or location in Lenovo daemon - Mac only, keeps the daemon simple
- Device name comes from `socket.gethostname()` - no manual config needed
- NSSM used for auto-start, not Task Scheduler - NSSM auto-restarts on crash like launchd does on Mac
- Env vars (Redis URL and token) set in NSSM service config, not in any file

### Problems and fixes
- problem: NSSM service stuck in SERVICE_PAUSED after failed first install attempt (ran without admin, service got created in broken state)
  fix attempted: nssm restart, sc.exe stop/start, nssm remove + reinstall - all failed because Windows marks the service for deletion but won't fully remove it until all handles are closed
  fix: restart laptop to clear the service handle, then reinstall cleanly

- problem: SERVICE_PAUSED persisted even after clean reinstall with full Python path
  root cause 1: psutil and requests were installed as user packages (C:\Users\zac\AppData\Roaming\Python\...) but the NSSM service runs as LocalSystem which cannot see user site-packages
  root cause 2: passing two env vars as separate `nssm set AppEnvironmentExtra` calls overwrites the first - only the last one is kept
  fix 1: install both packages to system site-packages: `& "C:\Program Files\Python314\python.exe" -m pip install psutil requests --target "C:\Program Files\Python314\Lib\site-packages"`
  fix 2: pass both env vars in a single nssm set call: `nssm set LenovoDaemon AppEnvironmentExtra "VAR1=val1" "VAR2=val2"`

- problem: SERVICE_PAUSED is misleading - it does NOT mean the service is paused, it means the process crashed and NSSM is throttling before restart
  fix: always check the error log first: `nssm set LenovoDaemon AppStdout C:\lenovo-daemon.log` + `nssm set LenovoDaemon AppStderr C:\lenovo-daemon-err.log`, then `Get-Content C:\lenovo-daemon-err.log`

- problem: `nssm install LenovoDaemon python ...` used "python" instead of full path - works in user shell but LocalSystem service cannot resolve "python" from PATH
  fix: always use full path: `nssm install LenovoDaemon "C:\Program Files\Python314\python.exe" scripts\lenovo-daemon.py`

### Files changed
- `scripts/lenovo-daemon.py`: new file - Lenovo Windows daemon
- `app/api/lenovo/route.ts`: new file - API route for Lenovo card
- `components/shared/LiveStatusCards.tsx`: added LenovoData interface, lenovo state, fetch effect, replaced placeholder Lenovo card with live card
- `CHANGELOG.md`: added Lenovo entries under [Unreleased]
- `memory/LOG.md`: created this file
- `memory/AGENT_PROMPT.md`: updated to mark Lenovo daemon as done, updated session state

### Next session
- Gaming PC daemon (ZACCESS-GPC)
  - Confirm NVIDIA or AMD GPU before writing any GPU code
  - CPU%, game detection via process scan
  - `app/api/gpc/route.ts`
  - Wire up Gaming PC card in LiveStatusCards.tsx
- After Gaming PC: planned features (Hall of Fame, /consumed, /now, blog reactions, dark/light crossfade, full site search)

---

## 2026-05-19 - Stale charging fix and Gaming PC card restructure

### What we did
- Fixed the frozen "charging" status bug on MacBook and Lenovo cards
- Added `isStale(ts)` helper in `LiveStatusCards.tsx` - returns true if `lastSeen` is >5 minutes ago
- MacBook and Lenovo cards now only show `BatteryCharging` icon and "charging" text if `!isStale(lastSeen)` - otherwise fall back to plain Battery icon + percentage only
- Added `GamingPCData` interface with fields for `online`, `lastSeen`, `gpu`, `cpu`, `currentGame`, `device`
- Replaced hardcoded Gaming PC placeholder with a proper component that reads from `gamingPC` state - when offline only shows last-seen, GPU/CPU/game are live-only and hidden when offline
- Updated `memory/AGENT_PROMPT.md` with stale charging rule and Gaming PC offline rule
- Updated `CHANGELOG.md` with Fixed and Changed entries

### Decisions made
- 15 minutes threshold for stale charging: daemon sends every 30s, frontend polls every 60s. 10 minutes initially considered but 15 chosen to avoid false-positives on brief network hiccups or very short sleeps
- Sleep mode: when device sleeps (suspend to RAM), daemon stops running - indistinguishable from off. Sleep <15 min: charging still shows. Sleep >15 min: charging hides. On wake, daemon resumes and charging reappears within 60s. This is the correct and expected behaviour.
- Gaming PC state: hardcoded to `online: false, lastSeen: null` until the GPC daemon is built - the card safely shows "offline" / "daemon not set up" with no data fields

### Files changed
- `components/shared/LiveStatusCards.tsx`: added `isStale()` helper, `GamingPCData` interface, `gamingPC` state, stale-charging guard on MacBook and Lenovo battery display, restructured Gaming PC card
- `CHANGELOG.md`: added Fixed and Changed entries under [Unreleased]
- `memory/AGENT_PROMPT.md`: documented stale charging rule for MacBook and Lenovo, documented Gaming PC offline rule

### Next session
- Gaming PC daemon (ZACCESS-GPC)
  - Confirm NVIDIA or AMD GPU before writing any GPU code
  - CPU%, game detection via process scan
  - `app/api/gpc/route.ts`
  - Wire up Gaming PC card - fetch from `/api/gpc`, set `gamingPC` state (the interface and card are already built)
- After Gaming PC: planned features (Hall of Fame, /consumed, /now, blog reactions, dark/light crossfade, full site search)

---

## 2026-05-19 - Gaming PC daemon and card

### What we did
- Confirmed GPU: NVIDIA GeForce RTX 4060 (user showed Task Manager screenshot)
- Wrote `scripts/gpc-daemon.py` - writes CPU%, GPU% (via pynvml), active game name and timestamp to `gpc:status` (TTL 600s) and `gpc:last-known` every 30s; detects games by scanning Windows processes against KNOWN_GAMES dict (lowercase comparison for case-insensitive matching)
- Wrote `app/api/gpc/route.ts` - reads live/last-known fallback; `online` is true if `gpc:status` key exists (within 600s TTL); CPU, GPU and game fields are null when offline so card never shows stale stats
- Wired up Gaming PC card in `components/shared/LiveStatusCards.tsx` - replaced hardcoded `const [gamingPC]` with proper `setGamingPC` state + fetch effect polling every 30s; formats cpu/gpu as "42%" strings
- Updated CHANGELOG.md under [Unreleased]
- PR #124 merged to main via auto-merge

### Decisions made
- pynvml for GPU: NVIDIA confirmed, pynvml is the lightest approach - just `nvmlDeviceGetUtilizationRates(handle).gpu` returns integer percent
- pynvml initialised at module load with fallback if not available - daemon still runs and writes CPU/game even if pynvml fails (GPU will be null)
- `online` flag derived from TTL key presence not timestamp comparison - Redis does the stale check, API just returns what it sees
- Offline rule: API returns null for cpu/gpu/game when `online: false` - enforced at API layer, not just UI, so nothing leaks stale stats even if the card logic changes later
- Poll interval: 30s for Gaming PC (same as daemon write interval) vs 60s for Lenovo/MacBook

### Problems and fixes
- none - clean build, TypeScript strict mode passed with no errors

### Files changed
- `scripts/gpc-daemon.py`: new file - Gaming PC Windows daemon
- `app/api/gpc/route.ts`: new file - API route for Gaming PC card
- `components/shared/LiveStatusCards.tsx`: replaced const gamingPC with setGamingPC, added fetch effect polling /api/gpc every 30s
- `CHANGELOG.md`: added Gaming PC entries under [Unreleased]
- `memory/LOG.md`: this entry

### Follow-up fixes (same session)
- PR #125: combined CPU and GPU onto one line ("CPU: x% | GPU: y%") - Gaming PC card was expanding taller than other cards
- PR #126: improved separator and icon visibility - switched from muted-foreground opacity to foreground-based opacity so elements are darker in light mode and lighter in dark mode; applied to both the CPU/GPU separator and the Github/GitBranch icons in the GitHub card

### Next session
- After daemon is live: planned features
  - Hall of Fame reframe (God, mum, dad lead - then security researchers)
  - /consumed page (monthly content log)
  - /now page (static, what Isaac is doing in life)
  - Blog reactions (ThumbsUp, Flame, Lightbulb, Heart via lucide-react, Redis per slug per type)
  - Dark/light mode crossfade (~150ms CSS transition)
  - Full site search in Cmd+I command menu (projects, notes, blog posts)


---

## 2026-05-20 - /consumed page, /now page, CSP embed fix

### What we did
- Fixed broken YouTube and Spotify embeds on /consumed: root cause was CSP `frame-src` only allowed Cloudflare; added `https://www.youtube.com` and `https://open.spotify.com` to `frame-src` in `next.config.mjs`
- Built `/consumed` page from scratch: `app/consumed/page.tsx` and `app/consumed/ConsumedContent.tsx`
  - 49 YouTube videos with real upload dates (fetched from YouTube page HTML JSON-LD using Chrome User-Agent, batches of 8)
  - 12 Spotify podcasts with real publish dates (fetched from Spotify episode pages using Googlebot User-Agent for server-side rendered HTML)
  - 10 books, 2 per month
  - All content sorted oldest to newest by real upload/publish date; oldest = January, newest = May; spread equally (videos: Jan 10 / Feb 10 / Mar 10 / Apr 10 / May 9, podcasts: Jan 2 / Feb 2 / Mar 3 / Apr 3 / May 2, books: 2 per month)
  - "All" tab as first tab with LayoutList icon - shows all content grouped by month, January first, with count badge per month
  - Click-to-play facade on video embeds - thumbnail shown by default, iframe only injected on click; keeps page fast with 49 embeds
  - Spotify embeds in Podcasts tab only; compact link cards in All tab
  - Month chips colour-coded: January blue, February violet, March emerald, April amber, May rose
  - Stats line ("49 videos · 12 podcasts · 10 books") removed from header
  - VideoCard: no "uploaded [date]" chip shown; month chip + one content tag only
  - No podcast dates displayed anywhere (fetched for ordering accuracy only)
  - Music section with Link to /notes page Spotify widget
  - Description text: "Everything I have watched, listened to and read so far this year."
- Confirmed /now page, /uses page, /colophon page, /changelog page, blog reactions, dark/light crossfade, post series grouping, Hall of Fame reframe and command menu improvements were all built in prior sessions (all marked done in todo list)
- Updated CHANGELOG.md root with all Unreleased entries including items missing from previous sessions
- Updated app/changelog/page.tsx with /consumed and CSP fix entries
- Updated README.md: overview sentence and Pages table now include /consumed, /now, /uses, /colophon, /changelog
- Updated memory/AGENT_PROMPT.md: marked /consumed and /now as DONE, added private dashboard planned feature, updated current version, added Beehiiv website styling task
- Updated memory/MEMORY.md and created memory/project_private_dashboard.md

### Decisions made
- Month = consumed date, not upload date. Old content (2015 video) in January 2026 is correct because Isaac consumed it in January 2026.
- Real upload dates required so content cannot be shown as consumed before it was uploaded (e.g. a video uploaded April 2026 cannot be shown as consumed in January 2026).
- YouTube upload dates extracted from JSON-LD (`uploadDate` field) in raw page HTML using Chrome User-Agent - YouTube oEmbed does not include this field.
- Spotify publish dates extracted from JSON-LD (`datePublished` field) using Googlebot User-Agent on full episode page - Spotify embed page is JS-rendered and too short; standard oEmbed has no date.
- Oldest-first sort satisfies the consumed >= uploaded constraint naturally: 2015-2023 content in January is always valid.
- Podcast dates not displayed in UI - user did not want them shown; kept in data as comments for ordering accuracy only.
- VideoCard shows only month chip + 1 content tag - no upload date chip - cleaner and less cluttered.
- "All" tab uses compact podcast cards (link only) not embedded Spotify players - keeps the tab usable without 12 iframes loading at once.

### Problems and fixes
- problem: YouTube/Spotify embeds showed "This content is blocked" in all browsers
  root cause: `frame-src` in CSP (`next.config.mjs`) only allowed `https://challenges.cloudflare.com`
  fix: added `https://www.youtube.com` and `https://open.spotify.com` to `frame-src`

- problem: YouTube upload dates not available from oEmbed API
  fix: fetched raw YouTube watch page HTML with Chrome User-Agent; extracted `"uploadDate":"..."` from JSON-LD structured data in the HTML

- problem: Spotify episode publish dates not available from oEmbed or embed page (JS-rendered, too short)
  fix: used Googlebot/2.1 User-Agent on full Spotify episode page which returns server-rendered HTML with `datePublished` JSON-LD

- problem: original month assignments were wrong - videos ordered by the order Isaac sent URLs, not by upload date; a video uploaded April 2026 had been assigned January
  fix: sorted all 49 videos oldest to newest by upload date, reassigned months in order (oldest 10 = January etc.)

### Files changed
- `next.config.mjs`: added YouTube and Spotify to `frame-src`
- `app/consumed/page.tsx`: new file - page metadata and wrapper
- `app/consumed/ConsumedContent.tsx`: new file - full /consumed page implementation (videos, podcasts, books, All tab, month tabs, VideoCard, click-to-play, music section)
- `CHANGELOG.md`: fully updated [Unreleased] section with all missing entries from prior sessions plus /consumed and CSP fix
- `app/changelog/page.tsx`: added /consumed, /now and CSP fix entries to Unreleased releases array
- `README.md`: updated overview sentence and Pages table to include /consumed, /now, /uses, /colophon, /changelog
- `memory/LOG.md`: this entry
- `memory/AGENT_PROMPT.md`: updated planned features, added private dashboard section and Beehiiv task
- `memory/MEMORY.md`: added private dashboard memory pointer
- `memory/project_private_dashboard.md`: new file - full private dashboard spec for future session

### Next session
- Private dashboard (dedicated session needed):
  - NextAuth.js + GitHub OAuth, restrict to Isaac's GitHub account only
  - Supabase for persistent storage
  - Three sections: Goals tracker, Module tracker, Internship tracker
  - Protected route at `/dashboard` or `/private`
  - See memory/project_private_dashboard.md for full spec
- Beehiiv newsletter website styling:
  - Isaac wants his Beehiiv publication page to match the portfolio aesthetic
  - Needs custom CSS/branding on the Beehiiv hosted page
  - Help needed with Beehiiv's custom design editor - do this in a dedicated session
