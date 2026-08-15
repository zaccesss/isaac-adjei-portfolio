"use client"

import { useState, useMemo, useTransition } from "react"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CheckCircle2, Plus, Trash2, Target,
  TrendingUp, Calendar, FlaskConical, Pencil, BarChart3
} from "lucide-react"
import { ColourPickerDialog } from "@/components/shared/ColourPickerDialog"
import {
  createHabit, updateHabit, deleteHabit, checkInHabit, undoHabitCheckIn,
} from "@/app/dashboard/actions"
import { savedOk } from "@/lib/save-result"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import { StatCard, BarChart, AnalyticsPeriodProvider, PeriodSelector, useAnalyticsPeriod, allTimeChartDays } from "@/components/analytics"
import { Pagination } from "@/components/shared/Pagination"

const SUPPLEMENT_PRESETS = ["Creatine", "Whey", "Vitamin D", "Omega-3", "Magnesium"]
const HABIT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#ef4444", "#8b5cf6", "#f97316"]
const HABITS_PAGE_SIZE = 24

type Habit = {
  id: string
  name: string
  description: string | null
  frequency: string
  color: string | null
  active: boolean
  created_at: string
}

type HabitLog = {
  id: string
  habit_id: string
  date: string
  created_at: string
}

function HabitsClientInner({
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
  const [editHabit, setEditHabit] = useState<Habit | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", color: HABIT_COLORS[0] })
  const [, startTransition] = useTransition()
  const [page, setPage] = useState(1)
  const { confirm: showConfirm, dialog: confirmDialogNode } = useConfirmDialog()
  const { period } = useAnalyticsPeriod()
  // "All time" used to silently reuse 1y's 365-day window, looking identical to 1y once there was
  // more than a year of logs - it now spans back to the earliest log actually recorded instead.
  const numDays = period === "24h" || period === "7d" ? 7
    : period === "30d" ? 30
    : period === "90d" ? 90
    : period === "1y" ? 365
    : allTimeChartDays(logs.map((l) => l.date), 365)

  // Local optimistic copy of today's check-ins so a tap toggles instantly, without the old
  // window.location.reload that raced the in-flight server action and dropped check-ins. Seeded from
  // the server logs on mount; revalidatePath keeps the rest of the data fresh on navigation.
  const [todayLogs, setTodayLogs] = useState<Set<string>>(() => new Set(logs.filter((l) => l.date === today).map((l) => l.habit_id)))

  function getStreak(habitId: string): number {
    const habitLogs = logs
      .filter((l) => l.habit_id === habitId)
      .map((l) => l.date)
      .sort()

    let streak = 0
    const checkDate = new Date(today)

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0]
      if (habitLogs.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (dateStr === today && streak === 0) {
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  // I compute the 30-day analytics once over the logs and habits I already have in state. The check-in
  // counts use the full logs history (not just today's optimistic set) so the chart reflects real data.
  const analytics = useMemo(() => {
    const totalHabits = habits.length
    const checkedToday = new Set(logs.filter((l) => l.date === today).map((l) => l.habit_id))
    const checkedInToday = habits.filter((h) => checkedToday.has(h.id)).length

    // Build the trailing window ending today; its length follows the period selector
    const days: string[] = []
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split("T")[0])
    }
    const windowSet = new Set(days)

    // Per-day check-in counts across all habits, for the bar chart
    const perDay = new Map<string, number>(days.map((d) => [d, 0]))
    let windowCheckIns = 0
    logs.forEach((l) => {
      if (windowSet.has(l.date)) {
        perDay.set(l.date, (perDay.get(l.date) ?? 0) + 1)
        windowCheckIns++
      }
    })
    const dailyCounts = days.map((d) => ({
      name: new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      count: perDay.get(d) ?? 0,
    }))

    // Completion % over the window = check-ins / (habits * 30 days) of possible check-ins
    const completionPct = totalHabits > 0
      ? Math.round((windowCheckIns / (totalHabits * numDays)) * 100)
      : 0

    // Best current streak across all habits, reusing the same logic as the per-habit rows
    const bestStreak = habits.reduce((best, h) => Math.max(best, getStreak(h.id)), 0)

    return { totalHabits, checkedInToday, completionPct, bestStreak, dailyCounts }
    // getStreak is a stable closure over logs/today; logs and habits are the real inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, logs, today, numDays])

  function handleAdd() {
    if (!newHabitName.trim()) return
    const optimistic: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      description: null,
      frequency: "daily",
      color: "#3b82f6",
      active: true,
      created_at: new Date().toISOString(),
    }
    const prev = habits
    setHabits((h) => [...h, optimistic])
    setNewHabitName("")
    setAdding(false)
    startTransition(async () => {
      const res = await createHabit({ name: optimistic.name, color: "#3b82f6" })
      if (!savedOk(res, "Could not add habit")) setHabits(prev)
    })
  }

  function handleCheckIn(habitId: string) {
    const isCheckedIn = todayLogs.has(habitId)
    // Optimistically toggle, then fire the action. No reload - revalidatePath refreshes the data and
    // the effect above re-syncs todayLogs, so a tap never interrupts its own write.
    setTodayLogs((prev) => {
      const next = new Set(prev)
      if (isCheckedIn) next.delete(habitId)
      else next.add(habitId)
      return next
    })
    startTransition(async () => {
      const res = await (isCheckedIn ? undoHabitCheckIn(habitId, today) : checkInHabit(habitId, today))
      if (!savedOk(res, "Could not update check-in")) {
        // Roll the optimistic toggle back so the tick matches what the server actually holds.
        setTodayLogs((prev) => {
          const next = new Set(prev)
          if (isCheckedIn) next.add(habitId)
          else next.delete(habitId)
          return next
        })
      }
    })
  }

  async function handleDelete(id: string, name: string) {
    const ok = await showConfirm({ title: `Delete "${name}"?`, description: "All check-in history for this habit will be removed.", destructive: true })
    if (!ok) return
    const prev = habits
    setHabits((h) => h.filter((x) => x.id !== id))
    startTransition(async () => {
      const res = await deleteHabit(id)
      if (!savedOk(res, "Could not delete habit")) setHabits(prev)
    })
  }

  function openEdit(habit: Habit) {
    setEditHabit(habit)
    setEditForm({ name: habit.name, description: habit.description ?? "", color: habit.color ?? HABIT_COLORS[0] })
  }

  function handleSaveEdit() {
    if (!editHabit || !editForm.name.trim()) return
    const prev = habits
    const editId = editHabit.id
    setHabits((h) => h.map((x) => x.id === editId ? { ...x, name: editForm.name.trim(), description: editForm.description.trim() || null, color: editForm.color } : x))
    startTransition(async () => {
      const res = await updateHabit(editId, { name: editForm.name.trim(), description: editForm.description.trim() || null, color: editForm.color })
      if (!savedOk(res, "Could not save habit")) setHabits(prev)
    })
    setEditHabit(null)
  }

  const totalPages = Math.max(1, Math.ceil(habits.length / HABITS_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = habits.slice((safePage - 1) * HABITS_PAGE_SIZE, safePage * HABITS_PAGE_SIZE)

  // No search/filter/sort/tab narrows this list, so the reset key tracks only the list length; if the
  // final page empties out after deletions the guard snaps the view back to page 1.
  const resetKey = `${habits.length}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) { setPrevResetKey(resetKey); setPage(1) }

  return (
    <motion.div
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 max-w-6xl"
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

      {habits.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Habit analytics</p>
            </div>
            <PeriodSelector />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total habits" value={analytics.totalHabits} scope="all-time" />
            <StatCard label="Checked in today" value={`${analytics.checkedInToday} / ${analytics.totalHabits}`} scope="current" />
            <StatCard label="Completion" value={`${analytics.completionPct}%`} />
            <StatCard label="Best streak" value={analytics.bestStreak} scope="all-time" />
          </div>

          <div className="border border-border rounded-xl p-4">
            <p className="text-sm font-medium mb-3">Check-ins per day</p>
            <BarChart data={analytics.dailyCounts} dataKey="count" xKey="name" height={120} />
          </div>
        </div>
      )}

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
          {pageItems.map((habit) => {
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
                    type="button"
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
                    {habit.description && (
                      <span className="text-xs text-muted-foreground">{habit.description}</span>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {streak > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <TrendingUp className="h-3 w-3" />
                          {streak} day streak
                        </span>
                      )}
                      {streak === 0 && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Start today
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(habit)}
                    className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Edit habit"
                    title="Edit habit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(habit.id, habit.name)}
                    className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete habit"
                    title="Delete habit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination
        page={safePage}
        totalPages={totalPages}
        onChange={setPage}
        totalItems={habits.length}
        pageSize={HABITS_PAGE_SIZE}
        itemLabel="habits"
        className="pt-4"
      />

      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Supplements</span>
          <span className="text-xs text-muted-foreground">- track as daily habits</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUPPLEMENT_PRESETS.map((name) => {
            const exists = habits.some((h) => h.name.toLowerCase() === name.toLowerCase())
            return (
              <button
                key={name}
                type="button"
                disabled={exists}
                title={exists ? `${name} is already tracked` : `Add ${name} as a daily habit`}
                onClick={() => {
                  if (exists) return
                  const optimistic: Habit = {
                    id: crypto.randomUUID(), name, description: "Daily supplement", frequency: "daily",
                    color: "#22c55e", active: true, created_at: new Date().toISOString(),
                  }
                  const prev = habits
                  setHabits((h) => [...h, optimistic])
                  startTransition(async () => {
                    const res = await createHabit({ name, color: "#22c55e", description: "Daily supplement" })
                    if (!savedOk(res, "Could not add habit")) setHabits(prev)
                  })
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  exists
                    ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-default"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {exists ? "✓ " : "+ "}{name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>Today: {new Date(today).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
      </div>

      <Dialog open={!!editHabit} onOpenChange={(o) => { if (!o) setEditHabit(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit habit</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Habit name"
              autoFocus
            />
            <Input
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Colour</span>
              {/* ColourPickerDialog: change only applies when the user presses Apply */}
              <ColourPickerDialog
                value={editForm.color}
                onChange={(c) => setEditForm((f) => ({ ...f, color: c }))}
                presets={HABIT_COLORS}
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" onClick={() => setEditHabit(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={!editForm.name.trim()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {confirmDialogNode}
    </motion.div>
  )
}

export default function HabitsClient(props: { habits: Habit[]; logs: HabitLog[]; today: string }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="30d">
      <HabitsClientInner {...props} />
    </AnalyticsPeriodProvider>
  )
}
