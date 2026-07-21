// Currently-playing Spotify status. The data logic lives in lib/live-status (getSpotify), which
// caches the access token in-memory and hits the Spotify API directly - it no longer caches the
// now-playing result in Redis, because the CDN cache below is the dedup layer instead.
import { NextResponse } from "next/server"
import { getSpotify } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  // 10s edge cache, shared by every viewer regardless of which page polls it (/now and
  // /consumed/music both hit this route): at most one real Spotify/Vercel call per 10s per edge
  // region, no matter how many people are polling faster than that. The old 4s TTL under a 5s
  // poll meant every single poll was a cache miss that invoked the function and hit Spotify - that
  // alone was most of our Vercel Fluid CPU usage. 10s keeps the same protection at a still-tiny
  // absolute call volume while feeling noticeably more current than the old 20s.
  return NextResponse.json(await getSpotify(), { headers: cdnCache(10) })
}
