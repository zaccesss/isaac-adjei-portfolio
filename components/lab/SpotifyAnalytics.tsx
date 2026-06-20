"use client"

import { useEffect, useState } from "react"
import { SiSpotify } from "react-icons/si"

type Track = {
  rank: number; id: string; name: string; artist: string
  albumArt: string | null; url: string | null; duration_ms: number
  energy?: number; valence?: number; tempo?: number; danceability?: number
}
type Artist = {
  rank: number; name: string; genres: string[]
  image: string | null; url: string | null; followers: number; followersPct: number
}

const TABS = ["tracks", "artists", "genres"] as const
type Tab = typeof TABS[number]

const BAR_COLOURS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#06b6d4", "#f97316", "#84cc16", "#e879f9", "#14b8a6",
]

function formatMs(ms: number): string {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`
}

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
    ? tracksWithFeatures.reduce((s, t) => s + (t.energy ?? 0), 0) / tracksWithFeatures.length
    : null
  const avgValence = tracksWithFeatures.length
    ? tracksWithFeatures.reduce((s, t) => s + (t.valence ?? 0), 0) / tracksWithFeatures.length
    : null
  const avgTempo = tracksWithFeatures.length
    ? tracksWithFeatures.reduce((s, t) => s + (t.tempo ?? 0), 0) / tracksWithFeatures.length
    : null
  const avgDance = tracksWithFeatures.length
    ? tracksWithFeatures.reduce((s, t) => s + (t.danceability ?? 0), 0) / tracksWithFeatures.length
    : null

  // Normalise track durations so the longest track = 100%
  const maxDuration = Math.max(1, ...tracks.map(t => t.duration_ms))
  const top10Tracks = tracks.slice(0, 10)

  const genreMap: Record<string, number> = {}
  for (const a of artists) {
    for (const g of a.genres) genreMap[g] = (genreMap[g] ?? 0) + 1
  }
  const genres = Object.entries(genreMap).sort((a, b) => b[1] - a[1]).slice(0, 12)
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
          {/* Track list first */}
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
                  <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">{formatMs(t.duration_ms)}</span>
                </a>
              ))}
            </div>

            {/* Scatter plot - only when Spotify returns audio features */}
            {tracksWithFeatures.length > 1 && (
              <div className="shrink-0 space-y-1">
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest text-center">energy vs mood</p>
                <p className="text-[8px] font-mono text-muted-foreground/40 text-center">x = mood (dark → happy) · y = energy (chill → hype)</p>
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

          {/* Stat pills when audio features available */}
          {avgEnergy !== null && (
            <div className="flex gap-2 flex-wrap">
              <StatPill label="avg energy" value={`${Math.round(avgEnergy * 100)}%`} />
              <StatPill label="mood" value={avgValence! > 0.6 ? "happy" : avgValence! > 0.4 ? "neutral" : "dark"} />
              <StatPill label="avg tempo" value={`${Math.round(avgTempo!)} bpm`} />
              {avgDance !== null && <StatPill label="danceability" value={`${Math.round(avgDance * 100)}%`} />}
            </div>
          )}

          {/* Duration bars below the list */}
          {top10Tracks.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">duration · top 10</p>
                <p className="text-[9px] font-mono text-muted-foreground/40">bar width = track duration (longest = 100%)</p>
              </div>
              {top10Tracks.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{t.rank}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.round((t.duration_ms / maxDuration) * 100)}%`, backgroundColor: BAR_COLOURS[i % BAR_COLOURS.length] }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/60 w-8 text-right shrink-0">{formatMs(t.duration_ms)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === "artists" ? (
        <div className="space-y-3">
          {/* Artist list first */}
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
                {a.followers > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">
                    {a.followers >= 1_000_000 ? `${(a.followers / 1_000_000).toFixed(1)}M` : `${Math.round(a.followers / 1000)}K`}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Follower bars below the list */}
          {artists.slice(0, 10).some(a => a.followers > 0) && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">followers · top 10</p>
                <p className="text-[9px] font-mono text-muted-foreground/40">bar width = follower count (most = 100%)</p>
              </div>
              {artists.slice(0, 10).map((a, i) => (
                <div key={a.rank} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{a.rank}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${a.followersPct}%`, backgroundColor: BAR_COLOURS[i % BAR_COLOURS.length] }}
                    />
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
            <p className="text-xs text-muted-foreground">No genre data yet - genres are pulled from your top artists</p>
          ) : (
            <>
              <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">genre breakdown from top artists</p>
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
              <p className="text-[9px] font-mono text-muted-foreground/40">each colour = one genre · bar width = how many of your top artists are tagged with it</p>
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
