// Currently-playing Spotify status. The data logic lives in lib/live-status (getSpotify), which
// caches the access token in-memory and hits the Spotify API directly - it no longer caches the
// now-playing result in Redis, because the CDN cache below is the dedup layer instead.
import { NextResponse } from "next/server"
import { getSpotify } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  // 4s edge cache = near-realtime track changes while collapsing however many viewers poll into
  // roughly one Spotify call every 4s per region. This CDN cache replaces the old Redis now cache.
  return NextResponse.json(await getSpotify(), { headers: cdnCache(4) })
}
