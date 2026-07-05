"use client"

import { useEffect, useState } from "react"
import { SiSpotify } from "react-icons/si"
import {
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  BarChart,
  PieChart,
} from "@/components/analytics"

type Now = { playing?: boolean; track?: string; artist?: string; albumArt?: string | null } | null
type Top = {
  tracks?: { rank: number; id: string; name: string; artist: string; albumArt: string | null; url: string | null }[]
  artists?: { rank: number; name: string; genres: string[]; image: string | null; url: string | null; followers: number }[]
  genres?: { genre: string; value: number }[]
  eras?: { decade: string; count: number }[]
} | null
type Lfm = {
  configured?: boolean
  totalScrobbles?: number
  windowPlays?: number
  registered?: number | null
  hours?: number[]
  weekdays?: { day: string; count: number }[]
  topArtists?: { name: string; playcount: number; url: string }[]
  topTracks?: { name: string; artist: string; playcount: number; url: string }[]
  topAlbums?: { name: string; artist: string; playcount: number; image: string | null; url: string }[]
  recent?: { name: string; artist: string; image: string | null; url: string; nowPlaying: boolean; when: number | null }[]
} | null

const C = ["#1db954", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#f97316", "#84cc16", "#e879f9", "#14b8a6"]
// The shared period selector -> Spotify's three time ranges (Last.fm handles the period itself).
const RANGE: Record<string, string> = { "24h": "short_term", "7d": "short_term", "30d": "short_term", "90d": "medium_term", "1y": "long_term", all: "long_term" }

function ago(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest truncate">{label}</p>
      <p className="text-lg sm:text-xl font-semibold mt-0.5 tabular-nums truncate">{value}</p>
      {sub && <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5 truncate">{sub}</p>}
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

function RankedList({
  items,
}: {
  items: { key: string; name: string; sub?: string; image?: string | null; url?: string | null; count: number; max: number; round?: boolean; i: number }[]
}) {
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <a key={it.key} href={it.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
          <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{it.i + 1}</span>
          {it.image !== undefined ? (
            it.image ? <img src={it.image} alt="" className={`w-7 h-7 shrink-0 object-cover ${it.round ? "rounded-full" : "rounded"}`} /> : <div className={`w-7 h-7 shrink-0 bg-muted ${it.round ? "rounded-full" : "rounded"}`} />
          ) : null}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate leading-tight">{it.name}</p>
            {it.sub && <p className="text-[10px] text-muted-foreground/60 truncate">{it.sub}</p>}
          </div>
          <div className="w-16 sm:w-24 h-1.5 bg-muted rounded-full overflow-hidden shrink-0"><div className="h-full rounded-full" style={{ width: `${(it.count / it.max) * 100}%`, backgroundColor: C[it.i % C.length] }} /></div>
          <span className="text-[10px] font-mono text-muted-foreground/60 w-9 text-right shrink-0">{it.count.toLocaleString()}</span>
        </a>
      ))}
    </div>
  )
}

