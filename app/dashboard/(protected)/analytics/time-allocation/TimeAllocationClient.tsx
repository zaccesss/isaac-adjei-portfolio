"use client"

import {
  StackedArea, StatCard, BarChart, PieChart, Treemap,
  AnalyticsPeriodProvider, PeriodSelector, useAnalyticsPeriod, filterByPeriod,
} from "@/components/analytics"
import type { TimeAllocationDay } from "@/app/dashboard/actions"

const fmtHours = (mins: number) => `${Math.round((mins / 60) * 10) / 10}h`

// One fixed colour per domain, used consistently across the legend, the stacked area and the
// share charts below - Coding blue, Strava/fitness orange (its own brand colour), Study teal,
// Music pink, Faith indigo, Applications violet (kept distinct even though it is not part of the
// stacked area, since its own bar chart sits on the same page).
const DOMAIN_COLOURS = {
  study: "#14b8a6",
  coding: "#3b82f6",
  strava: "#FC4C02",
  music: "#ec4899",
  faith: "#6366f1",
  applications: "#8b5cf6",
}

function Inner({ days }: { days: TimeAllocationDay[] }) {
  const { period } = useAnalyticsPeriod()
  const visible = filterByPeriod(days, period, (d) => d.date)

  const chartData = visible.map((d) => ({
    name: new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    study: d.studyMinutes,
    coding: d.codingMinutes,
    strava: d.stravaMinutes,
    music: d.musicMinutes,
    faith: d.faithMinutes,
  }))

  const totals = visible.reduce(
    (acc, d) => ({
      study: acc.study + d.studyMinutes,
      coding: acc.coding + d.codingMinutes,
      strava: acc.strava + d.stravaMinutes,
      music: acc.music + d.musicMinutes,
      faith: acc.faith + d.faithMinutes,
      applications: acc.applications + d.applicationsCount,
    }),
    { study: 0, coding: 0, strava: 0, music: 0, faith: 0, applications: 0 },
  )
  const hasTimeData = totals.study + totals.coding + totals.strava + totals.music + totals.faith > 0

  const shareData = ([
    { name: "Study", value: totals.study, colour: DOMAIN_COLOURS.study },
    { name: "Coding", value: totals.coding, colour: DOMAIN_COLOURS.coding },
    { name: "Strava", value: totals.strava, colour: DOMAIN_COLOURS.strava },
    { name: "Music", value: totals.music, colour: DOMAIN_COLOURS.music },
    { name: "Faith", value: totals.faith, colour: DOMAIN_COLOURS.faith },
  ] as const).filter((d) => d.value > 0)

  const appsData = visible.map((d) => ({
    name: new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    value: d.applicationsCount,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-sm font-semibold">Time allocation</h1>
        <PeriodSelector />
      </div>

      {/* Legend row: colour + label + total, before the graph - matches every domain's colour
          used in the stacked area below, so the mapping is visible at a glance without hovering. */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 border border-border rounded-lg p-3 bg-card">
        {(Object.entries(DOMAIN_COLOURS) as [keyof typeof DOMAIN_COLOURS, string][]).map(([key, colour]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: colour }} />
            <span className="capitalize text-muted-foreground">{key}</span>
            <span className="font-medium tabular-nums">
              {key === "applications" ? totals.applications : fmtHours(totals[key])}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        <StatCard label="Study" value={fmtHours(totals.study)} accentClassName="border-l-4" />
        <StatCard label="Coding" value={fmtHours(totals.coding)} />
        <StatCard label="Strava" value={fmtHours(totals.strava)} />
        <StatCard label="Music" value={fmtHours(totals.music)} />
        <StatCard label="Faith" value={fmtHours(totals.faith)} />
      </div>

      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-semibold mb-3">Where the time went, by day</p>
        {hasTimeData ? (
          <StackedArea
            data={chartData}
            series={[
              { key: "study", name: "Study" },
              { key: "coding", name: "Coding" },
              { key: "strava", name: "Strava" },
              { key: "music", name: "Music" },
              { key: "faith", name: "Faith" },
            ]}
            colours={[DOMAIN_COLOURS.study, DOMAIN_COLOURS.coding, DOMAIN_COLOURS.strava, DOMAIN_COLOURS.music, DOMAIN_COLOURS.faith]}
            valueFormatter={(v) => fmtHours(v)}
          />
        ) : (
          <p className="text-xs text-muted-foreground py-12 text-center">
            No study, coding, Strava, music or faith activity recorded yet in this period.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-semibold mb-3">Share of time by domain</p>
          {shareData.length > 0 ? (
            <PieChart data={shareData.map((d) => ({ name: d.name, value: d.value, colour: d.colour }))} valueFormatter={(v) => fmtHours(v)} />
          ) : (
            <p className="text-xs text-muted-foreground py-12 text-center">No data for this period.</p>
          )}
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-semibold mb-3">Share of time, by size</p>
          {shareData.length > 0 ? (
            <Treemap data={shareData.map((d) => ({ name: d.name, value: d.value }))} colours={shareData.map((d) => d.colour)} valueFormatter={(v) => fmtHours(v)} />
          ) : (
            <p className="text-xs text-muted-foreground py-12 text-center">No data for this period.</p>
          )}
        </div>
      </div>

      {/* Applications has no duration data anywhere in its schema, so it is a count, not a time -
          its own chart alongside the real time domains above, not stacked into the same area. */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Applications submitted per day</p>
          <StatCard label="Total" value={totals.applications} />
        </div>
        {totals.applications > 0 ? (
          <BarChart data={appsData} dataKey="value" colour={DOMAIN_COLOURS.applications} valueFormatter={(v) => `${v} application${v !== 1 ? "s" : ""}`} />
        ) : (
          <p className="text-xs text-muted-foreground py-12 text-center">No applications submitted in this period.</p>
        )}
      </div>
    </div>
  )
}

export default function TimeAllocationClient({ days }: { days: TimeAllocationDay[] }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="30d">
      <Inner days={days} />
    </AnalyticsPeriodProvider>
  )
}
