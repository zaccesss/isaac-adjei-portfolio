// One place every scheduled Discord webhook send goes through, so a dead or rotated webhook fails LOUDLY
// instead of silently. When a POST does not succeed I capture the FULL failure - HTTP status + statusText,
// Discord's own error code + message from the body, and the raw body - then log it AND open a Linear
// incident, so I find out even if the Healthchecks key is not set, and can tell a deleted webhook from a
// rate limit or a bad payload at a glance. A bare "403" is useless; the body (e.g. code 10015 "Unknown
// Webhook") is what actually tells me what broke. The caller still owns the Healthchecks ping.
import { createIncidentIssue, findOpenIncidentId, addIncidentComment } from "@/lib/incident"

export type DiscordSendResult = { ok: boolean; status?: number; error?: string }

// Files a dead-webhook incident, but dedupes: while an incident for this webhook slug is already open,
// it comments on that one issue instead of filing a fresh duplicate on every failed send. The stable
// "Discord <slug> webhook" key matches both the "failing" and "errored" titles for the same feed.
async function fileDeadWebhookIncident(slug: string, title: string, description: string): Promise<void> {
  try {
    const openId = await findOpenIncidentId(`Discord ${slug} webhook`, "prefix")
    if (openId) {
      await addIncidentComment(openId, `Still failing.\n\n${description}`)
      return
    }
    await createIncidentIssue(title, description)
  } catch {
    // never let incident filing break the send path
  }
}

// Build a full, human-readable failure string from a Discord webhook response. Discord returns a small JSON
// body like {"message":"Unknown Webhook","code":10015} - I surface the code + message AND the raw body.
function describeFailure(status: number, statusText: string, body: string): string {
  let discordCode: number | undefined
  let discordMessage: string | undefined
  try {
    const parsed = JSON.parse(body) as { code?: number; message?: string }
    discordCode = parsed.code
    discordMessage = parsed.message
  } catch {
    // Body was not JSON - fall back to the raw text below.
  }
  const parts = [`HTTP ${status} ${statusText || ""}`.trim()]
  if (discordCode !== undefined || discordMessage) parts.push(`Discord code ${discordCode ?? "?"}: ${discordMessage ?? "?"}`)
  parts.push(`body: ${body ? body.slice(0, 1500) : "(empty)"}`)
  return parts.join(" | ")
}

// slug labels the send in logs + the incident title, e.g. "discord-digest" or "vault-expiry".
export async function postDiscordWebhook(url: string, body: unknown, slug: string): Promise<DiscordSendResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const raw = await res.text().catch(() => "")
      const detail = describeFailure(res.status, res.statusText, raw)
      console.error(`[discord:${slug}] send failed - ${detail}`)
      // A 404 / code 10015 almost always means the webhook was deleted or rotated (e.g. a server
      // restructure). Point the env var at the live webhook in discord-webhooks.json.
      await fileDeadWebhookIncident(
        slug,
        `Discord ${slug} webhook failing (${res.status})`,
        `The ${slug} Discord webhook send did not land, so this feed is dark.\n\n**Full error:** ${detail}\n\n` +
          `If this is a 404 / code 10015 "Unknown Webhook", the webhook was deleted or rotated - repoint the ` +
          `env var to the live webhook (see discord-webhooks.json).`,
      )
      return { ok: false, status: res.status, error: `${slug}: ${detail}` }
    }

    return { ok: true, status: res.status }
  } catch (err) {
    // Network-level failure (DNS, TLS, abort) - there is no response, so surface the thrown error in full.
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error(`[discord:${slug}] send threw - ${detail}`)
    await fileDeadWebhookIncident(
      slug,
      `Discord ${slug} webhook errored`,
      `The ${slug} Discord webhook POST threw before any response.\n\n**Full error:** ${detail}`,
    )
    return { ok: false, error: `${slug}: ${detail}` }
  }
}
