// API route that fetches a random inspirational quote from ZenQuotes.
// No server-side cache so the quote changes on every request/refresh.
// A 4-second timeout ensures the fallback returns immediately if ZenQuotes
// is slow, so the UI never hangs waiting.

import { NextResponse } from "next/server"
import { heavyApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"

export const revalidate = 0

export async function GET(req: Request) {
  if (!await checkRateLimit(heavyApiLimiter, getIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  try {
    const res = await fetch("https://zenquotes.io/api/random", {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(4000),
    })

    if (!res.ok) throw new Error("ZenQuotes fetch failed")

    const data = await res.json()
    const { q: quote, a: author } = data[0]

    return NextResponse.json({ quote, author })
  } catch {
    // Fallback quote if API is down
    return NextResponse.json({
      quote: "Engineering that thinks. Technology that serves. Growth as a lifestyle.",
      author: "Isaac Adjei",
    })
  }
}
