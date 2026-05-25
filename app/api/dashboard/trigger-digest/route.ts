import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

// I act as a thin authenticated wrapper around the weekly-digest route so the browser
// never needs to know the CRON_SECRET value
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 })

  // I use req.nextUrl.origin instead of process.env.NEXTAUTH_URL so the request
  // always targets the same host that received it - this fixes the issue where
  // the env var was unset on preview deployments.
  const res = await fetch(`${req.nextUrl.origin}/api/dashboard/weekly-digest`, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
