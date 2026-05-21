"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
          <Tooltip
            formatter={(v) => [`${v}%`, "Mark"]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
              {/* I draw grade threshold lines so I can see at a glance whether a bar hits First or 2:1 */}
          <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Bar dataKey="mark" radius={[3, 3, 0, 0]} fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProgressLineChart({ data }: { data: AssessmentPoint[] }) {
  // I map to a sequential index rather than using the name on the x-axis so the trend reads left-to-right over time
  const points = data.filter((d) => d.mark != null).map((d, i) => ({ ...d, index: i + 1 }))
  // I require at least two points because a single point cannot show a trend
  if (points.length < 2) return null

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="index" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
          <Tooltip
            formatter={(v) => [`${v}%`, "Mark"]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Line type="monotone" dataKey="mark" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
