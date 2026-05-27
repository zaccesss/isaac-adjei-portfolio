"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { createNote, updateNote, deleteNote } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Plus, Pin, Lock, Search, Folder, Tag, Trash2, Eye, Edit2, Download, X } from "lucide-react"
import PinGate from "@/components/dashboard/PinGate"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import { dashboardPage } from "@/lib/animations"

type Note = {
  id: string
  title: string
  content: string
  folder: string
  tags: string[]
  pinned: boolean
  locked: boolean
  color: string | null
  created_at: string
  updated_at: string
}

export default function NotesFolderClient({
  notes: initial,
  folder,
  folderSlug,
}: {
  notes: Note[]
  folder: string
  folderSlug: string
}) {
  const [notes, setNotes] = useState<Note[]>(initial)
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState("")
  const [selected, setSelected] = useState<Note | null>(null)
  const [editing, setEditing] = useState(false)
  // I pre-fill the folder from the current folder slug so new notes always land in the right place
  const defaultFolder = folderSlug === "all" ? "General" : folder
  const [draft, setDraft] = useState({ title: "", content: "", folder: defaultFolder, tags: [] as string[], color: null as string | null, locked: false, pinned: false })
  const [newTag, setNewTag] = useState("")
  const [preview, setPreview] = useState(false)
  const [unlockingNote, setUnlockingNote] = useState<Note | null>(null)
  const [, startTransition] = useTransition()

  // I derive all tags from the live notes array so they stay in sync after edits
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)))

  const filtered = notes.filter((n) => {
    if (activeTag && !n.tags.includes(activeTag)) return false
    if (search) {
      const q = search.toLowerCase()
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    }
    return true
  })

  const pinned = filtered.filter((n) => n.pinned)
  const unpinned = filtered.filter((n) => !n.pinned)

  function startNew() {
    setDraft({ title: "", content: "", folder: defaultFolder, tags: [], color: null, locked: false, pinned: false })
    setSelected(null)
    setEditing(true)
    setPreview(false)
  }

  function saveNew() {
    if (!draft.title.trim()) return
    const optimistic: Note = {
      id: crypto.randomUUID(),
      ...draft,
      pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setNotes((n) => [optimistic, ...n])
    setSelected(optimistic)
    setEditing(false)
    startTransition(() => void createNote(draft))
  }

  function saveEdit() {
    if (!selected || !draft.title.trim()) return
    const updated = { ...selected, ...draft, updated_at: new Date().toISOString() }
    setNotes((n) => n.map((x) => x.id === selected.id ? updated : x))
    setSelected(updated)
    setEditing(false)
    startTransition(() => void updateNote(selected.id, draft))
  }

  function handleDelete(id: string) {
    setNotes((n) => n.filter((x) => x.id !== id))
    if (selected?.id === id) setSelected(null)
    startTransition(() => void deleteNote(id))
  }

  function togglePin(note: Note) {
    const updated = { ...note, pinned: !note.pinned }
    setNotes((n) => n.map((x) => x.id === note.id ? updated : x))
    if (selected?.id === note.id) setSelected(updated)
    startTransition(() => void updateNote(note.id, { pinned: !note.pinned }))
  }

  function exportNote(note: Note) {
    // I create a temporary anchor rather than opening a new window so the browser treats it as a download
    const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${note.title.replace(/\s+/g, "-").toLowerCase()}.md`
    a.click()
    // I revoke immediately after click so the browser releases the object URL memory
    URL.revokeObjectURL(url)
  }

  function openNote(note: Note) {
    // I intercept locked notes before displaying them so the content never renders in the DOM unprotected
    if (note.locked) {
      setUnlockingNote(note)
    } else {
      setSelected(note)
      setEditing(false)
      setPreview(false)
    }
  }

  if (unlockingNote) {
    return (
      <PinGate
        pageName={`Unlock "${unlockingNote.title}"`}
        onUnlock={() => {
          setSelected(unlockingNote)
          setUnlockingNote(null)
        }}
      />
    )
  }

  return (
    <motion.div variants={dashboardPage} initial="hidden" animate="visible">
      <DashboardBreadcrumb
        crumbs={[
          { label: "Notes", href: "/dashboard/notes" },
          { label: folder },
        ]}
      />

      <div className="flex gap-4 h-[calc(100vh-10rem)] max-w-5xl">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 flex flex-col gap-3 border-r border-border pr-4">
          <Button size="sm" className="gap-1 w-full" onClick={startNew}>
            <Plus className="h-4 w-4" />New note
          </Button>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="pl-8 h-8 text-xs" />
          </div>

          <div className="flex items-center gap-2 px-1">
            <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">{folder}</span>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Tags</p>
              <div className="flex flex-wrap gap-1 px-1">
                {allTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTag(activeTag === t ? "" : t)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${activeTag === t ? "bg-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Note list */}
        <div className="w-48 shrink-0 flex flex-col gap-1 overflow-y-auto border-r border-border pr-3">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">No notes found</p>
          )}
          {[...pinned, ...unpinned].map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => openNote(note)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all hover:shadow-sm ${selected?.id === note.id ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-muted/50"}`}
              style={note.color ? { backgroundColor: note.color + "60" } : undefined}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="font-medium text-xs leading-snug line-clamp-2">{note.title}</p>
                <div className="flex gap-0.5 shrink-0">
                  {note.pinned && <Pin className="h-2.5 w-2.5 text-primary" />}
                  {note.locked && <Lock className="h-2.5 w-2.5 text-muted-foreground" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{note.content.slice(0, 80)}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {new Date(note.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
            </button>
          ))}
        </div>

        {/* Editor / viewer */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {editing ? (
            <>
              <div className="flex items-center gap-2">
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Note title"
                  className="flex-1 font-semibold text-base border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                  autoFocus
                />
                <button type="button" onClick={() => setPreview((p) => !p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" title="Toggle preview">
                  {preview ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  value={draft.folder}
                  onChange={(e) => setDraft((d) => ({ ...d, folder: e.target.value }))}
                  placeholder="Folder"
                  className="h-7 text-xs w-28"
                />
                <div className="flex items-center gap-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="#tag"
                    className="h-7 text-xs w-20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTag.trim()) {
                        setDraft((d) => ({ ...d, tags: [...new Set([...d.tags, newTag.replace(/^#/, "").trim()])] }))
                        setNewTag("")
                      }
                    }}
                  />
                </div>
                {draft.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                    #{t}
                    <button type="button" onClick={() => setDraft((d) => ({ ...d, tags: d.tags.filter((x) => x !== t) }))} aria-label="Remove tag" className="text-muted-foreground hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                  <Lock className="h-3 w-3" />
                  <input type="checkbox" checked={draft.locked} onChange={(e) => setDraft((d) => ({ ...d, locked: e.target.checked }))} className="sr-only" />
                  {draft.locked ? "Locked" : "Lock"}
                </label>
              </div>

              {preview ? (
                <div className="flex-1 overflow-y-auto prose prose-sm dark:prose-invert max-w-none border border-border rounded-lg p-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.content}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={draft.content}
                  onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                  placeholder="Write in markdown..."
                  className="flex-1 resize-none font-mono text-sm"
                />
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); if (!selected) setSelected(null) }}>Cancel</Button>
                <Button size="sm" onClick={selected ? saveEdit : saveNew} disabled={!draft.title.trim()}>Save</Button>
              </div>
            </>
          ) : selected ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-lg leading-snug">{selected.title}</h2>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => togglePin(selected)} aria-label={selected.pinned ? "Unpin" : "Pin"} className={`p-1.5 rounded hover:bg-muted transition-colors ${selected.pinned ? "text-primary" : "text-muted-foreground"}`}><Pin className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => { setDraft({ title: selected.title, content: selected.content, folder: selected.folder, tags: selected.tags, color: selected.color, locked: selected.locked, pinned: selected.pinned }); setEditing(true) }} aria-label="Edit note" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => exportNote(selected)} aria-label="Export as markdown" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Download className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => handleDelete(selected.id)} aria-label="Delete note" className="p-1.5 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Folder className="h-3 w-3" />{selected.folder}</span>
                {selected.tags.map((t) => <span key={t} className="flex items-center gap-0.5"><Tag className="h-3 w-3" />#{t}</span>)}
                <span>{new Date(selected.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>

              <div className="flex-1 overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-3xl">📝</p>
              <p className="text-sm font-medium">Select a note or create a new one</p>
              <p className="text-xs text-muted-foreground">Markdown supported. Notes are just for me.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
