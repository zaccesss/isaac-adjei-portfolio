// I read last-run timestamps from the config table so the Ops page can show when each digest
// last sent and each sync last ran and whether it succeeded. One query for every key to keep the
// round-trip count low.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

type Record_ = { at: string; status: "success" | "failure" }

const KEYS = [
  "last_weekly_digest",
  "last_discord_digest",
  "last_linear_app_sync",
  "last_linear_uni_sync",
  "last_strava_sync",
] as const

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { data } = await supabase.from("config").select("key, value").in("key", KEYS)
  const byKey = new Map(data?.map((r) => [r.key, r.value as { sentAt?: string; at?: string; status: "success" | "failure" }]))

  const read = (key: (typeof KEYS)[number]): Record_ | null => {
    const v = byKey.get(key)
    if (!v) return null
    return { at: v.sentAt ?? v.at ?? "", status: v.status }
  }

  return NextResponse.json(
    {
      weekly: read("last_weekly_digest"),
      discord: read("last_discord_digest"),
      linearApps: read("last_linear_app_sync"),
      linearDeadlines: read("last_linear_uni_sync"),
      strava: read("last_strava_sync"),
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
