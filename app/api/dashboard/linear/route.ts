import { NextResponse } from "next/server"
import { auth } from "@/auth"

const LINEAR_GQL = "https://api.linear.app/graphql"

const ISSUES_QUERY = `
  query Issues {
    issues(first: 250, orderBy: updatedAt, filter: { state: { type: { neq: "cancelled" } } }) {
      nodes {
        id
        identifier
        title
        priority
        priorityLabel
        url
        createdAt
        updatedAt
        dueDate
        state { name color type }
        team { name key }
        project { name color }
        labels { nodes { name color } }
      }
    }
  }
`

export type LinearIssue = {
  id: string
  identifier: string
  title: string
  priority: number
  priorityLabel: string
  url: string
  createdAt: string
  updatedAt: string
  dueDate: string | null
  state: { name: string; color: string; type: string }
  team: { name: string; key: string }
  project: { name: string; color: string } | null
  labels: { nodes: { name: string; color: string }[] }
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) return NextResponse.json({ configured: false, issues: [] }, { headers: { "Cache-Control": "no-store" } })

  try {
    const res = await fetch(LINEAR_GQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: ISSUES_QUERY }),
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      const detail = res.status === 401 ? "Invalid or expired LINEAR_API_KEY" : `HTTP ${res.status}`
      return NextResponse.json({ configured: true, error: `Linear API error: ${detail}`, issues: [], detail: body }, { status: res.status })
    }

    const json = await res.json() as { data?: { issues?: { nodes: LinearIssue[] } }; errors?: { message: string }[] }
    if (json.errors?.length) {
      const msg = json.errors[0]?.message ?? "Unknown error"
      return NextResponse.json({ configured: true, error: `Linear query error: ${msg}`, issues: [] }, { status: 400 })
    }

    const issues = json.data?.issues?.nodes ?? []
    return NextResponse.json({ configured: true, issues }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ configured: true, error: "Failed to reach Linear", issues: [] }, { status: 502 })
  }
}
