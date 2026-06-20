"use server"

// All dashboard mutations live here as Next.js server actions so the Supabase
// service key never ships to the browser and revalidatePath can be called directly.
// I use server actions rather than direct client-side Supabase calls so the service key never ships to the browser.
// Every action here is intentionally thin - validate, write, revalidate. No business logic lives here.
import { supabase } from "@/lib/supabase"
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache"
import { syncApplicationToLinear, syncDeadlineToLinear } from "@/lib/linear-sync"

// I fire-and-forget activity logs so a logging failure never blocks the actual action.
// The activity_log table must exist in Supabase:
//   CREATE TABLE activity_log (
//     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     action text NOT NULL,
//     detail text,
//     created_at timestamptz NOT NULL DEFAULT now()
//   );
export async function logActivity(action: string, detail?: string) {
  const { error } = await supabase.from("activity_log").insert({ action, detail: detail ?? null })
  if (error) console.error("[activity_log]", error.message, error.details)
}

async function moveToTrash(tableName: string, id: string, displayName?: string) {
  const { data } = await supabase.from(tableName).select("*").eq("id", id).single()
  if (data) {
    await supabase.from("trash").insert({
      table_name: tableName,
      original_id: id,
      display_name: displayName ?? null,
      data,
    })
  }
}

// Input validation helpers. I use runtime checks rather than a schema library to avoid
// adding a dependency. Any field that fails type or length checks causes the action to
// return early with a generic error so callers never see a Supabase error message.

const MAX_TEXT = 500
const MAX_LONG_TEXT = 10_000_000
const MAX_DIARY_TEXT = 10_000_000
const MAX_NOTE_TEXT = 10_000_000

const INVALID = { error: "Invalid input" } as const

function validStr(v: unknown, maxLen = MAX_TEXT): boolean {
  return typeof v === "string" && v.trim().length > 0 && v.trim().length <= maxLen
}

function optStr(v: unknown, maxLen = MAX_TEXT): boolean {
  return v === undefined || v === null || (typeof v === "string" && v.length <= maxLen)
}

function validNum(v: unknown, min = 0, max = 1_000_000): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max
}

function optNum(v: unknown, min = 0, max = 1_000_000): boolean {
  return v === undefined || v === null || validNum(v, min, max)
}

function validId(id: unknown): boolean {
  return typeof id === "string" && id.trim().length > 0 && id.length <= 100
}

// ─── Goals ──────────────────────────────────────────────────

// I always revalidatePath after writes so the Next.js cache for that route is busted immediately
// - without this the page would serve stale RSC data until the next full reload

export async function createGoal(data: {
  title: string
  description: string
  category: string
  status: string
  target_date: string
  progress: number
}) {
  if (
    !validStr(data.title) ||
    !optStr(data.description, MAX_LONG_TEXT) ||
    !validStr(data.category) ||
    !validStr(data.status) ||
    !optStr(data.target_date) ||
    !validNum(data.progress, 0, 100)
  ) return INVALID
  await supabase.from("goals").insert(data)
  void logActivity("goal.create", data.title)
  revalidatePath("/dashboard/goals")
}

export async function updateGoal(id: string, data: Partial<{
  title: string
  description: string
  category: string
  status: string
  target_date: string
  progress: number
}>) {
  // I use Partial<> so callers can patch a single field without supplying the full row
  if (
    !validId(id) ||
    !optStr(data.title) ||
    !optStr(data.description, MAX_LONG_TEXT) ||
    !optStr(data.category) ||
    !optStr(data.status) ||
    !optStr(data.target_date) ||
    !optNum(data.progress, 0, 100)
  ) return INVALID
  await supabase.from("goals").update(data).eq("id", id)
  void logActivity("goal.update", data.title)
  revalidatePath("/dashboard/goals")
}

export async function deleteGoal(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("goals", id)
  await supabase.from("goals").delete().eq("id", id)
  void logActivity("goal.delete", id)
  revalidatePath("/dashboard/goals")
}

// ─── Modules ────────────────────────────────────────────────

export async function createModule(data: {
  code: string
  name: string
  credits: number
  year: number
  semester: number
  status: string
  summary?: string
  rules?: string
}) {
  if (
    !validStr(data.code) ||
    !validStr(data.name) ||
    !validNum(data.credits, 0, 240) ||
    !validNum(data.year, 1, 5) ||
    !validNum(data.semester, 1, 3) ||
    !validStr(data.status) ||
    !optStr(data.summary, MAX_LONG_TEXT) ||
    !optStr(data.rules, MAX_LONG_TEXT)
  ) return INVALID
  // I .select().single() here because the client needs the auto-generated id to add to local state
  // without it I would have to refetch the full modules list just to get the new row's id
  const { data: inserted } = await supabase.from("modules").insert(data).select().single()
  void logActivity("module.create", data.name)
  revalidatePath("/dashboard/modules")
  return inserted
}

export async function updateModule(id: string, data: Partial<{
  code: string
  name: string
  credits: number
  year: number
  semester: number
  status: string
  summary: string
  rules: string
}>) {
  if (
    !validId(id) ||
    !optStr(data.code) ||
    !optStr(data.name) ||
    !optNum(data.credits, 0, 240) ||
    !optNum(data.year, 1, 5) ||
    !optNum(data.semester, 1, 3) ||
    !optStr(data.status) ||
    !optStr(data.summary, MAX_LONG_TEXT) ||
    !optStr(data.rules, MAX_LONG_TEXT)
  ) return INVALID
  await supabase.from("modules").update(data).eq("id", id)
  void logActivity("module.update", data.name ?? id)
  revalidatePath("/dashboard/modules")
}

export async function deleteModule(id: string) {
  if (!validId(id)) return INVALID
  await supabase.from("modules").delete().eq("id", id)
  void logActivity("module.delete", id)
  revalidatePath("/dashboard/modules")
}

export async function updateModuleStatus(id: string, status: string) {
  // I split status into its own action because it fires on every Select change
  // and I do not want the caller to build a full update payload just to flip one field
  if (!validId(id) || !validStr(status)) return INVALID
  await supabase.from("modules").update({ status }).eq("id", id)
  void logActivity("module.update", `status → ${status}`)
  revalidatePath("/dashboard/modules")
}

// ─── Assessments ────────────────────────────────────────────

export async function createAssessment(data: {
  module_id: string
  name: string
  type: string
  weight_percent: number
  mark_achieved: number | null  // null when the result is not yet known
  mark_max: number
  target_mark: number | null
  date?: string | null
  week?: string | null
  is_pass_fail?: boolean
  my_notes?: string | null
}) {
  if (
    !validStr(data.module_id) ||
    !validStr(data.name) ||
    !validStr(data.type) ||
    !validNum(data.weight_percent, 0, 100) ||
    !optNum(data.mark_achieved, 0, 200) ||
    !validNum(data.mark_max, 0, 200) ||
    !optNum(data.target_mark, 0, 200) ||
    !optStr(data.date) ||
    !optStr(data.week) ||
    !optStr(data.my_notes, MAX_LONG_TEXT)
  ) return INVALID
  // I return the inserted row so the client can append it to local state
  // without needing to know the DB-generated id ahead of time
  const { data: inserted } = await supabase.from("assessments").insert(data).select().single()
  void logActivity("grade.create", data.name)
  revalidatePath("/dashboard/modules")
  return inserted
}

export async function updateAssessmentMark(id: string, mark: number | null) {
  // I expose this as a dedicated action because mark entry is the most frequent operation
  // in the modules view - students click a row, type a number and hit Enter
  if (!validId(id)) return INVALID
  if (mark !== null && !validNum(mark, 0, 200)) return INVALID
  await supabase.from("assessments").update({ mark_achieved: mark }).eq("id", id)
  void logActivity("grade.update", mark !== null ? `${mark}` : "cleared")
  revalidatePath("/dashboard/modules")
}

