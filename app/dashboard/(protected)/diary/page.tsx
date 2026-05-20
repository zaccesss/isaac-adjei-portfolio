import { supabase } from "@/lib/supabase"
import DiaryClient from "./DiaryClient"

export const dynamic = "force-dynamic"

export default async function DiaryPage() {
  const { data: entries } = await supabase
    .from("diary")
    .select("*")
    .order("created_at", { ascending: false })

  return <DiaryClient entries={entries ?? []} />
}
