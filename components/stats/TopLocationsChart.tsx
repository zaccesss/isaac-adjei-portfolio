"use client"

// Top 10 cities by opportunity count for /stats/applications, from the same public, count-only
// endpoint PublicApplicationsMap already reads - no new backend work, no privacy concern (this
// route never returns anything more specific than a location string and a count). "Opportunity"
// rather than "application" throughout, since most rows are scraped listings tracked, not places
// actually applied to.
import { useEffect, useState } from "react"
import { BarChart } from "@/components/analytics"
import { BarChart3 } from "lucide-react"

type LocationPoint = { location: string; count: number }

export default function TopLocationsChart() {
  const [points, setPoints] = useState<LocationPoint[] | null>(null)

  useEffect(() => {
    fetch("/api/stats/applications-locations")
      .then((r) => (r.ok ? r.json() : { points: [] }))
      .then((d) => setPoints(d.points ?? []))
      .catch(() => setPoints([]))
  }, [])

  if (points === null) {
    return <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 h-56 animate-pulse" />
  }

  const top = [...points].sort((a, b) => b.count - a.count).slice(0, 10)
  if (!top.length) return null

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Top 10 cities</span>
      </div>
      <BarChart
        data={top.map((p) => ({ name: p.location, value: p.count }))}
        dataKey="value"
        xKey="name"
        height={200}
        legend
        valueFormatter={(v) => `${v} opportunit${v === 1 ? "y" : "ies"} tracked`}
      />
    </div>
  )
}
