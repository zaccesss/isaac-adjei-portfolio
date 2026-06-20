"use client"

import { useEffect, useState } from "react"
import { SiSpotify } from "react-icons/si"

type Track = {
  rank: number; id: string; name: string; artist: string
  albumArt: string | null; url: string | null; popularity: number
  energy?: number; valence?: number; tempo?: number; danceability?: number
}
type Artist = {
  rank: number; name: string; genres: string[]
  image: string | null; url: string | null; popularity: number
}

const TABS = ["tracks", "artists", "genres"] as const
type Tab = typeof TABS[number]

const BAR_COLOURS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#06b6d4", "#f97316", "#84cc16", "#e879f9", "#14b8a6",
]

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40">
      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-mono font-semibold">{value}</span>
    </div>
  )
}

export default function SpotifyAnalytics() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [hovered, setHovered] = useState<Track | null>(null)
  const [tab, setTab] = useState<Tab>("tracks")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/spotify-top")
      .then((r) => r.ok ? r.json() : { tracks: [], artists: [] })
      .then((d) => { setTracks(d.tracks ?? []); setArtists(d.artists ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const tracksWithFeatures = tracks.filter((t) => t.energy != null && t.valence != null)

  const avgEnergy = tracksWithFeatures.length
    ? (tracksWithFeatures.reduce((s, t) => s + (t.energy ?? 0), 0) / tracksWithFeatures.length)
    : null
  const avgValence = tracksWithFeatures.length
    ? (tracksWithFeatures.reduce((s, t) => s + (t.valence ?? 0), 0) / tracksWithFeatures.length)
    : null
  const avgTempo = tracksWithFeatures.length
    ? (tracksWithFeatures.reduce((s, t) => s + (t.tempo ?? 0), 0) / tracksWithFeatures.length)
    : null
  const avgDance = tracksWithFeatures.filter((t) => t.danceability != null).length
    ? (tracksWithFeatures.reduce((s, t) => s + (t.danceability ?? 0), 0) / tracksWithFeatures.length)
    : null

  const genreMap: Record<string, number> = {}
  for (const a of artists) {
    for (const g of a.genres) {
      genreMap[g] = (genreMap[g] ?? 0) + 1
    }
  }
  const genres = Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
  const maxGenreCount = genres[0]?.[1] ?? 1

  const PAD = 20
  const W = 240
  const H = 180

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
          {tracks.length > 0 && (
            <div className="grid grid-cols-10 gap-0.5 rounded-lg overflow-hidden h-14">
              {tracks.slice(0, 20).map((t) =>
                t.albumArt ? (
                  <img key={t.id} src={t.albumArt} alt="" className="w-full h-full object-cover" title={t.name} />
                ) : (
                  <div key={t.id} className="w-full h-full bg-muted" />
                )
              )}
            </div>
          )}
          {avgEnergy !== null && (
            <div className="flex gap-2 flex-wrap">
              <StatPill label="energy" value={`${Math.round(avgEnergy * 100)}%`} />
              <StatPill label="mood" value={avgValence! > 0.6 ? "happy" : avgValence! > 0.4 ? "neutral" : "dark"} />
              <StatPill label="tempo" value={`${Math.round(avgTempo!)} bpm`} />
              {avgDance !== null && <StatPill label="dance" value={`${Math.round(avgDance * 100)}%`} />}
            </div>
          )}
          <div className="flex gap-6 items-start flex-wrap">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              {tracks.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : tracks.map((t) => (
                <a
                  key={t.id}
                  href={t.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1 transition-colors"
                  onMouseEnter={() => setHovered(t)}
                  onMouseLeave={() => setHovered(null)}
                >
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
                  <div className="w-12 h-1 bg-muted rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${t.popularity}%` }} />
                  </div>
                </a>
              ))}
            </div>

            {tracksWithFeatures.length > 1 && (
              <div className="shrink-0 space-y-1">
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest text-center">energy vs mood</p>
                <svg width={W} height={H} className="overflow-visible">
                  <line x1={PAD + (W - PAD * 2) / 2} y1={PAD} x2={PAD + (W - PAD * 2) / 2} y2={H - PAD} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 3" />
                  <line x1={PAD} y1={PAD + (H - PAD * 2) / 2} x2={W - PAD} y2={PAD + (H - PAD * 2) / 2} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 3" />
                  <text x={PAD} y={H - 4} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace">dark</text>
                  <text x={W - PAD} y={H - 4} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace" textAnchor="end">happy</text>
                  <text x={4} y={PAD + 4} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace">hype</text>
                  <text x={4} y={H - PAD} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace">chill</text>
                  {tracksWithFeatures.map((t) => {
                    const cx = PAD + (t.valence! * (W - PAD * 2))
                    const cy = PAD + ((1 - t.energy!) * (H - PAD * 2))
                    const isHov = hovered?.id === t.id
                    return (
                      <g key={t.id}>
                        <circle cx={cx} cy={cy} r={isHov ? 6 : 4} fill="hsl(var(--primary))" opacity={isHov ? 1 : 0.65} className="cursor-pointer transition-all" onMouseEnter={() => setHovered(t)} onMouseLeave={() => setHovered(null)} />
                        {isHov && (
                          <g>
                            <rect x={cx + 8} y={cy - 14} width={Math.min(t.name.length * 5.5, 100)} height={22} rx={3} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
                            <text x={cx + 12} y={cy - 4} fontSize={8} fill="hsl(var(--foreground))" fontFamily="monospace" fontWeight="600">{t.name.slice(0, 18)}</text>
                            <text x={cx + 12} y={cy + 5} fontSize={7} fill="hsl(var(--muted-foreground))" fontFamily="monospace">{t.artist.slice(0, 16)}</text>
                          </g>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>
            )}
          </div>
        </div>
      ) : tab === "artists" ? (
        <div className="space-y-3">
          {artists.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {artists.map((a) => (
                a.image ? (
                  <img key={a.rank} src={a.image} alt={a.name} title={a.name} className="w-8 h-8 rounded-full object-cover border border-border/40" />
                ) : (
                  <div key={a.rank} className="w-8 h-8 rounded-full bg-muted border border-border/40" />
                )
              ))}
            </div>
          )}
          <div className="space-y-1.5">
          {artists.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : artists.map((a) => (
            <a
              key={a.rank}
              href={a.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1 transition-colors"
            >
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
              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-primary/60 rounded-full" style={{ width: `${a.popularity}%` }} />
              </div>
            </a>
          ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {genres.length === 0 ? (
            <p className="text-xs text-muted-foreground">No genre data yet</p>
          ) : (
            <>
              <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">genre breakdown from top 15 artists</p>
              <div className="space-y-1.5">
                {genres.map(([genre, count], i) => (
                  <div key={genre} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground/60 w-28 truncate shrink-0">{genre}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(count / maxGenreCount) * 100}%`, backgroundColor: BAR_COLOURS[i % BAR_COLOURS.length] }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground/60 w-3 text-right shrink-0">{count}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap pt-1">
                {genres.slice(0, 5).map(([genre], i) => (
                  <span key={genre} className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ borderColor: BAR_COLOURS[i % BAR_COLOURS.length] + "66", color: BAR_COLOURS[i % BAR_COLOURS.length] }}>
                    {genre}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
