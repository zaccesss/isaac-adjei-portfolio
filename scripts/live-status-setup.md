# Live Status - Device Daemons and PS5 Worker

This is the full setup and reference for everything behind the live status cards on
`/now`, the homepage and `/lab` - the MacBook, Lenovo, Gaming PC and PS5 cards.

## How it all works

Each device runs a tiny agent that writes its current state to one shared Upstash Redis
database every minute or two. The site never talks to my devices directly - it only reads
Redis:

```
device agent ──► Upstash Redis ──► Next.js API route ──► LiveStatusCards (/now, homepage, /lab)
```

- **Writes** come from a per-device agent (a Python daemon on my machines, a Cloudflare
  Worker for the PS5).
- **Reads** go through Next.js routes. The combined `/api/live-status` snapshot reads every
  device in one Redis call and is edge-cached for ~15s, so every open tab in a region shares
  a single origin read no matter how many people are watching. `/api/spotify` is cached
  separately for near-realtime track changes.
- **Online vs offline** is a TTL trick: each agent writes a short-lived `*:status` key and a
  permanent `*:last-known` key. While the agent is running, `*:status` exists and the card is
  "online now". When the device sleeps or the agent stops, `*:status` expires and the card
  falls back to `*:last-known` ("last seen X ago"). Game-capable devices also write a
  `*:last-game` key so the last title played is preserved while offline rather than being
  wiped by an idle home-screen poll.

### The agents at a glance

| Device | Runs on | Agent | Service manager | Writes | Cadence |
| --- | --- | --- | --- | --- | --- |
| MacBook | macOS | `scripts/mac-daemon.py` | launchd | battery, weather, country, timezone | 120s |
| Lenovo | Windows | `scripts/lenovo-daemon.py` | NSSM | battery | 120s |
| Gaming PC | Windows | `scripts/gpc-daemon.py` | NSSM | CPU, GPU, current game, art | 60s |
| PS5 | Cloudflare edge | `workers/ps5-presence` | Cloudflare Cron | online status, current game, art | 2 min |

### Redis keys

| Key | TTL | Written when | Read by |
| --- | --- | --- | --- |
| `macbook:status` | 600s | every write | `/api/macbook`, `/api/live-status` |
| `macbook:last-known` | none | every write | same |
| `lenovo:status` | 600s | every write | `/api/lenovo`, `/api/live-status` |
| `lenovo:last-known` | none | every write | same |
| `gpc:status` | 600s | every write | `/api/gpc`, `/api/live-status` |
| `gpc:last-known` | none | every write | same |
| `gpc:last-game` | none | only while a game is running | same |
| `ps5:status` | 150s | every write | `/api/ps5`, `/api/live-status` |
| `ps5:last-known` | none | only while online | same |
| `ps5:last-game` | none | only while a game is running | same |

## Shared credentials (every agent)

All agents write to the same Upstash Redis database, so they all need:

| Variable | Where to get it |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash console -> the database -> REST section (or Vercel project env vars) |
| `UPSTASH_REDIS_REST_TOKEN` | same place (the read/write token, not the read-only one) |

Everything else is device-specific and covered below.

---

## 1. Gaming PC (Windows, NSSM) - `gpc-daemon.py`

Writes live CPU%, GPU% (NVIDIA via `pynvml`), the current game and its cover art. It detects
the game through five tiers in priority order, returning the first match:

1. **`KNOWN_GAMES`** - a hardcoded exe map. Instant, no API calls, zero false positives.
2. **Steam Web API** - any Steam game, needs `STEAM_API_KEY` + `STEAM_ID`.
3. **Epic Games** - reads local `.item` manifests, automatic.
4. **EA App** - reads local `installerdata.xml` manifests, automatic.
5. **Fuzzy** - cleans the process name and searches IGDB, with a similarity filter.

The cover image for every detected game is a landscape IGDB artwork (with a Steam header and a
curated image as fallbacks) so the card matches the look of the PS5 card.

### One-time setup (run in an admin PowerShell)

**1. Install Python and dependencies**

```powershell
winget install Python.Python.3
pip install psutil requests pynvml
```

**2. Install NSSM**

```powershell
winget install NSSM.NSSM
```

**3. Register the service**

