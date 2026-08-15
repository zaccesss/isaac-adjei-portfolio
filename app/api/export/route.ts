import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { isPinVerified } from "@/lib/pin"
import { supabase } from "@/lib/supabase"
import { encryptVaultData, needsEncryption, decryptVaultRows, vaultEncryptionReady } from "@/lib/vault-crypto"

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
  "wakatime_daily", "activity_log", "course_modules", "medication_reminders",
  "medication_doses", "reminders", "strava_activities", "listening_history",
  "github_contributions_days", "github_contributions_years", "location_geocodes",
  "lab_measurements", "projects", "project_tasks", "finance_transactions",
] as const

// user_files holds only storage metadata (the files live in Supabase Storage, not here);
// wakatime_daily, activity_log, strava_activities, listening_history,
// github_contributions_days/_years are all append-only sync logs from an external source of
// truth (WakaTime/Strava/Spotify/GitHub); location_geocodes is a regenerable cache keyed on
// applications.location - none of these are safe to upsert back in.
const NON_IMPORTABLE = new Set<string>([
  "user_files", "wakatime_daily", "activity_log", "strava_activities", "listening_history",
  "github_contributions_days", "github_contributions_years", "location_geocodes",
])
const IMPORTABLE_TABLES = EXPORT_TABLES.filter((t) => !NON_IMPORTABLE.has(t))

// A backup must never be silently truncated: PostgREST caps a single response at 1000 rows,
// so every table is paged the same way getBlogReadEvents does. A read error is returned, not
// swallowed, so a failed table can never export as an empty array that later looks like a
// clean restore.
// Paging orders by id (the primary key on every export table) rather than created_at:
// assessments, habit_logs, streak_logs and wakatime_daily have no created_at column, so
// ordering by it made those four fail - silently empty in every old backup, a loud error now.
async function q(table: string): Promise<{ rows: unknown[]; error?: string }> {
  const rows: unknown[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + 999)
    if (error) return { rows, error: error.message }
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < 1000) break
  }
  return { rows }
}

// The backup carries the whole diary and vault, so it is gated behind the PIN as well as the
// session - otherwise it is a one-request bypass of the PIN for that content.
async function requireSessionAndPin() {
  const session = await auth()
  if (!session) return { error: "Unauthorised", status: 401 as const }
  if (!(await isPinVerified())) return { error: "PIN required", status: 403 as const }
  return null
}

export async function GET(req: Request) {
  const gate = await requireSessionAndPin()
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status })

  // Deliberate decrypt-on-export for migrating into a password manager. It is gated by the session
  // and the PIN like every export, plus a typed confirmation on the client and it is kept apart
  // from the normal backup: a vault-only bundle marked vault_decrypted, its own filename, secrets in
  // the clear. Never the default export path, so a routine backup always stays encrypted at rest.
  if (new URL(req.url).searchParams.get("vault") === "decrypt") {
    if (!vaultEncryptionReady()) {
      return NextResponse.json({ error: "Vault encryption is not configured, so there is nothing to decrypt." }, { status: 400 })
    }
    const { rows, error } = await q("vault")
    if (error) return NextResponse.json({ error: "Export failed for the vault", detail: error }, { status: 500 })
    const bundle = {
      exported_at: new Date().toISOString(),
      version: "1.1",
      vault_decrypted: true,
      note: "Secrets are in the clear. Keep this file offline and delete it once imported.",
      data: { vault: decryptVaultRows(rows as Record<string, unknown>[]) },
    }
    const filename = `vault-decrypted-${new Date().toISOString().slice(0, 10)}.json`
    return new NextResponse(JSON.stringify(bundle, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  }

  // Optional ?tables=applications,goals exports only those tables; with no param it exports everything.
  const requested = new URL(req.url).searchParams.get("tables")
  const selected = requested
    ? EXPORT_TABLES.filter((t) => requested.split(",").map((s) => s.trim()).includes(t))
    : [...EXPORT_TABLES]
  const tables = selected.length > 0 ? selected : [...EXPORT_TABLES]

  const entries = await Promise.all(tables.map(async (t) => [t, await q(t)] as const))
  const errors: Record<string, string> = {}
  const data: Record<string, unknown[]> = {}
  for (const [table, res] of entries) {
    data[table] = res.rows
    if (res.error) errors[table] = res.error
  }

  // A backup I cannot trust must fail loudly rather than download looking complete, so any
  // per-table read error returns a 500 with the offending tables instead of a partial file.
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Export failed for one or more tables", tables: errors },
      { status: 500 },
    )
  }

  const bundle = { exported_at: new Date().toISOString(), version: "1.1", data }
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

// A backup is a big payload but not unbounded - this cap keeps a hostile or corrupt body from
// being parsed into memory wholesale.
const MAX_IMPORT_BYTES = 25 * 1024 * 1024

export async function POST(req: Request) {
  const gate = await requireSessionAndPin()
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const declared = Number(req.headers.get("content-length") ?? "0")
  if (declared > MAX_IMPORT_BYTES) {
    return NextResponse.json({ error: "Backup too large" }, { status: 413 })
  }

  const raw = await req.text()
  if (raw.length > MAX_IMPORT_BYTES) {
    return NextResponse.json({ error: "Backup too large" }, { status: 413 })
  }

  let bundle: { version?: string; data?: Record<string, unknown[]> }
  try {
    bundle = JSON.parse(raw) as typeof bundle
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

    // Every row must be an object carrying an id, so a malformed table cannot upsert junk or
    // fail the whole restore on one bad row.
    const valid = rows.every(
      (r) => r !== null && typeof r === "object" && !Array.isArray(r) && typeof (r as { id?: unknown }).id === "string",
    )
    if (!valid) {
      results[table] = { imported: 0, error: "invalid rows - each row must be an object with a string id" }
      continue
    }

    // The vault is stored encrypted at rest, so any legacy plaintext row in an old backup is
    // re-encrypted on the way in; a row that is already encrypted is left untouched, so nothing
    // is ever double-encrypted.
    const toUpsert =
      table === "vault"
        ? (rows as Record<string, unknown>[]).map((r) => (needsEncryption(r) ? encryptVaultData(r) : r))
        : (rows as Record<string, unknown>[])

    const { error } = await supabase.from(table).upsert(toUpsert, { onConflict: "id" })
    results[table] = error ? { imported: 0, error: error.message } : { imported: rows.length }
  }

  const totalImported = Object.values(results).reduce((s, r) => s + r.imported, 0)
  const failed = Object.values(results).some((r) => r.error)
  // A partial failure must not return 200 - the caller has to know the restore was incomplete.
  return NextResponse.json(
    { imported_at: new Date().toISOString(), total: totalImported, tables: results },
    { status: failed ? 207 : 200 },
  )
}
