"use client"

import { useEffect, useState } from "react"
import { SiSpotify } from "react-icons/si"

// Fixed vibrant palette - mid-tone colours that read on both light and dark cards.
const C = ["#1db954", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#f97316", "#84cc16", "#e879f9", "#14b8a6"]

type History = {
  empty: boolean
  totalPlays: number
  uniqueTracks?: number
  uniqueArtists?: number
  totalMinutes?: number
  activeDays?: number
  firstPlay?: string
  hours?: number[]
  weekdays?: { day: string; count: number }[]
  topTracks?: { name: string; artist: string; art: string | null; url: string | null; count: number }[]
  topArtists?: { artist: string; art: string | null; count: number }[]
  recent?: { name: string; artist: string; art: string | null; url: string | null; playedAt: string }[]
}
type Top = {
  tracks: { rank: number; id: string; name: string; artist: string; albumArt: string | null; url: string | null; duration_ms: number }[]
  artists: { rank: number; name: string; genres: string[]; image: string | null; url: string | null; followers: number; followersPct: number }[]
  genres: { genre: string; value: number }[]
  eras: { decade: string; count: number }[]
}
type Now = { playing?: boolean; track?: string; artist?: string; albumArt?: string | null; url?: string } | null

function fmtMins(m: number): string {
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}
function ago(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-semibold mt-0.5 tabular-nums">{value}</p>
      {sub && <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{sub}</p>}
    </div>
  )
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">{title}</p>
        {note && <p className="text-[9px] font-mono text-muted-foreground/40 text-right">{note}</p>}
      </div>
      {children}
    </div>
  )
}

// Genre donut - rank-weighted arc segments, legible in light and dark.
function GenreDonut({ data }: { data: { genre: string; value: number }[] }) {
  const top = data.slice(0, 8)
  const total = top.reduce((s, d) => s + d.value, 0) || 1
  const R = 68, r = 40, cx = 80, cy = 80
  const pt = (rad: number, a: number) => `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`
  const arcs = top.map((d, i) => {
    const start = top.slice(0, i).reduce((s, x) => s + x.value, 0) / total
    const frac = d.value / total
    const a0 = -Math.PI / 2 + start * Math.PI * 2
    const a1 = a0 + frac * Math.PI * 2
    const large = frac > 0.5 ? 1 : 0
    return { path: `M ${pt(R, a0)} A ${R} ${R} 0 ${large} 1 ${pt(R, a1)} L ${pt(r, a1)} A ${r} ${r} 0 ${large} 0 ${pt(r, a0)} Z`, colour: C[i % C.length], genre: d.genre, pct: Math.round(frac * 100) }
  })
  return (
    <svg width={160} height={160} className="shrink-0">
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill={a.colour} opacity={0.92} stroke="hsl(var(--card))" strokeWidth={1.5}>
          <title>{`${a.genre} - ${a.pct}%`}</title>
        </path>
      ))}
      <text x={cx} y={cy - 1} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight={600} fill="hsl(var(--foreground))">{top[0]?.genre.slice(0, 11) ?? ""}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="hsl(var(--muted-foreground))">{arcs[0]?.pct ?? 0}%</text>
    </svg>
  )
}

