// Daily cron that syncs GitHub contribution history into github_contributions_days/_years.
// Authenticated by CRON_SECRET so it cannot be triggered by arbitrary requests. The first ever run
// (an empty table) backfills every year since FIRST_YEAR; every run after that just refreshes the
// current year, since a past year's contribution history never changes once it has ended.
import { NextRequest, NextResponse } from "next/server"
import { secretEquals } from "@/lib/secure-compare"
import { syncGithubContributions } from "@/lib/github-contributions"
import { pingHealthcheck } from "@/lib/healthcheck-ping"
import { isLondonTime } from "@/lib/london-time"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || !secretEquals(req.headers.get("authorization"), `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }
  // Two crons (a GMT and a BST branch) hit this route; act only at 05:00 UK.
  if (!isLondonTime(5)) {
    return NextResponse.json({ skipped: "not 05:00 UK" }, { headers: { "Cache-Control": "no-store" } })
  }
  const synced = await syncGithubContributions()
  // Not "github-contributions-sync" - isaac-adjei-automations pings that exact slug every 3 hours
  // for its own (different) top-up job and Healthchecks checks are named globally, not scoped
  // per repo, so two jobs sharing a slug would be indistinguishable to the Linear label lookup.
  await pingHealthcheck("github-contributions-daily-sync", synced >= 0 ? "success" : "fail")
  return NextResponse.json({ ok: synced >= 0, yearsSynced: synced }, { headers: { "Cache-Control": "no-store" } })
}
