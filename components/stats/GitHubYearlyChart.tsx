"use client"

// A year-by-year contribution total for /stats/github. github_contributions_years already stores
// this (synced once per past year, refreshed for the current year) but nothing surfaced it as its
// own chart before now - GitHubStats' own calendar only ever shows a trailing 365 days.
import { useEffect, useState } from "react"
import { BarChart } from "@/components/analytics"
import type { GitHubStats } from "@/app/api/github-stats/route"
import { CalendarRange } from "lucide-react"

export default function GitHubYearlyChart() {
  const [years, setYears] = useState<{ year: number; total: number }[] | null>(null)

  useEffect(() => {
    fetch("/api/github-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: GitHubStats | null) => setYears(d?.contributions?.years ?? []))
      .catch(() => setYears([]))
  }, [])

  if (years === null) {
    return <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 h-40 animate-pulse" />
  }

  if (years.length < 2) return null

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Contributions by year</span>
      </div>
      <BarChart
        data={years.map((y) => ({ name: String(y.year), value: y.total }))}
        dataKey="value"
        xKey="name"
        height={180}
        valueFormatter={(v) => `${v.toLocaleString()} contributions`}
      />
    </div>
  )
}
