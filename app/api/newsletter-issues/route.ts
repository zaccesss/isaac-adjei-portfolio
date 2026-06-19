// I serve newsletter issues to the client-side RecentIssues component.
// The actual fetching and caching logic lives in lib/newsletter.ts so the
// RSS feed route can call it directly without making an HTTP request to this route.

import { NextResponse } from "next/server"
import { publicApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"
import { fetchNewsletterIssues, type NewsletterIssue } from "@/lib/newsletter"

export type { NewsletterIssue }

export async function GET(req: Request) {
  if (!await checkRateLimit(publicApiLimiter, getIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  try {
    const issues = await fetchNewsletterIssues()
    return NextResponse.json(issues, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } })
  }
}
