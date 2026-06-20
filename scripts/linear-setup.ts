#!/usr/bin/env npx tsx
// One-time setup script for all Linear teams used by the dashboard.
// Run this once per Linear workspace to create the required workflow states
// and get the team IDs to add to Vercel.
//
// Usage:
//   LINEAR_API_KEY=lin_api_xxx npx tsx scripts/linear-setup.ts
//
// To override which team is used for each purpose, set env vars before running:
//   LINEAR_TEAM_ID=<id>      - Careers team (job applications)
//   LINEAR_UNI_TEAM_ID=<id>  - University team (deadlines)
//
// Linear teams can only be created via the web UI: linear.app -> Settings -> Teams
// Suggested team names: "Careers" and "Isaac Adjei" (or "University")

const GQL = "https://api.linear.app/graphql"

// ─── State definitions ───────────────────────────────────────────────────────

// Workflow states for the Careers team (job applications).
// These map to the STATUS_TO_LINEAR_STATE table in lib/linear-sync.ts.
const CAREERS_STATES = [
  { name: "Saved",          type: "unstarted",  color: "#e2e2e2" },
  { name: "Applied",        type: "started",    color: "#f2c94c" },
  { name: "Assessment",     type: "started",    color: "#f7b731" },
  { name: "Interviewing",   type: "started",    color: "#bb87fc" },
  { name: "Final Round",    type: "started",    color: "#a259ff" },
  { name: "Offer Received", type: "started",    color: "#26b5ce" },
  { name: "Negotiating",    type: "started",    color: "#0f7488" },
  { name: "Accepted",       type: "completed",  color: "#5e6ad2" },
  { name: "Rejected",       type: "cancelled",  color: "#e5484d" },
  { name: "Ghosted",        type: "cancelled",  color: "#888ea8" },
  { name: "Withdrawn",      type: "cancelled",  color: "#c4c8cc" },
]

// Workflow states for the University team (deadlines).
// These map to DEADLINE_STATUS_TO_LINEAR in lib/linear-sync.ts.
const UNIVERSITY_STATES = [
  { name: "To Do",       type: "unstarted",  color: "#e2e2e2" },
  { name: "In Progress", type: "started",    color: "#f2c94c" },
  { name: "In Review",   type: "started",    color: "#bb87fc" },
  { name: "Done",        type: "completed",  color: "#5e6ad2" },
]

// ─── API helpers ─────────────────────────────────────────────────────────────

async function query(apiKey: string, q: string, vars?: Record<string, unknown>) {
  const res = await fetch(GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({ query: q, variables: vars }),
  })
  if (!res.ok) throw new Error(`Linear API HTTP ${res.status}`)
  const body = await res.json() as { data?: Record<string, unknown>; errors?: { message: string }[] }
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join(", "))
  return body.data ?? {}
}

type Team = {
  id: string
  name: string
  states: { nodes: { id: string; name: string; type: string; color: string }[] }
}

async function fetchTeams(apiKey: string): Promise<Team[]> {
  const data = await query(apiKey, `
    query {
      teams {
        nodes {
          id name
          states { nodes { id name type color } }
        }
      }
    }
  `) as { teams: { nodes: Team[] } }
  return data.teams.nodes
}

async function ensureStates(
  apiKey: string,
  team: Team,
  required: { name: string; type: string; color: string }[]
) {
  const existing = new Set(team.states.nodes.map((s) => s.name))
  const missing = required.filter((s) => !existing.has(s.name))

  if (missing.length === 0) {
    console.log(`  All ${required.length} states already exist.`)
    return
  }

  console.log(`  Creating ${missing.length} missing state(s)...`)
  for (const state of missing) {
    await query(apiKey, `
      mutation CreateState($teamId: String!, $name: String!, $type: String!, $color: String!) {
        workflowStateCreate(input: { teamId: $teamId, name: $name, type: $type, color: $color }) {
          success
          workflowState { id name }
        }
      }
    `, { teamId: team.id, name: state.name, type: state.type, color: state.color })
    console.log(`    + "${state.name}"`)
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) {
    console.error("\nSet LINEAR_API_KEY before running this script.")
    console.error("  LINEAR_API_KEY=lin_api_xxx npx tsx scripts/linear-setup.ts\n")
    process.exit(1)
  }

  // 1. Fetch all teams this API key can see
  const teams = await fetchTeams(apiKey)
  if (teams.length === 0) {
    console.error("No Linear teams found. Create teams at linear.app -> Settings -> Teams.")
    process.exit(1)
  }

  console.log("\nAvailable Linear teams:")
  teams.forEach((t) => console.log(`  - ${t.name}  (id: ${t.id})`))

  // 2. Resolve the Careers team
  //    Prefers LINEAR_TEAM_ID env var, then looks for a team named "Careers"
  const careersId = process.env.LINEAR_TEAM_ID
  const careersTeam = careersId
    ? teams.find((t) => t.id === careersId)
    : teams.find((t) => t.name.toLowerCase().includes("career"))

  // 3. Resolve the University team
  //    Prefers LINEAR_UNI_TEAM_ID env var, then looks for a team named "university" or "isaac adjei"
  const uniId = process.env.LINEAR_UNI_TEAM_ID
  const uniTeam = uniId
    ? teams.find((t) => t.id === uniId)
    : teams.find((t) => t.name.toLowerCase().includes("university") || t.name.toLowerCase().includes("isaac"))

  // 4. Set up Careers team states
  if (careersTeam) {
    console.log(`\n[Careers] Using team: "${careersTeam.name}" (${careersTeam.id})`)
    await ensureStates(apiKey, careersTeam, CAREERS_STATES)
  } else {
    console.log("\n[Careers] Team not found - re-run with LINEAR_TEAM_ID=<id from list above>")
  }

  // 5. Set up University team states
  if (uniTeam) {
    console.log(`\n[University] Using team: "${uniTeam.name}" (${uniTeam.id})`)
    await ensureStates(apiKey, uniTeam, UNIVERSITY_STATES)
  } else {
    console.log("\n[University] Team not found - re-run with LINEAR_UNI_TEAM_ID=<id from list above>")
  }

  // 6. Print Vercel env vars to copy
  console.log("\n\x1b[32m----- DONE -----\x1b[0m")
  console.log("Add these to Vercel (Settings -> Environment Variables):\n")
  if (careersTeam)  console.log(`  LINEAR_TEAM_ID=${careersTeam.id}`)
  if (uniTeam)      console.log(`  LINEAR_UNI_TEAM_ID=${uniTeam.id}`)
  console.log("")
  console.log("After deploying:")
  console.log("  - Job applications sync automatically on create/status change")
  console.log("  - Go to dashboard Settings > Integrations > Sync deadlines to push existing uni deadlines")
  console.log("")
}

main().catch((e: unknown) => {
  console.error("Error:", e)
  process.exit(1)
})
