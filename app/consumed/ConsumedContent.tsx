"use client"
// I render the full consumed content log with month filtering and category navigation.
// All data lives in data/consumed/. Card components live in components/consumed/.

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  BookOpen, Music2, Headphones, Tv2, LayoutList,
  Newspaper, BookMarked, Globe, ExternalLink,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  videos, podcasts, books, resources, articles, others,
  MONTHS, MONTH_CHIP,
  isMonthAvailable,
  type Month,
} from "@/data/consumed"
import { VideoCard } from "@/components/consumed/VideoCard"
import { ResourceCard } from "@/components/consumed/ResourceCard"
import { LinkCard } from "@/components/consumed/LinkCard"

export default function ConsumedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"

  const [activeYear, setActiveYear] = useState<string>("all")
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [activeVideos, setActiveVideos] = useState<Set<string>>(new Set())

  const YEARS = ["2026"]

  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, preview))

  const filterByMonth = <T extends { month: Month }>(items: T[]) => {
    const visible = items.filter((i) => isMonthAvailable(i.month, preview))
    return activeMonth === "all" ? visible : visible.filter((i) => i.month === activeMonth)
  }

  const filteredVideos    = filterByMonth(videos)
  const filteredPodcasts  = filterByMonth(podcasts)
  const filteredBooks     = filterByMonth(books)
  const filteredResources = filterByMonth(resources)
  const filteredArticles  = filterByMonth(articles)
  const filteredOthers    = filterByMonth(others)
  const totalFiltered     = filteredVideos.length + filteredPodcasts.length + filteredBooks.length + filteredResources.length + filteredArticles.length + filteredOthers.length

  const activateVideo = (id: string) =>
    setActiveVideos((prev) => new Set([...prev, id]))

  const monthsToShow = activeMonth === "all" ? availableMonths : [activeMonth as Month]

  return (
    <div className="container py-24 space-y-10">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Consumed</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Everything I have watched, listened to and read so far this year. Videos, podcasts, books, music, resources and more. More content will be added as the year goes on. See what I am up to right now on my{" "}
          <Link href="/now" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
            Now page
          </Link>
          .
        </p>
      </div>

      {/* Year + Month filter */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Year</span>
          <button
            type="button"
            onClick={() => setActiveYear("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeYear === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            All
          </button>
          {YEARS.map((y) => (
            <button
              type="button"
              key={y}
              onClick={() => setActiveYear(y)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeYear === y
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Month</span>
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

      {/* Category tabs - All shows everything here; others navigate to dedicated subpages */}
      <div className="space-y-3">
      <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Category</span>
      <Tabs value="all">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="gap-1.5">
            <LayoutList className="h-3.5 w-3.5" />
            All
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{totalFiltered}</span>
          </TabsTrigger>
          <TabsTrigger value="videos" onClick={() => router.push("/consumed/videos")} className="gap-1.5">
            <Tv2 className="h-3.5 w-3.5" />
            Videos
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredVideos.length}</span>
          </TabsTrigger>
          <TabsTrigger value="audio" onClick={() => router.push("/consumed/podcasts")} className="gap-1.5">
            <Headphones className="h-3.5 w-3.5" />
            Audio
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredPodcasts.length}</span>
          </TabsTrigger>
          <TabsTrigger value="music" onClick={() => router.push("/consumed/music")} className="gap-1.5">
            <Music2 className="h-3.5 w-3.5" />
            Music
          </TabsTrigger>
          <TabsTrigger value="books" onClick={() => router.push("/consumed/books")} className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Books
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredBooks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="articles" onClick={() => router.push("/consumed/articles")} className="gap-1.5">
            <Newspaper className="h-3.5 w-3.5" />
            Articles
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredArticles.length}</span>
          </TabsTrigger>
          <TabsTrigger value="resources" onClick={() => router.push("/consumed/resources")} className="gap-1.5">
            <BookMarked className="h-3.5 w-3.5" />
            Resources
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredResources.length}</span>
          </TabsTrigger>
          <TabsTrigger value="others" onClick={() => router.push("/consumed/others")} className="gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Others
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredOthers.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          {totalFiltered === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No content for this month yet.</p>
          ) : (
            <div className="space-y-16">
              {monthsToShow.map((month) => {
                const mv = filteredVideos.filter((v) => v.month === month)
                const mp = filteredPodcasts.filter((p) => p.month === month)
                const mb = filteredBooks.filter((b) => b.month === month)
                const mr = filteredResources.filter((r) => r.month === month)
                const ma = filteredArticles.filter((a) => a.month === month)
                const mo = filteredOthers.filter((o) => o.month === month)
                const total = mv.length + mp.length + mb.length + mr.length + ma.length + mo.length
                if (total === 0) return null
                return (
                  <section key={month} className="space-y-8">
                    {/* Month header styled like the YEAR label above */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Month</span>
                        <span className={cn("rounded-full border px-3 py-1 text-xs font-mono font-medium", MONTH_CHIP[month])}>
                          {month}
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
                          {mp.map((p) => (
                            <div key={p.spotifyId} className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs font-medium text-foreground line-clamp-1">{p.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{p.show}</p>
                                </div>
                                <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[p.month])}>
                                  {p.month.slice(0, 3)}
                                </span>
                              </div>
                              <iframe
                                src={`https://open.spotify.com/embed/${p.embedType}/${p.spotifyId}?utm_source=generator`}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="rounded-xl"
                                title={p.title}
                              />
                            </div>
                          ))}
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
                          {mb.map((b) => (
                            <div key={b.title} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-semibold text-foreground leading-snug">{b.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{b.author}</p>
                                </div>
                                <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", b.genreColor)}>
                                  {b.genre}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{b.note}</p>
                              {b.link && (
                                <a
                                  href={b.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors self-start"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {b.link.includes("amazon") ? "Amazon" : "Free resource"}
                                </a>
                              )}
                            </div>
                          ))}
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
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
