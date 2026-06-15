import { supabase } from "@/lib/supabase"
import NotesWrapper from "./NotesWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function NotesPage() {
  const [notesResult, configResult] = await Promise.all([
    supabase.from("notes").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false }),
    supabase.from("config").select("value").eq("key", "now_status").single(),
  ])

  const notes = notesResult.data ?? []
  const nowStatus = (configResult.data?.value as Record<string, string> | null) ?? {}

  return <NotesWrapper notes={notes} nowStatus={nowStatus} />
}
