"use client"
// I render the full consumed content log with year/month/search filtering and category navigation.
// All data lives in data/consumed/. Card components live in components/consumed/.

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  BookOpen, Music2, Headphones, Tv2,
  Newspaper, BookMarked, Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  videos, podcasts, books, resources, articles, others,
  MONTHS, MONTH_CHIP, MONTH_NUMBER,
  isMonthAvailable, sortByRecency, yearsFrom,
  type Month,
} from "@/data/consumed"
import { ConsumedFilterBar } from "@/components/consumed/ConsumedFilterBar"
import { ConsumedCategoryTabs } from "@/components/consumed/ConsumedCategoryTabs"
import { VideoCard } from "@/components/consumed/VideoCard"
import { ResourceCard } from "@/components/consumed/ResourceCard"
import { LinkCard } from "@/components/consumed/LinkCard"
import { BookCard } from "@/components/consumed/BookCard"
import { PodcastCard } from "@/components/consumed/PodcastCard"

// A search hit if the query matches the title or any of the other text fields an item happens
// to carry (author, channel, show, genre, tags) - kept generic since every category shapes this
// data slightly differently.
function matchesSearch(item: Record<string, unknown>, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const fields = [item.title, item.author, item.channel, item.show, item.genre, item.source]
  if (fields.some((f) => typeof f === "string" && f.toLowerCase().includes(q))) return true
  const tags = item.tags
  return Array.isArray(tags) && tags.some((t) => typeof t === "string" && t.toLowerCase().includes(q))
}

export default function ConsumedContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"

  const [activeYear, setActiveYear] = useState<string>("all")
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [activeVideos, setActiveVideos] = useState<Set<string>>(new Set())

  const years = yearsFrom(videos, podcasts, books, resources, articles, others)
  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, new Date().getFullYear(), preview))

  const filterItems = <T extends { month: Month; year: number }>(items: T[]) => {
    const visible = sortByRecency(
      items
        .filter((i) => isMonthAvailable(i.month, i.year, preview))
        .filter((i) => activeYear === "all" || String(i.year) === activeYear)
        .filter((i) => activeMonth === "all" || i.month === activeMonth)
        .filter((i) => matchesSearch(i as unknown as Record<string, unknown>, search))
    )
    return visible
  }

  const filteredVideos    = filterItems(videos)
  const filteredPodcasts  = filterItems(podcasts)
  const filteredBooks     = filterItems(books)
  const filteredResources = filterItems(resources)
  const filteredArticles  = filterItems(articles)
  const filteredOthers    = filterItems(others)
  const totalFiltered     = filteredVideos.length + filteredPodcasts.length + filteredBooks.length + filteredResources.length + filteredArticles.length + filteredOthers.length

  const activateVideo = (id: string) =>
    setActiveVideos((prev) => new Set([...prev, id]))

  // Every distinct (year, month) combination actually present across the filtered items, newest
  // first - this is what makes the timeline show the most recent month block at the top instead
  // of January's block leading every single time.
  const periodKey = (year: number, month: Month) => `${year}-${month}`
  const periodsMap = new Map<string, { year: number; month: Month }>()
  for (const list of [filteredVideos, filteredPodcasts, filteredBooks, filteredResources, filteredArticles, filteredOthers]) {
    for (const item of list) periodsMap.set(periodKey(item.year, item.month), { year: item.year, month: item.month })
  }
  const periodsToShow = [...periodsMap.values()].sort(
    (a, b) => b.year - a.year || MONTH_NUMBER[b.month] - MONTH_NUMBER[a.month]
  )

  return (
    <div className="container py-24 space-y-10">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Consumed</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Everything I have watched, listened to and read, newest first. Videos, podcasts, books, music, resources and more. More content gets added as time goes on. See what I am up to right now on my{" "}
          <Link href="/now" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
            Now page
          </Link>
          .
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
        searchPlaceholder="Search everything by title, author, genre or tag..."
      />

      <ConsumedCategoryTabs
        active="all"
        counts={{
          all: totalFiltered,
          videos: filteredVideos.length,
          audio: filteredPodcasts.length,
          books: filteredBooks.length,
          articles: filteredArticles.length,
          resources: filteredResources.length,
          others: filteredOthers.length,
        }}
      />

      <div className="mt-8">
          {totalFiltered === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nothing matches yet.</p>
          ) : (
            <div className="space-y-16">
              {periodsToShow.map(({ year, month }) => {
                const mv = filteredVideos.filter((v) => v.year === year && v.month === month)
                const mp = filteredPodcasts.filter((p) => p.year === year && p.month === month)
                const mb = filteredBooks.filter((b) => b.year === year && b.month === month)
                const mr = filteredResources.filter((r) => r.year === year && r.month === month)
                const ma = filteredArticles.filter((a) => a.year === year && a.month === month)
                const mo = filteredOthers.filter((o) => o.year === year && o.month === month)
                const total = mv.length + mp.length + mb.length + mr.length + ma.length + mo.length
                if (total === 0) return null
                return (
                  <section key={`${year}-${month}`} className="space-y-8">
                    {/* Month header styled like the YEAR label above */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Month</span>
                        <span className={cn("rounded-full border px-3 py-1 text-xs font-mono font-medium", MONTH_CHIP[month])}>
                          {month} {year}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{total} {total === 1 ? "item" : "items"}</span>
                        <div className="flex-1 h-px bg-border/60" />
                      </div>
                    </div>

                    {mv.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <Tv2 className="h-3.5 w-3.5" />
                          Videos ({mv.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mv.map((v) => (
                            <VideoCard
                              key={v.id}
                              video={v}
                              active={activeVideos.has(v.id)}
                              onActivate={() => activateVideo(v.id)}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {mp.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <Headphones className="h-3.5 w-3.5" />
                          Audio ({mp.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {mp.map((p) => <PodcastCard key={p.spotifyId} podcast={p} />)}
                        </div>
                      </div>
                    )}

                    {mb.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <BookOpen className="h-3.5 w-3.5" />
                          Books ({mb.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mb.map((b) => <BookCard key={b.title} book={b} />)}
                        </div>
                      </div>
                    )}

                    {mr.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <BookMarked className="h-3.5 w-3.5" />
                          Resources ({mr.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mr.map((r) => <ResourceCard key={r.title} resource={r} />)}
                        </div>
                      </div>
                    )}

                    {ma.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <Newspaper className="h-3.5 w-3.5" />
                          Articles ({ma.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ma.map((a) => <LinkCard key={a.title} item={a} category="articles" />)}
                        </div>
                      </div>
                    )}

                    {mo.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <Globe className="h-3.5 w-3.5" />
                          Others ({mo.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mo.map((o) => <LinkCard key={o.title} item={o} category="others" />)}
                        </div>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          )}
      </div>
    </div>
  )
}
