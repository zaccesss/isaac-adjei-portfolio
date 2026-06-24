// Public uptime endpoint for Better Stack (or any monitor). Returns 200 when the app can reach
// Supabase and 503 when it cannot, so an outage is caught within a minute. No auth - monitors hit it
// anonymously - and it exposes nothing sensitive, just a status string and a db-reachable boolean.
// Deliberately not rate-limited: uptime monitors poll it on a fixed schedule and a 429 would read as
// "down". The DB probe is a head-only count, so it is cheap enough to leave open.
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  let dbOk = false
  try {
    // Cheapest possible round-trip - a head-only exact count, returns no rows.
    const { error } = await supabase.from("config").select("*", { count: "exact", head: true })
    dbOk = !error
  } catch {
    dbOk = false
  }

  return NextResponse.json(
    { status: dbOk ? "ok" : "degraded", db: dbOk, time: new Date().toISOString() },
    { status: dbOk ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  )
}
