// I fetch GitHub profile stats and aggregate repo data (stars, languages) from the
// GitHub REST API using the existing GITHUB_PAT token. Results are cached in Redis
// for 10 minutes so I don't hammer the API rate limit.

import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

const GITHUB_USER = "zaccesss"
const CACHE_KEY = "github:stats"
const CACHE_TTL = 600 // 10 minutes

interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  fork: boolean
  private: boolean
}

interface GitHubUser {
  public_repos: number
  followers: number
  following: number
}

export interface GitHubStats {
  publicRepos: number
  followers: number
  totalStars: number
  topLanguages: string[]
  topRepos: { name: string; description: string; stars: number; url: string }[]
}

function githubHeaders(pat?: string) {
  return {
    "User-Agent": "isaac-adjei-portfolio",
    Accept: "application/vnd.github+json",
    ...(pat ? { Authorization: `Bearer ${pat}` } : {}),
  }
}

export async function GET() {
  try {
    if (redis) {
      const cached = await redis.get<GitHubStats>(CACHE_KEY)
      if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } })
    }

    const pat = process.env.GITHUB_PAT
    const headers = githubHeaders(pat)

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers, signal: AbortSignal.timeout(6000) }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, { headers, signal: AbortSignal.timeout(6000) }),
    ])

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json(null, { headers: { "Cache-Control": "no-store" } })
    }

    const user: GitHubUser = await userRes.json()
    const repos: GitHubRepo[] = await reposRes.json()

    const ownRepos = repos.filter((r) => !r.fork && !r.private)

    const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0)

    const langCount: Record<string, number> = {}
    for (const r of ownRepos) {
      if (r.language) langCount[r.language] = (langCount[r.language] ?? 0) + 1
    }
    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang)

    const topRepos = ownRepos
      .filter((r) => r.description)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map((r) => ({
        name: r.name,
        description: r.description ?? "",
        stars: r.stargazers_count,
        url: r.html_url,
      }))

    const stats: GitHubStats = {
      publicRepos: user.public_repos,
      followers: user.followers,
      totalStars,
      topLanguages,
      topRepos,
    }

    if (redis) await redis.set(CACHE_KEY, stats, { ex: CACHE_TTL })

    return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json(null, { headers: { "Cache-Control": "no-store" } })
  }
}
