// Webhook external monitors POST to when something breaks or recovers - a dead cron from Healthchecks,
// or the site down from Better Stack. It verifies a shared secret (INCIDENT_WEBHOOK_SECRET, sent as an
// x-incident-secret header - never in the URL, where it would land in logs), then opens an urgent Linear issue on a
// down and resolves the same issue on the matching up, so every incident lands in the ops backlog and
// closes itself when the check is healthy again. A flapping check updates one issue instead of filing a
// new one each dip. Guarded: with no secret or no Linear key it returns a clean 503 instead of doing
// anything. Rate-limited as a public POST endpoint.
import { NextRequest, NextResponse } from "next/server"
import {
  createIncidentIssue,
  findOpenIncidentId,
  addIncidentComment,
  resolveIncident,
} from "@/lib/incident"
import { heavyApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"
import { secretEquals } from "@/lib/secure-compare"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

const asStr = (v: unknown): string => (typeof v === "string" ? v.trim() : "")

export async function POST(req: NextRequest) {
  const secret = process.env.INCIDENT_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "incident webhook not configured" }, { status: 503, headers: NO_STORE })
  }

  const provided = req.headers.get("x-incident-secret")
  if (!secretEquals(provided, secret)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401, headers: NO_STORE })
  }

  if (!(await checkRateLimit(heavyApiLimiter, getIp(req)))) {
    return NextResponse.json({ error: "rate limited" }, { status: 429, headers: NO_STORE })
  }

  // The monitors send different payload shapes, so I read the check name, status and tags where present
  // and keep the raw body as a fallback detail. A parse failure still files a bare incident.
  let name = ""
  let status = ""
  let tags = ""
  let rawDetail = ""
  try {
    const contentType = req.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>
      const check = body.check as Record<string, unknown> | undefined
      name = asStr(body.name) || asStr(body.check_name) || asStr(check?.name)
      status = (asStr(body.status) || asStr(check?.status)).toLowerCase()
      tags = asStr(body.tags) || asStr(check?.tags)
    } else {
      rawDetail = (await req.text()).slice(0, 2000)
    }
  } catch {
    // ignore parse errors - still file a bare incident so nothing is missed
  }

  const source = req.nextUrl.searchParams.get("source") || "monitor"
  const now = new Date().toISOString()

  // A recovery (up): resolve the matching open incident rather than opening a new one. The lookup
  // is on the exact title this route creates, so "api" can never match "api-backup is down".
  if (status === "up" && name) {
    const openId = await findOpenIncidentId(`${name} is down`)
    if (openId) {
      const resolved = await resolveIncident(openId, `**${name}** recovered (${source}, ${now}).`)
      return NextResponse.json({ ok: resolved, action: "resolved", issueId: openId }, { status: 200, headers: NO_STORE })
    }
    return NextResponse.json({ ok: true, action: "no-open-incident" }, { status: 200, headers: NO_STORE })
  }

  // Otherwise it is a down (or an unlabelled alert): open an incident, or update the open one if this
  // check is already down, so a flap does not stack duplicates.
  const title = name ? `${name} is down` : "Incident reported"
  const description = [
    name ? `**${name}** is **down**.` : "A monitored check reported an incident.",
    `Reported by **${source}** at ${now}.`,
    tags ? `Tags: \`${tags}\`` : "",
    rawDetail ? `\n\`\`\`\n${rawDetail}\n\`\`\`` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim()

  if (name) {
    const openId = await findOpenIncidentId(title)
    if (openId) {
      await addIncidentComment(openId, `Still down (${source}, ${now}).`)
      return NextResponse.json({ ok: true, action: "commented", issueId: openId }, { status: 200, headers: NO_STORE })
    }
  }

  const issueId = await createIncidentIssue(title, description)
  return NextResponse.json(
    { ok: Boolean(issueId), action: "created", issueId },
    { status: issueId ? 200 : 502, headers: NO_STORE },
  )
}
