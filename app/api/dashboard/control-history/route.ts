// Reads control_job_runs/control_check_snapshots (migration 048), populated by automations'
// control-status-sync job, to answer the questions control-status/route.ts's live GitHub/Healthchecks
// reads structurally cannot: a real trend over a period. Session-gated like control-status. The
// period cutoff is computed client-side (via the existing periodStartDate helper OpsClient
// already has access to) and passed as ?since=, so the period system's date math stays in one place
// rather than being duplicated here.
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { CONTROL_JOBS } from "@/lib/control-jobs"

export const dynamic = "force-dynamic"

interface SankeyChartData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
}

interface ControlHistoryBody {
  dailySuccess: { date: string; total: number; success: number }[]
  perJobSuccess: { jobId: string; label: string; total: number; success: number }[]
  statusBreakdown: { up: number; grace: number; down: number; paused: number }
  // Analytics-page-only fields below - the main Ops page's Overview section only reads the 3 above.
  uptimeGrid: { slug: string; label: string; days: { date: string; status: string }[] }[]
  durationTrend: { date: string; avgDurationS: number }[]
  repoBreakdown: { repo: string; repoLabel: string; total: number; success: number }[]
  jobOutcomeFlow: SankeyChartData
}

// Titles a raw Healthchecks slug for checks with no matching CONTROL_JOBS entry (the App-action
// Vercel-cron pings and the fleet Workers' own internal crons) - "vault-expiry" -> "Vault Expiry".
function titleiseSlug(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

// Worst-of-day rollup, matching the severity order the shared STATUS_COLOURS/legend already use.
const STATUS_SEVERITY: Record<string, number> = { down: 3, grace: 2, paused: 1, up: 0 }
function worseStatus(a: string, b: string): string {
  return (STATUS_SEVERITY[a] ?? 0) >= (STATUS_SEVERITY[b] ?? 0) ? a : b
}

let cache: { key: string; at: number; body: ControlHistoryBody } | null = null
const CACHE_MS = 60_000

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const since = new URL(request.url).searchParams.get("since")
  if (!since) return NextResponse.json({ error: "Missing since" }, { status: 400 })

  if (cache && cache.key === since && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(cache.body, { headers: { "Cache-Control": "no-store" } })
  }

  const [{ data: runs }, { data: snapshots }] = await Promise.all([
    supabase
      .from("control_job_runs")
      .select("job_id,conclusion,status,started_at,duration_s")
      .gte("started_at", since)
      .eq("status", "completed"),
    supabase
      .from("control_check_snapshots")
      .select("hc_slug,status,checked_at")
      .gte("checked_at", since),
  ])

  const jobRuns = runs ?? []

  // One bar per day, oldest to newest, across every job's completed runs that day.
  const byDay = new Map<string, { total: number; success: number }>()
  for (const r of jobRuns) {
    const day = r.started_at.slice(0, 10)
    const bucket = byDay.get(day) ?? { total: 0, success: 0 }
    bucket.total += 1
    if (r.conclusion === "success") bucket.success += 1
    byDay.set(day, bucket)
  }
  const dailySuccess = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, total: v.total, success: v.success }))

  // One bar per job, labelled from the shared CONTROL_JOBS list rather than the bare id.
  const byJob = new Map<string, { total: number; success: number }>()
  for (const r of jobRuns) {
    const bucket = byJob.get(r.job_id) ?? { total: 0, success: 0 }
    bucket.total += 1
    if (r.conclusion === "success") bucket.success += 1
    byJob.set(r.job_id, bucket)
  }
  const jobLabelById = new Map(CONTROL_JOBS.map((j) => [j.id, j.label]))
  const perJobSuccess = [...byJob.entries()]
    .filter(([, v]) => v.total > 0)
    .map(([jobId, v]) => ({ jobId, label: jobLabelById.get(jobId) ?? jobId, total: v.total, success: v.success }))
    .sort((a, b) => b.total - a.total)

  const statusBreakdown = { up: 0, grace: 0, down: 0, paused: 0 }
  for (const s of snapshots ?? []) {
    if (s.status === "up") statusBreakdown.up += 1
    else if (s.status === "grace") statusBreakdown.grace += 1
    else if (s.status === "down") statusBreakdown.down += 1
    else statusBreakdown.paused += 1
  }

  // Analytics-page-only aggregates below. jobLabelById already exists above for perJobSuccess.

  // One row per hc_slug, worst status per day - the status-page-style uptime grid.
  const slugLabel = new Map<string, string>()
  for (const j of CONTROL_JOBS) if (j.hcSlug) slugLabel.set(j.hcSlug.toLowerCase(), j.label)
  const bySlugDay = new Map<string, Map<string, string>>()
  for (const s of snapshots ?? []) {
    const slug = s.hc_slug.toLowerCase()
    const day = s.checked_at.slice(0, 10)
    const days = bySlugDay.get(slug) ?? new Map<string, string>()
    days.set(day, worseStatus(days.get(day) ?? s.status, s.status))
    bySlugDay.set(slug, days)
  }
  const uptimeGrid = [...bySlugDay.entries()]
    .map(([slug, days]) => ({
      slug,
      label: slugLabel.get(slug) ?? titleiseSlug(slug),
      days: [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, status]) => ({ date, status })),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  // Average run duration per day, across every job that reported one that day.
  const durationByDay = new Map<string, { total: number; count: number }>()
  for (const r of jobRuns) {
    if (r.duration_s == null) continue
    const day = r.started_at.slice(0, 10)
    const bucket = durationByDay.get(day) ?? { total: 0, count: 0 }
    bucket.total += r.duration_s
    bucket.count += 1
    durationByDay.set(day, bucket)
  }
  const durationTrend = [...durationByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, avgDurationS: Math.round(v.total / v.count) }))

  // Volume + success rate grouped by repo rather than by individual job.
  const jobById = new Map(CONTROL_JOBS.map((j) => [j.id, j]))
  const byRepo = new Map<string, { repoLabel: string; total: number; success: number }>()
  for (const r of jobRuns) {
    const job = jobById.get(r.job_id)
    if (!job) continue
    const bucket = byRepo.get(job.repo) ?? { repoLabel: job.repoLabel, total: 0, success: 0 }
    bucket.total += 1
    if (r.conclusion === "success") bucket.success += 1
    byRepo.set(job.repo, bucket)
  }
  const repoBreakdown = [...byRepo.entries()]
    .map(([repo, v]) => ({ repo, repoLabel: v.repoLabel, total: v.total, success: v.success }))
    .sort((a, b) => b.total - a.total)

  // repo -> job -> conclusion, shaped for the Sankey chart. Keyed internally by repo id / job id /
  // conclusion string (all unique), only converted to display labels at the very end - two
  // different jobs can share a display label (e.g. repo-ops and mirror-ops both have a "Deploy
  // worker" job), so using labels as node keys would wrongly merge them into one node.
  const repoIds = [...new Set(jobRuns.map((r) => jobById.get(r.job_id)?.repo).filter(Boolean) as string[])]
  const jobIds = [...new Set(jobRuns.map((r) => r.job_id))]
  const conclusions = [...new Set(jobRuns.map((r) => r.conclusion ?? "unknown"))]
  const nodeKeys = [...repoIds, ...jobIds, ...conclusions]
  const nodeIndex = new Map(nodeKeys.map((k, i) => [k, i]))
  const repoLabelById = new Map(CONTROL_JOBS.map((j) => [j.repo, j.repoLabel]))
  const nodeNames = nodeKeys.map((k) => repoLabelById.get(k) ?? jobLabelById.get(k) ?? k)
  const repoJobCounts = new Map<string, number>()
  const jobConclusionCounts = new Map<string, number>()
  for (const r of jobRuns) {
    const job = jobById.get(r.job_id)
    if (!job) continue
    const conclusion = r.conclusion ?? "unknown"
    const rjKey = JSON.stringify([job.repo, r.job_id])
    repoJobCounts.set(rjKey, (repoJobCounts.get(rjKey) ?? 0) + 1)
    const jcKey = JSON.stringify([r.job_id, conclusion])
    jobConclusionCounts.set(jcKey, (jobConclusionCounts.get(jcKey) ?? 0) + 1)
  }
  const jobOutcomeFlow: SankeyChartData = {
    nodes: nodeNames.map((name) => ({ name })),
    links: [
      ...[...repoJobCounts.entries()].map(([key, value]) => {
        const [repoId, jobId] = JSON.parse(key) as [string, string]
        return { source: nodeIndex.get(repoId)!, target: nodeIndex.get(jobId)!, value }
      }),
      ...[...jobConclusionCounts.entries()].map(([key, value]) => {
        const [jobId, conclusion] = JSON.parse(key) as [string, string]
        return { source: nodeIndex.get(jobId)!, target: nodeIndex.get(conclusion)!, value }
      }),
    ],
  }

  const body: ControlHistoryBody = {
    dailySuccess, perJobSuccess, statusBreakdown, uptimeGrid, durationTrend, repoBreakdown, jobOutcomeFlow,
  }
  cache = { key: since, at: Date.now(), body }
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } })
}
