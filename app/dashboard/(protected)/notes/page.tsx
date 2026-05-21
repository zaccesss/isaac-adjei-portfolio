import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import NotesWrapper from "./NotesWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function NotesPage() {
  const cookieStore = await cookies()
  const pinVerified = cookieStore.get("dashboard_pin_verified")?.value === "1"

  const notes = pinVerified
    ? (await supabase.from("notes").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false })).data ?? []
    : []

  return <NotesWrapper pinVerified={pinVerified} notes={notes} />
}
