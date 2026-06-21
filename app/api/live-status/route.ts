// Combined live-status snapshot for the public status cards: device presence + GitHub + Discord
// (everything except Spotify, which polls its own faster /api/spotify route). One CDN-cached GET
// replaces the old per-viewer SSE stream - the edge cache means many open tabs in a region share
// a single origin response instead of each holding a Redis-polling connection open. getLiveSnapshot
// reads every presence key in a single Redis mget, so each cache miss costs one Redis command.
import { NextResponse } from "next/server"
import { getLiveSnapshot } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  const snapshot = await getLiveSnapshot()
  // Edge-cache 15s (device presence changes on the order of a minute); the browser always
  // revalidates to the shared edge copy, so origin + Redis load stays flat against viewer count.
  return NextResponse.json(snapshot, { headers: cdnCache(15) })
}
