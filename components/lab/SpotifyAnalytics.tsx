"use client"

import { useEffect, useState } from "react"
import { SiSpotify } from "react-icons/si"
import { BarChart, PieChart } from "@/components/analytics"

type Track = {
  rank: number; id: string; name: string; artist: string
  albumArt: string | null; url: string | null; duration_ms: number
  releaseDate?: string | null; popularity?: number | null
}
type Artist = {
  rank: number; name: string; genres: string[]
  image: string | null; url: string | null; followers: number; followersPct: number
  popularity?: number | null
}
type GenreDatum = { genre: string; value: number }
type Era = { decade: string; count: number }

const TABS = ["tracks", "artists", "genres"] as const
type Tab = typeof TABS[number]

// Fixed vibrant palette - mid-tone colours that read on both light and dark cards
const BAR_COLOURS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#06b6d4", "#f97316", "#84cc16", "#e879f9", "#14b8a6",
]

function formatMs(ms: number): string {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`
}

function abbrevFollowers(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`
}

// My genre split and listening era now render with the shared recharts PieChart / BarChart, so they
// match the rest of my analytics and give proper hover detail.

export default function SpotifyAnalytics() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [genreData, setGenreData] = useState<GenreDatum[]>([])
  const [eras, setEras] = useState<Era[]>([])
  const [tab, setTab] = useState<Tab>("tracks")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/spotify-top")
      .then((r) => (r.ok ? r.json() : { tracks: [], artists: [], genres: [], eras: [] }))
      .then((d) => {
        setTracks(d.tracks ?? [])
        setArtists(d.artists ?? [])
        setGenreData(d.genres ?? [])
        setEras(d.eras ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const maxDuration = Math.max(1, ...tracks.map((t) => t.duration_ms))
  const top10Tracks = tracks.slice(0, 10)

  // Genre breakdown - prefer the API's rank-weighted aggregate, fall back to a per-artist count
  const genres: [string, number][] = genreData.length
    ? genreData.map((g) => [g.genre, g.value])
    : Object.entries(
        artists.reduce((m, a) => {
          for (const g of a.genres) m[g] = (m[g] ?? 0) + 1
          return m
        }, {} as Record<string, number>),
      ).sort((a, b) => b[1] - a[1]).slice(0, 12)
  const maxGenre = Math.max(...genres.map(([, v]) => v), 0.0001)

  // Underground -> mainstream spectrum: position each artist by audience size on a log scale
  const logF = (f: number) => Math.log10(Math.max(10, f))
  const fVals = artists.map((a) => logF(a.followers))
  const minLogF = Math.min(...fVals, 1)
  const maxLogF = Math.max(...fVals, minLogF + 0.0001)
  const spectrumX = (f: number) => ((logF(f) - minLogF) / (maxLogF - minLogF)) * 100

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SiSpotify className="h-3 w-3 text-muted-foreground shrink-0" />
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">my top picks</p>
        </div>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button type="button" key={t} onClick={() => setTab(t)} className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-muted/60 rounded animate-pulse" />)}</div>
      ) : tab === "tracks" ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            {tracks.length === 0 ? (
              <p className="text-xs text-muted-foreground">I am not tracking any plays yet</p>
            ) : tracks.map((t) => (
              <a key={t.id} href={t.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1 transition-colors">
                <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{t.rank}</span>
                {t.albumArt ? (
                  <img src={t.albumArt} alt="" className="w-7 h-7 rounded shrink-0 object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-medium truncate leading-tight group-hover:text-foreground transition-colors">{t.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/60 truncate">{t.artist}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">{formatMs(t.duration_ms)}</span>
              </a>
            ))}
          </div>

          {/* Duration bars */}
          {top10Tracks.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">my longest tracks · top 10</p>
                <p className="text-[9px] font-mono text-muted-foreground/40">bar width = track length (my longest = 100%)</p>
              </div>
              {top10Tracks.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{t.rank}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((t.duration_ms / maxDuration) * 100)}%`, backgroundColor: BAR_COLOURS[i % BAR_COLOURS.length] }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/60 w-8 text-right shrink-0">{formatMs(t.duration_ms)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Listening era from all-time top tracks */}
          {eras.length > 1 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">my listening era · all-time tracks by decade</p>
              <BarChart data={eras.map((e) => ({ name: e.decade, value: e.count }))} dataKey="value" xKey="name" height={110} colour={BAR_COLOURS[0]} valueFormatter={(v) => `${v} tracks`} />
            </div>
          )}
        </div>
      ) : tab === "artists" ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            {artists.length === 0 ? (
              <p className="text-xs text-muted-foreground">I am not tracking any artists yet</p>
            ) : artists.map((a) => (
              <a key={a.rank} href={a.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1 transition-colors">
                <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{a.rank}</span>
                {a.image ? (
                  <img src={a.image} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-medium truncate leading-tight group-hover:text-foreground transition-colors">{a.name}</p>
                  {a.genres.length > 0 && <p className="text-[10px] font-mono text-muted-foreground/60 truncate">{a.genres.join(" · ")}</p>}
                </div>
                {a.followers > 0 && <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">{abbrevFollowers(a.followers)}</span>}
              </a>
            ))}
          </div>

          {/* Underground -> mainstream spectrum */}
          {artists.length > 2 && (
            <div className="space-y-1.5 pt-1 border-t border-border/40">
              <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">how mainstream are my artists</p>
              <div className="relative h-16">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/60" />
                {artists.map((a, i) => (
                  <div
                    key={a.rank}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${spectrumX(a.followers)}%`, top: `calc(50% + ${(i % 3 - 1) * 13}px)` }}
                    title={`#${a.rank} ${a.name} · ${abbrevFollowers(a.followers)} followers`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full ring-2 ring-card" style={{ backgroundColor: BAR_COLOURS[i % BAR_COLOURS.length] }} />
                  </div>
                ))}
                <span className="absolute left-0 bottom-0 text-[8px] font-mono text-muted-foreground/60">underground</span>
                <span className="absolute right-0 bottom-0 text-[8px] font-mono text-muted-foreground/60">mainstream</span>
              </div>
            </div>
          )}

          {/* Follower bars */}
          {artists.slice(0, 10).some((a) => a.followers > 0) && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">followers · top 10</p>
                <p className="text-[9px] font-mono text-muted-foreground/40">bar width = follower count (biggest = 100%)</p>
              </div>
              {artists.slice(0, 10).map((a, i) => (
                <div key={a.rank} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{a.rank}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${a.followersPct}%`, backgroundColor: BAR_COLOURS[i % BAR_COLOURS.length] }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/60 w-8 text-right shrink-0">{a.followersPct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {genres.length === 0 ? (
            <p className="text-xs text-muted-foreground">No genre data yet - I pull genres from my top artists via Last.fm</p>
          ) : (
            <>
              <div className="flex gap-4 items-center flex-wrap justify-center sm:justify-start">
                <div className="w-[170px] shrink-0"><PieChart data={genres.slice(0, 8).map(([genre, value], i) => ({ name: genre, value, colour: BAR_COLOURS[i % BAR_COLOURS.length] }))} height={170} valueFormatter={(v) => `${Math.round(v)}`} /></div>
                <div className="flex-1 min-w-[180px] space-y-1.5">
                  {genres.slice(0, 8).map(([genre, value], i) => (
                    <div key={genre} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground/70 w-24 truncate shrink-0">{genre}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(value / maxGenre) * 100}%`, backgroundColor: BAR_COLOURS[i % BAR_COLOURS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground/40">rank-weighted across my top artists - higher picks and stronger tags count for more</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
