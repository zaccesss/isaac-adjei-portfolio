import { supabase } from "@/lib/supabase"
import ApplicationsClient from "./ApplicationsClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function ApplicationsPage() {
  const { data } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false })

  return <ApplicationsClient applications={data ?? []} />
}
