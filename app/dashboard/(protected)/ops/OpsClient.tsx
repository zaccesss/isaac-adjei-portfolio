"use client"

// Mission control for the whole personal OS: run any allow-listed workflow across my six repos,
// watch every job and check's live health, see a real historical trend and hold the operational
// switches that used to live in Settings. Absorbed the old /dashboard/control and /dashboard/uptime
// pages (both now redirect here) - one page for watching and running, plus an Overview section
// neither page could show on its own (real history, not just the last ~20 GitHub runs or
// Healthchecks' current-only status). All statuses come from the aggregated control-status route
// (60s cache); the Overview charts come from control-history, which reads
// control_job_runs/control_check_snapshots (migration 048), fed by isaac-adjei-automations'
// control-status-sync job.

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import {
  Activity, Cpu, GraduationCap, Mail, MessageSquare,
  Play, Plug, RefreshCw, Wrench, Briefcase, BarChart3, ListChecks,
} from "lucide-react"
import { SiSpotify, SiStrava } from "react-icons/si"
import { bulkSyncDeadlinesToLinear, bulkSyncApplicationsToLinear } from "@/app/dashboard/actions"
import { CONTROL_JOBS, CONTROL_REPO_ORDER, type ControlJob } from "@/lib/control-jobs"
import MaintenancePanel from "@/app/dashboard/components/MaintenancePanel"
import { AnalyticsPeriodProvider, useAnalyticsPeriod, PeriodSelector, periodStartDate, PieChart, BarChart } from "@/components/analytics"
import {
  HcPill, RunDots, StatusLegend, STATUS_COLOURS, relativeTime, fmtDuration, findCheck, hcStyle, JOB_HC_SLUGS,
  type JobStatus, type HcCheck, type ControlStatus,
} from "@/app/dashboard/components/status-ui"

type Message = { text: string; ok: boolean }
type LastRun = { at: string; status: "success" | "failure" } | null

interface ControlHistory {
  dailySuccess: { date: string; total: number; success: number }[]
  perJobSuccess: { jobId: string; label: string; total: number; success: number }[]
  statusBreakdown: { up: number; grace: number; down: number; paused: number }
}

interface OpsStatus {
  weekly: LastRun
  discord: LastRun
  linearApps: LastRun
  linearDeadlines: LastRun
  strava: LastRun
}

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

// The Overview section's 3 charts, fed by control-history. Kept separate from the live job table
// below it - this is trend/history, the table below is "right now".
function OverviewSection() {
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
            <BarChart data={jobBars} dataKey="rate" height={180} valueFormatter={(v) => `${v}%`} colour={STATUS_COLOURS.up} interval={0} />
          </div>
        </div>
      )}
    </section>
  )
}

function JobRow({
  job, status, check, runState, onRun, hasToken,
}: {
  job: ControlJob
  status: JobStatus | undefined
  check: HcCheck | null
  runState: { busy: boolean; message: Message | null }
  onRun: () => void
  hasToken: boolean
}) {
  const lastRun = status?.runs[0]
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 hover:bg-muted/20 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{job.label}</p>
        <p className="text-xs text-muted-foreground">{job.description}</p>
      </div>
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <HcPill check={check} />
        <span className="w-24 shrink-0"><RunDots runs={status?.runs ?? []} /></span>
        <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">
          {status?.successRate != null ? `${status.successRate}%` : "-"}
        </span>
        <span className="text-xs text-muted-foreground w-32 shrink-0" title={lastRun ? `${lastRun.conclusion ?? lastRun.status}${lastRun.durationS != null ? `, took ${fmtDuration(lastRun.durationS)}` : ""}` : undefined}>
          {lastRun ? `${relativeTime(lastRun.startedAt)}${lastRun.durationS != null ? ` · ${fmtDuration(lastRun.durationS)}` : ""}` : "no runs"}
        </span>
        <span className="text-xs text-muted-foreground w-32 shrink-0">{status?.schedule ?? "manual"}</span>
        <Button
          size="sm"
          variant="outline"
          disabled={!hasToken || runState.busy}
          onClick={onRun}
          title={hasToken ? `Dispatch ${job.workflow} in ${job.repo}` : "Set GH_PAT in Vercel to enable runs"}
          className="gap-1.5 shrink-0"
        >
          {runState.busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Run
        </Button>
      </div>
      {runState.message && (
        <span className={`text-xs sm:w-full sm:text-right ${runState.message.ok ? "text-green-600" : "text-destructive"}`}>
          {runState.message.text}
        </span>
      )}
    </div>
  )
}

