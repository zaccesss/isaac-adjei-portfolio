"use client"

import { useState } from "react"
import { normaliseStatus, statusTextClass, isInPipeline } from "@/lib/application-status"
import { ExternalLink, CalendarDays, CheckCircle2, Circle, Clock } from "lucide-react"

type Application = {
  id: string
  company: string
  role: string
  type: string
  status: string
  url: string | null
  opening_date: string | null
  applied_date: string | null
  deadline: string | null
  last_year_opening: string | null
  archived: boolean
}

type SortKey = "deadline" | "applied" | "opening"

function formatDate(d: string | null): string {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function daysFromNow(d: string | null): number | null {
  if (!d) return null
  const diff = new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / 86_400_000)
}

function DeadlinePill({ date }: { date: string | null }) {
  if (!date) return null
  const days = daysFromNow(date)!
  if (days > 14) return <span className="text-xs text-green-600 dark:text-green-400">{days}d left</span>
  if (days > 0)  return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{days}d left</span>
  if (days === 0) return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Today</span>
  return <span className="text-xs text-muted-foreground">closed {Math.abs(days)}d ago</span>
}

function primaryDate(app: Application, sort: SortKey): string | null {
  if (sort === "deadline") return app.deadline ?? app.applied_date ?? app.opening_date
  if (sort === "applied")  return app.applied_date ?? app.opening_date ?? app.deadline
  return app.opening_date ?? app.applied_date ?? app.deadline
}

function monthLabel(iso: string | null): string {
  if (!iso) return "No date"
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

function TimelineEntry({ app }: { app: Application }) {
  const status = normaliseStatus(app.status)
  const statusCls = statusTextClass(app.status)
  const active = isInPipeline(app.status)

  const milestones: { label: string; date: string | null; done: boolean }[] = [
    { label: "Opened",    date: app.opening_date,    done: !!app.opening_date },
    { label: "Applied",   date: app.applied_date,    done: !!app.applied_date },
    { label: "Deadline",  date: app.deadline,        done: daysFromNow(app.deadline) !== null && daysFromNow(app.deadline)! < 0 },
  ].filter((m) => m.date)

  return (
    <div className="relative pl-6 pb-6 last:pb-0">
      {/* vertical connector */}
      <span className="absolute left-[7px] top-3 bottom-0 w-px bg-border" aria-hidden />
      {/* dot */}
      <span className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
        active ? "border-primary bg-background" : "border-muted-foreground/40 bg-muted"
      }`}>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      </span>

      <div className="flex flex-col gap-1.5 rounded-md border border-border bg-card px-3 py-2.5 shadow-sm hover:border-border/80 transition-colors">
        {/* header */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            {app.url ? (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
              >
                {app.company}
                <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
              </a>
            ) : (
              <span className="font-medium text-sm truncate">{app.company}</span>
            )}
            <span className="text-muted-foreground text-xs shrink-0">— {app.role}</span>
          </div>
          <span className={`text-xs font-medium shrink-0 ${statusCls}`}>{status}</span>
        </div>

        {/* date milestones */}
        {milestones.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
            {milestones.map((m) => (
              <div key={m.label} className="flex items-center gap-1 text-xs">
                {m.done ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                )}
                <span className="text-muted-foreground">{m.label}:</span>
                <span className="font-medium">{formatDate(m.date)}</span>
                {m.label === "Deadline" && <DeadlinePill date={m.date} />}
              </div>
            ))}
          </div>
        )}

        {/* last year opening hint */}
        {app.last_year_opening && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-0.5">
            <Clock className="h-3 w-3 shrink-0" />
            <span>Last year opened: {formatDate(app.last_year_opening)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TimelineView({ apps }: { apps: Application[] }) {
  const [sort, setSort] = useState<SortKey>("deadline")

  const sorted = [...apps].sort((a, b) => {
    const da = primaryDate(a, sort)
    const db = primaryDate(b, sort)
    if (!da && !db) return 0
    if (!da) return 1
    if (!db) return -1
    // For deadline sort: future deadlines first (ascending), then past (descending)
    if (sort === "deadline") {
      const daysA = daysFromNow(a.deadline)
      const daysB = daysFromNow(b.deadline)
      if (daysA !== null && daysB !== null) {
        // Both have deadlines - sort future first ascending, past last descending
        if (daysA >= 0 && daysB >= 0) return daysA - daysB
        if (daysA < 0 && daysB < 0)  return daysB - daysA
        if (daysA >= 0) return -1
        return 1
      }
    }
    return new Date(da).getTime() - new Date(db).getTime()
  })

  // Group by month of primary date
  const groups: { month: string; apps: Application[] }[] = []
  for (const app of sorted) {
    const month = monthLabel(primaryDate(app, sort))
    const existing = groups.find((g) => g.month === month)
    if (existing) existing.apps.push(app)
    else groups.push({ month, apps: [app] })
  }

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <CalendarDays className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-medium">No applications to display</p>
        <p className="text-xs text-muted-foreground mt-1">Add applications to see them on the timeline.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 flex-1 min-h-0">
      {/* sort controls */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        {(["deadline", "applied", "opening"] as SortKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSort(k)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors capitalize ${
              sort === k
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {k === "applied" ? "applied date" : k === "opening" ? "opening date" : "deadline"}
          </button>
        ))}
      </div>

      {/* timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {groups.map(({ month, apps: groupApps }) => (
          <div key={month} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{month}</span>
              <span className="text-xs text-muted-foreground">({groupApps.length})</span>
            </div>
            <div className="ml-1">
              {groupApps.map((app) => (
                <TimelineEntry key={app.id} app={app} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
