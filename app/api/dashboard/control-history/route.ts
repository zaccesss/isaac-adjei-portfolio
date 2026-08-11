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

interface ControlHistoryBody {
  dailySuccess: { date: string; total: number; success: number }[]
  perJobSuccess: { jobId: string; label: string; total: number; success: number }[]
  statusBreakdown: { up: number; grace: number; down: number; paused: number }
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
      .select("job_id,conclusion,status,started_at")
      .gte("started_at", since)
      .eq("status", "completed"),
    supabase
      .from("control_check_snapshots")
      .select("status")
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

  const body: ControlHistoryBody = { dailySuccess, perJobSuccess, statusBreakdown }
  cache = { key: since, at: Date.now(), body }
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } })
}
