// I open a Linear issue when an external monitor reports an incident - a dead cron from Healthchecks,
// or the site down from Better Stack. It reuses LINEAR_API_KEY and files into my existing Linear team
// (LINEAR_UNI_TEAM_ID, falling back to LINEAR_TEAM_ID, then the first team). Guarded: with no API key
// it is a no-op so /api/incident degrades cleanly instead of throwing.
import { getLinearTeams } from "@/lib/linear-sync"

const LINEAR_GQL = "https://api.linear.app/graphql"

async function resolveOpsTeamId(): Promise<string | null> {
  // Reuse my existing Linear team (the same one university deadlines use), not a separate ops team.
  const explicit = process.env.LINEAR_UNI_TEAM_ID || process.env.LINEAR_TEAM_ID
  if (explicit) return explicit
  const teams = await getLinearTeams()
  return teams[0]?.id ?? null
}

// Creates an urgent (priority 1) Linear issue and returns its id, or null if it could not.
export async function createIncidentIssue(title: string, description: string): Promise<string | null> {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) return null

  const teamId = await resolveOpsTeamId()
  if (!teamId) return null

  const res = await fetch(LINEAR_GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({
      query: `
        mutation CreateIncident($teamId: String!, $title: String!, $description: String!) {
          issueCreate(input: { teamId: $teamId, title: $title, description: $description, priority: 1 }) {
            success
            issue { id }
          }
        }
      `,
      variables: { teamId, title, description },
    }),
  })

  const json = (await res.json()) as { data?: { issueCreate?: { issue?: { id: string } } } }
  return json.data?.issueCreate?.issue?.id ?? null
}

export function incidentConfigured(): boolean {
  return Boolean(process.env.LINEAR_API_KEY && process.env.INCIDENT_WEBHOOK_SECRET)
}
