// Fires a workflow_dispatch for any job on the control page's allowlist and nothing else. The
// allowlist lives in lib/control-jobs.ts, so a request can only ever name one of my known jobs;
// inputs are taken from that table too, never from the request body.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { logActivity } from "@/app/dashboard/actions"
import { findControlJob, GH_OWNER } from "@/lib/control-jobs"

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  let id: string
  try {
    const body = (await request.json()) as { id?: string }
    id = String(body.id ?? "")
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const job = findControlJob(id)
  if (!job) return NextResponse.json({ error: "Unknown job" }, { status: 400 })

  const token = process.env.GH_PAT ?? process.env.GITHUB_PAT ?? null
  // 403 rather than 401: the user is authenticated but the server lacks the GitHub token.
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 403, headers: { "Cache-Control": "no-store" } })
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GH_OWNER}/${job.repo}/actions/workflows/${job.workflow}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(job.inputs ? { ref: "main", inputs: job.inputs } : { ref: "main" }),
      },
    )

    if (!res.ok) {
      const text = await res.text()
      console.error("GitHub dispatch failed:", job.id, res.status, text)
      const errorMessages: Record<number, string> = {
        401: "PAT invalid or expired - regenerate in GitHub Settings",
        403: "PAT lacks access to this repo - widen its repository list and Actions permission",
        404: "Workflow not found - the PAT may not cover this repo yet",
        422: "Workflow not dispatchable - check its workflow_dispatch trigger",
      }
      const error = errorMessages[res.status] ?? `GitHub API returned HTTP ${res.status}`
      return NextResponse.json({ error }, { status: res.status, headers: { "Cache-Control": "no-store" } })
    }

    void logActivity("workflow.run", job.id)
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  } catch (err) {
    console.error("Run job error:", job.id, err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}
