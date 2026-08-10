// API route that handles newsletter subscriptions via Beehiiv.
// I add rate limiting here to prevent bulk subscription abuse and to protect the
// Beehiiv API quota. The limit is 3 requests per IP per hour - generous for a genuine
// user but enough to stop automated attempts. The window is intentionally looser than
// the contact form (1 hour vs 10 minutes) because a genuine user is unlikely to try
// more than once, so the threshold only triggers on automation.

import { NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// I add Cache-Control: no-store to every response so Vercel's edge cache and the browser
// never cache API responses that carry user-facing error messages or success state.
function json(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) },
  })
}

// I initialise the rate limiter at module level so the Redis connection is reused across
// warm invocations. The try-catch means a misconfigured Upstash env or a Redis outage
// leaves ratelimit as null and the check is skipped gracefully.
let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "newsletter_rl",
    })
  } catch (e) {
    console.error("Newsletter ratelimit init failed:", e)
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

    if (ratelimit) {
      try {
        const { success } = await ratelimit.limit(ip)
        if (!success) {
          return json({ error: "Too many requests. Please try again later." }, { status: 429 })
        }
      } catch (rlErr) {
        console.error("Newsletter rate limit check failed, allowing request:", rlErr)
      }
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return json({ error: "Email is required." }, { status: 400 })
    }
    if (email.length > 254) {
      return json({ error: "Invalid email address." }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return json({ error: "Invalid email address." }, { status: 400 })
    }

    const apiKey = process.env.BEEHIIV_API_KEY
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID

    if (!apiKey || !publicationId) {
      console.error("Beehiiv env vars not set")
      return json({ error: "Newsletter service unavailable." }, { status: 500 })
    }

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
        }),
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      console.error("Beehiiv error:", res.status, error)
      return json({ error: "Failed to subscribe. Please try again." }, { status: 500 })
    }

    return json({ success: true })
  } catch (err) {
    console.error("Newsletter route error:", err)
    return json({ error: "Something went wrong." }, { status: 500 })
  }
}
