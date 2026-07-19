import { supabase } from "@/lib/supabase"
import StudyClient from "./StudyClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Study", robots: "noindex, nofollow" }

export default async function StudyPage() {
  const today = new Date().toISOString().split("T")[0]
  // eslint-disable-next-line react-hooks/purity
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const { data: sessions } = await supabase
    .from("study_sessions")
    .select("*")
    .gte("date", ninetyDaysAgo)
    .order("date", { ascending: false })

  return <StudyClient sessions={sessions ?? []} today={today} />
}
