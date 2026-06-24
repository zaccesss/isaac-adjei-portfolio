import { supabase } from "@/lib/supabase"
import MedicationAnalyticsClient, { type Dose, type ReminderLite } from "./MedicationAnalyticsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Medication Analytics", robots: "noindex, nofollow" }

export default async function MedicationAnalyticsPage() {
  const [{ data: reminders }, { data: doses }] = await Promise.all([
    supabase.from("medication_reminders").select("id,active,label,name"),
    supabase
      .from("medication_doses")
      .select("id,reminder_id,label,name,channel,sent_at,status,taken_at")
      .order("sent_at", { ascending: false })
      .limit(2000),
  ])

  return <MedicationAnalyticsClient reminders={(reminders ?? []) as ReminderLite[]} doses={(doses ?? []) as Dose[]} />
}