The service is named `GpcDaemon`. Use the full path to `python.exe` (a Windows service runs
with no user PATH, so a bare `python` will not resolve):

```powershell
nssm install GpcDaemon "C:\Users\<you>\AppData\Local\Programs\Python\Python3xx\python.exe" "C:\path\to\scripts\gpc-daemon.py"
nssm set GpcDaemon AppDirectory "C:\path\to\isaac-adjei-portfolio"
```

**4. Set all env vars in ONE call**

`AppEnvironmentExtra` replaces the whole environment block on each call, so every variable must
go in a single command or earlier ones are wiped:

```powershell
nssm set GpcDaemon AppEnvironmentExtra `
  "UPSTASH_REDIS_REST_URL=https://your-db.upstash.io" `
  "UPSTASH_REDIS_REST_TOKEN=your_token" `
  "IGDB_CLIENT_ID=your_twitch_client_id" `
  "IGDB_CLIENT_SECRET=your_twitch_client_secret" `
  "STEAM_API_KEY=your_steam_api_key" `
  "STEAM_ID=76561198xxxxxxxxx"
```

Only the two `UPSTASH_*` vars are required. The rest are optional but enable Steam detection and
cover art.

**5. Start and check**

```powershell
nssm start GpcDaemon
nssm status GpcDaemon
Get-Content C:\gpc-daemon.log -Tail 20
```

A healthy start logs the banner with `IGDB: enabled` and `Steam API: enabled`, then per-poll
lines like `[hh:mm:ss] cpu=44% gpu=38% game=Fortnite [known] -> 200`.

### Credentials

| Variable | Required | Where to get it |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | yes | Upstash console |
| `IGDB_CLIENT_ID` / `_CLIENT_SECRET` | no (cover art) | Twitch developer console (`dev.twitch.tv/console`), Confidential client - see the IGDB section below |
| `STEAM_API_KEY` | no (Steam detection) | `steamcommunity.com/dev/apikey`, any domain (e.g. `localhost`) |
| `STEAM_ID` | no (Steam detection) | Steam64 ID - if your profile is `/profiles/7656119...` that number is it, otherwise convert your `/id/<name>` URL at `steamid.io` |

> **Steam profiles:** set Steam -> Edit Profile -> Privacy -> "Game details" to **Public**, or the
> Steam API never reports the current game.

### Adding a game

Add the `.exe` to `KNOWN_GAMES` in `gpc-daemon.py`. Add an `IGDB_NAME_MAP` entry only if the
IGDB title differs from the short name (e.g. `"GTA V" -> "Grand Theft Auto V"`). Cover art is
fetched automatically.

---

## 2. MacBook (macOS, launchd) - `mac-daemon.py`

Writes battery level and charging state plus real-time weather, country code and timezone.
Weather and location refresh every 5 cycles (~10 min) to keep API usage low. Only the country
code and timezone are stored - the city name and coordinates never are.

Weather (Open-Meteo) and location (ipinfo) are keyless, so the only credentials are Upstash.
`CoreLocationCLI` is optional and gives GPS-level location plus an exact timezone via the
offline `timezonefinder`; without it the daemon falls back to ipinfo.

### Setup

```bash
brew install corelocationcli              # optional, GPS-level location
pip3 install psutil requests timezonefinder
```

### Run automatically on login (launchd)

Create `~/Library/LaunchAgents/com.zacess.mac-daemon.plist` pointing at your Python and the
script, with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` under
`EnvironmentVariables`, then:

```bash
launchctl load ~/Library/LaunchAgents/com.zacess.mac-daemon.plist   # start
launchctl unload ~/Library/LaunchAgents/com.zacess.mac-daemon.plist # stop
tail -f /tmp/macdaemon.log                                          # logs
```

> launchd runs with a minimal PATH that excludes Homebrew, so the daemon resolves
> `CoreLocationCLI` by absolute path. If you install it somewhere unusual, confirm it is found
> in the `[location] using CoreLocation GPS` log line.

---

## 3. Lenovo (Windows, NSSM) - `lenovo-daemon.py`

The simplest agent: battery level and charging state only, no weather or game detection. Same
NSSM pattern as the Gaming PC but with only the two Upstash variables.

```powershell
pip install psutil requests
nssm install LenovoDaemon "C:\path\to\python.exe" "C:\path\to\scripts\lenovo-daemon.py"
nssm set LenovoDaemon AppDirectory "C:\path\to\isaac-adjei-portfolio"
nssm set LenovoDaemon AppEnvironmentExtra `
  "UPSTASH_REDIS_REST_URL=https://your-db.upstash.io" `
  "UPSTASH_REDIS_REST_TOKEN=your_token"
