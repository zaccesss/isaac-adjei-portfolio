// Blog reactions API.
// GET ?slug=my-post returns counts for all preset + any custom emojis used on that post.
// POST { slug, type, action } increments/decrements the given reaction type.
// type can be a preset name OR any emoji character for custom reactions.

import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// All 8 pinned + 12 picker extras - stored by emoji character
export const PRESET_TYPES = [
  "👍","❤️","🔥","💡","🤯","🎉","💯","🎯",
  "👎","😄","😕","😢","🚀","👀","🙌","😮","💪","🧠","✨","🌟","🙏","😍","🤝","😎","🫶","🥹","🫠","🤌",
] as const
export type ReactionType = (typeof PRESET_TYPES)[number]

const PRESET_DEFAULTS: Record<string, 0> = Object.fromEntries(PRESET_TYPES.map((t) => [t, 0]))

function reactionKey(slug: string, type: string) {
  return `reactions:${slug}:${type}`
}

function customSetKey(slug: string) {
  return `reactions:${slug}:_custom`
}

function isValidType(type: string): boolean {
  // Allow presets or any single-character emoji (unicode)
  if ((PRESET_TYPES as readonly string[]).includes(type)) return true
  // Allow emoji: 1-4 unicode code points (covers most emoji including ZWJ sequences)
  return type.length > 0 && type.length <= 8 && /\p{Emoji}/u.test(type)
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  if (!redis) {
    return NextResponse.json(
      { presets: PRESET_DEFAULTS, custom: {} },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  // Fetch preset counts and the custom emoji set in parallel
  const presetKeys = PRESET_TYPES.map((t) => reactionKey(slug, t))
  const [presetCounts, customEmojis] = await Promise.all([
    redis.mget<number[]>(...presetKeys),
    redis.smembers<string[]>(customSetKey(slug)),
  ])

  const presets = Object.fromEntries(
    PRESET_TYPES.map((t, i) => [t, presetCounts[i] ?? 0])
  )

  let custom: Record<string, number> = {}
  if (customEmojis.length > 0) {
    const customCounts = await redis.mget<number[]>(
      ...customEmojis.map((e) => reactionKey(slug, e))
    )
    custom = Object.fromEntries(
      customEmojis.map((e, i) => [e, customCounts[i] ?? 0])
    )
  }

  return NextResponse.json(
    { presets, custom },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { slug: string; type: string; action?: string }
    const { slug, type } = body
    const action = body.action ?? "react"

    if (!slug || !type) {
      return NextResponse.json({ error: "slug and type required" }, { status: 400 })
    }
    if (!isValidType(type)) {
      return NextResponse.json({ error: "invalid reaction type" }, { status: 400 })
    }

    if (!redis) {
      return NextResponse.json({ count: 0 }, { headers: { "Cache-Control": "no-store" } })
    }

    const key = reactionKey(slug, type)
    const isCustom = !(PRESET_TYPES as readonly string[]).includes(type)

    let newCount: number
    if (action === "unreact") {
      const current = (await redis.get<number>(key)) ?? 0
      newCount = current > 0 ? await redis.decr(key) : 0
      // If count drops to 0 remove from custom set to keep it clean
      if (isCustom && newCount <= 0) {
        await redis.srem(customSetKey(slug), type)
      }
    } else {
      newCount = await redis.incr(key)
      // Track custom emojis in a set so GET can discover them
      if (isCustom) {
        await redis.sadd(customSetKey(slug), type)
      }
    }

    return NextResponse.json(
      { count: Math.max(0, newCount) },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 })
  }
}
