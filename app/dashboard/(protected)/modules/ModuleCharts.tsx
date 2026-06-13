"use client"

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from "recharts"

type AssessmentPoint = {
  name: string
  mark: number | null
  weighted: number | null
}

function markColour(mark: number | null): string {
  if (mark == null) return "#94a3b8"
  if (mark >= 80) return "#22c55e"
  if (mark >= 60) return "#f59e0b"
  return "#ef4444"
}

export function AssessmentBarChart({ data }: { data: AssessmentPoint[] }) {
  const points = data.filter((d) => d.mark != null)
  if (!points.length) return null

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
          <Tooltip
            formatter={(v) => [`${v}%`, "Mark"]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Bar dataKey="mark" radius={[4, 4, 0, 0]}>
            {points.map((entry, i) => (
              <Cell key={i} fill={markColour(entry.mark)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProgressLineChart({ data }: { data: AssessmentPoint[] }) {
  const points = data.filter((d) => d.mark != null).map((d) => ({
    ...d,
    shortName: d.name.length > 12 ? d.name.slice(0, 11) + "…" : d.name,
  }))
  if (points.length < 2) return null

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis
            dataKey="shortName"
            tick={{ fontSize: 9 }}
            tickLine={false}
            angle={-40}
            textAnchor="end"
            interval={Math.max(0, Math.floor(points.length / 12) - 1)}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
          <Tooltip
            formatter={(v) => [`${v}%`, "Mark"]}
            labelFormatter={(label) => {
              const p = points.find((x) => x.shortName === label)
              return p?.name ?? label
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Line
            type="monotone"
            dataKey="mark"
            stroke="#6366f1"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props
              return <circle key={props.key} cx={cx} cy={cy} r={4} fill={markColour(payload.mark)} stroke="none" />
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
