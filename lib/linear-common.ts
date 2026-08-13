// Shared plumbing so every Linear issue this app opens (health incidents, application syncs,
// university deadline syncs) always lands assigned to me and carries a category label, instead of
// each creator re-implementing the same viewer and label lookups.
import { AUTOMATIONS_REPO, PORTFOLIO_REPO } from "@/lib/site-config"
import { CONTROL_JOBS } from "@/lib/control-jobs"

const LINEAR_GQL = "https://api.linear.app/graphql"

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function gqlOnce<T>(apiKey: string, query: string, variables?: Record<string, unknown>): Promise<T | null> {
  const res = await fetch(LINEAR_GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({ query, variables }),
  })
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "))
  return json.data ?? null
}

// A burst of near-simultaneous incidents fires this many times at once (one issue creation per
// failing check), which can trip Linear's own API rate limit - a bare transient failure here used
// to drop a label forever, since labels are only ever resolved once at issue-creation time and
// never backfilled later. One retry after a short delay covers a rate limit or a blip without
// meaningfully slowing down what is already a background webhook, not a page load.
export async function gql<T>(apiKey: string, query: string, variables?: Record<string, unknown>): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await gqlOnce<T>(apiKey, query, variables)
    } catch (err) {
      const label = attempt === 0 ? "retrying" : "giving up"
      console.error(`[linear-common] request failed (${label}): ${err instanceof Error ? err.message : String(err)}`)
      if (attempt === 0) await sleep(400)
    }
  }
  return null
}

// The API key is personal, so its viewer is always me. Resolved once per warm instance rather than
// on every issue creation - a cold start just pays for it again, which is cheap and rare.
let cachedViewerId: string | null | undefined

export async function resolveMyLinearId(apiKey: string): Promise<string | null> {
  if (cachedViewerId !== undefined) return cachedViewerId
  const data = await gql<{ viewer?: { id: string } }>(apiKey, `query { viewer { id } }`)
  cachedViewerId = data?.viewer?.id ?? null
  return cachedViewerId
}

// Repo -> short label name, source and colour for that repo's Linear label. Colours are just
// distinct swatches; nothing depends on the exact hex.
const REPO_LABELS: Record<string, { color: string }> = {
  [AUTOMATIONS_REPO]: { color: "#f2c94c" },
  [PORTFOLIO_REPO]: { color: "#4ea7fc" },
  "cron-ops": { color: "#bb87fc" },
  "repo-ops": { color: "#4cb782" },
  "mirror-ops": { color: "#68cc58" },
  "meta-mirror": { color: "#95a2b3" },
}

const REPO_SHORT_NAME: Record<string, string> = {
  [AUTOMATIONS_REPO]: "automations",
  [PORTFOLIO_REPO]: "portfolio",
}

function shortRepoName(repo: string): string {
  return REPO_SHORT_NAME[repo] ?? repo
}

// A Healthchecks check name (medication-reminders, mirror-ops, ...) to the short repo label it
// should carry, built from the same job table the control page uses so the two never disagree.
const HC_NAME_TO_REPO_LABEL: Record<string, string> = {}
for (const job of CONTROL_JOBS) {
  if (job.hcSlug) HC_NAME_TO_REPO_LABEL[job.hcSlug.toLowerCase()] = shortRepoName(job.repo)
}
// Checks that are not a dispatchable workflow at all, so they can never come from CONTROL_JOBS
// above - added by hand instead. repo-ops-digests and mirror-ops-worker are each repo's own
// internal Cloudflare Worker cron, distinct from the dispatchable jobs they sit alongside
// (mirror-ops' sweep.yml already has its own hcSlug above). The rest are this repo's own Vercel
// Cron API routes (see lib/healthcheck-ping.ts's callers), which ping Healthchecks directly and
// were never going to be a dispatchable GitHub Actions workflow in the first place.
HC_NAME_TO_REPO_LABEL["repo-ops-digests"] = shortRepoName("repo-ops")
HC_NAME_TO_REPO_LABEL["mirror-ops-worker"] = shortRepoName("mirror-ops")
HC_NAME_TO_REPO_LABEL["portfolio-site-up"] = shortRepoName(PORTFOLIO_REPO)
for (const slug of ["vault-expiry", "github-contributions-daily-sync", "discord-digest", "trash-cleanup", "strava-sync", "weekly-digest"]) {
  HC_NAME_TO_REPO_LABEL[slug] = shortRepoName(PORTFOLIO_REPO)
}

