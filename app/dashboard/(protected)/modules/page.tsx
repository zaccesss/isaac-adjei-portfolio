import { supabase } from "@/lib/supabase"
import { isPinVerified } from "@/lib/pin"
import ModulesWrapper from "./ModulesWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function ModulesPage() {
  // I check the signed PIN cookie server-side so marks data never reaches the browser unauthenticated
  const pinVerified = await isPinVerified()

  const modules = pinVerified
    ? (await supabase
        .from("modules")
        .select("*, assessments(*)")
        .order("year")
        .order("semester")
        .order("code")
      ).data ?? []
    : []

  return <ModulesWrapper pinVerified={pinVerified} modules={modules} />
}
