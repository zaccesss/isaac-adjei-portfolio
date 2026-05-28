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
  platform: string
  lastSeen: string
}

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(
        { online: false, lastSeen: null, status: "Offline", game: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const [live, lastKnown] = await Promise.all([
      redis.get<PS5Payload>("ps5:status"),
      redis.get<PS5Payload>("ps5:last-known"),
    ])

    // live key has a 120s TTL - if it exists the daemon polled within the last 2 minutes
    const online = live !== null
    // I prefer live data, but fall back to last-known so lastSeen is always available even when the PS5 is off
    const source = live ?? lastKnown

    if (!source) {
      return NextResponse.json(
        { online: false, lastSeen: null, status: "Offline", game: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      {
        online,
        lastSeen: source.lastSeen,
        status:   online ? source.status : "Offline",
        // I only expose game when online - stale values from last-known would be misleading
        game:     online ? (source.game ?? null) : null,
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
