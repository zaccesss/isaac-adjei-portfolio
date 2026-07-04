// Currently-playing Spotify status. The data logic lives in lib/live-status (getSpotify), which
// caches the access token in-memory and hits the Spotify API directly - it no longer caches the
// now-playing result in Redis, because the CDN cache below is the dedup layer instead.
import { NextResponse } from "next/server"
import { getSpotify } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  // 20s edge cache against the clients' 15s poll: the TTL sits ABOVE the poll interval, so even a
  // lone viewer's polls mostly hit the shared edge copy (~1 origin call per ~30s per region). The
  // old 4s TTL under a 5s poll meant every single poll was a cache miss that invoked the function
  // and hit Spotify - that alone was most of our Vercel Fluid CPU usage.
  return NextResponse.json(await getSpotify(), { headers: cdnCache(20) })
}
