import { NextResponse } from "next/server"
import { auth } from "@/auth"

type GitHubRun = {
  conclusion: string | null
  created_at: string
}

type GitHubRunsResponse = {
  workflow_runs: GitHubRun[]
}

const ALLOWED_WORKFLOWS = new Set([
  "wakatime-sync.yml",
  "cv-pdf.yml",
  "generate-cvs.yml",
  "job-scraper.yml",
  "vault-expiry-check.yml",
])

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const workflow = searchParams.get("workflow")

  if (!workflow || !ALLOWED_WORKFLOWS.has(workflow)) {
    return NextResponse.json({ error: "Invalid workflow" }, { status: 400 })
  }

  const token = process.env.GH_PAT ?? process.env.GITHUB_PAT ?? null
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/zaccesss/isaac-adjei-portfolio/actions/workflows/${workflow}/runs?per_page=1`,
      { headers, next: { revalidate: 0 } }
    )

    if (!res.ok) {
      return NextResponse.json(
        { lastRun: null, status: "unknown" },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const body = await res.json() as GitHubRunsResponse
    const run = body.workflow_runs?.[0]
    if (!run) {
      return NextResponse.json(
        { lastRun: null, status: "unknown" },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const status =
      run.conclusion === "success" ? "success" :
      run.conclusion === "failure" || run.conclusion === "timed_out" ? "failure" :
      "unknown"

    return NextResponse.json(
      { lastRun: run.created_at, status },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { lastRun: null, status: "unknown" },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