// A coloured dot matching the shared legend, not a lucide icon, so every status indicator on this
// page speaks the same visual language: green = succeeded, red = failed, blue+pulse = in progress
// right now, grey = never run yet.
function StatusLine({ last, loading, verb }: { last: LastRun; loading: boolean; verb: string }) {
  const dot = loading
    ? "bg-blue-500 animate-pulse"
    : !last
    ? "bg-muted-foreground/40"
    : last.status === "success"
    ? "bg-green-500"
    : "bg-red-500"
  const text = loading
    ? "Running now..."
    : !last
    ? `Not ${verb} yet`
    : `${last.status === "success" ? `Last ${verb}` : `Failed`} ${relativeTime(last.at)}`
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  )
}

function OpsClientInner() {
  const [status, setStatus] = useState<ControlStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [runStates, setRunStates] = useState<Record<string, { busy: boolean; message: Message | null }>>({})

  const [integrations, setIntegrations] = useState<{
    spotify: boolean; wakatime: boolean; linearCareers: boolean; linearUniversity: boolean; strava: boolean
  } | null>(null)
  const [opsStatus, setOpsStatus] = useState<OpsStatus | null>(null)

  const [digestLoading, setDigestLoading] = useState(false)
  const [digestMessage, setDigestMessage] = useState<Message | null>(null)
  const [discordLoading, setDiscordLoading] = useState(false)
  const [discordMessage, setDiscordMessage] = useState<Message | null>(null)
  const [stravaLoading, setStravaLoading] = useState(false)
  const [stravaMessage, setStravaMessage] = useState<Message | null>(null)
  const [linearUniLoading, setLinearUniLoading] = useState(false)
  const [linearUniMessage, setLinearUniMessage] = useState<Message | null>(null)
  const [linearAppLoading, setLinearAppLoading] = useState(false)
  const [linearAppMessage, setLinearAppMessage] = useState<Message | null>(null)

  const loadStatus = useCallback(async (fresh = false) => {
    try {
      const res = await fetch(`/api/dashboard/control-status${fresh ? "?fresh=1" : ""}`)
      if (res.ok) setStatus((await res.json()) as ControlStatus)
    } catch {
      // The page keeps its last snapshot; the next poll tries again.
    } finally {
      setStatusLoading(false)
    }
  }, [])

  const loadOpsStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/ops-status")
      if (res.ok) setOpsStatus((await res.json()) as OpsStatus)
    } catch {
      // Keep the last snapshot.
    }
  }, [])

  useEffect(() => {
    // The initial load is deferred a tick so no state update runs synchronously inside the effect.
    const initial = setTimeout(() => void loadStatus(), 0)
    const interval = setInterval(() => void loadStatus(), 60_000)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [loadStatus])

  useEffect(() => {
    void (async () => {
      const [integrationRes] = await Promise.allSettled([
        fetch("/api/dashboard/integration-status"),
        loadOpsStatus(),
      ])
      if (integrationRes.status === "fulfilled" && integrationRes.value.ok) {
        setIntegrations(await integrationRes.value.json())
      }
    })()
  }, [loadOpsStatus])

  const jobStatusById = useMemo(() => new Map((status?.jobs ?? []).map((j) => [j.id, j])), [status])

  // The headline: how many checks are up, late and down right now.
  const checkCounts = useMemo(() => {
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

  async function runJob(id: string) {
    setRunStates((p) => ({ ...p, [id]: { busy: true, message: null } }))
    try {
      const res = await fetch("/api/dashboard/run-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = (await res.json()) as { error?: string }
      if (res.ok) {
        setRunStates((p) => ({ ...p, [id]: { busy: false, message: { text: "Queued - the run appears below shortly.", ok: true } } }))
        // Give GitHub a moment to register the run, then refresh past the cache.
        setTimeout(() => void loadStatus(true), 8000)
      } else {
        setRunStates((p) => ({ ...p, [id]: { busy: false, message: { text: data.error ?? "Failed to dispatch.", ok: false } } }))
      }
    } catch {
      setRunStates((p) => ({ ...p, [id]: { busy: false, message: { text: "Something went wrong.", ok: false } } }))
    }
  }

  async function triggerRoute(url: string, setLoading: (v: boolean) => void, setMessage: (m: Message | null) => void, okText: string) {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(url, { method: "POST" })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setMessage(res.ok ? { text: okText, ok: true } : { text: data.error ?? "Failed.", ok: false })
    } catch {
      setMessage({ text: "Something went wrong.", ok: false })
    } finally {
      setLoading(false)
      void loadOpsStatus()
    }
  }

  async function handleStravaSync() {
    setStravaLoading(true)
    setStravaMessage(null)
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" })
      const data = (await res.json().catch(() => ({}))) as { synced?: number; error?: string }
      setStravaMessage(
        res.ok
          ? { text: `Synced ${data.synced ?? 0} activities.`, ok: true }
          : { text: data.error === "strava_unreachable" ? "Could not reach Strava, try again." : "Sync failed.", ok: false },
      )
    } catch {
      setStravaMessage({ text: "Sync failed.", ok: false })
    } finally {
      setStravaLoading(false)
      void loadOpsStatus()
    }
  }

  async function handleLinearSync(kind: "uni" | "app") {
    const setLoading = kind === "uni" ? setLinearUniLoading : setLinearAppLoading
    const setMessage = kind === "uni" ? setLinearUniMessage : setLinearAppMessage
    setLoading(true)
    setMessage(null)
    try {
      const result = kind === "uni" ? await bulkSyncDeadlinesToLinear() : await bulkSyncApplicationsToLinear()
      const noun = kind === "uni" ? "deadline" : "application"
      setMessage({ text: `${result.synced} ${noun}${result.synced === 1 ? "" : "s"} synced to Linear.${result.skipped > 0 ? ` ${result.skipped} skipped (already synced).` : ""}`, ok: true })
    } catch {
      setMessage({ text: "Sync failed. Check the Linear keys in Vercel.", ok: false })
    } finally {
      setLoading(false)
      void loadOpsStatus()
    }
  }

  return (
    <motion.div variants={dashboardPage} initial="hidden" animate="visible" className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Ops</h1>
          <p className="text-muted-foreground text-sm">Watch and run every job across my six repos.</p>
        </div>
      </div>

      {/* Headline banner: the one-glance answer. */}
      {checkCounts.total > 0 && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
          checkCounts.down > 0 ? "border-red-500/40 bg-red-500/10" : checkCounts.late > 0 ? "border-amber-500/40 bg-amber-500/10" : "border-green-500/40 bg-green-500/10"
        }`}>
          <span className={`h-3 w-3 rounded-full ${checkCounts.down > 0 ? "bg-red-500" : checkCounts.late > 0 ? "bg-amber-500" : "bg-green-500"}`} />
          <div className="flex flex-col">
            <p className={`text-sm font-semibold ${checkCounts.down > 0 ? "text-red-600" : checkCounts.late > 0 ? "text-amber-600" : "text-green-700"}`}>
              {checkCounts.down > 0 ? `${checkCounts.down} system${checkCounts.down !== 1 ? "s" : ""} down` : checkCounts.late > 0 ? `${checkCounts.late} late, the rest up` : "All systems operational"}
            </p>
            <p className="text-xs text-muted-foreground">{checkCounts.up} up · {checkCounts.late} late · {checkCounts.down} down of {checkCounts.total} checks</p>
          </div>
        </div>
      )}

      <StatusLegend />

      {!statusLoading && status && !status.hasToken && (
        <p className="text-xs text-destructive border border-destructive/40 bg-destructive/10 rounded-lg px-3 py-2">
          GH_PAT is not set in Vercel, so run history and the Run buttons are disabled.
        </p>
      )}

      {status && checkCounts.total === 0 && (
        <p className="text-xs text-muted-foreground border border-border rounded-lg px-3 py-2">
          No Healthchecks keys are set in Vercel yet, so there are no live checks to show.
        </p>
      )}

      <OverviewSection />

      {/* Site and other checks that are monitored but not run from here. */}
      {extraChecks.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Site and services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {extraChecks.map((c) => <CheckCard key={`${c.project}-${c.slug}`} check={c} />)}
          </div>
        </section>
      )}

      {/* One group per repo: label + description, health pill, run dots, success rate, last run, schedule, Run. */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Jobs</h2>
        </div>
        <div className="hidden sm:flex items-center gap-4 px-4 text-[10px] uppercase tracking-wide text-muted-foreground/60 justify-end">
          <span className="w-14">Check</span>
          <span className="w-24">Recent runs</span>
          <span className="w-10 text-right">Pass</span>
          <span className="w-32">Last run</span>
          <span className="w-32">Schedule</span>
          <span className="w-[72px]" />
        </div>
        {CONTROL_REPO_ORDER.map(({ repo, label }) => {
          const jobs = CONTROL_JOBS.filter((j) => j.repo === repo)
          if (jobs.length === 0) return null
          return (
            <div key={repo} className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground ml-auto">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-border/50">
                {jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    status={jobStatusById.get(job.id)}
                    check={findCheck(job, status?.checks ?? [])}
                    runState={runStates[job.id] ?? { busy: false, message: null }}
                    onRun={() => void runJob(job.id)}
                    hasToken={status?.hasToken ?? false}
                  />
                ))}
              </div>
            </div>
          )
        })}
        {statusLoading && <p className="text-sm text-muted-foreground">Loading job status...</p>}
        {!statusLoading && status && (
          <p className="text-[11px] text-muted-foreground/70">
            {status.scheduleLive ? "Schedules are live from the cron-ops worker." : "Schedules are the built-in labels; the live cron-ops feed was unreachable."}
            {" "}Statuses refresh every minute.
          </p>
        )}
      </section>

      {/* App actions - portfolio-side sends and syncs that are not GitHub workflows. */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">App actions</h2>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Weekly digest email</span>
            <StatusLine last={opsStatus?.weekly ?? null} loading={digestLoading} verb="sent" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" disabled={digestLoading} className="gap-1.5"
              onClick={() => void triggerRoute("/api/dashboard/trigger-digest", setDigestLoading, setDigestMessage, "Digest email sent.")}>
              <RefreshCw className={`h-3.5 w-3.5 ${digestLoading ? "animate-spin" : ""}`} />
              {digestLoading ? "Sending..." : "Send test"}
            </Button>
            {digestMessage && <span className={`text-xs ${digestMessage.ok ? "text-green-600" : "text-destructive"}`}>{digestMessage.text}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-muted-foreground" /> Discord digest</span>
            <StatusLine last={opsStatus?.discord ?? null} loading={discordLoading} verb="sent" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" disabled={discordLoading} className="gap-1.5"
              onClick={() => void triggerRoute("/api/dashboard/trigger-discord-digest", setDiscordLoading, setDiscordMessage, "Discord digest sent.")}>
              <RefreshCw className={`h-3.5 w-3.5 ${discordLoading ? "animate-spin" : ""}`} />
              {discordLoading ? "Sending..." : "Send now"}
            </Button>
            {discordMessage && <span className={`text-xs ${discordMessage.ok ? "text-green-600" : "text-destructive"}`}>{discordMessage.text}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Sync applications to Linear</span>
            <p className="text-xs text-muted-foreground">Creates an issue for each application not yet synced</p>
            <StatusLine last={opsStatus?.linearApps ?? null} loading={linearAppLoading} verb="synced" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" disabled={linearAppLoading || !integrations?.linearCareers} className="gap-1.5"
              title={!integrations?.linearCareers ? "Set LINEAR_TEAM_ID in Vercel to enable" : undefined}
              onClick={() => void handleLinearSync("app")}>
              <RefreshCw className={`h-3.5 w-3.5 ${linearAppLoading ? "animate-spin" : ""}`} />
              {linearAppLoading ? "Syncing..." : "Sync"}
            </Button>
            {linearAppMessage && <span className={`text-xs ${linearAppMessage.ok ? "text-green-600" : "text-destructive"}`}>{linearAppMessage.text}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-muted-foreground" /> Sync deadlines to Linear</span>
            <p className="text-xs text-muted-foreground">Creates an issue for each university deadline not yet synced</p>
            <StatusLine last={opsStatus?.linearDeadlines ?? null} loading={linearUniLoading} verb="synced" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" disabled={linearUniLoading || !integrations?.linearUniversity} className="gap-1.5"
              title={!integrations?.linearUniversity ? "Set LINEAR_UNI_TEAM_ID in Vercel to enable" : undefined}
              onClick={() => void handleLinearSync("uni")}>
              <RefreshCw className={`h-3.5 w-3.5 ${linearUniLoading ? "animate-spin" : ""}`} />
              {linearUniLoading ? "Syncing..." : "Sync"}
            </Button>
            {linearUniMessage && <span className={`text-xs ${linearUniMessage.ok ? "text-green-600" : "text-destructive"}`}>{linearUniMessage.text}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium flex items-center gap-1.5"><SiStrava className="h-3.5 w-3.5 text-muted-foreground" /> Sync Strava activities</span>
            <p className="text-xs text-muted-foreground">Pulls recent runs and rides into the fitness analytics</p>
            {integrations?.strava && <StatusLine last={opsStatus?.strava ?? null} loading={stravaLoading} verb="synced" />}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {integrations?.strava ? (
              <Button variant="outline" size="sm" disabled={stravaLoading} className="gap-1.5" onClick={() => void handleStravaSync()}>
                <RefreshCw className={`h-3.5 w-3.5 ${stravaLoading ? "animate-spin" : ""}`} />
                {stravaLoading ? "Syncing..." : "Sync"}
              </Button>
            ) : (
              <a href="/api/strava/auth" className="inline-flex items-center gap-1.5 rounded-md bg-[#FC4C02] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#e34402] transition-colors">
                <Plug className="h-3.5 w-3.5" /> Connect Strava
              </a>
            )}
            {stravaMessage && <span className={`text-xs ${stravaMessage.ok ? "text-green-600" : "text-destructive"}`}>{stravaMessage.text}</span>}
          </div>
        </div>
      </section>

      {/* Integrations - which external services are configured. */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Integrations</h2>
        </div>
        {integrations ? (
          <div className="flex flex-col gap-2">
            {[
              { label: "Spotify", connected: integrations.spotify, icon: <SiSpotify className="h-3.5 w-3.5 shrink-0" /> },
              { label: "WakaTime", connected: integrations.wakatime, icon: <Activity className="h-3.5 w-3.5 shrink-0" /> },
              { label: "Linear (Careers)", connected: integrations.linearCareers, icon: <Plug className="h-3.5 w-3.5 shrink-0" /> },
              { label: "Linear (University)", connected: integrations.linearUniversity, icon: <GraduationCap className="h-3.5 w-3.5 shrink-0" /> },
              { label: "Strava", connected: integrations.strava, icon: <SiStrava className="h-3.5 w-3.5 shrink-0" /> },
            ].map(({ label, connected, icon }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{icon}</span>
                  <span>{label}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? "text-green-600" : "text-muted-foreground"}`}>
                  <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                  {connected ? "Connected" : "Not configured"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
      </section>

      {/* Maintenance mode - the site-wide switch. */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Maintenance</h2>
        </div>
        <MaintenancePanel />
      </section>
    </motion.div>
  )
}

export default function OpsClient() {
  return (
    <AnalyticsPeriodProvider defaultPeriod="30d">
      <OpsClientInner />
    </AnalyticsPeriodProvider>
  )
}
