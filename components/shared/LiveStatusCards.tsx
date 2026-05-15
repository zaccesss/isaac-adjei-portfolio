"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Laptop, BatteryCharging, Battery, Wifi, WifiOff, Github } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpotifyData {
  playing: boolean
  paused: boolean
  track?: string
  artist?: string
  albumArt?: string
  url?: string
  progressMs?: number
  durationMs?: number
}

interface MacbookData {
  battery: number | null
  charging: boolean | null
  lastSeen: string | null
  device: string | null
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

function relativeLastSeen(ts: string | null): { text: string; online: boolean } {
  if (!ts) return { text: "offline", online: false }
  const diff = Date.now() - new Date(ts).getTime()
  const online = diff < 5 * 60 * 1000
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return { text: "online now", online: true }
  if (mins < 60) return { text: `last seen ${mins}m ago`, online: false }
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return { text: `last seen ${hrs}h ago`, online: false }
  return { text: `last seen ${Math.floor(hrs / 24)}d ago`, online: false }
}

function londonTime(): string {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

function londonTz(): string {
  return (
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      timeZoneName: "short",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT"
  )
}

export default function LiveStatusCards() {
  const [time, setTime] = useState("")
  const [tz, setTz] = useState("")
  const [spotify, setSpotify] = useState<SpotifyData>({ playing: false, paused: false })
  const [mac, setMac] = useState<MacbookData>({
    battery: null,
    charging: null,
    lastSeen: null,
    device: null,
  })

  useEffect(() => {
    const tick = () => {
      setTime(londonTime())
      setTz(londonTz())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/spotify")
        if (res.ok) setSpotify(await res.json())
      } catch {}
    }
    fetch_()
    const id = setInterval(fetch_, 30000)
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

  const { text: seenText, online } = relativeLastSeen(mac.lastSeen)
  const hasTrack = spotify.playing || spotify.paused
  const progress =
    hasTrack && spotify.durationMs
      ? (spotify.progressMs ?? 0) / spotify.durationMs
      : 0

  return (
    <div className="w-full max-w-md mx-auto space-y-3 text-left">

      {/* Spotify card */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {hasTrack ? (
          <div className="p-4 space-y-3">
            {/* Label */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-500">
              {spotify.playing ? "Currently Listening..." : "Paused"}
            </p>

            {/* Track row */}
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

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    spotify.playing ? "bg-green-500" : "bg-muted-foreground/40"
                  )}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>{formatMs(spotify.progressMs ?? 0)}</span>
                <span>{formatMs(spotify.durationMs ?? 0)}</span>
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

      {/* MacBook + Time row */}
      <div className="grid grid-cols-2 gap-3">

        {/* MacBook card */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-xs font-semibold truncate">
              {mac.device ?? "MacBook Air"}
            </p>
          </div>

          <div className="space-y-1.5">
            {/* Online indicator */}
            <div className="flex items-center gap-1.5">
              {online ? (
                <Wifi className="h-3 w-3 text-green-500 shrink-0" />
              ) : (
                <WifiOff className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs",
                  online ? "text-green-500" : "text-muted-foreground/60"
                )}
              >
                {seenText}
              </span>
            </div>

            {/* Battery */}
            {mac.battery !== null ? (
              <div className="flex items-center gap-1.5">
                {mac.charging ? (
                  <BatteryCharging className="h-3.5 w-3.5 text-green-500 shrink-0" />
                ) : (
                  <Battery
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      mac.battery <= 20
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {mac.battery}%
                  {mac.charging && (
                    <span className="text-green-500"> charging</span>
                  )}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/40">offline</p>
            )}

            {/* GitHub last push */}
            {github.repo && (
              <div className="flex items-center gap-1.5">
                <Github className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  pushed{" "}
                  <span className="text-foreground/70">{github.repo}</span>{" "}
                  <span className="text-muted-foreground/50">{github.relativeTime}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* London time card */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 flex flex-col justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Currently in London, UK
          </p>
          <div>
            <p className="text-xl font-semibold font-mono tabular-nums leading-tight">
              {time || " "}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{tz || "local time"}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
