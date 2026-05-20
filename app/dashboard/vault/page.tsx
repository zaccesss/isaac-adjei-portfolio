import { supabase } from "@/lib/supabase"
import VaultClient from "./VaultClient"

export const dynamic = "force-dynamic"

export default async function VaultPage() {
  const { data: entries } = await supabase
    .from("vault")
    .select("*")
    .order("name")

  return <VaultClient entries={entries ?? []} />
}