nssm start LenovoDaemon
```

---

## 4. PS5 (Cloudflare Worker) - `workers/ps5-presence`

The PS5 has no agent of its own, so a Cloudflare Worker polls the PSN API on a cron schedule
(`*/2 * * * *`, every 2 minutes) and writes the same `*:status` / `*:last-known` / `*:last-game`
keys as the device daemons.

### How the PSN auth works

PSN has no public API, so the worker uses Sony's mobile-app OAuth flow:

1. On first run it exchanges my **NPSSO cookie** for an access token plus a refresh token.
2. The refresh token is stored in Cloudflare KV (`psn:refresh_token`).
3. Every later run uses the stored refresh token, so the NPSSO is only needed once - until the
   refresh token eventually expires (~60 days), at which point it falls back to the NPSSO again.

The PSN client ID and secret in the worker are Sony's public Android-app credentials (extracted
from the PSN APK), not personal secrets. The game image prefers an IGDB cover (stable box art)
over PSN's `conceptIconUrl`, which changes with promotions.

> `scripts/ps5-daemon.py` is a legacy version of this that ran on the MacBook via launchd. It is
> superseded by this worker and kept only for reference.

### Deploy

Deployment is automatic: the `deploy-ps5-presence.yml` workflow runs `wrangler deploy` on any
push to `main` that touches `workers/ps5-presence/**` (it was added after a worker fix sat
merged but undeployed for three weeks). To deploy by hand:

```bash
cd workers/ps5-presence
npx wrangler deploy
```

### Secrets

Set on the Worker with `wrangler secret put <NAME>` (the GitHub Action uses
`CLOUDFLARE_API_TOKEN` to deploy):

| Secret | Where to get it |
| --- | --- |
| `PSN_NPSSO` | Log in at `playstation.com`, then DevTools -> Application -> Cookies -> copy `npsso` (64-char). Renew every ~60 days of inactivity |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Upstash console |
| `IGDB_CLIENT_ID` / `_CLIENT_SECRET` | optional, Twitch console (cover art) |

The `PS5_KV` namespace binding (for the refresh token) is configured in `wrangler.toml`.

---

## IGDB credentials (shared by the GPC daemon and PS5 worker)

Both pull cover art from IGDB, which authenticates through Twitch:

1. Go to `dev.twitch.tv/console` -> Register Your Application.
2. Category: Application Integration. OAuth Redirect URL: `http://localhost` (unused by the
   `client_credentials` flow, but a value is required).
3. **Client Type: Confidential** - the flow needs a client that can hold a secret. A Public
   client cannot get a token.
4. Copy the Client ID, generate a Client Secret.

The Client ID can be shared, but generating a new secret invalidates the old one. If the GPC
daemon and PS5 worker share one app, rotating the secret means updating both. To avoid that, a
separate app per consumer is cleaner.

---

## Updating an agent

The service runs whatever copy of the script is on disk at the path it was registered with, so a
plain restart only picks up new code after the file itself is updated:

- **Windows (NSSM):** `git pull` (or copy the script over), then `nssm restart GpcDaemon`
  (or `LenovoDaemon`).
- **macOS (launchd):** `git pull`, then
  `launchctl kickstart -k gui/$(id -u)/com.zacess.mac-daemon`.
- **PS5 worker:** push to `main` - the deploy workflow ships it. No restart concept; the cron
  picks up the new code on its next run.

## Logs

| Agent | Logs |
| --- | --- |
| Gaming PC | `C:\gpc-daemon.log` / `C:\gpc-daemon-err.log` (set via `nssm set GpcDaemon AppStdout/AppStderr`) |
| Lenovo | set `AppStdout` / `AppStderr` the same way, or view in Event Viewer |
| MacBook | `/tmp/macdaemon.log` (the plist `StandardOutPath`) |
| PS5 worker | `npx wrangler tail` from `workers/ps5-presence`, or the Cloudflare dashboard |
