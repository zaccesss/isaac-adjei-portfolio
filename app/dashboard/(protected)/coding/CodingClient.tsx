"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Code2 } from "lucide-react"
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import {
  StatCard,
  BarChart,
  DEFAULT_CHART_COLOURS,
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  periodStartDate,
  type AnalyticsPeriod,
} from "@/components/analytics"
import type { WakatimeDayRow, GitHubDay, GitHubContribTotals } from "@/app/dashboard/actions"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}`)

// AI assistant tools/IDEs whose time counts in totals but must never surface as a named
// editor in the chart - all such time is attributed to the developer, not the AI tool.
const AI_EDITORS = new Set([
  "Claude Code",                            // Anthropic
  "Codex", "OpenAI",                        // OpenAI
  "Cursor",                                 // Anysphere
  "GitHub Copilot", "Copilot",              // GitHub
  "Codeium", "Windsurf",                    // Codeium / Windsurf IDE
  "Tabnine",                                // Tabnine
  "Amazon Q", "Amazon Q Developer",         // Amazon
  "Gemini", "Gemini Code Assist",           // Google
  "Cody",                                   // Sourcegraph
  "Continue",                               // Continue.dev
  "Supermaven",                             // Supermaven
  "Aider",                                  // Aider CLI
  "Cline", "Roo Code", "Roo-Code",          // Cline / Roo Code (VS Code extensions)
  "JetBrains AI", "JetBrains AI Assistant", // JetBrains
  "Avante",                                 // Avante (Neovim)
  "Replit AI", "Ghostwriter",               // Replit
])

const PERIOD_STAT_LABEL: Record<AnalyticsPeriod, string> = {
  "24h": "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "1y": "This year",
  all: "All time",
}

// How many days to show in the daily bar chart per period
const PERIOD_CHART_DAYS: Record<AnalyticsPeriod, number> = {
  "24h": 7,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 30,
  all: 30,
}

// How many weeks to show in the weekly bar charts per period, so they follow the selector too
const PERIOD_CHART_WEEKS: Record<AnalyticsPeriod, number> = {
  "24h": 4,
  "7d": 4,
  "30d": 6,
  "90d": 13,
  "1y": 52,
  all: 52,
}

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
type GHCell  = { date: string; count: number;   level: 0 | 1 | 2 | 3 | 4 }

function ghIntensity(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count < 3)  return 1
  if (count < 6)  return 2
  if (count < 10) return 3
  return 4
}

// Relative intensity for the hour×day heatmap (scaled to matrix max)
function relativeIntensity(seconds: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (seconds === 0 || max === 0) return 0
  const r = seconds / max
  if (r < 0.15) return 1
  if (r < 0.35) return 2
  if (r < 0.65) return 3
  return 4
}

const GH_INTENSITY_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-muted",
  1: "bg-blue-200 dark:bg-blue-900",
  2: "bg-blue-400 dark:bg-blue-700",
  3: "bg-blue-500 dark:bg-blue-500",
  4: "bg-blue-700 dark:bg-blue-300",
}

function buildGHGrid(days: GitHubDay[]): GHCell[][] {
  const byDate = new Map(days.map((d) => [d.date, d.count]))
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7) + 7 - 52 * 7)
  start.setHours(0, 0, 0, 0)
  const weeks: GHCell[][] = []
  const cursor = new Date(start)
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

function buildGrid(rows: WakatimeDayRow[]): GridCell[][] {
  const byDate = new Map(rows.map((r) => [r.date, r.total_seconds]))
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7) + 7 - 52 * 7)
  start.setHours(0, 0, 0, 0)
  const weeks: GridCell[][] = []
  const cursor = new Date(start)
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

// A single breakdown section (Languages, Editors, Operating systems, Projects). Presents the
// same period-filtered data as two complementary charts side by side: the donut with its labelled
// legend (share of time, hours and percentage) plus a bar chart of the top entries. Optional
// children render above the charts (used to keep the Languages progress-bar list). Everything is
// driven by the `data`/`total` passed in, which the caller derives from the period-filtered maps.
function BreakdownSection({
  title,
  data,
  total,
  emptyMessage = "No data yet.",
  children,
}: {
  title: string
  data: { name: string; value: number }[]
  total: number
  emptyMessage?: string
  children?: ReactNode
}) {
  if (data.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4 bg-card">
        <h2 className="text-sm font-semibold mb-2">{title}</h2>
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }
  // The shared bar chart names its series after the data key, so use a readable key
  const barData = data.map((d) => ({ name: d.name, time: d.value }))
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Donut with a labelled legend (share of time) */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Share of time</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" nameKey="name" paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={DEFAULT_CHART_COLOURS[i % DEFAULT_CHART_COLOURS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [typeof v === "number" ? formatHours(v) : v, ""]} contentStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1 mt-1">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: DEFAULT_CHART_COLOURS[i % DEFAULT_CHART_COLOURS.length] }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                  <span>{formatHours(item.value)}</span>
                  <span className="text-muted-foreground">{total > 0 ? `${Math.round((item.value / total) * 100)}%` : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bar chart of the top entries */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Top {data.length} by time</p>
          <BarChart data={barData} dataKey="time" xKey="name" height={200} valueFormatter={formatHours} legend name="Hours" />
        </div>
      </div>
    </div>
  )
}

function CodingInner({
  rows,
  ghDays = [],
  ghTotals,
}: {
  rows: WakatimeDayRow[]
  ghDays?: GitHubDay[]
  ghTotals?: GitHubContribTotals
}) {
  const [tooltip, setTooltip]     = useState<{ date: string; seconds: number } | null>(null)
  const [ghTooltip, setGhTooltip] = useState<{ date: string; count: number } | null>(null)
  const [hdTooltip, setHdTooltip] = useState<{ day: string; hour: number; seconds: number } | null>(null)
  const { period } = useAnalyticsPeriod()

  // Full-year grids for the 52-week heatmaps (calendar views, always unfiltered)
  const grid   = useMemo(() => buildGrid(rows), [rows])
  const ghGrid = useMemo(() => buildGHGrid(ghDays), [ghDays])

  // Period-filtered rows: stats, aggregate charts, and hour×day matrix
  const periodRows = useMemo(() => {
    const start = periodStartDate(period)
    if (!start) return rows
    const startDate = start.toISOString().slice(0, 10)
    return rows.filter((r) => r.date >= startDate)
  }, [rows, period])

  const periodGhDays = useMemo(() => {
    const start = periodStartDate(period)
    if (!start) return ghDays
    const startDate = start.toISOString().slice(0, 10)
    return ghDays.filter((d) => d.date >= startDate)
  }, [ghDays, period])

  // --- Stat cards (period-aware) ---
  const totalSeconds      = periodRows.reduce((acc, r) => acc + r.total_seconds, 0)
  const lastWeek          = grid[grid.length - 1] ?? []
  const totalSecondsWeek  = lastWeek.reduce((acc, c) => acc + c.seconds, 0)
  const activeDays        = periodRows.filter((r) => r.total_seconds > 0).length
  const avgSeconds        = activeDays > 0 ? Math.floor(totalSeconds / activeDays) : 0
  const mostActiveRow     = periodRows.reduce<WakatimeDayRow | null>(
    (best, r) => (!best || r.total_seconds > best.total_seconds ? r : best), null
  )
  const mostActiveLabel   = mostActiveRow?.total_seconds
    ? new Date(mostActiveRow.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    : "-"

  // --- Aggregate maps (period-aware) ---
  const langMap    = new Map<string, number>()
  const projMap    = new Map<string, number>()
  const editMap    = new Map<string, number>()
  const osMap      = new Map<string, number>()
  const weekdayMap = [0, 0, 0, 0, 0, 0, 0]

  for (const row of periodRows) {
    for (const l of row.languages ?? []) langMap.set(l.name, (langMap.get(l.name) ?? 0) + l.total_seconds)
    for (const p of row.projects ?? [])  projMap.set(p.name, (projMap.get(p.name) ?? 0) + p.total_seconds)
    for (const e of row.editors ?? []) {
      const key = AI_EDITORS.has(e.name) ? "Other" : e.name
      editMap.set(key, (editMap.get(key) ?? 0) + e.total_seconds)
    }
    for (const o of row.operating_systems ?? []) osMap.set(o.name, (osMap.get(o.name) ?? 0) + o.total_seconds)
    if (row.total_seconds > 0) {
      const dow = new Date(row.date + "T00:00:00").getDay()
      const idx = dow === 0 ? 6 : dow - 1
      weekdayMap[idx] += row.total_seconds
    }
  }

  const topLangs = [...langMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topProjs = [...projMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topEdits = [...editMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topOs    = [...osMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const totalLangSeconds = topLangs.reduce((acc, [, s]) => acc + s, 0)
  const totalEditSeconds = topEdits.reduce((acc, [, s]) => acc + s, 0)
  const totalOsSeconds   = topOs.reduce((acc, [, s]) => acc + s, 0)
  const totalProjSeconds = topProjs.reduce((acc, [, s]) => acc + s, 0)
  const langPieData = topLangs.map(([name, value]) => ({ name, value }))
  const projPieData = topProjs.map(([name, value]) => ({ name, value }))
  const editPieData = topEdits.map(([name, value]) => ({ name, value }))
  const osPieData   = topOs.map(([name, value]) => ({ name, value }))
  const weekdayData = WEEKDAY_LABELS.map((day, i) => ({ day, seconds: weekdayMap[i] }))

  // weekdayData is Mon-Sun (index 0-4 = weekdays, 5-6 = weekends)
  const weekVsWeekendPie = [
    { name: "Weekdays", value: weekdayData.slice(0, 5).reduce((a, d) => a + d.seconds, 0) },
    { name: "Weekends", value: weekdayData.slice(5).reduce((a, d) => a + d.seconds, 0) },
  ]

  // --- Hour × Day-of-week matrix (7 rows × 24 cols) from rows.hours ---
  const weekdayHourMatrix = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0))
    for (const row of periodRows) {
      if (!row.hours || row.hours.length !== 24) continue
      const dow = new Date(row.date + "T00:00:00").getDay()
      const idx = dow === 0 ? 6 : dow - 1
      for (let h = 0; h < 24; h++) matrix[idx][h] += row.hours[h]
    }
    return matrix
  }, [periodRows])

  const weekdayHourMax = useMemo(() => {
    let max = 0
    for (const row of weekdayHourMatrix) for (const v of row) if (v > max) max = v
    return max
  }, [weekdayHourMatrix])

  const hasHourData = weekdayHourMax > 0

  // --- Daily chart (period-aware number of days) ---
  const numDays = PERIOD_CHART_DAYS[period]

  const dailyCodings = useMemo(() => {
    const byDate = new Map(rows.map((r) => [r.date, r.total_seconds]))
    const today = new Date()
    return Array.from({ length: numDays }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (numDays - 1 - i))
      const iso = d.toISOString().slice(0, 10)
      return { name: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), seconds: byDate.get(iso) ?? 0 }
    })
  }, [rows, numDays])

  const dailyGH = useMemo(() => {
    if (!ghDays.length) return []
    const byDate = new Map(ghDays.map((d) => [d.date, d.count]))
    const today = new Date()
    return Array.from({ length: numDays }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (numDays - 1 - i))
      const iso = d.toISOString().slice(0, 10)
      return { name: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), count: byDate.get(iso) ?? 0 }
    })
  }, [ghDays, numDays])

  // --- Weekly charts (number of weeks follows the selected period) ---
  const numWeeks = PERIOD_CHART_WEEKS[period]
  const weeklyCodings = useMemo(() => {
    const byDate = new Map(rows.map((r) => [r.date, r.total_seconds]))
    const today = new Date()
    return Array.from({ length: numWeeks }, (_, w) => {
      const end = new Date(today)
      end.setDate(today.getDate() - (numWeeks - 1 - w) * 7)
      let total = 0
      for (let d = 6; d >= 0; d--) {
        const day = new Date(end)
        day.setDate(end.getDate() - d)
        total += byDate.get(day.toISOString().slice(0, 10)) ?? 0
      }
      return { name: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), seconds: total }
    })
  }, [rows, numWeeks])

  const weeklyGH = useMemo(() => {
    if (!ghDays.length) return []
    const byDate = new Map(ghDays.map((d) => [d.date, d.count]))
    const today = new Date()
    return Array.from({ length: numWeeks }, (_, w) => {
      const end = new Date(today)
      end.setDate(today.getDate() - (numWeeks - 1 - w) * 7)
      let total = 0
      for (let d = 6; d >= 0; d--) {
        const day = new Date(end)
        day.setDate(end.getDate() - d)
        total += byDate.get(day.toISOString().slice(0, 10)) ?? 0
      }
      return { name: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), count: total }
    })
  }, [ghDays, numWeeks])

  // --- GitHub breakdown uses server-fetched totals (full-year aggregate) ---
  const ghBreakdownData = ghTotals && (ghTotals.commits + ghTotals.pullRequests + ghTotals.reviews + ghTotals.issues) > 0
    ? [
        { name: "Commits",       value: ghTotals.commits },
        { name: "Pull Requests", value: ghTotals.pullRequests },
        { name: "Reviews",       value: ghTotals.reviews },
        { name: "Issues",        value: ghTotals.issues },
      ].filter((d) => d.value > 0)
    : []
  const ghBreakdownTotal = ghBreakdownData.reduce((a, d) => a + d.value, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Code2 className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold leading-tight">Coding Activity</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily coding time from WakaTime across all devices and editors.
            </p>
          </div>
        </div>
        <PeriodSelector />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label={PERIOD_STAT_LABEL[period]} value={formatHours(totalSeconds)} />
        <StatCard label="This week"    value={formatHours(totalSecondsWeek)} />
        <StatCard label="Active days"  value={activeDays} />
        <StatCard label="Daily average" value={formatHours(avgSeconds)} />
        <StatCard label="Most active day" value={mostActiveLabel} accentClassName="sm:col-span-1 col-span-2" />
      </div>

      {/* WakaTime 52-week contribution heatmap */}
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
              <div key={d} className={`h-3 text-[9px] text-muted-foreground leading-3 ${i % 2 === 0 ? "opacity-0" : ""}`}>{d}</div>
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

      {/* Hour × Day-of-week heatmap (7 rows × 24 cols, from /durations data) */}
      <div className="border border-border rounded-lg p-4 bg-card overflow-x-auto">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">When I code</h2>
          <span className="text-xs text-muted-foreground">- hour of day (UTC) × day of week</span>
        </div>
        {hasHourData ? (
          <>
            <div className="flex gap-1 mb-1">
              <div className="w-6 shrink-0" />
              {HOURS.map((h) => (
                <div key={h} className={`w-3 shrink-0 text-[8px] text-muted-foreground text-center ${parseInt(h) % 3 !== 0 ? "opacity-0" : ""}`}>
                  {h}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {DAYS.map((day, di) => (
                <div key={day} className="flex gap-1 items-center">
                  <div className="w-6 shrink-0 text-[9px] text-muted-foreground">{day}</div>
                  {weekdayHourMatrix[di].map((secs, hi) => {
                    const lvl = relativeIntensity(secs, weekdayHourMax)
                    return (
                      <div
                        key={hi}
                        className={`h-3 w-3 rounded-sm cursor-default transition-opacity hover:opacity-80 ${INTENSITY_CLASS[lvl]}`}
                        onMouseEnter={() => setHdTooltip({ day, hour: hi, seconds: secs })}
                        onMouseLeave={() => setHdTooltip(null)}
                        title={`${day} ${hi}:00 — ${secs > 0 ? formatHours(secs) : "no data"}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            {hdTooltip && (
              <div className="mt-2 text-xs text-muted-foreground">
                {hdTooltip.day} {hdTooltip.hour}:00 — {hdTooltip.seconds > 0 ? formatHours(hdTooltip.seconds) : "no data"}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-xs text-muted-foreground">Less</span>
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <div key={lvl} className={`h-3 w-3 rounded-sm ${INTENSITY_CLASS[lvl]}`} />
              ))}
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Hourly data will appear after the next WakaTime sync.
          </p>
        )}
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
                <div key={d} className={`h-3 text-[9px] text-muted-foreground leading-3 ${i % 2 === 0 ? "opacity-0" : ""}`}>{d}</div>
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

      {/* Daily coding + GitHub bar charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <h2 className="text-sm font-semibold mb-3">Coding: daily (last {numDays} days)</h2>
          <ResponsiveContainer width="100%" height={120}>
            <RBarChart data={dailyCodings} barSize={6} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} interval={Math.max(1, Math.floor(numDays / 7) - 1)} />
              <YAxis hide />
              <Tooltip formatter={(v) => [typeof v === "number" ? formatHours(v) : v, "Time"]} contentStyle={{ fontSize: "11px" }} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="seconds" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </div>
        {dailyGH.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-3">GitHub: daily (last {numDays} days)</h2>
            <ResponsiveContainer width="100%" height={120}>
              <RBarChart data={dailyGH} barSize={6} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} interval={Math.max(1, Math.floor(numDays / 7) - 1)} />
                <YAxis hide />
                <Tooltip formatter={(v) => [v, "Contributions"]} contentStyle={{ fontSize: "11px" }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </RBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Weekly bar charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <h2 className="text-sm font-semibold mb-3">Coding: weekly totals</h2>
          <ResponsiveContainer width="100%" height={140}>
            <RBarChart data={weeklyCodings} barSize={12} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis hide />
              <Tooltip formatter={(v) => [typeof v === "number" ? formatHours(v) : v, "Time"]} contentStyle={{ fontSize: "11px" }} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="seconds" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </div>
        {weeklyGH.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-3">GitHub: weekly contributions</h2>
            <ResponsiveContainer width="100%" height={140}>
              <RBarChart data={weeklyGH} barSize={12} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis hide />
                <Tooltip formatter={(v) => [v, "Contributions"]} contentStyle={{ fontSize: "11px" }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </RBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* GitHub contribution breakdown */}
      {ghBreakdownData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-2">GitHub breakdown: pie (this year)</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="shrink-0 w-36">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={ghBreakdownData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={2}>
                      {ghBreakdownData.map((_, i) => (
                        <Cell key={i} fill={DEFAULT_CHART_COLOURS[i % DEFAULT_CHART_COLOURS.length]} />
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
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: DEFAULT_CHART_COLOURS[i % DEFAULT_CHART_COLOURS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                      <span>{item.value}</span>
                      <span className="text-muted-foreground">{ghBreakdownTotal > 0 ? `${Math.round((item.value / ghBreakdownTotal) * 100)}%` : ""}</span>
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
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-3">GitHub breakdown: bar (this year)</h2>
            <ResponsiveContainer width="100%" height={150}>
              <RBarChart data={ghBreakdownData} barSize={24} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
                <YAxis hide />
                <Tooltip formatter={(v) => [v, "Count"]} contentStyle={{ fontSize: "11px" }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ghBreakdownData.map((_, i) => (
                    <Cell key={i} fill={DEFAULT_CHART_COLOURS[i % DEFAULT_CHART_COLOURS.length]} />
                  ))}
                </Bar>
              </RBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Languages breakdown: progress-bar list, donut and bar chart */}
      <BreakdownSection title="Languages" data={langPieData} total={totalLangSeconds}>
        <div className="flex flex-col gap-2 mb-4">
          {topLangs.map(([name, secs], i) => (
            <div key={name} className="flex items-center gap-2">
              <span className="text-xs w-24 truncate text-muted-foreground">{name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((secs / (totalLangSeconds || 1)) * 100)}%`,
                    background: DEFAULT_CHART_COLOURS[i % DEFAULT_CHART_COLOURS.length],
                  }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground w-14 text-right">{formatHours(secs)}</span>
            </div>
          ))}
        </div>
      </BreakdownSection>

      {/* Editors breakdown: donut and bar chart */}
      <BreakdownSection title="Editors" data={editPieData} total={totalEditSeconds} />

      {/* Operating systems breakdown: donut and bar chart */}
      <BreakdownSection
        title="Operating Systems"
        data={osPieData}
        total={totalOsSeconds}
        emptyMessage="Data will appear after the next WakaTime sync."
      />

      {/* Projects breakdown: donut and bar chart */}
      <BreakdownSection title="Projects" data={projPieData} total={totalProjSeconds} />

      {/* Weekdays: bar chart + weekday vs weekend pie */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h2 className="text-sm font-semibold mb-3">Weekdays</h2>
        {activeDays === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={140}>
              <RBarChart data={weekdayData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis hide />
                <Tooltip formatter={(v) => [typeof v === "number" ? formatHours(v) : v, "Time"]} contentStyle={{ fontSize: "11px" }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="seconds" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </RBarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={weekVsWeekendPie}
                  dataKey="value"
                  nameKey="name"
                  cx="40%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                >
                  {weekVsWeekendPie.map((_, i) => (
                    <Cell key={i} fill={DEFAULT_CHART_COLOURS[i % DEFAULT_CHART_COLOURS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [typeof v === "number" ? formatHours(v) : v, ""]} contentStyle={{ fontSize: "11px" }} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
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
  return (
    <AnalyticsPeriodProvider defaultPeriod="1y">
      <CodingInner rows={rows} ghDays={ghDays} ghTotals={ghTotals} />
    </AnalyticsPeriodProvider>
  )
}
