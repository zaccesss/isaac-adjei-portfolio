import { supabase } from "@/lib/supabase"
import StudyClient from "./StudyClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Study", robots: "noindex, nofollow" }

export default async function StudyPage() {
  const today = new Date().toISOString().split("T")[0]
  // eslint-disable-next-line react-hooks/purity
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [{ data: sessions }, { data: modules }, { data: assessments }] = await Promise.all([
    supabase.from("study_sessions").select("*").gte("date", ninetyDaysAgo).order("date", { ascending: false }),
    supabase.from("modules").select("id, name, code"),
    supabase.from("assessments").select("module_id, weight_percent, mark_achieved, mark_max, is_pass_fail"),
  ])

  return <StudyClient sessions={sessions ?? []} today={today} modules={modules ?? []} assessments={assessments ?? []} />
}
