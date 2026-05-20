"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, X, Check } from "lucide-react"

type DiaryEntry = {
  id: string
  title: string
  content: string
  mood: string | null
  created_at: string
  updated_at: string
}

const MOODS = ["grateful", "happy", "reflective", "anxious", "sad", "motivated", "tired", "peaceful"]

const MOOD_COLOURS: Record<string, string> = {
  grateful: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  happy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  reflective: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  anxious: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  sad: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  motivated: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  tired: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  peaceful: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

function EntryCard({ entry, onDelete, onUpdate }: {
  entry: DiaryEntry
  onDelete: (id: string) => void
  onUpdate: (id: string, data: { title: string; content: string; mood: string }) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [mood, setMood] = useState(entry.mood ?? "")

  function handleSave() {
    onUpdate(entry.id, { title, content, mood })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="border border-primary/40 rounded-lg p-4 bg-card flex flex-col gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-medium" />
        <div className="flex gap-2 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m === mood ? "" : m)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${mood === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="text-sm" />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5" /></Button>
          <Button size="sm" onClick={handleSave}><Check className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        className="w-full text-left p-4 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">{entry.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</span>
              {entry.mood && (
                <Badge className={`text-xs px-1.5 py-0 capitalize ${MOOD_COLOURS[entry.mood] ?? "bg-muted text-muted-foreground"}`}>
                  {entry.mood}
                </Badge>
              )}
            </div>
          </div>
          {!expanded && (
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs hidden sm:block">
              {entry.content.slice(0, 80)}...
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/50 p-4 flex flex-col gap-3">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>
          <div className="flex gap-2 justify-end border-t border-border/50 pt-3">
            <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />Edit
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs text-destructive" onClick={() => onDelete(entry.id)}>
              <Trash2 className="h-3.5 w-3.5" />Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function NewEntryForm({ onSave, onClose }: { onSave: (data: { title: string; content: string; mood: string }) => void; onClose: () => void }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")

  return (
    <div className="border border-primary/40 rounded-lg p-4 bg-card flex flex-col gap-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title..." className="font-medium" />
      <div className="flex gap-2 flex-wrap">
        {MOODS.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m === mood ? "" : m)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${mood === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}
          >
            {m}
          </button>
        ))}
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write freely - this is private and only you can see it..."
        rows={10}
        className="text-sm"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={() => { if (title.trim() && content.trim()) onSave({ title, content, mood }) }} disabled={!title.trim() || !content.trim()}>
          Save entry
        </Button>
      </div>
    </div>
  )
}

export default function DiaryClient({ entries }: { entries: DiaryEntry[] }) {
  const [list, setList] = useState(entries)
  const [writing, setWriting] = useState(false)

  async function handleSave(data: { title: string; content: string; mood: string }) {
    const { data: inserted } = await supabase
      .from("diary")
      .insert({ ...data, mood: data.mood || null })
      .select()
      .single()
    if (inserted) setList((l) => [inserted, ...l])
    setWriting(false)
  }

  async function handleDelete(id: string) {
    await supabase.from("diary").delete().eq("id", id)
    setList((l) => l.filter((e) => e.id !== id))
  }

  async function handleUpdate(id: string, data: { title: string; content: string; mood: string }) {
    await supabase.from("diary").update({ ...data, mood: data.mood || null, updated_at: new Date().toISOString() }).eq("id", id)
    setList((l) => l.map((e) => e.id === id ? { ...e, ...data } : e))
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Diary</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Private - only visible to you</p>
        </div>
        {!writing && (
          <Button size="sm" className="gap-1" onClick={() => setWriting(true)}>
            <Plus className="h-4 w-4" />New entry
          </Button>
        )}
      </div>

      {writing && (
        <NewEntryForm onSave={handleSave} onClose={() => setWriting(false)} />
      )}

      {list.length === 0 && !writing && (
        <p className="text-sm text-muted-foreground">No entries yet. Start writing.</p>
      )}

      <div className="flex flex-col gap-3">
        {list.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  )
}
