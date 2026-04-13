import { NextResponse } from "next/server"

// In-memory rate limit store: ip -> { count, resetAt }
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim()
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

    // Rate limit check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, subject, message, _hp } = body

    // Honeypot check - bots fill this, humans don't
    if (_hp) {
      return NextResponse.json({ success: true })
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
      console.log("Contact form submission (no RESEND_API_KEY):", { safeName, safeEmail, safeSubject, safeMessage })
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
