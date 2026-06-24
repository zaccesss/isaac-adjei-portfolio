// Webhook external monitors POST to when something breaks - a dead cron from Healthchecks, or the site
// down from Better Stack. It verifies a shared secret (INCIDENT_WEBHOOK_SECRET, passed as ?secret= in
// the webhook URL or an x-incident-secret header) then opens an urgent Linear issue, so every incident
// lands in the ops backlog. Guarded: with no secret or no Linear key it returns a clean 503 instead of
// doing anything. Rate-limited as a public POST endpoint.
import { NextRequest, NextResponse } from "next/server"
import { createIncidentIssue } from "@/lib/incident"
import { heavyApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

export async function POST(req: NextRequest) {
  const secret = process.env.INCIDENT_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "incident webhook not configured" }, { status: 503, headers: NO_STORE })
  }

  const provided = req.nextUrl.searchParams.get("secret") || req.headers.get("x-incident-secret")
  if (provided !== secret) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401, headers: NO_STORE })
  }

  if (!(await checkRateLimit(heavyApiLimiter, getIp(req)))) {
    return NextResponse.json({ error: "rate limited" }, { status: 429, headers: NO_STORE })
  }

  // The monitors send different payload shapes, so I read a name field for the title where present and
  // fall back to the raw body for the description. A parse failure still files a bare incident.
  let title = "Incident reported"
  let detail = ""
  try {
    const contentType = req.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>
      title = pickTitle(body) ?? title
      detail = "```json\n" + JSON.stringify(body, null, 2).slice(0, 3000) + "\n```"
    } else {
      const text = await req.text()
      if (text) detail = text.slice(0, 3000)
    }
  } catch {
    // ignore parse errors - still file a bare incident so nothing is missed
  }

  const source = req.nextUrl.searchParams.get("source") || "monitor"
  const description = `Reported by **${source}** at ${new Date().toISOString()}\n\n${detail}`.trim()

  const issueId = await createIncidentIssue(title, description)
  return NextResponse.json(
    { ok: Boolean(issueId), issueId },
    { status: issueId ? 200 : 502, headers: NO_STORE },
  )
}

// Reads the obvious name fields: Healthchecks ($NAME / check.name) and Better Stack-style payloads.
function pickTitle(body: Record<string, unknown>): string | null {
  const check = body.check as Record<string, unknown> | undefined
  const name = body.name ?? body.check_name ?? check?.name
  if (typeof name === "string" && name.trim()) return `Incident: ${name.trim()}`
  return null
}
