// I read Lenovo laptop status from two Redis keys written by a daemon running on
// the laptop: lenovo:status (600s TTL) for live data and lenovo:last-known (no TTL)
// so the card always has something to render even when the laptop is offline.
import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

type StatusPayload = {
  battery: number
  charging: boolean
  timestamp: string
  device?: string
}

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(
        { battery: null, charging: null, lastSeen: null, device: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    // lenovo:status has a 600s TTL set by the daemon; lenovo:last-known has no TTL so I always have something to show
    const [live, lastKnown] = await Promise.all([
      redis.get<StatusPayload>("lenovo:status"),
      redis.get<StatusPayload>("lenovo:last-known"),
    ])

    // I prefer live data, but fall back to last-known rather than returning null so the card always renders
    const source = live ?? lastKnown

    if (!source) {
      return NextResponse.json(
        { battery: null, charging: null, lastSeen: null, device: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      {
        battery:  source.battery,
        charging: source.charging,
        lastSeen: source.timestamp,
        device:   source.device ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { battery: null, charging: null, lastSeen: null, device: null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
