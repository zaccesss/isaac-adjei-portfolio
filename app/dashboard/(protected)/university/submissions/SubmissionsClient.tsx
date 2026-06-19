"use client"

import { useState, useTransition } from "react"
import { createUniSubmission, deleteUniSubmission } from "../../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload, FileText, ExternalLink } from "lucide-react"

type Module = { id: string; code: string; name: string; color: string }
type Deadline = { id: string; title: string; module_id: string | null }
type Submission = {
  id: string; title: string; submitted_at: string
  file_name: string | null; file_url: string | null; notes: string | null
  uni_modules: { code: string; color: string } | null
}

export default function SubmissionsClient({ submissions, modules, deadlines }: {
  submissions: Submission[]; modules: Module[]; deadlines: Deadline[]
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ module_id: "", deadline_id: "", title: "", file_name: "", notes: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await createUniSubmission({
        module_id: form.module_id || undefined,
        deadline_id: form.deadline_id || undefined,
        title: form.title,
        file_name: form.file_name || undefined,
        notes: form.notes || undefined,
      })
      setOpen(false)
      setForm({ module_id: "", deadline_id: "", title: "", file_name: "", notes: "" })
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Permanent log of everything submitted</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Log submission</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log submission</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input placeholder="e.g. Digital Systems Lab Report" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Deadline (optional)</label>
                  <Select value={form.deadline_id} onValueChange={(v) => setForm((f) => ({ ...f, deadline_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {deadlines.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">File name</label>
                <Input placeholder="e.g. lab_report_v2.pdf" value={form.file_name} onChange={(e) => setForm((f) => ({ ...f, file_name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <Textarea placeholder="Submission platform, version notes..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isPending} className="flex-1">Log submission</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-sm text-muted-foreground">{submissions.length} submission{submissions.length !== 1 ? "s" : ""} logged</div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
          No submissions logged yet.
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => (
            <div key={s.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 group hover:border-primary/30 transition-colors">
              <Upload className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{s.title}</span>
                  {s.uni_modules && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{s.uni_modules.code}</span>
                  )}
                </div>
                {s.file_name && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{s.file_name}</span>
                  </div>
                )}
                {s.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.notes}</p>}
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Submitted {new Date(s.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {s.file_url && (
                <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity shrink-0"
                onClick={() => startTransition(() => deleteUniSubmission(s.id))} disabled={isPending}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
