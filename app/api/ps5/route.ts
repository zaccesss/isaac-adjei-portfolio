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

    const [live, lastKnown] = await Promise.all([
      redis.get<PS5Payload>("ps5:status"),
      redis.get<PS5Payload>("ps5:last-known"),
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
        // I return lastKnown.lastSeen so offline periods show the last time the PS5 was
        // genuinely on - source.lastSeen updates every cron tick and causes "online now" forever
        lastSeen:   lastKnown?.lastSeen ?? null,
        status:     online ? source.status : "Offline",
        game:       online ? (source.game ?? null) : null,
        gameImage:  online ? (source.game_image ?? null) : null,
        // I expose last game and its image so the card can show them greyed when offline
        lastGame:   source.game ?? null,
        lastGameImage: source.game_image ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { online: false, lastSeen: null, status: "Offline", game: null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
