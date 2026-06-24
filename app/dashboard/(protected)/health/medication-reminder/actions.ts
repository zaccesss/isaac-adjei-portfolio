"use server"

// CRUD for medication reminders. Co-located with the page rather than in the central actions file
// since it is a self-contained feature. Every action gates on the dashboard session first, the same
// as the central actions, so these publicly callable POST endpoints cannot be invoked unauthenticated.
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await auth()
  if (!session) throw new Error("Unauthorised")
}

const PATH = "/dashboard/health/medication-reminder"
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type MedicationReminderInput = {
  label: string
  name: string
  dose?: string | null
  notes?: string | null
  times: string[]
  start_date?: string | null
  end_date?: string | null
  channel: "discord" | "email" | "sms"
  recipient?: string | null
  active?: boolean
}

function clean(input: MedicationReminderInput) {
  return {
    label: input.label.trim(),
    name: input.name.trim(),
    dose: input.dose?.trim() || null,
    notes: input.notes?.trim() || null,
    // De-duplicate, keep only valid HH:MM, and sort so the day reads in order.
    times: [...new Set((input.times ?? []).map((t) => t.trim()).filter((t) => TIME_RE.test(t)))].sort(),
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    channel: input.channel,
    recipient: input.recipient?.trim() || null,
    active: input.active ?? true,
  }
}

function validate(d: ReturnType<typeof clean>): string | null {
  if (!d.label) return "Who it is for is required."
  if (!d.name) return "Medication name is required."
  if (d.times.length === 0) return "Add at least one valid time (HH:MM)."
  if (!["discord", "email", "sms"].includes(d.channel)) return "Invalid channel."
  if ((d.channel === "email" || d.channel === "sms") && !d.recipient) {
    return `A recipient ${d.channel === "email" ? "email" : "phone number"} is required for ${d.channel}.`
  }
  if (d.start_date && d.end_date && d.end_date < d.start_date) return "End date cannot be before the start date."
  return null
}

export async function createMedicationReminder(input: MedicationReminderInput) {
  await requireAuth()
  const d = clean(input)
  const err = validate(d)
  if (err) return { error: err }
  const { error } = await supabase.from("medication_reminders").insert(d)
  if (error) return { error: error.message }
  revalidatePath(PATH)
  return { ok: true }
}

export async function updateMedicationReminder(id: string, input: MedicationReminderInput) {
  await requireAuth()
  if (!UUID_RE.test(id)) return { error: "Invalid id." }
  const d = clean(input)
  const err = validate(d)
  if (err) return { error: err }
  const { error } = await supabase
    .from("medication_reminders")
    .update({ ...d, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(PATH)
  return { ok: true }
}

export async function toggleMedicationReminder(id: string, active: boolean) {
  await requireAuth()
  if (!UUID_RE.test(id)) return { error: "Invalid id." }
  const { error } = await supabase
    .from("medication_reminders")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(PATH)
  return { ok: true }
}

export async function deleteMedicationReminder(id: string) {
  await requireAuth()
  if (!UUID_RE.test(id)) return { error: "Invalid id." }
  const { error } = await supabase.from("medication_reminders").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(PATH)
  return { ok: true }
}
