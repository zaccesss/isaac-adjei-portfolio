"use client"

// The fuller Ops analytics page. One AnalyticsPeriodProvider governs every section below - nothing
// here is allowed to silently default to all-time, matching every other analytics page on this
// dashboard. Data comes from the same /api/dashboard/control-history route the main Ops page's mini
// Overview section already uses, just reading the extra fields that route now also returns.
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Gauge } from "lucide-react"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { AnalyticsPeriodProvider, useAnalyticsPeriod, PeriodSelector, periodStartDate, LineChart, BarChart, Treemap, Sankey } from "@/components/analytics"
import { UptimeGrid } from "@/components/analytics/UptimeGrid"
import { STATUS_COLOURS } from "@/app/dashboard/components/status-ui"
import { OverviewSection } from "../OverviewSection"
import type { ControlHistory } from "../control-history-types"

function OpsAnalyticsInner() {
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

  const durationBars = useMemo(
    () => (history?.durationTrend ?? []).map((d) => ({ name: d.date.slice(5), seconds: d.avgDurationS })),
    [history],
  )

  const repoBars = useMemo(
    () => (history?.repoBreakdown ?? []).map((r) => ({
      name: r.repoLabel,
      rate: r.total > 0 ? Math.round((r.success / r.total) * 100) : 0,
    })),
    [history],
  )

  const repoTreemap = useMemo(
    () => (history?.repoBreakdown ?? []).map((r) => ({ name: r.repoLabel, value: r.total })),
    [history],
  )

  const hasUptimeData = (history?.uptimeGrid.length ?? 0) > 0
  const hasDurationData = durationBars.length > 0
  const hasRepoData = repoBars.length > 0
  const hasFlowData = (history?.jobOutcomeFlow.links.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PeriodSelector />
      </div>

      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Uptime</h2>
        {hasUptimeData ? (
          <UptimeGrid rows={history!.uptimeGrid} />
        ) : (
          <p className="text-xs text-muted-foreground">No check history recorded yet for this period.</p>
        )}
      </section>

      <OverviewSection />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Run duration trend</h2>
          {hasDurationData ? (
            <LineChart data={durationBars} dataKey="seconds" height={220} valueFormatter={(v) => `${v}s`} colour={STATUS_COLOURS.up} />
          ) : (
            <p className="text-xs text-muted-foreground">No duration data recorded yet for this period.</p>
          )}
        </section>

        <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Per-repo success rate</h2>
          {hasRepoData ? (
            <BarChart data={repoBars} dataKey="rate" height={220} valueFormatter={(v) => `${v}%`} colour={STATUS_COLOURS.up} />
          ) : (
            <p className="text-xs text-muted-foreground">No run data recorded yet for this period.</p>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Run volume by repo</h2>
        {repoTreemap.length > 0 ? (
          <Treemap data={repoTreemap} height={260} />
        ) : (
          <p className="text-xs text-muted-foreground">No run data recorded yet for this period.</p>
        )}
      </section>

      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Job outcome flow</h2>
        {hasFlowData ? (
          <Sankey data={history!.jobOutcomeFlow} height={320} />
        ) : (
          <p className="text-xs text-muted-foreground">No run data recorded yet for this period.</p>
        )}
      </section>
    </div>
  )
}

export default function OpsAnalyticsClient() {
  return (
    <motion.div variants={dashboardPage} initial="hidden" animate="visible" className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col gap-1">
        <Link href="/dashboard/ops" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-3 w-3" /> Back to Ops
        </Link>
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Ops Analytics</h1>
        </div>
        <p className="text-muted-foreground text-sm">The fuller picture: uptime history, run duration, volume and outcomes across every repo.</p>
      </div>

      <AnalyticsPeriodProvider defaultPeriod="30d">
        <OpsAnalyticsInner />
      </AnalyticsPeriodProvider>
    </motion.div>
  )
}
