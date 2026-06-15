// Cron route that checks how old the ps5:last-known Redis key is.
// I send an email reminder when the data is 50+ days old because the NPSSO session
// cookie expires after 60 days, so that gives a 10-day window to renew before the
// Cloudflare Worker stops being able to read PSN presence.
import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// I warn at 50 days so there is a 10-day window to renew before the 60-day expiry
const WARN_AFTER_DAYS = 50

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not set" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorised" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  try {
    // I check when the ps5:status key was last written using the last-known fallback
    // which has no TTL so I can always read the lastSeen timestamp even when the PS5 is off
    type PS5Payload = { lastSeen: string }
    const lastKnown = await redis.get<PS5Payload>("ps5:last-known")

    const apiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.DIGEST_EMAIL

    if (!lastKnown) {
      // no data at all - the worker has never written or the key was manually deleted
      await sendAlert(apiKey, toEmail, null)
      return NextResponse.json(
        { ok: true, alerted: true, reason: "ps5:last-known key missing" },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const lastSeen = new Date(lastKnown.lastSeen)
    const ageMs = Date.now() - lastSeen.getTime()
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))

    if (ageDays >= WARN_AFTER_DAYS) {
      await sendAlert(apiKey, toEmail, ageDays)
      return NextResponse.json(
        { ok: true, alerted: true, ageDays },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      { ok: true, alerted: false, ageDays },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("PS5 NPSSO check error:", err)
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}

async function sendAlert(apiKey: string | undefined, toEmail: string | undefined, ageDays: number | null) {
  if (!apiKey || !toEmail) return

  const subject = "Action required: renew your PS5 NPSSO token"
  const body = ageDays === null
    ? `<p>Your PS5 presence data has gone missing from Redis. The Cloudflare Worker may have stopped or the NPSSO token has expired.</p><p>Log in to <a href="https://www.playstation.com">playstation.com</a>, open DevTools, go to Cookies and copy the <strong>npsso</strong> value. Then update the <code>PSN_NPSSO</code> secret in your Cloudflare Worker.</p>`
    : `<p>Your PS5 last-known data is <strong>${ageDays} days old</strong>. The NPSSO session token expires after 60 days of inactivity - you have roughly ${60 - ageDays} days left.</p><p>Log in to <a href="https://www.playstation.com">playstation.com</a>, open DevTools, go to Cookies and copy the <strong>npsso</strong> value. Then update the <code>PSN_NPSSO</code> secret in your Cloudflare Worker before it expires.</p>`

  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2>PS5 NPSSO renewal reminder</h2>${body}<hr><p style="color:#666;font-size:12px">Sent by isaacadjei.me dashboard cron</p></body></html>`

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "My Dashboard <contact@isaacadjei.me>",
      to: [toEmail],
      subject,
      html,
    }),
  })
}
