// API route that fetches a random inspirational quote from ZenQuotes.
// Cached for 30 minutes (1800s) to avoid hitting the external API on every
// page load — the fallback quote is returned if the API is down or slow.

import { NextResponse } from "next/server"

export const revalidate = 1800

export async function GET() {
  try {
    const res = await fetch("https://zenquotes.io/api/random", {
      next: { revalidate: 1800 },
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
