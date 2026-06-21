// Most recent GitHub PushEvent, cached 5 min in Redis. Data logic lives in lib/live-status
// (getGithubActivity); the combined /api/live-status snapshot reads it via a shared mget.
// relativeTime is recomputed on every read so "2m ago" stays accurate even while cached.
import { NextResponse } from "next/server"
import { getGithubActivity } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  return NextResponse.json(await getGithubActivity(), { headers: cdnCache(30) })
}
