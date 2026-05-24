import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import ModulesWrapper from "./ModulesWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function ModulesPage() {
  // I check the PIN cookie server-side so marks data never reaches the browser unauthenticated
  const cookieStore = await cookies()
  const pinVerified = cookieStore.get("dashboard_pin_verified")?.value === "1"

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
