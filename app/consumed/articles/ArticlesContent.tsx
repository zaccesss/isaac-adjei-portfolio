"use client"
// I render the /consumed/articles subpage - essays and long-form writing with month filtering.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import { articles, MONTHS, MONTH_CHIP, isMonthAvailable, type Month } from "@/data/consumed"
import { LinkCard } from "@/components/consumed/LinkCard"

export default function ArticlesContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeMonth, setActiveMonth] = useState<string>("all")

  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, preview))
  const filtered = articles
    .filter((a) => isMonthAvailable(a.month, preview))
    .filter((a) => activeMonth === "all" || a.month === activeMonth)

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
          <Newspaper className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Articles</h1>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Essays and long-form writing worth reading. Things that made me think or changed my perspective. Covers software, hardware, career, culture, faith and general ideas.
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
        <p className="text-sm text-muted-foreground py-8 text-center">No articles for this month yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <LinkCard key={a.title} item={a} category="articles" />
          ))}
        </div>
      )}
    </div>
  )
}
