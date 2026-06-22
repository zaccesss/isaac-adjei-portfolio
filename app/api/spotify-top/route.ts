import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { getTagsForArtists, aggregateGenres } from "@/lib/lastfm"

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
    if (!token) return NextResponse.json({ tracks: [], artists: [], shows: [], genres: [], eras: [] })

    const headers = { Authorization: `Bearer ${token}` }

    const [tracksRes, artistsRes, showsRes, eraRes] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20", { headers }),
      fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=20", { headers }),
      fetch("https://api.spotify.com/v1/me/shows?limit=50", { headers }),
      // All-time top tracks purely for the era chart, so the decade spread is real rather
      // than just whatever I have been playing this month
      fetch("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50", { headers }),
    ])

    if (!tracksRes.ok && !artistsRes.ok) return NextResponse.json({ tracks: [], artists: [], shows: [], genres: [], eras: [] })

    const tracksData = tracksRes.ok ? (await tracksRes.json() as { items: any[] }) : { items: [] }
    const artistsData = artistsRes.ok ? (await artistsRes.json() as { items: any[] }) : { items: [] }
    const showsData = showsRes?.ok ? (await showsRes.json() as { items: { added_at: string; show: any }[] }) : { items: [] }

    const artistIds = artistsData.items.map((a: any) => a.id).filter(Boolean).join(",")

    // Spotify deprecated audio-features (Nov 2024) and artist genres (Mar 2025). I no longer
    // fetch audio-features at all (they 403 + burned CPU), and genres now come from Last.fm
    // below. I still fetch artist details for accurate follower counts.
    const artistFollowers: Record<string, number> = {}
    if (artistIds) {
      await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds}`, { headers })
        .then(r => r.ok ? r.json() : null)
        .then((ad: { artists: any[] } | null) => {
          for (const a of ad?.artists ?? []) {
            if (a?.id) artistFollowers[a.id] = a.followers?.total ?? 0
          }
        }).catch(() => {})
    }

    // Genres via Last.fm top tags per artist (each cached in Redis for 7 days)
    const artistNames = artistsData.items.map((a: any) => a.name).filter(Boolean)
    const tagsByName = await getTagsForArtists(artistNames)

    const tracks = tracksData.items.map((t: any, i: number) => ({
      rank: i + 1,
      id: t.id,
      name: t.name,
      artist: t.artists?.map((a: any) => a.name).join(", ") ?? "",
      albumArt: t.album?.images?.[2]?.url ?? t.album?.images?.[0]?.url ?? null,
      url: t.external_urls?.spotify ?? null,
      duration_ms: t.duration_ms ?? 0,
      releaseDate: t.album?.release_date ?? null,
      popularity: t.popularity ?? null,
    }))

    const maxFollowers = Math.max(1, ...Object.values(artistFollowers))

    const artists = artistsData.items.map((a: any, i: number) => ({
      rank: i + 1,
      name: a.name,
      genres: (tagsByName[a.name] ?? []).map((t) => t.name),
      image: a.images?.[2]?.url ?? a.images?.[0]?.url ?? null,
      url: a.external_urls?.spotify ?? null,
      followers: artistFollowers[a.id] ?? 0,
      followersPct: Math.round(((artistFollowers[a.id] ?? 0) / maxFollowers) * 100),
      popularity: a.popularity ?? null,
    }))

    // Aggregated genre breakdown (rank-weighted) for the donut / treemap
    const genres = aggregateGenres(
      artistsData.items.map((a: any, i: number) => ({ rank: i + 1, tags: tagsByName[a.name] ?? [] })),
    ).slice(0, 12)

    // Listening era: bucket all-time top tracks by release decade
    const eraData = eraRes?.ok ? (await eraRes.json() as { items: any[] }) : { items: [] }
    const eraMap: Record<string, number> = {}
    for (const t of eraData.items) {
      const d: string | undefined = t.album?.release_date
      if (!d) continue
      const y = parseInt(d.slice(0, 4), 10)
      if (Number.isNaN(y)) continue
      const dec = `${Math.floor(y / 10) * 10}s`
      eraMap[dec] = (eraMap[dec] ?? 0) + 1
    }
    const eras = Object.entries(eraMap)
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade))

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

    return NextResponse.json({ tracks, artists, shows, genres, eras })
  } catch {
    return NextResponse.json({ tracks: [], artists: [], shows: [], genres: [], eras: [] })
  }
}
