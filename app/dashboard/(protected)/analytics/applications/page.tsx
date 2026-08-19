import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ApplicationsAnalytics from "../../applications/ApplicationsAnalytics"

export const dynamic = "force-dynamic"
export const metadata = { title: "Applications Analytics", robots: "noindex, nofollow" }

export default async function ApplicationsAnalyticsPage() {
  // I fetch every row, scraped included - the headline "Total" figure on this page is meant to
  // show everything I have ever tracked, scraped listings included. ApplicationsAnalytics itself
  // filters status <> "scraped" out before computing any actual chart (funnel, Pareto, by-location,
  // monthly totals, the map, every StatCard below the header) - only the raw header count includes
  // scraped rows, nothing analytical does.
  //
  // PostgREST caps a single select at 1000 rows. I page through in 1000-row batches and combine
  // them so a growing table (thousands of scraped roles) is never silently truncated, fetched in
  // parallel rather than one page at a time.
  const cols = "id, company, role, type, status, applied_date, location, category, created_at, url"
  const q = () =>
    supabase.from("applications").select(cols).eq("archived", false).order("created_at", { ascending: false })

  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("archived", false)
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / 1000))
  const pages = await Promise.all(
    Array.from({ length: totalPages }, (_, i) => q().range(i * 1000, i * 1000 + 999))
  )
  const data = pages.flatMap((p) => p.data ?? [])

  // Geocode cache lookup for the Applications map - only ever reads what geocode-locations.mjs
  // (isaac-adjei-automations) has already resolved, never calls a geocoder from the website itself.
  const { data: geocodes } = await supabase.from("location_geocodes").select("location, lat, lng")

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Back to analytics"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Analytics
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium">Applications</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">all types combined</span>
      </div>
      <div className="flex-1 overflow-auto px-4 pb-4">
        <ApplicationsAnalytics apps={data} geocodes={geocodes ?? []} mapApiKey={process.env.MAPTILER_API_KEY ?? ""} />
      </div>
    </div>
  )
}
