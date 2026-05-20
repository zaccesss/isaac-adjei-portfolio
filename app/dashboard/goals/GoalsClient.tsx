"use client"

import { useState, useTransition } from "react"
import { createGoal, updateGoal, deleteGoal } from "../actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Goal = {
  id: string
  title: string
  description: string | null
  category: string | null
  status: string
  target_date: string | null
  progress: number
}

const STATUS_COLOURS: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  abandoned: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  abandoned: "Abandoned",
}

const CATEGORIES = ["Academic", "Career", "Personal", "Health", "Finance"]

const emptyForm = {
  title: "",
  description: "",
  category: "Academic",
  status: "not_started",
  target_date: "",
  progress: 0,
}

function GoalForm({
  initial,
  onSave,
  onClose,
}: {
  initial: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof emptyForm, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Title</label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Goal title" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional description" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Category</label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Status</label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Target date</label>
          <Input type="date" value={form.target_date} onChange={(e) => set("target_date", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Progress ({form.progress}%)</label>
          <Input type="number" min={0} max={100} value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { if (form.title.trim()) onSave(form) }}>Save</Button>
      </div>
    </div>
  )
}

export default function GoalsClient({ goals }: { goals: Goal[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [, startTransition] = useTransition()

  const filtered = goals.filter((g) => {
    if (filterStatus !== "all" && g.status !== filterStatus) return false
    if (filterCategory !== "all" && g.category !== filterCategory) return false
    return true
  })

  const grouped = CATEGORIES.reduce<Record<string, Goal[]>>((acc, cat) => {
    const items = filtered.filter((g) => g.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  const uncategorised = filtered.filter((g) => !g.category || !CATEGORIES.includes(g.category))
  if (uncategorised.length) grouped["Other"] = uncategorised

  function handleCreate(data: typeof emptyForm) {
    startTransition(() => createGoal(data))
    setOpen(false)
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editing) return
    startTransition(() => updateGoal(editing.id, data))
    setEditing(null)
  }

  function handleDelete(id: string) {
    startTransition(() => deleteGoal(id))
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Goals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New goal</DialogTitle></DialogHeader>
            <GoalForm initial={emptyForm} onSave={handleCreate} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No goals yet. Add one above.</p>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</p>
          {items.map((goal) => (
            <div key={goal.id} className="border border-border rounded-lg p-4 flex flex-col gap-2 bg-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{goal.title}</span>
                    <Badge className={`text-xs px-2 py-0 ${STATUS_COLOURS[goal.status] ?? STATUS_COLOURS.not_started}`}>
                      {STATUS_LABELS[goal.status] ?? goal.status}
                    </Badge>
                  </div>
                  {goal.description && <p className="text-xs text-muted-foreground">{goal.description}</p>}
                  {goal.target_date && (
                    <p className="text-xs text-muted-foreground">
                      Target: {new Date(goal.target_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(goal)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(goal.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {goal.progress > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{goal.progress}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit goal</DialogTitle></DialogHeader>
          {editing && (
            <GoalForm
              initial={{
                title: editing.title,
                description: editing.description ?? "",
                category: editing.category ?? "Academic",
                status: editing.status,
                target_date: editing.target_date ?? "",
                progress: editing.progress,
              }}
              onSave={handleEdit}
              onClose={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
