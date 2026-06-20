// I use the OAuth refresh-token flow (no user-facing login) because my account is
// the only one this site ever reads. The access token is cached in Redis for 55
// minutes so cold starts do not trigger an extra token round-trip every request.
// I use /me/player rather than recently-played so I can detect live playing state.
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
        id: string
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

    // Fetch audio features + audio analysis for tracks only
    // audio features: energy, tempo, valence, danceability, loudness (dB)
    // audio analysis: beat timestamps for real-time beat-synced visualiser
    let audioFeatures: { energy: number; tempo: number; valence: number; danceability: number; loudness: number } | null = null
    let beats: number[] | null = null
    if (!isEpisode && data.item.id) {
      const trackId = data.item.id
      try {
        const afRes = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (afRes.ok) {
          const af = await afRes.json() as { energy: number; tempo: number; valence: number; danceability: number; loudness: number }
          audioFeatures = { energy: af.energy, tempo: af.tempo, valence: af.valence, danceability: af.danceability, loudness: af.loudness }
        }
      } catch {}

      // Beat timestamps are static per track so cache indefinitely (24h) by track ID
      try {
        const cacheKey = `spotify:beats:${trackId}`
        const cached = redis ? await redis.get<number[]>(cacheKey) : null
        if (cached) {
          beats = cached
        } else {
          const aaRes = await fetch(`https://api.spotify.com/v1/audio-analysis/${trackId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (aaRes.ok) {
            const aa = await aaRes.json() as { beats: { start: number; confidence: number }[] }
            beats = aa.beats.filter((b) => b.confidence > 0.3).map((b) => b.start)
            if (redis) await redis.set(cacheKey, beats, { ex: 86400 })
          }
        }
      } catch {}
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
        progressMs: data.progress_ms ?? 0,
        durationMs: data.item.duration_ms,
        device: data.device?.name ?? null,
        audioFeatures,
        beats,
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
