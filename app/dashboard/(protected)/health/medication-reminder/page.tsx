import { supabase } from "@/lib/supabase"
import MedicationReminderClient, { type MedicationReminder } from "./MedicationReminderClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Medication Reminders", robots: "noindex, nofollow" }

export default async function MedicationReminderPage() {
  const { data } = await supabase
    .from("medication_reminders")
    .select("id,label,name,dose,notes,times,start_date,end_date,channel,recipient,active")
    .order("label", { ascending: true })
    .order("name", { ascending: true })

  return <MedicationReminderClient reminders={(data ?? []) as MedicationReminder[]} />
}
