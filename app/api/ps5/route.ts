// PS5 presence written to Redis by a Cloudflare Worker that polls the PSN API every 2 minutes.
// Data logic lives in lib/live-status (getPs5); the combined /api/live-status snapshot reads it
// via a shared mget. This route keeps its IP rate limit because it is also hit directly by the
// lab page's widget pollers.
import { NextResponse } from "next/server"
import { publicApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"
import { getPs5 } from "@/lib/live-status"

export async function GET(req: Request) {
  if (!(await checkRateLimit(publicApiLimiter, getIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  return NextResponse.json(await getPs5(), {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=30" },
  })
}
