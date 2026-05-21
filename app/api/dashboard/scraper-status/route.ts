import { NextResponse } from "next/server"
import { auth } from "@/auth"

type GitHubRun = {
  id: number
  conclusion: string | null
  created_at: string
}

type GitHubRunsResponse = {
  workflow_runs: GitHubRun[]
}

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  // I prefer GH_PAT because that is the name used in the workflow env, but fall back to GITHUB_PAT
  const token = process.env.GH_PAT ?? process.env.GITHUB_PAT ?? null
  const hasToken = token !== null

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const res = await fetch(
      "https://api.github.com/repos/zaccessss/isaac-adjei-portfolio/actions/workflows/job-scraper.yml/runs?per_page=1",
      { headers, next: { revalidate: 0 } }
    )

    if (!res.ok) {
      return NextResponse.json(
        { lastRun: null, status: "unknown", hasToken },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const data = await res.json() as GitHubRunsResponse
    const run = data.workflow_runs?.[0] ?? null

    let status: "success" | "failure" | "unknown" = "unknown"
    if (run?.conclusion === "success") status = "success"
    else if (run?.conclusion === "failure") status = "failure"
    // I pass hasToken back so the client can decide whether to render the Run now button
    // without needing a separate endpoint to check capability
    return NextResponse.json(
      { lastRun: run?.created_at ?? null, status, hasToken },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { lastRun: null, status: "unknown", hasToken },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
