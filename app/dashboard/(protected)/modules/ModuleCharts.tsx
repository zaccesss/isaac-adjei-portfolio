"use client"

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
  PieChart, Pie, Legend,
} from "recharts"

type AssessmentPoint = {
  name: string
  mark: number | null
  weighted: number | null
}

// Semantic colours for degree classification bands - green=First, blue=2:1, amber=2:2, red=Fail
function markColour(mark: number | null): string {
  if (mark == null) return "#94a3b8"
  if (mark >= 80) return "#22c55e"
  if (mark >= 60) return "#3b82f6"
  if (mark >= 40) return "#f59e0b"
  return "#ef4444"
}

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  background: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))",
}

export function AssessmentBarChart({ data, tall }: { data: AssessmentPoint[]; tall?: boolean }) {
  const points = data.filter((d) => d.mark != null)
  if (!points.length) return null

  return (
    <div className={`${tall ? "h-72" : "h-56"} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
          <Tooltip
            formatter={(v) => [`${v}%`, "Mark"]}
            contentStyle={TOOLTIP_STYLE}
          />
          <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
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
            contentStyle={TOOLTIP_STYLE}
          />
          <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Line
            type="monotone"
            dataKey="mark"
            stroke="#94a3b8"
            strokeWidth={1.5}
            dot={(props) => {
              const { cx, cy, payload } = props
              return <circle key={props.key} cx={cx} cy={cy} r={5} fill={markColour(payload.mark)} stroke="#fff" strokeWidth={1.5} />
            }}
            activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

type GradeSlice = { name: string; value: number; colour: string }

export function ModuleGradePieChart({ marks }: { marks: (number | null)[] }) {
  const buckets: GradeSlice[] = [
    { name: "First >=80%", value: 0, colour: "#22c55e" },
    { name: "2:1 60-79%", value: 0, colour: "#3b82f6" },
    { name: "2:2 40-59%", value: 0, colour: "#f59e0b" },
    { name: "Fail <40%",  value: 0, colour: "#ef4444" },
  ]
  for (const m of marks) {
    if (m == null) continue
    if (m >= 80) buckets[0].value++
    else if (m >= 60) buckets[1].value++
    else if (m >= 40) buckets[2].value++
    else buckets[3].value++
  }
  const slices = buckets.filter((b) => b.value > 0)
  if (slices.length === 0) return null

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={90}
            paddingAngle={3}
            label={({ value }) => String(value)}
            labelLine={false}
          >
            {slices.map((entry, i) => (
              <Cell key={i} fill={entry.colour} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [v, name]}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
