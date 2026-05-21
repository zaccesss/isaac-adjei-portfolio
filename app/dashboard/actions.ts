"use server"

// I use server actions rather than direct client-side Supabase calls so the service key never ships to the browser.
// Every action here is intentionally thin - validate, write, revalidate. No business logic lives here.
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

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
  await supabase.from("goals").insert(data)
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
  await supabase.from("goals").update(data).eq("id", id)
  revalidatePath("/dashboard/goals")
}

export async function deleteGoal(id: string) {
  await supabase.from("goals").delete().eq("id", id)
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
  // I .select().single() here because the client needs the auto-generated id to add to local state
  // without it I would have to refetch the full modules list just to get the new row's id
  const { data: inserted } = await supabase.from("modules").insert(data).select().single()
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
  await supabase.from("modules").update(data).eq("id", id)
  revalidatePath("/dashboard/modules")
}

export async function deleteModule(id: string) {
  await supabase.from("modules").delete().eq("id", id)
  revalidatePath("/dashboard/modules")
}

export async function updateModuleStatus(id: string, status: string) {
  // I split status into its own action because it fires on every Select change
  // and I do not want the caller to build a full update payload just to flip one field
  await supabase.from("modules").update({ status }).eq("id", id)
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
  // I return the inserted row so the client can append it to local state
  // without needing to know the DB-generated id ahead of time
  const { data: inserted } = await supabase.from("assessments").insert(data).select().single()
  revalidatePath("/dashboard/modules")
  return inserted
}

export async function updateAssessmentMark(id: string, mark: number | null) {
  // I expose this as a dedicated action because mark entry is the most frequent operation
  // in the modules view - students click a row, type a number, and hit Enter
  await supabase.from("assessments").update({ mark_achieved: mark }).eq("id", id)
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
  await supabase.from("assessments").update(data).eq("id", id)
  revalidatePath("/dashboard/modules")
}

export async function deleteAssessment(id: string) {
  await supabase.from("assessments").delete().eq("id", id)
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
  // I return the inserted row so the client can optimistically show the new card without a refetch
  const { data: inserted } = await supabase.from("applications").insert(data).select().single()
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
  await supabase.from("applications").update(data).eq("id", id)
  revalidatePath("/dashboard/applications")
}

export async function deleteApplication(id: string) {
  await supabase.from("applications").delete().eq("id", id)
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
  // I return the full inserted row so the client can splice it into the local entries list
  // in sorted order without waiting for a page refetch
  const { data: inserted } = await supabase.from("vault").insert(data).select().single()
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
  await supabase.from("vault").update(data).eq("id", id)
  revalidatePath("/dashboard/vault")
}

export async function deleteVaultEntry(id: string) {
  await supabase.from("vault").delete().eq("id", id)
  revalidatePath("/dashboard/vault")
}

// ─── Diary ───────────────────────────────────────────────────

export async function createDiaryEntry(data: {
  title: string
  content: string
  mood: string
}) {
  // I return the inserted row so the DiaryClient can prepend it to the top of the list immediately
  // the created_at timestamp comes back from Supabase so the order is correct without client-side guessing
  const { data: inserted } = await supabase.from("diary").insert(data).select().single()
  revalidatePath("/dashboard/diary")
  return inserted
}

export async function updateDiaryEntry(id: string, data: Partial<{
  title: string
  content: string
  mood: string
  updated_at: string
}>) {
  // I always stamp updated_at server-side so the value is the true server time
  // not whatever the client clock happens to say
  await supabase.from("diary").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/diary")
}

export async function deleteDiaryEntry(id: string) {
  await supabase.from("diary").delete().eq("id", id)
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
  const { data: inserted } = await supabase.from("notes").insert(data).select().single()
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
  // I spread updated_at on the server side for the same reason as updateDiaryEntry
  // - the client's clock drifts and I do not want stale sort orders
  await supabase.from("notes").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/notes")
}

export async function deleteNote(id: string) {
  await supabase.from("notes").delete().eq("id", id)
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
  const { data: inserted } = await supabase.from("streaks").insert(data).select().single()
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
  await supabase.from("streaks").update(data).eq("id", id)
  revalidatePath("/dashboard/streaks")
}

