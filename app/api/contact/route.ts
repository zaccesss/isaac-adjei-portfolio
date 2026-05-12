// API route that handles contact form submissions.
// Security layers applied in order:
// 1. IP-based rate limiting via Upstash Redis - fails gracefully if Redis is unavailable
// 2. Honeypot check - if the hidden _hp field is filled, silently succeed
// 3. Cloudflare Turnstile verification - fails gracefully if Cloudflare is unreachable
// 4. Input validation - required fields, length limits, email format
// 5. HTML stripping - removes any injected markup before including in the email
// Email is sent via the Resend API using contact@isaacadjei.me.

import { NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Rate limiter - only initialised when Upstash env vars are present.
// If Redis is unavailable at request time the check is skipped so the form
// still works; Turnstile CAPTCHA remains as the bot-protection layer.
let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "10 m"),
      prefix: "contact_rl",
    })
  } catch (e) {
    console.error("Ratelimit init failed:", e)
  }
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim()
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

    // Rate limit - wrapped in its own try-catch so an Upstash outage never
    // blocks legitimate submissions
    if (ratelimit) {
      try {
        const { success } = await ratelimit.limit(ip)
        if (!success) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
          )
        }
      } catch (rlErr) {
        console.error("Rate limit check failed, allowing request:", rlErr)
      }
    }

    const body = await request.json()
    const { name, email, subject, message, _hp, turnstileToken } = body

    // Honeypot
    if (_hp) {
      return NextResponse.json({ success: true })
    }

    // Turnstile - wrapped so a Cloudflare API blip never blocks the form
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json({ error: "Please complete the verification." }, { status: 400 })
      }
      try {
        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
          signal: AbortSignal.timeout(5000),
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
          return NextResponse.json(
            { error: "Verification failed. Please try again." },
            { status: 400 }
          )
        }
      } catch (tsErr) {
        console.error("Turnstile verification failed, allowing request:", tsErr)
      }
    }

    // Input validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: "Input too long." }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

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
        from: "Portfolio Contact <contact@isaacadjei.me>",
        to: ["contact@isaacadjei.me"],
        reply_to: safeEmail,
        subject: `[Portfolio] ${safeSubject}`,
        html: `
          <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr />
          <p>${safeMessage.replace(/\n/g, "<br />")}</p>
        `,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error("Resend error:", res.status, error)
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact route error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
