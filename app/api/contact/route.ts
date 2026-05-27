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

// I add Cache-Control: no-store to every response so Vercel's edge cache and the browser
// never cache API responses that carry user-facing error messages or success state.
function json(body: unknown, init?: ResponseInit): NextResponse {
  return json(body, {
    ...init,
    headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) },
  })
}

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

// Strip angle-bracket tags so email bodies cannot carry HTML injection into Resend-rendered HTML.
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim()
}

export async function POST(request: Request) {
  try {
    // Vercel sets x-forwarded-for; first hop is the client IP for rate limiting.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

    // Rate limit - wrapped in its own try-catch so an Upstash outage never
    // blocks legitimate submissions
    if (ratelimit) {
      try {
        const { success } = await ratelimit.limit(ip)
        if (!success) {
          return json(
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

    // Honeypot: bots often fill every input; real users never see this field. Return 200 so bots do not learn the field name.
    if (_hp) {
      return json({ success: true })
    }

    // Turnstile: optional server-side check when TURNSTILE_SECRET_KEY is set.
    // The widget can show "Success" while siteverify still fails (wrong hostname, expired token, etc.) - those cases return 400 below.
    // Network errors talking to Cloudflare are caught so a brief outage does not block real users.
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      if (!turnstileToken) {
        return json({ error: "Please complete the verification." }, { status: 400 })
      }
      try {
        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
          signal: AbortSignal.timeout(5000),
        })
        const verifyData = (await verifyRes.json()) as {
          success?: boolean
          "error-codes"?: string[]
        }
        if (!verifyData.success) {
          // Cloudflare documents these codes: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
          const codes = verifyData["error-codes"] ?? []
          console.error("Turnstile siteverify failed:", codes)

          let message = "Verification failed. Please complete the check again and send."
          if (codes.includes("hostname-mismatch")) {
            message =
              "Captcha domain mismatch. In Cloudflare Turnstile, add both isaacadjei.me and www.isaacadjei.me to the widget hostnames."
          } else if (
            codes.includes("timeout-or-duplicate") ||
            codes.includes("invalid-input-response")
          ) {
            message = "Captcha expired or was already used. Please verify again, then send."
          } else if (
            codes.includes("invalid-input-secret") ||
            codes.includes("missing-input-secret")
          ) {
            message = "Server captcha configuration error."
          }
          return json({ error: message }, { status: 400 })
        }
      } catch (tsErr) {
        // I allow the request through when Turnstile's siteverify endpoint is unreachable.
        // A Cloudflare outage should not block legitimate contact form submissions, and
        // the rate limiter plus honeypot still provide a baseline defence layer.
        console.error("Turnstile verification failed, allowing request:", tsErr)
      }
    }

    // Input validation - mirror client `required` so direct API calls cannot bypass the form.
    if (!name || !email || !subject || !message) {
      return json({ error: "All fields are required." }, { status: 400 })
    }
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return json({ error: "Input too long." }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return json({ error: "Invalid email address." }, { status: 400 })
    }

    // Sanitise after length checks so we do not strip then accidentally shorten past limits.
    const safeName = stripHtml(name)
    const safeEmail = stripHtml(email)
    const safeSubject = stripHtml(subject)
    const safeMessage = stripHtml(message)

    // Resend is optional in dev: without a key we log the payload and return success so local testing still works.
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log("Contact form submission (no RESEND_API_KEY):", {
        safeName,
        safeEmail,
        safeSubject,
        safeMessage,
      })
      return json({ success: true })
    }

    // 8s cap so a stuck Resend connection does not leave the serverless function hanging until platform timeout.
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
      // Resend returns a JSON error body; log the raw text for Vercel diagnostics.
      const error = await res.text()
      console.error("Resend error:", res.status, error)
      return json({ error: "Failed to send message." }, { status: 500 })
    }

    return json({ success: true })
  } catch (err) {
    // Malformed JSON, AbortSignal timeout on fetch, or unexpected runtime errors.
    console.error("Contact route error:", err)
    return json({ error: "Something went wrong." }, { status: 500 })
  }
}
