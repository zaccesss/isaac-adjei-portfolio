// I fetch published newsletter issues from the Beehiiv API so the newsletter page
// can display past issues automatically. Results are cached in Redis for 10 minutes.

import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

const CACHE_KEY = "beehiiv:issues"
const CACHE_TTL = 600 // 10 minutes

export interface NewsletterIssue {
  id: string
  title: string
  subtitle: string | null
  publishDate: string
  webUrl: string
  thumbnailUrl: string | null
}

export async function GET() {
  try {
    if (redis) {
      const cached = await redis.get<NewsletterIssue[]>(CACHE_KEY)
      if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } })
    }

    const apiKey = process.env.BEEHIIV_API_KEY
    const pubId = process.env.BEEHIIV_PUBLICATION_ID

    if (!apiKey || !pubId) {
      return NextResponse.json([], { headers: { "Cache-Control": "no-store" } })
    }

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/posts?status=confirmed&order_by=publish_date&direction=desc&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      return NextResponse.json([], { headers: { "Cache-Control": "no-store" } })
    }

    const json = await res.json()
    const issues: NewsletterIssue[] = (json.data ?? []).map((post: {
      id: string
      title: string
      subtitle?: string
      publish_date?: number
      web_url?: string
      thumbnail_url?: string
    }) => ({
      id: post.id,
      title: post.title,
      subtitle: post.subtitle ?? null,
      publishDate: post.publish_date
        ? new Date(post.publish_date * 1000).toISOString()
        : new Date().toISOString(),
      webUrl: post.web_url ?? `https://newsletter.isaacadjei.me`,
      thumbnailUrl: post.thumbnail_url ?? null,
    }))

    if (redis) await redis.set(CACHE_KEY, issues, { ex: CACHE_TTL })

    return NextResponse.json(issues, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } })
  }
}
