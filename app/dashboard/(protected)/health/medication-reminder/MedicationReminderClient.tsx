"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  createMedicationReminder,
  updateMedicationReminder,
  toggleMedicationReminder,
  deleteMedicationReminder,
  type MedicationReminderInput,
} from "./actions"
import { savedOk } from "@/lib/save-result"
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
import { Plus, Pencil, Trash2, Pill, BarChart3, Power, Mail, MessageSquare, Phone } from "lucide-react"

export type MedicationReminder = {
  id: string
  label: string
  name: string
  dose: string | null
  notes: string | null
  times: string[]
  start_date: string | null
  end_date: string | null
  channel: "discord" | "email" | "sms"
  recipient: string | null
  active: boolean
}

type FormState = {
  label: string
  name: string
  dose: string
  notes: string
  times: string
  start_date: string
  end_date: string
  channel: "discord" | "email" | "sms"
  recipient: string
}

const EMPTY: FormState = {
  label: "",
  name: "",
  dose: "",
  notes: "",
  times: "",
  start_date: "",
  end_date: "",
  channel: "discord",
  recipient: "",
}

const CHANNEL_ICON = { discord: MessageSquare, email: Mail, sms: Phone } as const

function toForm(r: MedicationReminder): FormState {
  return {
    label: r.label,
    name: r.name,
    dose: r.dose ?? "",
    notes: r.notes ?? "",
    times: r.times.join(", "),
    start_date: r.start_date ?? "",
    end_date: r.end_date ?? "",
    channel: r.channel,
    recipient: r.recipient ?? "",
  }
}

function toInput(f: FormState): MedicationReminderInput {
  return {
    label: f.label,
    name: f.name,
    dose: f.dose,
    notes: f.notes,
    times: f.times.split(/[\s,]+/).filter(Boolean),
    start_date: f.start_date || null,
    end_date: f.end_date || null,
    channel: f.channel,
    recipient: f.recipient || null,
  }
}

export default function MedicationReminderClient({ reminders }: { reminders: MedicationReminder[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MedicationReminder | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()
  const { confirm, dialog } = useConfirmDialog()

  function openAdd() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
    setOpen(true)
  }

  function openEdit(r: MedicationReminder) {
    setEditing(r)
    setForm(toForm(r))
    setError(null)
    setOpen(true)
  }

  async function submit() {
    setError(null)
    setSaving(true)
    const input = toInput(form)
    const res = editing ? await updateMedicationReminder(editing.id, input) : await createMedicationReminder(input)
    setSaving(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    setOpen(false)
  }

  function onToggle(r: MedicationReminder) {
    startTransition(async () => {
      savedOk(await toggleMedicationReminder(r.id, !r.active), "Could not update reminder")
    })
  }

  async function onDelete(r: MedicationReminder) {
    const ok = await confirm({
      title: `Delete ${r.name}?`,
      description: `This removes the reminder for ${r.label}.`,
      destructive: true,
      confirmLabel: "Delete",
    })
    if (!ok) return
    startTransition(async () => {
      savedOk(await deleteMedicationReminder(r.id), "Could not delete reminder")
    })
  }

  return (
    <div className="space-y-6">
      {dialog}

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6" /> Medication reminders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scheduled medication and health reminders, sent to Discord, email or SMS at their local times.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/health/medication-reminder/analytics")}
          >
            <BarChart3 className="h-4 w-4 mr-1.5" /> Analytics
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add
          </Button>
        </div>
      </header>

      {reminders.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground">
          No reminders yet. Add one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const Icon = CHANNEL_ICON[r.channel]
            return (
              <div
                key={r.id}
                className={`border border-border rounded-lg p-4 bg-card flex items-start justify-between gap-4 ${r.active ? "" : "opacity-60"}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{r.label}</span>
                    <span className="font-semibold">{r.name}</span>
                    {!r.active && <span className="text-xs text-muted-foreground">(paused)</span>}
                  </div>
                  {r.dose && <p className="text-sm mt-1">{r.dose}</p>}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 flex-wrap">
                    <span>{r.times.join(" · ") || "no times"}</span>
                    <span>·</span>
                    <Icon className="h-3 w-3" />
                    <span>
                      {r.channel}
                      {r.recipient ? ` (${r.recipient})` : ""}
                    </span>
                  </p>
                  {(r.start_date || r.end_date) && (
                    <p className="text-xs text-muted-foreground">
                      {r.start_date ?? "…"} → {r.end_date ?? "ongoing"}
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
            <DialogDescription>Times are local (Europe/London). Add several, comma-separated.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">For</span>
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Me / Mum" />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">Medication</span>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Eye drops" />
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-xs text-muted-foreground">Dose</span>
              <Input value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} placeholder="1 drop - left eye" />
            </label>

            <label className="space-y-1 block">
              <span className="text-xs text-muted-foreground">Times (HH:MM, comma-separated)</span>
              <Input value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })} placeholder="08:00, 18:00" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">Start date</span>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">End date</span>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 block">
                <span className="text-xs text-muted-foreground">Channel</span>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value as FormState["channel"] })}
                >
                  <option value="discord">Discord (#reminders)</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </label>
              {form.channel !== "discord" && (
                <label className="space-y-1 block">
                  <span className="text-xs text-muted-foreground">{form.channel === "email" ? "Email address" : "Phone number"}</span>
                  <Input
                    value={form.recipient}
                    onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                    placeholder={form.channel === "email" ? "mum@example.com" : "+44 7…"}
                  />
                </label>
              )}
            </div>

            <label className="space-y-1 block">
              <span className="text-xs text-muted-foreground">Notes</span>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Keep in fridge…" />
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
