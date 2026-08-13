"use client"

// Shared date-range state for analytics sections. Every section that migrates onto this
// framework (Applications, Coding, Blog, Modules and new Study/Faith/Stats sections) reads
// the active period from this context instead of hand-rolling its own date math, so a single
// PeriodSelector can drive every chart on a page at once.

import * as React from "react"

export const ANALYTICS_PERIODS = ["24h", "7d", "30d", "90d", "1y", "all"] as const
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number]

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  "1y": "1y",
  all: "All",
}

const PERIOD_DAYS: Record<AnalyticsPeriod, number | null> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
  all: null,
}

// Returns the cutoff Date for a period or null for "all" (no lower bound).
export function periodStartDate(period: AnalyticsPeriod, now: Date = new Date()): Date | null {
  const days = PERIOD_DAYS[period]
  if (days === null) return null
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  return start
}

// Filters a list of items by an ISO date/datetime string field, against the active period.
export function filterByPeriod<T>(items: T[], period: AnalyticsPeriod, getDate: (item: T) => string | null | undefined): T[] {
  const start = periodStartDate(period)
  if (!start) return items
  const startIso = start.toISOString()
  return items.filter((item) => {
    const d = getDate(item)
    return !!d && d >= startIso
  })
}

// Several pages render a chart across a fixed-length trailing window (an Array.from({length:
// numDays}) of days or weeks counting back from today) sized by their own per-period day counts,
// rather than filtering a list by periodStartDate directly. Those pages hardcoded their "all"
// branch to the same window as "1y" (usually 365 days), so switching to "All time" looked
// identical to "1y" for anyone with more than a year of history - a real "the selector does
// nothing" bug, not the granularity-bucketing Blog/Strava do (which still spans the true full
// period, just grouped coarser). Call this only in a page's own "all" branch, keeping every other
// period's existing day count untouched (some pages deliberately give 24h and 7d the same chart
// window, for example, which this must not disturb). Spans back to the earliest date actually
// present in the caller's own data, capped so one stray bad date can't blow the window up to
// something absurd. The default cap suits a calendar/heatmap-style render, which handles hundreds
// of cells fine; a literal one-bar-per-day chart should pass a much smaller cap (see CodingClient's
// daily bar chart) so "all" cannot render an unreadable wall of bars.
const ALL_TIME_DAY_CAP = 1825 // ~5 years

// `dates` are the caller's own raw ISO date strings, unfiltered by period.
export function allTimeChartDays(dates: string[], fallback: number, cap: number = ALL_TIME_DAY_CAP, now: Date = new Date()): number {
  if (!dates.length) return fallback
  const earliest = dates.reduce((min, d) => (d < min ? d : min), dates[0])
  const days = Math.ceil((now.getTime() - new Date(earliest).getTime()) / 86400000) + 1
  return Math.min(cap, Math.max(fallback, days))
}

type AnalyticsPeriodContextValue = {
  period: AnalyticsPeriod
  setPeriod: (period: AnalyticsPeriod) => void
}

const AnalyticsPeriodContext = React.createContext<AnalyticsPeriodContextValue | null>(null)

export function AnalyticsPeriodProvider({
  children,
  defaultPeriod = "30d",
}: {
  children: React.ReactNode
  defaultPeriod?: AnalyticsPeriod
}) {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>(defaultPeriod)
  const value = React.useMemo(() => ({ period, setPeriod }), [period])
  return <AnalyticsPeriodContext.Provider value={value}>{children}</AnalyticsPeriodContext.Provider>
}

export function useAnalyticsPeriod(): AnalyticsPeriodContextValue {
  const ctx = React.useContext(AnalyticsPeriodContext)
  if (!ctx) throw new Error("useAnalyticsPeriod must be used within an AnalyticsPeriodProvider")
  return ctx
}

export function PeriodSelector({ className }: { className?: string }) {
  const { period, setPeriod } = useAnalyticsPeriod()
  return (
    <div className={`inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5 ${className ?? ""}`}>
      {ANALYTICS_PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setPeriod(p)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            p === period
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  )
}
