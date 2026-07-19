import { supabase } from "@/lib/supabase"
import StreaksClient from "./StreaksClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Streaks", robots: "noindex, nofollow" }

export default async function StreaksPage() {
  const today = new Date().toISOString().split("T")[0]
  const ninetyDaysAgo = new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [{ data: streaks }, { data: logs }] = await Promise.all([
    supabase.from("streaks").select("*").eq("active", true).order("order_index"),
    supabase.from("streak_logs").select("*").gte("date", ninetyDaysAgo),
  ])

  return <StreaksClient streaks={streaks ?? []} logs={logs ?? []} today={today} />
}
