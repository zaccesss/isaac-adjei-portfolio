// I run this daily via Vercel Cron to permanently remove trash items whose expires_at
// has passed. The 7-day window is set when items are moved to trash, so this route just
// deletes whatever the DB says is expired. Authenticated by CRON_SECRET only.
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
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
