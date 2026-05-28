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
import subprocess

import requests

try:
    import psutil
except ImportError:
    print("Missing dependency. Run: pip install psutil requests", flush=True)
    sys.exit(1)

UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
WEATHERAPI_KEY = os.environ.get("WEATHERAPI_KEY")
# I poll every 30s - frequent enough for a live widget but light on the Upstash free tier
INTERVAL = 30
# I refresh weather every 10 cycles (~5 min) - well within WeatherAPI free tier of 1M calls/month
WEATHER_EVERY = 10

if not UPSTASH_URL or not UPSTASH_TOKEN:
    print(
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars first.",
        flush=True,
    )
    sys.exit(1)

# I use scutil --get LocalHostName (e.g. Isaacs-MacBook-Air) rather than socket.gethostname()
# because the hostname can be set to a generic value like Mac.Home via System Settings
def _get_device_name() -> str:
    try:
        raw = subprocess.check_output(["scutil", "--get", "LocalHostName"], text=True).strip()
        return raw.replace("-", " ")
    except Exception:
        import socket as _socket
        return _socket.gethostname().replace(".local", "").replace("-", " ")

DEVICE = _get_device_name()

print(
    f"Mac daemon started. Writing status every {INTERVAL}s. Press Ctrl+C to stop.",
    flush=True,
)

# I map WeatherAPI condition codes to display strings and emojis.
# is_day=0 handling for Clear (1000) is done in fetch_weather so the
# daemon itself emits the correct moon emoji rather than relying on
# the API route to correct it after the fact.
WEATHERAPI_MAP = {
    1000: ("Clear", "☀️"),
    1003: ("Partly Cloudy", "🌤️"),
    1006: ("Cloudy", "⛅"),
    1009: ("Overcast", "☁️"),
    1030: ("Mist", "🌫️"),
    1063: ("Patchy Rain", "🌦️"),
    1066: ("Patchy Snow", "❄️"),
    1069: ("Sleet", "🌨️"),
    1072: ("Freezing Drizzle", "🌦️"),
    1087: ("Thunderstorm", "⛈️"),
    1114: ("Blowing Snow", "❄️"),
    1117: ("Blizzard", "❄️"),
    1135: ("Fog", "🌫️"),
    1147: ("Freezing Fog", "🌫️"),
    1150: ("Light Drizzle", "🌦️"),
    1153: ("Drizzle", "🌦️"),
    1168: ("Freezing Drizzle", "🌦️"),
    1171: ("Heavy Freezing Drizzle", "🌦️"),
    1180: ("Light Rain", "🌦️"),
    1183: ("Rain", "🌧️"),
    1186: ("Moderate Rain", "🌧️"),
    1189: ("Rain", "🌧️"),
    1192: ("Heavy Rain", "🌧️"),
    1195: ("Heavy Rain", "🌧️"),
    1198: ("Freezing Rain", "🌧️"),
    1201: ("Heavy Freezing Rain", "🌧️"),
    1204: ("Sleet", "🌨️"),
    1207: ("Heavy Sleet", "🌨️"),
    1210: ("Light Snow", "❄️"),
    1213: ("Snow", "❄️"),
    1216: ("Moderate Snow", "❄️"),
    1219: ("Snow", "❄️"),
    1222: ("Heavy Snow", "❄️"),
    1225: ("Heavy Snow", "❄️"),
    1237: ("Ice Pellets", "❄️"),
    1240: ("Light Showers", "🌦️"),
    1243: ("Showers", "🌧️"),
    1246: ("Heavy Showers", "🌧️"),
    1249: ("Sleet Showers", "🌨️"),
    1252: ("Heavy Sleet Showers", "🌨️"),
    1255: ("Light Snow Showers", "❄️"),
    1258: ("Snow Showers", "❄️"),
    1261: ("Light Ice Pellets", "❄️"),
    1264: ("Ice Pellets", "❄️"),
    1273: ("Thundery Rain", "⛈️"),
    1276: ("Heavy Thundery Rain", "⛈️"),
    1279: ("Thundery Snow", "⛈️"),
    1282: ("Heavy Thundery Snow", "⛈️"),
}

_location = {}
_weather = {}


def fetch_location():
    global _location
    try:
        # I use ipinfo.io because it returns coordinates without requiring an API key
        r = requests.get("https://ipinfo.io/json", timeout=5)
        if r.ok:
            data = r.json()
            loc = data.get("loc", "")
            country_code = data.get("country", "")
            # I fall back to Europe/London so timezone-aware displays degrade gracefully
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
        # I skip until location is known so I have valid coordinates
        print("[weather] skipping - no location yet", flush=True)
        return
    if not WEATHERAPI_KEY:
        print("[weather] WEATHERAPI_KEY not set - skipping", flush=True)
        return
    try:
        # I use WeatherAPI.com - more accurate than Open-Meteo and includes
        # is_day so the moon emoji switches at the real local sunrise, not a
        # fixed hour cutoff
        r = requests.get(
            "https://api.weatherapi.com/v1/current.json",
            params={
                "key": WEATHERAPI_KEY,
                "q": f"{_location['lat']},{_location['lon']}",
                "aqi": "no",
            },
            timeout=5,
        )
        if r.ok:
            current = r.json().get("current", {})
            code = int(current.get("condition", {}).get("code", 1000))
            temp = round(current.get("temp_c", 0))
            is_day = int(current.get("is_day", 1))
            condition, emoji = WEATHERAPI_MAP.get(code, ("Cloudy", "⛅"))
            # I replace the clear/sunny emoji with moon when is_day=0 so the
            # widget matches real local night without a fixed hour cutoff
            if not is_day and code == 1000:
                emoji = "🌙"
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
                # I set a 600-second TTL so the key expires when the daemon stops, signalling offline
                ["SET", "macbook:status", json.dumps(payload), "EX", 600],
                # I write a TTL-free key so the dashboard can show the last-known state when offline
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
