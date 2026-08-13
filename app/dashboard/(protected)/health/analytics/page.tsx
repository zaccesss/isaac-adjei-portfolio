import { supabase } from "@/lib/supabase"
import { stravaConnected } from "@/lib/strava"
import type { StravaActivity } from "@/lib/strava"
import StravaAnalyticsClient from "./StravaAnalyticsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Activity Analytics", robots: "noindex, nofollow" }

export default async function HealthAnalyticsPage() {
  // All charts render from stored rows so the page never calls Strava on load - I sync on demand. The
  // query degrades to an empty list if nothing is synced yet and the client shows a connect/sync state.
  const [{ data: activities }, connected] = await Promise.all([
    supabase.from("strava_activities").select("*").order("start_date", { ascending: false }),
    stravaConnected(),
  ])

  return <StravaAnalyticsClient activities={(activities ?? []) as StravaActivity[]} connected={connected} />
}
