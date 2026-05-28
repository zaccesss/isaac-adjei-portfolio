import { NextRequest, NextResponse } from "next/server"
import { sendDiscordDigest } from "@/lib/send-discord-digest"

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

  const result = await sendDiscordDigest()
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
