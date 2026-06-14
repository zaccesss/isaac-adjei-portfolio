"use client"

import { useState, useTransition } from "react"
import { createStreak, deleteStreak, checkInStreak, undoStreakCheckIn } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Flame, Trophy, Check } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend, PieChart, Pie } from "recharts"

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
  date: string      // ISO yyyy-mm-dd - I avoid Date objects in state to dodge timezone offset bugs
  completed: boolean
}

// I compute the current streak purely on the client from the logs array rather than storing it
// in the DB - that way it is always consistent with whatever logs are in local state and there
// is no risk of a cached counter going stale after an undo operation
function calcCurrentStreak(logs: Log[], streakId: string, today: string): number {
  // I build a Set of completed dates for this streak so the inner loop is O(1) per day
  const done = new Set(logs.filter((l) => l.streak_id === streakId && l.completed).map((l) => l.date))
  let streak = 0
  const d = new Date(today)
  // I walk backwards from today counting consecutive completed days until there is a gap
  while (true) {
    const ds = d.toISOString().split("T")[0]  // I re-slice each iteration because setDate mutates d in place
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
  // I sort the dates ascending first because the DB returns them in insertion order not date order
  const dates = logs
    .filter((l) => l.streak_id === streakId && l.completed)
    .map((l) => l.date)
    .sort()
  if (!dates.length) return 0
  let longest = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    // I compute the gap in whole days by dividing the millisecond difference
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      // I only increment when the diff is exactly 1 day - duplicates (diff=0) correctly break the chain
      current++
      longest = Math.max(longest, current)
    } else if (diff > 1) {
      // I reset current to 1 (not 0) because the date at index i starts a new potential streak
      current = 1
    }
  }
  return longest
}

// I show 90 days as a GitHub-style heatmap so it is immediately obvious
// whether habits are consistent or patchy without needing to look at a number
function HeatmapGrid({ logs, streakId, today }: { logs: Log[]; streakId: string; today: string }) {
  const done = new Set(logs.filter((l) => l.streak_id === streakId && l.completed).map((l) => l.date))
  const days: string[] = []
  // I build the day array from 89 days ago to today so index 0 is the oldest and the last item is today
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }
  return (
    <div className="flex gap-0.5 flex-wrap">
      {days.map((d) => (
        // I put the date in the title attribute so hovering reveals the exact day
        <div key={d} title={d} className={`w-3 h-3 rounded-sm transition-colors ${done.has(d) ? "bg-green-500" : "bg-muted"}`} />
      ))}
    </div>
  )
}

const STREAK_COLOURS = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"]

