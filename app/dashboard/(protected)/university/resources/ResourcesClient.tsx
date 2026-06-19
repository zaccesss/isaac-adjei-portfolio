"use client"

import { useState, useTransition } from "react"
import { createUniResource, deleteUniResource } from "../../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ExternalLink, Link2, FileText, Video, BookOpen } from "lucide-react"

type Module = { id: string; code: string; name: string; color: string }
type Resource = {
  id: string; title: string; url: string | null; type: string; notes: string | null
  uni_modules: { code: string; color: string } | null
}

const TYPES = ["link", "slide", "handout", "past_paper", "book", "video", "other"]
const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  link: Link2, slide: FileText, handout: FileText,
  past_paper: BookOpen, book: BookOpen, video: Video, other: Link2,
}

export default function ResourcesClient({ resources, modules }: { resources: Resource[]; modules: Module[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [moduleFilter, setModuleFilter] = useState("all")
  const [form, setForm] = useState({ module_id: "", title: "", url: "", type: "link", notes: "", semester: "1" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await createUniResource({ module_id: form.module_id || undefined, title: form.title, url: form.url || undefined, type: form.type, notes: form.notes || undefined, semester: Number(form.semester) })
      setOpen(false)
      setForm({ module_id: "", title: "", url: "", type: "link", notes: "", semester: "1" })
    })
  }

  const moduleCodes = [...new Set(resources.filter((r) => r.uni_modules).map((r) => r.uni_modules!.code))]
  const filtered = moduleFilter === "all" ? resources : resources.filter((r) => r.uni_modules?.code === moduleFilter)

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Slides, links, handouts and past papers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add resource</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add resource</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input placeholder="e.g. Week 3 Lecture Slides" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Module</label>
                  <Select value={form.module_id} onValueChange={(v) => setForm((f) => ({ ...f, module_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">URL</label>
                <Input type="url" placeholder="https://..." value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isPending} className="flex-1">Add resource</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {moduleCodes.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          {[["all", "All"], ...moduleCodes.map((c) => [c, c])].map(([v, l]) => (
            <button key={v} onClick={() => setModuleFilter(v)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${moduleFilter === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>{l}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">No resources added yet.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const Icon = TYPE_ICON[r.type] ?? Link2
            return (
              <div key={r.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 group hover:border-primary/30 transition-colors">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                        {r.title}<ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    ) : (
                      <span className="text-sm font-medium">{r.title}</span>
                    )}
                    {r.uni_modules && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{r.uni_modules.code}</span>}
                    <span className="text-[10px] text-muted-foreground capitalize">{r.type.replace("_", " ")}</span>
                  </div>
                  {r.notes && <p className="text-xs text-muted-foreground mt-0.5">{r.notes}</p>}
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity shrink-0" onClick={() => startTransition(async () => { await deleteUniResource(r.id) })} disabled={isPending}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
