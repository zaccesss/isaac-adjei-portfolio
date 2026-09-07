"use client"

// Period-filtered daily contribution activity for /stats/github - a bar for the day's own count
// plus a cumulative line, so the same daily-count data GitHubYearlyChart already rolls up by year
// also gets a finer-grained, period-aware view. GitHubYearlyChart and the live GitHubStats profile
// widget both stay all-time on purpose: a year-by-year total and a live snapshot are not
// meaningfully period-filterable the same way a daily series is.
import { useEffect, useState } from "react"
import { Composed, useAnalyticsPeriod, filterByPeriod } from "@/components/analytics"
import type { GitHubStats } from "@/app/api/github-stats/route"
import { Activity } from "lucide-react"

export default function GitHubActivityChart() {
  const { period } = useAnalyticsPeriod()
  const [days, setDays] = useState<{ date: string; count: number }[] | null>(null)

  useEffect(() => {
    fetch("/api/github-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: GitHubStats | null) => setDays(d?.contributions?.days ?? []))
      .catch(() => setDays([]))
  }, [])

  if (days === null) {
    return <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 h-56 animate-pulse" />
  }

  const filtered = filterByPeriod(days, period, (d) => d.date)
  const data = filtered.reduce<{ name: string; contributions: number; cumulative: number }[]>((acc, d) => {
    const prevCumulative = acc.length ? acc[acc.length - 1].cumulative : 0
    acc.push({ name: d.date, contributions: d.count, cumulative: prevCumulative + d.count })
    return acc
  }, [])

  if (!data.length) return null

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Daily activity</span>
      </div>
      <Composed
        data={data}
        barKey="contributions"
        lineKey="cumulative"
        barName="Contributions"
        lineName="Cumulative"
        height={220}
      />
    </div>
  )
}
