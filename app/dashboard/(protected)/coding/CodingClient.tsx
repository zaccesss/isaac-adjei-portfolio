"use client"

import { useMemo, useState } from "react"
import { Code2 } from "lucide-react"
import type { WakatimeDayRow } from "@/app/dashboard/actions"

// I build the full 52-week × 7-day grid from a sparse array of rows, so days
// with no data show as empty cells rather than being absent from the grid.

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// I map total daily seconds to one of five intensity levels for the heatmap cells.
function intensity(seconds: number): 0 | 1 | 2 | 3 | 4 {
  if (seconds === 0) return 0
  if (seconds < 1800) return 1    // < 30 min
  if (seconds < 7200) return 2    // 30 min - 2 hr
  if (seconds < 14400) return 3   // 2 - 4 hr
  return 4                        // 4 hr+
}

const INTENSITY_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-muted",
  1: "bg-green-200 dark:bg-green-900",
  2: "bg-green-400 dark:bg-green-700",
  3: "bg-green-600 dark:bg-green-500",
  4: "bg-green-800 dark:bg-green-300",
}

type GridCell = {
  date: string        // YYYY-MM-DD
  seconds: number
  level: 0 | 1 | 2 | 3 | 4
}

// I build a 52-week grid anchored to today so the most recent column is always
// on the right, regardless of when the data starts.
function buildGrid(rows: WakatimeDayRow[]): GridCell[][] {
  const byDate = new Map(rows.map((r) => [r.date, r.total_seconds]))

  const today = new Date()
  // I find the Sunday that starts the week containing today.
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

// I return the month label for a week column, or null if this week doesn't
// start a new month (so labels only appear once per month).
function monthLabel(week: GridCell[]): string | null {
  const firstDay = new Date(week[0].date)
  // I show the label on the week that contains the 1st of the month.
  if (firstDay.getDate() <= 7) return MONTHS[firstDay.getMonth()]
  return null
}

export default function CodingClient({ rows }: { rows: WakatimeDayRow[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; seconds: number } | null>(null)

  const grid = useMemo(() => buildGrid(rows), [rows])

  // I compute summary stats from the raw rows array.
  const totalSecondsYear = rows.reduce((acc, r) => acc + r.total_seconds, 0)

  // I calculate this week's total from the last 7 grid cells.
  const lastWeek = grid[grid.length - 1] ?? []
  const totalSecondsWeek = lastWeek.reduce((acc, c) => acc + c.seconds, 0)

  // I aggregate all language/project rows across the year for the top-lists.
  const langMap = new Map<string, number>()
  const projMap = new Map<string, number>()
  const editMap = new Map<string, number>()
  for (const row of rows) {
    for (const l of row.languages ?? []) langMap.set(l.name, (langMap.get(l.name) ?? 0) + l.total_seconds)
    for (const p of row.projects ?? []) projMap.set(p.name, (projMap.get(p.name) ?? 0) + p.total_seconds)
    for (const e of row.editors ?? []) editMap.set(e.name, (editMap.get(e.name) ?? 0) + e.total_seconds)
  }

  const topLangs = [...langMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topProjs = [...projMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topEdits = [...editMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxLangSeconds = topLangs[0]?.[1] ?? 1

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
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
      <div className="grid grid-cols-3 gap-3">
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
          <p className="text-2xl font-bold mt-1">{rows.filter((r) => r.total_seconds > 0).length}</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="border border-border rounded-lg p-4 bg-card overflow-x-auto">
        <div className="flex gap-1 mb-1">
          {/* I leave a gap column for the day labels */}
          <div className="w-6 shrink-0" />
          {grid.map((week, wi) => (
            <div key={wi} className="w-3 shrink-0 text-[9px] text-muted-foreground text-center">
              {monthLabel(week) ?? ""}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-1 w-6 shrink-0">
            {DAYS.map((d, i) => (
              <div key={d} className={`h-3 text-[9px] text-muted-foreground leading-3 ${i % 2 === 0 ? "opacity-0" : ""}`}>
                {d}
              </div>
            ))}
          </div>
          {/* Grid columns */}
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

        {/* Tooltip */}
        {tooltip && (
          <div className="mt-2 text-xs text-muted-foreground">
            {tooltip.date} - {tooltip.seconds > 0 ? formatHours(tooltip.seconds) : "no data"}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs text-muted-foreground">Less</span>
          {([0, 1, 2, 3, 4] as const).map((lvl) => (
            <div key={lvl} className={`h-3 w-3 rounded-sm ${INTENSITY_CLASS[lvl]}`} />
          ))}
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Top languages */}
        <div className="border border-border rounded-lg p-4 bg-card md:col-span-2">
          <h2 className="text-sm font-semibold mb-3">Languages</h2>
          {topLangs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topLangs.map(([name, secs]) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-xs w-24 truncate text-muted-foreground">{name}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.round((secs / maxLangSeconds) * 100)}%` }}
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

        {/* Top editors + projects stacked */}
        <div className="flex flex-col gap-4">
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-3">Editors</h2>
            {topEdits.length === 0 ? (
              <p className="text-xs text-muted-foreground">No data yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {topEdits.map(([name, secs]) => (
                  <div key={name} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate">{name}</span>
                    <span className="tabular-nums shrink-0 ml-2">{formatHours(secs)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-3">Projects</h2>
            {topProjs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No data yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {topProjs.map(([name, secs]) => (
                  <div key={name} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate">{name}</span>
                    <span className="tabular-nums shrink-0 ml-2">{formatHours(secs)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
