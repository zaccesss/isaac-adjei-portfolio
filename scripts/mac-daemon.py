#!/usr/bin/env python3
"""
Mac daemon - writes battery, location and weather to Upstash Redis every 30s.
Location and weather refresh every 10 cycles (~5 min) to keep free API usage
low. City coordinates are used only for accurate weather - the city name is
never stored. Only country code and timezone are stored for privacy.

Setup:
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
WEATHER_EVERY = 10

if not UPSTASH_URL or not UPSTASH_TOKEN:
    print(
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars first.",
        flush=True,
    )
    sys.exit(1)

DEVICE = socket.gethostname().replace(".local", "").replace("-", " ")

print(
    f"Mac daemon started. Writing status every {INTERVAL}s. Press Ctrl+C to stop.",
    flush=True,
)

WMO_MAP = {
    0: ("Clear", "☀️"),
    1: ("Mostly Clear", "🌤️"),
    2: ("Partly Cloudy", "⛅"),
    3: ("Overcast", "☁️"),
    45: ("Foggy", "🌫️"),
    48: ("Foggy", "🌫️"),
    51: ("Drizzle", "🌦️"),
    53: ("Drizzle", "🌦️"),
    55: ("Drizzle", "🌦️"),
    61: ("Rainy", "🌧️"),
    63: ("Rainy", "🌧️"),
    65: ("Heavy Rain", "🌧️"),
    71: ("Snowy", "❄️"),
    73: ("Snowy", "❄️"),
    75: ("Heavy Snow", "❄️"),
    77: ("Snowy", "❄️"),
    80: ("Showers", "🌦️"),
    81: ("Showers", "🌦️"),
    82: ("Heavy Showers", "🌧️"),
    85: ("Snow Showers", "❄️"),
    86: ("Snow Showers", "❄️"),
    95: ("Thunderstorm", "⛈️"),
    96: ("Thunderstorm", "⛈️"),
    99: ("Thunderstorm", "⛈️"),
}

_location = {}
_weather = {}


def fetch_location():
    global _location
    try:
        r = requests.get("https://ipinfo.io/json", timeout=5)
        if r.ok:
            data = r.json()
            loc = data.get("loc", "")
            country_code = data.get("country", "")
            timezone = data.get("timezone", "Europe/London")
            if loc and country_code:
                lat, lon = loc.split(",")
                _location = {
                    "lat": float(lat),
                    "lon": float(lon),
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
        print("[weather] skipping - no location yet", flush=True)
        return
    try:
        r = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": _location["lat"],
                "longitude": _location["lon"],
                "current": "temperature_2m,weathercode",
                "temperature_unit": "celsius",
                "forecast_days": 1,
            },
            timeout=5,
        )
        if r.ok:
            current = r.json().get("current", {})
            code = int(current.get("weathercode", -1))
            temp = round(current.get("temperature_2m", 0))
            condition, emoji = WMO_MAP.get(code, ("Cloudy", "⛅"))
            _weather = {"condition": condition, "emoji": emoji, "temp_c": temp}
            print(
                f"[weather] {condition} {emoji} {temp}°C (code={code})",
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