function StreakActivityChart({ streaks, logs, today }: { streaks: Streak[]; logs: Log[]; today: string }) {
  if (streaks.length === 0) return null

  const days: string[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }

  const doneSets = new Map(streaks.map((s) => [
    s.id,
    new Set(logs.filter((l) => l.streak_id === s.id && l.completed).map((l) => l.date)),
  ]))

  // Weekly summary bar chart data - total check-ins per week
  const weeks: { label: string; count: number }[] = []
  for (let w = 0; w < 13; w++) {
    const weekDays = days.slice(w * 7, w * 7 + 7)
    if (!weekDays.length) continue
    const anchor = new Date(weekDays[weekDays.length - 1])
    const label = anchor.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    let count = 0
    weekDays.forEach((d) => {
      streaks.forEach((s) => { if (doneSets.get(s.id)?.has(d)) count++ })
    })
    weeks.push({ label, count })
  }

  // Per-streak line chart data - sampled every 7 days
  const sampled = days.filter((_, i) => i % 7 === 0 || i === days.length - 1)
  const lineData = sampled.map((d) => {
    const point: Record<string, string | number> = {
      date: new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    }
    streaks.forEach((s) => { point[s.id] = doneSets.get(s.id)?.has(d) ? 1 : 0 })
    return point
  })

  const totalCheckins = weeks.reduce((a, b) => a + b.count, 0)

  const pieData = streaks
    .map((s, i) => ({
      name: `${s.icon} ${s.name}`,
      value: days.filter((d) => doneSets.get(s.id)?.has(d)).length,
      colour: STREAK_COLOURS[i % STREAK_COLOURS.length],
    }))
    .filter((d) => d.value > 0)

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Weekly total bar chart */}
      <div className="border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Weekly check-ins (90 days)</p>
          <p className="text-xs text-muted-foreground">{totalCheckins} total</p>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeks} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const count = payload[0]?.value as number
                return (
                  <div className="bg-card border border-border rounded px-2.5 py-1.5 text-xs shadow-sm">
                    <p className="font-medium mb-0.5">w/e {label}</p>
                    <p className="text-muted-foreground">{count} check-in{count !== 1 ? "s" : ""}</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {weeks.map((entry, i) => (
                <Cell key={i} fill={entry.count === 0 ? "hsl(var(--muted))" : "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-streak check-in share pie chart */}
      {pieData.length > 0 && (
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Check-in share (90 days)</p>
            <p className="text-xs text-muted-foreground">{totalCheckins} total</p>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.colour} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} check-ins`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
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
      )}

      {/* Per-streak line chart with individual colors */}
      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-medium mb-3">Activity by habit (90 days)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={lineData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={1} />
            <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 0 }} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const checked = payload.filter((p) => Number(p.value) === 1)
                return (
                  <div className="bg-card border border-border rounded px-2.5 py-1.5 text-xs shadow-sm">
                    <p className="font-medium mb-1">{label}</p>
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
    </div>
  )
}

function StreakCard({ streak, logs, today, onDelete, onCheckIn }: {
  streak: Streak
  logs: Log[]
  today: string
  onDelete: (id: string) => void
  onCheckIn: (streakId: string, date: string, undo: boolean) => void
}) {
  // I check checkedInToday before rendering so the button reflects the correct state immediately
  // even before the server action has finished
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
            {streak.description && <p className="text-xs text-muted-foreground">{streak.description}</p>}
          </div>
        </div>
        <button type="button" onClick={() => onDelete(streak.id)} aria-label="Delete streak"
          className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* I put current streak first because it is the number people care about day-to-day */}
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

      {/* I toggle the button variant to "outline" when already checked in so the checked state is obvious */}
      <Button
        size="sm"
        variant={checkedInToday ? "outline" : "default"}
        className={`w-full gap-2 ${checkedInToday ? "text-green-600 border-green-300 dark:border-green-700" : ""}`}
        onClick={() => onCheckIn(streak.id, today, checkedInToday)}  // I pass the current checkedIn state as `undo` so the handler knows which direction to go
      >
        <Check className="h-4 w-4" />
        {checkedInToday ? "Checked in today ✓" : "Check in"}
      </Button>
    </div>
  )
}

// I keep the empty form object in a constant outside the component so I can reset to it cheaply
// without creating a new object reference on every render
const emptyForm = { name: "", icon: "🔥", description: "", color: "#6366f1" }

export default function StreaksClient({ streaks: initial, logs: initialLogs, today }: {
  streaks: Streak[]
  logs: Log[]
  today: string  // I receive today from the server so the client and server always agree on the current date
}) {
  const [streaks, setStreaks] = useState<Streak[]>(initial)
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  // I use useTransition so all server action calls run in the background without blocking the UI
  const [, startTransition] = useTransition()

  // I derive checkedInCount directly from logs so it updates instantly on any check-in without a separate state var
  const checkedInCount = streaks.filter((s) =>
    logs.some((l) => l.streak_id === s.id && l.date === today && l.completed)
  ).length

  function handleAdd() {
    if (!form.name.trim()) return
    // I create an optimistic streak with crypto.randomUUID() so it renders immediately -
    // the real DB id will be used on next page load but the experience feels instant
    const optimistic: Streak = { id: crypto.randomUUID(), ...form, order_index: streaks.length }
    setStreaks((s) => [...s, optimistic])  // I append to the end because order_index is based on current length
    setOpen(false)
    setForm(emptyForm)  // I reset the form before the transition fires so the dialog feels snappy
    startTransition(() => void createStreak({ ...form, order_index: optimistic.order_index }))
  }

  function handleDelete(id: string) {
    // I remove locally first so the card disappears instantly - no loading state needed
    setStreaks((s) => s.filter((x) => x.id !== id))
    startTransition(() => void deleteStreak(id))
  }

  function handleCheckIn(streakId: string, date: string, undo: boolean) {
    if (undo) {
      // I filter out the specific log entry so the heatmap cell and streak count update in the same render
      setLogs((l) => l.filter((x) => !(x.streak_id === streakId && x.date === date)))
      startTransition(() => void undoStreakCheckIn(streakId, date))
    } else {
      // I append a synthetic log entry so calcCurrentStreak sees it immediately
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
          {/* I show the checked-in count as a quick daily progress indicator so I know at a glance
              whether I still have habits to complete today */}
          <p className="text-xs text-muted-foreground mt-0.5">{checkedInCount} of {streaks.length} checked in today</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add streak</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New streak</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-3">
              {/* I put icon and name in a 4-column grid so they sit on one line without a label row */}
              <div className="grid grid-cols-4 gap-2">
                <Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🔥" className="text-xl text-center col-span-1" />
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Streak name" className="col-span-3" autoFocus />
              </div>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                {/* I disable Add until the name field has non-whitespace content */}
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
          {/* I use a responsive grid so cards are single-column on mobile and 3-column on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streaks.map((s) => (
              <StreakCard
                key={s.id}
                streak={s}
                logs={logs}      // I pass the full logs array down and let each card filter to its own streakId
                today={today}
                onDelete={handleDelete}
                onCheckIn={handleCheckIn}
              />
            ))}
          </div>
          <StreakActivityChart streaks={streaks} logs={logs} today={today} />
        </>
      )}
    </div>
  )
}
