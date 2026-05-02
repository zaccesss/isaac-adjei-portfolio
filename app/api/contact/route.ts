// API route that handles contact form submissions.
// Security layers applied in order:
// 1. IP-based rate limiting - max 3 submissions per 10 minutes per IP
//    Uses Upstash Redis (persistent, shared across all Vercel serverless instances).
//    The previous in-memory Map approach reset on every cold-start and was not shared
//    across concurrent function instances - making it ineffective on Vercel.
//    Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
//    Falls back gracefully to allowing the request if the env vars are missing (e.g. local dev).
// 2. Honeypot check - if the hidden _hp field is filled in, silently succeed (fool the bot)
// 3. Cloudflare Turnstile verification - confirms the user passed the CAPTCHA
// 4. Input validation - required fields, length limits, email format
// 5. HTML stripping - removes any injected markup before including text in the email
// Email is sent via the Resend API. If RESEND_API_KEY is not set, the submission is
// logged to the console instead (useful for local development).

import { NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ─── Rate limiter setup ──────────────────────────────────────────────────────
// Upstash Redis is used so the rate limit state persists across cold-starts and
// is shared between all concurrent serverless function instances on Vercel.
// Sliding window algorithm: allows up to 3 requests per 10-minute window per IP.
// If the Redis env vars are not set (local dev / CI), ratelimit is null and all
// requests are allowed through - the Turnstile CAPTCHA still protects the route.
let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    prefix: "contact_rl", // namespace the keys so they don't clash with other limiters
  })
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim()
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

    // Rate limit check - only enforced when Upstash env vars are present
    if (ratelimit) {
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        )
      }
    }

    const body = await request.json()
    const { name, email, subject, message, _hp, turnstileToken } = body

    // Honeypot check - bots fill this, humans don't
    if (_hp) {
      return NextResponse.json({ success: true })
    }

    // Turnstile verification
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json({ error: "Please complete the verification." }, { status: 400 })
      }
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return NextResponse.json(
          { error: "Verification failed. Please try again." },
          { status: 400 }
        )
      }
    }

    // Required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    // Length limits
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: "Input too long." }, { status: 400 })
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    // Sanitise inputs
    const safeName = stripHtml(name)
    const safeEmail = stripHtml(email)
    const safeSubject = stripHtml(subject)
    const safeMessage = stripHtml(message)

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log("Contact form submission (no RESEND_API_KEY):", {
        safeName,
        safeEmail,
        safeSubject,
        safeMessage,
      })
      return NextResponse.json({ success: true })
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Portfolio Contact <contact@zacess.com>",
        to: ["contact@zacess.com"],
        reply_to: safeEmail,
        subject: `[Portfolio] ${safeSubject}`,
        html: `
          <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr />
          <p>${safeMessage.replace(/\n/g, "<br />")}</p>
        `,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact route error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
