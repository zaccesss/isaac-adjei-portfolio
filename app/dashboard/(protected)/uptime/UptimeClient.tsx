"use client"

// The status board. It reads the same aggregated control-status route as the control page (cached a
// minute server-side) and renders it for watching rather than running: a headline, every
// Healthchecks check across both projects as a pill grid, then each job's recent run history. The
// control page is where I press buttons; this is where I glance to see everything is alive.

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { Activity, SlidersHorizontal } from "lucide-react"
import { CONTROL_JOBS, CONTROL_REPO_ORDER } from "@/lib/control-jobs"
import {
  RunDots, relativeTime, hcStyle, findCheck, JOB_HC_SLUGS,
  type ControlStatus, type HcCheck,
} from "@/app/dashboard/components/status-ui"

function CheckCard({ check }: { check: HcCheck }) {
  const m = hcStyle(check.status)
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${m.dot}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate leading-tight">{check.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {m.label}{check.lastPing ? ` · checked in ${relativeTime(check.lastPing)}` : " · no ping yet"}
        </p>
      </div>
    </div>
  )
}

export default function UptimeClient() {
  const [status, setStatus] = useState<ControlStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/control-status")
      if (res.ok) setStatus((await res.json()) as ControlStatus)
    } catch {
      // Keep the last snapshot; the next poll tries again.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initial = setTimeout(() => void loadStatus(), 0)
    const interval = setInterval(() => void loadStatus(), 60_000)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [loadStatus])

  const counts = useMemo(() => {
    const checks = status?.checks ?? []
    return {
      total: checks.length,
      up: checks.filter((c) => c.status === "up").length,
      late: checks.filter((c) => c.status === "grace").length,
      down: checks.filter((c) => c.status === "down").length,
    }
  }, [status])

  // Checks with no matching job row: site uptime and anything else monitored but not run from here.
  const extraChecks = useMemo(
    () => (status?.checks ?? []).filter((c) => !JOB_HC_SLUGS.has(c.slug.toLowerCase()) && !JOB_HC_SLUGS.has(c.name.toLowerCase())),
    [status],
  )
  const jobChecks = useMemo(
    () => (status?.checks ?? []).filter((c) => JOB_HC_SLUGS.has(c.slug.toLowerCase()) || JOB_HC_SLUGS.has(c.name.toLowerCase())),
    [status],
  )
  const jobStatusById = useMemo(() => new Map((status?.jobs ?? []).map((j) => [j.id, j])), [status])

  return (
    <motion.div variants={dashboardPage} initial="hidden" animate="visible" className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Uptime</h1>
          <p className="text-muted-foreground text-sm">Is every system still checking in?</p>
        </div>
        <Link href="/dashboard/control" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Control
        </Link>
      </div>

      {/* Headline banner: the one-glance answer. */}
      {counts.total > 0 && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
          counts.down > 0 ? "border-red-500/40 bg-red-500/10" : counts.late > 0 ? "border-amber-500/40 bg-amber-500/10" : "border-green-500/40 bg-green-500/10"
        }`}>
          <span className={`h-3 w-3 rounded-full ${counts.down > 0 ? "bg-red-500" : counts.late > 0 ? "bg-amber-500" : "bg-green-500"}`} />
          <div className="flex flex-col">
            <p className={`text-sm font-semibold ${counts.down > 0 ? "text-red-600" : counts.late > 0 ? "text-amber-600" : "text-green-700"}`}>
              {counts.down > 0 ? `${counts.down} system${counts.down !== 1 ? "s" : ""} down` : counts.late > 0 ? `${counts.late} late, the rest up` : "All systems operational"}
            </p>
            <p className="text-xs text-muted-foreground">{counts.up} up · {counts.late} late · {counts.down} down of {counts.total} checks</p>
          </div>
        </div>
      )}

      {loading && !status && <p className="text-sm text-muted-foreground">Loading status...</p>}

      {status && counts.total === 0 && (
        <p className="text-xs text-muted-foreground border border-border rounded-lg px-3 py-2">
          No Healthchecks keys are set in Vercel yet, so there are no live checks to show. The run history below still works with GH_PAT.
        </p>
      )}

      {/* Site and other checks that are monitored but not run from the control page. */}
      {extraChecks.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Site and services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {extraChecks.map((c) => <CheckCard key={`${c.project}-${c.slug}`} check={c} />)}
          </div>
        </section>
      )}

      {/* Job checks as a grid, then per-job run history grouped by repo. */}
      {jobChecks.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Job checks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {jobChecks.map((c) => <CheckCard key={`${c.project}-${c.slug}`} check={c} />)}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Run history</h2>
        {CONTROL_REPO_ORDER.map(({ repo, label }) => {
          const jobs = CONTROL_JOBS.filter((j) => j.repo === repo)
          if (jobs.length === 0) return null
          return (
            <div key={repo} className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">{label}</span>
              </div>
              <div className="divide-y divide-border/50">
                {jobs.map((job) => {
                  const js = jobStatusById.get(job.id)
                  const check = findCheck(job, status?.checks ?? [])
                  const lastRun = js?.runs[0]
                  const m = check ? hcStyle(check.status) : null
                  return (
                    <div key={job.id} className="flex items-center gap-3 px-4 py-2.5">
                      {m ? <span className={`h-2 w-2 rounded-full shrink-0 ${m.dot}`} title={m.label} /> : <span className="h-2 w-2 rounded-full shrink-0 bg-muted-foreground/25" />}
                      <span className="text-sm flex-1 min-w-0 truncate">{job.label}</span>
                      <span className="shrink-0"><RunDots runs={js?.runs ?? []} /></span>
                      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">{js?.successRate != null ? `${js.successRate}%` : "-"}</span>
                      <span className="text-xs text-muted-foreground w-20 text-right shrink-0 hidden sm:block">{lastRun ? relativeTime(lastRun.startedAt) : "no runs"}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>

      {status && (
        <p className="text-[11px] text-muted-foreground/70">
          Health from Healthchecks, run history from GitHub, refreshed every minute. Press Run on the{" "}
          <Link href="/dashboard/control" className="underline underline-offset-2 hover:text-foreground">control page</Link>.
        </p>
      )}
    </motion.div>
  )
}
