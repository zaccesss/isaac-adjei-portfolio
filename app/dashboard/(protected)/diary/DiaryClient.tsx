"use client"
﻿// I provide a private diary with mood tracking, hidden/pinned/locked entries and a 30-day mood chart.
// This page is only accessible from within the authenticated dashboard.

import { useState, useTransition } from "react"
import { createDiaryEntry, updateDiaryEntry, deleteDiaryEntry, toggleDiaryHidden, toggleDiaryPinned, toggleDiaryLocked } from "../../actions"
import { savedOk } from "@/lib/save-result"
import { toast } from "sonner"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RichTextEditor from "@/components/editor/RichTextEditor"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, BarChart2, MoreVertical, EyeOff, Eye, Pin, PinOff, Lock, Unlock } from "lucide-react"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

type Entry = {
  id: string
  title: string
  content: string
  mood: string | null
  hidden: boolean
  pinned: boolean
  locked: boolean
  created_at: string
  updated_at: string
}

const MOODS = [
  { value: "grateful", emoji: "🙏", label: "Grateful", colour: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  { value: "happy", emoji: "😊", label: "Happy", colour: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "reflective", emoji: "🤔", label: "Reflective", colour: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "anxious", emoji: "😰", label: "Anxious", colour: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { value: "sad", emoji: "😔", label: "Sad", colour: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { value: "motivated", emoji: "🔥", label: "Motivated", colour: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "tired", emoji: "😴", label: "Tired", colour: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300" },
  { value: "peaceful", emoji: "☮️", label: "Peaceful", colour: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
]

const MOOD_COLOURS: Record<string, string> = {
  grateful: "#f59e0b",
  happy: "#eab308",
  reflective: "#3b82f6",
  anxious: "#f97316",
  sad: "#6366f1",
  motivated: "#ef4444",
  tired: "#94a3b8",
  peaceful: "#22c55e",
}

const MOOD_BG: Record<string, string> = {
  grateful: "border-l-4 border-l-amber-400",
  happy: "border-l-4 border-l-yellow-400",
  reflective: "border-l-4 border-l-blue-400",
  anxious: "border-l-4 border-l-orange-400",
  sad: "border-l-4 border-l-indigo-400",
  motivated: "border-l-4 border-l-red-400",
  tired: "border-l-4 border-l-slate-400",
  peaceful: "border-l-4 border-l-green-400",
}

function getMood(value: string | null) {
  return MOODS.find((m) => m.value === value) ?? null
}

function MoodChart({ entries }: { entries: { mood: string | null; created_at: string }[] }) {
  const [open, setOpen] = useState(false)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)

  const data = MOODS.map((m) => ({
    label: m.emoji + " " + m.label,
    count: entries.filter((e) => e.mood === m.value && new Date(e.created_at) >= cutoff).length,
    colour: MOOD_COLOURS[m.value],
  })).filter((d) => d.count > 0)

  if (data.length === 0) return null

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          Mood over the last 30 days
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -24 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="bg-card border border-border rounded px-2.5 py-1.5 text-xs shadow-sm">
                      {payload[0].payload.label}: <strong>{payload[0].value} entr{Number(payload[0].value) === 1 ? "y" : "ies"}</strong>
                    </div>
                  )
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.colour} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

const emptyForm = { title: "", content: "", mood: "" }

function EntryForm({ initial, onSave, onCancel }: {
  initial?: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial ?? emptyForm)
  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col gap-4">
      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="What's on my mind today?" autoFocus />
      <RichTextEditor value={form.content} onChange={(md) => setForm((f) => ({ ...f, content: md }))} placeholder="Write freely... this is just for me." />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">How am I feeling?</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, mood: f.mood === m.value ? "" : m.value }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                form.mood === m.value ? m.colour + " border-transparent" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (form.title.trim() && form.content.trim()) onSave(form) }} disabled={!form.title.trim() || !form.content.trim()}>Save entry</Button>
      </div>
    </div>
  )
}

function EntryCard({ entry, onEdit, onDelete, onToggle }: {
  entry: Entry
  onEdit: (e: Entry) => void
  onDelete: (id: string) => void
  onToggle: (id: string, field: "hidden" | "pinned" | "locked", value: boolean) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const mood = getMood(entry.mood)
  // I truncate at 180 characters so card heights stay consistent in the feed
  const preview = entry.content.slice(0, 180) + (entry.content.length > 180 ? "..." : "")
  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length
  const date = new Date(entry.created_at)
  const isToday = new Date().toDateString() === date.toDateString()

  return (
    <div className={`border border-border rounded-xl bg-card overflow-hidden hover:shadow-sm transition-shadow ${entry.hidden ? "opacity-50" : ""} ${entry.mood ? MOOD_BG[entry.mood] ?? "" : ""}`}>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isToday && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">Today</span>}
              {entry.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
              {entry.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
              {mood && <span className="text-base">{mood.emoji}</span>}
              <h3 className="font-semibold text-sm">{entry.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {" · "}{date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              {" · "}{wordCount} word{wordCount !== 1 ? "s" : ""}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Entry options" title="Entry options" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Pencil className="h-3.5 w-3.5 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggle(entry.id, "pinned", !entry.pinned)}>
                {entry.pinned ? <><PinOff className="h-3.5 w-3.5 mr-2" />Unpin</> : <><Pin className="h-3.5 w-3.5 mr-2" />Pin</>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggle(entry.id, "hidden", !entry.hidden)}>
                {entry.hidden ? <><Eye className="h-3.5 w-3.5 mr-2" />Show</> : <><EyeOff className="h-3.5 w-3.5 mr-2" />Hide</>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggle(entry.id, "locked", !entry.locked)}>
                {entry.locked ? <><Unlock className="h-3.5 w-3.5 mr-2" />Unlock</> : <><Lock className="h-3.5 w-3.5 mr-2" />Lock</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(entry.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {expanded ? (
          <MarkdownContent className="text-muted-foreground">{entry.content}</MarkdownContent>
        ) : (
          <MarkdownContent compact className="text-muted-foreground line-clamp-3">{preview}</MarkdownContent>
        )}

        {entry.content.length > 180 && (
          <button
            type="button"
            onClick={() => setExpanded((o) => !o)}
            className="flex items-center gap-1 text-xs text-primary hover:underline w-fit"
          >
            {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Read more</>}
          </button>
        )}
      </div>
    </div>
  )
}

export default function DiaryClient({ entries: initial }: { entries: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initial)
  const [open, setOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const [, startTransition] = useTransition()
  const { confirm: showConfirm, dialog: confirmDialogNode } = useConfirmDialog()

  function handleAdd(data: typeof emptyForm) {
    // I place the new entry at the top because diary entries are always shown newest-first
    const optimistic: Entry = {
      id: crypto.randomUUID(),
      ...data,
      // I coerce an empty mood string to null to match the nullable DB column
      mood: data.mood || null,
      hidden: false,
      pinned: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const prevEntries = entries
    setEntries((prev) => [optimistic, ...prev])
    setOpen(false)
    startTransition(async () => {
      const res = await createDiaryEntry({ title: data.title, content: data.content, mood: data.mood })
      if (!savedOk(res, "Could not save diary entry")) setEntries(prevEntries)
    })
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editEntry) return
    const prev = entries
    const editId = editEntry.id
    setEntries((p) => p.map((e) => e.id === editId ? { ...e, ...data, mood: data.mood || null } : e))
    setEditEntry(null)
    startTransition(async () => {
      try {
        const res = await updateDiaryEntry(editId, { title: data.title, content: data.content, mood: data.mood })
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setEntries(prev)
        toast.error("Could not save diary entry")
      }
    })
  }

  async function handleDelete(id: string) {
    const entry = entries.find((e) => e.id === id)
    const ok = await showConfirm({
      title: entry ? `Delete "${entry.title}"?` : "Delete entry?",
      description: "This diary entry will be permanently deleted.",
      destructive: true,
    })
    if (!ok) return
    const prev = entries
    setEntries((p) => p.filter((e) => e.id !== id))
    startTransition(async () => {
      try {
        const res = await deleteDiaryEntry(id)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setEntries(prev)
        toast.error("Could not delete diary entry")
      }
    })
  }

  function handleToggle(id: string, field: "hidden" | "pinned" | "locked", value: boolean) {
    const prev = entries
    setEntries((p) => p.map((e) => e.id === id ? { ...e, [field]: value } : e))
    startTransition(async () => {
      const res = await (field === "hidden" ? toggleDiaryHidden(id, value) : field === "pinned" ? toggleDiaryPinned(id, value) : toggleDiaryLocked(id, value))
      if (!savedOk(res, "Could not update entry")) setEntries(prev)
    })
  }

  const hiddenCount = entries.filter((e) => e.hidden).length
  const visibleEntries = showHidden ? entries : entries.filter((e) => !e.hidden)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My diary</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {entries.length} entr{entries.length !== 1 ? "ies" : "y"} - just for me
            {hiddenCount > 0 && ` · ${hiddenCount} hidden`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowHidden((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
            >
              {showHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showHidden ? "Hide hidden" : "Show hidden"}
            </button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Write</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New entry</DialogTitle></DialogHeader>
              <EntryForm onSave={handleAdd} onCancel={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <MoodChart entries={entries} />

      {entries.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-2xl mb-2">📖</p>
          <p className="text-sm font-medium">Nothing written yet</p>
          <p className="text-xs text-muted-foreground mt-1">My thoughts, feelings and memories - all in one place.</p>
          <button type="button" onClick={() => setOpen(true)} className="text-sm text-primary hover:underline mt-3 block mx-auto">Write my first entry</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleEntries.map((e) => <EntryCard key={e.id} entry={e} onEdit={(entry) => setEditEntry(entry)} onDelete={handleDelete} onToggle={handleToggle} />)}
        </div>
      )}

      <Dialog open={!!editEntry} onOpenChange={(o) => { if (!o) setEditEntry(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit entry</DialogTitle></DialogHeader>
          {editEntry && (
            <EntryForm
              initial={{ title: editEntry.title, content: editEntry.content, mood: editEntry.mood ?? "" }}
              onSave={handleEdit}
              onCancel={() => setEditEntry(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      {confirmDialogNode}
    </div>
  )
}
