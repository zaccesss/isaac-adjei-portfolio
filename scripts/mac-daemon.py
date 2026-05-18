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
import socket

import requests

try:
    import psutil
except ImportError:
    print("Missing dependency. Run: pip install psutil requests")
    sys.exit(1)

UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
INTERVAL = 30  # seconds between writes

if not UPSTASH_URL or not UPSTASH_TOKEN:
    print(
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars first."
    )
    sys.exit(1)

DEVICE = (
    socket.gethostname()
    .replace(".local", "")
    .replace("-", " ")
)

print(
    f"Mac daemon started. Writing battery status every {INTERVAL}s. "
    "Press Ctrl+C to stop."
)


def write_status():
    battery = psutil.sensors_battery()
    if battery is None:
        print("No battery found (desktop Mac?). Nothing to write.")
        return

    payload = {
        "battery": round(battery.percent),
        "charging": battery.power_plugged,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "device": DEVICE,
    }

    try:
        res = requests.post(
            f"{UPSTASH_URL}/pipeline",
            headers={
                "Authorization": f"Bearer {UPSTASH_TOKEN}",
                "Content-Type": "application/json",
            },
            json=[
                ["SET", "macbook:status", json.dumps(payload), "EX", 600],
                ["SET", "macbook:last-known", json.dumps(payload)],
            ],
            timeout=10,
        )
        pct = payload["battery"]
        chg = payload["charging"]
        ts = time.strftime("%H:%M:%S")
        print(f"[{ts}] battery={pct}% charging={chg} -> {res.status_code}")
    except Exception as e:
        ts = time.strftime("%H:%M:%S")
        print(f"[{ts}] write failed: {e}")


while True:
    write_status()
    time.sleep(INTERVAL)