export async function updateAssessment(id: string, data: Partial<{
  name: string
  type: string
  weight_percent: number
  mark_achieved: number | null
  mark_max: number
  target_mark: number | null
  date: string | null
  week: string | null
  is_pass_fail: boolean
  my_notes: string | null
}>) {
  if (
    !validId(id) ||
    !optStr(data.name) ||
    !optStr(data.type) ||
    !optNum(data.weight_percent, 0, 100) ||
    !optNum(data.mark_max, 0, 200) ||
    !optStr(data.date) ||
    !optStr(data.week) ||
    !optStr(data.my_notes, MAX_LONG_TEXT)
  ) return INVALID
  await supabase.from("assessments").update(data).eq("id", id)
  void logActivity("grade.update", data.name ?? id)
  revalidatePath("/dashboard/modules")
}

export async function deleteAssessment(id: string) {
  if (!validId(id)) return INVALID
  await supabase.from("assessments").delete().eq("id", id)
  void logActivity("grade.delete", id)
  revalidatePath("/dashboard/modules")
}

// ─── Applications ────────────────────────────────────────────

export async function createApplication(data: {
  company: string
  role: string
  type: string
  applied_date: string
  deadline: string
  status: string
  notes: string
  url: string
  starred: boolean
  salary_range?: string
  location?: string
  work_mode?: string
  source?: string
  opening_date?: string
  last_year_opening?: string
  housing_location?: string
  cv_required?: string
  cover_letter_required?: string
  written_answers?: string
  sponsors_visa?: string
  category?: string
}) {
  if (
    !validStr(data.company) ||
    !validStr(data.role) ||
    !validStr(data.type) ||
    !optStr(data.applied_date) ||
    !optStr(data.deadline) ||
    !validStr(data.status) ||
    !optStr(data.notes, MAX_LONG_TEXT) ||
    !optStr(data.url) ||
    typeof data.starred !== "boolean" ||
    !optStr(data.salary_range) ||
    !optStr(data.location) ||
    !optStr(data.work_mode) ||
    !optStr(data.source) ||
    !optStr(data.opening_date) ||
    !optStr(data.last_year_opening) ||
    !optStr(data.housing_location) ||
    !optStr(data.cv_required) ||
    !optStr(data.cover_letter_required) ||
    !optStr(data.written_answers) ||
    !optStr(data.sponsors_visa) ||
    !optStr(data.category)
  ) return INVALID
  // I return the inserted row so the client can optimistically show the new card without a refetch
  const { data: inserted } = await supabase.from("applications").insert(data).select().single()
  void logActivity("application.create", `${data.company} - ${data.role}`)
  if (inserted) {
    void syncApplicationToLinear({ ...inserted, linear_issue_id: null }).then(async (issueId) => {
      if (issueId) await supabase.from("applications").update({ linear_issue_id: issueId }).eq("id", inserted.id)
    })
  }
  revalidatePath("/dashboard/applications")
  return inserted
}

export async function updateApplication(id: string, data: Partial<{
  company: string
  role: string
  type: string
  applied_date: string
  deadline: string
  status: string
  notes: string
  url: string
  starred: boolean
  salary_range: string
  location: string
  work_mode: string
  source: string
  opening_date: string
  last_year_opening: string
  housing_location: string
  cv_required: string
  cover_letter_required: string
  written_answers: string
  sponsors_visa: string
  category: string
}>) {
  if (!validId(id)) return INVALID
  await supabase.from("applications").update(data).eq("id", id)
  void logActivity("application.update", data.status ? `status → ${data.status}` : (data.company ?? id))
  if (data.status) {
    const { data: row } = await supabase.from("applications").select("id,company,role,type,url,linear_issue_id").eq("id", id).single()
    if (row) void syncApplicationToLinear({ ...row, status: data.status }).then(async (issueId) => {
      if (issueId && !row.linear_issue_id) await supabase.from("applications").update({ linear_issue_id: issueId }).eq("id", id)
    })
  }
  revalidatePath("/dashboard/applications")
}

export async function deleteApplication(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("applications", id)
  await supabase.from("applications").delete().eq("id", id)
  void logActivity("application.delete", id)
  revalidatePath("/dashboard/applications")
}

export async function bulkDeleteApplications(ids: string[]) {
  if (!ids.length || ids.some((id) => !validId(id))) return INVALID
  for (const id of ids) await moveToTrash("applications", id)
  await supabase.from("applications").delete().in("id", ids)
  void logActivity("application.bulk_delete", `${ids.length} applications`)
  revalidatePath("/dashboard/applications")
}

export async function archiveApplication(id: string) {
  if (!validId(id)) return INVALID
  await supabase.from("applications").update({ archived: true }).eq("id", id)
  void logActivity("application.archive", id)
  revalidatePath("/dashboard/applications")
}

export async function reopenApplication(id: string) {
  if (!validId(id)) return INVALID
  await supabase.from("applications").update({ archived: false }).eq("id", id)
  void logActivity("application.reopen", id)
  revalidatePath("/dashboard/applications")
}

export async function updateInterviewPrep(
  id: string,
  prep: { notes: string; questions: { id: string; text: string; done: boolean }[]; company_research: string }
) {
  if (!validId(id)) return INVALID
  await supabase.from("applications").update({ interview_prep: prep }).eq("id", id)
  void logActivity("application.interview_prep.save", id)
  revalidatePath("/dashboard/applications")
}

// ─── Vault ───────────────────────────────────────────────────

export async function createVaultEntry(data: {
  name: string
  type: string
  // I make every credential field optional because only the relevant type's fields will be filled in
  username?: string
  email?: string
  password?: string
  url?: string
  totp_secret?: string
  card_number?: string
  card_holder?: string
  card_expiry?: string
  phone?: string
  address?: string
  key_name?: string
  key_value?: string
  key_expiry?: string | null
  content?: string
  notes?: string
  fields?: Record<string, unknown>  // I reserve this for arbitrary extra key-value pairs in future
}) {
  if (
    !validStr(data.name) ||
    !validStr(data.type) ||
    !optStr(data.username) ||
    !optStr(data.email) ||
    !optStr(data.password) ||
    !optStr(data.url) ||
    !optStr(data.totp_secret) ||
    !optStr(data.card_number) ||
    !optStr(data.card_holder) ||
    !optStr(data.card_expiry) ||
    !optStr(data.phone) ||
    !optStr(data.address) ||
    !optStr(data.key_name) ||
    !optStr(data.key_value) ||
    !optStr(data.key_expiry) ||
    !optStr(data.content, MAX_LONG_TEXT) ||
    !optStr(data.notes, MAX_LONG_TEXT)
  ) return INVALID
  // I return the full inserted row so the client can splice it into the local entries list
  // in sorted order without waiting for a page refetch
  const { data: inserted } = await supabase.from("vault").insert(data).select().single()
  void logActivity("vault.create", data.name)
  revalidatePath("/dashboard/vault")
  return inserted
}

export async function updateVaultEntry(id: string, data: Partial<{
  name: string
  type: string
  username: string
  email: string
  password: string
  url: string
  totp_secret: string
  card_number: string
  card_holder: string
  card_expiry: string
  phone: string
  address: string
  key_name: string
  key_value: string
  key_expiry: string | null
  content: string
  notes: string
  fields: Record<string, unknown>
}>) {
  if (!validId(id)) return INVALID
  await supabase.from("vault").update(data).eq("id", id)
  void logActivity("vault.update", id)
  revalidatePath("/dashboard/vault")
}

export async function deleteVaultEntry(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("vault", id)
  await supabase.from("vault").delete().eq("id", id)
  void logActivity("vault.delete", id)
  revalidatePath("/dashboard/vault")
}

// ─── Diary ───────────────────────────────────────────────────

