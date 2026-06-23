import { NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { auth } from "@/auth"

// TEMPORARY verification endpoint, owner only. Hitting it while logged in sends a single test exception to
// Sentry so I can confirm capture and the Sentry -> Linear integration end to end. It does not crash
// anything. Remove this route once verified.
export const runtime = "nodejs"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: { "Cache-Control": "no-store" } })

  Sentry.captureException(new Error("Sentry test event from /api/dashboard/sentry-test"))
  await Sentry.flush(2000)

  return NextResponse.json(
    {
      sent: Boolean(process.env.SENTRY_DSN),
      note: process.env.SENTRY_DSN
        ? "Sent a test exception. Check Sentry Issues, then your Linear team for the new issue."
        : "SENTRY_DSN is not set in this environment, so nothing was sent.",
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
