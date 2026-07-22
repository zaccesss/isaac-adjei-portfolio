"use client"
// I render the /consumed/articles subpage - essays and long-form writing with month filtering.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Newspaper } from "lucide-react"
import { articles, MONTHS, isMonthAvailable, sortByRecency, yearsFrom } from "@/data/consumed"
import { ConsumedFilterBar } from "@/components/consumed/ConsumedFilterBar"
import { ConsumedCategoryTabs } from "@/components/consumed/ConsumedCategoryTabs"
import { LinkCard } from "@/components/consumed/LinkCard"

export default function ArticlesContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeYear, setActiveYear] = useState<string>("all")
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [search, setSearch] = useState("")

  const years = yearsFrom(articles)
  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, new Date().getFullYear(), preview))
  const filtered = sortByRecency(
    articles
      .filter((a) => isMonthAvailable(a.month, a.year, preview))
      .filter((a) => activeYear === "all" || String(a.year) === activeYear)
      .filter((a) => activeMonth === "all" || a.month === activeMonth)
      .filter((a) => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.source.toLowerCase().includes(search.toLowerCase()) || a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  )

  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4 max-w-2xl">
        <Link href="/consumed" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
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

      <ConsumedFilterBar
        years={years}
        activeYear={activeYear}
        onYearChange={setActiveYear}
        months={availableMonths}
        activeMonth={activeMonth}
        onMonthChange={setActiveMonth}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search articles by title, source or tag..."
      />

      <ConsumedCategoryTabs active="articles" counts={{ articles: filtered.length }} />

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
