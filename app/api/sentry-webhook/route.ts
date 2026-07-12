// Relay for Sentry alerts into the #errors Discord channel. Sentry's free plan does not include the
// native Discord integration, but a Custom Integration can POST here on an issue alert; this route
// verifies Sentry's signature and reposts a compact message through the existing Discord webhook.
// Sentry's own payload shape does not match Discord's, which is why the translation lives here.
import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { postDiscordWebhook } from "@/lib/discord-webhook"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

// Sentry signs the raw body with the Custom Integration's client secret (HMAC-SHA256, hex) in the
// sentry-hook-signature header. Constant-time compare so the check leaks nothing.
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest()
  const given = Buffer.from(signature, "hex")
  return given.length === expected.length && timingSafeEqual(given, expected)
}

const asStr = (v: unknown): string => (typeof v === "string" ? v : "")

// error/fatal red, warning amber, info blue, else grey.
function levelColour(level: string): number {
  if (level === "error" || level === "fatal") return 0xe74c3c
  if (level === "warning") return 0xf39c12
  if (level === "info") return 0x3498db
  return 0x95a5a6
}

export async function POST(req: NextRequest) {
  const secret = process.env.SENTRY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "sentry webhook not configured" }, { status: 503, headers: NO_STORE })
  }

  const rawBody = await req.text()
  if (!verifySignature(rawBody, req.headers.get("sentry-hook-signature"), secret)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401, headers: NO_STORE })
  }

  let payload: { action?: string; data?: Record<string, unknown> }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400, headers: NO_STORE })
  }

  // Sentry pings this once when the integration is installed (resource "installation"). Acknowledge
  // it without posting, so the install succeeds and only real alerts reach Discord.
  const resource = req.headers.get("sentry-hook-resource")
  if (resource === "installation") {
    return NextResponse.json({ ok: true, action: "installation-ack" }, { status: 200, headers: NO_STORE })
  }

  // An issue alert carries the details under data.event; an issue-state webhook under data.issue.
  const data = payload.data ?? {}
  const item = (data.event ?? data.issue ?? {}) as Record<string, unknown>
  const title = asStr(item.title) || asStr(item.metadata && (item.metadata as Record<string, unknown>).value) || "Sentry alert"
  const level = asStr(item.level) || "error"
  const culprit = asStr(item.culprit) || asStr(item.transaction)
  const environment = asStr(item.environment)
  const url = asStr(item.web_url) || asStr(item.issue_url) || asStr(item.permalink)

  const webhookUrl = process.env.DISCORD_WEBHOOK_ERRORS ?? process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    // Nothing to send to - acknowledge so Sentry does not retry-storm.
    return NextResponse.json({ ok: false, action: "no-webhook" }, { status: 200, headers: NO_STORE })
  }

  const fields = [
    { name: "Level", value: level, inline: true },
    environment ? { name: "Environment", value: environment, inline: true } : null,
    culprit ? { name: "Where", value: culprit.slice(0, 256), inline: false } : null,
  ].filter(Boolean)

  const embed = {
    title: `\u{1F41B} Sentry: ${title.slice(0, 240)}`,
    ...(url ? { url } : {}),
    color: levelColour(level),
    fields,
    footer: { text: "Sentry" },
    timestamp: new Date().toISOString(),
  }

  const result = await postDiscordWebhook(webhookUrl, { embeds: [embed] }, "sentry")
  return NextResponse.json({ ok: result.ok, action: "forwarded" }, { status: 200, headers: NO_STORE })
}
