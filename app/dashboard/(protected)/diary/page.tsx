// Diary entries never reach the browser unless the PIN cookie is present.
// The PIN is separate from the GitHub OAuth session - it protects especially private content
// within the already-authenticated dashboard.
import { supabase } from "@/lib/supabase"
import { isPinVerified } from "@/lib/pin"
import DiaryWrapper from "./DiaryWrapper"

export const dynamic = "force-dynamic"
export const metadata = { title: "Diary", robots: "noindex, nofollow" }

export default async function DiaryPage() {
  const pinVerified = await isPinVerified()

  const entries = pinVerified
    ? (await supabase.from("diary").select("*").order("created_at", { ascending: false })).data ?? []
    : []

  return <DiaryWrapper pinVerified={pinVerified} entries={entries} />
}
