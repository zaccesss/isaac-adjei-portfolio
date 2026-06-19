"use client"

// Thin recharts wrappers themed from the existing dashboard convention (hsl(var(--border))
// gridlines, hsl(var(--primary)) default series colour, hsl(var(--muted)) tooltip cursor) -
// see CodingClient.tsx for the pattern this mirrors. Sections migrating onto the shared
// analytics framework (Coding, Blog, Modules, Applications) use these instead of importing
// recharts primitives directly, so chart styling stays consistent in one place.

import {
  LineChart as RLineChart, Line, BarChart as RBarChart, Bar,
  PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

export const DEFAULT_CHART_COLOURS = [
  "hsl(var(--primary))",
  "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6",
]

type ChartDatum = Record<string, string | number>

export function LineChart({
  data,
  dataKey,
  xKey = "name",
  height = 160,
  colour = "hsl(var(--primary))",
  valueFormatter,
}: {
  data: ChartDatum[]
  dataKey: string
  xKey?: string
  height?: number
  colour?: string
  valueFormatter?: (value: number) => string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(v) => [typeof v === "number" && valueFormatter ? valueFormatter(v) : v, dataKey]}
          contentStyle={{ fontSize: "11px" }}
          cursor={{ stroke: "hsl(var(--muted))" }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={colour} strokeWidth={2} dot={false} />
      </RLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart({
  data,
  dataKey,
  xKey = "name",
  height = 160,
  colour = "hsl(var(--primary))",
  valueFormatter,
}: {
  data: ChartDatum[]
  dataKey: string
  xKey?: string
  height?: number
  colour?: string
  valueFormatter?: (value: number) => string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} barSize={6} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(v) => [typeof v === "number" && valueFormatter ? valueFormatter(v) : v, dataKey]}
          contentStyle={{ fontSize: "11px" }}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Bar dataKey={dataKey} fill={colour} radius={[3, 3, 0, 0]} />
      </RBarChart>
    </ResponsiveContainer>
  )
}

export function PieChart({
  data,
  height = 200,
  colours = DEFAULT_CHART_COLOURS,
}: {
  data: { name: string; value: number; colour?: string }[]
  height?: number
  colours?: string[]
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RPieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.colour ?? colours[i % colours.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: "11px" }} />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
      </RPieChart>
    </ResponsiveContainer>
  )
}
