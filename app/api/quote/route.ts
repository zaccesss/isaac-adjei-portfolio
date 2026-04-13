import { NextResponse } from "next/server"

export const revalidate = 0

export async function GET() {
  try {
    const res = await fetch("https://zenquotes.io/api/random", {
      next: { revalidate: 0 },
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
