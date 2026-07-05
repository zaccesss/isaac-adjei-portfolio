// I run this daily via Vercel Cron to permanently remove trash items whose expires_at
// has passed. The 7-day window is set when items are moved to trash, so this route just
// deletes whatever the DB says is expired. Authenticated by CRON_SECRET only.
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { pingHealthcheck } from "@/lib/healthcheck-ping"
import { isLondonTime } from "@/lib/london-time"
export async function GET(req: Request) {
  // I reject when CRON_SECRET is unset so a request with "Bearer undefined" can never match.
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 401 })
  }
  const auth = req.headers.get("Authorization")
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  // Two crons (a GMT and a BST branch) hit this route; act only at 03:00 UK. No idempotency claim is
  // needed - deleting already-expired rows is naturally idempotent, so a repeat run is a harmless no-op.
  if (!isLondonTime(3)) {
    return NextResponse.json({ skipped: "not 03:00 UK" })
  }

  const { error, count } = await supabase
    .from("trash")
    .delete({ count: "exact" })
    .lt("expires_at", new Date().toISOString())

  if (error) {
    console.error("[trash-cleanup]", error.message)
    await pingHealthcheck("trash-cleanup", "fail")
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Self-prune the cron_runs idempotency ledger (migration 043) so it never grows unbounded.
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { error: pruneError } = await supabase.from("cron_runs").delete().lt("run_date", cutoff)
  if (pruneError) console.error("[trash-cleanup] cron_runs prune", pruneError.message)

  await pingHealthcheck("trash-cleanup")
  return NextResponse.json({ deleted: count ?? 0 })
}
