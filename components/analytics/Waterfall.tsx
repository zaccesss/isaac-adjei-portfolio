"use client"

// A bespoke waterfall - recharts has no native waterfall type. Each bar floats from where the
// previous one ended; positive deltas are one colour, negative another, with an optional final
// "total" bar drawn from zero rather than floating.
import { ResponsiveContainer, BarChart as RBarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export interface WaterfallStep {
  name: string
  delta: number
  // Marks this step as an absolute total (e.g. starting/current weight) rather than a delta -
  // drawn from zero instead of floating from the running total.
  isTotal?: boolean
}

const POSITIVE = "#22c55e"
const NEGATIVE = "#ef4444"
const TOTAL = "hsl(var(--primary))"

export function Waterfall({
  steps,
  height = 200,
  valueFormatter,
}: {
  steps: WaterfallStep[]
  height?: number
  valueFormatter?: (value: number) => string
}) {
  if (!steps.length) {
    return <p className="text-xs text-muted-foreground">No data for this period.</p>
  }
  const format = valueFormatter ?? ((v: number) => String(v))

  const { rows } = steps.reduce<{ rows: { name: string; base: number; value: number; delta: number; isTotal: boolean }[]; running: number }>(
    (acc, step) => {
      if (step.isTotal) {
        return {
          rows: [...acc.rows, { name: step.name, base: 0, value: step.delta, delta: step.delta, isTotal: true }],
          running: step.delta,
        }
      }
      const start = acc.running
      const running = start + step.delta
      const base = Math.min(start, running)
      const value = Math.abs(step.delta)
      return {
        rows: [...acc.rows, { name: step.name, base, value, delta: step.delta, isTotal: false }],
        running,
      }
    },
    { rows: [], running: 0 },
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: 8 }} stackOffset="none">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis hide />
        <Tooltip
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as (typeof rows)[number] | undefined
            if (!active || !row) return null
            return (
              <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                <p className="font-medium text-foreground">{row.name}</p>
                <p className="text-muted-foreground">
                  {row.isTotal ? format(row.delta) : `${row.delta >= 0 ? "+" : ""}${format(row.delta)}`}
                </p>
              </div>
            )
          }}
          cursor={{ fill: "hsl(var(--muted))", radius: 3 }}
        />
        {/* Invisible spacer bar carries each floating bar up to its start point. */}
        <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="value" stackId="w" radius={[3, 3, 3, 3]} isAnimationActive={false}>
          {rows.map((row) => (
            <Cell key={row.name} fill={row.isTotal ? TOTAL : row.delta >= 0 ? POSITIVE : NEGATIVE} />
          ))}
        </Bar>
      </RBarChart>
    </ResponsiveContainer>
  )
}
