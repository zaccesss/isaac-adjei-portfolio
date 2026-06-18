"use client"
// I render the /consumed/videos subpage with month filtering and inline YouTube playback.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Tv2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { videos, MONTHS, MONTH_CHIP, isMonthAvailable, type Month } from "@/data/consumed"
import { VideoCard } from "@/components/consumed/VideoCard"

export default function VideosContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [activeVideos, setActiveVideos] = useState<Set<string>>(new Set())

  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, preview))
  const filtered = videos
    .filter((v) => isMonthAvailable(v.month, preview))
    .filter((v) => activeMonth === "all" || v.month === activeMonth)

  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4 max-w-2xl">
        <Link
          href="/consumed"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Consumed
        </Link>
        <div className="flex items-center gap-3">
          <Tv2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Videos</h1>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          YouTube videos and playlists watched throughout the year. Lectures, tutorials, conference talks, music videos and everything in between. Click any thumbnail to play inline.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Year</span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary font-medium">2026</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveMonth("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeMonth === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            All
          </button>
          {availableMonths.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setActiveMonth(m)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeMonth === m
                  ? cn("border-current", MONTH_CHIP[m])
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No videos for this month yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              active={activeVideos.has(v.id)}
              onActivate={() => setActiveVideos((prev) => new Set([...prev, v.id]))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
