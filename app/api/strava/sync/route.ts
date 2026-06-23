// On-demand Strava sync (POST) and disconnect (DELETE) for the analytics page. Both are auth-guarded and
// uncached. Sync refreshes my recent activities; disconnect forgets my tokens so nothing can be pulled
// until I reconnect. Neither ever touches anything but my Strava data.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { syncStravaActivities, stravaConnected, disconnectStrava } from "@/lib/strava"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "unauthorised" }, { status: 401 })
  if (!(await stravaConnected())) return NextResponse.json({ error: "not_connected" }, { status: 400 })

  const synced = await syncStravaActivities()
  if (synced < 0) return NextResponse.json({ error: "strava_unreachable" }, { status: 502 })
  return NextResponse.json({ ok: true, synced }, { headers: { "Cache-Control": "no-store" } })
}

export async function DELETE() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "unauthorised" }, { status: 401 })
  await disconnectStrava()
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