export default function MusicAnalyticsClient() {
  const [hist, setHist] = useState<History | null>(null)
  const [top, setTop] = useState<Top | null>(null)
  const [now, setNow] = useState<Now>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/music-history").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/spotify-top").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/spotify").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([h, t, n]) => {
      setHist(h)
      setTop(t)
      setNow(n)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted/50 rounded-2xl animate-pulse" />)}</div>
  }

  const h = hist ?? { empty: true, totalPlays: 0 }
  const maxHour = Math.max(1, ...(h.hours ?? [1]))
  const maxWeekday = Math.max(1, ...(h.weekdays ?? []).map((w) => w.count))
  const maxTrackCount = Math.max(1, ...(h.topTracks ?? []).map((t) => t.count))
  const maxArtistCount = Math.max(1, ...(h.topArtists ?? []).map((a) => a.count))
  const peakHour = (h.hours ?? []).indexOf(maxHour)
  const genres = top?.genres ?? []
  const eras = top?.eras ?? []
  const maxEra = Math.max(1, ...eras.map((e) => e.count))

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Now playing / header */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-[#1db954]/10 to-transparent p-4 sm:p-5 flex items-center gap-4">
        <SiSpotify className="h-8 w-8 text-[#1db954] shrink-0" />
        <div className="min-w-0 flex-1">
          {now?.playing && now.track ? (
            <>
              <p className="text-[10px] font-mono text-[#1db954] uppercase tracking-widest">now playing</p>
              <p className="text-sm font-semibold truncate">{now.track}</p>
              <p className="text-xs text-muted-foreground truncate">{now.artist}</p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">my music</p>
              <p className="text-sm font-semibold">Listening analytics</p>
              <p className="text-xs text-muted-foreground">{h.empty ? "Collecting plays - charts fill in as I listen" : `${h.totalPlays.toLocaleString()} plays tracked since ${h.firstPlay ? new Date(h.firstPlay).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : ""}`}</p>
            </>
          )}
        </div>
        {now?.albumArt && now.playing && <img src={now.albumArt} alt="" className="w-14 h-14 rounded-lg shrink-0 object-cover" />}
      </div>

      {/* Stat cards */}
      {!h.empty && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Stat label="Plays" value={h.totalPlays.toLocaleString()} />
          <Stat label="Listened" value={fmtMins(h.totalMinutes ?? 0)} />
          <Stat label="Tracks" value={(h.uniqueTracks ?? 0).toLocaleString()} sub="unique" />
          <Stat label="Artists" value={(h.uniqueArtists ?? 0).toLocaleString()} sub="unique" />
          <Stat label="Active days" value={String(h.activeDays ?? 0)} />
          <Stat label="Peak hour" value={`${String(peakHour).padStart(2, "0")}:00`} sub="most plays" />
        </div>
      )}

      {/* Listening clock */}
      {!h.empty && h.hours && (
        <Section title="my listening clock" note="plays by hour of day - London time">
          <div className="flex items-end gap-[3px] h-28">
            {h.hours.map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group">
                <div className="w-full rounded-t transition-all group-hover:opacity-80" style={{ height: `${(c / maxHour) * 100}%`, minHeight: c > 0 ? 3 : 0, backgroundColor: i === peakHour ? "#1db954" : C[1] }} title={`${String(i).padStart(2, "0")}:00 - ${c} plays`} />
                {i % 3 === 0 && <span className="text-[8px] font-mono text-muted-foreground/50">{String(i).padStart(2, "0")}</span>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Weekday pattern */}
      {!h.empty && h.weekdays && (
        <Section title="by day of the week">
          <div className="flex items-end gap-2 h-24">
            {h.weekdays.map((w, i) => (
              <div key={w.day} className="flex-1 flex flex-col items-center justify-end gap-1">
                <span className="text-[9px] font-mono text-muted-foreground/60">{w.count}</span>
                <div className="w-full rounded-t transition-all" style={{ height: `${(w.count / maxWeekday) * 100}%`, minHeight: w.count > 0 ? 3 : 0, backgroundColor: C[i % C.length] }} />
                <span className="text-[9px] font-mono text-muted-foreground/60">{w.day}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Most played (real counts) */}
      <div className="grid md:grid-cols-2 gap-4">
        <Section title="most played tracks" note="by real play count">
          {h.empty || !h.topTracks?.length ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Collecting plays...</p>
          ) : (
            <div className="space-y-1.5">
              {h.topTracks.map((t, i) => (
                <a key={`${t.name}${i}`} href={t.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{i + 1}</span>
                  {t.art ? <img src={t.art} alt="" className="w-7 h-7 rounded shrink-0 object-cover" /> : <div className="w-7 h-7 rounded bg-muted shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{t.artist}</p>
                  </div>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shrink-0"><div className="h-full rounded-full" style={{ width: `${(t.count / maxTrackCount) * 100}%`, backgroundColor: C[i % C.length] }} /></div>
                  <span className="text-[10px] font-mono text-muted-foreground/60 w-6 text-right shrink-0">{t.count}</span>
                </a>
              ))}
            </div>
          )}
        </Section>

        <Section title="most played artists" note="by real play count">
          {h.empty || !h.topArtists?.length ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Collecting plays...</p>
          ) : (
            <div className="space-y-1.5">
              {h.topArtists.map((a, i) => (
                <div key={`${a.artist}${i}`} className="flex items-center gap-2.5 px-1.5 py-1">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{i + 1}</span>
                  {a.art ? <img src={a.art} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover" /> : <div className="w-7 h-7 rounded-full bg-muted shrink-0" />}
                  <p className="flex-1 min-w-0 text-xs font-medium truncate">{a.artist}</p>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden shrink-0"><div className="h-full rounded-full" style={{ width: `${(a.count / maxArtistCount) * 100}%`, backgroundColor: C[i % C.length] }} /></div>
                  <span className="text-[10px] font-mono text-muted-foreground/60 w-6 text-right shrink-0">{a.count}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Genres + eras from live top data */}
      <div className="grid md:grid-cols-2 gap-4">
        {genres.length > 0 && (
          <Section title="my genres" note="rank-weighted, last 4 weeks">
            <div className="flex gap-4 items-center flex-wrap justify-center sm:justify-start">
              <GenreDonut data={genres} />
              <div className="flex-1 min-w-[160px] space-y-1.5">
                {genres.slice(0, 8).map((g, i) => (
                  <div key={g.genre} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground/70 w-24 truncate shrink-0">{g.genre}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(g.value / (genres[0]?.value || 1)) * 100}%`, backgroundColor: C[i % C.length] }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}
        {eras.length > 1 && (
          <Section title="my listening era" note="all-time top tracks by decade">
            <div className="flex items-end gap-2 h-28 pt-2">
              {eras.map((e, i) => (
                <div key={e.decade} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <span className="text-[9px] font-mono text-muted-foreground/60">{e.count}</span>
                  <div className="w-full rounded-t" style={{ height: `${(e.count / maxEra) * 100}%`, minHeight: 3, backgroundColor: C[i % C.length] }} />
                  <span className="text-[9px] font-mono text-muted-foreground/60">{e.decade}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Live top tracks + recent plays */}
      <div className="grid md:grid-cols-2 gap-4">
        {top?.tracks && top.tracks.length > 0 && (
          <Section title="on repeat" note="Spotify top - last 4 weeks">
            <div className="space-y-1.5">
              {top.tracks.slice(0, 10).map((t) => (
                <a key={t.id} href={t.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{t.rank}</span>
                  {t.albumArt ? <img src={t.albumArt} alt="" className="w-7 h-7 rounded shrink-0 object-cover" /> : <div className="w-7 h-7 rounded bg-muted shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{t.artist}</p>
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}
        {!h.empty && h.recent?.length ? (
          <Section title="recently played">
            <div className="space-y-1.5">
              {h.recent.slice(0, 10).map((r, i) => (
                <a key={`${r.playedAt}${i}`} href={r.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
                  {r.art ? <img src={r.art} alt="" className="w-7 h-7 rounded shrink-0 object-cover" /> : <div className="w-7 h-7 rounded bg-muted shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{r.artist}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">{ago(r.playedAt)}</span>
                </a>
              ))}
            </div>
          </Section>
        ) : null}
      </div>

      {h.empty && (
        <p className="text-center text-xs text-muted-foreground py-2">
          The listening history charts fill in once the Spotify collector has run. Give it a few plays.
        </p>
      )}
    </div>
  )
}
