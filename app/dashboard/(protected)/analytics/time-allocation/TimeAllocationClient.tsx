"use client"

import { StackedArea, StatCard } from "@/components/analytics"
import type { TimeAllocationDay } from "@/app/dashboard/actions"

const fmtHours = (mins: number) => `${Math.round((mins / 60) * 10) / 10}h`

export default function TimeAllocationClient({ days }: { days: TimeAllocationDay[] }) {
  const chartData = days.map((d) => ({
    name: new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    study: d.studyMinutes,
    coding: d.codingMinutes,
    strava: d.stravaMinutes,
  }))

  const totals = days.reduce(
    (acc, d) => ({ study: acc.study + d.studyMinutes, coding: acc.coding + d.codingMinutes, strava: acc.strava + d.stravaMinutes }),
    { study: 0, coding: 0, strava: 0 },
  )
  const hasData = totals.study + totals.coding + totals.strava > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Study" value={fmtHours(totals.study)} />
        <StatCard label="Coding" value={fmtHours(totals.coding)} />
        <StatCard label="Strava" value={fmtHours(totals.strava)} />
      </div>
      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-semibold mb-3">Where the time went, by day</p>
        {hasData ? (
          <StackedArea
            data={chartData}
            series={[
              { key: "study", name: "Study" },
              { key: "coding", name: "Coding" },
              { key: "strava", name: "Strava" },
            ]}
            valueFormatter={(v) => fmtHours(v)}
          />
        ) : (
          <p className="text-xs text-muted-foreground py-12 text-center">
            No study, coding or Strava activity recorded yet in this window.
          </p>
        )}
      </div>
    </div>
  )
}