function MusicInner() {
  const { period } = useAnalyticsPeriod()
  const [top, setTop] = useState<Top>(null)
  const [now, setNow] = useState<Now>(null)
  const [lfm, setLfm] = useState<Lfm>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`/api/spotify-top?range=${RANGE[period] ?? "short_term"}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/spotify").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/dashboard/lastfm?period=${period}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([t, n, l]) => {
      if (cancelled) return
      setTop(t)
      setNow(n)
      setLfm(l)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [period])

  const genres = top?.genres ?? []
  const eras = top?.eras ?? []
  const hasLfm = lfm?.configured && (lfm.totalScrobbles ?? 0) > 0
  const hours = lfm?.hours ?? []
  const peakHour = hours.length ? hours.indexOf(Math.max(...hours)) : 0
  const topArtists = lfm?.topArtists ?? []
  const topTracks = lfm?.topTracks ?? []

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Now playing + period selector */}
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
              <p className="text-xs text-muted-foreground truncate">
                {hasLfm ? `${(lfm?.totalScrobbles ?? 0).toLocaleString()} scrobbles since ${lfm?.registered ? new Date(lfm.registered).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : ""}` : "connecting to Last.fm and Spotify"}
              </p>
            </>
          )}
        </div>
        {now?.albumArt && now.playing && <img src={now.albumArt} alt="" className="w-14 h-14 rounded-lg shrink-0 object-cover" />}
        <PeriodSelector />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted/50 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <>
          {/* Wrapped-style stat cards */}
          {hasLfm && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <Stat label="Scrobbles" value={(lfm?.totalScrobbles ?? 0).toLocaleString()} sub="all time" />
              <Stat label="In this range" value={(lfm?.windowPlays ?? 0).toLocaleString()} sub="plays" />
              <Stat label="Top artist" value={topArtists[0]?.name ?? "-"} sub={topArtists[0] ? `${topArtists[0].playcount} plays` : undefined} />
              <Stat label="Top track" value={topTracks[0]?.name ?? "-"} sub={topTracks[0]?.artist} />
              <Stat label="Peak hour" value={`${String(peakHour).padStart(2, "0")}:00`} sub="most plays" />
              <Stat label="Top genre" value={genres[0]?.genre ?? "-"} sub="from my artists" />
            </div>
          )}

          {/* Listening clock + weekday - recharts */}
          {hasLfm && (
            <div className="grid md:grid-cols-2 gap-4">
              <Section title="my listening clock" note="plays by hour - London time">
                <BarChart data={hours.map((c, i) => ({ name: `${String(i).padStart(2, "0")}:00`, value: c }))} dataKey="value" xKey="name" height={150} colour="#1db954" valueFormatter={(v) => `${v} plays`} />
              </Section>
              <Section title="by day of the week">
                <BarChart data={(lfm?.weekdays ?? []).map((w) => ({ name: w.day, value: w.count }))} dataKey="value" xKey="name" height={150} colour="#6366f1" valueFormatter={(v) => `${v} plays`} />
              </Section>
            </div>
          )}

          {/* Top artists + tracks by real playcount */}
          <div className="grid md:grid-cols-2 gap-4">
            <Section title="top artists" note="Last.fm - by playcount">
              {topArtists.length ? (
                <RankedList items={topArtists.slice(0, 12).map((a, i) => ({ key: a.name, name: a.name, url: a.url, count: a.playcount, max: topArtists[0]?.playcount || 1, round: true, i }))} />
              ) : <p className="text-xs text-muted-foreground py-4 text-center">No data for this range.</p>}
            </Section>
            <Section title="top tracks" note="Last.fm - by playcount">
              {topTracks.length ? (
                <RankedList items={topTracks.slice(0, 12).map((t, i) => ({ key: `${t.name}${i}`, name: t.name, sub: t.artist, url: t.url, count: t.playcount, max: topTracks[0]?.playcount || 1, i }))} />
              ) : <p className="text-xs text-muted-foreground py-4 text-center">No data for this range.</p>}
            </Section>
          </div>

          {/* Genres pie + listening era - recharts */}
          <div className="grid md:grid-cols-2 gap-4">
            {genres.length > 0 && (
              <Section title="my genres" note="rank-weighted from my top artists">
                <PieChart data={genres.slice(0, 8).map((g, i) => ({ name: g.genre, value: g.value, colour: C[i % C.length] }))} height={200} valueFormatter={(v) => `${Math.round(v)}`} />
              </Section>
            )}
            {eras.length > 1 && (
              <Section title="my listening era" note="all-time top tracks by decade">
                <BarChart data={eras.map((e) => ({ name: e.decade, value: e.count }))} dataKey="value" xKey="name" height={200} colour="#8b5cf6" valueFormatter={(v) => `${v} tracks`} />
              </Section>
            )}
          </div>

          {/* Top albums */}
          {(lfm?.topAlbums?.length ?? 0) > 0 && (
            <Section title="top albums" note="Last.fm">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {(lfm?.topAlbums ?? []).slice(0, 10).map((al, i) => (
                  <a key={`${al.name}${i}`} href={al.url} target="_blank" rel="noopener noreferrer" className="group">
                    {al.image ? <img src={al.image} alt="" className="w-full aspect-square rounded-lg object-cover" /> : <div className="w-full aspect-square rounded-lg bg-muted" />}
                    <p className="text-[11px] font-medium truncate mt-1">{al.name}</p>
                    <p className="text-[9px] text-muted-foreground/60 truncate">{al.artist} - {al.playcount}</p>
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Spotify recent-taste tracks + Last.fm recent scrobbles */}
          <div className="grid md:grid-cols-2 gap-4">
            {(top?.tracks?.length ?? 0) > 0 && (
              <Section title="on repeat" note="Spotify top for this range">
                <div className="space-y-1.5">
                  {(top?.tracks ?? []).slice(0, 10).map((t) => (
                    <a key={t.id} href={t.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
                      <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{t.rank}</span>
                      {t.albumArt ? <img src={t.albumArt} alt="" className="w-7 h-7 rounded shrink-0 object-cover" /> : <div className="w-7 h-7 rounded bg-muted shrink-0" />}
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate leading-tight">{t.name}</p><p className="text-[10px] text-muted-foreground/60 truncate">{t.artist}</p></div>
                    </a>
                  ))}
                </div>
              </Section>
            )}
            {(lfm?.recent?.length ?? 0) > 0 && (
              <Section title="recently played" note="every device">
                <div className="space-y-1.5">
                  {(lfm?.recent ?? []).slice(0, 10).map((r, i) => (
                    <a key={`${r.name}${i}`} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
                      {r.image ? <img src={r.image} alt="" className="w-7 h-7 rounded shrink-0 object-cover" /> : <div className="w-7 h-7 rounded bg-muted shrink-0" />}
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate leading-tight">{r.name}</p><p className="text-[10px] text-muted-foreground/60 truncate">{r.artist}</p></div>
                      <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">{r.nowPlaying ? "now" : r.when ? ago(r.when) : ""}</span>
                    </a>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {!hasLfm && genres.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-2">Connecting to Spotify and Last.fm - add LASTFM_USER if the charts stay empty.</p>
          )}
        </>
      )}
    </div>
  )
}

export default function MusicAnalyticsClient() {
  return (
    <AnalyticsPeriodProvider defaultPeriod="30d">
      <MusicInner />
    </AnalyticsPeriodProvider>
  )
}
