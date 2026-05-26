import { NextRequest, NextResponse } from "next/server"
import { sendWeeklyDigest } from "@/lib/send-weekly-digest"

// I verify the Vercel cron secret so this route cannot be triggered by arbitrary HTTP requests.
// The actual digest logic lives in lib/send-weekly-digest.ts so it can also be called directly
// from trigger-digest without going through this HTTP endpoint.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not set in environment" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorised: invalid CRON_SECRET" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  const result = await sendWeeklyDigest()
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
