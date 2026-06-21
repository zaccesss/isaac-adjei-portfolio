// Currently-playing Spotify status. The data logic lives in lib/live-status (getSpotify), which
// caches the access token in-memory and hits the Spotify API directly - it no longer caches the
// now-playing result in Redis, because the CDN cache below is the dedup layer instead.
import { NextResponse } from "next/server"
import { getSpotify } from "@/lib/live-status"

export async function GET() {
  return NextResponse.json(await getSpotify(), {
    headers: {
      // 4s edge cache = near-realtime track changes while collapsing however many viewers poll
      // into roughly one Spotify call every 4s per region. The browser always revalidates against
      // the shared edge cache (max-age=0). This CDN cache replaces the old Redis now-playing cache.
      "Cache-Control": "public, max-age=0, s-maxage=4, stale-while-revalidate=8",
    },
  })
}
