// Currently-playing Spotify status. The data logic lives in lib/live-status (getSpotify,
// which caches the access token + the /me/player result in Redis) so the SSE stream reads
// it in-process. This route exposes the same data for the client's initial/direct fetch.
import { NextResponse } from "next/server"
import { getSpotify } from "@/lib/live-status"

export async function GET() {
  return NextResponse.json(await getSpotify(), { headers: { "Cache-Control": "no-store" } })
}
