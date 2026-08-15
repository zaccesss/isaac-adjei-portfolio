"use client"

// A bespoke Gantt - recharts has no native Gantt type. Reuses the Waterfall's invisible-spacer-bar
// technique (an invisible bar carries each visible bar out to its start point) but laid out
// horizontally with task names down the Y axis and a day-offset X axis, the standard Gantt shape.
import { ResponsiveContainer, BarChart as RBarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export interface GanttTask {
  id: string
  name: string
  start_date: string
  end_date: string
  status: string
}

const STATUS_COLOURS: Record<string, string> = {
  done: "#22c55e",
  complete: "#22c55e",
  completed: "#22c55e",
  "in progress": "#3b82f6",
  in_progress: "#3b82f6",
  active: "#3b82f6",
  blocked: "#ef4444",
  planned: "#94a3b8",
  planning: "#94a3b8",
}

function statusColour(status: string): string {
  return STATUS_COLOURS[status.toLowerCase()] ?? "#8b5cf6"
}

const dayMs = 24 * 60 * 60 * 1000

export function Gantt({ tasks, height }: { tasks: GanttTask[]; height?: number }) {
  if (!tasks.length) {
    return <p className="text-xs text-muted-foreground">No tasks yet - add a task with a start and end date to plot a timeline.</p>
  }

  const sorted = [...tasks].sort((a, b) => a.start_date.localeCompare(b.start_date))
  const projectStart = new Date(sorted[0].start_date).getTime()

  const rows = sorted.map((t) => {
    const start = new Date(t.start_date).getTime()
    const end = new Date(t.end_date).getTime()
    const offsetDays = Math.round((start - projectStart) / dayMs)
    const durationDays = Math.max(1, Math.round((end - start) / dayMs))
    return { ...t, offsetDays, durationDays }
  })

  return (
    <ResponsiveContainer width="100%" height={height ?? Math.max(160, rows.length * 34)}>
      <RBarChart data={rows} layout="vertical" margin={{ top: 6, right: 12, bottom: 0, left: 8 }} barCategoryGap={10}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `day ${v}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as (typeof rows)[number] | undefined
            if (!active || !row) return null
            return (
              <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                <p className="font-medium text-foreground">{row.name}</p>
                <p className="text-muted-foreground">{row.start_date} to {row.end_date}</p>
                <p className="text-muted-foreground capitalize">{row.status}</p>
              </div>
            )
          }}
          cursor={{ fill: "hsl(var(--muted))", radius: 3 }}
        />
        {/* Invisible spacer bar carries each task bar out to its own start offset. */}
        <Bar dataKey="offsetDays" stackId="g" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="durationDays" stackId="g" radius={[3, 3, 3, 3]} isAnimationActive={false}>
          {rows.map((row) => (
            <Cell key={row.id} fill={statusColour(row.status)} />
          ))}
        </Bar>
      </RBarChart>
    </ResponsiveContainer>
  )
}
