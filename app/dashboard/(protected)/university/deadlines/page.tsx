import { supabase } from "@/lib/supabase"
import DeadlinesClient from "./DeadlinesClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function DeadlinesPage() {
  const [{ data: deadlines }, { data: modules }] = await Promise.all([
    supabase.from("uni_deadlines").select("*, uni_modules(id, code, name, color)").order("due_date"),
    supabase.from("uni_modules").select("id, code, name, color").eq("active", true).order("semester"),
  ])
  return <DeadlinesClient deadlines={deadlines ?? []} modules={modules ?? []} />
}
