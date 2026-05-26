import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { sendWeeklyDigest } from "@/lib/send-weekly-digest"

// I act as a thin authenticated wrapper so the browser never needs to know the CRON_SECRET.
// I call the shared helper directly rather than making an internal HTTP fetch, which was
// silently failing on Vercel due to header stripping on custom domain redirects.
export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const result = await sendWeeklyDigest()
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
