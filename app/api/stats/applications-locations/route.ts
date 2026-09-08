// Public-safe aggregate of application locations for /stats/applications - a plain count per
// city, joined against the already-cached location_geocodes table. Never selects company, status,
// role, applied_date or any other per-application column - count-only is the whole point, since
// even a category breakdown could narrow a single low-count city down to one identifiable
// application. Deliberately includes scraped rows, matching the dashboard's own convention that
// the map and its Total figure show every application ever tracked, not just ones I actually
// applied to - only the analytical charts (funnel, trends) filter scraped rows out.
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { publicApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"
import { cityLabel, mergeByLabel, isRemoteLocation } from "@/lib/location-labels"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  if (!await checkRateLimit(publicApiLimiter, getIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { count } = await supabase.from("applications").select("id", { count: "exact", head: true })
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 1000))
  const pages = await Promise.all(
    Array.from({ length: totalPages }, (_, i) =>
      supabase.from("applications").select("location").not("location", "is", null).range(i * 1000, i * 1000 + 999),
    ),
  )
  const locations = pages.flatMap((p) => (p.data as { location: string | null }[] | null) ?? [])

  const counts = new Map<string, number>()
  for (const { location } of locations) {
    if (!location) continue
    counts.set(location, (counts.get(location) ?? 0) + 1)
  }

  const { data: geocodes } = await supabase.from("location_geocodes").select("location, lat, lng, city, country_code")
  const geocodeByLocation = new Map((geocodes ?? []).map((g) => [g.location, g]))

  // The raw scraped location string is sometimes genuinely uninformative (a fab/site code, a job
  // board's own "N Locations" placeholder for a multi-site listing) rather than just inconsistently
  // formatted, so the display label comes from the geocode's own resolved city/country wherever
  // available, falling back to the raw string only for rows not yet geocoded with that data.
  // mergeByLabel then collapses multiple raw strings that resolved to the same city into one point.
  const rawPoints = Array.from(counts.entries())
    .map(([location, count]) => {
      const g = geocodeByLocation.get(location)
      if (!g || g.lat == null || g.lng == null) return null
      return { location: cityLabel(location, g), lat: g.lat, lng: g.lng, count }
    })
    .filter((p): p is { location: string; lat: number; lng: number; count: number } => p !== null)
  const points = mergeByLabel(rawPoints)

  // "Remote" carries real meaning even without a coordinate to plot - counted straight from the
  // raw text rather than through location_geocodes, since a remote-work role is never geocoded to
  // begin with. Returned separately so the map (which needs a real lat/lng for every point) never
  // sees it, while the count-only Top 10 cities charts can still show it as its own bucket.
  let remoteCount = 0
  for (const [location, count] of counts) {
    if (isRemoteLocation(location)) remoteCount += count
  }

  return NextResponse.json(
    { total, points, remoteCount },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
  )
}
