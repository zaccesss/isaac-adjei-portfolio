#!/usr/bin/env python3
"""
Mac battery daemon - writes battery status to Upstash Redis every 2 minutes.
The portfolio reads this to show a live battery indicator.

Setup:
  pip install psutil requests

Run:
  export UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
  export UPSTASH_REDIS_REST_TOKEN=your_token_here
  python scripts/mac-daemon.py

To run on Mac startup, add a launchd plist or just keep this terminal open.
Safe to stop any time with Ctrl+C. Uses no meaningful CPU or battery.
"""

import os
import sys
import json
import time
import requests

try:
    import psutil
except ImportError:
    print("Missing dependency. Run: pip install psutil requests")
    sys.exit(1)

UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
INTERVAL = 120  # seconds between writes

if not UPSTASH_URL or not UPSTASH_TOKEN:
    print("Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars first.")
    sys.exit(1)

print(f"Mac daemon started. Writing battery status every {INTERVAL}s. Press Ctrl+C to stop.")

def write_status():
    battery = psutil.sensors_battery()
    if battery is None:
        print("No battery found (desktop Mac?). Nothing to write.")
        return

    data = json.dumps({
        "battery": round(battery.percent),
        "charging": battery.power_plugged,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })

    try:
        res = requests.post(
            f"{UPSTASH_URL}/set/macbook:status",
            headers={
                "Authorization": f"Bearer {UPSTASH_TOKEN}",
                "Content-Type": "application/json",
            },
            json=["macbook:status", data, "EX", 600],
            timeout=10,
        )
        print(f"[{time.strftime('%H:%M:%S')}] battery={round(battery.percent)}% charging={battery.power_plugged} -> {res.status_code}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] write failed: {e}")

while True:
    write_status()
    time.sleep(INTERVAL)
