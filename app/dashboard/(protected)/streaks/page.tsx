import { supabase } from "@/lib/supabase"
import StreaksClient from "./StreaksClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function StreaksPage() {
  const today = new Date().toISOString().split("T")[0]
  const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [{ data: streaks }, { data: logs }] = await Promise.all([
    supabase.from("streaks").select("*").eq("active", true).order("order_index"),
    supabase.from("streak_logs").select("*").gte("date", thirtyDaysAgo),
  ])

  return <StreaksClient streaks={streaks ?? []} logs={logs ?? []} today={today} />
}
