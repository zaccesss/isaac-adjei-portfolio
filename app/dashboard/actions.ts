"use server"

// All dashboard mutations live here as Next.js server actions so the Supabase
// service key never ships to the browser and revalidatePath can be called directly.
// I use server actions rather than direct client-side Supabase calls so the service key never ships to the browser.
// Every action here is intentionally thin - validate, write, revalidate. No business logic lives here.
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache"
import { syncApplicationToLinear, syncDeadlineToLinear } from "@/lib/linear-sync"
import { getStoredGithubContributions } from "@/lib/github-contributions"
import { encryptVaultData, decryptVaultRow, vaultEncryptionReady } from "@/lib/vault-crypto"
import { SOFT_DELETE_TABLES, purgeSoftDeleted } from "@/lib/trash"

// I require a valid dashboard session for EVERY server action below. Next.js server actions
// are publicly callable POST endpoints, so without an explicit check inside each one an
// unauthenticated request could invoke them directly. I throw rather than return so a missing
// session can never be silently treated as a valid no-op. This is the Next.js-recommended
// pattern - auth inside the action itself, not relying on the middleware perimeter.
async function requireAuth() {
  const session = await auth()
  if (!session) throw new Error("Unauthorised")
}

// I read config without an auth check for the cached theme reader below, which runs inside
// unstable_cache (outside request context, where auth() has no cookies). The exported
// getConfig() wraps this WITH requireAuth so direct calls are still gated.
async function readConfig(key: string) {
  const { data } = await supabase.from("config").select("value").eq("key", key).single()
  return data?.value ?? null
}

// I fire-and-forget activity logs so a logging failure never blocks the actual action.
// The activity_log table must exist in Supabase:
//   CREATE TABLE activity_log (
//     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     action text NOT NULL,
//     detail text,
//     created_at timestamptz NOT NULL DEFAULT now()
//   );
export async function logActivity(action: string, detail?: string) {
  // logActivity is an exported server action, so it is a publicly callable POST endpoint and must
  // gate on auth like every other action. All internal callers already run after their own auth
  // check (the API routes 401 before reaching here, the actions call requireAuth first), so this
  // guard never trips for legitimate calls - it only blocks a direct unauthenticated invocation.
  await requireAuth()
  const { error } = await supabase.from("activity_log").insert({ action, detail: detail ?? null })
  if (error) console.error("[activity_log]", error.message, error.details)
}

type TrashChildSpec = { table: string; fk: string }

async function moveToTrash(tableName: string, id: string, displayName?: string, children?: TrashChildSpec[]) {
  // maybeSingle (not single) so a missing row reads as null rather than an error. If the read
  // genuinely fails or the backup insert fails, throw so the calling delete aborts BEFORE removing
  // the row - otherwise a failed backup would let the caller hard-delete with nothing recoverable.
  const { data, error } = await supabase.from(tableName).select("*").eq("id", id).maybeSingle()
  if (error) throw new Error(`Trash backup could not read ${tableName} ${id}: ${error.message}`)
  if (!data) return
  // Child rows (habit logs, streak check-ins, module assessments) ride inside the snapshot
  // under _children, so a restore brings the parent back WITH its history. Paged: a years-old
  // daily habit can exceed PostgREST's 1000-row cap.
  const snapshot: Record<string, unknown> = { ...data }
  if (children && children.length > 0) {
    const all: Record<string, unknown[]> = {}
    for (const child of children) {
      const rows: unknown[] = []
      for (let from = 0; ; from += 1000) {
        const { data: page, error: childErr } = await supabase
          .from(child.table)
          .select("*")
          .eq(child.fk, id)
          .range(from, from + 999)
        if (childErr) throw new Error(`Trash backup could not read ${child.table} for ${tableName} ${id}: ${childErr.message}`)
        if (!page || page.length === 0) break
        rows.push(...page)
        if (page.length < 1000) break
      }
      if (rows.length > 0) all[child.table] = rows
    }
    if (Object.keys(all).length > 0) snapshot._children = all
  }
  const { error: insErr } = await supabase.from("trash").insert({
    table_name: tableName,
    original_id: id,
    display_name: displayName ?? (typeof data.name === "string" ? data.name : null),
    data: snapshot,
  })
  if (insErr) throw new Error(`Trash backup failed for ${tableName} ${id}: ${insErr.message}`)
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
  // Every table primary key is a uuid, so I require that shape rather than any
  // non-empty string - this rejects malformed or injected ids early.
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
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
  await requireAuth()
  if (
    !validStr(data.title) ||
    !optStr(data.description, MAX_LONG_TEXT) ||
    !validStr(data.category) ||
    !validStr(data.status) ||
    !optStr(data.target_date) ||
    !validNum(data.progress, 0, 100)
  ) return INVALID
  // target_date is a date column and the form submits "" when its picker is empty (the common
  // case - a goal with no deadline); Postgres rejects ""::date, so coerce to null and check the
  // error rather than silently logging a create that never landed. Same pattern as createVaultEntry.
  const { error } = await supabase.from("goals").insert({ ...data, target_date: data.target_date || null })
  if (error) return { error: error.message }
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
  await requireAuth()
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
  // An edit resubmits the whole form, so an empty target_date arrives as "" and Postgres rejects
  // it - coerce to null and surface the error so a failed update no longer looks saved.
  if (data.target_date === "") data.target_date = null as unknown as string
  const { error } = await supabase.from("goals").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("goal.update", data.title)
  revalidatePath("/dashboard/goals")
}

export async function deleteGoal(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("goals", id)
  const { error } = await supabase.from("goals").delete().eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
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
  const { data: inserted, error } = await supabase.from("modules").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
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
  const { error } = await supabase.from("modules").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("module.update", data.name ?? id)
  revalidatePath("/dashboard/modules")
}

export async function deleteModule(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  // The assessments ride inside the snapshot so a restore brings the module back WITH its marks.
  await moveToTrash("modules", id, undefined, [{ table: "assessments", fk: "module_id" }])
  const { error: childErr } = await supabase.from("assessments").delete().eq("module_id", id)
  if (childErr) return { error: childErr.message }
  const { error } = await supabase.from("modules").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("module.delete", id)
  revalidatePath("/dashboard/modules")
}

export async function updateModuleStatus(id: string, status: string) {
  await requireAuth()
  // I split status into its own action because it fires on every Select change
  // and I do not want the caller to build a full update payload just to flip one field
  if (!validId(id) || !validStr(status)) return INVALID
  const { error } = await supabase.from("modules").update({ status }).eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
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
  const { data: inserted, error } = await supabase.from("assessments").insert(data).select().single()
  if (error) return { error: error.message }
  void logActivity("grade.create", data.name)
  revalidatePath("/dashboard/modules")
  return inserted
}

export async function updateAssessmentMark(id: string, mark: number | null) {
  await requireAuth()
  // I expose this as a dedicated action because mark entry is the most frequent operation
  // in the modules view - students click a row, type a number and hit Enter
  if (!validId(id)) return INVALID
  if (mark !== null && !validNum(mark, 0, 200)) return INVALID
  const { error } = await supabase.from("assessments").update({ mark_achieved: mark }).eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
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
  const { error } = await supabase.from("assessments").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("grade.update", data.name ?? id)
  revalidatePath("/dashboard/modules")
}

