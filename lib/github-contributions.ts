// Syncs real GitHub contribution history into github_contributions_days/_years, so the contribution
// graph (public and dashboard) can finally draw from stored history instead of calling GitHub's
// live GraphQL API fresh on every page view. GitHub's contributionsCollection caps any single
// from/to span at one year, so a full backfill queries one year at a time; a routine daily sync
// only needs to re-fetch the current year, since past years never change once they have ended.

import { supabase } from "@/lib/supabase"
import { GH_OWNER } from "@/lib/site-config"

// The account's first year of activity - matches the same starting point app/api/github-stats/
// route.ts already uses for its all-time total, so both stay in agreement.
const FIRST_YEAR = 2020

interface YearContributions {
  year: number
  commits: number
  pullRequests: number
  reviews: number
  issues: number
  days: { date: string; count: number }[]
}

async function fetchYear(pat: string, year: number): Promise<YearContributions | null> {
  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalIssueContributions
            contributionCalendar {
              weeks {
                contributionDays { date contributionCount }
              }
            }
          }
        }
      }`,
      variables: { login: GH_OWNER, from, to },
    }),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    console.error("github-contributions sync: GraphQL request failed for", year, res.status, await res.text())
    return null
  }
  const json = await res.json()
  if (json?.errors?.length) {
    console.error("github-contributions sync: GraphQL errors for", year, JSON.stringify(json.errors))
  }
  const col = json?.data?.user?.contributionsCollection
  if (!col) return null
  const days: { date: string; count: number }[] = col.contributionCalendar.weeks.flatMap(
    (w: { contributionDays: { date: string; contributionCount: number }[] }) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
  )
  return {
    year,
    commits: col.totalCommitContributions ?? 0,
    pullRequests: col.totalPullRequestContributions ?? 0,
    reviews: col.totalPullRequestReviewContributions ?? 0,
    issues: col.totalIssueContributions ?? 0,
    days,
  }
}

async function persistYear(y: YearContributions): Promise<void> {
  // GitHub's contributionCalendar returns one entry per day across the whole requested range,
  // including days later in the current year that have not happened yet (a real, live-confirmed
  // bug: the table had zero-count rows through 31 December of the current year). Those future
  // rows then became the "latest" date CalendarHeatmap's defaultRange() anchors on, shifting the
  // whole displayed window to the current calendar year instead of a genuine trailing 365 days.
  // Filtering to real days here stops it happening again; the read-side query below adds the same
  // guard defensively, since it cannot un-write rows a past sync already stored.
  const todayIso = new Date().toISOString().slice(0, 10)
  const realDays = y.days.filter((d) => d.date <= todayIso)
  if (realDays.length > 0) {
    await supabase.from("github_contributions_days").upsert(
      realDays.map((d) => ({ date: d.date, count: d.count })),
      { onConflict: "date" }
    )
  }
  await supabase.from("github_contributions_years").upsert(
    {
      year: y.year,
      commits: y.commits,
      pull_requests: y.pullRequests,
      reviews: y.reviews,
      issues: y.issues,
      total: y.days.reduce((sum, d) => sum + d.count, 0),
      synced_at: new Date().toISOString(),
    },
    { onConflict: "year" }
  )
}

export interface GithubContributionsData {
  days: { date: string; count: number }[] // trailing ~365 days
  currentYear: { commits: number; pullRequests: number; reviews: number; issues: number; total: number }
  allTimeTotal: number
}

const EMPTY_YEAR = { commits: 0, pullRequests: 0, reviews: 0, issues: 0, total: 0 }

// Reads the stored history instead of calling GitHub's live API - both the public and dashboard
// contribution graphs share this so a page view never blocks on (or gets rate-limited by) GitHub.
export async function getStoredGithubContributions(): Promise<GithubContributionsData> {
  const since = new Date()
  since.setDate(since.getDate() - 365)
  const sinceIso = since.toISOString().slice(0, 10)
  // A defensive upper bound: a past sync could have stored future zero-count placeholder rows for
  // the current year (GitHub's contributionCalendar returns one entry per day across the whole
  // requested range, including days that have not happened yet) before persistYear() started
  // filtering them out. Without this, CalendarHeatmap's defaultRange() anchors on the data's own
  // latest date, which a lingering future row would push into next year - live-confirmed as the
  // exact cause of the calendar rendering the current calendar year instead of a trailing 365 days.
  const todayIso = new Date().toISOString().slice(0, 10)

  const [{ data: days }, { data: years }] = await Promise.all([
    supabase.from("github_contributions_days").select("date, count").gte("date", sinceIso).lte("date", todayIso).order("date"),
    supabase.from("github_contributions_years").select("year, commits, pull_requests, reviews, issues, total"),
  ])

  const currentYearRow = years?.find((y) => y.year === new Date().getFullYear())
  const allTimeTotal = (years ?? []).reduce((sum, y) => sum + y.total, 0)

  return {
    days: days ?? [],
    currentYear: currentYearRow
      ? {
          commits: currentYearRow.commits,
          pullRequests: currentYearRow.pull_requests,
          reviews: currentYearRow.reviews,
          issues: currentYearRow.issues,
          total: currentYearRow.total,
        }
      : EMPTY_YEAR,
    allTimeTotal,
  }
}

// Returns the number of years synced or -1 if no PAT is configured.
export async function syncGithubContributions(): Promise<number> {
  const pat = process.env.GH_PAT ?? process.env.GITHUB_PAT
  if (!pat) return -1

  const currentYear = new Date().getFullYear()
  const { count } = await supabase
    .from("github_contributions_years")
    .select("year", { count: "exact", head: true })

  // An empty table means this is the very first run - backfill every year once. Every later run
  // only needs the current year, since a past year's contribution history never changes once it
  // has ended.
  const years = !count ? Array.from({ length: currentYear - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i) : [currentYear]

  let synced = 0
  for (const year of years) {
    const data = await fetchYear(pat, year)
    if (!data) continue
    await persistYear(data)
    synced++
  }
  return synced
}
