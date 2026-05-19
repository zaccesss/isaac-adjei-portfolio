#!/usr/bin/env python3
"""
Lenovo daemon - writes battery and charging state to Upstash Redis every 30s.
No weather or location - that is Mac only. Runs as a Windows service via NSSM.

Setup:
  pip install psutil requests

Run manually to test:
  set UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
  set UPSTASH_REDIS_REST_TOKEN=your_token_here
  python scripts/lenovo-daemon.py
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
    print("Missing dependency. Run: pip install psutil requests", flush=True)
    sys.exit(1)

UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
INTERVAL = 30

if not UPSTASH_URL or not UPSTASH_TOKEN:
    print(
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars first.",
        flush=True,
    )
    sys.exit(1)

DEVICE = socket.gethostname()

print(
    f"Lenovo daemon started on {DEVICE}. Writing status every {INTERVAL}s. Press Ctrl+C to stop.",
    flush=True,
)


def write_status():
    battery = psutil.sensors_battery()
    if battery is None:
        print("No battery found. Nothing to write.", flush=True)
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
                ["SET", "lenovo:status", json.dumps(payload), "EX", 600],
                ["SET", "lenovo:last-known", json.dumps(payload)],
            ],
            timeout=10,
        )
        pct = payload["battery"]
        chg = payload["charging"]
        ts = time.strftime("%H:%M:%S")
        print(f"[{ts}] battery={pct}% charging={chg} -> {res.status_code}", flush=True)
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] write failed: {e}", flush=True)


while True:
    write_status()
    time.sleep(INTERVAL)
