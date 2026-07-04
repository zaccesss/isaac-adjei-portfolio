import { supabase } from "@/lib/supabase"
import RemindersClient, { type Reminder } from "./RemindersClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Reminders", robots: "noindex, nofollow" }

export default async function RemindersPage() {
  // Soonest first so the next thing coming up sits at the top.
  const { data } = await supabase
    .from("reminders")
    .select("id,kind,title,location,notes,event_at,lead_minutes,sent_leads,channels,email,phone,reminded_at,active")
    .order("event_at", { ascending: true })

  return <RemindersClient reminders={(data ?? []) as Reminder[]} />
}
