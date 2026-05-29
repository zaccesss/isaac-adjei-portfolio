#!/usr/bin/env python3
"""
Gaming PC daemon - writes CPU%, GPU%, current game and timestamp to Upstash Redis every 30s.
No battery - desktop only. Runs as a Windows service via NSSM.
GPU: NVIDIA GeForce RTX 4060 via pynvml.

Game cover art is fetched from IGDB on first detection of each game and cached in memory.
Falls back to hardcoded URLs if IGDB credentials are not set or the lookup fails.

Setup:
  pip install psutil requests pynvml

Required env vars:
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN

Optional env vars (for IGDB game cover art):
  IGDB_CLIENT_ID      - Twitch developer app client ID (dev.twitch.tv/console)
  IGDB_CLIENT_SECRET  - Twitch developer app client secret

Run manually to test:
  set UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
  set UPSTASH_REDIS_REST_TOKEN=your_token_here
  set IGDB_CLIENT_ID=your_twitch_client_id
  set IGDB_CLIENT_SECRET=your_twitch_client_secret
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
    # I grab the handle once at startup rather than on every poll to avoid repeated driver calls
    _nvml_handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    NVML_AVAILABLE = True
except Exception as e:
    # I fall back gracefully so the daemon still runs on machines without NVIDIA drivers
    print(f"pynvml not available or no NVIDIA GPU found: {e}", flush=True)
    NVML_AVAILABLE = False

UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
IGDB_CLIENT_ID = os.environ.get("IGDB_CLIENT_ID")
IGDB_CLIENT_SECRET = os.environ.get("IGDB_CLIENT_SECRET")
# I poll every 30s - frequent enough for a live widget but gentle on the free Upstash tier
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
    "FiveM":         "fivem.exe",
    "FC 26":         "fc26.exe",
    "FC 27":         "fc27.exe",
    "Call of Duty":  "cod.exe",
    "Apex Legends":  "r5apex.exe",
    "Rocket League": "rocketleague.exe",
    "Overwatch 2":   "overwatch.exe",
}

# Fallback images used when IGDB is not configured or a lookup fails.
# IGDB names that don't match our short names exactly are handled by IGDB_NAME_MAP below.
FALLBACK_IMAGES = {
    "GTA V":         "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
    "Apex Legends":  "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
    "Rocket League": "https://cdn.cloudflare.steamstatic.com/steam/apps/252950/header.jpg",
    "Overwatch 2":   "https://cdn.cloudflare.steamstatic.com/steam/apps/2357570/header.jpg",
    "Minecraft":     "https://cdn.cloudflare.steamstatic.com/steam/apps/2566040/header.jpg",
    "FiveM":         "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
    "GTA VI":        "https://cdn.cloudflare.steamstatic.com/steam/apps/2394830/header.jpg",
    "FC 26":         "https://media.contentapi.ea.com/content/dam/ea/eafc/eafc-26/common/eafc26-mobile-header.jpg.adapt.1920w.jpg",
    "FC 27":         "https://media.contentapi.ea.com/content/dam/ea/eafc/eafc-27/common/eafc27-mobile-header.jpg.adapt.1920w.jpg",
    "Fortnite":      "https://cdn2.unrealengine.com/en-14br-egs-launcher-sectionbanner-1920x1080-1920x1080-264983321.jpg",
}

# IGDB uses full official names; map our short names to exact IGDB titles where they differ.
IGDB_NAME_MAP = {
    "GTA V":      "Grand Theft Auto V",
    "GTA VI":     "Grand Theft Auto VI",
    "FC 26":      "EA Sports FC 26",
    "FC 27":      "EA Sports FC 27",
    "Overwatch 2": "Overwatch 2",
    "Call of Duty": "Call of Duty",
    "FiveM":      "Grand Theft Auto V",
}

print(
    f"Gaming PC daemon started on {DEVICE}. Writing status every {INTERVAL}s. "
    f"IGDB: {'enabled' if IGDB_CLIENT_ID else 'disabled (set IGDB_CLIENT_ID + IGDB_CLIENT_SECRET to enable)'}. "
    "Press Ctrl+C to stop.",
    flush=True,
)

# --- IGDB helpers ---

_igdb_token: str | None = None
_igdb_token_expiry: float = 0.0
_game_image_cache: dict[str, str | None] = {}


def _get_igdb_token() -> str | None:
    global _igdb_token, _igdb_token_expiry
    if _igdb_token and time.time() < _igdb_token_expiry:
        return _igdb_token
    try:
        resp = requests.post(
            "https://id.twitch.tv/oauth2/token",
            params={
                "client_id": IGDB_CLIENT_ID,
                "client_secret": IGDB_CLIENT_SECRET,
                "grant_type": "client_credentials",
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        _igdb_token = data["access_token"]
        # I subtract 60s from expiry so we refresh before it actually expires
        _igdb_token_expiry = time.time() + data["expires_in"] - 60
        print(f"[igdb] new token obtained, expires in {data['expires_in']}s", flush=True)
        return _igdb_token
    except Exception as e:
        print(f"[igdb] token fetch failed: {e}", flush=True)
        return None


def _fetch_igdb_cover(game_name: str) -> str | None:
    token = _get_igdb_token()
    if not token:
        return None
    igdb_title = IGDB_NAME_MAP.get(game_name, game_name)
    try:
        resp = requests.post(
            "https://api.igdb.com/v4/games",
            headers={
                "Client-ID": IGDB_CLIENT_ID,
                "Authorization": f"Bearer {token}",
            },
            # I request the cover URL directly via the cover subfield to avoid a second request
            data=f'search "{igdb_title}"; fields name, cover.url; where cover != null; limit 1;',
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json()
        if results and results[0].get("cover", {}).get("url"):
            # IGDB returns protocol-relative URLs and thumbnail size; upgrade to big cover
            url = "https:" + results[0]["cover"]["url"].replace("/t_thumb/", "/t_cover_big/")
            print(f"[igdb] cover for '{game_name}' ({igdb_title}): {url}", flush=True)
            return url
    except Exception as e:
        print(f"[igdb] cover lookup failed for '{game_name}': {e}", flush=True)
    return None


def get_game_image(game_name: str) -> str | None:
    if game_name in _game_image_cache:
        return _game_image_cache[game_name]

    url: str | None = None
    if IGDB_CLIENT_ID and IGDB_CLIENT_SECRET:
        url = _fetch_igdb_cover(game_name)

    if url is None:
        url = FALLBACK_IMAGES.get(game_name)
        if url:
            print(f"[igdb] using fallback image for '{game_name}'", flush=True)

    _game_image_cache[game_name] = url
    return url


# --- System helpers ---

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
        "game_image": get_game_image(game) if game else None,
    }

    try:
        res = requests.post(
            f"{UPSTASH_URL}/pipeline",
            headers={
                "Authorization": f"Bearer {UPSTASH_TOKEN}",
                "Content-Type": "application/json",
            },
            json=[
                # I set a 600-second TTL so the key disappears if the daemon stops, signalling the PC is offline
                ["SET", "gpc:status", json.dumps(payload), "EX", 600],
                # I also write a TTL-free key so the dashboard can show the last-known state when offline
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
