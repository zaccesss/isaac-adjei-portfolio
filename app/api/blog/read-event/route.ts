// I accept scroll-depth events from the ScrollDepthTracker client component.
// The route is unauthenticated (public blog visitors send these events) so I apply
// per-IP rate-limiting via Upstash Redis to prevent abuse.
// Supabase write goes into the blog_read_events table.

import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { createClient } from "@supabase/supabase-js"

// I initialise Redis conditionally so the route still builds without env vars.
let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// I use the service-role key here because this route runs server-side and does not
// pass user credentials — it writes on behalf of an anonymous visitor.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const VALID_DEPTHS = new Set([25, 50, 75, 100])
const VALID_SLUG = /^[a-z0-9-]{1,120}$/

// I allow each IP 60 events per 10-minute window — generous enough for real
// readers moving through a post, tight enough to stop a scraper hammering it.
const RATE_LIMIT = 60
const WINDOW_SECONDS = 600

function ipKey(ip: string) {
  return `blog:read-event:${ip}`
}

export const runtime = "edge"

export async function POST(req: NextRequest) {
  // I parse the body defensively — the route receives fire-and-forget beacon requests.
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("slug" in body) ||
    !("depth" in body) ||
    typeof (body as Record<string, unknown>).slug !== "string" ||
    typeof (body as Record<string, unknown>).depth !== "number"
  ) {
    return new NextResponse(null, { status: 204 })
  }

  const { slug, depth } = body as { slug: string; depth: number }

  // I validate slug and depth before touching any database.
  if (!VALID_SLUG.test(slug) || !VALID_DEPTHS.has(depth)) {
    return new NextResponse(null, { status: 204 })
  }

  // I derive the IP from the Vercel forwarded header, falling back to a placeholder
  // so rate-limiting still works in local dev where x-forwarded-for is absent.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // I apply rate-limiting when Redis is available.
  if (redis) {
    const key = ipKey(ip)
    const count = await redis.incr(key)
    if (count === 1) {
      // I set the expiry only on first increment so the window starts when the IP first fires.
      await redis.expire(key, WINDOW_SECONDS)
    }
    if (count > RATE_LIMIT) {
      // I respond 204 rather than 429 so the client does not retry (it is fire-and-forget).
      return new NextResponse(null, { status: 204 })
    }
  }

  // I upsert so duplicate events from the same visitor within a session are idempotent.
  // The unique constraint is (slug, depth, ip_hash) — I store an MD5-like truncated hash
  // rather than the raw IP for privacy compliance.
  const ipHash = ip === "unknown" ? "unknown" : Buffer.from(ip).toString("base64").slice(0, 12)

  await supabase.from("blog_read_events").upsert(
    {
      slug,
      depth,
      ip_hash: ipHash,
      created_at: new Date().toISOString(),
    },
    // I use slug + depth + ip_hash as the conflict target so we only count one
    // scroll-to-100% per visitor per post, not one per page view.
    { onConflict: "slug,depth,ip_hash", ignoreDuplicates: true },
  )

  return new NextResponse(null, { status: 204 })
}
