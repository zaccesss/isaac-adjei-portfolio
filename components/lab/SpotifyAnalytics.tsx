"use client"

import { useEffect, useState } from "react"
import { SiSpotify } from "react-icons/si"

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

function decadeOf(date?: string | null): string | null {
  if (!date) return null
  const y = parseInt(date.slice(0, 4), 10)
  if (Number.isNaN(y)) return null
  return `${Math.floor(y / 10) * 10}s`
}

function abbrevFollowers(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`
}

// Genre donut - rank-weighted genre shares as arc segments. The card-coloured stroke between
// slices and the foreground-coloured centre label keep it legible in light and dark mode.
function GenreDonut({ data }: { data: GenreDatum[] }) {
  const top = data.slice(0, 8)
  const total = top.reduce((s, d) => s + d.value, 0) || 1
  const R = 68, r = 40, cx = 80, cy = 80
  const pt = (rad: number, a: number) => `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`
  const arcs = top.map((d, i) => {
    // Start angle = sum of prior slices (functional, no mutated accumulator)
    const startFrac = top.slice(0, i).reduce((s, x) => s + x.value, 0) / total
    const frac = d.value / total
    const a0 = -Math.PI / 2 + startFrac * Math.PI * 2
    const a1 = a0 + frac * Math.PI * 2
    const large = frac > 0.5 ? 1 : 0
    return {
      path: `M ${pt(R, a0)} A ${R} ${R} 0 ${large} 1 ${pt(R, a1)} L ${pt(r, a1)} A ${r} ${r} 0 ${large} 0 ${pt(r, a0)} Z`,
      colour: BAR_COLOURS[i % BAR_COLOURS.length],
      genre: d.genre,
      pct: Math.round(frac * 100),
    }
  })
  return (
    <svg width={160} height={160} className="shrink-0">
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill={a.colour} opacity={0.92} stroke="hsl(var(--card))" strokeWidth={1.5}>
          <title>{`${a.genre} · ${a.pct}%`}</title>
        </path>
      ))}
      <text x={cx} y={cy - 1} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight={600} fill="hsl(var(--foreground))">
        {top[0]?.genre.slice(0, 11) ?? ""}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="hsl(var(--muted-foreground))">
        {arcs[0]?.pct ?? 0}%
      </text>
    </svg>
  )
}

export default function SpotifyAnalytics() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [genreData, setGenreData] = useState<GenreDatum[]>([])
  const [tab, setTab] = useState<Tab>("tracks")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/spotify-top")
      .then((r) => (r.ok ? r.json() : { tracks: [], artists: [], genres: [] }))
      .then((d) => {
        setTracks(d.tracks ?? [])
        setArtists(d.artists ?? [])
        setGenreData(d.genres ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const maxDuration = Math.max(1, ...tracks.map((t) => t.duration_ms))
  const top10Tracks = tracks.slice(0, 10)

  // Listening era from track release decades
  const eraMap: Record<string, number> = {}
  for (const t of tracks) {
    const dec = decadeOf(t.releaseDate)
    if (dec) eraMap[dec] = (eraMap[dec] ?? 0) + 1
  }
  const eras = Object.entries(eraMap).sort((a, b) => a[0].localeCompare(b[0]))
  const maxEra = Math.max(1, ...eras.map(([, n]) => n))

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

  // Mainstream-vs-underground scatter: x = your rank, y = artist size (followers, log scale)
  const SW = 248, SH = 150, SP = 24
  const logF = (f: number) => Math.log10(Math.max(10, f))
  const fVals = artists.map((a) => logF(a.followers))
  const minLogF = Math.min(...fVals, 1)
  const maxLogF = Math.max(...fVals, minLogF + 0.0001)
  const sx = (rank: number) => SP + ((rank - 1) / Math.max(1, artists.length - 1)) * (SW - SP * 2)
  const sy = (f: number) => SP + (1 - (logF(f) - minLogF) / (maxLogF - minLogF)) * (SH - SP * 2)

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SiSpotify className="h-3 w-3 text-muted-foreground shrink-0" />
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">top picks</p>
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
              <p className="text-xs text-muted-foreground">No data yet</p>
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
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">duration · top 10</p>
                <p className="text-[9px] font-mono text-muted-foreground/40">bar width = track length (longest = 100%)</p>
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

          {/* Listening era from release dates */}
          {eras.length > 1 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">listening era · by release decade</p>
              <div className="flex items-end gap-1.5 h-16 pt-1">
                {eras.map(([dec, n], i) => (
                  <div key={dec} className="flex-1 flex flex-col items-center gap-1 justify-end">
                    <div className="w-full rounded-t transition-all" style={{ height: `${(n / maxEra) * 100}%`, backgroundColor: BAR_COLOURS[i % BAR_COLOURS.length], minHeight: 3 }} title={`${dec}: ${n} tracks`} />
                    <span className="text-[8px] font-mono text-muted-foreground/60">{dec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : tab === "artists" ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            {artists.length === 0 ? (
              <p className="text-xs text-muted-foreground">No data yet</p>
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

          {/* Mainstream vs underground scatter */}
          {artists.length > 2 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">mainstream vs underground</p>
              <p className="text-[8px] font-mono text-muted-foreground/40">x = your rank · y = artist size (followers, log)</p>
              <svg width={SW} height={SH} className="overflow-visible max-w-full">
                <text x={2} y={SP - 6} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace">mainstream</text>
                <text x={2} y={SH - 4} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace">underground</text>
                <text x={SW} y={SH - 4} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace" textAnchor="end">#{artists.length}</text>
                <text x={SP} y={SH - 4} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace">#1</text>
                {artists.map((a, i) => (
                  <circle key={a.rank} cx={sx(a.rank)} cy={sy(a.followers)} r={4} fill={BAR_COLOURS[i % BAR_COLOURS.length]} opacity={0.75}>
                    <title>{`#${a.rank} ${a.name} · ${abbrevFollowers(a.followers)} followers`}</title>
                  </circle>
                ))}
              </svg>
            </div>
          )}

          {/* Follower bars */}
          {artists.slice(0, 10).some((a) => a.followers > 0) && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">followers · top 10</p>
                <p className="text-[9px] font-mono text-muted-foreground/40">bar width = follower count (most = 100%)</p>
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
            <p className="text-xs text-muted-foreground">No genre data yet - genres are pulled from your top artists via Last.fm</p>
          ) : (
            <>
              <div className="flex gap-4 items-center flex-wrap justify-center sm:justify-start">
                <GenreDonut data={genres.map(([genre, value]) => ({ genre, value }))} />
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
              <p className="text-[9px] font-mono text-muted-foreground/40">rank-weighted across your top artists - higher picks and stronger tags count for more</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
