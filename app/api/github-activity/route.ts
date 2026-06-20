// Most recent GitHub PushEvent, cached 5 min in Redis. Data logic lives in lib/live-status
// (getGithubActivity) so the SSE stream can read it in-process. relativeTime is recomputed
// on every read so "2m ago" stays accurate even while the push data is cached.
import { NextResponse } from "next/server"
import { getGithubActivity } from "@/lib/live-status"

export async function GET() {
  return NextResponse.json(await getGithubActivity(), { headers: { "Cache-Control": "no-store" } })
}
