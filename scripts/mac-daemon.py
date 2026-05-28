#!/usr/bin/env python3
"""
Mac daemon - writes battery, location and weather to Upstash Redis every 30s.
Location and weather refresh every 10 cycles (~5 min) to keep API usage low.
City coordinates are used only for accurate weather - the city name is never
stored. Only country code and timezone are stored for privacy.

Setup:
  brew install corelocationcli
  pip install psutil requests

Run:
  export UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
  export UPSTASH_REDIS_REST_TOKEN=your_token_here
  python scripts/mac-daemon.py

Runs automatically on login via launchd plist. Safe to stop with Ctrl+C.
"""

import os
import sys
import json
import time
import subprocess

import requests

try:
    import psutil
except ImportError:
    print("Missing dependency. Run: pip install psutil requests", flush=True)
    sys.exit(1)

UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
INTERVAL = 30
WEATHER_EVERY = 10

if not UPSTASH_URL or not UPSTASH_TOKEN:
    print(
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars first.",
        flush=True,
    )
    sys.exit(1)


# I use scutil --get LocalHostName (e.g. Isaacs-MacBook-Air) rather than
# socket.gethostname() because the hostname can be set to a generic value
# like Mac.Home via System Settings
def _get_device_name() -> str:
    try:
        raw = subprocess.check_output(
            ["scutil", "--get", "LocalHostName"], text=True
        ).strip()
        return raw.replace("-", " ")
    except Exception:
        import socket as _socket
        return _socket.gethostname().replace(".local", "").replace("-", " ")


DEVICE = _get_device_name()

print(
    f"Mac daemon started. Writing status every {INTERVAL}s. "
    "Press Ctrl+C to stop.",
    flush=True,
)

# I map WMO weather codes (used by Open-Meteo) to display strings and emojis.
# Night overrides for clear/mainly-clear are handled in fetch_weather so the
# daemon emits the correct moon emoji rather than relying on the API route.
OPENMETEO_MAP = {
    0:  ("Clear", "☀️"),
    1:  ("Mainly Clear", "🌤️"),
    2:  ("Partly Cloudy", "⛅"),
    3:  ("Overcast", "☁️"),
    45: ("Fog", "🌫️"),
    48: ("Freezing Fog", "🌫️"),
    51: ("Light Drizzle", "🌦️"),
    53: ("Drizzle", "🌦️"),
    55: ("Heavy Drizzle", "🌦️"),
    56: ("Freezing Drizzle", "🌦️"),
    57: ("Heavy Freezing Drizzle", "🌦️"),
    61: ("Light Rain", "🌦️"),
    63: ("Rain", "🌧️"),
    65: ("Heavy Rain", "🌧️"),
    66: ("Freezing Rain", "🌧️"),
    67: ("Heavy Freezing Rain", "🌧️"),
    71: ("Light Snow", "❄️"),
    73: ("Snow", "❄️"),
    75: ("Heavy Snow", "❄️"),
    77: ("Snow Grains", "❄️"),
    80: ("Light Showers", "🌦️"),
    81: ("Showers", "🌧️"),
    82: ("Heavy Showers", "🌧️"),
    85: ("Snow Showers", "❄️"),
    86: ("Heavy Snow Showers", "❄️"),
    95: ("Thunderstorm", "⛈️"),
    96: ("Thunderstorm with Hail", "⛈️"),
    99: ("Thunderstorm with Heavy Hail", "⛈️"),
}

_location = {}
_weather = {}


