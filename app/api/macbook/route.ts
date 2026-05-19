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
  country_code?: string
  timezone?: string
  weather_condition?: string
  weather_emoji?: string
  temp_c?: number
}

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(
        { battery: null, charging: null, lastSeen: null, device: null, countryCode: null, timezone: "Europe/London", weatherCondition: null, weatherEmoji: null, tempC: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const [live, lastKnown] = await Promise.all([
      redis.get<StatusPayload>("macbook:status"),
      redis.get<StatusPayload>("macbook:last-known"),
    ])

    const source = live ?? lastKnown

    if (!source) {
      return NextResponse.json(
        { battery: null, charging: null, lastSeen: null, device: null, countryCode: null, timezone: "Europe/London", weatherCondition: null, weatherEmoji: null, tempC: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      {
        battery:          source.battery,
        charging:         source.charging,
        lastSeen:         source.timestamp,
        device:           source.device             ?? null,
        countryCode:      source.country_code       ?? null,
        timezone:         source.timezone           ?? "Europe/London",
        weatherCondition: source.weather_condition  ?? null,
        weatherEmoji:     source.weather_emoji      ?? null,
        tempC:            source.temp_c             ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { battery: null, charging: null, lastSeen: null, device: null, countryCode: null, timezone: "Europe/London", weatherCondition: null, weatherEmoji: null, tempC: null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
