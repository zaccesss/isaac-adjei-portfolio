import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { posts } from "@/data/blog"
import { getPublishedTILEntries } from "@/data/til"

const supabase = createClient(
  process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_ANON_KEY || "placeholder",
)

export async function GET() {
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
