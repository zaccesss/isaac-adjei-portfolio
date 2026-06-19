#!/usr/bin/env npx tsx
// Run: LINEAR_API_KEY=lin_api_xxx LINEAR_TEAM_ID=xxx npx tsx scripts/linear-university-setup.ts
//
// What this script does:
//   1. Lists all Linear teams in your workspace
//   2. Lets you pick which team to use for university deadlines (or creates the state mapping)
//   3. Ensures the 4 required workflow states exist on that team:
//        "To Do", "In Progress", "In Review", "Done"
//   4. Prints the LINEAR_UNI_TEAM_ID to add to Vercel
//
// Linear teams can only be created via the web UI: linear.app -> Settings -> Teams -> + New Team
// Suggested team name: "University"

const GQL = "https://api.linear.app/graphql"

const REQUIRED_STATES = [
  { name: "To Do",        type: "unstarted", color: "#e2e2e2" },
  { name: "In Progress",  type: "started",   color: "#f2c94c" },
  { name: "In Review",    type: "started",   color: "#bb87fc" },
  { name: "Done",         type: "completed", color: "#5e6ad2" },
]

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

async function main() {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) {
    console.error("Set LINEAR_API_KEY before running this script.")
    process.exit(1)
  }

  // 1. List teams
  const teamsData = await query(apiKey, `
    query {
      teams {
        nodes {
          id
          name
          states {
            nodes { id name type color }
          }
        }
      }
    }
  `) as { teams: { nodes: { id: string; name: string; states: { nodes: { id: string; name: string; type: string; color: string }[] } }[] } }

  const teams = teamsData.teams.nodes
  if (teams.length === 0) {
    console.error("No Linear teams found. Create a team at linear.app -> Settings -> Teams.")
    process.exit(1)
  }

  console.log("\nAvailable Linear teams:")
  teams.forEach((t, i) => console.log(`  [${i + 1}] ${t.name}  (id: ${t.id})`))

  // If LINEAR_UNI_TEAM_ID is already set, use it directly (no guessing needed)
  const preselectedId = process.env.LINEAR_UNI_TEAM_ID
  const picked = preselectedId
    ? teams.find((t) => t.id === preselectedId) ?? teams[0]
    : teams.find((t) => t.name.toLowerCase().includes("university")) ?? null

  if (!picked) {
    console.log("\nCould not auto-select a team.")
    console.log("Re-run with the team id you want to use for university deadlines:")
    console.log(`\n  LINEAR_API_KEY=... LINEAR_UNI_TEAM_ID=<id above> npx tsx scripts/linear-university-setup.ts\n`)
    process.exit(0)
  }

  console.log(`\nUsing team: "${picked.name}" (${picked.id})`)

  // 2. Check + create required states
  const existingNames = new Set(picked.states.nodes.map((s) => s.name))
  const missing = REQUIRED_STATES.filter((s) => !existingNames.has(s.name))

  if (missing.length === 0) {
    console.log("All required workflow states already exist.")
  } else {
    console.log(`\nCreating ${missing.length} missing state(s)...`)
    for (const state of missing) {
      await query(apiKey, `
        mutation CreateState($teamId: String!, $name: String!, $type: String!, $color: String!) {
          workflowStateCreate(input: { teamId: $teamId, name: $name, type: $type, color: $color }) {
            success
            workflowState { id name }
          }
        }
      `, { teamId: picked.id, name: state.name, type: state.type, color: state.color })
      console.log(`  Created: "${state.name}"`)
    }
  }

  // 3. Print final instructions
  console.log("\n\x1b[32m----- DONE -----\x1b[0m")
  console.log("Add this to Vercel (or .env.local for local dev):")
  console.log(`\n  LINEAR_UNI_TEAM_ID=${picked.id}\n`)
  console.log("Then open the dashboard Settings > Integrations and click 'Sync all deadlines to Linear'.")
  console.log("Future deadlines will sync automatically when created or updated.\n")
}

main().catch((e: unknown) => {
  console.error("Error:", e)
  process.exit(1)
})
