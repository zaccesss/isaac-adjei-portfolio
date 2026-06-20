import { supabase } from "@/lib/supabase"
import ResourcesClient from "./ResourcesClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function ResourcesPage() {
  const [{ data: resources }, { data: modules }] = await Promise.all([
    supabase.from("uni_resources").select("*, uni_modules(code, color)").order("created_at", { ascending: false }),
    supabase.from("uni_modules").select("id, code, name, color").eq("active", true).order("semester"),
  ])
  return <ResourcesClient resources={resources ?? []} modules={modules ?? []} />
}