export async function deleteStreak(id: string) {
  await supabase.from("streaks").delete().eq("id", id)
  revalidatePath("/dashboard/streaks")
}

export async function checkInStreak(streakId: string, date: string) {
  // I upsert on the composite key (streak_id, date) so re-checking the same day is idempotent
  // - double-clicking the button or a race condition will not create duplicate rows
  await supabase.from("streak_logs").upsert({ streak_id: streakId, date, completed: true }, { onConflict: "streak_id,date" })
  revalidatePath("/dashboard/streaks")
}

export async function undoStreakCheckIn(streakId: string, date: string) {
  // I delete rather than setting completed: false so there is no ambiguity
  // between "never checked in" and "checked in then undone" - both look the same in the streak calc
  await supabase.from("streak_logs").delete().eq("streak_id", streakId).eq("date", date)
  revalidatePath("/dashboard/streaks")
}

// ─── Health ──────────────────────────────────────────────────

export async function createHealthSection(data: {
  name: string
  type: string
  icon: string
  color: string
  order_index: number
}) {
  const { data: inserted } = await supabase.from("health_sections").insert(data).select().single()
  revalidatePath("/dashboard/health")
  return inserted
}

export async function updateHealthSection(id: string, data: Partial<{
  name: string
  type: string
  icon: string
  color: string
  order_index: number
  active: boolean  // I soft-delete sections by setting active: false rather than destroying the data
}>) {
  await supabase.from("health_sections").update(data).eq("id", id)
  revalidatePath("/dashboard/health")
}

export async function deleteHealthSection(id: string) {
  await supabase.from("health_sections").delete().eq("id", id)
  revalidatePath("/dashboard/health")
}

export async function createHealthWorkout(data: {
  section_id: string
  day_label: string
  exercises: { name: string; sets: string }[]  // I store exercises as a JSON array so I avoid a separate exercises table
  notes?: string
  order_index: number
}) {
  const { data: inserted } = await supabase.from("health_workouts").insert(data).select().single()
  revalidatePath("/dashboard/health")
  return inserted
}

export async function updateHealthWorkout(id: string, data: Partial<{
  day_label: string
  exercises: { name: string; sets: string }[]
  notes: string
  order_index: number
}>) {
  // I always refresh updated_at server-side so I know the true last-modified time
  await supabase.from("health_workouts").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/health")
}

export async function deleteHealthWorkout(id: string) {
  await supabase.from("health_workouts").delete().eq("id", id)
  revalidatePath("/dashboard/health")
}

export async function updateHealthNutrition(id: string, data: Partial<{
  category: string
  items: string[]   // I store food lists as a plain string array - simple enough that JSON in Postgres works fine
  rules: string[]
  order_index: number
}>) {
  await supabase.from("health_nutrition").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/health")
}

export async function createHealthNutrition(data: {
  category: string
  items: string[]
  rules: string[]
  order_index: number
}) {
  const { data: inserted } = await supabase.from("health_nutrition").insert(data).select().single()
  revalidatePath("/dashboard/health")
  return inserted
}

export async function deleteHealthNutrition(id: string) {
  await supabase.from("health_nutrition").delete().eq("id", id)
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

export async function setConfig(key: string, value: unknown) {
  // I upsert on the key column so the first write creates the row and subsequent ones update it
  // - no separate "does this key exist?" check needed, which would waste a round trip
  await supabase.from("config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
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
  await supabase.from("course_modules").update(data).eq("id", id)
  revalidatePath("/dashboard/course")
}

export async function deleteCourseModule(id: string) {
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
  const { data: inserted } = await supabase.from("wishlist").insert(data).select().single()
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
  await supabase.from("wishlist").update(data).eq("id", id)
  revalidatePath("/dashboard/wishlist")
}

export async function deleteWishlistItem(id: string) {
  await supabase.from("wishlist").delete().eq("id", id)
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
}) {
  const { data: inserted } = await supabase.from("inventory_items").insert(data).select().single()
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
}>) {
  await supabase.from("inventory_items").update(data).eq("id", id)
  revalidatePath("/dashboard/inventory")
}

export async function deleteInventoryItem(id: string) {
  await supabase.from("inventory_items").delete().eq("id", id)
  revalidatePath("/dashboard/inventory")
}
