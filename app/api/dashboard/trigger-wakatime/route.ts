// I dispatch the wakatime-sync GitHub Actions workflow on demand so I can pull
// fresh coding stats without waiting for the scheduled cron run.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { logActivity } from "@/app/dashboard/actions"

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const token = process.env.GH_PAT ?? process.env.GITHUB_PAT ?? null
  if (!token) {
    return NextResponse.json(
      { error: "No token" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  }

  try {
    const res = await fetch(
      "https://api.github.com/repos/zaccesss/isaac-adjei-portfolio/actions/workflows/wakatime-sync.yml/dispatches",
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error("GitHub dispatch failed:", res.status, text)
      const errorMessages: Record<number, string> = {
        401: "PAT invalid or expired - regenerate in GitHub Settings",
        403: "PAT lacks the workflow permission scope",
        404: "Workflow file not found in repository",
        422: "Workflow not dispatchable - check workflow_dispatch trigger in the YAML file",
      }
      const error = errorMessages[res.status] ?? `GitHub API returned HTTP ${res.status}`
      return NextResponse.json(
        { error },
        { status: res.status, headers: { "Cache-Control": "no-store" } }
      )
    }

    void logActivity("workflow.wakatime")
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("Trigger WakaTime error:", err)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
