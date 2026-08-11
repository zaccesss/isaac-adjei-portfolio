import { NextRequest, NextResponse } from "next/server"
import { secretEquals } from "@/lib/secure-compare"
import { sendWeeklyDigest } from "@/lib/send-weekly-digest"
import { pingHealthcheck } from "@/lib/healthcheck-ping"
import { isLondonTime, claimCronRun } from "@/lib/london-time"
import { supabase } from "@/lib/supabase"

// I verify the Vercel cron secret so this route cannot be triggered by arbitrary HTTP requests.
// The actual digest logic lives in lib/send-weekly-digest.ts so it can also be called directly
// from trigger-digest without going through this HTTP endpoint (which bypasses the gate below).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not set in environment" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (!secretEquals(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json(
      { error: "Unauthorised: invalid CRON_SECRET" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  // Two crons (a GMT and a BST branch) hit this route; act only at 00:30 UK on Monday so the digest
  // always covers the full previous Mon-Sun, and only once even if a run is delayed into the window.
  if (!isLondonTime(0, "Mon")) {
    return NextResponse.json({ skipped: "not 00:30 UK Monday" }, { headers: { "Cache-Control": "no-store" } })
  }
  if (!(await claimCronRun("weekly-digest"))) {
    return NextResponse.json({ skipped: "already ran today" }, { headers: { "Cache-Control": "no-store" } })
  }

  const result = await sendWeeklyDigest()
  await pingHealthcheck("weekly-digest", result.ok ? "success" : "fail")
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
