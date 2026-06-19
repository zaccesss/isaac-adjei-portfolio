"use client"
// I poll multiple device-status API routes on a timer and render live cards for
// each. Spotify progress is ticked forward client-side every second between polls
// so the progress bar stays smooth without hammering the API.

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Laptop, BatteryCharging, Battery, Wifi, WifiOff, GitBranch, Monitor, Github, ExternalLink } from "lucide-react"
import SpotifyBars from "@/components/shared/SpotifyBars"
import { SiPlaystation, SiDiscord, SiSpotify } from "react-icons/si"
import { cn } from "@/lib/utils"

interface LastPlayed {
  track: string
  artist: string
  albumArt: string | null
  type: "track" | "episode"
}

interface SpotifyData {
  playing: boolean
  paused: boolean
  type?: "track" | "episode"
  track?: string
  artist?: string
  albumArt?: string
  url?: string
  progressMs?: number
  durationMs?: number
  device?: string | null
  audioFeatures?: { energy: number; tempo: number; valence: number; danceability: number } | null
  lastPlayed?: LastPlayed | null
}

interface MacbookData {
  battery: number | null
  charging: boolean | null
  lastSeen: string | null
  device: string | null
  countryCode: string | null
  timezone: string
  weatherCondition: string | null
  weatherEmoji: string | null
  tempC: number | null
}

interface LenovoData {
  battery: number | null
  charging: boolean | null
  lastSeen: string | null
  device: string | null
}

interface GamingPCData {
  online: boolean
  lastSeen: string | null
  gpu: string | null
  cpu: string | null
  currentGame: string | null
  gameImage: string | null
  device: string | null
}

interface GithubData {
  repo: string | null
  relativeTime: string | null
}

interface PS5Data {
  online: boolean
  busy: boolean
  lastSeen: string | null
  status: string
  game: string | null
  gameImage: string | null
  lastGame: string | null
  lastGameImage: string | null
}

interface LanyardActivity {
  type: number
  name: string
  details?: string
  state?: string
  timestamps?: { start?: number; end?: number }
  assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string }
  application_id?: string
}

interface LanyardData {
  discord_status: "online" | "idle" | "dnd" | "offline"
  activities: LanyardActivity[]
  active_on_discord_desktop: boolean
}

const DISCORD_USER_ID = "1087417301583790212"

