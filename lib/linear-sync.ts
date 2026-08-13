// Syncs job applications and university deadlines to Linear.
// Requires LINEAR_API_KEY and LINEAR_TEAM_ID env vars.
// On create: creates a Linear issue and returns the new issue ID.
// On update: moves the existing issue to the state matching the dashboard status and, for applications,
// refreshes its title and description so a later edit (renamed company or role, a posting URL added
// afterwards) propagates instead of going stale.
// Every call is resilient: a Linear outage or a bad response degrades the sync to a no-op rather than
// throwing into the fire-and-forget callers in the dashboard actions.

import { resolveMyLinearId, resolveLabelIds, gql } from "@/lib/linear-common"

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

async function resolveStateId(apiKey: string, teamId: string, stateName: string): Promise<string | null> {
  const data = await gql<{ team?: { states?: { nodes: { id: string; name: string }[] } } }>(apiKey, `
    query TeamStates($teamId: String!) {
      team(id: $teamId) {
        states { nodes { id name } }
      }
    }
  `, { teamId })
  const states = data?.team?.states?.nodes ?? []
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

  const title = `${app.company} - ${app.role}`
  const description = app.url ? `[View posting](${app.url})\n\nType: ${app.type}` : `Type: ${app.type}`

  // Existing issue: move it to the mapped state and refresh the title and description too, so a renamed
  // company or role or a posting URL added later, propagates to Linear instead of going stale.
  if (app.linear_issue_id) {
    await gql(apiKey, `
      mutation UpdateIssue($id: String!, $stateId: String!, $title: String!, $description: String!) {
        issueUpdate(id: $id, input: { stateId: $stateId, title: $title, description: $description }) { success }
      }
    `, { id: app.linear_issue_id, stateId, title, description })
    return app.linear_issue_id
  }

  const [assigneeId, labelIds] = await Promise.all([
    resolveMyLinearId(apiKey),
    resolveLabelIds(apiKey, teamId, ["career", "application"]),
  ])

  const result = await gql<{ issueCreate?: { issue?: { id: string } } }>(apiKey, `
    mutation CreateIssue($teamId: String!, $title: String!, $stateId: String!, $description: String!, $assigneeId: String, $labelIds: [String!]) {
      issueCreate(input: { teamId: $teamId, title: $title, stateId: $stateId, description: $description, assigneeId: $assigneeId, labelIds: $labelIds }) {
        success
        issue { id }
      }
    }
  `, { teamId, title, stateId, description, assigneeId, labelIds })

  return result?.issueCreate?.issue?.id ?? null
}

// Maps uni_deadlines.status values to Linear state names.
// Create these states in your Linear team: "To Do", "In Progress", "In Review", "Done".
const DEADLINE_STATUS_TO_LINEAR: Record<string, string> = {
  not_started: "To Do",
  in_progress:  "In Progress",
  submitted:    "In Review",
  graded:       "Done",
}

export async function syncDeadlineToLinear(deadline: {
  id: string
  title: string
  type: string
  due_date: string
  module?: string | null
  status: string
  linear_issue_id?: string | null
}, uniTeamId?: string | null): Promise<string | null> {
  const apiKey = process.env.LINEAR_API_KEY
  // University deadlines use LINEAR_UNI_TEAM_ID if set, falling back to LINEAR_TEAM_ID
  const teamId = uniTeamId ?? process.env.LINEAR_UNI_TEAM_ID ?? process.env.LINEAR_TEAM_ID
  if (!apiKey || !teamId) return null

  const targetStateName = DEADLINE_STATUS_TO_LINEAR[deadline.status]
  if (!targetStateName) return null

  const stateId = await resolveStateId(apiKey, teamId, targetStateName)
  if (!stateId) return null

  if (deadline.linear_issue_id) {
    await gql(apiKey, `
      mutation UpdateIssue($id: String!, $stateId: String!) {
        issueUpdate(id: $id, input: { stateId: $stateId }) { success }
      }
    `, { id: deadline.linear_issue_id, stateId })
    return deadline.linear_issue_id
  }

  const due = new Date(deadline.due_date).toISOString().split("T")[0]
  const moduleLabel = deadline.module ? `Module: ${deadline.module}\n` : ""
  const description = `${moduleLabel}Type: ${deadline.type}\nDue: ${due}`

  const [assigneeId, labelIds] = await Promise.all([
    resolveMyLinearId(apiKey),
    resolveLabelIds(apiKey, teamId, ["university"]),
  ])

  const result = await gql<{ issueCreate?: { issue?: { id: string } } }>(apiKey, `
    mutation CreateIssue($teamId: String!, $title: String!, $stateId: String!, $description: String!, $dueDate: TimelessDate, $assigneeId: String, $labelIds: [String!]) {
      issueCreate(input: { teamId: $teamId, title: $title, stateId: $stateId, description: $description, dueDate: $dueDate, assigneeId: $assigneeId, labelIds: $labelIds }) {
        success
        issue { id }
      }
    }
  `, { teamId, title: deadline.title, stateId, description, dueDate: due, assigneeId, labelIds })

  return result?.issueCreate?.issue?.id ?? null
}

export async function getLinearTeams(): Promise<{ id: string; name: string }[]> {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) return []
  const data = await gql<{ teams?: { nodes: { id: string; name: string }[] } }>(apiKey, `query { teams { nodes { id name } } }`)
  return data?.teams?.nodes ?? []
}

export function linearConfigured(): boolean {
  return Boolean(process.env.LINEAR_API_KEY && process.env.LINEAR_TEAM_ID)
}
