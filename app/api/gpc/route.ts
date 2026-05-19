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
  timestamp: string
  device?: string
  cpu_percent: number | null
  gpu_percent: number | null
  game: string | null
}

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(
        { online: false, lastSeen: null, device: null, cpu: null, gpu: null, game: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const [live, lastKnown] = await Promise.all([
      redis.get<StatusPayload>("gpc:status"),
      redis.get<StatusPayload>("gpc:last-known"),
    ])

    // live key has a 600s TTL - if it exists the daemon pinged in the last 10 minutes
    const online = live !== null
    const source = live ?? lastKnown

    if (!source) {
      return NextResponse.json(
        { online: false, lastSeen: null, device: null, cpu: null, gpu: null, game: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      {
        online,
        lastSeen:  source.timestamp,
        device:    source.device ?? null,
        cpu:       online ? source.cpu_percent : null,
        gpu:       online ? source.gpu_percent : null,
        game:      online ? (source.game ?? null) : null,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { online: false, lastSeen: null, device: null, cpu: null, gpu: null, game: null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