// I build the activity icon URL from Lanyard's asset data following Discord's CDN format
function activityIconUrl(activity: LanyardActivity): string | null {
  const img = activity.assets?.large_image
  if (!img) return null
  if (img.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${img.slice("mp:external/".length)}`
  }
  if (img.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${img.slice("spotify:".length)}`
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`
  }
  return null
}

// I build the small icon URL (shown as a bottom-right overlay on the large icon, e.g. a file type icon over the VS Code logo)
function activitySmallIconUrl(activity: LanyardActivity): string | null {
  const img = activity.assets?.small_image
  if (!img) return null
  if (img.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${img.slice("mp:external/".length)}`
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`
  }
  return null
}

// For activities with an end timestamp (e.g. Netflix episodes), show elapsed/total like Discord does.
// For activities with only a start timestamp, show elapsed time.
function activityTimestamp(activity: LanyardActivity): string | null {
  const { start, end } = activity.timestamps ?? {}
  if (!start) return null
  if (end) {
    const elapsed = Math.max(0, Date.now() - start)
    const total = end - start
    return `${formatMs(elapsed)} / ${formatMs(total)}`
  }
  return activityElapsed(start)
}

const STATUS_COLOR: Record<string, string> = {
  online: "bg-green-500",
  idle:   "bg-yellow-500",
  dnd:    "bg-red-500",
}

function activityElapsed(startMs: number): string {
  const totalSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000))
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

function elapsedSince(startMs: number): string {
  const mins = Math.floor((Date.now() - startMs) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function MarqueeText({ text, active, className }: { text: string; active: boolean; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !measureRef.current) return
    setOverflows(measureRef.current.scrollWidth > containerRef.current.clientWidth)
  }, [text])

  return (
    <div ref={containerRef} className={cn("overflow-hidden min-w-0", className)}>
      {/* hidden span always present so we can measure text width vs container */}
      <span ref={measureRef} className="absolute invisible whitespace-nowrap pointer-events-none" aria-hidden>
        {text}
      </span>
      {overflows && active ? (
        <div className="flex whitespace-nowrap animate-marquee gap-10">
          <span>{text}</span>
          <span aria-hidden>{text}</span>
        </div>
      ) : (
        <span className="block truncate">{text}</span>
      )}
    </div>
  )
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  return `${m}:${String(sec).padStart(2, "0")}`
}

// onlineThresholdMins should comfortably exceed the source's update interval, or this
// shows "last seen Xm ago" for a device that is actually online right now. Mac/Lenovo/the
// gaming PC daemons write every 30s so the 1 minute default covers them; the PS5 worker
// only runs every 2 minutes via cron, so its call site below passes a longer threshold.
function relativeLastSeen(ts: string | null, onlineThresholdMins = 1): { text: string; online: boolean } {
  if (!ts) return { text: "offline", online: false }
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < onlineThresholdMins) return { text: "online now", online: true }
  if (mins < 60) return { text: `last seen ${mins}m ago`, online: mins < 5 }
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return { text: `last seen ${hrs}h ago`, online: false }
  return { text: `last seen ${Math.floor(hrs / 24)}d ago`, online: false }
}

function isStale(ts: string | null): boolean {
  if (!ts) return true
  return Date.now() - new Date(ts).getTime() > 5 * 60 * 1000
}

function currentTime(tz: string): string {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

function currentTzLabel(tz: string): string {
  return (
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      timeZoneName: "short",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT"
  )
}

function countryName(code: string | null): string {
  if (!code) return "United Kingdom"
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? "United Kingdom"
  } catch {
    return "United Kingdom"
  }
}

export default function LiveStatusCards({ alwaysShowDiscord = false }: { alwaysShowDiscord?: boolean }) {
  const [time, setTime] = useState("")
  const [tz, setTz] = useState("")
  const [spotify, setSpotify] = useState<SpotifyData>({ playing: false, paused: false })
  const [mac, setMac] = useState<MacbookData>({
    battery: null, charging: null, lastSeen: null, device: null,
    countryCode: null, timezone: "Europe/London",
    weatherCondition: null, weatherEmoji: null, tempC: null,
  })
  const [lenovo, setLenovo] = useState<LenovoData>({ battery: null, charging: null, lastSeen: null, device: null })
  const [gamingPC, setGamingPC] = useState<GamingPCData>({ online: false, lastSeen: null, gpu: null, cpu: null, currentGame: null, gameImage: null, device: "ZACCESS-GPC" })
  // I never read this value - the setter is all I need to force a re-render every second so Discord elapsed timestamps stay live
  const [, setActivityTick] = useState(0)
  const [github, setGithub] = useState<GithubData>({ repo: null, relativeTime: null })
  const [ps5Data, setPs5Data] = useState<PS5Data>({ online: false, busy: false, lastSeen: null, status: "Offline", game: null, gameImage: null, lastGame: null, lastGameImage: null })
  const [lanyard, setLanyard] = useState<LanyardData | null>(null)
  const [lanyardLastOnline, setLanyardLastOnline] = useState<number | null>(null)
  const [liveProgressMs, setLiveProgressMs] = useState(0)

  useEffect(() => {
    const tick = () => {
      setTime(currentTime(mac.timezone))
      setTz(currentTzLabel(mac.timezone))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [mac.timezone])

  // I tick every second so Discord activity elapsed timestamps re-render in real time without polling the API
  useEffect(() => {
    const id = setInterval(() => setActivityTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    // I replace all individual polling intervals with one SSE connection so the browser
    // holds a single persistent stream instead of 7 independent fetch timers
    const es = new EventSource("/api/live-status/stream")
    es.onmessage = (e) => {
      try {
        const { spotify: s, macbook, lenovo, gpc, ps5, github, lanyard: l } = JSON.parse(e.data)
        if (s) setSpotify(s)
        if (macbook) setMac(macbook)
        if (lenovo) setLenovo(lenovo)
        if (gpc) {
          setGamingPC({
            online:      gpc.online,
            lastSeen:    gpc.lastSeen,
            device:      gpc.device,
            // I format the percentages here because the API returns raw numbers and the card needs the % suffix
            cpu:         gpc.cpu !== null ? `${gpc.cpu}%` : null,
            gpu:         gpc.gpu !== null ? `${gpc.gpu}%` : null,
            currentGame: gpc.game,
            gameImage:   gpc.game_image ?? null,
          })
        }
        if (ps5) setPs5Data(ps5)
        if (github) setGithub(github)
        if (l?.success) {
          setLanyard(l.data)
          if (l.data.discord_status !== "offline") setLanyardLastOnline(Date.now())
        }
      } catch {}
    }
    return () => es.close()
  }, [])

  useEffect(() => {
    // I reset progress in a setTimeout so the state update is not batched with the effect trigger and the bar snaps correctly
    const reset = setTimeout(() => {
      setLiveProgressMs(spotify.progressMs ?? 0)
    }, 0)
    if (!spotify.playing) return () => clearTimeout(reset)
    // I tick every second client-side so the progress bar moves smoothly; the API only polls every 10s
    const tick = setInterval(() => {
      setLiveProgressMs((p) => Math.min(p + 1000, spotify.durationMs ?? p))
    }, 1000)
    return () => {
      clearTimeout(reset)
      clearInterval(tick)
    }
  }, [spotify.playing, spotify.durationMs, spotify.progressMs, spotify.track])

  const { text: seenText, online } = relativeLastSeen(mac.lastSeen)
  const hasTrack = spotify.playing || spotify.paused
  const progress = hasTrack && spotify.durationMs ? liveProgressMs / spotify.durationMs : 0
  const spotifyLabel = spotify.playing
    ? spotify.device ? `Currently Listening on ${spotify.device}` : "Currently Listening..."
    : "Paused"

  return (
    <div className="w-full max-w-md mx-auto space-y-3 text-left">

      {/* Weather + Time card */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          {/* I show country only - never city - to avoid disclosing precise location */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Currently in {countryName(mac.countryCode)}
          </p>
          <p className="text-2xl font-semibold font-mono tabular-nums leading-tight mt-1.5">
            {time || " "}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{tz || "local time"}</p>
        </div>
        {(mac.weatherEmoji || mac.weatherCondition || mac.tempC !== null) && (
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-2xl leading-none">{mac.weatherEmoji}</span>
              <span className="text-sm font-medium text-foreground/80">{mac.weatherCondition}</span>
            </div>
            {mac.tempC !== null && (
              <p className="text-xs text-muted-foreground mt-1">{mac.tempC}°C</p>
            )}
          </div>
        )}
      </div>

      {/* Spotify card */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {hasTrack ? (
          <div className="relative overflow-hidden">
            {/* Blurred album art background tint */}
            {spotify.albumArt && (
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <img src={spotify.albumArt} alt="" className="w-full h-full object-cover blur-3xl scale-125 opacity-[0.15]" />
              </div>
            )}
            <div className="relative p-4 space-y-3">
              <div className="flex items-center gap-2">
                <SiSpotify className="h-3.5 w-3.5 text-primary shrink-0" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary flex-1 truncate">
                  {spotifyLabel}
                </p>
                <a
                  href="https://open.spotify.com/user/zaccesss"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Spotify profile"
                  className="text-foreground/60 hover:text-foreground transition-colors shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                {/* Spinning disc — replaces the static square artwork */}
                <div className={`relative w-14 h-14 rounded-full shrink-0 ${spotify.playing ? "animate-spin [animation-duration:6s]" : ""}`}>
                  <div className="absolute inset-0 rounded-full border-2 border-border/40" />
                  {spotify.albumArt ? (
                    <img src={spotify.albumArt} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-muted-foreground/40 text-lg">♫</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-card/80 border border-border/60" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 relative">
                  <MarqueeText text={spotify.track ?? ""} active={spotify.playing} className="font-semibold text-sm leading-tight" />
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{spotify.artist}</p>
                </div>
                {spotify.paused && (
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    &#9646;&#9646; paused
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      spotify.playing ? "bg-primary" : "bg-muted-foreground/40"
                    )}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{formatMs(liveProgressMs)}</span>
                  <span>{formatMs(spotify.durationMs ?? 0)}</span>
                </div>
              </div>
              {/* Visualiser bars + sine wave — embedded directly in this card */}
              <SpotifyBars
                playing={spotify.playing}
                albumArt={spotify.albumArt}
                energy={spotify.audioFeatures?.energy}
                tempo={spotify.audioFeatures?.tempo}
              />
            </div>
          </div>
        ) : spotify.lastPlayed ? (
          // I render last_played at reduced opacity with a grayscale thumbnail to signal the track is not currently active
          <div className="p-4 space-y-3 opacity-50">
            <div className="flex items-center gap-2">
              <SiSpotify className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">
                Last Played
              </p>
              <a
                href="https://open.spotify.com/user/zaccesss"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Spotify profile"
                className="text-foreground/60 hover:text-foreground transition-colors shrink-0"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center gap-3">
              {spotify.lastPlayed.albumArt ? (
                <Image
                  src={spotify.lastPlayed.albumArt}
                  alt={spotify.lastPlayed.track}
                  width={56}
                  height={56}
                  sizes="56px"
                  className="rounded-lg shrink-0 shadow-sm grayscale"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                  <span className="text-2xl">♫</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{spotify.lastPlayed.track}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{spotify.lastPlayed.artist}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <span className="text-muted-foreground text-lg">♫</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <SiSpotify className="h-3 w-3 text-primary shrink-0" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Spotify
                </p>
                <a
                  href="https://open.spotify.com/user/zaccesss"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Spotify profile"
                  className="ml-auto text-foreground/60 hover:text-foreground transition-colors shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground">Nothing playing</p>
            </div>
          </div>
        )}
      </div>

      {/* 2x2 device grid */}
      <div className="grid grid-cols-2 gap-3 items-start">

        {/* MacBook */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Laptop className={cn("h-4 w-4 shrink-0", online ? "text-foreground" : "text-muted-foreground/40")} />
            <p className={cn("text-xs font-semibold truncate", online ? "" : "text-foreground/50")}>{mac.device ?? "MacBook Air"}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              {online ? (
                <Wifi className="h-3 w-3 text-primary shrink-0" />
              ) : (
                <WifiOff className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              )}
              <span className={cn("text-xs", online ? "text-blue-500" : "text-muted-foreground/60")}>
                {seenText}
              </span>
            </div>
            {mac.battery !== null ? (
              <div className="flex items-center gap-1.5">
                {/* I suppress the charging indicator when lastSeen > 5 min - the cable may have been unplugged since the last ping */}
                {mac.charging && !isStale(mac.lastSeen) ? (
                  <BatteryCharging className="h-3.5 w-3.5 text-primary shrink-0" />
                ) : (
                  <Battery className={cn("h-3.5 w-3.5 shrink-0", mac.battery <= 20 ? "text-red-500" : "text-muted-foreground")} />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {mac.battery}%
                  {mac.charging && !isStale(mac.lastSeen) && <span className="text-blue-500"> charging</span>}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/40">no data</p>
            )}
          </div>
        </div>

        {/* Lenovo */}
        {(() => {
          const { text: lSeenText, online: lOnline } = relativeLastSeen(lenovo.lastSeen)
          return (
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Laptop className={cn("h-4 w-4 shrink-0", lOnline ? "text-foreground" : "text-muted-foreground/40")} />
                <p className={cn("text-xs font-semibold truncate", lOnline ? "" : "text-foreground/50")}>{lenovo.device ?? "Lenovo"}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {lOnline ? (
                    <Wifi className="h-3 w-3 text-primary shrink-0" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={cn("text-xs", lOnline ? "text-blue-500" : "text-muted-foreground/60")}>
                    {lSeenText}
                  </span>
                </div>
                {lenovo.battery !== null ? (
                  <div className="flex items-center gap-1.5">
                    {lenovo.charging && !isStale(lenovo.lastSeen) ? (
                      <BatteryCharging className="h-3.5 w-3.5 text-primary shrink-0" />
                    ) : (
                      <Battery className={cn("h-3.5 w-3.5 shrink-0", lenovo.battery <= 20 ? "text-red-500" : "text-muted-foreground")} />
                    )}
                    <span className="text-xs font-mono text-muted-foreground">
                      {lenovo.battery}%
                      {lenovo.charging && !isStale(lenovo.lastSeen) && <span className="text-blue-500"> charging</span>}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/40">no data</p>
                )}
              </div>
            </div>
          )
        })()}

        {/* Gaming PC */}
        {(() => {
          const { text: gSeenText, online: gOnline } = relativeLastSeen(gamingPC.lastSeen)
          return (
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className={cn("h-4 w-4 shrink-0", gOnline ? "text-foreground" : "text-muted-foreground/40")} />
                <p className={cn("text-xs font-semibold truncate", gOnline ? "" : "text-foreground/50")}>{gamingPC.device ?? "Gaming PC"}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {gOnline ? (
                    <Wifi className="h-3 w-3 text-primary shrink-0" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  )}
                  <span className={cn("text-xs", gOnline ? "text-blue-500" : "text-muted-foreground/40")}>
                    {gamingPC.lastSeen ? gSeenText : "offline"}
                  </span>
                </div>
                {gOnline && (gamingPC.cpu || gamingPC.gpu) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {gamingPC.cpu && <>CPU: {gamingPC.cpu}</>}
                    {gamingPC.cpu && gamingPC.gpu && <span className="mx-1 text-foreground/30 dark:text-foreground/25">|</span>}
                    {gamingPC.gpu && <>GPU: {gamingPC.gpu}</>}
                  </p>
                )}
                {gOnline && gamingPC.currentGame && (
                  <div className="flex items-start justify-between gap-2 mt-0.5">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Playing</p>
                      <p className="text-xs font-medium truncate">{gamingPC.currentGame}</p>
                    </div>
                    {gamingPC.gameImage && (
                      <Image src={gamingPC.gameImage} alt={gamingPC.currentGame} width={40} height={40} className="h-10 w-10 rounded shrink-0 object-cover" unoptimized />
                    )}
                  </div>
                )}
                {!gOnline && !gamingPC.lastSeen && (
                  <p className="text-xs text-muted-foreground/30">daemon not set up</p>
                )}
              </div>
            </div>
          )
        })()}

        {/* PS5 */}
        {(() => {
          // The PS5 worker cron runs every 2 minutes, so a 3 minute threshold covers a
          // missed/delayed tick without showing "last seen Xm ago" while still online
          const { text: pSeenText, online: pOnline } = relativeLastSeen(ps5Data.lastSeen, 3)
          return (
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <SiPlaystation className={cn("h-4 w-4 shrink-0", pOnline ? "text-foreground" : "text-muted-foreground/40")} />
                <p className={cn("text-xs font-semibold truncate", pOnline ? "" : "text-foreground/50")}>ZACCESS-PS5</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {pOnline ? (
                    <Wifi className="h-3 w-3 text-primary shrink-0" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  )}
                  <span className={cn("text-xs", pOnline ? "text-blue-500" : "text-muted-foreground/40")}>
                    {ps5Data.lastSeen ? pSeenText : "offline"}
                  </span>
                  {/* I always show Busy next to the online indicator when in do-not-disturb,
                      regardless of whether a game is playing */}
                  {ps5Data.busy && (
                    <>
                      <span className="text-xs text-muted-foreground/30">·</span>
                      <span className="text-xs text-amber-500/80 font-medium">Busy</span>
                    </>
                  )}
                </div>
                {ps5Data.online && ps5Data.game ? (
                  <div className="flex items-start justify-between gap-2 pt-0.5">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{ps5Data.status}</p>
                      <p className="text-xs font-medium truncate">{ps5Data.game}</p>
                    </div>
                    {ps5Data.gameImage && (
                      <img
                        src={ps5Data.gameImage}
                        alt={ps5Data.game}
                        className="h-10 w-10 rounded shrink-0 object-cover"
                      />
                    )}
                  </div>
                ) : ps5Data.online && ps5Data.status !== "Online" && ps5Data.status !== "Offline" && ps5Data.status !== "Busy" ? (
                  <p className="text-xs text-muted-foreground">{ps5Data.status}</p>
                ) : null}
                {/* I show the last known game at reduced opacity when offline - image on the right, game name below label */}
                {!ps5Data.online && ps5Data.lastGame && (
                  <div className="flex items-start justify-between gap-2 pt-0.5 opacity-40">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Last played</p>
                      <p className="text-xs text-muted-foreground truncate">{ps5Data.lastGame}</p>
                    </div>
                    {ps5Data.lastGameImage && (
                      <img
                        src={ps5Data.lastGameImage}
                        alt={ps5Data.lastGame}
                        className="h-10 w-10 rounded shrink-0 object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

      </div>

      {/* GitHub strip - always visible, above the conditional Discord card */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm py-3 px-4 flex items-center gap-2 text-sm">
        <Github className="h-4 w-4 text-foreground/60 dark:text-foreground/50 shrink-0" />
        <span className="text-foreground/30 dark:text-foreground/25 select-none">|</span>
        <GitBranch className="h-3.5 w-3.5 text-foreground/50 dark:text-foreground/40 shrink-0" />
        {github.repo ? (
          <>
            <span className="text-xs text-muted-foreground">pushed</span>
            <span className="text-xs font-medium text-foreground/80 truncate">{github.repo}</span>
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <span className="text-xs text-muted-foreground/50">{github.relativeTime}</span>
              <span className="text-foreground/20 dark:text-foreground/15 select-none">|</span>
              <a
                href="https://github.com/zaccesss"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground/40">no recent activity</span>
            <a
              href="https://github.com/zaccesss"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="ml-auto text-foreground/60 hover:text-foreground transition-colors shrink-0"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </>
        )}
      </div>

      {/* Discord / Lanyard card */}
      {(alwaysShowDiscord || (lanyard && lanyard.discord_status !== "offline")) && (() => {
        const offline = !lanyard || lanyard.discord_status === "offline"
        // I sort Playing (type 0) before Watching (type 3) to match Discord's own display order
        const richActivities = !offline
          ? lanyard!.activities.filter((a) => a.type !== 4).sort((a, b) => a.type - b.type)
          : []
        const customStatus = !offline ? lanyard!.activities.find((a) => a.type === 4) : null
        const statusLabel = offline
          ? "offline"
          : lanyard!.discord_status === "dnd" ? "do not disturb" : lanyard!.discord_status

        return (
          <div className={cn("rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-2.5", offline && "opacity-50")}>
            <div className="flex items-center gap-2">
              <SiDiscord className="h-3.5 w-3.5 text-[#5865f2] shrink-0" />
              <span className="text-xs font-semibold">zac</span>
              <div className={cn("h-2 w-2 rounded-full shrink-0 ml-0.5", offline ? "bg-muted-foreground/40" : STATUS_COLOR[lanyard!.discord_status])} />
              <span className="text-xs text-muted-foreground capitalize">{statusLabel}</span>
              <a
                href="https://discord.com/users/1087417301583790212"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord profile"
                className="ml-auto text-foreground/60 hover:text-foreground transition-colors shrink-0"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {!offline && richActivities.length > 0 && (
              <div className="space-y-2">
                {richActivities.map((activity, i) => {
                  const iconUrl = activityIconUrl(activity)
                  const smallIconUrl = activitySmallIconUrl(activity)
                  const timestamp = activityTimestamp(activity)
                  return (
                    <div key={i} className={cn("flex gap-2.5", i > 0 && "pt-2 border-t border-border/40")}>
                      {iconUrl && (
                        <div className="relative shrink-0 h-10 w-10">
                          <img
                            src={iconUrl}
                            alt={activity.assets?.large_text ?? activity.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          {smallIconUrl && (
                            <img
                              src={smallIconUrl}
                              alt={activity.assets?.small_text ?? ""}
                              title={activity.assets?.small_text ?? ""}
                              className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card object-cover bg-card"
                            />
                          )}
                        </div>
                      )}
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40 shrink-0">
                            {activity.type === 2 ? "Listening" : activity.type === 3 ? "Watching" : "Playing"}
                          </span>
                          {timestamp && (
                            <span className="text-[10px] text-muted-foreground/40 ml-auto shrink-0 font-mono">
                              {timestamp}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{activity.name}</p>
                        {activity.details && (
                          <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                        )}
                        {activity.state && (
                          <p className="text-xs text-muted-foreground/60 truncate">{activity.state}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {!offline && richActivities.length === 0 && customStatus?.state && (
              <p className="text-xs text-muted-foreground truncate">{customStatus.state}</p>
            )}
            {offline && alwaysShowDiscord && (
              <p className="text-xs text-muted-foreground">
                {lanyardLastOnline ? `last seen ${elapsedSince(lanyardLastOnline)} ago` : "not seen this session"}
              </p>
            )}
          </div>
        )
      })()}

    </div>
  )
}