// Daily cron that syncs my recent Strava activities into the dashboard and auto-ticks the Fitness habit
// for each active day. Authenticated by CRON_SECRET so it cannot be triggered by arbitrary requests, and
// it guards on the Strava keys so a missing key returns a clean "not configured" state instead of failing.
import { NextRequest, NextResponse } from "next/server"
import { syncStravaActivities, stravaConfigured } from "@/lib/strava"
import { pingHealthcheck } from "@/lib/healthcheck-ping"
import { isLondonTime } from "@/lib/london-time"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }
  // Two crons (a GMT and a BST branch) hit this route; act only at 04:00 UK. No idempotency claim is
  // needed - the sync upserts by strava_id, so a repeat run just re-writes the same rows harmlessly.
  if (!isLondonTime(4)) {
    return NextResponse.json({ skipped: "not 04:00 UK" }, { headers: { "Cache-Control": "no-store" } })
  }
  if (!stravaConfigured()) {
    return NextResponse.json({ ok: false, error: "strava_not_configured" }, { headers: { "Cache-Control": "no-store" } })
  }
  const synced = await syncStravaActivities()
  await pingHealthcheck("strava-sync", synced >= 0 ? "success" : "fail")
  return NextResponse.json({ ok: synced >= 0, synced }, { headers: { "Cache-Control": "no-store" } })
}