export async function createDiaryEntry(data: {
  title: string
  content: string
  mood: string
}) {
  if (
    !validStr(data.title) ||
    !validStr(data.content, MAX_DIARY_TEXT) ||
    !validStr(data.mood)
  ) return INVALID
  // I return the inserted row so the DiaryClient can prepend it to the top of the list immediately
  // the created_at timestamp comes back from Supabase so the order is correct without client-side guessing
  const { data: inserted } = await supabase.from("diary").insert(data).select().single()
  void logActivity("diary.create", data.title)
  revalidatePath("/dashboard/diary")
  return inserted
}

export async function updateDiaryEntry(id: string, data: Partial<{
  title: string
  content: string
  mood: string
  updated_at: string
}>) {
  if (
    !validId(id) ||
    !optStr(data.title) ||
    !optStr(data.content, MAX_DIARY_TEXT) ||
    !optStr(data.mood)
  ) return INVALID
  // I always stamp updated_at server-side so the value is the true server time
  // not whatever the client clock happens to say
  await supabase.from("diary").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  void logActivity("diary.update", data.title ?? id)
  revalidatePath("/dashboard/diary")
}

export async function deleteDiaryEntry(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("diary", id)
  await supabase.from("diary").delete().eq("id", id)
  void logActivity("diary.delete", id)
  revalidatePath("/dashboard/diary")
}

// ─── Notes ───────────────────────────────────────────────────

export async function createNote(data: {
  title: string
  content: string
  folder: string
  tags: string[]
  pinned: boolean
  locked: boolean
  color: string | null  // null means no accent colour, the card renders in the default theme colour
}) {
  if (
    !validStr(data.title) ||
    !validStr(data.content, MAX_NOTE_TEXT) ||
    !validStr(data.folder) ||
    !Array.isArray(data.tags) ||
    typeof data.pinned !== "boolean" ||
    typeof data.locked !== "boolean" ||
    !optStr(data.color)
  ) return INVALID
  const { data: inserted } = await supabase.from("notes").insert(data).select().single()
  void logActivity("note.create", data.title)
  revalidatePath("/dashboard/notes")
  return inserted
}

export async function updateNote(id: string, data: Partial<{
  title: string
  content: string
  folder: string
  tags: string[]
  pinned: boolean
  locked: boolean
  color: string | null
  updated_at: string
}>) {
  if (!validId(id)) return INVALID
  // I spread updated_at on the server side for the same reason as updateDiaryEntry
  // - the client's clock drifts and I do not want stale sort orders
  await supabase.from("notes").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  void logActivity("note.update", data.title ?? id)
  revalidatePath("/dashboard/notes")
}

export async function deleteNote(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("notes", id)
  await supabase.from("notes").delete().eq("id", id)
  void logActivity("note.delete", id)
  revalidatePath("/dashboard/notes")
}

// ─── Streaks ─────────────────────────────────────────────────

export async function createStreak(data: {
  name: string
  icon: string
  description: string
  color: string
  order_index: number  // I persist order so the drag-to-reorder state survives a page reload
}) {
  if (
    !validStr(data.name) ||
    !validStr(data.icon) ||
    !optStr(data.description, MAX_LONG_TEXT) ||
    !validStr(data.color) ||
    !validNum(data.order_index, 0, 9999)
  ) return INVALID
  const { data: inserted } = await supabase.from("streaks").insert(data).select().single()
  void logActivity("streak.create", data.name)
  revalidatePath("/dashboard/streaks")
  return inserted
}

export async function updateStreak(id: string, data: Partial<{
  name: string
  icon: string
  description: string
  color: string
  active: boolean
  order_index: number
}>) {
  if (!validId(id)) return INVALID
  await supabase.from("streaks").update(data).eq("id", id)
  void logActivity("streak.update", data.name ?? id)
  revalidatePath("/dashboard/streaks")
}

export async function deleteStreak(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("streaks", id)
  await supabase.from("streaks").delete().eq("id", id)
  void logActivity("streak.delete", id)
  revalidatePath("/dashboard/streaks")
}

