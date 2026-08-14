"use client"

import { useState, useTransition } from "react"
import { createUniNote, updateUniNote, deleteUniNote } from "../../../actions"
import { savedOk } from "@/lib/save-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MarkdownEditor from "@/components/shared/MarkdownEditor"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Pin, Pencil } from "lucide-react"

type Module = { id: string; code: string; name: string; color: string }
type UniNote = {
  id: string; title: string; content: string; type: string
  pinned: boolean; tags: string[]; updated_at: string
  uni_modules: { code: string; color: string } | null
}

const NOTE_TYPES = ["lecture", "tutorial", "meeting", "personal", "revision", "other"]
const TYPE_COLOUR: Record<string, string> = {
  lecture: "bg-blue-500/10 text-blue-500", tutorial: "bg-green-500/10 text-green-500",
  meeting: "bg-purple-500/10 text-purple-500", personal: "bg-orange-500/10 text-orange-500",
  revision: "bg-red-500/10 text-red-500", other: "bg-muted text-muted-foreground",
}

export default function UniNotesClient({ notes, modules }: { notes: UniNote[]; modules: Module[] }) {
  const [open, setOpen] = useState(false)
  const [editNote, setEditNote] = useState<UniNote | null>(null)
  const [viewNote, setViewNote] = useState<UniNote | null>(null)
  const [isPending, startTransition] = useTransition()
  const [moduleFilter, setModuleFilter] = useState("all")
  const [form, setForm] = useState({ module_id: "", title: "", content: "", type: "lecture", tags: "" })

  function resetForm() { setForm({ module_id: "", title: "", content: "", type: "lecture", tags: "" }); setEditNote(null) }

  function openEdit(n: UniNote) {
    setEditNote(n)
    setForm({ module_id: "", title: n.title, content: n.content, type: n.type, tags: n.tags.join(", ") })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
    startTransition(async () => {
      const res = editNote
        ? await updateUniNote(editNote.id, { title: form.title, content: form.content, type: form.type, tags })
        : await createUniNote({ module_id: form.module_id || undefined, title: form.title, content: form.content, type: form.type, tags })
      if (!savedOk(res, "Could not save note")) return
      setOpen(false)
      resetForm()
    })
  }

  function togglePin(n: UniNote) {
    startTransition(async () => { savedOk(await updateUniNote(n.id, { pinned: !n.pinned }), "Could not update note") })
  }

  const moduleIds = [...new Set(notes.filter((n) => n.uni_modules).map((n) => n.uni_modules!.code))]
  const filtered = moduleFilter === "all" ? notes : notes.filter((n) => n.uni_modules?.code === moduleFilter)

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Lecture notes, meeting summaries, revision notes</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New note</Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader><DialogTitle>{editNote ? "Edit note" : "New note"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input placeholder="e.g. Lecture 3 - Combinational Logic" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{NOTE_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {!editNote && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Module</label>
                  <Select value={form.module_id || "none"} onValueChange={(v) => setForm((f) => ({ ...f, module_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code} - {m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Content</label>
                <MarkdownEditor placeholder="Write your notes here..." value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} rows={8} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
                <Input placeholder="e.g. logic gates, circuits, exam" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isPending} className="flex-1">{editNote ? "Save" : "Create note"}</Button>
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {moduleIds.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          {[["all", "All"], ...moduleIds.map((c) => [c, c])].map(([v, l]) => (
            <button key={v} onClick={() => setModuleFilter(v)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${moduleFilter === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>{l}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">No notes yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((n) => (
            <div key={n.id} className={`rounded-xl border bg-card p-4 space-y-2 group hover:border-primary/30 transition-colors cursor-pointer ${n.pinned ? "border-primary/30 bg-primary/5" : "border-border/60"}`} onClick={() => setViewNote(n)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                    <p className="text-sm font-medium line-clamp-1">{n.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {n.uni_modules && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: n.uni_modules.color }} />}
                    {n.uni_modules && <span className="text-[10px] text-muted-foreground">{n.uni_modules.code}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TYPE_COLOUR[n.type] ?? TYPE_COLOUR.other}`}>{n.type}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" className="h-6 w-6" title={n.pinned ? "Unpin note" : "Pin note"} onClick={() => togglePin(n)} disabled={isPending}><Pin className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" title="Edit note" onClick={() => openEdit(n)}><Pencil className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" title="Delete note" onClick={() => startTransition(async () => { savedOk(await deleteUniNote(n.id), "Could not delete note") })} disabled={isPending}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              {n.content && <MarkdownContent compact className="line-clamp-3">{n.content}</MarkdownContent>}
              {n.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {n.tags.slice(0, 4).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>)}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">{new Date(n.updated_at).toLocaleDateString("en-GB")}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full note view dialog */}
      {viewNote && (
        <Dialog open={!!viewNote} onOpenChange={(v) => !v && setViewNote(null)}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewNote.title}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              {viewNote.uni_modules && <span className="text-xs text-muted-foreground">{viewNote.uni_modules.code}</span>}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TYPE_COLOUR[viewNote.type] ?? TYPE_COLOUR.other}`}>{viewNote.type}</span>
            </div>
            {viewNote.content ? <MarkdownContent className="mt-2">{viewNote.content}</MarkdownContent> : <p className="text-sm text-muted-foreground mt-2">No content.</p>}
            {viewNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {viewNote.tags.map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
