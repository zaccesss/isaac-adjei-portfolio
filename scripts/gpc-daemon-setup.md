# GPC Daemon Setup (Gaming PC - Windows)

The `scripts/gpc-daemon.py` daemon detects which game is running on the Windows GPC,
fetches cover art from IGDB (Twitch API) on first detection and pushes the current
game to Upstash Redis so the PS5 presence widget can display it.

## One-time Setup

Run all steps in an admin PowerShell session.

### 1. Install Python and dependencies

```powershell
winget install Python.Python.3
pip install requests upstash-redis
```

### 2. Install NSSM (Non-Sucking Service Manager)

```powershell
winget install NSSM.NSSM
```

### 3. Register the daemon as a Windows service

```powershell
nssm install gpc-daemon python "C:\path\to\scripts\gpc-daemon.py"
nssm set gpc-daemon AppDirectory "C:\path\to\scripts"
```

### 4. Set all environment variables in ONE call

Two separate `nssm set` calls overwrite each other — put everything in one line:

```powershell
nssm set gpc-daemon AppEnvironmentExtra `
  UPSTASH_REDIS_REST_URL=https://your-db.upstash.io `
  UPSTASH_REDIS_REST_TOKEN=your_token `
  IGDB_CLIENT_ID=your_twitch_client_id `
  IGDB_CLIENT_SECRET=your_twitch_client_secret `
  STEAM_API_KEY=your_steam_api_key `
  STEAM_ID=76561198xxxxxxxxx
```

### 5. Start the service

```powershell
nssm start gpc-daemon
nssm status gpc-daemon
```

## Where to get the credentials

| Var | Source |
|-----|--------|
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Upstash console - same DB as PS5 presence |
| `IGDB_CLIENT_ID` / `_CLIENT_SECRET` | Twitch Developer Console (same app as PS5 Cloudflare Worker - copy from there) |
| `STEAM_API_KEY` | steamcommunity.com/dev/apikey - set domain to "localhost" |
| `STEAM_ID` | steamcommunity.com/id/[username] then convert at steamid.io |

## Creating the Twitch app (if not done yet)

1. Go to dev.twitch.tv/console
2. Register Your Application
3. Category: Application Integration
4. Redirect URL: http://localhost
5. Create, copy Client ID, generate Secret

## Adding more games

Add the `.exe` name to `KNOWN_GAMES` in `scripts/gpc-daemon.py`.
IGDB cover art is fetched automatically.

Add to `IGDB_NAME_MAP` only if the IGDB title differs from your short name,
e.g. `"GTA V" -> "Grand Theft Auto V"`.

## Restarting after env var changes

```powershell
nssm restart gpc-daemon
```

## Applying an updated daemon script

When `scripts/gpc-daemon.py` itself changes - for example the poll interval (now `INTERVAL = 60`)
or a new game added to `KNOWN_GAMES` - a plain restart is not enough on its own, because NSSM
re-runs whatever copy of the file is already on the GPC. The GPC needs the new copy first:

```powershell
# 1. Get the latest script onto the GPC: git pull in the repo, or copy scripts\gpc-daemon.py across
# 2. Restart so the new code is actually loaded
nssm restart gpc-daemon
nssm status gpc-daemon
```

So after adding a game (a new `.exe` in `KNOWN_GAMES`, plus an `IGDB_NAME_MAP` entry if the IGDB
title differs) or changing the interval, always copy the updated script over, then restart.

## Logs

```powershell
nssm status gpc-daemon
# Logs go to stdout - view in Event Viewer or redirect in nssm:
nssm set gpc-daemon AppStdout "C:\logs\gpc-daemon.log"
nssm set gpc-daemon AppStderr "C:\logs\gpc-daemon-err.log"
nssm restart gpc-daemon
```
