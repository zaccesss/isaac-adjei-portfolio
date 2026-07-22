"use client"
// I render the /consumed/podcasts subpage with Spotify embeds and month filtering.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Headphones } from "lucide-react"
import { podcasts, MONTHS, isMonthAvailable, sortByRecency, yearsFrom } from "@/data/consumed"
import { ConsumedFilterBar } from "@/components/consumed/ConsumedFilterBar"
import { ConsumedCategoryTabs } from "@/components/consumed/ConsumedCategoryTabs"
import { PodcastCard } from "@/components/consumed/PodcastCard"

export default function PodcastsContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeYear, setActiveYear] = useState<string>("all")
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [search, setSearch] = useState("")

  const years = yearsFrom(podcasts)
  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, new Date().getFullYear(), preview))
  const filtered = sortByRecency(
    podcasts
      .filter((p) => isMonthAvailable(p.month, p.year, preview))
      .filter((p) => activeYear === "all" || String(p.year) === activeYear)
      .filter((p) => activeMonth === "all" || p.month === activeMonth)
      .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.show.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4 max-w-2xl">
        <Link href="/consumed" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Consumed
        </Link>
        <div className="flex items-center gap-3">
          <Headphones className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Audio</h1>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Podcast episodes and shows listened to this year. Play them directly here where possible. Spans a wide range of topics: engineering, technology, culture, faith and long-form conversation.
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
        searchPlaceholder="Search podcasts by title or show..."
      />

      <ConsumedCategoryTabs active="audio" counts={{ audio: filtered.length }} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No audio for this month yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => <PodcastCard key={p.spotifyId} podcast={p} />)}
        </div>
      )}
    </div>
  )
}
