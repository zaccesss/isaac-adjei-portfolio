// I fetch GitHub profile stats via the authenticated REST API (includes private repos) and read
// contribution history from the stored github_contributions_days/_years tables instead of calling
// GitHub's GraphQL API live - a real per-day history synced daily, not fetched fresh on every page
// view. I cache the combined result in Redis for 10 minutes.

import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { publicApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"
import { GH_OWNER } from "@/lib/site-config"
import { getStoredGithubContributions } from "@/lib/github-contributions"

const GITHUB_USER = GH_OWNER
const CACHE_KEY = "github:stats:v5"
const CACHE_TTL = 600

interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  fork: boolean
}

export interface ContributionDay {
  date: string
  count: number
}

export interface GitHubStats {
  publicRepos: number
  followers: number
  totalStars: number
  topLanguages: string[]
  topRepos: { name: string; description: string; stars: number; url: string }[]
  contributions: {
    allTimeTotal: number
    commits: number
    pullRequests: number
    issues: number
    days: ContributionDay[]
  } | null
}

function authHeaders(pat?: string) {
  return {
    "User-Agent": "isaac-adjei-portfolio",
    Accept: "application/vnd.github+json",
    ...(pat ? { Authorization: `Bearer ${pat}` } : {}),
  }
}

export async function GET(req: Request) {
  if (!await checkRateLimit(publicApiLimiter, getIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  try {
    if (redis) {
      const cached = await redis.get<GitHubStats>(CACHE_KEY)
      if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } })
    }

    const pat = process.env.GITHUB_PAT
    const headers = authHeaders(pat)

    // Use authenticated /user/repos to include private repos. /users/:login gives followers
    // without needing GraphQL just for one number.
    const [reposRes, userRes, stored] = await Promise.all([
      fetch(`https://api.github.com/user/repos?affiliation=owner&per_page=100&sort=updated`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`https://api.github.com/users/${GITHUB_USER}`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }),
      getStoredGithubContributions(),
    ])

    if (!reposRes.ok) {
      return NextResponse.json(null, { headers: { "Cache-Control": "no-store" } })
    }

    const repos: GitHubRepo[] = await reposRes.json()
    const ownRepos = repos.filter((r) => !r.fork)
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
      .map((r) => ({ name: r.name, description: r.description ?? "", stars: r.stargazers_count, url: r.html_url }))

    let followers = 0
    if (userRes.ok) {
      const user = await userRes.json()
      followers = user.followers ?? 0
    } else {
      console.error("github-stats /users request failed:", userRes.status, await userRes.text())
    }

    const contributions: GitHubStats["contributions"] = stored.days.length
      ? {
          allTimeTotal: stored.allTimeTotal,
          commits: stored.currentYear.commits,
          pullRequests: stored.currentYear.pullRequests,
          issues: stored.currentYear.issues,
          days: stored.days,
        }
      : null

    const stats: GitHubStats = {
      publicRepos: repos.length,
      followers,
      totalStars,
      topLanguages,
      topRepos,
      contributions,
    }

    if (redis) await redis.set(CACHE_KEY, stats, { ex: CACHE_TTL })
    return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json(null, { headers: { "Cache-Control": "no-store" } })
  }
}
