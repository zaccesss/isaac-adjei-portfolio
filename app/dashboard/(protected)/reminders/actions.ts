"use server"

// CRUD for one-off reminders (appointments, meetings and anything else with a date and time). Co-located
// with the page like the medication reminder actions, and every action gates on the dashboard session
// first so these publicly callable POST endpoints cannot be invoked unauthenticated.
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await auth()
  if (!session) throw new Error("Unauthorised")
}

const PATH = "/dashboard/reminders"
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s()-]{7,20}$/
const KINDS = ["appointment", "meeting", "other"] as const
const CHANNELS = ["discord", "email", "sms"] as const

export type ReminderInput = {
  kind: (typeof KINDS)[number]
  title: string
  location?: string | null
  notes?: string | null
  event_at: string // ISO timestamp (the client converts the local datetime to UTC)
  lead_minutes: number[] // one or more lead times, minutes before the event
  channels: string[]
  email?: string | null
  phone?: string | null
  active?: boolean
}

function clean(input: ReminderInput) {
  return {
    kind: input.kind,
    title: input.title.trim(),
    location: input.location?.trim() || null,
    notes: input.notes?.trim() || null,
    event_at: input.event_at,
    // De-duplicate, keep only sane positive lead times, and sort longest-first so a week reads before a day.
    lead_minutes: [...new Set((input.lead_minutes ?? []).map((m) => Math.round(Number(m))).filter((m) => Number.isFinite(m) && m > 0))].sort(
      (a, b) => b - a,
    ),
    // Keep only the channels I actually support, de-duplicated.
    channels: [...new Set((input.channels ?? []).filter((c) => (CHANNELS as readonly string[]).includes(c)))],
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    active: input.active ?? true,
  }
}

function validate(d: ReturnType<typeof clean>): string | null {
  if (!KINDS.includes(d.kind)) return "Invalid type."
  if (!d.title) return "A title is required."
  const when = new Date(d.event_at)
  if (!d.event_at || Number.isNaN(when.getTime())) return "A valid date and time is required."
  if (d.lead_minutes.length === 0) return "Pick at least one reminder lead time."
  if (d.channels.length === 0) return "Pick at least one channel (Discord, email or SMS)."
  if (d.channels.includes("email") && (!d.email || !EMAIL_RE.test(d.email))) {
    return "A valid email address is required for the email channel."
  }
  if (d.channels.includes("sms") && (!d.phone || !PHONE_RE.test(d.phone))) {
    return "A valid phone number is required for the SMS channel."
  }
  return null
}

export async function createReminder(input: ReminderInput) {
  await requireAuth()
  const d = clean(input)
  const err = validate(d)
  if (err) return { error: err }
  const { error } = await supabase.from("reminders").insert(d)
  if (error) return { error: error.message }
  revalidatePath(PATH)
  return { ok: true }
}

export async function updateReminder(id: string, input: ReminderInput) {
  await requireAuth()
  if (!UUID_RE.test(id)) return { error: "Invalid id." }
  const d = clean(input)
  const err = validate(d)
  if (err) return { error: err }
  // I never touch active here (the form does not carry it), so editing a paused reminder keeps it paused.
  // Editing the schedule means it should be considered for sending again, so I clear reminded_at.
  const { error } = await supabase
    .from("reminders")
    .update({
      kind: d.kind,
      title: d.title,
      location: d.location,
      notes: d.notes,
      event_at: d.event_at,
      lead_minutes: d.lead_minutes,
      channels: d.channels,
      email: d.email,
      phone: d.phone,
      // Reset both send-tracking fields so the edited schedule fires cleanly from scratch.
      sent_leads: [],
      reminded_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(PATH)
  return { ok: true }
}

export async function toggleReminder(id: string, active: boolean) {
  await requireAuth()
  if (!UUID_RE.test(id)) return { error: "Invalid id." }
  const { error } = await supabase
    .from("reminders")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(PATH)
  return { ok: true }
}

export async function deleteReminder(id: string) {
  await requireAuth()
  if (!UUID_RE.test(id)) return { error: "Invalid id." }
  const { error } = await supabase.from("reminders").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(PATH)
  return { ok: true }
}
