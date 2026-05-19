#!/usr/bin/env python3
"""
Gaming PC daemon - writes CPU%, GPU%, current game and timestamp to Upstash Redis every 30s.
No battery - desktop only. Runs as a Windows service via NSSM.
GPU: NVIDIA GeForce RTX 4060 via pynvml.

Setup:
  pip install psutil requests pynvml

Run manually to test:
  set UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
  set UPSTASH_REDIS_REST_TOKEN=your_token_here
  python scripts/gpc-daemon.py
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
    print("Missing dependency. Run: pip install psutil requests pynvml", flush=True)
    sys.exit(1)

try:
    import pynvml
    pynvml.nvmlInit()
    _nvml_handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    NVML_AVAILABLE = True
except Exception as e:
    print(f"pynvml not available or no NVIDIA GPU found: {e}", flush=True)
    NVML_AVAILABLE = False

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

KNOWN_GAMES = {
    "Fortnite":      "fortniteclient-win64-shipping.exe",
    "Minecraft":     "javaw.exe",
    "GTA V":         "gta5.exe",
    "GTA VI":        "gtavi.exe",
    "FC 26":         "fc26.exe",
    "FC 27":         "fc27.exe",
    "Call of Duty":  "cod.exe",
    "Apex Legends":  "r5apex.exe",
    "Rocket League": "rocketleague.exe",
    "Overwatch 2":   "overwatch.exe",
}

print(
    f"Gaming PC daemon started on {DEVICE}. Writing status every {INTERVAL}s. Press Ctrl+C to stop.",
    flush=True,
)


def get_gpu_percent() -> int | None:
    if not NVML_AVAILABLE:
        return None
    try:
        rates = pynvml.nvmlDeviceGetUtilizationRates(_nvml_handle)
        return rates.gpu
    except Exception:
        return None


def get_current_game() -> str | None:
    # I compare lowercase so process names with odd casing still match.
    try:
        running = {p.info["name"].lower() for p in psutil.process_iter(["name"]) if p.info["name"]}
    except Exception:
        return None
    for name, exe in KNOWN_GAMES.items():
        if exe in running:
            return name
    return None


def write_status():
    cpu = round(psutil.cpu_percent(interval=1))
    gpu = get_gpu_percent()
    game = get_current_game()

    payload = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "device": DEVICE,
        "cpu_percent": cpu,
        "gpu_percent": gpu,
        "game": game,
    }

    try:
        res = requests.post(
            f"{UPSTASH_URL}/pipeline",
            headers={
                "Authorization": f"Bearer {UPSTASH_TOKEN}",
                "Content-Type": "application/json",
            },
            json=[
                ["SET", "gpc:status", json.dumps(payload), "EX", 600],
                ["SET", "gpc:last-known", json.dumps(payload)],
            ],
            timeout=10,
        )
        ts = time.strftime("%H:%M:%S")
        gpu_str = f"{gpu}%" if gpu is not None else "n/a"
        game_str = game or "none"
        print(f"[{ts}] cpu={cpu}% gpu={gpu_str} game={game_str} -> {res.status_code}", flush=True)
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] write failed: {e}", flush=True)


while True:
    write_status()
    time.sleep(INTERVAL)
