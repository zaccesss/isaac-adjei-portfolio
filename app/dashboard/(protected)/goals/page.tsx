import { supabase } from "@/lib/supabase"
import GoalsClient from "./GoalsClient"

export const metadata = { title: "Goals" }

export const dynamic = "force-dynamic"

export default async function GoalsPage() {
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false })

  return <GoalsClient goals={goals ?? []} />
}
