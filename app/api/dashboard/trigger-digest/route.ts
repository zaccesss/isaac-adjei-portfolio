// Dashboard-triggered weekly digest - requires a live GitHub session rather than
// CRON_SECRET so only I can fire it manually. I upsert the result timestamp into
// the config table so the digest-status endpoint can reflect the last manual send.
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { sendWeeklyDigest } from "@/lib/send-weekly-digest"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/app/dashboard/actions"

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const result = await sendWeeklyDigest()
  void logActivity("workflow.digest", result.ok ? "sent" : "failed")

  void supabase.from("config").upsert(
    { key: "last_weekly_digest", value: { sentAt: new Date().toISOString(), status: result.ok ? "success" : "failure" } },
    { onConflict: "key" }
  )

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