def fetch_location():
    global _location
    lat, lon = None, None

    # I prefer CoreLocationCLI for street-level GPS precision; ipinfo.io is
    # city-level only
    try:
        result = subprocess.run(
            ["CoreLocationCLI", "-once", "-format", "%latitude %longitude"],
            capture_output=True, text=True, timeout=10,
        )
        if result.returncode == 0:
            parts = result.stdout.strip().split()
            lat, lon = float(parts[0]), float(parts[1])
            print("[location] using CoreLocation GPS", flush=True)
    except FileNotFoundError:
        print(
            "[location] CoreLocationCLI not found - "
            "install with: brew install corelocationcli",
            flush=True,
        )
    except Exception as e:
        print(f"[location] CoreLocationCLI failed: {e}", flush=True)

    # I always fetch ipinfo for country_code and timezone; it also provides a
    # lat/lon fallback
    try:
        r = requests.get("https://ipinfo.io/json", timeout=5)
        if r.ok:
            data = r.json()
            loc = data.get("loc", "")
            country_code = data.get("country", "")
            # I fall back to Europe/London so timezone-aware displays degrade
            # gracefully
            timezone = data.get("timezone", "Europe/London")
            if not lat and loc:
                ip_lat, ip_lon = loc.split(",")
                lat, lon = float(ip_lat), float(ip_lon)
                print("[location] falling back to ipinfo coordinates",
                      flush=True)
            if lat and lon and country_code:
                _location = {
                    "lat": lat,
                    "lon": lon,
                    "country_code": country_code,
                    "timezone": timezone,
                }
                print(
                    f"[location] country={country_code} tz={timezone}",
                    flush=True,
                )
    except Exception as e:
        print(f"[location] fetch failed: {e}", flush=True)


def fetch_weather():
    global _weather
    if not _location:
        # I skip until location is known so I have valid coordinates
        print("[weather] skipping - no location yet", flush=True)
        return
    try:
        # I use Open-Meteo - free, no API key and more accurate for UK weather
        # than WeatherAPI since it includes the European ECMWF model
        r = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": _location["lat"],
                "longitude": _location["lon"],
                "current": "temperature_2m,weather_code,is_day",
                "forecast_days": 1,
            },
            timeout=5,
        )
        if r.ok:
            current = r.json().get("current", {})
            code = int(current.get("weather_code", 0))
            temp = round(current.get("temperature_2m", 0))
            is_day = int(current.get("is_day", 1))
            condition, emoji = OPENMETEO_MAP.get(code, ("Cloudy", "⛅"))
            # I map night conditions: clear/mainly-clear to moon, partly cloudy
            # to plain cloud (no sun visible at night), overcast stays as-is
            if not is_day and code in (0, 1):
                emoji = "🌙"
            elif not is_day and code == 2:
                emoji = "☁️"
            _weather = {
                "condition": condition,
                "emoji": emoji,
                "temp_c": temp,
                "is_day": is_day,
            }
            print(
                f"[weather] {condition} {emoji} {temp}°C"
                f" (code={code}, is_day={is_day})",
                flush=True,
            )
        else:
            print(f"[weather] API returned {r.status_code}", flush=True)
    except Exception as e:
        print(f"[weather] fetch failed: {e}", flush=True)


def write_status():
    battery = psutil.sensors_battery()
    if battery is None:
        print("No battery found (desktop Mac?). Nothing to write.", flush=True)
        return

    payload = {
        "battery": round(battery.percent),
        "charging": battery.power_plugged,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "device": DEVICE,
        "country_code": _location.get("country_code") or None,
        "timezone": _location.get("timezone") or "Europe/London",
        "weather_condition": _weather.get("condition") or None,
        "weather_emoji": _weather.get("emoji") or None,
        "temp_c": _weather.get("temp_c") if _weather else None,
        "is_day": _weather.get("is_day", 1),
    }

    try:
        res = requests.post(
            f"{UPSTASH_URL}/pipeline",
            headers={
                "Authorization": f"Bearer {UPSTASH_TOKEN}",
                "Content-Type": "application/json",
            },
            json=[
                # I set a 600-second TTL so the key expires when the daemon
                # stops, signalling offline
                ["SET", "macbook:status", json.dumps(payload), "EX", 600],
                # I write a TTL-free key so the dashboard can show the
                # last-known state when offline
                ["SET", "macbook:last-known", json.dumps(payload)],
            ],
            timeout=10,
        )
        pct = payload["battery"]
        chg = payload["charging"]
        cond = payload["weather_condition"] or "?"
        temp = payload["temp_c"]
        ts = time.strftime("%H:%M:%S")
        print(
            f"[{ts}] battery={pct}% charging={chg} "
            f"weather={cond} {temp}°C -> {res.status_code}",
            flush=True,
        )
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] write failed: {e}", flush=True)


fetch_location()
fetch_weather()

cycle = 0
while True:
    write_status()
    cycle += 1
    if cycle % WEATHER_EVERY == 0:
        fetch_location()
        fetch_weather()
    time.sleep(INTERVAL)
