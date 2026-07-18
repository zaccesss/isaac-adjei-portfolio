"use client"

// Mission control for the personal OS. One page that can run every allow-listed workflow across my
// six repos, shows each job's Healthchecks state, recent run history and schedule, and hosts the
// operational panels that moved out of Settings (digests, Linear and Strava syncs, integrations,
// maintenance mode). All statuses come from the aggregated control-status route, which caches for
// a minute server-side, so the page can poll without hammering GitHub or Healthchecks.

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import {
  Activity, CheckCircle2, Clock, Cpu, FileText, GraduationCap, Mail, MessageSquare,
  Play, Plug, RefreshCw, Wrench, XCircle, Briefcase,
} from "lucide-react"
import { SiSpotify, SiStrava } from "react-icons/si"
import { bulkSyncDeadlinesToLinear, bulkSyncApplicationsToLinear } from "@/app/dashboard/actions"
import { CONTROL_JOBS, CONTROL_REPO_ORDER, type ControlJob } from "@/lib/control-jobs"
import MaintenancePanel from "@/app/dashboard/components/MaintenancePanel"

type JobRun = { conclusion: string | null; status: string; startedAt: string; durationS: number | null; url: string }
type JobStatus = { id: string; runs: JobRun[]; successRate: number | null; schedule: string | null }
type HcCheck = { name: string; slug: string; status: string; lastPing: string | null; project: string }
type ControlStatus = {
  generatedAt: string
  hasToken: boolean
  hcConfigured: { automations: boolean; fleet: boolean }
  scheduleLive: boolean
  jobs: JobStatus[]
  checks: HcCheck[]
}
type Message = { text: string; ok: boolean }

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function fmtDuration(s: number | null): string {
  if (s == null) return ""
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

// Healthchecks state to a coloured pill. up = pinged on schedule, grace = late, down = missed.
function HcPill({ check }: { check: HcCheck | null }) {
  if (!check) return <span className="text-xs text-muted-foreground/50 w-14 text-center shrink-0">-</span>
  const map: Record<string, { dot: string; label: string }> = {
    up: { dot: "bg-green-500", label: "up" },
    grace: { dot: "bg-amber-500", label: "late" },
    down: { dot: "bg-red-500", label: "down" },
    paused: { dot: "bg-muted-foreground/40", label: "paused" },
  }
  const m = map[check.status] ?? { dot: "bg-muted-foreground/40", label: check.status }
  return (
    <span
      className="flex items-center gap-1.5 text-xs w-14 shrink-0"
      title={`${check.name}: ${m.label}${check.lastPing ? `, last ping ${relativeTime(check.lastPing)}` : ""}`}
    >
      <span className={`h-2 w-2 rounded-full shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  )
}

// The last runs as dots, oldest to newest, so the row reads like a timeline.
function RunDots({ runs }: { runs: JobRun[] }) {
  if (runs.length === 0) return <span className="text-xs text-muted-foreground/50">no runs</span>
  return (
    <span className="flex items-center gap-1">
      {[...runs].reverse().map((r, i) => {
        const colour =
          r.status !== "completed" ? "bg-blue-500 animate-pulse"
          : r.conclusion === "success" ? "bg-green-500"
          : r.conclusion === "skipped" ? "bg-muted-foreground/40"
          : "bg-red-500"
        return (
          <a
            key={`${r.startedAt}-${i}`}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${r.conclusion ?? r.status} · ${relativeTime(r.startedAt)}${r.durationS != null ? ` · ${fmtDuration(r.durationS)}` : ""}`}
            className={`h-2 w-2 rounded-full ${colour} hover:ring-2 hover:ring-primary/40 transition-shadow`}
          />
        )
      })}
    </span>
  )
}

