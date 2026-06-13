// API route for blog post reactions.
// GET ?slug=my-post returns the current counts for all four reaction types.
// POST { slug, type } increments the given reaction and returns the new count.
// I store each reaction as a separate Redis key so I can increment them atomically.

import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export const REACTION_TYPES = ["thumbsup", "fire", "lightbulb", "heart", "thinking", "surprised"] as const
export type ReactionType = (typeof REACTION_TYPES)[number]

function reactionKey(slug: string, type: ReactionType) {
  return `reactions:${slug}:${type}`
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 })
  }

  if (!redis) {
    return NextResponse.json(
      { thumbsup: 0, fire: 0, lightbulb: 0, heart: 0, thinking: 0, surprised: 0 },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  const [thumbsup, fire, lightbulb, heart, thinking, surprised] = await redis.mget<number[]>(
    reactionKey(slug, "thumbsup"),
    reactionKey(slug, "fire"),
    reactionKey(slug, "lightbulb"),
    reactionKey(slug, "heart"),
    reactionKey(slug, "thinking"),
    reactionKey(slug, "surprised")
  )

  return NextResponse.json(
    {
      thumbsup:  thumbsup  ?? 0,
      fire:      fire      ?? 0,
      lightbulb: lightbulb ?? 0,
      heart:     heart     ?? 0,
      thinking:  thinking  ?? 0,
      surprised: surprised ?? 0,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, type } = body as { slug: string; type: string }

    if (!slug || !type) {
      return NextResponse.json({ error: "slug and type are required" }, { status: 400 })
    }

    if (!(REACTION_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ error: "invalid reaction type" }, { status: 400 })
    }

    if (!redis) {
      return NextResponse.json({ count: 0 }, { headers: { "Cache-Control": "no-store" } })
    }

    const action = (body as { action?: string }).action ?? "react"
    let newCount: number
    if (action === "unreact") {
      const current = (await redis.get<number>(reactionKey(slug, type as ReactionType))) ?? 0
      newCount = current > 0 ? await redis.decr(reactionKey(slug, type as ReactionType)) : 0
    } else {
      newCount = await redis.incr(reactionKey(slug, type as ReactionType))
    }
    return NextResponse.json(
      { count: Math.max(0, newCount) },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 })
  }
}
