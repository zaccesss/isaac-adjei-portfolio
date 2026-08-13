// I start the Strava OAuth flow here: this redirects me to Strava to authorise read access to my
// activities. It is behind the dashboard auth guard so only I can begin a connection and it guards on
// the Strava keys so a missing key returns to the page with a clean message instead of a broken redirect.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stravaConfigured } from "@/lib/strava"

export const dynamic = "force-dynamic"

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://isaacadjei.me"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.redirect(`${SITE}/dashboard`)
  if (!stravaConfigured()) return NextResponse.redirect(`${SITE}/dashboard/health/analytics?strava=not_configured`)

  const url = new URL("https://www.strava.com/oauth/authorize")
  url.searchParams.set("client_id", process.env.STRAVA_CLIENT_ID as string)
  url.searchParams.set("redirect_uri", `${SITE}/api/strava/callback`)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("approval_prompt", "auto")
  url.searchParams.set("scope", "activity:read_all")
  return NextResponse.redirect(url.toString())
}
