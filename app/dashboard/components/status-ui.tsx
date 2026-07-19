"use client"

// Shared status UI for the control and uptime pages: the types the control-status route returns
// plus the small presentational pieces both pages render (relative time, a Healthchecks pill, a
// run-history dot strip). Kept in one place so the two pages never drift.

export type JobRun = { conclusion: string | null; status: string; startedAt: string; durationS: number | null; url: string }
export type JobStatus = { id: string; runs: JobRun[]; successRate: number | null; schedule: string | null }
export type HcCheck = { name: string; slug: string; status: string; lastPing: string | null; project: string }
export type ControlStatus = {
  generatedAt: string
  hasToken: boolean
  hcConfigured: { automations: boolean; fleet: boolean }
  scheduleLive: boolean
  jobs: JobStatus[]
  checks: HcCheck[]
}

export function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function fmtDuration(s: number | null): string {
  if (s == null) return ""
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

const HC_MAP: Record<string, { dot: string; label: string }> = {
  up: { dot: "bg-green-500", label: "up" },
  grace: { dot: "bg-amber-500", label: "late" },
  down: { dot: "bg-red-500", label: "down" },
  paused: { dot: "bg-muted-foreground/40", label: "paused" },
}

export function hcStyle(status: string): { dot: string; label: string } {
  return HC_MAP[status] ?? { dot: "bg-muted-foreground/40", label: status }
}

// Healthchecks state to a coloured pill. up = pinged on schedule, grace = late, down = missed.
export function HcPill({ check }: { check: HcCheck | null }) {
  if (!check) return <span className="text-xs text-muted-foreground/50 w-14 text-center shrink-0">-</span>
  const m = hcStyle(check.status)
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
export function RunDots({ runs }: { runs: JobRun[] }) {
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

import { CONTROL_JOBS, type ControlJob } from "@/lib/control-jobs"

export function findCheck(job: ControlJob, checks: HcCheck[]): HcCheck | null {
  if (!job.hcSlug) return null
  const slug = job.hcSlug.toLowerCase()
  return (
    checks.find((c) => c.slug.toLowerCase() === slug) ??
    checks.find((c) => c.name.toLowerCase().includes(slug)) ??
    null
  )
}

// The Healthchecks slugs my job rows reference, so the uptime page can tell which checks are extra
// (site uptime and anything else that has no job on the control page).
export const JOB_HC_SLUGS = new Set(CONTROL_JOBS.map((j) => j.hcSlug?.toLowerCase()).filter(Boolean) as string[])
