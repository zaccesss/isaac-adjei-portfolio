# Scripts

## mac-daemon.py

Writes MacBook battery status to Upstash Redis every 2 minutes so the live
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

```
Mac daemon started. Writing battery status every 120s. Press Ctrl+C to stop.
[14:32:01] battery=78% charging=True -> 200
```

Reload isaacadjei.me and the MacBook card on the homepage will show your
device name, battery and online status within 2 minutes.

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

Every 120 seconds it writes a JSON object to the Redis key `macbook:status`
with a 10-minute TTL:

```json
{
  "battery": 78,
  "charging": true,
  "timestamp": "2026-05-15T14:32:01Z",
  "device": "Isaacs MacBook Air"
}
```

The portfolio reads this via `/api/macbook`. If the key is missing or expired
(i.e. the daemon has not run for 10+ minutes) the widget shows the Mac as
offline.

### Safety

- Read-only system calls only (`psutil.sensors_battery()`)
- No elevated privileges required
- CPU usage rounds to 0.0% in Activity Monitor
- Safe to stop any time with `Ctrl+C` or `launchctl unload`
