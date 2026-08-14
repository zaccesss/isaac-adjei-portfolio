"use client"

import { useEffect, useMemo, useState } from "react"
import { SiSpotify, SiLastdotfm } from "react-icons/si"
import {
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  BarChart,
  PieChart,
  Treemap,
  Sankey,
  RadialClock,
  WordCloud,
  DEFAULT_CHART_COLOURS,
  type SankeyChartData,
} from "@/components/analytics"

type Now = { playing?: boolean; track?: string; artist?: string; albumArt?: string | null } | null
type Hist = {
  empty?: boolean
  totalPlays?: number
  uniqueTracks?: number
  uniqueArtists?: number
  totalMinutes?: number
  activeDays?: number
  hours?: number[]
  weekdays?: { day: string; count: number }[]
  topTracks?: { name: string; artist: string; art: string | null; url: string | null; count: number }[]
  topArtists?: { artist: string; art: string | null; count: number }[]
  hourGenreFlow?: { bucket: string; genre: string; count: number }[]
  recent?: { name: string; artist: string; art: string | null; url: string | null; playedAt: string }[]
} | null
type Top = {
  tracks?: { rank: number; id: string; name: string; artist: string; albumArt: string | null; url: string | null; releaseDate?: string | null }[]
  artists?: { rank: number; name: string; genres: string[]; image: string | null; url: string | null; followers: number }[]
  genres?: { genre: string; value: number }[]
  eras?: { decade: string; count: number }[]
  shows?: { id: string; name: string; publisher: string | null; image: string | null; url: string | null }[]
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
const RANGE: Record<string, string> = { "24h": "short_term", "7d": "short_term", "30d": "short_term", "90d": "medium_term", "1y": "long_term", all: "long_term" }

function fmtMins(m: number): string {
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}
function ago(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function Divider({ icon, label, colour }: { icon: React.ReactNode; label: string; colour: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="h-px flex-1 bg-border/60" />
      <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest" style={{ color: colour }}>{icon}{label}</span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
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

// A ranked row with optional art + a proportional bar + a count, always linked if a url exists.
function Row({ i, name, sub, image, round, url, count, max }: { i: number; name: string; sub?: string; image?: string | null; round?: boolean; url?: string | null; count: number; max: number }) {
  return (
    <a href={url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
      <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{i + 1}</span>
      {image !== undefined && (image ? <img src={image} alt="" className={`w-7 h-7 shrink-0 object-cover ${round ? "rounded-full" : "rounded"}`} /> : <div className={`w-7 h-7 shrink-0 bg-muted ${round ? "rounded-full" : "rounded"}`} />)}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate leading-tight group-hover:text-foreground">{name}</p>
        {sub && <p className="text-[10px] text-muted-foreground/60 truncate">{sub}</p>}
      </div>
      <div className="w-16 sm:w-24 h-1.5 bg-muted rounded-full overflow-hidden shrink-0"><div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: C[i % C.length] }} /></div>
      <span className="text-[10px] font-mono text-muted-foreground/60 w-9 text-right shrink-0">{count.toLocaleString()}</span>
    </a>
  )
}

function ClockWeekday({ hours, weekdays, colour }: { hours?: number[]; weekdays?: { day: string; count: number }[]; colour: string }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Section title="listening clock" note="plays by hour - London time">
        <RadialClock hours={hours ?? []} height={190} valueLabel="plays" colour={colour} />
      </Section>
      <Section title="by day of the week">
        <BarChart data={(weekdays ?? []).map((w) => ({ name: w.day, value: w.count }))} dataKey="value" xKey="name" height={150} colour="#6366f1" valueFormatter={(v) => `${v} plays`} />
      </Section>
    </div>
  )
}

// Sankey node/link builders - each returns { nodes, links } indexed the way recharts' Sankey
// requires (a link references its nodes by array position, not by name), built fresh from
// whatever data is already on the page rather than a new fetch, except the time-of-day flow which
// reads a field the music-history route now computes server-side (hourGenreFlow).

function sankeyIndexer() {
  const nodes: { name: string }[] = []
  const byName = new Map<string, number>()
  return {
    nodes,
    idx(name: string): number {
      let i = byName.get(name)
      if (i === undefined) {
        i = nodes.length
        nodes.push({ name })
        byName.set(name, i)
      }
      return i
    },
  }
}

// Artist -> genre -> era, built from the current range's top tracks (each carries a release date)
// matched against the top artists' own genre tags by name - an honest approximation from data
// already fetched for this page rather than a fabricated per-track genre, since genres here only
// ever come from Last.fm's per-ARTIST tags, never per-track.
function buildArtistGenreEraSankey(tracks: NonNullable<Top>["tracks"], artists: NonNullable<Top>["artists"]): SankeyChartData {
  if (!tracks?.length || !artists?.length) return { nodes: [], links: [] }
  const genreByArtist = new Map(artists.map((a) => [a.name.toLowerCase(), a.genres[0]]))
  const { nodes, idx } = sankeyIndexer()
  const weights = new Map<string, number>()
  const add = (source: number, target: number, amount = 1) => {
    const key = `${source}-${target}`
    weights.set(key, (weights.get(key) ?? 0) + amount)
  }
  for (const t of tracks.slice(0, 15)) {
    const primaryArtist = t.artist.split(",")[0]?.trim()
    const genre = primaryArtist ? genreByArtist.get(primaryArtist.toLowerCase()) : undefined
    const year = t.releaseDate ? parseInt(t.releaseDate.slice(0, 4), 10) : NaN
    if (!primaryArtist || !genre || Number.isNaN(year)) continue
    const era = `${Math.floor(year / 10) * 10}s`
    add(idx(primaryArtist), idx(genre))
    add(idx(genre), idx(era))
  }
  const links = [...weights.entries()].map(([key, value]) => {
    const [source, target] = key.split("-").map(Number)
    return { source, target, value }
  })
  return { nodes, links }
}

// Platform -> artist, comparing the same top artists as seen through Spotify's own stored play
// history versus Last.fm's full scrobble history - two independently-tracked sources converging
// on (mostly) the same people.
function buildPlatformArtistSankey(spotifyArtists: NonNullable<Hist>["topArtists"], lastfmArtists: NonNullable<Lfm>["topArtists"]): SankeyChartData {
  const { nodes, idx } = sankeyIndexer()
  const spotifyIdx = idx("Spotify")
  const lastfmIdx = idx("Last.fm")
  const links: { source: number; target: number; value: number }[] = []
  for (const a of (spotifyArtists ?? []).slice(0, 8)) {
    links.push({ source: spotifyIdx, target: idx(a.artist), value: a.count })
  }
  for (const a of (lastfmArtists ?? []).slice(0, 8)) {
    links.push({ source: lastfmIdx, target: idx(a.name), value: a.playcount })
  }
  return { nodes, links }
}

// Time of day -> genre, from music-history's own hourGenreFlow (each play's hour bucketed into a
// part of the day, joined against its artist's primary Last.fm tag server-side, since that join
// needs the full per-play artist_name list this page never fetches directly).
function buildHourGenreSankey(flow: NonNullable<Hist>["hourGenreFlow"]): SankeyChartData {
  if (!flow?.length) return { nodes: [], links: [] }
  const { nodes, idx } = sankeyIndexer()
  const links = flow
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map((f) => ({ source: idx(f.bucket), target: idx(f.genre), value: f.count }))
  return { nodes, links }
}

function MusicInner() {
  const { period } = useAnalyticsPeriod()
  const [hist, setHist] = useState<Hist>(null)
  const [top, setTop] = useState<Top>(null)
  const [now, setNow] = useState<Now>(null)
  const [lfm, setLfm] = useState<Lfm>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`/api/dashboard/music-history?period=${period}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/spotify-top?range=${RANGE[period] ?? "short_term"}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/spotify").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/dashboard/lastfm?period=${period}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([h, t, n, l]) => {
      if (cancelled) return
      setHist(h)
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
  const sTracks = top?.tracks ?? []
  const sArtists = top?.artists ?? []
  const shows = top?.shows ?? []
  const hasSpotifyHist = hist && !hist.empty && (hist.totalPlays ?? 0) > 0
  const sPeak = (hist?.hours ?? []).length ? (hist?.hours ?? []).indexOf(Math.max(...(hist?.hours ?? [0]))) : 0
  const hasLfm = lfm?.configured && (lfm.totalScrobbles ?? 0) > 0
  const lPeak = (lfm?.hours ?? []).length ? (lfm?.hours ?? []).indexOf(Math.max(...(lfm?.hours ?? [0]))) : 0
  const lArtists = lfm?.topArtists ?? []
  const lTracks = lfm?.topTracks ?? []

  const artistGenreEraFlow = useMemo(() => buildArtistGenreEraSankey(top?.tracks, top?.artists), [top])
  const platformArtistFlow = useMemo(() => buildPlatformArtistSankey(hist?.topArtists, lfm?.topArtists), [hist, lfm])
  const hourGenreFlow = useMemo(() => buildHourGenreSankey(hist?.hourGenreFlow), [hist])

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
              <p className="text-sm font-semibold">Spotify + Last.fm listening analytics</p>
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
          {/* ─────────────── SPOTIFY ─────────────── */}
          <Divider icon={<SiSpotify className="h-3 w-3" />} label="Spotify" colour="#1db954" />

          {hasSpotifyHist ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <Stat label="Plays" value={(hist?.totalPlays ?? 0).toLocaleString()} sub="tracked" />
                <Stat label="Listened" value={fmtMins(hist?.totalMinutes ?? 0)} />
                <Stat label="Tracks" value={(hist?.uniqueTracks ?? 0).toLocaleString()} sub="unique" />
                <Stat label="Artists" value={(hist?.uniqueArtists ?? 0).toLocaleString()} sub="unique" />
                <Stat label="Active days" value={String(hist?.activeDays ?? 0)} />
                <Stat label="Peak hour" value={`${String(sPeak).padStart(2, "0")}:00`} sub="most plays" />
              </div>
              <ClockWeekday hours={hist?.hours} weekdays={hist?.weekdays} colour="#1db954" />
            </>
          ) : (
            <p className="text-center text-xs text-muted-foreground">My Spotify play history is still building - the collector records every 30 minutes.</p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {sTracks.length > 0 && (
              <Section title="top tracks" note="Spotify: Recent · 6mo · All-time only">
                <div className="space-y-1.5">
                  {sTracks.slice(0, 10).map((t) => (
                    <a key={t.id} href={t.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
                      <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{t.rank}</span>
                      {t.albumArt ? <img src={t.albumArt} alt="" className="w-7 h-7 rounded shrink-0 object-cover" /> : <div className="w-7 h-7 rounded bg-muted shrink-0" />}
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate leading-tight">{t.name}</p><p className="text-[10px] text-muted-foreground/60 truncate">{t.artist}</p></div>
                    </a>
                  ))}
                </div>
              </Section>
            )}
            {sArtists.length > 0 && (
              <Section title="top artists" note="Spotify: Recent · 6mo · All-time only">
                <div className="space-y-1.5">
                  {sArtists.slice(0, 10).map((a) => (
                    <a key={a.rank} href={a.url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group hover:bg-muted/40 rounded-lg px-1.5 py-1">
                      <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{a.rank}</span>
                      {a.image ? <img src={a.image} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover" /> : <div className="w-7 h-7 rounded-full bg-muted shrink-0" />}
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate leading-tight">{a.name}</p>{a.genres.length > 0 && <p className="text-[10px] text-muted-foreground/60 truncate">{a.genres.slice(0, 3).join(" · ")}</p>}</div>
                    </a>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {genres.length > 0 && (
              <Section title="my genres" note="rank-weighted, Spotify: Recent · 6mo · All-time only">
                <PieChart data={genres.slice(0, 8).map((g, i) => ({ name: g.genre, value: g.value, colour: C[i % C.length] }))} height={200} valueFormatter={(v) => `${Math.round(v)}`} />
              </Section>
            )}
            {eras.length > 1 && (
              <Section title="my listening era" note="all-time tracks by decade">
                <BarChart data={eras.map((e) => ({ name: e.decade, value: e.count }))} dataKey="value" xKey="name" height={200} colour="#8b5cf6" valueFormatter={(v) => `${v} tracks`} />
              </Section>
            )}
          </div>

          {genres.length > 0 && (
            <Section title="my genres, by size" note="same data as the pie above, read as area instead">
              <Treemap data={genres.slice(0, 12).map((g) => ({ name: g.genre, value: g.value }))} height={220} colours={C} valueFormatter={(v) => v.toFixed(1)} />
            </Section>
          )}

          {(hist?.topArtists?.length ?? 0) > 0 && (
            <Section title="my top artists" note="sized by plays this period, Spotify listening history">
              <WordCloud words={(hist?.topArtists ?? []).slice(0, 40).map((a) => ({ text: a.artist, value: a.count }))} height={220} />
            </Section>
          )}

          {shows.length > 0 && (
            <Section title="my podcasts" note="Spotify shows">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {shows.slice(0, 10).map((s) => (
                  <a key={s.id} href={s.url ?? "#"} target="_blank" rel="noopener noreferrer" className="group">
                    {s.image ? <img src={s.image} alt="" className="w-full aspect-square rounded-lg object-cover" /> : <div className="w-full aspect-square rounded-lg bg-muted" />}
                    <p className="text-[11px] font-medium truncate mt-1">{s.name}</p>
                    <p className="text-[9px] text-muted-foreground/60 truncate">{s.publisher}</p>
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* ─────────────── LAST.FM ─────────────── */}
          {hasLfm && (
            <>
              <Divider icon={<SiLastdotfm className="h-3 w-3" />} label="Last.fm - my whole history" colour="#d51007" />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <Stat label="Scrobbles" value={(lfm?.totalScrobbles ?? 0).toLocaleString()} sub="all time, every device" />
                <Stat label="In this range" value={(lfm?.windowPlays ?? 0).toLocaleString()} sub="plays" />
                <Stat label="Since" value={lfm?.registered ? new Date(lfm.registered).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "-"} />
                <Stat label="Top artist" value={lArtists[0]?.name ?? "-"} sub={lArtists[0] ? `${lArtists[0].playcount} plays` : undefined} />
                <Stat label="Top track" value={lTracks[0]?.name ?? "-"} sub={lTracks[0]?.artist} />
                <Stat label="Peak hour" value={`${String(lPeak).padStart(2, "0")}:00`} sub="most plays" />
              </div>

              <ClockWeekday hours={lfm?.hours} weekdays={lfm?.weekdays} colour="#d51007" />

              <div className="grid md:grid-cols-2 gap-4">
                <Section title="top artists" note="Last.fm - by playcount">
                  <div className="space-y-1.5">{lArtists.slice(0, 12).map((a, i) => <Row key={a.name} i={i} name={a.name} round url={a.url} count={a.playcount} max={lArtists[0]?.playcount || 1} />)}</div>
                </Section>
                <Section title="top tracks" note="Last.fm - by playcount">
                  <div className="space-y-1.5">{lTracks.slice(0, 12).map((t, i) => <Row key={`${t.name}${i}`} i={i} name={t.name} sub={t.artist} url={t.url} count={t.playcount} max={lTracks[0]?.playcount || 1} />)}</div>
                </Section>
              </div>

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

              {(lfm?.recent?.length ?? 0) > 0 && (
                <Section title="recent scrobbles" note="every device">
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
            </>
          )}

          {/* ─────────────── LISTENING FLOWS ─────────────── */}
          {(artistGenreEraFlow.links.length > 0 || platformArtistFlow.links.length > 0 || hourGenreFlow.links.length > 0) && (
            <>
              <Divider icon={<span>→</span>} label="Listening flows" colour="#8b5cf6" />

              {artistGenreEraFlow.links.length > 0 && (
                <Section title="artist -> genre -> era" note="Spotify: Recent · 6mo · All-time only, by release decade">
                  <Sankey data={artistGenreEraFlow} height={260} nodeColours={DEFAULT_CHART_COLOURS} valueFormatter={(v) => `${v} tracks`} />
                </Section>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {hourGenreFlow.links.length > 0 && (
                  <Section title="time of day -> genre" note="Spotify history - top 60 artists' primary genre">
                    <Sankey data={hourGenreFlow} height={240} nodeColours={DEFAULT_CHART_COLOURS} valueFormatter={(v) => `${v} plays`} />
                  </Section>
                )}
                {platformArtistFlow.links.length > 0 && (
                  <Section title="platform -> artist" note="Spotify history vs Last.fm scrobbles">
                    <Sankey data={platformArtistFlow} height={240} nodeColours={["#1db954", "#d51007", ...DEFAULT_CHART_COLOURS]} valueFormatter={(v) => `${v} plays`} />
                  </Section>
                )}
              </div>
            </>
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
