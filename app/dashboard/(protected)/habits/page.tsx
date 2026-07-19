import { supabase } from "@/lib/supabase"
import HabitsClient from "./HabitsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Habits", robots: "noindex, nofollow" }

export default async function HabitsPage() {
  const today = new Date().toISOString().split("T")[0]
  const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from("habits").select("*").eq("active", true).order("created_at"),
    supabase.from("habit_logs").select("*").gte("date", thirtyDaysAgo),
  ])

  return <HabitsClient habits={habits ?? []} logs={logs ?? []} today={today} />
}
