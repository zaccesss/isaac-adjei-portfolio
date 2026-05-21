import { supabase } from "@/lib/supabase"
import HealthClient from "./HealthClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function HealthPage() {
  const [{ data: sections }, { data: workouts }, { data: nutrition }] = await Promise.all([
    supabase.from("health_sections").select("*").eq("active", true).order("order_index"),
    supabase.from("health_workouts").select("*").order("order_index"),
    supabase.from("health_nutrition").select("*").order("order_index"),
  ])

  return (
    <HealthClient
      sections={sections ?? []}
      workouts={workouts ?? []}
      nutrition={nutrition ?? []}
    />
  )
}
