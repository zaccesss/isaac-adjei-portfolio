"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  createDiaryEntry, createNote, createGoal, createApplication,
  createFaithEntry, createStudySession, createHabit, createStreak, createBodyMetric,
} from "@/app/dashboard/actions"

const MOODS = [
  { value: "grateful", emoji: "🙏", label: "Grateful" },
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "reflective", emoji: "🤔", label: "Reflective" },
  { value: "anxious", emoji: "😰", label: "Anxious" },
  { value: "sad", emoji: "😔", label: "Sad" },
  { value: "motivated", emoji: "🔥", label: "Motivated" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "peaceful", emoji: "☮️", label: "Peaceful" },
]

const GOAL_CATEGORIES = ["academic", "career", "personal", "health", "financial", "other"]
const APP_TYPES = ["graduate", "internship", "placement", "part-time", "other"]
const FAITH_TYPES = ["prayer", "bible", "devotion", "worship", "fasting", "gratitude", "other"]
const STREAK_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#ef4444", "#8b5cf6"]
const HABIT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#ef4444", "#8b5cf6"]
const HEALTH_METRICS = ["weight", "bmi", "bp_systolic", "bp_diastolic", "pulse", "height"]
const HEALTH_UNITS: Record<string, string> = {
  weight: "kg", bmi: "", bp_systolic: "mmHg", bp_diastolic: "mmHg", pulse: "bpm", height: "cm",
}

function today() {
  return new Date().toISOString().split("T")[0]
}

function DiaryTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ title: "", content: "", mood: "" })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.title.trim() || !form.content.trim()) return
    startTransition(() => void createDiaryEntry({ title: form.title, content: form.content, mood: form.mood }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" autoFocus />
      <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} placeholder="What's on my mind..." className="resize-none" />
      <div className="flex flex-wrap gap-1.5">
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setForm((f) => ({ ...f, mood: f.mood === m.value ? "" : m.value }))}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
              form.mood === m.value ? "bg-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>
      <Button onClick={submit} disabled={!form.title.trim() || !form.content.trim()} className="self-end">Save entry</Button>
    </div>
  )
}

function NoteTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ title: "", content: "" })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.title.trim()) return
    startTransition(() => void createNote({ title: form.title, content: form.content, folder: "General", tags: [], pinned: false, locked: false, color: null }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" autoFocus />
      <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} placeholder="Note content..." className="resize-none" />
      <Button onClick={submit} disabled={!form.title.trim()} className="self-end">Save note</Button>
    </div>
  )
}

function GoalTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", category: "", target_date: "" })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.title.trim() || !form.category || !form.target_date) return
    startTransition(() => void createGoal({ title: form.title, description: form.description, category: form.category, status: "not_started", target_date: form.target_date, progress: 0 }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Goal title" autoFocus />
      <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Description (optional)" className="resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {GOAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={form.target_date} onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))} />
      </div>
      <Button onClick={submit} disabled={!form.title.trim() || !form.category || !form.target_date} className="self-end">Save goal</Button>
    </div>
  )
}

function ApplicationTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ company: "", role: "", type: "", url: "" })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.company.trim() || !form.role.trim()) return
    startTransition(() => void createApplication({ company: form.company, role: form.role, type: form.type || "graduate", applied_date: today(), deadline: "", status: "applied", notes: "", url: form.url, starred: false }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Company" autoFocus />
      <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Role title" />
      <div className="grid grid-cols-2 gap-3">
        <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            {APP_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="URL (optional)" />
      </div>
      <Button onClick={submit} disabled={!form.company.trim() || !form.role.trim()} className="self-end">Save application</Button>
    </div>
  )
}

function FaithTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ type: "", title: "", notes: "", duration_m: "" })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.type) return
    startTransition(() => void createFaithEntry({
      date: today(),
      type: form.type,
      title: form.title || undefined,
      notes: form.notes || undefined,
      duration_m: form.duration_m ? parseInt(form.duration_m) : undefined,
      completed: true,
    }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
        <SelectTrigger><SelectValue placeholder="Type of activity" /></SelectTrigger>
        <SelectContent>
          {FAITH_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
        </SelectContent>
      </Select>
      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title (optional)" autoFocus />
      <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Notes (optional)" className="resize-none" />
      <Input type="number" value={form.duration_m} onChange={(e) => setForm((f) => ({ ...f, duration_m: e.target.value }))} placeholder="Duration in minutes (optional)" min={1} max={1440} />
      <Button onClick={submit} disabled={!form.type} className="self-end">Save entry</Button>
    </div>
  )
}

function StudyTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ subject: "", duration_m: "", technique: "", notes: "" })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.subject.trim() || !form.duration_m) return
    startTransition(() => void createStudySession({
      date: today(),
      subject: form.subject,
      duration_m: parseInt(form.duration_m),
      technique: form.technique || undefined,
      notes: form.notes || undefined,
      productive: true,
    }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Subject / topic" autoFocus />
      <Input type="number" value={form.duration_m} onChange={(e) => setForm((f) => ({ ...f, duration_m: e.target.value }))} placeholder="Duration (minutes)" min={1} max={1440} />
      <Input value={form.technique} onChange={(e) => setForm((f) => ({ ...f, technique: e.target.value }))} placeholder="Technique e.g. Pomodoro (optional)" />
      <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Notes (optional)" className="resize-none" />
      <Button onClick={submit} disabled={!form.subject.trim() || !form.duration_m} className="self-end">Log session</Button>
    </div>
  )
}

function HabitTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", description: "", color: HABIT_COLORS[0] })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.name.trim()) return
    startTransition(() => void createHabit({ name: form.name, description: form.description || undefined, color: form.color }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Habit name e.g. Morning run" autoFocus />
      <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Colour:</span>
        <div className="flex gap-1.5">
          {HABIT_COLORS.map((c) => (
            <button key={c} type="button" title={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
              className={`w-5 h-5 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-offset-1 ring-foreground" : ""}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <Button onClick={submit} disabled={!form.name.trim()} className="self-end">Add habit</Button>
    </div>
  )
}

function StreakTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", icon: "🔥", description: "", color: STREAK_COLORS[0] })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.name.trim()) return
    startTransition(() => void createStreak({ name: form.name, icon: form.icon, description: form.description, color: form.color, order_index: 0 }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[3rem_1fr] gap-3">
        <Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🔥" className="text-center text-lg" maxLength={4} />
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Streak name" autoFocus />
      </div>
      <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Colour:</span>
        <div className="flex gap-1.5">
          {STREAK_COLORS.map((c) => (
            <button key={c} type="button" title={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
              className={`w-5 h-5 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-offset-1 ring-foreground" : ""}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <Button onClick={submit} disabled={!form.name.trim()} className="self-end">Add streak</Button>
    </div>
  )
}

function HealthTab({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ metric: "", value: "", unit: "", notes: "" })
  const [, startTransition] = useTransition()

  function submit() {
    if (!form.metric.trim() || !form.value) return
    startTransition(() => void createBodyMetric({
      date: today(),
      metric: form.metric,
      value: parseFloat(form.value),
      unit: form.unit,
      notes: form.notes || undefined,
    }))
    onDone()
  }

  function onMetricChange(v: string) {
    setForm((f) => ({ ...f, metric: v, unit: HEALTH_UNITS[v] ?? "" }))
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={form.metric} onValueChange={onMetricChange}>
        <SelectTrigger><SelectValue placeholder="Metric" /></SelectTrigger>
        <SelectContent>
          {HEALTH_METRICS.map((m) => <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>)}
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      {form.metric === "custom" && (
        <Input value={form.metric === "custom" ? "" : form.metric} onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))} placeholder="Metric name" />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="Value" step="0.1" autoFocus />
        <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Unit e.g. kg" />
      </div>
      <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" />
      <Button onClick={submit} disabled={!form.metric.trim() || !form.value} className="self-end">Log metric</Button>
    </div>
  )
}

export default function QuickCapture() {
  const [open, setOpen] = useState(false)

  function handleDone(label: string) {
    setOpen(false)
    toast.success(label + " saved")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick capture"
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
      >
        <Plus className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(30rem,calc(100vw-2rem))]">
          <DialogHeader>
            <DialogTitle>Quick capture</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="diary">
            <TabsList className="w-full grid grid-cols-3 sm:grid-cols-5 mb-1">
              <TabsTrigger value="diary">Diary</TabsTrigger>
              <TabsTrigger value="note">Note</TabsTrigger>
              <TabsTrigger value="faith">Faith</TabsTrigger>
              <TabsTrigger value="study">Study</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
            </TabsList>
            <TabsList className="w-full grid grid-cols-3 sm:grid-cols-5">
              <TabsTrigger value="goal">Goal</TabsTrigger>
              <TabsTrigger value="habit">Habit</TabsTrigger>
              <TabsTrigger value="streak">Streak</TabsTrigger>
              <TabsTrigger value="application">Job</TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="diary"><DiaryTab onDone={() => handleDone("Diary entry")} /></TabsContent>
              <TabsContent value="note"><NoteTab onDone={() => handleDone("Note")} /></TabsContent>
              <TabsContent value="faith"><FaithTab onDone={() => handleDone("Faith entry")} /></TabsContent>
              <TabsContent value="study"><StudyTab onDone={() => handleDone("Study session")} /></TabsContent>
              <TabsContent value="health"><HealthTab onDone={() => handleDone("Health metric")} /></TabsContent>
              <TabsContent value="goal"><GoalTab onDone={() => handleDone("Goal")} /></TabsContent>
              <TabsContent value="habit"><HabitTab onDone={() => handleDone("Habit")} /></TabsContent>
              <TabsContent value="streak"><StreakTab onDone={() => handleDone("Streak")} /></TabsContent>
              <TabsContent value="application"><ApplicationTab onDone={() => handleDone("Application")} /></TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
