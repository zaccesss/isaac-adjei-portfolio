import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Runs daily via Vercel cron. Permanently removes trash items older than 7 days.
export async function GET(req: Request) {
  const auth = req.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { error, count } = await supabase
    .from("trash")
    .delete({ count: "exact" })
    .lt("expires_at", new Date().toISOString())

  if (error) {
    console.error("[trash-cleanup]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`[trash-cleanup] deleted ${count ?? 0} expired item(s)`)
  return NextResponse.json({ deleted: count ?? 0 })
}
