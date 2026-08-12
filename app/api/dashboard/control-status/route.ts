// One aggregated read for the control and uptime pages: recent GitHub runs for every allow-listed
// job, the Healthchecks state of both projects and the live cron-ops schedule. The result is cached
// in memory for 60 seconds so the pages can poll freely while GitHub and Healthchecks each see
// about one burst a minute regardless of how many tabs sit open.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { CONTROL_JOBS, GH_OWNER } from "@/lib/control-jobs"

export const dynamic = "force-dynamic"

const CRON_OPS_URL = process.env.CRON_OPS_URL || "https://cron-ops.offices-isaac.workers.dev"

export interface JobRun {
  conclusion: string | null
  status: string
  startedAt: string
  durationS: number | null
  url: string
}

export interface JobStatus {
  id: string
  runs: JobRun[]
  successRate: number | null
  schedule: string | null
}

export interface HcCheck {
  name: string
  slug: string
  status: string
  lastPing: string | null
  project: "automations" | "fleet" | "portfolio"
}

interface ControlStatusBody {
  generatedAt: string
  hasToken: boolean
  hcConfigured: { automations: boolean; fleet: boolean; portfolio: boolean }
  scheduleLive: boolean
  jobs: JobStatus[]
  checks: HcCheck[]
}

type GitHubRun = {
  conclusion: string | null
  status: string
  run_started_at?: string
  created_at: string
  updated_at: string
  html_url: string
}

async function fetchRuns(token: string, repo: string, workflow: string): Promise<JobRun[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GH_OWNER}/${repo}/actions/workflows/${workflow}/runs?per_page=20&exclude_pull_requests=true`,
      {
        headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { workflow_runs?: GitHubRun[] }
    return (data.workflow_runs ?? []).map((r) => {
      const started = r.run_started_at ?? r.created_at
      const done = r.status === "completed"
      return {
        conclusion: r.conclusion,
        status: r.status,
        startedAt: started,
        durationS: done ? Math.max(0, Math.round((new Date(r.updated_at).getTime() - new Date(started).getTime()) / 1000)) : null,
        url: r.html_url,
      }
    })
  } catch {
    return []
  }
}

async function fetchChecks(key: string, project: "automations" | "fleet" | "portfolio"): Promise<HcCheck[]> {
  try {
    const res = await fetch("https://healthchecks.io/api/v3/checks/", {
      headers: { "X-Api-Key": key },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { checks?: { name?: string; slug?: string; status?: string; last_ping?: string | null }[] }
    return (data.checks ?? []).map((c) => ({
      name: c.name ?? "check",
      slug: c.slug ?? (c.name ?? "").toLowerCase().replace(/\s+/g, "-"),
      status: c.status ?? "unknown",
      lastPing: c.last_ping ?? null,
      project,
    }))
  } catch {
    return []
  }
}

// The live schedule from the cron-ops worker, rendered to the same human labels as the fallbacks.
// Any failure (endpoint not deployed yet, worker unreachable) just returns null and the static
// labels in control-jobs.ts stand in.
async function fetchSchedule(): Promise<Map<string, string> | null> {
  try {
    const res = await fetch(`${CRON_OPS_URL}/schedule`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const jobs = (await res.json()) as { workflow?: string; when?: { kind?: string; minutes?: number; hours?: number; hour?: number; minute?: number } }[]
    if (!Array.isArray(jobs)) return null
    const out = new Map<string, string>()
    for (const j of jobs) {
      if (!j.workflow || !j.when) continue
      const w = j.when
      const label =
        w.kind === "everyMinutes" ? `every ${w.minutes} min`
        : w.kind === "everyHours" ? `every ${w.hours} hours`
        : w.kind === "daily" ? `${String(w.hour).padStart(2, "0")}:${String(w.minute).padStart(2, "0")} UK`
        : null
      if (!label) continue
      // A workflow can appear twice (morning + evening slots) - join the times into one label.
      out.set(j.workflow, out.has(j.workflow) ? `${out.get(j.workflow)} + ${label}` : label)
    }
    return out.size > 0 ? out : null
  } catch {
    return null
  }
}

let cache: { at: number; body: ControlStatusBody } | null = null
const CACHE_MS = 60_000

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const fresh = new URL(request.url).searchParams.get("fresh") === "1"
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(cache.body, { headers: { "Cache-Control": "no-store" } })
  }

  const token = process.env.GH_PAT ?? process.env.GITHUB_PAT ?? null
  const hcAutomationsKey = process.env.HEALTHCHECKS_API_KEY ?? null
  const hcFleetKey = process.env.HEALTHCHECKS_FLEET_API_KEY ?? null
  const hcPortfolioKey = process.env.HEALTHCHECKS_PORTFOLIO_API_KEY ?? null

  const [runsPerJob, autoChecks, fleetChecks, portfolioChecks, schedule] = await Promise.all([
    token
      ? Promise.all(CONTROL_JOBS.map((j) => fetchRuns(token, j.repo, j.workflow)))
      : Promise.resolve(CONTROL_JOBS.map(() => [] as JobRun[])),
    hcAutomationsKey ? fetchChecks(hcAutomationsKey, "automations") : Promise.resolve([]),
    hcFleetKey ? fetchChecks(hcFleetKey, "fleet") : Promise.resolve([]),
    hcPortfolioKey ? fetchChecks(hcPortfolioKey, "portfolio") : Promise.resolve([]),
    fetchSchedule(),
  ])

  const jobs: JobStatus[] = CONTROL_JOBS.map((j, i) => {
    const runs = runsPerJob[i]
    const completed = runs.filter((r) => r.status === "completed")
    const successRate = completed.length > 0
      ? Math.round((completed.filter((r) => r.conclusion === "success").length / completed.length) * 100)
      : null
    return {
      id: j.id,
      runs: runs.slice(0, 10),
      successRate,
      schedule: schedule?.get(j.workflow) ?? j.schedule ?? null,
    }
  })

  const body: ControlStatusBody = {
    generatedAt: new Date().toISOString(),
    hasToken: Boolean(token),
    hcConfigured: { automations: Boolean(hcAutomationsKey), fleet: Boolean(hcFleetKey), portfolio: Boolean(hcPortfolioKey) },
    scheduleLive: schedule !== null,
    jobs,
    checks: [...autoChecks, ...fleetChecks, ...portfolioChecks],
  }

  cache = { at: Date.now(), body }
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } })
}
