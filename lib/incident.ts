// I open (and resolve) a Linear issue when an external monitor reports an incident - a dead cron from
// Healthchecks, or the site down from Better Stack. It reuses LINEAR_API_KEY and files into my existing
// Linear team (LINEAR_UNI_TEAM_ID, falling back to LINEAR_TEAM_ID, then the first team). Guarded: with
// no API key every function is a no-op so /api/incident degrades cleanly instead of throwing.
//
// A monitor that flaps must not file a new issue on each dip, so I dedupe: while an incident for a
// check is open I update that one issue, and when the check recovers I move the same issue to Done.
// The check name in the title is the key that ties a down and its later up together.
import { getLinearTeams } from "@/lib/linear-sync"
import { resolveMyLinearId, resolveLabelIds, labelsForCheckName, gql } from "@/lib/linear-common"

// Every call here needs the key; a bare null lets every exported function degrade to a no-op
// instead of throwing, same as before this shared with linear-common's retried gql().
function requireApiKey(): string | null {
  return process.env.LINEAR_API_KEY ?? null
}

async function resolveOpsTeamId(): Promise<string | null> {
  // Reuse my existing Linear team (the same one university deadlines use), not a separate ops team.
  const explicit = process.env.LINEAR_UNI_TEAM_ID || process.env.LINEAR_TEAM_ID
  if (explicit) return explicit
  const teams = await getLinearTeams()
  return teams[0]?.id ?? null
}

// Creates an urgent (priority 1) Linear issue and returns its id, or null if it could not. Always
// assigns to me and tags "health" plus the repo and the specific job the failing check belongs to
// (resolved from its name across all six repos, or just "portfolio" for a Better Stack site-down
// alert with no job of its own), so every incident lands where I will actually see it instead of
// sitting unassigned and unlabelled in the team backlog.
export async function createIncidentIssue(
  title: string,
  description: string,
  context?: { checkName?: string; source?: string },
): Promise<string | null> {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) return null
  const teamId = await resolveOpsTeamId()
  if (!teamId) return null

  const checkLabels = context?.checkName ? labelsForCheckName(context.checkName, context.source ?? "") : []
  const [assigneeId, labelIds] = await Promise.all([
    resolveMyLinearId(apiKey),
    resolveLabelIds(apiKey, teamId, ["health", ...checkLabels]),
  ])

  const data = await gql<{ issueCreate?: { issue?: { id: string } } }>(
    apiKey,
    `mutation CreateIncident($teamId: String!, $title: String!, $description: String!, $assigneeId: String, $labelIds: [String!]) {
      issueCreate(input: { teamId: $teamId, title: $title, description: $description, priority: 1, assigneeId: $assigneeId, labelIds: $labelIds }) {
        success
        issue { id }
      }
    }`,
    { teamId, title, description, assigneeId, labelIds },
  )
  return data?.issueCreate?.issue?.id ?? null
}

// Finds an open (not completed or canceled) incident by title, so a flapping check updates one
// issue instead of filing a new one each time. Exact match by default so one check's name can
// never be a substring of another's ("api" matching "api-backup is down"); "prefix" mode exists
// for the dead-webhook dedupe, whose stable key starts both of its title variants.
export async function findOpenIncidentId(title: string, match: "exact" | "prefix" = "exact"): Promise<string | null> {
  const apiKey = requireApiKey()
  if (!apiKey || !title.trim()) return null
  const teamId = await resolveOpsTeamId()
  if (!teamId) return null
  const titleFilter = match === "exact" ? "{ eqIgnoreCase: $q }" : "{ startsWith: $q }"
  const data = await gql<{ issues?: { nodes: { id: string }[] } }>(
    apiKey,
    `query FindOpenIncident($teamId: ID!, $q: String!) {
      issues(first: 1, filter: {
        team: { id: { eq: $teamId } },
        title: ${titleFilter},
        state: { type: { nin: ["completed", "canceled"] } }
      }) { nodes { id } }
    }`,
    { teamId, q: title.trim() },
  )
  return data?.issues?.nodes[0]?.id ?? null
}

// Adds a comment to an incident (for example "still down" on a repeat, or "recovered" on an up).
export async function addIncidentComment(issueId: string, body: string): Promise<boolean> {
  const apiKey = requireApiKey()
  if (!apiKey) return false
  const data = await gql<{ commentCreate?: { success: boolean } }>(
    apiKey,
    `mutation AddIncidentComment($id: String!, $body: String!) {
      commentCreate(input: { issueId: $id, body: $body }) { success }
    }`,
    { id: issueId, body },
  )
  return Boolean(data?.commentCreate?.success)
}

// Moves an incident to the team's first completed state and leaves a recovery comment, so an up event
// closes the issue the matching down opened.
export async function resolveIncident(issueId: string, comment: string): Promise<boolean> {
  const apiKey = requireApiKey()
  if (!apiKey) return false
  const teamId = await resolveOpsTeamId()
  if (!teamId) return false
  if (comment) await addIncidentComment(issueId, comment)
  const states = await gql<{ team?: { states: { nodes: { id: string; type: string }[] } } }>(
    apiKey,
    `query TeamStates($teamId: String!) {
      team(id: $teamId) { states { nodes { id type } } }
    }`,
    { teamId },
  )
  const doneId = states?.team?.states.nodes.find((s) => s.type === "completed")?.id
  if (!doneId) return false
  const data = await gql<{ issueUpdate?: { success: boolean } }>(
    apiKey,
    `mutation ResolveIncident($id: String!, $stateId: String!) {
      issueUpdate(id: $id, input: { stateId: $stateId }) { success }
    }`,
    { id: issueId, stateId: doneId },
  )
  return Boolean(data?.issueUpdate?.success)
}

export function incidentConfigured(): boolean {
  return Boolean(process.env.LINEAR_API_KEY && process.env.INCIDENT_WEBHOOK_SECRET)
}
