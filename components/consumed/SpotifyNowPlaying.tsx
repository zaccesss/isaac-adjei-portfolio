"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

type SpotifyState = {
  playing: boolean
  paused?: boolean
  track?: string
  artist?: string
  albumArt?: string | null
  progressMs?: number
  durationMs?: number
  lastPlayed?: { track: string; artist: string; albumArt?: string | null } | null
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  return `${m}:${String(sec).padStart(2, "0")}`
}

export function SpotifyNowPlaying() {
  const [data, setData] = useState<SpotifyState>({ playing: false })
  const [progressMs, setProgressMs] = useState(0)

  useEffect(() => {
    async function poll() {
      if (document.hidden) return
      try {
        const res = await fetch("/api/spotify")
        if (res.ok) {
          const d: SpotifyState = await res.json()
          setData(d)
          setProgressMs(d.progressMs ?? 0)
        }
      } catch {}
    }
    poll()
    // I poll faster than the 20s edge cache TTL on /api/spotify on purpose: a poll that lands
    // inside that window is served straight from Cloudflare's cache at no real cost, so this
    // makes the widget feel current without increasing how often Spotify or Vercel actually get hit
    const id = setInterval(poll, 8000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!data.playing) return
    const id = setInterval(() => {
      setProgressMs((p) => Math.min(p + 1000, data.durationMs ?? p))
    }, 1000)
    return () => clearInterval(id)
  }, [data.playing, data.durationMs])

  const hasTrack = data.playing || data.paused
  const progress = hasTrack && data.durationMs ? progressMs / data.durationMs : 0
  const displayTrack = hasTrack
    ? { track: data.track, artist: data.artist, albumArt: data.albumArt }
    : data.lastPlayed
    ? { track: data.lastPlayed.track, artist: data.lastPlayed.artist, albumArt: data.lastPlayed.albumArt }
    : null
  const label = data.playing ? "Live on Spotify" : data.paused ? "Paused" : "Last Played"

  if (!displayTrack) return null

  return (
    <div className="w-full max-w-sm">
      <div className={cn("rounded-xl border border-border/60 bg-card p-4 space-y-3", data.paused && "opacity-70")}>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold uppercase tracking-widest", data.playing ? "text-green-500" : "text-muted-foreground")}>
            {label}
          </span>
          <a href="https://open.spotify.com/user/zaccesss" target="_blank" rel="noopener noreferrer" aria-label="Open Spotify profile" className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {displayTrack ? (
          <div className="flex items-center gap-3">
            {displayTrack.albumArt ? (
              <Image src={displayTrack.albumArt} alt={displayTrack.track ?? "Album art"} width={48} height={48} className="rounded-lg shrink-0" unoptimized />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center text-lg">♫</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{displayTrack.track}</p>
              <p className="text-xs text-muted-foreground truncate">{displayTrack.artist}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Not listening to anything right now.</p>
        )}
        {hasTrack && data.durationMs && (
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", data.playing ? "bg-green-500" : "bg-muted-foreground/40")}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>{formatMs(progressMs)}</span>
              <span>{formatMs(data.durationMs)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
