import { supabase } from "@/lib/supabase"
import WeightLossClient, { type WeightGoal } from "./WeightLossClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Weight Loss", robots: "noindex, nofollow" }

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}

export default async function WeightLossPage() {
  const since30 = isoDaysAgo(30)

  const [{ data: goalRow }, { data: weights }, { data: nutrition }, { data: workouts }, { data: strava }] = await Promise.all([
    supabase.from("config").select("value").eq("key", "weight_goal").maybeSingle(),
    supabase.from("body_metrics").select("id,value,date").eq("metric", "weight_kg").order("date", { ascending: false }).limit(120),
    supabase.from("nutrition_logs").select("*").gte("date", since30).order("date", { ascending: false }),
    supabase.from("workout_logs").select("*").gte("date", since30).order("date", { ascending: false }),
    supabase
      .from("strava_activities")
      .select("name,sport_type,distance_m,moving_time_s,calories,start_date")
      .order("start_date", { ascending: false })
      .limit(10),
  ])

  return (
    <WeightLossClient
      goal={(goalRow?.value as WeightGoal | undefined) ?? null}
      weights={weights ?? []}
      nutrition={nutrition ?? []}
      workouts={workouts ?? []}
      strava={strava ?? []}
    />
  )
}
