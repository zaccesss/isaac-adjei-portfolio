// Strava redirects back here with a one-time code after I authorise. I exchange it for tokens (stored in
// the service-role config table, never the repo), pull in my recent activities, then send me to the
// analytics page with a status flag. Auth-guarded so only my own session can complete the connection.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { exchangeStravaCode, syncStravaActivities } from "@/lib/strava"

export const dynamic = "force-dynamic"

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://isaacadjei.me"
const ANALYTICS = `${SITE}/dashboard/health/analytics`

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.redirect(`${SITE}/dashboard`)

  const params = new URL(request.url).searchParams
  if (params.get("error") || !params.get("code")) {
    return NextResponse.redirect(`${ANALYTICS}?strava=denied`)
  }

  const ok = await exchangeStravaCode(params.get("code") as string)
  if (!ok) return NextResponse.redirect(`${ANALYTICS}?strava=error`)

  await syncStravaActivities()
  return NextResponse.redirect(`${ANALYTICS}?strava=connected`)
}
