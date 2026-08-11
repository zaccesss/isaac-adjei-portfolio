// Exposes CONTROL_JOBS/CONTROL_REPO_ORDER as JSON so isaac-adjei-automations' control-status-sync
// job (fired by cron-ops every 15 min) reads the same single source of truth this dashboard uses,
// rather than keeping its own duplicate copy that could drift when a job is added here. Authenticated
// by CRON_SECRET like every other cron-facing route - this is called on a fixed interval, not a
// scheduled UK time, so there is no isLondonTime gate.
import { NextRequest, NextResponse } from "next/server"
import { secretEquals } from "@/lib/secure-compare"
import { CONTROL_JOBS, CONTROL_REPO_ORDER } from "@/lib/control-jobs"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || !secretEquals(req.headers.get("authorization"), `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }
  return NextResponse.json(
    { jobs: CONTROL_JOBS, repoOrder: CONTROL_REPO_ORDER },
    { headers: { "Cache-Control": "no-store" } },
  )
}
