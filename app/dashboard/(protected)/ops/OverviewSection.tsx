"use client"

// The 3-chart Overview section shown on both the main Ops page (as the "mini version") and the
// fuller /dashboard/ops/analytics page, so there is exactly one implementation to keep in sync
// rather than two copies drifting apart.
import { useEffect, useMemo, useState } from "react"
import { BarChart3 } from "lucide-react"
import { useAnalyticsPeriod, PeriodSelector, periodStartDate, PieChart, BarChart } from "@/components/analytics"
import { STATUS_COLOURS } from "@/app/dashboard/components/status-ui"
import type { ControlHistory } from "./control-history-types"

// Both OpsClient and OpsAnalyticsClient already wrap their whole page in their own top-level
// AnalyticsPeriodProvider - this reads from that, it does not provide its own.
export function OverviewSection() {
  const { period } = useAnalyticsPeriod()
  const [history, setHistory] = useState<ControlHistory | null>(null)

  useEffect(() => {
    const start = periodStartDate(period)
    const since = (start ?? new Date(0)).toISOString()
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/dashboard/control-history?since=${encodeURIComponent(since)}`)
        if (res.ok && !cancelled) setHistory((await res.json()) as ControlHistory)
      } catch {
        // Keep the last snapshot; the charts just stay on whatever loaded before.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [period])

  const statusPie = useMemo(() => {
    if (!history) return []
    const b = history.statusBreakdown
    return [
      { name: "Up", value: b.up, colour: STATUS_COLOURS.up },
      { name: "Late", value: b.grace, colour: STATUS_COLOURS.grace },
      { name: "Down", value: b.down, colour: STATUS_COLOURS.down },
      { name: "Paused", value: b.paused, colour: STATUS_COLOURS.paused },
    ].filter((d) => d.value > 0)
  }, [history])

  const dailyBars = useMemo(
    () => (history?.dailySuccess ?? []).map((d) => ({
      name: d.date.slice(5),
      rate: d.total > 0 ? Math.round((d.success / d.total) * 100) : 0,
    })),
    [history],
  )

  const jobBars = useMemo(
    () => (history?.perJobSuccess ?? []).map((j) => ({
      name: j.label,
      rate: j.total > 0 ? Math.round((j.success / j.total) * 100) : 0,
    })),
    [history],
  )

  const hasHistory = (history?.dailySuccess.length ?? 0) > 0 || (history?.statusBreakdown && Object.values(history.statusBreakdown).some((v) => v > 0))

  return (
    <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Overview</h2>
        </div>
        <PeriodSelector />
      </div>

      {!hasHistory ? (
        <p className="text-xs text-muted-foreground">
          No history recorded yet for this period - the control-status-sync job in isaac-adjei-automations
          fills these charts in as it runs.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground text-center">Check status, this period</p>
            <PieChart data={statusPie} height={180} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground text-center">Daily success rate</p>
            <BarChart data={dailyBars} dataKey="rate" height={180} valueFormatter={(v) => `${v}%`} colour={STATUS_COLOURS.up} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground text-center">Success rate by job</p>
            <BarChart data={jobBars} dataKey="rate" height={180} valueFormatter={(v) => `${v}%`} colour={STATUS_COLOURS.up} hideXAxisTicks />
          </div>
        </div>
      )}
    </section>
  )
}

