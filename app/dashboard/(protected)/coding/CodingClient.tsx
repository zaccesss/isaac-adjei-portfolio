"use client"
// I render WakaTime and GitHub contribution data as heatmaps, bar charts and donut
// charts. All aggregation (language totals, weekday buckets, weekly rollups) happens
// in this client component so the server only has to pass raw per-day rows.

import { useMemo, useState } from "react"
import { Code2 } from "lucide-react"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import type { WakatimeDayRow, GitHubDay, GitHubContribTotals } from "@/app/dashboard/actions"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// AI assistant tools that should never appear in the editors chart
const AI_EDITORS = new Set([
  "Claude Code", "Codex", "OpenAI", "Cursor", "GitHub Copilot", "Codeium",
  "Tabnine", "Amazon Q", "Gemini", "Cody", "Continue",
])

const CHART_COLORS = [
  "hsl(var(--primary))",
  "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6",
]

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function intensity(seconds: number): 0 | 1 | 2 | 3 | 4 {
  if (seconds === 0) return 0
  if (seconds < 1800) return 1
  if (seconds < 7200) return 2
  if (seconds < 14400) return 3
  return 4
}

const INTENSITY_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-muted",
  1: "bg-green-200 dark:bg-green-900",
  2: "bg-green-400 dark:bg-green-700",
  3: "bg-green-600 dark:bg-green-500",
  4: "bg-green-800 dark:bg-green-300",
}

type GridCell = { date: string; seconds: number; level: 0 | 1 | 2 | 3 | 4 }
type GHCell = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }

function ghIntensity(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count < 3) return 1
  if (count < 6) return 2
  if (count < 10) return 3
  return 4
}

function buildGHGrid(days: GitHubDay[]): GHCell[][] {
  const byDate = new Map(days.map((d) => [d.date, d.count]))
  const today = new Date()
  const startOfLastWeek = new Date(today)
  startOfLastWeek.setDate(today.getDate() - today.getDay() + 7 - 52 * 7)
  startOfLastWeek.setHours(0, 0, 0, 0)
  const weeks: GHCell[][] = []
  const cursor = new Date(startOfLastWeek)
  for (let w = 0; w < 52; w++) {
    const week: GHCell[] = []
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10)
      const count = byDate.get(iso) ?? 0
      week.push({ date: iso, count, level: ghIntensity(count) })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

const GH_INTENSITY_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-muted",
  1: "bg-blue-200 dark:bg-blue-900",
  2: "bg-blue-400 dark:bg-blue-700",
  3: "bg-blue-500 dark:bg-blue-500",
  4: "bg-blue-700 dark:bg-blue-300",
}

