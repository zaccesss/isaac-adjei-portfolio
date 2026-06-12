"""
Fetches WakaTime daily summaries for the last FETCH_DAYS days and upserts
each day into the wakatime_daily Supabase table.

Env vars required:
  WAKATIME_API_KEY          -- WakaTime secret API key
  NEXT_PUBLIC_SUPABASE_URL  -- Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY -- Supabase service-role key (bypasses RLS)
"""

import os
import sys
import time
from datetime import date, timedelta

import requests
from supabase import create_client

# I fetch the last 14 days so a single missed run never leaves gaps.
FETCH_DAYS = 14

# I read credentials from env so secrets are never hard-coded.
WAKATIME_API_KEY = os.environ.get("WAKATIME_API_KEY", "")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def fetch_summaries(start: date, end: date) -> list[dict]:
    """Call the WakaTime summaries endpoint and return the data array."""
    # I use HTTP Basic auth with the API key as the username.
    url = "https://wakatime.com/api/v1/users/current/summaries"
    params = {
        "start": start.isoformat(),
        "end": end.isoformat(),
    }
    try:
        resp = requests.get(
            url,
            params=params,
            auth=(WAKATIME_API_KEY, ""),
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json().get("data", [])
    except Exception as exc:
        print(f"WakaTime API error: {exc}", file=sys.stderr)
        return []


def build_row(day: dict) -> dict | None:
    """Convert one WakaTime summary day into a wakatime_daily row."""
    day_date = day.get("range", {}).get("date")
    if not day_date:
        return None
    total_seconds = day.get("grand_total", {}).get("total_seconds", 0)
    # I keep the top-10 by total_seconds for each category to cap JSONB size.
    languages = sorted(
        [{"name": l["name"], "total_seconds": l["total_seconds"]} for l in day.get("languages", [])],
        key=lambda x: x["total_seconds"],
        reverse=True,
    )[:10]
    projects = sorted(
        [{"name": p["name"], "total_seconds": p["total_seconds"]} for p in day.get("projects", [])],
        key=lambda x: x["total_seconds"],
        reverse=True,
    )[:10]
    editors = sorted(
        [{"name": e["name"], "total_seconds": e["total_seconds"]} for e in day.get("editors", [])],
        key=lambda x: x["total_seconds"],
        reverse=True,
    )[:10]
    return {
        "date": day_date,
        "total_seconds": int(total_seconds),
        "languages": languages,
        "projects": projects,
        "editors": editors,
    }


def main() -> None:
    if not WAKATIME_API_KEY:
        print("WAKATIME_API_KEY not set — skipping sync", file=sys.stderr)
        sys.exit(0)
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Supabase credentials not set — skipping sync", file=sys.stderr)
        sys.exit(1)

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    end_date = date.today()
    start_date = end_date - timedelta(days=FETCH_DAYS - 1)

    print(f"Fetching WakaTime summaries {start_date} → {end_date}")
    data = fetch_summaries(start_date, end_date)
    print(f"  Got {len(data)} day(s) from API")

    rows = [r for day in data if (r := build_row(day)) is not None]
    if not rows:
        print("No rows to upsert — nothing to do")
        return

    # I upsert on the date column so re-runs are safe and idempotent.
    result = (
        supabase.table("wakatime_daily")
        .upsert(rows, on_conflict="date")
        .execute()
    )
    print(f"  Upserted {len(rows)} row(s)")

    # I give the DB a moment before the process exits cleanly.
    time.sleep(0.5)


if __name__ == "__main__":
    main()
