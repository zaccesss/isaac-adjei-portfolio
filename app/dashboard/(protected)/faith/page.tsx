import { supabase } from "@/lib/supabase"
import FaithClient from "./FaithClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function FaithPage() {
  const today = new Date().toISOString().split("T")[0]
  // eslint-disable-next-line react-hooks/purity
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const { data: entries } = await supabase
    .from("faith_entries")
    .select("*")
    .gte("date", ninetyDaysAgo)
    .order("date", { ascending: false })

  return <FaithClient entries={entries ?? []} today={today} />
}
