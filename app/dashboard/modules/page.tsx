import { supabase } from "@/lib/supabase"
import ModulesClient from "./ModulesClient"

export const dynamic = "force-dynamic"

export default async function ModulesPage() {
  const { data: modules } = await supabase
    .from("modules")
    .select("*, assessments(*)")
    .order("year")
    .order("semester")
    .order("code")

  return <ModulesClient modules={modules ?? []} />
}
