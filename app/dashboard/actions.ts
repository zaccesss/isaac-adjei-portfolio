"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// ─── Goals ──────────────────────────────────────────────────

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
  await supabase.from("modules").update({ status }).eq("id", id)
  revalidatePath("/dashboard/modules")
}

// ─── Assessments ────────────────────────────────────────────

export async function createAssessment(data: {
  module_id: string
  name: string
  type: string
  weight_percent: number
  mark_achieved: number | null
  mark_max: number
  target_mark: number | null
  date?: string | null
  week?: string | null
  is_pass_fail?: boolean
  my_notes?: string | null
}) {
  const { data: inserted } = await supabase.from("assessments").insert(data).select().single()
  revalidatePath("/dashboard/modules")
  return inserted
}

export async function updateAssessmentMark(id: string, mark: number | null) {
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
}) {
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
  fields?: Record<string, unknown>
}) {
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
  color: string | null
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
  order_index: number
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
  await supabase.from("streak_logs").upsert({ streak_id: streakId, date, completed: true }, { onConflict: "streak_id,date" })
  revalidatePath("/dashboard/streaks")
}

export async function undoStreakCheckIn(streakId: string, date: string) {
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
  active: boolean
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
  exercises: { name: string; sets: string }[]
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
  await supabase.from("health_workouts").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/health")
}

export async function deleteHealthWorkout(id: string) {
  await supabase.from("health_workouts").delete().eq("id", id)
  revalidatePath("/dashboard/health")
}

export async function updateHealthNutrition(id: string, data: Partial<{
  category: string
  items: string[]
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

export async function getConfig(key: string) {
  const { data } = await supabase.from("config").select("value").eq("key", key).single()
  return data?.value ?? null
}

export async function setConfig(key: string, value: unknown) {
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
  price_paid?: string
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
