import { supabase } from "@/lib/supabase"
import ApplicationsClient from "./ApplicationsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Applications", robots: "noindex, nofollow" }

export default async function ApplicationsPage() {
  // The table holds thousands of scraped listings alongside my real applications. PostgREST caps a single
  // select at 1000 rows, so a plain select only ever returned the newest 1000 - dominated by scraped
  // listings - which both evicted my own older applications and made the tracker total disagree with the
  // analytics page (which already pages through everything). I page through every row in 1000-row batches
  // so the tracker shows the complete set and its totals match analytics. The client renders the rows in
  // windows (page controls) so even tens of thousands of scraped roles never freeze the page.
  //
  // The batches are fetched in parallel rather than one at a time: at ~9,000 rows that is roughly 9
  // sequential round trips to Supabase (each with its own network latency) versus one count query plus
  // one parallel burst, which is the difference between a multi-second wait and a near-instant load.
  const q = () =>
    supabase.from("applications").select("*").order("created_at", { ascending: false })

  const { count } = await supabase.from("applications").select("id", { count: "exact", head: true })
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / 1000))
  const [pages, { data: geocodes }] = await Promise.all([
    Promise.all(Array.from({ length: totalPages }, (_, i) => q().range(i * 1000, i * 1000 + 999))),
    supabase.from("location_geocodes").select("location, lat, lng"),
  ])
  const data = pages.flatMap((p) => p.data ?? [])

  return <ApplicationsClient applications={data} geocodes={geocodes ?? []} />
}
