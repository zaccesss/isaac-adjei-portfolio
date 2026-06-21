// Combined live-status snapshot for the public status cards: device presence + GitHub + Discord
// (everything except Spotify, which polls its own faster /api/spotify route). One CDN-cached GET
// replaces the old per-viewer SSE stream - the edge cache means many open tabs in a region share
// a single origin response instead of each holding a Redis-polling connection open. getLiveSnapshot
// reads every presence key in a single Redis mget, so each cache miss costs one Redis command.
import { NextResponse } from "next/server"
import { getLiveSnapshot } from "@/lib/live-status"

export async function GET() {
  const snapshot = await getLiveSnapshot()
  return NextResponse.json(snapshot, {
    headers: {
      // Vercel edge caches for 15s (s-maxage) and serves a stale copy for up to 30s more while it
      // refreshes (stale-while-revalidate); the browser always revalidates (max-age=0) so it hits
      // the shared edge cache rather than its own. Device presence changes on the order of a
      // minute, so 15s is near-live while keeping origin + Redis load flat against viewer count.
      "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=30",
    },
  })
}
