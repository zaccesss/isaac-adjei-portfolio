# scripts/

Python daemons, CV generation scripts and utility scripts.

## Overview

| Script | Language | Description |
| --- | --- | --- |
| `generate-role-cvs.js` | Node.js | Assembles 6 role-specific CV HTML files from `cv.html` sections |
| `generate-pdfs.js` | Node.js | Puppeteer: renders all CV HTML files to PDF |
| `generate-docx.js` | Node.js | html-to-docx: converts all CV HTML files to DOCX |
| `watch-cvs.js` | Node.js | File-watcher: re-runs role CV generation on `cv.html` change |
| `job-scraper.py` | Python | Multi-source job scraper (Playwright + REST APIs), writes to Supabase |
| `wakatime-sync.py` | Python | Fetches WakaTime daily stats and writes to `wakatime_daily` in Supabase |
| `mac-daemon.py` | Python | MacBook battery daemon - writes to Upstash Redis every 30s |
| `gpc-daemon.py` | Python | Windows Gaming PC daemon - CPU, GPU usage and IGDB game art → Redis |
| `lenovo-daemon.py` | Python | Windows Lenovo laptop battery daemon - writes to Upstash Redis |
| `ps5-daemon.py` | Python | Legacy PS5 polling script (superseded by Cloudflare Worker) |
| `daily-coding-summary.ts` | Node.js | Nightly Discord summary of coding activity (GitHub Actions) |
| `spotify-auth.ts` | Node.js | One-time Spotify OAuth helper to obtain refresh token |
| `split-data.ts` | Node.js | One-time migration script that split `blog.ts` and `projects.ts` into per-entry files; kept for reference |
| `requirements.txt` | - | Python dependencies for all daemons |

---

## mac-daemon.py

Writes MacBook battery status to Upstash Redis every 30 seconds so the live
status widget on the portfolio can show battery percentage, charging state,
device name and online/away indicator.

### One-time setup (Mac only)

**1. Install dependencies**

```bash
pip3 install psutil requests
```

**2. Get your Upstash credentials**

Go to vercel.com → isaac-adjei-portfolio project → Settings → Environment
Variables and copy:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**3. Run the daemon**

```bash
export UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
export UPSTASH_REDIS_REST_TOKEN="your_token_here"
python3 scripts/mac-daemon.py
```

You will see output like:

```text
Mac daemon started. Writing battery status every 30s. Press Ctrl+C to stop.
[14:32:01] battery=78% charging=True -> 200
```

Reload isaacadjei.me and the MacBook card on the homepage will show your
device name, battery and online status within 30 seconds.

### Run automatically on Mac startup (optional)

Create a launchd plist so the daemon starts on login and stays running:

```bash
cat > ~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>me.isaacadjei.macdaemon</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>/Users/YOUR_USERNAME/isaac-adjei-portfolio/scripts/mac-daemon.py</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>UPSTASH_REDIS_REST_URL</key>
    <string>YOUR_UPSTASH_URL_HERE</string>
    <key>UPSTASH_REDIS_REST_TOKEN</key>
    <string>YOUR_UPSTASH_TOKEN_HERE</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/macdaemon.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/macdaemon.log</string>
</dict>
</plist>
EOF
```

Replace `YOUR_USERNAME`, `YOUR_UPSTASH_URL_HERE` and
`YOUR_UPSTASH_TOKEN_HERE` with your actual values, then activate:

```bash
launchctl load ~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist
```

To stop it: `launchctl unload ~/Library/LaunchAgents/me.isaacadjei.macdaemon.plist`

To check logs: `tail -f /tmp/macdaemon.log`

### What data it writes

Every 30 seconds it writes a JSON object to two Redis keys:

- `macbook:status` with a 10-minute TTL (used to detect online/away)
- `macbook:last-known` with no expiry (persists device name, battery and timestamp forever)

```json
{
  "battery": 78,
  "charging": true,
  "timestamp": "2026-05-15T14:32:01Z",
  "device": "Isaacs MacBook Air"
}
```

The portfolio reads this via `/api/macbook`. When `macbook:status` has expired
(daemon not run for 10+ minutes) the widget falls back to `macbook:last-known`
and shows the device name, last battery percent and "last seen X ago" instead
of going blank.

### Safety

- Read-only system calls only (`psutil.sensors_battery()`)
- No elevated privileges required
- CPU usage rounds to 0.0% in Activity Monitor
- Safe to stop any time with `Ctrl+C` or `launchctl unload`

---

## wakatime-sync.py

Fetches the last 7 days of WakaTime coding activity from the WakaTime API and upserts
one row per day into the `wakatime_daily` Supabase table. Run daily via the
`wakatime-sync.yml` GitHub Actions workflow.

### Required environment variables

| Variable | Where to get it |
| --- | --- |
| `WAKATIME_API_KEY` | wakatime.com/settings/account → API Key - GitHub Actions secret only, not Vercel |
| `SUPABASE_URL` | Supabase project settings → API |
| `SUPABASE_ANON_KEY` | Supabase project settings → API |

---

## lenovo-daemon.py

Windows daemon that writes Lenovo laptop battery state to Upstash Redis. Same pattern as
`mac-daemon.py` but runs on Windows via Task Scheduler or NSSM. Kept for future use if
the Lenovo laptop needs to appear on the live status grid.