function buildGrid(rows: WakatimeDayRow[]): GridCell[][] {
  const byDate = new Map(rows.map((r) => [r.date, r.total_seconds]))
  const today = new Date()
  const startOfLastWeek = new Date(today)
  startOfLastWeek.setDate(today.getDate() - today.getDay() + 7 - 52 * 7)
  startOfLastWeek.setHours(0, 0, 0, 0)

  const weeks: GridCell[][] = []
  const cursor = new Date(startOfLastWeek)
  for (let w = 0; w < 52; w++) {
    const week: GridCell[] = []
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10)
      const seconds = byDate.get(iso) ?? 0
      week.push({ date: iso, seconds, level: intensity(seconds) })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function monthLabel(week: GridCell[]): string | null {
  const firstDay = new Date(week[0].date)
  if (firstDay.getDate() <= 7) return MONTHS[firstDay.getMonth()]
  return null
}

function DonutPanel({
  title,
  data,
  total,
}: {
  title: string
  data: { name: string; value: number }[]
  total: number
}) {
  if (data.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4 bg-card">
        <h2 className="text-sm font-semibold mb-2">{title}</h2>
        <p className="text-xs text-muted-foreground">No data yet.</p>
      </div>
    )
  }
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [typeof v === "number" ? formatHours(v) : v, ""]}
            contentStyle={{ fontSize: "11px" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1 mt-1">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
              <span>{formatHours(item.value)}</span>
              <span className="text-muted-foreground">
                {total > 0 ? `${Math.round((item.value / total) * 100)}%` : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CodingClient({
  rows,
  ghDays = [],
  ghTotals,
}: {
  rows: WakatimeDayRow[]
  ghDays?: GitHubDay[]
  ghTotals?: GitHubContribTotals
}) {
  const [tooltip, setTooltip] = useState<{ date: string; seconds: number } | null>(null)
  const [ghTooltip, setGhTooltip] = useState<{ date: string; count: number } | null>(null)
  const grid = useMemo(() => buildGrid(rows), [rows])
  const ghGrid = useMemo(() => buildGHGrid(ghDays), [ghDays])

  const totalSecondsYear = rows.reduce((acc, r) => acc + r.total_seconds, 0)
  const lastWeek = grid[grid.length - 1] ?? []
  const totalSecondsWeek = lastWeek.reduce((acc, c) => acc + c.seconds, 0)
  const activeDays = rows.filter((r) => r.total_seconds > 0).length
  const avgSeconds = activeDays > 0 ? Math.floor(totalSecondsYear / activeDays) : 0

  const mostActiveRow = rows.reduce<WakatimeDayRow | null>(
    (best, r) => (!best || r.total_seconds > best.total_seconds ? r : best),
    null
  )
  const mostActiveLabel = mostActiveRow && mostActiveRow.total_seconds > 0
    ? new Date(mostActiveRow.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    : "-"

  const langMap = new Map<string, number>()
  const projMap = new Map<string, number>()
  const editMap = new Map<string, number>()
  const osMap = new Map<string, number>()
  const weekdayMap = [0, 0, 0, 0, 0, 0, 0]

  for (const row of rows) {
    for (const l of row.languages ?? []) langMap.set(l.name, (langMap.get(l.name) ?? 0) + l.total_seconds)
    for (const p of row.projects ?? []) projMap.set(p.name, (projMap.get(p.name) ?? 0) + p.total_seconds)
    for (const e of row.editors ?? []) {
      if (AI_EDITORS.has(e.name)) continue
      editMap.set(e.name, (editMap.get(e.name) ?? 0) + e.total_seconds)
    }
    for (const o of row.operating_systems ?? []) osMap.set(o.name, (osMap.get(o.name) ?? 0) + o.total_seconds)
    if (row.total_seconds > 0) {
      // JS getDay: 0=Sun, map to Mon-Sun index
      const dow = new Date(row.date + "T00:00:00").getDay()
      const idx = dow === 0 ? 6 : dow - 1
      weekdayMap[idx] += row.total_seconds
    }
  }

  const topLangs = [...langMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topProjs = [...projMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topEdits = [...editMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topOs = [...osMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const totalLangSeconds = topLangs.reduce((acc, [, s]) => acc + s, 0)
  const totalEditSeconds = topEdits.reduce((acc, [, s]) => acc + s, 0)
  const totalOsSeconds = topOs.reduce((acc, [, s]) => acc + s, 0)

  const langPieData = topLangs.map(([name, value]) => ({ name, value }))
  const projPieData = topProjs.map(([name, value]) => ({ name, value }))
  const editPieData = topEdits.map(([name, value]) => ({ name, value }))
  const osPieData = topOs.map(([name, value]) => ({ name, value }))
  const totalProjSeconds = topProjs.reduce((acc, [, s]) => acc + s, 0)
  const weekdayData = WEEKDAY_LABELS.map((day, i) => ({ day, seconds: weekdayMap[i] }))

  // Daily coding totals: last 30 days
  const dailyCodings = useMemo(() => {
    const byDate = new Map(rows.map((r) => [r.date, r.total_seconds]))
    const today = new Date()
    const result: { label: string; seconds: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      result.push({
        label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        seconds: byDate.get(iso) ?? 0,
      })
    }
    return result
  }, [rows])

  // Daily GitHub contributions: last 30 days
  const dailyGH = useMemo(() => {
    if (!ghDays.length) return []
    const byDate = new Map(ghDays.map((d) => [d.date, d.count]))
    const today = new Date()
    const result: { label: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      result.push({
        label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        count: byDate.get(iso) ?? 0,
      })
    }
    return result
  }, [ghDays])

  // Weekly coding totals: last 13 weeks
  const weeklyCodings = useMemo(() => {
    const byDate = new Map(rows.map((r) => [r.date, r.total_seconds]))
    const today = new Date()
    const result: { label: string; seconds: number }[] = []
    for (let w = 12; w >= 0; w--) {
      const end = new Date(today)
      end.setDate(today.getDate() - w * 7)
      let total = 0
      for (let d = 6; d >= 0; d--) {
        const day = new Date(end)
        day.setDate(end.getDate() - d)
        total += byDate.get(day.toISOString().slice(0, 10)) ?? 0
      }
      result.push({
        label: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        seconds: total,
      })
    }
    return result
  }, [rows])

  // GitHub breakdown pie data
  const ghBreakdownData = ghTotals && (ghTotals.commits + ghTotals.pullRequests + ghTotals.reviews + ghTotals.issues) > 0
    ? [
        { name: "Commits",       value: ghTotals.commits },
        { name: "Pull Requests", value: ghTotals.pullRequests },
        { name: "Reviews",       value: ghTotals.reviews },
        { name: "Issues",        value: ghTotals.issues },
      ].filter((d) => d.value > 0)
    : []
  const ghBreakdownTotal = ghBreakdownData.reduce((a, d) => a + d.value, 0)

  // Weekly GitHub contribution totals: last 13 weeks
  const weeklyGH = useMemo(() => {
    if (!ghDays.length) return []
    const byDate = new Map(ghDays.map((d) => [d.date, d.count]))
    const today = new Date()
    const result: { label: string; count: number }[] = []
    for (let w = 12; w >= 0; w--) {
      const end = new Date(today)
      end.setDate(today.getDate() - w * 7)
      let total = 0
      for (let d = 6; d >= 0; d--) {
        const day = new Date(end)
        day.setDate(end.getDate() - d)
        total += byDate.get(day.toISOString().slice(0, 10)) ?? 0
      }
      result.push({
        label: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        count: total,
      })
    }
    return result
  }, [ghDays])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Code2 className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold leading-tight">Coding Activity</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily coding time from WakaTime across all devices and editors.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">This year</p>
          <p className="text-2xl font-bold mt-1">{formatHours(totalSecondsYear)}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">This week</p>
          <p className="text-2xl font-bold mt-1">{formatHours(totalSecondsWeek)}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Active days</p>
          <p className="text-2xl font-bold mt-1">{activeDays}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Daily average</p>
          <p className="text-2xl font-bold mt-1">{formatHours(avgSeconds)}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card sm:col-span-1 col-span-2">
          <p className="text-xs text-muted-foreground">Most active day</p>
          <p className="text-lg font-bold mt-1 leading-tight">{mostActiveLabel}</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="border border-border rounded-lg p-4 bg-card overflow-x-auto">
        <div className="flex gap-1 mb-1">
          <div className="w-6 shrink-0" />
          {grid.map((week, wi) => (
            <div key={wi} className="w-3 shrink-0 text-[9px] text-muted-foreground text-center">
              {monthLabel(week) ?? ""}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 w-6 shrink-0">
            {DAYS.map((d, i) => (
              <div key={d} className={`h-3 text-[9px] text-muted-foreground leading-3 ${i % 2 === 0 ? "opacity-0" : ""}`}>
                {d}
              </div>
            ))}
          </div>
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className={`h-3 w-3 rounded-sm cursor-default transition-opacity hover:opacity-80 ${INTENSITY_CLASS[cell.level]}`}
                  onMouseEnter={() => setTooltip({ date: cell.date, seconds: cell.seconds })}
                  onMouseLeave={() => setTooltip(null)}
                  title={`${cell.date}: ${cell.seconds > 0 ? formatHours(cell.seconds) : "no data"}`}
                />
              ))}
            </div>
          ))}
        </div>
        {tooltip && (
          <div className="mt-2 text-xs text-muted-foreground">
            {tooltip.date}: {tooltip.seconds > 0 ? formatHours(tooltip.seconds) : "no data"}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs text-muted-foreground">Less</span>
          {([0, 1, 2, 3, 4] as const).map((lvl) => (
            <div key={lvl} className={`h-3 w-3 rounded-sm ${INTENSITY_CLASS[lvl]}`} />
          ))}
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>

      {/* GitHub contributions heatmap */}
      {ghDays.length > 0 && (
        <div className="border border-border rounded-lg p-4 bg-card overflow-x-auto">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold">GitHub Contributions</h2>
            <span className="text-xs text-muted-foreground">- commits, PRs, issues and reviews</span>
          </div>
          <div className="flex gap-1 mb-1">
            <div className="w-6 shrink-0" />
            {ghGrid.map((week, wi) => (
              <div key={wi} className="w-3 shrink-0 text-[9px] text-muted-foreground text-center">
                {monthLabel(week as unknown as GridCell[]) ?? ""}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 w-6 shrink-0">
              {DAYS.map((d, i) => (
                <div key={d} className={`h-3 text-[9px] text-muted-foreground leading-3 ${i % 2 === 0 ? "opacity-0" : ""}`}>
                  {d}
                </div>
              ))}
            </div>
            {ghGrid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell) => (
                  <div
                    key={cell.date}
                    className={`h-3 w-3 rounded-sm cursor-default transition-opacity hover:opacity-80 ${GH_INTENSITY_CLASS[cell.level]}`}
                    onMouseEnter={() => setGhTooltip({ date: cell.date, count: cell.count })}
                    onMouseLeave={() => setGhTooltip(null)}
                    title={`${cell.date}: ${cell.count} contribution${cell.count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
          {ghTooltip && (
            <div className="mt-2 text-xs text-muted-foreground">
              {ghTooltip.date}: {ghTooltip.count} contribution{ghTooltip.count !== 1 ? "s" : ""}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-xs text-muted-foreground">Less</span>
            {([0, 1, 2, 3, 4] as const).map((lvl) => (
              <div key={lvl} className={`h-3 w-3 rounded-sm ${GH_INTENSITY_CLASS[lvl]}`} />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      )}

      {/* Daily coding + GitHub bar charts: last 30 days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <h2 className="text-sm font-semibold mb-3">Coding: daily (last 30 days)</h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={dailyCodings} barSize={6} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [typeof v === "number" ? formatHours(v) : v, "Time"]}
                contentStyle={{ fontSize: "11px" }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="seconds" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {dailyGH.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-3">GitHub: daily (last 30 days)</h2>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={dailyGH} barSize={6} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [v, "Contributions"]}
                  contentStyle={{ fontSize: "11px" }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Weekly coding + GitHub contribution bar charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <h2 className="text-sm font-semibold mb-3">Coding: weekly totals</h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyCodings} barSize={12} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [typeof v === "number" ? formatHours(v) : v, "Time"]}
                contentStyle={{ fontSize: "11px" }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="seconds" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {weeklyGH.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-3">GitHub: weekly contributions</h2>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weeklyGH} barSize={12} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [v, "Contributions"]}
                  contentStyle={{ fontSize: "11px" }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* GitHub contribution breakdown */}
      {ghBreakdownData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pie chart */}
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-2">GitHub breakdown: pie (this year)</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="shrink-0 w-36">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={ghBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {ghBreakdownData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, ""]} contentStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                {ghBreakdownData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                      <span>{item.value}</span>
                      <span className="text-muted-foreground">
                        {ghBreakdownTotal > 0 ? `${Math.round((item.value / ghBreakdownTotal) * 100)}%` : ""}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs gap-2 mt-1 pt-1 border-t border-border">
                  <span className="text-muted-foreground font-medium">Total</span>
                  <span className="tabular-nums font-medium">{ghBreakdownTotal}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Bar chart */}
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-3">GitHub breakdown: bar (this year)</h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={ghBreakdownData} barSize={24} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => [v, "Count"]} contentStyle={{ fontSize: "11px" }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ghBreakdownData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Languages: horizontal bars */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h2 className="text-sm font-semibold mb-3">Languages</h2>
        {topLangs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topLangs.map(([name, secs], i) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-xs w-24 truncate text-muted-foreground">{name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((secs / (totalLangSeconds || 1)) * 100)}%`,
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground w-14 text-right">
                  {formatHours(secs)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donut charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DonutPanel title="Languages" data={langPieData} total={totalLangSeconds} />
        <DonutPanel title="Editors" data={editPieData} total={totalEditSeconds} />
        {osPieData.length > 0 ? (
          <DonutPanel title="Operating Systems" data={osPieData} total={totalOsSeconds} />
        ) : (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-2">Operating Systems</h2>
            <p className="text-xs text-muted-foreground">
              Data will appear after the next WakaTime sync.
            </p>
          </div>
        )}
      </div>

      {/* Projects donut */}
      <DonutPanel title="Projects" data={projPieData} total={totalProjSeconds} />

      {/* Weekdays bar */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h2 className="text-sm font-semibold mb-3">Weekdays</h2>
        {activeDays === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekdayData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [typeof v === "number" ? formatHours(v) : v, "Time"]}
                contentStyle={{ fontSize: "11px" }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="seconds" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
