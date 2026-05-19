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

    const [live, lastKnown] = await Promise.all([
      redis.get<StatusPayload>("lenovo:status"),
      redis.get<StatusPayload>("lenovo:last-known"),
    ])

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