// Two checks were actually configured in Healthchecks under a name that matches neither
// CONTROL_JOBS' hcSlug nor its label field - "routine checklist"/"cron-ops scheduler" versus
// the hcSlugs "routine"/"cron-ops" - so no string transform of the incoming name can derive the
// right slug. The real fix is renaming these two checks in Healthchecks to match their hcSlug
// exactly, at which point these aliases become dead weight and can be deleted.
const HC_NAME_ALIASES: Record<string, string> = {
  "routine-checklist": "routine",
  "cron-ops-scheduler": "cron-ops",
}

// The repo label plus the job's own label (its Healthchecks slug, already a clean dash-case name
// like job-scraper or medication-reminders), so an incident is filterable by repo AND by exactly
// which job broke. A fleet repo with one job (mirror-ops, meta-mirror) has the same name for both,
// which de-dupes to one label. A Better Stack site-down alert has no job, only the portfolio repo.
//
// Healthchecks sends the check's real display name, which is spaced/title-case ("Vault expiry
// check", "Medication reminders"), not the dash-case hcSlug ("vault-expiry-check") CONTROL_JOBS
// uses - only single-word or already-hyphenated names (reminders, mirror-ops) ever matched before
// this normalised whitespace to dashes, so every multi-word check permanently lost its label.
export function labelsForCheckName(checkName: string, source: string): string[] {
  const rawSlug = checkName.trim().toLowerCase().replace(/\s+/g, "-")
  const slug = HC_NAME_ALIASES[rawSlug] ?? rawSlug
  const repo = HC_NAME_TO_REPO_LABEL[slug]
  if (repo) return [...new Set([repo, slug])]
  if (source === "better-stack") return [shortRepoName(PORTFOLIO_REPO)]
  return []
}

export const CATEGORY_LABEL_COLOURS: Record<string, string> = {
  health: "#eb5757",
  career: "#26b5ce",
  application: "#5e6ad2",
  university: "#f2994a",
  ...Object.fromEntries(Object.entries(REPO_LABELS).map(([repo, v]) => [shortRepoName(repo), v.color])),
}

// Labels are cached per team for the life of the warm instance; a label created by an earlier
// request in the same instance is found on the next lookup instead of hitting the API again.
const labelCache = new Map<string, string>()

async function findOrCreateLabel(apiKey: string, teamId: string, name: string): Promise<string | null> {
  const cacheKey = `${teamId}:${name}`
  const cached = labelCache.get(cacheKey)
  if (cached) return cached

  const existing = await gql<{ team?: { labels?: { nodes: { id: string; name: string }[] } } }>(
    apiKey,
    `query TeamLabels($teamId: String!) { team(id: $teamId) { labels(first: 250) { nodes { id name } } } }`,
    { teamId },
  )
  const found = existing?.team?.labels?.nodes.find((l) => l.name.toLowerCase() === name.toLowerCase())
  if (found) {
    labelCache.set(cacheKey, found.id)
    return found.id
  }

  const created = await gql<{ issueLabelCreate?: { success: boolean; issueLabel?: { id: string } } }>(
    apiKey,
    `mutation CreateLabel($teamId: String!, $name: String!, $color: String!) {
      issueLabelCreate(input: { teamId: $teamId, name: $name, color: $color }) {
        success
        issueLabel { id }
      }
    }`,
    { teamId, name, color: CATEGORY_LABEL_COLOURS[name] ?? "#9ca3af" },
  )
  const id = created?.issueLabelCreate?.issueLabel?.id ?? null
  if (id) labelCache.set(cacheKey, id)
  return id
}

// Resolves every named label for a team in parallel, skipping any name that fails to find or
// create rather than failing the whole issue - a missing label must never block filing an issue.
export async function resolveLabelIds(apiKey: string, teamId: string, names: string[]): Promise<string[]> {
  const ids = await Promise.all(names.map((name) => findOrCreateLabel(apiKey, teamId, name)))
  return ids.filter((id): id is string => Boolean(id))
}
