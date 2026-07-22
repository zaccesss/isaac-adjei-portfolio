"use client"

// I fetch recent newsletter issues from /api/newsletter-issues and render them.
// Falls back to the placeholder if none have been published yet.

import { useEffect, useState } from "react"
import { ExternalLink, Rss, Newspaper, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"
import { fieldScore } from "@/lib/search"
import { monthsFromDates } from "@/lib/utils"
import { CONTENT_YEAR_MONTH_FILTERS } from "@/lib/feature-flags"
import type { NewsletterIssue } from "@/app/api/newsletter-issues/route"

const ISSUES_PER_PAGE = 7

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function RecentIssues() {
  const [issues, setIssues] = useState<NewsletterIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [year, setYear] = useState<string>("all")
  const [month, setMonth] = useState<string>("all")
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch("/api/newsletter-issues")
      .then((r) => r.json())
      .then((data) => {
        setIssues(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const years = [...new Set(issues.map((i) => new Date(i.publishDate).getFullYear()))].sort((a, b) => b - a)
  const months = monthsFromDates(issues.map((i) => i.publishDate))

  const filtered = (query.trim()
    ? issues
        .filter((i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          (i.subtitle ?? "").toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => fieldScore(b.title, query) - fieldScore(a.title, query))
    : issues
  )
    .filter((i) => year === "all" || String(new Date(i.publishDate).getFullYear()) === year)
    .filter((i) => month === "all" || String(new Date(i.publishDate).getMonth()) === month)

  const totalPages = Math.ceil(filtered.length / ISSUES_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ISSUES_PER_PAGE, page * ISSUES_PER_PAGE)

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Newspaper className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Recent issues</h2>
        <a
          href="/newsletter/feed.xml"
          title="Newsletter RSS feed"
          className="ml-auto inline-flex items-center gap-1.5 text-base font-medium text-primary hover:text-primary/70 transition-colors shrink-0"
        >
          <Rss className="h-5 w-5 shrink-0" />
          Feed
        </a>
      </div>

      {!loading && issues.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search issues..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}

      {CONTENT_YEAR_MONTH_FILTERS && !loading && years.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Year</span>
          <button
            type="button"
            onClick={() => { setYear("all"); setPage(1) }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              year === "all"
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
              onClick={() => { setYear(String(y)); setPage(1) }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                year === String(y)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {CONTENT_YEAR_MONTH_FILTERS && !loading && months.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Month</span>
          <button
            type="button"
            onClick={() => { setMonth("all"); setPage(1) }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              month === "all"
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
              onClick={() => { setMonth(String(m.index)); setPage(1) }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                month === String(m.index)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && issues.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-6 py-8 text-center space-y-2">
          <p className="text-sm font-medium">No issues published yet</p>
          <p className="text-xs text-muted-foreground">
            Subscribe above to be first when the first issue goes out.
          </p>
        </div>
      )}

      {!loading && issues.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No issues match &ldquo;{query}&rdquo;.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {paginated.map((issue) => (
            <a
              key={issue.id}
              href={issue.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-4 hover:border-primary/40 hover:bg-muted/30 transition-all"
            >
              {issue.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={issue.thumbnailUrl}
                  alt=""
                  className="w-16 h-16 rounded-md object-cover shrink-0 border border-border/40"
                  loading="lazy"
                />
              )}
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {issue.title}
                </p>
                {issue.subtitle && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {issue.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {formatDate(issue.publishDate)}
                  </p>
                  {issue.status === "confirmed" ? (
                    <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                      Live
                    </span>
                  ) : (
                    <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Archived
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            </a>
          ))}

          {totalPages > 1 && (
            <>
              <div className="flex items-center justify-center gap-1 pt-2">
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
                Showing {(page - 1) * ISSUES_PER_PAGE + 1}-{Math.min(page * ISSUES_PER_PAGE, issues.length)} of {issues.length} issues
              </p>
            </>
          )}
        </div>
      )}
    </section>
  )
}
