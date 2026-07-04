// PS5 presence written to Redis by a Cloudflare Worker that polls the PSN API every 2 minutes.
// Data logic lives in lib/live-status (getPs5); the combined /api/live-status snapshot reads it
// via a shared mget. This route keeps its IP rate limit because it is also hit directly by the
// lab page's widget pollers.
import { NextResponse } from "next/server"
import { publicApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"
import { getPs5 } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET(req: Request) {
  if (!(await checkRateLimit(publicApiLimiter, getIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  // 45s edge cache against the gaming panel's 30s poll (TTL above the poll interval so polls
  // share the edge copy); the PSN worker only writes every 2min, so this loses no freshness.
  return NextResponse.json(await getPs5(), { headers: cdnCache(45) })
}
