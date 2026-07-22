"use client"
// I render the /consumed/others subpage - tools, repos and miscellaneous finds with month filtering.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Globe } from "lucide-react"
import { others, MONTHS, isMonthAvailable, sortByRecency, yearsFrom } from "@/data/consumed"
import { ConsumedFilterBar } from "@/components/consumed/ConsumedFilterBar"
import { ConsumedCategoryTabs } from "@/components/consumed/ConsumedCategoryTabs"
import { LinkCard } from "@/components/consumed/LinkCard"

export default function OthersContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeYear, setActiveYear] = useState<string>("all")
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [search, setSearch] = useState("")

  const years = yearsFrom(others)
  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, new Date().getFullYear(), preview))
  const filtered = sortByRecency(
    others
      .filter((o) => isMonthAvailable(o.month, o.year, preview))
      .filter((o) => activeYear === "all" || String(o.year) === activeYear)
      .filter((o) => activeMonth === "all" || o.month === activeMonth)
      .filter((o) => !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.source.toLowerCase().includes(search.toLowerCase()) || o.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  )

  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4 max-w-2xl">
        <Link href="/consumed" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Consumed
        </Link>
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Others</h1>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Tools, repos, extensions and miscellaneous finds that do not fit neatly into any other category. Things discovered while building, studying or just browsing.
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
        searchPlaceholder="Search others by title, source or tag..."
      />

      <ConsumedCategoryTabs active="others" counts={{ others: filtered.length }} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No others for this month yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <LinkCard key={o.title} item={o} category="others" />
          ))}
        </div>
      )}
    </div>
  )
}
