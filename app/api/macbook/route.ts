import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(
        { battery: null, charging: null, lastSeen: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const data = await redis.get<{ battery: number; charging: boolean; timestamp: string }>(
      "macbook:status"
    )

    if (!data) {
      return NextResponse.json(
        { battery: null, charging: null, lastSeen: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      { battery: data.battery, charging: data.charging, lastSeen: data.timestamp },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { battery: null, charging: null, lastSeen: null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