function findCheck(job: ControlJob, checks: HcCheck[]): HcCheck | null {
  if (!job.hcSlug) return null
  const slug = job.hcSlug.toLowerCase()
  return (
    checks.find((c) => c.slug.toLowerCase() === slug) ??
    checks.find((c) => c.name.toLowerCase().includes(slug)) ??
    null
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
        <p className="text-xs text-muted-foreground truncate" title={job.description}>{job.description}</p>
      </div>
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <HcPill check={check} />
        <span className="w-24 shrink-0"><RunDots runs={status?.runs ?? []} /></span>
        <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">
          {status?.successRate != null ? `${status.successRate}%` : "-"}
        </span>
        <span className="text-xs text-muted-foreground w-28 shrink-0" title={lastRun ? `${lastRun.conclusion ?? lastRun.status}${lastRun.durationS != null ? `, took ${fmtDuration(lastRun.durationS)}` : ""}` : undefined}>
          {lastRun ? `${relativeTime(lastRun.startedAt)}${lastRun.durationS != null ? ` · ${fmtDuration(lastRun.durationS)}` : ""}` : "no runs"}
        </span>
        <span className="text-xs text-muted-foreground w-28 shrink-0">{status?.schedule ?? "manual"}</span>
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

function StatusLine({ status, lastRun }: { status: "success" | "failure" | "unknown"; lastRun: string | null }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status === "success" ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : status === "failure" ? (
        <XCircle className="h-4 w-4 text-destructive shrink-0" />
      ) : (
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className="text-xs text-muted-foreground">
        {lastRun ? `Last sent ${relativeTime(lastRun)}` : "Not sent yet"}
      </span>
    </div>
  )
}

export default function ControlClient() {
  const [status, setStatus] = useState<ControlStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [runStates, setRunStates] = useState<Record<string, { busy: boolean; message: Message | null }>>({})

  const [integrations, setIntegrations] = useState<{
    spotify: boolean; wakatime: boolean; linearCareers: boolean; linearUniversity: boolean; strava: boolean
  } | null>(null)
  const [digests, setDigests] = useState<{
    weekly: { sentAt: string | null; status: "success" | "failure" | "unknown" }
    discord: { sentAt: string | null; status: "success" | "failure" | "unknown" }
  } | null>(null)

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
      const [integrationRes, digestRes] = await Promise.allSettled([
        fetch("/api/dashboard/integration-status"),
        fetch("/api/dashboard/digest-status"),
      ])
      if (integrationRes.status === "fulfilled" && integrationRes.value.ok) {
        setIntegrations(await integrationRes.value.json())
      }
      if (digestRes.status === "fulfilled" && digestRes.value.ok) {
        setDigests(await digestRes.value.json())
      }
    })()
  }, [])

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
    }
  }

  return (
    <motion.div variants={dashboardPage} initial="hidden" animate="visible" className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Control</h1>
          <p className="text-muted-foreground text-sm">Run and watch every job across my six repos.</p>
        </div>
        {checkCounts.total > 0 && (
          <div className={`flex items-center gap-2 text-sm font-medium ${checkCounts.down > 0 ? "text-red-500" : checkCounts.late > 0 ? "text-amber-500" : "text-green-600"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${checkCounts.down > 0 ? "bg-red-500" : checkCounts.late > 0 ? "bg-amber-500" : "bg-green-500"}`} />
            {checkCounts.down > 0
              ? `${checkCounts.down} of ${checkCounts.total} down`
              : checkCounts.late > 0
              ? `${checkCounts.late} late, rest up`
              : "All systems operational"}
          </div>
        )}
      </div>

      {!statusLoading && status && !status.hasToken && (
        <p className="text-xs text-destructive border border-destructive/40 bg-destructive/10 rounded-lg px-3 py-2">
          GH_PAT is not set in Vercel, so run history and the Run buttons are disabled.
        </p>
      )}

      {/* One group per repo: label + description, health pill, run dots, success rate, last run, schedule, Run. */}
      <section className="flex flex-col gap-4">
        <div className="hidden sm:flex items-center gap-4 px-4 text-[10px] uppercase tracking-wide text-muted-foreground/60 justify-end">
          <span className="w-14">Check</span>
          <span className="w-24">Recent runs</span>
          <span className="w-10 text-right">Pass</span>
          <span className="w-28">Last run</span>
          <span className="w-28">Schedule</span>
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
            {digests?.weekly && <StatusLine status={digests.weekly.status} lastRun={digests.weekly.sentAt} />}
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
            {digests?.discord && <StatusLine status={digests.discord.status} lastRun={digests.discord.sentAt} />}
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

      <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5">
        <FileText className="h-3 w-3" />
        CV and scraper triggers moved here from Settings; the same routes power both.
      </p>
    </motion.div>
  )
}
