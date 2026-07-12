// I fetch notes and the "now_status" config in parallel so the notes landing page loads in one round-trip.
// I separate the data fetch from the UI by delegating to NotesWrapper so the server component stays lean.
// Notes never reach the browser unless the signed PIN cookie is present - the lock on
// individual notes used to be a client-side overlay over content already in the payload.
import { supabase } from "@/lib/supabase"
import { isPinVerified } from "@/lib/pin"
import NotesWrapper from "./NotesWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function NotesPage() {
  const pinVerified = await isPinVerified()

  const [notesResult, configResult] = pinVerified
    ? await Promise.all([
        supabase.from("notes").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false }),
        supabase.from("config").select("value").eq("key", "now_status").single(),
      ])
    : [{ data: [] }, { data: null }]

  const notes = notesResult.data ?? []
  const nowStatus = (configResult.data?.value as Record<string, string> | null) ?? {}

  return <NotesWrapper pinVerified={pinVerified} notes={notes} nowStatus={nowStatus} />
}
