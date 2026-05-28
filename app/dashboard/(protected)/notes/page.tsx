import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import NotesWrapper from "./NotesWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function NotesPage() {
  const cookieStore = await cookies()
  const pinVerified = cookieStore.get("dashboard_pin_verified")?.value === "1"

  const [notesResult, configResult] = await Promise.all([
    pinVerified
      ? supabase.from("notes").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from("config").select("value").eq("key", "now_status").single(),
  ])

  const notes = notesResult.data ?? []
  const nowStatus = (configResult.data?.value as Record<string, string> | null) ?? {}

  return <NotesWrapper pinVerified={pinVerified} notes={notes} nowStatus={nowStatus} />
}
