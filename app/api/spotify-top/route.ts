import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
}

async function getAccessToken(): Promise<string | null> {
  const { SPOTIFY_CLIENT_ID: cid, SPOTIFY_CLIENT_SECRET: sec, SPOTIFY_REFRESH_TOKEN: rt } = process.env
  if (!cid || !sec || !rt) return null
  if (redis) {
    const cached = await redis.get<string>("spotify:access_token:top")
    if (cached) return cached
  }
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${cid}:${sec}`).toString("base64")}` },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: rt }),
  })
  if (!res.ok) return null
  const data = await res.json() as { access_token: string; expires_in: number }
  if (redis) await redis.set("spotify:access_token:top", data.access_token, { ex: 3300 })
  return data.access_token
}

export const revalidate = 3600

export async function GET() {
  try {
    const token = await getAccessToken()
    if (!token) return NextResponse.json({ tracks: [], artists: [] })

    const headers = { Authorization: `Bearer ${token}` }

    const [tracksRes, artistsRes] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20", { headers }),
      fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=15", { headers }),
    ])

    if (!tracksRes.ok && !artistsRes.ok) return NextResponse.json({ tracks: [], artists: [] })

    const tracksData = tracksRes.ok ? (await tracksRes.json() as { items: any[] }) : { items: [] }
    const artistsData = artistsRes.ok ? (await artistsRes.json() as { items: any[] }) : { items: [] }

    const trackIds = tracksData.items.map((t: any) => t.id).filter(Boolean).join(",")
    let audioFeatures: Record<string, { energy: number; valence: number; tempo: number; danceability: number }> = {}

    if (trackIds) {
      try {
        const afRes = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, { headers })
        if (afRes.ok) {
          const af = await afRes.json() as { audio_features: any[] }
          for (const f of af.audio_features ?? []) {
            if (f?.id) audioFeatures[f.id] = { energy: f.energy, valence: f.valence, tempo: f.tempo, danceability: f.danceability }
          }
        }
      } catch {}
    }

    const tracks = tracksData.items.map((t: any, i: number) => ({
      rank: i + 1,
      id: t.id,
      name: t.name,
      artist: t.artists?.map((a: any) => a.name).join(", ") ?? "",
      albumArt: t.album?.images?.[2]?.url ?? t.album?.images?.[0]?.url ?? null,
      url: t.external_urls?.spotify ?? null,
      popularity: t.popularity ?? 0,
      ...(audioFeatures[t.id] ?? {}),
    }))

    const artists = artistsData.items.map((a: any, i: number) => ({
      rank: i + 1,
      name: a.name,
      genres: (a.genres ?? []).slice(0, 2),
      image: a.images?.[2]?.url ?? a.images?.[0]?.url ?? null,
      url: a.external_urls?.spotify ?? null,
      popularity: a.popularity ?? 0,
    }))

    return NextResponse.json({ tracks, artists })
  } catch {
    return NextResponse.json({ tracks: [], artists: [] })
  }
}
