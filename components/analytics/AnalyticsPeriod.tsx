"use client"

// Shared date-range state for analytics sections. Every section that migrates onto this
// framework (Applications, Coding, Blog, Modules, and new Study/Faith/Stats sections) reads
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

// Returns the cutoff Date for a period, or null for "all" (no lower bound).
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
