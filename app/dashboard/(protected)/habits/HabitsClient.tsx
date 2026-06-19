"use client"

import { useState, useTransition } from "react"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2, Plus, Trash2, RotateCcw, Target,
  TrendingUp, Calendar
} from "lucide-react"
import {
  createStreak, updateStreak, deleteStreak,
  checkInStreak, undoStreakCheckIn
} from "@/app/dashboard/actions"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"

type Habit = {
  id: string
  name: string
  description: string | null
  frequency: string
  target_days: number
  colour: string | null
  active: boolean
  created_at: string
}

type HabitLog = {
  id: string
  habit_id: string
  date: string
  created_at: string
}

export default function HabitsClient({
  habits: initial,
  logs,
  today,
}: {
  habits: Habit[]
  logs: HabitLog[]
  today: string
}) {
  const [habits, setHabits] = useState<Habit[]>(initial)
  const [newHabitName, setNewHabitName] = useState("")
  const [adding, setAdding] = useState(false)
  const [, startTransition] = useTransition()
  const { confirm: showConfirm, dialog: confirmDialogNode } = useConfirmDialog()

  // I build a lookup of which habits are checked in today
  const todayLogs = new Set(logs.filter((l) => l.date === today).map((l) => l.habit_id))

  // I calculate current streak for each habit
  function getStreak(habitId: string): number {
    const habitLogs = logs
      .filter((l) => l.habit_id === habitId)
      .map((l) => l.date)
      .sort()
    
    let streak = 0
    const checkDate = new Date(today)
    
    // I check backwards from today to find consecutive days
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0]
      if (habitLogs.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (dateStr === today && streak === 0) {
        // I skip today if not checked in yet
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  function handleAdd() {
    if (!newHabitName.trim()) return
    const optimistic: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      description: null,
      frequency: "daily",
      target_days: 30,
      colour: null,
      active: true,
      created_at: new Date().toISOString(),
    }
    setHabits((h) => [...h, optimistic])
    setNewHabitName("")
    setAdding(false)
    startTransition(() => void createStreak({ name: optimistic.name, icon: "🎯", description: "", color: "#3b82f6", order_index: habits.length }))
  }

  function handleCheckIn(habitId: string) {
    const isCheckedIn = todayLogs.has(habitId)
    if (isCheckedIn) {
      // I undo the check-in
      startTransition(() => void undoStreakCheckIn(habitId, today))
    } else {
      // I check in
      startTransition(() => void checkInStreak(habitId, today))
    }
    // I force a reload to get fresh data
    window.location.reload()
  }

  async function handleDelete(id: string, name: string) {
    const ok = await showConfirm({ title: `Delete "${name}"?`, description: "All check-in history for this habit will be removed.", destructive: true })
    if (!ok) return
    setHabits((h) => h.filter((x) => x.id !== id))
    startTransition(() => void deleteStreak(id))
  }

  return (
    <motion.div
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 max-w-2xl"
    >
      <DashboardBreadcrumb crumbs={[{ label: "Habits" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Habits</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Build consistency one day at a time
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          New habit
        </Button>
      </div>

      {adding && (
        <div className="flex items-center gap-2">
          <Input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Habit name..."
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
              if (e.key === "Escape") setAdding(false)
            }}
          />
          <Button size="sm" onClick={handleAdd}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-2xl mb-2">🎯</p>
          <p className="text-sm font-medium">No habits yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first habit to start tracking
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const isCheckedIn = todayLogs.has(habit.id)
            const streak = getStreak(habit.id)

            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  isCheckedIn
                    ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCheckIn(habit.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isCheckedIn
                        ? "bg-green-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    aria-label={isCheckedIn ? "Undo check-in" : "Check in"}
                    title={isCheckedIn ? "Undo check-in" : "Check in"}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <div className="flex flex-col">
                    <span className={`font-medium ${isCheckedIn ? "line-through opacity-60" : ""}`}>
                      {habit.name}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {streak > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <TrendingUp className="h-3 w-3" />
                          {streak} day streak
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {habit.target_days} days target
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(habit.id, habit.name)}
                  className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete habit"
                  title="Delete habit"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>Today: {new Date(today).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
      </div>
      {confirmDialogNode}
    </motion.div>
  )
}
