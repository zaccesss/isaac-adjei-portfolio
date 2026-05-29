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

UPSTASH_URL = os.environ["UPSTASH_REDIS_REST_URL"]
UPSTASH_TOKEN = os.environ["UPSTASH_REDIS_REST_TOKEN"]
PSN_NPSSO = os.environ["PSN_NPSSO"]

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
    psnawp = PSNAWP(npsso_cookie=PSN_NPSSO)
    client = psnawp.me()
    # I look up my own account as a User object - presence is only on User,
    # not Client.
    user = psnawp.user(online_id=client.online_id)
    presence = user.get_presence()
    basic = presence.get("basicPresence", {})
    availability = basic.get("availability", "unavailable")
    online = availability == "availableToPlay"
    busy = availability == "doNotDisturb"

    game_info = (basic.get("gameTitleInfoList") or [{}])[0]
    game_name = (
        game_info.get("titleName") or game_info.get("npTitleId") or None
    )

    # I log the full game_info dict the first time a game is detected so I can
    # see exactly which image URL fields PSN returns for future image support
    if game_name:
        print(f"[game_info] {json.dumps(game_info)}", flush=True)

    # I try every field name PSN has been observed to use for game cover images
    game_image = (
        game_info.get("titleIconUrl")
        or game_info.get("conceptIconUrl")
        or game_info.get("imageUrl")
        or game_info.get("iconUrl")
        or game_info.get("titleIcon")
        or None
    )

    if game_name:
        status = "Playing"
    elif busy:
        status = "Busy"
    elif online:
        status = "Online"
    else:
        status = "Offline"

    return {
        "online": online,
        "status": status,
        "game": game_name,
        "game_image": game_image,
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
            game = payload.get("game") or "no game"
            print(f"[{payload['lastSeen'][:19]}] {payload['status']} - {game}")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
