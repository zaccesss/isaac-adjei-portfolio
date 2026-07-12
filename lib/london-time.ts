// Europe/London wall-clock helpers, DST-correct. Neither Vercel Cron nor GitHub Actions observes
// British Summer Time - crons are always UTC - so each time-pinned job fires from TWO crons (a GMT
// branch and a BST branch, one hour apart) and uses these helpers to act only at the intended London
// hour, exiting quietly otherwise. That holds a fixed UK wall-clock time year round without the crons
// themselves knowing about BST. The paired crons live in vercel.json; see routine.mjs for the same
// pattern in the automations repo.
import { supabase } from "@/lib/supabase"

export type LondonParts = { weekday: string; hour: number; date: string }

const PARTS_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "short", // "Mon".."Sun"
  hour: "2-digit",
  hour12: false,
})

const DATE_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London", // en-CA yields YYYY-MM-DD
})

// London weekday ("Mon".."Sun"), hour (0..23) and ISO date (YYYY-MM-DD) for the given instant (default now).
export function london(date: Date = new Date()): LondonParts {
  const parts = PARTS_FMT.formatToParts(date)
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? ""
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24 // some engines emit "24" at midnight
  return { weekday, hour, date: DATE_FMT.format(date) }
}

// The gate used by cron routes: true only when it is `hour` in London (and `weekday`, if given).
// The paired GMT/BST crons are arranged so exactly one of them satisfies this per intended run.
export function isLondonTime(hour: number, weekday?: string, date: Date = new Date()): boolean {
  const p = london(date)
  return p.hour === hour && (weekday === undefined || p.weekday === weekday)
}

// Idempotency claim backed by the cron_runs table (migration 044). Atomically claims (job, London-day)
// and returns true only for the first caller that day, so a delayed duplicate cron run cannot re-send.
// `on_conflict=job,run_date` + `ignoreDuplicates` makes the insert a no-op on the second call: the
// returned rows are empty, so we report "already ran". Any DB error is treated as "already ran" so a
// transient failure never causes a double-send. Pure syncs/cleanups do not need this.
export async function claimCronRun(job: string, date: Date = new Date()): Promise<boolean> {
  const run_date = london(date).date
  const { data, error } = await supabase
    .from("cron_runs")
    .upsert({ job, run_date }, { onConflict: "job,run_date", ignoreDuplicates: true })
    .select("job")
  if (error) {
    console.error("[claimCronRun]", job, error.message)
    return false
  }
  return (data?.length ?? 0) > 0
}
