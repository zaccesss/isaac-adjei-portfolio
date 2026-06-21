import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// Single source of truth for the full personal backup. These are the real table names used
// by the dashboard - the previous list referenced vault_entries/diary_entries/wishlist_items/
// open_source_projects/notes_folders/blog_posts, none of which exist, so those rows were
// silently dropped from every export. (Blog is file-based, not a table; trash + the recycle
// bin are deliberately excluded.)
const EXPORT_TABLES = [
  "goals", "applications", "vault", "diary", "notes", "streaks", "streak_logs",
  "habits", "habit_logs", "contacts", "wishlist", "inventory_items",
  "health_sections", "health_workouts", "health_nutrition", "body_metrics",
  "faith_entries", "study_sessions", "calendar_events", "user_files",
  "uni_modules", "uni_deadlines", "uni_submissions", "uni_notes", "uni_resources",
  "uni_library_books", "modules", "assessments", "opensource_contributions",
  "wakatime_daily", "activity_log",
] as const

// user_files holds only storage metadata (the files live in Supabase Storage, not here),
// and wakatime_daily / activity_log are append-only logs - none are safe to upsert back in.
const NON_IMPORTABLE = new Set<string>(["user_files", "wakatime_daily", "activity_log"])
const IMPORTABLE_TABLES = EXPORT_TABLES.filter((t) => !NON_IMPORTABLE.has(t))

async function q(table: string) {
  const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false })
  return data ?? []
}

export async function GET() {
  // I require an authenticated dashboard session - this endpoint returns the entire personal
  // database, so it must never be reachable without the GitHub session.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const entries = await Promise.all(EXPORT_TABLES.map(async (t) => [t, await q(t)] as const))
  const bundle = {
    exported_at: new Date().toISOString(),
    version: "1.1",
    data: Object.fromEntries(entries),
  }

  const filename = `dashboard-export-${new Date().toISOString().slice(0, 10)}.json`
  return new NextResponse(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}

export async function POST(req: Request) {
  // I require an authenticated dashboard session - this endpoint upserts into every table, so
  // an unauthenticated caller must never be able to write to the database.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  let bundle: { version?: string; data?: Record<string, unknown[]> }
  try {
    bundle = (await req.json()) as typeof bundle
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!bundle?.data || typeof bundle.data !== "object") {
    return NextResponse.json({ error: "Invalid export format - missing data key" }, { status: 400 })
  }

  const results: Record<string, { imported: number; error?: string }> = {}
  const importable = new Set<string>(IMPORTABLE_TABLES)

  // Surface unknown tables rather than silently ignoring them, so an out-of-date or malformed
  // backup is visible in the result instead of quietly dropping data.
  for (const key of Object.keys(bundle.data)) {
    if (!importable.has(key) && !NON_IMPORTABLE.has(key)) {
      results[key] = { imported: 0, error: "unknown table - skipped" }
    }
  }

  for (const table of IMPORTABLE_TABLES) {
    const rows = bundle.data[table]
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      results[table] = { imported: 0 }
      continue
    }
    const { error } = await supabase.from(table).upsert(rows as Record<string, unknown>[], { onConflict: "id" })
    results[table] = error ? { imported: 0, error: error.message } : { imported: rows.length }
  }

  const totalImported = Object.values(results).reduce((s, r) => s + r.imported, 0)
  return NextResponse.json({ imported_at: new Date().toISOString(), total: totalImported, tables: results })
}
