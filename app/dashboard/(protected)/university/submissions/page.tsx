import { supabase } from "@/lib/supabase"
import SubmissionsClient from "./SubmissionsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Submissions", robots: "noindex, nofollow" }

export default async function SubmissionsPage() {
  const [{ data: submissions }, { data: modules }, { data: deadlines }] = await Promise.all([
    supabase.from("uni_submissions").select("*, uni_modules(code, color)").order("submitted_at", { ascending: false }),
    supabase.from("uni_modules").select("id, code, name, color").eq("active", true).order("semester"),
    supabase.from("uni_deadlines").select("id, title, module_id").eq("status", "not_started").order("due_date"),
  ])
  return <SubmissionsClient submissions={submissions ?? []} modules={modules ?? []} deadlines={deadlines ?? []} />
}
