// I run this daily via Vercel Cron to permanently remove trash items whose expires_at
// has passed. The 7-day window is set when items are moved to trash, so this route just
// deletes whatever the DB says is expired. Authenticated by CRON_SECRET only.
import { NextResponse } from "next/server"
import { secretEquals } from "@/lib/secure-compare"
import { supabase } from "@/lib/supabase"
import { purgeSoftDeleted } from "@/lib/trash"
import { pingHealthcheck } from "@/lib/healthcheck-ping"
import { isLondonTime } from "@/lib/london-time"
export async function GET(req: Request) {
  // I reject when CRON_SECRET is unset so a request with "Bearer undefined" can never match.
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 401 })
  }
  const auth = req.headers.get("Authorization")
  if (!secretEquals(auth, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  // Two crons (a GMT and a BST branch) hit this route; act only at 03:00 UK. No idempotency claim is
  // needed - deleting already-expired rows is naturally idempotent, so a repeat run is a harmless no-op.
  if (!isLondonTime(3)) {
    return NextResponse.json({ skipped: "not 03:00 UK" })
  }

  // Expired entries are processed like permanentlyDelete, not just dropped: a soft-deleted row
  // (calendar events, files) must be hard-deleted with its Storage blob, or it lingers hidden
  // forever once its trash handle is gone. Batched reads because PostgREST caps at 1000 rows;
  // an entry whose purge fails is kept (its trash row is the only handle) and retried tomorrow.
  let deleted = 0
  let purgeFailures = 0
  for (let batch = 0; batch < 40; batch++) {
    const { data: expired, error: readErr } = await supabase
      .from("trash")
      .select("id, table_name, original_id, data")
      .lt("expires_at", new Date().toISOString())
      .limit(500)
    if (readErr) {
      console.error("[trash-cleanup]", readErr.message)
      await pingHealthcheck("trash-cleanup", "fail")
      return NextResponse.json({ error: readErr.message }, { status: 500 })
    }
    if (!expired || expired.length === 0) break

    const deletable: string[] = []
    for (const item of expired) {
      const purgeErr = await purgeSoftDeleted(item)
      if (purgeErr) {
        purgeFailures++
        console.error("[trash-cleanup] purge", item.table_name, item.original_id, purgeErr)
        continue
      }
      deletable.push(item.id)
    }
    if (deletable.length === 0) break

    const { error: delErr } = await supabase.from("trash").delete().in("id", deletable)
    if (delErr) {
      console.error("[trash-cleanup]", delErr.message)
      await pingHealthcheck("trash-cleanup", "fail")
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }
    deleted += deletable.length
    if (expired.length < 500) break
  }

  if (purgeFailures > 0) {
    await pingHealthcheck("trash-cleanup", "fail")
    return NextResponse.json({ deleted, purge_failures: purgeFailures }, { status: 500 })
  }

  // Self-prune the cron_runs idempotency ledger (migration 044) so it never grows unbounded.
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { error: pruneError } = await supabase.from("cron_runs").delete().lt("run_date", cutoff)
  if (pruneError) console.error("[trash-cleanup] cron_runs prune", pruneError.message)

  await pingHealthcheck("trash-cleanup")
  return NextResponse.json({ deleted })
}
