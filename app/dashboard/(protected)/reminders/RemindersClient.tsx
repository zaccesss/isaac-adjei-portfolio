"use client"

import { useState, useTransition } from "react"
import {
  createReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
  type ReminderInput,
} from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { Plus, Pencil, Trash2, CalendarClock, Power, Mail, MessageSquare, Phone, MapPin, Check } from "lucide-react"

export type Reminder = {
  id: string
  kind: "appointment" | "meeting" | "other"
  title: string
  location: string | null
  notes: string | null
  event_at: string
  lead_minutes: number[]
  sent_leads: number[]
  channels: string[]
  email: string | null
  phone: string | null
  reminded_at: string | null
  active: boolean
}

type FormState = {
  kind: Reminder["kind"]
  title: string
  location: string
  notes: string
  event_at: string // datetime-local value in the browser's local time
  lead_minutes: number[]
  channels: string[]
  email: string
  phone: string
}

const KIND_LABEL: Record<Reminder["kind"], string> = { appointment: "Appointment", meeting: "Meeting", other: "Other" }

const LEAD_OPTIONS: { value: number; label: string }[] = [
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 1440, label: "1 day" },
  { value: 2880, label: "2 days" },
  { value: 10080, label: "1 week" },
]

const EMPTY: FormState = {
  kind: "appointment",
  title: "",
  location: "",
  notes: "",
  event_at: "",
  lead_minutes: [1440],
  channels: ["discord"],
  email: "",
  phone: "",
}

// A stored UTC timestamp shown in the datetime-local input needs to be the browser's local wall-clock time.
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Displayed in Europe/London to match the delivery job, so the list and the sent reminder always agree
// on the wall-clock time regardless of the viewer's browser zone.
function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function fmtLeadUnit(mins: number): string {
  if (mins % 10080 === 0) return `${mins / 10080} week${mins / 10080 === 1 ? "" : "s"}`
  if (mins % 1440 === 0) return `${mins / 1440} day${mins / 1440 === 1 ? "" : "s"}`
  if (mins % 60 === 0) return `${mins / 60} hour${mins / 60 === 1 ? "" : "s"}`
  return `${mins} min`
}

// The full set of lead times as one phrase, longest first, e.g. "1 week, 1 day, 2 hours before".
function fmtLeads(mins: number[]): string {
  if (!mins.length) return "no reminder set"
  return `${[...mins].sort((a, b) => b - a).map(fmtLeadUnit).join(", ")} before`
}

function toForm(r: Reminder): FormState {
  return {
    kind: r.kind,
    title: r.title,
    location: r.location ?? "",
    notes: r.notes ?? "",
    event_at: toLocalInput(r.event_at),
    lead_minutes: r.lead_minutes.length ? r.lead_minutes : [1440],
    channels: r.channels.length ? r.channels : ["discord"],
    email: r.email ?? "",
    phone: r.phone ?? "",
  }
}

function toInput(f: FormState): ReminderInput {
  return {
    kind: f.kind,
    title: f.title,
    location: f.location || null,
    notes: f.notes || null,
    // The value is local wall-clock time; convert to an absolute UTC instant for storage.
    event_at: f.event_at ? new Date(f.event_at).toISOString() : "",
    lead_minutes: f.lead_minutes,
    channels: f.channels,
    email: f.email || null,
    phone: f.phone || null,
  }
}

