"use client"
// I render the /consumed/books subpage with genre chips, notes and external links.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { books, MONTHS, MONTH_CHIP, isMonthAvailable, type Month } from "@/data/consumed"
import { consumedSlug } from "@/lib/tags"

export default function BooksContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeMonth, setActiveMonth] = useState<string>("all")

  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, preview))
  const filtered = books
    .filter((b) => isMonthAvailable(b.month, preview))
    .filter((b) => activeMonth === "all" || b.month === activeMonth)

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
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Books</h1>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Books read or worked through this year. A mix of engineering, software, embedded systems, science and life. Links go to Amazon UK or a free version where one exists.
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
        <p className="text-sm text-muted-foreground py-8 text-center">No books for this month yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div key={b.title} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 hover:border-border transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Link
                    href={`/consumed/books/${consumedSlug(b.title)}`}
                    className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors block"
                  >
                    {b.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{b.author}</p>
                </div>
                <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[b.month])}>
                  {b.month.slice(0, 3)}
                </span>
              </div>
              <span className={cn("self-start inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium", b.genreColor)}>
                {b.genre}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{b.note}</p>
              <div className="flex items-center gap-3 mt-auto">
                <Link
                  href={`/consumed/books/${consumedSlug(b.title)}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2"
                >
                  <FileText className="h-3 w-3" />
                  Notes
                </Link>
                {b.link && (
                  <a
                    href={b.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {b.link.includes("amazon") ? "Amazon" : "Free resource"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
