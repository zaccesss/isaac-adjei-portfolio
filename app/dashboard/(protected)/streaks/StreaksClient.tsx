"use client"

import { useState, useTransition } from "react"
import { createStreak, deleteStreak, checkInStreak, undoStreakCheckIn } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Flame, Trophy, Check } from "lucide-react"

type Streak = {
  id: string
  name: string
  icon: string
  description: string | null
  color: string
  order_index: number
}

type Log = {
  id: string
  streak_id: string
  date: string
  completed: boolean
}

function calcCurrentStreak(logs: Log[], streakId: string, today: string): number {
  const done = new Set(logs.filter((l) => l.streak_id === streakId && l.completed).map((l) => l.date))
  let streak = 0
  let d = new Date(today)
  while (true) {
    const ds = d.toISOString().split("T")[0]
    if (done.has(ds)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function calcLongestStreak(logs: Log[], streakId: string): number {
  const dates = logs
    .filter((l) => l.streak_id === streakId && l.completed)
    .map((l) => l.date)
    .sort()
  if (!dates.length) return 0
  let longest = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else if (diff > 1) {
      current = 1
    }
  }
  return longest
}

function HeatmapGrid({ logs, streakId, today }: { logs: Log[]; streakId: string; today: string }) {
  const done = new Set(logs.filter((l) => l.streak_id === streakId && l.completed).map((l) => l.date))
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }
  return (
    <div className="flex gap-1 flex-wrap">
      {days.map((d) => (
        <div
          key={d}
          title={d}
          className={`w-4 h-4 rounded-sm transition-colors ${done.has(d) ? "bg-green-500" : "bg-muted"}`}
        />
      ))}
    </div>
  )
}

function StreakCard({ streak, logs, today, onDelete }: {
  streak: Streak
  logs: Log[]
  today: string
  onDelete: (id: string) => void
}) {
  const [, startTransition] = useTransition()
  const checkedInToday = logs.some((l) => l.streak_id === streak.id && l.date === today && l.completed)
  const current = calcCurrentStreak(logs, streak.id, today)
  const longest = calcLongestStreak(logs, streak.id)

  function handleCheckIn() {
    if (checkedInToday) {
      startTransition(() => undoStreakCheckIn(streak.id, today))
    } else {
      startTransition(() => checkInStreak(streak.id, today))
    }
  }

  return (
    <div className="border border-border rounded-xl bg-card p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{streak.icon}</span>
          <div>
            <p className="font-semibold text-sm">{streak.name}</p>
            {streak.description && <p className="text-xs text-muted-foreground">{streak.description}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(streak.id)}
          aria-label="Delete streak"
          className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-sm font-bold">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>{current}</span>
          </div>
          <span className="text-xs text-muted-foreground">Current streak</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-sm font-bold">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>{longest}</span>
          </div>
          <span className="text-xs text-muted-foreground">Longest streak</span>
        </div>
      </div>

      <HeatmapGrid logs={logs} streakId={streak.id} today={today} />

      <Button
        size="sm"
        variant={checkedInToday ? "outline" : "default"}
        className={`w-full gap-2 ${checkedInToday ? "text-green-600 border-green-300 dark:border-green-700" : ""}`}
        onClick={handleCheckIn}
      >
        <Check className="h-4 w-4" />
        {checkedInToday ? "Checked in today" : "Check in"}
      </Button>
    </div>
  )
}

const emptyForm = { name: "", icon: "🔥", description: "", color: "#6366f1" }

export default function StreaksClient({ streaks: initial, logs: initialLogs, today }: {
  streaks: Streak[]
  logs: Log[]
  today: string
}) {
  const [streaks, setStreaks] = useState<Streak[]>(initial)
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [, startTransition] = useTransition()

  const checkedInCount = streaks.filter((s) =>
    logs.some((l) => l.streak_id === s.id && l.date === today && l.completed)
  ).length

  function handleAdd() {
    if (!form.name.trim()) return
    const optimistic: Streak = { id: crypto.randomUUID(), ...form, order_index: streaks.length }
    setStreaks((s) => [...s, optimistic])
    setOpen(false)
    setForm(emptyForm)
    startTransition(() => createStreak({ ...form, order_index: optimistic.order_index }))
  }

  function handleDelete(id: string) {
    setStreaks((s) => s.filter((x) => x.id !== id))
    startTransition(() => deleteStreak(id))
  }

  function handleCheckIn(streakId: string, date: string, undo: boolean) {
    if (undo) {
      setLogs((l) => l.filter((x) => !(x.streak_id === streakId && x.date === date)))
      startTransition(() => undoStreakCheckIn(streakId, date))
    } else {
      const newLog: Log = { id: crypto.randomUUID(), streak_id: streakId, date, completed: true }
      setLogs((l) => [...l, newLog])
      startTransition(() => checkInStreak(streakId, date))
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Streaks</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{checkedInCount} of {streaks.length} checked in today</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add streak</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New streak</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-4 gap-2">
                <Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🔥" className="text-xl text-center col-span-1" />
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Streak name" className="col-span-3" autoFocus />
              </div>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={!form.name.trim()}>Add streak</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {streaks.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-3xl mb-2">🔥</p>
          <p className="text-sm font-medium">No streaks yet</p>
          <p className="text-xs text-muted-foreground mt-1">Track daily habits and build consistency.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streaks.map((s) => (
            <StreakCard
              key={s.id}
              streak={s}
              logs={logs}
              today={today}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
