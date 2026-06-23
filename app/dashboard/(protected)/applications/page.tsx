import { supabase } from "@/lib/supabase"
import ApplicationsClient from "./ApplicationsClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function ApplicationsPage() {
  // The table holds thousands of scraped listings alongside my real applications. PostgREST caps a single
  // select at 1000 rows, so a plain select only ever returned the newest 1000 - dominated by scraped
  // listings - which both evicted my own older applications and made the tracker total disagree with the
  // analytics page (which already pages through everything). I page through every row in 1000-row batches
  // so the tracker shows the complete set and its totals match analytics. The client renders the rows in
  // windows (infinite scroll) so even tens of thousands of scraped roles never freeze the page.
  const q = () =>
    supabase.from("applications").select("*").order("created_at", { ascending: false })
  const first = await q().range(0, 999)
  const data = first.data ?? []
  if (first.data && first.data.length === 1000) {
    for (let from = 1000; ; from += 1000) {
      const { data: page } = await q().range(from, from + 999)
      if (!page || page.length === 0) break
      data.push(...page)
      if (page.length < 1000) break
    }
  }

  return <ApplicationsClient applications={data} />
}
