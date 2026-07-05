// Aggregates my stored Spotify plays (listening_history) for the private music analytics page: totals,
// top tracks and artists by real play count, active hours and weekdays, recent plays. Everything is
// bucketed in London time. Auth-guarded, so only I can see it.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

type Row = {
  played_at: string
  track_name: string
  artist_name: string
  album_art: string | null
  url: string | null
  duration_ms: number | null
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  // Page through every play (PostgREST caps a select at 1000 rows).
  const rows: Row[] = []
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase
      .from("listening_history")
      .select("played_at,track_name,artist_name,album_art,url,duration_ms")
      .order("played_at", { ascending: false })
      .range(from, from + 999)
    if (!data || data.length === 0) break
    rows.push(...(data as Row[]))
    if (data.length < 1000) break
  }

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
      recent,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
