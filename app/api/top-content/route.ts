import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { posts } from "@/data/blog"
import { getPublishedTILEntries } from "@/data/til"
import { publicApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"

export async function GET(req: Request) {
  if (!await checkRateLimit(publicApiLimiter, getIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  const { data, error } = await supabase
    .from("blog_read_events")
    .select("slug, post_type")
    .eq("depth", 100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const blogCounts: Record<string, number> = {}
  const tilCounts: Record<string, number> = {}

  for (const row of data ?? []) {
    if (row.post_type === "til") {
      tilCounts[row.slug] = (tilCounts[row.slug] ?? 0) + 1
    } else {
      blogCounts[row.slug] = (blogCounts[row.slug] ?? 0) + 1
    }
  }

  const tilEntries = getPublishedTILEntries()

  const topBlog = Object.entries(blogCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, reads]) => ({
      slug,
      reads,
      title: posts.find((p) => p.slug === slug)?.title ?? slug,
    }))

  const topTil = Object.entries(tilCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, reads]) => ({
      slug,
      reads,
      title: tilEntries.find((e) => e.id === slug)?.title ?? slug,
    }))

  return NextResponse.json(
    { topBlog, topTil },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  )
}
