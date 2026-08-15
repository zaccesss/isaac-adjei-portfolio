"use client"

// A project burndown - open (not-done) tasks remaining per day across the project's own date
// range, against an ideal straight-line pace from "all tasks open" at the start to "zero open" at
// the end. Pairs with Gantt (same project_tasks data, a different lens: schedule vs progress).
import { ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

export interface BurndownTask {
  start_date: string
  end_date: string
  status: string
}

const dayMs = 24 * 60 * 60 * 1000

export function Burndown({ tasks, height = 200 }: { tasks: BurndownTask[]; height?: number }) {
  if (tasks.length < 2) {
    return <p className="text-xs text-muted-foreground">Add at least 2 tasks to plot a burndown.</p>
  }

  const rangeStart = new Date(Math.min(...tasks.map((t) => new Date(t.start_date).getTime())))
  const rangeEnd = new Date(Math.max(...tasks.map((t) => new Date(t.end_date).getTime())))
  const totalDays = Math.max(1, Math.round((rangeEnd.getTime() - rangeStart.getTime()) / dayMs))
  const totalTasks = tasks.length

  const rows: { date: string; remaining: number; ideal: number }[] = []
  for (let i = 0; i <= totalDays; i++) {
    const day = new Date(rangeStart.getTime() + i * dayMs)
    const dayKey = day.toISOString().slice(0, 10)
    // A task counts as "open" on this day if it has not reached its own end date and is not done -
    // i.e. still contributing to remaining work as of this point in the project.
    const remaining = tasks.filter((t) => t.status !== "done" && new Date(t.end_date).getTime() >= day.getTime()).length
    const ideal = Math.max(0, Math.round(totalTasks * (1 - i / totalDays)))
    rows.push({ date: dayKey, remaining, ideal })
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={22} />
        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        <Line type="monotone" dataKey="remaining" name="Open tasks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ideal" name="Ideal pace" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
      </RLineChart>
    </ResponsiveContainer>
  )
}
