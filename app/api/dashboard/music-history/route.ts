// Aggregates my stored Spotify plays (listening_history) for the private music analytics page: totals,
// top tracks and artists by real play count, active hours and weekdays, recent plays. Everything is
// bucketed in London time. Auth-guarded, so only I can see it.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { getTagsForArtists } from "@/lib/lastfm"

export const dynamic = "force-dynamic"

type Row = {
  played_at: string
  track_name: string
  artist_name: string
  album_art: string | null
  url: string | null
  duration_ms: number | null
}

const PERIOD_DAYS: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365 }

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const windowDays = PERIOD_DAYS[new URL(req.url).searchParams.get("period") ?? "all"]
  const cutoff = windowDays ? new Date(Date.now() - windowDays * 86400000).toISOString() : null

  // Page through the plays in the window (PostgREST caps a select at 1000 rows), fetched in
  // parallel - a count query then one burst of range() calls - rather than one page at a time.
  const countQuery = supabase.from("listening_history").select("id", { count: "exact", head: true })
  const { count } = await (cutoff ? countQuery.gte("played_at", cutoff) : countQuery)
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / 1000))
  const pages = await Promise.all(
    Array.from({ length: totalPages }, (_, i) => {
      let query = supabase
        .from("listening_history")
        .select("played_at,track_name,artist_name,album_art,url,duration_ms")
      if (cutoff) query = query.gte("played_at", cutoff)
      return query.order("played_at", { ascending: false }).range(i * 1000, i * 1000 + 999)
    })
  )
  const rows: Row[] = pages.flatMap((p) => (p.data as Row[] | null) ?? [])

  if (rows.length === 0) {
    return NextResponse.json({ empty: true, totalPlays: 0 }, { headers: { "Cache-Control": "no-store" } })
  }

  const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false })
  const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short" })

  const hours = Array(24).fill(0) as number[]
  const weekdays: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
  const trackCounts = new Map<string, { name: string; artist: string; art: string | null; url: string | null; count: number }>()
  const artistCounts = new Map<string, { artist: string; art: string | null; count: number }>()
  const days = new Set<string>()
  let totalMs = 0

  for (const r of rows) {
    const d = new Date(r.played_at)
    const h = Number(hourFmt.format(d)) % 24
    if (!Number.isNaN(h)) hours[h]++
    const wd = dayFmt.format(d)
    if (wd in weekdays) weekdays[wd]++
    const tKey = `${r.track_name}|${r.artist_name}`
    const t = trackCounts.get(tKey) ?? { name: r.track_name, artist: r.artist_name, art: r.album_art, url: r.url, count: 0 }
    t.count++
    trackCounts.set(tKey, t)
    const a = artistCounts.get(r.artist_name) ?? { artist: r.artist_name, art: r.album_art, count: 0 }
    a.count++
    artistCounts.set(r.artist_name, a)
    totalMs += r.duration_ms ?? 0
    days.add(d.toLocaleDateString("en-CA", { timeZone: "Europe/London" }))
  }

  const topTracks = [...trackCounts.values()].sort((a, b) => b.count - a.count).slice(0, 15)
  const topArtists = [...artistCounts.values()].sort((a, b) => b.count - a.count).slice(0, 15)
  const recent = rows.slice(0, 24).map((r) => ({ name: r.track_name, artist: r.artist_name, art: r.album_art, url: r.url, playedAt: r.played_at }))

  // Time-of-day -> genre flow, for the Sankey on the music page. Capped at the 60 most-played
  // artists (not every unique artist ever played) so a long "all" window can't fan out into
  // hundreds of parallel Last.fm lookups on a cold cache - play counts follow a power law, so the
  // top 60 already covers the overwhelming majority of actual plays. Each artist contributes only
  // its single top tag (Last.fm's own top pick), so one play is never counted into multiple genres.
  const genreArtistNames = [...artistCounts.values()].sort((a, b) => b.count - a.count).slice(0, 60).map((a) => a.artist)
  const tagsByArtist = await getTagsForArtists(genreArtistNames)
  const hourGenreCounts = new Map<string, number>()
  for (const r of rows) {
    const genre = tagsByArtist[r.artist_name]?.[0]?.name
    if (!genre) continue
    const h = Number(hourFmt.format(new Date(r.played_at))) % 24
    if (Number.isNaN(h)) continue
    const bucket = h >= 5 && h < 12 ? "Morning" : h >= 12 && h < 17 ? "Afternoon" : h >= 17 && h < 22 ? "Evening" : "Night"
    const key = `${bucket}|${genre}`
    hourGenreCounts.set(key, (hourGenreCounts.get(key) ?? 0) + 1)
  }
  const hourGenreFlow = [...hourGenreCounts.entries()].map(([key, count]) => {
    const [bucket, genre] = key.split("|")
    return { bucket, genre, count }
  })

  return NextResponse.json(
    {
      empty: false,
      totalPlays: rows.length,
      uniqueTracks: trackCounts.size,
      uniqueArtists: artistCounts.size,
      totalMinutes: Math.round(totalMs / 60000),
      activeDays: days.size,
      firstPlay: rows[rows.length - 1].played_at,
      hours,
      weekdays: Object.entries(weekdays).map(([day, count]) => ({ day, count })),
      topTracks,
      topArtists,
      hourGenreFlow,
      recent,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
