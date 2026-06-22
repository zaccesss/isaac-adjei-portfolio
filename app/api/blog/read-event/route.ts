import { NextRequest, NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { supabase } from "@/lib/supabase"

const VALID_DEPTHS = new Set([25, 50, 75, 100])
const VALID_SLUG = /^[a-z0-9-]{1,120}$/
const VALID_POST_TYPES = new Set(["blog", "til"])

const RATE_LIMIT = 60
const WINDOW_SECONDS = 600

function ipKey(ip: string) {
  return `blog:read-event:${ip}`
}

export async function POST(req: NextRequest) {
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

  const { slug, depth, type } = body as { slug: string; depth: number; type?: string }

  if (!VALID_SLUG.test(slug) || !VALID_DEPTHS.has(depth)) {
    return new NextResponse(null, { status: 204 })
  }

  const postType = VALID_POST_TYPES.has(type ?? "") ? type! : "blog"

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (redis) {
    const key = ipKey(ip)
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS)
    }
    if (count > RATE_LIMIT) {
      return new NextResponse(null, { status: 204 })
    }
  }

  // btoa (not Buffer) so this stays edge-safe. ASCII-only IPs encode fine; I strip any
  // non-Latin1 bytes first so btoa never throws on an odd x-forwarded-for value.
  const ipHash = ip === "unknown" ? "unknown" : btoa(ip.replace(/[^\x00-\xFF]/g, "")).slice(0, 12)

  await supabase.from("blog_read_events").upsert(
    {
      slug,
      depth,
      ip_hash: ipHash,
      post_type: postType,
      created_at: new Date().toISOString(),
    },
    { onConflict: "slug,depth,ip_hash,post_type", ignoreDuplicates: true },
  )

  return new NextResponse(null, { status: 204 })
}
