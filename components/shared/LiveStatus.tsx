"use client"

import { useEffect, useState } from "react"
import { Music, Clock, Battery, BatteryCharging, Github } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpotifyData {
  playing: boolean
  track?: string
  artist?: string
  url?: string
}

interface MacbookData {
  battery: number | null
  charging: boolean | null
  lastSeen: string | null
}

interface GithubData {
  repo: string | null
  relativeTime: string | null
}

interface LiveStatusProps {
  variant?: "terminal" | "card"
}

function isOnline(lastSeen: string | null): boolean {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000
}

function londonTime(): string {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function londonTimezone(): string {
  const tz = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "short" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")
  return tz?.value ?? "GMT"
}

export default function LiveStatus({ variant = "card" }: LiveStatusProps) {
  const [time, setTime] = useState(londonTime())
  const [tz, setTz] = useState(londonTimezone())
  const [spotify, setSpotify] = useState<SpotifyData>({ playing: false })
  const [mac, setMac] = useState<MacbookData>({ battery: null, charging: null, lastSeen: null })
  const [github, setGithub] = useState<GithubData>({ repo: null, relativeTime: null })

  useEffect(() => {
    const tick = setInterval(() => {
      setTime(londonTime())
      setTz(londonTimezone())
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    let es: EventSource | null = null

    const onSnapshot = (e: MessageEvent) => {
      try {
        const { spotify: s, macbook, github: g } = JSON.parse(e.data)
        if (s) setSpotify(s)
        if (macbook) setMac(macbook)
        if (g) setGithub(g)
      } catch {}
    }
    // Fast Spotify-only event so song changes show in near-realtime, not just on the 2-min snapshot
    const onSpotify = (e: MessageEvent) => {
      try { setSpotify(JSON.parse(e.data)) } catch {}
    }

    const connect = () => {
      if (es) return
      es = new EventSource("/api/live-status/stream")
      es.onmessage = onSnapshot
      es.addEventListener("spotify", onSpotify as EventListener)
    }
    const disconnect = () => { es?.close(); es = null }

    // I pause the stream while the tab is hidden so a backgrounded page costs nothing -
    // this is what keeps many open tabs from quietly burning server CPU all day
    const onVisibility = () => {
      if (document.visibilityState === "visible") connect()
      else disconnect()
    }

    if (document.visibilityState === "visible") connect()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      disconnect()
    }
  }, [])

  const online = isOnline(mac.lastSeen)

  if (variant === "terminal") {
    return (
      <div className="font-mono text-xs text-zinc-400 flex items-center gap-3 flex-wrap px-1 py-2 border-b border-zinc-800/60">
        {/* Online dot */}
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block w-1.5 h-1.5 rounded-full",
              online ? "bg-blue-500 animate-pulse" : "bg-zinc-600"
            )}
          />
          <span className={online ? "text-blue-500" : "text-zinc-600"}>
            {online ? "online" : "away"}
          </span>
        </span>

        <span className="text-zinc-700">·</span>

        {/* Spotify */}
        <span className="flex items-center gap-1">
          <span className={spotify.playing ? "text-blue-400" : "text-zinc-600"}>♫</span>
          <span className={spotify.playing ? "text-zinc-300" : "text-zinc-600"}>
            {spotify.playing && spotify.track
              ? `${spotify.track} - ${spotify.artist}`
              : "I'm not playing anything"}
          </span>
        </span>

        <span className="text-zinc-700">·</span>

        {/* Time */}
        <span className="text-zinc-400">
          {time} <span className="text-zinc-600">{tz}</span>
        </span>

        {/* Battery */}
        {mac.battery !== null && (
          <>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-400">
              {mac.battery}%{mac.charging ? " ⚡" : ""}
            </span>
          </>
        )}

        {/* GitHub */}
        {github.repo && (
          <>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-400">
              pushed <span className="text-zinc-300">{github.repo}</span>{" "}
              <span className="text-zinc-600">{github.relativeTime}</span>
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      {/* Online dot */}
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "inline-block w-2 h-2 rounded-full shrink-0",
            online ? "bg-blue-500 animate-pulse" : "bg-muted-foreground/30"
          )}
        />
        <span className={cn("text-xs font-mono", online ? "text-blue-500" : "text-muted-foreground/50")}>
          {online ? "online" : "away"}
        </span>
      </span>

      {/* Spotify */}
      <span className="flex items-center gap-1.5 min-w-0">
        <Music className={cn("h-3.5 w-3.5 shrink-0", spotify.playing ? "text-blue-500" : "text-muted-foreground/40")} />
        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
          {spotify.playing && spotify.track
            ? `${spotify.track} - ${spotify.artist}`
            : "I'm not playing anything"}
        </span>
      </span>

      {/* Time */}
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
        <span className="text-xs text-muted-foreground font-mono">
          {time} <span className="text-muted-foreground/50">{tz}</span>
        </span>
      </span>

      {/* Battery */}
      {mac.battery !== null && (
        <span className="flex items-center gap-1.5">
          {mac.charging
            ? <BatteryCharging className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            : <Battery className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
          <span className="text-xs text-muted-foreground font-mono">
            {mac.battery}%{mac.charging ? " ⚡" : ""}
          </span>
        </span>
      )}

      {/* GitHub */}
      {github.repo && (
        <span className="flex items-center gap-1.5">
          <Github className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-xs text-muted-foreground">
            pushed <span className="text-foreground/70">{github.repo}</span>{" "}
            <span className="text-muted-foreground/50">{github.relativeTime}</span>
          </span>
        </span>
      )}
    </div>
  )
}
