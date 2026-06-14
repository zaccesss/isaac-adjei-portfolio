// Syncs job applications to a dedicated Linear "Careers" team.
// Requires LINEAR_API_KEY and LINEAR_TEAM_ID env vars.
// On create: creates a Linear issue and returns the new issue ID (stored in applications.linear_issue_id).
// On update: updates the state of the existing issue to match the dashboard status.

const LINEAR_GQL = "https://api.linear.app/graphql"

// Maps dashboard status values to Linear state names (as created in the Careers team)
const STATUS_TO_LINEAR_STATE: Record<string, string> = {
  "Not Applied":             "Saved",
  "Interested":              "Saved",
  "Application Submitted":   "Applied",
  "Online Assessment":       "Assessment",
  "HireVue":                 "Assessment",
  "Case Study":              "Assessment",
  "Telephone Interview":     "Interviewing",
  "Video Interview":         "Interviewing",
  "Face-to-face Interview":  "Interviewing",
  "Assessment Centre":       "Interviewing",
  "Final Round":             "Final Round",
  "Offer Received":          "Offer Received",
  "Negotiating":             "Negotiating",
  "Accepted":                "Accepted",
  "Rejected":                "Rejected",
  "Ghosted":                 "Ghosted",
  "Withdrawn":               "Withdrawn",
  "Not Interested":          "Withdrawn",
}

async function gql(apiKey: string, query: string, variables?: Record<string, unknown>) {
  const res = await fetch(LINEAR_GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({ query, variables }),
  })
  return res.json() as Promise<{ data?: Record<string, unknown>; errors?: { message: string }[] }>
}

async function resolveStateId(apiKey: string, teamId: string, stateName: string): Promise<string | null> {
  const data = await gql(apiKey, `
    query TeamStates($teamId: String!) {
      team(id: $teamId) {
        states { nodes { id name } }
      }
    }
  `, { teamId })
  const states = (data.data?.team as { states?: { nodes: { id: string; name: string }[] } } | undefined)?.states?.nodes ?? []
  return states.find((s) => s.name === stateName)?.id ?? null
}

export async function syncApplicationToLinear(app: {
  id: string
  company: string
  role: string
  type: string
  status: string
  url?: string | null
  linear_issue_id?: string | null
}): Promise<string | null> {
  const apiKey = process.env.LINEAR_API_KEY
  const teamId = process.env.LINEAR_TEAM_ID
  if (!apiKey || !teamId) return null

  const targetStateName = STATUS_TO_LINEAR_STATE[app.status]
  if (!targetStateName) return null

  const stateId = await resolveStateId(apiKey, teamId, targetStateName)
  if (!stateId) return null

  if (app.linear_issue_id) {
    await gql(apiKey, `
      mutation UpdateIssue($id: String!, $stateId: String!) {
        issueUpdate(id: $id, input: { stateId: $stateId }) { success }
      }
    `, { id: app.linear_issue_id, stateId })
    return app.linear_issue_id
  }

  const title = `${app.company} — ${app.role}`
  const description = app.url ? `[View posting](${app.url})\n\nType: ${app.type}` : `Type: ${app.type}`

  const result = await gql(apiKey, `
    mutation CreateIssue($teamId: String!, $title: String!, $stateId: String!, $description: String!) {
      issueCreate(input: { teamId: $teamId, title: $title, stateId: $stateId, description: $description }) {
        success
        issue { id }
      }
    }
  `, { teamId, title, stateId, description })

  const issueId = (result.data?.issueCreate as { issue?: { id: string } } | undefined)?.issue?.id ?? null
  return issueId
}