export async function checkInStreak(streakId: string, date: string) {
  // I upsert on the composite key (streak_id, date) so re-checking the same day is idempotent
  // - double-clicking the button or a race condition will not create duplicate rows
  if (!validId(streakId) || !validStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return INVALID
  await supabase.from("streak_logs").upsert({ streak_id: streakId, date, completed: true }, { onConflict: "streak_id,date" })
  void logActivity("streak.checkin", date)
  revalidatePath("/dashboard/streaks")
}

export async function undoStreakCheckIn(streakId: string, date: string) {
  // I delete rather than setting completed: false so there is no ambiguity
  // between "never checked in" and "checked in then undone" - both look the same in the streak calc
  if (!validId(streakId) || !validStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return INVALID
  await supabase.from("streak_logs").delete().eq("streak_id", streakId).eq("date", date)
  void logActivity("streak.undo_checkin", date)
  revalidatePath("/dashboard/streaks")
}

// ─── Habits ─────────────────────────────────────────────────

export async function createHabit(data: { name: string; color?: string; description?: string }) {
  if (!validStr(data.name)) return INVALID
  const { data: inserted } = await supabase.from("habits").insert({
    name: data.name.trim(),
    color: data.color ?? "#3b82f6",
    description: data.description ?? null,
    frequency: "daily",
    active: true,
  }).select().single()
  void logActivity("habit.create", data.name)
  revalidatePath("/dashboard/habits")
  return inserted
}

export async function deleteHabit(id: string) {
  if (!validId(id)) return INVALID
  await supabase.from("habit_logs").delete().eq("habit_id", id)
  await supabase.from("habits").delete().eq("id", id)
  void logActivity("habit.delete", id)
  revalidatePath("/dashboard/habits")
}

export async function checkInHabit(habitId: string, date: string) {
  if (!validId(habitId) || !validStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return INVALID
  await supabase.from("habit_logs").upsert({ habit_id: habitId, date, completed: true }, { onConflict: "habit_id,date" })
  void logActivity("habit.checkin", date)
  revalidatePath("/dashboard/habits")
}

export async function undoHabitCheckIn(habitId: string, date: string) {
  if (!validId(habitId) || !validStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return INVALID
  await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("date", date)
  void logActivity("habit.undo_checkin", date)
  revalidatePath("/dashboard/habits")
}

// ─── Health ──────────────────────────────────────────────────

export async function createHealthSection(data: {
  name: string
  type: string
  icon: string
  color: string
  order_index: number
  subtype?: string
}) {
  if (
    !validStr(data.name) ||
    !validStr(data.type) ||
    !validStr(data.icon) ||
    !validStr(data.color) ||
    !validNum(data.order_index, 0, 9999) ||
    !optStr(data.subtype)
  ) return INVALID
  const { data: inserted } = await supabase.from("health_sections").insert(data).select().single()
  void logActivity("health.create", data.name)
  revalidatePath("/dashboard/health")
  return inserted
}

export async function updateHealthSection(id: string, data: Partial<{
  name: string
  type: string
  icon: string
  color: string
  order_index: number
  active: boolean
  subtype: string | null
}>) {
  if (!validId(id)) return INVALID
  await supabase.from("health_sections").update(data).eq("id", id)
  void logActivity("health.update", id)
  revalidatePath("/dashboard/health")
}

export async function deleteHealthSection(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("health_sections", id)
  void logActivity("health.section.delete", id)
  revalidatePath("/dashboard/health")
}

export async function createHealthWorkout(data: {
  section_id: string
  day_label: string
  exercises: { name: string; sets: string }[]  // I store exercises as a JSON array so I avoid a separate exercises table
  notes?: string
  order_index: number
}) {
  if (
    !validStr(data.section_id) ||
    !validStr(data.day_label) ||
    !Array.isArray(data.exercises) ||
    !optStr(data.notes, MAX_LONG_TEXT) ||
    !validNum(data.order_index, 0, 9999)
  ) return INVALID
  const { data: inserted } = await supabase.from("health_workouts").insert(data).select().single()
  void logActivity("health.create", data.day_label)
  revalidatePath("/dashboard/health")
  return inserted
}

export async function updateHealthWorkout(id: string, data: Partial<{
  day_label: string
  exercises: { name: string; sets: string }[]
  notes: string
  order_index: number
}>) {
  if (!validId(id)) return INVALID
  // I always refresh updated_at server-side so I know the true last-modified time
  await supabase.from("health_workouts").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  void logActivity("health.update", data.day_label ?? id)
  revalidatePath("/dashboard/health")
}

export async function deleteHealthWorkout(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("health_workouts", id)
  void logActivity("health.workout.delete", id)
  revalidatePath("/dashboard/health")
}

export async function updateHealthNutrition(id: string, data: Partial<{
  category: string
  items: string[]   // I store food lists as a plain string array - simple enough that JSON in Postgres works fine
  rules: string[]
  order_index: number
}>) {
  if (
    !validId(id) ||
    !optStr(data.category) ||
    (data.items !== undefined && !Array.isArray(data.items)) ||
    (data.rules !== undefined && !Array.isArray(data.rules)) ||
    !optNum(data.order_index, 0, 9999)
  ) return INVALID
  await supabase.from("health_nutrition").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  void logActivity("health.update", data.category ?? id)
  revalidatePath("/dashboard/health")
}

export async function createHealthNutrition(data: {
  category: string
  items: string[]
  rules: string[]
  order_index: number
}) {
  if (
    !validStr(data.category) ||
    !Array.isArray(data.items) ||
    !Array.isArray(data.rules) ||
    !validNum(data.order_index, 0, 9999)
  ) return INVALID
  const { data: inserted } = await supabase.from("health_nutrition").insert(data).select().single()
  void logActivity("health.create", data.category)
  revalidatePath("/dashboard/health")
  return inserted
}

export async function deleteHealthNutrition(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("health_nutrition", id)
  void logActivity("health.nutrition.delete", id)
  revalidatePath("/dashboard/health")
}

// ─── Config ──────────────────────────────────────────────────

// I store arbitrary JSON blobs in a single config table keyed by a string rather than creating a table per setting.
// This keeps the schema stable even as I add new dashboard preferences over time.
export async function getConfig(key: string) {
  const { data } = await supabase.from("config").select("value").eq("key", key).single()
  // I return null rather than throwing so callers can treat a missing key as "use default"
  return data?.value ?? null
}

// I cache the theme preference for 5 minutes so every protected dashboard page navigation
// doesn't fire a Supabase round trip. revalidateTag("config-theme") in setConfig clears this immediately on change.
export const getCachedTheme = unstable_cache(
  () => getConfig("theme_preference"),
  ["theme_preference"],
  { revalidate: 300, tags: ["config-theme"] }
)

export async function setConfig(key: string, value: unknown) {
  if (!validStr(key)) return INVALID
  // I upsert on the key column so the first write creates the row and subsequent ones update it
  // - no separate "does this key exist?" check needed, which would waste a round trip
  await supabase.from("config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (key === "theme_preference") revalidateTag("config-theme", "default")
}

export type IcalFeed = { url: string; name: string; color: string }

export async function getIcalFeeds(): Promise<IcalFeed[]> {
  const val = await getConfig("ical_feeds")
  const base: IcalFeed[] = Array.isArray(val) ? (val as IcalFeed[]) : []
  // Merge in the env-var timetable feed if set and not already present
  if (process.env.ICAL_TIMETABLE_URL && !base.find((f) => f.url === process.env.ICAL_TIMETABLE_URL)) {
    base.unshift({ url: process.env.ICAL_TIMETABLE_URL, name: "Timetable", color: "#6366f1" })
  }
  return base
}

export async function saveIcalFeeds(feeds: IcalFeed[]) {
  // Strip the env-var timetable feed before saving to avoid duplicating it
  const toSave = feeds.filter((f) => f.url !== process.env.ICAL_TIMETABLE_URL)
  await setConfig("ical_feeds", toSave)
  revalidatePath("/dashboard/calendar")
}

export async function updateNowStatus(data: {
  building?: string
  studying?: string
  focused_on?: string
  listening_to?: string
}) {
  if (
    !optStr(data.building) ||
    !optStr(data.studying) ||
    !optStr(data.focused_on) ||
    !optStr(data.listening_to)
  ) return INVALID
  await supabase.from("config").upsert(
    { key: "now_status", value: data, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  )
  revalidatePath("/dashboard/notes")
}

// ─── Course modules ──────────────────────────────────────────

export async function createCourseModule(data: {
  stage: string
  section: string | null
  code: string
  title: string
  credits: number
  level: number
  core_or_option: string
  condonable: boolean
  prerequisites: string | null
  order_index: number
}) {
  if (
    !validStr(data.stage) ||
    !optStr(data.section) ||
    !validStr(data.code) ||
    !validStr(data.title) ||
    !validNum(data.credits, 0, 240) ||
    !validNum(data.level, 0, 9) ||
    !validStr(data.core_or_option) ||
    typeof data.condonable !== "boolean" ||
    !optStr(data.prerequisites) ||
    !validNum(data.order_index, 0, 9999)
  ) return INVALID
  const { data: inserted } = await supabase.from("course_modules").insert(data).select().single()
  revalidatePath("/dashboard/course")
  return inserted
}

export async function updateCourseModule(id: string, data: Partial<{
  stage: string
  section: string | null
  code: string
  title: string
  credits: number
  level: number
  core_or_option: string
  condonable: boolean
  prerequisites: string | null
  order_index: number
}>) {
  if (!validId(id)) return INVALID
  await supabase.from("course_modules").update(data).eq("id", id)
  revalidatePath("/dashboard/course")
}

export async function deleteCourseModule(id: string) {
  if (!validId(id)) return INVALID
  await supabase.from("course_modules").delete().eq("id", id)
  revalidatePath("/dashboard/course")
}

// ─── Wishlist ────────────────────────────────────────────────

export async function createWishlistItem(data: {
  name: string
  category: string
  status: string
  priority: string
  notes: string
}) {
  if (
    !validStr(data.name) ||
    !validStr(data.category) ||
    !validStr(data.status) ||
    !validStr(data.priority) ||
    !optStr(data.notes, MAX_LONG_TEXT)
  ) return INVALID
  const { data: inserted } = await supabase.from("wishlist").insert(data).select().single()
  void logActivity("wishlist.create", data.name)
  revalidatePath("/dashboard/wishlist")
  return inserted
}

export async function updateWishlistItem(id: string, data: Partial<{
  name: string
  category: string
  status: string
  priority: string
  notes: string
}>) {
  if (!validId(id)) return INVALID
  await supabase.from("wishlist").update(data).eq("id", id)
  void logActivity("wishlist.update", data.name ?? id)
  revalidatePath("/dashboard/wishlist")
}

export async function deleteWishlistItem(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("wishlist", id)
  await supabase.from("wishlist").delete().eq("id", id)
  void logActivity("wishlist.delete", id)
  revalidatePath("/dashboard/wishlist")
}

// ─── Inventory ───────────────────────────────────────────────

export async function createInventoryItem(data: {
  name: string
  category: string
  quantity: number
  description?: string
  purchase_date?: string | null
  price_paid?: string        // I store price as a string to avoid float precision issues on display
  serial_number?: string
  notes?: string
  warranty_expiry?: string | null
  url?: string
}) {
  if (
    !validStr(data.name) ||
    !validStr(data.category) ||
    !validNum(data.quantity, 0, 99999) ||
    !optStr(data.description, MAX_LONG_TEXT) ||
    !optStr(data.purchase_date) ||
    !optStr(data.price_paid) ||
    !optStr(data.serial_number) ||
    !optStr(data.notes, MAX_LONG_TEXT) ||
    !optStr(data.warranty_expiry) ||
    !optStr(data.url)
  ) return INVALID
  const { data: inserted } = await supabase.from("inventory_items").insert(data).select().single()
  void logActivity("inventory.create", data.name)
  revalidatePath("/dashboard/inventory")
  return inserted
}

export async function updateInventoryItem(id: string, data: Partial<{
  name: string
  category: string
  quantity: number
  description: string
  purchase_date: string | null
  price_paid: string
  serial_number: string
  notes: string
  warranty_expiry: string | null
  url: string
}>) {
  if (!validId(id)) return INVALID
  await supabase.from("inventory_items").update(data).eq("id", id)
  void logActivity("inventory.update", data.name ?? id)
  revalidatePath("/dashboard/inventory")
}

export async function deleteInventoryItem(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("inventory_items", id)
  await supabase.from("inventory_items").delete().eq("id", id)
  void logActivity("inventory.delete", id)
  revalidatePath("/dashboard/inventory")
}

// ─── Dashboard summary ───────────────────────────────────────

// I run these queries in parallel with Promise.all so the home overview page loads as one
// round trip rather than 8 sequential ones. Each query only fetches the minimum columns needed.
export async function getDashboardSummary() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const today = new Date().toISOString().split("T")[0]
  const weekAgoDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [
    { data: goals },
    { count: appCount },
    { count: offerCount },
    { data: streaks },
    { data: streakLogs },
    { data: modules },
    { data: assessments },
    { data: diaryRecent },
    { count: wishlistCount },
    { count: vaultCount },
    { count: notesCount },
    { data: notesRecent },
    { data: studySessions },
    { data: faithEntries },
    { count: uniDeadlines },
    { count: uniModules },
  ] = await Promise.all([
    supabase.from("goals").select("id,status"),
    supabase.from("applications").select("id", { count: "exact", head: true })
      .not("status", "in", '("Not Applied","Not Interested","Rejected")'),
    supabase.from("applications").select("id", { count: "exact", head: true })
      .eq("status", "Offer Received"),
    supabase.from("streaks").select("id,name,color").eq("active", true).order("order_index"),
    supabase.from("streak_logs").select("streak_id,date")
      .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .lte("date", today),
    supabase.from("modules").select("id,year,credits,status"),
    supabase.from("assessments").select("module_id,weight_percent,mark_achieved,mark_max"),
    supabase.from("diary").select("id,mood,created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("wishlist").select("id", { count: "exact", head: true }),
    supabase.from("vault").select("id", { count: "exact", head: true }),
    supabase.from("notes").select("id", { count: "exact", head: true }),
    supabase.from("notes").select("updated_at").order("updated_at", { ascending: false }).limit(1),
    supabase.from("study_sessions").select("id,duration_minutes").gte("date", weekAgoDate),
    supabase.from("faith_entries").select("id,date").order("date", { ascending: false }).limit(1),
    supabase.from("uni_deadlines").select("id", { count: "exact", head: true })
      .gte("due_date", today).lte("due_date", next7Days).neq("status", "graded"),
    supabase.from("uni_modules").select("id", { count: "exact", head: true }).eq("status", "active"),
  ])

  // I compute the overall weighted average for year 3 (or the latest year with marks) as a GPA proxy
  const modulesWithMarks = (modules ?? []).filter((m) => {
    const mAssessments = (assessments ?? []).filter((a) => a.module_id === m.id)
    return mAssessments.some((a) => a.mark_achieved !== null)
  })
  let gpaEstimate: number | null = null
  if (modulesWithMarks.length > 0) {
    const allAssessments = (assessments ?? []).filter((a) => a.mark_achieved !== null)
    const totalWeight = allAssessments.reduce((s, a) => s + a.weight_percent, 0)
    if (totalWeight > 0) {
      const weightedSum = allAssessments.reduce((s, a) => s + ((a.mark_achieved! / a.mark_max) * 100 * a.weight_percent), 0)
      gpaEstimate = Math.round((weightedSum / totalWeight) * 10) / 10
    }
  }

  // I compute today's check-in count from the logs so the home page shows live streak data
  const todayLogs = new Set((streakLogs ?? []).filter((l) => l.date === today).map((l) => l.streak_id))
  const totalStreaks = (streaks ?? []).length

  const goalsDone = (goals ?? []).filter((g) => g.status === "done").length
  const goalsInProgress = (goals ?? []).filter((g) => g.status === "in_progress").length
  const goalsTotal = (goals ?? []).length

  const studyMinutesThisWeek = (studySessions ?? []).reduce((s, r) => s + (r.duration_minutes ?? 0), 0)
  const studySessionsThisWeek = (studySessions ?? []).length

  return {
    goals: { total: goalsTotal, done: goalsDone, inProgress: goalsInProgress },
    applications: { active: appCount ?? 0, offers: offerCount ?? 0 },
    streaks: { total: totalStreaks, checkedInToday: todayLogs.size },
    modules: { gpaEstimate },
    diary: {
      lastMood: diaryRecent?.[0]?.mood ?? null,
      lastEntry: diaryRecent?.[0]?.created_at ?? null,
    },
    wishlist: { total: wishlistCount ?? 0 },
    vault: { total: vaultCount ?? 0 },
    notes: { total: notesCount ?? 0, lastUpdated: notesRecent?.[0]?.updated_at ?? null },
    study: { sessionsThisWeek: studySessionsThisWeek, minutesThisWeek: studyMinutesThisWeek },
    faith: { lastEntry: faithEntries?.[0]?.date ?? null },
    university: { upcomingDeadlines: uniDeadlines ?? 0, activeModules: uniModules ?? 0 },
    updatedAt: weekAgo,
  }
}

// ─── Global Search ────────────────────────────────────────────────────────────

export async function getDashboardSearchData() {
  "use server"
  const [goals, notes, diary, applications] = await Promise.all([
    supabase.from("goals").select("id, title, category, status").order("created_at", { ascending: false }).limit(50),
    supabase.from("notes").select("id, title, folder").order("updated_at", { ascending: false }).limit(50),
    supabase.from("diary").select("id, title, mood, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("applications").select("id, company, role, status").order("applied_date", { ascending: false }).limit(50),
  ])
  return {
    goals: goals.data ?? [],
    notes: notes.data ?? [],
    diary: diary.data ?? [],
    applications: applications.data ?? [],
  }
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export async function getActivityLog(limit = 50) {
  const { data } = await supabase
    .from("activity_log")
    .select("id, action, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
  return data ?? []
}

// ─── Diary toggles ────────────────────────────────────────────────────────────
// Requires: ALTER TABLE diary ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
//           ALTER TABLE diary ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;
//           ALTER TABLE diary ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;

export async function toggleDiaryHidden(id: string, hidden: boolean) {
  if (!validId(id)) return INVALID
  await supabase.from("diary").update({ hidden }).eq("id", id)
  void logActivity("diary.update", hidden ? "hidden" : "visible")
  revalidatePath("/dashboard/diary")
}

export async function toggleDiaryPinned(id: string, pinned: boolean) {
  if (!validId(id)) return INVALID
  await supabase.from("diary").update({ pinned }).eq("id", id)
  void logActivity("diary.update", pinned ? "pinned" : "unpinned")
  revalidatePath("/dashboard/diary")
}

export async function toggleDiaryLocked(id: string, locked: boolean) {
  if (!validId(id)) return INVALID
  await supabase.from("diary").update({ locked }).eq("id", id)
  void logActivity("diary.update", locked ? "locked" : "unlocked")
  revalidatePath("/dashboard/diary")
}

// ─── Notes toggles ────────────────────────────────────────────────────────────
// Requires: ALTER TABLE notes ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;

export async function toggleNoteHidden(id: string, hidden: boolean) {
  if (!validId(id)) return INVALID
  await supabase.from("notes").update({ hidden }).eq("id", id)
  void logActivity("note.update", hidden ? "hidden" : "visible")
  revalidatePath("/dashboard/notes")
}

export async function toggleNotePinned(id: string, pinned: boolean) {
  if (!validId(id)) return INVALID
  await supabase.from("notes").update({ pinned }).eq("id", id)
  void logActivity("note.update", pinned ? "pinned" : "unpinned")
  revalidatePath("/dashboard/notes")
}

export async function toggleNoteLocked(id: string, locked: boolean) {
  if (!validId(id)) return INVALID
  await supabase.from("notes").update({ locked }).eq("id", id)
  void logActivity("note.update", locked ? "locked" : "unlocked")
  revalidatePath("/dashboard/notes")
}

// ─── Vault toggles ────────────────────────────────────────────────────────────
// Requires: ALTER TABLE vault ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
//           ALTER TABLE vault ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;

export async function toggleVaultHidden(id: string, hidden: boolean) {
  if (!validId(id)) return INVALID
  await supabase.from("vault").update({ hidden }).eq("id", id)
  void logActivity("vault.update", hidden ? "hidden" : "visible")
  revalidatePath("/dashboard/vault")
}

export async function toggleVaultLocked(id: string, locked: boolean) {
  if (!validId(id)) return INVALID
  await supabase.from("vault").update({ locked }).eq("id", id)
  void logActivity("vault.update", locked ? "locked" : "unlocked")
  revalidatePath("/dashboard/vault")
}

// ─── Open Source Contributions ────────────────────────────────────────────────

export type OpenSourceContribution = {
  id: string
  repo: string
  pr_title: string
  pr_url: string | null
  pr_number: number | null
  status: "draft" | "open" | "merged" | "closed"
  language: string | null
  notes: string | null
  submitted_at: string
  created_at: string
  updated_at: string
}

export async function getOpenSourceContributions(): Promise<OpenSourceContribution[]> {
  // I order by submitted_at descending so the most recent contributions appear first.
  const { data } = await supabase
    .from("opensource_contributions")
    .select("*")
    .order("submitted_at", { ascending: false })
  return (data ?? []) as OpenSourceContribution[]
}

export async function addOpenSourceContribution(input: {
  repo: string
  pr_title: string
  pr_url?: string | null
  pr_number?: number | null
  status: string
  language?: string | null
  notes?: string | null
  submitted_at: string
}) {
  if (
    !validStr(input.repo) ||
    !validStr(input.pr_title) ||
    !optStr(input.pr_url) ||
    !optNum(input.pr_number, 1, 999_999) ||
    !validStr(input.status) ||
    !optStr(input.language) ||
    !optStr(input.notes, MAX_LONG_TEXT) ||
    !validStr(input.submitted_at)
  ) return INVALID
  const { data } = await supabase
    .from("opensource_contributions")
    .insert(input)
    .select()
    .single()
  void logActivity("opensource.create", input.pr_title)
  revalidatePath("/dashboard/opensource")
  return data as OpenSourceContribution
}

export async function updateOpenSourceContribution(
  id: string,
  patch: Partial<{
    repo: string
    pr_title: string
    pr_url: string | null
    pr_number: number | null
    status: string
    language: string | null
    notes: string | null
    submitted_at: string
  }>,
) {
  if (!validId(id)) return INVALID
  // I only validate fields that are present in the patch.
  if (patch.repo !== undefined && !validStr(patch.repo)) return INVALID
  if (patch.pr_title !== undefined && !validStr(patch.pr_title)) return INVALID
  if (patch.pr_url !== undefined && !optStr(patch.pr_url)) return INVALID
  if (patch.pr_number !== undefined && !optNum(patch.pr_number, 1, 999_999)) return INVALID
  if (patch.status !== undefined && !validStr(patch.status)) return INVALID
  if (patch.language !== undefined && !optStr(patch.language)) return INVALID
  if (patch.notes !== undefined && !optStr(patch.notes, MAX_LONG_TEXT)) return INVALID
  if (patch.submitted_at !== undefined && !validStr(patch.submitted_at)) return INVALID
  await supabase
    .from("opensource_contributions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
  void logActivity("opensource.update", id)
  revalidatePath("/dashboard/opensource")
}

export async function deleteOpenSourceContribution(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("opensource_contributions", id)
  await supabase.from("opensource_contributions").delete().eq("id", id)
  void logActivity("opensource.delete", id)
  revalidatePath("/dashboard/opensource")
}

export async function bulkDeleteOpenSourceContributions(ids: string[]) {
  // I validate each ID individually before sending the bulk delete.
  if (!ids.length || ids.some((id) => !validId(id))) return INVALID
  await supabase.from("opensource_contributions").delete().in("id", ids)
  void logActivity("opensource.bulk_delete", `${ids.length} rows`)
  revalidatePath("/dashboard/opensource")
}

// ─── Blog Read Funnel ────────────────────────────────────────────────────────

// I describe one row returned by getBlogReadFunnel so the dashboard page is
// fully typed without importing from Supabase-generated types.
export type BlogReadFunnelRow = {
  slug: string
  post_type: string
  reached_25: number
  reached_50: number
  reached_75: number
  reached_100: number
  completion_rate: number | null
}

export async function getBlogReadFunnel(): Promise<BlogReadFunnelRow[]> {
  const { data, error } = await supabase.rpc("blog_read_funnel")
  if (error || !data) return []
  return data as BlogReadFunnelRow[]
}

export type PostsHeatmapCell = {
  dow: number
  hour: number
  count: number
}

export async function getPostsReadHeatmap(): Promise<PostsHeatmapCell[]> {
  const { data, error } = await supabase.rpc("posts_read_heatmap")
  if (error || !data) return []
  return data as PostsHeatmapCell[]
}

// ─── WakaTime Heatmap ────────────────────────────────────────────────────────

// I describe one row from wakatime_daily so the dashboard is fully typed.
export type WakatimeDayRow = {
  date: string
  total_seconds: number
  languages: { name: string; total_seconds: number }[]
  projects: { name: string; total_seconds: number }[]
  editors: { name: string; total_seconds: number }[]
  operating_systems?: { name: string; total_seconds: number }[]
  // 24-element array of seconds per UTC hour [h0..h23]; null on rows pre-dating the column.
  hours?: number[] | null
}

export async function getWakatimeHeatmap(): Promise<WakatimeDayRow[]> {
  // I fetch the last 365 days so the heatmap always shows a full year.
  const since = new Date()
  since.setDate(since.getDate() - 364)
  const { data, error } = await supabase
    .from("wakatime_daily")
    .select("date, total_seconds, languages, projects, editors, operating_systems, hours")
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: true })
  if (error || !data) return []
  return data as WakatimeDayRow[]
}

export type GitHubDay = { date: string; count: number }

export type GitHubContribTotals = {
  commits: number
  pullRequests: number
  reviews: number
  issues: number
}

export type GitHubStats = {
  days: GitHubDay[]
  totals: GitHubContribTotals
}

export async function getGitHubContributions(): Promise<GitHubStats> {
  const pat = process.env.GH_PAT ?? process.env.GITHUB_PAT
  const empty: GitHubStats = { days: [], totals: { commits: 0, pullRequests: 0, reviews: 0, issues: 0 } }
  if (!pat) return empty
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${pat}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          user(login: "zaccesss") {
            contributionsCollection {
              totalCommitContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
              totalIssueContributions
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }`,
      }),
      next: { revalidate: 3600 },
    })
    if (!res.ok) return empty
    const json = await res.json()
    const col = json?.data?.user?.contributionsCollection
    const weeks = col?.contributionCalendar?.weeks ?? []
    const days = weeks.flatMap((w: { contributionDays: { date: string; contributionCount: number }[] }) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
    )
    return {
      days,
      totals: {
        commits: col?.totalCommitContributions ?? 0,
        pullRequests: col?.totalPullRequestContributions ?? 0,
        reviews: col?.totalPullRequestReviewContributions ?? 0,
        issues: col?.totalIssueContributions ?? 0,
      },
    }
  } catch {
    return empty
  }
}

// ─── Data management ─────────────────────────────────────────

export async function clearAllJobs() {
  // I delete using neq on a dummy value to hit all rows without a WHERE clause,
  // which Supabase's REST API otherwise disallows.
  await supabase.from("jobs").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  void logActivity("scraper.cleared", "all scraped jobs")
  revalidatePath("/dashboard/applications")
}

export async function clearAllApplications() {
  const { data } = await supabase.from("applications").select("*").neq("id", "00000000-0000-0000-0000-000000000000")
  if (data && data.length > 0) {
    await supabase.from("trash").insert(
      data.map((row) => ({
        table_name: "applications",
        original_id: row.id,
        display_name: `${row.company} - ${row.role}`,
        data: row,
      }))
    )
  }
  await supabase.from("applications").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  void logActivity("application.cleared", `${data?.length ?? 0} applications moved to trash`)
  revalidatePath("/dashboard/applications")
}

// ─── Contacts / Network Tracker ─────────────────────────────

export type Contact = {
  id: string
  name: string
  company: string | null
  role: string | null
  how_met: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  github_url: string | null
  last_contact: string | null
  notes: string | null
  follow_up: boolean
  created_at: string
  updated_at: string
}

export async function getContacts(): Promise<Contact[]> {
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []) as Contact[]
}

export async function createContact(data: {
  name: string
  company?: string
  role?: string
  how_met?: string
  email?: string
  phone?: string
  linkedin_url?: string
  github_url?: string
  last_contact?: string | null
  notes?: string
  follow_up?: boolean
}) {
  if (!validStr(data.name)) return INVALID
  const { data: inserted } = await supabase
    .from("contacts")
    .insert({ ...data, follow_up: data.follow_up ?? false })
    .select()
    .single()
  void logActivity("contact.create", data.name)
  revalidatePath("/dashboard/contacts")
  return inserted
}

export async function updateContact(id: string, data: Partial<{
  name: string
  company: string
  role: string
  how_met: string
  email: string
  phone: string
  linkedin_url: string
  github_url: string
  last_contact: string | null
  notes: string
  follow_up: boolean
}>) {
  if (!validId(id)) return INVALID
  await supabase
    .from("contacts")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
  void logActivity("contact.update", data.name ?? id)
  revalidatePath("/dashboard/contacts")
}

export async function deleteContact(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("contacts", id)
  await supabase.from("contacts").delete().eq("id", id)
  void logActivity("contact.delete", id)
  revalidatePath("/dashboard/contacts")
}

export async function bulkDeleteContacts(ids: string[]) {
  if (!ids.length || ids.some((id) => !validId(id))) return INVALID
  for (const id of ids) await moveToTrash("contacts", id)
  await supabase.from("contacts").delete().in("id", ids)
  void logActivity("contact.bulk_delete", `${ids.length} contacts`)
  revalidatePath("/dashboard/contacts")
}

// ─── Trash / Recycle Bin ─────────────────────────────────────

export type TrashItem = {
  id: string
  table_name: string
  original_id: string
  display_name: string | null
  data: Record<string, unknown>
  deleted_at: string
  expires_at: string
}

export async function getTrash(): Promise<TrashItem[]> {
  const { data } = await supabase
    .from("trash")
    .select("*")
    .order("deleted_at", { ascending: false })
  return (data ?? []) as TrashItem[]
}

export async function restoreFromTrash(trashId: string) {
  if (!validId(trashId)) return INVALID
  const { data: item } = await supabase.from("trash").select("*").eq("id", trashId).single()
  if (!item) return INVALID
  const { id: _id, ...row } = item.data as Record<string, unknown>
  await supabase.from(item.table_name).insert({ id: item.original_id, ...row })
  await supabase.from("trash").delete().eq("id", trashId)
  void logActivity(`${item.table_name}.restore`, item.display_name ?? item.original_id)
}

export async function permanentlyDelete(trashId: string) {
  if (!validId(trashId)) return INVALID
  await supabase.from("trash").delete().eq("id", trashId)
  void logActivity("trash.permanent_delete", trashId)
}

export async function emptyTrash() {
  await supabase.from("trash").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  void logActivity("trash.empty")
}

// ─── Body Metrics ─────────────────────────────────────────────

export async function createBodyMetric(data: {
  date: string
  metric: string
  value: number
  unit: string
  notes?: string
}) {
  if (!validStr(data.date) || !validStr(data.metric) || !validStr(data.unit)) return INVALID
  if (!validNum(data.value, 0, 9999)) return INVALID
  if (!optStr(data.notes)) return INVALID
  const { error } = await supabase.from("body_metrics").insert({
    date: data.date,
    metric: data.metric,
    value: data.value,
    unit: data.unit,
    notes: data.notes?.trim() || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health")
  void logActivity("body_metric.create", `${data.metric}: ${data.value}${data.unit}`)
}

export async function deleteBodyMetric(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("body_metrics", id)
  revalidatePath("/dashboard/health")
  void logActivity("body_metric.delete", id)
}

// ─── University ──────────────────────────────────────────────

export async function createUniModule(data: {
  code: string; name: string; credits: number; year: number
  semester: number; target_grade?: string; color?: string; order_index?: number
}) {
  if (!validStr(data.code) || !validStr(data.name)) return INVALID
  if (!validNum(data.credits, 1, 240) || !validNum(data.year, 1, 10) || !validNum(data.semester, 1, 4)) return INVALID
  const { error } = await supabase.from("uni_modules").insert({
    code: data.code.trim(), name: data.name.trim(),
    credits: data.credits, year: data.year, semester: data.semester,
    target_grade: data.target_grade?.trim() || null,
    color: data.color ?? "#6366f1", order_index: data.order_index ?? 0,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.module.create", data.code)
}

export async function deleteUniModule(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("uni_modules", id)
  revalidatePath("/dashboard/university")
  void logActivity("uni.module.delete", id)
}

export async function updateUniModule(id: string, data: Partial<{
  code: string; name: string; credits: number; target_grade: string | null
  color: string; active: boolean; order_index: number
}>) {
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("uni_modules").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.module.update", id)
}

export async function createUniDeadline(data: {
  module_id?: string; title: string; type: string
  due_date: string; weight_pct?: number; notes?: string; semester?: number
}) {
  if (!validStr(data.title) || !validStr(data.type) || !validStr(data.due_date)) return INVALID
  if (!optStr(data.notes) || !optNum(data.weight_pct, 0, 100)) return INVALID
  const { data: inserted, error } = await supabase.from("uni_deadlines").insert({
    module_id: data.module_id || null, title: data.title.trim(), type: data.type,
    due_date: data.due_date, weight_pct: data.weight_pct ?? null,
    notes: data.notes?.trim() || null, semester: data.semester ?? 1, status: "not_started",
  }).select("id, title, type, due_date, status").single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.deadline.create", data.title)
  if (inserted) {
    void syncDeadlineToLinear(inserted).then(async (issueId) => {
      if (issueId) await supabase.from("uni_deadlines").update({ linear_issue_id: issueId }).eq("id", inserted.id)
    })
  }
}

export async function updateUniDeadline(id: string, data: Partial<{
  status: string; submitted_at: string | null; grade_received: string | null; notes: string | null
  title: string; due_date: string; weight_pct: number | null
}>) {
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("uni_deadlines").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.deadline.update", id)
  if (data.status) {
    const { data: row } = await supabase.from("uni_deadlines").select("id, title, type, due_date, status, linear_issue_id").eq("id", id).single()
    if (row) void syncDeadlineToLinear(row)
  }
}

export async function bulkSyncApplicationsToLinear(): Promise<{ synced: number; skipped: number }> {
  const { data: apps } = await supabase
    .from("applications")
    .select("id, company, role, type, status, url, linear_issue_id")
    .is("linear_issue_id", null)
    .neq("status", "Not Applied")
  if (!apps) return { synced: 0, skipped: 0 }

  let synced = 0
  for (const a of apps) {
    const issueId = await syncApplicationToLinear(a)
    if (issueId) {
      await supabase.from("applications").update({ linear_issue_id: issueId }).eq("id", a.id)
      synced++
    }
  }
  return { synced, skipped: apps.length - synced }
}

export async function bulkSyncDeadlinesToLinear(): Promise<{ synced: number; skipped: number }> {
  const { data: deadlines } = await supabase
    .from("uni_deadlines")
    .select("id, title, type, due_date, status, linear_issue_id")
    .is("linear_issue_id", null)
  if (!deadlines) return { synced: 0, skipped: 0 }

  let synced = 0
  for (const d of deadlines) {
    const issueId = await syncDeadlineToLinear(d)
    if (issueId) {
      await supabase.from("uni_deadlines").update({ linear_issue_id: issueId }).eq("id", d.id)
      synced++
    }
  }
  return { synced, skipped: deadlines.length - synced }
}

export async function deleteUniDeadline(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("uni_deadlines", id)
  revalidatePath("/dashboard/university")
  void logActivity("uni.deadline.delete", id)
}

export async function createUniSubmission(data: {
  deadline_id?: string; module_id?: string; title: string
  file_name?: string; file_url?: string; notes?: string
}) {
  if (!validStr(data.title)) return INVALID
  if (!optStr(data.file_name) || !optStr(data.file_url) || !optStr(data.notes)) return INVALID
  const { error } = await supabase.from("uni_submissions").insert({
    deadline_id: data.deadline_id || null, module_id: data.module_id || null,
    title: data.title.trim(), file_name: data.file_name || null,
    file_url: data.file_url || null, notes: data.notes?.trim() || null,
    submitted_at: new Date().toISOString(),
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.submission.create", data.title)
}

export async function deleteUniSubmission(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("uni_submissions", id)
  revalidatePath("/dashboard/university")
  void logActivity("uni.submission.delete", id)
}

export async function createUniNote(data: {
  module_id?: string; title: string; content?: string; type?: string; tags?: string[]
}) {
  if (!validStr(data.title)) return INVALID
  if (!optStr(data.content, MAX_NOTE_TEXT) || !optStr(data.type)) return INVALID
  const { error } = await supabase.from("uni_notes").insert({
    module_id: data.module_id || null, title: data.title.trim(),
    content: data.content?.trim() || "", type: data.type ?? "lecture",
    tags: data.tags ?? [], pinned: false,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.note.create", data.title)
}

export async function updateUniNote(id: string, data: Partial<{
  title: string; content: string; module_id: string | null; type: string; tags: string[]; pinned: boolean
}>) {
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("uni_notes").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.note.update", id)
}

export async function deleteUniNote(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("uni_notes", id)
  revalidatePath("/dashboard/university")
  void logActivity("uni.note.delete", id)
}

export async function createUniResource(data: {
  module_id?: string; title: string; url?: string; type?: string; notes?: string; semester?: number
}) {
  if (!validStr(data.title)) return INVALID
  if (!optStr(data.url) || !optStr(data.notes) || !optStr(data.type)) return INVALID
  const { error } = await supabase.from("uni_resources").insert({
    module_id: data.module_id || null, title: data.title.trim(),
    url: data.url?.trim() || null, type: data.type ?? "link",
    notes: data.notes?.trim() || null, semester: data.semester ?? 1,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.resource.create", data.title)
}

export async function deleteUniResource(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("uni_resources", id)
  revalidatePath("/dashboard/university")
  void logActivity("uni.resource.delete", id)
}

export async function createLibraryBook(data: {
  title: string; author?: string; isbn?: string; module_id?: string
  borrowed_at: string; due_date: string; notes?: string
}) {
  if (!validStr(data.title) || !validStr(data.borrowed_at) || !validStr(data.due_date)) return INVALID
  if (!optStr(data.author) || !optStr(data.isbn) || !optStr(data.notes)) return INVALID
  const { error } = await supabase.from("uni_library_books").insert({
    title: data.title.trim(), author: data.author?.trim() || null,
    isbn: data.isbn?.trim() || null, module_id: data.module_id || null,
    borrowed_at: data.borrowed_at, due_date: data.due_date,
    notes: data.notes?.trim() || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.library.create", data.title)
}

export async function returnLibraryBook(id: string) {
  if (!validId(id)) return INVALID
  await supabase.from("uni_library_books").update({ returned_at: new Date().toISOString().split("T")[0] }).eq("id", id)
  revalidatePath("/dashboard/university")
  void logActivity("uni.library.return", id)
}

export async function deleteLibraryBook(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("uni_library_books", id)
  revalidatePath("/dashboard/university")
  void logActivity("uni.library.delete", id)
}

// ─── Faith ───────────────────────────────────────────────────

export async function createFaithEntry(data: {
  date: string
  type: string
  title?: string
  notes?: string
  duration_m?: number
  completed?: boolean
}) {
  if (!validStr(data.date) || !validStr(data.type)) return INVALID
  if (!optStr(data.title) || !optStr(data.notes)) return INVALID
  if (!optNum(data.duration_m, 0, 1440)) return INVALID
  const { error } = await supabase.from("faith_entries").insert({
    date: data.date,
    type: data.type,
    title: data.title?.trim() || null,
    notes: data.notes?.trim() || null,
    duration_m: data.duration_m ?? null,
    completed: data.completed ?? true,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/faith")
  void logActivity("faith.create", data.title ?? data.type)
}

export async function deleteFaithEntry(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("faith_entries", id)
  revalidatePath("/dashboard/faith")
  void logActivity("faith.delete", id)
}

export async function updateFaithEntry(id: string, data: {
  title?: string
  notes?: string
  duration_m?: number
  completed?: boolean
}) {
  if (!validId(id)) return INVALID
  if (!optStr(data.title) || !optStr(data.notes)) return INVALID
  if (!optNum(data.duration_m, 0, 1440)) return INVALID
  const { error } = await supabase.from("faith_entries").update({
    ...(data.title !== undefined && { title: data.title.trim() || null }),
    ...(data.notes !== undefined && { notes: data.notes.trim() || null }),
    ...(data.duration_m !== undefined && { duration_m: data.duration_m }),
    ...(data.completed !== undefined && { completed: data.completed }),
  }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/faith")
  void logActivity("faith.update", id)
}

// ─── Study ───────────────────────────────────────────────────

export async function createStudySession(data: {
  date: string
  subject: string
  duration_m: number
  notes?: string
  technique?: string
  productive?: boolean
}) {
  if (!validStr(data.date) || !validStr(data.subject)) return INVALID
  if (!validNum(data.duration_m, 0, 1440)) return INVALID
  if (!optStr(data.notes) || !optStr(data.technique)) return INVALID
  const { error } = await supabase.from("study_sessions").insert({
    date: data.date,
    subject: data.subject.trim(),
    duration_m: data.duration_m,
    notes: data.notes?.trim() || null,
    technique: data.technique?.trim() || null,
    productive: data.productive ?? true,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/study")
  void logActivity("study.create", `${data.subject} - ${data.duration_m}min`)
}

export async function deleteStudySession(id: string) {
  if (!validId(id)) return INVALID
  await moveToTrash("study_sessions", id)
  revalidatePath("/dashboard/study")
  void logActivity("study.delete", id)
}

export async function updateStudySession(id: string, data: {
  subject?: string
  duration_m?: number
  notes?: string
  technique?: string
  productive?: boolean
}) {
  if (!validId(id)) return INVALID
  if (!optStr(data.subject) || !optStr(data.notes) || !optStr(data.technique)) return INVALID
  if (data.duration_m !== undefined && !validNum(data.duration_m, 0, 1440)) return INVALID
  const { error } = await supabase.from("study_sessions").update({
    ...(data.subject !== undefined && { subject: data.subject.trim() }),
    ...(data.duration_m !== undefined && { duration_m: data.duration_m }),
    ...(data.notes !== undefined && { notes: data.notes.trim() || null }),
    ...(data.technique !== undefined && { technique: data.technique.trim() || null }),
    ...(data.productive !== undefined && { productive: data.productive }),
  }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/study")
  void logActivity("study.update", id)
}
