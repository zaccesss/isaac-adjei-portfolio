"""
Fetches WakaTime daily summaries and per-hour durations for the last FETCH_DAYS
days and upserts each day into the wakatime_daily Supabase table.

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

# Fetch the last 14 days so a single missed run never leaves gaps.
FETCH_DAYS = 14

# On each run, also back-fill the hours column for rows within this many days
# that have hours = null (catches rows created before this column existed).
BACKFILL_DAYS = 90

WAKATIME_API_KEY = os.environ.get("WAKATIME_API_KEY", "")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def fetch_summaries(start: date, end: date) -> list[dict]:
    """Call the WakaTime summaries endpoint for a date range."""
    url = "https://wakatime.com/api/v1/users/current/summaries"
    params = {"start": start.isoformat(), "end": end.isoformat()}
    try:
        resp = requests.get(url, params=params, auth=(WAKATIME_API_KEY, ""), timeout=30)
        resp.raise_for_status()
        return resp.json().get("data", [])
    except Exception as exc:
        print(f"WakaTime summaries error: {exc}", file=sys.stderr)
        return []


def fetch_durations(day: date) -> list[dict]:
    """Call the WakaTime durations endpoint for a single day."""
    url = "https://wakatime.com/api/v1/users/current/durations"
    params = {"date": day.isoformat()}
    try:
        resp = requests.get(url, params=params, auth=(WAKATIME_API_KEY, ""), timeout=30)
        resp.raise_for_status()
        return resp.json().get("data", [])
    except Exception as exc:
        print(f"WakaTime durations error for {day}: {exc}", file=sys.stderr)
        return []


def aggregate_hours(durations: list[dict]) -> list[int]:
    """
    Aggregate raw duration sessions into a 24-element array of seconds per UTC hour.
    Each session has time (Unix float) and duration (seconds float).
    """
    hours = [0] * 24
    for session in durations:
        t = session.get("time", 0)
        duration = session.get("duration", 0)
        if t and duration:
            hour = int((t % 86400) / 3600)
            hours[hour] += int(duration)
    return hours


def build_row(day: dict, hours: list[int] | None = None) -> dict | None:
    """Convert one WakaTime summary day into a wakatime_daily row."""
    day_date = day.get("range", {}).get("date")
    if not day_date:
        return None
    total_seconds = day.get("grand_total", {}).get("total_seconds", 0)
    # Keep top-10 per category to cap JSONB size.
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
    operating_systems = sorted(
        [{"name": o["name"], "total_seconds": o["total_seconds"]} for o in day.get("operating_systems", [])],
        key=lambda x: x["total_seconds"],
        reverse=True,
    )[:5]
    row = {
        "date": day_date,
        "total_seconds": int(total_seconds),
        "languages": languages,
        "projects": projects,
        "editors": editors,
        "operating_systems": operating_systems,
    }
    if hours is not None:
        row["hours"] = hours
    return row


def main() -> None:
    if not WAKATIME_API_KEY:
        print("WAKATIME_API_KEY not set - skipping sync", file=sys.stderr)
        sys.exit(0)
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Supabase credentials not set - skipping sync", file=sys.stderr)
        sys.exit(1)

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    end_date = date.today()
    start_date = end_date - timedelta(days=FETCH_DAYS - 1)

    print(f"Fetching WakaTime summaries {start_date} → {end_date}")
    summary_data = fetch_summaries(start_date, end_date)
    print(f"  Got {len(summary_data)} day(s) from summaries")

    # Build a date→day dict so we can match durations to summary days
    days_by_date: dict[str, dict] = {}
    for day in summary_data:
        d = day.get("range", {}).get("date")
        if d:
            days_by_date[d] = day

    # Fetch durations for each day in the sync window (gives hourly breakdown)
    print(f"Fetching WakaTime durations for {FETCH_DAYS} days...")
    durations_by_date: dict[str, list[int]] = {}
    cursor = start_date
    while cursor <= end_date:
        raw = fetch_durations(cursor)
        durations_by_date[cursor.isoformat()] = aggregate_hours(raw)
        cursor += timedelta(days=1)
        time.sleep(0.2)  # be polite to the API

    # Build rows for upsert
    rows = []
    for day_date, day in days_by_date.items():
        hours = durations_by_date.get(day_date)
        row = build_row(day, hours=hours)
        if row:
            rows.append(row)

    if not rows:
        print("No rows to upsert - nothing to do")
    else:
        result = (
            supabase.table("wakatime_daily")
            .upsert(rows, on_conflict="date")
            .execute()
        )
        print(f"  Upserted {len(rows)} row(s) with hourly data")

    # Back-fill hours for recent rows that predate this column (hours = null)
    backfill_start = (end_date - timedelta(days=BACKFILL_DAYS - 1)).isoformat()
    existing = (
        supabase.table("wakatime_daily")
        .select("date")
        .gte("date", backfill_start)
        .is_("hours", "null")
        .execute()
    )
    backfill_dates = [r["date"] for r in (existing.data or [])]
    # Skip dates already fetched above
    recent_fetched = set(days_by_date.keys())
    backfill_dates = [d for d in backfill_dates if d not in recent_fetched]

    if backfill_dates:
        print(f"Back-filling hours for {len(backfill_dates)} row(s) with null hours...")
        for d_str in sorted(backfill_dates):
            d = date.fromisoformat(d_str)
            raw = fetch_durations(d)
            hours = aggregate_hours(raw)
            supabase.table("wakatime_daily").update({"hours": hours}).eq("date", d_str).execute()
            print(f"  Back-filled {d_str}")
            time.sleep(0.2)

    time.sleep(0.5)


if __name__ == "__main__":
    main()
