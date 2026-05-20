import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import VaultWrapper from "./VaultWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function VaultPage() {
  const cookieStore = await cookies()
  const pinVerified = cookieStore.get("dashboard_pin_verified")?.value === "1"

  const entries = pinVerified
    ? (await supabase.from("vault").select("*").order("name")).data ?? []
    : []

  return <VaultWrapper pinVerified={pinVerified} entries={entries} />
}
