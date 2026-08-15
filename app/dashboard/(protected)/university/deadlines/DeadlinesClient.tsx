"use client"

import { useState, useTransition } from "react"
import { createUniDeadline, updateUniDeadline, deleteUniDeadline } from "../../../actions"
import { savedOk } from "@/lib/save-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Check, AlertTriangle } from "lucide-react"
import { AnalyticsPeriodProvider, PeriodSelector, useAnalyticsPeriod, StatCard } from "@/components/analytics"
import { Pagination } from "@/components/shared/Pagination"

type Module = { id: string; code: string; name: string; color: string }
type Deadline = {
  id: string; module_id: string | null; title: string; type: string
  due_date: string; weight_pct: number | null; status: string
  submitted_at: string | null; grade_received: string | null; notes: string | null
  uni_modules: { id: string; code: string; name: string; color: string } | null
}

const DEADLINES_PAGE_SIZE = 24

const TYPES = ["assignment", "coursework", "exam", "presentation", "quiz", "other"]
const STATUSES = ["not_started", "in_progress", "submitted", "graded"]

const STATUS_STYLE: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/10 text-blue-500",
  submitted: "bg-green-500/10 text-green-500",
  graded: "bg-purple-500/10 text-purple-500",
}

const TYPE_STYLE: Record<string, string> = {
  assignment: "bg-blue-500/10 text-blue-500",
  coursework: "bg-purple-500/10 text-purple-500",
  exam: "bg-red-500/10 text-red-500",
  presentation: "bg-orange-500/10 text-orange-500",
  quiz: "bg-yellow-500/10 text-yellow-600",
  other: "bg-muted text-muted-foreground",
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

function DeadlinesClientInner({ deadlines, modules }: { deadlines: Deadline[]; modules: Module[] }) {
  const [open, setOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("active")
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const today = new Date().toISOString().split("T")[0]
  const { period } = useAnalyticsPeriod()
  // Deadlines are forward-looking, so the selector means "due within the next N days" (All = no limit).
  const horizonDays = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : period === "1y" ? 365 : null
  const horizonEnd = (() => {
    if (horizonDays === null) return null
    const d = new Date()
    d.setDate(d.getDate() + horizonDays)
    return d.toISOString()
  })()
  const inHorizon = (d: Deadline) => horizonEnd === null || d.due_date <= horizonEnd

  const [form, setForm] = useState({
    module_id: "", title: "", type: "assignment",
    due_date: "", weight_pct: "", notes: "", semester: "1",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await createUniDeadline({
        module_id: form.module_id || undefined,
        title: form.title, type: form.type,
        due_date: form.due_date,
        weight_pct: form.weight_pct ? Number(form.weight_pct) : undefined,
        notes: form.notes || undefined,
        semester: Number(form.semester),
      })
      if (!savedOk(res, "Could not add deadline")) return
      setOpen(false)
      setForm({ module_id: "", title: "", type: "assignment", due_date: "", weight_pct: "", notes: "", semester: "1" })
    })
  }

  function setStatus(id: string, status: string) {
    startTransition(async () => { savedOk(await updateUniDeadline(id, {
      status,
      submitted_at: status === "submitted" ? new Date().toISOString() : undefined,
    }), "Could not update deadline") })
  }

  function setGrade(id: string, grade: string) {
    startTransition(async () => { savedOk(await updateUniDeadline(id, { grade_received: grade || null, status: "graded" }), "Could not save grade") })
  }

  const filtered = deadlines.filter((d) => {
    if (!inHorizon(d)) return false
    if (statusFilter === "active") return d.status !== "graded"
    if (statusFilter === "graded") return d.status === "graded"
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / DEADLINES_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * DEADLINES_PAGE_SIZE, safePage * DEADLINES_PAGE_SIZE)

  const resetKey = `${statusFilter}|${period}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) { setPrevResetKey(resetKey); setPage(1) }

  const overdue = filtered.filter((d) => daysUntil(d.due_date) < 0 && d.status !== "submitted" && d.status !== "graded")

  // Stats follow the period horizon (deadlines due within the selected window)
  const inWindow = deadlines.filter(inHorizon)
  const statUpcoming = inWindow.filter((d) => daysUntil(d.due_date) >= 0 && d.status !== "submitted" && d.status !== "graded").length
  const statOverdue = inWindow.filter((d) => daysUntil(d.due_date) < 0 && d.status !== "submitted" && d.status !== "graded").length
  const statSubmitted = inWindow.filter((d) => d.status === "submitted" || d.status === "graded").length

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deadlines</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Assignments, courseworks and exams</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add deadline</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add deadline</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input placeholder="e.g. Digital Systems Lab Report" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Module</label>
                  <Select value={form.module_id || "none"} onValueChange={(v) => setForm((f) => ({ ...f, module_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Due date</label>
                  <Input type="datetime-local" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Weight (%)</label>
                  <Input type="number" min={0} max={100} placeholder="e.g. 30" value={form.weight_pct} onChange={(e) => setForm((f) => ({ ...f, weight_pct: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <Textarea placeholder="Submission requirements, links..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isPending} className="flex-1">Add deadline</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Due within</p>
        <PeriodSelector />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="In window" value={inWindow.length} />
        <StatCard label="Upcoming" value={statUpcoming} />
        <StatCard label="Overdue" value={statOverdue} />
        <StatCard label="Submitted" value={statSubmitted} />
      </div>

      {overdue.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-500">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {overdue.length} overdue deadline{overdue.length > 1 ? "s" : ""}: {overdue.map((d) => d.title).join(", ")}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1">
        {[["active", "Active"], ["graded", "Graded"], ["all", "All"]].map(([v, l]) => (
          <button key={v} onClick={() => setStatusFilter(v)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${statusFilter === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
          No deadlines. Add your first one above.
        </div>
      ) : (
        <div className="space-y-2">
          {pageItems.map((d) => {
            const days = daysUntil(d.due_date)
            const isOverdue = days < 0 && d.status !== "submitted" && d.status !== "graded"
            return (
              <div key={d.id} className={`rounded-xl border bg-card p-4 space-y-2 ${isOverdue ? "border-red-500/30" : "border-border/60"} hover:border-primary/30 transition-colors group`}>
                <div className="flex items-start gap-3">
                  {d.uni_modules && <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: d.uni_modules.color }} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{d.title}</span>
                      {d.uni_modules && <span className="text-xs text-muted-foreground">{d.uni_modules.code}</span>}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TYPE_STYLE[d.type] ?? TYPE_STYLE.other}`}>{d.type}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_STYLE[d.status] ?? STATUS_STYLE.not_started}`}>{d.status.replace("_", " ")}</span>
                      {d.weight_pct && <span className="text-[10px] text-muted-foreground">{d.weight_pct}%</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : days <= 3 ? "text-yellow-600" : "text-muted-foreground"}`}>
                        {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `${days}d left`} - {new Date(d.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {d.grade_received && <span className="text-xs font-medium text-purple-500">{d.grade_received}</span>}
                    </div>
                    {d.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{d.notes}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {d.status !== "submitted" && d.status !== "graded" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setStatus(d.id, "submitted")} disabled={isPending}>
                        <Check className="h-3 w-3" />Submit
                      </Button>
                    )}
                    {d.status === "submitted" && !d.grade_received && (
                      <Input
                        className="h-7 w-20 text-xs"
                        placeholder="Grade..."
                        onBlur={(e) => e.target.value && setGrade(d.id, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && setGrade(d.id, (e.target as HTMLInputElement).value)}
                      />
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity" title="Delete deadline" onClick={() => startTransition(async () => { savedOk(await deleteUniDeadline(d.id), "Could not delete deadline") })} disabled={isPending}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={DEADLINES_PAGE_SIZE} itemLabel="deadlines" className="pt-4" />
        </div>
      )}
    </div>
  )
}

export default function DeadlinesClient(props: { deadlines: Deadline[]; modules: Module[] }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="30d">
      <DeadlinesClientInner {...props} />
    </AnalyticsPeriodProvider>
  )
}
