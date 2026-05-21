import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  return `${days}d ago`
}

export async function GET() {
  try {
    // I cache the last push for 5 minutes to avoid hammering the GitHub API on every page load
    if (redis) {
      const cached = await redis.get<{ repo: string; pushedAt: string; relativeTime: string }>(
        "github:last_push"
      )
      if (cached) {
        // I recompute relativeTime on cache hit so "2m ago" stays accurate even though the push data is frozen
        return NextResponse.json(
          { ...cached, relativeTime: relativeTime(cached.pushedAt) },
          { headers: { "Cache-Control": "no-store" } }
        )
      }
    }

    const pat = process.env.GITHUB_PAT

    const res = await fetch(
      `https://api.github.com/users/zaccesss/events?per_page=30`,
      {
        headers: {
          "User-Agent": "isaac-adjei-portfolio",
          Accept: "application/vnd.github+json",
          ...(pat ? { Authorization: `Bearer ${pat}` } : {}),
        },
        signal: AbortSignal.timeout(5000),
      }
    )

    console.log("GitHub API status:", res.status, "PAT present:", !!pat)

    if (!res.ok) {
      const body = await res.text()
      console.log("GitHub API error body:", body)
      return NextResponse.json(
        { repo: null, pushedAt: null, relativeTime: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const events = await res.json() as { type: string; repo: { name: string }; created_at: string }[]
    // Skip the profile README repo (zaccesss/zaccesss) - not a real project
    const push = events.find((e) => e.type === "PushEvent" && e.repo.name !== "zaccesss/zaccesss")

    if (!push) {
      return NextResponse.json(
        { repo: null, pushedAt: null, relativeTime: null },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const repoShort = push.repo.name.replace("zaccesss/", "")
    const result = { repo: repoShort, pushedAt: push.created_at, relativeTime: relativeTime(push.created_at) }

    if (redis) {
      // I store only repo and pushedAt - relativeTime is intentionally excluded so it is always recalculated fresh on read
      await redis.set("github:last_push", { repo: repoShort, pushedAt: push.created_at }, { ex: 300 })
    }

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json(
      { repo: null, pushedAt: null, relativeTime: null },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
