import { supabase } from "@/lib/supabase"
import BodyMetricsClient from "./BodyMetricsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Body Metrics", robots: "noindex, nofollow" }

export default async function BodyMetricsPage() {
  const { data: metrics } = await supabase
    .from("body_metrics")
    .select("*")
    .order("date", { ascending: false })

  return <BodyMetricsClient metrics={metrics ?? []} />
}
