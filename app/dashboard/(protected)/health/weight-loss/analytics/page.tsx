import { supabase } from "@/lib/supabase"
import WeightLossAnalyticsClient from "./WeightLossAnalyticsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Weight Loss Analytics", robots: "noindex, nofollow" }

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000)
}

export default async function WeightLossAnalyticsPage() {
  const ago = daysAgo(365)
  const since = ago.toISOString().slice(0, 10)
  const sinceIso = ago.toISOString()

  const [{ data: weights }, { data: nutrition }, { data: workouts }, { data: strava }] = await Promise.all([
    supabase.from("body_metrics").select("value,date").eq("metric", "weight_kg").gte("date", since).order("date", { ascending: true }),
    supabase.from("nutrition_logs").select("date,calories,protein_g,carbs_g,fat_g").gte("date", since).order("date", { ascending: true }),
    supabase.from("workout_logs").select("date,type,calories").gte("date", since).order("date", { ascending: true }),
    supabase.from("strava_activities").select("sport_type,calories,start_date").gte("start_date", sinceIso).order("start_date", { ascending: true }),
  ])

  return (
    <WeightLossAnalyticsClient
      weights={weights ?? []}
      nutrition={nutrition ?? []}
      workouts={workouts ?? []}
      strava={strava ?? []}
    />
  )
}
