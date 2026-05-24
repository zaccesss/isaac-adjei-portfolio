import { auth } from "@/auth"
import { NextResponse } from "next/server"

// I act as a thin authenticated wrapper around the weekly-digest route so the browser
// never needs to know the CRON_SECRET value
export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 })

  // I call the GET variant of the digest route since that is the handler that builds and sends the email
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/dashboard/weekly-digest`, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
