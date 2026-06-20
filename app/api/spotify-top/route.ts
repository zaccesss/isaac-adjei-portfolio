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

export const revalidate = 0

export async function GET() {
  try {
    const token = await getAccessToken()
    if (!token) return NextResponse.json({ tracks: [], artists: [] })

    const headers = { Authorization: `Bearer ${token}` }

    const [tracksRes, artistsRes, showsRes] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20", { headers }),
      fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=20", { headers }),
      fetch("https://api.spotify.com/v1/me/shows?limit=50", { headers }),
    ])

    if (!tracksRes.ok && !artistsRes.ok) return NextResponse.json({ tracks: [], artists: [], shows: [] })

    const tracksData = tracksRes.ok ? (await tracksRes.json() as { items: any[] }) : { items: [] }
    const artistsData = artistsRes.ok ? (await artistsRes.json() as { items: any[] }) : { items: [] }
    const showsData = showsRes?.ok ? (await showsRes.json() as { items: { added_at: string; show: any }[] }) : { items: [] }

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

    // Batch-fetch full artist objects — me/top/artists often returns empty genres
    // and popularity=0; the /v1/artists endpoint is the authoritative source
    const artistIds = artistsData.items.map((a: any) => a.id).filter(Boolean).join(",")
    const artistDetail: Record<string, { genres: string[]; followers: number }> = {}
    if (artistIds) {
      try {
        const arRes = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds}`, { headers })
        if (arRes.ok) {
          const ar = await arRes.json() as { artists: any[] }
          for (const a of ar.artists ?? []) {
            if (a?.id) artistDetail[a.id] = { genres: a.genres ?? [], followers: a.followers?.total ?? 0 }
          }
        }
      } catch {}
    }

    const artists = artistsData.items.map((a: any, i: number) => {
      const detail = artistDetail[a.id]
      return {
        rank: i + 1,
        id: a.id,
        name: a.name,
        genres: detail?.genres?.length ? detail.genres : (a.genres ?? []),
        image: a.images?.[2]?.url ?? a.images?.[0]?.url ?? null,
        url: a.external_urls?.spotify ?? null,
        followers: detail?.followers ?? a.followers?.total ?? 0,
      }
    })

    const shows = showsData.items.map((item: { added_at: string; show: any }) => {
      const s = item.show
      return {
        id: s.id,
        name: s.name,
        publisher: s.publisher ?? null,
        description: s.description ? s.description.replace(/<[^>]*>/g, "").slice(0, 120) : null,
        image: s.images?.[0]?.url ?? null,
        totalEpisodes: s.total_episodes ?? 0,
        explicit: s.explicit ?? false,
        url: s.external_urls?.spotify ?? null,
        addedAt: item.added_at,
      }
    })

    return NextResponse.json({ tracks, artists, shows })
  } catch {
    return NextResponse.json({ tracks: [], artists: [], shows: [] })
  }
}
