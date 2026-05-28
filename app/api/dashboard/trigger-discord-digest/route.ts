import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { sendDiscordDigest } from "@/lib/send-discord-digest"

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const result = await sendDiscordDigest()
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