export default function RemindersClient({ reminders }: { reminders: Reminder[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()
  const { confirm, dialog } = useConfirmDialog()
  // Captured once at mount so render stays pure (react-hooks/purity forbids Date.now() in render).
  // The page is force-dynamic, so a fresh visit always re-evaluates which reminders are past.
  const [now] = useState(() => Date.now())

  function openAdd() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
    setOpen(true)
  }

  function openEdit(r: Reminder) {
    setEditing(r)
    setForm(toForm(r))
    setError(null)
    setOpen(true)
  }

  function toggleChannel(c: string) {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(c) ? f.channels.filter((x) => x !== c) : [...f.channels, c],
    }))
  }

  function toggleLead(value: number) {
    setForm((f) => ({
      ...f,
      lead_minutes: f.lead_minutes.includes(value) ? f.lead_minutes.filter((x) => x !== value) : [...f.lead_minutes, value],
    }))
  }

  async function submit() {
    setError(null)
    setSaving(true)
    const input = toInput(form)
    const res = editing ? await updateReminder(editing.id, input) : await createReminder(input)
    setSaving(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    setOpen(false)
  }

  function onToggle(r: Reminder) {
    startTransition(() => {
      void toggleReminder(r.id, !r.active)
    })
  }

  async function onDelete(r: Reminder) {
    const ok = await confirm({
      title: `Delete "${r.title}"?`,
      description: "This removes the reminder for good.",
      destructive: true,
      confirmLabel: "Delete",
    })
    if (!ok) return
    startTransition(() => {
      void deleteReminder(r.id)
    })
  }

  return (
    <div className="space-y-6">
      {dialog}

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6" /> Reminders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Appointments, meetings and one-off reminders. I get a Discord, email or SMS nudge at each lead time before it.
          </p>
        </div>
        <div className="shrink-0">
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add
          </Button>
        </div>
      </header>

      {reminders.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground">
          No reminders yet. Add an appointment or meeting to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const past = new Date(r.event_at).getTime() < now
            return (
              <div
                key={r.id}
                className={`border border-border rounded-lg p-4 bg-card flex items-start justify-between gap-4 ${r.active && !past ? "" : "opacity-60"}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{KIND_LABEL[r.kind]}</span>
                    <span className="font-semibold">{r.title}</span>
                    {!r.active && <span className="text-xs text-muted-foreground">(paused)</span>}
                    {past && <span className="text-xs text-muted-foreground">(past)</span>}
                    {r.reminded_at && !past && (
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Check className="h-3 w-3" /> reminded
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{fmtWhen(r.event_at)}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>{fmtLeads(r.lead_minutes)}</span>
                    <span>·</span>
                    {r.channels.includes("discord") && <MessageSquare className="h-3 w-3" />}
                    {r.channels.includes("email") && <Mail className="h-3 w-3" />}
                    {r.channels.includes("sms") && <Phone className="h-3 w-3" />}
                    <span>{r.channels.join(", ") || "no channel"}</span>
                    {r.sent_leads.length > 0 && !r.reminded_at && (
                      <>
                        <span>·</span>
                        <span>
                          {r.sent_leads.length} of {r.lead_minutes.length} sent
                        </span>
                      </>
                    )}
                  </p>
                  {r.location && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {r.location}
                    </p>
                  )}
                  {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => onToggle(r)} title={r.active ? "Pause" : "Resume"}>
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(r)} title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit reminder" : "New reminder"}</DialogTitle>
            <DialogDescription>The date and time are your local time (Europe/London).</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <label className="space-y-1 block">
              <span className="text-xs text-muted-foreground">Type</span>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as FormState["kind"] })}
              >
                <option value="appointment">Appointment</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>
            </label>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Remind me before (pick one or more)</span>
              <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap">
                {LEAD_OPTIONS.map((o) => (
                  <label key={o.value} className="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" checked={form.lead_minutes.includes(o.value)} onChange={() => toggleLead(o.value)} />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="space-y-1 block">
              <span className="text-xs text-muted-foreground">Title</span>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Dentist / Team standup" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">Date and time</span>
                <Input type="datetime-local" value={form.event_at} onChange={(e) => setForm({ ...form, event_at: e.target.value })} />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">Location (optional)</span>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Address or link" />
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Channels</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.channels.includes("discord")} onChange={() => toggleChannel("discord")} />
                  <MessageSquare className="h-3.5 w-3.5" /> Discord
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.channels.includes("email")} onChange={() => toggleChannel("email")} />
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.channels.includes("sms")} onChange={() => toggleChannel("sms")} />
                  <Phone className="h-3.5 w-3.5" /> SMS
                </label>
              </div>
            </div>

            {form.channels.includes("email") && (
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">Email address</span>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="me@example.com" />
              </label>
            )}

            {form.channels.includes("sms") && (
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">Phone number</span>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+44 7…" />
              </label>
            )}

            <label className="space-y-1 block">
              <span className="text-xs text-muted-foreground">Notes (optional)</span>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Bring documents…" />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
