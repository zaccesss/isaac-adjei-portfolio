import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const token = process.env.GH_PAT ?? process.env.GITHUB_PAT ?? null
  // I return 403 rather than 401 here because the user IS authenticated - they just lack the server-side
  // token needed to call GitHub. The client uses this to show an explanatory message instead of a Run button.
  if (!token) {
    return NextResponse.json(
      { error: "No token" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  }

  try {
    const res = await fetch(
      "https://api.github.com/repos/zaccessss/isaac-adjei-portfolio/actions/workflows/job-scraper.yml/dispatches",
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
      return NextResponse.json(
        { error: "Failed to trigger workflow" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("Trigger scraper error:", err)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
