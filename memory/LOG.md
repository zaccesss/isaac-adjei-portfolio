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
- 5 minutes threshold for stale charging: daemon sends every 30s so if the device is off or asleep, updates stop immediately. 5 minutes is enough buffer for a brief network hiccup without letting "charging" freeze for long.
- Sleep mode: when device sleeps (suspend to RAM), daemon stops running - indistinguishable from off. Sleep <5 min: charging still shows. Sleep >5 min: charging hides. On wake, daemon resumes and charging reappears within 60s. This is the correct and expected behaviour.
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
