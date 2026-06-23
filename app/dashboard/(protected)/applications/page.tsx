import { supabase } from "@/lib/supabase"
import ApplicationsClient from "./ApplicationsClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function ApplicationsPage() {
  // The table holds thousands of scraped listings alongside my real applications, and PostgREST caps a
  // single select at 1000 rows. Ordered newest-first, the scraper's recent rows were filling that whole
  // window and silently evicting my own older applications from the page. I load my real (non-scraped)
  // applications in their own query so they can never be dropped, then add the most recent scraped
  // listings, and merge them newest-first.
  const [{ data: mine }, { data: scraped }] = await Promise.all([
    supabase.from("applications").select("*").neq("status", "scraped").order("created_at", { ascending: false }),
    supabase.from("applications").select("*").eq("status", "scraped").order("created_at", { ascending: false }).limit(1000),
  ])
  const data = [...(mine ?? []), ...(scraped ?? [])].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  )

  return <ApplicationsClient applications={data} />
}
