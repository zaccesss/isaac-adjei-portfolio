"""
PS5 daemon - runs on MacBook via launchd, polls every 60 seconds.

I read the PSN presence for my account using the psnawp-api library and
write the result to two Upstash Redis keys:
  ps5:status     - live payload with a 120-second TTL
  ps5:last-known - last known state, no TTL
"""

import os
import json
import time
import requests
from datetime import datetime, timezone

UPSTASH_URL   = os.environ["UPSTASH_REDIS_REST_URL"]
UPSTASH_TOKEN = os.environ["UPSTASH_REDIS_REST_TOKEN"]
PSN_NPSSO     = os.environ["PSN_NPSSO"]

POLL_INTERVAL = 60  # I poll every 60 seconds - PSN rate limits are generous


def upstash(command: list) -> None:
    # I use the Upstash REST API directly rather than the redis-py library
    # so there are no extra pip dependencies beyond requests.
    resp = requests.post(
        UPSTASH_URL,
        headers={
            "Authorization": f"Bearer {UPSTASH_TOKEN}",
            "Content-Type": "application/json",
        },
        json=command,
        timeout=10,
    )
    resp.raise_for_status()


def get_presence() -> dict:
    # I use psnawp to read my own PSN account presence.
    from psnawp_api import PSNAWP
    psnawp = PSNAWP(npsso_token=PSN_NPSSO)
    client = psnawp.me()
    presence = client.get_presence()
    basic = presence.get("basicPresence", {})
    availability = basic.get("availability", "unavailable")
    online = availability == "availableToPlay"
    playing = availability == "availableToPlay"

    game_info = (basic.get("gameTitleInfoList") or [{}])[0]
    game_name = game_info.get("titleName") or game_info.get("npTitleId") or None
    # I treat any non-game app (Twitch, Netflix etc.) as an active session too
    # by reading titleName from the first item in gameTitleInfoList.

    status = "Playing" if (online and game_name) else ("Online" if online else "Offline")

    return {
        "online":   online,
        "status":   status,
        "game":     game_name,
        "platform": "PS5",
        "lastSeen": datetime.now(timezone.utc).isoformat(),
    }


def main():
    print(f"PS5 daemon starting at {datetime.now().isoformat()}")
    while True:
        try:
            payload = get_presence()
            payload_json = json.dumps(payload)
            # I write the live key with a 120-second TTL so the frontend
            # knows the daemon is running and data is fresh.
            upstash(["SET", "ps5:status", payload_json, "EX", "120"])
            # I always update last-known so the frontend has a fallback
            # even when ps5:status has expired.
            upstash(["SET", "ps5:last-known", payload_json])
            print(f"[{payload['lastSeen'][:19]}] {payload['status']} - {payload.get('game') or 'no game'}")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
