import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import DiaryWrapper from "./DiaryWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function DiaryPage() {
  const cookieStore = await cookies()
  const pinVerified = cookieStore.get("dashboard_pin_verified")?.value === "1"

  const entries = pinVerified
    ? (await supabase.from("diary").select("*").order("created_at", { ascending: false })).data ?? []
    : []

  return <DiaryWrapper pinVerified={pinVerified} entries={entries} />
}
