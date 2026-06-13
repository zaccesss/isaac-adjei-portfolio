import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

type DigestRecord = { sentAt: string; status: "success" | "failure" }

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { data } = await supabase
    .from("config")
    .select("key, value")
    .in("key", ["last_weekly_digest", "last_discord_digest"])

  const weekly = data?.find((r) => r.key === "last_weekly_digest")?.value as DigestRecord | undefined
  const discord = data?.find((r) => r.key === "last_discord_digest")?.value as DigestRecord | undefined

  return NextResponse.json(
    {
      weekly: weekly ?? { sentAt: null, status: "unknown" },
      discord: discord ?? { sentAt: null, status: "unknown" },
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
