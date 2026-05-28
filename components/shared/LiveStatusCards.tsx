"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Laptop, BatteryCharging, Battery, Wifi, WifiOff, GitBranch, Monitor, Github, ExternalLink } from "lucide-react"
import { SiPlaystation } from "react-icons/si"
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
  device: string | null
}

interface GithubData {
  repo: string | null
  relativeTime: string | null
}

interface PS5Data {
  online: boolean
  lastSeen: string | null
  status: string
  game: string | null
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
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

function relativeLastSeen(ts: string | null): { text: string; online: boolean } {
  if (!ts) return { text: "offline", online: false }
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return { text: "online now", online: true }
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

export default function LiveStatusCards() {
  const [time, setTime] = useState("")
  const [tz, setTz] = useState("")
  const [spotify, setSpotify] = useState<SpotifyData>({ playing: false, paused: false })
  const [mac, setMac] = useState<MacbookData>({
    battery: null, charging: null, lastSeen: null, device: null,
    countryCode: null, timezone: "Europe/London",
    weatherCondition: null, weatherEmoji: null, tempC: null,
  })
  const [lenovo, setLenovo] = useState<LenovoData>({ battery: null, charging: null, lastSeen: null, device: null })
  const [gamingPC, setGamingPC] = useState<GamingPCData>({ online: false, lastSeen: null, gpu: null, cpu: null, currentGame: null, device: "ZACCESS-GPC" })
  const [github, setGithub] = useState<GithubData>({ repo: null, relativeTime: null })
  const [ps5Data, setPs5Data] = useState<PS5Data>({ online: false, lastSeen: null, status: "Offline", game: null })
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

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/spotify")
        if (res.ok) setSpotify(await res.json())
      } catch {}
    }
    fetch_()
    // I poll every 10s - Spotify updates its playing state roughly that fast and polling more often wastes API quota
    const id = setInterval(fetch_, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/macbook")
        if (res.ok) setMac(await res.json())
      } catch {}
    }
    fetch_()
    // I poll every 60s - battery and location change slowly so a tighter interval would just burn Vercel invocations
    const id = setInterval(fetch_, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/lenovo")
        if (res.ok) setLenovo(await res.json())
      } catch {}
    }
    fetch_()
    // Lenovo battery changes slowly - 60s matches the macbook poll cadence
    const id = setInterval(fetch_, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/gpc")
        if (res.ok) {
          const data = await res.json()
          setGamingPC({
            online:      data.online,
            lastSeen:    data.lastSeen,
            device:      data.device,
            // I format the percentages here because the API returns raw numbers and the card needs the % suffix
            cpu:         data.cpu !== null ? `${data.cpu}%` : null,
            gpu:         data.gpu !== null ? `${data.gpu}%` : null,
            currentGame: data.game,
          })
        }
      } catch {}
    }
    fetch_()
    // I poll every 30s - the GPC daemon writes every ~10s so 30s gives a fresh-enough online signal without excess calls
    const id = setInterval(fetch_, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/github-activity")
        if (res.ok) setGithub(await res.json())
      } catch {}
    }
    fetch_()
    const id = setInterval(fetch_, 300000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/ps5")
        if (res.ok) setPs5Data(await res.json())
      } catch {}
    }
    fetch_()
    // I poll every 60s - matches the daemon write interval so data is always within one cycle of fresh
    const id = setInterval(fetch_, 60000)
    return () => clearInterval(id)
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
          <div className="p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-500">
              {spotifyLabel}
            </p>
            <div className="flex items-center gap-3">
              {spotify.albumArt ? (
                <Image
                  src={spotify.albumArt}
                  alt={spotify.track ?? "Album art"}
                  width={56}
                  height={56}
                  className="rounded-lg shrink-0 shadow-sm"
                  unoptimized
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                  <span className="text-2xl">♫</span>
                </div>
              )}
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
                    spotify.playing ? "bg-blue-500" : "bg-muted-foreground/40"
                  )}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>{formatMs(liveProgressMs)}</span>
                <span>{formatMs(spotify.durationMs ?? 0)}</span>
              </div>
            </div>
          </div>
        ) : spotify.lastPlayed ? (
          // I render last_played at reduced opacity with a grayscale thumbnail to signal the track is not currently active
          <div className="p-4 space-y-3 opacity-50">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Last Played
            </p>
            <div className="flex items-center gap-3">
              {spotify.lastPlayed.albumArt ? (
                <Image
                  src={spotify.lastPlayed.albumArt}
                  alt={spotify.lastPlayed.track}
                  width={56}
                  height={56}
                  className="rounded-lg shrink-0 shadow-sm grayscale"
                  unoptimized
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
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Spotify
              </p>
              <p className="text-sm text-muted-foreground">Nothing playing</p>
            </div>
          </div>
        )}
      </div>

      {/* 2x2 device grid */}
      <div className="grid grid-cols-2 gap-3">

        {/* MacBook */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Laptop className={cn("h-4 w-4 shrink-0", online ? "text-foreground" : "text-muted-foreground/40")} />
            <p className={cn("text-xs font-semibold truncate", online ? "" : "text-foreground/50")}>{mac.device ?? "MacBook Air"}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              {online ? (
                <Wifi className="h-3 w-3 text-blue-500 shrink-0" />
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
                  <BatteryCharging className="h-3.5 w-3.5 text-blue-500 shrink-0" />
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
                    <Wifi className="h-3 w-3 text-blue-500 shrink-0" />
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
                      <BatteryCharging className="h-3.5 w-3.5 text-blue-500 shrink-0" />
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
                    <Wifi className="h-3 w-3 text-blue-500 shrink-0" />
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
                  <p className="text-xs text-muted-foreground truncate">Playing: {gamingPC.currentGame}</p>
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
          const { text: pSeenText, online: pOnline } = relativeLastSeen(ps5Data.lastSeen)
          return (
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <SiPlaystation className={cn("h-4 w-4 shrink-0", pOnline ? "text-foreground" : "text-muted-foreground/40")} />
                <p className={cn("text-xs font-semibold truncate", pOnline ? "" : "text-foreground/50")}>ZACCESS-PS5</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {pOnline ? (
                    <Wifi className="h-3 w-3 text-blue-500 shrink-0" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  )}
                  <span className={cn("text-xs", pOnline ? "text-blue-500" : "text-muted-foreground/40")}>
                    {ps5Data.lastSeen ? pSeenText : "offline"}
                  </span>
                </div>
                {ps5Data.status !== "Online" && ps5Data.status !== "Offline" && (
                  <p className="text-xs text-muted-foreground">{ps5Data.status}</p>
                )}
                {ps5Data.online && ps5Data.game && (
                  <p className="text-xs text-muted-foreground truncate">{ps5Data.game}</p>
                )}
              </div>
            </div>
          )
        })()}

      </div>

      {/* GitHub strip */}
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
    </div>
  )
}