export async function deleteAssessment(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("assessments", id)
  const { error } = await supabase.from("assessments").delete().eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
  // Scraper-shaped rows (status='scraped') arrive with only the bare minimum populated, so I relax
  // role/type/starred to optional for them and require just a company + status. Manually-created
  // rows still go through the full strict validation below.
  const isScraped = data.status === "scraped"
  if (
    !validStr(data.company) ||
    (!isScraped && !validStr(data.role)) ||
    (!isScraped && !validStr(data.type)) ||
    !optStr(data.applied_date) ||
    !optStr(data.deadline) ||
    !validStr(data.status) ||
    !optStr(data.notes, MAX_LONG_TEXT) ||
    !optStr(data.url) ||
    (!isScraped && typeof data.starred !== "boolean") ||
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
  // I return the inserted row so the client can optimistically show the new card without a refetch.
  // applied_date/deadline/opening_date/last_year_opening are date columns and the form submits ""
  // when a picker is empty (an application not yet applied to has no applied date - the common
  // case); Postgres rejects ""::date, so coerce empties to null and check the error rather than
  // logging a phantom create. Same pattern as createVaultEntry.
  const { data: inserted, error } = await supabase.from("applications").insert({
    ...data,
    applied_date: data.applied_date || null,
    deadline: data.deadline || null,
    opening_date: data.opening_date || null,
    last_year_opening: data.last_year_opening || null,
  }).select().single()
  if (error) return { error: error.message }
  void logActivity("application.create", `${data.company} - ${data.role}`)
  if (inserted) {
    void syncApplicationToLinear({ ...inserted, linear_issue_id: null }).then(async (issueId) => {
      if (issueId) await supabase.from("applications").update({ linear_issue_id: issueId }).eq("id", inserted.id).is("linear_issue_id", null)
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
  await requireAuth()
  if (!validId(id)) return INVALID
  // An edit resubmits the whole form, so empty date pickers arrive as "" - coerce to null so
  // Postgres accepts the update and surface the error so the client's revert path can fire.
  for (const k of ["applied_date", "deadline", "opening_date", "last_year_opening"] as const)
    if (data[k] === "") (data as Record<string, unknown>)[k] = null
  // Moving to Applied or Submitted stamps applied_date (today, London) when it was not set by
  // hand, so the applications timeline stays real without me filling the date every time.
  if (data.status && ["applied", "submitted"].includes(data.status.toLowerCase()) && !data.applied_date) {
    const { data: existing } = await supabase.from("applications").select("applied_date").eq("id", id).single()
    if (existing && !existing.applied_date) {
      data.applied_date = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" })
    }
  }
  const { error } = await supabase.from("applications").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("application.update", data.status ? `status → ${data.status}` : (data.company ?? id))
  if (data.status) {
    const { data: row } = await supabase.from("applications").select("id,company,role,type,url,linear_issue_id").eq("id", id).single()
    if (row) void syncApplicationToLinear({ ...row, status: data.status }).then(async (issueId) => {
      if (issueId) await supabase.from("applications").update({ linear_issue_id: issueId }).eq("id", id).is("linear_issue_id", null)
    })
  }
  revalidatePath("/dashboard/applications")
}

export async function deleteApplication(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("applications", id)
  const { error } = await supabase.from("applications").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("application.delete", id)
  revalidatePath("/dashboard/applications")
}

export async function bulkDeleteApplications(ids: string[]) {
  await requireAuth()
  if (!ids.length || ids.some((id) => !validId(id))) return INVALID
  // I back up every row to trash first and return early if any backup fails, so the delete below
  // never removes a row that could not be recovered.
  try {
    for (const id of ids) await moveToTrash("applications", id)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Trash backup failed" }
  }
  const { error } = await supabase.from("applications").delete().in("id", ids)
  if (error) return { error: error.message }
  void logActivity("application.bulk_delete", `${ids.length} applications`)
  revalidatePath("/dashboard/applications")
}

export async function archiveApplication(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("applications").update({ archived: true }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("application.archive", id)
  revalidatePath("/dashboard/applications")
}

export async function reopenApplication(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("applications").update({ archived: false }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("application.reopen", id)
  revalidatePath("/dashboard/applications")
}

export async function updateInterviewPrep(
  id: string,
  prep: { notes: string; questions: { id: string; text: string; done: boolean }[]; company_research: string }
) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("applications").update({ interview_prep: prep }).eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
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
  // Without the encryption key a secret cannot be encrypted, so fail with a clear message rather
  // than letting encryptVaultData throw an opaque error deep in the insert.
  if (!vaultEncryptionReady()) return { error: "Vault encryption is not configured. Set VAULT_ENCRYPTION_KEY then reload before saving a secret." }
  // I return the full inserted row so the client can splice it into the local entries list
  // in sorted order without waiting for a page refetch.
  // key_expiry is the vault table's only date column and the form submits "" when its picker is
  // empty (always, for types like secure_note that never render it) - Postgres rejects ""::date,
  // so I coerce it to null. I also check the insert error now: ignoring it meant a failed insert
  // returned null (which the dialog treats as a cancel) while still logging phantom activity.
  const { data: inserted, error } = await supabase
    .from("vault")
    .insert(encryptVaultData({ ...data, key_expiry: data.key_expiry || null }))
    .select()
    .single()
  if (error) return { error: error.message }
  void logActivity("vault.create", data.name)
  revalidatePath("/dashboard/vault")
  // Return the decrypted row so the client can splice it into the local list without a refetch.
  return decryptVaultRow(inserted)
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
  await requireAuth()
  if (!validId(id)) return INVALID
  if (!vaultEncryptionReady()) return { error: "Vault encryption is not configured. Set VAULT_ENCRYPTION_KEY then reload before saving a secret." }
  // Same ""::date coercion as createVaultEntry - edits resubmit the whole form, so an empty
  // key-expiry picker sends "" and Postgres would reject the update.
  if (data.key_expiry === "") data.key_expiry = null
  const { error } = await supabase.from("vault").update(encryptVaultData(data)).eq("id", id)
  // I surface the error so the client's revert path (throw -> restore previous list) fires
  if (error) return { error: error.message }
  void logActivity("vault.update", id)
  revalidatePath("/dashboard/vault")
}

export async function deleteVaultEntry(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("vault", id)
  const { error } = await supabase.from("vault").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("vault.delete", id)
  revalidatePath("/dashboard/vault")
}

// ─── Diary ───────────────────────────────────────────────────

export async function createDiaryEntry(data: {
  title: string
  content: string
  mood: string
}) {
  await requireAuth()
  if (
    !validStr(data.title) ||
    !validStr(data.content, MAX_DIARY_TEXT) ||
    !validStr(data.mood)
  ) return INVALID
  // I return the inserted row so the DiaryClient can prepend it to the top of the list immediately
  // the created_at timestamp comes back from Supabase so the order is correct without client-side guessing
  const { data: inserted, error } = await supabase.from("diary").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (
    !validId(id) ||
    !optStr(data.title) ||
    !optStr(data.content, MAX_DIARY_TEXT) ||
    !optStr(data.mood)
  ) return INVALID
  // I always stamp updated_at server-side so the value is the true server time
  // not whatever the client clock happens to say
  const { error } = await supabase.from("diary").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("diary.update", data.title ?? id)
  revalidatePath("/dashboard/diary")
}

export async function deleteDiaryEntry(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("diary", id)
  const { error } = await supabase.from("diary").delete().eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
  if (
    !validStr(data.title) ||
    !validStr(data.content, MAX_NOTE_TEXT) ||
    !validStr(data.folder) ||
    !Array.isArray(data.tags) ||
    typeof data.pinned !== "boolean" ||
    typeof data.locked !== "boolean" ||
    !optStr(data.color)
  ) return INVALID
  const { data: inserted, error } = await supabase.from("notes").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (!validId(id)) return INVALID
  // I spread updated_at on the server side for the same reason as updateDiaryEntry
  // - the client's clock drifts and I do not want stale sort orders
  const { error } = await supabase.from("notes").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("note.update", data.title ?? id)
  revalidatePath("/dashboard/notes")
}

export async function deleteNote(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("notes", id)
  const { error } = await supabase.from("notes").delete().eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
  if (
    !validStr(data.name) ||
    !validStr(data.icon) ||
    !optStr(data.description, MAX_LONG_TEXT) ||
    !validStr(data.color) ||
    !validNum(data.order_index, 0, 9999)
  ) return INVALID
  const { data: inserted, error } = await supabase.from("streaks").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("streaks").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("streak.update", data.name ?? id)
  revalidatePath("/dashboard/streaks")
}

export async function deleteStreak(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  // The check-in logs ride inside the snapshot so a restore brings the streak back WITH its history.
  await moveToTrash("streaks", id, undefined, [{ table: "streak_logs", fk: "streak_id" }])
  const { error: logsErr } = await supabase.from("streak_logs").delete().eq("streak_id", id)
  if (logsErr) return { error: logsErr.message }
  const { error } = await supabase.from("streaks").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("streak.delete", id)
  revalidatePath("/dashboard/streaks")
}

export async function resetStreak(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  // A reset wipes every check-in, so snapshot them first: the streak row plus its logs go to the
  // trash and restoring that entry undoes the reset (the row upserts over itself, the logs
  // re-insert). Without this a reset was the only destructive action with no recovery copy at all.
  await moveToTrash("streaks", id, undefined, [{ table: "streak_logs", fk: "streak_id" }])
  // I clear every check-in for this streak so the current and longest streak both fall back to zero.
  const { error } = await supabase.from("streak_logs").delete().eq("streak_id", id)
  if (error) return { error: error.message }
  void logActivity("streak.reset", id)
  revalidatePath("/dashboard/streaks")
}

export async function checkInStreak(streakId: string, date: string) {
  await requireAuth()
  // I upsert on the composite key (streak_id, date) so re-checking the same day is idempotent
  // - double-clicking the button or a race condition will not create duplicate rows
  if (!validId(streakId) || !validStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return INVALID
  const { error } = await supabase.from("streak_logs").upsert({ streak_id: streakId, date, completed: true }, { onConflict: "streak_id,date" })
  if (error) return { error: error.message }
  void logActivity("streak.checkin", date)
  revalidatePath("/dashboard/streaks")
}

export async function undoStreakCheckIn(streakId: string, date: string) {
  await requireAuth()
  // I delete rather than setting completed: false so there is no ambiguity
  // between "never checked in" and "checked in then undone" - both look the same in the streak calc
  if (!validId(streakId) || !validStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return INVALID
  const { error } = await supabase.from("streak_logs").delete().eq("streak_id", streakId).eq("date", date)
  if (error) return { error: error.message }
  void logActivity("streak.undo_checkin", date)
  revalidatePath("/dashboard/streaks")
}

// ─── Habits ─────────────────────────────────────────────────

export async function createHabit(data: { name: string; color?: string; description?: string }) {
  await requireAuth()
  if (!validStr(data.name)) return INVALID
  const { data: inserted, error } = await supabase.from("habits").insert({
    name: data.name.trim(),
    color: data.color ?? "#3b82f6",
    description: data.description ?? null,
    frequency: "daily",
    active: true,
  }).select().single()
  if (error) return { error: error.message }
  void logActivity("habit.create", data.name)
  revalidatePath("/dashboard/habits")
  return inserted
}

export async function updateHabit(id: string, data: { name?: string; color?: string; description?: string | null }) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const patch: Record<string, unknown> = {}
  if (data.name !== undefined) { if (!validStr(data.name)) return INVALID; patch.name = data.name.trim() }
  if (data.color !== undefined) patch.color = data.color
  if (data.description !== undefined) patch.description = data.description?.trim() || null
  const { error } = await supabase.from("habits").update(patch).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("habit.update", id)
  revalidatePath("/dashboard/habits")
}

export async function deleteHabit(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  // The logs ride inside the snapshot so a restore brings the habit back WITH its history.
  await moveToTrash("habits", id, undefined, [{ table: "habit_logs", fk: "habit_id" }])
  // I delete the logs first, then the habit itself; check both writes so a failure of either is
  // surfaced rather than silently leaving orphaned logs or a phantom delete.
  const { error: logsErr } = await supabase.from("habit_logs").delete().eq("habit_id", id)
  if (logsErr) return { error: logsErr.message }
  const { error } = await supabase.from("habits").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("habit.delete", id)
  revalidatePath("/dashboard/habits")
}

export async function checkInHabit(habitId: string, date: string) {
  await requireAuth()
  if (!validId(habitId) || !validStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return INVALID
  const { error } = await supabase.from("habit_logs").upsert({ habit_id: habitId, date, completed: true }, { onConflict: "habit_id,date" })
  if (error) return { error: error.message }
  void logActivity("habit.checkin", date)
  revalidatePath("/dashboard/habits")
}

export async function undoHabitCheckIn(habitId: string, date: string) {
  await requireAuth()
  if (!validId(habitId) || !validStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return INVALID
  const { error } = await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("date", date)
  if (error) return { error: error.message }
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
  await requireAuth()
  if (
    !validStr(data.name) ||
    !validStr(data.type) ||
    !validStr(data.icon) ||
    !validStr(data.color) ||
    !validNum(data.order_index, 0, 9999) ||
    !optStr(data.subtype)
  ) return INVALID
  const { data: inserted, error } = await supabase.from("health_sections").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("health_sections").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("health.update", id)
  revalidatePath("/dashboard/health")
}

export async function deleteHealthSection(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("health_sections", id)
  const { error } = await supabase.from("health_sections").delete().eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
  if (
    !validStr(data.section_id) ||
    !validStr(data.day_label) ||
    !Array.isArray(data.exercises) ||
    !optStr(data.notes, MAX_LONG_TEXT) ||
    !validNum(data.order_index, 0, 9999)
  ) return INVALID
  const { data: inserted, error } = await supabase.from("health_workouts").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (!validId(id)) return INVALID
  // I always refresh updated_at server-side so I know the true last-modified time
  const { error } = await supabase.from("health_workouts").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("health.update", data.day_label ?? id)
  revalidatePath("/dashboard/health")
}

export async function deleteHealthWorkout(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("health_workouts", id)
  const { error } = await supabase.from("health_workouts").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("health.workout.delete", id)
  revalidatePath("/dashboard/health")
}

export async function updateHealthNutrition(id: string, data: Partial<{
  category: string
  items: string[]   // I store food lists as a plain string array - simple enough that JSON in Postgres works fine
  rules: string[]
  order_index: number
}>) {
  await requireAuth()
  if (
    !validId(id) ||
    !optStr(data.category) ||
    (data.items !== undefined && !Array.isArray(data.items)) ||
    (data.rules !== undefined && !Array.isArray(data.rules)) ||
    !optNum(data.order_index, 0, 9999)
  ) return INVALID
  const { error } = await supabase.from("health_nutrition").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("health.update", data.category ?? id)
  revalidatePath("/dashboard/health")
}

export async function createHealthNutrition(data: {
  category: string
  items: string[]
  rules: string[]
  order_index: number
}) {
  await requireAuth()
  if (
    !validStr(data.category) ||
    !Array.isArray(data.items) ||
    !Array.isArray(data.rules) ||
    !validNum(data.order_index, 0, 9999)
  ) return INVALID
  const { data: inserted, error } = await supabase.from("health_nutrition").insert(data).select().single()
  if (error) return { error: error.message }
  void logActivity("health.create", data.category)
  revalidatePath("/dashboard/health")
  return inserted
}

export async function deleteHealthNutrition(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("health_nutrition", id)
  const { error } = await supabase.from("health_nutrition").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("health.nutrition.delete", id)
  revalidatePath("/dashboard/health")
}

// ─── Config ──────────────────────────────────────────────────

// I store arbitrary JSON blobs in a single config table keyed by a string rather than creating a table per setting.
// This keeps the schema stable even as I add new dashboard preferences over time.
// Only the keys below may pass through these two actions - dashboard_pin_hash is deliberately
// absent, so the PIN hash can never be read or replaced through a session-callable action.
// A new dashboard preference gets added here when its feature lands.
const CONFIG_KEYS = new Set(["course_data", "ical_feeds", "me_profile", "theme_preference", "us_data"])
// Caps a config value well above the largest current blob, so a caller cannot store unbounded JSON.
const CONFIG_VALUE_MAX_CHARS = 64_000

export async function getConfig(key: string) {
  await requireAuth()
  if (!CONFIG_KEYS.has(key)) return null
  const { data } = await supabase.from("config").select("value").eq("key", key).single()
  // I return null rather than throwing so callers can treat a missing key as "use default"
  return data?.value ?? null
}

// I cache the theme preference for 5 minutes so every protected dashboard page navigation
// doesn't fire a Supabase round trip. setConfig expires the "config-theme" tag on change so the
// new value is picked up straight away.
export const getCachedTheme = unstable_cache(
  () => readConfig("theme_preference"),
  ["theme_preference"],
  { revalidate: 300, tags: ["config-theme"] }
)

export async function setConfig(key: string, value: unknown) {
  await requireAuth()
  if (!validStr(key) || !CONFIG_KEYS.has(key)) return INVALID
  if (JSON.stringify(value ?? null).length > CONFIG_VALUE_MAX_CHARS) return INVALID
  // I upsert on the key column so the first write creates the row and subsequent ones update it
  // - no separate "does this key exist?" check needed, which would waste a round trip
  const { error } = await supabase.from("config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) return { error: error.message }
  // I expire the theme cache immediately (expire: 0) rather than via the "default" cache-life profile.
  // The default profile bounds invalidation by its own stale/expire window, so a theme change could
  // lag a navigation or two - { expire: 0 } makes the next read pick up the new value straight away.
  if (key === "theme_preference") revalidateTag("config-theme", { expire: 0 })
  void logActivity("settings.change", key)
}

export type IcalFeed = { url: string; name: string; color: string }

export async function getIcalFeeds(): Promise<IcalFeed[]> {
  await requireAuth()
  const val = await getConfig("ical_feeds")
  const base: IcalFeed[] = Array.isArray(val) ? (val as IcalFeed[]) : []
  // Merge in the env-var timetable feed if set and not already present
  if (process.env.ICAL_TIMETABLE_URL && !base.find((f) => f.url === process.env.ICAL_TIMETABLE_URL)) {
    base.unshift({ url: process.env.ICAL_TIMETABLE_URL, name: "Timetable", color: "#6366f1" })
  }
  return base
}

export async function saveIcalFeeds(feeds: IcalFeed[]) {
  await requireAuth()
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
  await requireAuth()
  if (
    !optStr(data.building) ||
    !optStr(data.studying) ||
    !optStr(data.focused_on) ||
    !optStr(data.listening_to)
  ) return INVALID
  const { error } = await supabase.from("config").upsert(
    { key: "now_status", value: data, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  )
  if (error) return { error: error.message }
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
  await requireAuth()
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
  const { data: inserted, error } = await supabase.from("course_modules").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("course_modules").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/course")
}

export async function deleteCourseModule(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("course_modules", id)
  const { error } = await supabase.from("course_modules").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("course_module.delete", id)
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
  await requireAuth()
  if (
    !validStr(data.name) ||
    !validStr(data.category) ||
    !validStr(data.status) ||
    !validStr(data.priority) ||
    !optStr(data.notes, MAX_LONG_TEXT)
  ) return INVALID
  const { data: inserted, error } = await supabase.from("wishlist").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("wishlist").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("wishlist.update", data.name ?? id)
  revalidatePath("/dashboard/wishlist")
}

export async function deleteWishlistItem(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("wishlist", id)
  const { error } = await supabase.from("wishlist").delete().eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
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
  const { data: inserted, error } = await supabase.from("inventory_items").insert(data).select().single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (!validId(id)) return INVALID
  // purchase_date and warranty_expiry are date columns; an edit resubmits the whole form, so an
  // empty picker arrives as "" which Postgres rejects - coerce to null and check the error.
  if (data.purchase_date === "") data.purchase_date = null
  if (data.warranty_expiry === "") data.warranty_expiry = null
  const { error } = await supabase.from("inventory_items").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("inventory.update", data.name ?? id)
  revalidatePath("/dashboard/inventory")
}

export async function deleteInventoryItem(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("inventory_items", id)
  const { error } = await supabase.from("inventory_items").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("inventory.delete", id)
  revalidatePath("/dashboard/inventory")
}

// ─── Dashboard summary ───────────────────────────────────────

// I run these queries in parallel with Promise.all so the home overview page loads as one
// round trip rather than 8 sequential ones. Each query only fetches the minimum columns needed.
export async function getDashboardSummary() {
  await requireAuth()
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
    updatedAt: new Date().toISOString(),
  }
}

// ─── Global Search ────────────────────────────────────────────────────────────

// Real-time ilike search across all major tables. Called client-side via server action
// so the Supabase service key never touches the browser and we get proper debouncing.
export async function searchDashboard(q: string) {
  await requireAuth()
  if (!q || !validStr(q, 200)) {
    return { goals: [], notes: [], diary: [], applications: [], contacts: [], habits: [], streaks: [] }
  }
  // I strip PostgREST filter metacharacters (commas, parens, backslashes) AND the LIKE wildcards
  // (% and _) from the query before building the ilike pattern. Without this they could break out of
  // the .or() filter strings below or a lone "%" would match every row.
  const safeQ = q.trim().replace(/[,()\\%_]/g, " ")
  const pat = `%${safeQ}%`
  const [goals, notes, diary, applications, contacts, habits, streaks] = await Promise.all([
    supabase.from("goals").select("id, title, category").or(`title.ilike.${pat},description.ilike.${pat}`).limit(4),
    supabase.from("notes").select("id, title, folder").or(`title.ilike.${pat},content.ilike.${pat}`).limit(4),
    supabase.from("diary").select("id, title, created_at").ilike("content", pat).limit(4),
    supabase.from("applications").select("id, company, role, status").or(`company.ilike.${pat},role.ilike.${pat}`).limit(4),
    supabase.from("contacts").select("id, name").ilike("name", pat).limit(4),
    supabase.from("habits").select("id, name").ilike("name", pat).limit(4),
    supabase.from("streaks").select("id, name").ilike("name", pat).limit(4),
  ])
  return {
    goals: goals.data ?? [],
    notes: notes.data ?? [],
    diary: diary.data ?? [],
    applications: applications.data ?? [],
    contacts: contacts.data ?? [],
    habits: habits.data ?? [],
    streaks: streaks.data ?? [],
  }
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export async function getActivityLog(limit = 50) {
  await requireAuth()
  const { data } = await supabase
    .from("activity_log")
    .select("id, action, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
  return data ?? []
}

// Server-side paginated activity so I can page through the whole history (not just the last N) while only
// one page ever crosses the wire. Returns the requested page of rows plus the exact total for the pager.
export async function getActivityLogPage(page = 1, pageSize = 50) {
  await requireAuth()
  const from = (Math.max(1, page) - 1) * pageSize
  const { data, count } = await supabase
    .from("activity_log")
    .select("id, action, detail, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1)
  return { rows: data ?? [], total: count ?? 0 }
}

// ─── Diary toggles ────────────────────────────────────────────────────────────
// Requires: ALTER TABLE diary ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
//           ALTER TABLE diary ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;
//           ALTER TABLE diary ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;

export async function toggleDiaryHidden(id: string, hidden: boolean) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("diary").update({ hidden }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("diary.update", hidden ? "hidden" : "visible")
  revalidatePath("/dashboard/diary")
}

export async function toggleDiaryPinned(id: string, pinned: boolean) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("diary").update({ pinned }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("diary.update", pinned ? "pinned" : "unpinned")
  revalidatePath("/dashboard/diary")
}

export async function toggleDiaryLocked(id: string, locked: boolean) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("diary").update({ locked }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("diary.update", locked ? "locked" : "unlocked")
  revalidatePath("/dashboard/diary")
}

// ─── Notes toggles ────────────────────────────────────────────────────────────
// Requires: ALTER TABLE notes ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;

export async function toggleNoteHidden(id: string, hidden: boolean) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("notes").update({ hidden }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("note.update", hidden ? "hidden" : "visible")
  revalidatePath("/dashboard/notes")
}

export async function toggleNotePinned(id: string, pinned: boolean) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("notes").update({ pinned }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("note.update", pinned ? "pinned" : "unpinned")
  revalidatePath("/dashboard/notes")
}

export async function toggleNoteLocked(id: string, locked: boolean) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("notes").update({ locked }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("note.update", locked ? "locked" : "unlocked")
  revalidatePath("/dashboard/notes")
}

// ─── Vault toggles ────────────────────────────────────────────────────────────
// Requires: ALTER TABLE vault ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
//           ALTER TABLE vault ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;

export async function toggleVaultHidden(id: string, hidden: boolean) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("vault").update({ hidden }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("vault.update", hidden ? "hidden" : "visible")
  revalidatePath("/dashboard/vault")
}

export async function toggleVaultLocked(id: string, locked: boolean) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("vault").update({ locked }).eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
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
  await requireAuth()
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
  const { data, error } = await supabase
    .from("opensource_contributions")
    .insert(input)
    .select()
    .single()
  if (error) return { error: error.message }
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
  await requireAuth()
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
  const { error } = await supabase
    .from("opensource_contributions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  void logActivity("opensource.update", id)
  revalidatePath("/dashboard/opensource")
}

export async function deleteOpenSourceContribution(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("opensource_contributions", id)
  const { error } = await supabase.from("opensource_contributions").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("opensource.delete", id)
  revalidatePath("/dashboard/opensource")
}

export async function bulkDeleteOpenSourceContributions(ids: string[]) {
  await requireAuth()
  // I validate each ID individually before sending the bulk delete.
  if (!ids.length || ids.some((id) => !validId(id))) return INVALID
  // I back up every row to trash first and return early if any backup fails, so the delete below
  // never removes a row that could not be recovered.
  try {
    for (const id of ids) await moveToTrash("opensource_contributions", id)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Trash backup failed" }
  }
  const { error } = await supabase.from("opensource_contributions").delete().in("id", ids)
  if (error) return { error: error.message }
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
  await requireAuth()
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
  await requireAuth()
  const { data, error } = await supabase.rpc("posts_read_heatmap")
  if (error || !data) return []
  return data as PostsHeatmapCell[]
}

export type BlogReadEvent = {
  slug: string
  depth: number
  post_type: string
  created_at: string
}

// Raw scroll-depth events, so the analytics page can recompute the funnel, heatmap and reads-over-time for
// any selected period rather than only the all-time aggregate the RPCs return. Paged because PostgREST
// caps a single response at 1000 rows - fetched in parallel (a count query, then one burst of range()
// calls) rather than one page at a time, since a growing events table should not cost the analytics page
// another sequential round trip on every load.
export async function getBlogReadEvents(): Promise<BlogReadEvent[]> {
  await requireAuth()
  const { count } = await supabase.from("blog_read_events").select("id", { count: "exact", head: true })
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / 1000))
  const pages = await Promise.all(
    Array.from({ length: totalPages }, (_, i) =>
      supabase
        .from("blog_read_events")
        .select("slug, depth, post_type, created_at")
        .order("created_at", { ascending: false })
        .range(i * 1000, i * 1000 + 999)
    )
  )
  return pages.flatMap((p) => (p.data as BlogReadEvent[] | null) ?? [])
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
  await requireAuth()
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

// Reads the stored github_contributions_days/_years tables instead of calling GitHub's live
// GraphQL API - a real per-day history synced daily, not fetched fresh on every dashboard load.
export async function getGitHubContributions(): Promise<GitHubStats> {
  await requireAuth()
  const stored = await getStoredGithubContributions()
  return {
    days: stored.days,
    totals: {
      commits: stored.currentYear.commits,
      pullRequests: stored.currentYear.pullRequests,
      reviews: stored.currentYear.reviews,
      issues: stored.currentYear.issues,
    },
  }
}

// ─── Data management ─────────────────────────────────────────

export async function clearAllJobs() {
  await requireAuth()
  // Scraped jobs live in `applications` with status='scraped' (there is no separate `jobs` table).
  // They are re-scrapeable listings, so I delete them outright rather than flooding the trash with
  // thousands of rows every time I declutter (the old trash backup also silently capped at 1000 rows
  // while the delete removed every row, so most were never really recoverable). Crucially, ONLY
  // status='scraped' is touched: anything I have applied to, interviewed for, been offered or rejected
  // from or saved (any other status) keeps its row, so my real pipeline and its analytics survive
  // every clear, however many times I run it.
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "scraped")
  const { error } = await supabase.from("applications").delete().eq("status", "scraped")
  if (error) return { error: error.message }
  void logActivity("scraper.cleared", `${count ?? 0} scraped jobs cleared`)
  revalidatePath("/dashboard/applications")
  revalidatePath("/dashboard/analytics/applications")
}

export async function clearAllApplications() {
  await requireAuth()
  // I exclude status='scraped' from BOTH the read and the delete so this only clears tracked
  // applications - the scraped Jobs tab is cleared separately by clearAllJobs.

  // How many tracked rows there are, so I can prove I backed up every one before deleting.
  const { count, error: countErr } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .neq("status", "scraped")
  if (countErr) return { error: countErr.message }
  const expected = count ?? 0
  if (expected === 0) return

  // Read is paged: PostgREST caps a single response at 1000 rows, so an unpaged read would back
  // up only the first 1000 while the delete removed every tracked row.
  const rows: { id: string; company: string | null; role: string | null }[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error: readErr } = await supabase
      .from("applications")
      .select("*")
      .neq("status", "scraped")
      .range(from, from + 999)
    // A discarded read error would drop me straight to the delete with no backup.
    if (readErr) return { error: readErr.message }
    if (!data || data.length === 0) break
    rows.push(...(data as typeof rows))
    if (data.length < 1000) break
  }

  // I only delete once the backup holds every row the count promised.
  if (rows.length < expected) {
    return { error: `Backup incomplete (${rows.length} of ${expected} read) - nothing deleted` }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const { error: insErr } = await supabase.from("trash").insert(
      rows.slice(i, i + 500).map((row) => ({
        table_name: "applications",
        original_id: row.id,
        display_name: `${row.company} - ${row.role}`,
        data: row,
      }))
    )
    // I abort before deleting if the trash backup failed, otherwise the rows would be gone with
    // nothing recoverable.
    if (insErr) return { error: insErr.message }
  }

  const { error: delErr } = await supabase.from("applications").delete().neq("status", "scraped")
  if (delErr) return { error: delErr.message }
  void logActivity("application.cleared", `${rows.length} applications moved to trash`)
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
  await requireAuth()
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
  await requireAuth()
  if (!validStr(data.name)) return INVALID
  const { data: inserted, error } = await supabase
    .from("contacts")
    .insert({ ...data, follow_up: data.follow_up ?? false })
    .select()
    .single()
  if (error) return { error: error.message }
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
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase
    .from("contacts")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  void logActivity("contact.update", data.name ?? id)
  revalidatePath("/dashboard/contacts")
}

export async function deleteContact(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("contacts", id)
  const { error } = await supabase.from("contacts").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("contact.delete", id)
  revalidatePath("/dashboard/contacts")
}

export async function bulkDeleteContacts(ids: string[]) {
  await requireAuth()
  if (!ids.length || ids.some((id) => !validId(id))) return INVALID
  // I back up every row to trash first and return early if any backup fails, so the delete below
  // never removes a row that could not be recovered.
  try {
    for (const id of ids) await moveToTrash("contacts", id)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Trash backup failed" }
  }
  const { error } = await supabase.from("contacts").delete().in("id", ids)
  if (error) return { error: error.message }
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
  await requireAuth()
  const { data } = await supabase
    .from("trash")
    .select("*")
    .order("deleted_at", { ascending: false })
  return (data ?? []) as TrashItem[]
}

export async function restoreFromTrash(trashId: string) {
  await requireAuth()
  if (!validId(trashId)) return INVALID
  const { data: item, error: readErr } = await supabase.from("trash").select("*").eq("id", trashId).single()
  if (readErr) return { error: readErr.message }
  if (!item) return INVALID

  const { _children, ...row } = (item.data ?? {}) as Record<string, unknown> & {
    _children?: Record<string, Record<string, unknown>[]>
  }

  if (SOFT_DELETE_TABLES.has(item.table_name)) {
    // Soft-delete tables still hold the row (is_deleted=true), so restore by clearing the flag.
    // Clearing it matches ZERO rows without an error when the hidden row is gone, so I count the
    // matches and fall back to re-inserting the snapshot - otherwise the restore would do nothing
    // and the only recovery copy would still be destroyed below.
    const { data: updated, error: updErr } = await supabase
      .from(item.table_name)
      .update({ is_deleted: false })
      .eq("id", item.original_id)
      .select("id")
    if (updErr) return { error: updErr.message }
    if (!updated || updated.length === 0) {
      const { error: insErr } = await supabase
        .from(item.table_name)
        .insert({ ...row, id: item.original_id, is_deleted: false })
      if (insErr) return { error: insErr.message }
    }
  } else {
    // Upsert rather than insert so restoring a snapshot of a still-existing row (a streak reset
    // backup) undoes the change instead of failing on the primary key.
    const { error: upErr } = await supabase
      .from(item.table_name)
      .upsert({ ...row, id: item.original_id }, { onConflict: "id" })
    if (upErr) return { error: upErr.message }
    // Bring back the snapshotted history (habit logs, streak check-ins, assessments). On a child
    // failure the parent stays restored and the trash entry is kept, so restoring again retries
    // the children without duplicating anything.
    for (const [childTable, childRows] of Object.entries(_children ?? {})) {
      if (!Array.isArray(childRows) || childRows.length === 0) continue
      const { error: childErr } = await supabase.from(childTable).upsert(childRows, { onConflict: "id" })
      if (childErr) return { error: `Restored ${item.table_name} but its ${childTable} failed: ${childErr.message}` }
    }
  }
  // Only drop the backup once the restore actually succeeded, so a failed restore never destroys
  // the recovery copy - and a failed drop is reported rather than leaving a stale entry silently.
  const { error: delErr } = await supabase.from("trash").delete().eq("id", trashId)
  if (delErr) return { error: delErr.message }
  void logActivity(`${item.table_name}.restore`, item.display_name ?? item.original_id)
  revalidatePath("/dashboard", "layout")
}

export async function permanentlyDelete(trashId: string) {
  await requireAuth()
  if (!validId(trashId)) return INVALID
  // A failed read must abort: falling through would delete the trash entry - the only handle to
  // a soft-deleted row - while skipping the hard-delete, orphaning that row forever.
  const { data: item, error: readErr } = await supabase.from("trash").select("*").eq("id", trashId).single()
  if (readErr) return { error: readErr.message }
  if (!item) return INVALID
  // The underlying row of a soft-delete table is only hidden, so a permanent delete must
  // hard-delete it too (and the Storage blob for files) - shared logic in lib/trash.ts.
  const purgeErr = await purgeSoftDeleted(item)
  if (purgeErr) return { error: purgeErr }
  const { error: trashErr } = await supabase.from("trash").delete().eq("id", trashId)
  if (trashErr) return { error: trashErr.message }
  void logActivity("trash.permanent_delete", trashId)
  revalidatePath("/dashboard/trash")
}

export async function emptyTrash() {
  await requireAuth()
  // Hard-delete the underlying rows + Storage blobs for any soft-deleted items first, so emptying
  // the trash does not leave orphaned hidden rows or files behind. The read is paged (PostgREST
  // caps at 1000 rows) and checked - a failed or truncated read followed by the delete-all below
  // would orphan every soft-deleted row it missed.
  const items: { table_name: string; original_id: string; data: unknown }[] = []
  for (let from = 0; ; from += 1000) {
    const { data: page, error: readErr } = await supabase
      .from("trash")
      .select("table_name, original_id, data")
      .range(from, from + 999)
    if (readErr) return { error: readErr.message }
    if (!page || page.length === 0) break
    items.push(...page)
    if (page.length < 1000) break
  }
  for (const it of items) {
    const purgeErr = await purgeSoftDeleted(it)
    if (purgeErr) return { error: purgeErr }
  }
  const { error } = await supabase.from("trash").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  if (error) return { error: error.message }
  void logActivity("trash.empty")
  revalidatePath("/dashboard/trash")
}

// ─── Body Metrics ─────────────────────────────────────────────

export async function createBodyMetric(data: {
  date: string
  metric: string
  value: number
  unit: string
  notes?: string
}) {
  await requireAuth()
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

export async function updateBodyMetric(id: string, data: {
  date?: string
  metric?: string
  value?: number
  unit?: string
  notes?: string | null
}) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const patch: Record<string, unknown> = {}
  if (data.date !== undefined) { if (!validStr(data.date)) return INVALID; patch.date = data.date }
  if (data.metric !== undefined) { if (!validStr(data.metric)) return INVALID; patch.metric = data.metric }
  if (data.value !== undefined) { if (!validNum(data.value, 0, 9999)) return INVALID; patch.value = data.value }
  if (data.unit !== undefined) { if (!validStr(data.unit)) return INVALID; patch.unit = data.unit }
  if (data.notes !== undefined) patch.notes = data.notes?.trim() || null
  const { error } = await supabase.from("body_metrics").update(patch).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health")
  void logActivity("body_metric.update", id)
}

export async function deleteBodyMetric(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("body_metrics", id)
  const { error } = await supabase.from("body_metrics").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health")
  void logActivity("body_metric.delete", id)
}

// ─── Weight Tracker (weight goal, food and workout logs) ───────

export async function logWeight(date: string, value: number) {
  await requireAuth()
  if (!validStr(date) || !validNum(value, 0, 999)) return INVALID
  const { error } = await supabase.from("body_metrics").insert({ date, metric: "weight_kg", value, unit: "kg" })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health/weight-loss")
  revalidatePath("/dashboard/health")
  void logActivity("weight.log", `${value}kg`)
}

export async function setWeightGoal(data: { startWeight: number; targetWeight: number; startDate: string; targetDate: string }) {
  await requireAuth()
  if (!validNum(data.startWeight, 0, 999) || !validNum(data.targetWeight, 0, 999)) return INVALID
  if (!validStr(data.startDate) || !validStr(data.targetDate)) return INVALID
  const { error } = await supabase.from("config").upsert(
    {
      key: "weight_goal",
      value: { startWeight: data.startWeight, targetWeight: data.targetWeight, startDate: data.startDate, targetDate: data.targetDate },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  )
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health/weight-loss")
  void logActivity("weight.goal", `target ${data.targetWeight}kg by ${data.targetDate}`)
}

export async function createNutritionLog(data: {
  date: string
  meal: string
  name: string
  calories: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}) {
  await requireAuth()
  if (!validStr(data.date) || !validStr(data.meal) || !validStr(data.name)) return INVALID
  if (!validNum(data.calories, 0, 20000)) return INVALID
  const { error } = await supabase.from("nutrition_logs").insert({
    date: data.date,
    meal: data.meal,
    name: data.name.trim(),
    calories: data.calories,
    protein_g: data.protein_g ?? null,
    carbs_g: data.carbs_g ?? null,
    fat_g: data.fat_g ?? null,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health/weight-loss")
  void logActivity("nutrition.log", `${data.name}: ${data.calories}kcal`)
}

export async function deleteNutritionLog(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("nutrition_logs").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health/weight-loss")
  void logActivity("nutrition.delete", id)
}

export async function createWorkoutLog(data: { date: string; type: string; duration_min?: number; calories?: number; notes?: string }) {
  await requireAuth()
  if (!validStr(data.date) || !validStr(data.type)) return INVALID
  if (data.duration_min !== undefined && !validNum(data.duration_min, 0, 1440)) return INVALID
  if (data.calories !== undefined && !validNum(data.calories, 0, 20000)) return INVALID
  if (!optStr(data.notes)) return INVALID
  const { error } = await supabase.from("workout_logs").insert({
    date: data.date,
    type: data.type,
    duration_min: data.duration_min ?? null,
    calories: data.calories ?? null,
    notes: data.notes?.trim() || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health/weight-loss")
  void logActivity("workout.log", data.type)
}

export async function deleteWorkoutLog(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("workout_logs").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/health/weight-loss")
  void logActivity("workout.delete", id)
}

// ─── University ──────────────────────────────────────────────

export async function createUniModule(data: {
  code: string; name: string; credits: number; year: number
  semester: number; target_grade?: string; color?: string; order_index?: number
}) {
  await requireAuth()
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
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("uni_modules", id)
  const { error } = await supabase.from("uni_modules").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.module.delete", id)
}

export async function updateUniModule(id: string, data: Partial<{
  code: string; name: string; credits: number; target_grade: string | null
  color: string; active: boolean; order_index: number
}>) {
  await requireAuth()
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
  await requireAuth()
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
      if (issueId) await supabase.from("uni_deadlines").update({ linear_issue_id: issueId }).eq("id", inserted.id).is("linear_issue_id", null)
    })
  }
}

export async function updateUniDeadline(id: string, data: Partial<{
  status: string; submitted_at: string | null; grade_received: string | null; notes: string | null
  title: string; due_date: string; weight_pct: number | null
}>) {
  await requireAuth()
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

export async function bulkSyncApplicationsToLinear(): Promise<{ synced: number; skipped: number; failed: number }> {
  await requireAuth()
  const { data: apps } = await supabase
    .from("applications")
    .select("id, company, role, type, status, url, linear_issue_id")
    .is("linear_issue_id", null)
    .neq("status", "Not Applied")
  if (!apps) return { synced: 0, skipped: 0, failed: 0 }

  // I count three distinct outcomes: synced (issue created/updated), failed (the sync attempt threw)
  // and skipped (everything else - e.g. Linear not configured or an unmapped status, the remainder).
  // A genuine failure must not be reported as a benign skip.
  let synced = 0
  let failed = 0
  for (const a of apps) {
    try {
      const issueId = await syncApplicationToLinear(a)
      if (issueId) {
        const { error } = await supabase.from("applications").update({ linear_issue_id: issueId }).eq("id", a.id)
        if (error) { failed++; continue }
        synced++
      }
    } catch {
      failed++
    }
  }
  // Awaited, not fire-and-forget: an unawaited write here can get cut off once this action
  // returns on a serverless runtime, before it ever reaches the database.
  await supabase.from("config").upsert(
    { key: "last_linear_app_sync", value: { at: new Date().toISOString(), status: failed > 0 && synced === 0 ? "failure" : "success" } },
    { onConflict: "key" }
  )
  return { synced, failed, skipped: apps.length - synced - failed }
}

export async function bulkSyncDeadlinesToLinear(): Promise<{ synced: number; skipped: number; failed: number }> {
  await requireAuth()
  const { data: deadlines } = await supabase
    .from("uni_deadlines")
    .select("id, title, type, due_date, status, linear_issue_id")
    .is("linear_issue_id", null)
  if (!deadlines) return { synced: 0, skipped: 0, failed: 0 }

  // Same three-way accounting as bulkSyncApplicationsToLinear: a thrown sync is a failure, not a skip.
  let synced = 0
  let failed = 0
  for (const d of deadlines) {
    try {
      const issueId = await syncDeadlineToLinear(d)
      if (issueId) {
        const { error } = await supabase.from("uni_deadlines").update({ linear_issue_id: issueId }).eq("id", d.id)
        if (error) { failed++; continue }
        synced++
      }
    } catch {
      failed++
    }
  }
  await supabase.from("config").upsert(
    { key: "last_linear_uni_sync", value: { at: new Date().toISOString(), status: failed > 0 && synced === 0 ? "failure" : "success" } },
    { onConflict: "key" }
  )
  return { synced, failed, skipped: deadlines.length - synced - failed }
}

export async function deleteUniDeadline(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("uni_deadlines", id)
  const { error } = await supabase.from("uni_deadlines").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.deadline.delete", id)
}

export async function createUniSubmission(data: {
  deadline_id?: string; module_id?: string; title: string
  file_name?: string; file_url?: string; notes?: string
}) {
  await requireAuth()
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
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("uni_submissions", id)
  const { error } = await supabase.from("uni_submissions").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.submission.delete", id)
}

export async function createUniNote(data: {
  module_id?: string; title: string; content?: string; type?: string; tags?: string[]
}) {
  await requireAuth()
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
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("uni_notes").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.note.update", id)
}

export async function deleteUniNote(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("uni_notes", id)
  const { error } = await supabase.from("uni_notes").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.note.delete", id)
}

export async function createUniResource(data: {
  module_id?: string; title: string; url?: string; type?: string; notes?: string; semester?: number
}) {
  await requireAuth()
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
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("uni_resources", id)
  const { error } = await supabase.from("uni_resources").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.resource.delete", id)
}

export async function createLibraryBook(data: {
  title: string; author?: string; isbn?: string; module_id?: string
  borrowed_at: string; due_date: string; notes?: string
}) {
  await requireAuth()
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
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("uni_library_books").update({ returned_at: new Date().toISOString().split("T")[0] }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/university")
  void logActivity("uni.library.return", id)
}

export async function deleteLibraryBook(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("uni_library_books", id)
  const { error } = await supabase.from("uni_library_books").delete().eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
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
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("faith_entries", id)
  const { error } = await supabase.from("faith_entries").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/faith")
  void logActivity("faith.delete", id)
}

export async function updateFaithEntry(id: string, data: {
  title?: string
  notes?: string
  duration_m?: number
  completed?: boolean
}) {
  await requireAuth()
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
  await requireAuth()
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
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("study_sessions", id)
  const { error } = await supabase.from("study_sessions").delete().eq("id", id)
  if (error) return { error: error.message }
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
  await requireAuth()
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

// ─── Calendar Events ──────────────────────────────────────────

export type CalendarCustomEvent = {
  id: string
  title: string
  start_at: string
  end_at: string
  location: string | null
  description: string | null
  colour: string
  all_day: boolean
  event_type: "general" | "timetable"
}

export async function getCalendarCustomEvents(): Promise<CalendarCustomEvent[]> {
  await requireAuth()
  const { data } = await supabase
    .from("calendar_events")
    .select("id, title, start_at, end_at, location, description, colour, all_day, event_type")
    .eq("is_deleted", false)
    .order("start_at", { ascending: true })
  return (data ?? []) as CalendarCustomEvent[]
}

export async function createCalendarEvent(data: {
  title: string
  start_at: string
  end_at: string
  location?: string
  description?: string
  colour: string
  all_day: boolean
  event_type: "general" | "timetable"
}) {
  await requireAuth()
  if (
    !validStr(data.title) ||
    !validStr(data.start_at) ||
    !validStr(data.end_at) ||
    !optStr(data.location) ||
    !optStr(data.description, MAX_LONG_TEXT) ||
    !validStr(data.colour) ||
    typeof data.all_day !== "boolean" ||
    !validStr(data.event_type)
  ) return INVALID
  const { data: inserted, error } = await supabase.from("calendar_events").insert({
    title: data.title.trim(),
    start_at: data.start_at,
    end_at: data.end_at,
    location: data.location?.trim() || null,
    description: data.description?.trim() || null,
    colour: data.colour,
    all_day: data.all_day,
    event_type: data.event_type,
    is_deleted: false,
  }).select().single()
  if (error) return { error: error.message }
  void logActivity("calendar.create", data.title)
  revalidatePath("/dashboard/calendar")
  revalidatePath("/dashboard/university/timetable")
  return inserted
}

export async function updateCalendarEvent(id: string, data: Partial<{
  title: string
  start_at: string
  end_at: string
  location: string | null
  description: string | null
  colour: string
  all_day: boolean
  event_type: "general" | "timetable"
}>) {
  await requireAuth()
  if (
    !validId(id) ||
    !optStr(data.title) ||
    !optStr(data.start_at) ||
    !optStr(data.end_at) ||
    !optStr(data.location) ||
    !optStr(data.description, MAX_LONG_TEXT) ||
    !optStr(data.colour)
  ) return INVALID
  const { error } = await supabase.from("calendar_events").update(data).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("calendar.update", data.title ?? id)
  revalidatePath("/dashboard/calendar")
  revalidatePath("/dashboard/university/timetable")
}

export async function deleteCalendarEvent(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("calendar_events", id)
  const { error } = await supabase.from("calendar_events").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("calendar.delete", id)
  revalidatePath("/dashboard/calendar")
  revalidatePath("/dashboard/university/timetable")
}

// ─── File Manager ─────────────────────────────────────────────

export type UserFile = {
  id: string
  name: string
  original_name: string
  folder: string
  size_bytes: number
  mime_type: string
  storage_path: string
  created_at: string
}

export async function getUserFiles(): Promise<UserFile[]> {
  await requireAuth()
  const { data } = await supabase
    .from("user_files")
    .select("id, name, original_name, folder, size_bytes, mime_type, storage_path, created_at")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
  return (data ?? []) as UserFile[]
}

export async function uploadFile(data: {
  name: string
  original_name: string
  folder: string
  size_bytes: number
  mime_type: string
  storage_path: string
}) {
  await requireAuth()
  if (
    !validStr(data.name) ||
    !validStr(data.original_name) ||
    !validStr(data.folder) ||
    !validStr(data.mime_type) ||
    !validStr(data.storage_path) ||
    typeof data.size_bytes !== "number"
  ) return INVALID
  const { data: inserted, error } = await supabase.from("user_files").insert({
    name: data.name.trim(),
    original_name: data.original_name.trim(),
    folder: data.folder.trim(),
    size_bytes: data.size_bytes,
    mime_type: data.mime_type.trim(),
    storage_path: data.storage_path.trim(),
    is_deleted: false,
  }).select().single()
  if (error) return { error: error.message }
  void logActivity("file.upload", data.name)
  revalidatePath("/dashboard/files")
  return inserted
}

export async function deleteFile(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  await moveToTrash("user_files", id)
  const { error } = await supabase.from("user_files").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("file.delete", id)
  revalidatePath("/dashboard/files")
}

export async function renameFile(id: string, name: string) {
  await requireAuth()
  if (!validId(id) || !validStr(name)) return INVALID
  const { error } = await supabase.from("user_files").update({ name: name.trim() }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("file.rename", name)
  revalidatePath("/dashboard/files")
}

export async function moveFile(id: string, folder: string) {
  await requireAuth()
  if (!validId(id) || !validStr(folder)) return INVALID
  const { error } = await supabase.from("user_files").update({ folder: folder.trim() }).eq("id", id)
  if (error) return { error: error.message }
  void logActivity("file.move", folder)
  revalidatePath("/dashboard/files")
}

export async function createUploadSignedUrl(path: string) {
  await requireAuth()
  if (!validStr(path)) return INVALID
  const { data, error } = await supabase.storage.from("user-files").createSignedUploadUrl(path)
  if (error) return { error: error.message }
  return data
}

export async function createDownloadSignedUrl(path: string) {
  await requireAuth()
  if (!validStr(path)) return INVALID
  const { data, error } = await supabase.storage.from("user-files").createSignedUrl(path, 300)
  if (error) return { error: error.message }
  return data
}

// ─── AI assistant saved chats ─────────────────────────────────
// Opt-in only: nothing is stored unless I press "Save this chat". I keep the full message array as
// jsonb so a saved chat reloads exactly as it was and I can delete any chat individually.

export async function saveAiChat(title: string, messages: unknown) {
  await requireAuth()
  if (!validStr(title)) return INVALID
  const { data, error } = await supabase.from("ai_chats").insert({ title: title.slice(0, 120), messages }).select("id,title,created_at").single()
  if (error) return { error: error.message }
  void logActivity("assistant.save_chat", title)
  return data
}

export async function getAiChats() {
  await requireAuth()
  const { data } = await supabase.from("ai_chats").select("id,title,created_at").order("created_at", { ascending: false }).limit(50)
  return data ?? []
}

export async function getAiChat(id: string) {
  await requireAuth()
  if (!validId(id)) return null
  const { data } = await supabase.from("ai_chats").select("messages").eq("id", id).single()
  return data?.messages ?? null
}

export async function deleteAiChat(id: string) {
  await requireAuth()
  if (!validId(id)) return INVALID
  const { error } = await supabase.from("ai_chats").delete().eq("id", id)
  if (error) return { error: error.message }
  void logActivity("assistant.delete_chat", id)
}
