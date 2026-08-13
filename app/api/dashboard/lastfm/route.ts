// My complete Last.fm listening record. Because I scrobble from everywhere (Spotify, my phone,
// sometimes Apple Music), Last.fm is a fuller picture than Spotify alone. Returns period-aware top
// artists, tracks and albums, plus a real listening clock and weekday pattern computed from up to
// 1000 recent scrobbles in the window and my all-time total. Reads LASTFM_USER + LASTFM_API_KEY.
import { NextResponse } from "next/server"
import { auth } from "@/auth"

const KEY = process.env.LASTFM_API_KEY
const USER = process.env.LASTFM_USER
const BASE = "https://ws.audioscrobbler.com/2.0/"

// The shared period selector -> Last.fm's period vocabulary + a cutoff for the recent-scrobble window.
const LFM_PERIOD: Record<string, string> = { "24h": "7day", "7d": "7day", "30d": "1month", "90d": "3month", "1y": "12month", all: "overall" }
const PERIOD_DAYS: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365 }

async function lfm(method: string, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ method, user: USER ?? "", api_key: KEY ?? "", format: "json", ...extra })
  const res = await fetch(`${BASE}?${params.toString()}`, { next: { revalidate: 1800 } })
  if (!res.ok) return null
  return res.json()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function img(arr: any[]): string | null {
  if (!Array.isArray(arr)) return null
  return arr.find((i) => i.size === "large")?.["#text"] || arr[arr.length - 1]?.["#text"] || null
}

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  if (!KEY || !USER) return NextResponse.json({ configured: false })

  const periodKey = new URL(req.url).searchParams.get("period") ?? "all"
  const p = LFM_PERIOD[periodKey] ?? "overall"
  const days = PERIOD_DAYS[periodKey]
  const recentParams: Record<string, string> = { limit: "1000" }
  if (days) recentParams.from = String(Math.floor((Date.now() - days * 86400000) / 1000))

  const [info, artists, tracks, albums, recent] = await Promise.all([
    lfm("user.getinfo"),
    lfm("user.gettopartists", { period: p, limit: "15" }),
    lfm("user.gettoptracks", { period: p, limit: "15" }),
    lfm("user.gettopalbums", { period: p, limit: "10" }),
    lfm("user.getrecenttracks", recentParams),
  ])

  // Real listening clock + weekday pattern from the window's scrobbles, in London time.
  const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false })
  const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short" })
  const hours = Array(24).fill(0) as number[]
  const weekdays: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const recentRaw: any[] = recent?.recenttracks?.track ?? []
  let windowPlays = 0
  for (const t of recentRaw) {
    if (!t?.date?.uts) continue
    const d = new Date(Number(t.date.uts) * 1000)
    const hr = Number(hourFmt.format(d)) % 24
    if (!Number.isNaN(hr)) hours[hr]++
    const wd = dayFmt.format(d)
    if (wd in weekdays) weekdays[wd]++
    windowPlays++
  }

  return NextResponse.json(
    {
      configured: true,
      totalScrobbles: Number(info?.user?.playcount ?? 0),
      windowPlays,
      registered: info?.user?.registered?.unixtime ? Number(info.user.registered.unixtime) * 1000 : null,
      hours,
      weekdays: Object.entries(weekdays).map(([day, count]) => ({ day, count })),
      topArtists: (artists?.topartists?.artist ?? []).map((a: any) => ({ name: a.name, playcount: Number(a.playcount), url: a.url })),
      topTracks: (tracks?.toptracks?.track ?? []).map((t: any) => ({ name: t.name, artist: t.artist?.name, playcount: Number(t.playcount), url: t.url })),
      topAlbums: (albums?.topalbums?.album ?? []).map((a: any) => ({ name: a.name, artist: a.artist?.name, playcount: Number(a.playcount), image: img(a.image), url: a.url })),
      recent: recentRaw
        .filter((t: any) => t?.name)
        .slice(0, 12)
        .map((t: any) => ({
          name: t.name,
          artist: t.artist?.["#text"] ?? "",
          image: img(t.image),
          url: t.url,
          nowPlaying: t["@attr"]?.nowplaying === "true",
          when: t.date?.uts ? Number(t.date.uts) * 1000 : null,
        })),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
