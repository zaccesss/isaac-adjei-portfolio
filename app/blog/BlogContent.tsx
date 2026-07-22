"use client"
// I render the public blog index with client-side filtering by post type and pagination.
// I use "use client" here because the filter and pagination state lives in the browser -
// all the post data is imported statically so there is no server fetch on load.

import { useState } from "react"
import { relevanceScore } from "@/lib/search"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Rss, Terminal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getPublishedPosts, POST_TYPES, type PostType } from "@/data/blog"
import NewsletterForm from "@/components/shared/NewsletterForm"
import { monthsFromDates } from "@/lib/utils"
import { CONTENT_YEAR_MONTH_FILTERS } from "@/lib/feature-flags"

const POSTS_PER_PAGE = 7

const TYPE_STYLES: Record<PostType, string> = {
  blog: "bg-primary/10 text-primary border-primary/20",
  journal: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  research: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  notes: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  report: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  article: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  resources: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function BlogPage() {
  const [activeType, setActiveType] = useState<PostType | "all">("all")
  const [activeYear, setActiveYear] = useState<string>("all")
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const allPosts = getPublishedPosts().sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const years = [...new Set(allPosts.map((p) => new Date(p.date).getFullYear()))].sort((a, b) => b - a)
  const months = monthsFromDates(allPosts.map((p) => p.date))
  const q = search.toLowerCase().trim()
  const filtered = allPosts
    .filter((p) => activeType === "all" || p.type === activeType)
    .filter((p) => activeYear === "all" || String(new Date(p.date).getFullYear()) === activeYear)
    .filter((p) => activeMonth === "all" || String(new Date(p.date).getMonth()) === activeMonth)
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    .sort((a, b) => q ? relevanceScore(b.title, b.description, q) - relevanceScore(a.title, a.description, q) : 0)

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  // I reset to page 1 whenever the filter changes so the user does not land on a non-existent page
  function setFilter(type: PostType | "all") {
    setActiveType(type)
    setPage(1)
  }

  function setYear(year: string) {
    setActiveYear(year)
    setPage(1)
  }

  function setMonth(month: string) {
    setActiveMonth(month)
    setPage(1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="container max-w-4xl py-24 space-y-12">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Writing</h1>
          <a
            href="/blog/feed.xml"
            title="RSS feed"
            aria-label="Subscribe via RSS"
            className="inline-flex items-center gap-1.5 text-base font-medium text-primary hover:text-primary/70 transition-colors shrink-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Rss className="h-5 w-5 shrink-0" />
            Feed
          </a>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Engineering and tech write-ups, project breakdowns, journal entries and research notes.
          Everything I build, learn and think about.
        </p>
      </section>

      {/* Search */}
      <input
        type="search"
        placeholder="Search posts…"
        value={search}
        onChange={e => handleSearch(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {POST_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFilter(t.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeType === t.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {CONTENT_YEAR_MONTH_FILTERS && years.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Year</span>
          <button
            type="button"
            onClick={() => setYear("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeYear === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            All
          </button>
          {years.map((y) => (
            <button
              type="button"
              key={y}
              onClick={() => setYear(String(y))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeYear === String(y)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {CONTENT_YEAR_MONTH_FILTERS && months.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Month</span>
          <button
            type="button"
            onClick={() => setMonth("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeMonth === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            All
          </button>
          {months.map((m) => (
            <button
              type="button"
              key={m.index}
              onClick={() => setMonth(String(m.index))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeMonth === String(m.index)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* Post grid */}
      {filtered.length > 0 ? (
        <div className="space-y-6">
          {paginated.map((post, i) => {
            return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-lg border transition-all overflow-hidden border-border/60 bg-muted/40 hover:bg-muted/60 hover:border-border"
            >
              {post.cover_image && (
                <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    priority={page === 1 && i === 0}
                    className="object-cover sm:group-hover:scale-105 sm:transition-transform sm:duration-300"
                    sizes="(max-width: 640px) 250px, 700px"
                  />
                </div>
              )}
              <div className={`space-y-3 px-6 py-5`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[post.type]}`}
                >
                  {POST_TYPES.find((t) => t.value === post.type)?.label ?? post.type}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} min read
                </span>
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              </div>
            </Link>
            )
          })}

          {totalPages > 1 && (
            <>
              <div className="flex items-center justify-center gap-1 pt-4">
                <button type="button" onClick={() => setPage(1)} disabled={page === 1} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors" aria-label="First page">
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)} className={`min-w-[2rem] h-8 px-2 rounded-lg border text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                    {p}
                  </button>
                ))}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors" aria-label="Last page">
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Showing {(page - 1) * POSTS_PER_PAGE + 1}-{Math.min(page * POSTS_PER_PAGE, filtered.length)} of {filtered.length} posts
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 p-12 text-center space-y-2">
          <p className="text-sm font-medium">No posts in this category yet.</p>
          <p className="text-xs text-muted-foreground">Check back soon.</p>
        </div>
      )}

      {/* Newsletter */}
      <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-3">
        <Link href="/newsletter" className="text-xs font-mono text-primary uppercase tracking-widest hover:underline">newsletter</Link>
        <p className="text-sm font-medium">Get new posts in your inbox</p>
        <p className="text-xs text-muted-foreground">
          Notes on tech, projects and more. No spam. Unsubscribe anytime.
        </p>
        <NewsletterForm variant="compact" />
      </div>

      <Separator />

      {/* Lab link */}
      <Link
        href="/lab"
        className="group block rounded-lg border border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 transition-all px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-2 h-4 bg-primary shrink-0 animate-[blink_1s_step-end_infinite]"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="font-mono text-sm text-primary font-medium">
              prefer a terminal? try /lab
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              type commands to explore the site and find out more - click to open
            </p>
          </div>
          <Terminal className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors ml-auto shrink-0" />
        </div>
      </Link>
    </div>
  )
}
