"use client"

import { useState, useTransition } from "react"
import { createStreak, updateStreak, deleteStreak, checkInStreak, undoStreakCheckIn } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Flame, Trophy, Check, Activity, Pencil } from "lucide-react"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend, PieChart, Pie } from "recharts"
import {
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  periodStartDate,
  StatCard,
  DEFAULT_CHART_COLOURS,
} from "@/components/analytics"

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
  const d = new Date(today)
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
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }
  return (
    <div className="flex gap-0.5 flex-wrap">
      {days.map((d) => (
        <div key={d} title={d} className={`w-3 h-3 rounded-sm transition-colors ${done.has(d) ? "bg-green-500" : "bg-muted"}`} />
      ))}
    </div>
  )
}

const STREAK_COLOURS = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"]

function StreakActivityChart({ streaks, logs, today }: { streaks: Streak[]; logs: Log[]; today: string }) {
  const { period } = useAnalyticsPeriod()
  if (streaks.length === 0) return null

  const cutoff = periodStartDate(period)

  // numDays drives all chart windows
  const numDays = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365
  const numWeeks = Math.max(1, Math.min(52, Math.ceil(numDays / 7)))

  // Build day array for the period
  const days: string[] = []
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }

  const doneSets = new Map(
    streaks.map((s) => [
      s.id,
      new Set(logs.filter((l) => l.streak_id === s.id && l.completed).map((l) => l.date)),
    ]),
  )

  // Filter logs to period for aggregate stats
  const periodLogs = cutoff
    ? logs.filter((l) => l.date >= cutoff.toISOString().slice(0, 10))
    : logs

  const totalCheckIns = periodLogs.filter((l) => l.completed).length
  const bestCurrent = Math.max(0, ...streaks.map((s) => calcCurrentStreak(logs, s.id, today)))
  const compliancePct = streaks.length > 0 && numDays > 0
    ? Math.round((totalCheckIns / (streaks.length * numDays)) * 100)
    : 0
  const checkedInToday = streaks.filter((s) => doneSets.get(s.id)?.has(today)).length

  // Daily check-ins
  const dailyCounts = days.map((d) => {
    let count = 0
    streaks.forEach((s) => { if (doneSets.get(s.id)?.has(d)) count++ })
    return {
      label: new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      count,
    }
  })

  // Weekly summary
  const allDays365: string[] = []
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    allDays365.push(d.toISOString().split("T")[0])
  }
  const weeks: { label: string; count: number }[] = []
  for (let w = 0; w < numWeeks; w++) {
    const weekDays = allDays365.slice(w * 7, w * 7 + 7)
    if (!weekDays.length) continue
    const anchor = new Date(weekDays[weekDays.length - 1])
    const label = anchor.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    let count = 0
    weekDays.forEach((d) => { streaks.forEach((s) => { if (doneSets.get(s.id)?.has(d)) count++ }) })
    weeks.push({ label, count })
  }

  // Per-streak pie
  const pieData = streaks
    .map((s, i) => ({
      name: `${s.icon} ${s.name}`,
      value: days.filter((d) => doneSets.get(s.id)?.has(d)).length,
      colour: STREAK_COLOURS[i % STREAK_COLOURS.length],
    }))
    .filter((d) => d.value > 0)

  // Per-streak activity line (sampled every 7 days)
  const sampled = days.filter((_, i) => i % 7 === 0 || i === days.length - 1)
  const lineData = sampled.map((d) => {
    const point: Record<string, string | number> = {
      date: new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    }
    streaks.forEach((s) => { point[s.id] = doneSets.get(s.id)?.has(d) ? 1 : 0 })
    return point
  })

  const periodLabel =
    period === "24h" ? "Today" :
    period === "7d" ? "Last 7 days" :
    period === "30d" ? "Last 30 days" :
    period === "90d" ? "Last 90 days" :
    period === "1y" ? "This year" : "All time"

  return (
    <div className="flex flex-col gap-4 mt-2 border-t border-border pt-6">
      {/* Analytics header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Streak analytics</p>
          <span className="text-xs text-muted-foreground">- {periodLabel}</span>
        </div>
        <PeriodSelector />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Check-ins this period" value={totalCheckIns} />
        <StatCard label="Checked in today" value={`${checkedInToday} / ${streaks.length}`} />
        <StatCard label="Best current streak" value={bestCurrent} />
        <StatCard label="Compliance" value={`${compliancePct}%`} />
      </div>

      {/* Daily check-ins bar */}
      <div className="border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Daily check-ins</p>
          <p className="text-xs text-muted-foreground">{totalCheckIns} total</p>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={dailyCounts} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8 }}
              tickLine={false}
              axisLine={false}
              interval={Math.max(0, Math.floor(numDays / 10) - 1)}
            />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const count = payload[0]?.value as number
                return (
                  <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                    <p className="font-medium mb-0.5">{String(label)}</p>
                    <p className="text-muted-foreground">{count} check-in{count !== 1 ? "s" : ""}</p>
                  </div>
                )
              }}
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {dailyCounts.map((entry, i) => (
                <Cell key={i} fill={entry.count === 0 ? "hsl(var(--muted))" : "#22c55e"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-streak share pie */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Check-in share</p>
              <p className="text-xs text-muted-foreground">{periodLabel}</p>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.colour} />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                          <p className="font-medium">{String(payload[0].name)}</p>
                          <p className="text-muted-foreground">{payload[0].value} check-ins</p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.colour }} />
                      <span className="truncate text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="font-medium tabular-nums shrink-0">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly summary bar */}
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Weekly check-ins</p>
              <p className="text-xs text-muted-foreground">{numWeeks} week{numWeeks !== 1 ? "s" : ""}</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeks} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.max(0, Math.floor(numWeeks / 6) - 1)}
                />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const count = payload[0]?.value as number
                    return (
                      <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                        <p className="font-medium">w/e {String(label)}</p>
                        <p className="text-muted-foreground">{count} check-in{count !== 1 ? "s" : ""}</p>
                      </div>
                    )
                  }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {weeks.map((entry, i) => (
                    <Cell key={i} fill={entry.count === 0 ? "hsl(var(--muted))" : DEFAULT_CHART_COLOURS[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-habit activity line chart */}
      {streaks.length > 1 && sampled.length >= 2 && (
        <div className="border border-border rounded-xl p-4">
          <p className="text-sm font-medium mb-3">Activity by habit</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={lineData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.floor(sampled.length / 8) - 1)}
              />
              <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 0 }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const checked = payload.filter((p) => Number(p.value) === 1)
                  return (
                    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                      <p className="font-medium mb-1">{String(label)}</p>
                      {checked.length === 0
                        ? <p className="text-muted-foreground">None checked in</p>
                        : checked.map((p) => {
                            const s = streaks.find((x) => x.id === String(p.dataKey))
                            return <p key={String(p.dataKey)}>{s?.icon} {s?.name}</p>
                          })}
                    </div>
                  )
                }}
              />
              <Legend
                formatter={(value) => {
                  const s = streaks.find((x) => x.id === value)
                  return s ? `${s.icon} ${s.name}` : value
                }}
                wrapperStyle={{ fontSize: 11 }}
              />
              {streaks.map((s, i) => (
                <Line
                  key={s.id}
                  dataKey={s.id}
                  stroke={STREAK_COLOURS[i % STREAK_COLOURS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function StreakCard({ streak, logs, today, onDelete, onEdit, onCheckIn }: {
  streak: Streak
  logs: Log[]
  today: string
  onDelete: (id: string) => void
  onEdit: (streak: Streak) => void
  onCheckIn: (streakId: string, date: string, undo: boolean) => void
}) {
  const checkedInToday = logs.some((l) => l.streak_id === streak.id && l.date === today && l.completed)
  const current = calcCurrentStreak(logs, streak.id, today)
  const longest = calcLongestStreak(logs, streak.id)

  return (
    <div className="border border-border rounded-xl bg-card p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{streak.icon}</span>
          <div>
            <p className="font-semibold text-sm">{streak.name}</p>
            {streak.description && <MarkdownContent compact>{streak.description}</MarkdownContent>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(streak)}
            aria-label="Edit streak"
            title="Edit streak"
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(streak.id)}
            aria-label="Delete streak"
            title="Delete streak"
            className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
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
        onClick={() => onCheckIn(streak.id, today, checkedInToday)}
      >
        <Check className="h-4 w-4" />
        {checkedInToday ? "Checked in today ✓" : "Check in"}
      </Button>
    </div>
  )
}

const emptyForm = { name: "", icon: "🔥", description: "", color: "#6366f1" }

function StreaksContent({ streaks: initial, logs: initialLogs, today }: {
  streaks: Streak[]
  logs: Log[]
  today: string
}) {
  const [streaks, setStreaks] = useState<Streak[]>(initial)
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editStreak, setEditStreak] = useState<Streak | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
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
    startTransition(() => void createStreak({ ...form, order_index: optimistic.order_index }))
  }

  function handleDelete(id: string) {
    setStreaks((s) => s.filter((x) => x.id !== id))
    startTransition(() => void deleteStreak(id))
  }

  function openEdit(streak: Streak) {
    setEditStreak(streak)
    setEditForm({ name: streak.name, icon: streak.icon, description: streak.description ?? "", color: streak.color })
  }

  function handleSaveEdit() {
    if (!editStreak || !editForm.name.trim()) return
    setStreaks((s) => s.map((x) => x.id === editStreak.id ? { ...x, ...editForm, description: editForm.description || null } : x))
    startTransition(() => void updateStreak(editStreak.id, { name: editForm.name, icon: editForm.icon, description: editForm.description, color: editForm.color }))
    setEditStreak(null)
  }

  function handleCheckIn(streakId: string, date: string, undo: boolean) {
    if (undo) {
      setLogs((l) => l.filter((x) => !(x.streak_id === streakId && x.date === date)))
      startTransition(() => void undoStreakCheckIn(streakId, date))
    } else {
      const newLog: Log = { id: crypto.randomUUID(), streak_id: streakId, date, completed: true }
      setLogs((l) => [...l, newLog])
      startTransition(() => void checkInStreak(streakId, date))
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
                <Input
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="🔥"
                  className="text-xl text-center col-span-1"
                />
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Streak name"
                  className="col-span-3"
                  autoFocus
                />
              </div>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
              />
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streaks.map((s) => (
              <StreakCard
                key={s.id}
                streak={s}
                logs={logs}
                today={today}
                onDelete={handleDelete}
                onEdit={openEdit}
                onCheckIn={handleCheckIn}
              />
            ))}
          </div>
          <StreakActivityChart streaks={streaks} logs={logs} today={today} />
        </>
      )}

      <Dialog open={!!editStreak} onOpenChange={(o) => { if (!o) setEditStreak(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit streak</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-2">
              <Input
                value={editForm.icon}
                onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🔥"
                className="text-xl text-center col-span-1"
              />
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Streak name"
                className="col-span-3"
                autoFocus
              />
            </div>
            <Input
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Colour</label>
              <div className="flex gap-2 flex-wrap items-center">
                {STREAK_COLOURS.map((c) => (
                  <button key={c} type="button" title={c} onClick={() => setEditForm((f) => ({ ...f, color: c }))}
                    className={`w-5 h-5 rounded-full transition-transform ${editForm.color === c ? "scale-125 ring-2 ring-offset-1 ring-foreground" : ""}`}
                    style={{ background: c }}
                  />
                ))}
                <input
                  type="color"
                  value={editForm.color}
                  onChange={(e) => setEditForm((f) => ({ ...f, color: e.target.value }))}
                  title="Custom colour"
                  className="w-5 h-5 rounded-full cursor-pointer border border-border bg-transparent p-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setEditStreak(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={!editForm.name.trim()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function StreaksClient({ streaks, logs, today }: {
  streaks: Streak[]
  logs: Log[]
  today: string
}) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="90d">
      <StreaksContent streaks={streaks} logs={logs} today={today} />
    </AnalyticsPeriodProvider>
  )
}
