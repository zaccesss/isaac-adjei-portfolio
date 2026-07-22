"use client"
// I render the /consumed/resources subpage with category chips and month filtering.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookMarked } from "lucide-react"
import { resources, MONTHS, isMonthAvailable, sortByRecency, yearsFrom } from "@/data/consumed"
import { ConsumedFilterBar } from "@/components/consumed/ConsumedFilterBar"
import { ConsumedCategoryTabs } from "@/components/consumed/ConsumedCategoryTabs"
import { ResourceCard } from "@/components/consumed/ResourceCard"

export default function ResourcesContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeYear, setActiveYear] = useState<string>("all")
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [search, setSearch] = useState("")

  const years = yearsFrom(resources)
  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, new Date().getFullYear(), preview))
  const filtered = sortByRecency(
    resources
      .filter((r) => isMonthAvailable(r.month, r.year, preview))
      .filter((r) => activeYear === "all" || String(r.year) === activeYear)
      .filter((r) => activeMonth === "all" || r.month === activeMonth)
      .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4 max-w-2xl">
        <Link href="/consumed" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Consumed
        </Link>
        <div className="flex items-center gap-3">
          <BookMarked className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Resources</h1>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Websites, tools, documentation and learning platforms worth returning to. The places I keep coming back to when studying, building or debugging.
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
        searchPlaceholder="Search resources by title or category..."
      />

      <ConsumedCategoryTabs active="resources" counts={{ resources: filtered.length }} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No resources for this month yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <ResourceCard key={r.title} resource={r} />
          ))}
        </div>
      )}
    </div>
  )
}
