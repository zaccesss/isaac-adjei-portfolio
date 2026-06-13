import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { sendWeeklyDigest } from "@/lib/send-weekly-digest"
import { supabase } from "@/lib/supabase"

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const result = await sendWeeklyDigest()

  void supabase.from("config").upsert(
    { key: "last_weekly_digest", value: { sentAt: new Date().toISOString(), status: result.ok ? "success" : "failure" } },
    { onConflict: "key" }
  )

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
