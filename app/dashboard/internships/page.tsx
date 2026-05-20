import { supabase } from "@/lib/supabase"
import InternshipsClient from "./InternshipsClient"

export const dynamic = "force-dynamic"

export default async function InternshipsPage() {
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false })

  return <InternshipsClient applications={applications ?? []} />
}
