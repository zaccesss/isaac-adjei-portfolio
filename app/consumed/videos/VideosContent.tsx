"use client"
// I render the /consumed/videos subpage with month filtering and inline YouTube playback.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Tv2 } from "lucide-react"
import { videos, MONTHS, isMonthAvailable, sortByRecency, yearsFrom } from "@/data/consumed"
import { VideoCard } from "@/components/consumed/VideoCard"
import { ConsumedFilterBar } from "@/components/consumed/ConsumedFilterBar"
import { ConsumedCategoryTabs } from "@/components/consumed/ConsumedCategoryTabs"

export default function VideosContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeYear, setActiveYear] = useState<string>("all")
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [activeVideos, setActiveVideos] = useState<Set<string>>(new Set())

  const years = yearsFrom(videos)
  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, new Date().getFullYear(), preview))
  const filtered = sortByRecency(
    videos
      .filter((v) => isMonthAvailable(v.month, v.year, preview))
      .filter((v) => activeYear === "all" || String(v.year) === activeYear)
      .filter((v) => activeMonth === "all" || v.month === activeMonth)
      .filter((v) => !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.channel.toLowerCase().includes(search.toLowerCase()) || v.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  )

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

      <ConsumedFilterBar
        years={years}
        activeYear={activeYear}
        onYearChange={setActiveYear}
        months={availableMonths}
        activeMonth={activeMonth}
        onMonthChange={setActiveMonth}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search videos by title, channel or tag..."
      />

      <ConsumedCategoryTabs active="videos" counts={{ videos: filtered.length }} />

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
