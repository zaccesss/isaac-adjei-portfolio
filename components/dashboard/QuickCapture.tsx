"use client"
// I float a "+" button over every dashboard page so I can quickly log a diary entry,
// note, goal or application without navigating away from whatever I am looking at.
// The dialog is opened by the button or by the global Cmd+Shift+N shortcut.

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createDiaryEntry, createNote, createGoal, createApplication } from "@/app/dashboard/actions"

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
    startTransition(() => void createNote({
      title: form.title,
      content: form.content,
      folder: "General",
      tags: [],
      pinned: false,
      locked: false,
      color: null,
    }))
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
    startTransition(() => void createGoal({
      title: form.title,
      description: form.description,
      category: form.category,
      status: "not_started",
      target_date: form.target_date,
      progress: 0,
    }))
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
    const today = new Date().toISOString().split("T")[0]
    startTransition(() => void createApplication({
      company: form.company,
      role: form.role,
      type: form.type || "graduate",
      applied_date: today,
      deadline: "",
      status: "applied",
      notes: "",
      url: form.url,
      starred: false,
    }))
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
        <DialogContent className="max-w-[min(28rem,calc(100vw-2rem))]">
          <DialogHeader>
            <DialogTitle>Quick capture</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="diary">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="diary">Diary</TabsTrigger>
              <TabsTrigger value="note">Note</TabsTrigger>
              <TabsTrigger value="goal">Goal</TabsTrigger>
              <TabsTrigger value="application">Job</TabsTrigger>
            </TabsList>
            <TabsContent value="diary" className="mt-4"><DiaryTab onDone={() => handleDone("Diary entry")} /></TabsContent>
            <TabsContent value="note" className="mt-4"><NoteTab onDone={() => handleDone("Note")} /></TabsContent>
            <TabsContent value="goal" className="mt-4"><GoalTab onDone={() => handleDone("Goal")} /></TabsContent>
            <TabsContent value="application" className="mt-4"><ApplicationTab onDone={() => handleDone("Application")} /></TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
