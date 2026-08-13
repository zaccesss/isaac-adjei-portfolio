// Dashboard-triggered Discord digest - mirrors trigger-digest but sends to Discord
// instead of email. I persist the result to the config table so ops-status can
// report both channels independently.
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { sendDiscordDigest } from "@/lib/send-discord-digest"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/app/dashboard/actions"

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const result = await sendDiscordDigest()
  void logActivity("workflow.discord", result.ok ? "sent" : "failed")

  await supabase.from("config").upsert(
    { key: "last_discord_digest", value: { sentAt: new Date().toISOString(), status: result.ok ? "success" : "failure" } },
    { onConflict: "key" }
  )

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
