// Cron-facing endpoint that fires the Discord digest. Authentication is a shared
// CRON_SECRET header so this can be called by Vercel Cron without a user session.
// The actual message-building logic lives in lib/send-discord-digest.ts so it can
// also be triggered manually from the dashboard without going through HTTP.
import { NextRequest, NextResponse } from "next/server"
import { secretEquals } from "@/lib/secure-compare"
import { sendDiscordDigest } from "@/lib/send-discord-digest"
import { pingHealthcheck } from "@/lib/healthcheck-ping"
import { isLondonTime, claimCronRun } from "@/lib/london-time"
import { supabase } from "@/lib/supabase"

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

  // Two crons (a GMT and a BST branch) hit this route; act only at 00:30 UK so the rolling-24h digest
  // reads as "yesterday in full" and only once even if a run is delayed into the window.
  if (!isLondonTime(0)) {
    return NextResponse.json({ skipped: "not 00:30 UK" }, { headers: { "Cache-Control": "no-store" } })
  }
  if (!(await claimCronRun("discord-digest"))) {
    return NextResponse.json({ skipped: "already ran today" }, { headers: { "Cache-Control": "no-store" } })
  }

  const result = await sendDiscordDigest()
  await pingHealthcheck("discord-digest", result.ok ? "success" : "fail")
  // The manual "Send now" trigger already wrote this key on a manual send; the real scheduled path
  // needs to write it too or the dashboard only ever reflects a manual click and never the cron
  // that actually sends this every day.
  void supabase.from("config").upsert(
    { key: "last_discord_digest", value: { sentAt: new Date().toISOString(), status: result.ok ? "success" : "failure" } },
    { onConflict: "key" }
  )
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
