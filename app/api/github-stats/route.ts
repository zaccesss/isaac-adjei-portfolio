// I fetch GitHub profile stats via the authenticated REST API (includes private repos)
// and contribution data via GraphQL. I sum all-time contributions across every
// year since the account was created and cache results in Redis for 10 minutes.

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
const CACHE_KEY = "github:stats:v4"
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

export async function GET() {
  try {
    if (redis) {
      const cached = await redis.get<GitHubStats>(CACHE_KEY)
      if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } })
    }

    const pat = process.env.GITHUB_PAT
    const headers = authHeaders(pat)

    const currentYear = new Date().getFullYear()

    // I build aliases for each year from 2020 to current year to get all-time totals in one query.
    // I also fetch the full heatmap and breakdown for the current year.
    const yearAliases = Array.from({ length: currentYear - 2019 }, (_, i) => {
      const y = 2020 + i
      const from = `${y}-01-01T00:00:00Z`
      const to = `${y}-12-31T23:59:59Z`
      if (y === currentYear) {
        return `
          y${y}: contributionsCollection(from: "${from}", to: "${to}") {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }`
      }
      return `
          y${y}: contributionsCollection(from: "${from}", to: "${to}") {
            contributionCalendar { totalContributions }
          }`
    }).join("")

    const graphqlQuery = {
      query: `query($login: String!) {
        user(login: $login) {
          followers { totalCount }
          ${yearAliases}
        }
      }`,
      variables: { login: GITHUB_USER },
    }

    // Use authenticated /user/repos to include private repos
    const [reposRes, graphqlRes] = await Promise.all([
      fetch(`https://api.github.com/user/repos?affiliation=owner&per_page=100&sort=updated`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }),
      pat
        ? fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(graphqlQuery),
            signal: AbortSignal.timeout(10000),
          })
        : Promise.resolve(null),
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

    let contributions: GitHubStats["contributions"] = null
    let followers = 0

    if (graphqlRes && graphqlRes.ok) {
      const gql = await graphqlRes.json()
      const user = gql?.data?.user

      if (user) {
        followers = user.followers?.totalCount ?? 0

        // Sum all-time contributions across every year
        let allTimeTotal = 0
        for (let y = 2020; y <= currentYear; y++) {
          const col = user[`y${y}`]
          if (col) allTimeTotal += col.contributionCalendar?.totalContributions ?? 0
        }

        const currentCol = user[`y${currentYear}`]
        if (currentCol) {
          const days: ContributionDay[] = currentCol.contributionCalendar.weeks.flatMap(
            (w: { contributionDays: { contributionCount: number; date: string }[] }) =>
              w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
          )
          contributions = {
            allTimeTotal,
            commits: currentCol.totalCommitContributions,
            pullRequests: currentCol.totalPullRequestContributions,
            issues: currentCol.totalIssueContributions,
            days,
          }
        }
      }
    }

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
