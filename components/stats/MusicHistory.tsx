"use client"

// Historical listening charts for /stats/music, fed by /api/stats/music-history - a daily play
// count calendar and an hour-of-day radial clock. Sits above SpotifyAnalytics' own top tracks,
// artists and genres, which already covers the top-picks side of the story.
import { useEffect, useState } from "react"
import { CalendarHeatmap, RadialClock, Treemap, BarChart, WordCloud, useAnalyticsPeriod } from "@/components/analytics"
import { Music2 } from "lucide-react"

type MusicHistoryData = { totalPlays: number; daily: { date: string; count: number }[]; hourly: number[] }
type GenreDatum = { genre: string; value: number }
type EraDatum = { decade: string; count: number }
type ArtistDatum = { rank: number; name: string }

export default function MusicHistory() {
  const { period } = useAnalyticsPeriod()
  // Stores which period the result belongs to so loading can be derived without a sync setState,
  // matching WakatimeStats' own established pattern for this exact class of lint constraint.
  const [result, setResult] = useState<{ period: typeof period; data: MusicHistoryData | null } | null>(null)
  const loading = result === null || result.period !== period
  const data = result?.period === period ? result.data : null
  const [genres, setGenres] = useState<GenreDatum[] | null>(null)
  const [eras, setEras] = useState<EraDatum[] | null>(null)
  const [artists, setArtists] = useState<ArtistDatum[] | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`/api/stats/music-history?period=${period}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setResult({ period, data: d }))
      .catch(() => { if (!ctrl.signal.aborted) setResult({ period, data: null }) })
    return () => ctrl.abort()
  }, [period])

  useEffect(() => {
    fetch("/api/spotify-top")
      .then((r) => (r.ok ? r.json() : { genres: [], eras: [], artists: [] }))
      .then((d) => {
        setGenres(d.genres ?? [])
        setEras(d.eras ?? [])
        setArtists(d.artists ?? [])
      })
      .catch(() => { setGenres([]); setEras([]); setArtists([]) })
  }, [])

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Listening history</span>
        </div>
        {data && <span className="text-xs text-muted-foreground">{data.totalPlays.toLocaleString()} plays</span>}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-32 bg-muted/60 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && !data && (
        <p className="text-xs text-muted-foreground font-mono">could not load listening history right now</p>
      )}

      {!loading && data && (
        <>
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">daily plays</p>
            <CalendarHeatmap
              data={data.daily.map((d) => ({ date: d.date, value: d.count }))}
              valueLabel="plays"
              height={140}
              cellSize={10}
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">by hour of day (London time)</p>
            <RadialClock hours={data.hourly} valueLabel="plays" height={260} />
          </div>
          {genres && genres.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">genres, rank-weighted across my top artists (not period-filtered)</p>
              <Treemap
                data={genres.map((g) => ({ name: g.genre, value: g.value }))}
                height={220}
                valueFormatter={(v) => Math.round(v).toString()}
              />
            </div>
          )}
          {artists && artists.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">top artists, Spotify&apos;s own ranking (not period-filtered)</p>
              <WordCloud
                words={artists.map((a) => ({ text: a.name, value: artists.length - a.rank + 1 }))}
                height={220}
                valueLabel="rank weight"
              />
            </div>
          )}
          {eras && eras.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">top tracks by release decade (not period-filtered)</p>
              <BarChart
                data={eras.map((e) => ({ name: e.decade, value: e.count }))}
                dataKey="value"
                xKey="name"
                height={160}
                valueFormatter={(v) => `${v} track${v === 1 ? "" : "s"}`}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
