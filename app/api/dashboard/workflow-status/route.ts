// I expose the last run status of any allow-listed GitHub Actions workflow so the
// dashboard settings panel can show a health indicator per workflow. I use an
// allowlist rather than accepting any workflow name to prevent the route becoming
// a probe for arbitrary repo workflows.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { GH_OWNER, AUTOMATIONS_REPO, PORTFOLIO_REPO } from "@/lib/site-config"

type GitHubRun = {
  conclusion: string | null
  created_at: string
}

type GitHubRunsResponse = {
  workflow_runs: GitHubRun[]
}

// Each allow-listed workflow maps to the repo that now runs it: the scheduled data jobs moved to
// the automations repo, while the CV workflows still live in this one.
const WORKFLOW_REPOS: Record<string, string> = {
  "wakatime-sync.yml": AUTOMATIONS_REPO,
  "job-scraper.yml": AUTOMATIONS_REPO,
  "vault-expiry-check.yml": AUTOMATIONS_REPO,
  "cv-pdf.yml": PORTFOLIO_REPO,
  "generate-cvs.yml": PORTFOLIO_REPO,
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const requested = searchParams.get("workflow")

  // Resolving through a switch that returns a fresh literal per case (rather than assigning the
  // matched `requested` value back or indexing WORKFLOW_REPOS with the raw param) means the file
  // name reaching the GitHub API URL below is always one of these literals, never the request's
  // own input, so the URL cannot be steered anywhere off the allowlist.
  const workflow: string | null = (() => {
    switch (requested) {
      case "wakatime-sync.yml": return "wakatime-sync.yml"
      case "job-scraper.yml": return "job-scraper.yml"
      case "vault-expiry-check.yml": return "vault-expiry-check.yml"
      case "cv-pdf.yml": return "cv-pdf.yml"
      case "generate-cvs.yml": return "generate-cvs.yml"
      default: return null
    }
  })()

  if (!workflow) {
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
      `https://api.github.com/repos/${GH_OWNER}/${WORKFLOW_REPOS[workflow]}/actions/workflows/${workflow}/runs?per_page=1`,
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
