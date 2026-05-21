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

interface LastPlayed {
  track: string
  artist: string
  albumArt: string | null
  type: "track" | "episode"
}

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
    // I cache for 3300s (55 min) so the token is refreshed before Spotify's 60-min expiry
    await redis.set("spotify:access_token", data.access_token, { ex: 3300 })
  }

  return data.access_token
}

async function getLastPlayed() {
  if (!redis) return null
  return redis.get<LastPlayed>("spotify:last_played")
}

export async function GET() {
  try {
    const token = await getAccessToken()
    if (!token) {
      const last = await getLastPlayed()
      return NextResponse.json(
        { playing: false, lastPlayed: last ?? null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    // I use /me/player rather than recently-played so I can detect the live playing state and progress_ms
    const res = await fetch("https://api.spotify.com/v1/me/player?additional_types=track,episode", {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 204 means no active device - I fall back to last_played so the card never goes blank
    if (res.status === 204 || res.status === 404 || !res.ok) {
      const last = await getLastPlayed()
      return NextResponse.json(
        { playing: false, lastPlayed: last ?? null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const data = await res.json() as {
      is_playing: boolean
      progress_ms?: number
      currently_playing_type?: string
      device?: { name: string; type: string }
      item?: {
        name: string
        duration_ms: number
        artists?: { name: string }[]
        album?: { images: { url: string }[] }
        show?: { name: string; images: { url: string }[] }
        images?: { url: string }[]
        external_urls: { spotify: string }
      }
    }

    if (!data.item) {
      const last = await getLastPlayed()
      return NextResponse.json(
        { playing: false, lastPlayed: last ?? null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    // I check currently_playing_type because podcast episodes share the same endpoint but have no artists array
    const isEpisode = data.currently_playing_type === "episode"
    const title = data.item.name
    const subtitle = isEpisode
      ? (data.item.show?.name ?? "Podcast")
      : (data.item.artists?.map((a) => a.name).join(", ") ?? "")
    const images = isEpisode
      ? (data.item.images ?? data.item.show?.images ?? [])
      : (data.item.album?.images ?? [])
    const albumArt = images[1]?.url ?? images[0]?.url ?? null

    if (redis) {
      await redis.set("spotify:last_played", { track: title, artist: subtitle, albumArt, type: isEpisode ? "episode" : "track" })
    }

    return NextResponse.json(
      {
        playing: data.is_playing,
        paused: !data.is_playing,
        type: isEpisode ? "episode" : "track",
        track: title,
        artist: subtitle,
        albumArt,
        url: data.item.external_urls.spotify,
        // I return progress_ms as a snapshot; the client ticks it forward every second so the bar stays smooth between 10s polls
        progressMs: data.progress_ms ?? 0,
        durationMs: data.item.duration_ms,
        device: data.device?.name ?? null,
        lastPlayed: null,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    const last = await getLastPlayed()
    return NextResponse.json(
      { playing: false, lastPlayed: last ?? null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
