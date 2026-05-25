"use client"

import { useState, useTransition } from "react"
import {
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  toggleDiaryHidden,
  toggleDiaryPinned,
  toggleDiaryLocked,
} from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Pin, PinOff, Lock, Unlock, LockKeyhole } from "lucide-react"
import { EntryMenu, EntryMenuItem } from "@/components/dashboard/EntryMenu"
import PinGate from "@/components/dashboard/PinGate"

type Entry = {
  id: string
  title: string
  content: string
  mood: string | null
  // Group F columns - I added these in the 2026-05-25 migration to support the 3-dot menu actions.
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
      <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={8} placeholder="Write freely... this is just for me." className="resize-none" />
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

function EntryCard({ entry, onEdit, onDelete, onToggleHidden, onTogglePinned, onToggleLocked, onRequestUnlock }: {
  entry: Entry
  onEdit: (e: Entry) => void
  onDelete: (id: string) => void
  onToggleHidden: (id: string, hidden: boolean) => void
  onTogglePinned: (id: string, pinned: boolean) => void
  onToggleLocked: (id: string, locked: boolean) => void
  onRequestUnlock: (e: Entry) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const mood = getMood(entry.mood)
  // I truncate at 180 characters so card heights stay consistent in the feed
  const preview = entry.content.slice(0, 180) + (entry.content.length > 180 ? "..." : "")
  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length
  const date = new Date(entry.created_at)
  const isToday = new Date().toDateString() === date.toDateString()

  // I build the menu items dynamically so the label flips with the entry state.
  const menuItems: EntryMenuItem[] = [
    { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: () => onEdit(entry) },
    {
      label: entry.pinned ? "Unpin" : "Pin",
      icon: entry.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />,
      onClick: () => onTogglePinned(entry.id, !entry.pinned),
    },
    {
      label: entry.locked ? "Unlock" : "Lock",
      icon: entry.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />,
      onClick: () => {
        if (entry.locked) {
          // I require the dashboard PIN before unlocking so locks mean something.
          onRequestUnlock(entry)
        } else {
          onToggleLocked(entry.id, true)
        }
      },
    },
    {
      label: entry.hidden ? "Show" : "Hide",
      icon: entry.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />,
      onClick: () => onToggleHidden(entry.id, !entry.hidden),
    },
    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => onDelete(entry.id), tone: "destructive" },
  ]

  return (
    <div className={`border border-border rounded-xl bg-card overflow-hidden hover:shadow-sm transition-shadow ${entry.mood ? MOOD_BG[entry.mood] ?? "" : ""}`}>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isToday && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">Today</span>}
              {entry.pinned && <Pin className="h-3 w-3 text-primary" aria-label="Pinned" />}
              {entry.locked && <LockKeyhole className="h-3 w-3 text-muted-foreground" aria-label="Locked" />}
              {mood && <span className="text-base">{mood.emoji}</span>}
              <h3 className="font-semibold text-sm">{entry.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {" · "}{date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              {" · "}{wordCount} word{wordCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <EntryMenu items={menuItems} ariaLabel="Diary entry actions" />
          </div>
        </div>

        {entry.locked ? (
          <p className="text-sm text-muted-foreground italic flex items-center gap-1.5">
            <LockKeyhole className="h-3.5 w-3.5" /> Locked - click the menu to unlock with my PIN.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {expanded ? entry.content : preview}
            </p>
            {entry.content.length > 180 && (
              <button
                type="button"
                onClick={() => setExpanded((o) => !o)}
                className="flex items-center gap-1 text-xs text-primary hover:underline w-fit"
              >
                {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Read more</>}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function DiaryClient({ entries: initial }: { entries: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initial)
  const [open, setOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [unlockEntry, setUnlockEntry] = useState<Entry | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const [, startTransition] = useTransition()

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
    setEntries((prev) => [optimistic, ...prev])
    setOpen(false)
    startTransition(() => createDiaryEntry({ title: data.title, content: data.content, mood: data.mood }))
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editEntry) return
    setEntries((prev) => prev.map((e) => e.id === editEntry.id ? { ...e, ...data, mood: data.mood || null } : e))
    setEditEntry(null)
    startTransition(() => updateDiaryEntry(editEntry.id, { title: data.title, content: data.content, mood: data.mood }))
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    startTransition(() => deleteDiaryEntry(id))
  }

  function handleToggleHidden(id: string, hidden: boolean) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, hidden } : e))
    startTransition(() => toggleDiaryHidden(id, hidden))
  }

  function handleTogglePinned(id: string, pinned: boolean) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, pinned } : e))
    startTransition(() => toggleDiaryPinned(id, pinned))
  }

  function handleToggleLocked(id: string, locked: boolean) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, locked } : e))
    startTransition(() => toggleDiaryLocked(id, locked))
  }

  // I split entries into visible vs hidden, then pinned vs unpinned, so the
  // feed shows pinned first and offers a reveal button for hidden entries.
  const visible = entries.filter((e) => !e.hidden)
  const hidden = entries.filter((e) => e.hidden)
  const pinned = visible.filter((e) => e.pinned)
  const unpinned = visible.filter((e) => !e.pinned)

  // I gate unlocking behind the dashboard PIN so locked diary entries are
  // protected even from a casual passer-by at my desk.
  if (unlockEntry) {
    return (
      <PinGate
        pageName={`Unlock "${unlockEntry.title}"`}
        onUnlock={() => {
          handleToggleLocked(unlockEntry.id, false)
          setUnlockEntry(null)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My diary</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{entries.length} entr{entries.length !== 1 ? "ies" : "y"} - just for me</p>
        </div>
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

      {entries.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-2xl mb-2">�-</p>
          <p className="text-sm font-medium">Nothing written yet</p>
          <p className="text-xs text-muted-foreground mt-1">My thoughts, feelings and memories - all in one place.</p>
          <button type="button" onClick={() => setOpen(true)} className="text-sm text-primary hover:underline mt-3 block mx-auto">Write my first entry</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...pinned, ...unpinned].map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              onEdit={(entry) => setEditEntry(entry)}
              onDelete={handleDelete}
              onToggleHidden={handleToggleHidden}
              onTogglePinned={handleTogglePinned}
              onToggleLocked={handleToggleLocked}
              onRequestUnlock={(entry) => setUnlockEntry(entry)}
            />
          ))}
        </div>
      )}

      {hidden.length > 0 && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowHidden((s) => !s)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start flex items-center gap-1.5"
          >
            {showHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showHidden ? `Hide ${hidden.length} hidden entr${hidden.length !== 1 ? "ies" : "y"}` : `Show ${hidden.length} hidden entr${hidden.length !== 1 ? "ies" : "y"}`}
          </button>
          {showHidden && hidden.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              onEdit={(entry) => setEditEntry(entry)}
              onDelete={handleDelete}
              onToggleHidden={handleToggleHidden}
              onTogglePinned={handleTogglePinned}
              onToggleLocked={handleToggleLocked}
              onRequestUnlock={(entry) => setUnlockEntry(entry)}
            />
          ))}
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
    </div>
  )
}
