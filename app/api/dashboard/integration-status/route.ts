import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stravaConnected } from "@/lib/strava"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  return NextResponse.json({
    spotify: Boolean(process.env.SPOTIFY_REFRESH_TOKEN && process.env.SPOTIFY_CLIENT_ID),
    wakatime: Boolean(process.env.WAKATIME_API_KEY),
    linearCareers: Boolean(process.env.LINEAR_API_KEY && process.env.LINEAR_TEAM_ID),
    linearUniversity: Boolean(process.env.LINEAR_API_KEY && process.env.LINEAR_UNI_TEAM_ID),
    strava: await stravaConnected(),
  }, { headers: { "Cache-Control": "no-store" } })
}
