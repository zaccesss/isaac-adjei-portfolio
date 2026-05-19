"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Laptop, BatteryCharging, Battery, Wifi, WifiOff, GitBranch, Monitor, Github } from "lucide-react"
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

interface GithubData {
  repo: string | null
  relativeTime: string | null
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
  const [github, setGithub] = useState<GithubData>({ repo: null, relativeTime: null })
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
    const id = setInterval(fetch_, 60000)
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
    const reset = setTimeout(() => {
      setLiveProgressMs(spotify.progressMs ?? 0)
    }, 0)
    if (!spotify.playing) return () => clearTimeout(reset)
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
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{spotify.track}</p>
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

      {/* 2x2 device + github grid */}
      <div className="grid grid-cols-2 gap-3">

        {/* MacBook */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-xs font-semibold truncate">{mac.device ?? "MacBook Air"}</p>
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
                {mac.charging ? (
                  <BatteryCharging className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                ) : (
                  <Battery className={cn("h-3.5 w-3.5 shrink-0", mac.battery <= 20 ? "text-red-500" : "text-muted-foreground")} />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {mac.battery}%
                  {mac.charging && <span className="text-blue-500"> charging</span>}
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
                <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs font-semibold truncate">{lenovo.device ?? "Lenovo"}</p>
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
                    {lenovo.charging ? (
                      <BatteryCharging className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <Battery className={cn("h-3.5 w-3.5 shrink-0", lenovo.battery <= 20 ? "text-red-500" : "text-muted-foreground")} />
                    )}
                    <span className="text-xs font-mono text-muted-foreground">
                      {lenovo.battery}%
                      {lenovo.charging && <span className="text-blue-500"> charging</span>}
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
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <p className="text-xs font-semibold text-foreground/50 truncate">ZACCESS-GPC</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <WifiOff className="h-3 w-3 text-muted-foreground/30 shrink-0" />
              <span className="text-xs text-muted-foreground/40">offline</span>
            </div>
            <p className="text-xs text-muted-foreground/30">daemon not set up</p>
          </div>
        </div>

        {/* GitHub last pushed */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Github className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground/40 text-xs select-none">|</span>
            <GitBranch className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          {github.repo ? (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">
                pushed <span className="font-medium text-foreground/80">{github.repo}</span>
              </p>
              <p className="text-xs text-muted-foreground/50">{github.relativeTime}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/40">no recent activity</p>
          )}
        </div>

      </div>
    </div>
  )
}
