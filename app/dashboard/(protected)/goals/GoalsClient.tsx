"use client"
// I show an overview of goals grouped by life category (Personal, Academic, Career etc.)
// and let me navigate into each category to see individual goal cards with progress bars.

import { useState, useTransition } from "react"
import Link from "next/link"
import { createGoal } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Target, TrendingUp, BookOpen, Heart, DollarSign, Sparkles } from "lucide-react"
import MarkdownContent from "@/components/shared/MarkdownContent"

type Goal = {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  target_date: string | null
  progress: number
}

const CATEGORIES = ["Personal", "Academic", "Career", "Health", "Finance", "Other"]
const STATUSES = ["not_started", "in_progress", "done", "abandoned"]

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  abandoned: "Abandoned",
}

const STATUS_COLOURS: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  abandoned: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Personal: Sparkles,
  Academic: BookOpen,
  Career: TrendingUp,
  Health: Heart,
  Finance: DollarSign,
  Other: Target,
}

const CATEGORY_COLOURS: Record<string, string> = {
  Personal: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
  Academic: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
  Career: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20",
  Health: "from-rose-500/10 to-rose-500/5 border-rose-500/20",
  Finance: "from-green-500/10 to-green-500/5 border-green-500/20",
  Other: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
}

const emptyForm = {
  title: "",
  description: "",
  category: "Personal",
  status: "not_started",
  target_date: "",
  progress: 0,
}

export function GoalForm({ initial, onSave, onCancel }: {
  initial?: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial ?? emptyForm)
  const set = (k: keyof typeof emptyForm, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Goal <span className="text-destructive">*</span></label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="What do I want to achieve?" autoFocus />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="More detail..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Target date</label>
          <Input type="date" value={form.target_date} onChange={(e) => set("target_date", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Progress ({form.progress}%)</label>
          <input type="range" min={0} max={100} value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} className="w-full accent-primary mt-2" />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (form.title.trim()) onSave(form) }} disabled={!form.title.trim()}>Save</Button>
      </div>
    </div>
  )
}

export function GoalCard({ goal, onEdit, onDelete }: {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-medium text-sm leading-snug">{goal.title}</p>
          {goal.description && <div className="line-clamp-2"><MarkdownContent compact>{goal.description}</MarkdownContent></div>}
        </div>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={() => onEdit(goal)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit goal" title="Edit goal"><Edit2 className="h-3 w-3" /></button>
          <button type="button" onClick={() => onDelete(goal.id)} className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-colors" aria-label="Delete goal" title="Delete goal"><Trash2 className="h-3 w-3" /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`text-xs px-2 py-0 ${STATUS_COLOURS[goal.status]}`}>{STATUS_LABELS[goal.status]}</Badge>
        {goal.target_date && <span className="text-xs text-muted-foreground">by {new Date(goal.target_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
      </div>
      {goal.progress > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${goal.progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{goal.progress}%</span>
        </div>
      )}
    </div>
  )
}

function CategoryCard({ category, goals }: {
  category: string
  goals: Goal[]
}) {
  const Icon = CATEGORY_ICONS[category] ?? Target
  const colourClass = CATEGORY_COLOURS[category] ?? CATEGORY_COLOURS.Other

  const done = goals.filter((g) => g.status === "done").length
  const inProgress = goals.filter((g) => g.status === "in_progress").length
  const total = goals.length

  // I navigate to the category sub-page so the full goal list has its own route
  return (
    <Link
      href={`/dashboard/goals/${category.toLowerCase()}`}
      className={`block border rounded-xl p-4 bg-gradient-to-br ${colourClass} hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-sm">{category}</span>
        </div>
        <span className="text-xs text-muted-foreground">{total} goal{total !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
        <span className="text-green-600 dark:text-green-400 font-medium">{done} done</span>
        <span className="text-blue-600 dark:text-blue-400">{inProgress} in progress</span>
        <span>{total - done - inProgress} not started</span>
      </div>
      {total > 0 && (
        <div className="mt-3 bg-muted/60 rounded-full h-1.5 overflow-hidden">
          <div className="h-1.5 bg-green-500 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      )}
    </Link>
  )
}

export default function GoalsClient({ goals: initial }: { goals: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initial)
  const [addOpen, setAddOpen] = useState(false)
  const [addCategory, setAddCategory] = useState("Personal")
  const [, startTransition] = useTransition()

  const total = goals.length
  const done = goals.filter((g) => g.status === "done").length

  function handleAdd(data: typeof emptyForm) {
    // I prepend a local optimistic record so the new goal appears instantly before the DB round-trip
    const optimistic: Goal = { ...data, id: crypto.randomUUID(), description: data.description || null, target_date: data.target_date || null, category: addCategory }
    setGoals((prev) => [optimistic, ...prev])
    setAddOpen(false)
    startTransition(() => void createGoal({ ...data, category: addCategory }))
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My goals</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{done} of {total} achieved</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={() => setAddCategory("Personal")}>
              <Plus className="h-4 w-4" /> Add goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New goal</DialogTitle></DialogHeader>
            <GoalForm initial={{ ...emptyForm, category: addCategory }} onSave={handleAdd} onCancel={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat}
            category={cat}
            goals={goals.filter((g) => g.category === cat)}
          />
        ))}
      </div>
    </div>
  )
}
