// I read PS5 presence from two Redis keys written by a Cloudflare Worker that polls
// the PSN API every minute. ps5:status is always present (the worker writes it on
// every tick) so I use source.online rather than live !== null to determine presence.
// lastGame is read from ps5:last-known because source.game is null when offline.
import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

type PS5Payload = {
  online: boolean
  busy: boolean
  status: string
  game: string | null
  game_image: string | null
  platform: string
  lastSeen: string
}

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(
        { online: false, lastSeen: null, status: "Offline", game: null, gameImage: null, lastGame: null, lastGameImage: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const [live, lastKnown, lastGame] = await Promise.all([
      redis.get<PS5Payload>("ps5:status"),
      redis.get<PS5Payload>("ps5:last-known"),
      redis.get<PS5Payload>("ps5:last-game"),
    ])

    // I use the payload's online field, not live !== null - the worker always runs every minute
    // so the live key is always present. source.online reflects actual PSN presence.
    const source = live ?? lastKnown
    const online = source?.online === true

    if (!source) {
      return NextResponse.json(
        { online: false, lastSeen: null, status: "Offline", game: null, gameImage: null, lastGame: null, lastGameImage: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      {
        online,
        // I only expose busy: true when the user is currently online in do-not-disturb mode.
        // When offline, busy is irrelevant so I always return false.
        busy:       online && (source.busy === true),
        // I return lastKnown.lastSeen so offline periods show the last time the PS5 was
        // genuinely on - source.lastSeen updates every cron tick and causes "online now" forever
        lastSeen:   lastKnown?.lastSeen ?? null,
        status:     online ? source.status : "Offline",
        game:       online ? (source.game ?? null) : null,
        gameImage:  online ? (source.game_image ?? null) : null,
        // I read lastGame from ps5:last-game, which only updates when a game is actively running.
        // This prevents sitting on the home screen (game: null) from overwriting the last played title.
        lastGame:      lastGame?.game       ?? null,
        lastGameImage: lastGame?.game_image ?? null,
      },
      { headers: { "Cache-Control": "public, max-age=10, stale-while-revalidate=20" } }
    )
  } catch {
    return NextResponse.json(
      { online: false, lastSeen: null, status: "Offline", game: null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
