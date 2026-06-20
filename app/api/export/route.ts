import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

async function q(table: string, select = "*") {
  const { data } = await supabase.from(table).select(select).order("created_at", { ascending: false })
  return data ?? []
}

export async function GET() {
  // I require an authenticated dashboard session - this endpoint returns the entire
  // personal database, so it must never be reachable without the GitHub session.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const [
    goals,
    applications,
    vaultEntries,
    diaryEntries,
    notesFolders,
    notes,
    streaks,
    streakLogs,
    habits,
    habitLogs,
    contacts,
    wishlistItems,
    inventoryItems,
    healthSections,
    healthWorkouts,
    healthNutrition,
    bodyMetrics,
    faithEntries,
    studySessions,
    calendarEvents,
    userFiles,
    uniModules,
    uniDeadlines,
    uniSubmissions,
    uniNotes,
    uniResources,
    uniLibraryBooks,
    modules,
    assessments,
    openSource,
    blogPosts,
    wakatimeDaily,
    activityLog,
  ] = await Promise.all([
    q("goals"),
    q("applications"),
    q("vault_entries"),
    q("diary_entries"),
    q("notes_folders"),
    q("notes"),
    q("streaks"),
    q("streak_logs"),
    q("habits"),
    q("habit_logs"),
    q("contacts"),
    q("wishlist_items"),
    q("inventory_items"),
    q("health_sections"),
    q("health_workouts"),
    q("health_nutrition"),
    q("body_metrics"),
    q("faith_entries"),
    q("study_sessions"),
    q("calendar_events"),
    q("user_files"),
    q("uni_modules"),
    q("uni_deadlines"),
    q("uni_submissions"),
    q("uni_notes"),
    q("uni_resources"),
    q("uni_library_books"),
    q("modules"),
    q("assessments"),
    q("open_source_projects"),
    q("blog_posts"),
    q("wakatime_daily"),
    q("activity_log"),
  ])

  const bundle = {
    exported_at: new Date().toISOString(),
    version: "1.0",
    data: {
      goals,
      applications,
      vault_entries: vaultEntries,
      diary_entries: diaryEntries,
      notes_folders: notesFolders,
      notes,
      streaks,
      streak_logs: streakLogs,
      habits,
      habit_logs: habitLogs,
      contacts,
      wishlist_items: wishlistItems,
      inventory_items: inventoryItems,
      health_sections: healthSections,
      health_workouts: healthWorkouts,
      health_nutrition: healthNutrition,
      body_metrics: bodyMetrics,
      faith_entries: faithEntries,
      study_sessions: studySessions,
      calendar_events: calendarEvents,
      user_files: userFiles,
      uni_modules: uniModules,
      uni_deadlines: uniDeadlines,
      uni_submissions: uniSubmissions,
      uni_notes: uniNotes,
      uni_resources: uniResources,
      uni_library_books: uniLibraryBooks,
      modules,
      assessments,
      open_source_projects: openSource,
      blog_posts: blogPosts,
      wakatime_daily: wakatimeDaily,
      activity_log: activityLog,
    },
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

// Table names that are safe to upsert (excludes read-only/computed tables)
const IMPORTABLE_TABLES = [
  "goals", "applications", "vault_entries", "diary_entries", "notes_folders",
  "notes", "streaks", "streak_logs", "habits", "habit_logs", "contacts",
  "wishlist_items", "inventory_items", "health_sections", "health_workouts",
  "health_nutrition", "body_metrics", "faith_entries", "study_sessions",
  "calendar_events", "uni_modules", "uni_deadlines", "uni_submissions",
  "uni_notes", "uni_resources", "uni_library_books", "modules", "assessments",
  "open_source_projects",
] as const

export async function POST(req: Request) {
  // I require an authenticated dashboard session - this endpoint upserts into every
  // table, so an unauthenticated caller must never be able to write to the database.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  let bundle: { version?: string; data?: Record<string, unknown[]> }
  try {
    bundle = await req.json() as typeof bundle
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!bundle?.data || typeof bundle.data !== "object") {
    return NextResponse.json({ error: "Invalid export format - missing data key" }, { status: 400 })
  }

  const results: Record<string, { imported: number; error?: string }> = {}

  for (const table of IMPORTABLE_TABLES) {
    const rows = bundle.data[table]
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      results[table] = { imported: 0 }
      continue
    }
    const { error } = await supabase.from(table).upsert(rows as Record<string, unknown>[], { onConflict: "id" })
    if (error) {
      results[table] = { imported: 0, error: error.message }
    } else {
      results[table] = { imported: rows.length }
    }
  }

  const totalImported = Object.values(results).reduce((s, r) => s + r.imported, 0)
  return NextResponse.json({ imported_at: new Date().toISOString(), total: totalImported, tables: results })
}
