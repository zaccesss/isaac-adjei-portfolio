import { supabase } from "@/lib/supabase"
import UniNotesClient from "./UniNotesClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function UniNotesPage() {
  const [{ data: notes }, { data: modules }] = await Promise.all([
    supabase.from("uni_notes").select("*, uni_modules(code, color)").order("pinned", { ascending: false }).order("updated_at", { ascending: false }),
    supabase.from("uni_modules").select("id, code, name, color").eq("active", true).order("semester"),
  ])
  return <UniNotesClient notes={notes ?? []} modules={modules ?? []} />
}
