import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN

async function getAccessToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return null

  if (redis) {
    const cached = await redis.get<string>("spotify:access_token")
    if (cached) return cached
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  })

  if (!res.ok) return null

  const data = await res.json() as { access_token: string; expires_in: number }

  if (redis) {
    await redis.set("spotify:access_token", data.access_token, { ex: 3300 })
  }

  return data.access_token
}

export async function GET() {
  try {
    const token = await getAccessToken()
    if (!token) {
      return NextResponse.json({ playing: false }, { headers: { "Cache-Control": "no-store" } })
    }

    const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 204 || res.status === 404) {
      return NextResponse.json({ playing: false }, { headers: { "Cache-Control": "no-store" } })
    }

    if (!res.ok) {
      return NextResponse.json({ playing: false }, { headers: { "Cache-Control": "no-store" } })
    }

    const data = await res.json() as {
      is_playing: boolean
      progress_ms?: number
      item?: {
        name: string
        duration_ms: number
        artists: { name: string }[]
        album: { images: { url: string }[] }
        external_urls: { spotify: string }
      }
    }

    if (!data.item) {
      return NextResponse.json({ playing: false, paused: false }, { headers: { "Cache-Control": "no-store" } })
    }

    return NextResponse.json(
      {
        playing: data.is_playing,
        paused: !data.is_playing,
        track: data.item.name,
        artist: data.item.artists.map((a) => a.name).join(", "),
        albumArt: data.item.album.images[1]?.url ?? data.item.album.images[0]?.url ?? null,
        url: data.item.external_urls.spotify,
        progressMs: data.progress_ms ?? 0,
        durationMs: data.item.duration_ms,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json({ playing: false }, { headers: { "Cache-Control": "no-store" } })
  }
}
