"use client"

// I fetch past newsletter issues from /api/newsletter-issues and render them.
// Falls back to the placeholder if none have been published yet.

import { useEffect, useState } from "react"
import { ExternalLink, Rss, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import type { NewsletterIssue } from "@/app/api/newsletter-issues/route"

const ISSUES_PER_PAGE = 7

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function PastIssues() {
  const [issues, setIssues] = useState<NewsletterIssue[]>([])
  const [loading, setLoading] = useState(true)
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

  const totalPages = Math.ceil(issues.length / ISSUES_PER_PAGE)
  const paginated = issues.slice((page - 1) * ISSUES_PER_PAGE, page * ISSUES_PER_PAGE)

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Rss className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Past issues</h2>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
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

      {!loading && issues.length > 0 && (
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
          )}
        </div>
      )}
    </section>
  )
}
