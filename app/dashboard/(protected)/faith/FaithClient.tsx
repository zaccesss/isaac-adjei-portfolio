"use client"

import { useState, useTransition } from "react"
import { createFaithEntry, deleteFaithEntry, updateFaithEntry } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, BookOpen, Cross, Church, Heart, Star, Check, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

type FaithEntry = {
  id: string
  date: string
  type: string
  title: string | null
  notes: string | null
  duration_m: number | null
  completed: boolean
  created_at: string
}

const FAITH_TYPES = [
  { value: "bible", label: "Bible Reading", icon: BookOpen },
  { value: "prayer", label: "Prayer", icon: Star },
  { value: "church", label: "Church", icon: Church },
  { value: "devotional", label: "Devotional", icon: Heart },
  { value: "other", label: "Other", icon: Cross },
]

const TYPE_COLOURS: Record<string, string> = {
  bible: "hsl(var(--primary))",
  prayer: "#f59e0b",
  church: "#10b981",
  devotional: "#8b5cf6",
  other: "#6b7280",
}

function typeLabel(t: string) {
  return FAITH_TYPES.find((f) => f.value === t)?.label ?? t
}

function typeColour(t: string) {
  return TYPE_COLOURS[t] ?? TYPE_COLOURS.other
}

function calcStreak(entries: FaithEntry[], today: string): number {
  const doneByDate = new Set(entries.filter((e) => e.completed).map((e) => e.date))
  let streak = 0
  const d = new Date(today)
  while (doneByDate.has(d.toISOString().split("T")[0])) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export default function FaithClient({ entries, today }: { entries: FaithEntry[]; today: string }) {
  const [open, setOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<FaithEntry | null>(null)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    date: today,
    type: "bible",
    title: "",
    notes: "",
    duration_m: "",
    completed: true,
  })

  function resetForm() {
    setForm({ date: today, type: "bible", title: "", notes: "", duration_m: "", completed: true })
    setEditEntry(null)
  }

  function openEdit(e: FaithEntry) {
    setEditEntry(e)
    setForm({
      date: e.date,
      type: e.type,
      title: e.title ?? "",
      notes: e.notes ?? "",
      duration_m: e.duration_m ? String(e.duration_m) : "",
      completed: e.completed,
    })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      date: form.date,
      type: form.type,
      title: form.title.trim() || undefined,
      notes: form.notes.trim() || undefined,
      duration_m: form.duration_m ? Number(form.duration_m) : undefined,
      completed: form.completed,
    }
    startTransition(async () => {
      if (editEntry) {
        await updateFaithEntry(editEntry.id, payload)
      } else {
        await createFaithEntry(payload)
      }
      setOpen(false)
      resetForm()
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => { await deleteFaithEntry(id) })
  }

  const todayEntries = entries.filter((e) => e.date === today)
  const streak = calcStreak(entries, today)
  const totalMinutes = entries.reduce((s, e) => s + (e.duration_m ?? 0), 0)
  const uniqueDays = new Set(entries.filter((e) => e.completed).map((e) => e.date)).size

  // Weekly bar chart: last 4 weeks, count of entries per week
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - (11 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const ws = weekStart.toISOString().split("T")[0]
    const we = weekEnd.toISOString().split("T")[0]
    const count = entries.filter((e) => e.date >= ws && e.date <= we && e.completed).length
    return { week: `W${i + 1}`, count }
  })

  const typeBreakdown = FAITH_TYPES.map((ft) => ({
    ...ft,
    count: entries.filter((e) => e.type === ft.value).length,
  })).filter((ft) => ft.count > 0)

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Faith</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Bible reading, prayer, church and devotionals</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Log entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editEntry ? "Edit entry" : "Log faith entry"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FAITH_TYPES.map((ft) => (
                        <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title (optional)</label>
                <Input
                  placeholder="e.g. John 3, Morning prayer..."
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Duration (minutes)</label>
                <Input
                  type="number"
                  min={1}
                  max={1440}
                  placeholder="e.g. 15"
                  value={form.duration_m}
                  onChange={(e) => setForm((f) => ({ ...f, duration_m: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <Textarea
                  placeholder="Reflections, key verses, answered prayers..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="completed"
                  checked={form.completed}
                  onChange={(e) => setForm((f) => ({ ...f, completed: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="completed" className="text-sm">Mark as completed</label>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {editEntry ? "Save changes" : "Log entry"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm() }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Current streak", value: streak, suffix: streak === 1 ? "day" : "days", icon: "🔥" },
          { label: "Days active (90d)", value: uniqueDays, suffix: "days", icon: "✅" },
          { label: "Total minutes", value: totalMinutes, suffix: "min", icon: "⏱" },
          { label: "Today", value: todayEntries.length, suffix: todayEntries.length === 1 ? "entry" : "entries", icon: "📖" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold">{s.icon} {s.value}</p>
            <p className="text-xs text-muted-foreground">{s.suffix}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly activity chart */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Weekly activity (12 weeks)</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={weeks} barSize={14}>
              <XAxis dataKey="week" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6 }}
                formatter={(v) => [`${v} entries`, "entries"]}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {weeks.map((_, i) => (
                  <Cell key={i} fill="hsl(var(--primary))" fillOpacity={0.2 + 0.8 * (weeks[i].count / Math.max(...weeks.map((w) => w.count), 1))} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Type breakdown */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <p className="text-sm font-medium">By type (90 days)</p>
          {typeBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet</p>
          ) : (
            <div className="space-y-2">
              {typeBreakdown.map((ft) => (
                <div key={ft.value} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: typeColour(ft.value) }} />
                  <span className="text-sm text-muted-foreground flex-1">{ft.label}</span>
                  <span className="text-sm font-medium">{ft.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entry list */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-xs">Recent entries</p>
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
            No entries yet. Log your first faith activity above.
          </div>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 50).map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 hover:border-primary/30 transition-colors group"
              >
                <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: typeColour(e.type) }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{e.title ?? typeLabel(e.type)}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{typeLabel(e.type)}</Badge>
                    {e.completed && <Check className="h-3.5 w-3.5 text-green-500" />}
                    {e.duration_m && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{e.duration_m}min
                      </span>
                    )}
                  </div>
                  {e.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{e.notes}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{e.date}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(e)}>
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(e.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
