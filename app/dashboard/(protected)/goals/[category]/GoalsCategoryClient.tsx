"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import { GoalForm, GoalCard } from "../GoalsClient"
import { createGoal, updateGoal, deleteGoal } from "../../../actions"
import { savedOk } from "@/lib/save-result"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Target, TrendingUp, BookOpen, Heart, DollarSign, Sparkles } from "lucide-react"

// I re-export the Goal type shape here so this file is self-contained even though the type lives in GoalsClient
type Goal = {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  target_date: string | null
  progress: number
}

const emptyForm = {
  title: "",
  description: "",
  category: "Personal",
  status: "not_started",
  target_date: "",
  progress: 0,
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Personal: Sparkles,
  Academic: BookOpen,
  Career: TrendingUp,
  Health: Heart,
  Finance: DollarSign,
  Other: Target,
}

export default function GoalsCategoryClient({ goals: initial, category }: { goals: Goal[]; category: string }) {
  const [goals, setGoals] = useState<Goal[]>(initial)
  const [addOpen, setAddOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [, startTransition] = useTransition()

  const Icon = CATEGORY_ICONS[category] ?? Target

  function handleAdd(data: typeof emptyForm) {
    // I prepend an optimistic record so the new goal card appears instantly without waiting for Supabase
    const prev = goals
    const optimistic: Goal = {
      ...data,
      id: crypto.randomUUID(),
      description: data.description || null,
      target_date: data.target_date || null,
      category,
    }
    setGoals((p) => [optimistic, ...p])
    setAddOpen(false)
    startTransition(async () => {
      const res = await createGoal({ ...data, category })
      if (!savedOk(res, "Could not save goal")) setGoals(prev)
    })
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editGoal) return
    // I update locally first so the card reflects the change while the server action runs in the background
    const prev = goals
    const editId = editGoal.id
    setGoals((p) => p.map((g) => g.id === editId ? { ...g, ...data } : g))
    setEditGoal(null)
    startTransition(async () => {
      try {
        const res = await updateGoal(editId, data)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setGoals(prev)
        toast.error("Could not update goal")
      }
    })
  }

  function handleDelete(id: string) {
    // I remove optimistically so the card disappears immediately rather than waiting for the server
    const prev = goals
    setGoals((p) => p.filter((g) => g.id !== id))
    startTransition(async () => {
      try {
        const res = await deleteGoal(id)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setGoals(prev)
        toast.error("Could not delete goal")
      }
    })
  }

  return (
    <motion.div
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 max-w-3xl"
    >
      <DashboardBreadcrumb
        crumbs={[
          { label: "Goals", href: "/dashboard/goals" },
          { label: category },
        ]}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">{category}</h1>
          <span className="text-sm text-muted-foreground">
            {goals.length} goal{goals.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New {category.toLowerCase()} goal</DialogTitle></DialogHeader>
            <GoalForm
              initial={{ ...emptyForm, category }}
              onSave={handleAdd}
              onCancel={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No {category.toLowerCase()} goals yet.</p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="text-sm text-primary hover:underline mt-1"
          >
            Add my first one
          </button>
        </div>
      ) : (
        <motion.div
          variants={dashboardGrid}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {goals.map((g) => (
            <motion.div key={g.id} variants={dashboardCard}>
              <GoalCard
                goal={g}
                onEdit={(goal) => setEditGoal(goal)}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={!!editGoal} onOpenChange={(o) => { if (!o) setEditGoal(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit goal</DialogTitle></DialogHeader>
          {editGoal && (
            <GoalForm
              initial={{
                title: editGoal.title,
                description: editGoal.description ?? "",
                category: editGoal.category,
                status: editGoal.status,
                target_date: editGoal.target_date ?? "",
                progress: editGoal.progress,
              }}
              onSave={handleEdit}
              onCancel={() => setEditGoal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
